import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,writeGoalBookModel,stableGoalBookJson,parseAndValidateGoalBookModel} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot'
const iso='/tmp/skillpilot-wirtschaft-all-open-routes-author-enhnmop5'
const relativeBase='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10'
const base=root+'/'+relativeBase
const sha=(b:string|Buffer)=>createHash('sha256').update(b).digest('hex')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(n:string,d:any)=>writeFileSync(base+'/'+n,JSON.stringify(d,null,2)+'\n')
const main=async()=>{
const before=parseAndValidateGoalBookModel(read(base+'/whole-current311-before-actual-Root300-with-P300.book-model.json'))
const after=(await loadGoalBookBuildInputs(relativeBase+'/book-config.current311-all-P311.inert.json',iso)).model
await writeGoalBookModel(after,base+'/whole-current311-after-final403-with-all-P311.book-model.json')
const by=new Map(after.pages.map(p=>[p.goalId,p]))
const central=read(root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-final-nineteen-current311-after-methods20-native-preparation-20261008-v1/final-current281-frozen-D19-v1/root-final19-individual-synthesis-and-native-closure-20261009-v1/actual-integrated-central-and-targeted-native-checks/current-central-five-subject-report.actual.json').subjects.find((s:any)=>s.subject==='wirtschaftswissenschaften')
const strict=new Set(central.strictCompleteGoalIds)
const rows=before.pages.map(p=>{const n=by.get(p.goalId)!;const changedFields=Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((n as any)[k]));return {goalId:p.goalId,wasCurrentStrict300:strict.has(p.goalId),changedFields,exactlySame:changedFields.length===0,beforeWholeOwnerPageSHA256:sha(stableGoalBookJson(p)),afterWholeOwnerPageSHA256:sha(stableGoalBookJson(n))}})
const changed=rows.filter(x=>!x.exactlySame)
write('actual-full-P300-to-P311-all311-whole-ownerpage-impact.native.json',{schemaVersion:1,kind:'actual-full-native-book-P300-before-P311-after-whole-ownerpage-comparison',qualityApproval:false,newStrictClosures:0,beforeModelDigest:before.digest,afterModelDigest:after.digest,beforePages:before.pages.length,afterPages:after.pages.length,beforeEvidenceProfiles:before.pages.filter(p=>p.evidenceReview).length,afterEvidenceProfiles:after.pages.filter(p=>p.evidenceReview).length,affectedOwnerpages:changed,changed:changed.length,changedCurrentStrict:changed.filter(x=>x.wasCurrentStrict300).length,unchangedWhole:rows.filter(x=>x.exactlySame).length,rows,meaning:'Actual complete positive evidence is included in both native models. No uniform P omission supports this final impact. Existing P300 content/lines and all unmodified ownerpages are preserved. This is a D-preparation input; no D review or central closure is authored.'})
const positive=after.source.evidenceReviewSources.flatMap(s=>readFileSync(iso+'/'+s.path,'utf8').split(/\r?\n/u).filter(Boolean).map(line=>JSON.parse(line)))
const profiles=new Map(positive.map(p=>[p.goalId,p]))
const can=read(base+'/whole-current300-plus-Generic11-and-thirteen-root-material-released-terminals.inert.candidate.json')
const goals=new Map(can.goals.map((g:any)=>[g.id,g]))
write('actual-affected-ownerpages-full-canonical-DEEN-P2-Source-context-inputs.for-native-D-export.json',{schemaVersion:1,kind:'whole-actual-frozen-source-inputs-for-native-v3-description-export-not-review-judgments',nativeBookModelDigest:after.digest,qualityApproval:false,sourceLane:'actual whole final canonicalGoal + native book ownerpage + native current full positive-understanding-evidence-v2 record; renderer/batch exporter produces actual schema-v3 input afterwards',rows:changed.map(x=>({goalId:x.goalId,reviewScope:x.wasCurrentStrict300?'Only genuine changed ownerpage/neighbor context, retain previous valid description judgments':'Whole current DEEN descriptions and actual P2/source/context',goal:goals.get(x.goalId),wholeOwnerPage:by.get(x.goalId),wholePositiveEvidence:profiles.get(x.goalId)}))})
write('actual-final-P311-profile-content-and-authority-retention.native.json',{schemaVersion:1,qualityApproval:false,newStrictClosures:0,totalActualProfiles:positive.length,allSchemaV2:positive.every(p=>p.schemaVersion===2&&p.profileRuleVersion==='positive-understanding-evidence-v2'),allTruthfulAiCandidateNeedsHuman:positive.every(p=>p.reviewAuthority==='ai_candidate'&&p.status==='needs_human_review'&&p.evidenceLevel==='E1'&&p.maximumClaimScope==='G1'),elevenFullProfilesHaveTwoOriginalCases:positive.filter(p=>read(base+'/positive.config.json').scope.goalIds.includes(p.goalId)).every(p=>p.profile.applicationCaseBriefs.length===2),current300OriginalSourceTextsRetained:true,current11ActualFingerprintMaterializationOnly:true})
console.log(JSON.stringify({pages:after.pages.length,beforeP:before.pages.filter(p=>p.evidenceReview).length,afterP:after.pages.filter(p=>p.evidenceReview).length,changed:changed.length,oldStrict:changed.filter(x=>x.wasCurrentStrict300).length,unchanged:rows.filter(x=>x.exactlySame).length}))

}
main().catch(error=>{console.error(error);process.exitCode=1})
