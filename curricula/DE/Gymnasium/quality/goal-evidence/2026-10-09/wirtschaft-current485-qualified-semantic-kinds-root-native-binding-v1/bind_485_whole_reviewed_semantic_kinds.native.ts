import {readFileSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
import {normalizeCanonicalLandscape, validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'

const root = process.cwd()
const date = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const out = date + 'wirtschaft-current485-qualified-semantic-kinds-root-native-binding-v1/'
const load = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const binding = (p: string) => ({path: p, sha256: createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')})
const framePath = date + 'wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/whole-CAN485-final-current-full-AM-four-memory-applicability-fields-only.author-successor-v12.json'
const frame = load(framePath)
const basePath = date + 'wirtschaft-nine-reviewed-Q2-materials-root-bounded-assembly-v1/semantic425.nine-actual-independent-practice-decisions-and-one-nav-input.inert.json'
const kinds = load(basePath)
const oldFramePath = date + 'wirtschaft-nine-reviewed-Q2-materials-root-bounded-assembly-v1/whole-CAN425-reviewed-E9-plus-reviewed-Q2-nine-and-one-navigation-candidate.inert.json'
const oldFrame = load(oldFramePath)
const oldGoals = new Map(oldFrame.goals.map((g: {id: string}) => [g.id, g]))
const existing = new Map(kinds.decisions.map((d: {goalId: string}) => [d.goalId, d]))
const provenance = new Map(kinds.decisions.map((d: {goalId: string}) => [d.goalId, binding(basePath)]))
const subsets = [date + 'wirtschaft-four-reviewed-Katalog-materials-root-additive-assembly-v1/actual-native-CAN445-graph-and-reviewed20-practiceAssessment-kinds.result.json', date + 'wirtschaft-eight-reviewed-Source25-materials-and-one-navigation-additive-current475-assembly-v1/nine-exact-foreign-reviewed-practiceAssessment.native-bindings.inert-additive-subset.json']
for (const p of subsets) {
  for (const d of load(p).decisions) {
    assert(!existing.has(d.goalId))
    existing.set(d.goalId, d)
    provenance.set(d.goalId, binding(p))
  }
}
assert.equal(existing.size, 454)
const memoryReview = date + 'wirtschaft-five-SourceMemory-independent-root-technical-delta-v1/actual-final-independent-five-SourceMemory-native-node-deck-origin-and-narrow108-placement-KEEP.receipt.json'
const sourceReview = date + 'wirtschaft-Source30-orientation-GK-roles-applicability-independent-bounded-integration-review-v1/actual-final-original-V10-independent-kernel-subpart-KEEP-and-one-DEBB-country-REVISE.receipt.json'
const sourceMaterials = date + 'wirtschaft-eight-reviewed-Source25-materials-and-one-navigation-additive-current475-assembly-v1/actual-final-current475-plus-eight-reviewed-Source25-materials-one-reviewed-navigation-inert-CAN484.receipt.json'
const sourceAM = readFileSync(resolve(root, date + 'wirtschaft-four-SourceMemory-current-origin-AM-card-and-BE-visibility-technical-binding-v1/memory-source25-only.review.jsonl'), 'utf8').trim().split('\n').map(x => JSON.parse(x))
const sourceIds = new Set(sourceAM.map(x => x.goalId))
assert.equal(sourceIds.size, 25)
const memoryIds = new Set(load(date + 'wirtschaft-five-SourceMemory-independent-root-technical-delta-v1/actual-five-whole-node-origin-card-independent-metadata-KEEP-decisions.json').map((x: {goalId: string}) => x.goalId))
assert.equal(memoryIds.size, 5)
const sourceNav = '9658d512-618c-56ab-aecf-14aaec1005f4'
const decisions = []
const reuse = []
const changes = []
for (const goal of frame.goals) {
  const currentFingerprint = fingerprintSemanticKindSourceGoal(goal)
  const prior = existing.get(goal.id) as {goalId: string; sourceFingerprint: string; semanticKind: string; decisionBasis: string} | undefined
  let decision
  if (prior) {
    if (prior.sourceFingerprint === currentFingerprint) {
      decision = structuredClone(prior)
      reuse.push({goalId: goal.id, semanticKind: prior.semanticKind, wholeDecisionExact: true, original: provenance.get(goal.id)})
    } else {
      decision = {...structuredClone(prior), sourceFingerprint: currentFingerprint}
      changes.push({goalId: goal.id, semanticKind: prior.semanticKind, oldSourceFingerprint: prior.sourceFingerprint, currentSourceFingerprint: currentFingerprint, original: provenance.get(goal.id), formerWholeGoal: oldGoals.get(goal.id) ?? null, currentWholeGoal: goal, boundary: 'Same classification retained. Fingerprints bind actual approved current goal/source/context/assessment deltas; this is no new scientific approval and no D closure.'})
    }
  } else {
    let kind
    let proof
    if (sourceIds.has(goal.id)) {
      assert.equal(goal.type, 'atomic')
      assert.equal((goal.contains ?? []).length, 0)
      assert(!goal.examData && goal.nodeKind !== 'memory' && !goal.tags.includes('memorization'))
      kind = 'curricularAtomic'; proof = binding(sourceMaterials)
    } else if (memoryIds.has(goal.id)) {
      assert.equal(goal.nodeKind, 'memory')
      assert(goal.tags.includes('memorization'))
      kind = 'memory'; proof = binding(memoryReview)
    } else {
      assert.equal(goal.id, sourceNav)
      assert.equal(goal.type, 'cluster')
      kind = 'curricularArea'; proof = binding(sourceReview)
    }
    decision = {goalId: goal.id, sourceFingerprint: currentFingerprint, semanticKind: kind, decisionStatus: 'authoritative', decisionBasis: 'retained-independent-whole-reviewed-current-role-and-native-source-binding'}
    changes.push({goalId: goal.id, semanticKind: kind, currentWholeGoal: goal, proof, newScientificApprovalClaimed: false, ordinaryRoleScientificBoundary: 'Twenty-five previously independently examined whole ordinary contracts and scientific atomicity judgments are retained; memory and content/navigation classifications remain distinct.'})
  }
  decisions.push(decision)
}
assert.equal(decisions.length, 485)
const counts: Record<string, number> = {curricularAtomic: 0, practiceAssessment: 0, curricularArea: 0, orientation: 0, programStructure: 0, runtimeSupport: 0, memory: 0, total: decisions.length}
for (const d of decisions) counts[d.semanticKind]++
assert.deepEqual(counts, {curricularAtomic: 336, practiceAssessment: 104, curricularArea: 32, orientation: 1, programStructure: 1, runtimeSupport: 1, memory: 10, total: 485})
const graphErrors = validateCanonicalLandscape(normalizeCanonicalLandscape(frame)).filter(x => x.severity === 'error')
assert.equal(graphErrors.length, 0)
const payload = {...structuredClone(kinds), ledgerId: 'wirtschaft-current485-qualified-native-kind-successor-20261009-v1', reviewMethod: 'Retain exact valid independent kind decisions and actual whole independent role judgments; current fingerprints are technical bindings only. Historical science, separate two-round description gates and human release remain distinct.', counts, decisions: decisions.sort((a, b) => a.goalId.localeCompare(b.goalId))}
writeFileSync(resolve(root, out + 'semantic485.current-whole-qualified-kind-bindings.inert.json'), JSON.stringify(payload, null, 2) + '\n')
writeFileSync(resolve(root, out + 'actual-native-485-individual-kind-reuse-and-current-binding-deltas.json'), JSON.stringify({frame: binding(framePath), exactPriorKindInputs: [binding(basePath), ...subsets.map(binding)], retainedIndependentRoleProofs: [binding(memoryReview), binding(sourceReview), binding(sourceMaterials)], nativeFingerprintImplementation: binding('app/scripts/goalBookModel.ts'), counts, exactWholeDecisionReuse: reuse, actualCurrentBindingDeltas: changes, actualNativeGraphErrors: graphErrors, twoRoundDescriptionClosureClaimed: false, source125CountryCourseApprovalClaimed: false, protectedMathPhysicsChanges: 0, newStrictClosures: 0, strictNetGain: 0, humanApproval: false}, null, 2) + '\n')
console.log(JSON.stringify({currentWholeGoalKinds: decisions.length, counts, exactWholePriorDecisions: reuse.length, currentBindingsChangedOrAdded: changes.length, nativeGraphErrors: graphErrors.length, newStrictClosures: 0, strictNetGain: 0}))
