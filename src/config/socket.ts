import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | undefined;

const initSocket = (httpServer: HttpServer): Server => {
  const allowedOrigins: string[] = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
  ].filter((origin): origin is string => Boolean(origin));

  io = new Server(httpServer, {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error(`Socket CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join:organization", (organizationId: string) => {
      socket.join(`org:${organizationId}`);
      console.log(`Socket joined org:${organizationId}`);
    });

    socket.on("join:user", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`Socket joined user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitNotification = (userId: string, notification: unknown): void => {
  if (io) {
    io.to(`user:${userId}`).emit("notification:new", notification);
  }
};

export default initSocket;