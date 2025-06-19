import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { splitParticipantsByRole } from "../util/splitParticipantsByRole";
import { getFacebookPageInfo } from "../services/facebook.service";
import TelegramService from "../services/telegramService";
import { IUser } from "../models/User";

// [GET] /conversations
// აბრუნებს ყველა conversation-ს, მათ შორის enriched ვერსიას მომხმარებლის და ბოტის/გვერდის გაყოფილი როლებით
export const getAllConversations = async (req: Request, res: Response) => {
  try {
    // [1] წამოიღე ყველა conversation, დაასორტირე ბოლოს განახლების მიხედვით

    const user = req.user as IUser;
    console.log(user?.role)
    const conversations = await Conversation.find()
      .sort({ lastUpdated: -1 })
      .populate({
        path: "lastMessage", // ავსებს lastMessage ველს
        select: "text sender timestamp", // მხოლოდ ეს ველები წამოიღე
      })
      .lean();

    // [2] აიღე Telegram Bot-ის და Facebook Page-ის ID-ები (participants განასხვავებლად)
    const botId = (await TelegramService.getBotIdentity()).id;
    const pageId = (await getFacebookPageInfo(process.env.FB_PAGE_ACCESS_TOKEN || "")).id;

    // [3] conversation-ების enrichment (role-based გამოყოფა)
    const enrichedConvs = await Promise.all(
      conversations.map(async (conv) => {
        try {
          let user, page;

          // Telegram → გამოყენება botId-ით
          if (conv.platform === "telegram") {
            ({ user, page } = splitParticipantsByRole(conv.participants, botId));
          }
          // Messenger → გამოყენება pageId-ით
          else if (conv.platform === "messenger") {
            ({ user, page } = splitParticipantsByRole(conv.participants, pageId));
          } else {
            return null; // პლატფორმა არ არის მხარდაჭერილი
          }

          // [4] Final enriched response
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
          console.error(`❌ Failed to enrich conversation ${conv._id}`, err);
          return null;
        }
      })
    );

    // [5] response — null-ები გამოღდებული conversation-ებიდან გამოიცხრება
    res.json(enrichedConvs.filter(Boolean));
  } catch (err) {
    console.error("❌ Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// [GET] /conversations/:conversationId/messages
// აბრუნებს კონკრეტული conversation-ის ყველა შეტყობინებას და მეტამონაცემებს
export const getMessagesForConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;

  try {
    // [1] მოძებნე შესაბამისი conversation
    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    // [2] აიღე ბოტის/გვერდის ID პლატფორმის მიხედვით
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

    // [3] მოიტანე conversation-ის ყველა შეტყობინება უახლესიდან ძველისკენ
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ timestamp: -1 })
      .lean();

    // [4] response
    res.json({
      id: conversation._id.toString(),
      platform: conversation.platform,
      lastUpdated: conversation.lastUpdated,
      unreadCount: conversation.unreadCount,
      participants: { user, page },
      messages,
    });
  } catch (err) {
    console.error("❌ Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
