const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const postRoutes = require("./routes/post.routes");
const profileRoutes = require("./routes/profile.routes");
const adminRoutes = require("./routes/admin.routes");
const shotRoutes = require("./routes/shot.routes");
const statusRoutes = require("./routes/status.routes");
const messageRoutes = require("./routes/message.routes");

const userRoutes = require("./routes/user.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "16kb"
}));
app.use(cookieParser());

// Routes
app.use("/api/auth/users", userRoutes);
app.use("/api/auth/admin", adminRoutes);
app.use("/api/auth/posts", postRoutes);
app.use("/api/auth/profile", profileRoutes);
app.use("/api/auth/shots", shotRoutes);
app.use("/api/auth/statuses", statusRoutes);
app.use("/api/auth/messages", messageRoutes);

// Error handlers — routes ke BAAD
app.use(notFound);
app.use(errorHandler);

module.exports = app;