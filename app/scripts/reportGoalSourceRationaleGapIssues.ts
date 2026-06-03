import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'

type GapLane = 'covered-sibling-mapping-gap' | 'isolated-source-expansion-gap'

interface SourceRationaleItem {
  goal?: {
    id?: unknown
    title?: unknown
    description?: unknown
    pathTitles?: unknown
  }
  sourceRationaleStatus?: unknown
  classicSourceRoute?: {
    jurisdiction?: unknown
    sourceExtractionPath?: unknown
    sourceGoalId?: unknown
    sourceRef?: unknown
    topicCode?: unknown
    matchType?: unknown
  } | null
}

interface SourceRationaleReport {
  generatedAt?: unknown
  request?: {
    landscapePath?: unknown
    goalSelection?: unknown
  }
  summary?: unknown
  items?: unknown
}

interface CoveredSibling {
  goalId: string
  title: string
  sourceRationaleStatus: string
  jurisdiction: string | null
  sourceExtractionPath: string | null
  sourceGoalId: string | null
  sourceRef: string | null
  topicCode: string | null
  matchType: string | null
}

interface GapIssue {
  id: string
  lane: GapLane
  goalId: string
  shortKey: string | null
  title: string
  description: string
  phase: string
  area: string
  topicCode: string | null
  pathTitles: string[]
  parentGoalIds: string[]
  parentTitles: string[]
  siblingGoals: number
  coveredSiblingGoals: number
  gapSiblingGoals: number
  coveredSiblingExamples: CoveredSibling[]
  recommendedAction: string
}

interface Bucket {
  key: string
  issues: number
  coveredSiblingMappingGaps: number
  isolatedSourceExpansionGaps: number
}

interface GapIssueReport {
  schemaVersion: 1
  generatedAt: string
  generator: string
  request: {
    landscapePath: string
    allRelevantReportPath: string
  }
  sourceReport: {
    generatedAt: string | null
    summary: unknown
  }
  summary: {
    totalClassicSourceGapIssues: number
    coveredSiblingMappingGaps: number
    isolatedSourceExpansionGaps: number
    phases: number
    areas: number
  }
  buckets: {
    byPhase: Bucket[]
    byArea: Bucket[]
    byLane: Bucket[]
  }
  issues: GapIssue[]
}

interface Args {
  checkMode: boolean
  landscapePath: string
  allRelevantReportPath: string
  outputJsonPath: string
  outputMarkdownPath: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultLandscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const defaultAllRelevantReportPath = 'docs/qa-ci/status/goal-source-rationales-math-all-relevant.json'
const defaultOutputJsonPath = 'docs/qa-ci/status/goal-source-rationale-gap-issues.json'
const defaultOutputMarkdownPath = 'docs/qa-ci/status/goal-source-rationale-gap-issues.md'

function resolveRepoPath(path: string): string {
  return resolve(repoRoot, path)
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolveRepoPath(path), 'utf8')) as T
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    checkMode: false,
    landscapePath: defaultLandscapePath,
    allRelevantReportPath: defaultAllRelevantReportPath,
    outputJsonPath: defaultOutputJsonPath,
    outputMarkdownPath: defaultOutputMarkdownPath,
  }

  argv.forEach((arg) => {
    if (arg === '--check') {
      args.checkMode = true
      return
    }
    if (arg.startsWith('--landscape=')) {
      args.landscapePath = arg.slice('--landscape='.length)
      return
    }
    if (arg.startsWith('--all-relevant-report=')) {
      args.allRelevantReportPath = arg.slice('--all-relevant-report='.length)
      return
    }
    if (arg.startsWith('--output-json=')) {
      args.outputJsonPath = arg.slice('--output-json='.length)
      return
    }
    if (arg.startsWith('--output-md=')) {
      args.outputMarkdownPath = arg.slice('--output-md='.length)
      return
    }
    throw new Error(`Unknown argument: ${arg}`)
  })

  return args
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

function reportItems(report: SourceRationaleReport): SourceRationaleItem[] {
  return Array.isArray(report.items)
    ? report.items.filter((item): item is SourceRationaleItem => typeof item === 'object' && item !== null)
    : []
}

function itemGoalId(item: SourceRationaleItem): string | null {
  return asString(item.goal?.id)
}

function hasClassicRoute(item: SourceRationaleItem | undefined): boolean {
  return item !== undefined
    && item.classicSourceRoute !== null
    && item.classicSourceRoute !== undefined
    && item.sourceRationaleStatus !== 'classic_source_gap'
}

function goalContains(goal: LearningGoal): string[] {
  return Array.isArray(goal.contains) ? goal.contains : []
}

function buildParentMap(goals: LearningGoal[]): Map<string, string[]> {
  const parentsByGoal = new Map<string, string[]>()
  goals.forEach((goal) => {
    goalContains(goal).forEach((childId) => {
      const parents = parentsByGoal.get(childId) ?? []
      parents.push(goal.id)
      parentsByGoal.set(childId, parents)
    })
  })
  parentsByGoal.forEach((parents) => parents.sort((left, right) => left.localeCompare(right, 'de')))
  return parentsByGoal
}

function phaseOf(goal: LearningGoal): string {
  return goal.dimensionTags?.phase ?? 'unknown'
}

function areaOf(goal: LearningGoal): string {
  return goal.dimensionTags?.area ?? 'unknown'
}

function topicCodeOf(goal: LearningGoal): string | null {
  return goal.dimensionTags?.topicCode ?? null
}

function issueId(goalId: string): string {
  return `GSR-GAP-${goalId.slice(0, 8).toUpperCase()}`
}

function coveredSibling(item: SourceRationaleItem, goalById: Map<string, LearningGoal>): CoveredSibling | null {
  const goalId = itemGoalId(item)
  const goal = goalId === null ? undefined : goalById.get(goalId)
  if (goalId === null || goal === undefined || !hasClassicRoute(item)) return null
  return {
    goalId,
    title: goal.title,
    sourceRationaleStatus: asString(item.sourceRationaleStatus) ?? 'unknown',
    jurisdiction: asString(item.classicSourceRoute?.jurisdiction),
    sourceExtractionPath: asString(item.classicSourceRoute?.sourceExtractionPath),
    sourceGoalId: asString(item.classicSourceRoute?.sourceGoalId),
    sourceRef: asString(item.classicSourceRoute?.sourceRef),
    topicCode: asString(item.classicSourceRoute?.topicCode),
    matchType: asString(item.classicSourceRoute?.matchType),
  }
}

const stopWords = new Set([
  'eine',
  'einen',
  'einer',
  'einem',
  'eines',
  'oder',
  'und',
  'mit',
  'fuer',
  'fur',
  'die',
  'der',
  'das',
  'den',
  'dem',
  'des',
  'kann',
  'lk',
])

function normalizeForTokens(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ä/giu, 'ae')
    .replace(/ö/giu, 'oe')
    .replace(/ü/giu, 'ue')
    .replace(/ß/giu, 'ss')
    .toLocaleLowerCase('de-DE')
}

function tokenPrefixes(value: string): Set<string> {
  return new Set(
    normalizeForTokens(value)
      .split(/[^a-z0-9]+/iu)
      .filter((token) => token.length >= 5 && !stopWords.has(token))
      .map((token) => token.slice(0, 6)),
  )
}

function lexicalOverlapScore(goal: LearningGoal, sibling: CoveredSibling): number {
  const gapTokens = tokenPrefixes(`${goal.title} ${goal.description}`)
  const siblingTokens = tokenPrefixes(`${sibling.title} ${sibling.sourceRef ?? ''} ${sibling.sourceGoalId ?? ''}`)
  return Array.from(gapTokens).filter((token) => siblingTokens.has(token)).length
}

function siblingRank(goal: LearningGoal, sibling: CoveredSibling): number {
  let rank = 0
  rank -= lexicalOverlapScore(goal, sibling) * 30
  if (sibling.sourceRationaleStatus === 'classic_source_reviewed') rank -= 20
  if (sibling.matchType === 'exact') rank -= 10
  if (sibling.matchType === 'partial') rank += 5
  if (sibling.sourceRef !== null) rank -= 3
  if (sibling.sourceExtractionPath !== null) rank -= 2
  return rank
}

function recommendedAction(lane: GapLane): string {
  if (lane === 'covered-sibling-mapping-gap') {
    return 'Pruefen, ob ein bereits belegter Geschwister-Quellenabschnitt auch dieses kanonische Ziel traegt; falls ja, Mapping-Review um die Ziel-ID ergaenzen oder Source-Extraction feiner splitten.'
  }
  return 'Quellenstelle im klassischen Curriculum suchen und als Source-Extraction-/Mapping-Beleg nachtragen; es gibt im direkten Elternkontext noch kein belegtes Geschwisterziel als Anker.'
}

function buildIssues(landscape: LearningLandscape, sourceReport: SourceRationaleReport): GapIssue[] {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const parentsByGoal = buildParentMap(landscape.goals)
  const itemsByGoalId = new Map(
    reportItems(sourceReport)
      .map((item) => [itemGoalId(item), item] as const)
      .filter((entry): entry is readonly [string, SourceRationaleItem] => entry[0] !== null),
  )

  return reportItems(sourceReport)
    .filter((item) => item.sourceRationaleStatus === 'classic_source_gap')
    .map((item) => {
      const goalId = itemGoalId(item)
      if (goalId === null) return null
      const goal = goalById.get(goalId)
      if (goal === undefined) return null
      const parentGoalIds = parentsByGoal.get(goalId) ?? []
      const siblingGoalIds = Array.from(new Set(parentGoalIds.flatMap((parentId) =>
        goalContains(goalById.get(parentId) as LearningGoal).filter((siblingId) => siblingId !== goalId))))
        .filter((siblingId) => itemsByGoalId.has(siblingId))
      const coveredSiblingExamples = siblingGoalIds
        .map((siblingId) => coveredSibling(itemsByGoalId.get(siblingId) as SourceRationaleItem, goalById))
        .filter((sibling): sibling is CoveredSibling => sibling !== null)
        .sort((left, right) =>
          siblingRank(goal, left) - siblingRank(goal, right)
            || left.title.localeCompare(right.title, 'de')
            || left.goalId.localeCompare(right.goalId, 'de'))
      const lane: GapLane = coveredSiblingExamples.length > 0
        ? 'covered-sibling-mapping-gap'
        : 'isolated-source-expansion-gap'

      return {
        id: issueId(goalId),
        lane,
        goalId,
        shortKey: goal.shortKey ?? null,
        title: goal.title,
        description: goal.description,
        phase: phaseOf(goal),
        area: areaOf(goal),
        topicCode: topicCodeOf(goal),
        pathTitles: asStringArray(item.goal?.pathTitles),
        parentGoalIds,
        parentTitles: parentGoalIds.map((parentId) => goalById.get(parentId)?.title ?? parentId),
        siblingGoals: siblingGoalIds.length,
        coveredSiblingGoals: coveredSiblingExamples.length,
        gapSiblingGoals: siblingGoalIds.length - coveredSiblingExamples.length,
        coveredSiblingExamples: coveredSiblingExamples.slice(0, 5),
        recommendedAction: recommendedAction(lane),
      } satisfies GapIssue
    })
    .filter((issue): issue is GapIssue => issue !== null)
    .sort((left, right) =>
      left.pathTitles.join('\0').localeCompare(right.pathTitles.join('\0'), 'de')
        || left.title.localeCompare(right.title, 'de')
        || left.goalId.localeCompare(right.goalId, 'de'))
}

function bucketIssues(issues: GapIssue[], keyOf: (issue: GapIssue) => string): Bucket[] {
  return Array.from(new Set(issues.map(keyOf)))
    .sort((left, right) => left.localeCompare(right, 'de'))
    .map((key) => {
      const bucketIssuesForKey = issues.filter((issue) => keyOf(issue) === key)
      return {
        key,
        issues: bucketIssuesForKey.length,
        coveredSiblingMappingGaps: bucketIssuesForKey.filter((issue) => issue.lane === 'covered-sibling-mapping-gap').length,
        isolatedSourceExpansionGaps: bucketIssuesForKey.filter((issue) => issue.lane === 'isolated-source-expansion-gap').length,
      }
    })
    .sort((left, right) => right.issues - left.issues || left.key.localeCompare(right.key, 'de'))
}

function buildReport(args: Args, generatedAt: string): GapIssueReport {
  const landscape = readJson<LearningLandscape>(args.landscapePath)
  const sourceReport = readJson<SourceRationaleReport>(args.allRelevantReportPath)
  const issues = buildIssues(landscape, sourceReport)
  const byPhase = bucketIssues(issues, (issue) => issue.phase)
  const byArea = bucketIssues(issues, (issue) => issue.area)

  return {
    schemaVersion: 1,
    generatedAt,
    generator: 'app/scripts/reportGoalSourceRationaleGapIssues.ts',
    request: {
      landscapePath: args.landscapePath,
      allRelevantReportPath: args.allRelevantReportPath,
    },
    sourceReport: {
      generatedAt: asString(sourceReport.generatedAt),
      summary: sourceReport.summary ?? null,
    },
    summary: {
      totalClassicSourceGapIssues: issues.length,
      coveredSiblingMappingGaps: issues.filter((issue) => issue.lane === 'covered-sibling-mapping-gap').length,
      isolatedSourceExpansionGaps: issues.filter((issue) => issue.lane === 'isolated-source-expansion-gap').length,
      phases: byPhase.length,
      areas: byArea.length,
    },
    buckets: {
      byPhase,
      byArea,
      byLane: bucketIssues(issues, (issue) => issue.lane),
    },
    issues,
  }
}

function existingGeneratedAt(path: string): string | null {
  if (!existsSync(resolveRepoPath(path))) return null
  try {
    return asString(readJson<{ generatedAt?: unknown }>(path).generatedAt)
  } catch {
    return null
  }
}

function markdownCell(value: string | number): string {
  return String(value).replace(/\|/g, '\\|').replace(/\n+/g, '<br>')
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>): string[] {
  return [
    `| ${headers.map(markdownCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`),
  ]
}

function pushGeneratedMarkdownNotice(lines: string[]): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/reportGoalSourceRationaleGapIssues.ts`')
  lines.push('> Regenerate with: `cd app && npm run quality:goal-source-rationale-gap-issues`')
  lines.push('> Source of truth: `app/scripts/reportGoalSourceRationaleGapIssues.ts`')
  lines.push(`> Source of truth: \`${defaultAllRelevantReportPath}\``)
  lines.push(`> Source of truth: \`${defaultLandscapePath}\``)
  lines.push('')
}

function laneLabel(lane: GapLane): string {
  if (lane === 'covered-sibling-mapping-gap') return 'Geschwister-Mapping pruefen'
  return 'Quellenbeleg suchen'
}

function anchorLabel(issue: GapIssue): string {
  const anchor = issue.coveredSiblingExamples[0]
  if (anchor === undefined) return '-'
  const source = [
    anchor.jurisdiction,
    anchor.sourceRef,
    anchor.sourceGoalId,
  ].filter((value): value is string => value !== null)
  return `${anchor.title} (${source.join(' | ')})`
}

function renderBucketSection(title: string, buckets: Bucket[]): string[] {
  return [
    title,
    '',
    ...markdownTable(
      ['Bucket', 'Issues', 'Sibling-supported', 'Isolated'],
      buckets.map((bucket) => [
        bucket.key,
        bucket.issues,
        bucket.coveredSiblingMappingGaps,
        bucket.isolatedSourceExpansionGaps,
      ]),
    ),
    '',
  ]
}

function renderMarkdown(report: GapIssueReport): string {
  const lines: string[] = ['# Goal Source Rationale Gap Issues', '']
  pushGeneratedMarkdownNotice(lines)
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')
  lines.push('Diese Review-Liste verdichtet die klassischen Quellen-Gaps aus dem All-Relevant-Mathematikreport zu bearbeitbaren Issues. Sie ist kein Runtime-Gate; sie priorisiert die naechsten Source-Extraction- und Mapping-Arbeiten.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(...markdownTable(
    ['Metric', 'Value'],
    [
      ['Classic-source gap issues', report.summary.totalClassicSourceGapIssues],
      ['Mit belegten Geschwisterzielen', report.summary.coveredSiblingMappingGaps],
      ['Ohne belegten Elternkontext', report.summary.isolatedSourceExpansionGaps],
      ['Phasen mit Gaps', report.summary.phases],
      ['Bereiche mit Gaps', report.summary.areas],
    ],
  ))
  lines.push('')
  lines.push('## Bearbeitungslanes')
  lines.push('')
  lines.push('- `Geschwister-Mapping pruefen`: Im selben Elternknoten gibt es belegte Geschwisterziele. Hier zuerst pruefen, ob der vorhandene Quellenabschnitt auch das Gap-Ziel traegt oder feiner gesplittet werden muss.')
  lines.push('- `Quellenbeleg suchen`: Im direkten Elternkontext gibt es kein belegtes Geschwisterziel. Hier braucht es wahrscheinlich eine neue oder erweiterte Source-Extraction-/Mapping-Entscheidung.')
  lines.push('')
  lines.push(...renderBucketSection('## By Phase', report.buckets.byPhase))
  lines.push(...renderBucketSection('## By Area', report.buckets.byArea))
  lines.push('## Issue Queue')
  lines.push('')
  lines.push(...markdownTable(
    ['Issue', 'Lane', 'Phase', 'Area', 'Goal', 'Covered siblings', 'Primary source anchor', 'Path'],
    report.issues.map((issue) => [
      issue.id,
      laneLabel(issue.lane),
      issue.phase,
      issue.area,
      issue.shortKey === null ? issue.title : `${issue.title} (${issue.shortKey})`,
      issue.coveredSiblingGoals,
      anchorLabel(issue),
      issue.pathTitles.join(' > '),
    ]),
  ))
  lines.push('')
  lines.push('## Sources')
  lines.push('')
  lines.push(`- Landscape: \`${report.request.landscapePath}\``)
  lines.push(`- All-relevant report: \`${report.request.allRelevantReportPath}\``)
  lines.push(`- All-relevant generated: ${report.sourceReport.generatedAt ?? 'unknown'}`)
  lines.push('')
  return `${lines.join('\n')}\n`
}

function writeOrCheck(args: Args, report: GapIssueReport): void {
  const renderedJson = `${JSON.stringify(report, null, 2)}\n`
  const renderedMarkdown = renderMarkdown(report)

  if (args.checkMode) {
    const failures: string[] = []
    if (!existsSync(resolveRepoPath(args.outputJsonPath))) {
      failures.push(`${args.outputJsonPath} does not exist. Run: cd app && npm run quality:goal-source-rationale-gap-issues`)
    } else if (readFileSync(resolveRepoPath(args.outputJsonPath), 'utf8') !== renderedJson) {
      failures.push(`${args.outputJsonPath} is stale. Run: cd app && npm run quality:goal-source-rationale-gap-issues`)
    }
    if (!existsSync(resolveRepoPath(args.outputMarkdownPath))) {
      failures.push(`${args.outputMarkdownPath} does not exist. Run: cd app && npm run quality:goal-source-rationale-gap-issues`)
    } else if (readFileSync(resolveRepoPath(args.outputMarkdownPath), 'utf8') !== renderedMarkdown) {
      failures.push(`${args.outputMarkdownPath} is stale. Run: cd app && npm run quality:goal-source-rationale-gap-issues`)
    }
    if (failures.length > 0) {
      console.error(failures.join('\n'))
      process.exit(1)
    }
    console.log(`${args.outputMarkdownPath} and ${args.outputJsonPath} are up to date.`)
    return
  }

  mkdirSync(dirname(resolveRepoPath(args.outputJsonPath)), { recursive: true })
  mkdirSync(dirname(resolveRepoPath(args.outputMarkdownPath)), { recursive: true })
  writeFileSync(resolveRepoPath(args.outputJsonPath), renderedJson)
  writeFileSync(resolveRepoPath(args.outputMarkdownPath), renderedMarkdown)
  console.log(`Wrote ${args.outputJsonPath}`)
  console.log(`Wrote ${args.outputMarkdownPath}`)
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const generatedAt = args.checkMode
    ? existingGeneratedAt(args.outputJsonPath) ?? new Date().toISOString()
    : new Date().toISOString()
  writeOrCheck(args, buildReport(args, generatedAt))
}

main()
