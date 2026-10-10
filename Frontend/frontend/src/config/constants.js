// App ka naam sirf yahan se badlo
export const APP_NAME = "Rabta";

// Backend ka address (.env se aata hai)
export const API_URL = "http://localhost:3000/api/auth";
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/auth";
  // Socket.io ka address (backend ka wahi server, bina /api/v1 ke)
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || new URL(API_URL, window.location.origin).origin