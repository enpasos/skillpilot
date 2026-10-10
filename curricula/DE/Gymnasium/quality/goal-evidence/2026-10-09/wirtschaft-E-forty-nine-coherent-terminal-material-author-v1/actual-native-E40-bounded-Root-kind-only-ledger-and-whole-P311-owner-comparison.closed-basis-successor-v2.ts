import { readFileSync,writeFileSync,existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs,writeGoalBookModel,stableGoalBookJson,parseAndValidateGoalBookModel,fingerprintSemanticKindSourceGoal } from './goalBookModel.ts'
import { evaluateRouteProfile,routeProfiles } from './actual-current-production-unmodified-route-profile-export-for-E40.ts'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot'
const rel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-E-forty-nine-coherent-terminal-material-author-v1'
const base=root+'/'+rel
const priorRel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/five-legacy-phase-exams-minimal-material-requires-and-course-author-v17'
const prior=root+'/'+priorRel
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const write=(name:string,v:unknown)=>{const p=base+'/'+name;if(existsSync(p))throw Error('No overwrite '+p);writeFileSync(p,JSON.stringify(v,null,2)+'\n');read(p)}
const iso=read(base+'/actual-E40-only-own-native-isolate-and-frozen-V17-baseline.receipt.json').physicalIsolate
const can=read(base+'/whole-inert-CAN416-only-nine-E40-DRAFT-and-existing-E-navigation.candidate.json')
const material=read(base+'/whole-nine-coherent-E40-materials.DRAFT-terminal-goals.candidate.json')
const rootTypeRel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-nine-E40-independent-semantic-kind-only-root-v1/actual-independent-nine-E40-semantic-kind-only-full-description-and-assessment-boundary.receipt.json'
if(sha(readFileSync(root+'/'+rootTypeRel))!=='c86db391058ab7c2146f07d07180e210b4107ddff44878e39e09e940126f8425')throw Error('Root actual narrow type receipt changed')
if(sha(readFileSync(base+'/whole-nine-coherent-E40-materials.DRAFT-terminal-goals.candidate.json'))!=='8e799cd2f995b8cca2c56b1f4317f0945a5670e78f943220c055be8f43102858')throw Error('Whole nine material changed')
const config=read(prior+'/book-config.current311-five-legacy-requires-and-course-all-unchanged-P311.inert.json')
const sem=read(root+'/'+config.semanticKindLedgerPath)
const nav=can.goals.find((g:any)=>g.id==='14c05eec-87af-5fd6-832a-4f5d9d280e66')
const navDecision=sem.decisions.find((r:any)=>r.goalId===nav.id)
const oldNavFingerprint=navDecision.sourceFingerprint
navDecision.sourceFingerprint=fingerprintSemanticKindSourceGoal(nav)
const newRows=material.map((g:any)=>({goalId:g.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(g),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'}))
sem.decisions.push(...newRows)
sem.counts.practiceAssessment+=9
write('candidate-semantic416.only-Root-nine-kind-and-one-nav-input-binding.closed-basis-successor-v2.inert.json',sem)
config.semanticKindLedgerPath=rel+'/candidate-semantic416.only-Root-nine-kind-and-one-nav-input-binding.closed-basis-successor-v2.inert.json'
config.outputPath=rel+'/whole-current311-after-nine-E40-DRAFT-materials-with-frozen-V17-P311624.book-model.json'
write('book-config.current311-nine-E40-DRAFT-and-frozen-P311624.closed-basis-successor-v2.inert.json',config)
async function main(){
 const model=(await loadGoalBookBuildInputs(rel+'/book-config.current311-nine-E40-DRAFT-and-frozen-P311624.closed-basis-successor-v2.inert.json',iso)).model
 await writeGoalBookModel(model,root+'/'+config.outputPath)
 const before=parseAndValidateGoalBookModel(read(prior+'/whole-current311-after-five-legacy-requires-and-course-with-all-P311.book-model.json'))
 const by=new Map(model.pages.map(p=>[p.goalId,p]))
 const rows=before.pages.map(p=>{const a=by.get(p.goalId)!;const fields=Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((a as any)[k]));return {goalId:p.goalId,actualChangedFields:fields,wholeExact:fields.length===0,beforeWholePageSHA256:sha(stableGoalBookJson(p)),afterWholePageSHA256:sha(stableGoalBookJson(a))}})
 const sourcePCount=config.evidenceReviewPaths.flatMap((p:string)=>readFileSync(root+'/'+p,'utf8').split(/\r?\n/u).filter(Boolean).map(l=>JSON.parse(l)))
 const original=read(root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-after-final403-with-all-P311.book-model.json')
 const sinceD46=original.pages.map((p:any)=>({goalId:p.goalId,wholeExact:stableGoalBookJson(p)===stableGoalBookJson(by.get(p.goalId))}))
 const prodProfile=routeProfiles.find((p:any)=>p.profileId==='canonical-economics-crossstage')!
 const compilation=buildApplicabilityCompilation()
 const production=evaluateRouteProfile(can,prodProfile,compilation)
 write('actual-current-production-profile-separate-from-expanded-candidate-and-E40-P311-native-owner-impact.closed-basis-successor-v2.result.json',{schemaVersion:1,kind:'bounded-Root-kind-only-native-whole-P311-owner-and-separate-production-profile',actualRootOnlyKindReceipt:{path:rootTypeRel,sha256:sha(readFileSync(root+'/'+rootTypeRel))},newNineKindRows:newRows,narrowRootKindDoesNotReleaseMaterial:true,navOnlyCurrentInputBinding:{goalId:nav.id,oldFingerprint:oldNavFingerprint,currentFingerprint:navDecision.sourceFingerprint,oldKindAndWholeDecisionFieldsPreserved:true},nativeBookPath:config.outputPath,actualNativeBookDigest:model.digest,actualWholeCurrent311Pages:rows,actualChangedSinceV17OwnerCount:rows.filter(r=>!r.wholeExact).length,actualWholeExactSinceV17OwnerCount:rows.filter(r=>r.wholeExact).length,actualChangedSinceOriginalD46OwnerCount:sinceD46.filter((r:any)=>!r.wholeExact).length,allOriginalV17P311WholeRecordsAndCasesRetained:true,actualPRecordCount:sourcePCount.length,actualFrozenV17PCaseCount:sourcePCount.reduce((n:number,r:any)=>n+r.profile.applicationCaseBriefs.length,0),newerRootP981P3NotYetIntaken:true,newRootP131AndNewGoalMontanNotIntaken:true,currentProductionProfileClusterIds:prodProfile.terminalAutonomyClusterIds,currentProductionProfileWholeCodeSnapshot:rel+'/actual-current-production-route-status-code.whole-prefix.snapshot.ts',actualCurrentProductionProfileRules:production,previousExpandedCandidateProfileResult:rel+'/actual-native-CAN416-nine-DRAFT-E40-graph-route-full-course-fixedpoint-and-memory.result.json',fullSourceCourseAndMaterialApproval:false,allNineMaterialsDraft:true,noFinalDReviewFreeze:true,strictNetIncrease:0,liveWrites:[]})
 console.log(JSON.stringify({bookDigest:model.digest,actual311pages:model.pages.length,actualChangedV17Owners:rows.filter(r=>!r.wholeExact).length,actualWholeExactV17Owners:rows.filter(r=>r.wholeExact).length,actualChangedSinceD46Owners:sinceD46.filter((r:any)=>!r.wholeExact).length,actualPRecords:sourcePCount.length,actualFrozenPcases:sourcePCount.reduce((n:number,r:any)=>n+r.profile.applicationCaseBriefs.length,0),currentProductionRules:production.rules.map((r:any)=>({id:r.id,status:r.status,metrics:r.metrics}))},null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
