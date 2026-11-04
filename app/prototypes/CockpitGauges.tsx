import { useState, type ReactNode } from 'react'
import { Repeat2 } from 'lucide-react'

const ARC_PATH = 'M 18 83 A 62 62 0 0 1 142 83'

function Dial({ title, value, total, description, testId }: {
  title: ReactNode; value: number; total: number; description: string; testId: string
}) {
  const fraction = Math.max(0, Math.min(1, total > 0 ? value / total : 0))
  const angle = Math.PI * (1 - fraction)
  const needle = { x: 80 + 48 * Math.cos(angle), y: 83 - 48 * Math.sin(angle) }
  return <div className="cp-dial" title={description} data-testid={testId} data-needle-position={fraction}>
    <div className="cp-dial-title">{title}</div>
    <svg viewBox="0 0 160 94" role="img" aria-label={description}>
      <path d={ARC_PATH} fill="none" stroke="#d8e0e8" strokeWidth="17" strokeLinecap="round" />
      {fraction > 0 && <path d={ARC_PATH} fill="none" pathLength="100" stroke="#5f98bf"
        strokeDasharray={`${fraction * 100} 100`} strokeWidth="17" strokeLinecap="round" />}
      <line x1="80" y1="83" x2={needle.x} y2={needle.y} stroke="#3b729c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="80" cy="83" r="5" fill="#3b729c" />
    </svg>
    <strong className="cp-dial-count">{value} <span>von</span> {total}</strong>
  </div>
}

export function CockpitGauges({ progress, todayExplicit, weekExplicit, demoDate }: {
  progress: { total: number; explicit: number; implicit: number; completed: number }
  todayExplicit: number; weekExplicit: number; demoDate: string
}) {
  const [period, setPeriod] = useState<'DAY' | 'WEEK'>('WEEK')
  const periodValue = period === 'DAY' ? todayExplicit : weekExplicit
  const periodTitle = period === 'DAY' ? 'Heute' : 'Diese Woche'
  return <div className="cp-gauges" aria-label="Lernfortschritt">
    <Dial title={<button type="button" onClick={() => setPeriod(value => value === 'WEEK' ? 'DAY' : 'WEEK')}
      aria-label={`Zeitraum wechseln: ${period === 'WEEK' ? 'Woche' : 'Heute'}`}
      title="Zwischen Tag und Woche wechseln">{periodTitle}<Repeat2 size={10} /></button>}
      value={periodValue} total={1} testId="cockpit-period-gauge"
      description={`${periodTitle}: ${periodValue} von 1 direkt abgeschlossen. Beispieldatum: ${demoDate}.`} />
    <Dial title="Gesamt" value={progress.completed} total={progress.total} testId="cockpit-total-gauge"
      description={`Gesamt: ${progress.completed} von ${progress.total}. ${progress.explicit} direkt, ${progress.implicit} implizit.`} />
    <span className="cp-sr-only" aria-hidden="true" data-testid="cockpit-progress-total">{progress.completed} / {progress.total}</span>
    <span className="cp-sr-only" aria-hidden="true" data-testid="cockpit-today-explicit">{todayExplicit} / 1</span>
    <span className="cp-sr-only" aria-hidden="true" data-testid="cockpit-week-explicit">{weekExplicit} / 1</span>
  </div>
}
