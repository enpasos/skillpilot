import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import ts from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/node_modules/typescript/lib/typescript.js';
import Ajv2020 from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/node_modules/ajv/dist/2020.js';
import addFormats from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/node_modules/ajv-formats/dist/index.js';
import {validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/scripts/positiveGoalEvidenceProfileModel.ts';
import {fingerprintSemanticKindSourceGoal} from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/scripts/goalBookModel.ts';
const R='/home/enpasos/projects/skillpilot';
const H=resolve(R,'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1');
const O=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-A-P-unique-owner-selection-pending-memory-technical-20261016-v1');
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>{const b=readFileSync(p);return{path:p.slice(R.length+1),sha256:sha(b),bytes:b.length};};
const centralPath=resolve(O,'central.current435.A435-P435.memory-pending.PROPOSAL.config.json');
const proposal=read(centralPath),original=read(resolve(O,'inputs/central.ORIGINAL.current418-selected66A99P97D.exact.json'));
const s=proposal.subjects[0],old=original.subjects[0];
const wholePath=resolve(H,s.landscapePath),kindPath=resolve(H,s.semanticKindLedgerPath);
assert.equal(pin(wholePath).sha256,'sha256:3d4173beb1fed71c9246747a46014a9b3796af16fdcb4de2da397f5311e82ba9');
assert.equal(pin(kindPath).sha256,'sha256:34ecaedb5076ee7c701300d60067080474603ed3fe2207643e1cc3f1f32aee07');
const whole=read(wholePath),kinds=read(kindPath);const ix=new Map(whole.goals.map((g:any)=>[g.id,g]));
const ki=new Map(kinds.decisions.map((d:any)=>[d.goalId,d]));
const atoms=new Set(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic'&&d.decisionStatus==='authoritative').map((d:any)=>d.goalId));
assert.equal(whole.goals.length,593);assert.equal(atoms.size,435);
for(const id of atoms)assert.equal(fingerprintSemanticKindSourceGoal(ix.get(id)),ki.get(id).sourceFingerprint);
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);
const configSchemaPath=resolve(H,'curricula/DE/Gymnasium/quality/deep-understanding-rollout/deep-understanding-rollout.schema.json');
const vCentral=ajv.compile(read(configSchemaPath));assert(vCentral(proposal),JSON.stringify(vCentral.errors));
const profileSchemaPath=resolve(H,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json');
const vP=ajv.compile(read(profileSchemaPath));
function extract(file:string,names:string[],args:string[],values:any[]){
 const path=resolve(H,file);const source=readFileSync(path,'utf8');
 const ast=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const exact=names.map(n=>{const d=ast.statements.find(s=>ts.isFunctionDeclaration(s)&&s.name?.text===n);assert(d);return d!.getText(ast);}).join('\n\n');
 const fn=new Function(...args,ts.transpileModule(exact,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText+'\nreturn '+names[names.length-1]+';')(...values);
 return {fn,source:pin(path),exactDeclarationSha256:sha(exact),names};
}
const afp=extract('app/scripts/semanticAtomicityReview.ts',['normalizeText','stableJson','getSemanticPayload','fingerprintGoal'],['createHash'],[createHash]);
const ashape=extract('app/scripts/semanticAtomicityReview.ts',['validateRecordShape'],['statusOrder'],[['atomic','needs_developer_review','non_atomic']]);
const resource=extract('app/scripts/positiveGoalEvidenceReview.ts',['resourceDigestsForGoal'],['readFileSync','existsSync','resolve','repoRoot','sha256'],[readFileSync,existsSync,resolve,H,sha]);
const checks:any={};let checkedResources=0;
for(const[lane,key,scopeKey]of[['A','semanticAtomicityConfigPaths','leafGoalIds'],['P','positiveEvidenceConfigPaths','goalIds']]){
 const owners=new Map<string,any>();const errors:any[]=[];
 for(const cp of s[key]){
  const cfg=read(resolve(R,cp));assert.equal(cfg.landscapePath,s.landscapePath);
  const rsPath=resolve(R,cfg.reviewPath);const lines=readFileSync(rsPath,'utf8').split(/\r?\n/).filter(l=>l.trim());
  const rs=lines.map(l=>JSON.parse(l));assert.deepEqual(new Set(rs.map((r:any)=>r.goalId)),new Set(cfg.scope[scopeKey]));
  for(const row of rs){
   const e:string[]=[];const g=ix.get(row.goalId);if(!g)e.push('missing actual current whole goal');if(!atoms.has(row.goalId))e.push('not actual current ordinary atom');if(owners.has(row.goalId))e.push('overlapping selected owner');
   assert.equal(row.reviewId,cfg.reviewId);
   if(lane==='A'){
    e.push(...ashape.fn(row,cfg));if(row.fingerprint!==afp.fn(g,cfg.ruleVersion))e.push('stale actual stock intrinsic fingerprint');
   }else{
    if(!vP(row))e.push(JSON.stringify(vP.errors));
    const r=resource.fn(g,new Set(cfg.reviewedResourceTypes));checkedResources+=Object.keys(r.digests).length;
    e.push(...r.errors,...validatePositiveGoalEvidenceRecordSemantics(row,g,r.digests,'curricularAtomic'));
    if(sha(readFileSync(resolve(H,cfg.reviewCriteriaPath)))!==row.reviewCriteriaFingerprint)e.push('stale criteria fingerprint');
   }
   const state={goalId:row.goalId,configPath:cp,reviewPath:cfg.reviewPath,reviewId:row.reviewId,status:row.status,currentFingerprint:row.fingerprint??row.goalFingerprint,stockErrors:e};owners.set(row.goalId,state);if(e.length)errors.push(state);
  }
 }
 const missing=[...atoms].filter(id=>!owners.has(id)),obsolete=[...owners.keys()].filter(id=>!atoms.has(id));
 assert.equal(owners.size,435);assert.equal(errors.length,0,JSON.stringify(errors));assert.deepEqual(missing,[]);assert.deepEqual(obsolete,[]);
 checks[lane]={configCount:s[key].length,uniqueOwners:owners.size,overlaps:0,missing,obsolete,stockErrors:errors,rows:[...owners.values()]};
}
const restored=structuredClone(proposal);for(const key of ['semanticAtomicityConfigPaths','positiveEvidenceConfigPaths','memoryReviewConfigPath'])restored.subjects[0][key]=old[key];assert.deepEqual(restored,original);
assert.deepEqual(s.resolutionIndexPaths,old.resolutionIndexPaths);assert.equal(s.resolutionIndexPaths.length,97);
const guards=read(resolve(O,'INPUTS.old-selected-configs-records-and-normal-alias-pins.before.json'));
for(const p of [...guards.oldConfigAndReviewPins,...guards.normalAliasPins])assert.equal(pin(resolve(R,p.path)).sha256,p.sha256);
const result={role:'Bounded actual current435 A/P owner, closed P row schema and unchanged stock A/P fingerprint/resource validity; not a central run',actualHCanonical:pin(wholePath),actualHKindLedger:pin(kindPath),centralProposalSchemaValid:true,centralSchema:pin(configSchemaPath),positiveClosedSchema:pin(profileSchemaPath),centralProposal:pin(centralPath),checks,actualGoalVisualizationResourceDigestsComputed:checkedResources,originalFieldsRestoredExact:true,old97DIndexArrayExact:true,old421WholeOwnerRowsExactByOriginalFileAndExclusionProof:true,protectedInputsUnchanged:true,actualStockSources:{atomicity:afp.source,atomicityShape:ashape.source,resourceHelper:resource.source,resourceHelperExactDeclarationsSha256:resource.exactDeclarationSha256,positiveSemantics:pin(resolve(H,'app/scripts/positiveGoalEvidenceProfileModel.ts')),kindFingerprint:pin(resolve(H,'app/scripts/goalBookModel.ts'))},memory:'Explicitly PENDING actual newMemoryPlacement and43 M-ref CAS/PART2; existing M435 config only selected as a placeholder, never executed here.',otherGateExecution:{central:false,description:false,memory:false,visualization:false,source:false,build:false},newScientificVotes:0,newStrictCompletions:0,humanApproval:false,humanTrial:false,M7Claim:false};
const out=resolve(O,'CHECK.actual-current435-A-P-owner-and-stock-fingerprint-validity-no-central.json');assert(!existsSync(out));writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({AOwners:checks.A.uniqueOwners,POwners:checks.P.uniqueOwners,AConfigs:checks.A.configCount,PConfigs:checks.P.configCount,overlaps:0,missing:0,obsolete:0,stockErrors:0,centralProposalSchemaValid:true,old97DExact:true,pendingMemoryNotExecuted:true,centralNotExecuted:true}));
