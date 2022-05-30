import { MessageType, TMessageType } from './MessageType';

export interface IConnectMessage {
  type: 'CONNECT';
  body: {
    serverUuid: string;
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
