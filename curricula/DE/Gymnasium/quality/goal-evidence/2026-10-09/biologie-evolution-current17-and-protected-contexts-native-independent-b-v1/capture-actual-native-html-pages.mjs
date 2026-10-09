// SPDX-License-Identifier: Apache-2.0
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { resolve, relative, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
const own = dirname(fileURLToPath(import.meta.url)), repo = resolve(own, '../../../../../../..')
const base = resolve(own, '../biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1')
const entry = JSON.parse(readFileSync(resolve(base, 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json'), 'utf8'))
const req = createRequire(resolve(repo, 'app/package.json')), { chromium } = req('playwright')
const server = createServer((r, s) => {
  const path = resolve(base, '.' + decodeURIComponent(new URL(r.url, 'http://127.0.0.1').pathname))
  try { if (!path.startsWith(base + '/') || !statSync(path).isFile()) throw Error('out-of-scope')
    s.setHeader('Content-Type', ({ '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' })[extname(path)] ?? 'application/octet-stream'); s.end(readFileSync(path))
  } catch { s.statusCode = 404; s.end('Not found') }
})
await new Promise(ok => server.listen(0, '127.0.0.1', ok))
const browser = await chromium.launch({ headless: true }), page = await browser.newPage({ viewport: { width: 1280, height: 1400 }, deviceScaleFactor: 1 })
const rows = []
try {
  for (const batch of entry.nativeBatches) {
    const route = relative(base, resolve(repo, batch.actualNativeHTML.path))
    await page.goto('http://127.0.0.1:' + server.address().port + '/' + route, { waitUntil: 'networkidle' })
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))) })
    for (const row of batch.pageMap) {
      const locator = page.locator('[data-goal-id="' + row.goalId + '"]')
      const path = resolve(own, 'actual-pages', row.selection + '.' + String(row.physicalPage).padStart(2, '0') + '.' + row.goalId + '.html.png')
      const status = await locator.evaluate(el => ({ text: el.innerText, imageRows: [...el.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), complete: i.complete, naturalWidth: i.naturalWidth, naturalHeight: i.naturalHeight, alt: i.alt })), elementBounds: { width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }))
      if (status.imageRows.some(i => !i.complete || !i.naturalWidth)) throw Error('unloaded actual image on ' + row.goalId)
      await locator.screenshot({ path })
      const bytes = readFileSync(path)
      rows.push({ ...row, actualHTMLSource: batch.actualNativeHTML, htmlCapture: { path: relative(repo, path), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }, status, individualInspectionStatus: 'PENDING' })
    }
  }
  writeFileSync(resolve(own, 'actual-native-html-pages.neutral-capture-index.json'), JSON.stringify({ schemaVersion: 1, role: 'actual-Chromium-HTML-page-captures-not-reviewed', pages: rows, license: 'CC-BY-4.0' }, null, 2) + '\n')
  console.log(JSON.stringify({ actualHTMLPages: rows.length, inspected: 0, activeWrites: false }))
} finally { await browser.close(); await new Promise(ok => server.close(ok)) }
