import axios from "axios";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { TelegramUpdate } from "../types/types";

dotenv.config();

// Telegram Bot Token-ს ვიღებთ გარემოს ცვლადებიდან
const TelegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
// Telegram Bot API-ის URL ფორმატირება
const TELEGRAM_API = `https://api.telegram.org/bot${TelegramBotToken}`;

// Bot-ის იდენტობის cache (საცავი), რათა არ იყოს ზედმეტი API-რეკვესტები
let botInfoCache: { id: string; username: string } | null = null;

export default class TelegramService {

  /**
   * Webhook-ზე მიღებული შეტყობინების დამუშავება
   * (მომდევნო ეტაპზე აქ უნდა დაიმუშავოს შეტყობინებები, ახლა ცარიელია)
   */
  static async receiveWebhook(req: Request, res: Response): Promise<Response> {
    const update: TelegramUpdate = req.body;

    // Telegram-ის შეტყობინების ჩეთ ID (საუბრის იდენტიფიკატორი)
    const chatId = update?.message?.chat?.id;
    // მომხმარებლის სახელი ან სახელის ნაწილი
    const username =
      update?.message?.from?.username ||
      update?.message?.from?.first_name ||
      "Guest";
    // ტექსტი შეტყობინების
    const text = update?.message?.text;

    // თუ გვაქვს ჩეთ ID და ტექსტი, აქ შეიძლება დაამატოთ ლოგიკა
    if (chatId && text) {
      // TODO: დაამატე მოთხოვნილი ლოგიკა (მაგ: შენახვა, პასუხის გაგზავნა და ა.შ.)
    }

    // Telegram-ის მოთხოვნის პასუხი, რომ მიღებულია წარმატებით
    return res.status(200).json({ message: "OK" });
  }

  /**
   * გაგზავნის მეთოდი Telegram ჩეთ ID-ზე ტექსტის შეტყობინების
   * @param chatId Telegram ჩეთის უნიკალური იდენტიფიკატორი (ნომერი ან სტრინგი)
   * @param text შეტყობინების ტექსტი
   */
  static async sendMessage(chatId: number | string, text: string): Promise<void> {
    const url = `${TELEGRAM_API}/sendMessage`;
    try {
      await axios.post(url, {
        chat_id: chatId,
        text,
        // parse_mode: "Markdown", // შეგიძლია ჩართო ტექსტის ფორმატირება (Markdown, HTML)
      });
    } catch (err: any) {
      // დეტალური შეცდომის ლოგირება, თუ რამე ჩაიშალა
      console.error("Telegram sendMessage error:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * ბოტის იდენტიფიკაციის წამოღება Telegram API-დან
   * და cache-ში შენახვა მომავალში გამარტივებისთვის
   */
  static async getBotIdentity(): Promise<{ id: string; username: string }> {
    if (botInfoCache) return botInfoCache;

    // API request ბოტის ინფოს წამოსაღებად
    const response = await axios.get(`${TELEGRAM_API}/getMe`);
    if (response.data?.ok) {
      const result = response.data.result;
      botInfoCache = {
        id: String(result.id),
        username: result.username || "TelegramBot",
      };
      return botInfoCache;
    }

    throw new Error("Unable to get bot identity from Telegram API");
  }

  /**
   * Telegram ბოტის webhook-ის დაყენება
   * Secret Token-ის გაწერით უსაფრთხოების გაზრდის მიზნით
   */
  static async setWebhook() {
    const url = `${TELEGRAM_API}/setWebhook`;
    // შენი backend-ის URL, სადაც Telegram შეტყობინებები მიიღება
    const webhookUrl = `${process.env.BACKEND_URL}/telegram/webhook`;
    const secretToken = process.env.TELEGRAM_SECRET_TOKEN;

    const res = await axios.post(url, {
      url: webhookUrl,
      secret_token: secretToken,
    });

    return res.data;
  }

  /**
   * Telegram ბოტის webhook-ის წაშლა
   */
  static async deleteWebhook() {
    const url = `${TELEGRAM_API}/deleteWebhook`;
    const res = await axios.get(url);
    return res.data;
  }
}
