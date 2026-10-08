// SPDX-License-Identifier: Apache-2.0
// Actual shadow author inputs using existing APIs; no active or historical writes.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {existsSync,mkdirSync,readFileSync,writeFileSync,symlinkSync,readlinkSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookModel,loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal,stableGoalBookJson,parseAndValidateGoalBookModel} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {buildGoalDescriptionCanonicalContext} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {emptyGoalVisualizationAiReview} from '../../../../../../../app/scripts/goalVisualizationQaModel.ts'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile,validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root='/home/enpasos/projects/skillpilot',own=dirname(fileURLToPath(import.meta.url))
const old=resolve(own,'../biologie-stoffwechsel-two-basic-companions-author-20261008-v1')
const n3=resolve(own,'../biologie-stoffwechsel-first-three-native-technical-20261008-v1')
const ids=['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38','32483d30-2162-50a5-a6cc-05b7f2467ab1']
const three=['32f47903-0788-5c27-ac88-7464f481f2f7','135447a0-5d55-564a-afc3-3e3fbed77819','ec782ce3-475e-5628-b3fe-947d72e74a74']
const parent='860c80f9-e463-598b-8ef8-79f65c12f235'
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const rel=(p:string)=>relative(root,p)
const declared=new Map<string,any>()
const bind=(p:string)=>{const b=readFileSync(p),r={path:rel(p),sha256:sha(b),bytes:b.length};declared.set(p,r);return r}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(p,'utf8'))}
const write=(p:string,v:any)=>{const bytes=Buffer.isBuffer(v)?v:Buffer.from(typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');if(existsSync(p)){assert.ok(readFileSync(p).equals(bytes),'Refuse changed existing author artifact: '+p);return bind(p)}mkdirSync(dirname(p),{recursive:true});writeFileSync(p,bytes);return bind(p)}
const equal=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const changedKeys=(a:any,b:any)=>[...new Set([...Object.keys(a),...Object.keys(b)])].filter(k=>!equal(a[k]??null,b[k]??null))
const actualBefore=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
const current=read(resolve(root,actualBefore.config.landscapePath))
assert.equal(current.goals.length,476);assert.equal(actualBefore.model.pages.length,392)
assert.deepEqual(current,read(resolve(n3,'../biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1/input/canonical.current476.after19.exact.json')),'Actual current canonical changed after frozen476 baseline')
const canonical=read(resolve(n3,'candidate/canonical.current476.three-rasters.inactive.json'))
const before=structuredClone(canonical),by=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
const kinds=read(resolve(n3,'candidate/semantic-kinds.current476.path-only.inactive.json'))
const qa=read(resolve(n3,'candidate/visualization-qa.current392.three-unapproved.inactive.json'))
const beforeQA=structuredClone(qa),oldKinds=structuredClone(kinds)
const templates=read(resolve(old,'goals/two-whole-DEEN-goal-templates.ai-candidate.json')).goalTemplates
assert.deepEqual(templates.map((g:any)=>g.id),ids)
const imageEntry=read(resolve(own,'neutral-two-basic.actual-images.author.entry.json'))
bind(resolve(own,'two-basic-images.author.first-binding.freeze.json'))
const rasterBindings:any[]=[]
for(const g of structuredClone(templates)){
 assert.ok(!by.has(g.id));const im=imageEntry.images.find((i:any)=>i.goalId===g.id)!;assert.ok(im)
 const imagePath=resolve(root,im.path),bytes=readFileSync(imagePath);assert.equal(sha(bytes),'sha256:'+im.sha256);bind(imagePath)
 const alias=resolve(own,'assets/goal-visualizations/biologie',g.id,g.id+'.png');mkdirSync(dirname(alias),{recursive:true});if(existsSync(alias))assert.equal(readlinkSync(alias),relative(dirname(alias),imagePath));else symlinkSync(relative(dirname(alias),imagePath),alias)
 const url='/assets/goal-visualizations/biologie/'+g.id+'/'+g.id+'.png'
 g.resourceLinks=[{type:'goal-visualization',resourceType:'image',role:'primary',skillpilotId:g.id,title:'Visualisierung: '+g.title,url,provider:im.provider,description:im.descriptionDe,altText:im.altTextDe,lang:'de',license:'CC-BY-4.0',reviewStatus:'pilot'}]
 canonical.goals.push(g);by.set(g.id,g)
 qa.records.push({goalId:g.id,title:g.title,description:g.description,subject:'biologie',landscapeId:canonical.landscapeId,landscapePath:actualBefore.config.landscapePath,visualizationState:'available',missingReason:'',imageUrl:url,publicAssetPath:im.path,canonicalAssetPath:im.path,assetSha256:sha(bytes),umlautsCorrectChatGpt:'no',contentApprovedChatGpt:'no',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',chatGptReviewedAt:null,chatGptReviewer:'',chatGptNotes:'Actual author PNG only; independent V A/B pending. No generator or author approval.',humanReviewedAt:null,humanReviewer:'',...emptyGoalVisualizationAiReview()})
 rasterBindings.push({goalId:g.id,url,path:im.path,sha256:sha(bytes),bytes:bytes.length,promptPath:im.promptPath,reconstructionPromptPath:im.reconstructionPromptPath,provider:im.provider})
}
const parentBefore=structuredClone(by.get(parent));assert.equal(parentBefore.weight,5)
by.get(parent).contains.push(...ids);by.get(parent).weight=7
for(const g of before.goals){if(g.id!==parent)assert.deepEqual(by.get(g.id),g);else assert.deepEqual(changedKeys(g,by.get(g.id)).sort(),['contains','weight'])}
for(const q of beforeQA.records)assert.deepEqual(qa.records.find((r:any)=>r.goalId===q.goalId),q)
assert.equal(canonical.goals.length,478);assert.equal(qa.records.length,394)
// Genuine author semantic classification, not peer or human review. The
// normal closed ledger is authoritative solely inside this inactive shadow.
kinds.counts.curricularAtomic=394;kinds.counts.total=478
for(const d of kinds.decisions)if(d.goalId===parent)d.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(parent))
for(const id of ids)kinds.decisions.push({goalId:id,sourceFingerprint:fingerprintSemanticKindSourceGoal(by.get(id)),semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-curricular-atomic'})
for(const d of kinds.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(by.get(d.goalId)))
for(const d of oldKinds.decisions)if(d.goalId!==parent)assert.deepEqual(kinds.decisions.find((r:any)=>r.goalId===d.goalId),d)
const canonPath=resolve(own,'candidate/canonical.shadow478.basic2-after-three-rasters.json')
const kindPath=resolve(own,'candidate/semantic-kinds.shadow478.basic2-author-structural.json')
const qaPath=resolve(own,'candidate/visualization-QA.shadow394.two-unapproved.json')
kinds.sourceLandscapePath=rel(canonPath)
write(canonPath,canonical);write(kindPath,kinds);write(qaPath,qa)
// Validate both graph relations with real full graph bodies.
const dagChecks:any[]=[]
for(const relation of ['contains','requires']){
 const visited=new Set<string>(),visiting=new Set<string>()
 const walk=(id:string)=>{if(visited.has(id))return;assert.ok(!visiting.has(id),'Cycle '+relation+' '+id);const g=by.get(id);assert.ok(g,'Missing node '+id);visiting.add(id);for(const target of g[relation]??[]){assert.ok(by.has(target),'Unresolved '+relation+' '+target);walk(target)}visiting.delete(id);visited.add(id)}
 for(const id of by.keys())walk(id);dagChecks.push({relation,actualNodesChecked:visited.size,cycles:0,unresolvedReferences:0})
}
const childParents=ids.map(id=>({goalId:id,parentGoalIds:canonical.goals.filter((g:any)=>(g.contains??[]).includes(id)).map((g:any)=>g.id),ownRequires:by.get(id).requires,inheritedParentRequires:by.get(parent).requires}))
for(const p of childParents)assert.deepEqual(p.parentGoalIds,[parent])
write(resolve(own,'checks/actual-shadow478-parent-requires-and-DAG.json'),{schemaVersion:1,dagChecks,newGoalPlacements:childParents,wholeParentBefore:parentBefore,wholeParentAfter:by.get(parent),old475WholeGoalsExactToThreeRasterCandidate:true,old476TextBodiesExact:true,old392QARowsIncludingHumanFieldsExact:true,independentReviewStatus:'PENDING',activeWrites:0})
const inactive='app/scripts/config/goal-books/inactive/biologie-stoffwechsel-two-basic-complete-20261008-v2'
const atlas=read(resolve(own,'candidate/ordinary-basic2-after-scope3-source-atlas.inputs.json'))
Object.assign(atlas,{landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),outputDirectory:inactive+'/source-views',manifestPath:inactive+'/atlas.sources.json',navigationViewPath:inactive+'/navigation.view.json',expectedCurricularAtomicGoalCount:394})
write(resolve(root,inactive,'atlas.actual394.inputs.json'),atlas)
const built=buildGoalBookSourceAtlasInputs(atlas,root)
for(const [p,b] of Object.entries(built.outputs))write(resolve(root,p),b)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals,394);assert.equal(built.receipt.counts.publishedCurricularAtomicGoals,394)
write(resolve(own,'checks/ordinary-shadow478-394-source-atlas.actual.receipt.json'),built.receipt)
const book={...actualBefore.config,landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),goalVisualizationQaPath:rel(qaPath),compositionViewManifestPath:atlas.manifestPath,outputPath:rel(resolve(own,'native/full394.basic2-after-source3.actual-model.json'))}
write(resolve(own,'candidate/book.shadow394.basic2-after-source3.inactive.config.json'),book)
const manifest=read(resolve(root,book.compositionViewManifestPath)),digests:Record<string,string>={}
for(const q of qa.records)if(q.visualizationState==='available'){const actual=bind(resolve(root,q.publicAssetPath));assert.equal(actual.sha256,q.assetSha256);digests[q.imageUrl]=actual.sha256}
const model=buildGoalBookModel({landscape:canonical,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:read(resolve(root,p))})),navigationView:read(resolve(root,manifest.navigationViewPath)),durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:book}as any)
assert.equal(model.pages.length,394);assert.ok(equal(parseAndValidateGoalBookModel(model),model));write(resolve(root,book.outputPath),model)
const frame=read(resolve(n3,'native/full392.current-three-source-raster.book-model.json'))
assert.ok(equal(parseAndValidateGoalBookModel(frame),frame))
const actualBaseline=actualBefore.model
write(resolve(own,'native/full392.current-before.actual-loader.exact-model.json'),actualBaseline)
const reportPath=resolve(own,'../biologie-stoffwechsel-nineteen-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt')
const reportText=readFileSync(reportPath,'utf8');bind(reportPath)
const report=JSON.parse(reportText.slice(reportText.indexOf('{'))),bio=report.subjects.find((s:any)=>s.subject==='biologie')
assert.equal(bio.denominator,392);assert.equal(bio.strictComplete,241);assert.equal(bio.strictCompleteGoalIds.length,241)
write(resolve(own,'checks/actual-current241-strict-goal-ids.exact.json'),{schemaVersion:1,report:bind(reportPath),currentSubject:'biologie',currentAtomicDenominator:392,strictComplete:241,strictCompleteGoalIds:bio.strictCompleteGoalIds,newStrictClosures:0})
const modelDiffs:any[]=[];const normalizedExistingSinglePages:any[]=[]
for(const beforePage of frame.pages){
 const afterPage=model.pages.find(p=>p.goalId===beforePage.goalId)!;assert.ok(afterPage)
 const keys=changedKeys(beforePage,afterPage)
 const baseSingle=buildGoalDescriptionRolloutSubsetModel({baseModel:frame,goalIds:[beforePage.goalId],bookId:'context-single-'+beforePage.goalId,title:'Gezielter bestehender Seitenkontext'})
 const afterSingle=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:[beforePage.goalId],bookId:'context-single-'+beforePage.goalId,title:'Gezielter bestehender Seitenkontext'})
 const singleBefore=baseSingle.pages[0],singleAfter=afterSingle.pages[0]
 const singleKeys=changedKeys(singleBefore,singleAfter)
 const canonicalBefore=before.goals.find((g:any)=>g.id===beforePage.goalId),canonicalAfter=by.get(beforePage.goalId)
 assert.deepEqual(buildGoalDescriptionCanonicalContext(canonicalBefore),buildGoalDescriptionCanonicalContext(canonicalAfter))
 const record={goalId:beforePage.goalId,isCurrentStrict241:bio.strictCompleteGoalIds.includes(beforePage.goalId),wholeBeforePage:beforePage,wholeAfterPage:afterPage,changedWholePageKeys:keys,canonicalOwnDContextExact:true,normalizedSingleBefore:singleBefore,normalizedSingleAfter:singleAfter,changedNormalizedSinglePageKeys:singleKeys,targetedSubstantiveReviewRequired:singleKeys.length>0,technicalWholeBookOrderOrReferenceBindingReviewRequired:keys.length>0}
 if(keys.length)modelDiffs.push(record)
 normalizedExistingSinglePages.push({goalId:record.goalId,isCurrentStrict241:record.isCurrentStrict241,canonicalOwnDContextExact:true,wholeStandalonePageExact:singleKeys.length===0,changedStandalonePageKeys:singleKeys,targetedSubstantiveReviewRequired:singleKeys.length>0})
}
const frameBefore=read(resolve(n3,'native-three/book-model.json'))
const frameAfter=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:frameBefore.pages.map((p:any)=>p.goalId),bookId:frameBefore.book.id,title:frameBefore.book.title})
write(resolve(own,'native/original-three-native-frame.after-basic2.actual-model.json'),frameAfter)
const threeFrameDiffs=frameBefore.pages.map((p:any)=>({goalId:p.goalId,wholeBefore:p,wholeAfter:frameAfter.pages.find((q:any)=>q.goalId===p.goalId),changedKeys:changedKeys(p,frameAfter.pages.find((q:any)=>q.goalId===p.goalId))}))
write(resolve(own,'checks/actual-all392-pages-all241-strict-and-original3-frame.before-after.diff.json'),{schemaVersion:1,actualExistingPageCount:392,currentStrictIdsActuallyCompared:241,wholeChangedPages:modelDiffs,all392NormalizedSinglePageComparisons:normalizedExistingSinglePages,strict241ChangedSubstantiveContextGoalIds:normalizedExistingSinglePages.filter(r=>r.isCurrentStrict241&&r.targetedSubstantiveReviewRequired).map(r=>r.goalId),allExistingChangedSubstantiveContextGoalIds:normalizedExistingSinglePages.filter(r=>r.targetedSubstantiveReviewRequired).map(r=>r.goalId),strict241WholeBookBindingChangedGoalIds:modelDiffs.filter(r=>r.isCurrentStrict241).map(r=>r.goalId),wholeOriginalNativeThreeFrameComparisons:threeFrameDiffs,wholeOriginalNativeThreeStandalonePagesExact:threeFrameDiffs.every((r:any)=>r.changedKeys.length===0),allExistingCanonicalOwnDContextsExact:true,currentStrictResultNotRecalculatedForUnintegratedCandidates:true,noHashOnlyReviewClaim:true,allNecessaryCurrentContextFollowupReviewsPending:true,activeWrites:0,newStrictClosures:0})
const criteriaPath='curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',criteria=bind(resolve(root,criteriaPath)).sha256
const bodies=read(resolve(own,'positive/two-whole-positive-understanding-profile-bodies.author.json')).goals
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validP=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))),validCfg=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')))
const reviewId='biologie-two-basic-complete-author-20261008-v2'
const records=bodies.map((r:any)=>{const goal=by.get(r.goalId),im=rasterBindings.find(b=>b.goalId===r.goalId)!;const resources={[im.url]:im.sha256}
 const record={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteria,landscapeId:canonical.landscapeId,goalId:goal.id,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(r.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'Codex actual author; independent D/P A/B pending',reason:'Two real bounded basic competencies, four actual authored bilingual material/task/model/rubric/fresh-transfer cases and current original PNG bindings form these closed positive understanding candidates. No synthetic author case is learner or performed-experiment evidence; original source whole operators remain separate.',evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:['Two independent current whole D/P, atomicity, Memory, visual and source/projection reviews pending.','All20 whole original source duties, all268 original partner input bodies and four specific operator holds remain retained. Word models do not replace required gross equations or real experiments.','Shadow478/394 is an actual unintegrated candidate; current active392/strict241 stay distinct.','No actual learner performance, performed experiment, human approval, human trial, or strict closure.'],profile:r.profile}
 assert.ok(validP(record),ajv.errorsText(validP.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record as any,goal,resources,'curricularAtomic'),[]);return record})
const pPath=resolve(own,'positive/P2.actual-closed.author-candidate.review.jsonl');write(pPath,records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const pConfig={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:canonical.landscapeId,landscapePath:rel(canonPath),semanticKindLedgerPath:rel(kindPath),reviewCriteriaPath:criteriaPath,reviewPath:rel(pPath),reviewRunManifestPaths:[],reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Two actual new basic author candidates; independent native and all other reviews pending',goalIds:ids}}
assert.ok(validCfg(pConfig),ajv.errorsText(validCfg.errors));write(resolve(own,'positive/P2.actual-closed.inactive.config.json'),pConfig)
// Ordinary A/M records are actual author judgments only, not independent
// approvals. Existing392 record bytes, cards and8 scope values are retained.
const rationale=read(resolve(own,'atomicity-memory/actual-two-author-atomicity-memory-and-placement.rationale.json'))
const normalized=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim()
const amFingerprint=(g:any,ruleVersion:string)=>sha(stableGoalBookJson({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalized(g.title),titleEn:normalized(g.titleEn),description:normalized(g.description),descriptionEn:normalized(g.descriptionEn),phase:normalized(g.dimensionTags?.phase),area:normalized(g.dimensionTags?.area),topicCode:normalized(g.dimensionTags?.topicCode),nodeKind:normalized(g.nodeKind)}))
const amPaths=[]
for(const gate of ['A','M']){
 const cfgPath=gate==='A'?'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json':'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json'
 const config=read(resolve(root,cfgPath)),oldBytes=readFileSync(resolve(root,config.reviewPath));bind(resolve(root,config.reviewPath))
 const oldRecords=oldBytes.toString('utf8').trim().split('\n').map(l=>JSON.parse(l));assert.equal(oldRecords.length,392)
 const added=rationale.rows.map((r:any)=>({schemaVersion:1,reviewId:config.reviewId,ruleVersion:config.ruleVersion,landscapeId:canonical.landscapeId,goalId:r.goalId,fingerprint:amFingerprint(by.get(r.goalId),config.ruleVersion),...(gate==='A'?{status:'atomic',semanticAtomic:true}:{status:'no_memory_needed',memoryUseful:false,memoryGoalIds:[],deckIds:[]}),reviewedAt:new Date().toISOString(),reviewer:'Codex actual candidate author; independent A/B judgment pending',reason:(gate==='A'?r.atomicityReasonDe:r.memoryReasonDe)+' Eigenständiger Autorenentscheid; noch keine unabhängige Prüfung oder M7-Freigabe.'}))
 const out=resolve(own,'atomicity-memory',gate+'.whole394.old392-exact-plus-two-actual-author.review.jsonl');write(out,Buffer.concat([oldBytes,oldBytes.at(-1)===10?Buffer.alloc(0):Buffer.from('\n'),Buffer.from(added.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')]))
 assert.ok(readFileSync(out).subarray(0,oldBytes.length).equals(oldBytes))
 const cfg={...config,landscapePath:rel(canonPath),reviewPath:rel(out)};delete cfg.reportPath
 const configOut=resolve(own,'atomicity-memory',gate+'.whole394.inactive.config.json');write(configOut,cfg);amPaths.push({gate,configPath:rel(configOut),recordPath:rel(out),old392RecordBytesExact:true,twoNewActualAuthorRecords:2,independentJudgmentsPending:true})
 if(gate==='M'){bind(resolve(root,config.cardReviewPath));for(const scope of config.visibilityScopes)bind(resolve(root,scope.viewPath));assert.equal(config.visibilityScopes.length,8)}
}
const batchId='biologie-stoffwechsel-two-basic-current394-native-20261008-v2'
const ordered=model.pages.filter(p=>ids.includes(p.goalId)).map(p=>p.goalId)
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:ordered,bookId:batchId,title:'Biologie: zwei neue Sek-I-Stoffwechselgrundlagen'})
const native=resolve(own,'native-two'),modelPath=resolve(native,'book-model.json'),htmlPath=resolve(native,'book.html'),pdfPath=resolve(native,'book.pdf')
write(modelPath,subset)
const options={publicRoot:own,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard' as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json')
const pm=await writeGoalBookPdf(subset,pdfPath,options);await writeGoalBookRenderManifest(pm,pdfPath+'.render-manifest.json');assert.equal(pm.goalPageCount,2);assert.equal(pm.physicalPageCount,4)
const bundleDirectory=resolve(native,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:ordered})
for(const f of bundle.files)write(resolve(bundleDirectory,f.relativePath),f.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
const artifact=(role:string)=>{const a=bundle.manifest.artifacts.find(a=>a.role===role);assert.ok(a);return a}
const campaigns=[]
for(const side of ['a','b']){const outputDirectory=resolve(native,'round-'+side);const result=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(bundleDirectory,'review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDirectory,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDirectory,artifact('review_input_json').path)),bundleDirectory,outputDirectory,campaignOptions:{campaignId:batchId+'-campaign-'+side,roundId:batchId+'-independent-'+side,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:batchId+'-independent-'+side,blindToOtherReviews:true,batchSize:20}});assert.equal(result.campaign.batches.length,1);assert.deepEqual(result.campaign.batches[0].goalIds,ordered);campaigns.push({side,campaignPath:rel(resolve(outputDirectory,'description-review-campaign.json')),inputPath:rel(resolve(outputDirectory,'description-review-input.json')),actualResultsCreated:0})}
write(resolve(own,'neutral-two-basic-complete.native-author.entry.json'),{schemaVersion:1,role:'Two actual new basic competencies, real ordinary shadow478/394 and current native2; no independent approval',selectedGoalIds:ids,currentActiveCanonicalNodeCount:476,currentActiveCurricularAtomicCount:392,currentActualStrictComplete:241,actualInactiveCanonicalNodeCount:478,actualInactiveCurricularAtomicCount:394,currentCanonicalPath:rel(canonPath),currentKindsPath:rel(kindPath),currentQaPath:rel(qaPath),fullCandidateBookModelPath:book.outputPath,actualImageEntry:bind(resolve(own,'neutral-two-basic.actual-images.author.entry.json')),actualImageFirstSeal:bind(resolve(own,'two-basic-images.author.first-binding.freeze.json')),rasterBindings,wholeFourCases:bind(resolve(old,'cases/four-complete-DEEN-material-task-model-scoring-fresh-transfer.author.json')),positiveConfigPath:rel(resolve(own,'positive/P2.actual-closed.inactive.config.json')),AMAuthorCandidates:amPaths,sourceDiffPath:rel(resolve(own,'sources/actual-twelve-duty-thirteen-new-ordinary-edges.author.diff.json')),actual20DutiesAnd268WholePartnerInputsPreserved:true,sourceWholeOperatorHoldsRetained:4,newWholeSourceDutyClosureClaims:0,wholePageContextDiffPath:rel(resolve(own,'checks/actual-all392-pages-all241-strict-and-original3-frame.before-after.diff.json')),actualPdf:bind(resolve(bundleDirectory,artifact('book_pdf').path)),actualPdfPhysicalPages:4,pageMap:ordered.map((goalId,i)=>({goalId,physicalPage:pm.frontMatterPageCount+i+1})),portableReviewBundlePath:rel(resolve(bundleDirectory,'review-bundle-manifest.json')),campaigns,authorInputBindings:[...declared.values()],independentSourceDPAAMVStatus:'PENDING',currentPublicLoaderOnlyBefore:'PASS on actual active476/392; candidate future public loader pending reviewed install',humanApproval:false,humanTrial:false,activeWrites:0,newStrictClosures:0})
console.log(JSON.stringify({actualShadow478:true,actualOrdinary394:true,actualNativeTwo:true,actualPdfPhysicalPages:4,closedP2Errors:0,actual392WholePagesCompared:true,actual241StrictIdsCompared:true,actualOriginalThreeFrameCompared:true,changedNormalizedExistingSinglePageIds:normalizedExistingSinglePages.filter(r=>r.targetedSubstantiveReviewRequired).map(r=>r.goalId),independentApproval:'PENDING',activeWrites:0,newStrictClosures:0}))
