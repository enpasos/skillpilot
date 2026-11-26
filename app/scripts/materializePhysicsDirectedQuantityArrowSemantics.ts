// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import type { LearningGoal } from '../src/landscapeTypes'
import { fingerprintSemanticKindSourceGoal, parseSemanticKindLedger } from './goalBookModel'
import { loadOptionalHistoricalReviewContext } from './optionalHistoricalReviewContext'
import { fingerprintDirectedQuantityArrowContract, validateDirectedQuantityArrowEvidence,
  type ArrowRepresentationKind, type DirectedQuantityArrowEvidenceRow, PHYSICS_ARROW_GOAL_ID } from './lib/directedQuantityArrows'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const directory = 'curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1'
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const landscapePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const read = (path: string) => readFileSync(resolve(root, path))
const json = (path: string) => JSON.parse(read(path).toString('utf8'))
const digest = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const pretty = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
interface SuccessorConfiguration {
  schemaVersion: 1
  evidencePath: string
  newDecisionsPath: string
  predecessorEvidencePath: string
  goalContractOverridesPath: string
  k4ReleasePath: string
  k4ReleaseSha256: string
}
const configurationArgument = process.argv.slice(2).find(arg => arg.startsWith('--configuration='))
assert(process.argv.slice(2).every(arg => arg === '--check' || arg === configurationArgument), 'Only --check and --configuration=<path> are supported')
const configurationPath = configurationArgument?.slice('--configuration='.length)
const configuration = configurationPath ? json(configurationPath) as SuccessorConfiguration : undefined
if (configuration) {
  assert.equal(configuration.schemaVersion, 1)
  for (const path of [configurationPath!, configuration.evidencePath, configuration.newDecisionsPath,
    configuration.predecessorEvidencePath, configuration.goalContractOverridesPath, configuration.k4ReleasePath]) {
    assert(path.startsWith(`${directory}/`) && !path.includes('..'), 'Successor paths must stay in this delivery dossier')
  }
  assert.notEqual(configuration.evidencePath, configuration.predecessorEvidencePath, 'A successor must never overwrite its predecessor evidence')
}
const evidencePath = configuration?.evidencePath ?? `${directory}/rule/semantic-decisions.actual.json`
const newDecisionsPath = configuration?.newDecisionsPath ?? `${directory}/rule/new-semantic-decisions.actual.json`
type Goal = Record<string, unknown> & { id: string; type?: string; contains?: string[] }
const current = json(landscapePath) as { landscapeId: string; goals: Goal[] }
const ledger = json(ledgerPath)
const old = JSON.parse(gunzipSync(read(`${directory}/rule/source-l/catalog.exact.json.gz`)).toString('utf8')) as { goals: Goal[] }
const before = JSON.parse(gunzipSync(read(`${directory}/rule/source-before-a2/catalog.exact.json.gz`)).toString('utf8')) as { goals: Goal[] }
const oldById = new Map(old.goals.map(goal => [goal.id, goal]))
const beforeById = new Map(before.goals.map(goal => [goal.id, goal]))
const goalInventoryPath = `${directory}/rule/source-l/raw/reviewer-b/goal-inventory.json`
const assessmentInventoryPath = `${directory}/rule/source-l/raw/reviewer-b/assessment-inventory.json`
const ownerDecisionsPath = `${directory}/rule/source-l/raw/graph/owner-decisions.actual.json`
const goalInventory = json(goalInventoryPath) as { closed: boolean; items: Array<{ goalId: string; classification: string[]; reviewerDisposition: string }> }
const assessmentInventory = json(assessmentInventoryPath) as { closed: boolean; items: Array<{ goalId: string; arrowDemand: string; reviewerDisposition: string }> }
const ownerDecisions = json(ownerDecisionsPath) as { assessmentAuditClosed: boolean; rows: Array<{ goalId: string; todayExplicitQuantityArrowGoal: boolean; decisionRationale: string }> }
assert(goalInventory.closed && assessmentInventory.closed && ownerDecisions.assessmentAuditClosed)
assert.equal(goalInventory.items.length, 737)
assert.equal(assessmentInventory.items.length, 235)
const goalReviewById = new Map(goalInventory.items.map(row => [row.goalId, row]))
const assessmentReviewById = new Map(assessmentInventory.items.map(row => [row.goalId, row]))
const ownerReviewById = new Map(ownerDecisions.rows.map(row => [row.goalId, row]))
const required = new Set([...ownerDecisions.rows.filter(row => row.todayExplicitQuantityArrowGoal).map(row => row.goalId),
  ...assessmentInventory.items.filter(row => row.arrowDemand === 'required').map(row => row.goalId)])
assert.equal(required.size, 24)
const K4 = '2569d84a-5bf1-542b-bc43-6ade1df971c4'
required.add(PHYSICS_ARROW_GOAL_ID)
const hasReleasedK4 = current.goals.some(goal => goal.id === K4)
if (hasReleasedK4) required.add(K4)
const k4ReleasePath = configuration?.k4ReleasePath ?? `${directory}/k4/release.actual.json`
const successorSourcePaths: string[] = []
let overrides: { sourceBindings: Array<{ path: string; sha256: string }>; rows: DirectedQuantityArrowEvidenceRow[] } | undefined
if (configuration) {
  overrides = json(configuration.goalContractOverridesPath)
  assert(Array.isArray(overrides?.rows) && Array.isArray(overrides.sourceBindings))
  for (const binding of overrides.sourceBindings) {
    assert(binding.path.startsWith(`${directory}/`) && !binding.path.includes('..'))
    assert.equal(digest(read(binding.path)), binding.sha256, 'Changed individual contract-correction source')
    successorSourcePaths.push(binding.path)
  }
  if (hasReleasedK4) {
    assert.equal(digest(read(k4ReleasePath)), configuration.k4ReleaseSha256, 'Changed K4 release evidence')
    const release = json(k4ReleasePath)
    assert.equal(release.contract, 'physics-a2-k4-final-two-round-marking-activation-v1')
    assert.equal(release.decision, 'accept_exact_bilingual_task_and_scoring')
    assert.equal(release.expertResponses.length, 2)
    for (const binding of [release.candidate, release.release, ...release.expertResponses, release.authorForComparison]) {
      assert.equal(digest(read(binding.path)), `sha256:${binding.sha256}`, 'Changed K4 release input')
      successorSourcePaths.push(binding.path)
    }
    const canonicalK4 = current.goals.find(goal => goal.id === K4)!
    const releasedK4 = json(release.release.path)
    assert.equal(fingerprintSemanticKindSourceGoal(canonicalK4), fingerprintSemanticKindSourceGoal(releasedK4), 'K4 native contract differs from the actual released object')
    assert.equal(fingerprintDirectedQuantityArrowContract(canonicalK4), fingerprintDirectedQuantityArrowContract(releasedK4), 'K4 arrow contract differs from the actual released object')
  }
}
const nGoals = new Set(['2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b', 'e0085acf-af64-5c73-8abf-85a5bbfbdaa6'])
const nRationale = 'Current accepted N contract read in both languages: the factor one half is justified with a labelled time-speed graph or an unambiguous equivalent description. The graph axes and triangle area are not a body-/point-based quantity arrow. K3 requires derivation, the graph/area and speed-squared reasoning, with no force-arrow drawing. The illustrative force arrow in the goal image does not make it a teaching prerequisite.'
const rows: DirectedQuantityArrowEvidenceRow[] = current.goals.map(goal => {
  if (goal.type === 'cluster' || goal.contains?.length) return { goalId: goal.id,
    contractFingerprint: fingerprintDirectedQuantityArrowContract(goal), usage: 'children', representationKinds: ['containedGoals'],
    basis: 'current-explicit-structural-node', rationale: 'This cluster groups the individually judged child goals. Grouping and its illustration establish no additional prerequisite or teaching performance; the route criterion applies at the children.' }
  const previous = oldById.get(goal.id)
  const usage = required.has(goal.id) ? 'required' : 'notRequired'
  const override = overrides?.rows.find(row => row.goalId === goal.id)
  if (override) {
    assert(['4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe', 'd61ea362-f6c3-5eab-ac30-2d0e265ac0f6'].includes(goal.id), 'Unapproved contract-correction scope')
    assert.equal(override.contractFingerprint, fingerprintDirectedQuantityArrowContract(goal), 'Current corrected wording differs from its literal individual binding')
    assert.equal(override.usage, usage, 'A wording correction must not change the accepted usage marker')
    assert.deepEqual(override.representationKinds, ['spatialQuantityArrow'])
    return override
  }
  if (previous) assert.equal(fingerprintDirectedQuantityArrowContract(goal), fingerprintDirectedQuantityArrowContract(previous), `${goal.id}: changed material contract requires a new individual decision`)
  let basis: string
  let rationale: string
  let kinds: ArrowRepresentationKind[] = usage === 'required' ? ['spatialQuantityArrow'] : ['otherRepresentation']
  if (goal.id === PHYSICS_ARROW_GOAL_ID) {
    basis = 'accepted-L-goal-cut-and-current-author-binding'
    rationale = 'The accepted early goal explicitly requires reading and drawing a directed quantity at its carrier, direction and own magnitude scale, and explaining the tip when the arrow scale changes between two drawings. It is the route anchor itself; its only prerequisite is Physics orientation.'
  } else if (goal.id === K4) {
    basis = 'current-K4-task-and-independent-marking-release'
    rationale = 'K4 explicitly assesses reference point, direction, magnitude with unit and own arrow scale, and the tip meaning under a scale change. Each is a protected carrying performance in the independently marked released task.'
  } else if (nGoals.has(goal.id)) {
    assert(beforeById.has(goal.id))
    assert.equal(fingerprintDirectedQuantityArrowContract(goal), fingerprintDirectedQuantityArrowContract(beforeById.get(goal.id)), `${goal.id}: N successor contract changed`)
    basis = 'accepted-N-current-contract-and-K3-reading'
    rationale = nRationale
  } else {
    const reviewed = goalReviewById.get(goal.id)
    assert(reviewed, `${goal.id}: no closed individual L text reading`)
    const task = assessmentReviewById.get(goal.id)
    const owner = ownerReviewById.get(goal.id)
    basis = task ? 'L-individual-bilingual-assessment-contract' : owner ? 'L-individual-goal-owner-adjudication' : 'L-individual-goal-contract'
    rationale = owner?.decisionRationale ?? task?.reviewerDisposition ?? reviewed.reviewerDisposition
    if (task) rationale += ` Assessment arrow demand: ${task.arrowDemand}. This decision is attached to this assessment, not copied to all its curricular owners.`
    if (usage === 'notRequired') {
      const classified = reviewed.classification.join(' + ').toLowerCase()
      kinds = classified === 'none' ? ['none'] : /field.?line/u.test(classified) ? ['fieldLineConvention']
        : /circuit/u.test(classified) ? ['circuitReference'] : /phasor/u.test(classified) ? ['phasor']
          : /displacement/u.test(classified) ? ['displacementArrow'] : /formula.vector/u.test(classified) ? ['formulaVector'] : ['otherRepresentation']
      rationale += ' No required spatial quantity-arrow performance is inferred from a linked image, vector symbol or an optional drawing. Adding such a performance changes the bound material contract and requires a successor judgement.'
    }
  }
  return { goalId: goal.id, contractFingerprint: fingerprintDirectedQuantityArrowContract(goal), usage,
    representationKinds: kinds, basis, rationale }
})
assert.equal(rows.filter(row => row.usage === 'required').length, hasReleasedK4 ? 26 : 25)
const sourcePaths = [goalInventoryPath, assessmentInventoryPath, ownerDecisionsPath,
  `${directory}/rule/source-l/catalog.exact.json.gz`, `${directory}/rule/source-l/review.md`,
  `${directory}/rule/source-l/reviewer-a.md`, `${directory}/rule/source-l/reviewer-b.md`,
  `${directory}/rule/source-l/independent-review.actual.json`, `${directory}/rule/source-l/raw/reviewer-b/review-method.actual.json`,
  `${directory}/rule/source-before-a2/catalog.exact.json.gz`, newDecisionsPath,
  'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/goal-reviews/informed-current-review.actual.json',
  'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/k3/release.actual.json',
  ...(hasReleasedK4 ? [k4ReleasePath] : []),
  ...(configuration ? [configurationPath!, configuration.predecessorEvidencePath, configuration.goalContractOverridesPath, ...successorSourcePaths] : [])]
const evidence = { schemaVersion: 1, documentType: 'directed-quantity-arrow-decisions',
  ...(configuration ? { supersedes: { path: configuration.predecessorEvidencePath, sha256: digest(read(configuration.predecessorEvidencePath)) },
    currentDescriptionReviewStatus: 'Owner-authorized exact bilingual corrections of 4ca83b3f and d61ea362 are bound here. This usage judgement is not a final D successor-review activation.' } : {}),
  deliveryStage: hasReleasedK4 ? 'arrow-goal-and-released-K4' : 'intermediate-arrow-goal-only-K4-not-yet-present-or-approved',
  method: 'Individual adoption of the complete closed L goal/task reading, using its accepted narrow owner/task decisions. Text/material fingerprints exclude requires and image links; current evidence may not infer teaching from image pixels. Structural nodes are checked at their individually classified children. New N and A2 contracts have their own explicitly identified current evidence; this projection is not a new blind subject review.',
  sourceBindings: sourcePaths.map(path => ({ path, sha256: digest(read(path)) })), rows }
const evidenceBytes = pretty(evidence)
const newDecisions = json(newDecisionsPath) as { decisions: Array<Record<string, unknown> & { goalId: string }> }
const decisions = new Map(ledger.decisions.map((row: Record<string, unknown> & { goalId: string }) => [row.goalId, row])) as Map<string, Record<string, unknown> & { goalId: string }>
for (const decision of newDecisions.decisions) {
  assert(!beforeById.has(decision.goalId), `${decision.goalId}: this delivery does not reclassify an existing goal`)
  decisions.set(decision.goalId, { ...decision })
}
const changedNativeFingerprintGoalIds: string[] = []
ledger.$schema = 'https://skillpilot.com/schemas/curriculum-package/v2/curriculum-semantic-kind-ledger.schema.json'
ledger.ledgerFormatVersion = 2
ledger.decisions = current.goals.map(goal => {
  const row = decisions.get(goal.id)
  assert(row, `${goal.id}: missing independently classified native semantic-kind decision`)
  const previous = beforeById.get(goal.id)
  if (!previous || fingerprintSemanticKindSourceGoal(previous) !== fingerprintSemanticKindSourceGoal(goal)) {
    row.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
    changedNativeFingerprintGoalIds.push(goal.id)
  }
  const use = rows.find(item => item.goalId === goal.id)!
  row.directedQuantityArrows = { usage: use.usage, representationKinds: use.representationKinds,
    evidence: { path: evidencePath, sha256: digest(evidenceBytes), entryId: goal.id } }
  return row
})
ledger.counts = Object.fromEntries(Object.keys(ledger.counts).map(kind => [kind,
  kind === 'total' ? ledger.decisions.length : ledger.decisions.filter((row: { semanticKind: string }) => row.semanticKind === kind).length]))
const historicalReview = await loadOptionalHistoricalReviewContext({ repositoryRoot: root })
const parsed = parseSemanticKindLedger(ledger, current, current.landscapeId, landscapePath, historicalReview.context)
validateDirectedQuantityArrowEvidence(current.goals as unknown as LearningGoal[], parsed.directedQuantityArrowsByGoalId,
  path => path === evidencePath ? Buffer.from(evidenceBytes) : read(path))
for (const [path, contents] of new Map([[evidencePath, evidenceBytes], [ledgerPath, pretty(ledger)]])) {
  if (process.argv.includes('--check')) assert.equal(read(path).toString('utf8'), contents, `Stale arrow semantic projection: ${path}`)
  else if (path !== ledgerPath && existsSync(resolve(root, path))) assert.equal(read(path).toString('utf8'), contents,
    `Historical semantic evidence is immutable; select a fresh successor path: ${path}`)
  else writeFileSync(resolve(root, path), contents)
}
console.log(JSON.stringify({ semanticDecisions: rows.length, required: hasReleasedK4 ? 26 : 25,
  clusterChildren: rows.filter(row => row.usage === 'children').length,
  notRequired: rows.filter(row => row.usage === 'notRequired').length, changedNativeFingerprintGoalIds }))
