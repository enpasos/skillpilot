import { createHash } from 'node:crypto'
import type { SourceLogicalArtifact, ValidatedSourceJsonPackage } from './fwuOwlPackageSource'
import {
  FwuOwlFieldRegistry,
  compactCanonicalJsonBytes,
  compactCanonicalJsonText,
  decodeJsonPointer,
  encodeJsonPointer,
  type FieldRegistryEntry,
  type JsonObject,
  type JsonValue,
} from './fwuOwlFieldRegistry'
import {
  SortedUniqueNTriples,
  derivePackageVocabularyDeclarations,
  iriObject,
  languageLiteralObject,
  typedLiteralObject,
  type ApplicationVocabularySummary,
  type NTriplesSerialization,
} from './fwuOwlNTriples'

export const FWU_OWL_SEGMENT_ORDER = [
  'declarations',
  'runtime',
  'landscape',
  'views',
  'mappings',
  'sources',
  'cards',
  'assets',
] as const

export type FwuOwlSegmentId = typeof FWU_OWL_SEGMENT_ORDER[number]

export const FWU_OWL_SEGMENT_ROUTING: Readonly<Record<string, FwuOwlSegmentId>> = Object.freeze({
  'runtime-catalog': 'runtime',
  'dependency-closure': 'runtime',
  'migration-aliases': 'runtime',
  'canonical-landscape': 'landscape',
  'composition-view-index': 'views',
  'composition-view': 'views',
  'source-to-canonical-mappings': 'mappings',
  'official-source-index': 'sources',
  'source-goal-reference-index': 'sources',
  'release-quality-evidence': 'sources',
  'card-index': 'cards',
  'card-deck': 'cards',
  'resource-index': 'assets',
})

export type CompiledFwuOwlSegment = NTriplesSerialization & {
  segmentId: FwuOwlSegmentId
}

export type FwuOwlCompilationResult = {
  segments: Readonly<Record<FwuOwlSegmentId, CompiledFwuOwlSegment>>
  logicalArtifactCount: number
  fieldRegistryEntryCount: number
  observedRegistryEntryCount: number
  observationCount: number
  generatedFallbackAreaCount: number
  applicationVocabulary: ApplicationVocabularySummary
  registryVocabulary: ApplicationVocabularySummary
  parserBootstrapPropertyCount: number
  declarationTripleCount: number
}

type RegistryConstruction = {
  subjectTemplate: string
  predicate: string
  objectMapping: 'language-literal' | 'typed-literal' | 'iri-reference' | 'resource' | 'positioned-membership'
  condition?: string
  datatype?: string
  resourceClass?: string
  ownerSubjectTemplate?: string
  ownerPredicate?: string
  membership?: {
    membershipClass: string
    ownerPredicate: string
    valuePredicate: string
    positionPredicate: string
    positionBase: number
    coreProjection?: {
      mode: string
      condition: string
      ownerPredicate: string
      valuePredicate?: string
      resourceClass?: string
    }
  }
}

type ArtifactState = {
  artifact: SourceLogicalArtifact
  document: JsonValue
  segmentId: FwuOwlSegmentId
  rootIri: string
  locale: string
}

const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const XSD = 'http://www.w3.org/2001/XMLSchema#'
const DCTERMS = 'http://purl.org/dc/terms/'
const BFO = 'http://purl.obolibrary.org/obo/'
const LP = 'https://w3id.org/lehrplan/ontology/'
const SP = 'https://skillpilot.de/ns/roundtrip#'
const SCHEMA = 'https://schema.org/'

const RDF_TYPE = `${RDF}type`
const OWL_NAMED_INDIVIDUAL = 'http://www.w3.org/2002/07/owl#NamedIndividual'
const LP_CURRICULAR_ATOMIC = `${LP}LP_0000336`
const LP_CURRICULAR_AREA = `${LP}LP_0000349`
const LP_PROCESS_COMPETENCY_AREA = `${LP}LP_0030265`
const LP_GUIDING_IDEA = `${LP}LP_0000268`
const LP_SCHOOL_SUBJECT = `${LP}LP_0000001`
const LP_SCHOOL_TYPE = `${LP}LP_0000111`
const LP_TITLE = `${LP}LP_0000346`
const LP_DESCRIPTION = `${LP}LP_0030003`
const LP_IDENTIFIER = `${LP}LP_0000347`
const LP_VALUE = `${LP}LP_0000344`
const LP_HAS_TITLE = `${LP}LP_0030056`
const LP_DESCRIBED_BY = `${LP}LP_0000024`
const LP_HAS_DESCRIPTION = `${LP}LP_0030051`
const LP_HAS_NUMBER = `${LP}LP_0030057`
const LP_HAS_REFERENCE = `${LP}LP_0030071`
const LP_REFERS_TO = `${LP}LP_0030072`
const LP_REFERENCE = `${LP}LP_0030065`
const LP_DIDACTIC_PREREQUISITE = `${LP}LP_0000554`
const LP_POSITION = `${LP}LP_0000460`
const LP_HAS_GRADE = `${LP}LP_0000026`
const LP_HAS_STAGE = `${LP}LP_0000047`
const LP_HAS_UNIT = `${LP}LP_0000041`
const LP_HAS_SCHOOL_SUBJECT = `${LP}LP_0000537`
const LP_FOR_SCHOOL_TYPE = `${LP}LP_0000812`
const BFO_HAS_PART = `${BFO}BFO_0000051`
const REFERENCE_ROLE_COMPETENCY_REFS = 'competencyRefs'
const REFERENCE_ROLE_PROCESS_COMPETENCIES = 'dimensionTags.processCompetencies'
const REFERENCE_ROLE_GUIDING_IDEAS = 'dimensionTags.guidingIdeas'
const SP_FIELD_STATE = `${SP}fieldState`

const GUIDING_IDEA_TITLES = new Map([
  ['L1', 'Leitidee L1'],
  ['L2', 'Leitidee L2'],
  ['L3', 'Leitidee L3'],
  ['L4', 'Leitidee L4'],
  ['L5', 'Leitidee L5'],
])

const ALLOWED_SEMANTIC_KINDS = new Set([
  'curricularAtomic',
  'curricularArea',
  'practiceAssessment',
  'programStructure',
  'memory',
  'runtimeSupport',
  'orientation',
])
const CURRICULAR_KINDS = new Set(['curricularAtomic', 'curricularArea'])

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)
const fail = (message: string): never => { throw new Error(message) }
const idSegment = (value: string) => encodeURIComponent(value)
const pointerSegment = (segments: readonly string[]) => idSegment(encodeJsonPointer(segments) || '/')

const objectValue = (value: JsonValue | undefined, context: string): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${context} must be a JSON object.`)
  return value as JsonObject
}

const stringValue = (value: JsonValue | undefined, context: string): string => {
  if (typeof value !== 'string' || value.length === 0) fail(`${context} must be a non-empty string.`)
  return value as string
}

const optionalString = (value: JsonValue | undefined) => typeof value === 'string' && value.length > 0 ? value : null

const valueAt = (document: JsonValue, segments: readonly string[]): JsonValue | undefined => {
  let cursor: JsonValue | undefined = document
  for (const segment of segments) {
    if (Array.isArray(cursor)) {
      if (!/^(?:0|[1-9][0-9]*)$/u.test(segment)) return undefined
      cursor = cursor[Number(segment)]
    } else if (cursor && typeof cursor === 'object') cursor = cursor[segment]
    else return undefined
  }
  return cursor
}

const compactIri = (value: string, namespaces: Record<string, string>) => {
  const separator = value.indexOf(':')
  if (separator <= 0) fail(`Registry compact IRI is invalid: ${value}`)
  const prefix = value.slice(0, separator)
  const namespace = namespaces[prefix] ?? fail(`Registry compact IRI uses an unknown prefix: ${value}`)
  return `${namespace}${value.slice(separator + 1)}`
}

const constructionFor = (entry: FieldRegistryEntry, key: 'construction' | 'fallbackConstruction') => {
  const mapping = objectValue(entry.data.rdfMapping, `${entry.entryId}.rdfMapping`)
  const candidate = mapping[key]
  if (candidate === undefined) return null
  return objectValue(candidate, `${entry.entryId}.${key}`) as unknown as RegistryConstruction
}

const literalLexical = (value: JsonValue, datatype: string) => {
  if (value === null || Array.isArray(value) || typeof value === 'object') {
    fail(`Cannot encode non-scalar value as ${datatype}.`)
  }
  if (datatype === `${XSD}boolean`) {
    if (typeof value !== 'boolean') fail(`Expected boolean for ${datatype}.`)
    return value ? 'true' : 'false'
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('Non-finite RDF numeric literal is forbidden.')
    return JSON.stringify(value)
  }
  return String(value)
}

const stringArray = (value: JsonValue | undefined) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string')
  : []

const addCoreTextResource = (
  triples: SortedUniqueNTriples,
  owner: string,
  ownerPredicate: string,
  resource: string,
  resourceClass: string,
  value: JsonValue | undefined,
  language?: string,
) => {
  if (typeof value !== 'string' || value.length === 0) return
  addType(triples, resource, resourceClass)
  triples.add(owner, ownerPredicate, iriObject(resource))
  triples.add(
    resource,
    LP_VALUE,
    language ? languageLiteralObject(value, language) : typedLiteralObject(value, `${XSD}string`),
  )
}

const profileMapping = (profile: JsonObject, name: string) => {
  const mappings = objectValue(profile.mappings, 'curriculum profile mappings')
  return objectValue(mappings[name], `curriculum profile mapping ${name}`)
}

const compactProfileTerms = (
  context: SemanticContext,
  mapping: JsonObject,
  field: 'applicationTerms' | 'coreTerms',
) => stringArray(mapping[field]).map((value) => compactIri(value, context.namespaces))

const processAxisId = (code: string) => `PROCESS.${code}`
const guidingIdeaAxisId = (code: string) => `GUIDING.${code}`

class SemanticContext {
  readonly baseIri: string
  readonly namespaces: Record<string, string>
  readonly artifacts: ArtifactState[]
  readonly goalIris = new Map<string, string>()
  readonly goalKinds = new Map<string, string>()
  readonly containedGoalIds = new Set<string>()
  readonly landscapeIris = new Map<string, string>()
  readonly competencyIris = new Map<string, string>()
  readonly resourceIris = new Map<string, string>()
  readonly sourceGoalIris = new Map<string, string>()
  readonly deckIris = new Map<string, string>()
  readonly curriculumProfile: JsonObject

  constructor(
    releaseId: string,
    registryValue: JsonObject,
    artifacts: ArtifactState[],
    curriculumProfile: JsonObject,
  ) {
    this.baseIri = `https://skillpilot.de/id/curriculum-package/${idSegment(releaseId)}`
    this.namespaces = Object.fromEntries(Object.entries(
      objectValue(registryValue.namespaceBindings, 'registry namespaceBindings'),
    ).map(([key, value]) => [key, stringValue(value, `registry namespace ${key}`)]))
    const profileNamespaces = objectValue(
      curriculumProfile.namespaceBindings,
      'curriculum profile namespaceBindings',
    )
    Object.entries(profileNamespaces).forEach(([key, value]) => {
      const iri = stringValue(value, `curriculum profile namespace ${key}`)
      if (this.namespaces[key] !== undefined && this.namespaces[key] !== iri) {
        fail(`Registry and curriculum profile disagree on namespace ${key}.`)
      }
      this.namespaces[key] = iri
    })
    this.artifacts = artifacts
    this.curriculumProfile = curriculumProfile
    this.indexIdentities()
  }

  private indexIdentities() {
    for (const state of this.artifacts) {
      const root = state.document && typeof state.document === 'object' && !Array.isArray(state.document)
        ? state.document
        : null
      if (!root) continue
      if (state.artifact.normalizationRole === 'canonical-landscape') {
        const landscapeId = stringValue(root.landscapeId, 'canonical landscapeId')
        const landscapeIri = `${this.baseIri}/landscape/${idSegment(landscapeId)}`
        if (this.landscapeIris.has(landscapeId)) fail(`Duplicate landscape identity: ${landscapeId}`)
        this.landscapeIris.set(landscapeId, landscapeIri)
        state.rootIri = landscapeIri
        const goals = Array.isArray(root.goals) ? root.goals : fail('Canonical landscape goals must be an array.')
        goals.forEach((value, index) => {
          const goal = objectValue(value, `goal ${index}`)
          const goalId = stringValue(goal.id, `goal ${index} id`)
          const semanticKind = stringValue(goal.semanticKind, `goal ${goalId} semanticKind`)
          if (!ALLOWED_SEMANTIC_KINDS.has(semanticKind)) fail(`Goal ${goalId} has unsupported semanticKind ${semanticKind}.`)
          if (this.goalIris.has(goalId)) fail(`Duplicate goal identity: ${goalId}`)
          this.goalIris.set(goalId, `${this.baseIri}/goal/${idSegment(goalId)}`)
          this.goalKinds.set(goalId, semanticKind)
          if (Array.isArray(goal.contains)) {
            goal.contains.forEach((childId) => {
              if (typeof childId === 'string') this.containedGoalIds.add(childId)
            })
          }
        })
        const competencies = Array.isArray(root.competencyCatalog) ? root.competencyCatalog : []
        competencies.forEach((value, index) => {
          const record = objectValue(value, `competency ${index}`)
          const id = stringValue(record.id, `competency ${index} id`)
          if (this.competencyIris.has(id)) fail(`Duplicate competency identity: ${id}`)
          this.competencyIris.set(id, `${landscapeIri}/competency/${idSegment(id)}`)
        })
      } else if (state.artifact.normalizationRole === 'resource-index') {
        const resources = Array.isArray(root.resources) ? root.resources : fail('Resource index resources must be an array.')
        resources.forEach((value, index) => {
          const record = objectValue(value, `resource ${index}`)
          const id = stringValue(record.resourceId, `resource ${index} resourceId`)
          if (this.resourceIris.has(id)) fail(`Duplicate resource identity: ${id}`)
          this.resourceIris.set(id, `${this.baseIri}/resource/${idSegment(id)}`)
        })
      } else if (state.artifact.normalizationRole === 'source-goal-reference-index') {
        const collections = Array.isArray(root.collections) ? root.collections : []
        collections.forEach((collectionValue, collectionIndex) => {
          const collection = objectValue(collectionValue, `source-goal collection ${collectionIndex}`)
          const goals = Array.isArray(collection.sourceGoals) ? collection.sourceGoals : []
          goals.forEach((goalValue, goalIndex) => {
            const goal = objectValue(goalValue, `source goal ${goalIndex}`)
            const id = stringValue(goal.sourceGoalId, `source goal ${goalIndex} sourceGoalId`)
            if (this.sourceGoalIris.has(id)) fail(`Duplicate source-goal identity: ${id}`)
            this.sourceGoalIris.set(id, `${this.baseIri}/source-goal/${idSegment(id)}`)
          })
        })
      } else if (state.artifact.normalizationRole === 'card-deck') {
        const deckId = stringValue(root.deckId, 'card deckId')
        const language = optionalString(root.language) ?? 'und'
        const identity = `${deckId}@${language}`
        const deckIri = `${this.baseIri}/deck/${idSegment(identity)}`
        if (this.deckIris.has(identity)) fail(`Duplicate card-deck identity: ${identity}`)
        this.deckIris.set(identity, deckIri)
        state.rootIri = deckIri
      } else if (state.artifact.normalizationRole === 'composition-view') {
        const viewId = stringValue(root.viewId, 'composition viewId')
        state.rootIri = `${this.baseIri}/view/${idSegment(viewId)}`
      }
    }
  }

  artifactIri(state: ArtifactState) {
    return `${this.baseIri}/artifact/${idSegment(state.artifact.normalizationRole)}/${idSegment(state.artifact.logicalId)}`
  }

  entityForObjectPath(state: ArtifactState, segments: readonly string[]): string {
    if (segments.length === 0) return state.rootIri
    const root = objectValue(state.document, `${state.artifact.logicalId} root`)
    const role = state.artifact.normalizationRole
    const at = valueAt(state.document, segments)
    const data = at && typeof at === 'object' && !Array.isArray(at) ? at : null
    if (role === 'canonical-landscape') {
      if (segments[0] === 'goals' && segments.length >= 2) {
        const goal = objectValue((root.goals as JsonValue[])[Number(segments[1])], 'goal record')
        const goalIri = this.goalIris.get(stringValue(goal.id, 'goal id')) ?? fail('Unknown indexed goal.')
        if (segments.length === 2) return goalIri
        if (segments[2] === 'resourceLinks' && segments.length >= 4) return `${goalIri}/resource-link/${segments[3]}`
        if (segments[2] === 'examData') {
          if (segments[3] === 'scoring' && segments[4] === 'steps' && segments.length >= 6) {
            return `${goalIri}/scoring/step/${segments[5]}`
          }
          if (segments[3] === 'scoring') return `${goalIri}/scoring`
          return `${goalIri}/assessment`
        }
        return `${goalIri}/record/${pointerSegment(segments.slice(2))}`
      }
      if (segments[0] === 'competencyCatalog' && data) {
        const id = stringValue(data.id, 'competency id')
        return this.competencyIris.get(id) ?? fail(`Unknown competency ${id}.`)
      }
      if (segments[0] === 'programUnits' && data) {
        return `${state.rootIri}/program-unit/${idSegment(stringValue(data.id, 'program-unit id'))}`
      }
      if (segments[0] === 'goalPlacements' && data) {
        const goalId = optionalString(data.goalId) ?? 'goal'
        const unitId = optionalString(data.unitId) ?? 'unit'
        const position = segments[1] ?? 'placement'
        const id = `${goalId}@${unitId}@${position}`
        return `${state.rootIri}/placement/${idSegment(id)}`
      }
    }
    if (role === 'composition-view' && segments[0] === 'rootNodes') {
      return `${state.rootIri}/node/${pointerSegment(segments)}`
    }
    if (role === 'card-deck' && segments[0] === 'cards' && data) {
      return `${state.rootIri}/card/${idSegment(stringValue(data.id, 'card id'))}`
    }
    if (role === 'resource-index' && segments[0] === 'resources' && data) {
      const id = stringValue(data.resourceId, 'resourceId')
      return this.resourceIris.get(id) ?? fail(`Unknown resource ${id}.`)
    }
    if ((role === 'official-source-index' || role === 'source-goal-reference-index' || role === 'source-to-canonical-mappings') && segments[0] === 'collections') {
      const collection = objectValue((root.collections as JsonValue[])[Number(segments[1])], 'source collection')
      const collectionId = optionalString(collection.sourceCollectionId)
        ?? optionalString(collection.mappingCollectionId)
        ?? `collection-${segments[1]}`
      const collectionIri = `${this.baseIri}/source-collection/${idSegment(collectionId)}`
      if (segments.length === 2) return collectionIri
      if (segments[2] === 'documents' && segments.length >= 4) {
        const document = objectValue((collection.documents as JsonValue[])[Number(segments[3])], 'source document')
        const documentIri = `${this.baseIri}/source-document/${idSegment(stringValue(document.sourceDocumentId, 'sourceDocumentId'))}`
        return segments.length === 4
          ? documentIri
          : `${documentIri}/record/${pointerSegment(segments.slice(4))}`
      }
      if (segments[2] === 'sourceGoals' && segments.length >= 4) {
        const goal = objectValue((collection.sourceGoals as JsonValue[])[Number(segments[3])], 'source goal')
        const id = stringValue(goal.sourceGoalId, 'sourceGoalId')
        const goalIri = this.sourceGoalIris.get(id) ?? `${this.baseIri}/source-goal/${idSegment(id)}`
        return segments.length === 4
          ? goalIri
          : `${goalIri}/record/${pointerSegment(segments.slice(4))}`
      }
      if (segments[2] === 'edges' && segments.length >= 4) {
        const edge = objectValue((collection.edges as JsonValue[])[Number(segments[3])], 'mapping edge')
        const identity = `${stringValue(edge.sourceGoalId, 'mapping sourceGoalId')}@${stringValue(edge.canonicalGoalId, 'mapping canonicalGoalId')}@${optionalString(edge.matchType) ?? segments[3]}`
        const edgeIri = `${this.baseIri}/mapping-edge/${idSegment(identity)}`
        return segments.length === 4
          ? edgeIri
          : `${edgeIri}/record/${pointerSegment(segments.slice(4))}`
      }
      return `${collectionIri}/record/${pointerSegment(segments.slice(2))}`
    }
    return `${this.artifactIri(state)}/record/${pointerSegment(segments)}`
  }

  recordIriForField(state: ArtifactState, path: string) {
    const segments = [...decodeJsonPointer(path)]
    return this.entityForObjectPath(state, segments.slice(0, -1))
  }

  goalForPath(state: ArtifactState, path: string) {
    const segments = decodeJsonPointer(path)
    if (state.artifact.normalizationRole !== 'canonical-landscape' || segments[0] !== 'goals' || segments.length < 2) {
      fail(`Registry template requires a goal context at ${state.artifact.normalizationRole}:${path}.`)
    }
    const root = objectValue(state.document, 'canonical landscape')
    const goal = objectValue((root.goals as JsonValue[])[Number(segments[1])], 'goal context')
    const id = stringValue(goal.id, 'goal context id')
    return { id, iri: this.goalIris.get(id) ?? fail(`Unknown goal ${id}.`), data: goal }
  }

  viewForState(state: ArtifactState) {
    if (state.artifact.normalizationRole !== 'composition-view') fail('Registry template requires a composition view.')
    return state.rootIri
  }

  deckForState(state: ArtifactState) {
    if (state.artifact.normalizationRole !== 'card-deck') fail('Registry template requires a card deck.')
    return state.rootIri
  }

  nearestEntity(state: ArtifactState, path: string, kind: 'composition-node' | 'asset' | 'source-collection' | 'source-document' | 'source-goal' | 'mapping-edge'): string {
    const segments = [...decodeJsonPointer(path)]
    const root = objectValue(state.document, `${kind} artifact`)
    if (kind === 'composition-node') {
      for (let length = segments.length; length >= 2; length -= 1) {
        const candidate = valueAt(state.document, segments.slice(0, length))
        if (candidate && typeof candidate === 'object' && !Array.isArray(candidate) && segments[0] === 'rootNodes') {
          return this.entityForObjectPath(state, segments.slice(0, length))
        }
      }
    }
    if (kind === 'asset') {
      const index = segments[0] === 'resources' ? Number(segments[1]) : -1
      const resource = index >= 0 ? objectValue((root.resources as JsonValue[])[index], 'asset context') : null
      const id = resource ? stringValue(resource.resourceId, 'asset resourceId') : fail(`No asset context at ${path}.`)
      return this.resourceIris.get(id) ?? fail(`Unknown asset ${id}.`)
    }
    if (segments[0] !== 'collections' || segments.length < 2) fail(`No ${kind} context at ${path}.`)
    const collection = objectValue((root.collections as JsonValue[])[Number(segments[1])], `${kind} collection`)
    const collectionId = optionalString(collection.sourceCollectionId)
      ?? optionalString(collection.mappingCollectionId)
      ?? `collection-${segments[1]}`
    if (kind === 'source-collection') return `${this.baseIri}/source-collection/${idSegment(collectionId)}`
    if (kind === 'source-document') {
      const documentIndex = segments.indexOf('documents')
      const document = documentIndex >= 0
        ? objectValue((collection.documents as JsonValue[])[Number(segments[documentIndex + 1])], 'source document context')
        : fail(`No source-document context at ${path}.`)
      return `${this.baseIri}/source-document/${idSegment(stringValue(document.sourceDocumentId, 'sourceDocumentId'))}`
    }
    if (kind === 'source-goal') {
      const goalIndex = segments.indexOf('sourceGoals')
      if (goalIndex >= 0) {
        const goal = objectValue((collection.sourceGoals as JsonValue[])[Number(segments[goalIndex + 1])], 'source goal context')
        const id = stringValue(goal.sourceGoalId, 'sourceGoalId')
        return this.sourceGoalIris.get(id) ?? fail(`Unknown source goal ${id}.`)
      }
      const edgeIndex = segments.indexOf('edges')
      if (edgeIndex >= 0) {
        const edge = objectValue((collection.edges as JsonValue[])[Number(segments[edgeIndex + 1])], 'mapping edge context')
        const id = stringValue(edge.sourceGoalId, 'mapping sourceGoalId')
        return this.sourceGoalIris.get(id) ?? fail(`Unknown mapping source goal ${id}.`)
      }
    }
    if (kind === 'mapping-edge') {
      const edgeIndex = segments.indexOf('edges')
      const edge = edgeIndex >= 0
        ? objectValue((collection.edges as JsonValue[])[Number(segments[edgeIndex + 1])], 'mapping edge context')
        : fail(`No mapping-edge context at ${path}.`)
      const identity = `${stringValue(edge.sourceGoalId, 'mapping sourceGoalId')}@${stringValue(edge.canonicalGoalId, 'mapping canonicalGoalId')}@${optionalString(edge.matchType) ?? segments[edgeIndex + 1]}`
      return `${this.baseIri}/mapping-edge/${idSegment(identity)}`
    }
    return fail(`Cannot resolve ${kind} context at ${path}.`)
  }

  template(state: ArtifactState, path: string, template: string, language: string) {
    const goal = template.includes('{goalIri}') || template.includes('{examGoalIri}')
      ? this.goalForPath(state, path)
      : null
    const replacements: Record<string, string> = {
      '{recordIri}': this.recordIriForField(state, path),
      '{landscapeIri}': template.includes('{landscapeIri}')
        ? state.artifact.normalizationRole === 'canonical-landscape' ? state.rootIri : fail(`No landscape context at ${path}.`)
        : '',
      '{goalIri}': goal?.iri ?? '',
      '{examGoalIri}': goal?.iri ?? '',
      '{viewIri}': template.includes('{viewIri}') ? this.viewForState(state) : '',
      '{compositionNodeIri}': template.includes('{compositionNodeIri}') ? this.nearestEntity(state, path, 'composition-node') : '',
      '{deckIri}': template.includes('{deckIri}') ? this.deckForState(state) : '',
      '{assetIri}': template.includes('{assetIri}') ? this.nearestEntity(state, path, 'asset') : '',
      '{sourceCollectionIri}': template.includes('{sourceCollectionIri}') ? this.nearestEntity(state, path, 'source-collection') : '',
      '{sourceDocumentIri}': template.includes('{sourceDocumentIri}') ? this.nearestEntity(state, path, 'source-document') : '',
      '{sourceGoalIri}': template.includes('{sourceGoalIri}') ? this.nearestEntity(state, path, 'source-goal') : '',
      '{mappingEdgeIri}': template.includes('{mappingEdgeIri}') ? this.nearestEntity(state, path, 'mapping-edge') : '',
      '{language}': language,
    }
    let result = template
    for (const [placeholder, value] of Object.entries(replacements)) result = result.replaceAll(placeholder, value)
    if (/\{[^}]+\}/u.test(result)) fail(`Unknown registry IRI template placeholder in ${template}.`)
    return result
  }

  languageFor(state: ArtifactState, entry: FieldRegistryEntry) {
    const semantics = objectValue(entry.data.languageSemantics, `${entry.entryId}.languageSemantics`)
    if (semantics.mode === 'from-artifact') {
      const path = stringValue(semantics.sourcePath, `${entry.entryId} language sourcePath`)
      return stringValue(valueAt(state.document, decodeJsonPointer(path)), `${entry.entryId} language`).replace('_', '-')
    }
    if (semantics.mode === 'fixed') {
      return stringValue(semantics.languageTag, `${entry.entryId} fixed language`)
    }
    return state.locale
  }

  condition(state: ArtifactState, path: string, condition: string | undefined) {
    if (!condition || condition === 'always') return true
    if (condition === 'curricular-goal' || condition === 'non-curricular-or-unscoped-goal') {
      const curricular = CURRICULAR_KINDS.has(this.goalForPath(state, path).data.semanticKind as string)
      return condition === 'curricular-goal' ? curricular : !curricular
    }
    if (condition === 'official-source-curriculum-document' || condition === 'official-source-supplemental-document') {
      const segments = decodeJsonPointer(path)
      const documentIndex = segments.indexOf('documents')
      const collection = objectValue((objectValue(state.document, 'official source index').collections as JsonValue[])[Number(segments[1])], 'official source collection')
      const document = objectValue((collection.documents as JsonValue[])[Number(segments[documentIndex + 1])], 'official source document')
      const isCurriculum = document.semanticType === 'curriculum'
      return condition === 'official-source-curriculum-document' ? isCurriculum : !isCurriculum
    }
    fail(`Unsupported registry construction condition: ${condition}`)
  }

  targetIri(entry: FieldRegistryEntry, value: JsonValue, fallbackIri: string) {
    if (typeof value !== 'string') return fallbackIri
    const dependency = objectValue(entry.data.dependencySemantics, `${entry.entryId}.dependencySemantics`)
    const targetKind = optionalString(dependency.targetKind)
    if (targetKind === 'goal') return this.goalIris.get(value) ?? fail(`Unknown goal reference ${value} in ${entry.entryId}.`)
    if (targetKind === 'landscape') return this.landscapeIris.get(value) ?? fail(`Unknown landscape reference ${value} in ${entry.entryId}.`)
    if (targetKind === 'competency-entry') return this.competencyIris.get(value) ?? fail(`Unknown competency reference ${value} in ${entry.entryId}.`)
    if (targetKind === 'resource') return this.resourceIris.get(value) ?? fallbackIri
    return fallbackIri
  }
}

const addType = (triples: SortedUniqueNTriples, subject: string, type: string) => triples.add(subject, RDF_TYPE, iriObject(type))

const emitConstruction = (
  context: SemanticContext,
  state: ArtifactState,
  entry: FieldRegistryEntry,
  path: string,
  value: JsonValue,
  construction: RegistryConstruction,
  triples: SortedUniqueNTriples,
) => {
  const language = context.languageFor(state, entry)
  const predicate = compactIri(construction.predicate, context.namespaces)
  const subject = construction.objectMapping === 'resource'
    ? ''
    : context.template(state, path, construction.subjectTemplate, language)
  if (construction.objectMapping === 'typed-literal') {
    const datatype = compactIri(construction.datatype ?? 'xsd:string', context.namespaces)
    const values = Array.isArray(value) ? value : [value]
    for (const item of values) triples.add(subject, predicate, typedLiteralObject(literalLexical(item, datatype), datatype))
    return
  }
  if (construction.objectMapping === 'language-literal') {
    if (typeof value !== 'string') fail(`${entry.entryId} requires a string language literal.`)
    const languageValue = value as string
    if (construction.resourceClass) {
      addType(triples, subject, compactIri(construction.resourceClass, context.namespaces))
      const owner = context.template(state, path, construction.ownerSubjectTemplate ?? fail(`${entry.entryId} lacks owner template.`), language)
      triples.add(owner, compactIri(construction.ownerPredicate ?? fail(`${entry.entryId} lacks owner predicate.`), context.namespaces), iriObject(subject))
    }
    triples.add(subject, predicate, languageLiteralObject(languageValue, language))
    return
  }
  if (construction.objectMapping === 'iri-reference') {
    const values = Array.isArray(value) ? value : [value]
    values.forEach((item, index) => {
      const fallback = `${context.artifactIri(state)}/reference/${idSegment(entry.entryId)}/${index}/${idSegment(String(item))}`
      triples.add(subject, predicate, iriObject(context.targetIri(entry, item, fallback)))
    })
    return
  }
  if (construction.objectMapping === 'resource') {
    const items = Array.isArray(value)
      ? value.map((item, index) => ({ item, segments: [...decodeJsonPointer(path), String(index)] }))
      : [{ item: value, segments: [...decodeJsonPointer(path)] }]
    const ownerTemplate = construction.ownerSubjectTemplate ?? construction.subjectTemplate
    const ownerPredicate = compactIri(construction.ownerPredicate ?? construction.predicate, context.namespaces)
    for (const { item, segments } of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) fail(`${entry.entryId} resource mapping requires object records.`)
      const resource = context.entityForObjectPath(state, segments)
      const ownerPath = ownerTemplate.includes('{recordIri}') ? path : encodeJsonPointer(segments)
      const owner = context.template(state, ownerPath, ownerTemplate, language)
      triples.add(owner, ownerPredicate, iriObject(resource))
      if (construction.resourceClass) addType(triples, resource, compactIri(construction.resourceClass, context.namespaces))
    }
    return
  }
  if (construction.objectMapping !== 'positioned-membership') fail(`Unsupported object mapping ${construction.objectMapping}.`)
  if (!Array.isArray(value)) return fail(`${entry.entryId} positioned membership requires an array.`)
  const orderedValues = value as JsonValue[]
  const membership = construction.membership ?? fail(`${entry.entryId} lacks membership construction.`)
  const owner = context.template(state, path, construction.subjectTemplate, language)
  const membershipClass = compactIri(membership.membershipClass, context.namespaces)
  const ownerPredicate = compactIri(membership.ownerPredicate, context.namespaces)
  const valuePredicate = compactIri(membership.valuePredicate, context.namespaces)
  const positionPredicate = compactIri(membership.positionPredicate, context.namespaces)
  const separateMembership = membership.membershipClass.endsWith('Membership')
  orderedValues.forEach((item, index) => {
    const itemSegments = [...decodeJsonPointer(path), String(index)]
    const itemPath = encodeJsonPointer(itemSegments)
    const itemRecord = item && typeof item === 'object' && !Array.isArray(item)
      ? context.entityForObjectPath(state, itemSegments)
      : `${owner}/value/${idSegment(entry.entryId)}/${index}`
    const membershipIri = separateMembership
      ? `${owner}/membership/${idSegment(entry.entryId)}/${index}`
      : itemRecord
    triples.add(owner, ownerPredicate, iriObject(membershipIri))
    addType(triples, membershipIri, membershipClass)
    const positionDatatype = positionPredicate === LP_POSITION ? `${XSD}int` : `${XSD}integer`
    triples.add(membershipIri, positionPredicate, typedLiteralObject(String(index + membership.positionBase), positionDatatype))
    if (separateMembership) {
      const target = context.targetIri(entry, item, itemRecord)
      triples.add(membershipIri, valuePredicate, iriObject(target))
      if (target === itemRecord && !(item && typeof item === 'object')) {
        triples.add(target, LP_VALUE, typedLiteralObject(literalLexical(item, `${XSD}string`), `${XSD}string`))
      }
    } else if (membership.membershipClass === 'sp:ScoringStep') {
      triples.add(membershipIri, valuePredicate, iriObject(membershipIri))
    }

    const core = membership.coreProjection
    if (!core) return
    if (core.mode === 'direct-edge') {
      if (entry.entryId === 'landscape.goals') {
        const goal = objectValue(item, `landscape goal membership ${index}`)
        const goalId = stringValue(goal.id, 'goal id')
        if (!context.containedGoalIds.has(goalId) && CURRICULAR_KINDS.has(context.goalKinds.get(goalId) ?? '')) {
          triples.add(owner, compactIri(core.ownerPredicate, context.namespaces), iriObject(context.goalIris.get(goalId) as string))
        }
      } else if (entry.entryId === 'goal.contains' && typeof item === 'string') {
        const source = context.goalForPath(state, path)
        const sourceKind = context.goalKinds.get(source.id)
        const targetKind = context.goalKinds.get(item)
        if (sourceKind === 'curricularArea' && CURRICULAR_KINDS.has(targetKind ?? '')) {
          triples.add(source.iri, compactIri(core.ownerPredicate, context.namespaces), iriObject(context.goalIris.get(item) as string))
        }
      }
    } else if (core.mode === 'reified-reference' && entry.entryId === 'goal.requires' && typeof item === 'string') {
      const source = context.goalForPath(state, path)
      if (CURRICULAR_KINDS.has(context.goalKinds.get(source.id) ?? '') && CURRICULAR_KINDS.has(context.goalKinds.get(item) ?? '')) {
        if (core.resourceClass) addType(triples, membershipIri, compactIri(core.resourceClass, context.namespaces))
        triples.add(source.iri, compactIri(core.ownerPredicate, context.namespaces), iriObject(membershipIri))
        triples.add(membershipIri, compactIri(core.valuePredicate ?? fail('Core reference lacks value predicate.'), context.namespaces), iriObject(context.goalIris.get(item) as string))
      }
    }
    void itemPath
  })
}

const emitRegisteredField = (
  context: SemanticContext,
  registry: FwuOwlFieldRegistry,
  state: ArtifactState,
  entry: FieldRegistryEntry,
  path: string,
  value: JsonValue,
  triples: SortedUniqueNTriples,
) => {
  if (entry.rdfStrategy === 'excluded-generated') return
  if (Array.isArray(value) && value.length === 0) {
    const segments = decodeJsonPointer(path)
    triples.add(
      context.recordIriForField(state, path),
      SP_FIELD_STATE,
      typedLiteralObject(
        compactCanonicalJsonText({
          entryId: entry.entryId,
          field: segments.at(-1) ?? fail(`Empty-array field has no path segment: ${entry.entryId}`),
          state: 'present-empty-array',
        }),
        `${XSD}string`,
      ),
    )
  }
  if (entry.rdfStrategy === 'registered-canonical-json-literal') {
    const literal = registry.projectCanonicalJsonLiteral(state.artifact.normalizationRole, path, value)
    const predicate = compactIri(entry.canonicalJsonLiteral?.predicate ?? fail(`${entry.entryId} lacks canonical literal predicate.`), context.namespaces)
    triples.add(context.recordIriForField(state, path), predicate, typedLiteralObject(literal.text, `${XSD}string`))
    return
  }
  const primary = constructionFor(entry, 'construction') ?? fail(`${entry.entryId} lacks construction.`)
  const fallback = constructionFor(entry, 'fallbackConstruction')
  if (
    Array.isArray(value) &&
    primary.objectMapping === 'resource' &&
    primary.condition !== undefined &&
    primary.condition !== 'always'
  ) {
    value.forEach((item, index) => {
      const itemPath = encodeJsonPointer([...decodeJsonPointer(path), String(index)])
      const itemConstruction = context.condition(state, itemPath, primary.condition)
        ? primary
        : fallback && context.condition(state, itemPath, fallback.condition) ? fallback : null
      if (itemConstruction) emitConstruction(context, state, entry, itemPath, item, itemConstruction, triples)
    })
    return
  }
  const selected = context.condition(state, path, primary.condition)
    ? primary
    : fallback && context.condition(state, path, fallback.condition) ? fallback : null
  if (selected) emitConstruction(context, state, entry, path, value, selected, triples)
}

const traverseArtifact = (
  context: SemanticContext,
  registry: FwuOwlFieldRegistry,
  state: ArtifactState,
  triples: SortedUniqueNTriples,
) => {
  const walk = (value: JsonValue, segments: string[], canonicalAncestor: FieldRegistryEntry | null) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return
    for (const key of Object.keys(value).sort(compareCodeUnits)) {
      const child = value[key]
      const childSegments = [...segments, key]
      const path = encodeJsonPointer(childSegments)
      const direct = registry.direct(state.artifact.normalizationRole, path)
      const effective = direct ?? registry.effective(state.artifact.normalizationRole, path)
      const inheritedComplete = canonicalAncestor?.canonicalJsonLiteral?.subtreeProjection === 'complete-value' && direct === undefined
      if (!inheritedComplete && direct) emitRegisteredField(context, registry, state, direct, path, child, triples)
      const nextCanonical = direct?.rdfStrategy === 'registered-canonical-json-literal' ? direct : canonicalAncestor
      if (Array.isArray(child)) {
        child.forEach((item, index) => {
          if (item && typeof item === 'object' && !Array.isArray(item)) walk(item, [...childSegments, String(index)], nextCanonical)
        })
      } else if (child && typeof child === 'object') walk(child, childSegments, nextCanonical)
      void effective
    }
  }
  walk(state.document, [], null)
}

const addCurriculumIdentityProjection = (
  context: SemanticContext,
  state: ArtifactState,
  root: JsonObject,
  triples: SortedUniqueNTriples,
) => {
  const identity = profileMapping(context.curriculumProfile, 'curriculumIdentity')
  const coreTerms = compactProfileTerms(context, identity, 'coreTerms')
  const applicationTerms = compactProfileTerms(context, identity, 'applicationTerms')
  const subject = coreTerms.find((term) => term.startsWith('http://w3id.org/kim/schulfaecher/'))
    ?? fail('Curriculum identity profile lacks one KIM school-subject individual.')
  const schoolType = coreTerms.find((term) => term.startsWith('https://w3id.org/kim/schularten/'))
    ?? fail('Curriculum identity profile lacks one KIM school-type individual.')
  for (const required of [
    LP_SCHOOL_SUBJECT,
    LP_SCHOOL_TYPE,
    LP_HAS_SCHOOL_SUBJECT,
    LP_FOR_SCHOOL_TYPE,
    `${SP}LearningLandscape`,
    `${SP}skillpilotId`,
  ]) {
    if (![...coreTerms, ...applicationTerms].includes(required)) {
      fail(`Curriculum identity profile lacks required term ${required}.`)
    }
  }
  addType(triples, state.rootIri, `${SP}LearningLandscape`)
  triples.add(state.rootIri, LP_HAS_SCHOOL_SUBJECT, iriObject(subject))
  triples.add(state.rootIri, LP_FOR_SCHOOL_TYPE, iriObject(schoolType))
  addType(triples, subject, LP_SCHOOL_SUBJECT)
  addType(triples, schoolType, LP_SCHOOL_TYPE)
  triples.add(subject, `${RDFS}label`, languageLiteralObject('Mathematik', 'de'))
  triples.add(schoolType, `${RDFS}label`, languageLiteralObject('Gymnasium', 'de'))
  triples.add(
    state.rootIri,
    `${SP}skillpilotId`,
    typedLiteralObject(stringValue(root.landscapeId, 'canonical landscapeId'), `${XSD}string`),
  )

  addCoreTextResource(
    triples,
    state.rootIri,
    LP_HAS_TITLE,
    `${state.rootIri}/title/de`,
    LP_TITLE,
    root.title,
    'de',
  )
  addCoreTextResource(
    triples,
    state.rootIri,
    LP_HAS_TITLE,
    `${state.rootIri}/title/en`,
    LP_TITLE,
    root.titleEn,
    'en',
  )
  for (const language of ['de', 'en'] as const) {
    const value = language === 'de' ? root.title : root.titleEn
    if (typeof value === 'string' && value.length > 0) {
      triples.add(state.rootIri, LP_DESCRIBED_BY, iriObject(`${state.rootIri}/title/${language}`))
    }
  }
  addCoreTextResource(
    triples,
    state.rootIri,
    LP_HAS_DESCRIPTION,
    `${state.rootIri}/description/de`,
    LP_DESCRIPTION,
    root.description,
    'de',
  )
  addCoreTextResource(
    triples,
    state.rootIri,
    LP_HAS_DESCRIPTION,
    `${state.rootIri}/description/en`,
    LP_DESCRIPTION,
    root.descriptionEn,
    'en',
  )
}

const addProgramUnitCoreProjection = (
  context: SemanticContext,
  state: ArtifactState,
  root: JsonObject,
  triples: SortedUniqueNTriples,
) => {
  const programMapping = profileMapping(context.curriculumProfile, 'programUnits')
  const stageMapping = objectValue(programMapping.stage, 'program-unit stage mapping')
  const yearMapping = objectValue(programMapping.year, 'program-unit year mapping')
  const stageLookup = objectValue(programMapping.stageLookup, 'program-unit stage lookup')
  const yearLookup = objectValue(programMapping.yearLookup, 'program-unit year lookup')
  const stageValues = objectValue(stageLookup.values, 'program-unit stage lookup values')
  const yearValues = objectValue(yearLookup.values, 'program-unit year lookup values')
  const hierarchyPredicate = compactIri(
    stringValue(programMapping.hierarchyPredicate, 'program-unit hierarchy predicate'),
    context.namespaces,
  )
  if (hierarchyPredicate !== LP_HAS_UNIT) fail('Program-unit hierarchy profile must use the Core unit predicate.')
  const units = Array.isArray(root.programUnits) ? root.programUnits : []
  const iris = new Map<string, string>()
  units.forEach((value, index) => {
    const unit = objectValue(value, `program unit ${index}`)
    const id = stringValue(unit.id, `program unit ${index} id`)
    const iri = context.entityForObjectPath(state, ['programUnits', String(index)])
    iris.set(id, iri)
    addType(triples, iri, `${SP}ProgramUnit`)
    triples.add(iri, `${SP}skillpilotId`, typedLiteralObject(id, `${XSD}string`))
    if (typeof unit.label === 'string') triples.add(iri, `${RDFS}label`, languageLiteralObject(unit.label, 'de'))
    if (unit.kind === 'stage' && typeof unit.shortLabel === 'string') {
      const target = stageValues[unit.shortLabel]
      if (typeof target === 'string') triples.add(iri, LP_HAS_STAGE, iriObject(compactIri(target, context.namespaces)))
    }
    if (unit.kind === 'year' && typeof unit.order === 'number') {
      const target = yearValues[String(unit.order)]
      if (typeof target === 'string') triples.add(iri, LP_HAS_GRADE, iriObject(compactIri(target, context.namespaces)))
    }
  })
  for (const value of units) {
    const unit = objectValue(value, 'program unit')
    if (typeof unit.parentUnitId !== 'string') continue
    const parent = iris.get(unit.parentUnitId) ?? fail(`Unknown program-unit parent ${unit.parentUnitId}.`)
    const child = iris.get(stringValue(unit.id, 'program unit id')) as string
    triples.add(parent, hierarchyPredicate, iriObject(child))
  }
  for (const required of [LP_HAS_STAGE, LP_HAS_GRADE]) {
    const terms = required === LP_HAS_STAGE
      ? compactProfileTerms(context, stageMapping, 'coreTerms')
      : compactProfileTerms(context, yearMapping, 'coreTerms')
    if (!terms.includes(required)) fail(`Program-unit profile lacks required Core predicate ${required}.`)
  }

  const placements = Array.isArray(root.goalPlacements) ? root.goalPlacements : []
  placements.forEach((value, index) => {
    objectValue(value, `goal placement ${index}`)
    addType(triples, context.entityForObjectPath(state, ['goalPlacements', String(index)]), `${SP}GoalPlacement`)
  })
}

const addCompetencyAxisCoreProjection = (
  context: SemanticContext,
  state: ArtifactState,
  root: JsonObject,
  triples: SortedUniqueNTriples,
) => {
  const mapping = profileMapping(context.curriculumProfile, 'processCompetencyCatalog')
  const coreTerms = compactProfileTerms(context, mapping, 'coreTerms')
  if (!coreTerms.includes(LP_PROCESS_COMPETENCY_AREA) || !coreTerms.includes(LP_REFERENCE)) {
    fail('Process-competency profile lacks its Core area/reference terms.')
  }
  const subject = compactProfileTerms(
    context,
    profileMapping(context.curriculumProfile, 'curriculumIdentity'),
    'coreTerms',
  ).find((term) => term.startsWith('http://w3id.org/kim/schulfaecher/'))
    ?? fail('Curriculum identity profile lacks its KIM subject.')
  const catalog = Array.isArray(root.competencyCatalog) ? root.competencyCatalog : []
  const axisIris = new Map<string, string>()

  const addAxis = (axisId: string, title: string, code: string, axisClass: string) => {
    const projected = axisIris.get(axisId)
    if (projected) return projected
    const existing = axisIris.get(axisId) ?? context.competencyIris.get(axisId)
    const iri = existing ?? `${state.rootIri}/competency/${idSegment(axisId)}`
    axisIris.set(axisId, iri)
    addType(triples, iri, axisClass)
    triples.add(iri, LP_HAS_SCHOOL_SUBJECT, iriObject(subject))
    triples.add(iri, `${SP}skillpilotId`, typedLiteralObject(axisId, `${XSD}string`))
    triples.add(iri, `${RDFS}label`, languageLiteralObject(title, 'de'))
    addCoreTextResource(triples, iri, LP_HAS_TITLE, `${iri}/title/de`, LP_TITLE, title, 'de')
    addCoreTextResource(triples, iri, LP_HAS_NUMBER, `${iri}/number`, LP_IDENTIFIER, code)
    return iri
  }

  catalog.forEach((value, index) => {
    const record = objectValue(value, `competency catalog entry ${index}`)
    const axisId = stringValue(record.id, `competency catalog entry ${index} id`)
    const code = axisId.replace(/^PROCESS\./u, '')
    addAxis(axisId, stringValue(record.label, `competency catalog entry ${axisId} label`), code, LP_PROCESS_COMPETENCY_AREA)
  })

  const goals = (root.goals as JsonValue[]).map((value) => objectValue(value, 'canonical goal'))
  const curricularGoals = goals.filter((goal) => CURRICULAR_KINDS.has(String(goal.semanticKind)))
  const processCodes = new Set<string>()
  const guidingCodes = new Set<string>()
  curricularGoals.forEach((goal) => {
    if (!goal.dimensionTags || typeof goal.dimensionTags !== 'object' || Array.isArray(goal.dimensionTags)) return
    stringArray(goal.dimensionTags.processCompetencies)
      .filter((code) => /^K[1-6](?:\.[0-9]+)?$/u.test(code))
      .forEach((code) => {
        processCodes.add(code)
        const parent = code.match(/^(K[1-6])\./u)?.[1]
        if (parent) processCodes.add(parent)
      })
    stringArray(goal.dimensionTags.guidingIdeas)
      .filter((code) => /^L[1-5]$/u.test(code))
      .forEach((code) => guidingCodes.add(code))
  })
  ;[...processCodes].sort(compareCodeUnits).forEach((code) => {
    addAxis(processAxisId(code), code, code, LP_PROCESS_COMPETENCY_AREA)
  })
  ;[...processCodes].sort(compareCodeUnits).forEach((code) => {
    const parent = code.match(/^(K[1-6])\./u)?.[1]
    if (parent) triples.add(axisIris.get(processAxisId(parent)) as string, BFO_HAS_PART, iriObject(axisIris.get(processAxisId(code)) as string))
  })
  ;[...guidingCodes].sort(compareCodeUnits).forEach((code) => {
    addAxis(guidingIdeaAxisId(code), GUIDING_IDEA_TITLES.get(code) ?? code, code, LP_GUIDING_IDEA)
  })

  curricularGoals.forEach((goal) => {
    const goalId = stringValue(goal.id, 'canonical goal id')
    const goalIri = context.goalIris.get(goalId) as string
    const references = new Map<string, { iri: string; roles: Set<string> }>()
    const addReference = (axisId: string, target: string, role: string) => {
      const current = references.get(axisId) ?? { iri: target, roles: new Set<string>() }
      if (current.iri !== target) fail(`Conflicting competency target for ${axisId}.`)
      current.roles.add(role)
      references.set(axisId, current)
    }
    ;[...stringArray(goal.kompetenzen), ...stringArray(goal.competencyRefs)].forEach((value) => {
      const axisId = /^K[1-6](?:\.[0-9]+)?$/u.test(value) ? processAxisId(value) : value
      const target = axisIris.get(axisId) ?? context.competencyIris.get(axisId)
        ?? fail(`Unknown authored competency reference ${value}.`)
      addReference(axisId, target, REFERENCE_ROLE_COMPETENCY_REFS)
    })
    if (goal.dimensionTags && typeof goal.dimensionTags === 'object' && !Array.isArray(goal.dimensionTags)) {
      stringArray(goal.dimensionTags.processCompetencies).forEach((code) => {
        const axisId = processAxisId(code)
        const target = axisIris.get(axisId)
        if (target) addReference(axisId, target, REFERENCE_ROLE_PROCESS_COMPETENCIES)
      })
      stringArray(goal.dimensionTags.guidingIdeas).forEach((code) => {
        const axisId = guidingIdeaAxisId(code)
        const target = axisIris.get(axisId)
        if (target) addReference(axisId, target, REFERENCE_ROLE_GUIDING_IDEAS)
      })
    }
    ;[...references].sort(([left], [right]) => compareCodeUnits(left, right)).forEach(([axisId, reference]) => {
      const referenceIri = `${goalIri}/core-reference/${idSegment(axisId)}`
      addType(triples, referenceIri, LP_REFERENCE)
      triples.add(goalIri, LP_HAS_REFERENCE, iriObject(referenceIri))
      triples.add(referenceIri, LP_REFERS_TO, iriObject(reference.iri))
      ;[...reference.roles].sort(compareCodeUnits).forEach((role) => {
        triples.add(referenceIri, `${SP}referenceRole`, typedLiteralObject(role, `${XSD}string`))
      })
    })
  })
}

const addManualArtifactSemantics = (
  context: SemanticContext,
  state: ArtifactState,
  triples: SortedUniqueNTriples,
) => {
  const role = state.artifact.normalizationRole
  const root = objectValue(state.document, `${role} root`)
  if (role === 'canonical-landscape') {
    addCurriculumIdentityProjection(context, state, root, triples)
    const semanticKinds = objectValue(context.curriculumProfile.semanticKinds, 'curriculum profile semanticKinds')
    const goals = root.goals as JsonValue[]
    const curricularAreaParents = new Map<string, string[]>()
    goals.forEach((value, goalIndex) => {
      const goal = objectValue(value, 'canonical goal')
      const id = stringValue(goal.id, 'canonical goal id')
      const kind = stringValue(goal.semanticKind, `goal ${id} semanticKind`)
      const goalIri = context.goalIris.get(id) as string
      addType(triples, goalIri, `${SP}LearningGoal`)
      const decision = objectValue(semanticKinds[kind], `semanticKind ${kind}`)
      const coreClasses = Array.isArray(decision.coreClasses) ? decision.coreClasses : []
      const applicationClasses = Array.isArray(decision.applicationClasses) ? decision.applicationClasses : []
      for (const value of [...coreClasses, ...applicationClasses]) {
        addType(triples, goalIri, compactIri(stringValue(value, `semanticKind ${kind} class`), context.namespaces))
      }
      if (CURRICULAR_KINDS.has(kind)) {
        const titleIri = `${goalIri}/title/${idSegment(state.locale)}`
        triples.add(goalIri, LP_DESCRIBED_BY, iriObject(titleIri))
      }
      if (goal.examData && typeof goal.examData === 'object' && !Array.isArray(goal.examData)) {
        addType(triples, context.entityForObjectPath(state, ['goals', String(goalIndex), 'examData']), `${SP}AssessmentData`)
      }
      if (kind === 'curricularArea' && Array.isArray(goal.contains)) {
        for (const childIdValue of goal.contains) {
          if (typeof childIdValue !== 'string' || !CURRICULAR_KINDS.has(context.goalKinds.get(childIdValue) ?? '')) continue
          triples.add(goalIri, BFO_HAS_PART, iriObject(context.goalIris.get(childIdValue) as string))
          if (context.goalKinds.get(childIdValue) === 'curricularAtomic') {
            const parents = curricularAreaParents.get(childIdValue) ?? []
            parents.push(id)
            curricularAreaParents.set(childIdValue, parents)
          }
        }
      }
    })
    const unscopedAtoms = goals
      .map((value) => objectValue(value, 'canonical goal'))
      .filter((goal) => goal.semanticKind === 'curricularAtomic' && !curricularAreaParents.has(stringValue(goal.id, 'goal id')))
    if (unscopedAtoms.length > 0) {
      const fallbackArea = `${state.rootIri}/core-projection/unscoped-curricular-area`
      addType(triples, fallbackArea, LP_CURRICULAR_AREA)
      const title = `${fallbackArea}/title/${idSegment(state.locale)}`
      addType(triples, title, LP_TITLE)
      triples.add(title, LP_VALUE, languageLiteralObject('Nicht direkt zugeordnete fachliche Lernziele', state.locale))
      triples.add(fallbackArea, LP_HAS_TITLE, iriObject(title))
      triples.add(fallbackArea, LP_DESCRIBED_BY, iriObject(title))
      unscopedAtoms.forEach((goal) => {
        triples.add(fallbackArea, BFO_HAS_PART, iriObject(context.goalIris.get(stringValue(goal.id, 'goal id')) as string))
      })
    }
    addProgramUnitCoreProjection(context, state, root, triples)
    addCompetencyAxisCoreProjection(context, state, root, triples)
    addResourceAndViewLinks(context, state, triples)
  } else if (role === 'composition-view') {
    addType(triples, state.rootIri, `${SP}CompositionView`)
    const walkNodes = (nodes: JsonValue[], path: string[]) => nodes.forEach((value, index) => {
      const node = objectValue(value, 'composition node')
      const segments = [...path, String(index)]
      const iri = context.entityForObjectPath(state, segments)
      addType(triples, iri, `${SP}CompositionNode`)
      if (typeof node.goalId === 'string') {
        triples.add(iri, `${SP}compositionGoal`, iriObject(context.goalIris.get(node.goalId) ?? fail(`Unknown view goal ${node.goalId}.`)))
      }
      if (Array.isArray(node.children)) walkNodes(node.children, [...segments, 'children'])
    })
    walkNodes(root.rootNodes as JsonValue[], ['rootNodes'])
  } else if (role === 'card-deck') {
    addType(triples, state.rootIri, `${SP}CardDeck`)
    const cards = Array.isArray(root.cards) ? root.cards : []
    cards.forEach((_value, index) => addType(triples, context.entityForObjectPath(state, ['cards', String(index)]), `${SP}Card`))
  } else if (role === 'resource-index') {
    const resources = root.resources as JsonValue[]
    resources.forEach((value, index) => {
      const record = objectValue(value, 'resource record')
      const iri = context.entityForObjectPath(state, ['resources', String(index)])
      addType(triples, iri, record.delivery === 'embedded' ? `${SP}BinaryResource` : `${SP}Resource`)
      if (record.delivery === 'embedded') {
        triples.add(iri, `${SP}resourceId`, typedLiteralObject(stringValue(record.resourceId, 'resourceId'), `${XSD}string`))
        triples.add(iri, `${SP}publicReference`, typedLiteralObject(stringValue(record.publicUrl, 'resource publicUrl'), `${XSD}string`))
        triples.add(iri, `${SP}mediaType`, typedLiteralObject(stringValue(record.mediaType, 'resource mediaType'), `${XSD}string`))
        triples.add(iri, `${SP}byteLength`, typedLiteralObject(String(record.bytes), `${XSD}nonNegativeInteger`))
        triples.add(iri, `${SP}sha256`, typedLiteralObject(stringValue(record.sha256, 'resource sha256'), `${XSD}string`))
      }
    })
  }
}

const addResourceAndViewLinks = (
  context: SemanticContext,
  state: ArtifactState,
  triples: SortedUniqueNTriples,
) => {
  const root = objectValue(state.document, 'canonical landscape')
  const resourcesByUrl = new Map<string, string>()
  for (const artifact of context.artifacts) {
    if (artifact.artifact.normalizationRole !== 'resource-index') continue
    const resourceRoot = objectValue(artifact.document, 'resource index')
    for (const value of resourceRoot.resources as JsonValue[]) {
      const record = objectValue(value, 'resource record')
      if (typeof record.publicUrl === 'string') resourcesByUrl.set(record.publicUrl, context.resourceIris.get(stringValue(record.resourceId, 'resourceId')) as string)
    }
  }
  ;(root.goals as JsonValue[]).forEach((value, goalIndex) => {
    const goal = objectValue(value, 'canonical goal')
    const goalId = stringValue(goal.id, 'goal id')
    const goalIri = context.goalIris.get(goalId) as string
    const links = Array.isArray(goal.resourceLinks) ? goal.resourceLinks : []
    links.forEach((linkValue, linkIndex) => {
      const link = objectValue(linkValue, 'goal resource link')
      const linkIri = context.entityForObjectPath(state, ['goals', String(goalIndex), 'resourceLinks', String(linkIndex)])
      const url = stringValue(link.url, 'goal resource link url')
      const resourceIri = resourcesByUrl.get(url) ?? `${linkIri}/external-resource`
      addType(triples, resourceIri, `${SP}Resource`)
      triples.add(linkIri, `${SP}referencesResource`, iriObject(resourceIri))
      if (CURRICULAR_KINDS.has(context.goalKinds.get(goalId) ?? '') && link.type === 'goal-visualization') {
        addType(triples, linkIri, LP_REFERENCE)
        triples.add(goalIri, LP_HAS_REFERENCE, iriObject(linkIri))
        triples.add(linkIri, LP_REFERS_TO, iriObject(resourceIri))
      }
    })
  })
}

export const compileFwuOwlSemantics = (options: {
  source: ValidatedSourceJsonPackage
  registryValue: JsonObject
  curriculumProfile: JsonObject
  packageProfile: JsonObject
}): FwuOwlCompilationResult => {
  const registry = new FwuOwlFieldRegistry(options.registryValue)
  if (registry.registryId !== 'skillpilot-fwu-field-semantics-v1' || registry.entries.length !== 454) {
    fail(`Unsupported field registry ${registry.registryId} with ${registry.entries.length} entries.`)
  }
  const vocabulary = derivePackageVocabularyDeclarations(
    options.registryValue,
    objectValue(options.packageProfile.declarationPolicy, 'FWU-OWL declaration policy'),
  )
  let observationCount = 0
  const observedEntryIds = new Set<string>()
  const artifacts: ArtifactState[] = options.source.logicalArtifacts.map((artifact) => {
    const segmentId = FWU_OWL_SEGMENT_ROUTING[artifact.normalizationRole]
      ?? fail(`No FWU-OWL RDF segment routing for normalization role ${artifact.normalizationRole}.`)
    const normalized = registry.normalizeAndCover(
      artifact.normalizationRole,
      artifact.document as JsonValue,
      {
        retainDetails: false,
        onField: (observation) => {
          observationCount += 1
          observedEntryIds.add(observation.entryId)
        },
      },
    )
    const normalizedBytes = compactCanonicalJsonBytes(normalized.normalized)
    const normalizedSha256 = createHash('sha256').update(normalizedBytes).digest('hex')
    if (normalizedBytes.length !== artifact.normalizedBytes || normalizedSha256 !== artifact.normalizedSha256) {
      fail(`Registry-normalized logical artifact differs from semantic-content-index: ${artifact.logicalId}.`)
    }
    const root = normalized.normalized && typeof normalized.normalized === 'object' && !Array.isArray(normalized.normalized)
      ? normalized.normalized
      : fail(`Logical artifact ${artifact.logicalId} root must be an object.`)
    const locale = optionalString(root.locale) ?? optionalString(root.language) ?? 'de'
    const initialRoot = `https://skillpilot.de/id/curriculum-package/${idSegment(options.source.manifest.releaseId)}/artifact/${idSegment(artifact.normalizationRole)}/${idSegment(artifact.logicalId)}`
    return { artifact, document: normalized.normalized, segmentId, rootIri: initialRoot, locale }
  })
  const context = new SemanticContext(options.source.manifest.releaseId, options.registryValue, artifacts, options.curriculumProfile)
  const orderedArtifacts = [...artifacts].sort((left, right) => compareCodeUnits(left.artifact.logicalId, right.artifact.logicalId))

  const landscape = artifacts.find((state) => state.artifact.normalizationRole === 'canonical-landscape')
    ?? fail('FWU-OWL package requires one canonical landscape.')
  const root = objectValue(landscape.document, 'canonical landscape')
  const parentedAtoms = new Set<string>()
  ;(root.goals as JsonValue[]).forEach((value) => {
    const parent = objectValue(value, 'goal')
    if (parent.semanticKind !== 'curricularArea' || !Array.isArray(parent.contains)) return
    parent.contains.forEach((child) => {
      if (typeof child === 'string' && context.goalKinds.get(child) === 'curricularAtomic') parentedAtoms.add(child)
    })
  })
  const generatedFallbackAreaCount = (root.goals as JsonValue[]).some((value) => {
    const goal = objectValue(value, 'goal')
    return goal.semanticKind === 'curricularAtomic' && !parentedAtoms.has(stringValue(goal.id, 'goal id'))
  }) ? 1 : 0

  const usedApplicationTerms = new Set<string>()
  const segments = Object.fromEntries(FWU_OWL_SEGMENT_ORDER.map((segmentId) => {
    const segmentTriples = new SortedUniqueNTriples()
    if (segmentId === 'declarations') {
      vocabulary.declarationTriples.forEach((line) => {
        const match = /^<([^>]+)> <([^>]+)> <([^>]+)> \.\n$/u.exec(line)
          ?? fail('Generated declaration is not one canonical IRI triple.')
        segmentTriples.add(match[1], match[2], iriObject(match[3]))
      })
    } else {
      orderedArtifacts.forEach((state) => {
        if (state.segmentId !== segmentId) return
        addManualArtifactSemantics(context, state, segmentTriples)
        traverseArtifact(context, registry, state, segmentTriples)
      })
    }
    segmentTriples.referencedIris(vocabulary.applicationSummary.namespace)
      .forEach((iri) => usedApplicationTerms.add(iri))
    const serialized = segmentTriples.drainSerialize()
    if (serialized.tripleCount === 0) fail(`Normative RDF segment ${segmentId} is empty.`)
    return [segmentId, { segmentId, ...serialized }]
  })) as Record<FwuOwlSegmentId, CompiledFwuOwlSegment>
  const declaredApplicationTerms = new Set([
    ...vocabulary.classes,
    ...vocabulary.objectProperties,
    ...vocabulary.datatypeProperties,
  ])
  const undeclaredApplicationTerms = [...usedApplicationTerms]
    .filter((iri) => !declaredApplicationTerms.has(iri))
    .sort(compareCodeUnits)
  if (undeclaredApplicationTerms.length > 0) {
    fail(`RDF uses undeclared application terms: ${undeclaredApplicationTerms.join(', ')}`)
  }
  return {
    segments,
    logicalArtifactCount: artifacts.length,
    fieldRegistryEntryCount: registry.entries.length,
    observedRegistryEntryCount: observedEntryIds.size,
    observationCount,
    generatedFallbackAreaCount,
    applicationVocabulary: vocabulary.applicationSummary,
    registryVocabulary: vocabulary.registrySummary,
    parserBootstrapPropertyCount: vocabulary.parserBootstrapPropertyCount,
    declarationTripleCount: vocabulary.declarationTripleCount,
  }
}

export const fwuOwlSemanticCompilationDigest = (result: FwuOwlCompilationResult) => {
  const hash = createHash('sha256')
  FWU_OWL_SEGMENT_ORDER.forEach((segmentId) => hash.update(result.segments[segmentId].content))
  return hash.digest('hex')
}

export const coreProjectionConstants = Object.freeze({
  curricularAtomic: LP_CURRICULAR_ATOMIC,
  curricularArea: LP_CURRICULAR_AREA,
  didacticPrerequisite: LP_DIDACTIC_PREREQUISITE,
  position: LP_POSITION,
  namedIndividual: OWL_NAMED_INDIVIDUAL,
  description: LP_DESCRIPTION,
  hasDescription: LP_HAS_DESCRIPTION,
  dctermsDescription: `${DCTERMS}description`,
  schemaImageObject: `${SCHEMA}ImageObject`,
})
