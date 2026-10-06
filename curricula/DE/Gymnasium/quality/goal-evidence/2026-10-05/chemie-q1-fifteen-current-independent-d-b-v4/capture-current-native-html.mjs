// SPDX-License-Identifier: Apache-2.0
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const own = dirname(fileURLToPath(import.meta.url)), root = resolve(own, '../../../../../../..')
const author = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-fourteen-current-native-candidate-v4')
const iso = resolve(root, 'tmp/chemie-q1-fourteen-current-native-physically-isolated-20261005-v4')
const input = resolve(author, 'native-finalbook/bundle/book.html')
const model = JSON.parse(await readFile(resolve(author, 'native-finalbook/bundle/book-model.json'), 'utf8'))
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const browser = await chromium.launch({ headless: true })
const routedAssets = []
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 1 })
  await page.route('http://skillpilot-review.local/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname === '/book.html') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: await readFile(input) })
    if (!pathname.startsWith('/assets/goal-visualizations/chemie/')) throw new Error(`Unexpected resource ${pathname}`)
    const source = resolve(iso, 'app/public', '.' + pathname), bytes = await readFile(source)
    routedAssets.push({ imageUrl: pathname, physicalInputSource: source, actualSHA256: sha(bytes) })
    await route.fulfill({ contentType: pathname.endsWith('.png') ? 'image/png' : 'image/jpeg', body: bytes })
  })
  await page.goto('http://skillpilot-review.local/book.html')
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0))
  const rows = []
  for (const goal of model.pages.filter(p=>p.goalId==='70b34ae7-4481-590c-9a02-516464750832')) {
    const article = page.locator(`#goal-${goal.goalId}`), screenshot = resolve(own, 'actual-views', `${goal.goalId}.native-html.png`)
    await article.screenshot({ path: screenshot })
    rows.push({ goalId: goal.goalId, articleText: await article.innerText(), screenshotPath: screenshot, screenshotSHA256: sha(await readFile(screenshot)), actualImages: await article.locator('img').evaluateAll(nodes => nodes.map(img => ({ src: img.getAttribute('src'), alt: img.alt, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }))) })
  }
  await writeFile(resolve(own, 'native-html.actual.receipt.json'), JSON.stringify({ recordedAt: new Date().toISOString(), exactUnmodifiedHTMLPath: input, exactHTMLSHA256: sha(await readFile(input)), physicalIsolatedAssetsOnly: true, viewport: { width: 1000, height: 1400 }, rows, routedAssets, activeWrites: 0, humanApproval: false }, null, 2) + '\n')
} finally { await browser.close() }
