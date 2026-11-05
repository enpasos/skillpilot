import assert from 'node:assert/strict'
import { atomicRelation, canonicalJson, digest, fullClosure, goalMeaning, reachable, resolvedKind, type MathGoal } from '../learningUnitsMathAuthoring'
import { fingerprintSemanticKindSourceGoal } from '../goalBookModel'

export interface Landscape {
  landscapeId: string; goals: MathGoal[]; programUnits: Array<Record<string, any>>; goalPlacements: Array<Record<string, any>>
}
export interface Packet {
  contractId: string; revision: string; programUnitId: string; parentUnitId: string; placementRevision: string
  title: { de: string; en: string }; promise: { de: string; en: string }; introduction: { de: string; en: string }
  ownGoalIds: string[]; requiredChildContractRefs: Array<{ contractId: string; revision: string }>
  reviewRef: string; reviewReceiptPath: string; additionalInputPaths: string[]
  assessmentClaims: Record<string, { coveredGoalIds: string[] }>
  scopeReview?: Record<string, unknown>
}
export interface Batch {
  schemaVersion: 1; generation: string; baselineRef: string; packets: Packet[]
  newGoalPaths: string[]; canonicalClusterAdditions: Array<{ clusterId: string; goalIds: string[] }>
  removeRedundantRequires: Array<[string, string]>
  compositionViews: Record<string, string>
  compositionViewEdits?: Array<{ path: string; expectedSha256: string; arrayPointer: string; afterIndex: number; expectedAnchorGoalId: string; node: Record<string, any> }>
}
export interface Receipt {
  schemaVersion: 1; semantics: 'learning-unit-content-review-v1'; decision: 'approved'
  independentReviewer: string; reviewedInputSha256: string; reviewPath: string
}
const hash = (value: unknown) => digest(canonicalJson(value))
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const prefix = 'DE/Gymnasium/learning-units'
const unique = (values: string[], label: string) => assert.equal(new Set(values).size, values.length, `Duplicate ${label}`)
const safe = (value: string) => assert.match(value, /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/, 'Unsafe artifact identity')

/** Suggest only actual authored deletions, proving the complete closure after each one. */
export function suggestRedundantRequires(source: Landscape, ownGoalIds: string[]) {
  const candidate = structuredClone(source); const byId = new Map(candidate.goals.map(goal => [goal.id, goal]))
  const parents: Record<string, string[]> = {}
  for (const goal of candidate.goals) for (const child of goal.contains ?? []) (parents[child] ??= []).push(goal.id)
  const relation = atomicRelation(candidate.goals); const closure = canonicalJson(fullClosure(relation))
  const owners = [...reachable(reachable(ownGoalIds, relation), parents)].sort()
  const removed: Array<[string, string]> = []
  for (const id of owners) {
    const goal = byId.get(id)!
    for (const prerequisite of [...(goal.requires ?? [])]) {
      const before = goal.requires!; goal.requires = before.filter(value => value !== prerequisite)
      if (canonicalJson(fullClosure(atomicRelation(candidate.goals))) === closure) removed.push([id, prerequisite])
      else goal.requires = before
    }
  }
  return removed
}

/** Pure preparation. Review approval is an input; this function cannot create it. */
export function prepareBatch(batch: Batch, baseline: Landscape, baselineLedger: any,
  existingCatalog: any, read: (path: string) => string, allowPendingReview: boolean) {
  assert.equal(batch.schemaVersion, 1); safe(batch.generation)
  assert.ok(batch.packets.length, 'Empty content batch')
  unique(batch.packets.map(packet => packet.contractId), 'contract identity')
  unique(batch.packets.map(packet => packet.programUnitId), 'program unit identity')
  const source = structuredClone(baseline)
  const oldById = new Map(baseline.goals.map(goal => [goal.id, goal]))
  const byId = new Map(source.goals.map(goal => [goal.id, goal]))
  for (const path of batch.newGoalPaths) {
    const goal = JSON.parse(read(path)) as MathGoal
    assert.ok(!byId.has(goal.id), `A new assessment must not retype an existing identity: ${goal.id}`)
    assert.equal(resolvedKind(goal), 'assessment', 'Only independently reviewed new Q identities may be added by this emitter')
    assert.ok(goal.examData?.taskContent && goal.examData.solutionContent && goal.examData.scoring, 'Incomplete new normal assessment')
    source.goals.push(goal); byId.set(goal.id, goal)
  }
  for (const addition of batch.canonicalClusterAdditions) {
    const cluster = byId.get(addition.clusterId); assert.ok(cluster?.contains?.length, `Not an existing cluster ${addition.clusterId}`)
    for (const id of addition.goalIds) { assert.ok(byId.has(id) && !oldById.has(id), 'Only new Q navigation additions are supported'); assert.ok(!cluster.contains.includes(id)); cluster.contains.push(id) }
  }
  const expected = fullClosure(atomicRelation(source.goals))
  const previous = fullClosure(atomicRelation(baseline.goals))
  for (const [id, demand] of Object.entries(previous)) assert.deepEqual(expected[id], demand, `A new Q changed original demand ${id}`)
  for (const [id, prerequisite] of batch.removeRedundantRequires) {
    const goal = byId.get(id); assert.ok(goal?.requires?.includes(prerequisite), `Repair is not an authored edge ${id}->${prerequisite}`)
    goal.requires = goal.requires.filter(value => value !== prerequisite)
    assert.deepEqual(fullClosure(atomicRelation(source.goals)), expected, `Repair changed full transitive demand ${id}->${prerequisite}`)
  }
  const relation = atomicRelation(source.goals)
  for (const goal of baseline.goals) assert.deepEqual(goalMeaning(byId.get(goal.id)!), goalMeaning(goal), `Original fixed meaning changed ${goal.id}`)
  // Calendar ancestors retain unique-descendant weights after explicit Q additions.
  const descendants = (id: string, path = new Set<string>()): Set<string> => {
    assert.ok(!path.has(id), `Contains cycle ${id}`); const goal = byId.get(id); assert.ok(goal)
    return goal.contains?.length ? new Set(goal.contains.flatMap(child => [...descendants(child, new Set([...path, id]))])) : new Set([id])
  }
  const added = new Set(source.goals.filter(goal => !oldById.has(goal.id)).map(goal => goal.id))
  for (const goal of source.goals.filter(goal => goal.contains?.length)) {
    const atoms = descendants(goal.id); if ([...added].some(id => atoms.has(id))) goal.weight = atoms.size
  }
  const existingDefinitions = existingCatalog.contracts.map((entry: any) => JSON.parse(read(entry.path)))
  const artifacts = new Map<string, string>()
  const set = (path: string, value: unknown) => artifacts.set(path, json(value))
  const generation = `${prefix}/sources/${batch.generation}`
  const snapshotPath = `${generation}.source.json`
  const ledgerPath = `${generation}/mathematik.semantic-kinds.json`
  const currentViews = new Map(Object.values(batch.compositionViews).map(path => [path, read(path)]))
  const patchedViews = new Map<string, any>()
  for (const edit of batch.compositionViewEdits ?? []) {
    assert.ok(currentViews.has(edit.path)); assert.equal(digest(currentViews.get(edit.path)!), edit.expectedSha256, 'View generation drift')
    const view = patchedViews.get(edit.path) ?? JSON.parse(currentViews.get(edit.path)!); patchedViews.set(edit.path, view)
    let array: any = view
    for (const segment of edit.arrayPointer.split('/').slice(1)) array = array[segment.replace(/~1/g, '/').replace(/~0/g, '~')]
    assert.ok(Array.isArray(array), 'View edit must address an exact existing array')
    assert.equal(array[edit.afterIndex]?.kind, 'goalEntry'); assert.equal(array[edit.afterIndex]?.goalId, edit.expectedAnchorGoalId, 'View anchor drift')
    assert.equal(edit.node.kind, 'goalEntry'); assert.ok(added.has(edit.node.goalId), 'View additions are limited to the declared new Q')
    assert.equal(edit.node.projectionRole ?? 'target', array[edit.afterIndex].projectionRole ?? 'target', 'Q role must preserve its reviewed anchor role')
    array.splice(edit.afterIndex + 1, 0, edit.node)
  }
  for (const [path, view] of patchedViews) { currentViews.set(path, json(view)); artifacts.set(path, json(view)) }
  const views = Object.fromEntries(Object.entries(batch.compositionViews).sort().map(([id, path]) => [id, digest(currentViews.get(path)!)]))
  for (const [id, path] of Object.entries(batch.compositionViews)) artifacts.set(`${generation}/views/${id}.view.json`, currentViews.get(path)!)
  const ledger = structuredClone(baselineLedger)
  for (const goal of source.goals) {
    const decision = ledger.decisions.find((entry: any) => entry.goalId === goal.id)
    if (decision) decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
    else {
      assert.ok(added.has(goal.id)); ledger.decisions.push({ goalId: goal.id, sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
        semanticKind: 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-practice-assessment' })
      ledger.counts.practiceAssessment++; ledger.counts.total++
    }
  }
  ledger.decisions.sort((a: any, b: any) => a.goalId.localeCompare(b.goalId))
  const definitions: any[] = []; const reviews: any[] = []; const entries: any[] = []
  for (const packet of batch.packets) {
    safe(packet.contractId); safe(packet.revision); unique(packet.ownGoalIds, 'own goal')
    assert.ok(packet.ownGoalIds.length || packet.requiredChildContractRefs.length, 'An empty aggregate requires explicit reviewed children')
    assert.ok(!source.programUnits.some(unit => unit.id === packet.programUnitId), 'Do not replace an existing source program unit')
    assert.ok(source.programUnits.some(unit => unit.id === packet.parentUnitId), 'Unknown program placement parent')
    const own = packet.ownGoalIds.map(id => { const goal = byId.get(id); assert.ok(goal && !goal.contains?.length, `Own must be atomic ${id}`); return goal })
    const ownKinds = Object.fromEntries(own.map(goal => [goal.id, resolvedKind(goal)]))
    const ownAssessmentGoalIds = own.filter(goal => resolvedKind(goal) === 'assessment').map(goal => goal.id)
    const ownRecallGoalIds = own.filter(goal => resolvedKind(goal) === 'memory').map(goal => goal.id)
    assert.equal(ownRecallGoalIds.length, 0, 'Recall packets require the reviewed locale selection adapter before emission')
    const ownOrientationGoalIds = own.filter(goal => resolvedKind(goal) === 'orientation').map(goal => goal.id)
    const ownOrdinaryGoalIds = own.filter(goal => resolvedKind(goal) === 'ordinary').map(goal => goal.id)
    const context = [...reachable(packet.ownGoalIds, relation)].sort()
    const atomicPrerequisites = Object.fromEntries(context.map(id => [id, relation[id]]))
    for (const id of context) assert.ok(!reachable(relation[id], relation).has(id), `Cyclic local atomic demand ${id}`)
    for (const [id, prerequisites] of Object.entries(atomicPrerequisites)) for (const prerequisite of prerequisites) {
      assert.ok(!reachable(prerequisites.filter(value => value !== prerequisite), atomicPrerequisites).has(prerequisite), `Nonminimal own context ${id}->${prerequisite}`)
    }
    unique(packet.requiredChildContractRefs.map(ref => `${ref.contractId}@${ref.revision}`), 'required child')
    const children = packet.requiredChildContractRefs.map(ref => {
      const definition = [...existingDefinitions, ...definitions].find(value => value.contractId === ref.contractId && value.revision === ref.revision)
      assert.ok(definition, `Missing child contract; order a batch child before its parent: ${ref.contractId}`)
      return definition.sourceBinding.programUnitId
    })
    const taskInputs: Record<string, any> = {}; const claims: Record<string, any> = {}; const tasks: Record<string, any> = {}
    assert.deepEqual(Object.keys(packet.assessmentClaims).sort(), [...ownAssessmentGoalIds].sort(), 'Every own Q requires exactly one static claim')
    for (const id of ownAssessmentGoalIds) {
      const exam = byId.get(id)!.examData!; assert.ok(exam.taskContent && exam.solutionContent && exam.scoring)
      assert.ok(!exam.taskContentEn && !exam.solutionContentEn, 'Translated tasks require independent variant attestations; never silently omit them')
      const covered = packet.assessmentClaims[id].coveredGoalIds
      unique(covered, 'covered goal'); assert.ok(covered.length)
      assert.deepEqual([...(exam.coveredGoalIds as string[] ?? [])].sort(), [...covered].sort(), 'Claim must match actual canonical assessment coverage')
      for (const a of covered) assert.ok(ownOrdinaryGoalIds.includes(a), `Claim outside direct ordinary Own ${a}`)
      const task = { taskContent: exam.taskContent, solutionContent: exam.solutionContent }
      const taskPath = `${prefix}/inputs/${packet.contractId}/${packet.revision}/${id}.task.json`
      const rubricPath = `${prefix}/inputs/${packet.contractId}/${packet.revision}/${id}.rubric.json`
      set(taskPath, task); set(rubricPath, exam.scoring); taskInputs[id] = { taskPath, rubricPath }
      claims[id] = { coveredGoalIds: covered, taskRevision: hash(task), rubricRevision: hash(exam.scoring), reviewRef: packet.reviewRef }
      tasks[id] = { task, rubric: exam.scoring }
    }
    const demands = Object.fromEntries(ownOrdinaryGoalIds.map(id => [id, ownAssessmentGoalIds.filter(q => reachable(relation[q], relation).has(id))]))
    for (const [id, consumers] of Object.entries(demands)) {
      assert.ok(consumers.length, `No own assessment demand for ${id}`)
      for (const q of consumers) assert.ok(claims[q].coveredGoalIds.includes(id), `Consumer ${q} lacks an explicit normal-pass claim for ${id}`)
    }
    const meanings = Object.fromEntries(own.map(goal => [goal.id, goalMeaning(goal)]))
    const definition = { schemaVersion: 1, semantics: 'global-unit-recognition-v1', contractId: packet.contractId, revision: packet.revision,
      sourceBinding: { landscapeId: source.landscapeId, programUnitId: packet.programUnitId, placementRevision: packet.placementRevision, compositionViewDigests: views },
      title: packet.title, promise: packet.promise, introduction: packet.introduction, ownGoalIds: packet.ownGoalIds,
      requiredChildContractRefs: packet.requiredChildContractRefs, ownAssessmentGoalIds, ownRecallGoalIds, ownOrientationGoalIds,
      ownGoalMeanings: meanings, ownResolvedKinds: ownKinds, ownGoalMeaningDigests: Object.fromEntries(Object.entries(meanings).map(([id, meaning]) => [id, hash(meaning)])),
      atomicPrerequisites, assessmentClaims: claims, reviewRef: packet.reviewRef }
    const provenanceInputs = Object.fromEntries(packet.additionalInputPaths.map(path => [path, digest(read(path))]))
    const reviewInput = { definition, normalTasksAndRubrics: tasks, localOwnDemandClasses: demands, provenanceInputs,
      ...(packet.scopeReview ? { authoringScopeReview: packet.scopeReview } : {}) }
    const reviewedInputSha256 = hash(reviewInput)
    let receiptBytes: string | undefined
    try { receiptBytes = read(packet.reviewReceiptPath) } catch (error) { if (!allowPendingReview) throw error }
    const receipt = receiptBytes === undefined ? undefined : JSON.parse(receiptBytes) as Receipt
    if (receipt) {
      assert.equal(receipt.schemaVersion, 1); assert.equal(receipt.semantics, 'learning-unit-content-review-v1')
      assert.equal(receipt.decision, 'approved'); assert.ok(receipt.independentReviewer?.trim())
      assert.equal(receipt.reviewedInputSha256, reviewedInputSha256, 'Review input drift')
      assert.equal(receipt.reviewPath, packet.reviewRef); assert.ok(read(`DE/Gymnasium/${packet.reviewRef}`).trim(), 'Missing independent review')
    } else assert.ok(allowPendingReview, 'Pending content cannot enter the runtime catalog')
    reviews.push({ contractId: packet.contractId, reviewedInputSha256, status: receipt ? 'receipt-verified' : 'pending-independent-review', reviewInput })
    source.programUnits.push({ id: packet.programUnitId, kind: 'module', label: packet.title.de, parentUnitId: packet.parentUnitId,
      learningUnit: { contractId: packet.contractId, revision: packet.revision, placementRevision: packet.placementRevision,
        requiredChildUnitIds: children, promise: packet.promise, introduction: packet.introduction } })
    for (const id of packet.ownGoalIds) source.goalPlacements.push({ goalId: id, unitId: packet.programUnitId,
      relation: ownAssessmentGoalIds.includes(id) ? 'assessed' : 'primary', acquisition: true })
    const contractPath = `${prefix}/contracts/${packet.contractId}/${packet.revision}.json`; set(contractPath, definition)
    entries.push({ path: contractPath, sha256: digest(json(definition)), status: 'active', sourceSnapshotPath: snapshotPath,
      inputs: {}, assessmentInputs: taskInputs, recallInputs: {}, packet })
    definitions.push(definition)
    const hierarchyOwners = new Set<string>(); const hierarchyUnits = new Set<string>()
    const visit = (current: any) => {
      const key = `${current.contractId}@${current.revision}`; assert.ok(!hierarchyUnits.has(key), `Repeated child acquisition path ${key}`); hierarchyUnits.add(key)
      for (const id of current.ownGoalIds) { assert.ok(!hierarchyOwners.has(id), `Repeated direct owner inside hierarchy ${id}`); hierarchyOwners.add(id) }
      for (const ref of current.requiredChildContractRefs) {
        const child = [...existingDefinitions, ...definitions].find(value => value.contractId === ref.contractId && value.revision === ref.revision)
        assert.ok(child); visit(child)
      }
    }
    visit(definition)
  }
  set(snapshotPath, { schemaVersion: 1, resolverRevision: 'completion-goal-kinds-v1', landscapes: [source], compositionViewDigests: views }); set(ledgerPath, ledger)
  for (const entry of entries) {
    const packet = entry.packet as Packet; delete entry.packet
    for (const path of [snapshotPath, ledgerPath, ...Object.values(entry.assessmentInputs).flatMap((value: any) => [value.taskPath, value.rubricPath]),
      ...Object.keys(batch.compositionViews).map(id => `${generation}/views/${id}.view.json`), `DE/Gymnasium/${packet.reviewRef}`, packet.reviewReceiptPath]) {
      if (allowPendingReview && [packet.reviewReceiptPath, `DE/Gymnasium/${packet.reviewRef}`].includes(path) && !receiptAvailable(path)) continue
      entry.inputs[path] = digest(artifacts.get(path) ?? read(path))
    }
    // Retain reviewed provenance, rather than binding future mutable task/QA source files.
    for (const originalPath of packet.additionalInputPaths) {
      const path = `${generation}/provenance/${originalPath}`; artifacts.set(path, read(originalPath)); entry.inputs[path] = digest(read(originalPath))
    }
  }
  // Existing source/task/review archives are never regenerated.
  for (const entry of existingCatalog.contracts) {
    assert.equal(digest(read(entry.path)), entry.sha256, `Existing immutable contract drift ${entry.path}`)
    for (const [path, sha] of Object.entries(entry.inputs)) assert.equal(digest(read(path)), sha, `Existing immutable input drift ${path}`)
    assert.ok(!entries.some(value => value.path === entry.path), 'Contract revisions are immutable; choose a new revision')
  }
  const catalog = { ...existingCatalog, contracts: [...existingCatalog.contracts, ...entries] }
  return { source, ledger, catalog, artifacts, reviews,
    proof: { schemaVersion: 1, generation: batch.generation, baselineRef: batch.baselineRef,
      originalGoalMeaningsPreserved: baseline.goals.length, originalAtomDemandClosuresPreserved: Object.keys(previous).length,
      newAssessmentGoalIds: [...added].sort(), removedRedundantRequires: batch.removeRedundantRequires,
      beforeReductionClosureSha256: hash(expected), afterReductionClosureSha256: hash(fullClosure(relation)),
      independentReviewPending: reviews.filter(value => value.status !== 'receipt-verified').map(value => value.contractId) } }
  function receiptAvailable(path: string) { if (artifacts.has(path)) return true; try { read(path); return true } catch { return false } }
}
