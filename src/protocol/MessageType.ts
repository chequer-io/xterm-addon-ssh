export enum MessageType {
  CONNECT,
  MESSAGE,
}

export type TMessageType = MessageType | 'CONNECT' | 'MESSAGE';
