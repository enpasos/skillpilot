// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
const own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const snapshots=read(resolve(own,'current-two-whole-DEEN-goals.exact.json')).goals
const landscape=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const current=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const original='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cqr003-five-reviewed-integration-preparation-technical-20261007-v1/native-d-four'
const input=read(original+'/round-a/description-review-input.json'),index=read(original+'/resolution-index.json'),rows=[]
for(const snapshot of snapshots){
 assert.deepEqual(current.get(snapshot.id),snapshot)
 const entry=input.goals.find((g:any)=>g.goalId===snapshot.id)
 assert.deepEqual(buildGoalDescriptionCanonicalContext(snapshot),entry.canonicalContext)
 const ref=index.resolutions.find((g:any)=>g.goalId===snapshot.id),path=original+'/'+ref.resolutionPath,bytes=readFileSync(path),resolution=JSON.parse(bytes.toString())
 assert.equal(ref.resolutionDigest,'sha256:'+createHash('sha256').update(bytes).digest('hex'))
 assert.equal(resolution.status,'resolved');assert.equal(resolution.decision,'keep_current')
 assert.equal(resolution.goal.pageFingerprint,entry.pageFingerprint)
 assert.equal(resolution.goal.goalFingerprint,entry.goalFingerprint)
 rows.push({goalId:snapshot.id,originalResolutionPath:path,originalResolutionDigest:ref.resolutionDigest,
  originalReviewFramePageFingerprint:entry.pageFingerprint,ownCanonicalContextExact:true,wholeRawCurrentGoalExact:true,
  independentRounds:[resolution.rounds.first.roundId,resolution.rounds.second.roundId],
  historicalReviewRestarted:false,newImageContextPending:true})
}
writeFileSync(resolve(own,'retained-two-native-canonical-contexts-and-original-D-frames.actual.json'),JSON.stringify({rows,
 note:'The current full national atlas pages use another projection, scope matrix and numbering than the original four-page D frame; no equality of fingerprints across those different views is claimed. Whole own raw/context bindings and exact original resolved D artifacts are retained. Fresh actual image/page context review remains required.',
 newDReviewClaimed:false,activeWrites:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log('PASS: two exact current raw goals/native canonical contexts and original resolved D-frame artifacts retained; fresh actual image/page checks pending.')
