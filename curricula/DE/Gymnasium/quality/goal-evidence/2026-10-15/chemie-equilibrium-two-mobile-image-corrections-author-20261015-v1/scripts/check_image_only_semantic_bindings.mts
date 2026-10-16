// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../app/scripts/goalBookModel.ts'

const root = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-two-mobile-image-corrections-author-20261015-v1/'
const selector = JSON.parse(readFileSync(root + 'INPUTS.two-native-mobile-PNGs.image-only-author.selector.json', 'utf8'))
const readBound = (ref: { path: string, sha256: string }) => {
  const bytes = readFileSync(ref.path)
  if ('sha256:' + createHash('sha256').update(bytes).digest('hex') !== ref.sha256) throw Error('Changed input: ' + ref.path)
  return JSON.parse(bytes.toString('utf8'))
}
const canonical = readBound(selector.currentCanonical)
const semantic = readBound(selector.currentSemanticSourceIdentityOnly)
for (const decision of semantic.decisions) {
  const goal = canonical.goals.find((g: { id: string }) => g.id === decision.goalId)
  if (!goal || fingerprintSemanticKindSourceGoal(goal) !== decision.sourceFingerprint) throw Error('Stale source identity: ' + decision.goalId)
}
const result = {
  role: 'Pure stock source identity validation of image-only candidate, no new scientific decision',
  stockSourceBindingsChecked: semantic.decisions.length,
  canonical: selector.currentCanonical,
  unchangedSemanticSourceIdentities: selector.currentSemanticSourceIdentityOnly,
  newSemanticVotes: 0,
  activeWrites: false,
  exitCode: 0,
}
writeFileSync(root + 'CHECK.stock-all560-unchanged-semantic-source-identities.actual.json', JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(result))
