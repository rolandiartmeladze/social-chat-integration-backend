import { Request, Response } from "express";
import MessengerService from "../services/messengerService";
import { getParticipants } from "../utility/getParticipants";
import { updateConversation } from "../services/conversationService";
import dotenv from "dotenv";
import { getFacebookPageInfo } from "../services/facebook.service";

dotenv.config();

export default class MessengerController {

  static verifyWebhook(req: Request, res: Response) {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "messenger_API";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  static async receiveWebhook(req: Request, res: Response) {
    const body = req.body;
    if (body.object !== "page") return res.sendStatus(404);

    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    const { id: pageId, name: pageName } = await getFacebookPageInfo(accessToken);

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const recipientId = event.recipient?.id;
        const timestamp = event.timestamp;
        const text = event.message?.text;

        if (!senderId || !text || !timestamp) continue;
        const isFromPage = senderId === pageId;
        const userId = isFromPage ? recipientId : senderId;
        if (!userId) continue;

        const sortedIds = [userId, pageId].sort();
        const conversationId = `messenger-${sortedIds.join("-")}`;

        const rawParticipants = [
          { id: senderId, name: event.sender?.name },
          { id: recipientId, name: event.recipient?.name },
        ];
        const participants = await getParticipants(rawParticipants, pageId, accessToken);

        await updateConversation({
          customId: conversationId,
          platform: "messenger",
          sender: isFromPage ? participants.page : participants.user,
          text,
          timestamp: new Date(timestamp),
          participants: [participants.user, participants.page],
        });
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }


  static async sendMessage(req: Request, res: Response) {
    const { recipientId, text } = req.body;
    if (!recipientId || !text) {
      return res
        .status(400)
        .json({ error: "Sender ID and text are required." });
    }
    try {
      await MessengerService.sendMessage(recipientId, text);
      res.status(200).json({ message: "Message sent successfully." });
    } catch (error) {
      console.error("Failed to send message:", error);
      res.status(500).json({ error: "Failed to send message." });
    }
  }

}
