import { API_BASE_URL } from "./config";

type Role = "rider" | "driver";

function getUserId() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userId") || "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const userId = getUserId();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init?.headers || {}),
  };
  if (userId) {
    (headers as Record<string, string>)["x-user-id"] = userId;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

export function login(displayName: string, role: Role) {
  return request<{ userId: string; role: Role }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ displayName, role }),
  });
}

export function updateMyLocation(lat: number, lng: number) {
  return request<{ ok: boolean }>("/api/auth/me/location", {
    method: "POST",
    body: JSON.stringify({ lat, lng }),
  });
}

export function createRideRequest(payload: {
  pickup: { lat: number; lng: number; address?: string };
  dropoff: { lat: number; lng: number; address?: string };
}) {
  return request("/api/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface RideRequest {
  id: string;
  riderId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  status: string;
}

export interface Ride {
  id: string;
  riderId?: string;
  driverId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  status: string;
}

export function listMyRequests() {
  return request<RideRequest[]>("/api/requests", { method: "GET" });
}

export function listMyRides(role: Role) {
  return request<Ride[]>(`/api/rides?role=${role}`, { method: "GET" });
}

export function acceptRequest(requestId: string) {
  return request<Ride>(`/api/rides/accept/${requestId}`, {
    method: "POST",
  });
}

export function updateRideStatus(rideId: string, next: "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  return request<{ ok: boolean; next: string }>(`/api/rides/${rideId}/status`, {
    method: "POST",
    body: JSON.stringify({ next }),
  });
}
