import { createHash } from 'node:crypto'
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readSync,
  writeSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'

export type NTriplesIriObject = Readonly<{
  kind: 'iri'
  iri: string
}>

export type NTriplesTypedLiteralObject = Readonly<{
  kind: 'typed-literal'
  value: string
  datatype: string
}>

export type NTriplesLanguageLiteralObject = Readonly<{
  kind: 'language-literal'
  value: string
  language: string
}>

export type NTriplesPlainLiteralObject = Readonly<{
  kind: 'plain-literal'
  value: string
}>

export type NTriplesObject =
  | NTriplesIriObject
  | NTriplesTypedLiteralObject
  | NTriplesLanguageLiteralObject
  | NTriplesPlainLiteralObject

export type NTriple = Readonly<{
  subject: string
  predicate: string
  object: NTriplesObject
}>

export type NTriplesSerialization = Readonly<{
  content: Buffer
  tripleCount: number
  bytes: number
  sha256: string
}>

export type ExactConcatenationSource = Readonly<{
  path: string
  expectedBytes?: number
  expectedSha256?: string
}>

export type ExactConcatenationResult = Readonly<{
  path: string
  sourceCount: number
  bytes: number
  sha256: string
}>

export type ApplicationVocabularySummary = Readonly<{
  namespace: string
  classCount: number
  objectPropertyCount: number
  datatypePropertyCount: number
  termCount: number
  declarationTripleCount: number
}>

export type ApplicationVocabularyDerivation = Readonly<{
  classes: readonly string[]
  objectProperties: readonly string[]
  datatypeProperties: readonly string[]
  declarationTriples: readonly string[]
  summary: ApplicationVocabularySummary
}>

export type PackageVocabularyDerivation = Readonly<{
  classes: readonly string[]
  objectProperties: readonly string[]
  datatypeProperties: readonly string[]
  parserBootstrapObjectProperties: readonly string[]
  parserBootstrapDatatypeProperties: readonly string[]
  declarationTriples: readonly string[]
  registrySummary: ApplicationVocabularySummary
  applicationSummary: ApplicationVocabularySummary
  parserBootstrapPropertyCount: number
  declarationTripleCount: number
}>

export const EXPECTED_APPLICATION_VOCABULARY_SUMMARY = Object.freeze({
  classCount: 66,
  objectPropertyCount: 108,
  datatypePropertyCount: 311,
  termCount: 485,
  declarationTripleCount: 485,
})

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
const OWL_CLASS = 'http://www.w3.org/2002/07/owl#Class'
const OWL_OBJECT_PROPERTY = 'http://www.w3.org/2002/07/owl#ObjectProperty'
const OWL_DATATYPE_PROPERTY = 'http://www.w3.org/2002/07/owl#DatatypeProperty'
const ABSOLUTE_IRI = /^[A-Za-z][A-Za-z0-9+.-]*:/u
const LANGUAGE_TAG = /^[A-Za-z]+(?:-[A-Za-z0-9]+)*$/u
const SHA256 = /^[a-f0-9]{64}$/u

const compareCodeUnits = (left: string, right: string) => (left < right ? -1 : left > right ? 1 : 0)

const isUnicodeNoncharacter = (codePoint: number) => (
  (codePoint >= 0xfdd0 && codePoint <= 0xfdef)
  || (codePoint & 0xffff) === 0xfffe
  || (codePoint & 0xffff) === 0xffff
)

const assertUnicodeScalars = (value: string, label: string) => {
  for (let offset = 0; offset < value.length;) {
    const codePoint = value.codePointAt(offset)
    if (codePoint === undefined || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      throw new Error(`${label} contains an unpaired UTF-16 surrogate at code-unit offset ${offset}.`)
    }
    if (isUnicodeNoncharacter(codePoint)) {
      throw new Error(`${label} contains the Unicode noncharacter U+${codePoint.toString(16).toUpperCase()}.`)
    }
    offset += codePoint > 0xffff ? 2 : 1
  }
}

const assertNoForbiddenControls = (
  value: string,
  label: string,
  escapedLiteralWhitespaceAllowed: boolean,
) => {
  for (let offset = 0; offset < value.length;) {
    const codePoint = value.codePointAt(offset)
    if (codePoint === undefined) throw new Error(`${label} contains invalid Unicode.`)
    const escapedWhitespace = escapedLiteralWhitespaceAllowed && [0x09, 0x0a, 0x0d].includes(codePoint)
    if (!escapedWhitespace && (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f))) {
      throw new Error(`${label} contains the forbidden control U+${codePoint.toString(16).toUpperCase()}.`)
    }
    offset += codePoint > 0xffff ? 2 : 1
  }
}

const assertSafeIri = (iri: string, label: string) => {
  if (!iri || !ABSOLUTE_IRI.test(iri)) {
    throw new Error(`${label} must be a non-empty absolute IRI.`)
  }
  assertUnicodeScalars(iri, label)
  assertNoForbiddenControls(iri, label, false)
  if (/\s/u.test(iri)) throw new Error(`${label} must not contain whitespace.`)
  for (let index = iri.indexOf('%'); index >= 0; index = iri.indexOf('%', index + 1)) {
    if (!/^[A-Fa-f0-9]{2}$/u.test(iri.slice(index + 1, index + 3))) {
      throw new Error(`${label} contains an invalid percent-escape at code-unit offset ${index}.`)
    }
  }
}

const escapeIriValue = (iri: string) => {
  assertSafeIri(iri, 'N-Triples IRI')
  let escaped = ''
  for (const character of iri) {
    const codePoint = character.codePointAt(0) as number
    if ('<>"{}|^`\\'.includes(character)) {
      escaped += codePoint <= 0xffff
        ? `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
        : `\\U${codePoint.toString(16).toUpperCase().padStart(8, '0')}`
    } else {
      escaped += character
    }
  }
  return escaped
}

const escapeLiteralValue = (value: string) => {
  assertUnicodeScalars(value, 'N-Triples literal')
  assertNoForbiddenControls(value, 'N-Triples literal', true)
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('"', '\\"')
    .replaceAll('\t', '\\t')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
}

export const iriObject = (iri: string): NTriplesIriObject => {
  assertSafeIri(iri, 'N-Triples object IRI')
  return Object.freeze({ kind: 'iri', iri })
}

export const typedLiteralObject = (value: string, datatype: string): NTriplesTypedLiteralObject => {
  assertUnicodeScalars(value, 'N-Triples typed literal')
  assertNoForbiddenControls(value, 'N-Triples typed literal', true)
  assertSafeIri(datatype, 'N-Triples datatype IRI')
  return Object.freeze({ kind: 'typed-literal', value, datatype })
}

export const languageLiteralObject = (value: string, language: string): NTriplesLanguageLiteralObject => {
  assertUnicodeScalars(value, 'N-Triples language literal')
  assertNoForbiddenControls(value, 'N-Triples language literal', true)
  if (!LANGUAGE_TAG.test(language)) {
    throw new Error(`Invalid N-Triples language tag: ${language}`)
  }
  return Object.freeze({ kind: 'language-literal', value, language: language.toLowerCase() })
}

export const plainLiteralObject = (value: string): NTriplesPlainLiteralObject => {
  assertUnicodeScalars(value, 'N-Triples plain literal')
  assertNoForbiddenControls(value, 'N-Triples plain literal', true)
  return Object.freeze({ kind: 'plain-literal', value })
}

export const iriTerm = (iri: string) => `<${escapeIriValue(iri)}>`

export const literalTerm = (object: Exclude<NTriplesObject, NTriplesIriObject>) => {
  const lexical = `"${escapeLiteralValue(object.value)}"`
  if (object.kind === 'typed-literal') return `${lexical}^^${iriTerm(object.datatype)}`
  if (object.kind === 'language-literal') {
    if (!LANGUAGE_TAG.test(object.language)) {
      throw new Error(`Invalid N-Triples language tag: ${object.language}`)
    }
    return `${lexical}@${object.language.toLowerCase()}`
  }
  return lexical
}

export const canonicalTripleLine = (
  subject: string,
  predicate: string,
  object: NTriplesObject,
) => {
  let renderedObject: string
  if (object.kind === 'iri') renderedObject = iriTerm(object.iri)
  else if (
    object.kind === 'typed-literal'
    || object.kind === 'language-literal'
    || object.kind === 'plain-literal'
  ) renderedObject = literalTerm(object)
  else throw new Error('N-Triples object has an unsupported term kind.')
  return `${iriTerm(subject)} ${iriTerm(predicate)} ${renderedObject} .\n`
}

const writeBufferFully = (descriptor: number, content: Buffer) => {
  let offset = 0
  while (offset < content.length) {
    const written = writeSync(descriptor, content, offset, content.length - offset)
    if (written <= 0) throw new Error('Failed to make progress while writing N-Triples output.')
    offset += written
  }
}

const writeRegularFile = (outputPath: string, content: Buffer) => {
  mkdirSync(dirname(outputPath), { recursive: true })
  if (existsSync(outputPath)) {
    const metadata = lstatSync(outputPath)
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error(`N-Triples output must be a regular non-symlink file: ${outputPath}`)
    }
  }
  const descriptor = openSync(
    outputPath,
    constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW,
    0o644,
  )
  try {
    writeBufferFully(descriptor, content)
  } finally {
    closeSync(descriptor)
  }
}

export class SortedUniqueNTriples {
  readonly #lines = new Set<string>()
  readonly #iris = new Set<string>()

  add(subject: string, predicate: string, object: NTriplesObject) {
    this.#lines.add(canonicalTripleLine(subject, predicate, object))
    this.#iris.add(subject)
    this.#iris.add(predicate)
    if (object.kind === 'iri') this.#iris.add(object.iri)
    else if (object.kind === 'typed-literal') this.#iris.add(object.datatype)
    return this
  }

  addTriple(triple: NTriple) {
    return this.add(triple.subject, triple.predicate, triple.object)
  }

  addAll(triples: Iterable<NTriple>) {
    for (const triple of triples) this.addTriple(triple)
    return this
  }

  get tripleCount() {
    return this.#lines.size
  }

  lines() {
    return Object.freeze([...this.#lines].sort(compareCodeUnits))
  }

  referencedIris(namespace?: string) {
    return Object.freeze(
      [...this.#iris]
        .filter((iri) => namespace === undefined || iri.startsWith(namespace))
        .sort(compareCodeUnits),
    )
  }

  serialize(): NTriplesSerialization {
    const lines = [...this.#lines].sort(compareCodeUnits)
    const byteLength = lines.reduce((total, line) => total + Buffer.byteLength(line, 'utf8'), 0)
    const content = Buffer.allocUnsafe(byteLength)
    let offset = 0
    for (const line of lines) offset += content.write(line, offset, 'utf8')
    if (offset !== byteLength) throw new Error('Canonical N-Triples serialization wrote an unexpected byte count.')
    return Object.freeze({
      content,
      tripleCount: this.#lines.size,
      bytes: content.length,
      sha256: createHash('sha256').update(content).digest('hex'),
    })
  }

  drainSerialize(): NTriplesSerialization {
    const result = this.serialize()
    this.#lines.clear()
    this.#iris.clear()
    return result
  }

  writeToFile(outputPath: string): NTriplesSerialization {
    const result = this.serialize()
    writeRegularFile(outputPath, result.content)
    return result
  }
}

export const collectSortedUniqueNTriples = (triples: Iterable<NTriple>) => (
  new SortedUniqueNTriples().addAll(triples).serialize()
)

const assertOptionalExpectedBinding = (source: ExactConcatenationSource) => {
  if (
    source.expectedBytes !== undefined
    && (!Number.isSafeInteger(source.expectedBytes) || source.expectedBytes < 0)
  ) {
    throw new Error(`Expected byte count must be a non-negative safe integer: ${source.path}`)
  }
  if (source.expectedSha256 !== undefined && !SHA256.test(source.expectedSha256)) {
    throw new Error(`Expected SHA-256 must be 64 lowercase hexadecimal characters: ${source.path}`)
  }
}

export const concatenateFilesExactly = (
  sources: readonly ExactConcatenationSource[],
  outputPath: string,
): ExactConcatenationResult => {
  const resolvedOutput = resolve(outputPath)
  const identities = sources.map((source) => {
    assertOptionalExpectedBinding(source)
    const resolvedSource = resolve(source.path)
    if (resolvedSource === resolvedOutput) {
      throw new Error(`Concatenation output must not also be an input: ${source.path}`)
    }
    const metadata = lstatSync(resolvedSource)
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error(`Concatenation input must be a regular non-symlink file: ${source.path}`)
    }
    return { source, resolvedSource, metadata }
  })

  mkdirSync(dirname(resolvedOutput), { recursive: true })
  if (existsSync(resolvedOutput)) {
    const outputMetadata = lstatSync(resolvedOutput)
    if (!outputMetadata.isFile() || outputMetadata.isSymbolicLink()) {
      throw new Error(`Concatenation output must be a regular non-symlink file: ${outputPath}`)
    }
    for (const identity of identities) {
      if (identity.metadata.dev === outputMetadata.dev && identity.metadata.ino === outputMetadata.ino) {
        throw new Error(`Concatenation output must not alias an input: ${identity.source.path}`)
      }
    }
  }

  const outputDescriptor = openSync(
    resolvedOutput,
    constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | constants.O_NOFOLLOW,
    0o644,
  )
  const outputHash = createHash('sha256')
  const chunk = Buffer.allocUnsafe(8 * 1024 * 1024)
  let totalBytes = 0
  try {
    for (const identity of identities) {
      const inputDescriptor = openSync(identity.resolvedSource, constants.O_RDONLY | constants.O_NOFOLLOW)
      const sourceHash = createHash('sha256')
      let sourceBytes = 0
      try {
        const opened = fstatSync(inputDescriptor)
        if (
          !opened.isFile()
          || opened.dev !== identity.metadata.dev
          || opened.ino !== identity.metadata.ino
        ) {
          throw new Error(`Concatenation input identity changed before reading: ${identity.source.path}`)
        }
        while (true) {
          const bytesRead = readSync(inputDescriptor, chunk, 0, chunk.length, null)
          if (bytesRead === 0) break
          const content = chunk.subarray(0, bytesRead)
          sourceHash.update(content)
          outputHash.update(content)
          writeBufferFully(outputDescriptor, content)
          sourceBytes += bytesRead
          totalBytes += bytesRead
          if (!Number.isSafeInteger(sourceBytes) || !Number.isSafeInteger(totalBytes)) {
            throw new Error('Exact concatenation exceeded JavaScript safe integer byte counts.')
          }
        }
      } finally {
        closeSync(inputDescriptor)
      }
      const after = lstatSync(identity.resolvedSource)
      if (
        !after.isFile()
        || after.isSymbolicLink()
        || after.dev !== identity.metadata.dev
        || after.ino !== identity.metadata.ino
        || after.size !== identity.metadata.size
      ) {
        throw new Error(`Concatenation input changed while reading: ${identity.source.path}`)
      }
      const sourceDigest = sourceHash.digest('hex')
      if (
        (identity.source.expectedBytes !== undefined && sourceBytes !== identity.source.expectedBytes)
        || (
          identity.source.expectedSha256 !== undefined
          && sourceDigest !== identity.source.expectedSha256
        )
      ) {
        throw new Error(`Concatenation input binding mismatch: ${identity.source.path}`)
      }
    }
  } finally {
    closeSync(outputDescriptor)
  }

  return Object.freeze({
    path: resolvedOutput,
    sourceCount: sources.length,
    bytes: totalBytes,
    sha256: outputHash.digest('hex'),
  })
}

type JsonRecord = Record<string, unknown>

const record = (value: unknown, label: string): JsonRecord => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`)
  }
  return value as JsonRecord
}

const optionalRecord = (value: unknown, label: string) => (
  value === undefined ? undefined : record(value, label)
)

const addCompactApplicationTerm = (
  target: Set<string>,
  value: unknown,
  namespace: string,
  label: string,
) => {
  if (typeof value !== 'string' || !value.startsWith('sp:')) return
  const localName = value.slice(3)
  if (!localName || localName.includes(':')) {
    throw new Error(`${label} contains an invalid compact application IRI: ${value}`)
  }
  const expanded = `${namespace}${localName}`
  assertSafeIri(expanded, label)
  target.add(expanded)
}

const deriveConstructionTerms = (
  value: unknown,
  namespace: string,
  classes: Set<string>,
  objectProperties: Set<string>,
  datatypeProperties: Set<string>,
  label: string,
) => {
  if (value === undefined) return
  const construction = record(value, label)
  addCompactApplicationTerm(classes, construction.resourceClass, namespace, `${label}.resourceClass`)
  addCompactApplicationTerm(classes, construction.recordClass, namespace, `${label}.recordClass`)
  addCompactApplicationTerm(
    objectProperties,
    construction.ownerPredicate,
    namespace,
    `${label}.ownerPredicate`,
  )
  const objectMapping = construction.objectMapping
  if (typeof objectMapping !== 'string') {
    throw new Error(`${label}.objectMapping must be a string.`)
  }
  if (objectMapping === 'iri-reference') {
    addCompactApplicationTerm(objectProperties, construction.predicate, namespace, `${label}.predicate`)
    return
  }
  if (objectMapping === 'typed-literal' || objectMapping === 'language-literal') {
    addCompactApplicationTerm(datatypeProperties, construction.predicate, namespace, `${label}.predicate`)
    return
  }
  if (objectMapping === 'resource') {
    addCompactApplicationTerm(objectProperties, construction.predicate, namespace, `${label}.predicate`)
    return
  }
  if (objectMapping === 'positioned-membership' || objectMapping === 'rdf-list') {
    addCompactApplicationTerm(objectProperties, construction.predicate, namespace, `${label}.predicate`)
    const membership = record(construction.membership, `${label}.membership`)
    addCompactApplicationTerm(
      classes,
      membership.membershipClass,
      namespace,
      `${label}.membership.membershipClass`,
    )
    addCompactApplicationTerm(
      objectProperties,
      membership.ownerPredicate,
      namespace,
      `${label}.membership.ownerPredicate`,
    )
    addCompactApplicationTerm(
      objectProperties,
      membership.valuePredicate,
      namespace,
      `${label}.membership.valuePredicate`,
    )
    addCompactApplicationTerm(
      datatypeProperties,
      membership.positionPredicate,
      namespace,
      `${label}.membership.positionPredicate`,
    )
    const projection = optionalRecord(
      membership.coreProjection,
      `${label}.membership.coreProjection`,
    )
    if (projection) {
      addCompactApplicationTerm(
        classes,
        projection.resourceClass,
        namespace,
        `${label}.membership.coreProjection.resourceClass`,
      )
      addCompactApplicationTerm(
        objectProperties,
        projection.ownerPredicate,
        namespace,
        `${label}.membership.coreProjection.ownerPredicate`,
      )
      addCompactApplicationTerm(
        objectProperties,
        projection.valuePredicate,
        namespace,
        `${label}.membership.coreProjection.valuePredicate`,
      )
    }
    return
  }
  throw new Error(`${label}.objectMapping uses the unsupported mapping ${JSON.stringify(objectMapping)}.`)
}

const collectCompactApplicationTerms = (value: unknown, target: Set<string>) => {
  if (typeof value === 'string') {
    if (value.startsWith('sp:')) target.add(value)
    return
  }
  if (Array.isArray(value)) {
    for (const child of value) collectCompactApplicationTerms(child, target)
    return
  }
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as JsonRecord)) {
      collectCompactApplicationTerms(child, target)
    }
  }
}

export const deriveApplicationVocabularyDeclarations = (
  registryValue: unknown,
): ApplicationVocabularyDerivation => {
  const registry = record(registryValue, 'Field-semantics registry')
  const namespaceBindings = record(
    registry.namespaceBindings,
    'Field-semantics registry namespaceBindings',
  )
  const namespace = namespaceBindings.sp
  if (typeof namespace !== 'string') {
    throw new Error('Field-semantics registry namespaceBindings.sp must be an absolute IRI.')
  }
  assertSafeIri(namespace, 'Field-semantics registry namespaceBindings.sp')
  if (!Array.isArray(registry.entries)) {
    throw new Error('Field-semantics registry entries must be an array.')
  }

  const classes = new Set<string>()
  const objectProperties = new Set<string>()
  const datatypeProperties = new Set<string>()
  const observedCompactTerms = new Set<string>()
  registry.entries.forEach((entryValue, index) => {
    const entry = record(entryValue, `Field-semantics registry entry ${index}`)
    const mappingValue = entry.rdfMapping
    if (mappingValue === undefined) return
    const mapping = record(mappingValue, `Field-semantics registry entry ${index}.rdfMapping`)
    collectCompactApplicationTerms(mapping, observedCompactTerms)
    deriveConstructionTerms(
      mapping.construction,
      namespace,
      classes,
      objectProperties,
      datatypeProperties,
      `Field-semantics registry entry ${index}.rdfMapping.construction`,
    )
    deriveConstructionTerms(
      mapping.fallbackConstruction,
      namespace,
      classes,
      objectProperties,
      datatypeProperties,
      `Field-semantics registry entry ${index}.rdfMapping.fallbackConstruction`,
    )
    if (mapping.canonicalJsonLiteral !== undefined) {
      const literal = record(
        mapping.canonicalJsonLiteral,
        `Field-semantics registry entry ${index}.rdfMapping.canonicalJsonLiteral`,
      )
      addCompactApplicationTerm(
        datatypeProperties,
        literal.predicate,
        namespace,
        `Field-semantics registry entry ${index}.rdfMapping.canonicalJsonLiteral.predicate`,
      )
    }
  })

  const classifiedTerms = new Set(
    [...classes, ...objectProperties, ...datatypeProperties]
      .map((iri) => `sp:${iri.slice(namespace.length)}`),
  )
  const unclassified = [...observedCompactTerms]
    .filter((term) => !classifiedTerms.has(term))
    .sort(compareCodeUnits)
  if (unclassified.length > 0) {
    throw new Error(
      `Field-semantics registry contains unclassified application terms: ${unclassified.join(', ')}`,
    )
  }

  const objectDataPunning = [...objectProperties]
    .filter((iri) => datatypeProperties.has(iri))
    .sort(compareCodeUnits)
  if (objectDataPunning.length > 0) {
    throw new Error(
      `Application terms cannot be both object and datatype properties: ${objectDataPunning.join(', ')}`,
    )
  }

  const sortedClasses = Object.freeze([...classes].sort(compareCodeUnits))
  const sortedObjectProperties = Object.freeze([...objectProperties].sort(compareCodeUnits))
  const sortedDatatypeProperties = Object.freeze([...datatypeProperties].sort(compareCodeUnits))
  const declarations = new SortedUniqueNTriples()
  for (const iri of sortedClasses) declarations.add(iri, RDF_TYPE, iriObject(OWL_CLASS))
  for (const iri of sortedObjectProperties) declarations.add(iri, RDF_TYPE, iriObject(OWL_OBJECT_PROPERTY))
  for (const iri of sortedDatatypeProperties) {
    declarations.add(iri, RDF_TYPE, iriObject(OWL_DATATYPE_PROPERTY))
  }
  const declarationTriples = declarations.lines()
  const allTerms = new Set([
    ...sortedClasses,
    ...sortedObjectProperties,
    ...sortedDatatypeProperties,
  ])
  const summary = Object.freeze({
    namespace,
    classCount: sortedClasses.length,
    objectPropertyCount: sortedObjectProperties.length,
    datatypePropertyCount: sortedDatatypeProperties.length,
    termCount: allTerms.size,
    declarationTripleCount: declarationTriples.length,
  })
  return Object.freeze({
    classes: sortedClasses,
    objectProperties: sortedObjectProperties,
    datatypeProperties: sortedDatatypeProperties,
    declarationTriples,
    summary,
  })
}

const exactIriList = (value: unknown, label: string) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} must be an array of absolute IRI strings.`)
  }
  const result = value as string[]
  result.forEach((iri) => assertSafeIri(iri, label))
  const sorted = [...result].sort(compareCodeUnits)
  if (
    new Set(result).size !== result.length
    || sorted.some((iri, index) => iri !== result[index])
  ) throw new Error(`${label} must be sorted and duplicate-free.`)
  return Object.freeze([...result])
}

const exactExpectedCount = (value: unknown, actual: number, label: string) => {
  if (!Number.isSafeInteger(value) || value !== actual) {
    throw new Error(`${label} differs: ${String(value)} != ${actual}.`)
  }
}

export const derivePackageVocabularyDeclarations = (
  registryValue: unknown,
  declarationPolicyValue: unknown,
): PackageVocabularyDerivation => {
  const registry = deriveApplicationVocabularyDeclarations(registryValue)
  const policy = record(declarationPolicyValue, 'FWU-OWL declaration policy')
  const sources = policy.vocabularySources
  if (
    !Array.isArray(sources)
    || sources.length !== 2
    || sources[0] !== 'fieldSemanticsRegistry'
    || sources[1] !== 'applicationOntologyProfile'
  ) throw new Error('FWU-OWL declaration policy has unsupported vocabulary sources.')

  const registryPolicy = record(
    policy.fieldSemanticsRegistryVocabulary,
    'FWU-OWL registry vocabulary policy',
  )
  exactExpectedCount(registryPolicy.expectedClassCount, registry.summary.classCount, 'Registry class count')
  exactExpectedCount(
    registryPolicy.expectedObjectPropertyCount,
    registry.summary.objectPropertyCount,
    'Registry object-property count',
  )
  exactExpectedCount(
    registryPolicy.expectedDatatypePropertyCount,
    registry.summary.datatypePropertyCount,
    'Registry datatype-property count',
  )
  exactExpectedCount(registryPolicy.expectedTermCount, registry.summary.termCount, 'Registry term count')

  const applicationPolicy = record(
    policy.applicationOntologyVocabulary,
    'FWU-OWL application-ontology vocabulary policy',
  )
  const applicationClasses = exactIriList(applicationPolicy.classes, 'Application-ontology classes')
  const applicationObjectProperties = exactIriList(
    applicationPolicy.objectProperties,
    'Application-ontology object properties',
  )
  const applicationDatatypeProperties = exactIriList(
    applicationPolicy.datatypeProperties,
    'Application-ontology datatype properties',
  )
  exactExpectedCount(applicationPolicy.expectedClassCount, applicationClasses.length, 'Application class count')
  exactExpectedCount(
    applicationPolicy.expectedObjectPropertyCount,
    applicationObjectProperties.length,
    'Application object-property count',
  )
  exactExpectedCount(
    applicationPolicy.expectedDatatypePropertyCount,
    applicationDatatypeProperties.length,
    'Application datatype-property count',
  )
  exactExpectedCount(
    applicationPolicy.expectedTermCount,
    new Set([
      ...applicationClasses,
      ...applicationObjectProperties,
      ...applicationDatatypeProperties,
    ]).size,
    'Application ontology term count',
  )

  const classes = new Set([...registry.classes, ...applicationClasses])
  const objectProperties = new Set([
    ...registry.objectProperties,
    ...applicationObjectProperties,
  ])
  const datatypeProperties = new Set([
    ...registry.datatypeProperties,
    ...applicationDatatypeProperties,
  ])
  const crossKind = [
    ...[...classes].filter((iri) => objectProperties.has(iri) || datatypeProperties.has(iri)),
    ...[...objectProperties].filter((iri) => datatypeProperties.has(iri)),
  ].sort(compareCodeUnits)
  if (crossKind.length > 0) {
    throw new Error(`Package application vocabulary has cross-kind punning: ${crossKind.join(', ')}`)
  }
  const unionPolicy = record(
    policy.applicationVocabularyUnion,
    'FWU-OWL application vocabulary union policy',
  )
  exactExpectedCount(unionPolicy.expectedClassCount, classes.size, 'Union class count')
  exactExpectedCount(
    unionPolicy.expectedObjectPropertyCount,
    objectProperties.size,
    'Union object-property count',
  )
  exactExpectedCount(
    unionPolicy.expectedDatatypePropertyCount,
    datatypeProperties.size,
    'Union datatype-property count',
  )
  const applicationTermCount = new Set([
    ...classes,
    ...objectProperties,
    ...datatypeProperties,
  ]).size
  exactExpectedCount(unionPolicy.expectedTermCount, applicationTermCount, 'Union term count')

  const bootstrap = record(
    policy.parserBootstrapProperties,
    'FWU-OWL parser-bootstrap property policy',
  )
  const parserBootstrapObjectProperties = exactIriList(
    bootstrap.objectProperties,
    'Parser-bootstrap object properties',
  )
  const parserBootstrapDatatypeProperties = exactIriList(
    bootstrap.datatypeProperties,
    'Parser-bootstrap datatype properties',
  )
  const parserBootstrapPropertyCount = new Set([
    ...parserBootstrapObjectProperties,
    ...parserBootstrapDatatypeProperties,
  ]).size
  if (
    parserBootstrapObjectProperties.some((iri) => parserBootstrapDatatypeProperties.includes(iri))
  ) throw new Error('Parser-bootstrap property vocabulary contains object/data punning.')
  const bootstrapCrossKind = [
    ...parserBootstrapObjectProperties.filter(
      (iri) => classes.has(iri) || datatypeProperties.has(iri),
    ),
    ...parserBootstrapDatatypeProperties.filter(
      (iri) => classes.has(iri) || objectProperties.has(iri),
    ),
  ].sort(compareCodeUnits)
  if (bootstrapCrossKind.length > 0) {
    throw new Error(
      `Parser-bootstrap vocabulary has cross-kind punning with the application vocabulary: ${bootstrapCrossKind.join(', ')}`,
    )
  }
  const applicationTerms = new Set([
    ...classes,
    ...objectProperties,
    ...datatypeProperties,
  ])
  const bootstrapOverlap = [
    ...parserBootstrapObjectProperties,
    ...parserBootstrapDatatypeProperties,
  ].filter((iri) => applicationTerms.has(iri)).sort(compareCodeUnits)
  if (bootstrapOverlap.length > 0) {
    throw new Error(
      `Parser-bootstrap vocabulary overlaps the application vocabulary: ${bootstrapOverlap.join(', ')}`,
    )
  }
  exactExpectedCount(
    bootstrap.expectedPropertyCount,
    parserBootstrapPropertyCount,
    'Parser-bootstrap property count',
  )

  const declarations = new SortedUniqueNTriples()
  ;[...classes].sort(compareCodeUnits).forEach((iri) => declarations.add(iri, RDF_TYPE, iriObject(OWL_CLASS)))
  ;[...objectProperties, ...parserBootstrapObjectProperties]
    .sort(compareCodeUnits)
    .forEach((iri) => declarations.add(iri, RDF_TYPE, iriObject(OWL_OBJECT_PROPERTY)))
  ;[...datatypeProperties, ...parserBootstrapDatatypeProperties]
    .sort(compareCodeUnits)
    .forEach((iri) => declarations.add(iri, RDF_TYPE, iriObject(OWL_DATATYPE_PROPERTY)))
  const declarationTriples = declarations.lines()
  exactExpectedCount(
    policy.expectedDeclarationTripleCount,
    declarationTriples.length,
    'Package declaration triple count',
  )
  const applicationSummary = Object.freeze({
    namespace: registry.summary.namespace,
    classCount: classes.size,
    objectPropertyCount: objectProperties.size,
    datatypePropertyCount: datatypeProperties.size,
    termCount: applicationTermCount,
    declarationTripleCount: applicationTermCount,
  })
  return Object.freeze({
    classes: Object.freeze([...classes].sort(compareCodeUnits)),
    objectProperties: Object.freeze([...objectProperties].sort(compareCodeUnits)),
    datatypeProperties: Object.freeze([...datatypeProperties].sort(compareCodeUnits)),
    parserBootstrapObjectProperties,
    parserBootstrapDatatypeProperties,
    declarationTriples,
    registrySummary: registry.summary,
    applicationSummary,
    parserBootstrapPropertyCount,
    declarationTripleCount: declarationTriples.length,
  })
}
