import assert from 'node:assert/strict'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

const localStorage = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: localStorage })
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: {
    location: {
      origin: 'https://skillpilot.test',
      pathname: '/trainer',
      search: '',
      hash: '',
    },
    history: {
      state: null,
      replaceState: () => undefined,
    },
  },
})

const requests: Array<{ url: string; init?: RequestInit }> = []
let invitationResponse: Record<string, unknown> = {
  invitationId: 'invitation-1',
  memberId: 'member-1',
  invitationUrl: '/betreuung#invite=spti_secret',
  status: 'PENDING',
}
Object.defineProperty(globalThis, 'fetch', {
  configurable: true,
  value: async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input)
    requests.push({ url, init })
    if (url.endsWith('/workspaces')) {
      return Response.json({ workspaceId: 'workspace-1', accessToken: 'sptw_secret' }, { status: 201 })
    }
    if (url.endsWith('/courses')) {
      return Response.json({ courseId: 'course-1', courseLabel: 'Einzelbetreuung' }, { status: 201 })
    }
    if (url.endsWith('/invitations')) {
      return Response.json(invitationResponse, { status: 201 })
    }
    if (url.endsWith('/mastery')) {
      return Response.json({
        memberId: 'member-1',
        landscapeId: 'physics',
        personalizationFingerprint: 'sha256:projection-a',
        mastery: { goal_a: 0.75 },
      })
    }
    throw new Error(`Unexpected request ${url}`)
  },
})

const {
  buildLinkedClassSession,
  clearTeacherPendingSupervision,
  clearTeacherPendingSupervisionSnapshot,
  createTeacherCourse,
  createTeacherInvitation,
  createTeacherWorkspace,
  findTeacherWorkspaceCredential,
  getTeacherPendingSupervisionRecordSnapshot,
  getTeacherMemberMastery,
  isLinkedClassSession,
  loadTeacherPendingSupervision,
  readTeacherMasteryValue,
  removeTeacherWorkspaceCredential,
  saveTeacherPendingCleanup,
  saveTeacherPendingInvitation,
  selectLinkedSubject,
  TEACHER_PENDING_SUPERVISION_STORAGE_KEY,
  toFragmentInvitationUrl,
} = await import('./teacherSupervision')

const canonicalMasteryGoalId = 'cf474eab-1379-4877-907e-58b0892ce734'
const legacyMasteryGoalKey = 'cf474eab_1379_4877_907e_58b0892ce734'
assert.equal(
  readTeacherMasteryValue({ [canonicalMasteryGoalId]: 0.75 }, canonicalMasteryGoalId, legacyMasteryGoalKey),
  0.75,
  'teacher mastery reads the canonical UUID key returned by the current backend',
)
assert.equal(
  readTeacherMasteryValue({ [legacyMasteryGoalKey]: 0.5 }, canonicalMasteryGoalId, legacyMasteryGoalKey),
  0.5,
  'teacher mastery keeps the legacy normalized-key fallback',
)
assert.equal(
  readTeacherMasteryValue(
    { [canonicalMasteryGoalId]: 0, [legacyMasteryGoalKey]: 1 },
    canonicalMasteryGoalId,
    legacyMasteryGoalKey,
  ),
  0,
  'an explicit canonical zero wins over stale legacy mastery',
)

const credential = await createTeacherWorkspace()
assert.deepEqual(credential, { workspaceId: 'workspace-1', accessToken: 'sptw_secret' })
assert.equal(requests[0].init?.body, '{}', 'workspace creation requires an explicit empty JSON body')
assert.equal(new Headers(requests[0].init?.headers).get('Content-Type'), 'application/json')
assert.deepEqual(findTeacherWorkspaceCredential('workspace-1'), credential)
assert.equal(findTeacherWorkspaceCredential('workspace-missing'), null, 'workspace restoration never falls back to another capability')

await createTeacherCourse(credential, {
  courseLabel: 'SkillPilot-Einzelbetreuung',
  teacherDisplayName: 'Frau Beispiel',
})
assert.equal(
  new Headers(requests[1].init?.headers).get('Authorization'),
  'Bearer sptw_secret',
  'teacher requests use the separately stored workspace capability',
)

const invitation = await createTeacherInvitation(credential, 'course-1', 'learner-secret')
assert.equal(invitation.memberId, 'member-1')
invitationResponse = {
  invitationId: 'invitation-2',
  invitationUrl: '/betreuung#invite=spti_invalid',
  status: 'PENDING',
}
await assert.rejects(
  () => createTeacherInvitation(credential, 'course-1', 'learner-secret'),
  /Invalid teacher invitation response/u,
  'an invitation response without its guaranteed memberId fails fast',
)

const member = {
  memberId: 'member-1',
  status: 'ACTIVE',
  personalizationFingerprint: 'sha256:projection-a',
  rootLandscapeId: 'gymnasium-root',
  scope: { jurisdiction: 'DE-HE', durationModel: 'G9', stage: 'SekII' },
  subjects: [
    { landscapeId: 'math', title: 'Mathematik', filterId: 'LK' },
    { landscapeId: 'physics', title: 'Physik', filterId: 'LK' },
  ],
}
const session = buildLinkedClassSession({
  className: 'Einzelbetreuung',
  learnerAlias: 'Alex',
  workspaceId: credential.workspaceId,
  courseId: 'course-1',
  member,
})
assert.equal(isLinkedClassSession(session), true)
assert.deepEqual(session.students, [{ id: 'member-1', name: 'Alex', accessMode: 'teacher-membership' }])
assert.deepEqual(
  session.linkedSupervision?.subjects.map((subject) => subject.title),
  ['Mathematik', 'Physik'],
  'one supervision card retains all approved subject contexts',
)
assert.equal(session.landscapeId, 'math')
assert.equal(session.personalConfig?.math.filterId, 'LK')
assert.equal(session.personalConfig?.['gymnasium-root'].filterId, 'DE-HE')
assert.equal(JSON.stringify(session).includes('sptw_secret'), false, 'workspace capability is never serialized in ClassSession')

const physicsSession = selectLinkedSubject(session, 'physics')
assert.equal(physicsSession.landscapeId, 'physics')
assert.equal(physicsSession.currentGoalId, undefined)
assert.equal(physicsSession.students[0].id, 'member-1')

await getTeacherMemberMastery(credential, 'course-1', 'member-1', 'physics')
const masteryRequest = requests.at(-1)
assert(masteryRequest)
assert.match(masteryRequest.url, /\/courses\/course-1\/members\/member-1\/mastery$/u)
assert.equal(masteryRequest.init?.method, 'POST')
assert.deepEqual(JSON.parse(String(masteryRequest.init?.body)), { landscapeId: 'physics' })
assert.equal(masteryRequest.url.includes('/learners/'), false, 'linked mastery never uses direct learner-ID routes')

assert.equal(
  toFragmentInvitationUrl('/betreuung#invite=spti_secret'),
  'https://skillpilot.test/betreuung#invite=spti_secret',
  'invitation secrets stay in the URL fragment',
)
assert.throws(
  () => toFragmentInvitationUrl('/betreuung?invite=spti_query_secret'),
  /Invalid teacher invitation response/u,
  'query-string invitation secrets are rejected fail-closed',
)

const permanentLearnerId = '11111111-2222-4333-8444-555555555555'
assert.equal(saveTeacherPendingInvitation({
  workspaceId: 'workspace-1',
  courseId: 'course-1',
  memberId: 'member-1',
  invitationUrl: '/betreuung#invite=spti_pending_secret',
  className: 'Lokale Einzelbetreuung',
  learnerAlias: 'Alex',
}), false, 'an invitation cannot be persisted before its cleanup marker')
assert.equal(saveTeacherPendingCleanup({ workspaceId: 'workspace-1', courseId: 'course-1' }), true)
assert.equal(saveTeacherPendingInvitation({
  workspaceId: 'workspace-1',
  courseId: 'course-1',
  memberId: 'member-1',
  invitationUrl: '/betreuung#invite=spti_pending_secret',
  className: 'Lokale Einzelbetreuung',
  learnerAlias: 'Alex',
}), true)
const storedPendingRaw = localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
assert(storedPendingRaw)
assert.equal(storedPendingRaw.includes(permanentLearnerId), false, 'pending state never stores a SkillPilot ID')
assert.equal(storedPendingRaw.includes('sptw_secret'), false, 'pending state never stores the workspace capability')
assert.deepEqual(JSON.parse(storedPendingRaw), {
  version: 1,
  kind: 'invitation',
  workspaceId: 'workspace-1',
  courseId: 'course-1',
  memberId: 'member-1',
  invitationUrl: 'https://skillpilot.test/betreuung#invite=spti_pending_secret',
  className: 'Lokale Einzelbetreuung',
  learnerAlias: 'Alex',
})
assert.deepEqual(loadTeacherPendingSupervision(), {
  version: 1,
  kind: 'invitation',
  workspaceId: 'workspace-1',
  courseId: 'course-1',
  memberId: 'member-1',
  invitationUrl: 'https://skillpilot.test/betreuung#invite=spti_pending_secret',
  className: 'Lokale Einzelbetreuung',
  learnerAlias: 'Alex',
})

assert.equal(saveTeacherPendingCleanup({ workspaceId: 'workspace-1', courseId: 'course-1' }), true)
assert.deepEqual(loadTeacherPendingSupervision(), {
  version: 1,
  kind: 'cleanup-required',
  workspaceId: 'workspace-1',
  courseId: 'course-1',
})
assert.equal(clearTeacherPendingSupervision({ workspaceId: 'workspace-other', courseId: 'course-other' }), true)
assert.notEqual(
  localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY),
  null,
  'a stale tab cannot clear another pending course',
)
assert.equal(clearTeacherPendingSupervision({ workspaceId: 'workspace-1', courseId: 'course-1' }), true)
assert.equal(loadTeacherPendingSupervision(), null)

assert.equal(saveTeacherPendingInvitation({
  workspaceId: '',
  courseId: 'course-invalid',
  memberId: 'member-invalid',
  invitationUrl: '/betreuung#invite=spti_pending_secret',
  className: 'Ungültig',
  learnerAlias: 'Alex',
}), false, 'invalid pending values are rejected before they reach storage')
assert.equal(localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY), null)

localStorage.setItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY, JSON.stringify({
  version: 1,
  kind: 'invitation',
  workspaceId: 'workspace-1',
  courseId: 'course-1',
  memberId: 'member-1',
  invitationUrl: '/betreuung#invite=spti_pending_secret',
  className: 'Lokale Einzelbetreuung',
  learnerAlias: 'Alex',
  skillpilotId: permanentLearnerId,
}))
assert.deepEqual(loadTeacherPendingSupervision(), {
  version: 1,
  kind: 'cleanup-required',
  workspaceId: 'workspace-1',
  courseId: 'course-1',
}, 'records with unexpected identity fields are reduced to a token-free cleanup pointer')
const sanitizedPendingRaw = localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
assert(sanitizedPendingRaw)
assert.equal(sanitizedPendingRaw.includes(permanentLearnerId), false)
assert.equal(sanitizedPendingRaw.includes('spti_pending_secret'), false)
assert.equal(clearTeacherPendingSupervision({ workspaceId: 'workspace-1', courseId: 'course-1' }), true)
localStorage.setItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY, '{"invalid":true}')
const invalidSnapshot = getTeacherPendingSupervisionRecordSnapshot()
assert(invalidSnapshot)
assert.equal(clearTeacherPendingSupervisionSnapshot('{"different":true}'), true)
assert.equal(localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY), invalidSnapshot)
assert.equal(clearTeacherPendingSupervisionSnapshot(invalidSnapshot), true)
assert.equal(localStorage.getItem(TEACHER_PENDING_SUPERVISION_STORAGE_KEY), null)

assert.equal(removeTeacherWorkspaceCredential({
  workspaceId: 'workspace-1',
  accessToken: 'sptw_wrong_secret',
}), false, 'credential cleanup requires the exact retained capability')
assert.deepEqual(findTeacherWorkspaceCredential('workspace-1'), credential)
assert.equal(removeTeacherWorkspaceCredential(credential), true)
assert.equal(findTeacherWorkspaceCredential('workspace-1'), null)

console.log('teacher supervision model and client tests passed')
