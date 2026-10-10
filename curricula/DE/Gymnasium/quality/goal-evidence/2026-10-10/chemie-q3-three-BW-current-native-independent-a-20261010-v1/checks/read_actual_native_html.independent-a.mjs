import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
const require = createRequire(resolve('app/package.json'))
const { chromium } = require('playwright')
const author = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-current-raster-native-preparation-author-20261010-v1')
const output = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-current-native-independent-a-20261010-v1')
const entry = JSON.parse(await readFile(resolve(author, 'neutral-current-three-BW-practical-current-P-native.independent-review.entry.json'), 'utf8'))
const html = await readFile(resolve(author, 'native/three-current-P/bundle/book.html'))
const pngs = new Map(entry.actualPNGAndAccessibleMetadataInputs.map(({goalId, actualPNG}) => [`/assets/goal-visualizations/chemie/${goalId}/${goalId}.png`, resolve(actualPNG.path)]))
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1000, height: 1600 }, deviceScaleFactor: 1 })
const failures = []
await page.route('**/*', async route => {
  const url = new URL(route.request().url())
  if (url.host !== 'native-review.local') { failures.push(url.pathname); await route.abort(); return }
  if (url.pathname === '/book.html') { await route.fulfill({contentType:'text/html',body:html}); return }
  if (pngs.has(url.pathname)) { await route.fulfill({contentType:'image/png',body:await readFile(pngs.get(url.pathname))}); return }
  failures.push(url.pathname); await route.abort()
})
await page.goto('http://native-review.local/book.html', {waitUntil:'networkidle'})
await page.evaluate(() => Promise.all(Array.from(document.images).map(img => img.decode())))
const pages=[]
for (const goalId of entry.goalIds) {
 const article = page.locator(`[data-goal-id="${goalId}"]`)
 await article.screenshot({path: resolve(output, `views/actual-native-html-${goalId}.png`)})
 pages.push(await article.evaluate(el => ({goalId:el.getAttribute('data-goal-id'),text:el.innerText,images:[...el.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),alt:i.alt,complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height})),links:[...el.querySelectorAll('a')].map(a=>({text:a.textContent,href:a.getAttribute('href')})),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth})))
}
await writeFile(resolve(output,'checks/actual-native-html-browser-reading.independent-a.actual.json'), JSON.stringify({schemaVersion:1,actualUnmodifiedHtmlPath:entry.actualNativeHTML.path,viewport:{width:1000,height:1600},allImagesLoaded:pages.every(p=>p.images.length===1&&p.images[0].complete&&p.images[0].naturalWidth===1672&&p.images[0].naturalHeight===941),outOfBoundRequests:failures,pages},null,2)+'\n')
await browser.close()
if (failures.length) throw new Error('Out-of-bound request during actual native reading')
console.log('Actual unchanged native HTML viewed with all 3 exact PNGs; no remote requests.')
