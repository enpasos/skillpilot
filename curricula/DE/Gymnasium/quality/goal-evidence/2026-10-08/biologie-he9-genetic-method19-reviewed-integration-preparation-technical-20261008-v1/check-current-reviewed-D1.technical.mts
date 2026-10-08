// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {loadGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import {validateGoalDescriptionReviewDualRound} from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound.ts'
import {validateGoalDescriptionDualRoundResolution} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {validateStandaloneResolutionIndexSchema,validateStandaloneResolutionIndexStructure} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const prepared=read(resolve(own,'candidate/canonical.one-current191-future-active.json')),active=process.argv.includes('--active'),landscape=active?read(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')):prepared
if(active)assert.deepEqual(landscape,prepared,'Complete current active474 must equal the exact reviewed rebased future candidate')
const kinds=read(resolve(own,'candidate/semantic-kinds.future-active.json')),atomics=new Set<string>(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId));assert.equal(atomics.size,391)
const out=resolve(own,'native-d-one'),index=read(resolve(out,'resolution-index.json'));assert.deepEqual(validateStandaloneResolutionIndexSchema(index),[]);assert.deepEqual(validateStandaloneResolutionIndexStructure(index,atomics),[])
assert.equal(index.resolutions.length,1);assert.ok(!index.deferredGoalIds)
const bundle=read(resolve(out,'bundle/manifest.json'));await verifyGoalBookReviewBundleArtifactBytes(bundle,resolve(out,'bundle'))
const rounds=await Promise.all(['a','b'].map(async name=>{const d=resolve(out,'round-'+name),input=read(resolve(d,'description-review-input.json')),campaign=read(resolve(d,'description-review-campaign.json')),b=read(resolve(d,'review-bundle-manifest.json'));assert.equal(stableGoalBookJson(b),stableGoalBookJson(bundle));const cv=await validateGoalDescriptionReviewCampaign({bundle:b,input,campaign});assert.deepEqual(cv.errors,[]);const loaded=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(d,'batches'),resultsDirectory:resolve(d,'results')});assert.deepEqual(loaded.errors,[]);return{bundle:b,input,campaign,resultPairs:loaded.resultPairs}}))
const dual=await validateGoalDescriptionReviewDualRound({first:rounds[0],second:rounds[1]});assert.deepEqual(dual.errors,[]);assert.equal(dual.summary.goalCount,1)
const db=readFileSync(resolve(out,'dual-summary.json'));assert.equal(stableGoalBookJson(dual.summary),stableGoalBookJson(JSON.parse(db.toString('utf8'))));assert.equal(sha(db),index.groups[0].dualSummaryDigest)
const mb=readFileSync(resolve(out,'synthesis-decisions.json')),manifest=JSON.parse(mb.toString('utf8'));assert.equal(manifest.decisions.length,1);assert.ok(!manifest.deferredGoals)
const e=index.resolutions[0],bytes=readFileSync(resolve(out,e.resolutionPath)),resolution=JSON.parse(bytes.toString('utf8'));assert.equal(sha(bytes),e.resolutionDigest)
const v=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:db,currentInput:rounds[0].input,landscape,first:rounds[0],second:rounds[1],synthesisDecisionManifestArtifact:{manifest,manifestBytes:mb,manifestPath:'synthesis-decisions.json'}});assert.deepEqual(v.errors,[]);assert.equal(v.strictDescriptionComplete,true)
console.log(JSON.stringify({scope:active?'actual active canonical':'exact reviewed current191-rebased inactive candidate',nativeCurrentD1:'PASS',indexSchemaAndStructure:'PASS',actualOneNativePair:'PASS',bothActualOwnReviewerRecordRunBytesUnchanged:true,originalHistorical19HoldPreserved:true,activeWrites:0,newScienceRun:false,strictGainClaimed:0,humanApproval:false}))
