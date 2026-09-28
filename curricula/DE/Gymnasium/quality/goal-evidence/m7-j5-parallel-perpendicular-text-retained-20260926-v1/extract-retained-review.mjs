import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ownDir = dirname(fileURLToPath(import.meta.url))
const source = resolve(ownDir, '../m7-three-held-image-text-current-20260924-v1/positive-evidence.review.jsonl')
const target = resolve(ownDir, 'positive-evidence.review.jsonl')
const bytes = await readFile(source)
assert.equal(
  createHash('sha256').update(bytes).digest('hex'),
  'daa4c7d92e40ec3806cd82f5f5884613d2c29fd70845890657c733e8e18a2ecd',
  'The historical three-goal review changed; inspect before carrying a record forward.',
)
const lines = bytes.toString('utf8').trimEnd().split('\n')
assert.deepEqual(lines.map(line => JSON.parse(line).goalId), [
  '1b70498a-62a0-5a84-99dd-476b8af68da6',
  '2231c29b-eb4e-51ae-9cb1-eb033bf16099',
  '944dd479-9f30-5acb-ab32-3ea0b6dc8e06',
])
await writeFile(target, `${lines[1]}\n${lines[2]}\n`)
console.log(`Retained the unchanged J5/Q2 review records at ${target}`)
