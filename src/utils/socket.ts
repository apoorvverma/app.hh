import { io, Socket } from "socket.io-client";

export function createSocket(userId: string, role: "rider" | "driver"): Socket {
  return io("http://localhost:4000", {
    query: { userId, role }
  });
}
