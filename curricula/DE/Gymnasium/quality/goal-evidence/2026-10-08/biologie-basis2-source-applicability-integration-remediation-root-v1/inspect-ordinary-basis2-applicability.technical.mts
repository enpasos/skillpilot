// SPDX-License-Identifier: Apache-2.0
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { buildApplicabilityCompilation } = await import(pathToFileURL(resolve('app/scripts/applicabilityCompiler.ts')).href)
const compilation = buildApplicabilityCompilation()
const report = compilation.reports.find((item: any) => item.landscapeId === '08a43a1b-d97e-522c-9dfa-c950a493364e')
if (!report) throw new Error('Missing ordinary Biology applicability report')
const expected: Record<string, string[]> = {
  '0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38': ['DE-BB', 'DE-BE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST', 'DE-TH'],
  '32483d30-2162-50a5-a6cc-05b7f2467ab1': ['DE-SN'],
}
const selected = report.goals.filter((item: any) => item.goalId in expected)
for (const goal of selected) {
  if (JSON.stringify(goal.compiledApplicability.jurisdiction) !== JSON.stringify(expected[goal.goalId])) {
    throw new Error(`Unexpected source scope for ${goal.goalId}: ${JSON.stringify(goal.compiledApplicability)}`)
  }
  for (const jurisdiction of expected[goal.goalId]) {
    const direct = goal.evidence.filter((e: any) => e.kind === 'mapping' || e.kind === 'provenance')
    if (!direct.some((e: any) => e.value === jurisdiction)) throw new Error(`Missing direct source evidence ${goal.goalId}/${jurisdiction}`)
  }
}
const findings = report.findings.filter((item: any) => item.goalId in expected)
const blocking = findings.filter((item: any) => item.severity === 'error')
writeFileSync('tmp/basis2-ordinary-two-goal-applicability.actual.json', JSON.stringify({
  role: 'technical ordinary applicability compilation, no scientific review',
  selected, findings, ordinaryReportSummary: report.summary,
  newScientificReviewByIntegrator: false, activeWrites: 0, strictGainClaimed: 0,
}, null, 2) + '\n')
if (selected.length !== 2 || blocking.length) throw new Error('Affected ordinary applicability errors')
console.log('PASS: actual ordinary compiler assigns exactly the paired-reviewed jurisdictions with direct sources for both new goals.')
