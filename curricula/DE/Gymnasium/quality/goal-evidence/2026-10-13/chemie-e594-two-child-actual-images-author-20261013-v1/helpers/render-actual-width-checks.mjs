// Apache-2.0. Browser screenshots of untouched PNGs for actual size inspection.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-child-actual-images-author-20261013-v1'
const { chromium } = await import(pathToFileURL(resolve(root, 'app/node_modules/playwright/index.mjs')).href)
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const records = []
for (const id of ['981242bb-a729-5701-b02d-c2f7f489e5af', '53db04a0-ea76-5810-9526-c8639100e497']) {
  const assetPath = `${own}/candidate/visualizations/chemie/${id}/${id}.png`
  const bytes = readFileSync(resolve(root, assetPath))
  const pngURL = `data:image/png;base64,${bytes.toString('base64')}`
  mkdirSync(resolve(root, own, 'checks/actual-width-screenshots', id), { recursive: true })
  for (const width of [360, 680]) {
    const page = await browser.newPage({ viewport: { width, height: 448 }, deviceScaleFactor: 1 })
    await page.setContent(`<html><body style="margin:0;background:white"><img id="asset" src="${pngURL}" style="display:block;width:100%;max-width:680px;max-height:448px;object-fit:contain"></body></html>`)
    await page.locator('#asset').evaluate(el => el.decode())
    const bounds = await page.locator('#asset').boundingBox()
    const outputPath = `${own}/checks/actual-width-screenshots/${id}/${id}.width-${width}.png`
    await page.locator('#asset').screenshot({ path: resolve(root, outputPath) })
    const screenshot = readFileSync(resolve(root, outputPath))
    records.push({ goalId: id, untouchedAssetPath: assetPath, assetSha256: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, browserWidth: width, deviceScaleFactor: 1, imageBounds: bounds, maxImageHeight: 448, objectFit: 'contain', screenshotPath: outputPath, screenshotSha256: `sha256:${createHash('sha256').update(screenshot).digest('hex')}`, screenshotDoesNotEditCandidatePNG: true })
    await page.close()
  }
}
await browser.close()
writeFileSync(resolve(root, own, 'checks/actual-360-680-browser-width-receipts.json'), `${JSON.stringify({ screenshotPurpose: 'Inspection only, no candidate editing or runtime/UI acceptance', records }, null, 2)}\n`, { flag: 'wx' })
console.log(JSON.stringify({ actualBrowserWidthScreenshots: records.length, imageSourceNotModified: true }))
