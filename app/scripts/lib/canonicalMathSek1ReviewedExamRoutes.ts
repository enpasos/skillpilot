import type { CompositionViewFinding } from '../../src/utils/authoring/compositionViewAuthoring'
import type { CanonicalAuthoringLandscape } from '../../src/utils/authoring/canonicalAuthoring'

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
