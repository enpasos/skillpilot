import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import Ajv2020 from '../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../app/node_modules/ajv-formats/dist/index.js';
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {goalMatchesFilters} from '../../../app/src/utils/goalFilters.ts';
import {convertLearningGoal} from '../../../app/src/goalTypes.ts';
import {fingerprintSemanticKindSourceGoal} from '../../../app/scripts/goalBookModel.ts';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../app/scripts/positiveGoalEvidenceProfileModel.ts';

const O='tmp/chemie-m7-resumed-20261016/generic-SekI-two-priors-three-views-independent-a-v1';
const A='tmp/chemie-m7-resumed-20261016/generic-SekI-fourteen-interface-author-candidate-v1';
const L='tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(p:string)=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const pin=(p:string)=>({path:p,sha256:sha(p),bytes:fs.statSync(p).size});
const sort=(v:any):any=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
const fp=(v:any)=>'sha256:'+createHash('sha256').update(JSON.stringify(sort(v))).digest('hex');
const save=(name:string,v:any)=>{const p=O+'/'+name;assert.ok(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');read(p);return pin(p)};

const first=O+'/FIRST.two-priors-three-views.independent-a.science.frozen.json';
assert.equal(sha(first),'sha256:56b08b822082d8ab41677000a880a7f17567a897f57c00954d007155f3af5021');
const firstBody=read(first);assert.ok(firstBody.overallScientificDecision.startsWith('KEEP'));
const selector=A+'/OUTPUTS.FINAL.generic-SekI-fourteen-interfaces-and-two-NI-acquisition.AUTHOR.selector.json';
assert.equal(sha(selector),'sha256:fe2e63e1cf7ad5e0274214bc665b0f9ccb1b388dcb4c8ef928f5b5103f1a6156');
const casFile=A+'/CAS.FINAL.two-whole-goals-three-whole-views-two-SEM-bindings.AUTHOR.inactive.json';
assert.equal(sha(casFile),'sha256:14327a3ad640f5acaab16626aa645b8393c56978640be74dd10ffafc806396ca');
const cas=read(casFile),can=read(cas.baselineCanonical.path),sem=read(cas.baselineSEM.path);
const guards=[cas.baselineCanonical,cas.baselineSEM,...read(A+'/INPUTPINS.source-current-P-M-and-stock-contracts.unchanged.json').files];
for(const x of guards)assert.equal(sha(x.path),x.sha256,x.path);
const by=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]));
const afterBy=new Map(by),semBy=new Map<string,any>(sem.decisions.map((s:any)=>[s.goalId,s]));
for(const op of cas.goalOperations){
 assert.deepEqual(by.get(op.goalId),op.before);assert.equal(fp(op.before),op.beforeWholeFingerprint);assert.equal(fp(op.after),op.afterWholeFingerprint);
 assert.deepEqual({...op.after,requires:op.before.requires},op.before);
 assert.equal(sha(op.afterFile.path),op.afterFile.sha256);assert.deepEqual(read(op.afterFile.path),op.after);
 afterBy.set(op.goalId,op.after);
}
assert.equal(can.goals.length,641);assert.equal(afterBy.size,641);
assert.equal(can.goals.filter((g:any)=>fp(g)!==fp(afterBy.get(g.id))).length,2);
for(const op of cas.semanticBindingOperations){
 assert.deepEqual(semBy.get(op.goalId),op.before);assert.equal(fp(op.before),op.beforeWholeFingerprint);assert.equal(fp(op.after),op.afterWholeFingerprint);
 assert.deepEqual({...op.after,sourceFingerprint:op.before.sourceFingerprint},op.before);
 assert.equal(fingerprintSemanticKindSourceGoal(by.get(op.goalId)),op.before.sourceFingerprint);
 assert.equal(fingerprintSemanticKindSourceGoal(afterBy.get(op.goalId)),op.after.sourceFingerprint);
}
assert.deepEqual(cas.sourceOperations,[]);assert.equal(cas.goalOperations.length,2);assert.equal(cas.semanticBindingOperations.length,2);assert.equal(cas.viewOperations.length,3);
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);ajv.addKeyword({keyword:'x-skillpilot-listSemantics',valid:true});
ajv.addKeyword({keyword:'x-skillpilot-caseInsensitiveUniqueItems',type:'array',schemaType:'boolean',validate:(enabled:boolean,value:any[])=>!enabled||new Set(value.map(x=>typeof x==='string'?x.toLocaleLowerCase():JSON.stringify(x))).size===value.length});
const validateView=ajv.compile(read('contracts/curriculum-package/v1/composition-view.schema.json'));
const validateP=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const compiledSchema=read('docs/landscape-runtime.schema.json');
const rawGoalAjv=new Ajv2020({allErrors:true,strict:false});addFormats(rawGoalAjv);rawGoalAjv.addSchema(compiledSchema);
const validateGoal=rawGoalAjv.compile({$schema:'https://json-schema.org/draft/2020-12/schema',$ref:compiledSchema.$id+'#/$defs/goal'});
for(const op of cas.goalOperations)assert.ok(validateGoal(op.after),ajv.errorsText(validateGoal.errors));
const afterCan={...can,goals:can.goals.map((g:any)=>afterBy.get(g.id))};
const roles=(v:any,map:Map<string,any>)=>{
 const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,map),tokens=[v.scope.courseProfile,v.scope.jurisdiction,v.scope.durationModel].filter(Boolean);
 return {target:new Set([...r.targetGoalIds].filter(i=>goalMatchesFilters(convertLearningGoal(map.get(i),{landscapeId:can.landscapeId}),tokens))),support:r.prerequisiteOnlyGoalIds};
};
const direct=(map:Map<string,any>,r:any)=>[...r.target].filter((i:any)=>semBy.get(i)?.semanticKind==='curricularAtomic'&&!(map.get(i).contains??[]).length).flatMap((i:any)=>(map.get(i).requires??[]).filter((p:string)=>!r.target.has(p)&&!r.support.has(p)).map((p:string)=>({consumerGoalId:i,priorId:p})));
const closure=(map:Map<string,any>,r:any)=>{const seen=new Set<string>();const active=new Set<string>();const visit=(i:string)=>{assert.ok(!active.has(i),'requires cycle '+i);if(seen.has(i))return;assert.ok(map.has(i),'missing goal '+i);seen.add(i);active.add(i);for(const j of map.get(i).requires??[])visit(j);active.delete(i)};for(const i of r.target)if(semBy.get(i)?.semanticKind==='curricularAtomic')visit(i);return [...seen].filter(i=>!r.target.has(i)&&!r.support.has(i)).sort()};
const nodes=(v:any)=>{const a:any[]=[];const walk=(n:any)=>{a.push(n);for(const x of n.children??[])walk(x)};for(const n of v.rootNodes)walk(n);return a};
const viewChecks:any[]=[];
for(const op of cas.viewOperations){
 const p=L+'/'+op.targetPath;assert.equal(sha(p),op.expectedCurrentFileSha256);assert.deepEqual(read(p),op.before);
 assert.equal(fp(op.before),op.beforeWholeFingerprint);assert.equal(fp(op.after),op.afterWholeFingerprint);assert.equal(sha(op.afterFile.path),op.afterFile.sha256);assert.deepEqual(read(op.afterFile.path),op.after);
 assert.deepEqual(op.after.scope,op.before.scope);assert.ok(validateView(op.after),ajv.errorsText(validateView.errors));
 const before=roles(op.before,by),after=roles(op.after,afterBy);
 const added=[...after.target].filter(i=>!before.target.has(i)).sort();assert.deepEqual(added,[...op.addedTargetIds].sort());
 assert.deepEqual([...before.target].filter(i=>!after.target.has(i)),[]);
 assert.deepEqual([...before.support].sort(),[...after.support].sort());
 const undo=structuredClone(op.after);
 const strip=(n:any)=>{if(n.children){n.children=n.children.filter((x:any)=>!(x.kind==='goalEntry'&&added.includes(x.goalId)));for(const c of n.children)strip(c);n.children=n.children.filter((x:any)=>!(x.kind==='structure'&&x.children.length===0&&!nodes(op.before).some((b:any)=>b.kind==='structure'&&b.id===x.id)))}};
 for(const n of undo.rootNodes)strip(n);assert.deepEqual(undo,op.before);
 for(const i of added){assert.equal(semBy.get(i)?.semanticKind,'curricularAtomic');assert.equal(afterBy.get(i).contains.length,0);assert.ok(!before.support.has(i));}
 const compile=compileCompositionView(normalizeCompositionView(op.after),afterCan);assert.deepEqual(compile.findings.filter(x=>x.severity==='error'),[]);
 const oldMissing=direct(by,before),newMissing=direct(afterBy,after),oldClosure=closure(by,before),newClosure=closure(afterBy,after);
 const newGoalContexts=cas.goalOperations.filter((g:any)=>after.target.has(g.goalId)).map((g:any)=>({goalId:g.goalId,requires:g.after.requires.map((i:string)=>({goalId:i,role:after.target.has(i)?'target':after.support.has(i)?'prerequisiteOnly':'absent'}))}));
 for(const x of newGoalContexts)for(const r of x.requires)assert.notEqual(r.role,'absent');
 if(op.after.viewId==='de-de-gym-seki-chemistry'){assert.equal(oldMissing.length,14);assert.deepEqual(newMissing,[]);assert.equal(oldClosure.length,11);assert.deepEqual(newClosure,[])}
 viewChecks.push({viewId:op.after.viewId,scope:op.after.scope,beforeFile:pin(p),afterFile:pin(op.afterFile.path),addedTargetIds:added,supportRolesAndAllOldNodesExact:true,stockCompileFindings:compile.findings,schemaErrors:0,ordinaryTargetsBefore:[...before.target].filter(i=>semBy.get(i)?.semanticKind==='curricularAtomic').length,ordinaryTargetsAfter:[...after.target].filter(i=>semBy.get(i)?.semanticKind==='curricularAtomic').length,directMissingBefore:oldMissing,directMissingAfter:newMissing,closureMissingBefore:oldClosure,closureMissingAfter:newClosure,changedGoalContexts:newGoalContexts});
}
// Verify acyclicity for the changed dependency contexts and their ancestor closure, not a broad new audit.
for(const op of cas.goalOperations)closure(afterBy,{target:new Set([op.goalId]),support:new Set()});
const input=read(A+'/INPUT.exact-COMBINED-selected22-wholes-and-current-P-only.json');
const criteria='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md';
const reviewId='chemie-generic-seki-two-priors-three-views-independent-a-20261016-v1';
const records:any[]=[],bindings:any[]=[];
for(const op of cas.goalOperations){
 const old=input.wholePRecords.find((r:any)=>r.goalId===op.goalId),digests:any={},assets:any[]=[];
 for(const r of op.after.resourceLinks??[])if(r.type==='goal-visualization'){const p=L+'/app/public'+r.url;digests[r.url]=sha(p);assets.push(pin(p));}
 assert.equal(old.goalFingerprint,fingerprintGoalForPositiveEvidence(op.before,'curricularAtomic'));
 assert.equal(old.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(old.profile));
 assert.equal(old.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(op.before,old.reviewCriteriaFingerprint,digests,'curricularAtomic'));
 const verdict=firstBody.decisions.find((d:any)=>d.goalId===op.goalId);assert.equal(verdict.decision,'KEEP');
 const record={...old,reviewId,reviewCriteriaFingerprint:sha(criteria),reviewedAt:new Date().toISOString(),reviewer:'Codex GPT-6 independent reviewer A /root/chemie_generic_seki_two_priors_three_views_independent_a_20261016; own scientific FIRST before mechanics',status:'needs_human_review',reviewAuthority:'ai_candidate',reason:'INDEPENDENT TARGETED KEEP of the complete unchanged bilingual UnderstandingProfile and whole supplied material/case/solution/boundary bodies in the actually proposed requires context. '+verdict.scientificReason+' FIRST '+sha(first)+'. No two-task or experiment quota is added; rich multi-step transfer can suffice. This record is AI design evidence only, E1/G1; no learner outcome or human approval.',goalFingerprint:fingerprintGoalForPositiveEvidence(op.after,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(op.after,sha(criteria),digests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(old.profile),evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[reviewId],dissent:[]};
 assert.deepEqual(record.profile,old.profile);assert.equal(record.profileFingerprint,old.profileFingerprint);
 assert.ok(validateP(record),ajv.errorsText(validateP.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,op.after,digests,'curricularAtomic'),[]);
 records.push(record);bindings.push({goalId:op.goalId,oldProfileFingerprint:old.profileFingerprint,newProfileFingerprint:record.profileFingerprint,wholeProfileAndCasesExact:true,oldInputFingerprint:old.reviewInputFingerprint,newInputFingerprint:record.reviewInputFingerprint,assets,schemaErrors:0,semanticErrors:0});
}
const recordPath=O+'/P2.own-independent-current-requires-contexts.review.jsonl';assert.ok(!fs.existsSync(recordPath));fs.writeFileSync(recordPath,records.map(r=>JSON.stringify(r)).join('\n')+'\n');assert.equal(fs.readFileSync(recordPath,'utf8').trim().split('\n').map(x=>JSON.parse(x)).length,2);
for(const x of guards)assert.equal(sha(x.path),x.sha256,x.path);
for(const op of cas.viewOperations)assert.equal(sha(L+'/'+op.targetPath),op.expectedCurrentFileSha256);
assert.equal(sha(first),'sha256:56b08b822082d8ab41677000a880a7f17567a897f57c00954d007155f3af5021');
const check=save('CHECK.actual-independent-guarded-CAS-three-views-P2.json',{role:'Own actual finite technical checks after sealed own FIRST',scienceFIRST:pin(first),authorSelector:pin(selector),CAS:pin(casFile),actualChecks:{wholeGoalCAS:2,wholeSEMCAS:2,wholeViewCAS:3,stockViewCompiles:3,viewSchemaErrors:0,changedGoalSchemaErrors:0,P2SchemaErrors:0,P2SemanticErrors:0,sourceMappingWriteOperations:0,other639GoalsExact:true,other639SEMDecisionsExact:true,privateBaselineAndSourceAndContractPinsStillExact:true,unchangedP439AndM439FilesExact:true,requiresCyclesInChangedClosure:0},views:viewChecks,P2Bindings:bindings,criteria:pin(criteria),sourceEffect:{sourceTextAndMappingArraysUnchanged:true,changedRequiresAffectsFutureAPVCompilerDependency:true,fullAPVRun:false,normalRwrites:false,privateL6writes:false},HumanApproval:false,HumanTrial:false,M7Claim:false,nativeDClaim:false});
const run=save('RUN.actual-own-generation-and-science-boundary.json',{runId:reviewId,reviewerIdentity:firstBody.reviewerIdentity,startedFromScienceFIRST:pin(first),scienceOnlyInputs:firstBody.scienceInputs,criteria:pin(criteria),record:pin(recordPath),scope:records.map(x=>x.goalId),maximumClaimScope:'G1',evidenceLevel:'E1',HumanApproval:false,HumanTrial:false,productionWrite:false});
const final=save('OUTPUTS.two-priors-three-views.independent-a.sealed-selector.json',{role:'Independent A targeted KEEP + own P2; read-only CAS simulation, not applied',status:'KEEP_bounded_candidate_ai_only',authorSelector:pin(selector),scienceFIRST:pin(first),scienceInputs:firstBody.scienceInputs,actualChecks:check,ownCurrentP2:pin(recordPath),ownGenerationRecord:run,authorCAS:pin(casFile),counts:{changedRequiresReviewed:2,wholeProfilesRetained:2,threeViewsChecked:3,newOwnCurrentPRecords:2,sourceWrites:0,Rwrites:0,L6writes:0},limitations:['No full APV, source-state synchronization, normal D page measurement or actual NativeD performed','No M7, HumanApproval, HumanTrial, host acceptance or deployment claimed'],HumanApproval:false,HumanTrial:false,M7Claim:false});
console.log(JSON.stringify({selector:final,scienceFIRST:pin(first),P2:pin(recordPath),actualCheck:check}));
