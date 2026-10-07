import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../app/scripts/goalBookModel'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own = dirname(fileURLToPath(import.meta.url))
const root = '/home/enpasos/projects/skillpilot'
const relative = own.slice(root.length + 1)
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const save = (name: string, value: unknown) => writeFileSync(resolve(own, name), `${JSON.stringify(value, null, 2)}\n`)
const sha = (data: Buffer | string) => `sha256:${createHash('sha256').update(data).digest('hex')}`
const originalLedger = load(resolve(root, 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'))
const baseline = load(resolve(own, 'current472.actual-baseline.snapshot.json'))
const candidate = load(resolve(own, 'current472-three-models-only.canonical.author-candidate.json'))
const config = load(resolve(own, 'positive-evidence.three-models.native.config.json'))
const ids: string[] = config.scope.goalIds
const goals = new Map<string, any>(candidate.goals.map((g: any) => [g.id, g]))
const oldGoals = new Map<string, any>(baseline.goals.map((g: any) => [g.id, g]))
const ledger = structuredClone(originalLedger)
ledger.sourceLandscapePath = `${relative}/current472-three-models-only.canonical.author-candidate.json`
const changes: any[] = []
for (let index = 0; index < ledger.decisions.length; index++) {
  const decision = ledger.decisions[index]
  const fp = fingerprintSemanticKindSourceGoal(goals.get(decision.goalId))
  if (ids.includes(decision.goalId)) {
    const previous = decision.sourceFingerprint
    decision.sourceFingerprint = fp
    changes.push({ goalId: decision.goalId, before: previous, after: fp })
  } else {
    assert.deepEqual(decision, originalLedger.decisions[index])
    assert.equal(fp, decision.sourceFingerprint)
  }
  for (const key of ['semanticKind', 'decisionStatus', 'decisionBasis']) {
    assert.deepEqual(decision[key], originalLedger.decisions[index][key])
  }
}
assert.equal(ledger.decisions.length, 472)
assert.deepEqual(ledger.counts, originalLedger.counts)
assert.equal(changes.length, 3)
save('semantic-kinds.current472.three-model-binding.author-candidate.json', ledger)
save('semantic-kind-source-only-technical-binding.author.json', {
  role: 'author technical preparation, not a new semantic-kind or atomicity scientific decision',
  sourceLandscapePathChanged: true,
  changedSourceFingerprintDecisions: changes,
  remaining469WholeDecisionsExact: true,
  all472ClassificationsStatusAndBasisExact: true,
  allCountsExact: true,
})

const materials = load(resolve(own, 'six-complete-DEEN-reference-materials.author-candidates.json'))
const profiles = load(resolve(own, 'positive-evidence.three-models.author-candidates.json'))
assert.equal(materials.cases.length, 6)
assert.deepEqual(profiles.goals.map((g: any) => g.goalId), ids)
const criteriaBytes = readFileSync(resolve(root, config.reviewCriteriaPath))
const criteria = sha(criteriaBytes)
const fpDeltas = profiles.goals.map((p: any) => ({
  goalId: p.goalId,
  currentGoalFingerprint: fingerprintGoalForPositiveEvidence(oldGoals.get(p.goalId), 'curricularAtomic'),
  candidateGoalFingerprint: fingerprintGoalForPositiveEvidence(goals.get(p.goalId), 'curricularAtomic'),
  currentReviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(oldGoals.get(p.goalId), criteria, {}, 'curricularAtomic'),
  candidateReviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goals.get(p.goalId), criteria, {}, 'curricularAtomic'),
  candidateProfileFingerprint: fingerprintPositiveGoalEvidenceProfile(p.profile),
}))

const round = (x: number) => Math.round(x * 100000) / 100000
const c = (index: number) => materials.cases[index].structuredSuppliedData
let weights = structuredClone(c(0).initialWeights)
const hebbRounds = c(0).rounds.map((r: any) => {
  weights = { A: round(weights.A + c(0).eta * r.xA * r.y), B: round(weights.B + c(0).eta * r.xB * r.y) }
  return weights
})
assert.deepEqual(hebbRounds, [{ A: 0.4, B: 0.2 }, { A: 0.4, B: 0.2 }, { A: 0.5, B: 0.3 }])
const uncapped = []; const capped = []
let wu = structuredClone(c(1).initialWeights); let wk = structuredClone(wu)
for (const r of c(1).rounds) {
  wu = { A: round(wu.A + c(1).eta * r.xA * r.y), B: round(wu.B + c(1).eta * r.xB * r.y) }
  wk = { A: round(Math.min(c(1).suppliedAlternativeUpperBound, wk.A + c(1).eta * r.xA * r.y)), B: round(Math.min(c(1).suppliedAlternativeUpperBound, wk.B + c(1).eta * r.xB * r.y)) }
  uncapped.push(wu); capped.push(wk)
}
assert.deepEqual(uncapped, [{ A: 1, B: 0.2 }, { A: 1.2, B: 0.2 }])
assert.deepEqual(capped, [{ A: 1, B: 0.2 }, { A: 1, B: 0.2 }])
const network = c(2).identicalInputsBeforeAfter.map(([a, b]: number[]) => {
  const before = c(2).baselineMv + c(2).beforeWeightsMv.A * a + c(2).beforeWeightsMv.B * b
  const after = c(2).baselineMv + c(2).afterWeightsMv.A * a + c(2).afterWeightsMv.B * b
  return { input: [a, b], beforeMv: before, beforeOutput: before >= c(2).outputThresholdMv, afterMv: after, afterOutput: after >= c(2).outputThresholdMv }
})
assert.deepEqual(network.map((r: any) => [r.beforeMv, r.afterMv, r.beforeOutput, r.afterOutput]), [[-64, -54, false, true], [-60, -60, false, false], [-54, -44, true, true]])
const inhibition = ['statePWeightsMv', 'stateQWeightsMv'].map((key) => {
  const u = c(3).baselineMv + c(3)[key].A * c(3).sameInput.A + c(3)[key].I * c(3).sameInput.I
  return { state: key, mv: u, output: u >= c(3).outputThresholdMv }
})
assert.deepEqual(inhibition.map((r: any) => [r.mv, r.output]), [[-55, true], [-60, false]])
const percentages = c(4).pathT.map((value: number) => round(100 * value / c(4).pathT[0]))
assert.deepEqual(percentages, [100, 160, 155, 160])
assert.equal(c(5).pathD.at(-1) / c(5).pathD[0], 0.5)
assert.equal(c(5).pathR.at(-1), c(5).pathR[0])
assert.equal(c(5).testChangedForS, true)
save('actual-native-fingerprints-and-material-arithmetic.author-probe.json', {
  authorCheckOnly: true, productionFingerprintFunctionsUnchanged: true,
  goalCount: 472, threeBoundCurrentAndCandidateFingerprints: fpDeltas,
  actualArithmetic: { hebbRounds, uncapped, capped, network, inhibition, percentages },
  datasetClassificationConditionsAreSuppliedNotMeasured: true,
  independentScientificReview: false, humanEvidence: false,
})
console.log(JSON.stringify({ stage: relative, same472Ids: true, same472Classifications: true, changedKindSourceFingerprints: 3, sixCaseArithmeticAndConditions: 'PASS', scienceApproval: false }))
