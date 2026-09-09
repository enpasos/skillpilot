/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { useAppCore } from '../../src/hooks/useAppCore'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../../src/utils/curriculumDisplay'

const ignoreMeta = () => undefined
let mounts = 0
const Ready = ({ titles }: { titles: string[] }) => {
  useEffect(() => { mounts += 1; document.documentElement.dataset.mounts = String(mounts) }, [])
  return <div data-testid="ready">{titles.join('|')}</div>
}

const Fixture = () => {
  const [learner, setLearner] = useState('learner-a')
  const navigate = useNavigate()
  const location = useLocation()
  const core = useAppCore({ role: 'learner', skillpilotId: learner, setLearnerMeta: ignoreMeta })
  return <>
    <button onClick={() => setLearner('learner-b')}>Andere Person</button>
    <button onClick={() => setLearner('learner-error')}>Fehlerfall</button>
    <button onClick={() => setLearner('learner-profile-error')}>Profilfehler</button>
    <button onClick={() => setLearner('learner-empty')}>Leerer Umfang</button>
    <button onClick={() => navigate(`/learner/math-a?l=${CANONICAL_GYMNASIUM_ROOT_ID}&panel=details`)}>Nur Navigation</button>
    <button onClick={() => core.handleNavigateToExternal('physics-fixture', 'physics-a')}>Physikplanziel</button>
    <button onClick={() => core.handleNavigateToExternal('physics-fixture', 'not-loaded')}>Externes Ziel</button>
    <output data-testid="route">{location.pathname}{location.search}</output>
    <output data-testid="source">{core.landscapeEntries.map((entry) => entry.meta.title).join('|')}</output>
    {core.loadingLandscapes ? <div data-testid="loading">Lernumfang wird geladen</div>
      : core.landscapeError ? <div data-testid="error">{core.landscapeError.message}</div>
        : core.goalIndexAll.size === 0 ? <div data-testid="empty">Kein Lernumfang</div>
          : <Ready titles={[...core.goalIndexAll.values()].map((goal) => goal.title)} />}
  </>
}

createRoot(document.getElementById('root')!).render(
  <LanguageProvider><MemoryRouter initialEntries={[`/learner?l=${CANONICAL_GYMNASIUM_ROOT_ID}`]}><Fixture /></MemoryRouter></LanguageProvider>,
)
