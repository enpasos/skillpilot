// Apache-2.0. Only writes fresh inert v4 artifacts.
import { readFileSync, writeFileSync } from 'node:fs'
import { buildPositiveProfile, renderTask, sharedNeutralComparisonDe, sharedNeutralComparisonEn } from './render-learner-prompts'
const base = 'tmp/cross-subject-requires/decimal-rounding-v4-20261013'
const read = (name: string) => JSON.parse(readFileSync(`${base}/${name}`, 'utf8'))
const facts = read('learner-facts.author-candidate.json')
const teacher = read('teacher-grading.author-candidate.json')
const profile = buildPositiveProfile(read('positive-profile.template.author-candidate.json'), facts, teacher)
for (const [name, body] of [
  ['positive-profile.body.author-candidate.json', profile],
  ['learner-prompts.author-candidate.json', { schemaVersion: 4, audience: 'learner', cases: facts.cases.map(renderTask), sharedNeutralComparisonDe, sharedNeutralComparisonEn }],
] as const) writeFileSync(`${base}/${name}`, JSON.stringify(body, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ status: 'assembled inert v4 native P body and learner-only projection', cases: profile.applicationCaseBriefs.length }))
