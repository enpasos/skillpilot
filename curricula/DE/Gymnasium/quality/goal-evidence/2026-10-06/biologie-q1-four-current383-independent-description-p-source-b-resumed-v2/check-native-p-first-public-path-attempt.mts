// SPDX-License-Identifier: Apache-2.0
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
const out = dirname(fileURLToPath(import.meta.url))
const root = resolve(out, '../../../../../../..')
const author = resolve(out, '../biologie-q1-three-current383-author-continuation-v2')
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const startedAt = new Date().toISOString()
const errors: string[] = []
const frozen = (await read(resolve(author, 'positive-four.native-candidate-records.json'))).records
const config = await read(resolve(author, 'positive-four.validation-only.config.json'))
const candidates = await read(resolve(author, 'positive-four.inner-candidates.json'))
const rebuilt = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates })
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(await read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
for (let index = 0; index < frozen.length; index++) {
  const record = frozen[index]
  if (!validate(record)) errors.push(`${record.goalId}: ${ajv.errorsText(validate.errors)}`)
  if (JSON.stringify(record) !== JSON.stringify(rebuilt[index])) errors.push(`${record.goalId}: frozen/rebuilt native records differ`)
  if (record.reviewAuthority !== 'ai_candidate' || record.status !== 'needs_human_review'
      || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') errors.push(`${record.goalId}: invalid claim boundary`)
}
const receipt = { schemaVersion: 1, startedAt, completedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass', checker: 'Unchanged native buildPositiveGoalEvidenceCandidateRecords (including semantic/fingerprint/resource checks) and native P-v2 AJV schema',
  records: frozen.length, syntheticCases: frozen.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0),
  frozenAndNativeRebuiltRecordsExact: errors.length === 0, errors, sourceScopesApproved: false, empiricalLearnerEvidence: false, activeWrites: 0, humanApproval: false }
await writeFile(resolve(out, 'positive-four-native-schema-and-bindings.actual.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
