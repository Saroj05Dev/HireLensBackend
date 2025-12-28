import { Server } from "socket.io";

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
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

export default initSocket;