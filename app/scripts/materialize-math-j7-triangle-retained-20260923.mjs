import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// J7 triangle PNG changes only two GoalBook image bindings. Preserve the
// historical D/P sources; materialize their unchanged records as new subsets.
// The changed goals need separate, current-image-bound D and P reviews.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const dRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1'
const pRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const changed = {
  construction: '3017e774-8d9f-5129-828f-7684db5afc1e',
  solvability: '0f6c1df6-0e30-54ae-8098-e9422833ba80',
}
const dSources = [
  {
    source: `${dRoot}/2026-09-05/batch-030-atlas-context-recheck-18-v1/resolution-index.retained-before-34200b88-png-20260923-v1.json`,
    sourceSha256: 'a1a493fa3de38d599d23674c22f4d82bb930c2b5e85b2d6519b313cbabf15afc',
    target: `${dRoot}/2026-09-05/batch-030-atlas-context-recheck-18-v1/resolution-index.retained-before-3017e774-png-20260923-v1.json`,
    excludedId: changed.construction,
    expectedSourceCount: 14,
  },
  {
    source: `${dRoot}/2026-09-23/m7-unregistered-eight-six-keep-partial-20260923-v1/resolution-index.current-png-retained-five-20260923-v1.json`,
    sourceSha256: 'c9340fc3ac892f4508e95c9f951383ab1fd86a515e19b57f36819d63de4b0c8b',
    target: `${dRoot}/2026-09-23/m7-unregistered-eight-six-keep-partial-20260923-v1/resolution-index.retained-before-0f6c1df6-png-20260923-v1.json`,
    excludedId: changed.solvability,
    expectedSourceCount: 5,
  },
]
const pSources = [
  {
    sourceConfig: `${pRoot}/m7-two-local-png-bound-p-20260923-v1/median-source-retained14-before-34200b88-png-20260923-v1.config.json`,
    sourceConfigSha256: 'dc133eb8520697e15886c4ddabf4e8bc8ff39cdbc1de9c0dcdc5c777518b6828',
    sourceReview: `${pRoot}/m7-two-local-png-bound-p-20260923-v1/median-source-retained14-before-34200b88-png-20260923-v1.review.jsonl`,
    sourceReviewSha256: '795527f50818b6c6d7cd5b77eec6a1e266df6ee3518c346c3b038b83cc3bf1e7',
    targetConfig: `${pRoot}/m7-two-local-png-bound-p-20260923-v1/median-source-retained13-before-3017e774-png-20260923-v1.config.json`,
    targetReview: `${pRoot}/m7-two-local-png-bound-p-20260923-v1/median-source-retained13-before-3017e774-png-20260923-v1.review.jsonl`,
    excludedId: changed.construction,
    expectedSourceCount: 14,
  },
  {
    sourceConfig: `${pRoot}/m7-four-new-png-bound-p-20260923-v1/seki-retained-four.config.json`,
    sourceConfigSha256: 'b4ea795edd8149d7fb3454e84fdcfef42106bb6172cd144eaaafa9908eed2db7',
    sourceReview: `${pRoot}/m7-four-new-png-bound-p-20260923-v1/seki-retained-four.review.jsonl`,
    sourceReviewSha256: 'fe6e64958366cf5437757a9248bb9ba33136663db43011e57b4649f8b4d2e59c',
    targetConfig: `${pRoot}/m7-four-new-png-bound-p-20260923-v1/seki-retained-three-before-0f6c1df6-png-20260923-v1.config.json`,
    targetReview: `${pRoot}/m7-four-new-png-bound-p-20260923-v1/seki-retained-three-before-0f6c1df6-png-20260923-v1.review.jsonl`,
    excludedId: changed.solvability,
    expectedSourceCount: 4,
  },
]

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const sameOrder = (left, right) => left.length === right.length && left.every((value, index) => value === right[index])
const readPinned = async (path, expectedSha256) => {
  const bytes = await readFile(resolve(root, path))
  assert(sha256(bytes) === expectedSha256, `Source SHA changed: ${path}`)
  return bytes
}
const readOptional = async (path) => {
  try { return await readFile(resolve(root, path)) } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

const materializeD = async (spec) => {
  const source = JSON.parse((await readPinned(spec.source, spec.sourceSha256)).toString('utf8'))
  const sourceIds = source.resolutions?.map((entry) => entry.goalId)
  assert(source.schemaVersion === 1 && source.subject === 'Mathematik' && source.semanticKind === 'curricularAtomic', `${spec.source}: unexpected D index`)
  assert(source.groups?.length === 1 && sourceIds?.length === spec.expectedSourceCount, `${spec.source}: unexpected D source count/groups`)
  assert(source.strictDescriptionReviewCompleteCount === spec.expectedSourceCount && source.groups[0].resolvedGoalCount === spec.expectedSourceCount, `${spec.source}: D source counts disagree`)
  assert(new Set(sourceIds).size === sourceIds.length && sourceIds.filter((id) => id === spec.excludedId).length === 1, `${spec.source}: affected D goal not unique`)
  for (const entry of source.resolutions) {
    assert(entry.strictDescriptionComplete === true && entry.resolutionPath && entry.resolutionDigest?.startsWith('sha256:'), `${spec.source}: incomplete D record ${entry.goalId}`)
    const resolution = await readFile(resolve(root, dirname(spec.source), entry.resolutionPath))
    assert(`sha256:${sha256(resolution)}` === entry.resolutionDigest, `${spec.source}: D resolution digest changed for ${entry.goalId}`)
  }
  const retained = source.resolutions.filter((entry) => entry.goalId !== spec.excludedId)
  assert(retained.length === spec.expectedSourceCount - 1 && sameOrder(retained.map((entry) => entry.goalId), sourceIds.filter((id) => id !== spec.excludedId)), `${spec.source}: D retained order changed`)
  const result = {
    ...source,
    artifactSetId: `${source.artifactSetId}-retained-before-${spec.excludedId.slice(0, 8)}-png-20260923-v1`,
    strictDescriptionReviewCompleteCount: retained.length,
    descriptionReviewPercentage: Number(((retained.length / source.curriculumAtomicDenominator) * 100).toFixed(1)),
    groups: [{ ...source.groups[0], resolvedGoalCount: retained.length }],
    resolutions: retained,
  }
  assert(Number.isInteger(source.curriculumAtomicDenominator) && source.curriculumAtomicDenominator > 0, `${spec.source}: missing denominator`)
  return [{ path: spec.target, bytes: jsonBytes(result), count: retained.length }]
}

const materializeP = async (spec) => {
  const [configBytes, reviewBytes] = await Promise.all([
    readPinned(spec.sourceConfig, spec.sourceConfigSha256),
    readPinned(spec.sourceReview, spec.sourceReviewSha256),
  ])
  const source = JSON.parse(configBytes.toString('utf8'))
  const sourceIds = source.scope?.goalIds
  const lines = reviewBytes.toString('utf8').trimEnd().split('\n')
  const records = lines.map((line) => JSON.parse(line))
  const recordIds = records.map((record) => record.goalId)
  assert(source.schemaVersion === 2 && source.profileRuleVersion === 'positive-understanding-evidence-v2', `${spec.sourceConfig}: unexpected P profile`)
  assert(source.reviewPath === spec.sourceReview && sourceIds?.length === spec.expectedSourceCount && records.length === spec.expectedSourceCount, `${spec.sourceConfig}: unexpected P source count/path`)
  assert(new Set(sourceIds).size === sourceIds.length && sameOrder(sourceIds, recordIds), `${spec.sourceConfig}: P scope/record order differs`)
  assert(sourceIds.filter((id) => id === spec.excludedId).length === 1, `${spec.sourceConfig}: affected P goal not unique`)
  assert(records.every((record) => record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.evidenceLevel === 'E1' && record.maximumClaimScope === 'G1'), `${spec.sourceReview}: P authority changed`)
  const retainedIds = sourceIds.filter((id) => id !== spec.excludedId)
  const retainedLines = lines.filter((_line, index) => recordIds[index] !== spec.excludedId)
  assert(retainedIds.length === spec.expectedSourceCount - 1 && sameOrder(retainedIds, retainedLines.map((line) => JSON.parse(line).goalId)), `${spec.sourceReview}: P retained order changed`)
  const config = {
    ...source,
    reviewPath: spec.targetReview,
    scope: {
      ...source.scope,
      label: `${retainedIds.length} unveränderte P-v2-Records aus ${spec.sourceConfig}; ${spec.excludedId} mit neuer PNG-Bindung separat prüfen`,
      goalIds: retainedIds,
    },
  }
  return [
    { path: spec.targetConfig, bytes: jsonBytes(config), count: retainedIds.length },
    { path: spec.targetReview, bytes: Buffer.from(`${retainedLines.join('\n')}\n`), count: retainedIds.length },
  ]
}

const main = async () => {
  const mode = process.argv[2]
  assert((mode === '--write' || mode === '--check') && process.argv.length === 3, 'Usage: node app/scripts/materialize-math-j7-triangle-retained-20260923.mjs --write|--check')
  const artifacts = []
  for (const spec of dSources) artifacts.push(...await materializeD(spec))
  for (const spec of pSources) artifacts.push(...await materializeP(spec))
  assert(new Set(artifacts.map(({ path }) => path)).size === artifacts.length, 'Output paths overlap')
  for (const artifact of artifacts) {
    const current = await readOptional(artifact.path)
    assert(current?.equals(artifact.bytes) || (mode === '--write' && current === null), `${artifact.path}: missing or different generated artifact`)
  }
  if (mode === '--write') {
    for (const artifact of artifacts) {
      if (await readOptional(artifact.path) === null) await writeFile(resolve(root, artifact.path), artifact.bytes, { flag: 'wx' })
    }
  }
  for (const artifact of artifacts) console.log(`${artifact.path} (${artifact.count} unchanged goals)`)
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
