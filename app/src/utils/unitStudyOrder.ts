import type { LearningMapFixture, UnitStudyRecommendation } from '../components/learningUnitMap/types'
import type { UiGoal } from '../goalTypes'
import { projectCompositionChildOrder, readCompositionChildOrder } from './authoring/compositionViewAuthoring'

export interface SiblingRelation {
  source: string
  target: string
}

export interface UnitStudyOrder {
  orientationGoalId?: string
  guidedStudyOrder?: readonly string[]
  studyRecommendations?: readonly UnitStudyRecommendation[]
}

/** Show each pair on the deepest board that has a separate visible branch for each endpoint. */
export function projectUnitStudyRecommendations(
  scopeId: string,
  recommendations: readonly UnitStudyRecommendation[],
  childrenOf: (id: string) => readonly string[] | undefined,
): Map<string, UnitStudyRecommendation[]> {
  const endpoints = new Set(recommendations.flatMap(({ beforeGoalId, afterGoalId }) => [beforeGoalId, afterGoalId]))
  const paths = new Map<string, string[] | null>()
  const visit = (id: string, ancestors: string[]) => {
    if (ancestors.includes(id)) return
    const path = [...ancestors, id]
    // An endpoint displayed in multiple branches has no unique visible route.
    if (endpoints.has(id)) paths.set(id, paths.has(id) ? null : path)
    for (const child of childrenOf(id) ?? []) visit(child, path)
  }
  visit(scopeId, [])

  const boards = new Map<string, UnitStudyRecommendation[]>()
  for (const { beforeGoalId, afterGoalId } of recommendations) {
    const before = paths.get(beforeGoalId), after = paths.get(afterGoalId)
    if (!before || !after) continue
    let depth = 1
    while (before[depth] && before[depth] === after[depth]) depth++
    if (!before[depth] || !after[depth]) continue
    const board = before[depth - 1]
    const pairs = boards.get(board) ?? []
    pairs.push({ beforeGoalId: before[depth], afterGoalId: after[depth] })
    boards.set(board, pairs)
  }
  return boards
}

export function reachesSibling(successors: ReadonlyMap<string, ReadonlySet<string>>, from: string, to: string): boolean {
  const pending = [from], visited = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (id === to) return true
    if (visited.has(id)) continue
    visited.add(id)
    for (const next of successors.get(id) ?? []) pending.push(next)
  }
  return false
}

export function unitStudyRelations(
  children: readonly string[],
  { orientationGoalId, guidedStudyOrder, studyRecommendations }: UnitStudyOrder,
  isStudyStep: (id: string) => boolean,
  relations: readonly (SiblingRelation & { backward?: boolean })[],
): (SiblingRelation & { kind: 'guidedStudy' | 'unitEntry' | 'studyRecommendation' })[] {
  const visible = new Set(children)
  const ordered = (guidedStudyOrder ?? []).filter(id => visible.has(id))
  const additions: (SiblingRelation & { kind: 'guidedStudy' | 'unitEntry' | 'studyRecommendation' })[] = []
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
  if (studyRecommendations?.length) {
    const successors = new Map<string, Set<string>>(children.map(id => [id, new Set()]))
    for (const { source, target } of [...relations, ...additions]) {
      if (visible.has(target)) successors.get(source)?.add(target)
    }
    // A recommendation has two explicit endpoints. Filtering never connects the
    // remaining steps to each other, and a recommendation cannot reverse a path.
    for (const { beforeGoalId: source, afterGoalId: target } of studyRecommendations) {
      const following = successors.get(source)
      if (!following || !visible.has(target) || following.has(target) || reachesSibling(successors, target, source)) continue
      additions.push({ source, target, kind: 'studyRecommendation' })
      following.add(target)
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
