import { goalBookDefinitionById } from './goalBookPublicationRegistry'
import type { GoalBookApplicabilityScope, GoalBookRuntimeModel } from './goalBookRuntime'

export interface GoalBookOriginalSourcesDocument {
  id: string
  title: string
  url: string
}

export interface GoalBookOriginalSourcesEvidence {
  id: string
  documentId: string
  sourceRef: string
  kind: 'direct' | 'inherited'
  scopeMatch: 'exact' | 'source-context'
  mappedTargetGoalId: string
  sourceGoalId: string
  sourceScope: {
    jurisdiction: string
    stage: Array<'SekI' | 'SekII'>
    durationModel: Array<'G8' | 'G9'>
    courseProfile: Array<'GK' | 'LK'>
  }
  unspecifiedDimensions: Array<'stage' | 'durationModel' | 'courseProfile'>
}

export interface GoalBookOriginalSourcesTuple {
  jurisdiction: string
  stage: 'SekI' | 'SekII'
  durationModel: 'G8' | 'G9' | null
  courseProfile: 'GK' | 'LK' | null
  evidenceIds: string[]
}

export interface GoalBookOriginalSourcesPayload {
  schemaVersion: '1.0.0'
  bookId: string
  bookDigest: string
  documents: GoalBookOriginalSourcesDocument[]
  evidence: GoalBookOriginalSourcesEvidence[]
  goals: Record<string, GoalBookOriginalSourcesTuple[]>
}

type ModelBinding = Pick<GoalBookRuntimeModel, 'book' | 'digest' | 'pages'>
export type GoalBookOriginalSource = GoalBookOriginalSourcesEvidence & {
  document: GoalBookOriginalSourcesDocument
}
export interface ParsedGoalBookOriginalSources {
  bookId: string
  bookDigest: string
  byTuple: ReadonlyMap<string, readonly GoalBookOriginalSource[]>
}

export const MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES = 8 * 1024 * 1024
const MAX_TUPLES = 100_000
const MAX_DOCUMENTS = 5_000
const MAX_EVIDENCE = 50_000
const MAX_REFS_PER_TUPLE = 256
const SHA256 = /^sha256:[a-f0-9]{64}$/u

const fail = (): never => { throw new Error('Invalid original-source metadata for this learning-goal book') }
function ensure(value: unknown): asserts value { if (!value) fail() }
const record = (value: unknown): Record<string, unknown> => {
  ensure(value && typeof value === 'object' && !Array.isArray(value))
  return value as Record<string, unknown>
}
const exactKeys = (value: Record<string, unknown>, keys: string[]) => {
  ensure(Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)))
}
const string = (value: unknown, max = 500): string => {
  ensure(typeof value === 'string' && value.trim().length > 0 && value.length <= max)
  ensure(Array.from(value).every((character) => {
    const code = character.charCodeAt(0)
    return code >= 32 && code !== 127
  }))
  return value
}
const array = (value: unknown, max: number): unknown[] => {
  ensure(Array.isArray(value) && value.length <= max)
  return value
}
const https = (value: unknown): string => {
  const text = string(value, 4_000)
  ensure(!/\s/u.test(text) && text.startsWith('https://'))
  const url = new URL(text)
  ensure(url.protocol === 'https:' && url.hostname && !url.username && !url.password)
  return text
}

export const goalBookOriginalSourcesTupleKey = (
  goalId: string,
  jurisdiction: string,
  scope: GoalBookApplicabilityScope,
): string => [goalId, jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('\0')

export const goalBookOriginalSourcesUrl = (model: ModelBinding): string => {
  const definition = goalBookDefinitionById(model.book.id)
  ensure(definition && definition.landscapeId === model.book.landscapeId && definition.edition === model.book.edition)
  return `/lernzielbuch/${definition.artifactStem}.original-sources.json`
}

/** Public citation metadata only: it neither changes applicability nor contributes mastery evidence. */
export const parseGoalBookOriginalSources = (
  raw: unknown,
  model: ModelBinding,
): ParsedGoalBookOriginalSources => {
  goalBookOriginalSourcesUrl(model)
  const root = record(raw)
  exactKeys(root, ['schemaVersion', 'bookId', 'bookDigest', 'documents', 'evidence', 'goals'])
  ensure(root.schemaVersion === '1.0.0' && root.bookId === model.book.id)
  ensure(root.bookDigest === model.digest && SHA256.test(string(root.bookDigest, 71)))

  const documents = new Map<string, GoalBookOriginalSourcesDocument>()
  for (const rawDocument of array(root.documents, MAX_DOCUMENTS)) {
    const document = record(rawDocument)
    exactKeys(document, ['id', 'title', 'url'])
    const id = string(document.id)
    ensure(!documents.has(id))
    documents.set(id, { id, title: string(document.title, 1_000), url: https(document.url) })
  }
  const evidence = new Map<string, GoalBookOriginalSource>()
  for (const rawEvidence of array(root.evidence, MAX_EVIDENCE)) {
    const item = record(rawEvidence)
    exactKeys(item, ['id', 'documentId', 'sourceRef', 'kind', 'scopeMatch', 'mappedTargetGoalId',
      'sourceGoalId', 'sourceScope', 'unspecifiedDimensions'])
    const id = string(item.id)
    const documentId = string(item.documentId)
    const document = documents.get(documentId)
    ensure(document && !evidence.has(id))
    ensure(item.kind === 'direct' || item.kind === 'inherited')
    ensure(item.scopeMatch === 'exact' || item.scopeMatch === 'source-context')
    const dimensions = array(item.unspecifiedDimensions, 3)
    ensure(dimensions.every((value) => ['stage', 'durationModel', 'courseProfile'].includes(String(value))))
    ensure(new Set(dimensions).size === dimensions.length)
    ensure(item.scopeMatch !== 'exact' || dimensions.length === 0)
    const sourceScope = record(item.sourceScope)
    exactKeys(sourceScope, ['jurisdiction', 'stage', 'durationModel', 'courseProfile'])
    const facets = (value: unknown, allowed: string[]): string[] => {
      const values = array(value, allowed.length).map((entry) => string(entry, 20))
      ensure(values.every((entry) => allowed.includes(entry)) && new Set(values).size === values.length)
      return values
    }
    evidence.set(id, {
      id, documentId, document,
      sourceRef: string(item.sourceRef, 4_000),
      kind: item.kind,
      scopeMatch: item.scopeMatch,
      mappedTargetGoalId: string(item.mappedTargetGoalId),
      sourceGoalId: string(item.sourceGoalId),
      sourceScope: {
        jurisdiction: string(sourceScope.jurisdiction, 50),
        stage: facets(sourceScope.stage, ['SekI', 'SekII']) as Array<'SekI' | 'SekII'>,
        durationModel: facets(sourceScope.durationModel, ['G8', 'G9']) as Array<'G8' | 'G9'>,
        courseProfile: facets(sourceScope.courseProfile, ['GK', 'LK']) as Array<'GK' | 'LK'>,
      },
      unspecifiedDimensions: dimensions as GoalBookOriginalSourcesEvidence['unspecifiedDimensions'],
    })
  }

  const expected = new Set<string>()
  const goalIds = new Set(model.pages.map(({ goalId }) => goalId))
  model.pages.forEach((page) => page.applicability?.forEach(({ jurisdiction, scopes }) => (
    scopes.forEach((scope) => expected.add(goalBookOriginalSourcesTupleKey(page.goalId, jurisdiction, scope)))
  )))
  ensure(expected.size <= MAX_TUPLES)
  const byTuple = new Map<string, readonly GoalBookOriginalSource[]>()
  const goals = record(root.goals)
  ensure(Object.keys(goals).length <= model.pages.length)
  for (const [goalId, rawTuples] of Object.entries(goals)) {
    ensure(goalIds.has(goalId))
    for (const rawTuple of array(rawTuples, 1_000)) {
      const tuple = record(rawTuple)
      exactKeys(tuple, ['jurisdiction', 'stage', 'durationModel', 'courseProfile', 'evidenceIds'])
      const jurisdiction = string(tuple.jurisdiction, 50)
      ensure(tuple.stage === 'SekI' || tuple.stage === 'SekII')
      ensure(tuple.durationModel === null || tuple.durationModel === 'G8' || tuple.durationModel === 'G9')
      ensure(tuple.courseProfile === null || tuple.courseProfile === 'GK' || tuple.courseProfile === 'LK')
      const key = goalBookOriginalSourcesTupleKey(goalId, jurisdiction, {
        stage: tuple.stage, durationModel: tuple.durationModel, courseProfile: tuple.courseProfile,
      })
      ensure(expected.has(key) && !byTuple.has(key))
      const ids = array(tuple.evidenceIds, MAX_REFS_PER_TUPLE).map((id) => string(id))
      ensure(new Set(ids).size === ids.length)
      byTuple.set(key, ids.map((id) => {
        const source = evidence.get(id)
        ensure(source)
        ensure(source.kind !== 'direct' || source.mappedTargetGoalId === goalId)
        ensure(source.kind !== 'inherited' || source.mappedTargetGoalId !== goalId)
        ensure(source.sourceScope.jurisdiction === jurisdiction)
        const unspecified: string[] = []
        for (const dimension of ['stage', 'durationModel', 'courseProfile'] as const) {
          const values: readonly string[] = source.sourceScope[dimension]
          const rowValue = tuple[dimension]
          // Null matrix dimensions make no claim (e.g. course profile in SekI).
          if (rowValue === null) continue
          if (values.length > 0) ensure(typeof rowValue === 'string' && values.includes(rowValue))
          else unspecified.push(dimension)
        }
        ensure(unspecified.length === source.unspecifiedDimensions.length
          && unspecified.every((dimension) => source.unspecifiedDimensions.includes(
            dimension as GoalBookOriginalSourcesEvidence['unspecifiedDimensions'][number],
          )))
        ensure((unspecified.length === 0) === (source.scopeMatch === 'exact'))
        return source
      }))
    }
  }
  ensure(byTuple.size === expected.size)
  return { bookId: model.book.id, bookDigest: model.digest, byTuple }
}

const readBoundedJson = async (response: Response): Promise<unknown> => {
  ensure(response.ok && !response.redirected)
  ensure(/^application\/json(?:\s*;|$)/iu.test(response.headers.get('content-type') ?? ''))
  const declaredLength = response.headers.get('content-length')
  if (declaredLength !== null) ensure(/^\d+$/u.test(declaredLength) && Number(declaredLength) <= MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES)
  ensure(response.body)
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      length += chunk.value.byteLength
      ensure(length <= MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES)
      chunks.push(chunk.value)
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined)
    throw error
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  chunks.forEach((chunk) => { bytes.set(chunk, offset); offset += chunk.length })
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
}

const cache = new Map<string, { digest: string; promise: Promise<ParsedGoalBookOriginalSources> }>()

export const loadGoalBookOriginalSources = (
  model: ModelBinding,
  fetcher: typeof fetch = fetch,
): Promise<ParsedGoalBookOriginalSources> => {
  const url = goalBookOriginalSourcesUrl(model)
  const cached = cache.get(model.book.id)
  if (cached?.digest === model.digest) return cached.promise
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  const promise = fetcher(url, {
    method: 'GET', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', cache: 'no-cache',
    signal: controller.signal,
  }).then(readBoundedJson).then((raw) => parseGoalBookOriginalSources(raw, model))
    .finally(() => clearTimeout(timeout))
  cache.set(model.book.id, { digest: model.digest, promise })
  void promise.catch(() => {
    if (cache.get(model.book.id)?.promise === promise) cache.delete(model.book.id)
  })
  return promise
}

export const resetGoalBookOriginalSourcesCacheForTests = (): void => { cache.clear() }
