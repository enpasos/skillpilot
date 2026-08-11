import {
  assertGoalBookPublicationBinding,
  filterGoalBookPages,
  goalBookApplicabilityOptions,
  goalBookChapterDepths,
  goalBookExternalReferenceFromHash,
  goalBookPageFromHash,
  parseGoalBookPublicationIndex,
  parseGoalBookRuntimeModel,
  parseVerifiedGoalBookRuntimeModel,
} from './goalBookRuntime'

const assert = {
  equal(actual: unknown, expected: unknown, message = 'values differ') {
    if (!Object.is(actual, expected)) throw new Error(message)
  },
  deepEqual(actual: unknown, expected: unknown, message = 'values differ') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(message)
  },
  throws(callback: () => unknown, pattern: RegExp, message = 'expected callback to throw') {
    try {
      callback()
    } catch (error) {
      if (error instanceof Error && pattern.test(error.message)) return
      throw error
    }
    throw new Error(message)
  },
  async throwsAsync(callback: () => Promise<unknown>, pattern: RegExp, message = 'expected callback to reject') {
    try {
      await callback()
    } catch (error) {
      if (error instanceof Error && pattern.test(error.message)) return
      throw error
    }
    throw new Error(message)
  },
}

const sha = `sha256:${'a'.repeat(64)}`

const fixture = () => ({
  schemaVersion: '1.0.0',
  book: {
    id: 'book',
    title: 'Lernzielbuch',
    locale: 'de-DE',
    landscapeId: 'landscape',
    viewId: 'view',
    scope: {},
    pageCount: 2,
    projectedAtomicGoalCount: 2,
    excludedTargetAtomicGoalCount: 0,
    edition: 'curricular-atomic-v1',
    publicationMode: 'review',
    atlasBaseUrl: 'https://skillpilot.com/lernzielbuch',
    oneGoalPerPage: true,
  },
  source: {},
  chapters: [
    {
      chapterId: 'root',
      label: 'Mathematik',
      parentChapterId: null,
      goalIds: ['goal-a', 'goal-b'],
      pageNumbers: [1, 2],
    },
    {
      chapterId: 'numbers',
      label: 'Zahlen',
      parentChapterId: 'root',
      goalIds: ['goal-a'],
      pageNumbers: [1],
    },
  ],
  pages: [
    {
      pageNumber: 1,
      goalId: 'goal-a',
      anchor: 'goal-goal-a',
      title: 'Brüche addieren',
      description: 'Die lernende Person kann Brüche addieren.',
      breadcrumbs: ['Mathematik', 'Zahlen'],
      chapterIds: ['root', 'numbers'],
      requires: [],
      reverseRequires: [{
        goalId: 'goal-b',
        title: 'Größen vergleichen',
        anchor: 'goal-goal-b',
        pageNumber: 2,
      }],
      externalPrerequisites: [],
      externalReverseRequires: [],
      applicability: [{
        jurisdiction: 'DE-BY',
        scopes: [{ stage: 'SekI', durationModel: null, courseProfile: null }],
      }, {
        jurisdiction: 'DE-HE',
        scopes: [
          { stage: 'SekI', durationModel: 'G8', courseProfile: null },
          { stage: 'SekI', durationModel: 'G9', courseProfile: null },
          { stage: 'SekII', durationModel: null, courseProfile: 'GK' },
        ],
      }],
      visualization: {
        resourceType: 'image',
        title: 'Brüche',
        url: '/assets/goal-visualizations/mathematik/goal-a/image.png',
        altText: 'Brüche addieren',
        originalDigest: sha,
        qaStatus: 'review_candidate',
        approvedForPublication: false,
      },
      evidenceReview: null,
      goalFingerprint: sha,
      pageFingerprint: sha,
    },
    {
      pageNumber: 2,
      goalId: 'goal-b',
      anchor: 'goal-goal-b',
      title: 'Größen vergleichen',
      description: 'Die lernende Person kann Größen vergleichen.',
      breadcrumbs: ['Mathematik'],
      chapterIds: ['root'],
      requires: [{
        goalId: 'goal-a',
        title: 'Brüche addieren',
        anchor: 'goal-goal-a',
        pageNumber: 1,
      }],
      reverseRequires: [],
      externalPrerequisites: [{
        goalId: 'external',
        title: 'Externe Grundlage',
        canonicalUrl: 'https://skillpilot.com/lernzielbuch?landscape=landscape&edition=curricular-atomic-v1#goal-external',
      }],
      externalReverseRequires: [],
      applicability: [{
        jurisdiction: 'DE-BY',
        scopes: [{ stage: 'SekII', durationModel: null, courseProfile: 'GK' }],
      }, {
        jurisdiction: 'DE-HE',
        scopes: [
          { stage: 'SekI', durationModel: 'G9', courseProfile: null },
          { stage: 'SekII', durationModel: null, courseProfile: 'LK' },
        ],
      }],
      visualization: null,
      evidenceReview: {
        reviewId: 'review-b',
        status: 'approved',
        reviewInputFingerprint: sha,
        profileFingerprint: sha,
        evidenceLevel: 'E1',
        maximumClaimScope: 'G1',
      },
      goalFingerprint: sha,
      pageFingerprint: sha,
    },
  ],
  excludedTargetGoals: [],
  digest: sha,
})

const model = parseGoalBookRuntimeModel(fixture())
assert.equal(model.pages.length, 2)
assert.equal(model.pages[0].visualization?.altText, 'Brüche addieren')
assert.equal(model.pages[1].evidenceReview?.evidenceLevel, 'E1')
assert.equal(model.book.edition, 'curricular-atomic-v1')
assert.equal(model.pages[0].goalFingerprint, sha)
assert.equal(model.pages[0].applicability?.[1].scopes[0].durationModel, 'G8')
assert.equal(
  model.pages[1].externalPrerequisites[0].canonicalUrl,
  'https://skillpilot.com/lernzielbuch?landscape=landscape&edition=curricular-atomic-v1#goal-external',
)

const publication = parseGoalBookPublicationIndex({
  schemaVersion: 1,
  books: [{
    bookId: 'book',
    title: 'Lernzielbuch',
    locale: 'de-DE',
    publicationMode: 'review',
    pageCount: 2,
    model: {
      url: '/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json',
      sha256: sha,
      modelDigest: sha,
    },
    pdf: {
      url: '/lernzielbuch/de-gym-mathematik-bundesweit.pdf',
      sha256: sha,
      renderManifestUrl: '/lernzielbuch/de-gym-mathematik-bundesweit.pdf.render-manifest.json',
      renderManifestSha256: sha,
    },
  }],
})
assertGoalBookPublicationBinding(publication, model)
assert.equal(publication.pdfUrl, '/lernzielbuch/de-gym-mathematik-bundesweit.pdf')

assert.deepEqual(
  filterGoalBookPages({ model, query: 'bruche goal-a', chapterId: null })
    .map(({ goalId }) => goalId),
  ['goal-a'],
  'search is diacritic-insensitive and includes the complete goal id',
)
assert.deepEqual(
  filterGoalBookPages({ model, query: '', chapterId: 'numbers' })
    .map(({ goalId }) => goalId),
  ['goal-a'],
  'chapter filters use the authoritative chapter membership',
)
assert.deepEqual(
  filterGoalBookPages({ model, query: 'nicht vorhanden', chapterId: null }),
  [],
)
assert.deepEqual(
  goalBookApplicabilityOptions(model, {
    jurisdiction: null,
    stage: null,
    durationModel: null,
    courseProfile: null,
  }),
  {
    jurisdictions: ['DE-BY', 'DE-HE'],
    stages: [],
    durationModels: [],
    courseProfiles: [],
  },
  'state-dependent options stay unavailable before a state is selected',
)
assert.deepEqual(
  goalBookApplicabilityOptions(model, {
    jurisdiction: 'DE-HE',
    stage: 'SekI',
    durationModel: null,
    courseProfile: null,
  }),
  {
    jurisdictions: ['DE-BY', 'DE-HE'],
    stages: ['SekI', 'SekII'],
    durationModels: ['G8', 'G9'],
    courseProfiles: [],
  },
  'G8 and G9 are derived from exact scopes inside the selected state and stage',
)
assert.deepEqual(
  filterGoalBookPages({
    model,
    query: '',
    chapterId: null,
    applicability: {
      jurisdiction: 'DE-HE',
      stage: 'SekI',
      durationModel: 'G8',
      courseProfile: null,
    },
  }).map(({ goalId }) => goalId),
  ['goal-a'],
  'an exact coupled HE G8 scope does not produce a false HE G9 cross-product',
)
assert.deepEqual(
  filterGoalBookPages({
    model,
    query: '',
    chapterId: null,
    applicability: {
      jurisdiction: 'DE-BY',
      stage: 'SekI',
      durationModel: 'G8',
      courseProfile: null,
    },
  }),
  [],
  'a null duration means no authored G8/G9 distinction and does not match an explicit G8 filter',
)
assert.deepEqual(
  filterGoalBookPages({
    model,
    query: '',
    chapterId: null,
    applicability: {
      jurisdiction: 'DE-HE',
      stage: null,
      durationModel: 'G8',
      courseProfile: 'GK',
    },
  }),
  [],
  'duration and course profile must match the same authoritative scope tuple',
)
assert.deepEqual(
  goalBookApplicabilityOptions(model, {
    jurisdiction: 'DE-HE',
    stage: null,
    durationModel: 'G8',
    courseProfile: null,
  }).courseProfiles,
  [],
  'dependent options never synthesize a course profile from a different tuple',
)

assert.equal(goalBookPageFromHash(model, '#goal-goal-b')?.goalId, 'goal-b')
assert.equal(goalBookPageFromHash(model, '#goal-unknown'), null)
assert.equal(
  goalBookExternalReferenceFromHash(model, '#goal-external')?.title,
  'Externe Grundlage',
)
assert.equal(goalBookPageFromHash(model, '#%E0%A4%A'), null)
assert.deepEqual([...goalBookChapterDepths(model.chapters).entries()], [
  ['root', 0],
  ['numbers', 1],
])

const brokenRelation = fixture()
brokenRelation.pages[0].reverseRequires[0].pageNumber = 1
assert.throws(
  () => parseGoalBookRuntimeModel(brokenRelation),
  /nicht sicher gelesen/u,
  'a relation may only target the published matching page and anchor',
)

const duplicatedApplicability = fixture()
const duplicateScopes = duplicatedApplicability.pages[0].applicability[0].scopes as unknown as Array<{
  stage: string
  durationModel: string | null
  courseProfile: string | null
}>
duplicateScopes.push({ ...duplicateScopes[0] })
assert.throws(
  () => parseGoalBookRuntimeModel(duplicatedApplicability),
  /nicht sicher gelesen/u,
  'duplicate exact applicability scopes fail closed',
)

const encodedFixture = new TextEncoder().encode(JSON.stringify(fixture()))
const fixtureBuffer = encodedFixture.buffer.slice(
  encodedFixture.byteOffset,
  encodedFixture.byteOffset + encodedFixture.byteLength,
) as ArrayBuffer
const fixtureDigest = `sha256:${[...new Uint8Array(await crypto.subtle.digest('SHA-256', fixtureBuffer))]
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('')}`
assert.equal(
  (await parseVerifiedGoalBookRuntimeModel(fixtureBuffer, fixtureDigest)).pages.length,
  2,
  'the exact downloaded model bytes are bound to the publication SHA-256',
)
const maxRuntimeModelBytes = 8 * 1024 * 1024
const exactLimitBytes = new Uint8Array(maxRuntimeModelBytes)
exactLimitBytes.fill(0x20)
exactLimitBytes.set(encodedFixture)
const exactLimitDigest = `sha256:${[...new Uint8Array(await crypto.subtle.digest('SHA-256', exactLimitBytes))]
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('')}`
assert.equal(
  (await parseVerifiedGoalBookRuntimeModel(exactLimitBytes.buffer, exactLimitDigest)).pages.length,
  2,
  'the bounded nationwide runtime model accepts exactly 8 MiB',
)
await assert.throwsAsync(
  () => parseVerifiedGoalBookRuntimeModel(new Uint8Array(maxRuntimeModelBytes + 1).buffer, exactLimitDigest),
  /nicht sicher gelesen/u,
  'the bounded nationwide runtime model rejects 8 MiB plus one byte',
)
const changedBytes = new TextEncoder().encode(JSON.stringify({ ...fixture(), unexpectedMutation: true }))
const changedBuffer = changedBytes.buffer.slice(
  changedBytes.byteOffset,
  changedBytes.byteOffset + changedBytes.byteLength,
) as ArrayBuffer
await assert.throwsAsync(
  () => parseVerifiedGoalBookRuntimeModel(changedBuffer, fixtureDigest),
  /nicht sicher gelesen/u,
  'changed model bytes may not reuse the published SHA-256',
)

const unsafeImage = fixture()
unsafeImage.pages[0].visualization!.url = 'https://example.com/image.png'
assert.throws(
  () => parseGoalBookRuntimeModel(unsafeImage),
  /nicht sicher gelesen/u,
  'runtime images stay on the bounded goal-visualization asset path',
)

const traversingImage = fixture()
traversingImage.pages[0].visualization!.url = '/assets/goal-visualizations/%2e%2e/%2e%2e/api/private'
assert.throws(
  () => parseGoalBookRuntimeModel(traversingImage),
  /nicht sicher gelesen/u,
  'encoded dot segments may not normalize a visualization into an API request',
)

const unsafeExternalLink = fixture()
unsafeExternalLink.pages[1].externalPrerequisites[0].canonicalUrl =
  'https://skillpilot.example/lernzielbuch?landscape=landscape&edition=curricular-atomic-v1#goal-external'
assert.throws(
  () => parseGoalBookRuntimeModel(unsafeExternalLink),
  /nicht sicher gelesen/u,
  'external references stay bound to the canonical atlas origin and edition',
)

console.log('goal-book runtime tests passed')
