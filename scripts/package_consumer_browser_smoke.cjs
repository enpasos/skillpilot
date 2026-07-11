#!/usr/bin/env node
/* Execute the built React application against the package-only backend. */

'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const RUNTIME_ROOT = '/opt/skillpilot-runtime'
const OUTPUT_ROOT = '/opt/runtime-output'
const BASE_URL = 'http://127.0.0.1:18080'
const EXPECTED = JSON.parse(fs.readFileSync(path.join(RUNTIME_ROOT, 'expected.json'), 'utf8'))
const { chromium } = require(path.join(RUNTIME_ROOT, 'playwright/node_modules/playwright'))
const PLAYWRIGHT_VERSION = require(path.join(
  RUNTIME_ROOT,
  'playwright/node_modules/playwright/package.json',
)).version

// JSON.stringify's replacer array is not recursive-friendly for arbitrary
// evidence. Canonicalize first so every nested object uses sorted keys.
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
  }
  return value
}

const writeResult = (value) => {
  const target = path.join(OUTPUT_ROOT, 'browser-smoke.json')
  const temporary = `${target}.tmp-${process.pid}`
  fs.writeFileSync(temporary, `${JSON.stringify(canonicalize(value))}\n`, { encoding: 'utf8', flag: 'wx' })
  fs.renameSync(temporary, target)
}

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

const requireCondition = (condition, message) => {
  if (!condition) throw new Error(message)
}

const responseJson = async (response, label) => {
  requireCondition(response.ok(), `${label} returned ${response.status()}`)
  try {
    return await response.json()
  } catch (error) {
    throw new Error(`${label} returned invalid JSON: ${error.message}`)
  }
}

const findSkillpilotId = (value) => {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findSkillpilotId(child)
      if (found) return found
    }
  } else if (value && typeof value === 'object') {
    if (typeof value.skillpilotId === 'string' && value.skillpilotId) return value.skillpilotId
    for (const child of Object.values(value)) {
      const found = findSkillpilotId(child)
      if (found) return found
    }
  }
  return null
}

const normalizedUrl = (raw) => {
  try {
    return new URL(raw)
  } catch {
    return null
  }
}

const assertNoForbiddenRequests = (requests, label) => {
  const external = requests.filter((raw) => {
    const url = normalizedUrl(raw)
    return url && !['http:', 'data:', 'blob:', 'about:'].includes(url.protocol)
      || (url && url.protocol === 'http:' && url.origin !== BASE_URL)
  })
  requireCondition(external.length === 0, `${label} contacted an external origin: ${external.slice(0, 3)}`)
  const forbiddenData = requests.filter((raw) => {
    const url = normalizedUrl(raw)
    return url?.origin === BASE_URL && (
      url.pathname === '/data'
      || url.pathname.startsWith('/data/')
      || url.pathname.startsWith('/curricula/')
      || url.pathname.includes('goal-source-rationales-')
    )
  })
  requireCondition(forbiddenData.length === 0, `${label} attempted a repository/raw-data fallback: ${forbiddenData.slice(0, 3)}`)
}

const run = async () => {
  requireCondition(
    PLAYWRIGHT_VERSION === EXPECTED.playwrightVersion,
    `Playwright version differs: ${PLAYWRIGHT_VERSION} != ${EXPECTED.playwrightVersion}`,
  )
  requireCondition(fs.realpathSync(EXPECTED.browserExecutablePath) === EXPECTED.browserExecutablePath,
    'Chromium executable path is not canonical')

  const browser = await chromium.launch({
    executablePath: EXPECTED.browserExecutablePath,
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-background-networking',
      '--no-first-run',
      '--no-sandbox',
    ],
  })
  try {
    const context = await browser.newContext({
      baseURL: BASE_URL,
      locale: 'de-DE',
      serviceWorkers: 'block',
      viewport: { width: 1440, height: 1000 },
    })
    const api = context.request
    const catalogResponse = await api.get('/api/ui/curriculum-catalog')
    const catalog = await responseJson(catalogResponse, 'runtime catalog')
    requireCondition(catalog.generationSha256 === EXPECTED.activeLockSha256,
      'browser catalog generation differs from active lock')
    requireCondition(Array.isArray(catalog.rootLandscapeIds) && catalog.rootLandscapeIds.length > 0,
      'browser catalog has no root landscape')
    const rootId = catalog.rootLandscapeIds[0]
    const encodedRootId = encodeURIComponent(rootId)
    const landscapeResponse = await api.get(`/api/ui/landscapes/${encodedRootId}`)
    const landscape = await responseJson(landscapeResponse, 'root landscape')
    requireCondition(landscape.landscapeId === rootId, 'browser root landscape differs from catalog')
    const closureResponse = await api.get(`/api/ui/landscapes/${encodedRootId}/closure?lang=de`)
    const closure = await responseJson(closureResponse, 'landscape closure')
    requireCondition(Array.isArray(closure) && closure.length > 0, 'browser landscape closure is empty')

    const learnerResponse = await api.post('/api/ui/learners', { data: {} })
    const learner = await responseJson(learnerResponse, 'learner creation')
    const learnerId = findSkillpilotId(learner)
    requireCondition(learnerId, 'browser learner creation returned no SkillPilot ID')
    const selectionResponse = await api.put(`/api/ui/learners/${encodeURIComponent(learnerId)}/curriculum`, {
      data: { curriculumId: rootId },
    })
    requireCondition(selectionResponse.ok(), `browser learner curriculum selection returned ${selectionResponse.status()}`)

    const contentCandidates = closure.flatMap((entry) => Array.isArray(entry?.goals) ? entry.goals : [])
      .flatMap((goal) => [goal?.title, goal?.titleDe, goal?.description])
      .filter((value) => typeof value === 'string' && value.trim().length >= 4)
      .map((value) => value.trim())
      .slice(0, 500)
    requireCondition(contentCandidates.length > 0, 'browser closure contains no renderable goal text')

    await context.addInitScript(({ id, landscapeId }) => {
      localStorage.setItem('skillpilot_id', id)
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_learner_landscape', landscapeId)
      localStorage.setItem('skillpilot_lang', 'de')
      localStorage.setItem('skillpilot_legal_waiver_accepted', 'true')
    }, { id: learnerId, landscapeId: rootId })

    const page = await context.newPage()
    const requests = []
    const appResponses = []
    const pageErrors = []
    page.on('request', (request) => requests.push(request.url()))
    page.on('response', (response) => {
      const url = normalizedUrl(response.url())
      if (url?.origin === BASE_URL && url.pathname.startsWith('/api/')) {
        appResponses.push({ path: `${url.pathname}${url.search}`, status: response.status() })
      }
    })
    page.on('pageerror', (error) => pageErrors.push(error.message))
    const navigation = await page.goto(`/learner?l=${encodedRootId}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
    requireCondition(navigation?.status() === 200, `React app navigation returned ${navigation?.status()}`)
    await page.waitForFunction(() => document.querySelector('#root')?.childElementCount > 0, null, { timeout: 60000 })
    const renderedText = await page.waitForFunction((candidates) => {
      const text = document.body?.innerText ?? ''
      return candidates.find((candidate) => text.includes(candidate)) ?? null
    }, contentCandidates, { timeout: 120000 }).then((handle) => handle.jsonValue())
    requireCondition(typeof renderedText === 'string', 'React app rendered no package goal content')
    // These must be requests made by the application page, not only by the
    // API setup above. They prove the compiled JavaScript uses package APIs.
    const requiredPageResponses = [
      (item) => item.path.startsWith('/api/ui/curriculum-catalog') && item.status === 200,
      (item) => item.path.includes(`/api/ui/landscapes/${encodedRootId}/closure`) && item.status === 200,
      (item) => item.path.startsWith('/api/ui/composition-views/') && item.status === 200,
    ]
    for (const predicate of requiredPageResponses) {
      requireCondition(appResponses.some(predicate), `React app omitted a required package API response: ${JSON.stringify(appResponses.slice(0, 20))}`)
    }
    requireCondition(pageErrors.length === 0, `React app raised page errors: ${pageErrors.slice(0, 3)}`)
    assertNoForbiddenRequests(requests, 'React app')
    await page.screenshot({ path: path.join(OUTPUT_ROOT, 'browser-package-ui.png'), fullPage: false })
    const renderedBody = await page.locator('body').innerText()

    const failureContext = await browser.newContext({
      baseURL: BASE_URL,
      locale: 'de-DE',
      serviceWorkers: 'block',
      viewport: { width: 1024, height: 768 },
    })
    try {
      // Use an explorer session to keep the application past SessionSetup
      // without starting learner-scoped requests. The explicit runtime root in
      // the URL then makes the catalog-unavailable state directly observable.
      await failureContext.addInitScript(() => {
        localStorage.removeItem('skillpilot_id')
        localStorage.setItem('skillpilot_role', 'explorer')
        localStorage.removeItem('skillpilot_learner_landscape')
        localStorage.setItem('skillpilot_lang', 'de')
        localStorage.setItem('skillpilot_legal_waiver_accepted', 'true')
      })
      const failureRequests = []
      const failurePageErrors = []
      const failureConsoleErrors = []
      let interceptedCatalogRequests = 0
      await failureContext.route('**/api/ui/curriculum-catalog*', async (route) => {
        interceptedCatalogRequests += 1
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: '{"code":"SIMULATED_CATALOG_FAILURE"}\n',
        })
      })
      const failurePage = await failureContext.newPage()
      failurePage.on('request', (request) => failureRequests.push(request.url()))
      failurePage.on('pageerror', (error) => failurePageErrors.push(error.message))
      failurePage.on('console', (message) => {
        if (message.type() === 'error') failureConsoleErrors.push(message.text())
      })
      const failureNavigation = await failurePage.goto(`/explorer?l=${encodedRootId}`, {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      })
      requireCondition(failureNavigation?.status() === 200, `fail-closed app shell returned ${failureNavigation?.status()}`)
      const marker = failurePage.locator('[data-testid="runtime-catalog-error"]')
      try {
        await marker.waitFor({ state: 'visible', timeout: 30000 })
      } catch (error) {
        const bodyText = (await failurePage.locator('body').innerText()).slice(0, 2000)
        await failurePage.screenshot({ path: path.join(OUTPUT_ROOT, 'browser-catalog-fail-closed-debug.png'), fullPage: false })
        throw new Error(
          `fail-closed marker missing after ${interceptedCatalogRequests} intercepted catalog request(s); `
          + `body=${JSON.stringify(bodyText)}; pageErrors=${JSON.stringify(failurePageErrors.slice(0, 10))}; `
          + `consoleErrors=${JSON.stringify(failureConsoleErrors.slice(0, 10))}; `
          + `requests=${JSON.stringify(failureRequests.slice(0, 30))}; ${error.message}`,
        )
      }
      const failureText = await marker.innerText()
      requireCondition(failureText.includes('Curriculum catalog request failed (404)'),
        `fail-closed marker lacks catalog status: ${failureText}`)
      await failurePage.waitForTimeout(1000)
      requireCondition(interceptedCatalogRequests >= 1, 'fail-closed case did not request the runtime catalog')
      requireCondition(failurePageErrors.length === 0, `fail-closed page raised errors: ${failurePageErrors.slice(0, 3)}`)
      assertNoForbiddenRequests(failureRequests, 'fail-closed React app')
      const fallbackApiRequests = failureRequests.filter((raw) => {
        const url = normalizedUrl(raw)
        return url?.origin === BASE_URL && (
          url.pathname.startsWith('/api/ui/landscapes')
          || url.pathname.startsWith('/api/ui/composition-views')
        )
      })
      requireCondition(fallbackApiRequests.length === 0,
        `fail-closed app continued into landscape APIs: ${fallbackApiRequests.slice(0, 3)}`)
      await failurePage.screenshot({ path: path.join(OUTPUT_ROOT, 'browser-catalog-fail-closed.png'), fullPage: false })

      const evidence = {
        reportFormatVersion: 1,
        status: 'passed',
        browser: { engine: 'chromium', playwrightVersion: PLAYWRIGHT_VERSION },
        packageCase: {
          catalogGenerationSha256: catalog.generationSha256,
          rootLandscapeId: rootId,
          learnerId,
          renderedContent: renderedText,
          renderedBodyBytes: Buffer.byteLength(renderedBody),
          renderedBodySha256: sha256(renderedBody),
          requestCount: requests.length,
          apiResponses: appResponses,
          forbiddenRequestCount: 0,
        },
        failClosedCase: {
          interceptedCatalogRequests,
          marker: 'runtime-catalog-error',
          markerText: failureText,
          requestCount: failureRequests.length,
          forbiddenRequestCount: 0,
          fallbackApiRequestCount: 0,
        },
        diagnostics: [],
      }
      writeResult(evidence)
    } finally {
      await failureContext.close()
    }
    await context.close()
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  writeResult({
    reportFormatVersion: 1,
    status: 'failed',
    diagnostics: [{ code: 'BROWSER_SMOKE_FAILED', message: error?.stack ?? String(error) }],
  })
  process.stderr.write(`FAIL package-consumer browser smoke: ${error?.stack ?? error}\n`)
  process.exitCode = 1
})
