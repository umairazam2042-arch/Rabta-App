// Sab se pehle .env load karo
require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/db/db");
const { initSocket } = require("./src/sockets");
const { startAutoDeleteJob } = require("./src/jobs/autoDelete.job");

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  // Express ko HTTP server mein lapeto taake Socket.io usi port par chale
  const server = http.createServer(app);
  const io = initSocket(server);
  app.set("io", io);

  // Auto-delete ka background check shuru karo
  startAutoDeleteJob();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});