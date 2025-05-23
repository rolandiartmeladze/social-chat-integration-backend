import { Router } from 'express';
import TelegramController from '../controllers/telegramController';

const router = Router();

router.post('/', TelegramController.receiveWebhook);
router.get('/messages', TelegramController.getMessages);

export default router;
