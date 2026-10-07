// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,positiveGoalEvidenceReviewInputPayload,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {reviewPositiveGoalEvidenceConfig} from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..'), rel=own.slice(root.length+1),id='ac9e824f-003c-50ac-8751-2b8456004c63'
const oldBase='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-image-user-correction-independent-a-v1/'
const sourceBase='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1/'
const visualBase='curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-carrier-hidden-continuity-independent-a-v3/v5-final/'
const inputs=new Map<string,any>()
const bytes=(p:string)=>{const b=readFileSync(resolve(root,p));inputs.set(p,{path:p,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length});return b}
const read=(p:string)=>JSON.parse(bytes(p).toString('utf8'))
const hash=(p:string)=>{bytes(p);return inputs.get(p).sha256}
const write=(p:string,v:any)=>writeFileSync(resolve(own,p),JSON.stringify(v,null,2)+'\n')
const stamp=new Date().toISOString(),config=read(oldBase+'positive.one.independent-a.candidate.config.json'),old=JSON.parse(bytes(config.reviewPath).toString('utf8'))
const canonical=read(config.landscapePath),goal=canonical.goals.find((g:any)=>g.id===id)
assert.equal(old.goalId,id)
const activeV=read('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json').records.find((r:any)=>r.goalId===id)
const reviewedV=read(visualBase+'single-native-v-record.v5-candidate.json')
assert.deepEqual(activeV,reviewedV)
const candidate='curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-carrier-hidden-continuity-and-length-author-20261006-v3/carrier-v5.candidate.png'
const currentSha=hash(candidate)
assert.equal(currentSha,'sha256:4e543bef5d79f11dc6866bdd7607f915e1343da5014881f0213b6e7bf8210ede')
const backend='backend/src/main/resources/static/assets/goal-visualizations/biologie/'+id+'/'+id+'.png'
assert.equal(hash(activeV.publicAssetPath),currentSha);assert.equal(hash(activeV.canonicalAssetPath),currentSha);assert.equal(hash(backend),currentSha)
assert.equal(hash(visualBase+'independent-v5-a.v-stage.final.freeze.json'),'sha256:844baf65f6476b5f27280cfb58ab2d47ad422cb0a0c1e570548dbd0b6578ae5f')
const previous=read(oldBase+'carrier-goal-profile-materials-and-current-resource-payload.actual.json');assert.deepEqual(previous.currentWholeGoal,goal)
const manifest=read(sourceBase+'inputs/positive-review-inputs.native-fingerprints.pending.json')
const material=read(manifest.sourceMaterial.path);assert.equal(hash(manifest.sourceMaterial.path),manifest.sourceMaterial.sha256)
const row=manifest.rows.find((r:any)=>r.goalId===id)
const currentCases=row.currentSourceCaseBodies.map((entry:any)=>{let actual=material;for(const part of entry.JSONPointer.split('/').slice(1))actual=actual[part];assert.deepEqual(actual,entry.caseBody);return {JSONPointer:entry.JSONPointer,completeCaseBody:actual,exactValidOwnPriorCaseBodyReused:true}})
assert.equal(currentCases.length,2);assert.deepEqual(currentCases.map((r:any)=>r.completeCaseBody.caseId),['classical-carriers-a','classical-carriers-b'])
const priorAuthor='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-positive-author-v1/positive-evidence.seven.author-candidates.review.jsonl'
const authored=bytes(priorAuthor).toString('utf8').trim().split('\n').map((s:string)=>JSON.parse(s)).find((r:any)=>r.goalId===id)
assert.deepEqual(authored.profile,old.profile)
const primary=goal.resourceLinks.filter((r:any)=>r.type==='goal-visualization'&&r.role==='primary');assert.equal(primary.length,1);assert.equal(primary[0].url,activeV.imageUrl)
const record=structuredClone(old);record.reviewId='biologie-q1-carrier-hidden-continuity-native-d-independent-a-v3';record.reviewedAt=stamp;record.reviewer='Codex independent targeted final-v5 carrier P reviewer A; author role absent; new peer D/P not read'
record.reason='KEEP after independent substantive actual final-v5 native/360/680 image review: two continuous backbone curves, correct hidden tangent continuations and paired rods; the longer bracket denotes a DNA section, not a separate molecule, and stark verkürzt states the non-scale depiction. Rod chromosome and internal chromatin zoom support the same carrier/material/section relationship as the unchanged profile. Both complete fictional material cards and exact profile are valid own-prior-A reuse; the fresh second supplied variant model tests transfer without demanding a new allele/inheritance competence. Current complete goal/resource link/alttext is byte-equivalent as data to that prior independently checked input; only actual PNG bytes changed. The image supplies orientation, not learner performance. Final native D page and source/course applicability bindings are separately required; no historical unreviewed context is approved by changing a hash. E1/G1 ai_candidate/needs_human_review; no human or performed-experiment evidence.'
record.goalFingerprint=fingerprintGoalForPositiveEvidence(goal,'curricularAtomic');record.reviewCriteriaFingerprint=hash(config.reviewCriteriaPath)
const resources={[primary[0].url]:currentSha}
record.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,resources,'curricularAtomic');record.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(record.profile)
assert.equal(record.goalFingerprint,old.goalFingerprint);assert.equal(record.profileFingerprint,old.profileFingerprint);assert.notEqual(record.reviewInputFingerprint,old.reviewInputFingerprint)
assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1');assert.equal(record.reviewRunIds.length,0);assert.equal(record.dissent.length,0)
const errors=validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic');assert.deepEqual(errors,[])
const require=createRequire(resolve(root,'app/package.json')),Ajv=require('ajv/dist/2020').default,addFormats=require('ajv-formats').default,ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const validateRecord=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));assert.ok(validateRecord(record),ajv.errorsText(validateRecord.errors))
const one=structuredClone(config);one.reviewId=record.reviewId;one.reviewPath=rel+'/positive.one.independent-a.current.review.jsonl';one.scope={label:'Only imported actual carrier-v5 image; valid unchanged exact scientific profile/material reuse; separate final native D page/source/context gate',goalIds:[id]}
const validateConfig=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'));assert.ok(validateConfig(one),ajv.errorsText(validateConfig.errors))
writeFileSync(resolve(own,'positive.one.independent-a.current.review.jsonl'),JSON.stringify(record)+'\n');write('positive.one.independent-a.current.config.json',one)
const native=reviewPositiveGoalEvidenceConfig(rel+'/positive.one.independent-a.current.config.json');assert.deepEqual(native.errors,[])
write('actual-one-positive-final-v5.verification.json',{schemaVersion:1,createdAtUTC:stamp,goalId:id,currentWholeGoal:goal,fullUnchangedMaterials:currentCases,exactPriorProfile:record.profile,currentReviewInputPayload:positiveGoalEvidenceReviewInputPayload(goal,record.reviewCriteriaFingerprint,resources,'curricularAtomic'),nativeCurrentPFingerprints:{goal:record.goalFingerprint,profile:record.profileFingerprint,reviewInput:record.reviewInputFingerprint,criteria:record.reviewCriteriaFingerprint},nativeClosedSchemas:'PASS',nativeCandidateSemantics:'PASS',nativeActualCurrentOnePChecker:{status:'PASS',errors:native.errors,counts:native.counts},actual3AssetCopiesExact:true,currentVRowExactIndependentFinalV5:true,status:record.status,reviewAuthority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,finalNativeD:'PENDING_NEW_ACTUAL_PAGE',nativeGUISuperset:'SEPARATE_REQUIRED_GATE',activeWrites:false,strictNetGain:0,humanApproval:false,humanTrial:false,learnerEvidence:false})
write('actual-positive-bound-inputs.pre-d-freeze.json',{schemaVersion:1,createdAtUTC:stamp,inputs:[...inputs.values()],globalNineteenInputEqualityNotClaimed:true})
console.log(JSON.stringify({nativeP:'PASS_ONE_CURRENT',goal:record.goalFingerprint,profile:record.profileFingerprint,reviewInput:record.reviewInputFingerprint,nativeD:'PENDING_FINAL_PAGE',strictNetGain:0}))
