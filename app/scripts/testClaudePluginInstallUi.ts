import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import tailwindcss from '@tailwindcss/vite'
import { startViteTestServer } from './viteTestServer'
import { parseClaudePluginPublicationIndex } from '../src/utils/claudePluginPublication'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const artifactRoot = new URL('../../backend/src/main/resources/claude-plugin-publication/', import.meta.url)
const index = parseClaudePluginPublicationIndex(JSON.parse(await readFile(new URL('index.json', artifactRoot), 'utf8')))
const plugin = index.plugins[0]!
const bytes = await readFile(new URL(plugin.downloadUrl.replace('/api/public/claude/plugins/', ''), artifactRoot))
assert.equal(createHash('sha256').update(bytes).digest('hex'), plugin.sha256)
const server = await startViteTestServer(appRoot, 'scripts/fixtures/claudePluginInstallUi.html', {
  plugins: [tailwindcss(), {
    name: 'serve-unchanged-plugin-download',
    configureServer(vite) {
      vite.middlewares.use((request, response, next) => {
        if (request.url !== plugin.downloadUrl) return next()
        response.setHeader('Content-Type', 'application/octet-stream')
        response.setHeader('Content-Disposition', `attachment; filename="${plugin.filename}"`)
        response.end(bytes)
      })
    },
  }],
})
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
try {
  for (const language of ['de', 'en']) {
    const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } })
    await context.addInitScript((lang) => {
      localStorage.setItem('skillpilot_lang', lang)
      localStorage.setItem('skillpilot_theme', 'light')
    }, language)
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    let publicationAvailable = true
    await page.route('**/api/public/claude/plugins/index.json', (route) => route.fulfill({
      status: publicationAvailable ? 200 : 503,
      contentType: 'application/json',
      body: publicationAvailable ? JSON.stringify(index) : '{}',
    }))
    const fixtureUrl = `${server.baseUrl}/scripts/fixtures/claudePluginInstallUi.html`
    await page.goto(fixtureUrl)
    const guide = page.getByTestId('claude-plugin-direct-upload-guide')
    const downloadLabel = language === 'de' ? 'Plugin-Datei herunterladen' : 'Download plugin file'
    const downloadLink = guide.getByRole('link', { name: downloadLabel, exact: true })
    await downloadLink.waitFor()
    assert.equal(await guide.locator('[data-testid^="claude-plugin-install-step-"]').count(), 5)
    assert.equal(await downloadLink.getAttribute('href'), plugin.downloadUrl)
    assert.equal(await downloadLink.getAttribute('download'), plugin.filename)
    assert.equal(await guide.getByTestId('claude-plugin-install-step-download').getByRole('link', { name: downloadLabel }).count(), 1)
    assert.equal(await guide.getByTestId('claude-plugin-install-step-return').getByRole('link').getAttribute('href'), '/')
    assert.equal(await guide.getByTestId('claude-plugin-install-step-open').getByRole('link').getAttribute('href'), 'https://claude.ai')
    const body = await page.locator('body').innerText()
    assert(!body.includes('Marketplace hinzufügen') && !body.includes('Add marketplace'))
    assert(body.includes(language === 'de' ? 'nicht automatisch auslesen' : 'cannot currently read'))
    assert(body.includes(language === 'de' ? 'ist kein erneuter Upload nötig' : 'no new upload is needed'))
    assert(body.includes(language === 'de'
      ? `Wird ${plugin.version} angezeigt, ist kein erneuter Upload nötig`
      : `If it shows ${plugin.version}, no new upload is needed`),
    'the update advice must name the version of the actual downloadable artifact')
    assert((await page.title()).includes(language === 'de' ? 'Claude-Plugin-Beta' : 'Claude plugin beta'))
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow')
    const storageBeforeDownload = await page.evaluate(() => JSON.stringify(localStorage))
    const downloadEvent = page.waitForEvent('download')
    await downloadLink.click()
    const download = await downloadEvent
    assert.equal(download.suggestedFilename(), plugin.filename)
    const downloadedBytes = await readFile((await download.path())!)
    assert.equal(createHash('sha256').update(downloadedBytes).digest('hex'), plugin.sha256)
    assert.equal(await page.evaluate(() => JSON.stringify(localStorage)), storageBeforeDownload,
      'a successful download does not claim an installation or persist a plugin version')
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await downloadLink.scrollIntoViewIfNeeded()
      assert(await downloadLink.isVisible())
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${language} guide fits the ${width}px viewport`)
      if (process.env.SKILLPILOT_PLUGIN_GUIDE_SCREENSHOT_DIR) {
        await mkdir(process.env.SKILLPILOT_PLUGIN_GUIDE_SCREENSHOT_DIR, { recursive: true })
        await page.screenshot({ path: `${process.env.SKILLPILOT_PLUGIN_GUIDE_SCREENSHOT_DIR}/${language}-${width}.png` })
      }
    }
    publicationAvailable = false
    await page.goto(fixtureUrl)
    await page.getByRole('alert').waitFor()
    assert.equal(await downloadLink.count(), 0, 'failed index load offers no stale download')
    assert.equal(await guide.locator('[data-testid^="claude-plugin-install-step-"]').count(), 5)
    assert((await page.locator('body').innerText()).includes('Claude Pro'))
    publicationAvailable = true
    await page.getByRole('button', { name: language === 'de' ? 'Erneut versuchen' : 'Try again', exact: true }).click()
    await downloadLink.waitFor()
    assert.deepEqual(errors, [])
    await context.close()
  }
  console.log('Claude plugin upload guide browser regression passed: DE/EN, download bytes, mobile, retry, no installation claim.')
} finally {
  await browser.close()
  await server.close()
}
