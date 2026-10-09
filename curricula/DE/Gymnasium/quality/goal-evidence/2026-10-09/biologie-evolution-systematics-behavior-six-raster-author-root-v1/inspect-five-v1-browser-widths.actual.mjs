// SPDX-License-Identifier: Apache-2.0
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(readFileSync(resolve(own, 'six-first-generated-PNGs.byte-exact-copy.actual.json'), 'utf8'))
const executablePath = '/home/enpasos/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'
const outputs = []
const browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
try {
  for (const row of manifest.images.filter(row => row.ordinal !== 2)) {
    const asset = resolve(root, row.path)
    const bytes = readFileSync(asset)
    if (createHash('sha256').update(bytes).digest('hex') !== row.sha256) throw new Error('Original bytes changed')
    const screenshots = []
    for (const width of [360, 680]) {
      const page = await browser.newPage({ viewport: { width, height: 500 }, deviceScaleFactor: 1 })
      await page.setContent('<!doctype html><style>html,body{margin:0;padding:0}img{display:block;width:100%;height:auto;max-height:28rem;object-fit:contain}</style><img alt="Actual unedited raster candidate" src="data:image/png;base64,' + bytes.toString('base64') + '">')
      await page.locator('img').evaluate(img => img.decode())
      const size = await page.locator('img').evaluate(img => ({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, renderedWidth: img.getBoundingClientRect().width, renderedHeight: img.getBoundingClientRect().height, documentWidth: document.documentElement.scrollWidth }))
      const path = resolve(dirname(asset), 'actual-v1-browser-' + width + '.png')
      if (existsSync(path)) throw new Error('Preserve existing screenshot')
      await page.locator('img').screenshot({ path })
      const output = readFileSync(path)
      screenshots.push({ path: relative(root, path), sha256: createHash('sha256').update(output).digest('hex'), bytes: output.length, ...size })
      await page.close()
    }
    outputs.push({ goalId: row.goalId, original: row, screenshots })
  }
} finally {
  await browser.close()
}
const result = { schemaVersion: 1, role: 'actual CSS-width screenshots; no pixel editing or review approval', actualBrowser: executablePath, images: outputs, rasterEdits: 0, imageApproval: false, activeWrites: false, strictGain: 0 }
const target = resolve(own, 'five-original-v1-browser360680.actual-render.receipt.json')
if (existsSync(target)) throw new Error('Preserve existing receipt')
writeFileSync(target, JSON.stringify(result, null, 2) + '\n')
JSON.parse(readFileSync(target, 'utf8'))
console.log(JSON.stringify({ actualGoalImages: outputs.length, actualScreenshots: outputs.length * 2, actualWidths: [360, 680], originalPNGsUnedited: true }))
