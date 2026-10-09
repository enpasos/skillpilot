// SPDX-License-Identifier: Apache-2.0
// Independent ordinary candidate checks; writes only inside this review folder.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const own = dirname(fileURLToPath(import.meta.url))
const repo = resolve(own, '../../../../../../..')
const author = resolve(own, '../biologie-evolution-eighteen-seven-source-course-remediation-author-v1')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bind = (p: string) => { const bytes = readFileSync(p); return { path: relative(repo, p), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const canonical = normalizeCanonicalLandscape(read(resolve(author, 'input/current-canonical479.exact.json')))
const conditional = normalizeCanonicalLandscape(read(resolve(author, 'candidate/current479-plus-one-assessable-behaviour-companion.canonical.json')))
const viewRows: unknown[] = []
let errorCount = 0
for (const name of ['de-mv-gym-seki-biology.view.json', 'de-sn-gym-seki-biology.view.json', 'de-st-gym-seki-biology.view.json', 'de-th-gym-seki-biology.view.json', 'HE-Q1-5-LK-explicitly-selected.view.json', 'HE-LK-Q2-1-limited-core-source-role-preview.view.json', '../conditional/RP-SekI-plus-ancestry-behaviour-companion.view.json']) {
  const p = resolve(author, 'candidate/composition-views', name)
  const view = normalizeCompositionView(read(p))
  const selected = name.startsWith('../') ? conditional : canonical
  const report = compileCompositionView(view, selected)
  const errors = report.findings.filter(row => row.severity === 'error')
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(selected.goals.map(g => [g.id, g])))
  errorCount += errors.length
  viewRows.push({ input: bind(p), ordinaryFunction: 'compileCompositionView', scope: view.scope, errors, warnings: report.findings.filter(row => row.severity === 'warning'), targetGoalIds: [...roles.targetGoalIds].sort(), prerequisiteOnlyGoalIds: [...roles.prerequisiteOnlyGoalIds].sort(), candidateCanonNodeCount: selected.goals.length, currentCanonicalActivation: false, wholeCourseApproval: false })
}
const atlasRows: unknown[] = []
for (const file of ['candidate/source-atlas.whole479-book-catalog-with-optional-witness.inputs.json', 'candidate/conditional/source-atlas.whole479-mandatory-only-diagnostic.inputs.json', 'candidate/conditional/source-atlas.whole479-explicit-Q1-5-selection-only.inputs.json']) {
  const p = resolve(author, file)
  const config = read(p)
  try {
    const result = buildGoalBookSourceAtlasInputs(config, repo)
    atlasRows.push({ input: bind(p), ordinaryFunction: 'buildGoalBookSourceAtlasInputs', status: 'technical-pass', counts: result.receipt.counts, outputsNotWritten: Object.entries(result.outputs).map(([intendedPath, bytes]) => ({ intendedPath, sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: Buffer.byteLength(bytes) })), scientificSourceApproval: false, wholeCourseApproval: false })
  } catch (e) {
    atlasRows.push({ input: bind(p), ordinaryFunction: 'buildGoalBookSourceAtlasInputs', status: 'HOLD', error: String(e), actual: (e as any).actual, expected: (e as any).expected, expectedCurricularAtomicGoalCount: config.expectedCurricularAtomicGoalCount, denominatorNotReduced: config.expectedCurricularAtomicGoalCount === 394, scientificSourceApproval: false, wholeCourseApproval: false })
  }
}
mkdirSync(resolve(own, 'checks'), { recursive: true })
writeFileSync(resolve(own, 'checks/ordinary-source-atlas-and-composition.actual.json'), JSON.stringify({ schemaVersion: 1, role: 'independent-normal-scoped-technical-candidate-check-after-science-FIRST', viewRows, atlasRows, viewErrorCount: errorCount, activeWrites: false, newStrictScientificClosures: 0, restoredExistingStrictBindings: 0, strictGain: 0, sourceRoleFindingStillOpen: 'EVO7B-SOURCE-001', sourceApproval: false, nativeApproval: false, humanApproval: false, humanTrial: false, license: 'CC-BY-4.0' }, null, 2) + '\n')
console.log(JSON.stringify({ viewChecks: viewRows.length, viewErrorCount: errorCount, atlasStatuses: atlasRows.map((x: any) => ({ status: x.status, counts: x.counts, actual: x.actual, expected: x.expected, error: x.error })), strictGain: 0 }))
if (errorCount) process.exitCode = 1
