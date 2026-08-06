import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const buildRoot = fileURLToPath(
  new URL('../../backend/src/main/resources/static/', import.meta.url),
)
const baseIndex = await readFile(path.join(buildRoot, 'index.html'), 'utf8')
const baseServiceWorker = await readFile(path.join(buildRoot, 'sw.js'), 'utf8')
const baseVersion = JSON.parse(
  await readFile(path.join(buildRoot, 'version.json'), 'utf8'),
) as Record<string, unknown>

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.ttf', 'font/ttf'],
  ['.webmanifest', 'application/manifest+json'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
])

type FixtureVersion = {
  buildId: string
  index: Buffer
  serviceWorker: Buffer
  version: Buffer
}

const createFixtureVersion = (buildId: string): FixtureVersion => {
  const indexHtml = baseIndex.replace(
    /(<meta\s+name="skillpilot-build-id"\s+content=")[^"]+("\s*>)/u,
    `$1${buildId}$2`,
  )
  assert.notEqual(indexHtml, baseIndex, 'the built index must expose a replaceable build ID')

  const indexRevision = createHash('md5').update(indexHtml).digest('hex')
  const serviceWorker = baseServiceWorker.replace(
    /(url:"index\.html",revision:")[^"]+("\})/u,
    `$1${indexRevision}$2`,
  )
  assert.notEqual(
    serviceWorker,
    baseServiceWorker,
    'the built worker must precache a revisioned index.html',
  )

  return {
    buildId,
    index: Buffer.from(indexHtml),
    serviceWorker: Buffer.from(serviceWorker),
    version: Buffer.from(JSON.stringify({ ...baseVersion, buildId })),
  }
}

const versions = {
  a: createFixtureVersion('service-worker-e2e-a'),
  b: createFixtureVersion('service-worker-e2e-b'),
  c: createFixtureVersion('service-worker-e2e-c'),
}
let currentVersion = versions.a

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
    const pathname = decodeURIComponent(requestUrl.pathname)

    if (pathname === '/' || pathname === '/index.html') {
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'text/html; charset=utf-8',
      })
      response.end(currentVersion.index)
      return
    }
    if (pathname === '/sw.js') {
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'text/javascript; charset=utf-8',
        'service-worker-allowed': '/',
      })
      response.end(currentVersion.serviceWorker)
      return
    }
    if (pathname === '/version.json') {
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-type': 'application/json; charset=utf-8',
      })
      response.end(currentVersion.version)
      return
    }

    const requestedPath = path.resolve(buildRoot, `.${pathname}`)
    const relativePath = path.relative(buildRoot, requestedPath)
    if (
      relativePath === ''
      || relativePath.startsWith(`..${path.sep}`)
      || path.isAbsolute(relativePath)
    ) {
      response.writeHead(403).end()
      return
    }

    const fileStats = await stat(requestedPath)
    if (!fileStats.isFile()) {
      response.writeHead(404).end()
      return
    }
    const content = await readFile(requestedPath)
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': mimeTypes.get(path.extname(requestedPath)) ?? 'application/octet-stream',
    })
    response.end(content)
  } catch {
    response.writeHead(404).end()
  }
})

await new Promise<void>((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', resolve)
})

const address = server.address()
assert(address && typeof address !== 'string', 'test server did not expose a TCP port')
const origin = `http://127.0.0.1:${address.port}`
const browser = await chromium.launch({
  headless: true,
  args: ['--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
})

const runUpdateScenario = async (
  latestVersionBeforeClick: FixtureVersion,
  controlledAtUpdate = true,
): Promise<void> => {
  currentVersion = versions.a
  const context = await browser.newContext({ locale: 'de-DE', serviceWorkers: 'allow' })
  try {
    const page = await context.newPage()
    await page.addInitScript(() => {
      localStorage.setItem('skillpilot_lang', 'de')
    })

    await page.goto(origin, { waitUntil: 'domcontentloaded' })
    await page.evaluate(async () => { await navigator.serviceWorker.ready })
    if (controlledAtUpdate) {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    } else {
      assert.equal(
        await page.evaluate(() => navigator.serviceWorker.controller),
        null,
        'the regression fixture must remain uncontrolled before the update',
      )

      // Keep one sibling tab controlled by A so B remains waiting long enough
      // for the initially uncontrolled tab to receive the update prompt. This
      // is the real multi-tab lifecycle in which Workbox's registration-time
      // `isUpdate` flag previously suppressed the reload in the first tab.
      const controlledPeer = await context.newPage()
      await controlledPeer.goto(origin, { waitUntil: 'domcontentloaded' })
      await controlledPeer.waitForFunction(() => navigator.serviceWorker.controller !== null)
    }

    assert.equal(
      await page.locator('meta[name="skillpilot-build-id"]').getAttribute('content'),
      versions.a.buildId,
      'the controlled fixture must start on version A',
    )

    currentVersion = versions.b
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        throw new Error('No service-worker registration in browser fixture')
      }
      await registration.update()
    })
    await page.getByText('Neue Version verfügbar', { exact: true }).waitFor()
    assert.equal(
      await page.locator('meta[name="skillpilot-build-id"]').getAttribute('content'),
      versions.a.buildId,
      'detecting a waiting worker must not reload before the user confirms the update',
    )

    currentVersion = latestVersionBeforeClick
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.getByRole('button', { name: 'Neu laden', exact: true }).click(),
    ])

    assert.equal(
      await page.locator('meta[name="skillpilot-build-id"]').getAttribute('content'),
      latestVersionBeforeClick.buildId,
      'one explicit update must activate the latest published application version',
    )
  } finally {
    await context.close()
  }
}

try {
  await runUpdateScenario(versions.b)

  // B is waiting when C is published. This reproduces the race that previously
  // reloaded the intermediate version and showed the notice a second time.
  await runUpdateScenario(versions.c)

  // A first-load tab has an active registration but no controller until its
  // next navigation. vite-plugin-pwa does not reload that tab after activation
  // because Workbox classified the initial registration as a non-update. The
  // application must perform the proven reload itself.
  await runUpdateScenario(versions.b, false)
} finally {
  await browser.close()
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  })
}

console.log('Controlled and initially uncontrolled service-worker update lifecycles passed.')
