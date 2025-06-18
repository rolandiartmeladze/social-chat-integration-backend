import { Router } from "express";

import MessengerController from "../controllers/messengerController";

const router = Router();

router.post('/send', MessengerController.sendMessage);
router.get("/webhook", MessengerController.verifyWebhook);
router.post("/webhook", MessengerController.receiveWebhook);

export default router;
