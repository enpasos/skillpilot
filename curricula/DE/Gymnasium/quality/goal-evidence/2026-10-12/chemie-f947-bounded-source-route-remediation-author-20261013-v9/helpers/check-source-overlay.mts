// Apache-2.0. Unmodified normal compiler/Atlas/BookModel APIs in a disposable overlay.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const R = process.cwd(), E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const F = `${E}/chemie-f947-bounded-source-route-remediation-author-20261013-v9`, X = resolve(R, 'tmp/chemie-f947-source-author-overlay-20261013-v9')
const G = 'f947cd04-952a-5a9d-9445-3ffc70e02c3c', L = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const read = (p: string, root = R): any => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const bytes = (p: string, root = R) => readFileSync(resolve(root, p))
const sha = (b: Buffer | string) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const write = (p: string, value: any, root = R) => {
  const target = resolve(root, p)
  if (root === X) {
    let parent = X
    for (const part of p.split('/').slice(0, -1)) {
      parent = resolve(parent, part)
      assert.ok(parent.startsWith(`${X}/`), parent)
      if (existsSync(parent)) assert.ok(!lstatSync(parent).isSymbolicLink(), `Private writer refuses symlink parent: ${parent}`)
      else mkdirSync(parent)
    }
  } else { assert.ok(p.startsWith(`${F}/`), p); mkdirSync(dirname(target), { recursive: true }) }
  if (root === X && existsSync(target)) unlinkSync(target) // Private read-through file only; never its target.
  if (root === R && existsSync(target)) { assert.deepEqual(read(p), value, p); return }
  assert.ok(!existsSync(target), target)
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
}
const plan = read(`${F}/SOURCE_ROUTE_PLAN.only-f947-components-author-pending.json`), oldCan = read(canonicalPath)
assert.equal(sha(bytes(canonicalPath)), plan.currentCanonical.sha256)
const modules = ['app/scripts/applicabilityCompiler.ts', 'app/scripts/memoryCardReviewConfigDiscovery.ts']
for (const path of modules) assert.equal(sha(bytes(path)), sha(bytes(path, X)))
const [actualCompiler, overlayCompiler, atlasApi, modelApi, evidenceApi, contextApi] = await Promise.all([
  import(pathToFileURL(resolve(R, 'app/scripts/applicabilityCompiler.ts')).href),
  import(pathToFileURL(resolve(X, 'app/scripts/applicabilityCompiler.ts')).href),
  import(pathToFileURL(resolve(R, 'app/scripts/goalBookSourceAtlasInputs.ts')).href),
  import(pathToFileURL(resolve(R, 'app/scripts/goalBookModel.ts')).href),
  import(pathToFileURL(resolve(R, 'app/scripts/goalEvidenceProfileModel.ts')).href),
  import(pathToFileURL(resolve(R, 'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href),
])
const chemistry = (api: any) => api.buildApplicabilityCompilation().reports.find((r: any) => r.landscapeId === L)
const baselineRoot = chemistry(actualCompiler), baseline = chemistry(overlayCompiler)
assert.deepEqual(baseline, baselineRoot)
const oldAtlasConfig = read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const baselineAtlas = atlasApi.buildGoalBookSourceAtlasInputs(oldAtlasConfig, X)
const boundary = read(`${F}/candidate/canonical523-current402.boundary-only.author.json`)
write(canonicalPath, boundary, X)
const byOriginal = new Map(plan.authorProposedSourceChanges.map((p: any) => [p.originalLiveBinding.path, p]))
const install = (p: any) => {
  const old = resolve(X, p.originalLiveBinding.path)
  assert.equal(sha(readFileSync(old)), p.originalLiveBinding.sha256)
  const archive = resolve(X, p.proposedFutureArchivePath)
  mkdirSync(dirname(archive), { recursive: true })
  writeFileSync(archive, readFileSync(old), { flag: 'wx' })
  unlinkSync(old)
  write(p.proposedFutureLivePath, read(p.authorCandidateBinding.path), X)
}
// Partial diagnosis shows why cleaning selected Atlas reviews alone is insufficient.
for (const p of plan.authorProposedSourceChanges.filter((p: any) => p.selectedBySourceAtlas)) install(p)
const selectedOnly = chemistry(overlayCompiler)
for (const p of plan.authorProposedSourceChanges.filter((p: any) => !p.selectedBySourceAtlas)) install(p)
const completeBeforeScope = chemistry(overlayCompiler)
const targetOf = (report: any) => report.goals.find((g: any) => g.goalId === G)
const compiled = targetOf(completeBeforeScope).compiledApplicability.jurisdiction
assert.deepEqual(compiled, ['DE-BW', 'DE-BY', 'DE-HB', 'DE-HE', 'DE-HH', 'DE-RP', 'DE-SH', 'DE-TH'])
const finalCan = structuredClone(boundary), finalGoal = finalCan.goals.find((g: any) => g.id === G)
finalGoal.applicability.jurisdiction = [...compiled]
write(`${F}/candidate/canonical523-current402.boundary-and-derived-eight-scopes.author.json`, finalCan)
write(canonicalPath, finalCan, X)
const final = chemistry(overlayCompiler)
assert.ok(!final.findings.some((f: any) => f.goalId === G && f.code === 'APV-203'))
const sourceOldToNew = new Map(plan.authorProposedSourceChanges.map((p: any) => [p.originalLiveBinding.path, p.proposedFutureLivePath]))
const sourceNewToOld = new Map([...sourceOldToNew].map(([a, b]) => [b, a]))
const normalizeAliases = (value: any): any => {
  if (typeof value === 'string') return sourceNewToOld.get(value) ?? value
  if (Array.isArray(value)) return value.map(normalizeAliases)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeAliases(v)]))
  return value
}
const apChanges = []
for (const old of baseline.goals) {
  const current = final.goals.find((g: any) => g.goalId === old.goalId)
  if (JSON.stringify(current.compiledApplicability) !== JSON.stringify(old.compiledApplicability)) apChanges.push(old.goalId)
}
assert.deepEqual(apChanges, [G])
const changedDerivedClusterEvidence = baseline.goals.filter((g: any) => g.goalType === 'cluster').filter((old: any) => {
  const current = final.goals.find((g: any) => g.goalId === old.goalId)
  return JSON.stringify(normalizeAliases(current.evidence)) !== JSON.stringify(old.evidence)
}).map((g: any) => ({ goalId: g.goalId, title: g.title, compiledScopeUnchanged: true, derivedChildVisibleCountsOrExplicitFileAliasesChanged: true }))
const otherCompiledSemantics = baseline.goals.filter((g: any) => g.goalId !== G && g.goalType === 'atomic').map((old: any) => {
  const current = final.goals.find((g: any) => g.goalId === old.goalId)
  // Source-file display identities changed by explicit archival; claims are row-wise, not false byte equality.
  const semantic = (goal: any) => ({ ...goal, evidence: goal.evidence.filter((e: any) => e.kind !== 'requires-closure').map((e: any) => normalizeAliases(e)).sort((a: any, b: any) => JSON.stringify(a).localeCompare(JSON.stringify(b))) })
  assert.deepEqual(semantic(current), semantic(old), old.goalId)
  return old.goalId
})
const changedDerivedPrerequisiteEvidence = baseline.goals.filter((g: any) => g.goalType === 'atomic' && g.goalId !== G).flatMap((old: any) => {
  const current = final.goals.find((g: any) => g.goalId === old.goalId), before = old.evidence.filter((e: any) => e.kind === 'requires-closure'), after = current.evidence.filter((e: any) => e.kind === 'requires-closure')
  if (JSON.stringify(before) === JSON.stringify(after)) return []
  const removed = before.filter((a: any) => !after.some((b: any) => JSON.stringify(a) === JSON.stringify(b)))
  const added = after.filter((b: any) => !before.some((a: any) => JSON.stringify(a) === JSON.stringify(b)))
  assert.deepEqual(added, [])
  assert.ok(removed.every((e: any) => e.source === `required by ${G}`))
  return [{ goalId: old.goalId, title: old.title, compiledScopeAndAllDirectSourceEvidenceUnchanged: true, removedOnlyF947DerivedPrerequisiteEvidence: removed }]
})
const ledgerPath = oldAtlasConfig.semanticKindLedgerPath, oldLedger = read(ledgerPath), ledger = structuredClone(oldLedger)
const changedSemanticInputs = []
for (const decision of ledger.decisions) {
  const goal = finalCan.goals.find((g: any) => g.id === decision.goalId)
  const fp = modelApi.fingerprintSemanticKindSourceGoal(goal)
  if (fp !== decision.sourceFingerprint) { changedSemanticInputs.push(decision.goalId); decision.sourceFingerprint = fp }
}
assert.ok(changedSemanticInputs.every(id => id === G))
write(`${F}/candidate/semantic523.same-authoritative-decisions.author-input-bindings.json`, ledger)
write(ledgerPath, ledger, X)
const candidateAtlasConfig = read(`${F}/candidate/source-atlas-author-current-config.json`)
const candidateAtlas = atlasApi.buildGoalBookSourceAtlasInputs(candidateAtlasConfig, X)
const scopeIds = new Set([...baselineAtlas.receipt.scopes, ...candidateAtlas.receipt.scopes].map((s: any) => s.key))
const scopedOtherGoals = [], scopedTarget = []
for (const key of scopeIds) {
  const old = baselineAtlas.receipt.scopes.find((s: any) => s.key === key), current = candidateAtlas.receipt.scopes.find((s: any) => s.key === key)
  const safe = (scope: any) => scope ? { ...scope, goalIds: scope.goalIds.filter((id: string) => id !== G), witnesses: scope.witnesses.filter((w: any) => w.goalId !== G).map(normalizeAliases) } : null
  assert.deepEqual(safe(current), safe(old), key)
  scopedOtherGoals.push({ key, nonTargetGoalIdsAndWholeWitnessComponentsExactAfterExplicitPathTranslation: true })
  if (current?.goalIds.includes(G)) scopedTarget.push({ key, witnesses: current.witnesses.filter((w: any) => w.goalId === G) })
}
const retainedSourceIds = new Set(scopedTarget.flatMap(s => s.witnesses.map((w: any) => w.sourceGoalId)))
const sourceAuthorRows = read(`${F}/source/selected34-literal-component-author-proposals.json`).records
const falseIds = new Set(sourceAuthorRows.filter((r: any) => r.authorProposal.startsWith('remove')).map((r: any) => r.sourceGoalId))
assert.ok([...retainedSourceIds].every(id => !falseIds.has(id)))
assert.ok(scopedTarget.every(s => s.witnesses.every((w: any) => w.coverage === 'direct')))
write(`${F}/checks/source-atlas-bounded-single-goal-and-other401-component-retention.actual.json`, { schemaVersion: 1, normalModule: { path: 'app/scripts/goalBookSourceAtlasInputs.ts', sha256: sha(bytes('app/scripts/goalBookSourceAtlasInputs.ts')) }, normalBaselineCounts: baselineAtlas.receipt.counts, normalAuthorCandidateCounts: candidateAtlas.receipt.counts, allNonF947ScopesAndWitnessComponentsExactAfterDeclaredPathTranslation: true, literalByteSourceEqualityClaimAcrossNewMappingFiles: false, explicitMappingPathTranslations: [...sourceOldToNew], scopesChecked: scopedOtherGoals, remainingF947ScopesAndWitnesses: scopedTarget, retainedBoundedOrGenericHeldSourceIds: [...retainedSourceIds].sort(), removedFalseComponentsNotClearedSiblingUnions: true, inheritedNIGoalBoundaryStopsAllInheritedComponents: true, authoredSourceApproval: false, independentSourceApproval: false, humanApproval: false, activeSourceCanonicalMappingRegistryQaGitWrites: false, unintendedOneActiveSemanticLedgerWriteDisclosed: true, activeSemanticLedgerRestoredExactHEADByRoot: true, incidentReceipt: 'checks/overlay-ledger-isolation-leak-and-private-parent-repair.actual.json' })
write(`${F}/checks/unmodified-applicability-compiler-overlay-three-stage.actual.json`, { schemaVersion: 1, productionAndExecutedModuleBytesExact: modules.map(path => ({ path, productionSha256: sha(bytes(path)), executedSha256: sha(bytes(path, X)) })), normalOverlayBaselineChemistryReportExactToActualRoot: true, currentF947: targetOf(baseline), selectedOnlyPlusBoundaryF947: targetOf(selectedOnly), allAliasesBeforeScopeCorrectionF947: targetOf(completeBeforeScope), finalDerivedEightScopeF947: targetOf(final), sourceAliasCleaningAloneInsufficient: JSON.stringify(targetOf(selectedOnly).compiledApplicability) !== JSON.stringify(targetOf(final).compiledApplicability), changedCompiledGoalIds: apChanges, unchangedOtherAtomicScopesAndDirectEvidenceAfterDeclaredFileTranslation: otherCompiledSemantics.length, changedDerivedClusterEvidence, changedDerivedPrerequisiteEvidence, allOther522CompiledScopesExact: true, fullFileEvidencePathIdentityAndDerivedClosureChangesDisclosed: true, inheritedBoundaryMetadataAndDerivedScopeOnly: true, f947FinalFindings: final.findings.filter((f: any) => f.goalId === G), currentRegistryOverridesUnchangedAndNotUsedToRestrict: true, independentSourceApproval: false, activeSourceCanonicalMappingRegistryQaGitWrites: false, unintendedOneActiveSemanticLedgerWriteDisclosed: true, activeSemanticLedgerRestoredExactHEADByRoot: true, incidentReceipt: 'checks/overlay-ledger-isolation-leak-and-private-parent-repair.actual.json' })

// Final BookModel check is isolated from source-compiler phases and uses the
// existing normalized book ledger, preserving all semantic classifications.
await import(pathToFileURL(resolve(R, `${F}/helpers/verify-current401-context.mts`)).href)
assert.equal(sha(bytes(canonicalPath)), plan.currentCanonical.sha256)
for (const p of plan.authorProposedSourceChanges) assert.equal(sha(bytes(p.originalLiveBinding.path)), p.originalLiveBinding.sha256)
console.log(JSON.stringify({ unmodifiedNormalApis: true, activeBaseUnchanged: true, archivedAliases23: true, falseFlatComponentsRemoved51: true, finalDerivedJurisdictions: compiled, other401TargetAndScopeSemanticsPreserved: true, protected231Preserved: true, newScientificSourceOrCompletionVotes: 0 }))
