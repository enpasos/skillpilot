import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, type Page } from 'playwright'
import { createServer } from 'vite'
import { complexLearningMapFixture } from '../prototypes/learning-map.complex.fixture'
import { learningMapFixture } from '../prototypes/learning-map.fixture'
import type { LearningMapFixture } from '../src/components/learningUnitMap/types'

const root = fileURLToPath(new URL('../', import.meta.url))
const artifacts = fileURLToPath(new URL('../../tmp/learning-map-netron-review/', import.meta.url))
const vite = await createServer({
  root, configFile: `${root}/prototypes/vite.config.ts`, logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false, ws: false },
})
await vite.listen()
const address = vite.httpServer?.address()
assert.ok(address && typeof address !== 'string')
const server = { baseUrl: `http://127.0.0.1:${address.port}`, close: () => vite.close() }
const browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--disable-dev-shm-usage', '--no-sandbox'] })
const rejectedRequests: string[] = []
const pageErrors: string[] = []
let stage = 'startup'
let lastPage: Page | null = null

async function pageFor(width: number, height: number, touch = false, example: 'small' | 'complex' = 'small') {
  const context = await browser.newContext({
    viewport: { width, height }, hasTouch: touch, isMobile: touch,
    reducedMotion: 'reduce', serviceWorkers: 'block',
  })
  await context.route('**/*', route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin !== server.baseUrl || /^\/(api|oauth2|login|__[^/]*)(\/|$)/.test(url.pathname)
      || !['GET', 'HEAD'].includes(request.method())) {
      rejectedRequests.push(`${request.method()} ${url.origin}${url.pathname}`)
      return route.abort()
    }
    return route.continue()
  })
  const page = await context.newPage()
  lastPage = page
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.goto(`${server.baseUrl}/prototypes/learning-map.html?example=${example}`)
  await settled(page, example === 'small' ? 'demo:root' : complexLearningMapFixture.rootId)
  return page
}

async function settled(page: Page, scope: string) {
  await page.waitForFunction(expected => {
    const canvas = document.querySelector('.lum-canvas')
    return canvas?.getAttribute('data-scope-id') === expected
      && canvas.getAttribute('aria-busy') === 'false'
  }, scope)
}

async function ids(page: Page) {
  return page.locator('.react-flow__nodes [data-entry-id]').evaluateAll(elements =>
    elements.map(element => element.getAttribute('data-entry-id')).sort())
}

async function open(page: Page, id: string, expectedScope = id) {
  await page.locator(`[data-entry-id="${id}"] .lum-node-open`).click()
  await settled(page, expectedScope)
}

async function camera(page: Page) {
  return page.locator('.react-flow__viewport').evaluate(element => getComputedStyle(element).transform)
}

function authoredRoutes(fixture: LearningMapFixture, scopeId: string) {
  const children = new Set(fixture.entries[scopeId].children ?? [])
  return [...children].flatMap(id => fixture.entries[id].requires.filter(ref => children.has(ref))
    .map(ref => `sibling:${ref}->${id}`)).sort()
}

async function assertScopeRoutes(page: Page, fixture: LearningMapFixture, scopeId: string) {
  const expected = authoredRoutes(fixture, scopeId)
  await page.waitForFunction(count => document.querySelectorAll('.react-flow__edge').length === count, expected.length)
  assert.deepEqual(await page.locator('.react-flow__edge').evaluateAll(elements => elements
    .map(element => element.getAttribute('data-id')).sort()), expected)
}

async function shiftDoubleClickPane(page: Page) {
  const pane = page.locator('.react-flow__pane')
  const point = await pane.evaluate(element => {
    const bounds = element.getBoundingClientRect()
    for (const x of [0.08, 0.92, 0.5, 0.2, 0.8]) for (const y of [0.75, 0.4, 0.6, 0.2]) {
      if (document.elementFromPoint(bounds.x + bounds.width * x, bounds.y + bounds.height * y) === element) {
        return { x: bounds.width * x, y: bounds.height * y }
      }
    }
    return null
  })
  assert.ok(point, 'A genuine free canvas point is available for Shift + double click')
  await pane.dblclick({ modifiers: ['Shift'], position: point })
}

async function logicalPositions(page: Page) {
  // MiniMap reads all logical ReactFlow nodes. The main canvas intentionally
  // culls offscreen cards, so its DOM count is not the graph's node count.
  return page.locator('.react-flow__minimap-node').evaluateAll(elements => elements.map(element => ({
    x: Number(element.getAttribute('x')), y: Number(element.getAttribute('y')),
    width: Number(element.getAttribute('width')), height: Number(element.getAttribute('height')),
  })))
}

async function complexGeometry(page: Page, direction: 'RIGHT' | 'DOWN') {
  const roots = complexLearningMapFixture.entries[complexLearningMapFixture.rootId].children!
  await page.waitForFunction(count => document.querySelectorAll('.react-flow__minimap-node').length === count, roots.length)
  const boxes = await logicalPositions(page)
  assert.equal(boxes.length, 56, 'All logical siblings remain present even when cards are culled')
  for (const box of boxes) {
    assert.ok(Object.values(box).every(Number.isFinite))
    assert.equal(box.width, 220)
    assert.equal(box.height, 72)
  }
  for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
    const first = boxes[a], second = boxes[b]
    assert.ok(first.x + first.width <= second.x + 0.1 || second.x + second.width <= first.x + 0.1
      || first.y + first.height <= second.y + 0.1 || second.y + second.height <= first.y + 0.1,
    `Logical cards overlap: ${roots[a]} / ${roots[b]}`)
  }
  for (const [index, id] of roots.entries()) for (const required of complexLearningMapFixture.entries[id].requires) {
    const source = roots.indexOf(required)
    if (source < 0) continue
    const first = boxes[source], second = boxes[index]
    assert.ok(direction === 'RIGHT' ? first.x + first.width <= second.x + 0.1
      : first.y + first.height <= second.y + 0.1, `Preparation must precede application: ${required} -> ${id}`)
  }
  return boxes
}

async function fitComplex(page: Page) {
  await page.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
  await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge').length === 98)
  const expected = authoredRoutes(complexLearningMapFixture, complexLearningMapFixture.rootId)
  const routes = await page.locator('.react-flow__edge').evaluateAll(elements => elements.map(element => ({
    id: element.getAttribute('data-id'),
    path: element.querySelector<SVGPathElement>('.react-flow__edge-path')?.getAttribute('d') ?? '',
    length: element.querySelector<SVGPathElement>('.react-flow__edge-path')?.getTotalLength() ?? 0,
  })))
  assert.deepEqual(routes.map(route => route.id).sort(), expected)
  assert.ok(routes.every(route => route.path && !/NaN|Infinity/.test(route.path) && route.length > 0), 'All 98 routes have finite visible SVG paths')
}

async function pinchOn(page: Page, id: string, halves: number[]) {
  const bounds = await page.locator(`[data-entry-id="${id}"]`).boundingBox()
  assert.ok(bounds)
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  const session = await page.context().newCDPSession(page)
  const points = (half: number) => [
    { x: x - half, y, id: 1 }, { x: x + half, y, id: 2 },
  ]
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(halves[0]) })
  for (const half of halves.slice(1)) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(half) })
    await page.waitForTimeout(40)
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
}

try {
  await mkdir(artifacts, { recursive: true })
  stage = 'small desktop navigation'
  const page = await pageFor(1440, 1000)
  assert.deepEqual(await ids(page), ['demo:mechanics', 'demo:models', 'demo:motion', 'demo:tools'])
  const edges = await page.locator('.react-flow__edge').evaluateAll(elements =>
    elements.map(element => element.getAttribute('data-id')).sort())
  assert.deepEqual(edges, [
    'sibling:demo:mechanics->demo:motion', 'sibling:demo:models->demo:motion',
    'sibling:demo:tools->demo:mechanics', 'sibling:demo:tools->demo:models',
  ])
  await page.screenshot({ path: `${artifacts}/01-overview.png` })

  // Geometric zoom/pan must be restored exactly after semantic navigation.
  await page.getByRole('button', { name: 'Karte vergrößern', exact: true }).click()
  const pane = await page.locator('.react-flow__pane').boundingBox()
  assert.ok(pane)
  await page.mouse.move(pane.x + 35, pane.y + pane.height / 2)
  await page.mouse.down()
  await page.mouse.move(pane.x + 105, pane.y + pane.height / 2 + 35, { steps: 6 })
  await page.mouse.up()
  const rootCamera = await camera(page)
  await open(page, 'demo:mechanics')
  assert.deepEqual(await ids(page), ['demo:dynamics', 'demo:kinematics', 'demo:mechanics:motivation', 'demo:mechanics:synthesis'])
  await assertScopeRoutes(page, learningMapFixture, 'demo:mechanics')
  await page.screenshot({ path: `${artifacts}/02-mechanics.png` })
  const mechanicsCamera = await camera(page)

  // Enter and Space operate the same hierarchy as the explicit touch button.
  await page.locator('[data-entry-id="demo:kinematics"] .lum-node-main').focus()
  await page.keyboard.press('Enter')
  await settled(page, 'demo:kinematics')
  await assertScopeRoutes(page, learningMapFixture, 'demo:kinematics')
  await page.locator('[data-entry-id="demo:uniform"] .lum-node-main').focus()
  await page.keyboard.press('Space')
  await settled(page, 'demo:uniform')
  assert.deepEqual(await ids(page), [
    'demo:uniform:assessment', 'demo:uniform:linear', 'demo:uniform:memory',
    'demo:uniform:motivation', 'demo:uniform:quantities',
  ])
  assert.equal(await page.locator('[data-entry-id="demo:tools:units"]').count(), 0)
  await assertScopeRoutes(page, learningMapFixture, 'demo:uniform')
  const quantities = page.locator('[data-entry-id="demo:uniform:quantities"]')
  assert.equal(await quantities.locator('.lum-node-open').count(), 0, 'A leaf has no scope-opening action')
  await quantities.locator('.lum-node-main').click()
  await page.getByRole('complementary').waitFor()
  assert.match(await page.getByRole('complementary').innerText(), /Größen und Einheiten/)
  await page.screenshot({ path: `${artifacts}/03-inner-detail.png` })
  await page.keyboard.press('Escape')
  await settled(page, 'demo:uniform')
  await page.keyboard.press('Escape')
  await settled(page, 'demo:kinematics')
  await page.keyboard.press('Escape')
  await settled(page, 'demo:mechanics')
  assert.equal(await camera(page), mechanicsCamera)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await settled(page, 'demo:root')
  assert.equal(await camera(page), rootCamera)

  stage = 'normal and Shift double-click hierarchy navigation'
  await page.locator('[data-entry-id="demo:mechanics"] .lum-node-main').dblclick()
  await settled(page, 'demo:mechanics')
  await page.locator('[data-entry-id="demo:kinematics"] .lum-node-main').dblclick({ modifiers: ['Shift'] })
  await settled(page, 'demo:root')
  assert.equal(await page.getByRole('complementary').count(), 0)
  assert.equal(await camera(page), rootCamera)
  await open(page, 'demo:mechanics')
  await open(page, 'demo:kinematics')
  await shiftDoubleClickPane(page)
  await settled(page, 'demo:mechanics')
  assert.equal(await page.getByRole('complementary').count(), 0)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await settled(page, 'demo:root')

  // Direct breadcrumb return must preserve the overview camera too.
  await open(page, 'demo:mechanics')
  await open(page, 'demo:kinematics')
  await page.getByRole('navigation', { name: 'Aktuelle Kartenebene' }).getByRole('button', { name: 'Übersicht', exact: true }).click()
  await settled(page, 'demo:root')
  assert.equal(await camera(page), rootCamera)

  // One wheel gesture changes one hierarchy level; momentum must not cascade.
  await page.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
  await page.waitForTimeout(800)
  await page.locator('[data-entry-id="demo:mechanics"]').hover()
  await page.mouse.wheel(0, -850)
  await settled(page, 'demo:mechanics')
  for (let step = 0; step < 8; step++) {
    await page.mouse.wheel(0, -40)
    await page.waitForTimeout(30)
  }
  await settled(page, 'demo:mechanics')
  await page.waitForTimeout(800)
  await page.mouse.wheel(0, 1800)
  await settled(page, 'demo:root')

  stage = 'complex overview and geometry'
  const complex = await pageFor(1440, 1000, false, 'complex')
  assert.match(await complex.locator('.lum-map-summary').innerText(), /56 Bereiche · 98 Verbindungen/)
  const complexRoot = complexLearningMapFixture.rootId
  const rootPositions = await complexGeometry(complex, 'RIGHT')
  assert.ok((await ids(complex)).every(id => id?.startsWith('demo:complex:')))
  await fitComplex(complex)
  await complex.screenshot({ path: `${artifacts}/complex-overview.png` })

  // Selecting an entry and revealing its information must not recalculate the
  // graph positions. Camera movement and viewport culling are allowed.
  await complex.locator('[data-entry-id="demo:complex:tools"] .lum-node-main').click()
  await complex.getByRole('complementary', { name: 'Ausgewählter Bereich' }).waitFor()
  assert.deepEqual(await complexGeometry(complex, 'RIGHT'), rootPositions)
  await complex.keyboard.press('Escape')
  assert.equal(await complex.getByRole('complementary').count(), 0)
  await settled(complex, complexRoot)

  stage = 'complex search and selection'
  const targetId = 'demo:complex:kinematics'
  const targetTitle = complexLearningMapFixture.entries[targetId].title
  assert.equal(targetTitle, 'Bewegungen beschreiben')
  await complex.getByRole('textbox', { name: 'In dieser Ebene suchen' }).fill(targetTitle)
  await complex.getByRole('listbox', { name: 'Suchtreffer' }).getByRole('option').first().click()
  const focused = complex.locator(`[data-entry-id="${targetId}"]`)
  await focused.waitFor()
  await complex.waitForFunction(id => document.querySelector(`[data-entry-id="${id}"] .lum-node-main`)?.getAttribute('aria-pressed') === 'true', targetId)
  assert.match(await complex.getByRole('complementary').innerText(), /Bewegungen beschreiben/)
  assert.equal(await focused.evaluate(element => element.classList.contains('is-focused')), true)
  assert.ok(await complex.locator('.react-flow__edge-path').evaluateAll(paths => paths.some(path => getComputedStyle(path).stroke === 'rgb(40, 112, 176)')),
    'Edges related to the selection are highlighted')
  assert.deepEqual(await complexGeometry(complex, 'RIGHT'), rootPositions)
  const canvasBounds = await complex.locator('.lum-canvas').boundingBox()
  const focusBounds = await focused.boundingBox()
  assert.ok(canvasBounds && focusBounds)
  const centerX = focusBounds.x + focusBounds.width / 2
  const centerY = focusBounds.y + focusBounds.height / 2
  assert.ok(Math.abs(centerX - canvasBounds.x - canvasBounds.width / 2) < canvasBounds.width / 4
    && Math.abs(centerY - canvasBounds.y - canvasBounds.height / 2) < canvasBounds.height / 4,
  'Search brings the selected area into the central part of the canvas')
  assert.ok((await ids(complex)).length < 56, 'Offscreen cards can be culled while all 56 logical nodes remain')
  await complex.screenshot({ path: `${artifacts}/complex-focus.png` })

  stage = 'complex direction and scene isolation'
  await complex.getByRole('button', { name: 'Lernrichtung drehen' }).click()
  await complex.getByRole('button', { name: 'Lernrichtung drehen' }).getAttribute('title').then(title => assert.match(title ?? '', /Von oben nach unten/))
  await settled(complex, complexRoot)
  const downPositions = await complexGeometry(complex, 'DOWN')
  assert.notDeepEqual(downPositions, rootPositions)
  await fitComplex(complex)
  assert.deepEqual(await complexGeometry(complex, 'DOWN'), downPositions)
  await complex.getByRole('combobox', { name: 'Beispielkarte' }).selectOption('small')
  await settled(complex, 'demo:root')
  assert.deepEqual(await ids(complex), ['demo:mechanics', 'demo:models', 'demo:motion', 'demo:tools'])
  assert.equal(await complex.getByRole('complementary').count(), 0)
  assert.equal(await complex.getByRole('textbox', { name: 'In dieser Ebene suchen' }).inputValue(), '')
  await open(complex, 'demo:mechanics')
  await complex.getByRole('combobox', { name: 'Beispielkarte' }).selectOption('complex')
  await settled(complex, complexRoot)
  assert.equal(await complex.getByRole('complementary').count(), 0)
  assert.deepEqual(await complexGeometry(complex, 'RIGHT'), rootPositions)
  assert.equal(await complex.getByRole('navigation', { name: 'Aktuelle Kartenebene' }).getByRole('button').count(), 1)
  // The bare entry now defaults to the complex example too.
  await complex.goto(`${server.baseUrl}/prototypes/learning-map.html`)
  await settled(complex, complexRoot)
  assert.equal(await complex.getByRole('combobox', { name: 'Beispielkarte' }).inputValue(), 'complex')

  stage = 'small mobile touch navigation'
  const mobile = await pageFor(390, 844, true)
  assert.equal(await mobile.locator('body').evaluate(element => element.scrollWidth <= window.innerWidth), true)
  await mobile.screenshot({ path: `${artifacts}/04-mobile-overview.png` })
  for (const id of ['demo:mechanics', 'demo:kinematics', 'demo:uniform']) {
    await mobile.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).tap()
    await mobile.locator(`[data-entry-id="${id}"] .lum-node-open`).tap()
    await settled(mobile, id)
  }
  await mobile.screenshot({ path: `${artifacts}/05-mobile-inner.png` })
  await mobile.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await settled(mobile, 'demo:kinematics')

  // Pinch navigation belongs to the map, never to native browser page zoom.
  stage = 'small mobile pinch'
  const touch = await pageFor(390, 844, true)
  await pinchOn(touch, 'demo:tools', [20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 80])
  await settled(touch, 'demo:tools')
  assert.equal(await touch.evaluate(() => window.visualViewport?.scale), 1)
  await touch.waitForTimeout(800)
  await pinchOn(touch, 'demo:tools:units', [80, 72, 64, 56, 48, 40, 32, 24, 16, 10])
  await settled(touch, 'demo:root')
  assert.equal(await touch.evaluate(() => window.visualViewport?.scale), 1)

  stage = 'complex mobile layout'
  const complexMobile = await pageFor(390, 844, true, 'complex')
  assert.equal(await complexMobile.locator('body').evaluate(element => element.scrollWidth <= window.innerWidth), true)
  assert.match(await complexMobile.locator('.lum-map-summary').innerText(), /56 Bereiche · 98 Verbindungen/)
  await complexMobile.locator('[data-entry-id="demo:complex:tools"] .lum-node-main').tap()
  await complexMobile.getByRole('complementary').waitFor()
  assert.equal(await complexMobile.evaluate(() => window.visualViewport?.scale), 1)
  await complexMobile.screenshot({ path: `${artifacts}/mobile.png` })
  await complexMobile.getByRole('complementary').getByRole('button', { name: 'Einheit öffnen' }).tap()
  await settled(complexMobile, 'demo:complex:tools')
  assert.ok((await ids(complexMobile)).every(id => id?.startsWith('demo:complex:tools:')))
  await complexMobile.getByRole('button', { name: 'Eine Ebene auftauchen' }).tap()
  await settled(complexMobile, complexRoot)

  assert.deepEqual(rejectedRequests, [], 'Prototype must not call production or learner APIs')
  assert.deepEqual(pageErrors, [], 'Prototype must render without browser errors')
  console.log('PASS: small three-level navigation/camera/wheel/touch, normal double-click and Shift double-click up; complex 56 logical nodes, 98 routes, culling, search/highlights, stable geometry, orientation, scene isolation and no API traffic')
  console.log(`Screenshots: ${artifacts}`)
} catch (error) {
  console.error({ stage, rejectedRequests, pageErrors })
  if (lastPage) await lastPage.screenshot({ path: `${artifacts}/failure.png` }).catch(() => undefined)
  throw error
} finally {
  await browser.close()
  await server.close()
}
