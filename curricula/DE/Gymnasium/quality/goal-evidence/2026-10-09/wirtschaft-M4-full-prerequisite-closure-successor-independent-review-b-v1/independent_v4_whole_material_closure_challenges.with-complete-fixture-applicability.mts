import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [repo, capsule, output] = process.argv.slice(2)
const candidate = await import(pathToFileURL(join(capsule, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
const predecessor = await import(pathToFileURL(join(capsule, 'app/scripts/whole-predecessor.ts')).href)
const id = '605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const base = candidate.routeProfiles.find((profile: any) => profile.landscapeId === id)
const clone = (value: any) => JSON.parse(JSON.stringify(value))
const goal = (goalId: string, requires: string[] = [], tags = ['GK', 'LK']) => ({
  id: goalId, title: goalId, titleEn: goalId, description: goalId, descriptionEn: goalId,
  contains: [], requires, type: 'atomic', weight: 1, tags,
  dimensionTags: { framework: 'canonical-gymnasium-economics' },
})
const fixture = { landscapeId: id, title: 'Independent artificial machine-policy challenge', goals: [
  goal('m', [], ['GK', 'LK', 'Orientation']), goal('a', ['m']),
  goal('b', ['a', 'p']), goal('p', ['m']),
  { ...goal('t', ['b', 'p'], ['GK', 'LK', 'Practice', 'Assessment']),
    extendedData: { applicabilityFromRequires: true }, examData: { coveredGoalIds: ['a', 'b'] } },
  { id: 'terminal', title: 'terminal', description: 'terminal', contains: ['t'], requires: [], type: 'cluster', weight: 1, tags: ['GK', 'LK'] },
] }
const entry = (goalId: string, projectionRole = 'target') => ({ kind: 'goalEntry', goalId, projectionRole })
const view = { viewId: 'independent-machine-policy-whole-scope', landscapeId: id,
  scope: { schoolForm: 'Gymnasium', stage: 'CrossStage', jurisdiction: 'DE-BE', courseProfile: 'GK' },
  rootNodes: [{ kind: 'structure', id: 'whole-root', label: 'Independent whole view', children: [
    entry('m'), entry('a'), entry('b'), entry('p', 'prerequisiteOnly'), entry('t'),
  ] }],
}
const compilation = { reports: [{ landscapeId: id, goals: fixture.goals.map((g: any) => ({ goalId: g.id, compiledApplicability: { jurisdiction: ['DE-BE'] } })) }], summary: { supportedValues: ['DE-BE'] } }
const profile = { ...base, motivationAnchorGoalIds: ['m'], terminalAutonomyClusterIds: ['terminal'] }
const fixturePath = join(capsule, 'curricula/DE/Gymnasium/composition-views/wirtschaft/independent-fixture.view.json')
const outcomes: any[] = []
function check(name: string, curriculum: any = fixture, scope: any = view, expectation = 'fail') {
  writeFileSync(fixturePath, JSON.stringify(scope) + '\n')
  const actualFixtureCompilation = { ...compilation, reports: [{ landscapeId: id, goals: curriculum.goals.map((g: any) => ({ goalId: g.id, compiledApplicability: { jurisdiction: ['DE-BE'] } })) }] }
  const result = candidate.evaluateRouteProfile(curriculum, profile, actualFixtureCompilation)
  const rule = result.rules.find((row: any) => row.id === 'CQR-104')
  outcomes.push({ name, scientificallyExpectedScopeResult: expectation, actualScopeRule: rule,
    matchesExpected: rule.status === expectation, artificialFixtureNotCurriculumEvidence: true,
    wholeFixture: curriculum, wholeAuthoredView: scope })
  return rule
}
assert.equal(check('control: complete current local whole-material scope', fixture, view, 'pass').status, 'pass')
const foreign = clone(fixture)
foreign.goals.find((g: any) => g.id === 't').requires.push('different-landscape:foreign-required-goal')
check('negative: explicit foreign material prerequisite is outside the resolved local scope', foreign)
const hiddenTransitive = clone(fixture)
hiddenTransitive.goals.find((g: any) => g.id === 't').requires = ['b']
const absentP = clone(view)
absentP.rootNodes[0].children = absentP.rootNodes[0].children.filter((node: any) => node.goalId !== 'p')
check('challenge: hidden mandatory branch under a visible material prerequisite', hiddenTransitive, absentP)
const dangling = clone(fixture)
dangling.goals.find((g: any) => g.id === 't').requires.push('missing-local-hard-prerequisite')
check('negative: missing local explicit material prerequisite', dangling)
const foreignCovered = clone(fixture)
foreignCovered.goals.find((g: any) => g.id === 't').examData.coveredGoalIds.push('different-landscape:foreign-assessed-goal')
check('negative: foreign declared assessed goal', foreignCovered)
const staleCovered = clone(fixture)
staleCovered.goals.find((g: any) => g.id === 't').examData.coveredGoalIds.push('missing-current-goal')
check('negative: nonexistent declared assessed goal', staleCovered)


const inherited = clone(fixture)
inherited.goals.find((g: any) => g.id === 'b').requires = ['a']
inherited.goals.find((g: any) => g.id === 't').requires = ['b']
inherited.goals.push({ id: 'content-parent', title: 'parent', description: 'parent', type: 'cluster', contains: ['b'], requires: ['p'] })
const inheritedRule = check('negative: hidden content-ancestor inherited hard prerequisite', inherited, absentP)
assert(inheritedRule.metrics.wholeMaterialPrerequisiteOccurrencesMissingFromProjection > 0)
const clustered = clone(fixture)
clustered.goals.push(goal('q', ['m']))
clustered.goals.push({ id: 'mandatory-group', title: 'group', description: 'group', type: 'cluster', contains: ['p', 'q'], requires: [] })
clustered.goals.push({ id: 'material-parent', title: 'parent', description: 'parent', type: 'cluster', contains: ['t'], requires: ['mandatory-group'] })
const clusterRule = check('negative: hidden atom inside inherited mandatory prerequisite cluster', clustered)
assert(clusterRule.metrics.wholeMaterialPrerequisiteOccurrencesMissingFromProjection > 0)
const visibleCluster = clone(view)
visibleCluster.rootNodes[0].children.push(entry('q', 'prerequisiteOnly'))
assert.equal(check('control: complete inherited mandatory cluster with every atomic support visible', clustered, visibleCluster, 'pass').status, 'pass')
const unflaggedForeign = clone(foreign)
delete unflaggedForeign.goals.find((g: any) => g.id === 't').extendedData
assert.equal(check('negative: unflagged visible whole material still rejects unresolved foreign prerequisites', unflaggedForeign).status, 'fail')
for (const outcome of outcomes) assert(outcome.matchesExpected, outcome.name)

const current = JSON.parse(readFileSync(join(repo, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'), 'utf8'))
const actualViews: any[] = []
for (const file of readdirSync(join(repo, 'curricula/DE/Gymnasium/composition-views/wirtschaft')).filter((f) => f.endsWith('.view.json'))) {
  const path = join(repo, 'curricula/DE/Gymnasium/composition-views/wirtschaft', file)
  const authored = JSON.parse(readFileSync(path, 'utf8'))
  if (authored.scope.stage !== 'CrossStage') continue
  const filters = [authored.scope.courseProfile, authored.scope.durationModel].filter(Boolean)
  const rows: any[] = []
  for (const support of [false, true]) {
    const old = [...predecessor.collectRenderedAtomicGoalIdsFromCompositionView(current, path, filters, support)].sort()
    const next = [...candidate.collectRenderedAtomicGoalIdsFromCompositionView(current, path, filters, support, 'CrossStage')].sort()
    assert.deepEqual(next, old)
    rows.push({ includePrerequisiteOnly: support, beforeGoalIds: old, candidateGoalIds: next, exact: true })
  }
  actualViews.push({ file, rows })
}
assert.equal(actualViews.length, 34)
const foreignProfiles = (module: any) => module.routeProfiles.filter((p: any) => p.landscapeId !== id).map((p: any) => ({ ...p, goalSelector: p.goalSelector.toString(), clusterSelector: p.clusterSelector.toString() }))
assert.deepEqual(foreignProfiles(candidate), foreignProfiles(predecessor))
writeFileSync(output, JSON.stringify({ reviewAuthority: 'ai_candidate', codeReviewOnly: true,
  candidateInstrumentedByNamedExportsOnly: true, outcomes, actual34WholeProjectionComparisons: actualViews,
  allForeignProfileDefinitionsExact: true, protectedPackagesEdited: false, newScientificClosures: 0,
  strictNetGain: 0, overallM4Approval: false, humanApproval: false }, null, 2) + '\n')
console.log(JSON.stringify({ tests: outcomes.length, unexpected: outcomes.filter((r) => !r.matchesExpected).map((r) => r.name), actual34ViewsExact: true, allForeignProfileDefinitionsExact: true }))
