// SPDX-License-Identifier: Apache-2.0
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
const root = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const directory = resolve(own, '9dff0360-c2e9-5e43-af8b-87e264281cf7')
const metadata = JSON.parse(readFileSync(resolve(directory, 'generation-v2.actual-tool-provenance.json'), 'utf8'))
const bytes = readFileSync(resolve(root, metadata.path))
if (createHash('sha256').update(bytes).digest('hex') !== metadata.sha256) throw new Error('Original changed')
const executablePath = '/home/enpasos/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome'
const browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const screenshots = []
try {
  for (const width of [360, 680]) {
    const page = await browser.newPage({ viewport: { width, height: 500 }, deviceScaleFactor: 1 })
    await page.setContent('<!doctype html><style>html,body{margin:0;padding:0}img{display:block;width:100%;height:auto;max-height:28rem;object-fit:contain}</style><img alt="Actual corrected systematics raster candidate" src="data:image/png;base64,' + bytes.toString('base64') + '">')
    await page.locator('img').evaluate(img => img.decode())
    const size = await page.locator('img').evaluate(img => ({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, renderedWidth: img.getBoundingClientRect().width, renderedHeight: img.getBoundingClientRect().height, documentWidth: document.documentElement.scrollWidth }))
    const path = resolve(directory, 'actual-v2-browser-' + width + '.png')
    if (existsSync(path)) throw new Error('Preserve screenshot')
    await page.locator('img').screenshot({ path })
    const out = readFileSync(path)
    screenshots.push({ path: relative(root, path), sha256: createHash('sha256').update(out).digest('hex'), bytes: out.length, ...size })
    await page.close()
  }
} finally { await browser.close() }
const result = { schemaVersion: 1, original: metadata, actualBrowser: executablePath, screenshots, rasterEdits: 0, imageApproval: false, strictGain: 0 }
const path = resolve(directory, 'actual-v2-browser360680.render.receipt.json')
if (existsSync(path)) throw new Error('Preserve receipt')
writeFileSync(path, JSON.stringify(result, null, 2) + '\n')
JSON.parse(readFileSync(path, 'utf8'))
console.log(JSON.stringify({ actualScreenshots: 2, widths: [360, 680], originalUnedited: true }))
