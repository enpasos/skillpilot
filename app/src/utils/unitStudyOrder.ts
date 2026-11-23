import type { LearningMapFixture } from '../components/learningUnitMap/types'
import type { UiGoal } from '../goalTypes'
import { projectCompositionChildOrder, readCompositionChildOrder } from './authoring/compositionViewAuthoring'

export interface SiblingRelation {
  source: string
  target: string
}

export function unitStudyRelations(
  children: readonly string[],
  orientationGoalId: string | undefined,
  guidedStudyOrder: readonly string[] | undefined,
  isStudyStep: (id: string) => boolean,
  relations: readonly (SiblingRelation & { backward?: boolean })[],
): (SiblingRelation & { kind: 'guidedStudy' | 'unitEntry' })[] {
  const visible = new Set(children)
  const ordered = (guidedStudyOrder ?? []).filter(id => visible.has(id))
  const additions: (SiblingRelation & { kind: 'guidedStudy' | 'unitEntry' })[] = []
  for (let index = 1; index < ordered.length; index++) {
    const source = ordered[index - 1], target = ordered[index]
    if (!relations.some(edge => edge.source === source && edge.target === target)) {
      additions.push({ source, target, kind: 'guidedStudy' })
    }
  }
  if (orientationGoalId && visible.has(orientationGoalId)) {
    const steps = children.filter(id => id !== orientationGoalId && isStudyStep(id))
    const sources = new Set([orientationGoalId, ...steps])
    const following = new Set([...relations, ...additions]
      .filter(edge => !('backward' in edge && edge.backward) && sources.has(edge.source)).map(edge => edge.target))
    for (const target of steps) {
      if (!following.has(target)) additions.push({ source: orientationGoalId, target, kind: 'unitEntry' })
    }
  }
  return additions
}

/** Project a parent's authored partial order onto the structural siblings that survived filtering. */
export function compositionSiblingOrder(parent: UiGoal, children: readonly UiGoal[]): SiblingRelation[] {
  const declaration = parent.extendedData?.compositionChildOrder
  if (declaration === undefined) return []
  const sourceIds = parent.extendedData?.compositionChildOrderChildIds
  if (!Array.isArray(sourceIds) || !sourceIds.every(id => typeof id === 'string')
    || new Set(sourceIds).size !== sourceIds.length) throw new Error('Missing source child identities for composition childOrder')
  const byNodeId = new Map<string, string>()
  for (const child of children) {
    const nodeId = child.extendedData?.compositionNodeId
    if (typeof nodeId === 'string') byNodeId.set(nodeId, child.id)
  }
  const declared = readCompositionChildOrder(declaration, sourceIds)!
  return projectCompositionChildOrder(declared, [...byNodeId.keys()]).after
    .map(pair => ({ source: byNodeId.get(pair.after)!, target: byNodeId.get(pair.unit)! }))
}

/** Tree rows may refer to a merged map unit by an alias. Project only edges
 * with unique endpoints among these siblings. Reference nodes on other boards
 * cannot change the tree's hierarchy. */
export function projectedSiblingOrder(fixture: LearningMapFixture, parentId: string, childIds: readonly string[]): SiblingRelation[] | undefined {
  const entryId = (id: string) => fixture.entries[id] ? id : fixture.entryPaths?.[id]?.filter(step => !!fixture.entries[step]).at(-1)
  const scopeId = entryId(parentId)
  if (!scopeId) return
  const relations = fixture.scopeRelations?.[scopeId] ?? []
  const rowsByEntry = new Map<string, string | null>()
  for (const id of childIds) {
    const entry = entryId(id)
    if (entry) rowsByEntry.set(entry, rowsByEntry.has(entry) ? null : id)
  }
  if (![...rowsByEntry.keys()].some(id => fixture.entries[scopeId].children?.includes(id))) return
  return relations.flatMap(edge => {
    const source = rowsByEntry.get(edge.source), target = rowsByEntry.get(edge.target)
    return source && target && !edge.backward ? [{ source, target }] : []
  })
}
