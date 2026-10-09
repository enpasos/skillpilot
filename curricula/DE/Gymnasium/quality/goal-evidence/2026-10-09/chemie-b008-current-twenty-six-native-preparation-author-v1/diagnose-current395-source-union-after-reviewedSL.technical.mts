// SPDX-License-Identifier: Apache-2.0
// Read-only diagnostic of the failed ordinary atlas count, never a substitute gate.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sourceAtlasDescendants, sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url))
const out = resolve(own, 'source-union-diagnosis-after-reviewedSL')
const bindings = new Map<string, any>()
const bind = (path: string) => { const bytes = readFileSync(path); const result = { path: relative(root, path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }; bindings.set(result.path, result); return result }
const read = (path: string) => { bind(path); return JSON.parse(readFileSync(path, 'utf8')) }
const write = (name: string, value: any) => { const path = resolve(out, name); assert.ok(!existsSync(path)); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2) + '\n'); return bind(path) }
const configPath = resolve(own, '../chemie-b008-sl-nine-operative-source-review-root-v1/whole395-with-existing32-and-reviewedSL.normal-probe.config.json')
const config = read(configPath), canonical = read(resolve(root, config.landscapePath)), ledger = read(resolve(root, config.semanticKindLedgerPath))
const goals = new Map<string, any>(canonical.goals.map((goal: any) => [goal.id, goal]))
for (const decision of ledger.decisions) assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(goals.get(decision.goalId)))
const atoms = new Set<string>(ledger.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
assert.equal(atoms.size, 395)
const landscape = normalizeCanonicalLandscape(canonical)
const fallbacks = config.fallbackViewPaths.map((path: string) => {
  const view = read(resolve(root, path))
  assert.deepEqual(compileCompositionView(view, landscape).findings.filter((f: any) => f.severity === 'error'), [])
  return { path, view, targetGoalIds: collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(landscape.goals.map((g: any) => [g.id, g]))).targetGoalIds }
})
const records: any[] = [], union = new Set<string>(), mapped = new Set<string>(), unresolved: any[] = []
for (const mappingPath of config.mappingPaths) {
  const mapping = read(resolve(root, mappingPath)), extraction = read(resolve(root, mapping.sourceExtractionPath))
  assert.equal(mapping.targetLandscapeId, canonical.landscapeId)
  const sourceGoals = new Map<string, any>(extraction.sourceGoals.map((goal: any) => [goal.id, goal]))
  const passages = new Map<string, any>(extraction.passages.map((p: any) => [p.id, p]))
  assert.equal(mapping.decisions.length, sourceGoals.size)
  for (const decision of mapping.decisions) {
    assert.ok(decision.reviewer && decision.reviewedAt && decision.rationale)
    if (decision.decision !== 'mapped') continue
    const source = sourceGoals.get(decision.sourceGoalId), passage = passages.get(source.passageId) ?? {}
    const docs = extraction.sourceDocuments ?? [extraction.sourceDocument]
    const keys = [...new Set([source.sourceDocumentKey, ...(source.tags ?? []).filter((tag: string) => tag.startsWith('sourceDocument:')).map((tag: string) => tag.slice('sourceDocument:'.length)), passage.sourceDocumentKey].filter(Boolean))]
    assert.ok(keys.length <= 1)
    const matches = keys.length ? docs.filter((d: any) => d.key === keys[0]) : docs
    assert.equal(matches.length, 1)
    const document = matches[0], levels = [source, passage, document, extraction]
    const stage = sourceAtlasFacet(levels, 'stage'), course = sourceAtlasFacet(levels, 'courseProfile')
    const scoped = course !== null && stage?.length === 1 && (stage[0] === 'SekI' || course.length > 0)
    if (!scoped) unresolved.push({ mappingPath, sourceGoalId: source.id, stage, courseProfile: course })
    for (const rawTarget of decision.canonicalGoalIds) {
      const target = rawTarget.replace(canonical.landscapeId + ':', '')
      for (const goalId of sourceAtlasDescendants(target, goals, atoms, canonical.landscapeId)) {
        mapped.add(goalId)
        const ordinaryScopes = scoped && stage ? (stage[0] === 'SekI' ? [''] : course!).map((profile: string) => `${extraction.jurisdiction}/${stage[0]}/${profile}`) : stage?.[0] === 'SekII' && course?.length === 0 ? fallbacks.filter((f: any) => f.view.scope.jurisdiction === extraction.jurisdiction && f.targetGoalIds.has(goalId)).map((f: any) => `${extraction.jurisdiction}/SekII/${f.view.scope.courseProfile}`) : []
        if (ordinaryScopes.length) union.add(goalId)
        records.push({ goalId, mappingPath, sourceExtractionPath: mapping.sourceExtractionPath, sourceGoalId: source.id, sourceSpan: source.sourceSpan, wholeSourceGoal: source, wholePassage: passage, wholeDocument: document, wholeDecision: decision, mappedTargetGoalId: target, coverage: goalId === target ? 'direct' : 'inherited', stage, courseProfile: course, ordinaryScopes })
      }
    }
  }
}
assert.equal(unresolved.length, config.expectedUnresolvedScopeDecisionCount)
assert.equal(union.size, 354, 'Must match the actual unchanged ordinary compiler failure, never lower its expected count')
const missing = [...atoms].filter(id => !union.has(id)).sort().map(goalId => ({ goalId, wholeGoal: goals.get(goalId), reason: !mapped.has(goalId) ? 'no-mapped-source-route-in-current-normal-config' : 'existing-routes-have-no-resolved-ordinary-source-scope', currentMappedSourceRoutes: records.filter(row => row.goalId === goalId), currentImmediateParents: canonical.goals.filter((goal: any) => (goal.contains ?? []).includes(goalId)).map((goal: any) => ({ id: goal.id, title: goal.title, extendedData: goal.extendedData })) }))
const routineInput = read(resolve(own, 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json'))
const routineIds = new Set(routineInput.routineBodies.map((row: any) => row.wholeGoal.id))
const report = { schemaVersion: 1, role: 'Technical read-only route diagnosis of the ordinary Source-supported atlas goal count changed 354 !== 395 failure', actualOrdinaryConfig: bind(configPath), helperAPIs: ['sourceAtlasDescendants', 'sourceAtlasFacet', 'compileCompositionView', 'collectCompositionProjectionRoleGoalIds'], actualCompiledUnionMatchesOrdinaryFailure: true, gateExpectedCountPreserved: config.expectedCurricularAtomicGoalCount, actualDiagnosticSourceSupportedCount: union.size, wholeCurricularAtomCount: atoms.size, actualUnresolvedSourceDecisionCount: unresolved.length, missingCount: missing.length, missingMappedCount: missing.filter(m => mapped.has(m.goalId)).length, missingUnmappedCount: missing.filter(m => !mapped.has(m.goalId)).length, missingRoutine26Count: missing.filter(m => routineIds.has(m.goalId)).length, supportedGoalIds: [...union].sort(), missing, allCurrentRouteWitnessesForMissing: records.filter(r => !union.has(r.goalId)), inputBindings: [...bindings.values()], thisIsNotAnAlternativeAtlasValidator: true, sourceWholeApproval: false, nativeApproval: false, strictGain: 0, activeWrites: [], humanApproval: false }
const declaration = write('actual-forty-one-missing-current-source-routes.neutral-diagnosis.json', report)
console.log(JSON.stringify({ report: declaration, actualCount: union.size, expectedCount: atoms.size, missing: missing.map(m => ({ goalId: m.goalId, title: m.wholeGoal.title, reason: m.reason, routine26: routineIds.has(m.goalId), existingRouteCount: m.currentMappedSourceRoutes.length })) }))
