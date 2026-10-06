// Apache-2.0. Exact native bindings after independent science; no approval by hashes.
import { readFileSync, writeFileSync, lstatSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { isGoalVisualizationAiApproved } from '../../../../../../../app/scripts/goalVisualizationQaModel'

const root = process.cwd()
if (!root.endsWith('/tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v3')) throw new Error('Must run in own physical isolated tree')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-current-native-candidate-v3'
const read = (p: string): any => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex')
const write = (p: string, v: unknown) => {
  const absolute = resolve(root, p)
  if (relative(root, absolute).startsWith('..') || lstatSync(absolute).isSymbolicLink()) throw new Error('Unsafe write')
  writeFileSync(absolute, JSON.stringify(v, null, 2) + '\n')
}
const can = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const sem = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const qa = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
const goals = new Map(read(can).goals.map((g: any) => [g.id, g]))
const ledger = read(sem), original = structuredClone(ledger)
const ids = new Set(read(own + '/batch.config.json').goalIds.filter((id: string) => id !== 'bd36dc58-c93e-5247-9e82-da2f9e4e2bed'))
const rows: any[] = []
for (const d of ledger.decisions) {
  const fp = fingerprintSemanticKindSourceGoal(goals.get(d.goalId) as any)
  if (d.sourceFingerprint === fp) continue
  if (!ids.has(d.goalId)) throw new Error('Unexpected source binding change ' + d.goalId)
  rows.push({ goalId: d.goalId, beforeFingerprint: d.sourceFingerprint, afterFingerprint: fp, semanticKind: d.semanticKind, decisionStatus: d.decisionStatus, scientificBasis: 'Independent P14 science and seven independent actual A/M decisions; current source-component deltas checked separately', hashChangeIsScientificApproval: false })
  d.sourceFingerprint = fp
}
if (ledger.counts.curricularAtomic !== 376 || JSON.stringify(ledger.counts) !== JSON.stringify(original.counts)) throw new Error('Protected denominator changed')
write(sem, ledger)
const q = read(qa).records.filter((r: any) => ids.has(r.goalId) && r.aiReviewer?.includes('independent Q1 exact current eight'))
if (q.length !== 8) throw new Error('Expected eight exact independent V rows')
const checked = q.map((r: any) => {
  const goal: any = goals.get(r.goalId)
  const link = goal.resourceLinks.find((l: any) => l.type === 'goal-visualization' && l.role === 'primary')
  const digest = sha('app/public' + link.url)
  if (digest !== r.assetSha256 || digest !== r.aiApprovedAssetSha256 || !isGoalVisualizationAiApproved(r)) throw new Error('Invalid exact current V binding ' + r.goalId)
  return { goalId: r.goalId, digest, imageUrl: link.url, actualNativeAiApproval: true, humanApprovalClaimed: false }
})
writeFileSync(resolve(root, own, 'semantic-and-v8.native-binding.actual.receipt.json'), JSON.stringify({ status: 'PASS', rows, counts: ledger.counts, exactV8: checked, activeWrites: 0, humanApproval: false }, null, 2) + '\n')
console.log(JSON.stringify({ semanticBindings: rows.length, exactIndependentV8: checked.length, denominator: 376, activeWrites: 0 }))
