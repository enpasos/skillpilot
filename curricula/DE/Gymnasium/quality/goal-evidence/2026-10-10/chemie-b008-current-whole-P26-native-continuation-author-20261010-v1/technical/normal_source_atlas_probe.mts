// SPDX-License-Identifier: Apache-2.0
// Whole normal candidate source probe; an actual failure remains HOLD.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {buildGoalBookSourceAtlasInputs} from './isolated-normal-capsule/app/scripts/goalBookSourceAtlasInputs.ts'
const bookOutput='app/scripts/config/goal-books/inactive-chemie-b008-P26-author-20261010-v1'
const root=resolve('.'),p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1'
const config=JSON.parse(readFileSync(resolve(root,p+'/source/current-source-atlas-inputs.exact.json'),'utf8'))
config.landscapePath=p+'/candidate/current-whole511-398-B008.inactive.json';config.semanticKindLedgerPath=p+'/candidate/current511.semantic-kinds.inactive.json'
config.expectedCurricularAtomicGoalCount=398;config.outputDirectory=bookOutput+'/source-views';config.manifestPath=bookOutput+'/source-manifest.json';config.navigationViewPath=bookOutput+'/navigation.view.json'
const put=(f:string,x:any)=>{if(!f.startsWith(p+'/')&&!f.startsWith(bookOutput+'/'))throw Error('Only own inactive outputs in the isolated capsule');const path=resolve(root,f);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,typeof x==='string'?x:JSON.stringify(x,null,2)+'\n')}
put(p+'/source-atlas/current398-full-source-scope.normal-probe.inputs.json',config)
try{
 const result=buildGoalBookSourceAtlasInputs(config,root)
 for(const [f,bytes]of Object.entries(result.outputs))put(f,bytes)
 put(p+'/checks/normal-current398-whole-source-atlas-candidate.actual.json',{schemaVersion:1,role:'Actual whole normal source compiler candidate diagnostic; machine output is not whole original source/operator/course review',actualCompilerExitEquivalent:0,actualReceipt:result.receipt,expectedWholeCurricularAtomicDenominator:398,expectedScopeNotLoweredToMakeProbePass:true,wholeSource19Approval:false,currentCourseOrTargetApproval:false,activeWrites:[],strictGain:0,humanApproval:false})
 console.log(JSON.stringify({normalSourceCompilerExitEquivalent:0,actualReceipt:result.receipt,wholeSource19Approval:false,strictGain:0}))
}catch(error){
 const message=error instanceof Error?error.message:String(error)
 put(p+'/checks/normal-current398-whole-source-atlas-candidate.actual.json',{schemaVersion:1,role:'Actual ordinary full398 expected source probe failure preserved; no count relaxation or partial/global source approval',actualCompilerExitEquivalent:1,actualError:message,expectedWholeCurricularAtomicDenominator:398,expectedScopeNotLoweredToMakeProbePass:true,wholeSource19Approval:false,currentCourseOrTargetApproval:false,activeWrites:[],strictGain:0,humanApproval:false})
 console.error(message);process.exitCode=1
}
