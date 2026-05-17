import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { createServer } from 'http';
import { initSocket } from './config/socket';
import { testDBConnection } from './config/db';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initSocket(httpServer);

const start = async () => {
  await testDBConnection();
  httpServer.listen(PORT, () => {
    console.log(`\n🌿 AgriFlow Backend running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}\n`);
  });
};

start();
