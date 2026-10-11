import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,writeGoalBookModel,stableGoalBookJson,parseAndValidateGoalBookModel,fingerprintSemanticKindSourceGoal} from './goalBookModel.ts'
import {buildApplicabilityCompilation} from './applicabilityCompiler.ts'
import {evaluateRouteProfile,evaluateGraphIntegrity,evaluateTypeConsistency,routeProfiles,buildAtomicDirectRequiresEdges,collectRenderedAtomicGoalIdsFromCompositionView} from './actual-all-route-quality-original-body-export-probe.ts'

const root='/home/enpasos/projects/skillpilot'
const old='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10'
const relative='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/seven-unnecessary-historical-exam-prerequisites-author-remedy-v11'
const base=root+'/'+relative
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const write=(name:string,data:unknown)=>writeFileSync(base+'/'+name,JSON.stringify(data,null,2)+'\n')
const sha=(data:string|Buffer)=>createHash('sha256').update(data).digest('hex')
const iso=read(base+'/actual-own-new-remedy-isolate-and-V10-before-guard.receipt.json').physicalIsolate
const canonicalPath=iso+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const before=read(base+'/whole-V10-CAN403.before.snapshot.json')
const after=read(base+'/whole-V11-CAN403-seven-prerequisites-removed.inert.candidate.json')
const ordinaryIds=read(base+'/selective-exact-seven-requires-removal.author.candidate.json').fieldChanges.flatMap((g:any)=>g.removeExactly)

const main=async()=>{
 const sem=structuredClone(read(root+'/'+old+'/candidate-semantic-kinds.current403.inert.json'))
 const semanticChanges:any[]=[]
 for(const goal of after.goals){const d=sem.decisions.find((d:any)=>d.goalId===goal.id);if(!d)throw Error('New semantic goal');const current=fingerprintSemanticKindSourceGoal(goal);if(current!==d.sourceFingerprint){semanticChanges.push({goalId:goal.id,semanticKind:d.semanticKind,before:d.sourceFingerprint,after:current});d.sourceFingerprint=current}}
 if(semanticChanges.length!==3||semanticChanges.some(d=>d.semanticKind!=='practiceAssessment'))throw Error('Unexpected semantic source change')
 write('candidate-semantic-kinds.current403.seven-edge-remedy.inert.json',sem)
 write('actual-three-practice-only-semantic-source-bindings.native.json',{schemaVersion:1,qualityApproval:false,newStrictClosures:0,allSemanticKindsAnd311DenominatorPreserved:true,changes:semanticChanges,meaning:'Native source fingerprints bind only the genuine proposed seven requires removals. Existing kind decisions and all ordinary-goal content decisions are retained; no author content or independent D approval is claimed.'})
 const profile=routeProfiles.find((p:any)=>p.profileId==='canonical-economics-crossstage')!
 const memoryConfig=read(root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-by-ten-current311-specific-native-preparation-technical-v1/current300-source35-scope2-contract479-selective-technical-v1/memory.config.json')
 const memoryRecords=readFileSync(root+'/'+memoryConfig.reviewPath,'utf8').split(/\r?\n/u).filter(Boolean).map(l=>JSON.parse(l)).filter((d:any)=>d.decision==='memory_required'||d.status==='memory_required')
 const routeResults:any[]=[]
 for(const [label,landscape] of [['V10-before',before],['V11-seven-edge-remedy',after]] as const){
  writeFileSync(canonicalPath,JSON.stringify(landscape,null,2)+'\n')
  const compilation=buildApplicabilityCompilation()
  const graph=evaluateGraphIntegrity(landscape,new Set(landscape.goals.map((g:any)=>g.id)))
  const type=evaluateTypeConsistency(landscape)
  const route=evaluateRouteProfile(landscape,profile,compilation)
  const edges=buildAtomicDirectRequiresEdges(landscape)
  const local:any[]=[]
  for(const course of ['GK','LK']){
   const viewPath=iso+'/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+course.toLowerCase()+'.view.json'
   const targets=collectRenderedAtomicGoalIdsFromCompositionView(landscape,viewPath,[course],false)
   const withPrerequisites=collectRenderedAtomicGoalIdsFromCompositionView(landscape,viewPath,[course],true)
   const reverse=new Map<string,string[]>()
   for(const [goalId,requires] of edges){if(!targets.has(goalId))continue;for(const req of requires)if(targets.has(req))reverse.set(req,[...(reverse.get(req)??[]),goalId])}
   const terminals=new Set<string>(profile.terminalAutonomyClusterIds.flatMap((id:string)=>landscape.goals.find((g:any)=>g.id===id)?.contains??[]).filter((id:string)=>targets.has(id)))
   const find=(start:string):string[]|null=>{const queue:Array<[string,string[]]>=[[start,[start]]],seen=new Set<string>();while(queue.length){const [id,path]=queue.shift()!;if(seen.has(id))continue;seen.add(id);if(terminals.has(id))return path;for(const next of reverse.get(id)??[])queue.push([next,[...path,next]])}return null}
   const selected=landscape.goals.filter((g:any)=>targets.has(g.id)&&profile.goalSelector(g))
   const memoryVisibility=memoryRecords.filter((d:any)=>targets.has(d.goalId)).map((d:any)=>({goalId:d.goalId,memoryGoalIds:d.memoryGoalIds,visibleMemoryGoalIds:(d.memoryGoalIds??[]).filter((id:string)=>targets.has(id)),satisfied:(d.memoryGoalIds??[]).some((id:string)=>targets.has(id))}))
   local.push({courseProfile:course,actualTargetAtomicIds:[...targets].sort(),actualPrerequisiteOnlyAtomicIds:[...withPrerequisites].filter(x=>!targets.has(x)).sort(),selectedOrdinaryGoalCount:selected.length,missingVisibleOnlyTerminalRoutes:selected.filter((g:any)=>!find(g.id)).map((g:any)=>({goalId:g.id,title:g.title})),sevenOwnerRoutes:ordinaryIds.map((id:string)=>({goalId:id,targetVisible:targets.has(id),visibleOnlyTerminalPath:targets.has(id)?find(id):null})),keptRequiredMemoryVisibility:memoryVisibility,viewWholeSHA256:sha(readFileSync(viewPath))})
  }
  routeResults.push({label,wholeCanonicalSHA256:sha(readFileSync(canonicalPath)),route,graph,type,local})
 }
 write('actual-V10-before-V11-after-native-global-GK-LK-graph-route.report.json',{schemaVersion:1,kind:'actual-original-native-body-targeted-seven-edge-remedy-route-check',qualityApproval:false,newStrictClosures:0,liveWrites:[],noNativeRuleThresholdOrScopeFlagChanges:true,results:routeResults})
 const memoryComparison=routeResults[0].local.map((beforeScope:any)=>{const afterScope=routeResults[1].local.find((s:any)=>s.courseProfile===beforeScope.courseProfile);return{courseProfile:beforeScope.courseProfile,wholeVisibilityRowsExact:stableGoalBookJson(beforeScope.keptRequiredMemoryVisibility)===stableGoalBookJson(afterScope.keptRequiredMemoryVisibility),actualRequiredVisibilityChecks:afterScope.keptRequiredMemoryVisibility.length,missingRequiredMemory:afterScope.keptRequiredMemoryVisibility.filter((x:any)=>!x.satisfied),viewWholeBytesExact:beforeScope.viewWholeSHA256===afterScope.viewWholeSHA256}})
 if(memoryComparison.some((r:any)=>!r.wholeVisibilityRowsExact||r.missingRequiredMemory.length||!r.viewWholeBytesExact))throw Error('Memory visibility changed')
 write('actual-retained-memory-required-goal-and-visible-card-support-bindings.targeted.json',{schemaVersion:1,qualityApproval:false,newStrictClosures:0,unchangedMemoryDecisionsRetained:true,noMemoryCardsOrMemoryGoalsOrOrdinarySemanticFieldsChanged:true,actualScopeChecks:memoryComparison,scopeMeaning:'Only the possible visibility/context impact of the three practice-goal prerequisite edits is compared. No historical memory suitability or card-content review is restarted.'})
 const beforeModel=parseAndValidateGoalBookModel(read(root+'/'+old+'/whole-current311-after-final403-with-all-P311.book-model.json'))
 const afterModel=(await loadGoalBookBuildInputs(relative+'/book-config.current311-preserved-all-P311.inert.json',iso)).model
 await writeGoalBookModel(afterModel,base+'/whole-current311-after-seven-exam-prerequisites-removed.P311.book-model.json')
 const by=new Map(afterModel.pages.map(p=>[p.goalId,p]))
 const rows=beforeModel.pages.map(p=>{const n=by.get(p.goalId)!;const fields=Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((n as any)[k]));return{goalId:p.goalId,changedFields:fields,wholeEqual:fields.length===0,beforeWholeOwnerPageSHA256:sha(stableGoalBookJson(p)),afterWholeOwnerPageSHA256:sha(stableGoalBookJson(n))}})
 const changed=rows.filter(r=>!r.wholeEqual)
 if(changed.length!==7||changed.some(r=>!ordinaryIds.includes(r.goalId)))throw Error('Unexpected ownerpage impact')
 write('actual-native-P311-V10-to-V11-seven-ownerpage-context-impact.json',{schemaVersion:1,qualityApproval:false,newStrictClosures:0,beforeModelDigest:beforeModel.digest,afterModelDigest:afterModel.digest,beforePages:beforeModel.pages.length,afterPages:afterModel.pages.length,beforeFullP2Profiles:beforeModel.pages.filter(p=>p.evidenceReview).length,afterFullP2Profiles:afterModel.pages.filter(p=>p.evidenceReview).length,affectedOwnerpages:changed,wholeUnchangedOwnerpages:rows.filter(r=>r.wholeEqual).length,rows})
 const evidence=afterModel.source.evidenceReviewSources.flatMap(s=>readFileSync(iso+'/'+s.path,'utf8').split(/\r?\n/u).filter(Boolean).map(line=>JSON.parse(line)))
 if(evidence.length!==311||evidence.some(p=>p.schemaVersion!==2||p.reviewAuthority!=='ai_candidate'||p.status!=='needs_human_review'||p.evidenceLevel!=='E1'||p.maximumClaimScope!=='G1'))throw Error('P311 authority drift')
 write('actual-seven-affected-whole-ownerpages-canonical-P2-and-before-after-contexts.json',{schemaVersion:1,qualityApproval:false,rows:changed.map(row=>({goalId:row.goalId,scope:'Only removal of genuine unneeded historical-exam reverse prerequisite; retain actual V10 D content/P2/case/image judgments, including historical dissent and its author remedy.',wholeCanonicalGoal:after.goals.find((g:any)=>g.id===row.goalId),wholeBeforeOwnerpage:beforeModel.pages.find(p=>p.goalId===row.goalId),wholeAfterOwnerpage:by.get(row.goalId),wholeCurrentPositiveV2Record:evidence.find(p=>p.goalId===row.goalId)}))})
 console.log(JSON.stringify({nativeGraph:routeResults[1].graph.status,nativeType:routeResults[1].type.status,routeRules:routeResults[1].route.rules.map((r:any)=>({id:r.id,status:r.status,metrics:r.metrics})),local:routeResults[1].local.map((s:any)=>({course:s.courseProfile,missing:s.missingVisibleOnlyTerminalRoutes})),memory:memoryComparison,book:{pages:afterModel.pages.length,P311:evidence.length,changed:changed.length,wholeUnchanged:rows.length-changed.length,digest:afterModel.digest}},null,2))
}
main().catch(error=>{console.error(error);process.exitCode=1})
