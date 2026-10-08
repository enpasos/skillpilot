// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const own = process.env.BASIS2_AUTHOR_OUTPUT!
const { buildApplicabilityCompilation } = await import(pathToFileURL(resolve('app/scripts/applicabilityCompiler.ts')).href)
const compilation = buildApplicabilityCompilation()
const report = compilation.reports.find((item: any) => item.landscapeId === '08a43a1b-d97e-522c-9dfa-c950a493364e')
assert.ok(report)
const expected: Record<string, string[]> = {
  '0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38': ['DE-BB', 'DE-BE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST', 'DE-TH'],
  '32483d30-2162-50a5-a6cc-05b7f2467ab1': ['DE-SN'],
}
const selected = report.goals.filter((goal: any) => goal.goalId in expected)
assert.equal(selected.length, 2)
for (const goal of selected) {
  assert.deepEqual(goal.compiledApplicability.jurisdiction, expected[goal.goalId], goal.goalId)
  for (const jurisdiction of expected[goal.goalId]) {
    assert.ok(goal.evidence.some((e: any) => ['mapping', 'provenance'].includes(e.kind) && e.value === jurisdiction))
  }
  assert.ok(!goal.evidence.some((e: any) => e.kind === 'requires-closure' && e.source.includes('860c80f9')))
}
const affectedFindings = report.findings.filter((finding: any) => finding.goalId in expected)
assert.equal(affectedFindings.filter((finding: any) => finding.severity === 'error').length, 0)
const prep = JSON.parse(readFileSync(resolve(own, 'candidate-preparation.actual.json'), 'utf8'))
const supplement = report.goals.find((goal: any) => goal.goalId === prep.newSupplementId)
assert.deepEqual(supplement.compiledApplicability.jurisdiction, expected[prep.newGoalIds[0]])
assert.ok(supplement.evidence.every((e: any) => e.kind === 'child-union'))
mkdirSync(resolve(own, 'checks'), { recursive: true })
writeFileSync(resolve(own, 'checks/ordinary-biology-whole-applicability.actual.json'), JSON.stringify(report, null, 2) + '\n', {flag: 'wx'})
writeFileSync(resolve(own, 'checks/ordinary-two-and-supplement-applicability.actual.json'), JSON.stringify({
  role: 'Ordinary compiler output, not scientific approval', selected, supplement, affectedFindings,
  wholeReportSummary: report.summary, exactRespirationJurisdictions: expected[prep.newGoalIds[0]],
  exactPhotosynthesisCouplingJurisdictions: expected[prep.newGoalIds[1]],
  allSelectedJurisdictionsHaveDirectMappingOrProvenance: true,
  noOldShared860RequiresClosureIntoNewTwo: true,
  newSupplementVisibilityOnlyFromChildUnion: true,
  activeWrites: 0, newScientificReviewByAuthor: false, humanApproval: false,
}, null, 2) + '\n', {flag: 'wx'})
console.log('PASS: ordinary compiler scope exactly respiration8 jurisdictions, photosynthesisSN; supplement only child union; no 860 closure pollution.')
