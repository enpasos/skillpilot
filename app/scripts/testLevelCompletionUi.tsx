import assert from 'node:assert/strict'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { LevelCompletionCard } from '../src/components/LevelCompletionCard'
import { requiresCompletionExitConfirmation, type LevelCompletion } from '../src/utils/levelCompletionApi'
import { TreeCompletionProgressBar } from '../src/components/TreeCompletionProgressBar'
import type { TreeCompletionProgress } from '../src/utils/treeCompletionProgress'
import { CompletionWaiverIcon } from '../src/components/CompletionWaiverIcon'
import { MapNode } from '../src/components/learningUnitMap/MapNode'
import type { LearningEntryProgress, LearningMapEntry } from '../src/components/learningUnitMap/types'
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
const render = (completion: LevelCompletion, extra: { stale?: boolean; language?: string; learningPlanPaused?: boolean; titleForGoal?: (id: string) => string | undefined } = {}) => renderToStaticMarkup(
  <MemoryRouter><LevelCompletionCard completion={completion} language="de" onAction={() => undefined} onRetry={() => undefined} {...extra} /></MemoryRouter>,
)
const done = render(completed, { learningPlanPaused: true })
assert.match(done, /Lernabschnitt abgeschlossen/u)
assert.match(done, /1 von 2 Lernzielen geschafft/u)
assert.match(done, /Für diesen Abschnitt ist 1 Lernziel nicht mehr erforderlich\./u)
assert.doesNotMatch(done, /2 von 2 Lernzielen geschafft/u)
assert.match(done, /Lernplan ist pausiert/u)
assert.doesNotMatch(done, /Für heute beenden/u, 'legacy actions never offer a button for leaving for today')
assert.match(done, /Zur regulären Lernansicht/u, 'the explicit route change stays available')
assert.match(done, /aria-labelledby=/u)
assert.doesNotMatch(done, /type="range"|completionProfile=/u)
const explained = render({ ...completed, waiverDetails: [{ goalId: 'A', title: { de: 'Projektion veranschaulichen' },
  ruleId: 'internal-static-rule', assessments: [{ goalId: 'Q', title: { de: 'Projektion erklären' } }], assessmentCount: 1 }] })
assert.match(explained, /Welche Nachweise zählen und welche Vorbereitung entfällt/u)
assert.match(explained, /Projektion veranschaulichen/u)
assert.match(explained, /Projektion erklären/u)
assert.doesNotMatch(explained, /internal-static-rule/u, 'the static reference does not become product jargon')
const creditOutsideUnit = { ...completed, profileId: 'automatic:personal-curriculum', planningCreditGoalIds: ['A'],
  waiverDetails: [{ goalId: 'A', title: { de: 'Modell wählen' }, ruleId: 'versioned_unit_assessment:r1',
    assessments: [{ goalId: 'Q', title: { de: 'Wurf modellieren' } }], assessmentCount: 1 }] }
assert.match(render(creditOutsideUnit), /Bestandene Prüfungen decken 1 Lernziel für deinen Lernplan ab/u)
const activeCredit = render({ ...creditOutsideUnit, navigationIntent: 'required' })
assert.match(activeCredit, /Wurf modellieren/u)
assert.match(activeCredit, /Dein Lernplan kann dieses Ziel als Voraussetzung nutzen/u)
assert.doesNotMatch(activeCredit, /Keine verbleibende Arbeit benötigt dieses Ziel/u)

assert.match(done, /Erforderliche Prüfungen: 1 von 1 geschafft/u)
assert.match(render(completed, { language: 'en' }), /Learning section completed\./u)
assert.match(render(completed, { language: 'en' }), /1 of 1 required assessment passed\./u)
assert.doesNotMatch(render(completed, { language: 'en' }), /Finish for today/u)
assert.match(render(completed, { language: 'en' }), /Return to regular learning/u)
for (const navigationIntent of ['required', 'paused'] as const) {
  for (const language of ['de', 'en']) {
    const legacy = render({ ...completed, navigationIntent }, { language })
    assert.doesNotMatch(legacy, /Für heute beenden|Finish for today/u,
      'old active and paused responses remain readable without the retired action')
    assert.match(legacy, language === 'de' ? /Lernabschnitt abgeschlossen/u : /Learning section completed/u)
  }
}

for (const [total, passed, complete, de, en] of [
  [0, 0, true, 'In diesem Abschnitt gibt es keine Prüfungen.', 'There are no assessments in this section.'],
  [1, 1, true, '1 von 1 Prüfung in diesem Abschnitt bestanden.', '1 of 1 assessment in this section passed.'],
  [5, 0, false, '0 von 5 Prüfungen in diesem Abschnitt bestanden.', '0 of 5 assessments in this section passed.'],
  [5, 5, false, '5 von 5 Prüfungen in diesem Abschnitt bestanden.', '5 of 5 assessments in this section passed.'],
] as const) {
  const pending = complete ? 0 : total - passed + 1
  const automatic: LevelCompletion = {
    ...completed, profileId: 'automatic:section', navigationIntent: 'required', complete,
    targetCount: passed + pending + 1, masteredTargetCount: passed, pendingTargetCount: pending,
    requiredAssessmentCount: total, masteredAssessmentCount: passed,
    assessments: Array.from({ length: total }, (_, index) => ({
      goalId: 'Q' + index, title: { de: 'Prüfung ' + index }, mastered: index < passed, startAvailable: index >= passed,
    })),
  }
  const german = render(automatic)
  const english = render(automatic, { language: 'en' })
  assert.ok(german.includes(de))
  assert.ok(english.includes(en))
  assert.equal(german.includes('Lernweg abgeschlossen.'), complete)
  assert.equal(english.includes('Learning route completed.'), complete)
  const overview = { ...automatic, navigationIntent: undefined }
  assert.equal(render(overview).includes('Lernabschnitt abgeschlossen.'), complete)
  assert.equal(render(overview, { language: 'en' }).includes('Learning section completed.'), complete)
  assert.doesNotMatch(render(overview, { stale: true }), /Lernabschnitt abgeschlossen/u)
}

const open: LevelCompletion = {
  ...completed, complete: false, masteredTargetCount: 0, waivedTargetCount: 0, pendingTargetCount: 2,
  masteredAssessmentCount: 0, waivedTargetGoalIds: [],
  assessments: [{ goalId: 'Q', title: { de: 'Prüfung', en: 'Assessment' }, mastered: false, startAvailable: true }],
}
const unitParts = ['A', 'B', 'C', 'D'].map(goalId => ({ goalId, title: { de: 'Teil ' + goalId, en: 'Part ' + goalId }, passed: goalId !== 'D' }))
const currentUnit: LevelCompletion = {
  ...open, profileId: 'automatic:math-sek-ii', navigationIntent: 'required',
  assessments: unitParts.map(part => ({ ...part, mastered: part.passed, startAvailable: !part.passed })),
  unitAssessment: { sectionGoalId: 'math-sek-ii', revision: 'reviewed', passed: false, parts: unitParts, planningCreditGoalIds: ['model'], individuallyOpenGoalIds: ['model', 'fall'] },
}
const unit = render(currentUnit, { titleForGoal: id => ({ model: 'Bewegung modellieren', fall: 'Freier Fall' })[id] })
assert.match(unit, /3 von 4 Teilen bestanden/u)
assert.equal((unit.match(/Beleg vorhanden/gu) ?? []).length, 3)
assert.equal((unit.match(/unit-assessment-direct-evidence/gu) ?? []).length, 3)
assert.equal((unit.match(/unit-assessment-credited-evidence/gu) ?? []).length, 1,
  'the individually open list never duplicates the check for the credited goal')
assert.equal((unit.match(/completionGoal=D/gu) ?? []).length, 1)
assert.match(unit, /Für deinen Lernplan angerechnet \(1\)/u)
assert.match(unit, /Einzeln noch nachzuweisen \(2\)/u)
assert.match(unit, /Bewegung modellieren/u)
assert.match(unit, /Freier Fall/u)
assert.doesNotMatch(render(currentUnit, { stale: true }), /completionGoal=/u)
const changedUnit = { ...currentUnit, unitAssessment: { ...currentUnit.unitAssessment!,
  parts: unitParts.map(part => ({ ...part, materialCurrent: part.passed })) } }
assert.match(render(changedUnit), /Diese Prüfungsfassung ist nicht verfügbar/u)
assert.doesNotMatch(render(changedUnit), /completionGoal=D/u)
const passedParts = unitParts.map(part => ({ ...part, passed: true }))
const otherExam = { goalId: 'Q5', title: { de: 'Waagerechter Wurf', en: 'Horizontal throw' }, voluntary: true, mastered: false, startAvailable: true }
const unitPassed = { ...currentUnit, targetCount: 5, masteredTargetCount: 4, pendingTargetCount: 1,
  requiredAssessmentCount: 4, masteredAssessmentCount: 4,
  assessments: [...passedParts.map(part => ({ goalId: part.goalId, title: part.title, mastered: true, startAvailable: false })), otherExam],
  unitAssessment: { ...currentUnit.unitAssessment!, passed: true, parts: passedParts } }
const englishUnit = render(unitPassed, { language: 'en' })
assert.match(englishUnit, /Optional assessment<\/p>/u)
assert.match(englishUnit, /completionGoal=Q5/u)
assert.match(render(unitPassed), /Freiwillige Zusatzprüfung<\/p>/u)
assert.match(englishUnit, /Unit assessment passed/u)
assert.match(englishUnit, /4 of 4 parts passed/u)
assert.match(englishUnit, /Still awaiting individual evidence \(2\)/u)
assert.doesNotMatch(englishUnit, /Learning route completed/u)
const sectionPassed = { ...unitPassed, complete: true, targetCount: 4, pendingTargetCount: 0 }
assert.match(render(sectionPassed), /Lernweg abgeschlossen\./u,
  'a valid section completion stays visible alongside the independent unit result')
assert.match(render({ ...sectionPassed, navigationIntent: undefined }, { language: 'en' }),
  /Learning section completed\./u)
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
const automaticDiscovery = { ...discovery, profileOptions: [{ ...discovery.profileOptions[0], profileId: 'automatic:section' }] }
assert.match(render(automaticDiscovery), /2 Lernziele mit 1 Prüfung\./u)
assert.match(render(automaticDiscovery, { language: 'en' }), /2 learning goals with 1 assessment\./u)
const discoveryHtml = render(discovery)
assert.match(discoveryHtml, />Prüfungen<\/summary>/u)
assert.match(discoveryHtml, /completionProfile=profile/u, 'an unselected profile can offer its published direct assessment')
assert.doesNotMatch(discoveryHtml, /<details[^>]* open=/u, 'a disclosure does not expand without an explicit request')
assert.doesNotMatch(render(discovery, { stale: true }), /href=.*completionProfile=/u)
assert.match(render(discovery, { language: 'en' }), />Assessments<\/summary>/u)
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
  totalCount: 3, explicitCount: 1, implicitCount: 2, notRequiredCount: 0, openCount: 0,
  totalWeight: 3, explicitWeight: 1, implicitWeight: 2, notRequiredWeight: 0, openWeight: 0,
  explicitRatio: 1 / 3, implicitRatio: 2 / 3,
}
const renderProgress = (progress: TreeCompletionProgress, language: 'de' | 'en' = 'de') => renderToStaticMarkup(
  <TreeCompletionProgressBar progress={progress} title="Lineare Gleichungen" language={language}
    sectionTitle={{ de: 'Sekundarstufe I', en: 'Lower secondary' }} />,
)
const treeHtml = renderProgress(treeProgress)
assert.match(treeHtml, /3 von 3 Lernzielen mit Nachweis/u)
assert.match(treeHtml, /1 direkt nachgewiesen\. 2 fachlich angerechnet\. 0 für diesen Abschnitt nicht mehr erforderlich\. 0 offen/u)
assert.match(treeHtml, /Gewichteter Anteil mit Nachweis: 100 %/u)
assert.match(treeHtml, /Geltungsbereich: Sekundarstufe I/u)
assert.match(treeHtml, /<button[^>]*type="button"[^>]*aria-label=/u)
assert.doesNotMatch(treeHtml, /100% Mastery|role="progressbar"/u)
const englishTreeHtml = renderProgress(treeProgress, 'en')
assert.match(englishTreeHtml, /3 of 3 learning goals with evidence/u)
assert.match(englishTreeHtml, /1 directly demonstrated\. 2 credited through assessment\. 0 no longer required for this section\. 0 open/u)
assert.match(englishTreeHtml, /Weighted share with evidence: 100%/u)
const weightedTreeHtml = renderProgress({
  totalCount: 2, explicitCount: 1, implicitCount: 0, notRequiredCount: 0, openCount: 1,
  totalWeight: 4, explicitWeight: 3, implicitWeight: 0, notRequiredWeight: 0, openWeight: 1,
  explicitRatio: 0.75, implicitRatio: 0,
})
assert.match(weightedTreeHtml, /1 von 2 Lernzielen mit Nachweis/u)
assert.match(weightedTreeHtml, /Gewichteter Anteil mit Nachweis: 75 %/u)
assert.doesNotMatch(weightedTreeHtml, /Geltungsbereich/u)
assert.match(renderProgress({
  totalCount: 2, explicitCount: 1, implicitCount: 0, notRequiredCount: 0, openCount: 1,
  totalWeight: 100000, explicitWeight: 99999, implicitWeight: 0, notRequiredWeight: 0, openWeight: 1,
  explicitRatio: 0.99999, implicitRatio: 0,
}), /Gewichteter Anteil mit Nachweis: 99,9 %/u, 'A small open weight must not be announced as fully completed')
const waivedProgress = renderProgress({ totalCount: 2, explicitCount: 1, implicitCount: 0, notRequiredCount: 1, openCount: 0,
  totalWeight: 2, explicitWeight: 1, implicitWeight: 0, notRequiredWeight: 1, openWeight: 0, explicitRatio: 0.5, implicitRatio: 0 })
assert.match(waivedProgress, /1 von 2 Lernzielen mit Nachweis/u)
assert.match(waivedProgress, /Gewichteter Anteil mit Nachweis: 50 %/u)
assert.match(waivedProgress, /completion-tree-progress-implicit[^>]*width:0%/u)
const emptyTreeHtml = renderProgress({
  totalCount: 0, explicitCount: 0, implicitCount: 0, notRequiredCount: 0, openCount: 0,
  totalWeight: 0, explicitWeight: 0, implicitWeight: 0, notRequiredWeight: 0, openWeight: 0,
  explicitRatio: 0, implicitRatio: 0,
})
assert.match(emptyTreeHtml, /Keine Lernziele in dieser Ansicht/u)
assert.doesNotMatch(emptyTreeHtml, /100 %|NaN|Infinity/u)

const learningEntry: LearningMapEntry = { id: 'goal', title: 'Ziel', description: '', kind: 'goal', requires: [], position: { x: 0, y: 0 } }
const renderMapRow = (progress: LearningEntryProgress, childCount = 0) => renderToStaticMarkup(
  <MapNode id={learningEntry.id} type="learningUnit" data={{ entry: learningEntry, language: 'de', childCount, progress,
    outsideCount: 0, ports: [], active: false, related: false, muted: false, onSelect() {}, onOpen() {} }}
    zIndex={0} dragging={false} selected={false} selectable={false} draggable={false} deletable={false}
    isConnectable={false} positionAbsoluteX={0} positionAbsoluteY={0} />,
)
const directRow = renderMapRow({ total: 1, explicit: 1, implicit: 0 })
assert.match(directRow, /learning-map-direct-evidence/u)
assert.match(directRow, /aria-description="Direkt nachgewiesen"/u)
const creditedRow = renderMapRow({ total: 1, explicit: 0, implicit: 1 })
assert.match(creditedRow, /learning-map-credited-evidence/u)
assert.match(creditedRow, /aria-description="Fachlich angerechnet"/u)
for (const row of [directRow, creditedRow]) {
  assert.match(row, /class="lucide lucide-check"/u)
  assert.match(row, /stroke-width="3"/u)
}
const neutralRow = renderMapRow({ total: 1, explicit: 0, implicit: 0, notRequired: 1 })
assert.match(neutralRow, /learning-map-not-required/u)
assert.match(neutralRow, /aria-description="Für diesen Abschnitt nicht mehr erforderlich"/u)
assert.doesNotMatch(neutralRow, /lucide-(?:shield-)?check|learning-map-(?:credited|direct)-evidence/u)
const openRow = renderMapRow({ total: 1, explicit: 0, implicit: 0, notRequired: 0 })
assert.match(openRow, /aria-description="Noch offen"/u)
assert.doesNotMatch(openRow, /learning-map-(?:credited-evidence|direct-evidence|not-required)/u)
const clusterRow = renderMapRow({ total: 17, explicit: 4, implicit: 2, notRequired: 3, sectionTitle: 'E.1' }, 17)
assert.match(clusterRow, /6\/17 mit Nachweis/u)
assert.match(clusterRow, /aria-description="4 direkt nachgewiesen, 2 fachlich angerechnet, 3 für diesen Abschnitt nicht mehr erforderlich, 8 offen\. Geltungsbereich: E\.1"/u)
assert.doesNotMatch(clusterRow, /learning-map-(?:credited|direct)-evidence/u, 'a cluster reports descendant results without assigning itself proof')
for (const reason of ['assessment', 'no_remaining_demand', 'preparation_waived'] as const) {
  const html = renderToStaticMarkup(<CompletionWaiverIcon waiver={{ reason, sectionTitle: { de: 'Physik' }, assessments: [] }} language="de" />)
  assert.ok(!html.includes('lucide-shield-check'))
  assert.equal(html.includes('lucide-check'), reason === 'assessment')
  assert.equal(html.includes('completion-tree-not-required'), reason !== 'assessment')
}

const savedStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
try {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => 'de' } })
  const atom: UiGoal = {
    id: 'atom', title: 'Lernziel', description: '', phase: 'GLOBAL', themenfeld: '', area: '', level: 1,
    core: true, weight: 1, leitideen: [], kompetenzen: [], sourceRef: '', requires: [], contains: [], examples: [],
  }
  const cluster: UiGoal = { ...atom, id: 'cluster', title: 'Abschnitt', contains: ['atom'], type: 'cluster' }
  const passingAtom = renderToStaticMarkup(<LanguageProvider><CompetenceTree
    rootGoals={[atom]} allGoals={new Map([[atom.id, atom]])} getMastery={() => 0.9}
    plannedGoals={new Set()} onTogglePlan={() => undefined} onSelect={() => undefined} selectedId="" audience="learner"
  /></LanguageProvider>)
  assert.match(passingAtom, /class="mr-1 text-emerald-[^"]*"[^>]*><svg[^>]*data-testid="completion-tree-direct-evidence"/u,
    'The learner sees a green check from the actual passing threshold onwards')
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
