import axios from 'axios';

const FB_API_URL = 'https://graph.facebook.com/v12.0';

export default class InstagramService {
  static async sendTextMessage(igUserId: string, text: string) {
    try {
      await axios.post(
        `${FB_API_URL}/me/messages`,
        {
          messaging_type: 'RESPONSE',
          recipient: { id: igUserId },
          message: { text: text },
        },
        {
          params: { access_token: process.env.FB_PAGE_ACCESS_TOKEN },
        }
      );
    } catch (error) {
      console.error('Instagram API error:', error);
    }
  }
}
