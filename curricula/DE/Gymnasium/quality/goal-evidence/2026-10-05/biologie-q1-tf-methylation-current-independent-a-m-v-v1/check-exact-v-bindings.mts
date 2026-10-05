import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const {isAiApprovedForCurrentAsset}=await import(pathToFileURL(resolve(process.cwd(),'app/src/utils/goalVisualizationQaStatus.ts')).href)
const root=process.cwd(),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-prospective-current-candidate-v1',own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-independent-a-m-v-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const ledger=read(own+'/visualization.native-candidate.qa.json'),bound=read(own+'/visualization.exact-goal-asset-bindings.candidate.json'),snapshot=read(base+'/current-v-exact-goal-bindings.snapshot.json'),rows=[]
for(const record of ledger.records){
 const b=bound.bindings.find((x:any)=>x.goal.id===record.goalId),goal=snapshot.goals.find((x:any)=>x.id===record.goalId)
 const equalGoal=JSON.stringify(b.goal)===JSON.stringify(goal)
 const equalHashes=b.assets.every((x:any)=>sha(x.preparedPath)===record.assetSha256)
 const sourcePublicBackend=equalHashes&&b.assets.length===3
 const nativeAiApproved=isAiApprovedForCurrentAsset(record)
 const humanNo=record.humanApproved==='no'&&record.humanReviewedAt===null
 if(!equalGoal||!sourcePublicBackend||!nativeAiApproved||!humanNo)throw Error('exactVbindingfailed '+record.goalId)
 rows.push({goalId:record.goalId,sourcePublicBackend,nativeAiApproved,exactFullGoalMetadata:equalGoal,humanNo,assetSha256:record.assetSha256})
}
writeFileSync(resolve(root,own,'native-v-binding-validation.receipt.json'),JSON.stringify({status:'pass',reviewAuthority:'ai_candidate',rows,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify(rows))
