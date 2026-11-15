/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../../src/views/LearnerViewPresentation.css'
import type { UiGoal } from '../../src/goalTypes'
import LearnerGoalNavigationMap from '../../src/components/learningUnitMap/LearnerGoalNavigationMap'
import { MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID } from '../../src/components/learningUnitMap/learnerUnitMapPreview'

// The real map adapter on small hand-made learner trees; no fetch, learner state or backend adapters.
const chemistry = 'fixture-unit-map-chemistry'
const goal = (id: string, landscapeId: string, contains: string[] = [], extra: Partial<UiGoal> = {}): UiGoal => ({
  id, title: id, description: id, phase: 'GLOBAL', themenfeld: '', area: '', level: 0, core: true, weight: 1, tags: [],
  leitideen: [], kompetenzen: [], sourceRef: '', requires: [], contains, examples: [], effectiveRequires: [], inheritedRequires: [],
  type: contains.length ? 'cluster' : 'atomic', nodeKind: 'tutor', landscapeId, ...extra,
})
const section = (viewId: string, nodeId: string, landscapeId: string, title: string, contains: string[]) =>
  goal(`composition:${viewId}:structure:${nodeId}`, landscapeId, contains, { title, tags: ['synthetic:program-unit'],
    extendedData: { syntheticStructureKind: 'compositionView', compositionViewId: viewId, compositionNodeId: nodeId } })
const root = (id: string, landscapeId: string, title: string, contains: string[]) => goal(id, landscapeId, contains, { title, tags: ['root'] })

const mode = new URLSearchParams(location.search).get('mode') ?? 'list'
// One Physics stage with more goals than a board shows as a graph.
const manyIds = Array.from({ length: 205 }, (_, index) => `force-${String(index + 1).padStart(3, '0')}`)
const goals: UiGoal[] = mode === 'list' ? [
  root('physics-root', PHYSICS_LANDSCAPE_ID, 'Physik', ['composition:fx-phys:structure:physics-seki', 'why-physics']),
  section('fx-phys', 'physics-seki', PHYSICS_LANDSCAPE_ID, 'Sekundarstufe I', manyIds),
  ...manyIds.map((id, index) => goal(id, PHYSICS_LANDSCAPE_ID, [], { title: `Kraft ${index + 1}`, requires: index ? [manyIds[index - 1]] : [] })),
  goal('why-physics', PHYSICS_LANDSCAPE_ID, [], { title: 'Wozu Physik?' }),
] : [
  ...(mode === 'mixed' ? [root('math-root', MATHEMATICS_LANDSCAPE_ID, 'Mathematik', ['numbers']),
    goal('numbers', MATHEMATICS_LANDSCAPE_ID, [], { title: 'Zahlen darstellen' })] : []),
  root('chemistry-root', chemistry, 'Chemie', ['composition:fx-chem:structure:c-seki']),
  section('fx-chem', 'c-seki', chemistry, 'Sekundarstufe I', ['atoms']),
  goal('atoms', chemistry, [], { title: 'Atome beschreiben' }),
]
const goalIndexAll = new Map(goals.map(item => [item.id, item]))
const visibleChildrenByParent = new Map(goals.map(item => [item.id, item.contains]))
const rootGoals = goals.filter(item => item.tags?.includes('root'))
const visibleGoalIds = new Set(goals.map(item => item.id))
const mastered = new Set(['force-001'])

function Fixture() {
  const [selected, setSelected] = useState(mode === 'list' ? 'force-003' : 'atoms')
  const [returned, setReturned] = useState(false)
  return <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100vh' }}>
    <div style={{ minHeight: 0, position: 'relative' }}>
      <LearnerGoalNavigationMap rootGoals={rootGoals} goalIndexAll={goalIndexAll} visibleGoalIds={visibleGoalIds}
        visibleChildrenByParent={visibleChildrenByParent} selectedGoalId={selected} activeGoalId="force-002"
        getMastery={id => mastered.has(id) ? 1 : 0} completionWaivers={new Map()} onSelectGoal={setSelected}
        active language="de" onReturnToTree={() => setReturned(true)} />
    </div>
    <footer style={{ padding: 8 }}>
      <output data-testid="unit-map-selected">{selected}</output>
      <output data-testid="unit-map-returned">{returned ? 'returned' : ''}</output>
    </footer>
  </div>
}

createRoot(document.getElementById('root')!).render(<Fixture />)
