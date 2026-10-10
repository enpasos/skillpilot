// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
async function main() {
 const base = resolve(dirname(process.argv[1]), '..')
 const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
 const { fingerprintSemanticKindSourceGoal } = await import(pathToFileURL(resolve('app/scripts/goalBookModel.ts')).href)
 const goals = read(resolve(base,'inputs/whole-current-DE-EN-goals.neutral.json')).wholeCurrentGoalObjects
 const ledger = read(resolve(base,'inputs/whole-current394-semantic-kinds.author-baseline.json'))
 const baseline = read(resolve(base,'inputs/whole-current479-landscape.author-baseline.json'))
 const current = read(resolve(ledger.sourceLandscapePath))
 const rows = goals.map((goal: Record<string,unknown>) => {
  const decision = ledger.decisions.find((entry: Record<string,unknown>) => entry.goalId===goal.id)
  assert(decision)
  assert.equal(decision.semanticKind,'curricularAtomic')
  assert.equal(decision.decisionStatus,'authoritative')
  assert.equal(decision.sourceFingerprint,fingerprintSemanticKindSourceGoal(goal))
  assert.deepEqual(baseline.goals.find((entry: Record<string,unknown>) => entry.id===goal.id),goal)
  assert.deepEqual(current.goals.find((entry: Record<string,unknown>) => entry.id===goal.id),goal)
  return {goalId:goal.id, semanticKind:decision.semanticKind, currentExact:true, sourceFingerprint:decision.sourceFingerprint}
 })
 assert.equal(rows.length,12)
 console.log(JSON.stringify({ordinaryFingerprintFunction:'app/scripts/goalBookModel.ts:fingerprintSemanticKindSourceGoal', selected12Current:true, newKindDecisions:0, rows},null,2))
}
main().catch((error) => {console.error(error);process.exitCode=1})
