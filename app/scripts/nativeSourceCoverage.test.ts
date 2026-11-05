import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { createNativeProjectionEvidence } from './nativeProjectionEvidence'
import { NATIVE_MATH_SOURCE_COVERAGE_LANDSCAPE as MATH, NATIVE_SOURCE_COVERAGE_POLICY, nativeSourceCoverageTargetSets, nativeTargetReviewedDemandWitness, readNativeSourceCoverageAdapters } from './nativeSourceCoverage'
import { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey } from './sourceCoverageEvidence'

const hash = (bytes: string) => createHash('sha256').update(bytes).digest('hex')
const fixture = (commonScope = true, supportBecomesTarget = false) => {
  const repo = mkdtempSync(join(tmpdir(), 'native-source-coverage-'))
  const write = (p: string, value: unknown) => { mkdirSync(dirname(join(repo, p)), { recursive: true }); writeFileSync(join(repo, p), JSON.stringify(value)) }
  const ids = ['a', 'consumer', 'middle', 'b025-support', 'outside-old-717', 'raw-only']
  write('source.json', { landscapeId: MATH, goals: ids.map(id => ({ id, contains: [] })) })
  write('views/current.json', { landscapeId: MATH, viewId: 'selected' })
  write('views/unused.json', { landscapeId: MATH, viewId: 'unused', rootNodes: [{ kind: 'goalEntry', goalId: 'raw-only' }] })
  const inputs = Object.fromEntries(['source.json', 'views/current.json', 'views/unused.json'].map(p => [p, hash(readFileSync(join(repo, p), 'utf8'))]))
  const demand = { a: [], consumer: ['middle'], middle: ['a'], 'b025-support': [], 'outside-old-717': [], 'raw-only': [] }
  const row = (stage: string, targets: string[], support: string[], context: string[]) => ({
    row: { scopeId: `DE-HB/${stage}//`, offeredByNativePlanner: true, declaredByRepositoryGui: true,
      projectionResolved: true, prerequisiteCompilationResolved: true, targetAtomicGoalIds: targets, prerequisiteOnlyGoalIds: support,
      atomicPrerequisites: Object.fromEntries(context.map(id => [id, demand[id as keyof typeof demand]])) },
    scope: { landscapeId: MATH, jurisdiction: 'DE-HB', stage }, viewIds: ['selected'], inputPaths: Object.keys(inputs),
  })
  const rows = [row('SekI', ['a'], [], ['a']),
    row('SekII', ['outside-old-717', ...(supportBecomesTarget ? ['b025-support'] : [])],
      ['a', 'consumer', 'middle', ...(supportBecomesTarget ? [] : ['b025-support'])], ids.filter(id => id !== 'raw-only'))]
  if (commonScope) rows.push(row('CrossStage', ['a'], ['consumer', 'middle'], ['a', 'consumer', 'middle']))
  while (rows.length < 182) rows.push(row(`fixture-${rows.length}`, ['a'], [], ['a']))
  const evidence = createNativeProjectionEvidence({ landscapeId: MATH, landscapeSourcePath: 'source.json', resolverRevision: 'native-personal-curriculum-offers-v1', inputs,
    runtimeDependencySha256: { 'fixture.jar': 'a'.repeat(64) }, inputDiscovery: [{ directory: 'views', kind: 'compositionView', paths: ['views/current.json', 'views/unused.json'] }], rows })
  write('projection.json', evidence)
  write(NATIVE_SOURCE_COVERAGE_POLICY, { schemaVersion: 1, requiredLandscapeIds: [MATH], landscapes: { [MATH]: { path: 'projection.json' } } })
  return { repo, evidence, write, ids }
}

test('all offered targets replace the raw-view denominator; support and unselected views do not become targets', () => {
  const f = fixture()
  try {
    const native = readNativeSourceCoverageAdapters(f.repo).get(MATH)!
    const targets = nativeSourceCoverageTargetSets(native)
    assert.deepEqual([...targets.canonicalViewAtomicGoalIds].sort(), ['a', 'outside-old-717'])
    assert.equal(targets.viewAtomicGoalIdsByJurisdiction.get('DE-HB')!.has('b025-support'), false)
    assert.equal(targets.canonicalViewAtomicGoalIds.has('raw-only'), false)
    const changed = fixture(true, true)
    try {
      const newTargets = nativeSourceCoverageTargetSets(readNativeSourceCoverageAdapters(changed.repo).get(MATH)!)
      assert.equal(newTargets.canonicalViewAtomicGoalIds.has('b025-support'), true)
      const goals = changed.ids.map(goalId => ({ goalId, goalType: 'atomic', evidence: [] }))
      const checker = createReviewedRequiresClosureCoverageChecker({ landscapeId: MATH, jurisdiction: 'DE-HB', goals,
        canonicalGoalById: new Map(changed.ids.map(id => [id, {}])), surrogateEntriesByKey: new Map(), isEligibleCanonicalGoal: g => !!g })
      const gaps = goals.filter(g => newTargets.canonicalViewAtomicGoalIds.has(g.goalId) && !checker.hasCoverageBackedJurisdictionEvidence(g))
      assert.ok(gaps.some(g => g.goalId === 'b025-support'), 'A newly targeted unsupported atom must fail')
      assert.ok(gaps.some(g => g.goalId === 'outside-old-717'), 'The previous 717 denominator cannot hide a genuine new target')
    } finally { rmSync(changed.repo, { recursive: true, force: true }) }
  } finally { rmSync(f.repo, { recursive: true, force: true }) }
})

test('an exact reviewed source-backed consumer needs a real full path in the same country scope where A is target', () => {
  const f = fixture()
  const check = (accepted = true, sourceAnchor = true, consumer = 'consumer', jurisdiction = 'DE-HB') => {
    const goals = f.ids.map(goalId => ({ goalId, goalType: 'atomic', evidence: goalId === 'consumer' && sourceAnchor
      ? [{ kind: 'mapping', dimension: 'jurisdiction', value: 'DE-HB', source: 'reviewed-original-source.json' }] : [] }))
    return createReviewedRequiresClosureCoverageChecker({ landscapeId: MATH, jurisdiction, goals,
      canonicalGoalById: new Map(f.ids.map(id => [id, {}])), isEligibleCanonicalGoal: g => !!g,
      surrogateEntriesByKey: new Map(accepted ? [[sourceCoverageSurrogateKey(MATH, 'a', 'DE-HB'), [{ requiredByGoalId: consumer }]]] : []),
      hasReviewedDemandWitness: (a, c) => nativeTargetReviewedDemandWitness(f.evidence, jurisdiction, c, a, () => true) !== null,
    }).hasCoverageBackedJurisdictionEvidence(goals[0])
  }
  try {
    assert.deepEqual(nativeTargetReviewedDemandWitness(f.evidence, 'DE-HB', 'consumer', 'a', () => true), ['consumer', 'middle', 'a'])
    assert.equal(check(), true)
    assert.equal(check(false), false, 'No review decision')
    assert.equal(check(true, false), false, 'No source-backed consumer')
    assert.equal(check(true, true, 'outside-old-717'), false, 'Another consumer cannot borrow the reviewed route')
    assert.equal(check(true, true, 'consumer', 'DE-NI'), false, 'Another country cannot borrow the route')
    const broken = structuredClone(f.evidence); broken.atomicPrerequisites.middle = []
    assert.equal(nativeTargetReviewedDemandWitness(broken, 'DE-HB', 'consumer', 'a', () => true), null)
    const independent = fixture(false)
    try { assert.equal(nativeTargetReviewedDemandWitness(independent.evidence, 'DE-HB', 'consumer', 'a', () => true), null,
      'A target in one scope and a support-only route in another do not compose a witness') }
    finally { rmSync(independent.repo, { recursive: true, force: true }) }
    const direct = createReviewedRequiresClosureCoverageChecker({ landscapeId: MATH, jurisdiction: 'DE-HB',
      goals: [{ goalId: 'a', goalType: 'atomic', evidence: [{ kind: 'requires-closure', dimension: 'jurisdiction', value: 'DE-HB', source: 'required by consumer' }] },
        { goalId: 'consumer', goalType: 'atomic', evidence: [{ kind: 'mapping', dimension: 'jurisdiction', value: 'DE-HB', source: 'original-source' }] }],
      canonicalGoalById: new Map([['a', {}], ['consumer', {}]]), isEligibleCanonicalGoal: g => !!g,
      surrogateEntriesByKey: new Map([[sourceCoverageSurrogateKey(MATH, 'a', 'DE-HB'), [{ requiredByGoalId: 'consumer' }]]]),
      hasReviewedDemandWitness: () => false })
    assert.equal(direct.hasCoverageBackedJurisdictionEvidence({ goalId: 'a', goalType: 'atomic', evidence: [] }), false,
      'A compiler direct-edge annotation cannot override the mandatory actual-scope witness')
  } finally { rmSync(f.repo, { recursive: true, force: true }) }
})

test('missing/stale native authority and changed candidate inputs fail closed', () => {
  const f = fixture()
  try {
    f.write(NATIVE_SOURCE_COVERAGE_POLICY, { schemaVersion: 1, requiredLandscapeIds: [MATH], landscapes: {} })
    assert.throws(() => readNativeSourceCoverageAdapters(f.repo), /Required native projection adapter missing/)
    f.write(NATIVE_SOURCE_COVERAGE_POLICY, { schemaVersion: 1, requiredLandscapeIds: [], landscapes: {} })
    assert.throws(() => readNativeSourceCoverageAdapters(f.repo), /Mathematics native authority is required/)
    f.write(NATIVE_SOURCE_COVERAGE_POLICY, { schemaVersion: 1, requiredLandscapeIds: [MATH], landscapes: { [MATH]: { path: 'projection.json' } } })
    const originalBytes = readFileSync(join(f.repo, 'projection.json'), 'utf8')
    f.write(NATIVE_SOURCE_COVERAGE_POLICY, { schemaVersion: 1, requiredLandscapeIds: [MATH], landscapes: { [MATH]: { path: 'projection.json', sha256: hash(originalBytes) } } })
    const missingPin = structuredClone(f.evidence); delete missingPin.inputs['views/unused.json']
    f.write('projection.json', missingPin)
    assert.throws(() => readNativeSourceCoverageAdapters(f.repo), /Native projection file hash changed/)
    writeFileSync(join(f.repo, 'projection.json'), originalBytes)
    f.write('views/current.json', { landscapeId: MATH, viewId: 'changed' })
    assert.throws(() => readNativeSourceCoverageAdapters(f.repo), /Stale native projection input/)
    f.write('views/current.json', { landscapeId: MATH, viewId: 'selected' })
    f.write('views/new.json', { landscapeId: MATH, viewId: 'new' })
    assert.throws(() => readNativeSourceCoverageAdapters(f.repo), /input set changed/)
  } finally { rmSync(f.repo, { recursive: true, force: true }) }
})
