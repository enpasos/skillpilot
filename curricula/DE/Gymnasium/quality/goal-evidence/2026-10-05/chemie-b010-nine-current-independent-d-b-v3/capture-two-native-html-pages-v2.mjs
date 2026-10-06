// SPDX-License-Identifier: Apache-2.0
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFile, writeFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const author = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-five-corrected-image-current-candidate-v3')
const input = resolve(author, 'native-finalbook/bundle/book.html')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const browser = await chromium.launch({ headless: true })
const routedAssets = []
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 1 })
  await page.route('http://skillpilot-review.local/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/book.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: await readFile(input) })
    if (!pathname.startsWith('/assets/goal-visualizations/chemie/')) throw new Error(`Unexpected local resource: ${pathname}`)
    let source = resolve(author, 'prospective-input-tree/app/public', '.' + pathname)
    try { await access(source) } catch { source = resolve(root, 'app/public', '.' + pathname) }
    const body = await readFile(source)
    routedAssets.push({ imageUrl: pathname, actualSourcePath: source, actualSHA256: sha(body) })
    await route.fulfill({ contentType: pathname.endsWith('.png') ? 'image/png' : 'image/jpeg', body })
  })
  await page.goto('http://skillpilot-review.local/book.html')
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0))
  const rows = []
  for (const goalId of ['16a80de2-b5e0-5467-a9b3-5860730d7d8b', '1f5ee84f-245a-5a1e-a260-f960f26523e9']) {
    const article = page.locator(`#goal-${goalId}`)
    const screenshot = resolve(own, 'actual-views', `${goalId}.native-html.png`)
    await article.screenshot({ path: screenshot })
    rows.push({ goalId, articleText: await article.innerText(), imageRows: await article.locator('img').evaluateAll(nodes => nodes.map(image => ({ alt: image.alt, src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight }))), screenshotPath: screenshot, screenshotSHA256: sha(await readFile(screenshot)) })
  }
  await writeFile(resolve(own, 'targeted-native-html.actual.receipt.json'), JSON.stringify({ inputPath: input, inputSHA256: sha(await readFile(input)), localRouteMethod: 'Exact unmodified frozen HTML and exact future image bytes served by Playwright local request fulfillment; no remote service or HTML edits', viewport: { width: 1000, height: 1400 }, capturedAtUTC: new Date().toISOString(), rows, routedAssets, activeWrites: 0, humanApproval: false }, null, 2) + '\n')
} finally {
  await browser.close()
}
