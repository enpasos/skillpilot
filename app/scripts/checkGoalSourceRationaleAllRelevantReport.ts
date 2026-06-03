import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'

interface SourceRationaleItem {
  goal?: {
    id?: unknown
  }
  sourceRationaleStatus?: unknown
  classicSourceRoute?: unknown
}

interface SourceRationaleReport {
  request?: {
    goalSelection?: unknown
    landscapePath?: unknown
    jurisdiction?: unknown
  }
  summary?: {
    requestedGoals?: unknown
    resolvedGoals?: unknown
    goalsWithClassicSourceRoute?: unknown
    goalsWithoutClassicSourceRoute?: unknown
  }
  items?: unknown
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const reportPath = 'docs/qa-ci/status/goal-source-rationales-math-all-relevant.json'

function readJson<T>(repoPath: string): T {
  return JSON.parse(readFileSync(resolve(repoRoot, repoPath), 'utf8')) as T
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
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

function relevantLeafGoalIds(landscape: LearningLandscape): string[] {
  return landscape.goals
    .filter((goal) => !isClusterGoal(goal) && !isMemoryOrNonContentLeaf(goal))
    .map((goal) => goal.id)
    .sort((left, right) => left.localeCompare(right, 'de'))
}

function sourceRationaleItems(report: SourceRationaleReport): SourceRationaleItem[] {
  return Array.isArray(report.items)
    ? report.items.filter((item): item is SourceRationaleItem => typeof item === 'object' && item !== null)
    : []
}

function itemGoalId(item: SourceRationaleItem): string | null {
  return typeof item.goal?.id === 'string' && item.goal.id.trim().length > 0 ? item.goal.id : null
}

function hasClassicRoute(item: SourceRationaleItem): boolean {
  return item.classicSourceRoute !== null
    && item.classicSourceRoute !== undefined
    && item.sourceRationaleStatus !== 'classic_source_gap'
}

const landscape = readJson<LearningLandscape>(landscapePath)
const report = readJson<SourceRationaleReport>(reportPath)
const expectedGoalIds = relevantLeafGoalIds(landscape)
const expectedGoalIdSet = new Set(expectedGoalIds)
const items = sourceRationaleItems(report)
const itemGoalIds = items.map(itemGoalId)
const itemGoalIdSet = new Set(itemGoalIds.filter((goalId): goalId is string => goalId !== null))
const failures: string[] = []

if (report.request?.goalSelection !== 'all-relevant-leaves') {
  failures.push(`${reportPath}: request.goalSelection must be all-relevant-leaves`)
}
if (report.request?.landscapePath !== landscapePath) {
  failures.push(`${reportPath}: request.landscapePath must be ${landscapePath}`)
}

const requestedGoals = asNumber(report.summary?.requestedGoals)
const resolvedGoals = asNumber(report.summary?.resolvedGoals)
if (requestedGoals !== expectedGoalIds.length) {
  failures.push(`${reportPath}: summary.requestedGoals=${requestedGoals ?? 'missing'} but expected ${expectedGoalIds.length}`)
}
if (resolvedGoals !== expectedGoalIds.length) {
  failures.push(`${reportPath}: summary.resolvedGoals=${resolvedGoals ?? 'missing'} but expected ${expectedGoalIds.length}`)
}
if (items.length !== expectedGoalIds.length) {
  failures.push(`${reportPath}: items.length=${items.length} but expected ${expectedGoalIds.length}`)
}

const duplicateGoalIds = Array.from(itemGoalIdSet)
  .filter((goalId) => itemGoalIds.filter((candidate) => candidate === goalId).length > 1)
  .sort((left, right) => left.localeCompare(right, 'de'))
if (duplicateGoalIds.length > 0) {
  failures.push(`${reportPath}: duplicate goal IDs: ${duplicateGoalIds.slice(0, 10).join(', ')}`)
}

const missingGoalIds = expectedGoalIds.filter((goalId) => !itemGoalIdSet.has(goalId))
if (missingGoalIds.length > 0) {
  failures.push(`${reportPath}: missing relevant goal IDs: ${missingGoalIds.slice(0, 10).join(', ')}`)
}

const unexpectedGoalIds = Array.from(itemGoalIdSet)
  .filter((goalId) => !expectedGoalIdSet.has(goalId))
  .sort((left, right) => left.localeCompare(right, 'de'))
if (unexpectedGoalIds.length > 0) {
  failures.push(`${reportPath}: unexpected goal IDs: ${unexpectedGoalIds.slice(0, 10).join(', ')}`)
}

const malformedItems = items
  .filter((item) => {
    if (itemGoalId(item) === null) return true
    if (typeof item.sourceRationaleStatus !== 'string') return true
    return !hasClassicRoute(item) && item.sourceRationaleStatus !== 'classic_source_gap'
  })
  .map((item) => itemGoalId(item) ?? 'missing-goal-id')
if (malformedItems.length > 0) {
  failures.push(`${reportPath}: malformed source-rationale items: ${malformedItems.slice(0, 10).join(', ')}`)
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

const goalsWithClassicSourceRoute = items.filter(hasClassicRoute).length
const goalsWithoutClassicSourceRoute = items.length - goalsWithClassicSourceRoute
console.log(
  `All-relevant goal source-rationale report check passed. `
    + `items=${items.length} classic=${goalsWithClassicSourceRoute} gaps=${goalsWithoutClassicSourceRoute}`,
)
