import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sha256WithoutLearningUnitLayer } from '../../app/scripts/learningUnitLayerProjection.ts'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/k2-table-task-boundary-current-v2'
const dbase = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-11-15/'
const oldIndex = dbase + 'k2-elementary-representations-current-v1/resolution-index.json'
const newIndex = dbase + 'k2-table-task-boundary-current-v2/resolution-index.json'
const goalId = 'f39c49c7-003b-471a-a33e-6cfea1d7b7b1'
const load = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const digest = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const put = (p: string, x: unknown) => writeFileSync(p, JSON.stringify(x, null, 2) + '\n')
const index = load(newIndex)
if (index.batchGoalIds.length !== 1 || index.batchGoalIds[0] !== goalId
  || index.resolutions.length !== 1 || index.resolutions[0].strictDescriptionComplete !== true)
  throw Error('Expected one strict fresh resolution')
const deepPath = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const deep = load(deepPath), subject = deep.subjects.find((s: any) => s.subject === 'mathematik')
if (!subject.resolutionIndexPaths.includes(oldIndex) || subject.resolutionIndexPaths.includes(newIndex))
  throw Error('Unexpected activation state')
const oldDeepDigest = digest(deepPath)
subject.resolutionIndexPaths.push(newIndex)
subject.resolutionSupersessions.push({ goalId, supersededIndexPath: oldIndex, replacementIndexPath: newIndex })
put(deepPath, deep)
const policyPath = 'app/scripts/config/math-duration-split-spanning-tree-policy.json'
const policy = load(policyPath), before = structuredClone(policy)
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
policy.inputs.canonical.sha256 = sha256WithoutLearningUnitLayer(readFileSync(canonicalPath))
if (before.inputs.canonical.sha256 === policy.inputs.canonical.sha256) throw Error('Expected changed current source pin')
const onlyPin = structuredClone(policy)
onlyPin.inputs.canonical.sha256 = before.inputs.canonical.sha256
if (JSON.stringify(onlyPin) !== JSON.stringify(before)) throw Error('Unexpected layout policy change')
put(policyPath, policy)
put(base + '/current-evidence-activation.actual.json', {
  activatedAt: new Date().toISOString(), goalId, oldIndex, newIndex, newIndexDigest: digest(newIndex),
  oldDeepDigest, currentDeepDigest: digest(deepPath), freshIndependentNativeRounds: 2,
  decision: 'keep_current', originalIndicesRetained: true, noHistoricalRecordRebinding: true,
  policyPath, canonicalPath, oldCanonicalInput: before.inputs.canonical, currentCanonicalInput: policy.inputs.canonical,
  allLayoutPolicyFieldsUnchanged: true,
  basis: 'Actual complete current content review, two fresh independent D rounds and native strict resolution; canonical edits are only f39 and Task54 requires, with unchanged Task54 and all other goal prerequisite closures. Layout, placement and view-seed results require the subsequent native generator check.',
  optionalF6Attempt: 'Rejected by native historical P input binding; final active D scope is f39 only. No new f6 P or D approval is claimed.',
})
console.log(JSON.stringify({newIndex, policyPin: policy.inputs.canonical.sha256}))
