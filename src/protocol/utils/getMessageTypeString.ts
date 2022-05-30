import { MessageType, TMessageType } from '../MessageType';

export function getMessageTypeString(type: TMessageType) {
  if (typeof type === 'string') {
    return type.toUpperCase();
  }

  return MessageType[type].toUpperCase();
}
