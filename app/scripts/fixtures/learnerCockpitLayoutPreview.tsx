/* eslint-disable react-refresh/only-export-components */
// Layout-only fixture. Learner actions affect synthetic React state only.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Check, Send, Target } from 'lucide-react'
import { LearnerActiveGoalBanner } from '../../src/components/LearnerActiveGoalBanner'
import { LearnerPlanTodayOverview } from '../../src/components/LearnerPlanTodayOverview'
import type { LearnerLearningPlanSummary, LearnerPlanStatus, LearnerPlanSubjectStatus } from '../../src/learnerLearningPlanTypes'
import '../../src/index.css'
import './learnerCockpitLayoutPreview.css'

type GoalKey = 'representations' | 'mass' | 'graphs' | 'functions'
type SampleGoal = {
  title: string
  subject: 'Mathematik' | 'Physik'
  path: string[]
  description: string
  image?: string
  alt?: string
  mastered?: boolean
  children?: GoalKey[]
}

const GOALS: Record<GoalKey, SampleGoal> = {
  representations: {
    title: 'Darstellungsform auswählen und begründen',
    subject: 'Mathematik',
    path: ['E-Phase', 'Funktionen und ihre Darstellungen'],
    description: 'Die lernende Person kann für unterschiedliche Fragestellungen zwischen Tabelle, Graph, Term und Skizze wählen und anhand der benötigten Information begründen, warum die Wahl besser passt als eine plausible Alternative.',
    image: '/assets/goal-visualizations/mathematik/8dd9f210-2683-5902-acab-e3be22725232/8dd9f210-2683-5902-acab-e3be22725232.jpg',
    alt: 'Tabelle, Graph, Term und Skizze im Vergleich: Welche Darstellung zeigt, wann ein Tank halb voll ist?',
  },
  mass: {
    title: 'Masse von Körpern messen und vergleichen',
    subject: 'Physik',
    path: ['Sekundarstufe I', 'Masse, Volumen und Dichte'],
    description: 'Die lernende Person kann für Messbereich und benötigte Auflösung eine geeignete Waage auswählen, ihren Nullpunkt kontrollieren, die Masse eines Körpers messen und mit Einheit und angemessener Genauigkeit angeben sowie Massen vergleichen, ohne Form oder Volumen eines Körpers mit seiner Masse gleichzusetzen.',
    image: '/assets/goal-visualizations/physik/af0e2efb-f634-5f2d-abea-b2e1a67a2894/af0e2efb-f634-5f2d-abea-b2e1a67a2894.jpg',
    alt: 'Illustration zum Auswählen einer geeigneten Waage, Kontrollieren des Nullpunkts sowie Messen und Vergleichen von Massen.',
  },
  graphs: {
    title: 'Funktionswerte aus Graphen ablesen',
    subject: 'Mathematik',
    path: ['E-Phase', 'Funktionen und ihre Darstellungen'],
    description: 'Die lernende Person kann aus Graphen zu gegebenen x-Werten die zugehörigen Funktionswerte sowie zu gegebenen Funktionswerten die zugehörigen x-Werte ablesen.',
    image: '/assets/goal-visualizations/mathematik/a8c42ee9-2898-4247-819f-c235032ac78a/a8c42ee9-2898-4247-819f-c235032ac78a.jpg',
    alt: 'Visualisierung zum Ablesen von Funktionswerten und zugehörigen x-Werten aus Graphen.',
    mastered: true,
  },
  functions: {
    title: 'Funktionen und ihre Darstellungen',
    subject: 'Mathematik',
    path: ['E-Phase'],
    description: 'Entdecke die Lernziele zu Funktionen, ihren Graphen und passenden Darstellungsformen.',
    children: ['graphs', 'representations'],
  },
}

// Fixed status examples in the same format used by the real cockpit gauges.
const SUBJECTS: LearnerPlanSubjectStatus[] = [
  {
    subjectKey: 'mathematik', landscapeIds: ['preview-math'], subjectLabel: 'Mathematik',
    evaluable: true, achievedGoalCount: 10, targetGoalCount: 364,
    periodText: 'Wochenziel 3 von 5', planStatusText: '2 Lernziele im Rückstand',
    balanceDialText: '2 im Rückstand', subjectLine: null, statusDirection: 'behind',
    periodGauge: { completed: 3, target: 5, needlePosition: 0.6 },
    balanceGauge: { net: -2, typicalAmount: 5, scaleLimit: 10, needlePosition: -2 / 11, severeBehind: false, strongAhead: false },
    current: false, canContinue: true,
  },
  {
    subjectKey: 'physik', landscapeIds: ['preview-physics'], subjectLabel: 'Physik',
    evaluable: true, achievedGoalCount: 18, targetGoalCount: 128,
    periodText: 'Wochenziel erreicht', planStatusText: 'Im Plan',
    balanceDialText: 'Im Plan', subjectLine: null, statusDirection: 'on_track',
    periodGauge: { completed: 4, target: 4, needlePosition: 1 },
    balanceGauge: { net: 0, typicalAmount: 4, scaleLimit: 8, needlePosition: 0, severeBehind: false, strongAhead: false },
    current: false, canContinue: true,
  },
]

const PLANS: LearnerLearningPlanSummary[] = SUBJECTS.map((subject) => ({
  planId: subject.subjectKey,
  revision: 1,
  landscapeId: subject.landscapeIds[0],
  planLabel: subject.subjectLabel,
  stale: false,
  period: { startDate: '2026-09-01', endDate: '2027-06-30' },
  currentBlock: null,
  nextMilestone: null,
  buffer: { totalWorkdays: 0, remainingWorkdays: 0 },
  nextEligibleGoal: { goalId: subject.subjectKey === 'mathematik' ? 'representations' : 'mass' },
  continueReason: null,
  canContinue: true,
}))

function Preview() {
  const [selectedId, setSelectedId] = useState<GoalKey>('representations')
  const [activeId, setActiveId] = useState<GoalKey>('mass')
  const [mobile, setMobile] = useState(false)
  const selected = GOALS[selectedId]
  const active = GOALS[activeId]
  const isActive = selectedId === activeId
  const activeLandscapeId = active.subject === 'Mathematik' ? 'preview-math' : 'preview-physics'
  const status: LearnerPlanStatus = {
    asOf: '2026-09-30', periodBasis: 'WEEK', periodStart: '2026-09-28', periodEnd: '2026-10-04',
    timeZone: 'Europe/Berlin', language: 'de', evaluable: true, statusText: '', noticeText: null,
    activeGoal: null, followLearningPlans: true, resumeAvailable: true, unavailablePlanCount: 0,
    subjects: SUBJECTS.map((subject) => ({ ...subject, current: subject.subjectLabel === active.subject })),
  }

  const revealActive = () => setSelectedId(activeId)
  const activateSelected = () => setActiveId(selectedId)

  return (
    <div className="layout-preview">
      <header className="layout-preview-controls">
        <p>Probeseite · Bestehende Elemente, neue Anordnung</p>
        <label>
          Auswahl im Lernzielmenü
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value as GoalKey)}>
            {(['representations', 'mass', 'graphs'] as const).map((id) => (
              <option key={id} value={id}>{GOALS[id].title}</option>
            ))}
          </select>
        </label>
        <label className="layout-preview-mobile"><input type="checkbox" checked={mobile} onChange={(event) => setMobile(event.target.checked)} />Handyansicht</label>
      </header>

      <main className={`learner-cockpit-layout layout-preview-frame${mobile ? ' layout-preview-phone' : ''}`}>
        <div className="mb-6">
          <LearnerActiveGoalBanner
            language="de" subjectLabel={active.subject} title={active.title}
            announcement={`Dein aktives Lernziel: ${active.title}`} onReveal={revealActive}
          />
        </div>

        <div className="learner-cockpit-grid learner-cockpit-grid-with-progress">
          <section className="learner-cockpit-selection" aria-labelledby="selected-heading" data-testid="selected-goal">
            <h2 id="selected-heading" className="mb-3 text-sm font-semibold text-text-secondary">Im Menü ausgewählt</h2>
            {/* The existing GoalCard's visible image, description and action styling, with local example callbacks. */}
            <div className="relative rounded-3xl border border-border-color bg-sidebar-bg p-5 shadow-none">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="sr-only">{selected.title}</h3>
                <div className="ml-auto shrink-0">
                  {selected.mastered ? <Check size={28} strokeWidth={3} className="text-emerald-500" /> : (
                    <button type="button" onClick={isActive ? revealActive : activateSelected}
                      aria-label={isActive ? 'Zum aktiven Lernziel springen' : 'Als aktuelles Lernziel auswählen'}
                      title={isActive ? 'Zum aktiven Lernziel springen' : 'Als aktuelles Lernziel auswählen'}
                      className={isActive ? 'text-amber-500 hover:text-amber-400' : 'text-slate-400 hover:text-amber-500'}>
                      {isActive ? <Send size={28} /> : <Target size={28} />}
                    </button>
                  )}
                </div>
              </div>
              <figure className="mb-4 mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img src={selected.image} alt={selected.alt} className="block h-auto max-h-[28rem] w-full object-contain" />
              </figure>
              <p className="mt-2 text-sm leading-relaxed text-text-primary">{selected.description}</p>
              {!selected.mastered && !isActive && <div className="mt-4 flex justify-end">
                <button type="button" onClick={activateSelected} className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-500/20">
                  <Send size={16} /><span>Als aktuelles Lernziel auswählen</span>
                </button>
              </div>}
            </div>
          </section>

          <aside className="learner-cockpit-progress" aria-labelledby="progress-heading">
            <h2 id="progress-heading" className="mb-3 text-sm font-semibold text-text-secondary">Dein Lernstand</h2>
            <LearnerPlanTodayOverview
              status={status} plans={PLANS} language="de" planModeEnabled
              subjectLabel={(id) => id === 'preview-math' ? 'Mathematik' : 'Physik'}
              goalLabel={(id) => GOALS[id as GoalKey]?.title}
              showActiveGoal={false} activeGoalId={activeId} activeLandscapeId={activeLandscapeId}
              onSwitch={(planId) => {
                const goalId = planId === 'mathematik' ? 'representations' : 'mass'
                setActiveId(goalId)
                setSelectedId(goalId)
              }}
            />
          </aside>
        </div>
      </main>
      <p className="layout-preview-note">Beispieldaten · Änderungen auf dieser Seite betreffen keinen echten Lernstand.</p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Preview />)
