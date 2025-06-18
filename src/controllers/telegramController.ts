import { Request, Response } from "express";
import TelegramService from "../services/telegramService";
import { TelegramUpdate } from "../types/types";
import { updateConversation } from "../services/conversationService";
import { IParticipant } from "../models/Conversation"

export default class TelegramController {
  static async receiveWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const secret = req.header("X-Telegram-Bot-Api-Secret-Token");
      if (!secret || secret !== process.env.TELEGRAM_SECRET_TOKEN) {
        console.warn("Blocked request with invalid secret.");
        return res.status(403).json({ error: "Invalid secret token" });
      }

      const update: TelegramUpdate = req.body;
      const message = update?.message;

      if (!message) {
        return res.status(400).json({ error: "Missing message in update" });
      }

      const chat = message.chat;
      const from = message.from;
      const text = message.text;
      const timestamp = new Date((message.date ?? Date.now() / 1000) * 1000);

      const userId = from?.id;
      const chatId = chat?.id;

      if (!userId || !chatId || !text) {
        return res.status(400).json({ error: "Missing required data" });
      }

      const customId = `telegram-${userId}-${chatId}`;
      const username = from?.username || from?.first_name || "Unknown User";

      const user: IParticipant = {
        id: String(userId),
        name: username,
        avatarUrl: "",
      };

      const page: IParticipant = {
        id: String(chatId),
        name: chat.type || "Telegram Chat",
        avatarUrl:"",
      };

      await updateConversation({
        customId,
        platform: "telegram",
        sender: user,
        text,
        timestamp,
        participants: [user, page],
      });

      if (process.env.NODE_ENV !== "production") {
        console.log("📥 Telegram Update:", JSON.stringify(update, null, 2));
      }

      return res.status(200).json({ message: `Received message from ${username}`, chatId });
    } catch (err) {
      console.error("❌ Failed to process Telegram message:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getBotStatus(_req: Request, res: Response): Promise<Response> {
    try {
      const data = await TelegramService.getBotInfo();
      if (data.ok) {
        return res.status(200).json({
          status: "connected",
          bot: data.result,
        });
      } else {
        return res.status(500).json({ status: "error", error: data });
      }
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Bot connection failed",
      });
    }
  }
}
