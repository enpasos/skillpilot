import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { buildGoalBookModel, stableGoalBookJson, fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalForEvidence, fingerprintGoalEvidenceReviewInput } from '../../../../../../../../../app/scripts/goalEvidenceProfileModel'

// Read-only successor to v1. Exactly eight authorized prerequisite edits stay in memory.
// Never modify historical B044/B045 configs, reviews, profiles or canonical files here.
const root = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-044-spatial-geometry-vectors-and-matrix-entry-20-v1'
const observed = new Map<string, Buffer>()
const read = (path: string) => { const value = readFileSync(path); if (!observed.has(path)) observed.set(path, value); return value }
const json = (path: string) => JSON.parse(read(path).toString())
const sha = (value: Buffer | string) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const stable = stableGoalBookJson
const config = json('app/scripts/config/goal-books/de-gym-math-national-atlas.json')
const source = json(config.landscapePath)
const updated = structuredClone(source)
const edits = [
  { goalId: 'be0e8715-3c3a-5ffb-937a-0b6bce4f01d8', before: ['b9bbd2a8-1379-5ffb-817f-41467d48abef', '858113c5-e53b-57bb-b01f-ba95c3ddcb6f', '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'], after: ['075f1ef2-6860-4b20-9df2-878157eb395e', '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'] },
  { goalId: 'b5062446-332f-4a67-aaf7-3bfa3e5aded9', before: ['b9bbd2a8-1379-5ffb-817f-41467d48abef', '858113c5-e53b-57bb-b01f-ba95c3ddcb6f', '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'], after: ['71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'] },
  {"goalId":"f378917f-2ca7-4c68-bd66-3f9457095dd5","before":["b9bbd2a8-1379-5ffb-817f-41467d48abef","858113c5-e53b-57bb-b01f-ba95c3ddcb6f","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2"],"after":["71cec9fb-3751-4d61-8b34-c5adbbf6e5f2"]},
  {"goalId":"4fb40e58-58c1-5964-b58e-3347a8022b97","before":["b9bbd2a8-1379-5ffb-817f-41467d48abef","858113c5-e53b-57bb-b01f-ba95c3ddcb6f","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"],"after":["71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"]},
  {"goalId":"6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8","before":["b9bbd2a8-1379-5ffb-817f-41467d48abef","858113c5-e53b-57bb-b01f-ba95c3ddcb6f","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"],"after":["71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"]},
  {"goalId":"6f09c97e-779b-500b-8092-3fb9696aa5bb","before":["b9bbd2a8-1379-5ffb-817f-41467d48abef","858113c5-e53b-57bb-b01f-ba95c3ddcb6f","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"],"after":["71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"]},
  {"goalId":"304111dd-426b-520b-a275-3fa37da1b0e0","before":["b9bbd2a8-1379-5ffb-817f-41467d48abef","858113c5-e53b-57bb-b01f-ba95c3ddcb6f","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"],"after":["71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"]},
  {"goalId":"ce198bc9-b014-52ba-814f-25cc3e020668","before":["b9bbd2a8-1379-5ffb-817f-41467d48abef","858113c5-e53b-57bb-b01f-ba95c3ddcb6f","71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"],"after":["71cec9fb-3751-4d61-8b34-c5adbbf6e5f2","b5062446-332f-4a67-aaf7-3bfa3e5aded9","f378917f-2ca7-4c68-bd66-3f9457095dd5"]},
]
assert.equal(edits.length, 8)
for (const edit of edits) {
  const goal = updated.goals.find((g: any) => g.id === edit.goalId)
  assert.deepEqual(goal.requires, edit.before)
  goal.requires = edit.after
}
const dag = (goals: any[], edge: 'requires' | 'contains') => {
  const by = new Map(goals.map(g => [g.id, g])), visiting = new Set<string>(), done = new Set<string>()
  const visit = (id: string) => {
    if (done.has(id)) return
    assert.ok(!visiting.has(id), edge + ' cycle at ' + id)
    assert.ok(by.has(id), edge + ' dangling target ' + id)
    visiting.add(id)
    for (const next of by.get(id)[edge] ?? []) visit(next)
    visiting.delete(id); done.add(id)
  }
  for (const goal of goals) visit(goal.id)
  return { edge, checkedGoals: done.size, cycles: 0, unresolvedReferences: 0 }
}
const dagChecks = [dag(updated.goals, 'requires'), dag(updated.goals, 'contains')]
const manifest = json(config.compositionViewManifestPath)
const qa = json(config.goalVisualizationQaPath)
const assetDigests = Object.fromEntries(qa.records.filter((r: any) => r.visualizationState === 'available').map((r: any) => {
  assert.equal(r.publicAssetPath, 'app/public' + r.imageUrl)
  return [r.imageUrl, sha(read(r.publicAssetPath))]
}))
const common = {
  config,
  compositionViewManifest: manifest,
  compositionViewSources: manifest.sourcePaths.map((path: string) => ({ path, view: json(path) })),
  navigationView: json(manifest.navigationViewPath),
  durationModelPolicy: json(manifest.durationModelPolicyPath),
  semanticKindLedger: json(config.semanticKindLedgerPath),
  goalVisualizationQa: qa,
  goalVisualizationAssetDigests: assetDigests,
  evidenceReviewSources: config.evidenceReviewPaths.map((path: string) => ({path, text: read(path).toString()})),
}
const beforeModel = buildGoalBookModel({...common, landscape:source})
const updatedSemanticKinds = structuredClone(common.semanticKindLedger)
const semanticKindBindingChanges = edits.map(edit => {
  const goal = updated.goals.find((g: any) => g.id === edit.goalId)
  const decision = updatedSemanticKinds.decisions.find((d: any) => d.goalId === edit.goalId)
  const beforeFingerprint = decision.sourceFingerprint
  const afterFingerprint = fingerprintSemanticKindSourceGoal(goal)
  assert.equal(decision.semanticKind, 'curricularAtomic')
  decision.sourceFingerprint = afterFingerprint
  return {goalId:edit.goalId,beforeFingerprint,afterFingerprint,semanticKind:decision.semanticKind,classificationUnchanged:true,requiresNativeLedgerFollowup:true}
})
const afterModel = buildGoalBookModel({...common, landscape:updated,semanticKindLedger:updatedSemanticKinds})
assert.equal(beforeModel.pages.length, afterModel.pages.length)
const fieldDelta = (a: any, b: any) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => stable(a[k]) !== stable(b[k]))
const pageDelta = (before: any, after: any) => before.pages.map((p: any) => {
  const next = after.pages.find((q: any) => q.goalId === p.goalId)
  const fields = fieldDelta(p, next)
  return { goalId: p.goalId, title: p.title, fields, beforePage:p.pageNumber, afterPage:next.pageNumber, beforePageFingerprint:p.pageFingerprint, afterPageFingerprint:next.pageFingerprint }
}).filter((p: any) => p.fields.length)
const fullPageChanges = pageDelta(beforeModel,afterModel)
const batch = json(root + '.config.json')
const subsetBefore = buildGoalDescriptionRolloutSubsetModel({baseModel:beforeModel, goalIds:batch.goalIds,bookId:batch.bookId,title:batch.title})
assert.deepEqual(batch.goalIds.slice(0,2), ['be0e8715-3c3a-5ffb-937a-0b6bce4f01d8','075f1ef2-6860-4b20-9df2-878157eb395e'])
const hypotheticalFollowingOrder = [batch.goalIds[1],batch.goalIds[0],...batch.goalIds.slice(2)]
const subsetAfter = buildGoalDescriptionRolloutSubsetModel({baseModel:afterModel, goalIds:hypotheticalFollowingOrder,bookId:batch.bookId,title:batch.title})
const originalSubset = json(root + '/bundle/book-model.json')
assert.deepEqual(originalSubset.pages, subsetBefore.pages, 'Current B044 input has drifted before proposed edits')
const subsetChanges = pageDelta(subsetBefore, subsetAfter)
const b045Root = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-045-q2-function-combinations-and-transition-matrices-20-v1'
const b045 = json(b045Root + '.config.json')
const b045Before = buildGoalDescriptionRolloutSubsetModel({baseModel:beforeModel,goalIds:b045.goalIds,bookId:b045.bookId,title:b045.title})
const b045After = buildGoalDescriptionRolloutSubsetModel({baseModel:afterModel,goalIds:b045.goalIds,bookId:b045.bookId,title:b045.title})
assert.deepEqual(json(b045Root + '/bundle/book-model.json').pages, b045Before.pages, 'Current B045 input drifted before proposed edits')
const b045SubsetChanges = pageDelta(b045Before,b045After)
const relationDelta = (a:any,b:any) => {
 const fields=['requires','reverseRequires','contains','externalPrerequisites']
 return Object.fromEntries(fields.filter(k=>stable(a[k]??[])!==stable(b[k]??[])).map(k=>{
  const left=a[k]??[],right=b[k]??[]
  return [k,{
   removedGoalIds:left.filter((r:any)=>!right.some((s:any)=>s.goalId===r.goalId)).map((r:any)=>r.goalId),
   addedGoalIds:right.filter((r:any)=>!left.some((s:any)=>s.goalId===r.goalId)).map((r:any)=>r.goalId),
   changedReferences:left.filter((r:any)=>right.some((s:any)=>s.goalId===r.goalId&&stable(s)!==stable(r))).map((r:any)=>({goalId:r.goalId,beforePage:r.pageNumber,afterPage:right.find((s:any)=>s.goalId===r.goalId).pageNumber})),
  }]
 }))
}
const fullPageRelationChanges = beforeModel.pages.map((p:any)=>{
 const next=afterModel.pages.find((q:any)=>q.goalId===p.goalId)
 const delta=relationDelta(p,next)
 return {goalId:p.goalId,title:p.title,relations:delta}
}).filter((x:any)=>Object.keys(x.relations).length)
const canonicalChangedGoals = source.goals.filter((g: any) => stable(g) !== stable(updated.goals.find((n: any) => n.id === g.id))).map((g: any) => {
 const n = updated.goals.find((n: any) => n.id === g.id)
 assert.deepEqual(fieldDelta(g,n), ['requires'])
 return {goalId:g.id,title:g.title,beforeGoalBytesSha256:sha(stable(g)),afterGoalBytesSha256:sha(stable(n)),fields:['requires'],beforeRequires:g.requires,afterRequires:n.requires,beforeGoalFingerprint:fingerprintGoalForEvidence(g,'goal-evidence-v1','curricularAtomic'),afterGoalFingerprint:fingerprintGoalForEvidence(n,'goal-evidence-v1','curricularAtomic'),beforeEvidenceInputFingerprint:fingerprintGoalEvidenceReviewInput(g,'goal-evidence-v1',assetDigests,'curricularAtomic'),afterEvidenceInputFingerprint:fingerprintGoalEvidenceReviewInput(n,'goal-evidence-v1',assetDigests,'curricularAtomic'),beforeCanonicalContextSha256:sha(stable(buildGoalDescriptionCanonicalContext(g))),afterCanonicalContextSha256:sha(stable(buildGoalDescriptionCanonicalContext(n)))}
})
// A/M use the same semantic fields with different ruleVersion values, not graph edges.
const normalize = (x: unknown) => String(x ?? '').normalize('NFKC').replace(/\s+/g,' ').trim()
const semanticPayload = (g: any, ruleVersion: string) => ({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)})
const fingerprintChecks = ['semantic-atomicity','memory-card-review'].map(lane => {
 const cfg = json('curricula/DE/Gymnasium/quality/'+lane+'/canonical-math-full.config.json')
 const records = read(cfg.reviewPath).toString().trim().split('\n').map(l=>JSON.parse(l))
 return {lane,ruleVersion:cfg.ruleVersion,records:edits.map(e=>{
   const old=source.goals.find((g:any)=>g.id===e.goalId),next=updated.goals.find((g:any)=>g.id===e.goalId),record=records.find((r:any)=>r.goalId===e.goalId)
   const before=sha(stable(semanticPayload(old,cfg.ruleVersion))),after=sha(stable(semanticPayload(next,cfg.ruleVersion)))
   assert.equal(before,record.fingerprint);assert.equal(after,before)
   return {goalId:e.goalId,beforeFingerprint:before,afterFingerprint:after,status:record.status,recordUnchanged:true}
 })}
})
for(const [path,bytes] of observed) assert.deepEqual(readFileSync(path),bytes,'Input changed while auditing '+path)
const report = {schemaVersion:1,artifactType:'bounded-prerequisite-change-plan-v2',auditExecutedAt:new Date().toISOString(),authority:'Root approved exactly eight goals: prior be0/b506 correction plus six explicitly named B045 targets; canonical execution is deferred until coordinated source-write checkpoint. This is an AI planning audit, not a fresh D review or human approval.',canonicalWritesPerformed:false,source:{path:config.landscapePath,bytesSha256:sha(read(config.landscapePath)),semanticDigest:sha(stable(source))},hypotheticalAfter:{semanticDigest:sha(stable(updated)),newGoalIds:[],deletedGoalIds:[],pageCount:afterModel.pages.length},canonicalChangedGoals,semanticKindBindingChanges,dagChecks,fingerprintChecks,historicalInputsPreserved:[root+'.config.json',root+'/bundle/book-model.json',b045Root+'.config.json',b045Root+'/bundle/book-model.json'],bookModelBefore:beforeModel.digest,bookModelHypotheticalAfter:afterModel.digest,fullPageChanges,fullPageRelationChanges,b044SubsetChanges:subsetChanges,b045SubsetChanges,requirements:{preserve:'Both original sealed B044 A/B reviews, current D6/P6 artifacts and all A/M records. No user/mastery mutation.',newDescriptionReview:'Fresh bound-page reviews for changed targets, affected 075 reverseRequires and any other currently strict affected native pages; hold original evidence, do not relabel current.',newPositiveProfileReview:'All eight edited goals have changed reviewInput through requires; each semantic goal fingerprint stays unchanged. B044 P6 have no incoming-edge binding and stay technically unchanged unless a later own-case/context change occurs.',afterWriteChecks:['Exact goal field delta = requires only on8approvedgoals','Native A/M checks without ledger rewrite','DAG and composition checks','Fresh goal-book model and current strict-report debt inspection','Curriculum quality status regeneration and all protected maturity floors']},sourceBindings:[...observed].filter(([path])=>!path.startsWith('app/public/')).map(([path,bytes])=>({path,sha256:sha(bytes)}))}
console.log(JSON.stringify(report,null,2))
