import app from '../api/index';
import { createServer, IncomingMessage, ServerResponse } from 'http';

const PORT = process.env.PORT || 5000;

export default (req: IncomingMessage, res: ServerResponse) => {
  app(req, res);
};