import axios from "axios";


type Message = {
  sender: string;
  text: string;
  timestamp?: string;
};

const messages: Message[] = [];
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

const TelegramService = {
  sendMessage: async (chatId: number, text: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  },

  async getBotInfo() {
    try {
      const response = await axios.get(`${TELEGRAM_API}/getMe`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get bot info:', error.message);
      throw new Error('Telegram bot not reachable');
    }
  },

};

export default TelegramService;
