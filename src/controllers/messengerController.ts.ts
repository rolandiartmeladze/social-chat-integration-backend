import { Request, Response } from 'express';
import MessengerService from '../services/messengerService';

type Message = { sender: string; text: string; timestamp: string };

export const messages: Message[] = [];

export default class MessengerController {
  static verifyWebhook(req: Request, res: Response) {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
  }

  static async receiveWebhook(req: Request, res: Response) {
    const body = req.body;

    if (body.object !== 'page') return res.sendStatus(404);

    for (const entry of body.entry || []) {
      const messagingEvents = entry.messaging || [];

      for (const event of messagingEvents) {
        const senderId = event.sender?.id;
        const text = event.message?.text;

        if (senderId && text) {
          console.log(`Message from ${senderId}: ${text}`);

          messages.push({
            sender: senderId,
            text,
            timestamp: new Date().toISOString(),
          });

          try {
            await MessengerService.sendMessage(senderId, `შენ დაწერე: ${text}`);
          } catch (err) {
            console.error('Failed to respond to user:', err);
          }
        }
      }
    }

    return res.status(200).send('EVENT_RECEIVED');
  }

  static async sendMessageFromFrontend(req: Request, res: Response) {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ error: 'Sender ID and text are required.' });
    }

    try {
      await MessengerService.sendMessage(sender, text);
      messages.push({ sender, text, timestamp: new Date().toISOString() });
      res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
      console.error('Failed to send message:', error);
      res.status(500).json({ error: 'Failed to send message.' });
    }
  }

  static getMessages(_req: Request, res: Response) {
    return res.status(200).json({ messages });
  }

  static async getConversations(_req: Request, res: Response) {
    try {
      const conversations = await MessengerService.getConversations();
      res.status(200).json({ conversations });
    } catch (error: any) {
      console.error('Error getting conversations:', error.message);
      res.status(500).json({ error: 'Failed to fetch conversations.' });
    }
  }
}
