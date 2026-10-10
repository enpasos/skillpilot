// SPDX-License-Identifier: Apache-2.0
// Read actual frozen candidates with ordinary production composition APIs.
import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {resolve, dirname, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters.ts'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const author = resolve(own, '../chemie-q3-three-BW-practical-terminal-route-author-candidate-v1')
const read = (path: string): any => JSON.parse(readFileSync(path, 'utf8'))
const before = read(resolve(author, 'inputs/whole484-active-canonical.exact.json'))
const after = read(resolve(author, 'candidate/whole487-381-plus-three-practical-terminals.inactive.json'))
const binding = read(resolve(author, 'inputs/actual-start-bindings.json'))
const kinds = read(resolve(author, 'candidate/whole487-381.semantic-kinds.inactive.json'))
const cur = new Set<string>(kinds.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId))
const bg = new Map<string, any>(before.goals.map((g: any) => [g.id, g]))
const ag = new Map<string, any>(after.goals.map((g: any) => [g.id, g]))
const bCanonical = normalizeCanonicalLandscape(before)
const aCanonical = normalizeCanonicalLandscape(after)
const normalAPIs = ['compileCompositionView', 'collectCompositionProjectionRoleGoalIds', 'goalMatchesFilters']
const actualBWViews = []
for (const course of ['gk', 'lk']) {
  const bv = normalizeCompositionView(read(resolve(author, `views/original-de-bw-${course}.view.exact.json`)))
  const av = normalizeCompositionView(read(resolve(author, `views/candidate-de-bw-${course}.view.inactive.json`)))
  const b = compileCompositionView(bv, bCanonical), a = compileCompositionView(av, aCanonical)
  assert.equal(a.findings.filter(f => f.severity === 'error').length, 0)
  assert.equal(a.findings.length, b.findings.length)
  const bs = collectCompositionProjectionRoleGoalIds(bv.rootNodes, bg).targetGoalIds
  const as = collectCompositionProjectionRoleGoalIds(av.rootNodes, ag).targetGoalIds
  const added = [...as].filter(i => !bs.has(i))
  assert.deepEqual(new Set(added), new Set(course === 'gk' ? binding.assessmentGoalIds.slice(0, 1) : binding.assessmentGoalIds))
  assert.deepEqual([...bs].filter(i => !as.has(i)), [])
  for (const i of added) {
    const g = ag.get(i)
    assert.ok(goalMatchesFilters(g, ['DE-BW', course.toUpperCase(), 'SekII']))
    for (const filter of ['DE-HE', 'DE-BY', 'SekI']) assert.ok(!goalMatchesFilters(g, [filter]))
  }
  actualBWViews.push({courseProfile: course.toUpperCase(), originalTargets: bs.size, candidateTargets: as.size,
    addedAssessmentGoalIds: added, removedTargetGoalIds: [], normalFindings: a.findings})
}
const manifestPath = 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json'
const manifest = read(resolve(root, manifestPath))
const actualSourceViews = manifest.sourcePaths.map((path: string) => {
  const v = normalizeCompositionView(read(resolve(root, path)))
  const b = compileCompositionView(v, bCanonical), a = compileCompositionView(v, aCanonical)
  assert.equal(b.findings.filter(f => f.severity === 'error').length, 0)
  assert.equal(a.findings.filter(f => f.severity === 'error').length, 0)
  const bs = [...collectCompositionProjectionRoleGoalIds(v.rootNodes, bg).targetGoalIds].filter(i => cur.has(i)).sort()
  const as = [...collectCompositionProjectionRoleGoalIds(v.rootNodes, ag).targetGoalIds].filter(i => cur.has(i)).sort()
  assert.deepEqual(as, bs)
  return {sourceViewPath: path, scope: v.scope, currentWholeOrdinaryTargetIds: as,
    beforeAndCandidateOrdinaryTargetIdsExact: true}
})
assert.equal(actualSourceViews.length, 48)
const union = new Set<string>(actualSourceViews.flatMap((v: any) => v.currentWholeOrdinaryTargetIds))
assert.equal(union.size, 362)
writeFileSync(resolve(own, 'normal-scoped-composition-and-source-views.independent.actual.json'), JSON.stringify({
  schemaVersion: 1, checkedAt: new Date().toISOString(), normalAPIs, productionSelectorsOrThresholdsChanged: false,
  frozenAuthorPackage: relative(root, author), actualBWViews, sourceManifestPath: manifestPath,
  sourceViewCount: 48, wholeOrdinaryTargetUnion: 362, actualSourceViews,
  assessmentRequiresNotSourceCoverage: true, sourceCourseOrProgrammeApproval: false,
  wholeM7OrFloorPassClaimed: false, activeWrites: 0,
}, null, 2) + '\n')
console.log(JSON.stringify({normalComposition: 'PASS', BW: {GK: 1, LK: 3, SekI: 0, HE: 0, BY: 0}, sourceViews: 48,
  ordinarySourceTargetUnion: 362, oldOrdinarySetsExact: true, activeWrites: 0}))
