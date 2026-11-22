import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium } from 'playwright'
import { startViteTestServer } from './viteTestServer'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
process.env.VITE_API_BASE = ''
const server = await startViteTestServer(appRoot, 'scripts/fixtures/learnerUnitAssignmentPlanUi.html', { plugins: [tailwindcss()] })
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const originalBlocks = [
    { id: 'individual', kind: 'learning', title: 'Bestehender Auftrag', goalId: 'individual', goalIds: ['individual'],
      atomicGoalIds: ['individual'], startDate: '2026-11-22', endDate: '2026-12-01' },
    { id: 'buffer', kind: 'buffer', title: 'Puffer', startDate: '2026-12-02', endDate: '2026-12-03' },
  ]
  const binding = { sectionGoalId: 'unit', revision: 'review1', fingerprint: 'e'.repeat(64) }
  let revision = 3
  let blocks: Record<string, unknown>[] = structuredClone(originalBlocks)
  let reads = 0
  const writes: string[] = []
  const detail = () => ({
    planId: 'plan', revision, landscapeId: 'physics', planLabel: 'Physik', stale: false,
    period: { startDate: '2026-11-22', endDate: '2026-12-03' }, currentBlock: null, nextMilestone: null,
    buffer: { totalWorkdays: 2, remainingWorkdays: 2 }, nextEligibleGoal: { goalId: 'math-foundation' },
    canContinue: true, continueReason: null, blocks,
  })
  await page.route('**/api/ui/learners/assignment-plan-browser/learning-plans/**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (request.method() === 'GET') {
      reads += 1
      if (path.endsWith('/physics/unit-assignments')) {
        return route.fulfill({ json: [{ ...binding, title: { de: 'Einheit' }, passed: false,
          parts: ['part-a', 'part-b'].map(goalId => ({ goalId, title: { de: goalId }, passed: false, materialCurrent: true })) }] })
      }
      assert.ok(path.endsWith('/by-landscape'))
      return route.fulfill({ json: detail() })
    }
    assert.equal(request.method(), 'PUT')
    const body = request.postDataJSON()
    assert.equal(body.expectedRevision, revision, 'each write uses the refreshed plan revision')
    if (path.endsWith('/by-landscape')) {
      writes.push('add')
      assert.deepEqual(body.blocks.slice(0, 2), originalBlocks, 'adding a unit preserves other learning and buffer blocks')
      assert.equal(body.blocks.length, 3)
      assert.deepEqual(body.blocks[2].unitAssignment, binding)
      assert.deepEqual(body.blocks[2].goalIds, ['unit'])
      assert.deepEqual(body.blocks[2].atomicGoalIds, ['part-a', 'part-b'])
      blocks = body.blocks
      revision += 1
      return route.fulfill({ json: detail() })
    }
    assert.ok(path.endsWith('/plan/unit-assignment-activity'))
    assert.equal(body.blockId, blocks[2].id)
    assert.equal(body.active, writes.length === 2)
    writes.push(body.active ? 'reactivate' : 'pause')
    blocks[2] = { ...blocks[2], active: body.active }
    revision += 1
    return route.fulfill({ status: 204 })
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/learnerUnitAssignmentPlanUi.html`)
  const manager = page.getByTestId('learner-plan-management')
  await manager.locator('summary').waitFor()
  assert.equal(await manager.getAttribute('open'), null)
  assert.equal(reads, 0, 'entering the Cockpit does not load assignment options')
  assert.equal(await page.getByTestId('learner-unit-assignment').count(), 0)
  await manager.locator('summary').click()
  await page.getByTestId('unit-assignment-add').click()
  await page.getByTestId('stored-unit-assignments').getByRole('button', { name: 'Einheitenauftrag pausieren', exact: true }).click()
  const reactivate = page.getByTestId('stored-unit-assignments').getByRole('button', { name: 'Einheitenauftrag wieder aktivieren', exact: true })
  await reactivate.waitFor()
  assert.equal(await page.getByTestId('unit-assignment-add').count(), 0, 'saved assignment activity has one management control')
  await reactivate.click()
  await page.getByTestId('stored-unit-assignments').getByRole('button', { name: 'Einheitenauftrag pausieren', exact: true }).waitFor()
  assert.deepEqual(writes, ['add', 'pause', 'reactivate'])
  assert.equal(await manager.getByTestId('unit-assignment-next').count(), 0)
  assert.equal(await manager.getByTestId('unit-assignment-try').count(), 0)
  assert.equal(await manager.getByTestId('unit-assignment-next-individual').count(), 0)
  assert.equal(await manager.getByText('Mathematische Grundlage', { exact: true }).count(), 0)
  await manager.locator('summary').click()
  await page.getByTestId('learner-unit-assignment').waitFor({ state: 'detached' })
  assert.equal(await page.getByTestId('learner-unit-assignment').count(), 0)
  assert.deepEqual(errors, [])
  console.log('Unit assignment creation, pause and reactivation through collapsed learning-plan management passed')
} finally {
  await browser.close()
  await server.close()
}
