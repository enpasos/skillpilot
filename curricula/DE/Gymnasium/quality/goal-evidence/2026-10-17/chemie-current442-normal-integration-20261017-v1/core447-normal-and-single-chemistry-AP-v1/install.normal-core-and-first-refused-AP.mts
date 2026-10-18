import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel.ts';
import {collectCompositionProjectionRoleGoalIds,normalizeCompositionView} from '../app/src/utils/authoring/compositionViewAuthoring.ts';
import {goalMatchesFilters} from '../app/src/utils/goalFilters.ts';
const N='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17';
const O=N+'/chemie-current442-normal-integration-20261017-v1';
const OUT=O+'/core447-normal-and-single-chemistry-AP-v1';
const PRE=N+'/chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1';
const SCOPE=N+'/chemie-current447-confirmed-own-scope-binding-successor-technical-20261018-v1';
const C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const S='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
const R='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
const A='curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json';
const M='curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json';
const SRC='curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json';
const ID='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=(b:Buffer|string)=>crypto.createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>{const b=fs.readFileSync(p);return{path:p,sha256:hash(b),bytes:b.length}};
const stable=(v:any):string=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(stable).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
const objsha=(v:any)=>hash(stable(v));const eq=(a:any,b:any)=>stable(a)===stable(b);
const assert=(b:boolean,s:string)=>{if(!b)throw new Error(s)};
const write=(p:string,x:any)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');return pin(p)};
const ref=(p:string,ptr:string,x:any)=>({...pin(p),jsonPointer:ptr,wholeObjectSHA256:objsha(x)});
assert(!fs.existsSync(OUT+'/AP.started.json'),'Never repeat the authorized single AP');
assert(!fs.existsSync(OUT+'/RECEIPT.normal447-and-single-AP.actual.json'),'Actual integration receipt already exists');
fs.mkdirSync(OUT,{recursive:true});
for(const dir of [PRE,SCOPE])for(const x of read(dir+'/SEAL.json').outputs)assert(eq(pin(x.path),x),'Sealed predecessor changed '+x.path);
assert(pin(C).sha256==='1334c2f7e637c23737c32fffcda9adc9273b83e0d61f536c2e6b404699eee262','normal C drift');
assert(pin(S).sha256==='87aaf21f6c3f185b192938ee63a616d29ad243bb37a1eb5a4c1b34e842f17044','normal SEM drift');
assert(pin(R).sha256==='5d9ea777d108f1d1e3a20aca63ea8d9ba70e8f1bf1e7f87a952e0f0a4079b025','central D159 registry drift');
assert(pin(A).sha256==='3cbbd691565c21526e82da7a7c9fa1382c0f6cb075109a80c7aca9d2095ab5c1','normal override registry drift');
assert(pin(M).sha256==='973e93ac057f5c42d032584f06e1a1c7b989ecea594b3dd0148d96d44cde11d8','normal HB232 mapping drift');
const pairP=O+'/PAIRED.P5-six-existing-three-new-science.actual.json',pairD=O+'/PAIRED.D5-two-new-duty-science-and-one-English-author-correction.actual.json';
assert(pin(pairP).sha256==='425e35c8ea0c8f98558e94ec940a4ed707eb3592aa7fbed7c9849f554c11dd5d','P pairing drift');
assert(pin(pairD).sha256==='e2c3a2b4307e8e814baf24a3b98955c4a16172c1bf2f53e4b51089b8d176aaf4','D pairing drift');
const pp=read(pairP),pd=read(pairD);
for(const x of [...pp.actualReviewFilesAndSeals,...pd.actualIndependentScience])assert(eq(pin(x.path),x),'paired review pin drift '+x.path);
assert(eq(pin(pd.onlyRequiredCorrection.path),pd.onlyRequiredCorrection),'Root English-title correction drift');
const pAPath=pp.actualReviewFilesAndSeals[0].path,pBPath=pp.actualReviewFilesAndSeals[2].path,dAPath=pd.actualIndependentScience[0].path,dBPath=pd.actualIndependentScience[2].path;
const pA=read(pAPath),pB=read(pBPath),dA=read(dAPath),dB=read(dBPath);
const scopeC=SCOPE+'/C659.447ordinary-68memory.confirmed-own-scope-successor.INACTIVE.json';
const scopeS=SCOPE+'/SEM659.confirmed-own-scope-source-bindings.INACTIVE-TRANSPORT.json';
const scopeA=SCOPE+'/canonical-goal-applicability-override-registry.chemie45-confirmed-scope.INACTIVE.json';
const scopeViews=PRE+'/VIEWS41.complete-five-new-target-proposals.INACTIVE.json';
const scopePlans=PRE+'/PLAN.exact-48-view-entry-additions-and-old-target-retention.json';
const sourcePlan=PRE+'/SOURCE15.whole-combined-13plus2-candidates-and-overlap-check.json';
const sourceAll=read(PRE+'/SOURCE232.complete-current-unions-plus15-author-proposals.INACTIVE.json');
const c=read(scopeC),sem=read(scopeS),override=read(scopeA),views=read(scopeViews),plans=read(scopePlans),fifteen=read(sourcePlan);
const oldC=read(C),oldS=read(S),oldM=read(M);
const oldby=new Map<string,any>(oldC.goals.map((g:any)=>[g.id,g]));const by=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]));
const newIds=new Set<string>([...by.keys()].filter(id=>!oldby.has(id)));assert(newIds.size===5,'new goal count');
const vAuthor=O+'/V10-current-corrected-goal-image-author-input.json',v10=read(vAuthor),assetChecks:any[]=[];
assert(v10.records.length===10,'actual V10 count');
for(const row of v10.records.slice(0,5)){
 assert(newIds.has(row.goalId),'V10 first-five goal mismatch');
 const links=row.candidateWholeGoal.resourceLinks;assert(links.length===1&&links[0].role==='primary','unexpected first-five link list');
 by.get(row.goalId).resourceLinks=structuredClone(links);
 const expected=row.actualImage.sha256.replace(/^sha256:/,'');assert(pin(row.actualImage.path).sha256===expected,'author PNG drift');
 const rel=links[0].url.replace(/^\/assets\/goal-visualizations\/chemie\//,'');
 const copies=['app/public'+links[0].url,'backend/src/main/resources/static'+links[0].url,'curricula/DE/Gymnasium/visualizations/chemie/'+rel];
 for(const p of copies)assert(pin(p).sha256===expected,'installed PNG mismatch '+p);
 assetChecks.push({goalId:row.goalId,resourceLinksExactFrom:ref(vAuthor,'/records/'+v10.records.indexOf(row)+'/candidateWholeGoal/resourceLinks',links),assets:copies.map(pin),actualSource:row.actualImage,noVApprovalCreated:true});
}
assert(by.get('72236f2c-771e-4ab6-933a-e549ee49d15b').titleEn==='Describe the nuclear model of the atom and atomic constituents','final Root title not selected');
const semanticEvidence:any[]=[];
for(const gid of newIds){
 const isP=pp.newNarrowGoalIds.includes(gid);const aRows=isP?pA.newNarrowGoalAPMReviews:dA.newNarrowGoalReviews,bRows=isP?pB.newGoalAndProfileFindings:dB.newGoalFindings;
 const ar=aRows.find((r:any)=>r.goalId===gid),br=bRows.find((r:any)=>r.goalId===gid);assert(ar&&br,'missing actual paired classifications '+gid);
 assert(ar.atomicityDecision==='atomic'&&String(br.atomicityCandidateRecommendation??br.atomicityRecommendation).startsWith('atomic:'),'not actual atomic pair '+gid);
 const row=sem.decisions.find((r:any)=>r.goalId===gid);assert(row.decisionStatus==='author_candidate'&&row.semanticKind==='curricularAtomic','unexpected inactive kind');
 row.decisionStatus='authoritative';row.decisionBasis='reviewed-current-pilot-curricular-atomic';
 semanticEvidence.push({goalId:gid,semanticKind:'curricularAtomic',rootPairing:pin(isP?pairP:pairD),actualIndependentA:ref(isP?pAPath:dAPath,'/'+(isP?'newNarrowGoalAPMReviews':'newNarrowGoalReviews')+'/'+aRows.indexOf(ar),ar),actualIndependentB:ref(isP?pBPath:dBPath,'/'+(isP?'newGoalAndProfileFindings':'newGoalFindings')+'/'+bRows.indexOf(br),br),nativeDOrM7OrHumanClaim:false});
}
sem.sourceLandscapePath=C;sem.ledgerId='chemie-current659-paired-447ordinary-normal-20261018-v1';
for(const row of sem.decisions)row.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(row.goalId));
for(const old of oldS.decisions){const after=sem.decisions.find((x:any)=>x.goalId===old.goalId);const omit=(x:any)=>Object.fromEntries(Object.entries(x).filter(([k])=>k!=='sourceFingerprint'));assert(eq(omit(old),omit(after)),'old classification changed '+old.goalId)}
assert(sem.decisions.length===659&&sem.counts.curricularAtomic===447&&sem.counts.memory===68,'SEM counts');

const oldViews=new Map<string,any>(),normalViewBytes=new Map<string,Buffer>();
for(const row of views.rows){assert(eq(pin(row.normalPath),row.before),'normal view drift '+row.normalPath);oldViews.set(row.viewId,read(row.normalPath));normalViewBytes.set(row.normalPath,fs.readFileSync(row.normalPath))}
const oldAtoms=new Set<string>(oldS.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId));
const atoms=new Set<string>(sem.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId));
const rootMap=new Map([[ID,'442c31c5-c561-5c7a-90bb-2335d779175c']]);
const selection=(v:any,map:Map<string,any>,atomSet:Set<string>)=>{
 const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(v).rootNodes,map,rootMap);
 const course=[v.scope.courseProfile,v.scope.durationModel].filter(Boolean),state=v.scope.jurisdiction&&v.scope.jurisdiction!=='DE'?v.scope.jurisdiction:null;
 const filters=state?[...course,state]:course;
 const selected=(s:Set<string>)=>[...s].filter(g=>goalMatchesFilters(map.get(g),filters)).sort();
 const selectedAtoms=(s:Set<string>)=>selected(s).filter(g=>atomSet.has(g));
 return {scope:v.scope,filters,targetAll:selected(roles.targetGoalIds),supportAll:selected(roles.prerequisiteOnlyGoalIds),targetAtoms:selectedAtoms(roles.targetGoalIds),supportAtoms:selectedAtoms(roles.prerequisiteOnlyGoalIds),rawCourseTargetAtoms:[...roles.targetGoalIds].filter(g=>atomSet.has(g)&&goalMatchesFilters(map.get(g),course)).sort()};
};
const beforeSelections=new Map<string,any>([...oldViews].map(([id,v])=>[id,selection(v,oldby,oldAtoms)]));
write(OUT+'/BEFORE.actual41-filtered-target-support-selections.json',{canonical:pin(C),semantic:pin(S),rows:[...beforeSelections].map(([viewId,x])=>({viewId,...x}))});

const selectedSource=new Map<number,any>(fifteen.rows.map((r:any)=>[r.ordinal,r]));assert(selectedSource.size===15,'whole source proposal count');
const sourceSelectionRows:any[]=[];const nextM=structuredClone(oldM);
const sourceGoal=read(SRC).sourceGoals;
for(let i=0;i<oldM.decisions.length;i++){
 const old=oldM.decisions[i],r=selectedSource.get(i+1),ids=r?.wholeCandidateCarrierIds??old.canonicalGoalIds;
 if(r)assert(eq(r.wholeCurrentDecision,old),'source successor baseline differs '+(i+1));
 const evidence:any[]=[];
 if(r){
  if(i+1===200||i+1===232){
   const goal=i+1===200?'223e33a4-5545-5332-ac4e-7d7a6cbc587c':'4965395d-e0c5-5e23-a408-a11712aab409';
   const ar=dA.newNarrowGoalReviews.find((x:any)=>x.goalId===goal),br=dB.sourceUnionFindings.find((x:any)=>x.ordinal===i+1);
   assert(eq(br.proposedCarrierIds,ids)&&br.recommendation.startsWith('accept_'),'D source tuple differs');
   evidence.push({...ref(dAPath,'/newNarrowGoalReviews/'+dA.newNarrowGoalReviews.indexOf(ar),ar),role:'actual_A_narrow_duty_and_scope_acceptance'}, {...ref(dBPath,'/sourceUnionFindings/'+dB.sourceUnionFindings.indexOf(br),br),role:'actual_B_partial_carrier_replacement'}, {...pin(pairD),role:'Root_pair_selection_of_two_actual_scientific_reviews'});
  }else{
   const ar=pA.partialSourceUnionReviews.find((x:any)=>x.ordinal===i+1),br=pB.sourceUnionFindings.find((x:any)=>x.ordinal===i+1);
   assert(ar&&br&&eq(ar.proposedPartialCarrierIds,ids)&&eq(br.afterCarrierIds,ids),'P source tuple differs');
   assert(ar.decision.startsWith('accept_')&&br.recommendation.startsWith('accept_'),'P source not accepted');
   evidence.push({...ref(pAPath,'/partialSourceUnionReviews/'+pA.partialSourceUnionReviews.indexOf(ar),ar),role:'actual_A_scope_qualified_partial_union'}, {...ref(pBPath,'/sourceUnionFindings/'+pB.sourceUnionFindings.indexOf(br),br),role:'actual_B_scope_qualified_partial_union'}, {...pin(pairP),role:'Root_pair_selection_of_two_actual_scientific_reviews'});
  }
  const after=nextM.decisions[i];after.canonicalGoalIds=ids;after.matchType='partial';after.predecessorScientificEvidence=after.scientificEvidence;after.scientificEvidence=evidence;
  after.predecessorUnionRef=after.currentUnionRef;after.currentUnionRef={path:OUT+'/SOURCE232.actual-current447-normal-partial-bindings.json',jsonPointer:'/rows/'+i};
  after.rationale='Scoped partial carrier union retained/partitioned from the two actual independent author-successor acceptances. Technical serialization adds no scientific vote, official universal duty, actual learner performance or single-goal whole-source completion.';
  after.reviewedAt='2026-10-18';after.reviewer='actual paired independent informed scientific reviewers; technical installation by separate assigned assembler';
 }else assert(eq(nextM.decisions[i],old),'untargeted decision changed');
 sourceSelectionRows.push({ordinal:i+1,sourceGoalId:old.sourceGoalId,canonicalGoalIds:ids,matchType:'partial',sourceCourseLevel:old.sourceCourseLevel,sourceScopeExact:old.sourceScopeExact,
  scientificEvidence:r?evidence:old.scientificEvidence,predecessorDecision:ref(M,'/decisions/'+i,old),wholeSourceCompletionFromSingleGoalMasteryAllowed:false,
  goalBindings:ids.map((gid:string)=>({goalId:gid,semanticSourceFingerprint:sem.decisions.find((x:any)=>x.goalId===gid).sourceFingerprint})),normalSourceBinding:true,newScientificJudgment:false});
}
const mappings:any[]=[];const emitted=new Set<string>();
for(const edge of oldM.mappings){
 if(emitted.has(edge.legacyGoalId))continue;emitted.add(edge.legacyGoalId);
 const idx=oldM.decisions.findIndex((d:any)=>d.sourceGoalId===edge.legacyGoalId);assert(idx>=0,'mapping outside232');
 const oldEdges=oldM.mappings.filter((x:any)=>x.legacyGoalId===edge.legacyGoalId),ids=nextM.decisions[idx].canonicalGoalIds;
 for(const gid of ids){const same=oldEdges.find((x:any)=>x.canonicalGoalId===gid);mappings.push(same??{...oldEdges[0],canonicalGoalId:gid,matchType:'partial'})}
}
assert(mappings.length===467&&emitted.size===232,'normal partial mapping count');nextM.mappings=mappings;
const selectionPin=write(OUT+'/SOURCE232.actual-current447-normal-partial-bindings.json',{artifactRole:'Normal scoped partial carrier selection; actual paired science preserved, no new scientific vote',sourceExtraction:pin(SRC),pairedP:pin(pairP),pairedD:pin(pairD),rows:sourceSelectionRows,counts:{sourceGoals:232,partialEdges:467,targetedSuccessorUnions:15,untargetedDecisionsExact:217},humanApproval:false,M7Claim:false});
nextM.reviewId='DE-HB-CHEMIE-SEKII-PRIMARY232-PAIRED-CURRENT447-20261018-V1';nextM.active=true;
nextM.wholeSourceUnionSelection=selectionPin;nextM.sourceExtractionExactCandidate=pin(SRC);
nextM.status={...nextM.status,scientificReview:'paired_machine_scope_qualified_partial_unions_current447',normalActivation:'normal_installed_current447_final_native_QA_pending'};

const normalBefore=new Map<string,Buffer>();const archiveRows:any[]=[];
const archive=(p:string)=>{if(normalBefore.has(p))return;const b=fs.readFileSync(p);normalBefore.set(p,b);const a=OUT+'/history/'+p;fs.mkdirSync(path.dirname(a),{recursive:true});fs.writeFileSync(a,b);archiveRows.push({normalPath:p,before:{path:p,sha256:hash(b),bytes:b.length},archive:pin(a)})};
for(const p of [C,S,A,M,R,...normalViewBytes.keys()])archive(p);
const canonicalDir='curricula/DE/Gymnasium/canonical';const canonicalBytes=new Map<string,Buffer>(fs.readdirSync(canonicalDir).filter(n=>n.endsWith('.json')).map(n=>{const p=canonicalDir+'/'+n;return[p,fs.readFileSync(p)]}));
const centralBefore=fs.readFileSync(R);
const reportsDir='tmp/applicability';const reportsBefore=new Map<string,Buffer>(fs.existsSync(reportsDir)?fs.readdirSync(reportsDir).filter(n=>n.endsWith('.json')).map(n=>[n,fs.readFileSync(reportsDir+'/'+n)]):[]);
const reportArchive='tmp/chemie447-applicability-unrelated-report-before-'+Date.now();fs.mkdirSync(reportArchive,{recursive:true});
for(const[n,b]of reportsBefore)fs.writeFileSync(reportArchive+'/'+n,b);
write(OUT+'/BEFORE.normal-file-archives-and-protected-pins.json',{archiveRows,otherCanonicalPins:[...canonicalBytes].filter(([p])=>p!==C).map(([p,b])=>({path:p,sha256:hash(b),bytes:b.length})),unrelatedReportArchive:reportArchive,unrelatedReportsBefore:[...reportsBefore].map(([name,b])=>({name,sha256:hash(b),bytes:b.length})),centralRegistry:pin(R)});
const intendedC=structuredClone(c);
write(C,c);write(S,sem);write(A,override);write(M,nextM);
for(const row of views.rows)if(!row.wholeViewUnchanged)write(row.normalPath,row.wholeCandidateView);
for(const row of views.rows)assert(eq(read(row.normalPath),row.wholeCandidateView),'normal view install mismatch');
const installedBeforeAP=pin(C),installedSEM=pin(S),installedMapping=pin(M),installedOverride=pin(A);
const installedSnapshot=OUT+'/C659.installed-before-single-AP.actual.json.snapshot';fs.writeFileSync(installedSnapshot,fs.readFileSync(C));
write(OUT+'/INSTALL.actual-normal-core-inputs-before-AP.json',{canonical:installedBeforeAP,semantic:installedSEM,overrideRegistry:installedOverride,sourceMapping:installedMapping,semanticClassificationsFromActualScience:semanticEvidence,newResourceLinksOnlyNoVApproval:assetChecks,otherCentralGatesUnchanged:true,pairedReceipts:[pin(pairP),pin(pairD)],newScientificJudgments:0,humanApproval:false,M7:false});
write(OUT+'/AP.started.json',{atUTC:new Date().toISOString(),exactCall:'unmodified applyApplicability.ts import once',scope:ID,stock:pin('app/scripts/applyApplicability.ts')});
process.env.APPLICABILITY_APPLY_SCOPE=ID;
console.log(JSON.stringify({phase:'AP_STARTED',scope:ID,canonical:installedBeforeAP,SEM:installedSEM}));
let apError:any=null;try{await import('../app/scripts/applyApplicability.ts')}catch(error){apError=error}
// Restore all unrelated generated report bytes, including deleted/new filenames.
for(const name of fs.readdirSync(reportsDir).filter(n=>n.endsWith('.json')&&n!==ID+'.json')){
 const b=reportsBefore.get(name);if(b)fs.writeFileSync(reportsDir+'/'+name,b);else fs.unlinkSync(reportsDir+'/'+name);
}
for(const[name,b]of reportsBefore)if(name!==ID+'.json'&&!fs.existsSync(reportsDir+'/'+name))fs.writeFileSync(reportsDir+'/'+name,b);
if(apError){write(OUT+'/AP.failed.actual.json',{atUTC:new Date().toISOString(),error:String(apError),normalCoreInstalled:true,singleAPAttempted:true,noAutomaticRerun:true});throw apError}
const report=read(reportsDir+'/'+ID+'.json');assert(report.summary.errors===0,'actual AP errors');
fs.copyFileSync(reportsDir+'/'+ID+'.json',OUT+'/AP.actual-chemistry-stock-report.json');
const after=read(C),afterBy=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
assert(after.goals.length===659,'AP goal count');
const apDeltas:any[]=[];
for(let i=0;i<c.goals.length;i++){
 const b=c.goals[i],a=after.goals[i];assert(a.id===b.id,'AP order changed');const{applicability:ba,...bs}=b,{applicability:aa,...as}=a;
 assert(eq(bs,as),'AP changed non-applicability '+a.id);if(!eq(ba??{},aa??{}))apDeltas.push({goalId:a.id,before:ba??{},after:aa??{}});
}
assert(eq(pin(S),installedSEM),'SEM changed during AP');assert(eq(pin(M),installedMapping),'mapping changed during AP');assert(eq(pin(A),installedOverride),'override changed during AP');
assert(hash(fs.readFileSync(R))===hash(centralBefore),'central D/A/M/P/QA registry changed');
for(const[p,b]of canonicalBytes)if(p!==C)assert(hash(fs.readFileSync(p))===hash(b),'other canonical changed '+p);
for(const[n,b]of reportsBefore)if(n!==ID+'.json')assert(hash(fs.readFileSync(reportsDir+'/'+n))===hash(b),'unrelated report not restored '+n);
for(const row of sem.decisions)assert(row.sourceFingerprint===fingerprintSemanticKindSourceGoal(afterBy.get(row.goalId)),'post-AP SEM stale '+row.goalId);
const viewChecks:any[]=[],missing:any[]=[],extra:any[]=[],postSelections:any[]=[];
for(const row of views.rows){
 const v=read(row.normalPath),b=beforeSelections.get(row.viewId),a=selection(v,afterBy,atoms);
 const expectedNew=plans.rows.filter((x:any)=>x.viewId===row.viewId).map((x:any)=>x.newGoalId).sort();
 for(const key of ['targetAll','supportAll','targetAtoms','supportAtoms']){
  const aOld=a[key].filter((g:string)=>!newIds.has(g));if(!eq(aOld,b[key])){const removed=b[key].filter((g:string)=>!aOld.includes(g)),added=aOld.filter((g:string)=>!b[key].includes(g));for(const gid of removed)missing.push({viewId:row.viewId,kind:key,goalId:gid,scope:v.scope,actualApplicability:afterBy.get(gid)?.applicability});for(const gid of added)extra.push({viewId:row.viewId,kind:key,goalId:gid,scope:v.scope})}
 }
 const actualNew=a.targetAtoms.filter((g:string)=>newIds.has(g));
 for(const gid of expectedNew)if(!actualNew.includes(gid))missing.push({viewId:row.viewId,kind:'new-required-target',goalId:gid,scope:v.scope,actualApplicability:afterBy.get(gid)?.applicability});
 for(const gid of actualNew)if(!expectedNew.includes(gid))extra.push({viewId:row.viewId,kind:'unapproved-new-target',goalId:gid,scope:v.scope});
 const state=v.scope.jurisdiction;
 if(state&&state!=='DE')for(const gid of a.rawCourseTargetAtoms)if(!afterBy.get(gid).applicability?.jurisdiction?.includes(state))missing.push({viewId:row.viewId,kind:'raw-authored-state-target-filter-loss',goalId:gid,scope:v.scope});
 viewChecks.push({view:pin(row.normalPath),scope:v.scope,filters:a.filters,allOldFilteredTargetAndSupportSetsExact:true,expectedNewTargets:expectedNew,actualNewTargets:actualNew,oldOrdinaryTargets:b.targetAtoms.length,ordinaryTargetsAfter:a.targetAtoms.length,oldOrdinarySupport:b.supportAtoms.length,ordinarySupportAfter:a.supportAtoms.length});
 postSelections.push({viewId:row.viewId,...a});
}
write(OUT+'/AFTER.actual41-filtered-target-support-selections.json',{canonical:pin(C),semantic:pin(S),rows:postSelections});
write(OUT+'/CHECK.actual-filtered-tuple-retention-and-missing.json',{missing,extra,viewChecks,noAPReRun:true});
assert(missing.length===0&&extra.length===0,'Actual filtered scope mismatch; inspect CHECK and report exact tuples, never hide by broad import');
const newOccurrences=postSelections.reduce((n,x)=>n+x.targetAtoms.filter((g:string)=>newIds.has(g)).length,0);assert(newOccurrences===48,'expected48 actual filtered new targets');
assert(!afterBy.get('223e33a4-5545-5332-ac4e-7d7a6cbc587c').applicability.jurisdiction.includes('DE-BY'),'BY bio leak');
assert(!postSelections.some(x=>x.scope.jurisdiction==='DE-HB'&&x.scope.courseProfile==='GK'&&x.targetAtoms.includes('4965395d-e0c5-5e23-a408-a11712aab409')),'HB GK232 leak');
const receipt=write(OUT+'/RECEIPT.normal447-and-single-AP.actual.json',{
 artifactRole:'Authorized actual normal Chemistry447 core/source/scope/view installation and single Chemistry-only stock AP; no new science',atUTC:new Date().toISOString(),
 canonicalBefore:pin(OUT+'/history/'+C),canonicalInstalledBeforeAP:pin(installedSnapshot),canonicalAfter:pin(C),semanticKinds:pin(S),overrideRegistry:pin(A),sourceMapping:pin(M),sourceSelection:selectionPin,
 actualStockAP:pin(OUT+'/AP.actual-chemistry-stock-report.json'),pairedScience:[pin(pairP),pin(pairD)],semanticClassificationsFromActualScience:semanticEvidence,newPrimaryImageBindings:assetChecks,
 normalViewPins:views.rows.map((x:any)=>pin(x.normalPath)),actualFilteredParity:pin(OUT+'/CHECK.actual-filtered-tuple-retention-and-missing.json'),beforeSelections:pin(OUT+'/BEFORE.actual41-filtered-target-support-selections.json'),afterSelections:pin(OUT+'/AFTER.actual41-filtered-target-support-selections.json'),
 counts:{allGoals:659,curricularAtomic:447,memory:68,existingClassesPreserved:654,newActualPairedClassesSerialized:5,views:41,newExplicitTargets:48,newActuallyFilteredTargets:newOccurrences,missingTuples:missing.length,extraTuples:extra.length,partialSourceGoals:232,partialSourceEdges:467,selectedSourceSuccessorUnions:15,untargetedSourceDecisionsExact:217,oldChemistryOverrideObjectsExact:42,chemistryOverrideObjectsAfter:45,newOwnJurisdictionPairs:13,applicabilityOnlyGoalDeltas:apDeltas.length,compilerErrors:report.summary.errors},
 applicabilityDifferences:apDeltas,viewScopeChecks:viewChecks,archives:pin(OUT+'/BEFORE.normal-file-archives-and-protected-pins.json'),
 checks:{allOldFilteredTargetAndSupportSetsExact:true,all48NewTuplesMatchGoalMatchesFiltersIncludingStateAndGenericViews:true,noBYBioOrHBGK232Leak:true,allOtherCanonicalFilesByteExact:true,unrelatedGeneratedReportBytesRestored:true,all659SEMSourceFPsCurrent:true,all654OldClassificationsExact:true,centralDAMPQARegistryByteExact:true,APChangedOnlyApplicability:true,allOld42ChemistryAndEconomicsOverrideObjectsExact:true,noExtraParentOrCompositionChanges:true},
 method:{stockAPScript:pin('app/scripts/applyApplicability.ts'),scope:ID,actualAPInvocations:1,scopeFilter:pin('app/src/utils/goalFilters.ts'),roleCollector:pin('app/src/utils/authoring/compositionViewAuthoring.ts')},
 assemblerRole:'Technical installer previously authored D5 and views; current scientific acceptance is from the two actual external pairs, not this installation. Five image links come from Root V-author input and create no V/human approval.',
 boundaries:{newScientificJudgments:0,newNativeDReviews:0,DAMPQARegistryChangesByThisTask:0,imageVApprovalCreated:false,humanApproval:false,humanTrial:false,M7Claim:false,extraTestsOrBuildsRun:false,finalNativeDAndVRemainRootTasks:true}});
fs.copyFileSync('tmp/chemie447_install_core_and_apply_once.mts',OUT+'/install.normal-core-and-single-AP.mts');
console.log(JSON.stringify({phase:'DONE',receipt,canonical:pin(C),SEM:pin(S),sourceMapping:pin(M),overrideRegistry:pin(A),counts:read(receipt.path).counts},null,2));
