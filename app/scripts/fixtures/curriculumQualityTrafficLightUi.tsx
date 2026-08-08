/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  CurriculumDropdown,
  type LandscapeSummary,
} from '../../src/components/CurriculumDropdown'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import {
  CANONICAL_GYMNASIUM_MATH_ID,
  CANONICAL_GYMNASIUM_PHYSICS_ID,
  type CurriculumQualityFilter,
} from '../../src/utils/curriculumQualityTrafficLight'

const chemistryCurriculumId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const experimentalCurriculumId = 'experimental-school-curriculum'

const landscapes: LandscapeSummary[] = [
  {
    curriculumId: CANONICAL_GYMNASIUM_MATH_ID,
    filename: 'mathematics.json',
    country: 'DE',
    region: 'DE',
    type: 'GYMNASIUM',
    level: 'Sekundarstufe',
    subject: 'Mathematik',
    locale: 'de-DE',
    title: 'Mathematik',
    schoolType: 'Gymnasium',
  },
  {
    curriculumId: chemistryCurriculumId,
    filename: 'chemistry.json',
    country: 'DE',
    region: 'DE',
    type: 'GYMNASIUM',
    level: 'Sekundarstufe',
    subject: 'Chemie',
    locale: 'de-DE',
    title: 'Chemie',
    schoolType: 'Gymnasium',
  },
  {
    curriculumId: experimentalCurriculumId,
    filename: 'experimental.json',
    country: 'DE',
    region: 'DE',
    type: 'GYMNASIUM',
    level: 'Sekundarstufe',
    subject: 'Experimentelles Fach',
    locale: 'de-DE',
    title: 'Experimentelles Fach',
    schoolType: 'Gymnasium',
  },
  {
    curriculumId: CANONICAL_GYMNASIUM_PHYSICS_ID,
    filename: 'university-physics.json',
    country: 'DE',
    region: 'DE',
    type: 'U',
    level: 'Hochschule',
    subject: 'Physik',
    locale: 'de-DE',
    title: 'Universitätsphysik',
    schoolType: 'U',
  },
]

const Fixture = () => {
  const [currentCurriculumId, setCurrentCurriculumId] = useState(
    experimentalCurriculumId,
  )
  const [qualityFilter, setQualityFilter] =
    useState<CurriculumQualityFilter>('green')
  const [currentCurriculumTitle, setCurrentCurriculumTitle] = useState('')
  const [singleCurriculumId, setSingleCurriculumId] = useState('')

  return (
    <LanguageProvider>
      <div data-testid="quality-filter-fixture">
        <CurriculumDropdown
          currentLandscapeId={currentCurriculumId}
          landscapes={landscapes}
          onSelect={setCurrentCurriculumId}
          onSelectedTitleChange={setCurrentCurriculumTitle}
          qualityFilter={qualityFilter}
          onQualityFilterChange={setQualityFilter}
          showCompatibilityViews={false}
          showQualityFilter
        />
        <output data-testid="quality-filter-selection">
          {currentCurriculumId}
        </output>
        <output data-testid="quality-filter-selection-title">
          {currentCurriculumTitle}
        </output>
      </div>
      <div data-testid="single-curriculum-fixture">
        <CurriculumDropdown
          currentLandscapeId={singleCurriculumId}
          landscapes={landscapes.slice(0, 1)}
          onSelect={setSingleCurriculumId}
          showCompatibilityViews={false}
          showQualityFilter
        />
        <output data-testid="single-curriculum-selection">
          {singleCurriculumId}
        </output>
      </div>
    </LanguageProvider>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('missing fixture root')
}

createRoot(rootElement).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
)
