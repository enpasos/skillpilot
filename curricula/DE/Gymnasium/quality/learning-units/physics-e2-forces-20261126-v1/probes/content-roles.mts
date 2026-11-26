// Run with tsx from the repository root. All changes are confined to in-memory copies.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const moduleUrl = (file: string) => pathToFileURL(resolve(file)).href
const { normalizeLandscape } = await import(moduleUrl('app/src/hooks/useLandscapes.ts'))
const { applyCompositionViewProjection } = await import(moduleUrl('app/src/utils/compositionViewRuntime.ts'))
const { collectCompositionProjectionRoleGoalIds } = await import(moduleUrl('app/src/utils/authoring/compositionViewAuthoring.ts'))
const read = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const canonical = normalizeLandscape(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'))
const views = 'curricula/DE/Gymnasium/composition-views/physik'
const id = '11111111-2222-4333-8444-555555555555'
const example = canonical.goals.find(goal => goal.id === '5ea765ac-c279-551a-8a94-a07da2381e5b')
assert.ok(example)
canonical.goals.push({ ...example, id, title: 'Probe', contains: [], requires: [], effectiveRequires: [] })
const byId = new Map(canonical.goals.map(goal => [goal.id, goal]))

function findStructure(nodes, id: string) {
  for (const node of nodes) {
    if (node.kind !== 'structure') continue
    if (node.id === id) return node
    const nested = findStructure(node.children, id)
    if (nested) return nested
  }
}

function measure(view) {
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  const [projection] = applyCompositionViewProjection([canonical], view)
  return {
    requiredTarget: roles.targetGoalIds.has(id),
    preparationOnly: roles.prerequisiteOnlyGoalIds.has(id),
    visibleParents: projection.goals.filter(goal => goal.contains?.includes(id)).length,
    preparationPlacements: (projection.compositionPreparationPlacements ?? []).filter(p => p.goalId === id).length,
  }
}

const result = []
for (const role of ['target', 'prerequisiteOnly', 'voluntary']) {
  const view = read(`${views}/de-he-sekii-gk.view.json`)
  const section = findStructure(view.rootNodes, 'physics-e2-several-forces')
  assert.ok(section)
  section.children.push({kind: 'goalEntry', goalId: id, projectionRole: role,
    ...(role === 'prerequisiteOnly' ? {acquisitionPlacement: true} : {}),
    displayLabel: 'Freiwillige Vertiefung'})
  const measured = measure(view)
  assert.equal(measured.requiredTarget, role !== 'prerequisiteOnly')
  assert.equal(measured.visibleParents, role === 'prerequisiteOnly' ? 0 : 1)
  result.push({view: view.viewId, role, ...measured})
}
for (const [file, unit, expectedRestriction] of [
  ['de-sl-seki.view.json', 'physics-sl-unit-j8', 'naturwissenschaftlicher Zweig'],
  ['de-bw-seki.view.json', 'physics-bw-unit-j7-8', 'Bildungsplan V2'],
]) {
  const view = read(`${views}/${file}`)
  const section = findStructure(view.rootNodes, unit)
  assert.ok(section)
  section.children.push({kind: 'goalEntry', goalId: id, projectionRole: 'target', displayLabel: expectedRestriction})
  const measured = measure(view)
  assert.equal(measured.requiredTarget, true)
  assert.equal(measured.visibleParents, 1)
  result.push({file, expectedRestriction, actualScope: view.scope, ...measured})
}
console.log(JSON.stringify(result, null, 2))
