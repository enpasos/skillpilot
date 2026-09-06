import { createHash } from 'node:crypto'
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
  resolveGoalBookChapterProjection,
  selectGoalBookPublication,
} from './goalBookRuntime'
import {
  compileGoalBookPersonalizedProjection,
  goalBookCompositionViewMatchUrl,
  resolveGoalBookPersonalizationScope,
} from './goalBookPersonalizedProjection'

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

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

const stableDigest = (value: unknown): string => (
  `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`
)

const fixture = () => ({
  schemaVersion: '1.1.0',
  book: {
    id: 'de-gym-mathematik-bundesweit',
    title: 'Lernzielbuch',
    locale: 'de-DE',
    landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
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
  source: {
    compositionViewSources: [{
      path: 'curricula/DE/Gymnasium/composition-views/mathematik/test.view.json',
      viewId: 'view-he-seki-g9',
      scope: {
        schoolForm: 'Gymnasium',
        jurisdiction: 'DE-HE',
        stage: 'SekI',
        durationModel: 'G9',
      },
      digest: sha,
      projectionFingerprint: sha,
    }],
  },
  navigation: {
    schemaVersion: '1.0.0',
    canonicalProjectionSource: {
      path: 'app/scripts/config/goal-books/navigation/test.view.json',
      viewId: 'view',
      title: 'Kanonische Testgliederung',
      scope: { schoolForm: 'Gymnasium' },
      digest: sha,
      projectionFingerprint: sha,
    },
    goalGraph: {
      schemaVersion: '1.0.0',
      landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
      title: 'Mathematik',
      goals: [{
        id: 'root',
        title: 'Mathematik',
        contains: ['goal-a', 'goal-b'],
        type: 'cluster',
        semanticKind: 'curricularArea',
      }, {
        id: 'goal-a',
        title: 'Brüche addieren',
        contains: [],
        type: 'atomic',
        semanticKind: 'curricularAtomic',
      }, {
        id: 'goal-b',
        title: 'Größen vergleichen',
        contains: [],
        type: 'atomic',
        semanticKind: 'curricularAtomic',
      }],
      digest: sha,
    },
  },
  chapters: [
    {
      chapterId: 'root',
      label: 'Mathematik',
      parentChapterId: null,
      order: 0,
      treeOrder: 0,
      goalIds: ['goal-a', 'goal-b'],
      pageNumbers: [1, 2],
    },
    {
      chapterId: 'numbers',
      label: 'Zahlen',
      parentChapterId: 'root',
      order: 1,
      treeOrder: 1,
      goalIds: ['goal-a'],
      pageNumbers: [1],
    },
  ],
  pages: [
    {
      pageNumber: 1,
      navigationOrder: 0,
      treeOrder: 2,
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
      navigationOrder: 1,
      treeOrder: 3,
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
        canonicalUrl: 'https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-external',
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
  'https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-external',
)

const crossLandscapeFixture = fixture()
;(crossLandscapeFixture.source as Record<string, unknown>).externalLandscapes = [{
  path: 'curricula/DE/Gymnasium/canonical/external-mathematics.json',
  landscapeId: 'external-mathematics',
  digest: sha,
}]
;(crossLandscapeFixture.pages[1].externalPrerequisites[0] as Record<string, unknown>)
  .landscapeId = 'external-mathematics'
const crossLandscapeModel = parseGoalBookRuntimeModel(crossLandscapeFixture)
assert.equal(
  crossLandscapeModel.pages[1].externalPrerequisites[0].landscapeId,
  'external-mathematics',
  'the runtime retains the strictly source-bound external landscape identity',
)
assert.equal(
  crossLandscapeModel.pages[1].externalPrerequisites[0].canonicalUrl,
  'https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-external',
  'the canonical URL resolves in the containing book context rather than pretending provenance is navigation',
)

const unboundExternalLandscape = fixture()
;(unboundExternalLandscape.pages[1].externalPrerequisites[0] as Record<string, unknown>)
  .landscapeId = 'external-mathematics'
assert.throws(
  () => parseGoalBookRuntimeModel(unboundExternalLandscape),
  /nicht sicher gelesen/u,
  'an external reference landscape must be bound by source.externalLandscapes',
)

const openExternalLandscapeSource = crossLandscapeFixture
  .source as Record<string, Array<Record<string, unknown>>>
openExternalLandscapeSource.externalLandscapes[0].unexpected = true
assert.throws(
  () => parseGoalBookRuntimeModel(crossLandscapeFixture),
  /nicht sicher gelesen/u,
  'cross-landscape source bindings use a closed runtime shape',
)
delete openExternalLandscapeSource.externalLandscapes[0].unexpected

const openExternalReference = crossLandscapeFixture.pages[1]
  .externalPrerequisites[0] as Record<string, unknown>
openExternalReference.unexpected = true
assert.throws(
  () => parseGoalBookRuntimeModel(crossLandscapeFixture),
  /nicht sicher gelesen/u,
  'cross-landscape references use a closed runtime shape',
)
delete openExternalReference.unexpected

const publicationIndexFixture = {
  schemaVersion: 1,
  books: [{
    bookId: 'de-gym-mathematik-bundesweit',
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
  }, {
    bookId: 'de-gym-physik-bundesweit',
    title: 'Lernzielbuch Physik',
    locale: 'de-DE',
    publicationMode: 'review',
    pageCount: 430,
    model: {
      url: '/lernzielbuch/de-gym-physik-bundesweit.book-model.json',
      sha256: sha,
      modelDigest: sha,
    },
    pdf: {
      url: '/lernzielbuch/de-gym-physik-bundesweit.pdf',
      sha256: sha,
      renderManifestUrl: '/lernzielbuch/de-gym-physik-bundesweit.pdf.render-manifest.json',
      renderManifestSha256: sha,
    },
  }, ...[
    ['de-gym-chemie-bundesweit', 'Chemie'],
    ['de-gym-biologie-bundesweit', 'Biologie'],
  ].map(([bookId, title]) => ({
    bookId, title, locale: 'de-DE', publicationMode: 'review', pageCount: 2,
    model: { url: `/lernzielbuch/${bookId}.book-model.json`, sha256: sha, modelDigest: sha },
    pdf: { url: `/lernzielbuch/${bookId}.pdf`, sha256: sha,
      renderManifestUrl: `/lernzielbuch/${bookId}.pdf.render-manifest.json`, renderManifestSha256: sha },
  }))],
}
const publicationIndex = parseGoalBookPublicationIndex(publicationIndexFixture)
for (const [bookId, landscapeId] of [
  ['de-gym-chemie-bundesweit', 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'],
  ['de-gym-biologie-bundesweit', '08a43a1b-d97e-522c-9dfa-c950a493364e'],
]) {
  assert.equal(selectGoalBookPublication(publicationIndex, `?book=${bookId}`).bookId, bookId)
  assert.equal(selectGoalBookPublication(publicationIndex, `?landscape=${landscapeId}`).bookId, bookId)
}
const publication = selectGoalBookPublication(publicationIndex, '')
assertGoalBookPublicationBinding(publication, model)
assert.equal(publication.pdfUrl, '/lernzielbuch/de-gym-mathematik-bundesweit.pdf')
assert.throws(
  () => assertGoalBookPublicationBinding({ ...publication, landscapeId: 'wrong-landscape' }, model),
  /nicht sicher gelesen/u,
  'the publication landscape binding is fail-closed',
)
assert.throws(
  () => assertGoalBookPublicationBinding({ ...publication, edition: 'wrong-edition' }, model),
  /nicht sicher gelesen/u,
  'the publication edition binding is fail-closed',
)
assert.equal(
  selectGoalBookPublication(publicationIndex, '?book=de-gym-physik-bundesweit').bookId,
  'de-gym-physik-bundesweit',
  'a stable book query selects the published physics atlas',
)
assert.equal(
  selectGoalBookPublication(
    publicationIndex,
    '?landscape=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a&edition=curricular-atomic-v1',
  ).bookId,
  'de-gym-physik-bundesweit',
  'a canonical physics landscape deep link selects the matching atlas',
)
assert.throws(
  () => selectGoalBookPublication(publicationIndex, '?book=unknown-book'),
  /nicht sicher gelesen/u,
  'unknown book selectors fail closed',
)
assert.throws(
  () => selectGoalBookPublication(
    publicationIndex,
    '?book=de-gym-mathematik-bundesweit&landscape=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
  ),
  /nicht sicher gelesen/u,
  'conflicting book and landscape selectors fail closed',
)
assert.throws(
  () => selectGoalBookPublication(
    publicationIndex,
    '?landscape=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a&edition=stale-edition',
  ),
  /nicht sicher gelesen/u,
  'a stale deep-link edition may not silently select the current atlas',
)
assert.throws(
  () => selectGoalBookPublication(
    publicationIndex,
    '?edition=curricular-atomic-v1&edition=curricular-atomic-v1',
  ),
  /nicht sicher gelesen/u,
  'duplicate edition selectors fail closed even when their values agree',
)
assert.throws(
  () => parseGoalBookPublicationIndex({
    ...publicationIndexFixture,
    books: publicationIndexFixture.books.slice(0, 1),
  }),
  /nicht sicher gelesen/u,
  'the closed index may not silently remove the physics publication',
)

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
  filterGoalBookPages({ model, query: '', chapterId: null, goalIds: [] }),
  [],
  'an explicitly empty projection stays empty instead of widening to the whole book',
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

const canonicalProjection = resolveGoalBookChapterProjection({
  model,
  applicability: {
    jurisdiction: null,
    stage: null,
    durationModel: null,
    courseProfile: null,
  },
})
assert.equal(canonicalProjection.source, 'canonical-fallback')
assert.deepEqual(canonicalProjection.goalIds, ['goal-a', 'goal-b'])
assert.deepEqual(
  canonicalProjection.nodes.find(({ nodeId }) => nodeId === 'root')?.childNodeIds,
  ['numbers', 'goal:goal-b'],
  'the legacy adapter retains authored chapter order and places direct atomic leaves explicitly',
)
assert.deepEqual(
  canonicalProjection.nodes.find(({ nodeId }) => nodeId === 'numbers')?.childNodeIds,
  ['goal:goal-a'],
  'the legacy chapter array is exposed through the same recursive node interface',
)

const filteredCanonicalProjection = resolveGoalBookChapterProjection({
  model,
  applicability: {
    jurisdiction: 'DE-HE',
    stage: 'SekI',
    durationModel: 'G8',
    courseProfile: null,
  },
})
assert.deepEqual(filteredCanonicalProjection.goalIds, ['goal-a'])
assert.equal(
  filteredCanonicalProjection.nodes.find(({ nodeId }) => nodeId === 'root')?.descendantGoalCount,
  1,
  'chapter counts are recalculated from the active projection rather than copied from the whole book',
)
assert.equal(
  filteredCanonicalProjection.nodes.some(({ nodeId }) => nodeId === 'goal:goal-b'),
  false,
  'empty branches and leaves are pruned from the applicability projection',
)

const suppliedProjection = resolveGoalBookChapterProjection({
  model,
  applicability: {
    jurisdiction: 'DE-HE',
    stage: 'SekI',
    durationModel: 'G9',
    courseProfile: null,
  },
  suppliedProjection: {
    projectionId: 'projection-he-seki-g9',
    viewId: 'view-he-seki-g9',
    scope: {
      jurisdiction: 'DE-HE',
      stage: 'SekI',
      durationModel: 'G9',
      courseProfile: null,
    },
    digest: sha,
    nodes: [{
      nodeId: 'scope-root',
      label: 'Mathematik Hessen G9',
      parentNodeId: null,
      childNodeIds: ['scope-cluster'],
      kind: 'structure',
      goalId: null,
      descendantGoalCount: 1,
    }, {
      nodeId: 'scope-cluster',
      label: 'Zahlen und Größen',
      parentNodeId: 'scope-root',
      childNodeIds: ['scope-goal-b'],
      kind: 'cluster',
      goalId: null,
      descendantGoalCount: 1,
    }, {
      nodeId: 'scope-goal-b',
      label: 'Größen vergleichen',
      parentNodeId: 'scope-cluster',
      childNodeIds: [],
      kind: 'goal',
      goalId: 'goal-b',
      descendantGoalCount: 1,
    }],
  },
})
assert.equal(suppliedProjection.source, 'supplied')
assert.equal(suppliedProjection.viewId, 'view-he-seki-g9')
assert.deepEqual(
  suppliedProjection.goalIds,
  ['goal-b'],
  'a supplied composition projection defines the exact target universe instead of widening to applicability',
)

const suppliedReorderedProjection = resolveGoalBookChapterProjection({
  model,
  applicability: {
    jurisdiction: 'DE-HE',
    stage: 'SekI',
    durationModel: 'G9',
    courseProfile: null,
  },
  suppliedProjection: {
    projectionId: 'projection-reordered',
    viewId: 'view-reordered',
    scope: null,
    digest: sha,
    nodes: [{
      nodeId: 'reordered-root',
      label: 'Reordered root',
      parentNodeId: null,
      childNodeIds: ['reordered-goal-b', 'reordered-goal-a'],
      kind: 'structure',
      goalId: null,
      descendantGoalCount: 2,
    }, {
      nodeId: 'reordered-goal-b',
      label: 'Größen vergleichen',
      parentNodeId: 'reordered-root',
      childNodeIds: [],
      kind: 'goal',
      goalId: 'goal-b',
      descendantGoalCount: 1,
    }, {
      nodeId: 'reordered-goal-a',
      label: 'Brüche addieren',
      parentNodeId: 'reordered-root',
      childNodeIds: [],
      kind: 'goal',
      goalId: 'goal-a',
      descendantGoalCount: 1,
    }],
  },
})
assert.deepEqual(
  suppliedReorderedProjection.goalIds,
  ['goal-b', 'goal-a'],
  'the authored Composition View preorder remains the resolved personalized goal order',
)
assert.deepEqual(
  filterGoalBookPages({
    model,
    query: '',
    chapterId: null,
    goalIds: suppliedReorderedProjection.goalIds,
  }).map(({ goalId }) => goalId),
  ['goal-b', 'goal-a'],
  'array-shaped projection membership filters preserve authored goal order',
)

assert.equal(
  resolveGoalBookPersonalizationScope(model, {
    jurisdiction: 'DE-HE',
    stage: 'SekI',
    durationModel: null,
    courseProfile: null,
  }).status,
  'partial',
  'a state/stage with both G8 and G9 stays canonical-filtered until duration is resolved',
)
assert.equal(
  resolveGoalBookPersonalizationScope(model, {
    jurisdiction: 'DE-BY',
    stage: 'SekI',
    durationModel: null,
    courseProfile: null,
  }).status,
  'unbound',
  'a complete filter without a compatible published composition view stays canonical-filtered',
)
const completePersonalizationScope = resolveGoalBookPersonalizationScope(model, {
  jurisdiction: 'DE-HE',
  stage: 'SekI',
  durationModel: 'G9',
  courseProfile: null,
})
assert.equal(completePersonalizationScope.status, 'complete')
if (completePersonalizationScope.status !== 'complete') {
  throw new Error('expected a complete personalized scope')
}
assert.equal(
  goalBookCompositionViewMatchUrl(completePersonalizationScope.scope),
  '/api/ui/composition-views/match?landscapeId=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&schoolForm=Gymnasium&jurisdiction=DE-HE&stage=SekI&courseProfile=&durationModel=G9',
  'the learning-goal book uses the same-origin Cockpit matcher with the complete Level-2 scope',
)

const authoredPersonalizedView = {
  viewId: 'view-he-seki-g9-bound',
  landscapeId: model.book.landscapeId,
  // A reviewed duration-neutral authored view is a valid compatible subset
  // of the more specific requested G9 learner scope.
  scope: {
    schoolForm: 'Gymnasium',
    jurisdiction: 'DE-HE',
    stage: 'SekI',
  },
  rootNodes: [{
    kind: 'structure',
    id: 'personalized-root',
    label: 'Hessische Kapitelsicht',
    children: [{
      kind: 'goalEntry',
      goalId: 'goal-a',
    }, {
      kind: 'structure',
      id: 'personalized-cluster',
      label: 'Größen',
      children: [{
        kind: 'goalEntry',
        goalId: 'goal-b',
      }],
    }],
  }],
}
const authoredScope = authoredPersonalizedView.scope
const boundPersonalizedModel = {
  ...model,
  source: {
    ...model.source,
    compositionViewSources: [{
      path: 'curricula/DE/Gymnasium/composition-views/mathematik/test-bound.view.json',
      viewId: authoredPersonalizedView.viewId,
      scope: authoredScope,
      digest: stableDigest(authoredPersonalizedView),
      projectionFingerprint: stableDigest({
        viewId: authoredPersonalizedView.viewId,
        scope: authoredScope,
        curricularAtomicGoalIds: ['goal-a', 'goal-b'],
      }),
    }],
  },
}
const compiledPersonalized = await compileGoalBookPersonalizedProjection(
  authoredPersonalizedView,
  boundPersonalizedModel,
  completePersonalizationScope.scope,
)
if (!compiledPersonalized.suppliedProjection) {
  throw new Error(`personalized projection did not compile: ${JSON.stringify(compiledPersonalized.findings)}`)
}
assert.equal(
  compiledPersonalized.suppliedProjection?.viewId,
  authoredPersonalizedView.viewId,
  'a compatible authored scope is accepted only through its published source binding',
)
const personalizedRoot = compiledPersonalized.suppliedProjection?.nodes.find(
  ({ parentNodeId }) => parentNodeId === null,
)
assert.deepEqual(
  personalizedRoot?.childNodeIds.map((nodeId) => (
    compiledPersonalized.suppliedProjection?.nodes.find((node) => node.nodeId === nodeId)?.kind
  )),
  ['goal', 'structure'],
  'global treeOrder preserves an atomic sibling before a following structure node',
)
const tamperedPersonalized = structuredClone(authoredPersonalizedView)
tamperedPersonalized.rootNodes[0].label = 'Manipulierte Kapitelsicht'
assert.equal(
  (await compileGoalBookPersonalizedProjection(
    tamperedPersonalized,
    boundPersonalizedModel,
    completePersonalizationScope.scope,
  )).suppliedProjection,
  null,
  'a same-ID server response with bytes outside the published source binding fails closed',
)

assert.throws(
  () => resolveGoalBookChapterProjection({
    model,
    applicability: {
      jurisdiction: null,
      stage: null,
      durationModel: null,
      courseProfile: null,
    },
    suppliedProjection: {
      projectionId: 'broken-count',
      scope: null,
      digest: sha,
      nodes: [{
        nodeId: 'broken-root',
        label: 'Broken root',
        parentNodeId: null,
        childNodeIds: [],
        kind: 'structure',
        goalId: null,
        descendantGoalCount: 1,
      }],
    },
  }),
  /nicht sicher gelesen/u,
  'a malformed supplied projection fails closed instead of falling back to the broad canonical tree',
)

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
