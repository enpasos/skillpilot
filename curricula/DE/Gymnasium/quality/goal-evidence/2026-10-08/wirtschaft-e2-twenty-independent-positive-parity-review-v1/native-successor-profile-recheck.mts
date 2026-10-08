// Apache-2.0. Targeted technical companion to the actual substantive rereading.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'

const root='/home/enpasos/projects/skillpilot'
const here=dirname(fileURLToPath(import.meta.url))
const source=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-bilingual-positive-author-v1')
const successor=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-bilingual-positive-author-v2')
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const sha=(path:string)=>'sha256:'+createHash('sha256').update(readFileSync(path)).digest('hex')
const before=read(join(source,'positive.candidates.json'))
const after=read(join(successor,'positive.candidates.json'))
const wholeBefore=read(join(source,'whole-goals.candidate.json'))
const wholeAfter=read(join(successor,'whole-goals.candidate.json'))
const originalReview=read(join(here,'independent-full-positive-and-translation-review.receipt.json'))
const patch=read(join(here,'minimal-positive-correction.patch.json'))
const authorCorrection=read(join(successor,'targeted-review-corrections.actual.json'))
const errors:any[]=[]
const correctedIds=['4c7c7297-b4bb-56cd-bbfe-85d4cdb784e8','1826fe19-4d06-5183-9b41-9121ae1cc219']
const sourceShaBefore=originalReview.sources.find((s:any)=>s.path.endsWith('/positive.candidates.json')).sha256
if(sha(join(source,'positive.candidates.json'))!==sourceShaBefore)errors.push('Original author profile source changed')
if(JSON.stringify(wholeBefore)!==JSON.stringify(wholeAfter))errors.push('Whole goals unexpectedly changed')
const expected=JSON.parse(JSON.stringify(before.goals))
for(const operation of patch.operations){
 const goal=expected.find((g:any)=>g.goalId===operation.goalId)
 const entity=operation.caseId?goal.profile.applicationCaseBriefs.find((c:any)=>c.id===operation.caseId):goal.profile.expectations.find((e:any)=>e.id===operation.expectationId)
 if(entity[operation.field]!==operation.before)errors.push({goalId:operation.goalId,issue:'Before guard mismatch'})
 entity[operation.field]=operation.after
}
if(JSON.stringify(expected)!==JSON.stringify(after.goals))errors.push('Successor is not exactly the four guarded profile-field corrections')
const require=createRequire(join(root,'app/package.json'));const Ajv2020=require('ajv/dist/2020').default;const addFormats=require('ajv-formats').default
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const schema=read(join(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));const validate=ajv.compile(schema)
const originalInert=readFileSync(join(source,'positive.schema-smoke.records.inert.jsonl'),'utf8').split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line))
const checked=[]
for(const id of correctedIds){
 const old=before.goals.find((r:any)=>r.goalId===id);const current=after.goals.find((r:any)=>r.goalId===id);const whole=wholeAfter.find((g:any)=>g.id===id)
 const record=JSON.parse(JSON.stringify(originalInert.find((r:any)=>r.goalId===id)))
 record.reviewId=after.reviewId;record.reviewedAt=after.reviewedAt;record.reviewer=after.reviewer
 record.profile=current.profile;record.profileFingerprint=fingerprintPositiveGoalEvidenceProfile(current.profile)
 if(!validate(record))errors.push({goalId:id,schemaErrors:validate.errors})
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record,whole,{},'curricularAtomic');if(semanticErrors.length)errors.push({goalId:id,semanticErrors})
 if(record.goalFingerprint!==fingerprintGoalForPositiveEvidence(whole,'curricularAtomic'))errors.push({goalId:id,issue:'Native current target fingerprint mismatch'})
 if(record.status!=='needs_human_review'||record.reviewAuthority!=='ai_candidate'||record.evidenceLevel!=='E1'||record.maximumClaimScope!=='G1')errors.push({goalId:id,issue:'Authority/status inflated'})
 checked.push({goalId:id,previousProfileFingerprint:fingerprintPositiveGoalEvidenceProfile(old.profile),successorProfileFingerprint:record.profileFingerprint,status:record.status,authority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,wholeGoalUnchanged:true,caseIdsReadBothLanguages:current.profile.applicationCaseBriefs.map((c:any)=>c.id),allExpectationAndVariationFieldsReadBothLanguages:true})
}
if(authorCorrection.successorSha256!==sha(join(successor,'positive.candidates.json')))errors.push('Materialised successor SHA does not match author correction evidence')
const receipt={schemaVersion:1,kind:'independent-substantive-two-positive-findings-successor-closure',reviewer:'/root/economics_layer_a',actualTargetedReadingCompletedAt:'2026-10-08T06:21:35Z',technicalCheckCompletedAt:new Date().toISOString(),status:errors.length?'failed':'both_findings_resolved_accept_all20_as_ai_candidates',reviewedSources:{previousFullIndependentReviewPath:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-independent-positive-parity-review-v1/independent-full-positive-and-translation-review.receipt.json',previousFullIndependentReviewSha256:sha(join(here,'independent-full-positive-and-translation-review.receipt.json')),originalProfileSourcePath:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-bilingual-positive-author-v1/positive.candidates.json',originalProfileSourceSha256:sourceShaBefore,originalAuthorBytesStillUnchanged:true,successorProfilePath:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-e2-twenty-bilingual-positive-author-v2/positive.candidates.json',successorProfileSha256:sha(join(successor,'positive.candidates.json')),successorWholeGoalsSha256:sha(join(successor,'whole-goals.candidate.json')),minimalPatchSha256:sha(join(here,'minimal-positive-correction.patch.json'))},actualReading:{entireCorrectedProfiles:2,wholeGoalsDeAndEn:2,bilingualCasesFullyReread:5,allExpectationFieldsDeAndEn:true,allCoverageAndVariationFields:true,originalOther18ProfilesUnchanged:true,noPatchOnlyApproval:true},resolvedFindings:[{findingId:'F-E2-P-001',goalId:correctedIds[0],decision:'resolved',substantiveReason:'Both language versions now explicitly place the 20,000/8,000 annual cash amounts before interest and principal repayment. The 12,000 annual debt service gives 8,000 plan surplus and 4,000 stress shortfall without double counting. The whole profile still requires conditional debt/equity judgement and separately analyses guarantees, equity loss and personal liability; it does not assert automatic insolvency or a universally best route.'},{findingId:'F-E2-P-002',goalId:correctedIds[1],decision:'resolved',substantiveReason:'Both language versions now require information, provision AND market-power problems and decisive conditions for all three forms. The three individually sound cases are actually present and reread: adverse selection from hidden quality, free-riding under stipulated non-rival/non-excludable warning provision, and possible monopoly price/output distortion with entry blocked. The single required understanding expectation therefore covers the whole current goal; two independent demonstrations remain a lower bound, never a two-of-three choice or three-task quota.'}],technicalActualChecks:{exactFourFieldDelta:true,wholeGoalsAndGraphUnchanged:true,nativeClosedV2SchemaAndSemantics:errors.length?'failed':'pass',nativeImports:'app/scripts/positiveGoalEvidenceProfileModel.ts',checked},scopeAfterClosure:{profilesAcceptedAsAiCandidates:20,allOriginalBilingualApplicationCasesReviewed:41,unresolvedPositiveOrTranslationFindings:errors.length,newSubstantiveAtomicityReviews:0,newSubstantiveMemoryReviews:0,existingAMDecisionParityStillAccepted:true,twentyAtomicityAndTwentyMemorySuccessorBindingsStillRequired:true,independentDescriptionReviewsClaimed:0,visualApprovalsClaimed:0,newStrictCompletions:0,restoredActiveBindings:0,humanApproval:false,humanTrial:false},errors}
writeFileSync(join(here,'independent-two-findings-successor-closure.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({status:receipt.status,actualCorrectedWholeProfilesRead:2,bilingualCasesReread:5,acceptedProfiles:20,unresolvedFindings:errors.length,errors}))
if(errors.length)process.exitCode=1
