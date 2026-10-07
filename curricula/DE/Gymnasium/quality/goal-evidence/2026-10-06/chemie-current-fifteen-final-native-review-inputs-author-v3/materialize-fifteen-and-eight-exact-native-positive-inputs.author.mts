import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
const root=resolve('.')
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'chemie-current-fifteen-final-native-review-inputs-author-v3',v1=base+'chemie-current-atomic-description-positive-gap-author-v1',v2=base+'chemie-current-atomic-description-positive-gap-author-v2'
const arg=process.argv.indexOf('--isolated-root');assert.ok(arg>=0);const isolatedRoot=resolve(process.argv[arg+1])
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:p,sha256:sha(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const write=(p:string,v:any)=>writeFileSync(resolve(root,own,p),JSON.stringify(v,null,2)+'\n')
const recordsFrom=(p:string)=>readFileSync(resolve(root,p),'utf8').trim().split('\n').map(l=>JSON.parse(l))
const dFreeze=read(own+'/native-d-stage-author-v3.final.freeze.json');for(const f of dFreeze.files)assert.equal(bind(f.path).sha256,f.sha256)
const isolation=read(own+'/temporary-native-isolation.actual-receipt.json')
for(const n of ['materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceProfileModel.ts','positiveGoalEvidenceReview.ts']){
 const f=isolation.byteIdenticalCopiedProductionHelpers.find((h:any)=>h.path.endsWith('/'+n));assert.ok(f);assert.equal(bind(f.path).sha256,f.sha256);assert.equal(sha(readFileSync(resolve(isolatedRoot,f.path))),f.sha256)
}
const {buildPositiveGoalEvidenceCandidateRecords}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const {reviewPositiveGoalEvidenceConfig}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/positiveGoalEvidenceReview.ts')).href)
const {validatePositiveGoalEvidenceRecordSemantics}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const {stableGoalBookJson}=await import(pathToFileURL(resolve(isolatedRoot,'app/scripts/goalBookModel.ts')).href)
const config=read(own+'/positive-evidence.fifteen.native-author-candidates.config.json'),specs=read(own+'/fifteen-positive-profile-specifications.exact-v2.json'),materials=read(own+'/thirty-complete-materials.de-en.exact-v2.json')
const can=read(config.landscapePath),goals=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]))
assert.deepEqual(specs.goals.map((s:any)=>s.goalId),isolation.exact15GoalIds)
assert.equal(bind(own+'/fifteen-positive-profile-specifications.exact-v2.json').sha256,bind(v2+'/fifteen-positive-profile-specifications.author-corrections.candidate.json').sha256)
assert.equal(bind(own+'/thirty-complete-materials.de-en.exact-v2.json').sha256,bind(v2+'/thirty-complete-materials.de-en.author-corrections.candidate.json').sha256)
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:specs});assert.equal(records.length,15)
const req=createRequire(resolve(root,'app/package.json')),Ajv=req('ajv/dist/2020').default,formats=req('ajv-formats').default
const ajv=new Ajv({strict:true,allErrors:true});formats(ajv);const recordSchema=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),configSchema=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
assert.ok(configSchema(config),ajv.errorsText(configSchema.errors))
const old=recordsFrom(v1+'/positive-evidence.fifteen.author-candidates.review.jsonl'),prospectiveV2=recordsFrom(v2+'/positive-evidence.fifteen.prospective.author-candidates.review.jsonl')
const oldMap=new Map<string,any>(old.map(r=>[r.goalId,r])),v2Map=new Map<string,any>(prospectiveV2.map(r=>[r.goalId,r]))
const oldMaterials=read(v1+'/thirty-complete-materials.de-en.author-candidates.json').materials
const pages=read(own+'/actual-full378-national359-five-pages-native-context-source-bindings.json').rows
const commonSeven=['3be2d0b7','e1214210','448815cc','b92bfa45','345fdca9','3899edf4','d4928773']
const rows=records.map((r:any)=>{
 assert.ok(recordSchema(r),ajv.errorsText(recordSchema.errors));assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');assert.deepEqual(r.reviewRunIds,[])
 const previous=oldMap.get(r.goalId),v2r=v2Map.get(r.goalId),goal=goals.get(r.goalId),resourceDigests:Record<string,string>={}
 const resources=(goal.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>{const p='app/public'+l.url,b=readFileSync(resolve(isolatedRoot,p));resourceDigests[l.url]=sha(b);const row=isolation.physicalSelectedReviewRasterCopies.find((s:any)=>s.goalId===r.goalId);return{resourceURL:l.url,isolatedRelativePath:p,sha256:sha(b),bytes:b.length,physicallyInsideTemporaryPublicRoot:!!row,originalSource:row?.source??bind(p)}})
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,resourceDigests,'curricularAtomic'),[])
 for(const fp of ['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint'])assert.equal(r[fp],v2r[fp],'Prospective v2 fingerprint drift '+r.goalId+' '+fp)
 const cases=materials.materials.filter((c:any)=>c.goalId===r.goalId);assert.equal(cases.length,2)
 for(const c of cases){const b=r.profile.applicationCaseBriefs.find((b:any)=>b.id===c.caseId);assert.ok(b);for(const lang of ['de','en']){const suffix=lang[0].toUpperCase()+lang.slice(1);assert.equal(b['taskDemand'+suffix],c.material[lang]+' '+c.taskDemand[lang]);assert.equal(b['expectedPerformance'+suffix],c.expectedPerformance[lang]);assert.equal(b['understandingFocus'+suffix],c.specificBoundaryOrCounterexample[lang])}}
 const freshP=isolation.pFreshGoalIds.includes(r.goalId),common=commonSeven.includes(r.goalId.slice(0,8)),page=pages.find((p:any)=>p.goalId===r.goalId)
 if(common){assert.ok(page.wholeGoalUnchanged&&page.fullPageExact);assert.deepEqual(r.profile,previous.profile);for(const fp of ['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint'])assert.equal(r[fp],previous[fp]);for(const c of cases)assert.deepEqual(c,oldMaterials.find((m:any)=>m.caseId===c.caseId))}
 return{goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,reviewCriteriaFingerprint:r.reviewCriteriaFingerprint,allFourFingerprintBindingsExactProspectiveV2:true,goalFingerprintExactV1:r.goalFingerprint===previous.goalFingerprint,inputFingerprintExactV1:r.reviewInputFingerprint===previous.reviewInputFingerprint,profileFingerprintExactV1:r.profileFingerprint===previous.profileFingerprint,scientificProfileBodyExactV1:stableGoalBookJson(r.profile)===stableGoalBookJson(previous.profile),wholeGoalExactV1:page.wholeGoalUnchanged,fullBookPageExactV1:page.fullPageExact,actualResources:resources,caseIds:cases.map((c:any)=>c.caseId),actualCaseDigests:cases.map((c:any)=>({caseId:c.caseId,sha256:sha(stableGoalBookJson(c)),bodyExactV1:stableGoalBookJson(c)===stableGoalBookJson(oldMaterials.find((m:any)=>m.caseId===c.caseId))})),freshIndependentPNeeded:freshP,commonUnchangedDPScienceKEEPReuse:common,nativeClosedRecordSchema:'PASS',nativePureSemantics:'PASS',status:r.status,reviewAuthority:r.reviewAuthority,newIndependentApproval:false}
})
writeFileSync(resolve(root,config.reviewPath),records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const fullCheck=reviewPositiveGoalEvidenceConfig(own+'/positive-evidence.fifteen.native-author-candidates.config.json');assert.deepEqual(fullCheck.errors,[]);assert.deepEqual(fullCheck.counts,{approved:0,needsHumanReview:15,rejected:0})
const fresh=records.filter((r:any)=>isolation.pFreshGoalIds.includes(r.goalId));assert.equal(fresh.length,8)
const targetedConfig={...structuredClone(config),reviewPath:own+'/positive-evidence.eight.targeted.native-author-candidates.review.jsonl',scope:{label:'Fresh independent P followup only: eight corrected operative text/resource/profile bindings, seven exact unchanged scientific KEEP reused',goalIds:isolation.pFreshGoalIds}}
writeFileSync(resolve(root,targetedConfig.reviewPath),fresh.map((r:any)=>JSON.stringify(r)).join('\n')+'\n');write('positive-evidence.eight.targeted.native-author-candidates.config.json',targetedConfig)
assert.ok(configSchema(targetedConfig),ajv.errorsText(configSchema.errors))
const targetedCheck=reviewPositiveGoalEvidenceConfig(own+'/positive-evidence.eight.targeted.native-author-candidates.config.json');assert.deepEqual(targetedCheck.errors,[]);assert.deepEqual(targetedCheck.counts,{approved:0,needsHumanReview:8,rejected:0})
write('sixteen-complete-targeted-materials.de-en.exact-v2.json',{schemaVersion:1,role:'AUTHOR exact subset of frozen v2 actual complete cases; no new author transformations or approval',materials:materials.materials.filter((c:any)=>isolation.pFreshGoalIds.includes(c.goalId))})
write('native-fifteen-and-eight-positive-schema-material-binding-checks.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'AUTHOR actual unmodified production materializer/full-checker in isolated filesystem; not active current P approval',immutableDStage:bind(own+'/native-d-stage-author-v3.final.freeze.json'),exactMaterials:bind(own+'/thirty-complete-materials.de-en.exact-v2.json'),exactScientificProfileSpecifications:bind(own+'/fifteen-positive-profile-specifications.exact-v2.json'),actualNativeMaterializer:'PASS15',actualNativeFullChecker:{status:'PASS15',errors:fullCheck.errors,counts:fullCheck.counts},actualNativeTargetedChecker:{status:'PASS8',errors:targetedCheck.errors,counts:targetedCheck.counts},actualMaterialBodies:30,targetedMaterialBodies:16,commonUnchangedDPScienceKEEPReuse7:true,allFourProspectiveV2FingerprintsExact15:true,productionHelperBindings:['app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/positiveGoalEvidenceReview.ts'].map(bind),rows,activeNativeBinding:'PENDING_INTEGRATION: the two proposed PNGs are only physically present inside the temporary native root, not active app/public',newIndependentPApproval:false,humanApproval:false,humanTrial:false,actualLearnerEvidence:false,activeWrites:false,strictNetGain:0,newScientificClosures:0,restoredActiveBindings:0})
console.log(JSON.stringify({nativeMaterializer:'PASS15',fullNativeChecker:'PASS15',targetedNativeChecker:'PASS8',fullRecordCount:records.length,targetedRecordCount:fresh.length,actualMaterials:30,targetedMaterials:16,commonExactScienceReuse:rows.filter(r=>r.commonUnchangedDPScienceKEEPReuse).length,activeWrites:false,strictNetGain:0}))
