// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const own = dirname(fileURLToPath(import.meta.url)), root = resolve(own, '../../../../../../..')
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const sha = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const freeze = await read(resolve(own, 'D-before-P.freeze.receipt.json'))
if (sha(await readFile(resolve(own, freeze.file))) !== freeze.sha256 || freeze.positiveEvidenceReadBeforeFreeze !== false) throw new Error('D freeze is not intact')
const path = resolve(own, '../chemie-8ceb-split-scope-preservation-candidate-v1/positive-evidence.full.candidates.json')
const input = await read(path), schema = await read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default, addFormats = require('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv)
const validate = ajv.compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', $defs: schema.$defs, ...schema.$defs.profile })
const results = input.goals.map((goal: any) => ({ goalId: goal.goalId, profileSchemaPass: Boolean(validate(goal.profile)), schemaErrors: validate.errors, applicationCases: goal.profile.applicationCaseBriefs.length, freshVariationRequired: goal.profile.coverageExpectations.freshVariationRequired, independentTransferRequired: goal.profile.coverageExpectations.independentTransferRequired }))
const receipt = { schemaVersion: 1, checkedAt: new Date().toISOString(), status: results.every((r: any) => r.profileSchemaPass && r.applicationCases === 2 && r.freshVariationRequired && r.independentTransferRequired) && results.length === 2 ? 'pass_two_current_candidate_inner_profiles' : 'fail', pInputPath: path.slice(root.length + 1), pInputSha256: sha(await readFile(path)), dFrozenFirstAndUnchanged: true, frozenDFileSha256: freeze.sha256, results, molecularConservationChecks: [ { givenModel: 'C10H22 → C8H18 + C2H4', carbonBefore: 10, carbonAfter: 8 + 2, hydrogenBefore: 22, hydrogenAfter: 18 + 4 }, { givenModel: 'C12H26 → C8H18 + C4H8', carbonBefore: 12, carbonAfter: 8 + 4, hydrogenBefore: 26, hydrogenAfter: 18 + 8 }, { rejectedSoleInputModel: 'C12H26 → C8H18 + C4H10', carbonBefore: 12, carbonAfter: 8 + 4, hydrogenBefore: 26, hydrogenAfter: 18 + 10, additionalHydrogenRequired: 2 } ], currentBindingOrGateCompletionClaimed: false, currentStrictClosuresClaimed: 0 }
await writeFile(resolve(own, 'P-contract-check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify({ status: receipt.status, results, frozenDUnchanged: true }))
if (receipt.status === 'fail') process.exitCode = 1
