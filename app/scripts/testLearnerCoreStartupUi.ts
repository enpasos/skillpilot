import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
import { startViteTestServer } from './viteTestServer'

const rootId = CANONICAL_GYMNASIUM_ROOT_ID
const mathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const physicsId = 'physics-fixture'
const deferred = () => {
  let release!: () => void
  const promise = new Promise<void>((resolve) => { release = resolve })
  return { promise, release }
}
const profileGate = deferred()
const scopedGate = deferred()
const compositionGate = deferred()
const switchedScopeGate = deferred()
const scopedArrived = deferred()
const profileArrived = deferred()
const compositionArrived = deferred()
const switchArrived = deferred()
const goal = (id: string, title: string, contains: string[] = [], root = false) => ({
  id, title, description: title, contains, requires: [], weight: 1,
  tags: root ? ['root'] : [], dimensionTags: { phase: 'E', framework: 'test' },
})
const landscapes = (suffix: string) => [
  {
    landscapeId: rootId, title: 'Gymnasium', frameworkId: 'canonical-gymnasium',
    goals: [goal('root', 'Gymnasium', ['math-root', 'physics-root'], true)],
  },
  ...[[mathId, 'math', 'Mathematik'], [physicsId, 'physics', 'Physik']].map(([landscapeId, prefix, title]) => ({
    landscapeId, title, subject: title, frameworkId: 'canonical-gymnasium',
    goals: [goal(`${prefix}-root`, title, [`${prefix}-a`, `${prefix}-b`], true),
      goal(`${prefix}-a`, `${title} Sekundarstufe I ${suffix}`), goal(`${prefix}-b`, `${title} Sekundarstufe II ${suffix}`)],
  })),
]
const profile = (id: string) => ({
  skillpilotId: id,
  personalCurriculum: JSON.stringify({
    [rootId]: { selected: true, filterId: 'DE', durationModel: 'G9', stage: 'CrossStage' },
    [mathId]: { selected: true, filterId: 'GK+LK' },
    [physicsId]: { selected: true, filterId: 'GK+LK' },
  }),
})
const view = (landscapeId: string) => ({
  viewId: `view-${landscapeId}`, landscapeId, scope: { stage: 'CrossStage' },
  rootNodes: landscapeId === rootId ? [
    { kind: 'landscapeEntry', landscapeId: mathId },
    { kind: 'landscapeEntry', landscapeId: physicsId },
  ] : [{ kind: 'canonicalSubtree', goalId: landscapeId === mathId ? 'math-root' : 'physics-root' }],
})
const counts = new Map<string, number>()
const count = (path: string) => counts.get(path) ?? 0
const server = await startViteTestServer(fileURLToPath(new URL('../', import.meta.url)), 'scripts/fixtures/learnerCoreStartupUi.html')
let browser: Browser | null = null
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/api/ui/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    counts.set(path, count(path) + 1)
    const json = (body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    if (path === '/api/ui/curriculum-catalog') return route.fulfill({ status: 404, body: '' })
    if (path.startsWith('/api/ui/landscapes/')) return json(landscapes('UNSCOPED-FORBIDDEN'))
    if (path === '/api/ui/composition-views/match') {
      compositionArrived.release()
      await compositionGate.promise
      const landscapeId = url.searchParams.get('landscapeId')!
      assert.equal(url.searchParams.get('stage'), 'CrossStage')
      return json(view(landscapeId))
    }
    const id = path.split('/')[4]
    if (path.endsWith('/closure')) {
      if (id === 'learner-a') { scopedArrived.release(); await scopedGate.promise }
      if (id === 'learner-b') { switchArrived.release(); await switchedScopeGate.promise }
      if (id === 'learner-error') return route.fulfill({ status: 503, body: 'Scoped service unavailable' })
      return json(id === 'learner-empty' ? [] : landscapes(id))
    }
    if (path.endsWith('/mastery')) return json({ mastery: {} })
    if (path === `/api/ui/learners/${id}`) {
      if (id === 'learner-profile-error') return route.fulfill({ status: 503, body: 'Profile unavailable' })
      if (id === 'learner-a') { profileArrived.release(); await profileGate.promise }
      return json(profile(id))
    }
    throw new Error(`Unexpected API request: ${path}`)
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/learnerCoreStartupUi.html`)
  await Promise.all([profileArrived.promise, scopedArrived.promise])
  await page.getByTestId('loading').waitFor()
  assert.equal(await page.getByTestId('ready').count(), 0)
  scopedGate.release()
  await page.getByTestId('source').filter({ hasText: 'Mathematik' }).waitFor()
  assert.equal(count('/api/ui/composition-views/match'), 0, 'no speculative default-scope matches before profile arrives')
  assert.equal(await page.getByTestId('ready').count(), 0)
  profileGate.release()
  await compositionArrived.promise
  assert.equal(await page.getByTestId('ready').count(), 0, 'no mount between profile and composition effects')
  compositionGate.release()
  await page.getByTestId('ready').filter({ hasText: 'Physik Sekundarstufe II learner-a' }).waitFor()
  const readyText = await page.getByTestId('ready').innerText()
  for (const title of ['Mathematik Sekundarstufe I', 'Mathematik Sekundarstufe II', 'Physik Sekundarstufe I', 'Physik Sekundarstufe II']) assert.ok(readyText.includes(title), title)
  assert.equal(await page.locator('html').getAttribute('data-mounts'), '1', 'one stable workspace mount')
  assert.equal(count(`/api/ui/landscapes/${rootId}/closure`), 0, 'never download broad canonical graph')
  assert.equal(count(`/api/ui/learners/learner-a/landscapes/${rootId}/closure`), 1)
  assert.equal(count('/api/ui/learners/learner-a'), 1)
  assert.equal(count('/api/ui/composition-views/match'), 3)
  await page.getByRole('button', { name: 'Nur Navigation' }).click()
  await page.getByTestId('ready').waitFor()
  assert.equal(await page.locator('html').getAttribute('data-mounts'), '1')
  assert.equal(count('/api/ui/composition-views/match'), 3, 'irrelevant query navigation must not reload projections')
  await page.getByRole('button', { name: 'Physikplanziel' }).click()
  await page.getByTestId('route').filter({ hasText: `/learner/physics-a?l=${rootId}` }).waitFor()
  await page.getByTestId('ready').waitFor()
  assert.equal(await page.locator('html').getAttribute('data-mounts'), '1', 'a loaded subject goal keeps the canonical cockpit mounted')
  assert.equal(count('/api/ui/composition-views/match'), 3, 'plan subject navigation reuses the current projection')
  assert.equal(count(`/api/ui/learners/learner-a/landscapes/${rootId}/closure`), 1)
  assert.equal(count('/api/ui/landscapes/physics-fixture/closure'), 0)
  assert.equal(count('/api/ui/learners/learner-a/landscapes/physics-fixture/closure'), 0)

  await page.getByRole('button', { name: 'Andere Person' }).click()
  await switchArrived.promise
  await page.getByTestId('loading').waitFor()
  assert.equal(await page.getByTestId('ready').count(), 0, 'previous learner never remains visible while switching')
  assert.equal(await page.getByTestId('source').innerText(), '')
  switchedScopeGate.release()
  await page.getByTestId('ready').filter({ hasText: 'Physik Sekundarstufe II learner-b' }).waitFor()
  assert.ok(!(await page.getByTestId('ready').innerText()).includes('learner-a'))
  await page.getByRole('button', { name: 'Fehlerfall' }).click()
  await page.getByTestId('error').filter({ hasText: 'Scoped service unavailable' }).waitFor()
  assert.equal(await page.getByTestId('ready').count(), 0, 'scoped errors do not render old or broad goals')
  const matchesBeforeProfileError = count('/api/ui/composition-views/match')
  await page.getByRole('button', { name: 'Profilfehler' }).click()
  await page.getByTestId('error').filter({ hasText: 'Failed to load learner profile (503)' }).waitFor()
  assert.equal(await page.getByTestId('ready').count(), 0)
  assert.equal(count('/api/ui/composition-views/match'), matchesBeforeProfileError, 'failed profile must not request default-scope projections')
  await page.getByRole('button', { name: 'Leerer Umfang' }).click()
  await page.getByTestId('empty').waitFor()
  assert.equal(await page.getByTestId('ready').count(), 0, 'empty authoritative scope is not broadened')
  assert.equal(count(`/api/ui/landscapes/${rootId}/closure`), 0)
  await page.getByRole('button', { name: 'Externes Ziel' }).click()
  await page.getByTestId('route').filter({ hasText: '/learner/not-loaded?l=physics-fixture' }).waitFor()
  assert.deepEqual(errors, [])

  // The deployed catalog can use versioned package offerings instead of the
  // repository match endpoint. Exercise that same scoped-only startup too.
  const packagePage = await browser.newPage()
  packagePage.on('pageerror', (error) => errors.push(error.message))
  const ids = [rootId, mathId, physicsId]
  const scope = (id: string) => ({ schoolForm: 'Gymnasium', jurisdiction: 'DE', stage: 'CrossStage', durationModel: 'G9', ...(id !== rootId ? { courseProfile: 'GK+LK' } : {}) })
  const packageCounts = new Map<string, number>()
  await packagePage.route('**/api/ui/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    packageCounts.set(path, (packageCounts.get(path) ?? 0) + 1)
    const json = (body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    if (path === '/api/ui/curriculum-catalog') return json({
      catalogApiVersion: '1.2', generationSha256: 'a'.repeat(64),
      packages: [{ packageId: 'test-package', packageVersion: '1.0.0', releaseId: 'test-package@1.0.0', contentDigest: `sha256:${'b'.repeat(64)}`, capabilities: ['compositionViews'] }],
      rootLandscapeIds: [rootId],
      landscapes: ids.map((id) => ({ packageId: 'test-package', landscapeId: id, role: id === rootId ? 'root' : 'module', locale: 'de-DE', frameworkId: 'canonical-gymnasium', subject: id, defaultOfferingId: `offering-${id}`, ...(id !== rootId ? { parentLandscapeId: rootId } : {}) })),
      views: ids.map((id) => ({ packageId: 'test-package', landscapeId: id, viewId: `view-${id}`, scope: scope(id) })),
      offerings: ids.map((id) => ({ packageId: 'test-package', landscapeId: id, offeringId: `offering-${id}`, scope: scope(id), resolution: { mode: 'single', viewIds: [`view-${id}`] } })),
      resources: [], decks: [], sourceEvidence: [],
    })
    if (path === '/api/ui/learners/learner-a') return json(profile('learner-a'))
    if (path === `/api/ui/learners/learner-a/landscapes/${rootId}/closure`) return json(landscapes('package'))
    if (path.endsWith('/mastery')) return json({ mastery: {} })
    if (path.startsWith('/api/ui/composition-views/offerings/offering-')) return json(view(path.split('offering-')[1]))
    throw new Error(`Unexpected package startup request: ${path}`)
  })
  await packagePage.goto(`${server.baseUrl}/scripts/fixtures/learnerCoreStartupUi.html`)
  await packagePage.getByTestId('ready').filter({ hasText: 'Physik Sekundarstufe II package' }).waitFor()
  assert.equal(await packagePage.locator('html').getAttribute('data-mounts'), '1')
  assert.equal(packageCounts.get(`/api/ui/landscapes/${rootId}/closure`) ?? 0, 0)
  assert.equal(packageCounts.get(`/api/ui/learners/learner-a/landscapes/${rootId}/closure`), 1)
  assert.equal(packageCounts.get('/api/ui/composition-views/match') ?? 0, 0)
  for (const id of ids) assert.equal(packageCounts.get(`/api/ui/composition-views/offerings/offering-${id}`), 1)
  assert.deepEqual(errors, [])
  console.log('Learner core startup: scoped-only, bounded requests, stable mounting and fail-closed scope passed.')
} finally {
  profileGate.release(); scopedGate.release(); compositionGate.release(); switchedScopeGate.release()
  await browser?.close()
  await server.close()
}
