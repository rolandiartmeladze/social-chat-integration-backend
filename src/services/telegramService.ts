type Message = {
  sender: string;
  text: string;
  timestamp?: string;
};

const messages: Message[] = [];

const TelegramService = {
  addMessage: (message: Message) => {
    messages.push({ ...message, timestamp: new Date().toISOString() });
  },
  getAllMessages: (): Message[] => {
    return messages;
  },
  sendMessage: async (chatId: number, text: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  },
};

export default TelegramService;
