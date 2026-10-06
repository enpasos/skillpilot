import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const repo = resolve('.')
const own = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-mv-heading-location-v8-independent-a-followup-v1')
assert(!existsSync(resolve(own, 'independent-a-v8-heading-followup.final.freeze.json')), 'Frozen review')
const oldPackage = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-eleven-source-topic-v7-independent-a-followup-v1'
const v7 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-source-topic-corrections-author-v7'
const v8 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-mv-heading-location-targeted-author-v8'
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const previous = read(oldPackage + '/independent-native-reproduction.actual.raw.json')
const effective = read(v7 + '/effective-native-inputs.author-v7.json')
const oldRoot = resolve(repo, previous.sparseRoot)
const newRoot = resolve('tmp/biologie-q1-mv-heading-v8-independent-a-thin/sparse-root')
assert(!existsSync(newRoot), 'Fresh isolated output required')
const v8Envelope = read(v8 + '/MV.source-components.author-v8.inert-envelope.json')
const changedPath = v8Envelope.prospectivePath
const expectedNewBytes = JSON.stringify(v8Envelope.candidatePayload, null, 2) + '\n'
for (const input of previous.effectiveNativeInputs) {
  const before = resolve(oldRoot, input.path)
  assert.equal('sha256:' + sha(before), input.sha256, 'Changed previous native input: ' + input.path)
  const dest = resolve(newRoot, input.path)
  mkdirSync(dirname(dest), { recursive: true })
  if (input.path === changedPath) writeFileSync(dest, expectedNewBytes)
  else symlinkSync(before, dest)
}
const config = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
config.expectedCurricularAtomicGoalCount = 390
for (const input of effective.sourceInputs) if (input.kind === 'source-mapping') config.mappingPaths.push(input.prospectivePath)
const before = buildGoalBookSourceAtlasInputs(config, oldRoot)
const after = buildGoalBookSourceAtlasInputs(config, newRoot)
assert.deepEqual(before.receipt.inputBindings, previous.effectiveNativeInputs)
assert.deepEqual(Object.keys(before.outputs), Object.keys(after.outputs))
const receiptPath = config.outputDirectory + '/source-projection.receipt.json'
const unchangedOutputs = Object.keys(before.outputs).filter(path => path !== receiptPath)
for (const path of unchangedOutputs) assert.equal(before.outputs[path], after.outputs[path], 'Changed view/manifest/navigation: ' + path)
assert.notEqual(before.outputs[receiptPath], after.outputs[receiptPath])
const changedBindings = before.receipt.inputBindings.flatMap((input: any, index: number) => {
  const next = after.receipt.inputBindings[index]
  assert.equal(next.path, input.path)
  return next.sha256 === input.sha256 ? [] : [{ path: input.path, before: input.sha256, after: next.sha256 }]
})
assert.equal(changedBindings.length, 1)
assert.equal(changedBindings[0].path, changedPath)
assert.equal(changedBindings[0].after, 'sha256:' + createHash('sha256').update(expectedNewBytes).digest('hex'))
const semanticReceipt = (value: any) => Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'inputBindings'))
assert.deepEqual(semanticReceipt(before.receipt), semanticReceipt(after.receipt))
for (const code of previous.nativeCode) assert.equal(sha(resolve(repo, code.path)), code.sha256, 'Changed native code: ' + code.path)
const report = {
  schemaVersion: 1, createdAtUTC: new Date().toISOString(), role: 'actual independent affected-input comparison v7/v8 only',
  nativeSourceAtlas: 'PASS390', nativeCountContract: 390, countOverrideUsed: false,
  sourceViewCount: after.receipt.scopes.length, omittedGoals: after.receipt.omittedGoals,
  currentInputBindings: after.receipt.inputBindings, changedBindings,
  actualChangedOutput: receiptPath, allOtherNativeOutputsExact: unchangedOutputs,
  allScopeGoalIDsWitnessesAndCountsExact: true,
  bookModelReuse: {
    method: 'All exact native BookModel input views, manifest, navigation, canonical, semantics and code remain unchanged. The altered SourceAtlas input receipt is not a BookModel argument.',
    inheritedActualResult: previous.pureBookModel, nativeNewBookModelExecuted: false,
    old383AndProtected67PageFingerprintVerification: 'exact reuse, no relevant field or model input changed',
  },
  fullGUIViewsReuse: previous.existingFullGUIViewChecks,
  sourceSectionContextConsumedByNativeSourceAtlas: false,
  sourceSectionContextStillRequiredForTruthfulScientificSourceBindings: true,
  nativeCodeBindings: previous.nativeCode,
  originalNativeResultPath: oldPackage + '/independent-native-reproduction.actual.raw.json',
  prospectiveExtractionPathUnchanged: true,
  pdfRenderOrFullBuildExecuted: false, activeWrites: false, nativeDGranted: false, strictGain: 0,
}
writeFileSync(resolve(own, 'affected-native-source-atlas-receipt-and-book-reuse.actual.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ sourceAtlas: 'PASS390', changedInputBindings: changedBindings.length,
  exactViewManifestAndNavigationOutputs: unchangedOutputs.length, sourceViews: report.sourceViewCount,
  bookModel: 'exact input reuse, no repeat', activeWrites: false, strictGain: 0 }))
