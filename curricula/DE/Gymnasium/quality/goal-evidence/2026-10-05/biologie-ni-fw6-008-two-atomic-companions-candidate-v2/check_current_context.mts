// Apache-2.0. Read current ordinary goal context; never read P profiles.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { fingerprintGoalForEvidence } from '../../../../../../../app/scripts/goalEvidenceProfileModel'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../')
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const sha = (p: string) => `sha256:${createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')}`
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const viewPath = 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json'
const canonical = read(canonicalPath)
const ledger = read(ledgerPath)
const view = read(viewPath)
const goals = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const decisions = new Map<string, any>(ledger.decisions.map((d: any) => [d.goalId, d]))
const entries = new Set<string>()
const walk = (n: any) => { if (n.goalId) entries.add(n.goalId); (n.children ?? []).forEach(walk) }
view.rootNodes.forEach(walk)
const ids = ['b1dff57f-329e-5264-b2b9-2db71a0b2172', 'b4176012-f93a-5dd2-84b3-edd6a9932367', '1d2b1038-dcd5-529a-b085-9e14f1d58c76', 'ec88fc1d-ee0f-5a01-9464-dc358241050e']
const inspected = ids.map(id => {
  const goal = goals.get(id), d = decisions.get(id)
  assert.ok(goal && d)
  const semanticFingerprint = fingerprintSemanticKindSourceGoal(goal)
  assert.equal(semanticFingerprint, d.sourceFingerprint)
  return { goalId: id, goal, semanticKind: d.semanticKind, semanticKindFingerprint: semanticFingerprint, goalEvidenceFingerprint: fingerprintGoalForEvidence(goal, 'goal-evidence-v1', d.semanticKind), currentContainsParents: [...goals.values()].filter(p => (p.contains ?? []).includes(id)).map(p => ({ goalId: p.id, title: p.title })), niCurrentExplicitViewEntry: entries.has(id), niCurrentApplicability: (goal.applicability?.jurisdiction ?? []).includes('DE-NI'), fingerprintMatchesCurrentLedger: true }
})
const result = { sourceLandscapeId: '0b27a054-e81e-5423-aa71-d3d8d9d8f0db', canonicalLandscapeId: canonical.landscapeId, status: 'PASS_CURRENT_BINDINGS_READ_ONLY', checkedAt: new Date().toISOString(), inputs: [canonicalPath, ledgerPath, viewPath].map(path => ({ path, digest: sha(path) })), inspected, currentCanonicalRecords: canonical.goals.length, currentCurricularAtomic: ledger.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').length, templateIdAdopted: false, newTemplateFingerprints: 'Not computed without an adopted canonical ID; root must compute from the final actual goal.', pContentsRead: false, activeWrites: 0, humanApproval: false }
writeFileSync(resolve(here, 'current-goals-context-and-fingerprints.receipt.json'), `${JSON.stringify(result, null, 2)}\n`)
console.log(`PASS ${inspected.length} current goal bindings; ordinary canonical context and NI view; no P content`)
