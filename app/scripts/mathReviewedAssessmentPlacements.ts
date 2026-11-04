import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds, type CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import { collectKnownMathSupportContext, collectMathAtomicSupportContext, type MathAtomicSupportContext } from './mathStageScopePolicy'

type View = { viewId: string; scope: Record<string, string>; rootNodes: CompositionViewNode[] }
type Goal = { contains?: readonly string[]; requires?: readonly string[]; examData?: unknown; applicability?: { jurisdiction?: string[] } }
type BoundFile = { path: string; sha256: string }
type Operation = {
  viewId: string; expectedScope: Record<string, string>; mode: string; yearStructureId: string; yearDisplayLabel: string
  originalExamSlotIndex: number; expectedOriginalExamReference: CompositionViewNode; expectedYearStructureSha256: string
  expectedAfterYearStructureSha256: string; replacementNode: CompositionViewNode; newTargetGoalIds: string[]
}
type Selection = {
  schemaVersion: number; kind: string; status: string; taskGoalIds: string[]; operations: Operation[]
  reviewReceipt: BoundFile; reviewedPlan: BoundFile; supportTargetGoalIdsByViewId?: Record<string, string[]>
  supportContextGoalIdsByViewId?: Record<string, string[]>
}
type RpContextContract = MathAtomicSupportContext & {
  schemaVersion: 3 | 4; kind: 'reviewed-rp-atomic-context-contract'; canonicalProvenance: BoundFile
  goalObjectSha256ById: Record<string, string>; sourceBindings: BoundFile[]
  contextProjectionRolesByViewId: Record<string, { targetGoalIds: string[]; prerequisiteOnlyGoalIds: string[] }>
}
const rpTaskGoalIds = ['64f37348-20f7-55b1-82a8-8fc388087577', '926d0551-4537-569e-b6ad-fc33bb17546e']
const rpViewIds = ['de-rp-gym-math-gk-g8', 'de-rp-gym-math-lk-g8', 'de-rp-gym-seki-math-g8']
const rpUniverseDirectory = 'curricula/DE/Gymnasium/canonical'
const registryPath = 'app/scripts/config/math-reviewed-assessment-placements.json'
const operationFields = [
  'viewId', 'expectedScope', 'mode', 'yearStructureId', 'yearDisplayLabel', 'originalExamSlotIndex',
  'expectedOriginalExamReference', 'expectedYearStructureSha256', 'expectedAfterYearStructureSha256', 'replacementNode', 'newTargetGoalIds',
] as const
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, entry]) => [key, stable(entry)])) : value
const same = (a: unknown, b: unknown) => JSON.stringify(stable(a)) === JSON.stringify(stable(b))
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const hashObject = (value: unknown) => sha(JSON.stringify(stable(value)))
function fail(message: string): never { throw new Error(`Reviewed assessment placement: ${message}`) }
const boundJson = <T>(root: string, file: BoundFile): T => {
  const absolute = resolve(root, file.path)
  const local = relative(root, absolute)
  if (isAbsolute(local) || local.split(/[\\/]/).includes('..')) fail('file reference leaves repository')
  const bytes = readFileSync(absolute)
  if (sha(bytes) !== file.sha256) fail(`stale bound file ${file.path}`)
  return JSON.parse(bytes.toString('utf8')) as T
}
const structures = (nodes: CompositionViewNode[], id: string): Extract<CompositionViewNode, { kind: 'structure' }>[] => nodes.flatMap((node) =>
  node.kind === 'structure' ? [...(node.id === id ? [node] : []), ...structures(node.children, id)] : [])

/** The concrete unfiltered DE canonical universe, also used by validateCompositionViews. No frozen file/ancestor list. */
function currentRpCanonicalUniverse(root: string, mathGoals: ReadonlyMap<string, Goal>): ReadonlyMap<string, Goal> {
  const directory = resolve(root, rpUniverseDirectory)
  const universe = new Map<string, Goal>()
  const landscapes = new Set<string>()
  let mathSource: Array<Goal & { id: string }> | undefined
  for (const file of readdirSync(directory).filter(name => name.endsWith('.de.json')).sort()) {
    const source = JSON.parse(readFileSync(resolve(directory, file), 'utf8')) as { landscapeId: string; goals: Array<Goal & { id: string }> }
    if (!source.landscapeId || landscapes.has(source.landscapeId) || !Array.isArray(source.goals)) fail('V3 invalid/duplicate canonical landscape')
    landscapes.add(source.landscapeId)
    if (file === 'DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json') mathSource = source.goals
    for (const goal of source.goals) {
      if (!goal?.id || universe.has(goal.id)) fail('V3 missing/duplicate canonical goal identity')
      universe.set(goal.id, goal)
    }
  }
  if (!mathSource || mathGoals.size !== mathSource.length || mathSource.some(goal => !same(mathGoals.get(goal.id), goal))) {
    fail('V3 producer Mathematics map differs from the current complete canonical source')
  }
  return universe
}

/** Apply exact reviewed authoring data; requirements validate scope and never enroll goals. */
export function applyReviewedMathAssessmentPlacements<T extends View>(input: T, goals: ReadonlyMap<string, Goal>, repositoryRoot: string): T {
  const registry = JSON.parse(readFileSync(resolve(repositoryRoot, registryPath), 'utf8')) as { schemaVersion: number; selections: BoundFile[] }
  if (registry.schemaVersion !== 1 || !Array.isArray(registry.selections)) fail('unknown registry')
  let result = input
  for (const entry of registry.selections) {
    const selection = boundJson<Selection>(repositoryRoot, entry)
    const receipt = boundJson<{
      verdict: string; contentVerdict: string; placementVerdict: string; approvedViewIds: string[]
      approvedTaskGoalIds: string[]; approvedReferenceCount: number; inputBindings: BoundFile[]; authorIndependent?: boolean
      schemaVersion?: number; rpContextVerdict?: string; rpContextContract?: BoundFile
    }>(repositoryRoot, selection.reviewReceipt)
    if (![1, 2, 3, 4].includes(selection.schemaVersion) || selection.kind !== 'existing-assessment-placement' || selection.status !== 'independent-ai-reviewed'
      || receipt.verdict !== 'PASS' || receipt.contentVerdict !== 'PASS' || !receipt.placementVerdict?.startsWith('PASS')) fail('missing independent content/placement PASS')
    if (!same([...new Set(selection.operations.map((op) => op.viewId))].sort(), [...receipt.approvedViewIds].sort())
      || !same([...new Set(selection.taskGoalIds)].sort(), [...receipt.approvedTaskGoalIds].sort())
      || selection.operations.reduce((count, op) => count + op.newTargetGoalIds.length, 0) !== receipt.approvedReferenceCount) fail('selection exceeds approved views/tasks')
    if (!receipt.inputBindings.some((binding) => binding.sha256 === selection.reviewedPlan.sha256)) fail('plan is not receipt-bound')
    type TaskContext = { taskGoalId: string; supportGoalIds: string[]; effectiveDirectPrerequisiteIds?: string[]; coveredGoalIds?: string[] }
    const plan = boundJson<{ schemaVersion?: number; canonical?: BoundFile; nativeSupportEvidence?: BoundFile;
      canonicalProvenance?: BoundFile; rpContextContract?: BoundFile;
      operations: Array<Operation & { actualBackendScopeChecks?: Array<{ tasks: Array<{ fullSupportGoalIds: string[] }> }>;
        canonicalTaskContextChecks?: TaskContext[] }> }>(repositoryRoot, selection.reviewedPlan)
    const contextSemantics = selection.schemaVersion === 2 || selection.schemaVersion === 3 || selection.schemaVersion === 4
    let nativeTasks: TaskContext[] = []
    let rpContract: RpContextContract | undefined
    if (selection.schemaVersion === 2) {
      if (receipt.authorIndependent !== true) fail('V2 support-context placement needs independent review')
      if (plan.schemaVersion !== 2 || selection.supportTargetGoalIdsByViewId || !selection.supportContextGoalIdsByViewId
        || !plan.canonical || !plan.nativeSupportEvidence) fail('V2 selection needs explicit canonical support-context semantics')
      for (const binding of [plan.canonical!, plan.nativeSupportEvidence!]) {
        if (!receipt.inputBindings.some(input => input.path === binding.path && input.sha256 === binding.sha256)) fail('canonical support evidence is not receipt-bound')
      }
      const source = boundJson<{ goals: Array<Goal & { id: string }> }>(repositoryRoot, plan.canonical!)
      const canonicalTasks = new Map(source.goals.map(goal => [goal.id, goal]))
      for (const id of selection.taskGoalIds) {
        if (!same(goals.get(id), canonicalTasks.get(id))) fail(`whole task contract ${id} differs from its bound canonical source`)
      }
      const nativeEvidence = boundJson<{ canonical: BoundFile; tasks: TaskContext[] }>(repositoryRoot, plan.nativeSupportEvidence!)
      if (!same(nativeEvidence.canonical, plan.canonical)) fail('native evidence belongs to another canonical source')
      nativeTasks = nativeEvidence.tasks
      if (!Array.isArray(nativeTasks) || !same(nativeTasks.map(task => task.taskGoalId).sort(), [...selection.taskGoalIds].sort())) fail('native task-context identity differs')
    } else if (selection.schemaVersion === 3 || selection.schemaVersion === 4) {
      if (receipt.authorIndependent !== true || receipt.schemaVersion !== selection.schemaVersion || receipt.rpContextVerdict !== 'PASS'
        || plan.schemaVersion !== selection.schemaVersion || plan.canonical || !plan.canonicalProvenance || !plan.rpContextContract || !plan.nativeSupportEvidence
        || selection.supportTargetGoalIdsByViewId || !selection.supportContextGoalIdsByViewId
        || !same(receipt.rpContextContract, plan.rpContextContract)) fail('V3 needs its independent explicit RP context contract')
      if (!same(selection.taskGoalIds, rpTaskGoalIds) || !same(selection.operations.map(op => op.viewId).sort(), rpViewIds)
        || !same(Object.keys(selection.supportContextGoalIdsByViewId!).sort(), rpViewIds)) fail('V3 exceeds the two-task/three-view RP contract')
      const boundByReceipt = (binding: BoundFile) => receipt.inputBindings.some(input => same(input, binding))
      if (![selection.reviewedPlan, plan.rpContextContract!, plan.nativeSupportEvidence!].every(boundByReceipt)) fail('V3 RP contract/evidence is not receipt-bound')
      const contract = boundJson<RpContextContract>(repositoryRoot, plan.rpContextContract!)
      if (contract.schemaVersion !== selection.schemaVersion || contract.kind !== 'reviewed-rp-atomic-context-contract'
        || !same(contract.canonicalProvenance, plan.canonicalProvenance)
        || !Array.isArray(contract.sourceBindings) || !contract.sourceBindings.length
        || !same(Object.keys(contract.contextProjectionRolesByViewId ?? {}).sort(), rpViewIds)
        || new Set(contract.sourceBindings.map(binding => binding.path)).size !== contract.sourceBindings.length) fail('unknown or incomplete V3 RP context contract')
      for (const binding of contract.sourceBindings) {
        if (!boundByReceipt(binding)) fail('V3 RP source is not receipt-bound')
        const absolute = resolve(repositoryRoot, binding.path)
        const local = relative(repositoryRoot, absolute)
        if (isAbsolute(local) || local.split(/[\\/]/).includes('..')) fail('file reference leaves repository')
        if (sha(readFileSync(absolute)) !== binding.sha256) fail(`stale bound file ${binding.path}`)
      }
      const native = boundJson<MathAtomicSupportContext & {
        schemaVersion: number; kind: string; canonical: BoundFile; goalObjectSha256ById: Record<string, string>
      }>(repositoryRoot, plan.nativeSupportEvidence!)
      if (native.schemaVersion !== selection.schemaVersion || native.kind !== 'native-rp-direct-atomic-context'
        || !same(native.canonical, contract.canonicalProvenance)) fail('V3 native evidence belongs to another contract/version')
      const facts = (value: MathAtomicSupportContext) => ({ taskGoalIds: value.taskGoalIds,
        tasks: value.tasks.map(task => ({ taskGoalId: task.taskGoalId, supportGoalIds: task.supportGoalIds,
          effectiveDirectPrerequisiteIds: task.effectiveDirectPrerequisiteIds })),
        supportUnionGoalIds: value.supportUnionGoalIds, directPrerequisiteIdsByGoalId: value.directPrerequisiteIdsByGoalId })
      const universe = currentRpCanonicalUniverse(repositoryRoot, goals)
      const current = collectMathAtomicSupportContext(selection.taskGoalIds, universe)
      if (!same(facts(contract), facts(native))) fail('V3 RP context differs from full native direct-relation evidence')
      if (!same(facts(contract), facts(current))) fail('V3 current canonical atomic support context/direct relation differs')
      const objectIds = Object.keys(current.directPrerequisiteIdsByGoalId)
      const currentHashes = Object.fromEntries(objectIds.map(id => [id, hashObject(universe.get(id))]))
      // V3 remains the exact historical45/43/42 contract. The independently
      // reviewed false-R successor has its own version and exact44/42/41 shape.
      const shape = selection.schemaVersion === 3 ? { objects: 45, support: 43, perTask: 42 } : { objects: 44, support: 42, perTask: 41 }
      if (objectIds.length !== shape.objects || current.supportUnionGoalIds.length !== shape.support || current.tasks.some(task => task.supportGoalIds.length !== shape.perTask)
        || !same(contract.goalObjectSha256ById, currentHashes) || !same(native.goalObjectSha256ById, currentHashes)) fail('V3 whole RP task/support object contract differs')
      nativeTasks = contract.tasks
      rpContract = contract
    } else if (!selection.supportTargetGoalIdsByViewId || selection.supportContextGoalIdsByViewId) fail('V1 selection retains its historical support-target contract')
    if (selection.operations.length !== plan.operations.length) fail('operation inventory differs from reviewed plan')
    for (const operation of selection.operations) {
      const original = plan.operations.find((candidate) => candidate.viewId === operation.viewId)
      if (!original || !operationFields.every((field) => field === 'expectedAfterYearStructureSha256' && !contextSemantics
        || same(operation[field], original[field]))) fail('operation differs from reviewed plan')
      const contexts = original.canonicalTaskContextChecks
      if (contextSemantics && (!contexts || !same(contexts.map(task => task.taskGoalId).sort(), [...operation.newTargetGoalIds].sort()))) fail('V2 plan lacks its exact canonical task contexts')
      const reviewedSupport = contextSemantics
        ? [...new Set(contexts!.flatMap(task => task.supportGoalIds))].sort()
        : [...new Set((original.actualBackendScopeChecks ?? []).flatMap(scope => scope.tasks.flatMap(task => task.fullSupportGoalIds)))].sort()
      const selectedSupport = contextSemantics ? selection.supportContextGoalIdsByViewId : selection.supportTargetGoalIdsByViewId
      if (!same([...(selectedSupport?.[operation.viewId] ?? [])].sort(), reviewedSupport)) fail('support set differs from reviewed plan')
      if (contextSemantics) for (const context of contexts!) {
        const native = nativeTasks.find(task => task.taskGoalId === context.taskGoalId)
        if (!native || !same([...native.supportGoalIds].sort(), [...context.supportGoalIds].sort())) fail('support context differs from native evidence')
        if (selection.schemaVersion === 2) {
          const reachable = [...collectKnownMathSupportContext([context.taskGoalId], goals)]
            .filter(id => id !== context.taskGoalId && !goals.get(id)?.contains?.length).sort()
          if (!same(reachable, [...context.supportGoalIds].sort())) fail(`canonical support context ${context.taskGoalId} is unknown, incomplete or unreachable`)
        } else if (!same(native.effectiveDirectPrerequisiteIds, context.effectiveDirectPrerequisiteIds)) fail('V3 plan direct task prerequisites differ')
      }
    }
    const matching = selection.operations.filter((op) => op.viewId === result.viewId)
    if (!matching.length) continue
    if (matching.length !== 1) fail(`${result.viewId}: ambiguous selection`)
    const operation = matching[0]
    if (!same(result.scope, operation.expectedScope)
      || operation.mode !== 'replace-exact-existing-final-year-exam-slot-with-selected-wrapper') fail(`${result.viewId}: scope or operation mismatch`)
    const view = structuredClone(result)
    const parents = structures(view.rootNodes, operation.yearStructureId)
    if (parents.length !== 1 || parents[0].label !== operation.yearDisplayLabel) fail(`${view.viewId}: year anchor missing or ambiguous`)
    const year = parents[0]
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
    const alreadyApplied = hashObject(year) === operation.expectedAfterYearStructureSha256
    if (rpContract) {
      const contextIds = Object.keys(rpContract.goalObjectSha256ById)
      const expected = rpContract.contextProjectionRolesByViewId[view.viewId]
      const expectedTargets = [...new Set([...expected.targetGoalIds, ...(alreadyApplied ? operation.newTargetGoalIds : [])])].sort()
      const actualRoles = { targetGoalIds: contextIds.filter(id => roles.targetGoalIds.has(id)).sort(),
        prerequisiteOnlyGoalIds: contextIds.filter(id => roles.prerequisiteOnlyGoalIds.has(id)).sort() }
      if (!same(actualRoles, { targetGoalIds: expectedTargets, prerequisiteOnlyGoalIds: expected.prerequisiteOnlyGoalIds })) fail(`${view.viewId}: V3 RP context target/support roles differ`)
    }
    if (!alreadyApplied && (hashObject(year) !== operation.expectedYearStructureSha256
      || !same(year.children[operation.originalExamSlotIndex], operation.expectedOriginalExamReference))) fail(`${view.viewId}: year anchor drifted`)
    if (alreadyApplied && !same(year.children[operation.originalExamSlotIndex], operation.replacementNode)) fail(`${view.viewId}: replacement drifted`)
    if (!contextSemantics) for (const id of selection.supportTargetGoalIdsByViewId?.[view.viewId] ?? fail(`${view.viewId}: missing reviewed support set`)) {
      if (!roles.targetGoalIds.has(id)) fail(`${view.viewId}: reviewed support target ${id} is unavailable`)
    }
    for (const id of operation.newTargetGoalIds) {
      const goal = goals.get(id)
      const exam = goal?.examData as { reviewStatus?: string; coveredGoalIds?: string[] } | undefined
      if (!selection.taskGoalIds.includes(id) || !goal || goal.contains?.length || exam?.reviewStatus !== 'released'
        || !goal.applicability?.jurisdiction?.includes(view.scope.jurisdiction)) fail(`${view.viewId}: task ${id} is not released/applicable`)
      if (roles.targetGoalIds.has(id) !== alreadyApplied) fail(`${view.viewId}: task already selected outside reviewed placement`)
      for (const required of [...(goal.requires ?? []), ...(exam?.coveredGoalIds ?? [])]) {
        if (!roles.targetGoalIds.has(required)) fail(`${view.viewId}: whole-task target ${required} unavailable`)
      }
    }
    if (!alreadyApplied) year.children[operation.originalExamSlotIndex] = structuredClone(operation.replacementNode)
    if (hashObject(year) !== operation.expectedAfterYearStructureSha256) fail(`${view.viewId}: unexpected replacement result`)
    result = view
  }
  return result
}
