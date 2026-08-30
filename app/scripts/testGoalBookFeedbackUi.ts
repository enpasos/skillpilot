import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { startViteTestServer } from './viteTestServer'

const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(appRoot, 'scripts/fixtures/goalBookFeedbackUi.html')
const goalId = '11111111-1111-4111-8111-111111111111'
const goalFingerprint = `sha256:${'a'.repeat(64)}`
const pageFingerprint = `sha256:${'b'.repeat(64)}`
const bookDigest = `sha256:${'c'.repeat(64)}`
const manifestFingerprint = `sha256:${'d'.repeat(64)}`
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
  const errors: string[] = []
  const submissions: unknown[] = []
  let failedSubmissionsRemaining = 2
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/api/public/goal-feedback/v1/context?*', async (route) => {
    const url = new URL(route.request().url())
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
        },
        submissionEndpoint: '/api/public/goal-feedback/v1/submissions',
      }),
    })
  })
  await page.route('**/api/public/goal-feedback/v1/submissions', async (route) => {
    submissions.push(route.request().postDataJSON())
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
  await page.getByRole('heading', { name: 'Kritik strukturiert einreichen' }).waitFor()
  await page.getByRole('heading', { name: 'Datenschutzhinweis für Lernziel-Feedback' }).waitFor()
  await page.getByText(/Hinweisversion: 2026-08-30\.1/u).waitFor()
  await page.getByText(/maximale Aufbewahrung 31 Tage/u).waitFor()
  await page.getByText(/Erst nach einer gesonderten Freigabe durch den Betreiber darf eine Codex-Sitzung die lokale Rohdatei lesen/u).waitFor()
  await page.getByText(/Codex-Sitzungs- und Tool-Protokolle entstehen/u).waitFor()
  await page.getByText(/dieser Hinweis sagt dafür keine kürzere Löschfrist zu/u).waitFor()
  assert(
    await page.getByRole('link', { name: 'Allgemeine Datenschutzerklärung' }).getAttribute('href') === '/privacy',
    'the feedback-specific notice links to the general privacy policy',
  )
  await page.getByRole('heading', { name: 'Rationale Zahlen darstellen und ordnen' }).waitFor()
  assert(await page.locator('form').count() === 1, 'an exact verified binding exposes one form')
  await page.getByText(/Erst nachdem eine digestgebundene lokale Kopie vollständig geschrieben und geprüft wurde/u).waitFor()
  assert(await page.getByText(goalId, { exact: true }).count() === 1, 'the exact public goal ID is visible')
  assert(submissions.length === 0, 'loading the form does not submit feedback')

  await page.getByLabel('Art der Rückmeldung').selectOption('source_assignment')
  await page.getByLabel('Was ist dir konkret aufgefallen?').fill('Die angegebene Quellenzuordnung ist zu breit.')
  await page.getByLabel('Woran machst du das fest? (optional)').fill('Der zitierte Abschnitt behandelt nur einen Teil der Kompetenz.')
  await page.getByLabel('Wie könnte es besser sein? (optional)').fill('Eine engere Fundstelle verwenden.')
  await page.getByLabel('Quelle oder Fundstelle (optional)').fill('Offizieller Lehrplan, Seite 42')
  await page.getByLabel('Perspektive (optional)').selectOption('teacher')
  await page.getByLabel(/willige in die Verarbeitung/u).check()
  await page.getByLabel(/Codex diese Rückmeldung nach gesonderter Freigabe/u).check()
  await page.getByRole('button', { name: 'Feedback verbindlich absenden' }).click()
  await page.getByRole('alert').filter({ hasText: 'konnte nicht gespeichert werden' }).waitFor()
  assert(submissions.length === 1, 'a server error does not trigger an automatic retry')
  assert(await page.getByLabel('Was ist dir konkret aufgefallen?').inputValue() === 'Die angegebene Quellenzuordnung ist zu breit.', 'a failed submission remains editable')

  await page.getByRole('button', { name: 'Feedback verbindlich absenden' }).click()
  await page.getByRole('alert').filter({ hasText: 'konnte nicht gespeichert werden' }).waitFor()
  assert(submissions.length === 2, 'one unchanged explicit retry sends one additional request')
  const firstSubmission = submissions[0] as Record<string, unknown>
  const unchangedRetry = submissions[1] as Record<string, unknown>
  assert(unchangedRetry.clientSubmissionId === firstSubmission.clientSubmissionId, 'an unchanged ambiguous retry reuses its idempotency key')

  await page.getByLabel('Wie könnte es besser sein? (optional)').fill('Eine engere und überprüfte Fundstelle verwenden.')
  await page.getByRole('button', { name: 'Feedback verbindlich absenden' }).click()
  await page.getByRole('heading', { name: 'Feedback wurde zentral gespeichert' }).waitFor()
  assert(submissions.length === 3, 'one edited explicit submission sends one additional request')
  const submission = submissions[2] as Record<string, unknown>
  const envelope = submission.envelope as Record<string, unknown>
  const feedback = envelope.feedback as Record<string, unknown>
  assert(
    envelope.schemaVersion === 2
      && envelope.privacyNoticeVersion === '2026-08-30.1'
      && envelope.privacyNoticeLocale === 'de'
      && envelope.privacyAcknowledged === true
      && envelope.automatedProcessingAcknowledged === true
      && feedback.category === 'source_assignment'
      && feedback.observation === 'Die angegebene Quellenzuordnung ist zu breit.'
      && typeof submission.clientSubmissionId === 'string'
      && submission.clientSubmissionId !== firstSubmission.clientSubmissionId
      && submission.website === '',
    `unexpected feedback envelope: ${JSON.stringify(submission)}`,
  )
  assert(!JSON.stringify(submission).match(/skillpilotId|learnerId|sessionId|chatSession/iu), 'no learner or session identifier is transmitted')
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  assert(dimensions.scroll <= dimensions.client, `390px feedback form overflows: ${JSON.stringify(dimensions)}`)

  await page.getByRole('button', { name: 'EN' }).click()
  await page.getByRole('heading', { name: 'Privacy notice for learning-goal feedback' }).waitFor()
  await page.getByText(/Notice version: 2026-08-30\.1/u).waitFor()
  await page.getByText(/maximum retention is 31 days/u).waitFor()
  await page.getByText(/only after separate authorization by the operator; the content is then processed by the OpenAI Codex service/u).waitFor()
  await page.getByText(/Codex session and tool logs/u).waitFor()
  await page.getByText(/does not promise a shorter deletion period/u).waitFor()
  await page.getByRole('button', { name: 'DE' }).click()

  await page.goto(`${fixtureUrl}?${binding.toString()}&goalId=duplicate`)
  await page.getByRole('heading', { name: 'Feedbacklink nicht gültig' }).waitFor()
  await page.getByRole('heading', { name: 'Datenschutzhinweis für Lernziel-Feedback' }).waitFor()
  assert(await page.locator('form').count() === 0, 'duplicate binding parameters fail closed without a form')

  await page.goto(`${fixtureUrl}?${binding.toString()}&unexpected=secret`)
  await page.getByRole('heading', { name: 'Feedbacklink nicht gültig' }).waitFor()
  assert(await page.locator('form').count() === 0, 'unknown binding parameters fail closed without a form')
  assert(errors.length === 0, `browser errors: ${errors.join('\n')}`)
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('goal-book feedback UI browser tests passed')
