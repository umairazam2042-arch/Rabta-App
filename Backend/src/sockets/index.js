const { Server } = require("socket.io");
const { parse } = require("cookie");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN, credentials: true },
  });

  // Connect hone se pehle login check (cookie se)
  io.use(async (socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || "");
      const token = cookies.accessToken;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id).select("_id username isLoggedIn");
      if (!user || !user.isLoggedIn) return next(new Error("Unauthorized"));

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Har user ka apna room: us ki saari tabs isi mein hoti hain
    socket.join(`user:${socket.user._id}`);
  });

  return io;
};

module.exports = { initSocket };