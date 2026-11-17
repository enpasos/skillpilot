import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolveExplicitAtomicRouteEndpoints, explicitAtomicEndpointApplies } from '../../../../../app/scripts/lib/explicitAtomicRouteEndpoints.ts'
import { evaluateDirectAtomicRouteCoverage } from '../../../../../app/scripts/lib/directAtomicRouteCoverage.ts'
import { validateHardDirectAtomicRoutes } from '../../../../../app/scripts/lib/hardLearningRouteValidation.ts'

const base = 'tmp/pipeline/laender-stufen/gesamt/review/'
const source = JSON.parse(readFileSync(base + 'source-stage-qa-v5-endpoint.author.actual.json', 'utf8'))
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const initialPins = Object.fromEntries(Object.keys(source.codePins).map(p => [p, hash(p)]))
const approvedChangedFiles = new Set(['app/scripts/generateCurriculumQualityStatus.ts', 'app/scripts/testExplicitAtomicRouteEndpoints.ts'])
for (const [path, digest] of Object.entries(source.codePins)) {
  if (!approvedChangedFiles.has(path)) assert.equal(initialPins[path], digest, 'Previously reviewed implementation changed: ' + path)
}
const main = readFileSync('app/scripts/generateCurriculumQualityStatus.ts', 'utf8')
const inventory = main.match(/terminalAutonomyGoalIds:\s*\[([\s\S]*?)\]/)?.[1]
assert(inventory)
const ids = [...inventory.matchAll(/'([0-9a-f-]{36})'/g)].map(match => match[1])
const release = JSON.parse(readFileSync('tmp/pipeline/laender-stufen/gesamt/physics/all-nine-assessments/release-manifest.actual.json', 'utf8'))
assert.equal(ids.length, 13)
assert.equal(new Set(ids).size, 13)
assert(release.tasks.every((task: any) => ids.includes(task.id)))
assert.deepEqual([...ids].sort(), [...source.explicitReleasedTaskIds, ...release.tasks.map((task: any) => task.id)].sort())

const atom = (id: string, requires: string[] = [], extra = {}) => ({ id, title: id, type: 'atomic', contains: [], requires, ...extra })
const task = atom('exam', ['knowledge', 'foundation'], { examData: { reviewStatus: 'released', coveredGoalIds: ['knowledge', 'second'] } })
let combinations = 0
for (let selected = 0; selected < 4; selected++) for (let learning = 0; learning < 8; learning++) {
  const s = new Set(['knowledge', 'second'].filter((_, i) => selected & (1 << i)))
  const l = new Set(['knowledge', 'second', 'foundation'].filter((_, i) => learning & (1 << i)))
  // Independent truth table: some actually assessed target AND all content and
  // preparation inside the supplied closed basis. No target import is allowed.
  assert.equal(explicitAtomicEndpointApplies(task, s, l), selected !== 0 && learning === 7)
  assert.equal(explicitAtomicEndpointApplies(task, s, l, true), true)
  combinations += 2
}
const valid = new Map([['exam', task]])
const configurations = [
  { ids: ['exam'], goals: valid, issues: 0 },
  { ids: ['absent'], goals: valid, issues: 1 },
  { ids: ['exam', 'exam'], goals: valid, issues: 1 },
  ...[undefined, null, [], 'released', {}, { reviewStatus: 'draft' }].map(examData => ({ ids: ['exam'], goals: new Map([['exam', { ...task, examData }]]), issues: 1 })),
  ...[{ type: 'cluster' }, { type: undefined }, { contains: ['child'] }].map(patch => ({ ids: ['exam'], goals: new Map([['exam', { ...task, ...patch }]]), issues: 1 })),
]
for (const c of configurations) assert.equal(resolveExplicitAtomicRouteEndpoints(c.ids, c.goals).issues.length, c.issues)
assert.equal(resolveExplicitAtomicRouteEndpoints(['exam'], valid, new Set(['exam'])).issues.length, 1)
assert.equal(resolveExplicitAtomicRouteEndpoints(['exam'], valid, new Set(), new Set()).issues.length, 1)

const goals = [atom('anchor'), atom('knowledge', ['anchor']), atom('foundation', ['anchor']), atom('second', ['anchor']),
  atom('old-exam', ['second'], { examData: { reviewStatus: 'released', coveredGoalIds: ['second'] } }),
  task, { id: 'old-folder', title: 'Old unchanged assessment inventory', type: 'cluster', contains: ['old-exam'], requires: [] }]
const landscape = { landscapeId: 'independent-review', goals }
const profile = { motivationAnchorGoalIds: ['anchor'], terminalAutonomyClusterIds: ['old-folder'], terminalAutonomyGoalIds: ['exam'],
  goalSelector: (goal: any) => ['knowledge', 'second', 'foundation'].includes(goal.id) }
const kinds = new Map(goals.map(g => [g.id, g.id === 'anchor' ? 'orientation' : g.id.endsWith('exam') ? 'practiceAssessment' : 'curricularAtomic']))
const hard = { scopeLabel: 'independent-review', motivationAnchorGoalIds: ['anchor'], terminalGoalClusterIds: ['old-folder'], terminalGoalIds: ['exam'], goalSelector: profile.goalSelector }
assert.deepEqual(evaluateDirectAtomicRouteCoverage(landscape as any, profile).details, [])
assert.deepEqual(validateHardDirectAtomicRoutes(goals, kinds as any, hard), [])
const failures = [
  { name: 'missing-needed-endpoint', goals: goals.filter(g => g.id !== 'exam') },
  { name: 'unreleased-endpoint', goals: goals.map(g => g.id === 'exam' ? { ...g, examData: { ...task.examData, reviewStatus: 'draft' } } : g) },
  { name: 'missing-old-mandatory-cluster', goals: goals.filter(g => g.id !== 'old-folder') },
  { name: 'missing-old-mandatory-assessment', goals: goals.filter(g => g.id !== 'old-exam') },
  { name: 'missing-required-preparation', goals: goals.filter(g => g.id !== 'foundation') },
  { name: 'coverage-without-requires-path', goals: goals.map(g => g.id === 'exam' ? { ...g, requires: ['foundation'] } : g) },
]
for (const f of failures) {
  assert(evaluateDirectAtomicRouteCoverage({ ...landscape, goals: f.goals } as any, profile).details.length > 0, f.name)
  assert(validateHardDirectAtomicRoutes(f.goals, kinds as any, hard).length > 0, f.name)
}
// Unselected extra assessed content does not enter scope just to make an exam
// usable. A separate appropriate old endpoint remains unchanged.
const outOfScope = { ...profile, goalSelector: (g: any) => g.id === 'second' }
assert.deepEqual(evaluateDirectAtomicRouteCoverage(landscape as any, outOfScope).terminalGoalIds, ['old-exam'])
assert.deepEqual(validateHardDirectAtomicRoutes(goals, kinds as any, { ...hard, goalSelector: outOfScope.goalSelector }), [])
const finalPins = Object.fromEntries(Object.keys(initialPins).map(p => [p, hash(p)]))
assert.deepEqual(initialPins, finalPins)
const report = { schema: 'independent-explicit-atomic-endpoints-review-v2', reviewer: '/root', author: '/root/he_ephase_source_review',
  at: new Date().toISOString(), status: 'PASS', codePins: initialPins, inputDrift: [],
  finalExplicitEndpointInventory: ids, unchangedImplementationModules: Object.keys(initialPins).filter(path => !approvedChangedFiles.has(path)), truthTableChecks: combinations, configurationCases: configurations.length + 2,
  pairedDirectAndHardNegativeCases: failures.map(f => f.name), sourceScopeIsolation: 'PASS',
  review: ['Existing cluster endpoint obligations remain unchanged.', 'Configuration errors fail before scope applicability.',
    'Coverage does not create a prerequisite or a target. An actual requires route is still necessary.',
    'Explicit inventory eligibility needs assessed selected content and complete preparation/content within the actual learning basis.',
    'Canonical-stage applicability is distinct from jurisdiction-specific source-stage membership.'],
  limitations: ['This review does not certify final country source files, complete CQR execution, or main CI.'] }
writeFileSync(base + 'root-explicit-endpoints-final-nine-review.actual.json', JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report))
