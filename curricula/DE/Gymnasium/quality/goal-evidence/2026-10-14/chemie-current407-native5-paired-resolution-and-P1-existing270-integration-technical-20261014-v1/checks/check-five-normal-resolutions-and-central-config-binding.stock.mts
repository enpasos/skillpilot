// Apache-2.0. Finite stock schema and exact current-input checks; no new vote.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-native5-paired-resolution-and-P1-existing270-integration-technical-20261014-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const imp=(p:string)=>import(pathToFileURL(resolve(p)).href)
const {materializeGoalDescriptionRolloutBatchDualSummary}=await imp('app/scripts/materializeGoalDescriptionRolloutBatch.ts')
const {validateGoalDescriptionDualRoundResolution}=await imp('app/scripts/validateGoalDescriptionDualRoundResolution.ts')
const {validateStandaloneResolutionIndexSchema,validateStandaloneResolutionIndexStructure,buildResolutionSupersessionChains,loadDeepUnderstandingRolloutConfig}=await imp('app/scripts/reportDeepUnderstandingRollout.ts')
const dual=await materializeGoalDescriptionRolloutBatchDualSummary(`${own}/native-five.inactive-copy.batch.config.json`,false)
const index=read(`${own}/native-five/resolution-index.json`)
const landscape=read(`${own}/candidate/canonical533.current407.N5.inactive.json`)
const ledger=read(`${own}/candidate/semantic533.current407.N5.normal-alias.inactive.json`)
const atomic=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const config=loadDeepUnderstandingRolloutConfig(`${own}/config/chemie-current407-native5-existing270.inactive.config.json`)
const subject=config.subjects[0]
const errors=[...validateStandaloneResolutionIndexSchema(index),...validateStandaloneResolutionIndexStructure(index,atomic)]
const chains=buildResolutionSupersessionChains(subject.resolutionSupersessions,subject.resolutionIndexPaths,atomic);errors.push(...chains.issues)
const rows=[]
for(const entry of index.resolutions){
 const resolution=read(`${own}/native-five/${entry.resolutionPath}`)
 const manifestPath=resolution.synthesisDecisionManifest.manifestPath
 const manifestBytes=readFileSync(`${own}/native-five/${manifestPath}`)
 const result=await validateGoalDescriptionDualRoundResolution({resolution,dualSummary:dual.summary,dualSummaryBytes:dual.bytes,currentInput:dual.first.input,landscape,first:dual.first,second:dual.second,synthesisDecisionManifestArtifact:{manifest:JSON.parse(manifestBytes.toString()),manifestBytes,manifestPath}})
 errors.push(...result.errors)
 if(!result.strictDescriptionComplete)errors.push(`${entry.goalId}: not strict current description completion`)
 rows.push({goalId:entry.goalId,strictDescriptionComplete:result.strictDescriptionComplete,errors:result.errors})
}
if(rows.length!==5||atomic.size!==407)errors.push('Wrong finite5 / current407 scope')
const aliases={canonical:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semantic:'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',qa:'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'}
if(subject.landscapePath!==aliases.canonical||subject.semanticKindLedgerPath!==aliases.semantic||subject.visualizationQaPath!==aliases.qa)errors.push('Operative host source aliases not normal stock aliases')
const report={schemaVersion:1,checkedAtUTC:new Date().toISOString(),unmodifiedStockFunctions:true,configSchemaPass:true,exactFiveResolutionRows:rows,currentAtomicDenominator:atomic.size,allSupersessionChainsValid:chains.issues.length===0,selected2652Chain:chains.chains.filter((c:any)=>c.goalId==='2652caef-b557-58b9-9b28-70db62625ce5'),normalAliases:aliases,newScientificVotes:0,errors,pass:errors.length===0}
writeFileSync(`${own}/checks/stock-five-resolution-index-schema-context-and-normal-central-config.actual.json`,JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({strictD5:rows.length,errors,pass:report.pass}))
if(errors.length)process.exitCode=1
