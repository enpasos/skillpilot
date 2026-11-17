const curriculumQualityStatus = readJson<{
  curricula: Array<{
    landscapeId: string
    scopes: Array<{
      scopeId: string
      rules: Array<{
        id: string
        status: string
        metrics?: Record<string, number>
      }>
    }>
  }>
}>(CURRICULUM_QUALITY_STATUS_PATH)
const physicsQuality = curriculumQualityStatus.curricula.find(({ landscapeId }) => landscapeId === LANDSCAPE_ID)
assert(physicsQuality, 'curriculum-quality status lacks canonical Physics')
const physicsSekIRouteScope = physicsQuality.scopes.find(({ scopeId }) => scopeId === 'canonical-physics-sek1')
assert(physicsSekIRouteScope, 'curriculum-quality status lacks canonical Physics Sek-I route scope')
const routeProjectionRule = physicsSekIRouteScope.rules.find(({ id }) => id === 'CQR-104')
assert(routeProjectionRule, 'curriculum-quality status lacks Physics Sek-I CQR-104')
assert.equal(routeProjectionRule.status, 'pass', 'current acquisition routes must retain the protected Physics quality floor')
const routeMetrics = routeProjectionRule.metrics ?? {}
const legacyRouteProfile = routeProfileDefinitions.find(profile => profile.profileId === 'canonical-physics-sek1')!
const currentRouteProfile = createRouteProfiles(repoRoot).find(profile => profile.profileId === legacyRouteProfile.profileId)!
const currentPhysics = rawLandscape as unknown as SkillLandscape
const legacySelectedGoalIds = currentPhysics.goals.filter(legacyRouteProfile.goalSelector).map(goal => goal.id)
const currentSelectedGoalIds = currentPhysics.goals.filter(currentRouteProfile.goalSelector).map(goal => goal.id)
assert.equal(legacySelectedGoalIds.length, 99)
assert.deepEqual(
  [...currentSelectedGoalIds].sort(compareCodePoints),
  [...legacySelectedGoalIds, ...EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES.keys(),
    ...SEMICONDUCTOR_ADDED_SEKI_ROUTE_TARGET_IDS,
    '8aff7aac-321b-5172-ac55-877876bfd2cd',
    'f6b1d812-ce8b-5852-b417-e6c29b533c7a',
    'b615830a-e8b0-5754-81e0-99da98343a8d',
    'f23fdfa9-38b6-5157-8301-ed302476c456',
    '75b9ca4c-178e-5df2-adc4-f7f78e9d28e5',
    '691c11d0-fa6a-5d2e-a19c-086e89c3c233',
    '72effc66-87f4-5f5e-8d36-1547677365fb',
    'd8b2b349-b83a-5225-a180-1afe205750cd',
  ].sort(compareCodePoints),
  'The current shared Physics Sek-I lane retains the reviewed split/semiconductor targets and the eight reviewed stage-plan additions',
)
const addedTargetOccurrences = new Map([...EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES.keys()].map(goalId => {
  const measured = evaluateRouteProfile(currentPhysics, {
    ...currentRouteProfile, goalSelector: goal => goal.id === goalId,
  }, applicabilityCompilation).rules.find(rule => rule.id === 'CQR-104')!
  return [goalId, measured.metrics?.visibleProfileSelectedAtomicGoalOccurrences]
}))
assert.deepEqual(
  addedTargetOccurrences,
  EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES,
  'The 78 selected occurrences retain exactly the five reviewed targets across the expanded view inventory',
)
assert.equal([...addedTargetOccurrences.values()].reduce((sum, count) => sum + (count ?? 0), 0), 78)
assert.equal(
  routeMetrics.visibleProjectedRouteTargetGoalOccurrences,
  EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES,
  'Physics Sek-I CQR-104 must count every resolved learner-facing target occurrence',
)
assert.equal(
  routeMetrics.visibleProfileSelectedAtomicGoalOccurrences,
  EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES,
)
assert.equal(
  routeMetrics.visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector,
  EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES,
  'The profile selector diagnostic must retain every remaining tag/phase mismatch after the five-target correction',
)
assert.equal(
  routeMetrics.uniqueProjectedRouteTargetsExcludedByProfileSelector,
  EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS,
)
assert.equal(
  (routeMetrics.visibleProfileSelectedAtomicGoalOccurrences ?? 0)
    + (routeMetrics.visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector ?? 0),
  routeMetrics.visibleProjectedRouteTargetGoalOccurrences,
)
assert.equal(
  routeMetrics.visibleSelectedAtomicGoalOccurrences,
  routeMetrics.visibleProjectedRouteTargetGoalOccurrences,
  'Every projected route target occurrence must enter the route checks',
)
assert.equal(
  routeMetrics.visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks,
  0,
  'CQR-104 must fail closed if any projected route target escapes route checks',
)
for (const suffix of [
  'EffectiveMotivationRoute',
  'DirectMotivationRoute',
  'EffectiveTerminalRoute',
  'DirectTerminalRoute',
] as const) {
  assert.equal(
    routeMetrics[`profileSelectorExcludedGoalOccurrencesMissing${suffix}`],
    routeMetrics[`visibleSelectedGoalOccurrencesMissing${suffix}`],
    `Known Physics Sek-I projection-local ${suffix} failures must not be removed by profile preselection`,
  )
}
const hasProjectionRouteFailure = [
  'visibleSelectedGoalOccurrencesMissingEffectiveMotivationRoute',
  'visibleSelectedGoalOccurrencesMissingDirectMotivationRoute',
  'visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute',
  'visibleSelectedGoalOccurrencesMissingDirectTerminalRoute',
].some((metric) => (routeMetrics[metric] ?? 0) > 0)
assert.equal(
  routeProjectionRule.status,
  hasProjectionRouteFailure ? 'fail' : 'pass',
  'Physics Sek-I CQR-104 status must reflect all projection-local route failures',
)
