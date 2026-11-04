const cors = require('cors');

//CORS_ORIGIN mein ek ya zyada origins comma se alag karke ho sakte hain
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Server-to-server ya Postman jaise requests ke liye origin nahi hota
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: ye origin allowed nahi hai'));
  },
  credentials: true,
});

module.exports = { allowedOrigins, corsMiddleware };