import type { PhysicsPlacementNode, PhysicsPlacementView } from './physicsViewPlacementTypes'

// Reviewed authoring placements for HE upper secondary, not runtime inference.
// Keep existing structure IDs: stored focus/plan references may address them.
const destinations = {
  'physics-b034-transistor': 'b034-preserved-rootNodes-0-children-13-children-6',
  'physics-b034-stars': 'b034-preserved-rootNodes-0-children-13-children-7',
  'physics-b034-nuclear': 'b034-preserved-rootNodes-0-children-13-children-3',
  'physics-b034-assessments': 'physics-q4',
  'physics-final-diode-sekii': 'b034-preserved-rootNodes-0-children-13-children-6',
}
const diodeTasks = new Set([
  'c61b2a69-b5cd-5785-bb04-5d6bca53b218',
  '4ac5a07c-fff0-5eae-890d-89e13eaf69c3',
  '18fb1470-5a03-5277-9486-ae74c63c8a8c',
])
const existingQ4Practice = new Set([
  '85bbad98-2f48-5d64-85c4-ab6cf67f24c2',
  'b34f3e03-bbe7-5ede-941c-3f26c9b07bb8',
  '2874902d-eccd-513e-ab60-98892497911d',
  'c518e9dc-8514-5fde-9811-19caa85cfb1a',
  'c77d28e5-a03e-5518-8c3a-55e9e9a2cea3',
  '04832ee1-648a-5421-a01d-0a15c3536c5f',
  '71af215d-c6d5-59ce-a3f6-4a2e60f1216d',
])
const examLabels: Record<string, string> = {
  '61684ca7-b725-534f-944b-c7645cea1792': 'Abiturprüfung Physik (GK)',
  '79028c45-90ae-57eb-8016-f5a96af18fa2': 'Abiturprüfung Physik (LK)',
}

export function repairHessePhysicsTree<T extends PhysicsPlacementView>(view: T): T {
  if (view.scope.jurisdiction !== 'DE-HE' || view.scope.stage !== 'SekII') return view
  const profile = view.scope.courseProfile
  if (profile !== 'GK' && profile !== 'LK') {
    throw new Error('HE Physics authoring requires separate GK and LK views')
  }
  type Location = { node: PhysicsPlacementNode; siblings: PhysicsPlacementNode[] }
  const find = (id: string): Location | undefined => {
    const matches: Location[] = []
    const walk = (nodes: PhysicsPlacementNode[]) => nodes.forEach(node => {
      if (node.kind === 'structure' && node.id === id) matches.push({ node, siblings: nodes })
      if (node.children) walk(node.children)
    })
    walk(view.rootNodes)
    if (matches.length > 1) throw new Error(`Duplicate HE Physics structure: ${id}`)
    return matches[0]
  }
  const requireStructure = (id: string) => {
    const found = find(id)
    if (!found?.node.children) throw new Error(`Missing reviewed HE Physics structure: ${id}`)
    return found.node as PhysicsPlacementNode & { children: PhysicsPlacementNode[] }
  }
  const stage = requireStructure('physics-root')
  stage.label = `Sekundarstufe II (${profile})`
  // The established GK/LK merger combines German labels but requires other
  // metadata to match exactly; keep the English stage label profile-neutral.
  stage.labelEn = 'Upper Secondary'
  for (const [id, destinationId] of Object.entries(destinations)) {
    const found = find(id)
    if (!found) continue // A generation step may precede a later supplement.
    const destination = requireStructure(destinationId)
    if (found.siblings === destination.children) continue
    found.siblings.splice(found.siblings.indexOf(found.node), 1)
    destination.children.push(found.node)
  }
  const diode = find('physics-final-diode-sekii')?.node
  if (diode) {
    diode.label = 'Dioden'
    diode.labelEn = 'Diodes'
  }
  const exercises = find('physics-b034-assessments')?.node
  if (exercises?.children) {
    exercises.label = 'Übungen Q4'
    exercises.labelEn = 'Q4 Practice'
    const q4 = requireStructure('physics-q4')
    const practice = q4.children.filter(node => existingQ4Practice.has(node.goalId ?? ''))
    q4.children = q4.children.filter(node => !existingQ4Practice.has(node.goalId ?? ''))
    exercises.children.unshift(...practice)
    if (diode?.children) {
      exercises.children.push(...diode.children.filter(node => diodeTasks.has(node.goalId ?? '')))
      diode.children = diode.children.filter(node => !diodeTasks.has(node.goalId ?? ''))
    }
  } else if (diode?.children?.some(node => diodeTasks.has(node.goalId ?? ''))) {
    throw new Error('Missing reviewed HE Physics Q4 exercise destination')
  }
  const labelExams = (nodes: PhysicsPlacementNode[]) => nodes.forEach(node => {
    if (node.goalId && examLabels[node.goalId]) node.displayLabel = examLabels[node.goalId]
    if (node.goalId === '85bbad98-2f48-5d64-85c4-ab6cf67f24c2') {
      node.displayLabel = 'Übergreifende Übungen Q4'
    }
    if (node.children) labelExams(node.children)
  })
  labelExams(view.rootNodes)
  return view
}
