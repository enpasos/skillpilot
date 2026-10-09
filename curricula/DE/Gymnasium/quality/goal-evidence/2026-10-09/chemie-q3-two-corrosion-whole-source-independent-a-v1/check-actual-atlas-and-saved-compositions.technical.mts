// SPDX-License-Identifier: Apache-2.0
// Independent technical binding check. Does not change source, atlas, or views.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { checkGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const repo = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-two-corrosion-whole-source-independent-a-v1'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-four-bounded-source-current-author-20261008-v1'
const ids = ['0908b3a2-9937-57de-8bfb-35a6de54aa1f', '94a62b39-d4a2-5882-99d1-6886ead07726']
const bindings: { path: string, sha256: string, bytes: number }[] = []
const read = (path: string) => {
  const data = readFileSync(resolve(repo, path))
  bindings.push({ path, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length })
  return JSON.parse(data.toString('utf8'))
}
const raw = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const landscape = normalizeCanonicalLandscape(raw)
const byId = new Map(landscape.goals.map(g => [g.id, g]))
const selected = read(`${own}/actual38-whole-current-partner-goals.neutral.json`)
assert.equal(selected.length, 38)
for (const old of selected) assert.deepEqual(raw.goals.find((g: { id: string }) => g.id === old.id), old)

const viewPaths = [
  ...Array.from({ length: 7 }, (_, i) => `${author}/memory/current-view-${String(i).padStart(2, '0')}.exact.json`),
  `${author}/native/full378-current-existing-review.view.exact.json`,
]
const actualSavedViewProjections = viewPaths.map(path => {
  const view = normalizeCompositionView(read(path))
  const compiled = compileCompositionView(view, landscape)
  assert.deepEqual(compiled.findings.filter(f => f.severity === 'error'), [])
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  return {
    path, viewId: view.viewId, scope: view.scope,
    targetGoalIds: [...roles.targetGoalIds].sort(),
    prerequisiteOnlyGoalIds: [...roles.prerequisiteOnlyGoalIds].sort(),
    twoGoalRoles: ids.map(goalId => ({ goalId,
      target: roles.targetGoalIds.has(goalId),
      prerequisiteOnly: roles.prerequisiteOnlyGoalIds.has(goalId),
    })), findings: compiled.findings,
    claim: 'actual saved authored composition only; does not prove a missing regional operative route',
  }
})

const atlasConfig = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
read(atlasConfig)
const { receipt } = checkGoalBookSourceAtlasInputs(atlasConfig, repo)
const actualAtlasTwoGoalScopeWitnesses = receipt.scopes
  .filter(s => s.goalIds.some(id => ids.includes(id)))
  .map(s => ({
    key: s.key, path: s.path, viewId: s.viewId, jurisdiction: s.jurisdiction,
    stage: s.stage, courseProfile: s.courseProfile,
    twoGoalIds: s.goalIds.filter(id => ids.includes(id)),
    actualTwoGoalWitnesses: s.witnesses.filter(w => ids.includes(w.goalId)),
  }))

const result = {
  schemaVersion: 1, codeLicense: 'Apache-2.0', evidenceLicense: 'CC-BY-4.0',
  status: 'PASS_actual_normal_technical_binding_checks_only', goalIds: ids,
  actualCurrentCanonicalGoalCount: raw.goals.length,
  all38WholeOriginalPartnerBodiesExactCurrent: true,
  normalAtlasCounts: receipt.counts,
  normalAtlasClaims: receipt.claims,
  normalAtlasInputBindings: receipt.inputBindings,
  actualAtlasTwoGoalScopeWitnesses,
  actualSavedViewProjections, ownInputBindings: bindings,
  scientificFindingsRemainOpen: [
    'COR-A-SOURCE-001', 'COR-A-SOURCE-002', 'COR-A-SOURCE-003',
    'COR-A-SOURCE-004', 'COR-A-BINDING-005',
  ],
  bookLocalAtlasIsCompleteOperativeLearnerRoute: false,
  technicalChecksAreIndependentSourceApproval: false,
  newSourceScienceApprovalCount: 0, newStrictClosures: 0,
  restoredBindings: 0, activeWrites: 0, humanApproval: false, humanTrial: false,
}
const destination = resolve(repo, own, 'actual-atlas-and-eight-saved-compositions.technical-result.json')
const bytes = `${JSON.stringify(result, null, 2)}\n`
JSON.parse(bytes)
writeFileSync(`${destination}.writing`, bytes)
renameSync(`${destination}.writing`, destination)
console.log(JSON.stringify({ status: result.status, canonicalGoals: raw.goals.length,
  wholePartnersExact: selected.length, savedCompositions: actualSavedViewProjections.length,
  atlasScopesWithTwoGoals: actualAtlasTwoGoalScopeWitnesses.length,
  atlas: receipt.counts, newStrictClosures: 0 }))
