import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'

const root = process.cwd()
const candidate = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-preservation-candidate-v1')
const own = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-preservation-independent-review-b-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const canonical = read(resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))
const delta = read(resolve(candidate, 'canonical.delta.candidates.json'))
const goals = new Map<string, Record<string, unknown>>(canonical.goals.map((g: Record<string, unknown>) => [g.id, g]))
for (const g of delta.newGoals) goals.set(g.id, g)
for (const d of delta.parentContainsDeltas) {
  assert.deepEqual(goals.get(d.goalId)?.contains, d.before)
  goals.set(d.goalId, { ...goals.get(d.goalId), contains: d.after })
}
const atoms = new Set<string>([...goals].filter(([, g]) => Array.isArray(g.contains) && !g.contains.length).map(([id]) => id))
const results = delta.newGoals.map((g: { id: string }) => {
  const parent = delta.parentContainsDeltas.find((d: { after: string[] }) => d.after.includes(g.id)).goalId
  const direct = sourceAtlasDescendants(g.id, goals, atoms, canonical.landscapeId)
  const inherited = sourceAtlasDescendants(parent, goals, atoms, canonical.landscapeId)
  assert.deepEqual(direct, [g.id])
  assert.equal(inherited.includes(g.id), false)
  return { goalId: g.id, parentId: parent, direct, inheritedExcludesNewGoal: true }
})
const helperPath = 'app/scripts/goalBookSourceAtlasInputs.ts'
const receipt = {
  checkedAt: new Date().toISOString(),
  kind: 'independent targeted in-memory sourceAtlasDescendants check',
  helperPath,
  helperSha256: createHash('sha256').update(readFileSync(resolve(root, helperPath))).digest('hex'),
  actualHelperExecuted: true,
  results,
  runtimeProjectionChecked: false,
  currentStrictClosuresClaimed: 0,
}
writeFileSync(resolve(own, 'source-boundaries-check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify(receipt))
