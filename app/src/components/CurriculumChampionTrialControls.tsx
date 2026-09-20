import { useRef, useState } from 'react'

export interface ChampionTrial {
  state: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'stale'
  scopeLabel: string
  scopeCoverage: 'full' | 'partial'
  requiredGoals: number
  practicedGoals: number
  blockingFindings: number
  findingsAvailable?: boolean
  canStart: boolean
  canComplete: boolean
}

interface Props {
  championId: string
  trial: ChampionTrial
  language: 'de' | 'en'
  onChanged: () => void | Promise<void>
}

export function CurriculumChampionTrialControls({ championId, trial, language, onChanged }: Props) {
  const inFlight = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const en = language === 'en'
  const states = en ? {
    not_started: 'Trial not started', in_progress: 'Human QA in progress', paused: 'Trial paused',
    completed: 'Human-tested', stale: 'Trial needs updating',
  } : {
    not_started: 'Erprobung noch nicht begonnen', in_progress: 'Menschliche QS läuft', paused: 'Erprobung pausiert',
    completed: 'Menschlich erprobt', stale: 'Erprobung muss aktualisiert werden',
  }
  const act = async (action: 'start' | 'pause' | 'resume' | 'complete') => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/ui/curricula/champions/${encodeURIComponent(championId)}/trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...(action === 'complete' ? { confirmed: true } : {}) }),
      })
      if (!response.ok) {
        throw new Error(en
          ? 'The trial could not be updated. Reload to check the current scope and requirements.'
          : 'Die Erprobung konnte nicht aktualisiert werden. Lade den aktuellen Umfang und Prüfstand neu.')
      }
      setConfirming(false)
      await onChanged()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (en ? 'Update failed.' : 'Aktualisierung fehlgeschlagen.'))
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }
  const buttonClass = 'rounded-lg border border-border-color px-3 py-2 text-sm font-medium text-text-primary disabled:opacity-50 disabled:cursor-not-allowed'
  return (
    <section aria-label={en ? 'Your curriculum trial' : 'Deine Curriculum-Erprobung'} className="rounded-xl border border-border-color bg-white/60 p-4 dark:bg-slate-900/40">
      <h3 className="font-semibold text-text-primary">{trial.scopeLabel}</h3>
      <p className="mt-1 text-sm text-text-primary">{states[trial.state]}{trial.scopeCoverage === 'partial' ? (en ? ' · limited scope' : ' · begrenzter Umfang') : ''}</p>
      <p className="mt-2 text-sm text-text-secondary">
        {en ? 'Evidenced learning stations' : 'Belegt durchlaufene Lernstationen'}: {trial.practicedGoals} / {trial.requiredGoals}
      </p>
      {trial.state === 'not_started' && <p className="mt-2 text-sm text-text-secondary">{en
        ? 'Starting confirms that you will test this scope in practice. Your current curriculum selection defines the scope; at least M5 is required.'
        : 'Mit dem Beginn bestätigst du die praktische Erprobung dieses Umfangs. Deine aktuelle Curriculum-Auswahl legt den Umfang fest; mindestens M5 ist erforderlich.'}</p>}
      {trial.state === 'stale' && <p className="mt-2 text-sm text-text-secondary">{en
        ? 'The curriculum or its findings have changed. Current evidence and a new final confirmation are required; unchanged stations retain their evidence.'
        : 'Inhalte oder Befunde haben sich geändert. Aktuelle Nachweise und eine erneute Abschlussbestätigung sind nötig; Nachweise unveränderter Stationen bleiben erhalten.'}</p>}
      {trial.findingsAvailable === false
        ? <p className="mt-2 text-sm text-text-secondary">{en ? 'The current findings are unavailable. Completion cannot be confirmed yet.' : 'Der aktuelle Befundstand ist nicht verfügbar. Der Abschluss kann noch nicht bestätigt werden.'}</p>
        : trial.blockingFindings > 0 && <p className="mt-2 text-sm text-text-secondary">{en ? 'Blocking findings' : 'Blockierende Befunde'}: {trial.blockingFindings}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {trial.canStart && <button type="button" disabled={busy} className={buttonClass} onClick={() => void act('start')}>{en ? 'Begin trial' : 'Erprobung beginnen'}</button>}
        {trial.state === 'in_progress' && <button type="button" disabled={busy} className={buttonClass} onClick={() => void act('pause')}>{en ? 'Pause trial' : 'Erprobung pausieren'}</button>}
        {(trial.state === 'paused' || trial.state === 'stale') && <button type="button" disabled={busy} className={buttonClass} onClick={() => void act('resume')}>{en ? 'Resume trial' : 'Erprobung fortsetzen'}</button>}
        {trial.canComplete && !confirming && <button type="button" disabled={busy} className={buttonClass} onClick={() => setConfirming(true)}>{en ? 'Complete trial…' : 'Erprobung abschließen…'}</button>}
      </div>
      {confirming && <div className="mt-3 rounded-lg border border-border-color p-3" role="group" aria-label={en ? 'Confirm trial completion' : 'Erprobungsabschluss bestätigen'}>
        <p className="text-sm text-text-primary">{en
          ? 'All stations completed. I confirm that I have tested the entire displayed scope and know of no unresolved blocking findings.'
          : 'Alle Stationen durchlaufen. Ich bestätige, dass ich den gesamten angezeigten Umfang erprobt habe und keine bekannten ungelösten blockierenden Befunde bestehen.'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={busy || !trial.canComplete} className={buttonClass} onClick={() => void act('complete')}>{en ? 'Confirm completion' : 'Abschluss bestätigen'}</button>
          <button type="button" disabled={busy} className={buttonClass} onClick={() => setConfirming(false)}>{en ? 'Cancel' : 'Abbrechen'}</button>
        </div>
      </div>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>}
    </section>
  )
}
