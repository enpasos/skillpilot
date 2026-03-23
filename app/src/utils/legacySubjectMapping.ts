/**
 * Lookup table for legacy Bavaria/Hessen landscape IDs → subject names (de/en).
 * Replaces the long if-chain in LearnerView.
 */
export interface LegacySubjectEntry {
  de: string
  en: string
}

const BAVARIA_SUBJECT_MAP = new Map<string, LegacySubjectEntry>([
  ['c1600692-e543-5cf2-a399-6bd96e6b817f', { de: 'Mathematik', en: 'mathematics' }],
  ['42c2f7e3-91b4-5de8-bef0-d563440e9d52', { de: 'Physik', en: 'physics' }],
  ['ff1ca997-b6cc-5ece-8e13-5498b4bbf808', { de: 'Chemie', en: 'chemistry' }],
  ['357a7003-b636-570e-a0bd-6bb63518d2f6', { de: 'Biologie', en: 'biology' }],
  ['40744ec5-7de1-5e41-9fc2-a1e774721644', { de: 'Chinesisch', en: 'chinese' }],
  ['1af3eba8-749f-5359-8f12-18f87b13616c', { de: 'Informatik', en: 'computer science' }],
  ['01c2ba7a-ebd4-5840-bc09-123d7b31c914', { de: 'Geschichte', en: 'history' }],
  ['05f1cd27-5a58-5415-8fda-d4807067f70a', { de: 'Deutsch', en: 'german' }],
  ['9da8e86b-92dc-5ba0-827e-339400af2b38', { de: 'Englisch', en: 'english' }],
  ['22703293-7307-5ad2-b158-efe6ae28c7c3', { de: 'Griechisch', en: 'greek' }],
  ['4959d7df-e430-5c1d-bb7b-873d6252a27f', { de: 'Wirtschaft und Recht', en: 'economics and law' }],
  ['486a8278-39b2-5450-96f8-1076a47b655b', { de: 'Politik und Gesellschaft', en: 'politics and society' }],
  ['c7eeaaa4-7c23-5ab7-8643-b7a03760cd6b', { de: 'Latein', en: 'latin' }],
  ['a00d70bf-3d3c-58fc-af4f-881b29635c2e', { de: 'Musik', en: 'music' }],
  ['49aefe0c-f365-5f30-b84f-b9a7699e4f2c', { de: 'Französisch', en: 'french' }],
  ['8dba4715-f75e-5339-9e99-02236e4b80dd', { de: 'Spanisch', en: 'spanish' }],
  ['c7643536-1163-50d8-86a6-9645c8fd3e25', { de: 'Italienisch', en: 'italian' }],
  ['2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7', { de: 'Russisch', en: 'russian' }],
  ['21148204-794c-515d-ae20-c4d5cd4e56d8', { de: 'Polnisch', en: 'polish' }],
  ['097f3667-2488-57b2-a3e0-2cb334e422a2', { de: 'Tschechisch', en: 'czech' }],
])

export const BAVARIA_LANDSCAPE_IDS = new Set(BAVARIA_SUBJECT_MAP.keys())

export const lookupBavariaSubject = (landscapeId: string | null | undefined): LegacySubjectEntry | null => {
  if (!landscapeId) return null
  return BAVARIA_SUBJECT_MAP.get(landscapeId) ?? null
}

/**
 * For the migration description, map a German subject name to the canonical
 * display name used in the cutover preview text.
 */
const MIGRATION_DISPLAY_NAME_MAP: Record<string, string> = {
  'Wirtschaft und Recht': 'Wirtschaftswissenschaften',
  'Politik und Gesellschaft': 'Politik und Wirtschaft',
}

export const getMigrationDisplayName = (subjectDe: string): string =>
  MIGRATION_DISPLAY_NAME_MAP[subjectDe] ?? subjectDe
