// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildApplicabilityCompilation } from '../../../../../../../app/scripts/applicabilityCompiler.ts'
const own = dirname(fileURLToPath(import.meta.url))
const result = buildApplicabilityCompilation()
const report = result.reports.find(r => r.landscapeId === '08a43a1b-d97e-522c-9dfa-c950a493364e')!
const canonical = JSON.parse(readFileSync(report.file, 'utf8'))
const findings = report.findings.filter(f => f.code === 'APV-203').map(f => ({
  finding: f,
  currentWholeGoal: canonical.goals.find((g: {id: string}) => g.id === f.goalId),
  actualCompiledGoal: report.goals.find(g => g.goalId === f.goalId),
}))
writeFileSync(resolve(own, 'actual-current-APV203-findings-and-whole-goals.json'), JSON.stringify({
  schemaVersion: 1, actualProductionCompilerUsed: true, summary: report.summary, findings,
}, null, 2) + '\n', {flag: 'wx'})
console.log(JSON.stringify(findings, null, 2))
