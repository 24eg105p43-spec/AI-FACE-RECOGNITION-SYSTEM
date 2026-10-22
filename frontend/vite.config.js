import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/register-student': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/generate-qr': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/scan-face': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/attendance-log': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/timetable': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
