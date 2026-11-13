// SPDX-License-Identifier: Apache-2.0
// Knowledge-context derivation: definition on a synthetic catalog, invariants on the canonical catalog, CLI contract.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCanonicalCatalog } from './deriveKnowledgeContext'
import {
  KnowledgeContextError, KnowledgeContextIndex, renderKnowledgeContext,
  type ContextGoalRef, type ContextLandscape,
} from './lib/knowledgeContext'

const scripts = dirname(fileURLToPath(import.meta.url))
const ids = (refs: ContextGoalRef[]): string[] => refs.map((entry) => entry.id)

// Mathematics: subject root R with the areas A1 and A2, an orientation goal directly below R, and a separate root S.
// Physics: one area whose goals require Mathematics. The overview contains both subject roots.
const catalog = (): ContextLandscape[] => [
  {
    landscapeId: 'M', subject: 'Mathematik', goals: [
      { id: 'R', title: 'Mathematik', contains: ['o', 'A1', 'A2'] },
      { id: 'o', title: 'Warum', semanticKind: 'orientation' },
      { id: 'A1', title: 'Bereich eins', contains: ['a1', 'a2', 'a3', 'e1', 'C', 'x', 'm'] },
      { id: 'a1', title: 'Alpha' },
      { id: 'a2', title: 'Beta', requires: ['a1'] },
      { id: 'a3', title: 'Gamma', requires: ['a2'], description: 'Die lernende Person kann Gamma.' },
      { id: 'e1', title: 'Pruefung', requires: ['a3'], examData: { taskContent: 't', solutionContent: 's', scoring: {} } },
      { id: 'C', title: 'Cluster', requires: ['a1'], contains: ['c1', 'c2'] },
      { id: 'c1', title: 'Delta' },
      { id: 'c2', title: 'Epsilon', requires: ['c1'] },
      { id: 'x', title: 'Zeta', requires: ['e1'] },
      { id: 'm', title: 'Karten', requires: ['a1'], semanticKind: 'memory' },
      { id: 'A2', title: 'Bereich zwei', contains: ['b1', 'b2'] },
      { id: 'b1', title: 'Eta', requires: ['a3'] },
      { id: 'b2', title: 'Theta' },
      { id: 'S', title: 'Eigene Wurzel', contains: ['s1', 's2'] },
      { id: 's1', title: 'Iota' },
      { id: 's2', title: 'Kappa', requires: ['s1'] },
    ],
  },
  {
    landscapeId: 'P', subject: 'Physik', goals: [
      { id: 'RP', title: 'Physik', contains: ['AP'] },
      { id: 'AP', title: 'Mechanik', contains: ['p1', 'p2'] },
      { id: 'p1', title: 'Lambda', requires: ['M:a2'] },
      { id: 'p2', title: 'My', requires: ['p1'] },
    ],
  },
  { landscapeId: 'O', title: 'Gymnasium', goals: [{ id: 'G', title: 'Gymnasium', contains: ['M:R', 'P:RP'] }] },
]

const index = new KnowledgeContextIndex(catalog())

// Secured, builds on, leads to and not yet follow the definition; assessments carry a path but are not listed.
const gamma = index.context('a3')
assert.deepEqual(ids(gamma.buildsOn), ['a2'])
assert.deepEqual(gamma.secured.flatMap((group) => ids(group.goals)), ['a1', 'a2'])
assert.equal(gamma.securedCount, 2)
assert.deepEqual(ids(gamma.leadsTo), ['b1'], 'the assessment e1 requires a3 but is not listed')
assert.deepEqual(ids(gamma.areas), ['A1'])
assert.deepEqual(ids(gamma.notYet), ['c1', 'x'], 'c2 requires c1 and is therefore not a first goal')
assert.equal(gamma.goal.description, 'Die lernende Person kann Gamma.')

// A path through an assessment still secures the ordinary goals behind it.
const zeta = index.context('x')
assert.deepEqual(zeta.secured.flatMap((group) => ids(group.goals)), ['a1', 'a2', 'a3'])
assert.deepEqual(ids(zeta.buildsOn), ['a3'])

// A cluster prerequisite is inherited by its atoms; the inherited goal is not maximal.
const epsilon = index.context('c2')
assert.deepEqual(epsilon.secured.flatMap((group) => ids(group.goals)), ['a1', 'c1'])
assert.deepEqual(ids(epsilon.buildsOn), ['c1'])

// Cross-area dependents and neighbours of another area.
const eta = index.context('b1')
assert.deepEqual(ids(eta.areas), ['A2'])
assert.deepEqual(ids(eta.notYet), ['b2'])

// Assessment and memory goals develop nothing; orientation goals directly below the subject root have no area.
const exam = index.context('e1')
assert.equal(exam.goal.kind, 'assessment')
assert.deepEqual(exam.secured.flatMap((group) => ids(group.goals)), ['a1', 'a2', 'a3'])
assert.match(renderKnowledgeContext(exam), /erarbeitet nichts Neues/u)
assert.equal(index.context('m').goal.kind, 'memory')
const orientation = index.context('o')
assert.deepEqual([orientation.areas, orientation.notYet, orientation.buildsOn], [[], [], []])

// A separate root is the area of its goals; the overview landscape above the subject roots is none.
assert.deepEqual(ids(index.context('s2').areas), ['S'])
assert.deepEqual(ids(index.context('s1').notYet), ['s2'])
assert.deepEqual(ids(index.context('a1').areas), ['A1'])

// Prerequisites in another landscape are secured and grouped by subject and area.
const my = index.context('p2')
assert.deepEqual(ids(my.buildsOn), ['p1'])
assert.deepEqual(my.secured.map((group) => [group.subject, ids(group.areas).join(), ids(group.goals).join()]), [
  ['Mathematik', 'A1', 'a1,a2'],
  ['Physik', 'AP', 'p1'],
])

// Clusters and unknown goals are rejected.
assert.throws(() => index.context('C'), KnowledgeContextError)
assert.throws(() => index.context('missing'), KnowledgeContextError)

// The projection does not depend on the order of landscapes, goals or references.
const reordered = catalog().reverse().map((landscape) => ({
  ...landscape,
  goals: [...landscape.goals].reverse().map((goal) => ({
    ...goal,
    ...(goal.contains ? { contains: [...goal.contains].reverse() } : {}),
    ...(goal.requires ? { requires: [...goal.requires].reverse() } : {}),
  })),
}))
const reorderedIndex = new KnowledgeContextIndex(reordered)
for (const goalId of ['a1', 'a3', 'b1', 'c2', 'e1', 'x', 'p2', 's2', 'o']) {
  assert.deepEqual(reorderedIndex.context(goalId), index.context(goalId), `${goalId}: order of the input must not matter`)
}

// Monotone: an added edge only enlarges the secured goals.
const extended = catalog()
extended[0].goals.find((goal) => goal.id === 'b2')!.requires = ['c2']
const before = new Set(index.securedKeys('M:b2'))
const after = new Set(new KnowledgeContextIndex(extended).securedKeys('M:b2'))
assert.ok([...before].every((key) => after.has(key)) && after.size > before.size)

// Rendering: the core omits the secured goals, the full form lists them; both state the rule.
const core = renderKnowledgeContext(gamma)
const full = renderKnowledgeContext(gamma, { form: 'full' })
assert.match(core, /^Wissenskontext: Gamma \(Lernziel, a3\)\nFach: Mathematik\n/u)
assert.match(core, /Baut auf \(1\):\n- Beta\n/u)
assert.match(core, /Noch nicht gesichert im Bereich „Bereich eins“ \(2\):\n- Delta\n- Zeta\n/u)
assert.doesNotMatch(core, /Gesichert/u)
assert.match(full, /Gesichert \(2\):\nMathematik – Bereich eins:\n- Alpha\n- Beta\n/u)
assert.match(core, /Regel: /u)
assert.match(renderKnowledgeContext(index.context('a1')), /Baut auf: keine/u)
assert.match(renderKnowledgeContext(gamma, { language: 'en' }), /^Knowledge context: Gamma \(learning goal, a3\)\n/u)

// Invariants on the canonical catalog. They pin no count, so curriculum changes do not touch this test.
const canonical = new KnowledgeContextIndex(loadCanonicalCatalog())
const graph = canonical.graph
let checked = 0
for (const landscapeId of canonical.landscapeIds()) {
  for (const key of graph.atomicKeys(landscapeId)) {
    if (graph.kind(key) === 'orientation') continue
    const context = canonical.context(key)
    const secured = new Set(canonical.securedKeys(key))
    const listed = [...context.buildsOn, ...context.leadsTo, ...context.notYet, ...context.secured.flatMap((group) => group.goals)]
    assert.ok(listed.every((entry) => graph.kind(entry.key) === 'ordinary'), `${key}: only ordinary goals are listed`)
    assert.equal(context.secured.reduce((sum, group) => sum + group.goals.length, 0), secured.size, `${key}: secured groups are a partition`)
    // The goals built on generate the secured goals.
    const generated = new Set<string>()
    for (const entry of context.buildsOn) {
      generated.add(entry.key)
      for (const required of canonical.securedKeys(entry.key)) generated.add(required)
    }
    assert.deepEqual([...generated].sort(), [...secured].sort(), `${key}: builds on must generate the secured goals`)
    const areas = new Set(context.areas.map((area) => area.key))
    for (const entry of context.notYet) {
      assert.ok(!secured.has(entry.key) && entry.key !== key, `${key}: a not-yet goal must not be secured`)
      assert.ok(canonical.areaKeys(entry.key).some((area) => areas.has(area)), `${key}: a not-yet goal shares an area`)
    }
    for (const entry of context.leadsTo) {
      assert.ok(graph.directAtomicRequires(entry.key).includes(key), `${key}: a goal it leads to requires it directly`)
    }
    checked++
  }
}
assert.ok(checked > 0, 'the canonical catalog has atomic goals')

// CLI contract: exit codes and the three modes.
const cli = (...args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', resolve(scripts, 'deriveKnowledgeContext.ts'), ...args],
  { cwd: resolve(scripts, '..'), encoding: 'utf8' })
const someGoal = graph.atomicKeys(canonical.landscapeIds()[0])[0]
const single = cli(someGoal, '--json')
assert.equal(single.status, 0, single.stderr)
assert.equal(JSON.parse(single.stdout).goal.key, someGoal)
const unknown = cli('no-such-goal')
assert.equal(unknown.status, 2)
assert.match(unknown.stderr, /^invalid-input: Unknown goal/u)
assert.equal(cli().status, 2)
assert.equal(cli('--report', someGoal).status, 2)

console.log(`Knowledge-context derivation passed: ${checked} canonical contexts checked.`)
