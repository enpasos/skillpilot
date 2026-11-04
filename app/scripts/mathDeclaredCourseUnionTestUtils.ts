import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningGoal } from '../src/landscapeTypes'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'

export type RegisteredMathTestView = { name: string; view: CompositionView }
export type DeclaredMathCourseUnion = {
  outputViewId: string; outputFileName: string; scope: CompositionView['scope']
  sourceViewIds: string[]; baselineSourcePaths: string[]; excludedNewAssessmentIds: string[]
}

export const readBoundMathStageDecision = (repoRoot: string, path: string) => {
  const policy = JSON.parse(readFileSync(resolve(repoRoot, 'app/scripts/config/math-country-seki-stage-policy.json'), 'utf8')) as {
    stageDecisionBindings: Array<{ path: string; sha256: string }>
  }
  const bindings = policy.stageDecisionBindings.filter(binding => binding.path === path)
  assert.equal(bindings.length, 1, `${path}: expected one current policy binding`)
  const bytes = readFileSync(resolve(repoRoot, path))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), bindings[0].sha256, `${path}: reviewed input drift`)
  return JSON.parse(bytes.toString('utf8'))
}

export const loadDeclaredMathCourseUnions = (repoRoot: string, views: RegisteredMathTestView[]) => {
  const plan = readBoundMathStageDecision(repoRoot,
    'curricula/DE/Gymnasium/assessments/mathematik/contextual-terminal-assessments-2026-11-04-v1/finite-scope-operations.json') as {
      counts: { combinedDocuments: number }; combinedMaterializations: DeclaredMathCourseUnion[]
    }
  const viewById = new Map(views.map(({ view }) => [view.viewId, view]))
  assert.equal(viewById.size, views.length, 'Registered view identities must be unique')
  const combinedById = new Map(plan.combinedMaterializations.map(pair => [pair.outputViewId, pair]))
  assert.equal(combinedById.size, plan.counts.combinedDocuments)
  const withoutCourse = ({ courseProfile: _courseProfile, ...scope }: CompositionView['scope']) => scope
  for (const pair of combinedById.values()) {
    const output = viewById.get(pair.outputViewId)
    assert(output, `Declared course union missing: ${pair.outputViewId}`)
    assert.deepEqual(output.scope, pair.scope, `${pair.outputViewId}: exact combined scope changed`)
    assert.equal(pair.scope.courseProfile, 'GK+LK')
    assert.equal(views.find(({ name }) => name === pair.outputFileName)?.view.viewId, pair.outputViewId)
    assert.equal(pair.sourceViewIds.length, 2)
    assert.equal(pair.baselineSourcePaths.length, 2)
    const sources = pair.sourceViewIds.map((id, index) => {
      const source = viewById.get(id)
      assert(source, `Declared union source missing: ${id}`)
      const boundSource = JSON.parse(readFileSync(resolve(repoRoot, pair.baselineSourcePaths[index]), 'utf8'))
      assert.equal(boundSource.viewId, id, `${id}: exact source path changed`)
      assert.deepEqual(withoutCourse(source.scope), withoutCourse(pair.scope), `${id}: union source scope mismatch`)
      assert(!combinedById.has(id), `${id}: union source must be a single-course view`)
      return source
    })
    assert.deepEqual(sources.map(source => source.scope.courseProfile).sort(), ['GK', 'LK'])
  }
  return combinedById
}

// CourseProfileAvailability.matches is the production union's course oracle.
// Bavaria instead uses the actual authored course selection. Other scope
// dimensions remain the common request's responsibility, as in production.
export const isMathSourceCourseAvailable = (
  goal: Pick<LearningGoal, 'tags' | 'release'>,
  source: CompositionView,
) => {
  if (source.scope.jurisdiction === 'DE-BY') return true
  const tags = goal.tags ?? []
  const profile = source.scope.courseProfile?.trim().toUpperCase() ?? ''
  assert(profile === 'GK' || profile === 'LK', 'Union eligibility requires an actual single-course source')
  const releaseCourse = goal.release?.courseLevel?.trim().toUpperCase() ?? ''
  return tags.length === 0 || tags.includes(profile) || releaseCourse === profile
    || (!tags.includes('GK') && !tags.includes('LK') && !releaseCourse)
}
