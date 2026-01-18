import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE || 'https://skillpilot.com'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        includeAssets: ['favicon/favicon.ico', 'favicon/apple-touch-icon.png', 'favicon/favicon.svg'],
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          // Exclude patterns from service worker navigation caching
          // This ensures OAuth redirect to /curricula makes a real network request
          navigateFallbackDenylist: [
            /^\/.*\.pdf$/,
            /^\/curricula\?auth_success/,
            /^\/oauth2/,
            /^\/login/
          ]
        },
        manifest: {
          name: 'SkillPilot',
          short_name: 'SkillPilot',
          description: 'Your personal AI learning companion',
          theme_color: '#0f172a',
          icons: [
            {
              src: '/favicon/web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/favicon/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/oauth2': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/login': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: '../backend/src/main/resources/static',
      emptyOutDir: true,

    },
  }
})
