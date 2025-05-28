import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAGE_ACCESS_TOKEN = process.env.PROFILE_TOKEN;
const FB_API_URL = process.env.FB_API_URL || "https://graph.facebook.com/v22.0/";
const CONVERSATIONS_ENDPOINT = `${FB_API_URL}me/conversations`;
const MESSAGES_ENDPOINT = `${FB_API_URL}me/messages`;

export default class MessengerService {
  static async sendMessage(recipientId: string, text: string) {
    try {
      await axios.post(
        MESSAGES_ENDPOINT,
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

      const response = await axios.get(CONVERSATIONS_ENDPOINT, {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: "participants",
        },
      });

      const conversations = response.data.data.map((conv: any) => {
        const participants = conv.participants?.data || [];

        const page = participants.find(
          (p: any) => p.name?.includes("RMdor") || p.name?.includes("Gorespo")
        );
        const user = participants.find((p: any) => p.name !== page?.name);

        return {
          conversationId: conv.id,
          user: user?.name || "Unknown User",
          page: page?.name || "Unknown Page",
        };
      });

      console.log("Conversations fetched:", conversations.length);
      return conversations;
    } catch (error: any) {
      console.error(
        "Error fetching conversations:",
        error?.response?.data || error.message
      );
      throw new Error("Failed to fetch conversations");
    }
  }

  static async getMessagesFromConversation(conversationId: string) {
    try {
      if (!PAGE_ACCESS_TOKEN) throw new Error("PAGE_ACCESS_TOKEN is missing");

      const response = await axios.get(
        `${FB_API_URL}${conversationId}/messages`,
        {
          params: {
            access_token: PAGE_ACCESS_TOKEN,
            fields: "message,from,created_time",
            limit: 25,
          },
        }
      );

      const messages = response.data.data.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        from: msg.from?.name || "Unknown",
        createdTime: msg.created_time,
      }));

      console.log(`Messages fetched from conversation t_1056375546391359:`, messages.length);

      return messages;
    } catch (error: any) {
      console.error(
        "Error fetching messages from conversation:",
        error?.response?.data || error.message
      );
      throw new Error("Failed to fetch messages from conversation");
    }
  }
}
