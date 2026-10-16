import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import ts from '/home/enpasos/projects/skillpilot/tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/app/node_modules/typescript/lib/typescript.js';
const R = '/home/enpasos/projects/skillpilot';
const E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/';
const O = E + 'chemie-fourteen-current-positive-eight-intrinsic-supported-normal-bindings-technical-20261016-v1';
const read = (p: string) => JSON.parse(readFileSync(resolve(R,p),'utf8'));
const hash = (b: Buffer|string) => 'sha256:' + createHash('sha256').update(b).digest('hex');
const pin = (p: string) => ({path:p,sha256:hash(readFileSync(resolve(R,p))),bytes:readFileSync(resolve(R,p)).length});
const write = (p: string, x: unknown) => {const f=resolve(R,O,p);assert(!existsSync(f));writeFileSync(f,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n');};
const firstPath=O+'/SCIENCE.INFORMED.existing-P14-A8-authority-and-four-old-image-current-context-before-normal-bindings.json';
assert.equal(pin(firstPath).sha256,'sha256:71dbda7474c499b0d1f4a88108ee51e65d084cfe62f8edc9e968cc3e77eed4f7');
const first=read(firstPath);const raw=read(O+'/inputs/A8.exact-existing-independent-intrinsic-support-and-whole-current-CAS.json');
const sourcePath='app/scripts/semanticAtomicityReview.ts';const source=readFileSync(resolve(R,sourcePath),'utf8');
const ast=ts.createSourceFile(sourcePath,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const names=['normalizeText','stableJson','getSemanticPayload','fingerprintGoal'];
const exact=names.map(n=>{const d=ast.statements.find(s=>ts.isFunctionDeclaration(s)&&s.name?.text===n);assert(d);return d!.getText(ast);}).join('\n\n');
const javascript=ts.transpileModule(exact,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const stockFingerprint=new Function('createHash',javascript+'\nreturn fingerprintGoal;')(createHash);
const splitKey='splitInformed';const reviewId='chemie-current593-eight-existing-independent-intrinsic-bindings-20261016-v1';
const rows=raw.rows.map((x:any)=>{
 const authorities=x.scienceAuthorityKeys.map((k:string)=>first.upstreamScienceAuthorities[k]);
 for(const p of authorities)assert.equal(pin(p.path).sha256,p.sha256);
 const foreign=x.scienceAuthorityKeys.includes(splitKey);
 return {schemaVersion:1,reviewId,ruleVersion:'semantic-atomicity-v1',landscapeId:'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',goalId:x.goalId,
  fingerprint:stockFingerprint(x.wholeCurrentGoal,'semantic-atomicity-v1'),status:'atomic',semanticAtomic:true,
  reviewedAt:first.frozenAtUtc,
  reviewer:foreign?'Original independent Split3 reviewer / existing whole intrinsic science, current technical serialization':'Original independent Methods4 reviewer / existing whole intrinsic science, current technical serialization',
  reason:x.independentAtomicityReasonDe+' Existing genuine independent intrinsic authority: '+authorities.map((p:any)=>p.path+' @ '+p.sha256).join('; ')+'. Current whole-body equality was checked, permitting only separately independently supported resource links for six children. This timestamp identifies the explicit current binding/context addendum, not a newly invented original review time. No new intrinsic vote, source/course/whole-P/memory/description/human/M7 approval.'};
});
assert.equal(rows.length,8);assert.equal(new Set(rows.map((x:any)=>x.goalId)).size,8);
write('A8.existing-independent-intrinsic.current-stock-fingerprints.review.jsonl',rows.map((x:any)=>JSON.stringify(x)).join('\n')+'\n');
const cp=read(O+'/inputs/P14.whole-supported-author-rows-current-whole-goals-and-direct-prerequisites.json').canonical.path;
write('A8.explicit-current593.normal.config.json',{schemaVersion:1,reviewId,ruleVersion:'semantic-atomicity-v1',landscapeId:'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',landscapePath:cp,reviewPath:O+'/A8.existing-independent-intrinsic.current-stock-fingerprints.review.jsonl',scope:{label:'Exactly eight current whole goals with genuine previous intrinsic science: six split children and unchanged882/b7. No new intrinsic vote or source/course decision.',leafGoalIds:rows.map((x:any)=>x.goalId)}});
write('CHECK.A8.actual-stock-extracted-intrinsic-fingerprints-and-existing-authority.json',{scienceContinuitySeal:pin(firstPath),stockSource:pin(sourcePath),stockExactDeclarations:names,exactDeclarationSha256:hash(exact),method:'Actual unchanged stock declarations parsed and transpiled to strip TypeScript types only, then invoked; no reimplemented fingerprint or stock code changes.',originalA2WholeEquality:pin(O+'/CHECK.A2.original-whole-base-b608-current593-exact.json'),rows:rows.map((x:any)=>({goalId:x.goalId,fingerprint:x.fingerprint,status:x.status,semanticAtomic:x.semanticAtomic})),normalRecordCount:8,newIntrinsicScienceVotes:0,noNormalAliasWrites:true,humanApproval:false});
console.log(JSON.stringify({normalA8:rows.length,newIntrinsicScienceVotes:0,normalAliasesWritten:false}));
