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

type AuditDecision = {
  goalId?: string
  decision?: string
  findings?: unknown[]
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const write = process.argv.includes('--write')
const batchDirectory = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-28/'
    + 'batch-014-j7-geometry-measurement-fast16-stable-carryover-3-v1',
)
const originalSourcePath = resolve(batchDirectory, 'positive-evidence-original-keep10-source.candidates.json')
const correctedSourcePath = resolve(batchDirectory, 'positive-evidence-corrected-keep10-source.candidates.json')
const originalAuditPath = resolve(batchDirectory, 'independent-profile-audit-keep10-original.json')
const independentReauditPath = resolve(batchDirectory, 'independent-profile-reaudit-keep10-corrected.json')
const targetPath = resolve(
  repositoryRoot,
  'curricula/DE/Gymnasium/quality/goal-evidence/'
    + 'canonical-math-positive-understanding-evidence-rollout-v1-'
    + 'j7-fast16-stable3-current-v1.candidates.json',
)

const expectedOriginalSourceDigest = '2b1130fbf18a29739c226a51cfdf41d36f22cd88c8e279a2d74fba6c30bce440'
const expectedCorrectedSourceDigest = '3758f6bd43edeb89f3339c72bd141472c18d2e82476eba028041760a6abd7cd8'
const expectedOriginalAuditDigest = 'eecfb479295e8ecc555009189aa6c708b3ff888e6f63d2b1de69e163848c3101'
const expectedIndependentReauditDigest = '317447738ed4558932af1ea5070ffb433eaeb41efeaa1fe1fc90786c5bfea778'
const targetReviewId = 'canonical-math-positive-evidence-j7-fast16-stable3-current-v1'

const goalIds = [
  '121e3fdf-54d2-4d46-bc2d-f6e725f10f41',
  '3e53a39b-1c75-4034-a647-8de85719e1fb',
  'ad26e4d9-b025-57ec-8f25-df4a2415cc62',
] as const

const deferredOrIncompatibleGoalIds = [
  '34200b88-c616-58f6-aa03-efb9fd766f88',
  'f509a549-aee5-5468-af73-5b1efa3f342c',
  'fc047e6e-5d6d-460f-99fc-ade3a23b9a8e',
  'b37851f1-d64a-47ec-a54a-1e70fa5586a9',
  'de393ab3-d2af-5476-8b46-315185abb805',
  '3017e774-8d9f-5129-828f-7684db5afc1e',
  'dcda6fdf-108f-5ea1-bce7-6f30d6443517',
] as const

const originalTaskDemandDe = 'Klassifiziere vier Dreiecke jeweils vollständig nach Seiten und Winkeln und verwende für Seitenklassen die inklusive Konvention: A mit Seiten 5, 5, 6 und Winkeln 53, 53, 74 Grad; B mit Seiten 3, 4, 5 und einem markierten rechten Winkel; C mit drei gleich markierten Seiten; D mit Seiten 4, 4, 7 und einem Winkel von 122 Grad. Begründe jede Bezeichnung.'
const originalTaskDemandEn = 'Classify four triangles completely by sides and angles, using the inclusive convention for side classes: A with sides 5, 5, 6 and angles 53, 53, 74 degrees; B with sides 3, 4, 5 and a marked right angle; C with three equally marked sides; D with sides 4, 4, 7 and one angle of 122 degrees. Justify every label.'
const correctedTaskDemandDe = 'Klassifiziere vier Dreiecke jeweils vollständig nach Seiten und Winkeln und verwende für Seitenklassen die inklusive Konvention: A mit Seiten 5, 5, 6 und Winkeln von ungefähr 53, 53 und 74 Grad; B mit Seiten 3, 4, 5 und einem markierten rechten Winkel; C mit drei gleich markierten Seiten; D mit Seiten 4, 4, 7 und einem Winkel von ungefähr 122 Grad. Begründe jede Bezeichnung.'
const correctedTaskDemandEn = 'Classify four triangles completely by sides and angles, using the inclusive convention for side classes: A with sides 5, 5, 6 and angles of approximately 53, 53, and 74 degrees; B with sides 3, 4, 5 and a marked right angle; C with three equally marked sides; D with sides 4, 4, 7 and one angle of approximately 122 degrees. Justify every label.'

const sha256 = (value: Buffer): string => createHash('sha256').update(value).digest('hex')
const jsonBytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)

const requireCandidateShape = (source: CandidateSet, label: string): void => {
  if (
    source.schemaVersion !== 1
    || source.authoringContract !== 'positive-understanding-evidence-candidates-v1'
    || source.goals.length !== 10
    || new Set(source.goals.map(({ goalId }) => goalId)).size !== 10
  ) {
    throw new Error(`${label} J7 keep10 evidence source has invalid structure`)
  }
}

const findClassificationCase = (source: CandidateSet): Record<string, unknown> => {
  const goal = source.goals.find(({ goalId }) => goalId === 'de393ab3-d2af-5476-8b46-315185abb805')
  const cases = goal?.profile.applicationCaseBriefs
  if (!Array.isArray(cases)) throw new Error('J7 triangle profile has no application cases')
  const selected = cases.find((candidate) => (
    typeof candidate === 'object'
    && candidate !== null
    && (candidate as { id?: string }).id === 'classification-cards-two-axes'
  ))
  if (!selected || typeof selected !== 'object') {
    throw new Error('J7 triangle classification case is missing')
  }
  return selected as Record<string, unknown>
}

const main = async (): Promise<void> => {
  const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--write')
  if (unknownArgs.length > 0) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`)

  const [originalBytes, correctedBytes, originalAuditBytes, independentReauditBytes] = await Promise.all([
    readFile(originalSourcePath),
    readFile(correctedSourcePath),
    readFile(originalAuditPath),
    readFile(independentReauditPath),
  ])
  const digestChecks = [
    [originalBytes, expectedOriginalSourceDigest, originalSourcePath],
    [correctedBytes, expectedCorrectedSourceDigest, correctedSourcePath],
    [originalAuditBytes, expectedOriginalAuditDigest, originalAuditPath],
    [independentReauditBytes, expectedIndependentReauditDigest, independentReauditPath],
  ] as const
  for (const [bytes, expected, path] of digestChecks) {
    if (sha256(bytes) !== expected) throw new Error(`J7 stable evidence source digest changed: ${path}`)
  }

  const original = JSON.parse(originalBytes.toString('utf8')) as CandidateSet
  const corrected = JSON.parse(correctedBytes.toString('utf8')) as CandidateSet
  requireCandidateShape(original, 'Original')
  requireCandidateShape(corrected, 'Corrected')
  if (original.reviewId !== corrected.reviewId) {
    throw new Error('J7 corrected evidence source changed the source review identity')
  }

  const originalCase = findClassificationCase(original)
  const correctedCase = findClassificationCase(corrected)
  if (
    originalCase.taskDemandDe !== originalTaskDemandDe
    || originalCase.taskDemandEn !== originalTaskDemandEn
    || correctedCase.taskDemandDe !== correctedTaskDemandDe
    || correctedCase.taskDemandEn !== correctedTaskDemandEn
  ) {
    throw new Error('J7 triangle approximation correction no longer matches the exact bounded wording')
  }
  const reconstructedOriginal = structuredClone(corrected)
  const reconstructedCase = findClassificationCase(reconstructedOriginal)
  reconstructedCase.taskDemandDe = originalTaskDemandDe
  reconstructedCase.taskDemandEn = originalTaskDemandEn
  if (JSON.stringify(reconstructedOriginal) !== JSON.stringify(original)) {
    throw new Error('J7 corrected evidence source contains changes beyond the two audited approximation qualifiers')
  }

  const originalAudit = JSON.parse(originalAuditBytes.toString('utf8')) as {
    overallDecision?: string
    allTenProfilesPass?: boolean
    counts?: { profiles?: number; pass?: number; revise?: number; block?: number; remainingFindings?: number }
    inputArtifacts?: { candidates?: { sha256?: string; profileCount?: number } }
    goalDecisions?: AuditDecision[]
    remainingFindings?: Array<{ goalId?: string; decision?: string; findingId?: string }>
  }
  const originalTriangleDecision = originalAudit.goalDecisions?.find(
    ({ goalId }) => goalId === 'de393ab3-d2af-5476-8b46-315185abb805',
  )
  if (
    originalAudit.overallDecision !== 'REVISE'
    || originalAudit.allTenProfilesPass !== false
    || originalAudit.counts?.profiles !== 10
    || originalAudit.counts.pass !== 9
    || originalAudit.counts.revise !== 1
    || originalAudit.counts.block !== 0
    || originalAudit.counts.remainingFindings !== 1
    || originalAudit.inputArtifacts?.candidates?.sha256 !== expectedOriginalSourceDigest
    || originalAudit.inputArtifacts.candidates.profileCount !== 10
    || originalAudit.goalDecisions?.length !== 10
    || originalTriangleDecision?.decision !== 'REVISE'
    || originalTriangleDecision.findings?.length !== 1
    || originalAudit.remainingFindings?.length !== 1
    || originalAudit.remainingFindings[0]?.findingId !== 'MATH-J7-FRESH-001'
  ) {
    throw new Error('J7 original independent REVISE audit is not the exact expected finding')
  }

  const independentReaudit = JSON.parse(independentReauditBytes.toString('utf8')) as {
    overallDecision?: string
    allTenProfilesPass?: boolean
    summary?: { candidateGoalCount?: number; auditedGoalCount?: number; passingGoalCount?: number; failingGoalCount?: number }
    auditIsolation?: { priorAuditJudgmentsUsed?: boolean; repositoryWritesPerformed?: boolean }
    inputArtifacts?: { candidates?: { sha256?: string; goalCount?: number } }
    goalDecisions?: AuditDecision[]
    remainingFindings?: unknown[]
  }
  if (
    independentReaudit.overallDecision !== 'PASS'
    || independentReaudit.allTenProfilesPass !== true
    || independentReaudit.summary?.candidateGoalCount !== 10
    || independentReaudit.summary.auditedGoalCount !== 10
    || independentReaudit.summary.passingGoalCount !== 10
    || independentReaudit.summary.failingGoalCount !== 0
    || independentReaudit.auditIsolation?.priorAuditJudgmentsUsed !== false
    || independentReaudit.auditIsolation.repositoryWritesPerformed !== false
    || independentReaudit.inputArtifacts?.candidates?.sha256 !== expectedCorrectedSourceDigest
    || independentReaudit.inputArtifacts.candidates.goalCount !== 10
    || independentReaudit.goalDecisions?.length !== 10
    || independentReaudit.goalDecisions.some(({ decision, findings }) => (
      decision !== 'PASS' || (findings?.length ?? 0) !== 0
    ))
    || independentReaudit.remainingFindings?.length !== 0
  ) {
    throw new Error('J7 corrected independent re-audit is not a ten-profile zero-finding PASS')
  }

  const selected = goalIds.map((goalId) => corrected.goals.find((goal) => goal.goalId === goalId))
  if (selected.some((goal) => !goal)) throw new Error('J7 corrected source is missing a stable3 goal')
  if (deferredOrIncompatibleGoalIds.some((goalId) => goalIds.includes(goalId as typeof goalIds[number]))) {
    throw new Error('J7 stable3 evidence scope overlaps a deferred or incompatible goal')
  }
  const output: CandidateSet = {
    ...corrected,
    reviewId: targetReviewId,
    reviewedAt: '2026-08-28T14:05:00.000Z',
    reviewer: 'codex-math-j7-fast16-stable3-corrected-evidence-candidate-2026-08-28',
    goals: selected as CandidateGoal[],
  }
  const bytes = jsonBytes(output)
  let current: Buffer | null = null
  try {
    current = await readFile(targetPath)
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
  }
  if (current && !current.equals(bytes)) throw new Error(`Existing J7 stable3 evidence candidates are stale: ${targetPath}`)
  if (!current && !write) throw new Error(`Missing J7 stable3 evidence candidates: ${targetPath}`)
  if (!current && write) await writeFile(targetPath, bytes, { flag: 'wx' })
  console.log(`${write ? 'Materialized' : 'Verified'} Math J7 Fast16 stable evidence candidates: 3/3`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exitCode = 1
})
