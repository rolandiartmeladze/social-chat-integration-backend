import axios from 'axios';
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
type Message = {
    sender: string;
    text: string;
};
const messages: Message[] = [];
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

    static addMessage(msg: Message) {
        messages.push(msg);
    }

    static getAllMessages(): Message[] {
        return messages;
    }
}
