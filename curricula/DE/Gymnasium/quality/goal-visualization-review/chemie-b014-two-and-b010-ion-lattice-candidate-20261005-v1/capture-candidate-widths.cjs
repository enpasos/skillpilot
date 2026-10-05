const { chromium } = require('../../../../../../app/node_modules/playwright')
const { readFileSync, writeFileSync } = require('node:fs')
const { createHash } = require('node:crypto')
const own = 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-two-and-b010-ion-lattice-candidate-20261005-v1'
;(async () => {
  const { assets } = JSON.parse(readFileSync(`${own}/three-generated-and-isolated-import.receipt.json`,'utf8'))
  const browser = await chromium.launch({headless:true})
  const observations = []
  for (const asset of assets) {
    const bytes = readFileSync(asset.path)
    for (const width of [360,680]) {
      const page = await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1})
      await page.setContent(`<body style="margin:0"><img style="display:block;width:${width}px;height:auto;max-height:448px;object-fit:contain" src="data:image/png;base64,${bytes.toString('base64')}"></body>`)
      await page.locator('img').evaluate(img=>img.decode())
      const previewPath = `${own}/${asset.goalId.slice(0,8)}/native-${width}.png`
      const bounds = await page.locator('img').boundingBox()
      await page.locator('img').screenshot({path:previewPath})
      observations.push({goalId:asset.goalId,sourcePath:asset.path,sourceSha256:asset.sha256,width,bounds,previewPath,previewSha256:createHash('sha256').update(readFileSync(previewPath)).digest('hex')})
      await page.close()
    }
  }
  await browser.close()
  writeFileSync(`${own}/native-widths.actual.receipt.json`,JSON.stringify({status:'candidate',method:'Actual Chromium CSS360/680, height cap448, contain, deviceScaleFactor1; no physical mobile or host acceptance',observations},null,2)+'\n')
  console.log(`Captured${observations.length} actual representations`)
})().catch(error=>{console.error(error);process.exitCode=1})
