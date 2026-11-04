import type { PersonalizationOption } from './personalCurriculumEditorApi'
import { getPersonalizationOptionLabel } from './personalCurriculumOptionLabel'

function assertEqual(actual: string, expected: string, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected "${expected}", got "${actual}"`)
  }
}

const option = (
  overrides: Partial<PersonalizationOption>,
): PersonalizationOption => ({
  optionId: 'opaque-option',
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
  ...overrides,
})

assertEqual(
  getPersonalizationOptionLabel(option({}), 'de'),
  'Hessen',
  'German jurisdiction choices omit the base curriculum label',
)
assertEqual(
  getPersonalizationOptionLabel(option({}), 'en'),
  'Hesse',
  'English jurisdiction choices use the localized state label',
)
assertEqual(
  getPersonalizationOptionLabel(option({
    filterId: 'ALL',
    filterLabel: 'Kanonische DE-Sicht',
  }), 'de'),
  'Alle Bundesländer',
  'the aggregate German jurisdiction choice uses learner-facing wording',
)
assertEqual(
  getPersonalizationOptionLabel(option({
    filterId: 'ALL',
    filterLabel: 'Kanonische DE-Sicht',
  }), 'en'),
  'All federal states',
  'the aggregate English jurisdiction choice uses learner-facing wording',
)
assertEqual(
  getPersonalizationOptionLabel(option({
    stageId: 'subject',
    groupId: 'subject',
    landscapeLabel: 'Mathematik',
    filterId: 'LK',
    filterLabel: 'Leistungskurs',
  }), 'de'),
  'Mathematik – Leistungskurs',
  'non-jurisdiction filter choices keep their qualified label',
)
assertEqual(
  getPersonalizationOptionLabel(option({
    stageId: 'stage',
    groupId: 'stage',
    kind: 'SCOPE_VALUE',
    filterId: null,
    filterLabel: null,
    scopeKey: 'stage',
    scopeValue: 'SekII',
    scopeLabel: 'Sekundarstufe II',
  }), 'de'),
  'Sekundarstufe II',
  'scope-value labels remain unchanged',
)

console.log('personal curriculum option label tests passed')
