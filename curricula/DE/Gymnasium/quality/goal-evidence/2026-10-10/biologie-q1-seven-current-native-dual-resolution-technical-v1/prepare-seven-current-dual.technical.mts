// SPDX-License-Identifier: Apache-2.0
// Technical selection of existing sealed independent A/B KEEP records.
// This driver combines actual independently sealed reviews and performs no active adoption.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { loadGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import { validateGoalDescriptionReviewDualRound } from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound.ts'
import {
  buildGoalDescriptionDualRoundResolution,
  extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution,
} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {
  validateStandaloneResolutionIndexSchema,
  validateStandaloneResolutionIndexStructure,
} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout.ts'

const root = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const base = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
const author = resolve(base, 'biologie-q1-eight-title-methyl-current-native-technical-author-successor-v2')
const firstReview = resolve(base, 'biologie-q1-eight-title-methyl-current-native-independent-a-20261010-v2')
const secondReview = resolve(base, 'biologie-q1-eight-title-methyl-current-native-independent-b-20261010-v1')
const native = resolve(author, 'native/eight-title-methyl-current-P')
const out = resolve(own, 'native-d-seven-current')
const batchIds = [
  '7975e43b-1187-5ae3-a1ab-282fc3c0548c',
  '3f969b9e-68b0-5442-b8e4-df4e35e83087',
  'ed4cf96f-e1c9-5784-97f2-8279ff5a31b1',
  '52ecc72a-a65b-53a0-851e-86defe769fa7',
  '3312b2bb-bc90-5c0f-a859-4b4f9b8ff117',
  '99544494-1825-5fc1-8e23-56f0df808e56',
  '3b55b551-cd7f-53fb-9bf0-fd8149ac1222',
  '666fb1d1-09a8-55a3-acd5-efe311cac8b0',
]
const deferredGoalId = '3312b2bb-bc90-5c0f-a859-4b4f9b8ff117'
const ids = batchIds.filter((id) => id !== deferredGoalId)
const groupId = 'biologie-seven-of-eight-current-native-dual-20261010-v1'
const sha = (value: Buffer | string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const declared = new Map<string, { path: string; sha256: string; bytes: number }>()
const bind = (path: string) => {
  assert.ok(lstatSync(path).isFile(), `A regular versionable input file is required: ${path}`)
  const bytes = readFileSync(path)
  return { path: relative(root, path), sha256: sha(bytes), bytes: bytes.length }
}
const use = (path: string) => {
  const binding = bind(path)
  const previous = declared.get(binding.path)
  if (previous) assert.deepEqual(binding, previous, `Changed declared input: ${binding.path}`)
  declared.set(binding.path, binding)
  return binding
}
const bytes = (path: string) => { use(path); return readFileSync(path) }
const read = (path: string): any => JSON.parse(bytes(path).toString('utf8'))
const write = (path: string, value: any) => {
  assert.ok(path.startsWith(`${own}/`), 'Writes are restricted to this new inactive folder')
  assert.equal(existsSync(path), false, `Preserve existing artifacts: ${path}`)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, Buffer.isBuffer(value) || typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
}
const copy = (from: string, to: string) => write(to, bytes(from))
const verifyDeclaredBindings = (value: any) => {
  if (Array.isArray(value)) return value.forEach(verifyDeclaredBindings)
  if (!value || typeof value !== 'object') return
  if (typeof value.path === 'string' && typeof value.sha256 === 'string') {
    assert.equal(value.path.startsWith('/'), false, 'Frozen input paths must be repository relative')
    assert.equal(value.path.split('/').includes('..'), false, 'Frozen input paths may not traverse directories')
    const actual = use(resolve(root, value.path))
    assert.equal(actual.sha256, `sha256:${value.sha256.replace(/^sha256:/, '')}`, value.path)
    if (value.bytes !== undefined) assert.equal(actual.bytes, value.bytes, value.path)
  }
  Object.values(value).forEach(verifyDeclaredBindings)
}
const authorEntryPath = resolve(author, 'neutral-eight-title-methyl-current-native.independent-review.entry.json')
const authorEntry = read(authorEntryPath)
assert.deepEqual(authorEntry.normalPrerequisiteSafeNativeGoalOrder, batchIds)
const sealPaths = [
  resolve(author, 'author.final.freeze.json'),
  resolve(firstReview, 'FIRST.seal.json'),
  resolve(secondReview, 'FIRST.independent.final.freeze.json'),
]
sealPaths.forEach((path) => verifyDeclaredBindings(read(path)))
verifyDeclaredBindings(authorEntry)
const candidateBinding = authorEntry.neutralWholeFirstInputs.whole479CurrentGoalBodiesWithTwoTitleFieldsAndEightRasterLinks
const modelBinding = authorEntry.neutralWholeFirstInputs.whole394CurrentModel
const candidate = read(resolve(root, candidateBinding.path))
const fullModel = read(resolve(root, modelBinding.path))
assert.equal(candidate.goals.length, 479)
assert.equal(fullModel.pages.length, 394)

const currentBookConfig = { landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json', semanticKindLedgerPath: 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json', goalVisualizationQaPath: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json' }
const protectedActivePaths = [
  currentBookConfig.landscapePath,
  currentBookConfig.semanticKindLedgerPath,
  currentBookConfig.goalVisualizationQaPath,
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
].filter(Boolean).map((path: string) => resolve(root, path))
const protectedBefore = protectedActivePaths.map(use)
const roundInputs = [
  { label: 'a', resultDirectory: resolve(firstReview, 'normal-campaign-a/results') },
  { label: 'b', resultDirectory: resolve(secondReview, 'results') },
]
for (const round of roundInputs) {
  const source = resolve(native, `round-${round.label}`)
  const target = resolve(out, `round-${round.label}`)
  const campaign = read(resolve(source, 'description-review-campaign.json'))
  assert.equal(campaign.blindToOtherReviews, true)
  assert.equal(campaign.batches.length, 1)
  for (const name of [
    'description-review-input.json', 'description-review-campaign.json',
    'review-bundle-manifest.json', 'prompt.md', 'criteria.md',
    'contracts/goal-description-review-record.schema.json',
  ]) copy(resolve(source, name), resolve(target, name))
  const batchId = campaign.batches[0].batchId
  copy(resolve(source, `batches/${batchId}.input.jsonl`), resolve(target, `batches/${batchId}.input.jsonl`))
  for (const suffix of ['records.jsonl', 'run.json']) {
    copy(resolve(round.resultDirectory, `${batchId}.${suffix}`), resolve(target, `results/${batchId}.${suffix}`))
  }
}
const loadRound = async (label: string) => {
  const directory = resolve(out, `round-${label}`)
  const bundle = read(resolve(directory, 'review-bundle-manifest.json'))
  const input = read(resolve(directory, 'description-review-input.json'))
  const campaign = read(resolve(directory, 'description-review-campaign.json'))
  const loaded = await loadGoalDescriptionReviewCampaignResultDirectories({
    campaign, batchesDirectory: resolve(directory, 'batches'), resultsDirectory: resolve(directory, 'results'),
  })
  assert.deepEqual(loaded.errors, [])
  return { bundle, input, campaign, resultPairs: loaded.resultPairs }
}
const [first, second] = await Promise.all([loadRound('a'), loadRound('b')])
assert.deepEqual(first.input.goals.map((goal: any) => goal.goalId), batchIds)
assert.equal(stableGoalBookJson(first.input), stableGoalBookJson(second.input))
const dual = await validateGoalDescriptionReviewDualRound({ first, second })
assert.deepEqual(dual.errors, [])
assert.ok(dual.summary)
const deferredComparison = dual.summary.goals.find((item) => item.goalId === deferredGoalId)!
assert.equal(deferredComparison.firstDecision, 'keep')
assert.equal(deferredComparison.secondDecision, 'block')
const dualBytes = Buffer.from(`${JSON.stringify(dual.summary, null, 2)}\n`)
write(resolve(out, 'dual-summary.json'), dualBytes)
const entries: any[] = []
const actual: any[] = []
for (const goalId of ids) {
  const a = extractGoalDescriptionDualRoundResolutionSource({ artifacts: first, goalId, label: 'Actual sealed independent A' })
  const b = extractGoalDescriptionDualRoundResolutionSource({ artifacts: second, goalId, label: 'Actual sealed independent B' })
  assert.deepEqual(a.errors, [])
  assert.deepEqual(b.errors, [])
  assert.ok(a.source?.record && b.source?.record)
  assert.equal(a.source.decision, 'keep')
  assert.equal(b.source.decision, 'keep')
  assert.equal(a.source.record.evidenceProfileRecommendation, 'none')
  assert.equal(b.source.record.evidenceProfileRecommendation, 'none')
  const comparison = dual.summary.goals.find((item) => item.goalId === goalId)!
  const synthesis = {
    synthesisId: `${groupId}-selection-${goalId}`,
    authority: 'ai_synthesis' as const,
    synthesizedBy: 'Codex technical integrator of two separately sealed independent A and B reviews; no third scientific review',
    synthesizedAt: new Date().toISOString(),
    rationaleDe: 'Inaktive technische Zusammenführung der zwei unabhängig versiegelten aktuellen KEEP-Reviews für dieses Ziel aus dem tatsächlichen Native8-Kontext. Beide Reviewer haben die ganzen aktuellen HTML-/PDF-Seiten selbst gesehen und grenzen ihre wiederverwendeten unveränderten wissenschaftlichen Materialien ehrlich ab. Ihre Begründungen und Verständnisevidenz stimmen in Kompetenz, Modellgrenzen, Transfer und Quellen-/Kursgrenzen überein; unterschiedliche Formulierungen erfordern keine fachliche Änderung. Die unveränderte erste Verständnisevidenz wird ausgewählt, beide vollständigen Records bleiben bytegleich erhalten. Der technische Integrator ist keiner der beiden D-Reviewer und beansprucht keine dritte Fachprüfung. Der separate Quellenstreit zu3312 wird ausdrücklich nicht aufgelöst und dieses Ziel bleibt deferred. Keine aktive Integration, ganze Quellen-/Kursfreigabe, Lernendenbeobachtung oder menschliche Freigabe.',
    rationaleEn: 'Inactive technical combination of two independently sealed current KEEP reviews for this goal in the actual Native8 context. Both reviewers personally saw the whole current HTML/PDF pages and truthfully delimit reused unchanged scientific material. Their rationales and understanding evidence agree on competence, model limits, transfer and source/course limits; differing wording calls for no scientific correction. Unchanged first understanding evidence is selected while both complete records remain byte-exact. The technical integrator is neither D reviewer and claims no third subject review. The separate source dispute for3312 remains unresolved and that goal is explicitly deferred. No active integration, whole-source/course clearance, learner observation or human approval.',
    understandingEvidence: structuredClone(a.source.record.understandingEvidence),
    dissent: comparison.agreement === 'disagreement' ? [{
      dissentId: `${groupId}-wording-${goalId}`,
      source: 'both' as const,
      textDe: `Der normale Vergleich meldet unterschiedliche Felder: ${comparison.disagreementFields.join(', ')}. Beide unabhängigen Records entscheiden KEEP ohne Korrekturempfehlung; die unterschiedlichen Begründungs- und Evidenzformulierungen werden hier nicht als fachlicher Streit ausgegeben. Die unveränderte erste Verständnisevidenz wird ausgewählt, während beide ganzen Records und ihre jeweiligen Quellen-/Durchführungsgrenzen erhalten bleiben.`,
      textEn: `The normal comparison reports differing fields: ${comparison.disagreementFields.join(', ')}. Both independent records decide KEEP with no correction recommendation; the differently phrased rationales and evidence are not represented here as a subject-matter dispute. The unchanged first understanding evidence is selected while both complete records and their source and execution limits are retained.`,
      disposition: 'accepted_first' as const,
    }] : [],
    humanAttestation: null,
  }
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: `${groupId}-resolution-${goalId}`, goalId, effectiveSemanticKind: 'curricularAtomic',
    decision: 'keep_current', synthesis, dualSummaryBytes: dualBytes, currentInput: first.input,
    firstSource: a.source, secondSource: b.source,
  })
  const validation = await validateGoalDescriptionDualRoundResolution({
    resolution, dualSummary: dual.summary, dualSummaryBytes: dualBytes,
    currentInput: first.input, landscape: candidate, first, second,
  })
  assert.deepEqual(validation.errors, [])
  assert.equal(validation.strictDescriptionComplete, true)
  const path = resolve(out, `resolutions/${goalId}.resolution.json`)
  write(path, resolution)
  entries.push({ goalId, titleDe: resolution.goal.finalText.titleDe, groupId, decision: 'keep_current',
    resolutionPath: `resolutions/${goalId}.resolution.json`, resolutionDigest: bind(path).sha256,
    resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
  actual.push({ goalId, firstBinding: a.source.binding, secondBinding: b.source.binding,
    firstRationaleUnchanged: a.source.record.rationale, secondRationaleUnchanged: b.source.record.rationale,
    firstUnderstandingEvidenceUnchanged: a.source.record.understandingEvidence,
    secondUnderstandingEvidenceUnchanged: b.source.record.understandingEvidence,
    differingFields: comparison.disagreementFields, normalValidation: validation,
    scientificDisputeClaimed: false, newScientificReviewClaimed: false })
}
const index: any = {
  $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',
  schemaVersion: 2, indexContract: 'goal-description-standalone-batch-resolution-index-v1',
  artifactSetId: `${groupId}-candidate-resolutions`, subject: 'Biologie', semanticKind: 'curricularAtomic', batchGoalIds: batchIds, deferredGoalIds: [deferredGoalId],
  groups: [{ groupId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: sha(dualBytes),
    campaignGoalCount: 8, resolvedGoalCount: 7 }], resolutions: entries,
}
assert.deepEqual(validateStandaloneResolutionIndexSchema(index), [])
assert.deepEqual(validateStandaloneResolutionIndexStructure(index, new Set(fullModel.pages.map((page: any) => page.goalId))), [])
write(resolve(out, 'resolution-index.json'), index)
for (const binding of declared.values()) assert.deepEqual(bind(resolve(root, binding.path)), binding)
assert.deepEqual(protectedActivePaths.map(bind), protectedBefore)
write(resolve(own, 'checks/inactive-seven-dual-resolution.normal.actual.json'), {
  schemaVersion: 1, checkedAt: new Date().toISOString(), role: 'technical combination of actual independently sealed A and B; seven KEEP resolutions, one genuine source disagreement deferred; no new subject review',
  normalDualSummary: dual.summary, individualResolutions: actual, standaloneIndexSchemaAndStructure: 'PASS',
  originalFrozenDeclaredInputsUnchanged: true, protectedActiveBindingsUnchanged: protectedBefore,
  declaredInputCount: declared.size, activeWrites: [], newScientificReviews: 0,
  integratedStrictCompletions: 0, restoredActiveBindings: 0, strictNetGain: 0,
  deferredSource3312: { goalId: deferredGoalId, firstDecision: deferredComparison.firstDecision, secondDecision: deferredComparison.secondDecision, currentSourceHoldUnresolved: true, rewrittenPeerDecisions: false },
  protectedCurrent315: 'Both actual independent reviewers separately checked all315 whole goal and page bodies against the normal current exact-ID list; unchanged.',
  openBoundaries: ['3312 genuine primary-source identity and bounded partial contribution', 'whole original16 source duties/113 partner edges/41 partner bodies', 'four deferred risk/ethics rasters', 'HE optional programme and Hox/development/telomere scope', 'human review, approval and trial'],
  humanApproval: false, humanTrial: false, actualLearnerPerformanceClaimed: false,
  diversityDisclosure: 'Existing report_only policy is unchanged. Two separately executed peerblind current D FIRSTs are preserved; unknown model versions or parameter labels are not invented or counted as independent provider evidence.',
})
write(resolve(own, 'checks/declared-input-bindings.actual.json'), { schemaVersion: 1, files: [...declared.values()] })
write(resolve(own, 'inactive-seven-dual-resolution.technical.entry.json'), {
  schemaVersion: 1, preparedAt: new Date().toISOString(), role: 'inactive technical integration preparation; no new subject review',
  goalIds: ids, deferredGoalIds: [deferredGoalId], candidateCanonical: bind(resolve(root, candidateBinding.path)),
  whole394Model: bind(resolve(root, modelBinding.path)),
  originalAuthorEntry: bind(authorEntryPath), originalSeals: sealPaths.map(bind),
  originalNativePDF: authorEntry.neutralWholeFirstInputs.actualWholeNativePdf, originalNativeHTML: authorEntry.neutralWholeFirstInputs.actualWholeNativeHtml,
  originalNativeBundle: authorEntry.neutralWholeFirstInputs.normalManifest, originalNativeModel: authorEntry.neutralWholeFirstInputs.currentNormalNative8Model,
  resolutionIndex: bind(resolve(out, 'resolution-index.json')), dualSummary: bind(resolve(out, 'dual-summary.json')),
  actualNormalValidation: bind(resolve(own, 'checks/inactive-seven-dual-resolution.normal.actual.json')),
  declaredInputBindings: bind(resolve(own, 'checks/declared-input-bindings.actual.json')),
  activeIntegration: false, newScientificReviews: 0, integratedStrictCompletions: 0, strictNetGain: 0,
})
console.log(JSON.stringify({ normalCampaignResults: 'PASS', normalDualRound: 'PASS', normalIndividualResolutions: 7, deferredGoalIds: [deferredGoalId],
  normalStandaloneIndex: 'PASS', inactiveOnly: true, newScientificReviews: 0, integratedStrictCompletions: 0, activeWrites: 0 }))
