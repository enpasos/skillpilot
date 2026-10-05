// Apache-2.0. Real browser views; no programmatic image drawing or retouching.
const {chromium} = require('../../../../../../app/node_modules/playwright')
const fs = require('node:fs')
const crypto = require('node:crypto')
const path = require('node:path')
const own = __dirname
const source = path.join(own, 'efa24b77-0f98-5835-9d82-3e539ab20253.png')
const sha = p => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
;(async () => {
  const browser = await chromium.launch({headless:true})
  const observations = []
  for (const width of [360,680]) {
    const page = await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1})
    await page.setContent(`<body style="margin:0"><img style="display:block;width:${width}px;height:auto;max-height:448px;object-fit:contain" src="data:image/png;base64,${fs.readFileSync(source).toString('base64')}"></body>`)
    await page.locator('img').evaluate(img=>img.decode())
    const previewPath = path.join(own,`native-${width}.png`)
    const bounds = await page.locator('img').boundingBox()
    await page.locator('img').screenshot({path:previewPath})
    observations.push({width,bounds,previewPath:path.relative(process.cwd(),previewPath),previewSha256:sha(previewPath)})
    await page.close()
  }
  await browser.close()
  fs.writeFileSync(path.join(own,'native-widths.actual.receipt.json'),JSON.stringify({status:'candidate',method:'Actual Chromium CSS360/680, height cap448, contain, deviceScaleFactor1; no physical device or host acceptance',sourcePath:path.relative(process.cwd(),source),sourceSha256:sha(source),observations},null,2)+'\n')
  console.log('Captured 2 actual representations')
})().catch(e=>{console.error(e);process.exitCode=1})
