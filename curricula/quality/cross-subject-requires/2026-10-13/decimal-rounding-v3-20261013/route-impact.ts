// Apache-2.0. Read-only baseline + in-memory hypothetical projections.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  normalizeCompositionView,
} from '../../../app/src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../../../app/src/utils/authoring/canonicalAuthoring'

const base = 'tmp/cross-subject-requires/decimal-rounding-v3-20261013'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const shaBytes = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(p)).digest('hex')
const shaObject = (x: unknown) => 'sha256:' + createHash('sha256').update(JSON.stringify(x)).digest('hex')
const goal = read(`${base}/goal.author-candidate.json`).proposedGoal
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const physicsPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const rawMath = read(mathPath)
const rawPhysics = read(physicsPath)
const mathKindPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const physicsKindPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const mathKinds = new Map(read(mathKindPath).decisions.map((row: any) => [row.goalId, row.semanticKind]))
const physicsKinds = new Map(read(physicsKindPath).decisions.map((row: any) => [row.goalId, row.semanticKind]))
const withKinds = (landscape: any, kinds: Map<any, any>) => ({ ...landscape, goals: landscape.goals.map((g: any) => ({ ...g, semanticKind: g.semanticKind ?? kinds.get(g.id) })) })
const rawAfterMath = structuredClone(rawMath)
rawAfterMath.goals.push(goal)
const parentId = 'de39c9fe-5940-4320-aca8-2be85d6ada8f'
rawAfterMath.goals.find((g: any) => g.id === parentId).contains.push(goal.id)
// Weight recalculation is a later canonical adoption requirement, not a simulated change.
const math = normalizeCanonicalLandscape(withKinds(rawMath, mathKinds))
const physics = normalizeCanonicalLandscape(withKinds(rawPhysics, physicsKinds))
const afterMath = normalizeCanonicalLandscape(withKinds(rawAfterMath, mathKinds))
const landscapes = new Map([[math.landscapeId, math], [physics.landscapeId, physics]])
const afterLandscapes = new Map([[math.landscapeId, afterMath], [physics.landscapeId, physics]])
const all = [...math.goals, ...physics.goals]
const afterAll = [...afterMath.goals, ...physics.goals]
const universe = { landscapeId: 'global', title: 'global', goals: all }
const afterUniverse = { ...universe, goals: afterAll }
const byId = new Map(all.map(g => [g.id, g]))
const afterById = new Map(afterAll.map(g => [g.id, g]))
const roots = new Map([...landscapes].map(([id, l]) => [id, l.goals.find(g => g.tags?.includes('root'))?.id ?? '']))
const rep = '2f565855-bcd6-4da5-bc80-4b72a2d93d50'
const dependents = ['f6b1d812-ce8b-5852-b417-e6c29b533c7a', 'b615830a-e8b0-5754-81e0-99da98343a8d']
const reports: any[] = []
for (const [subject, dir, landscape] of [
  ['mathematik', 'curricula/DE/Gymnasium/composition-views/mathematik', math],
  ['physik', 'curricula/DE/Gymnasium/composition-views/physik', physics],
] as const) {
  for (const name of readdirSync(dir).filter(f => f.endsWith('.view.json')).sort()) {
    const path = `${dir}/${name}`
    const raw = read(path)
    const view = normalizeCompositionView(raw)
    const beforeRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId, roots)
    const inheritedAfterRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, afterById, roots)
    const relevantDependents = dependents.filter(id => beforeRoles.targetGoalIds.has(id) || beforeRoles.prerequisiteOnlyGoalIds.has(id))
    const proposedRaw = structuredClone(raw)
    const addExplicitSupport = subject === 'physik' && relevantDependents.length > 0
      && !inheritedAfterRoles.targetGoalIds.has(goal.id)
      && !inheritedAfterRoles.prerequisiteOnlyGoalIds.has(goal.id)
    if (addExplicitSupport) proposedRaw.rootNodes.push({ kind: 'goalEntry', goalId: goal.id, projectionRole: 'prerequisiteOnly' })
    const proposedView = normalizeCompositionView(proposedRaw)
    const afterRoles = collectCompositionProjectionRoleGoalIds(proposedView.rootNodes, afterById, roots)
    const beforeCompiled = compileCompositionView(view, landscape, universe, landscapes)
    const afterCompiled = compileCompositionView(proposedView, subject === 'mathematik' ? afterMath : physics, afterUniverse, afterLandscapes)
    const beforeErrors = beforeCompiled.findings.filter(f => f.severity === 'error')
    const afterErrors = afterCompiled.findings.filter(f => f.severity === 'error')
    const newErrors = afterErrors.filter(f => !beforeErrors.some(b => JSON.stringify(b) === JSON.stringify(f)))
    const targetsUnchanged = shaObject([...beforeRoles.targetGoalIds].sort()) === shaObject([...afterRoles.targetGoalIds].sort())
    const treeUnchanged = shaObject(beforeCompiled.compiledRootNodes) === shaObject(afterCompiled.compiledRootNodes)
    if (subject === 'physik' && (!targetsUnchanged || !treeUnchanged || newErrors.length)) throw new Error(`Physics projection changed: ${path}`)
    reports.push({
      subject, path, sha256: shaBytes(path), viewId: view.viewId, scope: view.scope,
      currentRepresentationGoalIsTarget: beforeRoles.targetGoalIds.has(rep),
      currentRepresentationGoalIsPrerequisiteOnly: beforeRoles.prerequisiteOnlyGoalIds.has(rep),
      candidateRoundingInheritsTargetFromParent: inheritedAfterRoles.targetGoalIds.has(goal.id),
      candidateRoundingInheritsPrerequisiteOnlyFromParent: inheritedAfterRoles.prerequisiteOnlyGoalIds.has(goal.id),
      relevantAuthoredPhysicsTargetOrSupportIds: relevantDependents,
      conditionalExplicitPrerequisiteOnlyProposal: addExplicitSupport ? { kind: 'goalEntry', goalId: goal.id, projectionRole: 'prerequisiteOnly' } : null,
      beforeTargetCount: beforeRoles.targetGoalIds.size, hypotheticalAfterTargetCount: afterRoles.targetGoalIds.size,
      targetSetUnchanged: targetsUnchanged, visibleCompiledTreeUnchanged: treeUnchanged,
      beforeCompiledErrors: beforeErrors, hypotheticalAfterCompiledErrors: afterErrors,
      reviewLimit: 'In-memory graph/view demonstration only. No Mathematics placement, curricular/source universality, prerequisite claim, new Physics edge, native gate or remediation route is approved by compiling this proposal.',
    })
  }
}
const mathReports = reports.filter(r => r.subject === 'mathematik')
const physicsReports = reports.filter(r => r.subject === 'physik')
const requiredStates = goal.applicability.jurisdiction
const stateRoutes = requiredStates.map((jurisdiction: string) => {
  const stateMath = mathReports.filter(r => r.scope.jurisdiction === jurisdiction)
  const lower = stateMath.filter(r => ['CrossStage', 'SekI'].includes(r.scope.stage))
  return {
    jurisdiction,
    lowerOrCrossStageMathViewPaths: lower.map(r => r.path),
    existingTargetRepresentationViewPaths: lower.filter(r => r.currentRepresentationGoalIsTarget).map(r => r.path),
    inheritedCandidateTargetViewPaths: lower.filter(r => r.candidateRoundingInheritsTargetFromParent).map(r => r.path),
    explicitCandidatePlacementRequiredViewPaths: lower.filter(r => !r.candidateRoundingInheritsTargetFromParent).map(r => r.path),
    status: 'independent_source_grade_placement_and_learnable_preparation_route_review_pending',
    missingExistingRepresentationRoute: !lower.some(r => r.currentRepresentationGoalIsTarget),
    noInferenceRule: 'Jurisdiction matching, phaseJ6, existing REP placement, or requires does not automatically grant this new goal a target role or place in a year. Use the actual16source placement proposal and compile the independently accepted authored placement.',
  }
})
const result = {
  schemaVersion: 1,
  status: 'inert_hypothetical_projection_candidates_all_source_route_quality_reviews_pending',
  goalId: goal.id,
  canonicalParentProposal: { goalId: parentId, childGoalId: goal.id, operation: 'add contains child after existing decimal foundation', scopeCaution: 'J6 cluster is semantic grouping. SN/MVsourceyear5 and5/6or5–10bands require independently authored placements; shared canonical phase is not an all-state exactyear claim.' },
  mathematicsViewCount: mathReports.length,
  physicsViewCount: physicsReports.length,
  conditionalPhysicsExplicitSupportViewCount: physicsReports.filter(r => r.conditionalExplicitPrerequisiteOnlyProposal).length,
  allPhysicsTargetSetsAndCompiledTreesUnchangedInConditionalSupportSimulation: true,
  stateRoutes,
  reports,
  inputBindings: [mathPath, physicsPath, `${base}/goal.author-candidate.json`, 'app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/utils/authoring/canonicalAuthoring.ts'].map(path => ({ path, sha256: shaBytes(path) })),
  remediationContract: {
    currentOnlyPhysicsScope: 'prerequisiteOnly is solely check support, never a new active target/frontier/progress member. New edge adoption needs a reachable ordinary Mathematics-owned target preparation path in the same jurisdiction; public owner URL is useful information, not runtime authorization to learn a hidden goal.',
    neededExplicitLearnerFlow: 'Where current stage/subject selection excludes the Mathematics target route, independently verify the permitted first-party Cockpit action that selects appropriate Mathematics preparation under the same jurisdiction. The coach may not silently mutateLevel2, broadenfocus, changejurisdiction, or manufactureMastery.',
    bwSpecificGap: 'The v3 candidate does not require fullREP and does not promoteREP to target. BW still has no inherited rounding target from the proposed parent, so an independently reviewed explicit Math target placement is required before adoption. Intrinsic place-value teaching needs actual independent performance/content review.',
    otherMissingRoutes: 'Any state/view with no inherited candidate target needs independently accepted explicit goalEntry placement in its source-supported lower-secondary year/band; do not blanket-insert by phase or by matching a convenient sibling.',
  },
  assessmentImpact: 'Review actual existing Math exercise/exam demands before changing any requires, tasks, solutions or scoring. No exam/practice link is proposed automatically. Physicsf6 fullP includes fresh-series mean/spread and Physicsb615 includes significantfigures/guarddigits; this new narrow operation alone cannot certify those successor decisions or their signed transfer.',
}
const output = `${base}/routes-and-projections.author-candidate.json`
writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ mathematicsViews: mathReports.length, physicsViews: physicsReports.length, physicsSupportProposals: result.conditionalPhysicsExplicitSupportViewCount, mathStatesMissingRepresentationTargetRoute: stateRoutes.filter((s: any) => s.missingExistingRepresentationRoute).map((s: any) => s.jurisdiction), noActiveWrites: true }))
