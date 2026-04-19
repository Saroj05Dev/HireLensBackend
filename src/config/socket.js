import { Server } from "socket.io";

let io;

const initSocket = (httpServer) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:5174",
    ].filter(Boolean);

    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
                callback(new Error(`Socket CORS: origin ${origin} not allowed`));
            },
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected: ", socket.id);

        // Join organization room
        socket.on("join:organization", (organizationId) => {
            socket.join(`org:${organizationId}`);
            console.log(`Socket joined org:${organizationId}`);
        });

        socket.on("join:user", (userId) => {
            socket.join(`user:${userId}`);
            console.log(`Socket joined user:${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected: ", socket.id)
        });
    });

    return io;
}

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}

// Emit notification to specific user
export const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit("notification:new", notification);
    }
};

export default initSocket;