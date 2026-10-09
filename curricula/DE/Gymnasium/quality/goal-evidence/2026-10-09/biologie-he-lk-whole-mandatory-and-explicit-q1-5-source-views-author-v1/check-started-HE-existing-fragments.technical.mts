// SPDX-License-Identifier: Apache-2.0
// Ordinary compile of existing bounded fragments; no full-course/source approval.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const folder = dirname(fileURLToPath(import.meta.url))
const read = (name: string) => JSON.parse(readFileSync(resolve(folder, name), 'utf8'))
const landscape = normalizeCanonicalLandscape(read('input/canonical.current479.exact.json'))
const viewChecks = [
  'HE-Q1-5-LK-explicitly-selected.view.json',
  'HE-LK-Q2-1-limited-core-source-role-preview.view.json',
].map(name => {
  const file = resolve(folder, 'candidate/bounded-existing-fragments', name)
  const view = normalizeCompositionView(JSON.parse(readFileSync(file, 'utf8')))
  const report = compileCompositionView(view, landscape)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(landscape.goals.map(goal => [goal.id, goal])))
  return {
    viewPath: relative(process.cwd(), file), viewId: view.viewId, scope: view.scope,
    errorCount: report.findings.filter(finding => finding.severity === 'error').length,
    findings: report.findings, targetGoalIds: [...roles.targetGoalIds].sort(),
    prerequisiteOnlyGoalIds: [...roles.prerequisiteOnlyGoalIds].sort(),
    fullHEEtoQ4MandatoryView: false, registeredInAutomaticLearnerIndex: false,
    technicalCompileOnly: true, independentSourceApproval: false,
  }
})
const result = {
  ordinaryFunctions: ['normalizeCanonicalLandscape', 'normalizeCompositionView', 'compileCompositionView', 'collectCompositionProjectionRoleGoalIds'],
  fullCanonicalNodeCount: landscape.goals.length, viewChecks,
  completeMandatoryViewClaim: false, actualOptionalTopicSelection: false,
  noSourceNativeOrPBindingChanges: true, strictGain: 0,
}
mkdirSync(resolve(folder, 'checks'), {recursive: true})
writeFileSync(resolve(folder, 'checks/ordinary-existing-bounded-fragment-compiles.actual.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({viewCount: viewChecks.length, errorCounts: viewChecks.map(row => row.errorCount), targetCounts: viewChecks.map(row => row.targetGoalIds.length), completeMandatoryViewClaim: false}))
if (viewChecks.some(row => row.errorCount)) process.exitCode = 1
