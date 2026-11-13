import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser } from 'playwright'
import { startViteTestServer } from './viteTestServer'

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(appRoot, 'scripts/fixtures/goalBookFeedbackUi.html', { plugins: [tailwindcss()] })
const goalId = '11111111-1111-4111-8111-111111111111'
const goalFingerprint = `sha256:${'a'.repeat(64)}`
const pageFingerprint = `sha256:${'b'.repeat(64)}`
const bookDigest = `sha256:${'c'.repeat(64)}`
const manifestFingerprint = `sha256:${'d'.repeat(64)}`
const visualizationUrl = `/api/public/goal-feedback/v1/visualizations/${'e'.repeat(64)}`
const visualizationTitle = 'Visualisierung: Rationale Zahlen darstellen und ordnen'
const visualizationAlt = 'Rationale Zahlen sind auf einer Zahlengeraden eingeordnet.'
const binding = new URLSearchParams({
  bookId: 'de-gym-mathematik-bundesweit',
  goalId,
  edition: 'curricular-atomic-v1',
  goalFingerprint,
  pageFingerprint,
  bookDigest,
  page: '42',
})

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--no-sandbox'],
  })
  const context = await browser.newContext({ locale: 'de-DE', viewport: { width: 390, height: 844 } })
  await context.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_theme', 'light')
  })
  const page = await context.newPage()
  page.setDefaultTimeout(10_000)
  page.setDefaultNavigationTimeout(60_000)
  const errors: string[] = []
  const submissions: unknown[] = []
  const contextUrls: URL[] = []
  let failedSubmissionsRemaining = 2
  let contextUnavailable = false
  let heldSubmission: {
    arrived: () => void
    response: Promise<'success' | 'error'>
  } | null = null
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/api/public/goal-feedback/v1/context?*', async (route) => {
    const url = new URL(route.request().url())
    contextUrls.push(url)
    if (contextUnavailable) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: 'not-json' })
      return
    }
    if ([...binding.entries()].some(([key, value]) => url.searchParams.get(key) !== value)) {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        schemaVersion: 1,
        context: {
          goalId,
          goalFingerprint,
          pageFingerprint,
          bookId: 'de-gym-mathematik-bundesweit',
          bookEdition: 'curricular-atomic-v1',
          bookDigest,
          locale: 'de-DE',
          scopeLabel: 'Lernzielbuch Mathematik – Gymnasium bundesweit',
          pageNumber: 42,
          canonicalUrl: `https://skillpilot.com/lernzielbuch#goal-${goalId}`,
          publicationManifestFingerprint: manifestFingerprint,
        },
        goal: {
          title: 'Rationale Zahlen darstellen und ordnen',
          description: 'Die lernende Person kann rationale Zahlen auf der Zahlengeraden darstellen und ordnen.',
          breadcrumbs: ['Mathematik', 'Zahlen und Operationen'],
          visualization: {
            title: visualizationTitle,
            url: visualizationUrl,
            altText: visualizationAlt,
          },
        },
        submissionEndpoint: '/api/public/goal-feedback/v1/submissions',
      }),
    })
  })
  await page.route(`**${visualizationUrl}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        'base64',
      ),
    })
  })
  await page.route('**/api/public/goal-feedback/v1/submissions', async (route) => {
    assert(route.request().headers().cookie === undefined, 'public feedback omits cookies')
    assert(route.request().headers().referer === undefined, 'public feedback omits the source page referrer')
    submissions.push(route.request().postDataJSON())
    const held = heldSubmission
    if (held) {
      heldSubmission = null
      held.arrived()
      const outcome = await held.response
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: outcome === 'success'
          ? JSON.stringify({ feedbackId: '44444444-4444-4444-8444-444444444444', receivedAt: '2026-11-13T16:00:00Z' })
          : '{"unexpected":"receipt"}',
      })
      return
    }
    if (failedSubmissionsRemaining > 0) {
      failedSubmissionsRemaining -= 1
      await route.fulfill({ status: 202, contentType: 'application/json', body: '{"unexpected":"receipt"}' })
      return
    }
    await route.fulfill({
      status: 202,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        feedbackId: '33333333-3333-4333-8333-333333333333',
        receivedAt: '2026-08-30T10:00:00Z',
      }),
    })
  })

  const fixtureUrl = `${server.baseUrl}/scripts/fixtures/goalBookFeedbackUi.html`
  await page.goto(`${fixtureUrl}?${binding.toString()}`)
  await page.getByRole('heading', { name: 'Feedback geben' }).waitFor()
  await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).waitFor()
  await page.getByText('Lernziel und Bild ansehen', { exact: true }).click()
  const visualization = page.getByRole('img', { name: visualizationAlt })
  await visualization.waitFor()
  assert(
    await visualization.evaluate((image) => (image as HTMLImageElement).complete
      && (image as HTMLImageElement).naturalWidth > 0),
    'the exact bound learning-goal image loads successfully',
  )
  assert(await visualization.getAttribute('src') === visualizationUrl, 'the image uses the server-verified asset path')
  assert(await page.locator('form').count() === 1, 'an exact verified binding exposes one form')
  assert(await page.getByText(goalId, { exact: true }).count() === 1, 'the exact public goal ID is visible')
  assert(
    await page.getByRole('link', { name: 'Zurück zum Lernzielbuch' }).getAttribute('href')
      === `/lernzielbuch#goal-${goalId}`,
    'a direct learning-goal-book feedback link returns to its exact book goal',
  )
  assert(submissions.length === 0, 'loading the form does not submit feedback')
  assert(await page.locator('textarea').count() === 1, 'one large text field replaces categories and extra fields')
  assert(await page.locator('select').count() === 0, 'feedback requires no category or perspective selection')
  const fieldBox = await page.locator('textarea').boundingBox()
  assert(fieldBox && fieldBox.height >= 200, 'the free-text field has generous writing space')

  await page.evaluate((goalFeedbackOrigin) => {
    const current = window.history.state && typeof window.history.state === 'object'
      ? window.history.state
      : {}
    window.history.replaceState({ ...current, usr: { goalFeedbackOrigin } }, '', window.location.href)
  }, 'learner-cockpit')
  await page.reload()
  await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).waitFor()
  assert(
    await page.getByRole('link', { name: 'Zurück zum Cockpit' }).getAttribute('href')
      === `/learner/${goalId}`,
    'Cockpit-origin feedback returns to the exact learner goal without replacing the personal curriculum after reload',
  )
  assert(
    contextUrls.length === 2
      && contextUrls.every((url) => (
        [...url.searchParams.keys()].sort().join(',')
          === 'bookDigest,bookId,edition,goalFingerprint,goalId,page,pageFingerprint'
      )),
    'Cockpit origin remains local router state and never changes the seven-field server context lookup',
  )
  const privacyDetails = page.locator('#feedback-datenschutz')
  assert(await privacyDetails.count() === 1, 'a valid form contains privacy details')
  assert(!await privacyDetails.evaluate((details) => (details as HTMLDetailsElement).open), 'privacy details start closed')
  const renderedText = await page.locator('body').textContent() ?? ''
  assert(
    !/Codex|OpenAI|PostgreSQL|\bWAL\b|Produktionseingang|production inbox|Entwicklungsablage|development inbox|Rohdatei|raw-data|digestgebunden|Sitzungs- und Tool-Protokolle|session and tool logs/iu.test(renderedText),
    'the public UI does not expose vendors or internal processing architecture',
  )
  await page.getByText('Datenschutzdetails anzeigen', { exact: true }).click()
  await page.getByRole('heading', { name: 'Datenschutz für Feedback' }).waitFor()
  await page.getByText(/Hinweisversion: 2026-11-13\.1/u).waitFor()
  await page.getByText(/spätestens nach 31 Tagen gelöscht/u).waitFor()
  assert(
    await page.getByRole('link', { name: 'Allgemeine Datenschutzerklärung' }).getAttribute('href') === '/privacy',
    'the feedback-specific details link to the general privacy policy',
  )
  await page.getByLabel(/willige in die Verarbeitung meiner Angaben/u).check()
  await page.getByLabel(/Prüfung technisch unterstützt/u).check()

  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await page.getByText('Show privacy details', { exact: true }).waitFor()
  await page.getByRole('heading', { name: 'Privacy for feedback' }).waitFor()
  assert(
    await page.getByRole('link', { name: 'Back to the cockpit' }).count() === 1,
    'the Cockpit return action is localized without changing its target',
  )
  await page.getByText(/Notice version: 2026-11-13\.1/u).waitFor()
  assert(
    !/Codex|OpenAI|PostgreSQL|\bWAL\b|production inbox|development inbox|raw-data|digest-bound|session and tool logs/iu.test(await page.locator('body').textContent() ?? ''),
    'the English public UI does not expose vendors or internal processing architecture',
  )
  assert(
    await page.locator('input[type="checkbox"]:checked').count() === 0,
    'changing the notice language clears both acknowledgements',
  )
  await page.getByRole('button', { name: 'DE', exact: true }).click()
  assert(
    await page.locator('input[type="checkbox"]:checked').count() === 0,
    'switching back does not restore acknowledgements for another displayed notice',
  )

  await page.getByLabel('Was ist dir konkret aufgefallen?').fill('Die angegebene Quellenzuordnung ist zu breit.')
  await page.getByLabel(/willige in die Verarbeitung meiner Angaben/u).check()
  await page.getByLabel(/Prüfung technisch unterstützt/u).check()
  await page.getByRole('button', { name: 'Feedback absenden' }).click()
  await page.getByRole('alert').filter({ hasText: 'konnte nicht gespeichert werden' }).waitFor()
  assert(submissions.length === 1, 'a server error does not trigger an automatic retry')
  assert(await page.getByLabel('Was ist dir konkret aufgefallen?').inputValue() === 'Die angegebene Quellenzuordnung ist zu breit.', 'a failed submission remains editable')

  await page.getByRole('button', { name: 'Feedback absenden' }).click()
  await page.getByRole('alert').filter({ hasText: 'konnte nicht gespeichert werden' }).waitFor()
  assert(submissions.length === 2, 'one unchanged explicit retry sends one additional request')
  const firstSubmission = submissions[0] as Record<string, unknown>
  const unchangedRetry = submissions[1] as Record<string, unknown>
  assert(unchangedRetry.clientSubmissionId === firstSubmission.clientSubmissionId, 'an unchanged ambiguous retry reuses its idempotency key')

  await page.getByLabel('Was ist dir konkret aufgefallen?').fill('Die angegebene Quellenzuordnung ist zu breit. Bitte eine engere Fundstelle verwenden.')
  await page.getByRole('button', { name: 'Feedback absenden' }).click()
  await page.getByRole('heading', { name: 'Feedback wurde gespeichert' }).waitFor()
  assert(
    await page.getByRole('link', { name: 'Zurück zum Cockpit' }).getAttribute('href')
      === `/learner/${goalId}`,
    'the submitted receipt keeps the Cockpit return action visible',
  )
  assert(submissions.length === 3, 'one edited explicit submission sends one additional request')
  const submission = submissions[2] as Record<string, unknown>
  const envelope = submission.envelope as Record<string, unknown>
  const feedback = envelope.feedback as Record<string, unknown>
  assert(
    envelope.schemaVersion === 2
      && envelope.privacyNoticeVersion === '2026-11-13.1'
      && envelope.privacyNoticeLocale === 'de'
      && envelope.privacyAcknowledged === true
      && envelope.automatedProcessingAcknowledged === true
      && feedback.category === 'other'
      && feedback.observation === 'Die angegebene Quellenzuordnung ist zu breit. Bitte eine engere Fundstelle verwenden.'
      && typeof submission.clientSubmissionId === 'string'
      && submission.clientSubmissionId !== firstSubmission.clientSubmissionId
      && submission.website === '',
    `unexpected feedback envelope: ${JSON.stringify(submission)}`,
  )
  assert(
    !JSON.stringify(submission).match(/skillpilotId|learnerId|sessionId|chatSession|goalFeedbackOrigin|returnUrl/iu),
    'no learner, session, origin, or return-navigation state is transmitted',
  )
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  assert(dimensions.scroll <= dimensions.client, `390px feedback form overflows: ${JSON.stringify(dimensions)}`)

  await page.getByRole('link', { name: 'Zurück zum Cockpit' }).click()
  await page.waitForURL(`**/learner/${goalId}`)
  const cockpitReturnUrl = new URL(page.url())
  assert(
    cockpitReturnUrl.pathname === `/learner/${goalId}`
      && cockpitReturnUrl.searchParams.size === 0,
    `the return action opened an unexpected Cockpit target: ${cockpitReturnUrl.href}`,
  )

  // A goal-linked entry can switch to general feedback without inventing a goal binding.
  await page.goto(`${fixtureUrl}?${binding.toString()}`)
  await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).waitFor()
  await page.getByLabel(/willige in die Verarbeitung meiner Angaben/u).check()
  await page.getByLabel(/Prüfung technisch unterstützt/u).check()
  await page.getByLabel('Was ist dir konkret aufgefallen?').fill('Dieser Text bleibt beim Themenwechsel erhalten.')
  await page.getByRole('button', { name: 'Allgemein zu SkillPilot', exact: true }).click()
  assert(await page.locator('input[type="checkbox"]:checked').count() === 0, 'switching feedback scope clears both acknowledgements')
  assert(await page.getByLabel('Was ist dir konkret aufgefallen?').inputValue() === 'Dieser Text bleibt beim Themenwechsel erhalten.', 'changing scope preserves the written feedback')
  assert(await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).count() === 0, 'general feedback displays no bound learning goal')
  await page.getByLabel('Was ist dir konkret aufgefallen?').fill('Die Navigation im Cockpit ist schwer zu finden.')
  await page.getByLabel(/willige in die Verarbeitung meiner Angaben/u).check()
  await page.getByLabel(/Prüfung technisch unterstützt/u).check()
  await page.getByRole('button', { name: 'Feedback absenden' }).click()
  await page.getByRole('heading', { name: 'Feedback wurde gespeichert' }).waitFor()
  const generalSubmission = submissions.at(-1) as Record<string, unknown>
  const generalEnvelope = generalSubmission.envelope as Record<string, unknown>
  assert(generalEnvelope.schemaVersion === 3, 'general feedback uses its explicit schema')
  assert(JSON.stringify(generalEnvelope.context) === '{"scope":"general"}', 'general feedback has no goal, book, or learner binding')
  assert(JSON.stringify(generalEnvelope.feedback) === '{"observation":"Die Navigation im Cockpit ist schwer zu finden."}', 'general feedback sends only the free text')
  assert(!/skillpilotId|learnerId|sessionId|chatSession|goalId|bookId|goalFingerprint|pageFingerprint/iu.test(JSON.stringify(generalSubmission)), 'general feedback contains no automatic personal or learning-goal identifiers')

  // General feedback also works directly without a learning goal or a context request.
  const contextsBeforeGeneral = contextUrls.length
  await page.goto(fixtureUrl)
  await page.getByRole('heading', { name: 'Feedback geben', exact: true }).waitFor()
  assert(await page.locator('form').count() === 1, 'direct general feedback does not require a goal')
  assert(contextUrls.length === contextsBeforeGeneral, 'general feedback makes no goal-context lookup')
  assert(await page.locator('textarea').count() === 1 && await page.locator('select').count() === 0, 'general feedback has the same simple form')
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    const layout = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
    assert(layout.scroll <= layout.client, `general feedback overflows at ${width}px`)
  }
  // Client-side route changes reuse the mounted form and select the matching scope.
  await page.evaluate((search) => {
    window.history.pushState({}, '', `/scripts/fixtures/goalBookFeedbackUi.html?${search}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, binding.toString())
  await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).waitFor()
  assert(await page.getByRole('button', { name: 'Zu diesem Lernziel', exact: true }).getAttribute('aria-pressed') === 'true', 'general to goal navigation selects goal feedback')
  await page.getByRole('button', { name: 'Allgemein zu SkillPilot', exact: true }).click()
  await page.evaluate(() => {
    window.history.pushState({}, '', '/scripts/fixtures/goalBookFeedbackUi.html')
    window.dispatchEvent(new PopStateEvent('popstate'))
  })
  await page.locator('form').waitFor()
  assert(await page.getByRole('button', { name: 'Zu diesem Lernziel', exact: true }).count() === 0, 'goal to general navigation clears goal options')
  assert(await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).count() === 0, 'general navigation clears the goal context')

  // An anchor within this form does not supersede its in-flight submission,
  // even when the router gives that history entry a new location key.
  await page.goto(fixtureUrl)
  await page.getByLabel('Was ist dir konkret aufgefallen?').fill('Feedback mit einem Sprung zu den Datenschutzhinweisen.')
  await page.getByLabel(/willige in die Verarbeitung meiner Angaben/u).check()
  await page.getByLabel(/Prüfung technisch unterstützt/u).check()
  let markHashSubmissionArrived!: () => void
  const hashSubmissionArrived = new Promise<void>((resolve) => { markHashSubmissionArrived = resolve })
  let releaseHashSubmission!: (value: 'success') => void
  const hashSubmissionResponse = new Promise<'success'>((resolve) => { releaseHashSubmission = resolve })
  heldSubmission = { arrived: markHashSubmissionArrived, response: hashSubmissionResponse }
  const submissionsBeforeHash = submissions.length
  await page.getByRole('button', { name: 'Feedback absenden' }).click()
  await hashSubmissionArrived
  await page.evaluate(() => {
    window.history.pushState({ key: 'same-form-privacy-anchor' }, '', `${window.location.pathname}#feedback-datenschutz`)
    window.dispatchEvent(new PopStateEvent('popstate'))
    return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
  assert(await page.locator('button[type="submit"]').isDisabled(), 'hash-only navigation keeps the same submission pending')
  releaseHashSubmission('success')
  await page.getByRole('heading', { name: 'Feedback wurde gespeichert' }).waitFor()
  assert(await page.getByText('44444444-4444-4444-8444-444444444444', { exact: true }).count() === 1, 'the same form shows its completed receipt after hash navigation')
  assert(submissions.length === submissionsBeforeHash + 1, 'hash navigation never sends a second submission')

  // A delayed answer belongs to the form that sent it, even when this same
  // mounted view navigates to a different feedback context in the meantime.
  for (const outcome of ['success', 'error'] as const) {
    await page.goto(fixtureUrl)
    await page.getByLabel('Was ist dir konkret aufgefallen?').fill(`Altes allgemeines Feedback: ${outcome}`)
    await page.getByLabel(/willige in die Verarbeitung meiner Angaben/u).check()
    await page.getByLabel(/Prüfung technisch unterstützt/u).check()
    let markArrived!: () => void
    const arrived = new Promise<void>((resolve) => { markArrived = resolve })
    let releaseResponse!: (value: 'success' | 'error') => void
    const response = new Promise<'success' | 'error'>((resolve) => { releaseResponse = resolve })
    heldSubmission = { arrived: markArrived, response }
    await page.getByRole('button', { name: 'Feedback absenden' }).click()
    await arrived
    await page.evaluate(({ search, outcome }) => {
      window.history.pushState({ key: `pending-${outcome}` }, '', `/scripts/fixtures/goalBookFeedbackUi.html?${search}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }, { search: binding.toString(), outcome })
    await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).waitFor()
    const currentText = `Neues Feedback zum Lernziel: ${outcome}`
    await page.getByLabel('Was ist dir konkret aufgefallen?').fill(currentText)
    await page.getByLabel(/willige in die Verarbeitung meiner Angaben/u).check()
    await page.getByLabel(/Prüfung technisch unterstützt/u).check()
    const oldResponse = page.waitForResponse((candidate) => candidate.url().endsWith('/api/public/goal-feedback/v1/submissions'))
    releaseResponse(outcome)
    await (await oldResponse).finished()
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    assert(await page.locator('form').count() === 1, `a stale ${outcome} cannot replace the new form`)
    assert(await page.getByLabel('Was ist dir konkret aufgefallen?').inputValue() === currentText, `a stale ${outcome} preserves the new feedback text`)
    assert(await page.getByRole('heading', { name: 'Feedback wurde gespeichert' }).count() === 0, 'an old general receipt is not shown for the new goal')
    assert(await page.getByRole('alert').count() === 0, 'an old submission error is not shown for the new goal')
    assert(await page.locator('input[type="checkbox"]:checked').count() === 2, 'the new form keeps its own acknowledgements')
    await page.getByRole('button', { name: 'Feedback absenden' }).click()
    await page.getByRole('heading', { name: 'Feedback wurde gespeichert' }).waitFor()
    const currentSubmission = submissions.at(-1) as { envelope: { schemaVersion: number; context: { goalId: string }; feedback: { observation: string } } }
    assert(currentSubmission.envelope.schemaVersion === 2 && currentSubmission.envelope.context.goalId === goalId
      && currentSubmission.envelope.feedback.observation === currentText, 'the new form remains independently submittable with its goal binding')
  }

  await page.goto(`${fixtureUrl}?${binding.toString()}&goalId=duplicate`)
  await page.getByRole('heading', { name: 'Feedbacklink nicht gültig' }).waitFor()
  assert(await page.locator('#feedback-datenschutz').count() === 0, 'an invalid link does not show consent details')
  assert(await page.locator('form').count() === 0, 'duplicate binding parameters fail closed without a form')

  await page.goto(`${fixtureUrl}?${binding.toString()}&unexpected=secret`)
  await page.getByRole('heading', { name: 'Feedbacklink nicht gültig' }).waitFor()
  assert(await page.locator('form').count() === 0, 'unknown binding parameters fail closed without a form')

  for (const unsafeReturnParameter of ['source=cockpit', 'returnTo=cockpit', 'returnUrl=https%3A%2F%2Fexample.org']) {
    await page.goto(`${fixtureUrl}?${binding.toString()}&${unsafeReturnParameter}`)
    await page.getByRole('heading', { name: 'Feedbacklink nicht gültig' }).waitFor()
    assert(await page.locator('form').count() === 0, `${unsafeReturnParameter} must not alter the exact URL contract`)
  }
  // Invalid goal links require an explicit choice before entering the general form.
  await page.getByRole('link', { name: 'Allgemeines Feedback geben', exact: true }).click()
  await page.locator('form').waitFor()
  assert(new URL(page.url()).search === '', 'the explicit general fallback removes every invalid binding parameter')
  assert(await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).count() === 0, 'the general fallback contains no goal context')

  contextUnavailable = true
  await page.goto(`${fixtureUrl}?${binding.toString()}`)
  await page.getByRole('heading', { name: 'Feedbackkanal nicht verfügbar' }).waitFor()
  assert(await page.locator('form').count() === 0, 'a failed context lookup does not silently submit general feedback')
  await page.getByRole('link', { name: 'Allgemeines Feedback geben', exact: true }).click()
  await page.locator('form').waitFor()
  assert(new URL(page.url()).search === '', 'general feedback remains explicitly accessible when the goal service fails')
  assert(errors.length === 0, `browser errors: ${errors.join('\n')}`)
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('goal-book feedback UI browser tests passed')
