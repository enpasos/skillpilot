import type * as RepositoryPublication from '../utils/goalBookPublicationRegistry'

// Published repository books are not part of an installed curriculum package.
// Keep course goal selection available, without offering absent book routes or
// importing repository curriculum IDs into the package-consumer runtime.
// Keep the complete export surface: Vite links even modules that are later
// removed together with the package-disabled public book routes.
export const GOAL_BOOK_PUBLICATION_REGISTRY: readonly RepositoryPublication.GoalBookPublicationDefinition[] = Object.freeze([])
export const DEFAULT_GOAL_BOOK_ID = ''
export const GOAL_BOOK_INDEX_URL = ''

export const goalBookDefinitionById: typeof RepositoryPublication.goalBookDefinitionById = () => undefined
export const goalBookDefinitionByLandscapeId: typeof RepositoryPublication.goalBookDefinitionByLandscapeId = () => undefined

const unavailable = (): never => {
  throw new Error('Repository goal books are unavailable in package-consumer mode')
}

export const goalBookRoute: typeof RepositoryPublication.goalBookRoute = unavailable
export const goalBookModelUrl: typeof RepositoryPublication.goalBookModelUrl = unavailable
export const goalBookPdfUrl: typeof RepositoryPublication.goalBookPdfUrl = unavailable
export const goalBookRenderManifestUrl: typeof RepositoryPublication.goalBookRenderManifestUrl = unavailable
