import axios from "axios";
import dotenv from "dotenv";
import { User, Conversation, Message } from "../types/types";
import { getMessage } from '../utility/getMessage'
import { getParticipants } from "../utility/getParticipants";

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
          const participantsRaw = conv.participants?.data || [];
          const { user, page } = await getParticipants(participantsRaw, pageId, PAGE_ACCESS_TOKEN);
          const messages = await getMessage(conv.id, PAGE_ACCESS_TOKEN, 1);
          return {
            conversationId: conv.id,
            participants: { user, page },
            messages: messages,
            lastUpdated: messages?.[0]?.timestamp || null,
          };
        })
      );
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
      const conversationDetails = await axios.get(
        `${process.env.FB_API_URL}/${conversationId}`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            fields: "participants",
          },
        }
      );

      const { data: pageInfo } = await axios.get(
        `${process.env.FB_API_URL}/me`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            fields: "id,name",
          },
        }
      );
      const pageId = pageInfo.id;
      const participantsRaw = conversationDetails.data?.participants?.data || [];
      const { user, page } = await getParticipants(participantsRaw, pageId, PAGE_ACCESS_TOKEN);
      const messages = await getMessage(conversationId, PAGE_ACCESS_TOKEN, 25);

      const lastUpdated =
        messages.length > 0 ? messages[0].timestamp : new Date().toISOString();

      return {
        id: conversationId,
        participants: { user, page },
        messages,
        lastUpdated,
        unreadCount: "0",
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
