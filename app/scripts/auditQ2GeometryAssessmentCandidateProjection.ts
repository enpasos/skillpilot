import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadGoalBookBuildInputs,
  type GoalBookPage,
} from './goalBookModel'

// Diagnostic only: the candidate tasks are not part of the canonical graph.
// A task's course marker cannot justify offering it in a scope where even one
// of its claimed prerequisite or assessed goals is absent from the Atlas.
const root = fileURLToPath(new URL('../..', import.meta.url))
const atlasConfig = resolve(root, 'app/scripts/config/goal-books/de-gym-math-national-atlas.json')
const candidatePath = resolve(
  root,
  'curricula/DE/Gymnasium/quality/assessment-review/mathematik/'
    + 'q2-geometry-terminal-repair-candidate-20260927-v1/candidate-routes.json',
)

type CourseLevel = 'GK_LK' | 'GK' | 'LK'
type CandidateTask = {
  candidateId: string
  courseLevel: CourseLevel
  requires: string[]
  coveredGoalIds: string[]
}
type Candidate = { candidateTasks: CandidateTask[] }

const scopeKey = (jurisdiction: string, scope: {
  stage: string
  durationModel?: string | null
  courseProfile?: string | null
}): string => [jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('|')

const pageScopes = (page: GoalBookPage): Set<string> => new Set(
  (page.applicability ?? []).flatMap(({ jurisdiction, scopes }) => scopes
    .filter((scope) => scope.stage === 'SekII' && (scope.courseProfile === 'GK' || scope.courseProfile === 'LK'))
    .map((scope) => scopeKey(jurisdiction, scope))),
)

const intersects = (sets: Set<string>[]): string[] => {
  if (sets.length === 0) return []
  return [...sets[0]].filter((scope) => sets.every((set) => set.has(scope))).sort()
}

const main = async (): Promise<void> => {
  const [{ model }, candidateBytes] = await Promise.all([
    loadGoalBookBuildInputs(atlasConfig),
    readFile(candidatePath, 'utf8'),
  ])
  const candidate = JSON.parse(candidateBytes) as Candidate
  assert.ok(Array.isArray(candidate.candidateTasks) && candidate.candidateTasks.length > 0)
  const pages = new Map(model.pages.map((page) => [page.goalId, page]))
  const allScopes = [...new Set(model.pages.flatMap((page) => [...pageScopes(page)]))].sort()
  const report = candidate.candidateTasks.map((task) => {
    assert.ok(['GK_LK', 'GK', 'LK'].includes(task.courseLevel), task.candidateId)
    assert.ok(task.requires.length > 0 && task.coveredGoalIds.length > 0, task.candidateId)
    const ids = [...new Set([...task.requires, ...task.coveredGoalIds])]
    const goalScopes = ids.map((goalId) => {
      const page = pages.get(goalId)
      assert.ok(page, `${task.candidateId}: missing GoalBook page ${goalId}`)
      return pageScopes(page)
    })
    const commonScopes = intersects(goalScopes)
    const declaredScopes = allScopes.filter((scope) => (
      task.courseLevel === 'GK_LK' || scope.endsWith(`|${task.courseLevel}`)
    ))
    const common = new Set(commonScopes)
    const visibleIdsByScope = declaredScopes.map((scope) => ids.filter((_, index) => (
      goalScopes[index].has(scope)
    )))
    return {
      candidateId: task.candidateId,
      courseLevel: task.courseLevel,
      goalCount: ids.length,
      declaredScopeCount: declaredScopes.length,
      commonScopeCount: commonScopes.length,
      distinctVisibleGoalSets: new Set(visibleIdsByScope.map((visibleIds) => (
        visibleIds.join('|')
      ))).size,
      emptyDeclaredScopes: declaredScopes.filter((_, index) => (
        visibleIdsByScope[index].length === 0
      )),
      unsupportedDeclaredScopes: declaredScopes.filter((scope) => !common.has(scope)),
      commonScopes,
    }
  })
  const unsupportedTasks = report.filter((task) => task.unsupportedDeclaredScopes.length > 0)
  console.log(JSON.stringify({
    status: 'candidate_scope_diagnostic_only',
    atlasDigest: model.digest,
    taskCount: report.length,
    unsupportedTaskCount: unsupportedTasks.length,
    tasks: report,
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
