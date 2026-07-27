import type { ClassSession } from '../trainerTypes'
import { CANONICAL_GYMNASIUM_ROOT_ID, isCompatibilityOnlyCurriculum } from './curriculumDisplay'
import { normalizeJurisdictionCode } from './jurisdictionMetadata'
import { applyDefaultGlobalStageScope } from './personalCurriculumStageScope'

const CANONICAL_GYMNASIUM_MATH_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const CANONICAL_GYMNASIUM_PHYSICS_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const CANONICAL_GYMNASIUM_CHEMISTRY_ID = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const CANONICAL_GYMNASIUM_BIOLOGY_ID = '08a43a1b-d97e-522c-9dfa-c950a493364e'
const CANONICAL_GYMNASIUM_INFORMATICS_ID = '7d51b38c-a149-5407-bddc-d2ce7878b020'
const CANONICAL_GYMNASIUM_HISTORY_ID = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const CANONICAL_GYMNASIUM_GERMAN_ID = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID = '51b60137-46e8-5498-973e-ea38bb32f327'
const CANONICAL_GYMNASIUM_ENGLISH_ID = 'c8c84073-46ae-57ec-898a-882d08d7a72f'
const CANONICAL_GYMNASIUM_FRENCH_ID = '96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977'
const CANONICAL_GYMNASIUM_LATIN_ID = '668cf206-941e-51f8-8704-3e8938631235'
const CANONICAL_GYMNASIUM_SPANISH_ID = '90eedebf-9ea8-5247-85dd-31c147f907c3'
const CANONICAL_GYMNASIUM_ITALIAN_ID = '25c6b527-10d6-5d92-9d76-fab23585f29b'
const CANONICAL_GYMNASIUM_RUSSIAN_ID = '242ba9bd-7ec7-5ec3-a15e-4f0f2b01aa37'
const CANONICAL_GYMNASIUM_POLISH_ID = 'f145785b-0c44-5246-af66-8a153d202cb9'
const CANONICAL_GYMNASIUM_CZECH_ID = '0900df4c-beeb-5542-86f9-bd479c94746a'
const CANONICAL_GYMNASIUM_GREEK_ID = '70a2cb55-127b-5c6e-b518-4a1c9f4f77a0'
const CANONICAL_GYMNASIUM_CHINESE_ID = '8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80'
const CANONICAL_GYMNASIUM_MUSIC_ID = 'f620c251-c1e1-41c1-b4e1-b10950b43608'
const CANONICAL_GYMNASIUM_ECONOMICS_ID = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'

const LEGACY_TO_CANONICAL_GYMNASIUM_LANDSCAPE_ID: Record<string, string> = {
  'bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da': CANONICAL_GYMNASIUM_ROOT_ID,
  '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3': CANONICAL_GYMNASIUM_MATH_ID,
  '24f2ca0f-b94a-444e-bb70-677cb6f85c02': CANONICAL_GYMNASIUM_PHYSICS_ID,
  '2f391ba2-ba1e-40e4-a8d2-dff049516c13': CANONICAL_GYMNASIUM_CHEMISTRY_ID,
  '3e56aa75-c76c-4de5-883b-0aac98297846': CANONICAL_GYMNASIUM_BIOLOGY_ID,
  'c1a02ddd-736d-4975-920b-18b03aff147f': CANONICAL_GYMNASIUM_INFORMATICS_ID,
  'bdc89685-73d3-446c-af5a-eaf642c07463': CANONICAL_GYMNASIUM_HISTORY_ID,
  'f1ba2118-853f-4aa0-bef5-4f749bc621ed': CANONICAL_GYMNASIUM_GERMAN_ID,
  '1d0e9f8f-0087-49e4-8ea2-976e5a89b165': CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID,
  'bc2124fa-2974-46cc-85e7-2392e61250e1': CANONICAL_GYMNASIUM_ENGLISH_ID,
  '30acd190-609c-4109-8ee7-06fc5594af19': CANONICAL_GYMNASIUM_FRENCH_ID,
  'fe28bda8-03f3-4c4a-8286-7fcfce4eeac1': CANONICAL_GYMNASIUM_LATIN_ID,
  '936efc61-a4d5-49fd-8694-085d1347db80': CANONICAL_GYMNASIUM_SPANISH_ID,
  'c7209caa-18e5-4dd8-b68f-dd86e228d045': CANONICAL_GYMNASIUM_GREEK_ID,
  '7651cbe2-5fb8-464d-b0c4-3e830cda41dd': CANONICAL_GYMNASIUM_CHINESE_ID,
  'a8c23058-6998-49f2-9f3b-a85e951d5ab0': CANONICAL_GYMNASIUM_MUSIC_ID,
  'a334a745-1d67-4e1d-86a5-dadc04f144d2': CANONICAL_GYMNASIUM_ECONOMICS_ID,
  'f050ee48-6891-4f83-995f-0f8be5e31b7f': CANONICAL_GYMNASIUM_ROOT_ID,
  'b167b4cd-4b78-4c84-a721-6b2adbbcab3c': CANONICAL_GYMNASIUM_MATH_ID,
  '996d097a-cac2-4b5f-979a-b3a0b9803265': CANONICAL_GYMNASIUM_PHYSICS_ID,
  'bea90c22-b9c5-4c0c-9b10-89d875f50772': CANONICAL_GYMNASIUM_CHEMISTRY_ID,
  '71438941-0ceb-46ee-ad31-773cee700779': CANONICAL_GYMNASIUM_BIOLOGY_ID,
  '762de708-85fa-4324-958e-56002a318f7f': CANONICAL_GYMNASIUM_FRENCH_ID,
  '12322e3f-f351-5d40-b4ea-4a13d7e15854': CANONICAL_GYMNASIUM_ROOT_ID,
  'c1600692-e543-5cf2-a399-6bd96e6b817f': CANONICAL_GYMNASIUM_MATH_ID,
  '42c2f7e3-91b4-5de8-bef0-d563440e9d52': CANONICAL_GYMNASIUM_PHYSICS_ID,
  'ff1ca997-b6cc-5ece-8e13-5498b4bbf808': CANONICAL_GYMNASIUM_CHEMISTRY_ID,
  '357a7003-b636-570e-a0bd-6bb63518d2f6': CANONICAL_GYMNASIUM_BIOLOGY_ID,
  '40744ec5-7de1-5e41-9fc2-a1e774721644': CANONICAL_GYMNASIUM_CHINESE_ID,
  '1af3eba8-749f-5359-8f12-18f87b13616c': CANONICAL_GYMNASIUM_INFORMATICS_ID,
  '01c2ba7a-ebd4-5840-bc09-123d7b31c914': CANONICAL_GYMNASIUM_HISTORY_ID,
  '05f1cd27-5a58-5415-8fda-d4807067f70a': CANONICAL_GYMNASIUM_GERMAN_ID,
  '9da8e86b-92dc-5ba0-827e-339400af2b38': CANONICAL_GYMNASIUM_ENGLISH_ID,
  '22703293-7307-5ad2-b158-efe6ae28c7c3': CANONICAL_GYMNASIUM_GREEK_ID,
  '4959d7df-e430-5c1d-bb7b-873d6252a27f': CANONICAL_GYMNASIUM_ECONOMICS_ID,
  '486a8278-39b2-5450-96f8-1076a47b655b': CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID,
  'c7eeaaa4-7c23-5ab7-8643-b7a03760cd6b': CANONICAL_GYMNASIUM_LATIN_ID,
  'a00d70bf-3d3c-58fc-af4f-881b29635c2e': CANONICAL_GYMNASIUM_MUSIC_ID,
  '49aefe0c-f365-5f30-b84f-b9a7699e4f2c': CANONICAL_GYMNASIUM_FRENCH_ID,
  '8dba4715-f75e-5339-9e99-02236e4b80dd': CANONICAL_GYMNASIUM_SPANISH_ID,
  'c7643536-1163-50d8-86a6-9645c8fd3e25': CANONICAL_GYMNASIUM_ITALIAN_ID,
  '2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7': CANONICAL_GYMNASIUM_RUSSIAN_ID,
  '21148204-794c-515d-ae20-c4d5cd4e56d8': CANONICAL_GYMNASIUM_POLISH_ID,
  '097f3667-2488-57b2-a3e0-2cb334e422a2': CANONICAL_GYMNASIUM_CZECH_ID,
}

export const mapLegacyGymnasiumLandscapeIdToCanonical = (landscapeId?: string | null) => {
  if (!landscapeId) return ''
  return LEGACY_TO_CANONICAL_GYMNASIUM_LANDSCAPE_ID[landscapeId] ?? landscapeId
}

export const normalizeTrainerLandscapeId = (landscapeId?: string | null) => {
  const mappedLandscapeId = mapLegacyGymnasiumLandscapeIdToCanonical(landscapeId)
  if (!mappedLandscapeId) return ''
  return isCompatibilityOnlyCurriculum(mappedLandscapeId, null) ? '' : mappedLandscapeId
}

const normalizeClassName = (value?: string | null) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const inferCanonicalLandscapeIdFromClassName = (className?: string | null) => {
  const normalizedName = normalizeClassName(className)
  if (!normalizedName) return ''

  if (normalizedName.includes('mathe') || normalizedName.includes('mathematik')) return CANONICAL_GYMNASIUM_MATH_ID
  if (normalizedName.includes('physik')) return CANONICAL_GYMNASIUM_PHYSICS_ID
  if (normalizedName.includes('chemie')) return CANONICAL_GYMNASIUM_CHEMISTRY_ID
  if (normalizedName.includes('biologie') || normalizedName.includes('bio ' ) || normalizedName === 'bio') return CANONICAL_GYMNASIUM_BIOLOGY_ID
  if (normalizedName.includes('informatik')) return CANONICAL_GYMNASIUM_INFORMATICS_ID
  if (normalizedName.includes('geschichte')) return CANONICAL_GYMNASIUM_HISTORY_ID
  if (normalizedName.includes('deutsch')) return CANONICAL_GYMNASIUM_GERMAN_ID
  if (normalizedName.includes('englisch')) return CANONICAL_GYMNASIUM_ENGLISH_ID
  if (normalizedName.includes('franzosisch') || normalizedName.includes('franzoesisch')) return CANONICAL_GYMNASIUM_FRENCH_ID
  if (normalizedName.includes('latein')) return CANONICAL_GYMNASIUM_LATIN_ID
  if (normalizedName.includes('spanisch')) return CANONICAL_GYMNASIUM_SPANISH_ID
  if (normalizedName.includes('italienisch')) return CANONICAL_GYMNASIUM_ITALIAN_ID
  if (normalizedName.includes('russisch')) return CANONICAL_GYMNASIUM_RUSSIAN_ID
  if (normalizedName.includes('polnisch')) return CANONICAL_GYMNASIUM_POLISH_ID
  if (normalizedName.includes('tschechisch')) return CANONICAL_GYMNASIUM_CZECH_ID
  if (normalizedName.includes('griechisch')) return CANONICAL_GYMNASIUM_GREEK_ID
  if (normalizedName.includes('chinesisch')) return CANONICAL_GYMNASIUM_CHINESE_ID
  if (normalizedName.includes('musik')) return CANONICAL_GYMNASIUM_MUSIC_ID
  if (normalizedName.includes('politik') || normalizedName.includes('powi')) return CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID
  if (normalizedName.includes('wirtschaft')) return CANONICAL_GYMNASIUM_ECONOMICS_ID
  if (normalizedName.includes('gymnasium')) return CANONICAL_GYMNASIUM_ROOT_ID

  return ''
}

const normalizeFilterId = (value?: string | null) => {
  const normalized = (value ?? '').trim().toUpperCase()
  return normalized.length > 0 ? normalized : undefined
}

const inferCourseProfileFilterIdFromClassName = (className?: string | null) => {
  const normalizedName = normalizeClassName(className)
  if (!normalizedName) return undefined
  if (/\b(lk|leistungskurs)\b/.test(normalizedName)) return 'LK'
  if (/\b(gk|grundkurs)\b/.test(normalizedName)) return 'GK'
  return undefined
}

const inferJurisdictionFilterId = (filterId?: string | null) => {
  const normalized = normalizeFilterId(filterId)
  if (!normalized || normalized === 'ALL') return 'ALL'
  return normalizeJurisdictionCode(normalized) ?? 'ALL'
}

const isCanonicalGymnasiumLandscapeId = (landscapeId?: string | null) =>
  !!landscapeId && (
    landscapeId === CANONICAL_GYMNASIUM_ROOT_ID
    || landscapeId === CANONICAL_GYMNASIUM_MATH_ID
    || landscapeId === CANONICAL_GYMNASIUM_PHYSICS_ID
    || landscapeId === CANONICAL_GYMNASIUM_CHEMISTRY_ID
    || landscapeId === CANONICAL_GYMNASIUM_BIOLOGY_ID
    || landscapeId === CANONICAL_GYMNASIUM_INFORMATICS_ID
    || landscapeId === CANONICAL_GYMNASIUM_HISTORY_ID
    || landscapeId === CANONICAL_GYMNASIUM_GERMAN_ID
    || landscapeId === CANONICAL_GYMNASIUM_POLITICS_ECONOMICS_ID
    || landscapeId === CANONICAL_GYMNASIUM_ENGLISH_ID
    || landscapeId === CANONICAL_GYMNASIUM_FRENCH_ID
    || landscapeId === CANONICAL_GYMNASIUM_LATIN_ID
    || landscapeId === CANONICAL_GYMNASIUM_SPANISH_ID
    || landscapeId === CANONICAL_GYMNASIUM_ITALIAN_ID
    || landscapeId === CANONICAL_GYMNASIUM_RUSSIAN_ID
    || landscapeId === CANONICAL_GYMNASIUM_POLISH_ID
    || landscapeId === CANONICAL_GYMNASIUM_CZECH_ID
    || landscapeId === CANONICAL_GYMNASIUM_GREEK_ID
    || landscapeId === CANONICAL_GYMNASIUM_CHINESE_ID
    || landscapeId === CANONICAL_GYMNASIUM_MUSIC_ID
    || landscapeId === CANONICAL_GYMNASIUM_ECONOMICS_ID
  )

const buildCanonicalGymnasiumPersonalConfig = (
  landscapeId: string,
  className?: string | null,
  activeFilter?: string | null,
) => {
  const inferredCourseProfile = (() => {
    const normalizedActiveFilter = normalizeFilterId(activeFilter)
    if (normalizedActiveFilter === 'GK' || normalizedActiveFilter === 'LK' || normalizedActiveFilter === 'ALL') {
      return normalizedActiveFilter
    }
    return inferCourseProfileFilterIdFromClassName(className)
  })()
  const rootFilterId = inferJurisdictionFilterId(activeFilter)
  const initialConfig = {
    [CANONICAL_GYMNASIUM_ROOT_ID]: {
      selected: true,
      filterId: rootFilterId,
    },
    [landscapeId]: {
      selected: true,
      ...(inferredCourseProfile ? { filterId: inferredCourseProfile } : {}),
    },
  } satisfies NonNullable<ClassSession['personalConfig']>
  const scoped = applyDefaultGlobalStageScope(initialConfig).config

  return {
    personalConfig: scoped,
    rootLandscapeId: CANONICAL_GYMNASIUM_ROOT_ID,
  }
}

export const migrateTrainerClassSession = (session: ClassSession): ClassSession => {
  const normalizedLandscapeId = normalizeTrainerLandscapeId(session.landscapeId)
  const inferredLandscapeId = normalizedLandscapeId || inferCanonicalLandscapeIdFromClassName(session.name)
  if (!inferredLandscapeId) {
    return session
  }

  const next: ClassSession = {
    ...session,
    landscapeId: inferredLandscapeId,
    currentGoalId: undefined,
  }

  if (isCanonicalGymnasiumLandscapeId(inferredLandscapeId)) {
    const canonicalConfig = buildCanonicalGymnasiumPersonalConfig(
      inferredLandscapeId,
      session.name,
      session.activeFilter,
    )
    if (!session.personalConfig || !session.rootLandscapeId) {
      next.personalConfig = canonicalConfig.personalConfig
      next.rootLandscapeId = canonicalConfig.rootLandscapeId
    } else if (session.rootLandscapeId === CANONICAL_GYMNASIUM_ROOT_ID) {
      const rootConfig = session.personalConfig[CANONICAL_GYMNASIUM_ROOT_ID]
      if (rootConfig?.durationModel) {
        const nextRootConfig = { ...rootConfig }
        delete nextRootConfig.durationModel
        next.personalConfig = {
          ...session.personalConfig,
          [CANONICAL_GYMNASIUM_ROOT_ID]: {
            ...nextRootConfig,
            selected: nextRootConfig?.selected ?? true,
          },
        }
      }
    }
  }

  return next
}
