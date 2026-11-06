import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import {
  normalizeCompositionView,
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
} from '../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { normalizeCanonicalLandscape } from '../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { goalMatchesFilters } from '../../../app/src/utils/goalFilters.ts'
import { applyCompositionViewProjection } from '../../../app/src/utils/compositionViewRuntime.ts'

const directory = 'docs/dev/ci-graph-repairs/'
const load = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const binding = (path: string) => ({ path, rawSha256: sha(readFileSync(path)) })
const proposalPath = directory + 'informatics-whole-exam-foundation-successor-proposal-2026-11-06.json'
const hypothesisPath = directory + 'informatics-whole-exam-foundation-successor-derived-scope-hypothesis-2026-11-06.json'
const originalReviewPath = directory + 'informatics-whole-exam-foundation-successor-independent-review-2026-11-06.json'
const proposal = load(proposalPath)
const hypothesis = load(hypothesisPath)
const review = load(originalReviewPath)
assert.equal(sha(readFileSync(proposalPath)), 'c4b30c730bdbe0b30337ebba92dab7acffdfb5eb34b2c9c489b310ffdc06de05')
assert.equal(sha(readFileSync(originalReviewPath)), '4f8747d79b8a42de0e3c65c0b684d1719b43dc58f7d742ae023ef1c7f3634fa4')
const hypothesisBinding = review.inputArtifacts.find((row: any) => row.path === hypothesisPath)
assert(hypothesisBinding)
assert.equal(sha(readFileSync(hypothesisPath)), hypothesisBinding.rawSha256)
const originalBytes = execFileSync('git', ['show', 'd9f42e6f0729d7e76a0d740482c1a8444da08e76:' + proposal.source.path])
assert.equal(sha(originalBytes), proposal.source.sha256)
const before = JSON.parse(originalBytes.toString('utf8'))
const activeBytes = readFileSync(proposal.source.path)
assert.equal(sha(activeBytes), '93a653b110949ff410a73bd750b2a605a9ab0329fe1cd157f016869d848e1f7e')
const active = JSON.parse(activeBytes.toString('utf8'))
const maps = [before, active].map(document => new Map<string, any>(document.goals.map((goal: any) => [goal.id, goal])))

const universe = new Map()
for (const name of readdirSync('curricula/DE/Gymnasium/canonical').filter(name => name.endsWith('.json'))) {
  const document = load('curricula/DE/Gymnasium/canonical/' + name)
  if (document.landscapeId && Array.isArray(document.goals)) {
    universe.set(document.landscapeId, normalizeCanonicalLandscape(document))
  }
}
const normalizedActive = normalizeCanonicalLandscape(active)
const allGoals = [...universe.values()].flatMap(document => document.goals)
const allNormalized = normalizeCanonicalLandscape({ ...active, goals: allGoals })

function tree(document: any, view: any, filters: any) {
  const goals = document.goals.filter((goal: any) => goalMatchesFilters(goal, filters))
  const projected = applyCompositionViewProjection([{ meta: document, goals }], view)[0]
  const map = new Map<string, any>(projected.goals.map((goal: any) => [goal.id, goal]))
  const roots = projected.goals.filter((goal: any) => (goal.tags ?? []).includes('root'))
  function visit(id: string, seen = new Set<string>()): any {
    const goal = map.get(id)
    if (!goal) return null
    assert(!seen.has(id), 'Projected tree cycle: ' + id)
    const next = new Set([...seen, id])
    return {
      id: goal.id,
      title: goal.title,
      children: (goal.contains ?? []).map((child: string) => visit(child, next)).filter(Boolean),
    }
  }
  return roots.map((goal: any) => visit(goal.id))
}

const compiler: any[] = []
const rows: any[] = []
for (const viewPath of new Set<string>(hypothesis.rows.map((row: any) => row.viewPath))) {
  const relatedRows = hypothesis.rows.filter((row: any) => row.viewPath === viewPath)
  assert(relatedRows.every((row: any) => row.viewSha256 === sha(readFileSync(viewPath))))
  const view = normalizeCompositionView(load(viewPath))
  const result = compileCompositionView(view, normalizedActive, allNormalized, universe)
  const expected = hypothesis.compositionCompiler.find((row: any) => row.viewPath === viewPath)
  assert(expected)
  assert.deepEqual(result.findings, expected.after, viewPath + ': compiler findings changed')
  assert.equal(result.findings.length, 0, viewPath)
  compiler.push({ view: binding(viewPath), findings: result.findings })
  const roleSets = maps.map(map => collectCompositionProjectionRoleGoalIds(view.rootNodes, map))
  for (const expected of relatedRows) {
    const targets = roleSets.map((roles, index) => new Set([...roles.targetGoalIds].filter(
      id => goalMatchesFilters(maps[index].get(id), expected.filters),
    )))
    const added = [...targets[1]].filter(id => !targets[0].has(id))
    const removed = [...targets[0]].filter(id => !targets[1].has(id))
    assert.deepEqual(added, expected.added, viewPath + ': added targets')
    assert.deepEqual(removed, expected.removed, viewPath + ': removed targets')
    assert.equal(targets[0].size, expected.targetCount)
    assert.equal(targets[1].size, expected.targetCountAfter)
    const trees = [before, active].map(document => tree(document, view, expected.filters))
    const hashes = trees.map(value => sha(JSON.stringify(value)))
    assert.equal(hashes[0], expected.visibleTreeBeforeSha256)
    assert.equal(hashes[1], expected.visibleTreeAfterSha256)
    rows.push({
      viewPath,
      filters: expected.filters,
      targetCountBefore: targets[0].size,
      targetCountActive: targets[1].size,
      added,
      removed,
      activeTargetGoalIds: [...targets[1]],
      visibleTreeBeforeSha256: hashes[0],
      visibleTreeActiveSha256: hashes[1],
      matchesFrozenHypothesis: true,
    })
  }
}
assert.equal(compiler.length, 19)
assert.equal(rows.length, 35)
assert.equal(rows.filter(row => row.added.length || row.removed.length).length, 28)
assert.equal(sha(readFileSync(proposal.source.path)), sha(activeBytes))
const result = {
  status: 'PASS-active-source-native-projection-matches-frozen-hypothesis',
  activeSource: binding(proposal.source.path),
  originalBaseCommit: 'd9f42e6f0729d7e76a0d740482c1a8444da08e76',
  hypothesis: binding(hypothesisPath),
  verifier: binding(directory + 'verify_informatics_whole_exam_successor_active_projection.ts'),
  viewCount: compiler.length,
  scopeCount: rows.length,
  changedContexts: 28,
  unchangedContexts: 7,
  compiler,
  rows,
  maturityOrTaskApprovalClaimed: false,
}
writeFileSync('tmp/informatics-successor-active-projection.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ status: result.status, views: compiler.length, scopes: rows.length, changed: 28, unchanged: 7, compilerFindings: 0 }))
