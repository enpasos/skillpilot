import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import http from 'node:http'
import { fileURLToPath, pathToFileURL } from 'node:url'

const own = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(own, '../../../../../../..')
const author = path.resolve(own, '../chemie-q3-three-current402-live-context-author-20261012-v7')
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'))
const hash = p => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const ref = p => ({ path: path.relative(root, p), bytes: fs.statSync(p).size, sha256: hash(p) })
const Ajv = (await import(pathToFileURL(path.join(root, 'app/node_modules/ajv/dist/2020.js')))).default
const formats = (await import(pathToFileURL(path.join(root, 'app/node_modules/ajv-formats/dist/index.js')))).default
const ajv = new Ajv({ strict: false, allErrors: true })
formats(ajv)
const validate = ajv.compile(read(path.join(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const profiles = fs.readFileSync(path.join(author, 'positive/P3.current402.author.records.jsonl'), 'utf8').split('\n').filter(x => x.trim()).map(JSON.parse)
for (const profile of profiles) assert.ok(validate(profile), JSON.stringify(validate.errors))
assert.equal(profiles.length, 3)
const { chromium } = await import(pathToFileURL(path.join(root, 'app/node_modules/playwright/index.mjs')))
const observations = []
for (const context of ['whole402-three', 'source382-three']) {
  const native = path.join(author, 'native', context)
  const output = path.join(own, 'native', context)
  const requests = []
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(req.url.split('?')[0])
    const file = pathname === '/book.html' ? path.join(native, 'book.html') : path.join(author, 'native-public', pathname)
    if (!file.startsWith(author + path.sep) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return }
    requests.push(ref(file))
    res.setHeader('Content-Type', file.endsWith('.png') ? 'image/png' : 'text/html; charset=utf-8')
    res.end(fs.readFileSync(file))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run'] })
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 1300 } })
    await page.goto('http://127.0.0.1:' + server.address().port + '/book.html', { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const articles = await page.locator('article.goal-page').all()
    assert.equal(articles.length, 3)
    for (const article of articles) {
      const goalId = await article.getAttribute('data-goal-id')
      const img = article.locator('img')
      assert.equal(await img.count(), 1)
      const image = await img.evaluate(i => ({ complete: i.complete, width: i.naturalWidth, height: i.naturalHeight }))
      assert.ok(image.complete && image.width > 0 && image.height > 0)
      const text = await article.innerText()
      const profile = profiles.find(p => p.goalId === goalId)
      assert.ok(profile)
      assert.ok(text.includes(goalId), 'Full public goal ID must occur')
      const screenshot = path.join(output, goalId + '.independent-b-native-html.png')
      await article.screenshot({ path: screenshot })
      observations.push({ context, goalId, image, screenshot: ref(screenshot), nativeHTML: ref(path.join(native, 'book.html')), textCharacters: text.length })
    }
    observations.push({ context, loadedExactAssets: requests.filter(p => p.path.endsWith('.png')) })
  } finally {
    await browser.close()
    await new Promise(resolve => server.close(resolve))
  }
}
const result = { schemaVersion: 1, completedAt: new Date().toISOString(), result: 'PASS', P3NormalSchemaValid: 3, actualNativeHTMLGoalPagesRendered: 6, observations, authorWrites: false, machineValidationIsScientificApproval: false, HumanApproval: false, HumanTrial: false }
fs.writeFileSync(path.join(own, 'checks/native-P3.actual.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ result: result.result, P3NormalSchemaValid: 3, actualNativeHTMLGoalPagesRendered: 6 }))
