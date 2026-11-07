// SPDX-License-Identifier: Apache-2.0
// Bounded replay of the existing D consumer. This does not run the whole
// subject report, activate its registry, or infer a new scope/projection.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  validateResolutionIndex,
  type DeepUnderstandingSubjectConfig,
} from '../../../../app/scripts/reportDeepUnderstandingRollout.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../app/scripts/goalBookModel.ts'

const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
assert.equal(createHash('sha256').update(readFileSync(sourcePath)).digest('hex'),
  '967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318')
const raw = load(sourcePath)
const ledger = load('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')
const config = load('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
  .subjects.find((entry: DeepUnderstandingSubjectConfig) => entry.subject === 'mathematik') as DeepUnderstandingSubjectConfig
const rawGoalById = new Map<string, Record<string, unknown>>(raw.goals.map((goal: Record<string, unknown>) => [goal.id, goal]))
assert.equal(rawGoalById.size, raw.goals.length)
assert.equal(ledger.decisions.length, raw.goals.length)
const allDecisionIds = new Set<string>()
const atomicGoalIds = new Set<string>()
for (const decision of ledger.decisions) {
  assert(!allDecisionIds.has(decision.goalId))
  allDecisionIds.add(decision.goalId)
  const goal = rawGoalById.get(decision.goalId)
  assert(goal)
  assert.equal(decision.decisionStatus, 'authoritative')
  assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(goal))
  if (decision.semanticKind === 'curricularAtomic') atomicGoalIds.add(decision.goalId)
}
assert.equal(atomicGoalIds.size, 807)
type Scope = Parameters<typeof validateResolutionIndex>[2]
const scope: Scope = {
  rawLandscape: raw,
  landscape: raw,
  rawGoalById,
  goalById: new Map(raw.goals.map((goal: Scope['landscape']['goals'][number]) => [goal.id, goal])),
  atomicGoalIds,
  denominator: atomicGoalIds.size,
  issues: [],
}
const prefix = 'qa-artifacts/ci-contract-audit/2026-11-06/'
const paths = [
  prefix + 'math-three-description-input-2026-11-06/packet/resolution-index.json',
  prefix + 'math-single-description-input-2026-11-06/packet/resolution-index.json',
]
const ready = new Set<string>()
const checks = []
for (const path of paths) {
  const result = await validateResolutionIndex(path, config, scope)
  assert.deepEqual(result.issues, [])
  for (const id of result.ready) {
    assert(!ready.has(id), `Duplicate current D ownership: ${id}`)
    ready.add(id)
  }
  checks.push({ path, readyGoalIds: [...result.ready], issues: result.issues })
}
assert.deepEqual([...ready].sort(), [
  '0c2ddfcd-1399-41ad-aaed-4f061812602a',
  'ce198bc9-b014-52ba-814f-25cc3e020668',
  'd07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe',
].sort())
console.log(JSON.stringify({
  status: 'three-current-D-resolutions-native-consumer-valid-unapplied',
  nativeConsumer: 'validateResolutionIndex',
  sourceSha256: '967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318',
  actualKindSourceFingerprintsChecked: allDecisionIds.size,
  actualCurricularAtomicDenominator: atomicGoalIds.size,
  checks,
  unionCurrentGoalIds: [...ready].sort(),
  wholeSubjectDeepOrMaturityPassClaimed: false,
}, null, 2))
