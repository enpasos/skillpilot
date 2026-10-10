// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const R = resolve(process.argv[2] ?? process.cwd())
const P = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-C11-NTG-bounded-layer-a-proposal-author-20261010-v1'
const read = (p: string) => JSON.parse(readFileSync(resolve(R, p), 'utf8'))
const ref = (p: string) => { const b = readFileSync(resolve(R, p)); return { path: p, sha256: `sha256:${createHash('sha256').update(b).digest('hex')}`, bytes: b.length } }
const imp = async (p: string) => import(pathToFileURL(resolve(R, p)).href)
const { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } = await imp('app/src/utils/authoring/compositionViewAuthoring.ts')
const { normalizeCanonicalLandscape } = await imp('app/src/utils/authoring/canonicalAuthoring.ts')
const { deriveRuntimeCompositionScope } = await imp('app/src/utils/compositionViewRuntime.ts')
const { scoreLearnerCompositionScope } = await imp('app/src/utils/learnerCompositionScopeMatching.ts')
const { applyGoalPlacementProjection } = await imp('app/src/utils/goalPlacementProjection.ts')
const { convertLearningGoal } = await imp('app/src/goalTypes.ts')
const { CANONICAL_GYMNASIUM_ROOT_ID } = await imp('app/src/utils/curriculumDisplay.ts')
const { sourceAtlasFacet } = await imp('app/scripts/goalBookSourceAtlasInputs.ts')
const raw = read(`${P}/inputs/whole517.observed-exact.json`)
const normalized = normalizeCanonicalLandscape(raw)
const view = normalizeCompositionView(read(`${P}/rejected-projection-experiments/ntg-courseProfile.compilable-but-unselectable.view.json`))
const compiled = compileCompositionView(view, normalized)
assert.deepEqual(compiled.findings.filter((f: any) => f.severity === 'error'), [])
const ids = ['e5a5dcd8-053c-55fd-b5c7-bba93779da53', 'eed5eda3-2daf-5d48-b935-23dadd622d9b']
const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(raw.goals.map((g: any) => [g.id, g])))
assert.deepEqual([...roles.targetGoalIds].sort(), [...ids].sort())
const requests = ['NTG', 'NTG11', 'GK', 'LK', 'ALL'].map(filter => {
  const personal = { [CANONICAL_GYMNASIUM_ROOT_ID]: { selected: true, filterId: 'DE-BY', stage: 'SekII' }, [raw.landscapeId]: { selected: true, filterId: filter } }
  const derived = deriveRuntimeCompositionScope({ landscapeId: raw.landscapeId, scopeEnabled: true, catalogJurisdictions: ['DE-BY'], learnerPersonalCurriculum: JSON.stringify(personal) })
  const scored = scoreLearnerCompositionScope(view.scope, derived)
  assert.equal(scored, null)
  return { inputFilterDiagnosticOnly: filter, actualDerivedNormalScope: derived, normalNTGViewScopeMatch: scored }
})
const directArtificialRequest = scoreLearnerCompositionScope(view.scope, { schoolForm: 'Gymnasium', jurisdiction: 'DE-BY', stage: 'SekII', courseProfile: 'NTG' })
assert.ok(directArtificialRequest)
const generic = normalizeCompositionView(read(`${P}/rejected-projection-experiments/general-SekII-labelled-NTG11.NOT-A-SAFE-BOUNDARY.view.json`))
const genericMatches = requests.filter(r => ['GK', 'LK'].includes(r.inputFilterDiagnosticOnly)).map(r => ({ inputFilter: r.inputFilterDiagnosticOnly, score: scoreLearnerCompositionScope(generic.scope, r.actualDerivedNormalScope) }))
assert.ok(genericMatches.every(x => x.score !== null))
const placed = read(`${P}/rejected-projection-experiments/whole517.generic-context-placement.LEAKS-UNDER-BY.inactive.json`)
assert.deepEqual(placed.goals, raw.goals)
const entry = { meta: placed, goals: placed.goals.map((g: any) => convertLearningGoal(g, { landscapeId: placed.landscapeId })) }
const projections = [['DE-BY'], ['DE-BY','SekII','GK'], ['DE-BY','NTG'], ['DE-BY','NTG','J11']].map(filters => {
  const out = applyGoalPlacementProjection([entry], filters)[0]
  const anchors = out.goals.filter((g: any) => g.extendedData?.syntheticStructureKind === 'programUnit' || g.tags?.includes('program-unit:anchor'))
  const moved = ids.filter(id => anchors.some((g: any) => g.contains.includes(id)))
  return { filters, syntheticProgramAnchors: anchors.map((g: any) => ({ id: g.id, contains: g.contains })), targetIdsAttachedThroughProposedPlacement: moved }
})
assert.deepEqual(projections[0].targetIdsAttachedThroughProposedPlacement.sort(), [...ids].sort())
assert.deepEqual(projections[1].targetIdsAttachedThroughProposedPlacement.sort(), [...ids].sort())
assert.deepEqual(projections[2].targetIdsAttachedThroughProposedPlacement, [])
assert.deepEqual(projections[3].targetIdsAttachedThroughProposedPlacement, [])
const frame = read(`${P}/inputs/prior-confirmed-C11-whole-source-frame.exact.json`)
const source = frame.wholeSourceOperatorAndAllOccurrences
const stage = sourceAtlasFacet([source], 'stage')
const courseProfile = sourceAtlasFacet([source], 'courseProfile')
assert.deepEqual(stage, ['SekII']); assert.deepEqual(courseProfile, [])
const actualNormalSourceScoped = courseProfile !== null && stage?.length === 1 && (stage[0] === 'SekI' || courseProfile.length > 0)
assert.equal(actualNormalSourceScoped, false)
const sourcePaths = ['app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/compositionViewRuntime.ts','app/src/utils/learnerCompositionScopeMatching.ts','app/src/utils/goalPlacementProjection.ts','app/src/utils/personalCurriculumStageScope.ts','app/src/goalTypes.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/applicabilityCompiler.ts','backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java','backend/src/main/java/com/skillpilot/backend/service/LearnerService.java','backend/src/main/java/com/skillpilot/backend/service/CurriculaService.java']
const proof = { schemaVersion: 1, role: 'AUTHOR bounded data experiment, not independent review', normalCompilerErrors: [], normalCompilerFindings: compiled.findings, actualCompilableTargetIds: [...roles.targetGoalIds].sort(), prerequisiteOnlyIds: [...roles.prerequisiteOnlyGoalIds].sort(), actualCommittedScopeDerivationAndSelection: requests, artificialDirectNTGRequestCanMatch: true, artificialRequestIsNotNormalCommittedScopeProof: true, genericBYStageViewMatchesUnrestrictedGKAndLK: genericMatches, actualNormalPlacementResults: projections, unknownGenericPlacementContextDoesNotConstrainKnownFilters: true, actualC11SourceFacet: { stage, courseProfile, officialCourseLevel: source.courseLevel, actualNormalSourceScoped }, normalSourceFiles: sourcePaths.map(ref), exactRemainingBoundary: 'No current normal committed selector or closed composition dimension expresses both NTG training direction and programme year11. Unknown placement filters fail closed, while extra generic context keys do not constrain known filters. The normal source atlas author fallback remains limited to BB/BE; course-unspecified C11 has no scoped witness.', sourceMetadataEdited: false, currentPSelected: false, currentC11CourseHold: 'HOLD', independentApproval: false, operativeWrites: [], runtimeOrUXChanges: [] }
writeFileSync(resolve(R, P, 'checks/actual-normal-C11-NTG-scope-and-placement-boundary.json'), `${JSON.stringify(proof, null, 2)}\n`)
console.log(JSON.stringify({ normalCompilerErrors: 0, actualTargetIds: proof.actualCompilableTargetIds, normalCommittedNTGMatches: 0, broadBYPlacementLeak: true, officialCourseLevel: source.courseLevel, sourceAtlasScoped: false, currentPSelected: false, operativeWrites: [] }))
