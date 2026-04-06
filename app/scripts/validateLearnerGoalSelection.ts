import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getNextVisibleLearnerGoalSelection } from '../src/utils/learnerGoalSelection'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import { compositionViewExposesGoal } from '../src/utils/compositionViewRuntime'

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
const genericMathLkView = JSON.parse(
  readFileSync('../curricula/DE/Gymnasium/composition-views/mathematik/de-de-lk.view.json', 'utf8'),
)
const genericMathSek1GoalId = '121e3fdf-54d2-4d46-bc2d-f6e725f10f41'
const genericMathVisibleGoalId = '65365dce-f33f-49d8-9516-42f75883aa86'

assert.equal(
  compositionViewExposesGoal(prepareLandscapeEntries([canonicalMathLandscape]), genericMathLkView, genericMathSek1GoalId),
  false,
  'A composition view that does not expose the routed goal must not stay active for learner tree routing.',
)

assert.equal(
  compositionViewExposesGoal(prepareLandscapeEntries([canonicalMathLandscape]), genericMathLkView, genericMathVisibleGoalId),
  true,
  'A composition view must still stay active for goals that are explicitly carried by the view tree.',
)

console.log('✅ Learner goal selection regression checks passed.')
