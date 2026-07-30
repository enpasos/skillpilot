import {
  applyPersonalizationOption,
  buildPersonalCurriculumEditorEndpoint,
  parsePersonalizationPlan,
  reopenMigratedPersonalization,
  requestPersonalizationPlan,
  rewindPersonalization,
  restartPersonalization,
} from './personalCurriculumEditorApi'
import {
  beginLatestRequest,
  invalidateLatestRequest,
  isLatestRequest,
  isLatestRequestForScope,
} from './latestRequestSequence'
import {
  ABI26_DURATION_MODEL,
  isAbi26PersonalizationInitialized,
  markAbi26PersonalizationInitialized,
  resolveAbi26PersonalizationOption,
  resolveAbi26PersonalizationRepairAction,
} from './abi26MatheCampaign'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const assertEqual = <T>(actual: T, expected: T, message: string) => {
  assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, got ${String(actual)}`)
}

const assertRejects = async (operation: () => Promise<unknown>, messagePart: string) => {
  try {
    await operation()
  } catch (error) {
    assert(error instanceof Error, 'rejection must be an Error')
    assert(error.message.includes(messagePart), `expected "${error.message}" to include "${messagePart}"`)
    return
  }
  throw new Error(`expected rejection containing "${messagePart}"`)
}

const option = {
  optionId: 'opaque-option-1',
  stageId: 'stage-scope',
  groupId: 'group-stage',
  groupInstanceId: 'group-stage:root',
  landscapeId: 'root',
  landscapeLabel: 'Gymnasium',
  filterId: null,
  filterLabel: null,
  scopeKey: 'stage',
  scopeValue: 'SekII',
  scopeLabel: 'Sekundarstufe II',
  kind: 'SCOPE_VALUE',
}

const selectionPlan = {
  stage: 'SELECTION',
  stageId: 'stage-scope',
  stageLabel: 'Lernumfang',
  groupId: 'group-stage',
  groupLabel: 'Welche Stufe?',
  groupInstanceId: 'group-stage:root',
  minSelections: 1,
  maxSelections: 1,
  selectedCount: 0,
  options: [option],
  displayOptions: [
    option,
    {
      ...option,
      optionId: 'opaque-unavailable-option',
      landscapeId: 'physics',
      landscapeLabel: 'Physik',
    },
  ],
  navigationOptions: [option],
  currentSelectedOptions: [],
  currentRewindId: 'opaque-current-rewind',
  completedDecisions: [{
    rewindId: 'opaque-rewind-1',
    stageId: 'jurisdiction',
    stageLabel: 'Bundesland auswählen',
    groupId: 'jurisdiction',
    groupLabel: 'Welches Bundesland soll gelten?',
    groupInstanceId: 'jurisdiction:root',
    selectedOptions: [{
      ...option,
      optionId: 'opaque-jurisdiction-option',
      stageId: 'jurisdiction',
      groupId: 'jurisdiction',
      groupInstanceId: 'jurisdiction:root',
      scopeKey: null,
      scopeValue: null,
      scopeLabel: null,
      filterId: 'DE-HE',
      filterLabel: 'Hessen',
      kind: 'VALUE',
    }],
  }],
  preservedDecisions: [],
  pendingDecisions: [{
    stageLabel: 'Lernumfang',
    groupLabel: 'Welche Stufe?',
  }],
  canReopenMigratedPersonalization: false,
  problemCode: null,
}

const parsed = parsePersonalizationPlan(selectionPlan)
assertEqual(parsed.stage, 'SELECTION', 'parses the stage')
assertEqual(parsed.options[0]?.optionId, 'opaque-option-1', 'preserves the opaque option ID')
assertEqual(
  parsed.displayOptions[1]?.optionId,
  'opaque-unavailable-option',
  'parses display-only authored candidates separately from actions',
)
assertEqual(parsed.options[0]?.scopeValue, 'SekII', 'parses an authored scope value')
assertEqual(
  parsed.completedDecisions[0]?.rewindId,
  'opaque-rewind-1',
  'preserves the opaque rewind reference',
)
assertEqual(
  parsed.currentRewindId,
  'opaque-current-rewind',
  'preserves the opaque reference for resetting a partial current selection',
)
assertEqual(
  parsed.completedDecisions[0]?.selectedOptions[0]?.filterId,
  'DE-HE',
  'parses only the selected values in completed history',
)
const legacySelectionPlan = { ...selectionPlan } as Record<string, unknown>
Reflect.deleteProperty(legacySelectionPlan, 'displayOptions')
assertEqual(
  parsePersonalizationPlan(legacySelectionPlan).displayOptions.length,
  selectionPlan.options.length,
  'older plan responses fall back to their current action options',
)

const campaignPlan = parsePersonalizationPlan({
  ...selectionPlan,
  minSelections: 0,
  options: [{
    ...option,
    optionId: 'finish-current-group',
    kind: 'COMPLETE_GROUP',
  }, {
    ...option,
    optionId: 'select-g9',
    scopeKey: 'durationModel',
    scopeValue: ABI26_DURATION_MODEL,
  }],
})
assertEqual(
  resolveAbi26PersonalizationOption(campaignPlan, 'LK')?.optionId,
  'select-g9',
  'the campaign completes Level 2 semantically before using a group completion option',
)
assertEqual(
  resolveAbi26PersonalizationRepairAction(campaignPlan, 'LK', false, false).kind,
  'APPLY_OPTION',
  'the campaign repair uses an authored option while Level 2 is incomplete',
)
assertEqual(
  resolveAbi26PersonalizationRepairAction({
    ...campaignPlan,
    stage: 'COMPLETE',
    options: [],
  }, 'LK', false, false).kind,
  'RESTART',
  'a completed but mismatched campaign scope restarts the authored flow',
)
assertEqual(
  resolveAbi26PersonalizationRepairAction({
    ...campaignPlan,
    stage: 'COMPLETE',
    options: [],
  }, 'LK', true, true).kind,
  'COMPLETE',
  'a matching completed campaign scope needs no mutation',
)
assertEqual(
  resolveAbi26PersonalizationRepairAction({
    ...campaignPlan,
    stage: 'COMPLETE',
    options: [],
  }, 'LK', false, true).kind,
  'UNAVAILABLE',
  'a still-mismatched scope cannot loop through repeated restarts',
)

const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage',
)
const localStorageValues = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => localStorageValues.get(key) ?? null,
    setItem: (key: string, value: string) => {
      localStorageValues.set(key, value)
    },
  } as unknown as Storage,
})
assertEqual(
  isAbi26PersonalizationInitialized('campaign-learner', 'LK'),
  false,
  'campaign personalization is initially unmarked',
)
markAbi26PersonalizationInitialized('campaign-learner', 'LK')
assertEqual(
  isAbi26PersonalizationInitialized('campaign-learner', 'LK'),
  true,
  'completed campaign personalization is marked across page reloads',
)
assertEqual(
  isAbi26PersonalizationInitialized('campaign-learner', 'GK'),
  false,
  'the initialization marker remains course-profile specific',
)
if (originalLocalStorageDescriptor) {
  Object.defineProperty(
    globalThis,
    'localStorage',
    originalLocalStorageDescriptor,
  )
} else {
  Reflect.deleteProperty(globalThis, 'localStorage')
}

assertEqual(
  buildPersonalCurriculumEditorEndpoint(
    ' learner / 42 ',
    'personalization-plan',
    'https://api.example.test/',
  ),
  'https://api.example.test/api/ui/learners/learner%2F42/personalization-plan',
  'sanitizes and encodes the learner ID',
)

let capturedUrl = ''
let capturedInit: RequestInit | undefined
const planFetch: typeof fetch = async (input, init) => {
  capturedUrl = String(input)
  capturedInit = init
  return new Response(JSON.stringify(selectionPlan), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

await requestPersonalizationPlan('learner-42', {
  apiBase: 'https://api.example.test',
  fetchImpl: planFetch,
})
assertEqual(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/personalization-plan',
  'loads the current plan from the UI endpoint',
)
assertEqual(capturedInit?.credentials, 'include', 'sends learner credentials')
assertEqual(capturedInit?.method, undefined, 'uses GET for the plan')

await applyPersonalizationOption('learner-42', ' opaque-option-1 ', {
  apiBase: 'https://api.example.test',
  fetchImpl: planFetch,
})
assertEqual(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/personalization-options',
  'posts the opaque option to the mutation endpoint',
)
assertEqual(capturedInit?.method, 'POST', 'uses POST for an option')
assertEqual(
  capturedInit?.body,
  JSON.stringify({ optionId: ' opaque-option-1 ' }),
  'submits only the opaque option ID without rewriting it',
)

await restartPersonalization('learner-42', {
  apiBase: 'https://api.example.test',
  fetchImpl: planFetch,
})
assertEqual(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/personalization-restart',
  'uses the explicit restart endpoint',
)
assertEqual(capturedInit?.method, 'POST', 'uses POST for restart')
assertEqual(capturedInit?.body, undefined, 'restart carries no inferred curriculum payload')

await reopenMigratedPersonalization('learner-42', {
  apiBase: 'https://api.example.test',
  fetchImpl: planFetch,
})
assertEqual(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/personalization-reopen',
  'uses the preserving endpoint for a migrated flow',
)
assertEqual(capturedInit?.method, 'POST', 'uses POST for migrated reopen')
assertEqual(capturedInit?.body, undefined, 'migrated reopen carries no inferred curriculum payload')

await rewindPersonalization('learner-42', ' opaque-rewind-1 ', {
  apiBase: 'https://api.example.test',
  fetchImpl: planFetch,
})
assertEqual(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/personalization-rewind',
  'uses the targeted rewind endpoint',
)
assertEqual(capturedInit?.method, 'POST', 'uses POST for rewind')
assertEqual(
  capturedInit?.body,
  JSON.stringify({ rewindId: ' opaque-rewind-1 ' }),
  'submits only the opaque rewind reference without rewriting it',
)
await assertRejects(
  () => rewindPersonalization('learner-42', ' ', {
    fetchImpl: planFetch,
  }),
  'Missing personalization rewind reference',
)

await assertRejects(
  async () => parsePersonalizationPlan({
    ...selectionPlan,
    selectedCount: 2,
  }),
  'cardinality',
)

await assertRejects(
  () => requestPersonalizationPlan('learner-42', {
    fetchImpl: async () => new Response('stale option', { status: 409 }),
  }),
  'stale option',
)

const refreshSequence = { current: 0 }
const appliedRefreshes: string[] = []
let resolveFirstRefresh: ((value: string) => void) | undefined
let resolveSecondRefresh: ((value: string) => void) | undefined
const firstRefreshResponse = new Promise<string>((resolve) => {
  resolveFirstRefresh = resolve
})
const secondRefreshResponse = new Promise<string>((resolve) => {
  resolveSecondRefresh = resolve
})
const applyRefresh = async (response: Promise<string>) => {
  const requestId = beginLatestRequest(refreshSequence)
  const value = await response
  if (isLatestRequest(refreshSequence, requestId)) {
    appliedRefreshes.push(value)
  }
}
const firstRefresh = applyRefresh(firstRefreshResponse)
const secondRefresh = applyRefresh(secondRefreshResponse)
resolveSecondRefresh?.('newer')
await secondRefresh
resolveFirstRefresh?.('older')
await firstRefresh
assertEqual(
  appliedRefreshes.join(','),
  'newer',
  'a late older scope refresh cannot overwrite the latest response',
)
const completedRequest = refreshSequence.current
invalidateLatestRequest(refreshSequence)
assert(
  !isLatestRequest(refreshSequence, completedRequest),
  'changing the learner scope invalidates in-flight refreshes',
)

const scopedRefreshSequence = { current: 0 }
const scopedRequest = beginLatestRequest(scopedRefreshSequence)
assert(
  isLatestRequestForScope(
    scopedRefreshSequence,
    scopedRequest,
    'learner-a\u0000curriculum-a',
    'learner-a\u0000curriculum-a',
  ),
  'the latest response may update its original learner scope',
)
assert(
  !isLatestRequestForScope(
    scopedRefreshSequence,
    scopedRequest,
    'learner-b\u0000curriculum-b',
    'learner-a\u0000curriculum-a',
  ),
  'a response from an old learner scope is stale even before effect cleanup',
)

console.log('personal curriculum editor API tests passed')
