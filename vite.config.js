import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        '/Users/sitter/manuhome',
        '/Users/sitter/.gemini'
      ]
    }
  }
})
