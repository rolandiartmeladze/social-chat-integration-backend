import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import messengerRouter from "./routes/messenger";
import instagramRouter from "./routes/instagram";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/messenger", messengerRouter);
app.use("/instagram", instagramRouter);

app.get("/", (_req, res) => {
  res.send("გამარჯობა Glitch-დან! This is a TypeScript + Node.js app.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
