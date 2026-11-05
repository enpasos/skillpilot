import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import {
  compatibleHistoricalReviewGoal, contextCompatibilityPath, createGoalReviewContextCompatibilityReader,
  type ContextCompatibilityRequest,
} from './goalReviewContextCompatibility'
import { atomicRelation, fullClosure } from './learningUnitsMathAuthoring'
import type { NativeProjectionEvidence } from './nativeProjectionEvidence'
import { reviewPositiveGoalEvidenceConfig, type PositiveGoalEvidenceReviewConfig } from './positiveGoalEvidenceReview'
import { fingerprintPositiveGoalEvidenceProfile, type PositiveGoalEvidenceReviewRecord } from './positiveGoalEvidenceProfileModel'
import { loadGoalDescriptionReviewCampaignResultDirectories } from './validateGoalDescriptionReviewCampaignResults'
import type { GoalDescriptionReviewRoundArtifacts } from './validateGoalDescriptionReviewDualRound'
import {
  extractGoalDescriptionDualRoundResolutionSource, validateGoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolution,
  type GoalDescriptionDualRoundResolutionBindingArtifacts,
} from './validateGoalDescriptionDualRoundResolution'

interface TestRow {
  goalId: string
  oldDirectRequires: string[]
  positive: { configPath: string; reviewPath: string; resourceDigests: Record<string, string> }
  description: { indexPath: string; resolutionPath: string }
  pins: Record<string, string>
}
interface TestReceipt { canonicalPath: string; nativeProjectionPath: string; goals: TestRow[] }
const repo=resolve(import.meta.dirname,'../..')
const read=(path:string)=>readFileSync(resolve(repo,path))
const json=<T>(path:string):T=>JSON.parse(read(path).toString()) as T
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
const structuralGoals=(goals:LearningGoal[])=>goals.map(({id,requires,contains})=>({id,requires,contains}))
const bytes=read(contextCompatibilityPath),receipt=JSON.parse(bytes.toString()) as TestReceipt
const landscape=json<SkillLandscape>(receipt.canonicalPath),row=receipt.goals[0]
const goal=landscape.goals.find(g=>g.id===row.goalId)!
const config=json<PositiveGoalEvidenceReviewConfig>(row.positive.configPath)
const record=read(row.positive.reviewPath).toString().trim().split(/\r?\n/).map(s=>JSON.parse(s) as PositiveGoalEvidenceReviewRecord).find(r=>r.goalId===row.goalId)!
const positive:ContextCompatibilityRequest={kind:'positive',record,configPath:row.positive.configPath,resourceDigests:row.positive.resourceDigests}
const tested:string[]=[]
assert.ok(compatibleHistoricalReviewGoal(goal,positive),'Exact registered P context must be compatible')
assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate')
tested.push('exact registered positive; original AI/human-review status preserved')
const reject=(name:string,changed:object,request:ContextCompatibilityRequest=positive)=>{
  assert.equal(compatibleHistoricalReviewGoal(changed,request),undefined,name);tested.push(name)
}
reject('changed bilingual meaning',{...goal,description:goal.description+' changed'})
const profile=structuredClone(record);profile.profile.expectations[0].essentialUnderstandingDe+=' changed'
profile.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(profile.profile)
reject('changed profile even with recomputed profile fingerprint',goal,{...positive,record:profile})
reject('foreign positive config',goal,{...positive,configPath:'unregistered.config.json'})
reject('unregistered goal',{...goal,id:'unregistered-goal'})
const removed=row.oldDirectRequires.find(id=>!goal.requires?.includes(id))!
assert.ok(removed)
reject('different direct R despite same full reach',{...goal,requires:[...(goal.requires??[]),removed]})
const forged=structuredClone(record);forged.status='approved';forged.reviewAuthority='human'
reject('new human approval cannot be borrowed',goal,{...positive,record:forged})
const rejectBytes=(name:string,path:string,change:(b:Buffer)=>Buffer)=>{
 const reader=createGoalReviewContextCompatibilityReader({repo,path:contextCompatibilityPath,digest:sha(bytes),read:p=>p===path?change(read(p)):read(p)})
 assert.equal(reader(goal,positive),undefined,name);tested.push(name)
}
const append=(b:Buffer)=>Buffer.concat([b,Buffer.from('\n')])
rejectBytes('changed criteria bytes',config.reviewCriteriaPath,append)
rejectBytes('changed original positive-review bytes',row.positive.reviewPath,append)
const imagePath=Object.keys(row.pins).find(p=>p.startsWith('app/public/assets/'))!
assert.ok(imagePath)
rejectBytes('changed image bytes',imagePath,b=>{const c=Buffer.from(b);c[0]^=1;return c})
const roundPath=Object.keys(row.pins).find(p=>p.includes('/round-b/')&&p.endsWith('description-review-campaign.json'))!
assert.ok(roundPath)
rejectBytes('changed original D second round',roundPath,append)
const native=json<NativeProjectionEvidence>(receipt.nativeProjectionPath)
const sourcePath=Object.keys(native.inputs).find(p=>p.includes('/mapping/'))!
assert.ok(sourcePath)
rejectBytes('changed source input under native manifest',sourcePath,append)
rejectBytes('changed current native scope',receipt.nativeProjectionPath,b=>{
 const altered=JSON.parse(b.toString()) as NativeProjectionEvidence
 altered.scopes[0].scope.jurisdiction='DE-XX'
 return Buffer.from(JSON.stringify(altered))
})
rejectBytes('changed full R/current canonical',receipt.canonicalPath,b=>{
 const altered=JSON.parse(b.toString()) as SkillLandscape
 altered.goals.find(g=>g.id===goal.id)!.requires=[]
 assert.notDeepEqual(fullClosure(atomicRelation(structuralGoals(altered.goals))),fullClosure(atomicRelation(structuralGoals(landscape.goals))))
 return Buffer.from(JSON.stringify(altered))
})
const resolution=json<GoalDescriptionDualRoundResolution>(row.description.resolutionPath)
const index=json<{groups:Array<{groupId:string;artifactDirectory?:string;dualSummaryPath:string}>;resolutions:Array<{goalId:string;groupId:string}>}>(row.description.indexPath)
const entry=index.resolutions.find(r=>r.goalId===goal.id)!,group=index.groups.find(g=>g.groupId===entry.groupId)!
const groupRoot=resolve(repo,dirname(row.description.indexPath),group.artifactDirectory??group.groupId)
const round=async(name:string):Promise<GoalDescriptionReviewRoundArtifacts>=>{
 const root=relative(repo,resolve(groupRoot,name));const input=json<GoalDescriptionReviewRoundArtifacts['input']>(root+'/description-review-input.json')
 const campaign=json<GoalDescriptionReviewRoundArtifacts['campaign']>(root+'/description-review-campaign.json')
 const bundle=json<GoalDescriptionReviewRoundArtifacts['bundle']>(root+'/review-bundle-manifest.json')
 const result=await loadGoalDescriptionReviewCampaignResultDirectories({campaign,batchesDirectory:resolve(repo,root,'batches'),resultsDirectory:resolve(repo,root,'results')})
 assert.deepEqual(result.errors,[]);return {input,campaign,bundle,resultPairs:result.resultPairs}
}
const first=await round('round-a'),second=await round('round-b')
const firstSource=extractGoalDescriptionDualRoundResolutionSource({artifacts:first,goalId:goal.id,label:'First'}).source!
const secondSource=extractGoalDescriptionDualRoundResolutionSource({artifacts:second,goalId:goal.id,label:'Second'}).source!
const description:ContextCompatibilityRequest={kind:'description',resolution,currentInput:first.input,firstSource,secondSource}
assert.ok(compatibleHistoricalReviewGoal(goal,description),'Exact D context must be compatible');tested.push('exact actual D first/second/resolution binding')
for(const missing of [false,true]){
 const altered=JSON.parse(bytes.toString()) as {goals:Array<{goalId:string;description?:{contextCompatible:boolean}}>}
 const bound=altered.goals.find(r=>r.goalId===goal.id)!
 if(missing)delete bound.description
 else bound.description!.contextCompatible=false
 const changedBytes=Buffer.from(JSON.stringify(altered))
 const reader=createGoalReviewContextCompatibilityReader({repo,path:contextCompatibilityPath,digest:sha(changedBytes),read:path=>path===contextCompatibilityPath?changedBytes:read(path)})
 assert.equal(reader(goal,description),undefined)
 tested.push(missing?'missing D registration cannot heal original D':'explicit original-image context hold cannot grant D')
}
reject('missing D second source',goal,{...description,secondSource:undefined})
const changedSource=structuredClone(secondSource);changedSource.binding.runId+='-changed'
reject('different D round binding',goal,{...description,secondSource:changedSource})
const changedInput=structuredClone(first.input);changedInput.goals[0].currentDescriptionDe+=' changed'
reject('different D input',goal,{...description,currentInput:changedInput})
const changedResolution=structuredClone(resolution);changedResolution.goal.finalText.descriptionDe+=' changed'
reject('different original D resolution',goal,{...description,resolution:changedResolution})
const summaryPath=relative(repo,resolve(dirname(resolve(repo,row.description.indexPath)),group.dualSummaryPath))
const dualSummaryBytes=read(summaryPath)
let synthesisDecisionManifestArtifact: GoalDescriptionDualRoundResolutionBindingArtifacts['synthesisDecisionManifestArtifact']
if(resolution.synthesisDecisionManifest){
 const path=relative(repo,resolve(dirname(dirname(resolve(repo,row.description.resolutionPath))),resolution.synthesisDecisionManifest.manifestPath))
 const manifestBytes=read(path)
 synthesisDecisionManifestArtifact={manifest:JSON.parse(manifestBytes.toString()),manifestBytes,manifestPath:resolution.synthesisDecisionManifest.manifestPath}
}
const fullD=await validateGoalDescriptionDualRoundResolution({resolution,currentInput:first.input,landscape,first,second,dualSummaryBytes,dualSummary:JSON.parse(dualSummaryBytes.toString()),synthesisDecisionManifestArtifact})
assert.deepEqual(fullD.errors,[]);assert.equal(fullD.strictDescriptionComplete,true);tested.push('actual current D validator with both complete original rounds')
const fullP=reviewPositiveGoalEvidenceConfig(row.positive.configPath)
assert.deepEqual(fullP.errors,[]);tested.push('actual complete P config retains unchanged co-members')
console.log(JSON.stringify({checks:tested.length,results:tested,fullD:fullD.strictDescriptionComplete,fullPGoals:fullP.records.length,originalStatus:record.status}))
