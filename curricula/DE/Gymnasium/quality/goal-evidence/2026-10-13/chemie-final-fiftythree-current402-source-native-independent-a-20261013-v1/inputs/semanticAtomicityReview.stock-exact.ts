import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'

type ReviewStatus = 'atomic' | 'needs_developer_review' | 'non_atomic'

interface ReviewConfig {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
  scope: {
    label: string
    rootGoalIds?: string[]
    leafGoalIds?: string[]
  }
}

interface ReviewRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: ReviewStatus
  semanticAtomic: boolean | null
  reviewedAt: string
  reviewer: string
  reason: string
  suggestedAction?: string
  suggestedSplit?: string[]
}

interface Args {
  configPath: string
  mode: 'report' | 'check'
  writeFingerprints: boolean
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const defaultConfigPath = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-j8-linear-functions-pilot.config.json'
const statusOrder: ReviewStatus[] = ['atomic', 'needs_developer_review', 'non_atomic']

function parseArgs(argv: string[]): Args {
  const args: Args = {
    configPath: defaultConfigPath,
    mode: 'report',
    writeFingerprints: false,
  }

  argv.forEach((arg) => {
    if (arg.startsWith('--config=')) {
      args.configPath = arg.slice('--config='.length)
    } else if (arg === '--mode=check') {
      args.mode = 'check'
    } else if (arg === '--mode=report') {
      args.mode = 'report'
    } else if (arg === '--write-fingerprints') {
      args.writeFingerprints = true
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  })

  return args
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function resolveRepoPath(path: string): string {
  return resolve(repoRoot, path)
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function getSemanticPayload(goal: LearningGoal, ruleVersion: string) {
  return {
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText((goal as { titleEn?: string }).titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText((goal as { descriptionEn?: string }).descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText((goal as { nodeKind?: string }).nodeKind),
  }
}

function fingerprintGoal(goal: LearningGoal, ruleVersion: string): string {
  const payload = stableJson(getSemanticPayload(goal, ruleVersion))
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function isLeaf(goal: LearningGoal): boolean {
  return !Array.isArray(goal.contains) || goal.contains.length === 0
}

function isSemanticAtomicityRelevantGoal(goal: LearningGoal): boolean {
  const tags = new Set(goal.tags ?? [])
  if (tags.has('Practice') || tags.has('Assessment')) return false
  if (tags.has('Motivation') || tags.has('Orientation')) return false
  if (tags.has('memorization')) return false
  if ((goal.tags ?? []).some((tag) => tag.startsWith('srs-deck:'))) return false
  if ((goal as { examData?: unknown }).examData) return false
  return true
}

function collectScopeGoalIds(rootGoalIds: string[], goalById: Map<string, LearningGoal>): Set<string> {
  const result = new Set<string>()
  const visiting = new Set<string>()

  const visit = (goalId: string) => {
    if (result.has(goalId) || visiting.has(goalId)) return
    const goal = goalById.get(goalId)
    if (!goal) return
    visiting.add(goalId)
    result.add(goalId)
    for (const childId of goal.contains ?? []) {
      visit(childId)
    }
    visiting.delete(goalId)
  }

  rootGoalIds.forEach(visit)
  return result
}

function collectConfiguredScopeGoalIds(config: ReviewConfig, goalById: Map<string, LearningGoal>): Set<string> {
  if (Array.isArray(config.scope.leafGoalIds) && config.scope.leafGoalIds.length > 0) {
    return new Set(config.scope.leafGoalIds)
  }
  return collectScopeGoalIds(config.scope.rootGoalIds ?? [], goalById)
}

function parseReviewRecords(path: string): { records: ReviewRecord[]; errors: string[] } {
  if (!existsSync(path)) {
    return { records: [], errors: [`Review file missing: ${path}`] }
  }

  const errors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .flatMap(({ line, lineNumber }) => {
      try {
        const record = JSON.parse(line) as ReviewRecord
        return [record]
      } catch (error) {
        errors.push(`Line ${lineNumber}: invalid JSON (${(error as Error).message})`)
        return []
      }
    })

  return { records, errors }
}

function validateRecordShape(record: ReviewRecord, config: ReviewConfig): string[] {
  const errors: string[] = []
  if (record.schemaVersion !== 1) errors.push(`${record.goalId}: schemaVersion must be 1`)
  if (record.reviewId !== config.reviewId) errors.push(`${record.goalId}: reviewId does not match ${config.reviewId}`)
  if (record.ruleVersion !== config.ruleVersion) errors.push(`${record.goalId}: ruleVersion does not match ${config.ruleVersion}`)
  if (record.landscapeId !== config.landscapeId) errors.push(`${record.goalId}: landscapeId does not match ${config.landscapeId}`)
  if (!statusOrder.includes(record.status)) errors.push(`${record.goalId}: status ${String(record.status)} is not supported`)
  if (record.status === 'atomic' && record.semanticAtomic !== true) {
    errors.push(`${record.goalId}: status atomic requires semanticAtomic true`)
  }
  if (record.status === 'non_atomic' && record.semanticAtomic !== false) {
    errors.push(`${record.goalId}: status non_atomic requires semanticAtomic false`)
  }
  if (record.status === 'needs_developer_review' && record.semanticAtomic !== null) {
    errors.push(`${record.goalId}: status needs_developer_review requires semanticAtomic null`)
  }
  if (!record.reason?.trim()) errors.push(`${record.goalId}: reason is required`)
  return errors
}

function formatGoal(goal: LearningGoal | undefined, goalId: string): string {
  return goal ? `${goal.title} [${goalId}]` : goalId
}

function serializeRecords(records: ReviewRecord[]): string {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const config = loadJson<ReviewConfig>(resolveRepoPath(args.configPath))
  const landscape = loadJson<SkillLandscape>(resolveRepoPath(config.landscapePath))
  if ((landscape.landscapeId ?? (landscape as { id?: string }).id) !== config.landscapeId) {
    throw new Error(`Configured landscapeId ${config.landscapeId} does not match ${config.landscapePath}`)
  }

  const goalById = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const scopeGoalIds = collectConfiguredScopeGoalIds(config, goalById)
  const leafGoals = Array.from(scopeGoalIds)
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is LearningGoal => !!goal && isLeaf(goal) && isSemanticAtomicityRelevantGoal(goal))
    .sort((left, right) => left.title.localeCompare(right.title, 'de'))
  const leafGoalIds = new Set(leafGoals.map((goal) => goal.id))
  const fingerprintsByGoalId = new Map(leafGoals.map((goal) => [goal.id, fingerprintGoal(goal, config.ruleVersion)]))

  const reviewPath = resolveRepoPath(config.reviewPath)
  const { records, errors: parseErrors } = parseReviewRecords(reviewPath)
  const shapeErrors = records.flatMap((record) => validateRecordShape(record, config))
  const duplicateGoalIds = records
    .map((record) => record.goalId)
    .filter((goalId, index, all) => all.indexOf(goalId) !== index)
  const recordsByGoalId = new Map(records.map((record) => [record.goalId, record]))

  const missingRecords = leafGoals.filter((goal) => !recordsByGoalId.has(goal.id))
  const staleRecords = leafGoals.filter((goal) => {
    const record = recordsByGoalId.get(goal.id)
    const fingerprint = fingerprintsByGoalId.get(goal.id)
    return !!record && !!fingerprint && record.fingerprint !== fingerprint
  })
  const obsoleteRecords = records.filter((record) => !leafGoalIds.has(record.goalId))
  const currentRecords = leafGoals
    .map((goal) => recordsByGoalId.get(goal.id))
    .filter((record): record is ReviewRecord => !!record)
    .filter((record) => record.fingerprint === fingerprintsByGoalId.get(record.goalId))

  const byStatus = new Map<ReviewStatus, ReviewRecord[]>(
    statusOrder.map((status) => [status, currentRecords.filter((record) => record.status === status)]),
  )

  if (args.writeFingerprints) {
    const updatedRecords = records.map((record) => {
      const nextFingerprint = fingerprintsByGoalId.get(record.goalId)
      return nextFingerprint ? { ...record, fingerprint: nextFingerprint } : record
    })
    writeFileSync(reviewPath, serializeRecords(updatedRecords), 'utf8')
    console.log(`Updated fingerprints in ${config.reviewPath}`)
    return
  }

  console.log(`# Semantic Atomicity Review: ${config.reviewId}`)
  console.log(`Scope: ${config.scope.label}`)
  console.log(`Rule: ${config.ruleVersion}`)
  console.log(`Content leaf goals in scope: ${leafGoals.length}`)
  console.log(`Current reviewed atomic: ${byStatus.get('atomic')?.length ?? 0}`)
  console.log(`Current needs developer review: ${byStatus.get('needs_developer_review')?.length ?? 0}`)
  console.log(`Current non-atomic: ${byStatus.get('non_atomic')?.length ?? 0}`)
  console.log(`Missing review records: ${missingRecords.length}`)
  console.log(`Stale review records: ${staleRecords.length}`)
  console.log(`Obsolete review records: ${obsoleteRecords.length}`)

  const printGoalList = (title: string, goals: LearningGoal[]) => {
    if (goals.length === 0) return
    console.log(`\n${title}`)
    goals.forEach((goal) => {
      console.log(`- ${formatGoal(goal, goal.id)}`)
    })
  }

  const printRecordList = (title: string, rows: ReviewRecord[]) => {
    if (rows.length === 0) return
    console.log(`\n${title}`)
    rows.forEach((record) => {
      console.log(`- ${formatGoal(goalById.get(record.goalId), record.goalId)}: ${record.reason}`)
    })
  }

  printGoalList('Missing review records', missingRecords)
  printGoalList('Stale review records', staleRecords)
  printRecordList('Developer review queue', byStatus.get('needs_developer_review') ?? [])
  printRecordList('Known non-atomic leaves', byStatus.get('non_atomic') ?? [])
  printRecordList('Obsolete review records', obsoleteRecords)

  const blockingErrors = [
    ...parseErrors,
    ...shapeErrors,
    ...duplicateGoalIds.map((goalId) => `Duplicate review record for ${goalId}`),
    ...missingRecords.map((goal) => `Missing review record for ${goal.id}`),
    ...staleRecords.map((goal) => `Stale review record for ${goal.id}`),
  ]

  if (blockingErrors.length > 0) {
    console.log('\nBlocking issues')
    blockingErrors.forEach((issue) => console.log(`- ${issue}`))
  }

  if (args.mode === 'check' && blockingErrors.length > 0) {
    process.exitCode = 1
  }
}

main()
