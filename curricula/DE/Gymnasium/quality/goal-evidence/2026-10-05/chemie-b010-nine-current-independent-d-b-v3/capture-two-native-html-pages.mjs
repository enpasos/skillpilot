// SPDX-License-Identifier: Apache-2.0
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const input = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-five-corrected-image-current-candidate-v3/native-finalbook/bundle/book.html')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 1 })
  await page.goto(pathToFileURL(input).href)
  await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0))
  const rows = []
  for (const goalId of ['16a80de2-b5e0-5467-a9b3-5860730d7d8b', '1f5ee84f-245a-5a1e-a260-f960f26523e9']) {
    const article = page.locator(`#goal-${goalId}`)
    const text = await article.innerText()
    const images = await article.locator('img').evaluateAll(nodes => nodes.map(image => ({ alt: image.alt, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, dataUrl: image.currentSrc })))
    const screenshot = resolve(own, 'actual-views', `${goalId}.native-html.png`)
    await article.screenshot({ path: screenshot })
    rows.push({ goalId, articleText: text, imageRows: images.map(({ dataUrl, ...image }) => ({ ...image, actualEmbeddedImageSHA256: sha(Buffer.from(dataUrl.split(',')[1], 'base64')) })), screenshotPath: screenshot, screenshotSHA256: sha(await readFile(screenshot)) })
  }
  await writeFile(resolve(own, 'targeted-native-html.actual.receipt.json'), JSON.stringify({ inputPath: input, inputSHA256: sha(await readFile(input)), viewport: { width: 1000, height: 1400 }, capturedAtUTC: new Date().toISOString(), rows, activeWrites: 0, humanApproval: false }, null, 2) + '\n')
} finally {
  await browser.close()
}
