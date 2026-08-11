import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import { validateGoalEvidenceFindingBatch } from './validateGoalEvidenceFindings'

const contractUrl = (name: string) => fileURLToPath(new URL(
  `../../contracts/goal-evidence/v1/${name}`,
  import.meta.url,
))

const compile = async (name: string) => {
  const schema = JSON.parse(await readFile(contractUrl(name), 'utf8')) as Record<string, unknown>
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  return ajv.compile(schema)
}

const digest = `sha256:${'a'.repeat(64)}`
const otherDigest = `sha256:${'b'.repeat(64)}`
const thirdDigest = `sha256:${'c'.repeat(64)}`

const validateConfig = await compile('goal-evidence-review-config.schema.json')
const config = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-review-config.schema.json',
  schemaVersion: 1,
  reviewId: 'representation-choice-pilot',
  ruleVersion: 'goal-evidence-v1',
  landscapeId: 'fixture-landscape',
  landscapePath: 'curricula/fixture.json',
  semanticKindLedgerPath: 'curricula/quality/semantic-kinds.json',
  reviewPath: 'curricula/quality/goal-evidence.review.jsonl',
  requireApproved: false,
  scope: {
    label: 'Fixture review scope',
    goalIds: ['goal-a'],
  },
}
assert.equal(validateConfig(config), true, JSON.stringify(validateConfig.errors))
assert.equal(validateConfig({ ...config, landscapePath: '../../private.json' }), false)
assert.equal(validateConfig({ ...config, skillpilotId: 'forbidden' }), false)

const validateRun = await compile('goal-evidence-ai-run-manifest.schema.json')
const run = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
  schemaVersion: 1,
  runId: 'review-run-001',
  bundleFingerprint: digest,
  bookDigest: otherDigest,
  provider: 'Example provider',
  model: 'Example model',
  modelVersion: '2026-08-10',
  role: 'didactic_reviewer',
  promptFamilyId: 'didactic-contrast-v1',
  promptFingerprint: thirdDigest,
  criteriaFingerprint: digest,
  generationParametersFingerprint: otherDigest,
  independenceGroupId: 'blind-pass-a',
  blindToOtherRuns: true,
  goalIds: ['8dd9f210-2683-5902-acab-e3be22725232'],
  inputArtifacts: [
    { role: 'book_model', digest: otherDigest },
    { role: 'review_input_jsonl', digest },
    { role: 'review_prompt', digest: thirdDigest },
    { role: 'review_criteria', digest },
  ],
  startedAt: '2026-08-10T08:00:00.000Z',
  completedAt: '2026-08-10T08:01:00.000Z',
  status: 'completed',
  outputDigest: digest,
  toolchainVersion: 'goal-evidence-review-v1',
}
assert.equal(validateRun(run), true, JSON.stringify(validateRun.errors))
assert.equal(validateRun({ ...run, learnerId: 'forbidden' }), false)

const validateFinding = await compile('goal-evidence-finding.schema.json')
const finding = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-finding.schema.json',
  schemaVersion: 1,
  findingId: 'finding-001',
  runId: run.runId,
  bundleFingerprint: run.bundleFingerprint,
  goalId: run.goalIds[0],
  goalFingerprint: digest,
  pageFingerprint: otherDigest,
  defectLayer: 'visualization',
  anchoredObservation: 'The highlighted graph supplies the same answer that the learner repeats.',
  hypothesizedMechanism: 'The visual cue can be mistaken for evidence of independent representation choice.',
  violatedCriterion: 'Cue-free choice and comparison are required before mastery evidence is accepted.',
  minimalCounterexample: 'Ask for an exact supplied measurement where a table is more direct than a graph.',
  severity: 'high',
  evidenceLevel: 'E2',
  normativeTags: [],
  maximumClaimScope: 'G1',
  counterarguments: ['The image is correct for its specific tank question.'],
  proposedLocalChange: 'Keep the image as teaching support but add a cue-free contrast case.',
  possibleSideEffects: ['A longer check may increase interaction time.'],
  broaderEvidenceNeeded: 'Replicate the mechanism across representation goals before changing global policy.',
  findingStatus: 'candidate',
  reviewAuthority: 'ai_candidate',
}
assert.equal(validateFinding(finding), true, JSON.stringify(validateFinding.errors))
assert.equal(validateFinding({ ...finding, findingStatus: 'accepted' }), false)
assert.equal(validateFinding({ ...finding, skillpilotId: 'forbidden' }), false)

const bundle: GoalBookReviewBundleManifest = {
  $schema: 'https://skillpilot.com/schemas/goal-book/v1/goal-book-review-bundle.schema.json',
  schemaVersion: 1,
  bundleFingerprint: digest,
  bookModelDigest: otherDigest,
  bookModelSchemaVersion: '1.0.0',
  bookId: 'fixture-book',
  bookEdition: 'curricular-atomic-v1',
  publicationMode: 'review',
  feedbackBaseUrl: 'https://skillpilot.example/goal-feedback',
  locale: 'de-DE',
  selectedGoalCount: 1,
  goals: [{
    goalId: finding.goalId,
    pageNumber: 1,
    goalFingerprint: finding.goalFingerprint,
    pageFingerprint: finding.pageFingerprint,
    evidenceReview: null,
  }],
  promptFingerprint: thirdDigest,
  criteriaFingerprint: digest,
  artifacts: [
    'book_pdf',
    'book_pdf_render_manifest',
    'book_model',
    'review_input_json',
    'review_input_jsonl',
    'review_markdown',
    'review_prompt',
    'review_criteria',
    'finding_schema',
    'run_manifest_schema',
  ].map((role, index) => ({
    role: role as GoalBookReviewBundleManifest['artifacts'][number]['role'],
    path: `artifact-${index}.json`,
    digest: role === 'book_model'
      ? otherDigest
      : role === 'review_prompt'
        ? thirdDigest
        : digest,
    bytes: 1,
  })),
  reviewPolicy: {
    blindIndependentFirstPass: true,
    modelVotesGrantReleaseAuthority: false,
    humanApprovalRequired: true,
    learnerDataAllowed: false,
  },
}
const findingsBytes = Buffer.from(`${JSON.stringify(finding)}\n`)
const boundRun = {
  ...run,
  bundleFingerprint: bundle.bundleFingerprint,
  bookDigest: bundle.bookModelDigest,
  goalIds: bundle.goals.map(({ goalId }) => goalId),
  outputDigest: `sha256:${createHash('sha256').update(findingsBytes).digest('hex')}`,
}
const validBatch = await validateGoalEvidenceFindingBatch({
  bundle,
  run: boundRun,
  findingsBytes,
})
assert.deepEqual(validBatch.errors, [])

const secondGoal = {
  goalId: 'goal-b',
  pageNumber: 2,
  goalFingerprint: otherDigest,
  pageFingerprint: thirdDigest,
  evidenceReview: null,
}
const twoGoalBundle: GoalBookReviewBundleManifest = {
  ...bundle,
  selectedGoalCount: 2,
  goals: [...bundle.goals, secondGoal],
}
const validSubsetBatch = await validateGoalEvidenceFindingBatch({
  bundle: twoGoalBundle,
  run: boundRun,
  findingsBytes,
})
assert.deepEqual(validSubsetBatch.errors, [])

const outsideRunFindingBytes = Buffer.from(`${JSON.stringify({
  ...finding,
  findingId: 'finding-outside-run',
  goalId: secondGoal.goalId,
  goalFingerprint: secondGoal.goalFingerprint,
  pageFingerprint: secondGoal.pageFingerprint,
})}\n`)
const outsideRunBatch = await validateGoalEvidenceFindingBatch({
  bundle: twoGoalBundle,
  run: {
    ...boundRun,
    outputDigest: `sha256:${createHash('sha256').update(outsideRunFindingBytes).digest('hex')}`,
  },
  findingsBytes: outsideRunFindingBytes,
})
assert.match(outsideRunBatch.errors.join('\n'), /outside the run batch/u)

const staleFindingBytes = Buffer.from(`${JSON.stringify({ ...finding, pageFingerprint: thirdDigest })}\n`)
const staleBatch = await validateGoalEvidenceFindingBatch({
  bundle,
  run: {
    ...boundRun,
    outputDigest: `sha256:${createHash('sha256').update(staleFindingBytes).digest('hex')}`,
  },
  findingsBytes: staleFindingBytes,
})
assert.match(staleBatch.errors.join('\n'), /stale or foreign goal\/page fingerprints/u)

const validateFeedback = await compile('goal-public-feedback.schema.json')
const feedback = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-public-feedback.schema.json',
  schemaVersion: 1,
  context: {
    goalId: finding.goalId,
    goalFingerprint: digest,
    pageFingerprint: otherDigest,
    bookId: 'de-de-gym-sekii-gk-mathematik',
    bookEdition: 'curricular-atomic-v1',
    bookDigest: thirdDigest,
    locale: 'de-DE',
    scopeLabel: 'Gymnasium Mathematik Sekundarstufe II Grundkurs',
    pageNumber: 42,
    canonicalUrl: `https://skillpilot.com/lernzielbuch#goal-${finding.goalId}`,
    publicationManifestFingerprint: digest,
  },
  feedback: {
    category: 'visual_cue',
    observation: 'The learner repeatedly selected the representation highlighted in the image.',
    observableEvidence: 'The same one-word answer appeared in changed prompts without justification.',
    alternativeExplanation: 'The learner may have understood the prompt but answered too briefly.',
    cueFreeConcern: 'A fresh case without a highlighted option was not observed.',
    missingInformation: 'An explanation comparing the chosen representation with an alternative.',
    maximumClaimScope: 'G1',
    reviewerRole: 'teacher',
  },
  privacyAcknowledged: true,
}
assert.equal(validateFeedback(feedback), true, JSON.stringify(validateFeedback.errors))
assert.equal(validateFeedback({ ...feedback, skillpilotId: 'forbidden' }), false)
assert.equal(validateFeedback({ ...feedback, privacyAcknowledged: false }), false)

console.log('Goal-evidence review contract tests passed.')
