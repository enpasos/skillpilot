// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalBookModel, stableGoalBookJson } from '../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { buildGoalBookSourceAtlasInputs } from '../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookOriginalSources } from '../../app/scripts/goalBookOriginalSources'

const root = process.cwd()
const e = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const out = `${e}/chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4`
const base = `${e}/chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6`
const ids = ['e81a4aed-9695-533e-8eb7-7a0c714346ea', '793189f8-78bd-5204-848b-fd2bbc12e458']
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const put = (p: string, value: unknown) => {
  const path = resolve(root, p)
  assert.equal(existsSync(path), false, `Additive path already exists: ${p}`)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
}
const full = read(`${out}/configs/full407.two-remedies.inactive.config.json`)
const qa = read(full.goalVisualizationQaPath)
const assetRefs = read(`${out}/assets/all412-actual-image-source-bindings.json`).assets
const digests = Object.fromEntries(assetRefs.map((row: any) => {
  const actual = 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, row.path))).digest('hex')
  assert.equal(actual, row.sha256, row.goalId)
  const q = qa.records.find((x: any) => x.goalId === row.goalId)
  assert.equal(q.assetSha256, actual)
  return [q.imageUrl, actual]
}))
const shared = {
  landscape: read(full.landscapePath), semanticKindLedger: read(full.semanticKindLedgerPath),
  goalVisualizationQa: qa, goalVisualizationAssetDigests: digests,
  evidenceReviewSources: full.evidenceReviewPaths.map((path: string) => ({ path, text: readFileSync(resolve(root, path), 'utf8') })),
}
const model = buildGoalBookModel({ ...shared, compositionView: read(full.compositionViewPath), config: full })
assert.equal(model.pages.length, 407)
const old = read(`${base}/native/full407.current.actual.book-model.json`)
const oldById = new Map<string, any>(old.pages.map((p: any) => [p.goalId, p]))
const changed = model.pages.filter(p => p.pageFingerprint !== oldById.get(p.goalId)!.pageFingerprint).map(p => p.goalId)
assert.deepEqual([...changed].sort(), [...ids].sort())
put(full.outputPath, model)
const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: model, goalIds: ids, bookId: 'chemie-q2-e81-793-current407-native-v4', title: 'Chemie – angeleitete Untersuchung und Nukleinsäuren' })
put(`${out}/native/two-remedies.normal-subset-model.json`, subset)
put(`${out}/checks/normal407-model-exact-two-page-delta.actual.json`, {
  role: 'Unmodified normal model and subset APIs; no independent votes',
  wholeCanonicalPages: model.pages.length, subsetPages: subset.pages.length,
  changedPageFingerprintGoalIds: changed, unchangedOther405PageFingerprints: 405,
  currentFiveScientificClosuresPreserved: ['014e6d85-eecf-5228-9031-52a39981cd0d', '127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a', '197bc2c5-835e-59e7-9263-5684e89799cc', '7b477c2b-0919-5d70-810b-188a88c55ffc', '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'].every(id => !changed.includes(id)),
  targetTuples: subset.pages.map(p => ({ goalId: p.goalId, goalFingerprint: p.goalFingerprint, pageFingerprint: p.pageFingerprint })),
  newIndependentVotes: 0, strictGain: 0, activeOrGitWrites: false,
})

// One source target correction: measure actual count and retain all normal guards.
const sourceCfg = read(`${out}/configs/source32-one-HE-context-removal.actual.inputs.json`)
const built = buildGoalBookSourceAtlasInputs(sourceCfg, root)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals, 407)
assert.equal(built.receipt.scopes.length, 48)
for (const [p, bytes] of Object.entries(built.outputs)) {
  const path = resolve(root, p)
  assert.ok(path.startsWith(resolve(root, out) + '/'), p)
  assert.equal(existsSync(path), false)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, bytes)
}
const manifest = read(sourceCfg.manifestPath)
const atlasCfg = { ...read(`${base}/atlas/source387.actual.config.json`), landscapePath: full.landscapePath, semanticKindLedgerPath: full.semanticKindLedgerPath, goalVisualizationQaPath: full.goalVisualizationQaPath, compositionViewManifestPath: sourceCfg.manifestPath, evidenceReviewPaths: full.evidenceReviewPaths, outputPath: `${out}/atlas/current-source-union.normal-model.json` }
put(`${out}/configs/current-source-union.normal-model.config.json`, atlasCfg)
const sourceModel = buildGoalBookModel({ ...shared,
  compositionViewManifest: manifest,
  compositionViewSources: manifest.sourcePaths.map((path: string) => ({ path, view: read(path) })),
  navigationView: read(manifest.navigationViewPath), durationModelPolicy: read(manifest.durationModelPolicyPath), config: atlasCfg,
})
put(atlasCfg.outputPath, sourceModel)
const sourceIndex = buildGoalBookOriginalSources(sourceModel, root, sourceCfg.mappingPaths)
put(`${out}/atlas/current-source-union.normal-original-sources.json`, sourceIndex)
put(`${out}/checks/normal-one-HE-context-removal-measured-source-counts.actual.json`, {
  role: 'Unmodified source atlas, model and original-sources APIs; no scientific approval',
  sourceProjectionCounts: built.receipt.counts, sourceScopes: built.receipt.scopes.length,
  sourcePageCountMeasured: sourceModel.pages.length, currentCanonicalAtomicPages: model.pages.length,
  selectedMappingPaths: sourceCfg.mappingPaths,
  sourceOnlyGoalIds: ['c245d5fd-ce46-5b45-ab2e-e610547b5f7c', 'b4ca3af2-77f1-59e8-955d-c4959e284242', '3ce81f96-4fbb-5022-88b7-337a000315ed'],
  removedOnlyNormativeContextTarget: { sourceGoalId: 'he-chem-sekii-q3-5-b05-a01-66f2d502', targetGoalId: 'c245d5fd-ce46-5b45-ab2e-e610547b5f7c' },
  MMRemainsFullCanonicalOwnEnrichment: model.pages.some(p => p.goalId === 'c245d5fd-ce46-5b45-ab2e-e610547b5f7c'),
  sourceUnionAndSourceSpecificReadinessApproved: false,
  newIndependentVotes: 0, strictGain: 0, activeOrGitWrites: false,
})
console.log(JSON.stringify({ canonicalAtomic: model.pages.length, changedPages: changed, subset: subset.pages.length, measuredSourceUnion: sourceModel.pages.length, sourceScopes: built.receipt.scopes.length, strictGain: 0 }))
