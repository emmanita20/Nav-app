import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) this.socket = io(SOCKET_URL);
  }

  on(event, cb) {
    this.socket?.on(event, cb);
  }

  off(event) {
    this.socket?.off(event);
  }

  emit(event, payload) {
    this.socket?.emit(event, payload);
  }
}

export default new SocketService();
