import fs from 'node:fs'
import Module, { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-assessed-target-terminal-filter-independent-a-READONLY-v1'
const nativePath = 'app/scripts/generateCurriculumQualityStatus.ts'
const fullPath = resolve(root, nativePath)
const current = fs.readFileSync(fullPath, 'utf8')
// Root's previously qualified whole-closure additions are staged in the index.
// Compare this isolated new filter against that real predecessor, not older HEAD.
const previous = execFileSync('git', ['show', ':' + nativePath], { cwd: root, encoding: 'utf8' })
const require = createRequire(resolve(root, 'app/package.json'))
const esbuild = require('esbuild')
const land = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const math = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const hash = (path: string) => createHash('sha256').update(fs.readFileSync(resolve(root, path))).digest('hex')
const guards = [nativePath, 'AGENTS.md', 'app/scripts/testDeepUnderstandingRollout.ts', 'app/src/utils/curriculumQualityStatus.ts', 'app/scripts/lib/canonicalMathSek1ReviewedExamRoutes.ts', 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']
const before = guards.map(path => ({ path, sha256: hash(path) }))
const appendedFixtureAdapter = `
export function __independentNativeRouteFixture(landscape, profile, selected, terminal, compilation, viewFile) {
  const originalDiscovery = readCompositionViewFilesForLandscapeId;
  readCompositionViewFilesForLandscapeId = () => [viewFile];
  try {
    const direct = buildDirectRequiresEdges(landscape);
    const effective = buildEffectiveRequiresEdges(landscape);
    return evaluateRouteEndpointCompositionVisibility(landscape, profile, selected, [terminal], compilation, effective, buildReverseEdges(effective), direct, buildReverseEdges(direct));
  } finally { readCompositionViewFilesForLandscapeId = originalDiscovery; }
}
export { examReleaseCoverageIssues, CANONICAL_GYM_PHYSICS_LANDSCAPE_ID };
`
function moduleFor(source: string) {
  // Exact production source is evaluated in memory. The appended fixture adapter
  // replaces only file discovery to supply authored unit inputs. Native route,
  // rendered-role, country, prerequisite, binding and pass predicates are intact.
  const code = esbuild.transformSync(source + appendedFixtureAdapter, { loader: 'ts', format: 'cjs', target: 'node20', define: { 'import.meta.url': JSON.stringify(pathToFileURL(fullPath).href) } }).code
  const module: any = new (Module as any)(fullPath)
  module.filename = fullPath
  module.paths = (Module as any)._nodeModulePaths(dirname(fullPath))
  module._compile(code, fullPath)
  return module.exports
}
const oldNative = moduleFor(previous)
const newNative = moduleFor(current)
const cases: any[] = []
const checks: any[] = []
const check = (name: string, ok: boolean) => { checks.push({ name, passed: ok }); if (!ok) throw new Error(name) }
const start = current.indexOf('        .filter((goal) => {\n          if (profile.landscapeId !== CANONICAL_GYM_ECONOMICS_LANDSCAPE_ID) return true\n          // An Economics endpoint')
const end = current.indexOf('        .map((goal) => goal.id)', start)
check('entire source differs from real staged predecessor only by the bounded Economics filter', start > 0 && current.slice(0, start) + current.slice(end) === previous)
function run(name: string, options: any = {}, landscapeId = land) {
  const atom = (id: string, requires: string[] = [], extra: any = {}) => ({ id, title: id, titleEn: id, description: 'Whole unit fixture ' + id, descriptionEn: 'Whole unit fixture ' + id, type: 'atomic', weight: 1, contains: [], requires, tags: ['GK'], phase: 'Q1', dimensionTags: { phase: 'Q1' }, ...extra })
  const motivation = atom('motivation', [], { tags: ['GK', 'Orientation'], semanticKind: 'orientation' })
  const assessed = atom('assessed', ['motivation'])
  const support = atom('support', ['motivation'])
  const coverage = options.coverage ?? ['assessed']
  const endpoint = atom('endpoint', options.requires ?? ['assessed', 'support'], { tags: ['GK', 'Practice', 'Assessment'], semanticKind: 'practiceAssessment', extendedData: { applicabilityFromRequires: true }, examData: { coveredGoalIds: coverage, coveredStrands: ['fixture'], demandLevels: ['AB2'], reviewStatus: 'released' } })
  const landscape = { landscapeId, title: 'Independent route unit fixture', goals: [motivation, assessed, support, endpoint] }
  const children: any[] = [ { kind: 'goalEntry', goalId: 'motivation' }, { kind: 'goalEntry', goalId: 'assessed', projectionRole: options.assessedTarget === false ? 'prerequisiteOnly' : 'target' } ]
  if (options.supportVisible !== false) children.push({ kind: 'goalEntry', goalId: 'support', projectionRole: 'prerequisiteOnly' })
  if (options.endpointVisible !== false) children.push({ kind: 'goalEntry', goalId: 'endpoint' })
  const view = { viewId: name, landscapeId, scope: { schoolForm: 'Gymnasium', stage: 'SekII', courseProfile: 'GK', jurisdiction: 'DE-BB' }, rootNodes: [{ kind: 'structure', id: 'sekii', label: 'Sekundarstufe II', children }] }
  const viewFile = resolve(root, own, 'fixture-' + name + '.view.json')
  fs.writeFileSync(viewFile, JSON.stringify(view, null, 2) + '\n')
  const profile = { profileId: 'independent-unit-fixture', landscapeId, label: 'Independent unit fixture', motivationAnchorGoalIds: ['motivation'], terminalAutonomyClusterIds: [], compositionViewStage: 'SekII', compositionViewApplicabilityMode: 'compiled-jurisdiction', compositionViewRoutePathMode: 'visible-atomic', goalSelector: () => true, clusterSelector: () => false }
  const compilation = { reports: [{ landscapeId, goals: landscape.goals.map(goal => ({ goalId: goal.id, compiledApplicability: { jurisdiction: ['DE-BB'] } })) }], summary: { supportedValues: ['DE-BB'] } }
  const selected = options.assessedTarget === false ? [] : [assessed]
  const previousResult = oldNative.__independentNativeRouteFixture(landscape, profile, selected, endpoint, compilation, viewFile)
  const currentResult = newNative.__independentNativeRouteFixture(landscape, profile, selected, endpoint, compilation, viewFile)
  const row = { name, options, landscapeId, previousResult, currentResult, nativeReleaseIssues: newNative.examReleaseCoverageIssues(endpoint) }
  cases.push(row)
  return row
}

let row = run('support-only-assessed-not-target', { assessedTarget: false, endpointVisible: false })
check('support-only competency no longer creates an expected assessment target', row.previousResult.metrics.requiredTerminalAutonomyGoals === 1 && row.currentResult.metrics.requiredTerminalAutonomyGoals === 0 && row.currentResult.metrics.projectionScopesMissingTerminalAutonomyGoals === 0)
row = run('assessed-target-plus-unassessed-support-prerequisite')
check('target competency plus visible support prerequisite remains expected and wholly valid', row.currentResult.status === 'pass' && row.currentResult.metrics.requiredTerminalAutonomyGoals === 1)
row = run('mixed-assessed-target-and-visible-assessed-support', { coverage: ['assessed', 'support'] })
check('whole mixed assessment remains expected and complete when all assessed support is visible', row.currentResult.status === 'pass' && row.currentResult.metrics.requiredTerminalAutonomyGoals === 1)
row = run('mixed-assessed-target-and-invisible-assessed-support', { coverage: ['assessed', 'support'], supportVisible: false })
check('mixed assessment cannot license missing assessed support through one convenient target', row.currentResult.status === 'fail' && row.currentResult.metrics.projectionScopesWithIncompleteWholeMaterialCoverageBindings === 1 && row.currentResult.metrics.projectionScopesWithIncompleteWholeMaterialPrerequisiteClosure > 0)
row = run('missing-wholly-required-assessment', { endpointVisible: false })
check('genuinely missing assessment for target remains a hard missing-endpoint failure', row.currentResult.status === 'fail' && row.currentResult.metrics.projectionScopesMissingTerminalAutonomyGoals === 1)
row = run('visible-practice-assesses-support-only', { assessedTarget: false })
check('target practice that wrongly assesses support-only competency remains an unexpected-endpoint failure', row.currentResult.status === 'fail' && row.currentResult.metrics.projectionScopesWithUnexpectedTerminalAutonomyGoals === 1)
row = run('missing-real-support-prerequisite', { supportVisible: false })
check('missing real support still fails complete material prerequisite closure', row.currentResult.status === 'fail' && row.currentResult.metrics.projectionScopesWithIncompleteWholeMaterialPrerequisiteClosure > 0)
row = run('wrong-visible-practice-coverage', { coverage: ['assessed', 'unavailable'] })
check('one actual target cannot license another unknown covered competency; native whole binding remains fatal', row.currentResult.status === 'fail' && row.currentResult.metrics.requiredTerminalAutonomyGoals === 1 && row.currentResult.metrics.projectionScopesWithIncompleteWholeMaterialCoverageBindings === 1)
row = run('target-visible-but-covered-only-support', { coverage: ['support'] })
check('a convenient unassessed target never licenses a support-only assessed contract', row.currentResult.status === 'fail' && row.currentResult.metrics.requiredTerminalAutonomyGoals === 0 && row.currentResult.metrics.projectionScopesWithUnexpectedTerminalAutonomyGoals === 1)
row = run('empty-coverage-stays-expected-for-release-failure', { coverage: [] })
check('missing coverage is never used as an endpoint exemption and retains release failure', row.currentResult.metrics.requiredTerminalAutonomyGoals === 1 && row.nativeReleaseIssues.includes('missing coveredGoalIds'))
row = run('foreign-coverage-stays-expected-for-binding-failure', { coverage: ['foreign:assessed'] })
check('foreign-only coverage stays expected and fails whole local binding', row.currentResult.status === 'fail' && row.currentResult.metrics.requiredTerminalAutonomyGoals === 1 && row.currentResult.metrics.projectionScopesWithIncompleteWholeMaterialCoverageBindings === 1)
for (const [name, landscapeId] of [['protected-math', math], ['protected-physics', newNative.CANONICAL_GYM_PHYSICS_LANDSCAPE_ID]]) {
  row = run(name, { assessedTarget: false, endpointVisible: false }, landscapeId)
  check(name + ' native result entire byte-serialised parity before and after Economics filter', JSON.stringify(row.previousResult) === JSON.stringify(row.currentResult))
}
const ends = before.map(g => ({ ...g, endSha256: hash(g.path), exact: hash(g.path) === g.sha256 }))
check('all production/core/registry/instruction before/endguards exact', ends.every(g => g.exact))
const output = { actualAt: new Date().toISOString(), status: 'PASS_independent_actual_native_route_predicate_thirteen_meaningful_fixtures', methodology: 'Exact staged predecessor and current production source in virtual modules; their full-byte difference is verified to be only the new bounded Economics filter. Only private exports and controlled view-file discovery fixture adapter appended. Actual evaluateRouteEndpointCompositionVisibility and all its native role/visibility/prerequisite/whole-material/binding/pass predicates execute. No status generation main, no applicability rebuild, no active writes.', currentCodeSha256: hash(nativePath), actualStagedPredecessorCodeSha256: createHash('sha256').update(previous).digest('hex'), actualBoundedFilter: current.slice(start,end), cases, checks, endGuards: ends, activeWrites: 0, whole701ActualNativePassClaim: false, independentScientificGoalReviewClaim: false, M6M7OrCIClaim: false, DOrVApprovalClaim: false, humanApproval: false }
fs.writeFileSync(resolve(root, own, 'actual-native-thirteen-meaningful-route-predicate-negative-fixtures.READONLY.json'), JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ cases: cases.length, checks: checks.length, failed: checks.filter(x => !x.passed).length, activeWrites: 0, code: output.currentCodeSha256 }))
