import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../..')
const qa = join(here, 'qa-artifacts')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const write = (p: string, value: unknown) => writeFileSync(p, JSON.stringify(value, null, 2) + '\n')
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const bind = (p: string) => ({path: relative(root,p), sha256:sha(p), bytes:readFileSync(p).length})
const {fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs} = await import(pathToFileURL(join(root, 'app/scripts/goalBookModel.ts')).href)
const {normalizeCanonicalLandscape, validateCanonicalLandscape} = await import(pathToFileURL(join(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {compileCompositionView} = await import(pathToFileURL(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const {prepareLandscapeEntries} = await import(pathToFileURL(join(root, 'app/src/hooks/useLandscapes.ts')).href)
const guard = read(join(here,'current378-and-protected112-author-input-guard.actual.json'))
const binder = read(join(here,'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json'))
const basePath = join(root, guard.baselineActiveCanon.path)
const candidatePath = join(qa,'DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json')
const original = read(basePath)
const candidate = read(candidatePath)
const oldKinds = read(join(qa,'chemie.semantic-kinds.native-author-input.json'))
const kinds = structuredClone(oldKinds)
const oldDecisionById = new Map(oldKinds.decisions.map((row:any)=>[row.goalId,row]))
const existingById = new Map(original.goals.map((goal:any)=>[goal.id,goal]))
const changedIds = new Set(guard.changedExistingGoalIds)
kinds.sourceLandscapePath = relative(root,candidatePath)
// Keep the closed production ledger contract. Its kind-classification vocabulary
// is prospective in this inert package and grants no independent A/D/P/M/V gate.
kinds.decisions = candidate.goals.map((goal:any)=>{
  const old = oldDecisionById.get(goal.id) as any
  if(old && !changedIds.has(goal.id)) return old
  return {goalId:goal.id, sourceFingerprint:fingerprintSemanticKindSourceGoal(goal), semanticKind:goal.contains.length?'curricularArea':'curricularAtomic', decisionStatus:'authoritative', decisionBasis:goal.contains.length?'reviewed-current-structural-split-curricular-area':'reviewed-current-structural-split-curricular-atomic'}
})
kinds.counts = Object.fromEntries(Object.keys(oldKinds.counts).filter(key=>key!=='total').map(key=>[key,kinds.decisions.filter((row:any)=>row.semanticKind===key).length]))
kinds.counts.total = kinds.decisions.length
if(kinds.counts.curricularAtomic!==382 || kinds.counts.curricularArea!==63 || kinds.counts.total!==485) throw new Error('Unexpected denominator or kind count')
const kindPath = join(qa,'chemie.semantic-kinds.native-author-candidate.json')
write(kindPath,kinds)
const diagnostics = validateCanonicalLandscape(normalizeCanonicalLandscape(candidate))
if(diagnostics.some((row:any)=>row.severity==='error')) throw new Error(JSON.stringify(diagnostics))
const normalized = normalizeCanonicalLandscape(candidate)
const requiresVisiting = new Set<string>(), requiresVisited = new Set<string>()
const byId = new Map(candidate.goals.map((goal:any)=>[goal.id,goal]))
const visit = (id:string) => {
  if(requiresVisiting.has(id)) throw new Error('Requires cycle: '+id)
  if(requiresVisited.has(id))return
  requiresVisiting.add(id)
  const goal = byId.get(id) as any
  for(const ref of goal.requires??[]){const local=ref.includes(':')?ref.split(':').at(-1):ref;if(!byId.has(local))throw new Error('Missing requires reference '+ref);visit(local)}
  requiresVisiting.delete(id);requiresVisited.add(id)
}
for(const id of byId.keys()) visit(id as string)
const heViewPath=join(qa,'he8-seven-routines.prospective-source.view.json')
const heCompilation=compileCompositionView(read(heViewPath),normalized)
if(heCompilation.findings.some((row:any)=>row.severity==='error')) throw new Error(JSON.stringify(heCompilation.findings))
const baseline=await loadGoalBookBuildInputs(relative(root,join(qa,'baseline-native-book.config.json')),root)
const current=await loadGoalBookBuildInputs(relative(root,join(qa,'candidate-native-book.config.json')),root)
if(baseline.model.pages.length!==378 || current.model.pages.length!==382)throw new Error('Unexpected actual pure book page counts')
write(join(qa,'baseline-native-pure-book-model.json'),baseline.model)
write(join(qa,'candidate-native-pure-book-model.json'),current.model)
const oldPageById=new Map(baseline.model.pages.map((page:any)=>[page.goalId,page]))
const pageById=new Map(current.model.pages.map((page:any)=>[page.goalId,page]))
const stripPagination=(value:any):any => Array.isArray(value)?value.map(stripPagination):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([key])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint'].includes(key)).map(([key,item])=>[key,stripPagination(item)])):value
const bindings=guard.protectedStrictGoalIds.map((id:string)=>{
 const old=oldPageById.get(id) as any,now=pageById.get(id) as any
 return {goalId:id,wholeGoalObjectExact:JSON.stringify(existingById.get(id))===JSON.stringify(byId.get(id)),oldGoalFingerprint:old.goalFingerprint,currentGoalFingerprint:now.goalFingerprint,goalFingerprintExact:old.goalFingerprint===now.goalFingerprint,oldPageFingerprint:old.pageFingerprint,currentPageFingerprint:now.pageFingerprint,pageFingerprintExact:old.pageFingerprint===now.pageFingerprint,pageContentIgnoringPaginationExact:JSON.stringify(stripPagination(old))===JSON.stringify(stripPagination(now))}
})
if(bindings.length!==112 || !bindings.every((row:any)=>row.wholeGoalObjectExact&&row.goalFingerprintExact))throw new Error('Protected112 whole goal/goal fingerprint changed')
const sourceEntries=prepareLandscapeEntries([original])[0].goals
const targetEntries=prepareLandscapeEntries([candidate])[0].goals
const effectiveOld=new Map(sourceEntries.map((goal:any)=>[goal.id,goal]))
const effectiveNew=new Map(targetEntries.map((goal:any)=>[goal.id,goal]))
const splitParentIds=['7be6f951-a614-52dc-94d3-2ce0d33765ff','53fd1bfd-facb-54ae-b2dc-f667ed1414fc']
const consumers=candidate.goals.filter((goal:any)=>goal.requires.some((id:string)=>splitParentIds.includes(id))).map((goal:any)=>({
  goalId:goal.id,title:goal.title,protectedStrict:guard.protectedStrictGoalIds.includes(goal.id),directRequires:goal.requires,
  actualProductionEffectiveRequiresBefore:(effectiveOld.get(goal.id) as any).effectiveRequires,
  actualProductionEffectiveRequiresAfter:(effectiveNew.get(goal.id) as any).effectiveRequires,
  referencedSplitParents:goal.requires.filter((id:string)=>splitParentIds.includes(id)).map((id:string)=>({goalId:id,oldSemanticKind:'curricularAtomic',newSemanticKind:'curricularArea',newDirectChildAtoms:(byId.get(id) as any).contains.map((childId:string)=>({goalId:childId,title:(byId.get(childId) as any).title,tags:(byId.get(childId) as any).tags,coreField:(byId.get(childId) as any).core}))})),
  nativeBeforePage:oldPageById.get(goal.id)??null,nativeAfterPage:pageById.get(goal.id)??null,
}))
const baseFields={schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'actual unchanged production helper author preparation; no independent approval',nativeApproval:false,humanApproval:false,humanTrial:false,strictCompletionsAdded:0,activeWrites:false}
write(join(here,'actual-production-native-pure-model-and-protected112-bindings.json'),{
 ...baseFields,productionHelpers:[bind(join(root,'app/scripts/goalBookModel.ts')),bind(join(root,'app/src/utils/authoring/canonicalAuthoring.ts')),bind(join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')),bind(join(root,'app/src/hooks/useLandscapes.ts'))],
 actualPureModelPages:{baseline:baseline.model.pages.length,candidate:current.model.pages.length},semanticKindCounts:kinds.counts,
 canonicalDiagnostics:diagnostics,requiresDagPassed:true,heCandidateViewCompilationFindings:heCompilation.findings,
 candidateSourceViewMeaning:'Explicit prospective HE8 mandatory/facultative review composition, not a complete national or active learner-facing view.',
 protected112Bindings:bindings,protected112WholeGoalsAndGoalFingerprintsExact:true,
 protected112PageFingerprintExactCount:bindings.filter((row:any)=>row.pageFingerprintExact).length,
 protected112PageContentIgnoringPaginationExactCount:bindings.filter((row:any)=>row.pageContentIgnoringPaginationExact).length,
 protectedAffectedPageContentGoalIds:bindings.filter((row:any)=>!row.pageContentIgnoringPaginationExact).map((row:any)=>row.goalId),
 pureBookIsNotActualNationalSourceAtlas:true,sourceAtlasAndNativeDescriptionInputsStillPending:true,
 executedRuntimeBackendFrontierTest:false,pdfBuildPerformed:false,
})
write(join(here,'actual-split-prerequisite-consumers-and-frontier-risk.author-hold.json'),{
 ...baseFields,actualProductionEffectiveRequiresHelper:'prepareLandscapeEntries',actualNativePureBookPrerequisiteRendering:true,
 actualBackendSourceBinding:bind(join(root,'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java')),
 backendSourceLogicRead:'getRichFrontier uses structural effective prerequisite mastery for composition views. computeEffectivePrereqMastery takes the minimum of core child mastery when a prerequisite is a cluster; isCoreForPrereqs selects GK tags, not the separate core boolean.',
 backendFrontierExecutionPerformed:false,frontierRiskIsSourceBasedInference:true,
 consumers,facultyCoreFalseAloneDoesNotRemoveGKTaggedChildFromPrerequisiteCluster:true,
 newQuantitativeOrFractionPrerequisiteWouldBeUnsupportedForOldConsumers:true,
 integrationStatus:'HOLD; minimal atom-level requires candidates plus exact affected D/P/A/M/V rebinding needed before any active integration.',
 protected112WholeObjectsExactDoesNotProvePrerequisiteSemanticsUnchanged:true,
})
const nativeRoutinePages=Object.entries(binder.routineGoalIds).map(([routineLocalKey,id])=>({routineLocalKey,nativeCandidateGoalId:id,nativePureReviewPage:pageById.get(id as string),nativeQualityApproval:false}))
write(join(here,'seven-actual-native-author-goal-page-fingerprint-inputs.json'),{...baseFields,bookModelBinding:bind(join(qa,'candidate-native-pure-book-model.json')),kindLedgerBinding:bind(kindPath),nativeRoutinePages,actualProfileCount:0,actualNativeDescriptionReviewDecisionCount:0,newGoalVisualizationAssets:0})
rmSync(join(qa,'chemie.semantic-kinds.native-author-input.json'))
console.log(JSON.stringify({nativePurePages:382,protectedGoalFingerprintExact:112,protectedPageFingerprintExact:bindings.filter((row:any)=>row.pageFingerprintExact).length,protectedContentIgnoringPaginationExact:bindings.filter((row:any)=>row.pageContentIgnoringPaginationExact).length,protectedConsumerIds:consumers.filter((row:any)=>row.protectedStrict).map((row:any)=>row.goalId),kindLedger:bind(kindPath)}))
