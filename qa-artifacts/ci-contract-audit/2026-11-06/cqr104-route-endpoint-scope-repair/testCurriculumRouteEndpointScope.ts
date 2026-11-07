// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import type { ApplicabilityCompilationResult } from './applicabilityCompiler'
import { deriveScopeMaturity, evaluateRouteProfile, routeProfiles } from './generateCurriculumQualityStatus'

const owner = '7d51b38c-a149-5407-bddc-d2ce7878b020'
const profile = routeProfiles.find(profile => profile.landscapeId === owner)!
assert.ok(profile, 'The production Informatics route profile must exist.')
const actual = JSON.parse(readFileSync(resolve(import.meta.dirname,
  '../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'), 'utf8')) as SkillLandscape
const motivation = profile.motivationAnchorGoalIds[0]
const foundation = 'f0910b55-48a9-4f81-aed6-d15ac0446c70'
const gk = '63509366-f5b2-58e5-9976-47df6f8c37e1'
const lk = 'da96fcb4-f601-5f66-9fec-12b5adc7f7f0'
const by = 'bb651ed7-2674-580c-8916-ac5aa88d93f8'
const cluster = profile.terminalAutonomyClusterIds[0]
const sourceGoal = (id: string): LearningGoal => {
  const goal = actual.goals.find(goal => goal.id === id)
  assert.ok(goal, `The concrete source fixture ${id} must exist.`)
  return structuredClone(goal)
}
// Deliberately small route fixture, not a claim about these exams' live scope or
// competence coverage. Native projections, course filters and maturity run intact.
const landscape: SkillLandscape = { ...actual, goals: [
  { ...sourceGoal(motivation), contains: [], requires: [], tags: ['Orientation'] },
  { ...sourceGoal(foundation), contains: [], requires: [motivation], tags: ['GK', 'LK'], phase: 'E' },
  { ...sourceGoal(gk), contains: [], requires: [foundation], tags: ['GK', 'Assessment'] },
  { ...sourceGoal(lk), contains: [], requires: [foundation], tags: ['LK', 'Assessment'] },
  { ...sourceGoal(by), contains: [], requires: [foundation], tags: ['GK', 'LK', 'Assessment'] },
  { ...sourceGoal(cluster), contains: [gk, lk, by], requires: [] },
] }
const fixtureProfile = { ...profile, terminalAutonomyClusterIds: [cluster] }
const compilation = {
  reports: [{ landscapeId: owner, goals: landscape.goals.map(goal => ({ goalId: goal.id,
    compiledApplicability: { jurisdiction: goal.id === by ? ['DE-BY'] : ['DE-BY', 'DE-HE'] } })) }],
  summary: { supportedValues: ['DE-BY', 'DE-HE'] },
} as unknown as ApplicabilityCompilationResult
const directory = mkdtempSync(resolve(tmpdir(), 'skillpilot-route-scope-'))
try {
  const view = (name: string, jurisdiction: string | undefined, courseProfile: string, ids: string[]) => {
    const path = resolve(directory, name + '.view.json')
    writeFileSync(path, JSON.stringify({ viewId: 'route-' + name, landscapeId: owner,
      scope: { stage: 'CrossStage', courseProfile, ...(jurisdiction ? { jurisdiction } : {}) },
      rootNodes: [{ kind: 'structure', id: 'root', label: 'Informatik', children: [motivation, foundation, ...ids]
        .map(goalId => ({ kind: 'goalEntry', goalId })) }] }))
    return path
  }
  const heGk = view('he-gk', 'DE-HE', 'GK', [gk])
  const heLk = view('he-lk', 'DE-HE', 'LK', [lk])
  const byGk = view('by-gk', 'DE-BY', 'GK', [gk, by])
  const byLk = view('by-lk', 'DE-BY', 'LK', [lk, by])
  const nationalGk = view('national-gk', undefined, 'GK', [gk, by])
  const nationalLk = view('national-lk', undefined, 'LK', [lk, by])
  const evaluate = (files: string[], source = landscape, compiled = compilation) =>
    evaluateRouteProfile(source, fixtureProfile, compiled, files)
  const cqr104 = (scope: ReturnType<typeof evaluate>) => scope.rules.find(rule => rule.id === 'CQR-104')!

  // This fails with the former uncompiled 18-scope behavior: a national view
  // must be evaluated independently in each supported country, never as a union.
  const national = evaluate([nationalGk, nationalLk])
  assert.equal(cqr104(national).metrics?.evaluatedProjectionScopes, 4,
    'Each national course view needs both actual compiled jurisdiction projections.')
  assert.equal(cqr104(national).status, 'pass', JSON.stringify(cqr104(national)))

  // Even after enabling country projections, the former Economics-only course
  // filter wrongly requires the LK-only exam in GK and the GK-only exam in LK.
  const countryViews = [heGk, heLk, byGk, byLk]
  const exact = evaluate(countryViews)
  assert.equal(cqr104(exact).status, 'pass', JSON.stringify(cqr104(exact)))
  assert.equal(cqr104(exact).metrics?.projectionScopesMissingTerminalAutonomyGoals, 0)
  assert.equal(cqr104(exact).metrics?.projectionScopesWithUnexpectedTerminalAutonomyGoals, 0)
  assert.equal(exact.rules.find(rule => rule.id === 'CQR-203')?.status, 'warn',
    'The original legacy offered tasks lack release metadata; this repair must preserve that separate warning.')
  assert.equal(exact.maturity, 'M3', 'A correct CQR104 must not bypass the existing legacy release-metadata gate.')

  const missingBy = evaluate([view('by-missing-country-exam', 'DE-BY', 'GK', [gk])])
  assert.equal(cqr104(missingBy).status, 'fail')
  assert.ok(cqr104(missingBy).details?.some(detail => detail.startsWith('Missing terminal autonomy goal(s):') && detail.includes(by)))
  assert.equal(missingBy.maturity, 'M2')

  const missingGk = evaluate([view('he-missing-gk-exam', 'DE-HE', 'GK', [])])
  assert.equal(cqr104(missingGk).status, 'fail')
  assert.ok(cqr104(missingGk).details?.some(detail => detail.startsWith('Missing terminal autonomy goal(s):') && detail.includes(gk)))

  // Removing every applicable endpoint must remain a hard failure even when
  // the actual and expected endpoint sets are both empty.
  const noHe = structuredClone(compilation)
  noHe.reports[0].goals.filter(goal => [gk, lk, by].includes(goal.goalId))
    .forEach(goal => { goal.compiledApplicability.jurisdiction = ['DE-BY'] })
  const empty = evaluate([heGk], landscape, noHe)
  assert.equal(cqr104(empty).status, 'fail')
  assert.equal(cqr104(empty).metrics?.projectionScopesWithoutExpectedTerminalAutonomyGoals, 1)
  assert.equal(empty.maturity, 'M2')
  assert.equal(deriveScopeMaturity(empty.rules), 'M2')

  const missingBinding = structuredClone(compilation)
  missingBinding.reports[0].goals.find(goal => goal.goalId === by)!.compiledApplicability.jurisdiction = []
  const unbound = evaluate([byGk], landscape, missingBinding)
  assert.equal(cqr104(unbound).status, 'fail')
  assert.equal(cqr104(unbound).metrics?.terminalGoalsMissingCompiledApplicability, 1)
  console.log('CQR104 native country/course controls pass: exact projections, missing country/course endpoint, empty set and missing compiled binding.')
} finally {
  rmSync(directory, { recursive: true, force: true })
}
