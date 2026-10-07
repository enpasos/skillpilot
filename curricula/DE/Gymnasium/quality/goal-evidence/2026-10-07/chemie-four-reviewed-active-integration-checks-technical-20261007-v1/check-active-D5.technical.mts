// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {validateGoalDescriptionDualRoundResolution} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {loadGoalDescriptionReviewCampaignResultDirectories} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import {resolveResolutionBatchArtifactPath} from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../../'),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),landscape=read(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')),prepared=resolve(dirname(own),'chemie-four-plus-d2cc-reviewed-integration-preparation-technical-20261007-v1'),results:any[]=[]
assert.deepEqual(landscape,read(resolve(prepared,'candidate/canonical.json')))
const round=async(p:string)=>{const bundle=read(resolve(p,'review-bundle-manifest.json')),input=read(resolve(p,'description-review-input.json')),campaign=read(resolve(p,'description-review-campaign.json')),loaded=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(p,'batches'),resultsDirectory:resolve(p,'results')});assert.deepEqual(loaded.errors,[]);return {bundle,input,campaign,resultPairs:loaded.resultPairs}}
for(const scope of ['four','context']){const dir=resolve(prepared,'native-d-'+scope),index=read(resolve(dir,'resolution-index.json')),db=readFileSync(resolve(dir,'dual-summary.json')),artifacts={dualSummary:JSON.parse(db.toString()),dualSummaryBytes:db,first:await round(resolve(dir,'round-a')),second:await round(resolve(dir,'round-b'))}
 for(const entry of index.resolutions){const p=resolve(dir,entry.resolutionPath),b=readFileSync(p);assert.equal(sha(b),entry.resolutionDigest);const resolution=JSON.parse(b.toString()),sp=resolveResolutionBatchArtifactPath(p,resolution.synthesisDecisionManifest.manifestPath),sb=readFileSync(sp),v=await validateGoalDescriptionDualRoundResolution({...artifacts,resolution,currentInput:artifacts.first.input,landscape,synthesisDecisionManifestArtifact:{manifest:JSON.parse(sb.toString()),manifestBytes:sb,manifestPath:resolution.synthesisDecisionManifest.manifestPath}});assert.deepEqual(v.errors,[]);assert.equal(v.strictDescriptionComplete,true);results.push({goalId:entry.goalId,nativeActiveCurrentD:'PASS',exactOriginalScientificOutputs:true})}
}
assert.equal(results.length,5);writeFileSync(resolve(own,'checks/active-D5.current-canonical.actual.json'),JSON.stringify({results,activeWholeCanonical480:true,sourceHistoricalResolutionsUnchanged:true,newScientificJudgment:false,humanApproval:false},null,2)+'\n',{flag:'wx'});console.log('PASS active current D4 + protected d2cc D1')
