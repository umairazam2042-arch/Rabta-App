// App ka naam sirf yahan se badlo
export const APP_NAME = 'Rabta'

// Backend ka address. Vercel par VITE_API_URL se aata hai, local par fallback.
export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/auth'

// Socket.io ka address: sirf backend ka origin (path ke bina)
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || new URL(API_URL, window.location.origin).origin