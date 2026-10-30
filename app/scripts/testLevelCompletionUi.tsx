import assert from 'node:assert/strict'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { LevelCompletionCard } from '../src/components/LevelCompletionCard'
import { requiresCompletionExitConfirmation, type LevelCompletion } from '../src/utils/levelCompletionApi'

const completed: LevelCompletion = {
  calculationStatus: 'valid', contextRef: 'context', profileId: 'profile', profileRevision: '1',
  curriculumGeneration: 'generation', learnerRevision: 4, title: { de: 'Skalarprodukt', en: 'Dot product' },
  complete: true, masteredTargetCount: 1, waivedTargetCount: 1, pendingTargetCount: 0, targetCount: 2,
  masteredAssessmentCount: 1, requiredAssessmentCount: 1, waivedTargetGoalIds: ['A'],
  assessments: [{ goalId: 'Q', title: { de: 'Prüfung', en: 'Assessment' }, mastered: true, startAvailable: false }],
  profileOptions: [], directAssessmentRunning: false, actions: [
    { action: 'pauseProfile', title: { de: 'Für heute beenden', en: 'Finish for today' } },
    { action: 'leaveProfile', title: { de: 'Zur regulären Lernansicht', en: 'Return to regular learning' } },
  ],
}
const render = (completion: LevelCompletion, extra: { stale?: boolean; language?: string; learningPlanPaused?: boolean } = {}) => renderToStaticMarkup(
  <MemoryRouter><LevelCompletionCard completion={completion} language="de" onAction={() => undefined} onRetry={() => undefined} {...extra} /></MemoryRouter>,
)
const done = render(completed, { learningPlanPaused: true })
assert.match(done, /Lernabschnitt abgeschlossen/u)
assert.match(done, /1 von 2 Lernzielen geschafft/u)
assert.match(done, /Vorbereitung für 1 Lernziel\./u)
assert.doesNotMatch(done, /2 von 2 Lernzielen geschafft/u)
assert.match(done, /Lernplan ist pausiert/u)
assert.match(done, /Für heute beenden/u)
assert.match(done, /aria-labelledby=/u)
assert.doesNotMatch(done, /type="range"|completionProfile=/u)
const explained = render({ ...completed, waiverDetails: [{ goalId: 'A', title: { de: 'Projektion veranschaulichen' },
  ruleId: 'internal-static-rule', assessments: [{ goalId: 'Q', title: { de: 'Projektion erklären' } }], assessmentCount: 1 }] })
assert.match(explained, /Warum entfällt diese Vorbereitung/u)
assert.match(explained, /Projektion veranschaulichen/u)
assert.match(explained, /Projektion erklären/u)
assert.doesNotMatch(explained, /internal-static-rule/u, 'the static reference does not become product jargon')

const open: LevelCompletion = {
  ...completed, complete: false, masteredTargetCount: 0, waivedTargetCount: 0, pendingTargetCount: 2,
  masteredAssessmentCount: 0, waivedTargetGoalIds: [],
  assessments: [{ goalId: 'Q', title: { de: 'Prüfung', en: 'Assessment' }, mastered: false, startAvailable: true }],
}
assert.match(render(open), /Prüfung direkt versuchen/u)
assert.match(render(open), /completionProfile=profile/u)
assert.match(render(open), /Noch nicht geschafft/u)
assert.doesNotMatch(render(open, { stale: true }), /href=.*completionProfile=/u)
assert.match(render({ ...open, calculationStatus: 'unresolved', complete: undefined, profileId: undefined,
  profileOptions: [{ profileId: 'profile', title: { de: 'Skalarprodukt' }, targetCount: 2, requiredAssessmentCount: 1 }] }),
  /2 Lernziele, davon 1 erforderliche Prüfung/u, 'the learner sees the scope before choosing the completion route')
assert.match(render(open, { stale: true }), /aria-disabled="true"/u)
assert.match(render(open, { language: 'en' }), /Not yet achieved/u)

const unavailable: LevelCompletion = { ...open, calculationStatus: 'unavailable', complete: undefined, notice: 'completion_mastery_unavailable' }
assert.match(render(unavailable), /kann gerade nicht berechnet werden/u)
assert.doesNotMatch(render(unavailable), /completion_mastery_unavailable|0 von 2/u)
assert.doesNotMatch(render({ ...unavailable, notice: 'backend-secret' }), /backend-secret/u)
assert.match(render({ ...open, assessments: [{ ...open.assessments[0], startAvailable: false, unavailableReason: 'assessment_task_unavailable' }] }), /kann gerade nicht gestartet werden/u)

const running = { ...open, directAssessmentRunning: true }
assert.equal(requiresCompletionExitConfirmation(running, { action: 'leaveProfile' }), true)
assert.equal(requiresCompletionExitConfirmation(running, { action: 'learnGoal', goalId: 'A' }), true)
assert.equal(requiresCompletionExitConfirmation(running, { action: 'endAssessment' }), false)
assert.equal(requiresCompletionExitConfirmation(open, { action: 'leaveProfile' }), false)
assert.doesNotMatch(render(running), /completionProfile=/u)
console.log('Level completion UI contract tests passed.')
