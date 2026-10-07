import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import {
  POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
  POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
  POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
  type PositiveGoalEvidenceProfile,
  type PositiveGoalEvidenceReviewRecord,
} from './positiveGoalEvidenceProfileModel'
import {
  reviewPositiveGoalEvidenceConfig,
  type PositiveGoalEvidenceReviewConfig,
} from './positiveGoalEvidenceReview'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

type Digest = `sha256:${string}`

type CandidateSpec = {
  goalId: string
  reason: string
  evidenceLevel?: PositiveGoalEvidenceReviewRecord['evidenceLevel']
  maximumClaimScope?: PositiveGoalEvidenceReviewRecord['maximumClaimScope']
  dissent?: string[]
  profile: PositiveGoalEvidenceProfile
}

type CandidateSet = {
  schemaVersion: 1
  authoringContract: 'positive-understanding-evidence-candidates-v1'
  reviewId: string
  reviewedAt: string
  reviewer: string
  goals: CandidateSpec[]
}

type SemanticKindLedger = {
  sourceLandscapeId: string
  decisions: Array<{
    goalId: string
    semanticKind: string
    decisionStatus: string
  }>
}

export type AtomicWriteOperations = {
  writeFile: (path: string, bytes: Buffer, options: { flag: 'wx' }) => Promise<void>
  rename: (temporaryPath: string, targetPath: string) => Promise<void>
  rm: (path: string, options: { force: true }) => Promise<void>
}

const DEFAULT_ATOMIC_WRITE_OPERATIONS: AtomicWriteOperations = {
  writeFile,
  rename,
  rm,
}

const sha256 = (value: Buffer | string): Digest => (
  `sha256:${createHash('sha256').update(value).digest('hex')}`
)

const repositoryPath = (configuredPath: string, label: string) => {
  const absolutePath = resolve(REPOSITORY_ROOT, configuredPath)
  const relativePath = relative(REPOSITORY_ROOT, absolutePath)
  if (relativePath === '' || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`${label} must resolve below the repository root: ${configuredPath}`)
  }
  return absolutePath
}

const parseJson = <T>(bytes: Buffer, label: string): T => {
  try {
    return JSON.parse(bytes.toString('utf8')) as T
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const duplicates = (values: readonly string[]) => {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  values.forEach((value) => {
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  })
  return [...repeated].sort()
}

const sameOrderedValues = (left: readonly string[], right: readonly string[]) => (
  left.length === right.length && left.every((value, index) => value === right[index])
)

export const replaceFileAtomically = async (
  targetPath: string,
  bytes: Buffer,
  operations: AtomicWriteOperations = DEFAULT_ATOMIC_WRITE_OPERATIONS,
) => {
  const temporaryPath = resolve(
    dirname(targetPath),
    `.${basename(targetPath)}.${process.pid}.${randomUUID()}.tmp`,
  )
  let committed = false
  let failed = false
  let failure: unknown
  try {
    await operations.writeFile(temporaryPath, bytes, { flag: 'wx' })
    await operations.rename(temporaryPath, targetPath)
    committed = true
  } catch (error) {
    failed = true
    failure = error
  }
  if (!committed) {
    try {
      await operations.rm(temporaryPath, { force: true })
    } catch (cleanupError) {
      if (!failed) throw cleanupError
    }
  }
  if (failed) throw failure
}

const resourceDigestsForGoal = async (
  goal: LearningGoal,
  reviewedResourceTypes: ReadonlySet<string>,
) => {
  const digests: Record<string, string> = {}
  if (!reviewedResourceTypes.has('goal-visualization')) return digests

  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue
    if (!link.url.startsWith('/assets/goal-visualizations/')) {
      throw new Error(`${goal.id}: unsupported goal-visualization URL ${link.url}`)
    }
    const assetPath = resolve(REPOSITORY_ROOT, 'app/public', link.url.slice(1))
    if (!existsSync(assetPath)) {
      throw new Error(`${goal.id}: goal-visualization asset is missing at ${assetPath}`)
    }
    digests[link.url] = sha256(await readFile(assetPath))
  }
  return digests
}

export const buildPositiveGoalEvidenceCandidateRecords = async ({
  config,
  candidateSet,
}: {
  config: PositiveGoalEvidenceReviewConfig
  candidateSet: CandidateSet
}) => {
  if (candidateSet.schemaVersion !== 1 || candidateSet.authoringContract !== 'positive-understanding-evidence-candidates-v1') {
    throw new Error('Candidate set must use positive-understanding-evidence-candidates-v1')
  }
  if (candidateSet.reviewId !== config.reviewId) {
    throw new Error(`Candidate reviewId ${candidateSet.reviewId} does not match ${config.reviewId}`)
  }
  if (!Number.isFinite(Date.parse(candidateSet.reviewedAt))) {
    throw new Error(`Candidate reviewedAt is not a valid date-time: ${candidateSet.reviewedAt}`)
  }
  if (!candidateSet.reviewer.trim()) throw new Error('Candidate reviewer must be non-blank')

  const configuredDuplicates = duplicates(config.scope.goalIds)
  const candidateDuplicates = duplicates(candidateSet.goals.map(({ goalId }) => goalId))
  if (configuredDuplicates.length > 0) {
    throw new Error(`Configured scope repeats goalIds: ${configuredDuplicates.join(', ')}`)
  }
  if (candidateDuplicates.length > 0) {
    throw new Error(`Candidate set repeats goalIds: ${candidateDuplicates.join(', ')}`)
  }
  if (!sameOrderedValues(config.scope.goalIds, candidateSet.goals.map(({ goalId }) => goalId))) {
    throw new Error('Candidate goalIds must match the configured scope exactly and in order')
  }

  const [landscapeBytes, ledgerBytes, criteriaBytes] = await Promise.all([
    readFile(repositoryPath(config.landscapePath, 'landscapePath')),
    readFile(repositoryPath(config.semanticKindLedgerPath, 'semanticKindLedgerPath')),
    readFile(repositoryPath(config.reviewCriteriaPath, 'reviewCriteriaPath')),
  ])
  const landscape = parseJson<SkillLandscape>(landscapeBytes, config.landscapePath)
  const ledger = parseJson<SemanticKindLedger>(ledgerBytes, config.semanticKindLedgerPath)
  if (landscape.landscapeId !== config.landscapeId || ledger.sourceLandscapeId !== config.landscapeId) {
    throw new Error('Landscape, semantic-kind ledger, and review config identities disagree')
  }
  const criteriaFingerprint = sha256(criteriaBytes)
  const goalsById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const semanticKindsByGoalId = new Map(
    ledger.decisions
      .filter(({ decisionStatus }) => decisionStatus === 'authoritative')
      .map(({ goalId, semanticKind }) => [goalId, semanticKind]),
  )
  const reviewedResourceTypes = new Set(config.reviewedResourceTypes)

  const records: PositiveGoalEvidenceReviewRecord[] = []
  for (const candidate of candidateSet.goals) {
    const goal = goalsById.get(candidate.goalId)
    if (!goal) throw new Error(`${candidate.goalId}: goal does not exist in the configured landscape`)
    const semanticKind = semanticKindsByGoalId.get(candidate.goalId)
    if (semanticKind !== 'curricularAtomic') {
      throw new Error(`${candidate.goalId}: expected authoritative curricularAtomic semantic kind, received ${semanticKind ?? 'none'}`)
    }
    if (!candidate.reason.trim()) throw new Error(`${candidate.goalId}: reason must be non-blank`)
    const resourceDigests = await resourceDigestsForGoal(goal, reviewedResourceTypes)
    const record: PositiveGoalEvidenceReviewRecord = {
      $schema: POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
      schemaVersion: POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
      reviewId: config.reviewId,
      goalFingerprintRuleVersion: POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
      profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
      reviewCriteriaFingerprint: criteriaFingerprint,
      landscapeId: config.landscapeId,
      goalId: candidate.goalId,
      goalFingerprint: fingerprintGoalForPositiveEvidence(goal, semanticKind),
      reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(
        goal,
        criteriaFingerprint,
        resourceDigests,
        semanticKind,
      ),
      profileFingerprint: fingerprintPositiveGoalEvidenceProfile(candidate.profile),
      status: 'needs_human_review',
      reviewAuthority: 'ai_candidate',
      reviewedAt: candidateSet.reviewedAt,
      reviewer: candidateSet.reviewer,
      reason: candidate.reason,
      evidenceLevel: candidate.evidenceLevel ?? 'E1',
      maximumClaimScope: candidate.maximumClaimScope ?? 'G1',
      reviewRunIds: [],
      dissent: candidate.dissent ?? [],
      profile: candidate.profile,
    }
    const semanticErrors = validatePositiveGoalEvidenceRecordSemantics(
      record,
      goal,
      resourceDigests,
      semanticKind,
    )
    if (semanticErrors.length > 0) throw new Error(semanticErrors.join('\n'))
    records.push(record)
  }
  return records
}

const parseArgs = (argv: string[]) => {
  let configPath = ''
  let candidatesPath = ''
  let write = false
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--write') {
      if (write) throw new Error('Duplicate --write')
      write = true
    } else if (arg === '--config') {
      if (configPath || !argv[index + 1]) throw new Error('--config requires exactly one path')
      configPath = argv[index + 1]
      index += 1
    } else if (arg === '--candidates') {
      if (candidatesPath || !argv[index + 1]) throw new Error('--candidates requires exactly one path')
      candidatesPath = argv[index + 1]
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  if (!configPath || !candidatesPath) {
    throw new Error('Usage: tsx scripts/materializePositiveGoalEvidenceCandidates.ts --config <config.json> --candidates <candidate-set.json> [--write]')
  }
  return { configPath, candidatesPath, write }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const config = parseJson<PositiveGoalEvidenceReviewConfig>(
    await readFile(repositoryPath(args.configPath, 'config')),
    args.configPath,
  )
  const candidateSet = parseJson<CandidateSet>(
    await readFile(repositoryPath(args.candidatesPath, 'candidates')),
    args.candidatesPath,
  )
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  const expectedBytes = Buffer.from(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
  const reviewPath = repositoryPath(config.reviewPath, 'reviewPath')
  if (args.write) {
    await replaceFileAtomically(reviewPath, expectedBytes)
  } else {
    const actualBytes = await readFile(reviewPath)
    if (!actualBytes.equals(expectedBytes)) {
      throw new Error(`${config.reviewPath} does not match the current candidate set and inputs`)
    }
  }
  const reviewed = reviewPositiveGoalEvidenceConfig(args.configPath)
  if (reviewed.errors.length > 0) throw new Error(reviewed.errors.join('\n'))
  console.log(
    `${args.write ? 'Wrote' : 'Verified'} ${config.reviewPath}: ${records.length} current AI candidate profile(s).`,
  )
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main()
}
