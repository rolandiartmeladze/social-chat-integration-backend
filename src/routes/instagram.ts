import { Router } from 'express';
import InstagramController from '../controllers/instagramController';


const router = Router();

router.get("/webhook", InstagramController.verifyWebhook);
router.post("/webhook", InstagramController.receiveWebhook);
// router.get("/messages", InstagramController.getMessages);
// router.post("/send", InstagramController.sendMessage);


router.get("/conversations", InstagramController.getConversations);
router.get("/conversation/:id", InstagramController.getChat);


export default router;
