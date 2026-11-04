// Execute the actual current private fingerprint functions after TypeScript
// transpilation, without importing their CLI mains or writing review rows.
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const H=path.dirname(fileURLToPath(import.meta.url)),R=path.resolve(H,'../../..');
const req=createRequire(path.join(R,'app/package.json')),ts=req('typescript');
const rows=JSON.parse(await readFile(path.join(H,'current-eight-registered-am-rows.json'),'utf8')).rows;
const functions=new Map(),sourceBindings=[];
for(const [lane,file,end] of [['semantic-atomicity','semanticAtomicityReview.ts','function isLeaf('],['memory-card-review','memoryCardReview.ts','function fingerprintMemoryCard(']]){
 const relative='app/scripts/'+file,source=await readFile(path.join(R,relative),'utf8');
 const selected=source.slice(source.indexOf('function normalizeText('),source.indexOf(end));
 assert(selected.includes('function fingerprintGoal('));
 const js=ts.transpileModule(selected+'\nthis.actualFingerprint=fingerprintGoal;', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const ctx={createHash};vm.createContext(ctx);vm.runInContext(js,ctx);functions.set(lane,ctx.actualFingerprint);
 sourceBindings.push({lane,path:relative,sha256:createHash('sha256').update(source).digest('hex'),selectedActualFunctionSourceSha256:createHash('sha256').update(selected).digest('hex')});
}
const lp='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',lb=await readFile(path.join(R,lp)),ledger=JSON.parse(lb);
const records=[];
for(const row of rows){
 const id=row.wholeCurrentRow.goalId,before=JSON.parse(await readFile(path.join(H,id,'current-whole-goal.json'),'utf8')),after=JSON.parse(await readFile(path.join(H,id,'proposed-whole-goal.draft.json'),'utf8'));
 const fp=functions.get(row.lane),current=fp(before,row.wholeCurrentRow.ruleVersion),hypothetical=fp(after,row.wholeCurrentRow.ruleVersion);
 assert.equal(current,row.wholeCurrentRow.fingerprint,'Current registered A/M input mismatch');
 assert.notEqual(current,hypothetical,'nodeKind must be bound');
 const kind=ledger.decisions.find(d=>d.goalId===id);assert.equal(kind?.semanticKind,'curricularAtomic');
 records.push({goalId:id,lane:row.lane,currentRegisteredFingerprint:current,currentStatus:row.wholeCurrentRow.status,currentRowMatchesActualFunction:true,hypotheticalSameIdExamFingerprint:hypothetical,hypotheticalFingerprintIsApproval:false,wholeAuthoritativeKindDecision:kind,independentContentAndAMReview:'PENDING',globalRoleAndPlacementDecision:'PENDING_SEPARATE_SCOPE_EFFECT_REVIEW'});
}
const report={status:'PASS_ACTUAL_CURRENT_EIGHT_AM_BINDINGS_NO_NEW_REVIEW_ROWS',executedActualFingerprintSources:sourceBindings,records,semanticKindLedger:{path:lp,sha256:createHash('sha256').update(lb).digest('hex'),counts:ledger.counts},originalAuthoritativeCurricularAtomicCount:ledger.counts.curricularAtomic,scope:'Original contracts and hypothetical execution form only; global activation is not assumed.',writesToRegisteredLedgers:false};
await writeFile(path.join(H,'author-am-context-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,currentRows:records.length,pendingIndependentRevalidations:records.length,kindCounts:ledger.counts}));
