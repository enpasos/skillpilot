/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { useAppCore } from '../../src/hooks/useAppCore'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../../src/utils/curriculumDisplay'
import { CompetenceTree } from '../../src/components/CompetenceTree'
import { buildVisibleChildrenMap } from '../../src/utils/treeProjectionRuntime'
import { learnerCockpitGoalFeedbackReturnPath } from '../../src/utils/goalFeedbackReturnNavigation'

const ignoreMeta = () => undefined
let mounts = 0
const Ready = ({ titles }: { titles: string[] }) => {
  useEffect(() => { mounts += 1; document.documentElement.dataset.mounts = String(mounts) }, [])
  return <div data-testid="ready">{titles.join('|')}</div>
}

const Fixture = () => {
  const [learner, setLearner] = useState('learner-a')
  const [focusedId, setFocusedId] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const core = useAppCore({ role: 'learner', skillpilotId: learner, setLearnerMeta: ignoreMeta,
    enabled: location.pathname !== '/lernziel-feedback' })
  const hasProjection = core.landscapeEntries.some((entry) => entry.meta.personalCurriculumProjection)
  // The roots the Cockpit shows (LearnerView): roots of the selected landscape
  // that present goals, otherwise all presenting roots. A full-plan overview
  // lists its subjects without containing them, so their roots are shown.
  const selectedRootGoals = core.breadcrumbRootGoals.filter((goal) => goal.landscapeId === core.selectedLandscapeId)
  const cockpitRootGoals = selectedRootGoals.length > 0 ? selectedRootGoals : core.breadcrumbRootGoals
  const config = {
    [CANONICAL_GYMNASIUM_ROOT_ID]: { selected: true, filterId: 'DE-HE', stage: 'SekII' },
    'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0': { selected: true, filterId: 'GK', stage: 'SekII' },
    'foreign-subject': { selected: false, filterId: 'GK' },
  }
  return <>
    <button onClick={() => setLearner('learner-b')}>Andere Person</button>
    <button onClick={() => setLearner('learner-error')}>Fehlerfall</button>
    <button onClick={() => setLearner('learner-profile-error')}>Profilfehler</button>
    <button onClick={() => setLearner('learner-empty')}>Leerer Umfang</button>
    <button onClick={() => navigate(`/learner/math-a?l=${CANONICAL_GYMNASIUM_ROOT_ID}&panel=details`)}>Nur Navigation</button>
    <button onClick={() => core.handleNavigateToExternal('physics-fixture', 'physics-a')}>Physikplanziel</button>
    <button onClick={() => navigate('/lernziel-feedback')}>Feedback öffnen</button>
    <button onClick={() => navigate(learnerCockpitGoalFeedbackReturnPath({
      bookId: 'de-gym-mathematik-bundesweit', goalId: 'math-a', edition: 'curricular-atomic-v1',
      goalFingerprint: `sha256:${'a'.repeat(64)}`, pageFingerprint: `sha256:${'b'.repeat(64)}`,
      bookDigest: `sha256:${'c'.repeat(64)}`, page: '1',
    })!)}>Feedback zurück</button>
    <button onClick={() => core.handleNavigateToExternal('physics-fixture', 'not-loaded')}>Externes Ziel</button>
    <button onClick={() => core.handleNavigateToExternal('foreign-subject', 'foreign-required')}>Notwendige Fremdgrundlage</button>
    <button onClick={() => navigate('/learner?l=c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')}>Chemie einzeln</button>
    <output data-testid="route">{location.pathname}{location.search}</output>
    <output data-testid="source">{core.landscapeEntries.map((entry) => entry.meta.title).join('|')}</output>
    {core.loadingLandscapes ? <div data-testid="loading">Lernumfang wird geladen</div>
      : core.landscapeError ? <div data-testid="error">{core.landscapeError.message}</div>
        : core.goalIndexAll.size === 0 ? <div data-testid="empty">Kein Lernumfang</div>
          : <Ready titles={[...core.goalIndexAll.values()].map((goal) => goal.title)} />}
    {hasProjection && !core.loadingLandscapes && <div data-testid="projection-tree">
      <output data-testid="focused-goal">{focusedId}</output>
      <output data-testid="selected-goal">{selectedId}</output>
      <CompetenceTree rootGoals={cockpitRootGoals} allGoals={core.goalIndexAll} getMastery={() => 0}
        plannedGoals={new Set()} onTogglePlan={setFocusedId} onSelect={setSelectedId} selectedId={selectedId}
        audience="learner" allowClusterPlanning expandedGoalIds={new Set(core.goalIndexAll.keys())}
        onToggleExpanded={() => undefined} visibleChildrenByParentOverride={buildVisibleChildrenMap(
          core.goalIndexAll, 'GK,DE-HE', config, 'content', core.selectedLandscapeId,
        )} />
    </div>}
  </>
}

const initialRoute = new URLSearchParams(window.location.search).has('feedbackReload')
  ? '/lernziel-feedback'
  : `/learner?l=${CANONICAL_GYMNASIUM_ROOT_ID}`
createRoot(document.getElementById('root')!).render(
  <LanguageProvider><MemoryRouter initialEntries={[initialRoute]}><Fixture /></MemoryRouter></LanguageProvider>,
)
