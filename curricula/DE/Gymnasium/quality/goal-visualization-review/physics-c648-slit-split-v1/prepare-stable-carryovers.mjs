import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

// Read-only patch emitter: preserve exact historical decisions for the
// explicitly untouched subset before the four approved goal corrections.
// No native review evidence, old resolution or historical profile is rewritten.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')
const json = (path) => JSON.parse(read(path))
const bytes = (value) => `${JSON.stringify(value, null, 2)}\n`
const sha = (data) => createHash('sha256').update(data).digest('hex')
const excluded = new Set([
  '6270e558-d657-5363-a6b2-e49a032a453b',
  'c64820e1-c0ee-4342-9225-f981650f0c52',
  '91683676-01cf-5003-80fa-a04d043b4e61',
  'f6a3a602-1e45-5018-b0ff-3d49933cf634',
])
const dRoot = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1'
const pRoot = 'curricula/DE/Gymnasium/quality/goal-evidence'
const groups = [
  {
    d: `${dRoot}/2026-09-06/batch-038r-current-oscillations-and-optics-11-v1`,
    p: `${pRoot}/canonical-physics-positive-understanding-evidence-rollout-v1-batch-038-oscillations-ac-and-light-models-20-v1`,
    dCount: 10,
    pCount: 19,
    pNew: `${pRoot}/canonical-physics-positive-understanding-evidence-rollout-v1-batch-038-stable-pre-diffraction-19-v1`,
  },
  {
    d: `${dRoot}/2026-09-05/batch-032r-q3-electromagnetic-waves-final-recheck-7-v1`,
    p: `${pRoot}/canonical-physics-positive-understanding-evidence-rollout-v1-batch-032r-q3-electromagnetic-waves-current-v1`,
    dCount: 4,
    pCount: 4,
    pNew: `${pRoot}/canonical-physics-positive-understanding-evidence-rollout-v1-batch-032r-stable-pre-diffraction-4-v1`,
  },
]
const outputs = []
const audit = []
for (const group of groups) {
  const indexPath = `${group.d}/resolution-index.json`
  const oldIndex = json(indexPath)
  const selected = oldIndex.resolutions.filter((entry) => !excluded.has(entry.goalId))
  assert.equal(selected.length, group.dCount)
  const denominator = json(`${group.d}/batch-manifest.json`).curriculumAtomicDenominatorAtPreparation
  const index = {
    schemaVersion: 1,
    artifactSetId: `${oldIndex.artifactSetId}-stable-pre-diffraction-v1`,
    subject: oldIndex.subject,
    semanticKind: oldIndex.semanticKind,
    strictDescriptionReviewCompleteCount: selected.length,
    curriculumAtomicDenominator: denominator,
    descriptionReviewPercentage: Number((100 * selected.length / denominator).toFixed(1)),
    groups: oldIndex.groups.map((entry) => ({
      ...entry,
      resolvedGoalCount: selected.filter((row) => row.groupId === entry.groupId).length,
    })),
    resolutions: selected,
  }
  for (const entry of selected) {
    assert.equal(`sha256:${sha(read(`${group.d}/${entry.resolutionPath}`))}`, entry.resolutionDigest)
  }
  const indexOutputPath = `${group.d}/resolution-index.stable-pre-diffraction-${group.dCount}-v1.json`
  outputs.push({ path: indexOutputPath, text: bytes(index) })

  const configPath = `${group.p}.config.json`
  const candidatesPath = `${group.p}.candidates.json`
  const reviewPath = `${group.p}.review.jsonl`
  const config = json(configPath)
  const candidates = json(candidatesPath)
  const lines = read(reviewPath).split('\n').filter(Boolean)
  const keepLines = lines.filter((line) => !excluded.has(JSON.parse(line).goalId))
  const currentRecordsById = new Map(keepLines.map((line) => {
    const record = JSON.parse(line)
    return [record.goalId, record]
  }))
  const keepGoals = config.scope.goalIds.filter((goalId) => !excluded.has(goalId))
  const keepCandidates = candidates.goals.filter((entry) => !excluded.has(entry.goalId)).map((entry) => {
    const currentRecord = currentRecordsById.get(entry.goalId)
    assert.ok(currentRecord)
    assert.deepEqual(entry.profile, currentRecord.profile)
    // Earlier post-review metadata can contain a retained dissent that was
    // added after the old authoring draft. Copy that actual reviewed metadata
    // into this new projection; never rematerialize it away from the record.
    return { ...entry, dissent: currentRecord.dissent ?? [] }
  })
  assert.equal(keepLines.length, group.pCount)
  assert.equal(keepGoals.length, group.pCount)
  assert.equal(keepCandidates.length, group.pCount)
  assert.deepEqual(new Set(keepLines.map((line) => JSON.parse(line).goalId)), new Set(keepGoals))
  assert.deepEqual(new Set(keepCandidates.map((entry) => entry.goalId)), new Set(keepGoals))
  outputs.push({ path: `${group.pNew}.config.json`, text: bytes({
    ...config,
    reviewPath: `${group.pNew}.review.jsonl`,
    scope: { ...config.scope, label: `${config.scope.label} — exact unchanged subset before B041 diffraction correction`, goalIds: keepGoals },
  }) })
  outputs.push({ path: `${group.pNew}.candidates.json`, text: bytes({ ...candidates, goals: keepCandidates }) })
  outputs.push({ path: `${group.pNew}.review.jsonl`, text: `${keepLines.join('\n')}\n` })
  audit.push({
    originalDescriptionIndex: indexPath,
    originalDescriptionIndexSha256: sha(read(indexPath)),
    originalPositiveConfig: configPath,
    originalPositiveConfigSha256: sha(read(configPath)),
    originalPositiveCandidatesSha256: sha(read(candidatesPath)),
    originalPositiveReviewSha256: sha(read(reviewPath)),
    preservedDescriptionCount: selected.length,
    preservedPositiveCount: keepGoals.length,
    descriptionIndex: indexOutputPath,
    positiveConfig: `${group.pNew}.config.json`,
    historicalDenominator: denominator,
    preservedDescriptionGoalIds: selected.map((entry) => entry.goalId),
    preservedPositiveGoalIds: keepGoals,
    omittedDescriptionGoalIds: oldIndex.resolutions.filter((entry) => excluded.has(entry.goalId)).map((entry) => entry.goalId),
    omittedPositiveGoalIds: config.scope.goalIds.filter((goalId) => excluded.has(goalId)),
    exactHistoricalRecordBytesRetained: true,
    exactProfileBodiesRetained: true,
    candidateDissentAuthority: 'Exact original current review-record dissent, including historical post-authoring adjudication notes; no dissent is removed by the new subset projection.',
    newReviewClaimed: false,
  })
}
const receipt = {
  schemaVersion: 1,
  artifactType: 'bounded-pre-change-current-evidence-subset',
  reason: 'Four existing diffraction goal IDs are undergoing an explicitly approved source-aware correction. Historical D/P inputs and records remain untouched; this only excludes those IDs from otherwise unchanged current evidence.',
  excludedGoalIds: [...excluded],
  authority: 'AI coordination; no fresh review, human approval or global progress claim',
  denominatorMeaning: 'Historical native preparation denominators are retained solely for legacy subset-index compatibility; the central report owns the current denominator.',
  groups: audit,
}
outputs.push({
  path: 'curricula/DE/Gymnasium/quality/goal-visualization-review/physics-c648-slit-split-v1/stable-carryovers.receipt.json',
  text: bytes(receipt),
})
if (process.argv.includes('--check')) {
  for (const output of outputs) assert.equal(read(output.path), output.text, `Subset differs: ${output.path}`)
  console.log(`PASS: ${outputs.length} exact subset outputs; D 10+4, P 19+4; old records unchanged.`)
} else {
  console.log(JSON.stringify(outputs))
}
