// Apache-2.0. Finite inactive CAS measurements only; no full compiler or runtime.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-source-view-remediation-scientific-independent-a-20261013-v2'
const consumed = new Map<string, any>()
const bind = (path: string) => {
  const bytes = readFileSync(resolve(root, path))
  const result = { path, sha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, bytes: bytes.length }
  consumed.set(path, result)
  return result
}
const read = (path: string) => { bind(path); return JSON.parse(readFileSync(resolve(root, path), 'utf8')) }
const guarded = (binding: any) => { assert.deepEqual(bind(binding.path), binding); return read(binding.path) }
const nodeAt = (data: any, pointer: string) => pointer.split('/').slice(1).reduce((node, key) => node[key], data)
const locate = (data: any, pointer: string) => {
  const parts = pointer.split('/').slice(1)
  return { parent: parts.slice(0, -1).reduce((node, key) => node[key], data), key: parts.at(-1)! }
}
const first = read(`${own}/FIRST.neutral-source-view-input-seal.json`)
const selector = guarded(first.neutralSelector)
for (const row of first.directNeutralBindings) assert.deepEqual(bind(row.expected.path), row.expected)
const oldIndependentSeal = guarded(selector.genuineV1IndependentFinalSeal)
for (const output of oldIndependentSeal.outputs) assert.deepEqual(bind(output.path), output)
const immutableReuse = ['immutableV1Seal', 'exactV1CanonicalCAS', 'exactV1SemanticClassificationCAS', 'exactV1TwoProfiles', 'exactV1FourDEENCases']
for (const key of immutableReuse) assert.deepEqual(bind(selector[key].path), selector[key])
const pngBindings = oldIndependentSeal.consumedInputBindings.filter((row: any) => row.path.endsWith('/e5941581-0aba-5354-b4b9-d0249d4538a8.png'))
assert.equal(pngBindings.length, 3)
for (const row of pngBindings) { assert.deepEqual(bind(row.path), row); assert.equal(row.sha256, selector.exactParentOverviewSha256) }
const sourceCAS = guarded(selector.sourceComponentCAS)
const locatorCAS = guarded(selector.locatorOptionalConditionCAS)
const viewCAS = guarded(selector.all21ViewCAS)
const blockers = guarded(selector.finiteOpenDataBlockers)
const parentId = 'e5941581-0aba-5354-b4b9-d0249d4538a8'
const children = ['981242bb-a729-5701-b02d-c2f7f489e5af', '53db04a0-ea76-5810-9526-c8639100e497']
const counts = (mapping: any) => ({ sourceDecisionRows: mapping.decisions.length, distinctSourceGoalIdsInDecisions: new Set(mapping.decisions.map((row: any) => row.sourceGoalId)).size, compatibilityMappingEdgeRows: mapping.mappings.length, compatibilityMappingExactEdgeRows: mapping.mappings.filter((row: any) => row.matchType === 'exact').length, compatibilityMappingPartialEdgeRows: mapping.mappings.filter((row: any) => row.matchType === 'partial').length, authoritativeDecisionTargetEdges: mapping.decisions.reduce((sum: number, row: any) => sum + (row.canonicalGoalIds?.length ?? 0), 0) })
const mappingResults = []
for (const file of sourceCAS.wholeMappingGuardsAndCellCAS) {
  const before = guarded(file.expectedWholeMappingBinding)
  const after = structuredClone(before)
  const edits = [...file.mappingCellReplacements].sort((a, b) => Number(b.jsonPointer.split('/').at(-1)) - Number(a.jsonPointer.split('/').at(-1)))
  for (const edit of edits) {
    assert.deepEqual(nodeAt(before, edit.jsonPointer), edit.expectedBeforeWholeCell)
    const { parent, key } = locate(after, edit.jsonPointer)
    assert(Array.isArray(parent))
    parent.splice(Number(key), 1, ...edit.replacementWholeCells)
  }
  for (const edit of file.decisionCellCompareAndSwap) {
    assert.deepEqual(nodeAt(before, edit.jsonPointer), edit.expectedBeforeWholeCell)
    const beforeCell = edit.expectedBeforeWholeCell
    const afterCell = edit.proposedAfterWholeCell
    assert.deepEqual({ ...afterCell, canonicalGoalIds: beforeCell.canonicalGoalIds }, beforeCell)
    assert.deepEqual(afterCell.canonicalGoalIds.filter((id: string) => !children.includes(id)), beforeCell.canonicalGoalIds.filter((id: string) => id !== parentId))
    const { parent, key } = locate(after, edit.jsonPointer)
    parent[key] = afterCell
  }
  const changedIds = new Set(file.decisionCellCompareAndSwap.map((row: any) => row.expectedBeforeWholeCell.sourceGoalId))
  assert.deepEqual(before.decisions.map((row: any) => row.sourceGoalId), after.decisions.map((row: any) => row.sourceGoalId))
  assert.deepEqual(before.decisions.filter((row: any) => !changedIds.has(row.sourceGoalId)), after.decisions.filter((row: any) => !changedIds.has(row.sourceGoalId)))
  assert.deepEqual(before.mappings.filter((row: any) => !(changedIds.has(row.legacyGoalId) && row.canonicalGoalId === parentId)), after.mappings.filter((row: any) => !children.includes(row.canonicalGoalId)))
  assert.deepEqual(before.summary ?? null, file.exactLegacySummaryGuard.expectedBefore)
  assert.deepEqual(before.summary ?? null, file.exactLegacySummaryGuard.proposedAfter)
  assert.deepEqual(counts(before), file.namedMeasuredCountUnits.before)
  assert.deepEqual(counts(after), file.namedMeasuredCountUnits.afterProposed)
  const childEdges = after.mappings.filter((row: any) => children.includes(row.canonicalGoalId))
  assert(childEdges.length === (file.expectedWholeMappingBinding.path.includes('/b06849a0') ? 2 : 0))
  mappingResults.push({ path: file.expectedWholeMappingBinding.path, exactWholeGuardAndCAS: true, onlyDeclaredMappingsAndDecisionTargetsChanged: true, allOriginalSourceRowsRetained: true, allOtherPartnerCellsExact: true, legacySummaryExact: true, measuredCountsBefore: counts(before), measuredCountsAfter: counts(after), operativeSynthesisChildEdges: childEdges })
}
assert.equal(sourceCAS.conditionalRPAzoNonoperativeProposal.inMappedCanonicalGoalIds, false)
assert.equal(sourceCAS.conditionalRPAzoNonoperativeProposal.inGeneralRPLKTargetView, false)
const locatorResults = []
const oldExtractions = new Map<string, any>()
for (const edit of locatorCAS.sourceCellCompareAndSwap) {
  const extraction = guarded(edit.expectedWholeExtractionBinding)
  oldExtractions.set(edit.expectedWholeExtractionBinding.path, extraction)
  assert.deepEqual(nodeAt(extraction, edit.jsonPointer), edit.expectedBeforeWholeCell)
  const before = edit.expectedBeforeWholeCell
  const after = edit.proposedAfterWholeCell
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key])).sort()
  assert.deepEqual(changed, ['sourceRef', 'sourceScopeCondition'])
  assert.deepEqual(changed, [...edit.changedFields].sort())
  assert.deepEqual({ ...after, sourceRef: before.sourceRef, sourceScopeCondition: before.sourceScopeCondition }, { ...before, sourceScopeCondition: before.sourceScopeCondition })
  locatorResults.push({ path: edit.expectedWholeExtractionBinding.path, jsonPointer: edit.jsonPointer, sourceGoalId: before.id, exactWholeCellGuard: true, onlyLocatorAndConditionChanged: true, literalSourceTextAndHistoricalRawFieldsExact: true, proposedLocator: after.sourceRef, proposedCondition: after.sourceScopeCondition })
}
assert.equal(locatorResults.length, 4)
assert.equal(blockers.blockers.length, 4)
assert.deepEqual(blockers.blockers.map((row: any) => row.id), ['RP6.2_SELECTED_SCOPE', 'RP_CLASSIFICATION_OPERATOR', 'SN_CHROMOPHORE_CLASSIFICATION_OPERATOR', 'RP3.3_OPTIONAL_PRODUCT_CONTEXT'])
for (const blocker of blockers.blockers) {
  assert(blocker.actualDuty && blocker.reason && blocker.laterRequiredAction)
  if (blocker.exactAdditionalWholeSourceDuty) {
    const cell = blocker.exactAdditionalWholeSourceDuty
    const extraction = [...oldExtractions.values()].find((row: any) => row.sourceGoals.some((goal: any) => goal.id === cell.id))
    assert(extraction)
    assert.deepEqual(extraction.sourceGoals.find((goal: any) => goal.id === cell.id), cell)
  }
}
const canonicalCAS = guarded(selector.exactV1CanonicalCAS)
const baseline = guarded(canonicalCAS.sourceCanonicalBinding)
const proposed = structuredClone(baseline)
for (const row of canonicalCAS.existingGoals) {
  const index = proposed.goals.findIndex((goal: any) => goal.id === row.expectedBeforeWholeGoal.id)
  assert.deepEqual(proposed.goals[index], row.expectedBeforeWholeGoal)
  proposed.goals[index] = row.proposedAfterWholeGoal
}
proposed.goals.push(...canonicalCAS.newChildren)
const roleModule = 'app/src/utils/authoring/compositionViewAuthoring.ts'
bind(roleModule)
const { collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(resolve(root, roleModule)).href)
const goalById = new Map<string, any>(proposed.goals.map((goal: any) => [goal.id, goal]))
const viewResults = []
for (const file of viewCAS.wholeExistingViewGuardsAndNodeCAS) {
  const before = guarded(file.expectedWholeViewBinding)
  assert.deepEqual(before.scope, file.wholeExistingScope)
  const after = structuredClone(before)
  for (const edit of file.exactNodeCAS) {
    assert.deepEqual(nodeAt(before, edit.jsonPointer), edit.expectedBeforeWholeNode)
    const { parent, key } = locate(after, edit.jsonPointer)
    const siblingsBefore = structuredClone(parent)
    assert(Array.isArray(parent))
    if (edit.operation === 'remove') {
      assert.equal(edit.proposedAfterWholeNode, null)
      parent.splice(Number(key), 1)
      siblingsBefore.splice(Number(key), 1)
      assert.deepEqual(parent, siblingsBefore)
    } else {
      assert.equal(edit.operation, 'replace')
      assert.deepEqual(edit.proposedAfterWholeNode, { ...edit.expectedBeforeWholeNode, kind: 'canonicalSubtree' })
      parent[Number(key)] = edit.proposedAfterWholeNode
      siblingsBefore[Number(key)] = edit.proposedAfterWholeNode
      assert.deepEqual(parent, siblingsBefore)
    }
    assert.deepEqual({ ...after, rootNodes: before.rootNodes }, before)
  }
  const roles = collectCompositionProjectionRoleGoalIds(after.rootNodes, goalById)
  const childRoles = children.map(goalId => ({ goalId, role: roles.targetGoalIds.has(goalId) ? 'target' : roles.prerequisiteOnlyGoalIds.has(goalId) ? 'prerequisiteOnly' : 'absent' }))
  const allowed = file.wholeExistingScope.jurisdiction === 'DE' || (file.wholeExistingScope.jurisdiction === 'DE-BY' && file.wholeExistingScope.stage === 'SekII' && file.wholeExistingScope.courseProfile === 'LK')
  assert(childRoles.every(row => row.role === (allowed ? 'target' : 'absent')))
  viewResults.push({ path: file.expectedWholeViewBinding.path, scope: file.wholeExistingScope, exactWholeViewAndNodeGuards: true, otherSiblingsAndScopeExact: true, operations: file.exactNodeCAS.map((row: any) => row.operation), childRoles, roleMeasurementOnlyNotSourceOrFullViewCompilation: true })
}
const oldOwnMeasurements = guarded(oldIndependentSeal.outputs.find((row: any) => row.path.endsWith('/checks/finite-preservation.independent.actual.json')))
const primaryFiles = [
  { path: 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf', pages: [19, 40, 47] },
  { path: 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf', pages: [60] },
]
const primaryResults = []
for (const file of primaryFiles) {
  const oldBinding = oldIndependentSeal.consumedInputBindings.find((row: any) => row.path === file.path)
  assert.deepEqual(bind(file.path), oldBinding)
  const command = spawnSync('pdftotext', ['-layout', file.path, '-'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  assert.equal(command.status, 0)
  const pages = command.stdout.split('\f')
  for (const page of file.pages) {
    const rawText = pages[page - 1]
    const hash = `sha256:${createHash('sha256').update(rawText, 'utf8').digest('hex')}`
    assert.equal(hash, oldOwnMeasurements.wholePrimaryPagesRead.find((row: any) => row.path === file.path && row.pdfPage1Based === page).pdftotextLayoutPageSha256)
    primaryResults.push({ path: file.path, pdfPage1Based: page, textSha256: hash, originalDocumentAndWholePageTextExactToIndependentV1Read: true })
  }
}
mkdirSync(resolve(root, own, 'checks'), { recursive: true })
const result = { schemaVersion: 1, measuredAtUTC: new Date().toISOString(), role: 'Independent narrow V2 source/view CAS measurements; genuine scientific decisions are separate', neutralDirectBindingsExact: 14, ownV1AllElevenOutputsExact: true, goalCaseProfileSemanticCASReuseExact: true, reusedScientificContentReReviewed: false, parentPNGThreeCopiesExact: true, threeWholeMappingCAS: mappingResults, fourWholeLocatorConditionCAS: locatorResults, twentyOneWholeViewCASAndStockRoleMeasurements: viewResults, fourOpenDataBlockerIds: blockers.blockers.map((row: any) => row.id), exactAdditionalRPFurtherClassesSourceCell: true, sourcePrimaryPages: primaryResults, fullCompilerRuns: 0, newBookModels: 0, runtimeTests: 0, newAtomicityVotes: 0, sourceCompletenessGranted: false, m7Granted: false, humanApproval: false, humanTrial: false, activeWrites: false }
writeFileSync(resolve(root, own, 'checks/source-view-CAS.independent.actual.json'), `${JSON.stringify(result, null, 2)}\n`)
writeFileSync(resolve(root, own, 'checks/consumed-input-bindings.actual.json'), `${JSON.stringify({ inputBindings: [...consumed.values()] }, null, 2)}\n`)
console.log(JSON.stringify({ neutralBindings: 14, mappingCAS: mappingResults.length, sourceLocatorConditionCAS: locatorResults.length, viewCAS: viewResults.length, viewsBothChildrenTarget: viewResults.filter(row => row.childRoles.every(child => child.role === 'target')).length, viewsBothChildrenAbsent: viewResults.filter(row => row.childRoles.every(child => child.role === 'absent')).length, allOtherSourceRowsAndPartnersExact: true, fourDataBlockersRetained: true, fullCompilerRuns: 0 }))
