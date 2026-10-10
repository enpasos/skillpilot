import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,writeGoalBookModel,stableGoalBookJson,parseAndValidateGoalBookModel,fingerprintSemanticKindSourceGoal} from './goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot'
const baseRel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1'
const relative=baseRel+'/four-reviewed-profile-materials-and-explicit-five-support-scope-author-v13'
const base=root+'/'+relative
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(name:string,data:unknown)=>writeFileSync(base+'/'+name,JSON.stringify(data,null,2)+'\n')
const sha=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex')
const iso=read(base+'/actual-own-CAN407-reviewed-material-isolate-and-bounded-five-support-scope.author.receipt.json').physicalIsolate
const main=async()=>{
 const can=read(base+'/whole-V13-CAN407-four-exact-Root-machine-released-materials.inert.candidate.json')
 const priorRel=baseRel+'/seven-unnecessary-historical-exam-prerequisites-author-remedy-v11'
 const v10Rel=baseRel+'/final-thirteen-released-current311-P311-native-preparation-v10'
 const sem=structuredClone(read(root+'/'+priorRel+'/candidate-semantic-kinds.current403.seven-edge-remedy.inert.json'))
 const added:any[]=[],rebound:any[]=[]
 for(const g of can.goals){
  const fingerprint=fingerprintSemanticKindSourceGoal(g)
  const decision=sem.decisions.find((d:any)=>d.goalId===g.id)
  if(decision){
   if(decision.sourceFingerprint!==fingerprint){
    if(g.id!=='5317d078-413b-58bb-9262-d57387d51655'||decision.semanticKind!=='practiceAssessment')throw Error('Unplanned existing kind source change '+g.id)
    rebound.push({goalId:g.id,before:decision.sourceFingerprint,after:fingerprint,basis:'Four independentlyRoot machine-material-reviewed endpoint references appended to the existing prerequisite-free practice navigation.'})
    decision.sourceFingerprint=fingerprint
   }
  }else{
   if(!g.examData||g.examData.reviewStatus!=='released'||g.extendedData?.applicabilityFromRequires!==true)throw Error('Unreviewed or unbounded new node')
   const d={goalId:g.id,sourceFingerprint:fingerprint,semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-practice-assessment'}
   sem.decisions.push(d);added.push(d)
  }
 }
 if(added.length!==4||rebound.length>1)throw Error('Semantic closure beyond four released endpoints and existing navigation')
 sem.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId))
 sem.counts=Object.fromEntries(Object.keys(sem.counts).filter(k=>k!=='total').map(k=>[k,sem.decisions.filter((d:any)=>d.semanticKind===k).length]));sem.counts.total=sem.decisions.length
 if(sem.counts.curricularAtomic!==311||sem.counts.total!==407)throw Error('Semantic denominator drift')
 write('candidate-semantic-kinds.current407.four-root-reviewed-practice-endpoints.inert.json',sem)
 write('actual-four-machine-reviewed-practice-kind-and-one-navigation-source-bindings.native.json',{schemaVersion:1,kind:'native-semantic-kind-binding-for-four-independent-Root-reviewed-practice-assessments',counts:sem.counts,added,rebound,independentMaterialReceiptPath:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-four-real-route-materials-independent-root-v1/actual-independent-four-whole-profile-route-materials-and-machine-release.receipt.json',ordinary311SemanticKindsAndDecisionsWholePreserved:true,ownIndependentQualityApproval:false,descriptionDualReview:false,humanApproval:false,newStrictClosures:0,liveWrites:[]})
 const config=structuredClone(read(root+'/'+priorRel+'/book-config.current311-preserved-all-P311.inert.json'))
 config.semanticKindLedgerPath=relative+'/candidate-semantic-kinds.current407.four-root-reviewed-practice-endpoints.inert.json'
 config.outputPath=relative+'/whole-current311-after-reviewed407-preserved-all-P311.book-model.json'
 write('book-config.current311-reviewed407-preserved-all-P311.inert.json',config)
 const actualSources=config.evidenceReviewPaths.map((p:string)=>({path:p,wholeSHA256:sha(readFileSync(root+'/'+p)),wholeBytesExactInIsolate:readFileSync(root+'/'+p).equals(readFileSync(iso+'/'+p))}))
 const records=config.evidenceReviewPaths.flatMap((p:string)=>readFileSync(iso+'/'+p,'utf8').split(/\r?\n/u).filter(Boolean).map(l=>JSON.parse(l)))
 if(records.length!==311||new Set(records.map((r:any)=>r.goalId)).size!==311||actualSources.some((s:any)=>!s.wholeBytesExactInIsolate)||records.some((r:any)=>r.schemaVersion!==2||r.reviewAuthority!=='ai_candidate'||r.status!=='needs_human_review'||r.evidenceLevel!=='E1'||r.maximumClaimScope!=='G1'))throw Error('Current311 positive evidence or authority drift')
 const model=(await loadGoalBookBuildInputs(relative+'/book-config.current311-reviewed407-preserved-all-P311.inert.json',iso)).model
 await writeGoalBookModel(model,base+'/whole-current311-after-reviewed407-preserved-all-P311.book-model.json')
 const expectedSeven=read(root+'/'+priorRel+'/selective-exact-seven-requires-removal.author.candidate.json').fieldChanges.flatMap((g:any)=>g.removeExactly)
 const allComparisons:any[]=[]
 for(const [label,path] of [['V10-original-D46',v10Rel+'/whole-current311-after-final403-with-all-P311.book-model.json'],['V11-honest-D7-intermediate',priorRel+'/whole-current311-after-seven-exam-prerequisites-removed.P311.book-model.json']]){
  const before=parseAndValidateGoalBookModel(read(root+'/'+path))
  const by=new Map(model.pages.map(p=>[p.goalId,p]))
  const rows=before.pages.map(p=>{const n=by.get(p.goalId)!;const changedFields=Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((n as any)[k]));return{goalId:p.goalId,wholeEqual:changedFields.length===0,changedFields,beforeWholePageSHA256:sha(stableGoalBookJson(p)),afterWholePageSHA256:sha(stableGoalBookJson(n))}})
  const changed=rows.filter(r=>!r.wholeEqual)
  if(changed.length!==7||changed.some(r=>!expectedSeven.includes(r.goalId)||r.changedFields.some(k=>!['externalReverseRequires','pageFingerprint'].includes(k))))throw Error('Actual owner scope is not the bounded seven exam contexts '+label)
  allComparisons.push({label,beforeModelDigest:before.digest,afterModelDigest:model.digest,beforePages:before.pages.length,afterPages:model.pages.length,beforePositiveProfiles:before.pages.filter(p=>p.evidenceReview).length,afterPositiveProfiles:model.pages.filter(p=>p.evidenceReview).length,changedOwnerCount:changed.length,wholeExactOwnerCount:rows.filter(r=>r.wholeEqual).length,changedOwners:changed,rows})
 }
 write('actual-native-reviewed407-P311-V10-and-V11-seven-owner-context-and-304-exact-impact.json',{schemaVersion:1,ownIndependentQualityApproval:false,newStrictClosures:0,noFinalDApprovalOrFreezeClaim:true,pendingOtherSourceP8Delta:true,comparisons:allComparisons})
 write('actual-all311-positive-whole-profile-source-and-AI-authority-retention.native.json',{schemaVersion:1,actualRecords:records.length,actualWholeEvidenceSources:actualSources,wholeP311AndAllCaseTextsExact:true,allReviewAuthority:'ai_candidate',allStatus:'needs_human_review',allEvidenceLevel:'E1',allMaximumClaimScope:'G1',noRealLearnerOrRuntimeEvidenceClaim:true,newStrictClosures:0})
 const v10=parseAndValidateGoalBookModel(read(root+'/'+v10Rel+'/whole-current311-after-final403-with-all-P311.book-model.json'))
 write('actual-seven-current-whole-goals-P2-and-final-new-material-contexts.for-independent-D.json',{schemaVersion:1,scope:'Only seven actual changed exam contexts at the stable reviewed407/P311 boundary; final P8 integration scope remains to be recomputed.',rows:expectedSeven.map((id:string)=>({goalId:id,wholeCanonicalGoal:can.goals.find((g:any)=>g.id===id),wholePositiveV2Profile:records.find((r:any)=>r.goalId===id),wholeV10Ownerpage:v10.pages.find(p=>p.goalId===id),wholeCurrentOwnerpage:model.pages.find(p=>p.goalId===id),wholeRelatedNewReviewedExams:can.goals.filter((g:any)=>g.examData&&(g.requires??[]).includes(id)&&added.some(d=>d.goalId===g.id))})),descriptionIndependentReview:false,humanReview:false})
 console.log(JSON.stringify({counts:sem.counts,existingKindSourceRebindings:rebound.length,modelDigest:model.digest,positiveProfiles:records.length,comparisons:allComparisons.map(r=>({label:r.label,changed:r.changedOwnerCount,wholeEqual:r.wholeExactOwnerCount}))},null,2))
}
main().catch(e=>{console.error(e);process.exitCode=1})
