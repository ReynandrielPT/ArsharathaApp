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
  // If the socket instance doesn't exist, create it.
  if (!socket) {
    // Retrieve the authentication token from local storage.
    const token = localStorage.getItem('token');
    
    // Establish the connection.
    // The first argument '/' connects to the same host that serves the page.
    // The commented out line is for connecting to a local development server directly.
    socket = io('/', {
    // socket = io('http://localhost:5000', {
      // Send the authentication token with the connection request.
      auth: {
        token: token
      }
    });

    // --- Default Event Listeners ---

    // Log a message when the connection is successfully established.
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    // Log any connection errors to the console.
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Log a message when the socket disconnects.
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  
  // Return the existing or newly created socket instance.
  return socket;
};
