import fs from 'node:fs'
import Module, { createRequire } from 'node:module'
import { resolve, dirname, basename } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const root = process.cwd()
const q = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
const author = q + 'wirtschaft-final702-nine-local-whole-practices-and-qualified-scope-route-COMPOSITION-INERT-v1'
const own = q + 'wirtschaft-117-pure-support-practice-scope-retirements-independent-a-READONLY-v1'
const handoffPath = author + '/actual-42-scope-20-old-whole-practice-only-support-target-retirement.AUTHOR-INERT.json'
const read = (p: string) => JSON.parse(fs.readFileSync(resolve(root, p), 'utf8'))
const sha = (p: string) => createHash('sha256').update(fs.readFileSync(resolve(root, p))).digest('hex')
const handoff = read(handoffPath)
const core = read(handoff.wholeCAN.path)
const baselineNative = read(handoff.sourceNativeReport.path)
const goals = new Map(core.goals.map((g: any) => [g.id, g])) as Map<string, any>
const countryApp = new Map(baselineNative.applicabilityEconomics.goals.map((g: any) => [g.goalId, new Set(g.compiledApplicability.jurisdiction ?? [])])) as Map<string, Set<string>>
const candidateFiles = fs.readdirSync(resolve(root, author, 'candidate-views')).filter(x => x.endsWith('.view.json')).sort()
const beforeByActive = new Map(handoff.viewPairs.map((p: any) => [p.activePath, p.before.path]))
const guardPaths = [handoffPath, handoff.wholeCAN.path, handoff.sourceNativeReport.path,
  'app/scripts/generateCurriculumQualityStatus.ts', 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
  ...handoff.viewPairs.flatMap((p: any) => [p.before.path, p.candidate.path]), ...candidateFiles.map(x => author + '/candidate-views/' + x)]
const before = [...new Set(guardPaths)].map(path => ({ path, sha256: sha(path) }))
const sourcePath = resolve(root, 'app/scripts/generateCurriculumQualityStatus.ts')
const require = createRequire(resolve(root, 'app/package.json'))
const esbuild = require('esbuild')
const source = fs.readFileSync(sourcePath, 'utf8') + '\nexport { collectRenderedAtomicGoalIdsFromCompositionView };\n'
const code = esbuild.transformSync(source, { loader: 'ts', format: 'cjs', target: 'node20', define: { 'import.meta.url': JSON.stringify(pathToFileURL(sourcePath).href) } }).code
const module: any = new (Module as any)(sourcePath)
module.filename = sourcePath
module.paths = (Module as any)._nodeModulePaths(dirname(sourcePath))
module._compile(code, sourcePath)
const collect = module.exports.collectRenderedAtomicGoalIdsFromCompositionView
const checks: any[] = []
function check(name: string, ok: boolean) { checks.push({ name, passed: ok }); if (!ok) throw new Error(name) }
const sameSet = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every(x => b.has(x))
const ordinary = (id: string) => { const g = goals.get(id); return g && (g.contains?.length ?? 0) === 0 && !(g.tags ?? []).some((t: string) => ['Practice', 'Assessment', 'Orientation', 'Motivation', 'memorization'].includes(t)) && !(g.tags ?? []).some((t: string) => t.startsWith('srs-deck:')) }
function project(path: string) {
  const view = read(path)
  const filters = [view.scope.courseProfile, view.scope.durationModel].filter(x => typeof x === 'string' && x.trim())
  return { path, view, target: collect(core, resolve(root, path), filters, false, 'CrossStage', ['6bf2d1cc-e745-50dd-a617-71c06a6c6945']) as Set<string>, visible: collect(core, resolve(root, path), filters, true, 'CrossStage', ['6bf2d1cc-e745-50dd-a617-71c06a6c6945']) as Set<string> }
}
const projections = candidateFiles.map(file => {
  const active = 'curricula/DE/Gymnasium/composition-views/wirtschaft/' + file
  const afterPath = author + '/candidate-views/' + file
  const beforePath = (beforeByActive.get(active) as string | undefined) ?? afterPath
  return { active, before: project(beforePath), after: project(afterPath) }
})
check('all35 whole actual economics views inspected through private native rendered projection helper', projections.length === 35)
const filtered = (set: Set<string>, country: string) => new Set([...set].filter(id => countryApp.get(id)?.has(country)))
const roleComparisons = projections.map(p => {
  const targetBefore = new Set([...p.before.target].filter(ordinary)); const targetAfter = new Set([...p.after.target].filter(ordinary))
  const visibleBefore = new Set([...p.before.visible].filter(ordinary)); const visibleAfter = new Set([...p.after.visible].filter(ordinary))
  check('whole ordinary target roles exact ' + basename(p.active), sameSet(targetBefore, targetAfter))
  check('whole ordinary target plus prerequisite support visibility exact ' + basename(p.active), sameSet(visibleBefore, visibleAfter))
  return { active: p.active, targetBefore: [...targetBefore].sort(), targetAfter: [...targetAfter].sort(), visibleBefore: [...visibleBefore].sort(), visibleAfter: [...visibleAfter].sort(), removedPracticeTargets: [...p.before.target].filter(id => !p.after.target.has(id)).sort() }
})
const rowProofs = handoff.rows.map((r: any) => {
  const p = projections.find(x => x.active === r.scope)!
  const g = goals.get(r.wholePracticeGoalId)!
  const targetBefore = filtered(p.before.target, r.jurisdiction)
  const visibleBefore = filtered(p.before.visible, r.jurisdiction)
  const covered = (g.examData?.coveredGoalIds ?? []).map((x: string) => x.includes(':') ? x.split(':', 2)[1] : x)
  const intersection = covered.filter((id: string) => targetBefore.has(id))
  check('before covered target intersection empty ' + r.scope + ':' + g.id, covered.length > 0 && intersection.length === 0)
  check('all actual assessed competencies remain visible prerequisite support ' + r.scope + ':' + g.id, covered.every((id: string) => visibleBefore.has(id)))
  check('whole declared coverage and prerequisites match author matrix exact ' + g.id, JSON.stringify(g.examData.coveredGoalIds) === JSON.stringify(r.wholeCoveredGoalIds) && JSON.stringify(g.requires) === JSON.stringify(r.wholeRequires))
  check('practice was actual target and becomes non-target only ' + r.scope + ':' + g.id, targetBefore.has(g.id) && !p.after.target.has(g.id) && (g.tags ?? []).includes('Practice'))
  return { scope: r.scope, jurisdiction: r.jurisdiction, wholePracticeGoalId: g.id, coveredGoalIds: g.examData.coveredGoalIds, actualCoveredTargetIntersection: intersection, actualCoverageBeforeVisible: covered.every((id: string) => visibleBefore.has(id)), wholePracticeObjectSha256: createHash('sha256').update(JSON.stringify(g)).digest('hex') }
})
check('actual117 state Practice/scope pairs and20 whole old PracticeIDs', rowProofs.length === 117 && new Set(rowProofs.map((r: any) => r.wholePracticeGoalId)).size === 20)

function resolvedNational(p: any, country: string, which: 'before' | 'after') {
  const national = p[which]
  const matchingState = projections.filter(x => x[which].view.scope.jurisdiction === country && x[which].view.scope.courseProfile === national.view.scope.courseProfile)
  check('national scope has one real authored matching Stateauthority ' + basename(p.active) + ':' + country + ':' + which, matchingState.length === 1)
  const state = matchingState[0][which]
  const nationalTargets = filtered(national.target, country)
  const nationalVisible = filtered(national.visible, country)
  const stateTargets = filtered(state.target, country)
  const stateVisible = filtered(state.visible, country)
  const target = new Set([...nationalTargets].filter(id => stateTargets.has(id)))
  const visible = new Set([...target, ...[...nationalVisible].filter(id => !nationalTargets.has(id)), ...[...stateVisible].filter(id => !stateTargets.has(id))])
  return { target, visible }
}
const nationalComparisons: any[] = []
for (const p of projections.filter(x => !x.after.view.scope.jurisdiction && x.after.view.scope.stage !== 'SekI')) {
  for (const country of baselineNative.jurisdictionCoverage.jurisdictions.map((x: any) => x.jurisdiction)) {
    const a = resolvedNational(p, country, 'before'); const b = resolvedNational(p, country, 'after')
    check('resolved national ordinary target exact ' + basename(p.active) + ':' + country, sameSet(new Set([...a.target].filter(ordinary)), new Set([...b.target].filter(ordinary))))
    check('resolved national ordinary visible support exact ' + basename(p.active) + ':' + country, sameSet(new Set([...a.visible].filter(ordinary)), new Set([...b.visible].filter(ordinary))))
    const removed = [...a.target].filter(id => !b.target.has(id))
    for (const id of removed) {
      const g = goals.get(id)!
      check('national authority removes only whole support-only Practice target ' + country + ':' + id, (g.tags ?? []).includes('Practice') && (g.examData?.coveredGoalIds ?? []).every((covered: string) => !a.target.has(covered)))
    }
    nationalComparisons.push({ view: p.active, jurisdiction: country, ordinaryTargetsExact: true, ordinarySupportVisibilityExact: true, removedPracticeTargets: removed.sort() })
  }
}
check('all32 actual country-resolved national GK/LK projections independently compared', nationalComparisons.length === 32)
const after = before.map(x => ({ ...x, endSha256: sha(x.path), exact: sha(x.path) === x.sha256 }))
check('all inputs/code/currentCore/REG/materialCore/35Views byte exact before and end', after.every(x => x.exact))
const output = { reviewedAt: new Date().toISOString(), status: 'PASS_actual_native117_pure_support_practice_scope_pairs_35whole_views_32resolved_national_authority', privateNativeMethods: ['collectRenderedAtomicGoalIdsFromCompositionView'], nativeScopeAndCountryValuesTakenFromActual702Report: true, scopeRoleSourceMaterialBodiesNotReauthored: true, currentCodeSha256: sha('app/scripts/generateCurriculumQualityStatus.ts'), beforeInputs: before, endGuards: after, rowProofs, ordinaryRoleComparisons: roleComparisons, nationalAuthorityComparisons: nationalComparisons, checks, activeWrites: 0, freshHistoricPracticeContentReviewClaim: false, M6M7OrCIClaim: false, humanApproval: false }
fs.writeFileSync(resolve(root, own, 'actual-native117-support-only-pairs-35roles-32national-projections.READONLY.json'), JSON.stringify(output, null, 2) + '\n')
console.log(JSON.stringify({ rows: rowProofs.length, views: projections.length, national: nationalComparisons.length, checks: checks.length, failed: checks.filter(x => !x.passed).length, activeWrites: 0 }))
