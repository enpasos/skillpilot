// Read-only preparation of four explicitly authorized task-field corrections.
import fs from 'node:fs'
import crypto from 'node:crypto'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../../../app/scripts/goalBookModel.ts'
import {Patches,base,canonicalPath} from './prepare-core.mjs'

const p=new Patches(),oldBase=base.replace('physics100-final-astro-consolidation-v1','physics100-astro-completion-v1')
const landscape=JSON.parse(fs.readFileSync(canonicalPath,'utf8')),byId=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const kpath='curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',k=JSON.parse(fs.readFileSync(kpath,'utf8'))
const dpath=oldBase+'/current-assessment-decisions.json',decisions=JSON.parse(fs.readFileSync(dpath,'utf8'))
const before:any[]=[],after:any[]=[]
const headers=[
  ['| Modell | Schale wenig nach außen versetzt | Schale wenig nach innen versetzt |','| --- | --- | --- |'],
  ['| Model | Shell displaced slightly outward | Shell displaced slightly inward |','| --- | --- | --- |'],
  ['| Zeit / Tage | 0 | 1,5 | 3 | 4,5 | 6 |','| --- | --- | --- | --- | --- | --- |'],
  ['| Time / days | 0 | 1.5 | 3 | 4.5 | 6 |','| --- | --- | --- | --- | --- | --- |'],
]
const format=(s:string)=>{for(const [h,d] of headers)if(s.includes(h+'\n')){if(s.includes(h+'\n'+d))throw Error('Already delimited');s=s.replace(h+'\n',h+'\n'+d+'\n')}return s}
const strip=(s:string)=>s.replace(/^\|(?:\s*:?-+:?\s*\|)+\s*\n/gm,'')
for(const id of ['71af215d-c6d5-59ce-a3f6-4a2e60f1216d','f61c424e-f091-5f9d-9d58-c1bd29733fc8','d44eb772-acb3-5449-accc-36a1fb7a25a5','e99d87ac-0024-5f2b-ab47-d4d1cebba027']){
  const old:any=byId.get(id),next=structuredClone(old);before.push(old)
  if(id.startsWith('d44')||id.startsWith('e99')){if(next.dimensionTags.phase!=='10')throw Error('Unexpected task phase');next.dimensionTags.phase='GLOBAL'}
  else {
    for(const field of ['taskContent','taskContentEn']){next.examData[field]=format(old.examData[field]);if(strip(next.examData[field])!==old.examData[field])throw Error('Non-format body change')}
    const artifact=old.examData.sourceArtifactPath,artifactBefore=fs.readFileSync(artifact,'utf8');let artifactAfter=format(artifactBefore)
    if(id.startsWith('f61c'))artifactAfter=artifactAfter.replace('Actual covered goal IDs: 5b8eaf71-96fe-50eb-b9ea-a8fa392df086, e28381b4-50ef-5cac-bfa4-b7c8e03aef82','Actual covered goal IDs: '+next.requires.join(', '))
    p.replace(artifact,artifactBefore,artifactAfter)
    const oldDecision=decisions.decisions.find((d:any)=>d.goalId===id),e=next.examData
    const body={requires:next.requires,taskContent:e.taskContent,taskContentEn:e.taskContentEn,solutionContent:e.solutionContent,solutionContentEn:e.solutionContentEn,scoring:e.scoring}
    const newDecision={...oldDecision,contentSha256:'sha256:'+crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex'),coveredGoalIds:next.requires,formattingRebind:{recordedAt:new Date().toISOString(),previousContentSha256:oldDecision.contentSha256,reason:'Root-authorized GFM delimiter insertion only; all data, demands, solutions and scoring unchanged. EX metadata also synchronizes the already approved canonical transit/RV split; no new coverage, D or human approval.'}}
    p.object(dpath,oldDecision,[newDecision])
  }
  p.object(canonicalPath,old,[next]);after.push(next)
  const oldK=k.decisions.find((d:any)=>d.goalId===id);if(oldK.semanticKind!=='practiceAssessment')throw Error('Unexpected K kind')
  p.object(kpath,oldK,[{...oldK,sourceFingerprint:fingerprintSemanticKindSourceGoal(next)}])
}
const terminalPath=oldBase+'/additional-terminal-tasks.mjs',terminal=fs.readFileSync(terminalPath,'utf8');p.replace(terminalPath,terminal,format(terminal))
const draftsPath=oldBase+'/assessment-drafts.mjs'
p.replace(draftsPath,"EX: ['5b8eaf71-96fe-50eb-b9ea-a8fa392df086','e28381b4-50ef-5cac-bfa4-b7c8e03aef82']","EX: ['49bb609a-bfb7-5391-9120-f5fc737efb9a','6dca3b0a-c872-543b-808f-97e855f5fafd','e28381b4-50ef-5cac-bfa4-b7c8e03aef82']")
p.replace(draftsPath,"['DE-SL','DE-SN'], '10',","['DE-SL','DE-SN'], 'GLOBAL',")
p.replace(draftsPath,"['DE-SL'], '10',","['DE-SL'], 'GLOBAL',")
p.add(base+'/data-ci-receipt.json',JSON.stringify({capturedAt:new Date().toISOString(),authority:'root-authorized-format-and-task-metadata-only',before,after,reason:'S/G assess stufenübergreifend reusable qualitative Solar-System/Galaxy material; GLOBAL is compatibility metadata, not a new curriculum placement. Their exact authored composition references, applicability, tags, requires and coverage stay unchanged. This avoids falsely ordering the assessment before the Q4-labelled reusable content atoms; those reviewed atoms are untouched. ST/EX gain only GFM separator rows. All existing task content review judgments remain semantically unchanged.',activeViewWrites:0,contentGoalWrites:0},null,2)+'\n')
console.log(JSON.stringify(p.patches))
