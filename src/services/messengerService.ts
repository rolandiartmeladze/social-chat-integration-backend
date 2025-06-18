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

}
