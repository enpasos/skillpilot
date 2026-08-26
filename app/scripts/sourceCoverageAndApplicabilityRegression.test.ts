import assert from 'node:assert/strict'
import test from 'node:test'
import {
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
