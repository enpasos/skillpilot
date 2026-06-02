import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

type AuditConfig = {
  schemaVersion: 1
  auditId: string
  title: string
  endpoint: string
  subjectLabel: string
  schoolTypeLabel: string
  sourceExtractionRoot: string
  reportJsonPath: string
  reportMarkdownPath: string
  reviewIssuesMarkdownPath?: string
  reviewIssuesJsonPath?: string
  reviewLedgerPath?: string
  reviewNotes?: Record<string, string>
  maxIssuesPerCategory?: number
  states: Record<string, string>
  concreteTextComparisons?: ConcreteTextComparisonConfig[]
}

type ConcreteTextComparisonConfig = {
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

type SparqlBindingValue = {
  type: string
  value: string
  datatype?: string
  'xml:lang'?: string
}

type SparqlResponse = {
  head?: { vars?: string[] }
  results?: {
    bindings?: Array<Record<string, SparqlBindingValue>>
  }
}

type SourceGoal = {
  id?: unknown
  title?: unknown
  sourceText?: unknown
  sourceSpan?: unknown
  parentBulletText?: unknown
  sourceRef?: unknown
  tags?: unknown
}

type SourcePassage = {
  id?: unknown
  title?: unknown
  text?: unknown
  sourceRef?: unknown
}

type SourceExtraction = {
  title?: unknown
  extractionId?: unknown
  sourceLandscapeId?: unknown
  jurisdiction?: unknown
  subject?: unknown
  stage?: unknown
  sourceDocuments?: unknown
  passages?: unknown
  sourceGoals?: unknown
}

type LocalSourceExtractionSummary = {
  path: string
  title: string
  extractionId: string | null
  sourceLandscapeId: string | null
  jurisdiction: string
  subject: string
  stage: string
  sourceDocuments: number
  passages: number
  sourceGoals: number
}

type StateMemAvailability = {
  jurisdiction: string
  label: string
  stateIri: string | null
  subjectIri: string | null
  schoolTypeIri: string | null
  planCount: number
}

type StateAuditRow = {
  jurisdiction: string
  label: string
  localSourceExtractions: number
  localSourceGoals: number
  localStages: string[]
  memStateIri: string | null
  memSubjectIri: string | null
  memSchoolTypeIri: string | null
  memPlanCount: number
  status: 'aligned' | 'mem_curriculum_available' | 'mem_curriculum_missing' | 'mem_scope_vocab_missing' | 'local_source_missing' | 'endpoint_error'
}

type MemExpectation = {
  planIri: string
  planLabel: string
  yearLabel: string
  goalIri: string
  text: string
  normalizedText: string
}

type TextIndexEntry = {
  text: string
  normalizedText: string
  sourceGoalIds: string[]
  sourceRefs: string[]
}

type PassageIndexEntry = {
  id: string | null
  title: string
  text: string
  normalizedText: string
  sourceRef: string | null
}

type ConcreteComparison = {
  id: string
  label: string
  jurisdiction: string
  localUniqueExpectationTexts: number
  memExpectationTexts: number
  matchedMemExpectationTexts: number
  unmatchedMemExpectationTexts: number
  unmatchedLocalExpectationTexts: number
  status: 'aligned' | 'discrepancies' | 'endpoint_error' | 'not_configured'
}

type TriageCategory =
  | 'local_extraction_artifact'
  | 'local_passage_only'
  | 'source_scope_mismatch'
  | 'notation_formula_representation'
  | 'granularity_mismatch'
  | 'possible_real_gap'

type TriageItem = {
  id: string
  category: TriageCategory
  confidence: 'high' | 'medium' | 'low'
  side: 'paired' | 'mem_only' | 'local_only'
  similarity: number
  rationale: string
  memText?: string
  memRef?: string
  localText?: string
  localRef?: string
  reviewNote?: string
}

type ConcreteComparisonTriage = {
  comparisonId: string
  label: string
  jurisdiction: string
  unmatchedMemExpectationTexts: number
  unmatchedLocalExpectationTexts: number
  itemCount: number
  categoryCounts: Record<TriageCategory, number>
  items: TriageItem[]
}

type AuditIssue = {
  id: string
  category:
    | 'MEM_ENDPOINT_UNREACHABLE'
    | 'MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE'
    | 'MEM_SCOPE_VOCAB_MISSING'
    | 'MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE'
    | 'LOCAL_EXPECTATION_NOT_FOUND_IN_MEM'
  severity: 'review' | 'watch'
  jurisdiction?: string
  title: string
  details: string
  memRef?: string
  localRef?: string
  evidence?: Record<string, unknown>
}

type ReviewDecisionStatus =
  | 'not_an_issue'
  | 'local_extraction_fix_needed'
  | 'mem_feedback_candidate'
  | 'source_version_gap'
  | 'deferred'

type ReviewQueueItemStatus = 'open' | 'decided' | 'deferred' | 'stale_review'

type MemSparqlConsistencyAudit = {
  schemaVersion: 1
  generatedAt: string
  generatedBy: string
  configPath: string
  endpoint: string
  subjectLabel: string
  schoolTypeLabel: string
  mode: 'non_blocking_review'
  summary: {
    jurisdictions: number
    localSourceExtractions: number
    localSourceGoals: number
    memCurriculumAvailableJurisdictions: number
    memCurriculumMissingForLocalSourceJurisdictions: number
    concreteComparisons: number
    issueCount: number
  }
  sourceExtractions: LocalSourceExtractionSummary[]
  stateRows: StateAuditRow[]
  concreteComparisons: ConcreteComparison[]
  triage: ConcreteComparisonTriage[]
  issues: AuditIssue[]
}

type ReviewQueueItem = {
  id: string
  itemFingerprint: string
  status: ReviewQueueItemStatus
  kind: 'text_triage' | 'availability_watch' | 'endpoint_or_vocabulary_watch'
  category: string
  jurisdiction?: string
  comparisonId?: string
  comparisonLabel?: string
  severity?: AuditIssue['severity']
  side?: TriageItem['side']
  confidence?: TriageItem['confidence']
  similarity?: number
  title?: string
  details?: string
  rationale?: string
  memText?: string
  memRef?: string
  localText?: string
  localRef?: string
  reviewNote?: string
  reviewAction: string
  ledgerStatus?: ReviewDecisionStatus
  ledgerReviewedAt?: string
  ledgerReviewer?: string
  ledgerReason?: string
  ledgerFollowUpRef?: string
}

type ReviewDecisionRecord = {
  schemaVersion: 1
  auditId: string
  itemId: string
  itemFingerprint: string
  status: ReviewDecisionStatus
  reviewedAt: string
  reviewer: string
  reason: string
  followUpRef?: string
}

type ReviewLedgerSummary = {
  configured: boolean
  path?: string
  records: number
  currentRecords: number
  staleRecords: number
  unknownItemRecords: number
  duplicateItemRecords: number
  diagnostics: string[]
}

type ReviewIssueQueue = {
  schemaVersion: 1
  generatedAt: string
  generatedBy: string
  sourceAuditJsonPath: string
  sourceAuditMarkdownPath: string
  reviewLedgerPath?: string
  endpoint: string
  subjectLabel: string
  schoolTypeLabel: string
  mode: 'non_blocking_review'
  summary: {
    openItems: number
    decidedItems: number
    deferredItems: number
    staleReviewItems: number
    highestSignalChecks: number
    textTriageItems: number
    memAvailabilityWatchItems: number
    endpointOrVocabularyWatchItems: number
  }
  reviewLedger: ReviewLedgerSummary
  highestSignalChecks: ReviewQueueItem[]
  textTriageQueue: ReviewQueueItem[]
  memAvailabilityWatch: ReviewQueueItem[]
  endpointAndVocabularyWatch: ReviewQueueItem[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const defaultConfigPath = 'curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json'

const LP = 'https://w3id.org/lehrplan/ontology/'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const BFO = 'http://purl.obolibrary.org/obo/'

const usage = () => `Usage:
  npm run quality:mem-sparql-consistency

Options:
  --config=<path>    Audit config path. Default: ${defaultConfigPath}
  --endpoint=<url>   Override SPARQL endpoint from config.
  --help
`

const toPosix = (value: string): string => value.split(sep).join('/')
const repoPath = (absolutePath: string): string => toPosix(relative(repoRoot, absolutePath))
const resolveRepoPath = (inputPath: string): string => resolve(repoRoot, inputPath)

const hashId = (value: string): string =>
  createHash('sha256').update(value).digest('hex').slice(0, 12)

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, nested]) => nested !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const bindingValue = (binding: Record<string, SparqlBindingValue>, key: string): string | null =>
  binding[key]?.value ?? null

const literal = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null

const arrayLength = (value: unknown): number => Array.isArray(value) ? value.length : 0

const asSourceGoals = (value: unknown): SourceGoal[] =>
  Array.isArray(value) ? value.filter((entry): entry is SourceGoal => typeof entry === 'object' && entry !== null) : []

const asSourcePassages = (value: unknown): SourcePassage[] =>
  Array.isArray(value) ? value.filter((entry): entry is SourcePassage => typeof entry === 'object' && entry !== null) : []

const reviewDecisionStatuses: ReviewDecisionStatus[] = [
  'not_an_issue',
  'local_extraction_fix_needed',
  'mem_feedback_candidate',
  'source_version_gap',
  'deferred',
]

const normalizeJurisdiction = (value: unknown): string | null => {
  const raw = literal(value)
  if (!raw) return null
  return raw.startsWith('DE-') ? raw : null
}

const parseArgs = () => {
  const options = {
    configPath: defaultConfigPath,
    endpoint: null as string | null,
    help: false,
  }

  for (const arg of process.argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      options.help = true
      continue
    }
    if (arg.startsWith('--config=')) {
      options.configPath = arg.slice('--config='.length)
      continue
    }
    if (arg.startsWith('--endpoint=')) {
      options.endpoint = arg.slice('--endpoint='.length)
      continue
    }
    throw new Error(`Unsupported argument: ${arg}`)
  }

  return options
}

function readConfig(configPath: string): AuditConfig {
  const absoluteConfigPath = resolveRepoPath(configPath)
  if (!existsSync(absoluteConfigPath)) {
    throw new Error(`MEM SPARQL consistency config not found: ${configPath}`)
  }
  return JSON.parse(readFileSync(absoluteConfigPath, 'utf8')) as AuditConfig
}

function findFiles(root: string, predicate: (path: string) => boolean): string[] {
  const files: string[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const childPath = join(root, entry.name)
    if (entry.isDirectory()) {
      files.push(...findFiles(childPath, predicate))
      continue
    }
    if (entry.isFile() && predicate(childPath)) {
      files.push(childPath)
    }
  }
  return files
}

function readLocalMathSourceExtractions(config: AuditConfig): LocalSourceExtractionSummary[] {
  const root = resolveRepoPath(config.sourceExtractionRoot)
  if (!existsSync(root)) return []

  return findFiles(root, (path) => extname(path) === '.json' && path.endsWith('.source-extraction.json'))
    .map((path) => {
      const document = JSON.parse(readFileSync(path, 'utf8')) as SourceExtraction
      return { path, document }
    })
    .filter(({ document }) => literal(document.subject) === config.subjectLabel)
    .map(({ path, document }) => ({
      path: repoPath(path),
      title: literal(document.title) ?? repoPath(path),
      extractionId: literal(document.extractionId),
      sourceLandscapeId: literal(document.sourceLandscapeId),
      jurisdiction: normalizeJurisdiction(document.jurisdiction) ?? 'UNKNOWN',
      subject: literal(document.subject) ?? '',
      stage: literal(document.stage) ?? '',
      sourceDocuments: arrayLength(document.sourceDocuments),
      passages: arrayLength(document.passages),
      sourceGoals: arrayLength(document.sourceGoals),
    }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

function groupedLocalSummaries(sourceExtractions: LocalSourceExtractionSummary[]): Map<string, LocalSourceExtractionSummary[]> {
  const byJurisdiction = new Map<string, LocalSourceExtractionSummary[]>()
  for (const sourceExtraction of sourceExtractions) {
    const current = byJurisdiction.get(sourceExtraction.jurisdiction) ?? []
    current.push(sourceExtraction)
    byJurisdiction.set(sourceExtraction.jurisdiction, current)
  }
  return byJurisdiction
}

const sparqlString = (value: string) =>
  `"${value.replace(/\\/gu, '\\\\').replace(/"/gu, '\\"')}"@de`

function buildStateVocabularyQuery(config: AuditConfig): string {
  const stateLabels = Object.values(config.states).map(sparqlString).join(' ')
  return `
PREFIX lp: <${LP}>
PREFIX rdfs: <${RDFS}>
SELECT DISTINCT ?state ?stateLabel
WHERE {
  VALUES ?stateLabel { ${stateLabels} }
  ?state a lp:LP_0000040 ;
         rdfs:label ?stateLabel .
}
ORDER BY ?stateLabel
`
}

function buildPlanCountQuery(config: AuditConfig): string {
  return `
PREFIX lp: <${LP}>
PREFIX rdfs: <${RDFS}>
SELECT ?state (SAMPLE(?subject) AS ?subject) (SAMPLE(?schoolType) AS ?schoolType) (COUNT(DISTINCT ?plan) AS ?planCount)
WHERE {
  ?plan a ?planType ;
        lp:LP_0000029 ?state ;
        lp:LP_0000537 ?subject ;
        lp:LP_0000812 ?schoolType .
  ?planType rdfs:subClassOf* lp:LP_0000438 .
  ?subject rdfs:label ?subjectLabel .
  ?schoolType rdfs:label ?schoolTypeLabel .
  FILTER(langMatches(lang(?subjectLabel), "de") && str(?subjectLabel) = "${config.subjectLabel}")
  FILTER(langMatches(lang(?schoolTypeLabel), "de") && str(?schoolTypeLabel) = "${config.schoolTypeLabel}")
}
GROUP BY ?state
ORDER BY DESC(?planCount)
`
}

function iri(value: string): string {
  if (!/^https?:\/\//u.test(value)) {
    throw new Error(`Expected absolute IRI: ${value}`)
  }
  return `<${value}>`
}

function buildConcreteComparisonQuery(comparison: ConcreteTextComparisonConfig): string {
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

const htmlEntityMap: Record<string, string> = {
  amp: '&',
  alpha: '\u03b1',
  apos: "'",
  bdquo: '\u201e',
  beta: '\u03b2',
  cap: '\u2229',
  deg: '\u00b0',
  euro: '\u20ac',
  gamma: '\u03b3',
  infin: '\u221e',
  isin: '\u2208',
  ldquo: '\u201c',
  mdash: '\u2014',
  middot: '\u00b7',
  minus: '\u2212',
  nbsp: ' ',
  ndash: '\u2013',
  pi: '\u03c0',
  prime: '\u2032',
  quot: '"',
  rdquo: '\u201d',
  sdot: '\u22c5',
  shy: '',
  times: '\u00d7',
  cup: '\u222a',
}

const decodeHtmlEntity = (entity: string): string => {
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

const decodeHtmlish = (value: string): string =>
  value
    .replace(/\[\[image:[^\]]+\]\]/giu, ' ')
    .replace(/&nbsp;?/giu, ' ')
    .replace(/&([a-z][a-z0-9]+|#[0-9]+|#x[0-9a-f]+);/giu, (_match, entity: string) => decodeHtmlEntity(entity))
    .replace(/<[^>]+>/gu, '')
    .replace(/\[\/?lang(?:=[^\]]+)?\]/giu, ' ')
    .replace(/\/\//gu, '')
    .replace(/\\\\/gu, '')

function normalizeMathNotation(value: string): string {
  return value
    .replace(/\uF03D/gu, '=')
    .replace(/\uF0D7/gu, '\u00b7')
    .replace(/\uF02B/gu, '+')
    .replace(/\uF02D/gu, '-')
    .replace(/\uF028/gu, '(')
    .replace(/\uF029/gu, ')')
    .replace(/\uF0F2/gu, '\u222b')
    .replace(/\s*([=+·⋅])\s*/gu, '$1')
    .replace(/\s+-\s+/gu, '-')
    .replace(/\(([a-z]-[a-z])\)/giu, '$1')
    .replace(/\b([a-z])\s*\(\s*([a-z])\s*\)/giu, '$1$2')
    .replace(/\b([a-z])\s*\(\s*([a-z])\s*([+-])\s*([a-z])\s*\)/giu, '$1$2$3$4')
    .replace(/\b([a-z])\s*\(\s*([a-z])\s*([·⋅])\s*([a-z])\s*\)/giu, '$1$2$3$4')
    .replace(/\b([a-z])\s+([0-9])\b/giu, '$1$2')
    .replace(/\b([efxy])\s+([efxy])\b/giu, '$1$2')
    .replace(/\by\s*'\s*'\s*/giu, "y''")
}

function normalizePlainText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\bRäuber-BeuteSystems\b/giu, 'Räuber-Beute-Systems')
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

const triageStopWords = new Set([
  'aber',
  'als',
  'auch',
  'auf',
  'aus',
  'bei',
  'beim',
  'das',
  'dass',
  'dem',
  'den',
  'der',
  'des',
  'die',
  'durch',
  'ein',
  'eine',
  'einem',
  'einen',
  'einer',
  'eines',
  'für',
  'ist',
  'mit',
  'nach',
  'oder',
  'sich',
  'sie',
  'sowie',
  'und',
  'vom',
  'von',
  'werden',
  'wird',
  'zu',
  'zum',
  'zur',
])

const triageTokens = (value: string): Set<string> =>
  new Set(normalizeText(value)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 2 && !triageStopWords.has(token)))

function textSimilarity(left: string, right: string): number {
  const normalizedLeft = normalizeText(left)
  const normalizedRight = normalizeText(right)
  if (normalizedLeft.length > 15 && normalizedRight.length > 15 &&
    (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))) {
    return 0.9
  }

  const leftTokens = triageTokens(left)
  const rightTokens = triageTokens(right)
  if (leftTokens.size === 0 && rightTokens.size === 0) return 0

  let intersection = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1
  }
  return (2 * intersection) / (leftTokens.size + rightTokens.size)
}

function hasLocalExtractionArtifact(value: string): boolean {
  return value.length > 800 ||
    /\bGY\s*-\s*MA\b/u.test(value) ||
    /\bLernbereich\s+\d+\b/u.test(value) ||
    /\bUstd\./u.test(value)
}

function hasBroadSourceScopeText(value: string): boolean {
  const normalized = normalizeText(value)
  return normalized.length > 300 && (
    normalized.startsWith('entwickeln von problemlösefähigkeiten') ||
    normalized.startsWith('entwickeln eines kritischen vernunftgebrauchs') ||
    normalized.startsWith('entwickeln des verständigen umgangs') ||
    normalized.startsWith('entwickeln des anschauungsvermögens') ||
    normalized.startsWith('erwerben grundlegender kompetenzen im umgang')
  )
}

function hasNotationOrFormula(value: string): boolean {
  return /[\uE000-\uF8FF=∫√π∞≤≥∩∪∈·⋅′]/u.test(value) ||
    /\b(?:sin|cos|tan|ln|log)\b/u.test(value) ||
    /\b[xy]\s*=|\b[fdg]\s*\(\s*x\s*\)|\bd[xy]\b/u.test(value)
}

function lengthRatio(left: string, right: string): number {
  const shorter = Math.max(1, Math.min(left.length, right.length))
  return Math.max(left.length, right.length) / shorter
}

function stripIsolatedPdfMarkers(value: string): string {
  return normalizeText(value)
    .replace(/\b[\p{L}]\b/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

function classifyTriageItem(memText: string | null, localText: string | null, similarity: number): Pick<TriageItem, 'category' | 'confidence' | 'rationale'> {
  const combined = `${memText ?? ''}\n${localText ?? ''}`

  if (memText && localText && stripIsolatedPdfMarkers(memText) === stripIsolatedPdfMarkers(localText)) {
    return {
      category: 'local_extraction_artifact',
      confidence: 'high',
      rationale: 'Texts match after removing isolated one-letter PDF/table markers from the local extraction.',
    }
  }

  if (localText && hasLocalExtractionArtifact(localText)) {
    return {
      category: 'local_extraction_artifact',
      confidence: similarity >= 0.35 || localText.length > 1200 ? 'high' : 'medium',
      rationale: 'Local text shows PDF extraction markers such as overlong table text, hyphenated line breaks, page labels, or Lernbereich bleed-through.',
    }
  }

  if (localText && !memText && hasBroadSourceScopeText(localText)) {
    return {
      category: 'source_scope_mismatch',
      confidence: 'high',
      rationale: 'Local text is broad stage-level source prose rather than a MEM-style curriculum expectation fragment.',
    }
  }

  if (hasNotationOrFormula(combined)) {
    return {
      category: 'notation_formula_representation',
      confidence: similarity >= 0.45 ? 'high' : 'medium',
      rationale: 'Texts overlap, but mathematical notation, formula glyphs, or private-use PDF symbols differ between MEM and the local extraction.',
    }
  }

  if (memText && localText && (similarity >= 0.55 || lengthRatio(memText, localText) >= 1.8)) {
    return {
      category: 'granularity_mismatch',
      confidence: similarity >= 0.55 ? 'high' : 'medium',
      rationale: 'Texts appear related, but one side is broader, narrower, or combines several curriculum fragments.',
    }
  }

  return {
    category: 'possible_real_gap',
    confidence: similarity >= 0.25 ? 'medium' : 'low',
    rationale: 'No strong deterministic match candidate was found. This needs human review as a possible real source or MEM coverage gap.',
  }
}

function findBestRelatedEntry<T>(
  text: string,
  entries: T[],
  getText: (entry: T) => string,
  minSimilarity = 0.85,
): { entry: T; similarity: number } | null {
  let best: { entry: T; similarity: number } | null = null
  for (const entry of entries) {
    const similarity = textSimilarity(text, getText(entry))
    if (similarity < minSimilarity) continue
    if (!best || similarity > best.similarity) {
      best = { entry, similarity }
    }
  }
  return best
}

function excerptAroundNeedle(haystack: string, needle: string, radius = 80): string {
  const normalizedHaystack = normalizeText(haystack)
  const normalizedNeedle = normalizeText(needle)
  const index = normalizedHaystack.indexOf(normalizedNeedle)
  if (index === -1) return haystack.slice(0, radius * 2).trim()
  const start = Math.max(0, index - radius)
  const end = Math.min(haystack.length, index + needle.length + radius)
  return `${start > 0 ? '...' : ''}${haystack.slice(start, end).trim()}${end < haystack.length ? '...' : ''}`
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
}

function containsComparablePhrase(haystack: string, needle: string): boolean {
  const normalizedHaystack = normalizeText(haystack)
  const normalizedNeedle = normalizeText(needle)
  if (!normalizedNeedle || normalizedNeedle.length <= 2) return false
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(normalizedNeedle)}(?=$|[^\\p{L}\\p{N}])`, 'u')
  return pattern.test(normalizedHaystack)
}

function findContainingPassage(text: string, passages: PassageIndexEntry[]): PassageIndexEntry | null {
  const keys = comparisonKeys(text).filter((key) => key.length > 2)
  if (keys.length === 0) return null
  const matches = passages
    .filter((passage) => !hasLocalExtractionArtifact(passage.text))
    .filter((passage) => keys.some((key) => containsComparablePhrase(`${passage.title}\n${passage.text}`, key)))
    .sort((left, right) => left.text.length - right.text.length)
  return matches[0] ?? null
}

function readSourceExtractionDocument(path: string): SourceExtraction {
  return JSON.parse(readFileSync(resolveRepoPath(path), 'utf8')) as SourceExtraction
}

function localTextIndex(sourceExtractions: LocalSourceExtractionSummary[]): Map<string, TextIndexEntry> {
  const byText = new Map<string, TextIndexEntry>()
  for (const sourceExtraction of sourceExtractions) {
    const document = readSourceExtractionDocument(sourceExtraction.path)
    for (const sourceGoal of asSourceGoals(document.sourceGoals)) {
      const candidateText = literal(sourceGoal.parentBulletText) ?? literal(sourceGoal.sourceText) ?? literal(sourceGoal.sourceSpan)
      if (!candidateText) continue
      const normalizedText = normalizeText(candidateText)
      if (!normalizedText) continue

      const entry = byText.get(normalizedText) ?? {
        text: candidateText,
        normalizedText,
        sourceGoalIds: [],
        sourceRefs: [],
      }
      const sourceGoalId = literal(sourceGoal.id)
      const sourceRef = literal(sourceGoal.sourceRef)
      if (sourceGoalId && !entry.sourceGoalIds.includes(sourceGoalId)) entry.sourceGoalIds.push(sourceGoalId)
      if (sourceRef && !entry.sourceRefs.includes(sourceRef)) entry.sourceRefs.push(sourceRef)
      byText.set(normalizedText, entry)
    }
  }
  return byText
}

function localPassageIndex(sourceExtractions: LocalSourceExtractionSummary[]): PassageIndexEntry[] {
  const passages: PassageIndexEntry[] = []
  for (const sourceExtraction of sourceExtractions) {
    const document = readSourceExtractionDocument(sourceExtraction.path)
    for (const passage of asSourcePassages(document.passages)) {
      const text = literal(passage.text)
      if (!text) continue
      passages.push({
        id: literal(passage.id),
        title: literal(passage.title) ?? sourceExtraction.title,
        text,
        normalizedText: normalizeText(text),
        sourceRef: literal(passage.sourceRef),
      })
    }
  }
  return passages
}

function comparisonTextIndex(localIndex: Map<string, TextIndexEntry>): Map<string, TextIndexEntry> {
  const byComparisonKey = new Map<string, TextIndexEntry>()
  for (const entry of localIndex.values()) {
    for (const key of comparisonKeys(entry.text)) {
      if (!byComparisonKey.has(key)) {
        byComparisonKey.set(key, entry)
      }
    }
  }
  return byComparisonKey
}

function stateAvailabilityFromBindings(
  config: AuditConfig,
  stateBindings: Array<Record<string, SparqlBindingValue>>,
  planBindings: Array<Record<string, SparqlBindingValue>>,
): Map<string, StateMemAvailability> {
  const labelToJurisdiction = new Map(Object.entries(config.states).map(([jurisdiction, label]) => [label, jurisdiction]))
  const planCountsByState = new Map<string, {
    planCount: number
    subjectIri: string | null
    schoolTypeIri: string | null
  }>()
  for (const binding of planBindings) {
    const stateIri = bindingValue(binding, 'state')
    if (!stateIri) continue
    const planCount = Number.parseInt(bindingValue(binding, 'planCount') ?? '0', 10)
    planCountsByState.set(stateIri, {
      planCount: Number.isFinite(planCount) ? planCount : 0,
      subjectIri: bindingValue(binding, 'subject'),
      schoolTypeIri: bindingValue(binding, 'schoolType'),
    })
  }

  const byJurisdiction = new Map<string, StateMemAvailability>()

  for (const binding of stateBindings) {
    const label = bindingValue(binding, 'stateLabel')
    const jurisdiction = label ? labelToJurisdiction.get(label) : null
    if (!jurisdiction || !label) continue
    const stateIri = bindingValue(binding, 'state')
    const planEvidence = stateIri ? planCountsByState.get(stateIri) : null
    const current = byJurisdiction.get(jurisdiction)
    if (current && current.planCount >= (planEvidence?.planCount ?? 0)) continue

    byJurisdiction.set(jurisdiction, {
      jurisdiction,
      label,
      stateIri,
      subjectIri: planEvidence?.subjectIri ?? null,
      schoolTypeIri: planEvidence?.schoolTypeIri ?? null,
      planCount: planEvidence?.planCount ?? 0,
    })
  }

  return byJurisdiction
}

function buildStateRows(
  config: AuditConfig,
  localByJurisdiction: Map<string, LocalSourceExtractionSummary[]>,
  memByJurisdiction: Map<string, StateMemAvailability>,
  endpointFailed: boolean,
): StateAuditRow[] {
  return Object.entries(config.states).map(([jurisdiction, label]) => {
    const local = localByJurisdiction.get(jurisdiction) ?? []
    const mem = memByJurisdiction.get(jurisdiction)
    const localSourceGoals = local.reduce((sum, entry) => sum + entry.sourceGoals, 0)
    const localStages = Array.from(new Set(local.map((entry) => entry.stage).filter(Boolean))).sort()
    const status: StateAuditRow['status'] = endpointFailed
      ? 'endpoint_error'
      : !mem?.stateIri
        ? 'mem_scope_vocab_missing'
        : mem.planCount > 0 && local.length > 0
          ? 'mem_curriculum_available'
          : mem.planCount > 0
            ? 'local_source_missing'
            : local.length > 0
              ? 'mem_curriculum_missing'
              : 'aligned'

    return {
      jurisdiction,
      label,
      localSourceExtractions: local.length,
      localSourceGoals,
      localStages,
      memStateIri: mem?.stateIri ?? null,
      memSubjectIri: mem?.subjectIri ?? null,
      memSchoolTypeIri: mem?.schoolTypeIri ?? null,
      memPlanCount: mem?.planCount ?? 0,
      status,
    }
  })
}

function issueId(category: AuditIssue['category'], key: string): string {
  return `${category.toLowerCase()}-${hashId(key)}`
}

function stateAvailabilityIssues(rows: StateAuditRow[]): AuditIssue[] {
  const issues: AuditIssue[] = []
  for (const row of rows) {
    if (row.status === 'mem_curriculum_missing') {
      issues.push({
        id: issueId('MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE', `${row.jurisdiction}|${row.label}`),
        category: 'MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE',
        severity: 'watch',
        jurisdiction: row.jurisdiction,
        title: `${row.label}: local mathematics source extraction exists, but MEM has no matching curriculum plans`,
        details: `Local SkillPilot source extraction has ${row.localSourceExtractions} file(s) and ${row.localSourceGoals} source goals for ${row.label}. The MEM endpoint currently exposes the state vocabulary, but no ${row.label} ${row.localStages.join('/')} ${row.localStages.length > 0 ? '' : 'stage '}curriculum plan matching Mathematik/Gymnasium.`,
        evidence: {
          localSourceExtractions: row.localSourceExtractions,
          localSourceGoals: row.localSourceGoals,
          localStages: row.localStages,
          memStateIri: row.memStateIri,
          memSubjectIri: row.memSubjectIri,
          memSchoolTypeIri: row.memSchoolTypeIri,
        },
      })
      continue
    }
    if (row.status === 'mem_scope_vocab_missing') {
      issues.push({
        id: issueId('MEM_SCOPE_VOCAB_MISSING', `${row.jurisdiction}|${row.label}`),
        category: 'MEM_SCOPE_VOCAB_MISSING',
        severity: 'watch',
        jurisdiction: row.jurisdiction,
        title: `${row.label}: MEM scope vocabulary is incomplete for Mathematik/Gymnasium`,
        details: `The audit could not resolve all MEM vocabulary resources needed for ${row.label} / Mathematik / Gymnasium.`,
        evidence: {
          memStateIri: row.memStateIri,
          memSubjectIri: row.memSubjectIri,
          memSchoolTypeIri: row.memSchoolTypeIri,
        },
      })
    }
  }
  return issues
}

function expectationsFromBindings(bindings: Array<Record<string, SparqlBindingValue>>): MemExpectation[] {
  const byGoal = new Map<string, MemExpectation>()
  for (const binding of bindings) {
    const goalIri = bindingValue(binding, 'goal')
    const text = bindingValue(binding, 'goalLabel')
    if (!goalIri || !text) continue
    const expectation: MemExpectation = {
      planIri: bindingValue(binding, 'plan') ?? '',
      planLabel: bindingValue(binding, 'planLabel') ?? '',
      yearLabel: bindingValue(binding, 'yearLabel') ?? '',
      goalIri,
      text,
      normalizedText: normalizeText(text),
    }
    byGoal.set(goalIri, expectation)
  }
  return Array.from(byGoal.values()).sort((a, b) =>
    `${a.yearLabel}|${a.planLabel}|${a.text}`.localeCompare(`${b.yearLabel}|${b.planLabel}|${b.text}`))
}

function capEntries<T>(entries: T[], maxIssues: number): T[] {
  return entries.slice(0, Math.max(0, maxIssues))
}

function buildConcreteComparisonIssues(
  comparison: ConcreteTextComparisonConfig,
  memUnmatched: MemExpectation[],
  localUnmatched: TextIndexEntry[],
  maxIssues: number,
): AuditIssue[] {
  const issues: AuditIssue[] = []
  for (const entry of capEntries(memUnmatched, maxIssues)) {
    issues.push({
      id: issueId('MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE', `${comparison.id}|${entry.goalIri}`),
      category: 'MEM_EXPECTATION_NOT_FOUND_IN_LOCAL_SOURCE',
      severity: 'review',
      jurisdiction: comparison.jurisdiction,
      title: `MEM expectation not found in local source extraction: ${entry.planLabel}`,
      details: entry.text,
      memRef: entry.goalIri,
      evidence: {
        planIri: entry.planIri,
        planLabel: entry.planLabel,
        yearLabel: entry.yearLabel,
      },
    })
  }
  for (const entry of capEntries(localUnmatched, maxIssues)) {
    issues.push({
      id: issueId('LOCAL_EXPECTATION_NOT_FOUND_IN_MEM', `${comparison.id}|${entry.normalizedText}`),
      category: 'LOCAL_EXPECTATION_NOT_FOUND_IN_MEM',
      severity: 'review',
      jurisdiction: comparison.jurisdiction,
      title: 'Local source expectation not found in MEM',
      details: entry.text,
      localRef: entry.sourceRefs[0] ?? entry.sourceGoalIds[0],
      evidence: {
        sourceGoalIds: entry.sourceGoalIds.slice(0, 10),
        sourceRefs: entry.sourceRefs.slice(0, 10),
      },
    })
  }
  return issues
}

const emptyTriageCounts = (): Record<TriageCategory, number> => ({
  granularity_mismatch: 0,
  local_passage_only: 0,
  local_extraction_artifact: 0,
  notation_formula_representation: 0,
  possible_real_gap: 0,
  source_scope_mismatch: 0,
})

function buildComparisonTriage(
  comparison: ConcreteTextComparisonConfig,
  memUnmatched: MemExpectation[],
  localUnmatched: TextIndexEntry[],
  memExpectations: MemExpectation[],
  localEntries: TextIndexEntry[],
  localPassages: PassageIndexEntry[],
): ConcreteComparisonTriage {
  const candidates: Array<{ memIndex: number; localIndex: number; similarity: number }> = []
  for (const [memIndex, memEntry] of memUnmatched.entries()) {
    for (const [localIndex, localEntry] of localUnmatched.entries()) {
      const similarity = textSimilarity(memEntry.text, localEntry.text)
      if (similarity >= 0.2) {
        candidates.push({ memIndex, localIndex, similarity })
      }
    }
  }

  candidates.sort((a, b) => b.similarity - a.similarity)

  const usedMem = new Set<number>()
  const usedLocal = new Set<number>()
  const items: TriageItem[] = []

  for (const candidate of candidates) {
    if (usedMem.has(candidate.memIndex) || usedLocal.has(candidate.localIndex)) continue
    usedMem.add(candidate.memIndex)
    usedLocal.add(candidate.localIndex)
    const memEntry = memUnmatched[candidate.memIndex]
    const localEntry = localUnmatched[candidate.localIndex]
    const classification = classifyTriageItem(memEntry.text, localEntry.text, candidate.similarity)
    items.push({
      id: `triage-${hashId(`${comparison.id}|${memEntry.goalIri}|${localEntry.normalizedText}`)}`,
      side: 'paired',
      similarity: Number(candidate.similarity.toFixed(3)),
      memText: memEntry.text,
      memRef: memEntry.goalIri,
      localText: localEntry.text,
      localRef: localEntry.sourceRefs[0] ?? localEntry.sourceGoalIds[0],
      ...classification,
    })
  }

  for (const [memIndex, memEntry] of memUnmatched.entries()) {
    if (usedMem.has(memIndex)) continue
    const containingPassage = findContainingPassage(memEntry.text, localPassages)
    if (containingPassage) {
      items.push({
        id: `triage-${hashId(`${comparison.id}|${memEntry.goalIri}|mem-only`)}`,
        side: 'mem_only',
        similarity: 1,
        memText: memEntry.text,
        memRef: memEntry.goalIri,
        localText: `${containingPassage.title}: ${excerptAroundNeedle(containingPassage.text, memEntry.text)}`,
        localRef: containingPassage.sourceRef ?? containingPassage.id ?? undefined,
        category: 'local_passage_only',
        confidence: 'high',
        rationale: 'MEM text appears in a local source passage, but not as a standalone local source goal.',
      })
      continue
    }
    const relatedLocal = findBestRelatedEntry(memEntry.text, localEntries, (entry) => entry.text)
    const similarity = relatedLocal?.similarity ?? 0
    const classification = classifyTriageItem(memEntry.text, relatedLocal?.entry.text ?? null, similarity)
    items.push({
      id: `triage-${hashId(`${comparison.id}|${memEntry.goalIri}|mem-only`)}`,
      side: 'mem_only',
      similarity: Number(similarity.toFixed(3)),
      memText: memEntry.text,
      memRef: memEntry.goalIri,
      localText: relatedLocal?.entry.text,
      localRef: relatedLocal?.entry.sourceRefs[0] ?? relatedLocal?.entry.sourceGoalIds[0],
      ...classification,
    })
  }

  for (const [localIndex, localEntry] of localUnmatched.entries()) {
    if (usedLocal.has(localIndex)) continue
    const relatedMem = findBestRelatedEntry(localEntry.text, memExpectations, (entry) => entry.text)
    const similarity = relatedMem?.similarity ?? 0
    const classification = classifyTriageItem(relatedMem?.entry.text ?? null, localEntry.text, similarity)
    items.push({
      id: `triage-${hashId(`${comparison.id}|${localEntry.normalizedText}|local-only`)}`,
      side: 'local_only',
      similarity: Number(similarity.toFixed(3)),
      memText: relatedMem?.entry.text,
      memRef: relatedMem?.entry.goalIri,
      localText: localEntry.text,
      localRef: localEntry.sourceRefs[0] ?? localEntry.sourceGoalIds[0],
      ...classification,
    })
  }

  const categoryCounts = emptyTriageCounts()
  for (const item of items) {
    categoryCounts[item.category] += 1
  }

  const categoryOrder: Record<TriageCategory, number> = {
    local_extraction_artifact: 0,
    local_passage_only: 1,
    source_scope_mismatch: 2,
    notation_formula_representation: 3,
    granularity_mismatch: 4,
    possible_real_gap: 5,
  }
  const sideOrder: Record<TriageItem['side'], number> = {
    paired: 0,
    mem_only: 1,
    local_only: 2,
  }

  items.sort((a, b) =>
    categoryOrder[a.category] - categoryOrder[b.category] ||
    sideOrder[a.side] - sideOrder[b.side] ||
    b.similarity - a.similarity ||
    a.id.localeCompare(b.id))

  return {
    comparisonId: comparison.id,
    label: comparison.label,
    jurisdiction: comparison.jurisdiction,
    unmatchedMemExpectationTexts: memUnmatched.length,
    unmatchedLocalExpectationTexts: localUnmatched.length,
    itemCount: items.length,
    categoryCounts,
    items,
  }
}

async function runConcreteComparison(
  endpoint: string,
  config: AuditConfig,
  comparison: ConcreteTextComparisonConfig,
  localByJurisdiction: Map<string, LocalSourceExtractionSummary[]>,
): Promise<{ result: ConcreteComparison; issues: AuditIssue[]; triage: ConcreteComparisonTriage | null }> {
  const local = localByJurisdiction.get(comparison.jurisdiction) ?? []
  if (local.length === 0) {
    return {
      result: {
        id: comparison.id,
        label: comparison.label,
        jurisdiction: comparison.jurisdiction,
        localUniqueExpectationTexts: 0,
        memExpectationTexts: 0,
        matchedMemExpectationTexts: 0,
        unmatchedMemExpectationTexts: 0,
        unmatchedLocalExpectationTexts: 0,
        status: 'not_configured',
      },
      issues: [],
      triage: null,
    }
  }

  const localIndex = localTextIndex(local)
  const localPassages = localPassageIndex(local)
  const bindings = await querySparql(endpoint, buildConcreteComparisonQuery(comparison))
  const memExpectations = expectationsFromBindings(bindings)
  const localComparisonIndex = comparisonTextIndex(localIndex)
  const memComparisonKeys = new Set(memExpectations.flatMap((entry) => comparisonKeys(entry.text)))
  const matchedMemExpectationTexts = memExpectations.filter((entry) =>
    comparisonKeys(entry.text).some((key) => localComparisonIndex.has(key)))
  const unmatchedMemExpectationTexts = memExpectations.filter((entry) =>
    comparisonKeys(entry.text).every((key) => !localComparisonIndex.has(key)))
  const unmatchedLocalExpectationTexts = Array.from(localIndex.values())
    .filter((entry) => comparisonKeys(entry.text).every((key) => !memComparisonKeys.has(key)))
    .sort((a, b) => a.text.localeCompare(b.text))

  return {
    result: {
      id: comparison.id,
      label: comparison.label,
      jurisdiction: comparison.jurisdiction,
      localUniqueExpectationTexts: localIndex.size,
      memExpectationTexts: memExpectations.length,
      matchedMemExpectationTexts: matchedMemExpectationTexts.length,
      unmatchedMemExpectationTexts: unmatchedMemExpectationTexts.length,
      unmatchedLocalExpectationTexts: unmatchedLocalExpectationTexts.length,
      status: unmatchedMemExpectationTexts.length === 0 && unmatchedLocalExpectationTexts.length === 0
        ? 'aligned'
        : 'discrepancies',
    },
    issues: buildConcreteComparisonIssues(
      comparison,
      unmatchedMemExpectationTexts,
      unmatchedLocalExpectationTexts,
      config.maxIssuesPerCategory ?? 50,
    ),
    triage: unmatchedMemExpectationTexts.length > 0 || unmatchedLocalExpectationTexts.length > 0
      ? buildComparisonTriage(
        comparison,
        unmatchedMemExpectationTexts,
        unmatchedLocalExpectationTexts,
        memExpectations,
        Array.from(localIndex.values()),
        localPassages,
      )
      : null,
  }
}

function markConcreteAvailability(rows: StateAuditRow[], comparisons: ConcreteComparison[]): StateAuditRow[] {
  const comparisonByJurisdiction = new Map(comparisons.map((entry) => [entry.jurisdiction, entry]))
  return rows.map((row) => {
    const comparison = comparisonByJurisdiction.get(row.jurisdiction)
    if (!comparison) return row
    if (comparison.status === 'aligned') return { ...row, status: 'aligned' }
    if (comparison.status === 'discrepancies') return { ...row, status: 'mem_curriculum_available' }
    return row
  })
}

const triageCategoryLabel = (category: TriageCategory): string => {
  switch (category) {
    case 'granularity_mismatch':
      return 'granularity mismatch'
    case 'local_extraction_artifact':
      return 'local extraction artifact'
    case 'local_passage_only':
      return 'local passage only'
    case 'source_scope_mismatch':
      return 'source scope mismatch'
    case 'notation_formula_representation':
      return 'notation/formula representation'
    case 'possible_real_gap':
      return 'possible real gap'
  }
}

const markdownSnippet = (value: string | undefined, maxLength = 220): string => {
  if (!value) return '-'
  const singleLine = value.replace(/\s+/gu, ' ').trim()
  return singleLine.length <= maxLength ? singleLine : `${singleLine.slice(0, maxLength - 1)}…`
}

const triageCategoryReviewAction = (category: TriageCategory): string => {
  switch (category) {
    case 'granularity_mismatch':
      return 'Check whether MEM and local extraction split or combine the same source content differently.'
    case 'local_extraction_artifact':
      return 'Fix the local source extraction if this is still active source text noise.'
    case 'local_passage_only':
      return 'Decide whether the local extraction should emit a standalone source goal or keep this as passage-only context.'
    case 'source_scope_mismatch':
      return 'Decide whether broad stage-level source prose should be excluded from direct MEM text matching or mapped at scope level.'
    case 'notation_formula_representation':
      return 'Check equivalence and either improve notation normalization or clean the local source extraction.'
    case 'possible_real_gap':
      return 'Compare against the official source and MEM; create a follow-up if this is a source-version or MEM coverage gap.'
  }
}

const orderedTriageCategories: TriageCategory[] = [
  'possible_real_gap',
  'local_passage_only',
  'source_scope_mismatch',
  'notation_formula_representation',
  'granularity_mismatch',
  'local_extraction_artifact',
]

function withReviewNotes(triage: ConcreteComparisonTriage[], reviewNotes: Record<string, string> | undefined): ConcreteComparisonTriage[] {
  if (!reviewNotes) return triage
  return triage.map((comparisonTriage) => ({
    ...comparisonTriage,
    items: comparisonTriage.items.map((item) => {
      const reviewNote = reviewNotes[item.id]?.trim()
      return reviewNote ? { ...item, reviewNote } : item
    }),
  }))
}

type TriageItemWithComparison = TriageItem & {
  comparisonId: string
  comparisonLabel: string
  jurisdiction: string
}

function triageItemsForCategory(audit: MemSparqlConsistencyAudit, category: TriageCategory): TriageItemWithComparison[] {
  return audit.triage.flatMap((triage) =>
    triage.items
      .filter((item) => item.category === category)
      .map((item) => ({
        ...item,
        comparisonId: triage.comparisonId,
        comparisonLabel: triage.label,
        jurisdiction: triage.jurisdiction,
      })))
}

function allTriageItems(audit: MemSparqlConsistencyAudit): TriageItemWithComparison[] {
  return orderedTriageCategories.flatMap((category) => triageItemsForCategory(audit, category))
}

function reviewQueueItemFingerprint(item: Omit<ReviewQueueItem, 'itemFingerprint'>): string {
  const payload = stableJson({
    kind: item.kind,
    category: item.category,
    jurisdiction: item.jurisdiction,
    comparisonId: item.comparisonId,
    side: item.side,
    title: item.title,
    details: item.details,
    rationale: item.rationale,
    memText: item.memText,
    memRef: item.memRef,
    localText: item.localText,
    localRef: item.localRef,
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function withReviewQueueFingerprint(item: Omit<ReviewQueueItem, 'itemFingerprint'>): ReviewQueueItem {
  return {
    ...item,
    itemFingerprint: reviewQueueItemFingerprint(item),
  }
}

function parseReviewDecisionRecord(
  value: unknown,
  lineNumber: number,
  auditId: string,
): { record: ReviewDecisionRecord | null; diagnostics: string[] } {
  const diagnostics: string[] = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { record: null, diagnostics: [`Line ${lineNumber}: record must be a JSON object.`] }
  }
  const raw = value as Record<string, unknown>
  const schemaVersion = raw.schemaVersion
  const recordAuditId = literal(raw.auditId)
  const itemId = literal(raw.itemId)
  const itemFingerprint = literal(raw.itemFingerprint)
  const status = literal(raw.status)
  const reviewedAt = literal(raw.reviewedAt)
  const reviewer = literal(raw.reviewer)
  const reason = literal(raw.reason)
  const followUpRef = literal(raw.followUpRef)

  if (schemaVersion !== 1) diagnostics.push(`Line ${lineNumber}: schemaVersion must be 1.`)
  if (recordAuditId !== auditId) diagnostics.push(`Line ${lineNumber}: auditId must be ${auditId}.`)
  if (!itemId) diagnostics.push(`Line ${lineNumber}: itemId is required.`)
  if (!itemFingerprint || !/^sha256:[a-f0-9]{64}$/u.test(itemFingerprint)) {
    diagnostics.push(`Line ${lineNumber}: itemFingerprint must be a sha256 fingerprint.`)
  }
  if (!status || !reviewDecisionStatuses.includes(status as ReviewDecisionStatus)) {
    diagnostics.push(`Line ${lineNumber}: status must be one of ${reviewDecisionStatuses.join(', ')}.`)
  }
  if (!reviewedAt) diagnostics.push(`Line ${lineNumber}: reviewedAt is required.`)
  if (!reviewer) diagnostics.push(`Line ${lineNumber}: reviewer is required.`)
  if (!reason) diagnostics.push(`Line ${lineNumber}: reason is required.`)

  if (diagnostics.length > 0 || !recordAuditId || !itemId || !itemFingerprint || !status || !reviewedAt || !reviewer || !reason) {
    return { record: null, diagnostics }
  }

  return {
    record: {
      schemaVersion: 1,
      auditId: recordAuditId,
      itemId,
      itemFingerprint,
      status: status as ReviewDecisionStatus,
      reviewedAt,
      reviewer,
      reason,
      ...(followUpRef ? { followUpRef } : {}),
    },
    diagnostics,
  }
}

function readReviewLedger(config: AuditConfig): { records: ReviewDecisionRecord[]; diagnostics: string[] } {
  if (!config.reviewLedgerPath) return { records: [], diagnostics: [] }
  const ledgerPath = resolveRepoPath(config.reviewLedgerPath)
  if (!existsSync(ledgerPath)) {
    return {
      records: [],
      diagnostics: [`Review ledger is configured but missing: ${config.reviewLedgerPath}`],
    }
  }

  const records: ReviewDecisionRecord[] = []
  const diagnostics: string[] = []
  readFileSync(ledgerPath, 'utf8')
    .split(/\r?\n/u)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .forEach(({ line, lineNumber }) => {
      try {
        const parsed = parseReviewDecisionRecord(JSON.parse(line), lineNumber, config.auditId)
        diagnostics.push(...parsed.diagnostics)
        if (parsed.record) records.push(parsed.record)
      } catch (error) {
        diagnostics.push(`Line ${lineNumber}: invalid JSON (${error instanceof Error ? error.message : String(error)}).`)
      }
    })
  return { records, diagnostics }
}

function annotateReviewQueueWithLedger(
  items: ReviewQueueItem[],
  records: ReviewDecisionRecord[],
): { items: ReviewQueueItem[]; summary: Omit<ReviewLedgerSummary, 'configured' | 'path' | 'diagnostics'>; diagnostics: string[] } {
  const itemById = new Map(items.map((item) => [item.id, item]))
  const latestRecordByItemId = new Map<string, ReviewDecisionRecord>()
  const diagnostics: string[] = []
  let duplicateItemRecords = 0
  let staleRecords = 0
  let unknownItemRecords = 0
  let currentRecords = 0

  for (const record of records) {
    if (latestRecordByItemId.has(record.itemId)) {
      duplicateItemRecords += 1
      diagnostics.push(`${record.itemId}: duplicate ledger record; the last record in the ledger is used for queue annotation.`)
    }
    latestRecordByItemId.set(record.itemId, record)
  }

  for (const record of latestRecordByItemId.values()) {
    const item = itemById.get(record.itemId)
    if (!item) {
      unknownItemRecords += 1
      diagnostics.push(`${record.itemId}: ledger record does not match any current review queue item.`)
    } else if (item.itemFingerprint !== record.itemFingerprint) {
      staleRecords += 1
      diagnostics.push(`${record.itemId}: ledger fingerprint is stale for the current review queue item.`)
    } else {
      currentRecords += 1
    }
  }

  const annotatedItems = items.map((item) => {
    const record = latestRecordByItemId.get(item.id)
    if (!record) return item
    const base = {
      ...item,
      ledgerStatus: record.status,
      ledgerReviewedAt: record.reviewedAt,
      ledgerReviewer: record.reviewer,
      ledgerReason: record.reason,
      ...(record.followUpRef ? { ledgerFollowUpRef: record.followUpRef } : {}),
    }
    if (record.itemFingerprint !== item.itemFingerprint) {
      return { ...base, status: 'stale_review' as const }
    }
    if (record.status === 'deferred') {
      return { ...base, status: 'deferred' as const }
    }
    return { ...base, status: 'decided' as const }
  })

  return {
    items: annotatedItems,
    summary: {
      records: records.length,
      currentRecords,
      staleRecords,
      unknownItemRecords,
      duplicateItemRecords,
    },
    diagnostics,
  }
}

function reviewQueueItemFromTriage(item: TriageItemWithComparison): ReviewQueueItem {
  return withReviewQueueFingerprint({
    id: item.id,
    status: 'open',
    kind: 'text_triage',
    category: item.category,
    jurisdiction: item.jurisdiction,
    comparisonId: item.comparisonId,
    comparisonLabel: item.comparisonLabel,
    side: item.side,
    confidence: item.confidence,
    similarity: item.similarity,
    rationale: item.rationale,
    memText: item.memText,
    memRef: item.memRef,
    localText: item.localText,
    localRef: item.localRef,
    reviewNote: item.reviewNote,
    reviewAction: triageCategoryReviewAction(item.category),
  })
}

function reviewQueueItemFromAuditIssue(issue: AuditIssue): ReviewQueueItem {
  const kind = issue.category === 'MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE'
    ? 'availability_watch'
    : 'endpoint_or_vocabulary_watch'
  return withReviewQueueFingerprint({
    id: issue.id,
    status: 'open',
    kind,
    category: issue.category,
    jurisdiction: issue.jurisdiction,
    severity: issue.severity,
    title: issue.title,
    details: issue.details,
    memRef: issue.memRef,
    localRef: issue.localRef,
    reviewAction: kind === 'availability_watch'
      ? 'Watch MEM availability for this scope and add a concrete comparison when a stable curriculum plan appears.'
      : 'Check endpoint and vocabulary assumptions before interpreting downstream comparison results.',
  })
}

function buildReviewIssueQueue(config: AuditConfig, audit: MemSparqlConsistencyAudit): ReviewIssueQueue {
  const baseTextTriageQueue = allTriageItems(audit).map(reviewQueueItemFromTriage)
  const baseMemAvailabilityWatch = audit.issues
    .filter((issue) => issue.category === 'MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE')
    .map(reviewQueueItemFromAuditIssue)
  const baseEndpointAndVocabularyWatch = audit.issues
    .filter((issue) => issue.category === 'MEM_ENDPOINT_UNREACHABLE' || issue.category === 'MEM_SCOPE_VOCAB_MISSING')
    .map(reviewQueueItemFromAuditIssue)
  const ledger = readReviewLedger(config)
  const allBaseItems = [
    ...baseTextTriageQueue,
    ...baseMemAvailabilityWatch,
    ...baseEndpointAndVocabularyWatch,
  ]
  const ledgerResult = annotateReviewQueueWithLedger(allBaseItems, ledger.records)
  const itemById = new Map(ledgerResult.items.map((item) => [item.id, item]))
  const textTriageQueue = baseTextTriageQueue.map((item) => itemById.get(item.id) ?? item)
  const memAvailabilityWatch = baseMemAvailabilityWatch.map((item) => itemById.get(item.id) ?? item)
  const endpointAndVocabularyWatch = baseEndpointAndVocabularyWatch.map((item) => itemById.get(item.id) ?? item)
  const highestSignalChecks = triageItemsForCategory(audit, 'possible_real_gap')
    .map(reviewQueueItemFromTriage)
    .map((item) => itemById.get(item.id) ?? item)
  const allItems = [
    ...textTriageQueue,
    ...memAvailabilityWatch,
    ...endpointAndVocabularyWatch,
  ]
  const openItems = allItems.filter((item) => item.status !== 'decided').length
  const decidedItems = allItems.filter((item) => item.status === 'decided').length
  const deferredItems = allItems.filter((item) => item.status === 'deferred').length
  const staleReviewItems = allItems.filter((item) => item.status === 'stale_review').length

  return {
    schemaVersion: 1,
    generatedAt: audit.generatedAt,
    generatedBy: audit.generatedBy,
    sourceAuditJsonPath: config.reportJsonPath,
    sourceAuditMarkdownPath: config.reportMarkdownPath,
    reviewLedgerPath: config.reviewLedgerPath,
    endpoint: audit.endpoint,
    subjectLabel: audit.subjectLabel,
    schoolTypeLabel: audit.schoolTypeLabel,
    mode: audit.mode,
    summary: {
      openItems,
      decidedItems,
      deferredItems,
      staleReviewItems,
      highestSignalChecks: highestSignalChecks.length,
      textTriageItems: textTriageQueue.length,
      memAvailabilityWatchItems: memAvailabilityWatch.length,
      endpointOrVocabularyWatchItems: endpointAndVocabularyWatch.length,
    },
    reviewLedger: {
      configured: Boolean(config.reviewLedgerPath),
      ...(config.reviewLedgerPath ? { path: config.reviewLedgerPath } : {}),
      ...ledgerResult.summary,
      diagnostics: [...ledger.diagnostics, ...ledgerResult.diagnostics],
    },
    highestSignalChecks,
    textTriageQueue,
    memAvailabilityWatch,
    endpointAndVocabularyWatch,
  }
}

function pushTriageReviewItem(lines: string[], item: TriageItemWithComparison): void {
  lines.push(`- [ ] \`${item.id}\` ${item.comparisonLabel} (${item.jurisdiction}), \`${item.side}\`, confidence \`${item.confidence}\`, similarity ${item.similarity.toFixed(3)}`)
  if (item.memText) lines.push(`  - MEM: ${markdownSnippet(item.memText, 360)}`)
  if (item.memRef) lines.push(`  - MEM ref: ${item.memRef}`)
  if (item.localText) lines.push(`  - Local: ${markdownSnippet(item.localText, 360)}`)
  if (item.localRef) lines.push(`  - Local ref: \`${item.localRef}\``)
  if (item.reviewNote) lines.push(`  - Review note: ${markdownSnippet(item.reviewNote, 520)}`)
  lines.push(`  - Review action: ${triageCategoryReviewAction(item.category)}`)
}

function pushGeneratedMarkdownNotice(
  lines: string[],
  audit: MemSparqlConsistencyAudit,
  sourceOfTruth: string[],
): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push(`> Generated by: \`${audit.generatedBy}\``)
  lines.push('> Regenerate with: `cd app && npm run quality:mem-sparql-consistency`')
  for (const source of sourceOfTruth) {
    lines.push(`> Source of truth: \`${source}\``)
  }
  lines.push('')
}

function renderReviewIssuesMarkdown(audit: MemSparqlConsistencyAudit, reviewIssueQueue: ReviewIssueQueue | null): string {
  const lines: string[] = []
  const triageItemCount = audit.triage.reduce((sum, triage) => sum + triage.itemCount, 0)
  const availabilityIssues = audit.issues.filter((issue) => issue.category === 'MEM_CURRICULUM_MISSING_FOR_LOCAL_SOURCE')
  const endpointIssues = audit.issues.filter((issue) => issue.category === 'MEM_ENDPOINT_UNREACHABLE' || issue.category === 'MEM_SCOPE_VOCAB_MISSING')

  lines.push('# MEM SPARQL Consistency Review Issues')
  lines.push('')
  pushGeneratedMarkdownNotice(lines, audit, [
    audit.configPath,
    ...(reviewIssueQueue?.reviewLedger.path ? [reviewIssueQueue.reviewLedger.path] : []),
  ])
  lines.push(`Generated: ${audit.generatedAt}`)
  lines.push(`Endpoint: ${audit.endpoint}`)
  lines.push(`Source audit: \`docs/qa-ci/status/mem-sparql-consistency-audit.md\``)
  lines.push('')
  lines.push('This generated file is a human work queue derived from the MEM consistency audit. It is not a decision ledger and should not be edited as source of truth.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Scope: ${audit.subjectLabel} / ${audit.schoolTypeLabel}`)
  lines.push(`- Concrete comparisons: ${audit.summary.concreteComparisons}`)
  lines.push(`- Raw review issues: ${audit.summary.issueCount}`)
  lines.push(`- Text triage items: ${triageItemCount}`)
  lines.push(`- MEM availability watch items: ${availabilityIssues.length}`)
  lines.push(`- Endpoint or vocabulary watch items: ${endpointIssues.length}`)
  if (reviewIssueQueue) {
    lines.push(`- Open items after ledger: ${reviewIssueQueue.summary.openItems}`)
    lines.push(`- Decided items in ledger: ${reviewIssueQueue.summary.decidedItems}`)
    lines.push(`- Stale ledger reviews: ${reviewIssueQueue.summary.staleReviewItems}`)
  }
  if (reviewIssueQueue?.reviewLedger.configured) {
    lines.push(`- Review ledger: \`${reviewIssueQueue.reviewLedger.path}\``)
    lines.push(`- Ledger records: ${reviewIssueQueue.reviewLedger.records} total, ${reviewIssueQueue.reviewLedger.currentRecords} current, ${reviewIssueQueue.reviewLedger.staleRecords} stale, ${reviewIssueQueue.reviewLedger.unknownItemRecords} unknown, ${reviewIssueQueue.reviewLedger.duplicateItemRecords} duplicate`)
    if (reviewIssueQueue.reviewLedger.diagnostics.length > 0) {
      lines.push(`- Ledger diagnostics: ${reviewIssueQueue.reviewLedger.diagnostics.length}`)
    }
  }
  lines.push('')
  lines.push('## Highest Signal Checks')
  lines.push('')
  const possibleRealGaps = triageItemsForCategory(audit, 'possible_real_gap')
  if (possibleRealGaps.length === 0) {
    lines.push('No `possible_real_gap` items.')
  } else {
    for (const item of possibleRealGaps) {
      pushTriageReviewItem(lines, item)
    }
  }
  lines.push('')
  lines.push('## Text Triage Queue')
  lines.push('')
  for (const category of orderedTriageCategories) {
    const items = triageItemsForCategory(audit, category)
    lines.push(`### ${triageCategoryLabel(category)} (${items.length})`)
    lines.push('')
    lines.push(triageCategoryReviewAction(category))
    lines.push('')
    if (items.length === 0) {
      lines.push('No items.')
    } else {
      for (const item of items) {
        pushTriageReviewItem(lines, item)
      }
    }
    lines.push('')
  }
  lines.push('## MEM Availability Watch')
  lines.push('')
  if (availabilityIssues.length === 0) {
    lines.push('No MEM availability watch issues.')
  } else {
    for (const issue of availabilityIssues) {
      lines.push(`- [ ] \`${issue.id}\` ${issue.jurisdiction ?? '-'}: ${issue.title}`)
      lines.push(`  - Details: ${markdownSnippet(issue.details, 360)}`)
    }
  }
  if (endpointIssues.length > 0) {
    lines.push('')
    lines.push('## Endpoint And Vocabulary Watch')
    lines.push('')
    for (const issue of endpointIssues) {
      lines.push(`- [ ] \`${issue.id}\` ${issue.jurisdiction ?? '-'}: ${issue.title}`)
      lines.push(`  - Details: ${markdownSnippet(issue.details, 360)}`)
    }
  }

  return `${lines.join('\n')}\n`
}

function renderMarkdown(audit: MemSparqlConsistencyAudit): string {
  const lines: string[] = []
  lines.push('# MEM SPARQL Consistency Audit')
  lines.push('')
  pushGeneratedMarkdownNotice(lines, audit, [audit.configPath])
  lines.push(`Generated: ${audit.generatedAt}`)
  lines.push(`Endpoint: ${audit.endpoint}`)
  lines.push(`Config: \`${audit.configPath}\``)
  lines.push('')
  lines.push('This is a non-blocking review lane. It checks whether live MEM/SPARQL curriculum data are consistent with SkillPilot source-extraction evidence and writes review issues for later human triage. Missing or divergent MEM data do not fail CI by themselves.')
  lines.push('')
  lines.push(`Scope: ${audit.subjectLabel} / ${audit.schoolTypeLabel}`)
  lines.push(`Local source extractions: ${audit.summary.localSourceExtractions}, local source goals: ${audit.summary.localSourceGoals}.`)
  lines.push(`MEM curriculum availability: ${audit.summary.memCurriculumAvailableJurisdictions}/${audit.summary.jurisdictions} jurisdictions with matching curriculum plans.`)
  lines.push(`Review issues: ${audit.summary.issueCount}.`)
  lines.push('')
  lines.push('## Jurisdiction Availability')
  lines.push('')
  lines.push('| Jurisdiction | Local source files | Local source goals | Stages | MEM plans | MEM scope | Status |')
  lines.push('| --- | ---: | ---: | --- | ---: | --- | --- |')
  for (const row of audit.stateRows) {
    const memScope = row.memStateIri
      ? row.memSubjectIri && row.memSchoolTypeIri
        ? 'state+subject+school'
        : 'state'
      : 'missing'
    lines.push(`| ${row.jurisdiction} ${row.label} | ${row.localSourceExtractions} | ${row.localSourceGoals} | ${row.localStages.join(', ') || '-'} | ${row.memPlanCount} | ${memScope} | ${row.status} |`)
  }
  lines.push('')
  lines.push('## Concrete Text Comparisons')
  lines.push('')
  if (audit.concreteComparisons.length === 0) {
    lines.push('No concrete text comparison configured.')
  } else {
    lines.push('| Comparison | Local unique expectation texts | MEM expectation entries | Matched MEM entries | MEM-only | Local-only | Status |')
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | --- |')
    for (const comparison of audit.concreteComparisons) {
      lines.push(`| ${comparison.label} | ${comparison.localUniqueExpectationTexts} | ${comparison.memExpectationTexts} | ${comparison.matchedMemExpectationTexts} | ${comparison.unmatchedMemExpectationTexts} | ${comparison.unmatchedLocalExpectationTexts} | ${comparison.status} |`)
    }
  }
  lines.push('')
  lines.push('## Triage Summary')
  lines.push('')
  if (audit.triage.length === 0) {
    lines.push('No text-difference triage items.')
  } else {
    lines.push('| Comparison | Items | Local extraction artifact | Local passage only | Source scope mismatch | Notation/formula | Granularity mismatch | Possible real gap |')
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
    for (const triage of audit.triage) {
      lines.push(`| ${triage.label} | ${triage.itemCount} | ${triage.categoryCounts.local_extraction_artifact} | ${triage.categoryCounts.local_passage_only} | ${triage.categoryCounts.source_scope_mismatch} | ${triage.categoryCounts.notation_formula_representation} | ${triage.categoryCounts.granularity_mismatch} | ${triage.categoryCounts.possible_real_gap} |`)
    }
    lines.push('')
    lines.push('### Triage Samples')
    lines.push('')
    for (const triage of audit.triage) {
      lines.push(`#### ${triage.label}`)
      lines.push('')
      lines.push('| Category | Side | Similarity | MEM | Local | Rationale |')
      lines.push('| --- | --- | ---: | --- | --- | --- |')
      for (const item of triage.items.slice(0, 20)) {
        lines.push(`| ${triageCategoryLabel(item.category)} | ${item.side} | ${item.similarity.toFixed(3)} | ${markdownSnippet(item.memText)} | ${markdownSnippet(item.localText)} | ${item.rationale} |`)
      }
      if (triage.items.length > 20) {
        lines.push('')
        lines.push(`Showing 20 of ${triage.items.length} triage items. The full triage list is available in the JSON report.`)
      }
      lines.push('')
    }
  }
  lines.push('')
  lines.push('## Review Issues')
  lines.push('')
  if (audit.issues.length === 0) {
    lines.push('No review issues.')
  } else {
    for (const issue of audit.issues) {
      lines.push(`### ${issue.id}`)
      lines.push('')
      lines.push(`- Category: \`${issue.category}\``)
      lines.push(`- Severity: \`${issue.severity}\``)
      if (issue.jurisdiction) lines.push(`- Jurisdiction: \`${issue.jurisdiction}\``)
      if (issue.memRef) lines.push(`- MEM: ${issue.memRef}`)
      if (issue.localRef) lines.push(`- Local: \`${issue.localRef}\``)
      lines.push(`- Title: ${issue.title}`)
      lines.push('')
      lines.push(issue.details)
      lines.push('')
    }
  }

  return `${lines.join('\n')}\n`
}

function writeAudit(config: AuditConfig, audit: MemSparqlConsistencyAudit): void {
  const jsonPath = resolveRepoPath(config.reportJsonPath)
  const markdownPath = resolveRepoPath(config.reportMarkdownPath)
  const reviewIssueQueue = config.reviewIssuesMarkdownPath || config.reviewIssuesJsonPath
    ? buildReviewIssueQueue(config, audit)
    : null
  mkdirSync(dirname(jsonPath), { recursive: true })
  mkdirSync(dirname(markdownPath), { recursive: true })
  writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`)
  writeFileSync(markdownPath, renderMarkdown(audit))
  console.log(`Wrote ${config.reportJsonPath}`)
  console.log(`Wrote ${config.reportMarkdownPath}`)
  if (config.reviewIssuesMarkdownPath) {
    const reviewIssuesMarkdownPath = resolveRepoPath(config.reviewIssuesMarkdownPath)
    mkdirSync(dirname(reviewIssuesMarkdownPath), { recursive: true })
    writeFileSync(reviewIssuesMarkdownPath, renderReviewIssuesMarkdown(audit, reviewIssueQueue))
    console.log(`Wrote ${config.reviewIssuesMarkdownPath}`)
  }
  if (config.reviewIssuesJsonPath) {
    const reviewIssuesJsonPath = resolveRepoPath(config.reviewIssuesJsonPath)
    mkdirSync(dirname(reviewIssuesJsonPath), { recursive: true })
    writeFileSync(reviewIssuesJsonPath, `${JSON.stringify(reviewIssueQueue, null, 2)}\n`)
    console.log(`Wrote ${config.reviewIssuesJsonPath}`)
  }
}

async function buildAudit(configPath: string, endpointOverride: string | null): Promise<{ config: AuditConfig; audit: MemSparqlConsistencyAudit }> {
  const config = readConfig(configPath)
  const endpoint = endpointOverride ?? config.endpoint
  const sourceExtractions = readLocalMathSourceExtractions(config)
  const localByJurisdiction = groupedLocalSummaries(sourceExtractions)
  const issues: AuditIssue[] = []
  let endpointFailed = false
  let memByJurisdiction = new Map<string, StateMemAvailability>()
  let concreteComparisons: ConcreteComparison[] = []
  let triage: ConcreteComparisonTriage[] = []

  try {
    const stateBindings = await querySparql(endpoint, buildStateVocabularyQuery(config))
    const planBindings = await querySparql(endpoint, buildPlanCountQuery(config))
    memByJurisdiction = stateAvailabilityFromBindings(config, stateBindings, planBindings)

    for (const comparison of config.concreteTextComparisons ?? []) {
      try {
        const concreteResult = await runConcreteComparison(endpoint, config, comparison, localByJurisdiction)
        concreteComparisons = [...concreteComparisons, concreteResult.result]
        if (concreteResult.triage) triage = [...triage, concreteResult.triage]
        issues.push(...concreteResult.issues)
      } catch (error) {
        concreteComparisons = [...concreteComparisons, {
          id: comparison.id,
          label: comparison.label,
          jurisdiction: comparison.jurisdiction,
          localUniqueExpectationTexts: 0,
          memExpectationTexts: 0,
          matchedMemExpectationTexts: 0,
          unmatchedMemExpectationTexts: 0,
          unmatchedLocalExpectationTexts: 0,
          status: 'endpoint_error',
        }]
        issues.push({
          id: issueId('MEM_ENDPOINT_UNREACHABLE', `${comparison.id}|${String(error)}`),
          category: 'MEM_ENDPOINT_UNREACHABLE',
          severity: 'watch',
          jurisdiction: comparison.jurisdiction,
          title: `MEM concrete comparison failed: ${comparison.label}`,
          details: error instanceof Error ? error.message : String(error),
        })
      }
    }
  } catch (error) {
    endpointFailed = true
    issues.push({
      id: issueId('MEM_ENDPOINT_UNREACHABLE', String(error)),
      category: 'MEM_ENDPOINT_UNREACHABLE',
      severity: 'watch',
      title: 'MEM SPARQL endpoint could not be queried',
      details: error instanceof Error ? error.message : String(error),
    })
  }

  const stateRows = markConcreteAvailability(
    buildStateRows(config, localByJurisdiction, memByJurisdiction, endpointFailed),
    concreteComparisons,
  )
  issues.push(...stateAvailabilityIssues(stateRows))
  triage = withReviewNotes(triage, config.reviewNotes)

  const audit: MemSparqlConsistencyAudit = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generatedBy: 'app/scripts/generateMemSparqlConsistencyAudit.ts',
    configPath,
    endpoint,
    subjectLabel: config.subjectLabel,
    schoolTypeLabel: config.schoolTypeLabel,
    mode: 'non_blocking_review',
    summary: {
      jurisdictions: Object.keys(config.states).length,
      localSourceExtractions: sourceExtractions.length,
      localSourceGoals: sourceExtractions.reduce((sum, entry) => sum + entry.sourceGoals, 0),
      memCurriculumAvailableJurisdictions: stateRows.filter((row) => row.memPlanCount > 0).length,
      memCurriculumMissingForLocalSourceJurisdictions: stateRows.filter((row) => row.status === 'mem_curriculum_missing').length,
      concreteComparisons: concreteComparisons.length,
      issueCount: issues.length,
    },
    sourceExtractions,
    stateRows,
    concreteComparisons,
    triage,
    issues: issues.sort((a, b) => a.id.localeCompare(b.id)),
  }

  return { config, audit }
}

const options = parseArgs()
if (options.help) {
  console.log(usage())
  process.exit(0)
}

buildAudit(options.configPath, options.endpoint)
  .then(({ config, audit }) => {
    writeAudit(config, audit)
    console.log(`MEM SPARQL consistency audit completed with ${audit.issues.length} review issue(s).`)
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
