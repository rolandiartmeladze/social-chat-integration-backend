import TelegramService from "./telegramService";
import MessengerService from "./messengerService";
import { IncomingMessagePayload } from "../types/types";

export class UnifiedMessageHandler {
  static async processMessage(payload: IncomingMessagePayload): Promise<void> {
    const { senderId, username, text, platform } = payload;
    const replyText = `Echo: ${text}`;

    try {
      switch (platform) {
        case "telegram":
          await TelegramService.sendMessage(senderId, replyText);
          break;
        case "messenger":
          await MessengerService.sendMessage(senderId, replyText);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error(`Failed to send message on ${platform}:`, error);
    }
  }
}
