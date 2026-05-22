import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface SourceLandscapeRegistry {
  version?: number
  entries?: SourceLandscapeRegistryEntry[]
}

interface SourceLandscapeRegistryEntry {
  landscapeId?: string
  title?: string
  archiveSourcePath?: string
  sourcePath?: string
}

interface SourcePayload {
  id?: string
  landscapeId?: string
  sourceLandscapeId?: string
  goals?: unknown
  sourceGoals?: unknown
}

interface Finding {
  kind: 'invalid-json' | 'id-mismatch' | 'invalid-payload'
  expectedLandscapeId: string
  actualLandscapeId?: string
  path: string
  title?: string
  message?: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const curriculaDir = resolve(repoRoot, 'curricula')
const registryPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/provenance/source-landscape-registry.json',
)

const retainedAssetPathNormalizations = new Map([
  ['curricula/DE/Gymnasium/input/DE-HE/', 'curricula/DE/Gymnasium/input/HE/'],
  ['curricula/DE/Gymnasium/input/DE-BY/', 'curricula/DE/Gymnasium/input/BY/'],
])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeRetainedAssetPath(repoRelativePath: string): string {
  for (const [from, to] of retainedAssetPathNormalizations) {
    if (repoRelativePath.startsWith(from)) {
      return `${to}${repoRelativePath.slice(from.length)}`
    }
  }
  return repoRelativePath
}

function registryPathCandidates(repoRelativePath: string): string[] {
  const normalized = normalizeRetainedAssetPath(repoRelativePath)
  return normalized === repoRelativePath ? [repoRelativePath] : [repoRelativePath, normalized]
}

function resolveRegistryRepoPath(repoRelativePath: string): string {
  for (const candidatePath of registryPathCandidates(repoRelativePath)) {
    const directCandidate = resolve(curriculaDir, candidatePath)
    if (existsSync(directCandidate)) return directCandidate

    const repoCandidate = resolve(repoRoot, candidatePath)
    if (existsSync(repoCandidate)) return repoCandidate

    if (candidatePath.startsWith('curricula/')) {
      const curriculaRelativeCandidate = resolve(
        curriculaDir,
        candidatePath.slice('curricula/'.length),
      )
      if (existsSync(curriculaRelativeCandidate)) return curriculaRelativeCandidate
    }
  }

  const normalized = normalizeRetainedAssetPath(repoRelativePath)
  return normalized.startsWith('curricula/')
    ? resolve(curriculaDir, normalized.slice('curricula/'.length))
    : resolve(curriculaDir, normalized)
}

function isRegularFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile()
}

function isJsonLikePath(path: string): boolean {
  const lower = path.toLowerCase()
  return lower.endsWith('.json') || lower.endsWith('.json.snapshot')
}

function readRegistry(): SourceLandscapeRegistry {
  const root = JSON.parse(readFileSync(registryPath, 'utf8')) as unknown
  if (!isObject(root)) {
    throw new Error(`Invalid source landscape registry root: ${registryPath}`)
  }
  return root as SourceLandscapeRegistry
}

function getPayloadLandscapeId(payload: SourcePayload): string | undefined {
  if (typeof payload.sourceLandscapeId === 'string' && Array.isArray(payload.sourceGoals)) {
    return payload.sourceLandscapeId
  }
  if (Array.isArray(payload.goals)) {
    if (typeof payload.landscapeId === 'string') return payload.landscapeId
    if (typeof payload.id === 'string') return payload.id
  }
  return undefined
}

function checkEntry(entry: SourceLandscapeRegistryEntry): Finding | null {
  if (!entry.landscapeId || !entry.archiveSourcePath) return null

  const archivePath = resolveRegistryRepoPath(entry.archiveSourcePath)
  if (!isRegularFile(archivePath) || !isJsonLikePath(archivePath)) return null

  let payload: SourcePayload
  try {
    payload = JSON.parse(readFileSync(archivePath, 'utf8')) as SourcePayload
  } catch (error) {
    return {
      kind: 'invalid-json',
      expectedLandscapeId: entry.landscapeId,
      path: archivePath,
      title: entry.title,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  const payloadLandscapeId = getPayloadLandscapeId(payload)
  if (!payloadLandscapeId) {
    return {
      kind: 'invalid-payload',
      expectedLandscapeId: entry.landscapeId,
      path: archivePath,
      title: entry.title,
      message: 'JSON source is neither a landscape payload nor a source-extraction payload.',
    }
  }

  if (payloadLandscapeId !== entry.landscapeId) {
    return {
      kind: 'id-mismatch',
      expectedLandscapeId: entry.landscapeId,
      actualLandscapeId: payloadLandscapeId,
      path: archivePath,
      title: entry.title,
    }
  }

  return null
}

function main() {
  const registry = readRegistry()
  if (registry.version !== 1 || !Array.isArray(registry.entries)) {
    throw new Error(`Unsupported source landscape registry shape: ${registryPath}`)
  }

  const findings = registry.entries
    .map((entry) => checkEntry(entry))
    .filter((finding): finding is Finding => finding !== null)

  if (findings.length > 0) {
    console.error(`Source landscape registry check failed with ${findings.length} finding(s):`)
    findings.forEach((finding) => {
      console.error(JSON.stringify(finding, null, 2))
    })
    process.exitCode = 1
    return
  }

  console.log(`Source landscape registry check passed (${registry.entries.length} registry entries).`)
}

main()
