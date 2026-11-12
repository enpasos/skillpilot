// SPDX-License-Identifier: Apache-2.0
// The current curriculum declarations, never a migration history, own this scope.
import { createHash } from 'node:crypto'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AuditLandscape } from './auditTransitiveMinimality'
import type { VerificationInputReader } from './lib/verificationInputSnapshot'

export const CURRENT_CANONICAL_CATALOG_PATH = 'curricula/DE/Gymnasium/canonical'
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const overviewName = 'DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'
export type CurrentCatalogEntry = { path: string; landscape: AuditLandscape }
export type CurrentCatalogSource = Readonly<{ path: string; landscapeId: string; currentDocumentDigest: string }>
const loadedInventories = new WeakSet<readonly CurrentCatalogSource[]>()

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Current curriculum catalog: ${message}`)
}
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const identifier = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && !/[:\s]/u.test(value)
function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (object(value)) return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`).join(',')}}`
  return JSON.stringify(value)
}
export const fingerprintCurrentCurriculumDocument = (document: unknown): string =>
  `sha256:${createHash('sha256').update(stableJson(document)).digest('hex')}`

/** A caller-computed digest list cannot stand in for the complete declarations. */
export function requireCurrentCatalogInventory(
  sources: readonly CurrentCatalogSource[] | undefined,
): asserts sources is readonly CurrentCatalogSource[] {
  ensure(sources && loadedInventories.has(sources), 'registered current catalog inventory is required')
}

/** Read complete raw documents through the same snapshot used by the producer.
 * The manifest owns the overview; its explicit subject declaration owns the
 * complete catalog, including subjects without routes, reviews or CI floors.
 */
export function loadCurrentCurriculumCatalog(
  inputs: VerificationInputReader,
  root = repositoryRoot,
): { entries: CurrentCatalogEntry[]; sources: readonly CurrentCatalogSource[] } {
  const catalogDirectory = resolve(root, CURRENT_CANONICAL_CATALOG_PATH)
  const readJson = (path: string): unknown => JSON.parse(inputs.readText(path))
  const overview = readJson(join(catalogDirectory, overviewName))
  ensure(object(overview) && identifier(overview.landscapeId), 'missing or invalid canonical overview')
  const manifest = readJson(resolve(root, 'curricula/curriculum_manifest.json'))
  ensure(object(manifest) && Array.isArray(manifest.curricula), 'missing curriculum manifest roots')
  const rootIds = manifest.curricula.map(entry => {
    ensure(object(entry) && identifier(entry.id), 'invalid curriculum manifest root')
    return entry.id
  })
  ensure(new Set(rootIds).size === rootIds.length, 'duplicate curriculum manifest root')
  ensure(rootIds.includes(overview.landscapeId), 'canonical overview is not a declared curriculum root')

  const flow = overview.personalizationFlow
  ensure(object(flow) && Array.isArray(flow.stages), 'missing canonical subject declaration')
  const stages = flow.stages.filter(stage => object(stage) && stage.id === 'subject')
  ensure(stages.length === 1 && Array.isArray(stages[0].groups), 'missing or duplicate canonical subject stage')
  const groups = stages[0].groups.filter((group: unknown) => object(group) && group.id === 'subject')
  ensure(groups.length === 1 && object(groups[0].source), 'missing or duplicate canonical subject group')
  const source = groups[0].source
  ensure(source.kind === 'offeredLandscapes' && Array.isArray(source.landscapeIds)
    && source.landscapeIds.length > 0 && source.landscapeIds.every(identifier), 'invalid canonical subject owners')
  const owners = new Set<string>([overview.landscapeId, ...source.landscapeIds])
  ensure(owners.size === source.landscapeIds.length + 1, 'duplicate canonical subject owner')

  const files: string[] = []
  const collect = (directory: string) => {
    for (const entry of inputs.readDirectory(directory)) {
      const file = join(directory, entry.name)
      ensure(entry.isDirectory() || entry.isFile(), `non-regular catalog entry ${file}`)
      if (entry.isDirectory()) collect(file)
      else if (/\.json$/iu.test(entry.name) && !/_deck/iu.test(entry.name)) files.push(file)
    }
  }
  collect(catalogDirectory)
  files.sort()
  ensure(files.length === owners.size, 'missing or additional canonical source')
  const seen = new Set<string>()
  const entries = files.map(file => {
    const landscape = readJson(file)
    ensure(object(landscape) && identifier(landscape.landscapeId), `invalid canonical document ${file}`)
    ensure(owners.has(landscape.landscapeId), `undeclared canonical owner ${landscape.landscapeId}`)
    ensure(!seen.has(landscape.landscapeId), `duplicate canonical root ${landscape.landscapeId}`)
    seen.add(landscape.landscapeId)
    ensure(Array.isArray(landscape.goals) && landscape.goals.length > 0, `empty or invalid canonical root ${landscape.landscapeId}`)
    return { path: relative(root, file).split(sep).join('/'), landscape: landscape as unknown as AuditLandscape }
  })
  ensure(seen.size === owners.size, 'incomplete canonical owner coverage')
  const sources = Object.freeze(entries.map(({ path, landscape }) => Object.freeze({
    path, landscapeId: landscape.landscapeId, currentDocumentDigest: fingerprintCurrentCurriculumDocument(landscape),
  })))
  loadedInventories.add(sources)
  return { entries, sources }
}
