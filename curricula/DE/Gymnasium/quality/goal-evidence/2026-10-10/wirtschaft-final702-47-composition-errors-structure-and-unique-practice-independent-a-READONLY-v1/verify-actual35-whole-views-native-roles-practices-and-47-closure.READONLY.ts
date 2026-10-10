import fs from 'node:fs'
import Module, { createRequire } from 'node:module'
import { resolve, dirname, basename } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape, buildCanonicalGraphIndex } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { collectDuplicateDirectPhaseStructureFindings, collectLearnerFacingCompositionLabelFindings } from '../../../../../../../app/scripts/lib/learnerFacingCompositionLabels'

const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final702-47-composition-errors-structure-and-unique-practice-independent-a-READONLY-v1'
const candidateDirectory = process.argv[2]
if (!candidateDirectory) throw new Error('Actual authored candidate view directory required')
const read = (path: string) => JSON.parse(fs.readFileSync(resolve(root, path), 'utf8'))
const artifact = (path: string) => { const bytes = fs.readFileSync(resolve(root, path)); return { path, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length } }
const initial = read(own + '/actual-current35-before-byte-guards-and47-CI-errors.READONLY.json')
const core = read(initial.currentWholeCore.path)
const goalById = new Map<string, any>(core.goals.map((goal: any) => [goal.id, goal]))
const canonical = normalizeCanonicalLandscape(core)
const canonicalIndex = buildCanonicalGraphIndex(canonical)
const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every(x => b.has(x))
const sorted = (a: Set<string>) => [...a].sort()
const ordinary = (id: string) => { const goal = goalById.get(id); return !!goal && !(goal.contains?.length) && !(goal.tags ?? []).some((tag: string) => ['Practice', 'Assessment', 'Orientation', 'Motivation', 'memorization'].includes(tag) || tag.startsWith('srs-deck:')) }
const practice = (id: string) => !!goalById.get(id)?.examData
const atomic = (id: string) => !!goalById.get(id) && !goalById.get(id).contains?.length
const candidateFiles = initial.views.map((view: any) => {
  const proposed = candidateDirectory + '/' + basename(view.active.path)
  return { activePath: view.active.path, beforePath: view.before.path, afterPath: fs.existsSync(resolve(root, proposed)) ? proposed : view.before.path }
})
const guards = [...new Set([initial.currentWholeCore.path, 'app/scripts/generateCurriculumQualityStatus.ts', 'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/utils/compositionViewRuntime.ts', 'app/scripts/lib/learnerFacingCompositionLabels.ts', ...candidateFiles.flatMap((v: any) => [v.activePath, v.beforePath, v.afterPath])])]
const beforeInputs = guards.map(artifact)
const sourcePath = resolve(root, 'app/scripts/generateCurriculumQualityStatus.ts')
const require = createRequire(resolve(root, 'app/package.json'))
const esbuild = require('esbuild')
const source = fs.readFileSync(sourcePath, 'utf8') + '\nexport { collectRenderedAtomicGoalIdsFromCompositionView };\n'
const compiled = esbuild.transformSync(source, { loader: 'ts', format: 'cjs', target: 'node20', define: { 'import.meta.url': JSON.stringify(pathToFileURL(sourcePath).href) } }).code
const module: any = new (Module as any)(sourcePath)
module.filename = sourcePath
module.paths = (Module as any)._nodeModulePaths(dirname(sourcePath))
module._compile(compiled, sourcePath)
const nativeRendered = module.exports.collectRenderedAtomicGoalIdsFromCompositionView
const checks: any[] = []
const check = (name: string, passed: boolean) => { checks.push({ name, passed }); if (!passed) throw new Error(name) }
const beforeErrors: any[] = []
const afterErrors: any[] = []
const results = candidateFiles.map((paths: any) => {
  const a = normalizeCompositionView(read(paths.beforePath)); const b = normalizeCompositionView(read(paths.afterPath))
  const rawA = read(paths.beforePath); const rawB = read(paths.afterPath)
  const ac = compileCompositionView(a, canonical); const bc = compileCompositionView(b, canonical)
  bc.findings.push(...collectDuplicateDirectPhaseStructureFindings(bc.compiledRootNodes), ...collectLearnerFacingCompositionLabelFindings(bc.compiledRootNodes))
  beforeErrors.push(...ac.findings.filter(x => x.severity === 'error').map(x => ({ view: paths.activePath, ...x })))
  afterErrors.push(...bc.findings.filter(x => x.severity === 'error').map(x => ({ view: paths.activePath, ...x })))
  const ar = collectCompositionProjectionRoleGoalIds(a.rootNodes, canonicalIndex.goalById)
  const br = collectCompositionProjectionRoleGoalIds(b.rootNodes, canonicalIndex.goalById)
  const leafRoleSets = [
    ['allAtomicTarget', new Set([...ar.targetGoalIds].filter(atomic)), new Set([...br.targetGoalIds].filter(atomic))],
    ['allAtomicPrerequisiteOnly', new Set([...ar.prerequisiteOnlyGoalIds].filter(atomic)), new Set([...br.prerequisiteOnlyGoalIds].filter(atomic))],
    ['ordinaryTarget', new Set([...ar.targetGoalIds].filter(ordinary)), new Set([...br.targetGoalIds].filter(ordinary))],
    ['ordinaryPrerequisiteOnly', new Set([...ar.prerequisiteOnlyGoalIds].filter(ordinary)), new Set([...br.prerequisiteOnlyGoalIds].filter(ordinary))],
    ['wholeOfferedPracticeTarget', new Set([...ar.targetGoalIds].filter(practice)), new Set([...br.targetGoalIds].filter(practice))],
  ] as Array<[string, Set<string>, Set<string>]>
  const roleComparisons = leafRoleSets.map(([name, aSet, bSet]) => { check(name + ' exact ' + basename(paths.activePath), sameSet(aSet, bSet)); return { name, before: sorted(aSet), after: sorted(bSet), exact: true } })
  const filters = [a.scope.courseProfile, a.scope.durationModel].filter(x => typeof x === 'string' && x.trim())
  check('whole scope metadata exact ' + basename(paths.activePath), JSON.stringify(rawA.scope) === JSON.stringify(rawB.scope))
  const renderedComparisons: any[] = []
  for (const stage of ['CrossStage', 'SekI', 'SekII']) for (const includeSupport of [false, true]) {
    const aSet = nativeRendered(core, resolve(root, paths.beforePath), filters, includeSupport, stage, ['6bf2d1cc-e745-50dd-a617-71c06a6c6945']) as Set<string>
    const bSet = nativeRendered(core, resolve(root, paths.afterPath), filters, includeSupport, stage, ['6bf2d1cc-e745-50dd-a617-71c06a6c6945']) as Set<string>
    check('native rendered whole atomic set exact ' + basename(paths.activePath) + ':' + stage + ':includeSupport=' + includeSupport, sameSet(aSet, bSet))
    renderedComparisons.push({ stage, includeSupport, wholeAtomicBefore: sorted(aSet), wholeAtomicAfter: sorted(bSet), exact: true })
  }
  const occurrences = new Map<string, number>()
  const visit = (nodes: any[]) => nodes.forEach(node => { if (node.sourceGoalId) occurrences.set(node.sourceGoalId, (occurrences.get(node.sourceGoalId) ?? 0) + 1); visit(node.children ?? []) })
  visit(bc.compiledRootNodes)
  const duplicates = [...occurrences].filter(([, count]) => count > 1)
  check('native compiled unique actual visible parents ' + basename(paths.activePath), duplicates.length === 0)
  return { ...paths, changed: JSON.stringify(rawA) !== JSON.stringify(rawB), roleComparisons, renderedComparisons, beforeErrorCount: ac.findings.filter(x => x.severity === 'error').length, afterErrorCount: bc.findings.filter(x => x.severity === 'error').length, compiledDuplicateIds: duplicates }
})
check('actual35 Economics views only', results.length === 35)
check('exact47 actual prior CPV errors independently reproduced', beforeErrors.length === 47)
check('all35 actual candidate native compilers have zero errors', afterErrors.length === 0)
const endInputs = guards.map(artifact)
check('all native proof inputs byte exact from own before to end', JSON.stringify(beforeInputs) === JSON.stringify(endInputs))
const output = { at: new Date().toISOString(), status: 'PASS_independent35_original_native_views_47_errors_closed_whole_atomic_roles_and_offered_practices_exact', nativeMethods: ['normalizeCanonicalLandscape', 'buildCanonicalGraphIndex', 'normalizeCompositionView', 'compileCompositionView', 'collectCompositionProjectionRoleGoalIds', 'collectRenderedAtomicGoalIdsFromCompositionView'], results, beforeErrors, afterErrors, beforeInputs, endInputs, checks, activeWrites: 0, ordinarySemanticBodiesNotReauthored: true, historicWholePracticeScienceNotRereviewed: true, noBroadQSandNoBookBuild: true, M6M7CIorHumanClaim: false }
fs.writeFileSync(resolve(root, own, 'actual-native35-whole-roles-offered-practices-and47-to0-composition-errors.READONLY.json'), JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ views: results.length, changed: results.filter(x => x.changed).length, errorsBefore: beforeErrors.length, errorsAfter: afterErrors.length, checks: checks.length, activeWrites: 0 }))
