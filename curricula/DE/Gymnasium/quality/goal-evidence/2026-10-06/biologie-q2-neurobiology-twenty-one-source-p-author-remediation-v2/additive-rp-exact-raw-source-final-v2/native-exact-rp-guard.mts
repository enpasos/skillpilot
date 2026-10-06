// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { loadGoalBookBuildInputs } from '../../../../../../../../app/scripts/goalBookModel'
const here = dirname(fileURLToPath(import.meta.url))
const base = dirname(here)
const iso = resolve(here, '../../../../../../../../tmp/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-20261006-v2-native-scope')
const write = (name: string, value: any) => writeFileSync(resolve(here, name), JSON.stringify(value, null, 2) + '\n')
const config = JSON.parse(readFileSync(resolve(iso, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'), 'utf8'))
let result: any
let originalError: any
try { result = buildGoalBookSourceAtlasInputs(config, iso) }
catch (e: any) {
  if (!e.message.includes('Source-supported atlas goal count changed') || e.actual !== 375 || e.expected !== 383) throw e
  originalError = { message: e.message, actual: e.actual, expected: e.expected }
  result = buildGoalBookSourceAtlasInputs({ ...config, expectedCurricularAtomicGoalCount: e.actual }, iso)
}
if (!originalError) throw Error('Original383 contract must remain honestly failed')
const exactOutputs: any[] = []
const rawReceipt = JSON.parse(readFileSync(resolve(here, 'RP.exact-two-raw-fields.actual.delta-receipt.json'), 'utf8'))
const receiptInputDeltas: any[] = []
for (const [path, value] of Object.entries(result.outputs)) {
  const bytes = value as string
  const previous = readFileSync(resolve(base, 'native-candidate/generated', path), 'utf8')
  if (bytes !== previous) {
    if (!path.endsWith('/source-projection.receipt.json')) throw Error(`Raw-source correction unexpectedly changes native scope/output: ${path}`)
    const before = JSON.parse(previous), after = JSON.parse(bytes)
    const index = after.inputBindings.findIndex((row: any) => row.path === rawReceipt.isolateOverlayOriginalPath)
    if (index < 0 || before.inputBindings[index].path !== rawReceipt.isolateOverlayOriginalPath) throw Error('RP extraction binding missing')
    if (before.inputBindings[index].sha256 !== `sha256:${rawReceipt.baseCandidateSha256}` || after.inputBindings[index].sha256 !== `sha256:${rawReceipt.effectiveCandidateSha256}`) throw Error('Unexpected RP input binding')
    receiptInputDeltas.push({ path, inputPath: rawReceipt.isolateOverlayOriginalPath, before: before.inputBindings[index].sha256, after: after.inputBindings[index].sha256 })
    after.inputBindings[index].sha256 = before.inputBindings[index].sha256
    if (JSON.stringify(after) !== JSON.stringify(before)) throw Error('Receipt contains changes beyond exact RP extraction digest')
    write('source-projection.after-exact-rp-raw-source.actual.receipt.json', JSON.parse(bytes))
  }
  exactOutputs.push({ path, sha256: createHash('sha256').update(bytes).digest('hex'), exactFrozenBaseBytes: bytes === previous })
  mkdirSync(dirname(resolve(iso, path)), { recursive: true })
  writeFileSync(resolve(iso, path), bytes)
}
const comparisons: any[] = []
for (const [kind, path, baseName, count] of [
  ['sourceAtlas', 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json', 'source-atlas.actual.book-model.json', 375],
  ['fullCatalogue', 'app/scripts/config/goal-books/neuro21-author-full383.json', 'full383.actual.book-model.json', 383],
] as const) {
  const current = (await loadGoalBookBuildInputs(path, iso)).model
  const prior = JSON.parse(readFileSync(resolve(base, 'native-candidate', baseName), 'utf8'))
  if (current.pages.length !== count || JSON.stringify(current.pages) !== JSON.stringify(prior.pages)) throw Error(`${kind} wholepage inputs changed`)
  if (JSON.stringify(current.chapters) !== JSON.stringify(prior.chapters) || JSON.stringify(current.navigation) !== JSON.stringify(prior.navigation)) throw Error(`${kind} context changed`)
  write(`${kind}.after-exact-rp-raw-source.actual.book-model.json`, current)
  comparisons.push({ kind, count, allWholePagesExact: true, allGoalPageFingerprintsExact: true, navigationAndChaptersExact: true, priorModelDigest: prior.digest, currentModelDigest: current.digest })
}
write('native-exact-rp-guard.actual.receipt.json', {
  schemaVersion: 1, nativeOriginal383Contract: { status: 'fail', ...originalError },
  diagnosticActual375Only: true, independentApproval: false, generatedOutputs: exactOutputs,
  exactRPExtractionDigestOnlyReceiptChanges: receiptInputDeltas,
  comparisons, sourceBackedSelectedGoals: 13, openSelectedGoals: 8,
  outsideSelected21NativeTargetLossesStillBlocked: 187,
  affectedProtected67WholepageInputsChangedByThisAdditiveCorrection: 0,
  sciencePMappingScopeAndCourseChanges: [], activeWrites: [],
})
console.log(JSON.stringify({ exit: 0, original383StillFailed: true, sourceAtlas: 375, fullCatalogue: 383, generatedOutputsExact: exactOutputs.length, allWholepageAndContextInputsExact: true, independentApproval: false }))
