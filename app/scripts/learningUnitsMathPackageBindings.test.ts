import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { historicalMathPackageBindingOptions, prepareMathPackageBindings } from './learningUnitsMathPackageBindings'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const historical = historicalMathPackageBindingOptions
const candidate = prepareMathPackageBindings(historical)
assert.equal(candidate.reviewedInputSha256, '7161645e4f575c37af9e4c9d8680db38363bb1339f2c304f769196c3249f5971')
assert.equal(candidate.reviewedInputSha256, JSON.parse(read(`curricula/${historical.reviewReceiptPath}`)).reviewedInputSha256)
assert.equal(candidate.catalog.contracts.length, 9, 'Historical package must not acquire the live 21-contract catalog')
assert.equal(digest(canonicalJson(candidate.reviewInput)), candidate.reviewedInputSha256)
const admitted = prepareMathPackageBindings(historical, true)
for (const [path, bytes] of admitted.artifacts) assert.equal(read(path), bytes, `Historical V2 byte replay changed ${path}`)
assert.equal(digest(canonicalJson(admitted.reviewInput)), admitted.reviewedInputSha256,
  'Appending decision evidence must not mutate the already reviewed input')
assert.equal(Object.keys(candidate.binder.inputs).length, 130)
assert.equal(Object.keys(admitted.binder.inputs).length, 133)
assert.ok(!(JSON.parse(read('app/scripts/config/learning-units/math-package-entry.json')).reviewRef in candidate.binder.inputs),
  'Historical Entry-review boundary remains the exact approved V2 recipe')
assert.throws(() => prepareMathPackageBindings({ ...historical, sourceCatalogPath: 'curricula/DE/Gymnasium/learning-units/catalog.json' }), /Historical V2 recipe/)
const next = { ...historical, revision: 'math-package-test-next',
  reviewRef: 'DE/Gymnasium/quality/learning-units/math-package-test-next.md',
  reviewReceiptPath: 'DE/Gymnasium/quality/learning-units/math-package-test-next.review.json',
  proofPath: 'docs/dev/math-package-test-next.json' }
assert.throws(() => prepareMathPackageBindings({ ...next, nativeSelectionConfigPath: 'app/scripts/config/learning-units/math-current-offer-roots-v3.json' }), /selection revisions differ/)
assert.throws(() => prepareMathPackageBindings({ ...next, reviewReceiptPath: historical.reviewReceiptPath }), /review and receipt paths differ/)
assert.throws(() => prepareMathPackageBindings({ ...next, proofPath: '../unsafe.json' }), /Unsafe package binding path/)
assert.throws(() => prepareMathPackageBindings(next), /explicitly admitted native binder/)
assert.throws(() => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/learningUnitsMathPackageBindings.ts',
  '--prepare', '--revision', next.revision], { cwd: resolve(root, 'app'), stdio: 'pipe' }), /explicit --native-binder/)
assert.throws(() => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/learningUnitsMathPackageBindings.ts',
  '--prepare', '--native-binder'], { cwd: resolve(root, 'app'), stdio: 'pipe' }), /Missing value for --native-binder/)
assert.throws(() => execFileSync(process.execPath, ['--import', 'tsx', 'scripts/learningUnitsMathPackageBindings.ts',
  '--prepare', '--native-bindr', historical.nativeBinderPath], { cwd: resolve(root, 'app'), stdio: 'pipe' }), /Unknown package binding argument/)
console.log('Package bindings: exact frozen-nine V2 input/proof/binder/catalog replay; immutable reviewed-input boundary; explicit new-generation selection, admission and review arguments enforced; no new package produced')
