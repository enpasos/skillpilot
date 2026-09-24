import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Re-register only untouched D decisions after five learner-visible PNGs
// change their pages. Old review artifacts stay byte-for-byte historical.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../..')
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1'
const specs = [
  {
    source: `${base}/2026-09-23/m7-unregistered-eight-six-keep-partial-20260923-v1/resolution-index.retained-before-0f6c1df6-png-20260923-v1.json`,
    sha: '4ecf4d27d39401191bbb949c67776edbb24ad8f5489d581cf5d2719607a50cba',
    target: `${base}/2026-09-23/m7-unregistered-eight-six-keep-partial-20260923-v1/resolution-index.retained-before-five-mobile-png-20260923-v1.json`,
    remove: ['a8fdbaeb-7c0a-58ff-aab5-2fb871ae2fb0'],
    count: 4,
  },
  {
    source: `${base}/2026-09-23/m7-functions-diagrams-next10-seven-keep-partial-20260923-v1/resolution-index-six-after-c19-png-20260923-v1.json`,
    sha: '233e15b7a450e8b3055863135df564eb8407b0ff300f4b2ac7794f82e24e0534',
    target: `${base}/2026-09-23/m7-functions-diagrams-next10-seven-keep-partial-20260923-v1/resolution-index.retained-before-five-mobile-png-20260923-v1.json`,
    remove: ['308f19e2-e202-5300-a2fa-1eaa717f4e73'],
    count: 6,
  },
  {
    source: `${base}/2026-09-20/m7-he-context-refresh-9-v1/resolution-index.retained-before-q2-rule-png-20260923-v1.json`,
    sha: 'a909bcdaeb22c775e4cb5d711c9d59bfae278502fc763a98c72c02e9204f2c18',
    target: `${base}/2026-09-20/m7-he-context-refresh-9-v1/resolution-index.retained-before-five-mobile-png-20260923-v1.json`,
    remove: ['04fe49bf-8c3e-5986-ae83-3c69c0c3e4c8', 'd8f1fd06-785e-5d15-a8e5-7d8b36f91287'],
    count: 7,
  },
  {
    source: `${base}/2026-09-02/batch-025a-j8-rational-functions-revised-6-v1/resolution-index.stable-current-carryover-4-v1.retained-before-m7-current-bundle39-20260920-v1.json`,
    sha: '45d99421bcee75a44e394ee566e41466b036dd4183b1ea8b7d312241d4a34d5b',
    target: `${base}/2026-09-02/batch-025a-j8-rational-functions-revised-6-v1/resolution-index.retained-before-five-mobile-png-20260923-v1.json`,
    remove: ['bc6e4c14-d4f7-537e-8e83-9b5c0086e807'],
    count: 3,
  },
]

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const json = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const maybeRead = async (path) => {
  try { return await readFile(resolve(root, path)) } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

const main = async () => {
  const mode = process.argv[2]
  assert(['--write', '--check'].includes(mode) && process.argv.length === 3, 'Usage: node materialize-math-five-mobile-d-retained-20260923.mjs --write|--check')
  for (const spec of specs) {
    const sourceBytes = await readFile(resolve(root, spec.source))
    assert(sha(sourceBytes) === spec.sha, `Source changed: ${spec.source}`)
    const source = JSON.parse(sourceBytes)
    assert(source.schemaVersion === 1 && source.subject === 'Mathematik' && source.semanticKind === 'curricularAtomic', `Wrong D source: ${spec.source}`)
    assert(source.groups?.length === 1 && source.resolutions?.length === spec.count && source.strictDescriptionReviewCompleteCount === spec.count, `D source count changed: ${spec.source}`)
    assert(source.groups[0].resolvedGoalCount === spec.count && source.curriculumAtomicDenominator > 0, `D group/denominator changed: ${spec.source}`)
    const ids = source.resolutions.map((entry) => entry.goalId)
    assert(new Set(ids).size === ids.length && spec.remove.every((id) => ids.filter((candidate) => candidate === id).length === 1), `D removal IDs not unique: ${spec.source}`)
    for (const entry of source.resolutions) {
      assert(entry.strictDescriptionComplete === true, `Old D decision not complete: ${entry.goalId}`)
      const recordPath = resolve(root, dirname(spec.source), entry.resolutionPath)
      const recordBytes = await readFile(recordPath)
      assert(`sha256:${sha(recordBytes)}` === entry.resolutionDigest, `Old D record drift: ${entry.goalId}`)
    }
    const retained = source.resolutions.filter((entry) => !spec.remove.includes(entry.goalId))
    assert(retained.length === spec.count - spec.remove.length, `D retained count wrong: ${spec.target}`)
    const result = {
      ...source,
      artifactSetId: `${source.artifactSetId}-retained-before-five-mobile-png-20260923-v1`,
      strictDescriptionReviewCompleteCount: retained.length,
      descriptionReviewPercentage: Number(((retained.length / source.curriculumAtomicDenominator) * 100).toFixed(1)),
      groups: [{ ...source.groups[0], resolvedGoalCount: retained.length }],
      resolutions: retained,
    }
    const output = json(result)
    const current = await maybeRead(spec.target)
    assert(current?.equals(output) || (mode === '--write' && current === null), `Retained D artifact missing or altered: ${spec.target}`)
    if (mode === '--write' && current === null) await writeFile(resolve(root, spec.target), output, { flag: 'wx' })
    console.log(`${spec.target}: ${retained.length} unchanged D records; ${spec.remove.length} affected`)
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
