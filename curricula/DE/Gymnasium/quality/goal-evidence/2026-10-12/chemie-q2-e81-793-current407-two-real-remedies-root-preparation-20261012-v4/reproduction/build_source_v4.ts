// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalBookModel } from '../../app/scripts/goalBookModel'
import { buildGoalBookSourceAtlasInputs } from '../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookOriginalSources } from '../../app/scripts/goalBookOriginalSources'

const root = process.cwd()
const e = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const out = `${e}/chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4`
const base = `${e}/chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6`
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const put = (p: string, d: unknown) => {
  const path = resolve(root, p)
  assert.equal(existsSync(path), false, p)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(d, null, 2) + '\n')
}
const full = read(`${out}/configs/full407.two-remedies.inactive.config.json`)
const sourceCfg = read(`${out}/configs/source32-one-HE-context-removal.measured387.book-local.inputs.json`)
const built = buildGoalBookSourceAtlasInputs(sourceCfg, root)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals, 407)
assert.equal(built.receipt.scopes.length, 48)
const prefix = `${out}/atlas/exact-normal-outputs/`
for (const [p, bytes] of Object.entries(built.outputs)) {
  const path = resolve(root, prefix + p)
  assert.equal(existsSync(path), false)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, bytes)
}
const rawManifest = JSON.parse(built.outputs[sourceCfg.manifestPath])
const manifest = { ...rawManifest, sourcePaths: rawManifest.sourcePaths.map((p: string) => prefix + p), navigationViewPath: prefix + rawManifest.navigationViewPath }
const manifestPath = `${out}/atlas/source-union.normal-portable-sources.json`
put(manifestPath, manifest)
const qa = read(full.goalVisualizationQaPath)
const digests = Object.fromEntries(read(`${out}/assets/all412-actual-image-source-bindings.json`).assets.map((r: any) => [qa.records.find((x: any) => x.goalId === r.goalId).imageUrl, r.sha256]))
const cfg = { ...read(`${base}/atlas/source387.actual.config.json`), landscapePath: full.landscapePath, semanticKindLedgerPath: full.semanticKindLedgerPath, goalVisualizationQaPath: full.goalVisualizationQaPath, compositionViewManifestPath: manifestPath, evidenceReviewPaths: full.evidenceReviewPaths, outputPath: `${out}/atlas/current-source-union.normal-model.json` }
put(`${out}/configs/current-source-union.normal-model.config.json`, cfg)
const sourceModel = buildGoalBookModel({
  landscape: read(full.landscapePath), semanticKindLedger: read(full.semanticKindLedgerPath),
  goalVisualizationQa: qa, goalVisualizationAssetDigests: digests,
  evidenceReviewSources: full.evidenceReviewPaths.map((path: string) => ({ path, text: readFileSync(resolve(root, path), 'utf8') })),
  compositionViewManifest: manifest,
  compositionViewSources: manifest.sourcePaths.map((path: string) => ({ path, view: read(path) })),
  navigationView: read(manifest.navigationViewPath), durationModelPolicy: read(manifest.durationModelPolicyPath), config: cfg,
})
put(cfg.outputPath, sourceModel)
const sourceIndex = buildGoalBookOriginalSources(sourceModel, root, sourceCfg.mappingPaths)
put(`${out}/atlas/current-source-union.normal-original-sources.json`, sourceIndex)
put(`${out}/checks/normal-one-HE-context-removal-measured-source-counts.actual.json`, {
  role: 'Unmodified source atlas, model and original-sources APIs; no scientific approval',
  sourceProjectionCounts: built.receipt.counts, sourceScopes: built.receipt.scopes.length,
  sourcePageCountMeasured: sourceModel.pages.length, currentCanonicalAtomicPages: read(full.outputPath).pages.length,
  selectedMappingPaths: sourceCfg.mappingPaths,
  sourceOnlyGoalIds: ['c245d5fd-ce46-5b45-ab2e-e610547b5f7c', 'b4ca3af2-77f1-59e8-955d-c4959e284242', '3ce81f96-4fbb-5022-88b7-337a000315ed'],
  removedOnlyNormativeContextTarget: { sourceGoalId: 'he-chem-sekii-q3-5-b05-a01-66f2d502', targetGoalId: 'c245d5fd-ce46-5b45-ab2e-e610547b5f7c' },
  MMRemainsFullCanonicalOwnEnrichment: read(full.outputPath).pages.some((p: any) => p.goalId === 'c245d5fd-ce46-5b45-ab2e-e610547b5f7c'),
  sourceUnionAndSourceSpecificReadinessApproved: false,
  originalBookLocalPathsPreservedInRawOutputs: true, portableManifestOnlyPathPrefixesChanged: true,
  failedEvidenceLocalPathAttemptRetained: true,
  newIndependentVotes: 0, strictGain: 0, activeOrGitWrites: false,
})
console.log(JSON.stringify({ canonicalAtomic: 407, measuredSourceUnion: sourceModel.pages.length, sourceScopes: built.receipt.scopes.length, strictGain: 0 }))
