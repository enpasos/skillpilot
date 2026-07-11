export type GoalSourceDocument = {
  title?: string
  url?: string
  path?: string
}

export type GoalClassicSourceRoute = {
  jurisdiction?: string
  sourceRef?: string
  sourceText?: string
  parentBulletText?: string
  sourceExtractionPath?: string
  sourceDocument?: GoalSourceDocument
  matchType?: string
  rationale?: string
}

export type GoalMemSparqlRoute = {
  status?: string
  jurisdiction?: string
  endpoint?: string
  graphIri?: string
  planIri?: string
  planLabel?: string
  yearLabel?: string
  goalIri?: string
  goalLabel?: string
  notes?: string
}

export type GoalSourceRationaleItem = {
  goal?: {
    id?: string
    title?: string
    description?: string
    pathTitles?: string[]
  }
  classicSourceRoute?: GoalClassicSourceRoute
  alternateClassicSourceRoutes?: GoalClassicSourceRoute[]
  memSparqlRoute?: GoalMemSparqlRoute
}
