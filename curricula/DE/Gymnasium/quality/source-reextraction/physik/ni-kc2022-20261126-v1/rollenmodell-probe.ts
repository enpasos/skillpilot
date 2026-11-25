import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeLandscape } from '../../../../../../../app/src/hooks/useLandscapes.ts'
import { collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime.ts'
import { normalizeLearnerProjectedEntries } from '../../../../../../../app/src/utils/learnerTreeProjection.ts'
import { buildVisibleChildrenMap } from '../../../../../../../app/src/utils/treeProjectionRuntime.ts'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../../../../../../../app/src/utils/curriculumDisplay.ts'

// Run from the checkout root with app/node_modules/.bin/tsx.
const gymnasium = resolve('curricula/DE/Gymnasium')
const catalog = JSON.parse(readFileSync(resolve(gymnasium, 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'), 'utf8'))
const canonical = normalizeLandscape(catalog)!
const canonicalById = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const prefixes = ['6d25344c', '72649cf5', '7c0b94b9', '879491c0', 'be6d4895', '8a1d4093', '15cb40f1']
const ids = prefixes.map((prefix) => canonical.goals.find((goal) => goal.id.startsWith(prefix))!.id)

for (const file of ['de-ni-gk', 'de-ni-lk', 'de-ni-sekii-gk', 'de-ni-sekii-lk']) {
  const view = JSON.parse(readFileSync(resolve(gymnasium, 'composition-views/physik', file + '.view.json'), 'utf8'))
  const [projected] = normalizeLearnerProjectedEntries(applyCompositionViewProjection([canonical], view))
  const byId = new Map(projected.goals.map((goal) => [goal.id, goal]))
  const filters = [view.scope.courseProfile, view.scope.jurisdiction].filter(Boolean)
  const children = buildVisibleChildrenMap(byId, undefined, {
    [CANONICAL_GYMNASIUM_ROOT_ID]: { selected: true, stage: view.scope.stage },
    [canonical.meta.landscapeId]: { selected: true, filterId: filters.join(',') },
  })
  const visible = new Set<string>()
  function visit(id: string) {
    if (visible.has(id)) return
    visible.add(id)
    for (const child of children.get(id) ?? []) visit(child)
  }
  projected.goals.filter((goal) => goal.tags?.includes('root')).forEach((goal) => visit(goal.id))
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, canonicalById)
  const goals = ids.map((id) => ({
    id,
    title: canonicalById.get(id)?.title,
    tags: canonicalById.get(id)?.tags,
    target: roles.targetGoalIds.has(id),
    prerequisiteOnly: roles.prerequisiteOnlyGoalIds.has(id),
    visible: visible.has(id),
  }))
  console.log(JSON.stringify({ file, viewId: view.viewId, scope: view.scope, goals }))
}
