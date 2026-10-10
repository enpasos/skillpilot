// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
const author = `${base}/biologie-bio8-targeted-text-and-source-author-successor-20261010-v4`
const own = `${base}/biologie-bio8-v4-targeted-genuine-independent-a-20261010-v1`
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const goals = read(`${author}/candidate/whole483-final-text-source-image.inactive.json`).goals
const kinds = new Map(read(`${author}/candidate/kinds396.author-classification-only.json`).decisions.map((row: any) => [row.goalId, row.semanticKind]))
const records = readFileSync(`${own}/P3.independent-a.records.jsonl`, 'utf8').trim().split('\n').map((line: string) => JSON.parse(line))
const ajv = new Ajv2020({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const rows = records.map((record: any) => {
  const goal = goals.find((row: any) => row.id === record.goalId)
  const assetPath = `${author}/native/portable-affected3/bundle/asset-copies/${record.goalId}.png`
  const digest = `sha256:${createHash('sha256').update(readFileSync(assetPath)).digest('hex')}`
  const digests = Object.fromEntries(goal.resourceLinks.filter((link: any) => link.type === 'goal-visualization').map((link: any) => [link.url, digest]))
  const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, digests, kinds.get(goal.id) as string)
  if (!validate(record)) errors.push(...(validate.errors ?? []).map((error: any) => `${error.instancePath} ${error.message}`))
  return { goalId: record.goalId, exactCandidateRaster: assetPath, rasterDigest: digest, errors }
})
const result = { schemaVersion: 1, role: 'normal_schema_and_exported_semantics_on_exact_inactive_raster_inputs', recordCount: rows.length, records: rows, errorCount: rows.reduce((n: number, row: any) => n + row.errors.length, 0), activePublicRasterUsed: false, humanApproval: 0, humanTrial: false, strictActiveGain: 0 }
writeFileSync(`${own}/P3.independent-a.normal.actual.json`, `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify(result, null, 2))
if (result.errorCount) process.exitCode = 1
