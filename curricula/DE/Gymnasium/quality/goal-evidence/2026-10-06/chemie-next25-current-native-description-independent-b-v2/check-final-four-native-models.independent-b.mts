import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs} from '/tmp/skillpilot-chemie-next25-native-v2-qftjmruh/app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '/tmp/skillpilot-chemie-next25-native-v2-qftjmruh/app/scripts/materializeGoalDescriptionRolloutBatch'
const root=process.cwd(),author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2',own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-current-native-description-independent-b-v2',mirror='/tmp/skillpilot-chemie-next25-native-v2-qftjmruh'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const specs=[['current378','full-current378.book.config.json','qa-artifacts/full-current378.book-model.json'],['candidate378','full-prospective378.book.config.json','qa-artifacts/full-prospective378.book-model.json']]
const rows=[]
for(const [label,config,saved]of specs){
 const configured=read(author+'/'+config);const actual=await loadGoalBookBuildInputs(author+'/'+config,mirror);const expected=read(author+'/'+saved)
 assert.deepEqual(actual.model,expected)
 rows.push({label,configPath:author+'/'+config,savedModelPath:author+'/'+saved,savedFileSHA256:sha(author+'/'+saved),nativeIndependentModelDigest:actual.model.digest,goalCount:actual.model.pages.length,wholeModelExact:true})
}
for(const label of ['twenty','five']){const config=read(author+'/native-d-'+label+'.batch.config.json');const actual=buildGoalDescriptionRolloutSubsetModel({baseModel:read(author+'/qa-artifacts/full-prospective378.book-model.json'),goalIds:config.goalIds,bookId:config.bookId,title:config.title});const saved=author+'/native-d-'+label+'/bundle/book-model.json';assert.deepEqual(actual,read(saved));rows.push({label,configPath:author+'/native-d-'+label+'.batch.config.json',savedModelPath:saved,savedFileSHA256:sha(saved),nativeIndependentModelDigest:actual.digest,goalCount:actual.pages.length,wholeModelExact:true})}
const current=read(author+'/qa-artifacts/full-current378.book-model.json'),future=read(author+'/qa-artifacts/full-prospective378.book-model.json')
assert.deepEqual(current.pages.map((p:any)=>p.goalId),future.pages.map((p:any)=>p.goalId))
const deltas=current.pages.flatMap((p:any,i:number)=>{const q=future.pages[i],fields=Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify(q[k]));return fields.length?[{goalId:p.goalId,fields,wholeCurrentPage:p,wholeCandidatePage:q}]:[]})
assert.equal(deltas.length,8)
for(const d of deltas)assert.ok(d.fields.every(k=>['visualization','goalFingerprint','pageFingerprint'].includes(k)))
const canon=read(author+'/current479-post-BW.baseline.canonical.author-input.snapshot.json'),candidate=read(author+'/canonical.final-png-current.author-candidate.json')
assert.deepEqual(canon,read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
assert.equal(canon.goals.length,479);assert.equal(candidate.goals.length,479)
const wholeDeltas=canon.goals.flatMap((g:any,i:number)=>{const h=candidate.goals[i];assert.equal(g.id,h.id);const fields=Object.keys(g).filter(k=>JSON.stringify(g[k])!==JSON.stringify(h[k]));return fields.length?[{goalId:g.id,fields}]:[]})
assert.equal(wholeDeltas.length,8)
const protectedEntry=read(own+'/independent-b.current-entry.protected-whole-goal-hashes.actual.json');const protectedChem=protectedEntry.subjects.find((s:any)=>s.subject==='chemie')
for(const id of protectedChem.orderedStrictGoalIds){assert.deepEqual(candidate.goals.find((g:any)=>g.id===id),canon.goals.find((g:any)=>g.id===id));assert.deepEqual(future.pages.find((g:any)=>g.goalId===id),current.pages.find((g:any)=>g.goalId===id))}
const raw=read(author+'/actual-final-current25-whole-native-review-inputs.author.raw.json')
for(const r of raw.wholeCurrent25CandidateNativeRows)assert.deepEqual(r.wholeCurrentGoal,candidate.goals.find((g:any)=>g.id===r.goalId))
writeFileSync(own+'/independent-b.four-native-models-and-full378-context-delta.actual.json',JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'Independent B actual production load/build derivations; model-only, no PDF/global build',models:rows,whole479Deltas:wholeDeltas,actualFull378PageDeltas:deltas,other370WholePagesExact:true,all378OrderedIdsExact:true,all127ProtectedWholeGoalsAndWholePagesExact:true,all25RawWholeCandidateGoalsExact:true,visibleDETextUnchangedAll378:true,breadcrumbsRequiresReverseRequiresExternalReferencesEvidenceSummariesExactAll378:true,newSourceApproval:false,nanoPrinted14LocatorHold:true,activeWrites:false,strictNetGain:0,humanApproval:false},null,2)+'\n')
console.log(JSON.stringify({models:rows.map(r=>({label:r.label,count:r.goalCount,wholeExact:r.wholeModelExact})),wholeDeltas,full378Deltas:deltas.map(d=>({goalId:d.goalId,fields:d.fields})),protected127WholeGoalsPagesExact:true}))
