import { iriObject, typedLiteralObject, type SortedUniqueNTriples } from './fwuOwlNTriples'
import type { JsonObject, JsonValue } from './fwuOwlFieldRegistry'

const SP = 'https://skillpilot.de/ns/roundtrip#'
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string'

/** Runtime 1.2 (learningUnitsV1). These assertions supplement the registered lossless fields, never replace them. */
export const LEARNING_UNIT_RDF_VOCABULARY = Object.freeze({
  classes: ['LearningUnit', 'LearningUnitCoverageReview', 'LearningUnitCoverageReviewRecord'],
  objectProperties: ['coverageReviewedAssessment', 'coverageReviewedGoal', 'hasCoverageReview', 'hasCoverageReviewRecord',
    'hasParentLearningUnit', 'ownsGoal'],
  // Task and rubric revisions are registered typed literals of each review record.
  datatypeProperties: ['coverageReviewContentSha256'],
})
export const LEARNING_UNIT_REVIEW_ROLE = 'learning-unit-coverage-review'

export type LearningUnitRdfArtifact = { role: string; rootIri: string; document: JsonValue }

const object = (value: JsonValue | undefined, label: string): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  return value
}
const text = (value: JsonValue | undefined, label: string): string => {
  if (typeof value !== 'string' || !value) throw new Error(`${label} must be a non-empty string`)
  return value
}
const list = (value: JsonValue | undefined, label: string): JsonValue[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`)
  return value
}

/** Program-unit and goal IRIs follow the registry record identities of the semantic compiler. */
export const learningUnitIri = (landscapeIri: string, unitId: string) => `${landscapeIri}/program-unit/${encodeURIComponent(unitId)}`
/** A coverage review is the positioned record `coverageReviews[index]` of its learning unit. */
export const coverageReviewIri = (unitIri: string, index: number) => `${unitIri}/coverage-review/${index}`

export const addLearningUnitRdfAssertions = (
  artifacts: readonly LearningUnitRdfArtifact[],
  goals: ReadonlyMap<string, string>,
  triples: SortedUniqueNTriples,
) => {
  const reviews = new Map<string, string>()
  for (const artifact of artifacts.filter(a => a.role === LEARNING_UNIT_REVIEW_ROLE)) {
    const wrapper = object(artifact.document, 'coverage review record')
    const id = text(wrapper.id, 'coverage review record id')
    if (reviews.has(id)) throw new Error(`Duplicate coverage review record ${id}`)
    reviews.set(id, artifact.rootIri)
  }
  const type = (subject: string, name: string) => triples.add(subject, RDF_TYPE, iriObject(`${SP}${name}`))
  const iri = (subject: string, predicate: string, target: string) => triples.add(subject, `${SP}${predicate}`, iriObject(target))
  const literal = (subject: string, predicate: string, value: string) => triples.add(subject, `${SP}${predicate}`, typedLiteralObject(value, XSD_STRING))
  const goal = (id: string) => goals.get(id) ?? (() => { throw new Error(`Unresolved learning-unit goal reference: ${id}`) })()

  for (const artifact of artifacts) {
    if (artifact.role === LEARNING_UNIT_REVIEW_ROLE) {
      const definition = object(object(artifact.document, 'coverage review record').definition, 'coverage review definition')
      type(artifact.rootIri, 'LearningUnitCoverageReviewRecord')
      literal(artifact.rootIri, 'coverageReviewContentSha256', text(definition.sha256, 'coverage review content hash'))
      continue
    }
    if (artifact.role !== 'canonical-landscape') continue
    const landscape = object(artifact.document, 'canonical landscape')
    const units = new Map<string, string>()
    for (const value of list(landscape.programUnits, 'program units')) {
      const unit = object(value, 'program unit')
      if (unit.kind !== 'learningUnit') continue
      const id = text(unit.id, 'learning-unit id')
      if (units.has(id)) throw new Error(`Duplicate learning unit ${id}`)
      units.set(id, learningUnitIri(artifact.rootIri, id))
      type(units.get(id)!, 'LearningUnit')
    }
    for (const value of list(landscape.programUnits, 'program units')) {
      const unit = object(value, 'program unit')
      if (unit.kind !== 'learningUnit' || unit.parentUnitId === undefined) continue
      const parent = units.get(text(unit.parentUnitId, 'learning-unit parent'))
        ?? (() => { throw new Error(`Learning-unit parent is not a learning unit: ${String(unit.parentUnitId)}`) })()
      iri(units.get(text(unit.id, 'learning-unit id'))!, 'hasParentLearningUnit', parent)
    }
    for (const value of list(landscape.goalPlacements, 'goal placements')) {
      const placement = object(value, 'goal placement')
      if (placement.relation !== 'own') continue
      const unit = units.get(text(placement.unitId, 'own placement unit'))
        ?? (() => { throw new Error(`Own placement targets no learning unit: ${String(placement.unitId)}`) })()
      iri(unit, 'ownsGoal', goal(text(placement.goalId, 'own placement goal')))
    }
    for (const value of list(landscape.programUnits, 'program units')) {
      const unit = object(value, 'program unit')
      if (unit.kind !== 'learningUnit') continue
      const unitIri = units.get(text(unit.id, 'learning-unit id'))!
      list(unit.coverageReviews, 'coverage reviews').forEach((reviewValue, index) => {
        const review = object(reviewValue, 'coverage review')
        const node = coverageReviewIri(unitIri, index)
        type(node, 'LearningUnitCoverageReview')
        iri(unitIri, 'hasCoverageReview', node)
        iri(node, 'coverageReviewedAssessment', goal(text(review.assessmentGoalId, 'reviewed assessment')))
        for (const target of list(review.goalIds, 'coverage review goals')) iri(node, 'coverageReviewedGoal', goal(text(target, 'reviewed goal')))
        const reference = text(review.reference, 'coverage review reference')
        iri(node, 'hasCoverageReviewRecord', reviews.get(reference)
          ?? (() => { throw new Error(`Unresolved coverage review record: ${reference}`) })())
      })
    }
  }
}
