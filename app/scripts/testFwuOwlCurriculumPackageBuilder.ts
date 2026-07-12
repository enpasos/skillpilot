import { createHash } from 'node:crypto'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import {
  FwuOwlFieldRegistry,
  canonicalJsonText,
  compactCanonicalJsonBytes,
  decodeJsonPointer,
  encodeJsonPointer,
  matchJsonPointerPattern,
  type JsonObject,
  type JsonValue,
} from './fwuOwlFieldRegistry'
import {
  EXPECTED_APPLICATION_VOCABULARY_SUMMARY,
  SortedUniqueNTriples,
  canonicalTripleLine,
  concatenateFilesExactly,
  deriveApplicationVocabularyDeclarations,
  derivePackageVocabularyDeclarations,
  iriObject,
  iriTerm,
  languageLiteralObject,
  literalTerm,
  plainLiteralObject,
  typedLiteralObject,
} from './fwuOwlNTriples'
import {
  assertNoSymlinkComponents,
  assertSafePackagePath,
  fileIntegrity,
  inlineIntegrity,
  repositoryRoot,
  type SourceLogicalArtifact,
  type ValidatedSourceJsonPackage,
} from './fwuOwlPackageSource'
import {
  FWU_OWL_SEGMENT_ORDER,
  FWU_OWL_SEGMENT_ROUTING,
  compileFwuOwlSemantics,
  fwuOwlSemanticCompilationDigest,
} from './fwuOwlSemanticCompiler'

const registryPath = resolve(
  repositoryRoot,
  'contracts/curriculum-package/v1/profiles/skillpilot-fwu-field-semantics-v1.registry.json',
)
const curriculumProfilePath = resolve(
  repositoryRoot,
  'contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-v1.profile.json',
)
const fwuPackageProfilePath = resolve(
  repositoryRoot,
  'contracts/curriculum-package/v1/profiles/fwu-owl-v1.profile.json',
)

const sha256 = (content: Buffer | string) => createHash('sha256').update(content).digest('hex')

const assert: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message)
}

const assertEqual = (actual: unknown, expected: unknown, message: string) => {
  if (!isDeepStrictEqual(actual, expected)) {
    throw new Error(
      `${message}\nExpected: ${JSON.stringify(expected)}\nActual:   ${JSON.stringify(actual)}`,
    )
  }
}

const expectThrows = (action: () => unknown, pattern: RegExp, message: string) => {
  let caught: unknown
  try {
    action()
  } catch (error) {
    caught = error
  }
  if (caught === undefined) throw new Error(`${message}: operation unexpectedly succeeded`)
  const rendered = caught instanceof Error ? caught.message : String(caught)
  if (!pattern.test(rendered)) {
    throw new Error(`${message}: unexpected error: ${rendered}`)
  }
}

const readJsonObject = (path: string): JsonObject => {
  const value = JSON.parse(readFileSync(path, 'utf8')) as JsonValue
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), `${path} is not an object`)
  return value
}

const registryValue = readJsonObject(registryPath)
const curriculumProfile = readJsonObject(curriculumProfilePath)
const fwuPackageProfile = readJsonObject(fwuPackageProfilePath)

const testFieldRegistry = () => {
  const registry = new FwuOwlFieldRegistry(registryValue)
  assertEqual(registry.registryId, 'skillpilot-fwu-field-semantics-v1', 'Registry ID drifted')
  assertEqual(registry.entries.length, 454, 'Registry entry count drifted')

  const contractPolicy = fwuPackageProfile.contractPolicy
  assert(
    contractPolicy !== null && typeof contractPolicy === 'object' && !Array.isArray(contractPolicy),
    'FWU package profile contract policy is missing',
  )
  const trustedContracts = contractPolicy.trustedGlobalContracts
  assert(Array.isArray(trustedContracts), 'FWU package profile trusted contracts are missing')
  const registryBinding = trustedContracts.find(
    (value) => value !== null
      && typeof value === 'object'
      && !Array.isArray(value)
      && value.bindingName === 'fieldSemanticsRegistry',
  )
  assert(
    registryBinding !== undefined
      && registryBinding !== null
      && typeof registryBinding === 'object'
      && !Array.isArray(registryBinding),
    'FWU package profile registry binding is missing',
  )
  const registryIntegrity = fileIntegrity(registryPath)
  assertEqual(registryBinding.id, registry.registryId, 'FWU package profile registry ID drifted')
  assertEqual(registryBinding.bytes, registryIntegrity.bytes, 'FWU package profile registry bytes drifted')
  assertEqual(registryBinding.sha256, registryIntegrity.sha256, 'FWU package profile registry hash drifted')

  const corePolicy = fwuPackageProfile.coreBindingPolicy
  const curriculumCore = curriculumProfile.coreBinding
  assert(
    corePolicy !== null && typeof corePolicy === 'object' && !Array.isArray(corePolicy),
    'FWU package profile Core binding is missing',
  )
  assert(
    curriculumCore !== null && typeof curriculumCore === 'object' && !Array.isArray(curriculumCore),
    'Curriculum ontology profile Core binding is missing',
  )
  assertEqual(
    corePolicy.canonicalOntologyIri,
    curriculumCore.ontologyIri,
    'FWU and curriculum profiles bind different Core ontology IRIs',
  )
  assertEqual(
    corePolicy.sourceCommit,
    curriculumCore.commit,
    'FWU and curriculum profiles bind different Core commits',
  )
  assertEqual(
    corePolicy.sha256,
    curriculumCore.fileSha256,
    'FWU and curriculum profiles bind different Core bytes',
  )

  assertEqual(
    decodeJsonPointer('/a~1b/~0value'),
    ['a/b', '~value'],
    'RFC-6901 decoding changed',
  )
  assertEqual(
    encodeJsonPointer(['a/b', '~value', 0]),
    '/a~1b/~0value/0',
    'RFC-6901 encoding changed',
  )
  assert(
    matchJsonPointerPattern(['goals', '*', '**', 'id'], ['goals', '0', 'children', '1', 'id']),
    'Recursive pointer pattern did not match',
  )
  assert(
    !matchJsonPointerPattern(['goals', '*', 'id'], ['goals', '0', 'children', 'id']),
    'Single-segment wildcard matched too much',
  )

  const generated = registry.normalizeAndCover('runtime-catalog', {
    $schema: 'https://example.test/generated.schema.json',
    catalogVersion: '1.0',
    runtimeContractVersion: '1.0',
  })
  assertEqual(
    generated.normalized,
    { runtimeContractVersion: '1.0' },
    'Generated fields were not excluded from semantic normalization',
  )
  assertEqual(
    generated.excludedGeneratedPaths,
    ['/$schema', '/catalogVersion'],
    'Generated-field coverage changed',
  )

  const setResult = registry.normalizeAndCover('runtime-catalog', {
    capabilities: ['zeta', 'alpha'],
  })
  assertEqual(
    (setResult.normalized as JsonObject).capabilities,
    ['alpha', 'zeta'],
    'Registry-declared set was not sorted canonically',
  )
  expectThrows(
    () => registry.normalizeAndCover('runtime-catalog', { capabilities: ['same', 'same'] }),
    /Duplicate item in registry-declared set/u,
    'Duplicate registry set item was accepted',
  )
  expectThrows(
    () => registry.normalizeAndCover('runtime-catalog', {
      runtimeContractVersion: '1.0',
      unknownField: true,
    }),
    /Unregistered release-model field runtime-catalog:\/unknownField/u,
    'Unknown runtime field was accepted',
  )

  const inherited = registry.resolveEffective(
    'canonical-landscape',
    '/goals/0/extendedData/customField',
  )
  assertEqual(inherited.entry.entryId, 'goal.extended-data', 'Literal ancestor was not selected')
  assert(inherited.inheritedFromCanonicalJsonLiteral, 'Literal descendant was not marked inherited')
  const literal = registry.projectCanonicalJsonLiteral(
    'canonical-landscape',
    '/goals/0/extendedData',
    { customField: { answer: 42 }, vocabularySource: 'separate RDF field' },
  )
  assertEqual(
    literal.value,
    { customField: { answer: 42 } },
    'More-specific literal descendant was not excluded',
  )
  assertEqual(literal.text, '{"customField":{"answer":42}}', 'Canonical literal bytes changed')

  const ambiguousRegistry = JSON.parse(JSON.stringify(registryValue)) as JsonObject
  const entries = ambiguousRegistry.entries
  assert(Array.isArray(entries), 'Registry entries disappeared during mutation setup')
  const sourceEntry = entries.find(
    (entry) => entry !== null
      && typeof entry === 'object'
      && !Array.isArray(entry)
      && entry.entryId === 'runtime.capabilities',
  )
  assert(
    sourceEntry !== undefined
      && sourceEntry !== null
      && typeof sourceEntry === 'object'
      && !Array.isArray(sourceEntry),
    'Mutation source entry is missing',
  )
  entries.push({ ...sourceEntry, entryId: 'runtime.capabilities-ambiguous-copy' })
  expectThrows(
    () => new FwuOwlFieldRegistry(ambiguousRegistry),
    /Ambiguous equal-specificity registry patterns/u,
    'Ambiguous registry patterns were accepted',
  )

  assertEqual(
    canonicalJsonText({ '2': 'two', '10': 'ten', nested: [true, null] }),
    '{\n  "10": "ten",\n  "2": "two",\n  "nested": [\n    true,\n    null\n  ]\n}\n',
    'Canonical pretty JSON is not sorted with two-space indentation and final LF',
  )
}

const testNTriples = () => {
  const escapedLine = canonicalTripleLine(
    'https://example.test/subject<one',
    'https://example.test/predicate',
    plainLiteralObject('quote " slash \\ tab\tline\ncarriage\r'),
  )
  assert(
    escapedLine.includes('<https://example.test/subject\\u003Cone>'),
    'Forbidden IRI punctuation was not escaped',
  )
  assert(
    escapedLine.includes('"quote \\" slash \\\\ tab\\tline\\ncarriage\\r"'),
    'Literal escaping changed',
  )
  assertEqual(
    literalTerm(languageLiteralObject('Hallo', 'DE-de')),
    '"Hallo"@de-de',
    'Language tags are not canonicalized',
  )
  assertEqual(
    iriTerm('https://example.test/emoji/😀'),
    '<https://example.test/emoji/😀>',
    'Valid Unicode IRI changed',
  )
  expectThrows(
    () => iriObject('https://example.test/%GG'),
    /invalid percent-escape/u,
    'Invalid percent escape was accepted',
  )
  expectThrows(
    () => languageLiteralObject('Hallo', 'de_XX'),
    /Invalid N-Triples language tag/u,
    'Invalid language tag was accepted',
  )
  expectThrows(
    () => plainLiteralObject('\ud800'),
    /unpaired UTF-16 surrogate/u,
    'Unpaired surrogate was accepted',
  )
  expectThrows(
    () => plainLiteralObject('bad\u0001control'),
    /forbidden control/u,
    'Forbidden literal control was accepted',
  )

  const first = canonicalTripleLine(
    'https://example.test/a',
    'https://example.test/p',
    typedLiteralObject('1', 'http://www.w3.org/2001/XMLSchema#integer'),
  )
  const second = canonicalTripleLine(
    'https://example.test/b',
    'https://example.test/p',
    iriObject('https://example.test/o'),
  )
  const triples = new SortedUniqueNTriples()
  triples.add(
    'https://example.test/b',
    'https://example.test/p',
    iriObject('https://example.test/o'),
  )
  triples.add(
    'https://example.test/a',
    'https://example.test/p',
    typedLiteralObject('1', 'http://www.w3.org/2001/XMLSchema#integer'),
  )
  triples.add(
    'https://example.test/a',
    'https://example.test/p',
    typedLiteralObject('1', 'http://www.w3.org/2001/XMLSchema#integer'),
  )
  const serialized = triples.serialize()
  assertEqual(serialized.tripleCount, 2, 'N-Triples duplicate was not removed')
  assertEqual(serialized.content.toString('utf8'), `${first}${second}`, 'N-Triples order changed')
  assertEqual(serialized.bytes, serialized.content.length, 'N-Triples byte count changed')
  assertEqual(serialized.sha256, sha256(serialized.content), 'N-Triples digest changed')

  const vocabulary = deriveApplicationVocabularyDeclarations(registryValue)
  assertEqual(
    {
      classCount: vocabulary.summary.classCount,
      objectPropertyCount: vocabulary.summary.objectPropertyCount,
      datatypePropertyCount: vocabulary.summary.datatypePropertyCount,
      termCount: vocabulary.summary.termCount,
      declarationTripleCount: vocabulary.summary.declarationTripleCount,
    },
    EXPECTED_APPLICATION_VOCABULARY_SUMMARY,
    'Application vocabulary declaration counts drifted',
  )
  assertEqual(vocabulary.declarationTriples.length, 485, 'Declaration line count drifted')
  assertEqual(
    [...new Set(vocabulary.declarationTriples)].sort(),
    [...vocabulary.declarationTriples],
    'Vocabulary declarations are not sorted and unique',
  )
  const declaredTerms = new Set([
    ...vocabulary.classes,
    ...vocabulary.objectProperties,
    ...vocabulary.datatypeProperties,
  ])
  assertEqual(declaredTerms.size, 485, 'Application vocabulary contains punning or duplicates')

  const declarationPolicy = fwuPackageProfile.declarationPolicy
  const packageVocabulary = derivePackageVocabularyDeclarations(registryValue, declarationPolicy)
  assertEqual(packageVocabulary.declarationTripleCount, 526, 'Package declaration count drifted')
  assertEqual(packageVocabulary.parserBootstrapObjectProperties.length, 12, 'Bootstrap object-property count drifted')
  assertEqual(packageVocabulary.parserBootstrapDatatypeProperties.length, 4, 'Bootstrap datatype-property count drifted')
  const declarationLines = new Set(packageVocabulary.declarationTriples)
  assert(
    declarationLines.has(
      '<https://skillpilot.de/ns/roundtrip#fieldState> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#DatatypeProperty> .\n',
    ),
    'fieldState datatype-property declaration is missing',
  )
  assert(
    declarationLines.has(
      '<https://skillpilot.de/ns/roundtrip#referenceRole> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#DatatypeProperty> .\n',
    ),
    'referenceRole datatype-property declaration is missing',
  )
  for (const iri of packageVocabulary.parserBootstrapObjectProperties) {
    assert(
      declarationLines.has(
        `<${iri}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#ObjectProperty> .\n`,
      ),
      `Bootstrap object-property declaration is missing: ${iri}`,
    )
  }
  for (const iri of packageVocabulary.parserBootstrapDatatypeProperties) {
    assert(
      declarationLines.has(
        `<${iri}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#DatatypeProperty> .\n`,
      ),
      `Bootstrap datatype-property declaration is missing: ${iri}`,
    )
  }
  const punningPolicy = JSON.parse(JSON.stringify(declarationPolicy)) as JsonObject
  const punningBootstrap = punningPolicy.parserBootstrapProperties
  assert(
    punningBootstrap !== null
      && typeof punningBootstrap === 'object'
      && !Array.isArray(punningBootstrap),
    'Mutation lost parser-bootstrap policy',
  )
  const punningObjectProperties = punningBootstrap.objectProperties
  assert(Array.isArray(punningObjectProperties), 'Mutation lost bootstrap object-property list')
  punningObjectProperties[0] = 'https://skillpilot.de/ns/roundtrip#fieldState'
  punningObjectProperties.sort()
  expectThrows(
    () => derivePackageVocabularyDeclarations(registryValue, punningPolicy),
    /cross-kind punning with the application vocabulary/u,
    'Cross-set application/bootstrap property punning was accepted',
  )
}

const testSourceGuards = () => {
  assertSafePackagePath('data/canonical/fixture.json')
  for (const unsafe of [
    '/absolute.json',
    '../escape.json',
    'data\\windows.json',
    'data/CON/value.json',
    'data/colon:name.json',
    'data/trailing.',
  ]) {
    expectThrows(
      () => assertSafePackagePath(unsafe),
      /Unsafe package path/u,
      `Unsafe package path was accepted: ${unsafe}`,
    )
  }

  const tmpRoot = resolve(repositoryRoot, 'tmp')
  mkdirSync(tmpRoot, { recursive: true })
  const directory = mkdtempSync(resolve(tmpRoot, 'fwu-owl-builder-selftest-'))
  try {
    const alphaPath = resolve(directory, 'alpha.bin')
    const betaPath = resolve(directory, 'beta.bin')
    const outputPath = resolve(directory, 'joined.bin')
    const symlinkPath = resolve(directory, 'alpha-link.bin')
    const alpha = Buffer.from('alpha\n', 'utf8')
    const beta = Buffer.from([0, 1, 2, 255])
    writeFileSync(alphaPath, alpha)
    writeFileSync(betaPath, beta)
    symlinkSync(alphaPath, symlinkPath)

    const alphaIntegrity = fileIntegrity(alphaPath)
    assertEqual(alphaIntegrity.bytes, alpha.length, 'Source file byte count changed')
    assertEqual(alphaIntegrity.sha256, sha256(alpha), 'Source file SHA-256 changed')
    assertEqual(inlineIntegrity(alpha), alphaIntegrity, 'Inline and file integrity differ')
    assertNoSymlinkComponents(directory, alphaPath, false)
    expectThrows(
      () => assertNoSymlinkComponents(directory, symlinkPath, false),
      /Symlink path component is forbidden/u,
      'Symlink path component was accepted',
    )
    expectThrows(
      () => fileIntegrity(symlinkPath),
      /non-symlink file/u,
      'Symlink file integrity was accepted',
    )

    const joined = concatenateFilesExactly(
      [
        { path: alphaPath, expectedBytes: alpha.length, expectedSha256: sha256(alpha) },
        { path: betaPath, expectedBytes: beta.length, expectedSha256: sha256(beta) },
      ],
      outputPath,
    )
    const expected = Buffer.concat([alpha, beta])
    assertEqual(readFileSync(outputPath), expected, 'Exact source concatenation changed bytes')
    assertEqual(joined.bytes, expected.length, 'Exact concatenation byte count changed')
    assertEqual(joined.sha256, sha256(expected), 'Exact concatenation digest changed')
    expectThrows(
      () => concatenateFilesExactly(
        [{ path: alphaPath, expectedSha256: '0'.repeat(64) }],
        outputPath,
      ),
      /binding mismatch/u,
      'Incorrect source digest binding was accepted',
    )
    expectThrows(
      () => concatenateFilesExactly([{ path: alphaPath }], alphaPath),
      /must not also be an input/u,
      'Concatenation output alias was accepted',
    )
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

const landscapeDocument: JsonObject = {
  landscapeId: 'fixture-landscape',
  locale: 'de',
  title: 'Deterministische Testlandschaft',
  goals: [
    {
      id: 'area',
      title: 'Testbereich',
      description: 'Die lernende Person überblickt den Testbereich.',
      type: 'cluster',
      semanticKind: 'curricularArea',
      weight: 1,
      contains: ['atom-parented'],
      requires: [],
      dimensionTags: { strand: ['test'] },
    },
    {
      id: 'atom-parented',
      title: 'Zugeordnetes Lernziel',
      description: 'Die lernende Person kann das zugeordnete Lernziel bearbeiten.',
      type: 'atomic',
      semanticKind: 'curricularAtomic',
      weight: 1,
      contains: [],
      requires: [],
      competencyRefs: ['PROCESS.K1'],
      dimensionTags: {
        guidingIdeas: ['L1'],
        processCompetencies: ['K1'],
      },
    },
    {
      id: 'atom-unscoped',
      title: 'Nicht direkt zugeordnetes Lernziel',
      description: 'Die lernende Person kann das nicht direkt zugeordnete Lernziel bearbeiten.',
      type: 'atomic',
      semanticKind: 'curricularAtomic',
      weight: 1,
      contains: [],
      requires: ['atom-parented'],
      competencyRefs: [],
      dimensionTags: {},
    },
  ],
  competencyCatalog: [
    {
      dimension: 'process-competency',
      id: 'PROCESS.K1',
      label: 'Mathematisch argumentieren',
    },
  ],
}

const semanticDocuments: readonly {
  role: string
  logicalId: string
  document: JsonObject
}[] = [
  {
    role: 'runtime-catalog',
    logicalId: 'runtime',
    document: {
      runtimeContractVersion: '1.0',
      capabilities: ['semantic-roundtrip'],
    },
  },
  {
    role: 'canonical-landscape',
    logicalId: 'landscape',
    document: landscapeDocument,
  },
  {
    role: 'composition-view',
    logicalId: 'view',
    document: {
      viewId: 'fixture-view',
      landscapeId: 'fixture-landscape',
      language: 'de',
      rootNodes: [
        {
          id: 'fixture-node',
          kind: 'goal',
          goalId: 'atom-parented',
        },
      ],
    },
  },
  {
    role: 'source-to-canonical-mappings',
    logicalId: 'mappings',
    document: {
      targetLandscapeId: 'fixture-landscape',
      decisionCount: 0,
    },
  },
  {
    role: 'official-source-index',
    logicalId: 'sources',
    document: {
      targetLandscapeId: 'fixture-landscape',
    },
  },
  {
    role: 'card-deck',
    logicalId: 'cards',
    document: {
      deckId: 'fixture-deck',
      landscapeId: 'fixture-landscape',
      language: 'de',
      title: 'Testkarten',
      cards: [
        {
          id: 'fixture-card',
          front: 'Vorderseite',
          back: 'Rückseite',
        },
      ],
    },
  },
  {
    role: 'resource-index',
    logicalId: 'assets',
    document: {
      resources: [
        {
          resourceId: 'fixture-image',
          publicUrl: '/assets/goal-visualizations/fixture-image.png',
          delivery: 'embedded',
          mediaType: 'image/png',
          bytes: 3,
          sha256: sha256(Buffer.from([1, 2, 3])),
        },
      ],
    },
  },
]

const logicalArtifact = (
  registry: FwuOwlFieldRegistry,
  role: string,
  logicalId: string,
  document: JsonObject,
): SourceLogicalArtifact => {
  const normalized = registry.normalizeAndCover(role, document, { retainDetails: false }).normalized
  const normalizedBytes = compactCanonicalJsonBytes(normalized)
  const sourceBytes = Buffer.from(canonicalJsonText(document), 'utf8')
  return {
    logicalId,
    normalizationRole: role,
    path: `data/${logicalId}.json`,
    sourcePath: resolve(repositoryRoot, 'tmp', `${logicalId}.json`),
    bytes: sourceBytes.length,
    sha256: sha256(sourceBytes),
    normalizedBytes: normalizedBytes.length,
    normalizedSha256: sha256(normalizedBytes),
    recordSha256: sha256(`record:${logicalId}`),
    document,
  }
}

const sourceFixture = (logicalArtifacts: SourceLogicalArtifact[]): ValidatedSourceJsonPackage => {
  const zeroDigest = '0'.repeat(64)
  return {
    zipPath: resolve(repositoryRoot, 'tmp/fwu-owl-unit-fixture.zip'),
    zipFile: 'fwu-owl-unit-fixture.zip',
    zipBytes: 0,
    zipSha256: zeroDigest,
    manifestPath: 'manifest.json',
    manifestBytes: 0,
    manifestSha256: zeroDigest,
    rootPath: resolve(repositoryRoot, 'tmp/fwu-owl-unit-fixture'),
    manifest: {
      packageFormatVersion: '1.0',
      runtimeContractVersion: '1.0',
      releaseProfile: 'full-standalone-v1',
      variant: 'json',
      releaseId: 'fixture-release@1.0.0',
      packageId: 'fixture-package',
      packageVersion: '1.0.0',
      curriculumEdition: 'fixture',
      contentDigest: `sha256:${zeroDigest}`,
      archiveRoot: 'fixture-package',
      supportedSkillpilotSoftware: '>=0.0.0',
      licenseDocuments: [],
      contractBindings: {},
      files: [],
    },
    validationReport: {},
    semanticContentIndexPath: 'metadata/semantic-content-index.json',
    semanticContentIndexBytes: 0,
    semanticContentIndexSha256: zeroDigest,
    semanticContentIndex: {
      contentDigest: `sha256:${zeroDigest}`,
      logicalArtifacts: [],
      binaryResources: [],
      normalizationProfile: { id: 'semantic-normal-form-v1', version: '1.0.0', sha256: zeroDigest },
      fieldSemanticsRegistry: {
        id: 'skillpilot-fwu-field-semantics-v1',
        version: '1.2.0',
        sha256: sha256(readFileSync(registryPath)),
      },
    },
    logicalArtifacts,
    binaryResources: [],
    releaseSupport: [],
    sourceContractBindings: {},
  }
}

const assertCanonicalSegment = (content: Buffer, segmentId: string) => {
  const text = content.toString('utf8')
  assert(text.endsWith('\n'), `${segmentId} segment lacks final LF`)
  const lines = text.slice(0, -1).split('\n').map((line) => `${line}\n`)
  assertEqual(lines, [...lines].sort(), `${segmentId} segment is not sorted`)
  assertEqual(new Set(lines).size, lines.length, `${segmentId} segment contains duplicates`)
}

const testSemanticCompiler = () => {
  const registry = new FwuOwlFieldRegistry(registryValue)
  assertEqual(
    Object.keys(FWU_OWL_SEGMENT_ROUTING).sort(),
    [
      'canonical-landscape',
      'card-deck',
      'card-index',
      'composition-view',
      'composition-view-index',
      'dependency-closure',
      'migration-aliases',
      'official-source-index',
      'release-quality-evidence',
      'resource-index',
      'runtime-catalog',
      'source-goal-reference-index',
      'source-to-canonical-mappings',
    ],
    'Semantic segment routing changed unexpectedly',
  )
  const artifacts = semanticDocuments.map(({ role, logicalId, document }) =>
    logicalArtifact(registry, role, logicalId, document))
  const source = sourceFixture(artifacts)
  const first = compileFwuOwlSemantics({
    source,
    registryValue,
    curriculumProfile,
    packageProfile: fwuPackageProfile,
  })
  const second = compileFwuOwlSemantics({
    source,
    registryValue,
    curriculumProfile,
    packageProfile: fwuPackageProfile,
  })

  assertEqual(first.logicalArtifactCount, 7, 'Compiler logical artifact count changed')
  assertEqual(first.fieldRegistryEntryCount, 454, 'Compiler registry count changed')
  assert(first.observedRegistryEntryCount > 20, 'Compiler observed too few registry entries')
  assert(first.observationCount > first.observedRegistryEntryCount, 'Compiler coverage did not count instances')
  assertEqual(first.generatedFallbackAreaCount, 1, 'Fallback curricular area policy changed')
  assertEqual(
    {
      classCount: first.applicationVocabulary.classCount,
      objectPropertyCount: first.applicationVocabulary.objectPropertyCount,
      datatypePropertyCount: first.applicationVocabulary.datatypePropertyCount,
      termCount: first.applicationVocabulary.termCount,
      declarationTripleCount: first.applicationVocabulary.declarationTripleCount,
    },
    {
      classCount: 84,
      objectPropertyCount: 108,
      datatypePropertyCount: 318,
      termCount: 510,
      declarationTripleCount: 510,
    },
    'Compiler application vocabulary counts changed',
  )
  assertEqual(first.registryVocabulary, {
    namespace: 'https://skillpilot.de/ns/roundtrip#',
    ...EXPECTED_APPLICATION_VOCABULARY_SUMMARY,
  }, 'Compiler registry vocabulary counts changed')
  assertEqual(first.parserBootstrapPropertyCount, 16, 'Parser-bootstrap property count changed')
  assertEqual(first.declarationTripleCount, 526, 'Package declaration count changed')

  for (const segmentId of FWU_OWL_SEGMENT_ORDER) {
    const segment = first.segments[segmentId]
    assert(segment.tripleCount > 0, `${segmentId} segment is empty`)
    assertEqual(segment.bytes, segment.content.length, `${segmentId} segment byte count changed`)
    assertEqual(segment.sha256, sha256(segment.content), `${segmentId} segment SHA-256 changed`)
    assertCanonicalSegment(segment.content, segmentId)
    assertEqual(
      segment.content,
      second.segments[segmentId].content,
      `${segmentId} compilation is not deterministic`,
    )
  }
  assertEqual(first.segments.declarations.tripleCount, 526, 'Declaration segment count changed')
  assertEqual(
    fwuOwlSemanticCompilationDigest(first),
    fwuOwlSemanticCompilationDigest(second),
    'Semantic compilation digest is not deterministic',
  )

  const segmentMarkers: Record<string, string> = {
    runtime: '/artifact/runtime-catalog/runtime',
    landscape: '/landscape/fixture-landscape',
    views: '/view/fixture-view',
    mappings: '/artifact/source-to-canonical-mappings/mappings',
    sources: '/artifact/official-source-index/sources',
    cards: '/deck/fixture-deck%40de',
    assets: '/resource/fixture-image',
  }
  for (const [segmentId, marker] of Object.entries(segmentMarkers)) {
    const content = first.segments[segmentId as keyof typeof first.segments].content.toString('utf8')
    assert(content.includes(marker), `${segmentId} did not receive its routed semantic artifact`)
  }
  const landscape = first.segments.landscape.content.toString('utf8')
  const base = 'https://skillpilot.de/id/curriculum-package/fixture-release%401.0.0'
  const goal = (id: string) => `${base}/goal/${id}`
  const landscapeIri = `${base}/landscape/fixture-landscape`
  const triple = (subject: string, predicate: string, object: string) =>
    `<${subject}> <${predicate}> <${object}> .\n`
  const typedTriple = (subject: string, predicate: string, value: string) =>
    `<${subject}> <${predicate}> ${JSON.stringify(value)}^^<http://www.w3.org/2001/XMLSchema#string> .\n`
  const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
  const bfoHasPart = 'http://purl.obolibrary.org/obo/BFO_0000051'
  const lpAtomic = 'https://w3id.org/lehrplan/ontology/LP_0000336'
  const lpArea = 'https://w3id.org/lehrplan/ontology/LP_0000349'
  const lpHasReference = 'https://w3id.org/lehrplan/ontology/LP_0030071'
  const lpRefersTo = 'https://w3id.org/lehrplan/ontology/LP_0030072'
  const lpDidacticPrerequisite = 'https://w3id.org/lehrplan/ontology/LP_0000554'
  const fallbackArea = `${landscapeIri}/core-projection/unscoped-curricular-area`
  assert(landscape.includes(triple(goal('area'), rdfType, lpArea)), 'Core curricular-area type is missing')
  assert(landscape.includes(triple(goal('atom-parented'), rdfType, lpAtomic)), 'Parented Core atomic type is missing')
  assert(landscape.includes(triple(goal('atom-unscoped'), rdfType, lpAtomic)), 'Fallback Core atomic type is missing')
  assert(landscape.includes(triple(goal('area'), bfoHasPart, goal('atom-parented'))), 'Authored Core area membership is missing')
  assert(landscape.includes(triple(fallbackArea, bfoHasPart, goal('atom-unscoped'))), 'Fallback Core area membership is missing')
  assert(!landscape.includes(triple(fallbackArea, bfoHasPart, goal('atom-parented'))), 'Fallback area contains an already scoped atom')

  const prerequisite = `${goal('atom-unscoped')}/membership/goal.requires/0`
  assert(landscape.includes(triple(goal('atom-unscoped'), lpHasReference, prerequisite)), 'Core prerequisite owner edge is missing')
  assert(landscape.includes(triple(prerequisite, rdfType, lpDidacticPrerequisite)), 'Core prerequisite type is missing')
  assert(landscape.includes(triple(prerequisite, lpRefersTo, goal('atom-parented'))), 'Core prerequisite target is missing')

  const fieldState = '{"entryId":"goal.competency-refs","field":"competencyRefs","state":"present-empty-array"}'
  const fieldStateTriple = typedTriple(
    goal('atom-unscoped'),
    'https://skillpilot.de/ns/roundtrip#fieldState',
    fieldState,
  )
  assert(landscape.includes(fieldStateTriple), 'Present-empty competencyRefs state is missing')
  assertEqual(
    landscape.split(fieldStateTriple).length - 1,
    1,
    'Present-empty competencyRefs state was emitted for a missing or non-empty field',
  )

  const processReference = `${goal('atom-parented')}/core-reference/PROCESS.K1`
  const guidingReference = `${goal('atom-parented')}/core-reference/GUIDING.L1`
  const referenceRole = 'https://skillpilot.de/ns/roundtrip#referenceRole'
  assert(
    landscape.includes(typedTriple(processReference, referenceRole, 'competencyRefs')),
    'Authored competency-reference role is missing',
  )
  assert(
    landscape.includes(typedTriple(processReference, referenceRole, 'dimensionTags.processCompetencies')),
    'Process-competency reference role is missing',
  )
  assert(
    landscape.includes(typedTriple(guidingReference, referenceRole, 'dimensionTags.guidingIdeas')),
    'Guiding-idea reference role is missing',
  )
  assert(landscape.includes(triple(goal('atom-parented'), lpHasReference, processReference)), 'Process reference owner edge is missing')
  assert(landscape.includes(triple(processReference, lpRefersTo, `${landscapeIri}/competency/PROCESS.K1`)), 'Process reference target is missing')

  const wrongDigestArtifacts = [...artifacts]
  wrongDigestArtifacts[0] = { ...wrongDigestArtifacts[0], normalizedSha256: '0'.repeat(64) }
  expectThrows(
    () => compileFwuOwlSemantics({
      source: sourceFixture(wrongDigestArtifacts),
      registryValue,
      curriculumProfile,
      packageProfile: fwuPackageProfile,
    }),
    /differs from semantic-content-index/u,
    'Compiler accepted a mismatched normalized artifact digest',
  )

  const invalidLandscape = JSON.parse(JSON.stringify(landscapeDocument)) as JsonObject
  const invalidGoals = invalidLandscape.goals
  assert(Array.isArray(invalidGoals), 'Invalid-kind mutation lost goals')
  const invalidGoal = invalidGoals[0]
  assert(invalidGoal !== null && typeof invalidGoal === 'object' && !Array.isArray(invalidGoal), 'Invalid-kind goal is missing')
  invalidGoal.semanticKind = 'inferred-from-title'
  const invalidKindArtifacts = artifacts.map((artifact) =>
    artifact.normalizationRole === 'canonical-landscape'
      ? logicalArtifact(registry, 'canonical-landscape', 'landscape', invalidLandscape)
      : artifact)
  expectThrows(
    () => compileFwuOwlSemantics({
      source: sourceFixture(invalidKindArtifacts),
      registryValue,
      curriculumProfile,
      packageProfile: fwuPackageProfile,
    }),
    /unsupported semanticKind inferred-from-title/u,
    'Compiler inferred or accepted an unsupported semantic kind',
  )

  const unrouted = logicalArtifact(
    registry,
    'quality-evidence',
    'unrouted',
    { generatedAt: '2026-01-01T00:00:00Z' },
  )
  expectThrows(
    () => compileFwuOwlSemantics({
      source: sourceFixture([...artifacts, unrouted]),
      registryValue,
      curriculumProfile,
      packageProfile: fwuPackageProfile,
    }),
    /No FWU-OWL RDF segment routing/u,
    'Compiler accepted an unrouted logical artifact role',
  )
}

const tests: readonly [name: string, run: () => void][] = [
  ['field registry', testFieldRegistry],
  ['N-Triples and declarations', testNTriples],
  ['source path and integrity guards', testSourceGuards],
  ['semantic compiler', testSemanticCompiler],
]

for (const [name, run] of tests) {
  run()
  process.stdout.write(`PASS ${name}\n`)
}
process.stdout.write(`FWU-OWL curriculum package builder self-test passed (${tests.length} suites).\n`)
