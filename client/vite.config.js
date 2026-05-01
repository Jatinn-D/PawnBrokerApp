import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        
        // ADDED /welcome TO THE DENYLIST
        navigateFallbackDenylist: [
          /^\/api/,      // Ignore all backend calls
          /^\/welcome/   // Ignore the welcome page so client-side redirects work
        ], 
      },
      manifest: {
        name: 'Asha Pawn Broker',
        short_name: 'Suvarna',
        description: 'Pledge Management System',
        theme_color: '#1a5276',
        background_color: '#FAF9F6',
        display: 'standalone',
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})