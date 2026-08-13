import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { startViteTestServer } from './viteTestServer'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/learnerDataManagementUi.html',
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
  const url = `${server.baseUrl}/scripts/fixtures/learnerDataManagementUi.html`

  const deContext = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin' })
  await deContext.addInitScript(() => localStorage.setItem('skillpilot_lang', 'de'))
  const dePage = await deContext.newPage()
  const deErrors: string[] = []
  dePage.on('pageerror', error => deErrors.push(error.message))
  await dePage.goto(url)

  await dePage.getByRole('dialog', { name: 'Daten & SkillPilot-ID' }).waitFor()
  assert(
    await dePage.getByText('11111111-1111-4111-8111-111111111111').isVisible(),
    'the dialog shows the complete current SkillPilot ID',
  )
  assert(
    await dePage.locator('time[datetime="2026-08-13T08:00:00Z"]').count() === 1
      && await dePage.locator('time[datetime="2027-08-13T08:00:00Z"]').count() === 1,
    'the dialog exposes both authoritative retention instants',
  )
  assert(
    await dePage.getByText(/Nach 365 Tagen ohne erfolgreiche Aktivität/u).isVisible()
      && await dePage.getByText(/nächsten Bereinigungslauf/u).isVisible(),
    'the German retention explanation distinguishes policy from cleanup timing',
  )
  const deCopySourcesSummary = dePage.getByText('Datenherkunft · 2 Einträge')
  const deFirstCopySource = dePage.getByText('22222222…')
  assert(
    await deCopySourcesSummary.isVisible() && !await deFirstCopySource.isVisible(),
    'copy-source provenance is discoverable but initially collapsed in German',
  )
  await deCopySourcesSummary.click()
  assert(
    await deFirstCopySource.isVisible()
      && await dePage.locator('time[datetime="2026-08-12T07:30:00Z"]').isVisible(),
    'expanding provenance reveals the shortened source ID and copy date',
  )

  await dePage.getByRole('button', { name: 'Lernstand exportieren' }).click()
  const fileChooserPromise = dePage.waitForEvent('filechooser')
  await dePage.getByRole('button', { name: 'Sicherungsdatei importieren' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles({
    name: 'learner-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}'),
  })
  assert(
    await dePage.evaluate(() => window.__learnerDataManagementMetrics.exports) === 1
      && await dePage.evaluate(() => window.__learnerDataManagementMetrics.imports) === 1,
    'the labeled actions delegate to the existing export and import flows',
  )

  await dePage.getByRole('button', { name: 'SkillPilot-ID und Daten löschen' }).click()
  const finalDelete = dePage.getByRole('button', { name: 'Endgültig löschen' })
  assert(await finalDelete.isDisabled(), 'the irreversible action starts disabled')
  assert(
    await dePage.getByText(/externen KI-Anbietern werden dadurch nicht gelöscht/u).isVisible(),
    'the destructive confirmation states the provider-data boundary',
  )
  await dePage.keyboard.press('Escape')
  await dePage.getByRole('heading', { name: 'Daten & SkillPilot-ID' }).waitFor()
  assert(
    await dePage.evaluate(() => window.__learnerDataManagementMetrics.closes) === 0,
    'Escape from confirmation returns to the overview instead of closing the dialog',
  )

  await dePage.getByRole('button', { name: 'SkillPilot-ID und Daten löschen' }).click()
  await dePage.getByRole('checkbox').check()
  assert(await finalDelete.isEnabled(), 'explicit understanding enables final deletion')
  await finalDelete.click()
  assert(
    await dePage.evaluate(() => window.__learnerDataManagementMetrics.deletes) === 1,
    'the confirmed action delegates exactly one deletion',
  )
  assert(deErrors.length === 0, `German dialog browser errors:\n${deErrors.join('\n')}`)
  await deContext.close()

  const enContext = await browser.newContext({ locale: 'en-GB', timezoneId: 'Europe/Berlin' })
  await enContext.addInitScript(() => localStorage.setItem('skillpilot_lang', 'en'))
  const enPage = await enContext.newPage()
  const enErrors: string[] = []
  enPage.on('pageerror', error => enErrors.push(error.message))
  await enPage.goto(url)
  await enPage.getByRole('dialog', { name: 'Data & SkillPilot ID' }).waitFor()
  assert(
    await enPage.getByText(/After 365 days without successful activity/u).isVisible()
      && await enPage.getByText(/next cleanup run/u).isVisible(),
    'the English dialog carries the same retention contract',
  )
  assert(
    await enPage.getByRole('button', { name: 'Export learning state' }).isVisible()
      && await enPage.getByRole('button', { name: 'Import backup file' }).isVisible(),
    'the English dialog keeps the existing data actions discoverable',
  )
  const enCopySourcesSummary = enPage.getByText('Data origin · 2 entries')
  assert(
    await enCopySourcesSummary.isVisible()
      && !await enPage.getByText('22222222…').isVisible(),
    'copy-source provenance is discoverable but initially collapsed in English',
  )
  assert(enErrors.length === 0, `English dialog browser errors:\n${enErrors.join('\n')}`)
  await enContext.close()
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('learner data management UI tests passed')
