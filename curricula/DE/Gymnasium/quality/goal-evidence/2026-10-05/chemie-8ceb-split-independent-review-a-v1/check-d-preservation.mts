// SPDX-License-Identifier: Apache-2.0
// Independent D-only checks. This script deliberately never opens P files.
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const candidate = resolve(own, '../chemie-8ceb-split-scope-preservation-candidate-v1')
const read = async (path: string) => JSON.parse(await readFile(path, 'utf8'))
const local = (path: string) => resolve(root, path)
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const hash = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const delta = await read(resolve(candidate, 'canonical-and-dependencies.delta.candidate.json'))
const placements = await read(resolve(candidate, 'placements-and-views.delta.candidate.json'))
const sources = await read(resolve(candidate, 'source-mappings-and-restrictions.delta.candidate.json'))
const am = await read(resolve(candidate, 'semantic-memory-and-review-impact.candidates.json'))
const canonical = await read(local(delta.inputPath))
const before = new Map<string, any>(canonical.goals.map((g: any) => [g.id, structuredClone(g)]))
const after = new Map<string, any>([...before].map(([id, goal]) => [id, structuredClone(goal)]))
const errors: string[] = []
const assert = (yes: boolean, message: string) => { if (!yes) errors.push(message) }
assert(same(before.get(delta.parentBefore.id), delta.parentBefore), 'Parent current snapshot changed')
after.set(delta.parentAfterCandidate.id, delta.parentAfterCandidate)
for (const child of delta.childCandidates) {
  assert(!before.has(child.id), `Child ID collides: ${child.id}`)
  after.set(child.id, child)
}
const dependencyFieldChanges = []
for (const item of delta.incomingRequiresDeltas) {
  assert(same(before.get(item.goalBefore.id), item.goalBefore), `Incoming current snapshot changed: ${item.goalBefore.id}`)
  after.set(item.goalAfterCandidate.id, item.goalAfterCandidate)
  dependencyFieldChanges.push({ goalId: item.goalBefore.id, changedFields: [...new Set([...Object.keys(item.goalBefore), ...Object.keys(item.goalAfterCandidate)])].filter(k => !same(item.goalBefore[k], item.goalAfterCandidate[k])) })
}
for (const edge of ['requires', 'contains']) {
  const complete = new Set<string>(), active = new Set<string>()
  const visit = (id: string) => {
    if (!after.has(id)) { errors.push(`${edge}: missing ID ${id}`); return }
    if (active.has(id)) { errors.push(`${edge}: cycle ${id}`); return }
    if (complete.has(id)) return
    active.add(id)
    for (const next of after.get(id)[edge] ?? []) visit(next)
    active.delete(id); complete.add(id)
  }
  for (const id of after.keys()) visit(id)
}
const originalLandscape = normalizeCanonicalLandscape(canonical)
const candidateLandscape = normalizeCanonicalLandscape({ ...canonical, goals: [...after.values()] })
const resolvePointer = (value: any, pointer: string) => pointer.split('/').slice(1).reduce((a, k) => a[k.replace(/~1/g, '/').replace(/~0/g, '~')], value)
const viewFolder = local('curricula/DE/Gymnasium/composition-views/chemie')
const authoredPaths = (await readdir(viewFolder)).filter(name => name.endsWith('.view.json')).map(name => resolve(viewFolder, name)).sort()
const viewChecks = []
let actualEntryCount = 0
for (const path of authoredPaths) {
  const raw = await read(path), proposed = structuredClone(raw)
  const relativePath = path.slice(root.length + 1)
  const changes = placements.authoredGoalEntryDeltas.filter((r: any) => r.path === relativePath)
  for (const change of changes) {
    assert(hash(await readFile(path)) === change.sha256, `${relativePath}: view bytes differ from snapshot`)
    assert(same(resolvePointer(raw, change.pointer), change.nodeBefore), `${relativePath}: exact placement before differs`)
    const steps = change.pointer.split('/').slice(1), key = steps.pop()!
    const holder = steps.reduce((a: any, k: string) => a[k], proposed)
    holder[key] = change.nodeAfterCandidate
    assert(change.nodeBefore.kind === 'goalEntry' && change.nodeAfterCandidate.kind === 'canonicalSubtree' && change.nodeBefore.goalId === change.nodeAfterCandidate.goalId, `${relativePath}: placement changed beyond subtree expansion`)
    actualEntryCount++
  }
  const originalView = normalizeCompositionView(raw), proposedView = normalizeCompositionView(proposed)
  const originalResult = compileCompositionView(originalView, originalLandscape)
  const proposedResult = compileCompositionView(proposedView, candidateLandscape)
  const originalRoles = collectCompositionProjectionRoleGoalIds(originalView.rootNodes, before)
  const proposedRoles = collectCompositionProjectionRoleGoalIds(proposedView.rootNodes, after)
  const originalErrors = originalResult.findings.filter(f => f.severity === 'error').map(f => f.message)
  const proposedErrors = proposedResult.findings.filter(f => f.severity === 'error').map(f => f.message)
  assert(same(originalErrors, proposedErrors), `${relativePath}: composition compiler errors changed`)
  const lost = [...originalRoles.targetGoalIds].filter(id => !proposedRoles.targetGoalIds.has(id))
  assert(lost.length === 0, `${relativePath}: lost existing authored targets ${lost}`)
  const reached = originalRoles.targetGoalIds.has(delta.parentBefore.id)
  const childrenVisible = delta.childCandidates.every((child: any) => proposedRoles.targetGoalIds.has(child.id))
  if (reached) assert(childrenVisible, `${relativePath}: missing child mechanism`)
  viewChecks.push({ path: relativePath, originalParentTargetReached: reached, explicitEntryDeltas: changes.length, bothChildrenTargetVisible: childrenVisible, lostOriginalTargetIds: lost, compilerErrorCountBefore: originalErrors.length, compilerErrorCountAfter: proposedErrors.length, actualJurisdictionYearRuntimeAcceptanceClaimed: false })
}
assert(actualEntryCount === 26 && actualEntryCount === placements.authoredGoalEntryCount, 'Expected all26 exact authored placement changes')
assert(viewChecks.length === 37, 'Expected all37 authored views checked')
assert(viewChecks.filter(r => r.originalParentTargetReached).length === 34, 'Expected34 actual parent-target views; BW GK/LK and national SekI do not reach this parent')
const atoms = new Set([...after.values()].filter((g: any) => g.type === 'atomic' && !g.contains?.length).map((g: any) => g.id))
const broad = canonical.goals.find((g: any) => g.tags?.includes('root'))
for (const child of delta.childCandidates) {
  assert(same(sourceAtlasDescendants(child.id, after, atoms, canonical.landscapeId), [child.id]), `Direct source cannot reach child ${child.id}`)
  assert(!sourceAtlasDescendants(delta.parentBefore.id, after, atoms, canonical.landscapeId).includes(child.id), `Old parent mapping improperly inherits child approval ${child.id}`)
  if (broad) assert(!sourceAtlasDescendants(broad.id, after, atoms, canonical.landscapeId).includes(child.id), `Broad root mapping improperly inherits child approval ${child.id}`)
}
const mappingSnapshots = []
for (const item of sources.mappingDeltas) {
  const actual = await read(local(item.mappingPathBefore))
  assert(hash(await readFile(local(item.mappingPathBefore))) === item.mappingSha256Before, `${item.sourceGoalId}: mapping bytes changed`)
  const decision = actual.decisions.find((r: any) => r.sourceGoalId === item.sourceGoalId)
  assert(same(decision, item.decisionBefore), `${item.sourceGoalId}: decision before differs`)
  if (item.edgeBefore) assert(actual.mappings.some((r: any) => same(r, item.edgeBefore)), `${item.sourceGoalId}: original edge missing`)
  if (item.existingEdgesBefore) assert(same(actual.mappings.filter((r: any) => r.legacyGoalId === item.sourceGoalId), item.existingEdgesBefore), `${item.sourceGoalId}: supplemental original edges differ`)
  const childEdges = [...(item.replacementEdgesCandidate ?? []), ...(item.additionalEdgesCandidate ?? [])]
  assert(childEdges.every((r: any) => r.matchType === 'partial'), `${item.sourceGoalId}: overbroad each-child exact claim`)
  for (const id of item.unmodifiedOtherTargets ?? []) assert(item.decisionAfterCandidate.canonicalGoalIds.includes(id), `${item.sourceGoalId}: other source target dropped`)
  mappingSnapshots.push({ sourceGoalId: item.sourceGoalId, beforeDecisionCurrent: true, childTargets: childEdges.map((r: any) => r.canonicalGoalId), childMatchTypes: childEdges.map((r: any) => r.matchType), unchangedOtherTargetsPreserved: item.unmodifiedOtherTargets ?? [], sourceNormativeScopeApproved: false })
}
for (const item of sources.sourceExtractionGoalDeltas) {
  const actual = await read(local(item.sourceExtractionPathBefore))
  assert(hash(await readFile(local(item.sourceExtractionPathBefore))) === item.sourceExtractionSha256Before, `${item.sourceGoalBefore.id}: source bytes changed`)
  assert(same(resolvePointer(actual, item.goalPointer), item.sourceGoalBefore), `${item.sourceGoalBefore.id}: extraction before differs`)
  assert(item.sourceGoalBefore.sourceText === item.sourceGoalAfterCandidate.sourceText, `${item.sourceGoalBefore.id}: sourceText altered`)
}
const matchingCards = []
for (const deck of am.actualCardOriginScan.deckInputs) {
  assert(hash(await readFile(local(deck.path))) === deck.sha256, `${deck.path}: deck bytes changed`)
  const json = await read(local(deck.path))
  const scan = (node: any) => {
    if (Array.isArray(node)) { for (const child of node) scan(child); return }
    if (!node || typeof node !== 'object') return
    if (node.originGoalIds?.includes(delta.parentBefore.id) || node.originGoalId === delta.parentBefore.id) matchingCards.push(node)
    for (const [key, value] of Object.entries(node)) if (key !== 'originGoalIds') scan(value)
  }
  scan(json)
}
assert(matchingCards.length === 0, 'Existing parent-origin cards require explicit retention/adaptation')
const receipt = { schemaVersion: 1, checkedAt: new Date().toISOString(), status: errors.length ? 'fail' : 'pass_independent_D_only_static_preservation', independentReviewer: 'codex-chemie-8ceb-review-a', pFilesOpened: false, currentGoalCount: before.size, candidateGoalCount: after.size, exactParentBeforeCurrent: true, dependencyFieldChanges, authoredDirectPlacementCount: actualEntryCount, authoredViewsChecked: viewChecks.length, authoredViewsReachingOldParent: viewChecks.filter(r => r.originalParentTargetReached).length, viewChecks, sourceBoundaryCheckedWithActualHelper: true, mappingSnapshots, sourceTextPreservedInAllFourRestrictedRecords: true, parentOriginCardsFound: matchingCards.length, activeWrites: [], currentStrictClosuresClaimed: 0, protectedFloorOrRuntimeAcceptanceClaimed: false, errors }
await writeFile(resolve(own, 'D-static-preservation.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
console.log(JSON.stringify({ status: receipt.status, directPlacements: actualEntryCount, viewsChecked: viewChecks.length, affectedViews: receipt.authoredViewsReachingOldParent, mappingSnapshots: mappingSnapshots.length, errors }))
if (errors.length) process.exitCode = 1
