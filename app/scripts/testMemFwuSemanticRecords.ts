import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  emptyCounts,
  writeMappingSemantics,
  writeProfile,
  writeSourceSemantics,
  writeViewSemantics,
} from './memFwuRoundtrip'
import { readRdfModel, reconstructMappings, reconstructSourceGoalReferences, reconstructViews } from './semanticMemFwuRoundtrip'

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
    'sourceGoalReferenceSchemaVersion', 'sourceGoalReferenceNote', 'sourceArtifactPath', 'mappingPath']) {
    assert.ok(profile.includes(`sp:${property} a owl:DatatypeProperty`),
      `the slim ontology declares the added semantic property ${property}`)
  }
  console.log(`MEM/FWU semantic records regression passed: ${counts.compositionNodes} view nodes, ${counts.reviewDecisions} review decisions, strict v1 and version-bound v2 sources`)
} finally {
  await rm(directory, { recursive: true, force: true })
}
