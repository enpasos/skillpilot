// SPDX-License-Identifier: Apache-2.0
// Independent, read-only replay. Prints a new validation result; no active writes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { normalizeCanonicalLandscape } from '../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, collectCompositionProjectionRoleGoalIds, compileCompositionView } from '../../app/src/utils/authoring/compositionViewAuthoring'

const base = 'tmp/cross-subject-requires/decimal-rounding-v4-20261013'
const sha = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
assert.equal(sha(`${base}/sealed-author-package.index.json`), 'sha256:3b659b6a9c39c410ac9d4388d9d069238ee526746010792fa855ac94f6ac8e08')
const jsonSame = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const baseline = read(`${base}/active-input-baseline.sha256.json`)
assert.equal(baseline.files.length, 212)
assert.equal(new Set(baseline.files.map((f: any) => f.path)).size, 212)
for (const f of baseline.files) {
  assert.equal(sha(f.path), f.sha256, f.path)
  assert.equal(readFileSync(f.path).length, f.byteLength, f.path)
}
const prior = read('tmp/cross-subject-requires/decimal-rounding-v3-20261013/active-input-baseline.sha256.json')
const byPrior = new Map(prior.files.map((r: any) => [r.path, r]))
assert.equal(byPrior.size, 212)
const sinceV3 = baseline.files.filter((r: any) => !jsonSame(r, byPrior.get(r.path)))
assert.equal(sinceV3.length, 0)
assert.deepEqual(read(`${base}/current-baseline-comparison.json`).changedSinceV3, [])

const history = read(`${base}/retained-context/historical-input-drift.context.json`)
const v2 = read(history.oldBaseline.path)
assert.equal(sha(history.oldBaseline.path), history.oldBaseline.sha256)
const v2Map = new Map(v2.files.map((r: any) => [r.path, r]))
const v2Drift = baseline.files.filter((r: any) => v2Map.has(r.path) && (v2Map.get(r.path) as any).sha256 !== r.sha256)
assert.equal(v2Drift.length, 27)
assert.deepEqual(v2Drift.map((r: any) => r.path).sort(), history.observedDrift.map((r: any) => r.path).sort())
for (const drift of history.observedDrift) {
  assert.equal((v2Map.get(drift.path) as any).sha256, drift.historicalSha256)
  assert.equal(sha(drift.path), drift.currentSha256)
}

const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const physicsPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const applyKinds = (raw: any, subject: string) => {
  const kinds = new Map(read(`curricula/DE/Gymnasium/quality/release-model/${subject}.semantic-kinds.json`).decisions.map((r: any) => [r.goalId, r.semanticKind]))
  return normalizeCanonicalLandscape({ ...raw, goals: raw.goals.map((g: any) => ({ ...g, semanticKind: g.semanticKind ?? kinds.get(g.id) })) })
}
const math = applyKinds(read(mathPath), 'mathematik')
const physics = applyKinds(read(physicsPath), 'physik')
const goal = read(`${base}/goal.author-candidate.json`).proposedGoal
const orientation = '65365dce-f33f-49d8-9516-42f75883aa86'
const representation = '2f565855-bcd6-4da5-bc80-4b72a2d93d50'
const parent = 'de39c9fe-5940-4320-aca8-2be85d6ada8f'
assert(!math.goals.some(g => g.id === goal.id))
assert.deepEqual(goal.requires, [orientation])
assert.equal(math.goals.find(g => g.id === orientation)?.semanticKind, 'orientation')
const stagedMath = structuredClone(math)
stagedMath.goals.push(goal)
stagedMath.goals.find(g => g.id === parent)!.contains.push(goal.id)
const landscapes = new Map([[math.landscapeId, math], [physics.landscapeId, physics]])
const stagedLandscapes = new Map([[math.landscapeId, stagedMath], [physics.landscapeId, physics]])
const all = [...math.goals, ...physics.goals]
const stagedAll = [...stagedMath.goals, ...physics.goals]
const byId = new Map(all.map(g => [g.id, g]))
const stagedById = new Map(stagedAll.map(g => [g.id, g]))
const roots = new Map([...landscapes].map(([id, l]) => [id, l.goals.find(g => g.tags?.includes('root'))!.id]))
const universe = { landscapeId: 'global', title: 'global', goals: all }
const stagedUniverse = { ...universe, goals: stagedAll }
const authored = read(`${base}/routes-and-projections.author-candidate.json`)
const authoredByPath = new Map(authored.reports.map((r: any) => [r.path, r]))
const report: any[] = []
const relevantIds = ['f6b1d812-ce8b-5852-b417-e6c29b533c7a', 'b615830a-e8b0-5754-81e0-99da98343a8d']
for (const [subject, landscape] of [['mathematik', math], ['physik', physics]] as const) {
  const dir = `curricula/DE/Gymnasium/composition-views/${subject}`
  for (const name of readdirSync(dir).filter(n => n.endsWith('.view.json')).sort()) {
    const path = `${dir}/${name}`
    const expected: any = authoredByPath.get(path)
    assert(expected, path)
    assert.equal(expected.sha256, sha(path))
    const raw = read(path)
    const view = normalizeCompositionView(raw)
    const before = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId, roots)
    const inherited = collectCompositionProjectionRoleGoalIds(view.rootNodes, stagedById, roots)
    const relevant = relevantIds.filter(id => before.targetGoalIds.has(id) || before.prerequisiteOnlyGoalIds.has(id))
    const addSupport = subject === 'physik' && relevant.length > 0 && !inherited.targetGoalIds.has(goal.id) && !inherited.prerequisiteOnlyGoalIds.has(goal.id)
    const hypothetical = structuredClone(raw)
    if (addSupport) hypothetical.rootNodes.push({ kind: 'goalEntry', goalId: goal.id, projectionRole: 'prerequisiteOnly' })
    const afterView = normalizeCompositionView(hypothetical)
    const after = collectCompositionProjectionRoleGoalIds(afterView.rootNodes, stagedById, roots)
    const beforeCompiled = compileCompositionView(view, landscape, universe, landscapes)
    const afterCompiled = compileCompositionView(afterView, subject === 'mathematik' ? stagedMath : physics, stagedUniverse, stagedLandscapes)
    const targetSetUnchanged = jsonSame([...before.targetGoalIds].sort(), [...after.targetGoalIds].sort())
    const treeUnchanged = jsonSame(beforeCompiled.compiledRootNodes, afterCompiled.compiledRootNodes)
    const beforeErrors = beforeCompiled.findings.filter(f => f.severity === 'error')
    const afterErrors = afterCompiled.findings.filter(f => f.severity === 'error')
    assert.deepEqual(expected.scope, view.scope)
    assert.equal(expected.beforeTargetCount, before.targetGoalIds.size)
    assert.equal(expected.hypotheticalAfterTargetCount, after.targetGoalIds.size)
    assert.equal(expected.currentRepresentationGoalIsTarget, before.targetGoalIds.has(representation))
    assert.equal(expected.currentRepresentationGoalIsPrerequisiteOnly, before.prerequisiteOnlyGoalIds.has(representation))
    assert.equal(expected.candidateRoundingInheritsTargetFromParent, inherited.targetGoalIds.has(goal.id))
    assert.equal(expected.candidateRoundingInheritsPrerequisiteOnlyFromParent, inherited.prerequisiteOnlyGoalIds.has(goal.id))
    assert.deepEqual(expected.relevantAuthoredPhysicsTargetOrSupportIds, relevant)
    assert.deepEqual(expected.conditionalExplicitPrerequisiteOnlyProposal, addSupport ? { kind: 'goalEntry', goalId: goal.id, projectionRole: 'prerequisiteOnly' } : null)
    assert.equal(expected.targetSetUnchanged, targetSetUnchanged)
    assert.equal(expected.visibleCompiledTreeUnchanged, treeUnchanged)
    assert.deepEqual(expected.beforeCompiledErrors, beforeErrors)
    assert.deepEqual(expected.hypotheticalAfterCompiledErrors, afterErrors)
    if (subject === 'physik') {
      assert(targetSetUnchanged && treeUnchanged)
      assert(!after.targetGoalIds.has(goal.id))
      assert.equal(after.prerequisiteOnlyGoalIds.has(goal.id), addSupport)
    }
    report.push({ path, sha256: sha(path), subject, scope: view.scope,
      candidateTargetInStaging: after.targetGoalIds.has(goal.id),
      candidateSupportOnlyInStaging: after.prerequisiteOnlyGoalIds.has(goal.id),
      orientationProjectedInStaging: after.targetGoalIds.has(orientation) || after.prerequisiteOnlyGoalIds.has(orientation),
      representationRoleUnchanged: before.targetGoalIds.has(representation) === after.targetGoalIds.has(representation) && before.prerequisiteOnlyGoalIds.has(representation) === after.prerequisiteOnlyGoalIds.has(representation),
      targetsUnchanged: targetSetUnchanged, visibleTreeUnchanged: treeUnchanged,
      beforeErrors: beforeErrors.length, afterErrors: afterErrors.length })
  }
}
assert.equal(report.length, 157)
assert.equal(authoredByPath.size, 157)
const mathRows = report.filter(r => r.subject === 'mathematik')
const physicsRows = report.filter(r => r.subject === 'physik')
assert.equal(mathRows.length, 88)
assert.equal(physicsRows.length, 69)
assert.equal(physicsRows.filter(r => r.candidateSupportOnlyInStaging).length, 64)

// Replay direct plus contains-ancestor inheritance only. Requires-transitive
// prerequisites are not added and no learner mastery is mutated.
const parents = new Map<string, Set<string>>()
for (const g of stagedAll) for (const child of g.contains) {
  const id = stagedById.has(child) ? child : child.includes(':') ? child.split(':', 2)[1] : child
  if (!stagedById.has(id)) continue
  if (!parents.has(id)) parents.set(id, new Set())
  parents.get(id)!.add(g.id)
}
const ancestors = new Set<string>()
const queue = [...(parents.get(goal.id) ?? [])]
for (let i = 0; i < queue.length; i++) {
  const id = queue[i]
  if (ancestors.has(id)) continue
  ancestors.add(id)
  queue.push(...(parents.get(id) ?? []))
}
const effective = new Set(goal.requires)
const ancestorRows = [...ancestors].map(id => ({ goalId: id, requires: stagedById.get(id)!.requires }))
for (const a of ancestorRows) for (const req of a.requires) effective.add(req)
effective.delete(goal.id)
assert.deepEqual([...effective], [orientation])
assert.equal(ancestorRows.length, 5)
assert(ancestorRows.every(a => a.requires.length === 0))
assert(report.every(r => r.representationRoleUnchanged))
const staticEligibility = (target: boolean, inFocus: boolean, mastery: Map<string, number>) =>
  target && inFocus && (mastery.get(goal.id) ?? 0) < 0.9
  && [...effective].every(id => (mastery.get(id) ?? 0) >= 0.9)
const zeroMastery = new Map([[goal.id, 0], [orientation, 0], [representation, 0]])
const completedOrientation = new Map(zeroMastery)
completedOrientation.set(orientation, 1)
const targetExists = mathRows.some(r => r.candidateTargetInStaging)
const supportExists = physicsRows.some(r => r.candidateSupportOnlyInStaging && !r.candidateTargetInStaging)
assert(targetExists && supportExists)
assert.equal(staticEligibility(targetExists, true, zeroMastery), false)
assert.equal(staticEligibility(targetExists, true, completedOrientation), true)
assert.equal(staticEligibility(false, true, completedOrientation), false)
assert.equal(staticEligibility(targetExists, false, completedOrientation), false)
assert.equal(completedOrientation.get(representation), 0)
assert.equal(zeroMastery.get(orientation), 0)
const frontendFrontierDemonstration = {
  mode: 'static equation only, not backend or host acceptance',
  allIntrinsicMasteryWritesAbsent: true,
  broaderRepresentationMasteryRemainsZero: completedOrientation.get(representation) === 0,
  ifTargetAndFocusIncludedWithOrientationZero: staticEligibility(targetExists, true, zeroMastery),
  ifTargetAndFocusIncludedWithOrientationCompleteAndCandidateZero: staticEligibility(targetExists, true, completedOrientation),
  ifSupportOnlyWithOrientationComplete: staticEligibility(false, true, completedOrientation),
  ifTargetExcludedFromFocusWithOrientationComplete: staticEligibility(targetExists, false, completedOrientation),
  note: 'Orientation completion is a motivational marker. This static eligibility statement neither verifies its completion procedure nor persists any learner state.',
}
console.log(JSON.stringify({
  schemaVersion: 1, status: 'PASS bounded independent v4 current-baseline and complete conditional composition replay; adoption/placement/runtime acceptance pending',
  packageIndexSha256: sha(`${base}/sealed-author-package.index.json`),
  currentBaselineArtifactsChecked: 212, driftSinceV3: sinceV3.length,
  historicalV2ChangedInputs: v2Drift.length, historicalV2ChangedInputPaths: v2Drift.map((r: any) => r.path),
  currentMathViews: mathRows.length, currentPhysicsViews: physicsRows.length,
  conditionalPhysicsSupportOnlyViews: physicsRows.filter(r => r.candidateSupportOnlyInStaging).length,
  conditionalMathTargetViews: mathRows.filter(r => r.candidateTargetInStaging).length,
  conditionalMathTargetWithUnprojectedOrientation: mathRows.filter(r => r.candidateTargetInStaging && !r.orientationProjectedInStaging).map(r => r.path),
  allPhysicsTargetsAndVisibleTreesUnchanged: physicsRows.every(r => r.targetsUnchanged && r.visibleTreeUnchanged),
  allCurrentAndHypotheticalViewsCompileWithoutErrors: report.every(r => r.beforeErrors === 0 && r.afterErrors === 0),
  effectiveCandidateRequires: [...effective], containsAncestors: ancestorRows,
  frontendFrontierDemonstration, reports: report,
  activeCanonicalAndViewsChanged: false, independentNativeApprovalClaimed: false,
}))
