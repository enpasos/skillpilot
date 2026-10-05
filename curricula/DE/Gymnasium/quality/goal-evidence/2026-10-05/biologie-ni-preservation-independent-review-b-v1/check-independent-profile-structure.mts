// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const root = process.cwd()
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const candidate = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-preservation-candidate-v1')
const own = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-preservation-independent-review-b-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const schemaPath = 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'
const schema = read(resolve(root, schemaPath))
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: schema.$defs, ...schema.$defs.profile })
const positive = read(resolve(candidate, 'positive-evidence.candidates.json'))
const checks = positive.goals.map((g: any) => {
  assert.ok(validate(g.profile), ajv.errorsText(validate.errors))
  const expected = new Set(g.profile.expectations.map((e: any) => e.id))
  assert.ok(g.profile.coverageExpectations.requiredExpectationIds.every((id: string) => expected.has(id)))
  assert.equal(g.profile.applicationCaseBriefs.length, 2)
  return { goalId: g.goalId, profileSchemaPassed: true, requiredExpectationIdsExist: true, actualCaseIds: g.profile.applicationCaseBriefs.map((c: any) => c.id) }
})
const receipt = {
  checkedAt: new Date().toISOString(),
  profileSchemaPath: schemaPath,
  profileSchemaSha256: createHash('sha256').update(readFileSync(resolve(root, schemaPath))).digest('hex'),
  positiveCandidateSha256: createHash('sha256').update(readFileSync(resolve(candidate, 'positive-evidence.candidates.json'))).digest('hex'),
  checks,
  claimLimit: 'Only profile schema and declared IDs/case structure. Factual case faults remain open in the independent content receipt.',
  currentStrictClosuresClaimed: 0,
}
writeFileSync(resolve(own, 'profile-structure-check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify(receipt))
