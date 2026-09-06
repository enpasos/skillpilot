export type GoalBookSubject = 'mathematics' | 'physics' | 'chemistry' | 'biology'

export interface GoalBookPublicationDefinition {
  bookId: string
  landscapeId: string
  edition: string
  subject: GoalBookSubject
  artifactStem: string
  configPath: string
}

export const GOAL_BOOK_PUBLICATION_REGISTRY = Object.freeze([
  Object.freeze({
    bookId: 'de-gym-mathematik-bundesweit',
    landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
    edition: 'curricular-atomic-v1',
    subject: 'mathematics',
    artifactStem: 'de-gym-mathematik-bundesweit',
    configPath: 'scripts/config/goal-books/de-gym-math-national-atlas.json',
  }),
  Object.freeze({
    bookId: 'de-gym-physik-bundesweit',
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    edition: 'curricular-atomic-v1',
    subject: 'physics',
    artifactStem: 'de-gym-physik-bundesweit',
    configPath: 'scripts/config/goal-books/de-gym-physics-national-atlas.json',
  }),
  Object.freeze({
    bookId: 'de-gym-chemie-lk',
    landscapeId: 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
    edition: 'curricular-atomic-v1',
    subject: 'chemistry',
    artifactStem: 'de-gym-chemie-lk',
    configPath: 'scripts/config/goal-books/de-gym-chemistry-lk.json',
  }),
  Object.freeze({
    bookId: 'de-gym-biologie-gk',
    landscapeId: '08a43a1b-d97e-522c-9dfa-c950a493364e',
    edition: 'curricular-atomic-v1',
    subject: 'biology',
    artifactStem: 'de-gym-biologie-gk',
    configPath: 'scripts/config/goal-books/de-gym-biology-gk.json',
  }),
]) satisfies readonly GoalBookPublicationDefinition[]

export const DEFAULT_GOAL_BOOK_ID = GOAL_BOOK_PUBLICATION_REGISTRY[0].bookId
export const GOAL_BOOK_INDEX_URL = '/lernzielbuch/index.json'

export const goalBookDefinitionById = (
  bookId: string,
): GoalBookPublicationDefinition | undefined => (
  GOAL_BOOK_PUBLICATION_REGISTRY.find((definition) => definition.bookId === bookId)
)

export const goalBookDefinitionByLandscapeId = (
  landscapeId: string,
): GoalBookPublicationDefinition | undefined => (
  GOAL_BOOK_PUBLICATION_REGISTRY.find((definition) => definition.landscapeId === landscapeId)
)

export const goalBookModelUrl = (definition: GoalBookPublicationDefinition): string => (
  `/lernzielbuch/${definition.artifactStem}.book-model.json`
)

export const goalBookPdfUrl = (definition: GoalBookPublicationDefinition): string => (
  `/lernzielbuch/${definition.artifactStem}.pdf`
)

export const goalBookRenderManifestUrl = (
  definition: GoalBookPublicationDefinition,
): string => `${goalBookPdfUrl(definition)}.render-manifest.json`

export const goalBookRoute = (bookId: string): string => (
  bookId === DEFAULT_GOAL_BOOK_ID
    ? '/lernzielbuch'
    : `/lernzielbuch?book=${encodeURIComponent(bookId)}`
)
