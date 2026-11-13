// SPDX-License-Identifier: Apache-2.0
// Materialize only the three actual, individually documented current reviews.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const directory = dirname(fileURLToPath(import.meta.url))
const root = resolve(directory, '../../../../../../..')
const write = process.argv.includes('--write')
assert.ok(process.argv.slice(2).every(arg => arg === '--write'))
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const stable = (value: any): string => Array.isArray(value) ? `[${value.map(stable).join(',')}]`
  : value && typeof value === 'object' ? `{${Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([key,v]) => `${JSON.stringify(key)}:${stable(v)}`).join(',')}}` : JSON.stringify(value)
const digest = (value: string) => `sha256:${createHash('sha256').update(value).digest('hex')}`
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const fingerprint = (goal: any, ruleVersion: string) => digest(stable({ruleVersion, goalId:goal.id, shortKey:goal.shortKey ?? '', title:normalize(goal.title),titleEn:normalize(goal.titleEn),description:normalize(goal.description),descriptionEn:normalize(goal.descriptionEn),phase:normalize(goal.dimensionTags?.phase),area:normalize(goal.dimensionTags?.area),topicCode:normalize(goal.dimensionTags?.topicCode),nodeKind:normalize(goal.nodeKind)}))
const decisions = JSON.parse(readFileSync(resolve(directory, 'reviewed-binding-decisions.json'), 'utf8'))
const pins = JSON.parse(readFileSync(resolve(directory, 'review-binding-source-pins.json'), 'utf8'))
const landscape = JSON.parse(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'))
const goals = new Map(landscape.goals.map((goal: any) => [goal.id, goal]))
const outputs = new Map<string,string>()
const semantic = JSON.parse(read(pins.sourcePins.semanticKind.path))
for (const decision of decisions.goals) {
  const goal: any = goals.get(decision.goalId)
  assert.equal(digest(stable(goal)), decision.currentGoalDigest, `${decision.goalId}: reviewed goal changed`)
  const record = semantic.decisions.find((item: any) => item.goalId === decision.goalId)
  assert.equal(record.semanticKind, 'curricularAtomic')
  assert.equal(record.decisionStatus, 'authoritative')
  // The ontology schema's established authoritative category is retained; the
  // new individual reasoning and exact current input are in the review receipt.
  record.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
outputs.set(pins.sourcePins.semanticKind.path, json(semantic))
for (const kind of ['atomicity','memory']) {
  const path = pins.sourcePins[kind].path
  const lines = read(path).match(/[^\n]*\n|[^\n]+$/gu) ?? []
  const changed = lines.map(line => {
    if (!line.trim()) return line
    const record = JSON.parse(line)
    const decision = decisions.goals.find((item: any) => item.goalId === record.goalId)
    if (!decision) return line
    const goal = goals.get(record.goalId)
    if (kind === 'atomicity') { assert.equal(record.status, 'atomic'); assert.equal(record.semanticAtomic, true) }
    else { assert.equal(record.status, decision.memoryStatus); assert.equal(record.memoryUseful, decision.memoryStatus === 'memory_required') }
    Object.assign(record,{fingerprint:fingerprint(goal,kind === 'atomicity' ? 'semantic-atomicity-v1' : 'memory-card-review-v1'),reviewedAt:decisions.reviewedAt,reviewer:decisions.reviewer,reason:decision[kind+'Reason']})
    return `${JSON.stringify(record)}\n`
  }).join('')
  outputs.set(path,changed)
}
for (const [path,bytes] of outputs) {
  if (write) writeFileSync(resolve(root,path),bytes)
  else assert.equal(read(path),bytes,`${path}: current individually reviewed bindings missing`)
}
console.log(`Individual current A/M/semantic-kind bindings ${write ? 'materialized' : 'verified'}: ${decisions.goals.length}; no historical proof or unrelated record rewritten.`)
