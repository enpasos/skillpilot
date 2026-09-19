import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MaturityBadge, QualityLegend, QualityStatusBadge } from '../components/CurriculumQualityBadge'
import { CurriculumDeepQualityProgress } from '../components/CurriculumDeepQualityProgress'
import { CurriculumDropdown, type LandscapeSummary } from '../components/CurriculumDropdown'
import { LanguageProvider } from '../contexts/LanguageContext'
import {
  buildGymnasiumSubjectQualityRows, filterCurriculaByQuality, getCurriculumQualityStatus,
  getGymnasiumSubjectQualityStatus, matchesCurriculumQualityFilter,
} from './curriculumQualityTrafficLight'
import * as packageQuality from '../packageConsumer/curriculumQualityTrafficLight'
import {
  curriculumQualityStatuses, getCurriculumQualityCopy, maturityClass, maturityCopy, maturityOrder,
} from './curriculumQualityPresentation'

for (const qualityStatus of curriculumQualityStatuses) {
  assert.equal(getCurriculumQualityStatus({ qualityStatus }), qualityStatus)
  assert.equal(packageQuality.getCurriculumQualityStatus({ qualityStatus }), qualityStatus)
}
for (const value of [undefined, null, {}, { qualityStatus: 'green' }, { qualityStatus: 'invented' }]) {
  assert.equal(getCurriculumQualityStatus(value), null, 'missing or invalid evidence stays unknown')
}
// Neither a famous subject ID, an M7 milestone nor mastery proves a human trial.
const formerGreen = { curriculumId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', qualityMaturity: 'M7', qualityStatus: null }
assert.equal(getCurriculumQualityStatus(formerGreen), null)
assert.equal(getGymnasiumSubjectQualityStatus({ qualityStatus: 'machine_qa' }), 'machine_qa')
assert.equal(matchesCurriculumQualityFilter(null, 'all'), true)
assert.equal(matchesCurriculumQualityFilter(null, 'experimental'), false)
const candidates = [formerGreen, { curriculumId: 'machine', qualityStatus: 'machine_qa' as const }]
assert.deepEqual(filterCurriculaByQuality(candidates, 'all'), candidates)
assert.deepEqual(filterCurriculaByQuality(candidates, 'machine_qa'), [candidates[1]])
assert.deepEqual(filterCurriculaByQuality(candidates, 'machine_qa', formerGreen.curriculumId), candidates)
assert.deepEqual(packageQuality.filterCurriculaByQuality(candidates, 'machine_qa'), [candidates[1]])
const collection = { curriculumId: 'collection', qualityStatus: null, subjectQuality: [{ qualityStatus: 'machine_qa' as const }] }
assert.deepEqual(filterCurriculaByQuality([collection], 'machine_qa'), [collection], 'matching subjects keep an unselected collection discoverable')
assert.deepEqual(filterCurriculaByQuality([collection], 'human_trial_completed'), [])
assert.equal(getCurriculumQualityStatus(collection), null, 'child matches never upgrade the collection itself')
const unknownRows = buildGymnasiumSubjectQualityRows(['Mathematik', 'Physik'], undefined, undefined, 'de')
assert(unknownRows.every((row) => row.quality === null))
const translated = buildGymnasiumSubjectQualityRows(['Mathematik', 'Chemie'], ['Mathematics', 'Chemistry'],
  [{ subject: 'Chemie', maturity: 'M7', qualityStatus: 'machine_qa' as const }], 'en')
assert.equal(translated[0].subject, 'Chemistry')
assert.equal(getGymnasiumSubjectQualityStatus(translated[0].quality), 'machine_qa')

const luminance = (hex: string): number => {
  const values = hex.match(/[a-f\d]{2}/gi)!.map((part) => parseInt(part, 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2]
}
for (const theme of ['', 'dark:']) {
  const backgrounds = new Set<string>()
  for (const level of maturityOrder) {
    const color = (kind: string) => maturityClass[level].split(' ')
      .find((value) => value.startsWith(`${theme}${kind}-[#`))!.match(/#[a-f\d]{6}/i)![0]
    const bg = color('bg'); const fg = color('text')
    backgrounds.add(bg)
    const lighter = Math.max(luminance(bg), luminance(fg))
    const darker = Math.min(luminance(bg), luminance(fg))
    assert((lighter + 0.05) / (darker + 0.05) >= 4.5, `${level} ${theme || 'light'} normal text contrast`)
  }
  assert.equal(backgrounds.size, 8, 'all eight steps have distinct fixed styles in each theme')
}
for (const language of ['de', 'en'] as const) {
  const legend = renderToStaticMarkup(createElement(QualityLegend, { language }))
  for (const level of maturityOrder) {
    assert(legend.includes(`data-maturity="${level}"`))
    assert(renderToStaticMarkup(createElement(MaturityBadge, { level, language }))
      .includes(`aria-label="${maturityCopy[language].label} ${level}:`))
  }
  assert(!renderToStaticMarkup(createElement(MaturityBadge, { level: null, language })).includes('M0'))
  const route = renderToStaticMarkup(createElement(MaturityBadge, { level: 'M1', language, scope: 'route' }))
  assert(route.includes(maturityCopy[language].routeLabel) && !route.includes(maturityCopy[language].legend.M1), 'route stages do not claim curriculum source maturity')
  for (const status of curriculumQualityStatuses) {
    assert(renderToStaticMarkup(createElement(QualityStatusBadge, { status, language }))
      .includes(getCurriculumQualityCopy(language).statusLabels[status]))
  }
}
const progress = renderToStaticMarkup(createElement(CurriculumDeepQualityProgress, {
  language: 'de', metrics: { expectedGoals: 478, strictComplete: 472, remaining: 6 },
}))
assert(progress.includes('472 von 478'))
assert(!progress.includes('M7') && !progress.includes('%'), 'partial QA cannot advertise a milestone or rounded completion')
assert(!renderToStaticMarkup(createElement(CurriculumDeepQualityProgress, {
  language: 'de', metrics: { expectedGoals: 10, strictComplete: 12, remaining: 0 },
})).includes('12 von 10'))
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true, value: { getItem: () => 'de', setItem: () => undefined },
})
const landscapes: LandscapeSummary[] = candidates.map((candidate) => ({
  ...candidate, filename: 'fixture.json', country: 'DE', region: 'DE', type: 'Gymnasium',
  level: 'Sekundarstufe', subject: candidate.curriculumId, locale: 'de-DE', title: candidate.curriculumId,
}))
const markup = renderToStaticMarkup(createElement(LanguageProvider, { children:
  createElement(CurriculumDropdown, { onSelect: () => undefined, showQualityFilter: true, landscapes }),
}))
assert(markup.includes(`value="${formerGreen.curriculumId}"`) && markup.includes('value="machine"'),
  'default all includes unknown evidence without manufacturing a green rating')
assert(markup.includes('aria-pressed="true"') && markup.includes('>Alle</button>'))
console.log('curriculum quality presentation and projection tests passed')
