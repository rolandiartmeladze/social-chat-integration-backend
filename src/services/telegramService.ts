import axios from 'axios';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export default class TelegramService {
  static async sendMessage(chatId: number, text: string) {
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text,
      });
    } catch (error) {
      console.error('Telegram API error:', error);
    }
  }
}
