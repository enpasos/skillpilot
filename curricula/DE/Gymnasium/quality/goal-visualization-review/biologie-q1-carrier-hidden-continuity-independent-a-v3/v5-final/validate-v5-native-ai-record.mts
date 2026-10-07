// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {aiApprovalStatus,isAiApprovedForCurrentAsset} from '../../../../../../../app/src/utils/goalVisualizationQaStatus'
import {normalizeGoalVisualizationAiReview} from '../../../../../../../app/scripts/goalVisualizationQaModel'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..')
const r=JSON.parse(readFileSync(resolve(own,'single-native-v-record.v5-candidate.json'),'utf8'))
const p=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-carrier-hidden-continuity-and-length-author-20261006-v3/carrier-v5.candidate.png')
const sha='sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
assert.equal(sha,r.assetSha256);assert.equal(normalizeGoalVisualizationAiReview(r,sha).aiApproved,'yes');assert.equal(aiApprovalStatus(r),'approved');assert.equal(isAiApprovedForCurrentAsset(r),true)
const actualActive='sha256:'+createHash('sha256').update(readFileSync(resolve(root,r.publicAssetPath))).digest('hex')
const result={schemaVersion:1,createdAtUTC:new Date().toISOString(),nativeAiCandidateRecordStatus:'PASS_EXACT_CANDIDATE_BYTES',actualCandidateSha256:sha,actualActivePublicSha256:actualActive,activeImportStatus:sha===actualActive?'EXACT_CANDIDATE_PRESENT':'HOLD_CANDIDATE_NOT_IMPORTED',finalNativeDAndP:'HOLD_NO_FINAL_ACTIVE_INPUT_REVALIDATION_IN_THIS_STAGE',humanApproved:r.humanApproved,activeWrites:false,strictNetGain:0}
writeFileSync(resolve(own,'native-v5-ai-record.validation.actual.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result))
