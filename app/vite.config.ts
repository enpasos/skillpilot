import path from 'node:path'
import { promises as fs } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

const DECK_FILE_PATTERN = /_deck([._][a-z]{2})?\.json$/i
const LANDSCAPE_JSON_FILE_PATTERN = /\.json$/i
const APP_ROOT = process.cwd()
const REPO_ROOT = path.resolve(APP_ROOT, '..')
const CURRICULA_ROOT = path.resolve(REPO_ROOT, 'curricula')
const CANONICAL_GYMNASIUM_ROOT = path.resolve(CURRICULA_ROOT, 'DE', 'Gymnasium', 'canonical')
const COMPOSITION_VIEW_ROOT = path.resolve(CURRICULA_ROOT, 'DE', 'Gymnasium', 'composition-views')
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

const resolveLandscapeAbsolutePath = (candidatePath: string): string | null => {
  const sanitizedPath = candidatePath.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!sanitizedPath.startsWith('curricula/')) return null

  const absolutePath = path.resolve(REPO_ROOT, sanitizedPath)
  if (!isPathInside(absolutePath, CURRICULA_ROOT)) return null
  if (path.basename(path.dirname(absolutePath)) !== 'json') return null

  const fileName = path.basename(absolutePath)
  if (!LANDSCAPE_JSON_FILE_PATTERN.test(fileName)) return null
  if (DECK_FILE_PATTERN.test(fileName)) return null

  return absolutePath
}

const resolveCanonicalLandscapeAbsolutePath = (candidatePath: string): string | null => {
  const sanitizedPath = candidatePath.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!sanitizedPath.startsWith('curricula/DE/Gymnasium/canonical/')) return null

  const absolutePath = path.resolve(REPO_ROOT, sanitizedPath)
  if (!isPathInside(absolutePath, CANONICAL_GYMNASIUM_ROOT)) return null

  const fileName = path.basename(absolutePath)
  if (!LANDSCAPE_JSON_FILE_PATTERN.test(fileName)) return null
  if (DECK_FILE_PATTERN.test(fileName)) return null

  return absolutePath
}

const resolveCompositionViewAbsolutePath = (candidatePath: string): string | null => {
  const sanitizedPath = candidatePath.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!sanitizedPath.startsWith('curricula/DE/Gymnasium/composition-views/')) return null

  const absolutePath = path.resolve(REPO_ROOT, sanitizedPath)
  if (!isPathInside(absolutePath, COMPOSITION_VIEW_ROOT)) return null
  if (!/\.view\.json$/i.test(path.basename(absolutePath))) return null

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

const isLandscapePayload = (value: unknown): boolean => {
  const record = asRecord(value)
  return typeof record.landscapeId === 'string' && Array.isArray(record.goals)
}

const isCompositionViewPayload = (value: unknown): boolean => {
  const record = asRecord(value)
  return typeof record.viewId === 'string' && typeof record.landscapeId === 'string' && Array.isArray(record.rootNodes)
}

const normalizeScopeValue = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const normalizeCompositionScope = (rawScope: unknown): Record<string, string> => {
  const record = asRecord(rawScope)
  const normalized: Record<string, string> = {}
  Object.entries(record).forEach(([key, value]) => {
    const text = normalizeScopeValue(value)
    if (!text) return
    normalized[key] = text
  })
  return normalized
}

const compositionScopeMatches = (
  viewScope: Record<string, string>,
  requestedScope: Record<string, string>,
): boolean => {
  if (Object.keys(viewScope).length === 0) {
    return Object.keys(requestedScope).length === 0
  }

  return Object.entries(viewScope).every(([key, value]) => {
    const requestedValue = requestedScope[key]
    return requestedValue && requestedValue.toUpperCase() === value.toUpperCase()
  })
}

const findMatchingCompositionView = async (
  landscapeId: string,
  requestedScope: Record<string, string>,
): Promise<Record<string, unknown> | null> => {
  const files: string[] = []
  try {
    await collectCompositionViewFiles(COMPOSITION_VIEW_ROOT, files)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('ENOENT')) throw error
  }

  const matches: Array<{ view: Record<string, unknown>; scopeSize: number; viewId: string }> = []

  for (const relativePath of files) {
    const absolutePath = path.resolve(REPO_ROOT, relativePath)
    const fileContent = await fs.readFile(absolutePath, 'utf8')
    const parsed = JSON.parse(fileContent)
    if (!isCompositionViewPayload(parsed)) continue
    if (normalizeScopeValue(parsed.landscapeId).toUpperCase() !== normalizeScopeValue(landscapeId).toUpperCase()) continue

    const scope = normalizeCompositionScope(parsed.scope)
    if (!compositionScopeMatches(scope, requestedScope)) continue

    matches.push({
      view: parsed,
      scopeSize: Object.keys(scope).length,
      viewId: normalizeScopeValue(parsed.viewId),
    })
  }

  matches.sort((left, right) => {
    if (right.scopeSize !== left.scopeSize) {
      return right.scopeSize - left.scopeSize
    }
    return left.viewId.localeCompare(right.viewId)
  })

  return matches[0]?.view ?? null
}

const collectLandscapeFiles = async (directory: string, result: string[]): Promise<void> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await collectLandscapeFiles(absolutePath, result)
      continue
    }

    if (!entry.isFile()) continue
    if (path.basename(path.dirname(absolutePath)) !== 'json') continue
    if (!LANDSCAPE_JSON_FILE_PATTERN.test(entry.name)) continue
    if (DECK_FILE_PATTERN.test(entry.name)) continue
    if (!isPathInside(absolutePath, CURRICULA_ROOT)) continue

    try {
      const content = await fs.readFile(absolutePath, 'utf8')
      const parsed = JSON.parse(content)
      if (!isLandscapePayload(parsed)) continue
    } catch {
      continue
    }

    const relativeToRepo = path.relative(REPO_ROOT, absolutePath)
    result.push(toPosixPath(relativeToRepo))
  }
}

const collectCanonicalLandscapeFiles = async (directory: string, result: string[]): Promise<void> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await collectCanonicalLandscapeFiles(absolutePath, result)
      continue
    }

    if (!entry.isFile()) continue
    if (!LANDSCAPE_JSON_FILE_PATTERN.test(entry.name)) continue
    if (DECK_FILE_PATTERN.test(entry.name)) continue
    if (!isPathInside(absolutePath, CANONICAL_GYMNASIUM_ROOT)) continue

    try {
      const content = await fs.readFile(absolutePath, 'utf8')
      const parsed = JSON.parse(content)
      if (!isLandscapePayload(parsed)) continue
    } catch {
      continue
    }

    const relativeToRepo = path.relative(REPO_ROOT, absolutePath)
    result.push(toPosixPath(relativeToRepo))
  }
}

const collectCompositionViewFiles = async (directory: string, result: string[]): Promise<void> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await collectCompositionViewFiles(absolutePath, result)
      continue
    }

    if (!entry.isFile()) continue
    if (!/\.view\.json$/i.test(entry.name)) continue
    if (!isPathInside(absolutePath, COMPOSITION_VIEW_ROOT)) continue

    const relativeToRepo = path.relative(REPO_ROOT, absolutePath)
    result.push(toPosixPath(relativeToRepo))
  }
}

const readCanonicalLandscapeSummaries = async (): Promise<Array<{ path: string, landscapeId: string, title: string }>> => {
  const files: string[] = []
  await collectCanonicalLandscapeFiles(CANONICAL_GYMNASIUM_ROOT, files)
  files.sort((left, right) => left.localeCompare(right))

  const summaries = await Promise.all(files.map(async (relativePath) => {
    const absolutePath = path.resolve(REPO_ROOT, relativePath)
    const content = await fs.readFile(absolutePath, 'utf8')
    const parsed = JSON.parse(content)
    if (!isLandscapePayload(parsed)) return null
    return {
      path: relativePath,
      landscapeId: typeof parsed.landscapeId === 'string' ? parsed.landscapeId : '',
      title: typeof parsed.title === 'string' ? parsed.title : relativePath,
    }
  }))

  return summaries.filter((entry): entry is { path: string, landscapeId: string, title: string } => entry !== null)
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
      if (
        !requestUrl.pathname.startsWith('/__deck-editor')
        && !requestUrl.pathname.startsWith('/__graph-editor')
        && !requestUrl.pathname.startsWith('/__canonical-cluster-editor')
        && !requestUrl.pathname.startsWith('/__composition-view-editor')
        && !requestUrl.pathname.startsWith('/__authoring')
        && requestUrl.pathname !== '/api/ui/composition-views/match'
      ) {
        next()
        return
      }

      void (async () => {
        if (requestUrl.pathname === '/__canonical-cluster-editor/list') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const files: string[] = []
          await collectCanonicalLandscapeFiles(CANONICAL_GYMNASIUM_ROOT, files)
          files.sort((left, right) => left.localeCompare(right))
          sendJson(res, 200, { files })
          return
        }

        if (requestUrl.pathname === '/__authoring/canonical-landscapes') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const landscapes = await readCanonicalLandscapeSummaries()
          sendJson(res, 200, { landscapes })
          return
        }

        if (requestUrl.pathname === '/__canonical-cluster-editor/load') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const pathParam = requestUrl.searchParams.get('path') ?? ''
          const absolutePath = resolveCanonicalLandscapeAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid canonical landscape path.' })
            return
          }

          const fileContent = await fs.readFile(absolutePath, 'utf8')
          const landscape = JSON.parse(fileContent)
          if (!isLandscapePayload(landscape)) {
            sendJson(res, 400, { error: 'File is not a valid landscape JSON.' })
            return
          }

          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
            landscape,
          })
          return
        }

        if (requestUrl.pathname === '/__canonical-cluster-editor/save') {
          if (req.method !== 'PUT') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const payload = asRecord(await readJsonBody(req))
          const pathParam = typeof payload.path === 'string' ? payload.path : ''
          const absolutePath = resolveCanonicalLandscapeAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid canonical landscape path.' })
            return
          }

          if (!Object.prototype.hasOwnProperty.call(payload, 'landscape')) {
            sendJson(res, 400, { error: 'Missing landscape payload.' })
            return
          }

          const landscapePayload = payload.landscape
          if (!isLandscapePayload(landscapePayload)) {
            sendJson(res, 400, { error: 'Invalid landscape payload.' })
            return
          }

          const serializedLandscape = `${JSON.stringify(landscapePayload, null, 2)}\n`
          await fs.writeFile(absolutePath, serializedLandscape, 'utf8')

          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
          })
          return
        }

        if (requestUrl.pathname === '/__composition-view-editor/list') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const files: string[] = []
          try {
            await collectCompositionViewFiles(COMPOSITION_VIEW_ROOT, files)
          } catch (error) {
            const message = error instanceof Error ? error.message : ''
            if (!message.includes('ENOENT')) throw error
          }
          files.sort((left, right) => left.localeCompare(right))
          sendJson(res, 200, { files })
          return
        }

        if (requestUrl.pathname === '/__composition-view-editor/load') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const pathParam = requestUrl.searchParams.get('path') ?? ''
          const absolutePath = resolveCompositionViewAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid composition view path.' })
            return
          }

          const fileContent = await fs.readFile(absolutePath, 'utf8')
          const view = JSON.parse(fileContent)
          if (!isCompositionViewPayload(view)) {
            sendJson(res, 400, { error: 'File is not a valid composition view JSON.' })
            return
          }

          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
            view,
          })
          return
        }

        if (requestUrl.pathname === '/__composition-view-editor/save') {
          if (req.method !== 'PUT') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const payload = asRecord(await readJsonBody(req))
          const pathParam = typeof payload.path === 'string' ? payload.path : ''
          const absolutePath = resolveCompositionViewAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid composition view path.' })
            return
          }

          if (!Object.prototype.hasOwnProperty.call(payload, 'view')) {
            sendJson(res, 400, { error: 'Missing composition view payload.' })
            return
          }

          const viewPayload = payload.view
          if (!isCompositionViewPayload(viewPayload)) {
            sendJson(res, 400, { error: 'Invalid composition view payload.' })
            return
          }

          await fs.mkdir(path.dirname(absolutePath), { recursive: true })
          const serializedView = `${JSON.stringify(viewPayload, null, 2)}\n`
          await fs.writeFile(absolutePath, serializedView, 'utf8')

          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
          })
          return
        }

        if (requestUrl.pathname === '/api/ui/composition-views/match') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const landscapeId = requestUrl.searchParams.get('landscapeId') ?? ''
          const requestedScope = normalizeCompositionScope({
            schoolForm: requestUrl.searchParams.get('schoolForm'),
            jurisdiction: requestUrl.searchParams.get('jurisdiction'),
            stage: requestUrl.searchParams.get('stage'),
            courseProfile: requestUrl.searchParams.get('courseProfile'),
          })
          const match = await findMatchingCompositionView(landscapeId, requestedScope)
          if (!match) {
            res.statusCode = 204
            res.end()
            return
          }

          sendJson(res, 200, match)
          return
        }

        if (requestUrl.pathname === '/__graph-editor/list') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const files: string[] = []
          await collectLandscapeFiles(CURRICULA_ROOT, files)
          files.sort((left, right) => left.localeCompare(right))
          sendJson(res, 200, { files })
          return
        }

        if (requestUrl.pathname === '/__graph-editor/load') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const pathParam = requestUrl.searchParams.get('path') ?? ''
          const absolutePath = resolveLandscapeAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid landscape path.' })
            return
          }

          const fileContent = await fs.readFile(absolutePath, 'utf8')
          const landscape = JSON.parse(fileContent)
          if (!isLandscapePayload(landscape)) {
            sendJson(res, 400, { error: 'File is not a valid landscape JSON.' })
            return
          }

          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
            landscape,
          })
          return
        }

        if (requestUrl.pathname === '/__graph-editor/save') {
          if (req.method !== 'PUT') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const payload = asRecord(await readJsonBody(req))
          const pathParam = typeof payload.path === 'string' ? payload.path : ''
          const absolutePath = resolveLandscapeAbsolutePath(pathParam)
          if (!absolutePath) {
            sendJson(res, 400, { error: 'Invalid landscape path.' })
            return
          }

          if (!Object.prototype.hasOwnProperty.call(payload, 'landscape')) {
            sendJson(res, 400, { error: 'Missing landscape payload.' })
            return
          }

          const landscapePayload = payload.landscape
          if (!isLandscapePayload(landscapePayload)) {
            sendJson(res, 400, { error: 'Invalid landscape payload.' })
            return
          }

          const serializedLandscape = `${JSON.stringify(landscapePayload, null, 2)}\n`
          await fs.writeFile(absolutePath, serializedLandscape, 'utf8')

          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
          })
          return
        }

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
        const message = error instanceof Error ? error.message : 'Editor request failed.'
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
          maximumFileSizeToCacheInBytes: 5000000,
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
