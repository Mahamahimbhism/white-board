import { io } from "socket.io-client";

let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000/", {
      auth: {
        token: localStorage.getItem("whiteboard_user_token")
      }
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = () => {
  disconnectSocket();
  return getSocket();
};

export default getSocket();
