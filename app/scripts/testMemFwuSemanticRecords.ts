import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  emptyCounts,
  writeMappingSemantics,
  writeProfile,
  writeViewSemantics,
} from './memFwuRoundtrip'
import { readRdfModel, reconstructMappings, reconstructViews } from './semanticMemFwuRoundtrip'

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
  const profilePath = join(directory, 'profile.ttl')
  writeProfile(profilePath, { includeCarrier: false })
  const profile = await readFile(profilePath, 'utf8')
  for (const property of ['projectionRole', 'reviewDecisionId', 'rationale', 'partialSourceEvidenceJson', 'withdrawnMappingsJson']) {
    assert.ok(profile.includes(`sp:${property} a owl:DatatypeProperty`),
      `the slim ontology declares the added semantic property ${property}`)
  }
  console.log(`MEM/FWU semantic records regression passed: ${counts.compositionNodes} view nodes and ${counts.reviewDecisions} review decisions`)
} finally {
  await rm(directory, { recursive: true, force: true })
}
