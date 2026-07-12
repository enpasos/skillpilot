import { Buffer } from 'node:buffer'

export type JsonPrimitive = null | boolean | number | string
export type JsonArray = JsonValue[]
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonArray | JsonObject

export type JsonTypeName =
  | 'array'
  | 'boolean'
  | 'integer'
  | 'number'
  | 'object'
  | 'string'
  | 'null'

export type FieldClassification =
  | 'scalar'
  | 'ordered-list'
  | 'set'
  | 'map'
  | 'binary-reference'
  | 'generated-non-semantic'

export type RdfMappingStrategy =
  | 'fwu-core'
  | 'skillpilot-profile'
  | 'registered-canonical-json-literal'
  | 'excluded-generated'

export type JsonPointerPatternSpecificity = readonly [
  literalSegmentCount: number,
  negativeRecursiveWildcardCount: number,
  segmentCount: number,
]

export interface CanonicalJsonLiteralContract {
  readonly predicate: string
  readonly datatype: string
  readonly maxBytes: number
  readonly granularity: string
  readonly subtreeProjection: 'complete-value' | 'exclude-more-specific-descendants'
}

export interface FieldRegistryEntry {
  readonly entryId: string
  readonly artifactRole: string
  readonly pathPattern: string
  readonly pattern: readonly string[]
  readonly specificity: JsonPointerPatternSpecificity
  readonly classification: FieldClassification
  readonly rdfStrategy: RdfMappingStrategy
  readonly canonicalJsonLiteral?: CanonicalJsonLiteralContract
  readonly data: Readonly<JsonObject>
}

export interface EffectiveFieldRegistryMatch {
  readonly entry: FieldRegistryEntry
  readonly inheritedFromCanonicalJsonLiteral: boolean
  readonly matchedPath: string
}

export interface FieldRegistryObservation {
  readonly entryId: string
  readonly artifactRole: string
  readonly path: string
  readonly jsonType: JsonTypeName
  readonly inheritedFromCanonicalJsonLiteral: boolean
  readonly excludedGenerated: boolean
}

export interface FieldRegistryCoverageEntry {
  readonly entryId: string
  readonly artifactRole: string
  readonly pathPattern: string
  readonly classification: FieldClassification
  readonly instanceCount: number
  readonly directInstanceCount: number
  readonly inheritedInstanceCount: number
  readonly excludedGeneratedCount: number
  readonly observedTypes: readonly JsonTypeName[]
  readonly concretePaths: readonly string[]
}

export interface CanonicalJsonLiteralProjection {
  readonly entry: FieldRegistryEntry
  readonly path: string
  readonly value: JsonValue
  readonly text: string
  readonly bytes: Buffer
}

export interface FieldRegistryNormalizationResult {
  readonly normalized: JsonValue
  readonly observations: readonly FieldRegistryObservation[]
  readonly coverage: readonly FieldRegistryCoverageEntry[]
  readonly excludedGeneratedPaths: readonly string[]
  readonly canonicalJsonLiterals: readonly {
    entryId: string
    path: string
    byteLength: number
  }[]
}

export interface FieldRegistryNormalizationOptions {
  /** Receives observations in deterministic traversal order. */
  readonly onField?: (observation: FieldRegistryObservation, value: JsonValue) => void
  /** Avoid retaining per-path diagnostic arrays when a streaming consumer only needs the normalized value. */
  readonly retainDetails?: boolean
}

export class FwuOwlFieldRegistryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FwuOwlFieldRegistryError'
  }
}

const FIELD_CLASSIFICATIONS = new Set<FieldClassification>([
  'scalar',
  'ordered-list',
  'set',
  'map',
  'binary-reference',
  'generated-non-semantic',
])

const RDF_MAPPING_STRATEGIES = new Set<RdfMappingStrategy>([
  'fwu-core',
  'skillpilot-profile',
  'registered-canonical-json-literal',
  'excluded-generated',
])

const JSON_TYPE_NAMES = new Set<JsonTypeName>([
  'array',
  'boolean',
  'integer',
  'number',
  'object',
  'string',
  'null',
])

const isPlainJsonObject = (value: unknown): value is JsonObject => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

const validateJsonString = (value: string, context: string) => {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index)
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new FwuOwlFieldRegistryError(`Unpaired high surrogate in ${context}`)
      }
      index += 1
      continue
    }
    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      throw new FwuOwlFieldRegistryError(`Unpaired low surrogate in ${context}`)
    }
    if (codeUnit === 0xfffe || codeUnit === 0xffff) {
      throw new FwuOwlFieldRegistryError(`Forbidden Unicode noncharacter in ${context}`)
    }
    if (codeUnit < 0x20 && codeUnit !== 0x09 && codeUnit !== 0x0a && codeUnit !== 0x0d) {
      throw new FwuOwlFieldRegistryError(`XML/RDF-unsafe control character in ${context}`)
    }
  }
}

/**
 * Validate that a runtime value is losslessly representable as the JSON value
 * model used by the release compiler. This intentionally rejects getters,
 * symbols, sparse arrays, cycles, and the non-finite numbers that JSON.stringify
 * would otherwise silently rewrite.
 */
export const assertJsonValue: (value: unknown, context?: string) => asserts value is JsonValue = (
  value,
  context = 'JSON value',
) => {
  const ancestors = new WeakSet<object>()

  const visit = (candidate: unknown, location: string): void => {
    if (candidate === null || typeof candidate === 'boolean') return
    if (typeof candidate === 'number') {
      if (!Number.isFinite(candidate)) {
        throw new FwuOwlFieldRegistryError(`Non-finite number in ${location}`)
      }
      return
    }
    if (typeof candidate === 'string') {
      validateJsonString(candidate, location)
      return
    }
    if (typeof candidate !== 'object') {
      throw new FwuOwlFieldRegistryError(`Unsupported ${typeof candidate} in ${location}`)
    }
    if (ancestors.has(candidate)) {
      throw new FwuOwlFieldRegistryError(`Cyclic value in ${location}`)
    }
    ancestors.add(candidate)
    try {
      if (Array.isArray(candidate)) {
        for (let index = 0; index < candidate.length; index += 1) {
          if (!(index in candidate)) {
            throw new FwuOwlFieldRegistryError(`Sparse JSON array in ${location}`)
          }
          visit(candidate[index], `${location}/${index}`)
        }
        return
      }
      if (!isPlainJsonObject(candidate)) {
        throw new FwuOwlFieldRegistryError(`Non-plain JSON object in ${location}`)
      }
      if (Object.getOwnPropertySymbols(candidate).length !== 0) {
        throw new FwuOwlFieldRegistryError(`Symbol-keyed property in ${location}`)
      }
      for (const key of Object.keys(candidate)) {
        validateJsonString(key, `${location} object key`)
        const descriptor = Object.getOwnPropertyDescriptor(candidate, key)
        if (descriptor === undefined || !descriptor.enumerable || !('value' in descriptor)) {
          throw new FwuOwlFieldRegistryError(`Non-data JSON property ${key} in ${location}`)
        }
        visit(descriptor.value, `${location}/${escapeJsonPointerSegment(key)}`)
      }
    } finally {
      ancestors.delete(candidate)
    }
  }

  visit(value, context)
}

export const compareUnicodeCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (character) => character.codePointAt(0) as number)
  const rightPoints = Array.from(right, (character) => character.codePointAt(0) as number)
  const sharedLength = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < sharedLength; index += 1) {
    const difference = leftPoints[index] - rightPoints[index]
    if (difference !== 0) return difference
  }
  return leftPoints.length - rightPoints.length
}

const canonicalJsonString = (value: string): string => {
  const rendered = JSON.stringify(value)
  if (rendered === undefined) {
    throw new FwuOwlFieldRegistryError('Cannot serialize JSON string')
  }
  return rendered
}

const compactCanonicalJsonTextUnchecked = (value: JsonValue): string => {
  if (value === null) return 'null'
  if (value === true) return 'true'
  if (value === false) return 'false'
  if (typeof value === 'number') return JSON.stringify(value)
  if (typeof value === 'string') return canonicalJsonString(value)
  if (Array.isArray(value)) {
    return `[${value.map(compactCanonicalJsonTextUnchecked).join(',')}]`
  }
  return `{${Object.keys(value)
    .sort(compareUnicodeCodePoints)
    .map((key) => `${canonicalJsonString(key)}:${compactCanonicalJsonTextUnchecked(value[key])}`)
    .join(',')}}`
}

/** Compact canonical JSON used by registry-backed RDF literals and set ordering. */
export const compactCanonicalJsonText = (value: JsonValue): string => {
  assertJsonValue(value, 'compact canonical JSON input')
  return compactCanonicalJsonTextUnchecked(value)
}

export const compactCanonicalJsonBytes = (value: JsonValue): Buffer =>
  Buffer.from(compactCanonicalJsonText(value), 'utf8')

const prettyCanonicalJsonLines = (value: JsonValue, depth: number): string => {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return compactCanonicalJsonTextUnchecked(value)
  }
  const indentation = '  '.repeat(depth)
  const childIndentation = '  '.repeat(depth + 1)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[\n${value
      .map((child) => `${childIndentation}${prettyCanonicalJsonLines(child, depth + 1)}`)
      .join(',\n')}\n${indentation}]`
  }
  const keys = Object.keys(value).sort(compareUnicodeCodePoints)
  if (keys.length === 0) return '{}'
  return `{\n${keys
    .map(
      (key) =>
        `${childIndentation}${canonicalJsonString(key)}: ${prettyCanonicalJsonLines(value[key], depth + 1)}`,
    )
    .join(',\n')}\n${indentation}}`
}

/** Python `json.dumps(..., sort_keys=True, indent=2) + "\n"` compatible layout. */
export const canonicalJsonText = (value: JsonValue): string => {
  assertJsonValue(value, 'canonical JSON input')
  return `${prettyCanonicalJsonLines(value, 0)}\n`
}

export const canonicalJsonBytes = (value: JsonValue): Buffer =>
  Buffer.from(canonicalJsonText(value), 'utf8')

export const escapeJsonPointerSegment = (value: string): string =>
  value.replaceAll('~', '~0').replaceAll('/', '~1')

export const encodeJsonPointer = (segments: readonly (string | number)[]): string =>
  segments.length === 0
    ? ''
    : `/${segments.map((segment) => escapeJsonPointerSegment(String(segment))).join('/')}`

/** Decode a JSON Pointer before applying the registry's segment wildcards. */
export const decodeJsonPointer = (value: string): readonly string[] => {
  if (value === '') return []
  if (!value.startsWith('/')) {
    throw new FwuOwlFieldRegistryError(`Invalid JSON Pointer: ${value}`)
  }
  return value
    .slice(1)
    .split('/')
    .map((rawSegment) => {
      let decoded = ''
      for (let index = 0; index < rawSegment.length; index += 1) {
        const character = rawSegment[index]
        if (character !== '~') {
          decoded += character
          continue
        }
        const escape = rawSegment[index + 1]
        if (escape !== '0' && escape !== '1') {
          throw new FwuOwlFieldRegistryError(`Invalid RFC-6901 escape in ${JSON.stringify(value)}`)
        }
        decoded += escape === '0' ? '~' : '/'
        index += 1
      }
      return decoded
    })
}

export const matchJsonPointerPattern = (
  pattern: readonly string[],
  concrete: readonly string[],
): boolean => {
  const cache = new Map<string, boolean>()
  const visit = (patternIndex: number, concreteIndex: number): boolean => {
    const key = `${patternIndex}:${concreteIndex}`
    const cached = cache.get(key)
    if (cached !== undefined) return cached
    let answer: boolean
    if (patternIndex === pattern.length) {
      answer = concreteIndex === concrete.length
    } else if (pattern[patternIndex] === '**') {
      answer =
        visit(patternIndex + 1, concreteIndex) ||
        (concreteIndex < concrete.length && visit(patternIndex, concreteIndex + 1))
    } else if (concreteIndex === concrete.length) {
      answer = false
    } else {
      const segment = pattern[patternIndex]
      answer = (segment === '*' || segment === concrete[concreteIndex]) && visit(patternIndex + 1, concreteIndex + 1)
    }
    cache.set(key, answer)
    return answer
  }
  return visit(0, 0)
}

export const jsonPointerPatternSpecificity = (
  pattern: readonly string[],
): JsonPointerPatternSpecificity => [
  pattern.filter((segment) => segment !== '*' && segment !== '**').length,
  -pattern.filter((segment) => segment === '**').length,
  pattern.length,
]

const compareSpecificity = (
  left: JsonPointerPatternSpecificity,
  right: JsonPointerPatternSpecificity,
): number => {
  for (let index = 0; index < left.length; index += 1) {
    const difference = left[index] - right[index]
    if (difference !== 0) return difference
  }
  return 0
}

/** Whether two wildcard patterns accept at least one common concrete path. */
export const jsonPointerPatternsOverlap = (
  left: readonly string[],
  right: readonly string[],
): boolean => {
  const cache = new Map<string, boolean>()
  const visit = (leftIndex: number, rightIndex: number): boolean => {
    const key = `${leftIndex}:${rightIndex}`
    const cached = cache.get(key)
    if (cached !== undefined) return cached

    let answer: boolean
    if (leftIndex === left.length && rightIndex === right.length) {
      answer = true
    } else if (leftIndex === left.length) {
      answer = right.slice(rightIndex).every((segment) => segment === '**')
    } else if (rightIndex === right.length) {
      answer = left.slice(leftIndex).every((segment) => segment === '**')
    } else if (left[leftIndex] === '**') {
      answer = visit(leftIndex + 1, rightIndex) || visit(leftIndex, rightIndex + 1)
    } else if (right[rightIndex] === '**') {
      answer = visit(leftIndex, rightIndex + 1) || visit(leftIndex + 1, rightIndex)
    } else {
      const leftSegment = left[leftIndex]
      const rightSegment = right[rightIndex]
      answer =
        (leftSegment === '*' || rightSegment === '*' || leftSegment === rightSegment) &&
        visit(leftIndex + 1, rightIndex + 1)
    }
    cache.set(key, answer)
    return answer
  }
  return visit(0, 0)
}

export const jsonValueType = (value: JsonValue): JsonTypeName => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number'
  if (typeof value === 'string') return 'string'
  return 'object'
}

const jsonTypeAllowed = (allowed: readonly JsonTypeName[], actual: JsonTypeName) =>
  allowed.includes(actual) || (actual === 'integer' && allowed.includes('number'))

const requireObject = (value: JsonValue | undefined, context: string): JsonObject => {
  if (!isPlainJsonObject(value)) {
    throw new FwuOwlFieldRegistryError(`${context} must be an object`)
  }
  return value
}

const requireString = (value: JsonValue | undefined, context: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new FwuOwlFieldRegistryError(`${context} must be a non-empty string`)
  }
  return value
}

const requireInteger = (value: JsonValue | undefined, context: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new FwuOwlFieldRegistryError(`${context} must be a safe integer`)
  }
  return value
}

const cloneAndFreezeJson = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) {
    return Object.freeze(value.map(cloneAndFreezeJson)) as unknown as JsonArray
  }
  if (isPlainJsonObject(value)) {
    const result: JsonObject = {}
    for (const key of Object.keys(value).sort(compareUnicodeCodePoints)) {
      result[key] = cloneAndFreezeJson(value[key])
    }
    return Object.freeze(result)
  }
  return value
}

const validatePattern = (pathPattern: string, entryId: string): readonly string[] => {
  const pattern = decodeJsonPointer(pathPattern)
  if (pattern.length === 0 || pattern.some((segment) => segment.length === 0)) {
    throw new FwuOwlFieldRegistryError(`Registry entry ${entryId} has an empty path-pattern segment`)
  }
  for (const segment of pattern) {
    if (segment.includes('*') && segment !== '*' && segment !== '**') {
      throw new FwuOwlFieldRegistryError(`Registry entry ${entryId} has an invalid wildcard segment`)
    }
    if (/^[0-9]+$/u.test(segment)) {
      throw new FwuOwlFieldRegistryError(
        `Registry entry ${entryId} uses a numeric literal segment unsupported by index-neutral caching`,
      )
    }
  }
  return Object.freeze([...pattern])
}

const parseLiteralContract = (
  rdfMapping: JsonObject,
  entryId: string,
): CanonicalJsonLiteralContract => {
  const raw = requireObject(rdfMapping.canonicalJsonLiteral, `${entryId}.rdfMapping.canonicalJsonLiteral`)
  const subtreeProjection = requireString(raw.subtreeProjection, `${entryId} canonical literal subtreeProjection`)
  if (subtreeProjection !== 'complete-value' && subtreeProjection !== 'exclude-more-specific-descendants') {
    throw new FwuOwlFieldRegistryError(`Unsupported canonical literal subtreeProjection on ${entryId}`)
  }
  const maxBytes = requireInteger(raw.maxBytes, `${entryId} canonical literal maxBytes`)
  if (maxBytes <= 0) {
    throw new FwuOwlFieldRegistryError(`Canonical literal maxBytes must be positive on ${entryId}`)
  }
  return Object.freeze({
    predicate: requireString(raw.predicate, `${entryId} canonical literal predicate`),
    datatype: requireString(raw.datatype, `${entryId} canonical literal datatype`),
    maxBytes,
    granularity: requireString(raw.granularity, `${entryId} canonical literal granularity`),
    subtreeProjection,
  })
}

const parseRegistryEntry = (rawValue: JsonValue, index: number): FieldRegistryEntry => {
  const raw = requireObject(rawValue, `Field registry entry ${index}`)
  const entryId = requireString(raw.entryId, `Field registry entry ${index} entryId`)
  const artifactRole = requireString(raw.artifactRole, `${entryId}.artifactRole`)
  const pathPattern = requireString(raw.pathPattern, `${entryId}.pathPattern`)
  const classificationValue = requireString(raw.classification, `${entryId}.classification`)
  if (!FIELD_CLASSIFICATIONS.has(classificationValue as FieldClassification)) {
    throw new FwuOwlFieldRegistryError(`Unsupported classification ${classificationValue} on ${entryId}`)
  }
  const classification = classificationValue as FieldClassification
  const rdfMapping = requireObject(raw.rdfMapping, `${entryId}.rdfMapping`)
  const rdfStrategyValue = requireString(rdfMapping.strategy, `${entryId}.rdfMapping.strategy`)
  if (!RDF_MAPPING_STRATEGIES.has(rdfStrategyValue as RdfMappingStrategy)) {
    throw new FwuOwlFieldRegistryError(`Unsupported RDF mapping strategy ${rdfStrategyValue} on ${entryId}`)
  }
  const rdfStrategy = rdfStrategyValue as RdfMappingStrategy
  const isGenerated = classification === 'generated-non-semantic'
  const isExcluded = rdfStrategy === 'excluded-generated'
  if (isGenerated !== isExcluded) {
    throw new FwuOwlFieldRegistryError(
      `${entryId} must pair generated-non-semantic exclusively with excluded-generated`,
    )
  }

  const dataType = requireObject(raw.dataType, `${entryId}.dataType`)
  if (!Array.isArray(dataType.jsonTypes) || dataType.jsonTypes.length === 0) {
    throw new FwuOwlFieldRegistryError(`${entryId}.dataType.jsonTypes must be a non-empty array`)
  }
  for (const typeName of dataType.jsonTypes) {
    if (typeof typeName !== 'string' || !JSON_TYPE_NAMES.has(typeName as JsonTypeName)) {
      throw new FwuOwlFieldRegistryError(`Unsupported JSON type on ${entryId}`)
    }
  }
  if (new Set(dataType.jsonTypes).size !== dataType.jsonTypes.length) {
    throw new FwuOwlFieldRegistryError(`Duplicate declared JSON type on ${entryId}`)
  }
  if (classification === 'map' && !dataType.jsonTypes.includes('object')) {
    throw new FwuOwlFieldRegistryError(`Map entry ${entryId} must declare object JSON type`)
  }
  if ((classification === 'ordered-list' || classification === 'set') && !dataType.jsonTypes.includes('array')) {
    throw new FwuOwlFieldRegistryError(`${classification} entry ${entryId} must declare array JSON type`)
  }

  const pattern = validatePattern(pathPattern, entryId)
  const frozenData = cloneAndFreezeJson(raw) as Readonly<JsonObject>
  const canonicalJsonLiteral =
    rdfStrategy === 'registered-canonical-json-literal'
      ? parseLiteralContract(rdfMapping, entryId)
      : undefined
  if (rdfStrategy !== 'registered-canonical-json-literal' && rdfMapping.canonicalJsonLiteral !== undefined) {
    throw new FwuOwlFieldRegistryError(
      `${entryId} declares canonicalJsonLiteral without the registered literal strategy`,
    )
  }
  return Object.freeze({
    entryId,
    artifactRole,
    pathPattern,
    pattern,
    specificity: Object.freeze(jsonPointerPatternSpecificity(pattern)),
    classification,
    rdfStrategy,
    ...(canonicalJsonLiteral === undefined ? {} : { canonicalJsonLiteral }),
    data: frozenData,
  })
}

interface MutableCoverage {
  entry: FieldRegistryEntry
  instanceCount: number
  directInstanceCount: number
  inheritedInstanceCount: number
  excludedGeneratedCount: number
  observedTypes: Set<JsonTypeName>
  concretePaths: Set<string>
}

interface CachedEffectiveMatch {
  entry: FieldRegistryEntry
  inheritedFromCanonicalJsonLiteral: boolean
  ancestorSegmentCount: number
}

const byteCompare = (left: Buffer, right: Buffer): number => Buffer.compare(left, right)

export class FwuOwlFieldRegistry {
  readonly registryId: string
  readonly version: string
  readonly entries: readonly FieldRegistryEntry[]

  readonly #byId = new Map<string, FieldRegistryEntry>()
  readonly #byRole = new Map<string, FieldRegistryEntry[]>()
  readonly #directCache = new Map<string, FieldRegistryEntry | null>()
  readonly #effectiveCache = new Map<string, CachedEffectiveMatch>()

  constructor(value: unknown) {
    assertJsonValue(value, 'field-semantics registry')
    const registry = requireObject(value, 'Field-semantics registry')
    if (registry.registryFormatVersion !== 1) {
      throw new FwuOwlFieldRegistryError('Unsupported field-registry format version')
    }
    this.registryId = requireString(registry.registryId, 'Field-semantics registry registryId')
    this.version = requireString(registry.version, 'Field-semantics registry version')

    const compatibility = requireObject(registry.compatibility, 'Field-semantics registry compatibility')
    if (compatibility.unknownFieldPolicy !== 'reject') {
      throw new FwuOwlFieldRegistryError('Field registry must reject unknown fields')
    }
    if (compatibility.pathMatchPolicy !== 'exactly-one-most-specific') {
      throw new FwuOwlFieldRegistryError('Field registry must use exactly-one-most-specific path matching')
    }
    const syntax = requireObject(registry.pathPatternSyntax, 'Field-semantics registry pathPatternSyntax')
    if (
      syntax.dialect !== 'json-pointer-segment-pattern-v1' ||
      syntax.pointerEscaping !== 'rfc6901-before-pattern-matching' ||
      syntax.singleSegmentWildcard !== '*-matches-exactly-one-decoded-segment' ||
      syntax.recursiveSegmentWildcard !== '**-matches-zero-or-more-decoded-segments' ||
      syntax.specificity !==
        'descending-literal-count-then-ascending-recursive-wildcard-count-then-descending-segment-count' ||
      syntax.tiePolicy !== 'reject-overlapping-equal-specificity-patterns'
    ) {
      throw new FwuOwlFieldRegistryError('Unsupported field-registry path-pattern contract')
    }

    if (!Array.isArray(registry.entries) || registry.entries.length === 0) {
      throw new FwuOwlFieldRegistryError('Field registry entries are missing')
    }
    const parsedEntries = registry.entries.map(parseRegistryEntry)
    for (const entry of parsedEntries) {
      if (this.#byId.has(entry.entryId)) {
        throw new FwuOwlFieldRegistryError(`Duplicate field-registry entry ID: ${entry.entryId}`)
      }
      this.#byId.set(entry.entryId, entry)
      const roleEntries = this.#byRole.get(entry.artifactRole) ?? []
      roleEntries.push(entry)
      this.#byRole.set(entry.artifactRole, roleEntries)
    }
    this.#rejectLatentSpecificityTies()
    for (const entries of this.#byRole.values()) Object.freeze(entries)
    this.entries = Object.freeze(parsedEntries)
  }

  #rejectLatentSpecificityTies() {
    for (const [role, entries] of this.#byRole) {
      for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
        const left = entries[leftIndex]
        for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
          const right = entries[rightIndex]
          if (
            compareSpecificity(left.specificity, right.specificity) === 0 &&
            jsonPointerPatternsOverlap(left.pattern, right.pattern)
          ) {
            throw new FwuOwlFieldRegistryError(
              `Ambiguous equal-specificity registry patterns for ${role}: ${left.entryId}, ${right.entryId}`,
            )
          }
        }
      }
    }
  }

  entry(entryId: string): FieldRegistryEntry {
    const result = this.#byId.get(entryId)
    if (result === undefined) {
      throw new FwuOwlFieldRegistryError(`Unknown field-registry entry ID: ${entryId}`)
    }
    return result
  }

  entriesForRole(artifactRole: string): readonly FieldRegistryEntry[] {
    return this.#byRole.get(artifactRole) ?? []
  }

  #cacheKey(artifactRole: string, path: string): string {
    const indexNeutralSegments = decodeJsonPointer(path).map((segment) =>
      /^[0-9]+$/u.test(segment) ? '*' : segment,
    )
    return JSON.stringify([artifactRole, indexNeutralSegments])
  }

  direct(artifactRole: string, path: string): FieldRegistryEntry | undefined {
    const cacheKey = this.#cacheKey(artifactRole, path)
    const cached = this.#directCache.get(cacheKey)
    if (cached !== undefined) return cached ?? undefined

    const concrete = decodeJsonPointer(path)
    const matches = (this.#byRole.get(artifactRole) ?? []).filter((entry) =>
      matchJsonPointerPattern(entry.pattern, concrete),
    )
    if (matches.length === 0) {
      this.#directCache.set(cacheKey, null)
      return undefined
    }
    let best = matches[0].specificity
    for (const match of matches.slice(1)) {
      if (compareSpecificity(match.specificity, best) > 0) best = match.specificity
    }
    const selected = matches.filter((match) => compareSpecificity(match.specificity, best) === 0)
    if (selected.length !== 1) {
      throw new FwuOwlFieldRegistryError(
        `Ambiguous field registry match for ${artifactRole}:${path}: ${selected
          .map((entry) => entry.entryId)
          .join(', ')}`,
      )
    }
    this.#directCache.set(cacheKey, selected[0])
    return selected[0]
  }

  resolveEffective(artifactRole: string, path: string): EffectiveFieldRegistryMatch {
    const cacheKey = this.#cacheKey(artifactRole, path)
    let cached = this.#effectiveCache.get(cacheKey)
    const concrete = decodeJsonPointer(path)
    if (cached === undefined) {
      const direct = this.direct(artifactRole, path)
      if (direct !== undefined) {
        cached = {
          entry: direct,
          inheritedFromCanonicalJsonLiteral: false,
          ancestorSegmentCount: concrete.length,
        }
      } else {
        for (let length = concrete.length - 1; length > 0; length -= 1) {
          const ancestor = this.direct(artifactRole, encodeJsonPointer(concrete.slice(0, length)))
          if (ancestor?.rdfStrategy === 'registered-canonical-json-literal') {
            cached = {
              entry: ancestor,
              inheritedFromCanonicalJsonLiteral: true,
              ancestorSegmentCount: length,
            }
            break
          }
        }
      }
      if (cached === undefined) {
        throw new FwuOwlFieldRegistryError(`Unregistered release-model field ${artifactRole}:${path}`)
      }
      this.#effectiveCache.set(cacheKey, cached)
    }
    return {
      entry: cached.entry,
      inheritedFromCanonicalJsonLiteral: cached.inheritedFromCanonicalJsonLiteral,
      matchedPath: encodeJsonPointer(concrete.slice(0, cached.ancestorSegmentCount)),
    }
  }

  effective(artifactRole: string, path: string): FieldRegistryEntry {
    return this.resolveEffective(artifactRole, path).entry
  }

  #validateDirectValue(entry: FieldRegistryEntry, value: JsonValue, path: string) {
    const dataType = requireObject(entry.data.dataType, `${entry.entryId}.dataType`)
    const allowedTypes = dataType.jsonTypes as JsonArray
    const actualType = jsonValueType(value)
    if (!jsonTypeAllowed(allowedTypes as JsonTypeName[], actualType)) {
      throw new FwuOwlFieldRegistryError(
        `Registry type mismatch for ${entry.artifactRole}:${path}; ${entry.entryId} does not allow ${actualType}`,
      )
    }

    if (Array.isArray(value)) {
      const itemTypes = dataType.itemJsonTypes
      if (itemTypes !== undefined) {
        if (!Array.isArray(itemTypes)) {
          throw new FwuOwlFieldRegistryError(`${entry.entryId}.dataType.itemJsonTypes must be an array`)
        }
        for (let index = 0; index < value.length; index += 1) {
          const itemType = jsonValueType(value[index])
          if (!jsonTypeAllowed(itemTypes as JsonTypeName[], itemType)) {
            throw new FwuOwlFieldRegistryError(
              `Registry item type mismatch for ${entry.artifactRole}:${path}/${index}`,
            )
          }
        }
      }
      const cardinality = requireObject(entry.data.cardinality, `${entry.entryId}.cardinality`)
      if (typeof cardinality.minItems === 'number' && value.length < cardinality.minItems) {
        throw new FwuOwlFieldRegistryError(`Registry minItems violation for ${entry.artifactRole}:${path}`)
      }
      if (typeof cardinality.maxItems === 'number' && value.length > cardinality.maxItems) {
        throw new FwuOwlFieldRegistryError(`Registry maxItems violation for ${entry.artifactRole}:${path}`)
      }
    }

    if (entry.classification === 'map') {
      const object = requireObject(value, `${entry.entryId} map value`)
      const dynamicKeys = requireObject(entry.data.dynamicMapKeys, `${entry.entryId}.dynamicMapKeys`)
      const policy = requireString(dynamicKeys.policy, `${entry.entryId} dynamic-map policy`)
      if (policy === 'enumerated') {
        if (!Array.isArray(dynamicKeys.allowedKeys)) {
          throw new FwuOwlFieldRegistryError(`${entry.entryId} enumerated map has no allowedKeys`)
        }
        const allowed = new Set(dynamicKeys.allowedKeys.map((key) => requireString(key, `${entry.entryId} allowed key`)))
        const unknown = Object.keys(object).filter((key) => !allowed.has(key)).sort(compareUnicodeCodePoints)
        if (unknown.length !== 0) {
          throw new FwuOwlFieldRegistryError(
            `Unknown dynamic map key for ${entry.artifactRole}:${path}: ${unknown[0]}`,
          )
        }
      } else if (policy === 'patterned') {
        const pattern = requireString(dynamicKeys.keyPattern, `${entry.entryId} dynamic key pattern`)
        let expression: RegExp
        try {
          expression = new RegExp(pattern, 'u')
        } catch (error) {
          throw new FwuOwlFieldRegistryError(
            `Invalid dynamic key pattern on ${entry.entryId}: ${error instanceof Error ? error.message : String(error)}`,
          )
        }
        const invalid = Object.keys(object).filter((key) => !expression.test(key)).sort(compareUnicodeCodePoints)
        if (invalid.length !== 0) {
          throw new FwuOwlFieldRegistryError(
            `Invalid dynamic map key for ${entry.artifactRole}:${path}: ${invalid[0]}`,
          )
        }
      } else {
        throw new FwuOwlFieldRegistryError(`Unsupported dynamic map policy ${policy} on ${entry.entryId}`)
      }
    }
  }

  projectCanonicalJsonLiteral(
    artifactRole: string,
    path: string,
    value: JsonValue,
  ): CanonicalJsonLiteralProjection {
    assertJsonValue(value, `${artifactRole}:${path} canonical JSON literal`)
    const root = this.direct(artifactRole, path)
    if (root?.rdfStrategy !== 'registered-canonical-json-literal' || root.canonicalJsonLiteral === undefined) {
      throw new FwuOwlFieldRegistryError(
        `${artifactRole}:${path} is not a direct registered-canonical-json-literal field`,
      )
    }

    const project = (candidate: JsonValue, candidatePath: string): JsonValue | undefined => {
      if (Array.isArray(candidate)) {
        const projected: JsonValue[] = []
        for (let index = 0; index < candidate.length; index += 1) {
          const itemPath = `${candidatePath}/${index}`
          const direct = this.direct(artifactRole, itemPath)
          if (direct !== undefined && direct.entryId !== root.entryId) {
            if (root.canonicalJsonLiteral?.subtreeProjection === 'complete-value') {
              throw new FwuOwlFieldRegistryError(
                `Complete canonical literal ${root.entryId} overlaps ${direct.entryId} at ${itemPath}`,
              )
            }
            continue
          }
          const child = project(candidate[index], itemPath)
          if (child !== undefined) projected.push(child)
        }
        return projected
      }
      if (isPlainJsonObject(candidate)) {
        const projected: JsonObject = {}
        for (const key of Object.keys(candidate).sort(compareUnicodeCodePoints)) {
          const childPath = `${candidatePath}/${escapeJsonPointerSegment(key)}`
          const direct = this.direct(artifactRole, childPath)
          if (direct !== undefined && direct.entryId !== root.entryId) {
            if (root.canonicalJsonLiteral?.subtreeProjection === 'complete-value') {
              throw new FwuOwlFieldRegistryError(
                `Complete canonical literal ${root.entryId} overlaps ${direct.entryId} at ${childPath}`,
              )
            }
            continue
          }
          this.resolveEffective(artifactRole, childPath)
          const child = project(candidate[key], childPath)
          if (child !== undefined) projected[key] = child
        }
        return projected
      }
      return candidate
    }

    const projected = project(value, path)
    if (projected === undefined) {
      throw new FwuOwlFieldRegistryError(`Canonical literal projection unexpectedly removed ${artifactRole}:${path}`)
    }
    const text = compactCanonicalJsonText(projected)
    const bytes = Buffer.from(text, 'utf8')
    if (bytes.length > root.canonicalJsonLiteral.maxBytes) {
      throw new FwuOwlFieldRegistryError(
        `Canonical literal ${root.entryId} at ${path} exceeds ${root.canonicalJsonLiteral.maxBytes} bytes`,
      )
    }
    return { entry: root, path, value: projected, text, bytes }
  }

  normalizeAndCover(
    artifactRole: string,
    value: JsonValue,
    options: FieldRegistryNormalizationOptions = {},
  ): FieldRegistryNormalizationResult {
    assertJsonValue(value, `${artifactRole} registry input`)
    const coverage = new Map<string, MutableCoverage>()
    const observations: FieldRegistryObservation[] = []
    const excludedGeneratedPaths: string[] = []
    const canonicalJsonLiterals: { entryId: string; path: string; byteLength: number }[] = []
    const retainDetails = options.retainDetails !== false

    const observe = (match: EffectiveFieldRegistryMatch, path: string, child: JsonValue) => {
      const excludedGenerated = match.entry.rdfStrategy === 'excluded-generated'
      const observation: FieldRegistryObservation = {
        entryId: match.entry.entryId,
        artifactRole,
        path,
        jsonType: jsonValueType(child),
        inheritedFromCanonicalJsonLiteral: match.inheritedFromCanonicalJsonLiteral,
        excludedGenerated,
      }
      if (retainDetails) observations.push(observation)
      options.onField?.(observation, child)
      const item = coverage.get(match.entry.entryId) ?? {
        entry: match.entry,
        instanceCount: 0,
        directInstanceCount: 0,
        inheritedInstanceCount: 0,
        excludedGeneratedCount: 0,
        observedTypes: new Set<JsonTypeName>(),
        concretePaths: new Set<string>(),
      }
      item.instanceCount += 1
      if (match.inheritedFromCanonicalJsonLiteral) item.inheritedInstanceCount += 1
      else item.directInstanceCount += 1
      if (excludedGenerated) item.excludedGeneratedCount += 1
      item.observedTypes.add(observation.jsonType)
      if (retainDetails) item.concretePaths.add(path)
      coverage.set(match.entry.entryId, item)
      return excludedGenerated
    }

    const normalize = (candidate: JsonValue, path: string): JsonValue => {
      if (Array.isArray(candidate)) {
        const direct = this.direct(artifactRole, path)
        let normalized = candidate.map((child, index) => normalize(child, `${path}/${index}`))
        if (direct?.classification === 'set') {
          const serialized = normalized.map((child) => ({ child, bytes: compactCanonicalJsonBytes(child) }))
          serialized.sort((left, right) => byteCompare(left.bytes, right.bytes))
          for (let index = 1; index < serialized.length; index += 1) {
            if (byteCompare(serialized[index - 1].bytes, serialized[index].bytes) === 0) {
              throw new FwuOwlFieldRegistryError(`Duplicate item in registry-declared set ${artifactRole}:${path}`)
            }
          }
          normalized = serialized.map((item) => item.child)
        }
        return normalized
      }
      if (isPlainJsonObject(candidate)) {
        const normalized: JsonObject = {}
        for (const key of Object.keys(candidate).sort(compareUnicodeCodePoints)) {
          const childPath = path
            ? `${path}/${escapeJsonPointerSegment(key)}`
            : `/${escapeJsonPointerSegment(key)}`
          const child = candidate[key]
          const match = this.resolveEffective(artifactRole, childPath)
          if (!match.inheritedFromCanonicalJsonLiteral) {
            this.#validateDirectValue(match.entry, child, childPath)
          }
          if (observe(match, childPath, child)) {
            if (retainDetails) excludedGeneratedPaths.push(childPath)
            continue
          }
          if (match.entry.rdfStrategy === 'registered-canonical-json-literal' && !match.inheritedFromCanonicalJsonLiteral) {
            const literal = this.projectCanonicalJsonLiteral(artifactRole, childPath, child)
            if (retainDetails) {
              canonicalJsonLiterals.push({
                entryId: literal.entry.entryId,
                path: childPath,
                byteLength: literal.bytes.length,
              })
            }
          }
          normalized[key] = normalize(child, childPath)
        }
        return normalized
      }
      return candidate
    }

    const normalized = normalize(value, '')
    const coverageEntries = [...coverage.values()]
      .sort((left, right) => compareUnicodeCodePoints(left.entry.entryId, right.entry.entryId))
      .map<FieldRegistryCoverageEntry>((item) => ({
        entryId: item.entry.entryId,
        artifactRole: item.entry.artifactRole,
        pathPattern: item.entry.pathPattern,
        classification: item.entry.classification,
        instanceCount: item.instanceCount,
        directInstanceCount: item.directInstanceCount,
        inheritedInstanceCount: item.inheritedInstanceCount,
        excludedGeneratedCount: item.excludedGeneratedCount,
        observedTypes: [...item.observedTypes].sort(compareUnicodeCodePoints),
        concretePaths: [...item.concretePaths].sort(compareUnicodeCodePoints),
      }))
    return {
      normalized,
      observations: Object.freeze(observations),
      coverage: Object.freeze(coverageEntries),
      excludedGeneratedPaths: Object.freeze(excludedGeneratedPaths),
      canonicalJsonLiterals: Object.freeze(canonicalJsonLiterals),
    }
  }
}
