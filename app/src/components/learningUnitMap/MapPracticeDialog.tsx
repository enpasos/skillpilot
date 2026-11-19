import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import type { MapPracticeExercise } from './types'

export function MapPracticeDialog({ exercise, language, onDismiss }: {
  exercise: MapPracticeExercise
  language: 'de' | 'en'
  onDismiss: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const english = language === 'en'
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  return <dialog ref={ref} className="lum-practice-dialog" aria-labelledby={titleId}
    onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation() }}
    onClose={event => { if (!event.currentTarget.open) onDismiss() }}>
    <header><div><span>{english ? 'Self-check exercise' : 'Übung zur Selbstkontrolle'}</span>
      <h2 id={titleId}>{exercise.title}</h2></div>
      <button type="button" aria-label={english ? 'Close exercise' : 'Übung schließen'}
        onClick={() => ref.current?.close()}><X size={20} aria-hidden="true" /></button>
    </header>
    <p>{exercise.prompt}</p>
    <details><summary>{english ? 'Show a hint' : 'Hinweis anzeigen'}</summary><p>{exercise.hint}</p></details>
    <details><summary>{english ? 'Compare your solution' : 'Lösung vergleichen'}</summary><p>{exercise.solution}</p></details>
  </dialog>
}
