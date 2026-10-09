// SPDX-License-Identifier: Apache-2.0
// Independent technical follow-up after the immutable own science-FIRST.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, symlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { buildGoalBookSourceAtlasInputs, checkGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { normalizeCompositionView, compileCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const R = resolve('.'), D = dirname(fileURLToPath(import.meta.url)), P = relative(R, D)
const C = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-corrosion-three-source-binding-corrections-author-successor-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(R, path), 'utf8'))
const bind = (path: string) => { const b = readFileSync(resolve(R, path)); return { path, sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length } }
const put = (path: string, value: unknown) => {
  const p = resolve(D, path); mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
  return relative(R, p)
}
const FIRST = bind(`${P}/six-whole-source-course-locator.successor.independent-c.science-FIRST.json`)
const cap = mkdtempSync(resolve(tmpdir(), 'skillpilot-COR-source-independent-c-'))
const copy = (path: string) => { const p = resolve(cap, path); mkdirSync(dirname(p), { recursive: true }); cpSync(resolve(R, path), p) }
const landscapePath = `${C}/baseline/current-whole-canonical-480.original.json`
const canon = read(landscapePath)
const originalKinds = read(`${C}/baseline/current-chemistry-semantic-kinds.original.json`)
const kindsPath = put('inputs/whole480-kinds-exact-path-only.normal-input.json', { ...originalKinds, sourceLandscapePath: landscapePath })
assert.equal(canon.goals.length, 480)
assert.equal(originalKinds.decisions.filter((row: any) => row.semanticKind === 'curricularAtomic').length, 378)
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
copy(qaPath)
mkdirSync(resolve(cap, 'app'), { recursive: true }); symlinkSync(resolve(R, 'app/public'), resolve(cap, 'app/public'), 'dir')
const outputRoot = 'app/scripts/config/goal-books/chemie-COR-source-independent-c-inactive'
const runs: any[] = [], models: any[] = []
const normalizedCanon = normalizeCanonicalLandscape(canon)
for (const stage of ['before', 'after']) {
  const cfg = {
    ...read(stage === 'before' ? `${C}/baseline/current-atlas-config.original.json` : `${C}/normal/candidate-source-atlas.inputs.json`),
    bookId: 'chemie-COR-source-independent-c-inactive', landscapePath, semanticKindLedgerPath: kindsPath,
    outputDirectory: `${outputRoot}/source-views`, manifestPath: `${outputRoot}/source-manifest.json`,
    navigationViewPath: `${outputRoot}/navigation.view.json`, navigationViewId: 'chemie-COR-source-independent-c-inactive',
  }
  const preliminary = buildGoalBookSourceAtlasInputs(cfg, R)
  const snapshots = new Set(cfg.sourceDocumentSnapshots.map((snapshot: any) => snapshot.path))
  const copiedInputs: unknown[] = []
  for (const input of preliminary.receipt.inputBindings) {
    if (snapshots.has(input.path)) continue
    const bytes = readFileSync(resolve(R, input.path))
    assert.equal('sha256:' + createHash('sha256').update(bytes).digest('hex'), input.sha256)
    copy(input.path); copiedInputs.push(bind(input.path))
  }
  const configPath = put(`normal/${stage}.ordinary-full-source-atlas.config.json`, cfg); copy(configPath)
  const built = buildGoalBookSourceAtlasInputs(cfg, cap)
  assert.deepEqual(built.outputs, preliminary.outputs)
  const outputs: unknown[] = []
  for (const [path, bytes] of Object.entries(built.outputs)) {
    mkdirSync(dirname(resolve(cap, path)), { recursive: true }); writeFileSync(resolve(cap, path), bytes)
    const archive = put(`normal/${stage}-exact-output-archive/${path}`, bytes)
    outputs.push({ ordinaryCapsuleOutputPath: path, portableExactArchive: bind(archive) })
  }
  const checked = checkGoalBookSourceAtlasInputs(configPath, cap)
  assert.equal(checked.receipt.counts.publishedCurricularAtomicGoals, 359)
  const wholeReceiptPath = put(`normal/${stage}.whole-ordinary-source-receipt.actual.json`, checked.receipt)
  for (const scope of checked.receipt.scopes) {
    const view = normalizeCompositionView(JSON.parse(built.outputs[scope.path]))
    assert.deepEqual(compileCompositionView(view, normalizedCanon).findings.filter(row => row.severity === 'error'), [])
  }
  const nativeCfg = {
    schemaVersion: 1, bookId: 'chemie-COR-source-independent-c-inactive359', title: 'Chemie – inaktive korrigierte Quellensicht',
    landscapePath, semanticKindLedgerPath: kindsPath, goalVisualizationQaPath: qaPath,
    publicationMode: 'review', atlasBaseUrl: 'https://skillpilot.com/lernzielbuch', evidenceReviewPaths: [],
    compositionViewManifestPath: cfg.manifestPath, outputPath: `${P}/native/full359.normal-model.json`,
  }
  const nativeCfgPath = put(`native/full359-${stage}.normal-model.config.json`, nativeCfg); copy(nativeCfgPath)
  const model = (await loadGoalBookBuildInputs(nativeCfgPath, cap)).model
  assert.equal(model.pages.length, 359)
  const modelPath = put(`native/full359-${stage}.normal-model.actual.json`, model); models.push(model)
  runs.push({ stage, normalConfig: bind(configPath), copiedMandatoryInputs: copiedInputs, counts: checked.receipt.counts,
    wholeReceipt: bind(wholeReceiptPath), exactOutputs: outputs, model: bind(modelPath), scopes: checked.receipt.scopes })
}
const authorAliases = read(`${C}/candidate/exact-six-source-row-and-three-routing-path-deltas.author-candidate.json`).aliases
const originalPathBySuccessor = new Map(Object.entries(authorAliases).map(([original, successor]) => [successor, original]))
const normalizeWitness = (witness: any) => ({ ...witness,
  mappingPath: originalPathBySuccessor.get(witness.mappingPath) ?? witness.mappingPath,
  sourceExtractionPath: originalPathBySuccessor.get(witness.sourceExtractionPath) ?? witness.sourceExtractionPath,
})
const witnessKey = (witness: any) => stableGoalBookJson(normalizeWitness(witness))
const oldScopes = new Map(runs[0].scopes.map((scope: any) => [scope.key, scope]))
const deltas = runs[1].scopes.map((scope: any) => {
  const before: any = oldScopes.get(scope.key); assert.ok(before)
  const old = new Set(before.witnesses.map(witnessKey)), after = new Set(scope.witnesses.map(witnessKey))
  return { key: scope.key, addedGoalIds: scope.goalIds.filter((id: string) => !before.goalIds.includes(id)),
    removedGoalIds: before.goalIds.filter((id: string) => !scope.goalIds.includes(id)),
    addedWitnesses: scope.witnesses.filter((witness: any) => !old.has(witnessKey(witness))),
    removedWitnesses: before.witnesses.filter((witness: any) => !after.has(witnessKey(witness))) }
})
const affectedScopes = deltas.filter((row: any) => row.addedWitnesses.length || row.removedWitnesses.length || row.addedGoalIds.length || row.removedGoalIds.length)
assert.deepEqual(affectedScopes.map((row: any) => row.key), ['DE-RP/SekII/GK', 'DE-TH/SekII/GK'])
const rp = affectedScopes.find((row: any) => row.key === 'DE-RP/SekII/GK')
assert.deepEqual(rp.addedGoalIds, ['0908b3a2-9937-57de-8bfb-35a6de54aa1f', '642d5ea5-b62f-50c8-b0bd-cf132619725f', '94a62b39-d4a2-5882-99d1-6886ead07726'])
assert.equal(rp.addedWitnesses.length, 10)
const th = affectedScopes.find((row: any) => row.key === 'DE-TH/SekII/GK')
assert.deepEqual(th.removedGoalIds, []); assert.equal(th.removedWitnesses.length, 7)
const thirdDuty = 'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-5-003-416a1404'
const thirdGoals = ['1df17884-96ae-57d7-9da9-dbebd082596f', 'e20d205f-03a4-5f96-b456-9b20460605a2', 'ebfa2c18-0599-5282-bf7a-80c14d86331e']
const oldRp: any = oldScopes.get('DE-RP/SekII/GK'), newRp = runs[1].scopes.find((scope: any) => scope.key === 'DE-RP/SekII/GK')
assert.ok(thirdGoals.every(id => oldRp.goalIds.includes(id) && newRp.goalIds.includes(id)))
assert.deepEqual(rp.addedWitnesses.filter((row: any) => row.sourceGoalId === thirdDuty).map((row: any) => row.goalId).sort(), [...thirdGoals].sort())
const beforePages = new Map(models[0].pages.map((page: any) => [page.goalId, page]))
const actualPages = models[1].pages.filter((page: any) => stableGoalBookJson(page) !== stableGoalBookJson(beforePages.get(page.goalId))).map((page: any) => ({ goalId: page.goalId, wholeBefore: beforePages.get(page.goalId), wholeAfter: page }))
assert.deepEqual(actualPages.map((page: any) => page.goalId).sort(), [...rp.addedGoalIds].sort())
assert.equal(models[0].pages.length - actualPages.length, 356)
put('checks/completed-normal-source-course-scopes-and-full359-native-deltas.independent-c.actual.json', {
  schemaVersion: 1, role: 'Own genuine ordinary technical source follow-up after frozen independent science-FIRST', ownFIRST: FIRST,
  codeBindings: ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookModel.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts'].map(bind),
  runs, all48ScopeDeltas: deltas, actualChangedScopes: affectedScopes,
  actualWhole359PageDeltas: actualPages, unchangedPageCount: 356,
  RPThirdDuty: { sourceGoalId: thirdDuty, wholeOriginalPartners: thirdGoals, addedWholeTargetIdsFromThisRow: [],
    allThreeAlreadyHadOtherCurrentRP_GK_Witnesses: true, wholePartnerRoleApprovalFromTheseCorrosionMetadataChanges: false },
  allOtherNationalOriginalSourcesAndSourceScopeUncertaintiesRetained: true,
  originalWholeTheoryP2AndFourDEENCasesChanged: false, currentP2BindingApprovedBySourceMetadataOnly: false,
  actualIndependentD_P_A_M_VApproval: false, practical003004RemainHold: true,
  nextRequiredNativeScope: 'Exact current 0908,642d,94a62 three changed applicability pages. Any prior source/page/context bindings need targeted current validation; unchanged356 pages need no restart.',
  capsulePathDiagnosticOnly: cap, noOriginalDownloadCachesCopied: true, rootNodeModulesNeverDeleted: true,
  activeWrites: 0, historicalWrites: 0, strictClosures: 0, humanApproval: false,
})
console.log(JSON.stringify({ actualNormalSourceAtlas: 'PASS', publishedCurrentTargets: 359, compiledSourceViews: runs[1].scopes.length,
  changedNativePages: actualPages.map((page: any) => page.goalId), unchangedNativePages: 356,
  RPGKAddedWholeGoals: rp.addedGoalIds, RPGKAddedWitnesses: 10, THGKRemovedWitnesses: 7,
  newRPThirdWholeTargets: 0, practicalHoldsRemain: true, activeWrites: 0, strictClosures: 0 }))
