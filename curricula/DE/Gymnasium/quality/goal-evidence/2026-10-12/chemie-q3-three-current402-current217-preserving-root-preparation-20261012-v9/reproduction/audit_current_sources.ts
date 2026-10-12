import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalBookModel, stableGoalBookJson } from '../../app/scripts/goalBookModel'
import { buildGoalBookSourceAtlasInputs } from '../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookOriginalSources } from '../../app/scripts/goalBookOriginalSources'

const root = process.cwd()
const e = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const out = `${e}/chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9`
const author = `${e}/chemie-q3-three-current402-real-method-source-author-20261012-v8`
const targetIds = ['81373fb7-2a4a-5b2c-acd0-b4e775acaa65', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09']
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')
const put = (p: string, d: unknown) => {
  const file = resolve(root, p)
  assert.equal(existsSync(file), false, `Additive output already exists: ${p}`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(d, null, 2) + '\n')
}
const cfgPath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const activeCfg = read(cfgPath)
const fullConfig = read(`${out}/configs/whole402.inactive.config.json`)
const sh = 'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
assert.ok(activeCfg.mappingPaths.includes(sh), 'Expected explicit current SH mapping selection')
const cfg = { ...activeCfg, landscapePath: fullConfig.landscapePath, semanticKindLedgerPath: fullConfig.semanticKindLedgerPath, mappingPaths: activeCfg.mappingPaths.map((p: string) => p === sh ? `${author}/candidate/SH-upper-micelle-three-wrong-to-exact-owner.review.json` : p) }
put(`${out}/sources/current32-one-SH-review.inputs.json`, cfg)
const built = buildGoalBookSourceAtlasInputs(cfg, root)
assert.equal(built.receipt.counts.canonicalCurricularAtomicGoals, 402)
assert.equal(built.receipt.counts.publishedCurricularAtomicGoals, 382)
assert.equal(built.receipt.scopes.length, 48)
const prefix = `${out}/sources/normal-computed-outputs/`
for (const [p, text] of Object.entries(built.outputs)) {
  const file = resolve(root, prefix + p)
  assert.equal(existsSync(file), false)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}
const manifest = JSON.parse(built.outputs[cfg.manifestPath])
const portable = { ...manifest, sourcePaths: manifest.sourcePaths.map((p: string) => prefix + p), navigationViewPath: prefix + manifest.navigationViewPath }
put(`${out}/sources/current382.portable-sources.json`, portable)
const base = read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json')
const sourceConfig = { ...base, landscapePath: fullConfig.landscapePath, semanticKindLedgerPath: fullConfig.semanticKindLedgerPath, goalVisualizationQaPath: fullConfig.goalVisualizationQaPath, compositionViewManifestPath: `${out}/sources/current382.portable-sources.json`, outputPath: `${out}/native/current382.source-review.normal-model.json` }
put(`${out}/configs/current382.source-review.inactive.config.json`, sourceConfig)
const qa = read(fullConfig.goalVisualizationQaPath)
const digests = Object.fromEntries(read(`${out}/checks/normal-current402-model-and-target-three.actual.json`).actualAvailableAssetDigestsVerified.map((r: any) => {
  const record = qa.records.find((x: any) => x.goalId === r.goalId)
  assert.equal(sha(r.path), r.sha256)
  return [record.imageUrl, r.sha256]
}))
const source = buildGoalBookModel({
  landscape: read(fullConfig.landscapePath),
  compositionViewManifest: portable,
  compositionViewSources: portable.sourcePaths.map((p: string) => ({ path: p, view: read(p) })),
  navigationView: read(portable.navigationViewPath),
  durationModelPolicy: read(portable.durationModelPolicyPath),
  semanticKindLedger: read(fullConfig.semanticKindLedgerPath),
  goalVisualizationQa: qa,
  goalVisualizationAssetDigests: digests,
  evidenceReviewSources: [],
  config: sourceConfig,
})
assert.equal(source.pages.length, 382)
put(sourceConfig.outputPath, source)
const sources = buildGoalBookOriginalSources(source, root, cfg.mappingPaths)
put(`${out}/sources/current382.one-SH-change.normal-original-sources.json`, sources)
const normalize = (index: any, id: string) => {
  const ev = new Map(index.evidence.map((r: any) => [r.id, r]))
  const docs = new Map(index.documents.map((r: any) => [r.id, r]))
  return (index.goals[id] ?? []).map((scope: any) => ({ ...scope, evidenceIds: undefined,
    evidence: scope.evidenceIds.map((key: string) => {
      const { id: _id, documentId, ...body } = ev.get(key) as any
      const { id: _doc, ...doc } = docs.get(documentId) as any
      return { ...body, document: doc }
    }).sort((a: any, b: any) => stableGoalBookJson(a).localeCompare(stableGoalBookJson(b)))
  })).sort((a: any, b: any) => stableGoalBookJson(a).localeCompare(stableGoalBookJson(b)))
}
const current = read('app/public/lernzielbuch/de-gym-chemie-bundesweit.original-sources.json')
const priorAuthor = read(`${author}/sources/fresh-after.normal-original-source-index.json`)
const changedFromCurrent = Object.keys(sources.goals).filter(id => stableGoalBookJson(normalize(sources, id)) !== stableGoalBookJson(normalize(current, id)))
const changedFromAuthor = Object.keys(sources.goals).filter(id => stableGoalBookJson(normalize(sources, id)) !== stableGoalBookJson(normalize(priorAuthor, id)))
const collateralIds = ['f0939f88-a6af-5334-ac4d-5d54732af25a', 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef', '6966df95-f125-5ecc-af8e-0442545d9f17']
assert.deepEqual([...changedFromCurrent].sort(), ['c8844ac6-c414-5a0e-9fcd-7d0a82177d09', ...collateralIds].sort())
assert.deepEqual(changedFromAuthor, ['2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'])
put(`${out}/checks/current-source-mapping-and-four-collateral-context-delta.actual.json`, {
  schemaVersion: 1, role: 'Unmodified production source/model APIs; no independent scientific approval',
  currentSourceInputPath: cfgPath, currentSourceInputSha256: sha(cfgPath),
  currentMappingCount: cfg.mappingPaths.length, currentReviewPages: 402, actualPublishedSourcePages: 382,
  actualSourceScopes: built.receipt.scopes.length, sourceProjectionCounts: built.receipt.counts,
  selectedNIPath: cfg.mappingPaths.find((p: string) => p.includes('/DE-NI/upper-secondary/')),
  changedGoalSourcePayloadsComparedWithCurrentActive: changedFromCurrent,
  changedGoalSourcePayloadsComparedWithFrozenAuthorV8: changedFromAuthor,
  threeTargetSourcePayloadsExactToAuthorV8: targetIds.every(id => !changedFromAuthor.includes(id)),
  actualThreeCurrentStrictCollateralSourcesMustBeIndependentlyChecked: collateralIds,
  sourceOutputsWrittenOnlyUnderAdditiveEvidencePrefix: prefix,
  sourceManifestPathWrapperOnly: true, noActiveCompiledViewOrMappingWritten: true,
  activeLatestM1SourceCorrectionPreserved: true, uncompletedBroadSourceUnionsCertified: false,
  strictGain: 0, newIndependentVotes: 0, HumanApproval: false, HumanTrial: false,
})
console.log(JSON.stringify({ sourcePages: source.pages.length, sourceScopes: built.receipt.scopes.length, changedFromCurrent, changedFromAuthor, strictGain: 0 }))
