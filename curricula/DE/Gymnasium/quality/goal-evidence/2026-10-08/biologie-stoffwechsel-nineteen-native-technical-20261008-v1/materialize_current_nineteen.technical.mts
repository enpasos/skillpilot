// SPDX-License-Identifier: Apache-2.0
// Assemble actual raster candidates and unchanged profiles with ordinary APIs.
// Scientific/native review decisions are supplied later by distinct reviewers.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,symlinkSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalBookModel,fingerprintSemanticKindSourceGoal,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {emptyGoalVisualizationAiReview} from '../../../../../../../app/scripts/goalVisualizationQaModel.ts'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),author=resolve(own,'../biologie-stoffwechsel-resume-author-20261008-v1')
const sha=(bytes:Buffer|string)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const rel=(path:string)=>relative(root,path)
const declared=new Map<string,any>()
const bind=(path:string)=>{const bytes=readFileSync(path),r={path:rel(path),sha256:sha(bytes),bytes:bytes.length};declared.set(path,r);return r}
const read=(path:string)=>{bind(path);return JSON.parse(readFileSync(path,'utf8'))}
const write=(path:string,value:any)=>{assert.equal(existsSync(path),false,'Preserve existing artifact: '+path);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,Buffer.isBuffer(value)?value:typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');return bind(path)}
const imageEntryPath=resolve(root,process.argv[2]??'');assert.ok(process.argv[2],'Supply actual completed neutral image entry path')
const images=read(imageEntryPath).images
const entry=read(resolve(author,'neutral-author-continuation.entry.json')),ids:string[]=entry.goalIds
assert.equal(images.length,19);assert.deepEqual(images.map((r:any)=>r.goalId).sort(),[...ids].sort())
const wholeCases=read(resolve(root,entry.wholeCases))
assert.equal(wholeCases.caseCount,38);assert.equal(wholeCases.cases.length,38)
assert.deepEqual([...new Set(wholeCases.cases.map((c:any)=>c.goalId))].sort(),[...ids].sort())
for(const key of ['sourceRoleCandidates','operativeFull144SourceCandidate','operativeFull144MappingCandidate','allRegionalDutiesAndPartners'])read(resolve(root,entry[key]))
const sourcePair=read(resolve(own,'actual-paired-nineteen-source-role-convergence.technical.json'))
assert.equal(sourcePair.pairedBoundedSourceRoles.length,19);assert.equal(sourcePair.whole144SourceApproval,false)
for(const key of ['independentASourceVerdict','independentBSourceVerdict','independentBFirstVerdictSeal']){
 const receipt=sourcePair[key],actual=bind(resolve(root,receipt.path));assert.equal(actual.sha256,receipt.sha256);assert.equal(actual.bytes,receipt.bytes)
}
bind(resolve(own,'../biologie-stoffwechsel-source-roles-independent-a-resume-root-20261008-v1/independent-a.source-reading.first-verdict.freeze.json'))
const liveCanonPath=resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const liveKindsPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
const liveQAPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
const canonical=read(liveCanonPath),before=structuredClone(canonical),by=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
assert.equal(canonical.goals.length,476)
const authorGoals=read(resolve(author,'whole19.current-goals-and-context.author.json')).wholeGoals
for(const g of authorGoals)assert.deepEqual(by.get(g.id),g,'Changed author/current goal: '+g.id)
for(const c of wholeCases.cases)assert.deepEqual(by.get(c.goalId),c.wholeCurrentGoal,'Original case goal differs before raster insertion: '+c.goalId)
const kinds=read(liveKindsPath),qa=read(liveQAPath),oldQA=structuredClone(qa)
assert.equal(kinds.counts.curricularAtomic,392);assert.equal(qa.records.length,392)
const rasterBindings=[]
for(const im of images){
 const goal=by.get(im.goalId);assert.ok(goal);assert.deepEqual(goal.resourceLinks??[],[])
 const actualPath=resolve(root,im.path??im.assetPath),bytes=readFileSync(actualPath)
 assert.ok(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Actual PNG required')
 assert.equal(sha(bytes),'sha256:'+im.sha256.replace('sha256:',''));bind(actualPath)
 assert.ok(im.provider&&im.descriptionDe&&im.altTextDe&&im.promptPath&&im.reconstructionPromptPath)
 bind(resolve(root,im.promptPath))
 bind(resolve(root,im.reconstructionPromptPath))
 const candidatePath=resolve(own,'selected-images',goal.id+'.png');write(candidatePath,bytes)
 const alias=resolve(own,'assets/goal-visualizations/biologie',goal.id,goal.id+'.png')
 assert.equal(existsSync(alias),false);mkdirSync(dirname(alias),{recursive:true});symlinkSync(relative(dirname(alias),candidatePath),alias)
 const url='/assets/goal-visualizations/biologie/'+goal.id+'/'+goal.id+'.png'
 goal.resourceLinks=[{type:'goal-visualization',resourceType:'image',role:'primary',skillpilotId:goal.id,title:'Visualisierung: '+goal.title,url,provider:im.provider,description:im.descriptionDe,altText:im.altTextDe,lang:'de',license:'CC-BY-4.0',reviewStatus:'pilot'}]
 const q=qa.records.find((r:any)=>r.goalId===goal.id);assert.equal(q.visualizationState,'missing')
 Object.assign(q,{visualizationState:'available',missingReason:'',imageUrl:url,publicAssetPath:rel(candidatePath),canonicalAssetPath:rel(candidatePath),assetSha256:sha(bytes),chatGptNotes:'Actual raster candidate; two independent current native D/P/V reviews pending. Generation is not approval.',...emptyGoalVisualizationAiReview()})
 rasterBindings.push({goalId:goal.id,path:rel(candidatePath),url,sha256:sha(bytes),bytes:bytes.length,provider:im.provider,promptPath:im.promptPath,reconstructionPromptPath:im.reconstructionPromptPath})
}
for(const old of before.goals){const next=by.get(old.id);if(!ids.includes(old.id))assert.deepEqual(next,old);else{assert.deepEqual(Object.fromEntries(Object.entries(next).filter(([k])=>k!=='resourceLinks')),Object.fromEntries(Object.entries(old).filter(([k])=>k!=='resourceLinks')))}}
for(const old of oldQA.records){const next=qa.records.find((r:any)=>r.goalId===old.goalId);if(!ids.includes(old.goalId))assert.deepEqual(next,old);for(const k of Object.keys(old).filter(k=>k.startsWith('human')))assert.deepEqual(next[k],old[k])}
const canonPath=resolve(own,'candidate/canonical.current476.nineteen-rasters.inactive.json'),kindPath=resolve(own,'candidate/semantic-kinds.current476.path-only.inactive.json'),qaPath=resolve(own,'candidate/visualization-qa.current392.nineteen-unapproved.inactive.json')
write(canonPath,canonical);write(kindPath,{...kinds,sourceLandscapePath:rel(canonPath)});write(qaPath,qa)
const book=read(resolve(own,'source-atlas/book.source-only.inactive-v2.config.json'))
Object.assign(book,{landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),goalVisualizationQaPath:rel(qaPath),outputPath:rel(resolve(own,'native/full392.current-raster.book-model.json'))})
const bookConfigPath=resolve(own,'candidate/book.current392.raster.inactive.config.json');write(bookConfigPath,book)
// The ordinary public-files loader deliberately accepts only active app/public
// paths. Candidates remain inactive; the existing model API consumes their real
// raster bytes. The public loader is required after reviewed installation.
for(const decision of kinds.decisions)assert.equal(decision.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(decision.goalId)))
const manifest=read(resolve(root,book.compositionViewManifestPath)),digests:Record<string,string>={}
for(const row of qa.records)if(row.visualizationState==='available'){
 const actual=bind(resolve(root,row.publicAssetPath));assert.equal(actual.sha256,row.assetSha256);digests[row.imageUrl]=actual.sha256
}
const model=buildGoalBookModel({landscape:canonical,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:read(resolve(root,path))})),navigationView:read(resolve(root,manifest.navigationViewPath)),durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),semanticKindLedger:{...kinds,sourceLandscapePath:rel(canonPath)},goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:book}as any)
assert.equal(model.pages.length,392);write(resolve(root,book.outputPath),model)
const beforeModel=read(resolve(own,'source-atlas/full392.before.actual-book-model.json'))
for(const page of beforeModel.pages)if(!ids.includes(page.goalId))assert.equal(stableGoalBookJson(page),stableGoalBookJson(model.pages.find(p=>p.goalId===page.goalId)),'Unaffected page changed: '+page.goalId)
const profiles=read(resolve(author,'P19.exact-retained-v5.author.candidates.json'))
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',criteria=bind(resolve(root,criteriaPath)).sha256
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const schema=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const reviewId='biologie-stoffwechsel-nineteen-current-raster-author-20261008-v1'
const records=profiles.goals.map((p:any)=>{
 const goal=by.get(p.goalId),im=rasterBindings.find(r=>r.goalId===p.goalId)!;assert.ok(im)
 const resources={[im.url]:im.sha256}
 const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,landscapeId:canonical.landscapeId,goalId:goal.id,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(p.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'Codex technical candidate materializer; independent native D/P/V reviews pending',reason:'Unchanged complete v5 positive profile and v4 bilingual case bodies retained with current actual PNG resources. This is technical candidate preparation, not approval of the new picture/page/context.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:['Actual independent current D/P/V reviews still required.','No actual learner or executed-experiment evidence; no human approval or trial.','Bounded source contributions retain all original operator/partner duties and excluded holds.'],profile:p.profile}
 assert.ok(schema(record),ajv.errorsText(schema.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record as any,goal,resources,'curricularAtomic'),[])
 return record
})
const pPath=resolve(own,'positive/P19.current-raster.author.review.jsonl');write(pPath,records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const pConfig={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:canonical.landscapeId,landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),reviewCriteriaPath:criteriaPath,reviewPath:rel(pPath),reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'19 current actual PNG/page candidates; independent native reviews pending',goalIds:ids}}
write(resolve(own,'positive/P19.current-raster.inactive.config.json'),pConfig)
write(resolve(own,'positive/P19.current-raster.future-active.config.json'),{...pConfig,landscapePath:rel(liveCanonPath),semanticKindLedgerPath:rel(liveKindsPath)})
const batchId='biologie-stoffwechsel-nineteen-current392-native-20261008-v1'
const ordered=model.pages.filter(p=>ids.includes(p.goalId)).map(p=>p.goalId)
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ordered,bookId:batchId,title:'Biologie: Stoffwechsel und ökologische Modelle – neunzehn aktuelle Prüfseiten'})
const native=resolve(own,'native-nineteen'),modelPath=resolve(native,'book-model.json'),htmlPath=resolve(native,'book.html'),pdfPath=resolve(native,'book.pdf')
write(modelPath,subset)
const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'bounded-atlas' as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
const pm=await writeGoalBookPdf(subset,pdfPath,options);await writeGoalBookRenderManifest(pm,pdfPath+'.render-manifest.json');assert.equal(pm.goalPageCount,19)
const bundleDirectory=resolve(native,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const file of bundle.files)write(resolve(bundleDirectory,file.relativePath),file.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
const artifact=(role:string)=>{const a=bundle.manifest.artifacts.find(a=>a.role===role);assert.ok(a);return a}
const campaigns=[]
for(const side of ['a','b']){
 const outputDirectory=resolve(native,'round-'+side)
 const result=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(bundleDirectory,'review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDirectory,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDirectory,artifact('review_input_json').path)),bundleDirectory,outputDirectory,campaignOptions:{campaignId:batchId+'-campaign-'+side,roundId:batchId+'-independent-'+side,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:batchId+'-independent-'+side,blindToOtherReviews:true,batchSize:20}})
 assert.equal(result.campaign.batches.length,1);assert.deepEqual(result.campaign.batches[0].goalIds,ordered)
 campaigns.push({side,campaignPath:rel(resolve(outputDirectory,'description-review-campaign.json')),inputPath:rel(resolve(outputDirectory,'description-review-input.json')),actualResultsCreated:0})
}
write(resolve(own,'neutral-current-nineteen-native.technical.entry.json'),{schemaVersion:1,role:'Actual candidate pages/rasters for two independent native D/P/V reviews; not approval',selectedGoalIds:ids,rasterBindings,fullCurrentAtomicBase:392,wholeCanonicalGoalCount:476,other457WholeGoalsExact:true,other373WholePagesExact:true,all392HumanQARowsExact:true,whole19ProfilesAnd38CasesKept:true,caseGoalSnapshots:'Original exact historical case metadata retained; operative current PNG links are bound in the new native model and positive records.',wholeSourceDutiesAndFiveExcludedHoldsRetained:true,wholeCasesPath:entry.wholeCases,wholeCurrentGoalsAndContextsPath:entry.wholeCurrentGoalBodies,pairedSourceRolesPath:rel(resolve(own,'actual-paired-nineteen-source-role-convergence.technical.json')),originalImageCandidateEntry:bind(imageEntryPath),positiveConfigPath:rel(resolve(own,'positive/P19.current-raster.inactive.config.json')),fullBookModelPath:book.outputPath,currentCandidateCanonicalPath:rel(canonPath),portableReviewBundlePath:rel(resolve(bundleDirectory,'review-bundle-manifest.json')),actualPdf:bind(resolve(bundleDirectory,artifact('book_pdf').path)),pageMap:ordered.map((goalId,i)=>({goalId,physicalPage:pm.frontMatterPageCount+i+1})),campaigns,normalPublicLoader:'PENDING_REVIEWED_CANDIDATE_INSTALLATION',authorInputBindings:[...declared.values()],nativeDPVReviewStatus:'PENDING_TWO_INDEPENDENT_REVIEWERS',activeWrites:0,newStrictClosures:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({actualFull392:true,actualNative19:true,closedP19Errors:0,other373PagesExact:true,nativeDPV:'PENDING',activeWrites:0,strictGain:0}))
