import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertLearningGoal } from '../../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../../app/src/utils/treeProjectionRuntime'
import { goalMatchesFilters } from '../../../../../../../../app/src/utils/goalFilters'

const dir = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-BB-BE-two-foundation-placement-author-successor-20261018-v1/'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const pin = (path: string) => ({ path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') })
const author = read(dir + 'AUTHOR.two-explicit-foundation-target-placements.pending.json')
const input = read(dir + 'INPUT.whole-current-two-foundations-P-M-and-existing-memory-goals.json')
const raw = read(input.canonical.path)
const canonical = new Map<string, any>(raw.goals.map((g: any) => [g.id, g]))
const entry = { meta: raw, goals: raw.goals.map((g: any) => convertLearningGoal(g, { landscapeId: raw.landscapeId })) }
const memoryRows = readFileSync(input.memoryDecisionFile.path, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
function project(view: any) {
  const projected = applyCompositionViewProjection([entry], normalizeCompositionView(view))[0]
  const byId = new Map(projected.goals.map((g: any) => [g.id, g]))
  const children = buildDirectChildrenMap(byId)
  const pending = projected.goals.filter((g: any) => g.tags?.includes('root')).map((g: any) => g.id)
  const seen = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (seen.has(id)) continue
    seen.add(id)
    pending.push(...getRenderedChildIds(id, byId, children))
  }
  return [...seen].filter(id => canonical.has(id) && !canonical.get(id).contains?.length && goalMatchesFilters(canonical.get(id), view.scope.courseProfile)).sort()
}
function closure(id: string, seen = new Set<string>()): string[] {
  assert(!seen.has(id), `contains cycle ${id}`)
  const goal = canonical.get(id)
  assert(goal, `missing goal ${id}`)
  return goal.contains?.length ? [...new Set<string>(goal.contains.flatMap((child: string) => closure(child, new Set([...seen, id]))))] : [id]
}
const rows = author.candidateViews.map((row: any) => {
  const old = read(row.normalBefore.path)
  const candidate = read(row.candidateAfter.path)
  assert.deepEqual(candidate.scope, old.scope)
  const before = project(old), after = project(candidate)
  const added = after.filter(id => !before.includes(id)), removed = before.filter(id => !after.includes(id))
  assert.equal(removed.length, 0)
  const missingPrerequisiteAtoms = added.flatMap(id => (canonical.get(id).requires ?? []).flatMap((required: string) => closure(required).filter(atom => !after.includes(atom)).map(atom => ({ goalId: id, prerequisite: required, missingAtom: atom }))))
  assert.equal(missingPrerequisiteAtoms.length, 0)
  for (const id of added) assert(canonical.get(id).applicability.jurisdiction.includes(candidate.scope.jurisdiction))
  const memory = memoryRows.filter((m: any) => added.includes(m.goalId) && m.status === 'memory_required').map((m: any) => ({ goalId: m.goalId, referenced: m.memoryGoalIds, visible: m.memoryGoalIds.filter((id: string) => after.includes(id)) }))
  assert(memory.every((m: any) => m.visible.length > 0))
  return { viewId: candidate.viewId, scope: candidate.scope, old: pin(row.normalBefore.path), candidate: pin(row.candidateAfter.path), beforeTargets: before.length, afterTargets: after.length, added, removed, missingPrerequisiteAtoms, memory }
})
assert.equal(rows.reduce((n: number, r: any) => n + r.added.length, 0), 7)
const result = { role: 'Pure stock projection, course filters, current authored target prerequisite closure and existing memory visibility; no AP/compiler or normal write', counts: { views: 4, addedTargetTuples: 7, removedTargets: 0, missingPrerequisiteAtoms: 0, newScientificVotes: 0 }, rows }
writeFileSync(dir + 'CHECK.actual-pure-seven-target-tuples-and-existing-memory.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result.counts))
