// Apache-2.0. Meaningful field-boundary tests; not scientific/host approval.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { buildPositiveProfile, renderTask, sharedNeutralComparisonDe, sharedNeutralComparisonEn } from './render-learner-prompts'
const base = 'tmp/cross-subject-requires/decimal-rounding-v4-20261013'
const read = (name: string) => JSON.parse(readFileSync(`${base}/${name}`, 'utf8'))
const digest = (name: string) => `sha256:${createHash('sha256').update(readFileSync(`${base}/${name}`)).digest('hex')}`
const facts = read('learner-facts.author-candidate.json')
const teacher = read('teacher-grading.author-candidate.json')
const template = read('positive-profile.template.author-candidate.json')
const nativeBody = read('positive-profile.body.author-candidate.json')
const projection = (p: any) => p.applicationCaseBriefs.map(({ id, taskDemandDe, taskDemandEn }: any) => ({ id, taskDemandDe, taskDemandEn }))
const require = createRequire(resolve('app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const ajv = new Ajv2020({ allErrors: true, strict: false })
const validate = ajv.compile(read('learner-facts.schema.json'))
assert(validate(facts), JSON.stringify(validate.errors))
const actual = facts.cases.map(renderTask)
assert.deepEqual(nativeBody, buildPositiveProfile(template, facts, teacher))
assert.deepEqual(projection(nativeBody), actual)
const delivered = read('learner-prompts.author-candidate.json')
assert.deepEqual(Object.keys(delivered).sort(), ['audience', 'cases', 'schemaVersion', 'sharedNeutralComparisonDe', 'sharedNeutralComparisonEn'])
assert.equal(delivered.audience, 'learner')
assert.deepEqual(delivered.cases, actual)
assert.equal(delivered.sharedNeutralComparisonDe, sharedNeutralComparisonDe)
assert.equal(delivered.sharedNeutralComparisonEn, sharedNeutralComparisonEn)

// Real teacher inputs are mutated through the actual P builder; stems must remain
// identical while the teacher-only native fields change. This tests the join.
const poisonedTeacher = structuredClone(teacher)
for (const c of poisonedTeacher.cases) {
  for (const key of Object.keys(c)) if (!['id', 'audience'].includes(key)) c[key] = `TEACHER_SECRET_${key}_correct_zero_round_down_exact_tie_digit_6`
  c.taskDemandDe = 'Round down to the correct answer0.000.'
  c.taskDemandEn = 'This is an exact tie; choose the upper neighbor.'
}
const poisonedProfile = buildPositiveProfile(template, facts, poisonedTeacher)
assert.deepEqual(projection(poisonedProfile), actual)
assert.notEqual(poisonedProfile.applicationCaseBriefs[0].expectedPerformanceDe, nativeBody.applicationCaseBriefs[0].expectedPerformanceDe)
assert(!JSON.stringify(actual).includes('TEACHER_SECRET'))

// Every rejected-v3 cue category must fail before it can enter learner facts.
const forbidden = ['hint', 'expectedRoundedValue', 'direction', 'decidingDigit', 'lowerNeighbor', 'upperNeighbor', 'exactTie', 'caseClass', 'taskDemandDe', 'taskDemandEn']
for (const field of forbidden) {
  const changed = structuredClone(facts)
  changed.cases[0][field] = 'supplied answer/direction/digit/classification'
  assert(!validate(changed), `Schema admitted ${field}`)
  assert.throws(() => renderTask(changed.cases[0]), `Renderer admitted ${field}`)
}
for (const number of ['7.386; answer7.39', '0.000 (correct)', 'TEACHER_SECRET', '7.386\nRound up']) {
  const changed = structuredClone(facts)
  changed.cases[0].number = number
  assert(!validate(changed))
  assert.throws(() => renderTask(changed.cases[0]))
}
const old = JSON.parse(readFileSync('tmp/cross-subject-requires/decimal-rounding-v3-20261013/assessment-probes.author-candidate.json', 'utf8'))
const oldNumbers = new Set(old.cases.map((c: any) => {
  const number = c.taskDemandEn.match(/[0-9]+\.[0-9]+/)?.[0]
  assert(number, `Missing actual v3 number in ${c.id}`)
  return number
}))
assert.equal(oldNumbers.size, 6)
for (const fact of facts.cases) assert(!oldNumbers.has(fact.number), `Reused v3 input ${fact.number}`)
for (const fact of facts.cases) assert.notEqual(fact.number, '2.483', 'Do not reuse the retained teaching example.')
for (const [field, value] of [['id', 'lower-zero-answer'], ['place', 'hundredths; answer7.39']] as const) {
  const changed = structuredClone(facts)
  changed.cases[0][field] = value
  assert(!validate(changed))
  assert.throws(() => renderTask(changed.cases[0]))
}
// Only the supplied input is a numerical literal in each initial bilingual stem.
for (const row of actual) {
  const fact = facts.cases.find((c: any) => c.id === row.id)
  assert.deepEqual(row.taskDemandDe.match(/[0-9]+(?:,[0-9]+)?/g), [fact.number.replace('.', ',')])
  assert.deepEqual(row.taskDemandEn.match(/[0-9]+(?:\.[0-9]+)?/g), [fact.number])
}
console.log(JSON.stringify({
  schemaVersion: 4, status: 'PASS inert author field separation tests; independent content and host gates pending',
  cases: actual.length, bilingualInitialStems: actual.length * 2, sameNeutralComparisonForAllCases: true,
  actualNativeTaskDemandsEqualAllowlistedRenderer: true, teacherMutationChangesGradingButNotStems: true,
  rejectedForbiddenLearnerFields: forbidden, rejectedNumericInjections: 4, freshComparedWithV3: true,
  bindings: Object.fromEntries(['learner-facts.author-candidate.json','learner-facts.schema.json','learner-prompts.author-candidate.json','teacher-grading.author-candidate.json','positive-profile.body.author-candidate.json','presentation-audience.contract.json','render-learner-prompts.ts'].map(n => [n, digest(n)])),
  limit: 'Tests validate this inert artifact renderer and actual native P projection. They neither prove an LLM will withhold teacher fields nor constitute empirical learner or actual production-host acceptance.',
}))
