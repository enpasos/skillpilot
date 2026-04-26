import { createHash } from 'node:crypto'
import path from 'node:path'
import { existsSync, promises as fs } from 'node:fs'
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
const SEMANTIC_ATOMICITY_ROOT = path.resolve(CURRICULA_ROOT, 'DE', 'Gymnasium', 'quality', 'semantic-atomicity')
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

const resolveSemanticAtomicityConfigAbsolutePath = (candidatePath: string): string | null => {
  const sanitizedPath = candidatePath.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!sanitizedPath.startsWith('curricula/DE/Gymnasium/quality/semantic-atomicity/')) return null

  const absolutePath = path.resolve(REPO_ROOT, sanitizedPath)
  if (!isPathInside(absolutePath, SEMANTIC_ATOMICITY_ROOT)) return null
  if (!/\.config\.json$/i.test(path.basename(absolutePath))) return null

  return absolutePath
}

const resolveSemanticAtomicityReviewAbsolutePath = (candidatePath: string): string | null => {
  const sanitizedPath = candidatePath.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!sanitizedPath.startsWith('curricula/DE/Gymnasium/quality/semantic-atomicity/')) return null

  const absolutePath = path.resolve(REPO_ROOT, sanitizedPath)
  if (!isPathInside(absolutePath, SEMANTIC_ATOMICITY_ROOT)) return null
  if (!/\.review\.jsonl$/i.test(path.basename(absolutePath))) return null

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

const collectSemanticAtomicityConfigFiles = async (directory: string, result: string[]): Promise<void> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await collectSemanticAtomicityConfigFiles(absolutePath, result)
      continue
    }

    if (!entry.isFile()) continue
    if (!/\.config\.json$/i.test(entry.name)) continue
    if (!isPathInside(absolutePath, SEMANTIC_ATOMICITY_ROOT)) continue

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

const isSemanticAtomicityConfigPayload = (value: unknown): boolean => {
  const record = asRecord(value)
  const scope = asRecord(record.scope)
  return record.schemaVersion === 1
    && typeof record.reviewId === 'string'
    && typeof record.ruleVersion === 'string'
    && typeof record.landscapeId === 'string'
    && typeof record.landscapePath === 'string'
    && typeof record.reviewPath === 'string'
    && Array.isArray(scope.rootGoalIds)
}

const normalizeScopeValue = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const normalizeSemanticText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const fingerprintSemanticGoal = (goal: Record<string, unknown>, ruleVersion: string): string => {
  const dimensionTags = asRecord(goal.dimensionTags)
  const payload = {
    ruleVersion,
    goalId: normalizeSemanticText(goal.id),
    shortKey: normalizeSemanticText(goal.shortKey),
    title: normalizeSemanticText(goal.title),
    titleEn: normalizeSemanticText(goal.titleEn),
    description: normalizeSemanticText(goal.description),
    descriptionEn: normalizeSemanticText(goal.descriptionEn),
    phase: normalizeSemanticText(dimensionTags.phase),
    area: normalizeSemanticText(dimensionTags.area),
    topicCode: normalizeSemanticText(dimensionTags.topicCode),
    nodeKind: normalizeSemanticText(goal.nodeKind),
  }
  return `sha256:${createHash('sha256').update(stableJson(payload)).digest('hex')}`
}

const parseJsonl = (raw: string): Record<string, unknown>[] => raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => JSON.parse(line) as Record<string, unknown>)

const serializeJsonl = (records: Record<string, unknown>[]): string =>
  `${records.map((record) => JSON.stringify(record)).join('\n')}\n`

const isLeafGoal = (goal: Record<string, unknown>): boolean =>
  !Array.isArray(goal.contains) || goal.contains.length === 0

const collectSemanticScopeGoalIds = (
  rootGoalIds: string[],
  goalById: Map<string, Record<string, unknown>>,
): Set<string> => {
  const result = new Set<string>()
  const visiting = new Set<string>()

  const visit = (goalId: string) => {
    if (result.has(goalId) || visiting.has(goalId)) return
    const goal = goalById.get(goalId)
    if (!goal) return
    visiting.add(goalId)
    result.add(goalId)
    for (const childId of Array.isArray(goal.contains) ? goal.contains : []) {
      if (typeof childId === 'string') visit(childId)
    }
    visiting.delete(goalId)
  }

  rootGoalIds.forEach(visit)
  return result
}

const normalizeSemanticReviewRecord = (
  rawRecord: Record<string, unknown>,
  context: {
    reviewId: string
    ruleVersion: string
    landscapeId: string
    goalId: string
    fingerprint: string
  },
): Record<string, unknown> => {
  const status = rawRecord.status === 'atomic' || rawRecord.status === 'non_atomic'
    ? rawRecord.status
    : 'needs_developer_review'
  return {
    schemaVersion: 1,
    reviewId: context.reviewId,
    ruleVersion: context.ruleVersion,
    landscapeId: context.landscapeId,
    goalId: context.goalId,
    fingerprint: context.fingerprint,
    status,
    semanticAtomic: status === 'atomic' ? true : status === 'non_atomic' ? false : null,
    reviewedAt: typeof rawRecord.reviewedAt === 'string' && rawRecord.reviewedAt.trim()
      ? rawRecord.reviewedAt.trim()
      : new Date().toISOString().slice(0, 10),
    reviewer: typeof rawRecord.reviewer === 'string' && rawRecord.reviewer.trim()
      ? rawRecord.reviewer.trim()
      : 'workbench',
    reason: typeof rawRecord.reason === 'string' ? rawRecord.reason.trim() : '',
    ...(typeof rawRecord.suggestedAction === 'string' && rawRecord.suggestedAction.trim()
      ? { suggestedAction: rawRecord.suggestedAction.trim() }
      : {}),
    ...(Array.isArray(rawRecord.suggestedSplit)
      ? { suggestedSplit: rawRecord.suggestedSplit.filter((value) => typeof value === 'string' && value.trim()) }
      : {}),
  }
}

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

const STAGE_SCOPE_KEY = 'stage'
const CROSS_STAGE_SCOPE = 'CROSSSTAGE'

const matchCompositionStageScope = (viewStage: string, requestedStage: string): 'exact' | 'fallback' | 'none' => {
  const normalizedViewStage = normalizeScopeValue(viewStage).toUpperCase()
  const normalizedRequestedStage = normalizeScopeValue(requestedStage).toUpperCase()

  if (!normalizedViewStage || !normalizedRequestedStage) {
    return 'none'
  }

  if (normalizedViewStage === normalizedRequestedStage) {
    return 'exact'
  }

  if (
    normalizedRequestedStage === CROSS_STAGE_SCOPE
    && (normalizedViewStage === 'SEKI' || normalizedViewStage === 'SEKII')
  ) {
    return 'fallback'
  }

  return 'none'
}

const scoreCompositionScopeMatch = (
  viewScope: Record<string, string>,
  requestedScope: Record<string, string>,
): { scopeSize: number; stageFallbackCount: number } | null => {
  if (Object.keys(viewScope).length === 0) {
    return Object.keys(requestedScope).length === 0 ? { scopeSize: 0, stageFallbackCount: 0 } : null
  }

  let stageFallbackCount = 0
  for (const [key, value] of Object.entries(viewScope)) {
    const requestedValue = requestedScope[key]
    if (!requestedValue) return null
    if (key === STAGE_SCOPE_KEY) {
      const stageMatch = matchCompositionStageScope(value, requestedValue)
      if (stageMatch === 'none') return null
      if (stageMatch === 'fallback') stageFallbackCount += 1
      continue
    }
    if (requestedValue.toUpperCase() !== value.toUpperCase()) return null
  }

  return {
    scopeSize: Object.keys(viewScope).length,
    stageFallbackCount,
  }
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

  const matches: Array<{
    view: Record<string, unknown>
    scopeSize: number
    stageFallbackCount: number
    viewId: string
  }> = []

  for (const relativePath of files) {
    const absolutePath = path.resolve(REPO_ROOT, relativePath)
    const fileContent = await fs.readFile(absolutePath, 'utf8')
    const parsed = JSON.parse(fileContent)
    if (!isCompositionViewPayload(parsed)) continue
    if (normalizeScopeValue(parsed.landscapeId).toUpperCase() !== normalizeScopeValue(landscapeId).toUpperCase()) continue

    const scope = normalizeCompositionScope(parsed.scope)
    const score = scoreCompositionScopeMatch(scope, requestedScope)
    if (!score) continue

    matches.push({
      view: parsed,
      scopeSize: score.scopeSize,
      stageFallbackCount: score.stageFallbackCount,
      viewId: normalizeScopeValue(parsed.viewId),
    })
  }

  matches.sort((left, right) => {
    if (right.scopeSize !== left.scopeSize) {
      return right.scopeSize - left.scopeSize
    }
    if (left.stageFallbackCount !== right.stageFallbackCount) {
      return left.stageFallbackCount - right.stageFallbackCount
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
        && !requestUrl.pathname.startsWith('/__semantic-atomicity-review')
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

        if (requestUrl.pathname === '/__semantic-atomicity-review/list') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const files: string[] = []
          try {
            await collectSemanticAtomicityConfigFiles(SEMANTIC_ATOMICITY_ROOT, files)
          } catch (error) {
            const message = error instanceof Error ? error.message : ''
            if (!message.includes('ENOENT')) throw error
          }
          files.sort((left, right) => left.localeCompare(right))
          const configs = await Promise.all(files.map(async (filePath) => {
            const absolutePath = resolveSemanticAtomicityConfigAbsolutePath(filePath)
            if (!absolutePath) return null
            const config = JSON.parse(await fs.readFile(absolutePath, 'utf8')) as Record<string, unknown>
            if (!isSemanticAtomicityConfigPayload(config)) return null
            const scope = asRecord(config.scope)
            return {
              path: filePath,
              reviewId: config.reviewId,
              ruleVersion: config.ruleVersion,
              label: typeof scope.label === 'string' ? scope.label : config.reviewId,
            }
          }))

          sendJson(res, 200, { configs: configs.filter(Boolean) })
          return
        }

        if (requestUrl.pathname === '/__semantic-atomicity-review/load') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const configPath = requestUrl.searchParams.get('config') ?? ''
          const configAbsolutePath = resolveSemanticAtomicityConfigAbsolutePath(configPath)
          if (!configAbsolutePath) {
            sendJson(res, 400, { error: 'Invalid semantic atomicity config path.' })
            return
          }

          const config = JSON.parse(await fs.readFile(configAbsolutePath, 'utf8')) as Record<string, unknown>
          if (!isSemanticAtomicityConfigPayload(config)) {
            sendJson(res, 400, { error: 'Invalid semantic atomicity config payload.' })
            return
          }

          const scope = asRecord(config.scope)
          const landscapePath = typeof config.landscapePath === 'string' ? config.landscapePath : ''
          const landscapeAbsolutePath = resolveCanonicalLandscapeAbsolutePath(landscapePath)
          if (!landscapeAbsolutePath) {
            sendJson(res, 400, { error: 'Invalid canonical landscape path in semantic atomicity config.' })
            return
          }

          const reviewPath = typeof config.reviewPath === 'string' ? config.reviewPath : ''
          const reviewAbsolutePath = resolveSemanticAtomicityReviewAbsolutePath(reviewPath)
          if (!reviewAbsolutePath) {
            sendJson(res, 400, { error: 'Invalid review path in semantic atomicity config.' })
            return
          }

          const landscape = JSON.parse(await fs.readFile(landscapeAbsolutePath, 'utf8')) as Record<string, unknown>
          if (!isLandscapePayload(landscape)) {
            sendJson(res, 400, { error: 'Configured landscape is not a valid landscape JSON.' })
            return
          }

          const rootGoalIds = Array.isArray(scope.rootGoalIds)
            ? scope.rootGoalIds.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            : []
          const goals = (Array.isArray(landscape.goals) ? landscape.goals : [])
            .filter((goal): goal is Record<string, unknown> => typeof goal === 'object' && goal !== null && !Array.isArray(goal))
          const goalById = new Map(goals.map((goal) => [String(goal.id ?? ''), goal]))
          const scopeGoalIds = collectSemanticScopeGoalIds(rootGoalIds, goalById)
          const leafGoals = Array.from(scopeGoalIds)
            .map((goalId) => goalById.get(goalId))
            .filter((goal): goal is Record<string, unknown> => !!goal && isLeafGoal(goal))
            .sort((left, right) => normalizeSemanticText(left.title).localeCompare(normalizeSemanticText(right.title), 'de'))
          const reviewRecords = existsSync(reviewAbsolutePath)
            ? parseJsonl(await fs.readFile(reviewAbsolutePath, 'utf8'))
            : []
          const reviewByGoalId = new Map(reviewRecords.map((record) => [String(record.goalId ?? ''), record]))
          const leafGoalIds = new Set(leafGoals.map((goal) => String(goal.id ?? '')))
          const obsoleteRecords = reviewRecords.filter((record) => !leafGoalIds.has(String(record.goalId ?? '')))

          const items = leafGoals.map((goal) => {
            const goalId = String(goal.id ?? '')
            const record = reviewByGoalId.get(goalId) ?? null
            const fingerprint = fingerprintSemanticGoal(goal, String(config.ruleVersion))
            const status = !record ? 'missing' : record.fingerprint === fingerprint ? 'current' : 'stale'
            return {
              goal: {
                id: goalId,
                shortKey: goal.shortKey,
                title: goal.title,
                titleEn: goal.titleEn,
                description: goal.description,
                descriptionEn: goal.descriptionEn,
                dimensionTags: goal.dimensionTags,
              },
              fingerprint,
              status,
              record,
            }
          })

          sendJson(res, 200, {
            configPath: toPosixPath(path.relative(REPO_ROOT, configAbsolutePath)),
            reviewPath: toPosixPath(path.relative(REPO_ROOT, reviewAbsolutePath)),
            config,
            items,
            obsoleteRecords,
          })
          return
        }

        if (requestUrl.pathname === '/__semantic-atomicity-review/save') {
          if (req.method !== 'PUT') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const payload = asRecord(await readJsonBody(req))
          const configPath = typeof payload.configPath === 'string' ? payload.configPath : ''
          const configAbsolutePath = resolveSemanticAtomicityConfigAbsolutePath(configPath)
          if (!configAbsolutePath) {
            sendJson(res, 400, { error: 'Invalid semantic atomicity config path.' })
            return
          }

          const config = JSON.parse(await fs.readFile(configAbsolutePath, 'utf8')) as Record<string, unknown>
          if (!isSemanticAtomicityConfigPayload(config)) {
            sendJson(res, 400, { error: 'Invalid semantic atomicity config payload.' })
            return
          }

          const reviewPath = typeof config.reviewPath === 'string' ? config.reviewPath : ''
          const reviewAbsolutePath = resolveSemanticAtomicityReviewAbsolutePath(reviewPath)
          const landscapePath = typeof config.landscapePath === 'string' ? config.landscapePath : ''
          const landscapeAbsolutePath = resolveCanonicalLandscapeAbsolutePath(landscapePath)
          if (!reviewAbsolutePath || !landscapeAbsolutePath) {
            sendJson(res, 400, { error: 'Invalid semantic atomicity config paths.' })
            return
          }

          const landscape = JSON.parse(await fs.readFile(landscapeAbsolutePath, 'utf8')) as Record<string, unknown>
          if (!isLandscapePayload(landscape)) {
            sendJson(res, 400, { error: 'Configured landscape is not a valid landscape JSON.' })
            return
          }
          const goals = (Array.isArray(landscape.goals) ? landscape.goals : [])
            .filter((goal): goal is Record<string, unknown> => typeof goal === 'object' && goal !== null && !Array.isArray(goal))
          const goalById = new Map(goals.map((goal) => [String(goal.id ?? ''), goal]))
          const inputRecords = Array.isArray(payload.records)
            ? payload.records.filter((record): record is Record<string, unknown> => typeof record === 'object' && record !== null && !Array.isArray(record))
            : []
          const normalizedRecords = inputRecords
            .map((record) => {
              const goalId = typeof record.goalId === 'string' ? record.goalId : ''
              const goal = goalById.get(goalId)
              if (!goal) return null
              return normalizeSemanticReviewRecord(record, {
                reviewId: String(config.reviewId),
                ruleVersion: String(config.ruleVersion),
                landscapeId: String(config.landscapeId),
                goalId,
                fingerprint: fingerprintSemanticGoal(goal, String(config.ruleVersion)),
              })
            })
            .filter((record): record is Record<string, unknown> => record !== null)
            .sort((left, right) => String(left.goalId).localeCompare(String(right.goalId)))

          await fs.mkdir(path.dirname(reviewAbsolutePath), { recursive: true })
          await fs.writeFile(reviewAbsolutePath, serializeJsonl(normalizedRecords), 'utf8')

          sendJson(res, 200, {
            reviewPath: toPosixPath(path.relative(REPO_ROOT, reviewAbsolutePath)),
            savedRecords: normalizedRecords.length,
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
