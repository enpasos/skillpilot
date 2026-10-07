import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
const require = createRequire(resolve('app/package.json'))
const { chromium } = require('playwright')
const root = resolve('.')
const own = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-d-independent-a-v1')
assert(!existsSync(resolve(own, 'independent-d-a.final.freeze.json')))
const author = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1')
const publicRoot = resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-new-visuals-author-v1/native-helper-output/app/public')
const input = JSON.parse(readFileSync(resolve(author, 'round-a/description-review-input.json'), 'utf8'))
const allowed = new Set(input.goals.map(goal => goal.reviewContext.page.visualization.url))
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 1300 }, deviceScaleFactor: 1 })
  const unexpectedRequests = []
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.origin !== 'http://review.skillpilot.invalid') { unexpectedRequests.push(url.href); return route.abort() }
    if (url.pathname === '/book.html') return route.fulfill({ contentType: 'text/html', body: readFileSync(resolve(author, 'bundle/book.html')) })
    if (allowed.has(url.pathname)) return route.fulfill({ contentType: 'image/png', body: readFileSync(resolve(publicRoot, url.pathname.replace(/^\//u, ''))) })
    unexpectedRequests.push(url.href)
    return route.abort()
  })
  await page.goto('http://review.skillpilot.invalid/book.html', { waitUntil: 'networkidle' })
  const rows = []
  for (const goal of input.goals) {
    const article = page.locator('#goal-' + goal.goalId)
    const result = await article.evaluate(node => {
      const image = node.querySelector('img')
      const description = node.querySelector('.goal-description')
      return { title: node.querySelector('h2').textContent.trim(),
        description: description.querySelector(':scope > p:not(.section-heading)').textContent.trim(),
        imageLoaded: image.complete && image.naturalWidth > 0,
        imageURL: image.getAttribute('src'), altText: image.getAttribute('alt'),
        naturalImageWidth: image.naturalWidth, naturalImageHeight: image.naturalHeight,
        pageNumber: node.getAttribute('data-page-number'),
        sectionCount: node.querySelectorAll('section').length }
    })
    assert.equal(result.title, goal.currentTitleDe)
    assert.equal(result.description, goal.currentDescriptionDe)
    assert.equal(result.imageURL, goal.reviewContext.page.visualization.url)
    assert.equal(result.altText, goal.reviewContext.page.visualization.altText)
    assert(result.imageLoaded)
    rows.push({ goalId: goal.goalId, ...result })
  }
  assert.equal(unexpectedRequests.length, 0)
  writeFileSync(resolve(own, 'actual-bound-html-browser-checks.json'), JSON.stringify({
    schemaVersion: 1, createdAtUTC: new Date().toISOString(),
    method: 'Actual immutable native HTML loaded in Chromium with every exact isolated PNG served; no rewritten HTML or live app/session access',
    viewport: [900, 1300], browserVersion: browser.version(), rows,
    unexpectedRequests, allSevenCurrentDescriptionsTitlesImagesAndAltTextsExact: true,
    htmlIsPrintBookNotCockpitResponsiveAcceptance: true,
    inheritedSeparate360_680ImageVReviewNotRepeated: true,
    roundBOrPeerDResultsRead: false, activeWrites: false,
  }, null, 2) + '\n')
  console.log(JSON.stringify({ actualHTMLGoalPages: rows.length, exactDescriptionsAndImages: true, unexpectedRequests: 0 }))
} finally { await browser.close() }
