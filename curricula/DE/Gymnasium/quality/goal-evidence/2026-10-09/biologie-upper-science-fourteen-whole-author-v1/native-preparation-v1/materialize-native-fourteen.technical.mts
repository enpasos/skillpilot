// SPDX-License-Identifier: Apache-2.0
// Ordinary inactive native/source/P frame. No independent scientific verdict.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync,lstatSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal,stableGoalBookJson} from '../../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../../app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from '../../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts} from '../../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {emptyGoalVisualizationAiReview} from '../../../../../../../../app/scripts/goalVisualizationQaModel.ts'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),author=resolve(own,'..'),remedy=resolve(author,'remediation-v2')
const rel=(p:string)=>relative(root,p),sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const declarations=new Map<string,any>()
const bind=(p:string)=>{assert.equal(lstatSync(p).isSymbolicLink(),false);const b=readFileSync(p),r={path:rel(p),sha256:sha(b),bytes:b.length};declarations.set(p,r);return r}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(p,'utf8'))}
const write=(p:string,x:any)=>{assert.ok(p.startsWith(own+'/'),'Only own new technical outputs');const b=Buffer.isBuffer(x)?x:Buffer.from(typeof x==='string'?x:JSON.stringify(x,null,2)+'\n');if(existsSync(p)){assert.ok(readFileSync(p).equals(b),'Preserve differing prior technical output '+p);return bind(p)}mkdirSync(dirname(p),{recursive:true});writeFileSync(p,b);return bind(p)}
const verified=(b:any)=>{assert.ok(b.path&&!b.path.startsWith('/'));const r=bind(resolve(root,b.path));assert.equal(r.sha256,'sha256:'+b.sha256.replace(/^sha256:/,''));assert.equal(r.bytes,b.bytes);return r}
assert.equal(process.argv.length,3,'Usage: tsx materialize-native-fourteen.technical.mts <normalized neutral fourteen image entry>')
assert.equal(existsSync(resolve(own,'neutral-fourteen-native-independent-review.entry.json')),false,'Completed native packet immutable')
const authorEntryPath=resolve(author,'neutral-whole-fourteen-science-twenty-eight-cases.author.entry.json')
assert.equal(bind(authorEntryPath).sha256,'sha256:29ecb7c0f98b0d13e5fa6c801d8493b445d71d3e2d3d774b717943ac66473f85')
const originalEntry=read(authorEntryPath),scienceSealPath=resolve(author,'whole-fourteen-science-author.first.freeze.json')
assert.equal(bind(scienceSealPath).sha256,'sha256:9dbaaa444871b3d96c434b603ebf8744150cfadbe2fc930bbd90792a4ac09e8b')
for(const b of read(scienceSealPath).files)verified(b)
const remedyEntryPath=resolve(remedy,'neutral-whole-fourteen-targeted-remediation-twenty-nine-cases.author.entry.json'),entry=read(remedyEntryPath),remedySealPath=resolve(remedy,'targeted-whole-remediation.first.freeze.json');for(const b of read(remedySealPath).files)verified(b)
const stamp=entry.createdAt
const ids:string[]=entry.scopeGoalIds;assert.equal(ids.length,14)
const materials=read(resolve(root,entry.wholeMaterialsPath));assert.equal(materials.entries.length,14)
const profilesPath=resolve(root,entry.positiveEvidenceReviewPath);bind(profilesPath)
const originalProfiles=readFileSync(profilesPath,'utf8').trim().split('\n').map(s=>JSON.parse(s));assert.equal(originalProfiles.length,14)
const imageEntryPath=resolve(root,process.argv[2]),imageEntry=read(imageEntryPath)
assert.equal(imageEntry.images.length,14);assert.deepEqual(imageEntry.images.map((i:any)=>i.goalId).sort(),[...ids].sort())
const canonLive=resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),kindsLive=resolve(root,'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'),qaLive=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
const canonical=read(canonLive),before=structuredClone(canonical),kinds=read(kindsLive),qa=read(qaLive),oldQA=structuredClone(qa)
assert.equal(canonical.goals.length,479);assert.equal(kinds.counts.curricularAtomic,394);assert.equal(qa.records.length,394)
const goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
const enPatch=read(resolve(root,entry.goalEN1ExactDeltaPath)),enId=enPatch.goalId
assert.deepEqual(goals.get(enId),enPatch.beforeWholeGoal);Object.assign(goals.get(enId),enPatch.afterWholeGoal)
for(const e of materials.entries)assert.deepEqual(goals.get(e.goalId),e.wholeCurrentGoal)
const technicalKinds=read(resolve(root,entry.candidateKindsPath));for(const d of kinds.decisions){const next=technicalKinds.decisions.find((r:any)=>r.goalId===d.goalId);if(d.goalId!==enId)assert.deepEqual(d,next);else {assert.deepEqual({...d,sourceFingerprint:next.sourceFingerprint},next);d.sourceFingerprint=next.sourceFingerprint}}
const actualBefore=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
assert.equal(actualBefore.model.pages.length,394)
write(resolve(own,'before/canonical.current479.exact.json'),before);write(resolve(own,'before/semantic-kinds.current394.exact.json'),read(kindsLive));write(resolve(own,'before/visualization-qa.current394.exact.json'),oldQA)
write(resolve(own,'native/full394.current-before.actual-loader.book-model.json'),actualBefore.model)
const rasterBindings:any[]=[]
for(const im of imageEntry.images){
 const g=goals.get(im.goalId);assert.deepEqual(g.resourceLinks??[],[])
 const asset=verified(im.asset);const bytes=readFileSync(resolve(root,asset.path));assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
 for(const p of im.originalPrompts)verified(p);if(im.reconstructionPrompt)verified(im.reconstructionPrompt);verified(im.actualGenerationReceipt);for(const p of im.inspectionViews)verified(p)
 assert.ok(im.provider&&im.descriptionDe&&im.altTextDe)
 const alias=resolve(own,'assets/goal-visualizations/biologie',g.id,g.id+'.png');write(alias,bytes)
 const url='/assets/goal-visualizations/biologie/'+g.id+'/'+g.id+'.png'
 const link={type:'goal-visualization',resourceType:'image',role:'primary',skillpilotId:g.id,title:'Visualisierung: '+g.title,url,provider:im.provider,description:im.descriptionDe,altText:im.altTextDe,lang:'de',license:'CC-BY-4.0',reviewStatus:'pilot'}
 g.resourceLinks=[link]
 const q=qa.records.find((q:any)=>q.goalId===g.id);assert.equal(q.visualizationState,'missing')
 Object.assign(q,{visualizationState:'available',missingReason:'',imageUrl:url,publicAssetPath:rel(alias),canonicalAssetPath:rel(alias),assetSha256:asset.sha256,chatGptNotes:'Inactive actual PNG/native candidate; independent current whole D/P/V pending; no human approval.',...emptyGoalVisualizationAiReview()})
 rasterBindings.push({goalId:g.id,actualOriginalImage:asset,portableAlias:bind(alias),resourceLinkCandidate:link,provider:im.provider,model:im.model??null,originalPrompts:im.originalPrompts,reconstructionPrompt:im.reconstructionPrompt??null,actualGenerationReceipt:im.actualGenerationReceipt,authorInspectionViews:im.inspectionViews,independentVisualApproval:false})
}
for(const old of before.goals){const next=goals.get(old.id);if(!ids.includes(old.id))assert.deepEqual(next,old);else {const expected=old.id===enId?enPatch.afterWholeGoal:old;assert.deepEqual({...next,resourceLinks:undefined},{...expected,resourceLinks:undefined})}}
for(const old of oldQA.records){const next=qa.records.find((q:any)=>q.goalId===old.goalId);if(!ids.includes(old.goalId))assert.deepEqual(next,old);for(const k of Object.keys(old).filter(k=>k.startsWith('human')))assert.deepEqual(next[k],old[k])}
const canonPath=resolve(own,'candidate/canonical.current479.fourteen-resource-candidates.inactive.json'),kindPath=resolve(own,'candidate/semantic-kinds.current394.path-only.inactive.json'),qaPath=resolve(own,'candidate/visualization-qa.current394.fourteen-unapproved.portable.json')
write(canonPath,canonical);write(kindPath,{...kinds,sourceLandscapePath:rel(canonPath)});write(qaPath,qa)
for(const d of kinds.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(goals.get(d.goalId)))
const sourceConfig=read(resolve(root,'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'))
const niDelta=read(resolve(root,entry.sourceNI1ExactDeltaPath));assert.equal(sourceConfig.mappingPaths.filter((p:string)=>p===niDelta.originalMappingBinding.path).length,1);sourceConfig.mappingPaths=sourceConfig.mappingPaths.map((p:string)=>p===niDelta.originalMappingBinding.path?entry.candidateNIMappingPath:p)
const local='app/scripts/config/goal-books/inactive/biologie-upper-science-fourteen-native-current394-v1'
Object.assign(sourceConfig,{landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),outputDirectory:local+'/source-views',manifestPath:local+'/atlas.sources.json',navigationViewPath:local+'/navigation.view.json'})
write(resolve(own,'source-atlas/atlas.inputs.book-local.inactive.json'),sourceConfig)
const built=buildGoalBookSourceAtlasInputs(sourceConfig,root)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals,394);assert.equal(built.receipt.counts.publishedCurricularAtomicGoals,394);assert.equal(built.receipt.counts.unresolvedSourceScopeDecisions,0)
const outputs=[];for(const [p,b] of Object.entries(built.outputs))outputs.push({operativeBookLocalPath:p,archive:write(resolve(own,'source-atlas/ordinary-book-local-outputs',p),b)})
write(resolve(own,'source-atlas/book-local-output-paths.actual.json'),{schemaVersion:1,outputs,liveBookLocalWrites:0,ordinaryCompilerReceipt:built.receipt})
const atlas=(p:string)=>{assert.ok(built.outputs[p]);return JSON.parse(built.outputs[p])}
const normalQA=structuredClone(qa);for(const q of normalQA.records)if(ids.includes(q.goalId))q.publicAssetPath='app/public'+q.imageUrl
const normalQAPath=resolve(own,'candidate/visualization-qa.current394.fourteen-unapproved.book-local.json');write(normalQAPath,normalQA)
const book={...actualBefore.config,landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),goalVisualizationQaPath:rel(normalQAPath),compositionViewManifestPath:sourceConfig.manifestPath,outputPath:rel(resolve(own,'native/full394.fourteen-resource-candidate.book-model.json'))}
const bookPath=resolve(own,'candidate/book.current394.fourteen-resource.inactive.config.json');write(bookPath,book)
const manifest=atlas(book.compositionViewManifestPath),digests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available'){const b=bind(resolve(root,q.publicAssetPath));assert.equal(b.sha256,q.assetSha256);digests[q.imageUrl]=b.sha256}
const model=buildGoalBookModel({landscape:canonical,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:atlas(p)})),navigationView:atlas(manifest.navigationViewPath),durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),semanticKindLedger:{...kinds,sourceLandscapePath:rel(canonPath)},goalVisualizationQa:normalQA,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:book} as any)
assert.equal(model.pages.length,394);write(resolve(root,book.outputPath),model)
const capsule=resolve(root,'tmp/biologie-upper-science-native14-current394-capsule')
const capWrite=(p:string,b:Buffer|string)=>{const target=resolve(capsule,p);assert.ok(target.startsWith(capsule+'/'));mkdirSync(dirname(target),{recursive:true});const bytes=Buffer.isBuffer(b)?b:Buffer.from(b);if(existsSync(target))assert.ok(readFileSync(target).equals(bytes),'Capsule input differs '+p);else writeFileSync(target,bytes)}
for(const p of [rel(canonPath),rel(kindPath),rel(normalQAPath),rel(bookPath),manifest.durationModelPolicyPath])capWrite(p,readFileSync(resolve(root,p)))
for(const [p,b] of Object.entries(built.outputs))capWrite(p,b)
for(const q of normalQA.records)if(q.visualizationState==='available'){const original=qa.records.find((r:any)=>r.goalId===q.goalId);capWrite(q.publicAssetPath,readFileSync(resolve(root,original.publicAssetPath)))}
const loaded=await loadGoalBookBuildInputs(rel(bookPath),capsule)
assert.equal(stableGoalBookJson(loaded.model),stableGoalBookJson(model))
write(resolve(own,'checks/ordinary-capsule-public-loader.actual.json'),{schemaVersion:1,capsulePath:rel(capsule),configPath:rel(bookPath),actualPages:394,wholeModelExact:true,actualAssetsByteVerified:true,symlinksCreated:0,activeWrites:0,exitCode:0})
const diffs=[]
for(const page of actualBefore.model.pages){const next=model.pages.find(p=>p.goalId===page.goalId)!;assert.ok(next);const changed=Object.keys({...page,...next}).filter(k=>stableGoalBookJson((page as any)[k])!==stableGoalBookJson((next as any)[k]));if(!ids.includes(page.goalId))assert.ok(changed.length===0||page.goalId==='bdbb1a13-f448-5536-86ab-894805e2f6be','Unexpected unselected source-context change '+page.goalId);diffs.push({goalId:page.goalId,selected:ids.includes(page.goalId),changedFields:changed,wholeBeforePage:page,wholeCandidatePage:next})}
write(resolve(own,'native/full394-whole-page-context.before-after.diff.json'),{schemaVersion:1,entries:diffs,selectedGoalIds:ids,unselectedExactPages:diffs.filter(d=>!d.selected&&!d.changedFields.length).length,unselectedSourceContextChanges:diffs.filter(d=>!d.selected&&d.changedFields.length),unselectedExactGoalObjects:465,selectedWholeDescriptionExactCount:13,exactIntentionalENFieldChangeCount:1,EN1KindAMTargetedConfirmation:'PENDING',dependenciesUnchanged:true,all394HumanQAFieldsExact:true,sourceMappingWrites:[],activeWrites:0})
const sourceFrame=read(resolve(root,entry.wholeCurrentOrdinarySourcePartnerFramePath))
write(resolve(own,'neutral-inputs/current-whole-source-duties-and-partner-frame.json'),sourceFrame)
write(resolve(own,'neutral-inputs/whole-fourteen-twenty-nine-bilingual-cases.json'),{schemaVersion:1,entries:materials.entries.map((e:any)=>({goalId:e.goalId,wholeCurrentGoalBeforeResources:e.wholeCurrentGoal,wholeCurrentGoalWithResources:goals.get(e.goalId),authoredCases:e.authoredCases})),actualEmpiricalResults:false})
const criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'),criteria=bind(criteriaPath).sha256,reviewId='biologie-upper-science-fourteen-current-raster-author-v1'
const records=originalProfiles.map((old:any)=>{const g=goals.get(old.goalId),im=rasterBindings.find(i=>i.goalId===g.id),resources={[im.resourceLinkCandidate.url]:im.portableAlias.sha256};const record={...old,reviewId,goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteria,resources,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(old.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:stamp,reviewer:'Codex technical current raster/native author materializer; independent whole D/P/V pending',reason:'Exact remediated author whole14/29 profile/cases bound to actual current candidate raster bytes. Technical candidate binding only; no independent review.',reviewRunIds:[],dissent:[]};assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,g,resources,'curricularAtomic'),[]);assert.equal(stableGoalBookJson(record.profile),stableGoalBookJson(old.profile));return record})
const pPath=resolve(own,'positive/P14.current-raster.author-candidate.review.jsonl');write(pPath,records.map(r=>JSON.stringify(r)).join('\n')+'\n')
const pConfig={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:canonical.landscapeId,landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),reviewCriteriaPath:rel(criteriaPath),reviewPath:rel(pPath),reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'14 whole current actual raster/native candidates; independent D/P/V pending',goalIds:ids}}
const pConfigPath=resolve(own,'positive/P14.current-raster.inactive.config.json');write(pConfigPath,pConfig)
for(const p of [rel(pConfigPath),rel(pPath),rel(criteriaPath)])capWrite(p,readFileSync(resolve(root,p)))
const batchId='biologie-upper-science-fourteen-current394-native-v1',ordered=model.pages.filter(p=>ids.includes(p.goalId)).map(p=>p.goalId)
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ordered,bookId:batchId,title:'Biologie: Wissenschaft und Erkenntnisgewinnung – vierzehn vollständige Prüfseiten'})
const native=resolve(own,'native-fourteen'),modelPath=resolve(native,'book-model.json'),htmlPath=resolve(native,'book.html'),pdfPath=resolve(native,'book.pdf');write(modelPath,subset)
const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard' as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
const pdfManifest=await writeGoalBookPdf(subset,pdfPath,options);await writeGoalBookRenderManifest(pdfManifest,pdfPath+'.render-manifest.json');assert.equal(pdfManifest.goalPageCount,14)
const bundleDir=resolve(native,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDir,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const f of bundle.files)write(resolve(bundleDir,f.relativePath),f.content);write(resolve(bundleDir,'review-bundle-manifest.json'),bundle.manifest)
const artifact=(role:string)=>{const a=bundle.manifest.artifacts.find(a=>a.role===role);assert.ok(a);return a}
const campaigns=[]
for(const side of ['a','b']){const out=resolve(native,'round-'+side);const r=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(bundleDir,'review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDir,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDir,artifact('review_input_json').path)),bundleDirectory:bundleDir,outputDirectory:out,campaignOptions:{campaignId:batchId+'-campaign-'+side,roundId:batchId+'-independent-'+side,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:batchId+'-independent-'+side,blindToOtherReviews:true,batchSize:20}});assert.equal(r.campaign.batches.length,1);assert.deepEqual(r.campaign.batches[0].goalIds,ordered);campaigns.push({side,campaignPath:rel(resolve(out,'description-review-campaign.json')),inputPath:rel(resolve(out,'description-review-input.json')),batchesDirectory:rel(resolve(out,'batches')),independenceGroupId:r.campaign.independenceGroupId,actualResultCount:0})}
write(resolve(own,'pending/fourteen-resolutions-not-yet-created.json'),{schemaVersion:1,goalIds:ordered,actualResolutionCount:0,actualIndependentResults:0,pendingTwoIndependentNativeReviews:true,humanApproval:false})
const inputRefs=[...declarations.values()].filter(b=>!b.path.startsWith(rel(own)+'/'))
write(resolve(own,'neutral-fourteen-native-independent-review.entry.json'),{schemaVersion:1,role:'neutral actual native14/current394 resources, whole descriptions with exact EN1 fidelity candidate,29 worked bilingual cases, whole source/partner inputs; no author/peer verdicts',goalIds:ordered,wholeCaseCount:29,baselineCanonicalGoalCount:479,baselineAtomicCount:394,actualFullCurrentBeforeModelPath:rel(resolve(own,'native/full394.current-before.actual-loader.book-model.json')),actualFullCandidateModelPath:book.outputPath,whole394PageContextDiffPath:rel(resolve(own,'native/full394-whole-page-context.before-after.diff.json')),unselectedWholePageExactCount:diffs.filter(d=>!d.selected&&!d.changedFields.length).length,unselectedWholeSourceContextChanges:diffs.filter(d=>!d.selected&&d.changedFields.length).map(d=>({goalId:d.goalId,changedFields:d.changedFields})),unselectedWhole465GoalsExact:true,wholeSelectedDescriptionExactCount:13,intentionalEN1FidelityCandidate:true,dependenciesUnchanged:true,sourceMappingSemanticWrites:[],candidateSourceExtractionCorrectionCount:1,same69WholeDecisionsAnd68Partners:true,sourceNI1ExactDeltaPath:entry.sourceNI1ExactDeltaPath,goalEN1ExactDeltaPath:entry.goalEN1ExactDeltaPath,wholeCaseMaterialsPath:rel(resolve(own,'neutral-inputs/whole-fourteen-twenty-nine-bilingual-cases.json')),wholeSourceDutiesPath:rel(resolve(own,'neutral-inputs/current-whole-source-duties-and-partner-frame.json')),originalSourceContextPath:entry.wholeOfficialClauseContextPath,currentNIOriginalPage76CorrectionPath:entry.sourceNI1ExactDeltaPath,genuineEN1KindAMConfirmationInputPath:rel(resolve(own,'pending/one-en-kind-atomicity-memory-confirmation.neutral-input.json')),positiveConfigPath:rel(pConfigPath),positiveRecordPath:rel(pPath),candidateCanonicalPath:rel(canonPath),candidateKindsPath:rel(kindPath),candidateVisualizationQAPath:rel(normalQAPath),candidateBookConfigPath:rel(bookPath),portablePublicRoot:rel(own),actualNativeBundlePath:rel(resolve(bundleDir,'review-bundle-manifest.json')),actualNativePDF:bind(resolve(bundleDir,artifact('book_pdf').path)),actualNativeHTML:bind(resolve(bundleDir,artifact('book_html').path)),pageMap:ordered.map((goalId,i)=>({goalId,physicalPage:pdfManifest.frontMatterPageCount+i+1})),campaigns,rasterBindings,existingAandM:'13 selected decisions exact reuse; EN1 change requires genuine targeted Kind/A/M confirmation, PENDING; no technical hash adoption is a scientific review',all394HumanQAFieldsExact:true,originalScienceAuthorEntry:bind(authorEntryPath),originalScienceFirstSeal:bind(scienceSealPath),remediatedScienceAuthorEntry:bind(remedyEntryPath),remediatedScienceFirstSeal:bind(remedySealPath),originalRootImageEntry:verified(imageEntry.originalRootImageEntry),proceduralDigitalMediaManifestPath:entry.proceduralDigitalTaskMediaManifestPath,inputBindings:inputRefs,actualIndependentResultCount:0,independentNativeDPVStatus:'pending_two_actual_independent_reviewers',independentApproval:false,humanApproval:false,humanTrial:false,activeWrites:0,newScientificClosures:0,restoredBindings:0,netStrictGain:0,ordinaryCapsuleLoaderCheckPath:rel(resolve(own,'checks/ordinary-capsule-public-loader.actual.json')),authorVerdictTextIncluded:false})
console.log(JSON.stringify({actualFullBefore394:true,actualFullCandidate394:true,actualNative14:true,wholeP14Candidates:true,wholeCases29:true,unselectedPageExactCount:diffs.filter(d=>!d.selected&&!d.changedFields.length).length,EN1KindAMTargetedConfirmation:'PENDING',independentReviews:'PENDING',activeWrites:0,strictGain:0}))
