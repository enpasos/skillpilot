// Apache-2.0. Read actual repository helpers; write preparation evidence only.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../')
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const base = 'curricula/DE/Gymnasium/'
const staged = base + 'quality/goal-evidence/2026-10-05/biologie-q1-ni-consolidated-integration-candidate-v1/staged/ni-three-targeted-root-preparation-v1/'
const canonical = read(staged + 'canonical.biologie.candidate.json')
const ledger = read(base + 'quality/goal-book-publication/biologie.semantic-kinds.json')
const units = read(relative(root, resolve(here, 'canonical-current-membership.and-kind-review.units.json')))
const goals = new Map<string, Record<string, unknown>>(canonical.goals.map((g: Record<string, unknown>) => [g.id, g]))
const newIds: string[] = units.newGoalUnits.map((u: { goalId: string }) => u.goalId)
const currentAtoms = ledger.decisions.filter((d: { semanticKind: string }) => d.semanticKind === 'curricularAtomic').map((d: { goalId: string }) => d.goalId)
// This local set tests projection mechanics; it is never an authoritative ledger.
const proposedAtoms = new Set<string>([...currentAtoms, ...newIds])
const fingerprints = [...units.newGoalUnits, ...units.changedParentUnits].map((u: { goalId: string, suggestedSemanticKind: string }) => ({
  goalId: u.goalId,
  sourceFingerprint: fingerprintSemanticKindSourceGoal(goals.get(u.goalId)!),
  proposedSemanticKind: u.suggestedSemanticKind,
  decisionStatus: 'review_required',
  meaning: 'Computed current binding only; no fachliche or human approval generated.',
}))
for (const id of newIds) {
  assert.deepEqual(sourceAtlasDescendants(id, goals, proposedAtoms, canonical.landscapeId), [id])
}
const parents = units.changedParentUnits.map((u: { goalId: string }) => u.goalId)
const inheritedExpansions = parents.map((id: string) => ({
  parentGoalId: id,
  expandedAtomIds: sourceAtlasDescendants(id, goals, proposedAtoms, canonical.landscapeId),
}))
for (const expansion of inheritedExpansions) assert.ok(!expansion.expandedAtomIds.some((id: string) => newIds.includes(id)), 'Broad historical parent mapping must not supply NI-only new source evidence')
const mapping = read(staged + 'ni.mapping.candidate.json')
const mappedAtomIds = new Set<string>(mapping.mappings.flatMap((m: { canonicalGoalId: string }) => sourceAtlasDescendants(m.canonicalGoalId, goals, proposedAtoms, canonical.landscapeId)))
for (const id of newIds) assert.ok(mappedAtomIds.has(id), `Missing direct NI binding for ${id}`)
const result = {
  status: 'PASS_NATIVE_PREPARATION_ONLY',
  exactRepositoryHelpers: ['app/scripts/goalBookModel.ts::fingerprintSemanticKindSourceGoal', 'app/scripts/goalBookSourceAtlasInputs.ts::sourceAtlasDescendants'],
  fingerprints,
  currentLedgerAtomCount: currentAtoms.length,
  proposedAtomSetCount: proposedAtoms.size,
  sourceAtlasBroadParentMappingExcludesAllThreeNewAtoms: true,
  sourceAtlasDirectNiMappingIncludesAllThreeNewAtoms: true,
  candidateSourceAtlasAtomicMembershipCount: mappedAtomIds.size,
  noAuthoritativeLedgerWritten: true,
  fullSourceAtlasBuildNotRun: 'Requires real current semantic-kind/A/M adoption and all active path rebindings first.',
  sourceClosureRegistryMeaning: 'Atomic source inventory descendants; distinct from D/P/A/M/V machine closures.',
  machineClosures: 0,
  humanApproval: false,
}
writeFileSync(resolve(here, 'native-membership-and-fingerprint.check.receipt.json'), `${JSON.stringify(result, null, 2)}\n`)
console.log(`PASS native NI membership preparation: ${fingerprints.length} targeted fingerprints, three direct source memberships, inherited source boundaries preserved`)
