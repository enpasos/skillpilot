import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// An isolated local entry: no production shell, curriculum plugins or API proxy.
export default defineConfig({
  root: fileURLToPath(new URL('..', import.meta.url)),
  appType: 'mpa',
  define: { 'import.meta.env.VITE_API_BASE': JSON.stringify('') },
  cacheDir: 'node_modules/.vite-learning-map',
  plugins: [react(), tailwindcss(), {
    name: 'learning-map-prototype-entry',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split('?')[0]
        if (pathname === '/' || pathname === '/index.html') {
          response.writeHead(302, { Location: '/prototypes/learning-map.html' })
          response.end()
          return
        }
        if (pathname === '/favicon.ico') {
          response.writeHead(204)
          response.end()
          return
        }
        next()
      })
    },
  }],
  optimizeDeps: { entries: ['prototypes/learning-map.html', 'prototypes/cockpit.html', 'prototypes/full-cockpit.html'] },
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
})
