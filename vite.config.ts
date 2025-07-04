import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    host: '0.0.0.0', // allows access from external networks
    port: 5174,
    cors:{
      origin:"https://pj660rl8-9091.inc1.devtunnels.ms",
      credentials:true
    },
    allowedHosts: true, // allow all external hosts including ngrok
  }
})