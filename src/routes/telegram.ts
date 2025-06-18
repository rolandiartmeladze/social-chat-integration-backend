import express from "express";
import TelegramController from "../controllers/telegramController";
import TelegramService from "../services/telegramService";

const router = express.Router();

router.post("/webhook", TelegramController.receiveWebhook);
router.post("/send", TelegramController.sendMessage);

router.get("/setWebhook", async (_req, res) => {
  const resData = await TelegramService.setWebhook();
  res.json(resData);
});

router.get("/deleteWebhook", async (_req, res) => {
  const resData = await TelegramService.deleteWebhook();
  res.json(resData);
});
export default router;
