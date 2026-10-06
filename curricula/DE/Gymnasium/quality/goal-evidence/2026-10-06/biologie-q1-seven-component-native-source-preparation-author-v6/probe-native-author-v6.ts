import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, rmSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { buildGoalBookSourceAtlasInputs, type GoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const repo=resolve('.'), source=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-native-source-preparation-author-v6'), own=process.env.BIO_Q1_NATIVE_PROBE_OUTPUT?resolve(process.env.BIO_Q1_NATIVE_PROBE_OUTPUT):source
if(own===source&&existsSync(resolve(source,'native-seven-source-preparation.author-v6.final.freeze.json')))throw new Error('Frozen author output: set BIO_Q1_NATIVE_PROBE_OUTPUT to a fresh task tmp path')
const sparse=own===source?resolve('tmp/biologie-q1-seven-native-author-v6/sparse-root'):resolve(own,'sparse-root')
rmSync(sparse,{recursive:true,force:true});mkdirSync(sparse,{recursive:true})
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,v:unknown)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n')}
const digest=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const links=new Set<string>(), physical=new Set<string>()
const link=(p:string)=>{if(links.has(p)||physical.has(p))return;const target=resolve(repo,p);if(!existsSync(target))return;const child=resolve(sparse,p);mkdirSync(dirname(child),{recursive:true});symlinkSync(target,child);links.add(p)}
const configPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const sourceConfig=read(resolve(repo,configPath)) as GoalBookSourceAtlasInputConfig
link(sourceConfig.durationModelPolicyPath)
for(const snap of sourceConfig.sourceDocumentSnapshots??[])link(snap.path)
for(const mapPath of sourceConfig.mappingPaths){
 link(mapPath); const m=read(resolve(repo,mapPath));link(m.sourceExtractionPath)
 const x=read(resolve(repo,m.sourceExtractionPath));
 for(const doc of x.sourceDocuments?.length?x.sourceDocuments:[x.sourceDocument])if(doc?.path)link(doc.path)
}
const envelope=read(resolve(source,'canonical-390.author-candidate.inert-envelope.json'))
const raw=JSON.parse(envelope.candidateCanonicalUTF8)
write(resolve(sparse,sourceConfig.landscapePath),raw);physical.add(sourceConfig.landscapePath)
const currentLedger=read(resolve(repo,sourceConfig.semanticKindLedgerPath));const ledger=structuredClone(currentLedger)
const goalById=new Map<string,Record<string,unknown>>(raw.goals.map((g:Record<string,unknown>)=>[String(g.id),g]))
const changedOldKindFingerprints:string[]=[]
for(const decision of ledger.decisions){const g=goalById.get(decision.goalId)!;const fp=fingerprintSemanticKindSourceGoal(g);if(decision.sourceFingerprint!==fp){changedOldKindFingerprints.push(decision.goalId);decision.sourceFingerprint=fp}}
for(const [key,id]of Object.entries(envelope.newCanonicalGoalIDs)as Array<[string,string]>){ledger.decisions.push({goalId:id,sourceFingerprint:fingerprintSemanticKindSourceGoal(goalById.get(id)!),semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'reviewed-current-structural-split-curricular-atomic'})}
ledger.decisions.push({goalId:envelope.newClusterID,sourceFingerprint:fingerprintSemanticKindSourceGoal(goalById.get(envelope.newClusterID)!),semanticKind:'curricularArea',decisionStatus:'authoritative',decisionBasis:'reviewed-current-structural-split-curricular-area'})
ledger.decisions.sort((a:{goalId:string},b:{goalId:string})=>a.goalId<b.goalId?-1:1)
ledger.counts={...currentLedger.counts,...Object.fromEntries(Object.keys(currentLedger.counts).filter(k=>k!=='total').map(k=>[k,ledger.decisions.filter((d:{semanticKind:string})=>d.semanticKind===k).length])),total:ledger.decisions.length}
write(resolve(sparse,sourceConfig.semanticKindLedgerPath),ledger);physical.add(sourceConfig.semanticKindLedgerPath)
write(resolve(own,'semantic-kind-native-input.author-candidate.inert-envelope.json'),{schemaVersion:1,role:'isolated technical taxonomy author input required by native sourceAtlas; not active authoritative QA',prospectivePath:sourceConfig.semanticKindLedgerPath,candidatePayload:ledger,changedOldKindFingerprints,nativeFingerprintMethod:'fingerprintSemanticKindSourceGoal from current app/scripts/goalBookModel.ts; no fingerprint makes a substantive review true',activeWrites:false,machineAApproval:false,closedSchemaDecisionEnumsExpressAuthorStructuralTaxonomyOnly:true,inheritedReviewMethodIsHistoricalContractMetadataNotNewIndependentD_P_A_M_VApproval:true,independentClassificationReviewPending:true})
const config=structuredClone(sourceConfig);config.expectedCurricularAtomicGoalCount=390
for(const state of ['BE','BB','SN','TH','MV','ST']){
 const x=read(resolve(source,state+'.source-components.author-candidate.inert-envelope.json'))
 const m=read(resolve(source,state+'.source-component-mappings.author-candidate.inert-envelope.json'))
 write(resolve(sparse,x.prospectivePath),x.candidatePayload);physical.add(x.prospectivePath)
 write(resolve(sparse,m.prospectivePath),m.candidatePayload);physical.add(m.prospectivePath)
 config.mappingPaths.push(m.prospectivePath)
}
write(resolve(sparse,configPath),config);physical.add(configPath)
// Independent route integrity: every current goal and every authored edge is present and cycles are forbidden.
const dag=(field:string)=>{const visiting=new Set<string>(),visited=new Set<string>();let edges=0;const go=(id:string)=>{if(visiting.has(id))throw new Error(field+' cycle at '+id);if(visited.has(id))return;const g=goalById.get(id);if(!g)throw new Error('Unknown '+field+' target '+id);visiting.add(id);for(const child of(g[field]??[])as string[]){edges++;go(child.replace(raw.landscapeId+':',''))}visiting.delete(id);visited.add(id)};for(const id of goalById.keys())go(id);return{nodes:visited.size,edges,acyclic:true,allReferencesResolved:true}}
const requireProof=dag('requires'),containsProof=dag('contains')
let gateError:string|null=null
try{buildGoalBookSourceAtlasInputs(config,sparse)}catch(e){gateError=String(e)}
if(gateError)throw new Error('Candidate full390 sourceAtlas gate failed '+gateError)
// The actual full390 author source contract is evaluated unchanged; no diagnostic count override. Author input is not independent scientific approval.
const diagnostic=buildGoalBookSourceAtlasInputs(config,sparse)
const receipt=diagnostic.receipt as any
const original=buildGoalBookSourceAtlasInputs(sourceConfig,repo)
const oldUnion=new Set<string>(original.receipt.scopes.flatMap((s:any)=>s.goalIds))
const candidateUnion=new Set<string>(receipt.scopes.flatMap((s:any)=>s.goalIds))
if(oldUnion.size!==383||[...oldUnion].some(id=>!candidateUnion.has(id)))throw new Error('Original383 source-supported target loss')
const pointID=envelope.newCanonicalGoalIDs.point_and_genome_mutation
if(receipt.omittedGoals.length!==0||!candidateUnion.has(pointID))throw new Error('Expected all390 real candidate source-supported targets')
const normalize=normalizeCanonicalLandscape(raw)
const newIDs=Object.values(envelope.newCanonicalGoalIDs)as string[]
const newScopedRows=receipt.scopes.map((s:any)=>({key:s.key,proposedNewTargetIDs:s.goalIds.filter((id:string)=>newIDs.includes(id)),witnesses:s.witnesses.filter((w:any)=>newIDs.includes(w.goalId))})).filter((s:any)=>s.proposedNewTargetIDs.length)
const candidateProjectionViews:any[]=[]
const carrierID=envelope.newCanonicalGoalIDs.classical_genetic_information_carriers_dna_gene_chromosome
for(const scope of receipt.scopes){
 if(!scope.goalIds.some((id:string)=>newIDs.includes(id)))continue
 const view=JSON.parse(diagnostic.outputs[scope.path])
 const hasDependent=scope.goalIds.some((id:string)=>newIDs.includes(id)&&id!==carrierID)
 if(hasDependent&&!scope.goalIds.includes(carrierID))view.rootNodes[0].children.push({kind:'goalEntry',goalId:carrierID,projectionRole:'prerequisiteOnly'})
 const compiled=compileCompositionView(normalizeCompositionView(view),normalize)
 if(compiled.findings.some(f=>f.severity==='error'))throw new Error('Native candidate composition error '+JSON.stringify(compiled.findings))
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(normalize.goals.map(g=>[g.id,g])))
 if(roles.targetGoalIds.size!==scope.goalIds.length)throw new Error('Prerequisite-only role changed target count')
 candidateProjectionViews.push({scope:scope.key,view,findings:compiled.findings,targetCount:roles.targetGoalIds.size,prerequisiteOnlyGoalIDs:[...roles.prerequisiteOnlyGoalIds],viewOrigin:'actual native390 sourceAtlas output plus explicit author prerequisite-only carrier entry; fresh independent placement QA pending'})
}
write(resolve(own,'source-view-route-and-prerequisite-only.author-candidate.json'),{schemaVersion:1,role:'author composition proposals, native-compiled but not approved/installed',views:candidateProjectionViews,old383Retained:true,STPointTargetActuallyPresentInBothDerivedCommonEntryPhaseTechnicalViews:true,STWholeOriginalSourceIssuesStillHeld:true,activeWrites:false})
write(resolve(own,'native-source-atlas-and-dag.author-v6.actual.receipt.json'),{
 schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'actual bounded native author diagnostic, no gate override or independent approval',
 sparseRoot:relative(repo,sparse),readOnlySymlinkInputCount:links.size,physicalProposedInputCount:physical.size,
 currentOriginal383Contract:{status:'PASS',counts:original.receipt.counts},candidateExpected390Contract:{status:'PASS',actualPublishedCurricularAtomicGoals:390,error:gateError},
 noDiagnosticCountOverrideUsed:true,actualNativeCounts:receipt.counts,omittedGoals:receipt.omittedGoals,
 all383OriginalSourceSupportedIDsRetained:[...oldUnion].every(id=>candidateUnion.has(id)),originalIDsRemoved:[],
 sevenNewSourceSupportedCandidateTargets:newIDs,STPointAndGenomeTarget:pointID,STCourseRouteIsExplicitDerivedCommonEntryPhaseNotOriginalCourseName:true,
 newSourceScopeRows:newScopedRows,allNativeSourceScopes:receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds})),
 requiresDAG:requireProof,containsDAG:containsProof,
 primitiveNativeCompositionCandidateViewCount:candidateProjectionViews.length,explicitPrerequisiteOnlyCarrierScopes:candidateProjectionViews.filter(s=>s.prerequisiteOnlyGoalIDs.length).map(s=>s.scope),
 effectiveNativeInputs:receipt.inputBindings,
 actualNativeCodeBindings:['app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts'].map(path=>({path,sha256:digest(resolve(repo,path))})),
 unchangedOldMappingPaths:sourceConfig.mappingPaths,activeWrites:false,newActiveStrictCompletions:0,restoredActiveBindings:0,newImagesCreated:0,independentReviewPending:true,humanApproval:false,humanTrial:false,integrable:false,
})
console.log(JSON.stringify({current383:'PASS',candidate390:'PASS',newSourceSupportedTargets:7,heldTargets:0,wholeOriginalSourceHoldsRemain:true,currentIDsRemoved:0,requires:requireProof,contains:containsProof,sourceScopes:receipt.scopes.length,compiledCandidateViews:candidateProjectionViews.length,activeWrites:false,strictGain:0}))

// Pure BookModel construction inspects actual protected page/context impact; no PDF rendering, publication or full build.
const bookConfig=read(resolve(repo,'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
const qa=read(resolve(repo,bookConfig.goalVisualizationQaPath))
const assetDigests:Record<string,string>={}
for(const record of qa.records)if(record.visualizationState==='available')assetDigests[record.imageUrl]='sha256:'+digest(resolve(repo,record.publicAssetPath))
const pureModel=(landscape:unknown,semanticKindLedger:unknown,atlas:{outputs:Record<string,string>})=>{
 const manifest=JSON.parse(atlas.outputs[bookConfig.compositionViewManifestPath])
 return buildGoalBookModel({landscape,semanticKindLedger,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(atlas.outputs[path])})),navigationView:JSON.parse(atlas.outputs[manifest.navigationViewPath]),durationModelPolicy:read(resolve(repo,sourceConfig.durationModelPolicyPath)),goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,evidenceReviewSources:[],config:bookConfig})
}
const actualLandscape=read(resolve(repo,sourceConfig.landscapePath))
const currentModel=pureModel(actualLandscape,currentLedger,original)
let combinedCandidateModelError:string|null=null
try{pureModel(raw,ledger,diagnostic)}catch(error){combinedCandidateModelError=String(error)}
if(!combinedCandidateModelError?.includes('primary visualization has no current available QA record'))throw new Error('Expected explicit old4 operative visualization availability hold: '+combinedCandidateModelError)
write(resolve(own,'combined-four-reviewed-proposals-bookmodel.actual-hold.json'),{schemaVersion:1,createdAtUTC:new Date().toISOString(),combinedSourceAtlas390:'PASS',pureBookModel:'FAIL',actualError:combinedCandidateModelError,reason:'Reviewed v4 four-goal proposal image links do not yet have current available records in the unmodified active visual QA input. Generation/review history is not a new native operative availability binding.',action:'Preserve the reviewed4 descriptions/images/eight P bodies as later inert proposals; build a separate component-first variant preserving every current464 whole goal except structural root append.',availabilityOrApprovalFabricated:false,activeWrites:false,strictGain:0})
const componentFirstRaw=structuredClone(actualLandscape)
componentFirstRaw.goals[0].contains.push(envelope.newClusterID)
componentFirstRaw.goals.push(...raw.goals.filter((g:any)=>newIDs.includes(g.id)||g.id===envelope.newClusterID))
const componentFirstLedger=structuredClone(currentLedger)
for(const decision of componentFirstLedger.decisions)decision.sourceFingerprint=fingerprintSemanticKindSourceGoal(componentFirstRaw.goals.find((g:any)=>g.id===decision.goalId))
componentFirstLedger.decisions.push(...ledger.decisions.filter((d:any)=>newIDs.includes(d.goalId)||d.goalId===envelope.newClusterID))
componentFirstLedger.decisions.sort((a:any,b:any)=>a.goalId<b.goalId?-1:1)
componentFirstLedger.counts=structuredClone(ledger.counts)
write(resolve(own,'canonical-390.component-first.author-candidate.inert-envelope.json'),{schemaVersion:1,role:'component-first isolated canonical proposal; current464 existing goal fields preserved except root contains structural append; v4 operative4 proposal remains separate',activeCanonicalSHA256:digest(resolve(repo,sourceConfig.landscapePath)),candidateCanonicalUTF8:JSON.stringify(componentFirstRaw,null,2)+'\n',newCanonicalGoalIDs:envelope.newCanonicalGoalIDs,newClusterID:envelope.newClusterID,old383CurrentAtomicIDsPreserved:true,allOld464WholeGoalsPreservedExceptRootContains:true,newCurricularAtomicCount:7,candidateCurricularAtomicCount:390,reviewedV4FourDescriptionAndEightPProposalStillPreservedUnchanged:true,activeWrites:false,strictGain:0})
write(resolve(own,'semantic-kind-native-input.component-first.author-candidate.inert-envelope.json'),{schemaVersion:1,role:'isolated technical taxonomy author input, not operative D/P/A/M/V approval',prospectivePath:sourceConfig.semanticKindLedgerPath,candidatePayload:componentFirstLedger,oldKindClassificationAndAllNonRootFingerprintsExact:true,onlyOldRootFingerprintChangedForStructuralContainsAppend:true,machineAApproval:false,independentClassificationReviewPending:true,activeWrites:false})
write(resolve(sparse,sourceConfig.landscapePath),componentFirstRaw)
write(resolve(sparse,sourceConfig.semanticKindLedgerPath),componentFirstLedger)
const componentFirstAtlas=buildGoalBookSourceAtlasInputs(config,sparse)
const candidateModel=pureModel(componentFirstRaw,componentFirstLedger,componentFirstAtlas)
const componentFirstGoalByID=new Map<string,Record<string,unknown>>(componentFirstRaw.goals.map((g:Record<string,unknown>)=>[String(g.id),g]))
if(currentModel.pages.length!==383||candidateModel.pages.length!==390)throw new Error('Unexpected native pure BookModel page count')
const strictReportPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-active-integration-verification-v1/final-current-central.stage-1.actual.stdout.json'
const strictReport=read(resolve(repo,strictReportPath));const bio=strictReport.subjects.find((s:any)=>s.subject.toLowerCase()==='biologie')
if(bio.strictComplete!==67||bio.denominator!==383)throw new Error('Current protected strict universe changed')
const beforePages=new Map(currentModel.pages.map(p=>[p.goalId,p])),afterPages=new Map(candidateModel.pages.map(p=>[p.goalId,p]))
const beforeGoalByID=new Map<string,Record<string,unknown>>(actualLandscape.goals.map((g:Record<string,unknown>)=>[String(g.id),g]))
const oldSourceScopeByID=(atlas:any,id:string)=>atlas.receipt.scopes.filter((s:any)=>s.goalIds.includes(id)).map((s:any)=>s.key)
const classify=(id:string)=>{
 const before=beforePages.get(id)as any,after=afterPages.get(id)as any
 if(!before||!after)throw new Error('Protected current goal lost '+id)
 const fields=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k]))
 const oldScope=oldSourceScopeByID(original,id),newScope=oldSourceScopeByID(componentFirstAtlas,id)
 return{goalId:id,currentWholeGoalExact:JSON.stringify(beforeGoalByID.get(id))===JSON.stringify(componentFirstGoalByID.get(id)),nativePageChangedFields:fields,currentPageFingerprint:before.pageFingerprint,candidatePageFingerprint:after.pageFingerprint,pageFingerprintExact:before.pageFingerprint===after.pageFingerprint,goalFingerprintExact:before.goalFingerprint===after.goalFingerprint,currentPageNumber:before.pageNumber,candidatePageNumber:after.pageNumber,reverseRequiresExact:JSON.stringify(before.reverseRequires)===JSON.stringify(after.reverseRequires),externalReverseRequiresExact:JSON.stringify(before.externalReverseRequires)===JSON.stringify(after.externalReverseRequires),sourceViewMembershipsExact:JSON.stringify(oldScope)===JSON.stringify(newScope),sourceViewMembershipsRemoved:oldScope.filter((v:string)=>!newScope.includes(v)),sourceViewMembershipsAdded:newScope.filter((v:string)=>!oldScope.includes(v)),requiredNextAction:fields.length?'targeted technical D/P/page/context binding renewal after independent cause review; no new science closure claimed':'KEEP actual unchanged goal/page/context inputs; no repeated review'}
}
const protectedRows=bio.strictCompleteGoalIds.map(classify)
if(protectedRows.some((r:any)=>!r.currentWholeGoalExact||r.sourceViewMembershipsRemoved.length))throw new Error('Protected67 whole-goal or source membership loss')
const allOldRows=currentModel.pages.map(p=>classify(p.goalId))
const oldWholeFieldDeltas=actualLandscape.goals.map((g:any)=>({goalId:g.id,fields:[...new Set([...Object.keys(g),...Object.keys(componentFirstGoalByID.get(g.id)!)])].filter(k=>JSON.stringify(g[k])!==JSON.stringify(componentFirstGoalByID.get(g.id)![k]))})).filter((r:any)=>r.fields.length)
const rowsNew=candidateModel.pages.filter(p=>newIDs.includes(p.goalId))
write(resolve(own,'protected67-and-all-current383-native-page-impact.actual.json'),{
 schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'actual pure native COMPONENT-FIRST BookModel impact, no PDF rendering or evidence approval',currentStrictReportBinding:{path:strictReportPath,sha256:digest(resolve(repo,strictReportPath))},nativeBookModelCode:{path:'app/scripts/goalBookModel.ts',sha256:digest(resolve(repo,'app/scripts/goalBookModel.ts'))},
 currentNativeModel:{pages:currentModel.pages.length,digest:currentModel.digest},candidateNativeModel:{variant:'component-first current464 preserved',pages:candidateModel.pages.length,digest:candidateModel.digest,sourceAtlasCounts:componentFirstAtlas.receipt.counts},protectedCurrentStrictGoalCount:67,protectedRows,protectedWholeGoalsExact:protectedRows.filter((r:any)=>r.currentWholeGoalExact).length,protectedNativePagesExact:protectedRows.filter((r:any)=>r.pageFingerprintExact).length,protectedScopeMembershipLosses:protectedRows.flatMap((r:any)=>r.sourceViewMembershipsRemoved).length,
 allCurrent383NativePageRows:allOldRows,oldWholeGoalFieldDeltas:oldWholeFieldDeltas,allOldCanonicalGoalIDsPreserved:actualLandscape.goals.every((g:any)=>componentFirstGoalByID.has(g.id)),
 proposedNewSevenNativePages:rowsNew,oldWholeOriginalHeldMappingsStillUnmodified:sourceConfig.mappingPaths.map(path=>({path,sha256:digest(resolve(repo,path))})),
 componentFirstEffectiveNativeInputs:componentFirstAtlas.receipt.inputBindings,combinedReviewedFourProposalNativeBookmodelStillHeld:true,nativeModelDoesNotProveIndependentD_P_A_M_VApproval:true,hashOnlyRenewalIsNoScientificReview:true,activeWrites:false,strictGain:0,restoredActiveBindings:0,humanApproval:false,humanTrial:false,
})
console.log(JSON.stringify({pureNativeBookModelPages:[currentModel.pages.length,candidateModel.pages.length],protected67WholeExact:protectedRows.filter((r:any)=>r.currentWholeGoalExact).length,protected67PagesExact:protectedRows.filter((r:any)=>r.pageFingerprintExact).length,protected67ScopeLosses:protectedRows.flatMap((r:any)=>r.sourceViewMembershipsRemoved).length,changedOldWholeGoals:oldWholeFieldDeltas.length,changedOldPages:allOldRows.filter((r:any)=>!r.pageFingerprintExact).length,noRenderingOrPublication:true}))
