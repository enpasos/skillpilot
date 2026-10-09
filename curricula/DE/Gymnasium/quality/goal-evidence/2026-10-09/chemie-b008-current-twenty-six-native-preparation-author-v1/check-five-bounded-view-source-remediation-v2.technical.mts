// SPDX-License-Identifier: Apache-2.0
// New bounded author candidates; ordinary compiler/facet checks are technical only.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), out = resolve(own, 'source-view-remediation-author-v2')
const bind = (path: string) => { const bytes = readFileSync(path); return { path: relative(root, path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (name: string, value: any) => { const path = resolve(out, name), bytes = JSON.stringify(value, null, 2) + '\n'; mkdirSync(dirname(path), { recursive: true }); if (existsSync(path)) assert.equal(readFileSync(path, 'utf8'), bytes, 'Never overwrite a different candidate'); else writeFileSync(path, bytes); return bind(path) }
const inputPath = resolve(own, 'source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json')
const input = read(inputPath), fixes = read(resolve(out, 'five-current-original-source-role-corrections-and-partners.author-candidate.json'))
const canonical = read(resolve(root, fixes.candidateCanonical.path)), kinds = read(resolve(own, 'candidate/semantic-kinds.current504.technical-review-input.json'))
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g])), byKind = new Map<string, any>(kinds.decisions.map((d: any) => [d.goalId, d.semanticKind]))
for (const decision of kinds.decisions) assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(goals.get(decision.goalId)), 'No fabricated kind rebind')
const atoms = new Set(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
const classified = { ...canonical, goals: canonical.goals.map((g: any) => ({ ...g, semanticKind: byKind.get(g.id) })) }
const pairedPath = resolve(own, '../chemie-b008-partner-preserving-views-pairing-root-v1/thirty-five-whole-source-view-occurrences.independent-first-pairing.actual.json')
const paired = read(pairedPath)
assert.equal(bind(pairedPath).sha256, 'sha256:9f5a7d8544a3eb4711decb0662b9b34a5637466f5b3f30b7c78622fb3c42ddb0')
const boundedFirstIndices = new Set(paired.pairedBoundedRemovalCandidates as number[])
assert.equal(boundedFirstIndices.size, 9)
const newAuthorFixIndices = new Set([6, 10, 24, 29, 30])
const selected = new Set([...boundedFirstIndices, ...newAuthorFixIndices])
const additions = new Map(fixes.partnerCorrections.map((row: any) => [row.newBoundedSourceRole.entryIndex, row.newBoundedSourceRole.newPartnerGoalId]))
const views: any[] = []
const targetAtoms = (view: any) => new Set([...collectCompositionProjectionRoleGoalIds(view.rootNodes, goals).targetGoalIds].filter(id => atoms.has(id)))
for (const viewId of [...new Set(input.entries.map((r: any) => r.viewId))] as string[]) {
  const indexed = input.entries.map((row: any, index: number) => ({ row, index })).filter((r: any) => r.row.viewId === viewId)
  const beforePath = resolve(root, indexed[0].row.beforeViewBinding.path), before = read(beforePath), after = structuredClone(before)
  assert.deepEqual(bind(beforePath), { ...indexed[0].row.beforeViewBinding, sha256: 'sha256:' + indexed[0].row.beforeViewBinding.sha256.replace(/^sha256:/, '') })
  const removed = indexed.filter((r: any) => selected.has(r.index)), removedIds = new Set(removed.map((r: any) => r.row.finding.goalId))
  let removedCount = 0
  const transform = (nodes: any[]): any[] => nodes.flatMap(node => {
    if (node.kind === 'goalEntry' && removedIds.has(node.goalId)) { removedCount++; return [] }
    return [{ ...node, ...(node.children ? { children: transform(node.children) } : {}) }]
  })
  after.rootNodes = transform(after.rootNodes)
  assert.equal(removedCount, removed.length)
  const beforeAtoms = targetAtoms(before), newTargets: string[] = []
  for (const { index } of indexed) {
    const id = additions.get(index) as string | undefined
    if (!id || beforeAtoms.has(id)) continue
    const rootNode = after.rootNodes.find((node: any) => node.kind === 'structure')
    assert.ok(rootNode?.children, 'Keep existing whole scope tree; only add precise content target under its authored root')
    rootNode.children.push({ kind: 'goalEntry', goalId: id, projectionRole: 'target' })
    newTargets.push(id)
  }
  const afterAtoms = targetAtoms(after), lost = [...beforeAtoms].filter(id => !afterAtoms.has(id))
  assert.deepEqual(lost, [])
  assert.deepEqual([...afterAtoms].filter(id => !beforeAtoms.has(id)).sort(), newTargets.sort())
  assert.deepEqual(before.scope, after.scope)
  const beforeFindings = compileCompositionView(before, classified).findings, afterFindings = compileCompositionView(after, classified).findings
  const beforeOpaque = beforeFindings.filter((f: any) => f.code === 'CPV-009' && f.severity === 'error'), afterOpaque = afterFindings.filter((f: any) => f.code === 'CPV-009' && f.severity === 'error')
  assert.equal(beforeOpaque.length - afterOpaque.length, removedCount)
  assert.deepEqual(afterFindings.filter((f: any) => f.severity === 'error' && f.code !== 'CPV-009'), [], 'No new ordinary compiler errors')
  const candidateBinding = write(`whole-view-candidates-paired-first/${viewId}.bounded-v2.author-candidate.json`, after)
  views.push({ viewId, scope: before.scope, originalView: bind(beforePath), candidateView: candidateBinding, preciseRemovedReferences: removed.map((r: any) => ({ entryIndex: r.index, familyGoalId: r.row.finding.goalId, originalNodePath: r.row.finding.nodePath, authority: newAuthorFixIndices.has(r.index) ? 'new_author_remedy_pending_independent_review' : 'genuine_original_independent_A_and_B_bounded_first_verdicts_reused_no_new_whole_approval' })), newExistingWholeContentTargets: newTargets, lostOriginalTargetAtoms: lost, wholeBeforeAtomicTargets: [...beforeAtoms].sort(), wholeAfterAtomicTargets: [...afterAtoms].sort(), originalOpaqueFindings: beforeOpaque, actualRemainingOpaqueFindings: afterOpaque, allOtherCompilerErrorFindings: [], wholeSourceAndViewApproval: false })
}
const thExtractionPath = resolve(out, 'TH-upper-primary-column-faithful-two-course-roles.source-extraction.author-candidate.json'), th = read(thExtractionPath)
console.log(JSON.stringify({ phase: 'sixteen_normal_whole_views_checked', count: views.length }))
const selectedTH = new Set(fixes.THCourseDeltas.map((row: any) => row.goalId))
const thFacet = (goal: any) => {
  const passage = th.passages.find((p: any) => p.id === goal.passageId)
  const sourceDocumentKeys = [...new Set([goal.sourceDocumentKey, ...(goal.tags ?? []).filter((tag: string) => tag.startsWith('sourceDocument:')).map((tag: string) => tag.slice('sourceDocument:'.length)), passage?.sourceDocumentKey].filter(Boolean))]
  const documents = sourceDocumentKeys.length ? th.sourceDocuments.filter((d: any) => d.key === sourceDocumentKeys[0]) : th.sourceDocuments
  assert.equal(documents.length, 1, 'Follow the ordinary document resolution from fields and sourceDocument tags')
  const document = documents[0]
  assert.ok(passage)
  return { sourceGoalId: goal.id, stage: sourceAtlasFacet([goal, passage, document, th], 'stage'), courseProfiles: sourceAtlasFacet([goal, passage, document, th], 'courseProfile') }
}
const correctedFacets = th.sourceGoals.filter((g: any) => selectedTH.has(g.id)).map(thFacet)
console.log(JSON.stringify({ phase: 'TH_two_source_facets', correctedFacets }))
for (const facet of correctedFacets) { assert.deepEqual(facet.stage, ['SekII']); assert.deepEqual(facet.courseProfiles, ['LK']) }
const sharedRf = th.sourceGoals.find((g: any) => g.id.includes('-153-01-'))
assert.ok(sharedRf, 'The whole existing shared chromatographic principles/Rf duty remains present')
const sharedFacet = thFacet(sharedRf); assert.deepEqual(sharedFacet.courseProfiles, ['GK', 'LK'])
console.log(JSON.stringify({ phase: 'TH_shared_Rf_control', sharedFacet }))
const totalRemoved = views.reduce((n, view) => n + view.preciseRemovedReferences.length, 0), totalHolds = views.reduce((n, view) => n + view.actualRemainingOpaqueFindings.length, 0)
assert.equal(totalRemoved, 14); assert.equal(totalHolds, 21)
const report = { schemaVersion: 1, role: 'Ordinary technical author check of five precise source/partner/course fixes and retained genuine bounded removals; no independent source or M7 closure', exactWholeOriginalInput: bind(inputPath), actualPairedIndependentFirstSourceViewResults: bind(pairedPath), exactNewSourceFixes: bind(resolve(out, 'five-current-original-source-role-corrections-and-partners.author-candidate.json')), unchangedKindLedgerActualSourceFingerprints: true, wholeExistingCanonicalGoalCount: canonical.goals.length, wholeInactiveAtomicCount: atoms.size, views, originalOpaqueEntryCount: 35, genuineFirstBoundedRemovalCandidatesReused: 9, newPrecisePendingAuthorRemedies: 5, removedOpaqueReferencesInCandidateOnly: totalRemoved, actualRemainingSourceOperatorOrCourseHolds: totalHolds, all26PairedSourceHoldsStillUnapproved: true, sixOriginalFirstDissentsPreserved: paired.sixUnresolvedFirstDissentOccurrences, noOldAtomicTargetsLost: true, sourceFacetAPI: 'unchanged sourceAtlasFacet', correctedTHFacets: correctedFacets, preservedSharedChromatographyRfFacet: sharedFacet, ordinaryCompilerChanged: false, ordinaryQualityLimitsChanged: false, activeWrites: [], humanApproval: false, strictGain: 0 }
const proof = write('five-bounded-view-source-remediation.actual-normal-proof.json', report)
console.log(JSON.stringify({ proof, views: views.length, removed: totalRemoved, actualRemainingHolds: totalHolds, threeSourcePartnerTargets: views.flatMap(v => v.newExistingWholeContentTargets), correctedTHFacets: correctedFacets, strictGain: 0 }))
