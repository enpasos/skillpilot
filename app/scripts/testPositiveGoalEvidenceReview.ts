import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal } from '../src/landscapeTypes'
import {
  POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
  POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
  type PositiveGoalEvidenceProfile,
  type PositiveGoalEvidenceReviewRecord,
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
} from './positiveGoalEvidenceProfileModel'
import {
  type PositiveGoalEvidenceAiRunManifest,
  type PositiveGoalEvidenceReviewConfig,
  reviewPositiveGoalEvidenceConfig,
} from './positiveGoalEvidenceReview'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const temporaryRoot = await mkdtemp(join(repoRoot, 'tmp', 'positive-goal-evidence-review-test-'))
const repositoryRelative = (path: string) => relative(repoRoot, path).replaceAll('\\', '/')
const sha256 = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`

const landscapePath = join(temporaryRoot, 'landscape.json')
const ledgerPath = join(temporaryRoot, 'semantic-kinds.json')
const criteriaPath = join(temporaryRoot, 'criteria.md')
const reviewPath = join(temporaryRoot, 'review.jsonl')
const configPath = join(temporaryRoot, 'config.json')
const runOnePath = join(temporaryRoot, 'run-one.json')
const runTwoPath = join(temporaryRoot, 'run-two.json')
const visualizationDirectory = join(
  repoRoot,
  'app/public/assets/goal-visualizations/positive-goal-evidence-review-test',
  basename(temporaryRoot),
)
const visualizationPath = join(visualizationDirectory, 'goal-a.jpg')
const visualizationUrl = `/assets/goal-visualizations/positive-goal-evidence-review-test/${basename(temporaryRoot)}/goal-a.jpg`
const landscapeId = 'positive-goal-evidence-review-test-landscape'
const criteria = '# Test criteria\n\nRequire positive, content-specific understanding evidence.\n'
const criteriaFingerprint = sha256(criteria)
const semanticKind = 'curricularAtomic'
const runPromptFingerprint = sha256('positive-evidence-authoring-prompt')
const runBookDigest = sha256('positive-evidence-book-model')
const runBundleFingerprint = sha256('positive-evidence-review-bundle')

const goal: LearningGoal & { titleEn: string; descriptionEn: string } = {
  id: 'goal-a',
  title: 'Zusammenhang erklären',
  titleEn: 'Explain the relationship',
  description: 'Die lernende Person kann einen fachlichen Zusammenhang erklären und auf einen veränderten Fall übertragen.',
  descriptionEn: 'The learner can explain a subject-specific relationship and transfer it to a changed case.',
  weight: 1,
  requires: [],
  contains: [],
  semanticAtomic: true,
  type: 'atomic',
  resourceLinks: [
    {
      type: 'goal-visualization',
      resourceType: 'image',
      role: 'primary',
      title: 'Test visualization',
      url: visualizationUrl,
      altText: 'Test visualization for a subject-specific relationship.',
      reviewStatus: 'pilot',
    },
  ],
}

const profile: PositiveGoalEvidenceProfile = {
  archetype: 'concept',
  expectations: [
    {
      id: 'relationship',
      essentialUnderstandingDe: 'Die beteiligten Größen stehen in einem begründbaren fachlichen Zusammenhang.',
      essentialUnderstandingEn: 'The involved quantities have a subject-specific relationship that can be justified.',
      observablePerformanceDe: 'Die lernende Person erklärt den Zusammenhang an gegebenen Größen und begründet ihre Zuordnung.',
      observablePerformanceEn: 'The learner explains the relationship for supplied quantities and justifies the assignment.',
    },
  ],
  coverageExpectations: {
    requiredExpectationIds: ['relationship'],
    alternativeExpectationGroups: [],
    minimumIndependentDemonstrations: 2,
    freshVariationRequired: true,
    independentTransferRequired: true,
  },
  variationAxes: [
    {
      id: 'surface-context',
      textDe: 'Veränderter Oberflächenkontext bei gleicher fachlicher Struktur',
      textEn: 'Changed surface context with the same subject-specific structure',
    },
  ],
  applicationCaseBriefs: [
    {
      id: 'case-one',
      taskDemandDe: 'Den Zusammenhang in einer ersten Situation erklären.',
      taskDemandEn: 'Explain the relationship in a first situation.',
      expectedPerformanceDe: 'Die lernende Person ordnet die Größen zu und begründet den Zusammenhang.',
      expectedPerformanceEn: 'The learner assigns the quantities and justifies the relationship.',
      understandingFocusDe: 'Begründete Zuordnung der fachlichen Struktur.',
      understandingFocusEn: 'Justified assignment of the subject-specific structure.',
    },
    {
      id: 'case-two',
      taskDemandDe: 'Den gleichen Zusammenhang in einer veränderten Situation erkennen.',
      taskDemandEn: 'Recognize the same relationship in a changed situation.',
      expectedPerformanceDe: 'Die lernende Person überträgt die Begründung unabhängig auf die neue Situation.',
      expectedPerformanceEn: 'The learner independently transfers the justification to the new situation.',
      understandingFocusDe: 'Transfer trotz veränderter Oberflächenmerkmale.',
      understandingFocusEn: 'Transfer despite changed surface features.',
    },
  ],
}

const record = (): PositiveGoalEvidenceReviewRecord => ({
  $schema: POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
  schemaVersion: 2,
  reviewId: 'positive-review-test',
  goalFingerprintRuleVersion: POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
  reviewCriteriaFingerprint: criteriaFingerprint,
  landscapeId,
  goalId: goal.id,
  goalFingerprint: fingerprintGoalForPositiveEvidence(goal, semanticKind),
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(
    goal,
    criteriaFingerprint,
    {},
    semanticKind,
  ),
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profile),
  status: 'needs_human_review',
  reviewAuthority: 'ai_candidate',
  reviewedAt: '2026-08-25T00:00:00.000Z',
  reviewer: 'codex-test-candidate',
  reason: 'Bound test candidate for positive understanding evidence.',
  evidenceLevel: 'E1',
  maximumClaimScope: 'G1',
  reviewRunIds: [],
  dissent: [],
  profile,
})

const runManifest = (runId: string): PositiveGoalEvidenceAiRunManifest => ({
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId,
  bundleFingerprint: runBundleFingerprint,
  bookDigest: runBookDigest,
  provider: 'same-test-provider',
  model: 'same-test-model',
  role: 'candidate_author',
  promptFamilyId: 'positive-understanding-evidence-authoring-v2',
  promptFingerprint: runPromptFingerprint,
  criteriaFingerprint,
  generationParametersFingerprint: sha256('deterministic-test-generation-parameters'),
  independenceGroupId: 'positive-evidence-test-independent-a',
  blindToOtherRuns: true,
  goalIds: [goal.id],
  inputArtifacts: [
    { role: 'book_model', digest: runBookDigest },
    { role: 'review_prompt', digest: runPromptFingerprint },
    { role: 'review_criteria', digest: criteriaFingerprint },
  ],
  startedAt: '2026-08-25T00:00:00.000Z',
  completedAt: '2026-08-25T00:01:00.000Z',
  status: 'completed',
  outputDigest: sha256(`positive-evidence-output-${runId}`),
  toolchainVersion: 'positive-understanding-evidence-review-test-v1',
})

const config: PositiveGoalEvidenceReviewConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
  schemaVersion: 2,
  reviewId: 'positive-review-test',
  goalFingerprintRuleVersion: POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
  profileRuleVersion: POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,
  landscapeId,
  landscapePath: repositoryRelative(landscapePath),
  semanticKindLedgerPath: repositoryRelative(ledgerPath),
  reviewCriteriaPath: repositoryRelative(criteriaPath),
  reviewPath: repositoryRelative(reviewPath),
  reviewedResourceTypes: [],
  requireApproved: false,
  scope: {
    label: 'Positive evidence test scope',
    goalIds: [goal.id],
  },
}

try {
  await mkdir(temporaryRoot, { recursive: true })
  await mkdir(visualizationDirectory, { recursive: true })
  await Promise.all([
    writeFile(landscapePath, `${JSON.stringify({ landscapeId, goals: [goal] }, null, 2)}\n`),
    writeFile(ledgerPath, `${JSON.stringify({
      sourceLandscapeId: landscapeId,
      decisions: [{ goalId: goal.id, semanticKind, decisionStatus: 'authoritative' }],
    }, null, 2)}\n`),
    writeFile(criteriaPath, criteria),
    writeFile(reviewPath, `${JSON.stringify(record())}\n`),
    writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`),
    writeFile(runOnePath, `${JSON.stringify(runManifest('run-one'), null, 2)}\n`),
    writeFile(runTwoPath, `${JSON.stringify(runManifest('run-two.batch-001'), null, 2)}\n`),
    writeFile(visualizationPath, 'deterministic-test-visualization-bytes'),
  ])

  assert.deepEqual(reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors, [])

  const recordWithRuns = (reviewRunIds: string[]) => ({ ...record(), reviewRunIds })
  await writeFile(reviewPath, `${JSON.stringify(recordWithRuns(['run-one']))}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /reviewRunId run-one does not resolve to exactly one valid configured run manifest/u,
  )

  const configWithRuns = {
    ...config,
    reviewRunManifestPaths: [repositoryRelative(runOnePath), repositoryRelative(runTwoPath)],
  }
  await writeFile(configPath, `${JSON.stringify(configWithRuns, null, 2)}\n`)
  await writeFile(reviewPath, `${JSON.stringify(recordWithRuns(['run-one', 'run-two.batch-001']))}\n`)
  assert.deepEqual(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors,
    [],
    'multiple run manifests from the same provider are valid bindings but do not imply provider diversity',
  )

  await writeFile(reviewPath, `${JSON.stringify(recordWithRuns(['run-one']))}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /run-two\.batch-001.*not referenced/u,
  )

  await writeFile(runTwoPath, `${JSON.stringify(runManifest('run-one'), null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /Duplicate runId run-one/u,
  )
  await writeFile(runTwoPath, `${JSON.stringify(runManifest('run-two.batch-001'), null, 2)}\n`)

  await writeFile(reviewPath, `${JSON.stringify(recordWithRuns(['foreign-run']))}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /reviewRunId foreign-run does not resolve/u,
  )

  const singleRunConfig = {
    ...config,
    reviewRunManifestPaths: [repositoryRelative(runOnePath)],
  }
  await writeFile(configPath, `${JSON.stringify(singleRunConfig, null, 2)}\n`)
  await writeFile(reviewPath, `${JSON.stringify(recordWithRuns(['run-one']))}\n`)
  await writeFile(runOnePath, `${JSON.stringify({ ...runManifest('run-one'), status: 'failed' }, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /status must be completed/u,
  )

  await writeFile(runOnePath, `${JSON.stringify({ ...runManifest('run-one'), goalIds: ['goal-foreign'] }, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /reviewRunId run-one does not include the goal/u,
  )

  const promptTamperedRun = runManifest('run-one')
  promptTamperedRun.inputArtifacts = promptTamperedRun.inputArtifacts.map((artifact) => (
    artifact.role === 'review_prompt' ? { ...artifact, digest: sha256('tampered-prompt') } : artifact
  ))
  await writeFile(runOnePath, `${JSON.stringify(promptTamperedRun, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /review_prompt artifact does not match promptFingerprint/u,
  )

  const criteriaForeignRun = runManifest('run-one')
  criteriaForeignRun.criteriaFingerprint = sha256('foreign-review-criteria')
  criteriaForeignRun.inputArtifacts = criteriaForeignRun.inputArtifacts.map((artifact) => (
    artifact.role === 'review_criteria'
      ? { ...artifact, digest: criteriaForeignRun.criteriaFingerprint }
      : artifact
  ))
  await writeFile(runOnePath, `${JSON.stringify(criteriaForeignRun, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /criteriaFingerprint does not match the configured review criteria/u,
  )

  const bookTamperedRun = runManifest('run-one')
  bookTamperedRun.inputArtifacts = bookTamperedRun.inputArtifacts.map((artifact) => (
    artifact.role === 'book_model' ? { ...artifact, digest: sha256('tampered-book') } : artifact
  ))
  await writeFile(runOnePath, `${JSON.stringify(bookTamperedRun, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /book_model artifact does not match bookDigest/u,
  )

  await writeFile(runOnePath, `${JSON.stringify(runManifest('run-one'), null, 2)}\n`)
  const conflictingRun = {
    ...runManifest('run-two.batch-001'),
    bundleFingerprint: sha256('foreign-bundle'),
    bookDigest: sha256('foreign-book'),
    promptFingerprint: sha256('foreign-prompt'),
  }
  conflictingRun.inputArtifacts = conflictingRun.inputArtifacts.map((artifact) => {
    if (artifact.role === 'book_model') return { ...artifact, digest: conflictingRun.bookDigest }
    if (artifact.role === 'review_prompt') return { ...artifact, digest: conflictingRun.promptFingerprint }
    return artifact
  })
  await writeFile(runTwoPath, `${JSON.stringify(conflictingRun, null, 2)}\n`)
  await writeFile(configPath, `${JSON.stringify(configWithRuns, null, 2)}\n`)
  await writeFile(reviewPath, `${JSON.stringify(recordWithRuns(['run-one', 'run-two.batch-001']))}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /review binding conflicts.*bundleFingerprint, bookDigest, promptFingerprint/u,
  )

  await writeFile(runTwoPath, `${JSON.stringify(runManifest('run-two.batch-001'), null, 2)}\n`)
  await writeFile(reviewPath, `${JSON.stringify(record())}\n`)
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)

  await writeFile(criteriaPath, `${criteria}\nChanged.\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /reviewCriteriaFingerprint does not match/u,
  )
  await writeFile(criteriaPath, criteria)

  const resourceBoundConfig = {
    ...config,
    reviewedResourceTypes: ['goal-visualization'],
  }
  await writeFile(configPath, `${JSON.stringify(resourceBoundConfig, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /stale reviewInputFingerprint/u,
  )
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`)

  await writeFile(landscapePath, `${JSON.stringify({
    landscapeId,
    goals: [{ ...goal, description: `${goal.description} Präzisiert.` }],
  }, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /stale goalFingerprint/u,
  )
  await writeFile(landscapePath, `${JSON.stringify({ landscapeId, goals: [goal] }, null, 2)}\n`)

  await writeFile(ledgerPath, `${JSON.stringify({
    sourceLandscapeId: landscapeId,
    decisions: [{ goalId: goal.id, semanticKind: 'curricularArea', decisionStatus: 'authoritative' }],
  }, null, 2)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /requires curricularAtomic, found curricularArea/u,
  )
  await writeFile(ledgerPath, `${JSON.stringify({
    sourceLandscapeId: landscapeId,
    decisions: [{ goalId: goal.id, semanticKind, decisionStatus: 'authoritative' }],
  }, null, 2)}\n`)

  const approvedByAi = { ...record(), status: 'approved' as const }
  await writeFile(reviewPath, `${JSON.stringify(approvedByAi)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /reviewAuthority|needs_human_review|approved/u,
  )

  await writeFile(reviewPath, `${JSON.stringify(record())}\n${JSON.stringify(record())}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /duplicate review record/u,
  )

  const outsideRecord = { ...record(), goalId: 'goal-outside' }
  await writeFile(reviewPath, `${JSON.stringify(record())}\n${JSON.stringify(outsideRecord)}\n`)
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /record is outside the configured scope/u,
  )

  await writeFile(reviewPath, '')
  assert.match(
    reviewPositiveGoalEvidenceConfig(repositoryRelative(configPath)).errors.join('\n'),
    /missing review record/u,
  )

  console.log('Positive goal-evidence review config and ledger tests passed')
} finally {
  await rm(temporaryRoot, { recursive: true, force: true })
  await rm(visualizationDirectory, { recursive: true, force: true })
}
