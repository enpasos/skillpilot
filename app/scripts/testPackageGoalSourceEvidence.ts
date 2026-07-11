import assert from 'node:assert/strict'
import {
  loadPackageGoalSourceEvidence,
  parsePackageGoalSourceEvidencePayload,
  resolvePackageGoalSourceEvidenceRequest,
  toGoalSourceRationaleItem,
} from '../src/utils/packageGoalSourceEvidence'
import type { RuntimeCurriculumCatalogState } from '../src/utils/runtimeCurriculumCatalog'

const PACKAGE_ID = 'org.example.source-evidence'
const PACKAGE_VERSION = '1.2.3'
const LANDSCAPE_ID = 'sentinel-landscape'
const GOAL_ID = 'sentinel-goal'
const GENERATION = 'a'.repeat(64)
const DISCOVERY_HREF = `/api/ui/curriculum-source-evidence/packages/${PACKAGE_ID}/${PACKAGE_VERSION}/goals`

const packageState: RuntimeCurriculumCatalogState = {
  mode: 'package',
  apiBase: 'https://api.example.test/base',
  catalog: {
    catalogApiVersion: '1.2',
    generationSha256: GENERATION,
    packages: [{
      packageId: PACKAGE_ID,
      packageVersion: PACKAGE_VERSION,
      releaseId: `${PACKAGE_ID}@${PACKAGE_VERSION}`,
      contentDigest: `sha256:${'b'.repeat(64)}`,
      capabilities: ['sourceEvidence'],
    }],
    rootLandscapeIds: [LANDSCAPE_ID],
    landscapes: [{
      packageId: PACKAGE_ID,
      landscapeId: LANDSCAPE_ID,
      role: 'root',
      locale: 'de-DE',
      frameworkId: 'sentinel-framework',
      subject: 'Sentinel',
    }],
    views: [],
    offerings: [],
    decks: [],
    resources: [],
    sourceEvidence: [{
      packageId: PACKAGE_ID,
      packageVersion: PACKAGE_VERSION,
      targetLandscapeId: LANDSCAPE_ID,
      sourceCollectionCount: 1,
      sourceDocumentCount: 1,
      sourceGoalCount: 1,
      mappingEdgeCount: 2,
      goals: [{ goalId: GOAL_ID, jurisdictions: ['DE-BY', 'DE-HE'] }],
      href: DISCOVERY_HREF,
    }],
  },
}

const goal = {
  id: GOAL_ID,
  landscapeId: LANDSCAPE_ID,
  title: 'Sentinel goal',
  description: 'The learner can validate source evidence.',
}

const request = resolvePackageGoalSourceEvidenceRequest(packageState, goal, 'G9,DE-HE')
assert.ok(request)
assert.equal(
  request.href,
  `https://api.example.test/api/ui/curriculum-source-evidence/packages/${PACKAGE_ID}/${PACKAGE_VERSION}/goals/${GOAL_ID}?generation=${GENERATION}&jurisdiction=DE-HE`,
)
assert.equal(request.jurisdiction, 'DE-HE')
assert.equal(
  resolvePackageGoalSourceEvidenceRequest(packageState, goal)?.href,
  `https://api.example.test/api/ui/curriculum-source-evidence/packages/${PACKAGE_ID}/${PACKAGE_VERSION}/goals/${GOAL_ID}?generation=${GENERATION}`,
)
assert.equal(resolvePackageGoalSourceEvidenceRequest(packageState, goal, 'DE-NW'), undefined)
assert.equal(resolvePackageGoalSourceEvidenceRequest({ mode: 'repository' }, goal, 'DE-HE'), undefined)
assert.equal(
  resolvePackageGoalSourceEvidenceRequest({ mode: 'unavailable', error: new Error('offline') }, goal, 'DE-HE'),
  undefined,
)

const payload = () => ({
  generationSha256: GENERATION,
  packageId: PACKAGE_ID,
  packageVersion: PACKAGE_VERSION,
  targetLandscapeId: LANDSCAPE_ID,
  goalId: GOAL_ID,
  jurisdiction: 'DE-HE',
  matchType: 'exact',
  sourceCollection: {
    sourceCollectionId: 'sentinel-source-collection',
    sourceLandscapeId: 'sentinel-source-landscape',
    subject: 'Mathematik',
    stage: 'Sekundarstufe I',
    durationModels: ['G9'],
  },
  sourceGoal: {
    sourceGoalId: 'sentinel-source-goal',
    title: 'Official source goal',
    description: 'A reviewed source-near source goal.',
    sourceText: 'Reviewed source-near formulation.',
    sourceTextSha256: `sha256:${'c'.repeat(64)}`,
    parentBulletText: null,
    locator: {
      passageId: 'sentinel-passage',
      topicCode: 'M-1',
      sourceSpan: 'SENTINEL-SPAN#1',
      sourceRef: 'S. 1',
      sourcePage: 0,
      sourceLine: 0,
    },
    classification: {
      granularity: 'atomic',
      category: null,
      stage: 'Sekundarstufe I',
      phase: null,
      courseLevel: null,
      grade: '5',
      area: 'Zahlen',
      level: null,
    },
    lineage: null,
  },
  sourceDocument: {
    sourceDocumentId: 'sentinel-source-document',
    sourceKey: 'sentinel-source-key',
    title: 'Official curriculum',
    role: 'primary',
    semanticType: 'curriculum',
    url: 'https://example.org/curriculum.pdf',
    landingUrl: null,
    durationModel: 'G9',
  },
})

const parsed = parsePackageGoalSourceEvidencePayload(payload(), request)
assert.equal(parsed.sourceGoal.locator.sourcePage, 0)
assert.equal(parsed.sourceGoal.classification?.grade, '5')
const rationale = toGoalSourceRationaleItem(parsed, goal)
assert.equal(rationale.classicSourceRoute?.sourceText, 'Reviewed source-near formulation.')
assert.equal(rationale.classicSourceRoute?.sourceExtractionPath, undefined)

const invalidCases: Array<[string, (candidate: ReturnType<typeof payload>) => void]> = [
  ['generation', (candidate) => { candidate.generationSha256 = 'd'.repeat(64) }],
  ['goal binding', (candidate) => { candidate.goalId = 'other-goal' }],
  ['jurisdiction binding', (candidate) => { candidate.jurisdiction = 'DE-BY' }],
  ['source hash', (candidate) => { candidate.sourceGoal.sourceTextSha256 = 'c'.repeat(64) }],
  ['negative source line', (candidate) => { candidate.sourceGoal.locator.sourceLine = -1 }],
  ['unsafe source URL', (candidate) => { candidate.sourceDocument.url = 'javascript:alert(1)' }],
]
invalidCases.forEach(([label, mutate]) => {
  const candidate = payload()
  mutate(candidate)
  assert.throws(() => parsePackageGoalSourceEvidencePayload(candidate, request), undefined, label)
})

const response = (status: number, body?: unknown): Response => new Response(
  body === undefined ? undefined : JSON.stringify(body),
  { status, headers: body === undefined ? undefined : { 'Content-Type': 'application/json' } },
)
let requestCount = 0
const loaded = await loadPackageGoalSourceEvidence(async (input, init) => {
  requestCount += 1
  assert.equal(String(input), request.href)
  assert.equal(init?.cache, 'force-cache')
  return response(200, payload())
}, request, goal)
assert.equal(requestCount, 1)
assert.equal(loaded?.goal?.id, GOAL_ID)

for (const status of [204, 404, 500]) {
  let fetchCount = 0
  const result = await loadPackageGoalSourceEvidence(async () => {
    fetchCount += 1
    return response(status)
  }, request, goal)
  assert.equal(fetchCount, 1)
  assert.equal(result, null)
}
const invalidResult = await loadPackageGoalSourceEvidence(async () => response(200, { ...payload(), goalId: 'other' }), request, goal)
assert.equal(invalidResult, null)

console.log('Package goal source-evidence adapter: discovery, binding and fail-closed cases passed.')
