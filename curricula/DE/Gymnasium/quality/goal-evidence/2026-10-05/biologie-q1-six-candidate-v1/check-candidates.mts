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
const config = await read(resolve(directory, 'positive-evidence.validation-only.config.json'))
const candidateSet = await read(resolve(directory, 'positive-evidence.candidates.json'))
const descriptions = await read(resolve(directory, 'description-decisions.candidates.json'))
const snapshot = await read(resolve(directory, 'current-six.snapshot.json'))
const companions = await read(resolve(directory, 'split-companions.candidates.json'))
const sourcePlan = await read(resolve(directory, 'source-remediation.plan.json'))
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const schema = await read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const validateRecord = ajv.compile(schema)
const validateInnerProfile = ajv.compile({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $defs: schema.$defs,
  ...schema.properties.profile,
})
const errors: string[] = []
for (const r of records) {
  if (!validateRecord(r)) errors.push(`${r.goalId}: ${ajv.errorsText(validateRecord.errors)}`)
}
const unmintedProfiles = [...companions.goals, sourcePlan.lowerStageVariationCandidate]
for (const c of unmintedProfiles) {
  if (!validateInnerProfile(c.profile)) errors.push(`${c.candidateKey}: ${ajv.errorsText(validateInnerProfile.errors)}`)
  const expectationIds = new Set(c.profile.expectations.map((e: { id: string }) => e.id))
  for (const id of c.profile.coverageExpectations.requiredExpectationIds) {
    if (!expectationIds.has(id)) errors.push(`${c.candidateKey}: unknown required expectation ${id}`)
  }
  if (c.profile.applicationCaseBriefs.length < 2) errors.push(`${c.candidateKey}: insufficient fresh cases`)
}
for (const d of descriptions.goals) {
  const current = snapshot.goals.find((g: { id: string }) => g.id === d.goalId)
  for (const [field, value] of [
    ['title', d.currentTitleDe], ['titleEn', d.currentTitleEn],
    ['description', d.currentDescriptionDe], ['descriptionEn', d.currentDescriptionEn],
  ]) {
    if (current?.[field] !== value) errors.push(`${d.goalId}: before value differs from captured current ${field}`)
  }
}
const ids = snapshot.goalIds
if (JSON.stringify(candidateSet.goals.map((g: { goalId: string }) => g.goalId)) !== JSON.stringify(ids)) {
  errors.push('Six-goal P order/scope mismatch')
}
const receipt = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass_candidate_schema_and_semantics_only',
  originalGoalProfiles: records.length,
  companionInnerProfiles: companions.goals.length,
  lowerStagePreservationInnerProfiles: 1,
  totalFreshCases: records.reduce((sum, r) => sum + r.profile.applicationCaseBriefs.length, 0)
    + unmintedProfiles.reduce((sum: number, c: any) => sum + c.profile.applicationCaseBriefs.length, 0),
  recordAuthority: 'ai_candidate',
  proposedScopeSnapshotOnly: true,
  activeRecordFilesWritten: false,
  centralRegistryChanged: false,
  errors,
  claimLimit: 'Validation of inner P-v2 structure and generated proposed-scope records in memory. It is not an independent content review, source decision, current-canonical binding, active asset V approval, D/P/A/M/V completion, or human acceptance.',
}
await writeFile(resolve(directory, 'candidate-schema-check.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
