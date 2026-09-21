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
  const writes: { id: string; body: unknown }[] = []
  const selected: Record<string, string[]> = { 'learner-a': [], 'learner-b': [] }
  const revisions: Record<string, number> = { 'learner-a': 0, 'learner-b': 0 }
  let featureOff = false
  let failSave = 0
  let providerRequests = 0
  let resourceType = 'article'
  let saveBarrier: Promise<void> | null = null
  let saveStarted = () => {}
  let readBarrier: Promise<void> | null = null
  let readStarted = () => {}
  await context.route('https://provider.example/**', async (route) => {
    providerRequests += 1
    assert.equal(route.request().headers().referer, undefined)
    assert.equal(route.request().headers()['x-skillpilot-content-capability'], undefined)
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>External material</h1>' })
  })
  await page.route('**/api/ui/learners/*/content-selection?*', async (route) => {
    const id = new URL(route.request().url()).pathname.split('/')[4]
    assert.equal(route.request().headers()['x-skillpilot-content-capability'], undefined,
      'ordinary Cockpit settings never require a separate material grant')
    if (featureOff) { await route.fulfill({ status: 404, body: '{}' }); return }
    if (route.request().method() === 'PUT') {
      const body = route.request().postDataJSON()
      writes.push({ id, body })
      if (failSave) { await route.fulfill({ status: failSave, body: '{}' }); return }
      if (body.expectedRevision !== revisions[id]) { await route.fulfill({ status: 409, body: '{}' }); return }
      selected[id] = body.selectedPackageIds
      revisions[id] += 1
      if (saveBarrier) { saveStarted(); await saveBarrier }
    }
    const response = {
      revision: revisions[id], selectedPackageIds: selected[id],
      packages: [{ packageId: 'physics-pilot', version: '0.1.0', title: 'Physik-Pilot', description: 'Zusätzliche Lernmaterialien aus einem geprüften Paket.', providerName: 'Public provider', providerUrl: 'https://provider.example/', access: 'public-link', aiUsage: 'link-only', materialCount: 1 }],
    }
    if (route.request().method() === 'GET' && id === 'learner-a' && readBarrier) { readStarted(); await readBarrier }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) })
  })
  await page.route('**/api/ui/learners/*/content-materials?*', async (route) => {
    const id = new URL(route.request().url()).pathname.split('/')[4]
    await route.fulfill({ status: featureOff ? 404 : 200, contentType: 'application/json', body: JSON.stringify(selected[id].includes('physics-pilot') ? [{ title: 'Motion analysis', url: 'https://provider.example/motion#analysis', provider: 'Public provider', resourceType, language: 'en', sections: ['Motion analysis'], access: 'public-link', aiUsage: 'link-only' }] : []) })
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/contentMaterialsUi.html`)
  const summary = page.locator('summary')
  const save = page.getByRole('button', { name: 'Materialauswahl speichern', exact: true })
  const openMaterials = async () => { await summary.waitFor(); await summary.click() }
  await openMaterials()
  assert.equal(await page.locator('input[type="password"]').count(), 0, 'no additional password is offered')
  assert.equal(await page.getByText(/Freigabeschlüssel|Access key|Schlüssel von SkillPilot/).count(), 0)
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'no default activation')
  assert.equal(await save.isEnabled(), true, 'the ordinary learner context is sufficient to save')
  await page.getByRole('checkbox').check()
  assert.deepEqual(selected['learner-a'], [], 'choosing a package alone does not persist it')
  assert.equal(writes.length, 0)
  await save.click()
  await page.getByText('Materialauswahl gespeichert.', { exact: true }).waitFor()
  await page.getByRole('link', { name: /Motion analysis/ }).waitFor()
  assert.equal(writes.length, 1)
  assert.deepEqual(writes[0], { id: 'learner-a', body: { expectedRevision: 0, selectedPackageIds: ['physics-pilot'] } })
  assert.equal(providerRequests, 0, 'showing links performs no external requests')

  await page.getByRole('button', { name: 'Toggle cockpit' }).click()
  await page.getByRole('button', { name: 'Toggle cockpit' }).click()
  await openMaterials()
  assert.equal(await page.getByRole('checkbox').isChecked(), true, 'saved choices survive a Cockpit remount')
  const link = page.getByRole('link', { name: /Motion analysis/ })
  await link.waitFor()
  const materialRegion = page.getByRole('region', { name: 'Materialien zu diesem Lernziel', exact: true })
  assert.equal(await materialRegion.getByRole('heading').count(), 0, 'no heading around compact material links')
  assert.equal(await materialRegion.locator('p').count(), 0, 'no repeated provider metadata or terms below links')
  assert.equal(await materialRegion.getByText(/Auswahl/).count(), 0, 'links do not mention package selection')
  assert.equal(await link.locator('svg.lucide-book-open').count(), 1, 'articles use a book icon')
  assert.equal(await page.getByRole('link', { name: /^Artikel: Motion analysis/ }).count(), 1,
    'the icon type is also available to assistive technology')
  assert((await link.boundingBox())!.height >= 44, 'compact links retain mobile touch targets')
  assert.equal(await link.getAttribute('rel'), 'noopener noreferrer')
  assert.equal(await link.getAttribute('referrerpolicy'), 'no-referrer')
  const popupPromise = context.waitForEvent('page')
  await link.click()
  const popup = await popupPromise
  await popup.getByRole('heading', { name: 'External material' }).waitFor()
  assert.equal(providerRequests, 1)
  await popup.close()
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'German mobile layout stays within viewport')
  if (process.env.SKILLPILOT_MATERIALS_SCREENSHOT) await page.screenshot({ path: process.env.SKILLPILOT_MATERIALS_SCREENSHOT, fullPage: true })

  for (const [type, icon, label] of [
    ['simulation', 'sliders-horizontal', 'Simulation'],
    ['future-resource-type', 'link', 'Lernmaterial'],
    ['article', 'book-open', 'Artikel'],
  ]) {
    resourceType = type
    await page.getByRole('button', { name: 'Toggle cockpit' }).click()
    await page.getByRole('button', { name: 'Toggle cockpit' }).click()
    await link.waitFor()
    assert.equal(await link.locator(`svg.lucide-${icon}`).count(), 1, `content icon for ${type}`)
    assert.equal(await link.getAttribute('title'), label)
  }
  await openMaterials()

  await page.getByRole('checkbox').uncheck()
  await save.click()
  await page.getByRole('link', { name: /Motion analysis/ }).waitFor({ state: 'detached' })
  assert.deepEqual(selected['learner-a'], [], 'explicit deactivation persists and removes the links')
  assert.equal(await page.getByRole('heading', { name: 'Normal learning stays available' }).count(), 1)

  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Switch learner' }).click()
  await openMaterials()
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'unsaved choices do not follow another learner')
  assert.equal(await page.getByRole('link', { name: /Motion analysis/ }).count(), 0)
  assert.deepEqual(selected['learner-b'], [])

  revisions['learner-b'] += 1 // Another Cockpit session saved since this panel loaded.
  await page.getByRole('checkbox').check()
  const beforeConflict = writes.length
  await save.click()
  await page.getByText(/Die Auswahl wurde inzwischen geändert/).waitFor()
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'conflict reloads server selection')
  assert.equal(writes.length, beforeConflict + 1, 'conflict never silently retries')
  assert.deepEqual(selected['learner-b'], [])
  for (failSave of [403, 503]) {
    await save.click()
    await page.getByText('Materialauswahl gerade nicht speicherbar. Du kannst weiterlernen.', { exact: true }).waitFor()
    assert.equal(await page.getByRole('heading', { name: 'Normal learning stays available' }).count(), 1)
    assert.equal(await page.getByText(/Freigabeschlüssel|Access key/).count(), 0, 'an error does not resurrect the retired grant workflow')
  }
  failSave = 0

  await page.getByRole('button', { name: 'Switch language' }).click()
  await openMaterials()
  const saveEnglish = page.getByRole('button', { name: 'Save material selection', exact: true })
  assert.equal(await saveEnglish.isEnabled(), true)
  assert.equal(await page.locator('input[type="password"]').count(), 0)
  await page.getByRole('checkbox').check()
  await saveEnglish.click()
  await page.getByText('Material selection saved.', { exact: true }).waitFor()
  await page.getByRole('link', { name: /Motion analysis/ }).waitFor()
  assert.equal(await page.getByRole('link', { name: /^Article: Motion analysis/ }).count(), 1,
    'English material type labels are localized')
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'English mobile layout stays within viewport')

  // A late response from the previous learner must never replace the current selection.
  let releaseSave = () => {}
  saveBarrier = new Promise<void>((resolve) => { releaseSave = resolve })
  const saveInFlight = new Promise<void>((resolve) => { saveStarted = resolve })
  await page.getByRole('checkbox').uncheck()
  await saveEnglish.click()
  await saveInFlight
  await page.getByRole('button', { name: 'Switch learner' }).click()
  await openMaterials()
  assert.equal(await page.getByRole('checkbox').isChecked(), false)
  releaseSave()
  saveBarrier = null
  await page.waitForTimeout(50)
  assert.equal(await page.getByText('Material selection saved.', { exact: true }).count(), 0,
    'a completed request from a previous learner cannot show a save message in the new context')
  assert.deepEqual(selected['learner-a'], [], 'a previous-learner save does not write into the new learner')

  // The same isolation applies to an initial load that completes after a context switch.
  selected['learner-a'] = ['physics-pilot']
  let releaseRead = () => {}
  readBarrier = new Promise<void>((resolve) => { releaseRead = resolve })
  const readInFlight = new Promise<void>((resolve) => { readStarted = resolve })
  await page.reload()
  await readInFlight
  await page.getByRole('button', { name: 'Switch learner' }).click()
  await openMaterials()
  releaseRead()
  readBarrier = null
  await page.waitForTimeout(50)
  assert.equal(await page.getByRole('checkbox').isChecked(), false, 'late initial reads cannot cross learner contexts')
  assert.equal(await page.getByRole('link', { name: /Motion analysis/ }).count(), 0)

  selected['learner-a'] = ['retired-pilot']
  await page.reload()
  await openMaterials()
  const retiredChoice = page.getByRole('checkbox', { name: /Nicht mehr verfügbares Paket: retired-pilot/ })
  await retiredChoice.waitFor()
  assert.equal(await retiredChoice.isChecked(), true, 'retired selections are never invisible')
  await retiredChoice.uncheck()
  await save.click()
  await page.getByText('Materialauswahl gespeichert.', { exact: true }).waitFor()
  assert.deepEqual(selected['learner-a'], [], 'retired IDs can be explicitly removed and saved')
  assert.deepEqual(writes.at(-1)?.body, { expectedRevision: revisions['learner-a'] - 1, selectedPackageIds: [] })

  failSave = 404
  await save.click()
  await summary.waitFor({ state: 'detached' })
  assert.equal(await page.getByRole('heading', { name: 'Normal learning stays available' }).count(), 1,
    'a removed learner or unavailable material API never blocks ordinary learning')
  featureOff = true
  await page.reload()
  await page.getByRole('heading', { name: 'Normal learning stays available' }).waitFor()
  await page.waitForTimeout(150)
  assert.equal(await summary.count(), 0, 'the optional operational kill switch hides the material UI')
  assert.equal(browserErrors.length, 0, browserErrors.join('\n'))
  console.log('Content material UI tests passed')
  await context.close()
} finally {
  await browser?.close()
  await server.close()
}
