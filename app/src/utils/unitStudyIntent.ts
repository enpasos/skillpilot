/** Per-tab navigation intent; this is never a visit receipt or a learner result. */
export interface UnitStudyIntent {
  learnerId: string
  curriculumId: string
  scopeKey: string
  originGoalId: string
  orientationGoalId: string
  targetGoalId: string
  routeSettled: boolean
}

type IntentStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export const UNIT_STUDY_INTENT_KEY = 'skillpilot:unit-study-navigation:v1'
let volatileIntent: UnitStudyIntent | null = null
const tabStorage = (): IntentStorage | undefined => {
  try { return typeof window === 'undefined' ? undefined : window.sessionStorage } catch { return undefined }
}

export function saveUnitStudyIntent(intent: UnitStudyIntent, storage = tabStorage()): void {
  volatileIntent = intent
  try { storage?.setItem(UNIT_STUDY_INTENT_KEY, JSON.stringify(intent)) } catch { /* Keep the live tab's intent if storage is unavailable. */ }
}

export function clearUnitStudyIntent(storage = tabStorage()): void {
  volatileIntent = null
  try { storage?.removeItem(UNIT_STUDY_INTENT_KEY) } catch { /* No result or backend state depends on browser storage. */ }
}

export function readUnitStudyIntent(storage = tabStorage()): UnitStudyIntent | null {
  if (volatileIntent) return volatileIntent
  try {
    const raw = storage?.getItem(UNIT_STUDY_INTENT_KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)
      || typeof value.routeSettled !== 'boolean'
      || ['learnerId', 'curriculumId', 'scopeKey', 'originGoalId', 'orientationGoalId', 'targetGoalId']
        .some(key => typeof value[key] !== 'string' || !value[key].trim() || value[key].length > 50_000)) {
      clearUnitStudyIntent(storage)
      return null
    }
    volatileIntent = value
    return value
  } catch { clearUnitStudyIntent(storage); return null }
}

export function unitStudyIntentDecision(intent: UnitStudyIntent, context: {
  learnerId: string; curriculumId: string; routeGoalId: string; scopeKey?: string
}): 'pending' | 'settled' | 'discard' {
  if (intent.learnerId !== context.learnerId || intent.curriculumId !== context.curriculumId
    || context.scopeKey !== undefined && intent.scopeKey !== context.scopeKey) return 'discard'
  if (context.routeGoalId === intent.orientationGoalId) return 'settled'
  // The source route may still render while the intentional navigation commits.
  if (!intent.routeSettled && (!context.routeGoalId || context.routeGoalId === intent.originGoalId)) return 'pending'
  return 'discard'
}
