import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export function ensureSocketConnection() {
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function registerSocketUser(user) {
  if (!user?.id) {
    return null;
  }

  const activeSocket = ensureSocketConnection();
  activeSocket.emit("user:join", {
    userId: user.id,
    role: user.role,
  });

  return activeSocket;
}

export function subscribeToSocketEvent(eventName, handler) {
  const activeSocket = ensureSocketConnection();
  activeSocket.on(eventName, handler);

  return () => {
    activeSocket.off(eventName, handler);
  };
}
