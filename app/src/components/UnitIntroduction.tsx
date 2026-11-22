import { useEffect, useId, useState, type ReactNode } from 'react'
import { de } from '../locales/de'
import { en } from '../locales/en'
import type { MapPracticeMaterial } from './learningUnitMap/types'
import './UnitIntroduction.css'

/** Presentation never writes a learner result. The coach owns confirmation. */
export function UnitIntroduction({ material, language, context, completed, credited = false, nextStep, compact = false,
  deferUntilRequested = false, active = true, onContinue, assessmentEntry, resumeLink }: {
  material: MapPracticeMaterial
  language: 'de' | 'en'
  context: readonly string[]
  completed: boolean
  credited?: boolean
  nextStep?: { title: string; open: () => void }
  compact?: boolean
  /** Direct assessment navigation retains its drawing space and entry exception. */
  deferUntilRequested?: boolean
  active?: boolean
  assessmentEntry?: ReactNode
  resumeLink?: ReactNode
  onContinue?: (orientationGoalId: string) => Promise<void> | void
}) {
  const intro = material.intro[language]
  const english = language === 'en'
  const id = useId()
  const [expanded, setExpanded] = useState(!completed && !credited && !deferUntilRequested)
  const [busy, setBusy] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [error, setError] = useState(false)
  const done = completed || credited
  useEffect(() => { setExpanded(!done && !deferUntilRequested) }, [done, deferUntilRequested, active])

  const orientationGoalId = material.unit.orientationGoalId
  const startIntroduction = expanded && !done && orientationGoalId && onContinue

  return <section className={`unit-introduction${expanded ? '' : ' unit-introduction--short'}${compact ? ' unit-introduction--map' : ''}`}
    data-testid="unit-introduction" data-orientation-goal-id={material.unit.orientationGoalId}
    data-state={done ? 'return' : 'orientation'} aria-labelledby={expanded ? id : undefined}
    aria-label={expanded ? undefined : context.at(-1) ?? intro.question}>
    {context.length > 0 && <p className="unit-introduction-context" data-testid="unit-introduction-context">{context.join(' › ')}</p>}
    {expanded ? <>
      <h2 id={id}>{intro.question}</h2>
      <p className="unit-introduction-promise">{intro.promise}</p>
      <div className="unit-introduction-scene">
        {intro.imageUrl && <figure>
          <img src={intro.imageUrl} alt={intro.imageAlt ?? intro.scene ?? intro.question} onError={() => setImageFailed(true)} />
          {imageFailed && <figcaption>{intro.imageAlt ?? intro.scene ?? intro.question}</figcaption>}
        </figure>}
        <div>
          {intro.scene && <p>{intro.scene}</p>}
          {!!intro.topics?.length && <div data-testid="unit-introduction-topics">
            <h3>{english ? 'What you will explore' : 'Darum geht es'}</h3>
            <ul>{intro.topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
          </div>}
        </div>
      </div>
      {done ? <button type="button" onClick={() => setExpanded(false)}>{english ? 'Keep overview short' : 'Überblick kurz halten'}</button>
        : onContinue && material.unit.orientationGoalId && <div className="unit-introduction-next">
          <p>{english ? 'You can share a guess, ask a question, or tell your learning coach you would like to begin.'
            : 'Du kannst eine Vermutung äußern, eine Frage stellen oder deinem Lerncoach sagen, dass du anfangen möchtest.'}</p>
        </div>}
    </> : <p className="unit-introduction-return"><span>{completed ? (english ? 'Introduction completed.' : 'Einstieg abgeschlossen.')
      : credited ? (english ? 'Introduction credited through assessment.' : 'Einstieg durch eine Prüfung angerechnet.')
        : (english ? 'The unit introduction is still open.' : 'Der Einstieg der Einheit ist noch offen.')}</span>
      {done && (nextStep ? <button type="button" onClick={nextStep.open}>{english ? 'Next step: ' : 'Nächster Schritt: '}{nextStep.title}</button>
        : <span>{english ? 'Choose a topic from the visible goals.' : 'Wähle ein Thema aus den sichtbaren Zielen.'}</span>)}
      <button type="button" onClick={() => setExpanded(true)}>{done
        ? (english ? 'View introduction again' : 'Einstieg noch einmal ansehen')
        : (english ? 'View introduction' : 'Einstieg ansehen')}</button></p>}
    {(startIntroduction || assessmentEntry || resumeLink) && (
      <div className="unit-introduction-actions">
        {startIntroduction ? (
          <button type="button" className="unit-introduction-start" data-testid="unit-introduction-continue" disabled={busy || !active}
            onClick={async () => {
              if (busy || !active) return
              setBusy(true)
              setError(false)
              try { await startIntroduction(orientationGoalId) } catch { setError(true) } finally { setBusy(false) }
            }}>{busy ? (english ? 'Opening…' : 'Wird geöffnet…') : (english ? en : de).startPage.cards.gpt.title}</button>
        ) : resumeLink}
        {assessmentEntry}
      </div>
    )}
    {error && <p role="alert">{english ? 'The introduction could not be opened. Please try again.' : 'Der Einstieg konnte nicht geöffnet werden. Bitte versuche es erneut.'}</p>}
  </section>
}
