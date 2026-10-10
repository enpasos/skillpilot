// SPDX-License-Identifier: Apache-2.0
// Technical whole-model preparation only; no independent science or release claim.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
const P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-four-risk-ethics-current-native-technical-author-20261010-v1'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-q1-eight-title-methyl-current-native-technical-author-successor-v2'
const C=process.argv[process.argv.indexOf('--capsule')+1],D=resolve(P)
const read=(p:string)=>JSON.parse(readFileSync(resolve(D,p),'utf8'))
const put=(p:string,j:any)=>{mkdirSync(dirname(resolve(D,p)),{recursive:true});writeFileSync(resolve(D,p),JSON.stringify(j,null,2)+'\n')}
const rows=(p:string)=>readFileSync(resolve(D,p),'utf8').trim().split('\n').map(s=>JSON.parse(s))
const original=read('inputs/whole479-title-methyl-eight-current.exact.json'),candidate=read('candidate/whole479-current-twelve-raster-links.inactive.json')
const ids=read('inputs/final-four-raster-bindings.exact.json').goalIds
const pg=new Map<string,any>(original.goals.map((g:any)=>[g.id,g])),cg=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
assert.equal(pg.size,479);assert.equal(cg.size,479)
const goalDelta=[...pg.keys()].filter(id=>stableGoalBookJson(pg.get(id))!==stableGoalBookJson(cg.get(id)))
assert.deepEqual(new Set(goalDelta),new Set(ids))
for(const id of pg.keys()){
 assert.equal(fingerprintSemanticKindSourceGoal(pg.get(id)),fingerprintSemanticKindSourceGoal(cg.get(id)))
 if(ids.includes(id))assert.equal(stableGoalBookJson({...pg.get(id),resourceLinks:cg.get(id).resourceLinks}),stableGoalBookJson(cg.get(id)))
}
const before=await loadGoalBookBuildInputs(`${P}/native/before394-current-four.normal.config.json`,C)
const after=await loadGoalBookBuildInputs(`${P}/native/after394-current-four.normal.config.json`,C)
assert.equal(before.model.pages.length,394);assert.equal(after.model.pages.length,394)
put('native/before394-current-four.normal-model.json',before.model);put('native/after394-current-four.normal-model.json',after.model)
const bp=new Map<string,any>(before.model.pages.map(p=>[p.goalId,p])),ap=new Map<string,any>(after.model.pages.map(p=>[p.goalId,p]))
assert.deepEqual([...bp.keys()],[...ap.keys()])
const protected315=read('inputs/protected315-baseline-ID-sets.exact.json').subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
assert.equal(protected315.length,315);assert.ok(protected315.every((id:string)=>pg.has(id)&&bp.has(id)&&ap.has(id)))
const otherEight=rows('positive/eight-reviewed-current-context-P.records.exact.jsonl').map(r=>r.goalId)
assert.equal(otherEight.length,8);assert.ok(otherEight.every(id=>!ids.includes(id)&&!protected315.includes(id)))
const protectionUnion=[...protected315,...otherEight];assert.equal(new Set(protectionUnion).size,323)
assert.ok(protectionUnion.every(id=>stableGoalBookJson(pg.get(id))===stableGoalBookJson(cg.get(id))))
assert.ok(protectionUnion.every(id=>stableGoalBookJson(bp.get(id))===stableGoalBookJson(ap.get(id))))
const pageDelta=[...bp.keys()].filter(id=>stableGoalBookJson(bp.get(id))!==stableGoalBookJson(ap.get(id)))
assert.deepEqual(new Set(pageDelta),new Set(ids))
const originalP=rows('positive/whole12-current-V3-profiles.exact.jsonl'),oldFour=rows('positive/four-before-raster-V3.records.exact.jsonl'),currentFour=rows('positive/four-current-raster-P.author.review.jsonl'),eight=rows('positive/eight-reviewed-current-context-P.records.exact.jsonl')
assert.equal(originalP.length,12);assert.equal(currentFour.length,4);assert.equal(eight.length,8)
const bindings=currentFour.map(r=>{
 const old=oldFour.find(o=>o.goalId===r.goalId),page=ap.get(r.goalId),png=read('inputs/final-four-raster-bindings.exact.json').assets.find((x:any)=>x.goalId===r.goalId).png
 assert.equal(stableGoalBookJson(old.profile),stableGoalBookJson(r.profile));assert.equal(old.profileFingerprint,r.profileFingerprint);assert.equal(old.goalFingerprint,r.goalFingerprint)
 assert.notEqual(old.reviewInputFingerprint,r.reviewInputFingerprint)
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[])
 assert.equal(page.evidenceReview.reviewInputFingerprint,r.reviewInputFingerprint);assert.equal(page.evidenceReview.profileFingerprint,r.profileFingerprint);assert.equal(page.visualization.originalDigest,png.sha256)
 return {goalId:r.goalId,goalFingerprint:r.goalFingerprint,profileFingerprint:r.profileFingerprint,previousReviewInputFingerprint:old.reviewInputFingerprint,currentReviewInputFingerprint:r.reviewInputFingerprint,currentPageFingerprint:page.pageFingerprint,actualRasterDigest:png.sha256,status:r.status,reviewAuthority:r.reviewAuthority}
})
for(const r of [...eight,...currentFour])assert.equal(stableGoalBookJson(r.profile),stableGoalBookJson(originalP.find(o=>o.goalId===r.goalId).profile))
const material=read('science/whole12-current-V3-materials.exact.json'),source=read('sources/whole16-duties113-partners41-bodies.exact.json')
assert.equal(material.goals.length,12);assert.equal(source.length,16);assert.equal(source.reduce((s:number,r:any)=>s+r.allOriginalPartnerRows.length,0),113);assert.equal(new Set(source.flatMap((r:any)=>r.wholeCurrentCanonicalPartners.map((g:any)=>g.id))).size,41)
const safeOrder=after.model.pages.map(p=>p.goalId).filter(id=>ids.includes(id))
put('native/four-current-P.prerequisite-safe.batch.config.json',{$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId:'biologie-four-risk-ethics-current-native-20261010-v1',subject:'biologie',subjectLabel:'Biologie',bookId:'biologie-four-risk-ethics-current-native-20261010-v1',title:'Biologie – vier aktuelle Risiko-, Genetik- und Ethik-Prüfseiten',baseGoalBookConfigPath:`${P}/native/after394-current-four.normal.config.json`,goalIds:safeOrder,outputDirectory:`${P}/native/four-current-P`,feedbackBaseUrl:'https://skillpilot.com/feedback',promptPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',criteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md',publicRoot:'app/public',printDerivativeProfile:'standard'})
const delta=pageDelta.map(id=>({goalId:id,changedWholePageFields:[...new Set([...Object.keys(bp.get(id)),...Object.keys(ap.get(id))])].filter(k=>stableGoalBookJson(bp.get(id)[k]??null)!==stableGoalBookJson(ap.get(id)[k]??null)),beforePageFingerprint:bp.get(id).pageFingerprint,afterPageFingerprint:ap.get(id).pageFingerprint,beforeRequires:bp.get(id).requires,afterRequires:ap.get(id).requires,beforeReverseRequires:bp.get(id).reverseRequires,afterReverseRequires:ap.get(id).reverseRequires,beforeExternalReverseRequires:bp.get(id).externalReverseRequires,afterExternalReverseRequires:ap.get(id).externalReverseRequires}))
put('checks/actual-whole394-four-resource-P-and-protected315-plus-eight-delta.json',{schemaVersion:1,checkedAt:new Date().toISOString(),actualNormalAPIs:['loadGoalBookBuildInputs','stableGoalBookJson','fingerprintSemanticKindSourceGoal'],beforeModelDigest:before.model.digest,afterModelDigest:after.model.digest,whole479IDsExact:true,whole394IDsExact:true,goalDeltaIds:goalDelta,changedWholePageIds:pageDelta,wholePageDeltas:delta,all479SemanticSourceFingerprintsExact:true,onlyFourResourceLinksChanged:true,protected315GoalPageDeltaIds:[],additionalEightGoalPageDeltaIds:[],protectedComparisonUnion323IDs:protectionUnion,additionalEightAreOnlyComparisonProtectionNotInferredStrictClaims:true,all12ProfileScientificBodiesExact:true,eightCurrentPRawRecordsExact:true,whole16Duties113Edges41BodiesRetained:true,currentFourBindings:bindings,normalPrerequisiteSafeNativeOrder:safeOrder,newNativeIndependentDOrPReviews:0,newVisualVerdictsByThisAuthor:0,wholeSourceOrCourseApproval:false,humanApproval:false,activeWrites:false,strictGain:0})
console.log(JSON.stringify({wholeModels:'394→394',normalPrerequisiteSafeNativeOrder:safeOrder,actualChangedWholePages:pageDelta,protected315Exact:true,additionalEightExact:true,all12ScientificProfilesExact:true,newStrictGain:0},null,2))
