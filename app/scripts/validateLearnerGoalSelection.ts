import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CompetenceTree } from '../src/components/CompetenceTree'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import type { UiGoal } from '../src/goalTypes'
import {
  getFocusMutationRevealTarget,
  getInitialLearnerGoalReveal,
  getNextVisibleLearnerGoalSelection,
  isActiveGoalRevealEventType,
  shouldAutoRevealActiveGoal,
} from '../src/utils/learnerGoalSelection'
import { getNextSingleLearnerFocus } from '../src/utils/learnerFocus'
import { getLearnerViewCopy } from '../src/utils/learnerViewCopy'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import {
  applyCompositionViewProjection,
  applyMatchedCompositionRouteGoalProjection,
  applyPersonalCurriculumProjection,
} from '../src/utils/compositionViewRuntime'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import {
  collapseLearnerSubjectRoots,
  normalizeLearnerProjectedEntries,
} from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import {
  buildGoalContainsClosure,
  buildCanonicalFocusScope,
  buildRenderedScopeDescendantCountMap,
  buildRenderedScopeMarkerGoalIds,
} from '../src/utils/plannedScope'
import {
  ABI26_DURATION_MODEL,
  ABI26_MATH_LANDSCAPE_ID,
  ABI26_ROOT_CURRICULUM_ID,
  ABI26_ROOT_FILTER_ID,
  buildAbi26CockpitUrl,
  buildAbi26PersonalCurriculumConfig,
} from '../src/utils/abi26MatheCampaign'
import { GLOBAL_STAGE_SCOPE_CONFIG_IDS } from '../src/utils/personalCurriculumStageScope'
import {
  beginLatestRequest,
  invalidateLatestRequest,
  isLatestRequestForScope,
} from '../src/utils/latestRequestSequence'

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

const explicitRouteDuringVisibilityHydration = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'root-goal',
  currentRouteGoalId: 'deep-linked-goal',
  visibleGoalIds: ['planned-goal'],
  activeGoalId: 'planned-goal',
  plannedGoalIds: ['planned-goal'],
  plannedScopeGoalIds: ['planned-goal'],
  visibleRootGoalIds: ['root-goal'],
})

assert.equal(
  explicitRouteDuringVisibilityHydration,
  null,
  'A deep-linked route must not be replaced while visibility/projection is still hydrating.',
)

assert.equal(
  shouldAutoRevealActiveGoal({
    activeGoalId: 'active-goal',
    previousRevealedActiveGoalId: 'active-goal',
    currentRouteGoalId: 'inspected-goal',
    pendingRouteSyncGoalId: null,
  }),
  false,
  'A learner may inspect another routed tree goal without being forced back to the unchanged active goal.',
)

assert.equal(
  shouldAutoRevealActiveGoal({
    activeGoalId: 'active-goal',
    previousRevealedActiveGoalId: 'previous-active-goal',
    currentRouteGoalId: 'inspected-goal',
    pendingRouteSyncGoalId: null,
  }),
  false,
  'A routed inspection target must not be replaced by a backend active-goal load or change.',
)

assert.equal(
  shouldAutoRevealActiveGoal({
    activeGoalId: 'new-active-goal',
    previousRevealedActiveGoalId: null,
    currentRouteGoalId: 'old-active-goal',
    pendingRouteSyncGoalId: null,
    forceActiveGoalReveal: true,
  }),
  true,
  'An explicit active-goal SSE update must reveal the new active goal even when the cockpit still routes to the old goal.',
)

assert.equal(
  isActiveGoalRevealEventType('LEARNING_PLAN_AUTO_HANDOFF'),
  true,
  'A server-side learning-plan handoff must force the Cockpit to reveal the new active goal.',
)

assert.equal(
  shouldAutoRevealActiveGoal({
    activeGoalId: 'new-active-goal',
    previousRevealedActiveGoalId: 'old-active-goal',
    currentRouteGoalId: 'old-active-goal',
    pendingRouteSyncGoalId: null,
  }),
  true,
  'When the backend advances the active goal from the currently routed active goal, the cockpit should reveal the new active goal.',
)

assert.equal(
  shouldAutoRevealActiveGoal({
    activeGoalId: 'active-goal',
    previousRevealedActiveGoalId: 'active-goal',
    currentRouteGoalId: '',
    pendingRouteSyncGoalId: null,
  }),
  true,
  'Opening the learner cockpit without an explicit goal route should still reveal the active goal.',
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

const plannedGoalWhileLearnerStateLoads = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'hidden-root-goal',
  currentRouteGoalId: '',
  learnerStateReady: false,
  visibleGoalIds: ['planned-goal'],
  activeGoalId: null,
  plannedGoalIds: ['planned-goal'],
  visibleRootGoalIds: ['visible-root-goal'],
})

assert.equal(
  plannedGoalWhileLearnerStateLoads,
  null,
  'Planned and root fallbacks must wait for learner state so a later active goal can win initial navigation.',
)

assert.equal(
  getInitialLearnerGoalReveal({
    learnerStateReady: false,
    hasAlreadyRevealed: false,
    hasLearnerTree: true,
    currentRouteGoalId: '',
    activeGoalId: null,
    hasPlannedGoals: true,
  }),
  null,
  'A planned scope must not create a route while the authoritative learner state is still loading.',
)
assert.equal(
  getInitialLearnerGoalReveal({
    learnerStateReady: true,
    hasAlreadyRevealed: false,
    hasLearnerTree: true,
    currentRouteGoalId: '',
    activeGoalId: 'active-goal',
    hasPlannedGoals: true,
  }),
  'active',
  'The active goal must win initial Cockpit navigation once learner state is ready.',
)
assert.equal(
  getInitialLearnerGoalReveal({
    learnerStateReady: true,
    hasAlreadyRevealed: false,
    hasLearnerTree: true,
    currentRouteGoalId: '',
    activeGoalId: null,
    hasPlannedGoals: true,
  }),
  'scope',
  'The planned scope is the initial fallback only after learner state confirms that no active goal exists.',
)
assert.equal(
  getInitialLearnerGoalReveal({
    learnerStateReady: true,
    hasAlreadyRevealed: false,
    hasLearnerTree: true,
    currentRouteGoalId: 'deep-linked-goal',
    activeGoalId: 'active-goal',
    hasPlannedGoals: true,
  }),
  null,
  'An explicit goal route must outrank automatic active-goal navigation.',
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

const explicitRouteOutsidePlannedScopeStaysStable = getNextVisibleLearnerGoalSelection({
  currentGoalId: 'old-active-goal',
  currentRouteGoalId: 'old-active-goal',
  visibleGoalIds: ['old-active-goal', 'planned-goal'],
  activeGoalId: null,
  plannedGoalIds: ['planned-goal'],
  plannedScopeGoalIds: ['planned-goal', 'planned-child'],
  visibleRootGoalIds: ['root-goal'],
})

assert.equal(
  explicitRouteOutsidePlannedScopeStaysStable,
  null,
  'A visible explicit route outside the current planned scope must remain stable for deep links and inspections.',
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

assert.equal(
  getFocusMutationRevealTarget({
    activeGoalId: 'new-active-goal',
    authoritativeFocusGoalIds: ['new-focus-root'],
    requestedFocusGoalIds: ['requested-focus-root'],
  }),
  'new-active-goal',
  'An explicit focus mutation must reveal the active goal returned by the authoritative state refresh.',
)

assert.equal(
  getFocusMutationRevealTarget({
    activeGoalId: null,
    authoritativeFocusGoalIds: ['authoritative-focus-root'],
    requestedFocusGoalIds: ['new-focus-root'],
  }),
  'new-focus-root',
  'Without an active goal, an explicit focus mutation must reveal the newly requested visible focus root.',
)

assert.equal(
  getFocusMutationRevealTarget({
    activeGoalId: null,
    authoritativeFocusGoalIds: ['authoritative-focus-root'],
    requestedFocusGoalIds: [],
  }),
  'authoritative-focus-root',
  'The authoritative focus root is the fallback when no requested scope representative is available.',
)

const learnerViewSource = readFileSync('src/views/LearnerView.tsx', 'utf8')
const switchHandlerStart = learnerViewSource.indexOf('const handleSwitchLearningPlan = useCallback')
const switchHandlerEnd = learnerViewSource.indexOf('\n  const retryLearningPlans = useCallback', switchHandlerStart)
assert.ok(switchHandlerStart >= 0 && switchHandlerEnd > switchHandlerStart)
const switchHandlerSource = learnerViewSource.slice(switchHandlerStart, switchHandlerEnd)
const switchPostIndex = switchHandlerSource.indexOf('await switchLearnerLearningPlan(')
const switchScopeGuardIndex = switchHandlerSource.indexOf('if (!isCurrentRequest()) return', switchPostIndex)
const switchStateApplyIndex = switchHandlerSource.indexOf('applyLearningPlanTransition(', switchPostIndex)
assert.ok(
  switchPostIndex >= 0
    && switchScopeGuardIndex > switchPostIndex
    && switchStateApplyIndex > switchScopeGuardIndex,
  'A completed plan-switch request must pass the current learner/scope guard before applying returned state.',
)
assert.match(
  switchHandlerSource,
  /plan\.landscapeId !== landscapeId && !onSelectGoalInLandscape[\s\S]*?await switchLearnerLearningPlan\(/u,
  'A cross-subject plan switch must be rejected before POST when landscape-aware navigation is unavailable.',
)
assert.match(
  learnerViewSource,
  /invalidateLatestRequest\(learningPlanContinueRequestSequenceRef\)/u,
  'Changing learner/root scope must invalidate every pending plan-continue response.',
)
const transitionApplyStart = learnerViewSource.indexOf('const applyLearningPlanTransition = useCallback')
const transitionApplyEnd = learnerViewSource.indexOf(
  '\n  const handleSwitchLearningPlan = useCallback',
  transitionApplyStart,
)
assert.ok(transitionApplyStart >= 0 && transitionApplyEnd > transitionApplyStart)
const transitionApplySource = learnerViewSource.slice(transitionApplyStart, transitionApplyEnd)
// Focus and active-goal state now share the authoritative /state response;
// there is no separate planned-goals GET request to invalidate.
const transitionStateInvalidationIndex = transitionApplySource.indexOf(
  'invalidateLatestRequest(learnerStateRequestSequenceRef)',
)
const transitionEmbeddedStateApplyIndex = transitionApplySource.indexOf('applyLearnerStatePayload(')
assert.ok(
  transitionStateInvalidationIndex >= 0
    && transitionEmbeddedStateApplyIndex > transitionStateInvalidationIndex,
  'A learning-plan transition must invalidate an older learner-state request before applying its authoritative focus and active goal.',
)
const learnerStateSequence = { current: 0 }
const pendingLearnerStateRefresh = beginLatestRequest(learnerStateSequence)
invalidateLatestRequest(learnerStateSequence)
assert.equal(
  isLatestRequestForScope(
    learnerStateSequence,
    pendingLearnerStateRefresh,
    'learner-a|root-a',
    'learner-a|root-a',
  ),
  false,
  'An older learner-state response must not overwrite focus or the active goal after a learning-plan transition in the same scope.',
)
const planContinueSequence = { current: 0 }
const pendingPlanContinue = beginLatestRequest(planContinueSequence)
assert.equal(
  isLatestRequestForScope(planContinueSequence, pendingPlanContinue, 'learner-b|root-b', 'learner-a|root-a'),
  false,
  'A plan-continue response from an earlier learner/root scope must fail closed.',
)
invalidateLatestRequest(planContinueSequence)
assert.equal(
  isLatestRequestForScope(planContinueSequence, pendingPlanContinue, 'learner-a|root-a', 'learner-a|root-a'),
  false,
  'An explicitly invalidated plan-continue response must fail closed even when a scope key is reused.',
)

assert.deepEqual(
  Array.from(getNextSingleLearnerFocus(['math'], 'math')),
  ['math'],
  'Selecting the current learner focus again must keep it selected.',
)
assert.deepEqual(
  Array.from(getNextSingleLearnerFocus(['math'], 'physics')),
  ['physics'],
  'Selecting another learner focus must replace the current focus.',
)
assert.deepEqual(
  Array.from(getNextSingleLearnerFocus(['math', 'physics'], 'math')),
  ['math'],
  'Selecting one entry from legacy multi-focus state must normalize it to one focus.',
)

assert.equal(
  getLearnerViewCopy('de').revealActiveGoalTitle,
  'Gehe zum aktiven Ziel',
  'The active-goal tooltip must use the German-only copy in German.',
)
assert.equal(
  getLearnerViewCopy('en').revealActiveGoalTitle,
  'Go to active goal',
  'The active-goal tooltip must use the English-only copy in English.',
)
assert.equal(
  getLearnerViewCopy('de').openGoalMenuLabel,
  'Lernzielmenü öffnen',
  'The mobile learner menu needs a localized German accessible name.',
)
assert.equal(
  getLearnerViewCopy('en').openGoalMenuLabel,
  'Open learning-goal menu',
  'The mobile learner menu needs a localized English accessible name.',
)
assert.match(
  learnerViewSource,
  /title=\{learnerViewCopy\.revealActiveGoalTitle\}/,
  'LearnerView must bind the active-goal tooltip to the selected language.',
)
assert.ok(
  !learnerViewSource.includes('Gehe zum aktiven Ziel / Go to active goal'),
  'LearnerView must not expose a bilingual active-goal tooltip.',
)
assert.match(
  learnerViewSource,
  /if \(isLearnerStatePayload\(embeddedState\)\) \{[\s\S]*?refreshedState = applyLearnerStatePayload\(embeddedState, learnerStateScopeKey\)[\s\S]*?\} else \{[\s\S]*?refreshedState = await refreshState\(true\)/,
  'The explicit learner-focus mutation must consume its returned state and use GET only as a compatibility fallback.',
)
assert.match(
  learnerViewSource,
  /getFocusMutationRevealTarget\(\{[\s\S]*?activeGoalId: refreshedState\.activeGoalId[\s\S]*?authoritativeFocusGoalIds: refreshedState\.plannedGoalIds/,
  'The explicit learner-focus mutation must navigate from the returned authoritative active goal or focus root.',
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
  {
    selected: true,
    filterId: ABI26_ROOT_FILTER_ID,
    durationModel: ABI26_DURATION_MODEL,
    stage: 'SekII',
  },
  'Abi26 personal curriculum must select Hesse, G9 and the canonical Sek II stage.',
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
const hesseMathLkView = JSON.parse(
  readFileSync('../curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json', 'utf8'),
)
const canonicalMathPrismGoalId = '59d5a330-61be-4590-ab46-cf7cefecd144'
const canonicalMathPrismVolumeGoalId = '68fb0e78-34f2-5572-8db6-e7f5ebcff70f'
const canonicalMathPrismSurfaceGoalId = 'f1348d40-3872-5e44-8892-3600c811796f'
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

assert.equal(
  mathGoalById.get(canonicalMathPrismGoalId)?.type,
  'cluster',
  'The historical combined prism ID must remain a non-atomic topic cluster.',
)
assert.deepEqual(
  canonicalMathLandscape.goals.find((goal: UiGoal) => goal.id === canonicalMathPrismGoalId)?.contains,
  [canonicalMathPrismVolumeGoalId, canonicalMathPrismSurfaceGoalId],
  'The historical prism cluster must contain the two independent competencies exactly once.',
)
assert.deepEqual(
  mathGoalById.get(canonicalMathPrismGoalId)?.contains,
  [],
  'A route to the historical cluster must not promote its prerequisite-only children into course targets.',
)
const prismPreparationSource = prepareLandscapeEntries([canonicalMathLandscape])
const prismCanonicalGoals = new Map(prismPreparationSource[0].goals.map((goal) => [goal.id, goal]))
const prismSeedId = '0dded9c1-043e-57cb-82fc-792b391e9cb0'
assert.ok(collectCompositionProjectionRoleGoalIds(genericMathSekIView.rootNodes, prismCanonicalGoals)
  .targetGoalIds.has(prismSeedId), 'The prism fixture must start from a real current view target.')
const prismRequiredPaths = new Map<string, string[]>([[prismSeedId, [prismSeedId]]])
const prismQueue = [prismSeedId]
for (let index = 0; index < prismQueue.length; index += 1) {
  const id = prismQueue[index]
  for (const prerequisiteId of [...(prismCanonicalGoals.get(id)?.requires ?? [])].sort()) {
    assert.ok(prismCanonicalGoals.has(prerequisiteId), 'Every prism prerequisite must resolve in the canonical graph.')
    if (prismRequiredPaths.has(prerequisiteId)) continue
    prismRequiredPaths.set(prerequisiteId, [...prismRequiredPaths.get(id)!, prerequisiteId])
    prismQueue.push(prerequisiteId)
  }
}
assert.equal(prismRequiredPaths.size, 34, 'The synthetic learning basis must close over all canonical prerequisites.')
prismPreparationSource[0].meta.personalCurriculumProjection = {
  revision: 'atomic-prerequisite-learning-v1',
  rootLandscapeId: prismPreparationSource[0].meta.landscapeId,
  scopeRevision: 'synthetic-prism-bfs-fixture',
  seedAtomicGoalIds: [prismSeedId],
  targetGoalIds: [...prismRequiredPaths.keys()].sort(),
  requiredByPaths: Object.fromEntries([...prismRequiredPaths].filter(([id]) => id !== prismSeedId)),
}
const prismPreparationEntries = normalizeLearnerProjectedEntries(applyPersonalCurriculumProjection(
  compositionProjectedMathEntries,
  prismPreparationSource,
))
const prismPreparationGoals = new Map(prismPreparationEntries.flatMap((entry) => entry.goals.map((goal) => [goal.id, goal] as const)))
const prismPreparationChildren = buildDirectChildrenMap(prismPreparationGoals)
const prismPreparationRoot = prismPreparationEntries[0].goals.find((goal) => goal.tags?.includes('root'))!
const prismPreparationReachable = new Set<string>()
const visitPrismPreparation = (id: string) => {
  if (prismPreparationReachable.has(id)) return
  prismPreparationReachable.add(id)
  for (const childId of prismPreparationChildren.get(id) ?? []) visitPrismPreparation(childId)
}
visitPrismPreparation(prismPreparationRoot.id)
for (const prismChildId of [canonicalMathPrismVolumeGoalId, canonicalMathPrismSurfaceGoalId]) {
  assert.equal(
    compositionProjectedMathEntries.flatMap((entry) => entry.compositionPreparationPlacements ?? [])
      .filter((placement) => placement.goalId === prismChildId).length,
    1,
    'Each independent prism competency must have exactly one authored acquisition placement.',
  )
  assert.ok(prismPreparationReachable.has(prismChildId),
    'A prism competency in the canonically closed synthetic learning basis must be reachable through its acquisition placement.')
}

const canonicalIntegerExponentGoalId = '6596405a-9728-41df-9163-53670ec2a937'
const canonicalPowerFunctionGoalId = '66077296-a8f8-4645-938b-7c3424cb2f14'
const canonicalMathGoalById = new Map<string, UiGoal>(prepareLandscapeEntries([canonicalMathLandscape])[0].goals
  .map((goal) => [goal.id, goal]))
const genericJ8ScopeGoalIds = buildCanonicalFocusScope(
  [canonicalMathJ8GoalId], mathGoalById, prepareLandscapeEntries([canonicalMathLandscape]),
)
// The persisted canonical scope keeps all 48 members (40 atoms), independently
// of how the repaired current view groups its visible members.
assert.equal(genericJ8ScopeGoalIds.size, 48)
assert.equal(
  createHash('sha256').update(`${[...genericJ8ScopeGoalIds].sort().join('\n')}\n`).digest('hex'),
  'c0209d5435bb65d340103b84f675e5480955eb84bd002edfce2bd5a106a02783',
  'Current presentation groups must not narrow or expand the persisted canonical J8 selection.',
)
assert.equal([...genericJ8ScopeGoalIds].filter((id) => canonicalMathGoalById.get(id)?.type === 'atomic').length, 40)
assert.ok(genericJ8ScopeGoalIds.has(canonicalIntegerExponentGoalId))
assert.ok(!genericJ8ScopeGoalIds.has(canonicalPowerFunctionGoalId))

const renderedLeavesBelow = (rootId: string, children: Map<string, string[]>): Set<string> => {
  const leaves = new Set<string>()
  const visited = new Set<string>()
  const pending = [rootId]
  while (pending.length > 0) {
    const id = pending.pop()!
    if (visited.has(id)) continue
    visited.add(id)
    const childIds = children.get(id) ?? []
    if (childIds.length === 0) leaves.add(id)
    else pending.push(...childIds)
  }
  return leaves
}

const assertCompleteScopeMarkers = (
  markers: Set<string>,
  scope: Set<string>,
  children: Map<string, string[]>,
): void => {
  for (const markerId of markers) {
    const leaves = renderedLeavesBelow(markerId, children)
    assert.ok(leaves.size > 0)
    assert.ok([...leaves].every((id) => scope.has(id)), `${markerId}: a complete marker must not include an unselected leaf`)
    for (const otherMarkerId of markers) {
      if (markerId === otherMarkerId) continue
      const descendants = new Set<string>([otherMarkerId])
      const pending = [otherMarkerId]
      while (pending.length > 0) {
        for (const id of children.get(pending.pop()!) ?? []) {
          if (!descendants.has(id)) { descendants.add(id); pending.push(id) }
        }
      }
      assert.ok(!descendants.has(markerId), 'A complete scope marker must not repeat a marked ancestor.')
    }
  }
}
const genericJ8ScopeMarkerGoalIds = buildRenderedScopeMarkerGoalIds(
  mathGoalById,
  mathChildrenByParent,
  genericJ8ScopeGoalIds,
  [canonicalMathJ8GoalId],
)
const assertExactRenderedScopeCoverage = (
  markers: Set<string>, scope: Set<string>, rootId: string, children: Map<string, string[]>,
): void => {
  const markedLeaves = new Set([...markers].flatMap((id) => [...renderedLeavesBelow(id, children)]))
  const selectedVisibleLeaves = [...renderedLeavesBelow(rootId, children)].filter((id) => scope.has(id))
  assert.deepEqual([...markedLeaves].sort(), selectedVisibleLeaves.sort(),
    'Complete focus markers must cover every visible selected leaf and no unselected leaf.')
}
assertCompleteScopeMarkers(genericJ8ScopeMarkerGoalIds, genericJ8ScopeGoalIds, mathChildrenByParent)
assertExactRenderedScopeCoverage(genericJ8ScopeMarkerGoalIds, genericJ8ScopeGoalIds, mathRootGoal!.id, mathChildrenByParent)
assert.ok(genericJ8ScopeMarkerGoalIds.size > 1,
  'The persisted J8 scope must mark all complete current topic groups, rather than only the fractions group.')
assert.ok([...genericJ8ScopeMarkerGoalIds].some((id) => renderedLeavesBelow(id, mathChildrenByParent).has(canonicalIntegerExponentGoalId)),
  'The integer-exponent competency must remain represented in the current J8 focus markers.')

const storedLanguageValues = new Map<string, string>([
  ['skillpilot_lang', 'de'],
])
const localStorageStub: Storage = {
  get length() {
    return storedLanguageValues.size
  },
  clear: () => storedLanguageValues.clear(),
  getItem: (key) => storedLanguageValues.get(key) ?? null,
  key: (index) => [...storedLanguageValues.keys()][index] ?? null,
  removeItem: (key) => {
    storedLanguageValues.delete(key)
  },
  setItem: (key, value) => {
    storedLanguageValues.set(key, String(value))
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageStub,
})

const genericJ8LearnerTreeMarkup = renderToStaticMarkup(
  createElement(
    LanguageProvider,
    null,
    createElement(CompetenceTree, {
      rootGoals: [mathRootGoal!],
      allGoals: mathGoalById,
      getMastery: () => 0,
      plannedGoals: new Set([canonicalMathJ8GoalId]),
      plannedScopeGoalIds: genericJ8ScopeGoalIds,
      onTogglePlan: () => undefined,
      onSelect: () => undefined,
      selectedId: [...genericJ8ScopeMarkerGoalIds][0],
      audience: 'learner',
      structureMode: 'content',
      visibleChildrenByParentOverride: mathChildrenByParent,
      useRawGoalTitles: true,
    }),
  ),
)

assert.ok(
  genericJ8LearnerTreeMarkup.includes('lucide-circle-dot')
    && genericJ8LearnerTreeMarkup.includes('text-sky-600')
    && genericJ8LearnerTreeMarkup.includes('aria-label="Aktueller Lernfokus"'),
  'A visible learner-side representative of a hidden canonical focus must use the blue circle-dot focus marker.',
)
assert.ok(
  !genericJ8LearnerTreeMarkup.includes('lucide-square-x'),
  'A learner-side focus representative must not fall back to the former red square-x list marker.',
)

const bavariaProjectedMathEntries = normalizeLearnerProjectedEntries(
  applyCompositionViewProjection(
    prepareLandscapeEntries([canonicalMathLandscape]),
    bavariaMathGkView,
  ),
)
const bavariaMathGoalById = new Map(bavariaProjectedMathEntries[0].goals.map((goal) => [goal.id, goal] as const))
const bavariaMathChildrenByParent = buildDirectChildrenMap(bavariaMathGoalById)
const bavariaVisibleJ8StructureId = 'composition:de-by-gym-math-gk:structure:math-layout-seki-j8'
const bavariaPlannedJ8ScopeGoalIds = buildCanonicalFocusScope(
  [canonicalMathJ8GoalId], bavariaMathGoalById, prepareLandscapeEntries([canonicalMathLandscape]),
)
const bavariaScopeDescendantCounts = buildRenderedScopeDescendantCountMap(
  bavariaMathGoalById,
  bavariaMathChildrenByParent,
  bavariaPlannedJ8ScopeGoalIds,
)
const bavariaScopeMarkerGoalIds = buildRenderedScopeMarkerGoalIds(
  bavariaMathGoalById,
  bavariaMathChildrenByParent,
  bavariaPlannedJ8ScopeGoalIds,
  [canonicalMathJ8GoalId],
)
assert.deepEqual([...bavariaPlannedJ8ScopeGoalIds].sort(), [...genericJ8ScopeGoalIds].sort(),
  'Changing the visible Land grouping must preserve every persisted canonical J8 scope member.')
assertCompleteScopeMarkers(bavariaScopeMarkerGoalIds, bavariaPlannedJ8ScopeGoalIds, bavariaMathChildrenByParent)
assert.deepEqual(
  [...renderedLeavesBelow(bavariaVisibleJ8StructureId, bavariaMathChildrenByParent)]
    .filter((id) => !bavariaPlannedJ8ScopeGoalIds.has(id)),
  ['e2174adb-545f-5119-8f23-45f67e358d70'],
  'The current BY J8 group also contains a new acquisition task outside the persisted legacy J8 selection.',
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
assertExactRenderedScopeCoverage(bavariaScopeMarkerGoalIds, bavariaPlannedJ8ScopeGoalIds,
  bavariaProjectedMathEntries[0].goals.find((goal) => goal.tags?.includes('root'))!.id, bavariaMathChildrenByParent)

// Exercise the actual app order with a complete, independently constructed
// canonical prerequisite closure. A canonical focus may span several current
// presentation groups; a synthetic group must keep its authored visible scope.
for (const view of [genericMathSekIView, bavariaMathGkView]) {
  const seedIds = [...collectCompositionProjectionRoleGoalIds(view.rootNodes, canonicalMathGoalById).targetGoalIds]
    .filter((id) => canonicalMathGoalById.get(id)?.type === 'atomic').sort()
  const paths = new Map<string, string[]>(seedIds.map((id) => [id, [id]]))
  const queue = [...seedIds]
  for (let index = 0; index < queue.length; index += 1) {
    const id = queue[index]
    for (const prerequisite of canonicalMathGoalById.get(id)?.requires ?? []) {
      assert.ok(canonicalMathGoalById.has(prerequisite), 'Every canonical prerequisite must resolve.')
      if (paths.has(prerequisite)) continue
      paths.set(prerequisite, [...paths.get(id)!, prerequisite])
      queue.push(prerequisite)
    }
  }
  const source = prepareLandscapeEntries([canonicalMathLandscape])
  source[0].meta.personalCurriculumProjection = {
    revision: 'atomic-prerequisite-learning-v1', rootLandscapeId: source[0].meta.landscapeId,
    scopeRevision: 'synthetic-full-view-canonical-bfs', seedAtomicGoalIds: seedIds,
    targetGoalIds: [...paths.keys()].sort(),
    requiredByPaths: Object.fromEntries([...paths].filter(([id]) => !seedIds.includes(id))),
  }
  for (const routeId of [undefined, canonicalMathJ8GoalId, canonicalMathPrismGoalId]) {
    const presented = applyPersonalCurriculumProjection(normalizeLearnerProjectedEntries(
      applyMatchedCompositionRouteGoalProjection(applyCompositionViewProjection(source, view), routeId),
    ), source)
    const presentedGoals = new Map(presented[0].goals.map((goal) => [goal.id, goal]))
    const children = buildDirectChildrenMap(presentedGoals)
    const root = presented[0].goals.find((goal) => goal.tags?.includes('root'))!
    const before = JSON.stringify(presented)
    const focus = buildCanonicalFocusScope([canonicalMathJ8GoalId], presentedGoals, source)
    const focusAtoms = [...focus].filter((id) => paths.has(id) && canonicalMathGoalById.get(id)?.type === 'atomic').sort()
    const expectedAtoms = [...genericJ8ScopeGoalIds]
      .filter((id) => paths.has(id) && canonicalMathGoalById.get(id)?.type === 'atomic').sort()
    assert.equal(expectedAtoms.length, 40)
    assert.deepEqual(focusAtoms, expectedAtoms,
      `${view.viewId}/${routeId ?? 'no route'}: retain all 40 canonical J8 atoms in the current learning basis.`)
    const markers = buildRenderedScopeMarkerGoalIds(presentedGoals, children, focus, [canonicalMathJ8GoalId])
    assertCompleteScopeMarkers(markers, focus, children)
    assertExactRenderedScopeCoverage(markers, focus, root.id, children)
    const visibleAtoms = [...renderedLeavesBelow(root.id, children)]
      .filter((id) => presentedGoals.get(id)?.type === 'atomic').sort()
    assert.deepEqual(visibleAtoms, [...paths.keys()].sort(), 'Focus resolution must preserve the complete visible learning basis.')
    for (const goal of presentedGoals.values()) {
      if (!goal.id.startsWith('composition:')) continue
      assert.deepEqual(buildCanonicalFocusScope([goal.id], presentedGoals, source),
        buildGoalContainsClosure([goal.id], presentedGoals), 'Synthetic group focus must retain its current presentation scope.')
    }
    assert.equal(JSON.stringify(presented), before, 'Focus lookup must not rewrite tree, scope metadata, or goals.')
  }
}
assert.ok(
  !bavariaScopeMarkerGoalIds.has(canonicalMathJ8AxisInterceptGoalId),
  'A hidden canonical J8 planned scope must not mark every scoped descendant as a separate planned goal.',
)

const hesseProjectedMathEntries = normalizeLearnerProjectedEntries(
  applyCompositionViewProjection(
    prepareLandscapeEntries([canonicalMathLandscape]),
    hesseMathLkView,
  ),
)
const hesseMathGoalById = new Map(hesseProjectedMathEntries[0].goals.map((goal) => [goal.id, goal] as const))
const hesseMathChildrenByParent = buildDirectChildrenMap(hesseMathGoalById)
const canonicalMathRootGoalId = 'c01b1ce9-a667-4a46-b251-ec33ae602b15'
const hesseVisibleSekIiStructureId = 'composition:de-he-gym-sekii-math-lk:structure:sek2-lk'
const hesseSekIiScopeGoalIds = buildGoalContainsClosure(
  [hesseVisibleSekIiStructureId],
  hesseMathGoalById,
)
const hesseSekIiScopeMarkerGoalIds = buildRenderedScopeMarkerGoalIds(
  hesseMathGoalById,
  hesseMathChildrenByParent,
  hesseSekIiScopeGoalIds,
  [hesseVisibleSekIiStructureId],
)
const hesseRenderedMathGoalIds = buildGoalContainsClosure(
  [canonicalMathRootGoalId],
  hesseMathGoalById,
)
const hesseVisibleScopeMarkerGoalIds = Array.from(hesseSekIiScopeMarkerGoalIds)
  .filter((goalId) => hesseRenderedMathGoalIds.has(goalId))

assert.ok(
  hesseMathChildrenByParent.get(canonicalMathRootGoalId)?.includes(hesseVisibleSekIiStructureId),
  'The Hessen LK projection must render Sekundarstufe II as a separately selectable child of Mathematics.',
)
assert.deepStrictEqual(
  hesseVisibleScopeMarkerGoalIds,
  [],
  'A visible exact Sekundarstufe-II selection must not also mark its fully covered Mathematics parent as selected.',
)

const collectRenderedIds = (
  rootId: string,
  childrenByParent: Map<string, string[]>,
) => {
  const ids = new Set<string>()
  const visit = (id: string) => {
    if (ids.has(id)) return
    ids.add(id)
    childrenByParent.get(id)?.forEach(visit)
  }
  visit(rootId)
  return ids
}

const renderedAtomicProgress = (
  rootId: string,
  allGoals: Map<string, UiGoal>,
  childrenByParent: Map<string, string[]>,
) => {
  const atomicIds = [...collectRenderedIds(rootId, childrenByParent)]
    .filter((id) => allGoals.get(id)?.type === 'atomic')
    .sort()
  const totals = atomicIds.reduce((result, id, index) => {
    const weight = allGoals.get(id)!.weight
    return {
      weight: result.weight + weight,
      masteredWeight: result.masteredWeight + weight * ((index % 3) / 2),
    }
  }, { weight: 0, masteredWeight: 0 })
  return { atomicIds, ...totals }
}

const subjectRootCases = [
  { directory: 'mathematik', landscape: canonicalMathLandscape, views: ['de-he-gk', 'de-he-lk'] },
  {
    directory: 'physik',
    landscape: JSON.parse(readFileSync('../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', 'utf8')),
    views: ['de-he-gk', 'de-he-lk'],
  },
  {
    directory: 'chemie',
    landscape: JSON.parse(readFileSync('../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', 'utf8')),
    views: ['de-he-gk', 'de-he-lk'],
  },
  {
    directory: 'biologie',
    landscape: JSON.parse(readFileSync('../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json', 'utf8')),
    // Biology currently uses the nationwide view for Hesse too.
    views: ['de-de-gym-biology-gk'],
  },
]
const subjectRootEntries = prepareLandscapeEntries(subjectRootCases.map(({ landscape }) => landscape))

for (const { directory, views } of subjectRootCases) {
  for (const viewName of views) {
    const view = JSON.parse(readFileSync(
      `../curricula/DE/Gymnasium/composition-views/${directory}/${viewName}.view.json`, 'utf8',
    ))
    const entry = normalizeLearnerProjectedEntries(
      applyCompositionViewProjection(subjectRootEntries, view),
    ).find((candidate) => candidate.meta.landscapeId === view.landscapeId)!
    const allGoals = new Map(entry.goals.map((goal) => [goal.id, goal] as const))
    const root = entry.goals.find((goal) => goal.tags?.includes('root'))!
    assert.ok(root, `${viewName}: retain the real subject root.`)
    const originalChildren = buildDirectChildrenMap(allGoals)
    const originalChildrenSnapshot = structuredClone(originalChildren)
    const originalGoalsSnapshot = structuredClone(allGoals)
    const { childrenByParent, subjectRootIdByAlias, childrenBySubjectRootAlias } =
      collapseLearnerSubjectRoots(allGoals, originalChildren)

    assert.deepStrictEqual(originalChildren, originalChildrenSnapshot, `${viewName}: leave the input tree untouched.`)
    assert.deepStrictEqual(allGoals, originalGoalsSnapshot, `${viewName}: retain every canonical and persisted synthetic scope ID.`)
    assert.deepStrictEqual(
      renderedAtomicProgress(root.id, allGoals, childrenByParent),
      renderedAtomicProgress(root.id, allGoals, originalChildren),
      `${viewName}: every atomic target and its weighted progress must remain unchanged.`,
    )
    for (const [aliasId, rootId] of subjectRootIdByAlias) {
      assert.equal(rootId, root.id)
      assert.equal(childrenByParent.has(aliasId), false, 'The hidden alias must not remain a second visible parent.')
      assert.deepStrictEqual(childrenBySubjectRootAlias.get(aliasId), originalChildren.get(aliasId))
      const persistedFocus = buildGoalContainsClosure([aliasId], allGoals)
      assert.ok(persistedFocus.size > 1, 'A persisted subject-alias focus must still resolve its real descendants.')
      assert.deepStrictEqual(
        buildGoalContainsClosure([aliasId], allGoals),
        buildGoalContainsClosure([aliasId], originalGoalsSnapshot),
        'Collapsing a visible row must not narrow or replace an existing stored focus.',
      )
      const markers = buildRenderedScopeMarkerGoalIds(allGoals, childrenByParent, persistedFocus, [aliasId])
      const context = `${directory}/${viewName}: hidden subject-alias ${aliasId}`
      const visibleIds = collectRenderedIds(root.id, childrenByParent)
      const visibleAtomicIds = [...visibleIds].filter((id) => allGoals.get(id)?.type === 'atomic').sort()
      const focusedAtomicIds = visibleAtomicIds.filter((id) => persistedFocus.has(id))
      const markedAtomicIds = new Set<string>()
      for (const markerId of markers) {
        assert.ok(visibleIds.has(markerId), `${context}: focus markers must be visible below the real root.`)
        for (const id of collectRenderedIds(markerId, childrenByParent)) {
          if (allGoals.get(id)?.type === 'atomic') markedAtomicIds.add(id)
        }
      }
      assert.deepStrictEqual(
        [...markedAtomicIds].sort(), focusedAtomicIds,
        `${context}: visible marker branches must cover every selected atomic target and no unselected sibling.`,
      )
      if (focusedAtomicIds.length === visibleAtomicIds.length) {
        assert.ok(markers.has(root.id), `${context}: the real root must represent the complete hidden subject scope.`)
      } else {
        assert.equal(markers.has(root.id), false, `${context}: a partial alias focus must not mark unrelated root siblings.`)
      }
      if (directory === 'mathematik' || directory === 'physik') {
        assert.deepStrictEqual(focusedAtomicIds, visibleAtomicIds, `${context}: retain the existing full-subject fixture.`)
        assert.ok(markers.has(root.id), `${context}: retain the complete-subject root marker.`)
      }
      const explicitVisibleGoalId = focusedAtomicIds[0]
      assert.ok(explicitVisibleGoalId, `${context}: retain a visible atomic focus target.`)
      assert.deepStrictEqual(
        [...buildRenderedScopeMarkerGoalIds(
          allGoals, childrenByParent,
          buildGoalContainsClosure([explicitVisibleGoalId], allGoals), [explicitVisibleGoalId],
        )],
        [],
        `${context}: an exact visible selection must not gain additional ancestor controls.`,
      )
    }
    if (directory === 'mathematik' || directory === 'physik') {
      assert.ok((childrenByParent.get(root.id) ?? []).every((id) =>
        allGoals.get(id)?.title.trim().toLocaleLowerCase('de') !== root.title.trim().toLocaleLowerCase('de')),
      `${viewName}: no duplicate subject heading may remain below the root.`)
    }

    const markup = renderToStaticMarkup(createElement(LanguageProvider, null, createElement(CompetenceTree, {
      rootGoals: [root], allGoals, getMastery: () => 0.5,
      plannedGoals: new Set<string>(), onTogglePlan: () => undefined,
      onSelect: () => undefined, selectedId: root.id, audience: 'learner', structureMode: 'content',
      expandedGoalIds: new Set([root.id]), onToggleExpanded: () => undefined,
      visibleChildrenByParentOverride: childrenByParent, useRawGoalTitles: true,
    })))
    const exactSubjectLabels = markup.match(new RegExp(`>${root.title}<`, 'gu')) ?? []
    assert.equal(exactSubjectLabels.length, 1, `${viewName}: render the subject heading exactly once.`)
  }
}

const genericSubjectRoot: UiGoal = {
  ...mathRootGoal!, id: 'subject-root', landscapeId: 'generic-subject', title: 'Werkstoffkunde',
  contains: ['subject-alias', 'extra-target', 'real-cluster', 'subject-alias'], tags: ['root'],
}
const genericSubjectAlias: UiGoal = {
  ...genericSubjectRoot, id: 'subject-alias', title: '  WERKSTOFFKUNDE ', tags: ['synthetic:program-unit'],
  contains: ['first-target', 'hidden-target', 'second-target'],
  extendedData: { syntheticStructureKind: 'compositionView' },
}
const genericRealCluster: UiGoal = {
  ...genericSubjectRoot, id: 'real-cluster', tags: [], contains: ['real-target'],
}
const genericSubjectGoals = new Map([
  genericSubjectRoot, genericSubjectAlias, genericRealCluster,
  ...['first-target', 'second-target', 'hidden-target', 'extra-target', 'real-target'].map((id, index): UiGoal => ({
    ...genericSubjectRoot, id, title: id, tags: [], contains: [], type: 'atomic', weight: index + 1,
  })),
].map((goal) => [goal.id, goal] as const))
const genericSubjectChildren = buildDirectChildrenMap(genericSubjectGoals)
// This target was already excluded by the authored projection/filter.
genericSubjectChildren.set('subject-alias', ['first-target', 'second-target'])
const genericCollapsed = collapseLearnerSubjectRoots(genericSubjectGoals, genericSubjectChildren)
assert.deepStrictEqual(genericCollapsed.childrenByParent.get('subject-root'), [
  'first-target', 'second-target', 'extra-target', 'real-cluster',
], 'A generic subject alias must lift filtered children in order, retain extra targets and deduplicate IDs.')
assert.deepStrictEqual(genericCollapsed.childrenBySubjectRootAlias.get('subject-alias'), ['first-target', 'second-target'])
assert.deepStrictEqual(genericCollapsed.childrenByParent.get('real-cluster'), ['real-target'],
  'A genuinely authored same-name subject cluster must not be flattened.')
assert.deepStrictEqual(
  renderedAtomicProgress('subject-root', genericSubjectGoals, genericCollapsed.childrenByParent),
  renderedAtomicProgress('subject-root', genericSubjectGoals, genericSubjectChildren),
)
for (const landscapeId of [undefined, 'another-subject']) {
  const ambiguousGoals = new Map(genericSubjectGoals)
  ambiguousGoals.set('subject-alias', { ...genericSubjectAlias, landscapeId })
  assert.equal(collapseLearnerSubjectRoots(ambiguousGoals, genericSubjectChildren).subjectRootIdByAlias.size, 0,
    'Missing or different subject identity must not cause a same-name node to disappear.')
}
const emptyAliasChildren = new Map(genericSubjectChildren)
emptyAliasChildren.set('subject-alias', [])
assert.equal(collapseLearnerSubjectRoots(genericSubjectGoals, emptyAliasChildren).subjectRootIdByAlias.size, 0,
  'A filtered-empty alias must not become an invented replacement branch.')

console.log('✅ Learner goal selection regression checks passed.')
