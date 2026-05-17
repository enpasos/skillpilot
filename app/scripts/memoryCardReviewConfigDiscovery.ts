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
