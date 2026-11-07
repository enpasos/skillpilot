import { readFileSync, writeFileSync } from 'node:fs'
import { createVisualizationContextVerifier, hasVerifiedVisualizationContext, type VisualizationCurrentContext, type VisualizationReviewArtifact } from './goalVisualizationReviewedContext'
const W = process.env.MATH58_WORKSPACE!
const inputs = JSON.parse(readFileSync(W + (process.env.MATH58_ALL132 === '1' ? '/all132-native-inputs.json' : process.env.MATH58_OLD74 === '1' ? '/old74-native-inputs.json' : '/native-inputs.json'), 'utf8')) as Array<{goalId:string; receipt:{path:string;sha256:string};current:VisualizationCurrentContext;boxplotV2:boolean}>
const originals = new Map<string, VisualizationReviewArtifact & {currentCopyRequired:boolean}>(), currents = new Map<string,{path:string;sha256:string;bytes?:number;fromRepository:boolean}>()
const verify = createVisualizationContextVerifier({repositoryRoot:process.cwd(),originalEvidenceRepositoryRoot:process.env.MATH58_ORIGINAL_ROOT,acceptedRepositoryCommit:'25a6f2164a81a7e6ae50db3557d20521fecf5124',
 onAuthenticatedOriginalRead:(binding,required)=>{const key=binding.gitCommit+':'+binding.path;const prev=originals.get(key);originals.set(key,{...binding,currentCopyRequired:required||!!prev?.currentCopyRequired})},
 onBoundCurrentEvidenceRead:(binding,fromRepository)=>{currents.set(binding.path,{...binding,fromRepository})}})
const rows=inputs.map(input=>{const result=verify(input.receipt,input.current);return {goalId:input.goalId,boxplotV2:input.boxplotV2,result:result.ok?{ok:true,capabilityUsable:hasVerifiedVisualizationContext(result.capability,input.current)}:result}})
const negativeInput=inputs.find(input=>input.goalId==='b41cb496-dad5-596e-9c23-cdcbdab3ec2e') ?? inputs[1]
const negatives:unknown[]=[]
for(const [name,mutate] of [
 ['stale DE',(x:VisualizationCurrentContext)=>({...x,description:x.description+' changed'})],
 ['stale EN title',(x:VisualizationCurrentContext)=>({...x,titleEn:x.titleEn+' changed'})],
 ['stale demand',(x:VisualizationCurrentContext)=>({...x,demandLevel:'AB9'})],
 ['stale image',(x:VisualizationCurrentContext)=>({...x,assetSha256:'sha256:'+'0'.repeat(64)})],
 ['invented scalar level',(x:VisualizationCurrentContext)=>({...x,level:2})],
] as const){const input=negativeInput;const result=verify(input.receipt,mutate(input.current));negatives.push({name,result:result.ok?{ok:true}:result})}
const first=negativeInput;negatives.push({name:'missing receipt',result:verify(undefined,first.current)},{name:'forged capability',accepted:hasVerifiedVisualizationContext({context:first.current},first.current)})
writeFileSync(W+'/native-reader-'+(process.env.MATH58_ALL132 === '1' ? 'all132' : process.env.MATH58_OLD74 === '1' ? 'old74' : process.env.MATH58_BOX_V2==='1'?'v2':'active')+'.json',JSON.stringify({rows,negativeGoalId:negativeInput.goalId,negatives,originals:[...originals.values()],currentReferences:[...currents.values()]},null,2)+'\n')
console.log(JSON.stringify({rows:rows.map(x=>({goalId:x.goalId,...x.result})),negatives},null,2))
if(rows.some(x=>!x.result.ok && !(x.boxplotV2&&process.env.MATH58_BOX_V2!=='1')))process.exitCode=1
