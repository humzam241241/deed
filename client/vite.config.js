import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // Ensures all asset paths resolve from root in production (Vercel)
  server: { 
    host: '0.0.0.0', // Listen on all network interfaces (IPv4 + IPv6)
    port: 3000,
    strictPort: true,
    open: false // start.bat will open the browser
  },
  build: {
    rollupOptions: {
      output: {
        // Split Three.js into its own chunk so the main bundle stays small
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
