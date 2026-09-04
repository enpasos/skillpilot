import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CompetenceTree } from '../src/components/CompetenceTree'
import { LanguageProvider } from '../src/contexts/LanguageContext'
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
} from '../src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import {
  buildGoalContainsClosure,
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
const continueHandlerStart = learnerViewSource.indexOf('const handleContinueCurrentPlanGoal = useCallback')
const continueHandlerEnd = learnerViewSource.indexOf('\n  const handleSwitchLearningPlan = useCallback', continueHandlerStart)
assert.ok(continueHandlerStart >= 0 && continueHandlerEnd > continueHandlerStart)
const continueHandlerSource = learnerViewSource.slice(continueHandlerStart, continueHandlerEnd)
assert.match(
  continueHandlerSource,
  /focusLearnerGoalContent\(effectiveActiveGoalId\)[\s\S]*?navigateToLearnerLearningPlanGoal\(/u,
  'Continuing the current plan goal must reveal it before falling back to route navigation.',
)
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
  '\n  const handleContinueCurrentPlanGoal = useCallback',
  transitionApplyStart,
)
assert.ok(transitionApplyStart >= 0 && transitionApplyEnd > transitionApplyStart)
const transitionApplySource = learnerViewSource.slice(transitionApplyStart, transitionApplyEnd)
const transitionPlannedInvalidationIndex = transitionApplySource.indexOf(
  'invalidateLatestRequest(plannedGoalsRequestSequenceRef)',
)
const transitionEmbeddedStateApplyIndex = transitionApplySource.indexOf('applyLearnerStatePayload(')
assert.ok(
  transitionPlannedInvalidationIndex >= 0
    && transitionEmbeddedStateApplyIndex > transitionPlannedInvalidationIndex,
  'A learning-plan transition must invalidate an older planned-goals request before applying its authoritative state.',
)
const plannedGoalsSequence = { current: 0 }
const pendingPlannedGoalsRefresh = beginLatestRequest(plannedGoalsSequence)
invalidateLatestRequest(plannedGoalsSequence)
assert.equal(
  isLatestRequestForScope(
    plannedGoalsSequence,
    pendingPlannedGoalsRefresh,
    'learner-a|root-a',
    'learner-a|root-a',
  ),
  false,
  'An older planned-goals response must fail closed after a learning-plan transition in the same scope.',
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

const genericVisibleJ8StructureId = 'composition:de-de-gym-seki-math:structure:j8'
const genericJ8FractionsStructureId = 'composition:de-de-gym-seki-math:structure:j8-fractions'
const genericJ8ScopeGoalIds = buildGoalContainsClosure([canonicalMathJ8GoalId], mathGoalById)
const genericJ8ScopeMarkerGoalIds = buildRenderedScopeMarkerGoalIds(
  mathGoalById,
  mathChildrenByParent,
  genericJ8ScopeGoalIds,
  [canonicalMathJ8GoalId],
)

assert.deepStrictEqual(
  Array.from(genericJ8ScopeMarkerGoalIds),
  [genericVisibleJ8StructureId],
  'A hidden canonical J8 planned scope must mark the visible generic Sek-I Jahrgangsstufe 8 structure, not a partial child cluster.',
)
assert.ok(
  !genericJ8ScopeMarkerGoalIds.has(genericJ8FractionsStructureId),
  'A hidden canonical J8 planned scope must not collapse to the Bruchterme child cluster in the generic Sek-I view.',
)

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
      selectedId: genericVisibleJ8StructureId,
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
const bavariaVisibleJ8StructureId = 'composition:de-by-gym-math-gk:structure:gk-sek-i-j8'
const bavariaPlannedJ8ScopeGoalIds = buildGoalContainsClosure([canonicalMathJ8GoalId], bavariaMathGoalById)
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
assert.deepStrictEqual(
  Array.from(bavariaScopeMarkerGoalIds),
  [bavariaVisibleJ8StructureId],
  'A hidden canonical J8 planned scope must produce exactly one visible scope marker on Jahrgangsstufe 8.',
)
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

console.log('✅ Learner goal selection regression checks passed.')
