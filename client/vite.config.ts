import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL สำหรับ production (ถ้าต้องการ host ใน subdirectory)
  base: '/',
  build: {
    // Output directory
    outDir: 'dist',
    // Copy public folder to dist
    copyPublicDir: true,
  },
  // Preview server สำหรับทดสอบ build
  preview: {
    port: 4173,
    host: true,
  },
})
