import { Socket } from "socket.io-client";

export interface UserLocation {
  userId: string;
  lat: number;
  lng: number;
}

export function emitLocationUpdate(socket: Socket, lat: number, lng: number) {
  socket.emit("location:update", { lat, lng });
}

export function registerUser(socket: Socket, userId: string, role: "driver" | "rider", lat: number, lng: number) {
  socket.emit("user:register", { userId, role, lat, lng });
}
