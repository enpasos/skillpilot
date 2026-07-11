export const CANONICAL_GYMNASIUM_ROOT_ID = ''

export const LEGACY_HESSEN_GYMNASIUM_UPPER_ROOT_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_UPPER_MATH_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_UPPER_PHYSICS_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_LOWER_ROOT_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_LOWER_MATH_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_LOWER_PHYSICS_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID = ''
export const LEGACY_HESSEN_GYMNASIUM_LOWER_FRENCH_ID = ''

export const LEGACY_HESSEN_GYMNASIUM_UPPER_SUBJECTS: readonly { id: string; label: string }[] = Object.freeze([])
export const LEGACY_HESSEN_GYMNASIUM_LOWER_SUBJECTS: readonly { id: string; label: string }[] = Object.freeze([])
export const LEGACY_HESSEN_GYMNASIUM_UPPER_IDS: ReadonlySet<string> = new Set()
export const LEGACY_HESSEN_GYMNASIUM_LOWER_IDS: ReadonlySet<string> = new Set()
export const COMPATIBILITY_ONLY_BAVARIA_GYMNASIUM_IDS: ReadonlySet<string> = new Set()
export const LEGACY_BAVARIA_GYMNASIUM_IDS: ReadonlySet<string> = new Set()

interface CurriculumDisplayTitleInput {
  curriculumId?: string
  title?: string
  description?: string
  subject?: string
  language?: string
  compatibilityOnly?: boolean
  legacyHiddenByDefault?: boolean
}

export const isLegacyHessenGymnasiumUpper = () => false
export const isLegacyHessenGymnasiumLower = () => false
export const isLegacyBavariaGymnasium = () => false
export const isRepositoryGymnasiumFramework = () => false

export const isCompatibilityOnlyCurriculum = (
  _curriculumId?: string | null,
  compatibilityOnly?: boolean | null,
) => Boolean(compatibilityOnly)

export const isLegacyHiddenByDefaultCurriculum = (
  _curriculumId?: string | null,
  legacyHiddenByDefault?: boolean | null,
) => Boolean(legacyHiddenByDefault)

export const getCurriculumDisplayTitle = ({
  curriculumId,
  title,
  description,
  subject,
  language,
  compatibilityOnly,
  legacyHiddenByDefault,
}: CurriculumDisplayTitleInput) => {
  const base = title || description || subject || curriculumId || ''
  if (!base) return ''
  if (compatibilityOnly) {
    return language === 'de' ? `${base} (Kompatibilitätsansicht)` : `${base} (Compatibility view)`
  }
  if (legacyHiddenByDefault) {
    return language === 'de' ? `${base} (Legacy-Ansicht)` : `${base} (Legacy view)`
  }
  return base
}

export const getBavariaLegacySubjectEnglishLabel = () => null
export const getBavariaLegacyCanonicalSubjectLabelDe = (subject?: string | null) => subject ?? null
export const getBavariaLegacySubjectLabelByCurriculumId = () => null
