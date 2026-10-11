import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,writeGoalBookModel,stableGoalBookJson,parseAndValidateGoalBookModel} from './goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot'
const parent='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const relative=parent+'/current407-P311-and-independent-P8-selective-native-owner-union-author-v15'
const base=root+'/'+relative
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(n:string,v:unknown)=>writeFileSync(base+'/'+n,JSON.stringify(v,null,2)+'\n')
const sha=(s:string)=>createHash('sha256').update(s).digest('hex')
const meta=read(base+'/actual-fresh407-frame-selective-independent-P8-and-other303-wholebytes.guard.receipt.json')
const main=async()=>{
 const model=(await loadGoalBookBuildInputs(relative+'/book-config.reviewed407-current311-selective-root-P8-preserved-other303.inert.json',meta.physicalIsolate)).model
 await writeGoalBookModel(model,base+'/whole-current311-after-reviewed407-plus-independent-P8.P311.book-model.json')
 const afterBy=new Map(model.pages.map(p=>[p.goalId,p]))
 const comparisons:any[]=[]
 for(const [label,path] of [
  ['Root300-valid-before-original-D46',parent+'/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-before-actual-Root300-with-P300.book-model.json'],
  ['V10-original-D46-A-and-B-frozen-ownerpages',parent+'/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-after-final403-with-all-P311.book-model.json'],
  ['V14-reviewed407-and-seven-profile-support-before-P8',parent+'/four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13/whole-current311-after-reviewed407-preserved-all-P311.book-model.json'],
 ]){
  const before=parseAndValidateGoalBookModel(read(root+'/'+path))
  const rows=before.pages.map(p=>{const a=afterBy.get(p.goalId)!;const changedFields=Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((a as any)[k]));return{goalId:p.goalId,changedFields,wholeEqual:changedFields.length===0,beforeWholeOwnerPageSHA256:sha(stableGoalBookJson(p)),afterWholeOwnerPageSHA256:sha(stableGoalBookJson(a))}})
  const changed=rows.filter(r=>!r.wholeEqual)
  comparisons.push({label,beforeModelDigest:before.digest,afterModelDigest:model.digest,beforePositiveProfiles:before.pages.filter(p=>p.evidenceReview).length,afterPositiveProfiles:model.pages.filter(p=>p.evidenceReview).length,changedOwnerCount:changed.length,wholeExactOwnerCount:rows.filter(r=>r.wholeEqual).length,changedOwners:changed,rows})
 }
 const p8=meta.changedExactlyEightPositiveGoalIds as string[]
 const route7=read(root+'/'+parent+'/seven-unnecessary-historical-exam-prerequisites-author-remedy-v11/selective-exact-seven-requires-removal.author.candidate.json').fieldChanges.flatMap((g:any)=>g.removeExactly) as string[]
 const expected=new Set([...p8,...route7])
 if(comparisons[1].changedOwnerCount!==expected.size||comparisons[1].changedOwners.some((r:any)=>!expected.has(r.goalId)))throw Error('Actual D46->final owner union differs from actual P8/route contexts')
 if(comparisons[2].changedOwnerCount!==8||comparisons[2].changedOwners.some((r:any)=>!p8.includes(r.goalId)))throw Error('Unexpected owner changed after P8-only adoption')
 const freeze=read(root+'/'+parent+'/final-thirteen-released-current311-P311-native-preparation-v10/native-d-final46-three-max20-prepared-freeze.actual.json')
 const originalD46IDs=freeze.packets.flatMap((p:any)=>p.goalIds) as string[]
 const d46=new Set(originalD46IDs)
 const a=read(root+'/'+parent+'/final-thirteen-released-current311-P311-native-preparation-v10/native-d-final46-ordered-pack1-scope46-v2/round-a/reviewer-artifacts/final-independent-round-a-audit-receipt.json')
 const b=read(root+'/'+parent+'/final-thirteen-released-current311-P311-native-preparation-v10/native-d-final46-ordered-pack1-scope46-v2/round-b/independent-b/independent-round-b-final.receipt.json')
 const currentCentral=read(root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-final-nineteen-current311-after-methods20-native-preparation-20261008-v1/final-current281-frozen-D19-v1/root-final19-individual-synthesis-and-native-closure-20261009-v1/actual-integrated-central-and-targeted-native-checks/current-central-five-subject-report.actual.json').subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften')
 const strict300=new Set<string>(currentCentral.strictCompleteGoalIds)
 const modelsBefore=read(root+'/'+parent+'/final-thirteen-released-current311-P311-native-preparation-v10/whole-current311-after-final403-with-all-P311.book-model.json')
 const beforeBy=new Map(modelsBefore.pages.map((p:any)=>[p.goalId,p]))
 const can=read(root+'/'+meta.canonicalWholePath)
 const config=read(base+'/book-config.reviewed407-current311-selective-root-P8-preserved-other303.inert.json')
 const records=config.evidenceReviewPaths.flatMap((p:string)=>readFileSync(root+'/'+p,'utf8').split(/\r?\n/u).filter(Boolean).map(l=>JSON.parse(l)))
 if(records.length!==311||records.some((r:any)=>r.status!=='needs_human_review'||r.reviewAuthority!=='ai_candidate'||r.evidenceLevel!=='E1'||r.maximumClaimScope!=='G1'))throw Error('Positive evidence authority drift')
 const wholeScope=read(root+'/'+parent+'/seven-explicit-profile-support-and-full-fixedpoint-scope-author-v14/actual-whole-V10-to-V14-GK-LK-rendered-target-support-fixedpoint-and-four-new-exams.report.json')
 const union=comparisons[1].changedOwners.map((r:any)=>({...r,reviewWholeNewPDelta:p8.includes(r.goalId),reviewChangedExamContexts:route7.includes(r.goalId),wasInOriginalD46:d46.has(r.goalId),wasCurrentRootStrict300:strict300.has(r.goalId)}))
 const unchanged46=originalD46IDs.filter(id=>!expected.has(id))
 write('actual-current407-P8-route7-all311-ownerpage-union-and-valid-reuse.native.json',{schemaVersion:1,kind:'actual-three-stable-native-book-baseline-comparisons-before-final-targeted-D',comparisons,finalActualRequiredReviewUnion:union,originalD46OwnerIDsWholeUnchangedAndEligibleForExistingIndependentJudgmentReuse:unchanged46,unchangedD46Count:unchanged46.length,Root300CurrentStrictJudgmentsRetainedExceptActualChangedOwnerPages:true,currentCurricularAtomicDenominator:311,ownIndependentDescriptionReview:false,wholeSourceCourseApproval:false,wholeScopeDebtOpen:wholeScope.wholeScopeRemainingOpen,finalDFreezeCreated:false,independentRoundAReceiptUsedForReviewExistenceOnly:a!==null,independentRoundBReceiptUsedForReviewExistenceOnly:b!==null,newStrictClosures:0,liveWrites:[]})
 write('actual-final-union-whole-current-goals-P2-source-and-reviewed-exam-contexts.for-native-D.json',{schemaVersion:1,scope:'Root-reviewed substantiveP8 successors plus bounded route7 examination contexts; historical whole-scope debt remains separately open.',nativeBookDigest:model.digest,rows:union.map((r:any)=>({goalId:r.goalId,exactReviewScope:r,wholeCurrentCanonicalGoal:can.goals.find((g:any)=>g.id===r.goalId),wholeCurrentPositiveV2Record:records.find((p:any)=>p.goalId===r.goalId),wholeV10Ownerpage:beforeBy.get(r.goalId),wholeFinalCurrentOwnerpage:afterBy.get(r.goalId),wholeFourNewExamContexts:can.goals.filter((g:any)=>g.examData&&(g.requires??[]).includes(r.goalId)&&['88228c0a-2a1e-5c59-8426-c291e49f3f35','c659edea-7786-59b3-90f3-9c9983388c83','a01084fe-43a3-5327-8887-c8b07777f89f','efbdb94b-e694-53d7-91a7-610e2a1ed1c2'].includes(g.id))})),ownReviewApproval:false,newStrictClosures:0})
 console.log(JSON.stringify({digest:model.digest,positiveProfiles:records.length,actualCases:records.reduce((n:number,r:any)=>n+r.profile.applicationCaseBriefs.length,0),comparisons:comparisons.map(c=>({label:c.label,changed:c.changedOwnerCount,wholeExact:c.wholeExactOwnerCount})),actualFinalDeltaUnion:union.length,unchangedOriginalD46:unchanged46.length,p8NewOwnersOutsideOriginal46:union.filter((r:any)=>!r.wasInOriginalD46).map((r:any)=>r.goalId)},null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
