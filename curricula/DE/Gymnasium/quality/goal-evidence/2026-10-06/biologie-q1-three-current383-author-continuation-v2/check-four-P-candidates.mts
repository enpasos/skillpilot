// SPDX-License-Identifier: Apache-2.0
// Native author validation in the physical isolate; no active review writes.
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'

const directory = dirname(fileURLToPath(import.meta.url))
const root = resolve(directory, '../../../../../../..')
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const candidateSet = await read(resolve(directory, 'positive-four.inner-candidates.json'))
const config = await read(resolve(directory, 'positive-four.validation-only.config.json'))
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
const schema = await read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(schema)
const errors: string[] = []
for (const record of records) {
  if (!validate(record)) errors.push(`${record.goalId}: ${ajv.errorsText(validate.errors)}`)
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate'
      || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') {
    errors.push(`${record.goalId}: unexpected authority/claim level`)
  }
}
const receipt = {
  checkedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass_native_candidate_schema_and_semantics_only',
  targetGoalIds: records.map(({ goalId }) => goalId),
  records: records.length,
  freshSyntheticCases: records.reduce((sum, record) => sum + record.profile.applicationCaseBriefs.length, 0),
  evidenceLevel: 'E1', maximumClaimScope: 'G1',
  authority: 'ai_candidate', statusOfRecords: 'needs_human_review',
  reviewedResourceTypes: config.reviewedResourceTypes,
  activeWrites: 0, humanApproval: false, errors,
  claimLimit: 'Unregistered prospective records with actual candidate asset bindings. Native structure/semantics validation is not an independent content review or D/P/A/M/V completion.',
}
await writeFile(resolve(directory, 'positive-four.native-candidate-records.json'), JSON.stringify({records}, null, 2) + '\n')
await writeFile(resolve(directory, 'positive-four.native-schema.actual.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
