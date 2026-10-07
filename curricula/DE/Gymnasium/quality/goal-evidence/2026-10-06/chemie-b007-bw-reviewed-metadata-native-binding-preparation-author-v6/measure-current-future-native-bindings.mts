import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const modelHelpers = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const atlasHelpers = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const sourceHelpers = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookOriginalSources.ts')).href)
const contextHelpers = await import(pathToFileURL(resolve(root, 'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const resolutionHelpers = await import(pathToFileURL(resolve(root, 'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const evidenceHelpers = await import(pathToFileURL(resolve(root, 'app/scripts/goalEvidenceProfileModel.ts')).href)
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))
const hash = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const same = (a: any, b: any) => modelHelpers.stableGoalBookJson(a) === modelHelpers.stableGoalBookJson(b)
const save = (path: string, value: any) => { mkdirSync(dirname(path), {recursive:true}); writeFileSync(path, JSON.stringify(value, null, 2) + '\n') }
const canonPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const fullPath = 'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json'
const publicPath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'
const atlasPath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const original = read(resolve(own, 'current479-127-and-exact-selected-metadata-delta.raw-author.json'))
const protectedIds = new Set<string>(original.currentStrictIDs)
const laneRoots = ['baseline-current', 'future-metadata-only'].map(name => ({name, root:resolve(own,name,'checkout')}))

// Native semantic-kind source contract includes /extendedData. Preserve every
// existing classification/status/basis; only five exact metadata binds change.
const baselineCanonical = read(resolve(laneRoots[0].root, canonPath))
const futureCanonical = read(resolve(laneRoots[1].root, canonPath))
const baselineGoals = new Map<string, any>(baselineCanonical.goals.map((g: any) => [g.id, g]))
const futureGoals = new Map<string, any>(futureCanonical.goals.map((g: any) => [g.id, g]))
const baselineLedger = read(resolve(laneRoots[0].root, ledgerPath))
const futureLedger = structuredClone(baselineLedger)
const ledgerDeltas: any[] = []
for (const row of futureLedger.decisions) {
  const before = structuredClone(row)
  assert.equal(row.sourceFingerprint, modelHelpers.fingerprintSemanticKindSourceGoal(baselineGoals.get(row.goalId)))
  const next = modelHelpers.fingerprintSemanticKindSourceGoal(futureGoals.get(row.goalId))
  if (next !== row.sourceFingerprint) {
    row.sourceFingerprint = next
    ledgerDeltas.push({goalId:row.goalId, beforeWholeDecision:before, afterWholeDecision:structuredClone(row), exactChangedField:'sourceFingerprint', sourceChange:'only provenance.sourceRef S15 to S16', scienceOrClassificationReapproval:false})
  }
}
assert.equal(ledgerDeltas.length, 5)
assert.deepEqual(ledgerDeltas.map(r=>r.goalId).sort(), [...original.currentProvenanceLocatorGoalIds].sort())
save(resolve(laneRoots[1].root, ledgerPath), futureLedger)
save(resolve(own, 'five-native-semantic-kind-source-fingerprint-only-candidates.actual.json'), {role:'Technical metadata source rebinding candidate, not new scientific or classification review', actualNativeContract:'semantic-kind-source-fingerprint-v1', rows:ledgerDeltas, unchangedClassificationAndStatusForAll479:true, humanApproval:false, activeWrites:0})

const results: any[] = []
for (const lane of laneRoots) {
  const config = atlasHelpers.readGoalBookSourceAtlasInputConfig(atlasPath, lane.root)
  const atlas = atlasHelpers.buildGoalBookSourceAtlasInputs(config, lane.root)
  const originalGeneratedInputMatches: any[] = []
  for (const [path, bytes] of Object.entries(atlas.outputs) as [string, string][]) {
    const output = resolve(lane.root, path)
    assert.ok(output.startsWith(lane.root + '/'))
    originalGeneratedInputMatches.push({path, previousCopiedInputExists:existsSync(output), previousCopiedInputEqualsNewNativeBytes:existsSync(output) ? readFileSync(output,'utf8') === bytes : null})
    mkdirSync(dirname(output), {recursive:true})
    writeFileSync(output, bytes)
  }
  // All generated inputs are written ONLY inside these owned isolated roots.
  const checked = atlasHelpers.checkGoalBookSourceAtlasInputs(atlasPath, lane.root)
  assert.ok(same(atlas.receipt, checked.receipt))
  save(resolve(own,lane.name,'native-artifacts/source-atlas.receipt.json'), atlas.receipt)
  const full = await modelHelpers.loadGoalBookBuildInputs(fullPath, lane.root)
  const national = await modelHelpers.loadGoalBookBuildInputs(publicPath, lane.root)
  assert.equal(full.model.pages.length, 378)
  assert.equal(national.model.pages.length, 359)
  const originals = sourceHelpers.buildGoalBookOriginalSources(national.model, lane.root, config.mappingPaths)
  save(resolve(own,lane.name,'native-artifacts/current378.full.book-model.json'), full.model)
  save(resolve(own,lane.name,'native-artifacts/national359.book-model.json'), national.model)
  save(resolve(own,lane.name,'native-artifacts/national359.original-sources.json'), originals)
  save(resolve(own,lane.name,'native-artifacts/generated-input-existing-byte-equality.json'), originalGeneratedInputMatches)
  results.push({lane, atlas, full:full.model, national:national.model, originals})
  console.log(`${lane.name}: native pure source derivation/check PASS; full378/national359 models and actual original-source attribution built in inert root`)
}

const [before, after] = results
assert.deepEqual(before.atlas.receipt.counts, after.atlas.receipt.counts)
assert.deepEqual(before.full.pages.map((p: any)=>p.goalId), after.full.pages.map((p: any)=>p.goalId))
assert.deepEqual(before.national.pages.map((p: any)=>p.goalId), after.national.pages.map((p: any)=>p.goalId))
assert.ok(same(before.atlas.receipt.scopes, after.atlas.receipt.scopes))
const outputsChanged = Object.keys(before.atlas.outputs).filter(path=>before.atlas.outputs[path] !== after.atlas.outputs[path])
const beforeFull = new Map<string, any>(before.full.pages.map((p: any)=>[p.goalId,p]))
const afterFull = new Map<string, any>(after.full.pages.map((p: any)=>[p.goalId,p]))
const beforeNational = new Map<string, any>(before.national.pages.map((p: any)=>[p.goalId,p]))
const afterNational = new Map<string, any>(after.national.pages.map((p: any)=>[p.goalId,p]))

const resolvedSourceForGoal = (index: any, goalId: string) => {
  const evidenceById = new Map(index.evidence.map((r: any)=>[r.id,r]))
  const documentsById = new Map(index.documents.map((r: any)=>[r.id,r]))
  return (index.goals[goalId] ?? []).map((scope: any)=>({
    ...scope,
    evidenceIds:undefined,
    completeEvidence:scope.evidenceIds.map((id: string)=>{
      const row: any=evidenceById.get(id)
      const doc: any=documentsById.get(row.documentId)
      const {id:_id,documentId:_doc,...fields}=row
      const {id:_documentId,...document}=doc
      return {...fields, completeDocument:document}
    }),
  }))
}
const assetDigests: Record<string,string>={}
const sourceAssetBindings: any[]=[]
const qa = read(resolve(laneRoots[0].root,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'))
for (const row of qa.records) if (row.visualizationState === 'available') {
  const bytes = readFileSync(resolve(root,row.publicAssetPath))
  assetDigests[row.imageUrl] = hash(bytes)
  sourceAssetBindings.push({goalId:row.goalId,publicPath:row.publicAssetPath,sha256:hash(bytes),bytes:bytes.length})
}

const continuityRows: any[]=[]
for (const goalId of beforeFull.keys()) {
  const goalBefore:any=baselineGoals.get(goalId), goalAfter:any=futureGoals.get(goalId)
  const pageBefore:any=beforeFull.get(goalId), pageAfter:any=afterFull.get(goalId)
  const contextBefore=contextHelpers.buildGoalDescriptionCanonicalContext(goalBefore)
  const contextAfter=contextHelpers.buildGoalDescriptionCanonicalContext(goalAfter)
  const dPart=(goal:any,page:any,context:any)=>({goalId,goalFingerprint:page.goalFingerprint,pageFingerprint:page.pageFingerprint,currentTitleDe:goal.title,currentTitleEn:goal.titleEn??null,currentDescriptionDe:goal.description,currentDescriptionEn:goal.descriptionEn??null,canonicalContext:context,reviewContext:{page,evidenceProfile:null}})
  const dBefore=dPart(goalBefore,pageBefore,contextBefore), dAfter=dPart(goalAfter,pageAfter,contextAfter)
  const pBefore=evidenceHelpers.goalEvidenceReviewInputPayload(goalBefore,'goal-evidence-v1',assetDigests,'curricularAtomic')
  const pAfter=evidenceHelpers.goalEvidenceReviewInputPayload(goalAfter,'goal-evidence-v1',assetDigests,'curricularAtomic')
  const sourcesBefore=resolvedSourceForGoal(before.originals,goalId), sourcesAfter=resolvedSourceForGoal(after.originals,goalId)
  const scopesBefore=before.atlas.receipt.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>w.goalId===goalId).map((w:any)=>({scopeKey:s.key,...w})))
  const scopesAfter=after.atlas.receipt.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>w.goalId===goalId).map((w:any)=>({scopeKey:s.key,...w})))
  continuityRows.push({goalId,protectedCurrent127:protectedIds.has(goalId),wholeGoalExactlyEqual:same(goalBefore,goalAfter),wholeGoalBefore:goalBefore,wholeGoalAfter:goalAfter,completeFullPageExactlyEqual:same(pageBefore,pageAfter),completeFullPageBefore:pageBefore,completeFullPageAfter:pageAfter,nationalPageExactlyEqual:same(beforeNational.get(goalId)??null,afterNational.get(goalId)??null),canonicalDContextExactlyEqual:same(contextBefore,contextAfter),completeDInputPartExactlyEqual:same(dBefore,dAfter),completeDInputPartBefore:dBefore,completeDInputPartAfter:dAfter,nativeDContextFingerprintBefore:resolutionHelpers.fingerprintGoalDescriptionReviewContext(dBefore),nativeDContextFingerprintAfter:resolutionHelpers.fingerprintGoalDescriptionReviewContext(dAfter),completePInputSemanticPayloadExactlyEqual:same(pBefore,pAfter),PReviewInputFingerprintBefore:evidenceHelpers.fingerprintGoalEvidenceReviewInput(goalBefore,'goal-evidence-v1',assetDigests,'curricularAtomic'),PReviewInputFingerprintAfter:evidenceHelpers.fingerprintGoalEvidenceReviewInput(goalAfter,'goal-evidence-v1',assetDigests,'curricularAtomic'),canonicalImageLinksExactlyEqual:same(goalBefore.resourceLinks??[],goalAfter.resourceLinks??[]),fullVisualizationExactlyEqual:same(pageBefore.visualization,pageAfter.visualization),exactNativeSourceScopeWitnessesEqual:same(scopesBefore,scopesAfter),nativeSourceScopeWitnessesBefore:scopesBefore,nativeSourceScopeWitnessesAfter:scopesAfter,completeOriginalSourceAttributionExactlyEqual:same(sourcesBefore,sourcesAfter),resolvedOriginalSourceAttributionBefore:sourcesBefore,resolvedOriginalSourceAttributionAfter:sourcesAfter})
}
assert.equal(continuityRows.length,378)
assert.equal(continuityRows.filter(r=>r.protectedCurrent127).length,127)
assert.ok(continuityRows.every(r=>r.completeFullPageExactlyEqual && r.completeDInputPartExactlyEqual && r.completePInputSemanticPayloadExactlyEqual && r.fullVisualizationExactlyEqual && r.exactNativeSourceScopeWitnessesEqual))
const sourceChanged = continuityRows.filter(r=>!r.completeOriginalSourceAttributionExactlyEqual)
const strictSourceChanged = sourceChanged.filter(r=>r.protectedCurrent127)
const changedWhole = continuityRows.filter(r=>!r.wholeGoalExactlyEqual)
assert.equal(changedWhole.length,4)
const selectedSources=read(resolve(laneRoots[1].root,'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json')).sourceGoals.filter((g:any)=>g.topicCode==='3.2.1.2' && g.bulletIndex>=3 && g.bulletIndex<=10).map((g:any)=>g.id)
const selectedSourceWitnessReach = continuityRows.filter(r=>r.nativeSourceScopeWitnessesBefore.some((w:any)=>selectedSources.includes(w.sourceGoalId)))
const strictSelectedReach=selectedSourceWitnessReach.filter(r=>r.protectedCurrent127)
save(resolve(own,'actual-current378-complete-goal-page-context-source-image-continuity.json'),{role:'Technical complete native before/after measurement; not new scientific review',rows:continuityRows,actualSourceAssetBindings:sourceAssetBindings})
const summary={schemaVersion:1,role:'Technical native metadata integration preparation; no new independent science QA',currentWholeGoalCount:479,currentCurricularAtomicCount:378,currentProtectedStrictCount:127,nativeDerivationCounts:before.atlas.receipt.counts,fullOrderedGoalIDsExactlyEqual:true,national359OrderedGoalIDsExactlyEqual:true,all48OrderedScopeViewsAndWholeWitnessSetsExactlyEqual:true,changedNativeGeneratedOutputPaths:outputsChanged,wholeFullPagesExactlyEqual:378,wholeNationalPagesExactlyEqual:359,canonicalDContextsAndCompleteInputPartsExactlyEqual:378,PInputSemanticPayloadsAndFingerprintsExactlyEqual:378,fullImageBindingsExactlyEqual:378,changedCurricularWholeGoalIDs:changedWhole.map(r=>r.goalId),fiveLedgerSourceFingerprintTechnicalDeltas:ledgerDeltas.map(r=>r.goalId),actualChangedOriginalSourceAttributionGoalIDs:sourceChanged.map(r=>r.goalId),actualChangedOriginalSourceAttributionProtected127IDs:strictSourceChanged.map(r=>r.goalId),actualSelectedEightParagraphScopeWitnessReachIDs:selectedSourceWitnessReach.map(r=>r.goalId),actualSelectedEightParagraphProtected127ReachIDs:strictSelectedReach.map(r=>r.goalId),sourceAttributionRoutingStillRequired:strictSourceChanged.length>0,sourceHoldsCleared:0,strictCompletionsAdded:0,scienceReviewsPerformed:0,activeWrites:0,humanApproval:false,newGlobalBuilds:0}
save(resolve(own,'actual-native-current-future-delta-and-reviewrouting-summary.author.json'),summary)
console.log(JSON.stringify(summary))
