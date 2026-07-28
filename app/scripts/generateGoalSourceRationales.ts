import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

interface Goal {
  id: string
  title: string
  description: string
  tags?: string[]
  type?: 'atomic' | 'cluster'
  nodeKind?: 'exam' | 'tutor' | 'memory'
  contains?: unknown
  examData?: unknown
}

interface Landscape {
  landscapeId?: string
  title?: string
  subject?: string
  schoolType?: string
  country?: string
  goals?: Goal[]
}

interface MappingDecision {
  sourceGoalId?: unknown
  legacyGoalId?: unknown
  sourceSpan?: unknown
  decision?: unknown
  canonicalGoalId?: unknown
  canonicalGoalIds?: unknown
  matchType?: unknown
  rationale?: unknown
  reviewedAt?: unknown
  reviewer?: unknown
  reviewDecisionId?: unknown
  topicCode?: unknown
  evidence?: unknown
}

interface MappingReview {
  reviewId?: unknown
  targetLandscapeId?: unknown
  sourceExtractionPath?: unknown
  mappings?: unknown
  decisions?: unknown
}

interface SourceDocument {
  key?: unknown
  title?: unknown
  url?: unknown
  path?: unknown
  textPath?: unknown
  role?: unknown
  official?: unknown
}

interface SourceGoal {
  id?: unknown
  title?: unknown
  description?: unknown
  sourceText?: unknown
  sourceSpan?: unknown
  parentBulletText?: unknown
  sourceRef?: unknown
  passageId?: unknown
  topicCode?: unknown
  tags?: unknown
}

interface SourceExtraction {
  extractionId?: unknown
  title?: unknown
  jurisdiction?: unknown
  subject?: unknown
  stage?: unknown
  sourceDocument?: SourceDocument
  sourceDocuments?: unknown
  sourceGoals?: unknown
  method?: unknown
}

interface SourceRationaleCandidate {
  mappingReviewPath: string
  reviewId: string | null
  sourceExtractionPath: string
  sourceExtractionTitle: string | null
  jurisdiction: string | null
  sourceGoalId: string
  sourceGoalTitle: string | null
  sourceGoalDescription: string | null
  sourceText: string | null
  sourceSpan: string | null
  parentBulletText: string | null
  sourceRef: string | null
  sourceDocument: {
    key: string | null
    title: string | null
    url: string | null
    path: string | null
    textPath: string | null
    role: string | null
    official: boolean | null
  } | null
  matchType: string | null
  decision: string | null
  reviewDecisionId: string | null
  reviewedAt: string | null
  reviewer: string | null
  rationale: string | null
  topicCode: string | null
  evidenceMethod: string | null
}

type MemSparqlRouteStatus =
  | 'mem_sparql_unavailable'
  | 'mem_sparql_not_configured'
  | 'mem_sparql_consistent'
  | 'mem_sparql_review_needed'
  | 'mem_sparql_endpoint_error'

interface MemSparqlRoute {
  status: MemSparqlRouteStatus
  endpoint: string
  notes: string
  jurisdiction?: string | null
  comparisonId?: string
  comparisonLabel?: string
  graphIri?: string
  planIri?: string
  planLabel?: string
  yearLabel?: string
  goalIri?: string
  goalLabel?: string
  matchBasis?: string
  comparedText?: string
}

interface SourceRationaleItem {
  goal: {
    id: string
    title: string
    description: string
    landscapePath: string
    pathTitles: string[]
  }
  sourceRationaleStatus: 'classic_source_reviewed' | 'classic_source_partial' | 'classic_source_gap'
  classicSourceRoute: SourceRationaleCandidate | null
  alternateClassicSourceRoutes: SourceRationaleCandidate[]
  memSparqlRoute: MemSparqlRoute
  limitations: string[]
}

interface SourceRationaleReport {
  schemaVersion: 1
  generatedAt: string
  generator: string
  request: {
    landscapePath: string
    mappingRoot: string
    goalSelection: GoalSelection
    goalIds: string[]
    jurisdiction: string | null
    includeMemSparql: boolean
    memConfigPath: string | null
    audience: 'technical' | 'plain'
  }
  summary: {
    requestedGoals: number
    resolvedGoals: number
    goalsWithClassicSourceRoute: number
    goalsWithoutClassicSourceRoute: number
    goalsWithMemSparqlConsistentRoute: number
  }
  items: SourceRationaleItem[]
}

type GoalSelection =
  | 'default'
  | 'explicit'
  | 'source-backed'
  | 'source-backed-relevant-leaves'
  | 'all-relevant-leaves'

interface MemConcreteTextComparisonConfig {
  id: string
  jurisdiction: string
  label: string
  graphIri: string
  stateIri: string
  subjectIri: string
  schoolTypeIri: string
  curriculumClassIri: string
  competencyClassIri: string
}

interface MemConsistencyConfig {
  endpoint?: unknown
  concreteTextComparisons?: unknown
}

interface SparqlBindingValue {
  type: string
  value: string
  datatype?: string
  'xml:lang'?: string
}

interface SparqlResponse {
  results?: {
    bindings?: Array<Record<string, SparqlBindingValue>>
  }
}

interface MemExpectation {
  planIri: string
  planLabel: string
  yearLabel: string
  goalIri: string
  text: string
  normalizedText: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultLandscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const defaultMappingRoot = 'curricula/DE/Gymnasium/mapping/'
const defaultJurisdiction = 'DE-BY'
const defaultOutputJsonPath = 'docs/qa-ci/status/goal-source-rationales-poc.json'
const defaultOutputMarkdownPath = 'docs/qa-ci/status/goal-source-rationales-poc.md'
const defaultMemConfigPath = 'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json'
const defaultGoalIds = [
  'ee48e811-4c9c-5080-9836-8403fc9f0810',
]

const defaultGeneratedNoticeSources = [
  'app/scripts/generateGoalSourceRationales.ts',
  defaultLandscapePath,
  defaultMappingRoot,
  'curricula/DE/Gymnasium/input/',
]

const allRelevantLeavesSelectionAliases = new Set([
  'all-relevant-leaves',
  'all-relevant-leaf-goals',
  'all-relevant-math-leaves',
])

const sourceBackedRelevantLeavesSelectionAliases = new Set([
  'source-backed-relevant-leaves',
  'source-backed-relevant-leaf-goals',
  'classic-backed-relevant-leaves',
  'reviewed-relevant-leaves',
])

const LP = 'https://w3id.org/lehrplan/ontology/'
const BFO = 'http://purl.obolibrary.org/obo/'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function repoRelative(path: string): string {
  return toPosixPath(relative(repoRoot, path))
}

function resolveRepoPath(path: string): string {
  return resolve(repoRoot, path)
}

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(resolveRepoPath(path), 'utf8')) as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function parseArgs(args: string[]): {
  landscapePath: string
  mappingRoot: string
  goalSelection: GoalSelection
  outputJsonPath: string
  outputMarkdownPath: string | null
  publicJsonPath: string | null
  jurisdiction: string | null
  goalIds: string[]
  includeMemSparql: boolean
  memConfigPath: string
  audience: 'technical' | 'plain'
} {
  let landscapePath = defaultLandscapePath
  let mappingRoot = defaultMappingRoot
  let goalSelection: GoalSelection = 'default'
  let outputJsonPath = defaultOutputJsonPath
  let outputMarkdownPath: string | null = defaultOutputMarkdownPath
  let publicJsonPath: string | null = null
  let jurisdiction: string | null = defaultJurisdiction
  let includeMemSparql = false
  let memConfigPath = defaultMemConfigPath
  let audience: 'technical' | 'plain' = 'technical'
  const goalIds: string[] = []

  args.forEach((arg) => {
    if (arg === '--plain-language' || arg === '--audience=plain') {
      audience = 'plain'
      return
    }
    if (arg === '--audience=technical') {
      audience = 'technical'
      return
    }
    if (arg === '--include-mem' || arg === '--include-mem-sparql') {
      includeMemSparql = true
      return
    }
    if (arg === '--source-backed-goals' || arg === '--goals=source-backed' || arg === '--goals=source-backed-goals') {
      goalSelection = 'source-backed'
      return
    }
    if (
      arg === '--source-backed-relevant-leaf-goals'
      || arg === '--source-backed-relevant-leaves'
      || arg === '--goals=source-backed-relevant-leaves'
    ) {
      goalSelection = 'source-backed-relevant-leaves'
      return
    }
    if (
      arg === '--all-relevant-leaf-goals'
      || arg === '--all-relevant-leaves'
      || arg === '--goals=all-relevant-leaves'
    ) {
      goalSelection = 'all-relevant-leaves'
      return
    }
    if (arg === '--no-md' || arg === '--no-markdown') {
      outputMarkdownPath = null
      return
    }
    if (arg.startsWith('--landscape=')) {
      landscapePath = arg.slice('--landscape='.length)
      return
    }
    if (arg.startsWith('--mapping-root=')) {
      mappingRoot = arg.slice('--mapping-root='.length)
      return
    }
    if (arg.startsWith('--output-json=')) {
      outputJsonPath = arg.slice('--output-json='.length)
      return
    }
    if (arg.startsWith('--output-md=')) {
      const value = arg.slice('--output-md='.length)
      outputMarkdownPath = value === 'none' || value === 'null' ? null : value
      return
    }
    if (arg.startsWith('--public-json=')) {
      publicJsonPath = arg.slice('--public-json='.length)
      return
    }
    if (arg.startsWith('--output-public-json=')) {
      publicJsonPath = arg.slice('--output-public-json='.length)
      return
    }
    if (arg.startsWith('--mem-config=')) {
      memConfigPath = arg.slice('--mem-config='.length)
      return
    }
    if (arg.startsWith('--audience=')) {
      const value = arg.slice('--audience='.length)
      if (value !== 'technical' && value !== 'plain') throw new Error(`Unknown audience: ${value}`)
      audience = value
      return
    }
    if (arg.startsWith('--jurisdiction=')) {
      const value = arg.slice('--jurisdiction='.length).trim()
      jurisdiction = value.length > 0 && value.toLowerCase() !== 'all' ? value : null
      return
    }
    if (arg.startsWith('--goal=')) {
      goalSelection = 'explicit'
      goalIds.push(arg.slice('--goal='.length))
      return
    }
    if (arg.startsWith('--goals=')) {
      const value = arg.slice('--goals='.length)
      if (value === 'source-backed' || value === 'source-backed-goals') {
        goalSelection = 'source-backed'
        return
      }
      if (allRelevantLeavesSelectionAliases.has(value)) {
        goalSelection = 'all-relevant-leaves'
        return
      }
      if (sourceBackedRelevantLeavesSelectionAliases.has(value)) {
        goalSelection = 'source-backed-relevant-leaves'
        return
      }
      goalSelection = 'explicit'
      value
        .split(',')
        .map((goalId) => goalId.trim())
        .filter((goalId) => goalId.length > 0)
        .forEach((goalId) => goalIds.push(goalId))
      return
    }
    throw new Error(`Unknown argument: ${arg}`)
  })

  return {
    landscapePath,
    mappingRoot,
    goalSelection,
    outputJsonPath,
    outputMarkdownPath,
    publicJsonPath,
    jurisdiction,
    goalIds: goalIds.length > 0 ? Array.from(new Set(goalIds)) : defaultGoalIds,
    includeMemSparql,
    memConfigPath,
    audience,
  }
}

function collectReviewFiles(dir: string): string[] {
  const absoluteDir = resolveRepoPath(dir)
  if (!existsSync(absoluteDir)) return []
  return readdirSync(absoluteDir, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = resolve(absoluteDir, entry.name)
      const relativePath = repoRelative(absolutePath)
      if (entry.isDirectory()) return collectReviewFiles(relativePath)
      if (entry.isFile() && entry.name.endsWith('.review.json')) return [relativePath]
      return []
    })
    .sort((left, right) => left.localeCompare(right, 'en'))
}

function mappingReviewTargetsLandscape(mappingReview: MappingReview, targetLandscapeId: string | null): boolean {
  if (targetLandscapeId === null) return true
  const reviewTargetLandscapeId = asString(mappingReview.targetLandscapeId)
  return reviewTargetLandscapeId === null || reviewTargetLandscapeId === targetLandscapeId
}

function goalContains(goal: Goal): string[] {
  return Array.isArray(goal.contains)
    ? goal.contains.filter((entry): entry is string => typeof entry === 'string')
    : []
}

function isClusterGoal(goal: Goal): boolean {
  return goal.type === 'cluster' || goalContains(goal).length > 0
}

function isMemoryOrNonContentLeaf(goal: Goal): boolean {
  const tags = goal.tags ?? []
  return goal.nodeKind === 'memory'
    || goal.nodeKind === 'exam'
    || goal.nodeKind === 'tutor'
    || tags.includes('memorization')
    || tags.some((tag) => tag.startsWith('srs-deck:'))
    || tags.includes('Practice')
    || tags.includes('Assessment')
    || tags.includes('Motivation')
    || tags.includes('Orientation')
    || goal.examData !== undefined
}

function buildParentMap(goals: Map<string, Goal>): Map<string, string[]> {
  const parentsByGoal = new Map<string, string[]>()
  goals.forEach((goal) => {
    goalContains(goal).forEach((childId) => {
      const parents = parentsByGoal.get(childId) ?? []
      parents.push(goal.id)
      parentsByGoal.set(childId, parents)
    })
  })
  return parentsByGoal
}

function allGoalPaths(goalId: string, parentsByGoal: Map<string, string[]>, seen = new Set<string>()): string[][] {
  if (seen.has(goalId)) return [[goalId]]
  const parents = parentsByGoal.get(goalId) ?? []
  if (parents.length === 0) return [[goalId]]
  const nextSeen = new Set(seen)
  nextSeen.add(goalId)
  return parents.flatMap((parentId) =>
    allGoalPaths(parentId, parentsByGoal, nextSeen).map((path) => [...path, goalId]))
}

function pathRank(path: string[], goals: Map<string, Goal>): number {
  const titles = path.map((goalId) => goals.get(goalId)?.title ?? '')
  let rank = path.length
  if (titles.some((title) => title.startsWith('Jahrgangsstufe'))) rank -= 20
  if (titles.some((title) => title.includes('Mathematik'))) rank -= 2
  return rank
}

function bestGoalPathTitles(goalId: string, goals: Map<string, Goal>, parentsByGoal: Map<string, string[]>): string[] {
  const sortedPaths = allGoalPaths(goalId, parentsByGoal)
    .sort((left, right) => pathRank(left, goals) - pathRank(right, goals))
  return sortedPaths[0]
    ?.map((pathGoalId) => goals.get(pathGoalId)?.title ?? pathGoalId) ?? [goalId]
}

function sourceGoalReferencesDocument(sourceGoal: SourceGoal): string | null {
  if (!Array.isArray(sourceGoal.tags)) return null
  const tag = sourceGoal.tags.find((entry): entry is string => (
    typeof entry === 'string' && entry.startsWith('sourceDocument:')
  ))
  return tag?.slice('sourceDocument:'.length) ?? null
}

function selectSourceDocument(sourceExtraction: SourceExtraction, sourceGoal: SourceGoal): SourceDocument | null {
  const sourceDocuments = Array.isArray(sourceExtraction.sourceDocuments)
    ? sourceExtraction.sourceDocuments.filter((entry): entry is SourceDocument => isRecord(entry))
    : []
  const referencedKey = sourceGoalReferencesDocument(sourceGoal)
  const referencedDocument = referencedKey === null
    ? null
    : sourceDocuments.find((document) => asString(document.key) === referencedKey) ?? null

  if (referencedDocument !== null) return referencedDocument
  if (isRecord(sourceExtraction.sourceDocument)) return sourceExtraction.sourceDocument
  return sourceDocuments[0] ?? null
}

function findSourceGoal(sourceExtraction: SourceExtraction, sourceGoalId: string): SourceGoal | null {
  if (!Array.isArray(sourceExtraction.sourceGoals)) return null
  return sourceExtraction.sourceGoals.find((entry): entry is SourceGoal => (
    isRecord(entry) && entry.id === sourceGoalId
  )) ?? null
}

function readSourceExtraction(path: string, cache: Map<string, SourceExtraction>): SourceExtraction {
  if (!cache.has(path)) {
    cache.set(path, readJsonFile<SourceExtraction>(path))
  }
  const sourceExtraction = cache.get(path)
  if (sourceExtraction === undefined) throw new Error(`Source extraction could not be loaded: ${path}`)
  return sourceExtraction
}

function mappingReviewJurisdiction(
  mappingReview: MappingReview,
  sourceExtractionCache: Map<string, SourceExtraction>,
): string | null {
  const sourceExtractionPath = asString(mappingReview.sourceExtractionPath)
  if (sourceExtractionPath === null) return null
  return asString(readSourceExtraction(sourceExtractionPath, sourceExtractionCache).jurisdiction)
}

function mappingReviewDecisions(mappingReview: MappingReview): MappingDecision[] {
  const entries = [
    ...(Array.isArray(mappingReview.decisions) ? mappingReview.decisions : []),
    ...(Array.isArray(mappingReview.mappings) ? mappingReview.mappings : []),
  ]
  return entries.filter((entry): entry is MappingDecision => isRecord(entry))
}

function canonicalGoalIdsForDecision(decision: MappingDecision): string[] {
  const goalIds = new Set<string>()
  const canonicalGoalId = asString(decision.canonicalGoalId)
  if (canonicalGoalId !== null) goalIds.add(canonicalGoalId)
  if (Array.isArray(decision.canonicalGoalIds)) {
    decision.canonicalGoalIds.forEach((goalId) => {
      if (typeof goalId === 'string' && goalId.trim().length > 0) {
        goalIds.add(goalId)
      }
    })
  }
  return Array.from(goalIds)
}

function sourceGoalIdForDecision(decision: MappingDecision): string | null {
  return asString(decision.sourceGoalId) ?? asString(decision.legacyGoalId)
}

function collectSourceBackedGoalIds(input: {
  landscapePath: string
  mappingRoot: string
  jurisdiction: string | null
}): string[] {
  const landscape = readJsonFile<Landscape>(input.landscapePath)
  const goals = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const parentsByGoal = buildParentMap(goals)
  const targetLandscapeId = asString(landscape.landscapeId)
  const sourceExtractionCache = new Map<string, SourceExtraction>()
  const goalIds = new Set<string>()

  collectReviewFiles(input.mappingRoot).forEach((mappingReviewPath) => {
    const mappingReview = readJsonFile<MappingReview>(mappingReviewPath)
    if (!mappingReviewTargetsLandscape(mappingReview, targetLandscapeId)) return
    if (input.jurisdiction !== null) {
      const jurisdiction = mappingReviewJurisdiction(mappingReview, sourceExtractionCache)
      if (jurisdiction !== input.jurisdiction) return
    }
    mappingReviewDecisions(mappingReview)
      .forEach((decision) => {
        canonicalGoalIdsForDecision(decision)
          .filter((goalId) => goals.has(goalId))
          .forEach((goalId) => goalIds.add(goalId))
      })
  })

  return Array.from(goalIds).sort((left, right) => {
    const leftPath = bestGoalPathTitles(left, goals, parentsByGoal).join(' > ')
    const rightPath = bestGoalPathTitles(right, goals, parentsByGoal).join(' > ')
    return leftPath.localeCompare(rightPath, 'de')
  })
}

function collectAllRelevantLeafGoalIds(input: {
  landscapePath: string
}): string[] {
  const landscape = readJsonFile<Landscape>(input.landscapePath)
  const goals = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const parentsByGoal = buildParentMap(goals)

  return (landscape.goals ?? [])
    .filter((goal) => !isClusterGoal(goal) && !isMemoryOrNonContentLeaf(goal))
    .map((goal) => goal.id)
    .sort((left, right) => {
      const leftPath = bestGoalPathTitles(left, goals, parentsByGoal).join(' > ')
      const rightPath = bestGoalPathTitles(right, goals, parentsByGoal).join(' > ')
      return leftPath.localeCompare(rightPath, 'de')
    })
}

function collectSourceBackedRelevantLeafGoalIds(input: {
  landscapePath: string
  mappingRoot: string
}): string[] {
  const landscape = readJsonFile<Landscape>(input.landscapePath)
  const goals = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const allSourceBackedGoalIds = collectSourceBackedGoalIds({
    landscapePath: input.landscapePath,
    mappingRoot: input.mappingRoot,
    jurisdiction: null,
  })

  return allSourceBackedGoalIds.filter((goalId) => {
    const goal = goals.get(goalId)
    return goal !== undefined && !isClusterGoal(goal) && !isMemoryOrNonContentLeaf(goal)
  })
}

function evidenceMethod(evidence: unknown): string | null {
  return isRecord(evidence) ? asString(evidence.method) : null
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

const htmlEntityMap: Record<string, string> = {
  amp: '&',
  apos: "'",
  nbsp: ' ',
  quot: '"',
}

function decodeHtmlEntity(entity: string): string {
  const hexMatch = /^#x([0-9a-f]+)$/iu.exec(entity)
  if (hexMatch) {
    const codePoint = Number.parseInt(hexMatch[1], 16)
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : `&${entity};`
  }

  const decimalMatch = /^#([0-9]+)$/u.exec(entity)
  if (decimalMatch) {
    const codePoint = Number.parseInt(decimalMatch[1], 10)
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : `&${entity};`
  }

  return htmlEntityMap[entity.toLocaleLowerCase('en-US')] ?? `&${entity};`
}

function decodeHtmlish(value: string): string {
  return value
    .replace(/&nbsp;?/giu, ' ')
    .replace(/&([a-z][a-z0-9]+|#[0-9]+|#x[0-9a-f]+);/giu, (_match, entity: string) => decodeHtmlEntity(entity))
    .replace(/<[^>]+>/gu, '')
}

function normalizeMathNotation(value: string): string {
  return value
    .replace(/\uF03D/gu, '=')
    .replace(/\uF0D7/gu, '\u00b7')
    .replace(/\uF02B/gu, '+')
    .replace(/\uF02D/gu, '-')
    .replace(/\uF028/gu, '(')
    .replace(/\uF029/gu, ')')
    .replace(/\s*([=+·⋅])\s*/gu, '$1')
}

function normalizePlainText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[–—−]/gu, '-')
    .replace(/[„“”]/gu, '"')
    .replace(/[‚‘’]/gu, "'")
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('de-DE')
}

function normalizeText(value: string): string {
  return normalizePlainText(decodeHtmlish(value))
}

function normalizeMathComparableText(value: string): string {
  return normalizePlainText(normalizeMathNotation(decodeHtmlish(value)))
}

function comparisonKeys(value: string): string[] {
  return Array.from(new Set([normalizeText(value), normalizeMathComparableText(value)].filter(Boolean)))
}

function iri(value: string): string {
  if (!/^https?:\/\//u.test(value)) {
    throw new Error(`Expected absolute IRI: ${value}`)
  }
  return `<${value}>`
}

function buildMemComparisonQuery(comparison: MemConcreteTextComparisonConfig): string {
  return `
PREFIX lp: <${LP}>
PREFIX bfo: <${BFO}>
PREFIX rdfs: <${RDFS}>
SELECT DISTINCT ?plan ?planLabel ?yearLabel ?goal ?goalLabel
WHERE {
  GRAPH ${iri(comparison.graphIri)} {
    ?plan a ${iri(comparison.curriculumClassIri)} ;
          lp:LP_0000029 ${iri(comparison.stateIri)} ;
          lp:LP_0000537 ${iri(comparison.subjectIri)} ;
          lp:LP_0000812 ${iri(comparison.schoolTypeIri)} ;
          rdfs:label ?planLabel ;
          lp:LP_0000026 ?year .
    ?year rdfs:label ?yearLabel .
    FILTER(langMatches(lang(?yearLabel), "de"))

    ?plan bfo:BFO_0000051+ ?goal .
    ?goal a ${iri(comparison.competencyClassIri)} ;
          rdfs:label ?goalLabel .
  }
}
ORDER BY ?yearLabel ?planLabel ?goalLabel
`
}

function bindingValue(binding: Record<string, SparqlBindingValue>, key: string): string | null {
  return binding[key]?.value ?? null
}

async function querySparql(endpoint: string, query: string): Promise<Array<Record<string, SparqlBindingValue>>> {
  const url = new URL(endpoint)
  url.searchParams.set('query', query)
  url.searchParams.set('format', 'application/sparql-results+json')
  const response = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    throw new Error(`SPARQL request failed with HTTP ${response.status}: ${response.statusText}`)
  }
  const body = await response.json() as SparqlResponse
  return body.results?.bindings ?? []
}

function expectationsFromBindings(bindings: Array<Record<string, SparqlBindingValue>>): MemExpectation[] {
  const byGoal = new Map<string, MemExpectation>()
  for (const binding of bindings) {
    const goalIri = bindingValue(binding, 'goal')
    const text = bindingValue(binding, 'goalLabel')
    if (!goalIri || !text) continue
    byGoal.set(goalIri, {
      planIri: bindingValue(binding, 'plan') ?? '',
      planLabel: bindingValue(binding, 'planLabel') ?? '',
      yearLabel: bindingValue(binding, 'yearLabel') ?? '',
      goalIri,
      text,
      normalizedText: normalizeText(text),
    })
  }
  return Array.from(byGoal.values()).sort((left, right) =>
    `${left.yearLabel}|${left.planLabel}|${left.text}`.localeCompare(`${right.yearLabel}|${right.planLabel}|${right.text}`, 'de'))
}

function memConcreteComparisonConfigs(config: MemConsistencyConfig): MemConcreteTextComparisonConfig[] {
  return Array.isArray(config.concreteTextComparisons)
    ? config.concreteTextComparisons.filter((entry): entry is MemConcreteTextComparisonConfig => (
      isRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.jurisdiction === 'string' &&
      typeof entry.label === 'string' &&
      typeof entry.graphIri === 'string' &&
      typeof entry.stateIri === 'string' &&
      typeof entry.subjectIri === 'string' &&
      typeof entry.schoolTypeIri === 'string' &&
      typeof entry.curriculumClassIri === 'string' &&
      typeof entry.competencyClassIri === 'string'
    ))
    : []
}

function memMatchTextCandidates(candidate: SourceRationaleCandidate): Array<{ basis: string; text: string }> {
  return [
    { basis: 'parentBulletText', text: candidate.parentBulletText ?? '' },
    { basis: 'sourceText', text: candidate.sourceText ?? '' },
    { basis: 'sourceSpan', text: candidate.sourceSpan ?? '' },
  ].filter((entry) => entry.text.trim().length > 0)
}

function findMemExpectation(
  candidate: SourceRationaleCandidate,
  expectations: MemExpectation[],
): { expectation: MemExpectation; basis: string; comparedText: string } | null {
  for (const textCandidate of memMatchTextCandidates(candidate)) {
    const keys = comparisonKeys(textCandidate.text)
    const exact = expectations.find((expectation) =>
      comparisonKeys(expectation.text).some((memKey) => keys.includes(memKey)))
    if (exact) {
      return {
        expectation: exact,
        basis: textCandidate.basis,
        comparedText: textCandidate.text,
      }
    }
  }

  for (const textCandidate of memMatchTextCandidates(candidate)) {
    const keys = comparisonKeys(textCandidate.text).filter((key) => key.length > 20)
    const contained = expectations.find((expectation) =>
      keys.some((key) => comparisonKeys(expectation.text).some((memKey) => memKey.includes(key) || key.includes(memKey))))
    if (contained) {
      return {
        expectation: contained,
        basis: `${textCandidate.basis}:contained`,
        comparedText: textCandidate.text,
      }
    }
  }

  return null
}

function candidateRank(candidate: SourceRationaleCandidate): number {
  let rank = 0
  if (candidate.sourceDocument !== null) rank -= 10
  if (candidate.sourceText !== null) rank -= 10
  if (candidate.matchType === 'exact') rank -= 20
  if (candidate.matchType === 'partial') rank -= 10
  if (candidate.sourceSpan !== null) rank -= 5
  if (candidate.rationale !== null) rank -= 5
  if (candidate.reviewedAt !== null) rank -= 5
  return rank
}

function buildCandidate(
  mappingReviewPath: string,
  mappingReview: MappingReview,
  decision: MappingDecision,
  sourceExtractionCache: Map<string, SourceExtraction>,
): SourceRationaleCandidate | null {
  const sourceExtractionPath = asString(mappingReview.sourceExtractionPath)
  const sourceGoalId = sourceGoalIdForDecision(decision)
  if (sourceExtractionPath === null || sourceGoalId === null) return null

  const sourceExtraction = readSourceExtraction(sourceExtractionPath, sourceExtractionCache)

  const sourceGoal = findSourceGoal(sourceExtraction, sourceGoalId)
  const sourceDocument = sourceGoal === null ? null : selectSourceDocument(sourceExtraction, sourceGoal)

  return {
    mappingReviewPath,
    reviewId: asString(mappingReview.reviewId),
    sourceExtractionPath,
    sourceExtractionTitle: asString(sourceExtraction.title),
    jurisdiction: asString(sourceExtraction.jurisdiction),
    sourceGoalId,
    sourceGoalTitle: sourceGoal === null ? null : asString(sourceGoal.title),
    sourceGoalDescription: sourceGoal === null ? null : asString(sourceGoal.description),
    sourceText: sourceGoal === null ? null : asString(sourceGoal.sourceText),
    sourceSpan: asString(decision.sourceSpan) ?? (sourceGoal === null ? null : asString(sourceGoal.sourceSpan)),
    parentBulletText: sourceGoal === null ? null : asString(sourceGoal.parentBulletText),
    sourceRef: sourceGoal === null ? null : asString(sourceGoal.sourceRef),
    sourceDocument: sourceDocument === null ? null : {
      key: asString(sourceDocument.key),
      title: asString(sourceDocument.title),
      url: asString(sourceDocument.url),
      path: asString(sourceDocument.path),
      textPath: asString(sourceDocument.textPath),
      role: asString(sourceDocument.role),
      official: asBoolean(sourceDocument.official),
    },
    matchType: asString(decision.matchType),
    decision: asString(decision.decision),
    reviewDecisionId: asString(decision.reviewDecisionId),
    reviewedAt: asString(decision.reviewedAt),
    reviewer: asString(decision.reviewer),
    rationale: asString(decision.rationale),
    topicCode: asString(decision.topicCode),
    evidenceMethod: evidenceMethod(decision.evidence),
  }
}

function findCandidatesForGoals(
  goalIds: string[],
  mappingRoot: string,
  targetLandscapeId: string | null,
): Map<string, SourceRationaleCandidate[]> {
  const goalIdSet = new Set(goalIds)
  const candidatesByGoal = new Map<string, SourceRationaleCandidate[]>()
  const sourceExtractionCache = new Map<string, SourceExtraction>()

  goalIds.forEach((goalId) => candidatesByGoal.set(goalId, []))

  collectReviewFiles(mappingRoot).forEach((mappingReviewPath) => {
    const mappingReview = readJsonFile<MappingReview>(mappingReviewPath)
    if (!mappingReviewTargetsLandscape(mappingReview, targetLandscapeId)) return
    mappingReviewDecisions(mappingReview)
      .forEach((decision) => {
        canonicalGoalIdsForDecision(decision)
          .filter((goalId) => goalIdSet.has(goalId))
          .forEach((goalId) => {
            const candidate = buildCandidate(mappingReviewPath, mappingReview, decision, sourceExtractionCache)
            if (candidate !== null) {
              candidatesByGoal.get(goalId)?.push(candidate)
            }
          })
      })
  })

  candidatesByGoal.forEach((candidates) => {
    candidates.sort((left, right) => candidateRank(left) - candidateRank(right))
    const seen = new Set<string>()
    const deduped = candidates.filter((candidate) => {
      const key = [
        candidate.jurisdiction ?? '',
        candidate.sourceExtractionPath,
        candidate.sourceGoalId,
        candidate.sourceSpan ?? '',
        candidate.matchType ?? '',
      ].join('|')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    candidates.splice(0, candidates.length, ...deduped)
  })

  return candidatesByGoal
}

function buildReport(input: {
  landscapePath: string
  mappingRoot: string
  goalSelection: GoalSelection
  goalIds: string[]
  jurisdiction: string | null
  includeMemSparql: boolean
  memConfigPath: string | null
  audience: 'technical' | 'plain'
}): SourceRationaleReport {
  const landscape = readJsonFile<Landscape>(input.landscapePath)
  const goals = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const parentsByGoal = buildParentMap(goals)
  const candidatesByGoal = findCandidatesForGoals(
    input.goalIds,
    input.mappingRoot,
    asString(landscape.landscapeId),
  )

  const items: SourceRationaleItem[] = input.goalIds.map((goalId) => {
    const goal = goals.get(goalId)
    if (goal === undefined) {
      return {
        goal: {
          id: goalId,
          title: 'Unbekanntes Ziel',
          description: 'Die angefragte Ziel-ID wurde in der konfigurierten Landschaft nicht gefunden.',
          landscapePath: input.landscapePath,
          pathTitles: [goalId],
        },
        sourceRationaleStatus: 'classic_source_gap',
        classicSourceRoute: null,
        alternateClassicSourceRoutes: [],
        memSparqlRoute: defaultMemSparqlRoute(),
        limitations: ['Die angefragte Ziel-ID wurde in der konfigurierten Landschaft nicht gefunden.'],
      }
    }

    const allCandidates = candidatesByGoal.get(goalId) ?? []
    const scopedCandidates = input.jurisdiction === null
      ? allCandidates
      : allCandidates.filter((candidate) => candidate.jurisdiction === input.jurisdiction)
    const candidates = scopedCandidates.length > 0 ? scopedCandidates : allCandidates
    const bestCandidate = candidates[0] ?? null
    const alternateClassicSourceRoutes = bestCandidate === null
      ? allCandidates
      : allCandidates.filter((candidate) => candidate !== bestCandidate)
    const status = bestCandidate === null
      ? 'classic_source_gap'
      : bestCandidate.matchType === 'partial'
        ? 'classic_source_partial'
        : 'classic_source_reviewed'
    const limitations = bestCandidate === null
      ? ['In den gescannten Mapping-Reviews wurde kein reviewter klassischer Quellenweg für dieses Ziel gefunden.']
      : [
        ...(bestCandidate.sourceDocument === null ? ['Die Quelldokument-Metadaten konnten nicht aus der Source-Extraction aufgelöst werden.'] : []),
        ...(bestCandidate.sourceText === null ? ['Der Source-Zieltext konnte nicht aus der Source-Extraction aufgelöst werden.'] : []),
        ...(input.jurisdiction !== null && scopedCandidates.length === 0 ? [`Für ${input.jurisdiction} wurde kein klassischer Quellenweg gefunden; die gerenderte Route ist ein ungescopeter Fallback.`] : []),
        'MEM/FWU-SPARQL-Evidenz ist in dieser ersten PoC-Ausgabe noch nicht enthalten.',
      ]

    return {
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        landscapePath: input.landscapePath,
        pathTitles: bestGoalPathTitles(goal.id, goals, parentsByGoal),
      },
      sourceRationaleStatus: status,
      classicSourceRoute: bestCandidate,
      alternateClassicSourceRoutes,
      memSparqlRoute: defaultMemSparqlRoute(),
      limitations,
    }
  })

  const goalsWithClassicSourceRoute = items.filter((item) => item.classicSourceRoute !== null).length
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generator: 'app/scripts/generateGoalSourceRationales.ts',
    request: input,
    summary: {
      requestedGoals: input.goalIds.length,
      resolvedGoals: items.filter((item) => item.goal.title !== 'Unbekanntes Ziel').length,
      goalsWithClassicSourceRoute,
      goalsWithoutClassicSourceRoute: input.goalIds.length - goalsWithClassicSourceRoute,
      goalsWithMemSparqlConsistentRoute: items.filter((item) => item.memSparqlRoute.status === 'mem_sparql_consistent').length,
    },
    items,
  }
}

function defaultMemSparqlRoute(): SourceRationaleItem['memSparqlRoute'] {
  return {
    status: 'mem_sparql_unavailable',
    endpoint: 'https://sparql.mem.edufeed.org/sparql',
    notes: 'Der erste PoC löst nur den klassischen reviewten Source-Extraction-Weg auf. MEM/FWU-SPARQL-Evidenz wird ergänzt, sobald dieser Weg stabil ist.',
  }
}

function routeWithEndpointError(endpoint: string, error: unknown): MemSparqlRoute {
  return {
    status: 'mem_sparql_endpoint_error',
    endpoint,
    notes: `Der MEM/FWU-SPARQL-Endpunkt konnte für diese Ausgabe nicht ausgewertet werden: ${error instanceof Error ? error.message : String(error)}`,
  }
}

async function enrichReportWithMemSparql(report: SourceRationaleReport, memConfigPath: string): Promise<void> {
  const config = readJsonFile<MemConsistencyConfig>(memConfigPath)
  const endpoint = asString(config.endpoint) ?? defaultMemSparqlRoute().endpoint
  const comparisons = memConcreteComparisonConfigs(config)
  const expectationsByComparisonId = new Map<string, MemExpectation[]>()

  try {
    for (const item of report.items) {
      const route = item.classicSourceRoute
      if (route === null) continue
      const comparison = comparisons.find((entry) => entry.jurisdiction === route.jurisdiction)
      if (comparison === undefined) {
        item.memSparqlRoute = {
          status: 'mem_sparql_not_configured',
          endpoint,
          jurisdiction: route.jurisdiction,
          notes: `Für ${route.jurisdiction ?? 'diesen Scope'} ist im MEM-Konsistenz-PoC kein konkreter Textvergleich konfiguriert.`,
        }
        item.limitations.push('Für dieses Ziel ist noch kein MEM/FWU-SPARQL-Vergleich konfiguriert.')
        continue
      }

      if (!expectationsByComparisonId.has(comparison.id)) {
        const bindings = await querySparql(endpoint, buildMemComparisonQuery(comparison))
        expectationsByComparisonId.set(comparison.id, expectationsFromBindings(bindings))
      }
      const expectations = expectationsByComparisonId.get(comparison.id) ?? []
      const match = findMemExpectation(route, expectations)
      if (match === null) {
        item.memSparqlRoute = {
          status: 'mem_sparql_review_needed',
          endpoint,
          jurisdiction: route.jurisdiction,
          comparisonId: comparison.id,
          comparisonLabel: comparison.label,
          graphIri: comparison.graphIri,
          notes: 'Der MEM/FWU-SPARQL-Vergleich ist konfiguriert, aber für den gerenderten klassischen Quellenweg wurde kein passender MEM-Erwartungstext gefunden.',
        }
        item.limitations.push('Der konfigurierte MEM/FWU-SPARQL-Vergleich fand keinen passenden MEM-Erwartungstext für den klassischen Quellenweg.')
        continue
      }

      item.memSparqlRoute = {
        status: 'mem_sparql_consistent',
        endpoint,
        jurisdiction: route.jurisdiction,
        comparisonId: comparison.id,
        comparisonLabel: comparison.label,
        graphIri: comparison.graphIri,
        planIri: match.expectation.planIri,
        planLabel: match.expectation.planLabel,
        yearLabel: match.expectation.yearLabel,
        goalIri: match.expectation.goalIri,
        goalLabel: match.expectation.text,
        matchBasis: match.basis,
        comparedText: match.comparedText,
        notes: 'Der MEM/FWU-SPARQL-Endpunkt liefert einen passenden Erwartungstext zum klassischen SkillPilot-Quellenweg.',
      }
      item.limitations = item.limitations.filter((limitation) =>
        limitation !== 'MEM/FWU-SPARQL-Evidenz ist in dieser ersten PoC-Ausgabe noch nicht enthalten.')
    }
  } catch (error) {
    report.items.forEach((item) => {
      item.memSparqlRoute = routeWithEndpointError(endpoint, error)
      item.limitations.push('Der MEM/FWU-SPARQL-Endpunkt konnte bei der Generierung nicht ausgewertet werden.')
    })
  }

  report.summary.goalsWithMemSparqlConsistentRoute = report.items
    .filter((item) => item.memSparqlRoute.status === 'mem_sparql_consistent').length
}

function generatedNoticeSources(report: SourceRationaleReport): string[] {
  return [
    ...defaultGeneratedNoticeSources,
    ...(report.request.includeMemSparql && report.request.memConfigPath !== null ? [report.request.memConfigPath] : []),
  ]
}

function regenerateCommand(report: SourceRationaleReport): string {
  if (report.request.goalSelection === 'all-relevant-leaves') {
    return 'cd app && npm run quality:goal-source-rationales:math-all-relevant'
  }
  if (report.request.goalSelection === 'source-backed-relevant-leaves') {
    return 'cd app && npm run quality:goal-source-rationales:math-public'
  }
  if (report.request.includeMemSparql && report.request.audience === 'plain') {
    return 'cd app && npm run quality:goal-source-rationales:mem-examples:plain'
  }
  return report.request.includeMemSparql
    ? 'cd app && npm run quality:goal-source-rationales:mem-examples'
    : 'cd app && npm run quality:goal-source-rationales:poc'
}

function pushGeneratedMarkdownNotice(lines: string[], report: SourceRationaleReport): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/generateGoalSourceRationales.ts`')
  lines.push(`> Regenerate with: \`${regenerateCommand(report)}\``)
  generatedNoticeSources(report).forEach((source) => {
    lines.push(`> Source of truth: \`${source}\``)
  })
}

function formatNullable(value: string | boolean | null): string {
  if (value === null) return 'nicht aufgelöst'
  return String(value)
}

function formatShortNullable(value: string | null, maxLength = 260): string {
  if (value === null) return formatNullable(value)
  const compacted = compactWhitespace(decodeHtmlish(value))
  if (compacted.length <= maxLength) return compacted
  return `${compacted.slice(0, maxLength - 3).trimEnd()}...`
}

function sourceLocationHint(candidate: SourceRationaleCandidate): string {
  return formatShortNullable(candidate.sourceRef ?? candidate.sourceSpan)
}

function sourceAccessLines(candidate: SourceRationaleCandidate): string[] {
  const document = candidate.sourceDocument
  const lines: string[] = []
  if (document?.url !== null && document?.url !== undefined) {
    lines.push(`1. Offizielle Quelle öffnen: ${document.url}`)
  } else if (document?.path !== null && document?.path !== undefined) {
    lines.push(`1. Lokalen retained source path öffnen: \`${document.path}\``)
  } else {
    lines.push('1. Source-Extraction-Metadaten nutzen, um das offizielle Quelldokument zu identifizieren.')
  }
  lines.push(`2. Zur Quellenstelle navigieren oder im Dokument danach suchen: ${sourceLocationHint(candidate)}`)
  lines.push(`3. Retained Source-Extraction prüfen: \`${candidate.sourceExtractionPath}\``)
  if (document?.textPath !== null && document?.textPath !== undefined) {
    lines.push(`4. Falls der lokale extrahierte Text verfügbar ist, prüfen: \`${document.textPath}\``)
  }
  return lines
}

function goalPathText(item: SourceRationaleItem): string {
  return item.goal.pathTitles.join(' > ')
}

function sourceEvidenceText(route: SourceRationaleCandidate): string {
  return route.sourceSpan ?? route.sourceText ?? route.parentBulletText ?? 'nicht aufgelöst'
}

function plainMatchType(value: string | null): string {
  if (value === 'exact') return 'genauer Treffer'
  if (value === 'partial') return 'teilweiser Treffer'
  return formatNullable(value)
}

function sourceReadInstructions(route: SourceRationaleCandidate): string[] {
  const document = route.sourceDocument
  const sourceRef = route.sourceRef ?? route.topicCode
  return [
    document?.url
      ? `Öffne die offizielle Quelle: ${document.url}`
      : document?.path
        ? `Öffne die lokal gesicherte Quelle: \`${document.path}\``
        : 'Öffne die in der Source-Extraction genannte Originalquelle.',
    sourceRef
      ? `Navigiere zur Stelle ${sourceRef}.`
      : `Suche im Dokument nach diesem Textanfang: ${formatShortNullable(sourceEvidenceText(route), 140)}`,
    `Vergleiche dort den Quellentext mit diesem extrahierten Beleg: ${formatShortNullable(sourceEvidenceText(route), 220)}`,
    `Für eine technische Nachprüfung liegt die Source-Extraction unter \`${route.sourceExtractionPath}\`.`,
  ]
}

function memVerificationQuery(route: MemSparqlRoute): string | null {
  if (route.status !== 'mem_sparql_consistent' || !route.graphIri || !route.planIri || !route.goalIri) return null
  return `PREFIX lp: <${LP}>
PREFIX bfo: <${BFO}>
PREFIX rdfs: <${RDFS}>

SELECT DISTINCT ?planLabel ?yearLabel ?goalLabel
FROM <${route.graphIri}>
WHERE {
  VALUES ?plan { <${route.planIri}> }
  VALUES ?goal { <${route.goalIri}> }

  ?plan rdfs:label ?planLabel ;
    lp:LP_0000026 ?year ;
    bfo:BFO_0000051+ ?goal .

  ?year rdfs:label ?yearLabel .
  ?goal rdfs:label ?goalLabel .

  FILTER(langMatches(lang(?yearLabel), "de"))
}`
}

function renderPlainMarkdown(report: SourceRationaleReport): string {
  const lines: string[] = ['# Quellenweg und Begründung', '']
  pushGeneratedMarkdownNotice(lines, report)
  lines.push('')
  lines.push(`Erzeugt: ${report.generatedAt}`)
  lines.push('')
  lines.push('Diese Ansicht ist für Leserinnen und Leser gedacht, die keine SkillPilot-IDs auswerten wollen. Das Lernziel wird deshalb über seinen SkillPilot-Pfad in der Skill-Landschaft benannt. Technische Bezeichner erscheinen nur dort, wo sie für die MEM/FWU-SPARQL-Abfrage notwendig sind.')
  lines.push('')
  lines.push('## Kurzüberblick')
  lines.push('')
  lines.push(`- Lernziele: ${report.summary.resolvedGoals}`)
  lines.push(`- Klassischer Quellenweg vorhanden: ${report.summary.goalsWithClassicSourceRoute}`)
  lines.push(`- MEM/FWU-SPARQL konsistent: ${report.summary.goalsWithMemSparqlConsistentRoute}`)
  lines.push(`- Bundesland-Scope: ${formatNullable(report.request.jurisdiction)}`)
  lines.push('')

  report.items.forEach((item, index) => {
    const route = item.classicSourceRoute
    lines.push(`## ${index + 1}. ${item.goal.title}`)
    lines.push('')
    lines.push(`SkillPilot-Pfad: ${goalPathText(item)}`)
    lines.push('')
    lines.push(`Lernziel: ${item.goal.description}`)
    lines.push('')

    if (route === null) {
      lines.push('Für dieses Lernziel wurde kein reviewter klassischer Quellenweg gefunden. Es sollte daher nicht als gesichert begründet dargestellt werden.')
      lines.push('')
    } else {
      lines.push('### So liest man die Originalquelle')
      lines.push('')
      sourceReadInstructions(route).forEach((line, lineIndex) => {
        lines.push(`${lineIndex + 1}. ${line}`)
      })
      lines.push('')
      lines.push('### Warum daraus dieses Lernziel entsteht')
      lines.push('')
      lines.push(`Die Quelle formuliert den fachlichen Kern so: ${formatShortNullable(sourceEvidenceText(route), 320)}`)
      if (route.parentBulletText !== null && route.parentBulletText !== route.sourceSpan) {
        lines.push('')
        lines.push(`Dieser Ausschnitt steht in einem breiteren offiziellen Erwartungssatz: ${formatShortNullable(route.parentBulletText, 360)}`)
      }
      lines.push('')
      lines.push(`SkillPilot formuliert daraus ein prüfbares Lernziel im Pfad "${goalPathText(item)}": ${item.goal.description}`)
      lines.push('')
      lines.push(`Die fachliche Zuordnungsprüfung bewertet die Verbindung als ${plainMatchType(route.matchType)}. Inhaltlich heißt das: Der extrahierte Quellenbeleg trägt dieses Lernziel direkt; weitere klassische Quellenwege bleiben maschinenlesbar dokumentiert.`)
      lines.push('')
    }

    lines.push('### MEM/FWU-SPARQL als Alternativweg')
    lines.push('')
    const memRoute = item.memSparqlRoute
    if (memRoute.status !== 'mem_sparql_consistent') {
      lines.push(`Für dieses Beispiel ist die MEM/FWU-Route nicht als konsistent gerendert. Status: \`${memRoute.status}\`.`)
      lines.push(memRoute.notes)
      lines.push('')
    } else {
      lines.push('MEM/FWU liefert über die SPARQL-Schnittstelle denselben bzw. den passenden übergeordneten Erwartungstext. So kann man das Ergebnis nachvollziehen:')
      lines.push('')
      lines.push('1. Öffne den SPARQL-Endpunkt: https://sparql.mem.edufeed.org/sparql')
      lines.push('2. Kopiere die folgende Abfrage in das Query-Feld und führe sie aus.')
      lines.push('')
      lines.push('```sparql')
      lines.push(memVerificationQuery(memRoute) ?? '# Keine SPARQL-Abfrage verfügbar.')
      lines.push('```')
      lines.push('')
      lines.push('3. Die Abfrage sollte genau eine Zeile liefern.')
      lines.push(`4. Prüfe die Spalten: \`planLabel\` sollte "${formatNullable(memRoute.planLabel ?? null)}" sein, \`yearLabel\` sollte "${formatNullable(memRoute.yearLabel ?? null)}" sein.`)
      lines.push(`5. In \`goalLabel\` sollte dieser Erwartungstext stehen oder beginnen: ${formatShortNullable(memRoute.goalLabel ?? null, 320)}`)
      lines.push('')
      lines.push('Auswertung: Wenn diese Zeile erscheint und der Erwartungstext fachlich mit dem oben beschriebenen Quellenbeleg übereinstimmt, ist der MEM/FWU-Weg für dieses Lernziel als konsistenter Alternativweg nutzbar. Wenn keine Zeile erscheint oder der Text abweicht, entsteht ein nicht-blockierender Review-Fall.')
      lines.push('')
    }

    if (item.limitations.length > 0) {
      lines.push('### Offene Punkte')
      lines.push('')
      item.limitations.forEach((limitation) => lines.push(`- ${limitation}`))
      lines.push('')
    }
  })

  return `${lines.join('\n')}\n`
}

function renderMarkdown(report: SourceRationaleReport): string {
  if (report.request.audience === 'plain') return renderPlainMarkdown(report)

  const lines: string[] = ['# Quellenbegründungen PoC', '']
  pushGeneratedMarkdownNotice(lines, report)
  lines.push('')
  lines.push(`Erzeugt: ${report.generatedAt}`)
  lines.push('')
  lines.push(report.request.includeMemSparql
    ? 'Dieser PoC rendert menschenlesbare Quellenbegründungen für ausgewählte SkillPilot-Lernziele und ergänzt den klassischen reviewten Weg um einen zielbezogenen MEM/FWU-SPARQL-Abgleich.'
    : 'Dieser PoC rendert menschenlesbare Quellenbegründungen für ausgewählte SkillPilot-Lernziele. Er nutzt derzeit nur den klassischen reviewten Weg: kanonisches Ziel -> Mapping-Review-Entscheidung -> Source-Extraction -> offizielles Quelldokument.')
  lines.push('')
  lines.push('## Zusammenfassung')
  lines.push('')
  lines.push(`- Angefragte Ziele: ${report.summary.requestedGoals}`)
  lines.push(`- Aufgelöste Ziele: ${report.summary.resolvedGoals}`)
  lines.push(`- Ziele mit klassischem Quellenweg: ${report.summary.goalsWithClassicSourceRoute}`)
  lines.push(`- Ziele ohne klassischen Quellenweg: ${report.summary.goalsWithoutClassicSourceRoute}`)
  lines.push(`- Ziele mit konsistenter MEM/FWU-SPARQL-Route: ${report.summary.goalsWithMemSparqlConsistentRoute}`)
  lines.push(`- Landschaft: \`${report.request.landscapePath}\``)
  lines.push(`- Mapping-Root: \`${report.request.mappingRoot}\``)
  lines.push(`- Bundesland-Scope: ${formatNullable(report.request.jurisdiction)}`)
  lines.push(`- MEM/FWU-SPARQL einbezogen: ${report.request.includeMemSparql ? 'ja' : 'nein'}`)
  if (report.request.memConfigPath !== null) {
    lines.push(`- MEM/FWU-Konfig: \`${report.request.memConfigPath}\``)
  }
  lines.push('')

  report.items.forEach((item, index) => {
    lines.push(`## ${index + 1}. ${item.goal.title}`)
    lines.push('')
    lines.push('### Lernziel')
    lines.push('')
    lines.push(`- Ziel-ID: \`${item.goal.id}\``)
    lines.push(`- Beschreibung: ${item.goal.description}`)
    lines.push(`- Quellenbegründungsstatus: \`${item.sourceRationaleStatus}\``)
    lines.push('')

    const route = item.classicSourceRoute
    if (route === null) {
      lines.push('### Kurzbegründung')
      lines.push('')
      lines.push('Für dieses Ziel wurde in den gescannten Mapping-Reviews kein reviewter klassischer Quellenweg gefunden.')
      lines.push('')
    } else {
      lines.push('### Kurzbegründung')
      lines.push('')
      lines.push(`Dieses Ziel ist derzeit über \`${route.sourceGoalId}\` (${sourceLocationHint(route)}) begründet. SkillPilot hat dieses Source-Ziel aus \`${route.sourceExtractionPath}\` extrahiert und mit Match-Typ \`${formatNullable(route.matchType)}\` dem angefragten kanonischen Ziel zugeordnet.`)
      lines.push('')
      lines.push('### Originalquelle Finden')
      lines.push('')
      sourceAccessLines(route).forEach((line) => lines.push(line))
      lines.push('')
      lines.push('### Extrahierter Quellenbeleg')
      lines.push('')
      lines.push(`- Bundesland: ${formatNullable(route.jurisdiction)}`)
      lines.push(`- Quelldokument: ${formatNullable(route.sourceDocument?.title ?? null)}`)
      lines.push(`- Offizielle URL: ${formatNullable(route.sourceDocument?.url ?? null)}`)
      lines.push(`- Source-Ziel: \`${route.sourceGoalId}\``)
      lines.push(`- Quellenreferenz: ${formatNullable(route.sourceRef)}`)
      lines.push(`- Quellenstelle (Kurzfassung): ${formatShortNullable(route.sourceSpan)}`)
      lines.push(`- Kurzer Quelltextauszug: ${formatShortNullable(route.sourceText)}`)
      lines.push('')
      lines.push('### Warum das SkillPilot-Ziel begründet ist')
      lines.push('')
      lines.push(route.rationale ?? 'Es wurde keine Mapping-Begründung gespeichert.')
      lines.push('')
      lines.push('### Mapping-Form')
      lines.push('')
      lines.push(`- Match-Typ: \`${formatNullable(route.matchType)}\``)
      lines.push(`- Review-Entscheidung: \`${formatNullable(route.decision)}\``)
      lines.push(`- Review-Decision-ID: \`${formatNullable(route.reviewDecisionId)}\``)
      lines.push(`- Review-Datum: ${formatNullable(route.reviewedAt)}`)
      lines.push(`- Reviewer: ${formatNullable(route.reviewer)}`)
      lines.push(`- Evidence-Methode: ${formatNullable(route.evidenceMethod)}`)
      if (item.alternateClassicSourceRoutes.length > 0) {
        lines.push(`- Weitere klassische Quellenwege im JSON: ${item.alternateClassicSourceRoutes.length}`)
      }
      lines.push('')
    }

    lines.push('### MEM/FWU SPARQL-Route')
    lines.push('')
    lines.push(`- Status: \`${item.memSparqlRoute.status}\``)
    lines.push(`- Endpoint: ${item.memSparqlRoute.endpoint}`)
    lines.push(`- Hinweise: ${item.memSparqlRoute.notes}`)
    if (item.memSparqlRoute.status === 'mem_sparql_consistent') {
      lines.push(`- Vergleich: ${formatNullable(item.memSparqlRoute.comparisonLabel ?? null)} (\`${formatNullable(item.memSparqlRoute.comparisonId ?? null)}\`)`)
      lines.push(`- MEM-Graph: ${formatNullable(item.memSparqlRoute.graphIri ?? null)}`)
      lines.push(`- MEM-Plan: ${formatNullable(item.memSparqlRoute.planLabel ?? null)} / ${formatNullable(item.memSparqlRoute.yearLabel ?? null)}`)
      lines.push(`- MEM-Plan-IRI: ${formatNullable(item.memSparqlRoute.planIri ?? null)}`)
      lines.push(`- MEM-Ziel-IRI: ${formatNullable(item.memSparqlRoute.goalIri ?? null)}`)
      lines.push(`- MEM-Erwartungstext: ${formatShortNullable(item.memSparqlRoute.goalLabel ?? null)}`)
      lines.push(`- Match-Basis: ${formatNullable(item.memSparqlRoute.matchBasis ?? null)}`)
    } else if (item.memSparqlRoute.status === 'mem_sparql_review_needed') {
      lines.push(`- Vergleich: ${formatNullable(item.memSparqlRoute.comparisonLabel ?? null)} (\`${formatNullable(item.memSparqlRoute.comparisonId ?? null)}\`)`)
      lines.push(`- MEM-Graph: ${formatNullable(item.memSparqlRoute.graphIri ?? null)}`)
    }
    lines.push('')
    lines.push('### Grenzen')
    lines.push('')
    if (item.limitations.length === 0) {
      lines.push('- Keine bekannten Einschränkungen für den gerenderten klassischen Quellenweg und die konfigurierte MEM/FWU-SPARQL-Route.')
    } else {
      item.limitations.forEach((limitation) => lines.push(`- ${limitation}`))
    }
    lines.push('')
  })

  return `${lines.join('\n')}\n`
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const goalIds = args.goalSelection === 'source-backed'
    ? collectSourceBackedGoalIds({
      landscapePath: args.landscapePath,
      mappingRoot: args.mappingRoot,
      jurisdiction: args.jurisdiction,
    })
    : args.goalSelection === 'source-backed-relevant-leaves'
      ? collectSourceBackedRelevantLeafGoalIds({
        landscapePath: args.landscapePath,
        mappingRoot: args.mappingRoot,
      })
    : args.goalSelection === 'all-relevant-leaves'
      ? collectAllRelevantLeafGoalIds({
        landscapePath: args.landscapePath,
      })
      : args.goalIds
  const report = buildReport({
    landscapePath: args.landscapePath,
    mappingRoot: args.mappingRoot,
    goalSelection: args.goalSelection,
    goalIds,
    jurisdiction: args.jurisdiction,
    includeMemSparql: args.includeMemSparql,
    memConfigPath: args.includeMemSparql ? args.memConfigPath : null,
    audience: args.audience,
  })

  if (args.includeMemSparql) {
    await enrichReportWithMemSparql(report, args.memConfigPath)
  }

  mkdirSync(dirname(resolveRepoPath(args.outputJsonPath)), { recursive: true })
  writeFileSync(resolveRepoPath(args.outputJsonPath), `${JSON.stringify(report, null, 2)}\n`)
  if (args.publicJsonPath !== null) {
    mkdirSync(dirname(resolveRepoPath(args.publicJsonPath)), { recursive: true })
    writeFileSync(resolveRepoPath(args.publicJsonPath), `${JSON.stringify(report, null, 2)}\n`)
  }
  if (args.outputMarkdownPath !== null) {
    mkdirSync(dirname(resolveRepoPath(args.outputMarkdownPath)), { recursive: true })
    writeFileSync(resolveRepoPath(args.outputMarkdownPath), renderMarkdown(report))
  }

  console.log(`Wrote ${args.outputJsonPath}`)
  if (args.publicJsonPath !== null) console.log(`Wrote ${args.publicJsonPath}`)
  if (args.outputMarkdownPath !== null) console.log(`Wrote ${args.outputMarkdownPath}`)
}

await main()
