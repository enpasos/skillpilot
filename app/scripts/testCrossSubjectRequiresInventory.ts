import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { assertFreshRequiresInventory, buildRequiresInventory, fileFingerprint, type InventoryConfig, type RequiresDecision } from './lib/crossSubjectRequiresInventory'

const temporaryRoot = resolve(process.cwd(), '../tmp/cross-subject-requires')
mkdirSync(temporaryRoot, { recursive: true })
const repoRoot = mkdtempSync(join(temporaryRoot, 'inventory-fixture-'))
const write = (path: string, value: unknown) => {
  mkdirSync(resolve(repoRoot, path, '..'), { recursive: true })
  writeFileSync(join(repoRoot, path), JSON.stringify(value))
}
try {
  write('curricula/curriculum_manifest.json', { curricula: [{ id: 'root', title: 'Root' }] })
  write('curricula/math.json', { landscapeId: 'math', title: 'Mathematics', subject: 'Mathematik', goals: [
    { id: 'm', title: 'Mathematical skill', contains: [], requires: [], semanticKind: 'curricularAtomic' },
  ] })
  write('curricula/physics.json', { landscapeId: 'physics', title: 'Physics', subject: 'Physik', goals: [
    { id: 'root', contains: ['p'], requires: ['m'] },
    { id: 'p', title: 'Physical skill', contains: [], requires: [], semanticKind: 'curricularAtomic', applicability: { jurisdiction: ['DE-HE'] } },
    { id: 'orientation', contains: [], requires: [], semanticKind: 'orientation' },
  ] })
  write('curricula/input/snapshot.json', { landscapeId: 'historic', goals: [{ id: 'historic' }] })
  write('curricula/module-copy.json', { landscapeId: 'copy', title: 'Module copy', goals: [
    { id: 'm', title: 'Conflicting mathematical skill', contains: [], requires: [] },
  ] })
  const config: InventoryConfig = { schemaVersion: 1, inventoryId: 'fixture', excludedDirectories: ['input', 'archive', 'quality'],
    families: [{ familyId: 'family', manifestRootIds: ['root'], paths: ['curricula/math.json', 'curricula/physics.json'], reviewSelection: 'curricularAtomic' }] }
  const initial = buildRequiresInventory(repoRoot, config)
  const inventorySnapshot = join(repoRoot, 'curricula/quality/inventory.json')
  write('curricula/quality/inventory.json', initial)
  assert.equal(assertFreshRequiresInventory(initial, inventorySnapshot), fileFingerprint(inventorySnapshot))
  assert.equal(initial.activeLandscapeFiles, 3)
  assert.equal(initial.families[0].counts.curricularAtomic, 2)
  assert.equal(initial.families[0].counts.reviewRequired, 2)
  assert.equal(initial.families[0].goals.find(goal => goal.goalId === 'orientation')?.reviewRequired, false)
  assert.equal(initial.families[0].goals.find(goal => goal.goalId === 'm')?.definitionStatus, 'conflictingOccurrences')
  assert.equal(initial.families[0].goals.find(goal => goal.goalId === 'm')?.authoritativeOwner, null)
  const goal = initial.families[0].goals.find(goal => goal.goalId === 'p')!.occurrences[0]
  const origins = initial.prerequisiteOriginSets[goal.prerequisiteOriginsRef] as number[]
  assert(origins.map(index => initial.prerequisiteOriginTable[index]).some(origin =>
    (origin as { declaredByKey: string }).declaredByKey === 'physics:root'))
  const physics = JSON.parse(readFileSync(join(repoRoot, 'curricula/physics.json'), 'utf8'))
  physics.goals[0].requires = []
  write('curricula/physics.json', physics)
  const after = buildRequiresInventory(repoRoot, config).families[0].goals.find(goal => goal.goalId === 'p')!.occurrences[0]
  assert.throws(() => assertFreshRequiresInventory(buildRequiresInventory(repoRoot, config), inventorySnapshot), /Baseline inventory is stale/)
  assert.notEqual(after.reviewInput.prerequisitesSha256, goal.reviewInput.prerequisitesSha256)
  assert.equal(after.reviewInput.semanticSha256, goal.reviewInput.semanticSha256)
  physics.goals[1].applicability = { jurisdiction: ['DE-BY'] }
  write('curricula/physics.json', physics)
  assert.notEqual(buildRequiresInventory(repoRoot, config).families[0].goals.find(goal => goal.goalId === 'p')!.occurrences[0]
    .reviewInput.scopeSha256, after.reviewInput.scopeSha256)
  write('curricula/new-math.json', { landscapeId: 'new', subject: 'Mathematik', goals: [{ id: 'new' }] })
  assert.throws(() => buildRequiresInventory(repoRoot, config), /Unregistered active mathematics\/physics/)
  const sealedOutput = join(repoRoot, 'existing-sealed-proposal.json')
  writeFileSync(sealedOutput, 'immutable scientific input\n')
  const refused = spawnSync(process.execPath, ['--import', 'tsx',
    resolve(process.cwd(), 'scripts/prepareCrossSubjectRequiresProposal.ts'),
    '--ledger', 'tmp/cross-subject-requires/nonexistent-author-test.json', '--output', sealedOutput], { encoding: 'utf8' })
  assert.notEqual(refused.status, 0)
  assert.match(refused.stderr, /Refusing to overwrite sealed proposal/)
  assert.equal(readFileSync(sealedOutput, 'utf8'), 'immutable scientific input\n')
} finally {
  rmSync(repoRoot, { recursive: true, force: true })
}

const scopedRoot = mkdtempSync(join(temporaryRoot, 'gymnasium-discovery-fixture-'))
const writeScoped = (path: string, value: unknown) => {
  mkdirSync(resolve(scopedRoot, path, '..'), { recursive: true })
  writeFileSync(join(scopedRoot, path), JSON.stringify(value))
}
try {
  const canonicalRoot = 'curricula/DE/Gymnasium/canonical'
  const mathPath = `${canonicalRoot}/math.json`
  const physicsPath = `${canonicalRoot}/physics.json`
  const math = { landscapeId: 'math', subject: 'Mathematik', goals: [
    { id: 'm', semanticKind: 'curricularAtomic', requires: ['legacy:source'] },
  ] }
  const physics = { landscapeId: 'physics', subject: 'Physik', goals: [
    { id: 'p', semanticKind: 'curricularAtomic', requires: [] },
    { id: 'motivation', semanticKind: 'orientation', requires: [] },
  ] }
  writeScoped('curricula/curriculum_manifest.json', { curricula: [{ id: 'gymnasium' }, { id: 'university' }] })
  writeScoped(mathPath, math)
  writeScoped(physicsPath, physics)
  writeScoped('curricula/DE/BY/Realschule/math.json', { landscapeId: 'realschule', subject: 'Mathematik', goals: [{ id: 'r' }] })
  writeScoped('curricula/DE/BY/University/physics.json', { landscapeId: 'university', subject: 'Physics', goals: [{ id: 'u' }] })
  writeScoped('curricula/DE/Gymnasium/input/source.json', { landscapeId: 'legacy', subject: 'Mathematik', goals: [{ id: 'source' }] })
  writeScoped('curricula/DE/Gymnasium/archive/source.json', { landscapeId: 'archived', subject: 'Physik', goals: [{ id: 'archived-source' }] })
  writeScoped('curricula/DE/Gymnasium/quality/source.json', { landscapeId: 'quality', subject: 'Mathematik', goals: [{ id: 'quality-source' }] })
  const config: InventoryConfig = { schemaVersion: 1, inventoryId: 'gymnasium-only',
    excludedDirectories: ['input', 'archive', 'quality'], discoveryScopeRoots: [canonicalRoot],
    discoverySubjectNames: ['mathematik', 'physik', 'physics'], families: [{ familyId: 'canonical-gymnasium',
      manifestRootIds: ['gymnasium'], paths: [mathPath, physicsPath], reviewSelection: 'curricularAtomic' }] }
  const inventory = buildRequiresInventory(scopedRoot, config)
  assert.equal(inventory.activeLandscapeFiles, 4, 'out-of-scope subjects remain active for global validation')
  assert.equal(inventory.graphReferenceLandscapeFiles, 6, 'retained input/archive resolve references, while quality stays excluded')
  assert.deepEqual(inventory.subjectDiscovery.map(subject => subject.path).sort(), [mathPath, physicsPath].sort())
  assert.deepEqual(inventory.families.map(family => family.familyId), ['canonical-gymnasium'])
  assert.equal(inventory.families[0].counts.reviewRequired, 2)
  assert.deepEqual(inventory.families[0].goals.map(goal => goal.goalId).sort(), ['m', 'motivation', 'p'])
  assert.equal(inventory.families[0].goals.find(goal => goal.goalId === 'motivation')!.reviewRequired, false)
  const mathematicalGoal = inventory.families[0].goals.find(goal => goal.goalId === 'm')!
  assert.equal(mathematicalGoal.authoritativeOwner, 'math:m', 'retained prerequisite definitions do not become an owner')
  assert.deepEqual(inventory.effectivePrerequisiteSets[mathematicalGoal.occurrences[0].effectiveRequiresRef], ['legacy:source'])
  assert(!inventory.activeGraphDiagnostics.some(diagnostic => diagnostic.code === 'missing_reference'))
  for (const [path, document] of [[mathPath, math], [physicsPath, physics]] as const) {
    rmSync(join(scopedRoot, path))
    assert.throws(() => buildRequiresInventory(scopedRoot, config), /missing configured path/,
      'a missing configured Gymnasium subject cannot be hidden by scoped discovery')
    writeScoped(path, document)
  }
  for (const subject of ['Mathematik', 'Physik']) {
    const path = `${canonicalRoot}/undeclared.json`
    writeScoped(path, { landscapeId: 'undeclared', subject, goals: [{ id: 'undeclared' }] })
    assert.throws(() => buildRequiresInventory(scopedRoot, config), /Unregistered active mathematics\/physics/,
      `an undeclared Gymnasium ${subject} file fails inside the scope`)
    rmSync(join(scopedRoot, path))
  }
  assert.throws(() => buildRequiresInventory(scopedRoot, { ...config, discoveryScopeRoots: [] }), /at least one scope root/)
  assert.throws(() => buildRequiresInventory(scopedRoot, { ...config, discoveryScopeRoots: ['curricula/DE/Gymnasium/absent'] }), /Missing subject discovery directory/)
  writeScoped('curricula/DE/BY/University/physics.json', { landscapeId: 'university', subject: 'Physics', goals: [{ id: 'u', requires: ['missing-outside-scope'] }] })
  assert(buildRequiresInventory(scopedRoot, config).activeGraphDiagnostics.some(diagnostic =>
    diagnostic.code === 'missing_reference' && diagnostic.nodeKey === 'university:u'),
  'unresolved out-of-scope references still enter global diagnostics')
} finally {
  rmSync(scopedRoot, { recursive: true, force: true })
}

const proposalRoot = mkdtempSync(join(temporaryRoot, 'proposal-fixture-'))
const writeProposalFixture = (path: string, value: unknown) => {
  mkdirSync(resolve(proposalRoot, path, '..'), { recursive: true })
  writeFileSync(join(proposalRoot, path), JSON.stringify(value))
}
try {
  mkdirSync(join(proposalRoot, 'app'), { recursive: true })
  const math = { landscapeId: 'math', title: 'Math', subject: 'Mathematik', goals: [
    { id: 'm', title: 'Read graphs', requires: [] as string[], contains: [], semanticKind: 'curricularAtomic' },
  ] }
  const physics = { landscapeId: 'physics', title: 'Physics', subject: 'Physik', goals: [
    { id: 'p', title: 'Interpret motion graphs', requires: [] as string[], contains: [], semanticKind: 'curricularAtomic' },
  ] }
  const config: InventoryConfig = { schemaVersion: 1, inventoryId: 'proposal-fixture', excludedDirectories: ['input', 'archive', 'quality'],
    discoveryScopeRoots: ['curricula/DE/Gymnasium/canonical'],
    families: [{ familyId: 'canonical-gymnasium', manifestRootIds: ['root'], paths: ['curricula/DE/Gymnasium/canonical/math.json', 'curricula/DE/Gymnasium/canonical/physics.json'], reviewSelection: 'curricularAtomic' }] }
  writeProposalFixture('curricula/curriculum_manifest.json', { curricula: [{ id: 'root' }] })
  writeProposalFixture('curricula/DE/Gymnasium/canonical/math.json', math)
  writeProposalFixture('curricula/DE/Gymnasium/canonical/physics.json', physics)
  const compatibilityGoal = { id: 'legacy', requires: [] as string[], contains: [] }
  writeProposalFixture('curricula/overview.json', { landscapeId: 'overview', goals: [
    { id: 'overview-root', contains: ['legacy'], requires: [] },
  ] })
  writeProposalFixture('curricula/archive/compatibility.json', { landscapeId: 'compatibility', goals: [compatibilityGoal] })
  writeProposalFixture('curricula/quality/cross-subject-requires/math-physics.config.json', config)
  const inventoryPath = join(proposalRoot, 'curricula/quality/cross-subject-requires/math-physics.inventory.json')
  const refreshSnapshot = () => writeProposalFixture('curricula/quality/cross-subject-requires/math-physics.inventory.json', buildRequiresInventory(proposalRoot, config))
  refreshSnapshot()
  const input = buildRequiresInventory(proposalRoot, config).families[0].goals.find(goal => goal.goalId === 'p')!.occurrences[0].reviewInput
  const decision: RequiresDecision = { decisionId: 'review-p', familyId: 'canonical-gymnasium', dependentGoalId: 'p',
    prerequisiteGoalIds: ['m'], decision: 'add', rationale: 'Interpreting the graphs needs reading their values.',
    evidenceKind: 'didacticSequencing', sourceRefs: [{ path: 'curricula/DE/Gymnasium/canonical/math.json', recordId: 'm', supports: 'goalSemantics' }],
    applicability: { universality: 'allDependentScopes', scopes: [], alternatives: [] }, author: 'fixture-author', reviewInput: input }
  writeProposalFixture('author.json', { decisions: [decision] })
  const authorBytes = readFileSync(join(proposalRoot, 'author.json'), 'utf8')
  const prepare = (ledger: string, output: string) => spawnSync(process.execPath, ['--import',
    resolve(process.cwd(), 'node_modules/tsx/dist/loader.mjs'), resolve(process.cwd(), 'scripts/prepareCrossSubjectRequiresProposal.ts'),
    '--ledger', ledger, '--output', output], { cwd: join(proposalRoot, 'app'), encoding: 'utf8' })

  const prepared = prepare('author.json', 'candidate.json')
  assert.equal(prepared.status, 0, prepared.stderr)
  const packet = JSON.parse(readFileSync(join(proposalRoot, 'candidate.json'), 'utf8'))
  assert.equal(packet.baselineInventorySha256, fileFingerprint(inventoryPath))
  assert.equal(packet.sourceAuthorSha256, fileFingerprint(join(proposalRoot, 'author.json')))
  assert.deepEqual(packet.decisions[0].proposalBinding.proposedRequires, ['m'])
  assert.equal(packet.status, 'author_candidate_pending_independent_review')
  assert.equal(readFileSync(join(proposalRoot, 'author.json'), 'utf8'), authorBytes, 'preparation preserves the original author evidence')
  assert.equal(buildRequiresInventory(proposalRoot, config).activeLandscapeFiles, 3,
    'retained graph reference definitions do not become active review inventory')

  // Subject discovery is bounded, but a proposal must still reject a cycle
  // through another school form's unregistered subject file.
  const externalPath = 'curricula/DE/BY/Realschule/math.json'
  writeProposalFixture(externalPath, { landscapeId: 'external-school', subject: 'Mathematik',
    goals: [{ id: 'external-math', requires: ['physics:p'] }] })
  math.goals[0].requires = ['external-school:external-math']
  writeProposalFixture('curricula/DE/Gymnasium/canonical/math.json', math)
  refreshSnapshot()
  assert(!buildRequiresInventory(proposalRoot, config).families[0].goals.some(goal => goal.goalId === 'external-math'))
  const externalCycle = prepare('author.json', 'external-cycle-candidate.json')
  assert.notEqual(externalCycle.status, 0)
  assert.match(externalCycle.stderr, /Proposed graph has global cycles/)
  assert.equal(existsSync(join(proposalRoot, 'external-cycle-candidate.json')), false)
  rmSync(join(proposalRoot, externalPath))
  math.goals[0].requires = []
  writeProposalFixture('curricula/DE/Gymnasium/canonical/math.json', math)
  refreshSnapshot()

  // A proposed cycle can pass through retained definitions outside the active
  // review inventory; global validation must still catch it before sealing.
  compatibilityGoal.requires = ['physics:p']
  math.goals[0].requires = ['compatibility:legacy']
  writeProposalFixture('curricula/archive/compatibility.json', { landscapeId: 'compatibility', goals: [compatibilityGoal] })
  writeProposalFixture('curricula/DE/Gymnasium/canonical/math.json', math)
  refreshSnapshot()
  const retainedCycle = prepare('author.json', 'retained-cycle-candidate.json')
  assert.notEqual(retainedCycle.status, 0)
  assert.match(retainedCycle.stderr, /Proposed graph has global cycles/)
  assert.equal(existsSync(join(proposalRoot, 'retained-cycle-candidate.json')), false)
  compatibilityGoal.requires = []
  math.goals[0].requires = []
  writeProposalFixture('curricula/archive/compatibility.json', { landscapeId: 'compatibility', goals: [compatibilityGoal] })
  writeProposalFixture('curricula/DE/Gymnasium/canonical/math.json', math)
  refreshSnapshot()

  physics.goals[0].title = 'Changed source meaning'
  writeProposalFixture('curricula/DE/Gymnasium/canonical/physics.json', physics)
  const stale = prepare('author.json', 'stale-candidate.json')
  assert.notEqual(stale.status, 0)
  assert.match(stale.stderr, /Baseline inventory is stale/)
  assert.equal(existsSync(join(proposalRoot, 'stale-candidate.json')), false)
  physics.goals[0].title = 'Interpret motion graphs'
  writeProposalFixture('curricula/DE/Gymnasium/canonical/physics.json', physics)
  refreshSnapshot()
  writeProposalFixture('malformed-author.json', { decisions: [{ ...decision, prerequisiteGoalIds: 'm' }] })
  const malformed = prepare('malformed-author.json', 'malformed-candidate.json')
  assert.notEqual(malformed.status, 0)
  assert.match(malformed.stderr, /prerequisiteGoalIds must be an array/)
  assert.equal(existsSync(join(proposalRoot, 'malformed-candidate.json')), false)

  physics.goals[0].requires = ['unknown-internal']
  writeProposalFixture('curricula/DE/Gymnasium/canonical/physics.json', physics)
  refreshSnapshot()
  const missing = prepare('author.json', 'missing-candidate.json')
  assert.notEqual(missing.status, 0)
  assert.match(missing.stderr, /Proposed graph has unresolved references/)
  assert.equal(existsSync(join(proposalRoot, 'missing-candidate.json')), false)

  physics.goals[0].requires = []
  math.goals[0].requires = ['p']
  writeProposalFixture('curricula/DE/Gymnasium/canonical/physics.json', physics)
  writeProposalFixture('curricula/DE/Gymnasium/canonical/math.json', math)
  refreshSnapshot()
  const cyclic = prepare('author.json', 'cycle-candidate.json')
  assert.notEqual(cyclic.status, 0)
  assert.match(cyclic.stderr, /Proposed graph has global cycles/)
  assert.equal(existsSync(join(proposalRoot, 'cycle-candidate.json')), false)
  assert.equal(readFileSync(join(proposalRoot, 'candidate.json'), 'utf8'), JSON.stringify(packet, null, 2) + '\n', 'later failures preserve the already sealed candidate')
} finally {
  rmSync(proposalRoot, { recursive: true, force: true })
}
console.log('Cross-subject inventory tests passed (Gymnasium scope discovery, global reference/cycle safety, semantic roles, deduplication, inherited and scope drift).')
