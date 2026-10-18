import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel.ts';
import {collectCompositionProjectionRoleGoalIds,normalizeCompositionView,compileCompositionView} from '../app/src/utils/authoring/compositionViewAuthoring.ts';
import {goalMatchesFilters} from '../app/src/utils/goalFilters.ts';
const N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17',O=N+'/chemie-current442-normal-integration-20261017-v1';
const OUT=O+'/core447-normal-and-single-chemistry-AP-v1';
const PRE=N+'/chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1';
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',S='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const R='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const A='curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json';
const M='curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json';
const ID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',ROOT='442c31c5-c561-5c7a-90bb-2335d779175c';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=(b:Buffer|string)=>crypto.createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>{const b=fs.readFileSync(p);return{path:p,sha256:hash(b),bytes:b.length}};
const stable=(v:any):string=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(stable).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
const eq=(a:any,b:any)=>stable(a)===stable(b);const assert=(b:boolean,s:string)=>{if(!b)throw new Error(s)};
const write=(p:string,x:any)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');return pin(p)};
assert(fs.existsSync(OUT+'/AP.failed.actual.json'),'First real refusal must remain recorded');
assert(!fs.existsSync(OUT+'/AP.attempt2.started.json'),'Never repeat the second authorized AP');
assert(pin(C).sha256==='b5b5d03e12ba809d40a70cfa79dbbb0d7b041c2490a7cbd8834528730a213dae','failed AP must not have persisted C');
const initial=read(OUT+'/INSTALL.actual-normal-core-inputs-before-AP.json');
assert(eq(pin(S),initial.semantic),'SEM drift');assert(eq(pin(A),initial.overrideRegistry),'override drift');assert(eq(pin(M),initial.sourceMapping),'mapping drift');
const beforeArchives=read(OUT+'/BEFORE.normal-file-archives-and-protected-pins.json');assert(eq(pin(R),beforeArchives.centralRegistry),'central registry drift');
const reportPath='tmp/applicability/'+ID+'.json',failedReport=read(reportPath);
const c=read(C),sem=read(S),oldc=structuredClone(c),oldsem=structuredClone(sem);
const oldNormal=read(OUT+'/history/'+C);const oldIds=new Set<string>(oldNormal.goals.map((g:any)=>g.id));
const newIds=new Set<string>(c.goals.map((g:any)=>g.id).filter((gid:string)=>!oldIds.has(gid)));assert(newIds.size===5,'five new atoms expected');
const errors=failedReport.findings.filter((f:any)=>f.severity==='error');assert(errors.length===17&&errors.every((f:any)=>f.code==='APV-103'&&newIds.has(f.goalId)),'refusal has a different cause');
const failurePin=OUT+'/AP.attempt1.refused-root-reachability.stock-report.actual.json';assert(!fs.existsSync(failurePin),'preserve first failure');fs.copyFileSync(reportPath,failurePin);
const root=c.goals.find((g:any)=>g.id===ROOT),beforeContains=[...root.contains];
for(const gid of newIds){assert(!root.contains.includes(gid),'new goal already root child');assert(c.goals.filter((g:any)=>(g.contains??[]).includes(gid)).length===0,'new goal had another parent');root.contains.push(gid)}
const by=new Map<string,any>(c.goals.map((g:any)=>[g.id,g])),preBy=new Map<string,any>(oldc.goals.map((g:any)=>[g.id,g]));
const atoms=new Set<string>(sem.decisions.filter((x:any)=>x.semanticKind==='curricularAtomic').map((x:any)=>x.goalId));
const views=read(PRE+'/VIEWS41.complete-five-new-target-proposals.INACTIVE.json').rows;
const plans=read(PRE+'/PLAN.exact-48-view-entry-additions-and-old-target-retention.json').rows;
const rootMap=new Map([[ID,ROOT]]);const sorted=(s:Set<string>)=>[...s].sort();
const failedCompiled=new Map<string,any>(failedReport.goals.map((x:any)=>[x.goalId,x.compiledApplicability]));
const predicted=structuredClone(c);for(const g of predicted.goals)g.applicability=failedCompiled.get(g.id)??{};
const predictedBy=new Map<string,any>(predicted.goals.map((g:any)=>[g.id,g]));
const oldSelections=new Map<string,any>(read(OUT+'/BEFORE.actual41-filtered-target-support-selections.json').rows.map((x:any)=>[x.viewId,x]));
const selection=(v:any,map:Map<string,any>)=>{
 const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(v).rootNodes,map,rootMap);
 const course=[v.scope.courseProfile,v.scope.durationModel].filter(Boolean),state=v.scope.jurisdiction&&v.scope.jurisdiction!=='DE'?v.scope.jurisdiction:null,filters=state?[...course,state]:course;
 const selected=(s:Set<string>)=>[...s].filter(g=>goalMatchesFilters(map.get(g),filters)).sort();
 return{scope:v.scope,filters,targetAll:selected(roles.targetGoalIds),supportAll:selected(roles.prerequisiteOnlyGoalIds),targetAtoms:selected(roles.targetGoalIds).filter(g=>atoms.has(g)),supportAtoms:selected(roles.prerequisiteOnlyGoalIds).filter(g=>atoms.has(g)),rawCourseTargetAtoms:[...roles.targetGoalIds].filter(g=>atoms.has(g)&&goalMatchesFilters(map.get(g),course)).sort()};
};
const proposalChecks:any[]=[];
for(const row of views){
 const v=read(row.normalPath),br=collectCompositionProjectionRoleGoalIds(v.rootNodes,preBy,rootMap),ar=collectCompositionProjectionRoleGoalIds(v.rootNodes,by,rootMap);
 assert(eq(sorted(br.targetGoalIds),sorted(ar.targetGoalIds))&&eq(sorted(br.prerequisiteOnlyGoalIds),sorted(ar.prerequisiteOnlyGoalIds)),'root attachment changed raw roles '+v.viewId);
 const selected=selection(v,predictedBy),old=oldSelections.get(v.viewId),expected=plans.filter((x:any)=>x.viewId===v.viewId).map((x:any)=>x.newGoalId).sort();
 for(const key of ['targetAll','supportAll','targetAtoms','supportAtoms'])assert(eq(selected[key].filter((g:string)=>!newIds.has(g)),old[key]),'predicted old filtered set changed '+v.viewId+'/'+key);
 assert(eq(selected.targetAtoms.filter((g:string)=>newIds.has(g)),expected),'predicted new48 tuple differs '+v.viewId);
 const compiled=compileCompositionView(normalizeCompositionView(v),c,c);const compileErrors=compiled.findings.filter((x:any)=>x.severity==='error');
 assert(compileErrors.length===0,'stock composition structural error '+v.viewId+' '+JSON.stringify(compileErrors));
 const occurrences=new Map<string,number>();const walk=(nodes:any[])=>{for(const n of nodes){if(newIds.has(n.sourceGoalId))occurrences.set(n.sourceGoalId,(occurrences.get(n.sourceGoalId)??0)+1);walk(n.children??[])}};walk(compiled.compiledRootNodes);
 for(const gid of expected)assert(occurrences.get(gid)===1,'new book occurrence not unique '+v.viewId+'/'+gid);
 proposalChecks.push({viewId:v.viewId,rawRolesExact:true,predictedFilteredOldSetsExact:true,predictedNewTargets:expected,stockCompositionErrors:compileErrors,newBookOccurrenceCounts:[...occurrences].map(([goalId,count])=>({goalId,count}))});
}
for(const gid of newIds)assert(c.goals.filter((g:any)=>(g.contains??[]).includes(gid)).length===1,'new canonical parent not unique');
const rootRow=sem.decisions.find((x:any)=>x.goalId===ROOT);const beforeFP=rootRow.sourceFingerprint;rootRow.sourceFingerprint=fingerprintSemanticKindSourceGoal(root);
assert(beforeFP!==rootRow.sourceFingerprint,'root sourceFP must change');
for(let i=0;i<sem.decisions.length;i++)if(sem.decisions[i].goalId!==ROOT)assert(eq(sem.decisions[i],oldsem.decisions[i]),'other SEM row changed');
const cBefore=OUT+'/history/C659.before-authorized-root-attachment.json.snapshot',sBefore=OUT+'/history/SEM659.before-authorized-root-attachment.json.snapshot';
fs.writeFileSync(cBefore,fs.readFileSync(C));fs.writeFileSync(sBefore,fs.readFileSync(S));
const rootIndex=c.goals.findIndex((g:any)=>g.id===ROOT);
const proposal=write(OUT+'/ROOT_ATTACHMENT.exact-cause-correction-and-41-view-proof.actual.json',{
 artifactRole:'Root-authorized cause correction after actual stock refusal; no scientific scope change',atUTC:new Date().toISOString(),failure:pin(failurePin),refusal:pin(OUT+'/AP.failed.actual.json'),
 authorization:'Root explicitly authorized the smallest root.contains attachment and a second actual AP after proving old roles plus exactly48 new tuples and no multiple book parents.',
 canonicalBefore:pin(cBefore),patch:{op:'replace',path:'/goals/'+rootIndex+'/contains',before:beforeContains,after:root.contains,onlyAppendedIds:[...newIds]},
 semanticRootOnly:{goalId:ROOT,beforeSourceFP:beforeFP,afterSourceFP:rootRow.sourceFingerprint,classStatusBasisUnchanged:true},
 allFiveNewCanonicalParentsExactlyOne:true,all41RawRolesUnchanged:true,all41PredictedFilteredSetsExact:true,noBookDuplicateOrMultipleParent:true,views:proposalChecks,
 predictionBoundary:'Filtered precheck uses compiled applicability from the actual refused report; this is not another AP invocation. The original root was already applicable in all16states, and the five appended goals add no new root jurisdiction.',newScience:0,HumanApproval:false,M7:false});
write(C,c);write(S,sem);const installedC=pin(C),installedS=pin(S);fs.copyFileSync(C,OUT+'/C659.root-attached-before-authorized-AP2.actual.json.snapshot');
const reportsDir='tmp/applicability',reportsBefore=new Map<string,Buffer>(fs.readdirSync(reportsDir).filter(n=>n.endsWith('.json')).map(n=>[n,fs.readFileSync(reportsDir+'/'+n)]));
write(OUT+'/AP.attempt2.started.json',{atUTC:new Date().toISOString(),scope:ID,rootAuthorization:'Explicit parent instruction after actual17 APV103 refusal',rootCorrection:proposal,stock:pin('app/scripts/applyApplicability.ts')});
process.env.APPLICABILITY_APPLY_SCOPE=ID;console.log(JSON.stringify({phase:'AUTHORIZED_AP2_STARTED',canonical:installedC,SEM:installedS}));
let apError:any=null;try{await import('../app/scripts/applyApplicability.ts')}catch(e){apError=e}
for(const n of fs.readdirSync(reportsDir).filter(n=>n.endsWith('.json')&&n!==ID+'.json')){const b=reportsBefore.get(n);if(b)fs.writeFileSync(reportsDir+'/'+n,b);else fs.unlinkSync(reportsDir+'/'+n)}
for(const[n,b]of reportsBefore)if(n!==ID+'.json'&&!fs.existsSync(reportsDir+'/'+n))fs.writeFileSync(reportsDir+'/'+n,b);
if(apError){write(OUT+'/AP.attempt2.failed.actual.json',{atUTC:new Date().toISOString(),error:String(apError),noAutomaticRerun:true});throw apError}
const report=read(reportPath);assert(report.summary.errors===0,'AP2 compiler errors');fs.copyFileSync(reportPath,OUT+'/AP.attempt2.success.stock-report.actual.json');
const after=read(C),afterBy=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));const apDeltas:any[]=[];
assert(after.goals.length===659,'AP count');
for(let i=0;i<c.goals.length;i++){const b=c.goals[i],a=after.goals[i];assert(a.id===b.id,'AP order');const{applicability:ba,...bs}=b,{applicability:aa,...as}=a;assert(eq(bs,as),'AP non-applicability change '+a.id);if(!eq(ba??{},aa??{}))apDeltas.push({goalId:a.id,before:ba??{},after:aa??{}})}
assert(eq(pin(S),installedS),'SEM changed in AP');assert(eq(pin(M),initial.sourceMapping),'mapping changed in AP');assert(eq(pin(A),initial.overrideRegistry),'override changed in AP');assert(eq(pin(R),beforeArchives.centralRegistry),'central registry changed');
for(const x of beforeArchives.otherCanonicalPins)assert(eq(pin(x.path),x),'protected other canonical changed '+x.path);
for(const[n,b]of reportsBefore)if(n!==ID+'.json')assert(hash(fs.readFileSync(reportsDir+'/'+n))===hash(b),'unrelated report bytes changed');
for(const row of sem.decisions)assert(row.sourceFingerprint===fingerprintSemanticKindSourceGoal(afterBy.get(row.goalId)),'post-AP SEM drift '+row.goalId);
const missing:any[]=[],extra:any[]=[],checks:any[]=[],selections:any[]=[];
for(const row of views){const v=read(row.normalPath),b=oldSelections.get(v.viewId),a=selection(v,afterBy),expected=plans.filter((x:any)=>x.viewId===v.viewId).map((x:any)=>x.newGoalId).sort();
 for(const key of ['targetAll','supportAll','targetAtoms','supportAtoms']){const olds=a[key].filter((g:string)=>!newIds.has(g));for(const gid of b[key])if(!olds.includes(gid))missing.push({viewId:v.viewId,kind:key,goalId:gid,scope:v.scope});for(const gid of olds)if(!b[key].includes(gid))extra.push({viewId:v.viewId,kind:key,goalId:gid,scope:v.scope})}
 const added=a.targetAtoms.filter((g:string)=>newIds.has(g));for(const gid of expected)if(!added.includes(gid))missing.push({viewId:v.viewId,kind:'required-new-target',goalId:gid,scope:v.scope});for(const gid of added)if(!expected.includes(gid))extra.push({viewId:v.viewId,kind:'unapproved-new-target',goalId:gid,scope:v.scope});
 const state=v.scope.jurisdiction;if(state&&state!=='DE')for(const gid of a.rawCourseTargetAtoms)if(!afterBy.get(gid).applicability?.jurisdiction?.includes(state))missing.push({viewId:v.viewId,kind:'authored-state-target-filter-loss',goalId:gid,scope:v.scope});
 checks.push({view:pin(row.normalPath),scope:v.scope,filters:a.filters,oldFilteredTargets:b.targetAtoms.length,actualFilteredTargets:a.targetAtoms.length,oldFilteredSupport:b.supportAtoms.length,actualFilteredSupport:a.supportAtoms.length,newActuallyFilteredTargets:added,expectedNewTargets:expected});selections.push({viewId:v.viewId,...a});
}
write(OUT+'/AFTER.actual41-filtered-target-support-selections.json',{canonical:pin(C),semantic:pin(S),rows:selections});
const filtered=write(OUT+'/CHECK.actual-filtered-tuple-retention-after-authorized-AP2.json',{missing,extra,viewChecks:checks,oldSetsCompared:'every all-kind and ordinary Target/Support set after actual goalMatchesFilters course/duration/state filtering',newExpectedTuples:48});
assert(missing.length===0&&extra.length===0,'actual filtered tuples differ; see exact CHECK');
const added=selections.reduce((n,x)=>n+x.targetAtoms.filter((g:string)=>newIds.has(g)).length,0);assert(added===48,'actual48');
assert(!afterBy.get('223e33a4-5545-5332-ac4e-7d7a6cbc587c').applicability.jurisdiction.includes('DE-BY'),'BY leak');
assert(!selections.some(x=>x.scope.jurisdiction==='DE-HB'&&x.scope.courseProfile==='GK'&&x.targetAtoms.includes('4965395d-e0c5-5e23-a408-a11712aab409')),'HB GK232 leak');
const receipt=write(OUT+'/RECEIPT.normal447-after-root-attachment-and-authorized-second-AP.actual.json',{
 artifactRole:'Actual normal447 integration with explicit cause correction: first AP refused, separately authorized second AP persisted',atUTC:new Date().toISOString(),canonicalOriginalBefore:pin(OUT+'/history/'+C),canonicalBeforeSuccessfulAP:pin(OUT+'/C659.root-attached-before-authorized-AP2.actual.json.snapshot'),canonicalAfter:pin(C),semanticKinds:pin(S),sourceMapping:pin(M),overrideRegistry:pin(A),normalCentralRegistry:pin(R),
 initialInstallation:pin(OUT+'/INSTALL.actual-normal-core-inputs-before-AP.json'),causeCorrection:proposal,firstRefusal:pin(failurePin),actualSuccessfulAP:pin(OUT+'/AP.attempt2.success.stock-report.actual.json'),actualFilteredChecks:filtered,
 counts:{allGoals:659,curricularAtomic:447,memory:68,views:41,newExplicitAndActuallyFilteredTargets:48,missingTuples:missing.length,extraTuples:extra.length,compilerErrors:report.summary.errors,partialSourceGoals:232,partialSourceEdges:467,targetedPartialUnionSuccessors:15,newOwnJurisdictionPairs:13,APAttempts:2,firstRefusedWithoutPersistence:1,successfulPersistences:1,applicabilityOnlyDeltasAfterRootCorrection:apDeltas.length},
 applicabilityDifferences:apDeltas,viewScopeChecks:checks,
 checks:{allOldFilteredTargetAndSupportSetsExact:true,all48NewTuplesMatchStateAndCourseFiltersIncludingGenericViews:true,noBYBioAndNoHBGK232Leak:true,noNewBookDuplicatesOrMultipleParents:true,allOtherCanonicalBytesExact:true,unrelatedGeneratedReportBytesRestored:true,all659SEMSourceFPsCurrent:true,allOldClassificationsExactAndFiveFromActualPairs:true,centralDAMPQARegistryUntouched:true,successfulAPChangesOnlyApplicability:true},
 evidenceReuse:{actualPairedSEMAndSourceEvidence:initial.semanticClassificationsFromActualScience,newImageLinksOnlyNoVApproval:initial.newResourceLinksOnlyNoVApproval,pairedReceipts:initial.pairedReceipts},
 method:{stockAPScript:pin('app/scripts/applyApplicability.ts'),stockCompiler:pin('app/scripts/applicabilityCompiler.ts'),scope:ID,rootCorrectionOnly:'/goals/'+rootIndex+'/contains appends exactly five existing orphan atoms; no scope/tag/requires/goal content or gate rule changed'},
 boundaries:{newScience:0,newNativeDReviews:0,centralDAMPQARegistryChangesByInstaller:0,newVOrHumanApproval:false,HumanTrial:false,M7:false,testsOrBuildsBeyondAuthorizedAP:false},
 assemblerDisclosure:'Installer authored earlier D5/view proposals. Actual science is from the two external pairs. Root separately authorized this five-atom root attachment after the actual AP refusal and the second AP; this installer creates no new scientific verdict.'});
fs.copyFileSync('tmp/chemie447_root_attachment_and_authorized_AP2.mts',OUT+'/root-attachment-and-authorized-AP2.mts');
console.log(JSON.stringify({phase:'DONE',receipt,C:pin(C),SEM:pin(S),counts:read(receipt.path).counts},null,2));
