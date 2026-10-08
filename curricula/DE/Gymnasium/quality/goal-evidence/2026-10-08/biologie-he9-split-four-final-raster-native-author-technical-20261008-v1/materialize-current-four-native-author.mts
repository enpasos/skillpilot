// SPDX-License-Identifier: Apache-2.0
// Real native four-page author preparation. No verdicts or invented review runs.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import {buildGoalDescriptionReviewInput,buildGoalDescriptionReviewCampaign,serializeGoalDescriptionReviewBatchInput,loadGoalDescriptionReviewRecordSchemaBytes,validateGoalDescriptionReviewCampaign,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {verifyGoalBookReviewBundleArtifactBytes,writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
import {POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),out=resolve(own,'native-raster-candidate')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const rp=(p:string)=>relative(root,p)
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
const guards=read(resolve(own,'exact-current-input-snapshots-and-four-author-guards.technical.json'))
const snapshots=guards.snapshotMap as Record<string,string>
const old='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
const children=['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
const companions=['249f4c5d-fd23-57c7-ac62-773d62c33b49','4b7fdc2c-9dbe-5439-8d84-295abc240eec']
const ids=[...children,...companions]
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const before=read(resolve(root,snapshots[canonical]))
const canonicalPath=resolve(own,'candidate/canonical.current476.reviewed-split.actual-raster.inactive.json'),landscape=read(canonicalPath)
const bb=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
assert.equal(bb.size,474);assert.equal(by.size,476)
for(const [id,g]of bb)if(id!==old)assert.deepEqual(by.get(id),g)
const kindsPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const beforeKinds=read(resolve(root,snapshots[kindsPath])),kinds=structuredClone(beforeKinds)
for(const row of beforeKinds.decisions)assert.equal(row.sourceFingerprint,fingerprintSemanticKindSourceGoal(bb.get(row.goalId)))
const reviewedKinds=read(resolve(own,'../biologie-he9-contraception-parenthood-split-current191-inactive-technical-rebase-20261008-v1/candidate/semantic-kinds.current476.actual-paired-science.v3.inactive.json'))
const parentIndex=kinds.decisions.findIndex((d:any)=>d.goalId===old);assert.ok(parentIndex>=0)
kinds.decisions[parentIndex]=structuredClone(reviewedKinds.decisions.find((d:any)=>d.goalId===old))
for(const id of children)kinds.decisions.push(structuredClone(reviewedKinds.decisions.find((d:any)=>d.goalId===id)))
for(const d of kinds.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(d.goalId)))
for(const row of beforeKinds.decisions)if(row.goalId!==old)assert.deepEqual(kinds.decisions.find((d:any)=>d.goalId===row.goalId),row)
kinds.counts=Object.fromEntries(Object.keys(kinds.counts).map(k=>[k,k==='total'?kinds.decisions.length:kinds.decisions.filter((d:any)=>d.semanticKind===k).length]))
assert.equal(kinds.counts.curricularAtomic,392);assert.equal(kinds.counts.curricularArea,45);assert.equal(kinds.counts.total,476)
kinds.sourceLandscapePath=rp(canonicalPath)
const nativeKindsPath=resolve(own,'candidate/semantic-kinds.current476.actual-paired-science.inactive.json')
write(nativeKindsPath,kinds)
write(resolve(own,'candidate/semantic-kinds.current476.actual-paired-science.future-active.json'),{...kinds,sourceLandscapePath:canonical})
beforeKinds.sourceLandscapePath=snapshots[canonical]
const beforeKindsPath=resolve(own,'candidate/semantic-kinds.before391.scoped-snapshot.json');write(beforeKindsPath,beforeKinds)
const manifestPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'
const beforeManifest=read(resolve(root,snapshots[manifestPath]))
beforeManifest.sourcePaths=beforeManifest.sourcePaths.map((p:string)=>snapshots[p]);beforeManifest.navigationViewPath=snapshots[beforeManifest.navigationViewPath];beforeManifest.durationModelPolicyPath=snapshots[beforeManifest.durationModelPolicyPath]
const beforeManifestPath=resolve(own,'candidate/atlas.sources.before391.scoped-snapshot.json');write(beforeManifestPath,beforeManifest)
const configBase={schemaVersion:1,bookId:'de-gym-biologie-bundesweit',title:'Lernzielbuch Biologie – Gymnasium bundesweit',publicationMode:'review',atlasBaseUrl:'https://skillpilot.com/lernzielbuch',evidenceReviewPaths:[]}
const bc={...configBase,landscapePath:snapshots[canonical],semanticKindLedgerPath:rp(beforeKindsPath),compositionViewManifestPath:rp(beforeManifestPath),goalVisualizationQaPath:snapshots['curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'],outputPath:rp(resolve(out,'full391.before.pure.book-model.json'))}
const ac={...configBase,landscapePath:rp(canonicalPath),semanticKindLedgerPath:rp(nativeKindsPath),compositionViewManifestPath:rp(resolve(own,'candidate/atlas.sources.current392.uniform-view-paths.inactive.json')),goalVisualizationQaPath:rp(resolve(own,'candidate/visualization-qa.current392.actual-raster-author.json')),outputPath:rp(resolve(out,'full392.actual-raster.pure.book-model.json'))}
const bcp=resolve(out,'full391.before.inactive.config.json'),acp=resolve(out,'full392.actual-raster.inactive.config.json');write(bcp,bc);write(acp,ac)
const beforeInput=await loadGoalBookBuildInputs(rp(bcp),root),afterInput=await loadGoalBookBuildInputs(rp(acp),root)
const bm=beforeInput.model,model=afterInput.model
assert.equal(bm.pages.length,391);assert.equal(model.pages.length,392)
write(resolve(root,bc.outputPath),bm);write(resolve(root,ac.outputPath),model)
for(const id of children){const p=model.pages.find(p=>p.goalId===id);assert.ok(p?.visualization)}

const beforeAtomic=new Set(beforeKinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const afterAtomic=new Set(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const nBefore=normalizeCanonicalLandscape(before),nAfter=normalizeCanonicalLandscape(landscape),scopeRows=[]
for(const vg of guards.viewGuards){
 const bv=normalizeCompositionView(read(resolve(root,vg.beforeSnapshotPath))),av=normalizeCompositionView(read(resolve(root,vg.inactiveCandidatePath)))
 const bComp=compileCompositionView(bv,nBefore),aComp=compileCompositionView(av,nAfter)
 assert.deepEqual(bComp.findings.filter((f:any)=>f.severity==='error'),[]);assert.deepEqual(aComp.findings.filter((f:any)=>f.severity==='error'),[])
 const bp=collectCompositionProjectionRoleGoalIds(bv.rootNodes,bb),ap=collectCompositionProjectionRoleGoalIds(av.rootNodes,by)
 const ba=[...bp.targetGoalIds].filter(id=>beforeAtomic.has(id)).sort(),aa=[...ap.targetGoalIds].filter(id=>afterAtomic.has(id)).sort()
 const expected=ba.filter(id=>id!==old);if(ba.includes(old))expected.push(...children);expected.sort();assert.deepEqual(aa,expected)
 assert.deepEqual(av.scope,bv.scope);assert.deepEqual([...bp.prerequisiteOnlyGoalIds].sort(),[...ap.prerequisiteOnlyGoalIds].sort())
 scopeRows.push({originalViewPath:vg.activePath,beforePath:vg.beforeSnapshotPath,afterPath:vg.inactiveCandidatePath,beforeAtomicTargetCount:ba.length,afterAtomicTargetCount:aa.length,delta:aa.length-ba.length,allOtherTargetAndPrerequisiteOnlyIDsExact:true,nativeErrors:0})
}
assert.equal(scopeRows.length,31);assert.equal(scopeRows.filter(r=>r.delta===1).length,23);assert.equal(scopeRows.filter(r=>r.delta===0).length,8)
assert.deepEqual(validateCanonicalLandscape(nAfter).filter((f:any)=>f.severity==='error'),[])
const graphs=[]
for(const field of ['contains','requires']){const visiting=new Set<string>(),done=new Set<string>();const visit=(id:string)=>{assert.ok(!visiting.has(id),field+' cycle');if(done.has(id))return;visiting.add(id);for(const next of by.get(id)[field]??[]){assert.ok(by.has(next));visit(next)}visiting.delete(id);done.add(id)};for(const id of by.keys())visit(id);graphs.push({field,nodes:done.size,cycles:0,missingReferences:0})}
write(resolve(own,'checks/native31-scopes-476-DAG.actual.json'),{scopeRows,graphs,beforePages:391,afterPages:392,currentOther473WholeGoalsExact:true,nativeErrors:0,activeWrites:0})
const oldPages=new Map(bm.pages.map(p=>[p.goalId,p])),newPages=new Map(model.pages.map(p=>[p.goalId,p]))
const semantic=(p:any)=>{const q=structuredClone(p);for(const k of ['pageNumber','navigationOrder','treeOrder','pageFingerprint'])delete q[k];for(const k of ['requires','reverseRequires'])for(const r of q[k]??[])delete r.pageNumber;return q}
const changes=[]
for(const [id,p]of oldPages){if(id===old)continue;const q=newPages.get(id);assert.ok(q);const semExact=JSON.stringify(semantic(p))===JSON.stringify(semantic(q));changes.push({goalId:id,goalFingerprintExact:p.goalFingerprint===q.goalFingerprint,pageFingerprintExact:p.pageFingerprint===q.pageFingerprint,pagePositionOnly:p.pageFingerprint!==q.pageFingerprint&&semExact,semanticPageContentExact:semExact,beforePageNumber:p.pageNumber,afterPageNumber:q.pageNumber,beforeFingerprint:p.pageFingerprint,afterFingerprint:q.pageFingerprint,before:semExact?undefined:p,after:semExact?undefined:q})}
assert.equal(changes.length,390);assert.ok(changes.every(r=>r.goalFingerprintExact));assert.deepEqual(changes.filter(r=>!r.semanticPageContentExact).map(r=>r.goalId).sort(),[...companions].sort())
write(resolve(own,'checks/full392-current-position-vs-substantive-context.actual.json'),{role:'Actual current native page impact; positions do not become scientific reviews',currentStrictBefore:guards.actualBaseline.strict,retainedWholePages:390,commonPages:changes,newChildPages:children.map(i=>newPages.get(i)),trueChangedRelationContextGoalIds:companions,positionOnly:changes.filter(r=>r.pagePositionOnly).length,unchangedFingerprints:changes.filter(r=>r.pageFingerprintExact).length,noRecoveredBindingOrClosureClaim:true})

const candidates=read(resolve(own,'P4.whole-reviewed-science.actual-raster-author.candidates.json'))
const materialsPath=resolve(own,'four-whole-goals-eight-complete-DEEN-cases.author.md'),materials=read(materialsPath.replace(/\.md$/u,'.json'))
assert.deepEqual(candidates.goals.map((r:any)=>r.goalId),ids);assert.equal(materials.goals.length,4)
for(const entry of materials.goals)for(const wholeCase of entry.cases){
 const profile=candidates.goals.find((c:any)=>c.goalId===entry.goalId).profile,brief=profile.applicationCaseBriefs.find((c:any)=>c.id===wholeCase.id);assert.ok(brief)
 for(const [lang,suffix]of [['de','De'],['en','En']]){assert.equal(brief['taskDemand'+suffix],wholeCase.material[lang]+' '+wholeCase.task[lang]);assert.equal(brief['expectedPerformance'+suffix],wholeCase.modelAnswer[lang])}
}
const ordered=model.pages.filter(p=>ids.includes(p.goalId)).map(p=>p.goalId)
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ordered,bookId:'biologie-he9-split-four-current392-author-v1',title:'Biologie: Verhütung, Elternschaft und Kontext'})
const modelPath=resolve(out,'four/book-model.json'),htmlPath=resolve(out,'four/book.html'),pdfPath=resolve(out,'four/book.pdf');write(modelPath,subset)
const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'bounded-atlas'as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
await writeGoalBookRenderManifest(await writeGoalBookPdf(subset,pdfPath,options),pdfPath+'.render-manifest.json')
const bundleDirectory=resolve(out,'four/bundle')
const bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const file of bundle.files)write(resolve(bundleDirectory,file.relativePath),file.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
const verified=await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory)
const input=buildGoalDescriptionReviewInput({bundle:bundle.manifest,reviewInput:bundle.input,landscape}),schemaBytes=await loadGoalDescriptionReviewRecordSchemaBytes()
for(const side of ['a','b']){
 const campaignOut=resolve(out,'four/round-'+side)
 const campaign=buildGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaignId:'biologie-he9-split-four-current392-campaign-'+side+'-20261008-v1',roundId:'biologie-he9-split-four-current392-independent-'+side+'-20261008-v1',reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:'biologie-he9-split-four-current392-independent-'+side+'-20261008-v1',blindToOtherReviews:true,recordSchemaDigest:sha(schemaBytes),batchSize:4})
 const checked=await validateGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaign});assert.deepEqual(checked.errors,[])
 write(resolve(campaignOut,'review-bundle-manifest.json'),bundle.manifest);write(resolve(campaignOut,'description-review-input.json'),input);write(resolve(campaignOut,'description-review-campaign.json'),campaign);write(resolve(campaignOut,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),schemaBytes)
 await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle:bundle.manifest,campaignDirectory:campaignOut,verifiedArtifactBytes:verified})
 assert.equal(campaign.batches.length,1)
 for(const batch of campaign.batches){const bytes=serializeGoalDescriptionReviewBatchInput({bundleFingerprint:bundle.manifest.bundleFingerprint,bookDigest:bundle.manifest.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals});const path=resolve(campaignOut,'batches',batch.batchId+'.input.jsonl');write(path,bytes);assert.equal(sha(readFileSync(path)),batch.batchInputFingerprint);assert.equal(readFileSync(path,'utf8').trim().split('\n').length,4)}
}
const criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md'),criteria=sha(readFileSync(criteriaPath))
const qa=read(resolve(root,ac.goalVisualizationQaPath)),digests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available')digests[q.imageUrl]=sha(readFileSync(resolve(root,q.publicAssetPath)))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const validator=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))),positive=[]
for(const candidate of candidates.goals){
 const goal=by.get(candidate.goalId),resources:Record<string,string>={}
 for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization'){assert.ok(digests[link.url]);resources[link.url]=digests[link.url]}
 const record={$schema:POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:POSITIVE_GOAL_EVIDENCE_SCHEMA_VERSION,reviewId:'biologie-he9-split-four-current392-positive-raster-author-v1',goalFingerprintRuleVersion:POSITIVE_GOAL_EVIDENCE_GOAL_FINGERPRINT_RULE_VERSION,profileRuleVersion:POSITIVE_GOAL_EVIDENCE_PROFILE_RULE_VERSION,reviewCriteriaFingerprint:criteria,landscapeId:landscape.landscapeId,goalId:goal.id,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(candidate.profile),status:'needs_human_review'as const,reviewAuthority:'ai_candidate'as const,reviewedAt:new Date().toISOString(),reviewer:candidates.reviewer,reason:'Vollständige ursprüngliche bilinguale Fachfälle und Profile unverändert; aktuelle PNG- und vierseitige native Kontextbindung als Autor-Kandidat. Finale unabhängige aktuelle D/P/V-Reviews stehen aus. Kein Lernendenleistungsnachweis oder menschliche Freigabe.',evidenceLevel:'E1'as const,maximumClaimScope:'G1'as const,reviewRunIds:[],dissent:[...candidate.dissent],profile:candidate.profile}
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic'),[]);assert.ok(validator(record),ajv.errorsText(validator.errors));positive.push(record)
}
write(resolve(out,'P4.actual-raster-author.review.jsonl'),positive.map(r=>JSON.stringify(r)).join('\n')+'\n')
write(resolve(out,'P2.new-children.actual-raster-author.review.jsonl'),positive.filter(r=>children.includes(r.goalId)).map(r=>JSON.stringify(r)).join('\n')+'\n')
const pBase=read(resolve(own,'../biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1/P2.open-author-proposals.config.json'))
const p2={...pBase,reviewId:'biologie-he9-split-four-current392-positive-raster-author-v1',landscapePath:rp(canonicalPath),semanticKindLedgerPath:rp(nativeKindsPath),reviewCriteriaPath:rp(criteriaPath),reviewPath:rp(resolve(out,'P2.new-children.actual-raster-author.review.jsonl')),reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Two current-raster new-child AUTHOR profiles; true independent current native D/P/V and human review pending',goalIds:children}}
write(resolve(own,'candidate/P2.actual-raster-author.inactive.config.json'),p2)
write(resolve(own,'candidate/P2.actual-raster-author.future-active.config.json'),{...p2,landscapePath:canonical,semanticKindLedgerPath:kindsPath})
write(resolve(own,'candidate/P4.actual-raster-author.inactive.config.json'),{...p2,reviewPath:rp(resolve(out,'P4.actual-raster-author.review.jsonl')),scope:{label:'Four actual-raster AUTHOR profiles; companions retain original case/profile science and need targeted context review',goalIds:ids}})
write(resolve(out,'P4.actual-raster-schema-and-semantics.author.actual.json'),{records:4,newChildProfiles:2,retainedCompanionProfiles:2,wholeDEENCasePairs:8,closedSchemaErrors:0,nativeSemanticErrors:0,exactActualRasterDigests:true,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',companionProfileAndCaseScienceUnchanged:true,newOperativePositiveScopePreferChildrenOnly:true,actualPublicCLIStillPendingIntegration:true,humanApproval:false,strictGainClaimed:0})
write(resolve(out,'four/current-neutral-full-input.json'),{role:'Inactive author engineering; true final independent current D4/P4/V4 pending',wholeSelectedGoals:ordered.map(id=>by.get(id)),actualNativeInput:input,portableActualPDF:'native-raster-candidate/four/bundle/book.pdf',physicalGoalPages:ordered.map((goalId,index)=>({goalId,physicalPage:index+3})),actualPNGs:ordered.map(goalId=>({goalId,path:'selected-images/'+goalId+'.png'})),wholeBilingualMaterials:rp(materialsPath),actualSourcePages:'whole-official-source-pages/actual-complete-page-extraction.provenance.json',independentFirstPassDirectories:['native-raster-candidate/four/round-a','native-raster-candidate/four/round-b'],oldUnchangedScienceNeverReapproved:true,publicRecordsNeverAuthoritative:true,realLearnerEvidence:false,humanApproval:false,activeWrites:0,strictGainClaimed:0})
console.log(JSON.stringify({actualFullBefore:391,actualFullAfter:392,currentOther473WholeGoalsExact:true,nativeBlindCampaigns:2,actualRecordsPerCampaign:4,wholeP4Cases:8,actualNativeP4SchemaAndSemantics:0,newImages:2,KEEPImages:2,contextCompanions:companions,scopePlusOne:23,scopeUnchanged:8,activeWrites:0,strictGainClaimed:0}))
