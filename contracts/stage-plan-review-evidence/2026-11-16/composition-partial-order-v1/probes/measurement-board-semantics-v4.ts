// Read-only audit semantics. This module does not participate in product layout.
export const isExactSourceExaminationCollection = (
  source: { compositionViewId: string | null; compositionNodeId: string | null },
  views: any[],
  expected: ReadonlySet<string>,
  canonical: ReadonlyMap<string, any>,
): boolean => {
  if (!source.compositionViewId || !source.compositionNodeId || expected.size === 0) return false
  const matchingViews = views.filter(view => view.viewId === source.compositionViewId)
  if (matchingViews.length !== 1) return false
  const matches: any[] = []
  const visit = (node: any) => {
    if (node.kind !== 'structure') return
    if (node.id === source.compositionNodeId) matches.push(node)
    node.children.forEach(visit)
  }
  matchingViews[0].rootNodes.forEach(visit)
  if (matches.length !== 1) return false
  const atoms = new Set<string>(), expanding = new Set<string>()
  let valid = true
  const expand = (id: string) => {
    const goal = canonical.get(id)
    if (!goal || expanding.has(id)) { valid = false; return }
    if (goal.contains.length) {
      expanding.add(id); goal.contains.forEach(expand); expanding.delete(id)
    } else if (goal.type !== 'cluster' && (goal.nodeKind === 'exam' || goal.examData)) atoms.add(id)
    else valid = false
  }
  const collect = (node: any) => {
    // A scope exclusion cannot prove a visible assessment collection.
    if (node.projectionRole === 'prerequisiteOnly') { valid = false; return }
    if (node.kind === 'structure') node.children.forEach(collect)
    else if (node.kind === 'canonicalSubtree') expand(node.goalId)
    else if (node.kind === 'goalEntry') {
      const goal = canonical.get(node.goalId)
      if (!goal || goal.type === 'cluster' || goal.contains.length || !(goal.nodeKind === 'exam' || goal.examData)) valid = false
      else atoms.add(node.goalId)
    }
    else valid = false
  }
  collect(matches[0])
  return valid && atoms.size === expected.size && [...atoms].every(id => expected.has(id))
}

export const isCanonicalPhysicsThematicBoard = (
  context: any, view: any, subject: string, stage: string, level: number,
  physicsId: string,
  binding: { unitEntryVerified: boolean; stageSourceCompositionNodeId: string | null;
    sourceUnitNodes: Array<{ subjectId: string; compositionViewId: string | null; compositionNodeId: string | null }> },
): boolean => {
  if (!(subject === physicsId && stage === 'sek1' && level === 1
    && context.authorization === 'national-canonical-no-Land-plan-or-duration-claim'
    && !context.scope.jurisdiction && !context.scope.durationModel
    && view.landscapeId === physicsId && view.scope.schoolForm === 'Gymnasium'
    && !view.scope.jurisdiction && !view.scope.durationModel
    && binding.unitEntryVerified && binding.stageSourceCompositionNodeId === 'physics-seki'
    && binding.sourceUnitNodes.length === 1)) return false
  const canonicalViewIds = new Set(['de-de-gym-physics-gk', 'de-de-gym-physics-lk',
    'de-de-gym-sekii-physics-gk', 'de-de-gym-sekii-physics-lk', 'de-de-gym-seki-physics'])
  const ids = view.viewId.startsWith('merged:') ? view.viewId.slice(7).split('+') : [view.viewId]
  if (!ids.every((id: string) => canonicalViewIds.has(id)) || ids.length > 2
    || (ids.length === 2 && (ids[0] === ids[1] || ids[0].replace(/-(gk|lk)$/, '') !== ids[1].replace(/-(gk|lk)$/, '')))) return false
  const source = binding.sourceUnitNodes[0]
  if (source.subjectId !== physicsId || source.compositionViewId !== view.viewId || !source.compositionNodeId) return false
  const stageNodes: any[] = [], sourceNodes: any[] = []
  const visit = (node: any) => {
    if (node.kind !== 'structure') return
    if (node.id === 'physics-seki') stageNodes.push(node)
    if (node.id === source.compositionNodeId) sourceNodes.push(node)
    node.children.forEach(visit)
  }
  view.rootNodes.forEach(visit)
  return stageNodes.length === 1 && sourceNodes.length === 1
    && stageNodes[0].children.includes(sourceNodes[0])
}
