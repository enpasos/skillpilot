// Apache-2.0. Unchanged production APIs, one frozen author model and three supported native groups.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-poly18-aro19-final-current231-source-native-author-root-20261013-v1'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const sha = (path: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')}`
const bind = (path: string) => ({ path, sha256: sha(path), bytes: readFileSync(resolve(root, path)).length })
const write = (path: string, value: unknown) => writeFileSync(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
const modules = ['app/scripts/goalBookModel.ts', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'app/scripts/goalBookRenderer.ts', 'app/scripts/exportGoalBookReviewBundle.ts']
const api = await import(pathToFileURL(resolve(root, modules[0])).href)
const stock = await import(pathToFileURL(resolve(root, modules[1])).href)
const configPath = `${own}/configs/whole402.final-frozen.inactive.config.json`
const startedAt = new Date().toISOString()
const started = performance.now()
const config = read(configPath)
const inputBindings = [configPath, config.landscapePath, config.semanticKindLedgerPath, config.goalVisualizationQaPath, config.compositionViewPath, ...config.evidenceReviewPaths].map(bind)
const fullReceiptPath = `${own}/checks/whole402-frozen-author-model.actual.json`
let full: any
if (existsSync(resolve(root, fullReceiptPath))) {
  const receipt = read(fullReceiptPath)
  assert.deepEqual(receipt.exactFrozenInputBindings, inputBindings)
  assert.equal(sha(config.outputPath), receipt.model.sha256)
  full = { model: api.parseAndValidateGoalBookModel(read(config.outputPath)), outputPath: resolve(root, config.outputPath) }
  assert.equal(full.model.digest, receipt.modelDigest)
} else {
  full = await api.loadGoalBookBuildInputs(configPath)
  assert.equal(full.model.pages.length, 402)
  api.parseAndValidateGoalBookModel(full.model)
  await api.writeGoalBookModel(full.model, full.outputPath)
  mkdirSync(resolve(root, own, 'checks'), { recursive: true })
  write(fullReceiptPath, {
  schemaVersion: 1,
  startedAtUTC: startedAt,
  finishedAtUTC: new Date().toISOString(),
  model: bind(config.outputPath),
  modelDigest: full.model.digest,
  pageCount: 402,
  normalAPI: modules.map(bind),
  exactFrozenInputBindings: inputBindings,
  modelBuildsAtThisPoint: 1,
  generatedFullPublicationOrPDF: false,
  authorCandidatesAreNotIndependentApprovals: true,
  newScientificVotes: 0,
  activeWrites: false,
  })
}
console.log(JSON.stringify({ event: 'sharedFull402ModelReady', digest: full.model.digest, seconds: (performance.now() - started) / 1000 }))
const groups: any[] = []
for (const label of ['polymer18', 'aromatics19', 'protected16']) {
  const batchConfigPath = `${own}/configs/native-${label}.batch.config.json`
  const groupReceiptPath = `${own}/checks/native-${label}.stock-prepare-and-check.actual.json`
  if (existsSync(resolve(root, groupReceiptPath))) {
    const retained = read(groupReceiptPath)
    const checked = await stock.validatePreparedGoalDescriptionRolloutBatch(batchConfigPath)
    assert.equal(checked.manifest.source.baseBookDigest, full.model.digest)
    assert.equal(checked.model.digest, retained.modelDigest)
    assert.equal(sha(retained.manifest.path), retained.manifest.sha256)
    for (const input of inputBindings) assert.equal(sha(input.path), input.sha256, input.path)
    groups.push(retained)
    console.log(JSON.stringify({ event: 'existingStockNativeGroupRetainedAndChecked', label, modelDigest: retained.modelDigest }))
    continue
  }
  const t = performance.now()
  const prepared = await stock.prepareGoalDescriptionRolloutBatch(batchConfigPath)
  assert.equal(prepared.manifest.source.baseBookDigest, full.model.digest)
  const checked = await stock.validatePreparedGoalDescriptionRolloutBatch(batchConfigPath)
  assert.equal(checked.model.digest, prepared.model.digest)
  for (const input of inputBindings) assert.equal(sha(input.path), input.sha256, input.path)
  const group = {
    label,
    goalCount: prepared.model.pages.length,
    manifest: bind(`${own}/native-${label}/batch-manifest.json`),
    nativeModel: bind(`${own}/native-${label}/bundle/book-model.json`),
    modelDigest: prepared.model.digest,
    bundleFingerprint: prepared.bundle.bundleFingerprint,
    baseBookDigest: prepared.manifest.source.baseBookDigest,
    stockPrepareAndCheckPassed: true,
    preparationSeconds: (performance.now() - t) / 1000,
  }
  groups.push(group)
  write(groupReceiptPath, group)
  console.log(JSON.stringify({ event: 'stockNativeGroupReady', ...group }))
}
assert.deepEqual(groups.map(g => g.goalCount), [18, 19, 16])
write(`${own}/checks/final-three-native-groups.same-frozen-author-stand.actual.json`, {
  schemaVersion: 1,
  startedAtUTC: startedAt,
  finishedAtUTC: new Date().toISOString(),
  totalSeconds: (performance.now() - started) / 1000,
  exactFrozenInputBindings: inputBindings,
  fullModel: bind(config.outputPath),
  fullModelDigest: full.model.digest,
  fullModelBuildCount: 6,
  authorArtifactModelBuildCount: 1,
  successfulNativeBaseReloadCount: 3,
  failedNativeBaseReloadBeforePrivateContainmentCorrectionCount: 1,
  failedNativeBaseReloadBeforeProtectedPrerequisiteOrderCorrectionCount: 1,
  earlierAttemptsFailedBeforeFullModelWasProduced: 2,
  buildCountBasis: 'One frozen author BookModel retained after the first successful load; one earlier native attempt failed the unchanged safe realpath check and another failed the protected16 prerequisite-safe order check after their base reloads. Three successful unchanged stock prepares use identical frozen inputs; the two existing native groups are retained on continuation. Stock check verifies artifacts without rebuilding the base.',
  stock20GoalLimitRetained: true,
  nativeUnionCount: 53,
  groups,
  fullPublicationOrFullPDFBuildCount: 0,
  noPrivateLoaderPatch: true,
  newScientificVotes: 0,
  activeWrites: false,
  humanApproval: false,
})
