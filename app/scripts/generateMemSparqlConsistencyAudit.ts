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
  issues: AuditIssue[]
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

const bindingValue = (binding: Record<string, SparqlBindingValue>, key: string): string | null =>
  binding[key]?.value ?? null

const literal = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null

const arrayLength = (value: unknown): number => Array.isArray(value) ? value.length : 0

const asSourceGoals = (value: unknown): SourceGoal[] =>
  Array.isArray(value) ? value.filter((entry): entry is SourceGoal => typeof entry === 'object' && entry !== null) : []

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

const decodeHtmlish = (value: string): string =>
  value
    .replace(/&nbsp;/giu, ' ')
    .replace(/&#160;/giu, ' ')
    .replace(/&ndash;/giu, '–')
    .replace(/&mdash;/giu, '—')
    .replace(/&deg;/giu, '°')
    .replace(/&shy;/giu, '')
    .replace(/&amp;/giu, '&')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;/giu, "'")
    .replace(/<[^>]+>/gu, ' ')
    .replace(/\[\/?lang(?:=[^\]]+)?\]/giu, ' ')
    .replace(/\/\//gu, '')
    .replace(/\\\\/gu, '')

function normalizeText(value: string): string {
  return decodeHtmlish(value)
    .normalize('NFKC')
    .replace(/[–—−]/gu, '-')
    .replace(/[„“”]/gu, '"')
    .replace(/[‚‘’]/gu, "'")
    .replace(/\s+/gu, ' ')
    .trim()
    .toLocaleLowerCase('de-DE')
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

async function runConcreteComparison(
  endpoint: string,
  config: AuditConfig,
  comparison: ConcreteTextComparisonConfig,
  localByJurisdiction: Map<string, LocalSourceExtractionSummary[]>,
): Promise<{ result: ConcreteComparison; issues: AuditIssue[] }> {
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
    }
  }

  const localIndex = localTextIndex(local)
  const bindings = await querySparql(endpoint, buildConcreteComparisonQuery(comparison))
  const memExpectations = expectationsFromBindings(bindings)
  const memByNormalizedText = new Map(memExpectations.map((entry) => [entry.normalizedText, entry]))
  const matchedMemExpectationTexts = memExpectations.filter((entry) => localIndex.has(entry.normalizedText))
  const unmatchedMemExpectationTexts = memExpectations.filter((entry) => !localIndex.has(entry.normalizedText))
  const unmatchedLocalExpectationTexts = Array.from(localIndex.values())
    .filter((entry) => !memByNormalizedText.has(entry.normalizedText))
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

function renderMarkdown(audit: MemSparqlConsistencyAudit): string {
  const lines: string[] = []
  lines.push('# MEM SPARQL Consistency Audit')
  lines.push('')
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
    lines.push('| Comparison | Local unique expectation texts | MEM expectation texts | Matched | MEM-only | Local-only | Status |')
    lines.push('| --- | ---: | ---: | ---: | ---: | ---: | --- |')
    for (const comparison of audit.concreteComparisons) {
      lines.push(`| ${comparison.label} | ${comparison.localUniqueExpectationTexts} | ${comparison.memExpectationTexts} | ${comparison.matchedMemExpectationTexts} | ${comparison.unmatchedMemExpectationTexts} | ${comparison.unmatchedLocalExpectationTexts} | ${comparison.status} |`)
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
  mkdirSync(dirname(jsonPath), { recursive: true })
  mkdirSync(dirname(markdownPath), { recursive: true })
  writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`)
  writeFileSync(markdownPath, renderMarkdown(audit))
  console.log(`Wrote ${config.reportJsonPath}`)
  console.log(`Wrote ${config.reportMarkdownPath}`)
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

  try {
    const stateBindings = await querySparql(endpoint, buildStateVocabularyQuery(config))
    const planBindings = await querySparql(endpoint, buildPlanCountQuery(config))
    memByJurisdiction = stateAvailabilityFromBindings(config, stateBindings, planBindings)

    for (const comparison of config.concreteTextComparisons ?? []) {
      try {
        const concreteResult = await runConcreteComparison(endpoint, config, comparison, localByJurisdiction)
        concreteComparisons = [...concreteComparisons, concreteResult.result]
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
