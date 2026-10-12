import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalBookModel, stableGoalBookJson } from '../../app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '../../app/scripts/materializeGoalDescriptionRolloutBatch'

const root = process.cwd()
const evidence = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const out = `${evidence}/chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9`
const author = `${evidence}/chemie-q3-three-current402-real-method-source-author-20261012-v8`
const ids = ['81373fb7-2a4a-5b2c-acd0-b4e775acaa65', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09']
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const put = (path: string, value: unknown) => {
  const file = resolve(root, path)
  assert.equal(existsSync(file), false, `Additive output already exists: ${path}`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value, null, 2) + '\n')
}
const config = read(`${out}/configs/whole402.inactive.config.json`)
const landscape = read(config.landscapePath)
const qa = read(config.goalVisualizationQaPath)
const refs = read(`${out}/assets/three-exact-author-image-source-bindings.json`).assetsByGoalId
const digests: Record<string, string> = {}
const verified: Array<{ goalId: string; path: string; sha256: string }> = []
for (const record of qa.records) {
  if (record.visualizationState !== 'available') continue
  const path = refs[record.goalId]?.path ?? record.publicAssetPath
  const sha256 = 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex')
  assert.equal(sha256, record.assetSha256, `Actual QA asset mismatch: ${record.goalId}`)
  digests[record.imageUrl] = sha256
  verified.push({ goalId: record.goalId, path, sha256 })
}
const model = buildGoalBookModel({
  landscape,
  compositionView: read(config.compositionViewPath),
  semanticKindLedger: read(config.semanticKindLedgerPath),
  goalVisualizationQa: qa,
  goalVisualizationAssetDigests: digests,
  evidenceReviewSources: config.evidenceReviewPaths.map((path: string) => ({ path, text: readFileSync(resolve(root, path), 'utf8') })),
  config,
})
assert.equal(model.pages.length, 402)
put(config.outputPath, model)
const old = read(`${author}/native/whole402.normal-model.json`)
const oldPages = new Map<string, any>(old.pages.map((p: any) => [p.goalId, p]))
const changed = model.pages.filter(p => p.pageFingerprint !== oldPages.get(p.goalId)!.pageFingerprint).map(p => p.goalId)
const targetAudit = ids.map(goalId => {
  const current = model.pages.find(p => p.goalId === goalId)!
  const previous = oldPages.get(goalId)!
  return { goalId, currentGoalFingerprint: current.goalFingerprint, authorGoalFingerprint: previous.goalFingerprint, currentPageFingerprint: current.pageFingerprint, authorPageFingerprint: previous.pageFingerprint, exactWholePage: stableGoalBookJson(current) === stableGoalBookJson(previous) }
})
const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: model, goalIds: ids, bookId: 'chemie-q3-three-current217-preserving-native-v9', title: 'Chemie – Gleichgewicht, Spannungsreihe und Primärzellen' })
put(`${out}/native/three.current-inputs.normal-subset-model.json`, subset)
put(`${out}/checks/normal-current402-model-and-target-three.actual.json`, {
  schemaVersion: 1,
  role: 'Unmodified production model and subset APIs; technical verification only',
  currentCurricularAtomicPages: model.pages.length,
  nativeSubsetPages: subset.pages.length,
  actualAvailableAssetDigestsVerified: verified,
  originalAuthorFull402ModelPath: `${author}/native/whole402.normal-model.json`,
  changedFullPageFingerprintsComparedWithAuthorV8: changed,
  targetAudit,
  newIndependentVotes: 0,
  strictGain: 0,
  activeWrites: false,
  HumanApproval: false,
  HumanTrial: false,
})
console.log(JSON.stringify({ fullModel: model.pages.length, subset: subset.pages.length, changedFullPages: changed.length, targetAudit, verifiedAssets: verified.length, strictGain: 0 }))
