import type { LabelLanguage } from './filterLabels'

export type CurriculumDropdownCategory = 'SCHOOL' | 'UNI' | 'OTHER'

export interface CurriculumDropdownCopy {
  categoryLabels: Record<CurriculumDropdownCategory, string>
  recommendedGroupLabel: string
  compatibilityGroupLabel: string
  legacyGroupLabel: string
}

export const getCurriculumDropdownCopy = (
  language: LabelLanguage,
): CurriculumDropdownCopy => (
  language === 'de'
    ? {
        categoryLabels: {
          SCHOOL: 'Schule',
          UNI: 'Universitaet & Hochschule',
          OTHER: 'Sprachen & Weiterbildung',
        },
        recommendedGroupLabel: 'Empfohlene Curricula',
        compatibilityGroupLabel: 'Kompatibilitätsansichten',
        legacyGroupLabel: 'Legacy-Ansichten',
      }
    : {
        categoryLabels: {
          SCHOOL: 'School',
          UNI: 'University & Higher Ed',
          OTHER: 'Languages & Other',
        },
        recommendedGroupLabel: 'Recommended curricula',
        compatibilityGroupLabel: 'Compatibility views',
        legacyGroupLabel: 'Legacy views',
      }
)
