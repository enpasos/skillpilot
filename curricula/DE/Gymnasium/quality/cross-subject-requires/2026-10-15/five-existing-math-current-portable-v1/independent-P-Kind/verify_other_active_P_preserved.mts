// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprint} from '../../../app/scripts/lib/crossSubjectRequiresInventory.ts'
const O=dirname(fileURLToPath(import.meta.url)),R=resolve(O,'../../..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const ip='tmp/cross-subject-requires/canonical-gymnasium-effective-review-index-20261015-v19/effective-goal-index.json'
const index=read(ip), ix=new Map(index.records.map((r:any)=>[r.goalId,r]))
const wanted=new Set(readFileSync(resolve(O,'exact-whole-five-proposed-inputs.before-quality-lock.json'),'utf8')&&JSON.parse(readFileSync(resolve(O,'exact-whole-five-proposed-inputs.before-quality-lock.json'),'utf8')).rows.map((r:any)=>r.goalId))
const reg=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const rows:any[]=[],counts:Record<string,number>={}
for(const s of reg.subjects){
 if(!['mathematik','physik'].includes(s.subject))continue
 let count=0
 for(const cp of s.positiveEvidenceConfigPaths){
  const c=read(cp),scope=new Set(c.scope.goalIds),rp=c.reviewPath
  for(const l of readFileSync(resolve(R,rp),'utf8').split(/\r?\n/).filter(Boolean)){
   const row=JSON.parse(l);if(!scope.has(row.goalId))continue
   const ir:any=ix.get(row.goalId);const owners=ir.explicitReviewedProfileCondition.actualCurrentOwners
   if(owners.length!==1)throw Error('Missing unique v19 owner '+row.goalId)
   const exact=fingerprint(row)===owners[0].completeRecordSha256
   if(!exact)throw Error('Current Main P differs from prior exact record '+row.goalId)
   rows.push({subject:s.subject,goalId:row.goalId,isSelectedFive:wanted.has(row.goalId),completeCurrentRecordMatchesExistingV19:true,currentCompleteRecordFingerprint:fingerprint(row),currentOwnerConfig:cp,currentOwnerReview:rp});count++
  }
 }
 counts[s.subject]=count
}
if(counts.mathematik!==807||counts.physik!==478)throw Error('Wrong actual current denominator')
writeFileSync(resolve(O,'all1285-active-P-complete-record-preservation.actual.json'),JSON.stringify({method:'Native stable fingerprint comparison of actual centrally scoped full P records with existing exactv19 current-owner complete-record fingerprints. This is byte/semantic binding preservation evidence, not new whole1285P science.',counts,selectedFiveMainRecordsStillUnchanged:rows.filter(r=>r.isSelectedFive).length,otherPhysicsMainCompleteRecordsUnchanged:rows.filter(r=>r.subject==='physik'&&!r.isSelectedFive).length,MathMainCompleteRecordsUnchanged:rows.filter(r=>r.subject==='mathematik').length,records:rows},null,2)+'\n',{flag:'wx'})
console.log('All1285 actual Main fullP records still exact vs existingv19; other473Physics and807Math unchanged.')
