import path from 'path';
import { defineConfig, loadEnv } from 'vite';
<<<<<<< HEAD
import react from '@vitejs/plugin-react';
=======
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
<<<<<<< HEAD
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_API_KEY)
=======
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
