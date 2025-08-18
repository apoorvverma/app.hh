import { io, Socket } from "socket.io-client";

export function createSocket(userId: string, role: "rider" | "driver"): Socket {
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
  return io(url, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 500,
    query: {
      userId,
      role,
    },
    // reconnectionDelayMax: 3000,
    // timeout: 8000,
  });
}