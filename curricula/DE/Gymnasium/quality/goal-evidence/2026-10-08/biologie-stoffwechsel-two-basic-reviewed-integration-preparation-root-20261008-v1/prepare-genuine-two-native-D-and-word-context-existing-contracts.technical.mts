// Prepared technical adoption only. Do not execute during the current 244/392 checkpoint.
// Two original native campaign pairs remain separate; no new scientific review or active write.
// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { loadGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import { validateGoalDescriptionReviewDualRound } from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound.ts'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  fingerprintGoalDescriptionReviewCampaign,
  fingerprintGoalDescriptionReviewContext,
  validateGoalDescriptionDualRoundResolution,
} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {
  buildGoalDescriptionRolloutSynthesisRoundBinding,
  fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,
  validateGoalDescriptionRolloutSynthesisDecisionManifest,
} from '../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'
import { buildGoalDescriptionRolloutResolutionSynthesis } from '../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'

const root = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const author = resolve(own, '../biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2')
const args = process.argv.slice(2)
assert.ok(args.length === 4 || args.length === 5,
  'Future use only after Root confirms all original seals: NEW2_A NEW2_B WORD576_A WORD576_B [ROOT_READINESS_RECEIPT]')
const resultDirectories = args.slice(0, 4).map((path) => resolve(root, path))
assert.equal(new Set(resultDirectories).size, 4, 'Four distinct original results directories are required')
const readinessPath = resolve(root, args[4] ?? relative(root, resolve(own, 'pending/original-seal-verification.actual.json')))
const sha = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const normalizedSha = (value: string) => 'sha256:' + value.replace(/^sha256:/, '')
const declared = new Map<string, any>()
const planned = new Map<string, Buffer>()
const binding = (path: string) => {
  const bytes = readFileSync(path)
  return { path: relative(root, path), sha256: sha(bytes), bytes: bytes.length }
}
const bytes = (path: string) => {
  const value = readFileSync(path)
  declared.set(path, { path: relative(root, path), sha256: sha(value), bytes: value.length })
  return value
}
const read = (path: string) => JSON.parse(bytes(path).toString('utf8'))
const serialize = (value: any): Buffer => Buffer.isBuffer(value)
  ? value : Buffer.from(typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n')
const plan = (path: string, value: any) => {
  assert.ok(path.startsWith(own + sep), 'Outputs must stay inside this inactive integration preparation directory')
  const valueBytes = serialize(value)
  if (planned.has(path)) assert.equal(sha(planned.get(path)!), sha(valueBytes), 'Conflicting planned output: ' + path)
  planned.set(path, valueBytes)
  return valueBytes
}
const copy = (from: string, to: string) => plan(to, bytes(from))
const verifyBinding = (ref: any, preservedInputs = new Map<string, any>()) => {
  assert.ok(ref && typeof ref.path === 'string' && typeof ref.sha256 === 'string' && Number.isInteger(ref.bytes))
  const originalPath = resolve(root, ref.path)
  const preserved = preservedInputs.get(originalPath)
  if (preserved) {
    assert.equal(normalizedSha(preserved.originalBinding.sha256), normalizedSha(ref.sha256))
    assert.equal(preserved.originalBinding.bytes, ref.bytes)
  }
  const actualPath = preserved ? resolve(root, preserved.immutableHistoricalCopy.path) : originalPath
  const actual = binding(actualPath)
  assert.equal(actual.sha256, normalizedSha(ref.sha256), 'Original input bytes changed: ' + ref.path)
  assert.equal(actual.bytes, ref.bytes, 'Original input size changed: ' + ref.path)
  bytes(actualPath)
  return { originalPath, actual }
}

// This receipt belongs to Root. The helper neither creates nor infers readiness.
// Read it before inspecting any peer result directory.
const ready = read(readinessPath)
assert.equal(ready.allOriginalSealsConfirmedByRoot, true, 'Root must confirm original source, V and native/P/context seals')
assert.equal(ready.bothActualIndependentNativeFirstSealsVerified, true)
assert.deepEqual(ready.unresolvedAdoptionBlockingFindings, [], 'Open new blocking findings prohibit adoption')
assert.equal(ready.originalFourOperatorHoldsRetained, true)
assert.deepEqual(ready.resultsDirectories.map((path: string) => resolve(root, path)).sort(), [...resultDirectories].sort())
assert.equal(ready.activeWrites, 0)
assert.equal(ready.newScientificReviewByIntegrator, false)
assert.equal(ready.humanApproval, false)
const preservedInputs = new Map<string, any>()
assert.ok(Array.isArray(ready.originalMutableBeforeInputsPreserved) && ready.originalMutableBeforeInputsPreserved.length > 0,
  'Root must preserve and bind the original mutable before-inputs')
for (const preserved of ready.originalMutableBeforeInputsPreserved) {
  assert.equal(resolve(root, preserved.originalPath), resolve(root, preserved.originalBinding.path))
  assert.equal(normalizedSha(preserved.originalBinding.sha256), normalizedSha(preserved.immutableHistoricalCopy.sha256))
  assert.equal(preserved.originalBinding.bytes, preserved.immutableHistoricalCopy.bytes)
  verifyBinding(preserved.immutableHistoricalCopy)
  preservedInputs.set(resolve(root, preserved.originalPath), preserved)
}
const verifiedOriginalFiles = new Map<string, any>()
assert.ok(ready.seals && Object.keys(ready.seals).length >= 2, 'Two original independent native first seals are required')
for (const original of Object.values(ready.seals) as any[]) {
  verifyBinding(original.seal)
  verifyBinding(original.entry)
  assert.ok(Array.isArray(original.verifiedOriginalFiles) && original.verifiedOriginalFiles.length > 0)
  for (const ref of original.verifiedOriginalFiles) {
    const { originalPath } = verifyBinding(ref, preservedInputs)
    const earlier = verifiedOriginalFiles.get(originalPath)
    if (earlier) assert.equal(normalizedSha(earlier.sha256), normalizedSha(ref.sha256))
    verifiedOriginalFiles.set(originalPath, ref)
  }
}

const neutralPath = resolve(author, 'neutral-final-primary-refined-basis2.author.entry.json')
assert.equal(sha(bytes(neutralPath)), 'sha256:e816bf8e18821eda82749b3fc65cfd38dfe656d4e8905ed2bda70838bcd1b4fd')
const neutral = read(neutralPath)
const authorSealPath = resolve(author, 'two-basic-complete.author.first-binding.freeze.json')
assert.equal(sha(bytes(authorSealPath)), 'sha256:390f6418d1d83486caed46bb6c3b0c91dd897012127b2d8d46663f2a1873975c')
verifyBinding(neutral.finalSourceDiff)
verifyBinding(neutral.actualFinalPdf)
const guardPath = resolve(own, 'pending/current244-live-preservation-and-two-new-guard.actual.json')
const guard = read(guardPath)
assert.equal(guard.currentDenominator, 392)
assert.equal(guard.proposedDenominator, 394)
assert.equal(guard.currentStrictBiology, 244)
assert.equal(guard.current392QARowsIncludingThreeNewMachineApprovalsMustBePreserved, true)
assert.equal(guard.current392HumanFieldsMustBePreserved, true)
assert.equal(guard.futureRegistryRequiresExplicitWordSupersessionNotHistoricalRewrite, true)
assert.equal(guard.originalFourOperatorHoldsRetained, true)
verifyBinding(guard.exactCandidateCanonical)
const sourceCanon = resolve(root, neutral.currentCanonicalPath)
assert.equal(sourceCanon, resolve(root, guard.exactCandidateCanonical.path))
const landscape = read(sourceCanon)
const modelFull = read(resolve(root, neutral.finalFull394BookModelPath))
assert.equal(modelFull.pages.length, 394)
assert.equal(modelFull.source.landscapePath, neutral.currentCanonicalPath)
const sourceDiff = read(resolve(root, neutral.finalSourceDiff.path))
const finalBaseConfig = sourceDiff.actualFinalBookConfig
assert.equal(finalBaseConfig.landscapePath, neutral.currentCanonicalPath)
assert.equal(finalBaseConfig.outputPath, neutral.finalFull394BookModelPath)
assert.equal(finalBaseConfig.compositionViewManifestPath,
  'app/scripts/config/goal-books/inactive/biologie-stoffwechsel-two-basic-primary-refined-20261008-v2/atlas.sources.json')
const finalBaseConfigPath = resolve(own, 'native-d-final-primary-refined.base-book.config.json')
plan(finalBaseConfigPath, finalBaseConfig)

const groups = [
  { scope: 'two-basic', native: resolve(author, 'native-two-primary-refined'),
    goalIds: ['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1'],
    results: resultDirectories.slice(0, 2),
    campaignPrefix: 'bio-two-basic-primary-refined-20261008-v2-independent-' },
  { scope: 'existing576-context', native: resolve(author, 'existing-word-context/after'),
    goalIds: ['576d59e2-397a-5654-b853-7c0c4870fbd3'],
    results: resultDirectories.slice(2, 4),
    campaignPrefix: 'bio-existing-word-basic2-context-20261008-independent-' },
]
const preflight: any[] = []
for (const group of groups) {
  const out = resolve(own, 'native-d-' + group.scope)
  assert.equal(existsSync(resolve(out, 'resolution-index.json')), false, 'Immutable native group already adopted: ' + group.scope)
  const model = read(resolve(group.native, 'bundle/book-model.json'))
  const bundle = read(resolve(group.native, 'bundle/review-bundle-manifest.json'))
  assert.equal(model.source.landscapePath, neutral.currentCanonicalPath)
  assert.deepEqual(model.pages.map((page: any) => page.goalId), group.goalIds)
  for (const page of model.pages) {
    const fullPage = modelFull.pages.find((candidate: any) => candidate.goalId === page.goalId)
    assert.ok(fullPage, 'Missing whole page in full394 model')
    assert.equal(page.goalFingerprint, fullPage.goalFingerprint)
    // The ordinary subset renderer renumbers pages and externalizes links outside the subset.
    // Its genuine pageFingerprint therefore differs from full394 and must remain unchanged.
    const localLayoutKeys = new Set(['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint',
      'requires', 'reverseRequires', 'externalPrerequisites', 'externalReverseRequires'])
    const body = (value: any) => Object.fromEntries(Object.entries(value).filter(([key]) => !localLayoutKeys.has(key)))
    assert.equal(stableGoalBookJson(body(page)), stableGoalBookJson(body(fullPage)), 'Whole page body differs from full394')
    const links = (value: any, internal: string, external: string) => {
      const relations = [...value[internal], ...value[external]].map(({ goalId, title }: any) => ({ goalId, title }))
      assert.equal(new Set(relations.map(({ goalId }: any) => goalId)).size, relations.length)
      return relations.sort((left, right) => left.goalId.localeCompare(right.goalId))
    }
    assert.deepEqual(links(page, 'requires', 'externalPrerequisites'), links(fullPage, 'requires', 'externalPrerequisites'))
    assert.deepEqual(links(page, 'reverseRequires', 'externalReverseRequires'), links(fullPage, 'reverseRequires', 'externalReverseRequires'))
  }
  const rounds: any[] = []
  for (const [index, side] of ['a', 'b'].entries()) {
    const directory = resolve(group.native, 'round-' + side)
    const input = read(resolve(directory, 'description-review-input.json'))
    const campaign = read(resolve(directory, 'description-review-campaign.json'))
    const roundBundle = read(resolve(directory, 'review-bundle-manifest.json'))
    assert.equal(campaign.campaignId, group.campaignPrefix + side + '-campaign')
    assert.equal(campaign.batchSize, 20)
    assert.equal(campaign.blindToOtherReviews, true)
    assert.equal(campaign.batches.length, 1)
    assert.deepEqual(input.goals.map((goal: any) => goal.goalId), group.goalIds)
    assert.equal(input.bookDigest, model.digest)
    assert.equal(input.bundleFingerprint, bundle.bundleFingerprint)
    assert.equal(roundBundle.bundleFingerprint, bundle.bundleFingerprint)
    for (const goal of input.goals) {
      const nativePage = model.pages.find((page: any) => page.goalId === goal.goalId)!
      assert.equal(goal.goalFingerprint, nativePage.goalFingerprint)
      assert.equal(goal.pageFingerprint, nativePage.pageFingerprint, 'Original native page binding must remain exact')
    }
    const batchId = campaign.batches[0].batchId
    for (const suffix of ['records.jsonl', 'run.json']) {
      const originalPath = resolve(group.results[index], batchId + '.' + suffix)
      const ref = verifiedOriginalFiles.get(originalPath)
      assert.ok(ref, 'Result bytes not bound by an original Root-verified first seal: ' + relative(root, originalPath))
      verifyBinding(ref)
    }
    const run = read(resolve(group.results[index], batchId + '.run.json'))
    assert.equal(run.blindToOtherRuns, true)
    assert.equal(run.independenceGroupId, campaign.independenceGroupId)
    const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
      campaign, batchesDirectory: resolve(directory, 'batches'), resultsDirectory: group.results[index],
    })
    assert.deepEqual(loaded.errors, [], group.scope + ' actual campaign result-directory validation')
    rounds.push({ directory, input, campaign, bundle: roundBundle, resultPairs: loaded.resultPairs,
      resultsDirectory: group.results[index] })
  }
  assert.equal(stableGoalBookJson(rounds[0].input), stableGoalBookJson(rounds[1].input))
  assert.notEqual(rounds[0].campaign.independenceGroupId, rounds[1].campaign.independenceGroupId)
  const actualDual = await validateGoalDescriptionReviewDualRound({ first: rounds[0], second: rounds[1] })
  assert.deepEqual(actualDual.errors, [], group.scope + ' genuine dual-round validation')
  assert.ok(actualDual.summary)
  const sources = rounds[0].input.goals.map((goal: any) => {
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: rounds[0], goalId: goal.goalId, label: 'original sealed A' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: rounds[1], goalId: goal.goalId, label: 'original sealed B' })
    assert.deepEqual(first.errors, [])
    assert.deepEqual(second.errors, [])
    assert.equal(first.source!.decision, 'keep', 'Open or revised A judgment prevents adoption')
    assert.equal(second.source!.decision, 'keep', 'Open or revised B judgment prevents adoption')
    return { goal, first: first.source!, second: second.source! }
  })
  preflight.push({ ...group, out, model, bundle, rounds, sources, summary: actualDual.summary,
    dualBytes: serialize(actualDual.summary) })
}

// Both actual groups have passed before any adoption output is written.
const adopted: any[] = []
const synthesizedAt = new Date().toISOString()
const ajv = new Ajv2020({ allErrors: true, strict: true })
const validateIndex = ajv.compile(read(resolve(root,
  'contracts/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json')))
for (const group of preflight) {
  const { out, model, bundle, rounds, sources, summary, dualBytes } = group
  const first = rounds[0], second = rounds[1], input = first.input
  const batchId = 'biologie-stoffwechsel-reviewed-basic2-context394-technical-20261008-v1-' + group.scope
  const configPath = resolve(own, 'native-d-' + group.scope + '.batch.config.json')
  const cfg = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',
    schemaVersion: 1, batchId, subject: 'biologie', subjectLabel: 'Biologie', bookId: model.book.id,
    title: model.book.title, outputDirectory: relative(root, out),
    baseGoalBookConfigPath: relative(root, finalBaseConfigPath), goalIds: group.goalIds,
    feedbackBaseUrl: 'https://skillpilot.com/feedback', promptPath: relative(root, resolve(first.directory, 'prompt.md')),
    criteriaPath: relative(root, resolve(first.directory, 'criteria.md')), publicRoot: relative(root, author),
  }
  const configBytes = plan(configPath, cfg)
  const roundBinding = (directory: string, campaign: any) => ({
    directory, campaignId: campaign.campaignId, campaignDigest: fingerprintGoalDescriptionReviewCampaign(campaign),
    roundId: campaign.roundId, independenceGroupId: campaign.independenceGroupId,
    batchId: campaign.batches[0].batchId, batchInputFingerprint: campaign.batches[0].batchInputFingerprint,
  })
  const manifest = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json',
    schemaVersion: 1, validationContract: 'goal-description-rollout-batch-v1', batchId,
    subject: 'biologie', subjectLabel: 'Biologie', configPath: relative(root, configPath), configDigest: sha(configBytes),
    goalIds: cfg.goalIds, curriculumAtomicDenominatorAtPreparation: 394,
    source: { baseGoalBookConfigPath: cfg.baseGoalBookConfigPath, landscapePath: model.source.landscapePath,
      landscapeId: model.book.landscapeId, baseBookDigest: modelFull.digest },
    artifacts: { bundleDirectory: 'bundle', bookModelPath: 'bundle/book-model.json', bookModelDigest: model.digest,
      bundleManifestPath: 'bundle/manifest.json', bundleFingerprint: bundle.bundleFingerprint,
      reviewInputFingerprint: input.reviewInputFingerprint,
      rounds: { first: roundBinding('round-a', first.campaign), second: roundBinding('round-b', second.campaign) } },
    reviewPolicy: { oneBatchPerRound: true, blindIndependentFirstPass: true, aiRecordsAreCandidatesOnly: true,
      automaticAcceptance: false },
  }
  const manifestBytes = plan(resolve(out, 'batch-manifest.json'), manifest)
  const sourceBundle = resolve(group.native, 'bundle')
  for (const name of readdirSync(sourceBundle, { recursive: true }) as string[]) {
    const path = resolve(sourceBundle, name), stat = lstatSync(path)
    if (stat.isDirectory()) continue
    assert.ok(stat.isFile(), 'Portable original bundle must contain only regular files/directories')
    copy(path, resolve(out, 'bundle', name))
  }
  copy(resolve(sourceBundle, 'review-bundle-manifest.json'), resolve(out, 'bundle/manifest.json'))
  for (const [index, side] of ['a', 'b'].entries()) {
    const original = rounds[index], target = resolve(out, 'round-' + side)
    for (const name of ['description-review-input.json', 'description-review-campaign.json',
      'review-bundle-manifest.json', 'prompt.md', 'criteria.md', 'contracts/goal-description-review-record.schema.json']) {
      copy(resolve(original.directory, name), resolve(target, name))
    }
    const originalBatchId = original.campaign.batches[0].batchId
    copy(resolve(original.directory, 'batches', originalBatchId + '.input.jsonl'),
      resolve(target, 'batches', originalBatchId + '.input.jsonl'))
    for (const suffix of ['records.jsonl', 'run.json']) {
      copy(resolve(original.resultsDirectory, originalBatchId + '.' + suffix),
        resolve(target, 'results', originalBatchId + '.' + suffix))
    }
  }
  plan(resolve(out, 'dual-summary.json'), dualBytes)
  const batchBinding = { batchId, batchManifestDigest: sha(manifestBytes), configDigest: manifest.configDigest,
    bundleFingerprint: bundle.bundleFingerprint, bookDigest: input.bookDigest,
    reviewInputFingerprint: input.reviewInputFingerprint, dualSummaryDigest: sha(dualBytes),
    canonicalLandscapeDigest: sha(bytes(sourceCanon)) }
  const synthesisRounds = {
    first: buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].first.binding, first.campaign.batches[0].batchInputFingerprint),
    second: buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].second.binding, second.campaign.batches[0].batchInputFingerprint),
  }
  const expectedGoals = sources.map(({ goal, first, second }: any) => ({
    goalId: goal.goalId, effectiveSemanticKind: 'curricularAtomic', goalFingerprint: goal.goalFingerprint,
    pageFingerprint: goal.pageFingerprint, goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(goal),
    finalText: { titleDe: goal.currentTitleDe, titleEn: goal.currentTitleEn,
      descriptionDe: goal.currentDescriptionDe, descriptionEn: goal.currentDescriptionEn },
    firstSource: first, secondSource: second,
  }))
  const decisions = sources.map(({ goal, first, second }: any) => ({
    decisionId: batchId + '-decision-' + goal.goalId, goalId: goal.goalId, effectiveSemanticKind: 'curricularAtomic',
    goalFingerprint: goal.goalFingerprint, pageFingerprint: goal.pageFingerprint,
    goalReviewContextFingerprint: fingerprintGoalDescriptionReviewContext(goal),
    finalText: { titleDe: goal.currentTitleDe, titleEn: goal.currentTitleEn,
      descriptionDe: goal.currentDescriptionDe, descriptionEn: goal.currentDescriptionEn },
    resolutionDecision: 'keep_current', evidenceRound: 'first',
    records: { first: { recordId: first.binding.recordId, recordDigest: first.binding.recordDigest },
      second: { recordId: second.binding.recordId, recordDigest: second.binding.recordDigest } },
    rationaleDe: 'Technische Übernahme zweier echter blinder unabhängiger KEEP-Urteile für denselben ganzen aktuellen DE/EN-Ziel-, Native-Seiten- und Kontexteingang. Originale Kampagnen-, Input-, Record- und Runbytes bleiben unverändert. Neue2 und bestehender Word576-Kontext bleiben getrennte native Indexgruppen; der gültige ganze P von Word576 und sein historischer D-Index bleiben erhalten. Die endgültigen neun Quellenpflichten und zehn Kanten sind nur geprüfte partielle Beiträge; vier ursprüngliche Operator-HOLDs bleiben offen. Keine neue Fachprüfung oder menschliche Freigabe. A: ' + first.record.rationale + ' B: ' + second.record.rationale,
    rationaleEn: 'Technical adoption of two genuine blind independent KEEP judgments over the same whole current bilingual goal, native page and context. Original campaign, input, record and run byte streams are preserved. New2 and existing Word576 context remain separate native index groups; the valid whole Word576 P and historical D index are retained. The final nine source duties and ten edges remain bounded partial contributions; four original operator HOLDs stay open. No new scientific review or human approval. A: ' + first.record.understandingEvidence.essentialUnderstandingEn + ' B: ' + second.record.understandingEvidence.essentialUnderstandingEn,
  }))
  const payload = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',
    schemaVersion: 1, synthesisContract: 'goal-description-rollout-synthesis-decision-v1',
    manifestId: batchId + '-synthesis', authority: 'ai_synthesis',
    synthesizedBy: 'Codex technical integrator; original sealed A/B KEEP adoption, no new scientific reviewer',
    synthesizedAt, batch: batchBinding, rounds: synthesisRounds, decisions,
  }
  const synthesis = { ...payload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload as any) }
  const synthesisValidation = await validateGoalDescriptionRolloutSynthesisDecisionManifest({
    manifest: synthesis as any, expected: { batch: batchBinding as any, rounds: synthesisRounds,
      synthesizedAt, goals: expectedGoals as any },
  })
  assert.deepEqual(synthesisValidation.errors, [])
  const synthesisBytes = plan(resolve(out, 'synthesis-decisions.json'), synthesis)
  const entries: any[] = [], results: any[] = []
  for (const source of sources) {
    const decision = decisions.find((value: any) => value.goalId === source.goal.goalId)!
    const summaryGoal = summary.goals.find((value: any) => value.goalId === source.goal.goalId)!
    const fact = buildGoalDescriptionRolloutResolutionSynthesis({ batchId, manifest: synthesis as any,
      decision: decision as any, summaryGoal, firstSource: source.first, secondSource: source.second })
    const resolution = buildGoalDescriptionDualRoundResolution({
      resolutionId: batchId + '-resolution-' + source.goal.goalId, goalId: source.goal.goalId,
      effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', synthesis: fact,
      dualSummaryBytes: dualBytes, currentInput: input, firstSource: source.first, secondSource: source.second,
      synthesisDecisionManifest: { contract: 'goal-description-rollout-synthesis-decision-v1',
        manifestId: synthesis.manifestId, manifestPath: 'synthesis-decisions.json',
        manifestDigest: sha(synthesisBytes), manifestFingerprint: synthesis.manifestFingerprint,
        decisionId: decision.decisionId },
    })
    const validation = await validateGoalDescriptionDualRoundResolution({
      resolution, dualSummary: summary, dualSummaryBytes: dualBytes, currentInput: input, landscape,
      first, second, synthesisDecisionManifestArtifact: { manifest: synthesis as any,
        manifestBytes: synthesisBytes, manifestPath: 'synthesis-decisions.json' },
    })
    assert.deepEqual(validation.errors, [], source.goal.goalId + ' ordinary resolution validation')
    assert.equal(validation.strictDescriptionComplete, true)
    const path = 'resolutions/' + source.goal.goalId + '.resolution.json'
    const resolutionBytes = plan(resolve(out, path), resolution)
    entries.push({ goalId: source.goal.goalId, titleDe: source.goal.currentTitleDe, groupId: batchId,
      decision: 'keep_current', resolutionPath: path, resolutionDigest: sha(resolutionBytes),
      resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
    results.push({ goalId: source.goal.goalId, errors: validation.errors, nativeLowerDescriptionComplete: true,
      standardResolutionId: resolution.resolutionId, humanApproval: false, centralStrictGain: 0 })
  }
  const index = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
    schemaVersion: 2, indexContract: 'goal-description-standalone-batch-resolution-index-v1',
    artifactSetId: batchId + '-strict-resolutions', subject: 'Biologie', semanticKind: 'curricularAtomic',
    batchGoalIds: cfg.goalIds, groups: [{ groupId: batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json',
      dualSummaryDigest: sha(dualBytes), campaignGoalCount: summary.goalCount, resolvedGoalCount: entries.length }],
    resolutions: entries,
  }
  assert.ok(validateIndex(index), JSON.stringify(validateIndex.errors))
  const indexPath = resolve(out, 'resolution-index.json'), indexBytes = plan(indexPath, index)
  adopted.push({ scope: group.scope, goalIds: cfg.goalIds,
    config: { path: relative(root, configPath), sha256: sha(configBytes), bytes: configBytes.length },
    index: { path: relative(root, indexPath), sha256: sha(indexBytes), bytes: indexBytes.length },
    originalResultsDirectories: group.results.map((path: string) => relative(root, path)),
    nativeCampaignResultsPASS: true, nativeDualSummaryPASS: true, nativeSynthesisPASS: true,
    resolutions: results, upperCurrentCanonicalRouteRemaining: true })
}
assert.equal(adopted.length, 2)
assert.equal(adopted.reduce((count, group) => count + group.resolutions.length, 0), 3)
plan(resolve(own, 'checks/genuine-two-plus-word-native-D-direct-existing-contracts.actual.json'), {
  schemaVersion: 1, readinessReceipt: binding(readinessPath), authorEntry: binding(neutralPath),
  authorFirstSeal: binding(authorSealPath), originalLivePreservationGuard: binding(guardPath), D: adopted,
  originalCampaignAndInputAndRecordAndRunBytesUnchanged: true, completeBlindIndependentActualSources: true,
  separateNewTwoAndExistingWordNativeIndexes: true, standardResolutions: 3,
  current244And392HumanFieldsRequireExactPreservation: true,
  existingWordHistoricalDIndexUntouched: true, existingWordValidWholePUnchanged: true,
  explicitExistingWordSupersessionPendingRoot: true, originalFourOperatorHoldsRetained: true,
  noNewScienceRun: true, noUniversalSourceApproval: true,
  activeWrites: 0, humanApproval: false, humanTrial: false, newStrictClosuresClaimed: 0,
})
plan(resolve(own, 'checks/genuine-two-plus-word-native-D-declared-inputs.actual.json'), {
  schemaVersion: 1, files: [...declared.values()],
})

// Check every immutable output first. Only fully validated inactive artifacts can now be written.
for (const [path, value] of planned) {
  if (existsSync(path)) assert.equal(sha(readFileSync(path)), sha(value), 'Existing output cannot be overwritten: ' + path)
}
for (const [path, value] of planned) {
  if (existsSync(path)) continue
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, value, { flag: 'wx' })
}
console.log(JSON.stringify({ nativeCampaignResults: 'PASS', nativeDual: 'PASS', nativeSynthesis: 'PASS',
  separateNativeIndexGroups: 2, standardResolutions: 3, originalCampaignAndReviewerIdsPreserved: true,
  newStrictClosuresClaimed: 0, activeWrites: 0, humanApproval: false, humanTrial: false }))
