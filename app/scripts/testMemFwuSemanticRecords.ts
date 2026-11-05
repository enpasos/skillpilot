import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  emptyCounts,
  writeLandscapeSemantics,
  writeMappingSemantics,
  writeProfile,
  writeSemanticDeclarations,
  writeSourceSemantics,
  writeViewSemantics,
} from './memFwuRoundtrip'
import { readRdfModel, reconstructLandscape, reconstructMappings, reconstructSourceGoalReferences, reconstructViews } from './semanticMemFwuRoundtrip'
import { assertJsonValue, compactCanonicalJsonText } from './fwuOwlFieldRegistry'

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url))
const archiveRoot = 'semantic-record-regression'
const directory = await mkdtemp(join(tmpdir(), 'skillpilot-semantic-records-'))
const readJson = async (path: string) => JSON.parse(await readFile(resolve(repositoryRoot, path), 'utf8'))
const entry = (path: string, data: unknown) => {
  const text = JSON.stringify(data)
  return { path: `${archiveRoot}/${path}`, text, content: null, uncompressedBytes: Buffer.byteLength(text), sha256: null }
}
const serializable = (value: unknown): unknown => JSON.parse(JSON.stringify(value))
const decisionSet = (records: Array<Record<string, unknown>>) => records
  .map((record): Record<string, unknown> => ({ ...record, canonicalGoalIds: [...record.canonicalGoalIds as string[]].sort() }))
  .sort((left, right) => String(left.sourceGoalId).localeCompare(String(right.sourceGoalId)))

try {
  const sp = 'https://skillpilot.de/ns/roundtrip#'
  const xsd = 'http://www.w3.org/2001/XMLSchema#'
  const metadata = {
    contractId: 'fixture-contract', revision: 'contract-v2', placementRevision: 'placement-v3',
    promise: { de: 'Du kannst „Volumen“ erklären.', en: 'Explain volume.', fr: 'Expliquer le volume.' },
    introduction: { de: 'Erste Zeile\nZweite Zeile mit \\ und "Zitat".', en: 'Start here → calculate.' },
  }
  const fixture = {
    landscapeId: 'metadata-regression',
    programUnits: [
      { id: 'unit-legacy', kind: 'year', label: 'Legacy' },
      { id: 'unit-omitted', kind: 'module', label: 'Omitted children', learningUnit: metadata },
      { id: 'unit-empty', kind: 'module', label: 'No children', learningUnit: { ...metadata, requiredChildUnitIds: [] } },
      { id: 'unit-parent', kind: 'module', label: 'Parent', learningUnit: { ...metadata, requiredChildUnitIds: ['unit-omitted', 'unit-empty'] } },
    ],
    goalPlacements: [
      { goalId: 'atom', unitId: 'unit-legacy', relation: 'primary' },
      { goalId: 'atom', unitId: 'unit-omitted', relation: 'secondary', acquisition: false },
      { goalId: 'atom', unitId: 'unit-empty', relation: 'primary', acquisition: true },
    ],
    goals: [{ id: 'atom', title: 'Ordinary goal' }],
  }
  const landscapePath = join(directory, 'landscape.nt')
  const emitLandscape = (value: unknown) => {
    const lines: string[] = []
    writeLandscapeSemantics((line) => lines.push(line), archiveRoot,
      [entry('data/canonical/regression.landscape.json', value)], emptyCounts())
    return lines
  }
  const reconstructLines = async (lines: string[]) => {
    await writeFile(landscapePath, lines.join(''))
    return reconstructLandscape((await readRdfModel(landscapePath)).model)
  }
  const recordSet = (records: unknown[]) => records.map((record) => {
    assertJsonValue(record)
    return compactCanonicalJsonText(record)
  }).sort()
  const fixtureLines = emitLandscape(fixture)
  const reconstructedFixture = await reconstructLines(fixtureLines)
  const declarationsPath = join(directory, 'declarations.nt')
  await writeSemanticDeclarations(declarationsPath, [landscapePath])
  const declarations = await readFile(declarationsPath, 'utf8')
  for (const property of ['learningUnitMetadata', 'acquisitionOwnership']) {
    assert.ok(declarations.includes(`<${sp}${property}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#DatatypeProperty>`),
      `the actual slim declarations classify ${property} as a datatype property`)
  }
  assert.deepEqual(recordSet(reconstructedFixture.programUnits), recordSet(fixture.programUnits),
    'full contract/revision/placement/localized text and omitted/empty/ordered child list values survive RDF alone')
  assert.deepEqual(recordSet(reconstructedFixture.goalPlacements), recordSet(fixture.goalPlacements),
    'true, false and missing ownership stay distinct independently of primary/secondary navigation')
  assert.deepEqual(reconstructedFixture.programUnits.find((unit) => (unit as { id: string }).id === 'unit-omitted'),
    fixture.programUnits[1], 'missing requiredChildUnitIds is never synthesized')

  // Real current source vectors, with no binary asset extraction or package rebuild.
  const canonical = await readJson('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
  assert.equal(canonical.programUnits.length, 35)
  assert.equal(canonical.goalPlacements.length, 351)
  assert.equal(canonical.programUnits.filter((unit: Record<string, unknown>) => Object.hasOwn(unit, 'learningUnit')).length, 21)
  assert.equal(canonical.goalPlacements.filter((placement: Record<string, unknown>) => Object.hasOwn(placement, 'acquisition')).length, 48)
  const actual = await reconstructLines(emitLandscape(canonical))
  assert.deepEqual(recordSet(actual.programUnits), recordSet(canonical.programUnits), 'all 35 real program units match exactly')
  assert.deepEqual(recordSet(actual.goalPlacements), recordSet(canonical.goalPlacements), 'all 351 real goal placements match exactly')

  // Missing extensions remain readable for legacy data, but cannot pass an exact
  // comparison to a current record that explicitly contains those extensions.
  const droppedMetadata = await reconstructLines(fixtureLines.filter((line) => !line.includes(`#learningUnitMetadata>`)))
  assert.notDeepEqual(recordSet(droppedMetadata.programUnits), recordSet(fixture.programUnits))
  const droppedOwnership = await reconstructLines(fixtureLines.filter((line) => !line.includes(`#acquisitionOwnership>`)))
  assert.notDeepEqual(recordSet(droppedOwnership.goalPlacements), recordSet(fixture.goalPlacements))

  const metadataLine = fixtureLines.find((line) => line.includes('#learningUnitMetadata>'))!
  const ownershipLine = fixtureLines.find((line) => line.includes('#acquisitionOwnership>') && line.includes('"false"'))!
  const literalLine = (original: string, lexical: string, datatype = `${xsd}string`) =>
    `${original.match(/^<[^>]+> <[^>]+> /u)![0]}${JSON.stringify(lexical)}^^<${datatype}> .\n`
  const rejectRdf = async (lines: string[], message: string) => {
    await writeFile(landscapePath, lines.join(''))
    const { model } = await readRdfModel(landscapePath)
    assert.throws(() => reconstructLandscape(model), message)
  }
  for (const invalid of [null, [], 'text', 1, {}, { ...metadata, extraMeaning: true },
    { ...metadata, contractId: '' }, { ...metadata, revision: null }, { ...metadata, placementRevision: 3 },
    { ...metadata, promise: {} }, { ...metadata, introduction: { de: 1 } },
    { ...metadata, requiredChildUnitIds: null }, { ...metadata, requiredChildUnitIds: ['a', 'a'] }]) {
    assert.throws(() => emitLandscape({ ...fixture, programUnits: [{ ...fixture.programUnits[1], learningUnit: invalid }] }),
      'export rejects malformed or unknown learning-unit semantics')
    await rejectRdf(fixtureLines.map((line) => line === metadataLine ? literalLine(line, JSON.stringify(invalid)) : line),
      'reverse rejects malformed or unknown learning-unit semantics')
  }
  for (const invalid of [null, 'false', 0, {}]) {
    assert.throws(() => emitLandscape({ ...fixture, goalPlacements: [{ ...fixture.goalPlacements[1], acquisition: invalid }] }),
      /acquisition/u, 'export must not silently omit nonboolean ownership')
  }
  for (const original of [metadataLine, ownershipLine]) {
    await rejectRdf([...fixtureLines, original.replace(/\^\^<[^>]+>/u, '^^<urn:wrong-datatype>')], 'wrong datatype')
    await rejectRdf([...fixtureLines, original.replace(/\^\^<[^>]+>/u, '@en')], 'language tag')
    await rejectRdf([...fixtureLines, original.replace(/".*"\^\^<[^>]+>/u, '<urn:wrong-object>')], 'IRI/literal mixture')
    await rejectRdf(fixtureLines.map((line) => line === original
      ? original.replace(/".*"\^\^<[^>]+>/u, '<urn:wrong-object>') : line), 'IRI instead of literal')
  }
  await rejectRdf([...fixtureLines, ownershipLine.replace('"false"', '"true"')], 'conflicting ownership')
  await rejectRdf(fixtureLines.map((line) => line === ownershipLine ? line.replace('"false"', '"maybe"') : line), 'invalid boolean lexical form')
  await rejectRdf([...fixtureLines, metadataLine.replace('contract-v2', 'contract-v3')], 'conflicting contract revision')
  await rejectRdf(fixtureLines.map((line) => line === metadataLine ? literalLine(line, '{') : line), 'invalid JSON')
  await rejectRdf(fixtureLines.map((line) => line === metadataLine ? literalLine(line, JSON.stringify(metadata)) : line), 'noncanonical JSON')
  const oversizedMetadata = { ...metadata, promise: { de: 'x'.repeat(1048576) } }
  assert.throws(() => emitLandscape({ ...fixture, programUnits: [{ ...fixture.programUnits[1], learningUnit: oversizedMetadata }] }),
    /byte limit/u, 'export enforces the existing registered literal size limit')
  await rejectRdf(fixtureLines.map((line) => line === metadataLine ? literalLine(line, JSON.stringify(oversizedMetadata)) : line), 'oversized metadata')
  const duplicateTriples = await reconstructLines([...fixtureLines, metadataLine, ownershipLine])
  assert.deepEqual(recordSet(duplicateTriples.programUnits), recordSet(fixture.programUnits), 'identical RDF statements have set semantics')
  const numericBoolean = await reconstructLines(fixtureLines.map((line) => line === ownershipLine ? line.replace('"false"', '"0"') : line))
  assert.deepEqual(recordSet(numericBoolean.goalPlacements), recordSet(fixture.goalPlacements), 'standard xsd:boolean false lexical form')

  const registry = await readJson('contracts/curriculum-package/v1.2/profiles/skillpilot-field-semantics-learning-units-v1.registry.json')
  const metadataMapping = registry.entries.find((field: { pathPattern: string }) => field.pathPattern === '/programUnits/*/learningUnit').rdfMapping
  const ownershipMapping = registry.entries.find((field: { pathPattern: string }) => field.pathPattern === '/goalPlacements/*/acquisition').rdfMapping
  assert.equal(metadataMapping.canonicalJsonLiteral.predicate, 'sp:learningUnitMetadata')
  assert.equal(metadataMapping.canonicalJsonLiteral.datatype, 'xsd:string')
  assert.equal(metadataMapping.canonicalJsonLiteral.maxBytes, 1048576)
  assert.equal(ownershipMapping.construction.predicate, 'sp:acquisitionOwnership')
  assert.equal(ownershipMapping.construction.datatype, 'xsd:boolean')
  assert.ok(metadataLine.includes(`<${sp}learningUnitMetadata>`))
  assert.ok(ownershipLine.includes(`<${sp}acquisitionOwnership>`))

  const views = [entry('data/views/regression.view.json', {
    viewId: 'projection-role-regression', landscapeId: 'math', scope: { stage: 'SekII' },
    rootNodes: [{ kind: 'structure', id: 'root', label: 'Prerequisites and targets', children: [
      { kind: 'canonicalSubtree', goalId: 'foundation', projectionRole: 'prerequisiteOnly' },
      { kind: 'goalEntry', goalId: 'foundation-exception', projectionRole: 'target' },
      { kind: 'goalEntry', goalId: 'ordinary-target' },
    ] }],
  }), entry('data/views/de-bb-sekii-gk.view.json', await readJson(
    'curricula/DE/Gymnasium/composition-views/mathematik/de-bb-sekii-gk.view.json',
  ))]
  const reviewPaths = [
    ['DE-BW', 'de-bw_math_upper_secondary_bf17_bounded_source.review.json'],
    ['DE-RP', 'rp_math_upper_secondary_source_extraction_to_canonical_math.review.json'],
  ] as const
  const reviews = await Promise.all(reviewPaths.map(async ([state, filename]) => {
    const data = await readJson(`curricula/DE/Gymnasium/mapping/${state}/upper-secondary/${filename}`)
    return entry(`data/mappings/${state}/upper/${filename}`, data)
  }))
  const lines: string[] = []
  const counts = emptyCounts()
  writeViewSemantics((line) => lines.push(line), archiveRoot, views, counts, { semanticIris: true })
  writeMappingSemantics((line) => lines.push(line), archiveRoot, reviews, counts, { semanticIris: true })
  const rdfPath = join(directory, 'records.nt')
  await writeFile(rdfPath, `${lines.join('\n')}\n`)
  const { model } = await readRdfModel(rdfPath)
  const reconstructedViews = reconstructViews(model)
  for (const view of views) {
    assert.deepEqual(serializable(reconstructedViews[view.path]), JSON.parse(view.text),
      `RDF reconstruction must retain exact explicit and omitted projection roles: ${view.path}`)
  }
  const { reviewDecisions } = reconstructMappings(model)
  for (const review of reviews) {
    const original = JSON.parse(review.text)
    assert.deepEqual(decisionSet(reviewDecisions[review.path] as Array<Record<string, unknown>>),
      decisionSet(original.decisions ?? original.mappings),
      `RDF reconstruction must retain complete BF17/RP review evidence: ${review.path}`)
  }

  // Reused raw IDs belong to separately versioned source artifacts. A mapping
  // can deliberately bind more than one version, but cannot acquire an unbound one.
  const collection = (version: string) => ({
    artifactPath: `data/sources/source-extractions/${version}.json`,
    extractionId: 'same-extraction-id', jurisdiction: 'DE-HE', stage: 'SekII', subject: 'Mathematik',
    sourceLandscapeId: 'same-source-landscape',
    sourceDocuments: [{ key: 'primary', title: `Official ${version}`, url: `https://official.example/${version}`,
      landingUrl: null, role: 'primary', official: true }],
    sourceGoals: [{ sourceGoalId: 'shared-clause', title: `Clause ${version}`, sourceText: `Different text ${version}`,
      sourceTextSha256: createHash('sha256').update(`Different text ${version}`).digest('hex'),
      sourceDocumentKey: 'primary', sourceDocumentUrl: `https://official.example/${version}`,
      phase: null, courseLevel: null, category: null }],
  })
  const versionedSources = [collection('v1'), collection('v2'), collection('unbound')]
  const firstMappingPath = 'data/mappings/DE-HE/upper/versions.review.json'
  const secondMappingPath = 'data/mappings/DE-HE/upper/other.review.json'
  const versionedIndex = {
    schemaVersion: 2, note: 'Version-bound source fixture', sourceGoalReferenceCount: 3,
    sources: versionedSources,
    mappingSourceBindings: [
      { mappingPath: firstMappingPath, sourceArtifactPaths: versionedSources.slice(0, 2).map((source) => source.artifactPath) },
      { mappingPath: secondMappingPath, sourceArtifactPaths: [versionedSources[2].artifactPath] },
    ],
  }
  const sourceEntryPath = 'data/sources/source-goal-references.json'
  const mappingEntries = [firstMappingPath, secondMappingPath].map((path) => entry(path, {
    decisions: [{ sourceGoalId: 'shared-clause', canonicalGoalIds: [], decision: 'mapped' }],
  }))
  const versionedEntries = [entry(sourceEntryPath, versionedIndex), ...mappingEntries,
    ...versionedSources.map((source) => entry(source.artifactPath, { extractionId: source.extractionId }))]
  const versionedLines: string[] = []
  writeSourceSemantics((line) => versionedLines.push(line), archiveRoot, versionedEntries, emptyCounts(),
    { includeSourceIndexSummary: false })
  writeMappingSemantics((line) => versionedLines.push(line), archiveRoot, versionedEntries, emptyCounts(),
    { semanticIris: true })
  const versionedRdfPath = join(directory, 'versioned-sources.nt')
  await writeFile(versionedRdfPath, `${versionedLines.join('\n')}\n`)
  const versionedModel = (await readRdfModel(versionedRdfPath)).model
  const reconstructedSources = reconstructSourceGoalReferences(versionedModel)
  assert.equal(reconstructedSources.schemaVersion, 2)
  assert.equal(reconstructedSources.note, versionedIndex.note)
  assert.equal(reconstructedSources.sourceGoalReferenceCount, 3)
  assert.deepEqual(reconstructedSources.mappingSourceBindings, versionedIndex.mappingSourceBindings)
  assert.deepEqual(reconstructedSources.sources.map((source) => ({
    artifactPath: source.artifactPath, extractionId: source.extractionId,
    documentUrl: source.sourceDocuments[0].url, sourceText: source.sourceGoals[0].sourceText,
    sourceGoalId: source.sourceGoals[0].sourceGoalId,
  })), versionedSources.map((source) => ({
    artifactPath: source.artifactPath, extractionId: source.extractionId,
    documentUrl: source.sourceDocuments[0].url, sourceText: source.sourceGoals[0].sourceText,
    sourceGoalId: source.sourceGoals[0].sourceGoalId,
  })))
  const versionedDecisions = reconstructMappings(versionedModel).reviewDecisions
  for (const mapping of mappingEntries) {
    assert.deepEqual(versionedDecisions[mapping.path], JSON.parse(mapping.text).decisions)
  }
  assert.equal(versionedLines.filter((line) => line.includes('#mapsSourceGoal>')).length, 3,
    'both explicitly bound versions receive their own RDF edge; the third is bound only to its own mapping')
  const droppedBoundVersion = versionedLines.filter((line) => !(
    line.includes('#mapsSourceGoal>') && line.includes(encodeURIComponent(versionedSources[1].artifactPath))
  ))
  await writeFile(versionedRdfPath, `${droppedBoundVersion.join('\n')}\n`)
  const missingVersionModel = (await readRdfModel(versionedRdfPath)).model
  assert.throws(() => reconstructMappings(missingVersionModel), /authored collection binding/u,
    'reusing the raw ID cannot conceal a missing bound source-version edge')
  const unboundVersion = versionedLines.map((line) => line.includes('#mapsSourceGoal>')
    ? line.replace(encodeURIComponent(versionedSources[1].artifactPath), encodeURIComponent(versionedSources[2].artifactPath))
    : line)
  await writeFile(versionedRdfPath, `${unboundVersion.join('\n')}\n`)
  const unboundVersionModel = (await readRdfModel(versionedRdfPath)).model
  assert.throws(() => reconstructMappings(unboundVersionModel), /authored collection binding/u)
  const versionTriple = versionedLines.find((line) => line.includes('#sourceGoalReferenceSchemaVersion>'))!
  await writeFile(versionedRdfPath, `${versionedLines.join('\n')}\n${versionTriple.replace('"2"', '"1"')}\n`)
  const conflictingVersionModel = (await readRdfModel(versionedRdfPath)).model
  assert.throws(() => reconstructSourceGoalReferences(conflictingVersionModel), /Ambiguous RDF source identity/u,
    'contradictory RDF version assertions cannot select a first-value fallback')

  const legacyCollection = Object.fromEntries(Object.entries(versionedSources[0]).filter(([key]) => key !== 'artifactPath'))
  const legacyEntries = [entry(sourceEntryPath, {
    schemaVersion: 1, sourceGoalReferenceCount: 1, sources: [legacyCollection],
  }), mappingEntries[0]]
  const legacyLines: string[] = []
  writeSourceSemantics((line) => legacyLines.push(line), archiveRoot, legacyEntries, emptyCounts(),
    { includeSourceIndexSummary: false })
  writeMappingSemantics((line) => legacyLines.push(line), archiveRoot, legacyEntries, emptyCounts())
  await writeFile(versionedRdfPath, `${legacyLines.join('\n')}\n`)
  const legacyModel = (await readRdfModel(versionedRdfPath)).model
  const reconstructedLegacySources = reconstructSourceGoalReferences(legacyModel)
  assert.equal(reconstructedLegacySources.schemaVersion, 1)
  assert.equal(reconstructedLegacySources.sourceGoalReferenceCount, 1)
  assert.ok(!Object.hasOwn(reconstructedLegacySources.sources[0], 'artifactPath'))
  assert.ok(!Object.hasOwn(reconstructedLegacySources, 'mappingSourceBindings'))
  assert.deepEqual(reconstructMappings(legacyModel).reviewDecisions[mappingEntries[0].path],
    JSON.parse(mappingEntries[0].text).decisions, 'valid globally unique v1 source references remain readable')

  const legacyIndex = { ...versionedIndex, schemaVersion: 1,
    sources: versionedSources.map((source, index) => ({ ...source, extractionId: `legacy-${index}` })) }
  delete (legacyIndex as Record<string, unknown>).mappingSourceBindings
  assert.throws(() => writeSourceSemantics(() => {}, archiveRoot, [entry(sourceEntryPath, legacyIndex)], emptyCounts(),
    { includeSourceIndexSummary: false }), /Duplicate legacy sourceGoalId/u,
  'legacy v1 continues to require globally unique raw source-goal IDs')
  const duplicateInsideCollection = structuredClone(versionedIndex)
  duplicateInsideCollection.sources[0].sourceGoals.push(duplicateInsideCollection.sources[0].sourceGoals[0])
  assert.throws(() => writeSourceSemantics(() => {}, archiveRoot,
    [entry(sourceEntryPath, duplicateInsideCollection), ...versionedEntries.slice(1)], emptyCounts(), { includeSourceIndexSummary: false }),
  /Duplicate sourceGoalId within collection/u, 'v2 still rejects duplicate raw IDs within one versioned source artifact')
  const profilePath = join(directory, 'profile.ttl')
  writeProfile(profilePath, { includeCarrier: false })
  const profile = await readFile(profilePath, 'utf8')
  for (const property of ['projectionRole', 'reviewDecisionId', 'rationale', 'partialSourceEvidenceJson', 'withdrawnMappingsJson',
    'sourceGoalReferenceSchemaVersion', 'sourceGoalReferenceNote', 'sourceArtifactPath', 'mappingPath',
    'learningUnitMetadata', 'acquisitionOwnership']) {
    assert.ok(profile.includes(`sp:${property} a owl:DatatypeProperty`),
      `the slim ontology declares the added semantic property ${property}`)
  }
  assert.ok(profile.includes('rdfs:domain sp:ProgramUnit ; rdfs:range xsd:string'))
  assert.ok(profile.includes('rdfs:domain sp:GoalPlacement ; rdfs:range xsd:boolean'))
  console.log(`MEM/FWU semantic records regression passed: 35 program units, 351 placements, 21 learningUnit and 48 acquisition values, strict metadata/ownership adversaries; ${counts.compositionNodes} view nodes, ${counts.reviewDecisions} review decisions, strict v1 and version-bound v2 sources`)
} finally {
  await rm(directory, { recursive: true, force: true })
}
