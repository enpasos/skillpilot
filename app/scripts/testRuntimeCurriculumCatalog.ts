import assert from 'node:assert/strict'
import {
  findRuntimeRootLandscapeId,
  loadRuntimeCurriculumCatalog,
  parseRuntimeCurriculumCatalog,
  resolveExplicitRuntimeOfferingId,
  resolveGoalDeckHref,
  resolveGoalResourceHref,
  resolveRuntimeOfferingId,
  selectRuntimeLandscapeId,
  type RuntimeCurriculumCatalogState,
} from '../src/utils/runtimeCurriculumCatalog'

const ROOT_ID = 'sentinel-root'
const MODULE_ID = 'sentinel-module'
const PACKAGE_ID = 'org.example.sentinel'
const OFFERING_ID = 'sentinel-offering'
const DECK_ID = 'sentinel-deck'
const GOAL_ID = 'sentinel-goal'
const RESOURCE_ID = 'sentinel-resource'

const fixture = () => ({
  catalogApiVersion: '1.2',
  generationSha256: 'a'.repeat(64),
  packages: [{
    packageId: PACKAGE_ID,
    packageVersion: '1.2.3',
    releaseId: `${PACKAGE_ID}@1.2.3`,
    contentDigest: `sha256:${'b'.repeat(64)}`,
    capabilities: ['compositionViews', 'memoryCards', 'goalVisualizations'],
    scopeDimensions: [],
  }],
  rootLandscapeIds: [ROOT_ID],
  landscapes: [
    {
      packageId: PACKAGE_ID,
      landscapeId: ROOT_ID,
      role: 'root',
      locale: 'de-DE',
      frameworkId: 'sentinel-framework',
      subject: 'Sentinel',
      defaultOfferingId: OFFERING_ID,
    },
    {
      packageId: PACKAGE_ID,
      landscapeId: MODULE_ID,
      role: 'module',
      locale: 'de-DE',
      frameworkId: 'sentinel-framework',
      subject: 'Sentinel module',
      parentLandscapeId: ROOT_ID,
    },
  ],
  views: [{
    packageId: PACKAGE_ID,
    viewId: 'sentinel-view',
    landscapeId: ROOT_ID,
    language: 'de',
    scope: { schoolForm: 'Sentinel', stage: 'One' },
  }],
  offerings: [{
    packageId: PACKAGE_ID,
    offeringId: OFFERING_ID,
    landscapeId: ROOT_ID,
    scope: { schoolForm: 'Sentinel', stage: 'One' },
    resolution: { mode: 'single', mergeDimension: null, viewIds: ['sentinel-view'] },
  }],
  decks: [
    {
      packageId: PACKAGE_ID,
      packageVersion: '1.2.3',
      deckId: DECK_ID,
      landscapeId: ROOT_ID,
      locale: 'de-DE',
      href: `/api/ui/curriculum-resources/packages/${PACKAGE_ID}/1.2.3/decks/${DECK_ID}/de-DE`,
    },
    {
      packageId: PACKAGE_ID,
      packageVersion: '1.2.3',
      deckId: DECK_ID,
      landscapeId: ROOT_ID,
      locale: 'en',
      href: `/api/ui/curriculum-resources/packages/${PACKAGE_ID}/1.2.3/decks/${DECK_ID}/en`,
    },
  ],
  resources: [
    {
      packageId: PACKAGE_ID,
      packageVersion: '1.2.3',
      resourceId: RESOURCE_ID,
      landscapeId: ROOT_ID,
      ownerGoalId: GOAL_ID,
      resourceKind: 'goal-visualization',
      delivery: 'embedded',
      mediaType: 'image/png',
      publicUrl: `/assets/goal-visualizations/${GOAL_ID}.png`,
      href: `/api/ui/curriculum-resources/packages/${PACKAGE_ID}/1.2.3/resources/${RESOURCE_ID}`,
      runtimeRequired: true,
      bytes: 123,
      sha256: 'c'.repeat(64),
    },
    {
      packageId: PACKAGE_ID,
      packageVersion: '1.2.3',
      resourceId: 'sentinel-tool',
      landscapeId: ROOT_ID,
      ownerGoalId: 'sentinel-tool-goal',
      resourceKind: 'external-tool',
      delivery: 'external',
      mediaType: 'text/html',
      publicUrl: 'https://example.org/tool',
      href: 'https://example.org/tool',
      runtimeRequired: false,
      bytes: null,
      sha256: null,
    },
  ],
  sourceEvidence: [{
    packageId: PACKAGE_ID,
    packageVersion: '1.2.3',
    targetLandscapeId: ROOT_ID,
    sourceCollectionCount: 1,
    sourceDocumentCount: 1,
    sourceGoalCount: 1,
    mappingEdgeCount: 1,
    goals: [{ goalId: GOAL_ID, jurisdictions: ['DE-HE'] }],
    href: `/api/ui/curriculum-source-evidence/packages/${PACKAGE_ID}/1.2.3/goals`,
  }],
})

const clone = <T>(value: T): T => structuredClone(value)
const parsed = parseRuntimeCurriculumCatalog(fixture())
assert.deepEqual(parsed.rootLandscapeIds, [ROOT_ID])
assert.equal(selectRuntimeLandscapeId(parsed, ROOT_ID), ROOT_ID)
assert.equal(selectRuntimeLandscapeId(parsed, 'legacy-hard-coded-root'), ROOT_ID)
assert.equal(findRuntimeRootLandscapeId(parsed, MODULE_ID), ROOT_ID)
assert.equal(resolveRuntimeOfferingId(parsed, ROOT_ID, null), OFFERING_ID)
assert.equal(
  resolveRuntimeOfferingId(parsed, ROOT_ID, { stage: 'One', schoolForm: 'Sentinel' }),
  OFFERING_ID,
)
assert.equal(resolveRuntimeOfferingId(parsed, ROOT_ID, { schoolForm: 'Sentinel' }), undefined)
assert.equal(resolveExplicitRuntimeOfferingId(parsed, ROOT_ID, OFFERING_ID), OFFERING_ID)
assert.equal(resolveExplicitRuntimeOfferingId(parsed, ROOT_ID, 'unknown-offering'), undefined)

const packageState: RuntimeCurriculumCatalogState = {
  mode: 'package',
  catalog: parsed,
  apiBase: 'https://api.example.test/base',
}
const srsGoal = { id: 'memory-goal', landscapeId: ROOT_ID, tags: [`srs-deck:${DECK_ID}`] }
assert.equal(
  resolveGoalDeckHref(packageState, srsGoal, 'de'),
  `https://api.example.test/api/ui/curriculum-resources/packages/${PACKAGE_ID}/1.2.3/decks/${DECK_ID}/de-DE`,
)
assert.match(resolveGoalDeckHref(packageState, srsGoal, 'en') ?? '', /\/en$/u)
assert.equal(resolveGoalDeckHref(packageState, { ...srsGoal, tags: [`srs-deck:${DECK_ID}`, 'srs-deck:other'] }, 'de'), undefined)
assert.equal(resolveGoalDeckHref(packageState, { ...srsGoal, landscapeId: MODULE_ID }, 'de'), undefined)
assert.equal(
  resolveGoalResourceHref(
    packageState,
    { id: GOAL_ID, landscapeId: ROOT_ID },
    { url: `/assets/goal-visualizations/${GOAL_ID}.png` },
  ),
  `https://api.example.test/api/ui/curriculum-resources/packages/${PACKAGE_ID}/1.2.3/resources/${RESOURCE_ID}`,
)
assert.equal(resolveGoalResourceHref(packageState, { id: 'wrong-owner', landscapeId: ROOT_ID }, { resourceId: RESOURCE_ID }), undefined)
assert.equal(
  resolveGoalResourceHref(
    packageState,
    { id: 'sentinel-tool-goal', landscapeId: ROOT_ID },
    { url: 'https://example.org/tool' },
  ),
  'https://example.org/tool',
)
assert.deepEqual(parsed.sourceEvidence[0]?.goals, [{ goalId: GOAL_ID, jurisdictions: ['DE-HE'] }])

const optionalEvidenceFixture = fixture()
optionalEvidenceFixture.packages.push({
  ...clone(optionalEvidenceFixture.packages[0]),
  packageId: 'org.example.without-source-evidence',
  releaseId: 'org.example.without-source-evidence@1.2.3',
})
optionalEvidenceFixture.landscapes.push({
  ...clone(optionalEvidenceFixture.landscapes[0]),
  packageId: 'org.example.without-source-evidence',
  landscapeId: 'sentinel-root-without-source-evidence',
  defaultOfferingId: undefined,
})
optionalEvidenceFixture.rootLandscapeIds.push('sentinel-root-without-source-evidence')
assert.equal(parseRuntimeCurriculumCatalog(optionalEvidenceFixture).sourceEvidence.length, 1)
const noEvidenceFixture = fixture()
noEvidenceFixture.sourceEvidence = []
assert.deepEqual(parseRuntimeCurriculumCatalog(noEvidenceFixture).sourceEvidence, [])

let repositoryFallbackCalls = 0
assert.equal(
  resolveGoalDeckHref({ mode: 'repository' }, srsGoal, 'de', () => {
    repositoryFallbackCalls += 1
    return '/data/repository-only.json'
  }),
  '/data/repository-only.json',
)
assert.equal(repositoryFallbackCalls, 1)
let unavailableFallbackCalls = 0
assert.equal(
  resolveGoalDeckHref({ mode: 'unavailable', error: new Error('offline') }, srsGoal, 'de', () => {
    unavailableFallbackCalls += 1
    return '/data/must-not-be-used.json'
  }),
  undefined,
)
assert.equal(unavailableFallbackCalls, 0)

const invalidCases: Array<[string, (candidate: ReturnType<typeof fixture>) => void]> = [
  ['unsupported API', (candidate) => { candidate.catalogApiVersion = '2.0' }],
  ['unknown root', (candidate) => { candidate.rootLandscapeIds = ['unknown-root'] }],
  ['invalid default offering', (candidate) => { candidate.landscapes[0].defaultOfferingId = 'unknown-offering' }],
  ['duplicate offering scope', (candidate) => { candidate.offerings.push({ ...clone(candidate.offerings[0]), offeringId: 'duplicate-scope' }) }],
  ['duplicate deck identity', (candidate) => { candidate.decks.push(clone(candidate.decks[0])) }],
  ['unsafe embedded href', (candidate) => { candidate.resources[0].href = '/api/ui/curriculum-resources/packages/../poison' }],
  ['wrong resource owner binding', (candidate) => { candidate.resources.push({ ...clone(candidate.resources[0]), resourceId: 'other', publicUrl: candidate.resources[0].publicUrl }) }],
  ['unknown view', (candidate) => { candidate.offerings[0].resolution.viewIds = ['unknown-view'] }],
  ['unsafe source-evidence href', (candidate) => { candidate.sourceEvidence[0].href = '/api/ui/curriculum-source-evidence/packages/../poison/goals' }],
  ['invalid source-evidence jurisdiction', (candidate) => { candidate.sourceEvidence[0].goals[0].jurisdictions = ['HE'] }],
  ['duplicate source-evidence goal', (candidate) => { candidate.sourceEvidence[0].goals.push(clone(candidate.sourceEvidence[0].goals[0])) }],
  ['duplicate source-evidence package', (candidate) => {
    candidate.sourceEvidence.push({
      ...clone(candidate.sourceEvidence[0]),
      targetLandscapeId: MODULE_ID,
    })
  }],
]
invalidCases.forEach(([label, mutate]) => {
  const candidate = fixture()
  mutate(candidate)
  assert.throws(() => parseRuntimeCurriculumCatalog(candidate), undefined, label)
})

const response = (status: number, body?: unknown): Response => new Response(
  body === undefined ? undefined : JSON.stringify(body),
  { status, headers: body === undefined ? undefined : { 'Content-Type': 'application/json' } },
)
const packageLoad = await loadRuntimeCurriculumCatalog(async () => response(200, fixture()), 'https://api.example.test')
assert.equal(packageLoad.mode, 'package')
assert.equal((await loadRuntimeCurriculumCatalog(async () => response(404))).mode, 'repository')
assert.equal((await loadRuntimeCurriculumCatalog(
  async () => response(404),
  '',
  { allowRepositoryFallback: false },
)).mode, 'unavailable')
assert.equal((await loadRuntimeCurriculumCatalog(async () => response(500))).mode, 'unavailable')
assert.equal((await loadRuntimeCurriculumCatalog(async () => { throw new Error('network') })).mode, 'unavailable')
assert.equal((await loadRuntimeCurriculumCatalog(async () => response(200, { catalogApiVersion: '2.0' }))).mode, 'unavailable')

console.log('Runtime curriculum catalog adapter: all package/repository/fail-closed cases passed.')
