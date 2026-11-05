import { canonicalJson, digest } from '../learningUnitsMathAuthoring'
import type { UnitDefinition } from './adapterTypes'

/** Exact signature definitions from the actual independent Batch A review. */
export function contentSignatures(input: { definition: UnitDefinition; normalTasksAndRubrics: unknown; localOwnDemandClasses: unknown }) {
  const definition = input.definition
  const hash = (value: unknown) => digest(canonicalJson(value))
  return {
    taskClaimSignatureSha256: hash({ ownGoalMeanings: definition.ownGoalMeanings, ownResolvedKinds: definition.ownResolvedKinds,
      assessmentClaims: definition.assessmentClaims, normalTasksAndRubrics: input.normalTasksAndRubrics }),
    ownDemandSignatureSha256: hash({ ...Object.fromEntries(['ownGoalIds', 'ownAssessmentGoalIds', 'ownRecallGoalIds',
      'ownOrientationGoalIds', 'requiredChildContractRefs', 'atomicPrerequisites'].map(key => [key, definition[key]])),
      localOwnDemandClasses: input.localOwnDemandClasses }),
    contentAndDemandSignatureSha256: hash({ definition: Object.fromEntries(Object.entries(definition).filter(([key]) => key !== 'sourceBinding')),
      normalTasksAndRubrics: input.normalTasksAndRubrics, localOwnDemandClasses: input.localOwnDemandClasses }),
  }
}
