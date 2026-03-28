import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/nlk': {
        target: 'https://nl.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nlk/, '')
      },
      '/naver-api': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/naver-api/, '')
      }
    }
  }
})
