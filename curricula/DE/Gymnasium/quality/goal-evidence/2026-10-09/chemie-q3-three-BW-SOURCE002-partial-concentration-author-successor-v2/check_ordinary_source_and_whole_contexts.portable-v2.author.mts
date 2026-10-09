// SPDX-License-Identifier: Apache-2.0
// One source contribution correction; ordinary checks are not independent science approval.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, cpSync, symlinkSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { buildGoalBookSourceAtlasInputs, checkGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const R = resolve('.'), D = dirname(fileURLToPath(import.meta.url)), P = relative(R, D)
assert.ok(!existsSync(resolve(D, 'author.final.freeze.json')), 'Never rerun into a frozen package')
const C = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-three-BW-context-bound-practical-companions-author-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(R, path), 'utf8'))
const bind = (path: string) => { const bytes = readFileSync(resolve(R, path)); return { path, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const put = (path: string, value: unknown) => {
  const destination = resolve(D, 'portable-v2/' + path); mkdirSync(dirname(destination), { recursive: true })
  const bytes = typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n'
  writeFileSync(destination, bytes, { flag: 'wx' }); return relative(R, destination)
}
const cap = mkdtempSync(resolve(tmpdir(), 'skillpilot-chemie-source002-atlas-'))
const copy = (path: string) => {
  const destination = resolve(cap, path); mkdirSync(dirname(destination), { recursive: true })
  cpSync(resolve(R, path), destination)
}
const originalCfg = read(`${C}/source-atlas/after.ordinary-scoped.config.json`)
const upperExtraction = read(`${C}/candidate/whole-BW126.source-extraction.json`)
const exactOfficialOriginal = `${C}/primary/official-BW-chemistry-20220325.actual-original.pdf`
const exactOriginalBinding = bind(exactOfficialOriginal)
const inheritedUpperPdfPath = upperExtraction.sourceDocument.path
// The normal snapshot contract makes missing original-download caches optional.
// The exact source bytes remain independently accessible through the committed original binding.
originalCfg.sourceDocumentSnapshots = [...originalCfg.sourceDocumentSnapshots, {
  path: inheritedUpperPdfPath, url: upperExtraction.sourceDocument.url,
  sha256: 'sha256:' + exactOriginalBinding.sha256,
}]
put('source-atlas/exact-portable-primary-snapshot-binding.actual.json', {
  schemaVersion: 1, originalDownloadCachesAreNotRequired: true,
  retainedWholeExtractionPath: `${C}/candidate/whole-BW126.source-extraction.json`,
  inheritedHistoricalUpperDownloadPath: inheritedUpperPdfPath,
  finalSnapshot: originalCfg.sourceDocumentSnapshots.at(-1),
  exactOfficialOriginalBinding: exactOriginalBinding,
  actualOfficialOriginalBytesAvailablePortably: true,
  semanticSourceChanges: 0,
})
const canon = read(originalCfg.landscapePath), kinds = read(originalCfg.semanticKindLedgerPath)
assert.equal(canon.goals.length, 484)
assert.equal(kinds.decisions.filter((row: any) => row.semanticKind === 'curricularAtomic').length, 381)
const ids = read(`${C}/candidate/three-new-whole-DEEN-practical-goals.json`).map((row: any) => row.id)
const successorMap = `${P}/candidate/whole-BW126-220-partners.concentration-partial-successor.review.json`
const runs: any[] = [], sourceModels: any[] = [], compiled: any[] = []
const normalOutput = 'app/scripts/config/goal-books/chemie-BW-source002-portable-inactive'
const cfgBase = {
  ...originalCfg, bookId: 'chemie-BW-source002-portable-inactive',
  outputDirectory: `${normalOutput}/source-views`, manifestPath: `${normalOutput}/source-manifest.json`,
  navigationViewPath: `${normalOutput}/navigation.view.json`, navigationViewId: 'chemie-BW-source002-portable-inactive',
}
const qaPath = `${C}/inputs/visualization-qa.exact.json`
copy(qaPath)
// Public image reads remain exact; the external capsule contains no copied node_modules/cache tree.
mkdirSync(resolve(cap, 'app'), { recursive: true })
symlinkSync(resolve(R, 'app/public'), resolve(cap, 'app/public'), 'dir')
const inputBindings = new Map<string, ReturnType<typeof bind>>()
inputBindings.set(exactOfficialOriginal, exactOriginalBinding)
for (const stage of ['before', 'after']) {
  const mappingPaths = originalCfg.mappingPaths.map((path: string) => stage === 'after' && path.startsWith(C + '/candidate/') ? successorMap : path)
  const cfg = { ...cfgBase, mappingPaths }
  for (const path of [cfg.landscapePath, cfg.semanticKindLedgerPath, cfg.durationModelPolicyPath, ...mappingPaths]) {
    copy(path); inputBindings.set(path, bind(path))
  }
  for (const path of mappingPaths) {
    const extractionPath = read(path).sourceExtractionPath
    copy(extractionPath); inputBindings.set(extractionPath, bind(extractionPath))
    const extraction = read(extractionPath), pdfPath = extraction.sourceDocument.path
    // Existing committed exact official downloads are portable inputs; no new source interpretation.
    if (!cfg.sourceDocumentSnapshots.some((snapshot: any) => snapshot.path === pdfPath)) { copy(pdfPath); inputBindings.set(pdfPath, bind(pdfPath)) }
  }
  const configPath = put(`source-atlas/${stage}.ordinary-scoped.config.json`, cfg); copy(configPath)
  const built = buildGoalBookSourceAtlasInputs(cfg, cap), outputBindings: unknown[] = []
  for (const [path, bytes] of Object.entries(built.outputs)) {
    mkdirSync(dirname(resolve(cap, path)), { recursive: true }); writeFileSync(resolve(cap, path), bytes)
    const archivePath = put(`source-atlas/${stage}-exact-output-archive/${path}`, bytes)
    outputBindings.push({ ordinaryCapsuleOutputPath: path, portableExactArchive: bind(archivePath) })
  }
  const checked = checkGoalBookSourceAtlasInputs(configPath, cap)
  assert.equal(checked.receipt.counts.publishedCurricularAtomicGoals, 189)
  put(`source-atlas/${stage}.whole-ordinary-receipt.actual.json`, checked.receipt)
  const nativeCfg = {
    schemaVersion: 1, bookId: 'chemie-BW-source002-inactive189', title: 'Chemie – inaktive BW-Quellensicht',
    landscapePath: cfg.landscapePath, semanticKindLedgerPath: cfg.semanticKindLedgerPath,
    goalVisualizationQaPath: qaPath, publicationMode: 'review', atlasBaseUrl: 'https://skillpilot.com/lernzielbuch',
    evidenceReviewPaths: [], compositionViewManifestPath: cfg.manifestPath, outputPath: `${P}/native/BW189.actual-model.json`,
  }
  const nativeCfgPath = put(`native/BW189-${stage}.normal-model.config.json`, nativeCfg); copy(nativeCfgPath)
  const loaded = await loadGoalBookBuildInputs(nativeCfgPath, cap)
  assert.equal(loaded.model.pages.length, 189)
  put(`native/BW189-${stage}.normal-model.actual.json`, loaded.model); sourceModels.push(loaded.model)
  for (const scope of checked.receipt.scopes) {
    const manifest = JSON.parse(readFileSync(resolve(cap, cfg.manifestPath), 'utf8'))
    const viewPath = manifest.sourcePaths.find((path: string) => {
      const view = JSON.parse(readFileSync(resolve(cap, path), 'utf8'))
      return view.scope.stage === scope.stage && (view.scope.courseProfile ?? '') === (scope.courseProfile ?? '')
    })
    assert.ok(viewPath)
    const view = normalizeCompositionView(JSON.parse(readFileSync(resolve(cap, viewPath), 'utf8'))), normalCanon = normalizeCanonicalLandscape(canon)
    const findings = compileCompositionView(view, normalCanon).findings
    assert.deepEqual(findings.filter((row: any) => row.severity === 'error'), [])
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(normalCanon.goals.map(goal => [goal.id, goal])))
    const actualChildren = ids.filter((id: string) => roles.targetGoalIds.has(id))
    assert.deepEqual(actualChildren, scope.stage === 'SekI' ? [] : scope.courseProfile === 'GK' ? [ids[0]] : ids)
    compiled.push({ stage, scopeKey: scope.key, actualPracticalChildren: actualChildren, targetGoalIds: [...roles.targetGoalIds].sort(), findings })
  }
  runs.push({ stage, config: bind(configPath), counts: checked.receipt.counts, outputBindings, scopeTargets: checked.receipt.scopes.map((scope: any) => ({ key: scope.key, goalIds: scope.goalIds })) })
}
const sourcePageDiff = sourceModels[1].pages.filter((page: any, index: number) => stableGoalBookJson(page) !== stableGoalBookJson(sourceModels[0].pages[index]))
assert.deepEqual(sourcePageDiff, [])
assert.equal(stableGoalBookJson(sourceModels[0]), stableGoalBookJson(sourceModels[1]))
assert.equal(stableGoalBookJson(runs[0].scopeTargets), stableGoalBookJson(runs[1].scopeTargets))

// Unchanged full candidate book: current source mapping correction changes no goal, tree, profile or raster binding.
const fullCfgPath = `${C}/native/full381.after.normal.config.json`
const fullBefore = read(`${C}/native/full381.after.actual-model.json`)
const fullAfter = (await loadGoalBookBuildInputs(fullCfgPath, R)).model
assert.equal(fullAfter.pages.length, 381)
const fullPageDiff = fullAfter.pages.filter((page: any, index: number) => stableGoalBookJson(page) !== stableGoalBookJson(fullBefore.pages[index]))
assert.deepEqual(fullPageDiff, [])
assert.equal(stableGoalBookJson(fullBefore), stableGoalBookJson(fullAfter))
put('native/full381-source002-unchanged.actual-model.json', fullAfter)
for (const course of ['gk', 'lk']) {
  const viewPath = `${C}/candidate/BW-${course}.learner-view.inactive-successor.json`, view = normalizeCompositionView(read(viewPath)), normalCanon = normalizeCanonicalLandscape(canon)
  const findings = compileCompositionView(view, normalCanon).findings
  assert.deepEqual(findings.filter((row: any) => row.severity === 'error'), [])
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(normalCanon.goals.map(goal => [goal.id, goal])))
  assert.deepEqual(ids.filter((id: string) => roles.targetGoalIds.has(id)), course === 'gk' ? [ids[0]] : ids)
  compiled.push({ kind: 'exact-retained-authored-learner', course, view: bind(viewPath), targetGoalIds: [...roles.targetGoalIds].sort(), findings })
}
put('checks/completed-normal-source002-two-atlases-and-whole381-contexts.actual.json', {
  schemaVersion: 1, role: 'Ordinary technical candidate checks, not a whole-programme or independent source approval',
  ordinaryTools: ['buildGoalBookSourceAtlasInputs', 'checkGoalBookSourceAtlasInputs', 'loadGoalBookBuildInputs', 'compileCompositionView'],
  actualCodeInputs: ['app/scripts/goalBookSourceAtlasInputs.ts', 'app/scripts/goalBookModel.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts'].map(bind),
  actualSourceInputBindings: [...inputBindings.values()], runs, compiled,
  actualWholeBW189PageDiff: sourcePageDiff, actualWholeBW189ModelsExact: true,
  actualWhole381PageDiff: fullPageDiff, actualWhole381ModelExact: true,
  sourceAtlasDoesNotInterpretRawMatchType: 'The ordinary atlas iterates complete mapped decisions and their canonicalGoalIds. Correcting one raw edge matchType does not change a target, material or generated page; exact source-coverage interpretation still needs independent review.',
  protected177CurrentGoalsChanged: 0, goalsChanged: 0, materialOrNumericValuesChanged: 0,
  wholeProgrammeCompletenessClaim: false, DOrVApprovals: 0, newScientificClosures: 0, bindingsRestored: 0,
  strictGain: 0, activeWrites: 0, humanApproval: false,
  externalCapsulePathDiagnosticOnly: cap, allGeneratedOperativeOutputsPortablyArchived: true,
})
console.log(JSON.stringify({ scopedAtlasBeforeAndAfter: 189, fullCandidatePagesExact: 381, changedPages: 0, sourceGKChildren: 1, sourceLKChildren: 3, sourceSekIChildren: 0, activeWrites: 0, strictGain: 0 }))
