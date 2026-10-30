import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  validateCompletionProfileReferences,
  validateCompletionProfileShape,
  validateCompletionScope,
  type CompletionProfileShape,
} from './checkAssessmentCompletionProfiles'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const corpus = JSON.parse(readFileSync(resolve(root, 'contracts/assessment-completion/v1/fixtures/cases.json'), 'utf8')) as {
  schemaVersion: number
  cases: { id: string; profile: CompletionProfileShape; expected?: unknown; expectedError?: string }[]
}
assert.equal(corpus.schemaVersion, 1)
assert.ok(corpus.cases.length >= 20, 'shared corpus must cover graph semantics, not only JSON shape')
const caseIds = new Set<string>()
for (const fixture of corpus.cases) {
  assert.ok(!caseIds.has(fixture.id), `duplicate fixture ${fixture.id}`)
  caseIds.add(fixture.id)
  assert.deepEqual(validateCompletionProfileShape(fixture.profile), [], fixture.id)
  assert.notEqual(fixture.expected === undefined, fixture.expectedError === undefined, `${fixture.id}: exactly one expected outcome`)
}

const valid = corpus.cases[0].profile
assert.deepEqual(validateCompletionProfileReferences(valid, new Set(['A', 'B', 'Q'])), [])
assert.ok(validateCompletionProfileReferences(valid, new Set(['B', 'Q'])).some((error) => error.includes('A')))
assert.ok(validateCompletionProfileReferences(valid, new Set(['A', 'B', 'Q']), new Set(['other-scope'])).some((error) => error.includes('levelScopeRef')))

const scope = { schemaVersion: 1, id: 'fixture-scope', revision: 'v1', title: { de: 'Test', en: 'Test' }, targetRootIds: ['A'] }
assert.deepEqual(validateCompletionScope(scope, new Set(['A'])), [])
assert.ok(validateCompletionScope(scope, new Set()).some((error) => error.includes('A')))
assert.ok(validateCompletionScope({ ...scope, targetRootIds: [] }, new Set(['A'])).length > 0)
assert.ok(validateCompletionScope({ ...scope, targetRootIds: ['A', 'A'] }, new Set(['A'])).length > 0)
assert.ok(validateCompletionScope({ ...scope, goals: [{ id: 'A' }] }, new Set(['A'])).length > 0)

const withChanges = (changes: Record<string, unknown>): unknown => ({ ...structuredClone(valid), ...changes })
for (const key of ['targetGoalIds', 'mastery', 'waivedGoalIds', 'acceptedEvidence', 'complete']) {
  assert.ok(validateCompletionProfileShape(withChanges({ [key]: [] })).length > 0, `${key} must not enter static profile`)
}
assert.ok(validateCompletionProfileShape(withChanges({ schemaVersion: 2 })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ revision: '  ' })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ title: { de: 'Deutsch' } })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ review: { reference: 'review' } })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ applicability: { stage: [] } })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ protectedGoalIds: ['A', 'A'] })).length > 0)

const rule = valid.rules[0]
assert.ok(validateCompletionProfileShape(withChanges({ rules: [{ ...rule, assessmentGoalIds: [] }] })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ rules: [{ ...rule, waivableGoalIds: ['A', 'A'] }] })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ rules: [{ ...rule, reviewRef: '' }] })).length > 0)
assert.ok(validateCompletionProfileShape(withChanges({ rules: [rule, rule] })).some((error) => error.includes('duplicate ruleId')))
assert.ok(validateCompletionProfileShape(withChanges({ rules: [{ ...rule, qualifyingPass: true }] })).length > 0)
assert.deepEqual(validateCompletionProfileShape(withChanges({ rules: [] })), [])
assert.deepEqual(validateCompletionProfileShape(withChanges({ rules: [{ ...rule, waivableGoalIds: [] }] })), [])

// These deliberately remain compiler responsibilities, not a second TS evaluator.
assert.deepEqual(validateCompletionProfileReferences(
  withChanges({ rules: [{ ...rule, waivableGoalIds: ['PROTECTED'] }] }),
  new Set(['Q', 'PROTECTED']),
), [])
console.log(`Assessment completion authoring tests passed; ${corpus.cases.length} shared semantic fixtures have valid profile shapes.`)
