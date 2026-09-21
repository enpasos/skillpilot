import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const baseUrl = process.env.WHITEPAPER_CAPTURE_BASE_URL ?? 'http://localhost:4183'
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseUrl).hostname), 'capture must use a local Vite server')
const packagePath = new URL('../../content/physik-libre/1.0.0/package.json', import.meta.url)
interface SourceMaterial {
  title: string; url: string; resourceType: string; language: string; status: string
  goalIds: string[]; sections: string[]
}
interface SourcePackage {
  packageId: string; version: string; title: string; titleEn: string
  description: string; descriptionEn: string; provider: { name: string; url: string }
  access: string; aiUsage: string; status: string; materials: SourceMaterial[]
}
const sourcePackage = JSON.parse(await readFile(packagePath, 'utf8')) as SourcePackage
assert.equal(sourcePackage.status, 'active')
assert.equal(sourcePackage.materials.length, 4)
assert.ok(sourcePackage.materials.every((material) => material.status === 'active' && material.goalIds.length === 1))

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
})
try {
  for (const language of ['de', 'en'] as const) {
    for (const view of ['plan', 'materials'] as const) {
      const context = await browser.newContext({
        locale: language === 'de' ? 'de-DE' : 'en-GB',
        viewport: { width: 800, height: 1000 },
        deviceScaleFactor: 2,
        colorScheme: 'light',
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
      })
      const errors: string[] = []
      const apiRequests: string[] = []
      await context.addInitScript((lang) => {
        localStorage.clear()
        localStorage.setItem('skillpilot_lang', lang)
        localStorage.setItem('skillpilot_theme', 'light')
      }, language)
      await context.route('**/*', async (route) => {
        const request = route.request()
        const url = new URL(request.url())
        if (url.pathname.startsWith('/api/')) {
          apiRequests.push(`${request.method()} ${url.pathname}`)
          if (request.method() !== 'GET' || !url.pathname.startsWith('/api/ui/learners/whitepaper-demo/')) {
            errors.push(`Blocked non-fixture API request: ${request.method()} ${url.pathname}`)
            return route.abort()
          }
          if (url.pathname.endsWith('/content-selection')) {
            return route.fulfill({ json: {
              revision: 1,
              selectedPackageIds: [sourcePackage.packageId],
              packages: [{
                packageId: sourcePackage.packageId,
                version: sourcePackage.version,
                title: language === 'de' ? sourcePackage.title : sourcePackage.titleEn,
                description: language === 'de' ? sourcePackage.description : sourcePackage.descriptionEn,
                providerName: sourcePackage.provider.name,
                providerUrl: sourcePackage.provider.url,
                access: sourcePackage.access,
                aiUsage: sourcePackage.aiUsage,
                materialCount: sourcePackage.materials.length,
              }],
            } })
          }
          if (url.pathname.endsWith('/content-materials')) {
            // Match the actual package binding; never attach all four links to one goal.
            const materials = sourcePackage.materials.filter((material) => material.goalIds.includes(url.searchParams.get('goalId') ?? ''))
            assert.equal(materials.length, 1)
            return route.fulfill({ json: materials.map((material) => ({
              title: material.title, url: material.url, provider: sourcePackage.provider.name,
              resourceType: material.resourceType, language: material.language,
              sections: material.sections, access: sourcePackage.access, aiUsage: sourcePackage.aiUsage,
            })) })
          }
          errors.push(`Blocked unexpected fixture API request: ${url.pathname}`)
          return route.abort()
        }
        if (url.origin !== new URL(baseUrl).origin) {
          errors.push(`Blocked external request: ${url.origin}`)
          return route.abort()
        }
        return route.continue()
      })
      const page = await context.newPage()
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(`${baseUrl}/scripts/fixtures/whitepaperUiCapture.html?view=${view}&lang=${language}`)
      const capture = page.getByTestId('whitepaper-capture')
      if (view === 'plan') {
        await capture.getByRole('heading', { name: language === 'de' ? 'Heute' : 'Today', exact: true }).waitFor()
        assert.equal(await capture.getByTestId(/learner-plan-subject-/u).count(), 2)
        const math = capture.getByTestId('learner-plan-subject-mathematik')
        const physics = capture.getByTestId('learner-plan-subject-physik')
        await math.getByText(language === 'de' ? 'Tagesziel 1 von 3' : 'Daily target 1 of 3', { exact: true }).waitFor()
        await math.getByTestId('learner-plan-status-behind').getByText(language === 'de' ? '2 Lernziele im Rückstand' : '2 learning goals behind', { exact: true }).waitFor()
        await physics.getByText(language === 'de' ? 'Tagesziel erreicht' : 'Daily target reached', { exact: true }).waitFor()
        await physics.getByTestId('learner-plan-status-ahead').getByText(language === 'de' ? '1 Lernziel vorgearbeitet' : '1 learning goal ahead', { exact: true }).waitFor()
        assert.equal(await capture.getByTestId('learner-plan-active-goal').innerText(), language === 'de' ? 'Lineare Gleichungen lösen' : 'Solve linear equations')
        assert.equal(await capture.getByTestId('learner-plan-continue').isEnabled(), true)
        await capture.getByRole('button', { name: language === 'de' ? 'Zu Physik wechseln' : 'Switch to Physics' }).waitFor()
        assert.equal(await capture.getByTestId('learner-plan-switch').isEnabled(), true)
        assert.equal(apiRequests.length, 0, 'plan screenshot must not access any learner API')
      } else {
        await capture.getByText(language === 'de' ? '(1 aktiv)' : '(1 active)', { exact: true }).waitFor()
        await capture.getByRole('link', { name: /Physik Libre: Ort-Zeit-Diagramme deuten/u }).waitFor()
        assert.equal(await capture.getByRole('link').count(), 1)
        assert.equal(apiRequests.length, 2, 'only synthetic content-selection and material-resolution reads are allowed')
        assert.equal(await capture.locator('input[type="password"]').count(), 0,
          'material selection is an ordinary Cockpit setting without a separate key')
      }
      await page.evaluate(() => document.fonts.ready)
      await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })
      assert.equal(await page.locator('html').getAttribute('lang'), language)
      assert.ok(await capture.evaluate((element) => element.scrollWidth <= element.clientWidth), 'capture must not overflow')
      assert.deepEqual(errors, [])
      const output = new URL(`../../docs/whitepaper/${view === 'plan' ? 'learning-plan' : 'content-materials'}-ui.${language}.png`, import.meta.url)
      const png = await capture.screenshot({ path: fileURLToPath(output), animations: 'disabled' })
      console.log(JSON.stringify({ file: fileURLToPath(output), sha256: createHash('sha256').update(png).digest('hex'), cssBounds: await capture.boundingBox(), apiRequests }))
      await context.close()
    }
  }
} finally {
  await browser.close()
}
