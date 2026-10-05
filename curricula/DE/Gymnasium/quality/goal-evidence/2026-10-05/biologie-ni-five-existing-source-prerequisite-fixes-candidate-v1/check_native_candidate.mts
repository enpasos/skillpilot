// Apache-2.0. Inactive author proposal, no publication or D/P/A/M/V approval.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { fingerprintGoalForEvidence } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'

const here = dirname(fileURLToPath(import.meta.url))
const read = (n: string) => JSON.parse(readFileSync(resolve(here, n), 'utf8'))
const write = (n: string, o: unknown) => writeFileSync(resolve(here, n), JSON.stringify(o, null, 2) + '\n')
const before = JSON.parse(readFileSync(resolve(here, '../biologie-ni-five-current-adoption-candidate-v3/canonical.biologie.candidate.json'), 'utf8'))
const after = read('canonical.edge-only.inactive.candidate.json')
const templateFile = read('four-missing-seki.goal-templates.candidate.json')
const delta = read('one-existing-prerequisite.before-after.candidate.json')
const strictIds: string[] = read('strict37.inputs.metadata-only.json').strictCompleteGoalIds
const dna = '0daa79f6-8f61-5506-98f9-65db83062ba8'
const protein = '475eebb4-4eb0-524f-b1ec-4a672bf856d2'
const pedigree = '440854be-7f06-5678-91cb-ba8dcab56959'
const five = ['0db20819-ee94-54c6-8ecb-aff8c9b7419e', pedigree, '9dff0360-c2e9-5e43-af8b-87e264281cf7', '9f73b963-5fac-5a90-a993-d7b7c0cc8526', 'ffef97e3-12d6-5090-9816-46ab9e57fae2']
const oldGoals = new Map<string, any>(before.goals.map((g: any) => [g.id, g]))
const newGoals = new Map<string, any>(after.goals.map((g: any) => [g.id, g]))
assert.equal(oldGoals.size, newGoals.size)
for (const [id, old] of oldGoals) {
  if (id !== pedigree) assert.deepEqual(newGoals.get(id), old)
}
assert.deepEqual({ ...newGoals.get(pedigree), requires: oldGoals.get(pedigree).requires }, oldGoals.get(pedigree))
assert.deepEqual(newGoals.get(pedigree).requires, delta.after)
const canonicalDiagnostics = validateCanonicalLandscape(normalizeCanonicalLandscape(after))
assert.deepEqual(canonicalDiagnostics.filter(f => f.severity === 'error'), [])
const native = (c: any) => new Map<string, any>(prepareLandscapeEntries([c])[0].goals.map(g => [g.id, g]))
const oldNative = native(before), newNative = native(after)
const strip = (r: string) => r.replace(before.landscapeId + ':', '')
const checkRequiresDAG = (n: Map<string, any>) => {
  const visiting = new Set<string>(), visited = new Set<string>()
  const visit = (id: string, path: string[]) => {
    assert(n.has(id), `Missing native prerequisite: ${id}`)
    assert(!visiting.has(id), `Native effective-requires cycle: ${[...path, id].join(' -> ')}`)
    if (visited.has(id)) return
    visiting.add(id)
    for (const r of n.get(id)?.effectiveRequires ?? []) visit(strip(r), [...path, id])
    visiting.delete(id); visited.add(id)
  }
  for (const id of n.keys()) visit(id, [])
  return { missingReferences: [], cycles: [], nodesChecked: visited.size }
}
const requiresBefore = checkRequiresDAG(oldNative)
const requiresAfter = checkRequiresDAG(newNative)
const ancestors = (id: string, n: Map<string, any>, visited = new Set<string>()): Set<string> => {
  if (visited.has(id)) return visited
  visited.add(id)
  for (const r of n.get(id)?.effectiveRequires ?? []) ancestors(strip(r), n, visited)
  return visited
}
const oldReverse = (id: string) => [...oldNative].filter(([, g]) => (g.effectiveRequires ?? []).map(strip).includes(id)).map(([i]) => i).sort()
const newReverse = (id: string) => [...newNative].filter(([, g]) => (g.effectiveRequires ?? []).map(strip).includes(id)).map(([i]) => i).sort()
const nodeContext = (id: string, n: Map<string, any>, reverse: (id: string) => string[]) => ({
  effectiveRequires: (n.get(id)?.effectiveRequires ?? []).map(strip).sort(),
  transitivePrerequisites: [...ancestors(id, n)].filter(i => i !== id).sort(),
  reverseEffectiveRequires: reverse(id),
})
const oldFP = (g: any) => fingerprintGoalForEvidence(g, 'goal-evidence-v1')
const contextChanges = [...oldGoals].map(([id, g]) => ({
  goalId: id, title: g.title,
  goalEvidenceFingerprintBefore: oldFP(g), goalEvidenceFingerprintAfter: oldFP(newGoals.get(id)),
  semanticKindFingerprintBefore: fingerprintSemanticKindSourceGoal(g), semanticKindFingerprintAfter: fingerprintSemanticKindSourceGoal(newGoals.get(id)),
  beforeContext: nodeContext(id, oldNative, oldReverse), afterContext: nodeContext(id, newNative, newReverse),
})).filter(r => r.goalEvidenceFingerprintBefore !== r.goalEvidenceFingerprintAfter || JSON.stringify(r.beforeContext) !== JSON.stringify(r.afterContext))
const fivePathResults = five.map(goalId => ({goalId, beforeDNAPath: ancestors(goalId, oldNative).has(dna), afterEdgeDeltaDNAPath: ancestors(goalId, newNative).has(dna)}))
assert.equal(fivePathResults.filter(r => r.beforeDNAPath).length, 5)
assert.equal(fivePathResults.filter(r => r.afterEdgeDeltaDNAPath).length, 2)
assert(!ancestors(pedigree, newNative).has(protein))

// Temporary in-memory references support native validation only. They are not
// stable IDs, are never written as canonical atoms, and are not an adoption.
const ephemeral = new Map<string, string>(templateFile.goalTemplates.map((t: any) => [t.candidateKey, 'author-check-only:' + t.candidateKey]))
const withTemplates = structuredClone(after)
for (const t of templateFile.goalTemplates) {
  assert.equal(t.id, null)
  withTemplates.goals.push({ id: ephemeral.get(t.candidateKey), title: t.title, titleEn: t.titleEn,
    description: t.description, descriptionEn: t.descriptionEn, contains: [],
    requires: [...t.requires, ...t.requiresCandidateKeys.map((k: string) => ephemeral.get(k))],
    tags: t.tags, type: 'atomic', weight: 1, applicability: t.applicability })
}
const templateDiagnostics = validateCanonicalLandscape(normalizeCanonicalLandscape(withTemplates))
assert.deepEqual(templateDiagnostics.filter(f => f.severity === 'error'), [])
const templateNative = native(withTemplates)
const requiresWithTemplates = checkRequiresDAG(templateNative)
const templatePaths = templateFile.goalTemplates.map((t: any) => {
  const a = ancestors(ephemeral.get(t.candidateKey)!, templateNative)
  const r = {candidateKey: t.candidateKey, goalId: null,
    noDNAPrerequisite: !a.has(dna), noProteinBiosynthesisPrerequisite: !a.has(protein),
    existingPrerequisiteIds: [...a].filter(i => oldGoals.has(i)).sort(),
    prerequisiteCandidateKeys: templateFile.goalTemplates.filter((s: any) => s.candidateKey !== t.candidateKey && a.has(ephemeral.get(s.candidateKey)!)).map((s: any) => s.candidateKey)}
  assert(r.noDNAPrerequisite && r.noProteinBiosynthesisPrerequisite)
  return r
})
const symbolicContext = (id: string, n: Map<string, any>) => {
  const reverseRefs = [...n].filter(([, g]) => (g.effectiveRequires ?? []).map(strip).includes(id)).map(([i]) => i)
  return {
    existingGoalContext: nodeContext(id, n, () => reverseRefs.filter(i => oldGoals.has(i)).sort()),
    reverseRequiresCandidateReferences: templateFile.goalTemplates
      .filter((t: any) => reverseRefs.includes(ephemeral.get(t.candidateKey)!))
      .map((t: any) => ({goalId: null, candidateKey: t.candidateKey})),
  }
}
const combinedContextChanges = [...oldGoals].map(([goalId, g]) => ({
  goalId, title: g.title, beforeContext: symbolicContext(goalId, oldNative),
  afterContextIfFourTemplatesAdded: symbolicContext(goalId, templateNative),
})).filter(r => JSON.stringify(r.beforeContext) !== JSON.stringify(r.afterContextIfFourTemplatesAdded))
write('native-dag-and-effective-prerequisite-check.receipt.json', {
  status: 'author_candidate', activeWrites: 0, nativeFunctions: ['prepareLandscapeEntries', 'normalizeCanonicalLandscape', 'validateCanonicalLandscape'],
  canonicalRecordsBefore: before.goals.length, canonicalRecordsAfterEdgeOnly: after.goals.length,
  canonicalErrors: canonicalDiagnostics.filter(f => f.severity === 'error'), canonicalWarnings: canonicalDiagnostics.filter(f => f.severity !== 'error'),
  inMemoryTemplateErrors: templateDiagnostics.filter(f => f.severity === 'error'), inMemoryTemplateWarnings: templateDiagnostics.filter(f => f.severity !== 'error'),
  directlyChangedExistingGoalIds: [pedigree], allOtherExistingBodiesExactlyPreserved: true,
  fullCompetencySemantics440Preserved: true, stableIDsAssigned: 0,
  nativeInheritedClusterRequiresIncluded: true, fivePathResults, templatePaths,
  nativeEffectiveRequiresDAGBefore: requiresBefore, nativeEffectiveRequiresDAGAfter: requiresAfter,
  nativeEffectiveRequiresDAGWithInMemoryTemplates: requiresWithTemplates,
  canonicalValidatorScope: 'contains/reference/type checks; effective-requires cycles and references additionally checked on the actual native prepared graph',
  unresolvedOriginalMolecularPathsGloballyPreserved: ['9f73b963-5fac-5a90-a993-d7b7c0cc8526', 'ffef97e3-12d6-5090-9816-46ab9e57fae2'],
  sourceRetargetsNotMaterializedInAnyViewOrRegistry: true,
  nativeDAGPassIsNotCurricularStageOrCoverageApproval: true,
  independentD2Passed: false, APassed: false, MPassed: false, VPassed: false, PContentsRead: false, humanApproval: false,
})
write('reverse-requires-and-strict37.context-impact.candidate.json', {
  status: 'author_candidate', sourceStrict37MetadataOnly: true, existingCanonicalContextChanges: contextChanges,
  directGoalEvidenceFingerprintChanges: contextChanges.filter(r => r.goalEvidenceFingerprintBefore !== r.goalEvidenceFingerprintAfter).map(r => r.goalId),
  directSemanticKindFingerprintChanges: contextChanges.filter(r => r.semanticKindFingerprintBefore !== r.semanticKindFingerprintAfter).map(r => r.goalId),
  strict37DirectFingerprintChangedGoalIds: contextChanges.filter(r => strictIds.includes(r.goalId) && r.goalEvidenceFingerprintBefore !== r.goalEvidenceFingerprintAfter).map(r => r.goalId),
  strict37ContextChangedGoalIds: contextChanges.filter(r => strictIds.includes(r.goalId)).map(r => r.goalId),
  directReverseBeforeAfter: [dna, 'b8fc739d-f5de-5f83-92fe-28dc6597add5', pedigree].map(goalId => ({goalId, before: oldReverse(goalId), after: newReverse(goalId)})),
  requiredScopedFollowup: '440 changes its semantic-kind fingerprint while its goal-evidence fingerprint remains unchanged because the latter does not include requires. The operative prerequisite context still requires scoped D/A/M review; every listed changed book prerequisite/reverse-prerequisite context requires targeted current-context review. Existing source-retarget bindings require their own current source review. This file does not read P or approve views.',
  unaffectedStrict37StillNotReapproved: strictIds.filter(i => !contextChanges.some(r => r.goalId === i)),
  projectedStrict37CompletionClaim: false, humanApproval: false,
})
write('four-template-prospective-context-impact.candidate.json', {
  status: 'author_candidate', materialized: false, stableIDsAssigned: 0,
  additionalExistingReverseRequiresContextsFromFourTemplates: combinedContextChanges.filter(r => r.afterContextIfFourTemplatesAdded.reverseRequiresCandidateReferences.length > 0),
  combinedExistingContextChangeCount: combinedContextChanges.length,
  combinedExistingContextChanges: combinedContextChanges,
  strict37ContextChangedIfFourTemplatesAndEdgeAdded: combinedContextChanges.filter(r => strictIds.includes(r.goalId)).map(r => r.goalId),
  sourceMappingOrPlacementChangesNotIncluded: true,
  futureSourceViewsAndBookContextRequireSeparateExplicitValidation: true,
  currentStrict37ClosurePreservedClaim: false, PContentsRead: false, humanApproval: false,
})
console.log(JSON.stringify({nativeDag: 'PASS', withFourNullIdTemplatesInMemory: 'PASS', edgeOnlyDNAPathsRemoved: 3, globalMolecularPathsRetained: 2, directlyChangedExistingGoalIds: [pedigree], contextChanged: contextChanges.length, strict37ContextChanged: contextChanges.filter(r => strictIds.includes(r.goalId)).map(r => r.goalId), activeWrites: 0}))
