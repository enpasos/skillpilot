// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { evaluateGraphIntegrity, requireCompleteCurrentCatalog, type CurrentCatalogEntry } from './curriculumGraphIntegrity'
import { auditTransitiveMinimality, type AuditLandscape } from './auditTransitiveMinimality'
import { applyGraphMaturityCeiling, deriveCurriculumMaturity } from './generateCurriculumQualityStatus'
import { CURRENT_CANONICAL_CATALOG_PATH, loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { liveVerificationInputs } from './lib/verificationInputSnapshot'
import {
  fingerprintPrerequisiteReductionDocument as digest, loadVerifiedPrerequisiteReductionContext,
  PREREQUISITE_REDUCTION_CONTRACT, verifiedPrerequisiteReductionCatalogSources, verifiedPrerequisiteReductionSummary,
  type VerifiedPrerequisiteReductionContext,
} from './prerequisiteReductionProof'

const catalog = (goals: AuditLandscape['goals']): AuditLandscape[] => [{ landscapeId: 'L', goals }]

// The same catalog admission, CQR rule, scope ceiling and subject maturity
// functions called by the ordinary status producer; no alternative auditor.
function producerGraphRows(loaded: CurrentCatalogEntry[], expected: Parameters<typeof requireCompleteCurrentCatalog>[1]) {
  const current = requireCompleteCurrentCatalog(loaded, expected)
  return current.map(({ landscapeId }) => {
    const graph = evaluateGraphIntegrity(current, landscapeId)
    const rules = [graph, { id: 'CQR-002', status: 'pass' as const, summary: 'Fixture types agree.' }]
    const scopes = applyGraphMaturityCeiling(rules, ['first', 'second'].map(scopeId => ({
      scopeId, label: scopeId, maturity: 'M4' as const, selectedAtomicGoals: 1, rules: [],
    })))
    return { graph, scopes, maturity: deriveCurriculumMaturity(rules, scopes) }
  })
}

function withFixtureCatalog<T>(current: AuditLandscape[], work: (
  loaded: CurrentCatalogEntry[], sources: ReturnType<typeof loadCurrentCurriculumCatalog>['sources'],
) => T): T {
  const scratch = resolve(dirname(fileURLToPath(import.meta.url)), '../../tmp')
  mkdirSync(scratch, { recursive: true })
  const directory = mkdtempSync(resolve(scratch, 'current-graph-integrity-'))
  try {
    const canonical = resolve(directory, CURRENT_CANONICAL_CATALOG_PATH)
    mkdirSync(canonical, { recursive: true })
    writeFileSync(resolve(directory, 'curricula/curriculum_manifest.json'), JSON.stringify({ curricula: [{ id: 'ROOT' }] }))
    writeFileSync(resolve(canonical, 'DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'), JSON.stringify({
      landscapeId: 'ROOT', goals: [{ id: 'overview' }], personalizationFlow: { stages: [{ id: 'subject', groups: [{
        id: 'subject', source: { kind: 'offeredLandscapes', landscapeIds: current.map(landscape => landscape.landscapeId) },
      }] }] },
    }))
    for (const landscape of current) writeFileSync(resolve(canonical, `${landscape.landscapeId}.json`), JSON.stringify(landscape))
    const { entries, sources } = loadCurrentCurriculumCatalog(liveVerificationInputs, directory)
    const order = [...current.map(landscape => landscape.landscapeId), 'ROOT']
    entries.sort((a, b) => order.indexOf(a.landscape.landscapeId) - order.indexOf(b.landscape.landscapeId))
    return work(entries, sources)
  } finally { rmSync(directory, { recursive: true, force: true }) }
}
const assertGraphFailureCapsEveryScope = (row: ReturnType<typeof producerGraphRows>[number]) => {
  assert.equal(row.graph.status, 'fail')
  assert.equal(row.maturity, 'M0')
  assert.deepEqual(row.scopes.map(scope => scope.maturity), ['M0', 'M0'])
}

test('producer graph path: redundant atomic requires fail and cap every scope at M0', () => {
  withFixtureCatalog(catalog([{ id: 'q', requires: ['p', 'r'] }, { id: 'p', requires: ['r'] }, { id: 'r' }]), (loaded, sources) => {
    const [row] = producerGraphRows(loaded, sources)
    assertGraphFailureCapsEveryScope(row)
    assert.equal(row.graph.metrics.minimalityFindings, 1)
  })
})

test('producer graph path: minimal cluster source or target requires fail and cap every scope at M0', () => {
  for (const goals of [
    [{ id: 'c', contains: ['a'], requires: ['r'] }, { id: 'a' }, { id: 'r' }],
    [{ id: 'q', requires: ['c'] }, { id: 'c', contains: ['a'] }, { id: 'a' }],
  ]) {
    withFixtureCatalog(catalog(goals), (loaded, sources) => {
      const [row] = producerGraphRows(loaded, sources)
      assertGraphFailureCapsEveryScope(row)
      assert.equal(row.graph.metrics.minimalityFindings, 0)
      assert.equal(row.graph.metrics.atomicNormalFormFindings, 1)
    })
  }
})

test('producer graph path: missing reference or effective foreign ancestor cycle fails and caps every scope at M0', () => {
  for (const current of [
    catalog([{ id: 'q', requires: ['Missing:x'] }]),
    [{ landscapeId: 'L', goals: [{ id: 'q', requires: ['F:b'] }] },
      { landscapeId: 'F', goals: [{ id: 'parent', contains: ['b'], requires: ['L:q'] }, { id: 'b' }] }],
  ]) {
    withFixtureCatalog(current, (loaded, sources) => {
      const [row] = producerGraphRows(loaded, sources)
      assertGraphFailureCapsEveryScope(row)
      assert.equal(row.graph.metrics.invalidInputs, 1)
      assert.match(row.graph.details![0], /Unknown reference Missing:x|effective requires cycle/)
    })
  }
})

test('producer graph path: missing or duplicate catalog aborts before status rows', () => {
  withFixtureCatalog([{ landscapeId: 'A', goals: [{ id: 'a' }] }, { landscapeId: 'B', goals: [{ id: 'b' }] }], (loaded, expected) => {
    for (const broken of [loaded.slice(0, 1), [loaded[0], loaded[0]]]) {
      let rows: ReturnType<typeof producerGraphRows> = []
      assert.throws(() => { rows = producerGraphRows(broken, expected) }, /Current curriculum catalog:/)
      assert.deepEqual(rows, [])
    }
  })
})

test('producer scope ceiling preserves passing scopes and caps non-pass or absent graph rules', () => {
  const scopes = [{ scopeId: 'one', label: 'one', maturity: 'M4' as const, selectedAtomicGoals: 1, rules: [] }]
  const pass = { id: 'CQR-001', status: 'pass' as const, summary: 'pass' }
  const types = { ...pass, id: 'CQR-002' }
  assert.deepEqual(applyGraphMaturityCeiling([pass, types], scopes), scopes)
  for (const status of ['warn', 'fail', 'not_configured'] as const) {
    for (const rules of [[{ ...pass, status }, types], [pass, { ...types, status }]])
      assert.equal(applyGraphMaturityCeiling(rules, scopes)[0].maturity, 'M0')
  }
  assert.equal(applyGraphMaturityCeiling([], scopes)[0].maturity, 'M0')
})

test('the exported CQR-001 adapter rejects current redundancy with qualified witnesses', () => {
  const current = catalog([{ id: 'q', requires: ['p', 'r'] }, { id: 'p', requires: ['r'] }, { id: 'r' }])
  const rule = evaluateGraphIntegrity(current, 'L')
  assert.equal(rule.id, 'CQR-001'); assert.equal(rule.status, 'fail')
  assert.equal(rule.metrics.minimalityFindings, 1); assert.equal(rule.metrics.witnessEdges, 2)
  assert.ok(rule.details?.some((detail) => detail.includes('L:q -> L:r') && detail.includes('L:q -> L:p -> L:r')))
  assert.deepEqual(auditTransitiveMinimality(current, ['L']).findings[0].witness, ['L:q', 'L:p', 'L:r'])
})

test('the adapter uses the existing foreign inheritance closure and authored origins', () => {
  const current: AuditLandscape[] = [
    { landscapeId: 'L', goals: [{ id: 'q', requires: ['F:b', 'F:r'] }] },
    { landscapeId: 'F', goals: [
      { id: 'parent', contains: ['b', 'unrelated'], requires: ['r'] }, { id: 'b' }, { id: 'r' },
      { id: 'unrelated', type: 'cluster' }, // outside the selected closure
    ] },
  ]
  const rule = evaluateGraphIntegrity(current, 'L')
  assert.equal(rule.status, 'fail'); assert.equal(rule.metrics.goals, 4)
  assert.equal(rule.metrics.minimalityFindings, 1); assert.equal(rule.metrics.atomicNormalFormFindings, 1)
  assert.equal(rule.metrics.explicitTypeMismatches, 0)
  assert.ok(rule.details?.some((detail) => detail.includes('L:q -> F:b -> F:r') && detail.includes('F:parent -> F:r')))
})

test('unknown qualified references and ambiguous plain fallbacks fail closed in CQR-001', () => {
  for (const reference of ['Missing:x', 'shared']) {
    const current: AuditLandscape[] = [
      { landscapeId: 'L', goals: [{ id: 'q', requires: [reference] }] },
      { landscapeId: 'F', goals: [{ id: 'shared' }] }, { landscapeId: 'G', goals: [{ id: 'shared' }] },
    ]
    const rule = evaluateGraphIntegrity(current, 'L')
    assert.equal(rule.status, 'fail'); assert.equal(rule.metrics.invalidInputs, 1)
    assert.match(rule.details![0], /Unknown reference Missing:x at L:q|Ambiguous reference shared at L:q/)
  }
})

test('non-leaf requires endpoints fail even when every edge is transitively minimal', () => {
  const current = catalog([{ id: 'q', requires: ['c'] }, { id: 'c', contains: ['a'], requires: ['r'] }, { id: 'a' }, { id: 'r' }])
  const audit = auditTransitiveMinimality(current, ['L'])
  assert.equal(audit.findings.length, 0)
  assert.deepEqual(audit.atomicNormalFormFindings, [
    { source: 'L:c', prerequisite: 'L:r', sourceAtomic: false, prerequisiteAtomic: true },
    { source: 'L:q', prerequisite: 'L:c', sourceAtomic: true, prerequisiteAtomic: false },
  ])
  const rule = evaluateGraphIntegrity(current, 'L')
  assert.equal(rule.status, 'fail'); assert.equal(rule.metrics.atomicNormalFormFindings, 2)
})

test('explicit type conflicts fail for selected local and foreign nodes; omitted type stays valid', () => {
  assert.equal(evaluateGraphIntegrity(catalog([{ id: 'q', requires: ['r'] }, { id: 'r' }]), 'L').status, 'pass')
  for (const current of [
    catalog([{ id: 'q', type: 'cluster' }]),
    [{ landscapeId: 'L', goals: [{ id: 'q', requires: ['F:r'] }] },
      { landscapeId: 'F', goals: [{ id: 'r', type: 'cluster' }] }],
    catalog([{ id: 'c', type: 'atomic', contains: ['a'] }, { id: 'a' }]),
  ] satisfies AuditLandscape[][]) {
    const rule = evaluateGraphIntegrity(current, 'L')
    assert.equal(rule.status, 'fail'); assert.equal(rule.metrics.explicitTypeMismatches, 1)
    assert.match(rule.details!.at(-1)!, /Explicit type mismatch (L:q|F:r|L:c)/)
  }
})

test('each declared root receives its current result and cycles fail CQR-001', () => {
  const current: AuditLandscape[] = [
    { landscapeId: 'A', goals: [{ id: 'a' }] },
    { landscapeId: 'B', goals: [{ id: 'q', requires: ['r'] }, { id: 'r', requires: ['q'] }] },
  ]
  assert.deepEqual(current.map(({ landscapeId }) => evaluateGraphIntegrity(current, landscapeId).status), ['pass', 'fail'])
  assert.match(evaluateGraphIntegrity(current, 'B').details![0], /effective requires cycle: B:q -> B:r -> B:q/)
})

test('the exact producer coverage seam aborts missing, duplicate, empty and additional roots', () => {
  withFixtureCatalog(['A', 'B'].map(landscapeId => ({ landscapeId, goals: [{ id: 'a' }] })), (loaded, expected) => {
    assert.deepEqual(requireCompleteCurrentCatalog(loaded, expected).map(({ landscapeId }) => landscapeId), ['A', 'B', 'ROOT'])
    assert.throws(() => requireCompleteCurrentCatalog(loaded, undefined), /registered current catalog inventory is required/)
    const cases: CurrentCatalogEntry[][] = [
      loaded.slice(0, 1), [loaded[0], loaded[0], loaded[2]],
      [loaded[0], { ...loaded[1], landscape: { landscapeId: 'B', goals: [] } }, loaded[2]],
      [...loaded, { path: 'canonical/C.json', landscape: { landscapeId: 'C', goals: [{ id: 'a' }] } }],
      [loaded[0], { path: 'canonical/C.json', landscape: { landscapeId: 'C', goals: [{ id: 'a' }] } }, loaded[2]],
      [loaded[0], { ...loaded[1], landscape: { landscapeId: 'A', goals: [{ id: 'b' }] } }, loaded[2]],
    ]
    for (const changed of cases) assert.throws(() => requireCompleteCurrentCatalog(changed, expected), /Current curriculum catalog:/)
    assert.throws(() => requireCompleteCurrentCatalog(loaded, [expected[0], expected[0]]), /registered current catalog inventory/)
  })
})

test('a genuine historical context exposes immutable inventory but cannot mask a current CQR finding', async () => {
  const scratch = process.env.G17_GRAPH_FIXTURE_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../node_modules/.tmp')
  mkdirSync(scratch, { recursive: true })
  const directory = mkdtempSync(resolve(scratch, 'graph-integrity-'))
  try {
    mkdirSync(resolve(directory, 'canonical'))
    const atom = (id: string, requires: string[] = []) => ({ id, type: 'atomic', contains: [], requires })
    const before = { landscapeId: 'L', goals: [atom('q', ['p', 'r', 's']), atom('p', ['s']), atom('s', ['r']), atom('r')] }
    const current = structuredClone(before); current.goals[0].requires = ['p', 'r']
    const registry = {
      schemaVersion: 1, proofContract: PREREQUISITE_REDUCTION_CONTRACT, auditScope: 'origin-source-landscape-closure',
      catalogSources: [{ path: 'canonical/L.json', landscapeId: 'L', baselineDocumentDigest: digest(before), currentDocumentDigest: digest(current) }],
      originalRequires: [{ source: 'L:q', requires: before.goals[0].requires }],
      removals: [{ source: 'L:q', prerequisite: 'L:s', witness: ['L:q', 'L:p', 'L:s'] }],
    }
    writeFileSync(resolve(directory, 'canonical/L.json'), JSON.stringify(current))
    writeFileSync(resolve(directory, 'proof.json'), JSON.stringify(registry))
    const context = await loadVerifiedPrerequisiteReductionContext({ repositoryRoot: directory, catalogPath: 'canonical', registryPath: 'proof.json' })
    assert.ok(context)
    const summary = verifiedPrerequisiteReductionSummary(context)!
    assert.deepEqual(Object.keys(summary).sort(), ['affectedGoalIds', 'auditScope', 'mode', 'proofContract', 'registryDigest', 'registryPath'])
    assert.deepEqual(summary.affectedGoalIds, ['L:q'])
    const sources = verifiedPrerequisiteReductionCatalogSources(context)!
    assert.deepEqual(sources, [{ path: 'canonical/L.json', landscapeId: 'L', currentDocumentDigest: digest(current) }])
    assert.ok(Object.isFrozen(sources) && Object.isFrozen(sources[0]))
    assert.equal(Reflect.set(sources[0], 'landscapeId', 'forged'), false)
    assert.equal(Reflect.set(sources[0], 'currentDocumentDigest', digest(before)), false)
    assert.equal(verifiedPrerequisiteReductionCatalogSources(undefined), undefined)
    assert.throws(() => verifiedPrerequisiteReductionCatalogSources({} as VerifiedPrerequisiteReductionContext), /forged context/)
    assert.throws(() => requireCompleteCurrentCatalog([{ path: 'canonical/L.json', landscape: current }], sources),
      /registered current catalog inventory/u, 'Historical proof inventory cannot authorize the current milestone scope.')
    withFixtureCatalog([current], (loaded, currentSources) => {
      const catalog = requireCompleteCurrentCatalog(loaded, currentSources)
      const rule = evaluateGraphIntegrity(catalog, 'L')
      assert.equal(rule.status, 'fail'); assert.equal(rule.metrics.minimalityFindings, 1)
      assert.ok(rule.details?.some((detail) => detail.includes('L:q -> L:p -> L:s -> L:r')))
    })
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('a genuine full-document binding rejects a same-path same-owner partial document before status rows', async (t) => {
  const scratch = process.env.G17_GRAPH_FIXTURE_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), '../node_modules/.tmp')
  mkdirSync(scratch, { recursive: true })
  const directory = mkdtempSync(resolve(scratch, 'full-document-binding-'))
  try {
    mkdirSync(resolve(directory, 'canonical'))
    const atom = (id: string, requires: string[] = []) => ({ id, type: 'atomic', contains: [], requires })
    const before = { landscapeId: 'L', goals: [
      atom('q', ['p', 'r']), atom('p', ['r']), atom('r'), atom('a', ['b', 'c']), atom('b', ['c']), atom('c'),
    ] }
    const current = structuredClone(before); current.goals[0].requires = ['p']
    const registry = {
      schemaVersion: 1, proofContract: PREREQUISITE_REDUCTION_CONTRACT, auditScope: 'origin-source-landscape-closure',
      catalogSources: [{ path: 'canonical/L.json', landscapeId: 'L', baselineDocumentDigest: digest(before), currentDocumentDigest: digest(current) }],
      originalRequires: [{ source: 'L:q', requires: before.goals[0].requires }],
      removals: [{ source: 'L:q', prerequisite: 'L:r', witness: ['L:q', 'L:p', 'L:r'] }],
    }
    const file = resolve(directory, 'canonical/L.json'), currentBytes = JSON.stringify(current)
    writeFileSync(file, currentBytes)
    writeFileSync(resolve(directory, 'proof.json'), JSON.stringify(registry))
    const context = await loadVerifiedPrerequisiteReductionContext({ repositoryRoot: directory, catalogPath: 'canonical', registryPath: 'proof.json' })
    assert.ok(context)
    const historicalSources = verifiedPrerequisiteReductionCatalogSources(context)!
    const full = JSON.parse(readFileSync(file, 'utf8')) as typeof current
    assert.equal(historicalSources[0].currentDocumentDigest, digest(full))
    assert.notEqual(historicalSources[0].currentDocumentDigest, digest(before), 'metadata must bind CURRENT, not historical baseline')
    withFixtureCatalog([full], (entries, sources) => {
      const currentSource = sources.find(source => source.landscapeId === 'L')!
      assert.equal(currentSource.currentDocumentDigest, digest(full))
      let statusRows = 0
      const producerRows = (loaded: CurrentCatalogEntry[]) => {
        const currentCatalog = requireCompleteCurrentCatalog(loaded, sources)
        return currentCatalog.map(({ landscapeId }) => {
          statusRows++
          return evaluateGraphIntegrity(currentCatalog, landscapeId)
        })
      }
      const fullRows = producerRows(entries)
      assert.equal(statusRows, 2)
      assert.equal(fullRows[0].status, 'fail'); assert.equal(fullRows[0].metrics.minimalityFindings, 1)
      assert.ok(fullRows[0].details?.some(detail => detail.includes('L:a -> L:c') && detail.includes('L:a -> L:b -> L:c')))
      const partial = structuredClone(full); partial.goals = partial.goals.filter(goal => ['q', 'p', 'r'].includes(goal.id))
      assert.equal(evaluateGraphIntegrity([partial], 'L').status, 'pass', 'the truncated graph reproduces the former false-green condition')
      assert.notEqual(digest(partial), currentSource.currentDocumentDigest)
      statusRows = 0
      assert.throws(() => producerRows([{ ...entries[0], landscape: partial }, entries[1]]),
        /Current curriculum catalog: current document digest differs: .*\/L\.json/u)
      assert.equal(statusRows, 0, 'a mismatched full document must abort before producing any status row')
      assert.equal(readFileSync(file, 'utf8'), currentBytes, 'the genuinely verified full fixture remains unchanged')
      t.diagnostic(JSON.stringify({ genuineContextVerified: true, fullControlStatus: fullRows[0].status,
        fullGoalCount: full.goals.length, partialGoalCount: partial.goals.length,
        fullCurrentDigest: currentSource.currentDocumentDigest, partialDigest: digest(partial),
        partialRejectedBeforeRows: true, emittedPartialRows: statusRows }))
    })
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
