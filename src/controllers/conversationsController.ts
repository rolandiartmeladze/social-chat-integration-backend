import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { splitParticipantsByRole } from "../utility/splitParticipantsByRole";
import { getFacebookPageInfo } from "../services/facebook.service";

export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastUpdated: -1 })
      .populate({
        path: "lastMessage",
        select: "text sender timestamp"
      })
      .lean();

    const { id: pageId } = await getFacebookPageInfo(process.env.FB_PAGE_ACCESS_TOKEN || "");

    const formatted = await Promise.all(
      conversations.map(async (conversation) => {
        const { user, page } = splitParticipantsByRole(conversation.participants, pageId);

        const messages = await Message.find({ conversationId: conversation._id })
          .sort({ timestamp: 1 })
          .lean();

        return {
          id: conversation.customId,
          platform: conversation.platform,
          lastUpdated: conversation.lastUpdated,
          unreadCount: conversation.unreadCount,
          participants: { user, page },
          messages,
          lastMessage: conversation.lastMessage,
        };
      })
    );

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching conversations", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getMessagesForConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findOne({ customId: conversationId }).lean();
    if (!conversation) return res.sendStatus(404);

    const { id: pageId } = await getFacebookPageInfo(process.env.FB_PAGE_ACCESS_TOKEN || "");

    const { user, page } = splitParticipantsByRole(conversation.participants, pageId);

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      id: conversation.customId,
      platform: conversation.platform,
      lastUpdated: conversation.lastUpdated,
      unreadCount: conversation.unreadCount,
      participants: { user, page },
      messages,
    });
  } catch (err) {
    console.error("Error fetching messages", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
