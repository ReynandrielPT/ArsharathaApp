import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For more information on Vite configuration, visit: https://vitejs.dev/config/

export default defineConfig({
  // An array of plugins to use.
  plugins: [
    // Enables React support, including Fast Refresh (HMR), JSX transform, etc.
    react()
  ],
  
  // Configuration for the development server.
  server: {
    // Configure custom proxy rules for the dev server.
    // This is useful for forwarding certain requests to a separate backend server
    // to avoid CORS issues during development.
    proxy: {
      // Proxy all requests starting with '/api' to the backend service.
      // This is intended for use within a Docker Compose environment where 'backend' is a resolvable service name.
      '/api': {
        target: 'http://backend:5000', // The backend server address.
        changeOrigin: true, // Needed for virtual hosted sites.
        secure: false, // Don't verify SSL certificate for the target.
      },
      // Note: The '/socket.io' proxy is handled by the Nginx container in the Docker setup,
      // but for local development outside of Docker, you might need to add it here as well.
    },
  },
});