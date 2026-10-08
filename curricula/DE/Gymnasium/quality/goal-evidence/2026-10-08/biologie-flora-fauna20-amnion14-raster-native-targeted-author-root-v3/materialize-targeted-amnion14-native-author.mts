// SPDX-License-Identifier: Apache-2.0
// Inactive author input creation. No active files, review verdicts or invented runs.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalBookModel,fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import {buildGoalDescriptionReviewInput,buildGoalDescriptionReviewCampaign,serializeGoalDescriptionReviewBatchInput,loadGoalDescriptionReviewRecordSchemaBytes,validateGoalDescriptionReviewCampaign,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {verifyGoalBookReviewBundleArtifactBytes,writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
import {POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),out=resolve(own,'native-raster-candidate')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
assert.equal(process.argv.length,4,'Supply exact final candidate-set and whole-material Markdown paths; never overwrite old text inputs')
const candidatesPath=resolve(root,process.argv[2]),candidates=read(candidatesPath)
const materialsMarkdownPath=resolve(root,process.argv[3]),materials=read(materialsMarkdownPath.replace(/\.md$/u,'.json'))
assert.equal(materials.goals.length,20)
for(const entry of materials.goals){
  const positive=candidates.goals.find((row:any)=>row.goalId===entry.goalId);assert.ok(positive)
  for(const wholeCase of entry.cases){
    const brief=positive.profile.applicationCaseBriefs.find((row:any)=>row.id===wholeCase.id);assert.ok(brief)
    for(const [lang,suffix]of [['de','De'],['en','En']]){
      assert.equal(brief['taskDemand'+suffix],wholeCase.material[lang]+' '+wholeCase.task[lang])
      assert.equal(brief['expectedPerformance'+suffix],wholeCase.modelAnswer[lang])
    }
  }
}
const frozenGoals=read(resolve(own,'current20-whole-DEEN-goals.actual.json')).goals
const ids=frozenGoals.map((g:any)=>g.id) as string[]
assert.equal(ids.length,20);assert.deepEqual(candidates.goals.map((g:any)=>g.goalId),ids)
const canonicalPath=resolve(own,'candidate/canonical.current474-twenty-new-raster-author.json'),landscape=read(canonicalPath)
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]));assert.equal(by.size,landscape.goals.length)
const kinds=read(resolve(own,'candidate/semantic-kinds.current-source.exact.json'))
assert.equal(kinds.counts.total,by.size);assert.equal(kinds.counts.curricularAtomic,391)
// Source-fingerprint fields are unchanged: linking pictures never becomes a new A/M verdict.
for(const decision of kinds.decisions)assert.equal(decision.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(decision.goalId)))
kinds.sourceLandscapePath=relative(root,canonicalPath)
write(resolve(own,'candidate/semantic-kinds.current474-twenty-raster-inert.json'),kinds)
const qa=read(resolve(own,'candidate/visualization-qa.current391-twenty-raster-author.json')),digests:Record<string,string>={}
for(const record of qa.records)if(record.visualizationState==='available')digests[record.imageUrl]=sha(readFileSync(resolve(root,record.publicAssetPath)))
const actualConfig=read(resolve(own,'native20.neutral.batch.config.json')).baseGoalBookConfigPath
const baseConfig=read(resolve(root,actualConfig))
const config={...baseConfig,landscapePath:relative(root,canonicalPath),semanticKindLedgerPath:relative(root,resolve(own,'candidate/semantic-kinds.current474-twenty-raster-inert.json')),goalVisualizationQaPath:relative(root,resolve(own,'candidate/visualization-qa.current391-twenty-raster-author.json')),evidenceReviewPaths:[],outputPath:relative(root,resolve(out,'full391.book-model.json'))}
write(resolve(out,'full391.book.config.author.json'),config)
const manifest=read(resolve(root,config.compositionViewManifestPath!))
const sourceLandscape=read(resolve(own,'candidate/canonical.before-twenty-links.exact.json'))
const sourceKinds=read(resolve(own,'candidate/semantic-kinds.before-twenty-links.exact.json'))
sourceKinds.sourceLandscapePath=relative(root,resolve(own,'candidate/canonical.before-twenty-links.exact.json'))
const sourceQa=read(resolve(own,'candidate/visualization-qa.before-twenty-links.exact.json'))
const beforeConfig={...baseConfig,landscapePath:relative(root,resolve(own,'candidate/canonical.before-twenty-links.exact.json')),evidenceReviewPaths:[]}
const beforeModel=buildGoalBookModel({landscape:sourceLandscape,compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:read(resolve(root,path))})),
  navigationView:read(resolve(root,manifest.navigationViewPath)),durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),
  semanticKindLedger:sourceKinds,goalVisualizationQa:sourceQa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:beforeConfig}as any)
assert.equal(beforeModel.pages.length,391)
write(resolve(out,'full391.before-twenty-links.pure.book-model.json'),beforeModel)
const model=buildGoalBookModel({landscape,compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:read(resolve(root,path))})),
  navigationView:read(resolve(root,manifest.navigationViewPath)),durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),
  semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config}as any)
assert.equal(model.pages.length,391)
const oldPages=new Map<string,any>(beforeModel.pages.map(p=>[p.goalId,p]))
const changedPages=model.pages.filter(p=>p.pageFingerprint!==oldPages.get(p.goalId)?.pageFingerprint)
assert.deepEqual(new Set(changedPages.map(p=>p.goalId)),new Set(ids),'No unrelated current page may drift')
write(resolve(out,'full391.book-model.json'),model)
write(resolve(out,'unchanged371-pages-and-retained-classification.actual.json'),{
  wholeCanonicalCount:by.size,curricularAtomicCount:391,unchangedPageFingerprints:371,changedPageGoalIds:changedPages.map(p=>p.goalId),
  allCurrentSemanticClassificationDecisionRowsRetained:true,retainedClassificationRows:by.size,all391AMDecisionsRetained:true,goalTextChanges:0,
  prerequisiteChanges:0,applicabilityChanges:0,activeWrites:0,newStrictClosuresClaimed:0})
const ordered=model.pages.filter(p=>p.goalId==='321ea315-37fe-5f9e-8fa8-dd631bb447c7').map(p=>p.goalId);assert.equal(ordered.length,1)
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ordered,bookId:'biologie-flora-fauna20-targeted-amnion14-current391-author-v3',title:'Biologie: gezielte Amnion-Bildkorrektur'})
const modelPath=resolve(out,'twenty/book-model.json'),htmlPath=resolve(out,'twenty/book.html'),pdfPath=resolve(out,'twenty/book.pdf')
write(modelPath,subset)
const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'bounded-atlas'as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
await writeGoalBookRenderManifest(await writeGoalBookPdf(subset,pdfPath,options),pdfPath+'.render-manifest.json')
const bundleDirectory=resolve(out,'twenty/bundle')
const bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,
  promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),
  criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const file of bundle.files)write(resolve(bundleDirectory,file.relativePath),file.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
const verified=await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory)
const input=buildGoalDescriptionReviewInput({bundle:bundle.manifest,reviewInput:bundle.input,landscape})
const schemaBytes=await loadGoalDescriptionReviewRecordSchemaBytes()
for(const side of ['a','b']){
  const campaignOut=resolve(out,'twenty/round-'+side)
  const campaign=buildGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,
    campaignId:'biologie-flora-fauna20-targeted-amnion14-campaign-'+side+'-20261008-v3',
    roundId:'biologie-flora-fauna20-targeted-amnion14-independent-'+side+'-20261008-v3',
    reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',
    independenceGroupId:'biologie-flora-fauna20-targeted-amnion14-independent-'+side+'-20261008-v3',
    blindToOtherReviews:true,recordSchemaDigest:sha(schemaBytes),batchSize:1})
  const checked=await validateGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaign});assert.deepEqual(checked.errors,[])
  write(resolve(campaignOut,'review-bundle-manifest.json'),bundle.manifest)
  write(resolve(campaignOut,'description-review-input.json'),input)
  write(resolve(campaignOut,'description-review-campaign.json'),campaign)
  write(resolve(campaignOut,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),schemaBytes)
  await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle:bundle.manifest,campaignDirectory:campaignOut,verifiedArtifactBytes:verified})
  assert.equal(campaign.batches.length,1)
  for(const batch of campaign.batches){
    const bytes=serializeGoalDescriptionReviewBatchInput({bundleFingerprint:bundle.manifest.bundleFingerprint,bookDigest:bundle.manifest.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals})
    const path=resolve(campaignOut,'batches',batch.batchId+'.input.jsonl');write(path,bytes)
    assert.equal(sha(readFileSync(path)),batch.batchInputFingerprint);assert.equal(readFileSync(path,'utf8').trim().split('\n').length,1)
  }
}
// Native P schema and semantic checks bind exact inactive actual PNG bytes.
// The public-files CLI is intentionally deferred until approved integration: it only accepts active app/public paths.
const criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md')
const criteria=sha(readFileSync(criteriaPath)),ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validator=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const positive=[]
for(const candidate of candidates.goals){
  const goal=by.get(candidate.goalId),resources:Record<string,string>={}
  for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization'){assert.ok(digests[link.url]);resources[link.url]=digests[link.url]}
  const record={$schema:POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,
    reviewId:'biologie-flora-fauna20-twenty-current391-positive-raster-author-v1',goalFingerprintRuleVersion:POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,
    profileRuleVersion:POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,reviewCriteriaFingerprint:criteria,landscapeId:landscape.landscapeId,goalId:goal.id,
    goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
    reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic'),
    profileFingerprint:fingerprintPositiveGoalEvidenceProfile(candidate.profile),status:'needs_human_review'as const,reviewAuthority:'ai_candidate'as const,
    reviewedAt:new Date().toISOString(),reviewer:candidates.reviewer,
    reason:'Vollständiger bilingualer Autor-Kandidat mit tatsächlicher aktueller Rasterbindung. Fachliche unabhängige Reviews und menschliche Prüfung stehen aus; kein Nachweis einer Lernendenleistung.',
    evidenceLevel:'E1'as const,maximumClaimScope:'G1'as const,reviewRunIds:[],dissent:[...candidate.dissent],profile:candidate.profile}
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[])
  assert.ok(validator(record),ajv.errorsText(validator.errors));positive.push(record)
}
write(resolve(out,'P20.actual-raster-author.review.jsonl'),positive.map(r=>JSON.stringify(r)).join('\n')+'\n')
write(resolve(out,'P20.actual-raster-schema-and-semantics.author.actual.json'),{nativeApi:'validatePositiveGoalEvidenceRecordSemantics',closedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',records:20,casePairs:40,schemaErrors:0,semanticErrors:0,exactActualRasterDigestsBound:true,actualPublicCLIStillPendingIntegration:true,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',realLearnerEvidence:false,humanApproval:false,strictGainClaimed:0})
write(resolve(out,'twenty/current-neutral-full-input.json'),{
  role:'Inactive author candidate; twenty actual independent current D/P/V reviews pending',wholeSelectedGoals:ordered.map(id=>by.get(id)),
  actualNativeInput:input,actualPDF:'native-raster-candidate/twenty/book.pdf',physicalGoalPages:ordered.map((goalId,index)=>({goalId,physicalPage:index+3})),
  actualPNGs:ordered.map(goalId=>({goalId,path:'selected-images/'+goalId+'.png'})),
  completeBilingualMaterials:relative(root,candidatesPath),wholeBilingualMaterialFile:relative(root,materialsMarkdownPath),
  boundedActualPrimaryReadingReceipt:'../biologie-flora-fauna20-current391-author-v1/actual-whole-HE-G9-primary-reading.author.receipt.json',sourceAndOriginalDContextBoundary:'current-twenty-retained-AM.exact-binding.author.receipt.json',
  retainedAM:'current-twenty-retained-AM.exact-binding.author.receipt.json',
  independentFirstPassDirectories:['native-raster-candidate/twenty/round-a','native-raster-candidate/twenty/round-b'],
  publicRecordsNeverAuthoritative:true,realLearnerEvidence:false,humanApproval:false,activeWrites:0,strictGainClaimed:0})
console.log(JSON.stringify({actualFullPureModel:391,actualNativeSubset:1,exactUnchangedPages:371,nativeBlindCampaigns:2,persistedActualJSONLRecordsPerCampaign:1,nativeP20SchemaAndSemantics:'PASS',authorApproval:false,strictGainClaimed:0}))
