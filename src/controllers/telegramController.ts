import { Request, Response } from 'express';
import TelegramService from '../services/telegramService';

export default class TelegramController {
  static async receiveWebhook(req: Request, res: Response) {
    const secret = req.header('X-Telegram-Bot-Api-Secret-Token');
    if (!secret || secret !== process.env.TELEGRAM_SECRET_TOKEN) {
      console.warn("Invalid or missing secret token from request.");
      return res.status(403).json({ error: 'Forbidden: Invalid secret token' });
    }

    const update = req.body;
    const from = update?.message?.from;
    const username = from?.username || 'Guest';

    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const sender = from?.username || 'User';

      TelegramService.addMessage({ sender, text });
      await TelegramService.sendMessage(chatId, `you text: ${text}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log("Webhook Body:", JSON.stringify(req.body, null, 2));
    }

    return res.status(200).json({ message: `Received message from ${username}` });
  }

  static getMessages(req: Request, res: Response) {
    res.json(TelegramService.getAllMessages());
  }
}
