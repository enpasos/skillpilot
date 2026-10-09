// SPDX-License-Identifier: Apache-2.0
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
const root = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const bind = path => {
  const data = readFileSync(path)
  return { path: relative(root, path), sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length }
}
const browser = await chromium.launch({ headless: true, executablePath: '/home/enpasos/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const images = []
try {
  for (const goalId of ['7d2da9ab-aed0-562b-a99a-840825fca009']) {
    const assetPath = resolve(own, 'candidate-v1.png')
    const bytes = readFileSync(assetPath)
    const screenshots = []
    for (const width of [360, 680]) {
      const page = await browser.newPage({ viewport: { width, height: 500 }, deviceScaleFactor: 1 })
      await page.setContent('<!doctype html><style>html,body{margin:0;padding:0}img{display:block;width:100%;height:auto;max-height:28rem;object-fit:contain}</style><img alt="Proposed ancestry and behaviour learning image" src="data:image/png;base64,' + bytes.toString('base64') + '">')
      await page.locator('img').evaluate(img => img.decode())
      const size = await page.locator('img').evaluate(img => ({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, renderedWidth: img.getBoundingClientRect().width, renderedHeight: img.getBoundingClientRect().height, documentWidth: document.documentElement.scrollWidth }))
      if (size.documentWidth !== width || size.renderedWidth !== width) throw new Error('Actual overflow')
      const path = resolve(own, 'actual-v1-browser-' + width + '.png')
      if (existsSync(path)) throw new Error('Preserve screenshot')
      await page.locator('img').screenshot({ path })
      screenshots.push({ ...bind(path), ...size })
      await page.close()
    }
    images.push({ goalId, original: bind(assetPath), screenshots, rasterEdits: 0 })
  }
} finally { await browser.close() }
const result = { schemaVersion: 1, role: 'Actual browser display captures; no scientific or visual approval', images, rasterEdits: 0, independentApproval: false, strictGain: 0 }
const path = resolve(own, 'one-actual-v1-360680-browser-capture.receipt.json')
if (existsSync(path)) throw new Error('Preserve receipt')
writeFileSync(path, JSON.stringify(result, null, 2) + '\n')
JSON.parse(readFileSync(path, 'utf8'))
console.log(JSON.stringify({ actualOriginals: 1, actualScreenshots: 2, widths: [360, 680], originalUnedited: true }))
