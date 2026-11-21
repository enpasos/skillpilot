import * as React from 'react'
import type { StoredUnitAssignment } from '../learnerLearningPlanTypes'
import { setUnitAssignmentActivity } from '../utils/learnerLearningPlanApi'
import { storedUnitAssignmentAnchor } from '../utils/learnerLearningPlanReadModel'

interface Props {
  learnerId: string
  assignments: StoredUnitAssignment[]
  language: string
  disabled: boolean
  sectionTitle: (id: string) => string | undefined
  subjectTitle: (id: string) => string | undefined
  onRefresh: () => Promise<void>
}

export function StoredUnitAssignments({ learnerId, assignments, language, disabled, sectionTitle, subjectTitle, onRefresh }: Props) {
  const en = language === 'en'
  const submitting = React.useRef(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState(false)
  const change = async (item: StoredUnitAssignment) => {
    if (disabled || submitting.current || (!item.active && !item.canReactivate)) return
    submitting.current = true
    setPending(true)
    setError(false)
    try {
      await setUnitAssignmentActivity(learnerId, item, !item.active)
      await onRefresh()
    } catch {
      setError(true)
      await onRefresh().catch(() => {})
    } finally {
      submitting.current = false
      setPending(false)
    }
  }
  return <section data-testid="stored-unit-assignments" className="my-3 rounded-xl border border-border-color p-4 text-sm">
    <h3 className="font-semibold">{en ? 'Manage saved unit assignments' : 'Gespeicherte Einheitenaufträge verwalten'}</h3>
    <p className="mt-1 text-text-secondary">{en ? 'Pausing a unit assignment keeps your assessment results.' : 'Beim Pausieren eines Einheitenauftrags bleiben deine Prüfungsnachweise erhalten.'}</p>
    <ul>{assignments.map(item => {
      const anchor = storedUnitAssignmentAnchor(item.planId, item.blockId)
      const subject = subjectTitle(item.landscapeId)
      const section = sectionTitle(item.sectionGoalId)
      return <li key={anchor} id={anchor} data-block-id={item.blockId} className="mt-3">
        <p className="font-medium">{item.title || section || (en ? 'Unit assignment' : 'Einheitenauftrag')}
          {item.title && section && item.title !== section && ' · ' + section}
          {subject && ' · ' + subject}</p>
        {item.active && <p>{en ? 'Selected in the learning plan' : 'Im Lernplan ausgewählt'}</p>}
        {!item.active && <p>{item.canReactivate ? (en ? 'Paused' : 'Pausiert')
          : (en ? 'Paused. This edition is currently unavailable.' : 'Pausiert. Diese Auftragsfassung ist derzeit nicht verfügbar.')}</p>}
        {(item.active || item.canReactivate) && <button type="button" disabled={disabled || pending}
          className="min-h-9 rounded text-left underline underline-offset-2 disabled:opacity-50"
          onClick={() => void change(item)}>{item.active
            ? (en ? 'Pause unit assignment' : 'Einheitenauftrag pausieren')
            : (en ? 'Reactivate unit assignment' : 'Einheitenauftrag wieder aktivieren')}</button>}
      </li>
    })}</ul>
    {error && <p role="alert" className="mt-2">{en ? 'The change could not be saved. Check the current assignment and try again.'
      : 'Die Änderung konnte nicht gespeichert werden. Prüfe den aktuellen Auftrag und versuche es erneut.'}</p>}
  </section>
}
