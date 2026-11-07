// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadDeepUnderstandingRolloutConfig, readCurrentCurriculumVisualizationScopes } from './reportDeepUnderstandingRollout'
const config = loadDeepUnderstandingRolloutConfig()
const owners = config.subjects.map(row => JSON.parse(readFileSync(row.landscapePath, 'utf8')).landscapeId as string)
const scopes = readCurrentCurriculumVisualizationScopes(owners)
const expected = new Map([['mathematik', [807, 5]], ['physik', [478, 0]], ['biologie', [397, 0]], ['chemie', [455, 0]], ['wirtschaftswissenschaften', [346, 52]]])
let total = 0, qualified = 0
for (const scope of scopes.values()) {
  assert.deepEqual([scope.currentGoalIds.length, scope.readyGoalIds.length], expected.get(scope.subject), scope.subject)
  assert.ok(!scope.issues.some(line => /freshness check failed|stale semantic-kind|missing semantic-kind|External visualization|Authenticated original-context capsule failed/u.test(line)), scope.subject)
  assert.ok(scope.issues.length > 0)
  total += scope.currentGoalIds.length; qualified += scope.readyGoalIds.length
}
assert.equal(scopes.size, 5); assert.equal(total, 2483); assert.equal(qualified, 57)
console.log(JSON.stringify({ currentDefinitions: total, genuinelyQualifiedContexts: qualified, stillOpen: total - qualified,
  actualNativeScopes: [...scopes.values()], wholeCurriculumM7Claimed: false }, null, 2))
