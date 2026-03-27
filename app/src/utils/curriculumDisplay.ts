export const CANONICAL_GYMNASIUM_ROOT_ID = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'

export const LEGACY_HESSEN_GYMNASIUM_UPPER_ROOT_ID = 'bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da'
export const LEGACY_HESSEN_GYMNASIUM_UPPER_MATH_ID = '2796fc7b-ba9d-446f-8f26-711dd6d8a9a3'
export const LEGACY_HESSEN_GYMNASIUM_UPPER_PHYSICS_ID = '24f2ca0f-b94a-444e-bb70-677cb6f85c02'
export const LEGACY_HESSEN_GYMNASIUM_LOWER_ROOT_ID = 'f050ee48-6891-4f83-995f-0f8be5e31b7f'
export const LEGACY_HESSEN_GYMNASIUM_LOWER_MATH_ID = 'b167b4cd-4b78-4c84-a721-6b2adbbcab3c'
export const LEGACY_HESSEN_GYMNASIUM_LOWER_PHYSICS_ID = '996d097a-cac2-4b5f-979a-b3a0b9803265'
export const LEGACY_HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID = 'bea90c22-b9c5-4c0c-9b10-89d875f50772'
export const LEGACY_HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID = '71438941-0ceb-46ee-ad31-773cee700779'
export const LEGACY_HESSEN_GYMNASIUM_LOWER_FRENCH_ID = '762de708-85fa-4324-958e-56002a318f7f'

export const LEGACY_HESSEN_GYMNASIUM_UPPER_SUBJECTS = [
  { id: LEGACY_HESSEN_GYMNASIUM_UPPER_MATH_ID, label: 'Mathematik' },
  { id: LEGACY_HESSEN_GYMNASIUM_UPPER_PHYSICS_ID, label: 'Physik' },
  { id: '2f391ba2-ba1e-40e4-a8d2-dff049516c13', label: 'Chemie' },
  { id: '3e56aa75-c76c-4de5-883b-0aac98297846', label: 'Biologie' },
  { id: 'c1a02ddd-736d-4975-920b-18b03aff147f', label: 'Informatik' },
  { id: 'bdc89685-73d3-446c-af5a-eaf642c07463', label: 'Geschichte' },
  { id: 'f1ba2118-853f-4aa0-bef5-4f749bc621ed', label: 'Deutsch' },
  { id: '1d0e9f8f-0087-49e4-8ea2-976e5a89b165', label: 'Politik und Wirtschaft' },
  { id: 'bc2124fa-2974-46cc-85e7-2392e61250e1', label: 'Englisch' },
  { id: '30acd190-609c-4109-8ee7-06fc5594af19', label: 'Französisch' },
  { id: 'fe28bda8-03f3-4c4a-8286-7fcfce4eeac1', label: 'Latein' },
  { id: '936efc61-a4d5-49fd-8694-085d1347db80', label: 'Spanisch' },
  { id: 'c7209caa-18e5-4dd8-b68f-dd86e228d045', label: 'Griechisch' },
  { id: '7651cbe2-5fb8-464d-b0c4-3e830cda41dd', label: 'Chinesisch' },
  { id: 'a8c23058-6998-49f2-9f3b-a85e951d5ab0', label: 'Musik' },
  { id: 'a334a745-1d67-4e1d-86a5-dadc04f144d2', label: 'Wirtschaftswissenschaften' },
] as const

export const LEGACY_HESSEN_GYMNASIUM_UPPER_IDS = new Set([
  LEGACY_HESSEN_GYMNASIUM_UPPER_ROOT_ID,
  ...LEGACY_HESSEN_GYMNASIUM_UPPER_SUBJECTS.map(({ id }) => id),
])

export const LEGACY_HESSEN_GYMNASIUM_LOWER_SUBJECTS = [
  { id: LEGACY_HESSEN_GYMNASIUM_LOWER_MATH_ID, label: 'Mathematik' },
  { id: LEGACY_HESSEN_GYMNASIUM_LOWER_PHYSICS_ID, label: 'Physik' },
  { id: LEGACY_HESSEN_GYMNASIUM_LOWER_CHEMISTRY_ID, label: 'Chemie' },
  { id: LEGACY_HESSEN_GYMNASIUM_LOWER_BIOLOGY_ID, label: 'Biologie' },
  { id: LEGACY_HESSEN_GYMNASIUM_LOWER_FRENCH_ID, label: 'Französisch' },
] as const

export const LEGACY_HESSEN_GYMNASIUM_LOWER_IDS = new Set([
  LEGACY_HESSEN_GYMNASIUM_LOWER_ROOT_ID,
  ...LEGACY_HESSEN_GYMNASIUM_LOWER_SUBJECTS.map(({ id }) => id),
])

const BAVARIA_LEGACY_SUBJECT_BY_CURRICULUM_ID: Record<string, string> = {
  'c1600692-e543-5cf2-a399-6bd96e6b817f': 'Mathematik',
  '42c2f7e3-91b4-5de8-bef0-d563440e9d52': 'Physik',
  'ff1ca997-b6cc-5ece-8e13-5498b4bbf808': 'Chemie',
  '357a7003-b636-570e-a0bd-6bb63518d2f6': 'Biologie',
  '40744ec5-7de1-5e41-9fc2-a1e774721644': 'Chinesisch',
  '1af3eba8-749f-5359-8f12-18f87b13616c': 'Informatik',
  '01c2ba7a-ebd4-5840-bc09-123d7b31c914': 'Geschichte',
  '05f1cd27-5a58-5415-8fda-d4807067f70a': 'Deutsch',
  '9da8e86b-92dc-5ba0-827e-339400af2b38': 'Englisch',
  '22703293-7307-5ad2-b158-efe6ae28c7c3': 'Griechisch',
  '4959d7df-e430-5c1d-bb7b-873d6252a27f': 'Wirtschaft und Recht',
  '486a8278-39b2-5450-96f8-1076a47b655b': 'Politik und Gesellschaft',
  'c7eeaaa4-7c23-5ab7-8643-b7a03760cd6b': 'Latein',
  'a00d70bf-3d3c-58fc-af4f-881b29635c2e': 'Musik',
  '49aefe0c-f365-5f30-b84f-b9a7699e4f2c': 'Französisch',
  '8dba4715-f75e-5339-9e99-02236e4b80dd': 'Spanisch',
  'c7643536-1163-50d8-86a6-9645c8fd3e25': 'Italienisch',
  '2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7': 'Russisch',
  '21148204-794c-515d-ae20-c4d5cd4e56d8': 'Polnisch',
  '097f3667-2488-57b2-a3e0-2cb334e422a2': 'Tschechisch',
}

export const COMPATIBILITY_ONLY_BAVARIA_GYMNASIUM_IDS = new Set([
  '12322e3f-f351-5d40-b4ea-4a13d7e15854',
  '9f01e236-829e-5603-bc8d-b9ca55c273e0',
  '39c8fa53-a1b9-5398-ab74-fe96d7c361d1',
  '04c7656b-7335-5de5-87d9-51a35c78047a',
  '4f5ae12a-6f64-5430-8c5a-35e5d895864a',
  '5aef1568-f6c9-5d82-bfdb-678d86800b93',
  '20c7d57c-42e2-5e7c-95af-7ccfa729c805',
  'd33e9cb5-a4a0-5725-a243-e00723870b19',
  '44eab2b9-794c-5dbc-8e2f-b56122a92872',
  '5eaa8bbc-c07a-58d3-9411-e79949c5af27',
  '4134ceec-41d9-5f60-b429-816e4dbe08f6',
  '6bd5f5d6-0990-5cf7-909b-2798ecc215e5',
  'be6d8cea-99e3-580c-a393-8a20f0e925e2',
  '11c63b84-8191-5472-8f87-61acea516b66',
  '22b5ef38-ad0e-5393-8e0f-93c94fa71597',
  '53fa4017-2273-56f4-a021-5e60c64a58a5',
  'aa3afd2b-7e93-5497-9e41-e1dfc7281744',
  'a4f9730d-267b-59b1-8ff8-17d13a659e01',
  '55410599-3d6d-5948-b6b1-da39e3b7c7dd',
  'c95446f9-6e41-52fc-b8de-bb4011e9c2e8',
  'dc82050d-121b-5442-8cd3-9743a1092c4e',
  '496187e7-1ea9-50da-873f-542552c65697',
  '66de9753-0735-583e-bad4-e00e605bd6c8',
  '28f6c01c-32d7-5fe2-aa55-c9dd8b32ae4b',
  '0d25de6c-95f0-52c7-988b-0c47abe2b1fb',
  '44c6e83e-4684-595d-a3de-45110ec0742a',
  ...Object.keys(BAVARIA_LEGACY_SUBJECT_BY_CURRICULUM_ID),
])

export const LEGACY_BAVARIA_GYMNASIUM_IDS = new Set([
  '12322e3f-f351-5d40-b4ea-4a13d7e15854',
])

const BAVARIA_LEGACY_SUBJECT_METADATA: Record<string, { en: string; canonicalDe: string }> = {
  Mathematik: { en: 'mathematics', canonicalDe: 'Mathematik' },
  Physik: { en: 'physics', canonicalDe: 'Physik und die benoetigte Mathe-Bruecke' },
  Chemie: { en: 'chemistry', canonicalDe: 'Chemie' },
  Biologie: { en: 'biology', canonicalDe: 'Biologie' },
  Chinesisch: { en: 'chinese', canonicalDe: 'Chinesisch' },
  Informatik: { en: 'computer science', canonicalDe: 'Informatik' },
  Geschichte: { en: 'history', canonicalDe: 'Geschichte' },
  Deutsch: { en: 'german', canonicalDe: 'Deutsch' },
  Englisch: { en: 'english', canonicalDe: 'Englisch' },
  Griechisch: { en: 'greek', canonicalDe: 'Griechisch' },
  'Wirtschaft und Recht': { en: 'economics and law', canonicalDe: 'Wirtschaftswissenschaften' },
  'Politik und Gesellschaft': { en: 'politics and society', canonicalDe: 'Politik und Wirtschaft' },
  Latein: { en: 'latin', canonicalDe: 'Latein' },
  Musik: { en: 'music', canonicalDe: 'Musik' },
  Französisch: { en: 'french', canonicalDe: 'Französisch' },
  Spanisch: { en: 'spanish', canonicalDe: 'Spanisch' },
  Italienisch: { en: 'italian', canonicalDe: 'Italienisch' },
  Russisch: { en: 'russian', canonicalDe: 'Russisch' },
  Polnisch: { en: 'polish', canonicalDe: 'Polnisch' },
  Tschechisch: { en: 'czech', canonicalDe: 'Tschechisch' },
}

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

export const getBavariaLegacySubjectEnglishLabel = (subject?: string | null) => {
  if (!subject) {
    return null
  }
  return BAVARIA_LEGACY_SUBJECT_METADATA[subject]?.en ?? null
}

export const getBavariaLegacyCanonicalSubjectLabelDe = (subject?: string | null) => {
  if (!subject) {
    return null
  }
  return BAVARIA_LEGACY_SUBJECT_METADATA[subject]?.canonicalDe ?? subject
}

export const getBavariaLegacySubjectLabelByCurriculumId = (curriculumId?: string | null) => {
  if (!curriculumId) {
    return null
  }
  return BAVARIA_LEGACY_SUBJECT_BY_CURRICULUM_ID[curriculumId] ?? null
}
