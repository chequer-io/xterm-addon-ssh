import { MessageType, TMessageType } from './MessageType';
import { getMessageTypeString } from './utils/getMessageTypeString';
import { IMessage, ITerminalMessage } from './IMessage';

export class MessageConverter {
  private static normalizeMessageType(type: TMessageType): MessageType {
    if (typeof type === 'string') {
      return MessageType[type];
    }

    return type;
  }

  public static serialize(
    type: TMessageType,
    message: string,
    header: Record<string, string>,
  ) {
    switch (MessageConverter.normalizeMessageType(type)) {
      case MessageType.CONNECT:
        return JSON.stringify({
          type: getMessageTypeString(type),
          header,
          body: {
            serverUuid: message,
          },
        });
      case MessageType.MESSAGE:
      default:
        return JSON.stringify({
          type: getMessageTypeString(type),
          header,
          body: {
            message,
          },
        });
    }
  }

  public static deserialize(data: string): ITerminalMessage {
    const parsed: IMessage = JSON.parse(data);

    if (typeof parsed.type === 'string') {
      return {
        ...parsed,
        type: MessageType[parsed.type],
      };
    }

    return parsed as ITerminalMessage;
  }
}
