export const CANONICAL_GYMNASIUM_ROOT_ID = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'

export const LEGACY_HESSEN_GYMNASIUM_UPPER_IDS = new Set([
  'bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da',
  '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3',
  '24f2ca0f-b94a-444e-bb70-677cb6f85c02',
  '2f391ba2-ba1e-40e4-a8d2-dff049516c13',
  '3e56aa75-c76c-4de5-883b-0aac98297846',
  'c1a02ddd-736d-4975-920b-18b03aff147f',
  'bdc89685-73d3-446c-af5a-eaf642c07463',
  'f1ba2118-853f-4aa0-bef5-4f749bc621ed',
  '1d0e9f8f-0087-49e4-8ea2-976e5a89b165',
  'bc2124fa-2974-46cc-85e7-2392e61250e1',
  '30acd190-609c-4109-8ee7-06fc5594af19',
  'fe28bda8-03f3-4c4a-8286-7fcfce4eeac1',
  '936efc61-a4d5-49fd-8694-085d1347db80',
  'c7209caa-18e5-4dd8-b68f-dd86e228d045',
  '7651cbe2-5fb8-464d-b0c4-3e830cda41dd',
  'a8c23058-6998-49f2-9f3b-a85e951d5ab0',
  'a334a745-1d67-4e1d-86a5-dadc04f144d2',
])

export const LEGACY_HESSEN_GYMNASIUM_LOWER_IDS = new Set([
  'f050ee48-6891-4f83-995f-0f8be5e31b7f',
  'b167b4cd-4b78-4c84-a721-6b2adbbcab3c',
  '996d097a-cac2-4b5f-979a-b3a0b9803265',
  'bea90c22-b9c5-4c0c-9b10-89d875f50772',
  '71438941-0ceb-46ee-ad31-773cee700779',
  '762de708-85fa-4324-958e-56002a318f7f',
])

export const COMPATIBILITY_ONLY_BAVARIA_GYMNASIUM_IDS = new Set([
  'c1600692-e543-5cf2-a399-6bd96e6b817f',
  '42c2f7e3-91b4-5de8-bef0-d563440e9d52',
])

export const LEGACY_BAVARIA_GYMNASIUM_IDS = new Set([
  '12322e3f-f351-5d40-b4ea-4a13d7e15854',
])

interface CurriculumDisplayTitleInput {
  curriculumId?: string
  title?: string
  description?: string
  subject?: string
  language?: string
  compatibilityOnly?: boolean
  legacyHiddenByDefault?: boolean
}

export const isLegacyHessenGymnasiumUpper = (curriculumId?: string | null) =>
  !!curriculumId && LEGACY_HESSEN_GYMNASIUM_UPPER_IDS.has(curriculumId)

export const isLegacyHessenGymnasiumLower = (curriculumId?: string | null) =>
  !!curriculumId && LEGACY_HESSEN_GYMNASIUM_LOWER_IDS.has(curriculumId)

export const isLegacyBavariaGymnasium = (curriculumId?: string | null) =>
  !!curriculumId && LEGACY_BAVARIA_GYMNASIUM_IDS.has(curriculumId)

export const isCompatibilityOnlyCurriculum = (
  curriculumId?: string | null,
  compatibilityOnly?: boolean | null,
) => Boolean(compatibilityOnly)
  || isLegacyHessenGymnasiumUpper(curriculumId)
  || (!!curriculumId && COMPATIBILITY_ONLY_BAVARIA_GYMNASIUM_IDS.has(curriculumId))

export const isLegacyHiddenByDefaultCurriculum = (
  curriculumId?: string | null,
  legacyHiddenByDefault?: boolean | null,
) => Boolean(legacyHiddenByDefault)
  || isLegacyHessenGymnasiumLower(curriculumId)
  || isLegacyBavariaGymnasium(curriculumId)

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
    return language === 'de' ? `${base} (Kompatibilitaetsansicht)` : `${base} (Compatibility view)`
  }
  if (isLegacyHiddenByDefaultCurriculum(curriculumId, legacyHiddenByDefault)) {
    return language === 'de' ? `${base} (Legacy-Ansicht)` : `${base} (Legacy view)`
  }
  return base
}
