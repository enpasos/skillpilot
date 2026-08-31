import type {
  ClassSession,
  LinkedSubjectContext,
  StudentMapping,
  TrainerClassCurriculumConfigEntry,
  TrainerClassCurriculumConfig,
} from '../trainerTypes'
import type { MasteryMap } from '../learnerTypes'

const apiBase = (import.meta.env?.VITE_API_BASE ?? '').replace(/\/+$/, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)
const API_ROOT = '/api/ui/teacher-supervision/v1'

export const TEACHER_SUPERVISION_ENABLED = import.meta.env?.VITE_TEACHER_SUPERVISION_ENABLED === 'true'

export const TEACHER_WORKSPACE_STORAGE_KEY = 'skillpilot_teacher_workspace_v1'
export const TEACHER_PENDING_SUPERVISION_STORAGE_KEY = 'skillpilot_teacher_pending_supervision_v1'

export const readTeacherMasteryValue = (
  mastery: MasteryMap,
  canonicalGoalId: string,
  legacyShortKey?: string,
): number => {
  const canonicalValue = mastery[canonicalGoalId]
  if (canonicalValue !== undefined) return canonicalValue
  return legacyShortKey ? mastery[legacyShortKey] ?? 0 : 0
}

export interface TeacherWorkspaceCredential {
  workspaceId: string
  accessToken: string
}

export interface TeacherSupervisionScope {
  rootLandscapeId?: string
  jurisdiction?: string
  filterId?: string
  durationModel?: string
  stage?: string
}

export interface TeacherSupervisionSubject {
  landscapeId: string
  title: string
  filterId?: string
  durationModel?: string
  stage?: string
}

export interface TeacherSupervisionMember {
  memberId: string
  status: string
  personalizationFingerprint?: string
  rootLandscapeId?: string
  scope?: TeacherSupervisionScope
  subjects: TeacherSupervisionSubject[]
}

export interface TeacherSupervisionCourse {
  courseId: string
  courseLabel: string
  teacherDisplayName?: string
  members: TeacherSupervisionMember[]
}

export interface TeacherMemberMasteryProjection {
  memberId: string
  landscapeId: string
  personalizationFingerprint: string
  mastery: MasteryMap
}

export interface TeacherCourseCreated {
  courseId: string
  courseLabel?: string
  teacherDisplayName?: string
}

export interface TeacherInvitation {
  invitationId: string
  memberId: string
  invitationUrl: string
  status: string
  expiresAt?: string
}

export interface TeacherInvitationPreview {
  courseLabel: string
  teacherDisplayName?: string
  status: string
  expiresAt?: string
  requestedCapabilities: string[]
}

export interface LearnerTeacherMembership {
  memberId: string
  courseLabel: string
  teacherDisplayName?: string
  status: string
  createdAt?: string
}

interface StoredTeacherWorkspaces {
  version: 1
  credentials: TeacherWorkspaceCredential[]
}

export interface StoredTeacherPendingInvitation {
  version: 1
  kind: 'invitation'
  workspaceId: string
  courseId: string
  memberId: string
  invitationUrl: string
  className: string
  learnerAlias: string
}

export interface StoredTeacherPendingCleanup {
  version: 1
  kind: 'cleanup-required'
  workspaceId: string
  courseId: string
}

export type StoredTeacherPendingSupervision =
  | StoredTeacherPendingInvitation
  | StoredTeacherPendingCleanup

export class TeacherSupervisionApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Teacher supervision request failed (${status})`)
    this.name = 'TeacherSupervisionApiError'
    this.status = status
  }
}

export const isTeacherSupervisionNotFound = (error: unknown) =>
  error instanceof TeacherSupervisionApiError && error.status === 404

const requestJson = async <T>(
  path: string,
  init: RequestInit = {},
  credential?: TeacherWorkspaceCredential,
): Promise<T> => {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (credential) {
    headers.set('Authorization', `Bearer ${credential.accessToken}`)
  }

  const response = await fetch(toApi(`${API_ROOT}${path}`), { ...init, headers })
  if (!response.ok) {
    throw new TeacherSupervisionApiError(response.status)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return await response.json() as T
}

const normalizeWorkspaceCredential = (value: unknown): TeacherWorkspaceCredential | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (typeof record.workspaceId !== 'string' || typeof record.accessToken !== 'string') return null
  if (!record.workspaceId.trim() || !record.accessToken.trim()) return null
  return {
    workspaceId: record.workspaceId,
    accessToken: record.accessToken,
  }
}

export const loadTeacherWorkspaceCredentials = (): TeacherWorkspaceCredential[] => {
  try {
    const raw = localStorage.getItem(TEACHER_WORKSPACE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return []
    const credentials = (parsed as Partial<StoredTeacherWorkspaces>).credentials
    if (!Array.isArray(credentials)) return []
    return credentials
      .map(normalizeWorkspaceCredential)
      .filter((credential): credential is TeacherWorkspaceCredential => credential !== null)
  } catch {
    return []
  }
}

export const findTeacherWorkspaceCredential = (workspaceId?: string) => {
  const credentials = loadTeacherWorkspaceCredentials()
  if (!workspaceId) return credentials[0] ?? null
  return credentials.find((credential) => credential.workspaceId === workspaceId) ?? null
}

export const removeTeacherWorkspaceCredential = (expected: TeacherWorkspaceCredential) => {
  try {
    const current = loadTeacherWorkspaceCredentials()
    const matching = current.find((credential) => credential.workspaceId === expected.workspaceId)
    if (!matching || matching.accessToken !== expected.accessToken) return false
    const stored: StoredTeacherWorkspaces = {
      version: 1,
      credentials: current.filter((credential) => credential.workspaceId !== expected.workspaceId),
    }
    localStorage.setItem(TEACHER_WORKSPACE_STORAGE_KEY, JSON.stringify(stored))
    return true
  } catch {
    return false
  }
}

const storeTeacherWorkspaceCredential = (credential: TeacherWorkspaceCredential) => {
  const current = loadTeacherWorkspaceCredentials()
  const next = [
    credential,
    ...current.filter((candidate) => candidate.workspaceId !== credential.workspaceId),
  ]
  const stored: StoredTeacherWorkspaces = { version: 1, credentials: next }
  localStorage.setItem(TEACHER_WORKSPACE_STORAGE_KEY, JSON.stringify(stored))
}

export const createTeacherWorkspace = async (): Promise<TeacherWorkspaceCredential> => {
  const response = await requestJson<TeacherWorkspaceCredential>('/workspaces', {
    method: 'POST',
    body: JSON.stringify({}),
  })
  const credential = normalizeWorkspaceCredential(response)
  if (!credential) throw new Error('Invalid teacher workspace response')
  storeTeacherWorkspaceCredential(credential)
  return credential
}

export const ensureTeacherWorkspace = async (): Promise<TeacherWorkspaceCredential> => (
  findTeacherWorkspaceCredential() ?? await createTeacherWorkspace()
)

export const createTeacherCourse = (
  credential: TeacherWorkspaceCredential,
  input: { courseLabel: string; teacherDisplayName: string },
) => requestJson<TeacherCourseCreated>('/courses', {
  method: 'POST',
  body: JSON.stringify(input),
}, credential)

export const deleteTeacherCourse = (
  credential: TeacherWorkspaceCredential,
  courseId: string,
) => requestJson<void>(`/courses/${encodeURIComponent(courseId)}`, { method: 'DELETE' }, credential)

export const createTeacherInvitation = async (
  credential: TeacherWorkspaceCredential,
  courseId: string,
  skillpilotId: string,
) => {
  const response = await requestJson<TeacherInvitation>(
    `/courses/${encodeURIComponent(courseId)}/invitations`,
    {
      method: 'POST',
      body: JSON.stringify({ skillpilotId }),
    },
    credential,
  )
  if (
    typeof response.invitationId !== 'string'
    || !response.invitationId.trim()
    || typeof response.memberId !== 'string'
    || !response.memberId.trim()
    || typeof response.invitationUrl !== 'string'
    || !response.invitationUrl.trim()
    || typeof response.status !== 'string'
    || !response.status.trim()
  ) {
    throw new Error('Invalid teacher invitation response')
  }
  return response
}

export const getTeacherCourse = (
  credential: TeacherWorkspaceCredential,
  courseId: string,
  signal?: AbortSignal,
) => requestJson<TeacherSupervisionCourse>(
  `/courses/${encodeURIComponent(courseId)}`,
  { signal },
  credential,
)

export const getTeacherMemberMastery = (
  credential: TeacherWorkspaceCredential,
  courseId: string,
  memberId: string,
  landscapeId: string,
  signal?: AbortSignal,
) => requestJson<TeacherMemberMasteryProjection>(
  `/courses/${encodeURIComponent(courseId)}/members/${encodeURIComponent(memberId)}/mastery`,
  {
    method: 'POST',
    body: JSON.stringify({ landscapeId }),
    signal,
  },
  credential,
)

export const previewTeacherInvitation = (invitationToken: string) =>
  requestJson<TeacherInvitationPreview>('/invitations/preview', {
    method: 'POST',
    body: JSON.stringify({ invitationToken }),
  })

export const acceptTeacherInvitation = (
  invitationToken: string,
  skillpilotId: string,
) => requestJson<{ memberId?: string; status: string }>('/invitations/accept', {
  method: 'POST',
  body: JSON.stringify({ invitationToken, skillpilotId, acknowledged: true }),
})

export const listLearnerTeacherMemberships = async (skillpilotId: string) => {
  const response = await requestJson<{ memberships: LearnerTeacherMembership[] } | LearnerTeacherMembership[]>(
    '/learner-memberships/list',
    {
      method: 'POST',
      body: JSON.stringify({ skillpilotId }),
    },
  )
  return Array.isArray(response) ? response : response.memberships
}

export const revokeLearnerTeacherMembership = (
  skillpilotId: string,
  memberId: string,
) => requestJson<void>(
  '/learner-memberships/revoke',
  {
    method: 'POST',
    body: JSON.stringify({ skillpilotId, memberId }),
  },
)

const inviteTokenFromUrl = (value: string) => {
  const parsed = new URL(value, window.location.origin)
  const hashParams = new URLSearchParams(parsed.hash.replace(/^#/u, ''))
  return hashParams.get('invite') ?? ''
}

export const toFragmentInvitationUrl = (value: string) => {
  const token = inviteTokenFromUrl(value)
  if (!token) throw new Error('Invalid teacher invitation response')
  const path = new URL('/betreuung', window.location.origin)
  path.hash = new URLSearchParams({ invite: token }).toString()
  return path.toString()
}

export const readInvitationTokenFromFragment = () => {
  const params = new URLSearchParams(window.location.hash.replace(/^#/u, ''))
  return params.get('invite')?.trim() ?? ''
}

export const clearInvitationTokenFragment = () => {
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
}

const hasExactKeys = (record: Record<string, unknown>, expected: string[]) => {
  const actual = Object.keys(record).sort()
  const normalizedExpected = [...expected].sort()
  return actual.length === normalizedExpected.length
    && actual.every((key, index) => key === normalizedExpected[index])
}

const boundedStoredString = (value: unknown, maxLength: number) => (
  typeof value === 'string' && value.trim() && value.length <= maxLength ? value : null
)

const normalizePendingSupervision = (value: unknown): StoredTeacherPendingSupervision | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (record.version !== 1) return null

  const workspaceId = boundedStoredString(record.workspaceId, 128)
  const courseId = boundedStoredString(record.courseId, 128)
  if (!workspaceId || !courseId) return null

  if (record.kind === 'cleanup-required') {
    if (!hasExactKeys(record, ['version', 'kind', 'workspaceId', 'courseId'])) return null
    return {
      version: 1,
      kind: 'cleanup-required',
      workspaceId,
      courseId,
    }
  }

  if (record.kind !== 'invitation' || !hasExactKeys(record, [
    'version',
    'kind',
    'workspaceId',
    'courseId',
    'memberId',
    'invitationUrl',
    'className',
    'learnerAlias',
  ])) return null

  const memberId = boundedStoredString(record.memberId, 128)
  const invitationUrl = boundedStoredString(record.invitationUrl, 1_024)
  const className = boundedStoredString(record.className, 1_024)
  const learnerAlias = boundedStoredString(record.learnerAlias, 1_024)
  if (!memberId || !invitationUrl || !className || !learnerAlias) return null

  try {
    return {
      version: 1,
      kind: 'invitation',
      workspaceId,
      courseId,
      memberId,
      invitationUrl: toFragmentInvitationUrl(invitationUrl),
      className,
      learnerAlias,
    }
  } catch {
    return null
  }
}

const samePendingCourse = (
  left: Pick<StoredTeacherPendingSupervision, 'workspaceId' | 'courseId'>,
  right: Pick<StoredTeacherPendingSupervision, 'workspaceId' | 'courseId'>,
) => left.workspaceId === right.workspaceId && left.courseId === right.courseId

const writePendingSupervision = (
  value: StoredTeacherPendingSupervision,
  options: { requireExisting?: boolean } = {},
) => {
  try {
    const normalized = normalizePendingSupervision(value)
    if (!normalized) return false
    const currentRaw = localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
    if (!currentRaw && options.requireExisting) return false
    if (currentRaw) {
      const current = normalizePendingSupervision(JSON.parse(currentRaw) as unknown)
      if (!current || !samePendingCourse(current, normalized)) return false
    }
    localStorage.setItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY, JSON.stringify(normalized))
    return true
  } catch {
    return false
  }
}

export const loadTeacherPendingSupervision = (): StoredTeacherPendingSupervision | null => {
  try {
    const raw = localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    const normalized = normalizePendingSupervision(parsed)
    if (normalized) return normalized
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const record = parsed as Record<string, unknown>
      const workspaceId = boundedStoredString(record.workspaceId, 128)
      const courseId = boundedStoredString(record.courseId, 128)
      if (workspaceId && courseId) {
        const cleanup: StoredTeacherPendingCleanup = {
          version: 1,
          kind: 'cleanup-required',
          workspaceId,
          courseId,
        }
        try {
          localStorage.setItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY, JSON.stringify(cleanup))
        } catch {
          // The in-memory cleanup state still prevents polling and preserves the identifiers.
        }
        return cleanup
      }
    }
  } catch {
    // Invalid or unavailable local state must never start polling.
  }
  return null
}

export const getTeacherPendingSupervisionRecordSnapshot = () => {
  try {
    return localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
  } catch {
    return null
  }
}

export const hasTeacherPendingSupervisionRecord = () => (
  getTeacherPendingSupervisionRecordSnapshot() !== null
)

export const saveTeacherPendingInvitation = (
  value: Omit<StoredTeacherPendingInvitation, 'version' | 'kind'>,
) => writePendingSupervision({ version: 1, kind: 'invitation', ...value }, { requireExisting: true })

export const saveTeacherPendingCleanup = (
  value: Omit<StoredTeacherPendingCleanup, 'version' | 'kind'>,
  options: { requireExisting?: boolean } = {},
) => writePendingSupervision({ version: 1, kind: 'cleanup-required', ...value }, options)

export const clearTeacherPendingSupervision = (expected?: { workspaceId: string; courseId: string }) => {
  try {
    if (expected) {
      const currentRaw = localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
      if (!currentRaw) return true
      const current = normalizePendingSupervision(JSON.parse(currentRaw) as unknown)
      if (!current) return false
      if (!samePendingCourse(current, expected)) return true
    }
    localStorage.removeItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export const clearTeacherPendingSupervisionSnapshot = (expectedRaw: string) => {
  try {
    const currentRaw = localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
    if (currentRaw !== expectedRaw) return true
    localStorage.removeItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

const compactEntry = (entry: TrainerClassCurriculumConfigEntry): TrainerClassCurriculumConfigEntry =>
  Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined)) as unknown as TrainerClassCurriculumConfigEntry

export const buildLinkedSubjectContexts = (
  member: TeacherSupervisionMember,
): LinkedSubjectContext[] => {
  const rootLandscapeId = member.rootLandscapeId ?? member.scope?.rootLandscapeId
  return member.subjects.map((subject) => {
    const rootEntry = rootLandscapeId
      ? compactEntry({
          selected: true,
          filterId: member.scope?.jurisdiction ?? member.scope?.filterId,
          durationModel: member.scope?.durationModel,
          stage: member.scope?.stage,
        })
      : null
    const subjectEntry = compactEntry({
      selected: true,
      filterId: subject.filterId,
      durationModel: subject.durationModel ?? member.scope?.durationModel,
      stage: subject.stage ?? member.scope?.stage,
    })
    const personalConfig: TrainerClassCurriculumConfig = {
      ...(rootLandscapeId && rootEntry ? { [rootLandscapeId]: rootEntry } : {}),
      [subject.landscapeId]: subjectEntry,
    }
    const jurisdiction = member.scope?.jurisdiction ?? member.scope?.filterId
    const activeFilter = jurisdiction && jurisdiction.trim().toLowerCase() !== 'all'
      ? jurisdiction
      : subject.filterId && subject.filterId.trim().toLowerCase() !== 'all'
        ? subject.filterId
        : 'all'

    return {
      landscapeId: subject.landscapeId,
      title: subject.title,
      activeFilter,
      personalConfig,
      rootLandscapeId,
    }
  })
}

const isActiveMembership = (status: string) => status.trim().toLowerCase() === 'active'

export const buildLinkedClassSession = (input: {
  className: string
  learnerAlias: string
  workspaceId: string
  courseId: string
  member: TeacherSupervisionMember
  existing?: ClassSession
}): ClassSession => {
  if (!isActiveMembership(input.member.status)) {
    throw new Error('Teacher membership is not active')
  }
  if (!input.member.personalizationFingerprint?.trim()) {
    throw new Error('Teacher membership has no personalization fingerprint')
  }
  const subjects = buildLinkedSubjectContexts(input.member)
  if (subjects.length === 0) throw new Error('Teacher membership has no visible subjects')
  const previousLandscapeId = input.existing?.landscapeId
  const activeSubject = subjects.find((subject) => subject.landscapeId === previousLandscapeId) ?? subjects[0]
  const student: StudentMapping = {
    id: input.member.memberId,
    name: input.learnerAlias,
    accessMode: 'teacher-membership',
  }
  return {
    id: input.existing?.id ?? crypto.randomUUID(),
    name: input.className,
    landscapeId: activeSubject.landscapeId,
    activeFilter: activeSubject.activeFilter,
    personalConfig: activeSubject.personalConfig,
    rootLandscapeId: activeSubject.rootLandscapeId,
    students: [student],
    currentGoalId: previousLandscapeId === activeSubject.landscapeId
      ? input.existing?.currentGoalId
      : undefined,
    source: 'linked-supervision',
    linkedSupervision: {
      workspaceId: input.workspaceId,
      courseId: input.courseId,
      memberId: input.member.memberId,
      personalizationFingerprint: input.member.personalizationFingerprint,
      subjects,
    },
  }
}

export const isLinkedClassSession = (session: ClassSession | null | undefined): session is ClassSession & {
  linkedSupervision: NonNullable<ClassSession['linkedSupervision']>
} => session?.source === 'linked-supervision' && !!session.linkedSupervision

export const selectLinkedSubject = (
  session: ClassSession,
  landscapeId: string,
): ClassSession => {
  if (!isLinkedClassSession(session)) return session
  const subject = session.linkedSupervision.subjects.find((candidate) => candidate.landscapeId === landscapeId)
  if (!subject || subject.landscapeId === session.landscapeId) return session
  return {
    ...session,
    landscapeId: subject.landscapeId,
    activeFilter: subject.activeFilter,
    personalConfig: subject.personalConfig,
    rootLandscapeId: subject.rootLandscapeId,
    currentGoalId: undefined,
  }
}
