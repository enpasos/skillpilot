import assert from 'node:assert/strict'
import { cockpitMathData as data, cockpitScenarios, deriveCockpitState, exportLearningEntryProgress } from './cockpitMathData'

const [a, q] = data.targetGoalIds
assert.equal(data.targetGoalIds.length, 2)
assert.equal(data.goalById[a].kind, 'goal')
assert.equal(data.goalById[q].kind, 'assessment')
assert.deepEqual(data.goalById[q].requires, [a])
assert.deepEqual(data.assessment.coveredGoalIds, [a])
assert.equal(data.assessment.scoring.maxPoints, 10)
assert.equal(data.assessment.scoring.passingPoints, 10)
assert.equal(data.assessment.scoring.steps.reduce((sum, step) => sum + step.points, 0), 10)
assert.equal(data.cards.isExternal, true)
assert.equal(data.cards.cards.length, 8, 'The whole external deck is retained, not a made-up smaller recall contract')

const { entries } = data.fixture
for (const entry of Object.values(entries)) {
  for (const ref of [...entry.requires, ...entry.children ?? []]) assert.ok(entries[ref], `Unresolved map reference ${ref}`)
  const walk = (id: string, path: Set<string>) => {
    assert.ok(!path.has(id), `Containment cycle at ${id}`)
    for (const child of entries[id].children ?? []) walk(child, new Set([...path, id]))
  }
  walk(entry.id, new Set())
  const siblings = new Set(entry.children ?? [])
  for (const consumer of siblings) for (const prerequisite of entries[consumer].requires.filter(id => siblings.has(id))) {
    const key = `sibling:${prerequisite}->${consumer}`
    assert.ok(data.edgeProvenance[key]?.length, `Missing edge provenance ${key}`)
    for (const evidence of data.edgeProvenance[key]) assert.ok(
      data.goalById[evidence.consumerGoalId].requires.includes(evidence.prerequisiteGoalId),
      `Aggregated display edge ${key} has no actual source requirement`,
    )
  }
}

const expected = [
  { m: [], explicit: 0, implicit: 0, complete: false },
  { m: [a], explicit: 1, implicit: 0, complete: false },
  { m: [q], explicit: 1, implicit: 1, complete: true },
  { m: [a, q], explicit: 2, implicit: 0, complete: true },
]
for (const example of expected) {
  const before = JSON.stringify(example.m)
  const state = deriveCockpitState(example.m)
  assert.equal(JSON.stringify(example.m), before, 'Derivation must not write mastery back')
  assert.deepEqual(state.progress, { total: 2, explicit: example.explicit, implicit: example.implicit,
    completed: example.explicit + example.implicit, percent: (example.explicit + example.implicit) * 50 })
  assert.equal(state.unitComplete, example.complete)
  assert.ok(state.implicitGoalIds.every(id => id === a), 'No exam, recall or external prerequisite is implicitly awarded')
  const shown = exportLearningEntryProgress(state)
  assert.equal(shown[data.rootId].total, 2)
  assert.equal(shown[data.unitId].total, 2)
  assert.equal(shown[data.cards.goalId], undefined, 'External memory must not enter the target denominator')
}
const externalSupport = data.goalById[a].requires[0]
assert.deepEqual(deriveCockpitState([externalSupport]).implicitGoalIds, [])
assert.ok(!deriveCockpitState([q]).effectiveGoalIds.includes(externalSupport), 'Q recognizes only its own target A, not the whole prerequisite closure')
assert.throws(() => deriveCockpitState(['not-a-real-id']), /Unbekanntes Testziel/)

const passed = cockpitScenarios.find(scenario => scenario.id === 'passed-assessment')!
const completed = deriveCockpitState(passed.explicitGoalIds, passed.events)
assert.equal(completed.progress.completed, 2)
assert.equal(completed.todayExplicit, 1)
assert.equal(completed.weekExplicit, 1)
const repeatedAndInvalidEvents = deriveCockpitState([q], [
  ...passed.events, ...passed.events,
  { goalId: a, at: '2026-11-04T09:20:00Z' }, // derived, not an explicit outcome
  { goalId: data.cards.goalId, at: '2026-11-04T09:21:00Z' }, // outside plan target
  { goalId: q, at: '2026-11-05T09:22:00Z' }, // future
  { goalId: q, at: 'invalid' },
])
assert.equal(repeatedAndInvalidEvents.todayExplicit, 1)
assert.equal(repeatedAndInvalidEvents.weekExplicit, 1)
const beforeExam = cockpitScenarios.find(scenario => scenario.id === 'before-assessment')!
assert.equal(deriveCockpitState(beforeExam.explicitGoalIds, beforeExam.events).todayExplicit, 0)
assert.equal(deriveCockpitState(beforeExam.explicitGoalIds, beforeExam.events).weekExplicit, 1)
console.log('PASS: two fixed targets, four binary input states, no protected/external implicit credit, exact edge provenance, full external deck and explicit-only day/week events.')
