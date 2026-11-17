import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';import {resolve} from 'node:path';import {routeProfileDefinitions,createRouteProfiles} from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts';import type {SkillLandscape} from '/home/enpasos/projects/skillpilot/app/src/landscapeTypes.ts';const repoRoot='/home/enpasos/projects/skillpilot',out='/home/enpasos/projects/skillpilot/tmp/pipeline/laender-stufen/gesamt/review/physics-goalbook-final-counters';const base=(p:string)=>JSON.parse(readFileSync(resolve(repoRoot,p),'utf8'));const rawLandscape=base('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json');const measured=base('tmp/pipeline/laender-stufen/gesamt/review/physics-goalbook-final-counters/counts.actual.json');const status=base('docs/qa-ci/status/curriculum-quality-status.json');const inputStatusHash=createHash('sha256').update(readFileSync(resolve(repoRoot,'docs/qa-ci/status/curriculum-quality-status.json'))).digest('hex');

const compareCodePoints = (left: string, right: string): number => {
  const leftPoints = Array.from(left, (value) => value.codePointAt(0) ?? 0)
  const rightPoints = Array.from(right, (value) => value.codePointAt(0) ?? 0)
  const length = Math.min(leftPoints.length, rightPoints.length)
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index]
  }
  return leftPoints.length - rightPoints.length
}
const LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const CURRICULUM_QUALITY_STATUS_PATH = 'docs/qa-ci/status/curriculum-quality-status.json'
const FINAL_SPLIT_CHILD_IDS = [
  '2084b7d4-300d-5fa0-8b8d-c480c40f853e',
  '3857891b-d328-585b-9936-85c7aff122ee',
  '3b586f2a-60e2-5019-aa08-6a47616a1f1f',
  '49bb609a-bfb7-5391-9120-f5fc737efb9a',
  '6dca3b0a-c872-543b-808f-97e855f5fafd',
  '6a73cacc-e86d-5248-a180-fd3da8454b0f',
  '3a4b2f86-5c59-5429-8fb4-75d9b2589cb5',
  '946ecf7b-0fcf-5776-9fb6-d397423c2f12',
]
const SEMICONDUCTOR_ADDED_GOAL_IDS = [
  '9f265f49-1342-5ba7-9c5d-54e97fdb2f19', // Elementary carrier/doping model.
  'dc55adac-91a5-5cc3-ab47-be008480616f', // Functional diode curve and polarity.
  '77ab31a9-8961-511c-8637-06e98023d869', // Actual transistor construction and investigation.
]
const SEMICONDUCTOR_ADDED_SEKI_ROUTE_TARGET_IDS = [
  ...SEMICONDUCTOR_ADDED_GOAL_IDS,
  '7badac4d-2874-5b3a-87e8-bf8f4440b2a6', // Existing qualitative classification, now explicit lower-stage target.
]
const EXPECTED_PHYSICS_SEKI_PROJECTED_ROUTE_TARGET_OCCURRENCES = 9167
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTED_TARGET_OCCURRENCES = 8739
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_OCCURRENCES = 428
const EXPECTED_PHYSICS_SEKI_PROFILE_SELECTOR_EXCLUDED_UNIQUE_GOALS = 57
const EXPECTED_PHYSICS_SEKI_ADDED_TARGET_OCCURRENCES = new Map([
  [FINAL_SPLIT_CHILD_IDS[0], 30], // p-n model: 25 prior + 5 new lower-view occurrences
  [FINAL_SPLIT_CHILD_IDS[1], 24], // diode experiment: 20 + 4
  [FINAL_SPLIT_CHILD_IDS[2], 12], // rectifier: 10 + 2
  ['7d4d6a39-0c78-5fb0-b7bf-182ed00972f7', 6], // transistor: 5 + 1
  ['68034218-8f3e-5f7f-ae4e-ed057dd4e44e', 6], // reactor: 5 + 1
])
function validate(context?:{status:any,rows:any[]}){const readJson=<T>(p:string):T=>structuredClone(p===CURRICULUM_QUALITY_STATUS_PATH?(context?.status??status):base(p));const applicabilityCompilation:any=null;const evaluateRouteProfile=(physics:any,profile:any)=>{const id=physics.goals.filter(profile.goalSelector).map((g:any)=>g.id);assert.equal(id.length,1);const row=(context?.rows??measured.rows).find((r:any)=>r.id===id[0]);assert(row,'missing measurement');return {rules:[{id:'CQR-104',metrics:{...row.allRule.metrics,visibleProfileSelectedAtomicGoalOccurrences:row.totalOccurrences}}]};};
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

}

validate();const cases=[];const mutate=(name:string,change:(c:any)=>void)=>{const c={status:structuredClone(status),rows:structuredClone(measured.rows)};change(c);let error='';try{validate(c)}catch(e){error=String(e)}assert(error,name);cases.push({name,rejected:true,error});};
const rule=(c:any)=>c.status.curricula.find((x:any)=>x.landscapeId===LANDSCAPE_ID).scopes.find((x:any)=>x.scopeId==='canonical-physics-sek1').rules.find((x:any)=>x.id==='CQR-104');
for(const key of ['visibleProjectedRouteTargetGoalOccurrences','visibleProfileSelectedAtomicGoalOccurrences','visibleProjectedRouteTargetGoalOccurrencesExcludedByProfileSelector','uniqueProjectedRouteTargetsExcludedByProfileSelector','visibleSelectedAtomicGoalOccurrences','visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks'])mutate('wrong '+key,c=>{rule(c).metrics[key]+=1});
mutate('one of five goal counts lowered',c=>{c.rows[0].totalOccurrences-=1});
mutate('compensating counts still sum78 but wrong identity',c=>{c.rows[0].totalOccurrences+=1;c.rows[1].totalOccurrences-=1});
mutate('existing route failure labelled pass',c=>{rule(c).metrics.visibleSelectedGoalOccurrencesMissingDirectTerminalRoute=1;rule(c).metrics.profileSelectorExcludedGoalOccurrencesMissingDirectTerminalRoute=1});
mutate('failed route status',c=>{rule(c).status='fail'});
mutate('selector mismatch hidden by aggregate',c=>{rule(c).metrics.profileSelectorExcludedGoalOccurrencesMissingDirectTerminalRoute=1});
assert.equal(createHash('sha256').update(readFileSync(resolve(repoRoot,'app/scripts/testPhysicsGoalBookInputs.ts'))).digest('hex'),'29a788499049c9a23cb16ea8533a7aada8d588a1ceecb2872d80af18192bc471');
writeFileSync(out+'/counter-negatives.actual.json',JSON.stringify({status:'PASS',testSha256:'29a788499049c9a23cb16ea8533a7aada8d588a1ceecb2872d80af18192bc471',qualityStatusSha256:inputStatusHash,measuredCountsFileSha256:createHash('sha256').update(readFileSync(out+'/counts.actual.json')).digest('hex'),positive:true,negativeMutations:cases},null,2)+'\n');console.log(JSON.stringify({status:'PASS',negativeMutations:cases.length,testSha256:'29a788499049c9a23cb16ea8533a7aada8d588a1ceecb2872d80af18192bc471',qualityStatusSha256:inputStatusHash}));
