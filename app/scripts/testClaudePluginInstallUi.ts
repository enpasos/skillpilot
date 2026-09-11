import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import tailwindcss from '@tailwindcss/vite'
import { startViteTestServer } from './viteTestServer'
import {
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  CLAUDE_MARKETPLACE_INSTALLATION_ENABLED,
  CLAUDE_PLUGINS_DISCOVER_URL,
  parseClaudePluginPublicationIndex,
} from '../src/utils/claudePluginPublication'

type ClipboardTestWindow = Window & {
  skillpilotClipboardWrites: string[]
  skillpilotClipboardFails: boolean
}

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
      const testWindow = window as ClipboardTestWindow
      testWindow.skillpilotClipboardWrites = []
      testWindow.skillpilotClipboardFails = false
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          async writeText(value: string) {
            if (testWindow.skillpilotClipboardFails) throw new Error('Clipboard permission denied')
            testWindow.skillpilotClipboardWrites.push(value)
          },
        },
      })
    }, language)
    const externalNavigations: string[] = []
    // A local intercepted response verifies navigation without opening or
    // changing a real Claude account. An unavailable host must not hide upload.
    await context.route('https://claude.ai/**', async (route) => {
      externalNavigations.push(route.request().url())
      await route.fulfill({ status: 503, contentType: 'text/html', body: '<p>Unavailable test host</p>' })
    })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    let publicationAvailable = true
    let responseIndex = index
    let publicationRequests = 0
    let releaseInitialPublication!: () => void
    const initialPublication = new Promise<void>((resolve) => { releaseInitialPublication = resolve })
    await page.route('**/api/public/claude/plugins/index.json', async (route) => {
      publicationRequests += 1
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
    const marketplace = page.getByTestId('claude-plugin-marketplace-guide')
    const finish = page.getByTestId('claude-plugin-finish-guide')
    const openClaude = page.getByTestId('claude-plugin-open-claude')
    const installMode = page.getByTestId('claude-plugin-mode-install')
    const updateMode = page.getByTestId('claude-plugin-mode-update')
    const downloadLabel = language === 'de' ? 'Plugin-Datei herunterladen' : 'Download plugin file'
    const downloadLink = guide.getByRole('link', { name: downloadLabel, exact: true })
    const assertUnavailableVersionSafety = async () => {
      const comparison = await page.getByTestId('claude-plugin-update-guide').innerText()
      assert(comparison.includes(language === 'de'
        ? 'Entferne keine bestehende Installation'
        : 'Do not remove an existing installation'),
      'missing version information must not encourage removing an existing installation')
    }
    await page.getByTestId('claude-plugin-publication-status').waitFor()
    await assertUnavailableVersionSafety()
    if (!CLAUDE_MARKETPLACE_INSTALLATION_ENABLED) {
      assert.equal(await marketplace.count(), 0, 'the unpublished candidate does not inherit the old Marketplace guide approval')
      assert.equal(await downloadLink.count(), 0, 'loading never offers an unvalidated candidate download')
      assert.equal(await guide.getAttribute('open'), '', 'the only available installation route starts expanded')
      releaseInitialPublication()
      await downloadLink.waitFor()
      assert.equal(await downloadLink.getAttribute('href'), plugin.downloadUrl)
      assert((await page.getByTestId('claude-plugin-version-badge').innerText()).includes(plugin.version))
      assert.equal(await finish.getByTestId('claude-plugin-install-step-return').getByRole('link').getAttribute('href'), '/')
      const storageBeforeDownload = await page.evaluate(() => JSON.stringify(localStorage))
      const downloadEvent = page.waitForEvent('download')
      await downloadLink.click()
      const download = await downloadEvent
      const downloadedBytes = await readFile((await download.path())!)
      assert.equal(createHash('sha256').update(downloadedBytes).digest('hex'), plugin.sha256)
      assert.equal(await page.evaluate(() => JSON.stringify(localStorage)), storageBeforeDownload)
      for (const width of [1280, 390]) {
        await page.setViewportSize({ width, height: 900 })
        await downloadLink.scrollIntoViewIfNeeded()
        assert(await downloadLink.isVisible())
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          `${language} candidate file guide fits the ${width}px viewport`)
      }
      responseIndex = futureIndex
      await page.goto(fixtureUrl)
      await downloadLink.waitFor()
      assert.equal(await downloadLink.getAttribute('href'), futurePlugin.downloadUrl)
      assert((await page.getByTestId('claude-plugin-version-badge').innerText()).includes(futurePlugin.version))
      publicationAvailable = false
      await page.goto(fixtureUrl)
      await page.getByRole('alert').waitFor()
      await assertUnavailableVersionSafety()
      assert.equal(await downloadLink.count(), 0, 'failed candidate metadata cannot offer a stale download')
      assert.equal(await marketplace.count(), 0, 'metadata failure cannot enable an unapproved Marketplace route')
      publicationAvailable = true
      responseIndex = index
      await page.getByRole('button', { name: language === 'de' ? 'Erneut versuchen' : 'Try again', exact: true }).click()
      await downloadLink.waitFor()
      assert.deepEqual(errors, [])
      await context.close()
      continue
    }
    assert(await marketplace.isVisible(), 'Marketplace instructions do not depend on the download index')
    assert(await guide.locator(':scope > summary').isVisible(), 'the file-upload fallback remains discoverable')
    assert.equal(await guide.getAttribute('open'), null, 'the alternative route starts collapsed')
    assert.equal(await installMode.getAttribute('aria-pressed'), 'true')
    assert.equal(await updateMode.getAttribute('aria-pressed'), 'false')
    assert(await page.getByTestId('claude-plugin-marketplace-migration').evaluate((migration) => {
      const navigation = document.querySelector('[data-testid="claude-plugin-marketplace-navigation"]')
      return !!navigation && !!(migration.compareDocumentPosition(navigation) & Node.DOCUMENT_POSITION_FOLLOWING)
    }), 'migration advice appears before instructions to add the Marketplace plugin')
    assert.equal(await openClaude.getAttribute('href'), CLAUDE_PLUGINS_DISCOVER_URL)
    assert.equal(await openClaude.getAttribute('target'), '_blank')
    assert.match(await openClaude.getAttribute('rel') ?? '', /\bnoopener\b/u)
    assert.match(await openClaude.getAttribute('rel') ?? '', /\bnoreferrer\b/u)
    assert.equal(await downloadLink.count(), 0)
    assert.doesNotMatch(await page.locator('body').innerText(), /\b[0-9]+\.[0-9]+\.[0-9]+\b/u,
      'loading must not guess any version before the public index arrives')
    await guide.locator(':scope > summary').click()
    assert.equal(await downloadLink.count(), 0, 'the expanded fallback has no download before index validation')
    assert.doesNotMatch(await page.locator('body').innerText(), /\b[0-9]+\.[0-9]+\.[0-9]+\b/u,
      'the expanded fallback must not guess a current version')
    releaseInitialPublication()
    await downloadLink.waitFor()
    const assertPublishedVersion = async (expectedPlugin: typeof plugin) => {
      assert.equal(await downloadLink.getAttribute('href'), expectedPlugin.downloadUrl)
      assert.equal(await downloadLink.getAttribute('download'), expectedPlugin.filename)
      assert.equal(await page.getByTestId('claude-plugin-version-badge').innerText(),
        `${language === 'de' ? 'CLAUDE-BETA' : 'CLAUDE BETA'} ${expectedPlugin.version}`)
      for (const testId of [
        'claude-plugin-update-guide',
        'claude-plugin-install-step-download',
        'claude-plugin-install-step-version',
      ]) {
        assert((await page.getByTestId(testId).innerText()).includes(expectedPlugin.version),
          `${language} ${testId} displays the fetched publication version`)
      }
      if (await installMode.getAttribute('aria-pressed') === 'true') {
        const preAddCheck = await page.getByTestId('claude-plugin-marketplace-navigation').getByRole('listitem').nth(2).innerText()
        assert(preAddCheck.includes(expectedPlugin.version), 'the pre-add check uses the fetched publication version')
        assert(preAddCheck.includes(language === 'de' ? 'Prüfe vor „Hinzufügen“' : 'Before selecting Add'),
          'the offered version must be checked before adding the plugin')
      }
      const visibleVersions = (await page.locator('body').innerText()).match(/\b[0-9]+\.[0-9]+\.[0-9]+\b/gu) ?? []
      assert(visibleVersions.length > 0, 'the fetched publication version is visible')
      assert(visibleVersions.every((version) => version === expectedPlugin.version),
        `every visible ${language} version must agree with the publication index: ${visibleVersions.join(', ')}`)
      await guide.locator('details > summary').click()
      const versionData = guide.locator('dl > div').filter({ has: page.locator('dt', { hasText: /^Version$/u }) })
      assert.equal(await versionData.locator('dd').innerText(), expectedPlugin.version)
      assert.equal(await guide.locator('code').innerText(), expectedPlugin.sha256)
      await guide.locator('details > summary').click()
    }
    await assertPublishedVersion(plugin)
    assert.equal(await guide.locator('[data-testid^="claude-plugin-install-step-"]').count(), 3)
    assert.equal(await finish.locator('[data-testid^="claude-plugin-install-step-"]').count(), 3)
    assert.equal(await downloadLink.getAttribute('href'), plugin.downloadUrl)
    assert.equal(await downloadLink.getAttribute('download'), plugin.filename)
    assert.equal(await guide.getByTestId('claude-plugin-install-step-download').getByRole('link', { name: downloadLabel }).count(), 1)
    assert.equal(await finish.getByTestId('claude-plugin-install-step-return').getByRole('link').getAttribute('href'), '/')
    assert.equal(await page.getByTestId('claude-plugin-marketplace-url').innerText(), CLAUDE_MARKETPLACE_REPOSITORY_URL)
    const copyButton = page.getByTestId('claude-plugin-copy-marketplace')
    const storageBeforeNavigation = await page.evaluate(() => JSON.stringify(localStorage))
    const requestsBeforeNavigation = publicationRequests
    await copyButton.click()
    assert.deepEqual(await page.evaluate(() => (window as ClipboardTestWindow).skillpilotClipboardWrites),
      [CLAUDE_MARKETPLACE_REPOSITORY_URL], 'copy writes only the canonical repository URL')
    assert.match(await page.getByTestId('claude-plugin-copy-status').innerText(), /kopiert|copied/iu)
    await page.evaluate(() => { (window as ClipboardTestWindow).skillpilotClipboardFails = true })
    await copyButton.click()
    assert.match(await page.getByTestId('claude-plugin-copy-status').innerText(), /selbst|manuell|manually/iu)
    assert.equal(await page.getByTestId('claude-plugin-marketplace-url').innerText(), CLAUDE_MARKETPLACE_REPOSITORY_URL,
      'the repository remains available for manual copy if clipboard access fails')
    const popupPromise = page.waitForEvent('popup')
    await openClaude.click()
    const popup = await popupPromise
    await popup.waitForLoadState('domcontentloaded')
    assert.equal(popup.url(), CLAUDE_PLUGINS_DISCOVER_URL)
    assert.deepEqual(externalNavigations, ['https://claude.ai/new'])
    await popup.close()
    assert.equal(publicationRequests, requestsBeforeNavigation, 'opening Claude does not request a plugin update')
    assert.equal(await page.evaluate(() => JSON.stringify(localStorage)), storageBeforeNavigation,
      'copying or opening Claude does not persist an installation or version marker')
    assert(await downloadLink.isVisible(), 'the upload fallback stays usable when Claude navigation is unavailable')
    await updateMode.click()
    assert.equal(await installMode.getAttribute('aria-pressed'), 'false')
    assert.equal(await updateMode.getAttribute('aria-pressed'), 'true')
    const updateNavigation = await page.getByTestId('claude-plugin-marketplace-navigation').innerText()
    assert(updateNavigation.includes(language === 'de' ? 'Marketplaces verwalten' : 'Manage marketplaces'))
    assert(updateNavigation.includes(language === 'de' ? 'Nach Updates suchen' : 'Check for updates'))
    assert(await downloadLink.isVisible(), 'existing installations retain the file-upload fallback')
    await installMode.click()
    const installNavigation = await page.getByTestId('claude-plugin-marketplace-navigation').innerText()
    assert(installNavigation.includes(language === 'de' ? 'Marketplace hinzufügen' : 'Add marketplace'))
    assert(installNavigation.includes(language === 'de' ? 'Aus einem Repository hinzufügen' : 'Add from a repository'))
    const body = await page.locator('body').innerText()
    assert(!body.includes('?v='), 'the historical query workaround is not a user installation or update instruction')
    assert(body.includes(language === 'de' ? 'nicht automatisch auslesen' : 'cannot automatically read'))
    assert((await page.getByTestId('claude-plugin-update-guide').innerText()).includes(plugin.version),
      'the version comparison must use the same publication as the downloadable artifact')
    assert((await finish.getByTestId('claude-plugin-install-step-connector').innerText()).includes('skillpilot'))
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
      await guide.locator(':scope > summary').click()
      await marketplace.scrollIntoViewIfNeeded()
      assert(await guide.locator(':scope > summary').isVisible(), 'the collapsed alternative stays visible in both viewport sizes')
      if (process.env.SKILLPILOT_PLUGIN_GUIDE_SCREENSHOT_DIR) {
        await page.screenshot({ path: `${process.env.SKILLPILOT_PLUGIN_GUIDE_SCREENSHOT_DIR}/${language}-${width}-marketplace.png` })
      }
      await updateMode.click()
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${language} Marketplace update instructions fit the ${width}px viewport`)
      if (process.env.SKILLPILOT_PLUGIN_GUIDE_SCREENSHOT_DIR) {
        await page.screenshot({ path: `${process.env.SKILLPILOT_PLUGIN_GUIDE_SCREENSHOT_DIR}/${language}-${width}-update.png` })
      }
      await installMode.click()
      await guide.locator(':scope > summary').click()
    }
    responseIndex = futureIndex
    await page.goto(fixtureUrl)
    await guide.locator(':scope > summary').click()
    await downloadLink.waitFor()
    await assertPublishedVersion(futurePlugin)
    publicationAvailable = false
    await page.goto(fixtureUrl)
    await page.getByRole('alert').waitFor()
    await assertUnavailableVersionSafety()
    assert.equal(await downloadLink.count(), 0, 'failed index load offers no stale download')
    assert.doesNotMatch(await page.locator('body').innerText(), /\b[0-9]+\.[0-9]+\.[0-9]+\b/u,
      'failed index load offers no stale or guessed version')
    assert(await marketplace.isVisible(), 'an index failure does not block the independent Marketplace route')
    assert.equal(await openClaude.getAttribute('href'), CLAUDE_PLUGINS_DISCOVER_URL)
    await updateMode.click()
    assert((await page.getByTestId('claude-plugin-marketplace-navigation').innerText()).includes(
      language === 'de' ? 'Nach Updates suchen' : 'Check for updates'))
    await guide.locator(':scope > summary').click()
    assert.equal(await downloadLink.count(), 0, 'the expanded fallback does not retain a stale download after an index error')
    assert.equal(await guide.locator('[data-testid^="claude-plugin-install-step-"]').count(), 3)
    assert((await page.locator('body').innerText()).includes('Claude Pro'))
    publicationAvailable = true
    responseIndex = structuredClone(futureIndex)
    responseIndex.plugins[0]!.downloadUrl = plugin.downloadUrl
    await page.getByRole('button', { name: language === 'de' ? 'Erneut versuchen' : 'Try again', exact: true }).click()
    await page.getByRole('alert').waitFor()
    await assertUnavailableVersionSafety()
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
  console.log(`Claude plugin guide browser regression passed: ${CLAUDE_MARKETPLACE_INSTALLATION_ENABLED ? 'approved Marketplace guide and file fallback' : 'candidate file guide with Marketplace disabled'}, DE/EN, dynamic versions, loading/errors/retry, exact download bytes, mobile, no installation claim.`)
} finally {
  await browser.close()
  await server.close()
}
