import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Treino · Futevôlei + Academia',
        short_name: 'Treino',
        description: 'Programa de 12 semanas com registro de cargas',
        lang: 'pt-BR',
        theme_color: '#22252b',
        background_color: '#f5f4f1',
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
      },
      workbox: {
        navigateFallback: '/index.html',
      },
    })
  ],
})
