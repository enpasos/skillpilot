import assert from 'node:assert/strict'
import { mkdir, readFile, realpath, rename, stat, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser } from 'playwright'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import { startViteTestServer } from './viteTestServer'

// This runner cannot target a production host or an existing learner. Its parent
// SpringBootTest owns both the random loopback server and the synthetic learner.
assert.equal(process.env.SKILLPILOT_COMPLETION_BACKEND_BROWSER, 'true')
const backend = new URL(process.env.SKILLPILOT_COMPLETION_BROWSER_URL ?? '')
assert.equal(backend.protocol, 'http:')
assert.equal(backend.hostname, '127.0.0.1')
assert.ok(Number(backend.port) > 0)
assert.equal(backend.pathname, '/')
assert.equal(backend.username + backend.password + backend.search + backend.hash, '')
const learner = process.env.SKILLPILOT_COMPLETION_BROWSER_LEARNER ?? ''
assert.match(learner, /^completion-browser-[a-f0-9-]{36}$/u)
const profileId = 'math-dot-product-projection'
const rootId = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const examId = 'e98672c6-871a-5d0b-889c-5afc51040f0d'
const learnerPath = `/api/ui/learners/${learner}`
const state = async () => {
  const response = await fetch(new URL(`${learnerPath}/state`, backend), { redirect: 'error' })
  assert.equal(response.status, 200)
  const snapshot = await response.json()
  assert.ok(Buffer.byteLength(JSON.stringify(snapshot.levelCompletion), 'utf8') <= 8192,
    'every exercised pilot state must keep the additional standard projection within 8 KiB')
  return snapshot
}
const initial = await state()
assert.equal(initial.levelCompletion.calculationStatus, 'unresolved')
const option = initial.levelCompletion.profileOptions.find((entry: { profileId: string }) => entry.profileId === profileId)
assert.ok(option, 'The real enabled canonical pilot must be available')
const title: string = option.title.de
const appRoot = fileURLToPath(new URL('../', import.meta.url))
const output = fileURLToPath(new URL('../../tmp/level-completion-backend-browser/', import.meta.url))
const resultMode = process.env.SKILLPILOT_COMPLETION_BROWSER_RESULT === 'true'
const ipc = process.env.SKILLPILOT_COMPLETION_BROWSER_IPC
if (resultMode) {
  assert.ok(ipc)
  assert.equal(await realpath(ipc), resolve(ipc))
  assert.ok(resolve(ipc).startsWith(fileURLToPath(new URL('../../tmp/completion-result-ipc-', import.meta.url))))
  assert.equal((await stat(ipc)).mode & 0o777, 0o700, 'session transfer uses a private disposable directory')
}
await mkdir(output, { recursive: true })
// Ignore a developer's app/.env API origin. Every UI request must hit this
// runner's Vite origin and pass the guarded loopback forwarding boundary.
process.env.VITE_API_BASE = ''
const server = await startViteTestServer(appRoot, 'scripts/fixtures/levelCompletionBackendUi.html', { plugins: [tailwindcss()] })
let browser: Browser | null = null
let shuttingDown = false
const requests: { method: string; path: string; status: number; revision?: number }[] = []
const errors: string[] = []
const releaseTransportGates: (() => void)[] = []
try {
  browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'] })
  const open = async (mobile: boolean) => {
    const context = await browser!.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, locale: 'de-DE' })
    await context.addInitScript(({ learner, rootId, termsVersion }) => {
      localStorage.setItem('skillpilot_lang', 'de')
      localStorage.setItem('skillpilot_theme', 'light')
      localStorage.setItem('skillpilot_id', learner)
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_learner_landscape', rootId)
      localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
      // The real launch HTTP call is tested. Opening an external Claude host is
      // deliberately out of scope and would not constitute host acceptance.
      window.open = (() => ({ opener: null, location: { href: '' }, close() {} })) as unknown as typeof window.open
    }, { learner, rootId, termsVersion: CURRENT_TERMS_VERSION })
    const page = await context.newPage()
    let abortState = false
    let stateGate: Promise<void> | null = null
    let releaseState: (() => void) | undefined
    let stateHeld: (() => void) | undefined
    page.setDefaultTimeout(30_000)
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (url.origin !== server.baseUrl) {
        errors.push(`Unexpected external request: ${url.origin}${url.pathname}`)
        return route.abort('blockedbyclient')
      }
      if (!url.pathname.startsWith('/api/')) return route.continue()
      // Reproduce a temporarily disconnected push channel, so tab B retains a
      // genuinely old revision until its HTTP write receives a real 409.
      if (url.pathname === `/api/ui/updates/${learner}`) return route.abort('internetdisconnected')
      const allowed = url.pathname === learnerPath || url.pathname.startsWith(`${learnerPath}/`)
        || ['/api/ui/landscapes', '/api/ui/curriculum-catalog'].includes(url.pathname)
      assert.ok(allowed, `Unexpected API target: ${url.pathname}`)
      if (request.method() === 'GET' && url.pathname === `${learnerPath}/state`) {
        if (abortState) return route.abort('internetdisconnected')
        if (stateGate) { stateHeld?.(); await stateGate }
      }
      // This is a same-origin local reverse proxy. Rewrite the browser Origin
      // along with the target host, as the Vite random port is not a deployed
      // frontend origin. CORS configuration is covered by its own tests.
      const headers = { ...request.headers() }
      if (headers.origin) headers.origin = backend.origin
      try {
        const response = await route.fetch({ url: new URL(url.pathname + url.search, backend).href,
          headers, maxRedirects: 0, timeout: 60_000 })
        requests.push({ method: request.method(), path: url.pathname, status: response.status(),
          revision: request.method() === 'POST' && url.pathname.endsWith('/level-completion/actions')
            ? request.postDataJSON().expectedRevision : undefined })
        // Byte-for-byte backend payload and status: no generated state, mastery,
        // launch response or conflict response is substituted by this test.
        await route.fulfill({ response })
      } catch (error) {
        if (!shuttingDown && !page.isClosed()) throw error
      }
    })
    await page.goto(`${server.baseUrl}/scripts/fixtures/levelCompletionBackendUi.html?learner=${learner}`)
    const discovery = page.getByTestId('completion-shortcut-discovery')
    await discovery.locator('summary').click()
    await discovery.getByRole('button', { name: `Abschnitt als Lernweg wählen: ${title}`, exact: true }).waitFor()
    return { page, context, failState: (failed: boolean) => { abortState = failed }, holdState: () => {
      const held = new Promise<void>((resolveHeld) => { stateHeld = resolveHeld })
      stateGate = new Promise<void>((release) => { releaseState = release })
      const release = () => { stateGate = null; releaseState?.() }
      releaseTransportGates.push(release)
      return { held, release }
    } }
  }
  const mobile = await open(true)
  const parallel = await open(false)
  const card = mobile.page.getByTestId('level-completion-card')
  assert.equal(requests.filter((r) => r.path.endsWith('/level-completion/actions')).length, 0)
  await card.getByText('2 Lernziele, davon 1 erforderliche Prüfung.', { exact: true }).waitFor()
  const profileChoice = card.getByRole('button', { name: `Abschnitt als Lernweg wählen: ${title}`, exact: true })
  await profileChoice.focus()
  assert.equal(await profileChoice.evaluate((element) => element === document.activeElement), true)
  const selectedResponse = mobile.page.waitForResponse((response) => response.url().endsWith('/level-completion/actions'))
  await mobile.page.keyboard.press('Enter')
  assert.equal((await selectedResponse).status(), 200)
  await card.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).waitFor()
  const selected = await state()
  assert.equal(selected.levelCompletion.profileId, profileId)
  assert.equal(selected.levelCompletion.targetCount, 2)
  assert.equal(selected.levelCompletion.pendingTargetCount, 2)
  assert.equal(selected.levelCompletion.directAssessmentRunning, false)
  assert.ok(selected.levelCompletion.learnerRevision > initial.levelCompletion.learnerRevision)
  assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
  await mobile.page.screenshot({ path: `${output}/mobile-selected.png`, fullPage: true })
  const titleOverlapsStart = await card.getByRole('list', { name: 'Erforderliche Prüfungen' }).locator('li').evaluateAll((items) => items.some((item) => {
    const title = item.querySelector('div > span')
    const start = item.querySelector('a')
    if (!title || !start) return false
    const button = start.getBoundingClientRect()
    return [...title.getClientRects()].some((text) => text.left < button.right - 1 && text.right > button.left + 1
      && text.top < button.bottom - 1 && text.bottom > button.top + 1)
  }))
  assert.equal(titleOverlapsStart, false, 'The actual long assessment title must not overlap its start button on mobile')

  const conflict = parallel.page.waitForResponse((response) => response.url().endsWith('/level-completion/actions'))
  await parallel.page.getByTestId('level-completion-card').getByRole('button', { name: `Abschnitt als Lernweg wählen: ${title}`, exact: true }).click()
  assert.equal((await conflict).status(), 409, 'The second tab sends its actual old revision to the backend')
  await parallel.page.getByRole('alert').filter({ hasText: 'Deine Auswahl konnte nicht bestätigt werden' }).waitFor()
  await parallel.page.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).waitFor()
  const afterConflict = await state()
  assert.deepEqual(afterConflict.levelCompletion, selected.levelCompletion, 'Conflict must preserve the latest backend completion state')
  assert.equal(requests.filter((r) => r.path.endsWith('/level-completion/actions') && r.status === 409).length, 1)
  await parallel.page.unrouteAll({ behavior: 'wait' })
  await parallel.context.close()

  await card.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).click()
  const providers = mobile.page.getByTestId('coach-provider-choice')
  await providers.waitFor()
  assert.equal(await providers.getByRole('radio', { name: /Claude/u }).isChecked(), true)
  assert.equal(await providers.getByRole('radio', { name: /ChatGPT Desktop/u }).isDisabled(), true)
  assert.equal(await providers.getByRole('radio', { name: /Gemini/u }).isDisabled(), true)
  assert.equal(requests.filter((r) => r.path.endsWith('/launch')).length, 0)
  assert.equal((await state()).levelCompletion.directAssessmentRunning, false, 'Provider selection alone does not bind the exam')
  const launched = mobile.page.waitForResponse((response) => response.url().endsWith('/claude/v1/launch'))
  await mobile.page.getByTestId('claude-plugin-start').focus()
  await mobile.page.keyboard.press('Enter')
  const launchResponse = await launched
  assert.equal(launchResponse.status(), 200)
  // Read while the original document still owns the network response. A later
  // full reload may legitimately discard Chromium's response body handle.
  const launch = await launchResponse.json()
  const running = await state()
  assert.equal(running.activeGoal.id, examId)
  assert.equal(running.levelCompletion.directAssessmentRunning, true)
  assert.equal(running.levelCompletion.complete, false)
  assert.ok(running.levelCompletion.learnerRevision > selected.levelCompletion.learnerRevision)
  assert.equal(requests.filter((r) => r.path.endsWith('/launch')).length, 1)

  // A full document reload reconstructs the real Cockpit from persisted state.
  await mobile.page.reload()
  const reloadedCard = mobile.page.getByTestId('level-completion-card')
  await reloadedCard.getByText('Eine Prüfung läuft in deinem Lerncoach.', { exact: true }).waitFor()
  assert.equal((await state()).levelCompletion.learnerRevision, running.levelCompletion.learnerRevision)
  assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
  const leaveTitle: string = running.levelCompletion.actions.find((action: { action: string }) => action.action === 'leaveProfile').title.de
  await reloadedCard.getByRole('button', { name: leaveTitle, exact: true }).focus()
  await mobile.page.keyboard.press('Enter')
  const confirmation = reloadedCard.getByRole('group', { name: 'Laufende Prüfung beenden' })
  await confirmation.waitFor()
  await confirmation.getByRole('button', { name: 'Prüfung fortsetzen' }).focus()
  await mobile.page.keyboard.press('Enter')
  assert.equal((await state()).levelCompletion.directAssessmentRunning, true)
  assert.equal(await reloadedCard.getByRole('button', { name: leaveTitle, exact: true })
    .evaluate((element) => element === document.activeElement), true, 'Cancel restores keyboard focus')
  await mobile.page.screenshot({ path: `${output}/mobile-running-after-reload.png`, fullPage: true })
  if (resultMode) {
    const slow = mobile.holdState()
    await mobile.page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await slow.held
    assert.equal(await reloadedCard.getByText('0 von 2 Lernzielen geschafft.', { exact: true }).isVisible(), true,
      'delayed real requests keep the last authoritative snapshot visible')
    await mobile.page.waitForTimeout(1000) // A real slow transport, also beyond the UI event coalescing window.
    const released = mobile.page.waitForResponse((response) => new URL(response.url()).pathname === `${learnerPath}/state`)
    const slowRefreshCompleted = mobile.page.waitForEvent('console', { predicate: (message) => message.text() === '[SSE] ✅ Refresh complete' })
    slow.release()
    assert.equal((await released).status(), 200)
    // The application also maintains a reconnecting EventSource and a Vite
    // websocket. Wait for this real refresh cycle, not global network silence.
    await slowRefreshCompleted
    mobile.failState(true)
    const failedRefreshCompleted = mobile.page.waitForEvent('console', { predicate: (message) => message.text() === '[SSE] ✅ Refresh complete' })
    await mobile.page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await reloadedCard.getByText('Diese Ansicht ist veraltet.', { exact: false }).waitFor()
    await failedRefreshCompleted
    assert.equal(await reloadedCard.getByText('0 von 2 Lernzielen geschafft.', { exact: true }).isVisible(), true)
    assert.equal(await reloadedCard.getByRole('button', { name: leaveTitle, exact: true }).isDisabled(), true,
      'a failed transport cannot leave stale mutations enabled')
    assert.equal((await state()).levelCompletion.learnerRevision, running.levelCompletion.learnerRevision)
    mobile.failState(false)
    const recovered = mobile.page.waitForResponse((response) => new URL(response.url()).pathname === `${learnerPath}/state`)
    await reloadedCard.getByRole('button', { name: 'Neu laden', exact: true }).click()
    assert.equal((await recovered).status(), 200)
    await reloadedCard.getByText('Diese Ansicht ist veraltet.', { exact: false }).waitFor({ state: 'hidden' })
    await reloadedCard.getByRole('button', { name: leaveTitle, exact: true }).waitFor({ state: 'visible' })
    assert.equal(await reloadedCard.getByText('Diese Ansicht ist veraltet.', { exact: false }).count(), 0)

    assert.match(launch.learningSessionId, /^spc_[A-Za-z0-9_-]{43}$/u)
    await writeFile(`${ipc}/session.tmp`, JSON.stringify({ learningSessionId: launch.learningSessionId }), { mode: 0o600, flag: 'wx' })
    await rename(`${ipc}/session.tmp`, `${ipc}/session.json`)
    // The parent executes the actual receipt/evaluation/Mastery MCP handlers.
    // This process waits only for completion, never manufactures a backend result.
    const deadline = Date.now() + 90_000
    let resultReady = false
    while (Date.now() < deadline) {
      try { resultReady = (await readFile(`${ipc}/result-ready`, 'utf8')) === 'confirmed' }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      if (resultReady) break
      await new Promise((resolveWait) => setTimeout(resolveWait, 25))
    }
    assert.equal(resultReady, true, 'the parent must confirm the actual MCP write')
    await mobile.page.waitForTimeout(1000) // A learner returns to the tab after the completed conversation.
    await mobile.page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    const completed = reloadedCard.getByRole('status').filter({ hasText: 'Lernabschnitt abgeschlossen.' })
    await completed.waitFor()
    assert.equal(await completed.getAttribute('role'), 'status', 'the confirmed result has a screenreader status region')
    assert.equal(await reloadedCard.getByText('1 von 2 Lernzielen geschafft.', { exact: true }).isVisible(), true)
    await reloadedCard.getByText('Warum entfällt diese Vorbereitung?', { exact: true }).click()
    assert.equal(await reloadedCard.getByText('Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen', { exact: true }).isVisible(), true)
    assert.equal(await reloadedCard.getByText('Geschaffte Prüfungen:', { exact: false }).isVisible(), true)
    await mobile.page.screenshot({ path: `${output}/mobile-completed.png`, fullPage: true })
    const beforePause = await state()
    const paused = mobile.page.waitForResponse((response) => response.url().endsWith('/level-completion/actions'))
    await reloadedCard.getByRole('button', { name: 'Für heute beenden', exact: true }).focus()
    await mobile.page.keyboard.press('Enter')
    assert.equal((await paused).status(), 200)
    await reloadedCard.getByText('Dieser Lernweg ist pausiert.', { exact: false }).waitFor()
    await mobile.page.reload()
    await mobile.page.getByTestId('level-completion-card').getByText('Dieser Lernweg ist pausiert.', { exact: false }).waitFor()
    const afterPause = await state()
    assert.equal(afterPause.levelCompletion.profileId, profileId)
    assert.equal(afterPause.levelCompletion.navigationIntent, 'paused')
    assert.equal(afterPause.levelCompletion.complete, true)
    assert.equal(afterPause.levelCompletion.masteredTargetCount, 1)
    assert.equal(afterPause.levelCompletion.learnerRevision, beforePause.levelCompletion.learnerRevision + 1)
    assert.equal(afterPause.activeGoal, null)
  }
  assert.deepEqual(errors, [])
  assert.equal(requests.filter((r) => r.status >= 500).length, 0)
  await writeFile(`${output}/${resultMode ? 'evidence-result' : 'evidence'}.json`, JSON.stringify({
    transport: 'real-loopback-http', viewport: { width: 390, height: 844 },
    checks: ['keyboard-profile-choice', 'mobile-card', 'stale-parallel-choice-409', 'provider-session-start',
      'cockpit-reload-preserves-assessment', 'keyboard-exit-cancel-preserves-assessment'],
    resultChecks: resultMode ? ['real-delayed-state-read', 'real-aborted-state-read', 'reload-recovers-authoritative-state',
      'actual-mcp-write-completes-section', 'accessible-confirmed-status', 'scoped-waiver-explanation',
      'keyboard-pause-retains-profile-and-completion-after-reload'] : [],
    initialRevision: initial.levelCompletion.learnerRevision,
    selectedRevision: selected.levelCompletion.learnerRevision,
    runningRevision: running.levelCompletion.learnerRevision,
    requests: requests.map((r) => ({ ...r, path: r.path.replace(learner, '<synthetic-learner>') })),
    // No session token, private workflow or personal learner data is exported.
    hostAcceptance: false,
  }, null, 2))
  console.log('PASS: real backend HTTP, mobile/keyboard, stale 409, provider start and persisted Cockpit reload')
  await mobile.page.unrouteAll({ behavior: 'wait' })
  await mobile.context.close()
} catch (error) {
  console.error('Primary browser failure:', error)
  console.error('Observed API requests:', JSON.stringify(requests.map((r) => ({ ...r, path: r.path.replace(learner, '<synthetic-learner>') }))))
  console.error('Browser errors:', JSON.stringify(errors))
  for (const [index, page] of (browser?.contexts().flatMap((context) => context.pages()) ?? []).entries()) {
    console.error(`Page ${index}:`, (await page.locator('body').innerText()).replaceAll(learner, '<synthetic-learner>').replace(/spc_[A-Za-z0-9_-]+/gu, '<session-redacted>').slice(0, 5000))
    await page.screenshot({ path: `${output}/failure-${index}.png`, fullPage: true })
  }
  throw error
} finally {
  shuttingDown = true
  releaseTransportGates.forEach((release) => release())
  for (const context of browser?.contexts() ?? []) {
    for (const page of context.pages()) await page.unrouteAll({ behavior: 'wait' })
    await context.unrouteAll({ behavior: 'wait' })
  }
  await browser?.close()
  await server.close()
}
