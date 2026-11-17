import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const out = '/home/enpasos/projects/skillpilot/tmp/pipeline/laender-stufen/gesamt/final-v4/browser-he-v3'
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1720, height: 1000 }, reducedMotion: 'reduce' })
const errors = [], writes = [], boards = []
page.on('pageerror', error => errors.push(error.message))
await page.route('**/*', async route => {
  const request = route.request()
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
    writes.push(`${request.method()} ${new URL(request.url()).pathname}`)
    return route.abort()
  }
  return route.continue()
})
const titles = () => page.locator('.lum-node-main').evaluateAll(nodes => nodes.map(node => node.getAttribute('title')))
const open = async title => {
  await page.locator('[aria-label^="Lernkarte:"][aria-busy="false"]').waitFor()
  const button = page.locator('.lum-node-main').filter({ hasText: title }).first()
  await button.dblclick()
}
const record = async (name, level, shot) => {
  await page.locator('.lum-node-main').first().waitFor()
  assert.equal(await page.locator('.lum-legend-backward').count(), 0, name + level)
  assert.equal(await page.locator('[data-testid="learner-map-layout-error"]').count(), 0, name + level)
  const screenshot = shot ? `${out}/${name}-${level}.png` : null
  if (screenshot) await page.screenshot({ path: screenshot })
  boards.push({ name, level, titles: await titles(), screenshot })
}
try {
  for (const basis of ['CrossStage', 'SekII']) for (const dauer of ['G8', 'G9']) for (const kurs of ['GK', 'LK', 'GK-LK']) {
    const name = `${basis}-${dauer}-${kurs}`
    const fixtureName = `${basis === 'CrossStage' ? '' : basis + '-'}${dauer}-${kurs}-physik`
    const fixture = JSON.parse(readFileSync(`/home/enpasos/projects/skillpilot/app/tmp/hessen-kartenpruefung-final-v4/${fixtureName}.json`, 'utf8')).fixture
    const phaseId = Object.keys(fixture.entries).find(id => fixture.entries[id].title === 'Einführungsphase')
    const topicIds = Object.fromEntries(fixture.entries[phaseId].children.map(id => [fixture.entries[id].title.match(/^E\.([1-7]) /)?.[1], id]).filter(([n]) => n))
    assert.equal(Object.keys(topicIds).length, 7)
    const relations = fixture.scopeRelations[phaseId]
    const edges = relations.filter(r => r.unitOrder === 'declared')
    const reaches = (start, finish) => {
      const seen = new Set(), pending = [start]
      while (pending.length) {
        const id = pending.pop()
        if (seen.has(id)) continue
        seen.add(id)
        for (const edge of edges.filter(e => e.source === id)) {
          if (edge.target === finish) return true
          pending.push(edge.target)
        }
      }
      return false
    }
    for (const [from, to] of [[1, 2], [2, 3], [3, 4], [3, 5], [2, 6], [3, 7]]) {
      assert(reaches(topicIds[from], topicIds[to]), `${name}: missing real declared topic order ${from} -> ${to}`)
    }
    for (const from of [4, 5, 6, 7]) for (const to of [4, 5, 6, 7]) if (from !== to) {
      assert(!reaches(topicIds[from], topicIds[to]), `${name}: artificial optional topic order ${from} -> ${to}`)
      assert(!relations.some(r => r.source === topicIds[from] && r.target === topicIds[to]), `${name}: optional topics still linked`)
    }
    const shot = basis === 'CrossStage' && kurs === 'GK-LK'
    const params = new URLSearchParams({ basis, dauer, kurs, fach: 'physik', stufe: 'sek2' })
    await page.goto(`http://127.0.0.1:5199/tmp/hessen-kartenpruefung-final-v4/index.html?${params}`, { waitUntil: 'networkidle' })
    await open('Einführungsphase')
    await page.locator('.lum-node-main[title^="E.7 "]').waitFor()
    const fields = (await titles()).filter(title => /^E\.[1-7] /.test(title))
    assert.equal(fields.length, 7, name)
    for (let i = 1; i <= 7; i++) assert.equal(fields.filter(title => title.startsWith(`E.${i} `)).length, 1, name)
    for (let i = 4; i <= 7; i++) assert(fields.find(title => title.startsWith(`E.${i} `)).endsWith('(nicht verbindlich)'), name)
    await page.waitForFunction(() => {
      const first = document.querySelector('.lum-node-main[title^="E.1 "]')?.closest('.react-flow__node')?.getBoundingClientRect()
      const second = document.querySelector('.lum-node-main[title^="E.2 "]')?.closest('.react-flow__node')?.getBoundingClientRect()
      return first && second && first.right < second.left
    })
    await record(name, 'e-phase', shot)
    await open('E.1 Bewegungen und ihre Beschreibung')
    await page.waitForFunction(() => {
      const names = [...document.querySelectorAll('.lum-node-main')].map(n => n.getAttribute('title'))
      const key = names.join('|')
      const previous = window.__heBoardObservation
      window.__heBoardObservation = previous?.key === key ? previous : { key, since: performance.now() }
      return names.filter(n => n === 'Waagerechter Wurf analysieren').length === 1
        && names.filter(n => n === 'Bezugssysteme und Geschwindigkeitsüberlagerung').length === 1
        && performance.now() - window.__heBoardObservation.since > 250
    })
    assert((await titles()).includes('Bezugssysteme und Geschwindigkeitsüberlagerung'), name)
    assert.equal((await titles()).filter(title => title === 'Waagerechter Wurf analysieren').length, 1, name)
    assert.equal((await titles()).filter(title => title === 'Bezugssysteme und Geschwindigkeitsüberlagerung').length, 1, name)
    await record(name, 'e1', shot)
    await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
    await page.locator('.lum-node-main[title="E.3 Kreisbewegung (Wurf bei E.1)"]').waitFor()
    await open('E.3 Kreisbewegung (Wurf bei E.1)')
    await page.locator('.lum-node-main[title="Bahn- und Winkelgeschwindigkeit"]').waitFor()
    assert(!(await titles()).some(title => /Waagerechter Wurf|Geschwindigkeitsüberlagerung/.test(title)), name)
    await record(name, 'e3', shot)
    const q4Id = Object.keys(fixture.entries).find(id => fixture.entries[id].title === 'Q4')
    const srtId = fixture.entries[q4Id].children.find(id => fixture.entries[id].title === 'Spezielle Relativitätstheorie')
    const practiceId = fixture.entries[q4Id].children.find(id => fixture.entries[id].title === 'Übungen Q4')
    assert(srtId && practiceId, name + ': expected SRT and Q4 practice')
    const q4Relations = fixture.scopeRelations[q4Id]
    assert(!q4Relations.some(edge => edge.target === srtId), name + ': SRT must not depend on other Q4 units')
    assert(q4Relations.some(edge => edge.source === srtId && edge.target === practiceId), name + ': preserve actual SRT practice prerequisites')
    await page.goto(`http://127.0.0.1:5199/tmp/hessen-kartenpruefung-final-v4/index.html?${params}`, { waitUntil: 'networkidle' })
    await open('Q4')
    await page.locator('.lum-node-main[title="Spezielle Relativitätstheorie"]').waitFor()
    await page.waitForTimeout(350)
    await record(name, 'q4', shot)
    await open('Spezielle Relativitätstheorie')
    await page.locator('.lum-node-main[title="Relativitätspostulate formulieren und erläutern"]').waitFor()
    await page.waitForTimeout(350)
    await record(name, 'srt', shot)

    console.log(name + ': PASS — partial topic order, optional topics mutually independent, motion goals in E.1')
  }
  assert.deepEqual(errors, [])
  assert.deepEqual(writes, [])
  writeFileSync(`${out}/actual.json`, JSON.stringify({ at: new Date().toISOString(), contexts: 12, boards, errors, writes,
    basis: 'Read-only actual LearningUnitMap component using freshly exported backend views; no learner state written' }, null, 2) + '\n')
} catch (error) {
  await page.screenshot({ path: `${out}/failure.png` })
  writeFileSync(`${out}/failure.json`, JSON.stringify({ error: String(error), titles: await titles(), boards, errors, writes }, null, 2) + '\n')
  throw error
} finally { await browser.close() }
