// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {validateGoalDescriptionDualRoundResolution} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {loadGoalDescriptionReviewCampaignResultDirectories} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import {resolveResolutionBatchArtifactPath} from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'
import {reviewPositiveGoalEvidenceConfig} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(v:Buffer)=>'sha256:'+createHash('sha256').update(v).digest('hex'),bio=read(resolve(own,'candidate/biologie.registry-subject.json')),landscape=read(resolve(own,'candidate/canonical.json'))
const replacements=new Set(bio.resolutionSupersessions.map((x:any)=>x.supersededIndexPath+'|'+x.goalId)),withdrawals=new Set(bio.resolutionWithdrawals.map((x:any)=>x.indexPath+'|'+x.goalId)),newIndex=bio.resolutionIndexPaths.at(-1)
const checked:any[]=[],groups=new Map<string,any>()
const round=async(p:string)=>{const input=read(resolve(p,'description-review-input.json')),campaign=read(resolve(p,'description-review-campaign.json')),bundle=read(resolve(p,'review-bundle-manifest.json'));const results=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(p,'batches'),resultsDirectory:resolve(p,'results')});assert.deepEqual(results.errors,[]);return {input,campaign,bundle,resultPairs:results.resultPairs}}
for(const configured of bio.resolutionIndexPaths){const ip=resolve(root,configured),index=read(ip)
 for(const entry of index.resolutions){if(replacements.has(configured+'|'+entry.goalId)||withdrawals.has(configured+'|'+entry.goalId))continue
  const g=index.groups.find((g:any)=>g.groupId===entry.groupId),directory=resolve(dirname(ip),g.artifactDirectory);let artifacts=groups.get(directory)
  if(!artifacts){const db=readFileSync(resolve(directory,g.dualSummaryPath));assert.equal(sha(db),g.dualSummaryDigest);artifacts={dualSummary:JSON.parse(db.toString()),dualSummaryBytes:db,first:await round(resolve(directory,'round-a')),second:await round(resolve(directory,'round-b'))};groups.set(directory,artifacts)}
  const rp=resolve(dirname(ip),entry.resolutionPath),rb=readFileSync(rp);assert.equal(sha(rb),entry.resolutionDigest);const resolution=JSON.parse(rb.toString());let synthesisDecisionManifestArtifact:any
  if(resolution.synthesisDecisionManifest){const p=resolveResolutionBatchArtifactPath(rp,resolution.synthesisDecisionManifest.manifestPath),bytes=readFileSync(p);synthesisDecisionManifestArtifact={manifest:JSON.parse(bytes.toString()),manifestBytes:bytes,manifestPath:resolution.synthesisDecisionManifest.manifestPath}}
  const v=await validateGoalDescriptionDualRoundResolution({...artifacts,resolution,currentInput:artifacts.first.input,landscape,synthesisDecisionManifestArtifact,humanAttestationBytes:entry.humanAttestationPath?readFileSync(resolve(dirname(ip),entry.humanAttestationPath)):undefined});assert.deepEqual(v.errors,[],entry.goalId+': '+v.errors.join(' | '));assert.equal(v.strictDescriptionComplete,true);checked.push({goalId:entry.goalId,indexPath:configured,currentCanonicalNativeD:'PASS',oldResolutionAndScienceUntouched:true})
 }
}
const ids=new Set(checked.map(x=>x.goalId));assert.equal(ids.size,102);assert.equal(checked.length,102);const protectedIds=read(resolve(own,'checks/protected-current100.actual.json')).protectedStrictGoalIds;for(const id of protectedIds)assert(ids.has(id))
const pchecks:any[]=[],pids=new Set<string>()
for(const n of readdirSync(resolve(own,'positive/inert-all-current-configs')).sort()){const path=resolve(own,'positive/inert-all-current-configs',n);const r=reviewPositiveGoalEvidenceConfig(relative(root,path));assert.deepEqual(r.errors,[],n+': '+r.errors.join(' | '));for(const rec of r.records){assert(!pids.has(rec.goalId));pids.add(rec.goalId);assert.equal(rec.status,'needs_human_review');assert.equal(rec.reviewAuthority,'ai_candidate')};pchecks.push({configPath:relative(root,path),currentNativeP:'PASS',recordCount:r.records.length})}
assert.equal(pids.size,100);assert.deepEqual([...pids].sort(),[...protectedIds].sort())
const result={documentType:'Actual lower native checks: retained98 plus current paired4 D contexts, all protected100 P contexts, candidate whole473',futureWholeCanonical473:true,newCurricular391:true,currentDCount:102,currentPCount:100,retainedD:checked,retainedP:pchecks,oldScientificRecordsResolutionsAndProfilesUnchanged:true,onlyAffectedE70AndFfefDReplacedBySealedPair:true,additional053And9f73DOnlyNoPOrV:true,allProtected100Present:true,activeWrites:false,newScientificJudgments:false,humanApproval:false}
writeFileSync(resolve(own,'checks/all-current-lower-native-D102-P100.actual.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({currentD102:'PASS',protectedP100:'PASS',unaffectedScienceRepeated:false,newScientificJudgments:false,activeWrites:false}))
