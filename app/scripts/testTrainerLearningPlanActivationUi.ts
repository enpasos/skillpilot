import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Route } from 'playwright'
import tailwindcss from '@tailwindcss/vite'

import { startViteTestServer } from './viteTestServer'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const learnerId = '77777777-2222-4333-8444-555555555555'
const mathLandscapeId = 'trainer-activation-math'
const physicsLandscapeId = 'trainer-activation-physics'
const mathGoalId = 'trainer-activation-math-goal'
const physicsGoalId = 'trainer-activation-physics-goal'

const berlinDateKey = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

const planDetail = ({
  landscapeId,
  goalId,
  revision,
  active,
}: {
  landscapeId: string
  goalId: string
  revision: number
  active: boolean
}) => {
  const asOf = berlinDateKey()
  const subject = landscapeId === mathLandscapeId ? 'Mathe' : 'Physik'
  const goalTitle = landscapeId === mathLandscapeId ? 'Mathematik Ziel' : 'Physik Ziel'
  const blockId = `${landscapeId}-block`
  return {
    planId: `plan-${landscapeId}`,
    revision,
    landscapeId,
    planLabel: `${subject}-Plan`,
    stale: false,
    period: { startDate: asOf, endDate: asOf },
    currentBlock: {
      blockId,
      kind: 'learning',
      title: goalTitle,
      goalId,
      startDate: asOf,
      endDate: asOf,
    },
    nextMilestone: null,
    metrics: {
      dueThroughToday: 1,
      completedDueThroughToday: 0,
      openDueThroughToday: 1,
      dueToday: 1,
      completedDueToday: 0,
      openDueToday: 1,
      totalPlanned: 1,
    },
    buffer: { totalWorkdays: 0, remainingWorkdays: 0 },
    pace: { status: 'neutral', reason: 'descriptive-only' },
    nextEligibleGoal: active ? null : { goalId },
    continueReason: active ? 'active-goal-in-progress' : null,
    canContinue: !active,
    blocks: [{
      id: blockId,
      kind: 'learning',
      goalId,
      title: goalTitle,
      startDate: asOf,
      endDate: asOf,
      atomicGoalIds: [goalId],
    }],
  }
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/trainerLearningPlanActivationUi.html',
  { plugins: [tailwindcss()] },
)

let browser: Browser | null = null

try {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-background-networking',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-sandbox',
    ],
  })
  const context = await browser.newContext({ locale: 'de-DE' })
  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', (pageError) => browserErrors.push(pageError.message))
  const activationBodies: unknown[] = []
  let failNextActivation = false
  let returnIncoherentActivation = false
  let failPhysicsRead = false
  const serverPlans = new Map<string, ReturnType<typeof planDetail> | null>([
    [mathLandscapeId, planDetail({
      landscapeId: mathLandscapeId,
      goalId: mathGoalId,
      revision: 3,
      active: false,
    })],
    [physicsLandscapeId, null],
  ])

  const fulfillPlan = async (route: Route, landscapeId: string) => {
    const plan = serverPlans.get(landscapeId)
    if (!plan) {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(plan),
    })
  }

  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (
      request.method() === 'GET'
      && url.pathname === `/api/ui/learners/${learnerId}/learning-plans/by-landscape`
    ) {
      if (failPhysicsRead && url.searchParams.get('landscapeId') === physicsLandscapeId) {
        await route.fulfill({ status: 503, body: 'temporarily unavailable' })
        return
      }
      await fulfillPlan(route, url.searchParams.get('landscapeId') ?? '')
      return
    }
    if (
      request.method() === 'POST'
      && url.pathname === `/api/ui/learners/${learnerId}/learning-plans/activate`
    ) {
      activationBodies.push(request.postDataJSON())
      if (failNextActivation) {
        failNextActivation = false
        await route.fulfill({ status: 409, body: 'atomic activation rejected' })
        return
      }
      const mathPlan = planDetail({
        landscapeId: mathLandscapeId,
        goalId: mathGoalId,
        revision: 4,
        active: true,
      })
      const physicsPlan = planDetail({
        landscapeId: physicsLandscapeId,
        goalId: physicsGoalId,
        revision: 1,
        active: false,
      })
      serverPlans.set(mathLandscapeId, mathPlan)
      serverPlans.set(physicsLandscapeId, physicsPlan)
      const activeGoalId = returnIncoherentActivation
        ? 'goal-not-contained-in-selected-plan'
        : mathGoalId
      returnIncoherentActivation = false
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          asOf: berlinDateKey(),
          followLearningPlans: true,
          plans: [mathPlan, physicsPlan],
          selectedPlanId: mathPlan.planId,
          selectedLandscapeId: mathLandscapeId,
          focusGoalId: mathGoalId,
          activeGoalId,
          state: {},
        }),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/trainerLearningPlanActivationUi.html`)
  try {
    await page.getByRole('heading', { name: 'Fachpläne gemeinsam wirksam machen', exact: true }).waitFor()
  } catch (waitError) {
    const body = (await page.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(`${waitError instanceof Error ? waitError.message : String(waitError)}; body=${body.slice(0, 2_000)}; errors=${JSON.stringify(browserErrors)}`)
  }
  try {
    await page.getByText('Im Cockpit · aktuell', { exact: true }).waitFor()
  } catch (waitError) {
    const body = (await page.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(`${waitError instanceof Error ? waitError.message : String(waitError)}; body=${body.slice(0, 3_000)}; errors=${JSON.stringify(browserErrors)}`)
  }
  assert(
    await page.getByText('Im Cockpit · aktuell', { exact: true }).count() === 1,
    'the matching Mathematics copy is persistently recognized as current',
  )
  assert(
    await page.getByText('Bereit', { exact: true }).count() === 1,
    'the unpublished Physics copy is clearly shown as ready',
  )

  const activateButton = page.getByRole('button', {
    name: 'Planung mit 2 Fachplänen wirksam machen',
    exact: true,
  })
  await activateButton.click()
  const confirmation = page.getByTestId('trainer-learning-plan-activation-confirmation')
  await confirmation.waitFor()
  assert(await confirmation.count() === 1, 'one shared confirmation is rendered')
  assert(await confirmation.getByText('Mathematik', { exact: true }).count() === 1, 'confirmation includes Mathematics')
  assert(await confirmation.getByText('Physik', { exact: true }).count() === 1, 'confirmation includes Physics')

  await page.getByRole('button', { name: 'Entwurf ändern', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Ein Fachplan hat sich während der Bestätigung geändert.' }).waitFor()
  assert(await confirmation.count() === 0, 'an unsaved draft invalidates the complete confirmation')
  assert(activationBodies.length === 0, 'confirmation invalidation does not send an activation request')
  await page.getByRole('button', { name: 'Entwurf speichern', exact: true }).click()

  await activateButton.click()
  await confirmation.waitFor()
  const confirmButton = confirmation.getByRole('button', { name: 'Jetzt wirksam machen', exact: true })
  await confirmButton.evaluate((button) => {
    ;(button as HTMLButtonElement).click()
    ;(button as HTMLButtonElement).click()
  })

  await page.getByText('2 Fachpläne sind gemeinsam wirksam. Das erste fällige Lernziel ist ausgewählt.', { exact: true }).waitFor()
  assert(activationBodies.length === 1, `the synchronous guard turns a double click into exactly one activation request; got ${activationBodies.length}`)
  const activationBody = activationBodies[0] as {
    asOf?: string
    plans?: Array<{ landscapeId: string; expectedRevision: number; planLabel: string; blocks: unknown[] }>
  }
  assert(activationBody.asOf === berlinDateKey(), 'activation is bound to the current Europe/Berlin day')
  assert(activationBody.plans?.length === 2, 'both subject plans are sent in the same request')
  assert(
    JSON.stringify(activationBody.plans?.map(({ landscapeId, expectedRevision }) => ({ landscapeId, expectedRevision })))
      === JSON.stringify([
        { landscapeId: mathLandscapeId, expectedRevision: 3 },
        { landscapeId: physicsLandscapeId, expectedRevision: 0 },
      ]),
    `activation preserves both server revisions; got ${JSON.stringify(activationBody.plans)}`,
  )
  assert(
    await page.getByText('Im Cockpit · aktuell', { exact: true }).count() === 2,
    'the successful atomic response marks both subject copies current',
  )

  await page.reload()
  await page.getByRole('heading', { name: 'Fachpläne gemeinsam wirksam machen', exact: true }).waitFor()
  await page.getByText('Im Cockpit · aktuell', { exact: true }).first().waitFor()
  assert(
    await page.getByText('Im Cockpit · aktuell', { exact: true }).count() === 2,
    'current status is reconstructed from server details after reload',
  )

  await page.getByRole('button', { name: 'Lokalen Physikplan löschen', exact: true }).click()
  await page.getByText('Im Cockpit · kein lokaler Entwurf', { exact: true }).waitFor()
  assert(
    await page.getByText('Im Cockpit · aktuell', { exact: true }).count() === 1,
    'the remaining local Mathematics plan stays current',
  )
  assert(
    await page.getByText('Im Cockpit · kein lokaler Entwurf', { exact: true }).count() === 1,
    'a valid server-only Physics plan remains visible in the shared package',
  )

  failNextActivation = true
  await page.getByRole('button', {
    name: 'Planung mit 2 Fachplänen wirksam machen',
    exact: true,
  }).click()
  await page.getByTestId('trainer-learning-plan-activation-confirmation')
    .getByRole('button', { name: 'Jetzt wirksam machen', exact: true })
    .click()
  await page.getByRole('alert').filter({ hasText: 'Die gemeinsame Aktivierung wurde atomar abgelehnt.' }).waitFor()
  assert(activationBodies.length === 2, 'a retry still sends one atomic request')
  const serverOnlyRetry = activationBodies[1] as {
    plans?: Array<{ landscapeId: string; expectedRevision: number; blocks: unknown[] }>
  }
  assert(
    JSON.stringify(serverOnlyRetry.plans?.map(({ landscapeId, expectedRevision }) => ({ landscapeId, expectedRevision })))
      === JSON.stringify([
        { landscapeId: mathLandscapeId, expectedRevision: 4 },
        { landscapeId: physicsLandscapeId, expectedRevision: 1 },
      ]),
    `the server-only Physics plan is not hidden or undercounted; got ${JSON.stringify(serverOnlyRetry.plans)}`,
  )
  const replayedPhysicsPlan = serverOnlyRetry.plans?.find(
    ({ landscapeId }) => landscapeId === physicsLandscapeId,
  )
  const storedPhysicsPlan = serverPlans.get(physicsLandscapeId)
  assert(
    replayedPhysicsPlan?.blocks
      && storedPhysicsPlan
      && JSON.stringify(replayedPhysicsPlan.blocks) === JSON.stringify(storedPhysicsPlan.blocks),
    'the server-only Physics blocks are replayed unchanged for server-side fingerprint validation',
  )
  assert(
    await page.getByText('Im Cockpit · aktuell', { exact: true }).count() === 1
      && await page.getByText('Im Cockpit · kein lokaler Entwurf', { exact: true }).count() === 1,
    'a rejected batch does not claim or render a partial status change',
  )

  const physicsPlan = serverPlans.get(physicsLandscapeId)
  assert(physicsPlan, 'the successful activation created the Physics cockpit plan')
  serverPlans.set(physicsLandscapeId, { ...physicsPlan, stale: true })
  await page.getByRole('button', { name: 'Erneut prüfen', exact: true }).click()
  await page.getByText('Aktualisierung nötig', { exact: true }).waitFor()
  assert(
    await page.getByRole('button', { name: 'Planung mit 2 Fachplänen wirksam machen', exact: true }).isEnabled(),
    'a replayable stale server-only plan stays visible and is included for atomic server revalidation',
  )

  returnIncoherentActivation = true
  await page.getByRole('button', {
    name: 'Planung mit 2 Fachplänen wirksam machen',
    exact: true,
  }).click()
  await page.getByTestId('trainer-learning-plan-activation-confirmation')
    .getByRole('button', { name: 'Jetzt wirksam machen', exact: true })
    .click()
  await page.getByRole('alert').filter({ hasText: 'konnte nicht sicher bestätigt werden' }).waitFor()
  assert(
    await page.getByText('Aktualisierung nötig', { exact: true }).count() === 1,
    'an incoherent success response does not produce a partial or verified-success status',
  )

  failPhysicsRead = true
  await page.getByRole('button', { name: 'Erneut prüfen', exact: true }).click()
  await page.getByText('Prüfung nicht möglich', { exact: true }).waitFor()
  assert(
    await page.getByRole('button', { name: /Planung mit \d+ Fachplänen wirksam machen/u }).isDisabled(),
    'an unverifiable server-only plan blocks activation instead of becoming hidden active state',
  )

  await page.getByRole('button', { name: 'Fachplan bearbeiten: Physik', exact: true }).click()
  assert(
    await page.getByTestId('selected-subject').textContent() === physicsLandscapeId,
    'each subject row provides a direct edit switch',
  )

  console.log('Trainer multi-subject learning-plan activation UI regression passed.')
} finally {
  await browser?.close()
  await server.close()
}
