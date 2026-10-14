// Narrow technical measurements only; no scientific approval. Apache-2.0.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1'
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const write = (p: string, v: unknown) => writeFileSync(resolve(root, `${own}/${p}`), `${JSON.stringify(v, null, 2)}\n`)
const graph = read(`${own}/candidate/canonical533.current407.author.inactive.json`)
const cas = read(`${own}/candidate/two-whole-children-and-exact-parent-terminal-CAS.author.json`)
const goalMap = new Map<string, any>(graph.goals.map((g: any) => [g.id, g]))
const parent = cas.parentWholeGoalCAS.after.id
const childIds = cas.newWholeChildGoals.map((g: any) => g.id)
const sem = read(`${own}/candidate/semantic533.current407.author.base-unbound.json`)
const stock = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const semanticCAS = []
for (const id of [parent, cas.terminalWholeGoalCAS.after.id]) {
  const d = sem.decisions.find((d: any) => d.goalId === id); const before = structuredClone(d)
  d.sourceFingerprint = stock.fingerprintSemanticKindSourceGoal(goalMap.get(id))
  if (id === parent) { d.semanticKind = 'curricularArea'; d.decisionBasis = 'reviewed-current-pilot-curricular-area' }
  semanticCAS.push({ goalId: id, beforeWholeDecision: before, proposedAfterWholeDecision: structuredClone(d) })
}
for (const id of childIds) {
  const d = { goalId: id, sourceFingerprint: stock.fingerprintSemanticKindSourceGoal(goalMap.get(id)), semanticKind: 'curricularAtomic', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-curricular-atomic' }
  sem.decisions.push(d);semanticCAS.push({ goalId: id, beforeWholeDecision: null, proposedAfterWholeDecision: d })
}
sem.sourceLandscapePath = `${own}/candidate/canonical533.current407.author.inactive.json`
sem.counts = Object.fromEntries([...new Set(sem.decisions.map((d: any) => d.semanticKind))].map(k => [k, sem.decisions.filter((d: any) => d.semanticKind === k).length]))
sem.counts.total = sem.decisions.length
assert.equal(sem.counts.curricularAtomic,407);assert.equal(sem.decisions.length,533)
write('candidate/semantic533.current407.author.proposals.inactive.json',sem)
write('candidate/four-semantic-CAS.current-stock-fingerprints.author.json',{status:'HOLD proposals only. Native schema requires authoritative and reviewed-current-* values; these are not independent decisions or gate approvals.',operations:semanticCAS,newStrictCompletions:0,activeWrites:false})
const canonical = await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
assert.deepEqual(canonical.validateCanonicalLandscape(canonical.normalizeCanonicalLandscape(graph)),[])
for(const field of ['contains','requires']) {
 const done=new Set<string>(),seen=new Set<string>()
 const walk=(id:string)=>{assert.ok(!seen.has(id),`Cycle ${field}/${id}`);if(done.has(id))return;const g=goalMap.get(id);assert.ok(g);seen.add(id);for(const ref of g[field]??[])walk(ref.replace(`${graph.landscapeId}:`,''));seen.delete(id);done.add(id)}
 for(const id of goalMap.keys())walk(id)
}
for(const id of childIds)assert.deepEqual(graph.goals.filter((g:any)=>(g.contains??[]).includes(id)).map((g:any)=>g.id),[parent])
const base=read(cas.baseLandscape.path)
const changed=base.goals.filter((g:any)=>JSON.stringify(g)!==JSON.stringify(goalMap.get(g.id))).map((g:any)=>g.id)
assert.deepEqual(changed,[parent,cas.terminalWholeGoalCAS.after.id])
for(const k of ['title','titleEn','description','descriptionEn','resourceLinks'])assert.deepEqual(cas.parentWholeGoalCAS.after[k],cas.parentWholeGoalCAS.before[k])
const so=read(`${own}/candidate/exact-source-cell-CAS-two-child-entitlements.author.json`).operations[0]
const before=read(so.beforeCarrier.path),after=read(so.afterCarrier.path),sourceId=so.originalSourceGoal.id
const outside=(o:any)=>({...o,mappings:o.mappings.filter((m:any)=>m.legacyGoalId!==sourceId),decisions:o.decisions.filter((d:any)=>d.sourceGoalId!==sourceId)})
assert.deepEqual(outside(before),outside(after))
const atlas=await import(pathToFileURL(resolve(root,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const result=atlas.buildGoalBookSourceAtlasInputs(read(`${own}/candidate/source-atlas.current407.portable-author.config.json`),root)
const scopes=childIds.map((goalId:string)=>({goalId,scopes:result.receipt.scopes.filter((s:any)=>s.goalIds.includes(goalId)).map((s:any)=>({key:s.key,witnesses:s.witnesses.filter((w:any)=>w.goalId===goalId)}))}))
for(const r of scopes) {
 assert.deepEqual(r.scopes.map((s:any)=>s.key),['DE-BY/SekII/GK','DE-BY/SekII/LK'])
 assert.ok(r.scopes.every((s:any)=>s.witnesses.every((w:any)=>w.coverage==='direct'&&w.mappedTargetGoalId===r.goalId)))
}
const materializer=await import(pathToFileURL(resolve(root,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const candidates=read(`${own}/positive/two-complete-positive-v2-child-profiles.DEEN.author.json`)
const config={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:candidates.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:graph.landscapeId,landscapePath:`${own}/candidate/canonical533.current407.author.inactive.json`,semanticKindLedgerPath:`${own}/candidate/semantic533.current407.author.proposals.inactive.json`,reviewCriteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath:`${own}/positive/not-materialized.pending-independent-review.jsonl`,reviewedResourceTypes:[],requireApproved:false,scope:{label:'Two unreviewed e560 child design profiles; images and source scope review pending',goalIds:childIds}}
const records=await materializer.buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:candidates})
write('checks/stock-graph-semantic-source-and-profile-measurements.actual.json',{status:'PASS technical stock measurements; scientific source/profile/A/M/D/V acceptance remains HOLD',nodeCount:graph.goals.length,semanticCounts:sem.counts,actualOldChangedGoalIds:changed,parentFullDEENBodyAndImageExact:true,terminalOtherPrerequisitesAndWholeFieldsExact:true,containsAndRequiresCycles:0,oneVisibleCanonicalParentForEachChild:true,sourceCounts:result.receipt.counts,childActualTechnicalSourceScopes:scopes,sourceScopeGrantIsNotScientificApproval:true,exactOneSourceCellAllPartnersUnchanged:true,profilesConstructedAndStockValidated:records.map((r:any)=>({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,status:r.status,reviewAuthority:r.reviewAuthority,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope})),currentPositiveReviewRecordsWritten:false,newStrictCompletions:0,activeWrites:false,humanApproval:false})
console.log('PASS 533 nodes / 407 proposed content goals; only parent + one terminal change; two exact BY source components; four complete child cases and two E0/G0 profile designs; no current approvals')
