import { Router } from "express";

import MessengerController from "../controllers/messengerController.ts";

const router = Router();

router.get("/webhook", MessengerController.verifyWebhook);
router.post("/webhook", MessengerController.recieveWebhook);
router.get("/messages", MessengerController.getMessages);


export default router;
