import { unitStudyRelations } from '../../utils/unitStudyOrder'
import type { LearningMapFixture, LearningMapRelation } from './types'

export function getLearningScopeRelations(fixture: LearningMapFixture, scopeId: string): LearningMapRelation[] {
  const scope = fixture.entries[scopeId]
  const children = scope?.children ?? []
  const visible = new Set(children)
  const relations: LearningMapRelation[] = fixture.scopeRelations ? fixture.scopeRelations[scopeId] ?? [] : children.flatMap(target => (fixture.entries[target]?.requires ?? [])
    .filter(source => visible.has(source))
    .map(source => ({ source, target, kind: 'requirement' as const, provenance: [] })))
  const studyRelations = unitStudyRelations(children, scope?.orientationGoalId, scope?.guidedStudyOrder, id => {
    const kind = fixture.entries[id].kind
    return kind !== 'assessment' && kind !== 'memory'
  }, relations)
  return [...relations, ...studyRelations.map(edge => ({ ...edge, provenance: [] }))]
}
