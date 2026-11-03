import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds, type CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { applyMathAssessmentScopeOperations, applyMathStageScopeRule, mathStageRuleForScope, selectReviewedMathTargetBuckets, assertKnownMathTargetSupport, type MathStageScopeRule, type MathAssessmentScopeOperation } from './mathStageScopePolicy'

const canonical = normalizeCanonicalLandscape({ landscapeId: 'fixture', title: 'Fixture', goals: [
  { id: 'lower', title: 'Lower', contains: ['rate', 'rule', 'theorem'], requires: [] },
  { id: 'upper', title: 'Upper', contains: ['tangent', 'other-cluster'], requires: [] },
  { id: 'other-cluster', title: 'Other cluster', contains: ['upper-only'], requires: ['inherited-context'] },
  { id: 'rate', title: 'Rate', contains: [], requires: ['context'] },
  { id: 'rule', title: 'Rule', contains: [], requires: ['rate'] },
  { id: 'theorem', title: 'Theorem', contains: [], requires: ['rule'] },
  { id: 'tangent', title: 'Tangent', contains: [], requires: ['rule'] },
  { id: 'upper-only', title: 'Upper only', contains: [], requires: ['theorem'] },
  { id: 'context', title: 'Context', contains: [], requires: [] },
  { id: 'inherited-context', title: 'Inherited context', contains: [], requires: ['context'] },
] })
const goals = new Map(canonical.goals.map(goal => [goal.id, goal]))
const view: CompositionView = { viewId: 'cross-stage', landscapeId: 'fixture', scope: { jurisdiction: 'DE-HH', schoolForm: 'Gymnasium', stage: 'CrossStage' }, rootNodes: [
  { kind: 'structure', id: 'math', label: 'Math', children: [
    { kind: 'structure', id: 'sek1', label: 'SekI', children: [{ kind: 'canonicalSubtree', goalId: 'lower' }] },
    { kind: 'structure', id: 'sek2', label: 'SekII', children: [{ kind: 'canonicalSubtree', goalId: 'upper' }] },
  ] },
  { kind: 'goalEntry', goalId: 'context', projectionRole: 'prerequisiteOnly' },
] }
const rule: MathStageScopeRule = { id: 'source-decision', jurisdiction: 'DE-HH', durationModels: ['G8'], deniedGoalIds: ['theorem', 'upper-only'],
  retainedGoalIds: ['rate', 'rule'], additionalTargetGoalIds: ['tangent'], relocateGoalIds: ['tangent'], sourceDecision: 'exact-primary-contracts' }
const original = structuredClone(view)
const originalCanonical = structuredClone(canonical)
const result = applyMathStageScopeRule(view, goals, rule, 'sek1', true)
assert.deepEqual(view, original, 'authoring transform must not mutate inputs')
assert.deepEqual(canonical, originalCanonical, 'contracts and requirements must remain unchanged')
assert.deepEqual(result.removedAtomicGoalIds, ['theorem'])
assert.deepEqual(result.addedAtomicGoalIds, [], 'relocation preserves the whole-PC target universe')
assert.deepEqual(result.relocatedGoalIds, ['tangent'])
const compiled = compileCompositionView(result.view, canonical)
assert(!compiled.findings.some(finding => finding.severity === 'error'), JSON.stringify(compiled.findings))
const paths: Record<string, string[][]> = {}
const walk = (nodes: typeof compiled.compiledRootNodes, path: string[] = []) => {
  for (const node of nodes) {
    if (node.sourceGoalId) (paths[node.sourceGoalId] ??= []).push(path)
    walk(node.children, [...path, node.sourceGoalId ?? node.runtimeId])
  }
}
walk(compiled.compiledRootNodes)
assert.equal(paths.tangent.length, 1)
assert(paths.tangent[0].includes('structure:sek1'), 'HH source-backed acquisition belongs in its actual stage/focus')
assert(paths['upper-only'][0].includes('structure:sek2'), 'a denied lower-stage contract must keep its independent existing upper-stage placement')
assert(!paths.theorem, 'a false lower-stage theorem target is not automatically promoted into upper secondary')
const parents = new Map<string, string[]>()
for (const goal of canonical.goals) for (const child of goal.contains ?? []) parents.set(child, [...(parents.get(child) ?? []), goal.id])
const support = (targetIds: Iterable<string>): Set<string> => {
  const found = new Set<string>()
  const visit = (id: string): void => {
    if (found.has(id)) return
    found.add(id)
    for (const required of goals.get(id)?.requires ?? []) visit(required)
    const ancestors = [...(parents.get(id) ?? [])]
    const seen = new Set<string>()
    while (ancestors.length) {
      const parent = ancestors.pop()!
      if (seen.has(parent)) continue
      seen.add(parent)
      for (const required of goals.get(parent)?.requires ?? []) visit(required)
      ancestors.push(...(parents.get(parent) ?? []))
    }
  }
  for (const id of targetIds) visit(id)
  return found
}
const atomicTargets = (nodes: CompositionView['rootNodes']) => [...collectCompositionProjectionRoleGoalIds(nodes, goals).targetGoalIds]
  .filter(id => !goals.get(id)?.contains?.length)
const beforeContext = support(atomicTargets(view.rootNodes))
const afterContext = support(atomicTargets(result.view.rootNodes))
assert.deepEqual(afterContext, beforeContext, 'real direct, indirect and inherited support survives the role correction')
for (const id of ['theorem', 'rule', 'rate', 'context', 'inherited-context']) assert(afterContext.has(id), `foreign consumer still demands ${id}`)
assert.deepEqual(applyMathStageScopeRule(result.view, goals, rule, 'sek1', true).view, result.view, 'role/placement authoring must be idempotent')

const masked = structuredClone(view)
masked.rootNodes.push({ kind: 'canonicalSubtree', goalId: 'rate', projectionRole: 'prerequisiteOnly' })
const maskRule = { ...rule, retainedGoalIds: ['rule'] }
const preserved = applyMathStageScopeRule(masked, goals, maskRule, 'sek1', true)
const roles = collectCompositionProjectionRoleGoalIds(preserved.view.rootNodes, goals)
assert(!roles.targetGoalIds.has('rate') && roles.prerequisiteOnlyGoalIds.has('rate'), 'splitting must not revive an outer support mask')
assert.deepEqual(preserved.view.rootNodes.find(node => node.kind === 'goalEntry' && node.goalId === 'context'), original.rootNodes[1])
const unsupportedSplit = new Map(goals)
unsupportedSplit.set('lower', { ...goals.get('lower')!, requires: ['context'] })
assert.throws(() => applyMathStageScopeRule(view, unsupportedSplit, rule, 'sek1', true), /inherited-requirement preservation/)
assert.throws(() => applyMathStageScopeRule(view, goals, rule, 'missing', true), /explicit stage anchor/)
assert.throws(() => applyMathStageScopeRule(view, goals, { ...rule, retainedGoalIds: ['upper-only'] }, 'sek1', true), /conflicting source role/)
assert.throws(() => applyMathStageScopeRule(view, goals, { ...rule, deniedGoalIds: ['theorem'], retainedGoalIds: ['upper-only'] }, 'sek1', true), /actual stage placement/)
const protectedGoals = new Map(goals)
protectedGoals.set('theorem', { ...goals.get('theorem')!, nodeKind: 'memory' })
assert.throws(() => applyMathStageScopeRule(view, protectedGoals, rule, 'sek1', true), /ordinary atomic stage contract/)
assert.throws(() => mathStageRuleForScope([rule, { ...rule, id: 'duplicate' }], 'DE-HH', ['G8']), /ambiguous/)
assert.throws(() => mathStageRuleForScope([rule], 'DE-HH', ['G8', 'G9']), /every/)
assert.throws(() => mathStageRuleForScope([rule, { ...rule, id: 'g9', durationModels: ['G9'], deniedGoalIds: [] }], 'DE-HH', ['G8', 'G9']), /separate output views/)
assert.throws(() => mathStageRuleForScope([rule, { ...rule, id: 'g9', durationModels: ['G9'], additionalTargetLabel: 'Another placement' }], 'DE-HH', ['G8', 'G9']), /separate output views/)
assert.equal(mathStageRuleForScope([rule], 'DE-OTHER', ['G8']), undefined)
const assessmentGoals = new Map(goals)
assessmentGoals.set('assessment', { id: 'assessment', title: 'Assessment', contains: [], requires: ['theorem'], nodeKind: 'exam', examData: { reviewStatus: 'released' } })
const assessmentView = structuredClone(view)
const mathRoot = assessmentView.rootNodes[0]
assert(mathRoot.kind === 'structure')
const lowerStage = mathRoot.children[0]
assert(lowerStage.kind === 'structure')
lowerStage.children.push({ kind: 'goalEntry', goalId: 'assessment' })
const excludedAssessment = applyMathAssessmentScopeOperations(assessmentView, assessmentGoals, [{ id: 'exact-task-scope', viewId: view.viewId,
  goalIds: ['assessment'], action: 'exclude-target', anchorStructureId: 'sek1', label: 'Assessment', sourceDecision: 'exact-independent-task-scope-review' }])
assert(!collectCompositionProjectionRoleGoalIds(excludedAssessment.rootNodes, assessmentGoals).targetGoalIds.has('assessment'))
assert.deepEqual(assessmentGoals.get('assessment')!.requires, ['theorem'], 'scope correction never erases a protected task contract or its true preparation')
const bundledGoals = new Map(assessmentGoals)
bundledGoals.set('assessment-bundle', { id: 'assessment-bundle', title: 'Assessments', contains: ['assessment', 'tangent'], requires: ['context'] })
const bundledView = structuredClone(view)
const bundledRoot = bundledView.rootNodes[0]
assert(bundledRoot.kind === 'structure' && bundledRoot.children[0].kind === 'structure')
bundledRoot.children[0].children.push({ kind: 'canonicalSubtree', goalId: 'assessment-bundle' })
const excludedBundle = applyMathAssessmentScopeOperations(bundledView, bundledGoals, [{ id: 'whole-view-task-exclusion', viewId: view.viewId,
  goalIds: ['assessment'], action: 'exclude-target', anchorStructureId: 'sek1', label: 'Assessment', sourceDecision: 'exact-independent-task-scope-review' }])
const excludedRoot = excludedBundle.rootNodes[0]
assert(excludedRoot.kind === 'structure' && excludedRoot.children[0].kind === 'structure')
assert(excludedRoot.children[0].children.some(node => node.kind === 'canonicalSubtree' && node.goalId === 'assessment-bundle'),
  'course-specific task exclusion preserves the same canonical cluster for a lossless GK/LK merge, including inherited requirements')
assert(!collectCompositionProjectionRoleGoalIds(excludedBundle.rootNodes, bundledGoals).targetGoalIds.has('assessment'))
const relocatedAssessment = applyMathAssessmentScopeOperations(assessmentView, assessmentGoals, [{ id: 'exact-task-upper', viewId: view.viewId,
  goalIds: ['assessment'], action: 'relocate-existing-target', anchorStructureId: 'sek2', label: 'Numerische Verfahren', sourceDecision: 'exact-independent-task-scope-review' }])
assert(collectCompositionProjectionRoleGoalIds(relocatedAssessment.rootNodes, assessmentGoals).targetGoalIds.has('assessment'))
assert.deepEqual(applyMathAssessmentScopeOperations(relocatedAssessment, assessmentGoals, [{ id: 'exact-task-upper', viewId: view.viewId,
  goalIds: ['assessment'], action: 'relocate-existing-target', anchorStructureId: 'sek2', label: 'Numerische Verfahren', sourceDecision: 'exact-independent-task-scope-review' }]), relocatedAssessment)
const pureUpperAssessment = applyMathAssessmentScopeOperations(view, assessmentGoals, [{ id: 'exact-task-upper-pendant', viewId: view.viewId,
  goalIds: ['assessment'], action: 'include-target', anchorStructureId: 'sek2', label: 'Numerische Verfahren', sourceDecision: 'exact-independent-task-scope-review' }])
assert(collectCompositionProjectionRoleGoalIds(pureUpperAssessment.rootNodes, assessmentGoals).targetGoalIds.has('assessment'))
assert.deepEqual(applyMathAssessmentScopeOperations(pureUpperAssessment, assessmentGoals, [{ id: 'exact-task-upper-pendant', viewId: view.viewId,
  goalIds: ['assessment'], action: 'include-target', anchorStructureId: 'sek2', label: 'Numerische Verfahren', sourceDecision: 'exact-independent-task-scope-review' }]), pureUpperAssessment)
assert.throws(() => applyMathAssessmentScopeOperations(view, assessmentGoals, [{ id: 'missing-selected-task', viewId: view.viewId,
  goalIds: ['assessment'], action: 'relocate-existing-target', anchorStructureId: 'sek2', label: 'Numerische Verfahren', sourceDecision: 'exact-independent-task-scope-review' }]), /existing selected target/)
assert.throws(() => applyMathAssessmentScopeOperations(view, assessmentGoals, [{ id: 'ordinary-is-not-task', viewId: view.viewId,
  goalIds: ['rate'], action: 'include-target', anchorStructureId: 'sek2', label: 'Numerische Verfahren', sourceDecision: 'exact-independent-task-scope-review' }]), /separate source\/scope decision/)
assert.throws(() => applyMathAssessmentScopeOperations(view, protectedGoals, [{ id: 'bad-memory-scope', viewId: view.viewId, goalIds: ['theorem'],
  action: 'exclude-target', anchorStructureId: 'sek1', label: 'Memory', sourceDecision: 'not-an-assessment' }]), /separate source\/scope decision/)
const directTaskOperation = { id: 'direct-reviewed-task', viewId: view.viewId, goalIds: ['assessment'], action: 'include-target' as const,
  anchorStructureId: 'sek2', label: 'Assessment', sourceDecision: 'exact-independent-task-scope-review', directReference: true }
const directTaskView = applyMathAssessmentScopeOperations(view, assessmentGoals, [directTaskOperation])
const directRoot = directTaskView.rootNodes[0]
assert(directRoot.kind === 'structure' && directRoot.children[1].kind === 'structure')
assert.deepEqual(directRoot.children[1].children.at(-1), { kind: 'goalEntry', goalId: 'assessment', projectionRole: 'target' }, 'exact reviewed direct reference must preserve its existing parent without an invented wrapper')
assert.deepEqual(applyMathAssessmentScopeOperations(directTaskView, assessmentGoals, [directTaskOperation]), directTaskView)
console.log('PASS: precise stage pruning, preserved upper-stage targets, one-parent relocation, complete masks and no inferred stage/mastery')

// Correcting preparation must never enroll the support atom as curriculum work.
const selectionOptions = {
  jurisdiction: 'DE-HH', durationModel: 'G8', buckets: { lower: ['theorem'] },
  additionalTargetGoalIds: ['rule'], bucketForGoal: () => 'lower' as const,
}
const selected = selectReviewedMathTargetBuckets({ ...selectionOptions, goals })
assert.deepEqual(selected, { lower: ['rule', 'theorem'] })
assert(!selected.lower.includes('context'), 'true support without an author reference stays outside the target set')
assertKnownMathTargetSupport(selected.lower, goals)
const correctedPreparation = new Map(goals)
correctedPreparation.set('theorem', { ...goals.get('theorem')!, requires: ['upper-only', 'inherited-context'] })
assert.deepEqual(selectReviewedMathTargetBuckets({ ...selectionOptions, goals: correctedPreparation }), selected,
  'direct, indirect, inherited and out-of-stage preparation changes leave the explicit target set unchanged')
assertKnownMathTargetSupport(selected.lower, correctedPreparation)
const unknownSupport = new Map(correctedPreparation)
unknownSupport.set('inherited-context', { ...goals.get('inherited-context')!, requires: ['missing-support'] })
assert.throws(() => assertKnownMathTargetSupport(selected.lower, unknownSupport), /missing canonical support goal missing-support/)
const unknownInherited = new Map(goals)
unknownInherited.set('lower', { ...goals.get('lower')!, requires: ['missing-inherited-support'] })
assert.throws(() => assertKnownMathTargetSupport(selected.lower, unknownInherited), /missing canonical support goal missing-inherited-support/)
assert.throws(() => selectReviewedMathTargetBuckets({ ...selectionOptions, goals, additionalTargetGoalIds: ['unknown'] }), /unknown selected target/)
assert.throws(() => selectReviewedMathTargetBuckets({ ...selectionOptions, goals, blockedTargetGoalIds: new Set(['rule']) }), /blocked by the reviewed layout/)
assert.deepEqual(selectReviewedMathTargetBuckets({ ...selectionOptions, goals, excludedGoalIds: new Set(['rule']) }), { lower: ['theorem'] })
console.log('PASS: source-selected targets are invariant under requirement mutations; canonical support remains known without author references')

const explicitSourceRule = { ...rule, id: 'explicit-source-only', durationModels: [] }
const g8Rule = { ...rule, id: 'explicit-g8', durationModels: ['G8'] }
const g9Rule = { ...rule, id: 'explicit-g9', durationModels: ['G9'] }
assert.equal(mathStageRuleForScope([explicitSourceRule, g8Rule, g9Rule], 'DE-HH', ['G8'])?.id, 'explicit-g8')
assert.equal(mathStageRuleForScope([explicitSourceRule, g8Rule, g9Rule], 'DE-HH', ['G9'])?.id, 'explicit-g9')
assert.equal(mathStageRuleForScope([explicitSourceRule], 'DE-HH', ['G8']), undefined, 'an explicitly referenced source-layout rule is never a duration fallback')
assert.throws(() => mathStageRuleForScope([explicitSourceRule, g8Rule, { ...g8Rule, id: 'ambiguous-g8' }], 'DE-HH', ['G8']), /ambiguous/)
assert.throws(() => mathStageRuleForScope([explicitSourceRule, g8Rule, { ...g9Rule, additionalTargetGoalIds: [] }], 'DE-HH', ['G8', 'G9']), /separate output views/)
const progressiveGoals = new Map(goals)
progressiveGoals.set('new-lower', { id: 'new-lower', title: 'New lower target', contains: [], requires: ['context'] })
const firstAddition = applyMathStageScopeRule(view, progressiveGoals, { ...rule, additionalTargetGoalIds: ['tangent'], relocateGoalIds: ['tangent'] }, 'sek1', true).view
const nextAddition = applyMathStageScopeRule(firstAddition, progressiveGoals, { ...rule, additionalTargetGoalIds: ['tangent', 'new-lower'], relocateGoalIds: ['tangent'] }, 'sek1', true).view
assert(!compileCompositionView(nextAddition, { ...canonical, goals: [...progressiveGoals.values()] }).findings.some(f=>f.severity==='error'), 'sequential explicit stage additions reuse one authored container')
assert.deepEqual(applyMathStageScopeRule(nextAddition, progressiveGoals, { ...rule, additionalTargetGoalIds: ['tangent', 'new-lower'], relocateGoalIds: ['tangent'] }, 'sek1', true).view, nextAddition)
console.log('PASS: exact duration selection rejects ambiguity and never falls back to generic source layouts')


// The optional exact exam slot is an authoring transform, not another result
// state or a rule that promotes every prerequisite into the target set.
const slotGroups = new Set<number>()
let slotChecks = 0
const slotStable = (value: unknown): unknown => Array.isArray(value) ? value.map(slotStable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, child]) => [key, slotStable(child)])) : value
const slotHash = (value: unknown) => createHash('sha256').update(JSON.stringify(slotStable(value))).digest('hex')
type SlotGoal = { id: string; title?: string; contains: string[]; requires: string[]; nodeKind?: string; examData?: { reviewStatus?: string; coveredGoalIds?: string[] } }
const slotGoals = new Map<string, SlotGoal>([
  ['method-a', { id: 'method-a', contains: [], requires: ['hidden-0'] }],
  ['method-b', { id: 'method-b', contains: [], requires: ['hidden-1'] }],
  ['methods', { id: 'methods', contains: ['method-a', 'method-b'], requires: [] }],
  ['old-a', { id: 'old-a', contains: [], requires: [] }],
  ['old-b', { id: 'old-b', contains: [], requires: [] }],
  ['old-exams', { id: 'old-exams', contains: ['old-a', 'old-b'], requires: [] }],
  ['task', { id: 'task', contains: [], requires: ['method-a', 'method-b'], nodeKind: 'exam', examData: { reviewStatus: 'released', coveredGoalIds: ['method-a', 'method-b'] } }],
  ['foreign-subtree', { id: 'foreign-subtree', contains: ['task'], requires: [] }],
])
for (let i = 0; i < 10; i++) slotGoals.set(`hidden-${i}`, { id: `hidden-${i}`, contains: [], requires: i < 9 ? [`hidden-${i + 1}`] : [], ...(i === 5 ? { nodeKind: 'memory' } : {}) })
const slotView = (structure: boolean): CompositionView => ({
  viewId: structure ? 'he-g8-fixture' : 'he-g9-fixture', landscapeId: 'fixture',
  scope: { jurisdiction: 'DE-HE', schoolForm: 'Gymnasium', stage: 'SekI', durationModel: structure ? 'G8' : 'G9' },
  rootNodes: [
    ...Array.from({ length: 10 }, (_, i) => ({ kind: 'goalEntry' as const, goalId: `hidden-${i}`, projectionRole: 'prerequisiteOnly' as const })),
    { kind: 'structure', id: 'year', label: structure ? 'Year 8' : 'Year 9', children: [
      { kind: 'canonicalSubtree', goalId: 'methods' },
      structure ? { kind: 'structure', id: 'existing-exams', label: 'Exams', children: [{ kind: 'canonicalSubtree', goalId: 'old-exams' }] }
        : { kind: 'canonicalSubtree', goalId: 'old-exams', displayLabel: 'Exams' },
    ] },
  ],
})
const slotYear = (v: CompositionView) => {
  const year = v.rootNodes.find(node => node.kind === 'structure' && node.id === 'year')
  assert(year?.kind === 'structure')
  return year
}
const slotOperation = (v: CompositionView): MathAssessmentScopeOperation => {
  const year = slotYear(v), reference = structuredClone(year.children[1])
  const after = structuredClone(year)
  const entry = { kind: 'goalEntry' as const, goalId: 'task', projectionRole: 'target' as const }
  after.children[1] = reference.kind === 'structure' ? { ...reference, children: [...reference.children, entry] }
    : { kind: 'structure', id: 'new-exam-wrapper', label: 'Exams', children: [reference, entry] }
  return { id: 'fixture-explicit-decision', viewId: v.viewId, action: 'include-target', anchorStructureId: 'year', label: 'Exams', sourceDecision: 'fixture-independent-placement', goalIds: ['task'],
    exactExamSlot: { expectedScope: structuredClone(v.scope), childIndex: 1, expectedReference: reference,
      beforeAnchorObjectSha256: slotHash(year), afterAnchorObjectSha256: slotHash(after),
      ...(reference.kind === 'canonicalSubtree' ? { wrapperStructureId: 'new-exam-wrapper' } : {}) } }
}
const slotApply = (v: CompositionView, g: Map<string, SlotGoal>, op: MathAssessmentScopeOperation): CompositionView => {
  const beforeView = structuredClone(v), beforeGoals = structuredClone([...g]), beforeOp = structuredClone(op)
  try { slotChecks++; return applyMathAssessmentScopeOperations(v, g, [op]) }
  finally { assert.deepEqual(v, beforeView, 'Input unchanged on success and failure'); assert.deepEqual([...g], beforeGoals, 'Goalmap unchanged on success and failure'); assert.deepEqual(op, beforeOp, 'Operation unchanged') }
}
const slotReject = (v: CompositionView, g: Map<string, SlotGoal>, op: MathAssessmentScopeOperation, pattern = /Mathematics stage scope:/) => assert.throws(() => slotApply(v, g, op), pattern)
const g8 = slotView(true), g9 = slotView(false), g8op = slotOperation(g8), g9op = slotOperation(g9)
const g8after = slotApply(g8, slotGoals, g8op), g9after = slotApply(g9, slotGoals, g9op)
const g8ref = slotYear(g8).children[1], g8new = slotYear(g8after).children[1], g9new = slotYear(g9after).children[1]
assert(g8ref.kind === 'structure' && g8new.kind === 'structure')
assert.deepEqual(g8new.children.slice(0, -1), g8ref.children)
assert.deepEqual(g8new.children.at(-1), { kind: 'goalEntry', goalId: 'task', projectionRole: 'target' }); slotGroups.add(1)
assert(g9new.kind === 'structure'); assert.deepEqual(g9new.children[0], slotYear(g9).children[1]); assert.equal(g9new.children.length, 2); slotGroups.add(2)
assert.deepEqual(slotApply(g8after, slotGoals, g8op), g8after)
assert.deepEqual(slotApply(g9after, slotGoals, g9op), g9after); slotGroups.add(3)
for (const [beforeView, afterView] of [[g8, g8after], [g9, g9after]]) {
  const a = collectCompositionProjectionRoleGoalIds(beforeView.rootNodes, slotGoals), b = collectCompositionProjectionRoleGoalIds(afterView.rootNodes, slotGoals)
  assert.deepEqual([...b.targetGoalIds].sort(), [...a.targetGoalIds, 'task'].sort())
  assert.deepEqual([...b.prerequisiteOnlyGoalIds].sort(), [...a.prerequisiteOnlyGoalIds].sort())
  for (let i = 0; i < 10; i++) assert(!b.targetGoalIds.has(`hidden-${i}`) && b.prerequisiteOnlyGoalIds.has(`hidden-${i}`))
}
slotGroups.add(4)
for (const scope of [{ ...g9.scope, durationModel: 'G8' }, { ...g9.scope, courseProfile: 'GK' }, { schoolForm: 'Gymnasium', stage: 'SekI' }]) slotReject({ ...g9, scope }, slotGoals, g9op, /exact scope/)
for (const scope of [{ schoolForm: 'Gymnasium', stage: 'SekI' }, { schoolForm: 'Gymnasium', stage: 'CrossStage', courseProfile: 'GK' }]) {
  const neutral = { ...g9, scope }, op = slotOperation({ ...g9, scope })
  const result = slotApply(neutral, slotGoals, op)
  assert.deepEqual(result.scope, scope)
  assert.deepEqual(slotApply(result, slotGoals, op), result)
  slotReject({ ...result, scope: { ...scope, jurisdiction: 'DE-HE' } }, slotGoals, op, /exact scope/)
  slotReject({ ...result, scope: { ...scope, durationModel: undefined } as unknown as Record<string, string> }, slotGoals, op, /exact scope/)
}
slotGroups.add(5)
for (const duplicate of [false, true]) {
  const v = structuredClone(g9)
  if (duplicate) v.rootNodes.push(structuredClone(slotYear(v)))
  else v.rootNodes = v.rootNodes.filter(node => node.kind !== 'structure')
  slotReject(v, slotGoals, g9op, /anchor/)
}
slotGroups.add(6)
for (const index of [-1, 0.5, 20, Number.NaN]) { const op = structuredClone(g9op); op.exactExamSlot!.childIndex = index; slotReject(g9, slotGoals, op, /slot/) }
slotGroups.add(7)
for (const mutation of ['reference', 'sibling', 'order', 'hash']) {
  const v = structuredClone(g9), op = structuredClone(g9op)
  if (mutation === 'reference') (slotYear(v).children[1] as { displayLabel: string }).displayLabel += '!'
  if (mutation === 'sibling') slotYear(v).children[0] = { kind: 'goalEntry', goalId: 'method-a' }
  if (mutation === 'order') slotYear(v).children.reverse()
  if (mutation === 'hash') op.exactExamSlot!.beforeAnchorObjectSha256 = '0'.repeat(64)
  slotReject(v, slotGoals, op, /drifted|reconstructed/)
}
// Object key order is immaterial; array order is part of the contract.
const reordered = structuredClone(g9op)
reordered.exactExamSlot!.expectedReference = { displayLabel: 'Exams', goalId: 'old-exams', kind: 'canonicalSubtree' }
assert.deepEqual(slotApply(g9, slotGoals, reordered), g9after); slotGroups.add(8)
for (const applied of [false, true]) { const op = structuredClone(g9op); op.exactExamSlot!.afterAnchorObjectSha256 = '1'.repeat(64); slotReject(applied ? g9after : g9, slotGoals, op, /after|drifted/) }
const badAfter = structuredClone(g9after); (slotYear(badAfter).children[1] as { children: unknown[] }).children.reverse(); slotReject(badAfter, slotGoals, g9op, /drifted/)
const maskedAfter = structuredClone(g9after); maskedAfter.rootNodes.push({ kind: 'goalEntry', goalId: 'method-a', projectionRole: 'prerequisiteOnly' }); slotReject(maskedAfter, slotGoals, g9op, /required\/covered/)
slotGroups.add(9)
for (const v of [g9, g9after]) { const duplicate = structuredClone(v); duplicate.rootNodes.push({ kind: 'structure', id: 'new-exam-wrapper', label: 'Duplicate', children: [] }); slotReject(duplicate, slotGoals, g9op, /wrapper identity/) }
slotGroups.add(10)
for (const v of [g9, g9after]) for (const kind of ['goalEntry', 'canonicalSubtree'] as const) {
  const duplicate = structuredClone(v); duplicate.rootNodes.push({ kind, goalId: kind === 'goalEntry' ? 'task' : 'foreign-subtree' })
  slotReject(duplicate, slotGoals, g9op, /outside the reviewed slot/)
}
slotGroups.add(11)
for (const mutation of ['action', 'direct', 'multiple', 'kind']) {
  const op = structuredClone(g9op)
  if (mutation === 'action') op.action = 'exclude-target'
  if (mutation === 'direct') op.directReference = true
  if (mutation === 'multiple') op.goalIds = ['task', 'task']
  if (mutation === 'kind') op.exactExamSlot!.expectedReference = { kind: 'goalEntry', goalId: 'old-a' }
  slotReject(g9, slotGoals, op, /action|unsupported/)
}
slotGroups.add(12)
for (const mutation of ['unreleased', 'nonassessment', 'memory', 'unknown', 'requires', 'coverage', 'emptyRequires', 'emptyCoverage']) {
  const changed = structuredClone(slotGoals), task = changed.get('task')!
  if (mutation === 'unreleased') task.examData!.reviewStatus = 'draft'
  if (mutation === 'nonassessment') { delete task.examData; delete task.nodeKind }
  if (mutation === 'memory') task.nodeKind = 'memory'
  if (mutation === 'unknown') changed.delete('task')
  if (mutation === 'requires') task.requires = ['missing']
  if (mutation === 'coverage') task.examData!.coveredGoalIds = ['missing']
  if (mutation === 'emptyRequires') task.requires = []
  if (mutation === 'emptyCoverage') task.examData!.coveredGoalIds = []
  slotReject(g9, changed, g9op)
}
slotGroups.add(13)
for (const missing of ['method-a', 'method-b']) for (const masked of [false, true]) {
  const v = structuredClone(g9), changed = structuredClone(slotGoals)
  if (masked) v.rootNodes.push({ kind: 'goalEntry', goalId: missing, projectionRole: 'prerequisiteOnly' })
  else changed.get('methods')!.contains = changed.get('methods')!.contains.filter(id => id !== missing)
  slotReject(v, changed, g9op, /required\/covered/)
}
// One actual method is valid too (Mono): no hard-coded two-method count.
const single = structuredClone(slotGoals); single.get('task')!.requires = ['method-a']; single.get('task')!.examData!.coveredGoalIds = ['method-a']
assert.deepEqual(slotApply(g9, single, g9op), g9after); slotGroups.add(14)
const unrelated = structuredClone(slotGoals); unrelated.set('new-unrelated', { id: 'new-unrelated', contains: [], requires: [] })
unrelated.get('hidden-9')!.title = 'Unrelated metadata update'
assert.deepEqual(slotApply(g9, unrelated, g9op), g9after); slotGroups.add(15)
// Reaching this point also executed every pre-existing direct include, mask,
// source-stage, duration and support fixture above with the candidate helper.
slotGroups.add(16)
assert.deepEqual([...slotGroups].sort((a, b) => a - b), Array.from({ length: 16 }, (_, i) => i + 1))
console.log(JSON.stringify({ status: 'PASS', exactExamSlotFixtureGroups: slotGroups.size, checkedApplicationsIncludingRejectedCases: slotChecks, neutralAllScopes: 2, hiddenSupportNodesNeverPromoted: 10, legacyFixturesExecuted: true }))
