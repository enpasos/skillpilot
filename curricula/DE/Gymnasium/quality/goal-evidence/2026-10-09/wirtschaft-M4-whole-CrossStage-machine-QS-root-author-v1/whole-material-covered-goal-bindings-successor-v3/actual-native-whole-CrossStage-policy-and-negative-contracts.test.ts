import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [repo, capsule, output] = process.argv.slice(2)
if (!repo || !capsule || !output) throw new Error('Usage: test repo capsule output')
const candidate = await import(pathToFileURL(join(capsule, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const original = await import(pathToFileURL(join(capsule, 'app/scripts/whole-predecessor.ts')).href)
const economicId = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const baseProfile = candidate.routeProfiles.find((p: any) => p.landscapeId === economicId)
const originalProfiles = original.routeProfiles.filter((p: any) => p.landscapeId !== economicId)
const candidateProfiles = candidate.routeProfiles.filter((p: any) => p.landscapeId !== economicId)
assert.equal(originalProfiles.length, candidateProfiles.length)
for (let index=0; index<originalProfiles.length; index++) {
 const a=originalProfiles[index], b=candidateProfiles[index]
 assert.deepEqual({...a, goalSelector: a.goalSelector.toString(), clusterSelector: a.clusterSelector.toString()},
  {...b, goalSelector: b.goalSelector.toString(), clusterSelector: b.clusterSelector.toString()})
}
const checks: any[]=[]
const actualLandscape=JSON.parse(readFileSync(join(repo,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'),'utf8'))
const econViews=join(repo,'curricula/DE/Gymnasium/composition-views/wirtschaft')
let actualCrossStageViews=0, actualTargetOccurrences=0, actualSupportOccurrences=0
for (const file of readdirSync(econViews).filter((f:string)=>f.endsWith('.view.json'))) {
 const path=join(econViews,file), view=JSON.parse(readFileSync(path,'utf8'))
 if (view.scope.stage !== 'CrossStage') continue
 const filters=[view.scope.courseProfile,view.scope.durationModel].filter(Boolean)
 for (const support of [false,true]) {
  const expected=original.collectRenderedAtomicGoalIdsFromCompositionView(actualLandscape,path,filters,support)
  const actual=candidate.collectRenderedAtomicGoalIdsFromCompositionView(actualLandscape,path,filters,support,'CrossStage')
  assert.deepEqual([...actual].sort(),[...expected].sort(),`Whole tree changed unexpectedly: ${file} support=${support}`)
  assert(actual.size>0,`${file} incorrectly reduced to an empty stage`)
  if(support) actualSupportOccurrences+=actual.size; else actualTargetOccurrences+=actual.size
 }
 actualCrossStageViews++
}
assert.equal(actualCrossStageViews,34)
checks.push({name:'34 actual CrossStage target/support projections retain their complete native rendered tree',pass:true,actualCrossStageViews,actualTargetOccurrences,actualSupportOccurrences})

// These fixtures test machine scope policy. They are not real curriculum evidence.
const goal=(id:string,requires:string[]=[],tags:string[]=['GK','LK'])=>({id,title:id,titleEn:id,description:id,descriptionEn:id,contains:[],requires,type:'atomic',weight:1,tags,dimensionTags:{framework:'canonical-gymnasium-economics'}})
const fixture:any={landscapeId:economicId,title:'QS fixture',goals:[
 goal('m',[],['GK','LK','Orientation']),goal('a',['m']),goal('b',['a','p']),goal('p',['m']),goal('q',['m']),
 {...goal('t',['b','p'],['GK','LK','Practice','Assessment']),extendedData:{applicabilityFromRequires:true},examData:{coveredGoalIds:['a','b']}},
 {...goal('tlk',['b'],['LK','Practice','Assessment']),extendedData:{applicabilityFromRequires:true},examData:{coveredGoalIds:['b']}},
 {id:'terminal-cluster',title:'terminal',description:'terminal',contains:['t','tlk'],requires:[],type:'cluster',weight:2,tags:['GK','LK']}
]}
const entry=(id:string,role='target')=>({kind:'goalEntry',goalId:id,projectionRole:role})
const view:any={viewId:'qs-economics-whole-stage-fixture',landscapeId:economicId,
 scope:{schoolForm:'Gymnasium',stage:'CrossStage',jurisdiction:'DE-BE',courseProfile:'GK'},
 rootNodes:[{kind:'structure',id:'whole-view-root',label:'Economics QS Fixture',children:[entry('m'),
 {kind:'structure',id:'stage-one',label:'Sekundarstufe I',children:[entry('a'),entry('p','prerequisiteOnly')]},
 {kind:'structure',id:'stage-two',label:'Sekundarstufe II',children:[entry('b'),entry('q','prerequisiteOnly')]},
 entry('t'),entry('tlk')]}]}
const fixturePath=join(capsule,'curricula/DE/Gymnasium/composition-views/wirtschaft/fixture.view.json')
const compilation:any={reports:[{landscapeId:economicId,goals:fixture.goals.map((g:any)=>({goalId:g.id,compiledApplicability:{jurisdiction:['DE-BE']}}))}],summary:{supportedValues:['DE-BE']}}
const profile={...baseProfile,motivationAnchorGoalIds:['m'],terminalAutonomyClusterIds:['terminal-cluster']}
function check(v:any=view,l:any=fixture,p:any=profile,compiled:any=compilation) {
 writeFileSync(fixturePath,JSON.stringify(v)+'\n')
 const result=candidate.evaluateRouteProfile(l,p,compiled)
 return result.rules.find((r:any)=>r.id==='CQR-104')
}
const clone=(x:any)=>JSON.parse(JSON.stringify(x))
let result=check()
assert.equal(result.status,'pass',JSON.stringify(result))
assert.equal(result.metrics.visibleProjectedRouteTargetGoalOccurrences,2)
assert.equal(result.metrics.requiredTerminalAutonomyGoals,1)
checks.push({name:'whole CrossStage routes pass with both stages and explicit support; LK-only material stays outside GK',pass:true,native:result})
const rendered=candidate.collectRenderedAtomicGoalIdsFromCompositionView(fixture,fixturePath,['GK'],true,'CrossStage')
assert(rendered.has('p')&&rendered.has('q')&&rendered.has('a')&&rendered.has('b'))
const sekI=candidate.collectRenderedAtomicGoalIdsFromCompositionView(fixture,fixturePath,['GK'],true,'SekI')
assert(sekI.has('a')&&sekI.has('p')&&!sekI.has('b')&&!sekI.has('q'))
const sekII=candidate.collectRenderedAtomicGoalIdsFromCompositionView(fixture,fixturePath,['GK'],true,'SekII')
assert(sekII.has('b')&&sekII.has('q')&&!sekII.has('a')&&!sekII.has('p'))
checks.push({name:'actual explicit prerequisite-only references cross both stages only for CrossStage; SekI/SekII boundaries remain intact',pass:true})
const renamed=clone(view)
renamed.rootNodes[0].children[1].label='First editorial section'
renamed.rootNodes[0].children[2].label='Second editorial section'
assert.equal(check(renamed).status,'pass')
checks.push({name:'CrossStage root and all stage content do not depend on labels or fabricated phase inference',pass:true})
const noMotivation=clone(view)
noMotivation.rootNodes[0].children=noMotivation.rootNodes[0].children.filter((n:any)=>n.goalId!=='m')
result=check(noMotivation);assert.equal(result.status,'fail');assert(result.metrics.projectionScopesMissingMotivationAnchors>0)
checks.push({name:'negative: hidden motivation is never imported as a route',pass:true,native:result})
const noTerminal=clone(view)
noTerminal.rootNodes[0].children=noTerminal.rootNodes[0].children.filter((n:any)=>n.goalId!=='t')
result=check(noTerminal);assert.equal(result.status,'fail');assert(result.metrics.projectionScopesMissingTerminalAutonomyGoals>0)
checks.push({name:'negative: omitted applicable whole terminal fails closed',pass:true,native:result})
const missingSupport=clone(view)
missingSupport.rootNodes[0].children[1].children=missingSupport.rootNodes[0].children[1].children.filter((n:any)=>n.goalId!=='p')
const unflagged=clone(fixture);delete unflagged.goals.find((g:any)=>g.id==='t').extendedData
result=check(missingSupport,unflagged);assert.equal(result.status,'fail');assert(result.metrics.explicitTerminalPrerequisiteOccurrencesMissingFromProjection>0)
checks.push({name:'negative: every Economics terminal requires complete visible prerequisites even without an applicability flag',pass:true,native:result})
const selectorHidden=clone(fixture);selectorHidden.goals.find((g:any)=>g.id==='b').dimensionTags={}
selectorHidden.goals.find((g:any)=>g.id==='b').requires=[]
result=check(view,selectorHidden);assert.equal(result.status,'fail');assert.equal(result.metrics.visibleProjectedRouteTargetGoalOccurrences,2)
assert(result.metrics.visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector>0)
assert(result.metrics.profileSelectorExcludedGoalOccurrencesMissingDirectMotivationRoute>0)
checks.push({name:'negative: author profile selectors cannot hide actual ordinary target route gaps',pass:true,native:result})
const incompleteMaterial=clone(fixture);incompleteMaterial.goals.find((g:any)=>g.id==='t').requires=['a','p']
result=check(view,incompleteMaterial);assert.equal(result.status,'fail');assert(result.metrics.wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath>0)
checks.push({name:'negative: one convenient terminal prerequisite cannot license other whole-material assessed goals',pass:true,native:result})
const absentCovered=clone(fixture);absentCovered.goals.find((g:any)=>g.id==='t').examData.coveredGoalIds.push('missing-current-goal')
result=check(view,absentCovered);assert.equal(result.status,'fail');assert(result.metrics.wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath>0)
checks.push({name:'negative: nonexistent declared whole-material competency fails closed',pass:true,native:result})
const wrongCountry=clone(compilation);wrongCountry.reports[0].goals.find((g:any)=>g.goalId==='b').compiledApplicability.jurisdiction=['DE-NI']
result=check(view,fixture,profile,wrongCountry);assert.equal(result.status,'fail')
assert(result.metrics.wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath>0)
checks.push({name:'negative: another country competency cannot complete a whole terminal in the current jurisdiction',pass:true,native:result})
const doubled=clone(view);doubled.rootNodes.push({...clone(view.rootNodes[0]),id:'second-root'})
result=check(doubled);assert.equal(result.status,'fail');assert(result.metrics.projectionScopesWithInvalidStageStructure>0)
checks.push({name:'negative: ambiguous whole CrossStage root fails closed',pass:true,native:result})

// Verify unchanged native rendering for real protected-subject stage views.
let protectedStageComparisons=0
for(const [directory,filename] of [['mathematik','DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'],['physik','DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json']]) {
 let directoryComparisons=0
 const landscape=JSON.parse(readFileSync(join(repo,'curricula/DE/Gymnasium/canonical',filename),'utf8'))
 const folder=join(repo,'curricula/DE/Gymnasium/composition-views',directory)
 for(const file of readdirSync(folder).filter((f:string)=>f.endsWith('.view.json'))) {
  if(directoryComparisons>=12)break
  const path=join(folder,file), authored=JSON.parse(readFileSync(path,'utf8'))
  const filters=[authored.scope.courseProfile,authored.scope.durationModel].filter(Boolean)
  for(const stage of ['SekI','SekII'])for(const support of [false,true]){
   const a=original.collectRenderedAtomicGoalIdsFromCompositionView(landscape,path,filters,support,stage)
   const b=candidate.collectRenderedAtomicGoalIdsFromCompositionView(landscape,path,filters,support,stage)
   assert.deepEqual([...a].sort(),[...b].sort(),`${directory}/${file}/${stage}/${support} changed`)
   protectedStageComparisons++;directoryComparisons++
  }
 }
}
checks.push({name:'non-Economics profile definitions remain exact; protected-subject native single-stage rendering remains exact',pass:true,unchangedProfiles:originalProfiles.length,protectedStageComparisons})
writeFileSync(output,JSON.stringify({schemaVersion:1,status:'pass',checks,scientificGoalClosures:0,strictBindingRestorations:0,fixtureIsCurriculumEvidence:false},null,2)+'\n')
console.log(JSON.stringify({checks:checks.length,actualCrossStageViews,protectedStageComparisons,pass:true}))
