import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import type { NativeReport, NativeRow } from './learningUnits/adapterTypes'
import { createNativeProjectionEvidence, discoverProjectionInputs, nativeReviewedDemandWitness, nativeTargetsByJurisdiction, validateNativeProjectionEvidence } from './nativeProjectionEvidence'
import { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey } from './sourceCoverageEvidence'
import { prepareMathProjectionEvidence } from './learningUnitsMathProjectionEvidence'
import { prepareOfferBindings } from './learningUnitsMathOfferBindings'
const hash = (bytes: string) => createHash('sha256').update(bytes).digest('hex')
const fixture = () => {
  const directory = mkdtempSync(join(tmpdir(), 'native-projection-evidence-'))
  mkdirSync(join(directory, 'views'))
  writeFileSync(join(directory, 'views/fallback.json'), JSON.stringify({ viewId: 'fallback', landscapeId: 'landscape' }))
  writeFileSync(join(directory, 'source.json'), JSON.stringify({ landscapeId: 'landscape', goals: ['real-gap', 'real-upper', 'middle', 'bw-only', 'support'].map(id => ({ id, contains: [] })) }))
  const inputs = Object.fromEntries(['views/fallback.json', 'source.json'].map(path => [path, hash(readFileSync(join(directory, path), 'utf8'))]))
  const row = (scopeId: string, jurisdiction: string, targets: string[], support: string[]) => ({
    row: { scopeId, offeredByNativePlanner: true, declaredByRepositoryGui: true, projectionResolved: true,
      prerequisiteCompilationResolved: true, targetAtomicGoalIds: targets, prerequisiteOnlyGoalIds: support,
      atomicPrerequisites: { 'real-gap': ['middle'], middle: ['real-upper'], 'real-upper': [], 'bw-only': [], support: [] } },
    scope: { landscapeId: 'landscape', jurisdiction, stage: scopeId.includes('SekI/') ? 'SekI' : 'SekII' },
    viewIds: ['fallback'], inputPaths: Object.keys(inputs),
  })
  return { directory, options: { landscapeId: 'landscape', landscapeSourcePath: 'source.json', resolverRevision: 'native-personal-curriculum-offers-v1', inputs,
    runtimeDependencySha256: { 'fixture.jar': 'a'.repeat(64) }, inputDiscovery: [{ directory: 'views', kind: 'compositionView' as const, paths: ['views/fallback.json'] }],
    rows: [row('DE-HB/SekI//', 'DE-HB', ['real-gap'], ['bw-only', 'support']), row('DE-HB/SekII//', 'DE-HB', ['real-upper'], []),
      row('DE-BW/SekI//', 'DE-BW', ['bw-only'], ['real-gap'])] } }
}
test('native country authority unions offered targets, retains genuine evidence gaps and excludes support/default-view leakage', () => {
  const { directory, options } = fixture()
  try {
    const evidence = createNativeProjectionEvidence(options)
    validateNativeProjectionEvidence(evidence, directory, 'landscape')
    const union = nativeTargetsByJurisdiction(evidence)
    assert.deepEqual([...union.get('DE-HB')!].sort(), ['real-gap', 'real-upper'])
    assert.deepEqual([...union.get('DE-BW')!], ['bw-only'])
    assert.equal(union.get('DE-HB')!.has('support'), false)
    assert.equal(discoverProjectionInputs(directory, 'landscape', options.inputDiscovery[0]).length, 1)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
test('stable projection tolerates report measurements, ordering and unit diagnostics, while retaining real demand changes', () => {
  const { directory, options } = fixture()
  try {
    const changed = structuredClone(options)
    changed.rows.reverse()
    changed.rows.forEach(row => Object.assign(row.row, { elapsedNanos: 12, learningUnitReadModel: { status: 'different' } }))
    assert.deepEqual(createNativeProjectionEvidence(options), createNativeProjectionEvidence(changed))
    changed.rows.forEach(row => { row.row.atomicPrerequisites['real-gap'] = [] })
    assert.notDeepEqual(createNativeProjectionEvidence(options), createNativeProjectionEvidence(changed))
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
test('an explicit reviewed consumer keeps its native transitive demand witness after direct-edge reduction; unreviewed paths grant nothing', () => {
  const { directory, options } = fixture()
  try {
    const evidence = createNativeProjectionEvidence(options)
    const ordinary = () => true
    assert.deepEqual(nativeReviewedDemandWitness(evidence, 'DE-HB', 'real-gap', 'real-upper', ordinary), ['real-gap', 'middle', 'real-upper'])
    assert.equal(nativeReviewedDemandWitness(evidence, 'DE-NI', 'real-gap', 'real-upper', ordinary), null)
    assert.equal(nativeReviewedDemandWitness(evidence, 'DE-HB', 'real-gap', 'real-upper', id => id !== 'middle'), null)
    const goal = { goalId: 'real-upper', goalType: 'atomic', evidence: [] }
    const consumer = { goalId: 'real-gap', goalType: 'atomic', evidence: [{ kind: 'mapping', dimension: 'jurisdiction', value: 'DE-HB', source: 'actual-reviewed-source.json' }] }
    const native = (prerequisite: string, reviewedConsumer: string) => nativeReviewedDemandWitness(evidence, 'DE-HB', reviewedConsumer, prerequisite, ordinary) !== null
    const checker = (accepted: boolean) => createReviewedRequiresClosureCoverageChecker({ landscapeId: 'landscape', jurisdiction: 'DE-HB', goals: [goal, consumer],
      canonicalGoalById: new Map([['real-upper', { kind: 'ordinary' }], ['real-gap', { kind: 'ordinary' }]]),
      surrogateEntriesByKey: new Map(accepted ? [[sourceCoverageSurrogateKey('landscape', goal.goalId, 'DE-HB'), [{ requiredByGoalId: consumer.goalId }]]] : []),
      isEligibleCanonicalGoal: canonical => canonical?.kind === 'ordinary', hasReviewedDemandWitness: native })
    assert.equal(checker(true).hasCoverageBackedJurisdictionEvidence(goal), true)
    assert.equal(checker(false).hasCoverageBackedJurisdictionEvidence(goal), false)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
test('native projection cache fails closed for input changes, new view candidates, malformed memberships or failed native rows', () => {
  const { directory, options } = fixture()
  try {
    const evidence = createNativeProjectionEvidence(options)
    const broken = structuredClone(evidence); broken.targetAtomicMembership['bw-only'].push(99)
    assert.throws(() => validateNativeProjectionEvidence(broken, directory, 'landscape'), /Unknown scope index/)
    const unknown = structuredClone(evidence); unknown.targetAtomicMembership['unknown-goal'] = [0]
    assert.throws(() => validateNativeProjectionEvidence(unknown, directory, 'landscape'), /not a known canonical atom/)
    writeFileSync(join(directory, 'views/new.json'), JSON.stringify({ viewId: 'new', landscapeId: 'landscape' }))
    assert.throws(() => validateNativeProjectionEvidence(evidence, directory, 'landscape'), /input set changed/)
    rmSync(join(directory, 'views/new.json'))
    writeFileSync(join(directory, 'views/fallback.json'), '{}')
    assert.throws(() => validateNativeProjectionEvidence(evidence, directory, 'landscape'), /Stale native projection input/)
    const failed = structuredClone(options); failed.rows[0].row.projectionResolved = false
    assert.throws(() => createNativeProjectionEvidence(failed), /Failed native projection/)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
const nativeIndex = process.argv.indexOf('--native')
if (nativeIndex >= 0) test('actual182 stable projection excludes volatile raw diagnostics while old V2 proof truthfully retains its original sensitivity', () => {
  const repo = resolve(import.meta.dirname, '../..')
  const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
  const raw = read(process.argv[nativeIndex + 1]) as NativeReport
  const config = read('app/scripts/config/learning-units/math-current-offer-roots-v2.json')
  const catalog = read('curricula/DE/Gymnasium/learning-units/catalog.json')
  const changed = structuredClone(raw)
  changed.catalogAdmissionMeasurement = { elapsedNanos: 42, heapBytes: 13 }
  changed.actualContractEvaluations = [{ arbitraryDiagnostic: 'different run' }] as unknown as NativeReport['actualContractEvaluations']
  changed.globalRecognitionAtEmptyMastery = ['volatile-diagnostic-only']
  changed.nativeMapperInputSha256['curricula/DE/Gymnasium/learning-units/catalog.json'] = 'a'.repeat(64)
  changed.nativeMapperInputSha256['curricula/DE/Gymnasium/learning-units/offers/proof-only-added.json'] = 'b'.repeat(64)
  changed.scopes.forEach((row) => { row.learningUnitReadModel = { status: 'changed' } as unknown as NativeRow['learningUnitReadModel']; row.nativeOfferContext = { diagnostic: 'changed' } as unknown as NativeRow['nativeOfferContext'] })
  assert.notEqual(prepareOfferBindings(raw, config, catalog).proofBytes, prepareOfferBindings(changed, config, catalog).proofBytes,
    'This demonstrates the old proof boundary; v1/v2 admitted bytes must not be rewritten')
  assert.deepEqual(prepareMathProjectionEvidence(raw), prepareMathProjectionEvidence(changed))
  const semantic = structuredClone(raw); semantic.scopes[0].targetAtomicGoalIds.pop()
  assert.notDeepEqual(prepareMathProjectionEvidence(raw), prepareMathProjectionEvidence(semantic))
  const failed = structuredClone(raw); failed.discoveryFailures = [{ problem: 'missing offered branch' }]
  assert.throws(() => prepareMathProjectionEvidence(failed), /discovery/i)
})
