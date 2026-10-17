import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import Ajv2020 from './capsule/app/node_modules/ajv/dist/2020.js';
import addFormats from './capsule/app/node_modules/ajv-formats/dist/index.js';
import {fingerprintSemanticKindSourceGoal} from './capsule/app/scripts/goalBookModel.ts';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from './capsule/app/scripts/positiveGoalEvidenceProfileModel.ts';
import {stockResourceDigestsForGoal,stockPositiveRepoRoot,reviewPositiveGoalEvidenceConfig} from './capsule/app/scripts/.L7-stock-positiveGoalEvidenceReview-exports.ts';
import {stockMemoryGoalFingerprint} from './capsule/app/scripts/.L7-stock-memoryCardReview-exports.ts';
const O=path.dirname(fileURLToPath(import.meta.url));
const read=(p:string):any=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const pin=(p:string)=>({path:p,sha256:sha(p),bytes:fs.statSync(p).size});
const m=read(path.join(O,'ASSEMBLY.exact-guards-and-inputs.json')),F=m.physicalRoot;
assert.equal(fs.realpathSync(stockPositiveRepoRoot),fs.realpathSync(F));
const inp=(key:string)=>read(path.join(F,m.inputs[key].copyRelative));
for(const [key,p] of Object.entries(m.inputs) as any[]){assert.equal(sha(p.path),p.sha256,key);assert.equal(sha(path.join(F,p.copyRelative)),p.sha256,key)}
const clean=inp('clean'),cas=inp('CAS'),land=read(path.join(F,m.canonicalRelative)),goals=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]));
const oldLand=read(m.baseCanonical.path),oldGoals=new Map<string,any>(oldLand.goals.map((g:any)=>[g.id,g]));
const target='cc5a626a-dc85-57e2-b422-259f92901545',ids=cas.canonicalWholeGoalChanges.map((x:any)=>x.goalId);
const goalChanges=land.goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(oldGoals.get(g.id))).map((g:any)=>g.id);assert.deepEqual(goalChanges.sort(),[...ids].sort());
for(const ch of cas.canonicalWholeGoalChanges){assert.deepEqual(oldGoals.get(ch.goalId),ch.before);assert.deepEqual(goals.get(ch.goalId),ch.after)}
const out=path.join(F,m.outputsRelative);fs.mkdirSync(out,{recursive:true});
const write=(name:string,obj:any)=>{const p=path.join(out,name);assert(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n');return p};
const writeLines=(name:string,rows:any[])=>{const p=path.join(out,name);assert(!fs.existsSync(p));fs.writeFileSync(p,rows.map(x=>x.line).join('\n')+'\n');return p};
const oldSem=inp('oldSEM'),semChanges:any[]=[];
const decisions=oldSem.decisions.map((d:any)=>{const sourceFingerprint=fingerprintSemanticKindSourceGoal(goals.get(d.goalId));if(sourceFingerprint!==d.sourceFingerprint)semChanges.push({goalId:d.goalId,beforeSourceFingerprint:d.sourceFingerprint,afterSourceFingerprint:sourceFingerprint,semanticKind:d.semanticKind,decisionStatus:d.decisionStatus,decisionBasis:d.decisionBasis});return sourceFingerprint===d.sourceFingerprint?d:{...d,sourceFingerprint}});
assert.deepEqual(semChanges.map(x=>x.goalId).sort(),[...ids].sort());
assert.deepEqual(decisions.map((d:any)=>[d.goalId,d.semanticKind,d.decisionStatus,d.decisionBasis]),oldSem.decisions.map((d:any)=>[d.goalId,d.semanticKind,d.decisionStatus,d.decisionBasis]));
const sem={...oldSem,decisions};const semPath=write('SEM650.exact-kinds-two-scope-source-FP-successor.candidate.json',sem),semRel=path.relative(F,semPath);
// Replace the owned canonical ledger file only in this physical private copy.
const standardSem=path.join(F,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json');
const tempSem=standardSem+'.package03-owned';fs.writeFileSync(tempSem,JSON.stringify(sem,null,2)+'\n');fs.renameSync(tempSem,standardSem);
const kinds=new Map<string,string>(decisions.map((d:any)=>[d.goalId,d.semanticKind]));
const oldRows=fs.readFileSync(path.join(F,m.inputs.oldP439.copyRelative),'utf8').split('\n').filter(x=>x.trim()).map(line=>({line,record:JSON.parse(line)}));assert.equal(oldRows.length,439);
const oldIndex=inp('oldNamespaceIndex'),namespaceByGoal=new Map<string,any>();
for(const n of oldIndex.fragments){const cfg=read(path.join(F,n.configRelative));for(const id of n.goalIds){assert(!namespaceByGoal.has(id));namespaceByGoal.set(id,{...n,wholeBeforeConfig:cfg})}}
assert.equal(namespaceByGoal.size,439);const beforeTarget=oldRows.find(x=>x.record.goalId===target)!.record;assert.deepEqual(beforeTarget.profile,cas.positiveProfileWholeBodyChange.before);
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);
const pValidate=ajv.compile(read(path.join(F,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))),semValidate=ajv.compile(read(path.join(F,'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json')));assert(semValidate(sem),JSON.stringify(semValidate.errors));
const currentRows:any[]=[];let successor:any;const rows=oldRows.map(({line,record:r})=>{
 const n=namespaceByGoal.get(r.goalId),cfg=n.wholeBeforeConfig,g=goals.get(r.goalId),criteria='sha256:'+sha(path.join(F,cfg.reviewCriteriaPath));
 assert.equal(r.reviewId,cfg.reviewId);assert.equal(r.reviewCriteriaFingerprint,criteria);
 const resource=stockResourceDigestsForGoal(g,new Set(cfg.reviewedResourceTypes));assert.equal(resource.errors.length,0);
 const actual={goalFingerprint:fingerprintGoalForPositiveEvidence(g,kinds.get(g.id)),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteria,resource.digests,kinds.get(g.id)),reviewCriteriaFingerprint:criteria,profileFingerprint:fingerprintPositiveGoalEvidenceProfile(r.goalId===target?cas.positiveProfileWholeBodyChange.after:r.profile)};
 const changedFingerprintFields=Object.keys(actual).filter(k=>(actual as any)[k]!==r[k]);
 if(r.goalId!==target)assert.deepEqual(changedFingerprintFields,[],r.goalId);
 let record=r;
 if(r.goalId===target){
  assert.deepEqual(changedFingerprintFields,['profileFingerprint']);
  const proof=['clean','CAS','B','rootInformed'].map(k=>m.inputs[k].path+' @ sha256:'+m.inputs[k].sha256).join('; ');
  record={...r,...actual,profile:cas.positiveProfileWholeBodyChange.after,status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'Codex technical serializer; exact executing model not exposed; human=false; no new independent science vote',reason:'Technical whole-P successor for the independently reviewed package03 terminology correction under the exact current C20 plus two bounded own-scope goal annotations. Concrete content proofs: '+proof+'. B sealed its own independent FIRST before peer reasons; root review is explicitly informed by author diagnosis and a later B brief, not blind FIRST or formal native-D. Original reviewId, own criteria, and actual old reviewRunIds are retained. Actual stock P fingerprints use this physical private capsule and unchanged resource bytes. E0/G0 prospective design only. This serialization adds no scientific voice, native D run, learner evidence, real experiment, Human Approval, host acceptance or M7 claim. Scope/APV/frontend and full P/M/native/central acceptance remain separately bounded.',evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,reviewRunIds:r.reviewRunIds,dissent:[...r.dissent,'Final exact assembled native-D, full M, P/central and strict M7 gates remain separate; own broader LK acquisition is not official whole-source credit or learner topic selection.']};
  assert.deepEqual(record.reviewRunIds,r.reviewRunIds);successor={goalId:target,beforeWholeRecord:r,afterWholeRecord:record,changedFingerprintFields,proofInputs:['clean','CAS','B','rootInformed'].map(k=>m.inputs[k]),newFormalRunIds:[],newScientificVotes:0};
 }
 assert(pValidate(record),JSON.stringify(pValidate.errors));const errors=validatePositiveGoalEvidenceRecordSemantics(record,g,resource.digests,kinds.get(g.id));assert.deepEqual(errors,[],g.id);
 currentRows.push({goalId:g.id,originalReviewIdRetained:record.reviewId===r.reviewId,originalCriteriaPath:cfg.reviewCriteriaPath,criteriaFingerprint:criteria,originalRunIdsRetained:JSON.stringify(record.reviewRunIds)===JSON.stringify(r.reviewRunIds),actualStockFingerprints:actual,changedFingerprintFields,wholeProfileChanged:JSON.stringify(r.profile)!==JSON.stringify(record.profile),schemaErrors:[],stockSemanticsErrors:[]});
 return r.goalId===target?{line:JSON.stringify(record),record}:{line,record};
});
assert(successor);const p439=writeLines('P439.current.exact438-plus-one-paired-package03.jsonl',rows),p438=writeLines('P438.exact-previous-whole-lines.retained.jsonl',oldRows.filter(x=>x.record.goalId!==target));
const pOne=writeLines('Pcc5a.single-paired-current-context.candidate.jsonl',[rows.find(x=>x.record.goalId===target)]);
for(const r of oldRows.filter(x=>x.record.goalId!==target))assert.equal(rows.find(x=>x.record.goalId===r.record.goalId).line,r.line);
const pCAS=write('CAS.cc5a-whole-record-technical-successor.json',successor);
const indexRows:any[]=[];let targetedResult:any;
for(let i=0;i<oldIndex.fragments.length;i++){
 const n=oldIndex.fragments[i],oldCfg=read(path.join(F,n.configRelative)),affected=n.goalIds.includes(target);
 const fragment=affected?writeLines('P.affected-original-namespace.exact-retained-plus-cc5a-successor.jsonl',rows.filter(x=>n.goalIds.includes(x.record.goalId))):path.join(F,n.reviewPath);
 const cfg={...oldCfg,semanticKindLedgerPath:semRel,reviewPath:path.relative(F,fragment)};
 assert.equal(cfg.reviewId,oldCfg.reviewId);assert.equal(cfg.reviewCriteriaPath,oldCfg.reviewCriteriaPath);assert.deepEqual(cfg.reviewRunManifestPaths,oldCfg.reviewRunManifestPaths);assert.deepEqual(cfg.scope.goalIds,oldCfg.scope.goalIds);
 const cfgPath=write('P.original-namespace-'+String(i+1).padStart(3,'0')+'.current-SEM.config.json',cfg);
 if(affected){targetedResult=reviewPositiveGoalEvidenceConfig(path.relative(F,cfgPath));assert.deepEqual(targetedResult.errors,[])}
 indexRows.push({...n,configRelative:path.relative(F,cfgPath),reviewPath:path.relative(F,fragment),wholeRecordFragmentChanged:affected,scientificPending:false});
}
assert(targetedResult);assert.equal(targetedResult.records.length,namespaceByGoal.get(target).goalIds.length);
const newIndex=write('INDEX.current112-original-criteria-and-one-package03-successor.json',{physicalRoot:F,mergedP439:path.relative(F,p439),SEM650:semRel,recordChanges:1,wholeBodiesChanged:1,criteriaNamespaceChanges:0,unchangedWholeLines:438,fragments:indexRows,noFullNativeConfigRun:true,newScientificVotes:0,newFormalRunIds:[]});
const mCfg=read(path.join(F,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'));
const mRows=fs.readFileSync(path.join(F,mCfg.reviewPath),'utf8').trim().split('\n').map(l=>JSON.parse(l));const affectedM=mRows.filter((r:any)=>ids.includes(r.goalId)).map((r:any)=>({goalId:r.goalId,oldFingerprint:r.fingerprint,actualFingerprint:stockMemoryGoalFingerprint(goals.get(r.goalId),mCfg.ruleVersion),unchanged:r.fingerprint===stockMemoryGoalFingerprint(goals.get(r.goalId),mCfg.ruleVersion)}));
assert(affectedM.every((a:any)=>a.unchanged));
const mGuard=[mCfg.reviewPath,mCfg.cardReviewPath,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'].map((p:string)=>({relative:p,current:pin(path.join(F,p)),source:pin(path.join(m.oldCapsuleRoot,p)),unchanged:sha(path.join(F,p))===sha(path.join(m.oldCapsuleRoot,p))}));assert(mGuard.every((a:any)=>a.unchanged));
const checks={role:'Finite technical fingerprint/whole-line guard and one affected original namespace stock check; not full P/M/native or central acceptance',current439Matched:currentRows.length,changedWholePRecords:1,changedWholePBodyIds:[target],retainedExactWholeLines:438,originalCriteriaNamespaces:oldIndex.fragments.length,allOriginalRunIdsRetained:currentRows.every(x=>x.originalRunIdsRetained),SEMSourceFPChanges:semChanges,SEMClassChanges:0,stockAffectedNamespaceRecords:targetedResult.records.length,stockAffectedNamespaceErrors:targetedResult.errors,affectedExistingMemoryFPChecks:affectedM,MemoryCardsAndConfigByteGuards:mGuard,rows:currentRows,newIndependentVotes:0,newNativeRunIds:[],M7:false,HumanApproval:false};
const check=write('CHECK.actual-current439-FPs-one-P-and-two-SEM-source-bindings.json',checks);
const summary={role:'Pure technical package03 assembly and stock P binding; no new independent voice',atUTC:new Date().toISOString(),canonical:pin(path.join(F,m.canonicalRelative)),whole39Views:pin(m.wholeViewCollection.path),P439:pin(p439),P438:pin(p438),singleP:pin(pOne),SEM650:pin(semPath),namespaceIndex:pin(newIndex),recordCAS:pin(pCAS),checks:pin(check),changedGoalIds:ids,changedPGoalId:target,unchangedPWholeLines:438,originalCriteriaAndRunIdsProtected:true,newIndependentVotes:0,newFormalRunIds:[],sourceScienceProofs:['B','rootInformed'].map(k=>m.inputs[k]),APVAndFrontendNotYetRun:true,M7:false,HumanApproval:false};
fs.writeFileSync(path.join(O,'BINDING.actual-one-P-and-two-SEM-source-FPs.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({canonical:summary.canonical.sha256,P439:summary.P439.sha256,SEM650:summary.SEM650.sha256,FPs:439,retainedLines:438,sourceFPChanges:semChanges.length,affectedNamespaceRecords:targetedResult.records.length,stockErrors:targetedResult.errors.length,newNativeRunIds:[]},null,2));
