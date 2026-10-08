// SPDX-License-Identifier: Apache-2.0
// Actual author narrowing of three weak source witnesses. Old attempts remain.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts,verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url)),rel=(p:string)=>relative(root,p)
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>({path:rel(p),sha256:sha(readFileSync(p)),bytes:readFileSync(p).length})
const write=(p:string,v:any)=>{assert.ok(!existsSync(p),'Preserve existing artifact '+p);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,Buffer.isBuffer(v)?v:typeof v==='string'?v:JSON.stringify(v,null,2)+'\n')}
const source3=resolve(own,'../biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1')
const duties=read(resolve(source3,'input/twenty-current-whole-source-duties-and-decisions.exact.json')).rows
const source3Atlas=read(resolve(source3,'candidate/ordinary-current392-source-atlas.inputs.json'))
const atlas=read(resolve(own,'../../../../../../../app/scripts/config/goal-books/inactive/biologie-stoffwechsel-two-basic-complete-20261008-v2/atlas.actual394.inputs.json'))
const withdrawals=[1,3,18],resp='0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38',coupling='32483d30-2162-50a5-a6cc-05b7f2467ab1'
const withdrawalRecords=[]
atlas.mappingPaths=atlas.mappingPaths.map((path:string,i:number)=>{
 const original=read(resolve(root,path)),changed=structuredClone(original),earlier=read(resolve(root,source3Atlas.mappingPaths[i]))
 const selected=duties.filter((r:any)=>withdrawals.includes(r.sourceOrdinal)&&original.decisions.some((d:any)=>d.sourceGoalId===r.wholeSourceDuty.id))
 if(selected.length===0)return path
 for(const r of selected){
  const id=r.wholeSourceDuty.id,d=changed.decisions.find((d:any)=>d.sourceGoalId===id),old=earlier.decisions.find((d:any)=>d.sourceGoalId===id)
  assert.ok(d.canonicalGoalIds.includes(resp));assert.ok(!old.canonicalGoalIds.includes(resp));assert.ok(old)
  const index=changed.decisions.indexOf(d);changed.decisions[index]=structuredClone(old)
  const removed=changed.mappings.filter((m:any)=>m.legacyGoalId===id&&m.canonicalGoalId===resp);assert.equal(removed.length,1)
  changed.mappings=changed.mappings.filter((m:any)=>!(m.legacyGoalId===id&&m.canonicalGoalId===resp))
  assert.deepEqual(changed.mappings.filter((m:any)=>m.legacyGoalId===id),earlier.mappings.filter((m:any)=>m.legacyGoalId===id))
  withdrawalRecords.push({sourceOrdinal:r.sourceOrdinal,sourceGoalId:id,wholeOriginalDuty:r.wholeSourceDuty,wholeEarlierAuthorDecision:d,wholeCorrectedDecision:old,withdrawnOnlyAdditionalCandidateEdge:removed[0],reasonDe:r.sourceOrdinal===18?'Die Pflanzenpassage36/37 nennt Assimilation/Dissimilation, Pflanzenstoffwechsel und Fotosynthese-Wort-/Bruttogleichung; sie trägt nicht selbst das ganze spezifische neue aerobe Resp-Wort-/Energieziel. Die direkte menschliche Zellatmungspassage35 und ihre Ord17-Pflicht bleiben echter ST-Targetzeuge.':'Die amtliche Ökosystempassage29 nennt Fotosynthesebedeutung, Energiefluss und optional Stoffkreisläufe als Wortgleichungen; sie verlangt keine ganze aerobe Zellatmungs-Wort-/Energiekompetenz. Die direkt benannte Zellatmung in der menschlichen Stoffwechselpassage30, Ord2/4, bleibt der echte regionale Targetzeuge.',wholeDutyAndOldPartnersKeep:true,noWholeSourceApproval:true})
 }
 const selectedIds=selected.map((r:any)=>r.wholeSourceDuty.id)
 assert.deepEqual(changed.decisions.filter((d:any)=>!selectedIds.includes(d.sourceGoalId)),original.decisions.filter((d:any)=>!selectedIds.includes(d.sourceGoalId)))
 assert.deepEqual(Object.fromEntries(Object.entries(changed).filter(([k])=>!['decisions','mappings'].includes(k))),Object.fromEntries(Object.entries(original).filter(([k])=>!['decisions','mappings'].includes(k))))
 const result=resolve(own,'candidate/mappings-primary-refined',String(i+1).padStart(2,'0')+'-'+path.split('/').at(-1));write(result,changed);return rel(result)
})
assert.equal(withdrawalRecords.length,3)
const inactive='app/scripts/config/goal-books/inactive/biologie-stoffwechsel-two-basic-primary-refined-20261008-v2'
Object.assign(atlas,{outputDirectory:inactive+'/source-views',manifestPath:inactive+'/atlas.sources.json',navigationViewPath:inactive+'/navigation.view.json'})
write(resolve(root,inactive,'atlas.inputs.json'),atlas)
const built=buildGoalBookSourceAtlasInputs(atlas,root)
for(const [p,b]of Object.entries(built.outputs))write(resolve(root,p),b)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals,394);assert.equal(built.receipt.counts.publishedCurricularAtomicGoals,394)
const wholeBefore=read(resolve(own,'native/full394.basic2-after-source3.actual-model.json'))
const book=read(resolve(own,'candidate/book.shadow394.basic2-after-source3.inactive.config.json'))
book.compositionViewManifestPath=atlas.manifestPath;book.outputPath=rel(resolve(own,'native/full394.actual-primary-refined.final-model.json'))
const canon=read(resolve(root,book.landscapePath)),kinds=read(resolve(root,book.semanticKindLedgerPath)),qa=read(resolve(root,book.goalVisualizationQaPath)),manifest=read(resolve(root,atlas.manifestPath)),digests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available'){const bytes=readFileSync(resolve(root,q.publicAssetPath));assert.equal(sha(bytes),q.assetSha256);digests[q.imageUrl]=sha(bytes)}
const model=buildGoalBookModel({landscape:canon,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:read(resolve(root,p))})),navigationView:read(resolve(root,manifest.navigationViewPath)),durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:book}as any)
assert.equal(model.pages.length,394);assert.equal(stableGoalBookJson(parseAndValidateGoalBookModel(model)),stableGoalBookJson(model));write(resolve(root,book.outputPath),model)
for(const p of model.pages)assert.deepEqual(p,wholeBefore.pages.find((q:any)=>q.goalId===p.goalId),'All actual394 pages must remain exact after weak witness removal')
const actualEdges=[]
for(const path of atlas.mappingPaths){const m=read(resolve(root,path));for(const d of m.decisions)for(const goalId of [resp,coupling])if(d.canonicalGoalIds.includes(goalId))actualEdges.push({sourceGoalId:d.sourceGoalId,goalId,mappingPath:path,wholeDecision:d,wholePartnerRow:m.mappings.find((r:any)=>r.legacyGoalId===d.sourceGoalId&&r.canonicalGoalId===goalId)})}
assert.equal(actualEdges.length,10);assert.equal(new Set(actualEdges.map(r=>r.sourceGoalId)).size,9)
write(resolve(own,'sources/actual-primary-refined-nine-duties-ten-ordinary-edges.final-author.json'),{schemaVersion:1,role:'Actual primary-source author correction before independent source review',withdrawals:withdrawalRecords,actualFinalNewEdges:actualEdges,actualFinalChangedDutyCount:9,actualFinalNewEdgeCount:10,whole20OriginalDutiesAnd268PartnersRetainedInBoundOriginalInputs:true,allFourOriginalOperatorHoldsRetained:true,actualFinalAtlasConfigPath:rel(resolve(root,inactive,'atlas.inputs.json')),actualFinalBookConfig:book,all394CurrentPagesExactToEarlierCandidate:true,old241ContextAssessmentExactAndStillNeedsOneWordContextReview:true,wholeOriginalNativeThreeFrameExact:true,realIndependentSourceReviewStatus:'PENDING',humanApproval:false,humanTrial:false,activeWrites:0,newStrictClosures:0})
const ordered=model.pages.filter(p=>[resp,coupling].includes(p.goalId)).map(p=>p.goalId),batch='bio-two-basic-primary-refined-20261008-v2'
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ordered,bookId:batch,title:'Biologie: zwei neue Sek-I-Stoffwechselgrundlagen'})
const native=resolve(own,'native-two-primary-refined'),modelPath=resolve(native,'book-model.json'),htmlPath=resolve(native,'book.html'),pdfPath=resolve(native,'book.pdf')
write(modelPath,subset);const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard'as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json');const pdf=await writeGoalBookPdf(subset,pdfPath,options);await writeGoalBookRenderManifest(pdf,pdfPath+'.render-manifest.json');assert.equal(pdf.goalPageCount,2);assert.equal(pdf.physicalPageCount,4)
const bundleDirectory=resolve(native,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const f of bundle.files)write(resolve(bundleDirectory,f.relativePath),f.content);write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest);await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory)
const artifact=(role:string)=>bundle.manifest.artifacts.find(a=>a.role===role)!,campaigns=[]
for(const side of ['a','b']){const outputDirectory=resolve(native,'round-'+side),round=batch+'-independent-'+side;const result=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(bundleDirectory,'review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDirectory,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDirectory,artifact('review_input_json').path)),bundleDirectory,outputDirectory,campaignOptions:{campaignId:round+'-campaign',roundId:round,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:round,blindToOtherReviews:true,batchSize:20}});const check=await validateGoalDescriptionReviewCampaign({bundle:read(resolve(outputDirectory,'review-bundle-manifest.json')),input:result.input,campaign:result.campaign});assert.deepEqual(check.errors,[]);campaigns.push({side,campaignPath:rel(resolve(outputDirectory,'description-review-campaign.json')),inputPath:rel(resolve(outputDirectory,'description-review-input.json')),actualIndependentResults:0})}
write(resolve(own,'neutral-final-primary-refined-basis2.author.entry.json'),{schemaVersion:1,role:'Final actual author target/source/native2 candidate after true primary-source narrowing',selectedGoalIds:[resp,coupling],currentActiveBaseline:{canonicalNodes:476,curricularAtomic:392,strictComplete:241},actualInactiveCandidate:{canonicalNodes:478,curricularAtomic:394},currentCanonicalPath:book.landscapePath,currentKindsPath:book.semanticKindLedgerPath,currentQaPath:book.goalVisualizationQaPath,finalSourceAtlasConfigPath:rel(resolve(root,inactive,'atlas.inputs.json')),finalFull394BookModelPath:book.outputPath,finalSourceDiff:bind(resolve(own,'sources/actual-primary-refined-nine-duties-ten-ordinary-edges.final-author.json')),actualWhole394PagesComparedExactToEarlierTechnicalCandidate:true,actualOriginal392And241ContextDiff:bind(resolve(own,'checks/actual-all392-pages-all241-strict-and-original3-frame.before-after.diff.json')),actualExistingWordContextEntry:bind(resolve(own,'neutral-existing-word-targeted-context.author.entry.json')),actualNewImagesEntry:bind(resolve(own,'neutral-two-basic.actual-images.author.entry.json')),actualImageFirstSeal:bind(resolve(own,'two-basic-images.author.first-binding.freeze.json')),actualFourWholeCases:bind(resolve(own,'../biologie-stoffwechsel-two-basic-companions-author-20261008-v1/cases/four-complete-DEEN-material-task-model-scoring-fresh-transfer.author.json')),positiveConfigPath:rel(resolve(own,'positive/P2.actual-closed.inactive.config.json')),atomicityAuthorConfigPath:rel(resolve(own,'atomicity-memory/A.whole394.inactive.config.json')),memoryAuthorConfigPath:rel(resolve(own,'atomicity-memory/M.whole394.inactive.config.json')),actualFinalPdf:bind(resolve(bundleDirectory,artifact('book_pdf').path)),actualFinalPdfPhysicalPages:4,pageMap:ordered.map((goalId,i)=>({goalId,physicalPage:pdf.frontMatterPageCount+i+1})),finalPortableReviewBundlePath:rel(resolve(bundleDirectory,'review-bundle-manifest.json')),campaigns,allNewIndependentReviewsPending:true,noEarlierNativeCandidateApprovalAssumed:true,ordinaryRefinedModelBundleCampaignErrors:0,original4OperatorHoldsKeep:true,currentActiveWrites:0,newStrictClosures:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({actualPrimaryRefinedFinal394:true,oldThreeWeakAdditionalWitnessesWithdrawn:3,actualNewSourceDuties:9,actualNewEdges:10,all394PageObjectsExact:true,actualFinalNativeTwoPhysicalPages:4,ordinaryModelBundleCampaignErrors:0,independentApproval:'PENDING',activeWrites:0}))
