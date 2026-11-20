import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const [site, api, profilesFile] = process.argv.slice(2)
for (const url of [site, api]) assert(['localhost', '127.0.0.1'].includes(new URL(url).hostname))
const numericSite = new URL(site)
numericSite.hostname = '127.0.0.1'
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
assert.deepEqual(contract.parts.map(part => part.goalId), unitPartIds)
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
async function check(duration, part, lang, start, width = 1440, height = 900) {
  const task = tasks[part]
  const entrySite = start && duration === 'G9' ? numericSite.origin : site
  const id = profiles[duration][start ? part : 'viewer']
  const before = await evidence(id)
  const context = await browser.newContext({
    locale: lang, serviceWorkers: 'block', reducedMotion: 'reduce', viewport: { width, height },
  })
  try {
    await context.route('**/*', route => [entrySite, api].includes(new URL(route.request().url()).origin)
      ? route.continue() : route.abort())
    const page = await context.newPage()
    page.setDefaultTimeout(90000)
    await page.goto(entrySite + '/' + (start ? 'testlauf' : 'nativ') + '/' + duration + '/' + part + '?lang=' + lang)
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
        if (width >= 761 && width <= 1100) {
          const list = map.getByTestId('learning-map-compact-list')
          assert.equal(await list.isVisible(), width === 761, `personalized E.1 at ${width}×${height}`)
          if (width === 761) {
            await map.getByRole('button', { name: 'Grafische Karte anzeigen' }).click()
            await list.waitFor({ state: 'hidden' })
            await map.getByRole('button', { name: 'Zielliste anzeigen' }).click()
            await list.waitFor()
          } else {
            // Virtualized nodes may be partially clipped; verify both complete cards at a readable scale.
            await page.waitForFunction(ids => {
              const surface = document.querySelector('.lum-flow')?.getBoundingClientRect()
              if (!surface) return false
              return ids.every(id => {
                const rect = document.querySelector(`[data-entry-id="${id}"] .lum-node-main`)?.getBoundingClientRect()
                return rect && rect.width >= 170 && rect.left >= surface.left && rect.right <= surface.right
                  && rect.top >= surface.top && rect.bottom <= surface.bottom
              })
            }, [other.id, task.id])
          }
        }
        await neighbor.click()
      } catch (error) {
        throw new Error(`${duration}/${part}/${lang}: ${(await map.innerText()).slice(0, 1600)}`, { cause: error })
      }
      if (await map.isVisible()) await map.getByRole('button', { name: lang === 'de' ? 'Lernkarte schließen' : 'Close learning map' }).click()
      await checkCard(page, other, lang)
    }
    assert.deepEqual(await evidence(id), before)
    console.log(duration, part, lang, start ? 'Erststart' : 'Aufgabe und Kartenwechsel', `${width}×${height}`, 'OK')
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
async function checkMathComparison() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  try {
    await page.goto(site + '/vergleich/mathematik')
    await page.getByTestId('learner-current-goal').getByRole('heading', {
      name: 'Intervalladditivität und Linearität von Integralen nutzen', exact: true,
    }).first().waitFor()
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    const board = dialog.getByRole('region', { name: 'Lernkarte: Q1.3 Vertiefung der Differenzial- und Integralrechnung', exact: true })
    await board.locator('.lum-flow--idle .is-focused').waitFor()
    assert.equal(await board.getByLabel('Zoomwert').innerText(), '100 %')
    await board.getByRole('button', { name: 'Diese Ebene einpassen' }).click()
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__node').length > 16)
    console.log('Mathematik Q1.3: 100 % beim Einstieg,', await board.getByLabel('Zoomwert').innerText(),
      'und', await board.locator('.react-flow__node').count(), 'Einträge in der Übersicht OK')
  } finally {
    await page.close()
  }
}
async function checkEvidenceMap(page, duration) {
  const summary = page.getByTestId('unit-assessment-summary')
  await summary.locator('summary').first().click()
  await summary.getByText('Für deinen Lernplan angerechnet (2)', { exact: true }).click()
  const directChecks = summary.getByTestId('unit-assessment-direct-evidence')
  const creditShields = summary.getByTestId('unit-assessment-credited-evidence')
  assert.equal(await directChecks.count(), 4)
  assert.equal(await creditShields.count(), 2)
  for (const check of await directChecks.all()) assert(await check.isVisible())
  for (const shield of await creditShields.all()) assert(await shield.isVisible())
  await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
  const map = page.getByTestId('learner-learning-map-dialog')
  await map.getByRole('button', { name: 'In E.1 Bewegungen und ihre Beschreibung hineinzoomen', exact: true }).click()
  const list = map.getByTestId('learning-map-compact-list')
  await list.waitFor()
  const entry = id => map.locator('[data-entry-id="' + id + '"]')
  const direct = 'learning-map-direct-evidence'
  const credited = 'learning-map-credited-evidence'
  const markers = async testId => map.getByTestId(testId).evaluateAll(nodes =>
    nodes.map(node => node.closest('[data-entry-id]').getAttribute('data-entry-id')))
  const directGoals = new Set(await markers(direct))
  const creditedGoals = new Set(await markers(credited))
  for (const id of ['4a2bf015-052b-4af0-aed7-324259fa1a8a', '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2']) {
    await entry(id).waitFor()
    assert.equal(await entry(id).getByTestId(credited).count(), 0)
    assert.equal(await entry(id).getByTestId(direct).count(), 0)
  }
  await map.getByRole('button', { name: 'In Beschleunigte Bewegung und freier Fall hineinzoomen', exact: true }).click()
  await map.locator('.lum-flow--idle').waitFor()
  await entry(scope.childAssessmentGoalIds[1]).getByTestId(direct).waitFor()
  for (const id of await markers(direct)) directGoals.add(id)
  for (const id of await markers(credited)) creditedGoals.add(id)
  assert.deepEqual(directGoals, new Set(unitPartIds))
  assert.deepEqual(creditedGoals, new Set(scope.childAssessmentGoalIds.flatMap(id => scope.childAssessmentRevisions[id].planningGoalIds)))
  console.log(duration, 'E.1-Karte: vier direkte Prüfungsbelege, genau zwei Schilde, beide übrigen Beispielziele ohne Beleg OK')
}

async function checkUnitAssignments(duration) {
  const physics = scope.landscapeId
  for (const [route, profile, passed] of [['offen', 'unitOpen', 0], ['CD', 'unitCD', 2], ['ABCD', 'unitABCD', 4], ['gemischt', 'mixed', 4]]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
    page.setDefaultTimeout(30000)
    try {
      await page.goto(site + '/auftraege/' + duration)
      await page.getByRole('link').filter({ hasText: { offen:'Einheitenauftrag ohne Beleg', CD:'Einheitenauftrag mit C und D',
        ABCD:'Einheitenauftrag mit A bis D', gemischt:'A bis D und zusätzlicher Einzelauftrag' }[route] }).click()
      const control = page.getByTestId('learner-unit-assignment')
      const normalPlan = page.getByTestId('learner-plan-unit-assignment')
      await normalPlan.waitFor()
      assert((await normalPlan.innerText()).includes(passed + ' / 4'))
      const unitStatus = control.getByTestId('unit-assignment-status')
      await unitStatus.waitFor()
      assert((await unitStatus.innerText()).includes(passed + ' / 4'))
      const id = profiles[duration][profile]
      const plan = await readApi(id, '/learning-plans/by-landscape?landscapeId=' + physics)
      const saved = plan.blocks.filter(block => block.unitAssignment)
      assert.equal(saved.length, 1)
      assert.deepEqual(saved[0].atomicGoalIds, unitPartIds)
      const status = await readApi(id, '/learning-plans/status?language=de')
      assert.equal(status.followLearningPlans, true)
      const subject = status.subjects.find(item => item.landscapeIds.includes(physics))
      assert.deepEqual(subject.unitAssignments.map(item => [item.passedParts, item.requiredParts, item.status]), [[passed, 4, passed === 4 ? 'completed' : 'active']])
      if (passed < 4) {
        assert.equal(plan.continueReason, 'unit-assessment-choice-required')
        assert.equal(plan.nextEligibleGoal.goalId, unitPartIds[0])
        await control.getByTestId('unit-assignment-try').click()
        assert.equal(new URL(page.url()).searchParams.get('completionGoal'), unitPartIds[0])
      } else if (route === 'ABCD') {
        assert.equal(plan.continueReason, 'unit-assignment-completed')
        assert.equal(plan.nextEligibleGoal, null)
        assert((await control.getByTestId('unit-assignment-next').innerText()).includes('Kein weiterer Vorschlag'))
        await checkEvidenceMap(page, duration)
      } else {
        assert.equal(plan.nextEligibleGoal.goalId, 'ae67bcf1-f3ee-50d6-9a12-25a159dff659')
        assert((await control.getByTestId('unit-assignment-next').innerText()).includes('Bewegungen mit Weg-Zeit-Diagrammen beschreiben'))
        await control.getByTestId('unit-assignment-next-individual').click()
        await page.getByTestId('learner-current-goal').getByRole('heading', { name: 'Bewegungen mit Weg-Zeit-Diagrammen beschreiben', exact: true }).first().waitFor()
      }
      console.log(duration, route, 'Einheitenauftrag und tatsächlicher nächster Planvorschlag OK')
    } finally { await page.close() }
  }
}

async function checkPlanSelection(duration, withExistingPlan) {
  const page = await browser.newPage()
  try {
    const id = profiles[duration][withExistingPlan ? 'viewer' : 'A']
    const path = '/learning-plans/by-landscape?landscapeId=' + scope.landscapeId
    const before = withExistingPlan ? await readApi(id, path) : null
    await page.goto(site + (withExistingPlan ? '/nativ/' : '/testlauf/') + duration + '/A')
    const control = page.getByTestId('learner-unit-assignment')
    const save = page.waitForResponse(res => res.request().method() === 'PUT' && res.url().includes('/learning-plans/by-landscape'))
    await control.getByTestId('unit-assignment-add').click()
    assert.equal((await save).status(), 200)
    await control.getByTestId('unit-assignment-status').waitFor()
    const after = await readApi(id, path)
    assert.equal(after.blocks.length, (before?.blocks.length ?? 0) + 1)
    for (const old of before?.blocks ?? []) assert.deepEqual(after.blocks.find(block => block.id === old.id), old)
    assert.equal(after.blocks.filter(block => block.unitAssignment).length, 1)
    await page.reload()
    await page.getByTestId('unit-assignment-status').waitFor()
    if (withExistingPlan) {
      const selected = after.blocks.find(block => block.unitAssignment)
      const paused = await fetch(api + '/api/ui/learners/' + id + path, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedRevision: after.revision, planLabel: after.planLabel,
          blocks: after.blocks.map(block => block.id === selected.id ? { ...block, active: false } : block) }),
      })
      assert.equal(paused.status, 200)
      await page.reload()
      await control.getByRole('button', { name: 'Einheitenauftrag wieder aktivieren' }).click()
      await control.getByTestId('unit-assignment-status').waitFor()
      const resumed = await readApi(id, path)
      assert.equal(resumed.blocks.length, after.blocks.length)
      assert.deepEqual(resumed.blocks.find(block => block.id === selected.id)?.unitAssignment, selected.unitAssignment)
      assert.notEqual(resumed.blocks.find(block => block.id === selected.id)?.active, false)
    }
    console.log(duration, withExistingPlan ? 'Einheitenauftrag zusätzlich zum vorhandenen Einzelzielplan' : 'Einheitenauftrag im neuen Lernplan',
      'über die reguläre WebGUI gespeichert OK')
  } finally { await page.close() }
}

async function checkVoluntaryStudy(duration, scenario, id, href, mastery, passedCount) {
  const page = await browser.newPage()
  try {
    // Exercise both preference modes on the disposable profiles used by --check.
    const strict = scenario === 'ABCD'
    if (strict) assert((await fetch(api + '/api/ui/learners/' + id + '/preferences', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ strictMode: true }),
    })).ok)
    await page.goto(new URL(href, site).href)
    const summary = page.getByTestId('unit-assessment-summary')
    await summary.locator('summary').first().click()
    await summary.getByText('Für deinen Lernplan angerechnet (2)', { exact: true }).click()
    await summary.getByText('Einzeln noch nachzuweisen (11)', { exact: true }).waitFor()
    assert.equal(await summary.getByText('Beleg vorhanden', { exact: true }).count(), passedCount)
    const target = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
    const title = 'Gleichmäßig beschleunigte Bewegung und Beschleunigung'
    const state = await readApi(id, '/state')
    const choice = state.levelCompletion.actions.find(action => action.goalId === target && action.practice)
    assert.equal(choice?.intent, 'voluntary')
    const prerequisites = choice.practice.openPrerequisites
    assert(prerequisites.length > 0)
    const closestStrictPrerequisite = '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
    assert.equal(choice.practice.startGoalId, strict ? closestStrictPrerequisite : target)
    if (strict) assert(prerequisites.some(item => item.goalId === closestStrictPrerequisite))
    const creditList = summary.locator('details').filter({ has: page.getByText('Für deinen Lernplan angerechnet (2)', { exact: true }) })
    await creditList.getByRole('button', { name: title, exact: true }).click()
    const card = page.getByTestId('learner-current-goal')
    await card.getByRole('heading', { name: title, exact: true }).first().waitFor()
    const study = card.getByTestId('credited-goal-individual-study')
    await study.getByText(`Offene Voraussetzungen (${prerequisites.length})`, { exact: true }).click()
    for (const prerequisite of prerequisites) await study.getByText(prerequisite.title.de, { exact: true }).waitFor()
    const result = page.waitForResponse(response => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith('/level-completion/actions'))
    await study.getByTestId('credited-goal-study-start').click()
    assert.equal((await result).status(), 200)
    const now = await readApi(id, '/state')
    assert.equal(now.activeGoal.id ?? now.activeGoal.goalId, choice.practice.startGoalId)
    await page.getByTestId('learner-active-goal-banner').waitFor()
    if (strict) {
      const frontier = await readApi(id, '/frontier')
      assert.deepEqual(new Set(frontier.goals), new Set([
        closestStrictPrerequisite, '65365dce-f33f-49d8-9516-42f75883aa86', '5c44b9ba-9b05-4774-95d5-073230d3fc4f',
      ]))
    }
    assert.deepEqual((await readApi(id, '/mastery')).mastery, mastery)
    console.log(duration, scenario, strict ? 'strikter Einzelweg über die angebotene Grundlage' : 'freiwilliger Einzelfokus',
      strict ? prerequisites.find(item => item.goalId === choice.practice.startGoalId).title.de : title, 'OK')
  } finally {
    await page.close()
  }
}
async function checkGradedComparison(duration) {
  const physics = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
  const firstPlanGoal = 'ae67bcf1-f3ee-50d6-9a12-25a159dff659'
  const initialFrontier = ['8aff7aac-321b-5172-ac55-877876bfd2cd', '82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3', firstPlanGoal]
  const comparison = await browser.newPage()
  try {
    await comparison.goto(site + '/vergleich/' + duration)
    await comparison.getByRole('heading', { name: `E.1 – Lernplan und Lernfront (${duration})` }).waitFor()
    for (const [scenario, label, count] of [
      ['viewer', 'Kein Prüfungsteil bestanden', 0], ['CD', 'C und D bestanden', 2], ['ABCD', 'Alle vier bestanden', 4],
    ]) {
      const id = profiles[duration][scenario]
      const section = comparison.locator('section').filter({ has: comparison.getByRole('link', { name: label, exact: true }) })
      const frontier = await readApi(id, '/frontier')
      assert.deepEqual(new Set(frontier.goals), new Set(initialFrontier))
      assert.deepEqual(new Set(await section.locator('ul li').allTextContents()), new Set([
        'Messabweichungen und Fehlerarten unterscheiden', 'Waagerechter Wurf und Superposition',
        'Bewegungen mit Weg-Zeit-Diagrammen beschreiben',
      ]))
      const hypotheses = await section.locator('tbody tr').evaluateAll(rows =>
        rows.map(row => Array.from(row.cells, cell => cell.textContent)))
      assert.deepEqual(hypotheses, [
        'Newtons 1. Axiom (Trägheitsprinzip)', 'Newtons 1. Axiom anwenden', 'Harmonische Schwingung verstehen',
      ].map(title => [title, 'angeboten', 'nicht angeboten']))
      const plan = await readApi(id, '/learning-plans/by-landscape?landscapeId=' + physics)
      assert.equal(plan.nextEligibleGoal.goalId, firstPlanGoal)
      const status = await readApi(id, '/learning-plans/status?language=de')
      const gauge = status.subjects.find(subject => subject.landscapeIds.includes(physics)).periodGauge
      assert.equal(gauge.target, 17)
      assert.equal(gauge.completed, count + (count ? 2 : 0))
      assert.equal(await section.locator('dt').filter({ hasText: 'Erledigte Positionen im E.1-Lernplan' })
        .evaluate(term => term.nextElementSibling.textContent), String(gauge.completed))
      const unitState = (await readApi(id, '/state')).levelCompletion.unitAssessment
      const expected = count === 0 ? [] : count === 2 ? scope.childAssessmentGoalIds : unitPartIds
      const passed = new Set(expected)
      assert.deepEqual(new Set(unitState.parts.filter(part => part.passed).map(part => part.goalId)), passed)
      assert.equal(unitState.passed, count === 4)
      const credits = count ? scope.childAssessmentGoalIds.flatMap(id => scope.childAssessmentRevisions[id].planningGoalIds) : []
      assert.deepEqual(new Set(unitState.planningCreditGoalIds), new Set(credits))
      assert.deepEqual(new Set(unitState.individuallyOpenGoalIds), new Set(contract.contentGoalIds))
      const { mastery } = await readApi(id, '/mastery')
      assert.deepEqual(new Set(Object.keys(mastery).filter(key => mastery[key] > 0)), passed)
      for (const [index, goal] of unitPartIds.entries()) {
        const receipts = await readApi(id, '/exam-passes/' + goal)
        assert.equal(receipts.length, passed.has(goal) ? 1 : 0)
        if (receipts.length) {
          const receipt = receipts[0]
          assert.deepEqual([receipt.earnedPoints, receipt.maxPoints, receipt.passingPoints],
            [[14, 17, 14], [15, 18, 15], [17, 20, 17], [17, 20, 17]][index])
        }
      }
      if (count) {
        const href = await section.getByRole('link', { name: label, exact: true }).getAttribute('href')
        await checkVoluntaryStudy(duration, scenario, id, href, mastery, count)
      }
    }
    console.log(duration, 'Echte Prüfungsbelege, Lernplan und Lernfront in allen drei Vergleichsprofilen OK')
  } finally {
    await comparison.close()
  }
}
try {
  await checkMathComparison()
  // Each curriculum has its own viewer and a fresh learner per first attempt.
  for (const duration of ['G8', 'G9']) {
    for (const part of ['A', 'B']) {
      for (const lang of ['de', 'en']) await check(duration, part, lang, false)
    }
    for (const width of [761, 1024, 1100]) await check(duration, 'B', 'de', false, width)
    await check(duration, 'B', 'de', false, 1024, 650)
    if (duration === 'G9') await check(duration, 'B', 'de', false, 390)
    await checkUnitAndChildCards(duration)
    await checkGradedComparison(duration)
    await checkUnitAssignments(duration)
    await checkPlanSelection(duration, false)
    await checkPlanSelection(duration, true)
    for (const part of ['A', 'B']) await check(duration, part, 'de', true)
  }
} finally {
  await browser.close()
}
