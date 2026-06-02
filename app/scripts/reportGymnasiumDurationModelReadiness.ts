import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type DurationModel = 'G8' | 'G9'

interface CurriculumStatusEntry {
  title?: string
  subject?: string
  maturity?: string
  landscapeId?: string
}

interface CurriculumStatusDocument {
  curricula?: CurriculumStatusEntry[]
}

interface SourceGoal {
  tags?: string[]
  sourceRef?: string
  title?: string
  description?: string
  rawText?: string
}

interface SourceExtraction {
  title?: string
  jurisdiction?: string
  subject?: string
  stage?: string
  durationModels?: string[]
  sourceDocument?: unknown
  sourceDocuments?: unknown[]
  method?: string
  sourceGoals?: SourceGoal[]
}

interface CompositionView {
  landscapeId?: string
  viewId?: string
  scope?: {
    schoolForm?: string
    jurisdiction?: string
    stage?: string
    courseProfile?: string
    durationModel?: string
  }
}

interface CompositionViewSummary {
  subject: string
  viewId: string
  scope: NonNullable<CompositionView['scope']>
}

interface DurationPolicyDecision {
  subject?: string
  jurisdiction?: string
  stage?: string
  sourceExtractionPath?: string
  status?: string
  decision?: string
  durationModels?: string[]
  learnerFacingProjection?: string
  compositionViewIds?: string[]
  evidenceSources?: string[]
  rationale?: string
}

interface DurationPolicyDocument {
  decisions?: DurationPolicyDecision[]
}

interface SourceReadinessRow {
  subject: string
  jurisdiction: string
  stage: string
  title: string
  path: string
  sourceGoals: number
  durationModels: Set<DurationModel>
  gradeSignals: Set<string>
  g8Hint: boolean
  g9Hint: boolean
  durationViews: Set<DurationModel>
  sekiRuntimeViews: Map<DurationModel, string>
  policyDecision?: DurationPolicyDecision
  status: string
}

interface SourceEvidenceRow {
  subject: string
  jurisdiction: string
  stage: string
  title: string
  path: string
  sourceGoals: number
  durationModels: Set<DurationModel>
  gradeSignals: Set<string>
  g8Hint: boolean
  g9Hint: boolean
  policyDecision?: DurationPolicyDecision
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const shouldWrite = process.argv.includes('--write')
const shouldCheck = process.argv.includes('--check')
const shouldRequireReviewedM6 = process.argv.includes('--require-reviewed-m6')
const requiredReviewedSubject = process.argv
  .find((argument) => argument.startsWith('--require-reviewed-subject='))
  ?.split('=')
  .at(1)

const inputRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/input')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')
const qualityStatusPath = resolve(repoRoot, 'docs/qa-ci/status/curriculum-quality-status.json')
const reportPath = resolve(repoRoot, 'docs/qa-ci/status/gymnasium-duration-model-readiness.md')
const durationPolicyPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')

const durationModels: DurationModel[] = ['G8', 'G9']
const stageCross = 'CROSSSTAGE'
const courseProfileKey = 'courseProfile'
const stageKey = 'stage'
const courseProfileAll = 'ALL'
const courseProfileCombined = 'GK+LK'
const courseProfileGk = 'GK'
const courseProfileLk = 'LK'
const unreviewedStatuses = new Set([
  'open:dual-source-needs-duration-views',
  'open:reviewed-dual-needs-duration-views',
  'open:single-duration-needs-policy',
  'open:document-hint-needs-normalization',
  'open:grade-structured-needs-duration-policy',
  'open:needs-duration-review',
])
const subjectAliases = new Map<string, string>([
  ['PGW', 'Politik und Wirtschaft'],
  ['POLITIKWIRTSCHAFT', 'Politik und Wirtschaft'],
  ['POLITIK_UND_WIRTSCHAFT', 'Politik und Wirtschaft'],
  ['POLITIK UND WIRTSCHAFT', 'Politik und Wirtschaft'],
  ['SOZIALKUNDE', 'Politik und Wirtschaft'],
  ['SOZIALKUNDE WIRTSCHAFT RECHT', 'Politik und Wirtschaft'],
  ['WIRTSCHAFT RECHT', 'Wirtschaftswissenschaften'],
  ['WIRTSCHAFT UND RECHT', 'Wirtschaftswissenschaften'],
  ['WIRTSCHAFTSLEHRE', 'Wirtschaftswissenschaften'],
  ['WIRTSCHAFT', 'Wirtschaftswissenschaften'],
  ['WBS', 'Wirtschaftswissenschaften'],
  ['WAT', 'Wirtschaftswissenschaften'],
])

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

const collectFiles = (directory: string, predicate: (path: string) => boolean, target: string[] = []): string[] => {
  let entries: ReturnType<typeof readdirSync>
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return target
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(absolutePath, predicate, target)
      continue
    }
    if (entry.isFile() && predicate(absolutePath)) {
      target.push(absolutePath)
    }
  }
  return target
}

const repoPath = (absolutePath: string) => absolutePath.replace(`${repoRoot}/`, '')

function pushGeneratedMarkdownNotice(lines: string[]): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/reportGymnasiumDurationModelReadiness.ts`')
  lines.push('> Regenerate with: `cd app && npm run report:gymnasium-duration-readiness -- --write`')
  lines.push('> Source of truth: `app/scripts/reportGymnasiumDurationModelReadiness.ts`')
  lines.push(`> Source of truth: \`${repoPath(qualityStatusPath)}\``)
  lines.push(`> Source of truth: \`${repoPath(durationPolicyPath)}\``)
  lines.push(`> Source of truth: \`${repoPath(inputRoot)}/\``)
  lines.push(`> Source of truth: \`${repoPath(compositionViewRoot)}/\``)
  lines.push('')
}

const normalizeSubjectToken = (value?: string) =>
  value
    ?.normalize('NFKC')
    .replace(/[_-]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()

const canonicalizeSubject = (value: string | undefined, m6Subjects: Set<string>) => {
  const normalized = normalizeSubjectToken(value)
  if (!normalized) return undefined
  const direct = Array.from(m6Subjects).find((subject) => subject.toLocaleLowerCase('de-DE') === normalized.toLocaleLowerCase('de-DE'))
  if (direct) return direct
  const alias = subjectAliases.get(normalized.toLocaleUpperCase('de-DE'))
  return alias && m6Subjects.has(alias) ? alias : undefined
}

const inferSubject = (source: SourceExtraction, path: string, m6Subjects: Set<string>) => {
  const fromField = canonicalizeSubject(source.subject, m6Subjects)
  if (fromField) return fromField

  const fromTags = (source.sourceGoals ?? [])
    .flatMap((goal) => goal.tags ?? [])
    .map((tag) => /^subject:(.+)$/u.exec(tag)?.[1])
    .map((value) => canonicalizeSubject(value, m6Subjects))
    .find((value): value is string => !!value)
  if (fromTags) return fromTags

  const haystack = `${path} ${source.title ?? ''}`.toLocaleLowerCase('de-DE')
  return Array.from(m6Subjects).find((subject) => haystack.includes(subject.toLocaleLowerCase('de-DE')))
}

const inferJurisdiction = (source: SourceExtraction, path: string) => {
  const fromField = source.jurisdiction?.trim().toUpperCase()
  if (fromField?.startsWith('DE-')) return fromField

  const sourceTag = (source.sourceGoals ?? [])
    .flatMap((goal) => goal.tags ?? [])
    .map((tag) => /^source:(DE-[A-Z]{2})$/u.exec(tag)?.[1])
    .find((value): value is string => !!value)
  if (sourceTag) return sourceTag

  const inputMatch = /curricula\/DE\/Gymnasium\/input\/([^/]+)/u.exec(repoPath(path))
  const inputToken = inputMatch?.[1]
  if (inputToken && /^[A-Z]{2}$/u.test(inputToken)) return `DE-${inputToken}`
  return 'DE-UNKNOWN'
}

const inferStage = (source: SourceExtraction, path: string) => {
  const stage = source.stage?.trim()
  if (stage) return stage
  if (path.includes('/lower-secondary/')) return 'SekI'
  if (path.includes('/upper-secondary/')) return 'SekII'
  return 'CrossStage'
}

const normalizeDurationModel = (value?: string): DurationModel | undefined => {
  const normalized = value?.trim().toUpperCase()
  return normalized === 'G8' || normalized === 'G9' ? normalized : undefined
}

const collectDurationModels = (source: SourceExtraction, text: string) => {
  const values = new Set<DurationModel>()
  ;(source.durationModels ?? []).forEach((value) => {
    const normalized = normalizeDurationModel(value)
    if (normalized) values.add(normalized)
  })
  ;(source.sourceGoals ?? []).flatMap((goal) => goal.tags ?? []).forEach((tag) => {
    const normalized = normalizeDurationModel(/^durationModel:(.+)$/u.exec(tag)?.[1])
    if (normalized) values.add(normalized)
  })
  if (/\bG8\b|achtj[aä]hr/iu.test(text)) values.add('G8')
  if (/\bG9\b|neunj[aä]hr/iu.test(text)) values.add('G9')
  return values
}

const normalizeGradeSignal = (value: string) =>
  value
    .replace(/–/gu, '-')
    .replace(/\bbis\b/giu, '-')
    .replace(/\bund\b/giu, ',')
    .replace(/\s+/gu, '')

const collectDocumentGradeSignals = (text: string) => {
  const grades = new Set<string>()
  const gradeNumberPattern = String.raw`(?:13|12|11|10|[1-9])`
  const gradePhrasePattern =
    new RegExp(
      String.raw`(?:Jahrgangsstufen?|Jahrgaenge|Jahrgänge|Schuljahrgaenge|Schuljahrgänge|Klassenstufen?|Klassen?|classes?|grades?)(?:\s*|-)?(?:stufen?\s*)?(${gradeNumberPattern}(?:\s*(?:\/|-|–|bis|und|,)\s*${gradeNumberPattern})*)`,
      'giu',
    )

  for (const match of text.matchAll(gradePhrasePattern)) {
    const signal = normalizeGradeSignal(match[1] ?? '')
    if (signal) grades.add(signal)
  }

  return grades
}

const collectGradeSignals = (source: SourceExtraction, text: string) => {
  const grades = new Set<string>()
  ;(source.sourceGoals ?? []).forEach((goal) => {
    ;(goal.tags ?? []).forEach((tag) => {
      const value = /^(?:grade|gradeBand):(.+)$/u.exec(tag)?.[1]
      if (value) grades.add(value)
    })
    const sourceRef = goal.sourceRef ?? ''
    const year = /Jahrgang(?:sstufe)?\s*([5-9]|10)\b/iu.exec(sourceRef)?.[1]
    if (year) grades.add(year)
  })
  collectDocumentGradeSignals(text).forEach((signal) => grades.add(signal))
  return grades
}

const stageTouchesSekI = (stage: string) => {
  const normalized = stage.toLocaleUpperCase('de-DE')
  return normalized === 'SEKI'
    || normalized === 'SEK I'
    || normalized === 'SEKUNDARSTUFE I'
    || normalized === 'LOWER SECONDARY'
    || normalized === 'LOWER-SECONDARY'
    || normalized === 'CROSSSTAGE'
    || normalized === 'GYMNASIUM'
    || normalized === 'SEKI+SEKII'
    || normalized === 'SEKI/SEKII'
    || normalized === 'SEKI-SEKII'
    || normalized === 'SEK I+SEK II'
    || normalized === 'SEK I/SEK II'
    || normalized === 'SEKUNDARSTUFE I+SEKUNDARSTUFE II'
}

const stageTouchesSekII = (stage: string) => {
  const normalized = stage.toLocaleUpperCase('de-DE')
  return normalized === 'SEKII'
    || normalized === 'SEK II'
    || normalized === 'SEKUNDARSTUFE II'
    || normalized === 'UPPER SECONDARY'
    || normalized === 'UPPER-SECONDARY'
    || normalized === 'CROSSSTAGE'
    || normalized === 'GYMNASIUM'
    || normalized === 'SEKI+SEKII'
    || normalized === 'SEKI/SEKII'
    || normalized === 'SEKI-SEKII'
    || normalized === 'SEK I+SEK II'
    || normalized === 'SEK I/SEK II'
    || normalized === 'SEKUNDARSTUFE I+SEKUNDARSTUFE II'
}

const describeSourceDocument = (value: unknown): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  return typeof record.title === 'string'
    ? record.title
    : typeof record.path === 'string'
      ? record.path
      : undefined
}

const describeSourceDocuments = (values: unknown[] | undefined): string | undefined => {
  const labels = (values ?? []).map(describeSourceDocument).filter((value): value is string => !!value)
  if (labels.length === 0) return undefined
  if (labels.length === 1) return labels[0]
  return `${labels[0]} +${labels.length - 1}`
}

const collectDurationViews = (m6SubjectsByLandscapeId: Map<string, string>) => {
  const result = new Map<string, Set<DurationModel>>()
  const viewFiles = collectFiles(compositionViewRoot, (path) => /\.view\.json$/iu.test(path))
  for (const viewPath of viewFiles) {
    let view: CompositionView
    try {
      view = readJson<CompositionView>(viewPath)
    } catch {
      continue
    }
    const subject = view.landscapeId ? m6SubjectsByLandscapeId.get(view.landscapeId) : undefined
    const jurisdiction = view.scope?.jurisdiction
    const durationModel = normalizeDurationModel(view.scope?.durationModel)
    if (!subject || !jurisdiction || !durationModel) continue
    const key = `${subject}|${jurisdiction}`
    const durations = result.get(key) ?? new Set<DurationModel>()
    durations.add(durationModel)
    result.set(key, durations)
  }
  return result
}

const loadDurationPolicyBySourcePath = () => {
  const policy = readJson<DurationPolicyDocument>(durationPolicyPath)
  const decisionsBySourcePath = new Map<string, DurationPolicyDecision>()
  const errors: string[] = []

  ;(policy.decisions ?? []).forEach((decision, index) => {
    const sourceExtractionPath = decision.sourceExtractionPath?.trim()
    if (!sourceExtractionPath) {
      errors.push(`Decision ${index} has no sourceExtractionPath.`)
      return
    }
    if (!existsSync(resolve(repoRoot, sourceExtractionPath))) {
      errors.push(`Decision ${index} references missing sourceExtractionPath: ${sourceExtractionPath}`)
    }
    if (decisionsBySourcePath.has(sourceExtractionPath)) {
      errors.push(`Duplicate duration policy decision for sourceExtractionPath: ${sourceExtractionPath}`)
    }
    ;(decision.durationModels ?? []).forEach((value) => {
      if (!normalizeDurationModel(value)) {
        errors.push(`Decision ${index} has unknown duration model: ${value}`)
      }
    })
    decisionsBySourcePath.set(sourceExtractionPath, decision)
  })

  return { decisionsBySourcePath, errors }
}

const describePolicyDecision = (policyDecision: DurationPolicyDecision | undefined) => {
  if (!policyDecision) return '-'
  const durationLabel = (policyDecision.durationModels ?? []).join(', ') || '-'
  return `${policyDecision.decision ?? 'reviewed'} (${durationLabel})`
}

const deriveStatus = (row: Omit<SourceReadinessRow, 'status'>) => {
  if (row.policyDecision?.status === 'reviewed') {
    if (row.policyDecision.decision === 'dual-duration-different-projection') {
      const hasDualViews = durationModels.every((durationModel) => row.durationViews.has(durationModel))
      return hasDualViews ? 'ready:dual-source-and-views' : 'open:reviewed-dual-needs-duration-views'
    }
    if (row.policyDecision.decision === 'single-duration-source') {
      return 'reviewed:single-duration-source-policy'
    }
    if (row.policyDecision.decision === 'duration-neutral-projection' || row.policyDecision.decision === 'no-difference-projection') {
      return 'reviewed:duration-neutral-policy'
    }
  }

  const hasDualSource = durationModels.every((durationModel) => row.durationModels.has(durationModel))
  const hasDualViews = durationModels.every((durationModel) => row.durationViews.has(durationModel))
  if (hasDualSource && hasDualViews) return 'ready:dual-source-and-views'
  if (hasDualSource) return 'open:dual-source-needs-duration-views'
  if (row.durationModels.size === 1) return 'open:single-duration-needs-policy'
  if (row.g8Hint || row.g9Hint) return 'open:document-hint-needs-normalization'
  if (row.gradeSignals.size > 0) return 'open:grade-structured-needs-duration-policy'
  return 'open:needs-duration-review'
}

const formatSet = (values: Set<string>) => values.size > 0 ? Array.from(values).sort().join(', ') : '-'

const normalizeValue = (value?: string) => value?.trim().toLocaleUpperCase('de-DE') ?? ''

type ScopeMap = Record<string, string | undefined>

interface RuntimeMatchScore {
  scopeSize: number
  stageFallbackCount: number
  courseFallbackCount: number
  coursePreferenceRank: number
}

const matchStageScope = (viewStage?: string, requestedStage?: string) => {
  const normalizedViewStage = normalizeValue(viewStage)
  const normalizedRequestedStage = normalizeValue(requestedStage)
  if (!normalizedViewStage || !normalizedRequestedStage) return null
  if (normalizedViewStage === normalizedRequestedStage) return { fallback: false }
  if (normalizedRequestedStage === stageCross && (normalizedViewStage === 'SEKI' || normalizedViewStage === 'SEKII')) {
    return { fallback: true }
  }
  return null
}

const matchCourseProfileScope = (viewCourseProfile?: string, requestedCourseProfile?: string) => {
  const normalizedViewCourseProfile = normalizeValue(viewCourseProfile)
  const normalizedRequestedCourseProfile = normalizeValue(requestedCourseProfile)
  if (!normalizedViewCourseProfile || !normalizedRequestedCourseProfile) return null
  if (normalizedViewCourseProfile === normalizedRequestedCourseProfile) {
    return { fallback: false, preferenceRank: 0 }
  }
  if (normalizedRequestedCourseProfile === courseProfileAll || normalizedRequestedCourseProfile === courseProfileCombined) {
    if (normalizedViewCourseProfile === courseProfileLk) {
      return { fallback: true, preferenceRank: 0 }
    }
    if (normalizedViewCourseProfile === courseProfileGk) {
      return { fallback: true, preferenceRank: 1 }
    }
  }
  return null
}

const scoreRuntimeScopeMatch = (
  viewScope: NonNullable<CompositionView['scope']>,
  requestedScope: ScopeMap,
): RuntimeMatchScore | null => {
  const entries = Object.entries(viewScope).filter(([, value]) => typeof value === 'string' && value.trim())
  if (entries.length === 0) return Object.values(requestedScope).some(Boolean) ? null : {
    scopeSize: 0,
    stageFallbackCount: 0,
    courseFallbackCount: 0,
    coursePreferenceRank: 0,
  }

  let stageFallbackCount = 0
  let courseFallbackCount = 0
  let coursePreferenceRank = 0

  for (const [key, viewValue] of entries) {
    const requestedValue = requestedScope[key]
    if (!requestedValue) return null

    if (key === stageKey) {
      const stageMatch = matchStageScope(viewValue, requestedValue)
      if (!stageMatch) return null
      if (stageMatch.fallback) stageFallbackCount += 1
      continue
    }

    if (key === courseProfileKey) {
      const courseMatch = matchCourseProfileScope(viewValue, requestedValue)
      if (!courseMatch) return null
      if (courseMatch.fallback) courseFallbackCount += 1
      coursePreferenceRank += courseMatch.preferenceRank
      continue
    }

    if (normalizeValue(viewValue) !== normalizeValue(requestedValue)) return null
  }

  return {
    scopeSize: entries.length,
    stageFallbackCount,
    courseFallbackCount,
    coursePreferenceRank,
  }
}

const collectCompositionViewSummaries = (m6SubjectsByLandscapeId: Map<string, string>) => {
  const views: CompositionViewSummary[] = []
  const viewFiles = collectFiles(compositionViewRoot, (path) => /\.view\.json$/iu.test(path))
  for (const viewPath of viewFiles) {
    let view: CompositionView
    try {
      view = readJson<CompositionView>(viewPath)
    } catch {
      continue
    }
    const subject = view.landscapeId ? m6SubjectsByLandscapeId.get(view.landscapeId) : undefined
    if (!subject || !view.viewId || !view.scope) continue
    views.push({ subject, viewId: view.viewId, scope: view.scope })
  }
  return views
}

const selectSekIRuntimeViews = (
  compositionViews: CompositionViewSummary[],
  subject: string,
  jurisdiction: string,
) => {
  const result = new Map<DurationModel, string>()
  for (const durationModel of durationModels) {
    const requestedScope: ScopeMap = {
      schoolForm: 'Gymnasium',
      jurisdiction,
      stage: 'SekI',
      durationModel,
    }
    const bestMatch = compositionViews
      .filter((view) => view.subject === subject)
      .map((view) => ({ view, score: scoreRuntimeScopeMatch(view.scope, requestedScope) }))
      .filter((entry): entry is { view: CompositionViewSummary, score: RuntimeMatchScore } => !!entry.score)
      .sort((left, right) =>
        right.score.scopeSize - left.score.scopeSize
        || left.score.stageFallbackCount - right.score.stageFallbackCount
        || left.score.courseFallbackCount - right.score.courseFallbackCount
        || left.score.coursePreferenceRank - right.score.coursePreferenceRank
        || left.view.viewId.localeCompare(right.view.viewId),
      )[0]
    if (bestMatch) {
      result.set(durationModel, bestMatch.view.viewId)
    }
  }
  return result
}

const formatRuntimeViews = (values: Map<DurationModel, string>) => {
  if (values.size === 0) return '-'
  return durationModels
    .filter((durationModel) => values.has(durationModel))
    .map((durationModel) => `${durationModel}: ${values.get(durationModel)}`)
    .join('<br>')
}

const normalizePolicyDurationModels = (policyDecision: DurationPolicyDecision | undefined) =>
  (policyDecision?.durationModels ?? [])
    .map(normalizeDurationModel)
    .filter((value): value is DurationModel => !!value)

const requiredSekIRuntimeDurationModels = (row: SourceReadinessRow) => {
  const policyDurationModels = normalizePolicyDurationModels(row.policyDecision)
  if (
    row.policyDecision?.status === 'reviewed'
    && row.policyDecision.decision === 'single-duration-source'
    && policyDurationModels.length > 0
  ) {
    return policyDurationModels
  }

  if (row.status === 'reviewed:single-duration-source-policy' && row.durationModels.size === 1) {
    return Array.from(row.durationModels)
  }

  return durationModels
}

const hasRequiredSekIRuntimeViews = (row: SourceReadinessRow) =>
  requiredSekIRuntimeDurationModels(row).every((durationModel) => row.sekiRuntimeViews.has(durationModel))

const classifyStageBucket = (stage: string) => {
  const touchesSekI = stageTouchesSekI(stage)
  const touchesSekII = stageTouchesSekII(stage)
  if (touchesSekI && touchesSekII) return 'SekI+SekII'
  if (touchesSekI) return 'SekI'
  if (touchesSekII) return 'SekII'
  return 'Other'
}

const formatTableCell = (value: string | number | undefined) => {
  const raw = value === undefined || value === '' ? '-' : String(value)
  return raw
    .replace(/\s+/gu, ' ')
    .replace(/\|/gu, '\\|')
    .trim()
}

const formatInlineCodeCell = (value: string | undefined) => value ? `\`${formatTableCell(value)}\`` : '-'

const describePolicyRationale = (policyDecision: DurationPolicyDecision | undefined) =>
  formatTableCell(policyDecision?.rationale ?? '-')

const describePolicyEvidenceSources = (policyDecision: DurationPolicyDecision | undefined) => {
  const sources = policyDecision?.evidenceSources ?? []
  return sources.length > 0 ? sources.map(formatTableCell).join('<br>') : '-'
}

const collectSourceEvidenceRows = (
  m6SubjectsSet: Set<string>,
  durationPolicyBySourcePath: Map<string, DurationPolicyDecision>,
) => collectFiles(inputRoot, (path) => extname(path).toLowerCase() === '.json' && /source-extraction\.json$/iu.test(path))
  .flatMap((sourcePath): SourceEvidenceRow[] => {
    let source: SourceExtraction
    try {
      source = readJson<SourceExtraction>(sourcePath)
    } catch {
      return []
    }
    const subject = inferSubject(source, sourcePath, m6SubjectsSet)
    if (!subject) return []

    const title = source.title
      ?? describeSourceDocument(source.sourceDocument)
      ?? describeSourceDocuments(source.sourceDocuments)
      ?? repoPath(sourcePath)
    const searchableText = JSON.stringify({
      title: source.title,
      sourceDocument: source.sourceDocument,
      sourceDocuments: source.sourceDocuments,
      method: source.method,
      refs: (source.sourceGoals ?? []).map((goal) => goal.sourceRef).filter(Boolean).slice(0, 100),
    })

    return [{
      subject,
      jurisdiction: inferJurisdiction(source, sourcePath),
      stage: inferStage(source, sourcePath),
      title,
      path: repoPath(sourcePath),
      sourceGoals: source.sourceGoals?.length ?? 0,
      durationModels: collectDurationModels(source, searchableText),
      gradeSignals: collectGradeSignals(source, searchableText),
      g8Hint: /\bG8\b|achtj[aä]hr/iu.test(searchableText),
      g9Hint: /\bG9\b|neunj[aä]hr/iu.test(searchableText),
      policyDecision: durationPolicyBySourcePath.get(repoPath(sourcePath)),
    }]
  })

const formatEvidenceDistribution = (rows: SourceEvidenceRow[]) => {
  const dual = rows.filter((row) => durationModels.every((durationModel) => row.durationModels.has(durationModel))).length
  const g8Only = rows.filter((row) => row.durationModels.has('G8') && !row.durationModels.has('G9')).length
  const g9Only = rows.filter((row) => row.durationModels.has('G9') && !row.durationModels.has('G8')).length
  const none = rows.length - dual - g8Only - g9Only
  return `dual: ${dual}; G8 only: ${g8Only}; G9 only: ${g9Only}; none: ${none}`
}

const renderSourceEvidenceSummaryRows = (allSourceRows: SourceEvidenceRow[], m6Subjects: string[]) => {
  const lines: string[] = []
  lines.push('| Subject | Stage bucket | Sources | Reviewed decisions | Dual differentiated | Duration-neutral | Single-duration | Open source review | Source duration evidence |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |')
  for (const subject of m6Subjects) {
    const subjectRows = allSourceRows.filter((row) => row.subject === subject)
    for (const stageBucket of ['SekI', 'SekII', 'SekI+SekII', 'Other']) {
      const stageRows = subjectRows.filter((row) => classifyStageBucket(row.stage) === stageBucket)
      if (stageRows.length === 0) continue
      const reviewed = stageRows.filter((row) => row.policyDecision?.status === 'reviewed').length
      const dual = stageRows.filter((row) => row.policyDecision?.decision === 'dual-duration-different-projection').length
      const neutral = stageRows.filter((row) =>
        row.policyDecision?.decision === 'duration-neutral-projection'
        || row.policyDecision?.decision === 'no-difference-projection',
      ).length
      const single = stageRows.filter((row) => row.policyDecision?.decision === 'single-duration-source').length
      const open = stageRows.length - reviewed
      lines.push(`| ${subject} | ${stageBucket} | ${stageRows.length} | ${reviewed} | ${dual} | ${neutral} | ${single} | ${open} | ${formatEvidenceDistribution(stageRows)} |`)
    }
  }
  return lines
}

const renderSourceEvidenceMatrixRows = (rows: SourceEvidenceRow[], includeSubject: boolean) => {
  const lines: string[] = []
  lines.push(includeSubject
    ? '| Subject | Jurisdiction | Source stage | Reviewed decision | Source duration evidence | Grade signals | Source goals | Source | Source file | Decision note | Evidence references |'
    : '| Jurisdiction | Source stage | Reviewed decision | Source duration evidence | Grade signals | Source goals | Source | Source file | Decision note | Evidence references |')
  lines.push(includeSubject
    ? '| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |'
    : '| --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- |')
  rows
    .sort((left, right) =>
      left.subject.localeCompare(right.subject, 'de', { sensitivity: 'base' })
      || classifyStageBucket(left.stage).localeCompare(classifyStageBucket(right.stage))
      || left.jurisdiction.localeCompare(right.jurisdiction)
      || left.stage.localeCompare(right.stage),
    )
    .forEach((row) => {
      const cells = [
        ...(includeSubject ? [formatTableCell(row.subject)] : []),
        formatInlineCodeCell(row.jurisdiction),
        formatTableCell(row.stage),
        formatTableCell(describePolicyDecision(row.policyDecision)),
        formatTableCell(formatSet(row.durationModels)),
        formatTableCell(formatSet(row.gradeSignals)),
        String(row.sourceGoals),
        formatTableCell(row.title),
        formatInlineCodeCell(row.path),
        describePolicyRationale(row.policyDecision),
        describePolicyEvidenceSources(row.policyDecision),
      ]
      lines.push(`| ${cells.join(' | ')} |`)
    })
  return lines
}

const renderReport = (rows: SourceReadinessRow[], allSourceRows: SourceEvidenceRow[], m6Subjects: string[]) => {
  const lines: string[] = []
  lines.push('# Gymnasium G8/G9 Duration-Model Readiness')
  lines.push('')
  pushGeneratedMarkdownNotice(lines)
  lines.push('This report is generated from local SkillPilot source-extraction files, reviewed duration-model policy decisions, and composition views. It is an implementation worklist, not an external policy assertion.')
  lines.push('')
  lines.push('The important distinction is source evidence vs. runtime readiness: the source matrix below documents what the local original-curriculum extractions currently indicate for each Bundesland, subject, and stage. Reviewed policy decisions make SkillPilot assumptions explicit so they can be challenged with a concrete source reference.')
  lines.push('')
  lines.push('## Interpretation')
  lines.push('')
  lines.push('| Status | Meaning |')
  lines.push('| --- | --- |')
  lines.push('| `ready:dual-source-and-views` | Source evidence distinguishes G8 and G9, and duration-specific learner-facing views exist. |')
  lines.push('| `reviewed:single-duration-source-policy` | The source has a reviewed single-duration decision; no separate duration-specific learner-facing tree is modeled for it. |')
  lines.push('| `reviewed:duration-neutral-policy` | The source has a reviewed decision that G8/G9 need no separate learner-facing projection. |')
  lines.push('| `open:reviewed-dual-needs-duration-views` | The source has a reviewed dual-duration decision, but learner-facing duration-specific views are still missing. |')
  lines.push('| `open:dual-source-needs-duration-views` | Source evidence distinguishes G8 and G9, but learner-facing views are not duration-specific yet. |')
  lines.push('| `open:single-duration-needs-policy` | The source appears to be a single-duration curriculum; encode that as projection policy before treating it as done. |')
  lines.push('| `open:document-hint-needs-normalization` | The document text hints at G8/G9, but the extracted goals are not normalized into duration metadata. |')
  lines.push('| `open:grade-structured-needs-duration-policy` | The source has grade structure but no duration-model decision. |')
  lines.push('| `open:needs-duration-review` | No usable local duration signal was found. |')
  lines.push('')
  lines.push('`Sek-I runtime view` mirrors backend composition-view matching for a learner who selected only Sekundarstufe I, a Bundesland, and an explicit G8/G9 duration model. `-` means the runtime currently falls back to the raw canonical graph for that subject/scope.')
  lines.push('')
  lines.push('`Open source review` in the source matrix means: no reviewed G8/G9 policy decision is recorded yet for that exact local source extraction. This does not automatically mean that a duration split exists; it means the assumption has not yet been documented in the policy ledger.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push('| Subject | Sources touching Sek I | Runtime Sek-I covered | Runtime Sek-I missing | Dual ready | Reviewed policy | Dual open | Source policy open | Needs review |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const subject of m6Subjects) {
    const subjectRows = rows.filter((row) => row.subject === subject)
    const runtimeCovered = subjectRows.filter(hasRequiredSekIRuntimeViews).length
    const runtimeMissing = subjectRows.length - runtimeCovered
    const dualReady = subjectRows.filter((row) => row.status === 'ready:dual-source-and-views').length
    const reviewedPolicy = subjectRows.filter((row) =>
      row.status === 'reviewed:single-duration-source-policy' || row.status === 'reviewed:duration-neutral-policy',
    ).length
    const dualOpen = subjectRows.filter((row) =>
      row.status === 'open:dual-source-needs-duration-views' || row.status === 'open:reviewed-dual-needs-duration-views',
    ).length
    const sourcePolicyOpen = subjectRows.filter((row) =>
      row.status === 'open:single-duration-needs-policy'
      || row.status === 'open:document-hint-needs-normalization'
      || row.status === 'open:grade-structured-needs-duration-policy',
    ).length
    const needsReview = subjectRows.filter((row) => row.status === 'open:needs-duration-review').length
    lines.push(`| ${subject} | ${subjectRows.length} | ${runtimeCovered} | ${runtimeMissing} | ${dualReady} | ${reviewedPolicy} | ${dualOpen} | ${sourcePolicyOpen} | ${needsReview} |`)
  }
  lines.push('')
  lines.push('## Source Evidence Summary')
  lines.push('')
  lines.push(...renderSourceEvidenceSummaryRows(allSourceRows, m6Subjects))
  lines.push('')
  lines.push('## Mathematik Source Matrix')
  lines.push('')
  lines.push(...renderSourceEvidenceMatrixRows(allSourceRows.filter((row) => row.subject === 'Mathematik'), false))
  lines.push('')
  lines.push('## Mathematik First')
  lines.push('')
  lines.push('| Jurisdiction | Stage | Status | Policy | Source duration evidence | Duration views | Sek-I runtime view | Grade signals | Source goals | Source |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |')
  rows
    .filter((row) => row.subject === 'Mathematik')
    .sort((left, right) => left.jurisdiction.localeCompare(right.jurisdiction) || left.stage.localeCompare(right.stage))
    .forEach((row) => {
      lines.push(`| \`${row.jurisdiction}\` | ${row.stage} | \`${row.status}\` | ${describePolicyDecision(row.policyDecision)} | ${formatSet(row.durationModels)} | ${formatSet(row.durationViews)} | ${formatRuntimeViews(row.sekiRuntimeViews)} | ${formatSet(row.gradeSignals)} | ${row.sourceGoals} | ${row.title} |`)
    })
  lines.push('')
  lines.push('## M6 Source Matrix')
  lines.push('')
  lines.push(...renderSourceEvidenceMatrixRows(allSourceRows.filter((row) => row.subject !== 'Mathematik'), true))
  lines.push('')
  lines.push('## M6 Subjects')
  lines.push('')
  lines.push('| Subject | Jurisdiction | Stage | Status | Policy | Source duration evidence | Duration views | Sek-I runtime view | Grade signals | Source goals | Source |')
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |')
  rows
    .filter((row) => row.subject !== 'Mathematik')
    .sort((left, right) =>
      left.subject.localeCompare(right.subject, 'de', { sensitivity: 'base' })
      || left.jurisdiction.localeCompare(right.jurisdiction)
      || left.stage.localeCompare(right.stage),
    )
    .forEach((row) => {
      lines.push(`| ${row.subject} | \`${row.jurisdiction}\` | ${row.stage} | \`${row.status}\` | ${describePolicyDecision(row.policyDecision)} | ${formatSet(row.durationModels)} | ${formatSet(row.durationViews)} | ${formatRuntimeViews(row.sekiRuntimeViews)} | ${formatSet(row.gradeSignals)} | ${row.sourceGoals} | ${row.title} |`)
    })
  lines.push('')
  lines.push('## Next Pipeline Rule')
  lines.push('')
  lines.push('A Gymnasium source touching Sekundarstufe I is duration-complete only when it has one of these reviewed outcomes:')
  lines.push('')
  lines.push('1. explicit G8/G9 source evidence plus duration-specific composition views where the learner-facing tree differs;')
  lines.push('2. a reviewed single-duration/source-policy decision that intentionally maps the source to one duration model or to a duration-neutral projection;')
  lines.push('3. a reviewed no-difference decision showing that G8 and G9 use the same learner-facing projection for that subject and jurisdiction.')
  lines.push('')
  return `${lines.join('\n')}\n`
}

const main = () => {
  const qualityStatus = readJson<CurriculumStatusDocument>(qualityStatusPath)
  const m6Curricula = (qualityStatus.curricula ?? [])
    .filter((curriculum) => curriculum.maturity === 'M6' && curriculum.subject && curriculum.landscapeId)
    .sort((left, right) => {
      if (left.subject === 'Mathematik') return -1
      if (right.subject === 'Mathematik') return 1
      return (left.subject ?? '').localeCompare(right.subject ?? '', 'de', { sensitivity: 'base' })
    })
  const m6Subjects = Array.from(new Set(m6Curricula.map((curriculum) => curriculum.subject as string)))
  const m6SubjectsSet = new Set(m6Subjects)
  const m6SubjectsByLandscapeId = new Map(
    m6Curricula.map((curriculum) => [curriculum.landscapeId as string, curriculum.subject as string]),
  )
  const durationViews = collectDurationViews(m6SubjectsByLandscapeId)
  const compositionViews = collectCompositionViewSummaries(m6SubjectsByLandscapeId)
  const durationPolicy = loadDurationPolicyBySourcePath()
  durationPolicy.errors.forEach((error) => console.error(`Duration policy error: ${error}`))
  const allSourceRows = collectSourceEvidenceRows(m6SubjectsSet, durationPolicy.decisionsBySourcePath)

  const rows = collectFiles(inputRoot, (path) => extname(path).toLowerCase() === '.json' && /source-extraction\.json$/iu.test(path))
    .flatMap((sourcePath): SourceReadinessRow[] => {
      let source: SourceExtraction
      try {
        source = readJson<SourceExtraction>(sourcePath)
      } catch {
        return []
      }
      const subject = inferSubject(source, sourcePath, m6SubjectsSet)
      if (!subject) return []
      const stage = inferStage(source, sourcePath)
      if (!stageTouchesSekI(stage)) return []

      const jurisdiction = inferJurisdiction(source, sourcePath)
      const title = source.title
        ?? describeSourceDocument(source.sourceDocument)
        ?? describeSourceDocuments(source.sourceDocuments)
        ?? repoPath(sourcePath)
      const searchableText = JSON.stringify({
        title: source.title,
        sourceDocument: source.sourceDocument,
        sourceDocuments: source.sourceDocuments,
        method: source.method,
        refs: (source.sourceGoals ?? []).map((goal) => goal.sourceRef).filter(Boolean).slice(0, 100),
      })
      const baseRow = {
        subject,
        jurisdiction,
        stage,
        title,
        path: repoPath(sourcePath),
        sourceGoals: source.sourceGoals?.length ?? 0,
        durationModels: collectDurationModels(source, searchableText),
        gradeSignals: collectGradeSignals(source, searchableText),
        g8Hint: /\bG8\b|achtj[aä]hr/iu.test(searchableText),
        g9Hint: /\bG9\b|neunj[aä]hr/iu.test(searchableText),
        durationViews: durationViews.get(`${subject}|${jurisdiction}`) ?? new Set<DurationModel>(),
        sekiRuntimeViews: selectSekIRuntimeViews(compositionViews, subject, jurisdiction),
        policyDecision: durationPolicy.decisionsBySourcePath.get(repoPath(sourcePath)),
      }
      return [{ ...baseRow, status: deriveStatus(baseRow) }]
    })

  const report = renderReport(rows, allSourceRows, m6Subjects)
  const current = existsSync(reportPath) ? readFileSync(reportPath, 'utf8') : null
  const changed = current !== report

  if (shouldWrite && changed) {
    writeFileSync(reportPath, report)
  }

  if (shouldCheck && changed) {
    console.error(`${repoPath(reportPath)} is not up to date. Run npm run report:gymnasium-duration-readiness -- --write.`)
    process.exitCode = 1
  }

  console.log(`${changed ? 'changed' : 'ok'} ${repoPath(reportPath)}`)
  console.log(`M6 subjects: ${m6Subjects.length}; source scopes touching Sek I: ${rows.length}; all source scopes: ${allSourceRows.length}`)
  const subjectsToRequireReviewed = Array.from(new Set([
    ...(requiredReviewedSubject ? [requiredReviewedSubject] : []),
    ...(shouldRequireReviewedM6 ? m6Subjects : []),
  ]))
  subjectsToRequireReviewed.forEach((subject) => {
    const unreviewedRows = rows.filter((row) => row.subject === subject && unreviewedStatuses.has(row.status))
    if (unreviewedRows.length === 0) return
    console.error(`${subject} has unreviewed G8/G9 duration-model source scopes:`)
    unreviewedRows.forEach((row) => {
      console.error(`- ${row.jurisdiction} ${row.stage}: ${row.status} (${row.path})`)
    })
    process.exitCode = 1
  })
  if (shouldRequireReviewedM6) {
    const missingSubjects = m6Subjects.filter((subject) => rows.every((row) => row.subject !== subject))
    if (missingSubjects.length > 0) {
      console.error(`No Gymnasium Sek-I duration rows found for M6 subject(s): ${missingSubjects.join(', ')}`)
      process.exitCode = 1
    }
  }
  if (durationPolicy.errors.length > 0) {
    process.exitCode = 1
  }
}

main()
