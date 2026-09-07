import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { checkCanonicalCurriculumSpelling, findReviewedSpellingIssues } from './check_curriculum_spelling.mjs'

test('preserves scientific terms, real umlauts, names and ambiguous letter sequences', () => {
  const text = 'Fotoeffekt Photoeffekt fotoelektrisch photoelektrischer Koeffizienten '
    + 'Haftreibungskoeffizient Schwächungskoeffizient '
    + 'Koexistenz Kooperation Goethe Aerodynamik neue Quelle Dualität Äquivalenz Größe für'
  assert.deepEqual(findReviewedSpellingIssues(text), [])
})

test('reports reviewed collision families with their exact field and never mutates input', () => {
  const input = { title: 'Fotöffekt und Einstein-Deutung', examples: ['Photöffekt', 'photölektrisch', 'fotölektrischer', 'Köffizienten'] }
  const before = JSON.stringify(input)
  const issues = findReviewedSpellingIssues(input)
  assert.equal(issues.length, 5)
  assert.equal(issues[0].path, '$.title')
  assert.equal(issues[0].expected, 'Fotoeffekt')
  assert.equal(issues[4].path, '$.examples.3')
  assert.equal(JSON.stringify(input), before)
})

test('current canonical Mathematics and Physics do not reintroduce reviewed spelling collisions', () => {
  assert.deepEqual(checkCanonicalCurriculumSpelling(), [])
  const physics = JSON.parse(readFileSync(new URL('../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', import.meta.url)))
  const goal = physics.goals.find(entry => entry.id === 'cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f')
  assert.match(goal.title, /\bFotoeffekt\b/u)
  assert.match(goal.description, /\bFotoeffekt\b/u)
})

test('detects reviewed coefficient corruption inside compounds without blanket normalization', () => {
  const input = { task: 'Haftreibungsköffizient und Schwächungsköffizient', valid: 'Haftreibungskoeffizient und neue Quelle' }
  assert.deepEqual(findReviewedSpellingIssues(input), [
    { path: '$.task', incorrect: 'köffizient', expected: 'Koeffizient' },
  ])
  assert.equal(input.task, 'Haftreibungsköffizient und Schwächungsköffizient')
})
