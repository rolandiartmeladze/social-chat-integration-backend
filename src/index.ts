import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import './auth/googleAuth';

import { createServer } from "http";
import { initSocket } from "./socket";
import messengerRouter from "./routes/messenger";
import instagramRouter from "./routes/instagram";
import telegramRouter from "./routes/telegram";
import conversations from "./routes/conversations"
import passport from "passport";
import session from "express-session";
import authRouter from "./routes/auth";
import { connectDB } from './db';
import { Conversation } from './models/Conversation';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
initSocket(httpServer);

app.use(express.json());
app.use(bodyParser.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.set("trust proxy", 1);
app.use(session({

  secret: process.env.COOKIE_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/messenger", messengerRouter);
app.use("/instagram", instagramRouter);
app.use('/telegram', telegramRouter);
app.use('/conversations', conversations);
app.use('/auth', authRouter);


httpServer.listen(process.env.PORT || 3001, () =>
  console.log("Server listening")
);

(async () => {
  await connectDB();

  app.get("/", (_req, res) => {
    res.send("გამარჯობა  მოგესალმებით Backend სერვერიდან რომელიც აბრუნებს შეტყობინებებს და მესენჯერ, ინსტაგრამ, ტელეგრამ  ჩათებიდან და საშუალებას აძლებს მომხმარებელს გაგზავნოს შესაბამისი მოთხოვნა გვერდზე --  TypeScript + Node.js app.");
  });
})();



app.get('/test-conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find({});
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});