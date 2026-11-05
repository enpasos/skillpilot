import type { LearningMapFixture, LearningMapRelation } from './types'

export function getLearningScopeRelations(fixture: LearningMapFixture, scopeId: string): LearningMapRelation[] {
  if (fixture.scopeRelations) return fixture.scopeRelations[scopeId] ?? []
  const children = fixture.entries[scopeId]?.children ?? []
  const visible = new Set(children)
  return children.flatMap(target => (fixture.entries[target]?.requires ?? [])
    .filter(source => visible.has(source))
    .map(source => ({ source, target, kind: 'requirement' as const, provenance: [] })))
}
