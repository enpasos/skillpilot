/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import '../../src/index.css'
import { CurriculumDropdown, type LandscapeSummary } from '../../src/components/CurriculumDropdown'
import { QualityLegend, QualityStatusBadge } from '../../src/components/CurriculumQualityBadge'
import { CurriculumQualityDashboardView } from '../../src/views/CurriculumQualityDashboardView'
import { LanguageProvider, useLanguage } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import { curriculumQualityStatuses, type CurriculumQualityFilter } from '../../src/utils/curriculumQualityPresentation'

const landscapes: LandscapeSummary[] = [...curriculumQualityStatuses, null].map((qualityStatus) => ({
  curriculumId: qualityStatus ?? 'unknown', qualityStatus,
  filename: 'fixture.json', country: 'DE', region: 'DE', type: 'GYMNASIUM',
  level: 'Sekundarstufe', subject: qualityStatus ?? 'unknown', locale: 'de-DE',
  title: qualityStatus ?? 'Unknown quality', schoolType: 'Gymnasium',
}))
landscapes.push({ ...landscapes[0], curriculumId: 'university', type: 'U', schoolType: 'U', title: 'University' })

const recoveryLandscapes: LandscapeSummary[] = [
  { ...landscapes[4], curriculumId: 'unknown' },
  { ...landscapes[4], curriculumId: 'unreviewed-school', title: 'School without QA' },
  {
    ...landscapes[4], curriculumId: 'subject-status', title: 'School with subject QA',
    subjectQuality: [{ qualityStatus: 'human_trial_in_progress' }],
  },
  {
    ...landscapes[1], curriculumId: 'university', type: 'U', schoolType: 'U', title: 'University',
  },
  {
    ...landscapes[3], curriculumId: 'hidden-compatible', title: 'Hidden compatibility school', compatibilityOnly: true,
  },
  {
    ...landscapes[1], curriculumId: 'hidden-legacy', title: 'Hidden legacy school', legacyHiddenByDefault: true,
  },
]

const RecoveryFixture = () => {
  const [qualityUnavailable, setQualityUnavailable] = useState(false)
  const [qualityFilter, setQualityFilter] = useState<CurriculumQualityFilter>('human_trial_in_progress')
  const [currentCurriculumId, setCurrentCurriculumId] = useState('unknown')
  // Another category and hidden views keep valid QA throughout; only the
  // visible category options may determine availability and filter matches.
  const currentLandscapes = qualityUnavailable ? recoveryLandscapes.map((landscape) => (
    landscape.curriculumId === 'university' || landscape.compatibilityOnly || landscape.legacyHiddenByDefault
      ? landscape : { ...landscape, qualityStatus: null, subjectQuality: [] }
  )) : recoveryLandscapes
  return <div data-testid="quality-recovery-fixture">
    <div data-testid="quality-recovery-dropdown">
      <CurriculumDropdown currentLandscapeId={currentCurriculumId} landscapes={currentLandscapes}
        onSelect={setCurrentCurriculumId} qualityFilter={qualityFilter}
        onQualityFilterChange={setQualityFilter} showCompatibilityViews={false} showQualityFilter />
    </div>
    <button type="button" onClick={() => setQualityUnavailable(true)}>Simulate QA outage</button>
    <button type="button" onClick={() => setQualityUnavailable(false)}>Restore QA data</button>
    <button type="button" onClick={() => setCurrentCurriculumId('')}>Clear selection</button>
    <output data-testid="quality-recovery-selection">{currentCurriculumId}</output>
  </div>
}

const Fixture = () => {
  const [currentCurriculumId, setCurrentCurriculumId] = useState('unknown')
  const [qualityFilter, setQualityFilter] = useState<CurriculumQualityFilter>('all')
  const [singleCurriculumId, setSingleCurriculumId] = useState('')
  const { language } = useLanguage()
  if (window.location.search.includes('dashboard')) return <CurriculumQualityDashboardView />
  return <>
    <div data-testid="quality-filter-fixture">
      <CurriculumDropdown currentLandscapeId={currentCurriculumId} landscapes={landscapes}
        onSelect={setCurrentCurriculumId} qualityFilter={qualityFilter}
        onQualityFilterChange={setQualityFilter} showCompatibilityViews={false} showQualityFilter />
      <output data-testid="quality-filter-selection">{currentCurriculumId}</output>
    </div>
    <div data-testid="single-curriculum-fixture">
      <CurriculumDropdown currentLandscapeId={singleCurriculumId} landscapes={landscapes.slice(0, 1)}
        onSelect={setSingleCurriculumId} qualityFilter="all" showCompatibilityViews={false} showQualityFilter />
      <output data-testid="single-curriculum-selection">{singleCurriculumId}</output>
    </div>
    <RecoveryFixture />
    <div data-testid="quality-legend"><QualityLegend language={language} /></div>
    <div data-testid="quality-statuses">{curriculumQualityStatuses.map((status) =>
      <QualityStatusBadge key={status} status={status} language={language} />)}</div>
  </>
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')
createRoot(rootElement).render(<MemoryRouter><LanguageProvider><ThemeProvider><StrictMode><Fixture /></StrictMode></ThemeProvider></LanguageProvider></MemoryRouter>)
