import { Request, Response } from 'express';
import InstagramService from '../services/instagramService';

export const igMessages: { sender: string; text: string }[] = [];

export default class InstagramController {
    static verifyWebhook(req: Request, res: Response) {
        const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
        if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
            res.status(200).send(req.query['hub.challenge']);
        } else {
            res.sendStatus(403);
        }
    }

    static async receiveWebhook(req: Request, res: Response) {
        const body = req.body;

        if (body.object === 'page') {
            try {
                for (const entry of body.entry) {
                    for (const event of entry.messaging) {
                        const senderId = event.sender.id;
                        if (event.message && event.message.text) {
                            const messageText = event.message.text;
                            igMessages.push({ sender: senderId, text: messageText });
                            await InstagramService.sendTextMessage(senderId, `you text: ${messageText}`);
                        }
                    }
                }
                res.status(200).send('EVENT_RECEIVED');
            } catch (error) {
                console.error('Instagram webhook error:', error);
                res.sendStatus(500);
            }
        } else {
            res.sendStatus(404);
        }
    }
    static getMessages(req: Request, res: Response) {
        res.status(200).json(igMessages);
    }
}
