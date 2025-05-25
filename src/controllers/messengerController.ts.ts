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

    static async sendMessageFromFrontend(req: Request, res: Response) {
        const { sender, text } = req.body;

        if (!sender || !text) {
            return res.status(400).json({ error: 'Sender ID and text are required.' });
        }

        try {
            await MessengerService.sendTextMessage(sender, text);

            messages.push({ sender, text });

            res.status(200).json({ message: 'Message sent successfully.' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to send message.' });
        }
    }

    static getMessages(req: Request, res: Response) {
        res.status(200).json(messages);
    }

}