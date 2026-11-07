import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal, parseSemanticKindLedger } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'

const P=dirname(fileURLToPath(import.meta.url)),R=resolve(P,'../../../..')
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const hash=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const review=read(P+'/independent-review.json'),manual=read(P+'/manual-decisions.json')
assert.equal(review.decisions.length,15)
assert.deepEqual(review.decisions.map((r:any)=>r.goalId),manual.map((r:any)=>r.goalId))
const loadSource=(pin:any)=>{
  const compressed=fs.readFileSync(R+'/'+pin.archive.path)
  assert.equal(hash(compressed),pin.archive.sha256)
  const bytes=gunzipSync(compressed)
  assert.equal(hash(bytes),pin.sha256)
  return JSON.parse(bytes.toString('utf8'))
}
const before=loadSource(review.sourcePins.before),after=loadSource(review.sourcePins.after)
const ledgerBytes=fs.readFileSync(R+'/'+review.oldLedger.path)
assert.equal(hash(ledgerBytes),review.oldLedger.sha256)
const ledger=JSON.parse(ledgerBytes.toString('utf8')),candidate=structuredClone(ledger)
const rows=[]
for(const r of review.decisions){
  assert.equal(r.semanticKind,'curricularAtomic')
  assert.equal(r.decisionBasis,'reviewed-current-semantic-recheck-curricular-atomic')
  for(const k of ['competenceJudgment','observablePerformance','placementJudgment','alternativeKindsRejected','requiresChangeJudgment'])assert(r[k].length>50)
  const old=before.goals.find((g:any)=>g.id===r.goalId),current=after.goals.find((g:any)=>g.id===r.goalId)
  assert.deepEqual(old,r.oldGoalComplete)
  assert.deepEqual(current,r.currentGoalComplete)
  const index=ledger.decisions.findIndex((d:any)=>d.goalId===r.goalId)
  assert.deepEqual(ledger.decisions[index],r.oldLedgerDecision)
  const oldFingerprint=fingerprintSemanticKindSourceGoal(old),newFingerprint=fingerprintSemanticKindSourceGoal(current)
  assert.equal(oldFingerprint,r.oldLedgerDecision.sourceFingerprint)
  assert.equal(newFingerprint,r.expectedSource15FingerprintFromHold)
  assert.notEqual(oldFingerprint,newFingerprint)
  const newDecision={goalId:r.goalId,sourceFingerprint:newFingerprint,semanticKind:r.semanticKind,decisionStatus:'authoritative',decisionBasis:r.decisionBasis}
  candidate.decisions[index]=newDecision
  rows.push({goalId:r.goalId,pointer:`/decisions/${index}`,oldDecision:ledger.decisions[index],newDecision,reviewPointer:`/decisions/${rows.length}`,reviewEvidenceSha256:hash(fs.readFileSync(P+'/independent-review.json'))})
}
assert.deepEqual(candidate.counts,ledger.counts)
assert.equal(candidate.reviewMethod,ledger.reviewMethod)
assert.equal(candidate.decisions.filter((d:any,i:number)=>JSON.stringify(d)!==JSON.stringify(ledger.decisions[i])).length,15)
const selected=new Set(rows.map(r=>r.goalId))
for(let i=0;i<ledger.decisions.length;i++)if(!selected.has(ledger.decisions[i].goalId))assert.deepEqual(candidate.decisions[i],ledger.decisions[i])
const checks:any[]=[]
const parse=(l:any,s:any)=>parseSemanticKindLedger(l,s,s.landscapeId,review.sourcePins.after.canonicalPath)
const pass=(name:string,l:any,s:any)=>{
  const result=parse(l,s)
  checks.push({name,outcome:'accepted',nativeDecisionCount:result.semanticKindByGoalId.size,curricularAtomicCount:[...result.semanticKindByGoalId.values()].filter(x=>x==='curricularAtomic').length})
}
const reject=(name:string,l:any,s:any,pattern:RegExp)=>{
  let error=''
  try{parse(l,s)}catch(e){error=String(e)}
  assert.match(error,pattern)
  checks.push({name,outcome:'rejected',diagnostic:error})
}
const startedAt=new Date().toISOString()
pass('Unchanged active source plus unchanged old ledger',ledger,before)
reject('Source15 plus old ledger is stale',ledger,after,/stale semantic-kind decision/)
pass('Source15 plus fifteen independently reasoned decisions',candidate,after)
reject('New decisions cannot be applied to old source',candidate,before,/stale semantic-kind decision/)
const extra=structuredClone(candidate)
extra.decisions.find((d:any)=>d.goalId===rows[0].goalId).reviewActor='forbidden extra field'
reject('Actor evidence must remain outside closed ledger row',extra,after,/closed JSON Schema/)
const method=structuredClone(candidate)
method.reviewMethod='semantic-recheck-v2'
reject('Review method cannot be invented for this successor',method,after,/closed JSON Schema/)
const finishedAt=new Date().toISOString()
const text=JSON.stringify(candidate,null,2)+'\n'
fs.writeFileSync(P+'/mathematik.semantic-kinds.candidate.json',text)
fs.writeFileSync(P+'/ledger-delta.json',JSON.stringify({schemaVersion:1,status:'PRIVATE_ONLY_FIFTEEN_REVIEWED_DECISION_REPLACEMENTS',sourceSha256:review.sourcePins.after.sha256,oldLedger:review.oldLedger,candidate:{path:'mathematik.semantic-kinds.candidate.json',sha256:hash(text)},unchangedDecisions:1237,countsUnchanged:ledger.counts,reviewMethodUnchanged:ledger.reviewMethod,rows},null,2)+'\n')
fs.writeFileSync(P+'/native-kind-check.json',JSON.stringify({status:'PASS_BOUNDED_NATIVE_KIND_PARSER_AND_FINGERPRINT_CHECKS',startedAt,finishedAt,actor:'Codex /root/math15_semantic_kind_review',nativeModule:'app/scripts/goalBookModel.ts',nativeSelectedOldAndNewFingerprintPairs:15,expectedHoldFingerprintMatches:15,candidateSha256:hash(text),unchangedRows:1237,checks,producerRuns:0,activeFilesWritten:false},null,2)+'\n')
console.log(JSON.stringify({checks:checks.map(({name,outcome})=>({name,outcome})),selectedFingerprintPairs:15,candidateSha256:hash(text),unchangedRows:1237,producerRuns:0}))
