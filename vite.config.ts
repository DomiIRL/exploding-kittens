import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const getAllowedHosts = (env: string | undefined): string[] => {
  if (!env) return [];
  return env.split(',').map(h => h.trim());
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: process.env.VITE_HOST || 'localhost',
    port: parseInt(process.env.VITE_PORT || '5173'),
    allowedHosts: getAllowedHosts(process.env.VITE_ALLOWED_HOSTS),
  },
});

