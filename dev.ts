import { app } from './api/index';
import http from 'http';

const PORT = process.env.PORT || 5000;

http.createServer(app).listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
