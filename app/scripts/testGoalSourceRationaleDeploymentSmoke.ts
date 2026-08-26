import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { runGoalSourceRationaleDeploymentSmoke } from './smokeGoalSourceRationaleDeployment'

const GENERATION = 'a'.repeat(64)
const PACKAGE_ID = 'org.example.source-evidence'
const PACKAGE_VERSION = '1.2.3'
const LANDSCAPE_ID = 'sentinel-landscape'
const GOAL_ID = 'sentinel-goal'
const MATH_MEM_GOALS = [
  '339a7bf5-f1df-5d5a-9ec4-41f471f0c111',
  '02013455-72a0-5213-9509-ed77f7ede62b',
  '09f47964-2cd0-410e-93ee-9632b582fc91',
  'b1dcc191-d046-50de-984a-ee5c17157628',
]

type RequestHandler = (request: IncomingMessage, response: ServerResponse) => void

const json = (response: ServerResponse, status: number, body: unknown): void => {
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(body))
}

const withServer = async <T>(
  handler: RequestHandler,
  run: (baseUrl: string) => Promise<T>,
): Promise<T> => {
  const server = createServer(handler)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  try {
    return await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

const repositoryPayload = (
  jurisdiction: string,
  itemCount: number,
  requiredMemGoals: readonly string[] = [],
): Record<string, unknown> => {
  const goalIds = [
    ...requiredMemGoals,
    ...Array.from(
      { length: itemCount - requiredMemGoals.length },
      (_, index) => `fixture-goal-${jurisdiction}-${index}`,
    ),
  ]
  return {
    request: {
      jurisdiction,
      goalSelection: 'source-backed-relevant-leaves',
    },
    summary: {
      goalsWithoutClassicSourceRoute: 0,
    },
    items: goalIds.map((goalId) => ({
      goal: { id: goalId },
      sourceRationaleStatus: 'classic_source_reviewed',
      memSparqlRoute: requiredMemGoals.includes(goalId)
        ? { status: 'mem_sparql_consistent' }
        : undefined,
    })),
  }
}

const packageCatalog = {
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
    subject: 'Mathematik',
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
    mappingEdgeCount: 1,
    goals: [{ goalId: GOAL_ID, jurisdictions: ['DE-HE'] }],
    href: `/api/ui/curriculum-source-evidence/packages/${PACKAGE_ID}/${PACKAGE_VERSION}/goals`,
  }],
}

const packageEvidence = {
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
    description: 'A reviewed source-near goal.',
    sourceText: 'Reviewed source-near formulation.',
    sourceTextSha256: `sha256:${'c'.repeat(64)}`,
    locator: {
      passageId: 'sentinel-passage',
      topicCode: 'M-1',
      sourceSpan: 'SENTINEL-SPAN#1',
      sourceRef: 'S. 1',
    },
  },
  sourceDocument: {
    sourceDocumentId: 'sentinel-source-document',
    sourceKey: 'sentinel-source-key',
    title: 'Official curriculum',
    role: 'primary',
    semanticType: 'curriculum',
    url: 'https://example.org/curriculum.pdf',
  },
}

const repositoryRequests: string[] = []
const repositoryResult = await withServer((request, response) => {
  const path = request.url ?? ''
  repositoryRequests.push(path)
  if (path === '/api/ui/curriculum-catalog') return json(response, 404, { error: 'Not Found' })
  if (path === '/data/goal-source-rationales-math-public.json') {
    return json(response, 200, repositoryPayload('DE-BY', 600, MATH_MEM_GOALS))
  }
  if (path === '/data/goal-source-rationales-physics-public.json') {
    return json(response, 200, repositoryPayload('DE-HE', 350))
  }
  return json(response, 404, { error: 'Not Found' })
}, runGoalSourceRationaleDeploymentSmoke)
assert.equal(repositoryResult.mode, 'repository')
assert.equal(repositoryResult.resultLines.length, 2)
assert.deepEqual(repositoryRequests, [
  '/api/ui/curriculum-catalog',
  '/data/goal-source-rationales-math-public.json',
  '/data/goal-source-rationales-physics-public.json',
])

const packageRequests: string[] = []
const packageResult = await withServer((request, response) => {
  const path = request.url ?? ''
  packageRequests.push(path)
  if (path === '/api/ui/curriculum-catalog') return json(response, 200, packageCatalog)
  if (
    path
    === `/api/ui/curriculum-source-evidence/packages/${PACKAGE_ID}/${PACKAGE_VERSION}/goals/${GOAL_ID}`
      + `?generation=${GENERATION}&jurisdiction=DE-HE`
  ) {
    return json(response, 200, packageEvidence)
  }
  return json(response, 404, { error: 'Not Found' })
}, runGoalSourceRationaleDeploymentSmoke)
assert.equal(packageResult.mode, 'package')
assert.equal(packageResult.resultLines.length, 1)
assert.equal(packageRequests.length, 2)

await assert.rejects(
  withServer((_request, response) => {
    json(response, 503, { error: 'Service Unavailable' })
  }, runGoalSourceRationaleDeploymentSmoke),
  /expected HTTP 200 or 404, received HTTP 503/u,
)

await assert.rejects(
  withServer((request, response) => {
    const path = request.url ?? ''
    if (path === '/api/ui/curriculum-catalog') return json(response, 404, { error: 'Not Found' })
    if (path === '/data/goal-source-rationales-math-public.json') {
      return json(response, 200, repositoryPayload('DE-BY', 600, MATH_MEM_GOALS))
    }
    return json(response, 404, { error: 'Not Found' })
  }, runGoalSourceRationaleDeploymentSmoke),
  /goal-source-rationales-physics-public\.json: HTTP 404/u,
)

console.log('Goal source-rationale deployment smoke: repository and package modes passed.')
