import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,join,dirname,relative} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'../../../../../../..'),qa=join(here,'qa-artifacts')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(p:string,v:any)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n')
const bind=(p:string)=>({path:relative(root,p),sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length})
const {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs}=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href)
const {normalizeCanonicalLandscape}=await import(pathToFileURL(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(join(root,'app/src/hooks/useLandscapes.ts')).href)
const binder=read(join(here,'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json')),ids=binder.routineGoalIds
const originalCandidatePath=join(qa,'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json')
const candidate=read(originalCandidatePath),variant=structuredClone(candidate),byId=new Map(variant.goals.map((g:any)=>[g.id,g]))
const parent='53fd1bfd-facb-54ae-b2dc-f667ed1414fc',handlingParent='7be6f951-a614-52dc-94d3-2ce0d33765ff',states='326d45bf-9f77-57d5-a054-93e76b034dd5'
const proposals=[
 {goalId:'d2ccd1d5-56f7-583f-9724-e97441367f91',from:parent,to:ids.preparation,reason:'Retain the former practical preparation component as a single prerequisite for suitable indicator experiments. Do not make quantitative saturation or either fraction routine a prerequisite for distinguishing acidic/neutral/alkaline samples. The preparation routine retains its supplied safety instruction prerequisites; this is a proposed didactic route requiring independent current review.'},
 {goalId:'018bec90-445f-4a88-b8bc-228f8335dee6',from:parent,to:ids.preparation,reason:'Retain the former solution-preparation component for comparing solid/liquid/dissolved samples. The comparison does not itself require quantitative saturation or mixture-fraction routines. The proposed safety/preparation route requires exact independent rebinding before use.'},
 {goalId:'5338b54c-68bc-5892-907c-e025351ffde6',from:parent,to:states,reason:'This conceptual particle-model description uses the states-of-matter foundation already required by the old broad solutions atom, together with its unchanged explicit particle-model prerequisite. It does not require performed solution preparation, quantitative saturation, or fractions as independent mastery products. The changed prerequisite is an author proposal, not an accepted weakening or native gate verdict.'},
 {goalId:'ebaae4f5-cc13-5493-98b1-10e1abeb638f',from:handlingParent,to:ids.handling,reason:'The activity/substance-specific precaution decision directly supports risk-reduction options; selecting a local waste stream is separately assessed. Require the precaution atom rather than the full handling/disposal cluster; the actual target and its material/profile bindings require independent recheck.'},
]
for(const p of proposals){const g=byId.get(p.goalId) as any;if(!g.requires.includes(p.from))throw new Error('Missing original requires '+p.goalId);g.requires=g.requires.map((ref:string)=>ref===p.from?p.to:ref)}
const variantPath=join(qa,'DE_DEU_S_GYM_CANONICAL_CHEMIE.four-route-proposals.author-candidate.json')
write(variantPath,variant)
const kinds=read(join(qa,'chemie.semantic-kinds.native-author-candidate.json'))
kinds.sourceLandscapePath=relative(root,variantPath)
for(const p of proposals){const d=kinds.decisions.find((d:any)=>d.goalId===p.goalId);d.sourceFingerprint=fingerprintSemanticKindSourceGoal(byId.get(p.goalId) as any);d.decisionBasis='reviewed-current-semantic-recheck-curricular-atomic'}
const kindPath=join(qa,'chemie.semantic-kinds.four-route-proposals.author-candidate.json')
write(kindPath,kinds)
const config=read(join(qa,'candidate-native-book.config.json'))
config.bookId='chemie-b007-native-author-four-route-proposals';config.landscapePath=relative(root,variantPath);config.semanticKindLedgerPath=relative(root,kindPath);config.outputPath=relative(root,join(qa,'four-route-proposals-native-pure-book-model.json'))
const configPath=join(qa,'four-route-proposals-native-book.config.json');write(configPath,config)
const loaded=await loadGoalBookBuildInputs(relative(root,configPath),root)
if(loaded.model.pages.length!==382)throw new Error('Unexpected variant native count')
write(join(qa,'four-route-proposals-native-pure-book-model.json'),loaded.model)
const pageById=new Map(loaded.model.pages.map((page:any)=>[page.goalId,page]))
const baseModel=read(join(qa,'candidate-native-pure-book-model.json')),basePageById=new Map(baseModel.pages.map((page:any)=>[page.goalId,page]))
const oldModel=read(join(qa,'baseline-native-pure-book-model.json')),oldPageById=new Map(oldModel.pages.map((page:any)=>[page.goalId,page]))
const effectiveVariant=new Map(prepareLandscapeEntries([variant])[0].goals.map((goal:any)=>[goal.id,goal]))
const proposalRecords=proposals.map(p=>({goalId:p.goalId,oldBroadPrerequisite:p.from,proposedAtomPrerequisite:p.to,authorDidacticRationale:p.reason,
 oldCurrentCanonicalRequires:candidate.goals.find((g:any)=>g.id===p.goalId).requires,proposedRequires:(byId.get(p.goalId) as any).requires,
 oldCurrentNativePage:oldPageById.get(p.goalId),baseSplitNativePage:basePageById.get(p.goalId),proposedNativePage:pageById.get(p.goalId),
 actualProductionEffectiveRequiresForProposedVariant:(effectiveVariant.get(p.goalId) as any).effectiveRequires,
 noConvertedBroadClusterRemainsInDirectRequires:!(byId.get(p.goalId) as any).requires.includes(p.from),
 nativeQualityApproval:false,status:'author_proposal_needs_targeted_independent_route_and_binding_review'}))
const guard=read(join(here,'current378-and-protected112-author-input-guard.actual.json'))
const modifiedProtected=guard.protectedStrictGoalIds.filter((id:string)=>JSON.stringify(candidate.goals.find((g:any)=>g.id===id))!==JSON.stringify(byId.get(id)))
if(modifiedProtected.length!==4 || !modifiedProtected.every((id:string)=>proposals.some(p=>p.goalId===id)))throw new Error('Unexpected protected variant edit')
// Make the prospective HE review's referenced memory node visible in the same view.
// This is an executed candidate-view check, not a current national visibility verdict.
const viewPath=join(qa,'he8-seven-routines.prospective-source.view.json'),view=read(viewPath),memoryId='1e372b97-6f1c-596c-8a8b-fc03193d784a'
if(!view.rootNodes.some((node:any)=>node.id==='b007-he8-memory-companion'))view.rootNodes.push({kind:'structure',id:'b007-he8-memory-companion',label:'Bestehende Lernkarten – Kandidatenbindung',children:[{kind:'goalEntry',goalId:memoryId}]})
write(viewPath,view)
const normalized=normalizeCanonicalLandscape(candidate),compiled=compileCompositionView(view,normalized)
if(compiled.findings.some((finding:any)=>finding.severity==='error'))throw new Error(JSON.stringify(compiled.findings))
const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(candidate.goals.map((goal:any)=>[goal.id,goal])))
const memoryChecks=['label','mass_fraction','volume_fraction'].map(key=>({routineLocalKey:key,originGoalId:ids[key],referencedMemoryGoalId:memoryId,originTargetVisible:roles.targetGoalIds.has(ids[key]),memoryTargetVisible:roles.targetGoalIds.has(memoryId)}))
if(!memoryChecks.every(check=>check.originTargetVisible&&check.memoryTargetVisible))throw new Error('Candidate memory visibility failed')
const common={schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'inert author follow-through and actual native helper preparation',nativeApproval:false,humanApproval:false,humanTrial:false,activeWrites:false,strictCompletionsAdded:0}
write(join(here,'four-minimal-requires-proposals-and-exact-binding-recheck-plan.author-candidate.json'),{...common,
 baseCandidateBinding:bind(originalCandidatePath),fourRouteVariantBinding:bind(variantPath),variantKindLedgerBinding:bind(kindPath),actualVariantPureBookModelBinding:bind(join(qa,'four-route-proposals-native-pure-book-model.json')),
 proposalCount:4,changedFields:'Four requires arrays only, relative to the base split candidate; all DE/EN science texts, images and materials unchanged.',proposals:proposalRecords,
 protectedStrictWholeObjectsUnchangedInBaseCandidate:112,protectedStrictWholeObjectsUnchangedInSeparateRouteVariant:108,modifiedProtectedGoalIdsInVariant:modifiedProtected,
 sourceBasedFrontierRiskRemovedForFourDirectConsumers:true,executedBackendFrontierAcceptance:false,
 twoAdditionalPageContextOnlyGoalIds:['13d4f336-ab16-54a7-9479-c920b458f385',states],
 requiredBeforeActiveIntegration:['Independently judge four minimal route proposals with actual source/stage/current target bindings.','Recheck/rebind all four changed native goal/page/context D/P/A/M/V and M fingerprints without inventing a content review or human approval.','Review the two affected prerequisite/reverse-prerequisite page contexts, including real current source placements.','Restore valid exact bindings for all protected112 strict goals before integrating; pagination-only changes require honest bounded technical/context rebinding, not 112 repeated science reviews.','Resolve remaining source/route holds for the other non-protected broad-cluster consumers and nationwide403 source obligations.'],
 integrationsAuthorizedByThisArtifact:false})
write(join(here,'actual-prospective-he8-memory-companion-visibility-check.json'),{...common,compositionViewBinding:bind(viewPath),productionHelper:bind(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')),candidateViewTargetVisibleGoalCount:roles.targetGoalIds.size,compilerFindings:compiled.findings,memoryChecks,
 candidatePrimaryCardBodiesModified:false,candidatePrimaryCardIdsAndOriginsInExternalBinder:true,actualDeckCardsOrCardReviewLedgerWritten:false,currentNationalMemoryVisibilityApproval:false,independentNativeMReviewPending:true})
console.log(JSON.stringify({fourRouteProposalIds:modifiedProtected,variantPurePages:loaded.model.pages.length,candidateMemoryVisibilityChecksPassed:3,activeWrites:0,strictAdded:0}))
