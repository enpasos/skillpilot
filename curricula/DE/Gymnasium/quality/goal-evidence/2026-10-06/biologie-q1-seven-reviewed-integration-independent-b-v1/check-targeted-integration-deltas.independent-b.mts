import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
const prepared = base + '/biologie-q1-seven-final-native-review-inputs-author-v1'
const candidate = base + '/biologie-q1-seven-reviewed-integration-candidate-v1'
const own = base + '/biologie-q1-seven-reviewed-integration-independent-b-v1'
const prior = base + '/biologie-q1-seven-native-v7-independent-b-v1'
const actualInputs = new Map<string, any>()
const bytes = (path: string) => { const data = readFileSync(resolve(path)); actualInputs.set(path, { path, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length }); return data }
const read = (path: string) => JSON.parse(bytes(path).toString())
const equal = (x: any, y: any) => stableGoalBookJson(x) === stableGoalBookJson(y)
const assert = (x: any, label: string) => { if (!x) throw new Error(label) }
const before = read(prepared + '/inputs/canonical-390.de.candidate.json')
const after = read(candidate + '/canonical-390.integration-candidate.json')
const semBefore = read(prepared + '/inputs/semantic-kinds-390.candidate.json')
const semAfter = read(candidate + '/semantic-kinds-390.integration-candidate.json')
const dInput = read(prepared + '/round-b/description-review-input.json')
const sourceSnapshot = read(prepared + '/inputs/positive-review-inputs.native-fingerprints.pending.json')
const sourceReview = read(prior + '/seven-science-operator-atomicity-prerequisite.review.json')
const memoryReview = read(prior + '/seven-individual-memory-decisions.review.json')
const provenance = read(candidate + '/author-metadata-native-am-and-gui-supersets.actual.json')
const ids: string[] = dInput.goals.map((r: any) => r.goalId)
const cluster = 'd32d7a5e-26ac-5019-85f2-c994e2c6e795'
const point = 'bfb5dfb6-8e35-5452-b581-96e061d8b826'
assert(before.goals.length === after.goals.length, 'Goal membership change')
const afterById = new Map(after.goals.map((r: any) => [r.id, r]))
const metadataRows: any[] = []
for (const old of before.goals) {
  const next: any = afterById.get(old.id)
  assert(next, 'Missing goal ' + old.id)
  if (equal(old, next)) continue
  assert(ids.includes(old.id) || old.id === cluster, 'Unexpected old-goal delta ' + old.id)
  const without = structuredClone(old)
  delete without.extendedData.authorCandidate
  assert(equal(without, next), 'Nonmetadata semantic delta ' + old.id)
  assert(equal(provenance.metadataDeltas.find((r: any) => r.goalId === old.id)?.removedCandidateMetadata, old.extendedData.authorCandidate), 'Lost external provenance ' + old.id)
  assert(equal(buildGoalDescriptionCanonicalContext(old), buildGoalDescriptionCanonicalContext(next)), 'Changed D context ' + old.id)
  const oldP = fingerprintGoalForPositiveEvidence(old, 'curricularAtomic')
  const newP = fingerprintGoalForPositiveEvidence(next, 'curricularAtomic')
  assert(oldP === newP, 'Changed P goal fingerprint ' + old.id)
  const oldSem = semBefore.decisions.find((r: any) => r.goalId === old.id)
  const newSem = semAfter.decisions.find((r: any) => r.goalId === old.id)
  assert(newSem.sourceFingerprint === fingerprintSemanticKindSourceGoal(next), 'Missing updated native semantic source binding ' + old.id)
  assert(equal({ ...oldSem, sourceFingerprint: newSem.sourceFingerprint }, newSem), 'Changed semantic decision beyond source binding ' + old.id)
  metadataRows.push({ goalId: old.id, delta: 'remove extendedData.authorCandidate only; exact removed object retained externally', nativeDContextExact: true, nativePositiveGoalFingerprintExact: true, semanticSourceFingerprintRecomputed: true, semanticKindDecisionExact: true })
}
assert(metadataRows.length === 8, 'Expected exactly eight transient metadata deltas')
for (const row of semBefore.decisions) {
  if (ids.includes(row.goalId) || row.goalId === cluster) continue
  assert(equal(row, semAfter.decisions.find((r: any) => r.goalId === row.goalId)), 'Old semantic decision changed ' + row.goalId)
}
for (const row of dInput.goals) assert(equal(buildGoalDescriptionCanonicalContext(afterById.get(row.goalId)), row.canonicalContext), 'Mismatch actual reviewed D context ' + row.goalId)
for (const row of sourceSnapshot.rows) {
  assert(fingerprintGoalForPositiveEvidence(afterById.get(row.goalId), 'curricularAtomic') === row.goalFingerprint, 'Mismatch actual P input goal fingerprint ' + row.goalId)
  assert(fingerprintPositiveGoalEvidenceReviewInput(afterById.get(row.goalId), row.reviewCriteriaFingerprint, row.resourceDigests, 'curricularAtomic') === row.reviewInputFingerprint, 'Mismatch actual positive review input fingerprint ' + row.goalId)
}

const normalized = normalizeCanonicalLandscape(after)
const graph = new Map(normalized.goals.map(g => [g.id, g]))
const views: any[] = []
for (const name of ['de-de-gym-seki-biology.view.json', 'de-de-gym-biology-gk.view.json']) {
  const existing = read('curricula/DE/Gymnasium/composition-views/biologie/' + name)
  const current = read(candidate + '/views/' + name)
  const oldRoles = collectCompositionProjectionRoleGoalIds(normalizeCompositionView(existing).rootNodes, graph)
  const newRoles = collectCompositionProjectionRoleGoalIds(normalizeCompositionView(current).rootNodes, graph)
  const lost = [...oldRoles.targetGoalIds].filter(id => !newRoles.targetGoalIds.has(id))
  const added = [...newRoles.targetGoalIds].filter(id => !oldRoles.targetGoalIds.has(id))
  const expected = existing.scope.stage === 'SekI' ? ids.filter(id => id !== point) : ids
  assert(lost.length === 0 && equal([...added].sort(), [...expected].sort()), 'Invalid full target superset ' + name)
  const compiled = compileCompositionView(normalizeCompositionView(current), normalized)
  assert(!compiled.findings.some(f => f.severity === 'error'), 'Native invalid view ' + name)
  assert(existing.scope.stage !== 'SekI' || !newRoles.targetGoalIds.has(point), 'ST entry-phase goal wrongly exposed as SekI')
  const restored = structuredClone(current)
  const destination = existing.scope.stage === 'SekI' ? restored.rootNodes[0].children.find((r: any) => r.id === 'biology-seki') : restored.rootNodes[0]
  assert(destination.children.at(-1).id === 'biology-genetic-information-models', 'Unexpected view insertion location')
  destination.children.pop()
  assert(equal(existing, restored), 'Other existing GUI structure changed')
  views.push({ view: name, originalTargets: oldRoles.targetGoalIds.size, newTargets: newRoles.targetGoalIds.size, lostTargets: lost, addedTargets: added, existingWholeViewExactAfterRemovingOnlyNewBranch: true, nativeCompilationErrors: [], STSekIIOnlyPointGoalExcludedFromSekI: existing.scope.stage === 'SekI' ? true : null, sourceStageReason: existing.scope.stage === 'SekI' ? 'Six new atoms each have an actual SekI direct-source witness; ST common-entry-phase point/genome atom has only SekII target evidence and is excluded.' : 'Existing national view is explicitly cross-stage; all seven have direct reviewed source evidence in its union, including ST common entry phase. No official GK/LK labels inferred.' })
}

const nativeAM = read(candidate + '/qa-artifacts/native-am-checks-and-historical-reuse.actual.json')
const amInput = read(prepared + '/inputs/atomicity-memory-native-review-inputs.pending.json')
const materializations: any[] = []
for (const [lane, baseline] of [['atomicity', amInput.existingFullAtomicity], ['memory', amInput.existingFullMemory]] as const) {
  const oldBytes = bytes(baseline.review.path)
  const newBytes = bytes(candidate + `/full-${lane}.review.jsonl`)
  assert(newBytes.subarray(0, oldBytes.length).equals(oldBytes), 'Historical full review prefix altered ' + lane)
  const newRows = newBytes.subarray(oldBytes.length).toString().trim().split('\n').map((s: string) => JSON.parse(s))
  assert(equal(newRows.map((r: any) => r.goalId), ids), 'Unexpected new review membership ' + lane)
  for (const row of newRows) {
    const actual = lane === 'atomicity' ? sourceReview.goals.find((r: any) => r.goalId === row.goalId) : memoryReview.rows.find((r: any) => r.goalId === row.goalId)
    assert(actual?.verdict === 'KEEP', 'No actual prior individual reviewer decision')
    assert(row.reason === (lane === 'atomicity' ? actual.singleContentRoutineReason : actual.individualCurrentSemanticsReason), 'Individual scientific reason changed ' + row.goalId)
    assert(lane === 'atomicity' ? row.status === 'atomic' && row.semanticAtomic === true : row.status === 'no_memory_needed' && row.memoryUseful === false && row.memoryGoalIds.length === 0 && row.deckIds.length === 0, 'Review verdict changed ' + row.goalId)
  }
  materializations.push({ lane, historicalReviewBytesExact: true, newRowsIndividuallyGrounded: 7, nativeFingerprintsValidatedByUnmodifiedChecker: nativeAM.checks.find((r: any) => r.commandArgv[1].includes(lane === 'atomicity' ? 'semanticAtomicityReview' : 'memoryCardReview')).actualExitCode === 0 })
}
assert(bytes(amInput.existingFullMemory.cards.path).equals(bytes(candidate + '/full-memory.cards.review.jsonl')), 'Old memory cards altered')
const preservation = read(candidate + '/qa-artifacts/native-book-source-and-context-preservation.actual.json')
assert(preservation.actualSourceCount.publishedCurricularAtomicGoals === 390 && preservation.omittedGoals.length === 0, 'Root native source coverage failed')
assert(preservation.old383WholeGoalAndPageRows.length === 383 && preservation.old383WholeGoalAndPageRows.every((r: any) => r.wholeGoalExact && r.pageFingerprintExact && r.goalFingerprintExact), 'Root old full page conservation failed')
const output = { schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'independent B bounded post-D review of actual root candidate deltas; no historical reviews restarted', verdict: 'KEEP', metadataRows, views, materializations, historicalCardsByteExact: true, sevenIndividualMemoryDecisionsRetained: true, sourceAndWholeGoalStageReasonsFromOwnPersonallyReadV7AndV8: true, retainedSourceHolds: ['whole original sources', 'uncovered bullet aspects', 'SH cohort boundaries', 'ST common entry phase versus later technical GK/LK', 'old BY and 3417 whole targets', 'four operative goals outside this seven-atom increment'], rootNativePreservationReceiptInspectedAsTechnicalEvidence: true, nativeSource390: true, old383AndProtected67PreservationRetained: true, allActualInputs: [...actualInputs.values()], activeWrites: false, strictNetGain: 0, humanApproval: false, humanTrial: false, independentPReviewStillPending: true }
writeFileSync(resolve(own, 'targeted-root-integration-deltas.independent-b.review.json'), JSON.stringify(output, null, 2) + '\n')
console.log('Independent B bounded integration KEEP: exactly 8 transient metadata removals, native D/P context unchanged, A/M historical bytes and individual reasons exact, full GUI 168→174 and 436→443 stage-bounded supersets.')
