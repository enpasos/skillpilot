import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { convertLearningGoal } from '../src/goalTypes'
import type { SkillLandscape } from '../src/landscapeTypes'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { goalMatchesFilters } from '../src/utils/goalFilters'
import { countStageTargetAtoms } from './lib/stateStageAtomCounts'
import { COMPOSITION_VIEW_13_SCHEMA, normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'

const fixture = {
  landscapeId: 'fixture', locale: 'de', subject: 'test', title: 'test', description: '',
  goals: [
    { id: 'group', title: 'group', description: '', weight: 1, type: 'cluster', contains: ['a', 'b', 'lk', 'empty'] },
    { id: 'a', title: 'a', description: '', weight: 1, contains: [] },
    { id: 'b', title: 'b', description: '', weight: 1, contains: [] },
    { id: 'lk', title: 'lk', description: '', weight: 1, contains: [], courseLevel: 'LK' },
    { id: 'empty', title: 'empty', description: '', weight: 1, type: 'cluster', contains: [] },
    { id: 'upper', title: 'upper', description: '', weight: 1, contains: [] },
  ],
} as SkillLandscape
const view = {
  landscapeId: 'fixture', viewId: 'fixture', viewFormatVersion: '1.2', scope: {}, rootNodes: [
    { kind: 'structure', id: 'root', label: 'test', children: [
      { kind: 'structure', id: 'lower', label: 'Sekundarstufe I', children: [
        { kind: 'structure', id: 'standard-track', label: 'Standard track', children: [{ kind: 'canonicalSubtree', goalId: 'group' }] },
        { kind: 'structure', id: 'special-track', label: 'Specialised track', children: [{ kind: 'goalEntry', goalId: 'a' }] },
      ] },
      { kind: 'structure', id: 'upper', label: 'Sekundarstufe II (GK)', children: [
        { kind: 'goalEntry', goalId: 'upper' },
      ] },
      { kind: 'goalEntry', goalId: 'b', projectionRole: 'prerequisiteOnly' },
    ] },
  ],
}
const lower = { jurisdiction: 'DE-HE', stage: 'SekI' as const, courseProfile: 'GK' as const }
assert.deepEqual([...countStageTargetAtoms(fixture, view, lower)], ['a'])
assert.deepEqual([...countStageTargetAtoms(fixture, view, { ...lower, courseProfile: 'LK' })], ['a', 'lk'])
assert.deepEqual([...countStageTargetAtoms(fixture, view, { ...lower, stage: 'SekII' })], ['upper'])
assert.deepEqual([...countStageTargetAtoms(fixture, { ...view, viewFormatVersion: '1.0' }, lower)], ['a'])
assert.deepEqual([...countStageTargetAtoms(fixture, { ...view, viewFormatVersion: undefined }, lower)], ['a'])
const offeredView = normalizeCompositionView({ ...structuredClone(view), $schema: COMPOSITION_VIEW_13_SCHEMA, viewFormatVersion: '1.3' })
const offeredRoot = offeredView.rootNodes[0]
assert(offeredRoot.kind === 'structure')
const offeredLower = offeredRoot.children[0]
assert(offeredLower.kind === 'structure')
offeredLower.children.push({ kind: 'goalEntry', goalId: 'offer', projectionRole: 'voluntary' })
const offeredFixture = { ...fixture, goals: [...fixture.goals, { id: 'offer', title: 'Offer', description: '', weight: 1, contains: [] }] } as SkillLandscape
assert.deepEqual([...countStageTargetAtoms(offeredFixture, offeredView, lower)], ['a'], 'Visible offers do not enter regular stage counts.')
assert.throws(() => countStageTargetAtoms(offeredFixture, { ...offeredView, viewFormatVersion: '1.2' }, lower), /exact source schema/)
assert.throws(() => countStageTargetAtoms(fixture, { ...view, rootNodes: [
  { kind: 'structure', label: 'Sekundarstufe I', children: [{ kind: 'goalEntry', goalId: 'missing' }] },
] }, lower), /Unresolved target/u)
console.log('Fixture: target/support precedence, course filter, stage I/II separation, empty clusters, overlap set union, legacy1.0 and missing targets passed')

for (const [subject, file] of [['mathematik', 'MATHEMATIK'], ['physik', 'PHYSIK']]) {
  const landscape = JSON.parse(readFileSync(resolve('../curricula/DE/Gymnasium/canonical', `DE_DEU_S_GYM_CANONICAL_${file}.de.json`), 'utf8')) as SkillLandscape
  const canonical = new Map(landscape.goals.map(goal => [goal.id, convertLearningGoal(goal)]))
  for (const { jurisdiction, durationModel } of [
    { jurisdiction: 'DE-HE', durationModel: 'G8' }, { jurisdiction: 'DE-HE', durationModel: 'G9' },
    { jurisdiction: 'DE-BY', durationModel: undefined },
  ]) {
    for (const stage of ['SekI', 'SekII'] as const) {
      for (const courseProfile of stage === 'SekI' ? [undefined] : ['GK', 'LK'] as const) {
        const suffix = durationModel ? `-${durationModel.toLowerCase()}` : ''
        const filename = stage === 'SekI' ? `${jurisdiction.toLowerCase()}-seki${suffix}.view.json`
          : `${jurisdiction.toLowerCase()}-${courseProfile!.toLowerCase()}${suffix}.view.json`
        const raw = JSON.parse(readFileSync(resolve('../curricula/DE/Gymnasium/composition-views', subject, filename), 'utf8'))
        const actual = countStageTargetAtoms(landscape, raw, { jurisdiction, stage, courseProfile, durationModel })
        const projected = applyCompositionViewProjection([{ meta: landscape, goals: [...canonical.values()] }], raw)[0]
        const projectedGoals = new Map(projected.goals.map(goal => [goal.id, goal]))
        const pattern = stage === 'SekI' ? /^Sekundarstufe I(?:$|\s|\()/u : /^Sekundarstufe II(?:$|\s|\()/u
        const stageNodes = projected.goals.filter(goal => goal.extendedData?.syntheticStructureKind === 'compositionView' && pattern.test(goal.title))
        assert.ok(stageNodes.length > 0, filename)
        const expected = new Set<string>(), visited = new Set<string>()
        const walk = (id: string) => {
          if (visited.has(id)) return
          visited.add(id)
          const goal = projectedGoals.get(id), original = canonical.get(id)
          if (original && original.type !== 'cluster' && original.contains.length === 0
            && goalMatchesFilters(original, [jurisdiction, ...(durationModel ? [durationModel] : []), ...(courseProfile ? [courseProfile] : [])])) expected.add(id)
          goal?.contains.forEach(walk)
        }
        stageNodes.forEach(goal => walk(goal.id))
        assert.deepEqual([...actual].sort(), [...expected].sort(), `${subject} ${filename} ${stage}`)
        console.log(`${subject} ${jurisdiction} ${durationModel ?? 'neutral'} ${stage} ${courseProfile ?? ''}: ${actual.size} matches actual composition projection`)
      }
    }
  }
}
