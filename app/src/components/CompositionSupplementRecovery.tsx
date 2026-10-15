import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import {
  requestCompositionSupplementOptions,
  type CompositionSupplementOption,
} from '../utils/personalCurriculumEditorApi'

/** Keeps explicit removal available when a saved preparation prevents the
 * learning graph from loading. Only server-issued REMOVE choices are shown. */
export const CompositionSupplementRecovery: React.FC<{
  skillpilotId: string
  onReload: () => void
}> = ({ skillpilotId, onReload }) => {
  const { language } = useLanguage()
  const english = language === 'en'
  const labelId = React.useId()
  const [attempt, setAttempt] = React.useState(0)
  const [options, setOptions] = React.useState<CompositionSupplementOption[] | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const mutation = React.useRef<AbortController | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()
    setOptions(null)
    setFailed(false)
    void requestCompositionSupplementOptions(skillpilotId, undefined, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          setOptions(result.options.filter((option) => option.action === 'REMOVE'))
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [skillpilotId, attempt])

  React.useEffect(() => () => mutation.current?.abort(), [skillpilotId])

  const remove = async (option: CompositionSupplementOption) => {
    if (mutation.current || option.action !== 'REMOVE') return
    const controller = new AbortController()
    mutation.current = controller
    setBusy(true)
    setFailed(false)
    try {
      const result = await requestCompositionSupplementOptions(skillpilotId, option.optionId, {
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      setOptions(result.options.filter((next) => next.action === 'REMOVE'))
      onReload()
    } catch {
      if (!controller.signal.aborted) {
        setFailed(true)
        // A revision conflict needs a fresh server option, never an automatic
        // repeat of the previous write or a locally inferred removal.
        setOptions(null)
      }
    } finally {
      if (!controller.signal.aborted) {
        setBusy(false)
        mutation.current = null
      }
    }
  }

  return (
    <main className="min-h-screen bg-chat-bg text-text-primary p-6" data-testid="math-preparation-recovery">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-xl font-semibold">
          {english ? 'Your Mathematics preparation is currently unavailable.' : 'Deine Mathematik-Vorbereitung ist derzeit nicht verfügbar.'}
        </h1>
        <p>
          {english
            ? 'You can remove a saved preparation and reload your curriculum. Your selection stays saved until you choose to remove it.'
            : 'Du kannst eine gespeicherte Vorbereitung entfernen und deinen Lehrplan erneut laden. Deine Auswahl bleibt gespeichert, bis du sie ausdrücklich entfernst.'}
        </p>
        {failed && (
          <p role="alert">
            {english ? 'The request could not be completed. Please reload the choices and try again.' : 'Die Anfrage konnte nicht abgeschlossen werden. Lade die Auswahl erneut und versuche es noch einmal.'}
          </p>
        )}
        {options === null && !failed && (
          <p role="status">{english ? 'Loading your saved preparations…' : 'Deine gespeicherten Vorbereitungen werden geladen…'}</p>
        )}
        {options && options.length > 0 && (
          <ul className="space-y-3">
            {options.map((option, index) => (
              <li key={option.optionId} className="space-y-2 rounded-lg border border-border p-4">
                <p id={`${labelId}-${index}`}>{english ? option.labelEn : option.label}</p>
                <button
                  type="button"
                  className="rounded-lg border border-border px-4 py-2 disabled:opacity-50"
                  aria-describedby={`${labelId}-${index}`}
                  disabled={busy}
                  onClick={() => { void remove(option) }}
                >
                  {english ? 'Remove this preparation' : 'Diese Vorbereitung entfernen'}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={busy} className="rounded-lg border border-border px-4 py-2" onClick={() => setAttempt((current) => current + 1)}>
            {english ? 'Reload choices' : 'Auswahl erneut laden'}
          </button>
          <button type="button" disabled={busy} className="rounded-lg border border-border px-4 py-2" onClick={onReload}>
            {english ? 'Reload curriculum' : 'Lehrplan erneut laden'}
          </button>
        </div>
      </div>
    </main>
  )
}
