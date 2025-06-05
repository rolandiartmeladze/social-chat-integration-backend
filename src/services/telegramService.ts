import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { IncomingMessagePayload, TelegramUpdate } from "../types/types";
import { UnifiedMessageHandler } from "./UnifiedMessageHandler";

dotenv.config();

const TelegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TelegramBotToken}`;

export default class TelegramService {
  static async receiveWebhook(req: Request, res: Response): Promise<Response> {
    const update: TelegramUpdate = req.body;
    const chatId = update?.message?.chat?.id;
    const username =
      update?.message?.from?.username ||
      update?.message?.from?.first_name ||
      "Guest";
    const text = update?.message?.text;

    if (chatId && text) {
      const payload: IncomingMessagePayload = {
        senderId: String(chatId),
        username,
        text,
        platform: "telegram",
      };

      await UnifiedMessageHandler.processMessage(payload);
    }

    return res.status(200).json({ message: "OK" });
  }

  static async sendMessage(chatId: number | string, text: string): Promise<void> {
    const url = `${TELEGRAM_API}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text,
    });
  }

  static async getBotInfo(): Promise<any> {
    try {
      const response = await axios.get(`${TELEGRAM_API}/getMe`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to get bot info:", error.message);
      throw new Error("Telegram bot not reachable");
    }
  }

  static async getConversations() {
    try {
      const user = {
        id: "tg_user_123",
        name: "Test Telegram User",
        avatarUrl: null,
      };

      const page = {
        id: "telegram_page_id",
        name: "Telegram Bot",
        avatarUrl: null,
      };

      const messages = [
        {
          id: "msg_001",
          senderId: user.id,
          text: "გამარჯობა სატესტო მესიჯით!",
          timestamp: new Date().toISOString(),
        },
      ];

      const testConversation = [
        {
          conversationId: "telegram-001",
          participants: { user, page },
          messages,
          lastUpdated: messages[0].timestamp,
          unreadCount: "0",
        },
      ];

      console.log("Telegram test conversation loaded");
      return testConversation;
    } catch (error: any) {
      console.error("Telegram getConversations error:", error.message);
      throw new Error("Failed to fetch Telegram conversations");
    }
  }

}
