export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hh-backend-claw-branch.onrender.com/"
).replace(/\/$/, "");

export const SOCKET_BASE_URL = (
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://hh-backend-claw-branch.onrender.com/"
).replace(/\/$/, "");
