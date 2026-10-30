import { iriObject, typedLiteralObject, type SortedUniqueNTriples } from './fwuOwlNTriples'
import type { JsonObject, JsonValue } from './fwuOwlFieldRegistry'

const SP = 'https://skillpilot.de/ns/roundtrip#'
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string'

/** These assertions supplement the registered lossless JSON field, never replace it. */
export const COMPLETION_RDF_VOCABULARY = Object.freeze({
  classes: ['CompletionProfile', 'CompletionScope', 'CompletionWaiverRule', 'CompletionRuleReview', 'CompletionReviewBinding'],
  objectProperties: ['hasCompletionTarget', 'hasCompletionScope', 'hasCompletionRule',
    'requiresMasteredAssessment', 'waivesPreparationGoal', 'completionProtectedGoal',
    'hasCompletionRuleReview', 'hasCompletionReviewBinding'],
  datatypeProperties: ['completionRuleIdentifier', 'completionScopeRevision', 'completionTaskRevision',
    'completionRubricRevision', 'completionReviewContentSha256'],
})

export type CompletionRdfArtifact = { role: string; rootIri: string; document: JsonValue }

const object = (value: JsonValue | undefined, label: string): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object`)
  return value
}
const text = (value: JsonValue | undefined, label: string): string => {
  if (typeof value !== 'string' || !value) throw new Error(`${label} must be a non-empty string`)
  return value
}
const list = (value: JsonValue | undefined, label: string): string[] => {
  if (!Array.isArray(value) || value.some(v => typeof v !== 'string' || !v)) throw new Error(`${label} must contain identifiers`)
  if (new Set(value).size !== value.length) throw new Error(`${label} contains duplicate identifiers`)
  return value as string[]
}

export const addCompletionRdfAssertions = (
  artifacts: readonly CompletionRdfArtifact[],
  goals: ReadonlyMap<string, string>,
  triples: SortedUniqueNTriples,
) => {
  const selected = artifacts.filter(a => a.role.startsWith('completion-'))
  const identities = new Map<string, string>()
  for (const artifact of selected) {
    const wrapper = object(artifact.document, 'completion artifact')
    const id = text(wrapper.id, 'completion artifact id')
    const key = `${artifact.role}\0${id}`
    if (identities.has(key)) throw new Error(`Duplicate completion artifact identity ${id}`)
    identities.set(key, artifact.rootIri)
  }
  const ref = (role: string, id: string) => identities.get(`${role}\0${id}`)
    ?? (() => { throw new Error(`Unresolved ${role} reference: ${id}`) })()
  const goal = (id: string) => goals.get(id)
    ?? (() => { throw new Error(`Unresolved completion goal reference: ${id}`) })()
  const type = (subject: string, name: string) => triples.add(subject, RDF_TYPE, iriObject(`${SP}${name}`))
  const iri = (subject: string, predicate: string, target: string) => triples.add(subject, `${SP}${predicate}`, iriObject(target))
  const literal = (subject: string, predicate: string, value: string) => triples.add(subject, `${SP}${predicate}`, typedLiteralObject(value, XSD_STRING))
  for (const artifact of selected) {
    const wrapper = object(artifact.document, 'completion artifact')
    const definition = object(wrapper.definition, 'completion definition')
    const owner = artifact.rootIri
    if (artifact.role === 'completion-scope') {
      type(owner, 'CompletionScope')
      for (const id of list(definition.targetRootIds, 'completion target roots')) iri(owner, 'hasCompletionTarget', goal(id))
    } else if (artifact.role === 'completion-rule-review') {
      type(owner, 'CompletionRuleReview')
      literal(owner, 'completionReviewContentSha256', text(definition.sha256, 'completion review content hash'))
    } else if (artifact.role === 'completion-profile') {
      type(owner, 'CompletionProfile')
      iri(owner, 'hasCompletionScope', ref('completion-scope', text(definition.levelScopeRef, 'completion scope')))
      for (const id of list(definition.protectedGoalIds ?? [], 'completion protected goals')) iri(owner, 'completionProtectedGoal', goal(id))
      const review = object(definition.review, 'completion profile review')
      const binding = `${owner}/review-binding`
      type(binding, 'CompletionReviewBinding')
      iri(owner, 'hasCompletionReviewBinding', binding)
      iri(binding, 'hasCompletionRuleReview', ref('completion-rule-review', text(review.reference, 'completion review reference')))
      for (const [field, predicate] of [['scopeRevision', 'completionScopeRevision'], ['taskRevision', 'completionTaskRevision'], ['rubricRevision', 'completionRubricRevision']] as const) {
        literal(binding, predicate, text(review[field], `completion ${field}`))
      }
      if (!Array.isArray(definition.rules)) throw new Error('Completion rules must be an array')
      const ruleIds = new Set<string>()
      for (const value of definition.rules) {
        const rule = object(value, 'completion rule')
        const id = text(rule.ruleId, 'completion rule id')
        if (ruleIds.has(id)) throw new Error(`Duplicate completion rule id: ${id}`)
        ruleIds.add(id)
        const ruleIri = `${owner}/rule/${encodeURIComponent(id)}`
        type(ruleIri, 'CompletionWaiverRule')
        iri(owner, 'hasCompletionRule', ruleIri)
        literal(ruleIri, 'completionRuleIdentifier', id)
        const assessments = list(rule.assessmentGoalIds, 'completion assessment group')
        if (!assessments.length) throw new Error('Completion assessment group must not be empty')
        for (const target of assessments) iri(ruleIri, 'requiresMasteredAssessment', goal(target))
        for (const target of list(rule.waivableGoalIds, 'completion waivable goals')) iri(ruleIri, 'waivesPreparationGoal', goal(target))
        iri(ruleIri, 'hasCompletionRuleReview', ref('completion-rule-review', text(rule.reviewRef, 'completion rule review')))
      }
    } else throw new Error(`Unknown completion normalization role: ${artifact.role}`)
  }
}
