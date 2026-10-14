// Technical review execution: Apache-2.0. This module writes only this review root.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const evidence = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/'
const author = `${evidence}chemie-three-recycling-current403-graph-source-integration-author-20261013-v4`
const own = `${evidence}chemie-three-recycling-current406-graph-scope-independent-20261013-v1`
const paths = new Set<string>()
const hash = (b: Buffer | string) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const read = (p: string) => { paths.add(p); return JSON.parse(readFileSync(resolve(root, p), 'utf8')) }
const binding = (p: string) => { const b = readFileSync(resolve(root, p)); return { path: p, bytes: b.length, sha256: hash(b) } }
const write = (p: string, o: unknown) => writeFileSync(resolve(root, `${own}/${p}`), `${JSON.stringify(o, null, 2)}\n`)
const neutral = read(`${author}/NEUTRAL.three-recycling-graph-source.exact-input-selector.json`)
for (const v of Object.values(neutral)) {
  if (v && typeof v === 'object' && 'path' in v && 'sha256' in v) {
    const b = binding(String(v.path)); assert.equal(b.sha256, v.sha256); if ('bytes' in v) assert.equal(b.bytes, v.bytes)
    paths.add(String(v.path))
  }
}
const graph = read(neutral.candidateLandscape.path)
const cas = read(neutral.graphCAS.path)
const base = read(cas.baseCanonicalBinding.path)
const sourceCAS = read(neutral.sourceCAS.path)
const cases = read(neutral.exactAcceptedSixCases.path)
const semantic = read(neutral.candidateSemanticLedger.path)
const selectedIds = cas.newWholeContentGoals.map((g: any) => g.id)
const terminalIds = cas.newWholeAssessmentTerminals.map((g: any) => g.id)
const newIds = [...selectedIds, ...terminalIds]
const rootId = cas.rootContainsOnlyCAS.beforeWholeGoal.id
const orientationId = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
const goalMap = new Map<string, any>(graph.goals.map((g: any) => [g.id, g]))
const baseMap = new Map<string, any>(base.goals.map((g: any) => [g.id, g]))
assert.equal(graph.goals.length, 531); assert.equal(base.goals.length, 525)
assert.equal(goalMap.size, graph.goals.length)
const changes = []
for (const [id, g] of baseMap) {
  const next = goalMap.get(id); assert.ok(next)
  if (JSON.stringify(g) !== JSON.stringify(next)) {
    const changed = [...new Set([...Object.keys(g), ...Object.keys(next)])].filter(k => JSON.stringify(g[k]) !== JSON.stringify(next[k]))
    changes.push({ goalId: id, fields: changed })
  }
}
assert.deepEqual(changes, [{ goalId: rootId, fields: ['contains'] }])
assert.deepEqual(goalMap.get(rootId).contains, [...baseMap.get(rootId).contains, ...newIds])
assert.deepEqual(graph.goals.filter((g: any) => !baseMap.has(g.id)).map((g: any) => g.id), newIds)
const dag = ['contains', 'requires'].map(field => {
  const done = new Set<string>(); const visiting = new Set<string>()
  const walk = (id: string) => {
    assert.ok(!visiting.has(id), `Cycle in ${field}: ${id}`); if (done.has(id)) return
    const g = goalMap.get(id); assert.ok(g, `Missing ${field} ref: ${id}`)
    visiting.add(id); for (const ref of g[field] ?? []) walk(ref.replace(`${graph.landscapeId}:`, ''))
    visiting.delete(id); done.add(id)
  }
  for (const id of goalMap.keys()) walk(id)
  return { field, checked: done.size, cycles: 0, missingReferences: 0 }
})
const parents = newIds.map(goalId => {
  const directParentIds = graph.goals.filter((g: any) => (g.contains ?? []).includes(goalId)).map((g: any) => g.id)
  assert.deepEqual(directParentIds, [rootId]); return { goalId, directParentIds }
})
for (const id of selectedIds) assert.deepEqual(goalMap.get(id).requires, [orientationId])
for (const [i, id] of terminalIds.entries()) {
  const g = goalMap.get(id); assert.deepEqual(g.requires, [selectedIds[i]])
  assert.equal(g.extendedData.applicabilityFromRequires, true)
  assert.equal(g.extendedData.applicabilityMappingInheritance, 'boundary')
  assert.deepEqual(g.examData.coveredGoalIds, g.requires)
  assert.equal(g.examData.reviewStatus, 'needs_review')
  assert.equal(g.examData.scoring.maxPoints, 6); assert.equal(g.examData.scoring.passingPoints, 6)
  assert.deepEqual(g.examData.scoring.steps.map((r: any) => r.points), [2, 2, 2])
  const c = cases.cases.find((c: any) => c.caseId === g.extendedData.assessmentCaseBinding.defaultCaseId)
  assert.ok(c)
  assert.equal(g.examData.taskContent, `${c.dataDe}\n\n${c.taskDe}`)
  assert.equal(g.examData.taskContentEn, `${c.dataEn}\n\n${c.taskEn}`)
  assert.equal(g.examData.solutionContent, c.modelAnswerDe); assert.equal(g.examData.solutionContentEn, c.modelAnswerEn)
  assert.deepEqual(g.examData.scoring.steps, c.rubric.map((r: any) => ({ id: r.expectationId, points: r.maximumPoints, description: `${r.fullCreditDe} ${r.partialCreditDe} ${r.zeroCreditDe}` })))
}

const acceptedSourceOperations = read(`${evidence}chemie-three-recycling-whole-source-duty-author-20261013-v3/OPERATIONS.thirteen-whole-source-cell-CAS.new-targets.author.json`)
const sourceChanges = sourceCAS.operations.filter((o: any) => o.beforeCarrierBinding).map((op: any) => {
  const before = read(op.beforeCarrierBinding.path); const after = read(op.afterCommittableCarrierBinding.path)
  for (const [b, expected] of [[binding(op.beforeCarrierBinding.path), op.beforeCarrierBinding], [binding(op.afterCommittableCarrierBinding.path), op.afterCommittableCarrierBinding]]) {
    assert.equal(b.sha256, expected.sha256); assert.equal(b.bytes, expected.bytes)
  }
  const unrelated = (o: any) => ({ ...o, mappings: (o.mappings ?? []).filter((r: any) => r.legacyGoalId !== op.sourceGoalId), decisions: (o.decisions ?? []).filter((r: any) => r.sourceGoalId !== op.sourceGoalId) })
  assert.deepEqual(unrelated(after), unrelated(before), `Collateral source changes: ${op.operationId}`)
  const selected = (o: any) => ({ mappingCells: (o.mappings ?? []).filter((r: any) => r.legacyGoalId === op.sourceGoalId), decisionCells: (o.decisions ?? []).filter((r: any) => r.sourceGoalId === op.sourceGoalId) })
  const accepted = acceptedSourceOperations.operations.find((o: any) => o.operationId === op.operationId)
  assert.ok(accepted)
  assert.deepEqual(selected(before), accepted.acceptedBoundedBefore)
  assert.deepEqual(selected(after), accepted.proposedAfter)
  return { operationId: op.operationId, sourceGoalId: op.sourceGoalId, before: op.beforeCarrierBinding, after: op.afterCommittableCarrierBinding, exactAcceptedWholeSourceCellsBeforeAndAfter: true, unrelatedCellsAndMetadataUnchanged: true }
})
assert.equal(sourceChanges.length, 8)
const retired = sourceCAS.operations.filter((o: any) => o.disposition === 'retired_alias_remains_absent')
assert.equal(retired.length, 5)

const canonicalPath = 'app/src/utils/authoring/canonicalAuthoring.ts'
const compositionPath = 'app/src/utils/authoring/compositionViewAuthoring.ts'
const atlasPath = 'app/scripts/goalBookSourceAtlasInputs.ts'
const fingerprintPath = 'app/scripts/goalBookModel.ts'
for (const p of [canonicalPath, compositionPath, atlasPath, fingerprintPath]) paths.add(p)
const canonical = await import(pathToFileURL(resolve(root, canonicalPath)).href)
const composition = await import(pathToFileURL(resolve(root, compositionPath)).href)
const atlas = await import(pathToFileURL(resolve(root, atlasPath)).href)
const fingerprint = await import(pathToFileURL(resolve(root, fingerprintPath)).href)
const normalized = canonical.normalizeCanonicalLandscape(graph)
const canonicalFindings = canonical.validateCanonicalLandscape(normalized)
assert.deepEqual(canonicalFindings, [])
const sourceConfig = read(neutral.portableSourceAPIConfig.path)
const sourceResult = atlas.buildGoalBookSourceAtlasInputs(sourceConfig, root)
assert.deepEqual(sourceResult.receipt.counts, { canonicalCurricularAtomicGoals: 406, publishedCurricularAtomicGoals: 383, sourceViews: 48, unresolvedSourceScopeDecisions: 458, omittedGoals: 23 })
const sourceScopes = selectedIds.map((goalId: string) => ({
  goalId,
  scopes: sourceResult.receipt.scopes.filter((s: any) => s.goalIds.includes(goalId)).map((s: any) => ({ scope: { jurisdiction: s.jurisdiction, stage: s.stage, courseProfile: s.courseProfile }, witnesses: s.witnesses.filter((w: any) => w.goalId === goalId) })),
}))
const expected = [
  ['DE-HH/SekII/GK', 'DE-HH/SekII/LK', 'DE-MV/SekII/GK', 'DE-MV/SekII/LK'],
  ['DE-MV/SekII/GK', 'DE-MV/SekII/LK'],
  ['DE-NW/SekI/'],
]
for (const [i, r] of sourceScopes.entries()) {
  assert.deepEqual(r.scopes.map((s: any) => `${s.scope.jurisdiction}/${s.scope.stage}/${s.scope.courseProfile ?? ''}`).sort(), expected[i])
  for (const s of r.scopes) assert.ok(s.witnesses.every((w: any) => w.coverage === 'direct' && w.profileBasis === 'source-metadata' && w.mappedTargetGoalId === r.goalId))
}
for (const id of terminalIds) assert.ok(sourceResult.receipt.scopes.every((s: any) => !s.goalIds.includes(id)), `Assessment incorrectly receives source credit: ${id}`)
const proof = read(neutral.normalCompilerSourceBookLayerAProof.path)
const views = proof.affectedScopes.map((p: any) => {
  const view = composition.normalizeCompositionView(read(p.viewPath))
  const compiled = composition.compileCompositionView(view, normalized)
  assert.deepEqual(compiled.findings, [])
  const { targetGoalIds, prerequisiteOnlyGoalIds } = composition.collectCompositionProjectionRoleGoalIds(view.rootNodes, goalMap)
  const occurrences: Record<string, number> = {}
  const walk = (nodes: any[]) => { for (const n of nodes) { if (n.sourceGoalId) occurrences[n.sourceGoalId] = (occurrences[n.sourceGoalId] ?? 0) + 1; walk(n.children ?? []) } }
  walk(compiled.compiledRootNodes)
  assert.ok(Object.values(occurrences).every(n => n === 1))
  const sourceScope = sourceResult.receipt.scopes.find((s: any) => `${s.jurisdiction}/${s.stage}/${s.courseProfile ?? ''}` === p.key)
  assert.ok(sourceScope)
  const terminals = terminalIds.filter((id: string, i: number) => sourceScope.goalIds.includes(selectedIds[i]))
  assert.deepEqual([...targetGoalIds].sort(), [...sourceScope.goalIds, ...terminals].sort())
  return { key: p.key, viewPath: p.viewPath, targetCount: targetGoalIds.size, occurrenceCount: Object.values(occurrences).reduce((a, b) => a + b, 0), eachTargetExactlyOnce: true, newContentIds: selectedIds.filter((id: string) => targetGoalIds.has(id)), newAssessmentIds: terminals, prerequisiteOnlyIds: [...prerequisiteOnlyGoalIds], findings: compiled.findings }
})
const learnerAnchors = ['hh', 'mv', 'nw'].flatMap(j => ['gk', 'lk'].map(course => {
  const p = `curricula/DE/Gymnasium/composition-views/chemie/de-${j}-${course}.view.json`
  const v = composition.normalizeCompositionView(read(p))
  const role = composition.collectCompositionProjectionRoleGoalIds(v.rootNodes, goalMap)
  assert.ok(role.targetGoalIds.has(orientationId), `No learner orientation anchor: ${p}`)
  return { viewPath: p, scope: v.scope, orientationTargetPresent: true, containsNewUnintegratedContentIds: selectedIds.filter((id: string) => role.targetGoalIds.has(id)) }
}))
for (const d of semantic.decisions.filter((d: any) => [...newIds, rootId].includes(d.goalId))) assert.equal(d.sourceFingerprint, fingerprint.fingerprintSemanticKindSourceGoal(goalMap.get(d.goalId)))
assert.deepEqual(newIds.map(id => semantic.decisions.find((d: any) => d.goalId === id).semanticKind), ['curricularAtomic', 'curricularAtomic', 'curricularAtomic', 'practiceAssessment', 'practiceAssessment', 'practiceAssessment'])

const snapshotPaths = new Set((sourceConfig.sourceDocumentSnapshots ?? []).map((s: any) => s.path))
for (const input of sourceResult.receipt.inputBindings) {
  if (!snapshotPaths.has(input.path) && existsSync(resolve(root, input.path))) paths.add(input.path)
}
for (const p of [`${author}/SEAL.finite-inactive-graph-source-author.actual.json`, 'AGENTS.md', 'app/scripts/semanticAtomicityReview.ts', 'app/scripts/memoryCardReview.ts']) paths.add(p)
for (const p of [
  `${evidence}chemie-three-recycling-whole-source-duty-independent-a-20261013-v3/DECISION.three-exact-goals-and-whole-source-duty-unions.independent-a.actual.json`,
  `${evidence}chemie-three-recycling-whole-source-duty-independent-a-20261013-v3/SEAL.final.independent-a.actual.json`,
  `${evidence}chemie-three-recycling-whole-source-duty-independent-b-20261013-v3/DECISIONS.three-goals-four-components-three-source-unions.independent-b.actual.json`,
  `${evidence}chemie-three-recycling-whole-source-duty-independent-b-20261013-v3/FINAL.finite-whole-source-review.independent-b.freeze.json`,
]) { read(p) }
write('INPUT.exact-finite-graph-source-and-stock-bindings.actual.json', { schemaVersion: 1, neutralInputSelector: binding(`${author}/NEUTRAL.three-recycling-graph-source.exact-input-selector.json`), inputBindings: [...paths].sort().map(binding), independentAuthor: '/root/recycling_graph_scope_independent', originalAuthor: '/root/recycling_graph_source_resume', blindedReviewClaim: false, sourceScientificReviewsReusedWithoutRestart: true })
write('checks/graph-source-scope-and-assessment.actual.json', { schemaVersion: 1, stockAPIs: [canonicalPath, compositionPath, atlasPath, fingerprintPath].map(binding), canonicalFindings, dag, nodeCount: graph.goals.length, existingChangedWholeGoals: changes, sixNewUniqueParents: parents, sourceCAS: sourceChanges, retiredAliasesNotReintroduced: retired, sourceCounts: sourceResult.receipt.counts, sourceScopes, sourceInputs: sourceResult.receipt.inputBindings.filter((b: any) => !snapshotPaths.has(b.path)), originalDocumentIdentitySnapshots: sourceConfig.sourceDocumentSnapshots.map((s: any) => ({ logicalDocumentPath: s.path, url: s.url, sha256: s.sha256, ignoredOriginalCacheNotAnOwnBuildInput: true })), fiveDiagnosticViews: views, existingLearnerOrientationAnchors: learnerAnchors, defaultExamCasesExact: true, assessmentSourceCredit: false, semanticFingerprintMatches: true, semanticClassificationsAreInactiveProposals: true, newStrictCompletions: 0, activeWrites: false, humanApproval: false })

// The stock CLIs do not export their fingerprint functions. Mirror their exact
// bound payload serialization, then let both unchanged stock checkers verify it.
const text = (v: unknown) => String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (v: any): string => Array.isArray(v) ? `[${v.map(stable).join(',')}]` : v && typeof v === 'object' ? `{${Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, n]) => `${JSON.stringify(k)}:${stable(n)}`).join(',')}}` : JSON.stringify(v)
const semanticFingerprint = (g: any, ruleVersion: string) => hash(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: text(g.title), titleEn: text(g.titleEn), description: text(g.description), descriptionEn: text(g.descriptionEn), phase: text(g.dimensionTags?.phase), area: text(g.dimensionTags?.area), topicCode: text(g.dimensionTags?.topicCode), nodeKind: text(g.nodeKind) }))
const reviewId = 'chemie-three-recycling-current406-graph-scope-independent-20261013-v1'
const reviewer = '/root/recycling_graph_scope_independent'
const aReasons = [
  'One reasoned environmental assessment of disposal and recycling for batteries and accumulators. Discussion of distinct material releases, collection versus recovery and remaining energy/residue impacts supplies reasons for the same assessment; the goal does not add cell construction, charging reactions or independent quantitative routines. Both default and alternative complete DE/EN cases retain batteries AND accumulators and bound environmental conclusions to supplied evidence.',
  'One scientifically grounded discussion of rare-metal extraction for electrochemical sources. Source demand, ore/material consequences and bounded comparisons are facets of the same discussion. The full goal and both DE/EN cases do not require extraction mechanisms, complete life-cycle calculations, or equate rare metals with rare-earth metals.',
  'One reasoned personal consumption/disposal judgment based on metal recycling. Describing resource conservation and energy saving is expressly the basis of that judgment, not a second independent routine. Both DE/EN cases bind the linked explanation and both decision components to supplied same-output data and retain the resource/energy trade-off when conditions change.',
]
const mReasons = [
  'No compact independent recall item is necessary for the disposal/recycling competence. Battery/accumulator compositions, recovery proportions and the environmental-release premise are supplied in each case; learners must explain consequences and weigh remaining effects. Synthetic 60/90 or 70/80 percentages are teaching data, not facts to memorize. Distinguishing collection from recovery is taught and applied within the ordinary goal.',
  'No narrow hard-memory deck is justified for this material-based discussion. The selected metal and source role, rarity premise, ore grades or by-product context and comparison boundaries are supplied. Learners explain extraction consequences and information limits; rare versus rare-earth classification is a conceptual non-equivalence, not an unstated element-list recall requirement.',
  'No hard-memory cards are required for the reasoned personal consumption/disposal judgment. Metal masses, equal useful output and energy indices are supplied hypothetical data. Resource substitution, nonzero remaining energy and changed-case trade-offs must be explained and used, not recalled as a fixed recycling slogan or numerical advantage.',
]
for (const [kind, ruleVersion, reasons] of [['a', 'semantic-atomicity-v1', aReasons], ['m', 'memory-card-review-v1', mReasons]] as const) {
  const records = selectedIds.map((goalId: string, i: number) => ({ schemaVersion: 1, reviewId, ruleVersion, landscapeId: graph.landscapeId, goalId, fingerprint: semanticFingerprint(goalMap.get(goalId), ruleVersion), status: kind === 'a' ? 'atomic' : 'no_memory_needed', ...(kind === 'a' ? { semanticAtomic: true } : { memoryUseful: false, memoryGoalIds: [], deckIds: [] }), reviewedAt: '2026-10-13', reviewer, reason: reasons[i] }))
  writeFileSync(resolve(root, `${own}/${kind}-three-current406.review.jsonl`), `${records.map((r: any) => JSON.stringify(r)).join('\n')}\n`)
  write(`configs/${kind}-three-current406.config.json`, { schemaVersion: 1, reviewId, ruleVersion, landscapeId: graph.landscapeId, landscapePath: neutral.candidateLandscape.path, reviewPath: `${own}/${kind}-three-current406.review.jsonl`, ...(kind === 'm' ? { cardReviewPath: `${own}/m-three-current406.cards.review.jsonl`, visibilityScopeCoverageRequired: true, visibilityScopes: views.map((v: any) => ({ label: v.key, viewPath: v.viewPath })) } : {}), scope: { label: 'Exact three new recycling content goals; inactive current406 candidate only', leafGoalIds: selectedIds } })
}
writeFileSync(resolve(root, `${own}/m-three-current406.cards.review.jsonl`), '')
console.log('PASS independently reconstructed graph, eight source-carrier CAS operations, exact three source scopes, five diagnostic views, six learner orientation anchors and three whole examData cases')
