import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { createNativeProjectionEvidence, type NativeProjectionEvidence } from './nativeProjectionEvidence'
import { NATIVE_MATH_SOURCE_COVERAGE_LANDSCAPE as MATH, NATIVE_SOURCE_COVERAGE_POLICY, createNativeSourceCoverageScopeAdapter, nativeSourceCoverageTargetSets, nativeTargetReviewedDemandWitness, readNativeSourceCoverageAdapters } from './nativeSourceCoverage'
import { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey, type ReviewedDemandScopeAdapter, type SourceCoverageGoalLike } from './sourceCoverageEvidence'

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
      demandScopeAdapter: createNativeSourceCoverageScopeAdapter(f.evidence, jurisdiction, () => true),
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

const sourceAnchor = (jurisdiction = 'DE-HB') => [{ kind: 'mapping', dimension: 'jurisdiction', value: jurisdiction, source: 'reviewed-original.json' }]
const chainEvidence = (withCommon = false, aTargetInCommon = true) => {
  const demand = { a: [], b: ['a'], c: ['b'] }
  const row = (id: string, targets: string[], context: string[]) => ({
    row: { scopeId: `DE-HB/${id}//`, offeredByNativePlanner: true, declaredByRepositoryGui: true,
      projectionResolved: true, prerequisiteCompilationResolved: true, targetAtomicGoalIds: targets,
      prerequisiteOnlyGoalIds: context.filter(id => !targets.includes(id)),
      atomicPrerequisites: Object.fromEntries(context.map(id => [id, demand[id as keyof typeof demand]])) },
    scope: { landscapeId: MATH, jurisdiction: 'DE-HB', stage: id }, viewIds: ['selected'], inputPaths: ['source.json'],
  })
  return createNativeProjectionEvidence({ landscapeId: MATH, landscapeSourcePath: 'source.json',
    resolverRevision: 'native-personal-curriculum-offers-v1', inputs: { 'source.json': 'a'.repeat(64) },
    runtimeDependencySha256: { 'fixture.jar': 'b'.repeat(64) }, inputDiscovery: [],
    rows: [row('S1', ['a'], ['a', 'b']), row('S2', ['b'], ['a', 'b', 'c']),
      ...(withCommon ? [row('S3', aTargetInCommon ? ['a', 'b'] : ['b'], ['a', 'b', 'c'])] : [])] })
}

function scopedChecker(options: {
  ids?: string[]
  routes?: Array<[string, string]>
  anchor?: string
  anchorJurisdiction?: string
  kinds?: Record<string, string>
  adapter?: ReviewedDemandScopeAdapter
  booleanWitness?: () => boolean
  landscapeId?: string
}) {
  const ids = options.ids ?? ['a', 'b', 'c']
  const routes = options.routes ?? [['a', 'b'], ['b', 'c']]
  const landscapeId = options.landscapeId ?? MATH
  const goals: SourceCoverageGoalLike[] = ids.map(goalId => ({ goalId, goalType: 'atomic',
    evidence: [...routes.filter(([id]) => id === goalId).map(([, consumer]) => ({
      kind: 'requires-closure', dimension: 'jurisdiction', value: 'DE-HB', source: `required by ${consumer}`,
    })), ...(goalId === (options.anchor ?? 'c') ? sourceAnchor(options.anchorJurisdiction) : [])] }))
  const entries = new Map<string, Array<{ requiredByGoalId: string }>>()
  for (const [id, consumer] of routes) {
    const key = sourceCoverageSurrogateKey(landscapeId, id, 'DE-HB')
    entries.set(key, [...(entries.get(key) ?? []), { requiredByGoalId: consumer }])
  }
  const canonical = new Map(ids.map(id => [id, { kind: options.kinds?.[id] ?? 'ordinary' }]))
  return { goals, check: createReviewedRequiresClosureCoverageChecker({ landscapeId, jurisdiction: 'DE-HB', goals,
    canonicalGoalById: canonical, surrogateEntriesByKey: entries, isEligibleCanonicalGoal: g => g?.kind === 'ordinary',
    demandScopeAdapter: options.adapter, hasReviewedDemandWitness: options.booleanWitness }) }
}

test('recursive native surrogate chains retain one common scope; disjoint country-local bridges cannot compose', () => {
  const evidence = chainEvidence()
  const adapter = createNativeSourceCoverageScopeAdapter(evidence, 'DE-HB', () => true)
  assert.deepEqual([...adapter.initialTargetScopeIds('a')], ['DE-HB/S1//'])
  assert.deepEqual([...adapter.reviewedDemandScopeIds('a', 'b', new Set(['DE-HB/S1//', 'DE-HB/S2//']))], ['DE-HB/S1//'])
  assert.deepEqual([...adapter.reviewedDemandScopeIds('b', 'c', new Set(['DE-HB/S1//', 'DE-HB/S2//']))], ['DE-HB/S2//'])
  const result = scopedChecker({ adapter, booleanWitness: () => true })
  assert.equal(result.check.hasCoverageBackedJurisdictionEvidence(result.goals[0]), false,
    'A direct annotation or legacy true boolean cannot replace the empty whole-chain intersection')
})

test('a third scope shared by every bridge succeeds; a context-only root in that scope does not', () => {
  const evidence = chainEvidence(true)
  const adapter = createNativeSourceCoverageScopeAdapter(evidence, 'DE-HB', () => true)
  const first = adapter.reviewedDemandScopeIds('a', 'b', adapter.initialTargetScopeIds('a'))
  assert.deepEqual([...first], ['DE-HB/S1//', 'DE-HB/S3//'])
  assert.deepEqual([...adapter.reviewedDemandScopeIds('b', 'c', first)], ['DE-HB/S3//'])
  const valid = scopedChecker({ adapter })
  assert.equal(valid.check.hasCoverageBackedJurisdictionEvidence(valid.goals[0]), true)
  const contextOnly = scopedChecker({ adapter: createNativeSourceCoverageScopeAdapter(chainEvidence(true, false), 'DE-HB', () => true) })
  assert.equal(contextOnly.check.hasCoverageBackedJurisdictionEvidence(contextOnly.goals[0]), false)
  // Preserve the target requirement on B as prerequisite of C, not only on root A.
  const noBTarget = structuredClone(evidence)
  delete noBTarget.targetAtomicMembership.b
  const noIntermediateTarget = scopedChecker({ adapter: createNativeSourceCoverageScopeAdapter(noBTarget, 'DE-HB', () => true) })
  assert.equal(noIntermediateTarget.check.hasCoverageBackedJurisdictionEvidence(noIntermediateTarget.goals[0]), false)
})

test('all candidate scopes and ordinary BFS alternatives are examined without copying the membership map', () => {
  const f = fixture()
  try {
    const evidence = structuredClone(f.evidence)
    const first = evidence.scopes.findIndex(row => row.scopeId.includes('CrossStage'))
    const later = evidence.scopes.findIndex(row => row.scopeId.includes('SekII'))
    // Exercise the witness helper's per-scope path guard independently of the
    // reader's stricter complete-context validation: first candidate is broken.
    evidence.targetAtomicMembership.a = [first, later].sort((a, b) => a - b)
    evidence.atomicContextMembership.middle = [later]
    const before = JSON.stringify(evidence.atomicContextMembership)
    const adapter = createNativeSourceCoverageScopeAdapter(evidence, 'DE-HB', () => true)
    assert.deepEqual([...adapter.reviewedDemandScopeIds('a', 'consumer', adapter.initialTargetScopeIds('a'))], [evidence.scopes[later].scopeId])
    assert.deepEqual(nativeTargetReviewedDemandWitness(evidence, 'DE-HB', 'consumer', 'a', () => true), ['consumer', 'middle', 'a'])
    assert.equal(JSON.stringify(evidence.atomicContextMembership), before)
    const alternative = structuredClone(evidence)
    alternative.atomicPrerequisites.consumer = ['b025-support', 'middle']
    alternative.atomicPrerequisites['b025-support'] = ['a']
    const eligible = (id: string) => id !== 'b025-support'
    assert.deepEqual(nativeTargetReviewedDemandWitness(alternative, 'DE-HB', 'consumer', 'a', eligible), ['consumer', 'middle', 'a'])
    alternative.atomicPrerequisites.consumer = ['b025-support']
    assert.equal(nativeTargetReviewedDemandWitness(alternative, 'DE-HB', 'consumer', 'a', eligible), null,
      'A Q/K/nonordinary intermediate cannot replace the ordinary path')
  } finally { rmSync(f.repo, { recursive: true, force: true }) }
})

test('failed sibling scopes neither reset the root set nor poison a later branch through the same goal', () => {
  const initialCalls: string[] = [], bridgeCalls: Array<{ prerequisite: string; scopes: string[] }> = []
  const allowed = new Map([['a|b', ['S1']], ['a|d', ['S2']], ['d|b', ['S2']], ['b|c', ['S2']]])
  const adapter: ReviewedDemandScopeAdapter = {
    initialTargetScopeIds: id => { initialCalls.push(id); return new Set(id === 'a' ? ['S1', 'S2'] : ['wrong-reset-scope']) },
    reviewedDemandScopeIds: (a, b, candidates) => {
      bridgeCalls.push({ prerequisite: a, scopes: [...candidates] })
      return new Set((allowed.get(`${a}|${b}`) ?? []).filter(id => candidates.has(id)))
    },
  }
  const result = scopedChecker({ ids: ['a', 'b', 'c', 'd'], routes: [['a', 'b'], ['a', 'd'], ['d', 'b'], ['b', 'c']], adapter })
  assert.equal(result.check.hasCoverageBackedJurisdictionEvidence(result.goals[0]), true)
  assert.deepEqual(initialCalls, ['a'])
  assert.deepEqual(bridgeCalls.filter(call => call.prerequisite === 'b').map(call => call.scopes), [['S1'], ['S2']])
})

test('scope mode rejects cycles, nonordinary bridges, missing reviews/consumers and wrong-country or unoffered evidence', () => {
  const adapter = createNativeSourceCoverageScopeAdapter(chainEvidence(true), 'DE-HB', () => true)
  for (const options of [
    { routes: [['a', 'b']] as Array<[string, string]> },
    { ids: ['a', 'c'] },
    { anchor: 'absent' },
    { anchorJurisdiction: 'DE-NI' },
    ...['assessment', 'taxonomy', 'orientation', 'memory'].map(kind => ({ kinds: { b: kind } })),
  ]) {
    const result = scopedChecker({ adapter, ...options })
    assert.equal(result.check.hasCoverageBackedJurisdictionEvidence(result.goals[0]), false)
  }
  const cycleAdapter: ReviewedDemandScopeAdapter = { initialTargetScopeIds: () => new Set(['S1']), reviewedDemandScopeIds: (_a, _b, scopes) => scopes }
  const cycle = scopedChecker({ routes: [['a', 'b'], ['b', 'a']], anchor: 'absent', adapter: cycleAdapter })
  assert.equal(cycle.check.hasCoverageBackedJurisdictionEvidence(cycle.goals[0]), false)
  const otherCountry = scopedChecker({ adapter: createNativeSourceCoverageScopeAdapter(chainEvidence(true), 'DE-NI', () => true) })
  assert.equal(otherCountry.check.hasCoverageBackedJurisdictionEvidence(otherCountry.goals[0]), false)
  const unoffered = chainEvidence(true)
  unoffered.scopes.forEach(scope => { scope.offeredByNativePlanner = false; scope.declaredByRepositoryGui = false })
  const hidden = scopedChecker({ adapter: createNativeSourceCoverageScopeAdapter(unoffered, 'DE-HB', () => true) })
  assert.equal(hidden.check.hasCoverageBackedJurisdictionEvidence(hidden.goals[0]), false)
})

test('an adapter cannot add an unrelated scope; direct source anchors and legacy annotation chains stay valid', () => {
  const adapter: ReviewedDemandScopeAdapter = { initialTargetScopeIds: () => new Set(['S1']), reviewedDemandScopeIds: () => new Set(['S2']) }
  const impossible = scopedChecker({ adapter, booleanWitness: () => true })
  assert.equal(impossible.check.hasCoverageBackedJurisdictionEvidence(impossible.goals[0]), false)
  const direct = scopedChecker({ anchor: 'a', adapter: { initialTargetScopeIds: () => new Set(), reviewedDemandScopeIds: () => new Set() } })
  assert.equal(direct.check.hasCoverageBackedJurisdictionEvidence(direct.goals[0]), true)
  const legacy = scopedChecker({ landscapeId: 'legacy' })
  assert.equal(legacy.check.hasCoverageBackedJurisdictionEvidence(legacy.goals[0]), true)
})

// Execute the actual construction/required-mode guard from each production
// consumer without importing its report generator or reading a stale live V7.
// Only this bounded factory is evaluated; no full curriculum QA is generated.
function productionCheckerFactory(file: string) {
  const text = readFileSync(resolve(import.meta.dirname, file), 'utf8')
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ESNext, true)
  const calls: ts.CallExpression[] = [], guards: ts.IfStatement[] = []
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'createReviewedRequiresClosureCoverageChecker') calls.push(node)
    if (ts.isIfStatement(node) && node.expression.getText(source).includes('NATIVE_MATH_SOURCE_COVERAGE_LANDSCAPE')) guards.push(node)
    ts.forEachChild(node, visit)
  }
  visit(source)
  assert.equal(calls.length, 1, file)
  assert.equal(guards.length, 1, file)
  assert.ok(guards[0].pos < calls[0].pos, 'The mandatory native guard precedes construction')
  const code = ts.transpileModule(`function build(report, projection, jurisdiction, canonicalGoalById, goalById, native, surrogateEntriesByKey) {
    ${guards[0].getText(source)}
    return ${calls[0].getText(source)};
  }`, { compilerOptions: { target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.None } }).outputText
  type Canonical = Map<string, { kind: string; contains: string[] }>
  type Factory = (report: { landscapeId: string; goals: SourceCoverageGoalLike[] }, projection: { value: string },
    jurisdiction: string, canonicalGoalById: Canonical, goalById: Canonical, native: NativeProjectionEvidence | undefined,
    entries: Map<string, Array<{ requiredByGoalId: string }>>) => ReturnType<typeof createReviewedRequiresClosureCoverageChecker>
  return runInNewContext(`${code}\nbuild`, {
    createReviewedRequiresClosureCoverageChecker, createNativeSourceCoverageScopeAdapter,
    NATIVE_MATH_SOURCE_COVERAGE_LANDSCAPE: MATH,
    isCurriculumSourceCoverageGoal: (goal: { kind?: string } | undefined) => goal?.kind === 'ordinary',
    Error,
  }) as Factory
}

for (const consumer of ['generateCurriculumQualityStatus.ts', 'generateCurriculumSourceCoverageAudit.ts']) {
  test(`${consumer} requires whole-chain native scope mode; no report or legacy fallback can hide the gap`, () => {
    const build = productionCheckerFactory(consumer)
    const fixture = scopedChecker({})
    const canonical = new Map(fixture.goals.map(goal => [goal.goalId, { kind: 'ordinary', contains: [] }]))
    const entries = new Map([['a', 'b'], ['b', 'c']].map(([a, b]) => [sourceCoverageSurrogateKey(MATH, a, 'DE-HB'), [{ requiredByGoalId: b }]]))
    const report = { landscapeId: MATH, goals: fixture.goals }
    const run = (evidence: NativeProjectionEvidence | undefined) => build(report, { value: 'DE-HB' }, 'DE-HB', canonical, canonical, evidence, entries)
    assert.throws(() => run(undefined), /requires the native scope adapter/)
    assert.equal(run(chainEvidence()).hasCoverageBackedJurisdictionEvidence(fixture.goals[0]), false)
    assert.equal(run(chainEvidence(true)).hasCoverageBackedJurisdictionEvidence(fixture.goals[0]), true)
    const legacyEntries = new Map([['a', 'b'], ['b', 'c']].map(([a, b]) => [sourceCoverageSurrogateKey('legacy', a, 'DE-HB'), [{ requiredByGoalId: b }]]))
    assert.equal(build({ ...report, landscapeId: 'legacy' }, { value: 'DE-HB' }, 'DE-HB', canonical, canonical, undefined,
      legacyEntries).hasCoverageBackedJurisdictionEvidence(fixture.goals[0]), true)
  })
}

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
