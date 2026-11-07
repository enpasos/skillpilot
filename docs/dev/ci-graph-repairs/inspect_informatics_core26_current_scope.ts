// SPDX-License-Identifier: Apache-2.0
// Analysis only: invokes existing production compilers, never writes source data.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { evaluateRouteProfile, routeProfiles } from '../../../app/scripts/generateCurriculumQualityStatus'
import { buildApplicabilityCompilation } from '../../../app/scripts/applicabilityCompiler'
import { normalizeCanonicalLandscape } from '../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../app/src/utils/authoring/compositionViewAuthoring'
import { goalMatchesFilters } from '../../../app/src/utils/goalFilters'
import { checkSkillGraphIntegrity } from '../../../app/scripts/lib/skillGraphIntegrity'
import { fingerprintSemanticKindSourceGoal } from '../../../app/scripts/goalBookModel'

const hash = (raw: Uint8Array | string) => createHash('sha256').update(raw).digest('hex')
const manifest = JSON.parse(readFileSync('docs/dev/ci-graph-repairs/informatics-core26-current-math-analysis-context-2026-11-06.json', 'utf8'))
const selected = manifest.variants[process.argv[2]]
assert.ok(selected)
manifest.operations = selected.operations
const mode = process.argv[2]
assert.ok(selected)
const owner: string = manifest.source.landscapeId
const expectedHash = selected.hypotheticalSourceSha256
const rawDocuments = manifest.catalogSources.map((binding: { path: string; sha256: string; landscapeId: string }) => {
  const raw = readFileSync(binding.path)
  assert.equal(hash(raw), binding.landscapeId === owner ? expectedHash : binding.sha256, `Foreign/stale actual source: ${binding.path}`)
  const document = JSON.parse(raw.toString('utf8'))
  assert.equal(document.landscapeId, binding.landscapeId)
  return { ...document, sourceFile: binding.path }
})
assert.equal(rawDocuments.length, 21)
const canonical = new Map(rawDocuments.map((document: Record<string, unknown>) => {
  const normalized = normalizeCanonicalLandscape(document)
  return [normalized.landscapeId, normalized] as const
}))
const allGoals = [...canonical.values()].flatMap(landscape => landscape.goals)
const goals = new Map(allGoals.map(goal => [goal.id, goal]))
assert.equal(goals.size, allGoals.length, 'No arbitrary merging of duplicate global IDs')
const rootIds = new Map([...canonical].flatMap(([id, landscape]) => {
  const root = landscape.goals.find(goal => (goal.tags ?? []).includes('root'))
  return root ? [[id, root.id] as const] : []
}))
const universe = { landscapeId: 'declared-complete-canonical-universe', title: 'Declared canonical catalog', goals: allGoals }
const applicability = buildApplicabilityCompilation()
const infoApplicability = applicability.reports.find(report => report.landscapeId === owner)!
assert.ok(infoApplicability)
const compiledByGoal = new Map(applicability.reports.flatMap(report => report.goals.map(goal => [goal.goalId, goal.compiledApplicability] as const)))
const infoIds = new Set(canonical.get(owner)!.goals.map(goal => goal.id))
const collect = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? collect(resolve(directory, entry.name)) : entry.name.endsWith('.view.json') ? [resolve(directory, entry.name)] : [])
const viewRows = []
for (const path of collect('curricula/DE/Gymnasium/composition-views').sort()) {
  const view = normalizeCompositionView(JSON.parse(readFileSync(path, 'utf8')))
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals, rootIds)
  if (![...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds].some(id => infoIds.has(id))) continue
  const visible = (ids: Set<string>, inferred: boolean) => [...ids].filter(id => {
    const goal = goals.get(id)
    assert.ok(goal, `Unknown authored goal ${id}`)
    const values = inferred ? compiledByGoal.get(id) : goal.applicability
    // This is the compiler's jurisdiction-visible projection, not a new role
    // assignment or learner-scope resolver. Course/duration filters are native.
    if (view.scope.jurisdiction && !(values?.jurisdiction ?? []).includes(view.scope.jurisdiction)) return false
    return goalMatchesFilters(goal, [view.scope.courseProfile, view.scope.durationModel].filter((value): value is string => !!value))
  }).sort()
  const rawTargets = visible(roles.targetGoalIds, false)
  const rawSupport = visible(roles.prerequisiteOnlyGoalIds, false)
  const inferredTargets = visible(roles.targetGoalIds, true)
  const inferredSupport = visible(roles.prerequisiteOnlyGoalIds, true)
  const missing = (targets: string[], support: string[]) => {
    const available = new Set([...targets, ...support])
    return targets.flatMap(id => goals.get(id)!.requires.map(ref => ref.split(':').at(-1)!)
      .filter(ref => !available.has(ref)).map(ref => ({ sourceGoalId: id, prerequisiteGoalId: ref })))
  }
  const compiled = compileCompositionView(view, canonical.get(view.landscapeId)!, universe, canonical)
  viewRows.push({ path: path.slice(process.cwd().length + 1), viewId: view.viewId, scope: view.scope,
    authoredTargets: [...roles.targetGoalIds].sort(), authoredPrerequisiteOnly: [...roles.prerequisiteOnlyGoalIds].sort(),
    rawVisibleTargets: rawTargets, rawVisiblePrerequisiteOnly: rawSupport,
    inferredVisibleTargets: inferredTargets, inferredVisiblePrerequisiteOnly: inferredSupport,
    rawMissingDirectPrerequisites: missing(rawTargets, rawSupport),
    inferredMissingDirectPrerequisites: missing(inferredTargets, inferredSupport),
    compiledTreeSha256: hash(JSON.stringify(compiled.compiledRootNodes)), compilerFindings: compiled.findings })
}
const rawInfo = rawDocuments.find((document: { landscapeId: string }) => document.landscapeId === owner)
const changedIds = new Set<string>(manifest.operations.map((operation: { guardGoalId: string }) => operation.guardGoalId))
const fingerprints = rawInfo.goals.filter((goal: { id: string }) => changedIds.has(goal.id)).map((goal: Record<string, unknown>) => ({
  goalId: goal.id, fingerprint: fingerprintSemanticKindSourceGoal(goal),
}))
const strict = checkSkillGraphIntegrity(rawDocuments, [owner])
assert.deepEqual(strict.rootLandscapeIds, [owner])
assert.ok(strict.checkedGoalKeys.length > 0)
const nativeRouteScopes = routeProfiles.filter(profile => profile.landscapeId === owner).map(profile => evaluateRouteProfile(rawInfo, profile, applicability))
console.log(JSON.stringify({ mode, sourceSha256: expectedHash, catalogFiles: 21, dataApplied: false, qaApprovalClaimed: false,
  actualApplicability: { info: infoApplicability,
    foreignReports: applicability.reports.filter(report => report.landscapeId !== owner).map(report => ({
      landscapeId: report.landscapeId, goals: report.goals.length,
      compiledJurisdictionsSha256: hash(JSON.stringify(report.goals.map(goal => [goal.goalId, goal.compiledApplicability]))),
      findingsSha256: hash(JSON.stringify(report.findings)),
    })) },
  nativeRouteScopes, views: viewRows, semanticKindSourceFingerprints: fingerprints, strictIntegrity: strict,
  codeBindings: ['app/scripts/applicabilityCompiler.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts',
    'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/goalFilters.ts', 'app/scripts/lib/skillGraphIntegrity.ts',
    'app/scripts/auditTransitiveMinimality.ts', 'app/scripts/goalBookModel.ts', 'app/scripts/generateCurriculumQualityStatus.ts'].map(path => ({ path, sha256: hash(readFileSync(path)) })),
  roleAssignmentChangedByAnalysis: false, applicabilityMaterializedIntoSource: false,
}, null, 2))
