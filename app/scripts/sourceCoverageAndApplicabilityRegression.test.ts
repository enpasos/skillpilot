import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverActiveMemoryCardReviewConfigs } from './memoryCardReviewConfigDiscovery'
import {
  buildApplicabilityCompilation,
  getAllJsonFiles,
  hasOnlyPartialMappingSourceEvidence,
  intersectApplicabilityJurisdictions,
} from './applicabilityCompiler'
import {
  createReviewedRequiresClosureCoverageChecker,
  sourceCoverageSurrogateKey,
  type SourceCoverageGoalLike,
} from './sourceCoverageEvidence'
import { collectAuthoritativeTargetAtomicGoalIds } from './compositionViewSourceCoverage'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'

const LANDSCAPE = 'landscape'
const JURISDICTION = 'DE-HE'
const directEvidence = [{
  kind: 'mapping',
  dimension: 'jurisdiction',
  value: JURISDICTION,
  source: 'review.json',
}]
const requiredByEvidence = (goalId: string) => [{
  kind: 'requires-closure',
  dimension: 'jurisdiction',
  value: JURISDICTION,
  source: `required by ${goalId}`,
}]
const ordinary = (goalId: string, evidence = directEvidence): SourceCoverageGoalLike => ({
  goalId,
  goalType: 'atomic',
  evidence,
})
const entry = (goalId: string, requiredByGoalId: string) => ({
  landscapeId: LANDSCAPE,
  goalId,
  jurisdiction: JURISDICTION,
  requiredByGoalId,
})
const isEligible = (goal: { kind: string } | undefined) => goal?.kind === 'ordinary'

test('active Memory evidence resolves a successor outside the authoring directory and cannot weaken required visibility', () => {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  mkdirSync(join(repoRoot, 'tmp'), { recursive: true })
  const root = mkdtempSync(join(repoRoot, 'tmp', 'memory-evidence-discovery-'))
  const local = (path: string) => relative(repoRoot, join(root, path))
  const write = (path: string, value: unknown) => {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), JSON.stringify(value))
  }
  try {
    const config = {
      reviewId: 'memory-review', landscapeId: 'fixture-landscape',
      landscapePath: local('landscape.json'), ruleVersion: 'memory-card-review-v1',
      scope: { label: 'Whole fixture', rootGoalIds: ['root'] },
      visibilityScopes: [{ label: 'Checked view', viewPath: local('view.json') }],
      reviewPath: local('legacy/old.records.jsonl'), reportPath: local('legacy/old.md'),
    }
    write('landscape.json', { landscapeId: config.landscapeId })
    write('legacy/old.config.json', config)
    write('successor/current.config.json', { ...config, reviewPath: local('successor/current.records.jsonl'), reportPath: local('successor/current.md'), visibilityScopeCoverageRequired: true })
    write('registry.json', { subjects: [{ landscapePath: config.landscapePath, memoryReviewConfigPath: local('successor/current.config.json') }] })
    const selected = discoverActiveMemoryCardReviewConfigs(local('legacy'), local('registry.json'))
    assert.equal(selected.length, 1)
    assert.equal(selected[0].configPath, local('successor/current.config.json'))
    assert.equal(selected[0].reportPath, local('successor/current.md'))
    // The same route must fail closed if a previously mandatory coverage check
    // is disabled, rather than silently falling back to historical evidence.
    write('legacy/old.config.json', { ...config, visibilityScopeCoverageRequired: true })
    write('successor/current.config.json', { ...config, visibilityScopeCoverageRequired: false })
    assert.throws(() => discoverActiveMemoryCardReviewConfigs(local('legacy'), local('registry.json')), /required visibility coverage/)
    write('successor/current.config.json', config)
    assert.throws(() => discoverActiveMemoryCardReviewConfigs(local('legacy'), local('registry.json')), /required visibility coverage/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('curriculum discovery excludes QA snapshots while keeping live source and mapping inputs', () => {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-curriculum-discovery-'))
  try {
    const paths = [
      'DE/Gymnasium/canonical/live.de.json',
      'DE/Gymnasium/mapping/DE-HE/live.review.json',
      'DE/Gymnasium/quality/goal-evidence/candidate/mapping/DE-HE/snapshot.json',
      'DE/Gymnasium/quality/goal-evidence/candidate/canonical/snapshot.de.json',
      'DE/Gymnasium/quality-backup/mapping/DE-HE/live.json',
    ]
    paths.forEach((file) => {
      const absolute = join(root, file)
      mkdirSync(join(absolute, '..'), { recursive: true })
      writeFileSync(absolute, JSON.stringify({ landscapeId: 'same-live-id', goals: [] }))
    })
    assert.deepEqual(getAllJsonFiles(root).map((file) => relative(root, file)).sort(), [
      paths[0], paths[1], paths[4],
    ].sort())
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('active Memory support follows the final origin scope after prerequisite closure', () => {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  const reports = new Map(buildApplicabilityCompilation().reports.map((report) => [report.landscapeId, report]))
  let checkedRelationships = 0
  let originsExtendedByPrerequisites = 0
  const memorySupportIdsByLandscape = new Map<string, Set<string>>()
  for (const configRef of discoverActiveMemoryCardReviewConfigs()) {
    const config = JSON.parse(readFileSync(resolve(repoRoot, configRef.configPath), 'utf8')) as {
      landscapeId: string; reviewId: string; reviewPath: string
    }
    const report = reports.get(config.landscapeId)
    assert(report, `Missing current applicability report for ${config.landscapeId}`)
    const goals = new Map(report.goals.map((goal) => [goal.goalId, goal]))
    const records = readFileSync(resolve(repoRoot, config.reviewPath), 'utf8').split(/\r?\n/).filter(Boolean)
    for (const line of records) {
      const record = JSON.parse(line) as { status: string; goalId: string; memoryGoalIds?: string[] }
      if (record.status !== 'memory_required') continue
      const origin = goals.get(record.goalId)
      assert(origin, `Missing Memory origin ${record.goalId}`)
      const originScope = origin.compiledApplicability.jurisdiction ?? []
      if (originScope.some((value) => origin.evidence.some((e) => e.value === value && e.kind === 'requires-closure')
        && !origin.evidence.some((e) => e.value === value && ['mapping', 'provenance', 'override'].includes(e.kind)))) {
        originsExtendedByPrerequisites++
      }
      for (const supportId of record.memoryGoalIds ?? []) {
        const supportIds = memorySupportIdsByLandscape.get(config.landscapeId) ?? new Set<string>()
        supportIds.add(supportId)
        memorySupportIdsByLandscape.set(config.landscapeId, supportIds)
        const support = goals.get(supportId)
        assert(support, `Missing Memory support ${supportId}`)
        for (const value of originScope) {
          assert(support.compiledApplicability.jurisdiction?.includes(value), `${supportId} loses final ${value} origin scope`)
          assert(support.evidence.some((e) => e.value === value && e.kind === 'memory-review-origin'
            && e.source === `${config.reviewId}:${record.goalId} (${config.reviewPath})`),
          `${supportId} has no active Memory-origin evidence for ${value}`)
        }
        checkedRelationships++
      }
    }
  }
  assert(checkedRelationships > 0, 'The active Memory corpus must exercise origin relationships')
  assert(originsExtendedByPrerequisites > 0, 'The active corpus must exercise origin scope growth during prerequisite closure')
  const floorPolicy = JSON.parse(readFileSync(resolve(repoRoot, 'app/scripts/config/curriculum-maturity-floor-policy.json'), 'utf8')) as {
    floors: Array<{ landscapeId: string; minimumMaturity: string }>
  }
  const protectedLandscapes = new Set(floorPolicy.floors
    .filter((floor) => /^M[67]$/.test(floor.minimumMaturity))
    .map((floor) => floor.landscapeId))
  for (const [landscapeId, supportIds] of memorySupportIdsByLandscape) {
    if (!protectedLandscapes.has(landscapeId)) continue
    const staleBindings = reports.get(landscapeId)!.findings
      .filter((finding) => finding.code === 'APV-203' && supportIds.has(finding.goalId ?? ''))
    assert.deepEqual(staleBindings, [], `Committed Memory scopes must match their final reviewed origins in ${landscapeId}`)
  }
})

function checker(
  goals: SourceCoverageGoalLike[],
  canonicalKinds: Record<string, string>,
  routes: Array<[string, string]>,
) {
  const surrogateEntriesByKey = new Map<string, ReturnType<typeof entry>[]>()
  for (const [goalId, requiredByGoalId] of routes) {
    surrogateEntriesByKey.set(
      sourceCoverageSurrogateKey(LANDSCAPE, goalId, JURISDICTION),
      [entry(goalId, requiredByGoalId)],
    )
  }
  return createReviewedRequiresClosureCoverageChecker({
    landscapeId: LANDSCAPE,
    jurisdiction: JURISDICTION,
    goals,
    canonicalGoalById: new Map(Object.entries(canonicalKinds).map(([id, kind]) => [id, { kind }])),
    surrogateEntriesByKey,
    isEligibleCanonicalGoal: isEligible,
  })
}

test('applicabilityFromRequires uses all-of intersection semantics', () => {
  assert.deepEqual(intersectApplicabilityJurisdictions([
    { jurisdiction: ['DE-BY', 'DE-HE'] },
    { jurisdiction: ['DE-HE'] },
  ]), ['DE-HE'])
  assert.deepEqual(intersectApplicabilityJurisdictions([
    { jurisdiction: ['DE-BY'] },
    { jurisdiction: ['DE-HE'] },
  ]), [])
  assert.deepEqual(intersectApplicabilityJurisdictions([{ jurisdiction: ['DE-BY'] }]), ['DE-BY'])
  assert.deepEqual(intersectApplicabilityJurisdictions([{ jurisdiction: ['DE-BY'] }, {}]), [])
  assert.deepEqual(intersectApplicabilityJurisdictions([]), [])
})

test('inherited ordinary prerequisites preserve applicability after atomic materialization', () => {
  const owner = 'applicability-inherited-requires-fixture'
  const foreign = 'applicability-foreign-parent-fixture'
  const makeGoal = (
    id: string, contains: string[] = [], requires: string[] = [], jurisdiction?: string,
  ): LearningGoal => ({
    id, title: id, description: id, weight: 1, contains, requires,
    dimensionTags: { framework: 'test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'J8' },
    ...(jurisdiction ? { extendedData: { applicabilityOverrides: { jurisdiction: [jurisdiction] } } } : {}),
  })
  for (const withForeignAncestors of [false, true]) {
    const inherited: SkillLandscape[] = [{
      landscapeId: owner, locale: 'de-DE', title: 'Inherited requires', description: 'Fixture',
      goals: [
        { ...makeGoal('root', ['C', 'P', 'unrelated']), tags: ['root'] },
        makeGoal('C', ['a'], ['P']), makeGoal('a', [], [], 'DE-BY'),
        makeGoal('P', ['b']), makeGoal('b', [], [], 'DE-HE'), makeGoal('unrelated', [], [], 'DE-HE'),
      ],
    }]
    if (withForeignAncestors) {
      inherited[0].goals[0].contains.push('b2', 'b3')
      inherited[0].goals.push(makeGoal('b2', [], [], 'DE-HE'), makeGoal('b3', [], [], 'DE-HE'))
      inherited.push({
        landscapeId: foreign, locale: 'de-DE', title: 'Foreign ancestors', description: 'Fixture',
        goals: [
          { ...makeGoal('ancestor', ['parent'], ['ancestor-prerequisite']), tags: ['root'] },
          makeGoal('parent', [`${owner}:a`], ['P']),
          makeGoal('P', [`${owner}:b2`]), makeGoal('ancestor-prerequisite', [`${owner}:b3`]),
        ],
      })
    }
    const materialized = structuredClone(inherited)
    materialized[0].goals.find(goal => goal.id === 'C')!.requires = []
    materialized[0].goals.find(goal => goal.id === 'a')!.requires = withForeignAncestors ? ['b', 'b2', 'b3'] : ['b']
    if (withForeignAncestors) {
      materialized[1].goals.find(goal => goal.id === 'ancestor')!.requires = []
      materialized[1].goals.find(goal => goal.id === 'parent')!.requires = []
    }
    const compile = (landscapes: SkillLandscape[]) => buildApplicabilityCompilation(landscapes.map(landscape => ({
      file: join(tmpdir(), `${landscape.landscapeId}.json`), landscape,
    }))).reports
    const inheritedReports = compile(inherited), materializedReports = compile(materialized)
    const values = (reports: typeof inheritedReports) => reports.flatMap(report => report.goals.map(goal => ({
      key: `${report.landscapeId}:${goal.goalId}`, compiledApplicability: goal.compiledApplicability,
    })))
    assert.deepEqual(values(inheritedReports), values(materializedReports))
    const goals = new Map(inheritedReports.find(report => report.landscapeId === owner)!.goals.map(goal => [goal.goalId, goal]))
    for (const id of withForeignAncestors ? ['b', 'b2', 'b3'] : ['b']) {
      assert.deepEqual(goals.get(id)!.compiledApplicability.jurisdiction, ['DE-BY', 'DE-HE'])
      assert.ok(goals.get(id)!.evidence.some(e => e.value === 'DE-BY' && e.kind === 'requires-closure'))
      assert.ok(!goals.get(id)!.evidence.some(e => e.value === 'DE-BY' && ['mapping', 'provenance', 'override'].includes(e.kind)))
    }
    assert.deepEqual(goals.get('unrelated')!.compiledApplicability.jurisdiction, ['DE-HE'])
  }
})

test('source coverage visibility follows composition target roles, not requires-closure applicability', () => {
  const makeGoal = (
    id: string,
    contains: string[] = [],
    tags: string[] = [],
  ): LearningGoal => ({
    id,
    title: id,
    description: id,
    weight: 1,
    tags,
    dimensionTags: {
      framework: 'test',
      demandLevel: 'AB1',
      processCompetencies: [],
      guidingIdeas: [],
      phase: 'J8',
    },
    requires: [],
    contains,
  })
  const landscape: SkillLandscape = {
    landscapeId: LANDSCAPE,
    locale: 'de-DE',
    title: 'Test',
    description: 'Test',
    goals: [
      makeGoal('root', ['target-cluster', 'support', 'closure-only'], ['root']),
      makeGoal('target-cluster', ['target']),
      makeGoal('target'),
      makeGoal('support'),
      makeGoal('closure-only'),
    ],
  }
  const view = {
    viewId: 'test-view',
    landscapeId: LANDSCAPE,
    scope: { schoolForm: 'Gymnasium', jurisdiction: JURISDICTION },
    rootNodes: [{
      kind: 'structure',
      id: 'test-root',
      label: 'Test',
      children: [
        { kind: 'canonicalSubtree', goalId: 'target-cluster' },
        { kind: 'goalEntry', goalId: 'support', projectionRole: 'prerequisiteOnly' },
      ],
    }],
  }

  assert.deepEqual(
    [...collectAuthoritativeTargetAtomicGoalIds(landscape, view)].sort(),
    ['target'],
  )
})

test('APV-202 is based only on source evidence', () => {
  const partial = { kind: 'mapping', dimension: 'jurisdiction', value: 'DE-BY', source: 'partial.json', mappingStrength: 'partial' as const }
  const closure = { kind: 'requires-closure', dimension: 'jurisdiction', value: 'DE-BY', source: 'required by x' }
  const exact = { kind: 'mapping', dimension: 'jurisdiction', value: 'DE-BY', source: 'exact.json', mappingStrength: 'exact' as const }
  const provenance = { kind: 'provenance', dimension: 'jurisdiction', value: 'DE-BY', source: 'registry.json' }
  assert.equal(hasOnlyPartialMappingSourceEvidence([partial, closure], 'DE-BY'), true)
  assert.equal(hasOnlyPartialMappingSourceEvidence([partial, exact, closure], 'DE-BY'), false)
  assert.equal(hasOnlyPartialMappingSourceEvidence([partial, provenance, closure], 'DE-BY'), false)
})

test('ordinary direct and recursive ordinary source coverage pass', () => {
  const direct = ordinary('direct')
  const middle = ordinary('middle', requiredByEvidence('direct'))
  const start = ordinary('start', requiredByEvidence('middle'))
  const coverage = checker(
    [direct, middle, start],
    { direct: 'ordinary', middle: 'ordinary', start: 'ordinary' },
    [['middle', 'direct'], ['start', 'middle']],
  )
  assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(direct), true)
  assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(start), true)
})

function currentGraphChecker(
  requires: Record<string, string[]>,
  goals = [ordinary('carrier'), ordinary('middle', requiredByEvidence('carrier')),
    ordinary('target', requiredByEvidence('middle'))],
  routes = [entry('target', 'carrier')],
  kinds: Record<string, string> = {},
) {
  const surrogateEntriesByKey = new Map<string, ReturnType<typeof entry>[]>()
  for (const route of routes) {
    const key = sourceCoverageSurrogateKey(LANDSCAPE, 'target', JURISDICTION)
    surrogateEntriesByKey.set(key, [...(surrogateEntriesByKey.get(key) ?? []), route])
  }
  return createReviewedRequiresClosureCoverageChecker({
    landscapeId: LANDSCAPE, jurisdiction: JURISDICTION, goals,
    canonicalGoalById: new Map(Object.entries(requires).map(([id, prerequisites]) =>
      [id, { kind: kinds[id] ?? 'ordinary', requires: prerequisites }])),
    surrogateEntriesByKey,
    isEligibleCanonicalGoal: isEligible,
    getCanonicalRequires: (goal) => goal.requires,
  })
}

test('reviewed source coverage survives real atomic transitive reduction', () => {
  const makeGoal = (id: string, requires: string[]): LearningGoal => ({
    id, title: id, description: id, weight: 1, contains: [], requires,
    dimensionTags: { framework: 'test', demandLevel: 'AB1', processCompetencies: [], guidingIdeas: [], phase: 'J8' },
    ...(id === 'carrier'
      ? { extendedData: { applicabilityOverrides: { jurisdiction: [JURISDICTION] } } } : {}),
  })
  const landscape: SkillLandscape = {
    landscapeId: LANDSCAPE, locale: 'de-DE', title: 'Source path', description: 'Fixture',
    goals: [makeGoal('carrier', ['middle', 'target']), makeGoal('middle', ['target']), makeGoal('target', [])],
  }
  for (const reduced of [false, true]) {
    landscape.goals[0].requires = reduced ? ['middle'] : ['middle', 'target']
    const report = buildApplicabilityCompilation([{ file: join(tmpdir(), 'source-path.json'), landscape }]).reports[0]
    const target = report.goals.find(goal => goal.goalId === 'target')!
    assert.equal(target.evidence.some(evidence => evidence.kind === 'requires-closure'
      && evidence.source === 'required by carrier'), !reduced)
    // Only the carrier's source evidence is supplied directly; applicability
    // overrides are intentionally not accepted as source coverage.
    const goals = report.goals.map(goal => goal.goalId === 'carrier'
      ? { ...goal, evidence: [...goal.evidence, ...directEvidence] } : goal)
    const coverage = currentGraphChecker(
      Object.fromEntries(landscape.goals.map(goal => [goal.id, goal.requires])), goals,
    )
    assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(target), true,
      `The same accepted carrier/target relationship must survive reduced=${reduced}`)
  }
})

test('current source paths reject stale evidence, invalid references, and non-atomic hops', () => {
  const target = ordinary('target', [...requiredByEvidence('middle'), ...requiredByEvidence('carrier')])
  const goals = [ordinary('carrier'), ordinary('middle', requiredByEvidence('carrier')), target]
  for (const reference of ['absent', 'foreign:middle', ':middle', `${LANDSCAPE}:middle:extra`, '', 'carrier']) {
    const coverage = currentGraphChecker({ carrier: [reference], middle: ['target'], target: [] }, goals)
    assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(target), false, reference)
  }
  for (const requires of [
    { carrier: [], middle: ['target'], target: [] },
    { carrier: ['middle'], middle: [], target: ['carrier'] },
    { carrier: ['middle'], middle: ['carrier'], target: [] },
    { carrier: ['middle'], middle: ['target'], target: ['carrier'] },
  ]) {
    assert.equal(currentGraphChecker(requires, goals).hasCoverageBackedJurisdictionEvidence(target), false)
  }
  const throughCluster = goals.map(goal => goal.goalId === 'middle' ? { ...goal, goalType: 'cluster' } : goal)
  assert.equal(currentGraphChecker({ carrier: ['middle'], middle: ['target'], target: [] }, throughCluster)
    .hasCoverageBackedJurisdictionEvidence(target), false)
  const localQualified = currentGraphChecker({ carrier: [`${LANDSCAPE}:middle`], middle: ['target'], target: [] }, goals)
  assert.equal(localQualified.hasCoverageBackedJurisdictionEvidence(target), true)
})

test('current source paths retain the exact reviewed relationship and jurisdiction', () => {
  const requires = { carrier: ['middle'], middle: ['target'], target: [] }
  const target = ordinary('target', requiredByEvidence('middle'))
  assert.equal(currentGraphChecker(requires, undefined, []).hasCoverageBackedJurisdictionEvidence(target), false)
  for (const route of [
    { ...entry('target', 'carrier'), landscapeId: 'foreign' },
    { ...entry('target', 'carrier'), goalId: 'other' },
    { ...entry('target', 'carrier'), jurisdiction: 'DE-BY' },
    entry('target', 'middle'),
  ]) {
    assert.equal(currentGraphChecker(requires, undefined, [route])
      .hasCoverageBackedJurisdictionEvidence(target), false)
  }
  const wrongJurisdiction = [ordinary('carrier'), ordinary('middle', requiredByEvidence('carrier')),
    ordinary('target', requiredByEvidence('middle').map(evidence => ({ ...evidence, value: 'DE-BY' })))]
  assert.equal(currentGraphChecker(requires, wrongJurisdiction).hasCoverageBackedJurisdictionEvidence(target), false)
})

test('current source paths preserve carrier qualification and recursive source backing', () => {
  const requires = { carrier: ['middle'], middle: ['target'], target: [] }
  const target = ordinary('target', requiredByEvidence('middle'))
  for (const kind of ['assessment', 'practice', 'examData']) {
    assert.equal(currentGraphChecker(requires, undefined, undefined, { carrier: kind })
      .hasCoverageBackedJurisdictionEvidence(target), false)
    assert.equal(currentGraphChecker(requires, undefined, undefined, { middle: kind })
      .hasCoverageBackedJurisdictionEvidence(target), true)
  }
  const unbacked = [ordinary('carrier', []), ordinary('middle', [...requiredByEvidence('carrier'), ...directEvidence]), target]
  assert.equal(currentGraphChecker(requires, unbacked).hasCoverageBackedJurisdictionEvidence(target), false)
  // Eligibility constrains the fixed reviewed carrier. Preserve the existing
  // accepted endpoint behavior (including legacy motivation bridges).
  assert.equal(currentGraphChecker(requires, undefined, undefined, { target: 'motivation' })
    .hasCoverageBackedJurisdictionEvidence(target), true)
  const direct = ordinary('direct')
  const carrier = ordinary('carrier', requiredByEvidence('direct'))
  const middle = ordinary('middle', requiredByEvidence('carrier'))
  const coverage = createReviewedRequiresClosureCoverageChecker({
    landscapeId: LANDSCAPE, jurisdiction: JURISDICTION, goals: [direct, carrier, middle, target],
    canonicalGoalById: new Map(Object.entries({ direct: ['carrier'], ...requires })
      .map(([id, prerequisites]) => [id, { kind: 'ordinary', requires: prerequisites }])),
    surrogateEntriesByKey: new Map([
      [sourceCoverageSurrogateKey(LANDSCAPE, 'target', JURISDICTION), [entry('target', 'carrier')]],
      [sourceCoverageSurrogateKey(LANDSCAPE, 'carrier', JURISDICTION), [entry('carrier', 'direct')]],
    ]),
    isEligibleCanonicalGoal: isEligible,
    getCanonicalRequires: (goal) => goal.requires,
  })
  assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(target), true)
})

test('structural assessment and memory hops do not become source carriers', () => {
  type CanonicalPathGoal = Pick<LearningGoal, 'requires' | 'tags' | 'nodeKind'>
  const carrier = ordinary('carrier')
  const middle = ordinary('middle', requiredByEvidence('carrier'))
  const target = ordinary('target', requiredByEvidence('middle'))
  const eligible = (goal: CanonicalPathGoal | undefined) => !!goal
    && goal.nodeKind !== 'memory'
    && !(goal.tags ?? []).some(tag => ['Assessment', 'Practice', 'memorization'].includes(tag)
      || tag.startsWith('srs-deck:'))
  for (const internalGoal of [
    { requires: ['target'], tags: ['Assessment'] },
    { requires: ['target'], tags: ['Practice'] },
    { requires: ['target'], nodeKind: 'memory' as const, tags: ['memorization', 'srs-deck:fixture'] },
  ]) {
    assert.equal(eligible(internalGoal), false)
    const canonicalGoalById = new Map<string, CanonicalPathGoal>([
      ['carrier', { requires: ['middle'] }], ['middle', internalGoal], ['target', { requires: [] }],
    ])
    const makeCoverage = () => createReviewedRequiresClosureCoverageChecker({
      landscapeId: LANDSCAPE, jurisdiction: JURISDICTION, goals: [carrier, middle, target],
      canonicalGoalById,
      surrogateEntriesByKey: new Map([
        [sourceCoverageSurrogateKey(LANDSCAPE, 'target', JURISDICTION), [entry('target', 'carrier')]],
      ]),
      isEligibleCanonicalGoal: eligible,
      getCanonicalRequires: (goal) => goal.requires,
    })
    assert.equal(makeCoverage().hasCoverageBackedJurisdictionEvidence(target), true)
    assert.equal(makeCoverage().hasCoverageBackedJurisdictionEvidence(middle), false)
    canonicalGoalById.set('carrier', { ...internalGoal, requires: ['middle'] })
    assert.equal(makeCoverage().hasCoverageBackedJurisdictionEvidence(target), false)
  }
})

test('missing, cyclic, and cluster requiredBy routes fail closed', () => {
  const missing = ordinary('missing', requiredByEvidence('absent'))
  const cycleA = ordinary('cycle-a', requiredByEvidence('cycle-b'))
  const cycleB = ordinary('cycle-b', requiredByEvidence('cycle-a'))
  const clusterCarrier = { ...ordinary('cluster', directEvidence), goalType: 'cluster' }
  const throughCluster = ordinary('through-cluster', requiredByEvidence('cluster'))
  const coverage = checker(
    [missing, cycleA, cycleB, clusterCarrier, throughCluster],
    {
      missing: 'ordinary',
      'cycle-a': 'ordinary',
      'cycle-b': 'ordinary',
      cluster: 'ordinary',
      'through-cluster': 'ordinary',
    },
    [
      ['missing', 'absent'],
      ['cycle-a', 'cycle-b'],
      ['cycle-b', 'cycle-a'],
      ['through-cluster', 'cluster'],
    ],
  )
  assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(missing), false)
  assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(cycleA), false)
  assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(throughCluster), false)

  const reportOnlyCarrier = ordinary('report-only-carrier', directEvidence)
  const throughMissingCanonical = ordinary(
    'through-missing-canonical',
    requiredByEvidence('report-only-carrier'),
  )
  const missingCanonicalCoverage = checker(
    [reportOnlyCarrier, throughMissingCanonical],
    { 'through-missing-canonical': 'ordinary' },
    [['through-missing-canonical', 'report-only-carrier']],
  )
  assert.equal(
    missingCanonicalCoverage.hasCoverageBackedJurisdictionEvidence(throughMissingCanonical),
    false,
  )
})

test('assessment, practice, examData, and chains through them fail closed', () => {
  for (const nonCurricularKind of ['assessment', 'practice', 'examData']) {
    const carrier = ordinary(`carrier-${nonCurricularKind}`, directEvidence)
    const start = ordinary(`start-${nonCurricularKind}`, requiredByEvidence(carrier.goalId))
    const coverage = checker(
      [carrier, start],
      { [carrier.goalId]: nonCurricularKind, [start.goalId]: 'ordinary' },
      [[start.goalId, carrier.goalId]],
    )
    assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(start), false)
  }

  const direct = ordinary('terminal-direct')
  const assessment = ordinary('assessment-hop', requiredByEvidence('terminal-direct'))
  const start = ordinary('ordinary-start', requiredByEvidence('assessment-hop'))
  const coverage = checker(
    [direct, assessment, start],
    { 'terminal-direct': 'ordinary', 'assessment-hop': 'assessment', 'ordinary-start': 'ordinary' },
    [['assessment-hop', 'terminal-direct'], ['ordinary-start', 'assessment-hop']],
  )
  assert.equal(coverage.hasCoverageBackedJurisdictionEvidence(start), false)
})
