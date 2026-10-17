// SPDX-License-Identifier: Apache-2.0
// Measures stock frontend filters on actual compiled public candidate data.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import { goalMatchesFilters } from '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts'
const R = '/home/enpasos/projects/skillpilot', T = R + '/tmp/chemie-m7-resumed-20261016'
const O = '/mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1'
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const pin = (p: string) => ({path: path.relative(R, p), sha256: 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'), bytes: fs.statSync(p).size})
const cp = O + '/capsule/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const vp = '/mnt/e/skillpilot-chemie-L7-20261017/paired-package03-and04-actual-current650-technical-v1/candidate.whole39views.C20-plus-two-BW-labels.private.json'
const ap = O + '/STOCK.actual650-C20-plus-paired-package03-and04-applicability.json'
const c = read(cp), views = read(vp), report = read(ap), chemistry = report.reports.find((x: any) => x.landscapeId === c.landscapeId)
assert(chemistry); assert.equal(chemistry.summary.errors, 0)
const compiled = new Map<string, any>(chemistry.goals.map((g: any) => [g.goalId, g.compiledApplicability]))
const byId = new Map<string, any>(c.goals.map((g: any) => [g.id, {...g, applicability: {...g.applicability, ...compiled.get(g.id)}}]))
const supported = new Set<string>(report.summary.supportedValues)
const payload: any = {role: 'Actual stock frontend filtering of authored view targets with freshly compiled applicability; no backend fallback/learner-state execution or approval claim', inputs: [cp, vp, ap].map(pin), views: {}, excludedTargetRows: [], changedApplicabilityRows: []}
for (const g of c.goals) if (JSON.stringify(g.applicability?.jurisdiction ?? []) !== JSON.stringify(compiled.get(g.id)?.jurisdiction ?? [])) payload.changedApplicabilityRows.push({goalId: g.id, before: g.applicability?.jurisdiction ?? [], after: compiled.get(g.id)?.jurisdiction ?? []})
for (const v of views) {
  const roles = collectCompositionProjectionRoleGoalIds(v.rootNodes, byId)
  const filters = [v.scope.courseProfile, supported.has(v.scope.jurisdiction) ? v.scope.jurisdiction : null, v.scope.durationModel].filter((x: any) => typeof x === 'string' && x)
  const rawCourseTargets = [...roles.targetGoalIds].filter(id => goalMatchesFilters(byId.get(id), v.scope.courseProfile))
  const eligible = [...roles.targetGoalIds].filter(id => goalMatchesFilters(byId.get(id), filters))
  const omitted = rawCourseTargets.filter(id => !eligible.includes(id))
  payload.views[v.viewId] = {scope: v.scope, stockFilters: filters, eligibleTargetGoalIds: eligible, excludedAfterCompiledFilters: omitted, rawCourseTargets: rawCourseTargets.length}
  for (const id of omitted) payload.excludedTargetRows.push({viewId: v.viewId, goalId: id, title: byId.get(id).title, compiledApplicability: compiled.get(id), nodeKind: byId.get(id).nodeKind})
}
payload.summary = {views: views.length, excludedTargetRows: payload.excludedTargetRows.length, changedApplicabilityGoals: payload.changedApplicabilityRows.length, chemistryErrors: chemistry.summary.errors, chemistryWarnings: chemistry.summary.warnings}
payload.boundary = 'Exclusion is diagnostic, never authority to delete intended acquisition targets or waive a missing foundation. Backend canonical-state fallback is separate; authored placement alone is not source coverage. No runtime code changed.'
const out = O + '/MEASUREMENT.actual650-compiled-course-jurisdiction-duration-frontend-targets.not-backend-acceptance.json'
fs.writeFileSync(out, JSON.stringify(payload, null, 2) + '\n', {flag: 'wx'})
console.log(JSON.stringify({output: pin(out), summary: payload.summary, distinctExcludedGoals: new Set(payload.excludedTargetRows.map((x: any) => x.goalId)).size}))
