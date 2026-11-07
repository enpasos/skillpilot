import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {collectCompositionProjectionRoleGoalIds} from '../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
const root=process.cwd();const out=root+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/coverage-contract-followup';
const path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';
const raw=readFileSync(root+'/'+path);const digest=(x:Buffer|string)=>createHash('sha256').update(x).digest('hex');
assert.equal(digest(raw),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e');
const source=JSON.parse(raw.toString('utf8'));const owner=source.landscapeId;const byId=new Map<string,any>(source.goals.map((g:any)=>[g.id,g]));
assert.equal(byId.size,source.goals.length);
// This inventory records field ABSENCE distinctly. It grants no mastery and approves no error.
const rows=source.goals.filter((g:any)=>g.examData).map((g:any)=>{
 const has=Object.hasOwn(g.examData,'coveredGoalIds');
 const basic={goalId:g.id,title:g.title,historicalGoalObjectSha256:digest(JSON.stringify(g)),historicalExamDataSha256:digest(JSON.stringify(g.examData))};
 if(!has)return {...basic,coverage:{state:'undeclared',reason:'Field absent in exact historical source; historical competence coverage unknown.'}};
 const refs=g.examData.coveredGoalIds;assert.ok(Array.isArray(refs)&&refs.length>0);for(const id of refs)assert.ok(byId.has(id));
 const roles=collectCompositionProjectionRoleGoalIds(refs.map((goalId:string)=>({kind:'canonicalSubtree',goalId})),byId);
 const atoms=[...roles.targetGoalIds].filter(id=>!byId.get(id).contains?.length).sort();
 assert.ok(atoms.length);return {...basic,coverage:{state:'declared',references:refs,resolvedAtomicGoalIds:atoms}};
}).sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId));
assert.equal(rows.length,24);assert.equal(rows.filter((r:any)=>r.coverage.state==='undeclared').length,10);
writeFileSync(out+'/historical-informatics-source.json.gz',gzipSync(raw,{level:9}));
const inventory={kind:'History reference only, NOT accepted-error baseline or coverage/content approval',owner,sourcePath:path,historicalRawSourceSha256:digest(raw),declaredCount:14,undeclaredCount:10,definitions:rows};
writeFileSync(out+'/history-inventory.json',JSON.stringify(inventory,null,2)+'\n');
console.log(JSON.stringify({definitions:rows.length,declared:14,undeclared:10,rawSource:digest(raw),inventory:digest(readFileSync(out+'/history-inventory.json'))}));
