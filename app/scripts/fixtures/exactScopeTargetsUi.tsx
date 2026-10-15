/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../../src/contexts/LanguageContext'
import { useAppCore } from '../../src/hooks/useAppCore'
import { CANONICAL_GYMNASIUM_ROOT_ID as rootId } from '../../src/utils/curriculumDisplay'
import { LearnerView } from '../../src/views/LearnerView'

const ignore = () => undefined
const Fixture = () => {
  const core = useAppCore({ role: 'learner', skillpilotId: 'exact-scope-fixture', setLearnerMeta: ignore })
  if (core.loadingLandscapes) return <div>Loading selected scope</div>
  if (core.landscapeError) return <div>{core.landscapeError.message}</div>
  return <div data-testid="scope-tree"><LearnerView
    rootGoals={core.breadcrumbRootGoals} goalIndexAll={core.goalIndexAll} getMastery={core.getMasteryValue}
    currentGoal={core.currentGoal} onSelectGoal={ignore} skillpilotId="exact-scope-fixture"
    landscapeId={core.selectedLandscapeId} rootLandscapeId={rootId} activeFilter={core.activeFilter}
    currentLandscapeHasMatchedCompositionView={core.currentLandscapeHasMatchedCompositionView}
    compositionTargetGoalIdsByLandscapeId={core.compositionTargetGoalIdsByLandscapeId}
    availableLandscapes={core.landscapeEntries.map(entry => entry.meta)}
  /></div>
}
createRoot(document.getElementById('root')!).render(<React.Fragment><LanguageProvider>
  <MemoryRouter initialEntries={[`/learner?l=${rootId}`]}><Fixture /></MemoryRouter>
</LanguageProvider></React.Fragment>)
