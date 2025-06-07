import { Router } from 'express';
import axios from 'axios';
import InstagramController from '../controllers/instagramController';


const router = Router();

router.get("/webhook", InstagramController.verifyWebhook);
router.post("/webhook", InstagramController.receiveWebhook);
// router.get("/messages", InstagramController.getMessages);
// router.post("/send", InstagramController.sendMessage);


router.get("/conversations", InstagramController.getConversations);
router.get("/conversation/:id", InstagramController.getChat);


router.get("/auth", (req, res) => {
  const instagramAppId = process.env.INSTAGRAM_APP_ID!;
  const redirectUri = "https://false-vintage-flea.glitch.me/instagram/callback";

  const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;

  res.redirect(instagramAuthUrl);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Code not found in query.");

  try {
    const response = await axios.post("https://api.instagram.com/oauth/access_token", null, {
      params: {
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: "https://false-vintage-flea.glitch.me/instagram/callback",
        code: code,
      },
    });

    const { access_token, user_id } = response.data;

    res.json({ access_token, user_id });

  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Failed to exchange code for access token.");
  }
});



export default router;
