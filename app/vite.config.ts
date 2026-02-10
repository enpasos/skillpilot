import path from 'node:path'
import { promises as fs } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

const DECK_FILE_PATTERN = /_deck([._][a-z]{2})?\.json$/i
const APP_ROOT = process.cwd()
const REPO_ROOT = path.resolve(APP_ROOT, '..')
const CURRICULA_ROOT = path.resolve(REPO_ROOT, 'curricula')
const PUBLIC_DATA_ROOT = path.resolve(APP_ROOT, 'public', 'data')

const toPosixPath = (value: string): string => value.split(path.sep).join('/')

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

const isPathInside = (candidatePath: string, parentPath: string): boolean => {
  const relative = path.relative(parentPath, candidatePath)
  if (!relative) return true
  return !relative.startsWith('..') && !path.isAbsolute(relative)
}

const resolveDeckAbsolutePath = (candidatePath: string): string | null => {
  const sanitizedPath = candidatePath.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!sanitizedPath.startsWith('curricula/')) return null

  const absolutePath = path.resolve(REPO_ROOT, sanitizedPath)
  if (!isPathInside(absolutePath, CURRICULA_ROOT)) return null
  if (path.basename(path.dirname(absolutePath)) !== 'json') return null
  if (!DECK_FILE_PATTERN.test(path.basename(absolutePath))) return null
  return absolutePath
}

const collectDeckFiles = async (directory: string, result: string[]): Promise<void> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await collectDeckFiles(absolutePath, result)
      continue
    }

    if (!entry.isFile()) continue
    if (path.basename(path.dirname(absolutePath)) !== 'json') continue
    if (!DECK_FILE_PATTERN.test(entry.name)) continue
    if (!isPathInside(absolutePath, CURRICULA_ROOT)) continue

    const relativeToRepo = path.relative(REPO_ROOT, absolutePath)
    result.push(toPosixPath(relativeToRepo))
  }
}

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown): void => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const readJsonBody = async (req: IncomingMessage): Promise<unknown> => {
  const rawBody = await new Promise<string>((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk: string) => {
      body += chunk
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })

  if (!rawBody.trim()) return {}
  return JSON.parse(rawBody)
}

const deckEditorDevPlugin = {
  name: 'skillpilot-deck-editor-dev-api',
  apply: 'serve' as const,
  configureServer(server: ViteDevServer) {
    server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
      const requestUrl = new URL(req.url ?? '/', 'http://localhost')
      if (!requestUrl.pathname.startsWith('/__deck-editor')) {
        next()
        return
      }

      void (async () => {
        if (requestUrl.pathname === '/__deck-editor/list') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const files: string[] = []
          await collectDeckFiles(CURRICULA_ROOT, files)
          files.sort((left, right) => left.localeCompare(right))
          sendJson(res, 200, { files })
          return
        }

        if (requestUrl.pathname === '/__deck-editor/load') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const pathParam = requestUrl.searchParams.get('path') ?? ''
          const absolutePath = resolveDeckAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid deck path.' })
            return
          }

          const fileContent = await fs.readFile(absolutePath, 'utf8')
          const deck = JSON.parse(fileContent)
          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
            deck,
          })
          return
        }

        if (requestUrl.pathname === '/__deck-editor/save') {
          if (req.method !== 'PUT') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const payload = asRecord(await readJsonBody(req))
          const pathParam = typeof payload.path === 'string' ? payload.path : ''
          const absolutePath = resolveDeckAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid deck path.' })
            return
          }

          if (!Object.prototype.hasOwnProperty.call(payload, 'deck')) {
            sendJson(res, 400, { error: 'Missing deck payload.' })
            return
          }

          const serializedDeck = `${JSON.stringify(payload.deck, null, 2)}\n`
          await fs.writeFile(absolutePath, serializedDeck, 'utf8')

          await fs.mkdir(PUBLIC_DATA_ROOT, { recursive: true })
          const mirroredAbsolutePath = path.join(PUBLIC_DATA_ROOT, path.basename(absolutePath))
          await fs.copyFile(absolutePath, mirroredAbsolutePath)

          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
            mirroredPath: toPosixPath(path.relative(APP_ROOT, mirroredAbsolutePath)),
          })
          return
        }

        sendJson(res, 404, { error: 'Not found' })
      })().catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Deck editor request failed.'
        sendJson(res, 500, { error: message })
      })
    })
  },
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE || 'https://skillpilot.com'

  return {
    plugins: [
      react(),
      tailwindcss(),
      deckEditorDevPlugin,
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
            /^\/login/,
            /^\/robots\.txt$/,
            /^\/sitemap\.xml$/
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
