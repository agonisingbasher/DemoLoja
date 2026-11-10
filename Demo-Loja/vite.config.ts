import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // URL pública do GitHub Pages para este repositório.
  base: '/DemoLoja/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
