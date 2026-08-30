import { goalBookDefinitionById } from './goalBookPublicationRegistry'

export const GOAL_BOOK_FEEDBACK_SCHEMA_URL =
  'https://skillpilot.com/schemas/goal-evidence/v2/goal-public-feedback.schema.json'
export const GOAL_BOOK_FEEDBACK_CONTEXT_ENDPOINT = '/api/public/goal-feedback/v1/context'
export const GOAL_BOOK_FEEDBACK_SUBMISSION_ENDPOINT = '/api/public/goal-feedback/v1/submissions'

const SAFE_GOAL_ID = /^[A-Za-z0-9][A-Za-z0-9._:+-]{0,199}$/u
const SAFE_EDITION = /^[A-Za-z0-9][A-Za-z0-9._:+-]{0,199}$/u
const SAFE_SHA256 = /^sha256:[0-9a-f]{64}$/u
const SAFE_LOCALE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/u
const SAFE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u
const RFC3339_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,9})?(?:Z|([+-])(\d{2}):(\d{2}))$/u

export const GOAL_BOOK_FEEDBACK_CATEGORIES = [
  'factual_error',
  'wording_or_language',
  'missing_or_overbroad_goal',
  'prerequisite_or_sequence',
  'chapter_structure',
  'scope_or_applicability',
  'source_assignment',
  'visualization_or_accessibility',
  'other',
] as const

export const GOAL_BOOK_FEEDBACK_REVIEWER_ROLES = [
  'teacher',
  'learner',
  'parent',
  'researcher',
  'subject_expert',
  'other',
] as const

export type GoalBookFeedbackCategory = typeof GOAL_BOOK_FEEDBACK_CATEGORIES[number]
export type GoalBookFeedbackReviewerRole = typeof GOAL_BOOK_FEEDBACK_REVIEWER_ROLES[number]

export interface GoalBookFeedbackLinkBinding {
  bookId: string
  goalId: string
  edition: string
  goalFingerprint: string
  pageFingerprint: string
  bookDigest: string
  page: string
}

export interface GoalBookFeedbackContext {
  goalId: string
  goalFingerprint: string
  pageFingerprint: string
  bookId: string
  bookEdition: string
  bookDigest: string
  locale: string
  scopeLabel: string
  pageNumber: number
  canonicalUrl: string
  publicationManifestFingerprint: string
}

export interface GoalBookFeedbackResolvedContext {
  schemaVersion: 1
  context: GoalBookFeedbackContext
  goal: {
    title: string
    description: string
    breadcrumbs: string[]
  }
  submissionEndpoint: typeof GOAL_BOOK_FEEDBACK_SUBMISSION_ENDPOINT
}

export interface GoalBookFeedbackContent {
  category: GoalBookFeedbackCategory
  observation: string
  evidence?: string
  proposedImprovement?: string
  sourceReference?: string
  reviewerRole?: GoalBookFeedbackReviewerRole
}

export interface GoalBookFeedbackSubmissionRequest {
  clientSubmissionId: string
  website: string
  envelope: {
    $schema: typeof GOAL_BOOK_FEEDBACK_SCHEMA_URL
    schemaVersion: 2
    context: GoalBookFeedbackContext
    feedback: GoalBookFeedbackContent
    privacyAcknowledged: true
    automatedProcessingAcknowledged: true
  }
}

export interface GoalBookFeedbackSubmissionReceipt {
  feedbackId: string
  receivedAt: string
}

const nonBlank = (value: unknown, maximumLength: number): value is string => (
  typeof value === 'string'
  && value.length >= 1
  && value.length <= maximumLength
  && value.trim() === value
)

const record = (value: unknown): Record<string, unknown> | null => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
)

const exactKeys = (value: Record<string, unknown>, expected: readonly string[]): boolean => {
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index])
}

const isRfc3339DateTime = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  const match = RFC3339_DATE_TIME.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  const offsetHour = Number(match[8] ?? 0)
  const offsetMinute = Number(match[9] ?? 0)
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return month >= 1
    && month <= 12
    && day >= 1
    && day <= (daysInMonth[month - 1] ?? 0)
    && hour <= 23
    && minute <= 59
    && second <= 59
    && offsetHour <= 23
    && offsetMinute <= 59
    && Number.isFinite(Date.parse(value))
}

export const parseGoalBookFeedbackSubmissionReceipt = (
  value: unknown,
): GoalBookFeedbackSubmissionReceipt | null => {
  const root = record(value)
  if (!root || !exactKeys(root, ['feedbackId', 'receivedAt'])) return null
  if (typeof root.feedbackId !== 'string' || !SAFE_UUID.test(root.feedbackId)) return null
  if (!isRfc3339DateTime(root.receivedAt)) return null
  return { feedbackId: root.feedbackId, receivedAt: root.receivedAt }
}

export const parseGoalBookFeedbackLinkBinding = (
  search: string,
): GoalBookFeedbackLinkBinding | null => {
  const params = new URLSearchParams(search)
  const keys = [
    'bookId',
    'goalId',
    'edition',
    'goalFingerprint',
    'pageFingerprint',
    'bookDigest',
    'page',
  ] as const
  let unknownKey = false
  params.forEach((_value, key) => {
    if (!keys.some((expected) => expected === key)) unknownKey = true
  })
  if (unknownKey) return null
  if (keys.some((key) => params.getAll(key).length !== 1)) return null
  const values = Object.fromEntries(keys.map((key) => [key, params.get(key) ?? ''])) as unknown as GoalBookFeedbackLinkBinding
  if (!goalBookDefinitionById(values.bookId)) return null
  if (!SAFE_GOAL_ID.test(values.goalId)) return null
  if (!SAFE_EDITION.test(values.edition)) return null
  if (!SAFE_SHA256.test(values.goalFingerprint)) return null
  if (!SAFE_SHA256.test(values.pageFingerprint)) return null
  if (!SAFE_SHA256.test(values.bookDigest)) return null
  if (!/^(?:[1-9][0-9]{0,3})$/u.test(values.page)) return null
  return values
}

export const goalBookFeedbackContextUrl = (
  binding: GoalBookFeedbackLinkBinding,
): string => `${GOAL_BOOK_FEEDBACK_CONTEXT_ENDPOINT}?${new URLSearchParams({
  bookId: binding.bookId,
  goalId: binding.goalId,
  edition: binding.edition,
  goalFingerprint: binding.goalFingerprint,
  pageFingerprint: binding.pageFingerprint,
  bookDigest: binding.bookDigest,
  page: binding.page,
}).toString()}`

export const parseGoalBookFeedbackResolvedContext = (
  value: unknown,
): GoalBookFeedbackResolvedContext | null => {
  const root = record(value)
  const context = record(root?.context)
  const goal = record(root?.goal)
  if (!root || !context || !goal || root.schemaVersion !== 1) return null
  if (root.submissionEndpoint !== GOAL_BOOK_FEEDBACK_SUBMISSION_ENDPOINT) return null
  if (!nonBlank(context.goalId, 200) || !SAFE_GOAL_ID.test(context.goalId)) return null
  if (!nonBlank(context.goalFingerprint, 71) || !SAFE_SHA256.test(context.goalFingerprint)) return null
  if (!nonBlank(context.pageFingerprint, 71) || !SAFE_SHA256.test(context.pageFingerprint)) return null
  if (!nonBlank(context.bookId, 500) || !goalBookDefinitionById(context.bookId)) return null
  if (!nonBlank(context.bookEdition, 200) || !SAFE_EDITION.test(context.bookEdition)) return null
  if (!nonBlank(context.bookDigest, 71) || !SAFE_SHA256.test(context.bookDigest)) return null
  if (!nonBlank(context.locale, 35) || !SAFE_LOCALE.test(context.locale)) return null
  if (!nonBlank(context.scopeLabel, 500)) return null
  if (typeof context.pageNumber !== 'number' || !Number.isSafeInteger(context.pageNumber) || context.pageNumber < 1) return null
  if (!nonBlank(context.canonicalUrl, 2_000)) return null
  try {
    const canonicalUrl = new URL(context.canonicalUrl)
    if (canonicalUrl.protocol !== 'https:' || canonicalUrl.origin !== 'https://skillpilot.com') return null
  } catch {
    return null
  }
  if (!nonBlank(context.publicationManifestFingerprint, 71)
    || !SAFE_SHA256.test(context.publicationManifestFingerprint)) return null
  if (!nonBlank(goal.title, 1_000) || !nonBlank(goal.description, 8_000)) return null
  if (!Array.isArray(goal.breadcrumbs)
    || !goal.breadcrumbs.every((item) => nonBlank(item, 1_000))) return null
  return {
    schemaVersion: 1,
    context: context as unknown as GoalBookFeedbackContext,
    goal: {
      title: goal.title,
      description: goal.description,
      breadcrumbs: [...goal.breadcrumbs],
    },
    submissionEndpoint: GOAL_BOOK_FEEDBACK_SUBMISSION_ENDPOINT,
  }
}

export const createGoalBookFeedbackSubmission = ({
  context,
  content,
  clientSubmissionId,
  website = '',
}: {
  context: GoalBookFeedbackContext
  content: GoalBookFeedbackContent
  clientSubmissionId: string
  website?: string
}): GoalBookFeedbackSubmissionRequest => ({
  clientSubmissionId,
  website,
  envelope: {
    $schema: GOAL_BOOK_FEEDBACK_SCHEMA_URL,
    schemaVersion: 2,
    context,
    feedback: content,
    privacyAcknowledged: true,
    automatedProcessingAcknowledged: true,
  },
})
