import express from 'express';
import { SERVER_CONFIG } from './config/server.config.js';
import connectDB from './config/db.config.js';
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Hire Lens Backend!');
});

app.listen(SERVER_CONFIG.PORT, async () => {
  console.log(`Server is running on port ${SERVER_CONFIG.PORT}`);
  await connectDB();
});