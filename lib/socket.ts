import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  console.log('🔑 Token passed to socket:', token ? `${token.substring(0, 20)}...` : 'none');
  
  // Always create a fresh connection like in React Native
  if (socket) {
    console.log("🔄 Disconnecting existing socket for fresh connection");
    socket.disconnect();
    socket = null;
  }

  console.log("🔌 Creating new socket connection to http://localhost:5000");
  
  socket = io("https://recycling-backend-2vxx.onrender.com", {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    withCredentials: true,
    timeout: 15000, // Match React Native timeout
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 5000, // Match React Native delay
    forceNew: true, // Force new connection like React Native behavior
  });

  socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO server");
    console.log("Socket ID:", socket?.id);
    console.log("Socket authenticated:", socket?.connected);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected from Socket.IO server. Reason:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("⚠️ Socket connection error:", err.message);
    console.error("Error details:", err);
    
    // If authentication fails, try to reconnect with fresh token
    if (err.message.includes("Authentication") || err.message.includes("Invalid token")) {
      console.log("🔄 Authentication failed, will retry with fresh token");
    }
  });

  socket.on("error", (err) => {
    console.error("⚠️ Socket error:", err);
  });

  // Add pong handler for heartbeat like in React Native
  socket.on("pong", (data) => {
    console.log("🏓 Pong received from server:", data);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🧹 Manually disconnecting socket");
    socket.disconnect();
    socket = null;
  }
};