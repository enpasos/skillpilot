import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { chromium } from '../../../../../../../app/node_modules/playwright/index.mjs'
import { renderGoalBookHtml } from '../../../../../../../app/scripts/goalBookRenderer'

const main = async () => {
  const out = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-stable-biologie369-checkpoint-dependency-qs-20261011-v1')
  const modelPath = resolve('app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json')
  const model = JSON.parse(readFileSync(modelPath, 'utf8'))
  const goalId = '1351706f-4ea6-56e9-951b-87b24cbcdee8'
  const goalPage = model.pages.find((page: { goalId: string }) => page.goalId === goalId)
  if (!goalPage) throw new Error('The final publication lacks the required current target page')
  const imagePath = resolve('app/public' + goalPage.visualization.url)
  const image = readFileSync(imagePath)
  const html = renderGoalBookHtml(model, {
    feedbackBaseUrl: 'https://skillpilot.com/lernziel-feedback',
    embeddedVisualizationByGoalId: { [goalId]: `data:image/png;base64,${image.toString('base64')}` },
  })
  writeFileSync(resolve(out, 'final-whole-published-chemistry.normal-renderer.html'), html)
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } })
    // Only the inspected target uses embedded original PNG bytes. Other pages
    // remain in the normal full DOM, but their images are outside this check.
    await page.route('**/assets/**', route => route.abort())
    await page.setContent(html, { waitUntil: 'load' })
    const target = page.locator(`#goal-${goalId}`)
    await target.scrollIntoViewIfNeeded()
    await target.locator('img').evaluateAll((images: HTMLImageElement[]) => Promise.all(images.map(image => image.decode())))
    await target.screenshot({ path: resolve(out, 'final-published-135.whole-html.png') })
    const actual = {
      schemaVersion: 1,
      kind: 'scoped-published-page-technical-capture',
      scienceApproval: false,
      humanApproval: false,
      goalId,
      publishedGoalPages: model.pages.length,
      normalWholeRendererUsed: true,
      otherPageImagesNotInspected: true,
      bookModelSha256: createHash('sha256').update(readFileSync(modelPath)).digest('hex'),
      imageSha256: createHash('sha256').update(image).digest('hex'),
      pageNumber: goalPage.pageNumber,
      pageFingerprint: goalPage.pageFingerprint,
      currentPageText: await target.innerText(),
      pixelCapture: 'final-published-135.whole-html.png',
    }
    writeFileSync(resolve(out, 'final-published-135.whole-html.capture.actual.json'), JSON.stringify(actual, null, 2) + '\n')
    console.log(`Captured final published page ${goalId}; ${model.pages.length} whole-model pages retained`)
  } finally {
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
