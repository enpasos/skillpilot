import { useMemo } from 'react'
import { LearningUnitMap } from '../src/components/learningUnitMap/LearningUnitMap'
import type { LearningEntryProgress, LearningMapEntry, LearningMapFixture } from '../src/components/learningUnitMap/types'
import type { LearnerGoalNavigationMapProps } from '../src/views/LearnerView'

/** Navigation only: use exactly the visible Cockpit tree and its existing results. */
export function FullCockpitMap(props: LearnerGoalNavigationMapProps) {
  const { rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent, getMastery, completionWaivers } = props
  const fixture = useMemo(() => {
    const rootId = '__full_cockpit_visible_root__'
    const entries: Record<string, LearningMapEntry> = {
      [rootId]: { id: rootId, title: 'Meine Lernziele', description: '', kind: 'unit', requires: [],
        children: rootGoals.filter(goal => visibleGoalIds.has(goal.id)).map(goal => goal.id), position: { x: 0, y: 0 } },
    }
    for (const id of visibleGoalIds) {
      const goal = goalIndexAll.get(id)
      if (!goal) continue
      const children = [...(visibleChildrenByParent.get(id) ?? [])].filter(child => visibleGoalIds.has(child))
      const kind = children.length ? 'unit' : goal.nodeKind === 'exam' || goal.examData ? 'assessment'
        : goal.nodeKind === 'memory' ? 'memory' : goal.tags?.some(tag => tag === 'motivation' || tag === 'orientation') ? 'motivation' : 'goal'
      entries[id] = { id, title: goal.title, description: goal.description, kind, children,
        requires: [...new Set(goal.effectiveRequires ?? goal.requires)].filter(required => visibleGoalIds.has(required)),
        position: { x: 0, y: 0 } }
    }
    return { rootId, title: 'Meine Lernziele', entries } satisfies LearningMapFixture
  }, [rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent])

  const progress = useMemo(() => {
    const result: Record<string, LearningEntryProgress> = {}
    const atoms = (id: string, seen = new Set<string>()): Set<string> => {
      if (seen.has(id)) return new Set()
      seen.add(id)
      const entry = fixture.entries[id]
      if (!entry) return new Set()
      if (!entry.children?.length) return new Set([id])
      return new Set(entry.children.flatMap(child => [...atoms(child, seen)]))
    }
    for (const id of Object.keys(fixture.entries)) {
      const descendants = [...atoms(id)]
      result[id] = {
        total: descendants.length,
        explicit: descendants.filter(atom => getMastery(atom) >= 1).length,
        implicit: descendants.filter(atom => getMastery(atom) < 1 && completionWaivers.has(atom)).length,
      }
    }
    return result
  }, [fixture, getMastery, completionWaivers])
  const command = useMemo(() => ({ entryId: props.selectedGoalId,
    nonce: props.revealRequest?.nonce ?? 0,
    revealEntryId: props.revealRequest?.entryId,
  }), [props.selectedGoalId, props.revealRequest])

  return <div className="full-cockpit-map" data-testid="full-cockpit-map"
    data-selected-goal-id={props.selectedGoalId} data-map-active={props.active}>
    <LearningUnitMap fixture={fixture} embedded active={props.active}
      headingMode="context" rootLabel="Meine Lernziele" learnerProgress={progress}
      activeGoalId={props.activeGoalId} command={command} showInspector={false}
      onEntrySelect={props.onSelectGoal} onEscape={props.onEscape} />
  </div>
}
