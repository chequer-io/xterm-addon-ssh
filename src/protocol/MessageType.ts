export enum MessageType {
  CONNECT,
  MESSAGE,
  RESIZE
}

export type TMessageType = MessageType | keyof typeof MessageType;
