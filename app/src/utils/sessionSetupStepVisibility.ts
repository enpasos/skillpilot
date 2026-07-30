export interface LearnerSetupStepState {
  hasSkillpilotId: boolean
  idStepComplete: boolean
  personalCurriculumEditorEnabled: boolean
  personalCurriculumReady: boolean
}

export interface LearnerSetupStepVisibility {
  curriculum: boolean
  personalCurriculum: boolean
  start: boolean
}

export const getLearnerSetupStepVisibility = ({
  hasSkillpilotId,
  idStepComplete,
  personalCurriculumEditorEnabled,
  personalCurriculumReady,
}: LearnerSetupStepState): LearnerSetupStepVisibility => {
  const curriculum = hasSkillpilotId && idStepComplete
  const personalCurriculum = curriculum && personalCurriculumEditorEnabled
  const start = personalCurriculum && personalCurriculumReady

  return {
    curriculum,
    personalCurriculum,
    start,
  }
}
