// SPDX-License-Identifier: Apache-2.0
// Existing native validators; no campaign/run rewrite or new science review.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {loadGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import {validateGoalDescriptionReviewDualRound} from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound'
import {validateGoalDescriptionDualRoundResolution} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import {validateStandaloneResolutionIndexSchema,validateStandaloneResolutionIndexStructure,buildResolutionSupersessionChains} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),gid19='1b7f08a1-33df-5779-af66-430c91d699b7'
const prepared=read(resolve(own,'candidate/canonical.seventeen-pending-review.future-active.json')),active=process.argv.includes('--active'),landscape=active?read(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')):prepared
if(active)assert.deepEqual(landscape,prepared,'The complete active474 canonical must equal the exact reviewed future candidate')
const kinds=read(resolve(own,'before/kinds.json')),atomics=new Set<string>(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId));assert.equal(atomics.size,391)
const results:any[]=[],indexPaths=['original-eighteen-pair-native-d-eighteen/resolution-index.json']
for(const ip of indexPaths){const out=dirname(resolve(own,ip)),index=read(resolve(own,ip));assert.deepEqual(validateStandaloneResolutionIndexSchema(index),[]);assert.deepEqual(validateStandaloneResolutionIndexStructure(index,atomics),[])
 const bundle=read(resolve(out,'bundle/manifest.json'));await verifyGoalBookReviewBundleArtifactBytes(bundle,resolve(out,'bundle'))
 const rounds=await Promise.all(['a','b'].map(async name=>{const d=resolve(out,'round-'+name),input=read(resolve(d,'description-review-input.json')),campaign=read(resolve(d,'description-review-campaign.json')),b=read(resolve(d,'review-bundle-manifest.json'));assert.equal(stableGoalBookJson(b),stableGoalBookJson(bundle));const cv=await validateGoalDescriptionReviewCampaign({bundle:b,input,campaign});assert.deepEqual(cv.errors,[]);const loaded=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(d,'batches'),resultsDirectory:resolve(d,'results')});assert.deepEqual(loaded.errors,[]);return{bundle:b,input,campaign,resultPairs:loaded.resultPairs}}))
 const d=await validateGoalDescriptionReviewDualRound({first:rounds[0],second:rounds[1]});assert.deepEqual(d.errors,[]);const db=readFileSync(resolve(out,'dual-summary.json'));assert.equal(stableGoalBookJson(d.summary),stableGoalBookJson(JSON.parse(db.toString('utf8'))));assert.equal(sha(db),index.groups[0].dualSummaryDigest)
 const mb=readFileSync(resolve(out,'synthesis-decisions.json')),manifest=JSON.parse(mb.toString('utf8'));assert.deepEqual(manifest.decisions.map((v:any)=>v.goalId),index.resolutions.map((v:any)=>v.goalId));assert.deepEqual(index.deferredGoalIds,[gid19]);assert.equal(manifest.deferredGoals.length,1);assert.equal(manifest.deferredGoals[0].goalId,gid19);assert.equal(d.summary.goalCount,18)
 for(const e of index.resolutions){const b=readFileSync(resolve(out,e.resolutionPath)),resolution=JSON.parse(b.toString('utf8'));assert.equal(sha(b),e.resolutionDigest)
  const v=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:d.summary,dualSummaryBytes:db,currentInput:rounds[0].input,landscape,first:rounds[0],second:rounds[1],synthesisDecisionManifestArtifact:{manifest,manifestBytes:mb,manifestPath:'synthesis-decisions.json'}});assert.deepEqual(v.errors,[]);assert.equal(v.strictDescriptionComplete,true);results.push({goalId:e.goalId,currentNativeD:'PASS',actualFrame:'actual original18 frame;17 concordant resolutions only'})
 }
}
assert.equal(results.length,17)
console.log(JSON.stringify({scope:active?'actual active canonical':'exact reviewed future inactive canonical',nativeCurrentD17:'PASS',schemaAndStructure:'PASS',actualOriginalDual18:'PASS',genuine19Deferred:true,nativeOriginalCampaignsRecordsAndRunsUnchanged:true,results,activeWrites:0,newScienceRun:false,humanApproval:false,strictGainClaimed:0}))
