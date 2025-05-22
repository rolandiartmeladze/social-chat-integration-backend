import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import cors from 'cors';

import messangerRouter from './routes/messenger';

dotenv.config();

const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/messenger', messangerRouter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World From Server!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Webhook is listening', process.env.PORT);
});
