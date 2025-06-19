import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { getAllConversations, getMessagesForConversation } from "../controllers/conversationsController";
const router = Router();

router.get("/", isAuthenticated, getAllConversations);
router.get("/:conversationId/messages", isAuthenticated, getMessagesForConversation);

export default router;
