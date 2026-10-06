// Apache-2.0. Read-only native scope-contract exercise; output stays in this folder.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
const destination = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(destination, ...Array(9).fill('..'))
const { LEARNER_COMPOSITION_SCOPE_DIMENSIONS, scoreLearnerCompositionScope } = await import(
  resolve(repoRoot, 'app/src/utils/learnerCompositionScopeMatching.ts')
)
const path = 'contracts/curriculum-package/v1/composition-view.schema.json'
const schemaBytes = readFileSync(resolve(repoRoot, path))
const schema = JSON.parse(schemaBytes.toString('utf8'))
const scope = { schoolForm: 'Gymnasium', jurisdiction: 'DE-SH', stage: 'SekI' }
assert.notEqual(scoreLearnerCompositionScope(scope, scope), null)
assert.equal(scoreLearnerCompositionScope(scope, { ...scope, sourceVersion: '2023' }), null)
assert.equal(scoreLearnerCompositionScope(scope, { ...scope, cohort: 'subject-start-before-2026/27' }), null)
assert.equal(schema.$defs.scope.additionalProperties, false)
assert.equal('cohort' in schema.$defs.scope.properties, false)
assert.equal('sourceVersion' in schema.$defs.scope.properties, false)
const receipt = {
  schemaVersion: 1,
  role: 'author-preparation; no independent verdict',
  performedAtUtc: new Date().toISOString(),
  method: 'Actual import of unchanged native scope matcher; assertions on unchanged closed package scope schema',
  contractPath: path,
  contractSha256: createHash('sha256').update(schemaBytes).digest('hex'),
  nativeScopeDimensions: LEARNER_COMPOSITION_SCOPE_DIMENSIONS,
  checks: [
    { id: 'existing-explicit-seki-scope-matches', passed: true },
    { id: 'sourceVersion-request-rejected', passed: true },
    { id: 'cohort-request-rejected', passed: true },
    { id: 'closed-package-scope-has-no-cohort-version-fields', passed: true },
  ],
  limitation: 'Text metadata or a sidecar may document source version and cohort; current native scope matching cannot select a cohort/version, and the closed package schema cannot add those scope fields.',
}
writeFileSync(resolve(destination, 'native-cohort-contract.actual.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(receipt)}\n`)
