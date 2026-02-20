import { io, Socket } from "socket.io-client";
import { SOCKET_BASE_URL } from "@/lib/config";

export function createSocket(userId: string, role: "rider" | "driver"): Socket {
  return io(SOCKET_BASE_URL, {
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