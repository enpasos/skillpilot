import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { existsSync, promises as fs } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { promisify } from 'node:util'
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
const GYMNASIUM_MAPPING_ROOT = path.resolve(CURRICULA_ROOT, 'DE', 'Gymnasium', 'mapping')
const SOURCE_LANDSCAPE_REGISTRY_PATH = path.resolve(CURRICULA_ROOT, 'DE', 'Gymnasium', 'provenance', 'source-landscape-registry.json')
const SOURCE_GOAL_MEMBERSHIP_REGISTRY_PATH = path.resolve(CURRICULA_ROOT, 'DE', 'Gymnasium', 'provenance', 'source-goal-membership-registry.json')
const SOURCE_GOAL_CLOSURE_REGISTRY_PATH = path.resolve(CURRICULA_ROOT, 'DE', 'Gymnasium', 'provenance', 'source-goal-closure-registry.json')
const QUALITY_STATUS_PATH = path.resolve(REPO_ROOT, 'docs', 'qa-ci', 'status', 'curriculum-quality-status.json')
const PUBLIC_DATA_ROOT = path.resolve(APP_ROOT, 'public', 'data')
const execFileAsync = promisify(execFile)

type LocalSourcePdf = {
  absolutePath: string
  relativePath: string
}

type OfficialSourcePassage = {
  id: string
  topicCode: string
  title: string
  text: string
  page: number
  sourcePath: string
  sourceGoalIds?: string[]
}

type SourceExtraction = {
  path: string
  title: string
  passages: OfficialSourcePassage[]
  sourceGoals: Array<Record<string, unknown>>
  pipelineStatus: Record<string, unknown> | null
}

const officialSourcePassageCache = new Map<string, Promise<OfficialSourcePassage[]>>()

const toPosixPath = (value: string): string => value.split(path.sep).join('/')

const normalizeGermanText = (value: string): string =>
  value
    .replace(/Ã„/gu, 'Ä')
    .replace(/Ã–/gu, 'Ö')
    .replace(/Ãœ/gu, 'Ü')
    .replace(/Ã¤/gu, 'ä')
    .replace(/Ã¶/gu, 'ö')
    .replace(/Ã¼/gu, 'ü')
    .replace(/ÃŸ/gu, 'ß')
    .replace(/Â°/gu, '°')
    .replace(/Â²/gu, '²')
    .replace(/Â³/gu, '³')
    .replace(/Â·/gu, '·')
    .replace(/Â /gu, ' ')
    .replace(/Â/gu, '')
    .replace(/â€“/gu, '–')
    .replace(/â€”/gu, '—')
    .replace(/â€ž/gu, '„')
    .replace(/â€œ/gu, '“')
    .replace(/â€˜/gu, '‘')
    .replace(/â€™/gu, '’')
    .replace(/â†’/gu, '→')
    .replace(/âˆž/gu, '∞')
    .normalize('NFC')

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
  const hasRootGoalIds = Array.isArray(scope.rootGoalIds)
  const hasLeafGoalIds = Array.isArray(scope.leafGoalIds)
  return record.schemaVersion === 1
    && typeof record.reviewId === 'string'
    && typeof record.ruleVersion === 'string'
    && typeof record.landscapeId === 'string'
    && typeof record.landscapePath === 'string'
    && typeof record.reviewPath === 'string'
    && (hasRootGoalIds || hasLeafGoalIds)
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

const collectMappingFiles = async (directory: string, result: string[]): Promise<void> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      await collectMappingFiles(absolutePath, result)
      continue
    }

    if (!entry.isFile()) continue
    if (!LANDSCAPE_JSON_FILE_PATTERN.test(entry.name)) continue
    if (!isPathInside(absolutePath, GYMNASIUM_MAPPING_ROOT)) continue

    const relativeToRepo = path.relative(REPO_ROOT, absolutePath)
    result.push(toPosixPath(relativeToRepo))
  }
}

const readJsonFile = async (absolutePath: string): Promise<Record<string, unknown>> => {
  const content = await fs.readFile(absolutePath, 'utf8')
  return asRecord(JSON.parse(content))
}

const repoRelativePathCandidates = (candidatePath: string): string[] => {
  const sanitizedPath = candidatePath.trim().replace(/\\/g, '/').replace(/^\/+/, '')
  if (!sanitizedPath) return []

  const candidates = [sanitizedPath]
  const inputWithIsoMatch = sanitizedPath.match(/^(.*\/input\/)DE-([A-Z]{2})(\/.*)$/u)
  if (inputWithIsoMatch) {
    candidates.push(`${inputWithIsoMatch[1]}${inputWithIsoMatch[2]}${inputWithIsoMatch[3]}`)
  }
  return [...new Set(candidates)]
}

const resolveReadableRepoFile = (candidatePath: string): { absolutePath: string, relativePath: string } | null => {
  for (const relativePath of repoRelativePathCandidates(candidatePath)) {
    const absolutePath = path.resolve(REPO_ROOT, relativePath)
    if (!isPathInside(absolutePath, REPO_ROOT)) continue
    if (!existsSync(absolutePath)) continue
    return {
      absolutePath,
      relativePath: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
    }
  }
  return null
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []

const readSourceLandscapeRegistry = async (): Promise<Array<Record<string, unknown>>> => {
  if (!existsSync(SOURCE_LANDSCAPE_REGISTRY_PATH)) return []
  const registry = await readJsonFile(SOURCE_LANDSCAPE_REGISTRY_PATH)
  return Array.isArray(registry.entries) ? registry.entries.map(asRecord) : []
}

const readSourceMembershipByLandscapeId = async (): Promise<Map<string, Set<string>>> => {
  const result = new Map<string, Set<string>>()
  if (!existsSync(SOURCE_GOAL_MEMBERSHIP_REGISTRY_PATH)) return result
  const registry = await readJsonFile(SOURCE_GOAL_MEMBERSHIP_REGISTRY_PATH)
  const landscapes = Array.isArray(registry.landscapes) ? registry.landscapes.map(asRecord) : []

  landscapes.forEach((entry) => {
    const landscapeId = typeof entry.landscapeId === 'string' ? entry.landscapeId : ''
    if (!landscapeId) return
    result.set(landscapeId, new Set(asStringArray(entry.goalIds)))
  })

  return result
}

const readSourceClosureByLandscapeId = async (): Promise<Map<string, Map<string, string[]>>> => {
  const result = new Map<string, Map<string, string[]>>()
  if (!existsSync(SOURCE_GOAL_CLOSURE_REGISTRY_PATH)) return result
  const registry = await readJsonFile(SOURCE_GOAL_CLOSURE_REGISTRY_PATH)
  const landscapes = Array.isArray(registry.landscapes) ? registry.landscapes.map(asRecord) : []

  landscapes.forEach((entry) => {
    const landscapeId = typeof entry.landscapeId === 'string' ? entry.landscapeId : ''
    if (!landscapeId) return
    const rawClosures = asRecord(entry.goalAtomicClosures)
    const closures = new Map<string, string[]>()
    Object.entries(rawClosures).forEach(([goalId, atomicGoalIds]) => {
      closures.set(goalId, asStringArray(atomicGoalIds))
    })
    result.set(landscapeId, closures)
  })

  return result
}

const readMappingFiles = async (): Promise<Array<{ path: string, mapping: Record<string, unknown> }>> => {
  const files: string[] = []
  try {
    await collectMappingFiles(GYMNASIUM_MAPPING_ROOT, files)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('ENOENT')) throw error
  }

  const mappings = await Promise.all(files.map(async (relativePath) => {
    try {
      const mapping = await readJsonFile(path.resolve(REPO_ROOT, relativePath))
      if (typeof mapping.sourceLandscapeId !== 'string') return null
      if (typeof mapping.targetLandscapeId !== 'string') return null
      if (!Array.isArray(mapping.mappings)) return null
      return { path: relativePath, mapping }
    } catch {
      return null
    }
  }))

  return mappings.filter((entry): entry is { path: string, mapping: Record<string, unknown> } => entry !== null)
}

const readCanonicalLandscapeById = async (
  landscapeId: string,
): Promise<{ path: string, landscape: Record<string, unknown> } | null> => {
  const files: string[] = []
  await collectCanonicalLandscapeFiles(CANONICAL_GYMNASIUM_ROOT, files)

  for (const relativePath of files) {
    const landscape = await readJsonFile(path.resolve(REPO_ROOT, relativePath))
    if (landscape.landscapeId === landscapeId && isLandscapePayload(landscape)) {
      return { path: relativePath, landscape }
    }
  }

  return null
}

const inferStageFromSourceEntry = (entry: Record<string, unknown>): string => {
  const text = [
    entry.title,
    entry.sourcePath,
    entry.archiveSourcePath,
    entry.archivePath,
  ].map((value) => String(value ?? '')).join(' ').toLocaleLowerCase('de-DE')

  if (text.includes('lower-secondary') || text.includes('sekundarstufe i') || text.includes('sek i') || text.includes('_gym_1_')) {
    return 'SekI'
  }
  if (
    text.includes('upper-secondary')
    || text.includes('oberstufe')
    || text.includes('kursstufe')
    || text.includes('sekundarstufe ii')
    || text.includes('sek ii')
    || text.includes('_gym_2_')
  ) {
    return 'SekII'
  }
  return ''
}

const mappingEntryList = (mapping: Record<string, unknown>): Array<Record<string, unknown>> =>
  Array.isArray(mapping.mappings) ? mapping.mappings.map(asRecord) : []

type CurriculumMappingListRow = {
  sourceLandscapeId: string
  sourceTitle: string
  subject: string
  jurisdiction: string
  stage: string
  sourcePath: string
  sourceGoalCount: number
  targetLandscapeId: string
  targetTitle: string
  targetPath: string
  mappingPath: string
  mappingCount: number
  referenceLinks: Array<{ label: string, url: string, path: string }>
  mappingHasSourceExtractionPath: boolean
}

const shouldPreferCurriculumMappingListRow = (
  candidate: CurriculumMappingListRow,
  current: CurriculumMappingListRow,
): boolean => {
  if (candidate.mappingHasSourceExtractionPath !== current.mappingHasSourceExtractionPath) {
    return candidate.mappingHasSourceExtractionPath
  }
  const candidateIsReview = candidate.mappingPath.endsWith('.review.json')
  const currentIsReview = current.mappingPath.endsWith('.review.json')
  if (candidateIsReview !== currentIsReview) return candidateIsReview
  if (candidate.mappingCount !== current.mappingCount) return candidate.mappingCount > current.mappingCount
  return candidate.mappingPath.localeCompare(current.mappingPath) < 0
}

const deduplicateCurriculumMappingListRows = (
  rows: CurriculumMappingListRow[],
): CurriculumMappingListRow[] => {
  const rowsBySourceLandscapeId = new Map<string, CurriculumMappingListRow>()
  rows.forEach((row) => {
    const current = rowsBySourceLandscapeId.get(row.sourceLandscapeId)
    if (!current || shouldPreferCurriculumMappingListRow(row, current)) {
      rowsBySourceLandscapeId.set(row.sourceLandscapeId, row)
    }
  })
  return [...rowsBySourceLandscapeId.values()]
}

const normalizeReferenceToken = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')

const subjectReferenceTokens = (subject: string): string[] => {
  const normalized = normalizeReferenceToken(subject)
  if (normalized.includes('mathematik')) return ['mathematik', 'mathe']
  if (normalized.includes('physik')) return ['physik', 'physics']
  if (normalized.includes('chemie')) return ['chemie', 'chemistry']
  if (normalized.includes('biologie')) return ['biologie', 'biology']
  return normalized ? [normalized] : []
}

const readSourceReferenceLinks = async (
  sourceEntry: Record<string, unknown>,
  subject: string,
): Promise<Array<{ label: string, url: string, path: string }>> => {
  const rawArchivePath = String(sourceEntry.archivePath ?? '')
  const rawSourcePath = String(sourceEntry.archiveSourcePath ?? sourceEntry.sourcePath ?? '')
  const referencePathCandidates = [
    rawArchivePath ? `${rawArchivePath.replace(/\/+$/u, '')}/references.md` : '',
    rawSourcePath ? `${path.posix.dirname(rawSourcePath.replace(/\\/g, '/'))}/../references.md` : '',
  ].filter(Boolean)

  const referenceFile = referencePathCandidates
    .map((candidatePath) => resolveReadableRepoFile(candidatePath))
    .find((entry): entry is NonNullable<typeof entry> => entry !== null)
  if (!referenceFile) return []

  const content = await fs.readFile(referenceFile.absolutePath, 'utf8')
  const links: Array<{ label: string, url: string, path: string }> = []
  const linkPattern = /(?:-\s*)?([^:\n]+?):\s*(https?:\/\/\S+)/gu
  let match: RegExpExecArray | null
  while ((match = linkPattern.exec(content)) !== null) {
    const label = match[1]?.trim() ?? ''
    const url = match[2]?.trim() ?? ''
    if (!label || !url) continue
    links.push({
      label,
      url,
      path: referenceFile.relativePath,
    })
  }

  const tokens = subjectReferenceTokens(subject)
  const subjectLinks = links.filter((entry) => {
    const label = normalizeReferenceToken(entry.label)
    const url = normalizeReferenceToken(entry.url)
    return tokens.some((token) => label.includes(token) || url.includes(token))
  })

  return (subjectLinks.length > 0 ? subjectLinks : links.slice(0, 3))
    .filter((entry, index, all) => all.findIndex((candidate) => candidate.url === entry.url) === index)
}

const resolveReadableRepoDirectory = (candidatePath: string): { absolutePath: string, relativePath: string } | null => {
  for (const relativePath of repoRelativePathCandidates(candidatePath)) {
    const absolutePath = path.resolve(REPO_ROOT, relativePath)
    if (!isPathInside(absolutePath, REPO_ROOT)) continue
    if (!existsSync(absolutePath)) continue
    return {
      absolutePath,
      relativePath: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
    }
  }
  return null
}

const sourceDirectoryCandidates = (sourceEntry: Record<string, unknown>): string[] => {
  const rawArchivePath = String(sourceEntry.archivePath ?? '')
  const rawSourcePath = String(sourceEntry.archiveSourcePath ?? sourceEntry.sourcePath ?? '').replace(/\\/g, '/')
  const candidates = [
    rawArchivePath,
    rawSourcePath ? path.posix.dirname(rawSourcePath) : '',
  ].filter(Boolean)

  if (rawSourcePath) {
    const sourceDirectory = path.posix.dirname(rawSourcePath)
    if (path.posix.basename(sourceDirectory) === 'source-json') {
      candidates.push(path.posix.dirname(sourceDirectory))
    }
  }

  return [...new Set(candidates.map((candidate) => candidate.replace(/\/+$/u, '')).filter(Boolean))]
}

const readLocalSourcePdf = async (
  sourceEntry: Record<string, unknown>,
  subject: string,
): Promise<LocalSourcePdf | null> => {
  const referenceLinks = await readSourceReferenceLinks(sourceEntry, subject)
  const directories = sourceDirectoryCandidates(sourceEntry)
    .map((candidatePath) => resolveReadableRepoDirectory(candidatePath))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  for (const link of referenceLinks) {
    const fileName = path.posix.basename(new URL(link.url).pathname)
    for (const directory of directories) {
      const candidate = resolveReadableRepoFile(`${directory.relativePath}/${fileName}`)
      if (candidate && /\.pdf$/iu.test(candidate.relativePath)) return candidate
    }
  }

  const tokens = subjectReferenceTokens(subject)
  for (const directory of directories) {
    let entries: Array<{ name: string, isFile: () => boolean }>
    try {
      entries = await fs.readdir(directory.absolutePath, { withFileTypes: true })
    } catch {
      continue
    }
    const matchingPdf = entries
      .filter((entry) => entry.isFile() && /\.pdf$/iu.test(entry.name))
      .find((entry) => {
        const normalizedName = normalizeReferenceToken(entry.name)
        return tokens.some((token) => normalizedName.includes(token))
      })
    if (matchingPdf) {
      const absolutePath = path.join(directory.absolutePath, matchingPdf.name)
      return {
        absolutePath,
        relativePath: toPosixPath(path.relative(REPO_ROOT, absolutePath)),
      }
    }
  }

  return null
}

const pdfChromeLinePattern = /^(?:HMKB|Kerncurriculum|[A-Za-z]+(?: [A-Za-z]+)* gymnasiale Oberstufe|\d+)$/u
const officialTopicHeadingPattern = /^\s*((?:E|Q[1-4])(?:\.\d+){1,2}[a-z]?)\s+(.+?)\s*$/u

const normalizeOfficialPdfLine = (line: string): string =>
  normalizeGermanText(line)
    .replace(/\s+/gu, ' ')
    .replace(/\u00a0/gu, ' ')
    .trim()

const isPdfChromeLine = (line: string): boolean => {
  const normalized = normalizeOfficialPdfLine(line)
  if (!normalized) return false
  if (pdfChromeLinePattern.test(normalized)) return true
  return normalized === 'Mathematik gymnasiale Oberstufe'
    || normalized === 'Physik gymnasiale Oberstufe'
    || normalized === 'Biologie gymnasiale Oberstufe'
    || normalized === 'Chemie gymnasiale Oberstufe'
}

const formatOfficialPassageText = (lines: string[]): string => {
  const filteredLines = lines
    .map((line) => line.replace(/\r/gu, ''))
    .filter((line) => !isPdfChromeLine(line))
    .join('\n')
    .replace(/(\p{L})- *\n\s*(\p{Ll})/gu, '$1$2')
    .split(/\n/u)
    .map((line) => normalizeOfficialPdfLine(line))

  const paragraphs: string[] = []
  let current = ''

  const flush = () => {
    if (current.trim()) paragraphs.push(current.trim())
    current = ''
  }

  for (const line of filteredLines) {
    if (!line) {
      flush()
      continue
    }
    if (/^[–-]\s/u.test(line)) {
      flush()
      current = line
      continue
    }
    if (!current) {
      current = line
      continue
    }
    current = `${current}${current.endsWith(':') ? '\n  ' : ' '}${line}`
  }
  flush()

  return paragraphs.join('\n')
}

const parseOfficialPdfPassages = (rawText: string, sourcePath: string): OfficialSourcePassage[] => {
  const pages = rawText.split(/\f/u)
  const candidates: OfficialSourcePassage[] = []
  let current: { topicCode: string, title: string, page: number, lines: string[] } | null = null

  const flush = () => {
    if (!current) return
    const text = formatOfficialPassageText(current.lines)
    if (text.length >= 80 && /(^|\n)[–-]\s/u.test(text)) {
      candidates.push({
        id: `official:${current.topicCode}`,
        topicCode: current.topicCode,
        title: `${current.topicCode} ${current.title}`,
        text,
        page: current.page,
        sourcePath,
      })
    }
    current = null
  }

  pages.forEach((page, pageIndex) => {
    page.split(/\n/u).forEach((line) => {
      const headingMatch = line.match(officialTopicHeadingPattern)
      if (headingMatch) {
        flush()
        current = {
          topicCode: headingMatch[1] ?? '',
          title: normalizeOfficialPdfLine(headingMatch[2] ?? ''),
          page: pageIndex + 1,
          lines: [],
        }
        return
      }
      if (current) current.lines.push(line)
    })
  })
  flush()

  const byTopicCode = new Map<string, OfficialSourcePassage>()
  candidates.forEach((candidate) => {
    const previous = byTopicCode.get(candidate.topicCode)
    if (!previous || candidate.text.length > previous.text.length) {
      byTopicCode.set(candidate.topicCode, candidate)
    }
  })

  return [...byTopicCode.values()].sort((left, right) => {
    const phaseOrder = (code: string) => code.startsWith('E') ? 0 : Number(code.match(/^Q(\d)/u)?.[1] ?? 9)
    return phaseOrder(left.topicCode) - phaseOrder(right.topicCode)
      || left.topicCode.localeCompare(right.topicCode, 'de-DE', { numeric: true })
  })
}

const readOfficialSourcePassages = async (
  sourceEntry: Record<string, unknown>,
  subject: string,
): Promise<OfficialSourcePassage[]> => {
  const pdf = await readLocalSourcePdf(sourceEntry, subject)
  if (!pdf) return []

  const cached = officialSourcePassageCache.get(pdf.absolutePath)
  if (cached) return cached

  const readPromise = execFileAsync('pdftotext', ['-layout', pdf.absolutePath, '-'])
    .then(({ stdout }) => parseOfficialPdfPassages(stdout, pdf.relativePath))
    .catch(() => [])
  officialSourcePassageCache.set(pdf.absolutePath, readPromise)
  return readPromise
}

const SOURCE_EXTRACTION_FILE_PATTERN = /\.source-extraction\.json$/iu

const readSourceExtraction = async (
  sourceEntry: Record<string, unknown>,
  sourceLandscapeId: string,
): Promise<SourceExtraction | null> => {
  const candidateDirectories = sourceDirectoryCandidates(sourceEntry)
    .flatMap((candidatePath) => [
      `${candidatePath.replace(/\/+$/u, '')}/source-extraction`,
      candidatePath,
    ])
    .map((candidatePath) => resolveReadableRepoDirectory(candidatePath))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  const seenDirectories = new Set<string>()
  const candidateFiles: string[] = []
  for (const directory of candidateDirectories) {
    if (seenDirectories.has(directory.relativePath)) continue
    seenDirectories.add(directory.relativePath)

    let entries: Array<{ name: string, isFile: () => boolean }>
    try {
      entries = await fs.readdir(directory.absolutePath, { withFileTypes: true })
    } catch {
      continue
    }

    entries.forEach((entry) => {
      if (!entry.isFile()) return
      if (!SOURCE_EXTRACTION_FILE_PATTERN.test(entry.name)) return
      candidateFiles.push(toPosixPath(path.relative(REPO_ROOT, path.join(directory.absolutePath, entry.name))))
    })
  }

  for (const relativePath of candidateFiles.sort()) {
    try {
      const extraction = await readJsonFile(path.resolve(REPO_ROOT, relativePath))
      if (String(extraction.sourceLandscapeId ?? '') !== sourceLandscapeId) continue
      const passages = Array.isArray(extraction.passages)
        ? extraction.passages.map(asRecord).map((passage) => ({
          id: String(passage.id ?? ''),
          topicCode: String(passage.topicCode ?? ''),
          title: normalizeGermanText(String(passage.title ?? '')),
          text: normalizeGermanText(String(passage.text ?? '')),
          page: Number(passage.page ?? 0),
          sourcePath: normalizeGermanText(String(passage.sourcePath ?? '')),
          sourceGoalIds: asStringArray(passage.sourceGoalIds),
        })).filter((passage) => passage.id && passage.text)
        : []
      const sourceGoals = Array.isArray(extraction.sourceGoals)
        ? extraction.sourceGoals.map(asRecord).filter((goal) => typeof goal.id === 'string')
        : []
      const pipelineStatus = Object.keys(asRecord(extraction.pipelineStatus)).length > 0
        ? asRecord(extraction.pipelineStatus)
        : null
      if ((passages.length === 0 || sourceGoals.length === 0) && pipelineStatus === null) continue
      return {
        path: relativePath,
        title: normalizeGermanText(String(extraction.title ?? '')),
        passages,
        sourceGoals,
        pipelineStatus,
      }
    } catch {
      continue
    }
  }

  return null
}

const readQualityPipelineStatusForSourcePath = async (
  sourcePath: string,
): Promise<Record<string, unknown> | null> => {
  if (!sourcePath || !existsSync(QUALITY_STATUS_PATH)) return null

  try {
    const status = await readJsonFile(QUALITY_STATUS_PATH)
    const curricula = Array.isArray(status.curricula)
      ? status.curricula.map(asRecord)
      : []

    for (const curriculum of curricula) {
      const mappingPipeline = asRecord(curriculum.mappingPipeline)
      const sources = Array.isArray(mappingPipeline.sources)
        ? mappingPipeline.sources.map(asRecord)
        : []
      const source = sources.find((entry) => String(entry.path ?? '') === sourcePath)
      if (!source) continue

      const steps = Array.isArray(source.steps) ? source.steps : []
      if (steps.length === 0) return null

      return {
        version: 1,
        currentStep: String(source.currentStep ?? ''),
        steps,
      }
    }
  } catch {
    return null
  }

  return null
}

const sourceTopicCodePattern = /\b((?:E|Q[1-4])(?:\.\d+){1,2}[a-z]?)\b/u

const directSourceTopicCode = (goal: Record<string, unknown>): string => {
  const dimensionTags = asRecord(goal.dimensionTags)
  const candidates = [
    goal.topicCode,
    dimensionTags.topicCode,
    dimensionTags.sourceTopicCode,
    goal.sourceRef,
    goal.title,
  ]

  for (const candidate of candidates) {
    const match = String(candidate ?? '').match(sourceTopicCodePattern)
    if (match?.[1]) return match[1]
  }

  return ''
}

const buildSourceTopicCodeByGoalId = (
  sourceGoals: Array<Record<string, unknown>>,
): Map<string, string> => {
  const goalById = new Map(sourceGoals.map((goal) => [String(goal.id ?? ''), goal]))
  const parentIdsByChild = buildParentIdsByChild(sourceGoals)
  const topicCodeByGoalId = new Map<string, string>()

  const resolveTopicCode = (goalId: string, visiting = new Set<string>()): string => {
    if (topicCodeByGoalId.has(goalId)) return topicCodeByGoalId.get(goalId) ?? ''
    if (visiting.has(goalId)) return ''
    const goal = goalById.get(goalId)
    if (!goal) return ''

    const direct = directSourceTopicCode(goal)
    if (direct) {
      topicCodeByGoalId.set(goalId, direct)
      return direct
    }

    const nextVisiting = new Set(visiting)
    nextVisiting.add(goalId)
    const parentTopicCodes = (parentIdsByChild.get(goalId) ?? [])
      .map((parentId) => resolveTopicCode(parentId, nextVisiting))
      .filter(Boolean)
    const resolved = parentTopicCodes[0] ?? ''
    topicCodeByGoalId.set(goalId, resolved)
    return resolved
  }

  sourceGoals.forEach((goal) => {
    const goalId = String(goal.id ?? '')
    if (goalId) resolveTopicCode(goalId)
  })

  return topicCodeByGoalId
}

const buildCurriculumMappingList = async () => {
  const sourceEntries = await readSourceLandscapeRegistry()
  const sourceEntryById = new Map(sourceEntries.map((entry) => [String(entry.landscapeId ?? ''), entry]))
  const mappingFiles = await readMappingFiles()
  const canonicalSummaries = await readCanonicalLandscapeSummaries()
  const canonicalById = new Map(canonicalSummaries.map((entry) => [entry.landscapeId, entry]))

  const rows = await Promise.all(mappingFiles.map(async ({ path: mappingPath, mapping }) => {
    const sourceLandscapeId = String(mapping.sourceLandscapeId ?? '')
    const sourceEntry = sourceEntryById.get(sourceLandscapeId)
    const targetLandscapeId = String(mapping.targetLandscapeId ?? '')
    const target = canonicalById.get(targetLandscapeId)
    if (!sourceEntry || !target) return null

    const readableSource = resolveReadableRepoFile(
      String(sourceEntry.archiveSourcePath ?? sourceEntry.sourcePath ?? ''),
    )
    let subject = ''
    let sourceGoalCount = 0
    if (readableSource) {
      try {
        const sourceLandscape = await readJsonFile(readableSource.absolutePath)
        subject = typeof sourceLandscape.subject === 'string' ? sourceLandscape.subject : ''
        sourceGoalCount = Array.isArray(sourceLandscape.goals) ? sourceLandscape.goals.length : 0
      } catch {
        subject = ''
      }
    }
    const sourceExtraction = await readSourceExtraction(sourceEntry, sourceLandscapeId)
    let mappingCount = mappingEntryList(mapping).length
    if (sourceExtraction) {
      sourceGoalCount = sourceExtraction.sourceGoals.length
      const extractedSourceGoalIds = new Set(sourceExtraction.sourceGoals.map((goal) => String(goal.id ?? '')).filter(Boolean))
      mappingCount = mappingEntryList(mapping).filter((entry) => extractedSourceGoalIds.has(String(entry.legacyGoalId ?? ''))).length
    }

    return {
      sourceLandscapeId,
      sourceTitle: sourceExtraction?.title || String(sourceEntry.title ?? sourceLandscapeId),
      subject,
      jurisdiction: String(sourceEntry.jurisdiction ?? ''),
      stage: inferStageFromSourceEntry(sourceEntry),
      sourcePath: sourceExtraction?.path ?? readableSource?.relativePath ?? String(sourceEntry.archiveSourcePath ?? sourceEntry.sourcePath ?? ''),
      sourceGoalCount,
      targetLandscapeId,
      targetTitle: target.title,
      targetPath: target.path,
      mappingPath,
      mappingCount,
      referenceLinks: await readSourceReferenceLinks(sourceEntry, subject),
      mappingHasSourceExtractionPath: typeof mapping.sourceExtractionPath === 'string',
    }
  }))

  const documents = deduplicateCurriculumMappingListRows(rows
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
  )
    .sort((left, right) =>
      (left.subject || left.sourceTitle).localeCompare(right.subject || right.sourceTitle, 'de-DE')
      || left.jurisdiction.localeCompare(right.jurisdiction)
      || left.stage.localeCompare(right.stage)
      || left.sourceTitle.localeCompare(right.sourceTitle, 'de-DE'))

  return { documents }
}

const buildParentIdsByChild = (goals: Array<Record<string, unknown>>): Map<string, string[]> => {
  const parentIdsByChild = new Map<string, string[]>()
  goals.forEach((goal) => {
    const parentId = typeof goal.id === 'string' ? goal.id : ''
    if (!parentId) return
    asStringArray(goal.contains).forEach((childId) => {
      const parentIds = parentIdsByChild.get(childId) ?? []
      parentIds.push(parentId)
      parentIdsByChild.set(childId, parentIds)
    })
  })
  return parentIdsByChild
}

const getRootGoalIds = (goals: Array<Record<string, unknown>>): string[] => {
  const parentIdsByChild = buildParentIdsByChild(goals)
  const taggedRootIds = goals
    .filter((goal) => asStringArray(goal.tags).includes('root'))
    .map((goal) => String(goal.id ?? ''))
    .filter(Boolean)
  if (taggedRootIds.length > 0) return taggedRootIds

  return goals
    .map((goal) => String(goal.id ?? ''))
    .filter((goalId) => goalId && !parentIdsByChild.has(goalId))
}

const collectGoalDescendantIds = (
  goalId: string,
  goalById: Map<string, Record<string, unknown>>,
  visiting = new Set<string>(),
): Set<string> => {
  const result = new Set<string>([goalId])
  if (visiting.has(goalId)) return result
  const goal = goalById.get(goalId)
  if (!goal) return result

  const nextVisiting = new Set(visiting)
  nextVisiting.add(goalId)
  asStringArray(goal.contains).forEach((childId) => {
    collectGoalDescendantIds(childId, goalById, nextVisiting).forEach((descendantId) => result.add(descendantId))
  })

  return result
}

const findMappingCompositionViewOptions = async ({
  targetLandscapeId,
  jurisdiction,
  stage,
}: {
  targetLandscapeId: string
  jurisdiction: string
  stage: string
}) => {
  const files: string[] = []
  try {
    await collectCompositionViewFiles(COMPOSITION_VIEW_ROOT, files)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('ENOENT')) throw error
  }

  const options = await Promise.all(files.map(async (relativePath) => {
    try {
      const view = await readJsonFile(path.resolve(REPO_ROOT, relativePath))
      if (!isCompositionViewPayload(view)) return null
      if (view.landscapeId !== targetLandscapeId) return null
      const scope = asRecord(view.scope)
      if (jurisdiction && scope.jurisdiction !== jurisdiction) return null
      if (stage && scope.stage !== stage) return null
      const courseProfile = typeof scope.courseProfile === 'string' ? scope.courseProfile : ''
      return {
        path: relativePath,
        viewId: String(view.viewId ?? relativePath),
        label: [
          typeof scope.jurisdiction === 'string' ? scope.jurisdiction : '',
          typeof scope.stage === 'string' ? scope.stage : '',
          courseProfile,
        ].filter(Boolean).join(' · ') || String(view.viewId ?? relativePath),
        courseProfile,
      }
    } catch {
      return null
    }
  }))

  return options
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) =>
      (left.courseProfile === 'GK' ? 0 : left.courseProfile === 'LK' ? 1 : 2)
      - (right.courseProfile === 'GK' ? 0 : right.courseProfile === 'LK' ? 1 : 2)
      || left.path.localeCompare(right.path))
}

const buildCanonicalTreeNode = ({
  goalId,
  goalById,
  allMappedSourceIdsByCanonicalGoalId,
  mappedSourceIdsByCanonicalDescendantId,
  displayLabel,
  visiting = new Set<string>(),
}: {
  goalId: string
  goalById: Map<string, Record<string, unknown>>
  allMappedSourceIdsByCanonicalGoalId: Map<string, string[]>
  mappedSourceIdsByCanonicalDescendantId: Map<string, string[]>
  displayLabel?: string
  visiting?: Set<string>
}): Record<string, unknown> | null => {
  if (visiting.has(goalId)) return null
  const goal = goalById.get(goalId)
  if (!goal) return null

  const nextVisiting = new Set(visiting)
  nextVisiting.add(goalId)
  const children = asStringArray(goal.contains)
    .map((childId) => buildCanonicalTreeNode({
      goalId: childId,
      goalById,
      allMappedSourceIdsByCanonicalGoalId,
      mappedSourceIdsByCanonicalDescendantId,
      visiting: nextVisiting,
    }))
    .filter((entry): entry is Record<string, unknown> => entry !== null)

  return {
    id: `goal:${goalId}`,
    kind: 'goal',
    goalId,
    title: displayLabel || String(goal.title ?? goalId),
    originalTitle: String(goal.title ?? goalId),
    description: String(goal.description ?? ''),
    sourceRef: String(goal.sourceRef ?? ''),
    type: String(goal.type ?? (asStringArray(goal.contains).length > 0 ? 'cluster' : 'atomic')),
    tags: asStringArray(goal.tags),
    mappedSourceGoalIds: allMappedSourceIdsByCanonicalGoalId.get(goalId) ?? [],
    coveredSourceGoalIds: mappedSourceIdsByCanonicalDescendantId.get(goalId) ?? [],
    children,
  }
}

const buildCompositionTreeNode = ({
  node,
  goalById,
  allMappedSourceIdsByCanonicalGoalId,
  mappedSourceIdsByCanonicalDescendantId,
}: {
  node: Record<string, unknown>
  goalById: Map<string, Record<string, unknown>>
  allMappedSourceIdsByCanonicalGoalId: Map<string, string[]>
  mappedSourceIdsByCanonicalDescendantId: Map<string, string[]>
}): Record<string, unknown> | null => {
  const kind = String(node.kind ?? '')

  if (kind === 'structure') {
    const nodeId = String(node.id ?? '')
    const children = (Array.isArray(node.children) ? node.children.map(asRecord) : [])
      .map((child) => buildCompositionTreeNode({
        node: child,
        goalById,
        allMappedSourceIdsByCanonicalGoalId,
        mappedSourceIdsByCanonicalDescendantId,
      }))
      .filter((entry): entry is Record<string, unknown> => entry !== null)
    return {
      id: `structure:${nodeId || String(node.label ?? 'structure')}`,
      kind: 'structure',
      title: String(node.label ?? (nodeId || 'Struktur')),
      children,
    }
  }

  if (kind === 'canonicalSubtree' || kind === 'goalEntry') {
    const goalId = String(node.goalId ?? '')
    if (!goalId) return null
    return buildCanonicalTreeNode({
      goalId,
      goalById,
      allMappedSourceIdsByCanonicalGoalId,
      mappedSourceIdsByCanonicalDescendantId,
      displayLabel: typeof node.displayLabel === 'string' ? node.displayLabel : undefined,
    })
  }

  return null
}

const buildCurriculumMappingPayload = async (sourceLandscapeId: string, requestedViewPath: string) => {
  const sourceEntries = await readSourceLandscapeRegistry()
  const sourceEntry = sourceEntries.find((entry) => entry.landscapeId === sourceLandscapeId)
  if (!sourceEntry) {
    return { error: 'Unknown source landscape.' }
  }

  const sourcePath = resolveReadableRepoFile(String(sourceEntry.archiveSourcePath ?? sourceEntry.sourcePath ?? ''))
  if (!sourcePath) {
    return { error: 'Source snapshot is not readable.' }
  }

  const mappingFiles = (await readMappingFiles()).filter(({ mapping }) => mapping.sourceLandscapeId === sourceLandscapeId)
  const firstMapping = mappingFiles[0]?.mapping
  const targetLandscapeId = String(firstMapping?.targetLandscapeId ?? '')
  const canonicalEntry = await readCanonicalLandscapeById(targetLandscapeId)
  if (!firstMapping || !canonicalEntry) {
    return { error: 'No readable mapping into a canonical target landscape was found.' }
  }

  const sourceLandscape = await readJsonFile(sourcePath.absolutePath)
  const canonicalLandscape = canonicalEntry.landscape
  const snapshotSourceGoals = Array.isArray(sourceLandscape.goals) ? sourceLandscape.goals.map(asRecord) : []
  const canonicalGoals = Array.isArray(canonicalLandscape.goals) ? canonicalLandscape.goals.map(asRecord) : []
  const subject = String(sourceLandscape.subject ?? '')
  const sourceExtraction = await readSourceExtraction(sourceEntry, sourceLandscapeId)
  const usingSourceExtraction = sourceExtraction !== null
  const sourceGoals = sourceExtraction?.sourceGoals ?? snapshotSourceGoals
  const pipelineStatus = sourceExtraction
    ? await readQualityPipelineStatusForSourcePath(sourceExtraction.path) ?? sourceExtraction.pipelineStatus
    : null
  const sourceGoalIdSet = new Set(sourceGoals.map((goal) => String(goal.id ?? '')).filter(Boolean))
  const canonicalGoalById = new Map(canonicalGoals.map((goal) => [String(goal.id ?? ''), goal]))
  const sourceTopicCodeByGoalId = buildSourceTopicCodeByGoalId(sourceGoals)
  const officialPassages = sourceExtraction?.passages ?? await readOfficialSourcePassages(sourceEntry, subject)
  const officialPassageByTopicCode = new Map(officialPassages.map((passage) => [passage.topicCode, passage]))
  const officialPassageById = new Map(officialPassages.map((passage) => [passage.id, passage]))
  const membershipByLandscapeId = await readSourceMembershipByLandscapeId()
  const closureByLandscapeId = await readSourceClosureByLandscapeId()
  const registeredSourceGoalIds = membershipByLandscapeId.get(sourceLandscapeId) ?? new Set<string>()
  const closureByGoalId = closureByLandscapeId.get(sourceLandscapeId) ?? new Map<string, string[]>()

  const mappingEntries = mappingFiles.flatMap(({ path: mappingPath, mapping }) =>
    mappingEntryList(mapping).map((entry) => ({
      mappingPath,
      legacyGoalId: String(entry.legacyGoalId ?? ''),
      canonicalGoalId: String(entry.canonicalGoalId ?? ''),
      matchType: String(entry.matchType ?? 'unspecified'),
    })).filter((entry) => entry.legacyGoalId && entry.canonicalGoalId && sourceGoalIdSet.has(entry.legacyGoalId)))

  const mappingsBySourceGoalId = new Map<string, Array<{ canonicalGoalId: string, matchType: string, mappingPath: string }>>()
  const sourceGoalIdsByCanonicalGoalId = new Map<string, string[]>()
  mappingEntries.forEach((entry) => {
    const sourceMappings = mappingsBySourceGoalId.get(entry.legacyGoalId) ?? []
    sourceMappings.push({
      canonicalGoalId: entry.canonicalGoalId,
      matchType: entry.matchType,
      mappingPath: entry.mappingPath,
    })
    mappingsBySourceGoalId.set(entry.legacyGoalId, sourceMappings)

    const sourceIds = sourceGoalIdsByCanonicalGoalId.get(entry.canonicalGoalId) ?? []
    sourceIds.push(entry.legacyGoalId)
    sourceGoalIdsByCanonicalGoalId.set(entry.canonicalGoalId, [...new Set(sourceIds)])
  })

  const canonicalDescendantsByGoalId = new Map<string, Set<string>>()
  canonicalGoals.forEach((goal) => {
    const goalId = String(goal.id ?? '')
    if (!goalId) return
    canonicalDescendantsByGoalId.set(goalId, collectGoalDescendantIds(goalId, canonicalGoalById))
  })

  const mappedSourceIdsByCanonicalDescendantId = new Map<string, string[]>()
  canonicalDescendantsByGoalId.forEach((descendantIds, goalId) => {
    const sourceIds = new Set<string>()
    descendantIds.forEach((descendantId) => {
      ;(sourceGoalIdsByCanonicalGoalId.get(descendantId) ?? []).forEach((sourceId) => sourceIds.add(sourceId))
    })
    mappedSourceIdsByCanonicalDescendantId.set(goalId, [...sourceIds])
  })

  const sourceRows = sourceGoals.map((goal) => {
    const goalId = String(goal.id ?? '')
    const directMappings = mappingsBySourceGoalId.get(goalId) ?? []
    const closureAtomicGoalIds = usingSourceExtraction ? [goalId] : closureByGoalId.get(goalId) ?? []
    const closureMappings = closureAtomicGoalIds.flatMap((atomicGoalId) => mappingsBySourceGoalId.get(atomicGoalId) ?? [])
    const allCanonicalGoalIds = [...new Set([...directMappings, ...closureMappings].map((entry) => entry.canonicalGoalId))]
    const topicCode = sourceTopicCodeByGoalId.get(goalId) ?? ''
    const extractionPassageId = typeof goal.passageId === 'string' ? goal.passageId : ''
    const officialPassage = extractionPassageId
      ? officialPassageById.get(extractionPassageId)
      : officialPassageByTopicCode.get(topicCode)
    const childrenIds = asStringArray(goal.contains)
    return {
      id: goalId,
      title: normalizeGermanText(String(goal.title ?? goalId)),
      description: normalizeGermanText(String(goal.description ?? '')),
      sourceText: normalizeGermanText(String(goal.sourceText ?? '')),
      sourceSpan: normalizeGermanText(String(goal.sourceSpan ?? '')),
      parentBulletText: normalizeGermanText(String(goal.parentBulletText ?? '')),
      sourceRef: normalizeGermanText(String(goal.sourceRef ?? '')),
      topicCode,
      passageId: extractionPassageId,
      granularity: String(goal.granularity ?? ''),
      tags: asStringArray(goal.tags),
      requires: asStringArray(goal.requires),
      childrenIds,
      type: String(goal.type ?? (childrenIds.length > 0 ? 'cluster' : 'atomic')),
      registered: usingSourceExtraction || registeredSourceGoalIds.has(goalId),
      closureAtomicGoalIds,
      directMappings,
      closureCanonicalGoalIds: [...new Set(closureMappings.map((entry) => entry.canonicalGoalId))],
      canonicalGoalIds: allCanonicalGoalIds,
      matchTypes: [...new Set([...directMappings, ...closureMappings].map((entry) => entry.matchType))],
      officialPassageIds: officialPassage ? [officialPassage.id] : [],
    }
  })
  const sourceGoalIdsByOfficialPassageId = new Map<string, string[]>()
  sourceRows.forEach((sourceRow) => {
    sourceRow.officialPassageIds.forEach((passageId) => {
      const sourceGoalIds = sourceGoalIdsByOfficialPassageId.get(passageId) ?? []
      sourceGoalIds.push(sourceRow.id)
      sourceGoalIdsByOfficialPassageId.set(passageId, sourceGoalIds)
    })
  })
  const officialPassagesWithSourceGoalIds = officialPassages.map((passage) => ({
    ...passage,
    sourceGoalIds: sourceGoalIdsByOfficialPassageId.get(passage.id) ?? [],
  }))

  const jurisdiction = String(sourceEntry.jurisdiction ?? '')
  const stage = inferStageFromSourceEntry(sourceEntry)
  const viewOptions = await findMappingCompositionViewOptions({
    targetLandscapeId,
    jurisdiction,
    stage,
  })
  const selectedViewOption = viewOptions.find((entry) => entry.path === requestedViewPath) ?? viewOptions[0] ?? null
  const selectedView = selectedViewOption
    ? await readJsonFile(path.resolve(REPO_ROOT, selectedViewOption.path))
    : null
  const canonicalRoots = selectedView && isCompositionViewPayload(selectedView)
    ? (Array.isArray(selectedView.rootNodes) ? selectedView.rootNodes.map(asRecord) : [])
      .map((node) => buildCompositionTreeNode({
        node,
        goalById: canonicalGoalById,
        allMappedSourceIdsByCanonicalGoalId: sourceGoalIdsByCanonicalGoalId,
        mappedSourceIdsByCanonicalDescendantId,
      }))
      .filter((entry): entry is Record<string, unknown> => entry !== null)
    : getRootGoalIds(canonicalGoals)
      .map((goalId) => buildCanonicalTreeNode({
        goalId,
        goalById: canonicalGoalById,
        allMappedSourceIdsByCanonicalGoalId: sourceGoalIdsByCanonicalGoalId,
        mappedSourceIdsByCanonicalDescendantId,
      }))
      .filter((entry): entry is Record<string, unknown> => entry !== null)

  const registeredCount = sourceRows.filter((goal) => goal.registered).length
  const directMappedCount = sourceRows.filter((goal) => goal.directMappings.length > 0).length
  const closureMappedCount = sourceRows.filter((goal) => goal.canonicalGoalIds.length > 0).length

  return {
    source: {
      landscapeId: sourceLandscapeId,
      title: sourceExtraction?.title || String(sourceLandscape.title ?? sourceEntry.title ?? sourceLandscapeId),
      subject,
      jurisdiction,
      stage,
      path: sourceExtraction?.path ?? sourcePath.relativePath,
      referenceLinks: await readSourceReferenceLinks(sourceEntry, subject),
      pipelineStatus,
      officialPassages: officialPassagesWithSourceGoalIds,
      rootGoalIds: usingSourceExtraction ? sourceRows.map((goal) => goal.id) : getRootGoalIds(sourceGoals),
      goals: sourceRows,
      stats: {
        totalGoals: sourceRows.length,
        registeredGoals: registeredCount,
        unregisteredGoals: sourceRows.length - registeredCount,
        directlyMappedGoals: directMappedCount,
        closureMappedGoals: closureMappedCount,
      },
    },
    target: {
      landscapeId: targetLandscapeId,
      title: String(canonicalLandscape.title ?? targetLandscapeId),
      path: canonicalEntry.path,
      rootNodes: canonicalRoots,
      viewOptions,
      selectedViewPath: selectedViewOption?.path ?? '',
      selectedViewLabel: selectedViewOption?.label ?? '',
    },
    mappings: {
      count: mappingEntries.length,
      exact: mappingEntries.filter((entry) => entry.matchType === 'exact').length,
      partial: mappingEntries.filter((entry) => entry.matchType === 'partial').length,
      mappingPaths: mappingFiles.map((entry) => entry.path),
    },
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
      if (
        !requestUrl.pathname.startsWith('/__deck-editor')
        && !requestUrl.pathname.startsWith('/__graph-editor')
        && !requestUrl.pathname.startsWith('/__canonical-cluster-editor')
        && !requestUrl.pathname.startsWith('/__composition-view-editor')
        && !requestUrl.pathname.startsWith('/__semantic-atomicity-review')
        && !requestUrl.pathname.startsWith('/__quality-dashboard')
        && !requestUrl.pathname.startsWith('/__curriculum-mapping-workbench')
        && !requestUrl.pathname.startsWith('/__authoring')
        && requestUrl.pathname !== '/api/ui/composition-views/match'
      ) {
        next()
        return
      }

      void (async () => {
        if (requestUrl.pathname === '/__quality-dashboard/status') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          if (!existsSync(QUALITY_STATUS_PATH)) {
            sendJson(res, 404, {
              error: 'Curriculum quality status not generated.',
              command: 'npm run quality:curriculum-status',
            })
            return
          }

          const status = JSON.parse(await fs.readFile(QUALITY_STATUS_PATH, 'utf8'))
          sendJson(res, 200, {
            path: toPosixPath(path.relative(REPO_ROOT, QUALITY_STATUS_PATH)),
            status,
          })
          return
        }

        if (requestUrl.pathname === '/__curriculum-mapping-workbench/list') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          sendJson(res, 200, await buildCurriculumMappingList())
          return
        }

        if (requestUrl.pathname === '/__curriculum-mapping-workbench/load') {
          if (req.method !== 'GET') {
            sendJson(res, 405, { error: 'Method not allowed' })
            return
          }

          const sourceLandscapeId = requestUrl.searchParams.get('sourceLandscapeId') ?? ''
          const viewPath = requestUrl.searchParams.get('viewPath') ?? ''
          if (!sourceLandscapeId.trim()) {
            sendJson(res, 400, { error: 'Missing sourceLandscapeId.' })
            return
          }

          const payload = await buildCurriculumMappingPayload(sourceLandscapeId, viewPath)
          if ('error' in payload) {
            sendJson(res, 404, payload)
            return
          }

          sendJson(res, 200, payload)
          return
        }

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
          const configuredLeafGoalIds = Array.isArray(scope.leafGoalIds)
            ? scope.leafGoalIds.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            : []
          const goals = (Array.isArray(landscape.goals) ? landscape.goals : [])
            .filter((goal): goal is Record<string, unknown> => typeof goal === 'object' && goal !== null && !Array.isArray(goal))
          const goalById = new Map(goals.map((goal) => [String(goal.id ?? ''), goal]))
          const scopeGoalIds = configuredLeafGoalIds.length > 0
            ? new Set(configuredLeafGoalIds)
            : collectSemanticScopeGoalIds(rootGoalIds, goalById)
          const leafGoals = Array.from(scopeGoalIds)
            .map((goalId) => goalById.get(goalId))
            .filter((goal): goal is Record<string, unknown> => !!goal && isLeafGoal(goal))
            .sort((left, right) => normalizeSemanticText(left.title).localeCompare(normalizeSemanticText(right.title), 'de'))
          const reviewRecords = existsSync(reviewAbsolutePath)
            ? parseJsonl(await fs.readFile(reviewAbsolutePath, 'utf8'))
            : []
          const reviewByGoalId = new Map(reviewRecords.map((record) => [String(record.goalId ?? ''), record]))
          const currentLeafGoalIds = new Set(leafGoals.map((goal) => String(goal.id ?? '')))
          const obsoleteRecords = reviewRecords.filter((record) => !currentLeafGoalIds.has(String(record.goalId ?? '')))

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
