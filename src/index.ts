// [DEVELOPER REVIEW]
// პროექტის მთავარი entry point. აქ ხდება ძირითადი სერვისების ინიციალიზაცია და როუტინგის კონფიგურაცია.

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import MongoStore from "connect-mongo";
import './auth/googleAuth'; // [REVIEW] Google OAuth-ის კონფიგურაცია, ინიციალიზაცია მოდულურად გამოყოფილია, რაც კარგია.

import { createServer } from "http";
import { initSocket } from "./socket";
import messengerRouter from "./routes/messenger";
import instagramRouter from "./routes/instagram";
import telegramRouter from "./routes/telegram";
import conversations from "./routes/conversations"
import passport from "passport";
import session from "express-session";
import authRouter from "./routes/auth";
import { connectDB } from './util/db';

dotenv.config(); // [REVIEW] .env ფაილიდან კონფიგურაციის ჩატვირთვა საუკეთესო პრაქტიკაა.

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
initSocket(httpServer); // [REVIEW] Socket.io-ს ინიციალიზაცია ცალკე ფუნქციაშია, რაც არქიტექტურულად გამართულია.

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})); // [REVIEW] CORS-ის კონფიგურაცია დინამიურად .env-დან, რაც უსაფრთხოების და მოქნილობისთვის კარგია.

app.set("trust proxy", 1); // [REVIEW] აუცილებელია თუ იყენებ პროქსის (მაგ. Heroku, Vercel).

app.use(session({
  secret: process.env.COOKIE_SECRET as string,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl:  7 * 24 * 60 * 60 // 7 დღე
  }),
  cookie: {
    secure: true, // [REVIEW] მხოლოდ HTTPS-ზე მუშაობს, dev გარემოში შეიძლება პრობლემები გამოიწვიოს.
    httpOnly: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
})); // [REVIEW] session-ის კონფიგურაცია უსაფრთხოების საუკეთესო პრაქტიკებს მიყვება.

app.use(passport.initialize());
app.use(passport.session()); // [REVIEW] Passport-ის ინტეგრაცია session-თან სწორადაა გაკეთებული.

app.use("/messenger", messengerRouter);
app.use("/instagram", instagramRouter);
app.use('/telegram', telegramRouter);
app.use('/conversations', conversations);
app.use('/auth', authRouter); // [REVIEW] როუტერები მოდულებადაა გამოყოფილი, რაც კოდის სტრუქტურას აუმჯობესებს.

httpServer.listen(process.env.PORT || 3001, () =>
  console.log("Server listening")
); // [REVIEW] პორტის არჩევა .env-დან მოქნილი და სწორი მიდგომაა.

(async () => {
  await connectDB(); // [REVIEW] ბაზასთან დაკავშირება ასინქრონულად ხდება, რაც თავიდან იცილებს race condition-ებს.

  app.get("/", (_req, res) => {
    res.send("გამარჯობა  მოგესალმებით Backend სერვერიდან რომელიც აბრუნებს შეტყობინებებს და მესენჯერ, ინსტაგრამ, ტელეგრამ  ჩათებიდან და საშუალებას აძლევს მომხმარებელს გაგზავნოს შესაბამისი მოთხოვნა გვერდზე --  TypeScript + Node.js app.");
  });
})(); // [REVIEW] root როუტი ინიციალიზაციის შემდეგ ინახება, რაც შეიძლება გაუგებარი იყოს თუ connectDB ვერ შესრულდა.

// [SUMMARY]
// საერთო ჯამში, არქიტექტურა სწორია: მოდულური სტრუქტურა, უსაფრთხოების პარამეტრები, .env გამოყენება და სერვისების ინიციალიზაცია. 
// რეკომენდაცია: 
// - dev/prod გარემოსთვის session cookie-ს პარამეტრების დიფერენცირება.
// - body-parser-ის დუბლირების მოცილება.
// - ტესტირების როუტების dev-only რეჟიმში გადატანა.
// - root როუტის ინიციალიზაცია app.get("/", ...) პირდაპირი გამოძახებით, არა async ფუნქციის შიგნით.