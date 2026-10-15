import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import type { Browser } from 'playwright'
import { CANONICAL_GYMNASIUM_ROOT_ID as rootId } from '../src/utils/curriculumDisplay'
import { startViteTestServer } from './viteTestServer'

const mathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const physicsId = 'scope-physics-fixture'
const learnerId = 'exact-scope-fixture'
const scope = (courseProfile = 'GK', durationModel: string | null = 'G9') => ({
  schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', durationModel, courseProfile,
})
const goal = (id: string, contexts?: ReturnType<typeof scope>[], contains: string[] = [], root = false) => ({
  id, title: id, description: 'Synthetic scope regression fixture.', contains, requires: [], weight: 1,
  tags: root ? ['root'] : [], dimensionTags: { framework: 'canonical-gymnasium-test', phase: 'GLOBAL' },
  ...(contexts === undefined ? {} : { extendedData: { applicabilityContexts: contexts } }),
})
const target = (goalId: string) => ({ kind: 'goalEntry', goalId })
const view = (viewId: string, landscapeId: string, course: string, goalIds: string[]) => ({
  viewId, landscapeId, scope: scope(course), rootNodes: goalIds.map(target),
})

/** Called by the existing CI startup entry; exercise the real root learner tree. */
export async function assertExactScopeTargetTrees(browser: Browser): Promise<void> {
  const server = await startViteTestServer(fileURLToPath(new URL('../', import.meta.url)),
    'scripts/fixtures/exactScopeTargetsUi.html')
  const failures: string[] = []
  try {
    for (const mode of ['combined', 'supplement-only', 'missing-duration'] as const) {
      const supplement = mode === 'supplement-only'
      const missingDuration = mode === 'missing-duration'
      const config = {
        [rootId]: { selected: true, filterId: 'DE-HE', stage: 'SekII', ...(missingDuration ? {} : { durationModel: 'G9' }) },
        [mathId]: { selected: !supplement, filterId: mode === 'combined' ? 'GK+LK' : 'GK',
          ...(supplement ? { supplementSelections: [{ supplementId: 'SCOPE_TEST', authorizationSha256: 'a'.repeat(64) }] } : {}) },
        [physicsId]: { selected: true, filterId: 'LK' },
      }
      const landscapes = [
        { landscapeId: rootId, frameworkId: 'canonical-gymnasium-test', title: 'Scope school',
          goals: [goal('SCOPE_TEST_SCHOOL_ROOT', undefined, ['SCOPE_TEST_MATH_ROOT', 'SCOPE_TEST_PHYSICS_ROOT'], true)] },
        { landscapeId: mathId, frameworkId: 'canonical-gymnasium-test', title: 'Scope Mathematics',
          goals: [goal('SCOPE_TEST_MATH_ROOT', undefined,
            ['SCOPE_TEST_MATH_GOAL', 'SCOPE_TEST_ORDINARY', 'SCOPE_TEST_WRONG_COURSE', 'SCOPE_TEST_DENIED', 'SCOPE_TEST_UNREFERENCED'], true),
          goal('SCOPE_TEST_MATH_GOAL', [scope('GK', missingDuration ? null : 'G9')]), goal('SCOPE_TEST_ORDINARY'),
          goal('SCOPE_TEST_WRONG_COURSE', [scope('LK')]), goal('SCOPE_TEST_DENIED', []), goal('SCOPE_TEST_UNREFERENCED', [scope()])] },
        { landscapeId: physicsId, frameworkId: 'canonical-gymnasium-test', title: 'Scope Physics',
          goals: [goal('SCOPE_TEST_PHYSICS_ROOT', undefined, ['SCOPE_TEST_PHYSICS_GOAL'], true),
            goal('SCOPE_TEST_PHYSICS_GOAL', [scope('LK')])] },
      ]
      const gk = view('scope-math-gk', mathId, 'GK', ['SCOPE_TEST_MATH_GOAL', 'SCOPE_TEST_WRONG_COURSE', 'SCOPE_TEST_DENIED'])
      const lk = view('scope-math-lk', mathId, 'LK', ['SCOPE_TEST_ORDINARY'])
      const page = await browser.newPage()
      page.setDefaultTimeout(10_000)
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.route('**/api/**', async route => {
        const url = new URL(route.request().url()), path = url.pathname
        const json = (body: unknown) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
        // LearnerView may attempt resume; this fixture never allows learner writes.
        if (route.request().method() !== 'GET') return route.fulfill({ status: 405, body: '' })
        if (path === '/api/ui/curriculum-catalog') return route.fulfill({ status: 404, body: '' })
        if (path.endsWith('/closure')) return json(landscapes)
        if (path.endsWith('/mastery')) return json({ mastery: {} })
        if (path === `/api/ui/learners/${learnerId}`) return json({ skillpilotId: learnerId, personalCurriculum: JSON.stringify(config) })
        if (path.endsWith('/selected-composition-views')) return json([{
          ...gk, viewId: 'selected-supplement:SCOPE_TEST:fixture',
          rootNodes: [{ kind: 'structure', id: 'preparation', label: 'Selected preparation', children: gk.rootNodes }],
        }])
        if (path === '/api/ui/composition-views/match') {
          const id = url.searchParams.get('landscapeId')
          if (id === mathId) return json(mode === 'combined' ? {
            viewId: 'merged:scope-math-lk+scope-math-gk', landscapeId: mathId, scope: scope('GK+LK'),
            rootNodes: [...lk.rootNodes, ...gk.rootNodes], mergedFromViewIds: [lk.viewId, gk.viewId], resolvedCourseProfileViews: [lk, gk],
          } : gk)
          if (id === physicsId) return json(view('scope-physics-lk', physicsId, 'LK', ['SCOPE_TEST_PHYSICS_GOAL']))
          return route.fulfill({ status: 204, body: '' })
        }
        if (path.endsWith('/state')) return json({ stateMachine: { requiredAction: null, goalOptions: [] },
          goals: { planned: [], mastered_count: 0, total_count: 2, personalized: { mastered_atomic: 0, total_atomic: 2 } } })
        return route.fulfill({ status: 404, body: '' })
      })
      try {
        await page.goto(`${server.baseUrl}/scripts/fixtures/exactScopeTargetsUi.html`)
        await page.getByTestId('scope-tree').waitFor()
        await page.waitForFunction(() => !document.querySelector('[data-testid="learner-tree-loading"]'))
        for (let round = 0; round < 4; round++) {
          const buttons = page.getByRole('button', { name: '▶', exact: true })
          if (await buttons.count() === 0) break
          for (const button of await buttons.all()) if (await button.isVisible()) await button.click()
        }
        const count = (id: string) => page.locator(`[data-testid="scope-tree"] [title^="${id}"]`).count()
        assert.equal(await count('SCOPE_TEST_MATH_GOAL'), missingDuration ? 0 : 1, `${mode}: source-authorized Math goal`)
        assert.equal(await count('SCOPE_TEST_PHYSICS_GOAL'), missingDuration ? 0 : 1, `${mode}: independent Physics LK target`)
        assert.equal(await count('SCOPE_TEST_ORDINARY'), mode === 'combined' ? 1 : 0, `${mode}: ordinary Math is not opted in by a supplement`)
        for (const id of ['SCOPE_TEST_WRONG_COURSE', 'SCOPE_TEST_DENIED', 'SCOPE_TEST_UNREFERENCED']) {
          assert.equal(await count(id), 0, `${mode}: ${id} cannot borrow authority or eligibility`)
        }
        assert.deepEqual(errors, [])
        console.log(`Exact scope target tree passed: ${mode}`)
      } catch (error) {
        failures.push(`${mode}: ${error instanceof Error ? error.message : String(error)}${errors.length ? `; page errors: ${errors.join('; ')}` : ''}`)
      } finally { await page.close() }
    }
    assert.deepEqual(failures, [], 'mounted exact-scope target regressions')
  } finally { await server.close() }
}
