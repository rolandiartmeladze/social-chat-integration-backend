export const messages: { sender: string; text: string }[] = [];

import { Request, Response } from 'express';

import MessengerService from '../services/messengerService';

export default class MessengerController {

    static verifyWebhook(req: Request, res: Response) {
        const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "your_verify_token";
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode && token) {
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                console.log('WEBHOOK_VERIFIED');
              
                res.status(200).send(challenge);
            } else {
                res.sendStatus(403);
            }
        }
    }

static async recieveWebhook(req: Request, res: Response) {
    const body = req.body;

    if (body.object === 'page') {
        for (const entry of body.entry) {
            const messagingEvents = entry.messaging;

            for (const event of messagingEvents) {
                const senderId = event.sender?.id;
                const messageText = event.message?.text;

                if (senderId && messageText) {
                    console.log(`Received message from ${senderId}: ${messageText}`);
                    
                    messages.push({ sender: senderId, text: messageText });

                    await MessengerService.sendTextMessage(senderId, `Echo: ${messageText}`);
                }
            }
        }

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
  


}
static getMessages(req: Request, res: Response) {
    res.status(200).json(messages);
  }
  
}