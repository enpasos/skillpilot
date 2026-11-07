import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {createVisualizationContextVerifier,hasVerifiedVisualizationContext} from '/home/enpasos/projects/skillpilot/app/scripts/goalVisualizationReviewedContext.ts'
const root='/home/enpasos/projects/skillpilot', work=process.env.INDEPENDENT_WORK!
const durable='/mnt/e/skillpilot-qa-artifacts/2026-11-07/math58-reader-capsule-integration-20261107'
const inputs=JSON.parse(readFileSync(durable+'/native-inputs.json','utf8'))
const old=JSON.parse(readFileSync(durable+'/old74-native-inputs.json','utf8'))
const pins=JSON.parse(readFileSync(root+'/contracts/goal-visualization-context/v1/math58-current-supplement-pins-2026-11-07.candidate.json','utf8'))
const verify=createVisualizationContextVerifier({repositoryRoot:root,acceptedRepositoryCommit:'25a6f2164a81a7e6ae50db3557d20521fecf5124'})
const output:any={mode:process.env.BOX_FRAME,cases:[]}
const assert=(value:unknown,message:string)=>{if(!value)throw Error(message)}
const sample=(profile:string)=>inputs.find((r:any)=>pins.goalBindings.find((b:any)=>b.goalId===r.goalId).profile===profile&&!r.boxplotV2)
const current62=sample('math-current62-with-current-viewports-v1'), ten=sample('math-independent-ten-with-current-viewports-v1'), box=inputs.find((r:any)=>r.boxplotV2)
function run(name:string,reference:any,current:any,expected:boolean){const r=verify(reference,current);assert(r.ok===expected,name+': '+JSON.stringify(r));output.cases.push({name,ok:r.ok,...(r.ok?{usable:hasVerifiedVisualizationContext(r.capability,current),supplementSha256:r.capability.currentSupplementSha256}:{status:r.status,issues:r.issues})});return r}
function receiptVariant(name:string,change:(r:any)=>void,base=current62,duplicate=false){
  const receipt=JSON.parse(readFileSync(root+'/'+base.receipt.path,'utf8'));change(receipt)
  let raw=JSON.stringify(receipt);if(duplicate)raw=raw.replace('{','{"reviewProfile":"'+receipt.reviewProfile+'",')
  const file='receipt-'+name+'.json';writeFileSync(work+'/'+file,raw)
  return {path:'qa-artifacts/ci-contract-audit/2026-11-07/math58-reader-capsule-independent-review/private-inputs/'+file,sha256:createHash('sha256').update(raw).digest('hex')}
}
const positive=run('current62 original plus current supplement',current62.receipt,current62.current,true)
run('independent-ten original plus current supplement',ten.receipt,ten.current,true)
run('boxplot exact current bytes',box.receipt,box.current,process.env.BOX_FRAME==='v2')
for(const [name,change]of [
 ['missing-supplement',(r:any)=>delete r.currentSupplement],
 ['foreign-owner',(r:any)=>r.context.landscapeId='605bdaf6-32d5-56fd-8d92-5a80c2fd2901'],
 ['foreign-subject',(r:any)=>r.context.subject='wirtschaftswissenschaften'],
 ['wrong-math-format',(r:any)=>r.reviewProfile='math-independent-ten-with-current-viewports-v1'],
 ['original-time-relabelled-current',(r:any)=>r.reviewedAt='2026-11-07T08:29:11Z'],
 ['wrong-supplement-reference',(r:any)=>r.currentSupplement={path:pins.goalBindings.find((b:any)=>b.goalId===box.goalId).currentReview.path,sha256:pins.goalBindings.find((b:any)=>b.goalId===box.goalId).currentReview.sha256}],
]as const)run(name,receiptVariant(name,change),current62.current,false)
run('duplicate-reviewProfile-property',receiptVariant('duplicate',()=>{},current62,true),current62.current,false)
run('wrong-current-goal-id',current62.receipt,{...current62.current,goalId:ten.goalId},false)
run('wrong-current-EN-title',current62.receipt,{...current62.current,titleEn:current62.current.titleEn+' changed'},false)
run('wrong-current-demand',current62.receipt,{...current62.current,demandLevel:'AB9'},false)
run('wrong-new-PNG-hash',box.receipt,{...box.current,assetSha256:'sha256:'+'0'.repeat(64)},false)
assert(positive.ok,'positive capability missing')
if(positive.ok){
 const cap=positive.capability
 const flags={actual:hasVerifiedVisualizationContext(cap,current62.current),spread:hasVerifiedVisualizationContext({...cap},current62.current),clone:hasVerifiedVisualizationContext(structuredClone(cap),current62.current),prototype:hasVerifiedVisualizationContext(Object.create(cap),current62.current),foreignGoal:hasVerifiedVisualizationContext(cap,ten.current),frozen:Object.isFrozen(cap)&&Object.isFrozen(cap.context)}
 assert(flags.actual&&flags.frozen&&!flags.spread&&!flags.clone&&!flags.prototype&&!flags.foreignGoal,'capability origin failure')
 output.capabilityOrigins=flags
}
for(const subject of ['mathematik','wirtschaftswissenschaften']){
 const input=old.find((r:any)=>r.current.subject===subject);run('old74 unchanged '+subject,input.receipt,input.current,true)
 const supplement=JSON.parse(readFileSync(root+'/'+current62.receipt.path,'utf8')).currentSupplement
 run('old74 refuses new supplement '+subject,receiptVariant('old-'+subject,(r:any)=>r.currentSupplement=supplement,input),input.current,false)
}
writeFileSync(work+'/reader-check-'+process.env.BOX_FRAME+'.json',JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({mode:output.mode,cases:output.cases.length,capabilityOrigins:output.capabilityOrigins},null,2))
