import { Router } from "express";

import { getAllConversations, getMessagesForConversation } from "../controllers/conversationsController";
const router = Router();

router.get("/", getAllConversations);
router.get("/:conversationId/messages", getMessagesForConversation);

export default router;
