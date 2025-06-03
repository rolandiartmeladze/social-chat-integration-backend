import axios from "axios";
import dotenv from "dotenv";

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

    const response = await axios.get(
      `${process.env.FB_API_URL}/me/conversations`,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: "participants",
        },
      }
    );

const conversations = await Promise.all(
  response.data.data.map(async (conv: any) => {
    const participants = conv.participants?.data || [];

    const page = participants.find(
      (p: any) => p.name?.includes("RMdor") || p.name?.includes("Gorespo")
    );
    const user = participants.find((p: any) => p.name !== page?.name);

    const userAvatar = user?.id
      ? `https://graph.facebook.com/${user.id}/picture?type=normal`
      : null;

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
      user: user?.name || "Unknown User",
      avatar: userAvatar,
      page: page?.name || "Unknown Page",
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

  static async getChat(conversationId: string) {
    try {
      if (!PAGE_ACCESS_TOKEN)
        throw new Error("FB_PAGE_ACCESS_TOKEN is missing");

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

      const messages = response.data.data.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        from: msg.from?.name || "Unknown",
        createdTime: msg.created_time,
      }));

      console.log(`Messages fetched from conversation:`, messages.length);
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
