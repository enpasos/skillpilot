import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, LearningLandscape } from '../src/landscapeTypes'

type ReviewStatus = 'no_memory_needed' | 'memory_required' | 'needs_developer_review'
type CardReviewStatus = 'kept' | 'remove' | 'needs_developer_review'

interface ReviewConfig {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
  cardReviewPath?: string
  reportPath?: string
  visibilityScopes?: MemoryVisibilityScope[]
  scope: {
    label: string
    rootGoalIds?: string[]
    leafGoalIds?: string[]
  }
}

interface MemoryVisibilityScope {
  label: string
  viewPath: string
}

interface ReviewRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: ReviewStatus
  memoryUseful: boolean | null
  memoryGoalIds?: string[]
  deckIds?: string[]
  reviewedAt: string
  reviewer: string
  reason: string
}

interface CardReviewRecord {
  schemaVersion: 1
  reviewId: string
  ruleVersion: string
  landscapeId: string
  deckId: string
  cardId: string
  fingerprint: string
  status: CardReviewStatus
  necessary: boolean | null
  originGoalIds?: string[]
  reviewedAt: string
  reviewer: string
  reason: string
}

interface Args {
  configPath: string
  mode: 'report' | 'check' | 'bootstrap'
  writeFingerprints: boolean
  writeReport: boolean
  reportPath?: string
}

interface MemoryDeckEvidence {
  memoryGoalIds: Set<string>
  deckIdsByMemoryGoalId: Map<string, Set<string>>
  knownDeckIds: Set<string>
  deckFiles: number
  cardRows: number
  primaryCards: MemoryDeckCard[]
  errors: string[]
}

interface MemoryDeckCard {
  deckId: string
  cardId: string
  source: string
  front: string
  back: string
  category: string
  tags: string[]
}

interface MemoryVisibilityReport {
  scopes: Array<{
    label: string
    viewPath: string
    visibleGoals: number
    visibleMemoryGoals: number
    checkedMemoryRequiredGoals: number
    missingVisibleMemoryGoals: number
  }>
  checkedMemoryRequiredGoals: number
  missingVisibleMemoryGoals: number
  errors: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const defaultConfigPath = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.config.json'
const statusOrder: ReviewStatus[] = ['no_memory_needed', 'memory_required', 'needs_developer_review']
const cardStatusOrder: CardReviewStatus[] = ['kept', 'remove', 'needs_developer_review']

function parseArgs(argv: string[]): Args {
  const args: Args = {
    configPath: defaultConfigPath,
    mode: 'report',
    writeFingerprints: false,
    writeReport: false,
  }

  argv.forEach((arg) => {
    if (arg.startsWith('--config=')) {
      args.configPath = arg.slice('--config='.length)
    } else if (arg === '--mode=check') {
      args.mode = 'check'
    } else if (arg === '--mode=report') {
      args.mode = 'report'
    } else if (arg === '--mode=bootstrap') {
      args.mode = 'bootstrap'
    } else if (arg === '--write-fingerprints') {
      args.writeFingerprints = true
    } else if (arg === '--write-report') {
      args.writeReport = true
    } else if (arg.startsWith('--report-path=')) {
      args.reportPath = arg.slice('--report-path='.length)
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

function fingerprintGoal(goal: LearningGoal, ruleVersion: string): string {
  const payload = stableJson({
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
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function fingerprintMemoryCard(card: MemoryDeckCard, ruleVersion: string): string {
  const payload = stableJson({
    ruleVersion,
    deckId: card.deckId,
    cardId: card.cardId,
    front: card.front,
    back: card.back,
    category: card.category,
    tags: card.tags,
  })
  return `sha256:${createHash('sha256').update(payload).digest('hex')}`
}

function memoryCardKey(deckId: string, cardId: string): string {
  return `${deckId}::${cardId}`
}

function isLeaf(goal: LearningGoal): boolean {
  return !Array.isArray(goal.contains) || goal.contains.length === 0
}

function isMemoryGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  return goal.nodeKind === 'memory'
    || tags.includes('memorization')
    || tags.some((tag) => tag.startsWith('srs-deck:'))
}

function isReviewRelevantGoal(goal: LearningGoal): boolean {
  const tags = new Set(goal.tags ?? [])
  if (tags.has('Practice') || tags.has('Assessment')) return false
  if (tags.has('Motivation') || tags.has('Orientation')) return false
  if (isMemoryGoal(goal)) return false
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
    for (const childId of goal.contains ?? []) visit(childId)
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

function collectCompositionViewVisibleGoalIds(
  viewPath: string,
  goalById: Map<string, LearningGoal>,
): { visibleGoalIds: Set<string>; errors: string[] } {
  const errors: string[] = []
  const visibleGoalIds = new Set<string>()
  const absoluteViewPath = resolveRepoPath(viewPath)
  if (!existsSync(absoluteViewPath)) {
    return {
      visibleGoalIds,
      errors: [`Composition view missing: ${viewPath}`],
    }
  }

  const addSubtree = (goalId: string, visiting = new Set<string>()) => {
    if (visibleGoalIds.has(goalId) || visiting.has(goalId)) return
    const goal = goalById.get(goalId)
    if (!goal) {
      errors.push(`${viewPath}: references missing goal ${goalId}`)
      return
    }
    visiting.add(goalId)
    visibleGoalIds.add(goalId)
    for (const childId of goal.contains ?? []) addSubtree(childId, visiting)
    visiting.delete(goalId)
  }

  const visitNode = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const row = node as { kind?: unknown; goalId?: unknown; children?: unknown }
    if (row.kind === 'canonicalSubtree') {
      if (typeof row.goalId === 'string' && row.goalId.trim()) {
        addSubtree(row.goalId)
      } else {
        errors.push(`${viewPath}: canonicalSubtree without goalId`)
      }
      return
    }
    if (row.kind === 'goalEntry') {
      if (typeof row.goalId === 'string' && row.goalId.trim()) {
        if (goalById.has(row.goalId)) {
          visibleGoalIds.add(row.goalId)
        } else {
          errors.push(`${viewPath}: goalEntry references missing goal ${row.goalId}`)
        }
      } else {
        errors.push(`${viewPath}: goalEntry without goalId`)
      }
      return
    }
    if (Array.isArray(row.children)) {
      row.children.forEach(visitNode)
    }
  }

  try {
    const parsed = loadJson<{ rootNodes?: unknown[] }>(absoluteViewPath)
    if (!Array.isArray(parsed.rootNodes)) {
      errors.push(`${viewPath}: rootNodes must be an array`)
      return { visibleGoalIds, errors }
    }
    parsed.rootNodes.forEach(visitNode)
  } catch (error) {
    errors.push(`${viewPath}: cannot parse composition view (${(error as Error).message})`)
  }

  return { visibleGoalIds, errors }
}

function collectMemoryVisibilityReport(
  config: ReviewConfig,
  goalById: Map<string, LearningGoal>,
  currentRecords: ReviewRecord[],
): MemoryVisibilityReport {
  const report: MemoryVisibilityReport = {
    scopes: [],
    checkedMemoryRequiredGoals: 0,
    missingVisibleMemoryGoals: 0,
    errors: [],
  }

  ;(config.visibilityScopes ?? []).forEach((scope) => {
    const { visibleGoalIds, errors } = collectCompositionViewVisibleGoalIds(scope.viewPath, goalById)
    const visibleMemoryGoalIds = new Set(Array.from(visibleGoalIds)
      .filter((goalId) => {
        const goal = goalById.get(goalId)
        return !!goal && isMemoryGoal(goal)
      }))
    const memoryRequiredInView = currentRecords
      .filter((record) => record.status === 'memory_required')
      .filter((record) => visibleGoalIds.has(record.goalId))
    const missingVisibleMemoryGoalRecords = memoryRequiredInView
      .filter((record) => !(record.memoryGoalIds ?? []).some((memoryGoalId) => visibleMemoryGoalIds.has(memoryGoalId)))

    errors.forEach((error) => report.errors.push(error))
    missingVisibleMemoryGoalRecords.forEach((record) => {
      report.errors.push(
        `${scope.label}: ${formatGoal(goalById.get(record.goalId), record.goalId)} is visible, but none of its referenced memoryGoalIds is visible in ${scope.viewPath}`,
      )
    })

    report.checkedMemoryRequiredGoals += memoryRequiredInView.length
    report.missingVisibleMemoryGoals += missingVisibleMemoryGoalRecords.length
    report.scopes.push({
      label: scope.label,
      viewPath: scope.viewPath,
      visibleGoals: visibleGoalIds.size,
      visibleMemoryGoals: visibleMemoryGoalIds.size,
      checkedMemoryRequiredGoals: memoryRequiredInView.length,
      missingVisibleMemoryGoals: missingVisibleMemoryGoalRecords.length,
    })
  })

  return report
}

function parseReviewRecords(path: string): { records: ReviewRecord[]; errors: string[] } {
  if (!existsSync(path)) return { records: [], errors: [`Review file missing: ${path}`] }

  const errors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .flatMap(({ line, lineNumber }) => {
      try {
        return [JSON.parse(line) as ReviewRecord]
      } catch (error) {
        errors.push(`Line ${lineNumber}: invalid JSON (${(error as Error).message})`)
        return []
      }
    })
  return { records, errors }
}

function parseCardReviewRecords(path: string): { records: CardReviewRecord[]; errors: string[] } {
  if (!existsSync(path)) return { records: [], errors: [`Card review file missing: ${path}`] }

  const errors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .flatMap(({ line, lineNumber }) => {
      try {
        return [JSON.parse(line) as CardReviewRecord]
      } catch (error) {
        errors.push(`Line ${lineNumber}: invalid JSON (${(error as Error).message})`)
        return []
      }
    })
  return { records, errors }
}

function readExistingReviewRecords(path: string): ReviewRecord[] {
  return existsSync(path) ? parseReviewRecords(path).records : []
}

function readExistingCardReviewRecords(path: string): CardReviewRecord[] {
  return existsSync(path) ? parseCardReviewRecords(path).records : []
}

function memoryDeckIdsFromGoal(goal: LearningGoal): string[] {
  return (goal.tags ?? [])
    .filter((tag) => tag.startsWith('srs-deck:'))
    .map((tag) => tag.slice('srs-deck:'.length))
    .filter(Boolean)
}

function memoryVocabularySources(goal: LearningGoal): string[] {
  const extendedData = (goal as { extendedData?: Record<string, unknown> }).extendedData
  if (!extendedData) return []
  return [extendedData.vocabularySource, extendedData.vocabularySourceEn]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
}

function resolveVocabularySourcePath(source: string): string {
  if (source.startsWith('/data/')) {
    return resolve(repoRoot, 'app/public', source.replace(/^\//, ''))
  }
  return resolve(repoRoot, source.replace(/^\//, ''))
}

function isPrimaryMemoryDeckSource(source: string): boolean {
  return !/(^|[._-])en(?=\.json$|[._-])/i.test(source)
}

function formatGoal(goal: LearningGoal | undefined, goalId: string): string {
  return goal ? `${goal.title} [${goalId}]` : goalId
}

function collectMemoryDeckEvidence(landscape: LearningLandscape): MemoryDeckEvidence {
  const evidence: MemoryDeckEvidence = {
    memoryGoalIds: new Set(),
    deckIdsByMemoryGoalId: new Map(),
    knownDeckIds: new Set(),
    deckFiles: 0,
    cardRows: 0,
    primaryCards: [],
    errors: [],
  }

  landscape.goals.filter(isMemoryGoal).forEach((goal) => {
    evidence.memoryGoalIds.add(goal.id)
    const deckIds = new Set(memoryDeckIdsFromGoal(goal))
    memoryVocabularySources(goal).forEach((source) => {
      const sourcePath = resolveVocabularySourcePath(source)
      if (!existsSync(sourcePath)) {
        evidence.errors.push(`${formatGoal(goal, goal.id)}: missing deck file ${source}`)
        return
      }
      try {
        const parsed = loadJson<{ deckId?: unknown, cards?: unknown[] }>(sourcePath)
        evidence.deckFiles += 1
        if (typeof parsed.deckId !== 'string' || parsed.deckId.trim().length === 0) {
          evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} has no deckId`)
        } else {
          deckIds.add(parsed.deckId)
        }
        if (!Array.isArray(parsed.cards)) {
          evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} has no cards array`)
        } else {
          evidence.cardRows += parsed.cards.length
          if (typeof parsed.deckId === 'string' && parsed.deckId.trim().length > 0 && isPrimaryMemoryDeckSource(source)) {
            parsed.cards.forEach((card, index) => {
              if (!card || typeof card !== 'object') {
                evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} card ${index + 1} is not an object`)
                return
              }
              const row = card as Record<string, unknown>
              const cardId = typeof row.id === 'string' ? row.id.trim() : ''
              if (!cardId) {
                evidence.errors.push(`${formatGoal(goal, goal.id)}: deck file ${source} card ${index + 1} has no id`)
                return
              }
              evidence.primaryCards.push({
                deckId: parsed.deckId,
                cardId,
                source,
                front: normalizeText(row.front),
                back: normalizeText(row.back),
                category: normalizeText(row.category),
                tags: Array.isArray(row.tags) ? row.tags.map((tag) => normalizeText(tag)).filter(Boolean) : [],
              })
            })
          }
        }
      } catch (error) {
        evidence.errors.push(`${formatGoal(goal, goal.id)}: cannot parse deck file ${source}: ${(error as Error).message}`)
      }
    })
    if (deckIds.size === 0) {
      evidence.errors.push(`${formatGoal(goal, goal.id)}: memory goal has no srs-deck tag or readable deck file`)
    }
    evidence.deckIdsByMemoryGoalId.set(goal.id, deckIds)
    deckIds.forEach((deckId) => evidence.knownDeckIds.add(deckId))
  })

  return evidence
}

function validateRecordShape(
  record: ReviewRecord,
  config: ReviewConfig,
  goalById: Map<string, LearningGoal>,
  deckEvidence: MemoryDeckEvidence,
): string[] {
  const errors: string[] = []
  if (record.schemaVersion !== 1) errors.push(`${record.goalId}: schemaVersion must be 1`)
  if (record.reviewId !== config.reviewId) errors.push(`${record.goalId}: reviewId does not match ${config.reviewId}`)
  if (record.ruleVersion !== config.ruleVersion) errors.push(`${record.goalId}: ruleVersion does not match ${config.ruleVersion}`)
  if (record.landscapeId !== config.landscapeId) errors.push(`${record.goalId}: landscapeId does not match ${config.landscapeId}`)
  if (!statusOrder.includes(record.status)) errors.push(`${record.goalId}: status ${String(record.status)} is not supported`)
  if (!record.reason?.trim()) errors.push(`${record.goalId}: reason is required`)

  const memoryGoalIds = record.memoryGoalIds ?? []
  const deckIds = record.deckIds ?? []
  if (record.status === 'no_memory_needed') {
    if (record.memoryUseful !== false) errors.push(`${record.goalId}: no_memory_needed requires memoryUseful false`)
    if (memoryGoalIds.length > 0 || deckIds.length > 0) {
      errors.push(`${record.goalId}: no_memory_needed must not reference memory goals or decks`)
    }
  }
  if (record.status === 'memory_required') {
    if (record.memoryUseful !== true) errors.push(`${record.goalId}: memory_required requires memoryUseful true`)
    if (memoryGoalIds.length === 0) errors.push(`${record.goalId}: memory_required requires at least one memoryGoalId`)
    if (deckIds.length === 0) errors.push(`${record.goalId}: memory_required requires at least one deckId`)
  }
  if (record.status === 'needs_developer_review' && record.memoryUseful !== null) {
    errors.push(`${record.goalId}: needs_developer_review requires memoryUseful null`)
  }

  memoryGoalIds.forEach((memoryGoalId) => {
    const memoryGoal = goalById.get(memoryGoalId)
    if (!memoryGoal || !isMemoryGoal(memoryGoal)) {
      errors.push(`${record.goalId}: memoryGoalId ${memoryGoalId} does not reference a memory goal`)
    }
  })
  deckIds.forEach((deckId) => {
    if (!deckEvidence.knownDeckIds.has(deckId)) {
      errors.push(`${record.goalId}: deckId ${deckId} is not exposed by any memory goal deck`)
      return
    }
    const linkedByReferencedGoal = memoryGoalIds.some((memoryGoalId) =>
      deckEvidence.deckIdsByMemoryGoalId.get(memoryGoalId)?.has(deckId) === true)
    if (memoryGoalIds.length > 0 && !linkedByReferencedGoal) {
      errors.push(`${record.goalId}: deckId ${deckId} is not exposed by the referenced memoryGoalIds`)
    }
  })

  return errors
}

function validateCardRecordShape(
  record: CardReviewRecord,
  config: ReviewConfig,
  goalById: Map<string, LearningGoal>,
  currentGoalRecordsById: Map<string, ReviewRecord>,
): string[] {
  const errors: string[] = []
  if (record.schemaVersion !== 1) errors.push(`${record.deckId}/${record.cardId}: schemaVersion must be 1`)
  if (record.reviewId !== config.reviewId) errors.push(`${record.deckId}/${record.cardId}: reviewId does not match ${config.reviewId}`)
  if (record.ruleVersion !== config.ruleVersion) errors.push(`${record.deckId}/${record.cardId}: ruleVersion does not match ${config.ruleVersion}`)
  if (record.landscapeId !== config.landscapeId) errors.push(`${record.deckId}/${record.cardId}: landscapeId does not match ${config.landscapeId}`)
  if (!cardStatusOrder.includes(record.status)) errors.push(`${record.deckId}/${record.cardId}: status ${String(record.status)} is not supported`)
  if (!record.reason?.trim()) errors.push(`${record.deckId}/${record.cardId}: reason is required`)

  const originGoalIds = record.originGoalIds ?? []
  if (record.status === 'kept') {
    if (record.necessary !== true) errors.push(`${record.deckId}/${record.cardId}: kept requires necessary true`)
    if (originGoalIds.length === 0) errors.push(`${record.deckId}/${record.cardId}: kept requires at least one originGoalId`)
  }
  if (record.status === 'remove' && record.necessary !== false) {
    errors.push(`${record.deckId}/${record.cardId}: remove requires necessary false`)
  }
  if (record.status === 'needs_developer_review' && record.necessary !== null) {
    errors.push(`${record.deckId}/${record.cardId}: needs_developer_review requires necessary null`)
  }

  originGoalIds.forEach((goalId) => {
    const goal = goalById.get(goalId)
    if (!goal || !isLeaf(goal) || !isReviewRelevantGoal(goal)) {
      errors.push(`${record.deckId}/${record.cardId}: originGoalId ${goalId} does not reference an ordinary atomic review goal`)
      return
    }
    const goalRecord = currentGoalRecordsById.get(goalId)
    if (!goalRecord || goalRecord.status !== 'memory_required') {
      errors.push(`${record.deckId}/${record.cardId}: originGoalId ${goalId} is not currently marked memory_required`)
    }
    if (record.status === 'kept' && !(goalRecord?.deckIds ?? []).includes(record.deckId)) {
      errors.push(`${record.deckId}/${record.cardId}: originGoalId ${goalId} does not reference deck ${record.deckId}`)
    }
  })

  return errors
}

function serializeRecords(records: ReviewRecord[]): string {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
}

function serializeCardRecords(records: CardReviewRecord[]): string {
  return records.length > 0
    ? `${records.map((record) => JSON.stringify(record)).join('\n')}\n`
    : ''
}

function markdownCell(value: unknown): string {
  return normalizeText(value)
    .replace(/\|/g, '\\|')
}

function formatGoalForReport(goalById: Map<string, LearningGoal>, goalId: string): string {
  const goal = goalById.get(goalId)
  if (!goal) return `\`${goalId}\``
  const phase = normalizeText(goal.dimensionTags?.phase)
  const phasePrefix = phase ? `${phase}: ` : ''
  return `${phasePrefix}${goal.title} (\`${goalId}\`)`
}

function markdownTable(headers: string[], rows: string[][]): string[] {
  const lines = [
    `| ${headers.map(markdownCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ]
  rows.forEach((row) => {
    lines.push(`| ${row.map(markdownCell).join(' | ')} |`)
  })
  return lines
}

function buildMarkdownReport(input: {
  config: ReviewConfig
  reviewGoals: LearningGoal[]
  goalById: Map<string, LearningGoal>
  byStatus: Map<ReviewStatus, ReviewRecord[]>
  cardsByStatus: Map<CardReviewStatus, CardReviewRecord[]>
  cardRecords: CardReviewRecord[]
  primaryCards: MemoryDeckCard[]
  memoryGoalIdsInScope: Set<string>
  tracedMemoryGoalIds: Set<string>
  visibilityReport: MemoryVisibilityReport
  blockingErrors: string[]
}): string {
  const {
    config,
    reviewGoals,
    goalById,
    byStatus,
    cardsByStatus,
    cardRecords,
    primaryCards,
    memoryGoalIdsInScope,
    tracedMemoryGoalIds,
    visibilityReport,
    blockingErrors,
  } = input
  const cardByKey = new Map(primaryCards.map((card) => [memoryCardKey(card.deckId, card.cardId), card]))
  const memoryRequiredRecords = (byStatus.get('memory_required') ?? [])
    .slice()
    .sort((left, right) => {
      const leftGoal = goalById.get(left.goalId)
      const rightGoal = goalById.get(right.goalId)
      const leftPhase = normalizeText(leftGoal?.dimensionTags?.phase)
      const rightPhase = normalizeText(rightGoal?.dimensionTags?.phase)
      return leftPhase.localeCompare(rightPhase, 'de')
        || formatGoal(leftGoal, left.goalId).localeCompare(formatGoal(rightGoal, right.goalId), 'de')
    })
  const keptCardRecords = (cardsByStatus.get('kept') ?? [])
    .slice()
    .sort((left, right) =>
      left.deckId.localeCompare(right.deckId, 'de') || left.cardId.localeCompare(right.cardId, 'de'))
  const removedCardRecords = cardRecords
    .filter((record) => record.status === 'remove')
    .slice()
    .sort((left, right) =>
      left.deckId.localeCompare(right.deckId, 'de') || left.cardId.localeCompare(right.cardId, 'de'))

  const lines: string[] = []
  lines.push(`# Memory-Card Review: ${config.reviewId}`)
  lines.push('')
  lines.push('Dieser Report ist eine menschenlesbare Audit-Sicht auf die Memory-Review-Ledger. Die verbindlichen Prüfdaten bleiben die JSONL-Ledger; dieser Report wird daraus reproduzierbar erzeugt.')
  lines.push('')
  lines.push('## Scope')
  lines.push('')
  lines.push(`- Scope: ${config.scope.label}`)
  lines.push(`- Landscape: \`${config.landscapePath}\``)
  lines.push(`- Goal ledger: \`${config.reviewPath}\``)
  lines.push(`- Card ledger: \`${config.cardReviewPath ?? config.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl')}\``)
  lines.push(`- Rule version: \`${config.ruleVersion}\``)
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(...markdownTable(
    ['Metric', 'Value'],
    [
      ['ordinary atomic goals reviewed', String(reviewGoals.length)],
      ['goals without memory need', String(byStatus.get('no_memory_needed')?.length ?? 0)],
      ['goals with intentional memory support', String(memoryRequiredRecords.length)],
      ['goals needing developer review', String(byStatus.get('needs_developer_review')?.length ?? 0)],
      ['primary cards in scope', String(primaryCards.length)],
      ['kept primary cards with origin trace', String(keptCardRecords.length)],
      ['cards removed from active decks', String(removedCardRecords.length)],
      ['memory goals traced', `${tracedMemoryGoalIds.size}/${memoryGoalIdsInScope.size}`],
      ['composition visibility scopes', String(visibilityReport.scopes.length)],
      ['memory-required goals checked in views', String(visibilityReport.checkedMemoryRequiredGoals)],
      ['memory-required goals without visible memory node', String(visibilityReport.missingVisibleMemoryGoals)],
      ['blocking issues', String(blockingErrors.length)],
    ],
  ))
  lines.push('')
  lines.push('## Composition Visibility')
  lines.push('')
  if (visibilityReport.scopes.length === 0) {
    lines.push('Keine view-spezifische Memory-Erreichbarkeitsprüfung konfiguriert.')
  } else {
    lines.push(...markdownTable(
      ['Scope', 'View', 'Visible goals', 'Visible memory goals', 'Checked memory-required goals', 'Missing visible memory goals'],
      visibilityReport.scopes.map((scope) => [
        scope.label,
        `\`${scope.viewPath}\``,
        String(scope.visibleGoals),
        String(scope.visibleMemoryGoals),
        String(scope.checkedMemoryRequiredGoals),
        String(scope.missingVisibleMemoryGoals),
      ]),
    ))
  }
  lines.push('')
  lines.push('## Memory-Required Goals')
  lines.push('')
  if (memoryRequiredRecords.length === 0) {
    lines.push('Keine.')
  } else {
    lines.push(...markdownTable(
      ['Lernziel', 'Decks', 'Begründung'],
      memoryRequiredRecords.map((record) => [
        formatGoalForReport(goalById, record.goalId),
        (record.deckIds ?? []).map((deckId) => `\`${deckId}\``).join(', '),
        record.reason,
      ]),
    ))
  }
  lines.push('')
  lines.push('## Kept Cards')
  lines.push('')
  if (keptCardRecords.length === 0) {
    lines.push('Keine.')
  } else {
    lines.push(...markdownTable(
      ['Deck', 'Card', 'Front', 'Answer', 'Origin goals', 'Begründung'],
      keptCardRecords.map((record) => {
        const card = cardByKey.get(memoryCardKey(record.deckId, record.cardId))
        return [
          `\`${record.deckId}\``,
          `\`${record.cardId}\``,
          card?.front ?? '',
          card?.back ?? '',
          (record.originGoalIds ?? []).map((goalId) => formatGoalForReport(goalById, goalId)).join('<br>'),
          record.reason,
        ]
      }),
    ))
  }
  lines.push('')
  lines.push('## Removed Cards')
  lines.push('')
  lines.push('Entfernte Karten bleiben im Card-Ledger als negative Entscheidung erhalten. Sie dürfen nicht mehr in einem aktiven Primärdeck vorkommen.')
  lines.push('')
  if (removedCardRecords.length === 0) {
    lines.push('Keine.')
  } else {
    lines.push(...markdownTable(
      ['Deck', 'Card', 'Active deck state', 'Begründung'],
      removedCardRecords.map((record) => {
        const isStillActive = cardByKey.has(memoryCardKey(record.deckId, record.cardId))
        return [
          `\`${record.deckId}\``,
          `\`${record.cardId}\``,
          isStillActive ? 'still active - blocking' : 'removed',
          record.reason,
        ]
      }),
    ))
  }
  lines.push('')
  lines.push('## Blocking Issues')
  lines.push('')
  if (blockingErrors.length === 0) {
    lines.push('Keine.')
  } else {
    blockingErrors.forEach((issue) => lines.push(`- ${markdownCell(issue)}`))
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const config = loadJson<ReviewConfig>(resolveRepoPath(args.configPath))
  const landscape = loadJson<LearningLandscape>(resolveRepoPath(config.landscapePath))
  if ((landscape.landscapeId ?? (landscape as { id?: string }).id) !== config.landscapeId) {
    throw new Error(`Configured landscapeId ${config.landscapeId} does not match ${config.landscapePath}`)
  }

  const goalById = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const scopeGoalIds = collectConfiguredScopeGoalIds(config, goalById)
  const reviewGoals = Array.from(scopeGoalIds)
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is LearningGoal => !!goal && isLeaf(goal) && isReviewRelevantGoal(goal))
    .sort((left, right) => left.title.localeCompare(right.title, 'de'))
  const reviewGoalIds = new Set(reviewGoals.map((goal) => goal.id))
  const memoryGoalIdsInScope = new Set(Array.from(scopeGoalIds)
    .map((goalId) => goalById.get(goalId))
    .filter((goal): goal is LearningGoal => !!goal && isMemoryGoal(goal))
    .map((goal) => goal.id))
  const fingerprintsByGoalId = new Map(reviewGoals.map((goal) => [goal.id, fingerprintGoal(goal, config.ruleVersion)]))
  const deckEvidence = collectMemoryDeckEvidence(landscape)

  const reviewPath = resolveRepoPath(config.reviewPath)
  if (args.mode === 'bootstrap') {
    const reviewedAt = new Date().toISOString().slice(0, 10)
    const existingRecords = readExistingReviewRecords(reviewPath)
    const existingByGoalId = new Map(existingRecords.map((record) => [record.goalId, record]))
    const nextRecords = [
      ...existingRecords.filter((record) => reviewGoalIds.has(record.goalId)),
      ...reviewGoals
        .filter((goal) => !existingByGoalId.has(goal.id))
        .map((goal): ReviewRecord => ({
          schemaVersion: 1,
          reviewId: config.reviewId,
          ruleVersion: config.ruleVersion,
          landscapeId: config.landscapeId,
          goalId: goal.id,
          fingerprint: fingerprintsByGoalId.get(goal.id) ?? fingerprintGoal(goal, config.ruleVersion),
          status: 'needs_developer_review',
          memoryUseful: null,
          reviewedAt,
          reviewer: 'codex-memory-review-bootstrap',
          reason: 'Initiale CQR-302-Queue: Dieses Lernziel ist noch nicht semantisch auf Memory-Notwendigkeit geprüft; keine No-Memory- oder Memory-Required-Entscheidung vorweggenommen.',
        })),
    ].sort((left, right) => {
      const leftGoal = goalById.get(left.goalId)
      const rightGoal = goalById.get(right.goalId)
      return formatGoal(leftGoal, left.goalId).localeCompare(formatGoal(rightGoal, right.goalId), 'de')
    })
    mkdirSync(dirname(reviewPath), { recursive: true })
    writeFileSync(reviewPath, serializeRecords(nextRecords), 'utf8')

    const cardReviewPath = resolveRepoPath(config.cardReviewPath
      ?? config.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl'))
    const existingCardRecords = readExistingCardReviewRecords(cardReviewPath)
    mkdirSync(dirname(cardReviewPath), { recursive: true })
    writeFileSync(cardReviewPath, serializeCardRecords(existingCardRecords), 'utf8')
    console.log(`Bootstrapped ${nextRecords.length} memory review queue record(s) in ${config.reviewPath}`)
    console.log(`Ensured card review ledger ${config.cardReviewPath ?? config.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl')}`)
    return
  }

  const { records, errors: parseErrors } = parseReviewRecords(reviewPath)
  const shapeErrors = records.flatMap((record) => validateRecordShape(record, config, goalById, deckEvidence))
  const duplicateGoalIds = records
    .map((record) => record.goalId)
    .filter((goalId, index, all) => all.indexOf(goalId) !== index)
  const recordsByGoalId = new Map(records.map((record) => [record.goalId, record]))

  const missingRecords = reviewGoals.filter((goal) => !recordsByGoalId.has(goal.id))
  const staleRecords = reviewGoals.filter((goal) => {
    const record = recordsByGoalId.get(goal.id)
    const fingerprint = fingerprintsByGoalId.get(goal.id)
    return !!record && !!fingerprint && record.fingerprint !== fingerprint
  })
  const obsoleteRecords = records.filter((record) => !reviewGoalIds.has(record.goalId))
  const currentRecords = reviewGoals
    .map((goal) => recordsByGoalId.get(goal.id))
    .filter((record): record is ReviewRecord => !!record)
    .filter((record) => record.fingerprint === fingerprintsByGoalId.get(record.goalId))
  const currentGoalRecordsById = new Map(currentRecords.map((record) => [record.goalId, record]))

  const byStatus = new Map<ReviewStatus, ReviewRecord[]>(
    statusOrder.map((status) => [status, currentRecords.filter((record) => record.status === status)]),
  )
  const tracedMemoryGoalIds = new Set<string>()
  byStatus.get('memory_required')?.forEach((record) => {
    record.memoryGoalIds?.forEach((memoryGoalId) => tracedMemoryGoalIds.add(memoryGoalId))
  })
  const untracedMemoryGoals = Array.from(memoryGoalIdsInScope)
    .filter((goalId) => !tracedMemoryGoalIds.has(goalId))

  const scopedDeckIds = new Set<string>()
  memoryGoalIdsInScope.forEach((memoryGoalId) => {
    deckEvidence.deckIdsByMemoryGoalId.get(memoryGoalId)?.forEach((deckId) => scopedDeckIds.add(deckId))
  })
  const primaryCards = deckEvidence.primaryCards
    .filter((card) => scopedDeckIds.has(card.deckId))
    .sort((left, right) =>
      left.deckId.localeCompare(right.deckId, 'de') || left.cardId.localeCompare(right.cardId, 'de'))
  const primaryCardKeys = new Set(primaryCards.map((card) => memoryCardKey(card.deckId, card.cardId)))
  const cardFingerprintsByKey = new Map(primaryCards.map((card) => [
    memoryCardKey(card.deckId, card.cardId),
    fingerprintMemoryCard(card, config.ruleVersion),
  ]))
  const cardReviewPath = resolveRepoPath(config.cardReviewPath
    ?? config.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl'))
  const { records: cardRecords, errors: cardParseErrors } = parseCardReviewRecords(cardReviewPath)
  const duplicateCardKeys = cardRecords
    .map((record) => memoryCardKey(record.deckId, record.cardId))
    .filter((key, index, all) => all.indexOf(key) !== index)
  const cardRecordsByKey = new Map(cardRecords.map((record) => [memoryCardKey(record.deckId, record.cardId), record]))
  const missingCardRecords = primaryCards.filter((card) => !cardRecordsByKey.has(memoryCardKey(card.deckId, card.cardId)))
  const staleCardRecords = primaryCards.filter((card) => {
    const key = memoryCardKey(card.deckId, card.cardId)
    const record = cardRecordsByKey.get(key)
    const fingerprint = cardFingerprintsByKey.get(key)
    return !!record && !!fingerprint && record.fingerprint !== fingerprint
  })
  const obsoleteCardRecords = cardRecords.filter((record) =>
    !primaryCardKeys.has(memoryCardKey(record.deckId, record.cardId)) && record.status !== 'remove')
  const currentCardRecords = primaryCards
    .map((card) => cardRecordsByKey.get(memoryCardKey(card.deckId, card.cardId)))
    .filter((record): record is CardReviewRecord => !!record)
    .filter((record) => record.fingerprint === cardFingerprintsByKey.get(memoryCardKey(record.deckId, record.cardId)))
  const cardShapeErrors = currentCardRecords.flatMap((record) =>
    validateCardRecordShape(record, config, goalById, currentGoalRecordsById))
  const cardsByStatus = new Map<CardReviewStatus, CardReviewRecord[]>(
    cardStatusOrder.map((status) => [status, currentCardRecords.filter((record) => record.status === status)]),
  )
  const tracedMemoryRequiredGoalIds = new Set<string>()
  cardsByStatus.get('kept')?.forEach((record) => {
    record.originGoalIds?.forEach((goalId) => tracedMemoryRequiredGoalIds.add(goalId))
  })
  const untracedMemoryRequiredGoalRecords = currentRecords
    .filter((record) => record.status === 'memory_required' && !tracedMemoryRequiredGoalIds.has(record.goalId))
  const visibilityReport = collectMemoryVisibilityReport(config, goalById, currentRecords)

  if (args.writeFingerprints) {
    const updatedRecords = records.map((record) => {
      const nextFingerprint = fingerprintsByGoalId.get(record.goalId)
      return nextFingerprint ? { ...record, fingerprint: nextFingerprint } : record
    })
    const updatedCardRecords = cardRecords.map((record) => {
      const nextFingerprint = cardFingerprintsByKey.get(memoryCardKey(record.deckId, record.cardId))
      return nextFingerprint ? { ...record, fingerprint: nextFingerprint } : record
    })
    writeFileSync(reviewPath, serializeRecords(updatedRecords), 'utf8')
    writeFileSync(cardReviewPath, `${updatedCardRecords.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8')
    console.log(`Updated fingerprints in ${config.reviewPath}`)
    console.log(`Updated fingerprints in ${config.cardReviewPath ?? config.reviewPath.replace(/\.review\.jsonl$/i, '.cards.review.jsonl')}`)
    return
  }

  console.log(`# Memory Card Review: ${config.reviewId}`)
  console.log(`Scope: ${config.scope.label}`)
  console.log(`Rule: ${config.ruleVersion}`)
  console.log(`Ordinary atomic goals in scope: ${reviewGoals.length}`)
  console.log(`Current no-memory decisions: ${byStatus.get('no_memory_needed')?.length ?? 0}`)
  console.log(`Current memory-required decisions: ${byStatus.get('memory_required')?.length ?? 0}`)
  console.log(`Current needs developer review: ${byStatus.get('needs_developer_review')?.length ?? 0}`)
  console.log(`Memory goals in scope: ${memoryGoalIdsInScope.size}`)
  console.log(`Traced memory goals: ${tracedMemoryGoalIds.size}`)
  console.log(`Known deck IDs: ${deckEvidence.knownDeckIds.size}`)
  console.log(`Deck files: ${deckEvidence.deckFiles}`)
  console.log(`Card rows: ${deckEvidence.cardRows}`)
  console.log(`Primary cards in scope: ${primaryCards.length}`)
  console.log(`Kept primary cards: ${cardsByStatus.get('kept')?.length ?? 0}`)
  console.log(`Cards marked remove: ${cardsByStatus.get('remove')?.length ?? 0}`)
  console.log(`Cards needing developer review: ${cardsByStatus.get('needs_developer_review')?.length ?? 0}`)
  console.log(`Missing review records: ${missingRecords.length}`)
  console.log(`Stale review records: ${staleRecords.length}`)
  console.log(`Obsolete review records: ${obsoleteRecords.length}`)
  console.log(`Missing card review records: ${missingCardRecords.length}`)
  console.log(`Stale card review records: ${staleCardRecords.length}`)
  console.log(`Obsolete card review records: ${obsoleteCardRecords.length}`)
  console.log(`Composition visibility scopes: ${visibilityReport.scopes.length}`)
  console.log(`Memory-required goals checked in views: ${visibilityReport.checkedMemoryRequiredGoals}`)
  console.log(`Memory-required goals without visible memory node: ${visibilityReport.missingVisibleMemoryGoals}`)

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
  const printCardRecordList = (title: string, rows: CardReviewRecord[]) => {
    if (rows.length === 0) return
    console.log(`\n${title}`)
    rows.forEach((record) => {
      console.log(`- ${record.deckId}/${record.cardId}: ${record.reason}`)
    })
  }
  const printCardList = (title: string, cards: MemoryDeckCard[]) => {
    if (cards.length === 0) return
    console.log(`\n${title}`)
    cards.forEach((card) => {
      console.log(`- ${card.deckId}/${card.cardId}: ${card.front}`)
    })
  }

  printGoalList('Missing review records', missingRecords)
  printGoalList('Stale review records', staleRecords)
  printRecordList('Memory-required decisions', byStatus.get('memory_required') ?? [])
  printRecordList('Developer review queue', byStatus.get('needs_developer_review') ?? [])
  printRecordList('Obsolete review records', obsoleteRecords)
  printCardList('Missing card review records', missingCardRecords)
  printCardList('Stale card review records', staleCardRecords)
  printCardRecordList('Cards marked remove', cardsByStatus.get('remove') ?? [])
  printCardRecordList('Card developer review queue', cardsByStatus.get('needs_developer_review') ?? [])
  printCardRecordList('Obsolete card review records', obsoleteCardRecords)
  if (untracedMemoryGoals.length > 0) {
    console.log('\nUntraced memory goals')
    untracedMemoryGoals.forEach((goalId) => console.log(`- ${formatGoal(goalById.get(goalId), goalId)}`))
  }
  if (untracedMemoryRequiredGoalRecords.length > 0) {
    console.log('\nMemory-required goals without kept card trace')
    untracedMemoryRequiredGoalRecords.forEach((record) => {
      console.log(`- ${formatGoal(goalById.get(record.goalId), record.goalId)}`)
    })
  }
  if (visibilityReport.errors.length > 0) {
    console.log('\nMemory visibility issues')
    visibilityReport.errors.forEach((issue) => console.log(`- ${issue}`))
  }

  const blockingErrors = [
    ...parseErrors,
    ...shapeErrors,
    ...cardParseErrors,
    ...cardShapeErrors,
    ...deckEvidence.errors,
    ...duplicateGoalIds.map((goalId) => `Duplicate review record for ${goalId}`),
    ...duplicateCardKeys.map((key) => `Duplicate card review record for ${key}`),
    ...missingRecords.map((goal) => `Missing review record for ${goal.id}`),
    ...staleRecords.map((goal) => `Stale review record for ${goal.id}`),
    ...obsoleteRecords.map((record) => `Obsolete review record for ${record.goalId}`),
    ...missingCardRecords.map((card) => `Missing card review record for ${card.deckId}/${card.cardId}`),
    ...staleCardRecords.map((card) => `Stale card review record for ${card.deckId}/${card.cardId}`),
    ...obsoleteCardRecords.map((record) => `Obsolete card review record for ${record.deckId}/${record.cardId}`),
    ...(cardsByStatus.get('remove') ?? []).map((record) => `Card marked for removal is still present in deck ${record.deckId}/${record.cardId}`),
    ...(cardsByStatus.get('needs_developer_review') ?? []).map((record) => `Unresolved card review for ${record.deckId}/${record.cardId}`),
    ...(byStatus.get('needs_developer_review') ?? []).map((record) => `Unresolved memory review for ${record.goalId}`),
    ...untracedMemoryRequiredGoalRecords.map((record) => `Memory-required goal has no kept card trace ${record.goalId}`),
    ...untracedMemoryGoals.map((goalId) => `Untraced memory goal ${goalId}`),
    ...visibilityReport.errors,
  ]

  if (blockingErrors.length > 0) {
    console.log('\nBlocking issues')
    blockingErrors.forEach((issue) => console.log(`- ${issue}`))
  }

  if (args.writeReport) {
    const reportPath = resolveRepoPath(args.reportPath
      ?? config.reportPath
      ?? `docs/qa-ci/status/memory-card-review-${config.reviewId}.md`)
    mkdirSync(dirname(reportPath), { recursive: true })
    writeFileSync(reportPath, buildMarkdownReport({
      config,
      reviewGoals,
      goalById,
      byStatus,
      cardsByStatus,
      cardRecords,
      primaryCards,
      memoryGoalIdsInScope,
      tracedMemoryGoalIds,
      visibilityReport,
      blockingErrors,
    }), 'utf8')
    console.log(`\nWrote ${args.reportPath ?? config.reportPath ?? `docs/qa-ci/status/memory-card-review-${config.reviewId}.md`}`)
  }

  if (args.mode === 'check' && blockingErrors.length > 0) {
    process.exitCode = 1
  }
}

main()
