import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { startViteTestServer } from './viteTestServer'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'

const learnerId = 'c709883e-bf21-4482-9f68-eb6fe921a619'
const session = `spg_${'A'.repeat(43)}`
const prompt = `@SkillPilot Nutze den SkillPilot Coach Skill.\nlearningSessionId: ${session}`
const payload = { prompt, learningSessionId: session,
  webUrl: 'https://gemini.google.com/app?hl=en', expiresAt: '2026-10-07T10:00:00Z' }
const server = await startViteTestServer(fileURLToPath(new URL('..', import.meta.url)), 'scripts/fixtures/geminiStartUi.html')
const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext()
  await context.addInitScript(() => localStorage.setItem('skillpilot_lang', 'de'))
  const page = await context.newPage()
  let requests = 0
  let delayed = false
  let fail = false
  const consoleMessages: string[] = []
  page.on('console', message => consoleMessages.push(message.text()))
  await page.route('**/api/ui/learners/*/gemini/v1/launch', async route => {
    requests += 1
    assert.equal(route.request().method(), 'POST')
    assert.deepEqual(route.request().postDataJSON(), { communicationLocale: 'de', client: 'web-start' })
    if (delayed) await new Promise(resolve => setTimeout(resolve, 350))
    await route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json',
      body: fail ? `private failure ${session} ${learnerId}` : JSON.stringify(payload) })
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/geminiStartUi.html`)
  const prepare = page.getByRole('button', { name: 'Lernen mit Gemini vorbereiten', exact: true })
  await prepare.waitFor()
  assert.equal(await prepare.isDisabled(), true)
  await page.getByRole('checkbox').check()
  delayed = true
  await prepare.click()
  assert.equal(await page.getByRole('button', { name: 'Lernsession wird vorbereitet …', exact: true }).isDisabled(), true)
  await page.getByTestId('gemini-handoff').waitFor()
  assert.equal(requests, 1)
  assert.equal(await page.getByRole('textbox').inputValue(), prompt)
  assert.equal(await page.getByRole('link', { name: 'Gemini öffnen', exact: true }).getAttribute('href'), payload.webUrl)
  assert(!new URL(page.url()).searchParams.toString().includes(session))
  assert.equal(await page.getByRole('link', { name: 'Gemini öffnen', exact: true }).getAttribute('rel'), 'noopener noreferrer')

  await page.evaluate(`Object.defineProperty(navigator, 'clipboard', { configurable: true,
    value: { writeText: async () => { throw new Error('clipboard blocked') } } })`)
  await page.getByRole('button', { name: 'Startnachricht kopieren', exact: true }).click()
  assert.equal(await page.evaluate(() => {
    const textarea = document.querySelector('textarea')
    return textarea === document.activeElement && textarea.selectionEnd === textarea.value.length
  }), true, 'clipboard failures leave the whole visible prompt selected')
  assert.equal(await page.getByRole('button', { name: 'Startnachricht kopiert', exact: true }).count(), 0)

  await prepare.click()
  await page.getByRole('button', { name: 'Switch provider', exact: true }).click()
  await page.waitForTimeout(450)
  await page.getByRole('button', { name: 'Switch provider', exact: true }).click()
  await page.getByTestId('gemini-start').waitFor()
  assert.equal(await page.getByTestId('gemini-handoff').count(), 0, 'switching providers discards an in-flight session')
  assert.equal(await page.getByRole('checkbox').isChecked(), false)
  await page.getByRole('checkbox').check()
  fail = true
  delayed = false
  await prepare.click()
  await page.getByRole('alert').waitFor()
  assert(!(await page.getByRole('alert').innerText()).includes(session))
  assert.equal(await page.getByTestId('gemini-handoff').count(), 0)
  assert(!consoleMessages.some(message => message.includes(session) || message.includes(learnerId)),
    'session capabilities and permanent IDs never enter browser logs')
  assert.equal(await page.evaluate(`Object.values(localStorage).some(value => value.includes('spg_'))`), false,
    'learning session is not stored in persistent browser storage')

  const setupPage = await context.newPage()
  await setupPage.addInitScript((version) => {
    localStorage.setItem('skillpilot_terms_accepted_version', version)
  }, CURRENT_TERMS_VERSION)
  let normalLaunches = 0
  await setupPage.route('**/api/ui/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    let body: unknown = {}
    if (pathname.endsWith('/gemini/v1/launch')) {
      normalLaunches += 1
      assert.equal(route.request().method(), 'POST')
      body = payload
    } else if (pathname === '/api/ui/landscapes') {
      body = { summaries: [{ curriculumId: CANONICAL_GYMNASIUM_ROOT_ID,
        filename: 'canonical-gymnasium.json', country: 'DE', region: 'DE',
        type: 'GYMNASIUM', level: 'Sekundarstufe', subject: 'Gymnasium',
        locale: 'de-DE', title: 'Gymnasium (DE)', schoolType: 'Gymnasium', qualityMaturity: 'M6' }] }
    } else if (pathname.endsWith('/personalization-plan')) {
      body = { stage: 'COMPLETE', options: [], displayOptions: [], navigationOptions: [],
        currentSelectedOptions: [], completedDecisions: [], preservedDecisions: [], pendingDecisions: [],
        minSelections: 0, maxSelections: 0, selectedCount: 0 }
    } else if (pathname === `/api/ui/learners/${learnerId}`) {
      body = { selectedCurriculum: CANONICAL_GYMNASIUM_ROOT_ID }
    } else if (pathname.endsWith('/resume') || pathname.endsWith('/retention')) {
      body = { lastActivityAt: '2026-10-06T10:00:00Z', scheduledDeletionAt: '2027-10-06T10:00:00Z' }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
  await setupPage.goto(`${server.baseUrl}/scripts/fixtures/geminiStartUi.html?full=1`)
  await setupPage.getByTestId('public-landing-action-learning').click()
  await setupPage.getByLabel('Deine SkillPilot-ID').fill(learnerId)
  assert.equal(normalLaunches, 0, 'no Gemini session is issued before setup or provider choice')
  await setupPage.getByRole('button', { name: 'Weiter zu Schritt 2: Curriculum wählen', exact: true }).click()
  await setupPage.getByRole('heading', { name: 'Los geht’s', exact: true }).waitFor()
  assert.equal(await setupPage.getByTestId('gemini-start').count(), 0)
  await setupPage.getByRole('radio', { name: 'Gemini (Beta)', exact: false }).check()
  await setupPage.getByTestId('gemini-start').waitFor()
  await setupPage.getByTestId('gemini-start').getByRole('checkbox').check()
  await setupPage.getByRole('button', { name: 'Lernen mit Gemini vorbereiten', exact: true }).click()
  await setupPage.getByTestId('gemini-handoff').waitFor()
  assert.equal(normalLaunches, 1, 'ordinary learning entry uses the independent Gemini session endpoint')
  assert.equal(await setupPage.getByTestId('gemini-handoff').getByRole('textbox').inputValue(), prompt)
  await setupPage.getByRole('radio', { name: 'Claude', exact: false }).check()
  assert.equal(await setupPage.getByTestId('gemini-handoff').count(), 0)
  await setupPage.close()
  await context.close()
  console.log('Gemini ordinary learning entry, browser handoff, privacy, provider switching and failure checks passed.')
} finally {
  await browser.close()
  await server.close()
}
