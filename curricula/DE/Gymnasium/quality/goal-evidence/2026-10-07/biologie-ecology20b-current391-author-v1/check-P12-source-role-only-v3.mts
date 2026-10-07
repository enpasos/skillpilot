// SPDX-License-Identifier: Apache-2.0
// Native checks of an appended source-role precision container; no review verdict.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const records=(p:string)=>readFileSync(p,'utf8').trim().split('\n').map(JSON.parse)
const old=records(resolve(own,'native-raster-candidate/P12.actual-raster-author.review.jsonl'))
const current=records(resolve(own,'source-locator-precision-v3/P12.actual-raster-source-roles-author-v3.review.jsonl'))
const by=new Map<string,any>(read(resolve(own,'candidate/canonical.current474-twelve-new-raster-author.json')).goals.map((g:any)=>[g.id,g]))
const qa=read(resolve(own,'candidate/visualization-qa.current391-twelve-raster-author.json'))
const digests:Record<string,string>={}
for(const r of qa.records)if(r.visualizationState==='available')digests[r.imageUrl]='sha256:'+createHash('sha256').update(readFileSync(resolve(root,r.publicAssetPath))).digest('hex')
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(current.length,12)
let changedDissent=0
for(let i=0;i<current.length;i++){
  const r=current[i],p=old[i];assert.equal(r.goalId,p.goalId)
  for(const field of ['profile','goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint'])assert.deepEqual(r[field],p[field])
  if(JSON.stringify(r.dissent)!==JSON.stringify(p.dissent))changedDissent++
  const goal=by.get(r.goalId),resources:Record<string,string>={}
  for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization'){assert.ok(digests[link.url]);resources[link.url]=digests[link.url]}
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,resources,'curricularAtomic'),[])
  assert.ok(validate(r),ajv.errorsText(validate.errors));assert.deepEqual(r.reviewRunIds,[])
  assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate')
}
assert.equal(changedDissent,1)
const receipt={nativeApi:'validatePositiveGoalEvidenceRecordSemantics',closedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',records:12,casePairs:24,schemaErrors:0,semanticErrors:0,wholeProfilesAndResourceBindingsExact:true,changedDissentGoalId:'ca6d4912-f4d2-5c57-86d9-70aa090cc32f',changedDissentContainers:1,authorContainerMetadataNew:true,newScientificReviewClaimed:false,actualPublicCLIStillPendingIntegration:true,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',realLearnerEvidence:false,humanApproval:false,strictGainClaimed:0}
writeFileSync(resolve(own,'source-locator-precision-v3/P12.native-closed-schema-and-semantics.actual.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(receipt))
