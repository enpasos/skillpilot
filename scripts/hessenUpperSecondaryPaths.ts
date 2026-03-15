import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const TOOLING_REGISTRY_PATH = path.join(
  ROOT_DIR,
  'curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json',
)

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
  landscapeId: string
  sourcePath: string
}

function loadJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
}

const toolingRegistry = loadJson<ToolingRegistry>(TOOLING_REGISTRY_PATH)
const sourceRegistryPath = path.join(
  ROOT_DIR,
  toolingRegistry.sourceLandscapeRegistryPath,
)
const sourceRegistryEntries = new Map(
  loadJson<{ entries: SourceRegistryEntry[] }>(sourceRegistryPath).entries.map(
    (entry) => [entry.landscapeId, entry],
  ),
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
  return path.join(ROOT_DIR, sourceEntry.sourcePath)
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
