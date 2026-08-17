import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PersonalCurriculumEditor } from '../src/components/PersonalCurriculumEditor'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import { orderedFocusCandidatesAfterSelection } from '../src/utils/personalCurriculumEditorFocus'
import type { PersonalizationPlan } from '../src/utils/personalCurriculumEditorApi'
import {
  CANONICAL_GYMNASIUM_MATH_ID,
  CANONICAL_GYMNASIUM_PHYSICS_ID,
  type CurriculumQualityFilter,
} from '../src/utils/curriculumQualityTrafficLight'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const storedValues = new Map<string, string>()
const localStorageStub: Storage = {
  get length() {
    return storedValues.size
  },
  clear: () => storedValues.clear(),
  getItem: (key) => storedValues.get(key) ?? null,
  key: (index) => [...storedValues.keys()][index] ?? null,
  removeItem: (key) => {
    storedValues.delete(key)
  },
  setItem: (key, value) => {
    storedValues.set(key, String(value))
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageStub,
})

const plan: PersonalizationPlan = {
  stage: 'SELECTION',
  stageId: 'jurisdiction',
  stageLabel: 'Bundesland auswählen',
  groupId: 'jurisdiction',
  groupLabel: 'Welches Bundesland soll gelten?',
  groupInstanceId: 'jurisdiction:root',
  minSelections: 1,
  maxSelections: 1,
  selectedCount: 0,
  options: [
    {
      optionId: 'all-states',
      stageId: 'jurisdiction',
      groupId: 'jurisdiction',
      groupInstanceId: 'jurisdiction:root',
      landscapeId: 'root',
      landscapeLabel: 'Gymnasium (Deutschland)',
      filterId: 'ALL',
      filterLabel: 'Kanonische DE-Sicht',
      scopeKey: null,
      scopeValue: null,
      scopeLabel: null,
      kind: 'VALUE',
    },
    {
      optionId: 'hesse',
      stageId: 'jurisdiction',
      groupId: 'jurisdiction',
      groupInstanceId: 'jurisdiction:root',
      landscapeId: 'root',
      landscapeLabel: 'Gymnasium (Deutschland)',
      filterId: 'DE-HE',
      filterLabel: 'Hessen',
      scopeKey: null,
      scopeValue: null,
      scopeLabel: null,
      kind: 'VALUE',
    },
  ],
  displayOptions: [],
  navigationOptions: [],
  currentSelectedOptions: [],
  currentRewindId: 'rewind-current-jurisdiction',
  completedDecisions: [],
  preservedDecisions: [],
  pendingDecisions: [],
  canReopenMigratedPersonalization: false,
  problemCode: null,
}

const renderEditor = (
  language: 'de' | 'en',
  currentPlan: PersonalizationPlan = plan,
  qualityFilter?: CurriculumQualityFilter,
) => {
  localStorageStub.setItem('skillpilot_lang', language)
  return renderToStaticMarkup(
    createElement(
      LanguageProvider,
      null,
      createElement(PersonalCurriculumEditor, {
        plan: currentPlan,
        loading: false,
        error: null,
        applyOption: () => undefined,
        reopen: () => undefined,
        rewind: () => undefined,
        reload: () => undefined,
        qualityFilter,
      }),
    ),
  )
}

const germanEditor = renderEditor('de')
assert(
  germanEditor.includes('Alle Bundesländer')
    && germanEditor.includes('>Hessen<'),
  'German editor renders concise jurisdiction labels',
)
assert(
  !germanEditor.includes('Gymnasium (Deutschland)'),
  'German editor omits the redundant base curriculum prefix',
)
assert(
  !germanEditor.includes('Kanonische DE-Sicht'),
  'German editor omits technical canonical terminology',
)

const englishEditor = renderEditor('en')
assert(
  englishEditor.includes('All federal states')
    && englishEditor.includes('>Hesse<'),
  'English editor renders concise localized jurisdiction labels',
)
assert(
  !englishEditor.includes('Gymnasium (Deutschland)'),
  'English editor omits the redundant base curriculum prefix',
)
assert(
  JSON.stringify(orderedFocusCandidatesAfterSelection(plan.options, 'all-states'))
    === JSON.stringify(['hesse']),
  'selection focus advances to the next remaining option without returning to the top',
)
const jurisdictionWithRedQualityFilter = renderEditor('de', plan, 'red')
assert(
  jurisdictionWithRedQualityFilter.includes('Alle Bundesländer')
    && jurisdictionWithRedQualityFilter.includes('>Hessen<'),
  'the curriculum quality filter does not affect non-subject personalization steps',
)

const hesseOption = plan.options[1]
if (!hesseOption) throw new Error('missing Hesse fixture option')
const historyPlan: PersonalizationPlan = {
  ...plan,
  stageId: 'subject',
  stageLabel: 'Fach auswählen',
  groupId: 'subject',
  groupLabel: 'Welches Fach möchtest du lernen?',
  groupInstanceId: 'subject',
  maxSelections: 20,
  options: [{
    ...hesseOption,
    optionId: 'math',
    stageId: 'subject',
    groupId: 'subject',
    groupInstanceId: 'subject',
    landscapeId: 'math',
    landscapeLabel: 'Mathematik',
    filterId: null,
    filterLabel: null,
  }],
  navigationOptions: [hesseOption],
  completedDecisions: [{
    rewindId: 'rewind-jurisdiction',
    stageId: 'jurisdiction',
    stageLabel: 'Bundesland auswählen',
    groupId: 'jurisdiction',
    groupLabel: 'Welches Bundesland soll gelten?',
    groupInstanceId: 'jurisdiction:root',
    selectedOptions: [hesseOption],
  }],
}
const germanHistory = renderEditor('de', historyPlan)
assert(
  germanHistory.includes('Bisher ausgewählt')
    && germanHistory.includes('Bundesland auswählen')
    && germanHistory.includes('Hessen')
    && germanHistory.includes('Ändern'),
  'German editor shows the authoritative previous selection with a targeted change action',
)
assert(
  germanHistory.includes('Bundesland auswählen ändern, derzeit Hessen'),
  'targeted change action has a precise accessible name',
)

const mathOption = historyPlan.options[0]
if (!mathOption) throw new Error('missing subject fixture option')
const unavailablePhysics = {
  ...mathOption,
  optionId: 'physics',
  landscapeId: 'physics',
  landscapeLabel: 'Physik',
}
const subjectAvailability = renderEditor('de', {
  ...historyPlan,
  displayOptions: [mathOption, unavailablePhysics],
})
assert(
  subjectAvailability.includes('Mathematik')
    && subjectAvailability.includes('Physik')
    && subjectAvailability.includes('1 von 2 Optionen verfügbar')
    && subjectAvailability.includes('Für deine Auswahl noch nicht verfügbar'),
  'the subject step shows available and currently unavailable authored subjects',
)
assert(
  /<button[^>]*disabled=""[^>]*>[\s\S]*?Physik[\s\S]*?class="sr-only"/.test(subjectAvailability),
  'an unavailable subject is a native disabled option and cannot be submitted',
)

const qualitySubject = (
  optionId: string,
  landscapeId: string,
  landscapeLabel: string,
) => ({
  ...mathOption,
  optionId,
  landscapeId,
  landscapeLabel,
})
const humanQaOptions = [
  qualitySubject('math-quality', CANONICAL_GYMNASIUM_MATH_ID, 'Mathematik'),
  qualitySubject('physics-quality', CANONICAL_GYMNASIUM_PHYSICS_ID, 'Physik'),
  qualitySubject('chemistry-quality', 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0', 'Chemie'),
  qualitySubject('history-quality', '92406d94-e3c1-58ec-b7c6-12122278d25a', 'Geschichte'),
  qualitySubject('german-quality', '67bd301b-e11a-582d-94ba-4f4b1a4cefff', 'Deutsch'),
]
const humanQaSubjectSelection = renderEditor('de', {
  ...historyPlan,
  options: humanQaOptions,
  displayOptions: humanQaOptions,
}, 'green')
assert(
  humanQaSubjectSelection.includes('1 von 5 Optionen verfügbar')
    && humanQaSubjectSelection.includes('Wähle 1 Option.'),
  'the human-QA filter offers only physics in the subject step',
)
for (const subject of ['Physik']) {
  assert(
    new RegExp(`<button(?![^>]*disabled="")[^>]*>\\s*${subject}\\s*</button>`).test(
      humanQaSubjectSelection,
    ),
    `${subject} is enabled under the human-QA filter`,
  )
}
for (const subject of ['Mathematik', 'Chemie', 'Geschichte', 'Deutsch']) {
  assert(
    new RegExp(
      `<button[^>]*disabled=""[^>]*>\\s*${subject}\\s*<span class="sr-only">`,
    ).test(humanQaSubjectSelection),
    `${subject} remains visible but unavailable under the human-QA filter`,
  )
}
const experimentalSubjectSelection = renderEditor('de', {
  ...historyPlan,
  options: humanQaOptions,
  displayOptions: humanQaOptions,
}, 'red')
assert(
  experimentalSubjectSelection.includes('1 von 5 Optionen verfügbar')
    && experimentalSubjectSelection.includes('Wähle 1 Option.')
    && new RegExp('<button(?![^>]*disabled="")[^>]*>\\s*Mathematik\\s*</button>').test(
      experimentalSubjectSelection,
    ),
  'the experimental filter offers only mathematics in the subject step',
)
const emptyExperimentalOptions = humanQaOptions.filter(
  (option) => option.landscapeId !== CANONICAL_GYMNASIUM_MATH_ID,
)
const emptyExperimentalSubjectSelection = renderEditor('de', {
  ...historyPlan,
  options: emptyExperimentalOptions,
  displayOptions: emptyExperimentalOptions,
}, 'red')
assert(
  emptyExperimentalSubjectSelection.includes(
    'Für diesen Qualitätsfilter sind derzeit nicht genügend Fächer auswählbar.',
  )
    && emptyExperimentalSubjectSelection.includes('Wähle einen anderen Qualitätsfilter.')
    && !emptyExperimentalSubjectSelection.includes('Wähle zwischen 1 und 0 Optionen.'),
  'an empty subject quality filter has actionable guidance instead of an impossible range',
)

const completeHistoryPlan: PersonalizationPlan = {
  ...historyPlan,
  stage: 'COMPLETE',
  stageId: null,
  stageLabel: null,
  groupId: null,
  groupLabel: null,
  groupInstanceId: null,
  minSelections: 0,
  maxSelections: 0,
  options: [],
}
const completeHistory = renderEditor('de', completeHistoryPlan)
assert(
  completeHistory.includes('Bisher ausgewählt')
    && !completeHistory.includes('Alle Angaben neu wählen'),
  'completed guided setup keeps individual edit actions instead of forcing a full restart',
)

const migratedComplete = renderEditor('de', {
  ...completeHistoryPlan,
  navigationOptions: [],
  completedDecisions: [],
  preservedDecisions: [{
    stageId: 'jurisdiction',
    stageLabel: 'Bundesland auswählen',
    groupId: 'jurisdiction',
    groupLabel: 'Welches Bundesland soll gelten?',
    groupInstanceId: 'jurisdiction:root',
    selectedOptions: [{
      ...hesseOption,
      optionId: 'preserved-jurisdiction',
    }],
  }],
  canReopenMigratedPersonalization: true,
})
assert(
  migratedComplete.includes('Auswahl prüfen und ändern')
    && migratedComplete.includes('Aktuell ausgewählt')
    && migratedComplete.includes('Abhängige Angaben können nach einer Änderung erneut abgefragt werden.')
    && migratedComplete.includes('Hessen')
    && !migratedComplete.includes('Bleibt ausgewählt')
    && !migratedComplete.includes('Alle Angaben neu wählen'),
  'a migrated setup distinguishes saved choices from guaranteed preserved choices',
)

const partialCurrentSelection = renderEditor('de', {
  ...historyPlan,
  selectedCount: 1,
  currentSelectedOptions: [mathOption],
  currentRewindId: 'rewind-current-subject',
  options: [{
    ...mathOption,
    optionId: 'physics',
    landscapeId: 'physics',
    landscapeLabel: 'Physik',
  }],
})
assert(
  partialCurrentSelection.includes('In diesem Schritt ausgewählt')
    && partialCurrentSelection.includes('Mathematik')
    && partialCurrentSelection.includes('Auswahl dieses Schritts zurücksetzen'),
  'a partial multi-selection can be changed without restarting earlier decisions',
)

const preservedStage = renderEditor('de', {
  ...historyPlan,
  stageId: 'durationModel',
  stageLabel: 'Gymnasialdauer auswählen',
  groupId: 'durationModel',
  groupLabel: 'G8 oder G9?',
  groupInstanceId: 'durationModel:root',
  maxSelections: 1,
  completedDecisions: historyPlan.completedDecisions,
  preservedDecisions: [{
    stageId: 'stage',
    stageLabel: 'Lernumfang auswählen',
    groupId: 'stage',
    groupLabel: 'Welche Lernstufe?',
    groupInstanceId: 'stage:root',
    selectedOptions: [{
      ...hesseOption,
      optionId: 'preserved-stage',
      stageId: 'stage',
      groupId: 'stage',
      groupInstanceId: 'stage:root',
      filterId: null,
      filterLabel: null,
      scopeKey: 'stage',
      scopeValue: 'SekII',
      scopeLabel: 'Gymnasiale Oberstufe (Sekundarstufe II)',
      kind: 'SCOPE_VALUE',
    }],
  }],
})
assert(
  preservedStage.includes('Bleibt ausgewählt')
    && preservedStage.includes('Lernumfang auswählen')
    && preservedStage.includes('Gymnasiale Oberstufe (Sekundarstufe II)'),
  'an independent later choice remains visible while an earlier step is being changed',
)

console.log('personal curriculum editor label render tests passed')
