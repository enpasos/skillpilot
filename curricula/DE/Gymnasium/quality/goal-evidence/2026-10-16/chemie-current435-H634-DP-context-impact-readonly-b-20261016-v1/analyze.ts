// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repo = process.cwd()
const out = dirname(fileURLToPath(import.meta.url))
const h = resolve(repo, 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
const prior = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-five-supported-description-normal-H-and-native5-technical-20261016-v1'
const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (value: string | Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const read = (root: string, path: string) => json(resolve(root, path))
const write = (name: string, value: unknown) => writeFileSync(resolve(out, name), `${JSON.stringify(value, null, 2)}\n`)

async function main() {
const book = await import(pathToFileURL(resolve(repo, 'app/scripts/goalBookModel.ts')).href)
const profile = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
const evidence = await import(pathToFileURL(resolve(repo, 'app/scripts/goalEvidenceProfileModel.ts')).href)
const description = await import(pathToFileURL(resolve(repo, 'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const resolution = await import(pathToFileURL(resolve(repo, 'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const subset = await import(pathToFileURL(resolve(repo, 'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const config = read(repo, `${prior}/base-full435-P5-current-normal-H.stock.config.json`)
const oldPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-native17-five-local-description-findings-targeted-author-successor-20261016-v1/CANONICAL.whole629.five-targeted-description-candidates.inactive.json'
const before = read(repo, oldPath)
const after = read(h, config.landscapePath)
if (digest(readFileSync(resolve(h, config.landscapePath))) !== 'sha256:d17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f') throw new Error('H pin changed')
const report = read(repo, `${prior}/CENTRAL.actual-current435.all-five-gates-paired-final.json`)
const ids: string[] = report.subjects[0].currentGoalIds
const oldGoals = new Map<string, any>(before.goals.map((goal: any) => [goal.id, goal]))
const newGoals = new Map<string, any>(after.goals.map((goal: any) => [goal.id, goal]))
const oldSemantic = read(repo, `${prior}/SEMANTIC629.five-supported-current-description-bindings.normal-path.json`)
const newSemantic = read(h, config.semanticKindLedgerPath)
const oldQa = read(repo, `${prior}/QA458.five-supported-current-description-contexts.other453-whole-records-exact.json`)
const newQa = read(h, config.goalVisualizationQaPath)
const assets: Record<string, string> = {}
for (const row of newQa.records) if (row.visualizationState === 'available') assets[row.imageUrl] = digest(readFileSync(resolve(h, row.publicAssetPath)))
const common = {
  compositionView: read(h, config.compositionViewPath),
  goalVisualizationAssetDigests: assets,
  evidenceReviewSources: config.evidenceReviewPaths.map((path: string) => ({path, text: readFileSync(resolve(h, path), 'utf8')})),
  config,
}
const beforeModel = book.buildGoalBookModel({...common, landscape: before, semanticKindLedger: oldSemantic, goalVisualizationQa: oldQa})
const expectedBeforeDigest = read(repo, `${prior}/native-five/batch-manifest.json`).source.baseBookDigest
if (beforeModel.digest !== expectedBeforeDigest) throw new Error(`Exact baseline model reproduction failed: ${beforeModel.digest} != ${expectedBeforeDigest}`)
let originalAfterError = ''
try { book.buildGoalBookModel({...common, landscape: after, semanticKindLedger: newSemantic, goalVisualizationQa: newQa}) }
catch (error) { originalAfterError = String(error) }
if (!originalAfterError.includes('CPV-005') || !originalAfterError.includes('CPV-006')) throw new Error(`Expected documented duplicate placement fault absent: ${originalAfterError}`)
write('BLOCKED.original-full435-view.actual-model-error.json', {configPath:`${prior}/base-full435-P5-current-normal-H.stock.config.json`,compositionViewPath:config.compositionViewPath,HCanonicalSha256:digest(readFileSync(resolve(h,config.landscapePath))),error:originalAfterError,normalOrHMutation:false})
const deduplicatedView = structuredClone(common.compositionView)
const redundant = new Set(['4a7dee38-1056-5e27-acec-e6a12f58109f','5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d'])
const removed: any[] = []
const prune = (nodes: any[], path: (string|number)[]): any[] => nodes.filter((node,index)=>{
  if (node.kind==='goalEntry' && redundant.has(node.goalId)) {removed.push({path:[...path,index],wholeNode:node});return false}
  if (node.children) {
    const wholeBeforePrune=structuredClone(node)
    node.children=prune(node.children,[...path,index,'children'])
    if (node.kind==='structure' && node.children.length===0) {removed.push({path:[...path,index],wholeNode:wholeBeforePrune,reason:'Empty wrapper after its two redundant direct entries are removed; CPV-007 otherwise'});return false}
  }
  return true
})
deduplicatedView.rootNodes=prune(deduplicatedView.rootNodes,['rootNodes'])
if (removed.filter(row=>row.wholeNode.kind==='goalEntry').length!==2 || removed.filter(row=>row.wholeNode.kind==='structure').length!==1) throw new Error(`Expected two direct entries and their empty wrapper, got ${removed.length} removals`)
const afterViewName='VIEW.full435-H634-two-redundant-direct-entries-removed.DIAGNOSTIC-ONLY.json'
writeFileSync(resolve(out,'VIEW.full435-before.exact.json'),readFileSync(resolve(h,config.compositionViewPath)))
write(afterViewName,deduplicatedView)
const afterConfig={...config,compositionViewPath:relative(repo,resolve(out,afterViewName)),outputPath:relative(repo,resolve(out,'NOT-WRITTEN.after-book-model.json'))}
write('CONFIG.full435-H634-context-diagnostic.no-render-no-write.json',afterConfig)
write('CAS.full435-technical-view-only.two-redundant-direct-entries.json',{
  role:'Technical input successor only; preserve the existing historical view and all31 learner views',
  existingFull435ConfigPath:`${prior}/base-full435-P5-current-normal-H.stock.config.json`,
  existingTechnicalViewPath:config.compositionViewPath,
  before:{snapshot:relative(repo,resolve(out,'VIEW.full435-before.exact.json')),sha256:digest(readFileSync(resolve(out,'VIEW.full435-before.exact.json')))},
  after:{snapshot:relative(repo,resolve(out,afterViewName)),sha256:digest(readFileSync(resolve(out,afterViewName)))},
  proposedSuccessorConfigPath:relative(repo,resolve(out,'CONFIG.full435-H634-context-diagnostic.no-render-no-write.json')),
  removedNodes:removed,otherViewFieldsPreserved:true,learnerViewMutations:0,HOrRMutation:false,scienceVote:false,
})
const afterModel = book.buildGoalBookModel({...common,compositionView:deduplicatedView,config:afterConfig,landscape: after,semanticKindLedger:newSemantic,goalVisualizationQa:newQa})
const oldPages = new Map<string, any>(beforeModel.pages.map((page: any) => [page.goalId, page]))
const newPages = new Map<string, any>(afterModel.pages.map((page: any) => [page.goalId, page]))
const stable = book.stableGoalBookJson
const changedFields = (a: any, b: any) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(key => stable(a[key] ?? null) !== stable(b[key] ?? null))
const fieldsWithoutHashes = (a: any, b: any) => changedFields(a,b).filter(key => !['pageFingerprint','goalFingerprint'].includes(key))
const rows = ids.map(id => {
  const a = oldGoals.get(id), b = newGoals.get(id), pa = oldPages.get(id), pb = newPages.get(id)
  const goalSame = stable(a) === stable(b)
  const oldGF = evidence.fingerprintGoalForEvidence(a, 'goal-evidence-v1', 'curricularAtomic')
  const newGF = evidence.fingerprintGoalForEvidence(b, 'goal-evidence-v1', 'curricularAtomic')
  const oldPI = profile.fingerprintPositiveGoalEvidenceReviewInput(a, 'unchanged-criteria-identity-for-delta-only', assets, 'curricularAtomic')
  const newPI = profile.fingerprintPositiveGoalEvidenceReviewInput(b, 'unchanged-criteria-identity-for-delta-only', assets, 'curricularAtomic')
  return {
    goalId:id,title:a.title,wholeGoalExact:goalSame,goalFingerprintBefore:oldGF,goalFingerprintAfter:newGF,
    canonicalDescriptionContextExact: stable(description.buildGoalDescriptionCanonicalContext(a)) === stable(description.buildGoalDescriptionCanonicalContext(b)),
    positiveInputDeltaExact:oldPI===newPI,
    basePageFingerprintBefore:pa.pageFingerprint,basePageFingerprintAfter:pb.pageFingerprint,
    basePageChanged:pa.pageFingerprint!==pb.pageFingerprint,changedPageFields:fieldsWithoutHashes(pa,pb),
    fieldChanges:Object.fromEntries(fieldsWithoutHashes(pa,pb).map(key=>[key,{before:pa[key],after:pb[key]}])),
  }
})
const selectedConfig = read(repo, `${prior}/central.current435.all435-paired-final-inputs.inactive.config.json`).subjects[0]
const idSet = new Set(ids)
const excludedD = new Set([
  ...selectedConfig.resolutionSupersessions.map((row:any)=>`${row.supersededIndexPath}\0${row.goalId}`),
  ...selectedConfig.resolutionWithdrawals.map((row:any)=>`${row.indexPath}\0${row.goalId}`),
])
const ownedD = new Map<string,any>()
const groupCache = new Map<string,any>()
for (const indexPath of selectedConfig.resolutionIndexPaths) {
  const index = read(repo,indexPath)
  const groups = new Map(index.groups.map((group:any)=>[group.groupId,group]))
  for (const entry of index.resolutions) {
    if (!idSet.has(entry.goalId) || excludedD.has(`${indexPath}\0${entry.goalId}`)) continue
    if (ownedD.has(entry.goalId)) throw new Error(`Duplicate current D owner ${entry.goalId}`)
    const group:any=groups.get(entry.groupId)
    const groupDirectory=resolve(repo,dirname(indexPath),group.artifactDirectory??group.groupId)
    if (!groupCache.has(groupDirectory)) {
      const inputPath=resolve(groupDirectory,'round-a/description-review-input.json')
      const input=json(inputPath)
      const originalPageOrder=[...input.goals].sort((a:any,b:any)=>a.reviewContext.page.pageNumber-b.reviewContext.page.pageNumber).map((goal:any)=>goal.goalId).filter((id:string)=>idSet.has(id))
      // Compare one fixed prerequisite-safe ordering on both current models.
      // Historical D packages may originate from a different book/context.
      const currentGroupIds=[...originalPageOrder].sort((a:string,b:string)=>oldPages.get(a).pageNumber-oldPages.get(b).pageNumber)
      const oldSubset=subset.buildGoalDescriptionRolloutSubsetModel({baseModel:beforeModel,goalIds:currentGroupIds,bookId:'technical-before-after-scope-only',title:'Technical before/after scope only'})
      const newSubset=subset.buildGoalDescriptionRolloutSubsetModel({baseModel:afterModel,goalIds:currentGroupIds,bookId:'technical-before-after-scope-only',title:'Technical before/after scope only'})
      groupCache.set(groupDirectory,{input,inputPath,originalPageOrder,comparisonPageOrder:currentGroupIds,oldPages:new Map(oldSubset.pages.map((page:any)=>[page.goalId,page])),newPages:new Map(newSubset.pages.map((page:any)=>[page.goalId,page]))})
    }
    const cache=groupCache.get(groupDirectory)
    const original=cache.input.goals.find((goal:any)=>goal.goalId===entry.goalId)
    const oldPage=cache.oldPages.get(entry.goalId),newPage=cache.newPages.get(entry.goalId)
    const resolutionPath=resolve(repo,dirname(indexPath),entry.resolutionPath)
    const bound=json(resolutionPath)
    const fieldDelta=fieldsWithoutHashes(oldPage,newPage)
    ownedD.set(entry.goalId,{
      goalId:entry.goalId,title:newGoals.get(entry.goalId).title,indexPath,resolutionPath:relative(repo,resolutionPath),
      originalInputPath:relative(repo,cache.inputPath),originalInputSha256:digest(readFileSync(cache.inputPath)),
      originalPageOrder:cache.originalPageOrder,comparisonPageOrder:cache.comparisonPageOrder,
      originalPageFingerprint:original.pageFingerprint,
      originalPageInternalFingerprintIntact:resolution.fingerprintGoalDescriptionReviewPage(original.reviewContext.page)===original.pageFingerprint,
      originalGoalReviewContextFingerprintIntact:resolution.fingerprintGoalDescriptionReviewContext(original)===bound.goal.goalReviewContextFingerprint,
      originalGoalFingerprintStillMatchesH:original.goalFingerprint===evidence.fingerprintGoalForEvidence(newGoals.get(entry.goalId),'goal-evidence-v1','curricularAtomic'),
      originalBoundPageEqualsReconstructedCurrent629Subset:stable(original.reviewContext.page)===stable(oldPage),
      originalBoundPageEqualsReconstructedCurrent634Subset:stable(original.reviewContext.page)===stable(newPage),
      originalVsReconstructed629DifferentFields:fieldsWithoutHashes(original.reviewContext.page,oldPage),
      integrationDeltaChangesCurrentSubsetPage:oldPage.pageFingerprint!==newPage.pageFingerprint,
      recomputedSubsetPageFingerprintBefore:oldPage.pageFingerprint,recomputedSubsetPageFingerprintAfter:newPage.pageFingerprint,
      integrationDeltaChangedFields:fieldDelta,
      integrationDeltaFieldChanges:Object.fromEntries(fieldDelta.map(key=>[key,{before:oldPage[key],after:newPage[key]}])),
      current634SubsetPageForTargetedContextWitness:newPage,
      action:fieldDelta.length?'retain_scientific_judgment_obtain_targeted_current_context_witness':'retain_existing_scientific_judgment_and_no_new_integration_context_delta',
    })
  }
}
if (ownedD.size!==435) throw new Error(`Expected435 D owners, got${ownedD.size}`)
const pRows:any[]=[]
const pOwners=new Set<string>()
for (const configPath of selectedConfig.positiveEvidenceConfigPaths) {
  const pc=read(repo,configPath)
  const criteria=digest(readFileSync(resolve(h,pc.reviewCriteriaPath)))
  const records=readFileSync(resolve(h,pc.reviewPath),'utf8').split(/\r?\n/u).filter(Boolean).map(line=>JSON.parse(line))
  for (const id of pc.scope.goalIds.filter((id:string)=>idSet.has(id))) {
    if (pOwners.has(id)) throw new Error(`Duplicate current P owner ${id}`)
    pOwners.add(id)
    const record=records.find((row:any)=>row.goalId===id)
    const resources:Record<string,string>={}
    if (pc.reviewedResourceTypes.includes('goal-visualization')) for (const link of (newGoals.get(id).resourceLinks??[])) {
      if (link.type==='goal-visualization') resources[link.url]=digest(readFileSync(resolve(h,`app/public${link.url}`)))
    }
    const a=profile.fingerprintPositiveGoalEvidenceReviewInput(oldGoals.get(id),criteria,resources,'curricularAtomic')
    const b=profile.fingerprintPositiveGoalEvidenceReviewInput(newGoals.get(id),criteria,resources,'curricularAtomic')
    pRows.push({goalId:id,configPath,reviewPath:pc.reviewPath,reviewId:record.reviewId,reviewCriteriaFingerprint:criteria,recordGoalFingerprint:record.goalFingerprint,currentGoalFingerprint:evidence.fingerprintGoalForEvidence(newGoals.get(id),'goal-evidence-v1','curricularAtomic'),recordReviewInputFingerprint:record.reviewInputFingerprint,recomputedBeforeFingerprint:a,recomputedAfterFingerprint:b,beforeBindingMatchesRecord:record.reviewInputFingerprint===a,afterBindingMatchesRecord:record.reviewInputFingerprint===b,inputExact:a===b})
  }
}
if (pOwners.size!==435) throw new Error(`Expected435 P owners, got${pOwners.size}`)
const applicability = await import(pathToFileURL(resolve(repo,'app/scripts/applicabilityCompiler.ts')).href)
const mappingFiles=applicability.getAllJsonFiles(resolve(h,'curricula/DE')).filter((path:string)=>path.replaceAll('\\','/').includes('/mapping/')).filter((path:string)=>json(path).targetLandscapeId===after.landscapeId)
if (mappingFiles.length!==82) throw new Error(`Expected complete82 Chemie mappings in H, got${mappingFiles.length}`)
write('MAPPING82.actual-existing-compiler-discovery.json',{function:'app/scripts/applicabilityCompiler.ts:getAllJsonFiles + exact production mapping/target filter',count:mappingFiles.length,files:mappingFiles.map((path:string)=>({path:relative(h,path),sha256:digest(readFileSync(path))}))})
const dRows=ids.map(id=>ownedD.get(id))
write('D435.selected-original-bindings-and-current-subset-context-deltas.json',dRows)
write('P435.selected-original-record-exact-fingerprints.json',pRows)
write('ROWS435.actual-model-page-and-goal-deltas.json', rows)
write('SUMMARY.initial-exact-model-comparison.json', {
  originalReportSha256:digest(readFileSync(resolve(repo, prior, 'CENTRAL.actual-current435.all-five-gates-paired-final.json'))),
  beforeCanonicalPath:oldPath,beforeCanonicalSha256:digest(readFileSync(resolve(repo,oldPath))),
  afterCanonicalSha256:digest(readFileSync(resolve(h,config.landscapePath))),
  expectedBeforeBaseBookDigest:expectedBeforeDigest,reproducedBeforeBaseBookDigest:beforeModel.digest,afterBaseBookDigest:afterModel.digest,
  ordinaryCount:ids.length,exactWholeGoals:rows.filter(row=>row.wholeGoalExact).length,
  exactGoalFingerprints:rows.filter(row=>row.goalFingerprintBefore===row.goalFingerprintAfter).length,
  exactCanonicalDescriptionContexts:rows.filter(row=>row.canonicalDescriptionContextExact).length,
  exactPositiveInputDeltas:rows.filter(row=>row.positiveInputDeltaExact).length,
  changedBasePages:rows.filter(row=>row.basePageChanged).length,
  unchangedBasePages:rows.filter(row=>!row.basePageChanged).length,
  changedPageFields:[...new Set(rows.flatMap(row=>row.changedPageFields))],
  actualDSelectedOwners:dRows.length,DGroupsCompared:groupCache.size,
  originalDGoalFingerprintsStillExact:dRows.filter(row=>row.originalGoalFingerprintStillMatchesH).length,
  originalDPageInternalBindingsIntact:dRows.filter(row=>row.originalPageInternalFingerprintIntact).length,
  originalDGoalContextBindingsIntact:dRows.filter(row=>row.originalGoalReviewContextFingerprintIntact).length,
  changedCurrentDSubsetContextPages:dRows.filter(row=>row.integrationDeltaChangesCurrentSubsetPage).length,
  unchangedCurrentDSubsetContextPages:dRows.filter(row=>!row.integrationDeltaChangesCurrentSubsetPage).length,
  existingBoundDPagesExactlyReproducedFromCurrent629Base:dRows.filter(row=>row.originalBoundPageEqualsReconstructedCurrent629Subset).length,
  actualPSelectedOwners:pRows.length,actualPBindingsExactBeforeAndAfter:pRows.filter(row=>row.beforeBindingMatchesRecord&&row.afterBindingMatchesRecord).length,
  actualMappingDiscoveryCount:mappingFiles.length,
  limits:['Only real in-memory model construction, no renderer/build/publication or existing evidence write.','The full435 paired629 base digest is reproduced exactly. All82 selected D groups are separately compared with a fixed prerequisite-safe ordering on both models. Historical D pages use heterogeneous older book contexts; their pre-existing differences are recorded separately, not attributed to H634.','Actual P record bindings are independently recalculated with each selected configuration and real criteria/resource hashes. The ROWS435 positiveInputDeltaExact sentinel is only a supplementary equality check, not a record binding.','Current subset page snapshots are technical context candidates, not new D votes or human acceptance.'],
})
console.log(JSON.stringify({baselineReproduced:beforeModel.digest,ordinaryCount:ids.length,wholeGoalsExact:rows.filter(row=>row.wholeGoalExact).length,PBindingsExact:pRows.filter(row=>row.beforeBindingMatchesRecord&&row.afterBindingMatchesRecord).length,basePagesChanged:rows.filter(row=>row.basePageChanged).length,basePagesUnchanged:rows.filter(row=>!row.basePageChanged).length,currentDSubsetContextsChanged:dRows.filter(row=>row.integrationDeltaChangesCurrentSubsetPage).length,currentDSubsetContextsUnchanged:dRows.filter(row=>!row.integrationDeltaChangesCurrentSubsetPage).length,originalDPagesMatchReconstructedBefore:dRows.filter(row=>row.originalBoundPageEqualsReconstructedCurrent629Subset).length,mappingCount:mappingFiles.length,changedFields:[...new Set(rows.flatMap(row=>row.changedPageFields))]}))
}
main().catch(error=>{console.error(error);process.exitCode=1})
