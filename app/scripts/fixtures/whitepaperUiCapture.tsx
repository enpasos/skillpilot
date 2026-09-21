/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import { createRoot } from 'react-dom/client'

import '../../src/index.css'
import { GoalAdditionalMaterials } from '../../src/components/GoalAdditionalMaterials'
import { LearnerPlanTodayOverview } from '../../src/components/LearnerPlanTodayOverview'
import { MaterialSelectionPanel } from '../../src/components/MaterialSelectionPanel'
import { LanguageProvider, useLanguage } from '../../src/contexts/LanguageContext'
import { ThemeProvider } from '../../src/contexts/ThemeContext'
import type { LearnerLearningPlanSummary, LearnerPlanSubjectStatus } from '../../src/learnerLearningPlanTypes'
import { learnerPlanStatus } from './learnerPlanStatus'

const noAction = () => { /* Static capture: no learner state is read or written. */ }

const Capture = () => {
  const { language } = useLanguage()
  const de = language === 'de'
  const subjects: LearnerPlanSubjectStatus[] = [
    {
      subjectKey: 'mathematik', landscapeIds: ['math/sek-i'],
      subjectLabel: de ? 'Mathematik' : 'Mathematics', evaluable: true,
      // Same illustrative balance as the Whitepaper: 13 due, 9 achieved in total;
      // today 1 of 3 achieved, with a separate backlog of 2.
      periodText: de ? 'Tagesziel 1 von 3' : 'Daily target 1 of 3',
      planStatusText: de ? '2 Lernziele im Rückstand' : '2 learning goals behind',
      subjectLine: null, statusDirection: 'behind', current: true, canContinue: true,
    },
    {
      subjectKey: 'physik', landscapeIds: ['physics/sek-ii'],
      subjectLabel: de ? 'Physik' : 'Physics', evaluable: true,
      // 10 due, 11 achieved in total; today 2 of 2 achieved and 1 ahead.
      // Match UnifiedLearningPlanStatusFormatter's reached-target wording.
      periodText: de ? 'Tagesziel erreicht' : 'Daily target reached',
      planStatusText: de ? '1 Lernziel vorgearbeitet' : '1 learning goal ahead',
      subjectLine: null, statusDirection: 'ahead', current: false, canContinue: true,
    },
  ].map((subject) => ({
    ...subject,
    subjectLine: `${subject.subjectLabel}: ${subject.periodText} · ${subject.planStatusText}`,
  })) as LearnerPlanSubjectStatus[]
  const goals = {
    'math-goal-1': de ? 'Lineare Gleichungen lösen' : 'Solve linear equations',
    'physics-goal-1': de ? 'Gleichförmige Bewegung beschreiben' : 'Describe uniform motion',
  }
  const plans: LearnerLearningPlanSummary[] = subjects.map((subject, index) => ({
    planId: index === 0 ? 'math-plan' : 'physics-plan',
    revision: 4,
    landscapeId: subject.landscapeIds[0],
    planLabel: subject.subjectLabel,
    stale: false,
    period: { startDate: '2026-09-01', endDate: '2027-06-30' },
    currentBlock: {
      blockId: `${subject.subjectKey}-current`, kind: 'learning',
      title: de ? 'Aktueller Lernabschnitt' : 'Current learning block',
      startDate: '2026-09-01', endDate: '2026-09-30',
    },
    nextMilestone: null,
    buffer: { totalWorkdays: 5, remainingWorkdays: 5 },
    nextEligibleGoal: { goalId: index === 0 ? 'math-goal-1' : 'physics-goal-1' },
    continueReason: null,
    canContinue: true,
  }))
  const status = learnerPlanStatus('2026-09-21', [], {
    language,
    subjects,
    noticeText: null,
    statusText: subjects.map((subject) => subject.subjectLine).join('\n'),
    activeGoal: { title: goals['math-goal-1'], announcement: goals['math-goal-1'] },
  })
  const materials = new URLSearchParams(window.location.search).get('view') === 'materials'

  return (
    <main data-testid="whitepaper-capture" className="w-full bg-white p-4 text-text-primary">
      {materials ? (
        <>
          <MaterialSelectionPanel skillpilotId="whitepaper-demo" language={language} onSaved={noAction} />
          <GoalAdditionalMaterials
            skillpilotId="whitepaper-demo"
            goalId="ae67bcf1-f3ee-50d6-9a12-25a159dff659"
            language={language}
            refreshKey={0}
          />
        </>
      ) : (
        <LearnerPlanTodayOverview
          status={status}
          plans={plans}
          language={language}
          planModeEnabled
          subjectLabel={(landscapeId) => subjects.find((subject) => subject.landscapeIds.includes(landscapeId))?.subjectLabel ?? ''}
          goalLabel={(goalId) => goals[goalId as keyof typeof goals]}
          activeGoalId="math-goal-1"
          activeLandscapeId="math/sek-i"
          onContinue={noAction}
          onSwitch={noAction}
          onOpenSettings={noAction}
        />
      )}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <LanguageProvider><ThemeProvider><Capture /></ThemeProvider></LanguageProvider>,
)
