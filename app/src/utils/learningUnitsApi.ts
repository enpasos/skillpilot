import type { MasteryMap } from '../learnerTypes'
import { completionWaiversForTree, type CompletionTreeWaiver, type LevelCompletion } from './levelCompletionApi'

export interface LearningUnitReadModel {
  contractId: string
  calculationStatus?: 'unavailable'
  revision: string
  programUnitId: string
  title: Record<string, string>
  promise: Record<string, string>
  introduction: Record<string, string>
  ownGoalIds: string[]
  requiredChildContractRefs: { contractId: string; revision: string }[]
  ownAssessmentGoalIds: string[]
  ownRecallGoalIds: string[]
  complete: boolean
  targetCount: number
  explicitTargetCount: number
  recognizedTargetCount: number
  ownRecognizedGoalIds: string[]
  pendingGoalIds: string[]
}

export interface LearningUnitsReadModel {
  calculationStatus: 'valid' | 'partial' | 'unavailable'
  semantics: 'global-unit-recognition-v1'
  contractDigest: string | null
  recognizedGoalIds: string[]
  voluntaryGoalIds: string[]
  units: LearningUnitReadModel[]
}

const invalid = (): never => { throw new Error('Invalid learning-unit response') }
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid()
  return value as Record<string, unknown>
}
const text = (value: unknown): string => typeof value === 'string' && value.trim() ? value : invalid()
const texts = (value: unknown): string[] => {
  if (!Array.isArray(value)) return invalid()
  const result = value.map(text)
  if (new Set(result).size !== result.length) return invalid()
  return result
}
const localized = (value: unknown): Record<string, string> => Object.fromEntries(
  Object.entries(object(value)).map(([key, value]) => [key, text(value)]),
)
const count = (value: unknown): number => Number.isSafeInteger(value) && Number(value) >= 0 ? Number(value) : invalid()

/** Validate the backend snapshot without deriving recognition from local edges or focus. */
export const parseLearningUnits = (value: unknown): LearningUnitsReadModel | null => {
  if (value === undefined || value === null) return null
  const source = object(value)
  const status = source.calculationStatus
  if (source.semantics !== 'global-unit-recognition-v1'
    || !['valid', 'partial', 'unavailable'].includes(String(status)) || !Array.isArray(source.units)) return invalid()
  const result: LearningUnitsReadModel = {
    calculationStatus: status as LearningUnitsReadModel['calculationStatus'],
    semantics: 'global-unit-recognition-v1', contractDigest: status === 'unavailable' && source.contractDigest == null ? null : text(source.contractDigest),
    recognizedGoalIds: texts(source.recognizedGoalIds),
    voluntaryGoalIds: source.voluntaryGoalIds === undefined ? [] : texts(source.voluntaryGoalIds),
    units: source.units.map(value => {
      const unit = object(value)
      if (typeof unit.complete !== 'boolean' || (unit.calculationStatus !== undefined && unit.calculationStatus !== 'unavailable')) return invalid()
      const parsed: LearningUnitReadModel = {
        ...(unit.calculationStatus === undefined ? {} : { calculationStatus: 'unavailable' as const }),
        contractId: text(unit.contractId), revision: text(unit.revision), programUnitId: text(unit.programUnitId),
        title: localized(unit.title), promise: localized(unit.promise), introduction: localized(unit.introduction),
        ownGoalIds: texts(unit.ownGoalIds), requiredChildContractRefs: (() => {
          if (!Array.isArray(unit.requiredChildContractRefs)) return invalid()
          const references = unit.requiredChildContractRefs.map(value => {
            const ref = object(value)
            return { contractId: text(ref.contractId), revision: text(ref.revision) }
          })
          if (new Set(references.map(ref => `${ref.contractId}@${ref.revision}`)).size !== references.length) return invalid()
          return references
        })(),
        ownAssessmentGoalIds: texts(unit.ownAssessmentGoalIds), ownRecallGoalIds: texts(unit.ownRecallGoalIds),
        complete: unit.complete, targetCount: count(unit.targetCount), explicitTargetCount: count(unit.explicitTargetCount),
        recognizedTargetCount: count(unit.recognizedTargetCount), ownRecognizedGoalIds: texts(unit.ownRecognizedGoalIds),
        pendingGoalIds: texts(unit.pendingGoalIds),
      }
      if (parsed.explicitTargetCount + parsed.recognizedTargetCount > parsed.targetCount) return invalid()
      return parsed
    }),
  }
  if (status === 'unavailable' && (result.recognizedGoalIds.length || result.voluntaryGoalIds.length)) return invalid()
  if (result.voluntaryGoalIds.some(id => !result.recognizedGoalIds.includes(id))) return invalid()
  return result
}

export const unavailableLearningUnits = (): LearningUnitsReadModel => ({
  calculationStatus: 'unavailable', semantics: 'global-unit-recognition-v1', contractDigest: null,
  recognizedGoalIds: [], voluntaryGoalIds: [], units: [],
})

/** Presentation-only union. Explicit mastery remains separate for edits, exports and dates. */
export const effectiveMasteryFromSnapshot = (mastery: MasteryMap, snapshot: LearningUnitsReadModel | null): MasteryMap => {
  if (!snapshot || snapshot.calculationStatus === 'unavailable') return mastery
  const result = { ...mastery }
  for (const id of snapshot.recognizedGoalIds) result[id] = 1
  return result
}

export const learningUnitText = (values: Record<string, string>, language: 'de' | 'en'): string => (
  values[language] ?? values.de ?? values.en ?? Object.values(values)[0] ?? ''
)

/** The backend already removes legacy waivers for governed learning-unit targets.
 * Keep its remaining section waivers, including other subjects, alongside global I.
 */
export const learningCompletionAnnotations = (
  completion: LevelCompletion | null, units: LearningUnitsReadModel | null, stale: boolean,
): ReadonlyMap<string, CompletionTreeWaiver> => {
  const annotations = new Map(completionWaiversForTree(completion, stale))
  if (stale || !units || units.calculationStatus === 'unavailable') return annotations
  for (const id of units.recognizedGoalIds) {
    const unit = units.units.find(unit => unit.ownRecognizedGoalIds.includes(id))
    annotations.set(id, { reason: 'recognized', sectionTitle: unit?.title ?? {}, assessments: [] })
  }
  return annotations
}
