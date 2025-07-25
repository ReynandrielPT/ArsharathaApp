import { io, Socket } from 'socket.io-client';

/**
 * A singleton instance of the Socket.IO client.
 * This ensures that only one connection is established and reused throughout the application.
 */
let socket: Socket;

/**
 * Initializes and/or returns the singleton Socket.IO client instance.
 * If the socket is not already connected, it creates a new connection
 * and sets up default event listeners for connect, error, and disconnect events.
 *
 * @returns {Socket} The singleton Socket.IO client instance.
 */
export const getSocket = (): Socket => {

  if (!socket) {

    const token = localStorage.getItem('token');
    

    socket = io('/', {

      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  return socket;
};
