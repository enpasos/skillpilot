// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-author-candidate-v1'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const manifest = read(own + '/native-scope-inputs.actual.json')
const canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const isolateCanonical = manifest.nativeRoot + '/' + canonical
const candidatePath = own + '/proposed-active-tree/' + canonical
const nativeModule = await import(pathToFileURL(resolve(manifest.nativeRoot, 'app/scripts/applicabilityCompiler.ts')).href)
assert.equal(sha(manifest.nativeRoot + '/app/scripts/applicabilityCompiler.ts'), sha('app/scripts/applicabilityCompiler.ts'))
const beforeSHA = sha(isolateCanonical)
assert.equal(beforeSHA, manifest.sourceCanonicalSHA256)
const selected = ['3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66', 'd3cd250f-5221-589d-aa1c-44a4692d1acb', '4cb74d76-99f1-5264-b1e3-448cda47b005', '171b47e2-2c53-50f2-a145-a26b896fd73f']
const compile = () => {
  const result = nativeModule.buildApplicabilityCompilation()
  const report = result.reports.find((row: any) => row.landscapeId === 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
  assert(report)
  return { summary: report.summary, selectedGoalRows: report.goals.filter((row: any) => selected.includes(row.goalId)), allCompiledGoalRows: report.goals, findings: report.findings, projections: report.projections }
}
const before = compile()
writeFileSync(isolateCanonical, readFileSync(candidatePath))
const afterSHA = sha(isolateCanonical)
const after = compile()
for (const id of selected) {
  const row = after.selectedGoalRows.find((row: any) => row.goalId === id)
  assert(row, id)
  const expected = id === '4cb74d76-99f1-5264-b1e3-448cda47b005' ? ['DE-BY', 'DE-HE'] : ['DE-HE']
  assert.deepEqual(row.compiledApplicability.jurisdiction, expected, id)
  if (expected.length === 1) assert(!row.evidence.some((e: any) => e.value === 'DE-BY'), id)
  if (id === '4cb74d76-99f1-5264-b1e3-448cda47b005') assert(row.evidence.every((e: any) => e.kind === 'assessment-requires'))
}
assert.equal(after.summary.errors, 0)
const receipt = {
  schemaVersion: 1, documentType: 'inactive-native-applicability-comparison-receipt', checkedAtUTC: new Date().toISOString(),
  status: 'PASS targeted native HE-only compiled scope; independent science/context/source/route review and full Layer-A/floor checks remain pending',
  canonicalSHA256Before: beforeSHA, canonicalSHA256After: afterSHA, compilerSHA256: sha('app/scripts/applicabilityCompiler.ts'),
  before, after, quantitativeChildrenAndANDParentAndTheirAssessmentCompiledHEOnly: true, noQuantitativeChildrenBYClosureEvidence: true,
  parabenUseTerminalPracticeScope: ['DE-BY', 'DE-HE'], assessmentRequiresEvidenceNeverSourceCoverage: true,
  compilerSourceUnchanged: true, activeWrites: false, fullCQR003Executed: false, fullCQR101Executed: false, fullFloorCheckExecuted: false, humanApproval: false, humanTrial: false,
}
writeFileSync(own + '/native-he-only-compiled-scope.actual.json', JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
console.log('PASS targeted native compiled scope: both quantitative children, conjunctive parent and their assessment are HE-only; no quantitative BY evidence; Paraben-use terminal truthfully derives BY+HE practice scope; zero Chemistry compiler errors. No full CQR/floor or approval claim.')
