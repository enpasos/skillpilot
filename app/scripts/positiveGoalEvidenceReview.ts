import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
  type PositiveGoalEvidenceReviewRecord,
  validatePositiveGoalEvidenceRecordSemantics,
} from './positiveGoalEvidenceProfileModel'

export interface PositiveGoalEvidenceReviewConfig {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json'
  schemaVersion: 2
  reviewId: string
  goalFingerprintRuleVersion: typeof POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION
  profileRuleVersion: typeof POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION
  landscapeId: string
  landscapePath: string
  semanticKindLedgerPath: string
  reviewCriteriaPath: string
  reviewPath: string
  reviewRunManifestPaths?: string[]
  reviewedResourceTypes: Array<'goal-visualization'>
  requireApproved: boolean
  scope: {
    label: string
    goalIds: string[]
  }
}

interface SemanticKindLedger {
  sourceLandscapeId: string
  decisions: Array<{
    goalId: string
    semanticKind: string
    decisionStatus: string
  }>
}

export interface PositiveGoalEvidenceAiRunManifest {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'
  schemaVersion: 1
  runId: string
  bundleFingerprint: string
  bookDigest: string
  provider: string
  model: string
  role: string
  promptFamilyId: string
  promptFingerprint: string
  criteriaFingerprint: string
  generationParametersFingerprint: string
  independenceGroupId: string
  blindToOtherRuns: boolean
  goalIds: string[]
  inputArtifacts: Array<{ role: string; digest: string }>
  startedAt: string
  completedAt: string
  status: 'completed' | 'failed'
  outputDigest: string
  toolchainVersion: string
}

export interface PositiveGoalEvidenceReviewResult {
  config: PositiveGoalEvidenceReviewConfig
  records: PositiveGoalEvidenceReviewRecord[]
  errors: string[]
  counts: {
    approved: number
    needsHumanReview: number
    rejected: number
  }
}

interface Args {
  configPath: string
  mode: 'report' | 'check'
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const schemaPath = resolve(repoRoot, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const configSchemaPath = resolve(repoRoot, 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')
const runManifestSchemaPath = resolve(
  repoRoot,
  'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
)

const sha256 = (value: Buffer | string): string => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const reviewContentArtifactRoles = new Set([
  'book_pdf',
  'book_html',
  'book_model',
  'review_input_json',
  'review_input_jsonl',
  'description_review_batch_input_jsonl',
  'review_markdown',
])

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = { mode: 'report' }
  for (const arg of argv) {
    if (arg.startsWith('--config=')) args.configPath = arg.slice('--config='.length)
    else if (arg === '--mode=check') args.mode = 'check'
    else if (arg === '--mode=report') args.mode = 'report'
    else throw new Error(`Unknown argument: ${arg}`)
  }
  if (!args.configPath) {
    throw new Error('Usage: tsx scripts/positiveGoalEvidenceReview.ts --config=<review.config.json> [--mode=report|--mode=check]')
  }
  return args as Args
}

function repoPath(configuredPath: string): string {
  const absolutePath = resolve(repoRoot, configuredPath)
  const relativePath = relative(repoRoot, absolutePath)
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`Configured path must stay inside the repository: ${configuredPath}`)
  }
  return absolutePath
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function readJsonl(path: string): { records: PositiveGoalEvidenceReviewRecord[]; errors: string[] } {
  const errors: string[] = []
  const records = readFileSync(path, 'utf8')
    .split(/\r?\n/u)
    .map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }))
    .filter(({ text }) => text.length > 0)
    .flatMap(({ text, lineNumber }) => {
      try {
        return [JSON.parse(text) as PositiveGoalEvidenceReviewRecord]
      } catch (error) {
        errors.push(`Line ${lineNumber}: invalid JSON (${error instanceof Error ? error.message : String(error)})`)
        return []
      }
    })
  return { records, errors }
}

function resourceDigestsForGoal(
  goal: SkillLandscape['goals'][number],
  reviewedResourceTypes: ReadonlySet<string>,
): { digests: Record<string, string>; errors: string[] } {
  const digests: Record<string, string> = {}
  const errors: string[] = []
  if (!reviewedResourceTypes.has('goal-visualization')) return { digests, errors }

  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    if (!link.url.startsWith('/assets/goal-visualizations/')) {
      errors.push(`${goal.id}: unsupported goal-visualization URL ${link.url}`)
      continue
    }
    const assetPath = resolve(repoRoot, 'app/public', link.url.slice(1))
    if (!existsSync(assetPath)) {
      errors.push(`${goal.id}: goal-visualization asset is missing at ${assetPath}`)
      continue
    }
    digests[link.url] = sha256(readFileSync(assetPath))
  }
  return { digests, errors }
}

interface ReviewRunManifestState {
  path: string
  manifest?: PositiveGoalEvidenceAiRunManifest
  valid: boolean
}

function validateReviewRunManifestSemantics(
  manifest: PositiveGoalEvidenceAiRunManifest,
  path: string,
  reviewCriteriaFingerprint: string,
): string[] {
  const prefix = `Run manifest ${path} (${manifest.runId})`
  const errors: string[] = []
  if (manifest.status !== 'completed') {
    errors.push(`${prefix}: status must be completed`)
  }
  if (Date.parse(manifest.completedAt) < Date.parse(manifest.startedAt)) {
    errors.push(`${prefix}: completedAt precedes startedAt`)
  }
  if (manifest.criteriaFingerprint !== reviewCriteriaFingerprint) {
    errors.push(`${prefix}: criteriaFingerprint does not match the configured review criteria`)
  }
  if (manifest.role !== 'synthesizer' && manifest.blindToOtherRuns !== true) {
    errors.push(`${prefix}: independent run must be blind to other runs`)
  }

  const artifactDigestsByRole = new Map<string, string[]>()
  for (const artifact of manifest.inputArtifacts) {
    const digests = artifactDigestsByRole.get(artifact.role) ?? []
    digests.push(artifact.digest)
    artifactDigestsByRole.set(artifact.role, digests)
  }
  for (const [role, digests] of artifactDigestsByRole) {
    if (digests.length > 1) errors.push(`${prefix}: inputArtifacts repeat role ${role}`)
  }

  const promptArtifacts = artifactDigestsByRole.get('review_prompt') ?? []
  if (promptArtifacts.length !== 1 || promptArtifacts[0] !== manifest.promptFingerprint) {
    errors.push(`${prefix}: review_prompt artifact does not match promptFingerprint`)
  }
  const criteriaArtifacts = artifactDigestsByRole.get('review_criteria') ?? []
  if (criteriaArtifacts.length !== 1 || criteriaArtifacts[0] !== manifest.criteriaFingerprint) {
    errors.push(`${prefix}: review_criteria artifact does not match criteriaFingerprint`)
  }
  const bookModelArtifacts = artifactDigestsByRole.get('book_model') ?? []
  if (bookModelArtifacts.length > 0 && bookModelArtifacts[0] !== manifest.bookDigest) {
    errors.push(`${prefix}: book_model artifact does not match bookDigest`)
  }
  if (![...artifactDigestsByRole.keys()].some((role) => reviewContentArtifactRoles.has(role))) {
    errors.push(`${prefix}: inputArtifacts must include at least one bound review content artifact`)
  }
  return errors
}

function loadReviewRunManifests(
  configuredPaths: readonly string[],
  validateRunManifest: ReturnType<Ajv2020['compile']>,
  ajv: Ajv2020,
  reviewCriteriaFingerprint: string,
): { states: ReviewRunManifestState[]; errors: string[] } {
  const states: ReviewRunManifestState[] = []
  const errors: string[] = []
  for (const configuredPath of configuredPaths) {
    let manifest: PositiveGoalEvidenceAiRunManifest
    try {
      manifest = loadJson<PositiveGoalEvidenceAiRunManifest>(repoPath(configuredPath))
    } catch (error) {
      errors.push(
        `Run manifest ${configuredPath}: cannot be read as JSON (${error instanceof Error ? error.message : String(error)})`,
      )
      states.push({ path: configuredPath, valid: false })
      continue
    }
    if (!validateRunManifest(manifest)) {
      errors.push(
        `Run manifest ${configuredPath}: ${ajv.errorsText(validateRunManifest.errors, { separator: '; ' })}`,
      )
      states.push({ path: configuredPath, manifest, valid: false })
      continue
    }
    const semanticErrors = validateReviewRunManifestSemantics(
      manifest,
      configuredPath,
      reviewCriteriaFingerprint,
    )
    errors.push(...semanticErrors)
    states.push({ path: configuredPath, manifest, valid: semanticErrors.length === 0 })
  }

  const statesByRunId = new Map<string, ReviewRunManifestState[]>()
  for (const state of states) {
    if (!state.manifest) continue
    const matches = statesByRunId.get(state.manifest.runId) ?? []
    matches.push(state)
    statesByRunId.set(state.manifest.runId, matches)
  }
  for (const [runId, matches] of statesByRunId) {
    if (matches.length > 1) {
      errors.push(
        `Duplicate runId ${runId} across configured manifests: ${matches.map(({ path }) => path).join(', ')}`,
      )
      matches.forEach((state) => { state.valid = false })
    }
  }

  const validManifests = states
    .filter((state): state is ReviewRunManifestState & { manifest: PositiveGoalEvidenceAiRunManifest } => (
      state.valid && state.manifest !== undefined
    ))
    .map(({ manifest }) => manifest)
  const referenceBinding = validManifests[0]
  if (referenceBinding) {
    for (const manifest of validManifests.slice(1)) {
      const conflictingFields: string[] = []
      if (manifest.bundleFingerprint !== referenceBinding.bundleFingerprint) conflictingFields.push('bundleFingerprint')
      if (manifest.bookDigest !== referenceBinding.bookDigest) conflictingFields.push('bookDigest')
      if (manifest.promptFingerprint !== referenceBinding.promptFingerprint) conflictingFields.push('promptFingerprint')
      if (manifest.criteriaFingerprint !== referenceBinding.criteriaFingerprint) conflictingFields.push('criteriaFingerprint')
      if (conflictingFields.length > 0) {
        errors.push(
          `Run manifest ${manifest.runId}: review binding conflicts with ${referenceBinding.runId} for ${conflictingFields.join(', ')}`,
        )
        const state = states.find(({ manifest: candidate }) => candidate === manifest)
        if (state) state.valid = false
      }
    }
  }
  return { states, errors }
}

export function reviewPositiveGoalEvidenceConfig(
  configuredPath: string,
): PositiveGoalEvidenceReviewResult {
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const rawConfig = loadJson<unknown>(repoPath(configuredPath))
  const validateConfig = ajv.compile(loadJson<Record<string, unknown>>(configSchemaPath))
  if (!validateConfig(rawConfig)) {
    throw new Error(`Invalid positive goal-evidence review config: ${ajv.errorsText(validateConfig.errors)}`)
  }
  const config = rawConfig as PositiveGoalEvidenceReviewConfig
  const landscape = loadJson<SkillLandscape>(repoPath(config.landscapePath))
  if (landscape.landscapeId !== config.landscapeId) {
    throw new Error(`Configured landscapeId ${config.landscapeId} does not match ${config.landscapePath}`)
  }
  const semanticKindLedger = loadJson<SemanticKindLedger>(repoPath(config.semanticKindLedgerPath))
  if (semanticKindLedger.sourceLandscapeId !== config.landscapeId) {
    throw new Error(
      `Semantic-kind ledger targets ${semanticKindLedger.sourceLandscapeId}, expected ${config.landscapeId}`,
    )
  }

  const criteriaBytes = readFileSync(repoPath(config.reviewCriteriaPath))
  const reviewCriteriaFingerprint = sha256(criteriaBytes)
  const semanticKindByGoalId = new Map<string, string>()
  const errors: string[] = []
  for (const decision of semanticKindLedger.decisions) {
    if (decision.decisionStatus !== 'authoritative') {
      errors.push(`Semantic-kind decision for ${decision.goalId} is not authoritative`)
    }
    if (semanticKindByGoalId.has(decision.goalId)) {
      errors.push(`Duplicate semantic-kind decision for ${decision.goalId}`)
    }
    semanticKindByGoalId.set(decision.goalId, decision.semanticKind)
  }

  const validateRecord = ajv.compile(loadJson<Record<string, unknown>>(schemaPath))
  const validateRunManifest = ajv.compile(loadJson<Record<string, unknown>>(runManifestSchemaPath))
  const configuredRunManifestPaths = config.reviewRunManifestPaths ?? []
  const runManifestState = loadReviewRunManifests(
    configuredRunManifestPaths,
    validateRunManifest,
    ajv,
    reviewCriteriaFingerprint,
  )
  errors.push(...runManifestState.errors)
  const validRunManifestsById = new Map(
    runManifestState.states
      .filter((state): state is ReviewRunManifestState & { manifest: PositiveGoalEvidenceAiRunManifest } => (
        state.valid && state.manifest !== undefined
      ))
      .map(({ manifest }) => [manifest.runId, manifest]),
  )
  const referencedRunIds = new Set<string>()
  const { records, errors: parseErrors } = readJsonl(repoPath(config.reviewPath))
  errors.push(...parseErrors)
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const configuredGoalIds = new Set(config.scope.goalIds)
  const recordsByGoalId = new Map<string, PositiveGoalEvidenceReviewRecord>()
  const reviewedResourceTypes = new Set(config.reviewedResourceTypes)

  for (const goalId of configuredGoalIds) {
    const goal = goalById.get(goalId)
    if (!goal) {
      errors.push(`${goalId}: configured goal does not exist`)
      continue
    }
    const semanticKind = semanticKindByGoalId.get(goalId)
    if (!semanticKind) errors.push(`${goalId}: no authoritative semantic-kind decision`)
    else if (semanticKind !== 'curricularAtomic') {
      errors.push(`${goalId}: positive understanding-evidence scope requires curricularAtomic, found ${semanticKind}`)
    }
  }

  for (const record of records) {
    const invalidRecordGoalId = record.goalId || '<unknown>'
    if (!validateRecord(record)) {
      errors.push(`${invalidRecordGoalId}: ${ajv.errorsText(validateRecord.errors, { separator: '; ' })}`)
      continue
    }
    if (record.reviewId !== config.reviewId) {
      errors.push(`${record.goalId}: reviewId does not match ${config.reviewId}`)
    }
    if (record.goalFingerprintRuleVersion !== config.goalFingerprintRuleVersion) {
      errors.push(`${record.goalId}: goalFingerprintRuleVersion does not match ${config.goalFingerprintRuleVersion}`)
    }
    if (record.profileRuleVersion !== config.profileRuleVersion) {
      errors.push(`${record.goalId}: profileRuleVersion does not match ${config.profileRuleVersion}`)
    }
    if (record.reviewCriteriaFingerprint !== reviewCriteriaFingerprint) {
      errors.push(`${record.goalId}: reviewCriteriaFingerprint does not match ${config.reviewCriteriaPath}`)
    }
    if (record.landscapeId !== config.landscapeId) {
      errors.push(`${record.goalId}: landscapeId does not match ${config.landscapeId}`)
    }
    if (!configuredGoalIds.has(record.goalId)) {
      errors.push(`${record.goalId}: record is outside the configured scope`)
    }
    if (recordsByGoalId.has(record.goalId)) {
      errors.push(`${record.goalId}: duplicate review record`)
    }
    recordsByGoalId.set(record.goalId, record)

    for (const reviewRunId of record.reviewRunIds) {
      referencedRunIds.add(reviewRunId)
      const manifest = validRunManifestsById.get(reviewRunId)
      if (!manifest) {
        errors.push(
          `${record.goalId}: reviewRunId ${reviewRunId} does not resolve to exactly one valid configured run manifest`,
        )
      } else if (!manifest.goalIds.includes(record.goalId)) {
        errors.push(`${record.goalId}: reviewRunId ${reviewRunId} does not include the goal`)
      }
    }

    const goal = goalById.get(record.goalId)
    const resourceState = goal
      ? resourceDigestsForGoal(goal, reviewedResourceTypes)
      : { digests: {}, errors: [] }
    errors.push(...resourceState.errors)
    const semanticKind = semanticKindByGoalId.get(record.goalId)
    errors.push(...validatePositiveGoalEvidenceRecordSemantics(
      record,
      goal,
      resourceState.digests,
      semanticKind,
    ))
    if (config.requireApproved && record.status !== 'approved') {
      errors.push(`${record.goalId}: configured scope requires an approved profile`)
    }
  }

  for (const goalId of configuredGoalIds) {
    if (!recordsByGoalId.has(goalId)) errors.push(`${goalId}: missing review record`)
  }
  for (const state of runManifestState.states) {
    if (state.manifest && !referencedRunIds.has(state.manifest.runId)) {
      errors.push(`Run manifest ${state.path} (${state.manifest.runId}) is not referenced by any review record`)
    }
  }

  const counts = {
    approved: records.filter(({ status }) => status === 'approved').length,
    needsHumanReview: records.filter(({ status }) => status === 'needs_human_review').length,
    rejected: records.filter(({ status }) => status === 'rejected').length,
  }
  return { config, records, errors, counts }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const result = reviewPositiveGoalEvidenceConfig(args.configPath)
  console.log(`# Positive Goal Evidence Review: ${result.config.reviewId}`)
  console.log(`Scope: ${result.config.scope.label}`)
  console.log(`Configured goals: ${result.config.scope.goalIds.length}`)
  console.log(`Approved: ${result.counts.approved}`)
  console.log(`Needs human review: ${result.counts.needsHumanReview}`)
  console.log(`Rejected: ${result.counts.rejected}`)
  console.log(`Blocking issues: ${result.errors.length}`)
  result.errors.forEach((error) => console.log(`- ${error}`))

  if (args.mode === 'check' && result.errors.length > 0) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
