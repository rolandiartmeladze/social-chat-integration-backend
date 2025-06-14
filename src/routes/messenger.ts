import { Router } from "express";

import MessengerController from "../controllers/messengerController";

const router = Router();

router.post('/send', MessengerController.sendMessageFromFrontend);
router.get("/webhook", MessengerController.verifyWebhook);
router.post("/webhook", MessengerController.receiveWebhook);
router.get("/messages", MessengerController.getMessages);
router.get("/conversations", MessengerController.getConversations);
router.get("/conversation/:id", MessengerController.getChat);

export default router;
