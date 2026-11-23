const { strict: assert } = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require(require.resolve('playwright', { paths: [path.resolve('app')] }))

const [site, destination] = process.argv.slice(2)
assert.ok(['localhost', '127.0.0.1'].includes(new URL(site).hostname))
assert.ok(destination)

// The open map receives all nested boards in the projection that drives the renderer.
function readProjection(node) {
  const key = Object.keys(node).find(key => key.startsWith('__reactFiber$'))
  for (let fiber = node[key]; fiber; fiber = fiber.return) {
    const fixture = fiber.memoizedProps?.fixture
    if (!fixture?.entries || !fixture.rootId || !fixture.scopeRelations) continue
    const entries = Object.values(fixture.entries)
    const boards = Object.entries(fixture.scopeRelations)
    return {
      root: fixture.rootId,
      goals: entries.filter(entry => !['unit', 'cluster'].includes(entry.kind)).map(entry => entry.id).sort(),
      units: entries.filter(entry => entry.kind === 'unit').length,
      scopes: boards.length,
      relations: boards.reduce((count, [, edges]) => count + edges.length, 0),
      backwards: boards.flatMap(([owner, edges]) => edges.filter(edge => edge.backward).map(edge =>
        [owner, edge.source, edge.target, edge.provenance.map(item => [item.requiredGoalId, item.dependentGoalId]).sort()])),
    }
  }
  throw new Error('The open map has no identifiable projection')
}

async function main() {
  const reports = []
  const browser = await chromium.launch()
  try {
    for (const route of ['/nativ/G8/E1', '/nativ/G9/E1', '/vergleich/mathematik']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
      try {
        page.setDefaultTimeout(120000)
        await page.goto(site + route, { waitUntil: 'commit' })
        // The entry route selects a disposable profile, then redirects into the learner view.
        // Wait for that navigation so a transient document cannot receive the map click.
        await page.waitForURL(url => url.pathname.startsWith('/learner/'), { waitUntil: 'domcontentloaded' })
        await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
        const flow = page.getByTestId('learner-learning-map-dialog').locator('.lum-flow--idle')
        await flow.waitFor()
        const result = await flow.evaluate(readProjection)
        assert.ok(result.goals.length && result.scopes && result.relations)
        reports.push({ route, ...result })
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(destination, JSON.stringify(reports, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
