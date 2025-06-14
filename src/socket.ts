import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: IOServer;

export const initSocket = (server: HTTPServer) => {
  io = new IOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New socket client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};

export { io };
