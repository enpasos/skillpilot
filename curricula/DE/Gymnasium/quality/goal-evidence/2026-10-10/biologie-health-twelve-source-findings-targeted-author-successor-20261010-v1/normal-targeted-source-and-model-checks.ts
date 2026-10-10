// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

async function main() {
  const root = process.cwd()
  const P = path.relative(root, path.dirname(process.argv[1]))
  const H = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-current353-source-raster-native-technical-preparation-20261010-v1'
  const V2 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-twelve-two-targeted-metadata-raster-native-technical-successor-20261010-v2'
  const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
  const write = (p: string, data: unknown) => { fs.mkdirSync(path.dirname(p), { recursive: true }); const bytes = JSON.stringify(data, null, 2) + '\n'; if (fs.existsSync(p)) assert.equal(fs.readFileSync(p, 'utf8'), bytes); else fs.writeFileSync(p, bytes) }
  const ref = (p: string) => { const bytes = fs.readFileSync(p); return { path: p, sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
  const api = await import(pathToFileURL(path.resolve('app/scripts/goalBookSourceAtlasInputs.ts')).href)
  const modelApi = await import(pathToFileURL(path.resolve('app/scripts/goalBookModel.ts')).href)
  const cfgPath = P + '/sources/after394-atlas.targeted-source.normal.config.json'
  const cfg = read(cfgPath)
  const result = api.buildGoalBookSourceAtlasInputs(cfg, root)
  assert.deepEqual(result.receipt.counts, { canonicalCurricularAtomicGoals: 394, publishedCurricularAtomicGoals: 394, sourceViews: 24, unresolvedSourceScopeDecisions: 0, omittedGoals: 0 })
  const capsule = path.resolve('tmp/m7-resumption-20261010/bio12-targeted-source-author-capsule')
  fs.mkdirSync(capsule, { recursive: true })
  const linkReadOnly = (p: string) => {
    const target = path.join(capsule, p)
    if (fs.existsSync(target)) return
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.linkSync(path.resolve(p), target)
  }
  for (const b of result.receipt.inputBindings) linkReadOnly(b.path)
  linkReadOnly(cfgPath)
  const copies: Record<string, string> = {}
  for (const [logical, bytes] of Object.entries(result.outputs)) {
    const destination = P + '/sources/normal-output/' + path.basename(logical)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    if (fs.existsSync(destination)) assert.equal(fs.readFileSync(destination, 'utf8'), bytes)
    else fs.writeFileSync(destination, bytes as string)
    const target = path.join(capsule, logical)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, bytes as string)
    copies[logical] = destination
  }
  const checked = api.checkGoalBookSourceAtlasInputs(cfgPath, capsule)
  assert.deepEqual(checked.receipt, result.receipt)
  const manifest = JSON.parse(result.outputs[cfg.manifestPath])
  manifest.sourcePaths = manifest.sourcePaths.map((p: string) => copies[p])
  manifest.navigationViewPath = copies[manifest.navigationViewPath]
  const manifestPath = P + '/sources/portable-normal-atlas.sources.json'
  write(manifestPath, manifest)
  const baseline = api.expandGoalBookSourceAtlasReceipt(read(H + '/sources/after-raw-normal-output/source-projection.final-summary.receipt.json'))
  const deltas = read(P + '/sources/four-pair-removals-three-HH-partial-scopes-two-HB-fidelity.actual-author-deltas.json')
  const changes = deltas.wholeChangedMappingPairs
  const mappingIndex = (p: string) => changes.find((r: any) => r.afterMapping.path === p)?.beforeMapping.path ?? p
  const semanticKey = (w: any) => JSON.stringify([mappingIndex(w.mappingPath), w.sourceGoalId, w.mappedTargetGoalId, w.goalId, w.coverage, w.profileBasis, w.fallbackViewPath ?? null])
  const protectedIds = new Set(read(H + '/inputs/current353-protected.ids.json').current353)
  const scopes = baseline.scopes.map((before: any) => {
    const after = result.receipt.scopes.find((r: any) => r.viewId === before.viewId)
    assert(after)
    assert.deepEqual(before.goalIds, after.goalIds)
    const a = before.witnesses.map(semanticKey).sort(), b = after.witnesses.map(semanticKey).sort()
    const removed = a.filter((k: string) => !b.includes(k)), added = b.filter((k: string) => !a.includes(k))
    assert.equal(added.length, 0)
    for (const k of removed) {
      const fields = JSON.parse(k)
      assert(deltas.removedUnsupportedDirectPairs.some((r: any) => r.sourceGoalId === fields[1] && r.canonicalGoalId === fields[3]))
    }
    assert.deepEqual(before.witnesses.filter((w: any) => protectedIds.has(w.goalId)).map(semanticKey).sort(), after.witnesses.filter((w: any) => protectedIds.has(w.goalId)).map(semanticKey).sort())
    return { viewId: before.viewId, wholeGoalSetExact: true, protected353WitnessSemanticsExact: true, removedWitnesses: removed, addedWitnesses: added }
  })
  write(P + '/checks/normal-source24-membership-and-protected353-witness-semantics.actual.json', { schemaVersion: 1, normalApi: 'app/scripts/goalBookSourceAtlasInputs.ts:build/checkGoalBookSourceAtlasInputs', beforeCounts: baseline.counts, afterCounts: result.receipt.counts, scopes, approved: 0, strictGain: 0, activeWrites: [] })
  const modelConfig = read(V2 + '/native/current394-two-targeted.normal.config.json')
  modelConfig.compositionViewManifestPath = manifestPath
  modelConfig.outputPath = P + '/native/current394-source-corrected.actual-normal-model.json'
  const modelConfigPath = P + '/native/current394-source-corrected.normal.config.json'
  write(modelConfigPath, modelConfig)
  for (const p of [modelConfigPath, modelConfig.landscapePath, modelConfig.semanticKindLedgerPath, modelConfig.goalVisualizationQaPath, manifestPath, manifest.navigationViewPath, manifest.durationModelPolicyPath, ...manifest.sourcePaths, ...modelConfig.evidenceReviewPaths, ...(modelConfig.externalLandscapePaths ?? [])]) linkReadOnly(p)
  const imageBindings = []
  for (const r of read(modelConfig.goalVisualizationQaPath).records) {
    if (r.visualizationState !== 'available') continue
    const original = ref(r.canonicalAssetPath)
    assert.equal(original.sha256, r.assetSha256)
    const target = path.join(capsule, r.publicAssetPath)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    if (!fs.existsSync(target)) fs.linkSync(path.resolve(r.canonicalAssetPath), target)
    imageBindings.push({ normalPublicPathDiagnosticOnly: r.publicAssetPath, actualRegularSource: original })
  }
  write(P + '/checks/normal-whole-model-exact-source-image-alias-bindings.json', { schemaVersion: 1, role: 'Private read-only hardlink capsule aliases from exact regular source bytes, never active public assets', records: imageBindings, activeWrites: [], approved: 0 })
  const loaded = await modelApi.loadGoalBookBuildInputs(modelConfigPath, capsule)
  const beforeModel = read(V2 + '/native/current394-two-targeted.actual-normal-model.json')
  assert.equal(loaded.model.pages.length, 394)
  const pages = new Map(loaded.model.pages.map((p: any) => [p.goalId, p]))
  const changedPages = beforeModel.pages.filter((p: any) => JSON.stringify(p) !== JSON.stringify(pages.get(p.goalId)))
  assert.equal(changedPages.length, 0)
  await modelApi.writeGoalBookModel(loaded.model, path.resolve(modelConfig.outputPath))
  write(P + '/checks/current394-whole-native-pages-source-only-context.actual.json', { schemaVersion: 1, normalApi: 'app/scripts/goalBookModel.ts:loadGoalBookBuildInputs/writeGoalBookModel', before: ref(V2 + '/native/current394-two-targeted.actual-normal-model.json'), after: ref(modelConfig.outputPath), wholePageCount: 394, changedWholePages: changedPages, exactWholeNativePages: 394, exactProtected353Pages: 353, sourceReceiptAndInputBindingsChanged: true, nativeRendersRepeated: false, reason: 'All complete current page objects are exactly equal. Existing full HTML/PDF sight reviews retain their page content; new 182 source witness contexts and whole actual source pages require targeted independent SOURCE review.', substantiveApproval: false, approved: 0 })
  console.log(JSON.stringify({ normalSourceAtlasBuildCheckExit0: true, sourceViews: 24, whole394Union: true, unresolved: 0, omitted: 0, protected353WitnessSemanticsExact: true, exactWhole394NativePages: true, strictGain: 0, humanApproved: 0 }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
