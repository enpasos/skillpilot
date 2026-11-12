// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import { CURRENT_CANONICAL_CATALOG_PATH, fingerprintCurrentCurriculumDocument, loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { evaluateGraphIntegrity, requireCompleteCurrentCatalog } from './curriculumGraphIntegrity'
import { applyGraphMaturityCeiling, deriveCurriculumMaturity } from './generateCurriculumQualityStatus'
import { withVerificationInputSnapshot } from './lib/verificationInputSnapshot'

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const overviewName = 'DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'
function fixture() {
  mkdirSync(join(repository, 'tmp'), { recursive: true })
  const root = mkdtempSync(join(repository, 'tmp', 'current-catalog-'))
  const catalog = join(root, CURRENT_CANONICAL_CATALOG_PATH)
  mkdirSync(catalog, { recursive: true })
  const overview = { landscapeId: 'ROOT', goals: [{ id: 'root', contains: ['A:a', 'B:b'] }],
    personalizationFlow: { stages: [{ id: 'subject', groups: [{ id: 'subject',
      source: { kind: 'offeredLandscapes', landscapeIds: ['A', 'B'] } }] }] } }
  const a = { landscapeId: 'A', goals: [{ id: 'a', requires: ['B:b'] }] }
  const b = { landscapeId: 'B', goals: [{ id: 'b' }, { id: 'c' }] }
  const save = (file: string, value: unknown) => writeFileSync(join(catalog, file), JSON.stringify(value))
  const manifest = (ids = ['ROOT']) => writeFileSync(join(root, 'curricula/curriculum_manifest.json'),
    JSON.stringify({ curricula: ids.map(id => ({ id })) }))
  const reset = () => {
    rmSync(catalog, { recursive: true, force: true }); mkdirSync(catalog, { recursive: true })
    manifest(); save(overviewName, overview); save('A.json', a); save('B.json', b)
  }
  reset()
  return { root, catalog, overview, a, b, save, manifest, reset,
    close: () => rmSync(root, { recursive: true, force: true }) }
}

test('current declarations admit complete content and legitimate edits without any migration proof', async () => {
  const f = fixture()
  try {
    const proofDirectory = join(f.root, 'curricula/DE/Gymnasium/provenance')
    mkdirSync(proofDirectory, { recursive: true })
    // An unrelated broken historical record must not control the G17 scope.
    writeFileSync(join(proofDirectory, 'prerequisite-reduction-proof-registry.json'), '{broken history')
    const original = await withVerificationInputSnapshot(inputs => loadCurrentCurriculumCatalog(inputs, f.root))
    assert.equal(original.entries.length, 3)
    assert.ok(Object.isFrozen(original.sources) && original.sources.every(Object.isFrozen))
    const changed = { ...f.a, goals: [{ id: 'a', requires: ['B:c'] }] }
    f.save('A.json', changed)
    await withVerificationInputSnapshot(inputs => {
      const current = loadCurrentCurriculumCatalog(inputs, f.root)
      const documents = requireCompleteCurrentCatalog(current.entries, current.sources)
      assert.notDeepEqual(current.sources, original.sources)
      assert.deepEqual(documents.map(document => evaluateGraphIntegrity(documents, document.landscapeId).status),
        ['pass', 'pass', 'pass'])
    })
  } finally { f.close() }
})

test('current inventory rejects missing, extra, duplicate, undeclared or empty roots and broken declarations', async () => {
  const f = fixture()
  try {
    const changes = [
      () => rmSync(join(f.catalog, 'B.json')),
      () => f.save('extra.json', { landscapeId: 'C', goals: [{ id: 'c' }] }),
      () => f.save('B.json', f.a),
      () => f.save('B.json', { landscapeId: 'C', goals: [{ id: 'c' }] }),
      () => f.save('B.json', { landscapeId: 'B', goals: [] }),
      () => f.manifest(['other']),
      () => f.manifest(['ROOT', 'ROOT']),
      () => f.save(overviewName, { ...f.overview, personalizationFlow: {} }),
      () => f.save(overviewName, { ...f.overview, personalizationFlow: { stages: [
        { id: 'subject', groups: [{ id: 'subject', source: { kind: 'offeredLandscapes', landscapeIds: ['A', 'A'] } }] },
      ] } }),
    ]
    for (const change of changes) {
      f.reset(); change()
      await assert.rejects(withVerificationInputSnapshot(inputs => loadCurrentCurriculumCatalog(inputs, f.root)),
        /Current curriculum catalog:/u)
    }
  } finally { f.close() }
})

test('complete current documents expose hidden violations; filtered copies cannot create a milestone pass', async () => {
  const f = fixture()
  try {
    f.save('A.json', { landscapeId: 'A', goals: [
      { id: 'a', requires: ['B:b'] }, { id: 'x', requires: ['y', 'z'] },
      { id: 'y', requires: ['z'] }, { id: 'z' },
    ] })
    await withVerificationInputSnapshot(inputs => {
      const { entries, sources } = loadCurrentCurriculumCatalog(inputs, f.root)
      const complete = requireCompleteCurrentCatalog(entries, sources)
      const graph = evaluateGraphIntegrity(complete, 'A')
      assert.equal(graph.status, 'fail')
      assert.equal(graph.metrics.minimalityFindings, 1)
      const rules = [graph, { id: 'CQR-002', status: 'pass' as const, summary: 'valid types' }]
      const scopes = applyGraphMaturityCeiling(rules, [
        { scopeId: 'otherwise-ready', label: 'Ready', maturity: 'M4', selectedAtomicGoals: 1, rules: [] },
      ])
      assert.equal(scopes[0].maturity, 'M0')
      assert.equal(deriveCurriculumMaturity(rules, scopes), 'M0')
      const truncated = structuredClone(entries)
      truncated.find(entry => entry.landscape.landscapeId === 'A')!.landscape.goals = f.a.goals
      assert.equal(evaluateGraphIntegrity(truncated.map(entry => entry.landscape), 'A').status, 'pass')
      assert.throws(() => requireCompleteCurrentCatalog(truncated, sources), /current document digest differs/u)
      const rebound = truncated.map(({ path, landscape }) => ({
        path, landscapeId: landscape.landscapeId, currentDocumentDigest: fingerprintCurrentCurriculumDocument(landscape),
      }))
      assert.throws(() => requireCompleteCurrentCatalog(truncated, rebound), /registered current catalog inventory/u,
        'A caller cannot certify a truncated document by rebinding its own digest.')
      assert.throws(() => requireCompleteCurrentCatalog(entries.slice(0, 1), sources.slice(0, 1)),
        /registered current catalog inventory/u, 'Coordinated truncation of documents and inventory is rejected.')
      assert.throws(() => requireCompleteCurrentCatalog(entries, structuredClone(sources)),
        /registered current catalog inventory/u, 'Even a structurally identical forged inventory has no capability.')
      const metadata = structuredClone(entries)
      Object.assign(metadata[0].landscape, { title: 'modified after loading' })
      assert.throws(() => requireCompleteCurrentCatalog(metadata, sources), /current document digest differs/u)
    })
  } finally { f.close() }
})

test('catalog bytes, manifest, subject declaration and directory membership stay bound until publication', async () => {
  const f = fixture()
  try {
    for (const change of [
      () => f.save('A.json', { ...f.a, goals: [{ id: 'a', requires: ['B:c'] }] }),
      () => f.manifest(['ROOT', 'new']),
      () => f.save(overviewName, { ...f.overview, title: 'new' }),
      () => f.save('new.json', { landscapeId: 'new', goals: [{ id: 'new' }] }),
      () => rmSync(join(f.catalog, 'B.json')),
    ]) {
      f.reset()
      await assert.rejects(withVerificationInputSnapshot(inputs => {
        loadCurrentCurriculumCatalog(inputs, f.root)
        change()
      }), /Verification inputs changed/u)
    }
  } finally { f.close() }
})

test('the real current catalog covers every committed milestone root without consulting historical inventory', async () => {
  const status = JSON.parse(readFileSync(join(repository, 'docs/qa-ci/status/curriculum-quality-status.json'), 'utf8')) as {
    curricula: { landscapeId: string }[]
  }
  await withVerificationInputSnapshot(inputs => {
    const { entries, sources } = loadCurrentCurriculumCatalog(inputs)
    const current = requireCompleteCurrentCatalog(entries, sources)
    assert.deepEqual(current.map(document => document.landscapeId).sort(),
      status.curricula.map(curriculum => curriculum.landscapeId).sort())
  })
})
