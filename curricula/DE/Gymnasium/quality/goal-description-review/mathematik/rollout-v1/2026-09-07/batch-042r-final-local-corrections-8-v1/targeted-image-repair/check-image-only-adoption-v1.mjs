import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const base = path.dirname(fileURLToPath(import.meta.url))
const read = p => fs.readFileSync(p)
const json = p => JSON.parse(read(p))
const sha = b => createHash('sha256').update(b).digest('hex')
const ar = json(path.join(base, 'archive-before-import-v1/archive-receipt.json'))
const old = json(path.join(base, 'archive-before-import-v1/original-two-goals-and-qa.json'))
const now = json(old.canonical.path), qa = json(old.qa.path)
const ids = ar.approvedAssets.map(r => r.goalId)
const goalHash = new Map(old.allGoalHashes.map(r => [r.goalId, r.sha256]))
const qaHash = new Map(old.allQaHashes.map(r => [r.goalId, r.sha256]))
assert.deepEqual(now.goals.map(g => g.id), old.allGoalHashes.map(r => r.goalId))
assert.equal(sha(JSON.stringify(Object.fromEntries(Object.entries(now).filter(([k]) => k !== 'goals')))), old.canonicalMetadataSha256)
for (const goal of now.goals) {
  if (!ids.includes(goal.id)) { assert.equal(sha(JSON.stringify(goal)), goalHash.get(goal.id)); continue }
  const previous = old.goals.find(g => g.id === goal.id)
  assert.deepEqual(Object.fromEntries(Object.entries(goal).filter(([k]) => k !== 'resourceLinks')),
    Object.fromEntries(Object.entries(previous).filter(([k]) => k !== 'resourceLinks')), 'Only image metadata may change')
}
assert.equal(qa.records.length, old.allQaHashes.length)
for (const row of qa.records) if (!ids.includes(row.goalId)) assert.equal(sha(JSON.stringify(row)), qaHash.get(row.goalId), row.goalId)
for (const file of [...ar.files, ...ar.reviewBindings, ...old.unchangedSemanticBindings]) assert.equal(sha(read(file.path)), file.sha256, file.path)
const rootReview = json(path.join(base, 'root-image-counterreview-final2-v1.json'))
const checkedAssets = []
for (const item of ar.approvedAssets) {
  assert.equal(rootReview.reviews.find(r => r.goalId === item.goalId).sha256, item.sha256)
  assert.equal(rootReview.reviews.find(r => r.goalId === item.goalId).decision, 'pass')
  const row = qa.records.find(r => r.goalId === item.goalId)
  assert.equal(row.assetSha256, 'sha256:' + item.sha256)
  assert.equal(row.aiApproved, 'yes')
  assert.equal(row.aiApprovedAssetSha256, row.assetSha256)
  assert.equal(row.humanApproved, 'no')
  const ext = path.extname(item.image)
  for (const root of ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']) {
    const file = root + '/mathematik/' + item.goalId + '/' + item.goalId + ext
    assert.equal(sha(read(file)), item.sha256, file)
    checkedAssets.push(file)
  }
}
// Only the three exact, already archived JPG predecessors of the new native PNG
// may be retired. No glob, recursive directory deletion or unrelated asset.
const retired = []
if (process.argv.includes('--retire-archived-jpg')) {
  const id = 'f4935b24-d8a9-5eb7-a5eb-6d34a9e09b2d'
  const priorHash = old.qaRows.find(r => r.goalId === id).assetSha256.slice(7)
  assert.equal(sha(read(path.join(base, 'archive-before-import-v1', id, 'previous/goal.jpg'))), priorHash)
  for (const root of ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']) {
    const file = root + '/mathematik/' + id + '/' + id + '.jpg'
    if (fs.existsSync(file)) {
      assert.equal(sha(read(file)), priorHash)
      fs.unlinkSync(file)
      retired.push(file)
    }
  }
}
console.log(JSON.stringify({
  schemaVersion: 1, checkedAt: new Date().toISOString(),
  canonicalSha256: sha(read(old.canonical.path)), qaSha256: sha(read(old.qa.path)),
  goalIds: ids, changes: 'Only resourceLinks of two goals and their two image-QA rows',
  unrelatedGoalsAndQaUnchanged: true, semanticBindingsUnchanged: true,
  humanApprovalsAdded: 0, checkedAssets, retired,
  recovery: 'All old source images, metadata and failed attempts remain hash-bound in archive-before-import-v1.',
}, null, 2))
