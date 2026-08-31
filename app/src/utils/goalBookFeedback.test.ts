import assert from 'node:assert/strict'
import {
  createGoalBookFeedbackSubmission,
  GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION,
  goalBookFeedbackContextUrl,
  goalBookFeedbackCurrentBindingUrl,
  goalBookFeedbackUrl,
  parseGoalBookFeedbackCurrentBinding,
  parseGoalBookFeedbackLinkBinding,
  parseGoalBookFeedbackResolvedContext,
  parseGoalBookFeedbackSubmissionReceipt,
  requestCurrentGoalBookFeedbackBinding,
} from './goalBookFeedback'

const digest = `sha256:${'a'.repeat(64)}`
const otherDigest = `sha256:${'b'.repeat(64)}`
const manifestDigest = `sha256:${'c'.repeat(64)}`
const search = new URLSearchParams({
  bookId: 'de-gym-mathematik-bundesweit',
  goalId: '11111111-1111-4111-8111-111111111111',
  edition: 'curricular-atomic-v1',
  goalFingerprint: digest,
  pageFingerprint: otherDigest,
  bookDigest: manifestDigest,
  page: '42',
}).toString()

const binding = parseGoalBookFeedbackLinkBinding(`?${search}`)
assert(binding)
assert.equal(new URL(goalBookFeedbackContextUrl(binding), 'https://skillpilot.test').searchParams.get('goalId'), binding.goalId)
const feedbackUrl = new URL(goalBookFeedbackUrl(binding), 'https://skillpilot.test')
assert.equal(feedbackUrl.pathname, '/lernziel-feedback')
assert.deepEqual([...feedbackUrl.searchParams.keys()].sort(), [
  'bookDigest',
  'bookId',
  'edition',
  'goalFingerprint',
  'goalId',
  'page',
  'pageFingerprint',
])
assert.equal(feedbackUrl.searchParams.get('goalId'), binding.goalId)
assert.equal(
  goalBookFeedbackUrl(binding, 'https://skillpilot.com/lernziel-feedback'),
  `https://skillpilot.com${feedbackUrl.pathname}${feedbackUrl.search}`,
)
assert.equal(parseGoalBookFeedbackLinkBinding(`?${search}&goalId=duplicate`), null)
assert.equal(parseGoalBookFeedbackLinkBinding(`?${search}&unexpected=secret`), null)
assert.equal(parseGoalBookFeedbackLinkBinding(`?${search.replace('page=42', 'page=0')}`), null)

const plusBindingSearch = new URLSearchParams({
  ...Object.fromEntries(new URLSearchParams(search)),
  goalId: 'goal+variant',
  edition: 'edition+supplement',
}).toString()
assert(parseGoalBookFeedbackLinkBinding(`?${plusBindingSearch}`))
assert.equal(parseGoalBookFeedbackLinkBinding(`?${plusBindingSearch.replace('goal%2Bvariant', 'a'.repeat(201))}`), null)

const currentBindingPayload = {
  bookId: binding.bookId,
  goalId: binding.goalId,
  edition: binding.edition,
  goalFingerprint: binding.goalFingerprint,
  pageFingerprint: binding.pageFingerprint,
  bookDigest: binding.bookDigest,
  page: Number(binding.page),
}
assert.deepEqual(parseGoalBookFeedbackCurrentBinding(currentBindingPayload), binding)
assert.equal(parseGoalBookFeedbackCurrentBinding({ ...currentBindingPayload, page: binding.page }), null)
assert.equal(parseGoalBookFeedbackCurrentBinding({ ...currentBindingPayload, learnerId: 'secret' }), null)

const bindingLookupUrl = new URL(
  goalBookFeedbackCurrentBindingUrl(binding.bookId, binding.goalId),
  'https://skillpilot.test',
)
assert.deepEqual([...bindingLookupUrl.searchParams.keys()].sort(), ['bookId', 'goalId'])
let requestedBindingUrl = ''
let requestedBindingInit: RequestInit | undefined
const loadedBinding = await requestCurrentGoalBookFeedbackBinding({
  bookId: binding.bookId,
  goalId: binding.goalId,
  fetcher: (async (input, init) => {
    requestedBindingUrl = String(input)
    requestedBindingInit = init
    return new Response(JSON.stringify(currentBindingPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch,
})
assert.deepEqual(loadedBinding, binding)
assert.equal(requestedBindingUrl, goalBookFeedbackCurrentBindingUrl(binding.bookId, binding.goalId))
assert.equal(requestedBindingInit?.cache, 'no-store')
assert.equal(requestedBindingInit?.credentials, 'omit')
assert.equal(requestedBindingInit?.referrerPolicy, 'no-referrer')
assert(!/skillpilotId|learnerId|sessionId|chatSession/iu.test(requestedBindingUrl))

await assert.rejects(() => requestCurrentGoalBookFeedbackBinding({
  bookId: binding.bookId,
  goalId: binding.goalId,
  fetcher: (async () => new Response(JSON.stringify({
    ...currentBindingPayload,
    goalId: 'different-goal',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })) as typeof fetch,
}))

const resolvedPayload = {
  schemaVersion: 1,
  context: {
    goalId: binding.goalId,
    goalFingerprint: binding.goalFingerprint,
    pageFingerprint: binding.pageFingerprint,
    bookId: binding.bookId,
    bookEdition: binding.edition,
    bookDigest: binding.bookDigest,
    locale: 'de-DE',
    scopeLabel: 'Lernzielbuch Mathematik – Gymnasium bundesweit',
    pageNumber: 42,
    canonicalUrl: `https://skillpilot.com/lernzielbuch#goal-${binding.goalId}`,
    publicationManifestFingerprint: manifestDigest,
  },
  goal: {
    title: 'Brüche vergleichen',
    description: 'Die lernende Person kann Brüche vergleichen.',
    breadcrumbs: ['Mathematik', 'Brüche'],
    visualization: {
      title: 'Visualisierung: Brüche vergleichen',
      url: `/api/public/goal-feedback/v1/visualizations/${'d'.repeat(64)}`,
      altText: 'Zwei Brüche werden auf einer Zahlengeraden verglichen.',
    },
  },
  submissionEndpoint: '/api/public/goal-feedback/v1/submissions',
}
const resolved = parseGoalBookFeedbackResolvedContext(resolvedPayload)
assert(resolved)
assert.equal(
  resolved.goal.visualization?.url,
  `/api/public/goal-feedback/v1/visualizations/${'d'.repeat(64)}`,
)
const resolvedWithoutVisualization = parseGoalBookFeedbackResolvedContext({
  ...resolvedPayload,
  goal: { ...resolvedPayload.goal, visualization: undefined },
})
assert(resolvedWithoutVisualization)
assert.equal(resolvedWithoutVisualization.goal.visualization, null)
assert.equal(parseGoalBookFeedbackResolvedContext({
  ...resolvedPayload,
  goal: {
    ...resolvedPayload.goal,
    visualization: { ...resolvedPayload.goal.visualization, url: 'https://example.org/foreign.jpg' },
  },
}), null)
assert.equal(parseGoalBookFeedbackResolvedContext({
  ...resolvedPayload,
  goal: {
    ...resolvedPayload.goal,
    visualization: {
      ...resolvedPayload.goal.visualization,
      url: `/api/public/goal-feedback/v1/visualizations/${'d'.repeat(63)}g`,
    },
  },
}), null)
assert.equal(parseGoalBookFeedbackResolvedContext({
  ...resolved,
  context: { ...resolved.context, canonicalUrl: 'https://example.org/forged' },
}), null)

const submission = createGoalBookFeedbackSubmission({
  context: resolved.context,
  clientSubmissionId: '22222222-2222-4222-8222-222222222222',
  privacyNoticeLocale: 'de',
  content: {
    category: 'source_assignment',
    observation: 'Die Fundstelle deckt nur einen Teil des Lernziels ab.',
    sourceReference: 'Lehrplan, Seite 42',
  },
})
assert.equal(submission.envelope.schemaVersion, 2)
assert.equal(submission.envelope.privacyNoticeVersion, GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION)
assert.equal(submission.envelope.privacyNoticeLocale, 'de')
assert.equal(submission.envelope.privacyAcknowledged, true)
assert.equal(submission.envelope.automatedProcessingAcknowledged, true)
assert.equal(submission.website, '')
assert(!JSON.stringify(submission).match(/skillpilotId|learnerId|sessionId|chatSession/iu))

const englishSubmission = createGoalBookFeedbackSubmission({
  context: resolved.context,
  clientSubmissionId: '44444444-4444-4444-8444-444444444444',
  privacyNoticeLocale: 'en',
  content: submission.envelope.feedback,
})
assert.equal(englishSubmission.envelope.privacyNoticeVersion, GOAL_BOOK_FEEDBACK_PRIVACY_NOTICE_VERSION)
assert.equal(englishSubmission.envelope.privacyNoticeLocale, 'en')

const receipt = {
  feedbackId: '33333333-3333-4333-8333-333333333333',
  receivedAt: '2026-08-30T10:00:00.123456Z',
}
assert.deepEqual(parseGoalBookFeedbackSubmissionReceipt(receipt), receipt)
assert.equal(parseGoalBookFeedbackSubmissionReceipt({ ...receipt, extra: true }), null)
assert.equal(parseGoalBookFeedbackSubmissionReceipt({ feedbackId: receipt.feedbackId }), null)
assert.equal(parseGoalBookFeedbackSubmissionReceipt({ ...receipt, feedbackId: 'feedback-1' }), null)
assert.equal(parseGoalBookFeedbackSubmissionReceipt({ ...receipt, receivedAt: '2026-02-31T10:00:00Z' }), null)

console.log('goal-book feedback client contract tests passed')
