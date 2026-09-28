import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const cases = [
  {
    source: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-angle-image-hold-p-retention-20260924-v1/retained-image-bound-twelve.review.jsonl',
    sha256: '6eb19a3337c7dd125e9738e5feb36ff42ce1acc289a125dfce4f2e211f3801fb',
    excludedId: '09f47964-2cd0-410e-93ee-9632b582fc91',
    target: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/retained-first15-eleven.review.jsonl',
    count: 11,
  },
  {
    source: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-vready-q4-families-five-20260923-v1/positive-evidence.review.jsonl',
    sha256: '32769ac3476483c5e403ff8556df12f3117a3285914e4fa6eb7592fc6ecdb072',
    excludedId: '0e8417d7-effb-5314-93ba-a571b01726ce',
    target: 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-reworded-image-bound-current-v1/retained-q4-four.review.jsonl',
    count: 4,
  },
]

for (const item of cases) {
  const source = readFileSync(resolve(root, item.source))
  if (createHash('sha256').update(source).digest('hex') !== item.sha256) {
    throw new Error(`Historical P-v2 review bytes changed: ${item.source}`)
  }
  const records = source.toString('utf8').trimEnd().split('\n').map((line) => JSON.parse(line))
  const retained = records.filter(({ goalId }) => goalId !== item.excludedId)
  if (records.length !== item.count + 1 || retained.length !== item.count) {
    throw new Error(`Unexpected retained scope for ${item.source}`)
  }
  const targetPath = resolve(root, item.target)
  const bytes = `${retained.map((record) => JSON.stringify(record)).join('\n')}\n`
  if (process.argv[2] === '--write') {
    writeFileSync(targetPath, bytes, { flag: 'wx' })
  } else if (process.argv.length === 2) {
    if (readFileSync(targetPath, 'utf8') !== bytes) throw new Error(`Stale retained review: ${item.target}`)
  } else {
    throw new Error('Usage: node materialize-retained-reviews.mjs [--write]')
  }
  console.log(`${process.argv[2] === '--write' ? 'Wrote' : 'Verified'} ${item.target}: ${retained.length} unchanged records`)
}
