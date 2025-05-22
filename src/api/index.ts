import express from 'express';
import messangerRouter from '../routes/messenger';

const app = express();
app.use(express.json());

app.use('/messenger', messangerRouter);

export default app;
