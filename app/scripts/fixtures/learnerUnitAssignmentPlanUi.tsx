import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import { LearnerPlanManagement } from '../../src/components/LearnerPlanManagement'
import { LearnerUnitAssignment } from '../../src/components/LearnerUnitAssignment'
import { StoredUnitAssignments } from '../../src/components/StoredUnitAssignments'
import type { StoredUnitAssignment } from '../../src/learnerLearningPlanTypes'
import { getLearnerLearningPlan } from '../../src/utils/learnerLearningPlanApi'
import { berlinDateKey } from '../../src/utils/learnerLearningPlanReadModel'
import type { LevelCompletion, UnitAssessment } from '../../src/utils/levelCompletionApi'

const learnerId = 'assignment-plan-browser'
const assessment: UnitAssessment = {
  sectionGoalId: 'unit', revision: 'review1', passed: false, planningCreditGoalIds: [], individuallyOpenGoalIds: [],
  parts: [{ goalId: 'part-a', title: { de: 'Prüfung A' }, passed: false },
    { goalId: 'part-b', title: { de: 'Prüfung B' }, passed: false }],
}
const completion: LevelCompletion = {
  calculationStatus: 'valid', learnerRevision: 10, title: { de: 'Einheit' }, masteredTargetCount: 0,
  waivedTargetCount: 0, pendingTargetCount: 2, targetCount: 2, masteredAssessmentCount: 0, requiredAssessmentCount: 2,
  waivedTargetGoalIds: [], assessments: [], profileOptions: [], directAssessmentRunning: false, actions: [],
}

export function Fixture() {
  const [stored, setStored] = useState<StoredUnitAssignment[]>([])
  const [revision, setRevision] = useState(10)
  const refresh = async () => {
    const plan = await getLearnerLearningPlan(learnerId, 'physics', berlinDateKey())
    setStored(plan.blocks.flatMap(block => block.kind === 'learning' && block.unitAssignment ? [{
      planId: plan.planId, revision: plan.revision, landscapeId: plan.landscapeId, blockId: block.id,
      sectionGoalId: block.unitAssignment.sectionGoalId, title: block.title ?? null,
      active: block.active !== false, canReactivate: block.active === false,
    }] : []))
    setRevision(plan.revision)
  }
  return <main>
    <LearnerPlanManagement language="de">
      <LearnerUnitAssignment learnerId={learnerId} landscapeId="physics" assessment={assessment}
        completion={{ ...completion, learnerRevision: revision }} language="de" disabled={false}
        storedAssignments={stored} goalTitle={() => 'Mathematische Grundlage'} onSaved={refresh} />
      {stored.length > 0 && <StoredUnitAssignments learnerId={learnerId} assignments={stored} language="de"
        disabled={false} sectionTitle={() => 'Einheit'} subjectTitle={() => 'Physik'} onRefresh={refresh} />}
    </LearnerPlanManagement>
  </main>
}

createRoot(document.getElementById('root')!).render(<Fixture />)
