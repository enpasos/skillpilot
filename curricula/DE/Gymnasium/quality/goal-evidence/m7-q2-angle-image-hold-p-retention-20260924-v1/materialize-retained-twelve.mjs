import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const sourceBase = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-first15-20260923-v1/image-bound-13-retained-after-902-hold'
const targetBase = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-angle-image-hold-p-retention-20260924-v1/retained-image-bound-twelve'
const heldGoalId = '18be713b-7d90-4f01-b60a-5582ac4df0e8'
const pins = {
  config: '98080b71447acb64c272fb4f284468551ee3c25f40dd48a361911d3287c838b3',
  review: '3de4bcf89ffff07db2cc9fe91ad610261af004200bd015bd81194a313979ec51',
}
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const pinned = async (path, expected) => {
  const bytes = await readFile(at(path))
  if (sha(bytes) !== expected) throw new Error(`Pinned source changed: ${path}`)
  return bytes
}
const output = async (path, bytes) => {
  if (process.argv.includes('--write')) {
    await mkdir(dirname(at(path)), { recursive: true })
    await writeFile(at(path), bytes)
  } else {
    const existing = await readFile(at(path))
    if (!existing.equals(bytes)) throw new Error(`Generated output differs: ${path}`)
  }
  console.log(`${path}: sha256:${sha(bytes)}`)
}

const sourceConfig = JSON.parse(await pinned(`${sourceBase}.config.json`, pins.config))
const lines = (await pinned(`${sourceBase}.review.jsonl`, pins.review)).toString('utf8').trimEnd().split('\n')
const records = lines.map((line) => JSON.parse(line))
if (sourceConfig.scope.goalIds.length !== 13 || records.length !== 13) throw new Error('Expected exact 13-record owner')
if (!records.every((record, index) => record.goalId === sourceConfig.scope.goalIds[index] && record.reviewId === sourceConfig.reviewId)) {
  throw new Error('Pinned record order or identity mismatch')
}
if (records.filter((record) => record.goalId === heldGoalId).length !== 1) throw new Error('Expected held goal exactly once')
const retained = records.filter((record) => record.goalId !== heldGoalId)
const retainedLines = lines.filter((_, index) => records[index].goalId !== heldGoalId)
if (retained.length !== 12 || !retained.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate')) {
  throw new Error('Unexpected retained count or approval status')
}
const config = {
  ...sourceConfig,
  reviewPath: `${targetBase}.review.jsonl`,
  scope: {
    label: '12 unchanged image-bound AI-candidate P-v2 records retained while the Q2 intersection-angle image is held',
    goalIds: retained.map((record) => record.goalId),
  },
}
await output(`${targetBase}.config.json`, Buffer.from(`${JSON.stringify(config, null, 2)}\n`))
await output(`${targetBase}.review.jsonl`, Buffer.from(`${retainedLines.join('\n')}\n`))
