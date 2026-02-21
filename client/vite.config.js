import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { 
    host: '0.0.0.0', // Listen on all network interfaces (IPv4 + IPv6)
    port: 3000,
    strictPort: true,
    open: false // start.bat will open the browser
  }
})
