import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// El frontend llama a /api/... y Vite lo reenvía al backend (evita problemas de CORS en desarrollo).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:3000', rewrite: (p) => p.replace(/^\/api/, '') } },
  },
});
