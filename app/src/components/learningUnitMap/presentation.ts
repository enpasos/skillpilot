import type { LearningMapEntry, MapEntryKind } from './types'

export const kindLabels: Record<MapEntryKind, string> = {
  unit: 'Lerneinheit', cluster: 'Bereich', motivation: 'Motivation', goal: 'Fachziel',
  assessment: 'Prüfung', memory: 'Lernkarten',
}

const englishKindLabels: Record<MapEntryKind, string> = {
  unit: 'Learning unit', cluster: 'Section', motivation: 'Motivation', goal: 'Learning goal',
  assessment: 'Assessment', memory: 'Flashcards',
}

export const getKindLabels = (language: 'de' | 'en') => language === 'en' ? englishKindLabels : kindLabels

/** The concept's names for units in the unit map (§3.1); other maps keep their kind labels. */
const unitTypeLabels = {
  de: { unit: 'Einheit', unitWithAssessments: 'Einheit mit Prüfungen' },
  en: { unit: 'Unit', unitWithAssessments: 'Unit with assessments' },
} as const

export const getEntryKindLabel = (entry: Pick<LearningMapEntry, 'kind' | 'unitType'>, language: 'de' | 'en') =>
  entry.kind === 'unit' && entry.unitType ? unitTypeLabels[language][entry.unitType] : getKindLabels(language)[entry.kind]
