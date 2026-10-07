import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../app/scripts/goalBookModel'

const dossier = resolve(dirname(fileURLToPath(import.meta.url)), '..')
if (existsSync(resolve(dossier, 'final-own-files.freeze.json'))) throw new Error('Sealed dossier: use a fresh version folder.')
const repository = resolve(dossier, '../../../../../../..')
const candidatePath = resolve(dossier, 'candidate/canonical.whole-current-plus-targeted-corrections.json')
const candidate = JSON.parse(readFileSync(candidatePath, 'utf8'))
const ledger = JSON.parse(readFileSync(resolve(dossier, 'inputs/current-semantic-kinds.snapshot.json'), 'utf8'))
const goalById = new Map<string, Record<string, unknown>>(candidate.goals.map((goal: Record<string, unknown>) => [String(goal.id), goal]))
const changed: Array<{goalId: string; before: string; after: string}> = []
ledger.sourceLandscapePath = candidatePath.slice(repository.length + 1)
for (const decision of ledger.decisions) {
  const goal = goalById.get(decision.goalId)
  if (!goal) throw new Error(`Missing ${decision.goalId}`)
  const fingerprint = fingerprintSemanticKindSourceGoal(goal)
  if (fingerprint !== decision.sourceFingerprint) {
    changed.push({ goalId: decision.goalId, before: decision.sourceFingerprint, after: fingerprint })
    decision.sourceFingerprint = fingerprint
  }
}
writeFileSync(resolve(dossier, 'candidate/semantic-kinds.candidate.json'), JSON.stringify(ledger, null, 2) + '\n')
writeFileSync(resolve(dossier, 'qa-artifacts/semantic-kind-candidate-rebinding.json'), JSON.stringify({
  documentType: 'Mechanical candidate-only binding of copied existing semantic-kind classifications using production fingerprintSemanticKindSourceGoal',
  activeWrites: false,
  independentApproval: false,
  newSemanticKindDecisions: 0,
  strictNetGain: 0,
  sourceLandscapePath: ledger.sourceLandscapePath,
  decisionCount: ledger.decisions.length,
  changed,
}, null, 2) + '\n')
console.log(JSON.stringify({ decisionCount: ledger.decisions.length, changed: changed.length, sourceLandscapePath: ledger.sourceLandscapePath }))
