import assert from 'node:assert/strict'
import {
  createGoalBookFeedbackSubmission,
  goalBookFeedbackContextUrl,
  parseGoalBookFeedbackLinkBinding,
  parseGoalBookFeedbackResolvedContext,
  parseGoalBookFeedbackSubmissionReceipt,
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

const resolved = parseGoalBookFeedbackResolvedContext({
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
  },
  submissionEndpoint: '/api/public/goal-feedback/v1/submissions',
})
assert(resolved)
assert.equal(parseGoalBookFeedbackResolvedContext({
  ...resolved,
  context: { ...resolved.context, canonicalUrl: 'https://example.org/forged' },
}), null)

const submission = createGoalBookFeedbackSubmission({
  context: resolved.context,
  clientSubmissionId: '22222222-2222-4222-8222-222222222222',
  content: {
    category: 'source_assignment',
    observation: 'Die Fundstelle deckt nur einen Teil des Lernziels ab.',
    sourceReference: 'Lehrplan, Seite 42',
  },
})
assert.equal(submission.envelope.schemaVersion, 2)
assert.equal(submission.envelope.privacyAcknowledged, true)
assert.equal(submission.envelope.automatedProcessingAcknowledged, true)
assert.equal(submission.website, '')
assert(!JSON.stringify(submission).match(/skillpilotId|learnerId|sessionId|chatSession/iu))

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
