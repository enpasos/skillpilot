// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const R='/home/enpasos/projects/skillpilot';
const T=R+'/tmp/chemie-m7-resumed-20261016';
const L=T+'/chemie-shared640-recycling-native-author-capsule-L6-v1';
const A=T+'/BB-BE-remaining-seven-prior-interface-author-successor-v1';
const O=T+'/eight-prior-successors-and-pressure-extension-independent-a-v1';
const rd=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(v:any)=>'sha256:'+crypto.createHash('sha256').update(v).digest('hex');
const pin=(p:string)=>({path:p.slice(R.length+1),sha256:sha(fs.readFileSync(p)),bytes:fs.statSync(p).size});
const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const fp=(v:any)=>sha(stable(v));
const put=(n:string,d:any)=>{const b=JSON.stringify(d,null,2)+'\n';if(fs.existsSync(O+'/'+n))assert.equal(fs.readFileSync(O+'/'+n,'utf8'),b);else fs.writeFileSync(O+'/'+n,b,{flag:'wx'});};
const firstp=O+'/FIRST.independent-a.science-before-stock.sealed.json';
assert.equal(pin(firstp).sha256,'sha256:e455c2cd2dba07866fb973fc48d409635c0860ec1bf9ff1cf1c3c3f6f9a8cd55');
const first=rd(firstp);
const selector=rd(A+'/OUTPUTS.FINAL.eight-whole-requires-and-eight-SEM-bindings.AUTHOR.selector.json');
assert.equal(pin(A+'/OUTPUTS.FINAL.eight-whole-requires-and-eight-SEM-bindings.AUTHOR.selector.json').sha256,'sha256:0dd69a79051bb0e9d99b61f2c35e8800f734396224898abe1387b60764d9eb14');
for(const v of Object.values(selector) as any[])if(v?.path&&v?.sha256)assert.deepEqual(pin(R+'/'+v.path),v);
const gc=rd(R+'/'+selector.wholeGoalCAS.path),sc=rd(R+'/'+selector.wholeSEMsourceBindingCAS.path);
const can=rd(R+'/'+selector.canonicalBefore.path),before=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]));
const after=new Map(before),sem=rd(R+'/'+sc.sourceLedger.path),kinds=new Map<string,string>(sem.decisions.map((s:any)=>[s.goalId,s.semanticKind]));
const {fingerprintSemanticKindSourceGoal}=await import(L+'/app/scripts/goalBookModel.ts');
const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics}=await import(L+'/app/scripts/positiveGoalEvidenceProfileModel.ts');
const {buildGoalDescriptionCanonicalContext}=await import(L+'/app/scripts/validateGoalDescriptionReviewCampaign.ts');
const {collectCompositionProjectionRoleGoalIds}=await import(L+'/app/src/utils/authoring/compositionViewAuthoring.ts');
const {goalMatchesFilters}=await import(L+'/app/src/utils/goalFilters.ts');
const {getSrsFilterTags}=await import(L+'/app/src/utils/srsTags.ts');
const {default:Ajv2020}=await import(R+'/app/node_modules/ajv/dist/2020.js');
const ajv=new Ajv2020({strict:false,allErrors:true});
ajv.addFormat('date-time',{type:'string',validate:(v:string)=>Number.isFinite(Date.parse(v))});
const gs=rd(R+'/docs/landscape-runtime.schema.json');
const vg=ajv.compile({...gs.$defs.goal,$defs:gs.$defs});
const vp=ajv.compile(rd(R+'/contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const vv=ajv.compile(rd(R+'/contracts/curriculum-package/v1/composition-view.schema.json'));
assert.equal(gc.operations.length,8);assert.equal(sc.operations.length,8);
const wholeCAS=[];
for(const op of gc.operations){
 assert.deepEqual(before.get(op.goalId),op.before);assert.equal(fp(op.before),op.beforeWholeFingerprint);assert.equal(fp(op.after),op.afterWholeFingerprint);
 assert.deepEqual(op.after,{...op.before,requires:op.after.requires});assert(vg(op.after),JSON.stringify(vg.errors));
 const own=first.findings.find((r:any)=>r.goalId===op.goalId);assert.deepEqual(own.wholeBefore,op.before);assert.deepEqual(own.wholeAfter,op.after);
 after.set(op.goalId,op.after);
 const so=sc.operations.find((r:any)=>r.goalId===op.goalId),sb=sem.decisions.find((r:any)=>r.goalId===op.goalId);
 assert.deepEqual(sb,so.before);assert.equal(fp(so.before),so.beforeWholeFingerprint);assert.equal(fp(so.after),so.afterWholeFingerprint);
 assert.equal(so.before.sourceFingerprint,fingerprintSemanticKindSourceGoal(op.before));assert.equal(so.after.sourceFingerprint,fingerprintSemanticKindSourceGoal(op.after));
 assert.deepEqual(so.after,{...so.before,sourceFingerprint:so.after.sourceFingerprint});
 wholeCAS.push({goalId:op.goalId,beforeWholeFingerprint:fp(op.before),afterWholeFingerprint:fp(op.after),requiresOnly:true,goalSchemaPASS:true,SEMsourceOnlyPASS:true,kind:kinds.get(op.goalId)});
}
function dag(m:Map<string,any>,edge:string){const active=new Set<string>(),done=new Set<string>(),err:any[]=[];function walk(i:string,path:string[]){if(active.has(i)){err.push({cycle:[...path,i]});return;}if(done.has(i))return;active.add(i);for(const j of m.get(i)?.[edge]??[]){if(!m.has(j))err.push({missing:j,consumer:i});else walk(j,[...path,i]);}active.delete(i);done.add(i);}for(const i of m.keys())walk(i,[]);return err;}
const dagChecks={beforeRequires:dag(before,'requires'),afterRequires:dag(after,'requires'),afterContains:dag(after,'contains')};assert(Object.values(dagChecks).every((x:any)=>!x.length));
const historical=rd(R+'/'+selector.allAffectedCurrentAndFourOverlayViewContexts.path);
const overlay=rd(R+'/'+selector.retainedFourViewCAS.path);
const viewDir=L+'/curricula/DE/Gymnasium/composition-views/chemie';
const files=fs.readdirSync(viewDir).filter(n=>n.endsWith('.json')).sort();assert.equal(files.length,39);
const viewPins=[],pinDrift=[],contexts=[],pressureRoles=[];
function roles(v:any){const q=collectCompositionProjectionRoleGoalIds(v.rootNodes,before);return{target:new Set([...q.targetGoalIds].filter((i:any)=>goalMatchesFilters(before.get(i),[v.scope.courseProfile,v.scope.jurisdiction,v.scope.durationModel].filter(Boolean)))),support:q.prerequisiteOnlyGoalIds};}
const role=(r:any,id:string)=>r.target.has(id)?'target':r.support.has(id)?'prerequisiteOnly':'absent';
function pathTo(start:string,wanted:string){const q:any[]=[[start,[start]]],seen=new Set();while(q.length){const[i,path]=q.shift();if(i===wanted)return path;if(seen.has(i))continue;seen.add(i);for(const j of after.get(i)?.requires??[])q.push([j,[...path,j]]);}return null;}
for(const file of files){
 const path=viewDir+'/'+file,view=rd(path),current=pin(path),old=historical.all39ViewPins.find((p:any)=>p.path===current.path);assert(old);
 viewPins.push(current);if(current.sha256!==old.sha256)pinDrift.push({file,current,historical:old,sameHistoricalPin:false,reportedCause:'Root reported one266a prerequisiteOnly subtree addition in each BW GK/LK; historic exact pin fails and is preserved'});
 const ov=overlay.operations.find((x:any)=>x.targetPath.split('/').at(-1)===file);
 if(ov){assert.deepEqual(view,ov.before);assert.equal(fp(ov.before),ov.expectedCurrentWholeObjectFingerprint);assert.equal(current.sha256,ov.expectedCurrentFileSha256);assert.deepEqual(pin(R+'/'+ov.afterArtifact.path),ov.afterArtifact);assert.deepEqual(rd(R+'/'+ov.afterArtifact.path),ov.after);}
 for(const variant of ['ACTUAL39','SEALED_FOUR_VIEW_OVERLAY']){
  if(variant!=='ACTUAL39'&&!ov)continue;const v=variant==='ACTUAL39'?view:ov.after;assert(vv(v),JSON.stringify(vv.errors));const r=roles(v);
  if(variant!=='ACTUAL39')pressureRoles.push({viewId:v.viewId,scope:v.scope,role:role(r,'5c4788a7-6760-53dc-894e-e04bca6f8cd9'),officialWholeCoverageCredit:0,decision:'KEEP explicit authored extension only; all remaining view HOLDS retained'});
  for(const op of gc.operations){if(role(r,op.goalId)==='absent')continue;
   const b=op.before.requires.map((id:string)=>({goalId:id,role:role(r,id)})),a=op.after.requires.map((id:string)=>({goalId:id,role:role(r,id)}));
   const bm=b.filter((x:any)=>x.role==='absent').map((x:any)=>x.goalId),am=a.filter((x:any)=>x.role==='absent').map((x:any)=>x.goalId);
   const fresh=am.filter((id:string)=>!bm.includes(id));
   const consumers=[...r.target].flatMap((id:any)=>{const p=pathTo(id,op.goalId);return p&&p.length>1?[{consumerId:id,shortestPath:p}]:[]});
   contexts.push({variant,viewId:v.viewId,scope:v.scope,goalId:op.goalId,kind:kinds.get(op.goalId),goalRole:role(r,op.goalId),provenance:op.after.extendedData?.provenance??null,canonicalApplicability:op.after.applicability,directBefore:b,directAfter:a,missingBefore:bm,missingAfter:am,newMissingPriorIds:fresh,newlyBrokenPreviouslyDirectClosedContext:bm.length===0&&am.length>0,alreadyDirectOpenBefore:bm.length>0,targetConsumersViaChangedInterface:consumers,decision:am.length?'HOLD missing acquisition; no implicit target or mastery':'No direct acquisition omission; no full-source/route clearance'});
  }
 }
}
assert.equal(pressureRoles.length,4);assert(pressureRoles.every(x=>x.role==='target'));
assert.deepEqual(pinDrift.map(x=>x.file),['de-bw-gk.view.json','de-bw-lk.view.json']);
const currentSummary=Object.fromEntries(['ACTUAL39','SEALED_FOUR_VIEW_OVERLAY'].map(v=>{const rr=contexts.filter((x:any)=>x.variant===v);return[v,{presentChangedGoalContexts:rr.length,newMissingPriorIdContexts:rr.filter((x:any)=>x.newMissingPriorIds.length).length,newlyBrokenPreviouslyDirectClosedContexts:rr.filter((x:any)=>x.newlyBrokenPreviouslyDirectClosedContext).length,alreadyDirectOpenBeforeWithNewMissingPriorId:rr.filter((x:any)=>x.alreadyDirectOpenBefore&&x.newMissingPriorIds.length).length}]}));
assert.equal(currentSummary.ACTUAL39.newlyBrokenPreviouslyDirectClosedContexts,19);
assert.equal(currentSummary.ACTUAL39.newMissingPriorIdContexts,39);assert.equal(currentSummary.SEALED_FOUR_VIEW_OVERLAY.newMissingPriorIdContexts,4);
const all4path=R+'/'+selector.retainedFourViewCAS.path;
put('CHECK.current39-plus-four.finite-role-source-course-effects.json',{role:'Independent finite selected8 role/source/course check; historic BW pin mismatch reported, no full route/APV/compiler claim',scienceFIRST:pin(firstp),historicalAuthor39:pin(R+'/'+selector.allAffectedCurrentAndFourOverlayViewContexts.path),allCurrent39Pins:viewPins,historicalWholeViewPinPASS:false,historicalPinDrift:pinDrift,overlayPin:pin(all4path),contexts,summary:currentSummary,pressureRoles,requiresDoesNotPromoteTarget:true,missingAcquisitionHOLD:true});
const input=rd(A+'/INPUT.actual-focused-whole-goals-and-current-P.before-author-decisions.json');
assert.deepEqual(pin(R+'/'+input.currentPVector.path),input.currentPVector);
const vector=fs.readFileSync(R+'/'+input.currentPVector.path,'utf8').trim().split('\n').map(JSON.parse);
const byP=new Map(vector.map((p:any)=>[p.goalId,p]));
const measure=rd(R+'/'+selector.nativePAndCaseDeltaMeasure.path);
const criteriaPath=L+'/curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md';
const criteriaMap=new Map([criteriaPath,L+'/curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'].map(path=>{const p=pin(path);return[p.sha256,p]}));
const records=[],pChecks=[],assets=[];
for(const op of gc.operations){
 const kind=kinds.get(op.goalId),p:any=byP.get(op.goalId);if(kind==='memory'){assert(!p);continue;}assert(p);
 const authorRow=measure.rows.find((x:any)=>x.goalId===op.goalId);assert.deepEqual(p,authorRow.wholeCurrentPRecord);
 const criteria=criteriaMap.get(p.reviewCriteriaFingerprint);assert(criteria);
 const digests:any={};for(const link of op.after.resourceLinks??[]){if(link.type==='goal-visualization'){const f=L+'/app/public'+link.url;digests[link.url]=sha(fs.readFileSync(f));assets.push({goalId:op.goalId,resourceUrl:link.url,pin:pin(f)});}}
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(p,op.before,digests,kind),[]);
 const own=first.findings.find((x:any)=>x.goalId===op.goalId),n={...p,reviewId:'chemie-eight-prior-current-context-independent-a-20261016-v1',reviewer:'Codex independent chemistry reviewer A',reviewedAt:new Date().toISOString(),reason:'Independent whole-current-context follow-up. '+own.scientificReason+' '+own.independentCaseChecks+' FIRST '+pin(firstp).sha256+'; original criteria and full scientific profile retained. Source/course/role HOLD remains separate; E1/G1 design only.',reviewRunIds:[],dissent:['Source/course/role acquisition omissions remain HOLD where named in finite contexts. No nationwide scope, real learner evidence, human acceptance or strict M7 closure is claimed.'],status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',goalFingerprint:fingerprintGoalForPositiveEvidence(op.after,kind),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(op.after,p.reviewCriteriaFingerprint,digests,kind),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p.profile)};
 assert.equal(n.goalFingerprint,p.goalFingerprint);assert.notEqual(n.reviewInputFingerprint,p.reviewInputFingerprint);assert.equal(n.profileFingerprint,p.profileFingerprint);assert.deepEqual(n.profile,p.profile);
 assert(vp(n),JSON.stringify(vp.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(n,op.after,digests,kind),[]);records.push(n);
 pChecks.push({goalId:op.goalId,currentOriginalCriteria:criteria,wholeBodyRetained:true,originalProfileFingerprint:p.profileFingerprint,goalBefore:p.goalFingerprint,goalAfter:n.goalFingerprint,inputBefore:p.reviewInputFingerprint,inputAfter:n.reviewInputFingerprint,profileAfter:n.profileFingerprint,bilingualCaseCount:n.profile.applicationCaseBriefs.length,nativeContextBefore:fp(buildGoalDescriptionCanonicalContext(op.before)),nativeContextAfter:fp(buildGoalDescriptionCanonicalContext(op.after)),stockSchemaPASS:true,stockSemanticsPASS:true});
}
assert.equal(records.length,7);
fs.writeFileSync(O+'/P7.independent-a.current-successor-whole-unchanged-bodies.jsonl',records.map(x=>JSON.stringify(x)).join('\n')+'\n',{flag:'wx'});
const mem=gc.operations.find((x:any)=>kinds.get(x.goalId)==='memory'),deckfile=L+'/app/public/data/de_gymnasium_chemistry_flashcards_natural_q2.de.json',deck=rd(deckfile),tags=getSrsFilterTags(mem.after.tags),cards=deck.cards.filter((c:any)=>tags.some((t:string)=>(c.tags??[]).includes(t)));
assert.deepEqual(tags,getSrsFilterTags(mem.before.tags));assert.equal(cards.length,5);const am=rd(R+'/'+selector.fiveUnchangedMemoryCards.path);assert.deepEqual(cards,am.rows[0].wholeSelectedCards);assert.equal(pin(deckfile).sha256,am.rows[0].cardFile.sha256);
const e3=before.get('e3e8582a-976b-5f0f-b31b-3cf59a4fff24'),e3deck=L+'/app/public'+e3.extendedData.vocabularySource,e3tags=getSrsFilterTags(e3.tags),e3cards=rd(e3deck).cards.filter((c:any)=>e3tags.some((t:string)=>(c.tags??[]).includes(t)));assert.equal(e3cards.length,10);
const materialChecks=[];const ext=rd(A+'/INPUT.all-explicitly-bound-64a-and-a76-whole-DEEN-material-cases.json');
for(const s of ext.sources){assert.equal(pin(R+'/'+s.path).sha256,s.sha256);const original=rd(R+'/'+s.path);for(const c of s.wholeSelectedCases){const cId=c.id??c.case?.id;const oc=original.cases.find((x:any)=>(x.id??x.case?.id)===cId&&x.goalId===c.goalId);assert.deepEqual(oc,c);materialChecks.push({goalId:c.goalId,caseId:cId,actualOriginalFile:pin(R+'/'+s.path),wholeCaseHash:fp(c),wholeMaterialTaskSolutionRubricExact:true});}}
const sparse={canonicalStillExact:pin(R+'/'+selector.canonicalBefore.path),SEMStillExact:pin(R+'/'+sc.sourceLedger.path),allOtherGoalsExact:can.goals.length-8,allOtherSEMDecisionsExact:sem.decisions.length-8,fullGoalCAS:wholeCAS,dagChecks,sevenCurrentP:pChecks,retainedAssets:assets,externalFourWholeMaterials:materialChecks,memory:{goalId:mem.goalId,deck:pin(deckfile),filterTags:tags,selectedCards:cards,full311FiveCardSelection:true,e3UnchangedWholeFingerprint:fp(e3),e3Deck:pin(e3deck),e3SelectedCardIds:e3cards.map((x:any)=>x.id),e3TenCardScopeHOLD:true,'3bcUnchangedWholeFingerprint':fp(before.get('3bc48951-025c-5144-99b1-924db611a5f9')),newMVote:false},formalRunManifest:null,reviewRunIds:[],P7Records:pin(O+'/P7.independent-a.current-successor-whole-unchanged-bodies.jsonl'),scienceFIRST:pin(firstp),APV:0,central:0,build:0,nativeD:0,backendTests:0,normalOrL6Writes:0,M7Claim:false,humanApproval:false};
put('CHECK.actual-CAS-SEM-DAG-P7-schema-fingerprints-materials-and-cards.json',sparse);
console.log(JSON.stringify({result:'PASS targeted checks with explicit role/source HOLD and two historic BW pin mismatches',wholeGoalCAS:8,SEMsourceOnly:8,P7:7,fullBodies:7,briefCases:14,current39:currentSummary.ACTUAL39,overlay4:currentSummary.SEALED_FOUR_VIEW_OVERLAY,historicalViewPinDrifts:pinDrift.map(x=>x.file),pressureRoles:4,officialPressureWholeSourceCredit:0,normalL6Writes:0}));
