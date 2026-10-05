// SPDX-License-Identifier: Apache-2.0
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const directory = dirname(fileURLToPath(import.meta.url))
const root = resolve(directory, '../../../../../../..')
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const local = (path: string) => resolve(root, path)
const own = (name: string) => resolve(directory, name)
const hash = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const canonical = await read(local('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))
const oldDelta = await read(local('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-preservation-candidate-v2/canonical.delta.candidates.json'))
const delta = await read(own('canonical.delta.candidates.json'))
const sourceDelta = await read(own('source-extraction.delta.candidates.json'))
const mappingDelta = await read(own('mapping.delta.candidates.json'))
const retirement = await read(own('source-retirement.manifest.candidate.json'))
const viewDelta = await read(own('view-source-preservation.delta.candidates.json'))
const p = await read(own('positive-evidence.candidates.json'))
const snap = await read(own('current-bindings.snapshot.json'))
const errors: string[] = []
const assert = (condition: boolean, message: string) => { if (!condition) errors.push(message) }
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const overlay = new Map<string, any>(canonical.goals.map((g: any) => [g.id, structuredClone(g)]))
for (const stage of [oldDelta, delta]) {
  for (const goal of stage.newGoals) {
    assert(!overlay.has(goal.id), `Duplicate new goal ID ${goal.id}`)
    overlay.set(goal.id, goal)
  }
  for (const change of stage.currentGoalDeltas) {
    const actual = overlay.get(change.goalId)
    for (const [key, before] of Object.entries(change.before)) assert(same(actual[key], before), `${change.goalId}: stale before ${key}`)
    overlay.set(change.goalId, { ...actual, ...change.after })
  }
  for (const change of stage.parentContainsDeltas) {
    const actual = overlay.get(change.goalId)
    const before = change.beforeAfterPriorNICandidate ?? change.before
    assert(same(actual.contains, before), `${change.goalId}: stale parent overlay before`)
    overlay.set(change.goalId, { ...actual, contains: change.after })
  }
}
for (const relation of ['contains', 'requires']) {
  const visited = new Set<string>(), visiting = new Set<string>()
  const visit = (id: string) => {
    if (!overlay.has(id)) { errors.push(`${relation}: missing goal ${id}`); return }
    if (visiting.has(id)) { errors.push(`${relation}: cycle ${id}`); return }
    if (visited.has(id)) return
    visiting.add(id)
    for (const target of overlay.get(id)[relation] ?? []) visit(target)
    visiting.delete(id); visited.add(id)
  }
  for (const id of overlay.keys()) visit(id)
}
const atomIds = new Set<string>([...overlay.values()].filter((g: any) => g.type === 'atomic' && !g.contains?.length).map((g: any) => g.id))
const rootGoal = canonical.goals.find((g: any) => g.tags?.includes('root'))
const inherited = sourceAtlasDescendants(rootGoal.id, overlay, atomIds, canonical.landscapeId)
const newGoal = delta.newGoals[0]
assert(!inherited.includes(newGoal.id), 'Broad ancestor source mapping inherits into the new NI-only atom')
assert(same(sourceAtlasDescendants(newGoal.id, overlay, atomIds, canonical.landscapeId), [newGoal.id]), 'Direct source mapping does not reach the new atom')
assert(same(overlay.get(snap.preservedExistingMitosisGoal.id), snap.preservedExistingMitosisGoal), 'Existing1d valid mitosis/meiosis content changed')
const prerequisiteReach = new Set<string>()
const walkPrereqs = (id: string) => {
  for (const target of overlay.get(id)?.requires ?? []) if (!prerequisiteReach.has(target)) { prerequisiteReach.add(target); walkPrereqs(target) }
}
walkPrereqs(newGoal.id)
for (const id of ['e70d8a85-2dea-5165-919b-200fee9f4db4', '0daa79f6-8f61-5506-98f9-65db83062ba8', '1d2b1038-dcd5-529a-b085-9e14f1d58c76']) {
  assert(!prerequisiteReach.has(id), `Unsupported DNA/full-meiosis prerequisite ${id}`)
}

const source = await read(local(sourceDelta.beforePath))
const sourceById = new Map<string, any>(source.sourceGoals.map((g: any) => [g.id, structuredClone(g)]))
assert(hash(await readFile(local(sourceDelta.beforePath))) === sourceDelta.beforeSha256, 'Current source extraction bytes changed')
for (const change of sourceDelta.sourceGoalDeltas) {
  assert(same(sourceById.get(change.sourceGoalId), change.before), `${change.sourceGoalId}: stale source before`)
  sourceById.set(change.sourceGoalId, change.after)
}
for (const change of sourceDelta.retiredSourceGoalDeltas) {
  assert(same(sourceById.get(change.sourceGoalId), change.before), `${change.sourceGoalId}: stale retired source before`)
  assert(change.after === null, `${change.sourceGoalId}: retirement after must be null`)
  sourceById.delete(change.sourceGoalId)
}
assert(sourceById.size === 123, 'Source retirement count must be124→123')
assert(!sourceById.has(retirement.sourceGoalId), 'Retired source atom remains active in overlay')
const fw004 = sourceById.get('ni-biology-seki-kc2015-fw6-004-f11cdf34')
assert(fw004.sourceText === 'begründen die Erbgleichheit von Körperzellen eines Vielzellers mit der Mitose.', 'FW6-004 source quote is not the actual printed word Erbgleichheit')
assert(fw004.metadata.sourcePage === 87 && fw004.metadata.grades === '9/10', 'FW6-004 locator/grade mismatch')
const passageIds = new Set(source.passages.map((item: any) => item.id))
for (const goal of sourceById.values()) assert(passageIds.has(goal.passageId), `Unknown source passage ${goal.id}`)

const mapping = await read(local(mappingDelta.beforePath))
assert(hash(await readFile(local(mappingDelta.beforePath))) === mappingDelta.beforeSha256, 'Current mapping bytes changed')
const rows = mapping.mappings.filter((r: any) => !mappingDelta.sourceGoalDeltas.some((d: any) => d.sourceGoalId === r.legacyGoalId))
const decisions = new Map<string, any>(mapping.decisions.map((d: any) => [d.sourceGoalId, structuredClone(d)]))
for (const change of mappingDelta.sourceGoalDeltas) {
  assert(same(mapping.mappings.filter((r: any) => r.legacyGoalId === change.sourceGoalId), change.beforeRows), `${change.sourceGoalId}: stale before mapping rows`)
  assert(same(decisions.get(change.sourceGoalId), change.beforeDecision), `${change.sourceGoalId}: stale before mapping decision`)
  rows.push(...change.afterRows)
  if (change.afterDecisionCandidate === null) decisions.delete(change.sourceGoalId)
  else {
    decisions.set(change.sourceGoalId, change.afterDecisionCandidate)
    assert(same(change.afterRows.map((r: any) => r.canonicalGoalId), change.afterDecisionCandidate.canonicalGoalIds), `${change.sourceGoalId}: decision/rows disagree`)
  }
}
assert(decisions.size === sourceById.size, 'Source/mapping decision counts disagree')
const rowKeys = new Set<string>()
for (const row of rows) {
  assert(sourceById.has(row.legacyGoalId), `Mapped retired/unknown source ${row.legacyGoalId}`)
  assert(overlay.has(row.canonicalGoalId), `Mapped unknown target ${row.canonicalGoalId}`)
  assert(decisions.has(row.reviewDecisionId), `Unknown source decision ${row.reviewDecisionId}`)
  const key = `${row.legacyGoalId}:${row.canonicalGoalId}`
  assert(!rowKeys.has(key), `Duplicate source mapping ${key}`); rowKeys.add(key)
}
for (const [id, decision] of decisions) {
  assert(sourceById.has(id), `Unknown decision source ${id}`)
  assert(same(rows.filter((r: any) => r.legacyGoalId === id).map((r: any) => r.canonicalGoalId), decision.canonicalGoalIds), `${id}: all decision targets disagree`)
}
const currentView = await read(local(viewDelta.sourceViewPath))
const targetIds = new Set<string>(rows.flatMap((r: any) => sourceAtlasDescendants(r.canonicalGoalId, overlay, atomIds, canonical.landscapeId)))
const proposedView = structuredClone(currentView)
proposedView.rootNodes[0].children = [...targetIds].sort().map(goalId => ({ kind: 'goalEntry', goalId }))
const proposedLandscape = normalizeCanonicalLandscape({ ...canonical, goals: [...overlay.values()] })
const compiled = compileCompositionView(normalizeCompositionView(proposedView), proposedLandscape)
for (const finding of compiled.findings) if (finding.severity === 'error') errors.push(`NI source view: ${finding.message}`)
assert(targetIds.has(newGoal.id), 'New justification atom not visible in proposed NI source view')
assert(targetIds.has('ec88fc1d-ee0f-5a01-9464-dc358241050e'), 'Independently mapped ec88 removed incorrectly')
assert(targetIds.has('1d2b1038-dcd5-529a-b085-9e14f1d58c76'), 'Valid1d retained content not visible')
assert(!targetIds.has('e70d8a85-2dea-5165-919b-200fee9f4db4'), 'Unsupported e70 remains in NI source view overlay')
assert(!targetIds.has('05358518-f66c-5c1b-ad3f-d16211d0fc1c'), 'Unsupported053 remains in NI source view overlay')
assert(targetIds.size === viewDelta.sourceViewGoalSetImpact.candidateAfterAllPreservationDeltas, 'Proposed view count disagrees with the row inventory')

const nationalVisibility = []
for (const path of ['curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json', 'curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json']) {
  const view = normalizeCompositionView(await read(local(path)))
  const result = compileCompositionView(view, proposedLandscape)
  for (const finding of result.findings) if (finding.severity === 'error') errors.push(`${path}: ${finding.message}`)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, overlay)
  assert(roles.targetGoalIds.has(newGoal.id), `${path}: new atom not structurally exposed through reviewed parent subtree`)
  nationalVisibility.push({ path, newAtomStructurallyTargetVisible: roles.targetGoalIds.has(newGoal.id), compilerErrors: result.findings.filter(f => f.severity === 'error').length, runtimeJurisdictionYearAcceptanceClaimed: false })
}

const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv)
const schema = await read(local('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validate = ajv.compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: schema.$defs, ...schema.$defs.profile })
assert(p.goals.length === 1 && p.goals[0].goalId === newGoal.id, 'Expected exactly one new narrow P-profile')
for (const candidate of p.goals) {
  assert(validate(candidate.profile), `P-profile schema: ${ajv.errorsText(validate.errors)}`)
  const expected = new Set(candidate.profile.expectations.map((e: any) => e.id))
  for (const id of candidate.profile.coverageExpectations.requiredExpectationIds) assert(expected.has(id), `Unknown expectation ${id}`)
  assert(candidate.profile.applicationCaseBriefs.length === 2, 'Expected two fresh bilingual cases')
}
const receipt = {
  schemaVersion: 1, checkedAt: new Date().toISOString(), status: errors.length ? 'fail' : 'pass_inactive_candidate_structure',
  newJustificationAtomId: newGoal.id, combinedNewNIAtomicGoals: oldDelta.newGoals.length + delta.newGoals.length,
  fullOverlayGraphGoalCount: overlay.size, fullOverlayDagAndReferenceChecks: ['contains', 'requires'],
  existing1dPreservedExactly: same(overlay.get(snap.preservedExistingMitosisGoal.id), snap.preservedExistingMitosisGoal),
  newAtomTransitivePrerequisiteIds: [...prerequisiteReach].sort(),
  sourceGoalsBefore: source.sourceGoals.length, sourceGoalsAfterRetirement: sourceById.size, sourceMappingDecisionsAfter: decisions.size,
  proposedNIViewTargets: targetIds.size, existingEc88OtherSourcePreserved: true,
  nationalStaticVisibility: nationalVisibility,
  broadAncestorSourceBoundaryAndDirectMappingChecked: true,
  narrowFullInnerProfiles: p.goals.length, freshBilingualCases: 2,
  candidateFileHashes: await Promise.all(['canonical.delta.candidates.json', 'source-retirement.manifest.candidate.json', 'source-extraction.delta.candidates.json', 'mapping.delta.candidates.json', 'positive-evidence.candidates.json', 'view-source-preservation.delta.candidates.json'].map(async name => ({ name, sha256: hash(await readFile(own(name))) }))),
  noActiveWrites: true, runtimeYearFrontierClaimed: false, currentStrictClosuresClaimed: 0, humanApprovalClaimed: false,
  claimLimit: 'Schema/reference/full candidate overlay-DAG and static projection checks are not independent curricular-content review, actual image acceptance, current canonical D/P/A/M/V evidence, or a learner-specific jurisdiction/stage/year runtime frontier test.',
  errors,
}
await writeFile(own('candidate-check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
await writeFile(own('ni-source-view.overlay.candidate.json'), `${JSON.stringify(proposedView, null, 2)}\n`)
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
