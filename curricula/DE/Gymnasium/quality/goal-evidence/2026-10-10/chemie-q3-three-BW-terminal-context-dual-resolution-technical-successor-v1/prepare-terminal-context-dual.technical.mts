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
const author = resolve(base, 'chemie-q3-three-BW-practical-terminal-route-author-candidate-v1')
const firstReview = resolve(base, 'chemie-q3-three-BW-practical-terminal-native-independent-a-20261010-v1')
const secondReview = resolve(base, 'chemie-q3-three-BW-practical-terminal-route-independent-b-20261010-v1')
const native = resolve(author, 'native/three-current-route-context')
const out = resolve(own, 'native-d-three-current')
const ids = [
  'd2d735de-bede-5310-8aeb-8bb7562c7b75',
  'a0f6ba09-f072-5887-a797-fa369453c62a',
  '7b39fa19-fec3-575e-9324-a3226b703358',
]
const groupId = 'chemie-three-BW-terminal-current-context-dual-20261010-v1'
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
const authorEntryPath = resolve(author, 'neutral-three-BW-practical-terminal-current-native.independent-review.entry.json')
const authorEntry = read(authorEntryPath)
assert.deepEqual(authorEntry.ordinaryGoalIds, ids)
const sealPaths = [
  resolve(author, 'author.final.freeze.json'),
  resolve(firstReview, 'independent-a.final.freeze.json'),
  resolve(secondReview, 'FIRST.independent.final.freeze.json'),
]
sealPaths.forEach((path) => verifyDeclaredBindings(read(path)))
verifyDeclaredBindings(authorEntry)
const candidate = read(resolve(root, authorEntry.wholeCandidateCanonical.path))
const fullModel = read(resolve(root, authorEntry.normalCurrentFull381Model.path))
assert.equal(candidate.goals.length, 487)
assert.equal(fullModel.pages.length, 381)

const currentBookConfig = { landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', semanticKindLedgerPath: 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json', goalVisualizationQaPath: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json' }
const protectedActivePaths = [
  currentBookConfig.landscapePath,
  currentBookConfig.semanticKindLedgerPath,
  currentBookConfig.goalVisualizationQaPath,
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
].filter(Boolean).map((path: string) => resolve(root, path))
const protectedBefore = protectedActivePaths.map(use)
const roundInputs = [
  { label: 'a', resultDirectory: resolve(firstReview, 'results') },
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
assert.deepEqual(first.input.goals.map((goal: any) => goal.goalId), ids)
assert.equal(stableGoalBookJson(first.input), stableGoalBookJson(second.input))
const dual = await validateGoalDescriptionReviewDualRound({ first, second })
assert.deepEqual(dual.errors, [])
assert.ok(dual.summary)
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
    synthesizedBy: 'Codex technical integrator after own independent A and separately sealed blind B; no third scientific review',
    synthesizedAt: new Date().toISOString(),
    rationaleDe: 'Inaktive technische Zusammenführung der zwei bereits abgeschlossenen unabhängigen KEEP-Reviews für genau die gleiche aktuelle Native3-Ziel-, Seiten-, Quellen-, P- und Bildkontextbindung. Unterschiedliche Formulierungen ihrer Begründungen und Verständnisevidenz sind vereinbar und enthalten keine abweichende Entscheidung oder Korrekturempfehlung. Die unveränderte erste Verständnisevidenz wird ausgewählt; der vollständige zweite Nachweis bleibt bytegleich erhalten. Der technische Integrator führt sein unabhängig versiegeltes A-Ergebnis und das separat peerblind versiegelte B-Ergebnis zusammen und beansprucht keine dritte Fachprüfung. Es erfolgt keine aktive Integration, ganze Quellen- oder Programmfreigabe, Lernendenbeobachtung oder menschliche Freigabe.',
    rationaleEn: 'Inactive technical combination of the two completed independent KEEP reviews for exactly the same current Native3 goal, page, source, P-profile and image context. Their differently phrased rationales and understanding evidence are compatible and contain no differing decision or correction recommendation. The unchanged first understanding evidence is selected; the complete second proof remains byte-exact. The technical integrator selects its independently sealed A evidence and the separately sealed blind B evidence and claims no third subject review. This performs no active integration, whole-source or programme clearance, learner observation or human approval.',
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
  artifactSetId: `${groupId}-candidate-resolutions`, subject: 'Chemie', semanticKind: 'curricularAtomic', batchGoalIds: ids,
  groups: [{ groupId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: sha(dualBytes),
    campaignGoalCount: 3, resolvedGoalCount: 3 }], resolutions: entries,
}
assert.deepEqual(validateStandaloneResolutionIndexSchema(index), [])
assert.deepEqual(validateStandaloneResolutionIndexStructure(index, new Set(fullModel.pages.map((page: any) => page.goalId))), [])
write(resolve(out, 'resolution-index.json'), index)
for (const binding of declared.values()) assert.deepEqual(bind(resolve(root, binding.path)), binding)
assert.deepEqual(protectedActivePaths.map(bind), protectedBefore)
write(resolve(own, 'checks/inactive-three-dual-resolution.normal.actual.json'), {
  schemaVersion: 1, checkedAt: new Date().toISOString(), role: 'technical successor after actual independent A and blind B; no third subject review',
  normalDualSummary: dual.summary, individualResolutions: actual, standaloneIndexSchemaAndStructure: 'PASS',
  originalFrozenDeclaredInputsUnchanged: true, protectedActiveBindingsUnchanged: protectedBefore,
  declaredInputCount: declared.size, activeWrites: [], newScientificReviews: 0,
  integratedStrictCompletions: 0, restoredActiveBindings: 0, strictNetGain: 0,
  source002: 'partial; broader original duties and original edges remain intact',
  oldTheoryPages: 'No additional existing content pages changed in this terminal-only successor; all378 ordinary pages besides the current3 are exact.',
  openBoundaries: ['corrosion owner', 'whole original source duties', 'final normal active maturity-floor verification', 'human review, approval and trial'],
  humanApproval: false, humanTrial: false, actualLearnerPerformanceClaimed: false,
  diversityDisclosure: 'Existing report_only policy is unchanged. Exact recorded provider/model labels are reported without treating OpenAI versus OpenAI/Codex as independent provider evidence; A does not expose an exact model version.',
})
write(resolve(own, 'checks/declared-input-bindings.actual.json'), { schemaVersion: 1, files: [...declared.values()] })
write(resolve(own, 'inactive-three-dual-resolution.technical.entry.json'), {
  schemaVersion: 1, preparedAt: new Date().toISOString(), role: 'inactive technical integration preparation; no new subject review',
  goalIds: ids, candidateCanonical: bind(resolve(root, authorEntry.wholeCandidateCanonical.path)),
  whole381Model: bind(resolve(root, authorEntry.normalCurrentFull381Model.path)),
  originalAuthorEntry: bind(authorEntryPath), originalSeals: sealPaths.map(bind),
  originalNativePDF: authorEntry.actualNativePDF, originalNativeHTML: authorEntry.actualNativeHTML,
  originalNativeBundle: authorEntry.actualNativeBundle, originalNativeModel: authorEntry.actualNative3Model,
  resolutionIndex: bind(resolve(out, 'resolution-index.json')), dualSummary: bind(resolve(out, 'dual-summary.json')),
  actualNormalValidation: bind(resolve(own, 'checks/inactive-three-dual-resolution.normal.actual.json')),
  declaredInputBindings: bind(resolve(own, 'checks/declared-input-bindings.actual.json')),
  activeIntegration: false, newScientificReviews: 0, integratedStrictCompletions: 0, strictNetGain: 0,
})
console.log(JSON.stringify({ normalCampaignResults: 'PASS', normalDualRound: 'PASS', normalIndividualResolutions: 3,
  normalStandaloneIndex: 'PASS', inactiveOnly: true, newScientificReviews: 0, integratedStrictCompletions: 0, activeWrites: 0 }))
