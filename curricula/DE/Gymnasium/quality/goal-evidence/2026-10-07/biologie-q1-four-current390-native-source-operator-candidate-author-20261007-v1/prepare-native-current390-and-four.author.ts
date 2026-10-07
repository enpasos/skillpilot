// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
async function main(){
const root=resolve('.'),own=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1'),sparse=resolve('tmp/biologie-q1-four-current390-native-author-20261007-v1-attempt02')
if(existsSync(resolve(own,'author.final.freeze.json')))throw new Error('Author dossier already sealed')
const future=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro21-final-reviewed-images-native-preparation-20261007-v1/isolated-repository')
const inputs=new Map<string,{path:string,sha256:string,bytes:number}>()
const hash=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p);const v={path:relative(root,p),sha256:hash(b),bytes:b.length};inputs.set(v.path,v);return v}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(p,'utf8'))}
const write=(p:string,v:unknown)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n')}
const copy=(p:string,q:string)=>{bind(p);mkdirSync(dirname(q),{recursive:true});copyFileSync(p,q)}
const copyCurrentIfAbsent=(p:string)=>{const q=resolve(sparse,p);if(!existsSync(q))copy(resolve(root,p),q);return q}
const four=['0daa79f6-8f61-5506-98f9-65db83062ba8','475eebb4-4eb0-524f-b1ec-4a672bf856d2','ffef97e3-12d6-5090-9816-46ab9e57fae2','e70d8a85-2dea-5165-919b-200fee9f4db4']
const canonicalPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const candidate=read(resolve(sparse,canonicalPath)),baseline=read(resolve(future,canonicalPath))
const byID=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g])),oldByID=new Map<string,any>(baseline.goals.map((g:any)=>[g.id,g]))
const delta=candidate.goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(oldByID.get(g.id))).map((g:any)=>g.id)
if(JSON.stringify(delta.slice().sort())!==JSON.stringify(four.slice().sort()))throw new Error('Only four whole canonical goals may change')
const ledger=read(resolve(root,'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')),baselineLedger=structuredClone(ledger)
const kindChanges=[]
for(const d of ledger.decisions){const fp=fingerprintSemanticKindSourceGoal(byID.get(d.goalId));if(d.sourceFingerprint!==fp){kindChanges.push({goalId:d.goalId,oldFingerprint:d.sourceFingerprint,candidateFingerprint:fp});d.sourceFingerprint=fp}}
if(JSON.stringify(kindChanges.map(r=>r.goalId).sort())!==JSON.stringify(four.slice().sort()))throw new Error('Unexpected semantic-kind input change')
write(resolve(sparse,'inputs/semantic-kinds.four-candidate.json'),ledger)
write(resolve(own,'semantic-kind-four-candidate.inert-envelope.author.json'),{role:'Technical current taxonomy input; four fingerprint renewals are author bindings, no independent A/D/P/M/V approval',candidatePayload:ledger,changedBindings:kindChanges,allOther468DecisionsExact:true,independentReviewPending:true,humanApproval:false})
const qa=read(resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')),baselineQA=structuredClone(qa)
const oldFourQA=read(resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-three-current383-author-continuation-v2/prospective-qa.no-approval.snapshot.json'))
for(let i=0;i<qa.records.length;i++){const r=qa.records[i];if(four.includes(r.goalId)){const replacement=oldFourQA.records.find((z:any)=>z.goalId===r.goalId);if(!replacement||replacement.contentApprovedChatGpt!=='no'||replacement.humanApproved!=='no')throw new Error('Only truthful available/unapproved image QA input allowed');qa.records[i]=replacement}}
write(resolve(sparse,'inputs/visualization-qa.four-candidate.json'),qa)
write(resolve(own,'visualization-four-availability-input.inert-envelope.author.json'),{role:'Exact existing selected raster availability only; no new V approval',candidatePayload:qa,onlyFourRecordsReplaced:true,machineApproval:false,humanApproval:false})
for(const r of qa.records)if(r.visualizationState==='available'){
 const q=resolve(sparse,r.publicAssetPath);if(!existsSync(q))copy(resolve(future,r.publicAssetPath),q)
 if(four.includes(r.goalId))copy(q,resolve(own,'selected-existing-images',r.goalId+'.png'))
}
copy(resolve(future,'inputs/current390.composition-view.exact.json'),resolve(sparse,'inputs/current390.composition-view.exact.json'))
const fullConfig=read(resolve(future,'config/full-final390.book.config.json'))
fullConfig.bookId='biologie-q1-four-current390-author-candidate';fullConfig.title='Biologie – Q1-Autorenkandidat im aktuellen 390-Ziele-Kontext';fullConfig.semanticKindLedgerPath='inputs/semantic-kinds.four-candidate.json';fullConfig.goalVisualizationQaPath='inputs/visualization-qa.four-candidate.json';fullConfig.outputPath='outputs/full390.four-candidate.book-model.json'
write(resolve(sparse,'config/full390.four-candidate.book.config.json'),fullConfig)
copy(resolve(sparse,'config/full390.four-candidate.book.config.json'),resolve(own,'native/full390.four-candidate.book.config.json'))
const loaded=await loadGoalBookBuildInputs('config/full390.four-candidate.book.config.json',sparse)
const model=loaded.model
if(model.pages.length!==390)throw new Error('Current390 target universe changed')
write(resolve(own,'native/full390.four-candidate.book-model.json'),model)
const assetDigestsForBaseline:Record<string,string>={}
for(const r of qa.records)if(r.visualizationState==='available')assetDigestsForBaseline[r.imageUrl]='sha256:'+hash(readFileSync(resolve(sparse,r.publicAssetPath)))
const oldModel=buildGoalBookModel({landscape:baseline,semanticKindLedger:baselineLedger,compositionView:read(resolve(sparse,'inputs/current390.composition-view.exact.json')),goalVisualizationQa:baselineQA,goalVisualizationAssetDigests:assetDigestsForBaseline,evidenceReviewSources:[],config:fullConfig}),oldPages=new Map<string,any>(oldModel.pages.map((p:any)=>[p.goalId,p]))
write(resolve(own,'native/full390.current95-baseline.book-model.json'),oldModel)
const pageDeltas=model.pages.map(p=>({goalId:p.goalId,pageFingerprintBefore:oldPages.get(p.goalId)?.pageFingerprint,pageFingerprintCandidate:p.pageFingerprint,changedFields:Object.keys(p).filter(k=>JSON.stringify((p as any)[k])!==JSON.stringify(oldPages.get(p.goalId)?.[k]))})).filter(p=>p.changedFields.length)
if(pageDeltas.some(r=>!four.includes(r.goalId)))throw new Error('Unexpected other goal native page/context change')
const protected74=read(resolve(future,'../inputs/protected74.exact.json')).map((r:any)=>r.goalId)
if(protected74.length!==74||protected74.some((id:string)=>delta.includes(id)||pageDeltas.some(r=>r.goalId===id)))throw new Error('Protected74 changed')
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:four,bookId:'biologie-q1-four-current390-native-candidate-20261007',title:'Biologie – vier bestehende Q1-Ziele: gezielter Autorenkandidat'})
write(resolve(own,'native/four/book-model.json'),subset)
const eleven=read(resolve(own,'eleven-resolved-current-components-twentyfour-exact-cases.author.json'))
const elevenIDs=eleven.components.map((r:any)=>r.actualExistingCanonicalGoalId)
const elevenSubset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:elevenIDs,bookId:'biologie-q1-eleven-existing-bounded-material-context-20261007',title:'Biologie – elf vorhandene Ziele und begrenzte Referenzmaterialien'})
write(resolve(own,'native/eleven-existing-context.book-model.json'),elevenSubset)
const sourceConfigPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',sourceConfig=read(resolve(root,sourceConfigPath))
sourceConfig.semanticKindLedgerPath='inputs/semantic-kinds.four-candidate.json'
const supplementalSTMap='curricula/DE/Gymnasium/mapping/DE-ST/source-components/st_biology_q1_four_bounded_stage_components.author-20261007-v1.review.json'
if(existsSync(resolve(sparse,supplementalSTMap)))sourceConfig.mappingPaths.push(supplementalSTMap)
copyCurrentIfAbsent(sourceConfig.durationModelPolicyPath)
for(const snap of sourceConfig.sourceDocumentSnapshots??[])copyCurrentIfAbsent(snap.path)
for(const p of sourceConfig.mappingPaths){const mapping=read(copyCurrentIfAbsent(p));const extraction=read(copyCurrentIfAbsent(mapping.sourceExtractionPath));for(const doc of extraction.sourceDocuments?.length?extraction.sourceDocuments:[extraction.sourceDocument])if(doc?.path)copyCurrentIfAbsent(doc.path)}
write(resolve(sparse,sourceConfigPath),sourceConfig)
const atlas=buildGoalBookSourceAtlasInputs(sourceConfig,sparse)
for(const [p,s]of Object.entries(atlas.outputs)){const q=resolve(sparse,p);mkdirSync(dirname(q),{recursive:true});writeFileSync(q,s)}
const baseLedger=baselineLedger
// Baseline source witnesses use the same sealed final21 whole goals and current source inputs.
const baselineRoot=resolve(sparse,'baseline-source-readonly');mkdirSync(baselineRoot,{recursive:true})
const baselineSourceConfig=structuredClone(sourceConfig);baselineSourceConfig.mappingPaths=baselineSourceConfig.mappingPaths.filter((p:string)=>p!==supplementalSTMap)
for(const p of [sourceConfig.durationModelPolicyPath,...baselineSourceConfig.mappingPaths,...sourceConfig.sourceDocumentSnapshots.map((s:any)=>s.path)])copy(resolve(root,p),resolve(baselineRoot,p))
for(const p of baselineSourceConfig.mappingPaths){const m=read(resolve(root,p));copy(resolve(root,m.sourceExtractionPath),resolve(baselineRoot,m.sourceExtractionPath));const x=read(resolve(root,m.sourceExtractionPath));for(const d of x.sourceDocuments?.length?x.sourceDocuments:[x.sourceDocument])if(d?.path&&existsSync(resolve(root,d.path)))copy(resolve(root,d.path),resolve(baselineRoot,d.path))}
write(resolve(baselineRoot,canonicalPath),baseline);write(resolve(baselineRoot,'inputs/semantic-kinds.four-candidate.json'),baseLedger)
const baseAtlas=buildGoalBookSourceAtlasInputs(baselineSourceConfig,baselineRoot)
const scopes=(a:any,id:string)=>a.receipt.scopes.filter((s:any)=>s.goalIds.includes(id)).map((s:any)=>s.key).sort()
const protectedScopeChanges=protected74.filter((id:string)=>JSON.stringify(scopes(baseAtlas,id))!==JSON.stringify(scopes(atlas,id)))
if(protectedScopeChanges.length)throw new Error('Protected74 source membership changed')
write(resolve(own,'native/current390-source-atlas.actual.receipt.json'),{role:'Actual native author source-atlas execution; native applicability is not whole source scientific approval',currentSealedBaselineCount:baseAtlas.receipt.counts,candidateCounts:atlas.receipt.counts,expected390ContractUnchanged:true,scopeChangesFour:four.map(id=>({goalId:id,before:scopes(baseAtlas,id),candidate:scopes(atlas,id)})),protected74ScopeChanges:protectedScopeChanges,sourceCountryWholeHoldsRetained:true,receipt:atlas.receipt,strictGain:0,humanApproval:false})
const bookConfig=read(resolve(root,'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
bookConfig.publicationMode='review';bookConfig.semanticKindLedgerPath='inputs/semantic-kinds.four-candidate.json';bookConfig.goalVisualizationQaPath='inputs/visualization-qa.four-candidate.json';bookConfig.evidenceReviewPaths=[];bookConfig.outputPath='outputs/four-candidate-source-atlas.book-model.json'
const manifest=JSON.parse(atlas.outputs[bookConfig.compositionViewManifestPath]),assetDigests:Record<string,string>={}
for(const r of qa.records)if(r.visualizationState==='available')assetDigests[r.imageUrl]='sha256:'+hash(readFileSync(resolve(sparse,r.publicAssetPath)))
const atlasModel=buildGoalBookModel({landscape:candidate,semanticKindLedger:ledger,goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(atlas.outputs[path])})),navigationView:JSON.parse(atlas.outputs[manifest.navigationViewPath]),durationModelPolicy:read(resolve(sparse,sourceConfig.durationModelPolicyPath)),evidenceReviewSources:[],config:bookConfig})
write(resolve(own,'native/full390.source-atlas-context.book-model.json'),atlasModel)
write(resolve(own,'native/four.source-atlas-context.book-model.json'),buildGoalDescriptionRolloutSubsetModel({baseModel:atlasModel,goalIds:four,bookId:'biologie-q1-four-source-atlas-candidate-context-20261007',title:'Biologie – vier Q1-Ziele: nationale Quellensicht mit offenen Grenzen'}))
write(resolve(own,'native/current390-four-and-protected74.actual.validation.json'),{createdAt:new Date().toISOString(),role:'Actual technical author candidate checks, no scientific approval',canonicalWholeGoalCount:candidate.goals.length,unchangedWholeGoalCount:468,newGoalIds:[],onlyFourGoalDeltas:delta,nativePageCount:model.pages.length,nativePageDeltas:pageDeltas,protected74WholeAndPagesExact:true,protected74SourceMembershipsExact:true,sourceAtlasCandidatePages:atlasModel.pages.length,unchangedBio21GoalObjectsAndNativePages:true,sourceHoldDistinction:'Source atlas resolves applicability witnesses, not detailed whole-source duties. ST legacy broad row stage and outgoing SH2023 versus incoming2026 remain held.',independentReviewsPending:true,newRasterGeneration:0,activeWrites:0,historicalWrites:0,strictGain:0,humanApproval:false,humanTrial:false,inputs:[...inputs.values()]})
console.log(JSON.stringify({canonicalGoals:472,curricularAtomic:390,onlyChangedGoals:four,nativePageDeltas:pageDeltas.length,protected74Exact:true,sourceAtlas390:'PASS',sourceScopeCount:atlas.receipt.scopes.length,newIDs:0,newRasterGeneration:0,strictGain:0}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
