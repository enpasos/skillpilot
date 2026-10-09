import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { sourceAtlasFacet } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookSourceAtlasInputs.ts'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { normalizeCanonicalLandscape } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts'
import { applyGoalPlacementProjection } from '/home/enpasos/projects/skillpilot/app/src/utils/goalPlacementProjection.ts'
import { scoreLearnerCompositionScope } from '/home/enpasos/projects/skillpilot/app/src/utils/learnerCompositionScopeMatching.ts'
import { isCourseProfileFilterId } from '/home/enpasos/projects/skillpilot/app/src/utils/personalCurriculumStageScope.ts'
import { convertLearningGoal } from '/home/enpasos/projects/skillpilot/app/src/goalTypes.ts'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const own=base+'chemie-b008-nine-program-role-data-preparation-independent-b-v1/'
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const inputPath=base+'chemie-b008-rest-twenty-source-content-and-program-author-root-v1/nine-whole-goals.actual-official-program-boundaries.author-input.json'
const canonPath=base+'chemie-b008-current-twenty-six-native-preparation-author-v1/candidate/canonical504-current26-resource-links.inactive.json'
const input=json(inputPath), canon=json(canonPath)
const placements=json(own+'nine-role-program-units-and-secondary-placements.inactive.json')
const index=json(own+'unregistered-six-catalogue-views.exact-index.json')
const facets=[]
for(const item of input.items) for(const route of item.wholeActualRouteContexts) {
  const extraction=json(route.sourceExtractionPath)
  const levels=[route.wholeSourceGoal,route.wholePassage,route.wholeSourceDocument,extraction]
  const stage=sourceAtlasFacet(levels,'stage'), course=sourceAtlasFacet(levels,'courseProfile')
  assert.deepEqual(stage,['SekII']); assert.deepEqual(course,[])
  facets.push({goalId:item.goalId,sourceGoalId:route.sourceGoalId,sourceSpan:route.sourceSpan,actualStage:stage,actualCourse:course,sourceAtlasResolved:false})
}
const normalized=normalizeCanonicalLandscape(canon)
const compilation=[]; const union=new Set<string>()
for(const row of index.views) {
  assert.equal(digest(row.binding.path),row.binding.sha256)
  const raw=json(row.binding.path),view=normalizeCompositionView(raw)
  const result=compileCompositionView(view,normalized)
  assert.deepEqual(result.findings.filter(f=>f.severity==='error'),[])
  const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(normalized.goals.map(g=>[g.id,g])))
  assert.deepEqual([...roles.targetGoalIds].sort(),[...row.goalIds].sort())
  roles.targetGoalIds.forEach(id=>union.add(id))
  const ordinaryGK={schoolForm:'Gymnasium',jurisdiction:'DE-BY',stage:'SekII',courseProfile:'GK'}
  const ordinaryLK={...ordinaryGK,courseProfile:'LK'}
  // This proves why these content catalogues must remain unregistered: absent
  // programme/year keys, ordinary scope matching would accept the broad scope.
  assert.notEqual(scoreLearnerCompositionScope(raw.scope,ordinaryGK),null)
  assert.notEqual(scoreLearnerCompositionScope(raw.scope,ordinaryLK),null)
  compilation.push({path:row.binding.path,findings:result.findings,targetGoalIds:[...roles.targetGoalIds].sort(),
                    broadScopeWouldMatchOrdinaryGKAndLK:true,registeringCatalogueWouldNotEncodeOptionalityOrNTG:true})
}
assert.deepEqual([...union].sort(),index.whole9Union)
const rawEntry={meta:{...canon,...placements},goals:canon.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:canon.landscapeId}))}
const before=JSON.stringify(rawEntry.goals)
const projected=applyGoalPlacementProjection([rawEntry],['DE-BY','SekII'])[0]
assert.equal(JSON.stringify(projected.goals),before)
assert.ok(placements.goalPlacements.every((p:any)=>p.relation==='secondary'))
const unsupportedActualProgrammeTokens=['Biologisch-chemisches Praktikum','C11 NTG']
const tokenChecks=unsupportedActualProgrammeTokens.map(token=>({token,recognizedLearnerCourseFilter:isCourseProfileFilterId(token),atlasFacetFromExplicitProgrammeToken:sourceAtlasFacet([{courseProfile:token}],'courseProfile')}))
assert.ok(tokenChecks.every(x=>x.recognizedLearnerCourseFilter===false && x.atlasFacetFromExplicitProgrammeToken?.length===0))
const receipt={schemaVersion:1,role:'Actual existing helper/placement/compiler probe; no hypothetical runtime or mock',createdAt:new Date().toISOString(),
  exactInputBindings:[{path:inputPath,sha256:digest(inputPath)},{path:canonPath,sha256:digest(canonPath)}],
  actual27SourceOccurrences:facets,compositionCompilation:compilation,whole9CatalogueUnion:[...union].sort(),
  secondaryPlacementProjectionLeavesWholeCanonicalGoalTreeValueExact:true,secondaryPlacementCount:placements.goalPlacements.length,
  noCurrentAPIRoleForOptionalProgrammeToken:tokenChecks,normalAtlas395Approval:false,newScientificReview:false,
  sourceCourseMetadataChanged:false,activeWrites:0,strictGain:0,humanApproval:false}
const path=own+'actual-existing-nine-program-source-placement-view-API.receipt.json'
writeFileSync(path,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({receiptPath:path,actualOccurrences:facets.length,views:compilation.length,goalUnion:union.size,secondaryPlacements:placements.goalPlacements.length,atlasApproved:false}))
