import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'
const root=resolve('.')
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'chemie-current-atomic-description-positive-gap-author-v2'
const old=base+'chemie-current-atomic-description-positive-gap-author-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const bind=(p:string)=>({path:p,sha256:sha(p),bytes:readFileSync(resolve(root,p)).length})
const write=(n:string,v:unknown)=>writeFileSync(resolve(root,own,n),JSON.stringify(v,null,2)+'\n')
const beforeFreeze=read(old+'/description-positive-gap-author-v1.final.freeze.json')
for(const b of beforeFreeze.files)assert.equal(sha(b.path),b.sha256)
const canonical=read(own+'/prospective-current378.canonical.author-candidate.json')
const goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
const specs=read(own+'/fifteen-positive-profile-specifications.author-corrections.candidate.json')
const materials=read(own+'/thirty-complete-materials.de-en.author-corrections.candidate.json')
const resourceRows=read(own+'/prospective-canonical-and-resource-binding.author.json').rows
const sourceRecords=readFileSync(resolve(root,old,'positive-evidence.fifteen.author-candidates.review.jsonl'),'utf8').trim().split('\n').map(line=>JSON.parse(line))
const oldById=new Map<string,any>(sourceRecords.map(r=>[r.goalId,r]))
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
const criteriaFingerprint=sha(criteriaPath)
const require=createRequire(resolve(root,'app/package.json'))
const Ajv=require('ajv/dist/2020').default, addFormats=require('ajv-formats').default
const ajv=new Ajv({allErrors:true,strict:true});addFormats(ajv)
const recordSchema=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const configSchema=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
const rows:any[]=[],records:any[]=[]
for(const spec of specs.goals){
 const goal=goals.get(spec.goalId), original=oldById.get(spec.goalId)
 const resources=resourceRows.filter((r:any)=>r.goalId===spec.goalId)
 const resourceDigests:Record<string,string>=Object.fromEntries(resources.map((r:any)=>[r.prospectiveResourceURL,r.actualRaster.sha256]))
 for(const r of resources)assert.equal(sha(r.actualRaster.path),r.actualRaster.sha256)
 const record={...structuredClone(original),reviewId:specs.reviewId,reviewedAt:specs.reviewedAt,reviewer:specs.reviewer,profile:spec.profile,reason:spec.reason,dissent:spec.dissent??[],goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFingerprint,resourceDigests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(spec.profile)}
 assert.equal(record.reviewCriteriaFingerprint,criteriaFingerprint)
 assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.deepEqual(record.reviewRunIds,[])
 assert.ok(recordSchema(record),ajv.errorsText(recordSchema.errors))
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record,goal,resourceDigests,'curricularAtomic');assert.deepEqual(semanticErrors,[])
 const cases=materials.materials.filter((c:any)=>c.goalId===spec.goalId);assert.equal(cases.length,2)
 for(const brief of record.profile.applicationCaseBriefs){
  const c=cases.find((c:any)=>c.caseId===brief.id);assert.ok(c)
  for(const lang of ['de','en']){const suffix=lang[0].toUpperCase()+lang.slice(1);assert.equal(brief['taskDemand'+suffix],c.material[lang]+' '+c.taskDemand[lang]);assert.equal(brief['expectedPerformance'+suffix],c.expectedPerformance[lang]);assert.equal(brief['understandingFocus'+suffix],c.specificBoundaryOrCounterexample[lang])}
 }
 records.push(record)
 rows.push({goalId:spec.goalId,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,goalFingerprintSameAsV1:record.goalFingerprint===original.goalFingerprint,reviewInputFingerprintSameAsV1:record.reviewInputFingerprint===original.reviewInputFingerprint,profileFingerprintSameAsV1:record.profileFingerprint===original.profileFingerprint,exactActualResources:resources,caseIds:cases.map((c:any)=>c.caseId),closedNativeRecordSchema:'PASS',nativePureRecordSemantics:'PASS',status:record.status,reviewAuthority:record.reviewAuthority,fullCurrentActiveBinding:resources.every((r:any)=>r.activeAtProspectiveURL)?'PROSPECTIVE_TEXT_BINDING_ONLY':'HOLD_INACTIVE_NEW_PNG'})
}
const config={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:specs.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:canonical.landscapeId,landscapePath:own+'/prospective-current378.canonical.author-candidate.json',semanticKindLedgerPath:'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',reviewCriteriaPath:criteriaPath,reviewPath:own+'/positive-evidence.fifteen.prospective.author-candidates.review.jsonl',reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Inactive prospective fifteen existing atoms after narrow text/material corrections and two generated unapproved PNGs; no current native D/P completion',goalIds:specs.goals.map((s:any)=>s.goalId)}}
assert.ok(configSchema(config),ajv.errorsText(configSchema.errors))
writeFileSync(resolve(root,config.reviewPath),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
write('positive-evidence.fifteen.prospective.author-candidates.config.json',config)
let actualMaterializer:any
try{await buildPositiveGoalEvidenceCandidateRecords({config:config as any,candidateSet:specs});actualMaterializer={status:'UNEXPECTED_PASS'}}catch(e){actualMaterializer={status:'HOLD_INACTIVE_NEW_PNG',actualError:String(e)}}
assert.equal(actualMaterializer.status,'HOLD_INACTIVE_NEW_PNG')
assert.match(actualMaterializer.actualError,/goal-visualization asset is missing/u)
assert.match(actualMaterializer.actualError,/b8d3b453.*\.png/u)
let actualFullChecker:any
try{actualFullChecker=reviewPositiveGoalEvidenceConfig(own+'/positive-evidence.fifteen.prospective.author-candidates.config.json')}catch(e){actualFullChecker={thrownActualError:String(e)}}
assert(actualFullChecker.errors?.length||actualFullChecker.thrownActualError)
write('native-fifteen-prospective-schema-material-binding-checks.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR closed native contracts and pure production fingerprints/semantics on exact prospective inputs; actual full native materializer/checker hold honestly recorded',currentKindClassificationUsed:'The actual current authoritative ID-to-kind ledger is used only to identify already-existing curricularAtomic IDs; three changed text source fingerprints are not rebound or counted as newly approved atomarity.',immutableV1:bind(old+'/description-positive-gap-author-v1.final.freeze.json'),exactProspectiveCanonical:bind(config.landscapePath),actualMaterialSpecs:bind(own+'/thirty-complete-materials.de-en.author-corrections.candidate.json'),actualProfileSpecs:bind(own+'/fifteen-positive-profile-specifications.author-corrections.candidate.json'),nativeHelperBindings:['app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceReview.ts'].map(bind),closedNativeRecordSchema:'PASS15',closedNativeConfigSchema:'PASS',nativePureRecordSemantics:'PASS15',actualCompleteMaterialBodies:30,actualCompleteProfiles:15,rows,actualUnmodifiedProductionMaterializer:actualMaterializer,actualUnmodifiedFullProfileChecker:{errors:actualFullChecker.errors,counts:actualFullChecker.counts,actualRecordCount:actualFullChecker.records?.length??null,thrownActualError:actualFullChecker.thrownActualError},fullNativeCurrentBinding:'HOLD: generated prospective PNGs are deliberately absent from active app/public; full native current P integration not passed',independentScienceApproval:false,humanApproval:false,humanTrial:false,actualLearnerEvidence:false,newScientificClosures:0,restoredActiveBindings:0,strictNetGain:0,activeWrites:false})
console.log(JSON.stringify({actualProfiles:15,closedNativeRecordSchema:'PASS15',pureNativeSemantics:'PASS15',actualMaterializer:actualMaterializer.status,actualFullCheckerErrorCount:actualFullChecker.errors?.length??null,changedGoalFingerprints:rows.filter(r=>!r.goalFingerprintSameAsV1).map(r=>r.goalId),changedInputFingerprints:rows.filter(r=>!r.reviewInputFingerprintSameAsV1).map(r=>r.goalId),changedProfiles:rows.filter(r=>!r.profileFingerprintSameAsV1).map(r=>r.goalId),independentApproval:false,strictNetGain:0}))
