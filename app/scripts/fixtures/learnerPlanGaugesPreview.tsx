/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

import '../../src/index.css'
import { LearnerPlanTodayOverview } from '../../src/components/LearnerPlanTodayOverview'
import type {
  LearnerLearningPlanSummary,
  LearnerPlanBalanceGauge,
  LearnerPlanPeriodGauge,
  LearnerPlanStatus,
  LearnerPlanStatusDirection,
  LearnerPlanSubjectStatus,
} from '../../src/learnerLearningPlanTypes'

type Sample = {
  periodText: string | null
  planStatusText: string | null
  statusDirection: LearnerPlanStatusDirection | null
  periodGauge: LearnerPlanPeriodGauge | null
  balanceGauge: LearnerPlanBalanceGauge | null
}

type Example = {
  key: string
  label: string
  note: string
  day: { math: Sample; physics: Sample }
  week: { math: Sample; physics: Sample }
}

const balance = (
  net: number, typicalAmount: number, scaleLimit: number, needlePosition: number,
  severeBehind = false, strongAhead = false,
): LearnerPlanBalanceGauge => ({
  net, typicalAmount, scaleLimit, needlePosition, severeBehind, strongAhead,
})

const sample = (
  periodText: string,
  planStatusText: string,
  statusDirection: LearnerPlanStatusDirection,
  completed: number,
  target: number,
  periodNeedle: number | null,
  balanceGauge: LearnerPlanBalanceGauge | null,
): Sample => ({
  periodText, planStatusText, statusDirection,
  periodGauge: { completed, target, needlePosition: periodNeedle },
  balanceGauge,
})

const unavailable: Sample = {
  periodText: null, planStatusText: null, statusDirection: null,
  periodGauge: null, balanceGauge: null,
}

const DAY_MATH = sample('Tagesziel 0 von 6', '1 Lernziel im Rückstand', 'behind', 0, 6, 0,
  balance(-1, 3, 6, -1 / 7))
const DAY_PHYSICS = sample('Tagesziel 0 von 7', '13 Lernziele im Rückstand', 'behind', 0, 7, 0,
  balance(-13, 4, 8, -1, true))
const WEEK_MATH = sample('Wochenziel 0 von 10', '1 Lernziel im Rückstand', 'behind', 0, 10, 0,
  balance(-1, 8, 16, -1 / 17))
const WEEK_PHYSICS = sample('Wochenziel 0 von 12', '13 Lernziele im Rückstand', 'behind', 0, 12, 0,
  balance(-13, 6, 12, -1, true))

const EXAMPLES: Example[] = [
  {
    key: 'current', label: 'Aktueller Stand',
    note: 'Wie im gezeigten Cockpit: Mathematik ist leicht, Physik deutlich im Rückstand. Beide Fachbilanzen bleiben getrennt.',
    day: { math: DAY_MATH, physics: DAY_PHYSICS },
    week: { math: WEEK_MATH, physics: WEEK_PHYSICS },
  },
  {
    key: 'open', label: 'Offen · im Plan',
    note: 'Beide Fächer haben ein offenes Pensum. Die kumulierte Bilanz steht jeweils neutral.',
    day: {
      math: sample('Tagesziel 2 von 6', 'im Plan', 'on_track', 2, 6, 2 / 6, balance(0, 3, 6, 0)),
      physics: sample('Tagesziel 3 von 7', 'im Plan', 'on_track', 3, 7, 3 / 7, balance(0, 4, 8, 0)),
    },
    week: {
      math: sample('Wochenziel 6 von 10', 'im Plan', 'on_track', 6, 10, 0.6, balance(0, 8, 16, 0)),
      physics: sample('Wochenziel 8 von 12', 'im Plan', 'on_track', 8, 12, 8 / 12, balance(0, 6, 12, 0)),
    },
  },
  {
    key: 'backlog', label: 'Pensum erfüllt · Rückstand',
    note: 'Das gewählte Tages- oder Wochenpensum ist erreicht. Älterer Rückstand bleibt trotzdem sichtbar.',
    day: {
      math: sample('Tagesziel erreicht', '1 Lernziel im Rückstand', 'behind', 6, 6, 1, balance(-1, 3, 6, -1 / 7)),
      physics: sample('Tagesziel erreicht', '13 Lernziele im Rückstand', 'behind', 7, 7, 1, balance(-13, 4, 8, -1, true)),
    },
    week: {
      math: sample('Wochenziel erreicht', '1 Lernziel im Rückstand', 'behind', 10, 10, 1, balance(-1, 8, 16, -1 / 17)),
      physics: sample('Wochenziel erreicht', '13 Lernziele im Rückstand', 'behind', 12, 12, 1, balance(-13, 6, 12, -1, true)),
    },
  },
  {
    key: 'mild-ahead', label: 'Leichter Vorsprung',
    note: 'Auch kleiner Vorsprung hat eine grüne Gesamtnadel. Die tatsächliche Zahl steht weiter unter der Scheibe.',
    day: {
      math: sample('Tagesziel erreicht', '2 Lernziele vorgearbeitet', 'ahead', 6, 6, 1, balance(2, 3, 6, 2 / 6)),
      physics: sample('Tagesziel erreicht', '1 Lernziel vorgearbeitet', 'ahead', 7, 7, 1, balance(1, 4, 8, 1 / 8)),
    },
    week: {
      math: sample('Wochenziel erreicht', '2 Lernziele vorgearbeitet', 'ahead', 10, 10, 1, balance(2, 8, 16, 2 / 16)),
      physics: sample('Wochenziel erreicht', '1 Lernziel vorgearbeitet', 'ahead', 12, 12, 1, balance(1, 6, 12, 1 / 12)),
    },
  },
  {
    key: 'ahead', label: 'Vorarbeit · Vorsprung',
    note: 'Früher erledigte Planziele zählen mit. Der tatsächliche Vorsprung bleibt über dem Anschlag lesbar.',
    day: {
      math: sample('Tagesziel erreicht', '7 Lernziele vorgearbeitet', 'ahead', 6, 6, 1, balance(7, 3, 6, 1, false, true)),
      physics: sample('Tagesziel erreicht', '9 Lernziele vorgearbeitet', 'ahead', 7, 7, 1, balance(9, 4, 8, 1, false, true)),
    },
    week: {
      math: sample('Wochenziel erreicht', '17 Lernziele vorgearbeitet', 'ahead', 10, 10, 1, balance(17, 8, 16, 1, false, true)),
      physics: sample('Wochenziel erreicht', '13 Lernziele vorgearbeitet', 'ahead', 12, 12, 1, balance(13, 6, 12, 1, false, true)),
    },
  },
  {
    key: 'no-target', label: 'Kein Periodenziel',
    note: 'Ein leerer Zeitraum erzeugt keinen künstlichen Null-Prozent-Wert. Die Planbilanz bleibt verfügbar.',
    day: {
      math: sample('Heute kein Tagesziel', '1 Lernziel im Rückstand', 'behind', 0, 0, null, balance(-1, 3, 6, -1 / 7)),
      physics: sample('Heute kein Tagesziel', '13 Lernziele im Rückstand', 'behind', 0, 0, null, balance(-13, 4, 8, -1, true)),
    },
    week: {
      math: sample('Diese Woche kein Wochenziel', '1 Lernziel im Rückstand', 'behind', 0, 0, null, balance(-1, 8, 16, -1 / 17)),
      physics: sample('Diese Woche kein Wochenziel', '13 Lernziele im Rückstand', 'behind', 0, 0, null, balance(-13, 6, 12, -1, true)),
    },
  },
  {
    key: 'unavailable', label: 'Nicht auswertbar',
    note: 'Mathematik bleibt auswertbar. Fehlende Physikdaten zeigen dort zwei Platzhalter ohne erfundene Bilanz.',
    day: { math: DAY_MATH, physics: unavailable },
    week: { math: WEEK_MATH, physics: unavailable },
  },
]

const mockPlan = (planId: string, landscapeId: string, planLabel: string, nextGoalId: string): LearnerLearningPlanSummary => ({
  planId,
  revision: 1,
  landscapeId,
  planLabel,
  stale: false,
  period: { startDate: '2026-09-01', endDate: '2027-06-30' },
  currentBlock: {
    blockId: planId + '-current', kind: 'learning', title: 'Aktueller Lernabschnitt',
    startDate: '2026-09-01', endDate: '2026-09-30',
  },
  nextMilestone: null,
  buffer: { totalWorkdays: 4, remainingWorkdays: 4 },
  nextEligibleGoal: { goalId: nextGoalId },
  continueReason: null,
  canContinue: true,
})

const MOCK_PLANS: LearnerLearningPlanSummary[] = [
  {
    ...mockPlan('preview-math', 'math/sek-i', 'Mathematik', 'math-next'),
    buffer: { totalWorkdays: 4, remainingWorkdays: 0 },
  },
  {
    ...mockPlan('preview-physics', 'physics/sek-i', 'Physik', 'physics-next'),
    currentBlock: null,
    buffer: { totalWorkdays: 0, remainingWorkdays: 0 },
  },
]

const statusFor = (basis: 'DAY' | 'WEEK', example: Example): LearnerPlanStatus => {
  const values = basis === 'DAY' ? example.day : example.week
  const subjects: LearnerPlanSubjectStatus[] = ([
    ['mathematik', 'Mathematik', 'math/sek-i', values.math],
    ['physik', 'Physik', 'physics/sek-i', values.physics],
  ] as const).map(([subjectKey, subjectLabel, landscapeId, value]) => {
    const evaluable = value.periodGauge !== null
    return {
      subjectKey, landscapeIds: [landscapeId], subjectLabel, evaluable,
      periodText: value.periodText,
      planStatusText: value.planStatusText,
      subjectLine: evaluable ? subjectLabel + ': ' + value.periodText + ' · ' + value.planStatusText : null,
      statusDirection: value.statusDirection,
      periodGauge: value.periodGauge,
      balanceGauge: value.balanceGauge,
      current: subjectKey === 'physik',
      canContinue: true,
    }
  })
  const unavailableCount = subjects.filter((subject) => !subject.evaluable).length
  const notice = unavailableCount ? '1 Fachplan nicht auswertbar (Physik).' : null
  return {
    asOf: '2026-09-23',
    periodBasis: basis,
    periodStart: basis === 'DAY' ? '2026-09-23' : '2026-09-21',
    periodEnd: basis === 'DAY' ? '2026-09-23' : '2026-09-27',
    timeZone: 'Europe/Berlin',
    language: 'de',
    evaluable: unavailableCount === 0,
    statusText: [...subjects.map((subject) => subject.subjectLine).filter(Boolean), ...(notice ? [notice] : [])].join('\n'),
    noticeText: notice,
    activeGoal: {
      title: 'Masse von Körpern messen und vergleichen',
      announcement: 'Dein aktives Lernziel: Masse von Körpern messen und vergleichen',
    },
    followLearningPlans: true,
    resumeAvailable: true,
    subjects,
    unavailablePlanCount: unavailableCount,
  }
}

const Preview = () => {
  const [basis, setBasis] = useState<'DAY' | 'WEEK'>('WEEK')
  const [exampleKey, setExampleKey] = useState('current')
  const [mobile, setMobile] = useState(() => window.innerWidth < 640)
  const [settingsNotice, setSettingsNotice] = useState(false)
  const example = EXAMPLES.find((item) => item.key === exampleKey) ?? EXAMPLES[0]
  const status = statusFor(basis, example)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-[1700px]">
        <header className="overflow-hidden rounded-3xl px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 100%)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">SkillPilot · Issue #56</p>
            <span className="rounded-full border border-sky-300/40 bg-sky-300/15 px-3 py-1 text-xs font-semibold text-sky-100">
              Visuelle Vorschau · Beispieldaten
            </span>
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            Heute und Gesamt auf einen Blick
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Hier läuft die echte Cockpit-Komponente mit festen Beispieldaten. Du kannst Zeitraum,
            Plansituation und Ansichtsbreite ausprobieren.
          </p>
        </header>

        <section aria-label="Vorschau steuern" className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Zeitraum</p>
              <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Zeitraum">
                {(['DAY', 'WEEK'] as const).map((value) => (
                  <button key={value} type="button" data-testid={'preview-basis-' + value}
                    aria-pressed={basis === value} onClick={() => setBasis(value)}
                    className={'min-h-10 rounded-lg px-5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ' +
                      (basis === value ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900')}>
                    {value === 'DAY' ? 'Tag' : 'Woche'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Ansicht</p>
              <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Ansichtsbreite">
                <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}
                  className={'min-h-10 rounded-lg px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ' +
                    (!mobile ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900')}>Flexibel</button>
                <button type="button" data-testid="preview-mobile" aria-pressed={mobile} onClick={() => setMobile(true)}
                  className={'min-h-10 rounded-lg px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ' +
                    (mobile ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900')}>Handy</button>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Plansituation</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {EXAMPLES.map((item) => (
                <button key={item.key} type="button" data-testid={'preview-case-' + item.key}
                  aria-pressed={example.key === item.key} onClick={() => setExampleKey(item.key)}
                  className={'min-h-12 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ' +
                    (example.key === item.key
                      ? 'border-sky-500 bg-sky-50 text-sky-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-slate-50')}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="preview-heading" className="mt-6">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700">Live-Vorschau</p>
              <h2 id="preview-heading" className="mt-1 text-xl font-bold">{example.label}</h2>
            </div>
            <p className="text-xs font-medium text-slate-500">{mobile ? 'Handyansicht · max. 390 px' : 'Flexible Ansicht'}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-100/70 p-3 shadow-inner sm:p-6">
            <div data-testid="preview-frame" className={'mx-auto transition-[max-width] duration-200 ' +
              (mobile ? 'max-w-[390px]' : 'max-w-[1600px]')}>
              <LearnerPlanTodayOverview
                status={status} plans={MOCK_PLANS} language="de" planModeEnabled
                subjectLabel={(id) => id.startsWith('math') ? 'Mathematik' : 'Physik'}
                goalLabel={(id) => id === 'physics-mass'
                  ? 'Masse von Körpern messen und vergleichen' : 'Nächstes Lernziel'}
                activeGoalId="physics-mass" activeLandscapeId="physics/sek-i"
                onSwitch={() => setSettingsNotice(true)}
              />
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-950">
            {example.note}
          </p>
          {settingsNotice ? (
            <p role="status" className="mt-2 text-sm text-slate-600">
              Diese Vorschau verwendet feste Beispieldaten. Der Fachwechsel ändert keinen Lernstand.
            </p>
          ) : null}
        </section>
        <footer className="mt-8 pb-5 text-xs text-slate-500">
          Entwurf zur Sichtprüfung · keine Kontodaten, keine Backend-Verbindung, keine Lernstandsänderung.
        </footer>
      </div>
    </main>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Preview root missing')
createRoot(rootElement).render(<Preview />)
