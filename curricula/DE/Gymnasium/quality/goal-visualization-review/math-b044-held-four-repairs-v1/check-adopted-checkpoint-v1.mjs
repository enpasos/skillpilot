import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

// Read-only by default. The optional retirement moves exactly three verified,
// already-archived obsolete JPG copies; it never edits canonical/QA ledgers.
const base = path.dirname(fileURLToPath(import.meta.url))
const json = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const sha = p => 'sha256:' + createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const equal = (a, b, label) => assert.deepEqual(a, b, label)
const strip = (v, keys) => Object.fromEntries(Object.entries(v).filter(([k]) => !keys.includes(k)))
const lp = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const qp = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const kp = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const planPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-044-spatial-geometry-vectors-and-matrix-entry-20-v1/prerequisite-change-plan-v2.json'
const plan = json(planPath), adoption = json(path.join(base, 'adoption-plan-v1.json'))
const beforePath = path.join(base, 'before-v1/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json.snapshot')
const before = json(beforePath), now = json(lp)
const archive = json(path.join(base, 'before-v1/receipt.json'))
// The original receipt is immutable. Follow only the explicitly hash-bound
// relocation of its whole-landscape before-image; other archive paths stay exact.
const relocation = json('curricula/DE/Gymnasium/quality/goal-description-review/2026-09-07-ci-archive-relocations-v1.json').files.find(f => path.resolve(f.to) === beforePath)
assert(relocation && relocation.from + '.snapshot' === relocation.to)
equal(sha(beforePath), 'sha256:' + relocation.sha256, 'byte-identical archive relocation')
for (const f of archive.files) equal(sha(f.path === relocation.from ? relocation.to : f.path), f.sha256, 'archived bytes: ' + f.path)
equal(sha(beforePath), plan.source.bytesSha256, 'reviewed source baseline')
equal(now.goals.map(g => g.id), before.goals.map(g => g.id), 'IDs/order')
equal(strip(now, ['goals']), strip(before, ['goals']), 'landscape metadata')
equal(plan.canonicalChangedGoals.length, 8, 'exact requires scope')
equal(adoption.items.length, 4, 'exact image scope')
const changedGoals = []
for (let i = 0; i < before.goals.length; i++) {
  const old = before.goals[i], goal = now.goals[i], expected = structuredClone(old)
  const req = plan.canonicalChangedGoals.find(r => r.goalId === goal.id)
  const image = adoption.items.find(r => r.goalId === goal.id)
  if (req) { equal(old.requires, req.beforeRequires, goal.id); expected.requires = req.afterRequires }
  if (image) {
    const links = expected.resourceLinks.filter(r => r.type === 'goal-visualization')
    equal(links.length, 1, goal.id)
    Object.assign(links[0], { url: '/assets/goal-visualizations/mathematik/' + goal.id + '/' + goal.id + path.extname(image.image), provider: image.provider, altText: image.alt })
  }
  equal(goal, expected, 'only explicitly reviewed fields: ' + goal.id)
  if (req || image) changedGoals.push({ goalId: goal.id, fields: [...(req ? ['requires'] : []), ...(image ? ['resourceLinks'] : [])] })
}
equal(changedGoals.length, 12, 'exact distinct canonical targets')
const oldKinds = json(path.join(base, 'before-v1/mathematik.semantic-kinds.json')), kinds = json(kp)
const expectedKinds = structuredClone(oldKinds)
equal(plan.semanticKindBindingChanges.length, 8)
for (const edit of plan.semanticKindBindingChanges) {
  const row = expectedKinds.decisions.find(r => r.goalId === edit.goalId)
  equal(row.semanticKind, 'curricularAtomic', edit.goalId)
  equal(row.sourceFingerprint, edit.beforeFingerprint, edit.goalId)
  row.sourceFingerprint = edit.afterFingerprint
}
equal(kinds, expectedKinds, 'only eight classification-preserving sourceFingerprint changes')
const unchangedLedgers = [
  ['before-v1/atomicity.jsonl', 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl'],
  ['before-v1/memory.jsonl', 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl'],
].map(([old, current]) => { equal(sha(path.join(base, old)), sha(current), 'unchanged A/M: ' + current); return { path: current, digest: sha(current) } })
const oldQa = json(path.join(base, 'before-v1/mathematik.qa.json')), qa = json(qp)
equal(strip(oldQa, ['records']), strip(qa, ['records']), 'QA outer metadata unchanged')
equal(qa.records.map(r => r.goalId), oldQa.records.map(r => r.goalId), 'QA IDs/order')
const qaAllowed = ['imageUrl', 'publicAssetPath', 'canonicalAssetPath', 'assetSha256', 'umlautsCorrectChatGpt', 'contentApprovedChatGpt', 'humanApproved', 'humanIssueIdentified', 'humanIssueDescription', 'chatGptReviewedAt', 'chatGptReviewer', 'chatGptNotes', 'humanReviewedAt', 'humanReviewer', 'aiApproved', 'aiApprovedAssetSha256', 'aiReviewedAt', 'aiReviewer', 'aiNotes']
for (let i = 0; i < qa.records.length; i++) {
  const row = qa.records[i], old = oldQa.records[i], image = adoption.items.find(r => r.goalId === row.goalId)
  if (!image) { equal(row, old, 'unrelated QA: ' + row.goalId); continue }
  equal(strip(row, qaAllowed), strip(old, qaAllowed), 'no new semantic QA binding: ' + row.goalId)
  equal(row.assetSha256, 'sha256:' + image.sha); equal(row.aiApprovedAssetSha256, row.assetSha256)
  equal(row.aiApproved, 'yes'); equal(row.humanApproved, 'no'); equal(row.humanReviewedAt, null)
  assert(row.aiReviewedAt && row.aiReviewer && row.aiNotes, 'actual existing reviewer provenance')
}
const roots = [
  ['source', 'curricula/DE/Gymnasium/visualizations'],
  ['frontend', 'app/public/assets/goal-visualizations'],
  ['backend', 'backend/src/main/resources/static/assets/goal-visualizations'],
]
const assets = []
for (const item of adoption.items) {
  const ext = path.extname(item.image), expected = 'sha256:' + item.sha
  equal(sha(item.image), expected)
  equal(sha(path.join(base, 'accepted-v1', item.goalId + ext)), expected)
  for (const [role, root] of roots) {
    const file = root + '/mathematik/' + item.goalId + '/' + item.goalId + ext
    equal(sha(file), expected, file); assets.push({ role, path: file, digest: expected })
  }
}
const goalMap = new Map(now.goals.map(g => [g.id, g]))
const dagChecks = ['requires', 'contains'].map(edge => {
  const visiting = new Set(), visited = new Set()
  function visit(id) {
    assert(goalMap.has(id), 'unresolved ' + edge + ' reference: ' + id)
    assert(!visiting.has(id), 'cycle in ' + edge + ': ' + id)
    if (visited.has(id)) return
    visiting.add(id); for (const child of goalMap.get(id)[edge] || []) visit(child); visiting.delete(id); visited.add(id)
  }
  for (const id of goalMap.keys()) visit(id)
  return { edge, checkedGoals: visited.size, cycles: 0, unresolvedReferences: 0 }
})
const id = 'd6b74b15-1cbc-512b-a160-0f40aecafe8c'
const oldImage = path.join(base, 'before-v1', id, id + '.jpg')
const oldDigest = oldQa.records.find(r => r.goalId === id).assetSha256
equal(sha(oldImage), oldDigest, 'original recoverable archive')
const retired = []
// Resolve and verify every target before moving the first one.
const targets = roots.map(([role, root]) => {
  const from = root + '/mathematik/' + id + '/' + id + '.jpg'
  const to = path.join(base, 'retired-active-jpg-v1', role, id + '.jpg')
  if (fs.existsSync(from)) { equal(sha(from), oldDigest, from); assert(!fs.existsSync(to), 'refuse overwrite: ' + to) }
  else if (fs.existsSync(to)) equal(sha(to), oldDigest, to)
  else assert(false, 'neither live predecessor nor retirement copy exists: ' + from)
  return { from, to, digest: oldDigest }
})
if (process.argv.includes('--retire-archived-jpg')) for (const item of targets) {
  if (fs.existsSync(item.from)) { fs.mkdirSync(path.dirname(item.to), { recursive: true }); fs.renameSync(item.from, item.to) }
  equal(sha(item.to), item.digest); assert(!fs.existsSync(item.from)); retired.push(item)
}
console.log(JSON.stringify({
  schemaVersion: 1, checkedAt: new Date().toISOString(), reviewerAgent: '/root/goal_book_ci_integration',
  scope: 'Technical delta/integrity only; no new D/P, image-content, atomicity or memory approval.',
  sourceDigest: sha(lp), qaDigest: sha(qp), semanticKindDigest: sha(kp), planDigest: sha(planPath),
  archivedFilesVerified: archive.files.length, changedGoals, semanticKindSourceBindings: 8,
  unchangedLedgers, assets, dagChecks, retired, retirementTargets: targets,
  humanApprovalsAdded: 0, unrelatedCanonicalFieldsUnchanged: true, unrelatedQaRecordsUnchanged: true,
}, null, 2))
