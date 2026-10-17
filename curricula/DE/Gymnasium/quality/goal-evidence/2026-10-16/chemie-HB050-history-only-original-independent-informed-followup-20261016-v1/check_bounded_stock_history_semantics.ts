import fs from 'node:fs'
import assert from 'node:assert/strict'
import { sourceAtlasDescendants } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'

const root = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-HB050-one-operative-historical978-edge-targeted-author-successor-20261016-v1'
const h = 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
const read = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'))
const before = read(root + '/MAPPING.HB.before.whole.exact.json')
const after = read(root + '/MAPPING.HB.after.one-historical-only-edge.author-unreviewed.json')
const canonical = read(h + '/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const kinds = read(h + '/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const byId = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const atoms = new Set<string>(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
assert.equal(atoms.size, 435)
const sourceId = 'hb-chemistry-sekii-gyo2022-3-3-2-1-kohlenhydrate-050-f975913c'
const b = before.decisions.find((d: any) => d.sourceGoalId === sourceId)
const a = after.decisions.find((d: any) => d.sourceGoalId === sourceId)
assert.equal(b.decision, 'unreviewed')
assert.equal(a.decision, 'unreviewed')
const removed = before.mappings.filter((m: any) => m.legacyGoalId === sourceId && m.canonicalGoalId === '978a6f25-0601-5457-9211-aab206c95603')
assert.equal(removed.length, 1)
assert.deepEqual(a.source2V3HistoricalAllocationBeforeHistoryOnlyCorrection.wholeDecision, b)
assert.deepEqual(a.source2V3HistoricalAllocationBeforeHistoryOnlyCorrection.wholeRemovedHistoricalOnlyEdges, removed)
assert.deepEqual(after.decisions.filter((d: any) => d.sourceGoalId !== sourceId), before.decisions.filter((d: any) => d.sourceGoalId !== sourceId))
assert.deepEqual(after.mappings, before.mappings.filter((m: any) => !(m.legacyGoalId === sourceId && m.canonicalGoalId === '978a6f25-0601-5457-9211-aab206c95603')))
for (const k of Object.keys(before).filter(k => k !== 'mappings' && k !== 'decisions')) assert.deepEqual(after[k], before[k])

// Exact target-loop expression from stock Atlas lines282–286, using its exported
// actual descendant helper. This probes the prospective mapped interpretation;
// neither actual input decision is promoted or written.
const currentTargets = (d: any) => [...new Set<string>(d.canonicalGoalIds.flatMap((id: string) => sourceAtlasDescendants(id, byId, atoms, canonical.landscapeId)))].sort()
const beforeProspective = currentTargets(b)
const afterProspective = currentTargets(a)
assert.deepEqual(afterProspective, ['5fdc4fb2-a23b-5949-8d6b-ad43009120dd', 'd1244f5d-9a12-5b74-97fe-ae974f40af26'])
assert.ok(beforeProspective.includes('978a6f25-0601-5457-9211-aab206c95603'))
assert.ok(JSON.stringify(a.source2V3HistoricalAllocationBeforeHistoryOnlyCorrection).includes('978a6f25-0601-5457-9211-aab206c95603'))
assert.ok(!afterProspective.includes('978a6f25-0601-5457-9211-aab206c95603'))
console.log(JSON.stringify({
  status: 'PASS', role: 'Bounded actual stock Atlas descendant-helper probe, not full Atlas generation',
  actualBothDecisionsRemainUnreviewed: true, actualCurrentWitnessesFromBothRows: 0,
  prospectiveBeforeIfNarrowlyMapped: beforeProspective, prospectiveAfterIfNarrowlyMapped: afterProspective,
  fullHistorical978DecisionAndEdgeExact: true, allOtherCurrentDecisionAndEdgeObjectsExact: true,
  ordinaryInventoryUnchanged: atoms.size, sourceCanonicalOrViewWrites: 0,
  historyDoesNotEnterCurrentCanonicalGoalIds: true, fullAtlasBuildOrCIExecuted: false,
  newScientificVoteFromThisProbe: false, HumanApproval: false,
}))
