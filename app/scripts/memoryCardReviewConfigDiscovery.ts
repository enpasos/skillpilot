import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export type MemoryCardReviewConfigRef = {
  reviewId: string
  configPath: string
  reportPath: string
}

export type DiscoverMemoryCardReviewConfigOptions = {
  allowEmpty?: boolean
}

// Current evidence may check additional authored views while predecessor
// reports stay immutable. Existing checked views may never be removed,
// relabelled, rebound or reordered through successor routing.
export function preservesMemoryVisibilityScopes(previous: unknown, active: unknown): boolean {
  if (!Array.isArray(previous) || !Array.isArray(active) || active.length < previous.length) return false
  if (!previous.every((scope, index) => JSON.stringify(scope) === JSON.stringify(active[index]))) return false
  const viewPaths = new Set<string>()
  for (const scope of active) {
    if (scope === null || typeof scope !== 'object'
      || typeof scope.label !== 'string' || scope.label.trim().length === 0
      || typeof scope.viewPath !== 'string' || scope.viewPath.trim().length === 0
      || viewPaths.has(scope.viewPath)) return false
    viewPaths.add(scope.viewPath)
  }
  return true
}

// An additional required coverage check strengthens the existing evidence.
// Once required, coverage cannot be disabled by a successor configuration.
export function preservesMemoryVisibilityCoverageRequirement(previous: unknown, active: unknown): boolean {
  if (![undefined, false, true].includes(previous as undefined | boolean)
    || ![undefined, false, true].includes(active as undefined | boolean)) return false
  return previous === active || (previous !== true && active === true)
}

export const defaultMemoryCardReviewConfigDir = 'curricula/DE/Gymnasium/quality/memory-card-review'
const activeReviewRegistryPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function repoRelative(absolutePath: string): string {
  const relativePath = toPosixPath(relative(repoRoot, absolutePath))
  if (relativePath === '' || relativePath.startsWith('..')) {
    throw new Error(`Path is outside the repository: ${absolutePath}`)
  }
  return relativePath
}

export function discoverMemoryCardReviewConfigs(
  configDir = defaultMemoryCardReviewConfigDir,
  options: DiscoverMemoryCardReviewConfigOptions = {},
): MemoryCardReviewConfigRef[] {
  const absoluteDir = resolve(repoRoot, configDir)
  if (!existsSync(absoluteDir)) {
    if (options.allowEmpty) return []
    throw new Error(`Memory-card review config directory does not exist: ${configDir}`)
  }

  const configPaths = readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.config.json'))
    .map((entry) => repoRelative(resolve(absoluteDir, entry.name)))
    .sort((left, right) => left.localeCompare(right, 'en'))

  if (configPaths.length === 0) {
    if (options.allowEmpty) return []
    throw new Error(`No memory-card review config files found in ${configDir}`)
  }

  return configPaths.map((configPath) => {
    const parsed = JSON.parse(readFileSync(resolve(repoRoot, configPath), 'utf8')) as {
      reviewId?: unknown
      reportPath?: unknown
    }
    if (typeof parsed.reviewId !== 'string' || parsed.reviewId.trim().length === 0) {
      throw new Error(`Memory-card review config has no reviewId: ${configPath}`)
    }
    return {
      reviewId: parsed.reviewId,
      configPath,
      reportPath: typeof parsed.reportPath === 'string' && parsed.reportPath.trim().length > 0
        ? parsed.reportPath
        : `docs/qa-ci/status/memory-card-review-${parsed.reviewId}.md`,
    }
  })
}

// A retained report can belong to a successor config outside the default
// authoring directory. Resolve its recorded owner rather than rewriting the
// snapshot with the default config's notice.
export function discoverRetainedMemoryCardReviewConfigs(
  activeReportPaths: ReadonlySet<string>,
  statusDir = 'docs/qa-ci/status',
): MemoryCardReviewConfigRef[] {
  const retained = new Map(discoverMemoryCardReviewConfigs()
    .filter((configRef) => !activeReportPaths.has(configRef.reportPath))
    .map((configRef) => [configRef.reportPath, configRef]))
  const snapshots = readdirSync(resolve(repoRoot, statusDir), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => repoRelative(resolve(repoRoot, statusDir, entry.name)))
    .filter((reportPath) => !activeReportPaths.has(reportPath))
    .sort((left, right) => left.localeCompare(right, 'en'))
    .flatMap((reportPath) => {
      const header = readFileSync(resolve(repoRoot, reportPath), 'utf8').split(/\r?\n/).slice(0, 16)
      if (!header.includes('> Generated by: `app/scripts/memoryCardReview.ts`')) return []
      const sourceLine = header.find((line) => line.startsWith('> Source of truth: `'))
      const owner = sourceLine?.match(/^> Source of truth: `([^`]+)`$/)?.[1]
      if (!owner) throw new Error(`Retained memory-card report has no config owner: ${reportPath}`)
      const configPath = repoRelative(resolve(repoRoot, owner))
      const parsed = JSON.parse(readFileSync(resolve(repoRoot, configPath), 'utf8')) as {
        reviewId?: unknown
        reportPath?: unknown
      }
      if (typeof parsed.reviewId !== 'string' || parsed.reviewId.trim().length === 0) {
        throw new Error(`Retained memory-card review config has no reviewId: ${configPath}`)
      }
      const configuredReportPath = typeof parsed.reportPath === 'string' && parsed.reportPath.trim().length > 0
        ? parsed.reportPath
        : `docs/qa-ci/status/memory-card-review-${parsed.reviewId}.md`
      if (configuredReportPath !== reportPath) {
        throw new Error(`Retained memory-card report does not match its config owner: ${reportPath}`)
      }
      return [{ reviewId: parsed.reviewId, configPath, reportPath }]
    })
  for (const snapshot of snapshots) retained.set(snapshot.reportPath, snapshot)
  return [...retained.values()].sort((left, right) => left.reportPath.localeCompare(right.reportPath, 'en'))
}

// The central rollout registry selects current evidence; predecessors remain
// available for an explicitly configured historical review.
export function discoverActiveMemoryCardReviewConfigs(
  configDir = defaultMemoryCardReviewConfigDir,
  registryPath = activeReviewRegistryPath,
): MemoryCardReviewConfigRef[] {
  const configs = discoverMemoryCardReviewConfigs(configDir)
  const registry = JSON.parse(readFileSync(resolve(repoRoot, registryPath), 'utf8')) as {
    subjects: Array<{ landscapePath: string; memoryReviewConfigPath: string }>
  }
  const activeByLandscapeId = new Map<string, string>()
  for (const subject of registry.subjects) {
    const landscape = JSON.parse(readFileSync(resolve(repoRoot, subject.landscapePath), 'utf8')) as {
      landscapeId: string
    }
    if (!landscape.landscapeId || !subject.memoryReviewConfigPath) {
      throw new Error(`Incomplete active memory-card review config for ${subject.landscapePath}`)
    }
    if (activeByLandscapeId.has(landscape.landscapeId)) {
      throw new Error(`Duplicate active memory-card review config for ${landscape.landscapeId}`)
    }
    activeByLandscapeId.set(landscape.landscapeId, repoRelative(resolve(repoRoot, subject.memoryReviewConfigPath)))
  }

  const selected = configs.map((configRef) => {
    const previous = JSON.parse(readFileSync(resolve(repoRoot, configRef.configPath), 'utf8')) as Record<string, unknown>
    const activePath = activeByLandscapeId.get(previous.landscapeId as string)
    if (!activePath) return configRef
    activeByLandscapeId.delete(previous.landscapeId as string)
    const active = JSON.parse(readFileSync(resolve(repoRoot, activePath), 'utf8')) as Record<string, unknown>
    // Evidence routing preserves the checked subject, goal scope and card
    // requirements. Additional views expand the existing visibility checks.
    for (const field of ['reviewId', 'landscapeId', 'landscapePath', 'ruleVersion', 'scope']) {
      if (JSON.stringify(active[field]) !== JSON.stringify(previous[field])) {
        throw new Error(`Active memory-card review config changes ${field}: ${activePath}`)
      }
    }
    if (!preservesMemoryVisibilityCoverageRequirement(previous.visibilityScopeCoverageRequired, active.visibilityScopeCoverageRequired)) {
      throw new Error(`Active memory-card review config weakens or changes required visibility coverage: ${activePath}`)
    }
    if (JSON.stringify(active.visibilityScopes) !== JSON.stringify(previous.visibilityScopes)
      && !preservesMemoryVisibilityScopes(previous.visibilityScopes, active.visibilityScopes)) {
      throw new Error(`Active memory-card review config removes or changes visibility scopes: ${activePath}`)
    }
    return {
      reviewId: configRef.reviewId,
      configPath: activePath,
      reportPath: typeof active.reportPath === 'string' && active.reportPath.trim().length > 0
        ? active.reportPath
        : configRef.reportPath,
    }
  })
  if (activeByLandscapeId.size > 0) {
    throw new Error(`Active memory-card review configs have no configured predecessor: ${[...activeByLandscapeId.values()].join(', ')}`)
  }
  return selected
}
