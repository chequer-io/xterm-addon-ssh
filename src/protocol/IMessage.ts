import { MessageType, TMessageType } from './MessageType';

export interface ITerminalSize {
  cols: number;
  rows: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface IConnectMessage {
  type: 'CONNECT';
  body: {
    serverUuid: string;
    size?: ITerminalSize;
  };
}

export interface IResizeMessage {
  type: 'RESIZE';
  body: {
    size?: ITerminalSize;
  };
}

export interface ITerminalMessage {
  type: MessageType;
  body: {
    message: string;
  };
}

export interface IMessage {
  type: TMessageType;
  body: {
    message: string;
  };
}
