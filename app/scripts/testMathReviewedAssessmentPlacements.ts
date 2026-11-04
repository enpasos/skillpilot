import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyReviewedMathAssessmentPlacements } from './mathReviewedAssessmentPlacements'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import { collectMathAtomicSupportContext } from './mathStageScopePolicy'

type View = Parameters<typeof applyReviewedMathAssessmentPlacements>[0]
type Goal = { id: string; contains?: string[]; requires?: string[]; examData?: { reviewStatus?: string; coveredGoalIds?: string[] }; applicability?: { jurisdiction?: string[] } }
type BoundFile = { path: string; sha256: string }
type Selection = {
  schemaVersion: number
  reviewReceipt: BoundFile; reviewedPlan: BoundFile; taskGoalIds: string[]
  operations: Array<{ viewId: string; yearStructureId: string; replacementNode: { children: Array<{ kind: string; goalId?: string }> } }>
  supportTargetGoalIdsByViewId: Record<string, string[]>
}
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const capsule = 'docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/rp-g8-sphere-endpoint-restoration'
const registryPath = 'app/scripts/config/math-reviewed-assessment-placements.json'
const read = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const registry = read<{ schemaVersion: number; selections: BoundFile[] }>(resolve(repositoryRoot, registryPath))
assert.equal(registry.selections.length, 1)
// Historical V1 remains a separate contract even after the live registry moves
// to V2. Its reviewed inputs and selection are deliberately immutable fixtures.
const selectionPath = 'curricula/DE/Gymnasium/assessments/mathematik/completion-integrity-2026-11-01/rp-g8-sphere-routes-v1/composition-selection.json'
const selectionSha256 = createHash('sha256').update(readFileSync(resolve(repositoryRoot, selectionPath))).digest('hex')
assert.equal(selectionSha256, '15ca7dbdea7d39d02f73e434527c566d0ffcff64369b7fcb96b11676ec80d5a5')
const historicalRegistry = { schemaVersion: 1, selections: [{ path: selectionPath, sha256: selectionSha256 }] }
const selection = read<Selection>(resolve(repositoryRoot, selectionPath))
assert.equal(selection.schemaVersion, 1)
const canonical = read<{ goals: Goal[] }>(resolve(repositoryRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))
const goals = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const views = read<Record<string, { view: View }>>(resolve(repositoryRoot, capsule, 'reviewed-candidate/view-input-evidence.json'))
const fixtureRoot = mkdtempSync(join(tmpdir(), 'reviewed-math-placement-'))
const files = new Map([selectionPath, selection.reviewReceipt.path, selection.reviewedPlan.path]
  .map((path) => [path, readFileSync(resolve(repositoryRoot, path))]))
const write = (path: string, value: unknown) => {
  const absolute = resolve(fixtureRoot, path)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`)
}
const reset = () => {
  files.forEach((bytes, path) => {
    mkdirSync(dirname(resolve(fixtureRoot, path)), { recursive: true })
    writeFileSync(resolve(fixtureRoot, path), bytes)
  })
  write(registryPath, historicalRegistry)
}
const rebindSelection = (value: Selection) => {
  write(selectionPath, value)
  const updated = structuredClone(historicalRegistry)
  updated.selections[0].sha256 = createHash('sha256').update(readFileSync(resolve(fixtureRoot, selectionPath))).digest('hex')
  write(registryPath, updated)
}
const first = Object.values(views)[0].view
let cases = 0
try {
  reset()
  for (const [path, { view }] of Object.entries(views)) {
    const before = structuredClone(view)
    const actual = applyReviewedMathAssessmentPlacements(view, goals, fixtureRoot)
    const expected = read<View>(resolve(repositoryRoot, capsule, 'reviewed-candidate/candidate-offered-views', path))
    assert.deepEqual(actual, expected, `${view.viewId}: exact independently reviewed result`)
    assert.deepEqual(view, before, 'Input view must remain immutable.')
    assert.deepEqual(applyReviewedMathAssessmentPlacements(actual, goals, fixtureRoot), actual, 'Placement must be idempotent.')
    cases += 1
  }
  const unselected = { ...first, viewId: 'unselected-view' }
  assert.equal(applyReviewedMathAssessmentPlacements(unselected, goals, fixtureRoot), unselected)
  cases += 1
  const wrongScope = structuredClone(first)
  wrongScope.scope.stage = 'SekII'
  assert.throws(() => applyReviewedMathAssessmentPlacements(wrongScope, goals, fixtureRoot), /scope or operation mismatch/)
  cases += 1
  const changedYear = structuredClone(first)
  const changeYearLabel = (nodes: View['rootNodes']): void => nodes.forEach((node) => {
    if (node.kind !== 'structure') return
    if (node.id === selection.operations[0].yearStructureId) node.label += ' changed'
    changeYearLabel(node.children)
  })
  changeYearLabel(changedYear.rootNodes)
  assert.throws(() => applyReviewedMathAssessmentPlacements(changedYear, goals, fixtureRoot), /year anchor/)
  cases += 1
  const duplicate = structuredClone(first)
  duplicate.rootNodes.push({ kind: 'goalEntry', goalId: selection.taskGoalIds[0] })
  assert.throws(() => applyReviewedMathAssessmentPlacements(duplicate, goals, fixtureRoot), /already selected/)
  cases += 1
  for (const mutation of ['unreleased', 'out-of-country', 'out-of-scope-requirement'] as const) {
    const changed = new Map(goals)
    const task = structuredClone(goals.get(selection.taskGoalIds[0])!)
    if (mutation === 'unreleased') task.examData!.reviewStatus = 'pending'
    if (mutation === 'out-of-country') task.applicability!.jurisdiction = ['DE-HE']
    if (mutation === 'out-of-scope-requirement') task.requires = ['missing-target']
    changed.set(task.id, task)
    assert.throws(() => applyReviewedMathAssessmentPlacements(first, changed, fixtureRoot), /not released\/applicable|whole-task target/)
    cases += 1
  }
  write(selection.reviewReceipt.path, { verdict: 'PASS' })
  assert.throws(() => applyReviewedMathAssessmentPlacements(first, goals, fixtureRoot), /stale bound file/)
  cases += 1
  reset()
  const alteredOperation = structuredClone(selection)
  alteredOperation.operations[0].replacementNode.children.push({ kind: 'goalEntry', goalId: 'unreviewed-task' })
  rebindSelection(alteredOperation)
  assert.throws(() => applyReviewedMathAssessmentPlacements(first, goals, fixtureRoot), /operation differs from reviewed plan/)
  cases += 1
  reset()
  const alteredSupport = structuredClone(selection)
  alteredSupport.supportTargetGoalIdsByViewId[first.viewId].pop()
  rebindSelection(alteredSupport)
  assert.throws(() => applyReviewedMathAssessmentPlacements(first, goals, fixtureRoot), /support set differs from reviewed plan/)
  cases += 1
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true })
}
assert.equal(cases, 13)

const liveCanonical = canonical, liveGoals = goals
{ // Historical V2/V3 fixtures retain only their two historical ordinary R edges.
  const canonical = structuredClone(liveCanonical)
  for (const id of ['f2e42af5-67a6-477e-82ea-e65b09cc6cb3', 'cafd6520-c4af-4109-9863-cc49ba6fad4d']) {
    const goal = canonical.goals.find(goal => goal.id === id)!
    if (!goal.requires!.includes('1a25ef44-f310-4c23-9ba8-44baec60d3b0')) goal.requires!.push('1a25ef44-f310-4c23-9ba8-44baec60d3b0')
  }
  const goals = new Map(canonical.goals.map(goal => [goal.id, goal]))

type ContextSelection = {
  schemaVersion: number; status: string; reviewReceipt: BoundFile; reviewedPlan: BoundFile; taskGoalIds: string[]
  operations: Array<{ viewId: string; yearStructureId: string; expectedAfterYearStructureSha256: string }>
  supportContextGoalIdsByViewId: Record<string, string[]>
}
type TaskContext = { taskGoalId: string; supportGoalIds: string[]; supportCount?: number }
type ContextPlan = {
  canonical: BoundFile; nativeSupportEvidence: BoundFile
  operations: Array<{ canonicalTaskContextChecks: TaskContext[]; expectedAfterYearStructureSha256: string }>
  anchorRebase: { inputBindings: Array<BoundFile & { viewId: string }> }
}
type NativeContext = { canonical: BoundFile; tasks: TaskContext[]; supportUnionGoalIds: string[]; supportUnionCount: number }
type ContextReceipt = {
  verdict: string; contentVerdict: string; placementVerdict: string; inputBindings: BoundFile[]
  authorIndependent?: boolean; testFixtureOnly?: boolean
}
const readBound = <T>(binding: BoundFile): T => {
  assert(!binding.path.startsWith('tmp/'), 'Historical test inputs must use durable repository evidence.')
  const bytes = readFileSync(resolve(repositoryRoot, binding.path))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), binding.sha256, binding.path)
  return JSON.parse(bytes.toString('utf8')) as T
}
const activeSelection = readBound<ContextSelection>(registry.selections[0])
assert([1, 2, 3, 4].includes(activeSelection.schemaVersion), 'Only the explicit V1, V2, V3 and V4 contracts are supported.')
const v2Selection = readBound<ContextSelection>({
  path: 'curricula/DE/Gymnasium/assessments/mathematik/completion-integrity-2026-11-01/rp-g8-sphere-routes-v1/composition-selection.markov-basis-image-v24-carryforward.json',
  sha256: 'aaa5523de863eb187c377488654a19903190d55255b7ed4e9620970762d7a4ba',
})
const v2Plan = readBound<ContextPlan>(v2Selection.reviewedPlan)
const v2ExpectedPlacements = new Map<string, View>()
let contextDriftCases = 0
let contextCases = 0
{ // Self-contained V2 fixtures run under every supported active registry version.
  const plan = structuredClone(v2Plan)
  const native = readBound<NativeContext>(plan.nativeSupportEvidence)
  const receipt = readBound<ContextReceipt>(v2Selection.reviewReceipt)
  assert.equal(receipt.verdict, 'PASS')
  assert.equal(receipt.authorIndependent, true)
  const inputs = new Map(v2Selection.operations.map(operation => {
    const binding = plan.anchorRebase.inputBindings.find(input => input.viewId === operation.viewId)
    assert(binding, `Missing durable raw input for ${operation.viewId}`)
    return [operation.viewId, readBound<View>(binding)]
  }))
  const contextFixture = mkdtempSync(join(tmpdir(), 'reviewed-math-context-placement-'))
  const fixtureWrite = (path: string, value: unknown): BoundFile => {
    const absolute = resolve(contextFixture, path)
    mkdirSync(dirname(absolute), { recursive: true })
    writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`)
    return { path, sha256: createHash('sha256').update(readFileSync(absolute)).digest('hex') }
  }
  // Rebind the historical V2 semantics to a fresh disposable Canon, never its old live-file pin.
  plan.canonical = fixtureWrite('fixture-v2/canonical.json', canonical)
  native.canonical = plan.canonical
  const install = (mutate?: (selection: ContextSelection, plan: ContextPlan, native: NativeContext) => void) => {
    const changedSelection = structuredClone(v2Selection)
    const changedPlan = structuredClone(plan)
    const changedNative = structuredClone(native)
    mutate?.(changedSelection, changedPlan, changedNative)
    changedPlan.nativeSupportEvidence = fixtureWrite('fixture-v2/native.json', changedNative)
    changedSelection.reviewedPlan = fixtureWrite('fixture-v2/plan.json', changedPlan)
    // These deliberately forged bindings exist only in this disposable test
    // fixture. They must not defeat independent canonical reachability checks.
    const changedReceipt = { ...structuredClone(receipt), authorIndependent: true, testFixtureOnly: true,
      inputBindings: [changedSelection.reviewedPlan, changedPlan.nativeSupportEvidence, changedPlan.canonical] }
    changedSelection.reviewReceipt = fixtureWrite('fixture-v2/receipt.json', changedReceipt)
    const changedRegistry = structuredClone(registry)
    changedRegistry.selections[0] = fixtureWrite('fixture-v2/selection.json', changedSelection)
    fixtureWrite(registryPath, changedRegistry)
  }
  try {
    install()
    const supportWithoutTarget = '1a25ef44-f310-4c23-9ba8-44baec60d3b0'
    for (const operation of v2Selection.operations) {
      const input = inputs.get(operation.viewId)!
      const before = structuredClone(input)
      const beforeRoles = collectCompositionProjectionRoleGoalIds(input.rootNodes, goals)
      assert(v2Selection.supportContextGoalIdsByViewId[operation.viewId].includes(supportWithoutTarget))
      assert(!beforeRoles.targetGoalIds.has(supportWithoutTarget), 'Known support is not automatically selected curriculum work.')
      const output = applyReviewedMathAssessmentPlacements(input, goals, contextFixture)
      v2ExpectedPlacements.set(operation.viewId, output)
      assert.deepEqual(input, before)
      const afterRoles = collectCompositionProjectionRoleGoalIds(output.rootNodes, goals)
      assert.deepEqual([...afterRoles.targetGoalIds].filter(id => !beforeRoles.targetGoalIds.has(id)).sort(), [...v2Selection.taskGoalIds].sort())
      assert.deepEqual([...beforeRoles.targetGoalIds].filter(id => !afterRoles.targetGoalIds.has(id)), [])
      assert.deepEqual([...afterRoles.prerequisiteOnlyGoalIds].sort(), [...beforeRoles.prerequisiteOnlyGoalIds].sort())
      assert.deepEqual(applyReviewedMathAssessmentPlacements(output, goals, contextFixture), output)
      contextCases += 1
    }
    const firstOperation = v2Selection.operations[0]
    const input = inputs.get(firstOperation.viewId)!
    const missingSupport = new Map(goals)
    missingSupport.delete(supportWithoutTarget)
    assert.throws(() => applyReviewedMathAssessmentPlacements(input, missingSupport, contextFixture), /support|canonical|context|reference/i)
    contextCases += 1
    const unrelated = '19f170e4-b88f-4c06-b72a-ce6923748bb4'
    assert(goals.has(unrelated) && !native.supportUnionGoalIds.includes(unrelated))
    install((changedSelection, changedPlan, changedNative) => {
      Object.values(changedSelection.supportContextGoalIdsByViewId).forEach(ids => ids.push(unrelated))
      for (const operation of changedPlan.operations) for (const context of operation.canonicalTaskContextChecks) context.supportGoalIds.push(unrelated)
      changedNative.supportUnionGoalIds.push(unrelated)
      changedNative.supportUnionCount += 1
      for (const task of changedNative.tasks) {
        task.supportGoalIds.push(unrelated)
        if (task.supportCount !== undefined) task.supportCount += 1
      }
    })
    assert.throws(() => applyReviewedMathAssessmentPlacements(input, goals, contextFixture), /support|canonical|context|reachable|inventory/i)
    contextCases += 1
    install(changedSelection => {
      changedSelection.operations[0].expectedAfterYearStructureSha256 = '0'.repeat(64)
    })
    assert.throws(() => applyReviewedMathAssessmentPlacements(input, goals, contextFixture), /operation differs from reviewed plan/)
    install((changedSelection, changedPlan) => {
      changedSelection.operations[0].expectedAfterYearStructureSha256 = '0'.repeat(64)
      changedPlan.operations[0].expectedAfterYearStructureSha256 = '0'.repeat(64)
    })
    assert.throws(() => applyReviewedMathAssessmentPlacements(input, goals, contextFixture), /unexpected replacement result/)
    contextCases += 1
    install()
    const wrongAnchor = structuredClone(input)
    const mutateYear = (nodes: View['rootNodes']): void => nodes.forEach(node => {
      if (node.kind !== 'structure') return
      if (node.id === firstOperation.yearStructureId) {
        const competencies = node.children[0]
        assert(competencies.kind === 'structure')
        competencies.label += ' changed'
      }
      mutateYear(node.children)
    })
    mutateYear(wrongAnchor.rootNodes)
    assert.throws(() => applyReviewedMathAssessmentPlacements(wrongAnchor, goals, contextFixture), /anchor/)
    contextCases += 1
    const wrongScope = structuredClone(input)
    wrongScope.scope.stage = 'SekII'
    assert.throws(() => applyReviewedMathAssessmentPlacements(wrongScope, goals, contextFixture), /scope/)
    contextCases += 1
    const wrongContract = new Map(goals)
    const task = structuredClone(goals.get(v2Selection.taskGoalIds[0])!)
    task.requires = [...(task.requires ?? []), unrelated]
    wrongContract.set(task.id, task)
    assert.throws(() => applyReviewedMathAssessmentPlacements(input, wrongContract, contextFixture), /support|target|context|canonical|contract|inventory/i)
    contextCases += 1
    assert.equal(contextCases, 9)
    install()
    const canonicalBytes = readFileSync(resolve(contextFixture, plan.canonical.path))
    const drift = structuredClone(canonical)
    const tank = drift.goals.find(goal => goal.id === 'c849eeab-e88f-5e82-89d9-761a1e17d97b')!
    Object.assign(tank, { tags: ['GK', 'V2-whole-file-drift-fixture'] })
    fixtureWrite(plan.canonical.path, drift)
    assert.throws(() => applyReviewedMathAssessmentPlacements(input, goals, contextFixture), /stale bound file/, 'V2 retains its strict whole-file Canon binding after unrelated changes.')
    writeFileSync(resolve(contextFixture, plan.canonical.path), canonicalBytes)
    assert.deepEqual(applyReviewedMathAssessmentPlacements(input, goals, contextFixture), v2ExpectedPlacements.get(input.viewId))
    contextDriftCases++
  } finally {
    rmSync(contextFixture, { recursive: true, force: true })
  }
}

// V3 fixtures exercise the same exact placement regardless of the active registry version.
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, entry]) => [key, stable(entry)])) : value
const hashObject = (value: unknown) => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')
const rp = collectMathAtomicSupportContext(v2Selection.taskGoalIds, goals)
assert.deepEqual(rp.tasks.map(task => task.supportGoalIds.length), [42, 42])
assert.equal(rp.supportUnionGoalIds.length, 43)
assert.equal(Object.keys(rp.directPrerequisiteIdsByGoalId).length, 45)
const rpInputs = new Map(v2Plan.anchorRebase.inputBindings.map(binding => [binding.viewId, readBound<View>(binding)]))
let installedActiveV3Cases = 0
if (activeSelection.schemaVersion === 3) {
  for (const [id, input] of rpInputs) {
    const output = applyReviewedMathAssessmentPlacements(input, goals, repositoryRoot)
    assert.deepEqual(output, v2ExpectedPlacements.get(id), `${id}: installed active V3 must retain the exact V2 placement.`)
    assert.deepEqual(applyReviewedMathAssessmentPlacements(output, goals, repositoryRoot), output,
      `${id}: installed active V3 must remain idempotent.`)
    installedActiveV3Cases++
  }
  assert.equal(installedActiveV3Cases, 3, 'All three installed active V3 registry operations must run.')
}
const rpContextIds = Object.keys(rp.directPrerequisiteIdsByGoalId)
const contextRoles = (view: View) => {
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
  return { targetGoalIds: rpContextIds.filter(id => roles.targetGoalIds.has(id)).sort(),
    prerequisiteOnlyGoalIds: rpContextIds.filter(id => roles.prerequisiteOnlyGoalIds.has(id)).sort() }
}
const contract = { schemaVersion: 3, kind: 'reviewed-rp-atomic-context-contract', canonicalProvenance: v2Plan.canonical,
  ...rp, goalObjectSha256ById: Object.fromEntries(rpContextIds.map(id => [id, hashObject(goals.get(id))])),
  sourceBindings: [] as BoundFile[], contextProjectionRolesByViewId: Object.fromEntries([...rpInputs].map(([id, view]) => [id, contextRoles(view)])) }
const nativeV3 = { schemaVersion: 3, kind: 'native-rp-direct-atomic-context', canonical: v2Plan.canonical,
  ...rp, goalObjectSha256ById: contract.goalObjectSha256ById, testFixtureOnly: true }
const planV3 = { schemaVersion: 3, canonicalProvenance: v2Plan.canonical, rpContextContract: {} as BoundFile,
  nativeSupportEvidence: {} as BoundFile, operations: structuredClone(v2Plan.operations) }
const selectionV3 = { ...structuredClone(v2Selection), schemaVersion: 3, kind: 'existing-assessment-placement' }
const v3Fixture = mkdtempSync(join(tmpdir(), 'reviewed-rp-v3-placement-'))
let v3Cases = 0
let v4Cases = 0
const v3Write = (path: string, value: unknown): BoundFile => {
  const absolute = resolve(v3Fixture, path)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`)
  return { path, sha256: createHash('sha256').update(readFileSync(absolute)).digest('hex') }
}
const canonicalDirectory = 'curricula/DE/Gymnasium/canonical'
mkdirSync(resolve(v3Fixture, canonicalDirectory), { recursive: true })
for (const file of readdirSync(resolve(repositoryRoot, canonicalDirectory)).filter(name => name.endsWith('.de.json') && name !== 'DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')) {
  symlinkSync(resolve(repositoryRoot, canonicalDirectory, file), resolve(v3Fixture, canonicalDirectory, file))
}
const applyV3 = (view: View, currentGoals: Map<string, Goal>) => {
  // Only this disposable fixture writes its Math snapshot; every foreign subject remains freshly read.
  v3Write(`${canonicalDirectory}/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`, { landscapeId: 'math-v3-test-fixture', goals: [...currentGoals.values()] })
  return applyReviewedMathAssessmentPlacements(view, currentGoals, v3Fixture)
}
type FixtureContract = typeof contract
type FixtureNative = typeof nativeV3
const installV3 = (mutate?: (c: FixtureContract, n: FixtureNative, p: typeof planV3, s: typeof selectionV3) => void,
  mutateReceipt?: (receipt: Record<string, unknown>) => void) => {
  const c = structuredClone(contract), n = structuredClone(nativeV3), p = structuredClone(planV3), s = structuredClone(selectionV3)
  c.sourceBindings = [v3Write('fixture/source.json', { testFixtureOnly: true, source: 'RP' })]
  mutate?.(c, n, p, s)
  p.rpContextContract = v3Write('fixture/contract-v3.json', c)
  p.nativeSupportEvidence = v3Write('fixture/native-v3.json', n)
  s.reviewedPlan = v3Write('fixture/plan-v3.json', p)
  const receipt: Record<string, unknown> = { schemaVersion: 3, verdict: 'PASS', contentVerdict: 'PASS', placementVerdict: 'PASS_TEST_FIXTURE_ONLY',
    authorIndependent: true, testFixtureOnly: true, rpContextVerdict: 'PASS', rpContextContract: p.rpContextContract,
    approvedViewIds: s.operations.map(operation => operation.viewId), approvedTaskGoalIds: s.taskGoalIds, approvedReferenceCount: 6,
    inputBindings: [s.reviewedPlan, p.rpContextContract, p.nativeSupportEvidence, ...c.sourceBindings] }
  mutateReceipt?.(receipt)
  s.reviewReceipt = v3Write('fixture/receipt-v3.json', receipt)
  v3Write(registryPath, { schemaVersion: 1, selections: [v3Write('fixture/selection-v3.json', s)] })
}
try {
  installV3()
  for (const [id, input] of rpInputs) {
    const before = structuredClone(input)
    const output = applyV3(input, goals)
    // V3 retains the exact existing placement, targets and support roles.
    assert.deepEqual(output, v2ExpectedPlacements.get(id))
    assert.deepEqual(input, before)
    assert.deepEqual(applyV3(output, goals), output)
    const afterRoles = collectCompositionProjectionRoleGoalIds(output.rootNodes, goals)
    const beforeRoles = collectCompositionProjectionRoleGoalIds(input.rootNodes, goals)
    assert.deepEqual([...afterRoles.targetGoalIds].filter(goalId => !beforeRoles.targetGoalIds.has(goalId)).sort(), rp.taskGoalIds, id)
    assert.deepEqual([...afterRoles.prerequisiteOnlyGoalIds].sort(), [...beforeRoles.prerequisiteOnlyGoalIds].sort())
    v3Cases++
  }
  const input = rpInputs.values().next().value!
  const expected = applyV3(input, goals)
  const changedForeign = new Map(goals)
  const tankId = 'c849eeab-e88f-5e82-89d9-761a1e17d97b'
  assert(!rpContextIds.includes(tankId))
  const tank = structuredClone(goals.get(tankId)!) as Goal & { tags: string[] }
  const beforeTag = new Map(goals)
  beforeTag.set(tankId, { ...tank, tags: tank.tags.filter(tag => tag !== 'GK') } as Goal)
  assert.deepEqual(applyV3(input, beforeTag), expected)
  const beforeTagCanonicalHash = createHash('sha256').update(readFileSync(resolve(v3Fixture, canonicalDirectory, 'DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))).digest('hex')
  tank.tags = ['GK', ...tank.tags.filter(tag => tag !== 'GK')]
  changedForeign.set(tankId, tank)
  assert.deepEqual(applyV3(input, changedForeign), expected)
  assert.notEqual(createHash('sha256').update(readFileSync(resolve(v3Fixture, canonicalDirectory, 'DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))).digest('hex'), beforeTagCanonicalHash,
    'The actual V25 GK tag changes the whole Canon file while the active V3 registry retains the same RP result.')
  v3Cases++
  const beforeMarkov = new Map(goals)
  for (const prefix of ['57aff94e', 'e4656e83']) {
    const markov = canonical.goals.find(goal => goal.id.startsWith(prefix))!
    assert(markov && !rpContextIds.includes(markov.id))
    beforeMarkov.set(markov.id, { ...markov, requires: markov.requires!.filter(id => id !== '8dc2c87a-cfc6-5f15-89e5-634107f5c9c7') })
  }
  assert.deepEqual(applyV3(input, beforeMarkov), expected)
  v3Cases++
  const withSibling = new Map(goals)
  const childIds = new Set(canonical.goals.flatMap(goal => goal.contains ?? []))
  const root = canonical.goals.find(goal => goal.contains?.length && !childIds.has(goal.id))!
  assert(root && !rpContextIds.includes(root.id))
  withSibling.set('foreign-root-sibling', { id: 'foreign-root-sibling', requires: [] })
  withSibling.set(root.id, { ...root, contains: [...root.contains!, 'foreign-root-sibling'] })
  assert.deepEqual(applyV3(input, withSibling), expected)
  v3Cases++
  for (const mutation of ['task', 'rubric', 'coverage', 'applicability', 'tags', 'support'] as const) {
    const changed = new Map(goals)
    const id = mutation === 'support' ? rp.supportUnionGoalIds[0] : rp.taskGoalIds[0]
    const goal = structuredClone(goals.get(id)!)
    if (mutation === 'rubric') Object.assign(goal.examData!, { gradingRubric: 'changed fixture rubric' })
    else if (mutation === 'coverage') goal.examData!.coveredGoalIds = []
    else if (mutation === 'applicability') goal.applicability!.jurisdiction = ['DE-HE']
    else Object.assign(goal, { [mutation === 'tags' ? 'tags' : 'description']: ['changed whole object'] })
    changed.set(id, goal)
    assert.throws(() => applyV3(input, changed), /whole RP|contract/i, mutation)
    v3Cases++
  }
  const task = rp.tasks[0]
  const indirect = task.supportGoalIds.find(id => !task.effectiveDirectPrerequisiteIds.includes(id))!
  assert(indirect)
  const newAncestor = new Map(goals)
  newAncestor.set('new-rp-parent', { id: 'new-rp-parent', contains: [task.taskGoalId], requires: [indirect] })
  const ancestorFacts = collectMathAtomicSupportContext(rp.taskGoalIds, newAncestor)
  assert.deepEqual(ancestorFacts.supportUnionGoalIds, rp.supportUnionGoalIds, 'Countercase must keep the same closure.')
  assert.notDeepEqual(ancestorFacts.directPrerequisiteIdsByGoalId, rp.directPrerequisiteIdsByGoalId)
  assert.throws(() => applyV3(input, newAncestor), /direct relation/)
  v3Cases++
  const foreignPath = `${canonicalDirectory}/ZZ_FOREIGN_V3_COUNTERCASE.de.json`
  v3Write(foreignPath, { landscapeId: 'foreign-v3-countercase', goals: [{ id: 'foreign-canon-root', contains: ['foreign-canon-sibling'] },
    { id: 'foreign-canon-sibling' }] })
  assert.deepEqual(applyV3(input, goals), expected, 'A foreign canonical root sibling is not an RP content delta.')
  v3Cases++
  v3Write(foreignPath, { landscapeId: 'foreign-v3-countercase', goals: [{ id: 'foreign-canon-parent', contains: [task.taskGoalId], requires: [indirect] }] })
  assert.throws(() => applyV3(input, goals), /direct relation/, 'A foreign ancestor must not be silently omitted from the current canonical universe.')
  rmSync(resolve(v3Fixture, foreignPath))
  v3Cases++
  const externalCluster = new Map(goals)
  externalCluster.set('new-rp-parent', { id: 'new-rp-parent', contains: [task.taskGoalId], requires: ['external-required-cluster'] })
  externalCluster.set('external-required-cluster', { id: 'external-required-cluster', contains: [...task.effectiveDirectPrerequisiteIds] })
  assert.deepEqual(applyV3(input, externalCluster), expected)
  externalCluster.set('external-required-cluster', { id: 'external-required-cluster', contains: [...task.effectiveDirectPrerequisiteIds, indirect] })
  assert.deepEqual(collectMathAtomicSupportContext(rp.taskGoalIds, externalCluster).supportUnionGoalIds, rp.supportUnionGoalIds)
  assert.throws(() => applyV3(input, externalCluster), /direct relation/)
  v3Cases++
  for (const kind of ['missing', 'requires-cycle', 'contains-cycle'] as const) {
    const changed = new Map(goals)
    changed.set('foreign-a', { id: 'foreign-a', requires: kind === 'missing' ? ['missing'] : kind === 'requires-cycle' ? ['foreign-b'] : [],
      contains: kind === 'contains-cycle' ? ['foreign-a'] : [] })
    if (kind === 'requires-cycle') changed.set('foreign-b', { id: 'foreign-b', requires: ['foreign-a'] })
    assert.throws(() => applyV3(input, changed), /reference|cycle/i, kind)
    v3Cases++
  }
  const missing = new Map(goals)
  missing.delete(rp.supportUnionGoalIds[0])
  assert.throws(() => applyV3(input, missing), /reference/i)
  v3Cases++
  installV3(c => { c.schemaVersion = 4 })
  assert.throws(() => applyV3(input, goals), /unknown.*contract/)
  v3Cases++
  installV3((c, n) => { delete n.directPrerequisiteIdsByGoalId[rpContextIds[0]] })
  assert.throws(() => applyV3(input, goals), /full native direct-relation/)
  v3Cases++
  installV3()
  v3Write('fixture/source.json', { changed: true })
  assert.throws(() => applyV3(input, goals), /stale bound file/)
  v3Cases++
  installV3(undefined, receipt => { receipt.authorIndependent = false })
  assert.throws(() => applyV3(input, goals), /independent explicit/)
  v3Cases++
  installV3(undefined, receipt => { receipt.inputBindings = [] })
  assert.throws(() => applyV3(input, goals), /receipt-bound/)
  v3Cases++
  installV3(undefined, receipt => { receipt.inputBindings = (receipt.inputBindings as BoundFile[]).filter(binding => binding.path !== 'fixture/source.json') })
  assert.throws(() => applyV3(input, goals), /source is not receipt-bound/)
  v3Cases++
  installV3((_c, _n, p) => { Object.assign(p, { canonical: v2Plan.canonical }) })
  assert.throws(() => applyV3(input, goals), /explicit RP context contract/)
  v3Cases++
  installV3((_c, _n, p) => { Object.assign(p.operations[0].canonicalTaskContextChecks[0], { effectiveDirectPrerequisiteIds: [] }) })
  assert.throws(() => applyV3(input, goals), /plan direct task prerequisites/)
  v3Cases++
  installV3((_c, _n, _p, s) => { Object.assign(s.operations[0], { originalExamSlotIndex: 0 }) })
  assert.throws(() => applyV3(input, goals), /operation differs/)
  v3Cases++
  installV3()
  const wrongScope = structuredClone(input)
  wrongScope.scope.stage = 'SekII'
  assert.throws(() => applyV3(wrongScope, goals), /scope/)
  v3Cases++
  const changedRoles = structuredClone(input)
  changedRoles.rootNodes.push({ kind: 'goalEntry', goalId: '1a25ef44-f310-4c23-9ba8-44baec60d3b0' })
  assert.throws(() => applyV3(changedRoles, goals), /target\/support roles/)
  v3Cases++
  const changedYear = structuredClone(input)
  const changeYear = (nodes: View['rootNodes']): void => nodes.forEach(node => {
    if (node.kind !== 'structure') return
    if (node.id === v2Selection.operations[0].yearStructureId) node.label += ' changed'
    changeYear(node.children)
  })
  changeYear(changedYear.rootNodes)
  assert.throws(() => applyV3(changedYear, goals), /year anchor/)
  v3Cases++

  if (activeSelection.schemaVersion === 4) {
    const activePlan = readBound<ContextPlan>(activeSelection.reviewedPlan)
    const liveRp = collectMathAtomicSupportContext(v2Selection.taskGoalIds, liveGoals)
    assert.equal(liveRp.supportUnionGoalIds.length, 42)
    assert.deepEqual(liveRp.tasks.map(task => task.supportGoalIds.length), [41, 41])
    const liveIds = Object.keys(liveRp.directPrerequisiteIdsByGoalId)
    assert.equal(liveIds.length, 44)
    assert(!liveIds.includes('1a25ef44-f310-4c23-9ba8-44baec60d3b0'))
    const liveInputs = new Map(activePlan.anchorRebase.inputBindings.map(binding => [binding.viewId, readBound<View>(binding)]))
    const installV4 = (mutate?: (c: FixtureContract, n: FixtureNative) => void) => installV3((c, n, p, s) => {
      // Contract and native evidence must be independent: corrupting one side
      // in a negative case must not also mutate the other or the live snapshot.
      Object.assign(c, structuredClone(liveRp), { schemaVersion: 4, goalObjectSha256ById: Object.fromEntries(liveIds.map(id => [id, hashObject(liveGoals.get(id))])) })
      Object.assign(n, structuredClone(liveRp), { schemaVersion: 4, goalObjectSha256ById: structuredClone(c.goalObjectSha256ById) })
      p.schemaVersion = 4
      p.operations = structuredClone(activePlan.operations)
      Object.assign(s, structuredClone(activeSelection))
      s.reviewedPlan = {} as BoundFile
      s.reviewReceipt = {} as BoundFile
      mutate?.(c, n)
    }, receipt => { receipt.schemaVersion = 4 })
    installV4()
    for (const input of liveInputs.values()) {
      const before = structuredClone(input)
      const actual = applyReviewedMathAssessmentPlacements(input, liveGoals, repositoryRoot)
      assert.deepEqual(applyReviewedMathAssessmentPlacements(actual, liveGoals, repositoryRoot), actual)
      assert.deepEqual(applyV3(input, liveGoals), actual)
      assert.deepEqual(input, before)
      const prior = collectCompositionProjectionRoleGoalIds(input.rootNodes, liveGoals)
      const after = collectCompositionProjectionRoleGoalIds(actual.rootNodes, liveGoals)
      assert.deepEqual([...after.targetGoalIds].filter(id => !prior.targetGoalIds.has(id)).sort(), liveRp.taskGoalIds)
      assert.deepEqual([...prior.targetGoalIds].filter(id => !after.targetGoalIds.has(id)), [])
      assert.deepEqual([...after.prerequisiteOnlyGoalIds].sort(), [...prior.prerequisiteOnlyGoalIds].sort())
      v4Cases++
    }
    const input = liveInputs.values().next().value!
    installV4((c, n) => { Object.assign(c, rp); Object.assign(n, rp) })
    assert.throws(() => applyV3(input, liveGoals), /canonical atomic support|whole RP|context/i, 'The old45/43/42 context cannot masquerade as V4.')
    v4Cases++
    installV4((c, n) => { delete n.directPrerequisiteIdsByGoalId[liveIds[0]] })
    assert.throws(() => applyV3(input, liveGoals), /full native direct-relation/)
    v4Cases++
    installV4()
    const changed = new Map(liveGoals), wholeTask = structuredClone(liveGoals.get(liveRp.taskGoalIds[0])!)
    Object.assign(wholeTask, { description: 'changed whole RP task' }); changed.set(wholeTask.id, wholeTask)
    assert.throws(() => applyV3(input, changed), /whole RP|contract/i)
    v4Cases++
    const indirect = liveRp.tasks[0].supportGoalIds.find(id => !liveRp.tasks[0].effectiveDirectPrerequisiteIds.includes(id))!
    const parent = new Map(liveGoals); parent.set('v4-extra-parent', { id: 'v4-extra-parent', contains: [liveRp.taskGoalIds[0]], requires: [indirect] })
    assert.throws(() => applyV3(input, parent), /direct relation/)
    v4Cases++
    installV4(c => { c.contextProjectionRolesByViewId[input.viewId].targetGoalIds.pop() })
    assert.throws(() => applyV3(input, liveGoals), /target\/support roles differ/)
    v4Cases++
    installV4(); v3Write('fixture/source.json', { changed: true })
    assert.throws(() => applyV3(input, liveGoals), /stale bound file/)
    v4Cases++
    assert.equal(v4Cases, 9)
  }

} finally {
  rmSync(v3Fixture, { recursive: true, force: true })
}

// Separate synthetic inheritance/cluster checks expose semantics hidden by equal support sets.
const inherited = new Map<string, Goal>([
  ['t', { id: 't', requires: ['k'] }], ['a', { id: 'a', requires: ['b'] }], ['b', { id: 'b' }], ['c', { id: 'c' }],
  ['k', { id: 'k', contains: ['a'] }], ['p1', { id: 'p1', contains: ['t'], requires: ['b'] }],
  ['p2', { id: 'p2', contains: ['t'], requires: ['c'] }], ['grandparent', { id: 'grandparent', contains: ['p2'], requires: ['b'] }],
])
assert.deepEqual(collectMathAtomicSupportContext(['t'], inherited).directPrerequisiteIdsByGoalId, { a: ['b'], b: [], c: [], t: ['a', 'b', 'c'] })
const atomicCycle = new Map<string, Goal>([['a', { id: 'a' }], ['p', { id: 'p', contains: ['a'], requires: ['a'] }]])
assert.throws(() => collectMathAtomicSupportContext(['a'], atomicCycle), /atomic requirement cycle/)
const aliases = new Map<string, Goal>([['t', { id: 't', requires: ['legacy:a', 'b'] }], ['a', { id: 'a' }], ['ns:b', { id: 'ns:b' }]])
assert.deepEqual(collectMathAtomicSupportContext(['t'], aliases).directPrerequisiteIdsByGoalId, { a: [], 'ns:b': [], t: ['a', 'ns:b'] })
aliases.set('other:b', { id: 'other:b' })
assert.throws(() => collectMathAtomicSupportContext(['t'], aliases), /ambiguous canonical reference/)
console.log(`Reviewed Mathematics assessment placements passed: ${cases} historical V1 cases; ${contextCases} independent V2 cases; ${contextDriftCases} strict V2 whole-file drift case; ${v3Cases} V3 contract/placement cases; ${installedActiveV3Cases} installed active V3 placement cases; ${v4Cases} exact V4 current-context cases; 4 inheritance/cycle/reference checks.`)

} // Historical V2/V3 fixtures and current installed V4 contract remain separate.
