export const CANONICAL_GYMNASIUM_ROOT_ID = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'

interface CurriculumDisplayTitleInput {
  curriculumId?: string
  title?: string
  description?: string
  subject?: string
  language?: string
  compatibilityOnly?: boolean
  legacyHiddenByDefault?: boolean
}

export const isRepositoryGymnasiumFramework = (frameworkId?: string | null) =>
  Boolean(frameworkId?.startsWith('canonical-gymnasium'))

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
  if (!base) {
    return ''
  }
  if (isCompatibilityOnlyCurriculum(curriculumId, compatibilityOnly)) {
    return language === 'de' ? `${base} (Kompatibilitätsansicht)` : `${base} (Compatibility view)`
  }
  if (isLegacyHiddenByDefaultCurriculum(curriculumId, legacyHiddenByDefault)) {
    return language === 'de' ? `${base} (Legacy-Ansicht)` : `${base} (Legacy view)`
  }
  return base
}
