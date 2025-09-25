import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration untuk project Absensi Dashboard
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,         // Port dev server
    open: true,         // Auto buka browser
  },
  resolve: {
    alias: {
      '@': '/src'       // Shortcut import '@/components/..'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
