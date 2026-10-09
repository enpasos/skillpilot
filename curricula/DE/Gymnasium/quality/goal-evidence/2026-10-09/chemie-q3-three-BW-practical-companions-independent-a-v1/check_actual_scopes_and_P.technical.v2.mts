// SPDX-License-Identifier: Apache-2.0
// Checks actual inactive inputs using the existing ordinary APIs; no active writes.
import { readFileSync, writeFileSync } from 'node:fs'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const author = base + 'chemie-q3-three-BW-context-bound-practical-companions-author-v1/'
const own = base + 'chemie-q3-three-BW-practical-companions-independent-a-v1/'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const entry = read(author + 'neutral-three-whole-BW-context-practical-companions.independent-review.entry.json')
const current = normalizeCanonicalLandscape(read(author + 'inputs/canonical.exact.json'))
const candidate = normalizeCanonicalLandscape(read(author + 'candidate/full484-381.inactive-canonical.json'))
const ids = read(author + 'candidate/three-new-whole-DEEN-practical-goals.json').map((g: { id: string }) => g.id)
const results: unknown[] = []
for (const kind of ['source', 'learner']) {
  for (const course of ['GK', 'LK']) {
    const afterPath = entry.actualViewPaths[kind === 'source' ? 'BW' + course : 'learner' + course]
    const oldPath = kind === 'learner' ? author + `inputs/BW-${course.toLowerCase()}.learner-view.exact.json` :
      author + `source-atlas/before-exact-output-archive/app/scripts/config/goal-books/chemie-q3-BW-source3-inactive-before/source-views/chemie-q3-BW-source3-inactive-before-source-de-bw-sekii-${course.toLowerCase()}.view.json`
    const beforeView = normalizeCompositionView(read(oldPath))
    const afterView = normalizeCompositionView(read(afterPath))
    const before = compileCompositionView(beforeView, current)
    const after = compileCompositionView(afterView, candidate)
    const beforeRoles = collectCompositionProjectionRoleGoalIds(beforeView.rootNodes, new Map(current.goals.map(g => [g.id, g])))
    const afterRoles = collectCompositionProjectionRoleGoalIds(afterView.rootNodes, new Map(candidate.goals.map(g => [g.id, g])))
    const addedTargets = [...afterRoles.targetGoalIds].filter(id => !beforeRoles.targetGoalIds.has(id)).sort()
    const removedTargets = [...beforeRoles.targetGoalIds].filter(id => !afterRoles.targetGoalIds.has(id)).sort()
    const expectedChildren = (course === 'GK' ? [ids[0]] : ids).sort()
    const existingMethodPartners = ['49b13b33-34b7-5e4e-861c-b21082cb9922', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61']
    const expected = [...expectedChildren, ...(kind === 'source' ? existingMethodPartners : [])].sort()
    const errors = [...before.findings, ...after.findings].filter(f => f.severity === 'error')
    if (errors.length || removedTargets.length || JSON.stringify(addedTargets) !== JSON.stringify(expected)) {
      throw new Error(JSON.stringify({ kind, course, errors, addedTargets, removedTargets, expected }))
    }
    results.push({ kind, course, oldPath, afterPath, actualScope: afterView.scope,
      beforeTargetCount: beforeRoles.targetGoalIds.size, afterTargetCount: afterRoles.targetGoalIds.size,
      addedTargets, addedNewPracticalChildren: addedTargets.filter(id => ids.includes(id)),
      separatelyAddedExistingMethodPartners: addedTargets.filter(id => !ids.includes(id)), removedTargets, ordinaryCompilerErrors: errors, ordinaryCompilerFindings: after.findings })
  }
}
const p = reviewPositiveGoalEvidenceConfig(own + 'positive/three-whole-practical.independent-a.config.json')
if (p.errors.length || p.records.length !== 3 || p.counts.needsHumanReview !== 3 || p.counts.approved !== 0) throw new Error(JSON.stringify(p.errors))
const profiles = p.records.map(r => ({ goalId: r.goalId, status: r.status, reviewAuthority: r.reviewAuthority,
  evidenceLevel: r.evidenceLevel, maximumClaimScope: r.maximumClaimScope, goalFingerprint: r.goalFingerprint,
  profileFingerprint: r.profileFingerprint,
  actualGoalVisualizationLinks: candidate.goals.find(g => g.id === r.goalId)?.resourceLinks?.filter(link => link.type === 'goal-visualization').length ?? 0 }))
writeFileSync(own + 'checks/actual-source-and-learner-GK1-LK3-and-normal-P3.independent-a.v2.json',
  JSON.stringify({ schemaVersion: 1, actualScopes: results, positiveCounts: p.counts, positiveErrors: p.errors,
    wholeCurrentPositiveProfiles: profiles, activeWrites: 0, nativeOrVisualApproval: false,
    sourceExactEdgeFinding: 'CHEM3-A-SOURCE-002 remains independent of a successful composition compile' }, null, 2) + '\n')
console.log(JSON.stringify({ actualScopes: results, positiveCounts: p.counts, positiveErrors: p.errors }, null, 2))
