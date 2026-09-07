import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const auditRoot = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(auditRoot, '../../../../../..')
const goalId = 'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f'
const oldSha = 'f29875f092c567d801c1afc690502ea420990cf8e8d2d5bae9026611792fbcac'
const newSha = '945377b827f576d3033fe21316f73baeedffb63dc1f6a2417048012889f7a70b'
const generated = path.join(root, 'tmp/goal-visualizations', goalId, 'generated')
const original = path.join(root, 'curricula/DE/Gymnasium/visualizations/physik', goalId)
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const writeOnce = (relative, bytes) => {
  const destination = path.join(auditRoot, relative)
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  if (fs.existsSync(destination)) assert.deepEqual(fs.readFileSync(destination), bytes, `Archive drift: ${relative}`)
  else fs.writeFileSync(destination, bytes, { flag: 'wx' })
  return { path: path.relative(root, destination), sha256: sha(bytes) }
}
const copy = (source, relative, expectedSha) => {
  const bytes = fs.readFileSync(source)
  if (expectedSha) assert.equal(sha(bytes), expectedSha)
  return writeOnce(relative, bytes)
}
const version1 = `${goalId}.generated.2026-09-07T12-42-57-631Z`
const version2 = `${goalId}.generated.2026-09-07T12-49-29-234Z`
assert.equal(sha(fs.readFileSync(path.join(generated, `${version2}.jpg`))), newSha)
const goal = readJson('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json').goals.find(({ id }) => id === goalId)
const qa = readJson('curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json').records.find((row) => row.goalId === goalId)
assert.ok(goal && qa)
assert.equal(qa.assetSha256, `sha256:${oldSha}`, 'Run this bounded snapshot before adoption')
const archived = [
  copy(path.join(original, `${goalId}.jpg`), 'previous/goal.jpg', oldSha),
  copy(path.join(original, 'prompt.de.md'), 'previous/prompt.de.md'),
  writeOnce('previous/goal-and-qa.json', Buffer.from(`${JSON.stringify({ goal, qa }, null, 2)}\n`)),
  copy(path.join(generated, `${version1}.jpg`), 'rejected-v1/goal.jpg'),
  copy(path.join(auditRoot, 'correction.prompt.de.md'), 'rejected-v1/requested-prompt.de.md'),
  copy(path.join(generated, `${version1}.image-reconstruction-prompt.de.md`), 'rejected-v1/image-reconstruction-prompt.de.md'),
]
writeOnce('archive-receipt.json', Buffer.from(`${JSON.stringify({
  schemaVersion: 1,
  goalId,
  authority: 'AI candidate; no human approval',
  originalRejection: 'B040s image follow-up: missing visible electrical connection, unspecified retarding-field comparison and unqualified E_kin notation.',
  firstAttemptRejection: 'Root visually rejected V1: requested conducting connection and collection polarity still not correct. Not imported.',
  acceptedCandidateSha256: newSha,
  candidateReviewPath: path.relative(root, path.join(auditRoot, 'independent-v2-review.json')),
  archived,
}, null, 2)}\n`))
console.log('Archived exact pre-import goal/image/QA and rejected V1; no live publication changed.')
