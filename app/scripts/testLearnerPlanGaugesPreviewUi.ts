import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Locator } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/learnerPlanGaugesPreview.html',
  { plugins: [tailwindcss()] },
)

const assertEqualDialHeights = async (frame: Locator, viewport: string) => {
  const heights = await frame.locator('[data-testid^="learner-plan-subject-"]').evaluateAll((rows) => rows.map((row) => ({
    subject: row.getAttribute('data-testid'),
    period: row.querySelector('[data-testid="learner-plan-period-gauge"]')?.getBoundingClientRect().height,
    balance: row.querySelector('[data-testid="learner-plan-balance-gauge"]')?.getBoundingClientRect().height,
  })))
  assert.equal(heights.length, 2, `${viewport}: both subject rows render`)
  for (const { subject, period, balance } of heights) {
    assert.ok(period !== undefined && balance !== undefined && Math.abs(period - balance) <= 1,
      `${viewport}: ${subject} dial cards have equal height (${period}px vs ${balance}px)`)
  }
}

const assertMobileGaugeLayout = async (frame: Locator, viewport: string) => {
  const rows = await frame.locator('[data-testid^="learner-plan-subject-"]').evaluateAll((elements) => elements.map((row) => {
    const period = row.querySelector('[data-testid="learner-plan-period-gauge"]')!.getBoundingClientRect()
    const balance = row.querySelector('[data-testid="learner-plan-balance-gauge"]')!.getBoundingClientRect()
    const switchButton = row.querySelector('[data-testid="learner-plan-switch"]')?.getBoundingClientRect()
    const bounds = row.getBoundingClientRect()
    return {
      subject: row.getAttribute('data-testid'),
      rowLeft: bounds.left,
      rowRight: bounds.right,
      period: { left: period.left, right: period.right, top: period.top, bottom: period.bottom, width: period.width },
      balance: { left: balance.left, right: balance.right, top: balance.top, bottom: balance.bottom, width: balance.width },
      switchButton: switchButton ? {
        left: switchButton.left,
        right: switchButton.right,
        top: switchButton.top,
        width: switchButton.width,
      } : null,
      scrollWidth: row.scrollWidth,
      clientWidth: row.clientWidth,
    }
  }))
  assert.equal(rows.length, 2, `${viewport}: both subjects remain visible`)
  for (const row of rows) {
    assert.ok(row.period.width >= 110 && row.balance.width >= 110,
      `${viewport}: ${row.subject} gauges must each be readable: ${JSON.stringify(row)}`)
    assert.ok(Math.abs(row.period.top - row.balance.top) <= 2 && row.period.right + 4 <= row.balance.left,
      `${viewport}: ${row.subject} gauges sit side by side: ${JSON.stringify(row)}`)
    assert.ok(row.period.left >= row.rowLeft - 1 && row.balance.right <= row.rowRight + 1,
      `${viewport}: ${row.subject} gauges stay inside the subject row: ${JSON.stringify(row)}`)
    assert.ok(row.scrollWidth <= row.clientWidth,
      `${viewport}: ${row.subject} does not overflow horizontally: ${JSON.stringify(row)}`)
    if (row.switchButton) {
      assert.ok(row.switchButton.top >= Math.max(row.period.bottom, row.balance.bottom) + 4,
        `${viewport}: the subject switch follows the gauges: ${JSON.stringify(row)}`)
      assert.ok(row.switchButton.width >= row.balance.right - row.period.left - 2,
        `${viewport}: the subject switch uses the mobile row width: ${JSON.stringify(row)}`)
      assert.ok(row.switchButton.left >= row.rowLeft - 1 && row.switchButton.right <= row.rowRight + 1,
        `${viewport}: the subject switch stays inside the row: ${JSON.stringify(row)}`)
    }
  }
  const frameLayout = await frame.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }))
  assert.ok(frameLayout.scrollWidth <= frameLayout.clientWidth,
    `${viewport}: the preview frame does not overflow horizontally: ${JSON.stringify(frameLayout)}`)
}

type PaintTone = 'neutral' | 'blue' | 'red' | 'green' | 'other'

const toneOf = ({ css, rgb }: { css: string; rgb: number[] }): PaintTone => {
  const [red, green, blue] = rgb
  const high = Math.max(red, green, blue)
  const low = Math.min(red, green, blue)
  const delta = high - low
  if (delta < 55) return 'neutral'
  let hue = high === red ? ((green - blue) / delta) % 6
    : high === green ? (blue - red) / delta + 2 : (red - green) / delta + 4
  hue = (hue * 60 + 360) % 360
  if (hue < 20 || hue >= 340) return 'red'
  if (hue >= 80 && hue < 175) return 'green'
  if (hue >= 185 && hue < 275) return 'blue'
  assert.fail(`Unexpected gauge color ${css} (${rgb.join(', ')}, hue ${hue})`)
}

const assertGaugePalette = async (
  frame: Locator,
  view: string,
  periodProgress: { mathematik: number | null; physik: number | null },
  balanceNeedles: { mathematik: PaintTone; physik: PaintTone },
) => {
  const gauges = await frame.locator('[data-testid="learner-plan-period-gauge"], [data-testid="learner-plan-balance-gauge"]')
    .evaluateAll((cards) => cards.map((card) => {
      const svg = card.querySelector('svg')!
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      const paths = Array.from(svg.querySelectorAll('path'))
      const needle = svg.querySelector('line')
      const hub = svg.querySelector('circle')
      const colors = [
        ...paths.map((path) => getComputedStyle(path).stroke),
        ...(needle ? [getComputedStyle(needle).stroke] : []),
        ...(hub ? [getComputedStyle(hub).fill] : []),
      ]
      const paints = colors.map((css) => {
        context.fillStyle = css
        context.fillRect(0, 0, 1, 1)
        return { css, rgb: Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3) }
      })
      return {
        subject: card.closest('[data-testid^="learner-plan-subject-"]')?.getAttribute('data-testid')?.replace('learner-plan-subject-', ''),
        dial: card.getAttribute('data-testid') === 'learner-plan-period-gauge' ? 'period' : 'balance',
        gradientCount: svg.querySelectorAll('linearGradient, stop').length,
        arcs: paints.slice(0, paths.length),
        progressDash: paths[1]?.getAttribute('stroke-dasharray') ?? null,
        needle: needle ? paints[paths.length] : null,
        hub: hub ? paints[paths.length + (needle ? 1 : 0)] : null,
      }
    }))
  assert.equal(gauges.length, 4, `${view}: two dials for each subject`)
  for (const gauge of gauges) {
    assert.equal(gauge.gradientCount, 0, `${view}: ${gauge.dial} uses distinct, readable arc segments`)
    assert.ok(gauge.subject === 'mathematik' || gauge.subject === 'physik')
    const subject = gauge.subject
    if (gauge.dial === 'period') {
      const progress = periodProgress[subject]
      assert.deepEqual(gauge.arcs.map(toneOf), progress !== null && progress > 0
        ? ['neutral', 'blue'] : ['neutral'], `${view}: ${subject} period track/progress colors`)
      if (progress !== null && progress > 0) {
        assert.ok(gauge.progressDash && Math.abs(parseFloat(gauge.progressDash) - progress * 100) < 0.1,
          `${view}: ${subject} blue arc covers ${progress * 100}% of the period`)
      }
      assert.equal(gauge.needle ? toneOf(gauge.needle) : null, progress === null ? null : 'blue',
        `${view}: ${subject} period needle is blue when a target exists`)
      assert.equal(gauge.hub ? toneOf(gauge.hub) : null, progress === null ? null : 'blue')
    } else {
      assert.deepEqual(gauge.arcs.map(toneOf), ['neutral', 'red', 'green'],
        `${view}: ${subject} overall dial has red, neutral, and green zones`)
      assert.equal(gauge.needle ? toneOf(gauge.needle) : null, balanceNeedles[subject],
        `${view}: ${subject} overall needle matches backend severity/direction`)
      assert.equal(gauge.hub ? toneOf(gauge.hub) : null, balanceNeedles[subject])
    }
  }
}

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const page = await browser.newPage({ viewport: { width: 1700, height: 1000 }, locale: 'de-DE' })
  const errors: string[] = []
  const apiRequests: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url())
  })

  await page.goto(server.baseUrl + '/scripts/fixtures/learnerPlanGaugesPreview.html')
  await page.getByText('Visuelle Vorschau · Beispieldaten').waitFor()
  const frame = page.getByTestId('preview-frame')
  assert.equal(await page.getByTestId('preview-basis-WEEK').getAttribute('aria-pressed'), 'true')
  await frame.getByRole('heading', { name: 'Diese Woche' }).waitFor()
  await frame.getByTestId('learner-plan-subject-mathematik')
    .getByText('0 von 10 Zielen', { exact: true }).waitFor()
  await page.getByTestId('preview-basis-DAY').click()
  assert.equal(await frame.getByTestId('learner-plan-period-gauge').count(), 2)
  assert.equal(await frame.getByTestId('learner-plan-balance-gauge').count(), 2)
  await frame.getByTestId('learner-plan-subject-mathematik')
    .getByText('0 von 6 Zielen', { exact: true }).waitFor()
  await frame.getByTestId('learner-plan-subject-physik')
    .getByText('0 von 7 Zielen', { exact: true }).waitFor()
  await frame.getByText('Dein aktives Lernziel: Masse von Körpern messen und vergleichen').waitFor()
  assert.equal(await frame.getByRole('button', { name: 'Zu Mathematik wechseln' }).count(), 1)
  assert.equal(await frame.getByRole('button', { name: 'Einstellungen öffnen' }).count(), 0)
  assert.equal(await frame.getByRole('button', { name: 'Weiterlernen' }).count(), 0)
  assert.equal(await frame.getByText('Plandetails', { exact: true }).count(), 2)
  const mathDetails = frame.getByTestId('learner-plan-subject-mathematik').locator('details')
  await mathDetails.locator('summary').click()
  await mathDetails.getByText('Aktueller Planabschnitt', { exact: true }).waitFor()
  await mathDetails.getByText('Puffer', { exact: true }).waitFor()
  await mathDetails.getByText('0 von 4 Werktagen verbleiben', { exact: true }).waitFor()
  assert.equal(await mathDetails.getByText('Nächster Termin', { exact: true }).count(), 0)
  await mathDetails.locator('summary').click()
  const physicsDetails = frame.getByTestId('learner-plan-subject-physik').locator('details')
  await physicsDetails.locator('summary').click()
  await physicsDetails.getByText('Planzeitraum', { exact: true }).waitFor()
  assert.equal(await physicsDetails.getByText('Aktueller Planabschnitt', { exact: true }).count(), 0)
  assert.equal(await physicsDetails.getByText('Nächster Termin', { exact: true }).count(), 0)
  assert.equal(await physicsDetails.getByText('Puffer', { exact: true }).count(), 0)
  await physicsDetails.locator('summary').click()
  const desktopMath = frame.getByTestId('learner-plan-subject-mathematik')
  const desktopStatusBox = await desktopMath.getByRole('heading', { name: 'Mathematik' }).boundingBox()
  const desktopDialBox = await desktopMath.getByTestId('learner-plan-period-gauge').boundingBox()
  assert.ok(desktopStatusBox && desktopDialBox && desktopDialBox.x > desktopStatusBox.x + 150,
    'desktop subject row places the two dials to the right of its status')
  await assertEqualDialHeights(frame, 'desktop')
  await assertGaugePalette(frame, 'desktop day, light',
    { mathematik: 0, physik: 0 }, { mathematik: 'neutral', physik: 'red' })
  assert.equal(await frame.getByTestId('learner-plan-subject-physik')
    .getByTestId('learner-plan-balance-gauge').getAttribute('data-needle-position'), '-1')
  await frame.getByText('13 Lernziele im Rückstand', { exact: true }).waitFor()
  if (process.env.SKILLPILOT_ISSUE56_PREVIEW_SCREENSHOTS) {
    await frame.screenshot({ path: fileURLToPath(new URL('../../tmp/issue56-preview-panel-desktop.png', import.meta.url)) })
  }
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.waitForTimeout(500) // Let existing color transitions finish before checking or capturing dark mode.
  await assertGaugePalette(frame, 'desktop day, dark',
    { mathematik: 0, physik: 0 }, { mathematik: 'neutral', physik: 'red' })
  if (process.env.SKILLPILOT_ISSUE56_PREVIEW_SCREENSHOTS) {
    await frame.screenshot({ path: fileURLToPath(new URL('../../tmp/issue56-preview-panel-desktop-dark.png', import.meta.url)) })
  }
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await page.waitForTimeout(500)
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'de-DE' })
  await mobilePage.goto(server.baseUrl + '/scripts/fixtures/learnerPlanGaugesPreview.html')
  const mobileFrame = mobilePage.getByTestId('preview-frame')
  assert.equal(await mobilePage.getByTestId('preview-basis-WEEK').getAttribute('aria-pressed'), 'true')
  await mobilePage.getByTestId('preview-basis-DAY').click()
  await mobileFrame.getByTestId('learner-plan-subject-physik').waitFor()
  await assertEqualDialHeights(mobileFrame, '390px')
  await assertMobileGaugeLayout(mobileFrame, '390px viewport')
  await assertGaugePalette(mobileFrame, '390px day, light',
    { mathematik: 0, physik: 0 }, { mathematik: 'neutral', physik: 'red' })
  if (process.env.SKILLPILOT_ISSUE56_PREVIEW_SCREENSHOTS) {
    await mobileFrame.screenshot({ path: fileURLToPath(new URL('../../tmp/issue56-preview-panel-mobile.png', import.meta.url)) })
  }
  await mobilePage.evaluate(() => document.documentElement.classList.add('dark'))
  await mobilePage.waitForTimeout(500)
  await assertGaugePalette(mobileFrame, '390px day, dark',
    { mathematik: 0, physik: 0 }, { mathematik: 'neutral', physik: 'red' })
  await assertEqualDialHeights(mobileFrame, '390px dark')
  if (process.env.SKILLPILOT_ISSUE56_PREVIEW_SCREENSHOTS) {
    await mobileFrame.screenshot({ path: fileURLToPath(new URL('../../tmp/issue56-preview-panel-mobile-dark.png', import.meta.url)) })
  }
  await mobilePage.evaluate(() => document.documentElement.classList.remove('dark'))
  await mobilePage.waitForTimeout(500)
  await mobilePage.setViewportSize({ width: 320, height: 640 })
  await assertEqualDialHeights(mobileFrame, '320px')
  await assertMobileGaugeLayout(mobileFrame, '320px viewport')
  await assertGaugePalette(mobileFrame, '320px day, light',
    { mathematik: 0, physik: 0 }, { mathematik: 'neutral', physik: 'red' })
  await mobilePage.close()

  await page.getByTestId('preview-case-open').click()
  await frame.getByText('2 von 6 Zielen', { exact: true }).waitFor()
  await assertGaugePalette(frame, 'desktop day, partial/on track',
    { mathematik: 2 / 6, physik: 3 / 7 }, { mathematik: 'neutral', physik: 'neutral' })
  await page.getByTestId('preview-case-backlog').click()
  await frame.getByText('6 von 6 Zielen', { exact: true }).waitFor()
  await assertGaugePalette(frame, 'desktop day, full/backlog',
    { mathematik: 1, physik: 1 }, { mathematik: 'neutral', physik: 'red' })
  await page.getByTestId('preview-case-mild-ahead').click()
  await frame.getByText('2 Lernziele vorgearbeitet', { exact: true }).waitFor()
  await assertGaugePalette(frame, 'desktop day, mild ahead',
    { mathematik: 1, physik: 1 }, { mathematik: 'green', physik: 'green' })
  await page.getByTestId('preview-case-current').click()

  await page.getByTestId('preview-basis-WEEK').click()
  await frame.getByText('0 von 10 Zielen', { exact: true }).waitFor()
  await frame.getByText('0 von 12 Zielen', { exact: true }).waitFor()
  await frame.getByRole('heading', { name: 'Diese Woche' }).waitFor()
  await assertGaugePalette(frame, 'desktop week, light',
    { mathematik: 0, physik: 0 }, { mathematik: 'neutral', physik: 'red' })
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.waitForTimeout(500)
  await assertGaugePalette(frame, 'desktop week, dark',
    { mathematik: 0, physik: 0 }, { mathematik: 'neutral', physik: 'red' })
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await page.waitForTimeout(500)
  await page.getByTestId('preview-case-open').click()
  await frame.getByText('6 von 10 Zielen', { exact: true }).waitFor()
  await assertGaugePalette(frame, 'desktop week, open',
    { mathematik: 0.6, physik: 8 / 12 }, { mathematik: 'neutral', physik: 'neutral' })
  if (process.env.SKILLPILOT_ISSUE56_PREVIEW_SCREENSHOTS) {
    await frame.screenshot({ path: fileURLToPath(new URL('../../tmp/issue56-preview-panel-week-open.png', import.meta.url)) })
  }
  assert.equal(await frame.getByTestId('learner-plan-subject-mathematik')
    .getByTestId('learner-plan-period-gauge').locator('svg path').count(), 2,
  'an unfinished but started period has a blue progress arc over the neutral track')
  await page.getByTestId('preview-case-backlog').click()
  assert.equal(await frame.getByText('10 von 10 Zielen', { exact: true }).count(), 1)
  await frame.getByText('13 Lernziele im Rückstand', { exact: true }).waitFor()
  assert.equal(await frame.getByTestId('learner-plan-subject-physik')
    .getByTestId('learner-plan-period-gauge').getAttribute('data-needle-position'), '1')
  await assertGaugePalette(frame, 'desktop week, full/backlog',
    { mathematik: 1, physik: 1 }, { mathematik: 'neutral', physik: 'red' })

  await page.getByTestId('preview-case-mild-ahead').click()
  await frame.getByText('1 Lernziel vorgearbeitet', { exact: true }).waitFor()
  await assertGaugePalette(frame, 'desktop week, mild ahead',
    { mathematik: 1, physik: 1 }, { mathematik: 'green', physik: 'green' })

  await page.getByTestId('preview-case-ahead').click()
  await frame.getByText('17 Lernziele vorgearbeitet', { exact: true }).waitFor()
  await assertGaugePalette(frame, 'desktop week, strong ahead',
    { mathematik: 1, physik: 1 }, { mathematik: 'green', physik: 'green' })
  if (process.env.SKILLPILOT_ISSUE56_PREVIEW_SCREENSHOTS) {
    await frame.screenshot({ path: fileURLToPath(new URL('../../tmp/issue56-preview-panel-week-ahead.png', import.meta.url)) })
  }
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.waitForTimeout(500)
  await assertGaugePalette(frame, 'desktop week, strong ahead/dark',
    { mathematik: 1, physik: 1 }, { mathematik: 'green', physik: 'green' })
  await page.evaluate(() => document.documentElement.classList.remove('dark'))
  await page.waitForTimeout(500)
  assert.equal(await frame.locator('[data-severity="strong-ahead"]').count(), 2)
  assert.equal(await frame.getByTestId('learner-plan-subject-physik')
    .getByTestId('learner-plan-balance-gauge').getAttribute('data-needle-position'), '1')

  await page.getByTestId('preview-case-no-target').click()
  assert.equal(await frame.getByText('Keine Ziele geplant', { exact: true }).count(), 2)
  await assertGaugePalette(frame, 'desktop week, no target',
    { mathematik: null, physik: null }, { mathematik: 'neutral', physik: 'red' })
  assert.equal(await frame.getByTestId('learner-plan-subject-mathematik')
    .getByTestId('learner-plan-period-gauge').getAttribute('data-needle-position'), null)
  await page.getByTestId('preview-case-unavailable').click()
  assert.equal(await frame.getByTestId('learner-plan-gauges-unavailable').count(), 1)
  assert.equal(await frame.getByTestId('learner-plan-subject-physik').locator('[data-needle-position]').count(), 0)
  await frame.getByRole('button', { name: 'Zu Mathematik wechseln' }).click()
  await page.getByText('Der Fachwechsel ändert keinen Lernstand.').waitFor()

  await page.getByTestId('preview-case-current').click()
  await page.getByTestId('preview-basis-DAY').click()
  await page.getByTestId('preview-mobile').click()
  await page.waitForFunction(() => {
    const frameElement = document.querySelector('[data-testid="preview-frame"]')
    return frameElement && frameElement.getBoundingClientRect().width <= 391
  })
  await assertMobileGaugeLayout(frame, '390px preview inside a 1700px viewport')
  if (process.env.SKILLPILOT_ISSUE56_PREVIEW_SCREENSHOTS) {
    await frame.screenshot({ path: fileURLToPath(new URL('../../tmp/issue56-preview-panel-mobile-embedded.png', import.meta.url)) })
  }
  await page.setViewportSize({ width: 320, height: 640 })
  await assertMobileGaugeLayout(frame, '320px preview viewport')
  const layout = await page.evaluate(() => {
    const frameElement = document.querySelector('[data-testid="preview-frame"]')!
    return {
      frameWidth: frameElement.getBoundingClientRect().width,
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }
  })
  assert.ok(layout.frameWidth <= layout.viewportWidth, JSON.stringify(layout))
  assert.ok(layout.scrollWidth <= layout.viewportWidth, JSON.stringify(layout))
  assert.deepEqual(apiRequests, [], 'the visual preview makes no backend requests')
  assert.deepEqual(errors, [], 'the preview has no browser runtime errors')
  console.log('Learner plan gauge preview browser smoke passed')
} finally {
  await browser?.close()
  await server.close()
}
