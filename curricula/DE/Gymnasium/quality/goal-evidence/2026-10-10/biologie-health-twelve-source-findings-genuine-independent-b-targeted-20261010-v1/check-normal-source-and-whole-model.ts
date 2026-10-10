// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

async function main() {
  const root = process.cwd()
  const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1'
  const own = path.relative(root, path.dirname(process.argv[1]))
  const capsule = path.resolve('tmp/m7-resumption-20261010/bio12-genuine-b-targeted-source-capsule')
  const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
  const write = (p: string, data: unknown) => { fs.mkdirSync(path.dirname(p), { recursive: true }); assert(!fs.existsSync(p)); fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n') }
  const binding = (p: string) => { const bytes = fs.readFileSync(p); return { path: p, sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
  const alias = (p: string, actual = p) => {
    const dst = path.join(capsule, p)
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    if (fs.existsSync(dst)) assert.equal(fs.readFileSync(dst).compare(fs.readFileSync(actual)), 0)
    else fs.linkSync(path.resolve(actual), dst)
  }
  const sourceApi = await import(pathToFileURL(path.resolve('app/scripts/goalBookSourceAtlasInputs.ts')).href)
  const modelApi = await import(pathToFileURL(path.resolve('app/scripts/goalBookModel.ts')).href)
  const cfgPath = author + '/sources/after394-atlas.targeted-source.normal.config.json'
  const cfg = read(cfgPath)
  const result = sourceApi.buildGoalBookSourceAtlasInputs(cfg, root)
  assert.deepEqual(result.receipt, sourceApi.expandGoalBookSourceAtlasReceipt(read(author + '/sources/normal-output/source-projection.receipt.json')))
  for (const [logical, bytes] of Object.entries(result.outputs)) {
    const committed = author + '/sources/normal-output/' + path.basename(logical)
    assert.equal(fs.readFileSync(committed, 'utf8'), bytes)
    const dst = path.join(capsule, logical)
    fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, bytes as string)
  }
  for (const b of result.receipt.inputBindings) alias(b.path)
  alias(cfgPath)
  const checked = sourceApi.checkGoalBookSourceAtlasInputs(cfgPath, capsule)
  assert.deepEqual(checked.receipt, result.receipt)
  const expanded = result.receipt
  const authorDeltas = read(author + '/sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json')
  const beforePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1/sources/after-raw-normal-output/source-projection.final-summary.receipt.json'
  const before = sourceApi.expandGoalBookSourceAtlasReceipt(read(beforePath))
  const protectedIds = new Set(read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1/inputs/current353-protected.ids.json').current353)
  const semantic = (w: any) => JSON.stringify([authorDeltas.wholeChangedMappingPairs.find((d: any) => d.afterMapping.path === w.mappingPath)?.beforeMapping.path ?? w.mappingPath, w.sourceGoalId, w.mappedTargetGoalId, w.goalId, w.coverage, w.profileBasis, w.fallbackViewPath ?? null])
  const scopes = expanded.scopes.map((after: any) => {
    const original = before.scopes.find((r: any) => r.viewId === after.viewId)
    assert(original); assert.deepEqual(after.goalIds, original.goalIds)
    const a = original.witnesses.map(semantic).sort(), b = after.witnesses.map(semantic).sort()
    const removed = a.filter((x: string) => !b.includes(x)), added = b.filter((x: string) => !a.includes(x))
    assert.equal(added.length, 0)
    for (const x of removed) { const fields = JSON.parse(x); assert(authorDeltas.removedUnsupportedDirectPairs.some((r: any) => r.sourceGoalId === fields[1] && r.canonicalGoalId === fields[3])) }
    assert.deepEqual(original.witnesses.filter((w: any) => protectedIds.has(w.goalId)).map(semantic).sort(), after.witnesses.filter((w: any) => protectedIds.has(w.goalId)).map(semantic).sort())
    return { viewId: after.viewId, wholeGoalIdsExact: true, wholeProtectedWitnessSemanticsExact: true, witnessCount: after.witnesses.length, removed, added }
  })
  const union = new Set(expanded.scopes.flatMap((s: any) => s.goalIds))
  assert.equal(union.size, 394); assert.equal(scopes.length, 24)
  assert.equal(expanded.unresolvedSourceScopes.length, 0); assert.equal(expanded.omittedGoals.length, 0)
  const modelCfgPath = author + '/native/current394-source-corrected.normal.config.json'
  const modelCfg = read(modelCfgPath), manifest = read(modelCfg.compositionViewManifestPath)
  for (const p of [modelCfgPath, modelCfg.landscapePath, modelCfg.semanticKindLedgerPath, modelCfg.goalVisualizationQaPath, modelCfg.compositionViewManifestPath, manifest.navigationViewPath, manifest.durationModelPolicyPath, ...manifest.sourcePaths, ...modelCfg.evidenceReviewPaths, ...(modelCfg.externalLandscapePaths ?? [])]) alias(p)
  for (const row of read(modelCfg.goalVisualizationQaPath).records) {
    if (row.visualizationState !== 'available') continue
    assert.equal(binding(row.canonicalAssetPath).sha256, row.assetSha256)
    alias(row.publicAssetPath, row.canonicalAssetPath)
  }
  const loaded = await modelApi.loadGoalBookBuildInputs(modelCfgPath, capsule)
  const current = read(author + '/native/current394-source-corrected.actual-normal-model.json')
  assert.deepEqual(loaded.model, current)
  const nativeProof = read(author + '/checks/current394-whole-native-pages-source-only-context.actual.json')
  const old = read(nativeProof.before.path), oldMap = new Map(old.pages.map((p: any) => [p.goalId, p]))
  assert.equal(current.pages.length, 394)
  for (const page of current.pages) assert.deepEqual(page, oldMap.get(page.goalId))
  const protectedPages = current.pages.filter((p: any) => protectedIds.has(p.goalId))
  assert.equal(protectedPages.length, 353)
  write(own + '/checks/normal-source-and-whole-model.independent-b.actual.json', { schemaVersion: 1, reviewer: 'genuine independent B', normalApis: ['buildGoalBookSourceAtlasInputs', 'checkGoalBookSourceAtlasInputs', 'expandGoalBookSourceAtlasReceipt', 'loadGoalBookBuildInputs'], currentInputBindings: result.receipt.inputBindings, normalOutputsByteExact: true, computedScopeUnion: [...union].sort(), scopes, normalModelCompleteExact: true, whole394PagesComparedObjectByObject: true, protected353PagesComparedObjectByObject: true, nativeRendersRepeated: false, currentModel: binding(author + '/native/current394-source-corrected.actual-normal-model.json'), actualBaselineModel: nativeProof.before, humanApproved: 0, strictGain: 0, activeWrites: [] })
  console.log(JSON.stringify({ normalSourceBuildAndCheck: 'EXIT0', sourceViews: scopes.length, actualUnionGoals: union.size, unresolved: 0, omitted: 0, whole394NormalModelExact: true, allWholePagesExact: true, protected353WitnessSemanticsExact: true, sourceApproval: false, humanApproved: 0, strictGain: 0 }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
