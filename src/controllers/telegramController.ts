import { Request, Response } from "express";
import TelegramService from "../services/telegramService";

type Message = {
  sender: string;
  text: string;
  timestamp: string;
};

export default class TelegramController {
  private static messages: Message[] = [];

  static async receiveWebhook(req: Request, res: Response) {
    const secret = req.header("X-Telegram-Bot-Api-Secret-Token");
    if (!secret || secret !== process.env.TELEGRAM_SECRET_TOKEN) {
      console.warn("Invalid or missing secret token from request.");
      return res.status(403).json({ error: "Forbidden: Invalid secret token" });
    }

    const update = req.body;
    const chatId = update?.message?.chat?.id;
    const from = update?.message?.from;
    const username = from?.username || from?.first_name || "Guest";
    const text = update?.message?.text;

    console.log(`📨 Message from ${username} (chatId: ${chatId}): ${text}`);

    if (text && chatId) {
      const newMsg: Message = {
        sender: username,
        text,
        timestamp: new Date((update.message.date || Date.now() / 1000) * 1000).toISOString(),
      };

      TelegramController.messages.push(newMsg);

      try {
        await TelegramService.sendMessage(chatId, `შენ დაწერე: ${text}`);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("📥 Webhook Body:", JSON.stringify(update, null, 2));
    }

    return res.status(200).json({ message: `Received message from ${username}`, chatId });
  }

  static getMessages(req: Request, res: Response) {
    return res.status(200).json({ messages: TelegramController.messages });
  }

  static async getBotStatus(_req: Request, res: Response) {
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
