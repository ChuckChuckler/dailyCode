import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      "/signup":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/getUser":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/instantiateUser":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/getPfp":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/login":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
    }
  }
})
