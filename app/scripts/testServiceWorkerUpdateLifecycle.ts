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
  a: createFixtureVersion('service-worker-silent-a'),
  b: createFixtureVersion('service-worker-silent-b'),
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

const readBuildId = (page: import('playwright').Page) =>
  page.locator('meta[name="skillpilot-build-id"]').getAttribute('content')

try {
  const context = await browser.newContext({ locale: 'de-DE', serviceWorkers: 'allow' })
  try {
    const firstPage = await context.newPage()
    await firstPage.goto(origin, { waitUntil: 'domcontentloaded' })
    await firstPage.evaluate(async () => { await navigator.serviceWorker.ready })
    await firstPage.reload({ waitUntil: 'domcontentloaded' })
    await firstPage.waitForFunction(() => navigator.serviceWorker.controller !== null)

    const secondPage = await context.newPage()
    await secondPage.goto(origin, { waitUntil: 'domcontentloaded' })
    await secondPage.waitForFunction(() => navigator.serviceWorker.controller !== null)

    assert.equal(await readBuildId(firstPage), versions.a.buildId)
    assert.equal(await readBuildId(secondPage), versions.a.buildId)

    currentVersion = versions.b
    await firstPage.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) throw new Error('No service-worker registration in browser fixture')
      await registration.update()
    })
    await firstPage.waitForFunction(
      async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting),
      undefined,
      { timeout: 10_000 },
    )

    assert.equal(
      await firstPage.getByText('Neue Version verfügbar', { exact: true }).count(),
      0,
      'the application must not render the removed update notice',
    )
    assert.equal(
      await firstPage.getByRole('button', { name: 'Neu laden', exact: true }).count(),
      0,
      'the application must not render the removed update action',
    )
    assert.equal(await readBuildId(firstPage), versions.a.buildId)

    await firstPage.close()
    assert.equal(
      await readBuildId(secondPage),
      versions.a.buildId,
      'closing a sibling tab must not reload or replace the version already shown',
    )

    await secondPage.close()
    await new Promise(resolve => globalThis.setTimeout(resolve, 1_000))

    const nextStart = await context.newPage()
    await nextStart.goto(origin, { waitUntil: 'domcontentloaded' })
    assert.equal(
      await readBuildId(nextStart),
      versions.b.buildId,
      'the waiting worker must activate naturally after all old clients close',
    )
    assert.equal(
      await nextStart.getByText('Neue Version verfügbar', { exact: true }).count(),
      0,
    )
  } finally {
    await context.close()
  }
} finally {
  await browser.close()
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  })
}

console.log('Silent service-worker update lifecycle passed.')
