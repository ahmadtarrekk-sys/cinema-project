import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
    auth: { token },
    autoConnect: true,
  });
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn("Socket not initialized with token yet.");
  }
  return socket;
};

