import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@supabase/')) return 'supabase';
          if (id.includes('@stripe/stripe-js')) return 'stripe';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react-router-dom') || id.includes('react-router')) return 'router';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
  server: {
    fs: {
      allow: [
        projectRoot,
        '/Users/sitter/manuhome',
        '/Users/sitter/.gemini'
      ]
    }
  }
})
