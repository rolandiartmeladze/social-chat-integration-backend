import { Request, Response } from "express";
import TelegramService from "../services/telegramService";
import { updateConversation } from "../services/conversationService";
import { TelegramUpdate } from "../types/types";

type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

export default class TelegramController {
  private static messages: Message[] = [];

  static async receiveWebhook(req: Request, res: Response): Promise<Response> {
    const secret = req.header("X-Telegram-Bot-Api-Secret-Token");
    if (!secret || secret !== process.env.TELEGRAM_SECRET_TOKEN) {
      console.warn("Blocked request with invalid secret.");
      return res.status(403).json({ error: "Invalid secret token" });
    }

    const update: TelegramUpdate = req.body;
    const chatId = update?.message?.chat?.id;
    const from = update?.message?.from;
    const username = from?.username || from?.first_name || "Guest";
    const text = update?.message?.text;
    const timestamp = new Date((update.message?.date ?? Date.now() / 1000) * 1000);
    console.log(`📨 Message from ${username} (chatId: ${chatId}): ${text}`);


    if (chatId && text) {
      try {
        const sender = {
          id: String(chatId),
          name: username,
        };

        const customId = `telegram-${chatId}`;

        await updateConversation({
          customId,
          platform: "telegram",
          sender,
          text,
          timestamp,
        });

        await TelegramService.sendMessage(chatId, `შენ დაწერე: ${text}`);
      } catch (err) {
        console.error("Failed to process Telegram message:", err);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Webhook Body:", JSON.stringify(update, null, 2));
    }

    return res.status(200).json({ message: `Received message from ${username}`, chatId });
  }

  static getMessages(req: Request, res: Response): Response {
    return res.status(200).json({ messages: TelegramController.messages });
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
