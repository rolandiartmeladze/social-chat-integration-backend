import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";

export const getAllConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastUpdated: -1 })
      .populate({
        path: "lastMessage",
        select: "text sender timestamp"
      })
      .lean();

    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getMessagesForConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 }) // older first
      .lean();

    res.json({ conversationId, messages });
  } catch (err) {
    console.error("Error fetching messages", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
