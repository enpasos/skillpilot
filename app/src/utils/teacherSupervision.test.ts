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
      return Response.json({ mastery: { goal_a: 0.75 } })
    }
    throw new Error(`Unexpected request ${url}`)
  },
})

const {
  buildLinkedClassSession,
  createTeacherCourse,
  createTeacherInvitation,
  createTeacherWorkspace,
  findTeacherWorkspaceCredential,
  getTeacherMemberMastery,
  isLinkedClassSession,
  selectLinkedSubject,
  toFragmentInvitationUrl,
} = await import('./teacherSupervision')

const credential = await createTeacherWorkspace()
assert.deepEqual(credential, { workspaceId: 'workspace-1', accessToken: 'sptw_secret' })
assert.equal(requests[0].init?.body, '{}', 'workspace creation requires an explicit empty JSON body')
assert.equal(new Headers(requests[0].init?.headers).get('Content-Type'), 'application/json')
assert.deepEqual(findTeacherWorkspaceCredential('workspace-1'), credential)

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

console.log('teacher supervision model and client tests passed')
