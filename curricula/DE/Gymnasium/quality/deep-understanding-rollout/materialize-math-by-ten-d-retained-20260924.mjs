import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Keep the historical review immutable. Only ten image-bound decisions are
// replaced by current independent reviews; eight unchanged decisions remain.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..')
const source = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-002-current-v7-sixth-pass-main-20/resolution-index.current-checkpoint.retained-before-m7-current-bundle39-20260920-v1.json'
const sourceSha = 'fdff16a03df4080fcd29c7a20db165feac69b21fe4ac344cceb4b551905742c9'
const target = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-08-26/batch-002-current-v7-sixth-pass-main-20/resolution-index.retained-before-by-j5-j6-ten-image-binding-20260924-v1.json'
const affected = new Set([
  '596345cd-679e-5c7b-955f-e8cb1ec81e96',
  '6ff61721-b2cc-5b1b-ade5-b3c1fd7f7077',
  '79dd11f0-ed20-5b92-a215-b061a2098c0c',
  'a4c2b831-02f0-5d55-a300-7823a71352c4',
  'd658e26a-e351-4bca-824e-f346deaa87c5',
  'e331a425-e9c6-46eb-89cb-dedf72857974',
  '339a7bf5-f1df-5d5a-9ec4-41f471f0c111',
  '02013455-72a0-5213-9509-ed77f7ede62b',
  'f6b13b8e-1ecd-5420-905d-21290aa996a6',
  '60c2418b-aaff-58f6-964a-bc7cda2a673c',
])

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }

const main = async () => {
  const mode = process.argv[2]
  assert(['--write', '--check'].includes(mode) && process.argv.length === 3,
    'Usage: node materialize-math-by-ten-d-retained-20260924.mjs --write|--check')
  const sourceBytes = await readFile(resolve(root, source))
  assert(sha(sourceBytes) === sourceSha, 'D source index changed')
  const index = JSON.parse(sourceBytes)
  assert(index.schemaVersion === 1 && index.subject === 'Mathematik'
    && index.semanticKind === 'curricularAtomic'
    && index.curriculumAtomicDenominator === 791
    && index.strictDescriptionReviewCompleteCount === 18
    && index.groups?.length === 1 && index.groups[0].resolvedGoalCount === 18
    && index.resolutions?.length === 18, 'Unexpected D source index')
  const ids = index.resolutions.map((record) => record.goalId)
  assert(new Set(ids).size === ids.length && [...affected].every((id) => ids.includes(id)),
    'Affected goals missing or duplicate in D source')
  for (const record of index.resolutions) {
    assert(record.strictDescriptionComplete === true, `Incomplete D source: ${record.goalId}`)
    const bytes = await readFile(resolve(root, dirname(source), record.resolutionPath))
    assert(`sha256:${sha(bytes)}` === record.resolutionDigest,
      `D source resolution changed: ${record.goalId}`)
  }
  const retained = index.resolutions.filter((record) => !affected.has(record.goalId))
  assert(retained.length === 8, 'Unexpected retained D count')
  const output = Buffer.from(`${JSON.stringify({
    ...index,
    artifactSetId: `${index.artifactSetId}-retained-before-by-j5-j6-ten-image-binding-20260924-v1`,
    strictDescriptionReviewCompleteCount: retained.length,
    descriptionReviewPercentage: Number(((retained.length / index.curriculumAtomicDenominator) * 100).toFixed(1)),
    groups: [{ ...index.groups[0], resolvedGoalCount: retained.length }],
    resolutions: retained,
  }, null, 2)}\n`)
  let current = null
  try { current = await readFile(resolve(root, target)) } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
  assert(current?.equals(output) || (mode === '--write' && current === null),
    'Retained D output missing or altered')
  if (mode === '--write' && current === null) await writeFile(resolve(root, target), output, { flag: 'wx' })
  console.log(`${target}: 8 unchanged D records; 10 refreshed image-bound decisions`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
