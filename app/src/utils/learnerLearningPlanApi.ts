import type {
  ActivateLearnerLearningPlansRequest,
  ActivateLearnerLearningPlansResponse,
  ContinueLearnerLearningPlanRequest,
  ContinueLearnerLearningPlanResponse,
  LearnerLearningPlanBlock,
  LearnerLearningPlanContinueReason,
  LearnerLearningPlanCurrentBlock,
  LearnerLearningPlanDetail,
  LearnerLearningPlanMilestone,
  LearnerLearningPlanMetrics,
  LearnerLearningPlanSummary,
  LearnerLearningPlanTransitionResponse,
  LearnerLearningPlansResponse,
  PreviewLearnerLearningPlansResponse,
  ReconcileLearnerLearningPlansRequest,
  SaveLearnerLearningPlanRequest,
  SwitchLearnerLearningPlanRequest,
} from '../learnerLearningPlanTypes'
import { sanitizeSkillpilotId } from './skillpilotId'

export interface LearnerLearningPlanRequestOptions {
  apiBase?: string
  fetchImpl?: typeof fetch
  signal?: AbortSignal
}

export const LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT =
  'LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT' as const

export type LearnerLearningPlanApiErrorCode =
  | typeof LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT

export class LearnerLearningPlanApiError extends Error {
  readonly status: number
  readonly errorCode: LearnerLearningPlanApiErrorCode | null

  constructor(
    message: string,
    status: number,
    errorCode: LearnerLearningPlanApiErrorCode | null = null,
  ) {
    super(message)
    this.name = 'LearnerLearningPlanApiError'
    this.status = status
    this.errorCode = errorCode
  }
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u

const normalizeApiBase = (value?: string) => (value ?? '').trim().replace(/\/+$/u, '')
const runtimeApiBase = () => normalizeApiBase(import.meta.env?.VITE_API_BASE)

const asRecord = (value: unknown, message: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(message)
  }
  return value as Record<string, unknown>
}

const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid learning-plan response: ${field}`)
  }
  return value
}

const optionalString = (value: unknown): string | null => (
  typeof value === 'string' && value.trim() ? value : null
)

const requiredInteger = (value: unknown, field: string): number => {
  if (!Number.isSafeInteger(value) || Number(value) < 0) {
    throw new Error(`Invalid learning-plan response: ${field}`)
  }
  return Number(value)
}

const requiredBoolean = (value: unknown, field: string): boolean => {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid learning-plan response: ${field}`)
  }
  return value
}

const parseDate = (value: unknown, field: string): string => {
  const candidate = requiredString(value, field)
  const match = DATE_PATTERN.exec(candidate)
  if (!match) throw new Error(`Invalid learning-plan response: ${field}`)
  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid learning-plan response: ${field}`)
  }
  return candidate
}

const parseStringList = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid learning-plan response: ${field}`)
  }
  const values = value.map((item) => requiredString(item, field))
  if (new Set(values).size !== values.length) {
    throw new Error(`Invalid learning-plan response: ${field}`)
  }
  return values
}

const parseCurrentBlock = (value: unknown): LearnerLearningPlanCurrentBlock | null => {
  if (value === null || value === undefined) return null
  const source = asRecord(value, 'Invalid learning-plan response: currentBlock')
  const startDate = parseDate(source.startDate, 'currentBlock.startDate')
  const endDate = parseDate(source.endDate, 'currentBlock.endDate')
  if (startDate > endDate) {
    throw new Error('Invalid learning-plan response: currentBlock.period')
  }
  const goalId = optionalString(source.goalId)
  const kind = requiredString(source.kind, 'currentBlock.kind')
  if (kind !== 'learning' && kind !== 'buffer') {
    throw new Error('Invalid learning-plan response: currentBlock.kind')
  }
  return {
    blockId: requiredString(source.blockId ?? source.id, 'currentBlock.blockId'),
    kind,
    title: requiredString(source.title, 'currentBlock.title'),
    ...(goalId ? { goalId } : {}),
    startDate,
    endDate,
  }
}

const parseMilestone = (value: unknown): LearnerLearningPlanMilestone | null => {
  if (value === null || value === undefined) return null
  const source = asRecord(value, 'Invalid learning-plan response: nextMilestone')
  const goalId = optionalString(source.goalId)
  return {
    blockId: requiredString(source.blockId ?? source.id, 'nextMilestone.blockId'),
    title: requiredString(source.title, 'nextMilestone.title'),
    ...(goalId ? { goalId } : {}),
    // `dueDate` is accepted as a forward-compatible alias while the contract
    // settles on the existing course-plan field name `date`.
    date: parseDate(source.date ?? source.dueDate, 'nextMilestone.date'),
  }
}

export const parseLearnerLearningPlanSummary = (value: unknown): LearnerLearningPlanSummary => {
  const source = asRecord(value, 'Invalid learning-plan response: plan')
  const period = asRecord(source.period, 'Invalid learning-plan response: period')
  const metrics = asRecord(source.metrics, 'Invalid learning-plan response: metrics')
  const buffer = asRecord(source.buffer, 'Invalid learning-plan response: buffer')
  const pace = asRecord(source.pace, 'Invalid learning-plan response: pace')
  const startDate = parseDate(period.startDate, 'period.startDate')
  const endDate = parseDate(period.endDate, 'period.endDate')
  if (startDate > endDate) throw new Error('Invalid learning-plan response: period')

  const dueThroughToday = requiredInteger(metrics.dueThroughToday, 'metrics.dueThroughToday')
  const completedDueThroughToday = requiredInteger(
    metrics.completedDueThroughToday,
    'metrics.completedDueThroughToday',
  )
  const openDueThroughToday = requiredInteger(
    metrics.openDueThroughToday,
    'metrics.openDueThroughToday',
  )
  const dueToday = requiredInteger(metrics.dueToday, 'metrics.dueToday')
  const completedDueToday = requiredInteger(metrics.completedDueToday, 'metrics.completedDueToday')
  const openDueToday = requiredInteger(metrics.openDueToday, 'metrics.openDueToday')
  const totalPlanned = requiredInteger(metrics.totalPlanned, 'metrics.totalPlanned')
  if (
    completedDueThroughToday > dueThroughToday
    || openDueThroughToday !== dueThroughToday - completedDueThroughToday
    || dueThroughToday > totalPlanned
    || completedDueToday > dueToday
    || openDueToday !== dueToday - completedDueToday
    || dueToday > dueThroughToday
    || completedDueToday > completedDueThroughToday
    || openDueToday > openDueThroughToday
  ) {
    throw new Error('Invalid learning-plan response: metrics.cardinality')
  }

  if (pace.status !== 'neutral') {
    throw new Error('Invalid learning-plan response: pace.status')
  }
  const totalBufferWorkdays = requiredInteger(buffer.totalWorkdays, 'buffer.totalWorkdays')
  const remainingBufferWorkdays = requiredInteger(
    buffer.remainingWorkdays,
    'buffer.remainingWorkdays',
  )
  if (remainingBufferWorkdays > totalBufferWorkdays) {
    throw new Error('Invalid learning-plan response: buffer.cardinality')
  }
  const planLabel = optionalString(source.planLabel)
  const canContinue = requiredBoolean(source.canContinue, 'canContinue')
  const rawContinueReason = source.continueReason
  const parsedContinueReason = rawContinueReason === null
    ? null
    : requiredString(rawContinueReason, 'continueReason')
  if (![
    null,
    'learning-plan-following-disabled',
    'personal-curriculum-changed',
    'no-open-due-frontier-goal',
    'active-goal-in-progress',
  ].includes(parsedContinueReason)) {
    throw new Error('Invalid learning-plan response: continueReason')
  }
  const continueReason = parsedContinueReason as LearnerLearningPlanContinueReason
  if (canContinue !== (continueReason === null)) {
    throw new Error('Invalid learning-plan response: continueReason.state')
  }
  const nextEligibleGoalSource = source.nextEligibleGoal === null || source.nextEligibleGoal === undefined
    ? null
    : asRecord(source.nextEligibleGoal, 'Invalid learning-plan response: nextEligibleGoal')
  return {
    planId: requiredString(source.planId, 'planId'),
    revision: requiredInteger(source.revision, 'revision'),
    landscapeId: requiredString(source.landscapeId, 'landscapeId'),
    planLabel,
    stale: requiredBoolean(source.stale, 'stale'),
    period: { startDate, endDate },
    currentBlock: parseCurrentBlock(source.currentBlock),
    nextMilestone: parseMilestone(source.nextMilestone),
    metrics: {
      dueThroughToday,
      completedDueThroughToday,
      openDueThroughToday,
      dueToday,
      completedDueToday,
      openDueToday,
      totalPlanned,
    },
    buffer: {
      totalWorkdays: totalBufferWorkdays,
      remainingWorkdays: remainingBufferWorkdays,
    },
    pace: {
      status: 'neutral',
      reason: requiredString(pace.reason, 'pace.reason'),
    },
    nextEligibleGoal: nextEligibleGoalSource
      ? { goalId: requiredString(nextEligibleGoalSource.goalId, 'nextEligibleGoal.goalId') }
      : null,
    continueReason,
    canContinue,
  }
}

const parsePlanBlock = (value: unknown): LearnerLearningPlanBlock => {
  const source = asRecord(value, 'Invalid learning-plan response: block')
  const id = requiredString(source.id, 'block.id')
  const kind = requiredString(source.kind, 'block.kind')
  const goalId = optionalString(source.goalId)
  if (kind === 'milestone') {
    return {
      id,
      kind,
      title: requiredString(source.title, 'block.title'),
      ...(goalId ? { goalId } : {}),
      date: parseDate(source.date ?? source.dueDate, 'block.date'),
    }
  }
  const startDate = parseDate(source.startDate, 'block.startDate')
  const endDate = parseDate(source.endDate, 'block.endDate')
  if (startDate > endDate) throw new Error('Invalid learning-plan response: block.period')
  if (kind === 'learning') {
    const title = optionalString(source.title)
    const learningGoalId = optionalString(source.goalId)
    return {
      id,
      kind,
      ...(learningGoalId ? { goalId: learningGoalId } : {}),
      ...(title ? { title } : {}),
      startDate,
      endDate,
      ...(source.atomicGoalIds === null || source.atomicGoalIds === undefined
        ? {}
        : { atomicGoalIds: parseStringList(source.atomicGoalIds, 'block.atomicGoalIds') }),
    }
  }
  if (kind === 'buffer') {
    return {
      id,
      kind,
      title: requiredString(source.title, 'block.title'),
      startDate,
      endDate,
    }
  }
  throw new Error('Invalid learning-plan response: block.kind')
}

export const parseLearnerLearningPlanDetail = (value: unknown): LearnerLearningPlanDetail => {
  const source = asRecord(value, 'Invalid learning-plan response: detail')
  if (!Array.isArray(source.blocks)) {
    throw new Error('Invalid learning-plan response: blocks')
  }
  const blocks = source.blocks.map(parsePlanBlock)
  if (new Set(blocks.map(({ id }) => id)).size !== blocks.length) {
    throw new Error('Invalid learning-plan response: duplicate block')
  }
  return { ...parseLearnerLearningPlanSummary(source), blocks }
}

export const parseLearnerLearningPlansResponse = (value: unknown): LearnerLearningPlansResponse => {
  const source = asRecord(value, 'Invalid learning-plan response')
  if (!Array.isArray(source.plans)) throw new Error('Invalid learning-plan response: plans')
  const plans = source.plans.map(parseLearnerLearningPlanSummary)
  if (new Set(plans.map(({ planId }) => planId)).size !== plans.length) {
    throw new Error('Invalid learning-plan response: duplicate plan')
  }
  return {
    asOf: parseDate(source.asOf, 'asOf'),
    followLearningPlans: requiredBoolean(source.followLearningPlans, 'followLearningPlans'),
    plans,
  }
}

const requiredSegment = (value: string, message: string) => {
  const normalized = value.trim()
  if (!normalized) throw new Error(message)
  return encodeURIComponent(normalized)
}

const learnerPlansBase = (skillpilotId: string, apiBase?: string) => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) throw new Error('Missing SkillPilot ID')
  const base = normalizeApiBase(apiBase === undefined ? runtimeApiBase() : apiBase)
  return `${base}/api/ui/learners/${encodeURIComponent(sanitizedId)}/learning-plans`
}

export const buildLearnerLearningPlansEndpoint = (
  skillpilotId: string,
  asOf?: string,
  apiBase?: string,
) => {
  const base = learnerPlansBase(skillpilotId, apiBase)
  return asOf ? `${base}?asOf=${encodeURIComponent(parseDate(asOf, 'asOf'))}` : base
}

export const buildLearnerLearningPlanEndpoint = (
  skillpilotId: string,
  landscapeId: string,
  apiBase?: string,
) => `${learnerPlansBase(skillpilotId, apiBase)}/by-landscape?landscapeId=${requiredSegment(landscapeId, 'Missing landscape ID')}`

export const buildContinueLearnerLearningPlanEndpoint = (
  skillpilotId: string,
  planId: string,
  apiBase?: string,
) => `${learnerPlansBase(skillpilotId, apiBase)}/${requiredSegment(planId, 'Missing learning-plan ID')}/continue`

export const buildReconcileLearnerLearningPlansEndpoint = (
  skillpilotId: string,
  apiBase?: string,
) => `${learnerPlansBase(skillpilotId, apiBase)}/reconcile`

export const buildSwitchLearnerLearningPlanEndpoint = (
  skillpilotId: string,
  planId: string,
  apiBase?: string,
) => `${learnerPlansBase(skillpilotId, apiBase)}/${requiredSegment(planId, 'Missing learning-plan ID')}/switch`

export const buildActivateLearnerLearningPlansEndpoint = (
  skillpilotId: string,
  apiBase?: string,
) => `${learnerPlansBase(skillpilotId, apiBase)}/activate`

const parseWhitelistedErrorCode = (body: string): LearnerLearningPlanApiErrorCode | null => {
  try {
    const value = JSON.parse(body) as unknown
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
    const errorCode = (value as Record<string, unknown>).errorCode
    return errorCode === LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT
      ? errorCode
      : null
  } catch {
    return null
  }
}

const learningPlanApiError = (body: string, status: number) => {
  const errorCode = parseWhitelistedErrorCode(body)
  return new LearnerLearningPlanApiError(
    errorCode
      ? `Learning-plan request failed (${status})`
      : body || `Learning-plan request failed (${status})`,
    status,
    errorCode,
  )
}

const readJsonResponse = async (response: Response): Promise<unknown> => {
  if (!response.ok) {
    const message = (await response.text()).trim()
    throw learningPlanApiError(message, response.status)
  }
  try {
    return await response.json()
  } catch {
    throw new Error('Invalid learning-plan response')
  }
}

export const getLearnerLearningPlans = async (
  skillpilotId: string,
  asOf: string | undefined,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<LearnerLearningPlansResponse> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildLearnerLearningPlansEndpoint(skillpilotId, asOf, options.apiBase),
    {
      credentials: 'include',
      cache: 'no-store',
      signal: options.signal,
    },
  )
  return parseLearnerLearningPlansResponse(await readJsonResponse(response))
}

export const getLearnerLearningPlan = async (
  skillpilotId: string,
  landscapeId: string,
  asOf: string,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<LearnerLearningPlanDetail> => {
  const endpoint = `${buildLearnerLearningPlanEndpoint(
    skillpilotId,
    landscapeId,
    options.apiBase,
  )}&asOf=${encodeURIComponent(parseDate(asOf, 'asOf'))}`
  const response = await (options.fetchImpl ?? fetch)(endpoint, {
    credentials: 'include',
    cache: 'no-store',
    signal: options.signal,
  })
  return parseLearnerLearningPlanDetail(await readJsonResponse(response))
}

export const saveLearnerLearningPlan = async (
  skillpilotId: string,
  landscapeId: string,
  request: SaveLearnerLearningPlanRequest,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<LearnerLearningPlanDetail> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildLearnerLearningPlanEndpoint(skillpilotId, landscapeId, options.apiBase),
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: options.signal,
    },
  )
  return parseLearnerLearningPlanDetail(await readJsonResponse(response))
}

const parseContinueResponse = (value: unknown): ContinueLearnerLearningPlanResponse => {
  const source = asRecord(value, 'Invalid learning-plan continue response')
  return {
    planId: requiredString(source.planId, 'planId'),
    revision: requiredInteger(source.revision, 'revision'),
    landscapeId: requiredString(source.landscapeId, 'landscapeId'),
    focusGoalId: requiredString(source.focusGoalId, 'focusGoalId'),
    activeGoalId: requiredString(source.activeGoalId, 'activeGoalId'),
    state: asRecord(source.state, 'Invalid learning-plan continue response: state'),
  }
}

const optionalInteger = (value: unknown, field: string): number | null => {
  if (value === null || value === undefined) return null
  return requiredInteger(value, field)
}

const parseTransitionResponse = (
  value: unknown,
): LearnerLearningPlanTransitionResponse | null => {
  if (value === null || value === undefined) return null
  const source = asRecord(value, 'Invalid learning-plan transition response')
  const parsed: LearnerLearningPlanTransitionResponse = {
    planId: optionalString(source.planId),
    revision: optionalInteger(source.revision, 'revision'),
    landscapeId: optionalString(source.landscapeId),
    focusGoalId: optionalString(source.focusGoalId),
    activeGoalId: optionalString(source.activeGoalId),
    changed: requiredBoolean(source.changed, 'changed'),
    state: asRecord(source.state, 'Invalid learning-plan transition response: state'),
  }
  const targetContext = [
    parsed.planId,
    parsed.revision,
    parsed.landscapeId,
    parsed.focusGoalId,
  ]
  if (parsed.activeGoalId && targetContext.some((value) => value === null)) {
    throw new Error('Invalid learning-plan transition response: selected target is incomplete')
  }
  if (!parsed.activeGoalId && targetContext.some((value) => value !== null)) {
    throw new Error('Invalid learning-plan transition response: target context without active goal')
  }
  return parsed
}

const parseActivateResponse = (value: unknown): ActivateLearnerLearningPlansResponse => {
  const source = asRecord(value, 'Invalid learning-plan activation response')
  if (!Array.isArray(source.plans)) {
    throw new Error('Invalid learning-plan activation response: plans')
  }
  const plans = source.plans.map(parseLearnerLearningPlanDetail)
  if (
    new Set(plans.map(({ planId }) => planId)).size !== plans.length
    || new Set(plans.map(({ landscapeId }) => landscapeId)).size !== plans.length
  ) {
    throw new Error('Invalid learning-plan activation response: duplicate plan')
  }
  if (source.followLearningPlans !== true) {
    throw new Error('Invalid learning-plan activation response: followLearningPlans')
  }
  const parsed: ActivateLearnerLearningPlansResponse = {
    asOf: parseDate(source.asOf, 'asOf'),
    followLearningPlans: true,
    plans,
    selectedPlanId: optionalString(source.selectedPlanId),
    selectedLandscapeId: optionalString(source.selectedLandscapeId),
    focusGoalId: optionalString(source.focusGoalId),
    activeGoalId: optionalString(source.activeGoalId),
    state: asRecord(source.state, 'Invalid learning-plan activation response: state'),
  }
  const selection = [
    parsed.selectedPlanId,
    parsed.selectedLandscapeId,
    parsed.focusGoalId,
    parsed.activeGoalId,
  ]
  const hasSelection = selection.some((value) => value !== null)
  if (hasSelection && selection.some((value) => value === null)) {
    throw new Error('Invalid learning-plan activation response: selection is incomplete')
  }
  if (parsed.selectedPlanId) {
    const selectedPlan = parsed.plans.find((plan) => plan.planId === parsed.selectedPlanId)
    if (!selectedPlan || selectedPlan.landscapeId !== parsed.selectedLandscapeId) {
      throw new Error('Invalid learning-plan activation response: selected plan')
    }
  }
  return parsed
}

const readOptionalJsonResponse = async (response: Response): Promise<unknown | null> => {
  if (!response.ok) {
    const message = (await response.text()).trim()
    throw learningPlanApiError(message, response.status)
  }
  if (response.status === 204) return null
  const text = await response.text()
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error('Invalid learning-plan response')
  }
}

export const continueLearnerLearningPlan = async (
  skillpilotId: string,
  planId: string,
  request: ContinueLearnerLearningPlanRequest,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<ContinueLearnerLearningPlanResponse> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildContinueLearnerLearningPlanEndpoint(skillpilotId, planId, options.apiBase),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: options.signal,
    },
  )
  return parseContinueResponse(await readJsonResponse(response))
}

export const reconcileLearnerLearningPlans = async (
  skillpilotId: string,
  request: ReconcileLearnerLearningPlansRequest,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<LearnerLearningPlanTransitionResponse | null> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildReconcileLearnerLearningPlansEndpoint(skillpilotId, options.apiBase),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, asOf: parseDate(request.asOf, 'asOf') }),
      signal: options.signal,
    },
  )
  return parseTransitionResponse(await readOptionalJsonResponse(response))
}

export const switchLearnerLearningPlan = async (
  skillpilotId: string,
  planId: string,
  request: SwitchLearnerLearningPlanRequest,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<LearnerLearningPlanTransitionResponse | null> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildSwitchLearnerLearningPlanEndpoint(skillpilotId, planId, options.apiBase),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, asOf: parseDate(request.asOf, 'asOf') }),
      signal: options.signal,
    },
  )
  return parseTransitionResponse(await readOptionalJsonResponse(response))
}

export const activateLearnerLearningPlans = async (
  skillpilotId: string,
  request: ActivateLearnerLearningPlansRequest,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<ActivateLearnerLearningPlansResponse> => {
  const response = await (options.fetchImpl ?? fetch)(
    buildActivateLearnerLearningPlansEndpoint(skillpilotId, options.apiBase),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...request, asOf: parseDate(request.asOf, 'asOf') }),
      signal: options.signal,
    },
  )
  return parseActivateResponse(await readJsonResponse(response))
}

const parsePreviewMetrics = (value: unknown): LearnerLearningPlanMetrics => {
  const source = asRecord(value, 'Invalid learning-plan preview: metrics')
  const metrics: LearnerLearningPlanMetrics = {
    dueThroughToday: requiredInteger(source.dueThroughToday, 'metrics.dueThroughToday'),
    completedDueThroughToday: requiredInteger(source.completedDueThroughToday, 'metrics.completedDueThroughToday'),
    openDueThroughToday: requiredInteger(source.openDueThroughToday, 'metrics.openDueThroughToday'),
    dueToday: requiredInteger(source.dueToday, 'metrics.dueToday'),
    completedDueToday: requiredInteger(source.completedDueToday, 'metrics.completedDueToday'),
    openDueToday: requiredInteger(source.openDueToday, 'metrics.openDueToday'),
    totalPlanned: requiredInteger(source.totalPlanned, 'metrics.totalPlanned'),
  }
  if (
    metrics.completedDueThroughToday > metrics.dueThroughToday
    || metrics.openDueThroughToday !== metrics.dueThroughToday - metrics.completedDueThroughToday
    || metrics.dueThroughToday > metrics.totalPlanned
    || metrics.completedDueToday > metrics.dueToday
    || metrics.openDueToday !== metrics.dueToday - metrics.completedDueToday
    || metrics.dueToday > metrics.dueThroughToday
    || metrics.completedDueToday > metrics.completedDueThroughToday
    || metrics.openDueToday > metrics.openDueThroughToday
  ) throw new Error('Invalid learning-plan preview: metrics.cardinality')
  return metrics
}

export const parsePreviewLearnerLearningPlansResponse = (
  value: unknown,
  request: ActivateLearnerLearningPlansRequest,
): PreviewLearnerLearningPlansResponse => {
  const source = asRecord(value, 'Invalid learning-plan preview')
  const asOf = parseDate(source.asOf, 'asOf')
  if (asOf !== request.asOf || !Array.isArray(source.days) || source.days.length !== 7) {
    throw new Error('Invalid learning-plan preview: period')
  }
  const expectedSubjects = new Set(request.plans.map((plan) => plan.landscapeId))
  if (!expectedSubjects.size || expectedSubjects.size !== request.plans.length) {
    throw new Error('Invalid learning-plan preview: requested subjects')
  }
  const days = source.days.map((value, index) => {
    const day = asRecord(value, 'Invalid learning-plan preview: day')
    const date = parseDate(day.date, 'day.date')
    const expectedDate = new Date(`${asOf}T00:00:00Z`)
    expectedDate.setUTCDate(expectedDate.getUTCDate() + index)
    if (date !== expectedDate.toISOString().slice(0, 10) || !Array.isArray(day.subjects)) {
      throw new Error('Invalid learning-plan preview: day order')
    }
    const subjects = day.subjects.map((value) => {
      const subject = asRecord(value, 'Invalid learning-plan preview: subject')
      return {
        landscapeId: requiredString(subject.landscapeId, 'subject.landscapeId'),
        metrics: parsePreviewMetrics(subject.metrics),
      }
    })
    if (
      subjects.length !== expectedSubjects.size
      || new Set(subjects.map((subject) => subject.landscapeId)).size !== subjects.length
      || subjects.some((subject) => !expectedSubjects.has(subject.landscapeId))
    ) throw new Error('Invalid learning-plan preview: subjects')
    const totals = parsePreviewMetrics(day.totals)
    for (const key of Object.keys(totals) as Array<keyof LearnerLearningPlanMetrics>) {
      const sum = subjects.reduce((total, subject) => total + subject.metrics[key], 0)
      if (!Number.isSafeInteger(sum) || totals[key] !== sum) {
        throw new Error('Invalid learning-plan preview: totals')
      }
    }
    return { date, subjects, totals }
  })
  return { asOf, days }
}

export const previewLearnerLearningPlans = async (
  skillpilotId: string,
  request: ActivateLearnerLearningPlansRequest,
  options: LearnerLearningPlanRequestOptions = {},
): Promise<PreviewLearnerLearningPlansResponse> => {
  const normalizedRequest = { ...request, asOf: parseDate(request.asOf, 'asOf') }
  const response = await (options.fetchImpl ?? fetch)(
    `${learnerPlansBase(skillpilotId, options.apiBase)}/preview`,
    {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedRequest),
      signal: options.signal,
    },
  )
  return parsePreviewLearnerLearningPlansResponse(await readJsonResponse(response), normalizedRequest)
}
