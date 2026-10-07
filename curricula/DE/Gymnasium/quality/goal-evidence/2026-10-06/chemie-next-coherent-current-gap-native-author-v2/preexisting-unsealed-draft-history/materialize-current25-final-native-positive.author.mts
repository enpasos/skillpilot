/** AUTHOR preparation: run only after final seven selected PNGs and actual V inputs. */
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
const root=resolve('.'),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'chemie-next-coherent-current-gap-native-author-v2',v1=base+'chemie-next-coherent-current-gap-native-author-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex'),bind=(p:string)=>({path:p,sha256:sha(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const arg=process.argv.indexOf('--isolated-root');assert.ok(arg>=0,'Actual isolated root required; no active helper execution')
const isolated=resolve(process.argv[arg+1]),isolation=read(own+'/actual-final-input-native-isolation.author-receipt.json')
assert.equal(isolated,isolation.isolatedRootUsed)
assert.equal(isolation.finalSevenPNGInputsReady,true,'Four open inputs must be resolved before native P binds images')
const helpers=['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts']
for(const p of helpers)assert.equal(sha(readFileSync(resolve(isolated,p))),bind(p).sha256)
const {buildPositiveGoalEvidenceCandidateRecords}=await import(pathToFileURL(resolve(isolated,helpers[0])).href)
const {validatePositiveGoalEvidenceRecordSemantics}=await import(pathToFileURL(resolve(isolated,helpers[1])).href)
const {reviewPositiveGoalEvidenceConfig}=await import(pathToFileURL(resolve(isolated,helpers[2])).href)
const config=read(own+'/positive-evidence.twenty-five.final-native-author-candidates.config.json'),spec=read(own+'/twenty-five-positive-profile-specifications.author-candidates.json'),materials=read(own+'/fifty-complete-materials.de-en.author-candidates.json')
assert.equal(bind(own+'/twenty-five-positive-profile-specifications.author-candidates.json').sha256,bind(v1+'/twenty-five-positive-profile-specifications.author-candidates.json').sha256)
assert.equal(bind(own+'/fifty-complete-materials.de-en.author-candidates.json').sha256,bind(v1+'/fifty-complete-materials.de-en.author-candidates.json').sha256)
const goals=new Map<string,any>(read(config.landscapePath).goals.map((g:any)=>[g.id,g]))
const old=readFileSync(resolve(root,v1,'positive-evidence.twenty-five.author-candidates.review.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l)),byID=new Map<string,any>(old.map(r=>[r.goalId,r]))
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:spec});assert.equal(records.length,25)
const req=createRequire(resolve(root,'app/package.json')),Ajv=req('ajv/dist/2020').default,formats=req('ajv-formats').default,ajv=new Ajv({strict:true,allErrors:true});formats(ajv)
const rs=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),cs=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'));assert.ok(cs(config),ajv.errorsText(cs.errors))
const expectedChanged=new Set<string>(isolation.finalSevenPNGInputs.map((r:any)=>r.goalId));expectedChanged.add('3bc48951-025c-5144-99b1-924db611a5f9');assert.equal(expectedChanged.size,8)
const rows=records.map((r:any)=>{const previous=byID.get(r.goalId),goal=goals.get(r.goalId);assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[]);assert.ok(rs(r),ajv.errorsText(rs.errors))
 assert.deepEqual(r.profile,previous.profile);assert.equal(r.profileFingerprint,previous.profileFingerprint);assert.equal(r.reviewCriteriaFingerprint,previous.reviewCriteriaFingerprint)
 const digests:Record<string,string>={};const assets=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization').map((l:any)=>{const path='app/public'+l.url;const b=readFileSync(resolve(isolated,path));digests[l.url]=sha(b);return{url:l.url,isolatedRelativePath:path,sha256:sha(b),bytes:b.length}})
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,digests,'curricularAtomic'),[])
 const cases=materials.materials.filter((m:any)=>m.goalId===r.goalId);assert.equal(cases.length,2)
 for(const c of cases){const brief=r.profile.applicationCaseBriefs.find((b:any)=>b.id===c.caseId);assert.ok(brief);for(const lang of ['de','en']){const x=lang[0].toUpperCase()+lang.slice(1);assert.equal(brief['taskDemand'+x],c.material[lang]+' '+c.taskDemand[lang]);assert.equal(brief['expectedPerformance'+x],c.expectedPerformance[lang]);assert.equal(brief['understandingFocus'+x],c.specificBoundaryOrCounterexample[lang])}}
 const actualGoalChanged=r.goalFingerprint!==previous.goalFingerprint,actualInputChanged=r.reviewInputFingerprint!==previous.reviewInputFingerprint
 assert.equal(actualGoalChanged,r.goalId==='3bc48951-025c-5144-99b1-924db611a5f9');assert.equal(actualInputChanged,expectedChanged.has(r.goalId))
 if(!expectedChanged.has(r.goalId))assert.deepEqual(r,previous)
 return {goalId:r.goalId,actualGoalFingerprintChanged:actualGoalChanged,actualInputFingerprintChanged:actualInputChanged,profileBodyExactV1:true,profileFingerprintExactV1:true,criteriaFingerprintExactV1:true,wholeNativeRecordExactV1:!expectedChanged.has(r.goalId),before:{goalFingerprint:previous.goalFingerprint,reviewInputFingerprint:previous.reviewInputFingerprint},finalCandidate:{goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,reviewCriteriaFingerprint:r.reviewCriteriaFingerprint},actualAssets:assets,caseIds:cases.map((c:any)=>c.caseId),status:r.status,reviewAuthority:r.reviewAuthority,independentScienceApproval:false}
})
writeFileSync(resolve(root,config.reviewPath),records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const check=reviewPositiveGoalEvidenceConfig(own+'/positive-evidence.twenty-five.final-native-author-candidates.config.json');assert.deepEqual(check.errors,[]);assert.deepEqual(check.counts,{approved:0,needsHumanReview:25,rejected:0})
writeFileSync(resolve(root,own,'actual25-final-native-positive-profile-material-and-fingerprint-checks.author.json'),JSON.stringify({role:'AUTHOR actual untouched native materializer/full checker in temporary isolation; not independent P acceptance',actualProfiles:25,actualCompleteMaterials:50,profileScienceBodiesExactV1:25,wholeUnchangedNativeRecords:17,actualGoalFingerprintDeltaIds:rows.filter(r=>r.actualGoalFingerprintChanged).map(r=>r.goalId),actualInputFingerprintDeltaIds:rows.filter(r=>r.actualInputFingerprintChanged).map(r=>r.goalId),nativeClosedSchemas:'PASS25',nativeFullChecker:'PASS25',errors:check.errors,counts:check.counts,rows,actualHelperBindings:helpers.map(bind),finalActiveBinding:'PENDING_REVIEW_AND_INTEGRATION: image/goal inputs are in inert package and temporary physical overlay only',independentPReviews:'PENDING',newScientificClosures:0,restoredActiveBindings:0,strictNetGain:0,humanApproval:false,humanTrial:false,activeWrites:false},null,2)+'\n')
console.log(JSON.stringify({nativeMaterializer:'PASS25',nativeFullChecker:'PASS25',scientificProfilesExact:25,materialBodiesExact:50,wholeRecordsExactV1:17,currentInputFPChanges:8,currentGoalFPChanges:1,strictGain:0}))
