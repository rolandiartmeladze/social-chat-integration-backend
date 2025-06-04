import axios from "axios";
import { User, Conversation, Message } from "../types/types";

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const FB_API_URL =
  process.env.FB_API_URL || "https://graph.facebook.com/v22.0/";

const IG_ACCOUNT_ID = process.env.PAGE_ID;
const MESSAGES_ENDPOINT = `${FB_API_URL}/${IG_ACCOUNT_ID}/messages`;

export default class InstagramService {
  static async sendTextMessage(igUserId: string, text: string) {
    try {
      await axios.post(
        MESSAGES_ENDPOINT,
        {
          messaging_type: "RESPONSE",
          recipient: { id: igUserId },
          message: { text: text },
        },
        {
          params: { access_token: PAGE_ACCESS_TOKEN },
        }
      );
    } catch (error) {
      console.error("Instagram API error:", error);
    }
  }

  static async sendMessage(recipientId: string, message: string) {
    if (!PAGE_ACCESS_TOKEN) {
      throw new Error("Missing PAGE_ACCESS_TOKEN");
    }

    const url = `https://graph.facebook.com/v18.0/me/messages`;

    try {
      const response = await axios.post(
        url,
        {
          messaging_type: "RESPONSE",
          recipient: {
            id: recipientId,
          },
          message: {
            text: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAGE_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Message sent to ${recipientId}`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Failed to send message:",
        error?.response?.data || error.message
      );
      throw new Error("Message send failed.");
    }
  }

  static async getConversations() {
    if (!IG_ACCOUNT_ID || !PAGE_ACCESS_TOKEN) {
      throw new Error("Instagram Business ID or Access Token missing");
    }

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/${IG_ACCOUNT_ID}/conversations?platform=instagram`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            fields: "id,participants",
          },
        }
      );

      const conversations = response.data.data.map((conv: any) => {
        const participants = conv.participants?.data || [];

        const user = participants.find((p: any) => p.id !== IG_ACCOUNT_ID);

        return {
          conversationId: conv.id,
          user: {
            id: user?.id || "unknown",
            name: user?.name || "Unknown User",
            avatar: user?.id
              ? `https://graph.facebook.com/${user.id}/picture?type=normal`
              : null,
          },
        };
      });

      console.log(`Instagram conversations fetched: ${conversations.length}`);
      return conversations;
    } catch (error: any) {
      console.error(
        "Instagram getConversations error:",
        error?.response?.data || error.message
      );
      throw new Error("Failed to fetch Instagram conversations");
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
