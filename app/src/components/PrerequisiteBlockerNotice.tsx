import React from 'react'
import type { PrerequisiteBlocker } from '../learnerTypes'

interface PrerequisiteBlockerNoticeProps {
  blockers: PrerequisiteBlocker[]
  language: 'de' | 'en'
  onOpenPersonalCurriculum: () => void
  onReviewPrerequisite?: (goalId: string) => void
}

/** Opens the existing learner-owned setup; it never selects or saves a scope. */
export const PrerequisiteBlockerNotice = ({
  blockers,
  language,
  onOpenPersonalCurriculum,
  onReviewPrerequisite,
}: PrerequisiteBlockerNoticeProps): React.ReactElement | null => {
  if (blockers.length === 0) return null
  const english = language === 'en'
  const canReviewScope = blockers.some((blocker) => blocker.remediation === 'OPEN_PERSONAL_CURRICULUM')
  return (
    <section className="m-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900/60 dark:bg-amber-950/20" aria-live="polite" data-testid="prerequisite-blockers">
      <h3 className="font-semibold text-text-primary">
        {english ? 'Your next step needs a prerequisite' : 'Für den nächsten Schritt fehlt eine Voraussetzung'}
      </h3>
      <ul className="mt-2 space-y-2 text-text-secondary">
        {blockers.map((blocker, index) => {
          const goal = (english ? blocker.goalTitleEn : undefined) || blocker.goalTitle
          const prerequisite = (english ? blocker.prerequisiteTitleEn : undefined) || blocker.prerequisiteTitle
          return (
            <li key={`${blocker.goalId}:${blocker.prerequisiteId ?? index}:${blocker.reason}`}>
              {goal && <strong>{goal}: </strong>}
              {blocker.reason === 'EXTERNAL_PREREQUISITE_UNMASTERED'
                ? english
                  ? `The prerequisite “${prerequisite ?? 'competence'}” is still open and is outside your current learning targets.`
                  : `Die Voraussetzung „${prerequisite ?? 'Kompetenz'}“ ist noch offen und gehört nicht zu deinen aktuellen Lernzielen.`
                : blocker.reason === 'PREREQUISITE_OUTSIDE_FOCUS'
                  ? english
                    ? `The prerequisite “${prerequisite ?? 'competence'}” is still open and is outside your current focus.`
                    : `Die Voraussetzung „${prerequisite ?? 'Kompetenz'}“ ist noch offen und liegt außerhalb deines aktuellen Lernfokus.`
                : blocker.reason === 'PREREQUISITE_NOT_PROJECTED'
                  ? english
                    ? `The prerequisite “${prerequisite ?? 'competence'}” is currently unavailable in your selected view.`
                    : `Die Voraussetzung „${prerequisite ?? 'Kompetenz'}“ ist in der gewählten Ansicht momentan nicht verfügbar.`
                  : english
                    ? 'A prerequisite is currently unavailable. You can continue here once it becomes available.'
                    : 'Eine Voraussetzung ist momentan nicht verfügbar. Sobald sie verfügbar ist, kannst du hier weiterlernen.'}
              {blocker.remediation === 'REVIEW_FOCUS' && blocker.prerequisiteId && onReviewPrerequisite && (
                <button type="button" className="mt-2 block font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400" onClick={() => onReviewPrerequisite(blocker.prerequisiteId!)}>
                  {english ? 'View prerequisite and review focus' : 'Voraussetzung ansehen und Lernfokus prüfen'}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {canReviewScope && (
        <>
          <p className="mt-3 text-text-secondary">
            {english
              ? 'Review your subjects, stage and course choices to include suitable learning targets. Changes take effect when you confirm them in setup.'
              : 'Prüfe deine Fächer, Stufe und Kurswahl, um passende Lernziele aufzunehmen. Änderungen werden erst durch deine Bestätigung in der Einrichtung wirksam.'}
          </p>
          <button type="button" onClick={onOpenPersonalCurriculum} className="mt-3 rounded-lg bg-sky-600 px-3 py-2 font-semibold text-white hover:bg-sky-500">
            {english ? 'Review personal curriculum' : 'Persönlichen Lehrplan prüfen'}
          </button>
        </>
      )}
    </section>
  )
}
