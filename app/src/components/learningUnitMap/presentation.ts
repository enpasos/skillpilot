import type { MapEntryKind } from './types'

export const kindLabels: Record<MapEntryKind, string> = {
  unit: 'Lerneinheit', cluster: 'Bereich', motivation: 'Motivation', goal: 'Fachziel',
  assessment: 'Prüfung', memory: 'Lernkarten',
}

const englishKindLabels: Record<MapEntryKind, string> = {
  unit: 'Learning unit', cluster: 'Section', motivation: 'Motivation', goal: 'Learning goal',
  assessment: 'Assessment', memory: 'Flashcards',
}

export const getKindLabels = (language: 'de' | 'en') => language === 'en' ? englishKindLabels : kindLabels
