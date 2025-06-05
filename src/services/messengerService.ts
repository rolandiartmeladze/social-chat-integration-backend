import axios from "axios";
import dotenv from "dotenv";
import { User, Conversation, Message } from "../types/types";
import { getUserAvatar } from "../utility/getUserAvatar";

dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

export default class MessengerService {
  static async sendMessage(recipientId: string, text: string) {
    try {
      await axios.post(
        `${process.env.FB_API_URL}/me/messages`,
        {
          messaging_type: "RESPONSE",
          recipient: { id: recipientId },
          message: { text },
        },
        {
          params: { access_token: PAGE_ACCESS_TOKEN },
        }
      );
    } catch (error: any) {
      console.error(
        "Messenger API sendMessage error:",
        error?.response?.data || error.message
      );
      throw new Error("Messenger message sending failed.");
    }
  }

  static async getConversations() {
    try {
      if (!PAGE_ACCESS_TOKEN) throw new Error("PAGE_ACCESS_TOKEN is missing");

      const { data: pageInfo } = await axios.get(
        `${process.env.FB_API_URL}/me`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            fields: "id,name",
          },
        }
      );

      const response = await axios.get(
        `${process.env.FB_API_URL}/me/conversations`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            fields: "participants",
          },
        }
      );
      const pageId = pageInfo.id;
      const conversations = await Promise.all(
        response.data.data.map(async (conv: any) => {
          const participants = conv.participants?.data || [];

          const page = participants.find((p: any) => p.id === pageId);
          const user = participants.find((p: any) => p.id !== page?.id);
          const userAvatar = user?.id
            ? await getUserAvatar(user.id, PAGE_ACCESS_TOKEN!): "";
            
          let lastMessage = "";
          try {
            const msgRes = await axios.get(
              `${process.env.FB_API_URL}/${conv.id}/messages`,
              {
                params: {
                  access_token: PAGE_ACCESS_TOKEN,
                  fields: "message,created_time,from",
                  limit: 1,
                },
              }
            );

            if (msgRes.data.data.length > 0) {
              lastMessage = msgRes.data.data[0].message || "";
            }
          } catch (msgErr) {
            console.warn("Couldn't fetch last message for:", conv.id);
          }

          return {
            conversationId: conv.id,
            user: {
              id: user?.id || '',
              name: user?.name || 'Unknown',
              avatar: userAvatar,
            },
            page: page?.name,
            lastMessage,
          };
        })
      );

      console.log(`თქვენ გაქვთ ${conversations.length} აქტიური საუბარი.`);
      return conversations;
    } catch (error: any) {
      console.error(
        "Error fetching conversations:",
        error?.response?.data || error.message
      );
      throw new Error("Failed to fetch conversations");
    }
  }

  static async getChat(conversationId: string): Promise<Conversation> {
    if (!PAGE_ACCESS_TOKEN) throw new Error("FB_PAGE_ACCESS_TOKEN is missing");

    try {
      const response = await axios.get(
        `${process.env.FB_API_URL}/${conversationId}/messages`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            fields: "message,from,created_time",
            limit: 25,
          },
        }
      );

      const messagesRaw = response.data.data;
      const avatarCache = new Map<string, string>();

      const messages: Message[] = await Promise.all(
        messagesRaw.map(async (msg: any): Promise<Message> => {
          const senderId = msg.from?.id;
          const senderName = msg.from?.name || "Unknown";

          let avatarUrl: string = avatarCache.get(senderId) || "";

          if (!avatarUrl) {
            try {
              const res = await axios.get(
                `https://graph.facebook.com/${senderId}`,
                {
                  params: {
                    fields: "picture",
                    access_token: PAGE_ACCESS_TOKEN,
                  },
                }
              );
              avatarUrl = res.data.picture?.data?.url || "";
            } catch {
              avatarUrl = "";
            }
            avatarCache.set(senderId, avatarUrl);
          }
          const sender: User = {
            id: senderId,
            name: senderName,
            avatarUrl,
          };

          return {
            id: msg.id,
            sender,
            text: msg.message || "",
            timestamp: msg.created_time,
            read: false,
          };
        })
      );

      const participantsMap = new Map<string, User>();
      messages.forEach((msg) => {
        if (!participantsMap.has(msg.sender.id)) {
          participantsMap.set(msg.sender.id, msg.sender);
        }
      });

      const participants: User[] = Array.from(participantsMap.values());

      const lastUpdated =
        messages.length > 0 ? messages[0].timestamp : new Date().toISOString();

      return {
        id: conversationId,
        participants,
        messages,
        lastUpdated,
        unreadCount: messages.filter((m) => !m.read).length,
      };
    } catch (error: any) {
      console.error(
        "Error fetching messages from conversation:",
        error?.response?.data || error.message
      );
      throw new Error("Failed to fetch messages from conversation");
    }
  }
}
