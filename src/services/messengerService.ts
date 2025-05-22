import axios from "axios";

const FB_API_URL = "https://graph.facebook.com/v12.0/me/messages";

export default class MessengerService {
    static async sendTextMessage(psid: string, text: string) {
        try {
            await axios.post(
                FB_API_URL,
                {
                    messaging_type: "RESPONSE",
                    recipient: {
                        id: psid
                    },
                    message: {
                        text: text
                    },
                },
                {
                    params: {
                        access_token: process.env.PAGE_ACCESS_TOKEN
                    }
                }
            );
        } catch (error) {
            console.error('Messenger API error:', error);
        }
    }
}