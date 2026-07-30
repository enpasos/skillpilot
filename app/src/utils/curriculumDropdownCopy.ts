import type { LabelLanguage } from './filterLabels'
import type { CurriculumQualityFilter } from './curriculumQualityTrafficLight'

export type CurriculumDropdownCategory = 'SCHOOL' | 'UNI' | 'OTHER'

export interface CurriculumDropdownCopy {
  categoryLabels: Record<CurriculumDropdownCategory, string>
  compatibilityGroupLabel: string
  legacyGroupLabel: string
  qualityFilterLabel: string
  qualityFilterOptions: Record<CurriculumQualityFilter, string>
}

export const getCurriculumDropdownCopy = (
  language: LabelLanguage,
): CurriculumDropdownCopy => (
  language === 'de'
    ? {
        categoryLabels: {
          SCHOOL: 'Schule',
          UNI: 'Universität & Hochschule',
          OTHER: 'Sprachen & Weiterbildung',
        },
        compatibilityGroupLabel: 'Kompatibilitätsansichten',
        legacyGroupLabel: 'Legacy-Ansichten',
        qualityFilterLabel: 'Qualitätsampel',
        qualityFilterOptions: {
          green: 'Menschliche QS',
          orange: 'Maschinelle QS',
          red: 'Experimentell',
          all: 'Alle',
        },
      }
    : {
        categoryLabels: {
          SCHOOL: 'School',
          UNI: 'University & Higher Ed',
          OTHER: 'Languages & Other',
        },
        compatibilityGroupLabel: 'Compatibility views',
        legacyGroupLabel: 'Legacy views',
        qualityFilterLabel: 'Quality status',
        qualityFilterOptions: {
          green: 'Human QA',
          orange: 'Automated QA',
          red: 'Experimental',
          all: 'All',
        },
      }
)
