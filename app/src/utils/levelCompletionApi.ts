import { sanitizeSkillpilotId } from './skillpilotId'

export type CompletionCalculationStatus = 'valid' | 'unresolved' | 'invalid' | 'notApplicable' | 'unavailable'
export type CompletionNavigationIntent = 'required' | 'support' | 'voluntary'
export type CompletionActionName = 'selectProfile' | 'leaveProfile' | 'pauseProfile' | 'learnGoal' | 'endAssessment' | 'retryAssessment' | 'includeTarget' | 'includeSupport'
export type CompletionTitle = Record<string, string>

export interface CompletionAssessmentStart {
  profileId: string
  goalId: string
  expectedRevision: number
  restartCurrent?: true
}

export interface CompletionAction {
  action: CompletionActionName
  goalId?: string
  title: CompletionTitle
  intent?: CompletionNavigationIntent
}

export interface CompletionAssessment {
  goalId: string
  title: CompletionTitle
  mastered: boolean
  startAvailable: boolean
  unavailableReason?: string
}

export interface LevelCompletion {
  calculationStatus: CompletionCalculationStatus
  contextRef?: string
  profileId?: string
  profileRevision?: string
  curriculumGeneration?: string
  learnerRevision: number
  title: CompletionTitle
  complete?: boolean
  masteredTargetCount: number
  waivedTargetCount: number
  pendingTargetCount: number
  targetCount: number
  masteredAssessmentCount: number
  requiredAssessmentCount: number
  waivedTargetGoalIds: string[]
  waiverDetails?: { goalId: string; title: CompletionTitle; ruleId: string;
    assessments: { goalId: string; title: CompletionTitle }[]; assessmentCount: number }[]
  assessments: CompletionAssessment[]
  profileOptions: { profileId: string; title: CompletionTitle; targetCount?: number; requiredAssessmentCount?: number; assessments?: CompletionAssessment[] }[]
  navigationIntent?: CompletionNavigationIntent | 'paused'
  directAssessmentRunning: boolean
  notice?: string
  actions: CompletionAction[]
}

export interface CompletionActionInput {
  action: CompletionActionName
  profileId?: string
  goalId?: string
  intent?: CompletionNavigationIntent
}

export interface CompletionTreeWaiver {
  sectionTitle: CompletionTitle
  assessments: { goalId: string; title: CompletionTitle }[]
  assessmentCount?: number
}

/** Exact authored assessment references only; prerequisites never imply coverage. */
export const completionAssessmentsForGoal = (completion: LevelCompletion | null, goalId: string) => {
  if (!completion || completion.calculationStatus === 'invalid' || completion.calculationStatus === 'unavailable') return []
  const profiles = completion.profileId
    ? (completion.calculationStatus === 'valid'
      ? [{ profileId: completion.profileId, title: completion.title, assessments: completion.assessments }] : [])
    : completion.profileOptions
  return profiles.flatMap(profile => (profile.assessments ?? [])
    .filter(assessment => assessment.goalId === goalId)
    .map(assessment => ({ profileId: profile.profileId, profileTitle: profile.title, assessment })))
}

/** Annotate only the backend's current scoped waivers; never infer mastery or coverage. */
export const completionWaiversForTree = (
  completion: LevelCompletion | null,
  stale: boolean,
): ReadonlyMap<string, CompletionTreeWaiver> => {
  const result = new Map<string, CompletionTreeWaiver>()
  if (stale || completion?.calculationStatus !== 'valid' || !completion.profileId) return result
  const details = new Map(completion.waiverDetails?.map((detail) => [detail.goalId, detail]))
  for (const goalId of completion.waivedTargetGoalIds) {
    const detail = details.get(goalId)
    result.set(goalId, {
      sectionTitle: completion.title,
      assessments: detail?.assessments ?? [],
      assessmentCount: detail?.assessmentCount,
    })
  }
  return result
}

export const requiresCompletionExitConfirmation = (completion: LevelCompletion, action: CompletionActionInput): boolean => (
  completion.directAssessmentRunning && ['leaveProfile', 'selectProfile', 'learnGoal', 'retryAssessment', 'includeTarget', 'includeSupport'].includes(action.action)
)

const invalid = () => new Error('Invalid level-completion response')
const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid()
  return value as Record<string, unknown>
}
const text = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim() || value.length > 4096) throw invalid()
  return value
}
const optionalText = (value: unknown): string | undefined => value === null || value === undefined ? undefined : text(value)
const integer = (value: unknown): number => {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw invalid()
  return Number(value)
}
const bool = (value: unknown): boolean => {
  if (typeof value !== 'boolean') throw invalid()
  return value
}
const list = (value: unknown): unknown[] => {
  if (!Array.isArray(value) || value.length > 1000) throw invalid()
  return value
}
const title = (value: unknown): CompletionTitle => {
  const source = record(value)
  const result: CompletionTitle = {}
  for (const [key, value] of Object.entries(source)) result[key] = text(value)
  return result
}
const intent = (value: unknown): CompletionNavigationIntent | undefined => {
  if (value === null || value === undefined) return undefined
  if (value !== 'required' && value !== 'support' && value !== 'voluntary') throw invalid()
  return value
}
const actionName = (value: unknown): CompletionActionName => {
  if (value !== 'selectProfile' && value !== 'leaveProfile' && value !== 'pauseProfile' && value !== 'learnGoal' && value !== 'endAssessment' && value !== 'retryAssessment' && value !== 'includeTarget' && value !== 'includeSupport') throw invalid()
  return value
}

const assessment = (value: unknown): CompletionAssessment => {
  const source = record(value)
  const result = {
    goalId: text(source.goalId), title: title(source.title),
    mastered: bool(source.mastered), startAvailable: bool(source.startAvailable),
    unavailableReason: optionalText(source.unavailableReason),
  }
  if (result.mastered && result.startAvailable) throw invalid()
  return result
}

/** Read the one projection supplied with the learner state; never calculate mastery here. */
export const parseLevelCompletion = (value: unknown): LevelCompletion | null => {
  if (value === null || value === undefined) return null
  const source = record(value)
  const status = source.calculationStatus
  if (!['valid', 'unresolved', 'invalid', 'notApplicable', 'unavailable'].includes(String(status))) throw invalid()
  const result: LevelCompletion = {
    calculationStatus: status as CompletionCalculationStatus,
    contextRef: optionalText(source.contextRef),
    profileId: optionalText(source.profileId),
    profileRevision: optionalText(source.profileRevision),
    curriculumGeneration: optionalText(source.curriculumGeneration),
    learnerRevision: integer(source.learnerRevision),
    title: title(source.title ?? {}),
    masteredTargetCount: integer(source.masteredTargetCount),
    waivedTargetCount: integer(source.waivedTargetCount),
    pendingTargetCount: integer(source.pendingTargetCount),
    targetCount: integer(source.targetCount),
    masteredAssessmentCount: integer(source.masteredAssessmentCount),
    requiredAssessmentCount: integer(source.requiredAssessmentCount),
    waivedTargetGoalIds: list(source.waivedTargetGoalIds).map(text),
    waiverDetails: list(source.waiverDetails ?? []).map((value) => {
      const detail = record(value)
      const assessments = list(detail.assessments).map((value) => {
        const assessment = record(value)
        return { goalId: text(assessment.goalId), title: title(assessment.title) }
      })
      const assessmentCount = integer(detail.assessmentCount)
      if (!assessmentCount || assessments.length > assessmentCount || assessments.length > 3) throw invalid()
      return { goalId: text(detail.goalId), title: title(detail.title), ruleId: text(detail.ruleId), assessments, assessmentCount }
    }),
    assessments: list(source.assessments).map(assessment),
    profileOptions: list(source.profileOptions).map((value) => {
      const option = record(value)
      const targetCount = option.targetCount == null ? undefined : integer(option.targetCount)
      const requiredAssessmentCount = option.requiredAssessmentCount == null ? undefined : integer(option.requiredAssessmentCount)
      if ((targetCount === undefined) !== (requiredAssessmentCount === undefined)
          || (requiredAssessmentCount !== undefined && (requiredAssessmentCount === 0 || requiredAssessmentCount > targetCount!))) throw invalid()
      const assessments = list(option.assessments ?? []).map(assessment)
      if (assessments.length > 24 || new Set(assessments.map(entry => entry.goalId)).size !== assessments.length
          || (requiredAssessmentCount !== undefined && assessments.length > requiredAssessmentCount)) throw invalid()
      return { profileId: text(option.profileId), title: title(option.title), targetCount, requiredAssessmentCount, assessments }
    }),
    navigationIntent: source.navigationIntent === 'paused' ? 'paused' : intent(source.navigationIntent),
    directAssessmentRunning: bool(source.directAssessmentRunning),
    notice: optionalText(source.notice),
    actions: list(source.actions).map((value) => {
      const action = record(value)
      return { action: actionName(action.action), goalId: optionalText(action.goalId), title: title(action.title), intent: intent(action.intent) }
    }),
  }
  if (result.profileOptions.length > 24) throw invalid()
  if (status === 'valid') {
    result.complete = bool(source.complete)
    if (!result.profileId || !result.contextRef
      || result.masteredTargetCount + result.waivedTargetCount + result.pendingTargetCount !== result.targetCount
      || result.masteredAssessmentCount > result.requiredAssessmentCount
      || result.requiredAssessmentCount === 0
      || result.requiredAssessmentCount > result.targetCount
      || result.waivedTargetGoalIds.length > result.waivedTargetCount
      || result.complete !== (result.pendingTargetCount === 0 && result.masteredAssessmentCount === result.requiredAssessmentCount)) throw invalid()
  } else if (source.complete !== null && source.complete !== undefined) {
    throw invalid()
  }
  for (const entries of [result.waivedTargetGoalIds, result.assessments.map((entry) => entry.goalId), result.profileOptions.map((entry) => entry.profileId)]) {
    if (new Set(entries).size !== entries.length) throw invalid()
  }
  if ((result.waiverDetails?.length ?? 0) > 3 || new Set(result.waiverDetails?.map((entry) => entry.goalId)).size !== result.waiverDetails?.length
      || result.waiverDetails?.some((entry) => !result.waivedTargetGoalIds.includes(entry.goalId))) throw invalid()
  return result
}

export const completionLabel = (value: CompletionTitle, language: string, fallback = ''): string => (
  value[language.startsWith('en') ? 'en' : 'de'] ?? value.de ?? value.en ?? fallback
)

export const completionNotice = (code: string, language: string): string => {
  const en = language.startsWith('en')
  const messages: Record<string, [string, string]> = {
    completion_generation_unavailable: ['Dieser Lernabschnitt ist vorübergehend nicht verfügbar. Bitte lade den aktuellen Stand erneut.', 'This learning section is temporarily unavailable. Please reload the current state.'],
    completion_workflow_invalid: ['Dein bisheriger Abschlussweg kann nicht fortgesetzt werden. Bitte wähle deinen Lernweg erneut.', 'Your previous completion route cannot be continued. Please choose your learning route again.'],
    completion_generation_changed: ['Die Lerninhalte wurden aktualisiert. Bitte wähle den Abschnitt erneut. Dein Lernfortschritt bleibt erhalten.', 'The learning content was updated. Please choose the section again. Your progress is retained.'],
    completion_profile_changed: ['Die Regeln für diesen Lernabschnitt wurden aktualisiert. Bitte wähle den Abschnitt erneut. Dein Lernfortschritt bleibt erhalten.', 'The rules for this learning section were updated. Please choose the section again. Your progress is retained.'],
    completion_scope_changed: ['Dieser Abschnitt passt nicht mehr zu deinem geänderten Persönlichen Lehrplan. Bitte wähle einen passenden Abschnitt.', 'This section no longer matches your changed Personal Curriculum. Please choose an applicable section.'],
    completion_scope_unresolved: ['Für diesen Abschnitt fehlen noch Angaben in deinem Persönlichen Lehrplan. Vervollständige ihn im Cockpit.', 'This section needs more information in your Personal Curriculum. Complete it in the Cockpit.'],
    completion_coach_contract_unsupported: ['Diese Coach-Verbindung unterstützt den gewählten Abschlussweg noch nicht. Nutze dafür eine unterstützte Verbindung oder kehre bewusst zum regulären Lernweg zurück.', 'This coach connection does not yet support the selected completion route. Use a supported connection or deliberately return to the regular learning route.'],
    completion_assessment_owned_elsewhere: ['Die Prüfung läuft in einer anderen Coach-Sitzung. Setze sie dort fort oder beende sie bewusst im Cockpit.', 'The assessment is running in another coach session. Continue there or deliberately end it in the Cockpit.'],
    completion_profile_invalid: ['Dieser Lernabschnitt ist gerade nicht verfügbar. Du kannst zum regulären Lernweg zurückkehren.', 'This learning section is currently unavailable. You can return to the regular learning route.'],
    completion_mastery_unavailable: ['Dein Lernstand kann gerade nicht zuverlässig geladen werden. Bitte versuche es erneut.', 'Your progress cannot currently be loaded reliably. Please try again.'],
  }
  return messages[code]?.[en ? 1 : 0] ?? (en ? 'This learning section is currently unavailable.' : 'Dieser Lernabschnitt ist gerade nicht verfügbar.')
}

export const completionUnavailableReason = (code: string, language: string): string => {
  const en = language.startsWith('en')
  if (code === 'assessment_running') return en ? 'Another assessment is already running.' : 'Eine andere Prüfung läuft bereits.'
  if (code === 'coach_contract_unsupported') return en ? 'This direct assessment requires a supported Claude connection.' : 'Diese direkte Prüfung benötigt eine unterstützte Claude-Verbindung.'
  return en ? 'This assessment cannot currently be started.' : 'Diese Prüfung kann gerade nicht gestartet werden.'
}

/** Public goal/profile references only. Authorization is checked at the authenticated launch. */
export const buildCompletionRouteStartHref = (profileId?: string): string => profileId
  ? `/?${new URLSearchParams({ start: 'coach', completionRoute: text(profileId) })}`
  : '/?start=coach'

export const buildCompletionAssessmentStartHref = (choice: CompletionAssessmentStart): string => {
  integer(choice.expectedRevision)
  return `/?${new URLSearchParams({
    start: 'coach', completionProfile: text(choice.profileId), completionGoal: text(choice.goalId),
    completionRevision: String(choice.expectedRevision),
    ...(choice.restartCurrent ? { completionRetry: '1' } : {}),
  })}`
}

export const readCompletionAssessmentStart = (search: string): CompletionAssessmentStart | null => {
  const params = new URLSearchParams(search)
  const keys = ['completionProfile', 'completionGoal', 'completionRevision']
  if (!keys.some((key) => params.has(key))) return null
  if (keys.some((key) => params.getAll(key).length !== 1)) throw invalid()
  const retry = params.get('completionRetry')
  if (params.getAll('completionRetry').length > 1 || (retry !== null && retry !== '1')) throw invalid()
  const revision = params.get('completionRevision') ?? ''
  if (!/^\d+$/u.test(revision)) throw invalid()
  return {
    profileId: text(params.get('completionProfile')),
    goalId: text(params.get('completionGoal')),
    expectedRevision: integer(Number(revision)),
    ...(retry === '1' ? { restartCurrent: true as const } : {}),
  }
}

export class LevelCompletionApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(status === 409 ? 'Completion choice is stale' : 'Completion choice failed')
    this.name = 'LevelCompletionApiError'
    this.status = status
  }
}

export const requestLevelCompletionAction = async (
  skillpilotId: string,
  action: CompletionActionInput,
  expectedRevision: number,
  options: { apiBase?: string; fetchImpl?: typeof fetch; signal?: AbortSignal } = {},
): Promise<unknown> => {
  const learnerId = sanitizeSkillpilotId(skillpilotId)
  if (!learnerId) throw new Error('Missing learner')
  integer(expectedRevision)
  actionName(action.action)
  intent(action.intent)
  const apiBase = (options.apiBase ?? import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/u, '')
  const response = await (options.fetchImpl ?? fetch)(`${apiBase}/api/ui/learners/${encodeURIComponent(learnerId)}/level-completion/actions`, {
    method: 'POST', credentials: 'include', signal: options.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: action.action, profileId: optionalText(action.profileId), goalId: optionalText(action.goalId), intent: action.intent, expectedRevision }),
  })
  if (!response.ok) throw new LevelCompletionApiError(response.status)
  return response.json()
}
