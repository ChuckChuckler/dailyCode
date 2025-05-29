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
      "/instantiateUser":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/getUserInfo":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/login":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/createProject":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/populate":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/updateVotes":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/fetchProject":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/comment":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/fetchProfile":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/updateStatus":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      },
      "/sendEmail":{
        target: "http://localhost:3000/",
        changeOrigin: true,
        secure: false
      }
    }
  }
})
