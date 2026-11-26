// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintDirectedQuantityArrowContract } from '../../../../../../../../app/scripts/lib/directedQuantityArrows'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../../..')
const directory = 'curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1'
const output = `${directory}/rule/final-k4-v3`
const read = (path: string) => readFileSync(resolve(root, path))
const digest = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const current = JSON.parse(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json').toString('utf8'))
const sourcePaths = [`${output}/source-owner-decision-0641.exact.md`,
  `${directory}/goal-reviews/independent-a.v1.actual.json`, `${directory}/goal-reviews/independent-b.v1.actual.json`]
const rows = ['4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe', 'd61ea362-f6c3-5eab-ac30-2d0e265ac0f6'].map(goalId => {
  const goal = current.goals.find((goal: { id: string }) => goal.id === goalId)
  assert(goal)
  return { goalId, contractFingerprint: fingerprintDirectedQuantityArrowContract(goal), usage: 'required',
    representationKinds: ['spatialQuantityArrow'], basis: 'owner-authorized-exact-bilingual-contract-correction',
    rationale: `${goalId.startsWith('4ca') ? 'The current bilingual contract requires each electric-field contribution to start at the same marked field point, with a shared field-strength scale, followed by graphical addition at that point.' : 'The current bilingual contract requires each velocity arrow to start at the corresponding body position with its own velocity scale and the difference construction to be separate.'} The directed-quantity-arrow requirement was already in the accepted L set and remains unchanged. The owner authorized this description-only correction after the first pair of reviewers identified the same issue. This literal binding claims neither their later final-wording confirmation nor D activation; those are separate current review operations.`,
    currentGoal: goal }
})
const releasePath = `${directory}/k4/v3/release.actual.json`
assert.equal(digest(read(releasePath)), 'sha256:7a16c98d6e914e4ace6e6c7893f5f3fa356413b5f7ddfbe7fb3ca7464b8d999f')
const documents = new Map<string, unknown>([
  [`${output}/contract-corrections.literal-current.actual.json`, { schemaVersion: 1,
    descriptionConfirmationStatus: 'Later confirmations and D activation are not claimed here.',
    sourceBindings: sourcePaths.map(path => ({ path, sha256: digest(read(path)) })), rows }],
  [`${output}/new-semantic-decisions.actual.json`, { schemaVersion: 1,
    decisionAuthority: 'Accepted L arrow-goal cut and actual final K4 V3 two-marker release. No learner results or final description-review activation are claimed.',
    decisions: [
      { goalId: 'b77a7e93-22f9-5722-a4cc-f18a149ab030', semanticKind: 'curricularAtomic', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-structural-split-curricular-atomic' },
      { goalId: '2569d84a-5bf1-542b-bc43-6ade1df971c4', semanticKind: 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-practice-assessment' },
    ] }],
  [`${output}/projection-inputs.actual.json`, { schemaVersion: 1, evidencePath: `${output}/semantic-decisions.actual.json`,
    newDecisionsPath: `${output}/new-semantic-decisions.actual.json`, predecessorEvidencePath: `${directory}/rule/semantic-decisions.actual.json`,
    goalContractOverridesPath: `${output}/contract-corrections.literal-current.actual.json`,
    k4ReleasePath: releasePath, k4ReleaseSha256: digest(read(releasePath)) }],
])
for (const [path, value] of documents) {
  const bytes = `${JSON.stringify(value, null, 2)}\n`
  if (existsSync(resolve(root, path))) assert.equal(read(path).toString('utf8'), bytes, `Immutable preparation evidence changed: ${path}`)
  else writeFileSync(resolve(root, path), bytes)
}
console.log('Final K4 V3 semantic projection inputs prepared; final D confirmations are not implied.')
