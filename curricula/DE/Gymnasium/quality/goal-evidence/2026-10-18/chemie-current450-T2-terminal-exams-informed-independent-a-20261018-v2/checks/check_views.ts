// SPDX-License-Identifier: Apache-2.0
// Pure finite projection facts; no review votes or normal-file writes.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../../')
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T2-terminal-exams-author-20261018-v4'
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const pin = (path: string) => ({ path, sha256: createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex') })
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const canonical = read(canonicalPath)
const newGoals = read(`${author}/AUTHOR.new-goals.full.draft.json`).newGoals
const interfaces = read(`${author}/AUTHOR.exam-interfaces-and-scope.json`).interfaces
const placements = read(`${author}/AUTHOR.sparse-contains-placement.proposals.json`).containsPlacements
const draft = structuredClone(canonical)
draft.goals.push(...newGoals)
const draftById = new Map(draft.goals.map((g: any) => [g.id, g]))
for (const row of placements) {
  const parent: any = draftById.get(row.parentGoalId)
  parent.contains = [...new Set([...(parent.contains ?? []), ...row.appendContainsGoalIds])]
}
const dir = 'curricula/DE/Gymnasium/composition-views/chemie'
const paths = readdirSync(resolve(root, dir)).filter(p => p.endsWith('.view.json')).map(p => `${dir}/${p}`)
const collect = (landscape: any, view: any) => collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(landscape.goals.map((g: any) => [g.id, g])), new Map([[landscape.landscapeId, landscape.goals[0].id]]))
const views = paths.map(path => {
  const view = read(path)
  const current = collect(canonical, view)
  const proposed = collect(draft, view)
  const before = compileCompositionView(view, canonical).findings.filter(f => f.severity === 'error')
  const after = compileCompositionView(view, draft).findings.filter(f => f.severity === 'error')
  return { ...pin(path), scope: view.scope, current, proposed, beforeErrors: before, afterErrors: after }
})
const rows = newGoals.map((goal: any) => {
  const candidateInterface = interfaces.find((row: any) => row.endpointId === goal.id)
  const currentAllPrerequisiteTargetViews = views.filter(v => goal.requires.every((id: string) => v.current.targetGoalIds.has(id))).map(v => v.path)
  const proposedEndpointTargetViews = views.filter(v => v.proposed.targetGoalIds.has(goal.id)).map(v => v.path)
  const proposedEndpointWithoutAllRequiredTargets = views.filter(v => v.proposed.targetGoalIds.has(goal.id) && !goal.requires.every((id: string) => v.proposed.targetGoalIds.has(id))).map(v => v.path)
  return { endpointId: goal.id, requires: goal.requires, coveredGoalIds: goal.examData.coveredGoalIds,
    requiresEqualsCovered: JSON.stringify(goal.requires) === JSON.stringify(goal.examData.coveredGoalIds),
    requiresEqualsInterface: JSON.stringify(goal.requires) === JSON.stringify(candidateInterface.requiresExactly),
    currentAllPrerequisiteTargetViews, authorDeclaredTargetViews: candidateInterface.currentTargetViewsForAllEndGoals,
    declaredViewSetEqual: JSON.stringify([...currentAllPrerequisiteTargetViews].sort()) === JSON.stringify([...candidateInterface.currentTargetViewsForAllEndGoals].sort()),
    proposedEndpointTargetViews, proposedEndpointWithoutAllRequiredTargets,
    parentGoalIds: placements.filter((p: any) => p.appendContainsGoalIds.includes(goal.id)).map((p: any) => p.parentGoalId),
  }
})
const result = { artifactRole: 'PURE_VIEW_INTERFACE_FACTS_NO_CONTENT_VERDICT', canonical: pin(canonicalPath),
  viewCount: views.length, placements: rows,
  views: views.map(({ current, proposed, ...other }) => other),
}
writeFileSync(resolve(here, 'CHECK.current-and-proposed-view-interfaces.json'), JSON.stringify(result, null, 2) + '\n')
for (const row of rows) console.log(row.endpointId, 'current all-target', row.currentAllPrerequisiteTargetViews.length, 'declaredEqual', row.declaredViewSetEqual, 'proposed target', row.proposedEndpointTargetViews.length, 'missingRequiredTargets', row.proposedEndpointWithoutAllRequiredTargets.length)
console.log('views', views.length, 'before errors', views.reduce((n, v) => n + v.beforeErrors.length, 0), 'after errors', views.reduce((n, v) => n + v.afterErrors.length, 0))
