import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser } from 'playwright'
import { startViteTestServer } from './viteTestServer'

const server = await startViteTestServer(fileURLToPath(new URL('../', import.meta.url)), 'scripts/fixtures/contentMaterialsUi.html', { plugins: [tailwindcss()] })
let browser: Browser | null = null
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  const writes: { id: string; key: string | undefined; body: unknown }[] = []
  const selected: Record<string, string[]> = { 'learner-a': [], 'learner-b': [] }
  let revision = 0
  let featureOff = false
  let failSave = 0
  let providerRequests = 0
  await context.route('https://provider.example/**', async (route) => {
    providerRequests += 1
    assert.equal(route.request().headers().referer, undefined)
    assert.equal(route.request().headers()['x-skillpilot-content-capability'], undefined)
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>External material</h1>' })
  })
  await page.route('**/api/ui/learners/*/content-selection?*', async (route) => {
    const id = new URL(route.request().url()).pathname.split('/')[4]
    if (featureOff) { await route.fulfill({ status: 404, body: '{}' }); return }
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON()
      writes.push({ id, body, key: route.request().headers()['x-skillpilot-content-capability'] })
      if (failSave) { await route.fulfill({ status: failSave, body: '{}' }); return }
      selected[id] = body.selectedPackageIds
      revision += 1
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      revision, selectedPackageIds: selected[id], packages: [{ packageId: 'physics-pilot', version: '0.1.0', title: 'Physik-Pilot', description: 'Zusätzliche Lernmaterialien aus einem geprüften Paket.', providerName: 'Public provider', providerUrl: 'https://provider.example/', access: 'public-link', aiUsage: 'link-only', materialCount: 1 }],
    }) })
  })
  await page.route('**/api/ui/learners/*/content-materials?*', async (route) => {
    const id = new URL(route.request().url()).pathname.split('/')[4]
    await route.fulfill({ status: featureOff ? 404 : 200, contentType: 'application/json', body: JSON.stringify(selected[id].length ? [{ title: 'Motion analysis', url: 'https://provider.example/motion#analysis', provider: 'Public provider', resourceType: 'article', language: 'en', sections: ['Motion analysis'], access: 'public-link', aiUsage: 'link-only' }] : []) })
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/contentMaterialsUi.html`)
  const summary = page.locator('summary')
  await summary.waitFor()
  await summary.click()
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'no default activation')
  assert.equal(await page.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).isEnabled(), false)
  await page.getByRole('checkbox').check()
  const key = page.getByLabel('Freigabeschlüssel für die Materialauswahl', { exact: true })
  await key.fill('pilot-secret')
  await page.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await page.getByText('Materialauswahl gespeichert.', { exact: true }).waitFor()
  await page.getByRole('link', { name: /Motion analysis/ }).waitFor()
  assert.equal(await key.inputValue(), '', 'key is cleared after saving')
  assert.equal(writes.length, 1)
  assert.deepEqual(writes[0], { id: 'learner-a', key: 'pilot-secret', body: { expectedRevision: 0, selectedPackageIds: ['physics-pilot'] } })
  assert.equal(providerRequests, 0, 'showing links performs no external requests')
  const stored = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]))
  assert(!stored.includes('pilot-secret'), 'credential stays out of browser storage')
  const link = page.getByRole('link', { name: /Motion analysis/ })
  assert.equal(await link.getAttribute('rel'), 'noopener noreferrer')
  assert.equal(await link.getAttribute('referrerpolicy'), 'no-referrer')
  const popupPromise = context.waitForEvent('page')
  await link.click()
  const popup = await popupPromise
  await popup.getByRole('heading', { name: 'External material' }).waitFor()
  assert.equal(providerRequests, 1)
  await popup.close()
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile layout stays within viewport')

  await page.getByRole('checkbox').uncheck()
  await key.fill('pilot-secret')
  await page.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await page.getByRole('link', { name: /Motion analysis/ }).waitFor({ state: 'detached' })
  assert.deepEqual(selected['learner-a'], [], 'explicit deactivation persists and removes the links')
  assert.equal(await page.getByRole('heading', { name: 'Normal learning stays available' }).count(), 1)

  await key.fill('must-clear-on-close')
  await summary.click()
  await summary.click()
  assert.equal(await key.inputValue(), '')
  await key.fill('must-not-follow-learner')
  await page.getByRole('button', { name: 'Switch learner' }).click()
  await summary.waitFor()
  await summary.click()
  assert.equal(await key.inputValue(), '')
  assert.equal(await page.getByRole('checkbox').isChecked(), false)
  assert.equal(await page.getByRole('link', { name: /Motion analysis/ }).count(), 0)

  failSave = 403
  await key.fill('wrong-key')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await page.getByText('Der Freigabeschlüssel passt nicht zu dieser SkillPilot-ID.', { exact: true }).waitFor()
  assert.equal(await key.inputValue(), '')
  failSave = 409
  await key.fill('stale-key')
  await page.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await page.getByText(/Die Auswahl wurde inzwischen geändert/).waitFor()
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'conflict reloads server selection')
  assert.equal(writes.length, 4, 'conflict never silently retries')
  failSave = 503
  await key.fill('retry-later-key')
  await page.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await page.getByText('Materialauswahl gerade nicht speicherbar. Du kannst weiterlernen.', { exact: true }).waitFor()
  assert.equal(await page.getByRole('heading', { name: 'Normal learning stays available' }).count(), 1)
  failSave = 0

  await page.getByRole('button', { name: 'Switch language' }).click()
  await summary.waitFor()
  await summary.click()
  await page.getByLabel('Access key for material selection', { exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Save material selection', exact: true }).count(), 1)
  await page.getByLabel('Access key for material selection', { exact: true }).fill('unmount-secret')
  await page.getByRole('button', { name: 'Toggle cockpit' }).click()
  await page.getByRole('button', { name: 'Toggle cockpit' }).click()
  await summary.waitFor()
  await summary.click()
  assert.equal(await page.getByLabel('Access key for material selection', { exact: true }).inputValue(), '')

  selected['learner-a'] = ['retired-pilot']
  await page.reload()
  await summary.waitFor()
  await summary.click()
  const retiredChoice = page.getByRole('checkbox', { name: /Nicht mehr verfügbares Paket: retired-pilot/ })
  await retiredChoice.waitFor()
  assert.equal(await retiredChoice.isChecked(), true, 'retired selections are never invisible')
  await retiredChoice.uncheck()
  await key.fill('pilot-secret')
  await page.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await page.getByText('Materialauswahl gespeichert.', { exact: true }).waitFor()
  assert.deepEqual(selected['learner-a'], [], 'retired IDs can be explicitly removed and saved')
  assert.deepEqual(writes.at(-1)?.body, { expectedRevision: revision - 1, selectedPackageIds: [] })

  featureOff = true
  await page.reload()
  await page.getByRole('heading', { name: 'Normal learning stays available' }).waitFor()
  await page.waitForTimeout(150)
  assert.equal(await summary.count(), 0, 'disabled pilot is entirely hidden')
  assert.equal(browserErrors.length, 0, browserErrors.join('\n'))
  console.log('Content material UI tests passed')
  await context.close()
} finally {
  await browser?.close()
  await server.close()
}
