import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const [site, api, profilesFile] = process.argv.slice(2)
for (const url of [site, api]) assert.equal(new URL(url).hostname, '127.0.0.1')
const profiles = JSON.parse(await readFile(profilesFile, 'utf8'))
const readTask = async file => JSON.parse(await readFile(
  new URL('../../docs/concept/skill-graph/examples/hessen-physik-e1/' + file, import.meta.url), 'utf8'))
const tasks = { A: await readTask('wagen.json'), B: await readTask('wurf.json') }
const scope = await readTask('umfang.json')
const unitPartIds = [...scope.ownAssessmentGoalIds, ...scope.childAssessmentGoalIds]
const { unit, intro, exercises } = JSON.parse(await readFile(new URL(
  '../../curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json', import.meta.url), 'utf8'))
const contract = unit.assessmentContract
assert.equal(contract?.parts.length, 4, 'Expected the reviewed Hessen E.1 unit contract')
assert.deepEqual(new Set(contract.parts.map(part => part.goalId)), new Set(unitPartIds))
assert.deepEqual(new Set(contract.viewIds), new Set(scope.viewIds))
const browser = await chromium.launch({ args: ['--disable-background-networking'] })
const normalize = text => text.replace(/\s+/g, ' ').trim()
const readApi = async (id, suffix) => {
  const response = await fetch(api + '/api/ui/learners/' + id + suffix)
  assert.equal(response.status, 200, suffix)
  return response.json()
}
async function evidence(id) {
  const mastery = await readApi(id, '/mastery')
  const passes = await Promise.all(unitPartIds.map(goalId => readApi(id, '/exam-passes/' + goalId)))
  assert(Object.values(mastery.mastery).every(value => value === 0))
  assert(passes.every(receipts => Array.isArray(receipts) && receipts.length === 0))
  return { mastery, passes }
}
async function checkCard(page, task, lang) {
  const card = page.getByTestId('learner-current-goal')
  await card.getByRole('heading', { name: lang === 'de' ? task.title : task.titleEn, exact: true }).first().waitFor()
  const source = lang === 'de' ? task.examData.taskContent : task.examData.taskContentEn
  const visible = normalize(await card.innerText())
  const lines = source.split('\n').filter(Boolean)
  for (const line of lines.filter(l => !l.startsWith('|'))) {
    assert(visible.includes(normalize(line.replace(/^\d+\. /, '').replaceAll('**', ''))),
      'Incomplete learner-facing task')
  }
  const cells = lines.filter(l => l.startsWith('|') && !/^\|[ :|-]+$/.test(l))
    .map(l => l.slice(1, -1).split('|').map(normalize))
  const rendered = await card.locator('table tr').evaluateAll(rows =>
    rows.map(row => Array.from(row.cells, cell => cell.innerText.trim())))
  assert.deepEqual(rendered, cells)
  assert(!(await card.getByRole('heading').allTextContents()).some(t => /^(Lösung|Musterlösung|Solution|Model solution)$/i.test(t)))
}
async function check(duration, part, lang, start, mobile = false) {
  const task = tasks[part]
  const id = profiles[duration][start ? part : 'viewer']
  const before = await evidence(id)
  const context = await browser.newContext({
    locale: lang, serviceWorkers: 'block', reducedMotion: 'reduce', viewport: { width: mobile ? 390 : 1440, height: 900 },
  })
  try {
    await context.route('**/*', route => [site, api].includes(new URL(route.request().url()).origin)
      ? route.continue() : route.abort())
    const page = await context.newPage()
    page.setDefaultTimeout(90000)
    await page.goto(site + '/' + (start ? 'testlauf' : 'nativ') + '/' + duration + '/' + part + '?lang=' + lang)
    await checkCard(page, task, lang)
    assert.equal(new URL(page.url()).pathname, '/learner/' + task.id)
    const shortcut = page.getByTestId('selected-goal-assessment-shortcuts')
      .locator('a[href*="completionGoal=' + task.id + '"]').first()
    await shortcut.waitFor()
    if (start) {
      await shortcut.click()
      const launch = page.getByTestId('claude-plugin-start')
      const next = page.getByRole('button', { name: 'Weiter zu Schritt 2: Curriculum wählen' })
      if (!await launch.isVisible() && await next.isVisible()) await next.click()
      await launch.waitFor()
      const result = page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/claude/v1/launch'))
      await launch.click()
      const response = await result
      assert.equal(response.status(), 200)
      const accepted = response.request().postDataJSON().completionAssessment
      assert.equal(accepted.goalId, task.id)
      assert(!accepted.restartCurrent)
      const state = await readApi(id, '/state')
      assert.equal(state.levelCompletion.directAssessmentRunning, true)
      assert.equal(state.activeGoal.id ?? state.activeGoal.goalId, task.id)
    } else {
      const state = (await readApi(id, '/state')).levelCompletion
      assert.equal(state.requiredAssessmentCount, 5)
      assert.equal(state.masteredAssessmentCount, 0)
      assert.equal(state.complete, false)
      assert.equal(state.directAssessmentRunning, false)
      const panel = page.getByTestId('level-completion-card')
      assert.equal(state.unitAssessment?.revision, contract.revision)
      assert.equal(state.unitAssessment.passed, false)
      assert.deepEqual(new Set(state.unitAssessment.parts.map(row => row.goalId)), new Set(unitPartIds))
      assert(state.unitAssessment.parts.every(row => row.passed === false))
      assert.deepEqual(state.unitAssessment.planningCreditGoalIds, [])
      assert.deepEqual(new Set(state.unitAssessment.individuallyOpenGoalIds), new Set(contract.contentGoalIds))
      const summary = panel.getByTestId('unit-assessment-summary')
      await summary.getByText(lang === 'de' ? /0 von 4 Teilen bestanden/ : /0 of 4 parts passed/).first().click()
      const parts = summary.getByRole('list', { name: lang === 'de' ? 'Prüfungsteile' : 'Assessment parts' })
      assert.equal(await parts.getByRole('listitem').count(), unitPartIds.length)
      for (const part of state.unitAssessment.parts) {
        await parts.getByText(part.title[lang], { exact: true }).waitFor()
      }
      await summary.getByText(lang === 'de' ? 'Für deinen Lernplan angerechnet (0)'
        : 'Credited toward your learning plan (0)', { exact: true }).waitFor()
      const openCount = contract.contentGoalIds.length
      await summary.getByText(lang === 'de' ? `Einzeln noch nachzuweisen (${openCount})`
        : `Still awaiting individual evidence (${openCount})`, { exact: true }).waitFor()
      await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
      const map = page.getByTestId('learner-learning-map-dialog')
      const other = tasks[part === 'A' ? 'B' : 'A']
      const neighbor = map.locator('[data-entry-id="' + other.id + '"]').getByRole('button').first()
      const layoutError = map.getByTestId('learner-map-layout-error')
      try {
        await neighbor.or(layoutError).first().waitFor()
        if (await layoutError.isVisible()) {
          console.log(duration, part, lang, await layoutError.getByRole('paragraph').innerText())
          await layoutError.getByRole('button', { name: lang === 'de' ? 'Erneut versuchen' : 'Try again' }).click()
        }
        await neighbor.click()
      } catch (error) {
        throw new Error(`${duration}/${part}/${lang}: ${(await map.innerText()).slice(0, 1600)}`, { cause: error })
      }
      if (await map.isVisible()) await map.getByRole('button', { name: lang === 'de' ? 'Lernkarte schließen' : 'Close learning map' }).click()
      await checkCard(page, other, lang)
    }
    assert.deepEqual(await evidence(id), before)
    console.log(duration, part, lang, start ? 'Erststart' : 'Aufgabe und Kartenwechsel', mobile ? '390 px' : '', 'OK')
  } finally {
    await context.close()
  }
}
async function checkUnitAndChildCards(duration) {
  const { viewer, E1: section } = profiles[duration]
  const before = await evidence(viewer)
  const page = await browser.newPage({ reducedMotion: 'reduce', serviceWorkers: 'block' })
  page.setDefaultTimeout(90000)
  try {
    const entry = site + '/nativ/' + duration + '/'
    await page.goto(entry + 'E1')
    const card = page.getByTestId('learner-current-goal')
    await card.getByRole('heading', { name: 'E.1 Bewegungen und ihre Beschreibung', exact: true }).waitFor()
    assert.equal(decodeURIComponent(new URL(page.url()).pathname), '/learner/' + section)
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    await dialog.getByRole('button', { name: 'In E.1 Bewegungen und ihre Beschreibung hineinzoomen', exact: true }).click()
    await dialog.getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    await dialog.getByText(intro.de.promise, { exact: true }).waitFor()
    for (const exercise of exercises) {
      await dialog.getByRole('button', { name: 'Üben: ' + exercise.de.title, exact: true }).waitFor()
    }
    await dialog.getByRole('button', { name: 'Lernkarten zu E.1 üben', exact: true }).click()
    await page.getByText('Karte 1 von 9', { exact: true }).waitFor()
    const assessment = (await readApi(viewer, '/state')).levelCompletion.unitAssessment
    for (const [index, part] of ['C', 'D'].entries()) {
      const id = scope.childAssessmentGoalIds[index]
      const { title } = assessment.parts.find(row => row.goalId === id)
      for (const lang of ['de', 'en']) {
        await page.goto(entry + part + '?lang=' + lang)
        await card.getByRole('heading', { name: title[lang], exact: true }).waitFor()
        assert.equal(new URL(page.url()).pathname, '/learner/' + id)
        await card.getByText(lang === 'de' ? /17 von 20 BE/ : /17 out of 20 marks/).first().waitFor()
      }
    }
    assert.deepEqual(await evidence(viewer), before)
    console.log(duration, 'E.1-Einstieg und beide Untereinheitsprüfungen DE/EN OK')
  } finally {
    await page.close()
  }
}
try {
  // Each curriculum has its own viewer and a fresh learner per first attempt.
  for (const duration of ['G8', 'G9']) {
    for (const part of ['A', 'B']) {
      for (const lang of ['de', 'en']) await check(duration, part, lang, false)
    }
    if (duration === 'G9') await check(duration, 'B', 'de', false, true)
    await checkUnitAndChildCards(duration)
    for (const part of ['A', 'B']) await check(duration, part, 'de', true)
  }
} finally {
  await browser.close()
}
