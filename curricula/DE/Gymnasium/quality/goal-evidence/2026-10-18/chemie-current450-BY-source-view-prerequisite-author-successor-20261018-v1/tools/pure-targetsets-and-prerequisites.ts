import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertLearningGoal } from '../../../../../../../../app/src/goalTypes'
import { applyCompositionViewProjection } from '../../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { buildDirectChildrenMap, getRenderedChildIds } from '../../../../../../../../app/src/utils/treeProjectionRuntime'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const old = base + 'chemie-current450-BY-source-view-binding-author-20261018-v1/'
const out = base + 'chemie-current450-BY-source-view-prerequisite-author-successor-20261018-v1/'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const pin = (path: string) => ({ path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') })
const raw = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const canonical = new Map<string, any>(raw.goals.map((g: any) => [g.id, g]))
const entry = { meta: raw, goals: raw.goals.map((g: any) => convertLearningGoal(g, { landscapeId: raw.landscapeId })) }
const inputs = read(old + 'INPUTS.finite62-whole-sources-current-goals-and-active-DP-bindings.json')
const matrix = read(old + 'MATRIX.by62-source-target-closure-and-placement.author.json')
const candidatePath = out + 'candidate.de-by-lk.current-pilot.view.json'
const originalView = read(inputs.currentView.path)
const candidate = read(candidatePath)
assert.deepEqual(candidate.scope, originalView.scope)
const memory = (g: any) => g.nodeKind === 'memory' || g.tags?.some((t: string) => t === 'memorization' || t.startsWith('srs-deck:'))
function project(view: any) {
  const projected = applyCompositionViewProjection([entry], normalizeCompositionView(view))[0]
  const byId = new Map(projected.goals.map((g: any) => [g.id, g]))
  const children = buildDirectChildrenMap(byId)
  const pending = projected.goals.filter((g: any) => g.tags?.includes('root')).map((g: any) => g.id)
  const visited = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (visited.has(id)) continue
    visited.add(id)
    pending.push(...getRenderedChildIds(id, byId, children))
  }
  const leaves = [...visited].filter(id => canonical.has(id) && !canonical.get(id).contains?.length).sort()
  return { ordinary: leaves.filter(id => !memory(canonical.get(id))), memory: leaves.filter(id => memory(canonical.get(id))) }
}
function closure(id: string, visited = new Set<string>()): string[] {
  assert(!visited.has(id), `contains cycle ${id}`)
  const goal = canonical.get(id)
  assert(goal, `missing prerequisite ${id}`)
  if (!goal.contains?.length) return [id]
  return [...new Set<string>(goal.contains.flatMap((child: string) => closure(child, new Set([...visited, id]))))]
}
const before = project(originalView)
const after = project(candidate)
const diff = (left: string[], right: string[]) => left.filter(id => !right.includes(id))
const added = diff(after.ordinary, before.ordinary)
const removed = diff(before.ordinary, after.ordinary)
const memoryAdded = diff(after.memory, before.memory)
const memoryRemoved = diff(before.memory, after.memory)
assert.equal(added.length, 41)
assert.equal(removed.length, 0)
assert.equal(memoryAdded.length, 3)
assert.equal(memoryRemoved.length, 0)
const targetSet = new Set([...after.ordinary, ...after.memory])
const missingPrerequisiteAtoms = added.flatMap(id => (canonical.get(id).requires ?? []).flatMap((required: string) => closure(required).filter(atom => !targetSet.has(atom)).map(atom => ({ goalId: id, prerequisiteId: required, missingAtom: atom }))))
assert.equal(missingPrerequisiteAtoms.length, 0)
const sourceRows = matrix.rows.map((row: any) => ({ sourceGoalId: row.sourceGoalId, closureIds: row.currentTargetAtomicClosureIds, allVisible: row.currentTargetAtomicClosureIds.every((id: string) => targetSet.has(id)) }))
assert.equal(sourceRows.length, 62)
assert(sourceRows.every((row: any) => row.allVisible))
const records = readFileSync(inputs.existingMemoryRecords.path, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
const requiredMemory = records.filter((row: any) => added.includes(row.goalId) && row.status === 'memory_required').map((row: any) => ({ goalId: row.goalId, memoryGoalIds: row.memoryGoalIds, visibleMemoryGoalIds: row.memoryGoalIds.filter((id: string) => targetSet.has(id)), meetsExistingVisibilityContract: row.memoryGoalIds.some((id: string) => targetSet.has(id)) }))
// AGENTS 7.2 and memoryCardReview.ts require at least one referenced unit in
// the same view; narrow recall units satisfy this without adding a broad deck.
assert(requiredMemory.every((row: any) => row.meetsExistingVisibilityContract))
const result = { role: 'Actual pure runtime projection of explicit author scope successor; independent source/placement review still pending', method: 'Unchanged applyCompositionViewProjection and rendered-tree traversal; canonical prerequisite closures checked without adding or changing any requires edge or inferring roles', inputs: [pin(inputs.currentView.path), pin(candidatePath), pin('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')], counts: { ordinaryBefore: before.ordinary.length, ordinaryAfter: after.ordinary.length, ordinaryAdded: added.length, memoryAdded: memoryAdded.length, removed: 0, sourceClosuresVisible: sourceRows.length, missingPrerequisiteAtoms: missingPrerequisiteAtoms.length }, before, after, ordinaryAdded: added, memoryAdded, requiredMemory, sourceRows, normalWrites: 0, newScientificVotes: 0, wholeSourceCreditPromotions: 0 }
writeFileSync(out + 'DELTA.actual-pure-projection-and-prerequisite-closure.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result.counts))
