import assert from 'node:assert/strict'
import type { UiGoal } from '../goalTypes'
import { sortGoalsTopologically } from './goalSorter'

const goal = (id: string, title: string, overrides: Partial<UiGoal> = {}): UiGoal => ({
  id, title, description: title, phase: 'Q1', themenfeld: '', area: '', level: 0, core: true, weight: 1,
  tags: [], leitideen: [], kompetenzen: [], sourceRef: '', requires: [], contains: [], examples: [],
  type: 'atomic', nodeKind: 'tutor', ...overrides,
})
const order = (goals: UiGoal[], allGoals: UiGoal[] = goals) =>
  sortGoalsTopologically(goals, { allGoalsById: new Map(allGoals.map((entry) => [entry.id, entry])) })
    .map((entry) => entry.id)

// Hard edges: a sibling requirement always precedes its consumer; the title
// decides between otherwise equal siblings.
assert.deepEqual(order([
  goal('c', 'Anwenden', { requires: ['b'] }),
  goal('b', 'Zusammenhang', { requires: ['landscape:a'] }),
  goal('a', 'Begriff'),
  goal('d', 'Ausblick'),
]), ['d', 'a', 'b', 'c'])

// Configured order: explicit position, then the learning flow from the
// motivating introduction over tutorials and flashcards to exercises.
assert.deepEqual(order([
  goal('exercise', 'Aufgaben', { nodeKind: 'exam' }),
  goal('cards', 'Begriffe', { nodeKind: 'memory' }),
  goal('tutorial', 'Zusammenhang'),
  goal('why', 'Warum Physik?'),
  goal('pinned', 'Zuletzt im Alphabet', { tags: ['order:1'] }),
]), ['pinned', 'why', 'tutorial', 'cards', 'exercise'])

// Soft support: a branch whose goals are required from inside another branch
// comes first, although the alphabet and the missing direct edge say otherwise.
const basics = goal('basics', 'Zahlen', { type: 'cluster', contains: ['basics-1', 'basics-2'] })
const usage = goal('usage', 'Anwendungen', { type: 'cluster', contains: ['usage-1', 'usage-2'] })
const branchGoals = [basics, usage,
  goal('basics-1', 'Zahlbereiche'), goal('basics-2', 'Rechengesetze'),
  goal('usage-1', 'Sachaufgaben', { requires: ['basics-1'] }),
  goal('usage-2', 'Modellieren', { requires: ['basics-2'] })]
assert.deepEqual(order([usage, basics], branchGoals), ['basics', 'usage'])
assert.deepEqual(order([usage, basics]), ['usage', 'basics'], 'Without the branch goals only the title decides.')

// The order is the one a direct evaluation yields: every step places the
// candidate with the best net support against all goals not yet placed.
const referenceOrder = (goals: UiGoal[], allGoals: UiGoal[]) => {
  const byId = new Map(allGoals.map((entry) => [entry.id, entry]))
  const branch = (id: string): string[] => [id, ...(byId.get(id)?.contains ?? []).flatMap(branch)]
  const support = (source: UiGoal, target: UiGoal) => {
    const providers = new Set(branch(source.id))
    const demanders = branch(target.id).slice(1).map((id) => byId.get(id)!)
    const count = demanders.flatMap((demander) => demander.requires).filter((id) => providers.has(id)).length
    const requireBearing = demanders.filter((demander) => demander.requires.length > 0).length
    return count >= 2 && count / Math.max(1, requireBearing) >= 0.25 ? count : 0
  }
  const remaining = [...goals]
  const placed: string[] = []
  while (remaining.length > 0) {
    const blocked = (candidate: UiGoal) => candidate.requires.some((id) => id !== candidate.id
      && remaining.some((other) => other.id === id))
    const available = remaining.filter((candidate) => !blocked(candidate))
    const net = (candidate: UiGoal) => remaining.filter((other) => other !== candidate)
      .reduce((sum, other) => sum + support(candidate, other) - support(other, candidate), 0)
    const next = [...(available.length > 0 ? available : remaining)].sort((left, right) =>
      net(right) - net(left) || left.title.localeCompare(right.title, 'de-DE') || left.id.localeCompare(right.id))[0]
    placed.push(next.id)
    remaining.splice(remaining.indexOf(next), 1)
  }
  return placed
}
let seed = 20261112
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 0x100000000
}
for (let round = 0; round < 300; round += 1) {
  const all: UiGoal[] = []
  const siblings = Array.from({ length: 2 + Math.floor(random() * 7) }, (_, index) => {
    const children = Array.from({ length: Math.floor(random() * 4) }, (_child, child) => goal(`s${index}-${child}`, `Teil ${child}`))
    const sibling = goal(`s${index}`, `Thema ${Math.floor(random() * 5)}`, {
      type: children.length > 0 ? 'cluster' : 'atomic', contains: children.map((child) => child.id),
    })
    all.push(sibling, ...children)
    return sibling
  })
  all.forEach((entry) => {
    while (random() < 0.45) entry.requires.push(all[Math.floor(random() * all.length)].id)
  })
  assert.deepEqual(order(siblings, all), referenceOrder(siblings, all), `Random sibling group ${round} keeps its order.`)
}

// One long flat list, as the "Notwendige Grundlagen" branch of a Personal
// Curriculum can be: sorting it must stay far away from blocking the browser.
const flat = Array.from({ length: 1600 }, (_, index) => goal(`flat-${String(index).padStart(4, '0')}`, `Ziel ${1600 - index}`, {
  requires: index % 7 === 0 && index > 0 ? [`flat-${String(index - 1).padStart(4, '0')}`] : [],
}))
const started = performance.now()
const sortedFlat = order(flat)
const elapsed = performance.now() - started
assert.equal(sortedFlat.length, flat.length)
assert.equal(new Set(sortedFlat).size, flat.length)
flat.forEach((entry) => entry.requires.forEach((requiredId) => {
  assert(sortedFlat.indexOf(requiredId) < sortedFlat.indexOf(entry.id), 'Requirements precede their consumers at scale.')
}))
assert(elapsed < 5000, `Sorting 1600 flat siblings took ${Math.round(elapsed)} ms.`)

console.log('Goal sorter order and scale tests passed.')
