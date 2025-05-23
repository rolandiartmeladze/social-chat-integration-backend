import { Router } from 'express';
import InstagramController from '../controllers/instagramController';

const router = Router();

router.get('/', InstagramController.verifyWebhook);
router.post('/', InstagramController.receiveWebhook);
router.get("/messages", InstagramController.getMessages);

export default router;
