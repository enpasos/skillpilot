// SPDX-License-Identifier: Apache-2.0
// Existing native campaign/result/dual/synthesis APIs, actual four-goal sealed pair; no new science run.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,statSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import {stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {loadGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import {validateGoalDescriptionReviewDualRound} from '../../../../../../../app/scripts/validateGoalDescriptionReviewDualRound.ts'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {extractGoalDescriptionDualRoundResolutionSource,buildGoalDescriptionDualRoundResolution,validateGoalDescriptionDualRoundResolution,fingerprintGoalDescriptionReviewContext,fingerprintGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import {buildGoalDescriptionRolloutSynthesisRoundBinding,fingerprintGoalDescriptionRolloutSynthesisDecisionManifest,validateGoalDescriptionRolloutSynthesisDecisionManifest} from '../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts'
import {buildGoalDescriptionRolloutResolutionSynthesis} from '../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis.ts'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),base=dirname(own)
const author=resolve(base,'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'),native=resolve(author,'native-raster-candidate-v2/four')
const declared=new Map<string,any>(),sha=(v:Buffer|string)=>'sha256:'+createHash('sha256').update(v).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p);return {path:relative(root,p),sha256:sha(b),bytes:b.length}}
const bytes=(p:string)=>{declared.set(p,bind(p));return readFileSync(p)}
const read=(p:string)=>JSON.parse(bytes(p).toString('utf8'))
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});const b=Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(v,null,2)+'\n';if(existsSync(p)){assert.equal(sha(readFileSync(p)),sha(b));return}writeFileSync(p,b,{flag:'wx'})}
const copy=(a:string,b:string)=>write(b,bytes(a))
const ready=read(resolve(own,'checks/genuine-current-four-pair-ready.technical.json'))
const reviewers={a:resolve(root,ready.actualReviewerResults.a),b:resolve(root,ready.actualReviewerResults.b)}
for(const s of Object.values(ready.seals)as any[])assert.equal(bind(resolve(root,s.seal.path)).sha256,'sha256:'+s.seal.sha256)
const sourceCanon=resolve(own,'candidate/canonical.current476-reviewed.future-active.json'),landscape=read(sourceCanon),modelFull=read(resolve(author,'native-raster-candidate-v2/full392.actual-raster.pure.book-model.json'))
const out=resolve(own,'native-d-four'),configPath=resolve(own,'native-d-four.batch.config.json'),batchId='biologie-he9-split-four-genuine-paired-current202-technical-20261008-v1'
const sourceBundle=resolve(native,'bundle')
for(const n of readdirSync(sourceBundle,{recursive:true})as string[]){const p=resolve(sourceBundle,n);if(statSync(p).isFile())copy(p,resolve(out,'bundle',n))}
copy(resolve(out,'bundle/review-bundle-manifest.json'),resolve(out,'bundle/manifest.json'))
const bundle=read(resolve(out,'bundle/manifest.json')),model=read(resolve(out,'bundle/book-model.json'))
await verifyGoalBookReviewBundleArtifactBytes(bundle,resolve(out,'bundle'))
const campaigns:any[]=[]
for(const name of ['a','b']as const){
 const src=resolve(native,'round-'+name),target=resolve(out,'round-'+name),campaign=read(resolve(src,'description-review-campaign.json'))
 assert.equal(campaign.goalCount,4);assert.equal(campaign.batchSize,4);assert.equal(campaign.blindToOtherReviews,true);assert.equal(campaign.reviewPass,'first_pass')
 for(const file of ['description-review-input.json','description-review-campaign.json','review-bundle-manifest.json','prompt.md','criteria.md','contracts/goal-description-review-record.schema.json'])copy(resolve(src,file),resolve(target,file))
 const bid=campaign.batches[0].batchId
 copy(resolve(src,'batches',bid+'.input.jsonl'),resolve(target,'batches',bid+'.input.jsonl'))
 for(const suffix of ['records.jsonl','run.json'])copy(resolve(reviewers[name],bid+'.'+suffix),resolve(target,'results',bid+'.'+suffix))
 const run=read(resolve(target,'results',bid+'.run.json'));assert.equal(run.blindToOtherRuns,true);assert.equal(run.independenceGroupId,campaign.independenceGroupId)
 campaigns.push(campaign)
}
assert.notEqual(campaigns[0].independenceGroupId,campaigns[1].independenceGroupId)
const rounds=await Promise.all(['a','b'].map(async name=>{
 const p=resolve(out,'round-'+name),input=read(resolve(p,'description-review-input.json')),campaign=read(resolve(p,'description-review-campaign.json')),roundBundle=read(resolve(p,'review-bundle-manifest.json'))
 assert.equal(stableGoalBookJson(roundBundle),stableGoalBookJson(bundle))
 const validation=await validateGoalDescriptionReviewCampaign({bundle:roundBundle,input,campaign});assert.deepEqual(validation.errors,[])
 const result=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(p,'batches'),resultsDirectory:resolve(p,'results')});assert.deepEqual(result.errors,[])
 return {bundle:roundBundle,input,campaign,resultPairs:result.resultPairs}
}))
assert.equal(stableGoalBookJson(rounds[0].input),stableGoalBookJson(rounds[1].input))
const dual=await validateGoalDescriptionReviewDualRound({first:rounds[0],second:rounds[1]});assert.deepEqual(dual.errors,[]);assert.equal(dual.summary.goalCount,4)
const dualBytes=Buffer.from(JSON.stringify(dual.summary,null,2)+'\n');write(resolve(out,'dual-summary.json'),dualBytes)
const input=rounds[0].input,ids=input.goals.map((g:any)=>g.goalId)
assert.deepEqual([...ids].sort(),[...ready.selectedGoalIds].sort());assert.equal(ids.length,4)
const cfg={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId,subject:'biologie',subjectLabel:'Biologie',bookId:model.book.id,title:model.book.title,outputDirectory:relative(root,out),baseGoalBookConfigPath:relative(root,resolve(author,'native-raster-candidate-v2/full392.actual-raster.inactive.config.json')),goalIds:ids,feedbackBaseUrl:'https://skillpilot.com/feedback',promptPath:relative(root,resolve(native,'round-a/prompt.md')),criteriaPath:relative(root,resolve(native,'round-a/criteria.md')),publicRoot:relative(root,author)}
write(configPath,cfg)
const roundBinding=(directory:string,c:any)=>({directory,campaignId:c.campaignId,campaignDigest:fingerprintGoalDescriptionReviewCampaign(c),roundId:c.roundId,independenceGroupId:c.independenceGroupId,batchId:c.batches[0].batchId,batchInputFingerprint:c.batches[0].batchInputFingerprint})
const manifest={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-manifest.schema.json',schemaVersion:1,validationContract:'goal-description-rollout-batch-v1',batchId,subject:'biologie',subjectLabel:'Biologie',configPath:relative(root,configPath),configDigest:sha(readFileSync(configPath)),goalIds:ids,curriculumAtomicDenominatorAtPreparation:392,source:{baseGoalBookConfigPath:cfg.baseGoalBookConfigPath,landscapePath:model.source.landscapePath,landscapeId:model.book.landscapeId,baseBookDigest:modelFull.digest},artifacts:{bundleDirectory:'bundle',bookModelPath:'bundle/book-model.json',bookModelDigest:model.digest,bundleManifestPath:'bundle/manifest.json',bundleFingerprint:bundle.bundleFingerprint,reviewInputFingerprint:input.reviewInputFingerprint,rounds:{first:roundBinding('round-a',campaigns[0]),second:roundBinding('round-b',campaigns[1])}},reviewPolicy:{oneBatchPerRound:true,blindIndependentFirstPass:true,aiRecordsAreCandidatesOnly:true,automaticAcceptance:false}}
write(resolve(out,'batch-manifest.json'),manifest)
const synthesizedAt=existsSync(resolve(out,'synthesis-decisions.json'))?read(resolve(out,'synthesis-decisions.json')).synthesizedAt:new Date().toISOString()
const batchBinding={batchId,batchManifestDigest:sha(readFileSync(resolve(out,'batch-manifest.json'))),configDigest:manifest.configDigest,bundleFingerprint:bundle.bundleFingerprint,bookDigest:input.bookDigest,reviewInputFingerprint:input.reviewInputFingerprint,dualSummaryDigest:sha(dualBytes),canonicalLandscapeDigest:sha(bytes(sourceCanon))}
const sources=input.goals.map((g:any)=>{
 const a=extractGoalDescriptionDualRoundResolutionSource({artifacts:rounds[0],goalId:g.goalId,label:'actual sealed final Native4 A'}),b=extractGoalDescriptionDualRoundResolutionSource({artifacts:rounds[1],goalId:g.goalId,label:'actual sealed final Native4 B'})
 assert.deepEqual(a.errors,[]);assert.deepEqual(b.errors,[]);assert.equal(a.source!.decision,'keep');assert.equal(b.source!.decision,'keep')
 return {goal:g,first:a.source!,second:b.source!}
})
const synthesisRounds={first:buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].first.binding,campaigns[0].batches[0].batchInputFingerprint),second:buildGoalDescriptionRolloutSynthesisRoundBinding(sources[0].second.binding,campaigns[1].batches[0].batchInputFingerprint)}
const decisions=sources.map(({goal:g,first,second}:any)=>({decisionId:batchId+'-decision-'+g.goalId,goalId:g.goalId,effectiveSemanticKind:'curricularAtomic',goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g),finalText:{titleDe:g.currentTitleDe,titleEn:g.currentTitleEn,descriptionDe:g.currentDescriptionDe,descriptionEn:g.currentDescriptionEn},resolutionDecision:'keep_current',evidenceRound:'first',records:{first:{recordId:first.binding.recordId,recordDigest:first.binding.recordDigest},second:{recordId:second.binding.recordId,recordDigest:second.binding.recordDigest}},rationaleDe:'Technische Synthese der tatsächlich unabhängig erstversiegelfour ganzen aktuellen Native4-A/B-KEEP-Urteile; gültige vorherige ganze wissenschaftliche/source/profile-Prüfungen erhalfour und tatsächliche neue PNGs/Breifour/Seifour unabhängig angesehen. Keine neuen Wissenschaftsläufe, tatsächliche Experimentleistung oder Menschenfreigabe. A: '+first.record.rationale+' B: '+second.record.rationale,rationaleEn:'Factual synthesis of the genuine independently first-sealed current Native4 KEEP pair. Prior whole science/source/profile findings retained; actual new rasters, widths and native pages independently inspected. No new scientific run, real experiment attainment or human approval. A: '+first.record.understandingEvidence.essentialUnderstandingEn+' B: '+second.record.understandingEvidence.essentialUnderstandingEn}))
const payload={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json',schemaVersion:1,synthesisContract:'goal-description-rollout-synthesis-decision-v1',manifestId:batchId+'-synthesis',authority:'ai_synthesis',synthesizedBy:'Root-delegated technical integrator of actual independent A/B judgments, not new reviewer',synthesizedAt,batch:batchBinding,rounds:synthesisRounds,decisions}
const synthesis={...payload,manifestFingerprint:fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload as any)}
const expected=sources.map(({goal:g,first,second}:any)=>({goalId:g.goalId,effectiveSemanticKind:'curricularAtomic',goalFingerprint:g.goalFingerprint,pageFingerprint:g.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g),finalText:{titleDe:g.currentTitleDe,titleEn:g.currentTitleEn,descriptionDe:g.currentDescriptionDe,descriptionEn:g.currentDescriptionEn},firstSource:first,secondSource:second}))
const sv=await validateGoalDescriptionRolloutSynthesisDecisionManifest({manifest:synthesis as any,expected:{batch:batchBinding as any,rounds:synthesisRounds,synthesizedAt,goals:expected as any}});assert.deepEqual(sv.errors,[])
const synthesisPath=resolve(out,'synthesis-decisions.json');write(synthesisPath,synthesis)
const resolutions=[]
for(let i=0;i<sources.length;i++){
 const {goal:g,first,second}=sources[i],decision=decisions[i]
 const fact=buildGoalDescriptionRolloutResolutionSynthesis({batchId,manifest:synthesis as any,decision:decision as any,summaryGoal:dual.summary.goals.find((r:any)=>r.goalId===g.goalId)!,firstSource:first,secondSource:second})
 const resolution=buildGoalDescriptionDualRoundResolution({resolutionId:batchId+'-resolution-'+g.goalId,goalId:g.goalId,effectiveSemanticKind:'curricularAtomic',decision:'keep_current',synthesis:fact,dualSummaryBytes:dualBytes,currentInput:input,firstSource:first,secondSource:second,synthesisDecisionManifest:{contract:'goal-description-rollout-synthesis-decision-v1',manifestId:synthesis.manifestId,manifestPath:'synthesis-decisions.json',manifestDigest:sha(readFileSync(synthesisPath)),manifestFingerprint:synthesis.manifestFingerprint,decisionId:decision.decisionId}})
 const validation=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:dualBytes,currentInput:input,landscape,first:rounds[0],second:rounds[1],synthesisDecisionManifestArtifact:{manifest:synthesis as any,manifestBytes:readFileSync(synthesisPath),manifestPath:'synthesis-decisions.json'}})
 assert.deepEqual(validation.errors,[]);assert.equal(validation.strictDescriptionComplete,true)
 const resolutionPath=resolve(out,'resolutions',g.goalId+'.resolution.json');write(resolutionPath,resolution)
 resolutions.push({goalId:g.goalId,titleDe:g.currentTitleDe,groupId:batchId,decision:'keep_current',resolutionPath:'resolutions/'+g.goalId+'.resolution.json',resolutionDigest:sha(readFileSync(resolutionPath)),resolutionFingerprint:resolution.resolutionFingerprint,strictDescriptionComplete:true})
}
const index={$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json',schemaVersion:2,indexContract:'goal-description-standalone-batch-resolution-index-v1',artifactSetId:batchId+'-strict-resolutions',subject:'Biologie',semanticKind:'curricularAtomic',batchGoalIds:ids,groups:[{groupId:batchId,artifactDirectory:'.',dualSummaryPath:'dual-summary.json',dualSummaryDigest:sha(dualBytes),campaignGoalCount:4,resolvedGoalCount:4}],resolutions}
const ajv=new Ajv2020({allErrors:true,strict:true}),check=ajv.compile(read(resolve(root,'contracts/goal-description-review/v1/goal-description-standalone-batch-resolution-index.schema.json')));assert.ok(check(index),JSON.stringify(check.errors))
write(resolve(out,'resolution-index.json'),index)
write(resolve(own,'checks/native-four-pair-D-synthesis-resolution.actual.technical.json'),{actualIndependentPairSeals:ready.seals,existingCampaignResultDualSynthesisResolutionChecks:'PASS',goalCount:4,wholeInputAndBothOwnResultRecordAndRunBytesUnchanged:true,nativeLowerDescriptionComplete:true,index:bind(resolve(out,'resolution-index.json')),newScienceReviewRuns:0,actualExperiments:0,activeWrites:0,strictGainClaimed:0,humanApproval:false})
write(resolve(own,'checks/native-four-pair-D-declared-inputs.technical.json'),{files:[...declared.values()]})
console.log(JSON.stringify({nativeActualPair:4,nativeLowerD:'PASS',unresolved:0,actualReviewerRunsUnchanged:true,activeWrites:0,strictGain:0}))
