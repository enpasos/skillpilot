import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getNextVisibleLearnerGoalSelection } from '../src/utils/learnerGoalSelection'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import {
  applyCompositionViewProjection,
  applyMatchedCompositionRouteGoalProjection,
} from '../src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'

const explicitRouteSelection = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'root-goal',
  currentRouteGoalId: 'active-goal',
  visibleGoalIds: ['root-goal'],
  activeGoalId: 'active-goal',
  plannedGoalIds: ['planned-goal'],
  visibleRootGoalIds: ['root-goal'],
})

assert.equal(
  explicitRouteSelection,
  null,
  'An explicit goal route must suppress tree fallback selection.',
)

const activeGoalFallback = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'root-goal',
  currentRouteGoalId: '',
  visibleGoalIds: ['active-goal'],
  activeGoalId: 'active-goal',
  plannedGoalIds: ['planned-goal'],
  visibleRootGoalIds: ['root-goal'],
})

assert.equal(
  activeGoalFallback,
  'active-goal',
  'Without an explicit route, the visible active goal should win fallback selection.',
)

const plannedGoalFallback = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'root-goal',
  currentRouteGoalId: '',
  visibleGoalIds: ['planned-goal'],
  activeGoalId: 'hidden-active-goal',
  plannedGoalIds: ['planned-goal'],
  visibleRootGoalIds: ['root-goal'],
})

assert.equal(
  plannedGoalFallback,
  'planned-goal',
  'Planned goals should be the next fallback when the active goal is not visible.',
)

const noRedirectWhenCurrentVisible = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'visible-goal',
  currentRouteGoalId: '',
  visibleGoalIds: ['visible-goal', 'other-goal'],
  activeGoalId: 'other-goal',
  plannedGoalIds: ['other-goal'],
  visibleRootGoalIds: ['visible-goal'],
})

assert.equal(
  noRedirectWhenCurrentVisible,
  null,
  'Visible current goals must not trigger fallback navigation.',
)

const staleRouteOutsidePlannedScopeFallsBackToPlannedGoal = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'old-active-goal',
  currentRouteGoalId: 'old-active-goal',
  visibleGoalIds: ['old-active-goal', 'planned-goal'],
  activeGoalId: null,
  plannedGoalIds: ['planned-goal'],
  plannedScopeGoalIds: ['planned-goal', 'planned-child'],
  visibleRootGoalIds: ['root-goal'],
})

assert.equal(
  staleRouteOutsidePlannedScopeFallsBackToPlannedGoal,
  'planned-goal',
  'A stale explicit route outside the current planned scope must yield to the new focus subtree.',
)

const explicitRouteInsidePlannedScopeStaysStable = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'planned-child',
  currentRouteGoalId: 'planned-child',
  visibleGoalIds: ['planned-goal', 'planned-child'],
  activeGoalId: null,
  plannedGoalIds: ['planned-goal'],
  plannedScopeGoalIds: ['planned-goal', 'planned-child'],
  visibleRootGoalIds: ['root-goal'],
})

assert.equal(
  explicitRouteInsidePlannedScopeStaysStable,
  null,
  'An explicit route inside the current planned scope must remain stable.',
)

const canonicalMathLandscape = JSON.parse(
  readFileSync('../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', 'utf8'),
)
const genericMathSekIView = JSON.parse(
  readFileSync('../curricula/DE/Gymnasium/composition-views/mathematik/de-de-seki.view.json', 'utf8'),
)
const canonicalMathPrismGoalId = '59d5a330-61be-4590-ab46-cf7cefecd144'

const compositionProjectedMathEntries = applyCompositionViewProjection(
  prepareLandscapeEntries([canonicalMathLandscape]),
  genericMathSekIView,
)
const routeProjectedMathEntries = applyMatchedCompositionRouteGoalProjection(
  compositionProjectedMathEntries,
  canonicalMathPrismGoalId,
)
const normalizedMathEntries = normalizeLearnerProjectedEntries(routeProjectedMathEntries)
const mathEntry = normalizedMathEntries[0]
const mathGoalById = new Map(mathEntry.goals.map((goal) => [goal.id, goal] as const))
const mathChildrenByParent = buildDirectChildrenMap(mathGoalById)
const mathRootGoal = mathEntry.goals.find((goal) => (goal.tags ?? []).includes('root'))

assert.ok(mathRootGoal, 'The projected canonical mathematics landscape must retain a root goal.')

const findVisiblePath = (
  goalId: string,
  currentId: string,
  visited: Set<string> = new Set(),
): string[] | null => {
  if (visited.has(currentId)) return null
  const nextVisited = new Set(visited)
  nextVisited.add(currentId)
  if (currentId === goalId) {
    return [currentId]
  }

  for (const childId of mathChildrenByParent.get(currentId) ?? []) {
    const childPath = findVisiblePath(goalId, childId, nextVisited)
    if (childPath) {
      return [currentId, ...childPath]
    }
  }

  return null
}

const visiblePrismPathIds = findVisiblePath(canonicalMathPrismGoalId, mathRootGoal!.id)
assert.ok(
  visiblePrismPathIds,
  'A routed goal outside the explicit composition-view surface must still remain reachable in the learner tree.',
)

const visiblePrismPathTitles = visiblePrismPathIds!.map((goalId) => mathGoalById.get(goalId)?.title ?? goalId)

assert.ok(
  visiblePrismPathTitles.some((title) => title.startsWith('Jahrgangsstufe 7')),
  'The supplemental route-goal path must attach the later mathematics prism goal to the matching J7 scope.',
)

assert.ok(
  !visiblePrismPathTitles.some((title) => title.startsWith('Jahrgangsstufe 5')),
  'The supplemental route-goal path must not leak the later mathematics prism goal into J5.',
)

console.log('✅ Learner goal selection regression checks passed.')
