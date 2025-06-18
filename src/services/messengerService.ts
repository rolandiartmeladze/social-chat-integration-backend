import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Facebook გვერდის Access Token გარემოს ცვლადიდან
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

export default class MessengerService {
  /**
   * გაგზავნის შეტყობინებას Facebook Messenger API-ზე
   * @param recipientId - მესიჯის მიმღების Facebook User ID
   * @param text - შეტყობინების ტექსტი
   */
  static async sendMessage(recipientId: string, text: string) {
    try {
      await axios.post(
        `${process.env.FB_API_URL}/me/messages`,  // FB API URL (მაგ: https://graph.facebook.com/v22.0)
        {
          messaging_type: "RESPONSE",              // მესიჯის ტიპი — RESPONSE ნიშნავს პასუხს
          recipient: { id: recipientId },          // მიმღების ID
          message: { text },                        // ტექსტური შეტყობინება
        },
        {
          params: { access_token: PAGE_ACCESS_TOKEN },  // Access token პარამეტრი URL-ში
        }
      );
    } catch (error: any) {
      // დეტალური შეცდომის ლოგირება, თუ FB API-ზე გაგზავნა ვერ მოხერხდა
      console.error(
        "Messenger API sendMessage error:",
        error?.response?.data || error.message
      );
      throw new Error("Messenger message sending failed.");
    }
  }
}
