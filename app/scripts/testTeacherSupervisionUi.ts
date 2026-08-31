import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (relativePath: string) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')

const appSource = source('src/App.tsx')
const setupSource = source('src/components/ClassSetup.tsx')
const trainerSource = source('src/views/TrainerView.tsx')
const consentSource = source('src/views/TeacherSupervisionConsentView.tsx')
const clientSource = source('src/utils/teacherSupervision.ts')

assert(appSource.includes("'/betreuung'") && appSource.includes('TeacherSupervisionConsentView'))
assert(
  setupSource.includes('TEACHER_SUPERVISION_ENABLED')
    && setupSource.includes("creationMode === 'linked'"),
  'the additive link option is visible only behind the explicit rollout flag',
)
assert(
  setupSource.includes("setExistingSkillpilotId('')")
    && !setupSource.includes('skillpilotId: existingSkillpilotId'),
  'the permanent learner ID is cleared after binding and never enters ClassSession',
)
assert(
  setupSource.includes('deleteTeacherCourse(credential, courseId)')
    && setupSource.includes('handleCancelPendingInvitation'),
  'failed and cancelled wizards clean up their server-side course',
)
assert(
  setupSource.includes('member.memberId === invitation.memberId')
    && setupSource.includes('memberId: invitation.memberId'),
  'polling links only the exact invited member and never the first active course member',
)
assert(
  clientSource.includes("path.hash = new URLSearchParams({ invite: token }).toString()")
    && !clientSource.includes("parsed.searchParams.get('invite')"),
  'invitation tokens use URL fragments only',
)
assert(
  clientSource.includes("'/learner-memberships/list'")
    && clientSource.includes("'/learner-memberships/revoke'")
    && !clientSource.includes('`/learners/${'),
  'learner access keys are sent in no-store POST bodies, never in supervision URLs',
)
assert(
  consentSource.includes('clearInvitationTokenFragment()')
    && consentSource.includes("previewTeacherInvitation(invitationToken)"),
  'the consent route removes the fragment before previewing the invitation',
)
assert(
  consentSource.includes('copy.membershipExpired'),
  'expired invitations are not presented as still pending',
)
assert(
  trainerSource.indexOf('if (isLinkedClassSession(activeClass)) {')
    < trainerSource.indexOf("toApi(`/api/ui/learners/${encodeURIComponent(student.id)}/mastery`)"),
  'linked mastery is handled before the legacy direct learner-ID branch',
)
assert(
  trainerSource.includes('getTeacherMemberMastery(')
    && trainerSource.includes('readOnly={activeClassIsLinked}')
    && trainerSource.includes('if (activeClassIsLinked) {'),
  'linked classes use membership mastery and keep plan controls read-only',
)
assert(
  trainerSource.includes("session.source === 'linked-supervision'")
    && trainerSource.includes('!isLinkedClassSession(c) && ('),
  'linked sessions cannot be imported and do not expose the full class export',
)
assert(
  trainerSource.includes('idx >= 0 && isLinkedClassSession(classes[idx])'),
  'a legacy import cannot overwrite an existing linked supervision class with the same local ID',
)
assert(
  clientSource.includes("method: 'POST'")
    && clientSource.includes('body: JSON.stringify({ landscapeId })')
    && !clientSource.includes('/mastery?'),
  'linked mastery scope is sent in a POST body rather than exposed in the URL',
)
assert(
  trainerSource.includes('findTeacherWorkspaceCredential(activeLinkedWorkspaceId)')
    && trainerSource.includes("{ status: 'missing-token' }"),
  'a missing device capability fails closed instead of falling back to learner IDs',
)
assert(
  trainerSource.includes('`${activeClass.id}:${activeClass.landscapeId}`')
    && trainerSource.includes('classId={activeCoursePlanStorageId}'),
  'one linked card keeps independent local course plans for each subject context',
)
assert.match(
  trainerSource,
  /const getStudentMastery = useMemo\([\s\S]*?const masteryCache = new Map[\s\S]*?\[classGoalIndexAll, currentLearnerId, masteryByStudent, goalShortKeyMap\]\)/,
  'mastery aggregation cache must be rebuilt when async learner mastery or the active subject changes',
)

console.log('teacher supervision UI security contract tests passed')
