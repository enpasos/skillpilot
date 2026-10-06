// SPDX-License-Identifier: Apache-2.0
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
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
const goals = (await read(resolve(author, 'prospective-canonical.snapshot.json'))).goals
const kinds = (await read(resolve(root, 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'))).decisions
const selectedImages = (await read(resolve(author, 'visualization-final-candidate-inputs.v3.json'))).records
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(await read(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
for (const record of frozen) {
  if (!validate(record)) errors.push(`${record.goalId}: ${ajv.errorsText(validate.errors)}`)
  const goal = goals.find((g: any) => g.id === record.goalId)
  const kind = kinds.find((k: any) => k.goalId === record.goalId && k.decisionStatus === 'authoritative')?.semanticKind
  const image = selectedImages.find((im: any) => im.goalId === record.goalId)
  const actualImageDigest = `sha256:${createHash('sha256').update(await readFile(resolve(root, image.candidatePath))).digest('hex')}`
  if (actualImageDigest !== image.sha256) errors.push(`${record.goalId}: selected candidate bytes drifted`)
  const resourceDigests = Object.fromEntries((goal.resourceLinks ?? []).filter((l: any) => l.type === 'goal-visualization').map((l: any) => [l.url, actualImageDigest]))
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, kind))
  if (record.reviewAuthority !== 'ai_candidate' || record.status !== 'needs_human_review'
      || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') errors.push(`${record.goalId}: invalid claim boundary`)
}
const receipt = { schemaVersion: 1, startedAt, completedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass', checker: 'Unchanged native validatePositiveGoalEvidenceRecordSemantics and native P-v2 AJV schema',
  resourceResolution: 'Actual SHA256 of selected frozen inactive candidate image bytes bound to the prospective goal resource URL; no public asset mutation.',
  records: frozen.length, syntheticCases: frozen.reduce((n: number, r: any) => n + r.profile.applicationCaseBriefs.length, 0),
  errors, sourceScopesApproved: false, empiricalLearnerEvidence: false, activeWrites: 0, humanApproval: false }
await writeFile(resolve(out, 'positive-four-native-schema-and-bindings.actual.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
