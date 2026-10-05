const { chromium } = require('../../../../../../app/node_modules/playwright')
const { readFileSync, writeFileSync } = require('node:fs')
const { createHash } = require('node:crypto')

const candidate = 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-two-and-b010-ion-lattice-candidate-20261005-v1'
const own = 'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-titration-b010-ion-lattice-independent-v-qa-20261005-v1'
const ids = ['02634fdd-c8ba-591a-b240-77129b1bebb8', '950c73c6-4ed1-488a-9267-1142e95e0055']
const sha = bytes => createHash('sha256').update(bytes).digest('hex')

;(async () => {
  const freezePath = `${candidate}/image-candidate.freeze.json`
  const freezeBytes = readFileSync(freezePath)
  const expectedFreezeSha = '84db6171b208285b67a4afc00cfe9d6e94c0bad8a040c24849f3c4f8a8316e35'
  if (sha(freezeBytes) !== expectedFreezeSha) throw new Error('Original freeze has changed')
  const freeze = JSON.parse(freezeBytes)
  for (const binding of freeze.files) {
    if (sha(readFileSync(binding.path)) !== binding.sha256) throw new Error(`Frozen input changed: ${binding.path}`)
  }
  const { assets } = JSON.parse(readFileSync(`${candidate}/three-generated-and-isolated-import.receipt.json`, 'utf8'))
  const browser = await chromium.launch({ headless: true })
  const views = []
  try {
    for (const goalId of ids) {
      const asset = assets.find(item => item.goalId === goalId)
      if (!asset) throw new Error(`Missing selected asset: ${goalId}`)
      const bytes = readFileSync(asset.path)
      if (sha(bytes) !== asset.sha256) throw new Error(`Selected asset changed: ${goalId}`)
      for (const width of [360, 680]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 })
        await page.setContent(`<body style="margin:0"><img style="display:block;width:${width}px;height:auto;max-height:448px;object-fit:contain" src="data:image/png;base64,${bytes.toString('base64')}"></body>`)
        const image = page.locator('img')
        await image.evaluate(element => element.decode())
        const decoded = await image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight }))
        const bounds = await image.boundingBox()
        if (decoded.width !== 1672 || decoded.height !== 941 || bounds.width !== width || Math.abs(bounds.height - width * 941 / 1672) > 0.05) {
          throw new Error(`Unexpected image representation: ${goalId}/${width}`)
        }
        const path = `${own}/${goalId.slice(0, 8)}.actual-${width}.png`
        await image.screenshot({ path })
        views.push({ goalId, sourcePath: asset.path, sourceSha256: asset.sha256, width, decoded, bounds, path, sha256: sha(readFileSync(path)) })
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }
  for (const binding of freeze.files) {
    if (sha(readFileSync(binding.path)) !== binding.sha256) throw new Error(`Frozen input changed during review: ${binding.path}`)
  }
  writeFileSync(`${own}/independent-width-capture.actual.receipt.json`, JSON.stringify({
    status: 'completed', authority: 'ai_candidate', sourceFreezePath: freezePath,
    sourceFreezeSha256: expectedFreezeSha, sourceFileCount: freeze.files.length,
    sourceFilesUnchanged: true,
    method: 'Independent Chromium rendering, CSS widths 360 and 680, deviceScaleFactor 1, max-height 448, contain; no physical-device or host acceptance',
    imageGeneration: false, activeWrites: false, humanApproval: false, views
  }, null, 2) + '\n')
  console.log('PASS: original frozen 31 inputs unchanged; independently rendered two selected PNGs at 360 and 680 CSS pixels without clipping')
})().catch(error => { console.error(error); process.exitCode = 1 })
