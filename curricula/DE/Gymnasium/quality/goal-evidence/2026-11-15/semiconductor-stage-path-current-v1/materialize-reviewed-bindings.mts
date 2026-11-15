// SPDX-License-Identifier: Apache-2.0
// Materialize only the actual individual reviews stored beside this script.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const directory = dirname(fileURLToPath(import.meta.url)), root = resolve(directory, '../../../../../../..')
assert.ok(process.argv.slice(2).every(arg => arg === '--write'))
const write = process.argv.includes('--write'), json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const stable = (x: any): string => Array.isArray(x) ? `[${x.map(stable).join(',')}]` : x && typeof x === 'object' ? `{${Object.entries(x).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}` : JSON.stringify(x)
const digest = (value: string | Buffer) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const fingerprint = (g: any, ruleVersion: string) => digest(stable({ ruleVersion, goalId:g.id, shortKey:g.shortKey ?? '', title:normalize(g.title), titleEn:normalize(g.titleEn), description:normalize(g.description), descriptionEn:normalize(g.descriptionEn), phase:normalize(g.dimensionTags?.phase), area:normalize(g.dimensionTags?.area), topicCode:normalize(g.dimensionTags?.topicCode), nodeKind:normalize(g.nodeKind) }))
const base = 'curricula/DE/Gymnasium/quality/'
const landscape = JSON.parse(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'))
const goals = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
const semantics = JSON.parse(readFileSync(resolve(directory, 'semantic-kind-current-review.json'), 'utf8'))
const applicabilityPath = resolve(directory, 'applicability-followup-v5/current-bindings.review.json')
const applicability = existsSync(applicabilityPath) ? JSON.parse(readFileSync(applicabilityPath, 'utf8')) : undefined
if (applicability) semantics.goals = [...new Map([...semantics.goals, ...applicability.semanticGoals].map((item: any) => [item.goalId, item])).values()]
const newReviews = JSON.parse(readFileSync(resolve(directory, 'new-goals-atomicity-memory-visualization-review.json'), 'utf8'))
const postPath = resolve(directory, 'post-independent-current-binding-decisions.json')
if (existsSync(postPath)) {
  const post = JSON.parse(readFileSync(postPath, 'utf8'))
  newReviews.goals = [...new Map([...newReviews.goals, ...post.goals].map((item: any) => [item.goalId, item])).values()]
}
const currentPath = resolve(directory, 'post-corrected-independent-review-v3/current-binding-decisions.json')
if (existsSync(currentPath)) {
  const current = JSON.parse(readFileSync(currentPath, 'utf8'))
  newReviews.goals = [...new Map([...newReviews.goals, ...current.goals].map((item: any) => [item.goalId, item])).values()]
}
if (applicability) newReviews.goals = [...new Map([...newReviews.goals, ...applicability.reviewInputSuccessors].map((item: any) => [item.goalId, item])).values()]
const semanticPath = base + 'release-model/physik.semantic-kinds.json', ledger = JSON.parse(read(semanticPath))
for (const item of semantics.goals) {
  const goal: any = goals.get(item.goalId)
  assert.ok(goal, `${item.goalId}: current reviewed goal missing`)
  assert.equal(fingerprintSemanticKindSourceGoal(goal), item.currentSourceFingerprint, `${item.goalId}: reviewed semantic input drift`)
  let record = ledger.decisions.find((r: any) => r.goalId === item.goalId)
  if (record) { assert.equal(record.semanticKind, item.semanticKind); record.sourceFingerprint = item.currentSourceFingerprint }
  else ledger.decisions.push({ goalId:item.goalId, sourceFingerprint:item.currentSourceFingerprint, semanticKind:item.semanticKind, decisionStatus:'authoritative', decisionBasis:item.semanticKind === 'practiceAssessment' ? 'reviewed-current-post-split-practice-assessment' : 'reviewed-current-pilot-curricular-atomic' })
}
ledger.decisions.sort((a: any,b: any) => a.goalId.localeCompare(b.goalId))
const counts: Record<string, number> = {}
for (const item of ledger.decisions) counts[item.semanticKind] = (counts[item.semanticKind] ?? 0) + 1
ledger.counts = { ...ledger.counts, ...counts, total:ledger.decisions.length }
const outputs = new Map([[semanticPath, json(ledger)]])
for (const [kind, path, rule] of [
  ['atomicity', base + 'semantic-atomicity/canonical-physics-full.review.jsonl', 'semantic-atomicity-v1'],
  ['memory', base + 'memory-card-review/canonical-physics-full.review.jsonl', 'memory-card-review-v1'],
]) {
  const lines = read(path).match(/[^\n]*\n|[^\n]+$/gu) ?? []
  const current = new Map(lines.filter(line => line.trim()).map(line => { const r=JSON.parse(line); return [r.goalId,r] }))
  for (const item of newReviews.goals) {
    const goal: any = goals.get(item.goalId)
    assert.equal(digest(stable(goal)), item.currentGoalDigest, `${item.goalId}: actual reviewed new goal drift`)
    if (kind === 'atomicity' ? !item.atomicityReason : !item.memoryReason) continue
    const record = current.get(item.goalId)
    assert.ok(record, `${item.goalId}: actual ${kind} record missing; do not invent a review`)
    assert.equal(record.fingerprint, fingerprint(goal, rule))
    assert.equal(record.reason, item[kind === 'atomicity' ? 'atomicityReason' : 'memoryReason'])
    assert.equal(record.status, kind === 'atomicity' ? 'atomic' : 'no_memory_needed')
  }
  // Existing A/M lines, including the two actual new reviews, are exact evidence.
  outputs.set(path, lines.join(''))
}
const vpath = base + 'goal-visualization-qa/physik.qa.json', visual = JSON.parse(read(vpath))
for (const item of newReviews.goals) {
  const record = item.actualVisualizationReview
  assert.equal(record.goalId, item.goalId)
  assert.equal(digest(readFileSync(resolve(root, record.canonicalAssetPath))), record.assetSha256)
  assert.equal(record.aiApproved, 'yes'); assert.equal(record.aiApprovedAssetSha256, record.assetSha256)
  assert.equal(record.humanApproved, 'no')
  const position = visual.records.findIndex((r: any) => r.goalId === item.goalId)
  assert.ok(position >= 0, `${item.goalId}: actual current V record missing`)
  visual.records[position] = record
}
outputs.set(vpath, json(visual))
for (const [path, bytes] of outputs) {
  if (write) writeFileSync(resolve(root, path), bytes)
  else assert.equal(read(path), bytes, `${path}: current individually reviewed bindings differ`)
}
console.log(`Actual current bindings ${write ? 'materialized' : 'verified'}: ${semantics.goals.length} semantic inputs and ${newReviews.goals.length} individually recorded current review inputs; frozen V9 and unrelated raw records untouched.`)
