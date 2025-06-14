import { Request, Response } from "express";
import MessengerService from "../services/messengerService";
import WebhookController from "./webhook.controller"
import { IncomingMessagePayload } from "../types/types"

type Message = { sender: string; text: string; timestamp: string };

export const messages: Message[] = [];

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

    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        const senderId = event.sender?.id;
        const senderName = event.sender?.name;
        const text = event.message?.text;
        if (senderId && text) {
          const payload: IncomingMessagePayload = {
            conversationId: `messenger-${senderId}`,
            platform: "messenger",
            username: senderName,
            senderId,
            text,
            timestamp: new Date().toISOString(),
          };

          WebhookController.handleIncomingMessage(payload);
        }
      }
    }
      return res.status(200).send("EVENT_RECEIVED");
    }

  static getMessages(_req: Request, res: Response) {
    return res.status(200).json({ messages });
  }

  static async sendMessageFromFrontend(req: Request, res: Response) {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res
        .status(400)
        .json({ error: "Sender ID and text are required." });
    }

    try {
      await MessengerService.sendMessage(sender, text);
      messages.push({ sender, text, timestamp: new Date().toISOString() });
      res.status(200).json({ message: "Message sent successfully." });
    } catch (error) {
      console.error("Failed to send message:", error);
      res.status(500).json({ error: "Failed to send message." });
    }
  }

  static async getConversations(_req: Request, res: Response) {
    try {
      const conversations = await MessengerService.getConversations();
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

      const conversation = await MessengerService.getChat(conversationId);

      return res.status(200).json({ conversation });
    } catch (error: any) {
      console.error("Error in Controller:", error.message);
      return res.status(500).json({ error: "Failed to get messages from conversation" });
    }
  }
}
