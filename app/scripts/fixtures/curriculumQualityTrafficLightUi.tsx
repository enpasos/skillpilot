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
    <div data-testid="quality-legend"><QualityLegend language={language} /></div>
    <div data-testid="quality-statuses">{curriculumQualityStatuses.map((status) =>
      <QualityStatusBadge key={status} status={status} language={language} />)}</div>
  </>
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')
createRoot(rootElement).render(<MemoryRouter><LanguageProvider><ThemeProvider><StrictMode><Fixture /></StrictMode></ThemeProvider></LanguageProvider></MemoryRouter>)
