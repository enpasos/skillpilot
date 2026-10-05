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
    // A successor changes evidence paths, never the checked subject or scope.
    for (const field of ['reviewId', 'landscapeId', 'landscapePath', 'ruleVersion', 'scope', 'visibilityScopes', 'visibilityScopeCoverageRequired']) {
      if (JSON.stringify(active[field]) !== JSON.stringify(previous[field])) {
        throw new Error(`Active memory-card review config changes ${field}: ${activePath}`)
      }
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
