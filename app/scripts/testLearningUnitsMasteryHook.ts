import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { startViteTestServer } from './viteTestServer'

const server = await startViteTestServer(fileURLToPath(new URL('../', import.meta.url)), 'scripts/fixtures/learningUnitsMasteryHook.html')
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
let readCount = 0
let next: unknown = { mastery: { Q: 0, A: 0 }, learningUnits: null }
let holdNext = false
let release: (() => void) | undefined
const learningUnits = (recognized: string[]) => ({ calculationStatus: 'valid', semantics: 'global-unit-recognition-v1',
  contractDigest: 'sha256:fixture', recognizedGoalIds: recognized, voluntaryGoalIds: [], units: [] })
const snapshot = async () => JSON.parse(await page.getByTestId('snapshot').innerText())
try {
  await page.route('**/api/ui/learners/*/mastery*', async route => {
    readCount += 1
    const response = structuredClone(next)
    if (holdNext) {
      holdNext = false
      await new Promise<void>(resolve => { release = resolve })
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) })
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/learningUnitsMasteryHook.html`)
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="snapshot"]')!.textContent!).explicit.Q === 0)
  next = { mastery: { Q: 1, A: 0 }, learningUnits: learningUnits(['A']) }
  await page.getByText('Refresh', { exact: true }).click()
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="snapshot"]')!.textContent!).effective.A === 1)
  assert.equal((await snapshot()).explicit.A, 0, 'backend recognition is displayed without creating an explicit result')
  const recognizedIcon = page.getByTestId('goal-recognized')
  await recognizedIcon.focus()
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
  await page.getByRole('tooltip').getByText('Deine bestandenen Prüfungen belegen diese Kompetenz. Sie zählt für den gesamten Fortschritt und spätere Voraussetzungen.', { exact: true }).waitFor()
  await page.keyboard.press('Escape')

  assert.equal(await page.getByRole('button', { name: 'Freiwillig üben', exact: true }).count(), 0, 'recognition alone does not authorize a voluntary start')
  next = { mastery: { Q: 1, A: 0 }, learningUnits: { ...learningUnits(['A']), voluntaryGoalIds: ['A'] } }
  await page.getByText('Refresh', { exact: true }).click()
  const activeWrites: unknown[] = []
  await page.route('**/api/ui/learners/*/active-goal', async route => {
    activeWrites.push(route.request().postDataJSON())
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ activeGoal: { id: 'A' } }) })
  })
  await page.getByRole('button', { name: 'Freiwillig üben', exact: true }).click()
  assert.deepEqual(activeWrites, [{ goalId: 'A', redirect: false }], 'the existing active-goal action is used without a mastery write')
  await page.getByRole('button', { name: 'Zum aktiven Lernziel springen' }).click()
  assert.equal(await page.getByTestId('revealed').innerText(), 'true', 'an active recognized goal retains its ordinary reveal action')
  assert.equal((await snapshot()).explicit.A, 0)

  holdNext = true
  await page.getByText('Refresh', { exact: true }).click()
  while (!release) await new Promise(resolve => setTimeout(resolve, 10))
  await page.getByText('Correct Q', { exact: true }).click()
  let after = await snapshot()
  assert.equal(after.explicit.Q, 0)
  assert.equal(after.effective.A, 0, 'a correction immediately invalidates old recognition')
  release()
  release = undefined
  await page.waitForTimeout(100)
  after = await snapshot()
  assert.equal(after.effective.A, 0, 'a read started before the correction cannot resurrect recognition')
  next = { mastery: { Q: 0, A: 0 }, learningUnits: learningUnits([]) }
  await page.getByText('Refresh', { exact: true }).click()
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="snapshot"]')!.textContent!).units?.calculationStatus === 'valid')
  assert.equal((await snapshot()).effective.A, 0)

  next = { mastery: { Q: 1, A: 0 }, learningUnits: { ...learningUnits([]), semantics: 'unknown' } }
  await page.getByText('Refresh', { exact: true }).click()
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="snapshot"]')!.textContent!).explicit.Q === 1)
  assert.equal((await snapshot()).effective.A, 0, 'an invalid I response retains valid explicit M and awards no credit')
  next = { mastery: { Q: 1, A: 0 }, learningUnits: { ...learningUnits([]), calculationStatus: 'unavailable', contractDigest: null } }
  await page.getByText('Refresh', { exact: true }).click()
  await page.waitForTimeout(100)
  assert.equal((await snapshot()).explicit.Q, 1)
  assert.equal((await snapshot()).effective.A, 0)

  next = { mastery: { Q: 0, A: 0, memory: 1 }, learningUnits: learningUnits([]) }
  const readsBeforeCurriculumChange = readCount
  await page.getByText('Other curriculum', { exact: true }).click()
  await page.waitForFunction(() => JSON.parse(document.querySelector('[data-testid="snapshot"]')!.textContent!).effective.memory === 1)
  assert.ok(readCount > readsBeforeCurriculumChange, 'changing curriculum refreshes backend-resolved SRS outcomes for the same learner')

  holdNext = true
  next = { mastery: { Q: 1, A: 0 }, learningUnits: learningUnits(['A']) }
  await page.getByText('Refresh', { exact: true }).click()
  while (!release) await new Promise(resolve => setTimeout(resolve, 10))
  next = { mastery: {}, learningUnits: null }
  await page.getByText('Other learner', { exact: true }).click()
  release()
  release = undefined
  await page.waitForTimeout(100)
  assert.deepEqual((await snapshot()).effective, {}, 'a prior learner response cannot leak into the new learner')
  assert.ok(readCount >= 7)
  console.log('Actual mastery hook browser checks passed: Q pass -> I, correction -> open A, stale read rejection, unavailable/invalid I, curriculum refresh, learner isolation and authorized voluntary practice.')
} finally {
  release?.()
  await browser.close()
  await server.close()
}
