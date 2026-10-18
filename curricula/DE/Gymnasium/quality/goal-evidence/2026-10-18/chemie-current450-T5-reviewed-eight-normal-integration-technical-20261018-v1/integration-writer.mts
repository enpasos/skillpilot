// SPDX-License-Identifier: Apache-2.0
// Prepared for root review/run. Default is CHECK ONLY. No normal writes in that mode.
// Example after reviewing the current (possibly post-T2) baseline:
// app/node_modules/.bin/tsx tmp/integrate_chemie450_T5_v3_reviewed_eight.mts \
//   --expected-canonical-sha256=<reviewed-current-sha> --expected-node-count=<count> --check-only
// Add --write for the separately reviewed one-shot normal integration.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {convertLearningGoal} from '../app/src/goalTypes';
import {applyCompositionViewProjection} from '../app/src/utils/compositionViewRuntime';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../app/src/utils/authoring/compositionViewAuthoring';
import {buildDirectChildrenMap,getRenderedChildIds} from '../app/src/utils/treeProjectionRuntime';
import {goalMatchesFilters} from '../app/src/utils/goalFilters';
import {intersectApplicabilityJurisdictions} from '../app/scripts/applicabilityCompiler';
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel';

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/';
const author2=base+'chemie-current450-T5-terminal-exams-author-20261018-v2/';
const author3=base+'chemie-current450-T5-terminal-exams-author-20261018-v3/';
const reviewDir=base+'chemie-current450-T5-terminal-exams-independent-a-20261018-v1/';
const firstPath=reviewDir+'FIRST.full-eight-bodies-materials-current-P-independent-a.json';
const followupPath=reviewDir+'FOLLOWUP.actual-v3-four-task-fields-and-current41-independent-a.json';
const closurePath=reviewDir+'SEAL.full-eight-v3-independent-a-closure.json';
const candidatePath=author3+'AUTHOR.eight-complete-exam-goals.draft.json';
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const out=base+'chemie-current450-T5-reviewed-eight-normal-integration-technical-20261018-v1';
const checkDir='tmp/chemie450-T5-v3-root-integration-preflight';
const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
const dump=(x:any)=>JSON.stringify(x,null,2)+'\n';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length}};
const must=(condition:any,message:string):void=>{if(!condition)throw new Error(message)};
function equal(a:any,b:any,message:string){must(isDeepStrictEqual(a,b),message)}
const args=process.argv.slice(2);
const allowed=/^(--write|--check-only|--expected-canonical-sha256=[a-f0-9]{64}|--expected-node-count=\d+)$/;
must(args.every(a=>allowed.test(a)),'Unknown/malformed argument. Supply exact reviewed baseline hash/node count and --check-only or --write.');
must(!(args.includes('--write')&&args.includes('--check-only')),'Choose one mode: --check-only or --write.');
const writeMode=args.includes('--write');
const expectedSHA=args.find(a=>a.startsWith('--expected-canonical-sha256='))?.split('=')[1];
const expectedNodes=Number(args.find(a=>a.startsWith('--expected-node-count='))?.split('=')[1]);
must(expectedSHA&&Number.isInteger(expectedNodes)&&expectedNodes>=708,'Explicit reviewed --expected-canonical-sha256 and --expected-node-count>=708 are required.');
must(!existsSync(out),'Refusing to overwrite existing T5 integration evidence directory: '+out);
equal(pin(canonical).sha256,expectedSHA,'Current canonical raw SHA differs from the explicitly reviewed root baseline.');

// Fixed review/candidate pins are independent of later, reviewed normal T2 integration.
const fixedPins=[
 {path:author2+'FREEZE.author.sha256.json',sha256:'962eda4885e3238e09e3e505ccc48038ea89bc40cd4c4546cca97875f95edef0'},
 {path:author3+'FREEZE.author.sha256.json',sha256:'fed530be2dbd800cab50e79dd9e91b3f867717014f5759efdeae2268886b2d91'},
 {path:candidatePath,sha256:'d45026771792c7255ef8c2f8289633d94fc96cd97941e69b4c928c0321228070'},
 {path:firstPath,sha256:'7b076a9b8034bf272a21aee21c6bc5386af7e1d432279f1a42959a103b880093'},
 {path:followupPath,sha256:'184f2c1f57984d4dba9cb3bc2d3821d7f486e39c240d75932451480fb669468a'},
 {path:closurePath,sha256:'41984046181f6aede11dd4bccb0992f9b6d5b1abb09c12abe4602a1aee1b6df8'},
];
for(const f of fixedPins)equal(pin(f.path).sha256,f.sha256,'Fixed review/candidate pin changed: '+f.path);
for(const prefix of [author2,author3])for(const f of read(prefix+'FREEZE.author.sha256.json').files){
 const p=prefix+f.path;equal(pin(p),{path:p,sha256:f.sha256,bytes:f.bytes},'Sealed author input changed: '+p);
}
const first=read(firstPath),followup=read(followupPath);
equal(first.scope.wholeNewExamBodies,8,'Own substantive FIRST is not the complete eight-body review.');
equal(first.scope.wholeOriginalMaterialCasesActuallyRead,32,'Own substantive FIRST is not the complete32-material review.');
equal(followup.verdict,'ACCEPT_ALL_EIGHT_V3_TASK_DESIGNS_AND_CURRENT_INTERFACES','Bounded follow-up does not accept current eight bodies.');
equal(followup.candidateWhole8.sha256,pin(candidatePath).sha256,'Bounded follow-up accepts different whole-eight SHA.');
equal(followup.candidateWhole8.bytes,pin(candidatePath).bytes,'Bounded follow-up accepts different whole-eight length.');
must(followup.findingsResolved.length===2&&followup.findingsResolved.every((r:any)=>r.status==='CLOSED'),'The two actual FIRST findings are not both closed.');
equal(followup.effectiveClosure.wholeV3BodiesAccepted,8,'Full-eight effective review closure is missing.');
equal(followup.effectiveClosure.remainingT5ScientificTaskOrOperativeInterfaceHolds,0,'T5 substantive or operative holds remain.');

const viewDir='curricula/DE/Gymnasium/composition-views/chemie/';
const viewPaths=readdirSync(viewDir).filter(n=>n.endsWith('.view.json')).sort().map(n=>viewDir+n);
equal(viewPaths.length,41,'Unexpected Chemistry composition-view universe; review new scopes before integration.');
const beforeRaw=readFileSync(canonical,'utf8'),before=JSON.parse(beforeRaw),after=structuredClone(before);
equal(before.goals.length,expectedNodes,'Current canonical node count differs from the reviewed root baseline.');
const semRaw=readFileSync(semantic,'utf8'),sem=JSON.parse(semRaw),semBefore=structuredClone(sem);
const beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]));
equal(beforeBy.size,before.goals.length,'Current canonical contains duplicate stable goal IDs.');
equal(sem.counts.total,before.goals.length,'Current semantic-kind total and canonical node count differ.');
equal(sem.counts.curricularAtomic,450,'The reviewed450 ordinary-goal floor changed.');
const ordinaryIds=sem.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId);
equal(ordinaryIds.length,450,'Current semantic decisions do not contain exactly450 ordinary goals.');
const inputs=[canonical,semantic,registry,...fixedPins.map(r=>r.path),author2+'INPUT.whole-current-fourteen-end-and-four-support-goals-and-P.json',author2+'PROPOSAL.five-exact-view-child-array-append-CAS.draft.json',author2+'PROPOSAL.placement-and-applicability.draft.json',...viewPaths].map(pin);
const protectedPaths=[...new Set<string>(read(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath]))];
const protectedInputs=protectedPaths.map(pin);
const currentContext:any[]=[];
const sourceRecords=read(author2+'INPUT.whole-current-fourteen-end-and-four-support-goals-and-P.json').records;
equal(sourceRecords.length,18,'T5 current C/P context must contain14 end goals and4 support goals.');
equal(sourceRecords.filter((r:any)=>r.supportOnly).length,4,'Unexpected support-only boundary.');
for(const r of sourceRecords){
 equal(beforeBy.get(r.goal.id),r.goal,'Whole ordinary source context changed: '+r.goal.id);
 equal(pin(r.PRecordFile.path),r.PRecordFile,'Native positive-profile raw file changed: '+r.PRecordFile.path);
 const row=readFileSync(r.PRecordFile.path,'utf8').split(/\r?\n/)[r.PLine-1];
 must(row,'Native P row missing: '+r.goal.id+' line'+r.PLine);
 equal(JSON.parse(row),r.wholePRecord,'Whole native positive record changed: '+r.goal.id);
 currentContext.push({goalId:r.goal.id,supportOnly:r.supportOnly,wholeCurrentGoalExact:true,wholeNativePRecordExact:true,nativeFile:r.PRecordFile,lineOneBased:r.PLine});
}
const proposal=read(author2+'PROPOSAL.placement-and-applicability.draft.json');
const operations=read(author2+'PROPOSAL.five-exact-view-child-array-append-CAS.draft.json').operations;
equal(operations.length,5,'T5 must alter exactly five reviewed view child arrays.');
const candidate=read(candidatePath);
equal(candidate.length,8,'T5 candidate is not exactly eight assessments.');
equal(candidate.map((g:any)=>g.id),proposal.containsAppend,'Author parent append differs from the reviewed eight endpoints.');
const candidateIds=new Set<string>(candidate.map((g:any)=>g.id));
const directIds=new Set<string>();
for(const g of candidate){
 must(!beforeBy.has(g.id),'T5 endpoint already normal; duplicate integration refused: '+g.id);
 equal(g.type,'atomic','Nonatomic new assessment: '+g.id);equal(g.contains,[],'New assessment unexpectedly contains goals: '+g.id);
 equal(g.requires,g.examData.coveredGoalIds,'Direct all-of requires differs from whole assessed goals: '+g.id);
 equal(g.extendedData.applicabilityFromRequires,true,'Missing assessment-requires applicability boundary: '+g.id);
 equal(g.extendedData.applicabilityMappingInheritance,'boundary','Missing inherited source-mapping boundary: '+g.id);
 equal(g.examData.reviewStatus,'draft','Reviewed draft exam status changed: '+g.id);
 equal(g.examData.scoring.maxPoints,g.examData.scoring.passingPoints,'Compensatory practical pass introduced: '+g.id);
 equal(g.examData.scoring.maxPoints,g.examData.scoring.steps.reduce((n:number,s:any)=>n+s.points,0),'Scoring maximum differs from essential sum: '+g.id);
 must(g.examData.scoring.steps.every((s:any)=>s.points===2),'Essential two-point rubric changed: '+g.id);
 const review=followup.perExamDecisions.find((r:any)=>r.examId===g.id);
 equal(review?.verdict,'ACCEPT_COMPLETE_V3_BODY_AND_CURRENT_INTERFACE','No actual current body/interface acceptance for '+g.id);
 for(const id of g.requires){must(beforeBy.has(id),'New assessment prerequisite absent: '+id);directIds.add(id)}
 const computed=intersectApplicabilityJurisdictions(g.requires.map((id:string)=>beforeBy.get(id).applicability));
 equal(g.applicability?.jurisdiction,computed,'Materialised all-of jurisdiction intersection changed: '+g.id);
}
equal(directIds.size,14,'T5 directly assessed goal universe is not14.');
for(const r of sourceRecords.filter((r:any)=>r.supportOnly))must(!directIds.has(r.goal.id),'Support-only goal falsely directly assessed: '+r.goal.id);
const parentId=proposal.neutralParentId,parent=after.goals.find((g:any)=>g.id===parentId);
must(parent,'Neutral assessment parent is absent: '+parentId);
const parentBefore=structuredClone(parent);
must(!ordinaryIds.includes(parentId),'Refusing to alter an ordinary scientific goal as assessment parent.');
for(const id of candidateIds)must(!parent.contains.includes(id),'Endpoint already linked from assessment parent: '+id);
parent.contains.push(...candidate.map((g:any)=>g.id));
const added=candidate.map((g:any)=>{
 const x=structuredClone(g),a=x.extendedData.authorProposal;
 must(a&&typeof a.status==='string','Missing author status metadata on '+g.id);
 a.authoredStatus=a.status;a.status='INTEGRATED_MACHINE_REVIEWED_ASSESSMENT_DESIGN';
 x.extendedData.assessmentDesignReview={fullEightFIRST:firstPath,boundedV3Followup:followupPath,closureSeal:closurePath,scopeIntegrationReceipt:out+'/RECEIPT.actual-T5-eight-assessment-integration.json',ordinaryScienceReapproval:false,actualLearnerExecution:false,humanApproval:false,humanTrial:false,localSafetyRelease:false};
 equal(x.examData,g.examData,'Integration modified the reviewed draft examData: '+g.id);return x;
});
after.goals.push(...added);
const afterBy=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
equal(afterBy.size,before.goals.length+8,'Duplicate canonical IDs after candidate construction.');
for(const id of ordinaryIds)equal(afterBy.get(id),beforeBy.get(id),'Ordinary450 scientific semantics changed: '+id);
for(const g of before.goals)if(g.id!==parentId)equal(afterBy.get(g.id),g,'Unrelated existing canonical object changed: '+g.id);
for(const edge of ['requires','contains']){
 const state=new Map<string,number>();
 function visit(id:string){must(state.get(id)!==1,'Cycle in '+edge+' at '+id);if(state.get(id)===2)return;state.set(id,1);for(const r of afterBy.get(id)?.[edge]??[]){must(afterBy.has(r),'Missing '+edge+' reference '+r+' from '+id);visit(r)}state.set(id,2)}
 for(const id of afterBy.keys())visit(id);
}

// Same inherited-requires compatibility semantics as the stock route checker,
// followed transitively through requires and cluster contains descendants.
const parentByChild=new Map<string,Set<string>>();
for(const g of after.goals)for(const c of g.contains??[]){const ps=parentByChild.get(c)??new Set<string>();ps.add(g.id);parentByChild.set(c,ps)}
const effectiveCache=new Map<string,Set<string>>();
function effectiveRequires(id:string):Set<string>{
 const cached=effectiveCache.get(id);if(cached)return cached;
 const found=new Set<string>(afterBy.get(id)?.requires??[]),seen=new Set<string>(),stack=[...(parentByChild.get(id)??[])];
 while(stack.length){const p=stack.pop()!;if(seen.has(p))continue;seen.add(p);for(const r of afterBy.get(p)?.requires??[])found.add(r);stack.push(...(parentByChild.get(p)??[]))}
 effectiveCache.set(id,found);return found;
}
function prerequisiteClosure(start:string){
 const all=new Set<string>(),atoms=new Set<string>(),stack=[...effectiveRequires(start)];
 while(stack.length){const id=stack.pop()!;if(all.has(id))continue;all.add(id);const g=afterBy.get(id);must(g,'Transitive prerequisite absent: '+id);if((g.contains??[]).length===0)atoms.add(id);else stack.push(...g.contains);stack.push(...effectiveRequires(id))}
 must(!all.has(start),'Effective prerequisite cycle reaches assessment '+start);return{all,atoms};
}
const closures=new Map(candidate.map((g:any)=>[g.id,prerequisiteClosure(g.id)]));
function project(raw:any,view:any){
 const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,m);
 const landscape={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))};
 const p=applyCompositionViewProjection([landscape],normalizeCompositionView(view))[0],projected=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(projected);
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>();
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,projected,children)){const ps=parents.get(c)??new Set<string>();ps.add(id);parents.set(c,ps);stack.push(c)}}
 const filters=[view.scope?.jurisdiction,view.scope?.courseProfile,view.scope?.durationModel].filter(Boolean);
 return{targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,seen,parents,projected,filters};
}
function childArray(view:any,path:string[]):any[]{
 let nodes=view.rootNodes;
 for(const id of path){const node=nodes.find((n:any)=>n.kind==='structure'&&n.id===id);must(node,'Missing selected T5 structure '+id);nodes=node.children}
 return nodes;
}
const viewWrites:any[]=[],viewChecks:any[]=[],blockers:any[]=[];
for(const path of viewPaths){
 const raw=readFileSync(path,'utf8'),v=JSON.parse(raw),next=structuredClone(v),op=operations.find((x:any)=>x.normalView.path===path);
 if(op){
  const array=childArray(next,op.stableStructureIdPath);
  equal(array,op.beforeChildren,'Selected T5 beforeChildren changed; review append rebase before writing '+path);
  for(const entry of op.appendChildren){must(entry.kind==='goalEntry'&&candidateIds.has(entry.goalId),'Unexpected T5 append entry kind/ID in '+path);must(!array.some((n:any)=>n.kind==='goalEntry'&&n.goalId===entry.goalId),'T5 entry already present in '+path+' '+entry.goalId)}
  array.push(...structuredClone(op.appendChildren));
  viewWrites.push({path,before:pin(path),beforeRaw:raw,afterRaw:dump(next),historicalAuthorBeforePin:op.normalView,onlyReviewedSelectedChildArrayAppend:true});
 }
 const b=project(before,v),a=project(after,next),actual=[...a.targets].filter(id=>candidateIds.has(id)).sort();
 const expected=proposal.viewEndpointEntries.filter((r:any)=>r.viewPath===path).map((r:any)=>r.goalId).sort();
 const independentlyEligible=candidate.filter((g:any)=>g.requires.every((id:string)=>b.targets.has(id))&&goalMatchesFilters(g,b.filters)).map((g:any)=>g.id).sort();
 const oldRoleChanges=[...beforeBy.keys()].filter(id=>b.roles.targetGoalIds.has(id)!==a.roles.targetGoalIds.has(id)||b.roles.prerequisiteOnlyGoalIds.has(id)!==a.roles.prerequisiteOnlyGoalIds.has(id));
 const oldTargetLoss=[...b.targets].filter(id=>!a.targets.has(id)),otherTargetAdds=[...a.targets].filter(id=>!b.targets.has(id)&&!candidateIds.has(id));
 const oldRenderedSetChanges=[...beforeBy.keys()].filter(id=>b.seen.has(id)!==a.seen.has(id));
 const oldParentChanges=[...b.parents].filter(([id,ps])=>!isDeepStrictEqual([...ps].sort(),[...(a.parents.get(id)??[])].sort())).map(([id])=>id);
 const duplicateNewParents=actual.filter(id=>(a.parents.get(id)?.size??0)!==1);
 const transitive=actual.map(id=>{
  const closure=closures.get(id)!;
  return{endpointId:id,allRequiredGoalIds:[...closure.all].sort(),atomicPrerequisiteIds:[...closure.atoms].sort(),missingGraphPrerequisites:[...closure.all].filter(r=>!a.projected.has(r)),missingAtomicTargetOrExplicitSupport:[...closure.atoms].filter(r=>!a.targets.has(r)&&!a.roles.prerequisiteOnlyGoalIds.has(r)),graphOnlyAtomicPrerequisites:[...closure.atoms].filter(r=>a.roles.prerequisiteOnlyGoalIds.has(r)),directOrdinaryTargetsPresent:afterBy.get(id).requires.every((r:string)=>a.targets.has(r))};
 });
 const c={path,beforePin:pin(path),scope:v.scope,actual,expected,independentlyEligible,oldRoleChanges,oldTargetLoss,otherTargetAdds,oldRenderedSetChanges,oldParentChanges,duplicateNewParents,transitivePrerequisiteChecks:transitive};
 viewChecks.push(c);
 if(!isDeepStrictEqual(actual,expected)||!isDeepStrictEqual(actual,independentlyEligible)||oldRoleChanges.length||oldTargetLoss.length||otherTargetAdds.length||oldRenderedSetChanges.length||oldParentChanges.length||duplicateNewParents.length||transitive.some(t=>t.missingGraphPrerequisites.length||t.missingAtomicTargetOrExplicitSupport.length||!t.directOrdinaryTargetsPresent))blockers.push(c);
}
equal(viewWrites.length,5,'T5 candidate must change exactly five selected views.');
const appearanceCount=viewChecks.reduce((n,r)=>n+r.actual.length,0);
equal(appearanceCount,12,'T5 candidate must add exactly12 rendered course-scoped offers.');
mkdirSync(checkDir,{recursive:true});
writeFileSync(checkDir+'/CHECK.actual-all41-and-transitive-prerequisites.json',dump({role:'ROOT_WRITER_PREFLIGHT_NOT_NEW_SCIENTIFIC_VOTE',canonical:pin(canonical),views:viewChecks.length,viewChecks,blockers,normalWrites:0}));
must(blockers.length===0,'T5 all41/current-source-scope/transitive prerequisite check failed; see '+checkDir+'/CHECK.actual-all41-and-transitive-prerequisites.json');

const parentDecision=sem.decisions.find((r:any)=>r.goalId===parentId);
must(parentDecision,'Semantic-kind decision for assessment parent is missing.');
parentDecision.sourceFingerprint=fingerprintSemanticKindSourceGoal(parent);
for(const g of added){must(!sem.decisions.some((r:any)=>r.goalId===g.id),'Semantic-kind decision already exists for '+g.id);sem.decisions.push({goalId:g.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(g),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'machine-reviewed-T5-whole-eight-FIRST-and-exact-v3-task-remedy-current-scoped-interface-20261018'})}
sem.counts.practiceAssessment+=8;sem.counts.total+=8;
equal(sem.counts.curricularAtomic,450,'Ordinary450 semantic-kind floor changed.');
equal(sem.counts.total,after.goals.length,'Candidate semantic-kind total differs from candidate graph.');
for(const r of semBefore.decisions)if(r.goalId!==parentId)equal(sem.decisions.find((q:any)=>q.goalId===r.goalId),r,'Unrelated old semantic-kind decision changed: '+r.goalId);

// Preserve every old raw goal block except the neutral parent contains append.
const marker='\n  "goals": [\n',markerIndex=beforeRaw.indexOf(marker),start=markerIndex+marker.length,end=beforeRaw.lastIndexOf('\n  ]');
must(markerIndex>=0&&end>start,'Canonical raw goal-array layout changed; no raw rewriter assumption is allowed.');
const body=beforeRaw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!);
equal(starts.length,before.goals.length,'Canonical raw top-level goal-block count changed.');
let patched='';
for(let i=0;i<starts.length;i++){
 const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''));
 patched+=g.id===parentId?'    '+JSON.stringify(parent,null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part;
}
patched=patched.replace(/\s*$/,'')+',\n'+added.map((g:any)=>'    '+JSON.stringify(g,null,2).replace(/\n/g,'\n    ')).join(',\n');
const afterRaw=beforeRaw.slice(0,start)+patched+beforeRaw.slice(end),semAfterRaw=dump(sem);
equal(JSON.parse(afterRaw),after,'Raw canonical reconstruction differs from the validated in-memory candidate.');

// Run the stock route evaluator from a scratch copy. Only module paths/scriptDir
// are rebased; no app source or generator output is written or executed as main.
const evaluatorPath='app/scripts/generateCurriculumQualityStatus.ts';
const evaluatorRaw=readFileSync(evaluatorPath,'utf8'),scriptsDir=resolve('app/scripts');
const probePath=resolve(checkDir,'stock-route-probe.mts');
let probe=evaluatorRaw.replace(/from\s+(['"])(\.[^'"]+)\1/g,(_all,q,ref)=>'from '+q+resolve(scriptsDir,ref)+q);
const scriptDirLine='const scriptDir = dirname(fileURLToPath(import.meta.url))';
must(probe.includes(scriptDirLine),'Stock route evaluator scriptDir declaration changed.');
probe=probe.replace(scriptDirLine,'const scriptDir = '+JSON.stringify(scriptsDir));
writeFileSync(probePath,probe+'\nexport {evaluateRouteProfile,routeProfiles};\n');
const evaluator:any=await import(pathToFileURL(probePath).href+'?source='+sha(evaluatorRaw));
const profile=evaluator.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2');
must(profile,'Stock canonical Chemistry SekII route profile is absent.');
const beforeRoute=evaluator.evaluateRouteProfile(before,profile,{reports:[]}),afterRoute=evaluator.evaluateRouteProfile(after,profile,{reports:[]});
const beforeMetrics=beforeRoute.rules.find((r:any)=>r.id==='CQR-101')?.metrics,afterMetrics=afterRoute.rules.find((r:any)=>r.id==='CQR-101')?.metrics;
must(beforeMetrics&&afterMetrics,'Stock CQR101 route metrics are absent.');
must(beforeMetrics.selectedAtomicGoals>0,'Stock Chemistry SekII route profile selected no atomic goals.');
equal(afterMetrics.selectedAtomicGoals,beforeMetrics.selectedAtomicGoals,'Stock SekII route selector universe changed; the separate450 whole-ordinary-object invariant is checked above.');
equal(beforeMetrics.missingMotivationPath,0,'Current baseline has missing motivation routes; review the baseline.');
equal(afterMetrics.missingMotivationPath,0,'T5 candidate loses motivation routes.');
must(afterMetrics.missingTerminalPath<beforeMetrics.missingTerminalPath,'T5 adds no recovered canonical terminal routes.');

const sourceScope={exactPriorTargetScopesOnly:true,newRenderedOffers:12,changedViews:5,byPracticalCourse:'Separate optional BY biologisch-chemisches Praktikum; no universal ordinary Chemistry GK/LK obligation or actual topic choice.',isolation:'The one broader isolation endpoint is offered only where its full current ordinary requirement is an existing target: BB GK/LK, BE GK/LK, BY LK.',allOfEvidenceOnly:'assessment-requires is applicability, not official source-coverage evidence.',newWholeSourceApprovals:0,newOrdinaryGoalScienceApprovals:0,newNativeDOrPBindings:0};
const outputDrafts=[{path:canonical,beforeRaw,afterRaw},{path:semantic,beforeRaw:semRaw,afterRaw:semAfterRaw},...viewWrites.map(w=>({path:w.path,beforeRaw:w.beforeRaw,afterRaw:w.afterRaw}))];
const candidateOutputs=outputDrafts.map(x=>({path:x.path,sha256:sha(x.afterRaw),bytes:Buffer.byteLength(x.afterRaw)}));
const receiptCandidate={role:'PREWRITE_VALIDATED_T5_EIGHT_ASSESSMENT_INTEGRATION_CANDIDATE_NOT_NORMAL_WRITE',mode:writeMode?'pending-write':'check-only',preparedBy:'/root/chemie_orientation_independent_a; root separately reviews/runs',inputs,currentContext,protectedInputs,acceptedWholeEight:pin(candidatePath),reviewPins:fixedPins,integratedEndpointIds:added.map((g:any)=>g.id),wholeDraftExamDataExact:true,all450OrdinaryWholeObjectsExact:true,viewChecks,appearanceCount,selectedViewChildArraysRebasedOverCurrentFullViews:true,sourceScope,beforeRoute,afterRoute,routeEvaluationBoundary:'CQR101 uses the actual stock route evaluator. Its wider view-dependent rules read current normal views; final post-integration applicability/native/release/central checks remain separate. All41 candidate views are independently replayed above.',progress:{newAssessmentDesigns:8,recoveredCanonicalTerminalRoutes:beforeMetrics.missingTerminalPath-afterMetrics.missingTerminalPath,remainingMotivation:afterMetrics.missingMotivationPath,remainingTerminal:afterMetrics.missingTerminalPath},candidateOutputs,limits:{noM7Claim:true,noHumanApproval:true,noHumanTrial:true,noActualLearnerExecution:true,noLocalSafetyRelease:true,noWholeSourceApproval:true,finalNativeDPAAndApplicabilityAndReleasePending:true},normalWrites:0};
writeFileSync(checkDir+'/RECEIPT.prewrite-T5-eight-candidate.json',dump(receiptCandidate));

// Final CAS: validate every file observed at start, all native P pins and protected
// subjects immediately before the first normal mutation, including check-only.
for(const p of inputs)equal(pin(p.path),p,'Input drift during T5 preflight: '+p.path);
for(const p of protectedInputs)equal(pin(p.path),p,'Protected subject floor changed during preflight: '+p.path);
for(const r of sourceRecords)equal(pin(r.PRecordFile.path),r.PRecordFile,'Native P input drift during preflight: '+r.goal.id);
if(!writeMode){console.log(dump({mode:'CHECK_ONLY_NO_NORMAL_WRITES',candidateReceipt:checkDir+'/RECEIPT.prewrite-T5-eight-candidate.json',currentNodes:before.goals.length,candidateNodes:after.goals.length,views:41,changedViews:5,appearanceCount,transitivePrerequisiteBlockers:0,beforeMetrics,afterMetrics,candidateOutputs}));}
else{
 must(!existsSync(out),'Integration output appeared during preflight; refuse overwrite: '+out);
 mkdirSync(out);mkdirSync(out+'/before-files');mkdirSync(out+'/staged-files');
 for(let i=0;i<outputDrafts.length;i++){
  const f=outputDrafts[i];writeFileSync(out+'/before-files/'+i+'.exact.snapshot',f.beforeRaw,{flag:'wx'});writeFileSync(out+'/staged-files/'+i+'.candidate',f.afterRaw,{flag:'wx'});
 }
 writeFileSync(out+'/RECEIPT.prewrite-T5-eight-candidate.json',dump(receiptCandidate),{flag:'wx'});
 writeFileSync(out+'/integration-writer.mts',readFileSync(process.argv[1]),{flag:'wx'});
 for(const p of inputs)equal(pin(p.path),p,'Input drift before commit: '+p.path);
 for(let i=0;i<outputDrafts.length;i++)renameSync(out+'/staged-files/'+i+'.candidate',outputDrafts[i].path);
 for(let i=0;i<outputDrafts.length;i++)equal(pin(outputDrafts[i].path),candidateOutputs[i],'Integrated raw output differs from validated candidate: '+outputDrafts[i].path);
 for(const p of protectedInputs)equal(pin(p.path),p,'Protected subject mutated during integration: '+p.path);
 for(const r of sourceRecords)equal(pin(r.PRecordFile.path),r.PRecordFile,'Native P mutated during integration: '+r.goal.id);
 const receipt={...receiptCandidate,role:'ROOT_RUN_TECHNICAL_REVIEWED_T5_EIGHT_DESIGN_INTEGRATION_NOT_NEW_SCIENTIFIC_VOTE',mode:'written',normalWrites:outputDrafts.length,outputs:outputDrafts.map(x=>pin(x.path)),prewriteCandidateNormalWrites:0};
 writeFileSync(out+'/RECEIPT.actual-T5-eight-assessment-integration.json',dump(receipt),{flag:'wx'});
 writeFileSync(out+'/SEAL.actual-T5-eight-integration.json',dump({role:'TECHNICAL_INTEGRATION_NOT_NEW_REVIEW_OR_HUMAN_APPROVAL',files:readdirSync(out).filter(n=>!['before-files','staged-files'].includes(n)).map(n=>pin(out+'/'+n)),beforeFiles:readdirSync(out+'/before-files').map(n=>pin(out+'/before-files/'+n)),outputs:receipt.outputs,noM7OrHumanClaim:true}),{flag:'wx'});
 console.log(dump({mode:'WRITTEN_AFTER_COMPLETE_PREFLIGHT',out,newAssessmentDesigns:8,newOrdinaryGoals:0,viewsChecked:41,viewsChanged:5,appearanceCount,beforeMetrics,afterMetrics,finalNativeAndApplicabilityAndReleaseChecksPending:true}));
}
