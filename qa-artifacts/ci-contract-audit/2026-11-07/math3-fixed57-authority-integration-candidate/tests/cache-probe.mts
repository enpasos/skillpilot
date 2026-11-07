import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, realpathSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { evaluateCurrentVisualizationGate, hasCompleteCurrentVisualizationScope } from '/home/enpasos/projects/skillpilot/app/scripts/lib/curriculumVisualizationValidation.ts'
import type { LearningGoal } from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes.ts'
const root = '/home/enpasos/projects/skillpilot'
const path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const source: { landscapeId: string; goals: LearningGoal[] } = JSON.parse(readFileSync(root + '/' + path, 'utf8'))
const id = 'ce198bc9-b014-52ba-814f-25cc3e020668'
const goal = source.goals.find(g => g.id === id)!
const ledger = JSON.parse(readFileSync(root + '/curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json', 'utf8'))
const row = ledger.records.find((r: { goalId: string }) => r.goalId === id)
const capture = () => evaluateCurrentVisualizationGate({ repositoryRoot: root, landscapePath: path, landscapeId: source.landscapeId,
  subject: 'mathematik', goalById: new Map([[id, goal]]), currentGoalIds: new Set([id]), records: [row] })
const indexPath = process.argv[2]
assert.ok(realpathSync(indexPath).startsWith('/dev/shm/skillpilot-fixed57-') && indexPath.endsWith('/cache-index.json'))
const raw = readFileSync(indexPath)
assert.equal(createHash('sha256').update(raw).digest('hex'), '46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0')
const first = capture(); assert.equal(hasCompleteCurrentVisualizationScope(first), true)
try {
  writeFileSync(indexPath, Buffer.concat([raw, Buffer.from('\n')]))
  const changed = capture(); assert.deepEqual(changed.readyGoalIds, [])
  assert.match(changed.issues.join(' '), /External visualization context index changed/u)
  assert.equal(hasCompleteCurrentVisualizationScope(changed), false)
} finally { writeFileSync(indexPath, raw) }
const restored = capture(); assert.equal(hasCompleteCurrentVisualizationScope(restored), true)
assert.equal(hasCompleteCurrentVisualizationScope(structuredClone(restored)), false)
console.log('Genuine native cached authority: initial pass, changed-index denial, exact restored pass, copied opaque scope denial; only private RAM inode mutated.')
