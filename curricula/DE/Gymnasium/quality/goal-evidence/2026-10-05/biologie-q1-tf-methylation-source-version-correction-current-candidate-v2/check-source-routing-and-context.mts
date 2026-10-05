// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,renameSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-source-version-correction-current-candidate-v2',prior='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-prospective-current-candidate-v1',ind='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-independent-a-m-v-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const meta=read(own+'/prospective-paths.json'),iso=meta.isolationRoot,iread=(p:string)=>JSON.parse(readFileSync(resolve(iso,p),'utf8'))
const write=(name:string,v:any)=>writeFileSync(resolve(root,own,name),JSON.stringify(v,null,2)+'\n')
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const {sourceAtlasFacet,buildGoalBookSourceAtlasInputs}=await import(pathToFileURL(resolve(iso,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const {buildGoalBookOriginalSources}=await import(pathToFileURL(resolve(iso,'app/scripts/goalBookOriginalSources.ts')).href)
const {parseGoalBookOriginalSources}=await import(pathToFileURL(resolve(root,'app/src/utils/goalBookOriginalSources.ts')).href)
const {parseGoalBookRuntimeModel,filterGoalBookPages}=await import(pathToFileURL(resolve(root,'app/src/utils/goalBookRuntime.ts')).href)
const {resolveGoalBookPersonalizationScope,compileGoalBookPersonalizedProjection}=await import(pathToFileURL(resolve(root,'app/src/utils/goalBookPersonalizedProjection.ts')).href)
const {isAiApprovedForCurrentAsset}=await import(pathToFileURL(resolve(root,'app/src/utils/goalVisualizationQaStatus.ts')).href)
const oldExt=read(own+'/he-extraction.before-source-version.json'),newExt=iread(meta.heExtractionPath),oldMap=read(own+'/he-mapping.before-source-version.json'),newMap=iread(meta.heMappingPath)
const correct=new Set(['b8aa6b7a-8598-4498-83f5-5162bc3cb419','b5e1cdfd-34ff-4c05-976c-ee69ec041fdb'])
assert.deepEqual(newExt.sourceDocument,oldExt.sourceDocument);assert.deepEqual(newExt.sourceDocuments[0],oldExt.sourceDocuments[0]);assert.equal(newExt.sourceDocuments.length,2)
assert.deepEqual(newMap.decisions,oldMap.decisions);assert.deepEqual(newMap.mappings,oldMap.mappings)
const passage=(e:any,g:any)=>e.passages.find((p:any)=>p.id===g.passageId)??{}
const document=(e:any,g:any)=>{
 const p=passage(e,g),keys=[g.sourceDocumentKey,...(g.tags??[]).filter((s:string)=>s.startsWith('sourceDocument:')).map((s:string)=>s.slice(15)),p.sourceDocumentKey].filter(Boolean)
 assert.equal(new Set(keys).size>1,false,'Contradictory native source selection')
 const docs=e.sourceDocuments??[e.sourceDocument],matches=keys.length?docs.filter((d:any)=>d.key===keys[0]):docs
 assert.equal(matches.length,1,'Ambiguous native source selection');return matches[0]
}
const routing=[]
for(const oldGoal of oldExt.sourceGoals){
 const newGoal=newExt.sourceGoals.find((g:any)=>g.id===oldGoal.id),{sourceDocumentKey,...withoutKey}=newGoal
 assert.deepEqual(withoutKey,oldGoal,'Source clause/ref/text/tags/granularity changed '+oldGoal.id)
 const oldDoc=document(oldExt,oldGoal),newDoc=document(newExt,newGoal),oldDecision=oldMap.decisions.find((d:any)=>d.sourceGoalId===oldGoal.id),newDecision=newMap.decisions.find((d:any)=>d.sourceGoalId===oldGoal.id)
 const oldFacets={stage:sourceAtlasFacet([oldGoal,passage(oldExt,oldGoal),oldDoc,oldExt],'stage'),courseProfile:sourceAtlasFacet([oldGoal,passage(oldExt,oldGoal),oldDoc,oldExt],'courseProfile')}
 const newFacets={stage:sourceAtlasFacet([newGoal,passage(newExt,newGoal),newDoc,newExt],'stage'),courseProfile:sourceAtlasFacet([newGoal,passage(newExt,newGoal),newDoc,newExt],'courseProfile')}
 assert.deepEqual(oldFacets,newFacets)
 assert.deepEqual(oldDecision,newDecision)
 if(!correct.has(oldGoal.id)){assert.deepEqual(oldDoc,newDoc);assert.equal(sourceDocumentKey,oldDoc.key)}
 else {assert.equal(sourceDocumentKey,'KC2024_BIOLOGIE_SEKII_STAND_20250801');assert.equal(newDoc.sha256,'sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558');assert.equal(sha(resolve(iso,newDoc.path)),newDoc.sha256);assert.ok(oldGoal.sourceRef.includes('Stand 01.08.2025'));assert.ok(oldGoal.sourceRef.includes('39'))}
 routing.push({sourceGoalId:oldGoal.id,metadataOnlyDisambiguation:!correct.has(oldGoal.id),beforeImplicitDocumentKey:oldDoc.key,afterExplicitDocumentKey:sourceDocumentKey,oldSourceUrl:oldDoc.url,oldSourcePath:oldDoc.path,newSourceUrl:newDoc.url,newSourcePath:newDoc.path,sourceRef:oldGoal.sourceRef,sourceText:oldGoal.sourceText,granularity:oldGoal.granularity,canonicalWholeGoalIdsPreserved:newDecision.canonicalGoalIds,wholeMappingDecisionUnchanged:true,compatibilityMappingRowsUnchanged:true,nativeFacetBindingsBefore:oldFacets,nativeFacetBindingsAfter:newFacets,allSourceFieldsExceptExplicitKeyUnchanged:true})
}
assert.equal(routing.filter((r:any)=>r.metadataOnlyDisambiguation).length,148)
const atlas=buildGoalBookSourceAtlasInputs(iread(meta.atlasPath),iso)
assert.equal(atlas.receipt.counts.publishedCurricularAtomicGoals,364);assert.equal(atlas.receipt.counts.sourceViews,20)
write('actual-native-source-document-routing.receipt.json',{status:'pass',old2024DocumentDescriptorPreservedExactly:true,explicitOld2024Routes:148,actual2025Routes:2,sourceDocumentSelectionUsesUnmodifiedNativeFramework:true,nativeSourceAtlasCounts:atlas.receipt.counts,routing,scientificReviewClaimFor148:false,humanApproval:false,activeWrites:0})

const beforeRaw=iread(own+'/baseline-full.book-model.json'),afterRaw=iread(own+'/prospective-full.book-model.json'),v1Raw=read(prior+'/prospective-full.book-model.json'),before=parseGoalBookRuntimeModel(beforeRaw),after=parseGoalBookRuntimeModel(afterRaw)
const report=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-current-integration-v1/central-after-five-current-A-M.report.json'),strict=report.subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
const scopes=[]
for(const source of after.source.compositionViewSources){
 const scope=source.scope,baseFilter={jurisdiction:scope.jurisdiction,stage:scope.stage,durationModel:scope.durationModel??null,courseProfile:scope.courseProfile??null}
 const filters=resolveGoalBookPersonalizationScope(after,baseFilter).status==='partial'&&baseFilter.durationModel===null?['G8','G9'].map(durationModel=>({...baseFilter,durationModel})).filter(filter=>resolveGoalBookPersonalizationScope(after,filter).status==='complete'):[baseFilter]
 assert.ok(filters.length)
 for(const filter of filters){
  const resolved=resolveGoalBookPersonalizationScope(after,filter);assert.equal(resolved.status,'complete')
  const compiled=await compileGoalBookPersonalizedProjection(iread(source.path),after,resolved.scope);assert.ok(compiled.projection&&compiled.suppliedProjection);assert.equal(compiled.findings.some((f:any)=>f.severity==='error'),false)
  const oldRows=filterGoalBookPages({model:before,query:'',chapterId:null,applicability:filter}),newRows=filterGoalBookPages({model:after,query:'',chapterId:null,applicability:filter}),oldIds=new Set(oldRows.map((p:any)=>p.goalId)),newIds=new Set(newRows.map((p:any)=>p.goalId)),added=[...newIds].filter(id=>!oldIds.has(id)),removed=[...oldIds].filter(id=>!newIds.has(id))
  const allowed=scope.stage==='SekII'&&['DE-HE','DE-BY'].includes(scope.jurisdiction),expected=allowed?(scope.jurisdiction==='DE-BY'?meta.goalIds:[meta.goalIds[1]]):[]
  assert.deepEqual(added,expected);assert.deepEqual(removed,[]);assert.equal(newIds.has(meta.goalIds[1]),allowed)
  const hist='8f6933b1-6e02-5512-acf2-a90a7fb9cb75';assert.equal(newIds.has(hist),oldIds.has(hist))
  const oldFocus=oldRows.slice(0,3).map((p:any)=>p.goalId),focused=filterGoalBookPages({model:after,query:'',chapterId:null,applicability:filter,goalIds:oldFocus}).map((p:any)=>p.goalId);assert.deepEqual(focused,oldFocus)
  scopes.push({scope,filter,oldAtomicCount:oldRows.length,newAtomicCount:newRows.length,added,removed,tfVisible:newIds.has(meta.goalIds[0]),methylationVisible:newIds.has(meta.goalIds[1]),nativePersonalizedViewCompiled:true,oldFocusIds:oldFocus,oldFocusIdsAndOrderPreserved:true,existingLKHistoneVisibilityPreserved:true})
 }
}
const stripLayout=(v:any):any=>Array.isArray(v)?v.map(stripLayout):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint','goalFingerprint'].includes(k)).map(([k,v])=>[k,stripLayout(v)])):v
const comparePages=(old:any,newer:any)=>old.pages.map((p:any)=>{
 const n=newer.pages.find((q:any)=>q.goalId===p.goalId);assert.ok(n)
 return{goalId:p.goalId,title:p.title,beforePage:p.pageNumber,afterPage:n.pageNumber,beforeGoalFingerprint:p.goalFingerprint,afterGoalFingerprint:n.goalFingerprint,beforePageFingerprint:p.pageFingerprint,afterPageFingerprint:n.pageFingerprint,changedFields:Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify(n[k])),goalFingerprintChanged:p.goalFingerprint!==n.goalFingerprint,pageFingerprintChanged:p.pageFingerprint!==n.pageFingerprint,semanticPagePayloadChanged:JSON.stringify(stripLayout(p))!==JSON.stringify(stripLayout(n)),previousStrict:strict.includes(p.goalId)}
})
const pages=comparePages(beforeRaw,afterRaw),v1Pages=comparePages(v1Raw,afterRaw),closed=pages.filter((p:any)=>p.previousStrict);assert.equal(closed.length,38)
const graph=iread(meta.canonicalPath),goals=new Map(graph.goals.map((g:any)=>[g.id,g])),missing=[],cycles=[]
assert.deepEqual(graph,read(prior+'/prospective-input-tree/'+meta.canonicalPath),'All canonical goal fields must remain exactly frozen-v1')
for(const kind of ['contains','requires']){const done=new Set(),active=new Set();function visit(id:string,path:string[]){if(active.has(id)){cycles.push({kind,path:[...path,id]});return}if(done.has(id))return;active.add(id);const g:any=goals.get(id);for(const child of g?.[kind]??[]){if(!goals.has(child))missing.push({kind,goalId:id,missing:child});else visit(child,[...path,id])}active.delete(id);done.add(id)}for(const id of goals.keys())visit(id as string,[])}
assert.equal(missing.length,0);assert.equal(cycles.length,0)
const exam:any=goals.get('3ac1cbb1-a366-5ae5-85c0-76b08270869d'),cap:any=goals.get('1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a');assert.ok(meta.goalIds.every((id:string)=>exam.requires.includes(id)&&exam.examData.coveredGoalIds.includes(id)&&cap.requires.includes(id)))
const contexts={goals:graph.goals.filter((g:any)=>[...meta.goalIds,...meta.bindingOnlyGoalIds,...meta.additionalSourceLinkFootprintGoalIds].includes(g.id)),parents:graph.goals.filter((g:any)=>meta.goalIds.some((id:string)=>g.contains.includes(id))),prerequisites:graph.goals.filter((g:any)=>meta.goalIds.some((id:string)=>(goals.get(id) as any).requires.includes(g.id))),dependents:graph.goals.filter((g:any)=>meta.goalIds.some((id:string)=>g.requires.includes(id))),sourceViews:scopes,allExistingPageComparison:pages,all364FrozenV1PageComparison:v1Pages,closedPageComparison:closed,newPage:afterRaw.pages.find((p:any)=>p.goalId===meta.goalIds[1])}
const summary={current38StrictCompared:38,strictGoalFingerprintChanges:closed.filter((p:any)=>p.goalFingerprintChanged).map((p:any)=>p.goalId),strictSemanticContextChanges:closed.filter((p:any)=>p.semanticPagePayloadChanged).map((p:any)=>p.goalId),strictPageFingerprintChanges:closed.filter((p:any)=>p.pageFingerprintChanged).map((p:any)=>p.goalId),strictPaginationChanges:closed.filter((p:any)=>p.beforePage!==p.afterPage).map((p:any)=>p.goalId),all363OldSemanticPageChanges:pages.filter((p:any)=>p.semanticPagePayloadChanged).map((p:any)=>p.goalId),frozenV1ToV2SemanticPageChanges:v1Pages.filter((p:any)=>p.semanticPagePayloadChanged).map((p:any)=>p.goalId),sourceFilterCases:scopes.length}
write('actual-native-context-and-all-page-comparison.receipt.json',{status:'pass',baselineBookDigest:beforeRaw.digest,frozenV1BookDigest:v1Raw.digest,afterBookDigest:afterRaw.digest,graphMissingEdges:missing,graphCycles:cycles,summary,contexts,unchangedHistoricalReviewsRetained:true,currentContextAcceptance:'Actual context/page comparison only; changed source binding is separately targeted for Gel. Historical descriptions are not restarted or bulk reapproved.',humanApproval:false,activeWrites:0})

const newMappingFile=resolve(iso,meta.heMappingPath),hidden=resolve(iso,own,'native-before-new-source-map.temporarily-held.json')
let beforeIndex:any
renameSync(newMappingFile,hidden)
try{beforeIndex=buildGoalBookOriginalSources(afterRaw,iso)}finally{renameSync(hidden,newMappingFile)}
const afterIndex=buildGoalBookOriginalSources(afterRaw,iso)
assert.ok(parseGoalBookOriginalSources(afterIndex,afterRaw))
const normalizeEvidence=(index:any,id:string)=>{
 const ids=(index.goals[id]??[]).flatMap((t:any)=>t.evidenceIds),ev=index.evidence.filter((e:any)=>ids.includes(e.id))
 return ev.map((e:any)=>{const d=index.documents.find((d:any)=>d.id===e.documentId),{id:_,documentId,...fields}=e;return {...fields,title:d.title,url:d.url}}).sort((a:any,b:any)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
}
const sourceFootprint=afterRaw.pages.map((p:any)=>({goalId:p.goalId,title:p.title,currentStrict:strict.includes(p.goalId),before:normalizeEvidence(beforeIndex,p.goalId),after:normalizeEvidence(afterIndex,p.goalId)})).filter((p:any)=>JSON.stringify(p.before)!==JSON.stringify(p.after))
const remainingFalseVersionLinks=afterRaw.pages.flatMap((p:any)=>normalizeEvidence(afterIndex,p.goalId).filter((e:any)=>e.url==='https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'&&e.sourceRef.includes('Stand 01.08.2025')&&e.sourceRef.includes('39')).map((e:any)=>({goalId:p.goalId,title:p.title,currentStrict:strict.includes(p.goalId),...e})))
assert.ok(remainingFalseVersionLinks.length,'Do not hide historical incorrect-version citations')
write('actual-native-original-source-links.before.json',beforeIndex);write('actual-native-original-source-links.after.json',afterIndex)
write('actual-source-version-current-page-footprint.receipt.json',{status:'HOLD_CURRENT_ORIGINAL_SOURCE_VERSION_CITATIONS',nativeComparisonPass:true,method:'Unmodified buildGoalBookOriginalSources and native browser payload parser, with only newly corrected HE mapping temporarily absent for the before comparison; all historical mappings retained in both passes.',changedSourceLinkGoalCount:sourceFootprint.length,changedSourceLinkGoals:sourceFootprint,remainingFalseVersionLinkCount:remainingFalseVersionLinks.length,remainingFalseVersionLinks,preciseBlocker:'OriginalSources scans all physical mapping/*.review.json files. Historical Gel-v1 and TF/methylation-v1 source rows pair Stand01.08.2025/p39 with the2024-11 URL; these incorrect extra citations remain visible alongside the corrected2025 current atlas route. No final source approval or operative adoption is justified until the generic current-source consumer binding is separately fixed and reviewed.',existingConfiguredSelectionMechanism:{sourceAtlasMappingPaths:'app/scripts/goalBookSourceAtlasInputs.ts:232',originalSourcesUnconditionalScan:'app/scripts/goalBookOriginalSources.ts:97',configuredActiveMappingFilterInOriginalSourcesExists:false,sourceDocumentKeyOnlySelectsDocumentWithinExtraction:true,sourceLandscapeRegistryNotReadByOriginalSources:true},historicalFilesUnchanged:true,sourceAtlasCurrentBindingUses2025OnlyForTheTwoCorrectedSourceGoals:true,scientificDescriptionGoalIds:meta.goalIds,bindingOnlyStrictGoalIds:meta.bindingOnlyGoalIds,pcrClosureClaim:false,current38PageContextSummary:summary,sourceClosureClaim:false,humanApproval:false,activeWrites:0})

const exact=read(ind+'/visualization.exact-goal-asset-bindings.candidate.json'),ledger=iread(meta.qaPath),vrows=[]
for(const b of exact.bindings){
 const g:any=goals.get(b.goal.id),q=ledger.records.find((r:any)=>r.goalId===g.id);assert.deepEqual(g,b.goal)
 for(const asset of b.assets)assert.equal(sha(resolve(iso,asset.path)),asset.sha256)
 assert.equal(isAiApprovedForCurrentAsset(q),true);assert.equal(q.humanApproved,'no');assert.equal(q.humanReviewedAt,null)
 const fresh=read(ind+'/visualization.native-candidate.qa.json').records.find((r:any)=>r.goalId===g.id)
 assert.deepEqual(q,fresh,'Scientific V row changed during normalization')
 vrows.push({goalId:g.id,wholeCanonicalGoalTextTitleAltRequiresAndResourceMetadataEqual:true,threeActualAssetsEqual:true,assetSha256:q.assetSha256,unmodifiedNativeAiCurrentAssetPredicate:true,scientificInspectionReusedFrom:ind,humanApproved:'no'})
}
write('actual-native-current-v-reuse.receipt.json',{status:'pass',rows:vrows,scientificReasoningPreservedFromIndependentInspection:true,hashOnlyScienceClaim:false,sourceVersionCorrectionDoesNotChangeGoalTextOrPixels:true,humanApproval:false,activeWrites:0})
console.log(JSON.stringify({oldRoutesExactlyPreserved:148,correct2025Routes:2,nativeAtlas:atlas.receipt.counts,dagValid:true,current38StrictSummary:summary,sourceLinkFootprintGoalIds:sourceFootprint.map((p:any)=>p.goalId),currentV:2,activeWrites:0}))
