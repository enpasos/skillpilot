import {readFileSync, writeFileSync, rmSync, existsSync} from 'node:fs'
import {resolve, dirname, join, relative} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'

const here=dirname(fileURLToPath(import.meta.url))
const root=resolve(here,'../../../../../../..')
const qa=join(here,'qa-artifacts')
if(existsSync(join(here,'native-source-preparation-author-v11.final.freeze.json')))throw new Error('Sealed author package must not be overwritten')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,value:unknown)=>{if(!p.startsWith(here+'/'))throw new Error('Only assigned author package writes');writeFileSync(p,JSON.stringify(value,null,2)+'\n')}
const bind=(p:string)=>({path:relative(root,p),sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length})
const {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs}=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href)
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import(pathToFileURL(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {compileCompositionView}=await import(pathToFileURL(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(join(root,'app/src/hooks/useLandscapes.ts')).href)
const guard=read(join(here,'current378-protected112-and-nine-family-structure-input-guard.actual.json'))
const binder=read(join(here,'twenty-six-native-uuid-and-current-v10-material-profile-binders.author-candidate.json'))
const source=read(join(here,'twenty-six-partial-source-components-and-original-national-holds.author-candidate.json'))
const original=read(join(root,guard.baselineActiveCanon.path))
const candidatePath=join(qa,'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json')
const candidate=read(candidatePath)
const oldKindsPath=join(root,guard.baselineKinds.path)
if(bind(oldKindsPath).sha256!==guard.baselineKinds.sha256)throw new Error('Active Chemistry baseline kind ledger changed')
const oldKinds=read(oldKindsPath)
const oldDecisionById=new Map(oldKinds.decisions.map((row:any)=>[row.goalId,row]))
const oldById=new Map(original.goals.map((g:any)=>[g.id,g]))
const byId=new Map(candidate.goals.map((g:any)=>[g.id,g]))
const changedIds=new Set(guard.originalFamilyGoalIds)
const kinds=structuredClone(oldKinds)
kinds.sourceLandscapePath=relative(root,candidatePath)
// Closed production classification vocabulary only. These are inert author
// inputs and grant no independent semantic-atomicity or other gate verdict.
kinds.decisions=candidate.goals.map((goal:any)=>{
 const old=oldDecisionById.get(goal.id) as any
 if(old&&!changedIds.has(goal.id))return old
 return {goalId:goal.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(goal),semanticKind:goal.contains.length?'curricularArea':'curricularAtomic',decisionStatus:'authoritative',decisionBasis:goal.contains.length?'reviewed-current-structural-split-curricular-area':'reviewed-current-structural-split-curricular-atomic'}
})
kinds.counts=Object.fromEntries(Object.keys(oldKinds.counts).filter(k=>k!=='total').map(k=>[k,kinds.decisions.filter((row:any)=>row.semanticKind===k).length]))
kinds.counts.total=kinds.decisions.length
if(kinds.counts.curricularAtomic!==395||kinds.counts.curricularArea!==68||kinds.counts.total!==503)throw new Error('Unexpected concrete native kind counts')
const kindPath=join(qa,'chemie.semantic-kinds.native-author-candidate.json')
write(kindPath,kinds)
const normalized=normalizeCanonicalLandscape(candidate)
const diagnostics=validateCanonicalLandscape(normalized)
if(diagnostics.some((r:any)=>r.severity==='error'))throw new Error(JSON.stringify(diagnostics))
for(const relation of ['contains','requires']){
 const visiting=new Set<string>(),done=new Set<string>()
 const visit=(id:string)=>{
  if(visiting.has(id))throw new Error(relation+' cycle at '+id)
  if(done.has(id))return
  visiting.add(id)
  for(const ref of (byId.get(id) as any)[relation]??[]){const local=ref.includes(':')?ref.split(':').at(-1):ref;if(!byId.has(local))throw new Error(relation+' unresolved '+ref);visit(local)}
  visiting.delete(id);done.add(id)
 }
 for(const id of byId.keys())visit(id as string)
}
const reviewViewPath=join(qa,'BY26.partial-source-products.review-only.view.json')
const viewCompilation=compileCompositionView(read(reviewViewPath),normalized)
if(viewCompilation.findings.some((r:any)=>r.severity==='error'))throw new Error(JSON.stringify(viewCompilation.findings))
const baseline=await loadGoalBookBuildInputs(relative(root,join(qa,'baseline-native-book.config.json')),root)
const current=await loadGoalBookBuildInputs(relative(root,join(qa,'candidate-native-book.config.json')),root)
const partial=await loadGoalBookBuildInputs(relative(root,join(qa,'BY26-partial-source-native-book.config.json')),root)
if(baseline.model.pages.length!==378||current.model.pages.length!==395||partial.model.pages.length!==26)throw new Error('Unexpected actual native pure model counts')
write(join(qa,'baseline-native-pure-book-model.json'),baseline.model)
write(join(qa,'candidate-native-pure-book-model.json'),current.model)
write(join(qa,'BY26-partial-source-native-pure-book-model.json'),partial.model)
const oldPages=new Map(baseline.model.pages.map((p:any)=>[p.goalId,p]))
const pages=new Map(current.model.pages.map((p:any)=>[p.goalId,p]))
const partialPages=new Map(partial.model.pages.map((p:any)=>[p.goalId,p]))
const stripPagination=(v:any):any=>Array.isArray(v)?v.map(stripPagination):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint'].includes(k)).map(([k,item])=>[k,stripPagination(item)])):v
const protectedBindings=guard.protectedStrictGoalIds.map((id:string)=>{
 const old=oldPages.get(id) as any,now=pages.get(id) as any
 return {goalId:id,wholeGoalObjectExact:JSON.stringify(oldById.get(id))===JSON.stringify(byId.get(id)),oldGoalFingerprint:old.goalFingerprint,currentGoalFingerprint:now.goalFingerprint,goalFingerprintExact:old.goalFingerprint===now.goalFingerprint,oldPageFingerprint:old.pageFingerprint,currentPageFingerprint:now.pageFingerprint,pageFingerprintExact:old.pageFingerprint===now.pageFingerprint,pageContentIgnoringPaginationExact:JSON.stringify(stripPagination(old))===JSON.stringify(stripPagination(now))}
})
if(!protectedBindings.every((r:any)=>r.wholeGoalObjectExact&&r.goalFingerprintExact))throw new Error('Protected112 whole-goal or goal-fingerprint drift')
const allExistingPageChanges=baseline.model.pages.map((old:any)=>{
 const now=pages.get(old.goalId) as any
 if(!now)return {goalId:old.goalId,title:old.title,pageRemovedByDeclaredAtomToCluster:true,convertedCluster:guard.convertedClusterGoalIds.includes(old.goalId),protectedStrict:guard.protectedStrictGoalIds.includes(old.goalId)}
 const changedFields=Object.keys(stripPagination(old)).filter(k=>JSON.stringify(stripPagination(old)[k])!==JSON.stringify(stripPagination(now)[k]))
 return {goalId:old.goalId,title:old.title,pageRemovedByDeclaredAtomToCluster:false,protectedStrict:guard.protectedStrictGoalIds.includes(old.goalId),wholeGoalObjectExact:JSON.stringify(oldById.get(old.goalId))===JSON.stringify(byId.get(old.goalId)),goalFingerprintExact:old.goalFingerprint===now.goalFingerprint,oldPageFingerprint:old.pageFingerprint,currentPageFingerprint:now.pageFingerprint,changedFieldsExcludingPurePagination:changedFields,actualChangedFields:changedFields.map(field=>({field,oldValue:stripPagination(old)[field],candidateValue:stripPagination(now)[field]}))}
}).filter((r:any)=>r.pageRemovedByDeclaredAtomToCluster||r.changedFieldsExcludingPurePagination.length)
const oldEffective=new Map(prepareLandscapeEntries([original])[0].goals.map((g:any)=>[g.id,g]))
const newEffective=new Map(prepareLandscapeEntries([candidate])[0].goals.map((g:any)=>[g.id,g]))
const splitIds=new Set(guard.convertedClusterGoalIds)
const originalFamilyIds=new Set(guard.originalFamilyGoalIds)
const consumers=candidate.goals.filter((g:any)=>g.requires.some((id:string)=>originalFamilyIds.has(id))).map((goal:any)=>({goalId:goal.id,title:goal.title,isExistingOriginalGoal:oldById.has(goal.id),protectedStrict:guard.protectedStrictGoalIds.includes(goal.id),directRequires:goal.requires,splitClusterReferences:goal.requires.filter((id:string)=>splitIds.has(id)),retainedChangedAtomReferences:goal.requires.filter((id:string)=>originalFamilyIds.has(id)&&!splitIds.has(id)),actualProductionEffectiveRequiresBefore:(oldEffective.get(goal.id) as any)?.effectiveRequires??null,actualProductionEffectiveRequiresAfter:(newEffective.get(goal.id) as any)?.effectiveRequires??null,nativeBeforePage:oldPages.get(goal.id)??null,nativeAfterPage:pages.get(goal.id)??null,integrationVerdict:'HOLD for actual narrow prerequisite performance/source/context judgement; UUID retention alone is not semantic equivalence'}))
const prototypeRequires=binder.atomBinders.map((row:any)=>({candidateKey:row.candidateKey,goalId:row.nativeCandidateGoalId,reviewedDirectRequires:row.actualDirectRequires,actualCurrentWrapperEffectiveRequires:(newEffective.get(row.nativeCandidateGoalId) as any).effectiveRequires,reviewedV7DirectRequiresClaimOnly:true,canonicalWrapperDoesNotProveMinimalEffectiveRequires:true}))
const authority={schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'actual unchanged production helpers for inert author preparation, no native approval',nativeApproval:false,humanApproval:false,humanTrial:false,strictCompletionsAdded:0,restoredActiveBindings:0,activeWrites:false}
write(join(here,'actual-native-pure-model-schema-and-protected112-bindings.json'),{
 ...authority,productionHelpers:[bind(join(root,'app/scripts/goalBookModel.ts')),bind(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')),bind(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')),bind(join(root,'app/src/hooks/useLandscapes.ts'))],actualPureModelPages:{baseline:378,candidate:395,partialBYSourceProducts:26},semanticKindCounts:kinds.counts,canonicalDiagnostics:diagnostics,requiresAndContainsDagsPassed:true,partialBYReviewViewCompileFindings:viewCompilation.findings,
 protected112Bindings:protectedBindings,protected112WholeObjectsAndGoalFingerprintsExact:true,
 protected112PageFingerprintExactCount:protectedBindings.filter((r:any)=>r.pageFingerprintExact).length,
 protected112PageContentIgnoringPaginationExactCount:protectedBindings.filter((r:any)=>r.pageContentIgnoringPaginationExact).length,
 protectedActualChangedPageContextGoalIds:protectedBindings.filter((r:any)=>!r.pageContentIgnoringPaginationExact).map((r:any)=>r.goalId),
 allActuallyChangedExistingPageBindingsExcludingPurePagination:allExistingPageChanges,
 unchangedExistingPagesAreNotRepeatedScientificReviews:true,
 sourceAtlasMeaning:'Partial BY26 review products use actually read components with stage-labelled structure; no full national atlas, whole original source/context coverage or final active source-placement approval.',
 actualPureBookModelBindings:[bind(join(qa,'baseline-native-pure-book-model.json')),bind(join(qa,'candidate-native-pure-book-model.json')),bind(join(qa,'BY26-partial-source-native-pure-book-model.json'))],
 actualNativeProfileOrIndependentDescriptionDecisions:0,fullPDFOrBuildPerformed:false,executedBackendFrontierAcceptance:false,
})
write(join(here,'actual-affected-requires-consumers-inherited-wrapper-and-protected-context-holds.json'),{
 ...authority,actualRequiresConsumers:consumers,newRoutineActualEffectiveRequires:prototypeRequires,
 protectedDirectConsumerGoalIds:consumers.filter((r:any)=>r.protectedStrict).map((r:any)=>r.goalId),
 protectedChangedPageContextGoalIds:protectedBindings.filter((r:any)=>!r.pageContentIgnoringPaginationExact).map((r:any)=>r.goalId),
 backendSourceBinding:bind(join(root,'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java')),
 sourceBasedFrontierInferenceOnly:true,backendFrontierExecutionPerformed:false,
 backendLogicActuallyRead:'With composition views getRichFrontier resolves structural prerequisites; computeEffectivePrereqMastery takes a minimum over core cluster children and isCoreForPrereqs selects GK tags. A direct prerequisite that changed atom→cluster can impose all children, including distinct upper-stage/operator routines. Current broad SekI wrapper inherits a laboratory cluster into all new children; its untouched bytes do not establish the reviewed minimal route.',
 minimalConsumerSwapsNotBlindlyAuthored:true,
 requiresResolutionOrActualWrapperMigrationAndAffectedBindingsRequiredBeforeIntegration:true,
 oldOriginalFamilyImagesAndOriginalSourceStatusesUnchanged:true,
})
write(join(here,'twenty-six-actual-native-goal-page-source-material-fingerprint-inputs.json'),{
 ...authority,canonicalBinding:bind(candidatePath),semanticKindLedgerBinding:bind(kindPath),
 actualWholeUniverseModelBinding:bind(join(qa,'candidate-native-pure-book-model.json')),
 actualPartialSourceModelBinding:bind(join(qa,'BY26-partial-source-native-pure-book-model.json')),
 actualPartialSourceCompositionBinding:bind(reviewViewPath),
 nativeRoutinePages:binder.atomBinders.map((row:any)=>({candidateKey:row.candidateKey,nativeCandidateGoalId:row.nativeCandidateGoalId,actualWholeUniversePage:pages.get(row.nativeCandidateGoalId),actualPartialBYSourcePage:partialPages.get(row.nativeCandidateGoalId),currentProfileAndV10MaterialBinder:binder.profileBinders.find((p:any)=>p.candidateKey===row.candidateKey),partialPrimarySourceBinder:source.placements.find((p:any)=>p.candidateKey===row.candidateKey),nativeApproval:false})),
 sourceSpecificNativeReviewStillPending:true,actualNativeProfileCount:0,newGoalVisualizationAssets:0,
})
const sourceManifestPath=join(root,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json')
const manifest=read(sourceManifestPath)
const attachKinds=(landscape:any,ledger:any)=>{
 const kindById=new Map(ledger.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
 return normalizeCanonicalLandscape({...landscape,goals:landscape.goals.map((g:any)=>({...g,semanticKind:kindById.get(g.id)}))})
}
const oldCompile=attachKinds(original,oldKinds),newCompile=attachKinds(candidate,kinds)
const walk=(nodes:any[],out:any[]=[])=>{for(const n of nodes){if((n.kind==='goalEntry'||n.kind==='canonicalSubtree')&&originalFamilyIds.has(n.goalId))out.push({kind:n.kind,goalId:n.goalId,projectionRole:n.projectionRole??'target'});walk(n.children??[],out)}return out}
const sourceViews=manifest.sourcePaths
if(!Array.isArray(sourceViews))throw new Error('Expected actual configured source list')
const affectedViews=[]
for(const entry of sourceViews){
 const sourcePath=join(root,typeof entry==='string'?entry:entry.compositionViewPath??entry.path)
 const view=read(sourcePath),refs=walk(view.rootNodes)
 if(!refs.length)continue
 const oldResult=compileCompositionView(view,oldCompile),newResult=compileCompositionView(view,newCompile)
 const oldFindings=new Set(oldResult.findings.map((r:any)=>JSON.stringify(r)))
 affectedViews.push({sourceViewBinding:bind(sourcePath),viewId:view.viewId,scope:view.scope,actualAffectedReferences:refs,actualNewFindings:newResult.findings.filter((r:any)=>!oldFindings.has(JSON.stringify(r))),convertedClusterGoalEntryFindings:newResult.findings.filter((r:any)=>r.code==='CPV-009'&&splitIds.has(r.goalId)),activeViewChanged:false,futureSourceFacetTargetAndContextDecision:'HOLD; no automatic broad full child transfer or final stage/course mapping from partial evidence'})
}
write(join(here,'actual-affected-existing-source-views-and-operator-placement-holds.json'),{
 ...authority,sourceManifestBinding:bind(sourceManifestPath),productionCompositionHelperBinding:bind(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')),
 temporaryCompileKindAttachmentsOnly:true,configuredSourceViewCount:sourceViews.length,actuallyAffectedSourceViewCount:affectedViews.length,affectedViews,
 pendingConvertedClusterGoalEntryFindingCount:affectedViews.reduce((n,r)=>n+r.convertedClusterGoalEntryFindings.length,0),
 original1646SourceBindingObligationsCleared:false,fullNationalAtlasBuildOrApprovalPerformed:false,
 currentCoarseSekICanonicalWrapperPreservedAsSeparateHold:true,
})
if(existsSync(join(qa,'chemie.semantic-kinds.native-author-input.json')))rmSync(join(qa,'chemie.semantic-kinds.native-author-input.json'))
console.log(JSON.stringify({actualPurePages:[378,395,26],protectedWholeAndGoalFpExact:112,protectedContentIgnoringPaginationExact:protectedBindings.filter((r:any)=>r.pageContentIgnoringPaginationExact).length,protectedRequiresConsumers:consumers.filter((r:any)=>r.protectedStrict).map((r:any)=>r.goalId),affectedSourceViews:affectedViews.length,convertedClusterGoalEntryFindings:affectedViews.reduce((n,r)=>n+r.convertedClusterGoalEntryFindings.length,0),activeWrites:0,strictAdded:0}))
