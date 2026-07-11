import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'

type CoverageClassification =
  | 'covered_runtime_classic_and_mem'
  | 'covered_runtime_classic_mem_pending'
  | 'runtime_classic_gap'
  | 'missing_runtime_leaf'
  | 'covered_runtime_cluster_direct'
  | 'cluster_aggregate_pending'
  | 'non_content_or_memory'

interface RuntimeSourceRationaleItem {
  goal?: {
    id?: unknown
    title?: unknown
    pathTitles?: unknown
  }
  sourceRationaleStatus?: unknown
  classicSourceRoute?: unknown
  memSparqlRoute?: {
    status?: unknown
  }
}

interface RuntimeSourceRationaleIndex {
  generatedAt?: unknown
  generator?: unknown
  request?: unknown
  summary?: unknown
  items?: unknown
}

interface Args {
  checkMode: boolean
  landscapePath: string
  runtimeIndexPath: string
  outputJsonPath: string
  outputMarkdownPath: string
}

interface CoverageGoalRow {
  id: string
  shortKey: string | null
  title: string
  type: 'atomic' | 'cluster'
  phase: string
  area: string
  topicCode: string | null
  pathTitles: string[]
  runtimeCovered: boolean
  classicSourceRoute: boolean
  memSparqlStatus: string | null
  classification: CoverageClassification
}

interface CoverageBucket {
  key: string
  totalRelevantLeaves: number
  leavesWithClassicSourceRationale: number
  leavesWithMemSparqlConsistentRoute: number
  missingRelevantLeaves: number
}

interface CoverageSummary {
  totalGoals: number
  atomicLeaves: number
  relevantAtomicLeaves: number
  memoryOrNonContentLeaves: number
  clusters: number
  containsRelations: number
  requiresRelations: number
  runtimeItems: number
  runtimeItemsInLandscape: number
  runtimeItemsMissingFromLandscape: number
  runtimeGoalsWithClassicSourceRationale: number
  runtimeGoalsWithMemSparqlConsistentRoute: number
  relevantLeavesWithClassicSourceRationale: number
  relevantLeavesWithMemSparqlConsistentRoute: number
  relevantLeavesMissingRuntimeSourceRationale: number
  relevantLeavesWithRuntimeClassicGap: number
  clustersWithDirectRuntimeSourceRationale: number
  clustersWithoutDirectRuntimeSourceRationale: number
  containsRelationRationalesImplemented: number
  requiresRelationRationalesImplemented: number
  relevantLeafClassicCoveragePercent: number
  relevantLeafMemCoveragePercent: number
}

interface CoverageReport {
  schemaVersion: 1
  generatedAt: string
  generator: string
  request: {
    landscapePath: string
    runtimeIndexPath: string
  }
  sourceIndex: {
    generatedAt: string | null
    generator: string | null
    summary: unknown
    request: unknown
  }
  summary: CoverageSummary
  buckets: {
    byPhase: CoverageBucket[]
    byArea: CoverageBucket[]
  }
  anomalies: {
    runtimeGoalIdsMissingFromLandscape: string[]
  }
  workQueue: {
    missingRelevantLeafGoals: CoverageGoalRow[]
    relevantLeafMemSparqlReviewNeededGoals: CoverageGoalRow[]
    clusterDirectRationalePendingGoals: CoverageGoalRow[]
    relationRationales: {
      containsRelationsPending: number
      requiresRelationsPending: number
    }
  }
  rows: CoverageGoalRow[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const defaultLandscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const defaultRuntimeIndexPath = 'app/public/data/goal-source-rationales-math-public.json'
const defaultOutputJsonPath = 'docs/qa-ci/status/goal-source-rationale-coverage.json'
const defaultOutputMarkdownPath = 'docs/qa-ci/status/goal-source-rationale-coverage.md'

function toPosixPath(path: string): string {
  return path.split(sep).join('/')
}

function repoRelative(path: string): string {
  return toPosixPath(relative(repoRoot, path))
}

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
    runtimeIndexPath: defaultRuntimeIndexPath,
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
    if (arg.startsWith('--runtime-index=')) {
      args.runtimeIndexPath = arg.slice('--runtime-index='.length)
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

function runtimeItems(index: RuntimeSourceRationaleIndex): RuntimeSourceRationaleItem[] {
  return Array.isArray(index.items)
    ? index.items.filter((item): item is RuntimeSourceRationaleItem => typeof item === 'object' && item !== null)
    : []
}

function runtimeGoalId(item: RuntimeSourceRationaleItem): string | null {
  return asString(item.goal?.id)
}

function goalContains(goal: LearningGoal): string[] {
  return Array.isArray(goal.contains) ? goal.contains : []
}

function isClusterGoal(goal: LearningGoal): boolean {
  return goal.type === 'cluster' || goalContains(goal).length > 0
}

function isMemoryOrNonContentLeaf(goal: LearningGoal): boolean {
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

function phaseOf(goal: LearningGoal): string {
  return goal.dimensionTags?.phase ?? 'unknown'
}

function areaOf(goal: LearningGoal): string {
  return goal.dimensionTags?.area ?? 'unknown'
}

function topicCodeOf(goal: LearningGoal): string | null {
  return goal.dimensionTags?.topicCode ?? null
}

function hasClassicRoute(item: RuntimeSourceRationaleItem | undefined): boolean {
  return item !== undefined
    && item.classicSourceRoute !== null
    && item.classicSourceRoute !== undefined
    && item.sourceRationaleStatus !== 'classic_source_gap'
}

function memStatus(item: RuntimeSourceRationaleItem | undefined): string | null {
  return asString(item?.memSparqlRoute?.status)
}

function hasConsistentMemRoute(item: RuntimeSourceRationaleItem | undefined): boolean {
  return memStatus(item) === 'mem_sparql_consistent'
}

function buildParentMap(goals: Map<string, LearningGoal>): Map<string, string[]> {
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

function allGoalPaths(goalId: string, parentsByGoal: Map<string, string[]>, seen = new Set<string>()): string[][] {
  if (seen.has(goalId)) return [[goalId]]
  const parents = parentsByGoal.get(goalId) ?? []
  if (parents.length === 0) return [[goalId]]
  const nextSeen = new Set(seen)
  nextSeen.add(goalId)
  return parents.flatMap((parentId) =>
    allGoalPaths(parentId, parentsByGoal, nextSeen).map((path) => [...path, goalId]))
}

function pathRank(path: string[], goals: Map<string, LearningGoal>): number {
  const titles = path.map((goalId) => goals.get(goalId)?.title ?? '')
  let rank = path.length
  if (titles.some((title) => title.startsWith('Jahrgangsstufe'))) rank -= 20
  if (titles.some((title) => title.includes('Mathematik'))) rank -= 2
  return rank
}

function bestGoalPathTitles(goalId: string, goals: Map<string, LearningGoal>, parentsByGoal: Map<string, string[]>): string[] {
  const sortedPaths = allGoalPaths(goalId, parentsByGoal)
    .sort((left, right) => {
      const rankDifference = pathRank(left, goals) - pathRank(right, goals)
      if (rankDifference !== 0) return rankDifference
      return left.join('\0').localeCompare(right.join('\0'), 'de')
    })
  return sortedPaths[0]?.map((pathGoalId) => goals.get(pathGoalId)?.title ?? pathGoalId) ?? [goalId]
}

function classifyGoal(goal: LearningGoal, runtimeItem: RuntimeSourceRationaleItem | undefined): CoverageClassification {
  if (!isClusterGoal(goal) && isMemoryOrNonContentLeaf(goal)) {
    return 'non_content_or_memory'
  }
  if (isClusterGoal(goal)) {
    return hasClassicRoute(runtimeItem) ? 'covered_runtime_cluster_direct' : 'cluster_aggregate_pending'
  }
  if (runtimeItem === undefined) {
    return 'missing_runtime_leaf'
  }
  if (!hasClassicRoute(runtimeItem)) {
    return 'runtime_classic_gap'
  }
  return hasConsistentMemRoute(runtimeItem)
    ? 'covered_runtime_classic_and_mem'
    : 'covered_runtime_classic_mem_pending'
}

function buildRows(landscape: LearningLandscape, runtimeByGoalId: Map<string, RuntimeSourceRationaleItem>): CoverageGoalRow[] {
  const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const parentsByGoal = buildParentMap(goals)

  return landscape.goals
    .map((goal) => {
      const runtimeItem = runtimeByGoalId.get(goal.id)
      return {
        id: goal.id,
        shortKey: goal.shortKey ?? null,
        title: goal.title,
        type: isClusterGoal(goal) ? 'cluster' : 'atomic',
        phase: phaseOf(goal),
        area: areaOf(goal),
        topicCode: topicCodeOf(goal),
        pathTitles: bestGoalPathTitles(goal.id, goals, parentsByGoal),
        runtimeCovered: runtimeItem !== undefined,
        classicSourceRoute: hasClassicRoute(runtimeItem),
        memSparqlStatus: memStatus(runtimeItem),
        classification: classifyGoal(goal, runtimeItem),
      } satisfies CoverageGoalRow
    })
    .sort((left, right) =>
      left.pathTitles.join('\0').localeCompare(right.pathTitles.join('\0'), 'de')
        || left.title.localeCompare(right.title, 'de')
        || left.id.localeCompare(right.id, 'de'))
}

function percent(count: number, total: number): number {
  return total === 0 ? 0 : Number(((count / total) * 100).toFixed(1))
}

function countContainsRelations(goals: LearningGoal[]): number {
  return goals.reduce((sum, goal) => sum + goalContains(goal).length, 0)
}

function countRequiresRelations(goals: LearningGoal[]): number {
  return goals.reduce((sum, goal) => sum + goal.requires.length, 0)
}

function bucketRows(rows: CoverageGoalRow[], key: 'phase' | 'area'): CoverageBucket[] {
  const relevantLeaves = rows.filter((row) => row.type === 'atomic' && row.classification !== 'non_content_or_memory')
  const keys = Array.from(new Set(relevantLeaves.map((row) => row[key]))).sort((left, right) => left.localeCompare(right, 'de'))
  return keys
    .map((bucketKey) => {
      const bucket = relevantLeaves.filter((row) => row[key] === bucketKey)
      return {
        key: bucketKey,
        totalRelevantLeaves: bucket.length,
        leavesWithClassicSourceRationale: bucket.filter((row) => row.classicSourceRoute).length,
        leavesWithMemSparqlConsistentRoute: bucket.filter((row) => row.memSparqlStatus === 'mem_sparql_consistent').length,
        missingRelevantLeaves: bucket.filter((row) => row.classification === 'missing_runtime_leaf').length,
      }
    })
    .sort((left, right) =>
      right.missingRelevantLeaves - left.missingRelevantLeaves
        || right.totalRelevantLeaves - left.totalRelevantLeaves
        || left.key.localeCompare(right.key, 'de'))
}

function buildReport(args: Args, generatedAt: string): CoverageReport {
  const landscape = readJson<LearningLandscape>(args.landscapePath)
  const runtimeIndex = readJson<RuntimeSourceRationaleIndex>(args.runtimeIndexPath)
  const goalsById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const runtimeItemList = runtimeItems(runtimeIndex)
  const runtimeByGoalId = new Map(
    runtimeItemList
      .map((item) => [runtimeGoalId(item), item] as const)
      .filter((entry): entry is readonly [string, RuntimeSourceRationaleItem] => entry[0] !== null),
  )
  const runtimeGoalIdsMissingFromLandscape = Array.from(runtimeByGoalId.keys())
    .filter((goalId) => !goalsById.has(goalId))
    .sort((left, right) => left.localeCompare(right, 'de'))
  const rows = buildRows(landscape, runtimeByGoalId)

  const atomicRows = rows.filter((row) => row.type === 'atomic')
  const relevantLeafRows = atomicRows.filter((row) => row.classification !== 'non_content_or_memory')
  const clusterRows = rows.filter((row) => row.type === 'cluster')
  const runtimeItemsInLandscape = runtimeItemList
    .map(runtimeGoalId)
    .filter((goalId): goalId is string => goalId !== null && goalsById.has(goalId))
    .length

  const summary: CoverageSummary = {
    totalGoals: rows.length,
    atomicLeaves: atomicRows.length,
    relevantAtomicLeaves: relevantLeafRows.length,
    memoryOrNonContentLeaves: atomicRows.length - relevantLeafRows.length,
    clusters: clusterRows.length,
    containsRelations: countContainsRelations(landscape.goals),
    requiresRelations: countRequiresRelations(landscape.goals),
    runtimeItems: runtimeItemList.length,
    runtimeItemsInLandscape,
    runtimeItemsMissingFromLandscape: runtimeGoalIdsMissingFromLandscape.length,
    runtimeGoalsWithClassicSourceRationale: runtimeItemList.filter(hasClassicRoute).length,
    runtimeGoalsWithMemSparqlConsistentRoute: runtimeItemList.filter(hasConsistentMemRoute).length,
    relevantLeavesWithClassicSourceRationale: relevantLeafRows.filter((row) => row.classicSourceRoute).length,
    relevantLeavesWithMemSparqlConsistentRoute: relevantLeafRows.filter((row) => row.memSparqlStatus === 'mem_sparql_consistent').length,
    relevantLeavesMissingRuntimeSourceRationale: relevantLeafRows.filter((row) => row.classification === 'missing_runtime_leaf').length,
    relevantLeavesWithRuntimeClassicGap: relevantLeafRows.filter((row) => row.classification === 'runtime_classic_gap').length,
    clustersWithDirectRuntimeSourceRationale: clusterRows.filter((row) => row.classicSourceRoute).length,
    clustersWithoutDirectRuntimeSourceRationale: clusterRows.filter((row) => !row.classicSourceRoute).length,
    containsRelationRationalesImplemented: 0,
    requiresRelationRationalesImplemented: 0,
    relevantLeafClassicCoveragePercent: percent(
      relevantLeafRows.filter((row) => row.classicSourceRoute).length,
      relevantLeafRows.length,
    ),
    relevantLeafMemCoveragePercent: percent(
      relevantLeafRows.filter((row) => row.memSparqlStatus === 'mem_sparql_consistent').length,
      relevantLeafRows.length,
    ),
  }

  return {
    schemaVersion: 1,
    generatedAt,
    generator: 'app/scripts/reportGoalSourceRationaleCoverage.ts',
    request: {
      landscapePath: args.landscapePath,
      runtimeIndexPath: args.runtimeIndexPath,
    },
    sourceIndex: {
      generatedAt: asString(runtimeIndex.generatedAt),
      generator: asString(runtimeIndex.generator),
      summary: runtimeIndex.summary ?? null,
      request: runtimeIndex.request ?? null,
    },
    summary,
    buckets: {
      byPhase: bucketRows(rows, 'phase'),
      byArea: bucketRows(rows, 'area'),
    },
    anomalies: {
      runtimeGoalIdsMissingFromLandscape,
    },
    workQueue: {
      missingRelevantLeafGoals: relevantLeafRows.filter((row) => row.classification === 'missing_runtime_leaf'),
      relevantLeafMemSparqlReviewNeededGoals: relevantLeafRows.filter((row) =>
        row.classicSourceRoute && row.memSparqlStatus !== 'mem_sparql_consistent'),
      clusterDirectRationalePendingGoals: clusterRows.filter((row) => !row.classicSourceRoute),
      relationRationales: {
        containsRelationsPending: summary.containsRelations - summary.containsRelationRationalesImplemented,
        requiresRelationsPending: summary.requiresRelations - summary.requiresRelationRationalesImplemented,
      },
    },
    rows,
  }
}

function existingGeneratedAt(path: string): string | null {
  if (!existsSync(resolveRepoPath(path))) return null
  try {
    const current = readJson<{ generatedAt?: unknown }>(path)
    return asString(current.generatedAt)
  } catch {
    return null
  }
}

function markdownCell(value: string | number): string {
  return String(value)
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, '<br>')
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>): string[] {
  return [
    `| ${headers.map(markdownCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownCell).join(' | ')} |`),
  ]
}

function formatPercent(count: number, total: number): string {
  return `${percent(count, total).toFixed(1)}%`
}

function goalLabel(row: CoverageGoalRow): string {
  return row.shortKey === null ? row.title : `${row.title} (${row.shortKey})`
}

function pathLabel(row: CoverageGoalRow): string {
  return row.pathTitles.join(' > ')
}

function pushGeneratedMarkdownNotice(lines: string[]): void {
  lines.push('> Generated artifact. Do not edit manually.')
  lines.push('>')
  lines.push('> Generated by: `app/scripts/reportGoalSourceRationaleCoverage.ts`')
  lines.push('> Regenerate with: `cd app && npm run quality:goal-source-rationale-coverage`')
  lines.push('> Source of truth: `app/scripts/reportGoalSourceRationaleCoverage.ts`')
  lines.push(`> Source of truth: \`${defaultLandscapePath}\``)
  lines.push(`> Source of truth: \`${defaultRuntimeIndexPath}\``)
  lines.push('')
}

function renderCoverageBuckets(title: string, buckets: CoverageBucket[]): string[] {
  const lines: string[] = [title, '']
  lines.push(...markdownTable(
    ['Bucket', 'Relevant leaves', 'Classic', 'MEM consistent', 'Missing'],
    buckets.slice(0, 20).map((bucket) => [
      bucket.key,
      bucket.totalRelevantLeaves,
      `${bucket.leavesWithClassicSourceRationale} (${formatPercent(bucket.leavesWithClassicSourceRationale, bucket.totalRelevantLeaves)})`,
      `${bucket.leavesWithMemSparqlConsistentRoute} (${formatPercent(bucket.leavesWithMemSparqlConsistentRoute, bucket.totalRelevantLeaves)})`,
      bucket.missingRelevantLeaves,
    ]),
  ))
  lines.push('')
  return lines
}

function renderGoalQueue(title: string, rows: CoverageGoalRow[], maxRows: number): string[] {
  const lines: string[] = [title, '']
  if (rows.length === 0) {
    lines.push('Keine Eintraege.')
    lines.push('')
    return lines
  }
  lines.push(...markdownTable(
    ['Goal', 'Phase', 'Area', 'Topic', 'Path'],
    rows.slice(0, maxRows).map((row) => [
      goalLabel(row),
      row.phase,
      row.area,
      row.topicCode ?? '-',
      pathLabel(row),
    ]),
  ))
  if (rows.length > maxRows) {
    lines.push('')
    lines.push(`Weitere ${rows.length - maxRows} Eintraege stehen in der JSON-Begleitdatei.`)
  }
  lines.push('')
  return lines
}

function renderMarkdown(report: CoverageReport): string {
  const { summary } = report
  const lines: string[] = ['# Goal Source Rationale Coverage', '']
  pushGeneratedMarkdownNotice(lines)
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push('')
  lines.push('Dieser Report misst, wie weit die oeffentliche Mathematik-Quellenbegruendung schon skaliert. Er ist ein Status- und Arbeitslisten-Artefakt: offene Eintraege blockieren die Runtime nicht, machen aber sichtbar, welche Ziel- und Relationstexte noch aufgebaut werden muessen.')
  lines.push('')
  lines.push('## Current Coverage')
  lines.push('')
  lines.push(...markdownTable(
    ['Metric', 'Value'],
    [
      ['Alle Mathematik-Ziele', summary.totalGoals],
      ['Atomare Blattleernziele', summary.atomicLeaves],
      ['Davon relevant fuer Quellenbegruendung', summary.relevantAtomicLeaves],
      ['Memory-/Nicht-Content-Blattziele', summary.memoryOrNonContentLeaves],
      ['Clusterziele', summary.clusters],
      ['Runtime-Quellenbegruendungen', summary.runtimeItems],
      ['Runtime-Ziele mit klassischem Quellenweg', summary.runtimeGoalsWithClassicSourceRationale],
      ['Runtime-Ziele mit MEM/FWU-konsistenter Route', summary.runtimeGoalsWithMemSparqlConsistentRoute],
      [
        'Relevante Blattziele mit klassischem Quellenweg',
        `${summary.relevantLeavesWithClassicSourceRationale}/${summary.relevantAtomicLeaves} (${summary.relevantLeafClassicCoveragePercent.toFixed(1)}%)`,
      ],
      [
        'Relevante Blattziele mit MEM/FWU-konsistenter Route',
        `${summary.relevantLeavesWithMemSparqlConsistentRoute}/${summary.relevantAtomicLeaves} (${summary.relevantLeafMemCoveragePercent.toFixed(1)}%)`,
      ],
      ['Relevante Blattziele ohne Runtime-Quellenbegruendung', summary.relevantLeavesMissingRuntimeSourceRationale],
      ['Relevante Blattziele mit Runtime-Classic-Gap', summary.relevantLeavesWithRuntimeClassicGap],
      ['Cluster mit direkter Runtime-Quellenbegruendung', `${summary.clustersWithDirectRuntimeSourceRationale}/${summary.clusters}`],
      ['Cluster ohne direkte Runtime-Quellenbegruendung', summary.clustersWithoutDirectRuntimeSourceRationale],
      ['contains-Relationen mit Begruendungstext', `${summary.containsRelationRationalesImplemented}/${summary.containsRelations}`],
      ['requires-Relationen mit Begruendungstext', `${summary.requiresRelationRationalesImplemented}/${summary.requiresRelations}`],
    ],
  ))
  lines.push('')
  lines.push('## Interpretation')
  lines.push('')
  lines.push('- Die Runtime-Datei enthaelt aktuell direkte Quellenbegruendungen fuer alle bereits klassisch belegten relevanten Mathematik-Blattziele. Sie deckt Zielknoten ab, aber noch keine `requires`- oder `contains`-Relationstexte.')
  lines.push(`- Die ${summary.runtimeItems} Runtime-Eintraege sind der online ausgelieferte, gap-freie Ausschnitt. Die fehlenden relevanten Blattziele bleiben als nicht-blockierende Arbeitsliste im All-Relevant-Report sichtbar.`)
  lines.push('- MEM/FWU-SPARQL ist nur dort als konsistent gezaehlt, wo der klassische Quellenweg bereits auf einen passenden MEM-Erwartungstext gematcht werden konnte.')
  lines.push('')
  lines.push(...renderCoverageBuckets('## Gaps By Phase', report.buckets.byPhase))
  lines.push(...renderCoverageBuckets('## Gaps By Area', report.buckets.byArea))
  lines.push('## Next Work Queue')
  lines.push('')
  lines.push('1. Den All-Relevant-JSON-Report regelmaessig regenerieren: `cd app && npm run quality:goal-source-rationales:math-all-relevant`. Er enthaelt alle fachlich relevanten Blattziele und rendert fehlende klassische Quellenwege als Gap-Eintraege.')
  lines.push('2. Fuer fehlende Blattziele klassische Source-Extraction-/Mapping-Belege ergaenzen oder bestehende Belege auf die kanonischen Ziel-IDs mappen.')
  lines.push('3. Clustertexte als aggregierte Quellenbegruendung aufbauen: direkte Cluster-Belege nutzen, sonst aus den belegten Kindzielen ableiten.')
  lines.push('4. Relationstexte fuer `requires` und `contains` separat modellieren, weil sie keine Zielbegruendung, sondern eine Entstehungs- bzw. Strukturbegruendung brauchen.')
  lines.push('5. MEM/FWU-SPARQL-Abgleich aus dem Bayern-PoC auf weitere verfuegbare MEM-Lehrplanbereiche erweitern, sobald dort abrufbare Erwartungstexte stabil sind.')
  lines.push('')
  lines.push(...renderGoalQueue('## Missing Relevant Leaf Goals', report.workQueue.missingRelevantLeafGoals, 80))
  lines.push(...renderGoalQueue('## MEM/FWU Review Needed For Covered Leaves', report.workQueue.relevantLeafMemSparqlReviewNeededGoals, 80))
  lines.push(...renderGoalQueue('## Cluster Direct Rationale Pending', report.workQueue.clusterDirectRationalePendingGoals, 60))
  if (report.anomalies.runtimeGoalIdsMissingFromLandscape.length > 0) {
    lines.push('## Anomalies')
    lines.push('')
    lines.push('Runtime-Ziel-IDs ohne aktuellen Landschaftsknoten:')
    report.anomalies.runtimeGoalIdsMissingFromLandscape.forEach((goalId) => {
      lines.push(`- ${goalId}`)
    })
    lines.push('')
  }
  lines.push('## Sources')
  lines.push('')
  lines.push(`- Landscape: \`${report.request.landscapePath}\``)
  lines.push(`- Runtime index: \`${report.request.runtimeIndexPath}\``)
  lines.push(`- Runtime index generated: ${report.sourceIndex.generatedAt ?? 'unknown'}`)
  lines.push('')
  return `${lines.join('\n')}\n`
}

function writeOrCheck(args: Args, report: CoverageReport): void {
  const renderedJson = `${JSON.stringify(report, null, 2)}\n`
  const renderedMarkdown = renderMarkdown(report)
  if (args.checkMode) {
    const failures: string[] = []
    const jsonPath = resolveRepoPath(args.outputJsonPath)
    const markdownPath = resolveRepoPath(args.outputMarkdownPath)
    if (!existsSync(jsonPath)) {
      failures.push(`${args.outputJsonPath} does not exist. Run: cd app && npm run quality:goal-source-rationale-coverage`)
    } else if (readFileSync(jsonPath, 'utf8') !== renderedJson) {
      failures.push(`${args.outputJsonPath} is stale. Run: cd app && npm run quality:goal-source-rationale-coverage`)
    }
    if (!existsSync(markdownPath)) {
      failures.push(`${args.outputMarkdownPath} does not exist. Run: cd app && npm run quality:goal-source-rationale-coverage`)
    } else if (readFileSync(markdownPath, 'utf8') !== renderedMarkdown) {
      failures.push(`${args.outputMarkdownPath} is stale. Run: cd app && npm run quality:goal-source-rationale-coverage`)
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
  console.log(`Wrote ${repoRelative(resolveRepoPath(args.outputJsonPath))}`)
  console.log(`Wrote ${repoRelative(resolveRepoPath(args.outputMarkdownPath))}`)
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const generatedAt = args.checkMode
    ? existingGeneratedAt(args.outputJsonPath) ?? new Date().toISOString()
    : new Date().toISOString()
  const report = buildReport(args, generatedAt)
  writeOrCheck(args, report)
}

main()
