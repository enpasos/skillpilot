import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {resolve} from 'node:path'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'

const requireApp = createRequire(resolve('app/package.json'))
const Ajv2020 = requireApp('ajv/dist/2020').default
const addFormats = requireApp('ajv-formats').default
const ajv = new Ajv2020({allErrors: true, strict: true})
addFormats(ajv)
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const input = base + 'wirtschaft-current-P336-V336-qualified-input-and-selective-native-binding-author-v1/'
const latest = base + 'wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/'
const output = base + 'wirtschaft-P336-V336-and-V13-SEM485-independent-root-binding-v1/'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const binding = (p: string) => ({path: p, sha256: hash(p)})
const recordLines = (p: string) => readFileSync(p, 'utf8').trim().split('\n')
const recordMap = (p: string) => new Map<string, any>(recordLines(p).map(line => {const r = JSON.parse(line); return [r.goalId, r]}))
const handoffPath = latest + 'actual-final-V13-two-P-input-and-two-SEM-source-bindings-only.handoff.receipt.json'
const handoff = read(handoffPath)
for (const b of [handoff.frame, handoff.wholeCurrentP336, handoff.wholeCurrentSEM485, handoff.wholeV336ExactRetained, handoff.foreignRequiresScience]) assert.equal(hash(b.path), b.sha256)
const can = read(handoff.frame.path)
const goals = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const ledger = read(handoff.wholeCurrentSEM485.path)
const kinds = new Map<string, any>(ledger.decisions.map((d: any) => [d.goalId, d]))
assert.equal(goals.size, 485)
assert.equal(kinds.size, 485)
const current = recordMap(handoff.wholeCurrentP336.path)
const formerPath = input + 'current-Root-qualified485-v12-SEM485-final-binding-only-v2/whole-P336-qualified-original-content-status-and-current-goal-resource-bindings-only.jsonl'
const former = recordMap(formerPath)
const intakePath = input + 'whole-current-qualified-P336-P685-and-V336.portable-input-index.pre-final-freeze.json'
const intake = read(intakePath)
const priorWhole = new Map<string, any>(intake.wholeSelectedPositiveRows.map((r: any) => [r.goalId, r.wholeRecord]))
const validate = ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const schemaErrors = []
const nativeSemanticErrors = []
const changedFromQualifiedInput = []
const changedFromV12 = []
let cases = 0
for (const [id, record] of current) {
  const goal = goals.get(id)
  assert(goal)
  assert.equal(kinds.get(id).semanticKind, 'curricularAtomic')
  if (!validate(record)) schemaErrors.push({goalId: id, errors: structuredClone(validate.errors)})
  const digests: Record<string, string> = {}
  for (const link of goal.resourceLinks ?? []) {
    if (link.type === 'goal-visualization') digests[link.url] = 'sha256:' + hash('app/public/' + link.url.replace(/^\//, ''))
  }
  nativeSemanticErrors.push(...validatePositiveGoalEvidenceRecordSemantics(record, goal, digests, 'curricularAtomic'))
  assert.equal(record.status, 'needs_human_review')
  assert.equal(record.reviewAuthority, 'ai_candidate')
  assert.equal(record.evidenceLevel, 'E1')
  assert.equal(record.maximumClaimScope, 'G1')
  const old = priorWhole.get(id)
  assert(old)
  const fields = [...new Set([...Object.keys(old), ...Object.keys(record)])].filter(k => JSON.stringify(old[k]) !== JSON.stringify(record[k]))
  assert(fields.every(k => ['goalFingerprint','reviewInputFingerprint'].includes(k)))
  if (fields.length) changedFromQualifiedInput.push({goalId: id, fields})
  const fromV12 = former.get(id)
  const v12fields = [...new Set([...Object.keys(fromV12), ...Object.keys(record)])].filter(k => JSON.stringify(fromV12[k]) !== JSON.stringify(record[k]))
  if (v12fields.length) {
    assert.deepEqual(v12fields, ['reviewInputFingerprint'])
    changedFromV12.push({goalId: id, fields: v12fields, actualFormerNativeRejection: validatePositiveGoalEvidenceRecordSemantics(fromV12, goal, digests, 'curricularAtomic')})
  }
  cases += record.profile.applicationCaseBriefs.length
}
assert.equal(current.size, 336)
assert.equal(cases, 685)
assert.equal(schemaErrors.length, 0)
assert.equal(nativeSemanticErrors.length, 0)
assert.equal(changedFromV12.length, 2)
assert(changedFromV12.every(r => r.actualFormerNativeRejection.some(error => error.includes('stale reviewInputFingerprint'))))
const semanticSourceErrors = ledger.decisions.filter((d: any) => fingerprintSemanticKindSourceGoal(goals.get(d.goalId)) !== d.sourceFingerprint)
assert.equal(semanticSourceErrors.length, 0)
const formerSEMPath = base + 'wirtschaft-current485-qualified-semantic-kinds-root-native-binding-v1/semantic485.current-whole-qualified-kind-bindings.inert.json'
const formerSEM = new Map<string, any>(read(formerSEMPath).decisions.map((d: any) => [d.goalId, d]))
const kindChanges = []
for (const d of ledger.decisions) {
  const old = formerSEM.get(d.goalId)
  const fields = Object.keys(old).filter(k => JSON.stringify(old[k]) !== JSON.stringify(d[k]))
  assert(fields.every(k => k === 'sourceFingerprint'))
  if (fields.length) kindChanges.push({goalId: d.goalId, fields})
}
assert.equal(kindChanges.length, 2)
const qa = read(handoff.wholeV336ExactRetained.path)
const sourceQA = new Map<string, any>(intake.wholeRetainedQAAndActualBytes.map((r: any) => [r.goalId, r.wholeQualifiedQARecord]))
assert.equal(qa.records.length, 336)
const actualVisualBindings = []
for (const r of qa.records) {
  assert.deepEqual(r, sourceQA.get(r.goalId))
  const goal = goals.get(r.goalId)
  assert.equal(r.title, goal.title)
  assert.equal(r.description, goal.description)
  const canonicalHash = hash(r.canonicalAssetPath)
  const publicHash = hash(r.publicAssetPath)
  assert.equal(canonicalHash, r.aiApprovedAssetSha256.replace(/^sha256:/, ''))
  assert.equal(publicHash, r.aiApprovedAssetSha256.replace(/^sha256:/, ''))
  assert.equal(r.aiApproved, 'yes')
  actualVisualBindings.push({goalId: r.goalId, canonicalAssetPath: r.canonicalAssetPath, publicAssetPath: r.publicAssetPath, actualSha256: canonicalHash, originalForeignQAExact: true})
}
const result = {role: 'Independent Root technical reuse and current native bindings only; no scientific P, V or kind rereview', authorHandoff: binding(handoffPath), exactQualifiedIntake: binding(intakePath), frame: handoff.frame, currentPositive: handoff.wholeCurrentP336, currentSemanticKinds: handoff.wholeCurrentSEM485, currentVisualQA: handoff.wholeV336ExactRetained, counts: {profiles: current.size, cases, schemaErrors: schemaErrors.length, nativeSemanticErrors: nativeSemanticErrors.length, currentKindSourceErrors: semanticSourceErrors.length, sameWholeProfilesCasesStatusesAndAllNonBindingFields: 336, V13PInputBindingChanges: changedFromV12.length, V13SEMSourceBindingChanges: kindChanges.length, actualVisualFileHashChecks: actualVisualBindings.length * 2}, changedFromQualifiedInput, changedFromV12, kindChanges, actualVisualBindings, humanApproval: false, newScientificReviews: 0, newStrictClosures: 0, strictNetGain: 0, otherRouteDescriptionAtomicityAndMemoryGatesRemainSeparate: true}
writeFileSync(output + 'actual-independent-P336-P685-V336-and-V13-two-SEM-binding-reuse.native-result.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result.counts))
