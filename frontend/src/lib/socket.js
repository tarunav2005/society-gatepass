import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (accessToken) => {
  if (socket?.connected) return socket;

  socket = io("https://society-gatepass-api.onrender.com", {
    auth: { token: accessToken },
    withCredentials: true,
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
