import { Request, Response } from "express";
import TelegramService from "../services/telegramService";
import { TelegramUpdate } from "../types/types";
import { updateConversation } from "../services/conversationService";
import { IParticipant, Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { io } from "../socket";

// TelegramController პასუხისმგებელია Telegram Webhook-ის მიღებასა და გაგზავნაზე
export default class TelegramController {

  /**
   * Webhook Endpoint - იღებს Telegram-ისგან შეტყობინებებს (POST)
   */
  static async receiveWebhook(req: Request, res: Response): Promise<Response> {
    try {
      // 1. ავტორიზაციის საიდუმლო Token-ის შემოწმება
      const secret = req.header("X-Telegram-Bot-Api-Secret-Token");
      if (!secret || secret !== process.env.TELEGRAM_SECRET_TOKEN) {
        console.warn("❌ Blocked request with invalid secret.");
        return res.status(403).json({ error: "Invalid secret token" });
      }

      // 2. ამოღე მესიჯი update ობიექტიდან
      const update: TelegramUpdate = req.body;
      const message = update?.message;
      if (!message) {
        return res.status(400).json({ error: "Missing message in update" });
      }

      // 3. გაანალიზე შეტყობინების დეტალები
      const from = message.from;
      const chat = message.chat;
      const text = message.text;
      const timestamp = new Date((message.date ?? Date.now() / 1000) * 1000);

      const userId = from?.id;
      if (!userId || !text) {
        return res.status(400).json({ error: "Missing required data" });
      }

      // 4. იდენტიფიცირე ბოტი (Telegram API-ს მეშვეობით)
      const { id: botId, username: botUsername } = await TelegramService.getBotIdentity();

      // უნიკალური ჩატის ID-ს ფორმირება
      const sortedIds = [String(userId), botId].sort();
      const customId = `telegram-${sortedIds.join("-")}`;

      // 5. მომხმარებელი და ბოტი როგორც Conversation მონაწილეები
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

      // 6. Conversation განახლება ან შექმნა
      await updateConversation({
        customId,
        platform: "telegram",
        sender: user,
        text,
        timestamp,
        participants: [user, page], // საჭიროა პირველივე მესიჯზე
      });

      // წარმატებული პასუხი Telegram-ს
      return res.status(200).json({ message: `Received message from ${user.name}` });

    } catch (err) {
      console.error("❌ Failed to process Telegram message:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * გაგზავნის Endpoint - ბოტი აგზავნის შეტყობინებას Telegram-ში
   */
  static async sendMessage(req: Request, res: Response): Promise<Response> {
    try {
      const { recipientId, text } = req.body;
      if (!recipientId || !text) {
        return res.status(400).json({ error: "Missing recipientId or text" });
      }

      const bot = await TelegramService.getBotIdentity();

      // 1. გაგზავნე შეტყობინება Telegram API-ის მეშვეობით
      await TelegramService.sendMessage(recipientId, text);

      // 2. Conversation მოძებნა MongoDB-ში
      const customId = `telegram-${recipientId}-${bot.id}`;
      const conversation = await Conversation.findOne({ customId });
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // 3. ბოტის ინფო შენახვისთვის
      const botUser: IParticipant = {
        id: bot.id,
        name: bot.username,
        avatarUrl: "",
      };

      // 4. ახალ შეტყობინების დამატება messages კოლექციაში
      const newMessage = await Message.create({
        conversationId: conversation._id,
        text,
        timestamp: new Date(),
        sender: botUser,
      });

      // 5. Conversation-ის განახლება ბოლო შეტყობინებით
      conversation.lastMessage = newMessage._id;
      conversation.lastUpdated = new Date();
      await conversation.save();

      // 6. Socket.io-ს მეშვეობით რეალურ დროში frontend-ს განახლება
      io.emit("conversationUpdated", {
        customId: conversation._id,
        platform: "telegram",
        text,
        timestamp: newMessage.timestamp,
        sender: botUser,
      });

      return res.status(200).json({ message: "Message sent and saved" });

    } catch (error) {
      console.error("❌ Failed to send Telegram message:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
