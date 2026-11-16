// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { diagnoseStagePlanLearningFlow, MAX_STAGE_PLAN_DIAGNOSIS_SCOPES } from '../src/utils/stagePlanReport'
import { PLAN_COMPOSITION_SCHEMA, STAGE_PLAN_SCHEMA, validateStagePlanCatalog, type StagePlan, type StagePlanGoal } from '../src/utils/stagePlan'

function fixture() {
  const goals = new Map<string, StagePlanGoal>([
    ['p', { id: 'p', type: 'atomic', requires: ['foreign:bridge'] }],
    ['bridge', { id: 'bridge', type: 'atomic', requires: ['q'] }],
    ...['q', 't', 'x', 'm', 'unused'].map(id => [id, { id, type: 'atomic', requires: [] }] as [string, StagePlanGoal]),
  ])
  goals.set('foreign:bridge', goals.get('bridge')!)
  const plan: StagePlan = {
    $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId: 'declared-plan',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', durationModel: 'G9' },
    rootUnit: { id: 'root', label: 'Plan', children: ['early', 'late'] },
    units: [
      { id: 'early', label: 'Not a stage heuristic', kind: 'stage', stage: 'SekI', parentUnitId: 'root', after: [] },
      { id: 'late', label: 'Another arbitrary label', kind: 'stage', stage: 'SekII', parentUnitId: 'root', after: ['early'] },
    ],
    subjectViews: ['math', 'physics'].flatMap(landscapeId => ['GK', 'LK'].map(courseProfile => ({ landscapeId, courseProfile, viewId: `${landscapeId}-${courseProfile}` }))),
  }
  const view = (landscapeId: string, courseProfile: string, early: string[], late: string[]) => ({
    $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: `${landscapeId}-${courseProfile}`,
    landscapeId, language: 'de', scope: { ...plan.scope, courseProfile, stage: 'CrossStage' },
    planBinding: { planId: plan.planId }, rootNodes: [early, late].map((ids, index) => ({
      kind: 'structure', id: `structure-${index}`, label: `Arbitrary ${index}`, planUnitId: index ? 'late' : 'early',
      children: ids.map(goalId => ({ kind: 'goalEntry', goalId })),
    })),
  })
  const views = [view('physics', 'GK', ['p'], ['t']), view('physics', 'LK', ['x'], ['t']), view('math', 'GK', ['m'], []), view('math', 'LK', ['m'], ['q'])]
  return { plans: [plan], views, goals }
}
const input = fixture(), before = JSON.stringify([...input.goals])
const beforeDeclarations = JSON.stringify({ plans: input.plans, views: input.views })
const report = diagnoseStagePlanLearningFlow(input)
assert.equal(report.status, 'backflows-present')
assert.equal(report.scopes.length, 15, 'Two subjects each offer GK, LK, GK+LK or omission; every nonempty selection is checked.')
const profile = (scope: typeof report.scopes[number], subject: string) => scope.subjectSelections
  .filter(value => value.landscapeId === subject).map(value => value.courseProfile).join('+') || '-'
const selection = (scope: typeof report.scopes[number]) => `${profile(scope, 'math')}/${profile(scope, 'physics')}`
assert.deepEqual(new Set(report.scopes.map(selection)), new Set([
  '-/GK', '-/LK', '-/GK+LK', 'GK/-', 'LK/-', 'GK+LK/-',
  'GK/GK', 'GK/LK', 'GK/GK+LK', 'LK/GK', 'LK/LK', 'LK/GK+LK',
  'GK+LK/GK', 'GK+LK/LK', 'GK+LK/GK+LK',
]), 'The checked inventory includes mixed courses, combined courses and every subject subset.')
const affected = report.scopes.filter(scope => scope.transitiveBackflows.length)
assert.deepEqual(new Set(affected.map(selection)), new Set(['LK/GK', 'LK/GK+LK', 'GK+LK/GK', 'GK+LK/GK+LK']))
for (const scope of affected) {
  assert.deepEqual(scope.directBackflows.map(item => item.witnessPath), [['bridge', 'q']])
  assert.deepEqual(scope.transitiveBackflows.map(item => item.witnessPath), [['p', 'bridge', 'q']])
}
const bothGk = report.scopes.find(scope => selection(scope) === 'GK/GK')!
assert.equal(bothGk.directBackflows.length, 0)
assert.deepEqual(bothGk.preparation.map(item => [item.goalId, item.planUnitId]), [['bridge', 'early'], ['q', 'early']])
assert.equal(bothGk.learningBasisCount, bothGk.targetCount + 2)
assert(!bothGk.preparation.some(item => item.goalId === 'unused'))
assert.equal(JSON.stringify([...input.goals]), before, 'Diagnosis never writes graph or learner state.')
assert.equal(JSON.stringify({ plans: input.plans, views: input.views }), beforeDeclarations, 'Enumerating subsets and unions never rewrites declared authorities or views.')

// Each course alone is valid: q is inferred early preparation for GK and a
// later own target in LK. Their real union must expose p -> bridge -> q.
const unionOnly = fixture()
unionOnly.plans[0].subjectViews = unionOnly.plans[0].subjectViews.filter(subject => subject.landscapeId === 'physics')
unionOnly.views = unionOnly.views.filter(view => view.landscapeId === 'physics')
unionOnly.views.find(view => view.scope.courseProfile === 'LK')!.rootNodes[1].children.push({ kind: 'goalEntry', goalId: 'q' })
const unionReport = diagnoseStagePlanLearningFlow(unionOnly)
assert.equal(unionReport.status, 'backflows-present')
assert.equal(unionReport.scopes.length, 3)
assert.equal(unionReport.scopes.filter(scope => scope.transitiveBackflows.length).length, 1)
const onlyAffectedUnion = unionReport.scopes.find(scope => scope.transitiveBackflows.length)!
assert.equal(profile(onlyAffectedUnion, 'physics'), 'GK+LK')
assert.deepEqual(onlyAffectedUnion.transitiveBackflows.map(item => item.witnessPath), [['p', 'bridge', 'q']])
assert(unionReport.scopes.filter(scope => profile(scope, 'physics') !== 'GK+LK').every(scope => scope.transitiveBackflows.length === 0))

const singleCourses = fixture()
singleCourses.plans[0].subjectViews = singleCourses.plans[0].subjectViews.filter(subject => subject.courseProfile === 'GK')
singleCourses.views = singleCourses.views.filter(view => view.scope.courseProfile === 'GK')
const singleCourseReport = diagnoseStagePlanLearningFlow(singleCourses)
assert.equal(singleCourseReport.scopes.length, 3)
assert(singleCourseReport.scopes.every(scope => scope.subjectSelections.every(subject => subject.courseProfile === 'GK')),
  'An absent LK authority never creates an LK or GK+LK offering.')

const withAll = structuredClone(unionOnly)
const allView = structuredClone(withAll.views.find(view => view.viewId === 'physics-LK')!)
allView.viewId = 'physics-ALL'; allView.scope.courseProfile = 'ALL'
allView.rootNodes[1].children = allView.rootNodes[1].children.filter(node => node.goalId !== 'q')
withAll.views.push(allView)
withAll.plans[0].subjectViews.push({ landscapeId: 'physics', courseProfile: 'ALL', viewId: 'physics-ALL' })
const allReport = diagnoseStagePlanLearningFlow(withAll)
assert.equal(allReport.status, 'backflows-present')
assert.equal(allReport.scopes.length, 4)
assert.deepEqual(new Set(allReport.scopes.map(scope => profile(scope, 'physics'))), new Set(['GK', 'LK', 'ALL', 'GK+LK']))
assert.deepEqual(allReport.scopes.filter(scope => scope.transitiveBackflows.length).map(scope => profile(scope, 'physics')), ['GK+LK'],
  'A separately authored ALL view cannot conceal the real GK+LK union backflow.')

const explicitCombined = structuredClone(withAll)
const combinedView = structuredClone(allView)
combinedView.viewId = 'physics-combined'; combinedView.scope.courseProfile = 'GK+LK'
explicitCombined.views.push(combinedView)
explicitCombined.plans[0].subjectViews.push({ landscapeId: 'physics', courseProfile: 'GK+LK', viewId: combinedView.viewId })
const explicitReport = diagnoseStagePlanLearningFlow(explicitCombined)
assert.equal(explicitReport.scopes.length, 4)
assert.equal(explicitReport.status, 'no-stage-backflows')
assert.deepEqual(explicitReport.scopes.filter(scope => profile(scope, 'physics') === 'GK+LK').map(scope => scope.subjectSelections.map(authority => authority.viewId)), [['physics-combined']],
  'Only an exact GK+LK authority takes precedence over the fallback union; ALL remains separate.')

const lowerCaseProfiles = structuredClone(unionOnly)
for (const authority of lowerCaseProfiles.plans[0].subjectViews) authority.courseProfile = authority.courseProfile.toLowerCase()
for (const view of lowerCaseProfiles.views) view.scope.courseProfile = view.scope.courseProfile.toLowerCase()
const lowerCaseReport = diagnoseStagePlanLearningFlow(lowerCaseProfiles)
assert.equal(lowerCaseReport.status, 'backflows-present')
assert.equal(lowerCaseReport.scopes.length, 3, 'Unique normalized course authorities retain their real fallback union.')

for (const original of [unionOnly, withAll, explicitCombined]) {
  const aliased = structuredClone(original)
  const originalView = aliased.views.find(view => view.scope.courseProfile === (original === unionOnly ? 'GK' : original === withAll ? 'ALL' : 'GK+LK'))!
  const aliasView = structuredClone(originalView)
  aliasView.viewId += '-alias'; aliasView.scope.courseProfile = aliasView.scope.courseProfile.toLowerCase()
  aliased.views.push(aliasView)
  aliased.plans[0].subjectViews.push({ landscapeId: 'physics', courseProfile: aliasView.scope.courseProfile, viewId: aliasView.viewId })
  assert.deepEqual(validateStagePlanCatalog(aliased).findings, [], 'The raw-profile catalog contract still permits this alias input.')
  const aliasReport = diagnoseStagePlanLearningFlow(aliased)
  assert.equal(aliasReport.status, 'invalid-input')
  assert.deepEqual(aliasReport.scopes, [], 'Ambiguous runtime-normalized authorities cannot produce a partial passing report.')
  assert(aliasReport.findings.some(finding => finding.code === 'SPR-PROFILE-ALIAS'))
}

const twoContexts = fixture(), g8 = fixture()
g8.plans[0].planId = 'separate-g8-fixture'; g8.plans[0].scope.durationModel = 'G8'
for (const authority of g8.plans[0].subjectViews) authority.viewId = `g8-${authority.viewId}`
for (const view of g8.views) {
  view.viewId = `g8-${view.viewId}`; view.scope.durationModel = 'G8'; view.planBinding.planId = 'separate-g8-fixture'
}
twoContexts.plans.push(g8.plans[0]); twoContexts.views.push(...g8.views)
const contexts = diagnoseStagePlanLearningFlow(twoContexts)
assert.equal(contexts.scopes.length, 30)
assert(contexts.scopes.every(scope => scope.subjectSelections.every(subject => subject.viewId.startsWith('g8-') === (scope.durationModel === 'G8'))),
  'Selections never mix authorities from separate Land/duration contexts.')
twoContexts.views.find(view => view.viewId === 'g8-math-GK')!.scope.durationModel = 'G9'
assert.equal(diagnoseStagePlanLearningFlow(twoContexts).status, 'invalid-input', 'A scope mismatch cannot acquire synthetic valid combinations.')
const wrongLand = fixture()
wrongLand.views[0].scope.jurisdiction = 'DE-BB'
assert.equal(diagnoseStagePlanLearningFlow(wrongLand).status, 'invalid-input', 'A different Land view never joins this plan context.')

// Isolated operational-bound fixtures. They declare their actual offerings;
// they establish no real curriculum, source or native runtime acceptance.
function budgetFixture(subjectCount: number, planId: string, jurisdiction: string, durationModel: string, profiles = ['GK', 'LK']) {
  const scope = { schoolForm: 'Gymnasium', jurisdiction, durationModel }
  const authorities = Array.from({ length: subjectCount }, (_, index) => `subject-${index}`)
    .flatMap(landscapeId => profiles.map(courseProfile => ({ landscapeId, courseProfile, viewId: `${planId}-${landscapeId}-${courseProfile}` })))
  const plan: StagePlan = { $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId, scope,
    rootUnit: { id: 'root', label: 'Isolated budget fixture', children: ['early', 'late'] },
    units: [
      { id: 'early', label: 'Early', kind: 'stage', stage: 'SekI', parentUnitId: 'root', after: [] },
      { id: 'late', label: 'Late', kind: 'stage', stage: 'SekII', parentUnitId: 'root', after: ['early'] },
    ], subjectViews: authorities }
  const views = authorities.map(authority => ({ $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1',
    viewId: authority.viewId, landscapeId: authority.landscapeId, language: 'de', scope: { ...scope, courseProfile: authority.courseProfile, stage: 'CrossStage' },
    planBinding: { planId }, rootNodes: ['early', 'late'].map((id, index) => ({ kind: 'structure', id, label: id, planUnitId: id,
      children: index ? [] : [{ kind: 'goalEntry', goalId: 'budget-goal' }] })) }))
  return { plan, views }
}
const budgetGoals = new Map<string, StagePlanGoal>([['budget-goal', { id: 'budget-goal', title: 'Isolated fixture atom', type: 'atomic' }]])
const budgetCatalog = (...fixtures: ReturnType<typeof budgetFixture>[]) => ({
  plans: fixtures.map(value => value.plan), views: fixtures.flatMap(value => value.views), goals: budgetGoals,
})
assert.equal(MAX_STAGE_PLAN_DIAGNOSIS_SCOPES, 1024)
const lastAllowed = budgetFixture(5, 'budget-large', 'DE-HE', 'G9') // 4^5 - 1 = 1023
const oneMore = budgetFixture(1, 'budget-one', 'DE-HE', 'G8', ['GK']) // 1
const boundaryReport = diagnoseStagePlanLearningFlow(budgetCatalog(lastAllowed, oneMore))
assert.equal(boundaryReport.status, 'no-stage-backflows')
assert.equal(boundaryReport.scopes.length, 1024, 'The exact complete-report boundary is accepted without dropping selections.')
const extra = budgetFixture(1, 'budget-extra', 'DE-BB', 'G9', ['GK'])
const overByOne = diagnoseStagePlanLearningFlow(budgetCatalog(lastAllowed, oneMore, extra))
assert.equal(overByOne.status, 'invalid-input')
assert.deepEqual(overByOne.scopes, [])
assert(overByOne.findings.some(finding => finding.code === 'SPR-SELECTION-LIMIT' && finding.message.includes('1025') && finding.message.includes('1024')))
const oversizedLatePlan = budgetFixture(6, 'z-oversized', 'DE-BB', 'G9')
const noPartialReport = diagnoseStagePlanLearningFlow(budgetCatalog(oneMore, oversizedLatePlan))
assert.equal(noPartialReport.status, 'invalid-input')
assert.deepEqual(noPartialReport.scopes, [], 'A later oversized plan must never leave a passing prefix of earlier plan scopes.')
const beyondNumberPrecision = diagnoseStagePlanLearningFlow(budgetCatalog(budgetFixture(40, 'huge-exact-count', 'DE-HE', 'G9')))
assert.equal(beyondNumberPrecision.status, 'invalid-input')
assert.deepEqual(beyondNumberPrecision.scopes, [])
assert(beyondNumberPrecision.findings.some(finding => finding.code === 'SPR-SELECTION-LIMIT' && finding.message.includes(String(4n ** 40n - 1n))),
  'Exact BigInt preflight rejects a huge product before trying to enumerate it.')
const allBudget = diagnoseStagePlanLearningFlow(budgetCatalog(budgetFixture(5, 'all-exact-count', 'DE-HE', 'G9', ['GK', 'LK', 'ALL'])))
assert.equal(allBudget.status, 'invalid-input')
assert.deepEqual(allBudget.scopes, [])
assert(allBudget.findings.some(finding => finding.code === 'SPR-SELECTION-LIMIT' && finding.message.includes('3124')),
  'ALL remains separate from GK+LK also in exact preflight: five choices per subject yield 5^5 - 1 selections.')
const reversed = fixture()
reversed.plans[0].subjectViews.reverse(); reversed.views.reverse()
assert.deepEqual(diagnoseStagePlanLearningFlow(reversed), report, 'Inventory iteration order does not change diagnoses.')

const corrected = fixture()
corrected.goals.get('bridge')!.requires = []
assert.equal(diagnoseStagePlanLearningFlow(corrected).status, 'no-stage-backflows')
const missing = fixture()
missing.goals.get('unused')!.requires = ['absent']
assert.equal(diagnoseStagePlanLearningFlow(missing).status, 'invalid-input', 'Unknown references outside current views still invalidate the supplied graph.')
assert.equal(diagnoseStagePlanLearningFlow(missing).scopes.length, 0)
const cycle = fixture()
cycle.goals.get('q')!.requires = ['p']
assert.equal(diagnoseStagePlanLearningFlow(cycle).status, 'invalid-input')
const clustered = fixture()
clustered.goals.get('q')!.type = 'cluster'
assert.equal(diagnoseStagePlanLearningFlow(clustered).status, 'invalid-input')
assert.equal(diagnoseStagePlanLearningFlow({ plans: [], views: [], goals: new Map() }).status, 'invalid-input', 'Empty inventories cannot turn the diagnostic green.')
const wronglyQualified = fixture()
wronglyQualified.goals.get('p')!.requires = ['wrong:bridge']
assert.equal(diagnoseStagePlanLearningFlow(wronglyQualified).status, 'invalid-input')
const hiddenCycle = fixture()
hiddenCycle.goals.set('hidden1', { id: 'hidden1', type: 'cluster', contains: ['hidden2'] })
hiddenCycle.goals.set('hidden2', { id: 'hidden2', type: 'cluster', contains: ['hidden1'] })
assert.equal(diagnoseStagePlanLearningFlow(hiddenCycle).status, 'invalid-input')
const hiddenMissing = fixture()
hiddenMissing.goals.set('hidden', { id: 'hidden', type: 'cluster', contains: ['absent'] })
assert.equal(diagnoseStagePlanLearningFlow(hiddenMissing).status, 'invalid-input')
const invalidType = fixture()
invalidType.goals.get('unused')!.type = 'unknown'
assert.equal(diagnoseStagePlanLearningFlow(invalidType).status, 'invalid-input')
const invalidAtomic = fixture()
invalidAtomic.goals.get('unused')!.contains = ['m']
assert.equal(diagnoseStagePlanLearningFlow(invalidAtomic).status, 'invalid-input')
const emptyTargets = fixture()
emptyTargets.views.forEach(view => view.rootNodes.forEach(node => { node.children = [] }))
assert.equal(diagnoseStagePlanLearningFlow(emptyTargets).status, 'invalid-input')
emptyTargets.goals.clear()
assert.equal(diagnoseStagePlanLearningFlow(emptyTargets).status, 'invalid-input')
const ordered = fixture()
ordered.goals.set('other', { id: 'other', type: 'atomic', requires: ['q'] })
ordered.goals.get('p')!.requires = ['foreign:bridge', 'other']
const firstOrder = diagnoseStagePlanLearningFlow(ordered)
ordered.goals.get('p')!.requires = ['other', 'foreign:bridge']
assert.deepEqual(diagnoseStagePlanLearningFlow(ordered), firstOrder, 'Permutation of unordered prerequisite edges preserves preparation and backflow witnesses.')
console.log('Declared stage-plan learning-flow diagnosis passed: independent subject/course selections, distinct ALL and GK+LK, fail-closed profile aliases, exact BigInt resource boundary, direct/transitive witnesses, preparation closure and invalid graph/context cases.')
