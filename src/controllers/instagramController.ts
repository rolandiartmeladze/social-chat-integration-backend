import { Request, Response } from 'express';
import InstagramService from '../services/instagramService';

const igMessages: { sender: string; text: string }[] = [];

export default class InstagramController {
  static verifyWebhook(req: Request, res: Response) {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
      return res.status(200).send(req.query['hub.challenge']);
    }
    return res.sendStatus(403);
  }

  static async receiveWebhook(req: Request, res: Response) {
    const body = req.body;

    if (body.object !== 'page') return res.sendStatus(404);

    try {
      for (const entry of body.entry) {
        for (const event of entry.messaging || []) {
          const senderId = event.sender.id;
          const messageText = event.message?.text;
          
          if (messageText) {
            igMessages.push({ sender: senderId, text: messageText });
            await InstagramService.sendTextMessage(senderId, `You wrote: ${messageText}`);
          }
        }
      }

      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Webhook error:', error);
      res.sendStatus(500);
    }
  }

  static getMessages(req: Request, res: Response) {
    return res.status(200).json(igMessages);
  }
}

  