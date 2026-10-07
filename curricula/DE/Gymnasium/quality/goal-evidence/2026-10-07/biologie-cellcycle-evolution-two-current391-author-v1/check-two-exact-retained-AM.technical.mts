// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintGoal as fingerprintA} from './native-AM-retention/native-A-exact-fingerprint-probe.mts'
import {fingerprintGoal as fingerprintM} from './native-AM-retention/native-M-exact-fingerprint-probe.mts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const candidate=read(resolve(own,'candidate/canonical.current474-two-new-raster-author.json')),originals=read(resolve(own,'current-two-whole-DEEN-goals.exact.json')).goals,ids=new Set(originals.map((g:any)=>g.id))
const paths={A:'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.review.jsonl',M:'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.review.jsonl'}
const rows:any[]=[]
for(const side of ['A','M'] as const){const raw=readFileSync(resolve(root,paths[side]),'utf8'),records=raw.trim().split('\n').map(l=>JSON.parse(l)).filter(r=>ids.has(r.goalId));assert.equal(records.length,2)
 writeFileSync(resolve(own,'native-AM-retention/'+side+'2.original-active-rows.exact.jsonl'),raw.split('\n').filter(l=>l&&ids.has(JSON.parse(l).goalId)).join('\n')+'\n',{flag:'wx'})
 for(const r of records){const g=candidate.goals.find((g:any)=>g.id===r.goalId),original=originals.find((g:any)=>g.id===r.goalId),fingerprint=side==='A'?fingerprintA:fingerprintM;assert.equal(fingerprint(g,r.ruleVersion),r.fingerprint);assert.equal(fingerprint(original,r.ruleVersion),r.fingerprint)
 if(side==='A'){assert.equal(r.status,'atomic');assert.equal(r.semanticAtomic,true)}else{assert.equal(r.status,'no_memory_needed');assert.equal(r.memoryUseful,false);assert.equal((r.deckIds??[]).length,0);assert.equal((r.memoryGoalIds??[]).length,0)}
 rows.push({side,goalId:g.id,sourceRecordFingerprint:r.fingerprint,currentOriginalFingerprint:r.fingerprint,actualRasterCandidateFingerprint:r.fingerprint,existingDecisionUnchanged:true,newScientificReview:false})}}
const sources=['app/scripts/semanticAtomicityReview.ts','app/scripts/memoryCardReview.ts']
writeFileSync(resolve(own,'native-AM-retention/two-native-current-binding-check.technical.json'),JSON.stringify({nativePrivateFunctionSources:sources.map(path=>({path,sha256:sha(resolve(root,path)),functionBodiesCopiedExactly:true})),originalRecordPaths:Object.values(paths),rows,retainedA:2,retainedM:2,memoryDecision:'no_memory_needed for both, no decks or origin-card links added, hence no additional card/visibility obligation created',activeWrites:0,noReviewFingerprintEdited:true,newScientificReviews:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({retainedA2:'PASS',retainedM2:'PASS',newAMReview:false,newDecks:0,activeWrites:0}))
