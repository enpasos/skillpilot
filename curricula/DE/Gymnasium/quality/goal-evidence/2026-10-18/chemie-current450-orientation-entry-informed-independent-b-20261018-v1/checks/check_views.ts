// SPDX-License-Identifier: Apache-2.0
// Pure finite projection facts; no content decisions, native review or normal writes.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView } from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../../../../../../../')
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18'
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const pin = (path: string) => ({ path, sha256: createHash('sha256').update(readFileSync(resolve(root, path))).digest('hex') })
const graphPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const canonical = read(graphPath)
const proposal = read(`${base}/chemie-current450-twenty-seven-orientation-entry-author-20261018-v1/AUTHOR.27-orientation-entry-requires-only.pending.json`)
const language = read(`${base}/chemie-current450-orientation-anchor-language-author-20261018-v2/AUTHOR.whole-orientation-before-and-candidate.pending.json`)
const proposed = structuredClone(canonical)
const replacements = new Map(proposal.records.map((r: any) => [r.goalId, r.proposedWholeGoal]))
replacements.set(language.goalId, language.candidate)
proposed.goals = proposed.goals.map((g: any) => replacements.get(g.id) ?? g)
const dir = 'curricula/DE/Gymnasium/composition-views/chemie'
const paths = readdirSync(resolve(root, dir)).filter(p => p.endsWith('.view.json')).map(p => `${dir}/${p}`)
const collect = (g: any, v: any) => collectCompositionProjectionRoleGoalIds(v.rootNodes, new Map(g.goals.map((x: any) => [x.id, x])), new Map([[g.landscapeId, g.goals[0].id]]))
const same = (a: Set<string>, b: Set<string>) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
const views = paths.map(path => {
  const view = read(path), current = collect(canonical, view), candidate = collect(proposed, view)
  return { ...pin(path), scope: view.scope, current, candidate,
    targetIdsUnchanged: same(current.targetGoalIds, candidate.targetGoalIds),
    prerequisiteOnlyIdsUnchanged: same(current.prerequisiteOnlyGoalIds, candidate.prerequisiteOnlyGoalIds),
    beforeErrors: compileCompositionView(view, canonical).findings.filter(f => f.severity === 'error'),
    afterErrors: compileCompositionView(view, proposed).findings.filter(f => f.severity === 'error') }
})
const rows = proposal.records.map((r: any) => ({ goalId: r.goalId,
  targetViews: views.filter(v => v.current.targetGoalIds.has(r.goalId)).map(v => v.path),
  targetViewsWithAnchorTarget: views.filter(v => v.current.targetGoalIds.has(r.goalId) && v.current.targetGoalIds.has(language.goalId)).map(v => v.path),
  targetViewsWithAnchorOnlyPrerequisite: views.filter(v => v.current.targetGoalIds.has(r.goalId) && v.current.prerequisiteOnlyGoalIds.has(language.goalId)).map(v => v.path),
  targetViewsWithoutAnchor: views.filter(v => v.current.targetGoalIds.has(r.goalId) && !v.current.targetGoalIds.has(language.goalId) && !v.current.prerequisiteOnlyGoalIds.has(language.goalId)).map(v => v.path),
}))
const result = { artifactRole: 'PURE_COMPOSITION_INTERFACE_FACTS_NO_SCIENTIFIC_VERDICT', graph: pin(graphPath),
  anchorGoalId: language.goalId, viewCount: views.length, rows,
  views: views.map(({ current, candidate, ...other }) => other), normalWrites: 0 }
writeFileSync(resolve(here, 'CHECK.current-and-proposed-view-interfaces.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ viewCount: views.length,
  beforeErrorCount: views.reduce((n, v) => n + v.beforeErrors.length, 0), afterErrorCount: views.reduce((n, v) => n + v.afterErrors.length, 0),
  targetSetsUnchanged: views.every(v => v.targetIdsUnchanged), prerequisiteOnlySetsUnchanged: views.every(v => v.prerequisiteOnlyIdsUnchanged),
  ordinaryTargetViewsMissingAnchor: rows.filter((r: any) => r.targetViewsWithoutAnchor.length),
  ordinaryGoalsNotCurrentlyTargeted: rows.filter((r: any) => !r.targetViews.length).map((r: any) => r.goalId) }, null, 2))
