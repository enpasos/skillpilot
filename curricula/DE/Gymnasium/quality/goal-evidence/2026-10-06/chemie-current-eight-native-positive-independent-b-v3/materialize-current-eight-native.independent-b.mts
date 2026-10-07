import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root=resolve('.'),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/',own=base+'chemie-current-eight-native-positive-independent-b-v3',author=base+'chemie-current-fifteen-final-native-review-inputs-author-v3',old=base+'chemie-current-fifteen-native-positive-independent-b-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const bytes=(p:string)=>readFileSync(resolve(root,p))
const sha=(x:string|Buffer)=>'sha256:'+createHash('sha256').update(x).digest('hex')
const bind=(p:string)=>({path:p,sha256:sha(bytes(p)),bytes:bytes(p).length})
const write=(p:string,x:any)=>writeFileSync(resolve(root,own,p),JSON.stringify(x,null,2)+'\n')
const records=(p:string)=>bytes(p).toString().trim().split('\n').map(s=>JSON.parse(s))
const isolation=read(own+'/actual-v3-input-payload-reuse-and-native-isolation.independent-b.json'),iso=isolation.temporaryNativeRoot
for(const r of isolation.nativePureHelpersByteIdenticalCurrent){assert.deepEqual(bind(r.path),r);assert.equal(sha(readFileSync(resolve(iso,r.path))),r.sha256)}
const {buildPositiveGoalEvidenceCandidateRecords}=await import(pathToFileURL(resolve(iso,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const {reviewPositiveGoalEvidenceConfig}=await import(pathToFileURL(resolve(iso,'app/scripts/positiveGoalEvidenceReview.ts')).href)
const {stableGoalEvidenceJson}=await import(pathToFileURL(resolve(iso,'app/scripts/goalEvidenceProfileModel.ts')).href)
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(iso,'app/scripts/goalBookModel.ts')).href)
const config=read(own+'/positive.eight.independent-b.current-native-v3.config.json'),candidate=read(own+'/positive.eight.independent-b.specifications.json')
const can=read(config.landscapePath),kinds=read(config.semanticKindLedgerPath),kindmap=new Map(kinds.decisions.map((d:any)=>[d.goalId,d])),goals=new Map(can.goals.map((g:any)=>[g.id,g]))
const oldkind=read(read(old+'/positive.fifteen.independent-b.config.json').semanticKindLedgerPath)
assert.equal(kinds.decisions.length,oldkind.decisions.length)
let kindFpChanges=0
for(const d of kinds.decisions){const g=goals.get(d.goalId);assert.ok(g);assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(g));const prev=oldkind.decisions.find((p:any)=>p.goalId===d.goalId);assert.ok(prev);assert.deepEqual({...d,sourceFingerprint:'ignored'},{...prev,sourceFingerprint:'ignored'});if(d.sourceFingerprint!==prev.sourceFingerprint)kindFpChanges++}
assert.equal(kindFpChanges,3)
// Own frozen content specifications stay untouched. Only the new native stage reason is made current.
for(const s of candidate.goals){s.reason=s.reason.replace('Native final-v3-Bindungen müssen separat bestanden sein.','Aktuelle operative v3-Bindungen werden in diesem neuen nativen Nachweis mit unveränderten Produktionshelfern reproduziert.');if(s.goalId.startsWith('363c'))s.dissent=[...s.dissent,'The corrected whole paper P profile and cases are KEEP. The declared current 363 visualization/D scientific hold is not examined or overruled here; this current image-bound P candidate is not an overall goal/M7 approval.']}
const made=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidate});assert.equal(made.length,8)
const authored=new Map(records(author+'/positive-evidence.eight.targeted.native-author-candidates.review.jsonl').map((r:any)=>[r.goalId,r]))
const fullspec=read(author+'/fifteen-positive-profile-specifications.exact-v2.json'),materials=read(author+'/thirty-complete-materials.de-en.exact-v2.json').materials
const bookPath=author+'/qa-artifacts/full-prospective378.book-model.json',book=read(bookPath)
assert.equal(book.pages.length,378)
const rows=made.map((r:any)=>{const a:any=authored.get(r.goalId),g:any=goals.get(r.goalId),k:any=kindmap.get(r.goalId),page=book.pages.find((p:any)=>p.goalId===r.goalId),asset=isolation.physicalNativeAssets.find((p:any)=>p.goalId===r.goalId)
 assert.deepEqual(r.profile,a.profile);for(const fp of ['goalFingerprint','reviewInputFingerprint','profileFingerprint','reviewCriteriaFingerprint'])assert.equal(r[fp],a[fp])
 assert.equal(k.semanticKind,'curricularAtomic');assert.equal(k.decisionStatus,'authoritative')
 assert.equal(page.description,g.description);assert.equal(page.title,g.title);assert.equal(page.goalFingerprint,r.goalFingerprint);assert.equal(page.visualization.originalDigest,asset.source.sha256);assert.equal(page.visualization.url,asset.resourceURL)
 const cases=materials.filter((c:any)=>c.goalId===r.goalId);assert.equal(cases.length,2)
 for(const c of cases){const b=r.profile.applicationCaseBriefs.find((b:any)=>b.id===c.caseId);assert.ok(b);for(const lang of ['de','en']){const suffix=lang[0].toUpperCase()+lang.slice(1);assert.equal(b['taskDemand'+suffix],c.material[lang]+' '+c.taskDemand[lang]);assert.equal(b['expectedPerformance'+suffix],c.expectedPerformance[lang]);assert.equal(b['understandingFocus'+suffix],c.specificBoundaryOrCounterexample[lang])}}
 assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
 return {goalId:r.goalId,scientificWholePaperProfileDecision:'KEEP',wholeDEENMaterialsDecision:'KEEP',twoActualWholeCasesExact:true,profileLiteralExactReviewedV2:true,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,reviewCriteriaFingerprint:r.reviewCriteriaFingerprint,nativePageWholeTextAndExactResourceBindingVerified:true,actualNativeResource:asset,currentVisualDHoldRetained:r.goalId.startsWith('363c'),nativeBindingDoesNotOverruleVisualOrDScience:true}
})
// Recompute seven protected KEEP records from the current candidate, retaining every actual old field.
const oldcfg=read(old+'/positive.fifteen.independent-b.config.json'),oldrecords=records(oldcfg.reviewPath),common=isolation.sevenPriorWholeGoalProfileAnd14MaterialKEEPReuse.map((r:any)=>r.goalId),selected=oldrecords.filter((r:any)=>common.includes(r.goalId))
const reusecfg={...structuredClone(config),reviewId:oldcfg.reviewId,scope:{label:'Exact retained seven own previous profile KEEP records',goalIds:selected.map((r:any)=>r.goalId)}}
const reuseSet={schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId:oldcfg.reviewId,reviewedAt:selected[0].reviewedAt,reviewer:selected[0].reviewer,goals:selected.map((r:any)=>({goalId:r.goalId,reason:r.reason,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,dissent:r.dissent,profile:r.profile}))}
const regenerated=await buildPositiveGoalEvidenceCandidateRecords({config:reusecfg,candidateSet:reuseSet});assert.equal(regenerated.length,7)
for(const r of regenerated){const prev=selected.find((p:any)=>p.goalId===r.goalId);r.reviewRunIds=prev.reviewRunIds;assert.deepEqual(r,prev)}
const parameters={schemaVersion:1,provider:'OpenAI',model:'GPT-6',role:'subject_reviewer',independenceGroupId:'chemie-current-eight-independent-b-whole-science-v3',blindToOtherNewDPRunResults:true,stage:'actual v2 independent full science content plus current isolated native v3 P binding',humanApproval:false,humanTrial:false}
write('native-v3-generation-parameters.independent-b.json',parameters)
const promptPath=own+'/native-v3-review-prompt.independent-b.md',sciencePath=own+'/actual-v2-eight-whole-science-content-review.independent-b.json'
const artifact={schemaVersion:1,scopeGoalIds:config.scope.goalIds,wholeGoalObjects:config.scope.goalIds.map((id:string)=>goals.get(id)),wholeProfiles:made.map((r:any)=>({goalId:r.goalId,profile:r.profile})),wholeMaterials:materials.filter((m:any)=>config.scope.goalIds.includes(m.goalId)),nativeBookPageBindings:config.scope.goalIds.map((id:string)=>book.pages.find((p:any)=>p.goalId===id)),actualResourceBindings:rows.map((r:any)=>r.actualNativeResource),existingIndependentContentStage:bind(own+'/content-v2-source-stage.independent-b.final.freeze.json'),current363VisualDHoldRetained:true}
write('native-v3-eight-actual-review-input.independent-b.json',artifact)
const inputPath=own+'/native-v3-eight-actual-review-input.independent-b.json',runId='chemie-current-eight-native-positive-independent-b-v3.actual-current-native'
for(const r of made)r.reviewRunIds=[runId]
const output=made.map((r:any)=>JSON.stringify(r)).join('\n')+'\n';writeFileSync(resolve(root,config.reviewPath),output)
const artifacts=[{role:'book_model',digest:sha(bytes(bookPath))},{role:'review_input_json',digest:sha(bytes(inputPath))},{role:'review_input_jsonl',digest:sha(bytes(author+'/positive-evidence.eight.targeted.native-author-candidates.review.jsonl'))},{role:'review_markdown',digest:sha(bytes(sciencePath))},{role:'review_prompt',digest:sha(bytes(promptPath))},{role:'review_criteria',digest:sha(bytes(config.reviewCriteriaPath))}]
const run={$schema:'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',schemaVersion:1,runId,bundleFingerprint:sha(stableGoalEvidenceJson(artifact)),bookDigest:sha(bytes(bookPath)),provider:'OpenAI',model:'GPT-6',role:'subject_reviewer',promptFamilyId:'chemistry-current-eight-positive-independent-b-actual-science-v3',promptFingerprint:sha(bytes(promptPath)),criteriaFingerprint:sha(bytes(config.reviewCriteriaPath)),generationParametersFingerprint:sha(bytes(own+'/native-v3-generation-parameters.independent-b.json')),independenceGroupId:parameters.independenceGroupId,blindToOtherRuns:true,goalIds:config.scope.goalIds,inputArtifacts:artifacts,startedAt:candidate.reviewedAt,completedAt:new Date().toISOString(),status:'completed',outputDigest:sha(output),toolchainVersion:'skillpilot-unmodified-native-positive-v2-independent-b-v3'}
writeFileSync(resolve(root,config.reviewRunManifestPaths[0]),JSON.stringify(run,null,2)+'\n')
const checked=reviewPositiveGoalEvidenceConfig(own+'/positive.eight.independent-b.current-native-v3.config.json');assert.deepEqual(checked.errors,[]);assert.deepEqual(checked.counts,{approved:0,needsHumanReview:8,rejected:0})
write('actual-eight-current-native-contract-and-seven-reuse.independent-b.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'Own unchanged native pure helper recomputation and full current P config/schema/semantics/run validator, in isolated candidate repository',ownActualWholeScienceContentFreeze:bind(own+'/content-v2-source-stage.independent-b.final.freeze.json'),scientificWholeProfilesKEEP:8,scientificWholeMaterialsKEEP:16,nativeChecker:{status:'PASS',errors:checked.errors,counts:checked.counts},sourceKindClassificationsExactPrevious:true,allCurrentKindFingerprintsRecomputedExact:true,threeTextKindFingerprintOnlyChanges:kindFpChanges,currentAuthorOperativeFingerprintsExact8:true,sevenExactPreviousOwnRecordsRecomputedWithoutRetagging:true,sevenExactOldWholeRecords:selected.map((r:any)=>({goalId:r.goalId,allRecordFieldsExact:true,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint})),run:bind(config.reviewRunManifestPaths[0]),output:bind(config.reviewPath),bookRawBytesDigest:sha(bytes(bookPath)),bookSemanticModelDigest:book.digest,actualOutputDigestReverified:run.outputDigest===sha(bytes(config.reviewPath)),rows,current363VisualDHoldRetained:true,overallScienceGoalApproval:false,wholeOriginalSourceCoverage:false,activeNativeIntegration:false,humanApproval:false,humanTrial:false,actualLearnerEvidence:false,activeWrites:false,GitOperations:false,strictNetGain:0})
console.log(JSON.stringify({nativeChecker:'PASS',wholeProfileKEEP:8,wholeMaterialKEEP:16,counts:checked.counts,separateCurrent363VisualDHoldRetained:true,sevenPreviousWholeRecordsExactCurrentNative:true,outputDigest:run.outputDigest,runId}))
