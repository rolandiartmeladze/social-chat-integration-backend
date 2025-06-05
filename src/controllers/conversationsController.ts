import { Request, Response } from "express";
import MessengerService from "../services/messengerService";
import InstagramService from "../services/instagramService";
import TelegramService from "../services/telegramService";

export const getAllConversations = async (_req: Request, res: Response) => {
  try {
    const [messengerConvs, instagramConvs, telegramConvs ] = await Promise.all([
      MessengerService.getConversations(),
      InstagramService.getConversations(),
      TelegramService.getConversations(),
    ]);

    const allConversations = [
      ...messengerConvs.map(c => ({ ...c, platform: "messenger" })),
      ...instagramConvs.map(c => ({ ...c, platform: "instagram" })),
      ...telegramConvs.map(c => ({ ...c, platform: "telegram" })),
    ];

    allConversations.sort((a, b) => {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    res.status(200).json({ conversations: allConversations });
  } catch (error: any) {
    console.error("Error fetching conversations:", error.message || error);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
};
