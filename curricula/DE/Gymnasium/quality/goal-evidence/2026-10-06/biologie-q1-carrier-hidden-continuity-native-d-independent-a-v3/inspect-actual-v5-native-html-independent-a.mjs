import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root = resolve('.')
const require = createRequire(resolve(root, 'app/package.json'))
const { chromium } = require('playwright')
const own = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-native-d-independent-a-v3')
assert(!existsSync(resolve(own, 'native-carrier-v5-d-p-independent-a.final.freeze.json')))
const author = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-carrier-hidden-continuity-and-length-targeted-author-v3')
const input = JSON.parse(readFileSync(resolve(author, 'round-a/description-review-input.json'), 'utf8'))
assert.equal(input.goals.length, 1)
const goal = input.goals[0]
const imageURL = goal.reviewContext.page.visualization.url
const imageBytes = readFileSync(resolve(root, 'app/public', imageURL.replace(/^\//u, '')))
const actualPNG = 'sha256:' + createHash('sha256').update(imageBytes).digest('hex')
assert.equal(actualPNG, goal.reviewContext.page.visualization.originalDigest)
writeFileSync(resolve(own, 'native-run-started-at.utc.txt'), new Date().toISOString() + '\n', { flag: 'wx' })
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 }, deviceScaleFactor: 1 })
  const unexpectedRequests = []
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://review.skillpilot.invalid') { unexpectedRequests.push(url.href); return route.abort() }
    if (url.pathname === '/book.html') return route.fulfill({ contentType: 'text/html', body: readFileSync(resolve(author, 'bundle/book.html')) })
    if (url.pathname === imageURL) return route.fulfill({ contentType: 'image/png', body: imageBytes })
    unexpectedRequests.push(url.href); return route.abort()
  })
  await page.goto('http://review.skillpilot.invalid/book.html', { waitUntil: 'networkidle' })
  const article = page.locator('#goal-' + goal.goalId)
  const actual = await article.evaluate(node => {
    const image = node.querySelector('img')
    return { title: node.querySelector('h2').textContent.trim(), description: node.querySelector('.goal-description').querySelector(':scope > p:not(.section-heading)').textContent.trim(),
      imageLoaded: image.complete && image.naturalWidth > 0, imageURL: image.getAttribute('src'), altText: image.getAttribute('alt'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
      actualArticleText: node.innerText, pageNumber: node.getAttribute('data-page-number') }
  })
  assert.equal(actual.title, goal.currentTitleDe); assert.equal(actual.description, goal.currentDescriptionDe)
  assert.equal(actual.imageURL, imageURL); assert.equal(actual.altText, goal.reviewContext.page.visualization.altText)
  assert(actual.imageLoaded); assert.equal(unexpectedRequests.length, 0)
  await article.screenshot({ path: resolve(own, 'actual-final-carrier-native-html-page.png') })
  writeFileSync(resolve(own, 'actual-final-carrier-html-browser-check.json'), JSON.stringify({ schemaVersion: 1, createdAtUTC: new Date().toISOString(), method: 'Unmodified native final HTML actually loaded in Chromium; only actual current exact PNG served; no live app/session requests', browserVersion: browser.version(), viewport: [900, 1400], actual, actualPNG, unexpectedRequests, titleDescriptionAltAndCurrentPNGExact: true, actualPrintHTMLIsNotFullCockpitAcceptance: true, roundBResultsRead: false, activeWrites: false }, null, 2) + '\n')
  console.log(JSON.stringify({ actualHTMLGoalCount: 1, actualImageLoaded: true, exactCurrentPNG: actualPNG, unexpectedRequests: 0 }))
} finally { await browser.close() }
