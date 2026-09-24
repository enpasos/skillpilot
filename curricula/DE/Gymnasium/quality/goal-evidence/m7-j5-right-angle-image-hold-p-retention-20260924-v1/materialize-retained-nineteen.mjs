import { createHash } from 'node:crypto'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const sourceBase = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-batch-001-final-20-v2'
const targetBase = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-j5-right-angle-image-hold-p-retention-20260924-v1/retained-batch-001-unaffected-19'
const heldGoalId = '2231c29b-eb4e-51ae-9cb1-eb033bf16099'
const pins = {
  config: 'a6a2e27977d7c301453f1ec70c10d12ba2619f919622306c33842465ba1c0f67',
  review: 'a7223554f9e32c70d34f6a984ca553da58087a212c63009e1d96672d27a75172',
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
const raw = (await pinned(`${sourceBase}.review.jsonl`, pins.review)).toString('utf8')
const lines = raw.trimEnd().split('\n')
const records = lines.map((line) => JSON.parse(line))
if (sourceConfig.scope.goalIds.length !== 20 || records.length !== 20) throw new Error('Expected exact original 20-record owner')
if (!records.every((record, index) => record.goalId === sourceConfig.scope.goalIds[index] && record.reviewId === sourceConfig.reviewId)) {
  throw new Error('Pinned record order or identity mismatch')
}
if (records.filter((record) => record.goalId === heldGoalId).length !== 1) throw new Error('Expected held goal exactly once')
const retained = records.filter((record) => record.goalId !== heldGoalId)
const retainedLines = lines.filter((_, index) => records[index].goalId !== heldGoalId)
if (retained.length !== 19 || !retained.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate')) {
  throw new Error('Unexpected retained count or approval status')
}
const config = {
  ...sourceConfig,
  reviewPath: `${targetBase}.review.jsonl`,
  scope: {
    label: '19 unchanged AI-candidate P-v2 records retained byte-for-byte while the right-angle image is held',
    goalIds: retained.map((record) => record.goalId),
  },
}
await output(`${targetBase}.config.json`, Buffer.from(`${JSON.stringify(config, null, 2)}\n`))
await output(`${targetBase}.review.jsonl`, Buffer.from(`${retainedLines.join('\n')}\n`))
