import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const getAllowedHosts = (env: string | undefined): string[] | true => {
  if (!env || env === '*') return true;
  return env.split(',').map(h => h.trim());
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || '0.0.0.0',
    port: parseInt(process.env.VITE_PORT || '5173'),
    allowedHosts: getAllowedHosts(process.env.VITE_ALLOWED_HOSTS),
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
  },
});
