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
assert.equal(bytes.length, plugin.bytes)
assert.equal(createHash('sha256').update(bytes).digest('hex'), plugin.sha256)
// Synthetic future metadata exercises the installed frontend's compatibility;
// actual archive downloads below continue to use the real current artifact.
const futureIndex = structuredClone(index)
const futurePlugin = futureIndex.plugins[0]!
const [, currentMinor, currentPatch] = plugin.version.split('.').map(Number)
futurePlugin.version = `1.${currentMinor! + 1}.${currentPatch}`
futurePlugin.sha256 = 'b'.repeat(64)
futurePlugin.filename = `${futurePlugin.id}-${futurePlugin.version}.plugin`
futurePlugin.downloadUrl = `/api/public/claude/plugins/${futurePlugin.id}/${futurePlugin.version}/sha256-${futurePlugin.sha256}/${futurePlugin.filename}`
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
    let responseIndex = index
    let releaseInitialPublication!: () => void
    const initialPublication = new Promise<void>((resolve) => { releaseInitialPublication = resolve })
    await page.route('**/api/public/claude/plugins/index.json', async (route) => {
      await initialPublication
      await route.fulfill({
        status: publicationAvailable ? 200 : 503,
        contentType: 'application/json',
        body: publicationAvailable ? JSON.stringify(responseIndex) : '{}',
      })
    })
    const fixtureUrl = `${server.baseUrl}/scripts/fixtures/claudePluginInstallUi.html`
    await page.goto(fixtureUrl, { waitUntil: 'domcontentloaded' })
    const guide = page.getByTestId('claude-plugin-direct-upload-guide')
    const downloadLabel = language === 'de' ? 'Plugin-Datei herunterladen' : 'Download plugin file'
    const downloadLink = guide.getByRole('link', { name: downloadLabel, exact: true })
    await page.getByRole('status').waitFor()
    assert.equal(await downloadLink.count(), 0)
    assert.doesNotMatch(await page.locator('body').innerText(), /\b[0-9]+\.[0-9]+\.[0-9]+\b/u,
      'loading must not guess any version before the public index arrives')
    releaseInitialPublication()
    await downloadLink.waitFor()
    const assertPublishedVersion = async (expectedPlugin: typeof plugin) => {
      assert.equal(await downloadLink.getAttribute('href'), expectedPlugin.downloadUrl)
      assert.equal(await downloadLink.getAttribute('download'), expectedPlugin.filename)
      assert.equal(await page.getByTestId('claude-plugin-version-badge').innerText(),
        `${language === 'de' ? 'CLAUDE-BETA' : 'CLAUDE BETA'} ${expectedPlugin.version}`)
      for (const testId of [
        'claude-plugin-description',
        'claude-plugin-update-guide',
        'claude-plugin-install-step-download',
        'claude-plugin-install-step-open',
        'claude-plugin-install-step-upload',
        'claude-plugin-install-step-return',
      ]) {
        assert((await page.getByTestId(testId).innerText()).includes(expectedPlugin.version),
          `${language} ${testId} displays the fetched publication version`)
      }
      const visibleVersions = (await page.locator('body').innerText()).match(/\b[0-9]+\.[0-9]+\.[0-9]+\b/gu) ?? []
      assert(visibleVersions.length >= 12, 'the header, introduction, steps and requirements all name the fetched version')
      assert(visibleVersions.every((version) => version === expectedPlugin.version),
        `every visible ${language} version must agree with the publication index: ${visibleVersions.join(', ')}`)
      await guide.locator('details > summary').click()
      const versionData = guide.locator('dl > div').filter({ has: page.locator('dt', { hasText: /^Version$/u }) })
      assert.equal(await versionData.locator('dd').innerText(), expectedPlugin.version)
      assert.equal(await guide.locator('code').innerText(), expectedPlugin.sha256)
      await guide.locator('details > summary').click()
    }
    await assertPublishedVersion(plugin)
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
    assert.equal(downloadedBytes.length, plugin.bytes)
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
    responseIndex = futureIndex
    await page.goto(fixtureUrl)
    await downloadLink.waitFor()
    await assertPublishedVersion(futurePlugin)
    publicationAvailable = false
    await page.goto(fixtureUrl)
    await page.getByRole('alert').waitFor()
    assert.equal(await downloadLink.count(), 0, 'failed index load offers no stale download')
    assert.doesNotMatch(await page.locator('body').innerText(), /\b[0-9]+\.[0-9]+\.[0-9]+\b/u,
      'failed index load offers no stale or guessed version')
    assert.equal(await guide.locator('[data-testid^="claude-plugin-install-step-"]').count(), 5)
    assert((await page.locator('body').innerText()).includes('Claude Pro'))
    publicationAvailable = true
    responseIndex = structuredClone(futureIndex)
    responseIndex.plugins[0]!.downloadUrl = plugin.downloadUrl
    await page.getByRole('button', { name: language === 'de' ? 'Erneut versuchen' : 'Try again', exact: true }).click()
    await page.getByRole('alert').waitFor()
    assert.equal(await downloadLink.count(), 0, 'a mismatched version/artifact path cannot provide a download')
    assert.doesNotMatch(await page.locator('body').innerText(), /\b[0-9]+\.[0-9]+\.[0-9]+\b/u,
      'a rejected index must not leak its unvalidated version into the guide')
    responseIndex = futureIndex
    await page.getByRole('button', { name: language === 'de' ? 'Erneut versuchen' : 'Try again', exact: true }).click()
    await downloadLink.waitFor()
    await assertPublishedVersion(futurePlugin)
    assert.deepEqual(errors, [])
    await context.close()
  }
  console.log('Claude plugin upload guide browser regression passed: DE/EN, two dynamic versions, loading/errors/retry, download bytes, mobile, no installation claim.')
} finally {
  await browser.close()
  await server.close()
}
