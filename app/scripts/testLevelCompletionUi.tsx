import assert from 'node:assert/strict'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { LevelCompletionCard } from '../src/components/LevelCompletionCard'
import { requiresCompletionExitConfirmation, type LevelCompletion } from '../src/utils/levelCompletionApi'
import { TreeCompletionProgressBar } from '../src/components/TreeCompletionProgressBar'
import type { TreeCompletionProgress } from '../src/utils/treeCompletionProgress'
import { CompetenceTree } from '../src/components/CompetenceTree'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import type { UiGoal } from '../src/goalTypes'

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
const discovery: LevelCompletion = { ...open, calculationStatus: 'notApplicable', complete: undefined, profileId: undefined,
  profileOptions: [{ profileId: 'profile', title: { de: 'Skalarprodukt', en: 'Dot product' }, targetCount: 2, requiredAssessmentCount: 1,
    assessments: [{ goalId: 'Q', title: { de: 'Prüfung', en: 'Assessment' }, mastered: false, startAvailable: true }] }] }
const discoveryHtml = render(discovery)
assert.match(discoveryHtml, /Prüfungsabkürzungen/u)
assert.match(discoveryHtml, /completionProfile=profile/u, 'an unselected profile can offer its published direct assessment')
assert.doesNotMatch(discoveryHtml, /<details[^>]* open=/u, 'ordinary discovery remains compact')
assert.doesNotMatch(render(discovery, { stale: true }), /href=.*completionProfile=/u)
assert.match(render(discovery, { language: 'en' }), /Assessment shortcuts/u)
const unavailableDiscovery = render({ ...discovery, calculationStatus: 'unavailable', notice: 'completion_mastery_unavailable' })
assert.match(unavailableDiscovery, /Dein Lernstand kann gerade nicht zuverlässig geladen werden/u)
assert.match(unavailableDiscovery, /<button[^>]*disabled=""[^>]*aria-label="Abschnitt als Lernweg wählen/u)
assert.match(unavailableDiscovery, /Neu laden/u)
assert.doesNotMatch(unavailableDiscovery, /completionProfile=/u)
assert.doesNotMatch(render({ ...discovery, profileOptions: [{ ...discovery.profileOptions[0],
  assessments: [{ ...discovery.profileOptions[0].assessments![0], mastered: true, startAvailable: false }] }] }), /completionProfile=/u)
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
const treeProgress: TreeCompletionProgress = {
  totalCount: 3, explicitCount: 1, implicitCount: 2, openCount: 0,
  totalWeight: 3, explicitWeight: 1, implicitWeight: 2, openWeight: 0,
  explicitRatio: 1 / 3, implicitRatio: 2 / 3,
}
const renderProgress = (progress: TreeCompletionProgress, language: 'de' | 'en' = 'de') => renderToStaticMarkup(
  <TreeCompletionProgressBar progress={progress} title="Lineare Gleichungen" language={language}
    sectionTitle={{ de: 'Sekundarstufe I', en: 'Lower secondary' }} />,
)
const treeHtml = renderProgress(treeProgress)
assert.match(treeHtml, /3 von 3 Lernzielen erledigt/u)
assert.match(treeHtml, /1 explizit geschafft\. 2 implizit erledigt\. 0 offen/u)
assert.match(treeHtml, /Gewichteter Fortschritt: 100 %/u)
assert.match(treeHtml, /Implizite Erledigung im Lernabschnitt: Sekundarstufe I/u)
assert.match(treeHtml, /<button[^>]*type="button"[^>]*aria-label=/u)
assert.doesNotMatch(treeHtml, /100% Mastery|role="progressbar"/u)
const englishTreeHtml = renderProgress(treeProgress, 'en')
assert.match(englishTreeHtml, /3 of 3 learning goals completed/u)
assert.match(englishTreeHtml, /1 explicitly achieved\. 2 implicitly completed\. 0 open/u)
assert.match(englishTreeHtml, /Weighted progress: 100%/u)
const weightedTreeHtml = renderProgress({
  totalCount: 2, explicitCount: 1, implicitCount: 0, openCount: 1,
  totalWeight: 4, explicitWeight: 3, implicitWeight: 0, openWeight: 1,
  explicitRatio: 0.75, implicitRatio: 0,
})
assert.match(weightedTreeHtml, /1 von 2 Lernzielen erledigt/u)
assert.match(weightedTreeHtml, /Gewichteter Fortschritt: 75 %/u)
assert.doesNotMatch(weightedTreeHtml, /Implizite Erledigung im Lernabschnitt/u)
assert.match(renderProgress({
  totalCount: 2, explicitCount: 1, implicitCount: 0, openCount: 1,
  totalWeight: 100000, explicitWeight: 99999, implicitWeight: 0, openWeight: 1,
  explicitRatio: 0.99999, implicitRatio: 0,
}), /Gewichteter Fortschritt: 99,9 %/u, 'A small open weight must not be announced as fully completed')
const emptyTreeHtml = renderProgress({
  totalCount: 0, explicitCount: 0, implicitCount: 0, openCount: 0,
  totalWeight: 0, explicitWeight: 0, implicitWeight: 0, openWeight: 0,
  explicitRatio: 0, implicitRatio: 0,
})
assert.match(emptyTreeHtml, /Keine Lernziele in dieser Ansicht/u)
assert.doesNotMatch(emptyTreeHtml, /100 %|NaN|Infinity/u)

const savedStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
try {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => 'de' } })
  const atom: UiGoal = {
    id: 'atom', title: 'Lernziel', description: '', phase: 'GLOBAL', themenfeld: '', area: '', level: 1,
    core: true, weight: 1, leitideen: [], kompetenzen: [], sourceRef: '', requires: [], contains: [], examples: [],
  }
  const cluster: UiGoal = { ...atom, id: 'cluster', title: 'Abschnitt', contains: ['atom'], type: 'cluster' }
  const trainerTree = renderToStaticMarkup(<LanguageProvider><CompetenceTree
    rootGoals={[cluster]} allGoals={new Map([[cluster.id, cluster], [atom.id, atom]])}
    getMastery={() => 0.5} plannedGoals={new Set()} onTogglePlan={() => undefined}
    onSelect={() => undefined} selectedId="" audience="trainer"
    completionWaivers={new Map([['atom', { reason: 'no_remaining_demand', sectionTitle: { de: 'Abschnitt' }, assessments: [] }]])}
  /></LanguageProvider>)
  assert.match(trainerTree, /width:50%/u, 'Trainer averages retain fractional progress')
  assert.doesNotMatch(trainerTree, /completion-tree-progress|completion-tree-waiver/u,
    'Learner completion overlays must never reinterpret trainer averages')
} finally {
  if (savedStorage) Object.defineProperty(globalThis, 'localStorage', savedStorage)
  else Reflect.deleteProperty(globalThis, 'localStorage')
}
console.log('Level completion UI contract tests passed.')
