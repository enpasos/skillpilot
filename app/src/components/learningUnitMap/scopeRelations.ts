import type { LearningMapFixture, LearningMapRelation } from './types'

export function getLearningScopeRelations(fixture: LearningMapFixture, scopeId: string): LearningMapRelation[] {
  const scope = fixture.entries[scopeId]
  const children = scope?.children ?? []
  const visible = new Set(children)
  const relations: LearningMapRelation[] = fixture.scopeRelations ? fixture.scopeRelations[scopeId] ?? [] : children.flatMap(target => (fixture.entries[target]?.requires ?? [])
    .filter(source => visible.has(source))
    .map(source => ({ source, target, kind: 'requirement' as const, provenance: [] })))
  const start = scope?.orientationGoalId
  if (!start) return relations

  // Show where regular study begins. Exams may be attempted directly;
  // resource references retain their own relationships.
  const steps = new Set(children.filter(id => {
    const kind = fixture.entries[id].kind
    return kind !== 'assessment' && kind !== 'memory' && id !== start
  }))
  const following = new Set(relations.filter(({ source, backward }) =>
    !backward && (steps.has(source) || source === start)).map(({ target }) => target))
  return [...relations, ...[...steps].filter(id => !following.has(id)).map(target => ({
    source: start, target, kind: 'unitEntry' as const, provenance: [],
  }))]
}
