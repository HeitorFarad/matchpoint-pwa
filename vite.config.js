import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'MatchPoint',
        short_name: 'MatchPoint',
        description: 'Organize peladas e treinos fixos de futevôlei',
        theme_color: '#1db954',
        background_color: '#f5f5f5',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})