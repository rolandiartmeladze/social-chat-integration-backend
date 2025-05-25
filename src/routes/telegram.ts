import express from "express";
import TelegramController from '../controllers/telegramController';

const router = express.Router();

router.post("/telegram/webhook", TelegramController.receiveWebhook);
router.get("/telegram/messages", TelegramController.getMessages);
router.get("/telegram/status", TelegramController.getBotStatus);

export default router;
