// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateGoalDescriptionReviewCampaign } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url)), read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const entryPath=resolve(own,'neutral-current19-native-independent-review.entry.json'),entry=read(entryPath)
const bundlePath=resolve(root,entry.actualNativeBundlePath),bundle=read(bundlePath),bundleDir=dirname(bundlePath)
const actualArtifacts=bundle.artifacts.map((a:any)=>{const p=resolve(bundleDir,a.path),b=bind(p);assert.equal(b.sha256,a.sha256??a.digest);if(a.bytes!==undefined)assert.equal(b.bytes,a.bytes);return b})
const model=read(resolve(bundleDir,bundle.artifacts.find((a:any)=>a.role==='book_model').path)),full=read(resolve(root,entry.actualFullCandidateModelPath))
assert.equal(model.pages.length,19);assert.equal(full.pages.length,395)
const phases=model.pages.map((p:any)=>({goalId:p.goalId,exactCurrentFullPage:full.pages.find((q:any)=>q.goalId===p.goalId)}))
assert.ok(phases.every((p:any)=>p.exactCurrentFullPage))
const results=[]
for(const c of entry.campaigns){const campaign=read(resolve(root,c.campaignPath)),input=read(resolve(root,c.inputPath));const result=await validateGoalDescriptionReviewCampaign({bundle,input,campaign});assert.deepEqual(result.errors,[]);assert.deepEqual(campaign.batches.flatMap((b:any)=>b.goalIds),entry.goalIds);assert.equal(campaign.blindToOtherReviews,true);results.push({side:c.side,campaign:bind(resolve(root,c.campaignPath)),input:bind(resolve(root,c.inputPath)),errors:result.errors,actualIndependentResults:0})}
const rows=readFileSync(resolve(root,entry.positiveRecordPath),'utf8').trim().split('\n').map(l=>JSON.parse(l));assert.equal(rows.length,19)
const casesEntry=read(resolve(root,entry.wholeProfileAndWorkedCaseBindingPath)),cases=read(resolve(root,casesEntry.wholeCasesAndWorkedTransfersPath))
assert.equal(cases.entries.length,19);assert.equal(cases.entries.reduce((n:number,e:any)=>n+e.originalWholeBilingualCases.length,0),38)
assert.ok(rows.every((r:any)=>r.status==='needs_human_review'&&r.reviewAuthority==='ai_candidate'&&r.evidenceLevel==='E1'&&r.maximumClaimScope==='G1'&&r.reviewRunIds.length===0))
for(const r of rows){const original=cases.entries.find((e:any)=>e.goalId===r.goalId);assert.equal(stableGoalBookJson(r.profile),stableGoalBookJson(original.newNormalProfileExactAuthoredBody))}
const out=resolve(own,'checks/ordinary-native19-campaign-bindings-and-whole-materials.actual.json');assert.ok(!existsSync(out));writeFileSync(out,JSON.stringify({schemaVersion:1,role:'Actual unchanged normal description campaign APIs and original artifact digests; no scientific/native reviewer verdict',actualEntry:bind(entryPath),actualArtifactBindings:actualArtifacts,actualCampaignChecks:results,positiveRecords:19,wholeOriginalCases:38,authoredFreshWorkedTransfers:38,independentNativeResults:0,sourceCourseScopeClosure:false,humanApproval:false,activeWrites:[],strictGain:0,actualExitCode:0},null,2)+'\n')
console.log(JSON.stringify({normalCampaigns:2,artifactBindings:actualArtifacts.length,errors:[],wholeOriginalCases:38,actualP19Truthful:true,independentResults:0,strictGain:0}))
