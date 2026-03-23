import type { UiGoal } from '../goalTypes'

const HESSEN_GYMNASIUM_LOWER_ROOT_ID = 'f050ee48-6891-4f83-995f-0f8be5e31b7f'
const HESSEN_GYMNASIUM_LOWER_MATH_ID = 'b167b4cd-4b78-4c84-a721-6b2adbbcab3c'
const HESSEN_GYMNASIUM_LOWER_PHYSICS_ID = '996d097a-cac2-4b5f-979a-b3a0b9803265'
const HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID = 'bea90c22-b9c5-4c0c-9b10-89d875f50772'
const HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID = '71438941-0ceb-46ee-ad31-773cee700779'
const HESSEN_GYMNASIUM_LOWER_FRENCH_ID = '762de708-85fa-4324-958e-56002a318f7f'

import { LEGACY_HESSEN_GYMNASIUM_LOWER_IDS } from './curriculumDisplay'

type PersonalCurriculumConfigLike = Record<string, { selected: boolean; filterId?: string }>

export type HessenLowerSelection = {
  mathSelected: boolean
  physicsSelected: boolean
  chemistrySelected: boolean
  biologySelected: boolean
  frenchSelected: boolean
  retirementEligible: boolean
}

export const inferLegacyHessenLowerSelection = (
  selectedCurriculum: string | null | undefined,
  personalConfig: PersonalCurriculumConfigLike,
  plannedGoals: Set<string>,
  activeGoalId: string | null,
  goalIndexAll: Map<string, UiGoal>,
): HessenLowerSelection => {
  if (!selectedCurriculum || !LEGACY_HESSEN_GYMNASIUM_LOWER_IDS.has(selectedCurriculum)) {
    return {
      mathSelected: false,
      physicsSelected: false,
      chemistrySelected: false,
      biologySelected: false,
      frenchSelected: false,
      retirementEligible: false,
    }
  }

  const goalBelongsToLandscape = (goalId: string | null | undefined, landscapeId: string) =>
    !!goalId && goalIndexAll.get(goalId)?.landscapeId === landscapeId

  let mathSelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_MATH_ID
  let physicsSelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_PHYSICS_ID
  let chemistrySelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID
  let biologySelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID
  let frenchSelected = selectedCurriculum === HESSEN_GYMNASIUM_LOWER_FRENCH_ID

  if (selectedCurriculum === HESSEN_GYMNASIUM_LOWER_ROOT_ID) {
    const plannedGoalIds = Array.from(plannedGoals)
    mathSelected = personalConfig[HESSEN_GYMNASIUM_LOWER_MATH_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_MATH_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_MATH_ID)
    physicsSelected = personalConfig[HESSEN_GYMNASIUM_LOWER_PHYSICS_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_PHYSICS_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_PHYSICS_ID)
    chemistrySelected = personalConfig[HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID)
    biologySelected = personalConfig[HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID)
    frenchSelected = personalConfig[HESSEN_GYMNASIUM_LOWER_FRENCH_ID]?.selected === true
      || plannedGoalIds.some((goalId) => goalBelongsToLandscape(goalId, HESSEN_GYMNASIUM_LOWER_FRENCH_ID))
      || goalBelongsToLandscape(activeGoalId, HESSEN_GYMNASIUM_LOWER_FRENCH_ID)
  }

  if (!mathSelected && !physicsSelected && !chemistrySelected && !biologySelected && !frenchSelected) {
    mathSelected = true
    physicsSelected = true
    chemistrySelected = true
    biologySelected = true
    frenchSelected = true
  }

  if (physicsSelected) {
    mathSelected = true
  }

  return {
    mathSelected,
    physicsSelected,
    chemistrySelected,
    biologySelected,
    frenchSelected,
    retirementEligible: mathSelected || physicsSelected || chemistrySelected || biologySelected || frenchSelected,
  }
}
