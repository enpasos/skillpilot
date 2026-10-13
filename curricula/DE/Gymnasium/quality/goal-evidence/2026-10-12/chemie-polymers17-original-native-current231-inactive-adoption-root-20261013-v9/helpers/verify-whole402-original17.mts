// Apache-2.0. Actual asset bytes and unchanged production BookModel APIs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd(), E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const O = `${E}/chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1`, F = `${E}/chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9`
const read = (p: string): any => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const sha = (p: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')}`
const write = (p: string, x: unknown) => {
  const bytes = Buffer.from(`${JSON.stringify(x, null, 2)}\n`), path = resolve(root, p)
  mkdirSync(dirname(path), { recursive: true })
  if (existsSync(path)) assert.ok(readFileSync(path).equals(bytes), p)
  else writeFileSync(path, bytes, { flag: 'wx' })
}
const normal: any = await import(pathToFileURL(resolve(root, 'app/scripts/goalBookModel.ts')).href)
const subset: any = await import(pathToFileURL(resolve(root, 'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const originalConfig = read(`${O}/configs/whole402.inactive.config.json`)
const config = { ...originalConfig, evidenceReviewPaths: [originalConfig.evidenceReviewPaths[0], `${F}/positive/P17.original-author-native-bound.raw-exact.jsonl`], outputPath: `${F}/models/whole402.current231-plus-original17.inactive.normal.json` }
write(`${F}/configs/whole402.current231-plus-original17.inactive.config.json`, config)
const six = read(`${E}/chemie-polymers-3aef-no-melt-flow-author-successor-20261013-v4/six.resource-bindings.one-thermal-successor.json`).bindings
const assetByUrl = new Map(six.map((b: any) => [b.candidateResourceLinks[0].url, b]))
const qa = read(config.goalVisualizationQaPath), digests: Record<string, string> = {}, assetProof: any[] = []
for (const record of qa.records) {
  if (record.visualizationState !== 'available') continue
  const candidate: any = assetByUrl.get(record.imageUrl), path = candidate ? candidate.actualCandidateAssetPath : record.publicAssetPath
  const actual = sha(path)
  assert.equal(actual, record.assetSha256, record.goalId)
  digests[record.imageUrl] = actual
  if (candidate) assetProof.push({ goalId: record.goalId, path, imageUrl: record.imageUrl, sha256: actual, unchangedActualVQaRecord: record })
}
assert.equal(assetProof.length, 6)
const model = normal.buildGoalBookModel({ landscape: read(config.landscapePath), compositionView: read(config.compositionViewPath), semanticKindLedger: read(config.semanticKindLedgerPath), goalVisualizationQa: qa, goalVisualizationAssetDigests: digests, evidenceReviewSources: config.evidenceReviewPaths.map((path: string) => ({ path, text: readFileSync(resolve(root, path), 'utf8') })), config })
normal.parseAndValidateGoalBookModel(model)
assert.equal(model.pages.length, 402)
const original = normal.parseAndValidateGoalBookModel(read(`${O}/models/whole402.current231-plus-author18.final-inputs.normal.json`))
const base = normal.parseAndValidateGoalBookModel(read(`${O}/models/whole402.current231.normal-base.json`))
const native = normal.parseAndValidateGoalBookModel(read(`${O}/native-D18/bundle/book-model.json`))
const manifest = read(`${O}/native-D18/batch-manifest.json`)
const index = read(`${F}/resolution-index.original17.aggregate-v1.json`), ids = index.resolutions.map((r: any) => r.goalId), held = read(`${F}/HOLD.three-current-goals.not-adopted.json`).goalIds
const originalPages = new Map(original.pages.map((p: any) => [p.goalId, p])), basePages = new Map(base.pages.map((p: any) => [p.goalId, p]))
const currentDiff: any[] = [], originalDiff: any[] = []
for (const page of model.pages) {
  if (normal.stableGoalBookJson(page) !== normal.stableGoalBookJson(originalPages.get(page.goalId))) originalDiff.push({ goalId: page.goalId, fields: Object.keys(page).filter(k => normal.stableGoalBookJson(page[k]) !== normal.stableGoalBookJson((originalPages.get(page.goalId) as any)[k])) })
  if (normal.stableGoalBookJson(page) !== normal.stableGoalBookJson(basePages.get(page.goalId))) currentDiff.push(page.goalId)
}
assert.deepEqual(originalDiff.map(p => p.goalId), ['f947cd04-952a-5a9d-9445-3ffc70e02c3c'])
assert.deepEqual(originalDiff[0].fields, ['evidenceReview', 'pageFingerprint'])
assert.deepEqual(new Set(currentDiff), new Set(ids))
for (const goalId of held) assert.equal(normal.stableGoalBookJson(model.pages.find((p: any) => p.goalId === goalId)), normal.stableGoalBookJson(basePages.get(goalId)), goalId)
const reconstructedOriginal18 = subset.buildGoalDescriptionRolloutSubsetModel({ baseModel: model, goalIds: manifest.goalIds, bookId: native.book.id, title: native.book.title })
const originalNativePages = new Map(native.pages.map((p: any) => [p.goalId, p]))
for (const goalId of ids) assert.equal(normal.stableGoalBookJson(reconstructedOriginal18.pages.find((p: any) => p.goalId === goalId)), normal.stableGoalBookJson(originalNativePages.get(goalId)), goalId)
const protectedIds = read(`${O}/checks/protected231-full-current-tuple-and-registry-bindings.actual.json`).protectedCurrentTuples.map((p: any) => p.goalId)
assert.equal(protectedIds.length, 231)
for (const goalId of protectedIds) assert.equal(normal.stableGoalBookJson(model.pages.find((p: any) => p.goalId === goalId)), normal.stableGoalBookJson(basePages.get(goalId)), goalId)
write(config.outputPath, model)
write(`${F}/checks/whole402-original17-profile-fallback-and-actual-V-retention.actual.json`, { schemaVersion: 1, checkedAtUTC: new Date().toISOString(), normalModuleBindings: ['app/scripts/goalBookModel.ts', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'].map(path => ({ path, sha256: sha(path) })), normalWhole402ModelPath: config.outputPath, normalWhole402ModelDigest: model.digest, current402PageOrderExact: JSON.stringify(model.pages.map((p: any) => p.goalId)) === JSON.stringify(base.pages.map((p: any) => p.goalId)), changedWholePagesComparedToCurrent231: currentDiff, original18FullModelChanges: originalDiff, original17Whole402PagesExact: true, original17NativePagesRegeneratedExactlyAtOriginal18Order: true, globalOriginal18BundleAndReviewIdentitiesStillRetainedNotRebound: true, held3PagesEqualCurrentUnacceptedBaseline: true, protected231WholePagesExact: true, actualImmutableSixVBindings: assetProof, normalActualByteDigestsTransport: 'GoalBookBuildInput.goalVisualizationAssetDigests from actual original files; no active image copies or renderer substitute', reusedM402: true, noRerenderOrRereview: true, activeWrites: false, newScientificVotes: 0, humanApproval: false })
console.log(JSON.stringify({ normalModel402: true, currentChangedExactly17: true, original17WholeAndNativePagesExact: true, held3FallbackExact: true, protected231Exact: true, sixActualVAssetsExact: true, activeWrites: false }))
