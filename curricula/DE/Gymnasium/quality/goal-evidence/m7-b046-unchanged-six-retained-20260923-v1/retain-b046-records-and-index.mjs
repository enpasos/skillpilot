// Mechanical partition only: preserve six unchanged P lines and six old D resolutions.
// The seventh B046 ID has current image-bound P/D replacements; historical files stay intact.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const quality = resolve(here, '..')
const sourceP = resolve(quality, 'canonical-math-positive-understanding-evidence-rollout-v1-batch-046-current-keep7-v1.review.jsonl')
const sourceD = resolve(quality, '../goal-description-review/mathematik/rollout-v1/2026-09-07/batch-046-matrix-mappings-and-probability-foundations-20-v1/resolution-index.current-keep7-v1.json')
const targetD = resolve(quality, '../goal-description-review/mathematik/rollout-v1/2026-09-07/batch-046-matrix-mappings-and-probability-foundations-20-v1/resolution-index.current-keep6.retained-before-three-new-png-20260923-v1.json')
const ids = [
  'ccd1d108-5d9a-50dc-bfb8-6fa6e0bc503c',
  'b7cc2fc4-c695-5a97-93b0-3a619c632ca8',
  '3019e775-1420-510f-850b-5a29acc47a64',
  '5a2371fd-74ce-5013-932e-35d3713aeaf7',
  '71d1fd4d-8471-5f25-94a0-4c531a74783c',
  'c2831918-26f1-421e-90fb-ce707689594e',
]
const replacedId = '8823e26e-694c-581b-9adf-4db7db6f43c9'
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

const pBytes = readFileSync(sourceP)
if (sha256(pBytes) !== '7bbcbc98e6e4cd3c2cd8d103cb82a8803088b5d30a4d7810dbaac0d42f71182e') {
  throw new Error('Historical B046 P source changed')
}
const pLines = pBytes.toString('utf8').split('\n').filter(Boolean)
if (pLines.length !== 7) throw new Error('Expected seven historical B046 P records')
const pById = new Map(pLines.map(line => [JSON.parse(line).goalId, line]))
if (pById.size !== 7 || !pById.has(replacedId)) throw new Error('Historical B046 P scope changed')
const retainedP = ids.map(id => {
  const line = pById.get(id)
  if (!line) throw new Error(`Missing historical P record ${id}`)
  return line
})
const pOutput = `${retainedP.join('\n')}\n`

const dBytes = readFileSync(sourceD)
if (sha256(dBytes) !== 'a86119fc14fb633dec6d867731269cb390b1e1e69a02335a6c836fab45ffd5f9') {
  throw new Error('Historical B046 D index changed')
}
const d = JSON.parse(dBytes.toString('utf8'))
if (d.schemaVersion !== 1 || d.resolutions.length !== 7 || d.groups.length !== 1) {
  throw new Error('Historical B046 D index shape changed')
}
const dById = new Map(d.resolutions.map(entry => [entry.goalId, entry]))
if (dById.size !== 7 || !dById.has(replacedId)) throw new Error('Historical B046 D scope changed')
const retainedD = ids.map(id => {
  const entry = dById.get(id)
  if (!entry || !entry.strictDescriptionComplete) throw new Error(`Missing strict historical D resolution ${id}`)
  return entry
})
d.artifactSetId = 'mathematik-rollout-v1-b046-current-keep6-retained-before-three-new-png-20260923-v1'
d.strictDescriptionReviewCompleteCount = 6
d.descriptionReviewPercentage = Number(((6 / d.curriculumAtomicDenominator) * 100).toFixed(1))
d.groups[0].resolvedGoalCount = 6
d.resolutions = retainedD
const dOutput = `${JSON.stringify(d, null, 2)}\n`

const checkOrWrite = (path, output, write) => {
  if (write && !existsSync(path)) writeFileSync(path, output, { flag: 'wx' })
  else if (readFileSync(path, 'utf8') !== output) throw new Error(`Retained artifact drift: ${path}`)
}
if (process.argv.length !== 3 || !['--write', '--check'].includes(process.argv[2])) {
  throw new Error('Usage: node retain-b046-records-and-index.mjs --write|--check')
}
const write = process.argv[2] === '--write'
checkOrWrite(resolve(here, 'positive-evidence.review.jsonl'), pOutput, write)
checkOrWrite(targetD, dOutput, write)
console.log('B046 six unchanged P lines and D resolutions retained; one image-replaced goal excluded')
