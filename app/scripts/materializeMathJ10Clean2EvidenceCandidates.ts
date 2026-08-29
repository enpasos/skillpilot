import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type CandidateGoal = {
  goalId: string
  reason: string
  profile: Record<string, unknown>
  evidenceLevel?: string
  maximumClaimScope?: string
  dissent?: string[]
}

type CandidateSet = {
  schemaVersion: 1
  authoringContract: 'positive-understanding-evidence-candidates-v1'
  reviewId: string
  reviewedAt: string
  reviewer: string
  goals: CandidateGoal[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const sourcePath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-013-j10-functions-trigonometry-deep8-carryover-2-v1/'
    + 'positive-evidence-clean2-corrected-source.candidates.json',
)
const sourceValidationPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-013-j10-functions-trigonometry-deep8-carryover-2-v1/'
    + 'positive-evidence-clean2-corrected-source.validation.json',
)
const originalAuditPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-013-j10-functions-trigonometry-deep8-carryover-2-v1/'
    + 'independent-profile-audit-clean2.json',
)
const independentReauditPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-013-j10-functions-trigonometry-deep8-carryover-2-v1/'
    + 'independent-profile-reaudit-clean2.json',
)
const targetPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-'
    + 'j10-clean2-current-v1.candidates.json',
)
const expectedSourceDigest = '79f984d81959bedde11e477f981a560a4b9e30e947aad72c164acf86f94bf858'
const expectedSourceValidationDigest = '84290ffcc3dfdf4891b0af6c9528e6c410b3731a9a94351ad8ef8e532cb83479'
const expectedOriginalAuditDigest = 'bbd84129e7f78f67eba624a05211c52fe17f00e8cbe6b1398053541ae20bdde4'
const expectedIndependentReauditDigest = '51669640e0fa98b98c83c3a77d8fdb2873858f850a9bac4e1189729f8a0eac39'
const targetReviewId = 'canonical-math-positive-evidence-j10-clean2-current-v1'
const goalIds = [
  '78238608-aaaa-4d12-a9de-54f325e9cf6f',
  '302a857d-ad71-4bdf-81f3-851c95aeefe1',
] as const

const sha256 = (value: Buffer): string => createHash('sha256').update(value).digest('hex')
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const readOptional = async (path: string): Promise<Buffer | null> => {
  try {
    return await readFile(path)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [sourceBytes, sourceValidationBytes, originalAuditBytes, independentReauditBytes] = await Promise.all([
    readFile(sourcePath),
    readFile(sourceValidationPath),
    readFile(originalAuditPath),
    readFile(independentReauditPath),
  ])
  if (sha256(sourceBytes) !== expectedSourceDigest) {
    throw new Error(`J10 corrected clean2 source candidate digest changed: ${sourcePath}`)
  }
  if (sha256(sourceValidationBytes) !== expectedSourceValidationDigest) {
    throw new Error(`J10 corrected clean2 validation digest changed: ${sourceValidationPath}`)
  }
  if (sha256(originalAuditBytes) !== expectedOriginalAuditDigest) {
    throw new Error(`J10 clean2 original audit digest changed: ${originalAuditPath}`)
  }
  if (sha256(independentReauditBytes) !== expectedIndependentReauditDigest) {
    throw new Error(`J10 clean2 independent re-audit digest changed: ${independentReauditPath}`)
  }
  const source = JSON.parse(sourceBytes.toString('utf8')) as CandidateSet
  const sourceValidation = JSON.parse(sourceValidationBytes.toString('utf8')) as {
    valid?: boolean
    errors?: unknown[]
    materializedInRepository?: boolean
    strictProgressClaimed?: boolean
    inputArtifacts?: { correctedCandidates?: { sha256?: string } }
  }
  const originalAudit = JSON.parse(originalAuditBytes.toString('utf8')) as {
    overallDecision?: string
    goals?: Array<{ goalId?: string; decision?: string }>
  }
  const independentReaudit = JSON.parse(independentReauditBytes.toString('utf8')) as {
    overallDecision?: string
    allSevenBlockingCorrectionsImplemented?: boolean
    remainingFindings?: unknown[]
    inputArtifacts?: { correctedCandidates?: string; sourceIndependentAudit?: string }
    goalDecisions?: Array<{ goalId?: string; decision?: string }>
  }
  if (
    source.schemaVersion !== 1
    || source.authoringContract !== 'positive-understanding-evidence-candidates-v1'
    || source.reviewId !== 'canonical-math-positive-evidence-j10-keep2-corrected-clean2-current-v1'
  ) {
    throw new Error('J10 corrected clean2 source candidate identity is invalid')
  }
  if (
    sourceValidation.valid !== true
    || (sourceValidation.errors?.length ?? 0) !== 0
    || sourceValidation.materializedInRepository !== false
    || sourceValidation.strictProgressClaimed !== false
    || sourceValidation.inputArtifacts?.correctedCandidates?.sha256 !== `sha256:${expectedSourceDigest}`
  ) {
    throw new Error('J10 corrected clean2 source validation is not a clean external candidate receipt')
  }
  if (
    originalAudit.overallDecision !== 'REVISE'
    || originalAudit.goals?.length !== goalIds.length
    || originalAudit.goals.some((goal) => goal.decision !== 'REVISE')
  ) {
    throw new Error('J10 clean2 original independent audit no longer proves the bounded revision requirement')
  }
  if (
    independentReaudit.overallDecision !== 'PASS'
    || independentReaudit.allSevenBlockingCorrectionsImplemented !== true
    || (independentReaudit.remainingFindings?.length ?? -1) !== 0
    || independentReaudit.inputArtifacts?.correctedCandidates !== `sha256:${expectedSourceDigest}`
    || independentReaudit.inputArtifacts?.sourceIndependentAudit !== `sha256:${expectedOriginalAuditDigest}`
    || independentReaudit.goalDecisions?.length !== goalIds.length
    || independentReaudit.goalDecisions.some((goal) => (
      goal.decision !== 'PASS' || !goalIds.includes(goal.goalId as typeof goalIds[number])
    ))
  ) {
    throw new Error('J10 corrected clean2 independent re-audit is not a complete bound PASS')
  }
  const sourceGoalsById = new Map(source.goals.map((goal) => [goal.goalId, goal]))
  const goals = goalIds.map((goalId) => {
    const goal = sourceGoalsById.get(goalId)
    if (!goal) throw new Error(`J10 corrected clean2 source candidates are missing ${goalId}`)
    return goal
  })
  const target: CandidateSet = {
    ...source,
    reviewId: targetReviewId,
    reviewer: 'codex-math-j10-clean2-corrected-and-independently-reaudited-2026-08-28',
    goals,
  }
  const expected = jsonBytes(target)
  const current = await readOptional(targetPath)
  if (current) {
    if (!current.equals(expected)) throw new Error(`J10 clean2 candidate set is stale: ${targetPath}`)
  } else if (write) {
    await writeFile(targetPath, expected, { flag: 'wx' })
  } else {
    throw new Error(`J10 clean2 candidate set is missing: ${targetPath}`)
  }
  console.log(
    `${write ? 'Materialized' : 'Verified'} Math J10 clean2 evidence candidates: ${goals.length}/${goalIds.length}`,
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
