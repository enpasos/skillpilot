import { applyContextualTerminalPlacements } from './mathContextualTerminalPlacements'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionCanonicalSubtreeNode,
  type CompositionGoalEntryNode,
  type CompositionView,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import type { CanonicalAuthoringLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { parseSemanticKindLedger } from './lib/semanticKindLedger'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { addReviewedMathStageTargets, applyMathAssessmentScopeOperations, applyMathStageScopeRule, mathStageRuleForScope,
  relocateReviewedMathStageTargets, type MathAssessmentScopeOperation, type MathStageScopeRule } from './mathStageScopePolicy'

export type BoundStageFile = { path: string; sha256: string }
type SecondaryTarget = { goalId: string; view: BoundStageFile }
type FragmentCorrection = {
  parentStructureId: string; expectedReference: CompositionViewNode; replacementNodes: CompositionViewNode[]; sourceDecisionIds: string[]
}
type Source = {
  view: BoundStageFile; viewId: string; courseProfile: 'GK' | 'LK'; rootStructureId: string
  mainStageId: string; supplementIds: string[]; secondaryStructureIds: string[]; secondaryTargets: SecondaryTarget[]
  corrections: FragmentCorrection[]; addedSupplementReferences: Array<{ parentStructureId: string; node: CompositionViewNode; sourceDecisionIds: string[]; relocationLabel: string }>
  expectedRemovedTargetGoalIds: string[]; expectedAddedTargetGoalIds: string[]
}
type Country = {
  jurisdiction: string; outputPath: string; outputViewId: string; offeredDurationModels: string[]; sources: Source[]
}
type SourceDecision = {
  id: string; jurisdiction: string; goalId: string; contractSha256: string; disposition: string
  rationale: string; primary: Array<BoundStageFile & { pdfPagesOneBased: number[] }>
}
type SourceDecisions = { schemaVersion: number; decisions: SourceDecision[] }
type ExistingStageView = {
  source: BoundStageFile; outputPath: string; outputViewId: string; scope: CompositionView['scope']
  ruleId?: string; stageAnchorId?: string
  relocations: Array<{ goalIds: string[]; anchorStructureId: string; sourceDecisionId: string; label: string }>
  upperPlacements: Array<{ goalIds: string[]; anchorStructureId: string; sourceDecisionId: string; label: string }>
}
export type StagePolicy = {
  schemaVersion: number; kind: string; canonical: BoundStageFile; nativeCompiler: BoundStageFile
  nativeCanonicalHelper: BoundStageFile; stageDecision: BoundStageFile; sourceBindings: BoundStageFile[]
  nativeStageHelper: BoundStageFile; stageRules: MathStageScopeRule[]; stageDecisionBindings: BoundStageFile[]
  existingStageViews: ExistingStageView[]
  authoredAssessmentViews?: Array<{ source: BoundStageFile; outputPath: string; outputViewId: string; scope: CompositionView['scope'] }>
  durationGenerator: BoundStageFile; durationOutputViewIds: string[]; reviewReceiptPath?: string
  assessmentScopeOperations: MathAssessmentScopeOperation[]
  sourceDecisions: BoundStageFile; variantRegistry: BoundStageFile
  variantSelections: Array<{
    selection: BoundStageFile; contentReview: BoundStageFile; placementReview: BoundStageFile
    variantGoalId: string; originalGoalId: string; existingTargetViewIds: string[]; addedTargetViewIds: string[]
  }>
  countries: Country[]
  openScopeHolds: Array<{ goalId: string; jurisdictions: string[]; reason: string }>
}

/** Explicit corrections/duration variants of authored existing stage views. */
export function deriveMathExistingStageViews(root: string, policy: StagePolicy) {
  const { canonical, goals, decisions, semanticKindByGoalId } = assertMathStagePolicyInputs(root, policy)
  return policy.existingStageViews.map(operation => {
    localPath(root, operation.outputPath)
    expect(operation.outputPath.startsWith('curricula/DE/Gymnasium/composition-views/mathematik/') && operation.outputPath.endsWith('.view.json'), 'invalid existing output destination')
    let view = boundJson<CompositionView>(root, operation.source)
    expect(view.landscapeId === '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced' && view.scope.jurisdiction === operation.scope.jurisdiction,
      'existing stage view jurisdiction/landscape mismatch')
    expect(view.scope.stage === operation.scope.stage && view.scope.courseProfile === operation.scope.courseProfile, 'existing stage/course identity changed')
    const beforeRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
    const source = policy.countries.flatMap(country => country.sources).find(candidate => candidate.view.path === operation.source.path)
    if (source) view = correctSourceFragments(view, source, decisions, goals).view
    view = { ...view, viewId: operation.outputViewId, scope: structuredClone(operation.scope) }
    for (const relocation of operation.relocations) {
      view = relocateReviewedMathStageTargets(view, goals, relocation.goalIds, relocation.anchorStructureId, relocation.sourceDecisionId, relocation.label)
    }
    let stageAudit: ReturnType<typeof applyMathStageScopeRule> | undefined
    if (operation.ruleId) {
      const rule = policy.stageRules.find(candidate => candidate.id === operation.ruleId)
      expect(rule && operation.stageAnchorId && rule.jurisdiction === view.scope.jurisdiction, 'existing stage view lacks exact source rule/anchor')
      stageAudit = applyMathStageScopeRule(view, goals, rule, operation.stageAnchorId!, view.scope.stage === 'CrossStage', semanticKindByGoalId)
      view = stageAudit.view as CompositionView
    }
    for (const placement of operation.upperPlacements) {
      view = addReviewedMathStageTargets(view, goals, placement.goalIds, placement.anchorStructureId, placement.sourceDecisionId, placement.label)
    }
    view = applyMathAssessmentScopeOperations(view, goals, policy.assessmentScopeOperations)
    view = applyContextualTerminalPlacements(view, goals, root)
    const compiled = compileCompositionView(view, canonical)
    expect(!compiled.findings.some(finding => finding.severity === 'error'), `existing stage correction fails native compilation: ${view.viewId}`)
    const afterRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
    const atomic = (ids: Iterable<string>) => sorted([...ids].filter(id => !goals.get(id)?.contains?.length))
    return { path: operation.outputPath, view, stageAudit: stageAudit ? { ...stageAudit, view: undefined } : undefined,
      removedAtomicGoalIds: atomic([...beforeRoles.targetGoalIds].filter(id => !afterRoles.targetGoalIds.has(id))),
      addedAtomicGoalIds: atomic([...afterRoles.targetGoalIds].filter(id => !beforeRoles.targetGoalIds.has(id))),
      compiledGoalIds: sorted(occurrences(compiled.compiledRootNodes).map(occurrence => occurrence.goalId)) }
  })
}
/** Explicitly bound existing authored views use the same assessment operation and role compiler. */
export function deriveMathAuthoredAssessmentViews(root: string, policy: StagePolicy) {
  const { canonical, goals } = assertMathStagePolicyInputs(root, policy)
  const materializedIds = new Set([...policy.countries.map(view => view.outputViewId), ...policy.existingStageViews.map(view => view.outputViewId), ...policy.durationOutputViewIds])
  const ids = new Set<string>()
  return (policy.authoredAssessmentViews ?? []).map(operation => {
    expect(!materializedIds.has(operation.outputViewId) && !ids.has(operation.outputViewId), 'duplicate authored assessment view')
    ids.add(operation.outputViewId)
    localPath(root, operation.outputPath)
    expect(operation.outputPath.startsWith('curricula/DE/Gymnasium/composition-views/mathematik/') && operation.outputPath.endsWith('.view.json'), 'invalid authored assessment output')
    let view = boundJson<CompositionView>(root, operation.source)
    expect(view.viewId === operation.outputViewId && view.landscapeId === canonical.landscapeId && same(view.scope, operation.scope), 'authored assessment view identity/scope changed')
    view = applyContextualTerminalPlacements(applyMathAssessmentScopeOperations(view, goals, policy.assessmentScopeOperations), goals, root)
    const compiled = compileCompositionView(view, canonical)
    expect(!compiled.findings.some(finding => finding.severity === 'error'), `authored assessment view compile failed: ${view.viewId}`)
    return { path: operation.outputPath, view }
  })
}
export type StageReviewReceipt = {
  verdict: string; authorIndependent: boolean; policySha256: string; sourceDecisionsSha256: string
  generatorSha256: string; approvedViewIds: string[]; approvedSourceDecisionIds: string[]
  approvedStageRuleIds: string[]
  approvedAssessmentScopeOperationIds: string[]
  approvedVariantExtensions: Array<{ variantGoalId: string; addedTargetViewIds: string[] }>
}

const policyPath = 'app/scripts/config/math-country-seki-stage-policy.json'
const generatorPath = 'app/scripts/generateMathCountrySekICompositionViews.ts'
const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable)
  : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([key, entry]) => [key, stable(entry)])) : value
const same = (left: unknown, right: unknown) => JSON.stringify(stable(left)) === JSON.stringify(stable(right))
const sorted = (ids: Iterable<string>) => [...new Set(ids)].sort()
function fail(message: string): never { throw new Error(`Mathematics SekI stage policy: ${message}`) }
const expect = (condition: unknown, message: string): void => { if (!condition) fail(message) }
const localPath = (root: string, path: string): string => {
  const absolute = resolve(root, path)
  const local = relative(root, absolute)
  if (isAbsolute(path) || isAbsolute(local) || local.split(/[\\/]/).includes('..')) fail('binding leaves repository')
  return absolute
}
const checked = (root: string, binding: BoundStageFile): string => {
  const bytes = readFileSync(localPath(root, binding.path))
  expect(digest(bytes) === binding.sha256, `STALE_INPUT ${binding.path}`)
  return bytes.toString('utf8')
}
const boundJson = <T>(root: string, binding: BoundStageFile): T => JSON.parse(checked(root, binding)) as T
const targetReferences = (nodes: CompositionViewNode[], id: string): CompositionViewNode[] => nodes.flatMap(node =>
  node.kind === 'structure' ? targetReferences(node.children, id)
    : node.kind !== 'landscapeEntry' && node.goalId === id && node.projectionRole !== 'prerequisiteOnly' ? [node] : [])
const structures = (nodes: CompositionViewNode[], id: string): Extract<CompositionViewNode, { kind: 'structure' }>[] => nodes.flatMap(node =>
  node.kind === 'structure' ? [...(node.id === id ? [node] : []), ...structures(node.children, id)] : [])

/** Exact before/after references make the authored source correction idempotent. */
function correctSourceFragments(
  input: CompositionView, source: Source, decisions: SourceDecisions,
  goals: ReadonlyMap<string, CanonicalAuthoringLandscape['goals'][number]>,
) {
  let corrected = structuredClone(input)
  let applied = 0
  const decisionIds = new Set(decisions.decisions.filter(decision => decision.jurisdiction === input.scope.jurisdiction).map(decision => decision.id))
  const correctionParent = (id: string, ids: string[]) => {
    expect(source.supplementIds.includes(id), 'correction must name an explicitly imported supplement')
    expect(ids.length && ids.every(decisionId => decisionIds.has(decisionId)), 'correction lacks bounded source decisions')
    const parents = structures(corrected.rootNodes, id)
    expect(parents.length === 1, 'ambiguous correction parent')
    return parents[0]
  }
  for (const correction of source.corrections) {
    const parent = correctionParent(correction.parentStructureId, correction.sourceDecisionIds)
    const matches = parent.children.flatMap((node, index) => same(node, correction.expectedReference) ? [index] : [])
    expect(matches.length <= 1, 'ambiguous source correction reference')
    if (matches.length) { parent.children.splice(matches[0], 1, ...structuredClone(correction.replacementNodes)); applied++ }
    else expect(correction.replacementNodes.every(replacement => parent.children.filter(node => same(node, replacement)).length === 1), 'exact source before/after correction reference changed')
  }
  for (const addition of source.addedSupplementReferences) {
    const parent = correctionParent(addition.parentStructureId, addition.sourceDecisionIds)
    expect(addition.node.kind !== 'structure' && addition.node.kind !== 'landscapeEntry', 'explicit atomic addition required')
    const reference = addition.node as CompositionGoalEntryNode
    if (!collectCompositionProjectionRoleGoalIds([parent], goals).targetGoalIds.has(reference.goalId)) {
      parent.children.push(structuredClone(addition.node)); applied++
    }
    // A reviewed narrow goal may already have an upper-stage alias. Move that
    // exact identity into the actual lower-stage supplement, with one parent.
    corrected = relocateReviewedMathStageTargets(corrected, goals, [reference.goalId], addition.parentStructureId,
      `supplement-${input.scope.jurisdiction.toLowerCase()}-${reference.goalId}`,
      addition.relocationLabel)
  }
  const roots = structures(corrected.rootNodes, source.rootStructureId)
  expect(roots.length === 1, 'missing exact source root')
  const main = roots[0].children.find(node => node.kind === 'structure' && node.id === source.mainStageId)
  expect(main?.kind === 'structure', 'missing exact main stage fragment')
  if (main?.kind !== 'structure') fail('missing main stage')
  for (const id of source.supplementIds) {
    const top = roots[0].children.filter(node => node.kind === 'structure' && node.id === id)
    if (top.length) {
      expect(top.length === 1 && !structures(main.children, id).length, 'ambiguous supplement placement')
      roots[0].children = roots[0].children.filter(node => !(node.kind === 'structure' && node.id === id))
      main.children.push(top[0])
    } else expect(main.children.filter(node => node.kind === 'structure' && node.id === id).length === 1, 'reviewed supplement is not at its exact stage parent')
  }
  return { view: corrected, applied }
}

// Numeric compiler reference prefixes are ephemeral; retain the complete stable
// structure/goal parent chain and authored order instead.
const occurrences = (nodes: CompiledCompositionPreviewNode[], path: string[] = []): Array<{ goalId: string; path: string[] }> =>
  nodes.flatMap(node => {
    const key = node.sourceGoalId ? `goal:${node.sourceGoalId}` : node.runtimeId
    return [...(node.sourceGoalId ? [{ goalId: node.sourceGoalId, path: [...path, key] }] : []),
      ...occurrences(node.children, [...path, key])]
  })

/** The same exact bound inputs govern both country and duration materialization. */
export function assertMathStagePolicyInputs(root: string, policy: StagePolicy) {
  expect(policy.schemaVersion === 1 && policy.kind === 'explicit-country-seki-fragments', 'unknown policy')
  const canonical = boundJson<CanonicalAuthoringLandscape>(root, policy.canonical)
  const goals = new Map(canonical.goals.map(goal => [goal.id, goal]))
  const bindings = [policy.nativeCompiler, policy.nativeCanonicalHelper, policy.nativeStageHelper, policy.durationGenerator, policy.stageDecision,
    ...policy.sourceBindings, ...policy.stageDecisionBindings,
    ...policy.countries.flatMap(country => country.sources.flatMap(source => [source.view, ...source.secondaryTargets.map(target => target.view)])),
    ...policy.existingStageViews.map(operation => operation.source), ...(policy.authoredAssessmentViews ?? []).map(operation => operation.source)]
  const boundByPath = new Map<string, BoundStageFile>()
  for (const binding of bindings) {
    const prior = boundByPath.get(binding.path)
    expect(!prior || prior.sha256 === binding.sha256, `conflicting input bindings: ${binding.path}`)
    boundByPath.set(binding.path, binding)
  }
  for (const binding of boundByPath.values()) checked(root, binding)
  const decisions = boundJson<SourceDecisions>(root, policy.sourceDecisions)
  expect(decisions.schemaVersion === 1, 'unknown source decision format')
  expect(new Set(decisions.decisions.map(decision => decision.id)).size === decisions.decisions.length, 'duplicate source decision')
  for (const decision of decisions.decisions) {
    const goal = goals.get(decision.goalId)
    expect(goal && digest(JSON.stringify(stable(goal))) === decision.contractSha256, `whole-goal contract changed: ${decision.id}`)
    expect(decision.rationale && decision.primary.length, `missing primary author decision: ${decision.id}`)
    for (const primary of decision.primary) {
      checked(root, primary)
      expect(primary.pdfPagesOneBased.length && primary.pdfPagesOneBased.every(page => Number.isInteger(page) && page > 0), 'missing physical PDF page')
    }
  }
  const registry = boundJson<{ selections: Array<{ selectionPath: string }> }>(root, policy.variantRegistry)
  expect(same(sorted(registry.selections.map(entry => entry.selectionPath)), sorted(policy.variantSelections.map(entry => entry.selection.path))), 'variant selection inventory changed')
  const selections = policy.variantSelections.map(entry => {
    const selection = boundJson<{ variantGoalId: string; originalGoalId: string; targetViewIds: string[] }>(root, entry.selection)
    checked(root, entry.contentReview)
    checked(root, entry.placementReview)
    expect(selection.variantGoalId === entry.variantGoalId && selection.originalGoalId === entry.originalGoalId
      && same(selection.targetViewIds, entry.existingTargetViewIds), 'variant selection identity or enrollment changed')
    return entry
  })
  const outputIds = new Set([...policy.countries.map(country => country.outputViewId),
    ...policy.existingStageViews.map(view => view.outputViewId), ...policy.durationOutputViewIds, ...(policy.authoredAssessmentViews ?? []).map(view => view.outputViewId)])
  for (const rule of policy.stageRules) for (const decision of [rule.sourceDecision, ...(rule.additionalSourceDecisions ?? [])]) {
    expect(policy.stageDecisionBindings.some(binding => binding.path === decision.split('#')[0]), 'stage rule lacks its exact bound independent source decision')
  }
  expect(new Set(policy.assessmentScopeOperations.map(operation => operation.id)).size === policy.assessmentScopeOperations.length, 'duplicate assessment scope operation')
  for (const operation of policy.assessmentScopeOperations) {
    expect(outputIds.has(operation.viewId), 'assessment scope operation has no materialized view')
    expect(policy.stageDecisionBindings.some(binding => binding.path === operation.sourceDecision.split('#')[0]), 'assessment scope operation lacks its exact bound independent source decision')
  }
  const ledger = policy.sourceBindings.find(binding => binding.path === 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')
  if (!ledger) fail('missing authoritative semantic-kind ledger binding')
  const { semanticKindByGoalId } = parseSemanticKindLedger(boundJson(root, ledger), canonical, canonical.landscapeId, policy.canonical.path, fingerprintSemanticKindSourceGoal)
  return { canonical, goals, decisions, selections, semanticKindByGoalId }
}

/** Build ordinary views from explicitly classified fragments; no stage inference. */
export function deriveMathCountrySekIViews(root: string, policy: StagePolicy) {
  const { canonical, goals, decisions, selections, semanticKindByGoalId } = assertMathStagePolicyInputs(root, policy)
  expect(new Set(policy.countries.map(country => country.jurisdiction)).size === policy.countries.length, 'duplicate country')
  expect(new Set(policy.countries.map(country => country.outputViewId)).size === policy.countries.length, 'duplicate output view')
  return policy.countries.map(country => {
    expect(country.sources.length === 2 && same(sorted(country.sources.map(source => source.courseProfile)), ['GK', 'LK']), 'both exact course source views required')
    expect(country.offeredDurationModels.length && country.offeredDurationModels.every(model => ['G8', 'G9'].includes(model)), 'explicit duration decision required')
    localPath(root, country.outputPath)
    expect(country.outputPath.startsWith('curricula/DE/Gymnasium/composition-views/mathematik/') && country.outputPath.endsWith('.view.json'), 'invalid output destination')
    const courses = country.sources.map(source => {
      const view = boundJson<CompositionView>(root, source.view)
      expect(view.viewId === source.viewId && view.scope.jurisdiction === country.jurisdiction
        && view.scope.schoolForm === 'Gymnasium' && view.scope.stage === 'CrossStage'
        && view.scope.courseProfile === source.courseProfile, 'source scope identity changed')
      const before = compileCompositionView(view, canonical)
      expect(!before.findings.some(finding => finding.severity === 'error'), `source compile failed: ${view.viewId}`)
      const correction = correctSourceFragments(view, source, decisions, goals)
      const corrected = correction.view
      const retained = [source.mainStageId, ...source.supplementIds]
      const classified = [source.mainStageId, ...source.secondaryStructureIds]
      expect(new Set(classified).size === classified.length, 'duplicate fragment classification')
      const roots: CompositionViewNode[] = []
      let croppedRoots = 0
      const excludedTargets: string[] = []
      for (const node of corrected.rootNodes) {
        if (node.kind === 'structure' && node.id === source.rootStructureId) {
          croppedRoots++
          expect(node.children.every(child => child.kind === 'structure')
            && same(sorted(node.children.map(child => child.kind === 'structure' ? child.id : '')), sorted(classified))
            && node.children.length === classified.length, 'unassigned or missing root fragment')
          roots.push({ ...structuredClone(node), children: structuredClone(node.children.filter(child => child.kind === 'structure' && retained.includes(child.id))) })
        } else if (node.kind !== 'structure' && node.kind !== 'landscapeEntry' && node.projectionRole === 'prerequisiteOnly') {
          // Preserve the complete outer mask context, including masks whose own
          // canonical goal is absent from the retained visible fragment.
          roots.push(structuredClone(node))
        } else {
          expect(node.kind !== 'structure' && node.kind !== 'landscapeEntry', 'unassigned outer structure or landscape')
          if (node.kind === 'structure' || node.kind === 'landscapeEntry') fail('unassigned outer reference')
          const reference = node as CompositionCanonicalSubtreeNode | CompositionGoalEntryNode
          const binding = source.secondaryTargets.find(entry => entry.goalId === reference.goalId)
          expect(binding && !excludedTargets.includes(reference.goalId), `unassigned outer target: ${reference.goalId}`)
          const secondary = boundJson<CompositionView>(root, binding!.view)
          expect(secondary.scope.jurisdiction === country.jurisdiction && secondary.scope.stage === 'SekII'
            && secondary.scope.courseProfile === source.courseProfile && targetReferences(secondary.rootNodes, reference.goalId).length,
          'excluded outer target lacks its exact dedicated secondary placement')
          excludedTargets.push(reference.goalId)
        }
      }
      expect(croppedRoots === 1 && same(sorted(excludedTargets), sorted(source.secondaryTargets.map(entry => entry.goalId))), 'unused fragment or secondary target decision')
      let proposed: CompositionView = {
        viewId: country.outputViewId, landscapeId: view.landscapeId,
        scope: { jurisdiction: country.jurisdiction, schoolForm: 'Gymnasium', stage: 'SekI' }, rootNodes: roots,
      }
      let compiled = compileCompositionView(proposed, canonical)
      expect(!compiled.findings.some(finding => finding.severity === 'error'), `derived compile failed: ${view.viewId}`)
      const expectedPaths = retained.map(id => [`structure:${source.rootStructureId}`, `structure:${id}`])
      const expected = occurrences(before.compiledRootNodes).filter(occurrence => expectedPaths.some(path => path.every((id, index) => occurrence.path[index] === id)))
      let actual = occurrences(compiled.compiledRootNodes)
      const expectedIds = new Set(expected.map(occurrence => occurrence.goalId))
      const actualIds = new Set(actual.map(occurrence => occurrence.goalId))
      const removed = sorted([...expectedIds].filter(id => !actualIds.has(id)))
      const added = sorted([...actualIds].filter(id => !expectedIds.has(id)))
      expect(same(removed, sorted(correction.applied ? source.expectedRemovedTargetGoalIds : [])) && same(added, sorted(correction.applied ? source.expectedAddedTargetGoalIds : [])),
        `${view.viewId}: source correction target delta differs: ${JSON.stringify({ removed, added })}`)
      // Corrections bind exact reference replacements above. All unaffected
      // parent paths must still match the full original course context.
      const supplementGoalIds = expected.filter(occurrence => source.supplementIds.some(id => occurrence.path.includes(`structure:${id}`))).map(occurrence => occurrence.goalId)
      const changedGoalIds = new Set([
        ...supplementGoalIds,
        ...source.expectedRemovedTargetGoalIds, ...source.expectedAddedTargetGoalIds,
        ...source.corrections.flatMap(correction => correction.expectedReference.kind === 'canonicalSubtree'
          ? [...collectCompositionProjectionRoleGoalIds([correction.expectedReference], goals).targetGoalIds] : []),
      ])
      expect(same(actual.filter(occurrence => !changedGoalIds.has(occurrence.goalId)), expected.filter(occurrence => !changedGoalIds.has(occurrence.goalId))),
        `${view.viewId}: unaffected full-source structure/goal parent paths changed`)
      const stageRule = mathStageRuleForScope(policy.stageRules, country.jurisdiction, country.offeredDurationModels)
      const stageAudit = applyMathStageScopeRule(proposed, goals, stageRule, source.mainStageId, false, semanticKindByGoalId)
      proposed = applyMathAssessmentScopeOperations(stageAudit.view, goals, policy.assessmentScopeOperations)
      compiled = compileCompositionView(proposed, canonical)
      expect(!compiled.findings.some(finding => finding.severity === 'error'), `${view.viewId}: stage correction compile failed`)
      actual = occurrences(compiled.compiledRootNodes)
      const roles = collectCompositionProjectionRoleGoalIds(proposed.rootNodes, goals)
      for (const selection of selections) {
        if (!roles.targetGoalIds.has(selection.variantGoalId)) continue
        expect(selection.existingTargetViewIds.includes(source.viewId) && selection.addedTargetViewIds.includes(proposed.viewId), 'inherited assessment variant needs exact selection extension')
        expect(!roles.targetGoalIds.has(selection.originalGoalId), 'original and exclusive assessment variant both selected')
      }
      return { courseProfile: source.courseProfile, view: proposed, compiledGoalIds: sorted(actual.map(occurrence => occurrence.goalId)),
        targetGoalIds: sorted(roles.targetGoalIds), prerequisiteOnlyGoalIds: sorted(roles.prerequisiteOnlyGoalIds),
        stageAudit: { ...stageAudit, view: undefined },
        preservedOuterMaskCount: roots.filter(node => node.kind !== 'structure' && node.projectionRole === 'prerequisiteOnly').length }
    })
    // GK/LK outer mask inventories may differ for excluded secondary objects.
    // The selected native stage targets must nevertheless agree exactly.
    expect(same(courses[0].compiledGoalIds, courses[1].compiledGoalIds)
      && same(courses[0].targetGoalIds, courses[1].targetGoalIds), `${country.jurisdiction}: GK/LK stage targets differ`)
    // Both source-course checks above stay unchanged. These exact output-view
    // placements run once on the chosen authored output, not on an LK tree
    // whose distinct source structure IDs were never this operation's anchors.
    const view = applyContextualTerminalPlacements(courses[0].view, goals, root)
    const finalCompiled = compileCompositionView(view, canonical)
    expect(!finalCompiled.findings.some(finding => finding.severity === 'error'), `${view.viewId}: final contextual placement compile failed`)
    return { jurisdiction: country.jurisdiction, path: country.outputPath, view, courses }
  })
}

/** A preview is authoring evidence. Live writes/checks require exact independent approval. */
export function assertMathStageMaterializationAllowed(root: string, policy: StagePolicy, policyBytes: string, receipt?: StageReviewReceipt): void {
  expect(policy.openScopeHolds.length === 0, `HOLD: unresolved stage scope: ${policy.openScopeHolds.map(hold => hold.goalId).join(', ')}`)
  const { decisions } = assertMathStagePolicyInputs(root, policy)
  expect(decisions.decisions.every(decision => ['WHOLE_GOAL_PRIMARY_SUPPORTED', 'EXPLICIT_SOURCE_CORRECTED_TARGET'].includes(decision.disposition)), 'HOLD: unresolved whole-goal source decisions')
  expect(receipt?.verdict === 'PASS' && receipt.authorIndependent === true
    && receipt.policySha256 === digest(policyBytes) && receipt.sourceDecisionsSha256 === policy.sourceDecisions.sha256
    && receipt.generatorSha256 === digest(readFileSync(localPath(root, generatorPath))), 'HOLD: exact independent policy/source/generator approval required')
  expect(same(sorted(receipt!.approvedViewIds), sorted([...policy.countries.map(country => country.outputViewId), ...policy.existingStageViews.map(view => view.outputViewId), ...policy.durationOutputViewIds, ...(policy.authoredAssessmentViews ?? []).map(view => view.outputViewId)]))
    && same(sorted(receipt!.approvedSourceDecisionIds), sorted(decisions.decisions.map(decision => decision.id)))
    && same(sorted(receipt!.approvedStageRuleIds), sorted(policy.stageRules.map(rule => rule.id)))
    && same(sorted(receipt!.approvedAssessmentScopeOperationIds), sorted(policy.assessmentScopeOperations.map(operation => operation.id))), 'HOLD: approval does not cover exact views/source/stage/assessment decisions')
  const extensions = policy.variantSelections.filter(entry => entry.addedTargetViewIds.length)
    .map(entry => ({ variantGoalId: entry.variantGoalId, addedTargetViewIds: entry.addedTargetViewIds }))
  expect(same(receipt!.approvedVariantExtensions, extensions), 'HOLD: assessment variant extension approval missing')
  for (const entry of policy.variantSelections) {
    const actual = boundJson<{ targetViewIds: string[] }>(root, entry.selection)
    expect(entry.addedTargetViewIds.every(id => actual.targetViewIds.includes(id)), 'HOLD: reviewed variant extension is not present in the bound registry selection')
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const args = process.argv.slice(2)
  const value = (key: string) => args.includes(key) ? args[args.indexOf(key) + 1] : undefined
  expect(args.every((arg, index) => ['--write', '--check', '--policy', '--output-dir', '--review'].includes(arg)
    || ['--policy', '--output-dir', '--review'].includes(args[index - 1])), 'unknown argument')
  expect(!(args.includes('--write') && args.includes('--check')), 'choose write or check')
  const bytes = readFileSync(localPath(root, value('--policy') ?? policyPath), 'utf8')
  const policy = JSON.parse(bytes) as StagePolicy
  const output = [...deriveMathCountrySekIViews(root, policy), ...deriveMathExistingStageViews(root, policy), ...deriveMathAuthoredAssessmentViews(root, policy)]
  const live = args.includes('--write') || args.includes('--check')
  if (live) {
    const reviewPath = value('--review') ?? policy.reviewReceiptPath
    const receipt = reviewPath ? JSON.parse(readFileSync(localPath(root, reviewPath), 'utf8')) as StageReviewReceipt : undefined
    assertMathStageMaterializationAllowed(root, policy, bytes, receipt)
    // Authored sources are committed inputs, not an additional snapshot tree.
    // Integrate and rebind their independently reviewed correction first; this
    // command must never write a source and immediately invalidate its own pin.
    for (const item of output) {
      const source = policy.existingStageViews.find(operation => operation.outputPath === item.path && operation.source.path === item.path)
      if (source) expect(readFileSync(localPath(root, item.path), 'utf8') === `${JSON.stringify(item.view, null, 2)}\n`,
        `HOLD: integrate and rebind reviewed authoring source before materialization: ${item.path}`)
    }
  }
  const previewRoot = localPath(root, value('--output-dir') ?? 'tmp/math-country-seki-stage-preview')
  expect(live || relative(root, previewRoot).startsWith(`tmp/`), 'preview output must be a repository tmp subdirectory')
  for (const item of output) {
    const destination = live ? localPath(root, item.path) : resolve(previewRoot, item.path)
    const content = `${JSON.stringify(item.view, null, 2)}\n`
    if (args.includes('--check')) expect(readFileSync(destination, 'utf8') === content, `generated view drift: ${item.path}`)
    else { mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, content) }
  }
  console.log(JSON.stringify({ mode: live ? args.includes('--check') ? 'reviewed-check' : 'reviewed-write' : 'unapproved-isolated-preview', views: output.length,
    countrySourceViews: policy.countries.length * 2, existingStageOutputs: policy.existingStageViews.length,
    outputRoot: live ? 'curricula' : relative(root, previewRoot) }))
}
