// /backend/api/index.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

import { VercelRequest, VercelResponse } from '@vercel/node';

import messangerRouter from '../src/routes/messenger';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/messenger', messangerRouter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World From Server!");
});

app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from Express!' });
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ message: "Hello from Vercel serverless!" });
}

export { app };