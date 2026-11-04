import type {
  PersonalizationDecisionSummary,
  PersonalizationOption,
  PersonalizationPlan,
} from './personalCurriculumEditorApi'
import {
  formatPersonalCurriculumSummary,
  getPersonalCurriculumSummaryItems,
  shouldCompactLoadedLearnerSetup,
  type CompactCompletedSetupState,
} from './sessionSetupCompletionPresentation'

const assert: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) throw new Error(message)
}

const option = (
  optionId: string,
  groupId: string,
  landscapeLabel: string | null,
  filterId: string | null = null,
  filterLabel: string | null = null,
): PersonalizationOption => ({
  optionId,
  stageId: groupId,
  groupId,
  groupInstanceId: `${groupId}:root`,
  landscapeId: landscapeLabel?.toLowerCase() ?? null,
  landscapeLabel,
  filterId,
  filterLabel,
  scopeKey: null,
  scopeValue: null,
  scopeLabel: null,
  kind: 'VALUE',
})

const decision = (
  groupId: string,
  selectedOptions: PersonalizationOption[],
): PersonalizationDecisionSummary => ({
  stageId: groupId,
  stageLabel: groupId,
  groupId,
  groupLabel: groupId,
  groupInstanceId: `${groupId}:root`,
  selectedOptions,
})

const completePlan: PersonalizationPlan = {
  stage: 'COMPLETE',
  stageId: null,
  stageLabel: null,
  groupId: null,
  groupLabel: null,
  groupInstanceId: null,
  minSelections: 0,
  maxSelections: 0,
  selectedCount: 0,
  options: [],
  displayOptions: [],
  navigationOptions: [],
  currentSelectedOptions: [],
  currentRewindId: null,
  completedDecisions: [
    {
      ...decision('jurisdiction', [
        option('all-states', 'jurisdiction', null, 'ALL', 'Kanonische DE-Sicht'),
      ]),
      rewindId: 'rewind-jurisdiction',
    },
    {
      ...decision('subject', [
        option('math', 'subject', 'Mathematik'),
        option('physics', 'subject', 'Physik'),
      ]),
      rewindId: 'rewind-subject',
    },
  ],
  preservedDecisions: [
    decision('stage', [{
      ...option('stage', 'stage', null),
      kind: 'SCOPE_VALUE',
      scopeKey: 'stage',
      scopeValue: 'CrossStage',
      scopeLabel: 'Sekundarstufe I und II',
    }]),
    decision('duplicate-subject', [
      option('math-again', 'duplicate-subject', 'Mathematik'),
      option('physics-again', 'duplicate-subject', 'Physik'),
    ]),
  ],
  pendingDecisions: [],
  canReopenMigratedPersonalization: false,
  problemCode: null,
}

const compactState: CompactCompletedSetupState = {
  idSource: 'existing',
  setupChangedInVisit: false,
  curriculumConfirmed: true,
  plan: completePlan,
  loading: false,
  busy: false,
  hasError: false,
}

assert(
  shouldCompactLoadedLearnerSetup(compactState),
  'an already complete existing learner setup starts compact',
)
assert(
  shouldCompactLoadedLearnerSetup({ ...compactState, idSource: 'file' }),
  'an already complete setup loaded from a protected file starts compact',
)
assert(
  !shouldCompactLoadedLearnerSetup({ ...compactState, idSource: 'generated' }),
  'a newly generated learner keeps the completion confirmation open',
)
assert(
  !shouldCompactLoadedLearnerSetup({ ...compactState, setupChangedInVisit: true }),
  'a setup completed or changed during this visit stays open',
)
assert(
  !shouldCompactLoadedLearnerSetup({
    ...compactState,
    plan: { ...completePlan, stage: 'SELECTION' },
  }),
  'an incomplete setup never collapses',
)
for (const blockedState of [
  { loading: true },
  { busy: true },
  { hasError: true },
  { curriculumConfirmed: false },
]) {
  assert(
    !shouldCompactLoadedLearnerSetup({ ...compactState, ...blockedState }),
    'loading, mutation, errors, and unconfirmed curricula keep setup visible',
  )
}

const germanSummaryItems = getPersonalCurriculumSummaryItems(completePlan, 'de')
assert(
  JSON.stringify(germanSummaryItems) === JSON.stringify([
    'Alle Bundesländer',
    'Mathematik',
    'Physik',
    'Sekundarstufe I und II',
  ]),
  'the compact summary flattens completed and preserved choices in order and removes duplicates',
)
const englishSummaryItems = getPersonalCurriculumSummaryItems(completePlan, 'en')
assert(
  englishSummaryItems[0] === 'All federal states',
  'the compact summary uses the existing localized option labels',
)
assert(
  formatPersonalCurriculumSummary(
    ['A', 'B', 'C', 'D', 'E'],
    (remaining) => remaining === 1 ? 'weitere Angabe' : 'weitere Angaben',
  ) === 'A · B · C · +2 weitere Angaben',
  'long summaries stay bounded and disclose the number of additional choices',
)
assert(
  formatPersonalCurriculumSummary(
    ['A', 'B', 'C', 'D'],
    (remaining) => remaining === 1 ? 'more choice' : 'more choices',
  ) === 'A · B · C · +1 more choice',
  'the remaining-choice label stays grammatical for a single hidden choice',
)
assert(
  getPersonalCurriculumSummaryItems({
    ...completePlan,
    completedDecisions: [],
    preservedDecisions: [],
  }, 'de').length === 0,
  'a complete curriculum without additional choices produces the dedicated empty summary',
)

console.log('session setup completion presentation tests passed')
