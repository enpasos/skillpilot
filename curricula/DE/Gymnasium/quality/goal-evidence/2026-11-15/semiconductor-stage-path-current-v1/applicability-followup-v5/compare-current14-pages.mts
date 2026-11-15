// SPDX-License-Identifier: Apache-2.0
// One native current atlas load, no PDF rendering and no complete central check.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {loadGoalDescriptionRolloutBase,buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {stableGoalBookJson} from '../../../../../../../../app/scripts/goalBookModel.ts'
const P='curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/semiconductor-stage-path-current-v1/',V=P+'applicability-followup-v5/',D='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-11-15/'
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8')),sha=(bytes:string|Buffer)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const base=await loadGoalDescriptionRolloutBase(P+'post-corrected-independent-review-v3/current-review.goal-book.config.json')
const replaced=new Set(['77ab31a9-8961-511c-8637-06e98023d869','dc55adac-91a5-5cc3-ab47-be008480616f','df010b2b-b182-5f7e-bbe4-49b72e48c27a'])
const rows=[]
for(const name of ['semiconductor-stage-path-current10-v3','semiconductor-stage-path-retained-pages-current3-v4','semiconductor-stage-path-applicability-current3-v5']){
 const cfg=read(D+name+'.config.json'),prior=read(cfg.outputDirectory+'/bundle/book-model.json'),now=buildGoalDescriptionRolloutSubsetModel({baseModel:base.model,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title})
 for(const id of cfg.goalIds){
  if(name!=='semiconductor-stage-path-applicability-current3-v5'&&replaced.has(id))continue
  const reviewedPage=prior.pages.find((page:{goalId:string})=>page.goalId===id),currentPage=now.pages.find(page=>page.goalId===id)
  assert.ok(reviewedPage&&currentPage)
  const a=reviewedPage as Record<string,unknown>,b=currentPage as unknown as Record<string,unknown>
  rows.push({goalId:id,batchId:cfg.batchId,reviewedPageFingerprint:reviewedPage.pageFingerprint,currentPageFingerprint:currentPage.pageFingerprint,exactCurrentPageEqual:stableGoalBookJson(a)===stableGoalBookJson(b),changedFields:[...new Set([...Object.keys(a),...Object.keys(b)])].filter(key=>stableGoalBookJson(a[key])!==stableGoalBookJson(b[key])),reviewedModelDigest:prior.digest,currentSubsetModelDigest:now.digest})
 }
}
assert.equal(new Set(rows.map(row=>row.goalId)).size,14)
const receipt={schemaVersion:1,checkedAt:new Date().toISOString(),actualTool:'loadGoalDescriptionRolloutBase plus exact same native subset builder; one full current atlas load, zero PDF builds, zero full central invocations',goalIds:rows.map(row=>row.goalId),allCurrentPagesExact:rows.length===14&&rows.every(row=>row.exactCurrentPageEqual),currentFreshApplicabilityPages:3,retainedExactCurrentPages:11,sourceBindings:base.model.source,sourcePins:['curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'].map(path=>({path,sha256:sha(readFileSync(path))})),rows,note:'The three applicability-bound pages use their actual new current A/B campaign. Eleven remaining exact page objects retain the actual prior current independent confirmations. Earlier bundles, run records and failed central execution are immutable. No global source digest is disguised as a new blind review.'}
writeFileSync(V+'current14-page-bindings.receipt.json',JSON.stringify(receipt,null,2)+'\n')
assert.ok(receipt.allCurrentPagesExact,'At least one active native reviewed page changed; do not assert current evidence')
console.log('Actual current atlas comparison passed:14/14 active native reviewed page objects exact (11 retained +3 current applicability).')
