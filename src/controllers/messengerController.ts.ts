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
            body.entry.forEach((entry: any) => {
                const webhookEvent = entry.messaging[0];
                const senderId: string = webhookEvent.sender.id;
                const message: string = webhookEvent.message.text;

                entry.messaging.forEach(async (event: any) => {
                    console.log('Messenger webhook event:', event);
                    const senderId = event.sender.id;
                    if (event.message && event.message.text) {
                        const receivedText = event.message.text;
                        await MessengerService.sendTextMessage(senderId, `text hear: ${receivedText}`);
                    }
                });
                if (message) {
                    console.log(`Received message from ${senderId}: ${message}`);
                } else {
                    console.log(`No message from ${senderId}`);
                }

            });
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    }
}

