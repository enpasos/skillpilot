// SPDX-License-Identifier: Apache-2.0
// Final author schema/input checks. This is not independent scientific QA.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root = '/home/enpasos/projects/skillpilot'
const dir = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-source19-remaining-seven-whole-author-v1')
const read = (name: string) => JSON.parse(readFileSync(resolve(dir, name), 'utf8'))
const bytes = (path: string) => readFileSync(resolve(root, path))
const sha = (value: Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const binding = (name: string) => { const path = resolve(dir, name); const value = readFileSync(path); return { path: path.slice(root.length + 1), sha256: sha(value), bytes: value.length } }
const errors: string[] = []
const matchBinding = (value: any) => {
  const actual = bytes(value.path)
  const expected = value.sha256.startsWith('sha256:') ? value.sha256 : `sha256:${value.sha256}`
  if (sha(actual) !== expected || actual.length !== value.bytes) errors.push(`Binding changed: ${value.path}`)
}
const initial = read('actual-input-and-remaining-seven.first.freeze.json')
for (const value of [...initial.inputs, ...initial.selectedOutputs]) matchBinding(value)
const exact = read('remaining-seven.whole-goal-profile-fourteen-cases.exact-input.json')
const body = read('remaining-seven.normal-positive-profile-bodies.author-candidate.json')
const cases = read('remaining-seven.fourteen-whole-cases-with-worked-transfer.author-candidate.json')
const material = read('finite-seven-materials.author.index.json')
for (const value of material.files) matchBinding(value)
for (const entry of body.entries) { matchBinding(entry.casesBinding); matchBinding(entry.finiteMaterialsBinding) }
const records = readFileSync(resolve(dir, 'remaining-seven.positive-understanding-evidence-v2.author-candidates.jsonl'), 'utf8').trim().split('\n').map(x => JSON.parse(x))
const ajv = new Ajv2020({ strict: true, allErrors: true }); addFormats(ajv)
const validate = ajv.compile(JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8')))
for (const record of records) {
 const spec = body.entries.find((x: any) => x.goal.id === record.goalId)
 if (!validate(record)) errors.push(`${record.goalId}: ${JSON.stringify(validate.errors)}`)
 errors.push(...validatePositiveGoalEvidenceRecordSemantics(record, spec.goal, {}, 'curricularAtomic'))
 if (JSON.stringify(spec.profile) !== JSON.stringify(record.profile)) errors.push(`${record.goalId}: materialized profile body differs`)
 if (JSON.stringify(spec.goal) !== JSON.stringify(exact.entries.find((x: any) => x.wholeGoal.id === record.goalId).wholeGoal)) errors.push(`${record.goalId}: original whole goal differs`)
}
for (const item of cases.cases) {
 const original = exact.entries.flatMap((x: any) => x.wholeTwoCases).find((x: any) => x.caseKey === item.caseKey)
 if (JSON.stringify(original) !== JSON.stringify(item.originalWholeCase)) errors.push(`${item.caseKey}: original case differs`)
}
const candidate = read('seven-bounded-BY8-11-source-roles.author-candidate.json')
const mapping = read('remaining-seven.normal-partial-mapping-delta.author-candidate.json')
if (candidate.rows.length !== 7 || candidate.wholeSourceRows.length !== 13 || candidate.wholeCurrentPartnerGoals.length !== 8 || mapping.mappings.length !== 13 || mapping.decisions.length !== 13 || records.length !== 7 || cases.cases.length !== 14) errors.push('Incorrect whole author scope counts')
for (const row of candidate.wholeSourceRows) for (const name of ['wholeOriginalSourceGoal', 'wholeOriginalPassage', 'wholeOriginalDecision']) matchBinding(row[name].file)
for (const row of candidate.wholeCurrentPartnerGoals) matchBinding(row.wholeCurrentGoalBinding.file)
for (const value of mapping.mappings) if (value.matchType !== 'partial') errors.push('New mapping proposal is not partial')
for (const value of mapping.decisions) if (value.reviewer !== null || value.reviewedAt !== null || value.independentReviewStatus !== 'not_started') errors.push('False source review authority')
const fresh = readFileSync(resolve(dir, 'finite-materials/temperature-trend.synthetic.csv'), 'utf8').trim().split('\n').at(-1)
if (fresh !== 'T1-fresh,50,80,45,,,unknown') errors.push('Fresh condition copied unsupported baseline values')
const receipt = {
 schemaVersion: 1, role: 'Actual final author schema and complete binding/finite-material consistency; no independent semantic approval', executedAt: new Date().toISOString(),
 checkedInputs: ['actual-input-and-remaining-seven.first.freeze.json','remaining-seven.whole-goal-profile-fourteen-cases.exact-input.json','remaining-seven.normal-positive-profile-bodies.author-candidate.json','remaining-seven.positive-understanding-evidence-v2.author-candidates.jsonl','remaining-seven.fourteen-whole-cases-with-worked-transfer.author-candidate.json','finite-seven-materials.author.index.json','seven-bounded-BY8-11-source-roles.author-candidate.json','remaining-seven.normal-partial-mapping-delta.author-candidate.json'].map(binding),
 records: 7, originalWholeGoalsExact: 7, originalWholeProfilesExactAndRetained: 7, originalWholeCasesExactAndRetained: 14, newWorkedFreshTransferResponses: 14, newPartialRelationProposals: 13, currentWholePartnerGoalsPreserved: 8,
 protectedFirstTwelveReReviewed: false, priorSchemaMaterializationReceiptSupersededForSideBindingsOnly: true, profileRecordBytesChangedAfterMaterialization: false,
 authorFiniteDataCorrection: 'Fresh50C mass/volume are missing and stirring unknown; source transfer does not confirm these baseline conditions.',
 errors, independentReviewCount: 0, wholeSource19Status: 'HOLD', strictM7NetGain: 0, actualExperimentPerformed: false, actualLearnerPerformance: false, nativeD_P_A_M_VApproved: false, humanApproval: false, humanTrial: false,
}
const output = resolve(dir, 'final-author-package.consistency.receipt.json'); if (existsSync(output)) throw new Error('Refuse overwrite')
writeFileSync(output, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ receipt: binding('final-author-package.consistency.receipt.json'), records: records.length, errors }))
if (errors.length) process.exitCode = 1
