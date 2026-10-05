const { chromium } = require('../../../../../../../app/node_modules/playwright')
const { readFileSync, writeFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { createHash } = require('node:crypto')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1'
;(async () => {
  const input = JSON.parse(readFileSync(resolve(own, 'input-receipt.json'), 'utf8'))
  const browser = await chromium.launch({ headless: true })
  const receipt = { observedAt: new Date().toISOString(), method: 'Playwright Chromium img element screenshot at exact CSS width; deviceScaleFactor=1; unchanged source image bytes', observations: [] }
  for (const q of input.visualizationQa.filter(q => q.canonicalAssetPath)) {
    const bytes = readFileSync(q.canonicalAssetPath)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    for (const width of [360, 680]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 })
      await page.setContent(`<html><body style="margin:0"><img style="display:block;width:${width}px;height:auto" src="data:image/jpeg;base64,${bytes.toString('base64')}"></body></html>`)
      await page.locator('img').evaluate(img => img.decode())
      const path = `${own}/native-${q.goalId}-${width}.png`
      await page.locator('img').screenshot({ path })
      receipt.observations.push({ goalId: q.goalId, sourcePath: q.canonicalAssetPath, sourceSha256: sha256, width, previewPath: path })
      await page.close()
    }
  }
  await browser.close()
  writeFileSync(resolve(own, 'native-image-widths.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
  console.log(`Captured ${receipt.observations.length} source image representations`)
})().catch(error => { console.error(error); process.exitCode = 1 })
