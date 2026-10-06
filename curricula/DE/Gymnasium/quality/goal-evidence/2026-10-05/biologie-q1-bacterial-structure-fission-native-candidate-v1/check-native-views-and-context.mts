// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseGoalBookRuntimeModel, filterGoalBookPages } from '../../../../../../../app/src/utils/goalBookRuntime'
import { resolveGoalBookPersonalizationScope, compileGoalBookPersonalizedProjection } from '../../../../../../../app/src/utils/goalBookPersonalizedProjection'
const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-native-candidate-v1'
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const meta = read(own + '/prospective-paths.json'), [bau, fission] = meta.goalIds
const beforeRaw = read(own + '/baseline-full.book-model.json'), afterRaw = read(own + '/prospective-full.book-model.json')
const before = parseGoalBookRuntimeModel(beforeRaw), after = parseGoalBookRuntimeModel(afterRaw)
const strict = read(own + '/baseline-active-biology.report.json').subjects.find((s: any) => s.subject === 'biologie').strictCompleteGoalIds
assert.equal(strict.length, 40)
const allowedLower = new Set(['DE-BY', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST'])
const scopes = []
for (const source of after.source.compositionViewSources) {
  const scope = source.scope
  const baseFilter = { jurisdiction: scope.jurisdiction, stage: scope.stage, durationModel: scope.durationModel ?? null, courseProfile: scope.courseProfile ?? null }
  const candidates = resolveGoalBookPersonalizationScope(after, baseFilter).status === 'partial' && baseFilter.durationModel === null
    ? ['G8', 'G9'].map(durationModel => ({ ...baseFilter, durationModel })).filter(filter => resolveGoalBookPersonalizationScope(after, filter).status === 'complete')
    : [baseFilter]
  assert.ok(candidates.length, 'No complete native source scope')
  for (const filter of candidates) {
    const resolved = resolveGoalBookPersonalizationScope(after, filter)
    assert.equal(resolved.status, 'complete')
    const compiled = await compileGoalBookPersonalizedProjection(read(source.path), after, resolved.scope)
    assert.ok(compiled.projection && compiled.suppliedProjection)
    assert.ok(!compiled.findings.some((f: any) => f.severity === 'error'))
    const oldRows = filterGoalBookPages({ model: before, query: '', chapterId: null, applicability: filter })
    const newRows = filterGoalBookPages({ model: after, query: '', chapterId: null, applicability: filter })
    const oldIds = new Set(oldRows.map(p => p.goalId)), newIds = new Set(newRows.map(p => p.goalId))
    const added = [...newIds].filter(id => !oldIds.has(id)), removed = [...oldIds].filter(id => !newIds.has(id))
    assert.deepEqual(removed, [], 'An existing current source-view target disappeared')
    assert.ok(added.every(id => meta.goalIds.includes(id)), 'Unexpected extra target')
    const fissionAllowed = scope.stage === 'SekI' && allowedLower.has(scope.jurisdiction)
      || scope.jurisdiction === 'DE-HE' && scope.stage === 'SekII' && scope.courseProfile === 'LK'
    assert.equal(newIds.has(fission), fissionAllowed, 'Fission leaked to unsupported source scope')
    if (scope.jurisdiction === 'DE-BY' && scope.stage === 'SekI') assert.ok(newIds.has(bau))
    if (scope.jurisdiction === 'DE-TH') assert.ok(!newIds.has(fission), 'TH source does not require bacterial reproduction here')
    const focus = oldRows.slice(0, 3).map(p => p.goalId)
    assert.deepEqual(filterGoalBookPages({ model: after, query: '', chapterId: null, applicability: filter, goalIds: focus }).map(p => p.goalId), focus)
    scopes.push({ scope, filter, oldCount: oldRows.length, newCount: newRows.length, added, removed,
      bauVisible: newIds.has(bau), fissionVisible: newIds.has(fission), nativePersonalizedProjectionValid: true,
      priorFocusOrderPreserved: true, priorTargetsPreserved: true })
  }
}
const stripGlobalLayout = (value: any): any => Array.isArray(value) ? value.map(stripGlobalLayout)
  : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint', 'goalFingerprint'].includes(key))
    .map(([key, child]) => [key, stripGlobalLayout(child)])) : value
const pages = beforeRaw.pages.map((p: any) => {
  const q = afterRaw.pages.find((r: any) => r.goalId === p.goalId)
  assert.ok(q)
  const changedFields = Object.keys(p).filter(key => JSON.stringify(p[key]) !== JSON.stringify(q[key]))
  return { goalId: p.goalId, title: p.title, previousStrict: strict.includes(p.goalId),
    beforePage: p.pageNumber, afterPage: q.pageNumber, changedFields,
    beforeGoalFingerprint: p.goalFingerprint, afterGoalFingerprint: q.goalFingerprint,
    beforePageFingerprint: p.pageFingerprint, afterPageFingerprint: q.pageFingerprint,
    goalFingerprintChanged: p.goalFingerprint !== q.goalFingerprint,
    pageFingerprintChanged: p.pageFingerprint !== q.pageFingerprint,
    payloadOutsideGlobalLayoutChanged: JSON.stringify(stripGlobalLayout(p)) !== JSON.stringify(stripGlobalLayout(q)),
    detailedDeltas: Object.fromEntries(changedFields.filter(key => !['pageFingerprint', 'goalFingerprint'].includes(key)).map(key => [key, { before: p[key], after: q[key] }])) }
})
const strictPages = pages.filter((r: any) => r.previousStrict)
assert.equal(strictPages.length, 40)
const canonical = read(meta.canonicalPath), goals = new Map(canonical.goals.map((g: any) => [g.id, g]))
const missing: any[] = [], cycles: any[] = []
for (const edge of ['requires', 'contains']) {
  const done = new Set(), active = new Set()
  const visit = (id: string, path: string[]) => {
    if (active.has(id)) { cycles.push({ edge, path: [...path, id] }); return }
    if (done.has(id)) return
    active.add(id)
    const goal: any = goals.get(id)
    for (const child of goal?.[edge] ?? []) {
      if (!goals.has(child)) missing.push({ edge, goalId: id, child })
      else visit(child, [...path, id])
    }
    active.delete(id); done.add(id)
  }
  for (const id of goals.keys()) visit(id as string, [])
}
assert.deepEqual(missing, []); assert.deepEqual(cycles, [])
const result = { status: 'inactive_author_native_context_evidence', beforeBookDigest: beforeRaw.digest, afterBookDigest: afterRaw.digest,
  actualCurrentStrictGoalCount: 40, oldPages: 364, proposedPages: 365, sourceScopes: scopes,
  strictPageComparison: strictPages, allExistingPageComparison: pages,
  summary: { nativeResolvedScopes: scopes.length, oldStrictPreservedGoalFingerprints: strictPages.filter((r: any) => !r.goalFingerprintChanged).length,
    strictChangedFullAtlasPages: strictPages.filter((r: any) => r.pageFingerprintChanged).map((r: any) => r.goalId),
    strictPayloadChangesOutsideGlobalLayout: strictPages.filter((r: any) => r.payloadOutsideGlobalLayoutChanged).map((r: any) => r.goalId),
    strictPaginationChanges: strictPages.filter((r: any) => r.beforePage !== r.afterPage).map((r: any) => r.goalId),
    allCurrentSourceTargetsRetained: true, missingEdges: missing, cycles },
  goalContexts: meta.goalIds.map((id: string) => ({ goal: goals.get(id),
    parents: canonical.goals.filter((g: any) => g.contains.includes(id)),
    prerequisites: canonical.goals.filter((g: any) => (goals.get(id) as any).requires.includes(g.id)),
    dependents: canonical.goals.filter((g: any) => g.requires.includes(id)) })),
  scientificReview: 'pending independent actual source/prerequisite/D/P/V acceptance; old unchanged reviews are preserved',
  BYExponentialGrowthClosed: false, STCultureCurvesClosed: false, humanApproval: false, activeWrites: 0 }
writeFileSync(resolve(root, own, 'native-views-and-context.actual.author.receipt.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result.summary))
