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
import { buildGoalContainsClosure, buildRenderedScopeDescendantCountMap } from '../src/utils/plannedScope'
import {
  ABI26_MATH_LANDSCAPE_ID,
  ABI26_ROOT_CURRICULUM_ID,
  ABI26_ROOT_FILTER_ID,
  buildAbi26CockpitUrl,
  buildAbi26PersonalCurriculumConfig,
} from '../src/utils/abi26MatheCampaign'
import { GLOBAL_STAGE_SCOPE_CONFIG_IDS } from '../src/utils/personalCurriculumStageScope'

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

const abi26CockpitUrl = buildAbi26CockpitUrl({
  slug: 'abi26-he-mathe-k1',
  source: 'bluesky',
  campaign: 'abi26-he-mathe-k1',
  medium: 'social',
  courseLevel: 'LK',
}, 'learner-123')
const abi26CockpitParams = new URLSearchParams(abi26CockpitUrl.split('?')[1] ?? '')

assert.equal(
  abi26CockpitParams.get('l'),
  ABI26_ROOT_CURRICULUM_ID,
  'Abi26 cockpit links must open the canonical Gymnasium root.',
)
assert.equal(
  abi26CockpitParams.get('f'),
  ABI26_ROOT_FILTER_ID,
  'Abi26 cockpit links must use f for the root jurisdiction filter, not the course profile.',
)
assert.equal(
  abi26CockpitParams.get('courseLevel'),
  'LK',
  'Abi26 cockpit links must carry the course profile separately from the root filter.',
)

const abi26PersonalConfig = buildAbi26PersonalCurriculumConfig('GK', {
  existing: { selected: true, filterId: 'keep' },
})

assert.deepEqual(
  abi26PersonalConfig[ABI26_ROOT_CURRICULUM_ID],
  { selected: true, filterId: ABI26_ROOT_FILTER_ID },
  'Abi26 personal curriculum must select the Hesse root filter.',
)
assert.deepEqual(
  abi26PersonalConfig[ABI26_MATH_LANDSCAPE_ID],
  { selected: true, filterId: 'GK' },
  'Abi26 personal curriculum must apply GK/LK on the mathematics child landscape.',
)
assert.deepEqual(
  abi26PersonalConfig.existing,
  { selected: false, filterId: 'keep' },
  'Abi26 personal curriculum updates must deselect unrelated subject entries.',
)
assert.deepEqual(
  abi26PersonalConfig[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1],
  { selected: false },
  'Abi26 personal curriculum must not include Sekundarstufe I.',
)
assert.deepEqual(
  abi26PersonalConfig[GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2],
  { selected: true },
  'Abi26 personal curriculum must include Sekundarstufe II.',
)

const canonicalMathLandscape = JSON.parse(
  readFileSync('../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', 'utf8'),
)
const genericMathSekIView = JSON.parse(
  readFileSync('../curricula/DE/Gymnasium/composition-views/mathematik/de-de-seki.view.json', 'utf8'),
)
const bavariaMathGkView = JSON.parse(
  readFileSync('../curricula/DE/Gymnasium/composition-views/mathematik/de-by-gk.view.json', 'utf8'),
)
const canonicalMathPrismGoalId = '59d5a330-61be-4590-ab46-cf7cefecd144'
const canonicalMathJ8GoalId = 'd64516eb-9dd2-4808-91d0-0040ccdc281f'
const canonicalMathJ8AxisInterceptGoalId = '0c8b59cb-62c0-5cc7-afd0-7e6e89cbee43'

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

const bavariaProjectedMathEntries = normalizeLearnerProjectedEntries(
  applyCompositionViewProjection(
    prepareLandscapeEntries([canonicalMathLandscape]),
    bavariaMathGkView,
  ),
)
const bavariaMathGoalById = new Map(bavariaProjectedMathEntries[0].goals.map((goal) => [goal.id, goal] as const))
const bavariaMathChildrenByParent = buildDirectChildrenMap(bavariaMathGoalById)
const bavariaVisibleJ8StructureId = 'composition:de-by-gym-math-gk:structure:gk-sek-i-j8'
const bavariaPlannedJ8ScopeGoalIds = buildGoalContainsClosure([canonicalMathJ8GoalId], bavariaMathGoalById)
const bavariaScopeDescendantCounts = buildRenderedScopeDescendantCountMap(
  bavariaMathGoalById,
  bavariaMathChildrenByParent,
  bavariaPlannedJ8ScopeGoalIds,
)

assert.ok(
  bavariaPlannedJ8ScopeGoalIds.has(canonicalMathJ8AxisInterceptGoalId),
  'The canonical J8 scope closure must include the active rational-function J8 goal.',
)
assert.ok(
  !bavariaPlannedJ8ScopeGoalIds.has(bavariaVisibleJ8StructureId),
  'The planned canonical J8 scope should not depend on the synthetic composition-view J8 node ID.',
)
assert.ok(
  (bavariaScopeDescendantCounts.get(bavariaVisibleJ8StructureId) ?? 0) > 0,
  'A hidden canonical J8 planned scope must mark the visible Bavaria GK Jahrgangsstufe 8 structure.',
)

console.log('✅ Learner goal selection regression checks passed.')
