import { IDisposable, ITerminalAddon, Terminal } from 'xterm';
import { MessageType } from './protocol/MessageType';
import { MessageConverter } from './protocol/MessageConverter';

export interface ISshOptions {
  serverUuid: string;
  header?: Record<string, string>;
  connectImmediately?: boolean;
}

export interface IKeyEvent {
  key: string;
  domEvent: KeyboardEvent;
}

export class SshAddon implements ITerminalAddon {
  private readonly _socket: WebSocket;
  private _disposables: IDisposable[] = [];
  private _terminal: Terminal | undefined;
  public header: Record<string, string> = {};

  private readonly _serverUuid: string;

  public constructor(socket: WebSocket, options: ISshOptions) {
    this._socket = socket;
    this._socket.binaryType = 'arraybuffer';

    this._serverUuid = options.serverUuid;

    if (options.header) {
      this.header = options.header;
    }

    if (options.connectImmediately) {
      this.connect();
    }
  }

  public connect() {
    this._socket.send(
      MessageConverter.serialize(
        MessageType.CONNECT,
        this._serverUuid,
        this.header,
      ),
    );
  }

  public activate(terminal: Terminal): void {
    this._terminal = terminal;

    if (this._socket.readyState !== -1) {
      this.connect();
    }

    this._disposables.push(
      addSocketListener(this._socket, 'message', this._onMessage.bind(this)),
      terminal.onKey(this._onKey.bind(this)),
      addSocketListener(this._socket, 'close', this.dispose.bind(this)),
      addSocketListener(this._socket, 'error', this.dispose.bind(this)),
    );
  }

  public dispose(): void {
    this._socket.close();
    for (const d of this._disposables) {
      d.dispose();
    }
  }

  private _onKey(event: IKeyEvent) {
    if (this._socket.readyState !== 1) {
      return;
    }

    this._socket.send(
      MessageConverter.serialize(MessageType.MESSAGE, event.key, this.header),
    );
  }

  private _onMessage(event: MessageEvent): void {
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
