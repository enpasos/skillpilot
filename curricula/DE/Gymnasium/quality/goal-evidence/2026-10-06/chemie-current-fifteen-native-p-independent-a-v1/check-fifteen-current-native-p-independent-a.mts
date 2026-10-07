import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root = resolve('.')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own = base + 'chemie-current-fifteen-native-p-independent-a-v1/'
const author = base + 'chemie-current-atomic-description-positive-gap-author-v1/'
const dOwn = base + 'chemie-current-fifteen-native-d-independent-a-v1/'
assert(!existsSync(resolve(root, own, 'independent-p-a.final.freeze.json')))
const read = (p: string): any => JSON.parse(readFileSync(resolve(root,p), 'utf8'))
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const bind = (p: string) => ({ path:p,sha256:sha(p),bytes:readFileSync(resolve(root,p)).length })
const write = (name:string,x:any) => writeFileSync(resolve(root,own,name),JSON.stringify(x,null,2)+'\n')
assert.equal(sha(dOwn+'native-fifteen-d-independent-a.final.freeze.json'),'sha256:1879d77be72d36ad7d2db7548987ab4ae4f5d76f78ef82657581ba9a29026af4')
for(const b of read(dOwn+'native-fifteen-d-independent-a.final.freeze.json').files) assert.equal(sha(b.path),b.sha256,'Own historical D artifact changed: '+b.path)
const authorFreeze = read(author+'description-positive-gap-author-v1.final.freeze.json')
assert.equal(sha(author+'description-positive-gap-author-v1.final.freeze.json'),'sha256:bfa6a010a5216ca0caec371a2d7b826406a73fcaf00b0f5bf41be7527082eb14')
for(const b of authorFreeze.files){assert.equal(sha(b.path),b.sha256,'Author freeze file changed: '+b.path);assert.equal(readFileSync(resolve(root,b.path)).length,b.bytes)}
const dFreeze=read(author+'native-d-stage-v1.final.freeze.json')
for(const b of dFreeze.externalNativeInputBindings)assert.equal(sha(b.path),b.sha256,'External current native input changed: '+b.path)
const configPath=author+'positive-evidence.fifteen.author-candidates.config.json'
const config=read(configPath), current=read(config.landscapePath), kinds=read(config.semanticKindLedgerPath)
const goals=new Map(current.goals.map((g:any)=>[g.id,g]))
const kindMap=new Map(kinds.decisions.filter((k:any)=>k.decisionStatus==='authoritative').map((k:any)=>[k.goalId,k.semanticKind]))
const actualBefore=read(author+'current-amv-gap-and-selected-fifteen.author-readiness.json')
const records=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(l=>JSON.parse(l))
const materials=read(author+'thirty-complete-materials.de-en.author-candidates.json').materials
const specifications=read(author+'fifteen-positive-profile-specifications.author-candidates.json')
const science=read(own+'fifteen-actual-profiles.scientific-review.independent-a.json')
assert.equal(records.length,15);assert.equal(materials.length,30)
assert.deepEqual(records.map(r=>r.goalId),config.scope.goalIds)
const require=createRequire(resolve(root,'app/package.json')), Ajv=require('ajv/dist/2020').default, addFormats=require('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const recordSchema='contracts/goal-evidence/v2/goal-evidence-profile.schema.json', configSchema='contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'
const validateRecord=ajv.compile(read(recordSchema)),validateConfig=ajv.compile(read(configSchema))
assert(validateConfig(config),ajv.errorsText(validateConfig.errors))
const criteriaFP=sha(config.reviewCriteriaPath)
const rows=records.map((r:any,i:number)=>{
 const goal:any=goals.get(r.goalId), before=actualBefore.rows.find((g:any)=>g.goalId===r.goalId)
 assert.deepEqual(goal,before.wholeCurrentGoal);assert.equal(kindMap.get(r.goalId),'curricularAtomic')
 assert(validateRecord(r),ajv.errorsText(validateRecord.errors))
 const resources:Record<string,string>={}
 const images=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization').map((l:any)=>{const path='app/public'+l.url;resources[l.url]=sha(path);return {...bind(path),actualFileExtension:extname(path).toLowerCase(),url:l.url,altText:l.altText??null}})
 assert.equal(r.goalFingerprint,fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'))
 assert.equal(r.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFP,resources,'curricularAtomic'))
 assert.equal(r.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(r.profile));assert.equal(r.reviewCriteriaFingerprint,criteriaFP)
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,resources,'curricularAtomic'),[])
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[])
 assert.deepEqual(r.profile,specifications.goals[i].profile)
 const cases=materials.filter((m:any)=>m.goalId===r.goalId);assert.equal(cases.length,2)
 const exactCases=cases.map((c:any,j:number)=>{
  const brief=r.profile.applicationCaseBriefs[j]
  assert.equal(brief.id,c.caseId)
  assert.equal(brief.taskDemandDe,c.material.de+' '+c.taskDemand.de);assert.equal(brief.taskDemandEn,c.material.en+' '+c.taskDemand.en)
  assert.equal(brief.expectedPerformanceDe,c.expectedPerformance.de);assert.equal(brief.expectedPerformanceEn,c.expectedPerformance.en)
  assert.equal(brief.understandingFocusDe,c.specificBoundaryOrCounterexample.de);assert.equal(brief.understandingFocusEn,c.specificBoundaryOrCounterexample.en)
  assert.equal(c.empiricalLearnerEvidence,false);assert.equal(c.independentlyScientificallyReviewed,false);assert.equal(c.newScientificApproval,false)
  return {caseId:c.caseId,allSixNativeCaseTextFieldsExact:true,actualMaterialAndTaskIncluded:true,originalAuthorPendingStatusPreserved:true}
 })
 const judge=science.rows.find((s:any)=>s.goalId===r.goalId)
 return {goalId:r.goalId,closedNativeSchema:'PASS',nativeStructuralSemantics:'PASS',currentWholeGoalExact:true,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,reviewCriteriaFingerprint:r.reviewCriteriaFingerprint,actualImageBindings:images,exactCases,independentProfileScienceVerdict:judge.independentProfileScienceVerdict,scientificVerdictNotGrantedBySchemaPASS:true,status:r.status,authority:r.reviewAuthority,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope}
})
const fullAuthor=reviewPositiveGoalEvidenceConfig(configPath);assert.deepEqual(fullAuthor.errors,[]);assert.deepEqual(fullAuthor.counts,{approved:0,needsHumanReview:15,rejected:0})
const rematerialized=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:specifications});assert.deepEqual(rematerialized,records)

// Prepare only the seven independently science-kept and currently D-A-KEEP
// profiles as isolated native candidates. All 15 original authors remain intact.
const selected=science.currentlyIntegrationScienceSubsetIds
assert.equal(selected.length,7)
const keptConfig={...config,reviewId:'chemie-current-seven-native-positive-independent-a-20261006-v1',reviewPath:own+'positive-evidence.seven.science-kept-candidates.review.jsonl',scope:{label:'Independent P-A seven unchanged science-kept profiles; D/P-B and central integration pending; AI candidate only',goalIds:selected}}
assert(validateConfig(keptConfig),ajv.errorsText(validateConfig.errors))
const candidateSet={...specifications,reviewId:keptConfig.reviewId,reviewedAt:new Date().toISOString(),reviewer:'codex-independent-native-positive-review-a',goals:selected.map((id:string)=>{
 const orig=specifications.goals.find((g:any)=>g.goalId===id), judgement=science.rows.find((s:any)=>s.goalId===id)
 return {...orig,reason:'Eigener unabhängiger P-A-Fachreview nach tatsächlichem Lesen aller DE/EN-Profilfelder, Aufgaben und Lösungen: '+judgement.independentRationale+' Aktuelle Goal-/Bild-/Kriterienbindungen technisch reproduziert; kein menschlicher Nachweis, keine tatsächliche Lernleistung, zweite unabhängige P-Runde und finale Integration stehen aus.',dissent:[]}
})}
const keptRecords=await buildPositiveGoalEvidenceCandidateRecords({config:keptConfig,candidateSet})
for(const r of keptRecords){const orig=records.find(a=>a.goalId===r.goalId);assert.deepEqual(r.profile,orig.profile);assert.equal(r.goalFingerprint,orig.goalFingerprint);assert.equal(r.reviewInputFingerprint,orig.reviewInputFingerprint);assert.equal(r.profileFingerprint,orig.profileFingerprint);assert(validateRecord(r),ajv.errorsText(validateRecord.errors))}
writeFileSync(resolve(root,keptConfig.reviewPath),keptRecords.map(r=>JSON.stringify(r)).join('\n')+'\n')
const keptConfigPath=own+'positive-evidence.seven.science-kept-candidates.config.json';write('positive-evidence.seven.science-kept-candidates.config.json',keptConfig)
const keptCheck=reviewPositiveGoalEvidenceConfig(keptConfigPath);assert.deepEqual(keptCheck.errors,[]);assert.deepEqual(keptCheck.counts,{approved:0,needsHumanReview:7,rejected:0})
write('native-schema-semantics-current-material-image-bindings.independent-a.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'Independent A technical reproduction supplementary to actual science review, no author assertions treated as approval',currentCanonical:bind(config.landscapePath),currentKinds:bind(config.semanticKindLedgerPath),authorFreeze:bind(author+'description-positive-gap-author-v1.final.freeze.json'),authorPRecords:bind(config.reviewPath),authorPConfig:bind(configPath),schema:bind(recordSchema),configSchema:bind(configSchema),criteria:bind(config.reviewCriteriaPath),productionHelpers:['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts'].map(bind),actualMaterials:bind(author+'thirty-complete-materials.de-en.author-candidates.json'),actualSpecifications:bind(author+'fifteen-positive-profile-specifications.author-candidates.json'),authorFreeze49Exact:true,currentDInputExternal104Exact:true,ownDStage63FilesUnchanged:true,rows,fullOriginalAuthorNativeChecker:{errors:fullAuthor.errors,counts:fullAuthor.counts},originalAuthorNativeMaterializer:'PASS15_EXACT_RECORD_OBJECT_EQUALITY',isolatedSevenScienceKeptNativeCandidates:{records:bind(keptConfig.reviewPath),config:bind(keptConfigPath),errors:keptCheck.errors,counts:keptCheck.counts,allSevenProfileBodiesAndAllCurrentFingerprintsExactlyReusedAfterActualScienceReview:true},newStrictClosures:0,newScientificClosures:0,restoredActiveBindings:0,humanApproval:false,humanTrial:false,actualLearnerEvidence:false,activeWrites:false,peerBRead:false,fullGUISupersetGatesProvedByThisCheck:false})
console.log(JSON.stringify({actualOriginalProfiles:15,actualCompleteBilingualCases:30,nativeAuthorChecker:'PASS15',nativeAuthorMaterializer:'PASS15_EXACT',scienceKEEP:9,scienceREVISE:6,isolatedSevenNativeCandidates:'PASS7',humanApproval:false,newStrictClosures:0}))
