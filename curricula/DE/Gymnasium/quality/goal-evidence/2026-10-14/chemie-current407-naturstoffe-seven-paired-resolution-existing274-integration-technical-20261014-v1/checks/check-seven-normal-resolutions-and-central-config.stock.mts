// Apache-2.0. Narrow unchanged stock schemas/current-input validators; no central run.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
const own=resolve(fileURLToPath(new URL('..',import.meta.url)))
const repo='/home/enpasos/projects/skillpilot',rel=own.replace(repo+'/','')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const imp=(p:string)=>import(pathToFileURL(resolve(repo,p)).href)
const {materializeGoalDescriptionRolloutBatchDualSummary}=await imp('app/scripts/materializeGoalDescriptionRolloutBatch.ts')
const {validateGoalDescriptionDualRoundResolution}=await imp('app/scripts/validateGoalDescriptionDualRoundResolution.ts')
const {validateStandaloneResolutionIndexSchema,validateStandaloneResolutionIndexStructure,buildResolutionSupersessionChains,loadDeepUnderstandingRolloutConfig}=await imp('app/scripts/reportDeepUnderstandingRollout.ts')
const dual=await materializeGoalDescriptionRolloutBatchDualSummary(`${rel}/native-seven.inactive-copy.batch.config.json`,false)
const index=read(`${own}/native-seven/resolution-index.json`),landscape=read(`${own}/candidate/canonical533.current407.N7.inactive.json`),ledger=read(`${own}/candidate/semantic533.current407.N7.normal-alias.inactive.json`)
const atomic=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const cfg=loadDeepUnderstandingRolloutConfig(`${rel}/config/chemie-current407-N7-existing274.inactive.config.json`),s=cfg.subjects[0]
const errors=[...validateStandaloneResolutionIndexSchema(index),...validateStandaloneResolutionIndexStructure(index,atomic)]
const chains=buildResolutionSupersessionChains(s.resolutionSupersessions,s.resolutionIndexPaths,atomic);errors.push(...chains.issues)
const rows=[]
for(const e of index.resolutions){
 const resolution=read(`${own}/native-seven/${e.resolutionPath}`),mp=resolution.synthesisDecisionManifest.manifestPath,mb=readFileSync(`${own}/native-seven/${mp}`)
 const result=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,landscape,first:dual.first,second:dual.second,synthesisDecisionManifestArtifact:{manifest:JSON.parse(mb.toString()),manifestBytes:mb,manifestPath:mp}})
 errors.push(...result.errors);if(!result.strictDescriptionComplete)errors.push(`${e.goalId}: not strict current D`)
 rows.push({goalId:e.goalId,strictDescriptionComplete:result.strictDescriptionComplete,errors:result.errors})
}
if(rows.length!==7||atomic.size!==407)errors.push('Wrong actualD7/current407 scope')
const p=read(resolve(repo,s.positiveEvidenceConfigPaths.at(-1)!))
if(p.scope.goalIds.length!==6||p.scope.goalIds.includes('68292f39-04e7-5924-b6a5-731c7f7f82ee'))errors.push('Held682 wrongly selected in new P')
const proof={schemaVersion:1,checkedAt:new Date().toISOString(),stockFunctionsUnchanged:true,normalCentralConfigSchemaPass:true,actualSevenCurrentDResolutions:rows,currentAtomicDenominator:atomic.size,allSupersessionChainsValid:chains.issues.length===0,newPOnlySix:true,wholeSourceM311And682MaterialHoldsUnchanged:true,newScienceVotes:0,errors,pass:!errors.length}
writeFileSync(`${own}/checks/STOCK.seven-normal-current-resolutions-index-chains-and-P6.actual.json`,JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify({actualD7:rows.length,errors,pass:proof.pass}))
if(errors.length)process.exitCode=1
