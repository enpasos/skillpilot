import React from 'react'
import { maturityCopy } from '../utils/curriculumQualityPresentation'

/** Counts come from the single strict five-gate report, never from gate sums. */
export const CurriculumDeepQualityProgress = ({ metrics, language }: {
  metrics?: Record<string, number>
  language: 'de' | 'en'
}): React.ReactElement => {
  const { expectedGoals, strictComplete, remaining } = metrics ?? {}
  if (![expectedGoals, strictComplete, remaining].every((value) => Number.isSafeInteger(value) && value >= 0)
      || expectedGoals <= 0 || strictComplete > expectedGoals || strictComplete + remaining !== expectedGoals) {
    return <p className="text-xs text-text-secondary">{maturityCopy[language].unknown}</p>
  }
  return <p className="text-sm" data-testid="curriculum-deep-quality-progress">
    {language === 'de'
      ? `Vertiefte QS: ${strictComplete} von ${expectedGoals} Lernzielen abgeschlossen · ${remaining} offen`
      : `In-depth QA: ${strictComplete} of ${expectedGoals} learning goals completed · ${remaining} remaining`}
  </p>
}
