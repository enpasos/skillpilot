import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = dirname(fileURLToPath(import.meta.url))
const source = join(directory, 'm7-j7-triangle-png-current-20260923-v1.review.jsonl')
const target = join(directory, 'm7-j7-triangle-png-current-20260923-v1.retained-3017-after-0f6-text-20260923-v1.review.jsonl')
const sourceSha = 'f3df710e6f6787626efc9f896d085719ad24c5471da4c61574333044126012d4'
const retainedLineSha = '1d1faf01894bfca717db8bae8e67b401af45c2581bc6b7aa2806f9d5eae4b89c'
const firstId = '3017e774-8d9f-5129-828f-7684db5afc1e'
const secondId = '0f6c1df6-0e30-54ae-8098-e9422833ba80'
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const sourceBytes = await readFile(source)
if (sha(sourceBytes) !== sourceSha) throw new Error('J7 v1 source review SHA changed')
const lines = sourceBytes.toString('utf8').trimEnd().split('\n')
if (lines.length !== 2 || JSON.parse(lines[0]).goalId !== firstId || JSON.parse(lines[1]).goalId !== secondId) {
  throw new Error('J7 v1 review count/order changed')
}
const retainedBytes = Buffer.from(lines[0] + '\n')
if (sha(retainedBytes) !== retainedLineSha) throw new Error('Retained 3017 record SHA changed')
await writeFile(target, retainedBytes)
console.log(`Retained 3017 only: sha256:${retainedLineSha}`)
