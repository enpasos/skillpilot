// SPDX-License-Identifier: Apache-2.0
// Author candidate materialization/consistency checks, not independent QA.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root = resolve('/home/enpasos/projects/skillpilot')
const directory = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-source19-remaining-seven-whole-author-v1')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const binding = (path: string) => ({ path: path.slice(root.length + 1), sha256: sha(readFileSync(path)), bytes: readFileSync(path).length })
const bodyPath = resolve(directory, 'remaining-seven.normal-positive-profile-bodies.author-candidate.json')
const selectedPath = resolve(directory, 'remaining-seven.whole-goal-profile-fourteen-cases.exact-input.json')
const body = read(bodyPath)
const exact = read(selectedPath)
const criteriaPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
const schemaPath = resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const criteriaFingerprint = sha(readFileSync(criteriaPath))
const ajv = new Ajv2020({ strict: true, allErrors: true })
addFormats(ajv)
const schema = ajv.compile(read(schemaPath))
const records = body.entries.map((entry: any) => ({
  ...entry.reviewRecordMetadata,
  reviewCriteriaFingerprint: criteriaFingerprint,
  goalFingerprint: fingerprintGoalForPositiveEvidence(entry.goal, 'curricularAtomic'),
  reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(entry.goal, criteriaFingerprint, {}, 'curricularAtomic'),
  profileFingerprint: fingerprintPositiveGoalEvidenceProfile(entry.profile),
  profile: entry.profile,
}))
const errors: string[] = []
const results = records.map((record: any, index: number) => {
  const goal = body.entries[index].goal
  const original = exact.entries.find((x: any) => x.wholeGoal.id === goal.id)
  if (JSON.stringify(goal) !== JSON.stringify(original.wholeGoal)) errors.push(`${goal.id}: author goal differs from exact selected original`)
  if (goal.resourceLinks.length !== 0) errors.push(`${goal.id}: unexpected image resource introduced`)
  const valid = schema(record)
  if (!valid) errors.push(`${goal.id}: schema ${JSON.stringify(schema.errors)}`)
  const semanticErrors = validatePositiveGoalEvidenceRecordSemantics(record, goal, {}, 'curricularAtomic')
  errors.push(...semanticErrors)
  if (record.reviewRunIds.length !== 0) errors.push(`${goal.id}: author cannot claim an independent review run`)
  if (record.reviewAuthority !== 'ai_candidate' || record.status !== 'needs_human_review' || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') errors.push(`${goal.id}: incorrect candidate authority`)
  return { goalId: goal.id, candidateKey: body.entries[index].candidateKey, schemaValid: valid, semanticErrors, originalProspectiveWholeGoalExact: true, resourceBindings: 'original emptyResourceLinks only; actual final native raster/resource binding pending', actualHumanOrLearnerExecution: false }
})
const cases = read(resolve(directory, 'remaining-seven.fourteen-whole-cases-with-worked-transfer.author-candidate.json'))
for (const value of cases.cases) {
  const original = exact.entries.flatMap((x: any) => x.wholeTwoCases).find((x: any) => x.caseKey === value.caseKey)
  if (JSON.stringify(original) !== JSON.stringify(value.originalWholeCase)) errors.push(`${value.caseKey}: original whole case changed`)
  if (!value.authoredWorkedFreshTransferResponse.de || !value.authoredWorkedFreshTransferResponse.en) errors.push(`${value.caseKey}: incomplete bilingual transfer response`)
}
if (records.length !== 7 || cases.cases.length !== 14) errors.push('Incorrect whole candidate scope')
const math = {
  meanDissolutionTimesSeconds: [[90, 94], [65, 63], [48, 50]].map(([a, b]) => (a + b) / 2),
  fresh50C: { meanSeconds: (80 + 45) / 2, rangeSeconds: 80 - 45 },
  calibration: { meanAbsorbance: (0.291 + 0.289) / 2, slopeLitresPerMilligram: (0.170 - 0.010) / 2, dilutedMilligramsPerLitre: ((0.291 + 0.289) / 2 - 0.010) / ((0.170 - 0.010) / 2), originalFactor2: 7, correctedFactor4: 14 },
  revisedTreatmentG: { energyDifferenceKwh: 20 - 18, addedAnnualEuro: 45 - 30, removalGainPercentagePoints: 95 - 70 },
  particleCardAtomCounts: { reactants: { hydrogen: 4, oxygen: 2 }, products: { hydrogen: 4, oxygen: 2 } },
  displacementChargeBalance: { left: 2, right: 2 },
}
const evaluateRule = (ionCharge: number, partialChargeSign: number) => ionCharge === 0 ? 'undetermined' : ionCharge * partialChargeSign < 0 ? 'attracting' : ionCharge * partialChargeSign > 0 ? 'repelling' : 'undetermined'
const ruleChecks = [[1, -1, 'attracting'], [1, 1, 'repelling'], [-1, -1, 'repelling'], [-1, 1, 'attracting'], [0, -1, 'undetermined'], [0, 1, 'undetermined']].map(([ion, partial, expected]) => ({ ionCharge: ion, partialChargeSign: partial, expected, actual: evaluateRule(Number(ion), Number(partial)) }))
for (const check of ruleChecks) if (check.actual !== check.expected) errors.push('Digital rule author consistency error')
if (Math.abs(math.calibration.dilutedMilligramsPerLitre - 3.5) > 1e-12) errors.push('Calibration arithmetic error')
const outputPath = resolve(directory, 'remaining-seven.positive-understanding-evidence-v2.author-candidates.jsonl')
const receiptPath = resolve(directory, 'ordinary-seven-author-records.schema-and-consistency.receipt.json')
if (existsSync(outputPath) || existsSync(receiptPath)) throw new Error('Refuse to overwrite prior author materialization')
if (errors.length) throw new Error(JSON.stringify(errors))
writeFileSync(outputPath, records.map((value: any) => JSON.stringify(value)).join('\n') + '\n')
const receipt = {
  schemaVersion: 1,
  role: 'Actual repository-helper author materialization and finite data/model consistency; not independent scientific review or learner execution',
  executedAt: new Date().toISOString(),
  originalInputs: [binding(bodyPath), binding(selectedPath), binding(criteriaPath), binding(schemaPath)],
  output: binding(outputPath),
  records: records.length,
  wholeCases: cases.cases.length,
  results,
  errors,
  arithmetic: math,
  sixRuleChecks: ruleChecks,
  authorExecutionOnly: true,
  learnerSpreadsheetOrPhysicalExecutionAsserted: false,
  actualFinalNativeAssetBindings: false,
  independentReviewCount: 0,
  wholeSource19Status: 'HOLD',
  strictM7NetGain: 0,
  humanApproval: false,
  humanTrial: false,
}
writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ receipt: binding(receiptPath), output: binding(outputPath), records: records.length, errors }))
