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
const config = await read('positive-evidence.independent-a.config.json')
const candidateSet = await read('positive-evidence.independent-a.candidates.json')
const review = await read('positive-evidence-profile-and-42-cases.actual.json')
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
const schemaBytes = await readFile(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv)
const validate = ajv.compile(JSON.parse(schemaBytes.toString('utf8')))
const errors: string[] = []
for (const record of records) {
  if (!validate(record)) errors.push(`${record.goalId}: ${ajv.errorsText(validate.errors)}`)
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate') errors.push(`${record.goalId}: authority/status mismatch`)
  if (record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') errors.push(`${record.goalId}: dishonest evidence/scope claim`)
  if (record.profile.applicationCaseBriefs.length !== 2) errors.push(`${record.goalId}: two cases required`)
  const own = review.goals.find((g: any) => g.goalId === record.goalId)
  if (!own || own.caseReviews.length !== 2) errors.push(`${record.goalId}: no own actual case review`)
  if (own?.profileContentDecision === 'REVISE' && !record.dissent.some((d: string) => d.startsWith('Content REVISE:'))) errors.push(`${record.goalId}: revision dissent lost`)
}
if (records.length !== 21) errors.push(`expected 21 profiles, got ${records.length}`)
const output = records.map(r => JSON.stringify(r)).join('\n') + '\n'
await writeFile(resolve(here, 'positive-evidence.independent-a.actual.review.jsonl'), output, { flag: 'wx' })
const sha = (v: Buffer | string) => createHash('sha256').update(v).digest('hex')
const receipt = {
  schemaVersion: 1, checkedAt: new Date().toISOString(), status: errors.length ? 'fail' : 'pass_native_candidate_schema_and_semantics',
  nativeBuilder: 'app/scripts/materializePositiveGoalEvidenceCandidates.ts#buildPositiveGoalEvidenceCandidateRecords',
  nativeBuilderSha256: sha(await readFile(resolve(root, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts'))),
  nativeSchemaSha256: sha(schemaBytes), records: records.length, syntheticCaseBriefs: 42,
  profileContentKeep: 20, profileContentRevise: 1, allNativeStatuses: ['needs_human_review'],
  allNativeAuthorities: ['ai_candidate'], allEvidenceLevels: ['E1'], allClaimScopes: ['G1'],
  actualEmpiricalLearnerDemonstrations: 0, humanApprovalClaim: false, nativeGoalDescriptionTerminalClaim: false,
  currentSourceAndVisualHoldsPreserved: true, activeReviewJSONLWritten: false, activeCanonicalWritten: false,
  ownInactiveNativeReviewJSONLWritten: true, outputSha256: sha(output), errors,
}
await writeFile(resolve(here, 'native-positive-profile-schema.actual.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
