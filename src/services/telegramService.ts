import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { TelegramUpdate } from "../types/types";

dotenv.config();

const TelegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TelegramBotToken}`;
let botIdCache: string | null = null;

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

  static async getBotId(): Promise<string> {
    if (botIdCache) return botIdCache;
    const response = await axios.get(`${TELEGRAM_API}/getMe`);
    if (response.data?.ok) {
      botIdCache = String(response.data.result.id);
      return botIdCache;
    }
    throw new Error("Unable to get bot ID");
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
          platform: "telegram",
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

  static async setWebhook() {
    const url = `${TELEGRAM_API}/setWebhook`;
    const webhookUrl = `${process.env.BACKEND_URL}/telegram/webhook`;
    const secretToken = process.env.TELEGRAM_SECRET_TOKEN;

    const res = await axios.post(url, {
      url: webhookUrl,
      secret_token: secretToken,
    });

    return res.data;
  }

  static async deleteWebhook() {
    const url = `${TELEGRAM_API}/deleteWebhook`;
    const res = await axios.get(url);
    return res.data;
  }
}
