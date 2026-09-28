import assert from 'node:assert/strict'
import { type GoalBookPage } from './goalBookModel'
import { fingerprintGoalDescriptionReviewPage } from './validateGoalDescriptionDualRoundResolution'
import { proveMathAtlasReviewSubsetNarrowing } from './mathAtlasReviewSubsetCompatibility'

const bindPage = (page: GoalBookPage): GoalBookPage => ({
  ...page,
  pageFingerprint: fingerprintGoalDescriptionReviewPage(page),
})

const old = bindPage({
  pageNumber: 1,
  navigationOrder: 0,
  treeOrder: 1,
  goalId: 'fixture-goal',
  anchor: 'goal-fixture-goal',
  title: 'Vektoren verstehen',
  description: 'Die lernende Person kann Vektoren deuten.',
  breadcrumbs: ['Vektoren'],
  chapterIds: ['vectors'],
  applicability: [{ jurisdiction: 'DE-HE', scopes: [
    { stage: 'SekII', durationModel: 'G9', courseProfile: 'GK' },
    { stage: 'SekII', durationModel: 'G9', courseProfile: 'LK' },
    { stage: 'SekI', durationModel: 'G9', courseProfile: null },
  ] }],
  requires: [],
  reverseRequires: [],
  externalPrerequisites: [],
  externalReverseRequires: [],
  visualization: null,
  evidenceReview: null,
  goalFingerprint: `sha256:${'1'.repeat(64)}`,
  pageFingerprint: `sha256:${'0'.repeat(64)}`,
})
const withoutGk = bindPage({
  ...old,
  applicability: [{ jurisdiction: 'DE-HE', scopes: old.applicability![0].scopes.slice(1) }],
})
const valid = proveMathAtlasReviewSubsetNarrowing(old, withoutGk)
assert.equal(valid.exactScopeNarrowing, true)
assert.deepEqual(valid.removedScopes, ['DE-HE|SekII|G9|GK'])
assert.deepEqual(valid.addedScopes, [])

const rejects = (candidate: GoalBookPage, why: string): void => {
  assert.equal(proveMathAtlasReviewSubsetNarrowing(old, candidate).exactScopeNarrowing,
    false, why)
}
rejects({ ...withoutGk, pageFingerprint: old.pageFingerprint },
  'changing applicability without a new page fingerprint must fail')
rejects(bindPage({ ...withoutGk, description: 'Different competence' }),
  'changing reviewed text must fail')
rejects(bindPage({ ...withoutGk, visualization: {
  imageUrl: '/different.png', altText: 'Different illustration', source: 'fixture',
} as GoalBookPage['visualization'] }), 'changing reviewed image must fail')
rejects(bindPage({ ...withoutGk, navigationOrder: 2 }),
  'changing review-subset navigation must fail')
rejects(bindPage({ ...old, applicability: [{ jurisdiction: 'DE-HE', scopes: [
  old.applicability![0].scopes[0], old.applicability![0].scopes[2],
] }] }), 'removing an LK scope rather than a GK scope must fail')
rejects(bindPage({ ...withoutGk, applicability: [{ jurisdiction: 'DE-HE', scopes: [
  ...withoutGk.applicability![0].scopes,
  { stage: 'SekII', durationModel: 'G8', courseProfile: 'LK' },
] }] }), 'adding a course scope must fail')
rejects(bindPage({ ...withoutGk, applicability: [{ jurisdiction: 'DE-HE', scopes: [
  ...withoutGk.applicability![0].scopes,
  withoutGk.applicability![0].scopes[0],
] }] }), 'duplicate scope keys must fail')
rejects(bindPage({ ...withoutGk, applicability: [{ jurisdiction: 'DE-HE',
  scopes: [...withoutGk.applicability![0].scopes].reverse(),
}] }), 'an applicability ordering change must fail')
assert.equal(proveMathAtlasReviewSubsetNarrowing({
  ...old, pageFingerprint: withoutGk.pageFingerprint,
}, withoutGk).exactScopeNarrowing, false,
'a stale old page fingerprint must fail')

console.log('Math GK/LK review-subset compatibility: narrow case plus 9 mutation guards passed; no D transfer authorized')
