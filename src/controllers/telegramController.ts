import { Request, Response } from 'express';
import TelegramService from '../services/telegramService';

export default class TelegramController {
  static async receiveWebhook(req: Request, res: Response) {
    const secret = req.header('X-Telegram-Bot-Api-Secret-Token');
    if (!secret || secret !== process.env.TELEGRAM_SECRET_TOKEN) {
      return res.sendStatus(403);
    }

    const update = req.body;
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      TelegramService.addMessage({ sender: update.message.from.username || "User", text });

      await TelegramService.sendMessage(chatId, `თქვენ თქვით: ${text}`);
    }

    res.sendStatus(200);
  }

  static getMessages(req: Request, res: Response) {
    res.json(TelegramService.getAllMessages());
  }
}
