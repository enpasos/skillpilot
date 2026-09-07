import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const auditRoot = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(auditRoot, '../../../../../..')
const plan = JSON.parse(fs.readFileSync(path.join(auditRoot, 'adoption-plan-v1.json'), 'utf8'))
const receipt = JSON.parse(fs.readFileSync(path.join(auditRoot, 'archive-before-adoption-v1/archive-receipt.json'), 'utf8'))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
// Preserve the sealed archive receipt and follow only its exact, hash-bound relocation.
const relocations = JSON.parse(fs.readFileSync(path.join(root, 'curricula/DE/Gymnasium/quality/goal-description-review/2026-09-07-ci-archive-relocations-v2.json'), 'utf8')).files
for (const artifact of [...receipt.archived, ...receipt.reviewBindings]) {
  const moved = relocations.find(row => row.from === artifact.path)
  if (moved) assert.equal(moved.sha256, artifact.sha256)
  assert.equal(sha(fs.readFileSync(path.join(root, moved?.to ?? artifact.path))), artifact.sha256, artifact.path)
}
const goals = JSON.parse(fs.readFileSync(path.join(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'), 'utf8')).goals
const targets = []
for (const item of plan.images.filter(row => row.image.endsWith('.png'))) {
  assert.ok(['2713980f-75d2-5455-a8cb-bcd3888c49a0', 'df7338ef-65ba-5ece-8aec-7f520dfe5710'].includes(item.goalId))
  const goal = goals.find(g => g.id === item.goalId)
  assert.equal(goal.resourceLinks.find(link => link.type === 'goal-visualization').url,
    '/assets/goal-visualizations/mathematik/' + item.goalId + '/' + item.goalId + '.png')
  for (const base of ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']) {
    const folder = path.join(root, base, 'mathematik', item.goalId)
    assert.equal(sha(fs.readFileSync(path.join(folder, item.goalId + '.png'))), item.newSha)
    const target = path.join(folder, item.goalId + '.jpg')
    if (fs.existsSync(target)) {
      assert.equal(sha(fs.readFileSync(target)), item.oldSha, 'Unexpected old file; refuse removal')
      targets.push(target)
    }
  }
}
// All exact paths, archive bytes and replacement copies are verified before any retirement.
for (const target of targets) fs.unlinkSync(target)
console.log(JSON.stringify({ removedObsoletePublishedCopies: targets.map(target => path.relative(root, target)), recoverableFrom: path.relative(root, path.join(auditRoot, 'archive-before-adoption-v1')) }, null, 2))
