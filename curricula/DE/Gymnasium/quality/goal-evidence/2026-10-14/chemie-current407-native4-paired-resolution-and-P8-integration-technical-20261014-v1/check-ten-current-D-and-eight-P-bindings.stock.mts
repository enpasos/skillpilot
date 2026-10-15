// Bounded integration binding validation, no new scientific votes; Apache-2.0.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
const repo=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-native4-paired-resolution-and-P8-integration-technical-20261014-v1',source='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const bytes=(p:string)=>readFileSync(resolve(repo,p))
const sha=(b:any)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const imp=(p:string)=>import(pathToFileURL(resolve(repo,p)).href)
const {materializeGoalDescriptionRolloutBatchDualSummary}=await imp('app/scripts/materializeGoalDescriptionRolloutBatch.ts')
const {validateGoalDescriptionDualRoundResolution}=await imp('app/scripts/validateGoalDescriptionDualRoundResolution.ts')
const {validateStandaloneResolutionIndexSchema,validateStandaloneResolutionIndexStructure,buildResolutionSupersessionChains}=await imp('app/scripts/reportDeepUnderstandingRollout.ts')
const {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics}=await imp('app/scripts/positiveGoalEvidenceProfileModel.ts')
const landscape=read(`${source}/candidate/canonical533.current407.corrected-P8-resources.inactive.json`),ledger=read(`${source}/candidate/semantic533.current407.corrected-P8.inactive.json`)
const byId=new Map(landscape.goals.map((g:any)=>[g.id,g])),kinds=new Map(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const atomic=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const errors:string[]=[],dchecks:any[]=[],indexchecks:any[]=[]
const obsolete53='53db04a0-ea76-5810-9526-c8639100e497'
for(const [dir,config] of [['retained-native-eight','retained-native-eight.inactive-copy.batch.config.json'],['native-four','native-four.inactive-copy.batch.config.json']]){
 const dual=await materializeGoalDescriptionRolloutBatchDualSummary(`${own}/${config}`,false)
 const index=read(`${own}/${dir}/resolution-index.json`)
 const ie=[...validateStandaloneResolutionIndexSchema(index),...validateStandaloneResolutionIndexStructure(index,atomic)]
 indexchecks.push({path:`${own}/${dir}/resolution-index.json`,indexResolutionCount:index.resolutions.length,deferredGoalIds:index.deferredGoalIds??[],errors:ie});errors.push(...ie)
 for(const entry of index.resolutions){
  if(dir==='retained-native-eight'&&entry.goalId===obsolete53)continue
  const path=`${own}/${dir}/${entry.resolutionPath}`,resolution=read(path),manifestPath=resolution.synthesisDecisionManifest.manifestPath,manifestBytes=bytes(`${own}/${dir}/${manifestPath}`)
  const result=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,landscape,first:dual.first,second:dual.second,synthesisDecisionManifestArtifact:{manifest:JSON.parse(manifestBytes.toString()),manifestBytes,manifestPath}})
  dchecks.push({goalId:entry.goalId,resolutionPath:path,decision:resolution.decision,current407CanonicalValidated:true,strictDescriptionComplete:result.strictDescriptionComplete,errors:result.errors});errors.push(...result.errors)
 }
}
const oldIndex=`${own}/retained-native-eight/resolution-index.json`,newIndex=`${own}/native-four/resolution-index.json`
const supersessions=[{goalId:obsolete53,supersededIndexPath:oldIndex,replacementIndexPath:newIndex}]
const chains=buildResolutionSupersessionChains(supersessions,[oldIndex,newIndex],atomic);errors.push(...chains.issues)
const pchecks=read(`${own}/INPUTS.genuine-seven-AM-and-eight-P-records-scoped-config-provenance.actual.json`).rows.filter((r:any)=>r.lane==='P').flatMap((r:any)=>bytes(r.ownedSelectedReviewPath).toString().trim().split('\n').map((line:string)=>{
 const record=JSON.parse(line),goal:any=byId.get(record.goalId),resources:Record<string,string>={}
 for(const link of goal.resourceLinks??[])if(link.url?.startsWith('/assets/'))resources[link.url]=sha(bytes(`${source}/public-root/${link.url.slice(1)}`))
 const kind:any=kinds.get(record.goalId),issues=validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,kind)
 const gf=fingerprintGoalForPositiveEvidence(goal,kind),pf=fingerprintPositiveGoalEvidenceProfile(record.profile)
 if(gf!==record.goalFingerprint||pf!==record.profileFingerprint)issues.push('Actual goal/profile fingerprint mismatch')
 errors.push(...issues)
 return {goalId:record.goalId,recordReviewId:record.reviewId,status:record.status,reviewAuthority:record.reviewAuthority,resourceDigests:resources,actualGoalFingerprint:gf,actualProfileFingerprint:pf,errors:issues}
}))
if(dchecks.length!==10||new Set(dchecks.map(d=>d.goalId)).size!==10||pchecks.length!==8)errors.push('Wrong bounded D/P integration cardinality')
const report={schemaVersion:1,stockFunctionsUnmodified:true,currentAtomicDenominatorReference:407,D:indexchecks,current407DClaims:dchecks,historical53Supersession:supersessions,supersessionChainIssues:chains.issues,P8:pchecks,errors,pass:errors.length===0,regularStockPCLIAssetPathsRemainUnactivated:true,noNewVotes:true,strictWholeCurriculumOrM6Claim:false,activeWrites:false}
writeFileSync(resolve(repo,`${own}/CHECK.ten-current-D-six-retentions-and-eight-P-stock-bindings.actual.json`),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({D:dchecks.length,P:pchecks.length,errors,pass:report.pass}))
if(errors.length)process.exitCode=1
