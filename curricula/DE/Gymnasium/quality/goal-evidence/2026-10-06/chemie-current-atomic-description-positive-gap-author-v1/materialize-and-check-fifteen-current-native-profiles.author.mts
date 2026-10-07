import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const root=resolve('.')
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-atomic-description-positive-gap-author-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const bind=(p:string)=>({path:p,sha256:sha(p),bytes:readFileSync(resolve(root,p)).length})
const write=(n:string,v:unknown)=>writeFileSync(resolve(root,own,n),JSON.stringify(v,null,2)+'\n')
const dFreeze=read(own+'/native-d-stage-v1.final.freeze.json')
for(const b of dFreeze.files)assert.equal(sha(b.path),b.sha256,'Frozen D-stage drift '+b.path)
const scope=read(own+'/current-amv-gap-and-selected-fifteen.author-readiness.json')
const specs=read(own+'/fifteen-positive-profile-specifications.author-candidates.json')
const materials=read(own+'/thirty-complete-materials.de-en.author-candidates.json')
const currentSubject=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects.find((s:any)=>s.subject==='chemie')
const currentCanon=read(currentSubject.landscapePath)
const goals=new Map(currentCanon.goals.map((g:any)=>[g.id,g]))
for(const r of scope.rows)assert.deepEqual(goals.get(r.goalId),r.wholeCurrentGoal)
assert.deepEqual(specs.goals.map((g:any)=>g.goalId),scope.scopeGoalIds)
const config={ $schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:specs.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1' as const,profileRuleVersion:'positive-understanding-evidence-v2' as const,landscapeId:currentCanon.landscapeId,landscapePath:currentSubject.landscapePath,semanticKindLedgerPath:currentSubject.semanticKindLedgerPath,reviewCriteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath:own+'/positive-evidence.fifteen.author-candidates.review.jsonl',reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'] as Array<'goal-visualization'>,requireApproved:false,scope:{label:'Fifteen unchanged current A/M/V-green organic structure/reaction atoms; author P candidates, independent review pending',goalIds:scope.scopeGoalIds}}
const records=await buildPositiveGoalEvidenceCandidateRecords({config:config as any,candidateSet:specs})
assert.equal(records.length,15)
const req=createRequire(resolve(root,'app/package.json'))
const Ajv=req('ajv/dist/2020').default;const addFormats=req('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const validateRecord=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validateConfig=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
assert.ok(validateConfig(config),ajv.errorsText(validateConfig.errors))
const rows=records.map(r=>{
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[])
 assert.ok(validateRecord(r),ajv.errorsText(validateRecord.errors))
 const goal:any=goals.get(r.goalId)!
 const resourceDigests:Record<string,string>={}
 const assets=(goal.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>{const path='app/public'+l.url;resourceDigests[l.url]=sha(path);return bind(path)})
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,resourceDigests,'curricularAtomic'),[])
 const cases=materials.materials.filter((m:any)=>m.goalId===r.goalId)
 assert.equal(cases.length,2);assert.deepEqual(r.profile.applicationCaseBriefs.map(c=>c.id),cases.map((c:any)=>c.caseId))
 for(const [i,c] of cases.entries()){
 const brief=r.profile.applicationCaseBriefs[i]
 assert.equal(brief.taskDemandDe,c.material.de+' '+c.taskDemand.de);assert.equal(brief.taskDemandEn,c.material.en+' '+c.taskDemand.en)
 assert.equal(brief.expectedPerformanceDe,c.expectedPerformance.de);assert.equal(brief.expectedPerformanceEn,c.expectedPerformance.en)
 assert.equal(brief.understandingFocusDe,c.specificBoundaryOrCounterexample.de);assert.equal(brief.understandingFocusEn,c.specificBoundaryOrCounterexample.en)
 }
 return {goalId:r.goalId,title:goal.title,titleEn:goal.titleEn,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,reviewCriteriaFingerprint:r.reviewCriteriaFingerprint,currentWholeGoalExact:true,actualAssetBindings:assets,resourceDigests,caseIds:cases.map((c:any)=>c.caseId),closedNativeRecordSchema:'PASS',nativeRecordSemantics:'PASS',authority:r.reviewAuthority,status:r.status,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,independentScientificApproval:false}
})
writeFileSync(resolve(root,config.reviewPath),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
write('positive-evidence.fifteen.author-candidates.config.json',config)
const result=reviewPositiveGoalEvidenceConfig(own+'/positive-evidence.fifteen.author-candidates.config.json')
assert.deepEqual(result.errors,[]);assert.deepEqual(result.counts,{approved:0,needsHumanReview:15,rejected:0})
write('native-fifteen-current-positive-schema-material-binding-checks.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR actual production materializer/schema/semantics/resource-binding checks; not independent P approval',immutableDStageFreeze:bind(own+'/native-d-stage-v1.final.freeze.json'),nativeHelpers:['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts'].map(bind),nativeSchema:bind('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),nativeConfigSchema:bind('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'),nativeCriteria:bind(config.reviewCriteriaPath),actualMaterials:bind(own+'/thirty-complete-materials.de-en.author-candidates.json'),actualProfileSpecifications:bind(own+'/fifteen-positive-profile-specifications.author-candidates.json'),actualCurrentCanonical:bind(currentSubject.landscapePath),actualCurrentKinds:bind(currentSubject.semanticKindLedgerPath),nativeMaterializer:'PASS15',nativeFullProfileChecker:'PASS15',nativeCheckerErrors:result.errors,nativeCheckerCounts:result.counts,actualMaterialBodies:30,rows,independentDescriptionReviews:'PENDING_SEPARATE_D_STAGE',independentMaterialAndProfileReviews:'PENDING_TWO_INDEPENDENT_ROLES',actualLearnerEvidence:false,humanApproval:false,humanTrial:false,strictNetGain:0,newScientificClosures:0,restoredActiveBindings:0,activeWrites:false})
console.log(JSON.stringify({actualProfiles:15,actualMaterials:30,nativeMaterializer:'PASS',nativeFullChecker:'PASS',counts:result.counts,independentReview:false,strictNetGain:0}))
