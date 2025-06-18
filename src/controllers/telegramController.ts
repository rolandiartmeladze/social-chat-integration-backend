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

      const from = message.from;
      const chat = message.chat;
      const text = message.text;
      const timestamp = new Date((message.date ?? Date.now() / 1000) * 1000);

      const userId = from?.id;
      if (!userId || !text) {
        return res.status(400).json({ error: "Missing required data" });
      }

      const { id: botId, username: botUsername } = await TelegramService.getBotIdentity();
      const sortedIds = [String(userId), botId].sort();
      const customId = `telegram-${sortedIds.join("-")}`;

      const user: IParticipant = {
        id: String(userId),
        name: from?.username || from?.first_name || "Unknown User",
        avatarUrl: "",
      };

      const page: IParticipant = {
        id: botId,
        name: botUsername,
        avatarUrl: "",
      };

      await updateConversation({
        customId,
        platform: "telegram",
        sender: user,
        text,
        timestamp,
        participants: [user, page],
      });

      return res.status(200).json({ message: `Received message from ${user.name}` });
    } catch (err) {
      console.error("❌ Failed to process Telegram message:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { sender, text } = req.body;
      if (!sender || !text) {
        return res.status(400).json({ error: "Missing sender or text" });
      }
      await TelegramService.sendMessage(sender, text);
      return res.status(200).json({ message: "Message sent to Telegram" });
    } catch (error) {
      console.error("Telegram sendMessage error:", error);
      return res.status(500).json({ error: "Failed to send Telegram message" });
    }
  }
}
