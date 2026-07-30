import type { PersonalizationOption } from './personalCurriculumEditorApi'
import {
  formatRootFilterLabel,
  type LabelLanguage,
} from './filterLabels'

const isJurisdictionOption = (option: PersonalizationOption) => (
  option.groupId === 'jurisdiction'
  || option.stageId === 'jurisdiction'
)

export const getPersonalizationOptionLabel = (
  option: PersonalizationOption,
  language: LabelLanguage,
): string => {
  if (option.kind === 'COMPLETE_GROUP') return ''
  if (option.kind === 'SCOPE_VALUE') {
    return option.scopeLabel ?? option.scopeValue ?? ''
  }
  if (isJurisdictionOption(option)) {
    if (option.filterId) {
      return formatRootFilterLabel({
        id: option.filterId,
        label: option.filterLabel ?? undefined,
      }, language)
    }
    return option.filterLabel ?? option.filterId ?? ''
  }
  if (option.filterLabel) {
    return option.landscapeLabel
      ? `${option.landscapeLabel} – ${option.filterLabel}`
      : option.filterLabel
  }
  return option.landscapeLabel ?? ''
}
