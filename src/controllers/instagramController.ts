import { Request, Response } from "express";
import InstagramService from "../services/instagramService";
type IgMessages = { sender: string; text: string; timestamp: string };

export const igMessages: IgMessages[] = [];

export default class InstagramController {
  static verifyWebhook(req: Request, res: Response) {
    const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "instagram_API";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("INSTAGRAM_WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  static async receiveWebhook(req: Request, res: Response) {
    const body = req.body;

    if (body.object !== "instagram") return res.sendStatus(404);

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const text = event.message?.text;
        console.log(`📸 Received IG message: ${text} from ${senderId}`);
        if (senderId && text) {
          igMessages.push({
            sender: senderId,
            text,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return res.status(200).send("IG EVENT_RECEIVED");
  }

  static async getConversations(req: Request, res: Response) {
    try {
      const conversations = await InstagramService.getConversations();
      res.status(200).json({ conversations });
    } catch (error: any) {
      console.error("Error getting conversations:", error.message);
      res.status(500).json({ error: "Failed to fetch conversations." });
    }
  }

  static async getChat(req: Request, res: Response) {
    try {
      const conversationId = req.params.id;

      if (!conversationId) {
        return res.status(400).json({ error: "Conversation ID is required" });
      }

      const conversation = await InstagramService.getChat(conversationId);

      return res.status(200).json({ conversation });
    } catch (error: any) {
      console.error("Error in Controller:", error.message);
      return res.status(500).json({ error: "Failed to get messages from conversation" });
    }
  }
}
