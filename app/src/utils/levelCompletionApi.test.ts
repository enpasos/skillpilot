import assert from 'node:assert/strict'
import { requestClaudeV1Start } from '../coachVariants/claudeV1/request'
import { getGoalNavigationSearch, getSessionStartSearch } from './learnerProfile'
import {
  buildCompletionAssessmentStartHref,
  buildCompletionRouteStartHref,
  completionNotice,
  completionAssessmentsForGoal,
  completionWaiversForTree,
  completionUnavailableReason,
  hasActiveCompletionRoute,
  LevelCompletionApiError,
  parseLevelCompletion,
  readCompletionAssessmentStart,
  requestLevelCompletionAction,
} from './levelCompletionApi'

const valid = {
  calculationStatus: 'valid', contextRef: 'context', profileId: 'profile', profileRevision: '1',
  curriculumGeneration: 'generation', learnerRevision: 4, title: { de: 'Abschnitt', en: 'Section' },
  complete: true, masteredTargetCount: 1, waivedTargetCount: 1, pendingTargetCount: 0, targetCount: 2,
  masteredAssessmentCount: 1, requiredAssessmentCount: 1, waivedTargetGoalIds: ['A'],
  assessments: [{ goalId: 'Q', title: { de: 'Prüfung', en: 'Assessment' }, mastered: true, startAvailable: false }],
  profileOptions: [], directAssessmentRunning: false, actions: [],
}
assert.equal(parseLevelCompletion(null), null)
assert.equal(parseLevelCompletion(undefined), null)
assert.equal(parseLevelCompletion(valid)?.masteredTargetCount, 1)
const treeCompletion = parseLevelCompletion({ ...valid, waiverDetails: [{
  goalId: 'A', title: { de: 'Vorbereitung' }, ruleId: 'rule', assessmentCount: 1,
  assessments: [{ goalId: 'Q', title: { de: 'Prüfung' } }],
}] })!
const originalTreeCompletion = JSON.stringify(treeCompletion)
assert.deepEqual([...completionWaiversForTree(treeCompletion, false).keys()], ['A'])
assert.equal(completionWaiversForTree(treeCompletion, false).get('A')?.assessments[0].goalId, 'Q')
assert.equal(completionWaiversForTree(treeCompletion, false).has('Q'), false, 'passed assessments are not waived goals')
assert.equal(completionWaiversForTree(treeCompletion, true).size, 0, 'stale snapshots must not annotate the tree')
assert.equal(completionWaiversForTree(null, false).size, 0)
for (const calculationStatus of ['invalid', 'unresolved', 'notApplicable', 'unavailable'] as const) {
  assert.equal(completionWaiversForTree({ ...treeCompletion, calculationStatus, complete: undefined }, false).size, 0)
}
assert.equal(completionWaiversForTree({ ...treeCompletion, profileId: undefined }, false).size, 0)
assert.equal(completionWaiversForTree({ ...treeCompletion, waivedTargetGoalIds: [] }, false).size, 0, 'details alone do not grant a waiver')
assert.deepEqual(completionWaiversForTree({ ...treeCompletion, waiverDetails: [] }, false).get('A')?.assessments, [],
  'bounded response details must not be filled in using unrelated assessments')
assert.equal(completionWaiversForTree({ ...treeCompletion, complete: false, targetCount: 3, pendingTargetCount: 1 }, false).size, 1,
  'valid waivers remain visible before the entire section is complete')
assert.equal(JSON.stringify(treeCompletion), originalTreeCompletion, 'annotations never change mastery or backend counts')
for (const changes of [
  { complete: false }, { masteredTargetCount: 2 }, { masteredAssessmentCount: 2 },
  { requiredAssessmentCount: 0 }, { learnerRevision: -1 },
  { waivedTargetGoalIds: ['A', 'A'] }, { calculationStatus: 'maybe' },
  { calculationStatus: 'unavailable' }, { actions: [{ action: 'bypass', title: { de: 'Unsafe' } }] },
]) assert.throws(() => parseLevelCompletion({ ...valid, ...changes }))
assert.equal(parseLevelCompletion({ ...valid, calculationStatus: 'unavailable', complete: null })?.complete, undefined)
assert.equal(parseLevelCompletion({ ...valid, calculationStatus: 'notApplicable', complete: undefined, profileId: null })?.profileId, undefined)
assert.deepEqual(parseLevelCompletion({ ...valid, calculationStatus: 'unresolved', complete: undefined, profileId: null, title: undefined })?.title, {})
assert.equal(parseLevelCompletion({ ...valid, navigationIntent: 'paused' })?.navigationIntent, 'paused')
assert.equal(parseLevelCompletion({ ...valid, actions: [{ action: 'pauseProfile', title: { de: 'Für heute beenden' } }] })?.actions[0].action, 'pauseProfile')
const profileOption = { profileId: 'next', title: { de: 'Abschnitt' }, targetCount: 2, requiredAssessmentCount: 1 }
assert.equal(parseLevelCompletion({ ...valid, profileOptions: [profileOption] })?.profileOptions[0].targetCount, 2)
assert.deepEqual(parseLevelCompletion({ ...valid, profileOptions: [profileOption] })?.profileOptions[0].assessments, [], 'legacy profile options remain readable')
const availableAssessment = { goalId: 'next-exam', title: { de: 'Prüfung' }, mastered: false, startAvailable: true }
const discovery = parseLevelCompletion({ ...valid, calculationStatus: 'notApplicable', complete: undefined, profileId: undefined,
  profileOptions: [{ ...profileOption, assessments: [availableAssessment] }] })!
assert.equal(completionAssessmentsForGoal(discovery, 'next-exam')[0].profileId, 'next')
assert.equal(completionAssessmentsForGoal(discovery, 'A').length, 0, 'a preparation goal is never inferred to be an assessment choice')
assert.equal(completionAssessmentsForGoal({ ...discovery, calculationStatus: 'unavailable' }, 'next-exam').length, 0)
assert.equal(completionAssessmentsForGoal({ ...parseLevelCompletion(valid)!, profileOptions: discovery.profileOptions }, 'next-exam').length, 0,
  'an existing route only exposes its own published assessments')
for (const assessments of [
  [availableAssessment, availableAssessment],
  [{ ...availableAssessment, mastered: true }],
  [{ ...availableAssessment, startAvailable: 'yes' }],
]) assert.throws(() => parseLevelCompletion({ ...valid, profileOptions: [{ ...profileOption, assessments }] }))
assert.equal(parseLevelCompletion({ ...valid, profileOptions: [{ ...profileOption, targetCount: 30, requiredAssessmentCount: 30,
  assessments: Array.from({ length: 30 }, (_, i) => ({ ...availableAssessment, goalId: `exam-${i}` })) }] })?.profileOptions[0].assessments?.length, 30,
  'Cockpit choices are complete; provider-specific output limits do not truncate its assessment list')
assert.equal(parseLevelCompletion({ ...valid,
  profileOptions: Array.from({ length: 30 }, (_, i) => ({ ...profileOption, profileId: `profile-${i}` })) })?.profileOptions.length, 30)
for (const changes of [{ requiredAssessmentCount: 3 }, { requiredAssessmentCount: null }, { targetCount: -1 }]) {
  assert.throws(() => parseLevelCompletion({ ...valid, profileOptions: [{ ...profileOption, ...changes }] }))
}
const explanation = { goalId: 'A', title: { de: 'Vorbereitung' }, ruleId: 'static-rule',
  assessments: [{ goalId: 'Q', title: { de: 'Prüfung' } }], assessmentCount: 1 }
assert.deepEqual(parseLevelCompletion({ ...valid, waiverDetails: [explanation] })?.waiverDetails, [explanation])
assert.throws(() => parseLevelCompletion({ ...valid, waiverDetails: [{ ...explanation, goalId: 'outside-scope' }] }))
assert.throws(() => parseLevelCompletion({ ...valid, waiverDetails: [{ ...explanation, assessmentCount: 0 }] }))
assert.throws(() => parseLevelCompletion({ ...valid, waiverDetails: [explanation, explanation] }))

const implicit = parseLevelCompletion({ ...valid, profileId: 'automatic:personal-curriculum',
  masteredTargetCount: 0, waivedTargetCount: 1500, targetCount: 1500,
  requiredAssessmentCount: 0, masteredAssessmentCount: 0, assessments: [],
  waivedTargetGoalIds: Array.from({ length: 1500 }, (_, i) => `implicit-${i}`),
  waiverDetails: [{ goalId: 'implicit-0', title: { de: 'Nicht mehr benötigtes Ziel' },
    ruleId: 'no_remaining_demand', assessments: [], assessmentCount: 0 }],
  profileOptions: [{ profileId: 'automatic:section', title: { de: 'Abschnitt ohne Abschlussprüfung' },
    targetCount: 2, requiredAssessmentCount: 0, assessments: [] }],
})!
assert.equal(implicit.complete, true, 'an automatic scope may have no completion assessments')
assert.equal(hasActiveCompletionRoute(implicit), false, 'a read-only automatic evaluation does not own navigation')
assert.equal(hasActiveCompletionRoute({ ...implicit, navigationIntent: 'required' }), true)
assert.equal(hasActiveCompletionRoute({ ...implicit, navigationIntent: 'paused' }), true)
assert.equal(hasActiveCompletionRoute({ ...implicit, directAssessmentRunning: true }), true)
assert.equal(hasActiveCompletionRoute(treeCompletion), true, 'legacy selected profiles retain their route semantics')
assert.equal(hasActiveCompletionRoute(null), false)
assert.equal(completionWaiversForTree(implicit, false).size, 1500, 'the full scope remains annotatable beyond old preview limits')
assert.equal(completionWaiversForTree(implicit, false).get('implicit-1499')?.reason, 'no_remaining_demand',
  'automatic scope annotations never invent assessment coverage when details are bounded')
assert.deepEqual(completionWaiversForTree(implicit, false).get('implicit-0')?.assessments, [])
assert.throws(() => parseLevelCompletion({ ...implicit, waiverDetails: [{ ...implicit.waiverDetails![0],
  assessments: [{ goalId: 'Q', title: { de: 'Erfundene Prüfung' } }] }] }),
  'zero supporting assessments cannot claim an assessment title')

const supportAssessments = [1, 2].map(index => ({ goalId: `support-exam-${index}`, title: { de: `Prüfung ${index}` },
  mastered: false, startAvailable: false, unavailableReason: 'assessment_outside_personal_curriculum' }))
const externalAssessmentScope = parseLevelCompletion({ ...valid, profileId: 'automatic:small-section', complete: false,
  masteredTargetCount: 0, waivedTargetCount: 0, pendingTargetCount: 1, targetCount: 1, waivedTargetGoalIds: [],
  masteredAssessmentCount: 0, requiredAssessmentCount: 2, assessments: supportAssessments,
  profileOptions: [{ profileId: 'automatic:small-section', title: { de: 'Kleiner Abschnitt' }, targetCount: 1,
    requiredAssessmentCount: 2, assessments: supportAssessments }] })!
assert.equal(externalAssessmentScope.requiredAssessmentCount, 2,
  'assessment obligations may belong to the full prerequisite context beyond the counted targets')
assert.equal(externalAssessmentScope.profileOptions[0].requiredAssessmentCount, 2)
assert.match(completionUnavailableReason('assessment_outside_personal_curriculum', 'de'), /außerhalb deines Personal Curriculums/u)
assert.match(completionUnavailableReason('assessment_outside_personal_curriculum', 'en'), /outside your Personal Curriculum/u)

const choice = { profileId: 'profile:math', goalId: 'goal/1', expectedRevision: 4 }
const handoffSearch = '?completionShortcuts=1&learnerId=private&token=private&completionRevision=4&completionProfile=old&completionGoal=old'
assert.equal(getSessionStartSearch('math', 'learner', handoffSearch), '?l=math&completionShortcuts=1',
  'login preserves only the harmless discovery intent, never identity, session tokens or a launch grant')
assert.equal(getSessionStartSearch('', 'learner', '?completionShortcuts=0'), '')
assert.equal(getSessionStartSearch('math', 'trainer', handoffSearch), '?l=math')
const routeSearch = new URLSearchParams('l=math&f=GK&completionShortcuts=1')
assert.equal(getGoalNavigationSearch(routeSearch, 'exam', 'exam').toString(), routeSearch.toString(),
  'automatic same-goal navigation cannot consume the initial handoff before rendering')
assert.equal(getGoalNavigationSearch(routeSearch, 'exam', 'next-goal').toString(), 'l=math&f=GK',
  'ordinary goal navigation retains scope but does not reopen discovery')
assert.equal(routeSearch.get('completionShortcuts'), '1', 'navigation never mutates the current router query')
assert.equal(buildCompletionRouteStartHref(), '/?start=coach')
assert.match(buildCompletionRouteStartHref('math'), /completionRoute=math/u)
assert.equal(readCompletionAssessmentStart(buildCompletionRouteStartHref('math')), null, 'ordinary completion route does not grant direct assessment entry')
const href = buildCompletionAssessmentStartHref(choice)
assert.match(href, /^\/\?start=coach&/u)
assert.deepEqual(readCompletionAssessmentStart(href.slice(href.indexOf('?'))), choice)
const retryChoice = { ...choice, restartCurrent: true as const }
assert.deepEqual(readCompletionAssessmentStart(buildCompletionAssessmentStartHref(retryChoice).split('?')[1]), retryChoice)
assert.equal(readCompletionAssessmentStart('?start=coach'), null)
for (const search of [
  '?completionProfile=p',
  '?completionProfile=p&completionGoal=q&completionRevision=-1',
  '?completionProfile=p&completionGoal=q&completionRevision=1e3',
  '?completionProfile=p&completionGoal=q&completionRevision=9007199254740992',
  '?completionProfile=p&completionProfile=other&completionGoal=q&completionRevision=4',
  '?completionProfile=p&completionGoal=q&completionRevision=4&completionRetry=0',
  '?completionProfile=p&completionGoal=q&completionRevision=4&completionRetry=1&completionRetry=1',
]) assert.throws(() => readCompletionAssessmentStart(search))

for (const code of ['completion_generation_changed', 'completion_profile_changed']) {
  assert.match(completionNotice(code, 'de'), /aktualisiert/u)
  assert.match(completionNotice(code, 'en'), /progress is retained/u)
  assert.doesNotMatch(completionNotice(code, 'de'), /Persönlichen Lehrplan/u)
  assert.doesNotMatch(completionNotice(code, 'en'), /Personal Curriculum/u)
}
assert.match(completionNotice('completion_scope_changed', 'en'), /Personal Curriculum/u)
assert.match(completionNotice('completion_mastery_unavailable', 'de'), /Lernstand/u)
assert.doesNotMatch(completionNotice('internal-secret-or-new-code', 'de'), /internal|secret/u)
assert.match(completionUnavailableReason('assessment_running', 'en'), /already running/u)
assert.doesNotMatch(completionUnavailableReason('internal-secret-or-new-code', 'en'), /internal|secret/u)

const calls: { url: string; init?: RequestInit }[] = []
const state = { levelCompletion: valid, stateMachine: {} }
assert.deepEqual(await requestLevelCompletionAction(' learner/id ', {
  action: 'learnGoal', goalId: 'A', intent: 'voluntary',
}, 4, {
  apiBase: 'https://api.example.test/',
  fetchImpl: async (input, init) => {
    calls.push({ url: String(input), init })
    return new Response(JSON.stringify(state), { status: 200 })
  },
}), state)
assert.equal(calls[0].url, 'https://api.example.test/api/ui/learners/learner%2Fid/level-completion/actions')
assert.equal(calls[0].init?.credentials, 'include')
assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { action: 'learnGoal', goalId: 'A', intent: 'voluntary', expectedRevision: 4 })
await assert.rejects(() => requestLevelCompletionAction('id', { action: 'leaveProfile' }, 4, {
  fetchImpl: async () => new Response('private backend detail', { status: 409 }),
}), (error: unknown) => error instanceof LevelCompletionApiError && error.status === 409 && !error.message.includes('private'))
await assert.rejects(() => requestLevelCompletionAction('id', { action: 'leaveProfile' }, -1), /Invalid/u)

let launchBody: unknown
const session = `spc_${'A'.repeat(43)}`
await requestClaudeV1Start({ skillpilotId: 'learner', language: 'en', completionAssessment: choice }, {
  fetchImpl: async (_input, init) => {
    launchBody = JSON.parse(String(init?.body))
    return new Response(JSON.stringify({ prompt: `Start: ${session}`, webUrl: 'https://claude.ai/new', learningSessionId: session, expiresAt: '2027-01-01T00:00:00Z' }), { status: 200 })
  },
})
assert.deepEqual(launchBody, { communicationLocale: 'en', client: 'web-start', completionAssessment: choice }, 'assessment choice reaches the existing authenticated launch, not a separate early activation')
console.log('Level completion API tests passed.')
