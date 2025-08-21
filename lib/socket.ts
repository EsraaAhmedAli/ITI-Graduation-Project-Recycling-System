// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  console.log('Token passed to socket:', token);
  if (socket) {
    console.log("🔄 Disconnecting existing socket for fresh connection");
    socket.disconnect();
    socket = null;
  }
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: {
        token,
      },
    transports: ["websocket", "polling"],
      withCredentials: true,
      timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,

    });

    socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO server");
    console.log("Socket ID:", socket?.id);
    console.log("Socket authenticated:", socket?.connected);
  });
;

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server");
    });

    socket.on("connect_error", (err: any) => {
      const message = String(err?.message || "");
      console.error("⚠️ Socket connection error:", message);
      console.error("Error details:", err);
      if (/blocked/i.test(message)) {
        if (typeof window !== "undefined") {
          alert("Your account is blocked due to repeated reports.");
          window.location.assign("/blocked");
        }
        socket?.disconnect();
        return;
      }
      // If authentication fails, try to reconnect with fresh token
      if (message.includes("Authentication") || message.includes("Invalid token")) {
        console.log("🔄 Authentication failed, will retry with fresh token");
      }
    });


    // Add error handling
    socket.on("error", (err) => {
      console.error("⚠️ Socket error:", err);
    });
  }

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
