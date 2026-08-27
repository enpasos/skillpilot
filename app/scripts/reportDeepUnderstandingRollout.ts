import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { hasCurrentGoalVisualizationApproval } from './checkGoalVisualizationQaApprovalCoverage'
import {
  fingerprintSemanticKindSourceGoal,
} from './goalBookModel'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'
import {
  loadGoalDescriptionReviewCampaignResultDirectories,
} from './validateGoalDescriptionReviewCampaignResults'
import {
  validateGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import type {
  GoalDescriptionDualRoundSummary,
  GoalDescriptionReviewRoundArtifacts,
} from './validateGoalDescriptionReviewDualRound'
import type {
  GoalDescriptionReviewCampaign,
  GoalDescriptionReviewInput,
} from './validateGoalDescriptionReviewCampaign'
import type {
  GoalDescriptionRolloutSynthesisDecisionManifest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const defaultConfigPath = (
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/'
  + 'de-gymnasium-math-physics.config.json'
)
const configSchemaPath = (
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/'
  + 'deep-understanding-rollout.schema.json'
)
const standaloneResolutionIndexSchemaPath = (
  'contracts/goal-description-review/v1/'
  + 'goal-description-standalone-batch-resolution-index.schema.json'
)
const semanticKinds = [
  'curricularAtomic',
  'curricularArea',
  'practiceAssessment',
  'programStructure',
  'memory',
  'runtimeSupport',
  'orientation',
] as const

type JsonObject = Record<string, unknown>

export interface DeepUnderstandingSubjectConfig {
  subject: string
  label: string
  landscapePath: string
  semanticKindLedgerPath: string
  semanticAtomicityConfigPath: string
  memoryReviewConfigPath: string
  visualizationQaPath: string
  resolutionIndexPaths: string[]
  positiveEvidenceConfigPaths: string[]
}

export interface DeepUnderstandingRolloutConfig {
  $schema: 'https://skillpilot.com/schemas/deep-understanding-rollout/v1/deep-understanding-rollout-config.schema.json'
  schemaVersion: 1
  reportId: string
  subjects: DeepUnderstandingSubjectConfig[]
}

export interface DeepUnderstandingSubjectReport {
  subject: string
  label: string
  denominator: number | null
  strictComplete: number
  percentage: string
  remaining: number | null
  gates: {
    currentDescriptionResolutions: number
    currentPositiveEvidenceProfiles: number
    currentSemanticAtomicityDecisions: number
    currentMemoryReviewDecisions: number
    currentVisualizationQaRecords: number
  }
  strictCompleteGoalIds: string[]
  issues: string[]
}

export interface DeepUnderstandingRolloutReport {
  schemaVersion: 1
  reportId: string
  subjects: DeepUnderstandingSubjectReport[]
  blockingIssueCount: number
}

interface SemanticKindDecision {
  goalId: string
  sourceFingerprint: string
  semanticKind: string
  decisionStatus: string
}

interface SemanticKindLedger {
  sourceLandscapeId: string
  sourceLandscapePath: string
  sourceFingerprintContractId: string
  counts: Record<string, unknown>
  decisions: SemanticKindDecision[]
}

interface AtomicityConfig {
  schemaVersion: number
  reviewId: string
  ruleVersion: string
  landscapeId: string
  landscapePath: string
  reviewPath: string
}

interface AtomicityRecord {
  schemaVersion: number
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: string
  semanticAtomic: boolean | null
  reason: string
}

interface MemoryConfig extends AtomicityConfig {
  cardReviewPath?: string
}

interface MemoryRecord {
  schemaVersion: number
  reviewId: string
  ruleVersion: string
  landscapeId: string
  goalId: string
  fingerprint: string
  status: string
  memoryUseful: boolean | null
  memoryGoalIds?: string[]
  deckIds?: string[]
  reason: string
}

interface VisualizationQaRecord {
  goalId: string
  title: string
  description: string
  subject: string
  landscapeId: string
  landscapePath: string
  visualizationState: 'available' | 'missing'
  missingReason: '' | 'no_primary_link' | 'deferred_provider_limitation'
  imageUrl: string
  publicAssetPath: string
  canonicalAssetPath: string
  assetSha256: string
  humanApproved?: unknown
  humanIssueIdentified?: unknown
  aiApproved?: unknown
  aiApprovedAssetSha256?: unknown
}

interface VisualizationQaLedger {
  schemaVersion: number
  subject: string
  records: VisualizationQaRecord[]
}

interface ResolutionIndexGroup {
  groupId: string
  artifactDirectory?: string
  dualSummaryPath: string
  dualSummaryDigest: string
  campaignGoalCount: number
  resolvedGoalCount: number
}

interface ResolutionIndexEntry {
  goalId: string
  titleDe: string
  groupId: string
  decision: string
  resolutionPath: string
  resolutionDigest: string
  resolutionFingerprint: string
  strictDescriptionComplete: boolean
  humanAttestationPath?: string
}

interface ResolutionIndexBase {
  schemaVersion: 1 | 2
  artifactSetId: string
  subject: string
  semanticKind: string
  groups: ResolutionIndexGroup[]
  resolutions: ResolutionIndexEntry[]
}

export interface AggregateResolutionIndex extends ResolutionIndexBase {
  schemaVersion: 1
  strictDescriptionReviewCompleteCount: number
  curriculumAtomicDenominator: number
  descriptionReviewPercentage: number
}

export interface StandaloneBatchResolutionIndex extends ResolutionIndexBase {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json'
  schemaVersion: 2
  indexContract: 'goal-description-standalone-batch-resolution-index-v1'
  batchGoalIds: string[]
}

type ResolutionIndex = AggregateResolutionIndex | StandaloneBatchResolutionIndex

interface AuthoritativeScope {
  landscape: SkillLandscape
  rawLandscape: JsonObject
  goalById: Map<string, LearningGoal>
  rawGoalById: Map<string, JsonObject>
  atomicGoalIds: Set<string>
  denominator: number | null
  issues: string[]
}

interface CliArgs {
  configPath: string
  mode: 'report' | 'check'
  format: 'text' | 'json'
}

interface LoadedRound {
  artifacts?: GoalDescriptionReviewRoundArtifacts
  errors: string[]
}

const isRecord = (value: unknown): value is JsonObject => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
)

const isResolutionIndex = (value: unknown): value is ResolutionIndex => {
  if (!isRecord(value) || !Array.isArray(value.groups) || !Array.isArray(value.resolutions)) return false
  const groupsValid = value.groups.every((group) => (
    isRecord(group)
    && typeof group.groupId === 'string'
    && (group.artifactDirectory === undefined || typeof group.artifactDirectory === 'string')
    && typeof group.dualSummaryPath === 'string'
    && typeof group.dualSummaryDigest === 'string'
    && Number.isInteger(group.campaignGoalCount)
    && Number.isInteger(group.resolvedGoalCount)
  ))
  const resolutionsValid = value.resolutions.every((entry) => (
    isRecord(entry)
    && typeof entry.goalId === 'string'
    && typeof entry.titleDe === 'string'
    && typeof entry.groupId === 'string'
    && typeof entry.decision === 'string'
    && typeof entry.resolutionPath === 'string'
    && typeof entry.resolutionDigest === 'string'
    && typeof entry.resolutionFingerprint === 'string'
    && typeof entry.strictDescriptionComplete === 'boolean'
    && (entry.humanAttestationPath === undefined || typeof entry.humanAttestationPath === 'string')
  ))
  const commonValid = groupsValid
    && resolutionsValid
    && typeof value.artifactSetId === 'string'
    && typeof value.subject === 'string'
    && typeof value.semanticKind === 'string'
  if (!commonValid) return false
  if (value.schemaVersion === 1) {
    return Number.isInteger(value.strictDescriptionReviewCompleteCount)
      && Number.isInteger(value.curriculumAtomicDenominator)
      && typeof value.descriptionReviewPercentage === 'number'
  }
  return value.schemaVersion === 2
    && value.$schema === 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json'
    && value.indexContract === 'goal-description-standalone-batch-resolution-index-v1'
    && Array.isArray(value.batchGoalIds)
    && value.batchGoalIds.length >= 1
    && value.batchGoalIds.length <= 20
    && value.batchGoalIds.every((goalId) => typeof goalId === 'string' && goalId.length > 0)
}

const sha256 = (value: Buffer | string): string => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const normalizeText = (value: unknown): string => String(value ?? '')
  .normalize('NFKC')
  .replace(/\s+/gu, ' ')
  .trim()

const stableReviewJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableReviewJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as JsonObject)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableReviewJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

const goalReviewFingerprint = (goal: LearningGoal, ruleVersion: string): string => sha256(
  stableReviewJson({
    ruleVersion,
    goalId: goal.id,
    shortKey: goal.shortKey ?? '',
    title: normalizeText(goal.title),
    titleEn: normalizeText((goal as LearningGoal & { titleEn?: string }).titleEn),
    description: normalizeText(goal.description),
    descriptionEn: normalizeText((goal as LearningGoal & { descriptionEn?: string }).descriptionEn),
    phase: normalizeText(goal.dimensionTags?.phase),
    area: normalizeText(goal.dimensionTags?.area),
    topicCode: normalizeText(goal.dimensionTags?.topicCode),
    nodeKind: normalizeText((goal as LearningGoal & { nodeKind?: string }).nodeKind),
  }),
)

const parseJson = <T>(bytes: Buffer | string, label: string): T => {
  try {
    return JSON.parse(bytes.toString()) as T
  } catch (error) {
    throw new Error(`${label}: invalid JSON (${error instanceof Error ? error.message : String(error)})`)
  }
}

const loadJson = <T>(configuredPath: string): T => {
  const path = resolveRepoPath(configuredPath)
  return parseJson<T>(readFileSync(path), configuredPath)
}

const resolveRepoPath = (configuredPath: string): string => {
  const absolutePath = resolve(repoRoot, configuredPath)
  const relativePath = relative(repoRoot, absolutePath)
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`Path leaves repository: ${configuredPath}`)
  }
  return absolutePath
}

const resolveIndexPath = (indexPath: string, configuredPath: string): string => {
  const absolutePath = resolve(dirname(resolveRepoPath(indexPath)), configuredPath)
  const relativePath = relative(repoRoot, absolutePath)
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`Index artifact leaves repository: ${configuredPath}`)
  }
  return absolutePath
}

export const resolveResolutionBatchArtifactPath = (
  resolutionPath: string,
  configuredPath: string,
): string => {
  const batchRoot = dirname(dirname(resolve(resolutionPath)))
  const absolutePath = resolve(batchRoot, configuredPath)
  const relativePath = relative(batchRoot, absolutePath)
  if (
    relativePath === ''
    || relativePath === '..'
    || relativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`Resolution batch artifact leaves its batch root: ${configuredPath}`)
  }
  return absolutePath
}

const createStandaloneResolutionIndexSchemaValidator = () => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  return {
    ajv,
    validate: ajv.compile(loadJson<JsonObject>(standaloneResolutionIndexSchemaPath)),
  }
}

let standaloneResolutionIndexSchemaValidator:
  ReturnType<typeof createStandaloneResolutionIndexSchemaValidator> | null = null

export const validateStandaloneResolutionIndexSchema = (candidate: unknown): string[] => {
  standaloneResolutionIndexSchemaValidator ??= createStandaloneResolutionIndexSchemaValidator()
  const { ajv, validate } = standaloneResolutionIndexSchemaValidator
  return validate(candidate)
    ? []
    : [`closed standalone resolution-index schema violation: ${ajv.errorsText(validate.errors, { separator: '; ' })}`]
}

export const duplicateValues = (values: readonly string[]): string[] => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value)
    seen.add(value)
  })
  return [...duplicates].sort()
}

const sameOrderedValues = (left: readonly string[], right: readonly string[]): boolean => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

export const validateStandaloneResolutionIndexStructure = (
  index: StandaloneBatchResolutionIndex,
  currentAtomicGoalIds: ReadonlySet<string>,
): string[] => {
  const errors: string[] = []
  const duplicateBatchGoalIds = duplicateValues(index.batchGoalIds)
  if (duplicateBatchGoalIds.length > 0) {
    errors.push(`duplicate batchGoalIds: ${duplicateBatchGoalIds.join(', ')}`)
  }
  if (index.groups.length !== 1) {
    errors.push(`standalone index must contain exactly one group; found ${index.groups.length}`)
    return errors
  }
  const group = index.groups[0]
  if (group.artifactDirectory !== '.') {
    errors.push('standalone group artifactDirectory must be .')
  }
  if (group.campaignGoalCount !== index.batchGoalIds.length) {
    errors.push('standalone group campaignGoalCount does not match batchGoalIds')
  }
  if (
    group.resolvedGoalCount !== index.resolutions.length
    || index.resolutions.length !== index.batchGoalIds.length
  ) {
    errors.push('standalone batch must contain one strict resolution per batch goal')
  }
  const batchGoalIdSet = new Set(index.batchGoalIds)
  index.batchGoalIds.forEach((goalId) => {
    if (!currentAtomicGoalIds.has(goalId)) {
      errors.push(`batch goal ${goalId} is not current curricularAtomic`)
    }
  })
  const resolutionGoalIds = index.resolutions.map(({ goalId }) => goalId)
  duplicateValues(resolutionGoalIds).forEach((goalId) => {
    errors.push(`duplicate standalone resolution for ${goalId}`)
  })
  index.resolutions.forEach((entry) => {
    if (!batchGoalIdSet.has(entry.goalId)) {
      errors.push(`resolution goal ${entry.goalId} is outside batchGoalIds`)
    }
    if (entry.groupId !== group.groupId) {
      errors.push(`resolution goal ${entry.goalId} references a foreign standalone group`)
    }
    if (entry.strictDescriptionComplete !== true) {
      errors.push(`resolution goal ${entry.goalId} is not declared strict complete`)
    }
    if (entry.humanAttestationPath !== undefined) {
      errors.push(`resolution goal ${entry.goalId} must not reference a human attestation in a standalone AI batch`)
    }
  })
  index.batchGoalIds.forEach((goalId) => {
    if (!resolutionGoalIds.includes(goalId)) errors.push(`missing standalone resolution for ${goalId}`)
  })
  return errors
}

export const validateLegacyResolutionIndexSnapshot = (
  index: AggregateResolutionIndex,
): string[] => {
  const errors: string[] = []
  const declaredStrict = index.resolutions
    .filter(({ strictDescriptionComplete }) => strictDescriptionComplete)
    .length
  if (
    index.curriculumAtomicDenominator < 1
    || index.curriculumAtomicDenominator < index.resolutions.length
  ) {
    errors.push('legacy snapshot denominator is invalid')
  }
  if (index.strictDescriptionReviewCompleteCount !== declaredStrict) {
    errors.push('strictDescriptionReviewCompleteCount does not match resolution entries')
  }
  const expectedPercentage = Number((
    (declaredStrict / index.curriculumAtomicDenominator) * 100
  ).toFixed(1))
  if (index.descriptionReviewPercentage !== expectedPercentage) {
    errors.push('descriptionReviewPercentage does not match its legacy snapshot denominator')
  }
  return errors
}

export const claimUniqueGoal = (
  goalId: string,
  owner: string,
  ownerByGoalId: Map<string, string>,
  ready: Set<string>,
): string | null => {
  const previousOwner = ownerByGoalId.get(goalId)
  if (previousOwner) {
    ready.delete(goalId)
    return previousOwner
  }
  ownerByGoalId.set(goalId, owner)
  ready.add(goalId)
  return null
}

export const intersectStrictGoalGates = (
  scopeGoalIds: ReadonlySet<string>,
  gates: readonly ReadonlySet<string>[],
): string[] => [...scopeGoalIds]
  .filter((goalId) => gates.every((gate) => gate.has(goalId)))
  .sort()

const readJsonl = <T>(configuredPath: string): { records: T[]; errors: string[] } => {
  const errors: string[] = []
  let bytes: string
  try {
    bytes = readFileSync(resolveRepoPath(configuredPath), 'utf8')
  } catch (error) {
    return {
      records: [],
      errors: [`${configuredPath}: cannot read JSONL (${error instanceof Error ? error.message : String(error)})`],
    }
  }
  const records = bytes.split(/\r?\n/gu).flatMap((line, index) => {
    if (!line.trim()) return []
    try {
      return [JSON.parse(line) as T]
    } catch (error) {
      errors.push(`${configuredPath}:${index + 1}: invalid JSON (${error instanceof Error ? error.message : String(error)})`)
      return []
    }
  })
  return { records, errors }
}

export const formatRolloutPercentage = (completed: number, denominator: number | null): string => (
  denominator && denominator > 0 ? `${((completed / denominator) * 100).toFixed(1)}%` : 'n/a'
)

const addIssue = (issues: string[], scope: string, message: string): void => {
  issues.push(`${scope}: ${message}`)
}

const runTsxCheck = (scriptPath: string, args: string[]): { valid: boolean; detail: string } => {
  const tsxCli = resolve(repoRoot, 'app/node_modules/tsx/dist/cli.mjs')
  if (!existsSync(tsxCli)) {
    return { valid: false, detail: 'local tsx CLI is unavailable' }
  }
  const result = spawnSync(process.execPath, [tsxCli, resolveRepoPath(scriptPath), ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 20 * 1024 * 1024,
  })
  if (result.status === 0) return { valid: true, detail: '' }
  const detail = `${result.stderr ?? ''}\n${result.stdout ?? ''}`
    .split(/\r?\n/gu)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-8)
    .join(' | ')
  return {
    valid: false,
    detail: detail || result.error?.message || `exit status ${String(result.status)}`,
  }
}

const loadAuthoritativeScope = (config: DeepUnderstandingSubjectConfig): AuthoritativeScope => {
  const issues: string[] = []
  let rawLandscape: JsonObject
  let landscape: SkillLandscape
  let ledger: SemanticKindLedger
  try {
    rawLandscape = loadJson<JsonObject>(config.landscapePath)
    landscape = rawLandscape as unknown as SkillLandscape
    ledger = loadJson<SemanticKindLedger>(config.semanticKindLedgerPath)
  } catch (error) {
    addIssue(issues, config.subject, error instanceof Error ? error.message : String(error))
    return {
      landscape: { landscapeId: '', goals: [] } as unknown as SkillLandscape,
      rawLandscape: {},
      goalById: new Map(),
      rawGoalById: new Map(),
      atomicGoalIds: new Set(),
      denominator: null,
      issues,
    }
  }
  const rawGoals = Array.isArray(rawLandscape.goals) ? rawLandscape.goals : []
  if (!Array.isArray(rawLandscape.goals)) addIssue(issues, config.subject, 'canonical goals array is missing')
  const rawGoalById = new Map<string, JsonObject>()
  rawGoals.forEach((candidate, index) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      addIssue(issues, config.subject, `canonical goal ${index} is not an object`)
      return
    }
    const goal = candidate as JsonObject
    const goalId = typeof goal.id === 'string' ? goal.id : ''
    if (!goalId) {
      addIssue(issues, config.subject, `canonical goal ${index} has no goalId`)
    } else if (rawGoalById.has(goalId)) {
      addIssue(issues, config.subject, `duplicate canonical goalId ${goalId}`)
    } else {
      rawGoalById.set(goalId, goal)
    }
  })
  const goalById = new Map((landscape.goals ?? []).map((goal) => [goal.id, goal]))
  const landscapeId = String(rawLandscape.landscapeId ?? rawLandscape.id ?? '')
  if (ledger.sourceLandscapeId !== landscapeId) {
    addIssue(issues, config.subject, `semantic-kind ledger landscapeId ${ledger.sourceLandscapeId} does not match ${landscapeId}`)
  }
  if (ledger.sourceLandscapePath !== config.landscapePath) {
    addIssue(issues, config.subject, 'semantic-kind ledger landscapePath does not match the configured canonical')
  }
  if (ledger.sourceFingerprintContractId !== 'semantic-kind-source-fingerprint-v1') {
    addIssue(issues, config.subject, `unsupported semantic-kind fingerprint contract ${ledger.sourceFingerprintContractId}`)
  }
  if (!Array.isArray(ledger.decisions)) {
    addIssue(issues, config.subject, 'semantic-kind decisions array is missing')
    ledger.decisions = []
  }
  duplicateValues(ledger.decisions.map(({ goalId }) => goalId)).forEach((goalId) => {
    addIssue(issues, config.subject, `duplicate semantic-kind decision for ${goalId}`)
  })
  const actualCounts = new Map<string, number>(semanticKinds.map((kind) => [kind, 0]))
  const decisionGoalIds = new Set<string>()
  const atomicGoalIds = new Set<string>()
  ledger.decisions.forEach((decision) => {
    const goal = rawGoalById.get(decision.goalId)
    if (!goal) {
      addIssue(issues, config.subject, `semantic-kind decision references unknown goal ${decision.goalId}`)
      return
    }
    decisionGoalIds.add(decision.goalId)
    if (!semanticKinds.includes(decision.semanticKind as typeof semanticKinds[number])) {
      addIssue(issues, config.subject, `unsupported semantic kind ${decision.semanticKind} for ${decision.goalId}`)
      return
    }
    actualCounts.set(decision.semanticKind, (actualCounts.get(decision.semanticKind) ?? 0) + 1)
    if (decision.decisionStatus !== 'authoritative') {
      addIssue(issues, config.subject, `non-authoritative semantic-kind decision for ${decision.goalId}`)
      return
    }
    try {
      const expectedFingerprint = fingerprintSemanticKindSourceGoal(goal)
      if (decision.sourceFingerprint !== expectedFingerprint) {
        addIssue(issues, config.subject, `stale semantic-kind decision for ${decision.goalId}`)
        return
      }
    } catch (error) {
      addIssue(issues, config.subject, `cannot fingerprint semantic-kind source ${decision.goalId}: ${error instanceof Error ? error.message : String(error)}`)
      return
    }
    if (decision.semanticKind === 'curricularAtomic') atomicGoalIds.add(decision.goalId)
  })
  rawGoalById.forEach((_goal, goalId) => {
    if (!decisionGoalIds.has(goalId)) addIssue(issues, config.subject, `missing semantic-kind decision for ${goalId}`)
  })
  semanticKinds.forEach((kind) => {
    if (ledger.counts?.[kind] !== actualCounts.get(kind)) {
      addIssue(issues, config.subject, `declared semantic-kind count for ${kind} does not match decisions`)
    }
  })
  if (ledger.counts?.total !== ledger.decisions.length || ledger.decisions.length !== rawGoalById.size) {
    addIssue(issues, config.subject, 'semantic-kind total does not match complete canonical coverage')
  }
  const denominator = issues.length === 0 ? atomicGoalIds.size : null
  return { landscape, rawLandscape, goalById, rawGoalById, atomicGoalIds, denominator, issues }
}

const loadAtomicityReadyGoals = (
  config: DeepUnderstandingSubjectConfig,
  scope: AuthoritativeScope,
  issues: string[],
): Set<string> => {
  const productionCheck = runTsxCheck('app/scripts/semanticAtomicityReview.ts', [
    `--config=${config.semanticAtomicityConfigPath}`,
    '--mode=check',
  ])
  if (!productionCheck.valid) {
    addIssue(issues, config.subject, `semantic-atomicity production check failed: ${productionCheck.detail}`)
    return new Set()
  }
  let reviewConfig: AtomicityConfig
  try {
    reviewConfig = loadJson<AtomicityConfig>(config.semanticAtomicityConfigPath)
  } catch (error) {
    addIssue(issues, config.subject, error instanceof Error ? error.message : String(error))
    return new Set()
  }
  if (
    reviewConfig.landscapeId !== scope.landscape.landscapeId
    || reviewConfig.landscapePath !== config.landscapePath
  ) {
    addIssue(issues, config.subject, 'semantic-atomicity config is bound to another canonical landscape')
    return new Set()
  }
  const parsed = readJsonl<AtomicityRecord>(reviewConfig.reviewPath)
  parsed.errors.forEach((error) => addIssue(issues, config.subject, error))
  const duplicates = duplicateValues(parsed.records.map(({ goalId }) => goalId))
  duplicates.forEach((goalId) => addIssue(issues, config.subject, `duplicate semantic-atomicity record for ${goalId}`))
  const duplicateSet = new Set(duplicates)
  const recordsByGoalId = new Map(parsed.records.map((record) => [record.goalId, record]))
  const ready = new Set<string>()
  scope.atomicGoalIds.forEach((goalId) => {
    const goal = scope.goalById.get(goalId)
    const record = recordsByGoalId.get(goalId)
    if (!goal || !record || duplicateSet.has(goalId)) return
    const expectedFingerprint = goalReviewFingerprint(goal, reviewConfig.ruleVersion)
    if (
      record.schemaVersion === 1
      && record.reviewId === reviewConfig.reviewId
      && record.ruleVersion === reviewConfig.ruleVersion
      && record.landscapeId === reviewConfig.landscapeId
      && record.fingerprint === expectedFingerprint
      && record.status === 'atomic'
      && record.semanticAtomic === true
      && typeof record.reason === 'string'
      && record.reason.trim().length > 0
    ) ready.add(goalId)
  })
  return parsed.errors.length === 0 ? ready : new Set()
}

const loadMemoryReadyGoals = (
  config: DeepUnderstandingSubjectConfig,
  scope: AuthoritativeScope,
  issues: string[],
): Set<string> => {
  const productionCheck = runTsxCheck('app/scripts/memoryCardReview.ts', [
    `--config=${config.memoryReviewConfigPath}`,
    '--mode=check',
  ])
  if (!productionCheck.valid) {
    addIssue(issues, config.subject, `memory-review production check failed: ${productionCheck.detail}`)
    return new Set()
  }
  let reviewConfig: MemoryConfig
  try {
    reviewConfig = loadJson<MemoryConfig>(config.memoryReviewConfigPath)
  } catch (error) {
    addIssue(issues, config.subject, error instanceof Error ? error.message : String(error))
    return new Set()
  }
  if (
    reviewConfig.landscapeId !== scope.landscape.landscapeId
    || reviewConfig.landscapePath !== config.landscapePath
  ) {
    addIssue(issues, config.subject, 'memory-review config is bound to another canonical landscape')
    return new Set()
  }
  const parsed = readJsonl<MemoryRecord>(reviewConfig.reviewPath)
  parsed.errors.forEach((error) => addIssue(issues, config.subject, error))
  const duplicates = duplicateValues(parsed.records.map(({ goalId }) => goalId))
  duplicates.forEach((goalId) => addIssue(issues, config.subject, `duplicate memory-review record for ${goalId}`))
  const duplicateSet = new Set(duplicates)
  const recordsByGoalId = new Map(parsed.records.map((record) => [record.goalId, record]))
  const ready = new Set<string>()
  scope.atomicGoalIds.forEach((goalId) => {
    const goal = scope.goalById.get(goalId)
    const record = recordsByGoalId.get(goalId)
    if (!goal || !record || duplicateSet.has(goalId)) return
    const expectedFingerprint = goalReviewFingerprint(goal, reviewConfig.ruleVersion)
    const statusBindingValid = (
      (record.status === 'no_memory_needed'
        && record.memoryUseful === false
        && (record.memoryGoalIds?.length ?? 0) === 0
        && (record.deckIds?.length ?? 0) === 0)
      || (record.status === 'memory_required'
        && record.memoryUseful === true
        && (record.memoryGoalIds?.length ?? 0) > 0
        && (record.deckIds?.length ?? 0) > 0)
    )
    if (
      record.schemaVersion === 1
      && record.reviewId === reviewConfig.reviewId
      && record.ruleVersion === reviewConfig.ruleVersion
      && record.landscapeId === reviewConfig.landscapeId
      && record.fingerprint === expectedFingerprint
      && statusBindingValid
      && typeof record.reason === 'string'
      && record.reason.trim().length > 0
    ) ready.add(goalId)
  })
  return parsed.errors.length === 0 ? ready : new Set()
}

const digestFile = (absolutePath: string): string => sha256(readFileSync(absolutePath))

const loadVisualizationReadyGoals = (
  config: DeepUnderstandingSubjectConfig,
  scope: AuthoritativeScope,
  issues: string[],
): Set<string> => {
  const currentCheck = runTsxCheck('app/scripts/generateGoalVisualizationQaLedgers.ts', [
    '--check',
    `--subject=${config.subject}`,
  ])
  const approvalCheck = runTsxCheck('app/scripts/checkGoalVisualizationQaApprovalCoverage.ts', [
    `--subject=${config.subject}`,
  ])
  if (!currentCheck.valid) {
    addIssue(issues, config.subject, `visualization-QA freshness check failed: ${currentCheck.detail}`)
  }
  if (!approvalCheck.valid) {
    addIssue(issues, config.subject, `visualization-QA approval check failed: ${approvalCheck.detail}`)
  }
  if (!currentCheck.valid || !approvalCheck.valid) return new Set()
  let ledger: VisualizationQaLedger
  try {
    ledger = loadJson<VisualizationQaLedger>(config.visualizationQaPath)
  } catch (error) {
    addIssue(issues, config.subject, error instanceof Error ? error.message : String(error))
    return new Set()
  }
  if (ledger.schemaVersion !== 1 || ledger.subject !== config.subject || !Array.isArray(ledger.records)) {
    addIssue(issues, config.subject, 'visualization-QA ledger identity or schema is invalid')
    return new Set()
  }
  const duplicates = duplicateValues(ledger.records.map(({ goalId }) => goalId))
  duplicates.forEach((goalId) => addIssue(issues, config.subject, `duplicate visualization-QA record for ${goalId}`))
  const duplicateSet = new Set(duplicates)
  const recordsByGoalId = new Map(ledger.records.map((record) => [record.goalId, record]))
  const ready = new Set<string>()
  scope.atomicGoalIds.forEach((goalId) => {
    const goal = scope.goalById.get(goalId)
    const record = recordsByGoalId.get(goalId)
    if (!goal || !record || duplicateSet.has(goalId)) return
    if (
      record.subject !== config.subject
      || record.landscapeId !== scope.landscape.landscapeId
      || record.landscapePath !== config.landscapePath
      || normalizeText(record.title) !== normalizeText(goal.title)
      || normalizeText(record.description) !== normalizeText(goal.description)
    ) return
    const primaryLinks = (goal.resourceLinks ?? []).filter((link) => (
      link.type === 'goal-visualization' && link.role === 'primary'
    ))
    if (record.visualizationState === 'missing') {
      if (
        record.missingReason === 'deferred_provider_limitation'
        && primaryLinks.length === 0
        && !record.imageUrl
        && !record.assetSha256
      ) ready.add(goalId)
      return
    }
    if (
      record.visualizationState !== 'available'
      || record.missingReason !== ''
      || primaryLinks.length !== 1
      || primaryLinks[0].url !== record.imageUrl
      || !/^sha256:[0-9a-f]{64}$/u.test(record.assetSha256)
      || !hasCurrentGoalVisualizationApproval(record)
    ) return
    try {
      const publicAssetPath = resolveRepoPath(record.publicAssetPath)
      const canonicalAssetPath = resolveRepoPath(record.canonicalAssetPath)
      if (
        record.publicAssetPath !== `app/public${record.imageUrl}`
        || !existsSync(publicAssetPath)
        || !existsSync(canonicalAssetPath)
        || digestFile(publicAssetPath) !== record.assetSha256
        || digestFile(canonicalAssetPath) !== record.assetSha256
      ) return
    } catch {
      return
    }
    ready.add(goalId)
  })
  return ready
}

const loadRound = async (groupDirectory: string, roundDirectory: string): Promise<LoadedRound> => {
  const root = resolve(groupDirectory, roundDirectory)
  const errors: string[] = []
  try {
    const bundle = parseJson<GoalDescriptionReviewRoundArtifacts['bundle']>(
      readFileSync(resolve(root, 'review-bundle-manifest.json')),
      `${roundDirectory} review bundle`,
    )
    const input = parseJson<GoalDescriptionReviewInput>(
      readFileSync(resolve(root, 'description-review-input.json')),
      `${roundDirectory} review input`,
    )
    const campaign = parseJson<GoalDescriptionReviewCampaign>(
      readFileSync(resolve(root, 'description-review-campaign.json')),
      `${roundDirectory} campaign`,
    )
    const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
      campaign,
      batchesDirectory: resolve(root, 'batches'),
      resultsDirectory: resolve(root, 'results'),
    })
    errors.push(...loaded.errors)
    return {
      artifacts: { bundle, input, campaign, resultPairs: loaded.resultPairs },
      errors,
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
    return { errors }
  }
}

const validateResolutionIndex = async (
  indexPath: string,
  config: DeepUnderstandingSubjectConfig,
  scope: AuthoritativeScope,
): Promise<{ ready: Set<string>; claimedGoalIds: Set<string>; issues: string[] }> => {
  const issues: string[] = []
  let index: ResolutionIndex
  try {
    const candidate = loadJson<unknown>(indexPath)
    if (!isResolutionIndex(candidate)) {
      return {
        ready: new Set(),
        claimedGoalIds: new Set(),
        issues: [`${indexPath}: resolution index shape is invalid`],
      }
    }
    index = candidate
  } catch (error) {
    return {
      ready: new Set(),
      claimedGoalIds: new Set(),
      issues: [error instanceof Error ? error.message : String(error)],
    }
  }
  if (index.schemaVersion === 2) {
    const schemaErrors = validateStandaloneResolutionIndexSchema(index)
    if (schemaErrors.length > 0) {
      return {
        ready: new Set(),
        claimedGoalIds: new Set(index.batchGoalIds),
        issues: schemaErrors.map((error) => `${indexPath}: ${error}`),
      }
    }
  }
  const claimedGoalIds = new Set(
    index.schemaVersion === 2
      ? index.batchGoalIds
      : index.resolutions.map(({ goalId }) => goalId),
  )
  const indexScope = `${config.subject}:${index.artifactSetId || indexPath}`
  const indexGoalDuplicates = duplicateValues(index.resolutions?.map(({ goalId }) => goalId) ?? [])
  const groupDuplicates = duplicateValues(index.groups?.map(({ groupId }) => groupId) ?? [])
  if (index.semanticKind !== 'curricularAtomic') {
    addIssue(issues, indexScope, 'resolution index semantic kind is invalid')
  }
  if (index.subject.toLocaleLowerCase('de-DE') !== config.label.toLocaleLowerCase('de-DE')) {
    addIssue(issues, indexScope, `subject ${index.subject} does not match ${config.label}`)
  }
  if (index.schemaVersion === 1) {
    validateLegacyResolutionIndexSnapshot(index).forEach((error) => {
      addIssue(issues, indexScope, error)
    })
  } else {
    validateStandaloneResolutionIndexStructure(index, scope.atomicGoalIds).forEach((error) => {
      addIssue(issues, indexScope, error)
    })
  }
  indexGoalDuplicates.forEach((goalId) => addIssue(issues, indexScope, `duplicate resolution for ${goalId}`))
  groupDuplicates.forEach((groupId) => addIssue(issues, indexScope, `duplicate groupId ${groupId}`))
  const resolutionPathDuplicates = duplicateValues(index.resolutions.map(({ resolutionPath }) => resolutionPath))
  resolutionPathDuplicates.forEach((path) => addIssue(issues, indexScope, `duplicate resolutionPath ${path}`))
  const groupById = new Map(index.groups.map((group) => [group.groupId, group]))
  const groupGoals = new Map<string, ResolutionIndexEntry[]>()
  index.resolutions.forEach((entry) => {
    const entries = groupGoals.get(entry.groupId) ?? []
    entries.push(entry)
    groupGoals.set(entry.groupId, entries)
    if (!scope.atomicGoalIds.has(entry.goalId)) {
      addIssue(issues, indexScope, `resolution goal ${entry.goalId} is not current curricularAtomic`)
    }
    if (!groupById.has(entry.groupId)) {
      addIssue(issues, indexScope, `resolution goal ${entry.goalId} references unknown group ${entry.groupId}`)
    }
  })
  index.groups.forEach((group) => {
    if ((groupGoals.get(group.groupId)?.length ?? 0) !== group.resolvedGoalCount) {
      addIssue(issues, indexScope, `group ${group.groupId} resolvedGoalCount does not match its resolution entries`)
    }
  })
  if (issues.length > 0) return { ready: new Set(), claimedGoalIds, issues }

  const groupArtifacts = new Map<string, {
    dualSummary: GoalDescriptionDualRoundSummary
    dualSummaryBytes: Buffer
    first: GoalDescriptionReviewRoundArtifacts
    second: GoalDescriptionReviewRoundArtifacts
  }>()
  for (const group of index.groups) {
    const groupDirectory = resolveIndexPath(indexPath, group.artifactDirectory ?? group.groupId)
    const dualSummaryPath = resolveIndexPath(indexPath, group.dualSummaryPath)
    try {
      const dualSummaryBytes = readFileSync(dualSummaryPath)
      if (sha256(dualSummaryBytes) !== group.dualSummaryDigest) {
        addIssue(issues, indexScope, `group ${group.groupId} dual-summary digest is stale`)
        continue
      }
      const dualSummary = parseJson<GoalDescriptionDualRoundSummary>(dualSummaryBytes, dualSummaryPath)
      if (dualSummary.goalCount !== group.campaignGoalCount) {
        addIssue(issues, indexScope, `group ${group.groupId} campaignGoalCount does not match its dual summary`)
        continue
      }
      if (
        index.schemaVersion === 2
        && !sameOrderedValues(
          dualSummary.goals.map(({ goalId }) => goalId),
          index.batchGoalIds,
        )
      ) {
        addIssue(issues, indexScope, `group ${group.groupId} dual-summary goals do not exactly match batchGoalIds`)
        continue
      }
      const [first, second] = await Promise.all([
        loadRound(groupDirectory, 'round-a'),
        loadRound(groupDirectory, 'round-b'),
      ])
      first.errors.forEach((error) => addIssue(issues, indexScope, `${group.groupId} round-a: ${error}`))
      second.errors.forEach((error) => addIssue(issues, indexScope, `${group.groupId} round-b: ${error}`))
      if (!first.artifacts || !second.artifacts || first.errors.length > 0 || second.errors.length > 0) continue
      groupArtifacts.set(group.groupId, {
        dualSummary,
        dualSummaryBytes,
        first: first.artifacts,
        second: second.artifacts,
      })
    } catch (error) {
      addIssue(issues, indexScope, `${group.groupId}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  if (issues.length > 0) return { ready: new Set(), claimedGoalIds, issues }

  const ready = new Set<string>()
  for (const entry of index.resolutions) {
    const group = groupArtifacts.get(entry.groupId)
    if (!group) continue
    try {
      const resolutionPath = resolveIndexPath(indexPath, entry.resolutionPath)
      const resolutionBytes = readFileSync(resolutionPath)
      const resolution = parseJson<GoalDescriptionDualRoundResolution>(resolutionBytes, resolutionPath)
      if (sha256(resolutionBytes) !== entry.resolutionDigest) {
        addIssue(issues, indexScope, `${entry.goalId}: resolution byte digest is stale`)
        continue
      }
      if (
        resolution.goal.goalId !== entry.goalId
        || resolution.resolutionFingerprint !== entry.resolutionFingerprint
        || resolution.goal.finalText.titleDe !== entry.titleDe
        || resolution.decision !== entry.decision
      ) {
        addIssue(issues, indexScope, `${entry.goalId}: resolution index binding conflicts with the resolution`)
        continue
      }
      if (
        index.schemaVersion === 2
        && (
          resolution.synthesis.authority !== 'ai_synthesis'
          || resolution.synthesis.humanAttestation !== null
        )
      ) {
        addIssue(issues, indexScope, `${entry.goalId}: standalone AI batch resolution contains human authority or attestation`)
        continue
      }
      const humanAttestationBytes = index.schemaVersion === 1 && entry.humanAttestationPath
        ? readFileSync(resolveIndexPath(indexPath, entry.humanAttestationPath))
        : undefined
      const synthesisDecisionManifestArtifact = resolution.synthesisDecisionManifest
        ? (() => {
            const manifestPath = resolveResolutionBatchArtifactPath(
              resolutionPath,
              resolution.synthesisDecisionManifest!.manifestPath,
            )
            const manifestBytes = readFileSync(manifestPath)
            return {
              manifest: parseJson<GoalDescriptionRolloutSynthesisDecisionManifest>(
                manifestBytes,
                manifestPath,
              ),
              manifestBytes,
              manifestPath: resolution.synthesisDecisionManifest!.manifestPath,
            }
          })()
        : undefined
      const validation = await validateGoalDescriptionDualRoundResolution({
        resolution,
        dualSummary: group.dualSummary,
        dualSummaryBytes: group.dualSummaryBytes,
        currentInput: group.first.input,
        landscape: scope.rawLandscape,
        first: group.first,
        second: group.second,
        synthesisDecisionManifestArtifact,
        humanAttestationBytes,
      })
      if (validation.errors.length > 0) {
        validation.errors.forEach((error) => addIssue(issues, indexScope, `${entry.goalId}: ${error}`))
        continue
      }
      if (validation.strictDescriptionComplete !== entry.strictDescriptionComplete) {
        addIssue(issues, indexScope, `${entry.goalId}: strictDescriptionComplete conflicts with fresh validation`)
        continue
      }
      if (validation.strictDescriptionComplete) ready.add(entry.goalId)
    } catch (error) {
      addIssue(issues, indexScope, `${entry.goalId}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return { ready, claimedGoalIds, issues }
}

const loadDescriptionReadyGoals = async (
  config: DeepUnderstandingSubjectConfig,
  scope: AuthoritativeScope,
  issues: string[],
): Promise<Set<string>> => {
  const validationResults: Array<{ path: string; ready: Set<string>; claimedGoalIds: Set<string> }> = []
  const ownerByGoalId = new Map<string, string>()
  const uniqueClaims = new Set<string>()
  for (const indexPath of config.resolutionIndexPaths) {
    const result = await validateResolutionIndex(indexPath, config, scope)
    result.issues.forEach((issue) => issues.push(issue))
    validationResults.push({ path: indexPath, ready: result.ready, claimedGoalIds: result.claimedGoalIds })
    result.claimedGoalIds.forEach((goalId) => {
      const previousOwner = claimUniqueGoal(goalId, indexPath, ownerByGoalId, uniqueClaims)
      if (previousOwner) {
        addIssue(issues, config.subject, `description-resolution overlap for ${goalId}: ${previousOwner} and ${indexPath}`)
      }
    })
  }
  const ready = new Set<string>()
  validationResults.forEach((result) => {
    result.ready.forEach((goalId) => {
      if (uniqueClaims.has(goalId)) ready.add(goalId)
    })
  })
  return ready
}

const loadEvidenceReadyGoals = (
  config: DeepUnderstandingSubjectConfig,
  scope: AuthoritativeScope,
  issues: string[],
): Set<string> => {
  const validatedByConfig = new Map<string, Set<string>>()
  const ownerByGoalId = new Map<string, string>()
  const uniqueClaims = new Set<string>()
  for (const configPath of config.positiveEvidenceConfigPaths) {
    let rawEvidenceConfig: PositiveGoalEvidenceReviewConfig
    try {
      rawEvidenceConfig = loadJson<PositiveGoalEvidenceReviewConfig>(configPath)
      const rawGoalIds = Array.isArray(rawEvidenceConfig.scope?.goalIds)
        ? rawEvidenceConfig.scope.goalIds
        : []
      rawGoalIds.forEach((goalId) => {
        const previousOwner = claimUniqueGoal(goalId, configPath, ownerByGoalId, uniqueClaims)
        if (previousOwner) {
          addIssue(issues, config.subject, `positive-evidence overlap for ${goalId}: ${previousOwner} and ${configPath}`)
        }
      })
    } catch (error) {
      addIssue(issues, config.subject, `${configPath}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }
    let result: ReturnType<typeof reviewPositiveGoalEvidenceConfig>
    try {
      result = reviewPositiveGoalEvidenceConfig(configPath)
    } catch (error) {
      addIssue(issues, config.subject, `${configPath}: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }
    const evidenceConfig: PositiveGoalEvidenceReviewConfig = result.config
    const duplicateScopeGoalIds = duplicateValues(evidenceConfig.scope.goalIds)
    duplicateScopeGoalIds.forEach((goalId) => {
      addIssue(issues, config.subject, `${configPath}: duplicate configured evidence goal ${goalId}`)
    })
    if (
      evidenceConfig.landscapeId !== scope.landscape.landscapeId
      || evidenceConfig.landscapePath !== config.landscapePath
      || evidenceConfig.semanticKindLedgerPath !== config.semanticKindLedgerPath
    ) {
      addIssue(issues, config.subject, `${configPath}: evidence config is bound to another subject source`)
      continue
    }
    if (result.errors.length > 0 || duplicateScopeGoalIds.length > 0) {
      result.errors.forEach((error) => addIssue(issues, config.subject, `${configPath}: ${error}`))
      continue
    }
    const configReady = new Set<string>()
    result.records.forEach((record) => {
      if (!scope.atomicGoalIds.has(record.goalId)) {
        addIssue(issues, config.subject, `${configPath}: evidence goal ${record.goalId} is not current curricularAtomic`)
        return
      }
      const acceptedCandidate = (
        (record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate')
        || (record.status === 'approved' && record.reviewAuthority === 'human')
      )
      if (acceptedCandidate) configReady.add(record.goalId)
    })
    validatedByConfig.set(configPath, configReady)
  }
  const ready = new Set<string>()
  validatedByConfig.forEach((goalIds) => {
    goalIds.forEach((goalId) => {
      if (uniqueClaims.has(goalId)) ready.add(goalId)
    })
  })
  return ready
}

const validateConfig = (raw: unknown): DeepUnderstandingRolloutConfig => {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const schema = loadJson<JsonObject>(configSchemaPath)
  const validator = ajv.compile(schema)
  if (!validator(raw)) {
    throw new Error(`Invalid deep-understanding rollout config: ${ajv.errorsText(validator.errors, { separator: '; ' })}`)
  }
  const config = raw as DeepUnderstandingRolloutConfig
  const duplicateSubjects = duplicateValues(config.subjects.map(({ subject }) => subject))
  if (duplicateSubjects.length > 0) {
    throw new Error(`Duplicate rollout subjects: ${duplicateSubjects.join(', ')}`)
  }
  return config
}

export const loadDeepUnderstandingRolloutConfig = (
  configuredPath = defaultConfigPath,
): DeepUnderstandingRolloutConfig => validateConfig(loadJson<unknown>(configuredPath))

export const generateDeepUnderstandingRollout = async (
  configuredPath = defaultConfigPath,
): Promise<DeepUnderstandingRolloutReport> => {
  const config = loadDeepUnderstandingRolloutConfig(configuredPath)
  const subjects: DeepUnderstandingSubjectReport[] = []
  for (const subjectConfig of config.subjects) {
    const scope = loadAuthoritativeScope(subjectConfig)
    const issues = [...scope.issues]
    const [descriptionReady, atomicityReady, memoryReady, visualizationReady] = await Promise.all([
      loadDescriptionReadyGoals(subjectConfig, scope, issues),
      Promise.resolve(loadAtomicityReadyGoals(subjectConfig, scope, issues)),
      Promise.resolve(loadMemoryReadyGoals(subjectConfig, scope, issues)),
      Promise.resolve(loadVisualizationReadyGoals(subjectConfig, scope, issues)),
    ])
    const evidenceReady = loadEvidenceReadyGoals(subjectConfig, scope, issues)
    const strictCompleteGoalIds = scope.denominator === null
      ? []
      : intersectStrictGoalGates(scope.atomicGoalIds, [
        descriptionReady,
        evidenceReady,
        atomicityReady,
        memoryReady,
        visualizationReady,
      ])
    const uniqueIssues = [...new Set(issues)].sort()
    subjects.push({
      subject: subjectConfig.subject,
      label: subjectConfig.label,
      denominator: scope.denominator,
      strictComplete: strictCompleteGoalIds.length,
      percentage: formatRolloutPercentage(strictCompleteGoalIds.length, scope.denominator),
      remaining: scope.denominator === null ? null : scope.denominator - strictCompleteGoalIds.length,
      gates: {
        currentDescriptionResolutions: descriptionReady.size,
        currentPositiveEvidenceProfiles: evidenceReady.size,
        currentSemanticAtomicityDecisions: atomicityReady.size,
        currentMemoryReviewDecisions: memoryReady.size,
        currentVisualizationQaRecords: visualizationReady.size,
      },
      strictCompleteGoalIds,
      issues: uniqueIssues,
    })
  }
  return {
    schemaVersion: 1,
    reportId: config.reportId,
    subjects,
    blockingIssueCount: subjects.reduce((sum, subject) => sum + subject.issues.length, 0),
  }
}

const parseArgs = (argv: string[]): CliArgs => {
  const args: CliArgs = { configPath: defaultConfigPath, mode: 'report', format: 'text' }
  argv.forEach((arg) => {
    if (arg.startsWith('--config=')) args.configPath = arg.slice('--config='.length)
    else if (arg === '--mode=report') args.mode = 'report'
    else if (arg === '--mode=check' || arg === '--check') args.mode = 'check'
    else if (arg === '--format=text') args.format = 'text'
    else if (arg === '--format=json') args.format = 'json'
    else throw new Error(`Unknown argument: ${arg}`)
  })
  return args
}

const renderText = (report: DeepUnderstandingRolloutReport): string => {
  const lines = [`# Deep Understanding Rollout: ${report.reportId}`]
  report.subjects.forEach((subject) => {
    const denominator = subject.denominator === null ? 'n/a' : String(subject.denominator)
    lines.push(`${subject.label}: ${subject.strictComplete}/${denominator} (${subject.percentage})`)
    lines.push(
      `  Gates: descriptions=${subject.gates.currentDescriptionResolutions}, `
      + `evidence=${subject.gates.currentPositiveEvidenceProfiles}, `
      + `atomicity=${subject.gates.currentSemanticAtomicityDecisions}, `
      + `memory=${subject.gates.currentMemoryReviewDecisions}, `
      + `visualization=${subject.gates.currentVisualizationQaRecords}`,
    )
    subject.issues.forEach((issue) => lines.push(`  BLOCKING: ${issue}`))
  })
  lines.push(`Blocking issues: ${report.blockingIssueCount}`)
  return lines.join('\n')
}

const main = async (): Promise<void> => {
  const args = parseArgs(process.argv.slice(2))
  const report = await generateDeepUnderstandingRollout(args.configPath)
  console.log(args.format === 'json' ? JSON.stringify(report, null, 2) : renderText(report))
  if (args.mode === 'check' && report.blockingIssueCount > 0) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
