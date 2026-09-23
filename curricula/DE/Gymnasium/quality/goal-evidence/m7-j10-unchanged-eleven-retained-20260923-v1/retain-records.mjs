// Retain the eleven unaffected records as exact original JSONL lines.
// No profile re-authoring, re-fingerprinting, or status change occurs here.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, '../m7-j10-functions-equations-20260923-v1/positive-evidence.review.jsonl')
const bytes = readFileSync(source)
const digest = createHash('sha256').update(bytes).digest('hex')
if (digest !== '87389f60939c7a5da10765d5807e65381b838102cbf8a31d05881db9f5d0fdea') {
  throw new Error(`Historical 18-record P-v2 source changed: ${digest}`)
}
const ids = [
  '42e19186-6769-41ac-a7bf-ab39bdb50661',
  '15ce2a7e-a5dc-44f7-8a5e-6d04dd81db12',
  '283ec44e-747c-55e3-9a61-4a4cc70ebfab',
  '0190e463-51a7-4860-9b35-d875530a85ba',
  '9f2fc0d1-e1e7-4051-ba70-87ba1dd8dd1c',
  '1a18dbb3-f350-4766-9c8b-20ca018ccef1',
  'b43a1e45-f05c-4d78-8453-f6fa677dc24c',
  '06bdbecb-53e0-5ac3-992f-d6fd20555b59',
  '14d0e697-3fb0-5074-a08c-7e01ca9bbda8',
  'd0db87c4-36f5-5ac6-8428-da96d31b253a',
  '2bd88d66-5daf-53bb-aa02-4c010963679d',
]
const originalLines = bytes.toString('utf8').split('\n').filter(Boolean)
if (originalLines.length !== 18) throw new Error(`Expected 18 source records, found ${originalLines.length}`)
const lineById = new Map(originalLines.map(line => {
  const { goalId } = JSON.parse(line)
  return [goalId, line]
}))
const selected = ids.map(id => {
  const line = lineById.get(id)
  if (!line) throw new Error(`Missing original record ${id}`)
  return line
})
if (new Set(selected).size !== 11) throw new Error('Expected eleven distinct records')
writeFileSync(resolve(here, 'positive-evidence.review.jsonl'), `${selected.join('\n')}\n`)
