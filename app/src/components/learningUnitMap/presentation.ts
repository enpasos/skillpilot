import type { MapEntryKind } from './types'

export const kindLabels: Record<MapEntryKind, string> = {
  unit: 'Lerneinheit', motivation: 'Motivation', goal: 'Fachziel',
  assessment: 'Prüfung', memory: 'Lernkarten',
}
