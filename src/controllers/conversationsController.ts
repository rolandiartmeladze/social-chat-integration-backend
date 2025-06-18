import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { splitParticipantsByRole } from "../utility/splitParticipantsByRole";
import { getFacebookPageInfo } from "../services/facebook.service";
import  TelegramService from "../services/telegramService";

export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastUpdated: -1 })
      .populate({
        path: "lastMessage",
        select: "text sender timestamp",
      })
      .lean();

    const botId = (await TelegramService.getBotIdentity()).id;
    const pageId = (await getFacebookPageInfo(process.env.FB_PAGE_ACCESS_TOKEN || "")).id;

    const enrichedConvs = await Promise.all(
      conversations.map(async (conv) => {
        try {
          let user, page;

          if (conv.platform === "telegram") {
            ({ user, page } = splitParticipantsByRole(conv.participants, botId));
          } else if (conv.platform === "messenger") {
            ({ user, page } = splitParticipantsByRole(conv.participants, pageId));
          } else {
            return null;
          }

          return {
            id: conv._id.toString(),
            customId: conv.customId,
            platform: conv.platform,
            lastUpdated: conv.lastUpdated,
            unreadCount: conv.unreadCount,
            participants: { user, page },
            lastMessage: conv.lastMessage || null,
          };
        } catch (err) {
          console.error(`Failed to enrich conversation ${conv._id}`, err);
          return null;
        }
      })
    );

    res.json(enrichedConvs.filter(Boolean)); // filter nulls
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getMessagesForConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    const botId = (await TelegramService.getBotIdentity()).id;
    const pageId = (await getFacebookPageInfo(process.env.FB_PAGE_ACCESS_TOKEN || "")).id;

    let user, page;
    if (conversation.platform === "telegram") {
      ({ user, page } = splitParticipantsByRole(conversation.participants, botId));
    } else if (conversation.platform === "messenger") {
      ({ user, page } = splitParticipantsByRole(conversation.participants, pageId));
    } else {
      return res.status(400).json({ error: "Unsupported platform" });
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      id: conversation._id.toString(),
      platform: conversation.platform,
      lastUpdated: conversation.lastUpdated,
      unreadCount: conversation.unreadCount,
      participants: { user, page },
      messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

