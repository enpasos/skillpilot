// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../..')
const require = createRequire(resolve(root, 'app/package.json'))
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const read = async (name: string) => JSON.parse(await readFile(resolve(here, name), 'utf8'))
const snapshot = await read('current-twenty-one.snapshot.json')
const descriptions = await read('description-decisions.candidates.json')
const candidateSet = await read('positive-evidence.candidates.json')
const config = await read('positive-evidence.validation-only.config.json')
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const schema = JSON.parse(await readFile(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8'))
const validate = ajv.compile(schema)
const errors: string[] = []
for (const record of records) {
  if (!validate(record)) errors.push(`${record.goalId}: ${ajv.errorsText(validate.errors)}`)
  if (record.profile.applicationCaseBriefs.length !== 2) errors.push(`${record.goalId}: expected two fresh draft cases`)
  if (record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') errors.push(`${record.goalId}: dishonest draft claim scope`)
}
for (const decision of descriptions.goals) {
  const before = snapshot.goals.find((g: { id: string }) => g.id === decision.goalId)
  for (const [field, value] of [['title', decision.currentTitleDe], ['titleEn', decision.currentTitleEn], ['description', decision.currentDescriptionDe], ['descriptionEn', decision.currentDescriptionEn]]) {
    if (before?.[field] !== value) errors.push(`${decision.goalId}: captured before value mismatch for ${field}`)
  }
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
if (!same(candidateSet.goals.map((g: { goalId: string }) => g.goalId), snapshot.goalIds)) errors.push('P21 scope/order mismatch')
if (!same(descriptions.goals.map((g: { goalId: string }) => g.goalId), snapshot.goalIds)) errors.push('D21 scope/order mismatch')
const current = JSON.parse(await readFile(resolve(root, snapshot.canonicalPath), 'utf8'))
for (const goal of snapshot.goals) {
  if (!same(goal, current.goals.find((g: { id: string }) => g.id === goal.id))) errors.push(`${goal.id}: current active whole object changed since capture`)
}
const receipt = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass_candidate_schema_and_materializer_only',
  recordsBuiltInMemory: records.length,
  completeBilingualInnerProfiles: candidateSet.goals.length,
  draftCases: candidateSet.goals.reduce((n: number, p: any) => n + p.profile.applicationCaseBriefs.length, 0),
  nativeStatuses: [...new Set(records.map((r: any) => r.status))],
  nativeReviewAuthorities: [...new Set(records.map((r: any) => r.reviewAuthority))],
  evidenceLevels: [...new Set(records.map((r: any) => r.evidenceLevel))],
  claimScopes: [...new Set(records.map((r: any) => r.maximumClaimScope))],
  candidateSetSha256: 'sha256:' + createHash('sha256').update(await readFile(resolve(here, 'positive-evidence.candidates.json'))).digest('hex'),
  activeReviewJSONLWritten: false,
  activeCanonicalChanged: false,
  centralRegistryChanged: false,
  independentReviewClaim: false,
  humanApprovalClaim: false,
  syntheticSchoolModelsAndValues: true,
  errors,
  claimLimit: 'Draft P-v2 structural/semantic validation with the existing native materializer in memory only; not source acceptance, independent D/P/A/M/V, a learner demonstration or an active M7 completion.',
}
await writeFile(resolve(here, 'candidate-schema-check.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
