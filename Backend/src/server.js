const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_user_room", ({ tenantId, userId }) => {
    socket.join(`tenant:${tenantId}:user:${userId}`);
  });

  socket.on("join_tenant_admin_room", ({ tenantId }) => {
    socket.join(`tenant:${tenantId}:admins`);
  });

  socket.on("join_conversation", ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});