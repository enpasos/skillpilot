import { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, Compass, Image as ImageIcon, Info } from 'lucide-react'
import { LearningUnitMap } from '../src/components/learningUnitMap/LearningUnitMap'
import { CockpitAboutDialog, CockpitLearningView, CockpitPlanView, CockpitPreviewDialog, type CockpitPreview } from './CockpitPanels'
import { GoalImageDialog, type CockpitImagePreview } from './GoalImage'
import { buildCockpitCoachStart, cockpitDemoClock, cockpitMathData, cockpitScenarios, deriveCockpitState, exportLearningEntryProgress } from './cockpitMathData'
import 'katex/dist/katex.min.css'
import './cockpit.css'

const data = cockpitMathData
const targets = new Set(data.targetGoalIds)
const demoDate = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin',
}).format(new Date(cockpitDemoClock))
type CockpitView = 'learn' | 'map' | 'plan'
const views: { id: CockpitView; label: string }[] = [
  { id: 'learn', label: 'Lernen' }, { id: 'map', label: 'Lernkarte' }, { id: 'plan', label: 'Mein Plan' },
]

export function Cockpit() {
  const [view, setView] = useState<CockpitView>('learn')
  const [scenarioId, setScenarioId] = useState(cockpitScenarios[0].id)
  const [command, setCommand] = useState<{ entryId: string; nonce: number } | undefined>()
  const [preview, setPreview] = useState<CockpitPreview | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<CockpitImagePreview | null>(null)
  const commandSequence = useRef(0)
  const scenario = cockpitScenarios.find(entry => entry.id === scenarioId) ?? cockpitScenarios[0]
  const state = useMemo(() => deriveCockpitState(scenario.explicitGoalIds, scenario.events), [scenario])
  const progress = useMemo(() => exportLearningEntryProgress(state), [state])
  // A chart selection is deliberately never assigned to the active learning goal.
  const activeGoalId = state.unitComplete ? undefined : scenario.activeGoalId
  const activeGoal = activeGoalId ? data.goalById[activeGoalId] : null

  const chooseView = (next: CockpitView) => {
    setCommand(undefined)
    setView(next)
  }
  const showInMap = (entryId: string) => {
    setCommand({ entryId, nonce: ++commandSequence.current })
    setView('map')
  }
  const openPreview = (goalId: string) => {
    if (!targets.has(goalId)) return
    const goal = data.goalById[goalId]
    if (!goal) return
    const assessment = goalId === data.assessment.goalId
    setPreview({ goal, mode: assessment ? 'assessment' : 'goal', image: data.visualizationsByGoalId[goalId]?.image,
      ...(assessment ? { taskContent: data.assessment.taskContent, scoring: data.assessment.scoring } : {}) })
  }
  const ordinaryGoalId = data.targetGoalIds.find(id => id !== data.assessment.goalId)!
  const sourcePaths = [...new Set(Object.values(data.sourcePaths))]

  return <div className="cp-app" data-current-view={view}>
    <header className="cp-header">
      <span className="cp-brand"><Compass size={23} strokeWidth={1.7} /><strong>SkillPilot</strong></span>
      <nav className="cp-view-nav" aria-label="Cockpitansichten">{views.map(entry => <button key={entry.id}
        type="button" data-testid={'cockpit-tab-' + entry.id} aria-current={view === entry.id ? 'page' : undefined}
        onClick={() => chooseView(entry.id)}>{entry.label}</button>)}</nav>
      <div className="cp-scenario-bar cp-scenario-picker"><label htmlFor="cockpit-scenario">Testprofil</label>
        <select id="cockpit-scenario" data-testid="cockpit-scenario" aria-label="Lokalen Testlernstand wählen"
          title={scenario.description + '\nBeispieldatum: ' + demoDate} aria-describedby="cockpit-scenario-note"
          value={scenario.id} onChange={event => {
            setScenarioId(event.target.value)
            setCommand(undefined)
            setPreview(null)
            setImagePreview(null)
          }}>{cockpitScenarios.map(entry => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select>
        <span id="cockpit-scenario-note" className="cp-sr-only" role="status">{scenario.description} Beispieldatum: {demoDate}</span>
      </div>
      <div className="cp-header-tools">
        <span className="cp-local-badge" title="Lokaler Prototyp mit vorgegebenen Testlernständen">Prototyp</span>
        <button type="button" className="cp-about-button" title="Quellen und Grenzen des Prototyps" onClick={() => setAboutOpen(true)}
          aria-label="Quellen und Grenzen des Prototyps"><Info size={16} /></button>
      </div>
    </header>
    <div className="cp-view-stack">
      <section className="cp-view cp-view--learning" data-testid="cockpit-view-learn" aria-label="Lernen"
        hidden={view !== 'learn'} inert={view !== 'learn'}>
        <CockpitLearningView activeGoal={activeGoal} unitComplete={state.unitComplete}
          activeImage={activeGoalId ? data.visualizationsByGoalId[activeGoalId]?.image : null}
          assessmentGoalId={data.assessment.goalId} onOpenImage={setImagePreview}
          onShowActive={() => { if (activeGoalId) showInMap(activeGoalId) }}
          onContinue={() => openPreview(activeGoalId ?? ordinaryGoalId)} onExam={() => openPreview(data.assessment.goalId)} />
      </section>
      <section className="cp-view cp-view--map cp-map" data-testid="cockpit-view-map" aria-label="Lernkarte"
        hidden={view !== 'map'} inert={view !== 'map'}>
        <LearningUnitMap key={scenario.id} fixture={data.fixture} embedded initialScopeId={data.unitId}
          active={view === 'map'} headingMode="context" rootLabel="Mathematik"
          learnerProgress={progress} activeGoalId={activeGoalId} command={command}
          renderSelectionActions={id => {
            if (id === data.cards.goalId) return <div className="cp-selection-actions">
              <button type="button" title="Externer Kontext, keine Recall-Prüfung"
                onClick={() => setPreview({ mode: 'cards', goal: data.goalById[id], cards: data.cards.cards })}>
                Lernkarten ansehen (Kontext) <ArrowUpRight size={12} />
              </button></div>
            if (!targets.has(id)) return null
            const assessment = id === data.assessment.goalId
            const image = data.visualizationsByGoalId[id]?.image
            return <div className="cp-selection-actions">
              <button type="button" onClick={() => openPreview(id)}>
                {assessment ? 'Prüfung ansehen' : 'Ziel ansehen'} <ArrowUpRight size={12} />
              </button>
              {image && <button type="button" className="cp-icon-button" data-testid="cockpit-selected-image-action"
                title="Lernzielbild anzeigen" aria-label={'Lernzielbild zu „' + data.goalById[id].title + '“ anzeigen'}
                onClick={() => setImagePreview({ goalId: id, goalTitle: data.goalById[id].title, image })}><ImageIcon size={16} /></button>}
            </div>
          }} />
      </section>
      <section className="cp-view cp-view--plan" data-testid="cockpit-view-plan" aria-label="Mein Plan"
        hidden={view !== 'plan'} inert={view !== 'plan'}>
        <CockpitPlanView unitTitle={data.unitTitle} goals={data.targetGoalIds.map(id => data.goalById[id])}
          progress={state.progress} todayExplicit={state.todayExplicit} weekExplicit={state.weekExplicit} demoDate={demoDate}
          explicitGoalIds={state.explicitGoalIds} implicitGoalIds={state.implicitGoalIds} activeGoalId={activeGoalId}
          onShowUnit={() => showInMap(data.unitId)} onPreview={openPreview} />
      </section>
    </div>
    <CockpitPreviewDialog preview={preview} coachStartText={buildCockpitCoachStart(preview && targets.has(preview.goal.id) ? preview.goal.id : ordinaryGoalId)}
      onOpenImage={setImagePreview} onClose={() => setPreview(null)} />
    <CockpitAboutDialog open={aboutOpen} notice={data.notice} sourcePaths={sourcePaths} demoDate={demoDate} onClose={() => setAboutOpen(false)} />
    <GoalImageDialog preview={imagePreview} onClose={() => setImagePreview(null)} />
  </div>
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing cockpit prototype root')
createRoot(root).render(<Cockpit />)
