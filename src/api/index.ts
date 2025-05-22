// /backend/api/index.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

import messangerRouter from '../routes/messenger';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/messenger', messangerRouter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World From Server!");
});

export default app;
