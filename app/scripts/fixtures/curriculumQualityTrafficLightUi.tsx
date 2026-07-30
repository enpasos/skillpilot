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
]

const Fixture = () => {
  const [currentCurriculumId, setCurrentCurriculumId] = useState(
    experimentalCurriculumId,
  )

  return (
    <LanguageProvider>
      <CurriculumDropdown
        currentLandscapeId={currentCurriculumId}
        landscapes={landscapes}
        onSelect={setCurrentCurriculumId}
        showCompatibilityViews={false}
        showQualityFilter
      />
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
