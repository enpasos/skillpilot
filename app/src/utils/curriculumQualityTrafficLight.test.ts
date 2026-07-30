import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  CurriculumDropdown,
  type LandscapeSummary,
} from '../components/CurriculumDropdown'
import { LanguageProvider } from '../contexts/LanguageContext'
import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import {
  CANONICAL_GYMNASIUM_MATH_ID,
  CANONICAL_GYMNASIUM_PHYSICS_ID,
  buildGymnasiumSubjectQualityRows,
  filterCurriculaByQuality,
  getCurriculumQualityStatus,
  getGymnasiumSubjectQualityStatus,
  matchesCurriculumQualityFilter,
  type CurriculumQualityStatus,
} from './curriculumQualityTrafficLight'

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

const assertEqual = <T>(actual: T, expected: T, message: string) => {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`)
  }
}

const assertCurriculumStatus = (
  curriculumId: string,
  maturity: string | null,
  expected: CurriculumQualityStatus,
  message: string,
) => assertEqual(getCurriculumQualityStatus(curriculumId, maturity), expected, message)

assertCurriculumStatus(
  CANONICAL_GYMNASIUM_ROOT_ID,
  null,
  'green',
  'the canonical Gymnasium root is always green',
)
assertCurriculumStatus(
  CANONICAL_GYMNASIUM_MATH_ID,
  'M5',
  'green',
  'canonical Gymnasium mathematics is always green',
)
assertCurriculumStatus(
  CANONICAL_GYMNASIUM_PHYSICS_ID,
  'M7',
  'green',
  'canonical Gymnasium physics is always green',
)
assertCurriculumStatus(
  'other-m6-curriculum',
  'M6',
  'orange',
  'other M6 curricula are orange',
)
assertCurriculumStatus(
  'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
  null,
  'orange',
  'the current manual list keeps canonical chemistry orange without runtime QA data',
)
assertCurriculumStatus(
  'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
  'M5',
  'red',
  'explicit current maturity overrides the manual fallback list',
)
assertCurriculumStatus(
  'other-m7-curriculum',
  'M7',
  'red',
  'other maturity levels remain red despite a higher numerical maturity',
)
assertCurriculumStatus(
  'curriculum-without-quality-data',
  null,
  'red',
  'curricula without an explicit manual classification fallback to red',
)

assertEqual(
  getGymnasiumSubjectQualityStatus('Mathematik', 'M5'),
  'green',
  'the mathematics subject row is green',
)
assertEqual(
  getGymnasiumSubjectQualityStatus('Physics', 'M7'),
  'green',
  'the English physics subject row is green',
)
assertEqual(
  getGymnasiumSubjectQualityStatus('Chemie', 'M6'),
  'orange',
  'other M6 subject rows are orange',
)
assertEqual(
  getGymnasiumSubjectQualityStatus('Chemie', null),
  'orange',
  'the manual subject fallback remains available without a repository QA snapshot',
)
assertEqual(
  getGymnasiumSubjectQualityStatus('Chemie', 'M5'),
  'red',
  'explicit subject maturity overrides the manual fallback list',
)
assertEqual(
  getGymnasiumSubjectQualityStatus('Geschichte', 'M5'),
  'red',
  'other subject rows below M6 are red',
)

assertEqual(
  matchesCurriculumQualityFilter('green', 'green'),
  true,
  'a status matches its own filter',
)
assertEqual(
  matchesCurriculumQualityFilter('orange', 'green'),
  false,
  'a status does not match a different filter',
)
assertEqual(
  matchesCurriculumQualityFilter('red', 'all'),
  true,
  'the all filter includes every status',
)

const curriculumCandidates = [
  { curriculumId: CANONICAL_GYMNASIUM_ROOT_ID },
  { curriculumId: 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0' },
  { curriculumId: 'red-curriculum' },
]
assertEqual(
  filterCurriculaByQuality(curriculumCandidates, 'green')
    .map((candidate) => candidate.curriculumId)
    .join(','),
  CANONICAL_GYMNASIUM_ROOT_ID,
  'the default green filter keeps only manually green curricula',
)
assertEqual(
  filterCurriculaByQuality(
    curriculumCandidates,
    'green',
    'red-curriculum',
  ).map((candidate) => candidate.curriculumId).join(','),
  `${CANONICAL_GYMNASIUM_ROOT_ID},red-curriculum`,
  'an existing non-green selection remains visible while the green filter is active',
)

const packageSubjects = [
  'Mathematik',
  'Physik',
  'Chemie',
  'Biologie',
  'Informatik',
  'Geschichte',
  'Deutsch',
  'Politik und Wirtschaft',
  'Englisch',
  'Französisch',
  'Latein',
  'Spanisch',
  'Italienisch',
  'Russisch',
  'Polnisch',
  'Tschechisch',
  'Griechisch',
  'Chinesisch',
  'Musik',
  'Wirtschaftswissenschaften',
]
const packageRows = buildGymnasiumSubjectQualityRows(
  packageSubjects,
  undefined,
  undefined,
  'de',
)
assertEqual(
  packageRows.length,
  20,
  'package mode keeps every Gymnasium subject row without a quality snapshot',
)
const packageStatusCounts = packageRows.reduce<Record<CurriculumQualityStatus, number>>(
  (counts, row) => {
    counts[getGymnasiumSubjectQualityStatus(row.subject, row.quality?.maturity)] += 1
    return counts
  },
  { green: 0, orange: 0, red: 0 },
)
assertEqual(
  JSON.stringify(packageStatusCounts),
  JSON.stringify({ green: 2, orange: 8, red: 10 }),
  'package mode applies the complete manual green, orange, and red subject projection',
)

const localizedQualityRows = buildGymnasiumSubjectQualityRows(
  ['Mathematik', 'Chemie'],
  ['Mathematics', 'Chemistry'],
  [{ subject: 'Chemie', maturity: 'M6' }],
  'en',
)
assertEqual(
  localizedQualityRows[0]?.subject,
  'Chemistry',
  'repository quality rows are localized by matching their subject instead of by sparse array position',
)

const landscape = (
  curriculumId: string,
  title: string,
): LandscapeSummary => ({
  curriculumId,
  filename: `${curriculumId}.json`,
  country: 'DE',
  region: 'DEU',
  type: 'Gymnasium',
  level: 'Sekundarstufe',
  subject: title,
  locale: 'de-DE',
  title,
})

storedValues.set('skillpilot_lang', 'de')
const dropdownMarkup = renderToStaticMarkup(
  createElement(
    LanguageProvider,
    null,
    createElement(CurriculumDropdown, {
      onSelect: () => undefined,
      showQualityFilter: true,
      landscapes: [
        landscape(CANONICAL_GYMNASIUM_ROOT_ID, 'Gymnasium (DE)'),
        landscape('c436b994-8f44-5134-b9f8-0c9f5d6a5ba0', 'Chemie'),
        landscape('red-curriculum', 'Ungeprüftes Fach'),
      ],
    }),
  ),
)
assertEqual(
  dropdownMarkup.includes('aria-pressed="true"')
    && dropdownMarkup.includes('Menschliche QS')
    && dropdownMarkup.includes('bg-emerald-700 text-white'),
  true,
  'the rendered curriculum dropdown starts with the green traffic-light filter active',
)
assertEqual(
  dropdownMarkup.includes(`value="${CANONICAL_GYMNASIUM_ROOT_ID}"`),
  true,
  'the rendered default filter includes a green curriculum',
)
assertEqual(
  dropdownMarkup.includes('value="c436b994-8f44-5134-b9f8-0c9f5d6a5ba0"')
    || dropdownMarkup.includes('value="red-curriculum"'),
  false,
  'the rendered default filter excludes orange and red curricula',
)
assertEqual(
  dropdownMarkup.includes('Empfohlene Curricula'),
  false,
  'ordinary curricula render without a recommended group heading',
)

console.log('curriculum quality traffic light tests passed')
