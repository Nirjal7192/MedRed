import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Rewrite cookie domain so the browser accepts cookies
        // set by localhost:8000 when requests come through localhost:5173
        cookieDomainRewrite: 'localhost',
      }
    }
  }
})
