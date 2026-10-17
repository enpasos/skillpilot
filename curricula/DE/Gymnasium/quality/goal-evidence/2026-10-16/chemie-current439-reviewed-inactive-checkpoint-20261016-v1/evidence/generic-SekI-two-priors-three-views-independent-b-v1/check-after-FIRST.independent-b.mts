// SPDX-License-Identifier: Apache-2.0
// Only own-output writes; candidate CAS is simulated in memory.
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
import {parseGoalBookEvidenceReviewRecord} from '../../../app/scripts/goalBookEvidenceReviewLoader.ts';

const B='tmp/chemie-m7-resumed-20261016',D=B+'/generic-SekI-fourteen-interface-author-candidate-v1',O=B+'/generic-SekI-two-priors-three-views-independent-b-v1',L=B+'/chemie-shared640-recycling-native-author-capsule-L6-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(p:string)=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const pin=(p:string)=>({path:p,sha256:sha(p),bytes:fs.statSync(p).size});
const sorted=(x:any):any=>Array.isArray(x)?x.map(sorted):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sorted(x[k])])):x;
const fp=(x:any)=>'sha256:'+createHash('sha256').update(JSON.stringify(sorted(x))).digest('hex');
const save=(name:string,x:any)=>{const p=O+'/'+name;assert.ok(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');JSON.parse(fs.readFileSync(p,'utf8'));return pin(p)};
const F=O+'/FIRST.independent-b.science.frozen.json';assert.equal(sha(F),'sha256:92c1fd8b28739036cbc7b1e215abb13772dc4d3a4d08b0b2e92a65d0cbca84f9');
const first=read(F);assert.equal(first.scientificVerdict,'keep');
assert.equal(sha(D+'/OUTPUTS.FINAL.generic-SekI-fourteen-interfaces-and-two-NI-acquisition.AUTHOR.selector.json'),'sha256:fe2e63e1cf7ad5e0274214bc665b0f9ccb1b388dcb4c8ef928f5b5103f1a6156');
const cas=read(D+'/CAS.FINAL.two-whole-goals-three-whole-views-two-SEM-bindings.AUTHOR.inactive.json');assert.equal(sha(first.inactiveCAS.path),first.inactiveCAS.sha256);
const cr=cas.baselineCanonical.path,sr=cas.baselineSEM.path;
assert.equal(sha(cr),'sha256:37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80');assert.equal(sha(sr),cas.baselineSEM.sha256);
const can=read(cr),sem=read(sr),after=structuredClone(can),afterSEM=structuredClone(sem);
const beforeBy=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]));
const unchangedPins:any[]=[pin(cr),pin(sr)];
const viewDir=L+'/curricula/DE/Gymnasium/composition-views/chemie';
const allViewPaths=fs.readdirSync(viewDir).filter(x=>x.endsWith('.view.json')).map(x=>viewDir+'/'+x);
const selected=read(D+'/INPUT.exact-COMBINED-selected22-wholes-and-current-P-only.json');
const baselineProfilePins=selected.wholePRecords.map((x:any)=>({goalId:x.goalId,profileFingerprint:fp(x.profile)}));
const sourcePaths:string[]=[];
const sourceBases=['curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction','curricula/DE/Gymnasium/input/NI/upper-secondary/source-extraction','curricula/DE/Gymnasium/mapping/DE-BY/gymnasium','curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary'];
for(const base of sourceBases){const p=L+'/'+base;for(const f of fs.readdirSync(p))if(f.endsWith('.json')&&/chem/i.test(f))sourcePaths.push(p+'/'+f);}
unchangedPins.push(...[...allViewPaths,...sourcePaths,selected.P439.path,...first.externalCompleteMaterialAudit.actualFiles.map((x:any)=>x.path)].map(pin));
assert.equal(cas.goalOperations.length,2);assert.equal(cas.semanticBindingOperations.length,2);assert.equal(cas.viewOperations.length,3);assert.deepEqual(cas.sourceOperations,[]);
const goalGuardRows:any[]=[];
for(const op of cas.goalOperations){
  const index=can.goals.findIndex((g:any)=>g.id===op.goalId);assert.ok(index>=0);assert.deepEqual(can.goals[index],op.before);
  assert.equal(fp(op.before),op.beforeWholeFingerprint);assert.equal(fp(op.after),op.afterWholeFingerprint);assert.deepEqual(read(op.afterFile.path),op.after);assert.equal(sha(op.afterFile.path),op.afterFile.sha256);
  assert.deepEqual({...op.after,requires:op.before.requires},op.before);after.goals[index]=structuredClone(op.after);
  goalGuardRows.push({goalId:op.goalId,beforeWholeFingerprint:fp(op.before),afterWholeFingerprint:fp(op.after),changedFields:['requires'],allOtherWholeGoalFieldsExact:true});
}
for(const op of cas.semanticBindingOperations){
  const index=sem.decisions.findIndex((g:any)=>g.goalId===op.goalId);assert.ok(index>=0);assert.deepEqual(sem.decisions[index],op.before);assert.equal(fp(op.before),op.beforeWholeFingerprint);assert.equal(fp(op.after),op.afterWholeFingerprint);
  assert.deepEqual({...op.after,sourceFingerprint:op.before.sourceFingerprint},op.before);assert.equal(fingerprintSemanticKindSourceGoal(beforeBy.get(op.goalId)),op.before.sourceFingerprint);
  assert.equal(fingerprintSemanticKindSourceGoal(after.goals.find((g:any)=>g.id===op.goalId)),op.after.sourceFingerprint);afterSEM.decisions[index]=structuredClone(op.after);
}
const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
assert.equal(can.goals.length,641);assert.equal(after.goals.length,641);assert.equal(afterSEM.decisions.length,641);
assert.equal(can.goals.filter((g:any,i:number)=>JSON.stringify(g)===JSON.stringify(after.goals[i])).length,639);
assert.equal(sem.decisions.filter((g:any,i:number)=>JSON.stringify(g)===JSON.stringify(afterSEM.decisions[i])).length,639);assert.deepEqual(afterSEM.counts,sem.counts);
const kinds=new Map<string,string>(sem.decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);ajv.addKeyword({keyword:'x-skillpilot-listSemantics',valid:true});
const validateView=ajv.compile(read('contracts/curriculum-package/v1/composition-view.schema.json'));
const roles=(v:any,goals:Map<string,any>)=>{const r=collectCompositionProjectionRoleGoalIds(v.rootNodes,goals),tokens=[v.scope.courseProfile,v.scope.jurisdiction,v.scope.durationModel].filter(Boolean);return {target:new Set([...r.targetGoalIds].filter(id=>goalMatchesFilters(convertLearningGoal(goals.get(id),{landscapeId:can.landscapeId}),tokens))),support:r.prerequisiteOnlyGoalIds};};
const miss=(id:string,r:any,goals:Map<string,any>)=>(goals.get(id)?.requires??[]).filter((p:string)=>!r.target.has(p)&&!r.support.has(p));
const viewRows:any[]=[];
for(const op of cas.viewOperations){
  const p=L+'/'+op.targetPath;assert.equal(sha(p),op.expectedCurrentFileSha256);assert.deepEqual(read(p),op.before);assert.equal(fp(op.before),op.beforeWholeFingerprint);assert.equal(fp(op.after),op.afterWholeFingerprint);assert.deepEqual(read(op.afterFile.path),op.after);assert.equal(sha(op.afterFile.path),op.afterFile.sha256);
  assert.ok(validateView(op.after),ajv.errorsText(validateView.errors));const comp=compileCompositionView(normalizeCompositionView(op.after),after);assert.deepEqual(comp.findings.filter(x=>x.severity==='error'),[]);
  const b=roles(op.before,beforeBy),a=roles(op.after,by);const added=[...a.target].filter(id=>!b.target.has(id));assert.deepEqual([...b.target].filter(id=>!a.target.has(id)),[]);assert.deepEqual([...a.support].sort(),[...b.support].sort());assert.deepEqual([...added].sort(),[...op.addedTargetIds].sort());
  const undo=structuredClone(op.after);const remove=(x:any)=>{if(Array.isArray(x)){for(let j=x.length-1;j>=0;j--){if(x[j]?.kind==='goalEntry'&&added.includes(x[j].goalId))x.splice(j,1);else remove(x[j]);}}else if(x&&typeof x==='object'){for(const [k,v] of Object.entries(x)){if(k==='children'&&Array.isArray(v))remove(v);else if(v&&typeof v==='object')remove(v);}}};remove(undo);
  // The generic change additionally creates three structure containers; removing only those empty containers restores the original view.
  const stripEmpty=(x:any)=>{if(Array.isArray(x)){for(let j=x.length-1;j>=0;j--){stripEmpty(x[j]);if(x[j]?.kind==='structure'&&x[j].children.length===0)x.splice(j,1);}}else if(x&&typeof x==='object')for(const v of Object.values(x))if(v&&typeof v==='object')stripEmpty(v);};stripEmpty(undo);assert.deepEqual(undo,op.before);
  const ordinary=(r:any)=>[...r.target].filter(id=>kinds.get(id)==='curricularAtomic');
  const consumers=selected.wholeGoals.filter((g:any)=>!added.includes(g.id)&&!g.id.startsWith('28bb9d15')&&!g.id.startsWith('fd309753')).map((g:any)=>g.id).filter((id:string)=>b.target.has(id));
  const interfaces=consumers.flatMap((id:string)=>(beforeBy.get(id)?.requires??[]).filter((p:string)=>!b.target.has(p)&&!b.support.has(p)).map((p:string)=>({consumerId:id,priorId:p})));
  const afterMissing=consumers.flatMap((id:string)=>miss(id,a,by).map((p:string)=>({consumerId:id,priorId:p})));
  const addedMissing=added.flatMap((id:string)=>miss(id,a,by).map((p:string)=>({consumerId:id,priorId:p})));
  assert.deepEqual(addedMissing,[]);
  const newlyMissing=afterMissing.filter((x:any)=>!interfaces.some((z:any)=>z.consumerId===x.consumerId&&z.priorId===x.priorId));assert.deepEqual(newlyMissing,[]);
  let bounded14:any=null;
  if(op.after.viewId==='de-de-gym-seki-chemistry'){
    const declared=read(D+'/TABLE.fourteen-original-interfaces.author-actions.json').rows;assert.equal(declared.length,14);
    for(const row of declared){assert.ok(interfaces.some((x:any)=>x.consumerId===row.consumerGoalId&&x.priorId===row.originalMissingPriorId));assert.deepEqual(miss(row.consumerGoalId,a,by).filter((p:string)=>p===row.originalMissingPriorId),[]);}
    const outside=interfaces.filter((x:any)=>!declared.some((r:any)=>r.consumerGoalId===x.consumerId&&r.originalMissingPriorId===x.priorId));
    assert.deepEqual(outside,[]);assert.deepEqual(afterMissing,[]);
    bounded14={declaredInterfaces:14,originalDeclaredMissingInterfaces:14,declaredMissingInterfacesAfter:0,allSelectedConsumersMissingBefore:interfaces.length,allSelectedConsumersMissingAfter:afterMissing.length,unchangedOutsideDeclared14:outside,scopeLimitation:'No claim that all original consumer prerequisites or the complete view are now closed.'};
  }
  viewRows.push({viewId:op.after.viewId,scope:op.after.scope,addedTargetIds:added,ordinaryTargetsBefore:ordinary(b).length,ordinaryTargetsAfter:ordinary(a).length,supportCountBefore:b.support.size,supportCountAfter:a.support.size,schemaErrors:[],compileFindings:comp.findings,originalSelectedMissingInterfaces:interfaces,selectedMissingInterfacesAfter:afterMissing,newlyMissingInterfaces:newlyMissing,newTargetMissingInterfaces:addedMissing,bounded14,allOtherWholeViewFieldsAndOrderExact:true});
}
// Check both changed goals' replacement prerequisite in every already-authored view without compiling unrelated views.
const interfaceContexts:any[]=[];
for(const p of allViewPaths){const rel=p.slice(L.length+1),op=cas.viewOperations.find((x:any)=>x.targetPath===rel),v=op?.after??read(p),r=roles(v,by);for(const change of cas.goalOperations){if(!r.target.has(change.goalId))continue;const newP=change.after.requires.filter((id:string)=>!change.before.requires.includes(id));for(const id of newP){const role=r.target.has(id)?'target':r.support.has(id)?'prerequisiteOnly':'absent';interfaceContexts.push({viewId:v.viewId,consumerId:change.goalId,priorId:id,role});assert.notEqual(role,'absent');}}}
for(const key of ['requires','contains']){const active=new Set<string>(),done=new Set<string>();const visit=(id:string)=>{assert.ok(!active.has(id),`${key} cycle ${id}`);if(done.has(id))return;active.add(id);for(const p of by.get(id)?.[key]??[]){assert.ok(by.has(p),`${key} unknown ${p}`);visit(p);}active.delete(id);done.add(id);};for(const id of by.keys())visit(id);}

const p2:any[]=[],pChecks:any[]=[];
for(const change of cas.goalOperations){
  const g=change.after,old=selected.wholePRecords.find((x:any)=>x.goalId===g.id),kind=kinds.get(g.id);const digests:Record<string,string>={};
  for(const link of g.resourceLinks??[])if(link.type==='goal-visualization'){const p=L+'/app/public/'+link.url.slice(1);digests[link.url]=sha(p);unchangedPins.push(pin(p));}
  const oldGoalFp=fingerprintGoalForPositiveEvidence(change.before,kind),newGoalFp=fingerprintGoalForPositiveEvidence(g,kind);
  assert.equal(oldGoalFp,old.goalFingerprint);assert.equal(newGoalFp,old.goalFingerprint);assert.equal(fingerprintPositiveGoalEvidenceProfile(old.profile),old.profileFingerprint);
  const oldInput=fingerprintPositiveGoalEvidenceReviewInput(change.before,old.reviewCriteriaFingerprint,digests,kind);assert.equal(oldInput,old.reviewInputFingerprint);
  const newInput=fingerprintPositiveGoalEvidenceReviewInput(g,old.reviewCriteriaFingerprint,digests,kind);assert.notEqual(newInput,oldInput);
  const judgment=first.wholeGoalDecisions.find((x:any)=>x.goalId===g.id);
  const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId:'chemie-generic-seki-two-priors-three-views-independent-b-20261016-v1-'+g.id.slice(0,8),goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:old.reviewCriteriaFingerprint,landscapeId:can.landscapeId,goalId:g.id,goalFingerprint:newGoalFp,reviewInputFingerprint:newInput,profileFingerprint:fingerprintPositiveGoalEvidenceProfile(old.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'/root/chemie_generic_seki_two_priors_three_views_independent_b_20261016; independent scientific reviewer B',reason:'Eigene vollständige DE/EN-Ziel-, Profil-, Material-, Lösungs- und Kontextprüfung; Entscheidung keep vor Stockmechanik in FIRST SHA256 92c1fd8b28739036cbc7b1e215abb13772dc4d3a4d08b0b2e92a65d0cbca84f9. '+judgment.reasonDe+' Die Profilkörper bleiben identisch. Die neue Bindung dokumentiert dieses eigene fachliche Urteil am geänderten requires-Kontext; Hashänderung selbst ist keine Wissenschaft. Zwei Nachweiskomponenten sind keine starre Zwei-Aufgabenquote. KI-Kandidat E1/G1, keine Human-/M7-Freigabe.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:[],profile:structuredClone(old.profile)};
  parseGoalBookEvidenceReviewRecord(record,'own independent B P2 '+g.id);assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,g,digests,kind),[]);p2.push(record);
  pChecks.push({goalId:g.id,oldGoalFingerprint:oldGoalFp,newGoalFingerprint:newGoalFp,goalSemanticFingerprintUnchanged:true,oldReviewInputFingerprint:oldInput,newReviewInputFingerprint:newInput,profileFingerprint:record.profileFingerprint,profileBodyExact:true,resourceDigests:digests,schemaErrors:[],semanticErrors:[],ownJudgmentFirst:pin(F),oldRecordJudgmentCopied:false});
}
const pFile=O+'/P2.own-independent-current-input-candidates.jsonl';assert.ok(!fs.existsSync(pFile));fs.writeFileSync(pFile,p2.map(x=>JSON.stringify(x)).join('\n')+'\n');fs.readFileSync(pFile,'utf8').trim().split('\n').forEach(x=>JSON.parse(x));
for(const p of unchangedPins)assert.equal(sha(p.path),p.sha256,`readonly retention ${p.path}`);
for(const row of baselineProfilePins)assert.equal(fp(selected.wholePRecords.find((x:any)=>x.goalId===row.goalId).profile),row.profileFingerprint);
assert.equal(sha(F),'sha256:92c1fd8b28739036cbc7b1e215abb13772dc4d3a4d08b0b2e92a65d0cbca84f9');
save('CHECK.independent-b.readonly-CAS-three-stock-views-and-P2.json',{role:'Independent B narrow post-FIRST technical verification',scienceFIRST:pin(F),candidateCAS:pin(first.inactiveCAS.path),goalGuards:goalGuardRows,wholeSEMGuards:2,other639GoalsAndSEMExact:true,SEMCountsExact:true,noNewAtoms:true,requiresAndContainsDAG:true,stockViewCompiles:3,threeStockSchemaChecks:true,viewRows,replacementPriorContextsAcrossAuthoredViews:interfaceContexts,unrelatedViewCompileCount:0,existingWholeProfileBodiesRetained:baselineProfilePins.length,unchangedSourceFiles:sourcePaths.length,unchangedActualSourceAndViewAndArtifactPins:unchangedPins,P2:pin(pFile),P2Checks:pChecks,canonicalAndSEMAndAllExistingViewsWritten:false,fullAPVRun:false,buildRun:false,centralReviewWrite:false,RorL6Write:false,HumanApproval:false,HumanTrial:false,M7Claim:false});
console.log(JSON.stringify({viewRows:viewRows.map(x=>({viewId:x.viewId,ordinaryBefore:x.ordinaryTargetsBefore,ordinaryAfter:x.ordinaryTargetsAfter,missingBefore:x.originalSelectedMissingInterfaces.length,missingAfter:x.selectedMissingInterfacesAfter.length})),replacementPriorContexts:interfaceContexts.length,P2:pChecks.map(x=>({goalId:x.goalId,newGoalFingerprint:x.newGoalFingerprint,newReviewInputFingerprint:x.newReviewInputFingerprint})),sourceFilesRetained:sourcePaths.length,stockChecks:'pass',writesOnlyOwnDirectory:true}));
