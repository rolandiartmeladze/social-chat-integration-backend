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
        select: "text sender timestamp",
      })
      .lean();

    const accessToken = process.env.FB_PAGE_ACCESS_TOKEN || "";
    const { id: pageId } = await getFacebookPageInfo(accessToken);

    const enrichedConvs = conversations.map((conv) => {
      const { user, page } = splitParticipantsByRole(conv.participants, pageId);
      return {
        id: conv._id.toString(),
        customId: conv.customId,
        platform: conv.platform,
        lastUpdated: conv.lastUpdated,
        unreadCount: conv.unreadCount,
        participants: { user, page },
        lastMessage: conv.lastMessage,
      };
    });

    res.json(enrichedConvs);
  } catch (err) {
    console.error("Error fetching conversations", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};
export const getMessagesForConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  try {
    const conversation = await Conversation.findOne({ _id: conversationId }).lean();
    if (!conversation) return res.sendStatus(404);

    const { id: pageId } = await getFacebookPageInfo(process.env.FB_PAGE_ACCESS_TOKEN || "");

    const { user, page } = splitParticipantsByRole(conversation.participants, pageId);

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      id: conversation.id,
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
