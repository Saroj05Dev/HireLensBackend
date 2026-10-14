import http from "http";
import app from "./app.js";
import { SERVER_CONFIG } from "./config/server.config.js";
import connectDB from "./config/db.config.js";
import { connectRedis } from "./config/redis.js";
import initSocket from "./config/socket.js";

const server = http.createServer(app);

initSocket(server);

async function startServer() {
  try {
    await Promise.all([connectDB(), connectRedis()]);

    server.listen(SERVER_CONFIG.PORT, () => {
      console.log(`Server is running on port ${SERVER_CONFIG.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
