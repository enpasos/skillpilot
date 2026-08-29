export const CANONICAL_GYMNASIUM_ROOT_ID = ''

interface CurriculumDisplayTitleInput {
  curriculumId?: string
  title?: string
  description?: string
  subject?: string
  language?: string
  compatibilityOnly?: boolean
  legacyHiddenByDefault?: boolean
}

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
