import express from "express";
import TelegramController from "../controllers/telegramController";

const router = express.Router();

router.post("/webhook", TelegramController.receiveWebhook);
router.get("/messages", TelegramController.getMessages);
router.get("/status", TelegramController.getBotStatus);

export default router;
