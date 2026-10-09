// SPDX-License-Identifier: Apache-2.0
// Actual ordinary loaders/profile/campaign contracts; no source or native verdict.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates.ts'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), out = resolve(own, 'source-view-remediation-author-v3')
const bind = (path: string) => { const bytes = readFileSync(path); return { path: relative(root, path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const write = (name: string, value: any) => { const path = resolve(out, name); assert.ok(!existsSync(path)); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2) + '\n'); return bind(path) }
const canonicalPath = resolve(out, 'canonical504-one-faithful-redox-EN-existing-fields-kept.author-candidate.json')
const beforePath = resolve(own, 'source-view-remediation-author-v2/canonical504-two-precise-existing-target-source-jurisdictions.author-candidate.json')
const canonical = read(canonicalPath), before = read(beforePath)
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const redox = '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9', metal = 'fcaf8c9b-bd81-552e-9d91-43649895471e', secondary = '16b24dc5-0e48-5e3b-8307-01289db8d1a9'
assert.equal(canonical.goals.length, 504)
for (let i = 0; i < before.goals.length; i++) {
  const old = before.goals[i], current = canonical.goals[i]
  if (old.id === redox) assert.deepEqual({ ...current, descriptionEn: old.descriptionEn }, old)
  else assert.deepEqual(current, old)
}
const originalKindsPath = resolve(own, 'candidate/semantic-kinds.current504.technical-review-input.json')
const kinds = read(originalKindsPath)
const oldKindRow = kinds.decisions.find((d: any) => d.goalId === redox)
const originalKind = structuredClone(oldKindRow)
const oldFingerprint = originalKind.sourceFingerprint
oldKindRow.sourceFingerprint = fingerprintSemanticKindSourceGoal(goals.get(redox))
assert.equal(oldKindRow.semanticKind, originalKind.semanticKind)
for (const decision of kinds.decisions) assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(goals.get(decision.goalId)))
const kindBinding = write('semantic-kinds504-only-actual-EN-source-binding.technical-review-input.json', kinds)
const atoms = new Set(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
assert.equal(atoms.size, 395)
const classified = { ...canonical, goals: canonical.goals.map((g: any) => ({ ...g, semanticKind: kinds.decisions.find((d: any) => d.goalId === g.id).semanticKind })) }
const previousProof = read(resolve(own, 'source-view-remediation-author-v2/five-bounded-view-source-remediation.actual-normal-proof.json'))
const originalInput = read(resolve(own, 'source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json'))
const correctionsPath = resolve(out, 'three-secondary-partial-source-companions-four-view-occurrences.author-candidates.json')
const corrections = read(correctionsPath), removedIndices = new Set([19, 26, 31, 34])
const targetAtoms = (view: any) => new Set([...collectCompositionProjectionRoleGoalIds(view.rootNodes, goals).targetGoalIds].filter(id => atoms.has(id)))
const views: any[] = []
for (const oldView of previousProof.views) {
  const currentBeforePath = resolve(root, oldView.candidateView.path), currentBefore = read(currentBeforePath), after = structuredClone(currentBefore)
  const selected = originalInput.entries.map((row: any, index: number) => ({ row, index })).filter((x: any) => removedIndices.has(x.index) && x.row.viewId === oldView.viewId)
  const refs = new Set(selected.map((x: any) => x.row.finding.goalId))
  let removed = 0
  const transform = (nodes: any[]): any[] => nodes.flatMap(node => {
    if (node.kind === 'goalEntry' && refs.has(node.goalId)) { removed++; return [] }
    return [{ ...node, ...(node.children ? { children: transform(node.children) } : {}) }]
  })
  after.rootNodes = transform(after.rootNodes)
  assert.equal(removed, selected.length)
  const beforeAtoms = targetAtoms(currentBefore), afterAtoms = targetAtoms(after)
  if (selected.length) assert.ok(beforeAtoms.has(secondary), 'Use already-targeted actual secondary atom; do not invent placement')
  assert.deepEqual([...afterAtoms].sort(), [...beforeAtoms].sort(), 'All existing atomic targets remain exactly')
  assert.deepEqual(after.scope, currentBefore.scope)
  const findings = compileCompositionView(after, classified).findings
  assert.deepEqual(findings.filter((f: any) => f.severity === 'error' && f.code !== 'CPV-009'), [])
  const candidateView = write(`whole16-views/${oldView.viewId}.bounded-secondary-v3.author-candidate.json`, after)
  views.push({ viewId: oldView.viewId, beforeCandidateView: bind(currentBeforePath), candidateView,
    scope: after.scope, wholeBeforeTargetAtoms: [...beforeAtoms].sort(), wholeAfterTargetAtoms: [...afterAtoms].sort(),
    newlyRemovedSecondaryOnlyReferences: selected.map((x: any) => ({ entryIndex: x.index, familyGoalId: x.row.finding.goalId })),
    actualRemainingCPV009: findings.filter((f: any) => f.severity === 'error' && f.code === 'CPV-009'),
    noNewTargetOrLostTarget: true, newOperativeSourceAndNativeReviewPending: true })
}
assert.equal(views.reduce((n, v) => n + v.newlyRemovedSecondaryOnlyReferences.length, 0), 4)
assert.equal(views.reduce((n, v) => n + v.actualRemainingCPV009.length, 0), 17)
const facets: any[] = []
for (const row of corrections.newMappings) {
  const mapping = read(resolve(root, row.candidateMapping.path)), extraction = read(resolve(root, mapping.sourceExtractionPath))
  const fix = corrections.corrections.find((c: any) => c.newPartialRole.jurisdiction === row.jurisdiction)
  const source = extraction.sourceGoals.find((g: any) => g.id === fix.newPartialRole.sourceGoalId)
  const passage = extraction.passages.find((p: any) => p.id === source.passageId)
  const sourceDocumentKeys = [...new Set([source.sourceDocumentKey, ...(source.tags ?? []).filter((t: string) => t.startsWith('sourceDocument:')).map((t: string) => t.slice('sourceDocument:'.length)), passage.sourceDocumentKey].filter(Boolean))]
  const docs = extraction.sourceDocuments ?? [extraction.sourceDocument]
  const document = sourceDocumentKeys.length ? docs.find((d: any) => d.key === sourceDocumentKeys[0]) : docs[0]
  assert.ok(document)
  const stage = sourceAtlasFacet([source, passage, document, extraction], 'stage'), course = sourceAtlasFacet([source, passage, document, extraction], 'courseProfile')
  assert.deepEqual(stage, ['SekII'])
  assert.deepEqual(course, row.jurisdiction === 'DE-TH' ? ['GK', 'LK'] : ['LK'])
  const decision = mapping.decisions.find((d: any) => d.sourceGoalId === source.id)
  assert.equal(decision.reviewer, null); assert.equal(decision.reviewedAt, null)
  assert.ok(decision.canonicalGoalIds.includes(secondary))
  assert.equal(mapping.mappings.filter((m: any) => m.legacyGoalId === source.id && m.canonicalGoalId === secondary && m.matchType === 'partial').length, 1)
  facets.push({ jurisdiction: row.jurisdiction, sourceGoalId: source.id, wholeCurrentSourceText: source.sourceText,
    actualSourceSpan: source.sourceSpan, ordinaryStage: stage, ordinaryCourseProfiles: course, pendingMetadata: true })
}
const candidatePath = resolve(out, 'MV-metal-model.normal-whole-positive-candidate-set.author-v3.json'), candidateSet = read(candidatePath)
const config = read(resolve(own, 'seven-operative-native-preparation-v2/P7.actual-current-raster.ordinary-author-candidate.config.json'))
config.reviewId = candidateSet.reviewId
config.landscapePath = relative(root, canonicalPath)
config.semanticKindLedgerPath = kindBinding.path
config.reviewPath = relative(root, resolve(out, 'MV-metal-model.actual-normal-v2.author-candidate.review.jsonl'))
config.scope = { label: 'Whole unchanged metal model with targeted actual MV voltage/electron/vibrating-ion source role; independent native/source reviews pending', goalIds: [metal] }
const configBinding = write('MV-metal-model.actual-normal-v2.author-candidate.config.json', config)
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
assert.equal(records.length, 1); assert.equal(records[0].authority, 'ai_candidate'); assert.equal(records[0].status, 'needs_human_review')
const recordsPath = resolve(root, config.reviewPath)
assert.ok(!existsSync(recordsPath)); writeFileSync(recordsPath, records.map(r => JSON.stringify(r)).join('\n') + '\n')
const reviewed = await reviewPositiveGoalEvidenceConfig(config)
assert.deepEqual(reviewed.errors, [])
const report = write('actual-three-secondary-one-EN-one-MV-profile.normal-contract-proof.json', {
  schemaVersion: 1, role: 'Actual ordinary normal contracts of inactive v3 source/EN/model materials; no independent review',
  canonical: bind(canonicalPath), beforeAuthorCanonical: bind(beforePath), exactlyOneENFieldChanged: redox,
  other503GoalObjectsExact: true, descriptionDERequiresAndImagesExact: true,
  newTechnicalKindInput: kindBinding, unchangedSemanticKindDecision: originalKind.semanticKind,
  oneKindSourceFingerprintBefore: oldFingerprint, oneKindSourceFingerprintAfter: oldKindRow.sourceFingerprint,
  actualKindFingerprintChanged: oldFingerprint !== oldKindRow.sourceFingerprint,
  semanticKindBindingIsTechnicalOnlyTargetedIndependentEN_AMReviewPending: true,
  whole16Views: views, threeNewSecondaryPartialSourceFacets: facets,
  actualRemainingOpaqueReferences: 17, fourSecondaryReferencesRemovedOnlyInCandidate: true,
  allOriginal395AtomicTargetSetsExact: true, sourceHoldsNotApprovedByTechnicalCompiler: true,
  MVWholeOneNormalProfile: { config: configBinding, records: bind(recordsPath), actualRecordCount: records.length,
    normalErrors: reviewed.errors, authority: records[0].authority, status: records[0].status,
    evidenceLevel: records[0].evidenceLevel, maximumClaimScope: records[0].maximumClaimScope,
    actualNativeAndScientificIndependentReview: 'PENDING' },
  originalFirstSealsRemainUnchanged: true, normalCompilerOrGateChanges: false,
  activeWrites: [], netStrictGain: 0, humanApproval: false, humanTrial: false })
console.log(JSON.stringify({ report, normalProfileErrors: reviewed.errors, sourceEdges: 3,
  unchangedTargetViews: 16, candidateOpaqueHolds: 17, newIndependentApprovals: 0, gain: 0 }))
