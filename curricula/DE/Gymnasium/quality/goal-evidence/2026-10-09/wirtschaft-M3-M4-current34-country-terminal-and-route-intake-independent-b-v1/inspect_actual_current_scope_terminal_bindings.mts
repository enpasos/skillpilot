import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [repoArg, capsuleArg, outputArg] = process.argv.slice(2)
const repo = resolve(repoArg), capsule = resolve(capsuleArg), output = resolve(outputArg)
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M3-M4-current34-country-terminal-and-route-intake-independent-b-v1'
const rootM2 = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-M2-standard-source-availability-and-current-boundary-root-v1/actual-reviewed-M2-activation'
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const sorted = (items: Iterable<string>) => [...items].sort()
const can = json(resolve(repo, own, 'inputs/whole-current493-canonical.json'))
const currentCan = resolve(repo, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
assert.equal(sha(currentCan), sha(resolve(repo, own, 'inputs/whole-current493-canonical.json')))
assert.equal(can.goals.length, 493)
const reportFile = resolve(repo, rootM2, 'whole-actual-current-CAN493.native-applicability-report.json')
const report = json(reportFile)
assert.equal(report.goals.length, 493)
assert.equal(report.summary.errors, 0)
assert.equal(report.summary.warnings, 4)
const native: any = await import(pathToFileURL(resolve(capsule, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const comp: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const filters: any = await import(pathToFileURL(resolve(repo, 'app/src/utils/goalFilters.ts')).href)
const conversion: any = await import(pathToFileURL(resolve(repo, 'app/src/goalTypes.ts')).href)
const profile = native.routeProfiles.find((p: any) => p.landscapeId === can.landscapeId)
const compilation = { reports: [report], summary: { supportedValues: report.projections.map((p: any) => p.value) } }
const actualScope = native.evaluateRouteProfile(can, profile, compilation)
const central = json(resolve(repo, own, 'inputs/whole-current-central-status.json')).curricula.find((c: any) => c.landscapeId === can.landscapeId)
assert.deepEqual(actualScope, central.scopes[0], 'actual unchanged native route profile reproduces the actual central scope')
assert.equal(profile.compositionViewStage, 'CrossStage')
assert.equal(profile.compositionViewApplicabilityMode, undefined)
assert.equal(profile.compositionViewRoutePathMode, undefined)
const native104 = actualScope.rules.find((r: any) => r.id === 'CQR-104')
assert.equal(native104.metrics.requiredTerminalAutonomyGoals, 90)
assert.equal(native104.metrics.relevantCompositionViews, 34)
assert.equal(native104.metrics.projectionScopesMissingTerminalAutonomyGoals, 33)
assert.equal(native104.metrics.projectionLocalRouteChecksEnabled, 0)
const gb = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const applicability = new Map<string, any>(report.goals.map((g: any) => [g.goalId, g]))
const directEdges = native.buildAtomicDirectRequiresEdges(can)
const hasDirectPath = native.createPathChecker(directEdges)
const effectiveEdges = native.buildEffectiveRequiresEdges(can)
const hasEffectivePath = native.createPathChecker(effectiveEdges)
const terminalGoals = profile.terminalAutonomyClusterIds.flatMap((clusterId: string) => gb.get(clusterId).contains.map((id: string) => gb.get(id)))
assert.equal(terminalGoals.length, 90)
assert(terminalGoals.every((g: any) => g.examData.reviewStatus === 'released'))
const terminalIds = new Set<string>(terminalGoals.map((g: any) => g.id))
const referenceId = (id: string) => gb.has(id) ? id : id.split(':').at(-1)!
const closure = (goalId: string) => {
  const seen = new Set<string>(), queue = [...(gb.get(goalId)?.requires ?? [])].map(referenceId)
  while (queue.length) {
    const id = queue.pop()!
    if (seen.has(id)) continue
    seen.add(id)
    queue.push(...(gb.get(id)?.requires ?? []).map(referenceId))
  }
  return seen
}
const pathInside = (from: string, to: string, available: Set<string>) => {
  const seen = new Set<string>(), stack = [from]
  while (stack.length) {
    const id = stack.pop()!
    if (!available.has(id) || seen.has(id)) continue
    if (id === to) return true
    seen.add(id)
    stack.push(...(directEdges.get(id) ?? []))
  }
  return false
}
const terminalBindingRows = terminalGoals.map((g: any) => {
  const ancestors = closure(g.id)
  const covered = g.examData.coveredGoalIds.map(referenceId)
  return { goalId: g.id, title: g.title, wholeCurrentGoal: g, currentRequires: g.requires, wholeCoveredGoalIds: covered, transitivePrerequisiteIds: sorted(ancestors), coveredGoalsNotDirectRequires: covered.filter((id: string) => !g.requires.includes(id)), coveredGoalsOutsideTransitiveRequires: covered.filter((id: string) => !ancestors.has(id)), currentCompiledApplicability: applicability.get(g.id), applicabilityFromRequires: g.extendedData?.applicabilityFromRequires === true, existingMachineMaterialReleaseReusedAsReference: true, newWholeMaterialReviewClaim: false }
})
const viewRows: any[] = []
const viewDir = resolve(repo, own, 'inputs/whole-current-views')
for (const filename of readdirSync(viewDir).filter(f => f.endsWith('.json')).sort()) {
  const file = resolve(viewDir, filename), v = comp.normalizeCompositionView(json(file))
  assert.equal(sha(file), sha(resolve(repo, 'curricula/DE/Gymnasium/composition-views/wirtschaft', filename)))
  if (v.scope.stage !== 'CrossStage') continue
  const scopeFilters = [v.scope.courseProfile, v.scope.jurisdiction].filter(Boolean)
  const targets: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, file, scopeFilters)
  const support: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, file, scopeFilters, true)
  const unfiltered: Set<string> = native.collectRenderedAtomicGoalIdsFromCompositionView(can, file)
  const ordinaryTargets = sorted(targets).filter(id => native.isProjectedRouteTargetGoal(gb.get(id)))
  const roles = comp.collectCompositionProjectionRoleGoalIds(v.rootNodes, gb)
  const actualVisibleTerminals = sorted(targets).filter(id => terminalIds.has(id))
  const policy = terminalBindingRows.map((terminal: any) => {
    const g = gb.get(terminal.goalId)
    const coursesMatch = filters.goalMatchesFilters(conversion.convertLearningGoal(g, { landscapeId: can.landscapeId }), [v.scope.courseProfile].filter(Boolean))
    const jurisdictionsMatch = !v.scope.jurisdiction || (applicability.get(g.id).compiledApplicability.jurisdiction ?? []).includes(v.scope.jurisdiction)
    const outsideTargetCovered = terminal.wholeCoveredGoalIds.filter((id: string) => !targets.has(id))
    const outsideSupportedCovered = terminal.wholeCoveredGoalIds.filter((id: string) => !support.has(id))
    const outsideSupportDirectRequires = g.requires.map(referenceId).filter((id: string) => !support.has(id))
    const outsideSupportTransitiveRequires = terminal.transitivePrerequisiteIds.filter((id: string) => !support.has(id))
    const wholeTargetMaterialFits = coursesMatch && jurisdictionsMatch && outsideTargetCovered.length === 0 && outsideSupportDirectRequires.length === 0
    const wholeSupportedMaterialFits = coursesMatch && jurisdictionsMatch && outsideSupportedCovered.length === 0 && outsideSupportDirectRequires.length === 0
    return { terminalId: g.id, visibleNow: targets.has(g.id), courseMatches: coursesMatch, compiledJurisdictionMatches: jurisdictionsMatch, wholeCoveredGoalIdsOutsideTargets: outsideTargetCovered, wholeCoveredGoalIdsOutsideExplicitSupport: outsideSupportedCovered, directRequiresOutsideExplicitSupport: outsideSupportDirectRequires, transitiveRequiresOutsideExplicitSupport: outsideSupportTransitiveRequires, targetPureWholeMaterialCandidate: wholeTargetMaterialFits, supportCompleteWholeMaterialCandidate: wholeSupportedMaterialFits, projectedLocalPrerequisiteClosureComplete: outsideSupportTransitiveRequires.length === 0, newIndependentScopeApprovalClaim: false }
  })
  const targetPure = policy.filter((p: any) => p.targetPureWholeMaterialCandidate).map((p: any) => p.terminalId)
  const supportComplete = policy.filter((p: any) => p.supportCompleteWholeMaterialCandidate).map((p: any) => p.terminalId)
  const localMissingTargetPure = ordinaryTargets.filter(id => !targetPure.some((tid: string) => pathInside(tid, id, new Set([...support, tid]))))
  const assessedMissingTargetPure = ordinaryTargets.filter(id => !targetPure.some((tid: string) => gb.get(tid).examData.coveredGoalIds.includes(id)))
  const localMissingSupported = ordinaryTargets.filter(id => !supportComplete.some((tid: string) => pathInside(tid, id, new Set([...support, tid]))))
  const currentlyVisibleOutsideScope = policy.filter((p: any) => p.visibleNow && !p.supportCompleteWholeMaterialCandidate)
  const actual104Missing = sorted(terminalIds).filter(id => !unfiltered.has(id))
  const localMotivationMissing = ordinaryTargets.filter(id => !pathInside(id, profile.motivationAnchorGoalIds[0], support))
  viewRows.push({ viewPath: `curricula/DE/Gymnasium/composition-views/wirtschaft/${filename}`, wholeInputSHA256: sha(file), scope: v.scope, rawUnfilteredOrdinaryTargets: sorted(unfiltered).filter(id => native.isProjectedRouteTargetGoal(gb.get(id))), actualOrdinaryTargets: ordinaryTargets, actualVisibleAllLeafTargetIds: sorted(targets), actualScopedExplicitSupportIds: sorted(support), rawAuthoredPrerequisiteOnlyIds: sorted(roles.prerequisiteOnlyGoalIds), authoredSupportExcludedByActualScopeFilters: sorted(roles.prerequisiteOnlyGoalIds).filter(id => gb.get(id)?.contains.length === 0 && !support.has(id)), currentNative104MissingTerminalIds: actual104Missing, currentVisibleTerminalIds: actualVisibleTerminals, all90WholeMaterialScopePolicies: policy, existingTargetPureWholeMaterialCandidateIds: targetPure, existingSupportCompleteWholeMaterialCandidateIds: supportComplete, currentVisibleWholeMaterialsOutsideScope: currentlyVisibleOutsideScope, actualOrdinaryTargetsWithoutLocalDirectRouteToTargetPureWholeMaterial: localMissingTargetPure, actualOrdinaryTargetsWithoutDirectAssessmentInTargetPureWholeMaterial: assessedMissingTargetPure, actualOrdinaryTargetsWithoutLocalDirectRouteToSupportedWholeMaterial: localMissingSupported, actualOrdinaryTargetsWithoutLocalDirectMotivationRoute: localMotivationMissing, newWholeScopeApprovalClaim: false })
}
assert.equal(viewRows.length, 34)
assert.equal(viewRows.filter(r => r.currentNative104MissingTerminalIds.length > 0).length, 33)
const result = { role: 'Independent B actual current unchanged-native CQR104 and whole terminal-by-Country/GK-LK intake; candidates are not approvals', actualNativeSourceSHA256: sha(resolve(repo, 'app/scripts/generateCurriculumQualityStatus.ts')), freshActual493ApplicabilityReport: { path: `${rootM2}/whole-actual-current-CAN493.native-applicability-report.json`, sha256: sha(reportFile), summary: report.summary }, actualNativeRouteScope: actualScope, currentNativeProfilePolicy: { profileId: profile.profileId, compositionViewStage: profile.compositionViewStage, compiledJurisdictionEnabled: false, projectionLocalAtomicRoutesEnabled: false, terminalClusters: profile.terminalAutonomyClusterIds, all90RequiredUnconditionallyInEachCrossStageView: true, explanation: 'No course/jurisdiction terminal applicability filter is enabled in current Economics native profile. Native assessment-local requires policy is separately limited to Physics. Its stage collector recognises only SekI/SekII, so CrossStage visible-atomic cannot be enabled without an actual reviewed stage policy.' }, terminalBindingRows, viewRows, allCurrentGlobal336TargetsPreserved: true, productionWrites: 0, nativePredicateThresholdOrProfileSelectorChanges: 0, activeM4M6ApprovalClaim: false, newWholeMaterialApprovalClaim: false, humanReleaseOrTrialClaim: false }
writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ views: viewRows.length, currentNative104MissingScopes: 33, native104RequiredTerminalCount: 90, actualCompilerGoals: report.goals.length, wholeCurrentReleasedTerminals: terminalGoals.length, coveredGoalsOutsideTerminalPrerequisiteClosure: terminalBindingRows.filter((t: any) => t.coveredGoalsOutsideTransitiveRequires.length).map((t: any) => t.goalId), currentVisibleForeignOrIncompleteTerminalOccurrences: viewRows.reduce((n, r) => n + r.currentVisibleWholeMaterialsOutsideScope.length, 0), countryLocalMotivationGapOccurrences: viewRows.reduce((n, r) => n + r.actualOrdinaryTargetsWithoutLocalDirectMotivationRoute.length, 0), strictGain: 0 }))
