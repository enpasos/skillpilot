/* eslint-disable react-refresh/only-export-components */
import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { TrainerLearningPlanActivation } from '../../src/components/TrainerLearningPlanActivation'
import { TrainerLearningPlanPreview } from '../../src/components/TrainerLearningPlanPreview'
import type { LandscapeEntry } from '../../src/hooks/useLandscapes'
import type { ClassSession } from '../../src/trainerTypes'
import {
  createTeacherCoursePlan,
  deleteTeacherCoursePlans,
  reviseTeacherCoursePlan,
  saveTeacherCoursePlan,
} from '../../src/utils/localTeacherCoursePlan'
import { berlinDateKey } from '../../src/utils/learnerLearningPlanReadModel'
import { getTeacherCoursePlanStorageId } from '../../src/utils/teacherCoursePlanContext'
import '../../src/index.css'

const learnerId = '77777777-2222-4333-8444-555555555555'
const mathLandscapeId = 'trainer-activation-math'
const physicsLandscapeId = 'trainer-activation-physics'
const mathGoalId = 'trainer-activation-math-goal'
const physicsGoalId = 'trainer-activation-physics-goal'

const makeGoal = (landscapeId: string, id: string, title: string, root = false) => ({
  id,
  landscapeId,
  title,
  description: title,
  phase: 'GLOBAL',
  themenfeld: '',
  area: title,
  level: 1,
  core: true,
  weight: 1,
  tags: root ? ['root'] : [],
  leitideen: [],
  kompetenzen: [],
  sourceRef: '',
  requires: [],
  contains: root ? [`${id}-atomic`] : [],
  examples: [],
  competencyRefs: [],
  type: root ? 'cluster' : 'atomic',
  nodeKind: 'tutor',
})

const makeLandscape = (
  landscapeId: string,
  subject: string,
  goalId: string,
): LandscapeEntry => {
  const rootId = `${goalId}-root`
  const root = makeGoal(landscapeId, rootId, subject, true)
  root.contains = [goalId]
  return {
    meta: {
      landscapeId,
      locale: 'de-DE',
      subject,
      frameworkId: 'trainer-plan-activation-flat-test',
      title: subject,
      description: subject,
      filters: [],
      goals: [],
    },
    goals: [root, makeGoal(landscapeId, goalId, `${subject} Ziel`)],
  } as unknown as LandscapeEntry
}

const landscapeEntries = [
  makeLandscape(mathLandscapeId, 'Mathematik', mathGoalId),
  makeLandscape(physicsLandscapeId, 'Physik', physicsGoalId),
]

const classSession: ClassSession = {
  id: 'trainer-activation-class',
  name: 'Alex · Mathematik und Physik',
  landscapeId: mathLandscapeId,
  activeFilter: 'all',
  personalConfig: {
    [mathLandscapeId]: { selected: true },
    [physicsLandscapeId]: { selected: true },
  },
  students: [{ id: learnerId, name: 'Alex', accessMode: 'learner-id' }],
  source: 'existing-learner',
}

const seedPlan = (landscapeId: string, goalId: string) => {
  const subjectSession = landscapeId === classSession.landscapeId
    ? classSession
    : { ...classSession, landscapeId }
  const storageId = getTeacherCoursePlanStorageId(subjectSession)
  const asOf = berlinDateKey()
  const created = createTeacherCoursePlan({
    classId: storageId,
    createdOn: asOf,
    recordedAt: `${asOf}T08:00:00.000Z`,
    schoolYearLabel: landscapeId === mathLandscapeId ? 'Mathe-Plan' : 'Physik-Plan',
  })
  if (!created) throw new Error('could not create activation fixture plan')
  const revised = reviseTeacherCoursePlan(created, {
    changedOn: asOf,
    recordedAt: `${asOf}T08:01:00.000Z`,
    planningBaseline: {
      source: 'learner-planning-landscape-v1',
      curriculumId: landscapeId,
      landscapeId,
      scopeAtomicGoalIds: [goalId],
      openAtomicGoalIds: [goalId],
      totalAtomicGoalCount: 1,
      masteredAtomicGoalCount: 0,
      capturedAt: `${asOf}T08:00:30.000Z`,
    },
    blocks: [{
      id: `${landscapeId}-block`,
      kind: 'learning',
      goalId,
      startDate: asOf,
      endDate: asOf,
    }],
  })
  if (!revised || !saveTeacherCoursePlan(revised).ok) {
    throw new Error('could not save activation fixture plan')
  }
}

const physicsStorageId = getTeacherCoursePlanStorageId({
  ...classSession,
  landscapeId: physicsLandscapeId,
})
const runtimeCatalogState = { mode: 'repository' as const }

if (sessionStorage.getItem('trainer-activation-plans-seeded') !== '1') {
  sessionStorage.setItem('trainer-activation-plans-seeded', '1')
  seedPlan(mathLandscapeId, mathGoalId)
  seedPlan(physicsLandscapeId, physicsGoalId)
}

const Fixture = () => {
  const [selectedSubject, setSelectedSubject] = useState(mathLandscapeId)
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showPlanning, setShowPlanning] = useState(true)
  const [notification, setNotification] = useState('')
  return (
    <main className="min-h-screen bg-chat-bg p-6 text-text-primary">
      <p data-testid="selected-subject">{selectedSubject}</p>
      <span data-testid="activation-notification" data-message={notification} />
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={() => { setShowPlanning((value) => !value); setNotification('') }}>Planungsansicht verlassen</button>
        <button type="button" onClick={() => setHasUnsavedDraft((current) => !current)}>
          {hasUnsavedDraft ? 'Entwurf speichern' : 'Entwurf ändern'}
        </button>
        <button
          type="button"
          onClick={() => {
            const deleted = deleteTeacherCoursePlans({ exactPlanIds: [physicsStorageId] })
            if (!deleted.ok) throw new Error('could not remove local Physics plan')
            setRefreshToken((current) => current + 1)
          }}
        >
          Lokalen Physikplan löschen
        </button>
      </div>
      {showPlanning && <TrainerLearningPlanActivation
        classSession={classSession}
        learnerId={learnerId}
        landscapeEntries={landscapeEntries}
        runtimeCatalogState={runtimeCatalogState}
        language="de"
        refreshToken={refreshToken}
        hasUnsavedActiveDraft={hasUnsavedDraft}
        onSelectSubject={setSelectedSubject}
        onPreview={() => setShowPreview((value) => !value)}
        onNotify={(_kind, message) => setNotification(message)}
      />}
      {showPreview && <TrainerLearningPlanPreview
        classSession={classSession}
        learnerId={learnerId}
        landscapeEntries={landscapeEntries}
        runtimeCatalogState={runtimeCatalogState}
        language="de"
        refreshToken={refreshToken}
        hasUnsavedActiveDraft={hasUnsavedDraft}
        onSelectSubject={setSelectedSubject}
      />}
    </main>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('missing fixture root')
createRoot(rootElement).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
)
