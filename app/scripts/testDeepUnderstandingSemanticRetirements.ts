import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import type { LearningGoal } from '../src/landscapeTypes'
import type { GoalBookReviewBundleManifest } from './exportGoalBookReviewBundle'
import { GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION, fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { fingerprintGoalForEvidence } from './goalEvidenceProfileModel'
import { buildGoalDescriptionRolloutResolutionSynthesis } from './goalDescriptionRolloutResolutionSynthesis'
import {
  buildGoalDescriptionCanonicalContext,
  buildGoalDescriptionReviewCampaign,
  fingerprintGoalBookReviewBundleManifest,
  fingerprintGoalDescriptionReviewInput,
  fingerprintGoalDescriptionReviewRecordSchema,
  serializeGoalDescriptionReviewBatchInput,
  type GoalDescriptionReviewInput,
  type GoalDescriptionReviewRecord,
} from './validateGoalDescriptionReviewCampaign'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionDualRoundResolution,
  fingerprintGoalDescriptionReviewPage,
  validateGoalDescriptionDualRoundResolution,
  validateHistoricalGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
} from './validateGoalDescriptionDualRoundResolution'
import { validateGoalDescriptionReviewDualRound, type GoalDescriptionReviewRoundArtifacts } from './validateGoalDescriptionReviewDualRound'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  type GoalDescriptionRolloutSynthesisDecisionManifest,
} from './validateGoalDescriptionRolloutSynthesisDecisionManifest'
import {
  buildResolutionSupersessionChains,
  hasIntactResolutionSupersessionChain,
  hasIntactRetiredResolutionDigest,
  validateResolutionIndex,
  validateResolutionSemanticRetirements,
  validateStandaloneResolutionIndexStructure,
  type DeepUnderstandingSubjectConfig,
  type StandaloneBatchResolutionIndex,
} from './reportDeepUnderstandingRollout'

const digest = (bytes: Buffer): `sha256:${string}` => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const bytes = Buffer.from('exact retained historical resolution\n')
const historicalDigest = digest(bytes)
const staleDigest = `sha256:${'f'.repeat(64)}`
const retiredIds = ['retired-a', 'retired-b', 'retired-c']
const currentAtomicGoalIds = new Set(['current-a', 'current-b', 'current-c'])
const goal = (id: string) => ({ id, type: 'cluster', title: id, contains: [id.replace('retired-', 'current-')] })
const entry = (goalId: string) => ({
  goalId, titleDe: goalId, groupId: 'group', decision: 'keep_current',
  resolutionPath: `resolutions/${goalId}.json`, resolutionDigest: historicalDigest,
  resolutionFingerprint: historicalDigest, strictDescriptionComplete: true,
})
const index = (ids: string[]): StandaloneBatchResolutionIndex => ({
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
  schemaVersion: 2, indexContract: 'goal-description-standalone-batch-resolution-index-v1',
  artifactSetId: 'historical', subject: 'Fixture', semanticKind: 'curricularAtomic',
  batchGoalIds: ids, deferredGoalIds: [],
  groups: [{
    groupId: 'group', artifactDirectory: '.', dualSummaryPath: 'dual.json',
    dualSummaryDigest: historicalDigest, campaignGoalCount: ids.length, resolvedGoalCount: ids.length,
  }],
  resolutions: ids.map(entry),
})
const fixture = () => {
  const goals = [...retiredIds.map(goal), ...[...currentAtomicGoalIds].map((id) => ({ id, type: 'atomic', contains: [] }))]
  const decisions = goals.map((g) => ({
    goalId: g.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(g),
    semanticKind: g.type === 'cluster' ? 'curricularArea' : 'curricularAtomic',
    decisionStatus: 'authoritative',
  }))
  return {
    config: {
      landscapePath: 'fixture/canonical.json', resolutionIndexPaths: ['old.json', 'latest.json'],
      resolutionWithdrawals: [],
      resolutionSemanticRetirements: retiredIds.map((goalId) => ({
        goalId, currentSemanticKind: 'curricularArea' as const,
        currentSourceFingerprint: decisions.find((d) => d.goalId === goalId)!.sourceFingerprint,
        historicalResolutions: (goalId === 'retired-a' ? ['old.json', 'latest.json'] : ['old.json'])
          .map((indexPath) => ({ indexPath, historicalResolutionDigest: historicalDigest })),
        reason: 'The reviewed atomic work now belongs to the retained child goals.',
      })),
    },
    landscape: { landscapeId: 'fixture', goals },
    semanticKindLedger: {
      sourceLandscapeId: 'fixture', sourceLandscapePath: 'fixture/canonical.json',
      sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1', decisions,
      counts: { curricularAtomic: 3, curricularArea: 3, total: 6 },
    },
    indices: [{ path: 'old.json', index: index(retiredIds) }, { path: 'latest.json', index: index(['retired-a']) }],
    scopeIssues: [] as string[],
  }
}
type Fixture = ReturnType<typeof fixture>
const original = fixture()
const before = structuredClone(original)
const proof = validateResolutionSemanticRetirements(original)
assert.deepEqual(proof.issues, [])
assert.equal(proof.digestsByIndex.get('old.json')?.size, 3)
assert.equal(proof.digestsByIndex.get('latest.json')?.size, 1)
assert.deepEqual(original, before, 'Retirement validation cannot rewrite historical indices, current semantic evidence or config.')
assert.equal(currentAtomicGoalIds.size, 3, 'Historical contexts never enlarge the current atomic denominator.')
assert.deepEqual(validateStandaloneResolutionIndexStructure(original.indices[0].index, currentAtomicGoalIds, {
  indexPath: 'old.json', proof,
}), [])
assert.equal(validateStandaloneResolutionIndexStructure(original.indices[0].index, currentAtomicGoalIds).length, 3,
  'Unconfigured noncurrent historical resolutions still fail.')
assert.equal(validateStandaloneResolutionIndexStructure(original.indices[0].index, currentAtomicGoalIds, {
  indexPath: 'unregistered.json', proof,
}).length, 3, 'A proof for another index grants no exception.')

const rebind = (f: Fixture) => {
  const g = f.landscape.goals[0]
  const fp = fingerprintSemanticKindSourceGoal(g)
  f.semanticKindLedger.decisions[0].sourceFingerprint = fp
  f.config.resolutionSemanticRetirements[0].currentSourceFingerprint = fp
}
const invalid: Array<[string, (f: Fixture) => void]> = [
  ['missing canonical goal', (f) => { f.landscape.goals.shift() }],
  ['duplicate canonical goal', (f) => { f.landscape.goals.push(structuredClone(f.landscape.goals[0])) }],
  ['empty contains with fresh fingerprint', (f) => { f.landscape.goals[0].contains = []; rebind(f) }],
  ['missing contains with fresh fingerprint', (f) => { delete (f.landscape.goals[0] as Record<string, unknown>).contains; rebind(f) }],
  ['non-array contains with fresh fingerprint', (f) => { Object.assign(f.landscape.goals[0], { contains: 'current-a' }); rebind(f) }],
  ['duplicate children with fresh fingerprint', (f) => { f.landscape.goals[0].contains = ['current-a', 'current-a']; rebind(f) }],
  ['missing child with fresh fingerprint', (f) => { f.landscape.goals[0].contains = ['missing']; rebind(f) }],
  ['self child with fresh fingerprint', (f) => { f.landscape.goals[0].contains = ['retired-a']; rebind(f) }],
  ['atomic type with fresh fingerprint', (f) => { f.landscape.goals[0].type = 'atomic'; rebind(f) }],
  ['wrong semantic kind', (f) => { f.semanticKindLedger.decisions[0].semanticKind = 'curricularAtomic' }],
  ['non-authoritative semantic decision', (f) => { f.semanticKindLedger.decisions[0].decisionStatus = 'candidate' }],
  ['duplicate semantic decision', (f) => { f.semanticKindLedger.decisions.push(structuredClone(f.semanticKindLedger.decisions[0])) }],
  ['wrong fingerprint contract', (f) => { f.semanticKindLedger.sourceFingerprintContractId = 'unsupported' }],
  ['wrong landscape binding', (f) => { f.semanticKindLedger.sourceLandscapeId = 'other' }],
  ['wrong landscape path', (f) => { f.semanticKindLedger.sourceLandscapePath = 'other.json' }],
  ['stale ledger fingerprint', (f) => { f.semanticKindLedger.decisions[0].sourceFingerprint = staleDigest }],
  ['stale explicit fingerprint', (f) => { f.config.resolutionSemanticRetirements[0].currentSourceFingerprint = staleDigest }],
  ['unrelated current scope failure', (f) => { f.scopeIssues.push('another stale semantic source') }],
  ['unrelated stale source without caller issue', (f) => { f.semanticKindLedger.decisions.at(-1)!.sourceFingerprint = staleDigest }],
  ['incomplete semantic ledger without caller issue', (f) => { f.semanticKindLedger.decisions.pop() }],
  ['duplicate retirement goal', (f) => { f.config.resolutionSemanticRetirements.push(structuredClone(f.config.resolutionSemanticRetirements[0])) }],
  ['blank reason', (f) => { f.config.resolutionSemanticRetirements[0].reason = ' ' }],
  ['withdrawal overlap', (f) => { f.config.resolutionWithdrawals.push({ goalId: 'retired-a' } as never) }],
  ['missing historical binding', (f) => { f.config.resolutionSemanticRetirements[0].historicalResolutions.pop() }],
  ['extra historical binding', (f) => { f.config.resolutionSemanticRetirements[1].historicalResolutions.push({ indexPath: 'latest.json', historicalResolutionDigest: historicalDigest }) }],
  ['duplicate historical binding', (f) => { f.config.resolutionSemanticRetirements[0].historicalResolutions.push({ ...f.config.resolutionSemanticRetirements[0].historicalResolutions[0] }) }],
  ['changed index digest', (f) => { f.indices[0].index.resolutions[0].resolutionDigest = staleDigest }],
  ['changed retirement digest', (f) => { f.config.resolutionSemanticRetirements[0].historicalResolutions[0].historicalResolutionDigest = staleDigest }],
  ['missing index snapshot', (f) => { f.indices.pop() }],
  ['duplicate index snapshot', (f) => { f.indices.push(structuredClone(f.indices[0])) }],
  ['deferred goal is not a historical resolution', (f) => {
    f.indices[1].index.resolutions = []; f.indices[1].index.deferredGoalIds = ['retired-a']
    f.indices[1].index.groups[0].resolvedGoalCount = 0
  }],
]
for (const [label, change] of invalid) {
  const f = fixture()
  change(f)
  const result = validateResolutionSemanticRetirements(f)
  assert.ok(result.issues.length > 0, label)
  assert.equal(result.digestsByIndex.size, 0, `${label}: no partial retirement exceptions`)
}

assert.equal(hasIntactRetiredResolutionDigest(proof, 'old.json', entry('retired-a'), bytes), true)
assert.equal(hasIntactRetiredResolutionDigest(proof, 'old.json', entry('retired-a'), Buffer.from('tampered')), false,
  'An intact index pin cannot hide changed historical file bytes, including a superseded node.')
assert.equal(hasIntactRetiredResolutionDigest(proof, 'old.json', {
  ...entry('retired-a'), resolutionDigest: digest(Buffer.from('tampered')),
}, Buffer.from('tampered')), false, 'Changing both index and file cannot override the explicit retirement pin.')
assert.equal(hasIntactRetiredResolutionDigest(proof, 'latest.json', entry('retired-b'), bytes), false)
const changedIndex = structuredClone(original.indices[0].index)
changedIndex.resolutions[0].resolutionDigest = staleDigest
assert.ok(validateStandaloneResolutionIndexStructure(changedIndex, currentAtomicGoalIds, {
  indexPath: 'old.json', proof,
}).some((error) => error.includes('retired-a is not current curricularAtomic')))
const forgedProof = { digestsByIndex: proof.digestsByIndex, issues: [] } as typeof proof
assert.equal(validateStandaloneResolutionIndexStructure(original.indices[0].index, currentAtomicGoalIds, {
  indexPath: 'old.json', proof: forgedProof,
}).length, 3, 'An unchecked digest map cannot grant retirement exceptions without validated semantic evidence.')
for (const mutate of [
  (v: StandaloneBatchResolutionIndex) => { v.groups[0].resolvedGoalCount += 1 },
  (v: StandaloneBatchResolutionIndex) => { v.resolutions.reverse() },
  (v: StandaloneBatchResolutionIndex) => { v.resolutions[0].humanAttestationPath = 'human.json' },
  (v: StandaloneBatchResolutionIndex) => { v.resolutions[0].strictDescriptionComplete = false },
]) {
  const v = structuredClone(original.indices[0].index)
  mutate(v)
  assert.ok(validateStandaloneResolutionIndexStructure(v, currentAtomicGoalIds, { indexPath: 'old.json', proof }).length > 0,
    'Retirement preserves V2 count, order, AI-only and strict-claim checks.')
}

const edge = { goalId: 'retired-a', supersededIndexPath: 'old.json', replacementIndexPath: 'latest.json' }
assert.equal(buildResolutionSupersessionChains([edge], original.config.resolutionIndexPaths, currentAtomicGoalIds).chains.length, 0)
const chain = buildResolutionSupersessionChains([edge], original.config.resolutionIndexPaths, currentAtomicGoalIds, proof)
assert.deepEqual(chain.issues, [])
const history = ['old.json', 'latest.json'].map((path) => ({
  path, issues: [] as string[], historicalClaimedGoalIds: new Set(['retired-a']),
  claimedGoalIds: new Set<string>(), ready: new Set<string>(),
}))
assert.equal(hasIntactResolutionSupersessionChain(chain.chains[0], history, proof), true)
assert.equal(hasIntactResolutionSupersessionChain(chain.chains[0], history), false)
for (const position of [0, 1]) {
  for (const field of ['ready', 'claimedGoalIds'] as const) {
    const changed = structuredClone(history)
    changed[position][field].add('retired-a')
    assert.equal(hasIntactResolutionSupersessionChain(chain.chains[0], changed, proof), false,
      `Retired ${field} cannot be current at any chain node.`)
  }
  const changed = structuredClone(history)
  changed[position].historicalClaimedGoalIds.clear()
  assert.equal(hasIntactResolutionSupersessionChain(chain.chains[0], changed, proof), false)
}
assert.equal(hasIntactResolutionSupersessionChain(chain.chains[0], [...history, history[1]], proof), false)
assert.equal(hasIntactResolutionSupersessionChain(chain.chains[0], [{ ...history[0], issues: ['stale digest'] }, history[1]], proof), false)
assert.equal(buildResolutionSupersessionChains([edge, { ...edge, supersededIndexPath: 'latest.json', replacementIndexPath: 'old.json' }],
  original.config.resolutionIndexPaths, currentAtomicGoalIds, proof).chains.length, 0)
assert.equal(buildResolutionSupersessionChains([{ ...edge, replacementIndexPath: 'unregistered.json' }],
  original.config.resolutionIndexPaths, currentAtomicGoalIds, proof).chains.length, 0)
const currentChain = { goalId: 'current-a', indexPaths: ['old.json', 'latest.json'] }
const currentHistory = history.map((h, position) => ({
  ...h, historicalClaimedGoalIds: new Set(['current-a']),
  claimedGoalIds: new Set(position === 1 ? ['current-a'] : []),
  ready: new Set(position === 1 ? ['current-a'] : []),
}))
assert.equal(hasIntactResolutionSupersessionChain(currentChain, currentHistory, proof), true)
currentHistory[1].ready.clear()
assert.equal(hasIntactResolutionSupersessionChain(currentChain, currentHistory, proof), false,
  'A valid sibling retirement cannot weaken a current atomic terminal readiness gate.')

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const schema = JSON.parse(readFileSync(resolve(repo,
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json'), 'utf8'))
const validate = new Ajv2020({ strict: true, allErrors: true }).compile(schema)
const config = () => ({
  $schema: schema.$id, schemaVersion: 1, reportId: 'fixture',
  subjects: [{
    subject: 'fixture', label: 'Fixture', landscapePath: 'fixture/canonical.json',
    semanticKindLedgerPath: 'fixture/semantic.json', semanticAtomicityConfigPath: 'fixture/a.json',
    memoryReviewConfigPath: 'fixture/m.json', visualizationQaPath: 'fixture/v.json',
    resolutionIndexPaths: ['old.json', 'latest.json'], positiveEvidenceConfigPaths: [],
    resolutionSemanticRetirements: fixture().config.resolutionSemanticRetirements,
  }],
})
assert.equal(validate(config()), true)
for (const mutate of [
  (r: Record<string, unknown>) => { r.humanApproval = true },
  (r: Record<string, unknown>) => { r.currentSemanticKind = 'curricularAtomic' },
  (r: Record<string, unknown>) => { r.currentSourceFingerprint = 'unbound' },
  (r: Record<string, unknown>) => { r.historicalResolutions = [] },
  (r: Record<string, unknown>) => { r.historicalResolutions = [{ indexPath: '../escape.json', historicalResolutionDigest: historicalDigest }] },
  (r: Record<string, unknown>) => { r.historicalResolutions = [{ indexPath: 'old.json', historicalResolutionDigest: 'unbound' }] },
  (r: Record<string, unknown>) => { r.historicalResolutions = [{ indexPath: 'old.json', historicalResolutionDigest: historicalDigest, humanApproval: true }] },
]) {
  const c = config()
  mutate(c.subjects[0].resolutionSemanticRetirements[0])
  assert.equal(validate(c), false)
}
// Exercise the actual index loader with synthetic QA evidence. In particular,
// retaining a resolution digest cannot make its source rounds or manifest
// optional. This fixture makes no claim about scientific or human review.
const historicalGoal = {
  id: 'fixture-historical-parent', type: 'atomic', title: 'Zusammenhang erklären',
  titleEn: 'Explain a relationship',
  description: 'Die lernende Person kann einen Zusammenhang erklären und auf einen veränderten Fall übertragen.',
  descriptionEn: 'The learner can explain a relationship and transfer it to a changed case.',
  core: true, weight: 1, requires: [], contains: [], tags: ['fixture'],
  semanticAtomic: true, dimensionTags: {
    framework: 'fixture-framework', demandLevel: 'AB2', processCompetencies: ['explain'],
    guidingIdeas: ['relationship'], phase: 'fixture-phase', area: 'Fixture area',
  },
}
const pin = (character: string) => `sha256:${character.repeat(64)}` as const
const goalFingerprint = fingerprintGoalForEvidence(
  historicalGoal as unknown as LearningGoal, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION, 'curricularAtomic',
)
const pagePayload = {
  pageNumber: 1, navigationOrder: 0, treeOrder: 1, goalId: historicalGoal.id,
  anchor: `goal-${historicalGoal.id}`, title: historicalGoal.title, description: historicalGoal.description,
  breadcrumbs: ['Fixture'], chapterIds: ['fixture'],
  applicability: [{ jurisdiction: 'DE-HE', scopes: [{ stage: 'SekII' as const, durationModel: 'G9' as const, courseProfile: 'GK' as const }] }],
  requires: [], reverseRequires: [],
  externalPrerequisites: [], externalReverseRequires: [], visualization: null, evidenceReview: null,
  goalFingerprint, pageFingerprint: pin('0'),
}
const page = { ...pagePayload, pageFingerprint: fingerprintGoalDescriptionReviewPage(pagePayload) }
const bundlePayload: GoalBookReviewBundleManifest = {
  $schema: 'https://skillpilot.com/schemas/goal-book/v1/goal-book-review-bundle.schema.json',
  schemaVersion: 1, bundleFingerprint: pin('0'), bookModelDigest: pin('1'),
  bookModelSchemaVersion: '1.1.0', bookId: 'fixture-retirement-book', bookEdition: 'curricular-atomic-v1',
  publicationMode: 'review', feedbackBaseUrl: 'https://skillpilot.example/goal-feedback', locale: 'de-DE',
  selectedGoalCount: 1,
  goals: [{ goalId: historicalGoal.id, pageNumber: 1, goalFingerprint, pageFingerprint: page.pageFingerprint, evidenceReview: null }],
  promptFingerprint: pin('2'), criteriaFingerprint: pin('3'),
  artifacts: [
    'book_pdf', 'book_pdf_render_manifest', 'book_model', 'review_input_json', 'review_input_jsonl',
    'review_markdown', 'review_prompt', 'review_criteria', 'finding_schema', 'run_manifest_schema',
  ].map((role, ordinal) => ({
    role: role as GoalBookReviewBundleManifest['artifacts'][number]['role'],
    path: `artifact-${ordinal}.json`, bytes: 1,
    digest: role === 'book_model' ? pin('1') : role === 'review_prompt' ? pin('2') : role === 'review_criteria' ? pin('3') : pin('4'),
  })),
  reviewPolicy: { blindIndependentFirstPass: true, modelVotesGrantReleaseAuthority: false, humanApprovalRequired: true, learnerDataAllowed: false },
}
const bundle = { ...bundlePayload, bundleFingerprint: fingerprintGoalBookReviewBundleManifest(bundlePayload) }
const inputPayload = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v3/goal-description-review-input.schema.json' as const,
  schemaVersion: 3 as const, bundleFingerprint: bundle.bundleFingerprint, bookDigest: bundle.bookModelDigest,
  goalCount: 1,
  goals: [{
    goalId: historicalGoal.id, goalFingerprint, pageFingerprint: page.pageFingerprint,
    currentTitleDe: historicalGoal.title, currentTitleEn: historicalGoal.titleEn,
    currentDescriptionDe: historicalGoal.description, currentDescriptionEn: historicalGoal.descriptionEn,
    canonicalContext: buildGoalDescriptionCanonicalContext(historicalGoal),
    reviewContext: { page, evidenceProfile: null },
  }],
}
const reviewInput: GoalDescriptionReviewInput = {
  ...inputPayload, reviewInputFingerprint: fingerprintGoalDescriptionReviewInput(inputPayload),
}
const recordSchemaDigest = await fingerprintGoalDescriptionReviewRecordSchema()
const understandingEvidence: GoalDescriptionReviewRecord['understandingEvidence'] = {
  essentialUnderstandingDe: 'Der Zusammenhang gilt unter benannten Bedingungen.',
  essentialUnderstandingEn: 'The relationship holds under stated conditions.',
  observablePerformanceDe: 'Die lernende Person erklärt den Zusammenhang in eigenen Worten.',
  observablePerformanceEn: 'The learner explains the relationship in their own words.',
  transferExpectationDe: 'Die lernende Person überträgt den Zusammenhang auf einen veränderten Fall.',
  transferExpectationEn: 'The learner transfers the relationship to a changed case.',
}
const makeRound = (label: 'a' | 'b'): GoalDescriptionReviewRoundArtifacts => {
  const campaign = buildGoalDescriptionReviewCampaign({
    bundle, input: reviewInput, campaignId: `fixture-retirement-campaign-${label}`,
    roundId: `fixture-retirement-round-${label}`, reviewerRole: 'external_ai_reviewer', reviewPass: 'first_pass',
    independenceGroupId: `fixture-retirement-blind-${label}`, blindToOtherReviews: true, recordSchemaDigest, batchSize: 1,
  })
  const batch = campaign.batches[0]
  const runId = `fixture-retirement-run-${label}`
  const record: GoalDescriptionReviewRecord = {
    recordId: `fixture-retirement-record-${label}`, runId, campaignId: campaign.campaignId, roundId: campaign.roundId,
    bundleFingerprint: bundle.bundleFingerprint, bookDigest: bundle.bookModelDigest,
    goalId: historicalGoal.id, goalFingerprint, pageFingerprint: page.pageFingerprint,
    currentTitleDe: historicalGoal.title, currentTitleEn: historicalGoal.titleEn,
    currentDescriptionDe: historicalGoal.description, currentDescriptionEn: historicalGoal.descriptionEn,
    decision: 'keep', understandingEvidence,
    rationale: 'Synthetic QA fixture with an observable explanation and changed-case transfer.',
    evidenceProfileContract: 'positive-understanding-evidence-v2', evidenceProfileRecommendation: 'none',
    recordStatus: 'candidate', reviewAuthority: 'ai_candidate',
  }
  const recordsBytes = Buffer.from(`${JSON.stringify({
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1, ...record,
  })}\n`)
  const batchInputBytes = serializeGoalDescriptionReviewBatchInput({
    bundleFingerprint: bundle.bundleFingerprint, bookDigest: bundle.bookModelDigest,
    reviewInputFingerprint: reviewInput.reviewInputFingerprint, inputSchemaVersion: 3, recordSchemaDigest,
    batchId: batch.batchId, goalIds: batch.goalIds, goals: reviewInput.goals,
  })
  return {
    bundle, input: reviewInput, campaign,
    resultPairs: [{
      batchId: batch.batchId, batchInputBytes, recordsBytes,
      run: {
        $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
        schemaVersion: 1, runId, campaignId: campaign.campaignId, roundId: campaign.roundId, batchId: batch.batchId,
        batchInputFingerprint: batch.batchInputFingerprint, bundleFingerprint: bundle.bundleFingerprint,
        bookDigest: bundle.bookModelDigest, provider: `Fixture provider ${label}`, model: `Fixture model ${label}`,
        role: 'didactic_reviewer', promptFamilyId: 'goal-description-understanding-evidence-v2',
        promptFingerprint: bundle.promptFingerprint, criteriaFingerprint: bundle.criteriaFingerprint,
        generationParametersFingerprint: pin('5'), independenceGroupId: campaign.independenceGroupId,
        blindToOtherRuns: true, goalIds: batch.goalIds,
        inputArtifacts: [
          { role: 'review_input_jsonl', digest: pin('4') },
          { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint },
          { role: 'review_prompt', digest: bundle.promptFingerprint },
          { role: 'review_criteria', digest: bundle.criteriaFingerprint },
        ],
        startedAt: '2026-08-26T12:00:00.000Z', completedAt: '2026-08-26T12:01:00.000Z',
        status: 'completed', outputDigest: digest(recordsBytes), toolchainVersion: 'goal-description-review-v1',
      },
    }],
  }
}
const first = makeRound('a')
const second = makeRound('b')
const dualValidation = await validateGoalDescriptionReviewDualRound({ first, second })
assert.deepEqual(dualValidation.errors, [], 'The historical integration fixture must contain two genuinely valid synthetic QA rounds.')
const dualSummary = dualValidation.summary
const jsonBytes = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const dualSummaryBytes = jsonBytes(dualSummary)
const firstSourceResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: first, goalId: historicalGoal.id, label: 'First' })
const secondSourceResult = extractGoalDescriptionDualRoundResolutionSource({ artifacts: second, goalId: historicalGoal.id, label: 'Second' })
assert.deepEqual(firstSourceResult.errors, [])
assert.deepEqual(secondSourceResult.errors, [])
assert.ok(firstSourceResult.source)
assert.ok(secondSourceResult.source)
const firstSource = firstSourceResult.source
const secondSource = secondSourceResult.source
const finalText = {
  titleDe: historicalGoal.title, titleEn: historicalGoal.titleEn,
  descriptionDe: historicalGoal.description, descriptionEn: historicalGoal.descriptionEn,
}
const manifestPayload: Omit<GoalDescriptionRolloutSynthesisDecisionManifest, 'manifestFingerprint'> = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
  schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
  manifestId: 'fixture-retirement-manifest', authority: 'ai_synthesis', synthesizedBy: 'Synthetic QA fixture',
  synthesizedAt: '2026-08-26T12:02:00.000Z',
  batch: {
    batchId: 'fixture-retirement-batch', batchManifestDigest: pin('6'), configDigest: pin('7'),
    bundleFingerprint: bundle.bundleFingerprint as `sha256:${string}`, bookDigest: bundle.bookModelDigest as `sha256:${string}`,
    reviewInputFingerprint: reviewInput.reviewInputFingerprint as `sha256:${string}`,
    dualSummaryDigest: digest(dualSummaryBytes), canonicalLandscapeDigest: pin('8'),
  },
  rounds: {
    first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstSource.binding, digest(first.resultPairs[0].batchInputBytes)),
    second: buildGoalDescriptionRolloutSynthesisRoundBinding(secondSource.binding, digest(second.resultPairs[0].batchInputBytes)),
  },
  decisions: [{
    decisionId: 'fixture-retirement-decision', goalId: historicalGoal.id, effectiveSemanticKind: 'curricularAtomic',
    goalFingerprint: goalFingerprint as `sha256:${string}`, pageFingerprint: page.pageFingerprint,
    goalReviewContextFingerprint: firstSource.binding.goalReviewContextFingerprint,
    finalText, resolutionDecision: 'keep_current', evidenceRound: 'first',
    records: {
      first: { recordId: firstSource.binding.recordId, recordDigest: firstSource.binding.recordDigest },
      second: { recordId: secondSource.binding.recordId, recordDigest: secondSource.binding.recordDigest },
    },
    rationaleDe: 'Synthetischer Test zweier übereinstimmender, gebundener QA-Runden.',
    rationaleEn: 'Synthetic test of two agreeing, bound QA rounds.',
  }],
}
const manifest = { ...manifestPayload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(manifestPayload) }
const manifestBytes = jsonBytes(manifest)
const resolution = buildGoalDescriptionDualRoundResolution({
  resolutionId: 'fixture-retirement-resolution', goalId: historicalGoal.id, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current',
  synthesis: buildGoalDescriptionRolloutResolutionSynthesis({
    batchId: manifest.batch.batchId, manifest, decision: manifest.decisions[0], summaryGoal: dualSummary.goals[0], firstSource, secondSource,
  }),
  dualSummaryBytes, currentInput: reviewInput, firstSource, secondSource,
  synthesisDecisionManifest: {
    contract: manifest.synthesisContract, manifestPath: 'synthesis-decisions.json', manifestId: manifest.manifestId,
    manifestDigest: digest(manifestBytes), manifestFingerprint: manifest.manifestFingerprint, decisionId: manifest.decisions[0].decisionId,
  },
})
const validHistoricalEvidence = await validateGoalDescriptionDualRoundResolution({
  resolution, dualSummary, dualSummaryBytes, currentInput: reviewInput,
  landscape: { goals: [historicalGoal] }, first, second,
  synthesisDecisionManifestArtifact: { manifest, manifestBytes, manifestPath: 'synthesis-decisions.json' },
})
assert.deepEqual(validHistoricalEvidence.errors, [])
assert.equal(validHistoricalEvidence.strictDescriptionComplete, true)
const historicalArtifacts = {
  resolution, dualSummary, dualSummaryBytes, currentInput: reviewInput, first, second,
  synthesisDecisionManifestArtifact: { manifest, manifestBytes, manifestPath: 'synthesis-decisions.json' },
}
const historicalOnly = await validateHistoricalGoalDescriptionDualRoundResolution(historicalArtifacts)
assert.deepEqual(historicalOnly.errors, [])
assert.equal(historicalOnly.historicalDescriptionComplete, true)
assert.equal(Object.hasOwn(historicalOnly, 'strictDescriptionComplete'), false,
  'Historical success must not expose current strict-description readiness.')
const changedCanonical = await validateGoalDescriptionDualRoundResolution({
  ...historicalArtifacts,
  landscape: { goals: [{ ...historicalGoal, type: 'cluster', contains: ['fixture-current-child'] }] },
})
assert.ok(changedCanonical.errors.length > 0, 'The ordinary validator must still reject the historical atomic input against the current parent cluster.')
assert.equal(changedCanonical.strictDescriptionComplete, false)

mkdirSync(resolve(repo, 'tmp'), { recursive: true })
const temporaryRoot = mkdtempSync(resolve(repo, 'tmp/semantic-retirement-'))
try {
  const indexPath = relative(repo, join(temporaryRoot, 'index.json'))
  const resolutionBytes = jsonBytes(resolution)
  const historicalIndex: StandaloneBatchResolutionIndex = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
    schemaVersion: 2, indexContract: 'goal-description-standalone-batch-resolution-index-v1', artifactSetId: 'fixture-history',
    subject: 'Fixture', semanticKind: 'curricularAtomic', batchGoalIds: [historicalGoal.id],
    groups: [{ groupId: 'fixture', artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: digest(dualSummaryBytes), campaignGoalCount: 1, resolvedGoalCount: 1 }],
    resolutions: [{
      goalId: historicalGoal.id, titleDe: historicalGoal.title, groupId: 'fixture', decision: 'keep_current',
      resolutionPath: 'resolutions/fixture.json', resolutionDigest: digest(resolutionBytes),
      resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true,
    }],
  }
  const currentParent = { ...historicalGoal, type: 'cluster', contains: ['fixture-current-child'] }
  const currentChild = { ...historicalGoal, id: 'fixture-current-child' }
  const currentLandscape = { landscapeId: 'fixture-current', goals: [currentParent, currentChild] }
  const ledger = {
    sourceLandscapeId: currentLandscape.landscapeId, sourceLandscapePath: 'fixture/current.json',
    sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
    counts: { curricularArea: 1, curricularAtomic: 1, total: 2 },
    decisions: currentLandscape.goals.map((g) => ({
      goalId: g.id, semanticKind: g.type === 'cluster' ? 'curricularArea' : 'curricularAtomic',
      decisionStatus: 'authoritative', sourceFingerprint: fingerprintSemanticKindSourceGoal(g),
    })),
  }
  const subjectConfig: DeepUnderstandingSubjectConfig = {
    subject: 'fixture', label: 'Fixture', landscapePath: ledger.sourceLandscapePath, semanticKindLedgerPath: 'fixture/semantic.json',
    memoryReviewConfigPath: 'fixture/memory.json', visualizationQaPath: 'fixture/visualization.json',
    resolutionIndexPaths: [indexPath], positiveEvidenceConfigPaths: [],
    resolutionSemanticRetirements: [{
      goalId: historicalGoal.id, currentSemanticKind: 'curricularArea',
      currentSourceFingerprint: fingerprintSemanticKindSourceGoal(currentParent),
      historicalResolutions: [{ indexPath, historicalResolutionDigest: digest(resolutionBytes) }],
      reason: 'Synthetic fixture: the former atomic goal is now a retained parent area.',
    }],
  }
  const scope = {
    landscape: currentLandscape as unknown as Parameters<typeof validateResolutionIndex>[2]['landscape'],
    rawLandscape: currentLandscape,
    goalById: new Map(currentLandscape.goals.map((g) => [g.id, g as unknown as LearningGoal])),
    rawGoalById: new Map(currentLandscape.goals.map((g) => [g.id, g])),
    atomicGoalIds: new Set([currentChild.id]), denominator: 1, issues: [] as string[],
  }
  const baselineFiles = new Map<string, Buffer>([
    ['dual-summary.json', dualSummaryBytes], ['synthesis-decisions.json', manifestBytes], ['resolutions/fixture.json', resolutionBytes],
  ])
  for (const [label, round] of [['a', first], ['b', second]] as const) {
    const prefix = `round-${label}`
    baselineFiles.set(`${prefix}/review-bundle-manifest.json`, jsonBytes(round.bundle))
    baselineFiles.set(`${prefix}/description-review-input.json`, jsonBytes(round.input))
    baselineFiles.set(`${prefix}/description-review-campaign.json`, jsonBytes(round.campaign))
    for (const pair of round.resultPairs) {
      baselineFiles.set(`${prefix}/batches/${pair.batchId}.input.jsonl`, pair.batchInputBytes)
      baselineFiles.set(`${prefix}/results/${pair.batchId}.run.json`, jsonBytes(pair.run))
      baselineFiles.set(`${prefix}/results/${pair.batchId}.records.jsonl`, pair.recordsBytes)
    }
  }
  type IndexFixture = { files: Map<string, Buffer>; index: StandaloneBatchResolutionIndex; config: DeepUnderstandingSubjectConfig }
  const firstRecordsPath = `round-a/results/${first.resultPairs[0].batchId}.records.jsonl`
  const firstRunPath = `round-a/results/${first.resultPairs[0].batchId}.run.json`
  const readFixtureJson = <T>(f: IndexFixture, path: string): T => JSON.parse(f.files.get(path)!.toString()) as T
  const rebindResolution = (f: IndexFixture, value: Record<string, unknown>) => {
    const payload = Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'resolutionFingerprint'))
    const rebound = { ...payload, resolutionFingerprint: fingerprintGoalDescriptionDualRoundResolution(payload as Omit<GoalDescriptionDualRoundResolution, 'resolutionFingerprint'>) }
    const reboundBytes = jsonBytes(rebound)
    f.files.set('resolutions/fixture.json', reboundBytes)
    f.index.resolutions[0].resolutionDigest = digest(reboundBytes)
    f.index.resolutions[0].resolutionFingerprint = rebound.resolutionFingerprint
    f.config.resolutionSemanticRetirements![0].historicalResolutions[0].historicalResolutionDigest = digest(reboundBytes)
  }
  const runIndexFixture = async (mutate?: (f: IndexFixture) => void) => {
    const f: IndexFixture = { files: new Map(baselineFiles), index: structuredClone(historicalIndex), config: structuredClone(subjectConfig) }
    mutate?.(f)
    f.files.set('index.json', jsonBytes(f.index))
    for (const [path, fileBytes] of f.files) {
      const absolutePath = join(temporaryRoot, path)
      mkdirSync(dirname(absolutePath), { recursive: true })
      writeFileSync(absolutePath, fileBytes)
    }
    const retirement = validateResolutionSemanticRetirements({
      config: f.config, landscape: currentLandscape, semanticKindLedger: ledger, indices: [{ path: indexPath, index: f.index }],
    })
    assert.deepEqual(retirement.issues, [], 'Every integration case must reach historical validation with a valid current retirement binding.')
    return validateResolutionIndex(indexPath, f.config, scope, new Set(), new Map(), retirement)
  }
  const accepted = await runIndexFixture()
  assert.deepEqual(accepted.issues, [], 'A valid retired historical resolution must remain independently verifiable.')
  assert.deepEqual([...accepted.historicalClaimedGoalIds], [historicalGoal.id])
  assert.deepEqual([...accepted.claimedGoalIds], [], 'Retirement creates no current description claim.')
  assert.deepEqual([...accepted.ready], [], 'Historical validation never counts the retired parent or its unreviewed current child as ready.')
  assert.deepEqual([...scope.atomicGoalIds], [currentChild.id], 'The current child remains in the atomic denominator.')
  const tamperCases: Array<[string, (f: IndexFixture) => void, RegExp]> = [
    ['records with a freshly rebound run output digest', (f) => {
      const record = readFixtureJson<Record<string, unknown>>(f, firstRecordsPath)
      record.rationale = 'Changed historical QA rationale.'
      const changedBytes = Buffer.from(`${JSON.stringify(record)}\n`)
      f.files.set(firstRecordsPath, changedBytes)
      const run = readFixtureJson<Record<string, unknown>>(f, firstRunPath)
      run.outputDigest = digest(changedBytes)
      f.files.set(firstRunPath, jsonBytes(run))
    }, /resultsDigest|recordDigest|runManifestDigest|fresh validation/u],
    ['run identity', (f) => {
      const run = readFixtureJson<Record<string, unknown>>(f, firstRunPath)
      run.model = 'Changed historical model'
      f.files.set(firstRunPath, jsonBytes(run))
    }, /runManifestDigest|fresh validation/u],
    ['summary with a freshly rebound index digest', (f) => {
      const summary = structuredClone(dualSummary)
      summary.counts.exactAgreement += 1
      const changedBytes = jsonBytes(summary)
      f.files.set('dual-summary.json', changedBytes)
      f.index.groups[0].dualSummaryDigest = digest(changedBytes)
    }, /dualSummary digest|fresh validation/u],
    ['synthesis manifest', (f) => {
      const changed = structuredClone(manifest)
      changed.synthesizedBy = 'Changed historical synthesizer'
      f.files.set('synthesis-decisions.json', jsonBytes(changed))
    }, /manifest.*(?:fingerprint|identity|bytes)|fingerprint.*manifest/u],
    ['resolution source digest with freshly rebound resolution and retirement pins', (f) => {
      const changed = structuredClone(resolution)
      changed.rounds.first.resultsDigest = pin('f')
      rebindResolution(f, changed)
    }, /resultsDigest/u],
    ['former malformed historical evidence bypass', (f) => {
      for (const [path] of f.files) {
        if (path.endsWith('review-bundle-manifest.json') || path.endsWith('description-review-input.json') || path.endsWith('.run.json')) f.files.set(path, jsonBytes({}))
        if (path.endsWith('.records.jsonl') || path.endsWith('.input.jsonl')) f.files.set(path, Buffer.from('INVALID HISTORICAL JSONL'))
      }
      const malformed = structuredClone(resolution) as unknown as Record<string, unknown>
      delete malformed.rounds
      rebindResolution(f, malformed)
    }, /Resolution:|round|input|schema/iu],
  ]
  for (const [label, mutate, expectedError] of tamperCases) {
    const rejected = await runIndexFixture(mutate)
    assert.ok(rejected.issues.length > 0, `Historical ${label} must fail closed.`)
    assert.match(rejected.issues.join('\n'), expectedError, label)
    assert.deepEqual([...rejected.ready], [], `Historical ${label} creates no readiness.`)
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
console.log(`Deep-understanding semantic retirement checks passed (${invalid.length} invalid evidence cases; historical digest, V2, chain, closed-schema and real index-loader tamper checks).`)
