/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../src/index.css'
import '../../src/views/LearnerViewPresentation.css'
import type { UiGoal } from '../../src/goalTypes'
import LearnerGoalNavigationMap from '../../src/components/learningUnitMap/LearnerGoalNavigationMap'
import { MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID } from '../../src/utils/learnerNavigation/learnerUnitMapPreview'

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

const query = new URLSearchParams(location.search)
const mode = query.get('mode') ?? 'large'
const physicsBoard = ['large', 'overview', 'wide'].includes(mode)
const manyIds = Array.from({ length: mode === 'large' ? 205 : 17 }, (_, index) => `force-${String(index + 1).padStart(3, '0')}`)
const mathTasks = Array.from({ length: 19 }, (_, i) => `quadratic-${i + 1}`)
const singleAssessmentStudy = Array.from({ length: 5 }, (_, index) => `single-motion-${index + 1}`)
const goals: UiGoal[] = mode === 'math-assessments' ? [
  root('math-root', MATHEMATICS_LANDSCAPE_ID, 'Mathematik', ['composition:fx-math:structure:sek1']),
  section('fx-math', 'sek1', MATHEMATICS_LANDSCAPE_ID, 'Quadratische Funktionen', mathTasks),
  ...mathTasks.map((id, index) => goal(id, MATHEMATICS_LANDSCAPE_ID, [], {
    title: index === 8 ? 'Scheitelpunkt bestimmen' : index === 10 ? 'Nullstellen bestimmen'
      // One title carries a formula: the map renders it instead of showing the delimiters.
      : index === 9 ? 'Parabel $y = x^2$ zeichnen' : `Parabelaufgabe ${index + 1}`,
    nodeKind: index === 8 || index === 10 ? 'exam' : 'tutor',
    requires: index ? [mathTasks[index - 1]] : [],
  })),
] : mode === 'nested-single-assessment' ? [
  root('physics-root', PHYSICS_LANDSCAPE_ID, 'Physik', ['composition:fx-single:structure:e1']),
  section('fx-single', 'e1', PHYSICS_LANDSCAPE_ID, 'Bewegungen', ['composition:fx-single:structure:uniform']),
  section('fx-single', 'uniform', PHYSICS_LANDSCAPE_ID, 'Gleichförmige Bewegung',
    [...singleAssessmentStudy, 'single-motion-assessment']),
  ...singleAssessmentStudy.map((id, index) => goal(id, PHYSICS_LANDSCAPE_ID, [], {
    title: `Bewegung untersuchen ${index + 1}`, requires: index ? [singleAssessmentStudy[index - 1]] : [],
  })),
  goal('single-motion-assessment', PHYSICS_LANDSCAPE_ID, [], {
    title: 'Eine Bewegung prüfen', nodeKind: 'exam', requires: [singleAssessmentStudy.at(-1)!],
  }),
] : physicsBoard ? [
  root('physics-root', PHYSICS_LANDSCAPE_ID, 'Physik', ['composition:fx-phys:structure:physics-seki', 'why-physics']),
  section('fx-phys', 'physics-seki', PHYSICS_LANDSCAPE_ID, 'Sekundarstufe I', manyIds),
  ...manyIds.map((id, index) => goal(id, PHYSICS_LANDSCAPE_ID, [], { title: `Kraft ${index + 1}`,
    requires: mode !== 'overview' && index ? [manyIds[index - 1]] : [] })),
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
const beforeLastGoal = new Set([...visibleGoalIds].filter(id => id !== manyIds.at(-1)))
const mastered = new Set(['force-001'])

function Fixture() {
  const [selected, setSelected] = useState(mode === 'math-assessments' ? mathTasks[10]
    : mode === 'nested-single-assessment' ? 'single-motion-assessment' : physicsBoard ? 'force-003' : 'atoms')
  const [allLoaded, setAllLoaded] = useState(!query.has('hydrate'))
  const [returned, setReturned] = useState(false)
  return <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100vh' }}>
    <div style={{ minHeight: 0, position: 'relative' }}>
      <LearnerGoalNavigationMap rootGoals={rootGoals} goalIndexAll={goalIndexAll} visibleGoalIds={allLoaded ? visibleGoalIds : beforeLastGoal}
        visibleChildrenByParent={visibleChildrenByParent} selectedGoalId={selected} activeGoalId="force-002"
        getMastery={id => mastered.has(id) ? 1 : 0} completionWaivers={new Map()} onSelectGoal={setSelected}
        active language="de" onReturnToTree={() => setReturned(true)} />
    </div>
    <footer style={{ padding: 8 }}>
      <output data-testid="unit-map-selected">{selected}</output>
      <output data-testid="unit-map-returned">{returned ? 'returned' : ''}</output>
      {!allLoaded && <button type="button" onClick={() => setAllLoaded(true)}>Load last goal</button>}
    </footer>
  </div>
}

createRoot(document.getElementById('root')!).render(<Fixture />)
