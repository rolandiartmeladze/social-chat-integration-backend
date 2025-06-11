import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import './auth/googleAuth';

import messengerRouter from "./routes/messenger";
import instagramRouter from "./routes/instagram";
import telegramRouter from "./routes/telegram";
import conversations from "./routes/conversations"
import passport from "passport";
import session from "express-session";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/messenger", messengerRouter);
app.use("/instagram", instagramRouter);
app.use('/telegram', telegramRouter);
app.use('/conversations', conversations);

app.get("/", (_req, res) => {
  res.send("გამარჯობა  მოგესალმებით Backend სერვერიდან რომელიც აბრუნებს შეტყობინებებს და მესენჯერ, ინსტაგრამ, ტელეგრამ  ჩათებიდან და საშუალებას აძლებს მომხმარებელს გაგზავნოს შესაბამისი მოთხოვნა გვერდზე --  TypeScript + Node.js app.");
});

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(session({

  secret: process.env.COOKIE_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // coming soon
    httpOnly: true,
    sameSite: 'none'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: true
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

app.get('/api/protected', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json({ user: req.user });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
