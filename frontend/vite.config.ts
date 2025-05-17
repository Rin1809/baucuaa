import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // proxy: { // Bỏ proxy nếu dùng full URL trong apiService và backend có CORS
    //   '/api': {
    //     target: 'http://localhost:3001', 
    //     changeOrigin: true,
    //   }
    // }
  }
})