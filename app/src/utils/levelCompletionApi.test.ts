import assert from 'node:assert/strict'
import { requestClaudeV1Start } from '../coachVariants/claudeV1/request'
import {
  buildCompletionAssessmentStartHref,
  buildCompletionRouteStartHref,
  completionNotice,
  completionWaiversForTree,
  completionUnavailableReason,
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
for (const changes of [{ requiredAssessmentCount: 3 }, { requiredAssessmentCount: null }, { targetCount: -1 }]) {
  assert.throws(() => parseLevelCompletion({ ...valid, profileOptions: [{ ...profileOption, ...changes }] }))
}
const explanation = { goalId: 'A', title: { de: 'Vorbereitung' }, ruleId: 'static-rule',
  assessments: [{ goalId: 'Q', title: { de: 'Prüfung' } }], assessmentCount: 1 }
assert.deepEqual(parseLevelCompletion({ ...valid, waiverDetails: [explanation] })?.waiverDetails, [explanation])
assert.throws(() => parseLevelCompletion({ ...valid, waiverDetails: [{ ...explanation, goalId: 'outside-scope' }] }))
assert.throws(() => parseLevelCompletion({ ...valid, waiverDetails: [{ ...explanation, assessmentCount: 0 }] }))
assert.throws(() => parseLevelCompletion({ ...valid, waiverDetails: [explanation, explanation] }))

const choice = { profileId: 'profile:math', goalId: 'goal/1', expectedRevision: 4 }
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
