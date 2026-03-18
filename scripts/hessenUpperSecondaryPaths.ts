import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const TOOLING_REGISTRY_PATH_CANDIDATES = [
  path.join(ROOT_DIR, 'curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json'),
  path.join(ROOT_DIR, 'curricula/DE/Gymnasium/input/HE/retained-asset-registry.json'),
]
const LEGACY_UPPER_SECONDARY_PATH_PREFIX = 'curricula/DE/Gymnasium/input/DE-HE/'
const UPPER_SECONDARY_PATH_PREFIX = 'curricula/DE/Gymnasium/input/HE/'

function normalizeToolingPath(filePath: string): string {
  return filePath.replaceAll(
    LEGACY_UPPER_SECONDARY_PATH_PREFIX,
    UPPER_SECONDARY_PATH_PREFIX,
  )
}

function resolveToolingRegistryPath(): string {
  const pathCandidate = TOOLING_REGISTRY_PATH_CANDIDATES.find((candidate) =>
    fs.existsSync(candidate),
  )
  if (!pathCandidate) {
    throw new Error(
      `Missing Hessen upper-secondary tooling registry: ${TOOLING_REGISTRY_PATH_CANDIDATES.join(', ')}`,
    )
  }
  return pathCandidate
}

type NormalizedToolingRegistry = Omit<
  ToolingRegistry,
  'abiArchivePath' | 'mappingArchivePath' | 'sourceLandscapeRegistryPath'
> & {
  abiArchivePath: string
  mappingArchivePath: string
  sourceLandscapeRegistryPath: string
}

type ToolingSubjectEntry = {
  abiDirectory: string
  landscapeId: string
  mappingFile: string
}

type ToolingRegistry = {
  abiArchivePath: string
  mappingArchivePath: string
  sourceLandscapeRegistryPath: string
  subjects: Record<string, ToolingSubjectEntry>
}

type SourceRegistryEntry = {
  archiveSourcePath?: string
  landscapeId: string
  sourcePath: string
}

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

const rawToolingRegistry = loadJson<ToolingRegistry>(resolveToolingRegistryPath())
const toolingRegistry = {
  ...rawToolingRegistry,
  abiArchivePath: normalizeToolingPath(rawToolingRegistry.abiArchivePath),
  mappingArchivePath: normalizeToolingPath(
    rawToolingRegistry.mappingArchivePath,
  ),
  sourceLandscapeRegistryPath: normalizeToolingPath(
    rawToolingRegistry.sourceLandscapeRegistryPath,
  ),
} as NormalizedToolingRegistry
const sourceRegistryPath = path.join(
  ROOT_DIR,
  toolingRegistry.sourceLandscapeRegistryPath,
)
const sourceRegistryEntries = new Map(
  loadJson<{ entries: SourceRegistryEntry[] }>(sourceRegistryPath).entries.map((entry) => [
    entry.landscapeId,
    {
      ...entry,
      archiveSourcePath: entry.archiveSourcePath
        ? normalizeToolingPath(entry.archiveSourcePath)
        : undefined,
      sourcePath: normalizeToolingPath(entry.sourcePath),
    },
  ]),
)

function getSubjectEntry(subjectKey: string): ToolingSubjectEntry {
  const subjectEntry = toolingRegistry.subjects[subjectKey]
  if (!subjectEntry) {
    throw new Error(`Unknown Hessen upper-secondary subject key: ${subjectKey}`)
  }
  return subjectEntry
}

export function resolveHessenUpperSecondaryAbiDirectory(
  subjectKey: string,
): string {
  return path.join(
    ROOT_DIR,
    toolingRegistry.abiArchivePath,
    getSubjectEntry(subjectKey).abiDirectory,
  )
}

export function resolveHessenUpperSecondaryLandscapePath(
  subjectKey: string,
): string {
  const subjectEntry = getSubjectEntry(subjectKey)
  const sourceEntry = sourceRegistryEntries.get(subjectEntry.landscapeId)
  if (!sourceEntry) {
    throw new Error(
      `Missing source-landscape registry entry for Hessen upper-secondary landscapeId ${subjectEntry.landscapeId}`,
    )
  }
  return path.join(
    ROOT_DIR,
    sourceEntry.archiveSourcePath || sourceEntry.sourcePath,
  )
}

export function resolveHessenUpperSecondaryMappingPath(
  subjectKey: string,
): string {
  return path.join(
    ROOT_DIR,
    toolingRegistry.mappingArchivePath,
    getSubjectEntry(subjectKey).mappingFile,
  )
}
