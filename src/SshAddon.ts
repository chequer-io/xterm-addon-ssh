import { IDisposable, ITerminalAddon, Terminal } from 'xterm';
import { ITerminalSize, MessageConverter, MessageType } from './protocol';

export type EventName =
  | 'connect'
  | 'close'
  | 'error'
  | 'message'
  | 'key'
  | 'resize';

export interface ResizeEvent {
  cols: number;
  rows: number;
}

export interface SshEventMap {
  connect: Event;
  message: Event;
  key: TerminalKeyEvent;
  error: Event;
  close: Event;
  resize: ResizeEvent;
}

export type SshEventListener<T> = (event: T) => void;

export interface SshOptions {
  serverUuid: string;
  header?: Record<string, string>;
  connectImmediately?: boolean;
  onConnect?: SshEventListener<SshEventMap['connect']>;
  onMessage?: SshEventListener<SshEventMap['message']>;
  onKey?: SshEventListener<SshEventMap['key']>;
  onError?: SshEventListener<SshEventMap['error']>;
  onClose?: SshEventListener<SshEventMap['close']>;
  onResize?: SshEventListener<SshEventMap['resize']>;
}

export interface TerminalKeyEvent {
  key: string;
  domEvent: KeyboardEvent;
}

export class SshAddon implements ITerminalAddon {
  private readonly _serverUuid: string;
  private readonly _connectImmediately: boolean = false;
  private readonly _socket: WebSocket;
  private readonly _disposables: IDisposable[] = [];
  private _terminal: Terminal | undefined;

  private _eventListeners: Map<EventName, SshEventListener<Event>[]> =
    new Map();

  private _keyListeners: SshEventListener<TerminalKeyEvent>[] = [];

  public header: Record<string, string> = {};

  public constructor(socket: WebSocket, options: SshOptions) {
    this._socket = socket;
    this._socket.binaryType = 'arraybuffer';

    this._serverUuid = options.serverUuid;

    if (options.header) {
      this.header = options.header;
    }

    if (options.onConnect) {
      this._eventListeners.set('connect', [options.onConnect]);
    }

    if (options.onMessage) {
      this._eventListeners.set('message', [options.onMessage]);
    }

    if (options.onError) {
      this._eventListeners.set('error', [options.onError]);
    }

    if (options.onClose) {
      this._eventListeners.set('close', [options.onClose]);
    }

    if (options.onKey) {
      this._keyListeners.push(options.onKey);
    }

    if (options.connectImmediately) {
      this._connectImmediately = true;
      this.connect();
    }
  }

  private _sendConnect() {
    if (this._terminal) {
      this._notifyListeners('connect', new Event('connect'));

      this._socket.send(
        MessageConverter.serialize(
          MessageType.CONNECT,
          {
            serverUuid: this._serverUuid,
            size: SshAddon._getSize(this._terminal),
          },
          this.header,
        ),
      );
    }
  }

  public connect() {
    if (this._socket.readyState === WebSocket.OPEN) {
      this._sendConnect();
    } else {
      this._socket.onopen = () => {
        this._sendConnect();
      };
    }
  }

  public activate(terminal: Terminal): void {
    this._terminal = terminal;

    if (!this._connectImmediately) {
      this.connect();
    }

    this._disposables.push(
      terminal.onKey(this._onKey.bind(this)),
      terminal.onResize(this._onResize.bind(this)),
      addSocketListener(this._socket, 'message', this._onMessage.bind(this)),
      addSocketListener(this._socket, 'error', this._onError.bind(this)),
      addSocketListener(this._socket, 'close', this.dispose.bind(this)),
    );
  }

  public dispose(): void {
    this._notifyListeners('close', new Event('close'));
    this.removeAllListeners();

    if (
      this._socket.readyState !== WebSocket.CLOSED ||
      this._socket.readyState !== WebSocket.CLOSING
    ) {
      this._socket.close();
    }

    for (const d of this._disposables) {
      d.dispose();
    }
  }

  private _onError(error: Event) {
    this._notifyListeners('error', error);
    this.dispose();
  }

  private _onKey(event: TerminalKeyEvent) {
    this._notifyListeners('key', event);

    if (this._socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this._socket.send(
      MessageConverter.serialize(MessageType.MESSAGE, event.key, this.header),
    );
  }

  private _onMessage(event: MessageEvent): void {
    this._notifyListeners('message', event);

    const data = MessageConverter.deserialize(event.data);

    switch (data.type) {
      case MessageType.CONNECT:
        break;
      case MessageType.MESSAGE:
        this._terminal?.write(data.body.message);
        break;
      default:
        break;
    }
  }

  private _onResize(event: ResizeEvent) {
    if (!this._terminal) {
      throw new Error('Terminal does not mounted');
    }

    this._notifyListeners('resize', event);

    this._socket.send(
      MessageConverter.serialize(
        MessageType.RESIZE,
        {
          size: SshAddon._getSize(this._terminal),
        },
        this.header,
      ),
    );
  }

  private static _getSize(terminal: Terminal): ITerminalSize {
    if (!terminal.element) {
      throw new Error('Terminal does not mounted.');
    }

    return {
      cols: terminal.cols,
      rows: terminal.rows,
      pixelWidth: terminal.element.clientWidth,
      pixelHeight: terminal.element.clientHeight,
    };
  }

  private _notifyListeners<T extends EventName>(
    event: T,
    data: SshEventMap[T],
  ) {
    if (event === 'key') {
      this._keyListeners.forEach(listener => {
        listener(data as TerminalKeyEvent);
      });
    } else {
      const listeners = this._eventListeners.get(event);

      if (listeners) {
        listeners.forEach(listener => {
          listener(data as Event);
        });
      }
    }
  }

  public addEventListener<T extends keyof SshEventMap>(
    event: T,
    callback: SshEventListener<SshEventMap[T]>,
  ) {
    if (event === 'key') {
      this._keyListeners.push(callback as SshEventListener<TerminalKeyEvent>);
    } else {
      if (this._eventListeners.has(event)) {
        const listeners = this._eventListeners.get(
          event,
        ) as SshEventListener<Event>[];

        this._eventListeners.set(
          event,
          listeners.concat(callback as SshEventListener<Event>),
        );
      } else {
        this._eventListeners.set(event, [callback as SshEventListener<Event>]);
      }
    }
  }

  public removeEventListener<T extends EventName>(
    event: T,
    callback: SshEventListener<SshEventMap[T]>,
  ) {
    if (event === 'key') {
      this._keyListeners = this._keyListeners.filter(
        listener => listener !== callback,
      );
    } else {
      const listeners = this._eventListeners.get(event);

      if (!listeners) {
        console.warn(`event name ${event} listeners not found`);
        return;
      }

      this._eventListeners.set(
        event,
        listeners.filter(listener => listener !== callback),
      );
    }
  }

  public removeAllListeners() {
    this._keyListeners = [];
    this._eventListeners = new Map();
  }
}

function addSocketListener<K extends keyof WebSocketEventMap>(
  socket: WebSocket,
  type: K,
  handler: (this: WebSocket, event: WebSocketEventMap[K]) => void,
): IDisposable {
  socket.addEventListener(type, handler);

  return {
    dispose: () => {
      if (!handler) {
        return;
      }
      socket.removeEventListener(type, handler);
    },
  };
}
