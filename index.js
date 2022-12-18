import { Server } from "socket.io";
import "./dotenv.js";

const io = new Server(8800, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  /* Add new user */
  socket.on("new-user-add", (newUserId) => {
    // If a user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
    }

    // Send all active users to a new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    // Remove user from active users
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);

    // Send all active users to all users
    io.emit("get-users", activeUsers);
  });

  /* Send message to a specific user */
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);

    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });
});
