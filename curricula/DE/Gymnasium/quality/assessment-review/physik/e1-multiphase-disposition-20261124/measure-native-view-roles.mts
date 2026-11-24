import assert from 'node:assert/strict'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { normalizeLandscape } from '../../../../../../../app/src/hooks/useLandscapes'
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries } from '../../../../../../../app/src/utils/learnerTreeProjection'
import { buildVisibleChildrenMap } from '../../../../../../../app/src/utils/treeProjectionRuntime'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../../../../../../../app/src/utils/curriculumDisplay'
import { collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const root = 'curricula/DE/Gymnasium'
const oldId = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
const successorId = '05cfd298-cb80-54c4-a898-b521ef270843'
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const physics = normalizeLandscape(readJson(join(root, 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')))!
const goals = new Map(physics.goals.map(goal => [goal.id, goal]))
const prerequisites = goals.get(oldId)!.requires
const viewDirectory = join(root, 'composition-views/physik')
const rows = []

for (const file of readdirSync(viewDirectory).filter(name => name.endsWith('.view.json')).sort()) {
  const view = readJson(join(viewDirectory, file))
  const [projection] = normalizeLearnerProjectedEntries(applyCompositionViewProjection([physics], view))
  const projectedGoals = new Map(projection.goals.map(goal => [goal.id, goal]))
  const filters = [view.scope.courseProfile, view.scope.jurisdiction].filter(Boolean)
  const children = buildVisibleChildrenMap(projectedGoals, undefined, {
    [CANONICAL_GYMNASIUM_ROOT_ID]: { selected: true, stage: view.scope.stage },
    [physics.meta.landscapeId]: { selected: true, filterId: filters.join(',') },
  })

  const visible = new Set<string>()
  function visit(id: string) {
    assert(!visible.has(id), `Duplicate goal in ${view.viewId}`)
    visible.add(id)
    for (const child of children.get(id) ?? []) visit(child)
  }
  projection.goals.filter(goal => goal.tags?.includes('root')).forEach(goal => visit(goal.id))
  const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
  rows.push({
    file,
    viewId: view.viewId,
    scope: view.scope,
    visibleOld: visible.has(oldId),
    visibleNew: visible.has(successorId),
    targetOld: targetGoalIds.has(oldId),
    targetNew: targetGoalIds.has(successorId),
    supportOld: prerequisiteOnlyGoalIds.has(oldId),
    supportNew: prerequisiteOnlyGoalIds.has(successorId),
    directPreparation: prerequisites.map(id => ({
      id,
      visible: visible.has(id),
      role: targetGoalIds.has(id) ? 'target' : prerequisiteOnlyGoalIds.has(id) ? 'prerequisiteOnly' : 'absent',
    })),
  })
}

assert.equal(rows.length, 90)
assert(process.argv[2], 'Supply an output filename')
writeFileSync(process.argv[2], JSON.stringify(rows, null, 2) + '\n')
console.log('Views:', rows.length, 'visible old offers:', rows.filter(row => row.visibleOld).length,
  'visible successor offers:', rows.filter(row => row.visibleNew).length)
