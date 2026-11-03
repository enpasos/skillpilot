import {
  getLearnerSetupStepVisibility,
  type LearnerSetupStepState,
  type LearnerSetupStepVisibility,
} from './sessionSetupStepVisibility'

const assertVisibility = (
  state: LearnerSetupStepState,
  expected: LearnerSetupStepVisibility,
  message: string,
) => {
  const actual = getLearnerSetupStepVisibility(state)
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    )
  }
}

const hiddenSteps: LearnerSetupStepVisibility = {
  curriculum: false,
  personalCurriculum: false,
  start: false,
}

assertVisibility({
  hasSkillpilotId: false,
  idStepComplete: false,
  personalCurriculumEditorEnabled: false,
  personalCurriculumReady: false,
}, hiddenSteps, 'only the ID step is visible initially')

assertVisibility({
  hasSkillpilotId: true,
  idStepComplete: false,
  personalCurriculumEditorEnabled: false,
  personalCurriculumReady: false,
}, hiddenSteps, 'entering an ID alone does not reveal future steps')

assertVisibility({
  hasSkillpilotId: true,
  idStepComplete: true,
  personalCurriculumEditorEnabled: false,
  personalCurriculumReady: false,
}, {
  curriculum: true,
  personalCurriculum: false,
  start: false,
}, 'confirming the ID reveals only the curriculum step')

assertVisibility({
  hasSkillpilotId: true,
  idStepComplete: true,
  personalCurriculumEditorEnabled: true,
  personalCurriculumReady: false,
}, {
  curriculum: true,
  personalCurriculum: true,
  start: false,
}, 'confirming the curriculum reveals only the personal curriculum step')

assertVisibility({
  hasSkillpilotId: true,
  idStepComplete: true,
  personalCurriculumEditorEnabled: true,
  personalCurriculumReady: true,
}, {
  curriculum: true,
  personalCurriculum: true,
  start: true,
}, 'completing the personal curriculum reveals the start step')

assertVisibility({
  hasSkillpilotId: true,
  idStepComplete: true,
  personalCurriculumEditorEnabled: false,
  personalCurriculumReady: true,
}, {
  curriculum: true,
  personalCurriculum: false,
  start: false,
}, 'an inconsistent downstream state never skips the curriculum boundary')

console.log('session setup step visibility tests passed')
