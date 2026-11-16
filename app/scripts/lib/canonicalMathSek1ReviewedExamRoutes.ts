import type { CompiledCompositionPreviewNode, CompositionView, CompositionViewFinding, CompositionViewNode } from '../../src/utils/authoring/compositionViewAuthoring'
import type { CanonicalAuthoringLandscape } from '../../src/utils/authoring/canonicalAuthoring'

/** A reviewed subtree may be materialized to retain only the tasks that belong
 * in this scope. Its explicit source identity, a visible nonempty structure
 * and an actual task from the source collection are all required. Labels and
 * generated identifier spelling never establish this authoring relationship.
 * The caller must still check every independently applicable task endpoint. */
export const hasVisibleMaterializedAssessmentCollection = (
  view: CompositionView,
  roots: CompiledCompositionPreviewNode[],
  sourceCollectionId: string,
  sourceTaskIds: ReadonlySet<string>,
): boolean => {
  const declaredIds: string[] = []
  const inspect = (node: CompositionViewNode): void => {
    if (node.kind !== 'structure') return
    if (node.canonicalSourceGoalId === sourceCollectionId) declaredIds.push(node.id)
    node.children.forEach(inspect)
  }
  view.rootNodes.forEach(inspect)
  if (declaredIds.length !== 1 || sourceTaskIds.size === 0) return false
  const matches: CompiledCompositionPreviewNode[] = []
  const visit = (node: CompiledCompositionPreviewNode): void => {
    if (node.kind === 'structure' && node.runtimeId === `structure:${declaredIds[0]}`) matches.push(node)
    node.children.forEach(visit)
  }
  roots.forEach(visit)
  if (matches.length !== 1) return false
  const descendants = [...matches[0].children]
  while (descendants.length > 0) {
    const node = descendants.pop()!
    if (node.sourceGoalId && sourceTaskIds.has(node.sourceGoalId)) return true
    descendants.push(...node.children)
  }
  return false
}

export const collectCanonicalMathSek1AssessmentCollectionFindings = (
  view: CompositionView,
  landscape: CanonicalAuthoringLandscape,
  roots: CompiledCompositionPreviewNode[],
  foldersByYear: Readonly<Record<string, string>>,
): CompositionViewFinding[] => {
  const byId = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const visible = new Set<string>()
  const visit = (node: CompiledCompositionPreviewNode): void => {
    if (node.sourceGoalId) visible.add(node.sourceGoalId)
    node.children.forEach(visit)
  }
  roots.forEach(visit)
  const curricularAtoms = new Set(landscape.goals.filter((goal) => goal.semanticKind === 'curricularAtomic').map((goal) => goal.id))
  const findings: CompositionViewFinding[] = []
  for (const [year, folderId] of Object.entries(foldersByYear)) {
    const folder = byId.get(folderId)
    if (!folder || (!visible.has(folderId) && !hasVisibleMaterializedAssessmentCollection(
      view, roots, folderId, new Set(folder.contains),
    ))) {
      findings.push({ code: 'CPV-211', severity: 'error', goalId: folderId,
        message: `Sek-I-Route ist learner-facing nicht vollständig: Prüfungsordner für Jahrgangsstufe ${year} fehlt in der Composition View.` })
      continue
    }
    const missingTasks = folder.contains.filter((id) => !visible.has(id))
      .filter((id) => !isAssessmentExplicitlyOutsideJurisdiction(byId.get(id), view.scope.jurisdiction))
      .filter((id) => !hasUnavailableCurricularAtomicAssessmentPrerequisite(byId.get(id), curricularAtoms, visible))
    if (missingTasks.length > 0) {
      findings.push({ code: 'CPV-211', severity: 'error', goalId: folderId,
        message: `Sek-I-Route ist learner-facing nicht vollständig: ${missingTasks.length} Aufgabenknoten unter Prüfungen Jahrgangsstufe ${year} fehlen in der Composition View.` })
    }
  }
  return findings
}

/** Only a nonempty, explicit jurisdiction list can waive another land's exam.
 * Missing scope, missing tasks and malformed applicability remain required. */
export const isAssessmentExplicitlyOutsideJurisdiction = (
  assessment: Record<string, unknown> | undefined,
  jurisdiction: string | undefined,
): boolean => {
  if (!jurisdiction) return false
  const applicability = assessment?.applicability
  if (!applicability || typeof applicability !== 'object' || Array.isArray(applicability)) return false
  const jurisdictions = (applicability as Record<string, unknown>).jurisdiction
  return Array.isArray(jurisdictions)
    && jurisdictions.length > 0
    && jurisdictions.every((value) => typeof value === 'string' && value.trim() !== '')
    && !jurisdictions.includes(jurisdiction)
}

export const hasUnavailableCurricularAtomicAssessmentPrerequisite = (
  assessment: { requires?: string[]; extendedData?: Record<string, unknown> } | undefined,
  curricularAtomicGoalIds: ReadonlySet<string>,
  targetGoalIds: ReadonlySet<string>,
): boolean => assessment?.extendedData?.applicabilityFromRequires === true
  && (assessment.requires ?? []).some((requiredId) => (
    curricularAtomicGoalIds.has(requiredId) && !targetGoalIds.has(requiredId)
  ))

/** A support-only exam is intentionally outside this learner target. An exam
 * absent from the view altogether remains required unless CPV-211's exact
 * prerequisite rule proves that it cannot apply in this target projection. */
export const shouldRequireCanonicalMathSek1AssessmentEndpoint = (
  assessment: { id: string; requires?: string[]; extendedData?: Record<string, unknown> },
  curricularAtomicGoalIds: ReadonlySet<string>,
  visibleGoalIds: ReadonlySet<string>,
  targetGoalIds: ReadonlySet<string>,
): boolean => targetGoalIds.has(assessment.id)
  || (!visibleGoalIds.has(assessment.id)
    && !hasUnavailableCurricularAtomicAssessmentPrerequisite(
      assessment,
      curricularAtomicGoalIds,
      targetGoalIds,
    ))

interface ReviewedExamRoute {
  year: string
  yearAnchorId: string
  examFolderId: string
  taskId: string
  prerequisiteId: string
}

const REVIEWED_EXAM_ROUTES: readonly ReviewedExamRoute[] = [
  {
    year: '7',
    yearAnchorId: '5a7095a2-2b3a-48bf-9536-eca79ee5ff8c',
    examFolderId: '811d6d09-130e-47b2-aba8-a5c401fe3251',
    taskId: 'a157b619-e875-5db6-b26a-607a39de00dc',
    prerequisiteId: '7dea79d2-67f2-4d92-b6cc-ad1b953dca3d',
  },
  {
    year: '7',
    yearAnchorId: '5a7095a2-2b3a-48bf-9536-eca79ee5ff8c',
    examFolderId: '811d6d09-130e-47b2-aba8-a5c401fe3251',
    taskId: 'bb736def-061a-5371-b5c9-cc695f85cd3a',
    prerequisiteId: 'bd8fd6d5-7155-45a5-96f0-008a4e9acb3a',
  },
]

const collectDescendantGoalIds = (
  goalById: Map<string, CanonicalAuthoringLandscape['goals'][number]>,
  rootId: string,
): Set<string> => {
  const descendants = new Set<string>()
  const pending = [rootId]

  while (pending.length > 0) {
    const goalId = pending.pop()
    if (!goalId || descendants.has(goalId)) continue
    descendants.add(goalId)
    pending.push(...(goalById.get(goalId)?.contains ?? []))
  }

  return descendants
}

export const collectCanonicalMathSek1ReviewedExamRouteFindings = (
  landscape: CanonicalAuthoringLandscape,
): CompositionViewFinding[] => {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const findings: CompositionViewFinding[] = []

  REVIEWED_EXAM_ROUTES.forEach((route) => {
    const yearAnchor = goalById.get(route.yearAnchorId)
    const examFolder = goalById.get(route.examFolderId)
    const task = goalById.get(route.taskId)
    const prerequisite = goalById.get(route.prerequisiteId)

    if (!yearAnchor || !examFolder || !task || !prerequisite) {
      findings.push({
        code: 'CPV-218',
        severity: 'error',
        goalId: route.taskId,
        message: `Freigegebene J${route.year}-Prüfungsroute ist unvollständig: ${route.taskId} -> ${route.prerequisiteId}.`,
      })
      return
    }

    if (!examFolder.contains.includes(route.taskId)) {
      findings.push({
        code: 'CPV-218',
        severity: 'error',
        goalId: route.taskId,
        message: `Freigegebene J${route.year}-Prüfungsaufgabe ${route.taskId} liegt nicht im erwarteten Prüfungsordner.`,
      })
    }

    if (!task.requires.includes(route.prerequisiteId)) {
      findings.push({
        code: 'CPV-218',
        severity: 'error',
        goalId: route.taskId,
        message: `Freigegebene J${route.year}-Prüfungsaufgabe ${route.taskId} referenziert ihr geprüftes prerequisite ${route.prerequisiteId} nicht mehr.`,
      })
    }

    if (!collectDescendantGoalIds(goalById, route.yearAnchorId).has(route.prerequisiteId)) {
      findings.push({
        code: 'CPV-218',
        severity: 'error',
        goalId: route.prerequisiteId,
        message: `Prerequisite ${route.prerequisiteId} der freigegebenen J${route.year}-Prüfungsaufgabe ${route.taskId} fehlt im kanonischen Jahrgangsbaum.`,
      })
    }
  })

  return findings
}
