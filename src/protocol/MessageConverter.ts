import { MessageType, TMessageType } from './MessageType';
import { getMessageTypeString } from './utils';
import { IMessage, ITerminalMessage } from './IMessage';

export class MessageConverter {
  private static normalizeMessageType(type: TMessageType): MessageType {
    if (typeof type === 'string') {
      return MessageType[type];
    }

    return type;
  }

  public static serialize<T>(
    type: TMessageType,
    body: T,
    header: Record<string, string>,
  ) {
    return JSON.stringify({
      type: getMessageTypeString(type),
      header,
      body,
    });
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
