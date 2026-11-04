import type { PersonalizationOption } from './personalCurriculumEditorApi'

export const orderedFocusCandidatesAfterSelection = (
  options: PersonalizationOption[],
  selectedOptionId: string,
) => {
  const selectedIndex = options.findIndex(
    (option) => option.optionId === selectedOptionId,
  )
  if (selectedIndex < 0) return options.map((option) => option.optionId)
  return [
    ...options.slice(selectedIndex + 1),
    ...options.slice(0, selectedIndex),
  ].map((option) => option.optionId)
}
