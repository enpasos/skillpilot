import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {normalizeCanonicalLandscape, validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {compileCompositionView, collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
const nativeProjectionModule = process.env.SKILLPILOT_ROOT_NATIVE_PROJECTION_MODULE
assert(nativeProjectionModule, 'Provide the exact source-plus-export module in the external execution capsule')
const {collectRenderedAtomicGoalIdsFromCompositionView} = require(nativeProjectionModule)
import {validateHardDirectAtomicRoutes} from '../../../../../../../app/scripts/lib/hardLearningRouteValidation'

const date = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const source = date + 'wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/'
const output = date + 'wirtschaft-current493-national-two-scopes-and-memory-independent-root-native-v1/'
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const binding = (p: string) => ({path: p, sha256: createHash('sha256').update(readFileSync(p)).digest('hex')})
const oldCanonicalPath = source + 'two-existing-GK-motivation-actual-prerequisite-content-remedy-author-v1/whole-CAN485-only-two-existing-actual-prerequisite-corrections.inert.author-v13.json'
const currentCanonicalPath = source + 'eight-current-national-GK-terminal-rests-material-author-v1/whole-CAN493-qualifiedV13-seven-GK-DRAFTs-three-core-scoring-consistent-DEEN.author-successor-v6.json'
const oldIndexPath = source + 'two-operative-national-DE-union-view-current31-real13-endpoints-truthful-metadata-successor-v4.json'
const oldIndex = read(oldIndexPath)
const oldKindPath = date + 'wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/whole-SEM485-only-two-current-reviewed-requires-source-fingerprint-successors.json'
const kinds = new Map<string, any>(read(oldKindPath).decisions.map((d: any) => [d.goalId, d.semanticKind]))
const memoryPath = date + 'wirtschaft-four-SourceMemory-current-origin-AM-card-and-BE-visibility-technical-binding-v1/memory-full336.review.jsonl'
const memory = readFileSync(memoryPath, 'utf8').trim().split('\n').map(line => JSON.parse(line))
const ordinary = new Set<string>(memory.map((r: any) => r.goalId))
const required = memory.filter((r: any) => r.status === 'memory_required')
assert.equal(ordinary.size, 336)
assert.equal(required.length, 65)
const localNavigationIds = ['14c05eec-87af-5fd6-832a-4f5d9d280e66','1f0ed7e7-5f8b-512a-8d94-4bf05a065bbc','a1c0e891-cb5b-56ef-9aa7-ac782e2099c3','0fb8833c-4017-5052-819a-ecb5f6ebb36f','5113c64b-405d-5f4b-bae9-70fe530b5e69','f8922e23-f00e-53f7-be2f-1016e2b0ddf2','5982abda-0b0e-51a5-930f-1f58bd757f30','5317d078-413b-58bb-9262-d57387d51655','cb53b170-d531-5267-9571-ec57004b0fb3','f761852b-a0df-5ea6-a033-67bf3fb94ec1','bc977eaf-b2f0-5cb2-af48-2dff948830af','a5689d99-1ff6-57d1-b83e-b64c2dad480d','d2b41a54-0d32-5cee-948f-77954b0c6e79','86b0ed9d-3809-5402-92ad-89c2f9cbbe76']
const oldCan = read(oldCanonicalPath)
const can = read(currentCanonicalPath)
assert.equal(can.goals.length, 493)
const before = new Map<string, any>(oldCan.goals.map((g: any) => [g.id, g]))
const goals = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
for (const id of ordinary) assert.deepEqual(goals.get(id), before.get(id))
const newIds: string[] = can.goals.filter((g: any) => !before.has(g.id)).map((g: any) => g.id)
assert.equal(newIds.length, 8)
for (const id of newIds) {
  const goal = goals.get(id)
  assert(goal.tags.includes('Practice') && goal.tags.includes('Assessment'))
  kinds.set(id, 'practiceAssessment')
}
const normalized = normalizeCanonicalLandscape(can)
const graphErrors = validateCanonicalLandscape(normalized).filter(f => f.severity === 'error')
assert.equal(graphErrors.length, 0)
const leaves = (id: string, seen = new Set<string>()): string[] => {
  if (seen.has(id)) return []
  seen.add(id)
  const g = goals.get(id); assert(g)
  return g.contains?.length ? g.contains.flatMap((child: string) => leaves(child, seen)) : [id]
}
const allTerminalIds = [...new Set(localNavigationIds.flatMap(id => leaves(id)))]
assert(allTerminalIds.every(id => kinds.get(id) === 'practiceAssessment'))
const rows: any[] = []
const union = new Set<string>()
for (const [ix, course] of ['GK', 'LK'].entries()) {
 const beforeViewPath = oldIndex.views[ix].after.path
 const viewPath = ix === 0 ? source + 'eight-current-national-GK-terminal-rests-material-author-v1/national-GK-current31-real13-and-seven-new-terminal-materials-only.schema-correct-author-successor-v2.view.json' : beforeViewPath
 const view = read(viewPath)
 const compiled = compileCompositionView(view, normalized)
 const compilerErrors = compiled.findings.filter((f: any) => f.severity === 'error'); assert.equal(compilerErrors.length, 0)
 const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(normalized.goals.map((g: any) => [g.id,g])))
 const visible = collectRenderedAtomicGoalIdsFromCompositionView(can, viewPath, [course])
 const priorVisible = collectRenderedAtomicGoalIdsFromCompositionView(oldCan, beforeViewPath, [course])
 const routeScope = collectRenderedAtomicGoalIdsFromCompositionView(can, viewPath, [course], true)
 const visibleOrdinary = [...visible].filter(id => ordinary.has(id)).sort()
 assert.deepEqual(visibleOrdinary, [...priorVisible].filter(id => ordinary.has(id)).sort())
 visibleOrdinary.forEach(id => union.add(id))
 const requiredHere = required.filter((r: any) => visible.has(r.goalId))
 const missingMemory = requiredHere.filter((r: any) => !r.memoryGoalIds.some((id: string) => visible.has(id))); assert.equal(missingMemory.length, 0)
 const placements = oldIndex.views[ix].explicitCurrentOrdinaryThirtyOneTargetPlacements.map((id: string) => ({goalId:id, target:roles.targetGoalIds.has(id), visible:visible.has(id)})); assert(placements.every((r:any)=>r.target && r.visible))
 const routeFindings = validateHardDirectAtomicRoutes(can.goals, kinds, {scopeLabel:'Independent Root current493 national '+course, motivationAnchorGoalIds:['6bf2d1cc-e745-50dd-a617-71c06a6c6945'],terminalGoalClusterIds:allTerminalIds.filter(id=>visible.has(id)),routeGoalSelector:(g:any)=>routeScope.has(g.id),goalSelector:(g:any)=>ordinary.has(g.id)&&visible.has(g.id)})
 assert.equal(routeFindings.length,0)
 rows.push({course,view:binding(viewPath),actualWholeOrdinaryTargetIds:visibleOrdinary,actualRequiredOriginChecks:requiredHere.length,missingRequiredMemory:missingMemory,allCompilerFindings:compiled.findings,hardRouteFindings:routeFindings,actualQualifiedThirtyOnePlacements:placements,visibleTerminalLeafIds:allTerminalIds.filter(id=>visible.has(id)),visibleMemoryIds:[...visible].filter(id=>kinds.get(id)==='memory').sort()})
}
assert.equal(union.size,336)
assert.equal(rows[0].actualWholeOrdinaryTargetIds.length,253)
assert.equal(rows[1].actualWholeOrdinaryTargetIds.length,334)
assert.equal(rows[0].actualRequiredOriginChecks,47)
assert.equal(rows[1].actualRequiredOriginChecks,65)
const result={scope:'Independent native graph/compiler/projected hard-route and memory visibility check; classifications for8newPracticeNodes are explicitly provisional until actual foreign scientific receipts and current SEM493 arrive. No standalone material/source/D/human approvals.',canonical:binding(currentCanonicalPath),priorQualifiedV13:binding(oldCanonicalPath),priorQualifiedKinds:binding(oldKindPath),currentQualifiedMemory:binding(memoryPath),whole336OrdinaryGoalsExact:true,newPracticeNodeIds:newIds,localNavigationIds,allTerminalLeafIds:allTerminalIds,graphErrors,ordinaryUnion336:[...union].sort(),national:rows,newStrictClosures:0}
writeFileSync(output+'actual-independent-current493-native-graph-national-two-route-zero-and-memory-projection.result.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({canonical:result.canonical.sha256,ordinaryGoalsExact:336,graphErrors:0,ordinaryUnion:336,national:rows.map(r=>({course:r.course,ordinary:r.actualWholeOrdinaryTargetIds.length,requiredMemory:r.actualRequiredOriginChecks,compilerErrors:0,routeFindings:r.hardRouteFindings.length})),sevenMaterialScienceAndDNotApprovedHere:true,strictNetGain:0}))
