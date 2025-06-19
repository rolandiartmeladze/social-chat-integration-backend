import { Request, Response } from "express";
import MessengerService from "../services/messengerService";
import { getParticipants } from "../util/getParticipants";
import { updateConversation } from "../services/conversationService";
import dotenv from "dotenv";
import { getFacebookPageInfo } from "../services/facebook.service";

dotenv.config();

// MessengerController: მართავს Facebook Messenger-ის ვებჰუქების მიღებას, გატანას და შეტყობინებების გაგზავნას
export default class MessengerController {

  /**
   * Facebook-ის Webhook Verification Endpoint (GET)
   * გამოიყენება მხოლოდ Webhook setup-ის დროს Facebook Developers Console-დან
   */
  static verifyWebhook(req: Request, res: Response) {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "messenger_API";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // თუ მოდი და ტოკენი სწორია → დააბრუნე challenge
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    }

    // თუ ვერ გავიდა ვერიფიკაცია → დაბრუნდი 403
    return res.sendStatus(403);
  }

  /**
   * Facebook Messenger Webhook Receiver (POST)
   * იღებს შეტყობინებებს Facebook-ისგან და აახლებს შესაბამის ჩათს
   */
  static async receiveWebhook(req: Request, res: Response) {
    const body = req.body;

    // მხოლოდ `"page"` ტიპის ობიექტებზე რეაგირება
    if (body.object !== "page") return res.sendStatus(404);

    // [1] ამოიღე Page-ის ინფორმაცია access token-ით
    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    const { id: pageId, name: pageName } = await getFacebookPageInfo(accessToken);

    // [2] გაიარე ყველა event-ზე
    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;
        const timestamp = event.timestamp;
        const text = event.message?.text;

        // გამოტოვე თუ მონაცემები არ არის სრული
        if (!senderId || !text || !timestamp) continue;

        // დადგინე გზავნილი მოდის გვერდიდან თუ მომხმარებლისგან
        const isFromPage = senderId === pageId;
        const userId = isFromPage ? recipientId : senderId;
        if (!userId) continue;

        // უნიკალური conversation ID (მომხმარებელი და გვერდი alphabetically sorted)
        const sortedIds = [userId, pageId].sort();
        const conversationId = `messenger-${sortedIds.join("-")}`;

        // მოამზადე rawParticipants, რათა იდენტიფიცირდეს მათი როლები
        const rawParticipants = [
          { id: senderId, name: event.sender?.name },
          { id: recipientId, name: event.recipient?.name },
        ];

        // აიღე user და page შესაბამისი `getParticipants()` ფუნქციით
        const participants = await getParticipants(rawParticipants, pageId, accessToken);

        // განაახლე conversation ან შექმენი ახალი
        await updateConversation({
          customId: conversationId,
          platform: "messenger",
          sender: isFromPage ? participants.page : participants.user,
          text,
          timestamp: new Date(timestamp),
          participants: [participants.user, participants.page], // საჭიროა პირველად შექმნისას
        });
      }
    }

    // დაბრუნდი წარმატებით
    return res.status(200).send("EVENT_RECEIVED");
  }

  /**
   * [POST] /messenger/send
   * ფრონტიდან გამოგზავნილი შეტყობინების გაგზავნა Messenger-ში
   */
  static async sendMessage(req: Request, res: Response) {
    const { recipientId, text } = req.body;

    // აუცილებელი ველების ვალიდაცია
    if (!recipientId || !text) {
      return res.status(400).json({ error: "Sender ID and text are required." });
    }

    try {
      // გაგზავნე შეტყობინება Messenger API-ის საშუალებით
      await MessengerService.sendMessage(recipientId, text);
      res.status(200).json({ message: "Message sent successfully." });
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      res.status(500).json({ error: "Failed to send message." });
    }
  }

}
