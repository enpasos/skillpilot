// SPDX-License-Identifier: Apache-2.0
// Technical materialization of actual author candidates. Reviewers stay separate.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync,mkdirSync,readFileSync,writeFileSync,symlinkSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {emptyGoalVisualizationAiReview} from '../../../../../../../app/scripts/goalVisualizationQaModel.ts'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url))
const scope=resolve(own,'../biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1')
const source=resolve(own,'../biologie-stoffwechsel-first-three-regional-source-remediation-author-20261008-v1')
const imageAuthor=resolve(own,'../biologie-stoffwechsel-first-three-images-author-20261008-v1')
const imageV3=resolve(own,'../biologie-stoffwechsel-third-antenna-targeted-image-author-20261008-v3')
const ids=['32f47903-0788-5c27-ac88-7464f481f2f7','135447a0-5d55-564a-afc3-3e3fbed77819','ec782ce3-475e-5628-b3fe-947d72e74a74']
const sha=(bytes:Buffer|string)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const rel=(path:string)=>relative(root,path)
const declared=new Map<string,any>()
const bind=(path:string)=>{const bytes=readFileSync(path),r={path:rel(path),sha256:sha(bytes),bytes:bytes.length};declared.set(path,r);return r}
const read=(path:string)=>{bind(path);return JSON.parse(readFileSync(path,'utf8'))}
const write=(path:string,value:any)=>{assert.ok(!existsSync(path),'Preserve existing artifact: '+path);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,Buffer.isBuffer(value)?value:typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');return bind(path)}
const scopeEntry=read(resolve(scope,'neutral-three-current-operative-source-scope.author.entry.json'))
bind(resolve(scope,'three-current-operative-source-scope.author.first-binding.freeze.json'))
assert.equal(scopeEntry.currentCanonicalNodeCount,476);assert.equal(scopeEntry.currentCurricularAtomicCount,392)
const oldImages=read(resolve(imageAuthor,'three-images.current-author.neutral.entry.json')).images
const changedImage=read(resolve(imageV3,'neutral-changed-third-antenna-v3.author.entry.json')).images
assert.equal(changedImage.length,1);assert.equal(changedImage[0].goalId,ids[2])
const images=ids.map(id=>id===ids[2]?changedImage[0]:oldImages.find((i:any)=>i.goalId===id))
bind(resolve(imageAuthor,'three-images.current-author.first-binding.freeze.json'))
bind(resolve(imageV3,'third-antenna-v3.author.first-binding.freeze.json'))
const wholeCases=read(resolve(source,'science/whole-six-DEEN-cases-and-fresh-transfers.exact-KEEP.json'))
const profiles=read(resolve(source,'science/whole-three-P-profiles.exact-KEEP.json'))
assert.equal(wholeCases.cases.length,6);assert.equal(profiles.goals.length,3)
assert.deepEqual([...new Set(wholeCases.cases.map((c:any)=>c.goalId))].sort(),[...ids].sort())
// Only neutral current source inputs enter the technical packet. No A/B
// operational judgments or future independent native judgments are imported.
for(const name of ['input/twenty-current-whole-source-duties-and-decisions.exact.json','input/all268-current-whole-partner-bodies-after19.exact.json','candidate/four-original-operator-HOLDs.exact-KEEP.json','pending-companions/two-real-basic-goal-bodies.ai-candidate.json'])read(resolve(scope,name))
const liveCanonPath=resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const liveKindsPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
const liveQAPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
const canonical=read(liveCanonPath),before=structuredClone(canonical),by=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
assert.equal(canonical.goals.length,476)
const scopeBaseline=read(resolve(scope,'input/canonical.current476.after19.exact.json'))
assert.deepEqual(canonical,scopeBaseline,'Current actual476 changed after neutral scope seal')
for(const c of wholeCases.cases)assert.deepEqual(by.get(c.goalId),c.wholeCurrentGoal,'Whole original science/case goal changed')
const kinds=read(liveKindsPath),qa=read(liveQAPath),oldQA=structuredClone(qa)
assert.equal(kinds.counts.curricularAtomic,392);assert.equal(qa.records.length,392)
const rasterBindings:any[]=[]
for(const im of images){
 const goal=by.get(im.goalId);assert.ok(goal);assert.deepEqual(goal.resourceLinks??[],[])
 const actualPath=resolve(root,im.path??im.assetPath),bytes=readFileSync(actualPath)
 assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Actual PNG required')
 assert.equal(sha(bytes),'sha256:'+im.sha256.replace('sha256:',''));bind(actualPath)
 for(const key of ['promptPath','reconstructionPromptPath','provenancePath'])bind(resolve(root,im[key]))
 const candidatePath=resolve(own,'selected-images',goal.id+'.png');write(candidatePath,bytes)
 const alias=resolve(own,'assets/goal-visualizations/biologie',goal.id,goal.id+'.png');assert.ok(!existsSync(alias));mkdirSync(dirname(alias),{recursive:true});symlinkSync(relative(dirname(alias),candidatePath),alias)
 const url='/assets/goal-visualizations/biologie/'+goal.id+'/'+goal.id+'.png'
 goal.resourceLinks=[{type:'goal-visualization',resourceType:'image',role:'primary',skillpilotId:goal.id,title:'Visualisierung: '+goal.title,url,provider:im.provider,description:im.descriptionDe,altText:im.altTextDe,lang:'de',license:'CC-BY-4.0',reviewStatus:'pilot'}]
 const q=qa.records.find((r:any)=>r.goalId===goal.id);assert.equal(q.visualizationState,'missing')
 Object.assign(q,{visualizationState:'available',missingReason:'',imageUrl:url,publicAssetPath:rel(candidatePath),canonicalAssetPath:rel(candidatePath),assetSha256:sha(bytes),chatGptNotes:'Actual current PNG/page author candidate. Two independent native D/P reviews and operative source/projection reviews are pending. Generation is not approval.',...emptyGoalVisualizationAiReview()})
 rasterBindings.push({goalId:goal.id,path:rel(candidatePath),url,sha256:sha(bytes),bytes:bytes.length,provider:im.provider,promptPath:im.promptPath,reconstructionPromptPath:im.reconstructionPromptPath})
}
for(const old of before.goals){const next=by.get(old.id);if(!ids.includes(old.id))assert.deepEqual(next,old);else assert.deepEqual(Object.fromEntries(Object.entries(next).filter(([k])=>k!=='resourceLinks')),Object.fromEntries(Object.entries(old).filter(([k])=>k!=='resourceLinks')))}
for(const old of oldQA.records){const next=qa.records.find((q:any)=>q.goalId===old.goalId);if(!ids.includes(old.goalId))assert.deepEqual(next,old);for(const k of Object.keys(old).filter(k=>k.startsWith('human')))assert.deepEqual(next[k],old[k])}
const canonPath=resolve(own,'candidate/canonical.current476.three-rasters.inactive.json'),kindPath=resolve(own,'candidate/semantic-kinds.current476.path-only.inactive.json'),qaPath=resolve(own,'candidate/visualization-qa.current392.three-unapproved.inactive.json')
write(canonPath,canonical);write(kindPath,{...kinds,sourceLandscapePath:rel(canonPath)});write(qaPath,qa)
for(const d of kinds.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(d.goalId)))
const inactive='app/scripts/config/goal-books/inactive/biologie-stoffwechsel-first-three-native-20261008-v1'
const atlas=read(resolve(scope,'candidate/ordinary-current392-source-atlas.inputs.json'))
Object.assign(atlas,{landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),outputDirectory:inactive+'/source-views',manifestPath:inactive+'/atlas.sources.json',navigationViewPath:inactive+'/navigation.view.json'})
write(resolve(root,inactive,'atlas.inputs.json'),atlas)
const built=buildGoalBookSourceAtlasInputs(atlas,root)
for(const [path,bytes] of Object.entries(built.outputs))write(resolve(root,path),bytes)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals,392);assert.equal(built.receipt.counts.publishedCurricularAtomicGoals,392)
const actualBefore=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
const book={...actualBefore.config,landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),goalVisualizationQaPath:rel(qaPath),compositionViewManifestPath:atlas.manifestPath,outputPath:rel(resolve(own,'native/full392.current-three-source-raster.book-model.json'))}
write(resolve(own,'candidate/book.current392.three-source-raster.inactive.config.json'),book)
const manifest=read(resolve(root,book.compositionViewManifestPath)),digests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available'){const actual=bind(resolve(root,q.publicAssetPath));assert.equal(actual.sha256,q.assetSha256);digests[q.imageUrl]=actual.sha256}
const model=buildGoalBookModel({landscape:canonical,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:read(resolve(root,path))})),navigationView:read(resolve(root,manifest.navigationViewPath)),durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),semanticKindLedger:{...kinds,sourceLandscapePath:rel(canonPath)},goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:book}as any)
assert.equal(model.pages.length,392);write(resolve(root,book.outputPath),model)
write(resolve(own,'native/full392.current-before.actual-loader.book-model.json'),actualBefore.model)
const changes=[]
for(const p of model.pages){const old=actualBefore.model.pages.find(q=>q.goalId===p.goalId)!;if(!ids.includes(p.goalId))assert.equal(stableGoalBookJson(p),stableGoalBookJson(old),'Unselected whole page/context changed '+p.goalId);else changes.push({goalId:p.goalId,changedKeys:Object.keys(p).filter(k=>stableGoalBookJson((p as any)[k])!==stableGoalBookJson((old as any)[k])),wholeBeforePage:old,wholeAfterPage:p})}
write(resolve(own,'checks/actual-whole392-before-vs-source-raster-candidate.page-context.diff.json'),{schemaVersion:1,rows:changes,other389WholePageAndContextObjectsExact:true,other473WholeCanonicalGoalsExact:true,other389QARowsExact:true,all392HumanRowsExact:true,existingStrict241BaselineUnchangedBecauseAll389UnselectedPagesExact:true,currentStrictNoNewClaim:241,rootMayIntegrateOnlyAfterTwoIndependentReviews:true,activeWrites:0,newStrictClosures:0})
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',criteria=bind(resolve(root,criteriaPath)).sha256
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const validP=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))),validCfg=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')))
const reviewId='biologie-stoffwechsel-first-three-current-raster-author-20261008-v1'
const records=profiles.goals.map((p:any)=>{const goal=by.get(p.goalId),im=rasterBindings.find(r=>r.goalId===p.goalId)!;assert.ok(im);const resources={[im.url]:im.sha256};const r={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,landscapeId:canonical.landscapeId,goalId:goal.id,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'Codex technical author candidate; independent current native D/P reviews pending',reason:'The whole original three profiles and six complete bilingual scientific cases stay exact. These current source/scope/raster/page bindings are actual author candidates awaiting two independent native D/P reviews and separately bound operative source/projection reviews. No synthetic author model is learner or performed-experiment evidence.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:['Two genuine independent current D/P reviews pending; no results or approvals imported into blind campaigns.','Source roles were separately reviewed, but the new operative scope candidate still needs independent source/projection judgments.','All twenty original duties, all268 original partners, four concrete original operator holds and separately pending true basis companions remain retained. No whole-regional-duty completion claimed.','No actual learner or experiment performance, human approval, human trial, or strict closure.'],profile:p.profile};assert.ok(validP(r),ajv.errorsText(validP.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r as any,goal,resources,'curricularAtomic'),[]);return r})
assert.deepEqual(records.map((r:any)=>r.profile),profiles.goals.map((p:any)=>p.profile))
const pPath=resolve(own,'positive/P3.current-raster.author.review.jsonl');write(pPath,records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const pConfig={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:canonical.landscapeId,landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),reviewCriteriaPath:criteriaPath,reviewPath:rel(pPath),reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Only three actual current image/source/page author candidates; independent current reviews pending',goalIds:ids}}
assert.ok(validCfg(pConfig),ajv.errorsText(validCfg.errors));write(resolve(own,'positive/P3.current-raster.inactive.config.json'),pConfig);write(resolve(own,'positive/P3.current-raster.future-active.config.json'),{...pConfig,landscapePath:rel(liveCanonPath),semanticKindLedgerPath:rel(liveKindsPath)})
write(resolve(own,'positive/whole-three-profiles-and-six-cases.exact-KEEP.json'),{schemaVersion:1,role:'Full original scientific candidate bodies retained; no new native approval',goals:profiles.goals,wholeCases:wholeCases.cases,wholeProfilesExact:true,wholeCasesExact:true,authorCandidateStatus:'needs_human_review',reviewAuthority:'ai_candidate'})
const batchId='biologie-stoffwechsel-first-three-current392-native-20261008-v1',ordered=model.pages.filter(p=>ids.includes(p.goalId)).map(p=>p.goalId)
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ordered,bookId:batchId,title:'Biologie: drei aktuelle Stoffwechsel-Prüfseiten'})
const native=resolve(own,'native-three'),modelPath=resolve(native,'book-model.json'),htmlPath=resolve(native,'book.html'),pdfPath=resolve(native,'book.pdf')
write(modelPath,subset)
const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard' as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
const pm=await writeGoalBookPdf(subset,pdfPath,options);await writeGoalBookRenderManifest(pm,pdfPath+'.render-manifest.json');assert.equal(pm.goalPageCount,3);assert.equal(pm.physicalPageCount,5)
const bundleDirectory=resolve(native,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const f of bundle.files)write(resolve(bundleDirectory,f.relativePath),f.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
const artifact=(role:string)=>{const a=bundle.manifest.artifacts.find(a=>a.role===role);assert.ok(a);return a}
const campaigns=[]
for(const side of ['a','b']){const outputDirectory=resolve(native,'round-'+side);const result=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(bundleDirectory,'review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDirectory,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDirectory,artifact('review_input_json').path)),bundleDirectory,outputDirectory,campaignOptions:{campaignId:batchId+'-campaign-'+side,roundId:batchId+'-independent-'+side,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:batchId+'-independent-'+side,blindToOtherReviews:true,batchSize:20}});assert.equal(result.campaign.batches.length,1);assert.deepEqual(result.campaign.batches[0].goalIds,ordered);campaigns.push({side,campaignPath:rel(resolve(outputDirectory,'description-review-campaign.json')),inputPath:rel(resolve(outputDirectory,'description-review-input.json')),actualResultsCreated:0})}
write(resolve(own,'neutral-current-first-three-native.technical.entry.json'),{schemaVersion:1,role:'Actual whole current pages/rasters/P3 for two independent native D/P reviews; no new approval',selectedGoalIds:ids,rasterBindings,fullCurrentAtomicBase:392,wholeCanonicalGoalCount:476,other473WholeGoalsExact:true,other389WholePagesAndContextsExact:true,all392HumanQARowsExact:true,whole3ProfilesAnd6CasesKept:true,wholeCasesPath:rel(resolve(source,'science/whole-six-DEEN-cases-and-fresh-transfers.exact-KEEP.json')),sourceOperationalCandidateEntry:bind(resolve(scope,'neutral-three-current-operative-source-scope.author.entry.json')),sourceOperationalStatus:'PENDING_TWO_INDEPENDENT_CURRENT_PROJECTION_REVIEWS',sourceWholeOperatorHoldsRetained:4,truePendingBasisCompanionsNotInCurrent392:2,actualOriginalImageEntry:bind(resolve(imageAuthor,'three-images.current-author.neutral.entry.json')),actualChangedThirdImageEntry:bind(resolve(imageV3,'neutral-changed-third-antenna-v3.author.entry.json')),positiveConfigPath:rel(resolve(own,'positive/P3.current-raster.inactive.config.json')),fullBookModelPath:book.outputPath,currentCandidateCanonicalPath:rel(canonPath),portableReviewBundlePath:rel(resolve(bundleDirectory,'review-bundle-manifest.json')),actualPdf:bind(resolve(bundleDirectory,artifact('book_pdf').path)),actualPdfPhysicalPages:5,pageMap:ordered.map((goalId,i)=>({goalId,physicalPage:pm.frontMatterPageCount+i+1})),campaigns,ordinaryCurrentPublicLoader:'Read before current actual476/392 successfully; candidate future public loader pending reviewed install',authorInputBindings:[...declared.values()],nativeDPReviewStatus:'PENDING_TWO_INDEPENDENT_REVIEWERS',activeWrites:0,newStrictClosures:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({actualFull392:true,actualNative3:true,actualStandardPhysicalPdfPages:5,closedP3Errors:0,other389WholePagesExact:true,nativeDP:'PENDING',operativeSourceProjection:'PENDING',activeWrites:0,strictGain:0}))
