import { Router } from "express";

import { getAllConversations } from "../controllers/conversationsController";

const router = Router();

router.get("/", getAllConversations);

export default router;
