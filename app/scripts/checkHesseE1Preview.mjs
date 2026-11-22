import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const [site, api, profilesFile, physicsCourse = 'GK', browserCase = 'all'] = process.argv.slice(2)
assert(['GK', 'LK'].includes(physicsCourse), 'Expected the explicit Physics course GK or LK')
assert(['all', 'short-map', 'mobile-map', 'structure', 'planning', 'guided', 'foreign-focus'].includes(browserCase), 'Unknown focused browser case')
const throwAssessment = '6ea3fb3c-abdc-568f-ab13-97c36dc274e4'
const multiphaseAssessment = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
const voluntaryAssessmentIds = physicsCourse === 'LK' ? [throwAssessment, multiphaseAssessment] : [throwAssessment]
for (const url of [site, api]) assert(['localhost', '127.0.0.1'].includes(new URL(url).hostname))
const numericSite = new URL(site)
numericSite.hostname = '127.0.0.1'
const profiles = JSON.parse(await readFile(profilesFile, 'utf8'))
const readTask = async file => JSON.parse(await readFile(
  new URL('../../docs/concept/skill-graph/examples/hessen-physik-e1/' + file, import.meta.url), 'utf8'))
const tasks = { A: await readTask('wagen.json'), B: await readTask('wurf.json') }
const scope = await readTask('umfang.json')
const unitPartIds = [...scope.ownAssessmentGoalIds, ...scope.childAssessmentGoalIds]
const { unit, intro, exercises: ownExercises } = JSON.parse(await readFile(new URL(
  '../../curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json', import.meta.url), 'utf8'))
const childMaterial = JSON.parse(await readFile(new URL(
  '../../curricula/DE/Gymnasium/materials/physics/he-e1-accelerated-and-free-fall.json', import.meta.url), 'utf8'))
const orientationGoalIds = [unit.orientationGoalId, childMaterial.unit.orientationGoalId]
const unitStudyIntentKey = 'skillpilot:unit-study-navigation:v1'
assert(orientationGoalIds.every(id => typeof id === 'string'))
const exercises = [...new Map([...ownExercises, ...childMaterial.exercises].map(exercise => [exercise.goalId, exercise])).values()]
const canonicalPhysics = JSON.parse(await readFile(new URL(
  '../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', import.meta.url), 'utf8'))
const parentOrientationTitle = canonicalPhysics.goals.find(goal => goal.id === unit.orientationGoalId).title
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
  const passes = await Promise.all([...unitPartIds, ...voluntaryAssessmentIds].map(goalId => readApi(id, '/exam-passes/' + goalId)))
  const oriented = ['G8', 'G9'].some(duration => profiles[duration].oriented === id)
  assert.deepEqual(Object.keys(mastery.mastery).filter(goal => mastery.mastery[goal] > 0).sort(),
    oriented ? [...orientationGoalIds].sort() : [], 'Only explicitly confirmed orientation results may exist')
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
async function launchAssessment(page, goalId) {
  const launch = page.getByTestId('claude-plugin-start')
  const next = page.getByRole('button', { name: 'Weiter zu Schritt 2: Curriculum wählen' })
  if (!await launch.isVisible() && await next.isVisible()) await next.click()
  await launch.waitFor()
  const result = page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/claude/v1/launch'))
  await launch.click()
  const response = await result
  assert.equal(response.status(), 200)
  const accepted = response.request().postDataJSON().completionAssessment
  assert.equal(accepted.goalId, goalId)
  assert(!accepted.restartCurrent)
}
async function checkMapCardExposure(page, ids) {
  // Scope navigation mounts the cards before the routed assessment camera settles.
  // Await that camera at every desktop width, then measure title occlusion below.
  await page.waitForFunction(ids => {
    const board = document.querySelector('[data-testid="learner-learning-map-dialog"] [data-testid="learning-map-board"]')
    const surface = board?.querySelector('.lum-flow')?.getBoundingClientRect()
    if (!surface || board.getAttribute('aria-busy') !== 'false') return false
    return ids.every(id => {
      const rect = board.querySelector(`[data-entry-id="${id}"] .lum-node-main`)?.getBoundingClientRect()
      return rect && rect.width >= 170 && rect.left >= surface.left && rect.right <= surface.right
        && rect.top >= surface.top && rect.bottom <= surface.bottom
    })
  }, ids)
  const measured = await page.evaluate(ids => {
    const surface = document.querySelector('.lum-flow').getBoundingClientRect()
    const controls = document.querySelector('.lum-map-controls').getBoundingClientRect()
    return ids.map(id => {
      const button = document.querySelector(`[data-entry-id="${id}"] .lum-node-main`)
      const card = button.getBoundingClientRect()
      // Text ranges measure the actual title lines, including the second line
      // that a toolbar can cover while the button's center remains clickable.
      const text = ['strong', '.lum-node-meta'].flatMap(selector => {
        const element = button.querySelector(selector)
        const bounds = element.getBoundingClientRect()
        const range = document.createRange()
        range.selectNodeContents(element)
        return Array.from(range.getClientRects()).filter(rect => rect.top < bounds.bottom && rect.bottom > bounds.top)
          .map(rect => ({ left: Math.max(rect.left, bounds.left), right: Math.min(rect.right, bounds.right),
            top: Math.max(rect.top, bounds.top), bottom: Math.min(rect.bottom, bounds.bottom) }))
          .filter(rect => rect.right > rect.left && rect.bottom > rect.top)
      })
      return { id, width: card.width,
        inside: card.left >= surface.left && card.right <= surface.right
          && card.top >= surface.top && card.bottom <= surface.bottom,
        toolbarOverlap: card.left < controls.right && card.right > controls.left
          && card.top < controls.bottom && card.bottom > controls.top,
        textRegions: text.length,
        textExposed: text.every(rect => [0.1, 0.5, 0.9].every(x => button.contains(document.elementFromPoint(
          rect.left + (rect.right - rect.left) * x, (rect.top + rect.bottom) / 2)))),
      }
    })
  }, ids)
  for (const card of measured) {
    assert(card.inside && card.width >= 170, `Readable assessment card: ${JSON.stringify(card)}`)
    assert(!card.toolbarOverlap && card.textRegions >= 2 && card.textExposed,
      `Assessment title and type remain unobstructed: ${JSON.stringify(card)}`)
  }
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
      await launchAssessment(page, task.id)
      const state = await readApi(id, '/state')
      assert.equal(state.levelCompletion.directAssessmentRunning, true)
      assert.equal(state.activeGoal.id ?? state.activeGoal.goalId, task.id)
    } else {
      const state = (await readApi(id, '/state')).levelCompletion
      assert.equal(state.requiredAssessmentCount, unitPartIds.length)
      assert.deepEqual(new Set(state.assessments.filter(row => !row.voluntary).map(row => row.goalId)), new Set(unitPartIds))
      const optional = state.assessments.filter(row => row.voluntary)
      assert.deepEqual(optional.map(row => row.goalId).sort(), [...voluntaryAssessmentIds].sort())
      assert(optional.every(row => row.startAvailable), 'Each supplementary assessment must be independently startable')
      assert.equal(state.assessments.some(row => row.goalId === multiphaseAssessment), physicsCourse === 'LK')
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
      const optionalDisclosure = panel.getByText(lang === 'de' ? 'Freiwillige Zusatzprüfungen' : 'Optional assessments', { exact: true })
      await optionalDisclosure.click()
      const optionalList = panel.getByRole('list', { name: lang === 'de' ? 'Freiwillige Zusatzprüfungen' : 'Optional assessments' })
      const optionalRows = optionalList.getByRole('listitem')
      assert.equal(await optionalRows.count(), voluntaryAssessmentIds.length)
      for (const assessment of optional) {
        const row = optionalRows.filter({ has: page.getByText(assessment.title[lang], { exact: true }) })
        await row.getByText(lang === 'de' ? 'Freiwillige Zusatzprüfung' : 'Optional assessment', { exact: true }).waitFor()
        const href = await row.getByRole('link').getAttribute('href')
        assert.equal(new URL(href, site).searchParams.get('completionGoal'), assessment.goalId)
      }
      await optionalDisclosure.click()
      const openCount = contract.contentGoalIds.length
      await summary.getByText(lang === 'de' ? `Einzeln noch nachzuweisen (${openCount})`
        : `Still awaiting individual evidence (${openCount})`, { exact: true }).waitFor()
      await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
      const map = page.getByTestId('learner-learning-map-dialog')
      const other = tasks[part === 'A' ? 'B' : 'A']
      const neighbor = map.locator('[data-entry-id="' + other.id + '"]').getByRole('button').first()
      const layoutError = map.getByTestId('learner-map-layout-error')
      try {
        await map.locator('.lum-flow--idle').or(layoutError).first().waitFor()
        if (await layoutError.isVisible()) {
          await layoutError.getByRole('button', { name: lang === 'de' ? 'Erneut versuchen' : 'Try again' }).click()
          await map.locator('.lum-flow--idle').waitFor()
        }
        assert.equal(await map.getByRole('button', { name: /Zielliste anzeigen|Grafische Karte anzeigen|Show goal list|Show graph/ }).count(), 0)
        const drawing = await map.locator('.lum-flow').boundingBox()
        const overview = await map.locator('.react-flow__minimap-svg').boundingBox()
        assert(drawing && overview && overview.width > 0 && overview.height > 0
          && overview.y >= drawing.y + drawing.height - 1,
        'The interactive overview stays below the whole drawing, including the lower right goal cards.')
        if (width < 1024) {
          const title = lang === 'de' ? other.title : other.titleEn
          await map.getByRole('textbox', { name: lang === 'de' ? 'In dieser Ebene suchen' : 'Search this level' }).fill(title)
          await map.getByRole('option').filter({ hasText: title }).click()
        }
        if (width >= 1024) await checkMapCardExposure(page, [task.id, other.id, scope.childAssessmentGoalIds[0]])
        await neighbor.click()
      } catch (error) {
        const input = map.getByRole('textbox').first()
        throw new Error(`${duration}/${part}/${lang}: ${JSON.stringify({ width, height,
          search: await input.inputValue().catch(() => null), options: await map.getByRole('option').allTextContents(),
          selection: await map.getByTestId('native-cockpit-map').evaluateAll(nodes => nodes[0]?.getAttribute('data-selected-goal-id') ?? null),
          scope: await map.getByTestId('learning-map-board').evaluateAll(nodes => nodes[0]?.getAttribute('data-scope-id') ?? null) })}\n${(await map.innerText()).slice(0, 1600)}`, { cause: error })
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
const worksheets = [
  { goalId: '971beafa-6ba5-4c82-ac8b-7ebf66eec3dd', title: 'Gleichförmige Bewegung und Geschwindigkeit' },
  { goalId: '09029573-864f-40ca-bf8a-cee7bf6dcb73', title: 'Freier Fall experimentell untersuchen' },
]

async function checkGuidedUnitEntry(duration) {
  const { viewer, parentOriented, E1: section } = profiles[duration]
  assert(parentOriented, 'Expected a separately coach-confirmed parent-only profile')
  const page = await browser.newPage({ viewport: { width: duration === 'G8' ? 1440 : 390, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  page.setDefaultTimeout(60000)
  const before = await evidence(viewer)
  const parentBefore = await readApi(parentOriented, '/mastery')
  try {
    await page.goto(site + '/nativ/' + duration + '/E1')
    const card = page.getByTestId('learner-current-goal')
    const view = card.getByTestId('unit-introduction')
    await view.getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    await view.getByText(intro.de.scene, { exact: true }).waitFor()
    assert((await view.getByTestId('unit-introduction-context').innerText()).includes('E.1 Bewegungen und ihre Beschreibung'))
    const image = view.getByRole('img', { name: intro.de.imageAlt, exact: true })
    await image.waitFor()
    await page.waitForFunction(src => [...document.images].some(image => image.src.endsWith(src) && image.complete && image.naturalWidth > 0), intro.de.imageUrl)
    assert.deepEqual(await view.getByTestId('unit-introduction-topics').getByRole('listitem').allTextContents(), intro.de.topics)
    assert.equal((await view.innerText()).includes(childMaterial.intro.de.question), false, 'The parent overview does not replay a nested introduction')
    assert.deepEqual(await evidence(viewer), before)

    // A direct exam arrival may conserve drawing space, but navigating into a
    // unit is a new learning intent even while the routed exam stays selected.
    await page.goto(site + '/learner/' + tasks.B.id)
    await checkCard(page, tasks.B, 'de')
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    const map = page.getByTestId('learner-learning-map-dialog')
    const mapIntro = map.getByTestId('unit-introduction')
    await mapIntro.getByText('Der Einstieg der Einheit ist noch offen.', { exact: true }).waitFor()
    assert.equal(await mapIntro.getByRole('img').count(), 0)
    await map.locator('.lum-canvas[aria-busy="false"]').waitFor()
    await map.getByRole('button', { name: 'In Beschleunigte Bewegung und freier Fall hineinzoomen', exact: true }).press('Enter')
    await mapIntro.getByRole('heading', { name: childMaterial.intro.de.question, exact: true }).waitFor()
    await mapIntro.getByRole('img', { name: childMaterial.intro.de.imageAlt, exact: true }).waitFor()
    assert.equal(await map.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), tasks.B.id)
    assert.equal((await mapIntro.innerText()).includes(intro.de.question), false)
    await map.locator('.lum-canvas[aria-busy="false"]').waitFor()
    await map.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
    await mapIntro.getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    await mapIntro.getByRole('img', { name: intro.de.imageAlt, exact: true }).waitFor()
    assert.equal(await map.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), tasks.B.id)
    await map.getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
    assert.deepEqual(await evidence(viewer), before, 'Explicit unit entry never records an orientation result')

    const exercise = exercises.find(entry => entry.goalId === '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2').de
    await page.goto(site + '/learner/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2')
    await card.getByRole('button', { name: 'Üben: ' + exercise.title, exact: true }).click()
    await page.waitForURL(url => url.pathname === '/learner/' + unit.orientationGoalId)
    assert.equal(await page.getByRole('dialog', { name: exercise.title, exact: true }).count(), 0)
    assert.deepEqual(await evidence(viewer), before, 'Trying an exercise redirects to the introduction without results')

    await page.goto(site + '/vergleich/' + duration + '/elterneinstieg')
    await view.getByText('Einstieg abgeschlossen.', { exact: true }).waitFor()
    const childSection = section.replace(/physics-e1-motion$/, 'physics-e1-accelerated-and-free-fall')
    await page.goto(site + '/learner/' + childSection)
    await view.getByRole('heading', { name: childMaterial.intro.de.question, exact: true }).waitFor()
    await view.getByRole('img', { name: childMaterial.intro.de.imageAlt, exact: true }).waitFor()
    assert.equal((await view.innerText()).includes(intro.de.scene), false, 'The nested introduction shows its own scene')
    assert((await view.getByTestId('unit-introduction-context').innerText()).includes('E.1 Bewegungen und ihre Beschreibung'))
    const childExercise = childMaterial.exercises[0]
    await page.goto(site + '/learner/' + childExercise.goalId)
    await card.getByRole('button', { name: 'Üben: ' + childExercise.de.title, exact: true }).click()
    await page.waitForURL(url => url.pathname === '/learner/' + childMaterial.unit.orientationGoalId)
    await view.getByRole('heading', { name: childMaterial.intro.de.question, exact: true }).waitFor()
    assert.deepEqual(await readApi(parentOriented, '/mastery'), parentBefore, 'Child resource gating preserves the parent confirmation')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await view.getByRole('heading', { name: childMaterial.intro.de.question, exact: true }).waitFor()

    // The handoff reaches the ordinary provider flow even without a coach session.
    const activation = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/active-goal'))
    await view.getByTestId('unit-introduction-continue').click()
    const selected = await activation
    assert.equal(selected.status(), 200)
    assert.equal(selected.request().postDataJSON().goalId, childExercise.goalId, 'The intended exercise goal survives the introduction handoff')
    await page.waitForURL(url => url.pathname === '/' && url.searchParams.get('start') === 'coach')
    const launch = page.getByTestId('claude-plugin-start')
    const next = page.getByRole('button', { name: 'Weiter zu Schritt 2: Curriculum wählen' })
    if (!await launch.isVisible() && await next.isVisible()) await next.click()
    await launch.waitFor()
    const pending = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/claude/v1/launch'))
    await launch.click()
    const launched = await pending
    assert.equal(launched.status(), 200)
    assert.equal(launched.request().postDataJSON().completionAssessment ?? null, null)
    const state = await readApi(parentOriented, '/state')
    assert.equal(state.activeGoal.id ?? state.activeGoal.goalId, childMaterial.unit.orientationGoalId)
    assert.deepEqual(await readApi(parentOriented, '/mastery'), parentBefore, 'Starting a coach session does not confirm orientation')
    console.log(duration, 'Vollständiger Eltern-/Kindeinstieg, echter Bildabruf, freie Ansicht, Übungssperre und normaler Anbieterstart ohne Ergebnisänderung OK')
  } finally { await page.close() }
}

async function checkForeignFocusEntry(duration) {
  const root = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
  const math = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
  const call = async (path, method = 'GET', data) => {
    const response = await fetch(api + path, { method, headers: { 'Content-Type': 'application/json' },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }) })
    const body = await response.text()
    assert.equal(response.status, 200, method + ' ' + path + ': ' + body.slice(0, 1800))
    return body ? JSON.parse(body) : null
  }
  const created = await call('/api/ui/learners', 'POST', {})
  const learnerId = created.state.skillpilotId
  const learnerPath = '/api/ui/learners/' + learnerId
  await call(learnerPath + '/curriculum', 'PUT', { curriculumId: root })
  const sourceCurriculum = JSON.parse((await readApi(profiles[duration].viewer, '')).personalCurriculum)
  const curriculum = { [root]: sourceCurriculum[root], [scope.landscapeId]: sourceCurriculum[scope.landscapeId],
    [math]: { selected: true, filterId: 'GK' } }
  await call(learnerPath + '/personal-curriculum', 'PUT', curriculum)
  let setup = await call(learnerPath + '/personalization-plan')
  for (let count = 0; setup.stage !== 'COMPLETE' && count < 15; count++) {
    const choice = setup.options.find(option => option.kind === 'COMPLETE_GROUP')
      ?? setup.options.find(option => option.filterId === (option.landscapeId === scope.landscapeId ? physicsCourse : 'GK'))
    assert(choice, 'The mixed-subject fixture needs an available setup choice')
    setup = await call(learnerPath + '/personalization-options', 'POST', { optionId: choice.optionId })
  }
  assert.equal(setup.stage, 'COMPLETE')
  const effectiveCurriculum = JSON.parse((await readApi(learnerId, '')).personalCurriculum)
  assert.equal(effectiveCurriculum[scope.landscapeId]?.filterId, physicsCourse, 'The mixed fixture retains the explicit Physics course')
  assert.equal(effectiveCurriculum[math]?.filterId, 'GK', 'The mixed fixture uses Mathematics GK')
  assert.equal(effectiveCurriculum[root]?.durationModel, duration)
  assert.equal(effectiveCurriculum[root]?.stage, 'SekII')
  const mathView = await call('/api/ui/composition-views/match?' + new URLSearchParams({ landscapeId: math,
    schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', courseProfile: 'GK', durationModel: duration }))
  const foreignFocus = `composition:${mathView.viewId}:structure:q1`
  await call(learnerPath + '/planned', 'PUT', { goals: [foreignFocus] })
  const planned = async () => (await readApi(learnerId, '/state')).goals.planned.map(goal => goal.id)
  assert.deepEqual(await planned(), [foreignFocus])
  const before = await evidence(learnerId)
  const goalId = '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'
  const goal = canonicalPhysics.goals.find(goal => goal.id === goalId)
  const exercise = exercises.find(exercise => exercise.goalId === goalId).de
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  try {
    const entry = await fetch(site + '/nativ/' + duration + '/E1').then(response => response.text())
    const keys = JSON.parse(entry.match(/Object.entries\((\{[^]*?\})\)/)[1])
    keys.skillpilot_id = learnerId
    await context.addInitScript(values => {
      if (sessionStorage.getItem('unit-study-fixture-initialized')) return
      for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value)
      sessionStorage.setItem('unit-study-fixture-initialized', '1')
    }, keys)
    const page = await context.newPage()
    page.setDefaultTimeout(90000)
    await page.goto(site + '/learner/' + goalId)
    const card = page.getByTestId('learner-current-goal')
    await card.getByRole('heading', { name: goal.title, exact: true }).first().waitFor()
    assert.deepEqual(await planned(), [foreignFocus], 'Browsing another subject does not change the stored focus')
    await card.getByRole('button', { name: 'Üben: ' + exercise.title, exact: true }).click()
    await page.waitForURL(url => url.pathname === '/learner/' + unit.orientationGoalId)
    assert.equal(await page.getByRole('dialog', { name: exercise.title, exact: true }).count(), 0)
    assert.deepEqual(await planned(), [foreignFocus], 'The read-only resource gate does not switch the focus')
    assert.deepEqual(await evidence(learnerId), before)
    await page.goto(site + '/nativ/' + duration + '/E1')
    await card.getByTestId('unit-introduction').waitFor()
    await page.waitForFunction(key => sessionStorage.getItem(key) === null, unitStudyIntentKey)
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), unitStudyIntentKey), null,
      'Loading another learner cancels the pending navigation intent')
    await page.evaluate(id => localStorage.setItem('skillpilot_id', id), learnerId)
    await page.goto(site + '/learner/' + goalId)
    await card.getByRole('button', { name: 'Üben: ' + exercise.title, exact: true }).click()
    await page.waitForURL(url => url.pathname === '/learner/' + unit.orientationGoalId)
    const differentGoal = worksheets[0].goalId
    await page.goto(site + '/learner/' + differentGoal)
    await card.getByRole('heading', { name: worksheets[0].title, exact: true }).first().waitFor()
    await page.goto(site + '/learner/' + unit.orientationGoalId)
    await card.getByTestId('unit-introduction').waitFor()
    await page.waitForFunction(key => sessionStorage.getItem(key) === null, unitStudyIntentKey)
    assert.equal(await page.evaluate(key => sessionStorage.getItem(key), unitStudyIntentKey), null,
      'Leaving the introduction for another goal cancels the old request, including after returning')
    await page.goto(site + '/learner/' + goalId)
    await card.getByRole('button', { name: 'Üben: ' + exercise.title, exact: true }).click()
    await page.waitForURL(url => url.pathname === '/learner/' + unit.orientationGoalId)
    for (let reload = 0; reload < 2; reload++) {
      await page.reload({ waitUntil: 'domcontentloaded' })
      await card.getByTestId('unit-introduction').getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    }
    assert.deepEqual(await planned(), [foreignFocus], 'Reloading the introduction keeps the original foreign focus')
    const start = page.waitForResponse(response => response.request().method() === 'POST' && new URL(response.url()).pathname.endsWith('/active-goal'))
    await card.getByTestId('unit-introduction-continue').click()
    const response = await start
    assert.equal(response.status(), 200)
    assert.equal(response.request().postDataJSON().goalId, goalId)
    const current = await readApi(learnerId, '/state')
    assert.equal(current.activeGoal?.id ?? current.activeGoal?.goalId, unit.orientationGoalId)
    const focus = await planned()
    assert(focus.includes(foreignFocus), 'The existing independent subject assignment is retained')
    assert(focus.includes(profiles[duration].E1), 'The explicit start acquires the actual owning unit')
    assert.deepEqual(await evidence(learnerId), before, 'Starting in the owning unit never transfers mastery')
    console.log(duration, 'Struktureller Mathematik-Fremdfokus: lesendes Übungsgate, verworfene Ziel-/Lernerwechsel, zwei echte Reloads und bewusster Coach-Start mit exaktem Fachziel ohne Mastery-Änderung OK')
  } finally { await context.close() }
}

async function checkExerciseDialog(page, owner, exercise) {
  const open = owner.getByRole('button', { name: 'Üben: ' + exercise.title, exact: true })
  await open.click()
  const dialog = page.getByRole('dialog', { name: exercise.title, exact: true })
  await dialog.getByText(exercise.prompt, { exact: true }).waitFor()
  if (exercise.evidenceCriteria) {
    await dialog.getByRole('heading', { name: 'Kriterien für deinen Nachweis', exact: true }).waitFor()
    assert.deepEqual(await dialog.getByRole('listitem').allTextContents(), exercise.evidenceCriteria)
  }
  const solution = dialog.getByText(exercise.solution, { exact: true })
  assert.equal(await solution.isVisible(), false)
  await dialog.getByText('Hinweis anzeigen', { exact: true }).click()
  await dialog.getByText(exercise.hint, { exact: true }).waitFor()
  await dialog.getByText('Lösung vergleichen', { exact: true }).click()
  await solution.waitFor()
  await dialog.getByRole('button', { name: 'Übung schließen', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })
  assert(await open.evaluate(element => document.activeElement === element))
}

async function checkTreeAndMapParents(duration) {
  const { E1: section, oriented } = profiles[duration]
  const before = await evidence(oriented)
  const pathTime = 'ae67bcf1-f3ee-50d6-9a12-25a159dff659'
  const acceleration = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
  const childSection = section.replace(/physics-e1-motion$/, 'physics-e1-accelerated-and-free-fall')
  const preparationFolder = section.replace(/physics-e1-motion$/, 'physics-required-preparation-physics-e1-motion')
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  page.setDefaultTimeout(60000)
  try {
    await page.goto(site + '/vergleich/' + duration + '/einstiege')
    const tree = page.locator('.learner-tree-navigation')
    const treeRow = id => tree.locator('[data-goal-id="' + id + '"]')
    const expand = async id => {
      const button = treeRow(id).locator('button[aria-expanded]').first()
      await button.waitFor()
      if (await button.getAttribute('aria-expanded') === 'false') await button.click()
    }
    await expand(section)
    await expand(childSection)
    assert.equal(await treeRow(preparationFolder).count(), 0, 'A single preparation goal must open on E.1.')
    const directTreeParent = async id => {
      const row = treeRow(id)
      await row.waitFor()
      return row.evaluate(element => element.parentElement.parentElement.parentElement
        .querySelector(':scope > [data-goal-id]')?.getAttribute('data-goal-id'))
    }
    const expected = [[pathTime, section], [tasks.A.id, section], [acceleration, childSection]]
    for (const [id, parent] of expected) assert.equal(await directTreeParent(id), parent, 'Tree parent of ' + id)
    await treeRow(pathTime).getByText('Notwendige Grundlagen', { exact: true }).waitFor()
    const sourceId = '82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3'
    const sourceLabel = 'Waagerechter Wurf und Superposition (aus E.3)'
    const sourceGoals = [
      ['68c90ba6-c438-463c-9a53-cf61062d416a', 'Bezugssysteme und Geschwindigkeitsüberlagerung'],
      ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2', 'Waagerechter Wurf analysieren'],
    ]
    assert.equal(await treeRow(sourceId).count(), 0)
    for (const [id] of sourceGoals) {
      assert.equal(await directTreeParent(id), section)
      await treeRow(id).getByText(sourceLabel, { exact: true }).waitFor()
    }
    const treeEntries = await treeRow(section).locator('..').locator('[data-goal-id]').evaluateAll((rows, section) =>
      rows.filter(row => row.dataset.goalId !== section).map(row => [row.dataset.goalId, row.parentElement.parentElement.parentElement
        .querySelector(':scope > [data-goal-id]').dataset.goalId]), section)
    const expectedTreeCount = physicsCourse === 'LK' ? 21 : 20
    assert.equal(treeEntries.length, expectedTreeCount)
    assert.equal(treeEntries.some(([id]) => id === multiphaseAssessment), physicsCourse === 'LK')
    if (physicsCourse === 'LK') assert.equal(await directTreeParent(multiphaseAssessment), section)

    const open = page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open')
    await open.click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    await dialog.getByRole('button', { name: 'In E.1 Bewegungen und ihre Beschreibung hineinzoomen', exact: true }).click()
    const board = dialog.getByTestId('learning-map-board')
    const mapEntries = []
    const resources = new Map([[unit.flashcardGoalId, 'Aus dem Stapel „Einführungsphase“']])
    // The external “Bewegungsanalyse und freier Fall” is a GK assessment. In LK the
    // additional owned multiphase assessment occupies a place on the same 18-entry board.
    if (physicsCourse === 'GK') resources.set(unit.assessmentGoalId, 'Prüfung aus „Themenübergreifende Prüfungen“')
    for (const [parent, count] of [[section, 18], [childSection, 4]]) {
      if (parent === childSection) {
        await board.getByRole('button', { name: 'In Beschleunigte Bewegung und freier Fall hineinzoomen', exact: true }).click()
      }
      await dialog.getByRole('status').filter({ hasText: count + ' Bereiche.' }).waitFor()
      const displayedIntroduction = board.getByTestId('unit-introduction')
      assert.equal(await displayedIntroduction.count(), 1, 'A board presents only its own introduction')
      assert.equal(await displayedIntroduction.getAttribute('data-orientation-goal-id'),
        parent === section ? unit.orientationGoalId : childMaterial.unit.orientationGoalId)
      await dialog.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
      await page.waitForFunction(count =>
        document.querySelectorAll('.lum-canvas[aria-busy="false"] .lum-flow [data-entry-id]').length === count, count)
      assert.equal(await board.getAttribute('data-scope-id'), parent)
      for (const exercise of exercises) {
        const expectedParent = exercise.goalId === worksheets[1].goalId ? childSection : section
        if (parent === expectedParent) {
          await checkExerciseDialog(page, board.locator('[data-entry-id="' + exercise.goalId + '"]'), exercise.de)
        }
      }
      for (const node of await board.locator('.lum-flow [data-entry-id]').all()) {
        const id = await node.getAttribute('data-entry-id')
        if (resources.has(id)) {
          assert.equal(parent, section)
          await node.getByText(resources.get(id), { exact: true }).waitFor()
          resources.delete(id)
        } else mapEntries.push([id, parent])
      }
      if (parent === section) {
        assert.equal(await board.locator('[data-entry-id="' + unit.assessmentGoalId + '"]').count(), physicsCourse === 'GK' ? 1 : 0)
        assert.equal(await board.locator('[data-entry-id="' + multiphaseAssessment + '"]').count(), physicsCourse === 'LK' ? 1 : 0)
        assert.equal(await board.locator('[data-entry-id="' + preparationFolder + '"]').count(), 0)
        const pathNode = board.locator('[data-entry-id="' + pathTime + '"]')
        assert((await pathNode.innerText()).includes('Notwendige Grundlagen'))
        await pathNode.locator('.lum-node-main').click()
        await page.waitForURL(url => decodeURIComponent(url.pathname) === '/learner/' + pathTime)
        const search = dialog.getByRole('textbox', { name: 'In dieser Ebene suchen' })
        for (const [id, title] of sourceGoals) {
          const node = board.locator('[data-entry-id="' + id + '"]')
          assert((await node.innerText()).includes(sourceLabel))
          await search.fill(sourceLabel)
          const options = dialog.getByRole('option')
          assert.equal(await options.count(), 2)
          await options.filter({ hasText: title }).click()
          await page.waitForURL(url => decodeURIComponent(url.pathname) === '/learner/' + id)
        }
      }
    }
    assert.deepEqual(resources.size, 0)
    assert.deepEqual(mapEntries.sort(), treeEntries.sort(), 'All E.1 owned parent-child relations agree.')
    // The address of a multi-goal source opens that source, without choosing one member.
    await page.goto(site + '/learner/' + sourceId)
    await page.getByTestId('learner-current-goal').getByRole('heading', { name: sourceLabel, exact: true }).first().waitFor()
    assert.equal(new URL(page.url()).pathname, '/learner/' + sourceId)
    await open.click()
    await dialog.locator('.lum-canvas[data-scope-id="' + section + '"][aria-busy="false"]').waitFor()
    assert.equal(new URL(page.url()).pathname, '/learner/' + sourceId)
    await page.goto(site + '/learner/' + encodeURIComponent(preparationFolder))
    await page.getByTestId('learner-current-goal').getByRole('heading', {
      name: 'Bewegungen mit Weg-Zeit-Diagrammen beschreiben', exact: true,
    }).waitFor()
    assert.equal(new URL(page.url()).pathname, '/learner/' + pathTime)
    assert.deepEqual(await evidence(oriented), before)
    console.log(duration, `Alle ${expectedTreeCount} E.1-Elternpfade (${physicsCourse}), ${physicsCourse === 'GK' ? 'zwei externe Ressourcen' : 'eine externe Ressource'}, Suche anhand der E.3-Herkunft und direkte Aufrufe beider Ziele sowie ihrer kanonischen Gruppe bestätigt.`)
  } finally {
    await page.close()
  }
}
async function checkUnitAndChildCards(duration) {
  const { viewer, oriented, E1: section } = profiles[duration]
  const before = await evidence(viewer)
  const orientedBefore = await evidence(oriented)
  const page = await browser.newPage({ reducedMotion: 'reduce', serviceWorkers: 'block' })
  page.setDefaultTimeout(90000)
  try {
    const entry = site + '/nativ/' + duration + '/'
    await page.goto(entry + 'E1')
    const card = page.getByTestId('learner-current-goal')
    await card.getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    assert.equal(decodeURIComponent(new URL(page.url()).pathname), '/learner/' + section)
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    await dialog.getByRole('button', { name: 'In E.1 Bewegungen und ihre Beschreibung hineinzoomen', exact: true }).click()
    await dialog.getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    await dialog.getByText(intro.de.promise, { exact: true }).waitFor()
    await dialog.getByRole('img', { name: intro.de.imageAlt, exact: true }).waitFor()
    await dialog.getByText(intro.de.scene, { exact: true }).waitFor()
    assert.deepEqual(await dialog.getByTestId('unit-introduction-topics').getByRole('listitem').allTextContents(), intro.de.topics)
    // This is a regular resource start. Opening the map itself remains free.
    await dialog.getByRole('button', { name: 'Lernkarten zu E.1 üben', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(new URL(page.url()).pathname, '/learner/' + unit.orientationGoalId)
    await card.getByTestId('unit-introduction').waitFor()
    assert.deepEqual(await evidence(viewer), before, 'Presentation and redirection never write results')
    // Keep the original deck and task checks on a separate, coach-confirmed learner.
    await page.goto(site + '/vergleich/' + duration + '/einstiege')
    await card.getByTestId('unit-introduction').getByText('Einstieg abgeschlossen.', { exact: true }).waitFor()
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    await dialog.getByRole('button', { name: 'In E.1 Bewegungen und ihre Beschreibung hineinzoomen', exact: true }).click()
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
    assert.deepEqual(await evidence(oriented), orientedBefore)
    console.log(duration, 'E.1-Einstieg und beide Untereinheitsprüfungen DE/EN OK')
  } finally {
    await page.close()
  }
}
async function checkMathComparison() {
  const math = JSON.parse((await readApi(profiles.mathematik.viewer, '')).personalCurriculum)
  assert.equal(math['68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'].filterId, 'GK')
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
  const creditedChecks = summary.getByTestId('unit-assessment-credited-evidence')
  assert.equal(await directChecks.count(), 4)
  assert.equal(await creditedChecks.count(), 2)
  for (const check of await directChecks.all()) assert(await check.isVisible())
  for (const check of await creditedChecks.all()) {
    assert(await check.isVisible())
    assert(await check.evaluate(node => node.classList.contains('lucide-check')))
  }
  const greenShape = await directChecks.first().evaluate(node => node.innerHTML)
  assert.equal(await creditedChecks.first().evaluate(node => node.innerHTML), greenShape)
  await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
  const map = page.getByTestId('learner-learning-map-dialog')
  await map.getByRole('button', { name: 'In E.1 Bewegungen und ihre Beschreibung hineinzoomen', exact: true }).click()
  await map.locator('.lum-flow--idle').waitFor()
  await map.getByRole('button', { name: 'Diese Ebene einpassen' }).click()
  const entry = id => map.locator('[data-entry-id="' + id + '"]')
  const direct = 'learning-map-direct-evidence'
  const credited = 'learning-map-credited-evidence'
  const markers = async testId => map.getByTestId(testId).evaluateAll(nodes =>
    nodes.map(node => node.closest('[data-entry-id]').getAttribute('data-entry-id')))
  // Fitting a virtualized board mounts newly visible cards after the camera is updated.
  const [parentBoardPart, childBoardPart] = scope.childAssessmentGoalIds
  for (const goalId of [...scope.ownAssessmentGoalIds, parentBoardPart]) {
    await entry(goalId).getByTestId(direct).waitFor()
  }
  const creditGoalsFor = partId => scope.childAssessmentRevisions[partId].planningGoalIds
  for (const goalId of creditGoalsFor(parentBoardPart)) await entry(goalId).getByTestId(credited).waitFor()
  const directGoals = new Set(await markers(direct))
  const creditedGoals = new Set(await markers(credited))
  for (const id of ['4a2bf015-052b-4af0-aed7-324259fa1a8a', '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2']) {
    await entry(id).waitFor()
    assert.equal(await entry(id).getByTestId(credited).count(), 0)
    assert.equal(await entry(id).getByTestId(direct).count(), 0)
  }
  await map.getByRole('button', { name: 'In Beschleunigte Bewegung und freier Fall hineinzoomen', exact: true }).click()
  await map.locator('.lum-flow--idle').waitFor()
  await map.getByRole('button', { name: 'Diese Ebene einpassen' }).click()
  await entry(childBoardPart).getByTestId(direct).waitFor()
  for (const goalId of creditGoalsFor(childBoardPart)) await entry(goalId).getByTestId(credited).waitFor()
  for (const id of await markers(direct)) directGoals.add(id)
  for (const id of await markers(credited)) creditedGoals.add(id)
  assert.deepEqual(directGoals, new Set(unitPartIds))
  assert.deepEqual(creditedGoals, new Set(scope.childAssessmentGoalIds.flatMap(creditGoalsFor)))
  console.log(duration, 'E.1-Karte: vier direkte Prüfungsbelege, genau zwei graue Häkchen, beide übrigen Beispielziele ohne Beleg OK')
}

// Hold the real plan read across a user click, as can happen during an SSE or tab refresh.
async function pauseDuringPlanRefresh(page, pauseButton) {
  await pauseButton.click({ trial: true })
  const planRead = /\/api\/ui\/learners\/[^/]+\/learning-plans(?:\?|$)/
  let releaseRead
  const reading = new Promise(resolve => { releaseRead = resolve })
  const hold = async route => {
    await reading
    await route.continue()
  }
  await page.route(planRead, hold)
  try {
    await Promise.all([
      page.waitForRequest(request => request.method() === 'GET' && planRead.test(request.url())),
      page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))),
    ])
    await pauseButton.click()
  } finally {
    releaseRead()
    await page.unrouteAll({ behavior: 'wait' })
  }
}

async function checkStoredAssignmentActivity(duration) {
  const physics = scope.landscapeId
  const math = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
  for (const [route, profile, temporarilyDeselect] of [
    ['CD', 'unitCD', false], ['ABCD', 'unitABCD', false], ['gemischt', 'mixed', false], ['CD', 'unitCD', true],
  ]) {
    const id = profiles[duration][profile]
    const plan = () => readApi(id, '/learning-plans/by-landscape?landscapeId=' + physics)
    const results = () => Promise.all([readApi(id, '/mastery'), ...unitPartIds.map(goal => readApi(id, '/exam-passes/' + goal))])
    const original = await plan()
    const before = await results()
    const block = original.blocks.find(item => item.unitAssignment)
    assert(block && block.active !== false)
    // The public editor accepts landscape choices. Flow completion is read and selected through its own API.
    const originalConfig = temporarilyDeselect ? Object.fromEntries(Object.entries(JSON.parse((await readApi(id, '')).personalCurriculum))
      .filter(([, item]) => typeof item.selected === 'boolean')) : undefined
    let selectionChanged = false
    const setConfig = async config => {
      const response = await fetch(api + '/api/ui/learners/' + id + '/personal-curriculum', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
      })
      assert.equal(response.status, 200)
      let flow = await readApi(id, '/personalization-plan')
      for (let step = 0; step < 15 && flow.stage !== 'COMPLETE'; step++) {
        const course = config[physics]?.selected ? physicsCourse : 'GK'
        const option = flow.options.find(item => item.kind === 'COMPLETE_GROUP') ?? flow.options.find(item => item.filterId === course)
        assert(option, 'Expected an authored completion or ' + course + ' option')
        const selected = await fetch(api + '/api/ui/learners/' + id + '/personalization-options', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ optionId: option.optionId }),
        })
        assert.equal(selected.status, 200)
        flow = await selected.json()
      }
      assert.equal(flow.stage, 'COMPLETE')
      const persisted = JSON.parse((await readApi(id, '')).personalCurriculum)
      const subject = config[physics]?.selected ? physics : math
      assert.equal(persisted[subject].selected, true)
      assert.equal(persisted[subject].filterId, subject === physics ? physicsCourse : 'GK')
    }
    const page = await browser.newPage({ viewport: { width: 1024, height: 900 }, serviceWorkers: 'block' })
    try {
      if (originalConfig) {
        selectionChanged = true
        await setConfig({ ...originalConfig, [physics]: { ...originalConfig[physics], selected: false }, [math]: { selected: true, filterId: 'GK' } })
        assert.deepEqual(await readApi(id, '/learning-plans/' + physics + '/unit-assignments'), [])
      }
      await page.goto(site + '/auftraege/' + duration + '/' + route)
      const manager = page.getByTestId('stored-unit-assignments')
      const row = manager.locator('[data-block-id="' + block.id + '"]')
      const pause = row.getByRole('button', { name: 'Einheitenauftrag pausieren', exact: true })
      if (profile === 'unitCD' && !temporarilyDeselect) await pauseDuringPlanRefresh(page, pause)
      else await pause.click()
      if (originalConfig) {
        await row.getByText('Pausiert. Diese Auftragsfassung ist derzeit nicht verfügbar.', { exact: true }).waitFor()
        assert.equal(await row.getByRole('button').count(), 0)
        await setConfig(originalConfig)
        selectionChanged = false
        await page.reload()
      }
      const resume = row.getByRole('button', { name: 'Einheitenauftrag wieder aktivieren', exact: true })
      await resume.waitFor()
      const paused = await plan()
      assert.equal(paused.revision, original.revision + 1)
      assert.deepEqual(paused.blocks, original.blocks.map(item => item.id === block.id ? { ...item, active: false } : item))
      assert.deepEqual(await results(), before)
      await resume.click()
      await row.getByRole('button', { name: 'Einheitenauftrag pausieren', exact: true }).waitFor()
      const restored = await plan()
      assert.equal(restored.revision, original.revision + 2)
      assert.deepEqual(restored.blocks, original.blocks.map(item => item.id === block.id ? { ...item, active: true } : item))
      assert.deepEqual(await results(), before)
      console.log(duration, route, temporarilyDeselect ? 'ohne verfügbares Fachangebot' : '', 'Einheitenauftrag pausiert und reaktiviert; Originalblöcke, Belege und Mastery bestätigt.')
    } finally {
      if (selectionChanged) await setConfig(originalConfig)
      await page.close()
    }
  }
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
      if (route !== 'gemischt') {
        const unitStatus = control.getByTestId('unit-assignment-status')
        await unitStatus.waitFor()
        assert((await unitStatus.innerText()).includes(passed + ' / 4'))
      }
      const id = profiles[duration][profile]
      const plan = await readApi(id, '/learning-plans/by-landscape?landscapeId=' + physics)
      const saved = plan.blocks.filter(block => block.unitAssignment)
      assert.equal(saved.length, 1)
      assert.deepEqual(saved[0].atomicGoalIds, unitPartIds)
      const status = await readApi(id, '/learning-plans/status?language=de')
      assert.equal(status.followLearningPlans, true)
      const subject = status.subjects.find(item => item.landscapeIds.includes(physics))
      assert.deepEqual(subject.unitAssignments.map(item => [item.passedParts, item.requiredParts, item.status]), [[passed, 4, passed === 4 ? 'completed' : 'active']])
      const voluntary = normalPlan.getByText('Freiwillig weiterlernen', { exact: true })
      const separateOrder = route === 'gemischt'
      if (!separateOrder) assert.equal(status.resumeAvailable, false)
      if (passed < 4) {
        assert.equal(await voluntary.count(), 0)
        assert.equal(plan.continueReason, 'unit-assessment-choice-required')
        assert.equal(plan.nextEligibleGoal.goalId, unitPartIds[0])
        await control.getByTestId('unit-assignment-try').click()
        assert.equal(new URL(page.url()).searchParams.get('completionGoal'), unitPartIds[0])
      } else if (route === 'ABCD') {
        assert.equal(plan.continueReason, 'unit-assignment-completed')
        assert.equal(plan.nextEligibleGoal, null)
        assert((await control.getByTestId('unit-assignment-next').innerText()).includes('Kein weiterer Vorschlag'))
        const beforeChoice = await readApi(id, '/mastery')
        await voluntary.click()
        const offered = normalPlan.getByRole('button', { name: 'Modellierung und Idealisierung von Bewegungen', exact: true })
        assert(await offered.isVisible())
        await checkEvidenceMap(page, duration)
        await page.keyboard.press('Escape')
        await page.getByTestId('learner-learning-map-dialog').waitFor({ state: 'hidden' })
        await offered.click()
        await page.getByTestId('learner-current-goal').getByRole('heading', { name: 'Modellierung und Idealisierung von Bewegungen', exact: true }).first().waitFor()
        const passes = () => Promise.all(unitPartIds.map(goal => readApi(id, '/exam-passes/' + goal)))
        const previousPasses = await passes()
        for (const { goalId, title } of worksheets) {
          const exercise = exercises.find(entry => entry.goalId === goalId)?.de
          assert(exercise?.evidenceCriteria?.length, 'Expected reviewed criteria for ' + title)
          await normalPlan.getByRole('button', { name: title, exact: true }).click()
          const current = page.getByTestId('learner-current-goal')
          await current.getByRole('heading', { name: title, exact: true }).first().waitFor()
          const individual = current.getByTestId('individual-goal-study')
          await individual.getByText('Du kannst dieses Ziel freiwillig bearbeiten und einen eigenen Nachweis erwerben.', { exact: true }).waitFor()
          assert.equal(await individual.getByText('Deine bestandenen Prüfungen decken dieses Ziel für den Lernplan ab.', { exact: true }).count(), 0)
          await individual.getByTestId('individual-goal-study-start').waitFor()
          const gate = await readApi(id, '/unit-introduction?' + new URLSearchParams({ goalId }))
          assert(orientationGoalIds.includes(gate.orientationGoalId), 'Passed exams do not replace the required regular introduction')
          await current.getByRole('button', { name: 'Üben: ' + exercise.title, exact: true }).click()
          await page.waitForURL(url => url.pathname === '/learner/' + gate.orientationGoalId)
          await current.getByTestId('unit-introduction').waitFor()
          assert.equal(await page.getByRole('dialog', { name: exercise.title, exact: true }).count(), 0)
        }
        assert.deepEqual(await passes(), previousPasses)
        assert.deepEqual(await readApi(id, '/mastery'), beforeChoice)
        assert.equal((await readApi(id, '/state')).activeGoal ?? null, null)
      } else {
        assert.equal(plan.nextEligibleGoal.goalId, unit.orientationGoalId)
        const banner = page.getByTestId('learner-active-goal-banner').filter({ hasText: parentOrientationTitle })
        await banner.getByRole('button', { name: 'Gehe zum aktiven Ziel' }).click()
        await page.getByTestId('learner-current-goal').getByRole('heading', { name: intro.de.question, exact: true }).first().waitFor()
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
    const gate = await readApi(id, '/unit-introduction?' + new URLSearchParams({ goalId: target }))
    assert.equal(gate.orientationGoalId, unit.orientationGoalId)
    assert.equal(choice.practice.startGoalId, gate.orientationGoalId, 'The offered voluntary route names the same introduction as resource gating')
    assert.equal(choice.practice.orientationGoalId, gate.orientationGoalId)
    if (strict) assert(prerequisites.some(item => item.goalId === closestStrictPrerequisite))
    const creditList = summary.locator('details').filter({ has: page.getByText('Für deinen Lernplan angerechnet (2)', { exact: true }) })
    await creditList.getByRole('button', { name: title, exact: true }).click()
    const card = page.getByTestId('learner-current-goal')
    await card.getByRole('heading', { name: title, exact: true }).first().waitFor()
    const study = card.getByTestId('individual-goal-study')
    await study.getByText(`Offene Voraussetzungen (${prerequisites.length})`, { exact: true }).click()
    for (const prerequisite of prerequisites) await study.getByText(prerequisite.title.de, { exact: true }).waitFor()
    const result = page.waitForResponse(response => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith('/level-completion/actions'))
    await study.getByTestId('individual-goal-study-start').click()
    assert.equal((await result).status(), 200)
    const now = await readApi(id, '/state')
    assert.equal(now.activeGoal.id ?? now.activeGoal.goalId, choice.practice.startGoalId)
    await page.getByTestId('learner-active-goal-banner').waitFor()
    await card.getByTestId('unit-introduction').getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    const frontier = await readApi(id, '/frontier')
    assert(!frontier.goals.includes(target), 'A subject target is not offered past the open introduction')
    assert.deepEqual((await readApi(id, '/mastery')).mastery, mastery)
    console.log(duration, scenario, strict ? 'strikter Einzelweg' : 'freiwilliger Einzelfokus',
      'beginnt mit dem erforderlichen Einstieg und behält die echten offenen Fachvoraussetzungen', 'OK')
  } finally {
    await page.close()
  }
}
async function checkOptionalMultiphaseAttempt(duration) {
  const id = profiles[duration].unitCD
  const url = site + '/auftraege/' + duration + '/CD'
  const receipts = () => Promise.all([...unitPartIds, ...voluntaryAssessmentIds].map(goal => readApi(id, '/exam-passes/' + goal)))
  const before = await receipts()
  const mastery = await readApi(id, '/mastery')
  assert.deepEqual(before.map(rows => rows.length), [0, 0, 1, 1, 0, 0])
  const context = await browser.newContext({ locale: 'de', serviceWorkers: 'block', reducedMotion: 'reduce' })
  try {
    await context.route('**/*', route => [site, api].includes(new URL(route.request().url()).origin) ? route.continue() : route.abort())
    const page = await context.newPage()
    await page.goto(url)
    // This learner returned to the ordinary plan after C+D. Open the additional exam from its E.1 tree.
    const plan = page.getByTestId('learner-plan-unit-assignment')
    await plan.getByText(/2 \/ 4/).waitFor()
    const tree = page.locator('.learner-tree-navigation')
    const section = tree.locator('[data-goal-id="' + profiles[duration].E1 + '"]')
    const expand = section.locator('button[aria-expanded]').first()
    await expand.waitFor()
    if (await expand.getAttribute('aria-expanded') === 'false') await expand.click()
    const goal = section.locator('..').locator('[data-goal-id="' + multiphaseAssessment + '"]')
    await goal.getByText('Mehrphasenbewegung und Modellprüfung', { exact: true }).click()
    const shortcut = page.getByTestId('selected-goal-assessment-shortcuts')
      .getByRole('link', { name: 'Prüfung direkt versuchen', exact: true })
    const target = new URL(await shortcut.getAttribute('href'), site)
    assert.equal(target.searchParams.get('completionGoal'), multiphaseAssessment)
    await shortcut.click()
    await launchAssessment(page, multiphaseAssessment)
    const running = await readApi(id, '/state')
    assert.equal(running.levelCompletion.directAssessmentRunning, true)
    assert.equal(running.activeGoal.id ?? running.activeGoal.goalId, multiphaseAssessment)
    const cockpit = await context.newPage()
    await cockpit.goto(url)
    const active = cockpit.getByTestId('level-completion-card')
    await active.getByRole('button', { name: 'Zur normalen Lernansicht', exact: true }).click()
    const exit = active.getByRole('group', { name: 'Laufende Prüfung beenden' })
      .getByRole('button', { name: 'Prüfung beenden und wechseln', exact: true })
    const changed = cockpit.waitForResponse(response => response.request().method() === 'POST'
      && new URL(response.url()).pathname.endsWith('/level-completion/actions'))
    await exit.click()
    const result = await changed
    assert.equal(result.status(), 200)
    assert.equal(result.request().postDataJSON().action, 'leaveProfile')
    assert.equal((await readApi(id, '/state')).levelCompletion.directAssessmentRunning, false)
    assert.deepEqual(await receipts(), before)
    assert.deepEqual(await readApi(id, '/mastery'), mastery)
    console.log(duration, 'Freiwillige LK-Mehrphasenprüfung begonnen und vor der Abgabe verlassen; C+D und Einzelmastery erhalten OK')
  } finally {
    await context.close()
  }
}
async function checkGradedComparison(duration) {
  const physics = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
  const firstPlanGoal = unit.orientationGoalId
  const comparison = await browser.newPage()
  try {
    await comparison.goto(site + '/vergleich/' + duration)
    await comparison.getByRole('heading', { name: `E.1 – Lernplan und Lernfront (${duration} · ${physicsCourse})` }).waitFor()
    for (const [scenario, label, count] of [
      ['viewer', 'Kein Prüfungsteil bestanden', 0], ['CD', 'C und D bestanden', 2], ['ABCD', 'Alle vier bestanden', 4],
    ]) {
      const id = profiles[duration][scenario]
      const section = comparison.locator('section').filter({ has: comparison.getByRole('link', { name: label, exact: true }) })
      const frontier = await readApi(id, '/frontier')
      const currentState = await readApi(id, '/state')
      const activeId = currentState.activeGoal?.id ?? currentState.activeGoal?.goalId
      assert.deepEqual(new Set([...frontier.goals, ...(activeId === unit.orientationGoalId ? [activeId] : [])]), new Set([unit.orientationGoalId]))
      assert.deepEqual(await section.locator('ul li').allTextContents(), [parentOrientationTitle])
      const hypotheses = await section.locator('tbody tr').evaluateAll(rows =>
        rows.map(row => Array.from(row.cells, cell => cell.textContent)))
      assert.deepEqual(hypotheses, [
        'Newtons 1. Axiom (Trägheitsprinzip)', 'Newtons 1. Axiom anwenden', 'Harmonische Schwingung verstehen',
      ].map(title => [title, 'angeboten', 'nicht angeboten']))
      const plan = await readApi(id, '/learning-plans/by-landscape?landscapeId=' + physics)
      assert.equal(plan.nextEligibleGoal.goalId, firstPlanGoal)
      const status = await readApi(id, '/learning-plans/status?language=de')
      const gauge = status.subjects.find(subject => subject.landscapeIds.includes(physics)).periodGauge
      const scheduled = plan.blocks.flatMap(block => block.atomicGoalIds ?? [])
      assert.equal(scheduled.length, gauge.target)
      assert(orientationGoalIds.every(goal => scheduled.includes(goal)), 'Both authored introductions belong to regular E.1 planning')
      assert(scheduled.includes(tasks.A.id) && scheduled.includes(tasks.B.id))
      assert(!scheduled.includes(throwAssessment) && !scheduled.includes(multiphaseAssessment))
      assert.equal(gauge.completed, count + (count ? 2 : 0))
      assert.equal(await section.locator('dt').filter({ hasText: 'Erledigte Positionen im E.1-Lernplan' })
        .evaluate(term => term.nextElementSibling.textContent), String(gauge.completed))
      const level = (await readApi(id, '/state')).levelCompletion
      assert.equal(level.requiredAssessmentCount, 4)
      assert.equal(level.masteredAssessmentCount, count)
      assert.deepEqual(level.assessments.filter(row => row.voluntary).map(row => row.goalId).sort(), [...voluntaryAssessmentIds].sort())
      const unitState = level.unitAssessment
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
          const { taskRevision, rubricRevision, fingerprint } = receipt
          assert.deepEqual({ taskRevision, rubricRevision, fingerprint }, contract.parts[index].material)
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
  if (browserCase !== 'all') {
    for (const duration of ['G8', 'G9']) {
      if (browserCase === 'short-map') await check(duration, 'B', 'de', false, 1024, 650)
      if (browserCase === 'mobile-map') await check(duration, 'B', 'de', false, 390)
      if (browserCase === 'structure') { await checkUnitAndChildCards(duration); await checkTreeAndMapParents(duration) }
      if (browserCase === 'planning') { await checkGradedComparison(duration); await checkUnitAssignments(duration) }
      if (browserCase === 'guided') await checkGuidedUnitEntry(duration)
      if (browserCase === 'foreign-focus') await checkForeignFocusEntry(duration)
    }
  } else {
  await checkMathComparison()
  // Each curriculum has its own viewer and a fresh learner per first attempt.
  for (const duration of ['G8', 'G9']) {
    assert.equal(profiles[duration].E1, `composition:de-he-gym-sekii-physics-${physicsCourse.toLowerCase()}:structure:physics-e1-motion`)
    const persisted = JSON.parse((await readApi(profiles[duration].viewer, '')).personalCurriculum)
    assert.equal(persisted[scope.landscapeId].filterId, physicsCourse)
    await checkGuidedUnitEntry(duration)
    await checkForeignFocusEntry(duration)
    for (const part of ['A', 'B']) {
      for (const lang of ['de', 'en']) await check(duration, part, lang, false)
    }
    for (const width of [761, 1024, 1100]) await check(duration, 'B', 'de', false, width)
    await check(duration, 'B', 'de', false, 1024, 650)
    await check(duration, 'B', 'de', false, 390)
    await checkUnitAndChildCards(duration)
    await checkTreeAndMapParents(duration)
    await checkGradedComparison(duration)
    await checkUnitAssignments(duration)
    await checkPlanSelection(duration, false)
    await checkPlanSelection(duration, true)
    await checkStoredAssignmentActivity(duration)
    if (physicsCourse === 'LK') await checkOptionalMultiphaseAttempt(duration)
    for (const part of ['A', 'B']) await check(duration, part, 'de', true)
  }
  }
} finally {
  await browser.close()
}
