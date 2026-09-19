import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import { chromium } from 'playwright'
import { startViteTestServer } from './viteTestServer'
import { curriculumQualityStatuses, getCurriculumQualityCopy, maturityOrder } from '../src/utils/curriculumQualityPresentation'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(appRoot, 'scripts/fixtures/curriculumQualityTrafficLightUi.html', { plugins: [tailwindcss()] })
const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage', '--no-sandbox'] })
try {
  for (const language of ['de', 'en'] as const) for (const theme of ['light', 'dark'] as const) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 900 } })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript(({ language, theme }) => {
      localStorage.setItem('skillpilot_lang', language); localStorage.setItem('skillpilot_theme', theme)
    }, { language, theme })
    await page.goto(`${server.baseUrl}/scripts/fixtures/curriculumQualityTrafficLightUi.html`)
    const fixture = page.getByTestId('quality-filter-fixture')
    const copy = getCurriculumQualityCopy(language)
    await fixture.getByRole('button', { name: copy.filterOptions.all, exact: true }).waitFor()
    assert.equal(await fixture.getByRole('button', { name: copy.filterOptions.all, exact: true }).getAttribute('aria-pressed'), 'true')
    const options = () => fixture.locator('select option').evaluateAll((nodes) => nodes.map((n) => (n as HTMLOptionElement).value).filter(Boolean))
    assert.deepEqual((await options()).sort(), [...curriculumQualityStatuses, 'unknown'].sort())
    for (const status of curriculumQualityStatuses) {
      const button = fixture.getByRole('button', { name: copy.filterOptions[status], exact: true })
      await button.click()
      assert.equal(await button.getAttribute('aria-pressed'), 'true')
      assert.deepEqual((await options()).sort(), [status, 'unknown'].sort(), 'only server status matches; current unknown selection remains')
      assert.equal(await fixture.locator('select').inputValue(), 'unknown')
    }
    await fixture.getByRole('button', { name: copy.filterOptions.all, exact: true }).click()
    const legend = page.getByTestId('quality-legend')
    assert.equal(await legend.locator('[data-maturity]').count(), 8)
    const styles = await legend.locator('[data-maturity]').evaluateAll((nodes) => nodes.map((node) => ({
      level: node.getAttribute('data-maturity'), background: getComputedStyle(node).backgroundColor,
      label: node.getAttribute('aria-label'), color: getComputedStyle(node).color,
    })))
    assert.equal(new Set(styles.map((style) => style.background)).size, 8, `${theme}: eight actual rendered shades`)
    for (const [index, style] of styles.entries()) {
      assert.equal(style.level, maturityOrder[index]); assert(style.label?.includes(maturityOrder[index]))
      assert.notEqual(style.background, 'rgba(0, 0, 0, 0)')
    }
    for (const status of curriculumQualityStatuses) assert(await page.getByTestId('quality-statuses').getByText(copy.statusLabels[status], { exact: true }).isVisible())
    assert.equal(await page.getByTestId('single-curriculum-fixture').locator('select').inputValue(), 'experimental')
    assert.deepEqual(errors, [])
    if (language === 'de') {
      mkdirSync('../tmp/issue49', { recursive: true })
      await page.screenshot({ path: `../tmp/issue49/quality-presentation-${theme}.png`, fullPage: true })
    }
    await page.close()
  }

  const page = await browser.newPage()
  await page.addInitScript(() => localStorage.setItem('skillpilot_lang', 'de'))
  const rows = [{ landscapeId: 'math', title: 'Mathematik', maturity: 'M6', complete: 472 }, { landscapeId: 'physics', title: 'Physik', maturity: 'M7', complete: 478 }]
  await page.route('**/__quality-dashboard/status', (route) => route.fulfill({ json: {
    path: 'fixture.json', status: { schemaVersion: 1, rulesVersion: 'fixture', generatedAt: '2026-09-22T00:00:00Z', generatedBy: 'fixture',
      ruleCatalog: [{ id: 'CQR-303', label: 'Vertiefte QS', category: 'QA', maturityTarget: 'M7', description: 'Five gates' }],
      summary: { curricula: 2, maturity: { M6: 1, M7: 1 }, ruleStatus: { pass: 1, warn: 1, fail: 0, not_configured: 0 } },
      curricula: rows.map((row) => ({ ...row, path: `${row.landscapeId}.json`, goals: 478, atomicGoals: 478, clusterGoals: 0, scopes: [],
        rules: [{ id: 'CQR-303', status: row.complete === 478 ? 'pass' : 'warn', summary: 'Five gates', metrics: { expectedGoals: 478, strictComplete: row.complete, remaining: 478 - row.complete } }],
      })),
    },
  } }))
  let publicAvailable = true
  await page.route('**/api/ui/curricula', (route) => publicAvailable ? route.fulfill({ json: { curricula: [{ curriculumId: 'overview', qualityStatus: null, subjectQuality: [
    { landscapeId: 'math', qualityStatus: 'human_trial_in_progress', humanTrial: { state: 'in_progress', scopeLabel: 'Hessen Sek II', scopeCoverage: 'partial', requiredGoals: 10, practicedGoals: 3 } },
    { landscapeId: 'physics', qualityStatus: 'machine_qa' },
  ] }] } }) : route.fulfill({ status: 503, json: {} }))
  await page.goto(`${server.baseUrl}/scripts/fixtures/curriculumQualityTrafficLightUi.html?dashboard`)
  const progress = page.getByTestId('curriculum-deep-quality-progress')
  await progress.waitFor()
  assert((await progress.textContent())?.includes('472 von 478'))
  assert(await page.locator('tbody tr').filter({ hasText: 'Mathematik' }).getByText('Menschliche QS läuft', { exact: true }).isVisible())
  assert(await page.locator('tbody tr').filter({ hasText: 'Physik' }).getByText('Maschinelle QS', { exact: true }).isVisible(), 'M7 does not imply human testing')
  assert(await page.getByText('Hessen Sek II · Teilumfang', { exact: true }).isVisible())
  publicAvailable = false
  await page.getByRole('button', { name: 'Aktualisieren', exact: true }).click()
  await page.locator('tbody tr').filter({ hasText: 'Physik' }).getByText('Prüfstand nicht verfügbar', { exact: true }).waitFor()
  assert.equal(await page.getByText('Maschinelle QS', { exact: true }).count(), 0, 'failed refresh withdraws stale trial/QA claims')
  await page.close()
} finally {
  await browser.close(); await server.close()
}
console.log('curriculum quality filters, themes, labels and dashboard UI tests passed')
