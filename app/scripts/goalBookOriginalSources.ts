import { readFileSync, readdirSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { GoalBookModel, GoalBookApplicabilityScope } from './goalBookModel'
import type {
  GoalBookOriginalSourcesPayload,
  GoalBookOriginalSourcesEvidence,
} from '../src/utils/goalBookOriginalSources'

export type GoalBookOriginalSourcesIndex = GoalBookOriginalSourcesPayload

type Row = Record<string, unknown>
type Dimension = 'stage' | 'durationModel' | 'courseProfile'
type Facets = Pick<GoalBookOriginalSourcesEvidence['sourceScope'], Dimension>
interface Candidate {
  jurisdiction: string
  mappedTargetGoalId: string
  sourceGoalId: string
  mappingPath: string
  sourceExtractionPath: string
  title: string
  url: string
  sourceRef: string
  facets: Facets
}

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const record = (value: unknown): Row => (
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {}
)
const rows = (value: unknown): Row[] => Array.isArray(value) ? value.map(record) : []
const string = (value: unknown): string => typeof value === 'string' ? value.trim() : ''
const strings = (value: unknown): string[] => Array.isArray(value) ? value.map(string).filter(Boolean) : []
const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0
const tagValues = (value: Row, prefix: string): string[] => strings(value.tags)
  .filter((tag) => tag.startsWith(`${prefix}:`)).map((tag) => tag.slice(prefix.length + 1))

const localPath = (root: string, path: string): string => {
  const target = resolve(root, path)
  const child = relative(root, target)
  if (isAbsolute(path) || child === '..' || child.startsWith('../') || isAbsolute(child)) {
    throw new Error(`Original-source input must remain repository-relative: ${path}`)
  }
  return target
}
const readJson = (root: string, path: string): Row => record(JSON.parse(readFileSync(localPath(root, path), 'utf8')))
const reviewFiles = (root: string, path: string): string[] => readdirSync(localPath(root, path), { withFileTypes: true })
  .sort((a, b) => compare(a.name, b.name))
  .flatMap((entry) => entry.isDirectory() ? reviewFiles(root, `${path}/${entry.name}`)
    : entry.isFile() && entry.name.endsWith('.review.json') ? [`${path}/${entry.name}`] : [])

// Only explicit source metadata is used. Canonical phase/tags and view titles are
// not source evidence. A collection covering both stages does not locate a goal.
const facet = <D extends Dimension>(levels: Row[], dimension: D): Facets[D] | null => {
  const keys = dimension === 'courseProfile' ? ['courseProfile', 'courseLevel'] : [dimension]
  const allowed = dimension === 'stage' ? ['SekI', 'SekII'] : dimension === 'durationModel' ? ['G8', 'G9'] : ['GK', 'LK']
  let known: string[] | undefined
  for (const level of levels) {
    const groups = keys.flatMap((key) => [[string(level[key])].filter(Boolean), tagValues(level, key)])
    if (dimension === 'durationModel') groups.push(strings(level.durationModels))
    for (const values of groups) {
      const parsed = values.flatMap((value) => dimension === 'courseProfile' && ['GK_LK', 'GK/LK', 'both'].includes(value)
        ? ['GK', 'LK'] : value.split(/[+/_]/u))
      if (!parsed.length || parsed.some((value) => !allowed.includes(value))) continue
      const normalized = [...new Set(parsed)].sort(compare)
      known = known ? known.filter((value) => normalized.includes(value)) : normalized
      // Conflicting known restrictions are not an unspecified-scope waiver.
      if (!known.length) return null
    }
  }
  // An extraction spanning both stages alone does not locate an individual goal.
  return (dimension === 'stage' && known?.length === 2 ? [] : known ?? []) as Facets[D]
}

const sourceDocument = (extraction: Row, goal: Row, passage: Row): Row | undefined => {
  const documents = rows(extraction.sourceDocuments)
  if (!documents.length && Object.keys(record(extraction.sourceDocument)).length) documents.push(record(extraction.sourceDocument))
  const keys = [string(goal.sourceDocumentKey), ...tagValues(goal, 'sourceDocument'), string(passage.sourceDocumentKey)].filter(Boolean)
  // Contradictory or ambiguous document references must not select an arbitrary PDF.
  if (new Set(keys).size > 1) return undefined
  const matches = keys.length ? documents.filter((doc) => string(doc.key) === keys[0]) : documents
  return matches.length === 1 ? matches[0] : undefined
}

const officialUrl = (document: Row): string | null => {
  if (document.official !== true) return null
  const raw = string(document.url)
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' && !url.username && !url.password && !/\s/u.test(raw) ? raw : null
  } catch { return null }
}

const loadCandidates = (model: GoalBookModel, root: string): Candidate[] => {
  const result: Candidate[] = []
  const extractionCache = new Map<string, Row>()
  for (const mappingPath of reviewFiles(root, 'curricula/DE/Gymnasium/mapping')) {
    const mapping = readJson(root, mappingPath)
    if (string(mapping.targetLandscapeId) !== model.book.landscapeId) continue
    const sourceExtractionPath = string(mapping.sourceExtractionPath)
    if (!sourceExtractionPath) continue
    let extraction = extractionCache.get(sourceExtractionPath)
    if (!extraction) {
      extraction = readJson(root, sourceExtractionPath)
      extractionCache.set(sourceExtractionPath, extraction)
    }
    if (string(mapping.sourceLandscapeId) !== string(extraction.sourceLandscapeId)) {
      throw new Error(`Original-source landscape binding mismatch: ${mappingPath}`)
    }
    const jurisdiction = string(extraction.jurisdiction)
    if (!/^DE-[A-Z]{2}$/u.test(jurisdiction)) continue
    const sourceGoals = new Map(rows(extraction.sourceGoals).map((goal) => [string(goal.id), goal]))
    const passages = new Map(rows(extraction.passages).map((passage) => [string(passage.id), passage]))
    // decisions, not the compatibility mappings array, own reviewed target edges.
    for (const decision of rows(mapping.decisions)) {
      if (decision.decision !== 'mapped') continue
      const sourceGoalId = string(decision.sourceGoalId)
      const goal = sourceGoals.get(sourceGoalId)
      if (!goal) throw new Error(`Unknown original-source goal ${sourceGoalId}: ${mappingPath}`)
      const passage = passages.get(string(goal.passageId)) ?? {}
      const document = sourceDocument(extraction, goal, passage)
      const url = document && officialUrl(document)
      const title = string(document?.title)
      if (!document || !url || !title) continue
      const explicitRef = string(goal.sourceRef) || string(passage.sourceRef)
      const topic = string(goal.topicCode) || string(passage.topicCode)
      const page = goal.sourcePage ?? passage.page
      // A stored page is display text, never an unverified PDF #page anchor.
      const sourceRef = explicitRef || [topic, typeof page === 'number' ? `S. ${page}` : ''].filter(Boolean).join(', ')
      if (!sourceRef) continue
      const levels = [goal, passage, document, extraction]
      const stage = facet(levels, 'stage')
      const durationModel = facet(levels, 'durationModel')
      const courseProfile = facet(levels, 'courseProfile')
      if (!stage || !durationModel || !courseProfile) continue
      const facets = { stage, durationModel, courseProfile }
      for (const mappedTargetGoalId of strings(decision.canonicalGoalIds)) result.push({
        jurisdiction, mappedTargetGoalId, sourceGoalId, mappingPath, sourceExtractionPath,
        title, url, sourceRef, facets,
      })
    }
  }
  return result
}

const matchScope = (candidate: Candidate, scope: GoalBookApplicabilityScope): Dimension[] | null => {
  const unspecified: Dimension[] = []
  for (const dimension of ['stage', 'durationModel', 'courseProfile'] as const) {
    const requested = scope[dimension]
    if (requested === null) continue
    const known: readonly string[] = candidate.facets[dimension]
    if (!known.length) unspecified.push(dimension)
    else if (!known.includes(requested)) return null
  }
  return unspecified
}

/** Read-only, deterministic projection of reviewed original-source metadata.
 * Matrix tuples remain owned by the published model. Missing/ambiguous source
 * metadata does not create scope or source-coverage claims.
 */
export const buildGoalBookOriginalSources = (
  model: GoalBookModel,
  repositoryRoot = REPOSITORY_ROOT,
): GoalBookOriginalSourcesIndex => {
  const root = resolve(repositoryRoot)
  const landscape = readJson(root, model.source.landscapePath)
  if (string(landscape.landscapeId) !== model.book.landscapeId) {
    throw new Error('Original-source canonical landscape binding mismatch')
  }
  const goalById = new Map(rows(landscape.goals).map((goal) => [string(goal.id), goal]))
  const parents = new Map<string, string[]>()
  for (const [id, goal] of goalById) for (const child of strings(goal.contains)) {
    const normalized = child.startsWith(`${model.book.landscapeId}:`) ? child.slice(model.book.landscapeId.length + 1) : child
    if (goalById.has(normalized)) parents.set(normalized, [...(parents.get(normalized) ?? []), id])
  }
  const candidatesByTarget = new Map<string, Candidate[]>()
  for (const candidate of loadCandidates(model, root)) {
    candidatesByTarget.set(candidate.mappedTargetGoalId, [...(candidatesByTarget.get(candidate.mappedTargetGoalId) ?? []), candidate])
  }
  const index: GoalBookOriginalSourcesIndex = {
    schemaVersion: '1.0.0', bookId: model.book.id, bookDigest: model.digest,
    documents: [], evidence: [], goals: {},
  }
  const documents = new Map<string, string>()
  const evidence = new Map<string, string>()
  const addEvidence = (candidate: Candidate, kind: 'direct' | 'inherited', unspecifiedDimensions: Dimension[]): string => {
    const documentKey = JSON.stringify([candidate.title, candidate.url])
    let documentId = documents.get(documentKey)
    if (!documentId) {
      documentId = `d${documents.size + 1}`
      documents.set(documentKey, documentId)
      index.documents.push({ id: documentId, title: candidate.title, url: candidate.url })
    }
    const payload: Omit<GoalBookOriginalSourcesEvidence, 'id'> = {
      documentId, sourceRef: candidate.sourceRef, kind,
      scopeMatch: unspecifiedDimensions.length ? 'source-context' : 'exact',
      mappedTargetGoalId: candidate.mappedTargetGoalId,
      sourceGoalId: candidate.sourceGoalId, unspecifiedDimensions,
      sourceScope: { jurisdiction: candidate.jurisdiction, ...candidate.facets },
    }
    // One genuine reviewed witness per identical document locator and target.
    // This is a citation index, not a complete export of every source-goal edge.
    const evidenceKey = JSON.stringify({ ...payload, sourceGoalId: undefined })
    let evidenceId = evidence.get(evidenceKey)
    if (!evidenceId) {
      evidenceId = `e${evidence.size + 1}`
      evidence.set(evidenceKey, evidenceId)
      index.evidence.push({ id: evidenceId, ...payload })
    }
    return evidenceId
  }
  for (const page of model.pages) {
    // Breadth-first ancestors preserve the nearest documented topic as fallback.
    // An inheritance boundary owns its own mappings but blocks older ancestors.
    const depths = new Map<string, number>([[page.goalId, 0]])
    const queue = [page.goalId]
    for (let position = 0; position < queue.length; position += 1) {
      const id = queue[position]
      if (record(goalById.get(id)?.extendedData).applicabilityMappingInheritance === 'boundary') continue
      for (const parent of parents.get(id) ?? []) if (!depths.has(parent)) {
        depths.set(parent, (depths.get(id) ?? 0) + 1)
        queue.push(parent)
      }
    }
    index.goals[page.goalId] = (page.applicability ?? []).flatMap(({ jurisdiction, scopes }) => scopes.map((scope) => {
      const matches = [...depths].flatMap(([target, depth]) => (candidatesByTarget.get(target) ?? [])
        .filter((candidate) => candidate.jurisdiction === jurisdiction)
        .flatMap((candidate) => {
          const unspecified = matchScope(candidate, scope)
          return unspecified === null ? [] : [{ candidate, depth, unspecified }]
        }))
      const nearestDepth = matches.length ? Math.min(...matches.map(({ depth }) => depth)) : -1
      const evidenceIds = [...new Set(matches.filter(({ depth }) => depth === nearestDepth)
        .map(({ candidate, depth, unspecified }) => addEvidence(candidate, depth === 0 ? 'direct' : 'inherited', unspecified)))]
      return { jurisdiction, ...scope, evidenceIds }
    }))
  }
  return index
}

export const serializeGoalBookOriginalSources = (index: GoalBookOriginalSourcesIndex): string => `${JSON.stringify(index)}\n`
