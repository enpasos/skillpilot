// SPDX-License-Identifier: Apache-2.0
// Current native input verification; independent release/offer votes are separate receipts.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
async function main() {
 const [repositoryArg,outputArg]=process.argv.slice(2)
 if(!repositoryArg||!outputArg)throw Error('Usage: measure-current-offer-context.ts <repository> <fresh-output>')
 const root=path.resolve(repositoryArg),output=path.resolve(outputArg)
 assert(!fs.existsSync(output),'Choose a fresh output; retained receipts are immutable')
 const load=(p:string)=>import(pathToFileURL(path.join(root,p)).href)
 const {createRouteProfiles,evaluateRouteProfile,collectRenderedAtomicGoalIdsFromCompositionView}=await load('app/scripts/generateCurriculumQualityStatus.ts')
 const {buildApplicabilityCompilation}=await load('app/scripts/applicabilityCompiler.ts')
 const captured=new Map<string,Buffer>(),bytes=(p:string)=>{if(!captured.has(p))captured.set(p,fs.readFileSync(path.join(root,p)));return captured.get(p)!}
 const hash=(raw:string|Buffer)=>createHash('sha256').update(raw).digest('hex')
 const sha=(p:string)=>hash(bytes(p)),read=(p:string)=>JSON.parse(bytes(p).toString('utf8'))
 const valueSha=(value:any):string=>{
  const sorted=(v:any):any=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v
  return hash(JSON.stringify(sorted(value)))
 }
 const prefix='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/'
 const selectionPath=prefix+'views/lower-closures-v5/closing-task-selection.actual.json',selection=read(selectionPath)
 assert.equal(selection.state,'active-approved-selection','A planned scenario is not an activated acceptance record')
 const approved=new Set<string>(selection.approvedAssessmentGoalIds)
 const referencePath=prefix+'views/lower-closures-v4/baseline-reference-places.actual.json',references=read(referencePath)
 assert.equal(references.baselineCommit,'a4923a80928e4211c02fb53feaadad2054a3fb94')
 const newlyActive=new Set<string>(selection.newlyActiveAssessmentGoalIds);assert.deepEqual([...newlyActive],['d8fc6295-d0db-59e5-bd90-080bbc508c3a'])
 const sourcePolicyPath='scripts/generate_laender_physics_stage_views.sources.json',policy=read(sourcePolicyPath)
 const canonicalDir='curricula/DE/Gymnasium/canonical',files=fs.readdirSync(path.join(root,canonicalDir)).filter(n=>n.endsWith('.json')).sort().map(n=>canonicalDir+'/'+n)
 const entries=files.map(file=>({file:path.join(root,file),landscape:read(file)})),catalog=entries.map(r=>r.landscape)
 const physics=catalog.find(l=>l.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a')!,all=new Map<string,any>(catalog.flatMap(l=>l.goals.map(g=>[g.id,g])))
 const directory='curricula/DE/Gymnasium/composition-views/physik',viewPaths=fs.readdirSync(path.join(root,directory)).filter(n=>n.endsWith('.view.json')).sort().map(n=>directory+'/'+n)
 for(const p of viewPaths)bytes(p)
 for(const p of ['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/lib/compositionStageRouteMembership.ts','app/src/utils/compositionViewRuntime.ts','app/src/utils/authoring/compositionViewAuthoring.ts'])bytes(p)
 const allTasks=[{name:'K1',id:'d8fc6295-d0db-59e5-bd90-080bbc508c3a',covered:'53afbda1-5776-502b-8867-471975d7b766',states:['DE-HH','DE-TH']},
              {name:'K2',id:'b50e9903-58b3-520d-96bf-d5bc1fe51ebf',covered:'ecbaa101-cb10-5da3-9368-ae40ff587d74',states:['DE-BW']}]
 const tasks=allTasks.filter(t=>approved.has(t.id))
 assert.equal(tasks.length,approved.size)
 const formPath='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/k1-v4/exam-strand-successor.actual.json',form=read(formPath);assert.equal(sha(formPath),'7010c0d0a04096437ed7af34078cfe4f5b2cdfd724d1f982fa97232091e3f60d');assert.equal(sha(form.predecessorForm.path),form.predecessorForm.sha256);const previousForm=read(form.predecessorForm.path)
 const formById=new Map<string,any>(form.currentGoals.map(r=>[r.goalId,r]))
 for(const task of tasks){
  const record=formById.get(task.id),goal=all.get(task.id);assert(record)
  for(const key of ['reviewedCandidate','contentReview','releasedGoal','sourceArtifact','reviewedSourceArtifact','previousReleasedGoal','metadataReview'])assert.equal(sha(record[key].path),record[key].sha256)
  const reviewed=read(record.reviewedCandidate.path);assert.deepEqual(goal,read(record.releasedGoal.path))
  assert.deepEqual(record.beforeCoveredStrands,[]);assert.deepEqual(record.currentCoveredStrands,['LI_BEWEGUNG']);assert.deepEqual(goal.examData.coveredStrands,record.currentCoveredStrands);assert.deepEqual(reviewed.examData.coveredStrands,record.beforeCoveredStrands);const prior=read(record.previousReleasedGoal.path);const priorCopy=JSON.parse(JSON.stringify(prior));priorCopy.examData.coveredStrands=['LI_BEWEGUNG'];assert.deepEqual(goal,priorCopy,'Strand successor changed more than the reviewed metadata field')
  assert.equal(hash(JSON.stringify(goal)),record.currentCanonicalPayloadSha256)
  assert.deepEqual(goal.requires,reviewed.requires)
  assert.deepEqual(physics.goals.filter(g=>(g.contains??[]).includes(task.id)).map(g=>g.id),[record.currentParentGoalId]);assert.equal(record.currentParentGoalId,'bf980fff-b62b-4ea4-a20d-31681a7ad785')
  assert.deepEqual([...new Set(goal.tags)].sort(),[...new Set([...reviewed.tags,'SekI'])].sort())
  for(const [key,digest] of Object.entries(record.unchangedExamFields)){assert.equal(hash(JSON.stringify(goal.examData[key])),digest);assert.equal(hash(JSON.stringify(reviewed.examData[key])),digest)}
  const strip=(g:any)=>{const copy=JSON.parse(JSON.stringify(g));for(const key of ['title','titleEn','description','descriptionEn','tags'])delete copy[key];delete copy.examData.sourceArtifactPath;delete copy.examData.coveredStrands;return copy}
  assert.deepEqual(strip(goal),strip(reviewed));assert.equal(goal.examData.sourceArtifactPath,record.sourceArtifact.path)
 }
 const taskIds=new Set(tasks.map(t=>t.id)),profile=createRouteProfiles(root).find(p=>p.profileId==='canonical-physics-sek1')!
 assert.deepEqual(allTasks.filter(t=>physics.goals.some(g=>g.id===t.id)).map(t=>t.id).sort(),[...approved].sort())
 assert.equal(valueSha(read(formById.get('b50e9903-58b3-520d-96bf-d5bc1fe51ebf').reviewedCandidate.path)),selection.baselineGoalValueDigests['b50e9903-58b3-520d-96bf-d5bc1fe51ebf'],'Previously accepted K2 scored candidate changed')
 assert.deepEqual(allTasks.filter(t=>(profile.terminalAutonomyGoalIds??[]).includes(t.id)).map(t=>t.id).sort(),[...approved].sort())
 const closure=(seed:Iterable<string>)=>{const seen=new Set<string>(),pending=[...seed];while(pending.length){const id=pending.pop()!;if(seen.has(id))continue;seen.add(id);assert(all.has(id),id);pending.push(...(all.get(id).requires??[]).map(r=>r.split(':').at(-1)!))}return seen}
 const selected=(p:string,includeSupport=false)=>{const v=read(p);return collectRenderedAtomicGoalIdsFromCompositionView(physics,path.join(root,p),[v.scope.courseProfile,v.scope.durationModel].filter(Boolean),includeSupport,'CrossStage',profile.motivationAnchorGoalIds,catalog)}
 const rows=[],allViewChecks=[]
 for(const p of viewPaths){
  const view=read(p),targets=selected(p),baseline=references.views.find(r=>r.path===p);assert(baseline,p)
  const oldRefs=[]
  const visit=(nodes:any[],trail:string[]=[])=>{for(const n of nodes){if(n.kind==='structure')visit(n.children,[...trail,n.id]);else if(!newlyActive.has(n.goalId))oldRefs.push({path:trail,reference:n})}}
  visit(view.rootNodes)
  // Python baseline uses ASCII JSON with sorted keys; match its exact bytes, including surrogate escaping.
  const asciiJson=(value:any):string=>{
   const sorted=(v:any):any=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v
   return JSON.stringify(sorted(value)).replace(/[\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'))
  }
  assert.equal(oldRefs.length,baseline.referenceCount,p)
  assert.equal(hash(asciiJson(oldRefs)),baseline.orderedReferencePlacesSha256,p)
  allViewChecks.push({path:p,viewId:view.viewId,sha256:sha(p),allOldReferencePayloadsPathsAndOrderUnchanged:true,oldReferenceCount:oldRefs.length})
  for(const task of allTasks){
   const expected=approved.has(task.id)&&task.states.includes(view.scope.jurisdiction)&&['CrossStage','SekI'].includes(view.scope.stage)
   assert.equal(targets.has(task.id),expected,view.viewId+' '+task.name)
   if(!expected)continue
   const authorityPath=directory+'/de-'+view.scope.jurisdiction.slice(3).toLowerCase()+'-seki.view.json',authority=read(authorityPath),authorityS=selected(authorityPath)
   const currentS=new Set([...authorityS].filter(id=>targets.has(id))),baseS=new Set([...currentS].filter(id=>!newlyActive.has(id)))
   const baseL=closure([...baseS,...profile.motivationAnchorGoalIds]),currentL=closure([...currentS,...profile.motivationAnchorGoalIds]),demand=closure([task.covered]),exposed=selected(p,true)
   const missing=[...demand].filter(id=>!baseL.has(id)),unexposed=[...demand].filter(id=>!exposed.has(id))
   assert.deepEqual(missing,[]);assert.deepEqual(unexposed,[]);assert(baseS.has(task.covered))
   assert.deepEqual(all.get(task.id).requires,[task.covered]);assert.deepEqual(all.get(task.id).examData.coveredGoalIds,[task.covered])
   const places=(id:string)=>{const found=[];const visit=(nodes:any[],trail:any[]=[])=>{for(const n of nodes){if(n.kind==='structure')visit(n.children,[...trail,{id:n.id,label:n.label}]);else if(n.goalId===id&&n.projectionRole!=='prerequisiteOnly')found.push({kind:n.kind,role:n.projectionRole??'target',path:trail})}};visit(view.rootNodes);return found}
   const taskPlaces=places(task.id),coveredPlaces=places(task.covered)
   assert.equal(taskPlaces.length,1);assert.equal(coveredPlaces.length,1)
   assert(taskPlaces[0].path.some(n=>n.id==='physics-seki'||n.id==='physics-bw-seki'))
   const temporal=(place:any)=>place.path.find(n=>n.id.includes('-unit-')||n.id.includes('-year-'))?.id
   assert(temporal(taskPlaces[0]));assert.equal(temporal(taskPlaces[0]),temporal(coveredPlaces[0]))
   rows.push({taskName:task.name,assessmentGoalId:task.id,coveredGoalId:task.covered,canonicalGoalValueSha256:valueSha(all.get(task.id)),currentCanonicalPayloadSha256:hash(JSON.stringify(all.get(task.id))),formEquivalence:{path:formPath,sha256:sha(formPath)},requires:[task.covered],coveredGoalIds:[task.covered],viewId:view.viewId,viewPath:p,viewSha256:sha(p),scope:view.scope,
    lowerAuthority:{viewId:authority.viewId,path:authorityPath,sha256:sha(authorityPath)},currentLowerStageTargetGoalIds:[...currentS].sort(),currentLowerStageLearningBasisGoalIds:[...currentL].sort(),preExistingLowerStageTargetGoalIds:[...baseS].sort(),preExistingLowerStageLearningBasisGoalIds:[...baseL].sort(),completeTaskDemandGoalIds:[...demand].sort(),missingTaskDemandGoalIds:missing,unexposedTaskDemandGoalIds:unexposed,
    actualTaskTargetPlaces:taskPlaces,actualCoveredTargetPlaces:coveredPlaces,visibleDirectRequiresPath:[task.id,task.covered],
    sourceGoalAssignments:policy.reviewedMomentumBindings.targets.filter(t=>t.state===view.scope.jurisdiction.slice(3)&&t.goalId===task.covered)})
  }
 }
 assert.equal(viewPaths.length,90);assert.equal(rows.length,selection.expectedActualOfferCount)
 const changed=allViewChecks.filter(r=>r.sha256!==references.views.find(b=>b.path===r.path).sha256).map(r=>r.path).sort();assert.deepEqual(changed,[...selection.expectedChangedPhysicsViewPaths].sort())
 const applicability=buildApplicabilityCompilation(entries),rule=evaluateRouteProfile(physics,profile,applicability,catalog,viewPaths.map(p=>path.join(root,p))).rules.find(r=>r.id==='CQR-104')!
 assert.equal(rule.status,selection.expectedCqr104Status,JSON.stringify(rule));assert.equal(rule.metrics.evaluatedProjectionScopes,106)
 const remaining=selection.expectedUnresolvedRouteCount
 const terminalCounts=new Set(['projectionScopesMissingEffectiveTerminalRoutes','projectionScopesMissingDirectTerminalRoutes','visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute','visibleSelectedGoalOccurrencesMissingDirectTerminalRoute','profileSelectorExcludedGoalOccurrencesMissingEffectiveTerminalRoute','profileSelectorExcludedGoalOccurrencesMissingDirectTerminalRoute'])
 const terminalUnique=new Set(['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute','uniqueVisibleSelectedGoalsMissingDirectTerminalRoute'])
 const remainingGoals=new Set(selection.expectedUnresolvedRoutes.map(r=>r.goalId))
 for(const [key,value] of Object.entries(rule.metrics)){
  if(terminalCounts.has(key))assert.equal(value,remaining,key)
  else if(terminalUnique.has(key))assert.equal(value,remainingGoals.size,key)
  else if(/missing|invalid|unexpected|incomplete|without/i.test(key))assert.equal(value,0,key)
 }
 assert.equal(rule.metrics.visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks,0)
 const expectedDetails=selection.expectedUnresolvedRoutes.flatMap(r=>['effective','direct'].map(kind=>'No projection-local '+kind+' terminal route: '+r.viewPath+' ['+r.jurisdiction+']: '+r.goalId))
 assert.deepEqual([...(rule.details??[])].sort(),expectedDetails.sort())
 const contentReceipts=tasks.map(t=>{const p='curricula/DE/Gymnasium/quality/assessment-review/physik/e2-lower-momentum-closures-20261125-v1/'+t.id+(t.name==='K1'?'/content-review-v4.actual.json':'/content-review.actual.json');bytes(p);return{goalId:t.id,path:p,sha256:sha(p),canonicalGoalValueSha256:valueSha(all.get(t.id)),currentCanonicalPayloadSha256:hash(JSON.stringify(all.get(t.id))),reviewedCandidate:formById.get(t.id).reviewedCandidate,formEquivalence:{path:formPath,sha256:sha(formPath)}}})
 const inputs=[...captured].map(([p,raw])=>({path:p,sha256:hash(raw)}))
 for(const input of inputs)assert.equal(hash(fs.readFileSync(path.join(root,input.path))),input.sha256,'Concurrent input edit '+input.path)
 const report={schemaVersion:1,technicalEpoch:5,rubricVersions:{K1:4,K2:3},nativePredecessor:{path:prefix+'views/lower-closures-v4/current-offer-context.actual.json',sha256:sha(prefix+'views/lower-closures-v4/current-offer-context.actual.json')},status:remaining?'UNRESOLVED_ROUTE_GAPS':'PASS',nativeInputChecks:'PASS',integrationComplete:remaining===0,remainingRouteGapCount:remaining,selection:{path:selectionPath,sha256:sha(selectionPath),approvedAssessmentGoalIds:[...approved].sort()},contract:'e2-release-metadata-epoch5-current-native-offer-context-v1',measuredAt:new Date().toISOString(),method:'Actual native target projections with exact neutral SekI authority intersection, full unpruned prerequisite closure, all90 a492 authored reference payload/path/order invariants, including the already active K2, and actual configured CQR104. Independent content/offer votes are separate receipts.',goalValueDigestFormat:'canonicalGoalValueSha256: SHA256 UTF8 JSON.stringify with recursively sorted keys; currentCanonicalPayloadSha256: SHA256 UTF8 natural JSJSON.stringify(raw canonical goal), matching sealed form receipt',bounds:{ownTaskOffersOnly:true,officialTaskClaim:false,hessenExcluded:true,newCurricularTargets:0},contentReceipts,rows,allViewChecks,cqr104:rule,sourcePolicy:{path:sourcePolicyPath,sha256:sha(sourcePolicyPath)},referencePredecessor:{path:referencePath,sha256:sha(referencePath)},inputs,
  reviewBoundary:'This verifies exact current inputs and routes. The shared independent offer receipt binds this snapshot; it is not bound back here, avoiding a cyclic approval chain.'}
 fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'})
 console.log(JSON.stringify({status:report.status,nativeInputChecks:'PASS',remainingRouteGaps:remaining,views:90,oldReferenceCount:allViewChecks.reduce((n,r)=>n+r.oldReferenceCount,0),offers:rows.length,missing:0,unexposed:0,cqr104:rule.status,projectionScopes:rule.metrics.evaluatedProjectionScopes,output}))
}
main().catch(error=>{console.error(error);process.exit(1)})
