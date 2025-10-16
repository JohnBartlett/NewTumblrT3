import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Listen on all network interfaces (Tailscale, WiFi, localhost)
    allowedHosts: [
      '.loca.lt',
      '.ngrok-free.app',
      '.ngrok.io',
      'localhost',
      '100.120.207.84', // Tailscale IP
    ],
  },
});