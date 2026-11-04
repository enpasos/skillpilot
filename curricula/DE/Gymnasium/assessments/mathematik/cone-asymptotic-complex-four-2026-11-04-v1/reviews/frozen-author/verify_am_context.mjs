import {readFile,writeFile}from'node:fs/promises';
import {createHash}from'node:crypto';
import {createRequire}from'node:module';
import {fileURLToPath}from'node:url';
import path from'node:path';
import vm from'node:vm';
import assert from'node:assert/strict';
const H=path.dirname(fileURLToPath(import.meta.url)),R=path.resolve(H,'../../..'),req=createRequire(path.join(R,'app/package.json')),ts=req('typescript');
const context=JSON.parse(await readFile(path.join(H,'current-eight-registered-am-rows.json'),'utf8'));
const frozen=JSON.parse(await readFile(path.join(H,'frozen-input.json'),'utf8')),goals=new Map(frozen.wholeGoals.map(g=>[g.id,g]));
const current=JSON.parse(await readFile(path.join(R,frozen.canonical.path),'utf8')),live=new Map(current.goals.map(g=>[g.id,g]));
for(const [id,g]of goals)assert.deepEqual(live.get(id),g,'Root whole contract changed');
const records=[],sources=[];
for(const [lane,name,end]of[['semantic-atomicity','semanticAtomicityReview.ts','function isLeaf('],['memory-card-review','memoryCardReview.ts','function fingerprintMemoryCard(']]){
 const source=await readFile(path.join(R,'app/scripts',name),'utf8'),selected=source.slice(source.indexOf('function normalizeText('),source.indexOf(end));assert(selected.includes('function fingerprintGoal('));
 const js=ts.transpileModule(selected+'\nthis.actualFingerprint=fingerprintGoal;', {compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText,ctx={createHash};vm.createContext(ctx);vm.runInContext(js,ctx);
 sources.push({path:'app/scripts/'+name,sha256:createHash('sha256').update(source).digest('hex'),actualSelectedFunctionSourceSha256:createHash('sha256').update(selected).digest('hex')});
 for(const entry of context.rows.filter(r=>r.lane===lane)){
  const row=entry.wholeCurrentRow,actual=ctx.actualFingerprint(goals.get(row.goalId),row.ruleVersion);assert.equal(actual,row.fingerprint);
  const config=JSON.parse(await readFile(path.join(R,entry.registeredConfig.path),'utf8')),currentRow=(await readFile(path.join(R,config.reviewPath),'utf8')).trim().split('\n').map(JSON.parse).find(r=>r.goalId===row.goalId);assert.deepEqual(currentRow,row);
  records.push({goalId:row.goalId,lane,actualFingerprint:actual,currentRegisteredRowMatches:true,status:row.status,rowRewritten:false});
 }
}
const lp='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',bytes=await readFile(path.join(R,lp)),ledger=JSON.parse(bytes),kinds=[];
for(const [id]of goals){const kind=ledger.decisions.find(r=>r.goalId===id);assert.equal(kind.semanticKind,'curricularAtomic');kinds.push(kind);}
await writeFile(path.join(H,'author-am-context-check.json'),JSON.stringify({status:'PASS_EIGHT_CURRENT_ORIGINAL_AM_BINDINGS_NO_ROLE_OR_REVIEW_CHANGE',records,executedActualSources:sources,wholeCurrentSemanticKindRows:kinds,ledger:{path:lp,sha256:createHash('sha256').update(bytes).digest('hex'),counts:ledger.counts},canonicalGoalChanges:false,newAMDecisions:false,contentReview:'PENDING_GENUINE_INDEPENDENT_REVIEW'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS_CURRENT_AM_CONTEXT',rows:records.length,authoritativeCurricularAtomicCount:ledger.counts.curricularAtomic}));
