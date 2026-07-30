import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PersonalCurriculumEditor } from '../src/components/PersonalCurriculumEditor'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import type { PersonalizationPlan } from '../src/utils/personalCurriculumEditorApi'

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
  navigationOptions: [],
  pendingDecisions: [],
  problemCode: null,
}

const renderEditor = (language: 'de' | 'en') => {
  localStorageStub.setItem('skillpilot_lang', language)
  return renderToStaticMarkup(
    createElement(
      LanguageProvider,
      null,
      createElement(PersonalCurriculumEditor, {
        plan,
        loading: false,
        error: null,
        applyOption: () => undefined,
        restart: () => undefined,
        reload: () => undefined,
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

console.log('personal curriculum editor label render tests passed')
