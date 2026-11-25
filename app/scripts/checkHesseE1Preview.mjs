import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const [site, api, profilesFile, physicsCourse = 'GK', browserCase = 'all'] = process.argv.slice(2)
assert(['GK', 'LK'].includes(physicsCourse), 'Expected the explicit Physics course GK or LK')
assert(['all', 'short-map', 'mobile-map', 'structure', 'planning', 'guided', 'foreign-focus'].includes(browserCase), 'Unknown focused browser case')
const throwAssessment = 'bcc56921-7107-5f5f-b721-3d5e0d7e1cd9'
const historicalMultiphaseAssessment = '2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
// Retired for all Länder on 25 Nov 2026; until then the E.1 material named it as the unit's closing exam.
const retiredMixedMotionAssessment = 'a9562b05-c54d-5635-9244-3f7dd24a8642'
const freeFallSeriesAssessment = 'f41e4e30-794e-5ce4-ba5e-cc72712cd691'
const voluntaryAssessmentIds = [throwAssessment, freeFallSeriesAssessment]
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
const e1ChildUnits = [
  ['physics-e1-uniform-motion', 'Gleichförmige Bewegung'],
  ['physics-e1-accelerated-and-free-fall', 'Freier Fall schwerer Kugeln'],
  ['physics-e1-air-and-vacuum', 'Kugel und Feder, Luft und Vakuum'],
  ['physics-e1-two-motions', 'Zwei Bewegungen zugleich'],
]
const e1ChildScope = (section, child) => section.replace(/physics-e1-motion$/, child)
// Both courses show the same six cards since the mixed GK exam left the board as an external resource.
const parentMapCardCount = 6
const freeFallMapCardCount = childMaterial => childMaterial.guidedStudyOrder.length + 3
assert(orientationGoalIds.every(id => typeof id === 'string'))
const exercises = [...new Map([...ownExercises, ...childMaterial.exercises].map(exercise => [exercise.goalId, exercise])).values()]
const canonicalPhysics = JSON.parse(await readFile(new URL(
  '../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', import.meta.url), 'utf8'))
const measurementUncertaintyGoal = canonicalPhysics.goals.find(goal => goal.title === 'Messunsicherheiten angeben')
assert(measurementUncertaintyGoal?.id, 'Expected the canonical E.1 measurement-uncertainty goal')
const parentOrientationTitle = canonicalPhysics.goals.find(goal => goal.id === unit.orientationGoalId).title
const contract = unit.assessmentContract
assert.equal(contract?.parts.length, 4, 'Expected the reviewed Hessen E.1 unit contract')
assert.deepEqual(contract.parts.map(part => part.goalId), unitPartIds)
assert.deepEqual(new Set(contract.viewIds), new Set(scope.viewIds))
const planningCreditPart = 'f13ca187-b680-5f47-b4ad-76bd474bd8a2'
const planningCreditGoal = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
const modelGoal = 'd6dc0e02-831d-4894-a61a-852bcc74f147'
assert.deepEqual(contract.planningCredits.map(credit => ({ requiredPartIds: credit.requiredPartIds, goalIds: credit.goalIds })),
  [{ requiredPartIds: [planningCreditPart], goalIds: [planningCreditGoal] }],
  'The sole reviewed planning credit is D to BES; C and voluntary ZB award no MOD credit')
const expectedPlanningCredits = passed => passed.includes(planningCreditPart) ? [planningCreditGoal] : []
const browser = await chromium.launch({ args: ['--disable-background-networking'] })
const normalize = text => text.replace(/\s+/g, ' ').trim()
const readApi = async (id, suffix) => {
  const response = await fetch(api + '/api/ui/learners/' + id + suffix)
  assert.equal(response.status, 200, suffix)
  return response.json()
}
async function openUnitAssessmentOptions(page, language = 'de', { contractRequired = true, assessmentGoalIds } = {}) {
  const entry = page.getByTestId('unit-assessment-entry')
  const open = entry.getByTestId('unit-assessment-entry-open')
  await open.waitFor()
  assert.equal(await open.innerText(), language === 'de' ? 'Direkt zur Prüfung' : 'Go directly to assessment')
  assert.equal(await entry.getByRole('button').count(), 1, 'The normal unit offers one explicit assessment entrance')
  assert.equal(await open.getAttribute('aria-expanded'), 'false')
  assert.equal(await page.getByTestId('unit-assessment-options').count(), 0,
    'Assessment parts are mounted only after the learner opens them')
  await open.click()
  const options = page.getByTestId('unit-assessment-options')
  await options.waitFor()
  assert.equal(await open.getAttribute('aria-expanded'), 'true')
  const summary = options.getByTestId('unit-assessment-summary')
  if (contractRequired || await summary.count()) {
    const parts = summary.getByRole('list', { name: language === 'de' ? 'Prüfungsteile' : 'Assessment parts', exact: true })
    await parts.waitFor()
    const rows = await parts.getByRole('listitem').all()
    assert(rows.length > 0 && (await Promise.all(rows.map(row => row.isVisible()))).every(Boolean),
      'The explicit assessment entrance reveals its actual assessment parts immediately')
  }
  if (assessmentGoalIds) {
    const offered = await options.locator('a[href*="completionGoal="]').evaluateAll(links =>
      links.map(link => new URL(link.href).searchParams.get('completionGoal')))
    assert.deepEqual(offered.sort(), [...assessmentGoalIds].sort(), 'A child offers only its own published assessment')
  }
  assert.equal(await options.getByTestId('learner-unit-assignment').count(), 0)
  assert.equal(await options.getByTestId('stored-unit-assignments').count(), 0)
  assert.equal(await options.getByText(/^(Für deinen Lernplan angerechnet|Einzeln noch nachzuweisen|Credited toward your learning plan|Still awaiting individual evidence) \(/).count(), 0)
  assert.equal(await options.getByRole('button', { name: /Unterstützung starten|Start support|Lernplan|Learning plan|Einstellungen|Settings/ }).count(), 0)
  return options
}
async function openPlanManagement(page) {
  const management = page.getByTestId('learner-plan-management')
  await management.waitFor()
  if (!await management.evaluate(node => node instanceof HTMLDetailsElement && node.open)) {
    await management.locator(':scope > summary').click()
  }
  return management
}
async function enablePlanMode(id) {
  const before = await readApi(id, '')
  if (before.followLearningPlans !== true) {
    const saved = await fetch(api + '/api/ui/learners/' + id + '/preferences', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ followLearningPlans: true }),
    })
    assert.equal(saved.status, 200, 'The separate plan test deliberately enables plan-guided learning')
  }
  assert.equal((await readApi(id, '')).followLearningPlans, true, 'Plan management is tested with the saved plan mode enabled')
}
async function selectComparisonUnitProfile(id, duration) {
  // These six disposable comparison roles deliberately begin their normal
  // phase at the same E.1 focus. A previous strict voluntary path may have
  // left its real prerequisite focus in place; choosing another exam profile
  // alone does not change that focus. Use the ordinary public focus choice.
  assert(['viewer', 'CD', 'ABCD'].some(role => profiles[duration][role] === id))
  const section = profiles[duration].E1
  const desired = 'automatic:' + section
  let current = (await readApi(id, '/state')).levelCompletion
  const planned = (await readApi(id, '/planned')).goals
  const chooseFocus = planned.length !== 1 || planned[0] !== section
  if (current.profileId === desired && !chooseFocus) return
  assert.equal(current.directAssessmentRunning, false, 'The comparison does not interrupt a running assessment')
  const results = async () => {
    const plan = await readApi(id, '/learning-plans/by-landscape?landscapeId=' + scope.landscapeId)
    return Promise.all([readApi(id, '/mastery'),
      ...[...unitPartIds, ...voluntaryAssessmentIds].map(goal => readApi(id, '/exam-passes/' + goal)),
      { planId: plan.planId, revision: plan.revision, period: plan.period, planLabel: plan.planLabel, blocks: plan.blocks }])
  }
  const before = await results()
  if (chooseFocus) {
    const response = await fetch(api + '/api/ui/learners/' + id + '/planned', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goals: [section] }),
    })
    assert.equal(response.status, 200)
    assert.deepEqual((await readApi(id, '/planned')).goals, [section])
    current = (await readApi(id, '/state')).levelCompletion
  }
  if (current.profileId !== desired) {
    assert(current.profileOptions.some(option => option.profileId === desired), 'The real E.1 profile remains selectable')
    const response = await fetch(api + '/api/ui/learners/' + id + '/level-completion/actions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'selectProfile', profileId: desired, expectedRevision: current.learnerRevision }),
    })
    assert.equal(response.status, 200)
  }
  assert.equal((await readApi(id, '/state')).levelCompletion.profileId, desired)
  assert.deepEqual(await results(), before, 'Reselecting the existing comparison scope preserves all receipts, mastery and plan blocks')
  console.log(duration, 'E.1-Vergleichsfokus öffentlich gewählt; Lernresultate, Prüfungsbelege und gespeicherter Plan unverändert OK')
}
async function setComparisonStrictMode(id, strictMode) {
  if ((await readApi(id, '')).strictMode === strictMode) return
  const results = () => Promise.all([readApi(id, '/mastery'),
    ...[...unitPartIds, ...voluntaryAssessmentIds].map(goal => readApi(id, '/exam-passes/' + goal))])
  const before = await results()
  const response = await fetch(api + '/api/ui/learners/' + id + '/preferences', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ strictMode }),
  })
  assert.equal(response.status, 200)
  assert.equal((await readApi(id, '')).strictMode, strictMode)
  assert.deepEqual(await results(), before, 'Selecting the declared normal or strict test mode never changes learning evidence')
}
async function checkActionPairShape(page, actions, start, assessment) {
  await start.waitFor()
  await assessment.waitFor()
  const [actionsElement, startElement, assessmentElement] = await Promise.all([
    actions.elementHandle(), start.elementHandle(), assessment.elementHandle(),
  ])
  assert(actionsElement && startElement && assessmentElement)
  try {
    // The enclosing card can animate; measure both actions in one browser task
    // so their positions come from the same animation frame.
    const measured = await page.evaluate(({ group, normal, alternative }) => {
      const measure = node => {
        const style = getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height,
          radii: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius,
            style.borderBottomRightRadius].map(value => Number.parseFloat(value)) }
      }
      return { route: location.pathname + location.search, viewport: { width: innerWidth, height: innerHeight },
        normal: measure(normal), alternative: measure(alternative),
        group: { clientWidth: group.clientWidth, scrollWidth: group.scrollWidth },
        documentWidth: document.documentElement.scrollWidth }
    }, { group: actionsElement, normal: startElement, alternative: assessmentElement })
    const detail = ': ' + JSON.stringify(measured)
    const { normal, alternative, viewport } = measured
    assert([normal, alternative].every(style => style.height >= 44 && style.radii.every(radius => radius > style.height / 2)),
      'Both learning actions retain their 44 px capsule form' + detail)
    assert(Math.abs(normal.height - alternative.height) <= 1,
      'Normal learning and direct assessment have the same button height' + detail)
    assert(measured.group.scrollWidth <= measured.group.clientWidth,
      'Both alternatives stay in one action group without horizontal overflow' + detail)
    assert(measured.documentWidth <= viewport.width, 'The page has no horizontal overflow' + detail)
    if (viewport.width >= 761) {
      assert(Math.abs(normal.y - alternative.y) <= 1
        && (normal.x + normal.width <= alternative.x || alternative.x + alternative.width <= normal.x),
      'At sufficient width, normal learning and the assessment alternative share one row' + detail)
    }
  } finally {
    await Promise.all([actionsElement.dispose(), startElement.dispose(), assessmentElement.dispose()])
  }
}
async function checkSingleOrientationStart(page, language = 'de') {
  const label = language === 'de' ? 'Lernen starten' : 'Start Learning'
  const start = page.getByTestId('unit-introduction-continue')
  const introduction = page.getByTestId('unit-introduction')
  const actions = introduction.locator('.unit-introduction-actions')
  const assessment = actions.getByTestId('unit-assessment-entry-open')
  await assessment.waitFor()
  await start.waitFor()
  assert.equal(await start.innerText(), label)
  assert.equal(await page.getByTestId('learner-coach-start-link').count(), 0,
    'The open introduction provides the normal start without a duplicate header action')
  const equivalent = page.getByRole('button', { name: label, exact: true })
    .or(page.getByRole('link', { name: label, exact: true }))
  await equivalent.first().waitFor()
  assert.equal(await equivalent.count(), 1,
    'The learner sees exactly one normal coach start')
  assert.equal(await page.getByTestId('unit-assessment-entry-open').count(), 1,
    'There is no second assessment entrance above the introduction')
  await actions.getByTestId('unit-introduction-continue').waitFor()
  await checkActionPairShape(page, actions, start, assessment)
}
async function checkMapSurface(page, dialog, { scopeId, title, language = 'de' } = {}) {
  const board = dialog.getByTestId('learning-map-board')
  await board.locator('.lum-flow--idle').waitFor()
  if (scopeId) assert.equal(await board.getAttribute('data-scope-id'), scopeId)
  const breadcrumb = dialog.getByRole('navigation', { name: language === 'de' ? 'Aktuelle Kartenebene' : 'Current map level', exact: true })
  await breadcrumb.waitFor()
  if (title) assert.equal(await breadcrumb.locator('[aria-current="page"]').innerText(), title)
  for (const testId of ['unit-introduction', 'unit-assessment-summary', 'unit-assessment-entry', 'learning-map-flashcard-practice']) {
    assert.equal(await dialog.getByTestId(testId).count(), 0, 'The map contains no additional learning panel: ' + testId)
  }
  assert.equal(await dialog.locator('.lum-scope-actions').count(), 0, 'The graph is not preceded by a scope-content panel')
  assert.equal(await dialog.getByRole('dialog').count(), 0, 'An exercise dialog is never embedded in the map')
  const graph = await board.locator('.lum-flow').boundingBox()
  const header = await dialog.locator('header.learner-learning-map-header').boundingBox()
  const mapControls = await board.locator('.lum-map-bottom-bar').boundingBox()
  const viewport = page.viewportSize()
  assert(graph && header && mapControls && Math.abs(graph.y - (header.y + header.height)) <= 2
    && Math.abs(graph.y + graph.height - mapControls.y) <= 2
    && Math.abs(mapControls.y + mapControls.height - viewport.height) <= 2
    && Math.abs(graph.x) <= 2 && Math.abs(graph.width - viewport.width) <= 2,
    'The graph fills the space between the header and its controls: ' + JSON.stringify({ header, graph, mapControls, viewport }))
}
async function checkUnitEntryArrowStyle(board, firstGoalId) {
  // Both arrows touch the same subject goal, so selecting it highlights both.
  const styles = await board.page().waitForFunction(id => {
    const flow = document.querySelector('[data-testid="learning-map-board"][aria-busy="false"] .lum-flow--idle')
    const appearance = selector => {
      const path = flow?.querySelector(selector + ' .react-flow__edge-path')
      if (!path) return null
      const { stroke, strokeWidth, strokeDasharray, markerEnd, opacity } = getComputedStyle(path)
      return stroke ? { stroke, strokeWidth, strokeDasharray, markerEnd, opacity } : null
    }
    const entry = appearance(`.lum-edge--unit-entry[data-id$="->${id}"]`)
    const regular = appearance(`.react-flow__edge:not(.lum-edge--unit-entry)[data-id^="sibling:${id}->"]`)
    return entry && regular && { entry, regular }
  }, firstGoalId)
  const { entry, regular } = await styles.jsonValue()
  assert.equal(regular.strokeDasharray, 'none')
  assert.notEqual(regular.markerEnd, 'none', 'The ordinary step has an arrowhead')
  assert.deepEqual(entry, regular, 'An introduction arrow looks like an ordinary arrow in the same selection state')
  return entry
}
async function checkUnitEntryOrder(page, dialog, orientationId, firstGoalId, count, direction, studyOrder) {
  const board = dialog.getByTestId('learning-map-board')
  await board.locator('.lum-flow--idle [data-entry-id]').first().waitFor()
  await dialog.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
  await page.waitForFunction(count =>
    document.querySelectorAll('.lum-canvas[aria-busy="false"] .lum-flow--idle [data-entry-id]').length === count, count)
  const nodes = await board.locator('.lum-flow [data-entry-id]').evaluateAll(cards => cards.map(card => {
    const { left, right, top, bottom } = card.getBoundingClientRect()
    return { id: card.dataset.entryId, title: card.querySelector('strong').textContent, kind: card.dataset.entryKind,
      meta: card.querySelector('.lum-node-meta').textContent, left, right, top, bottom }
  }))
  const entry = nodes.find(node => node.id === orientationId)
  const firstGoal = nodes.find(node => node.id === firstGoalId)
  assert(entry && firstGoal, 'The authored unit introduction and first subject goal are both drawn')
  assert.equal(entry.meta, 'Einstieg')
  for (const node of nodes.filter(node => node.id !== orientationId)) {
    assert(direction === 'RIGHT' ? entry.right < node.left : entry.bottom < node.top,
      `${entry.title} must precede ${node.title} in the ${direction} reading direction`)
  }
  const edges = await board.locator('.react-flow__edge.lum-edge--unit-entry').evaluateAll(items => items.map(item => item.getAttribute('aria-label')))
  const prefix = 'Geführter Lernweg: ' + entry.title + ' → '
  assert(edges.includes(prefix + firstGoal.title), 'The introduction visibly leads into the first subject goal')
  const regularTitles = new Set(nodes.filter(node => ['unit', 'cluster', 'goal'].includes(node.kind) && node.id !== orientationId)
    .map(node => node.title))
  for (const label of edges) {
    assert(label?.startsWith(prefix) && regularTitles.has(label.slice(prefix.length)),
      'A guided entry arrow leads from this unit’s own introduction to regular learning: ' + label)
  }
  if (studyOrder) {
    for (let i = 1; i < studyOrder.length; i++) {
      const from = nodes.find(node => node.id === studyOrder[i - 1])
      const to = nodes.find(node => node.id === studyOrder[i])
      assert(from && to && (direction === 'RIGHT' ? from.right < to.left : from.bottom < to.top),
        `Regular study must show ${from?.title} before ${to?.title} (${direction})`)
      await board.locator(`.react-flow__edge[data-id="sibling:${from.id}->${to.id}"]`).waitFor({ state: 'attached' })
    }
  } else {
    await checkUnitEntryArrowStyle(board, firstGoalId)
  }
}
async function checkInitialEntryViewport(page, scopeId, orientationId) {
  await page.waitForFunction(({ scopeId, orientationId }) => {
    const board = document.querySelector('.lum-canvas[aria-busy="false"]')
    if (board?.dataset.scopeId !== scopeId) return false
    const pane = board.querySelector('.lum-flow--idle .react-flow')?.getBoundingClientRect()
    const entry = board.querySelector(`[data-entry-id="${orientationId}"]`)?.getBoundingClientRect()
    return pane && entry && entry.width > 0 && entry.left >= pane.left && entry.right <= pane.right
      && entry.top >= pane.top && entry.bottom <= pane.bottom
  }, { scopeId, orientationId }, { timeout: 10000 })
}
async function enterMapScope(page, dialog, scopeId, title, language = 'de') {
  const board = dialog.getByTestId('learning-map-board')
  await board.waitFor()
  const atRequestedScope = () => page.waitForFunction(expected => {
    const current = document.querySelector('[data-testid="learner-learning-map-dialog"] [data-testid="learning-map-board"]')
    return current?.getAttribute('data-scope-id') === expected && current.getAttribute('aria-busy') === 'false'
      && current.querySelector('.lum-flow--idle')
  }, scopeId, { timeout: 10000 })
  const requestedBoard = board.and(dialog.locator('[data-scope-id="' + scopeId + '"]'))
  const drill = dialog.getByRole('button', { name: language === 'de' ? `In ${title} hineinzoomen` : `Zoom into ${title}`, exact: true })
  // The first board may still be the root while the routed selection travels
  // to its parent. Wait for the destination or its actual drill control.
  const e1Match = /^(.*:structure:)physics-e1-(?:motion|uniform-motion|accelerated-and-free-fall|air-and-vacuum|two-motions)$/.exec(scopeId)
  let arrival = requestedBoard.or(drill)
  if (e1Match) {
    arrival = arrival.or(board.and(dialog.locator('[data-scope-id="' + e1Match[1] + 'physics-e1-motion"][aria-busy="false"]')))
    for (const [child] of e1ChildUnits) {
      arrival = arrival.or(board.and(dialog.locator('[data-scope-id="' + e1Match[1] + child + '"]')))
    }
  }
  await arrival.first().waitFor({ timeout: 60000 })
  const actualScope = await board.getAttribute('data-scope-id')
  if (e1Match && actualScope !== scopeId
    && e1ChildUnits.some(([child]) => actualScope === e1Match[1] + child)) {
    // Routed assessments open their actual child. Use the same visible up
    // control as the learner before entering the parent or a sibling child.
    await dialog.getByRole('button', { name: language === 'de' ? 'Eine Ebene auftauchen' : 'Go up one level', exact: true }).click()
    await board.and(dialog.locator('[data-scope-id="' + e1Match[1] + 'physics-e1-motion"][aria-busy="false"]')).waitFor()
  }
  if (await board.getAttribute('data-scope-id') !== scopeId) {
    try {
      // On a narrow screen only the visible subset of the seven parent cards
      // is mounted. Fit that real board before clicking the child's visible
      // drill control; this is ordinary relative navigation, not a scope jump.
      if (!await drill.isVisible()) {
        await dialog.getByRole('button', { name: language === 'de' ? 'Diese Ebene einpassen' : 'Fit this level', exact: true }).click()
      }
      await drill.click({ timeout: 5000 })
    } catch (error) {
      // A routed arrival can enter this same scope while the old parent board
      // is still disappearing. Its obsolete drill must not be clicked again.
      try { await atRequestedScope() }
      catch {
        throw new Error('The requested map scope could not be entered: ' + JSON.stringify({
          route: new URL(page.url()).pathname, requested: scopeId,
          actual: await board.getAttribute('data-scope-id'),
          breadcrumb: await dialog.getByRole('navigation', { name: language === 'de' ? 'Aktuelle Kartenebene' : 'Current map level', exact: true }).innerText(),
        }), { cause: error })
      }
    }
  }
  await atRequestedScope()
  return board
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
      assert.equal(state.assessments.some(row => row.goalId === historicalMultiphaseAssessment), false)
      assert.equal(state.masteredAssessmentCount, 0)
      assert.equal(state.complete, false)
      assert.equal(state.directAssessmentRunning, false)
      const panel = await openUnitAssessmentOptions(page, lang)
      assert.equal(state.unitAssessment?.revision, contract.revision)
      assert.equal(state.unitAssessment.passed, false)
      assert.deepEqual(new Set(state.unitAssessment.parts.map(row => row.goalId)), new Set(unitPartIds))
      assert(state.unitAssessment.parts.every(row => row.passed === false))
      assert.deepEqual(state.unitAssessment.planningCreditGoalIds, [])
      assert.deepEqual(new Set(state.unitAssessment.individuallyOpenGoalIds), new Set(contract.contentGoalIds))
      const summary = panel.getByTestId('unit-assessment-summary')
      await summary.getByText(lang === 'de' ? /0 von 4 Teilen bestanden/ : /0 of 4 parts passed/).first().waitFor()
      const parts = summary.getByRole('list', { name: lang === 'de' ? 'Prüfungsteile' : 'Assessment parts' })
      assert.equal(await parts.getByRole('listitem').count(), unitPartIds.length)
      for (const part of state.unitAssessment.parts) {
        await parts.getByText(part.title[lang], { exact: true }).waitFor()
      }
      const optionalList = panel.getByRole('list', { name: lang === 'de' ? 'Freiwillige Zusatzprüfungen' : 'Optional assessments' })
      const optionalRows = optionalList.getByRole('listitem')
      assert.equal(await optionalRows.count(), voluntaryAssessmentIds.length)
      for (const assessment of optional) {
        const row = optionalRows.filter({ has: page.getByText(assessment.title[lang], { exact: true }) })
        await row.getByText(lang === 'de' ? 'Freiwillige Zusatzprüfung' : 'Optional assessment', { exact: true }).waitFor()
        const href = await row.getByRole('link').getAttribute('href')
        assert.equal(new URL(href, site).searchParams.get('completionGoal'), assessment.goalId)
      }
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
        await checkMapSurface(page, map, { language: lang })
        assert.equal(await map.getByRole('button', { name: /Zielliste anzeigen|Grafische Karte anzeigen|Show goal list|Show graph/ }).count(), 0)
        const section = profiles[duration].E1
        const ownChild = part === 'A' ? e1ChildUnits[0] : e1ChildUnits[3]
        assert.equal(await map.getByTestId('learning-map-board').getAttribute('data-scope-id'), e1ChildScope(section, ownChild[0]),
          'A direct assessment opens its actual child board')
        if (width >= 1024) assert.equal(await map.locator('.react-flow__minimap-svg').count(), 0,
          'The small child board keeps the existing compact controls policy')
        // The compact child boards have fewer than eight cards. Preserve the
        // overview geometry assertion on the actual eleven-card child.
        const freeFallChild = e1ChildUnits[1]
        await enterMapScope(page, map, e1ChildScope(section, freeFallChild[0]),
          freeFallChild[1], lang)
        await checkMapSurface(page, map, { language: lang })
        const drawing = await map.locator('.lum-flow').boundingBox()
        const overview = await map.locator('.react-flow__minimap-svg').boundingBox()
        assert(drawing && overview && overview.width > 0 && overview.height > 0
          && overview.y >= drawing.y + drawing.height - 1,
        'The interactive overview stays below the whole drawing, including the lower right goal cards.')
        assert(freeFallMapCardCount(childMaterial) >= 8,
          'Wide and narrow local search retain their real extended-controls board')
        const freeFallExam = canonicalPhysics.goals.find(goal => goal.id === childMaterial.unit.assessmentGoalId)
        const title = lang === 'de' ? freeFallExam.title : freeFallExam.titleEn
        await map.getByRole('textbox', { name: lang === 'de' ? 'In dieser Ebene suchen' : 'Search this level' }).fill(title)
        const result = map.getByRole('option').filter({ hasText: title })
        assert.equal(await result.count(), 1)
        await result.click()
        await map.locator('[data-entry-id="' + freeFallExam.id + '"].is-focused').waitFor()
        // Each required assessment now has its own child. Preserve the same
        // A/B/C readable-arrival checks through their actual direct addresses;
        // manually drilling into a board deliberately retains its own camera.
        const otherChild = part === 'A' ? e1ChildUnits[3] : e1ChildUnits[0]
        for (const [child, goalId] of [[e1ChildUnits[2], scope.childAssessmentGoalIds[0]],
          [ownChild, task.id], [otherChild, other.id]]) {
          await map.getByRole('button', { name: lang === 'de' ? 'Lernkarte schließen' : 'Close learning map', exact: true }).click()
          await page.goto(entrySite + '/learner/' + goalId + '?lang=' + lang)
          const goal = canonicalPhysics.goals.find(goal => goal.id === goalId)
          await page.getByTestId('learner-current-goal').getByRole('heading', {
            name: lang === 'de' ? goal.title : goal.titleEn, exact: true,
          }).first().waitFor()
          await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
          await map.locator('.lum-canvas[data-scope-id="' + e1ChildScope(section, child[0]) + '"][aria-busy="false"] .lum-flow--idle').waitFor()
          await checkMapSurface(page, map, { language: lang })
          await map.locator('[data-entry-id="' + goalId + '"].is-focused').waitFor()
          assert.equal(await map.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), goalId)
          if (width >= 1024) await checkMapCardExposure(page, [goalId])
        }
        // Prove the card action changes the routed goal. The direct-arrival
        // checks above deliberately selected every assessment, ending at other;
        // restore this task before navigating visibly to the other child's board.
        await map.getByRole('button', { name: lang === 'de' ? 'Lernkarte schließen' : 'Close learning map', exact: true }).click()
        await page.goto(entrySite + '/learner/' + task.id + '?lang=' + lang)
        await checkCard(page, task, lang)
        await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
        await enterMapScope(page, map, e1ChildScope(section, otherChild[0]), otherChild[1], lang)
        if (!await neighbor.isVisible()) {
          await map.getByRole('button', { name: lang === 'de' ? 'Diese Ebene einpassen' : 'Fit this level', exact: true }).click()
        }
        assert.equal(new URL(page.url()).pathname, '/learner/' + task.id,
          'Visible board navigation alone does not select the neighboring assessment')
        assert.notEqual(await map.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), other.id,
          'The neighboring card has not already been selected by its direct-arrival or search check')
        assert.equal(await map.getByRole('textbox', { name: lang === 'de' ? 'In dieser Ebene suchen' : 'Search this level' }).count(), width <= 760 ? 1 : 0,
          'The compact child retains its existing narrow-screen controls policy')
        await neighbor.click()
        await page.waitForURL(url => url.pathname === '/learner/' + other.id)
      } catch (error) {
        const input = map.getByRole('textbox').first()
        throw new Error(`${duration}/${part}/${lang}: ${JSON.stringify({ width, height,
          search: await input.inputValue({ timeout: 1000 }).catch(() => null), options: await map.getByRole('option').allTextContents(),
          selection: await map.getByTestId('native-cockpit-map').evaluateAll(nodes => nodes[0]?.getAttribute('data-selected-goal-id') ?? null),
          scope: await map.getByTestId('learning-map-board').evaluateAll(nodes => nodes[0]?.getAttribute('data-scope-id') ?? null) })}\n${(await map.innerText({ timeout: 1000 })).slice(0, 1600)}`, { cause: error })
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
    for (const [entry, introduction] of [['E1', intro], ['E1/freier-fall', childMaterial.intro]]) {
      await page.goto(site + '/nativ/' + duration + '/' + entry + '?lang=en')
      await page.getByTestId('unit-introduction').getByRole('heading', { name: introduction.en.question, exact: true }).waitFor()
      await checkSingleOrientationStart(page, 'en')
      await openUnitAssessmentOptions(page, 'en', entry === 'E1' ? {} : {
        contractRequired: false, assessmentGoalIds: [childMaterial.unit.assessmentGoalId],
      })
    }
    assert.deepEqual(await evidence(viewer), before, 'English introductions and assessment discovery never write results')
    await page.goto(site + '/nativ/' + duration + '/E1')
    const card = page.getByTestId('learner-current-goal')
    const view = card.getByTestId('unit-introduction')
    await view.getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    await checkSingleOrientationStart(page)
    await view.getByText(intro.de.scene, { exact: true }).waitFor()
    assert((await view.getByTestId('unit-introduction-context').innerText()).includes('E.1 Bewegungen und ihre Beschreibung'))
    const image = view.getByRole('img', { name: intro.de.imageAlt, exact: true })
    await image.waitFor()
    await page.waitForFunction(src => [...document.images].some(image => image.src.endsWith(src) && image.complete && image.naturalWidth > 0), intro.de.imageUrl)
    assert.deepEqual(await view.getByTestId('unit-introduction-topics').getByRole('listitem').allTextContents(), intro.de.topics)
    assert.equal((await view.innerText()).includes(childMaterial.intro.de.question), false, 'The parent overview does not replay a nested introduction')
    await openUnitAssessmentOptions(page)
    assert.deepEqual(await evidence(viewer), before)

    // A direct exam arrival may conserve drawing space, but navigating into a
    // unit is a new learning intent even while the routed exam stays selected.
    await page.goto(site + '/learner/' + tasks.B.id)
    await checkCard(page, tasks.B, 'de')
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    const map = page.getByTestId('learner-learning-map-dialog')
    await map.locator('.lum-canvas[aria-busy="false"]').waitFor()
    const actualAssessmentChild = e1ChildScope(section, 'physics-e1-two-motions')
    await checkMapSurface(page, map, { scopeId: actualAssessmentChild, title: 'Zwei Bewegungen zugleich' })
    assert.equal(await map.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), tasks.B.id)
    await map.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
    await checkMapSurface(page, map, { scopeId: section, title: 'E.1 Bewegungen und ihre Beschreibung' })
    const direction = duration === 'G8' ? 'RIGHT' : 'DOWN'
    const firstGoalId = e1ChildScope(section, 'physics-e1-uniform-motion')
    if (direction === 'DOWN') {
      await enterMapScope(page, map, e1ChildScope(section, 'physics-e1-accelerated-and-free-fall'), 'Freier Fall schwerer Kugeln')
      await map.getByRole('button', { name: 'Lernrichtung drehen', exact: true }).click()
      await map.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
      await checkMapSurface(page, map, { scopeId: section, title: 'E.1 Bewegungen und ihre Beschreibung' })
    }
    await checkUnitEntryOrder(page, map, unit.orientationGoalId, firstGoalId, parentMapCardCount, direction,
      e1ChildUnits.map(([child]) => e1ChildScope(section, child)))
    await map.getByRole('button', { name: 'In Freier Fall schwerer Kugeln hineinzoomen', exact: true }).press('Enter')
    await checkMapSurface(page, map, { scopeId: section.replace(/physics-e1-motion$/, 'physics-e1-accelerated-and-free-fall'),
      title: 'Freier Fall schwerer Kugeln' })
    await checkUnitEntryOrder(page, map, childMaterial.unit.orientationGoalId, childMaterial.guidedStudyOrder[0], freeFallMapCardCount(childMaterial), direction, childMaterial.guidedStudyOrder)
    assert.equal(await map.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), tasks.B.id)
    await map.locator('.lum-canvas[aria-busy="false"]').waitFor()
    await map.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
    await checkMapSurface(page, map, { scopeId: section, title: 'E.1 Bewegungen und ihre Beschreibung' })
    assert.equal(await map.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), tasks.B.id)
    // The parent now has unit-order context arrows. Preserve the ordinary
    // learning-arrow/style regression on its real child-owned subject board.
    await map.getByRole('button', { name: 'In Freier Fall schwerer Kugeln hineinzoomen', exact: true }).click()
    await checkMapSurface(page, map, { scopeId: e1ChildScope(section, 'physics-e1-accelerated-and-free-fall'),
      title: 'Freier Fall schwerer Kugeln' })
    const board = map.getByTestId('learning-map-board')
    const firstChildGoalId = childMaterial.guidedStudyOrder[0]
    const previous = await checkUnitEntryArrowStyle(board, firstChildGoalId)
    await board.locator(`[data-entry-id="${firstChildGoalId}"] .lum-node-main`).click()
    await board.locator(`[data-entry-id="${firstChildGoalId}"] .lum-node-main[aria-pressed="true"]`).waitFor()
    const highlighted = await checkUnitEntryArrowStyle(board, firstChildGoalId)
    assert.notEqual(highlighted.stroke, previous.stroke, 'Selecting the subject goal highlights both arrows')
    await map.getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
    assert.deepEqual(await evidence(viewer), before, 'Explicit unit entry never records an orientation result')

    const exercise = exercises.find(entry => entry.goalId === '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2').de
    await page.goto(site + '/learner/89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2')
    await card.getByRole('button', { name: 'Als aktuelles Ziel auswählen', exact: true }).last().click()
    await page.waitForURL(url => url.pathname === '/learner/' + unit.orientationGoalId)
    assert.equal(await page.getByRole('dialog', { name: exercise.title, exact: true }).count(), 0)
    assert.deepEqual(await evidence(viewer), before, 'Trying an exercise redirects to the introduction without results')

    await page.goto(site + '/vergleich/' + duration + '/elterneinstieg')
    await view.getByText('Einstieg abgeschlossen.', { exact: true }).waitFor()
    const childSection = section.replace(/physics-e1-motion$/, 'physics-e1-accelerated-and-free-fall')
    await page.goto(site + '/learner/' + childSection)
    await view.getByRole('heading', { name: childMaterial.intro.de.question, exact: true }).waitFor()
    await checkSingleOrientationStart(page)
    await view.getByRole('img', { name: childMaterial.intro.de.imageAlt, exact: true }).waitFor()
    assert.equal((await view.innerText()).includes(intro.de.scene), false, 'The nested introduction shows its own scene')
    assert((await view.getByTestId('unit-introduction-context').innerText()).includes('E.1 Bewegungen und ihre Beschreibung'))
    await openUnitAssessmentOptions(page, 'de', { contractRequired: false, assessmentGoalIds: [childMaterial.unit.assessmentGoalId] })
    const childExercise = childMaterial.exercises[0]
    await page.goto(site + '/learner/' + childExercise.goalId)
    await card.getByRole('button', { name: 'Als aktuelles Ziel auswählen', exact: true }).last().click()
    await page.waitForURL(url => url.pathname === '/learner/' + childMaterial.unit.orientationGoalId)
    await view.getByRole('heading', { name: childMaterial.intro.de.question, exact: true }).waitFor()
    assert.deepEqual(await readApi(parentOriented, '/mastery'), parentBefore, 'Child resource gating preserves the parent confirmation')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await view.getByRole('heading', { name: childMaterial.intro.de.question, exact: true }).waitFor()
    await checkSingleOrientationStart(page)

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

async function checkSubjectGoalAssessmentEntry(duration) {
  const id = profiles[duration].viewer
  const before = await evidence(id)
  const page = await browser.newPage({ viewport: { width: duration === 'G8' ? 1440 : 390, height: 900 },
    reducedMotion: 'reduce', serviceWorkers: 'block' })
  page.setDefaultTimeout(60000)
  try {
    for (const language of ['de', 'en']) {
      await page.goto(site + '/nativ/' + duration + '/E1?lang=' + language)
      await page.waitForURL(url => decodeURIComponent(url.pathname) === '/learner/' + profiles[duration].E1)
      await page.getByTestId('learner-current-goal').getByTestId('unit-introduction').waitFor()
      await page.goto(site + '/learner/' + measurementUncertaintyGoal.id)
      await page.getByTestId('learner-current-goal').getByRole('heading', {
        name: language === 'de' ? measurementUncertaintyGoal.title : measurementUncertaintyGoal.titleEn, exact: true,
      }).first().waitFor()
      const actions = page.getByTestId('learner-header-start-actions')
      const start = actions.getByTestId('learner-coach-start-link')
      const assessment = actions.getByTestId('unit-assessment-entry-open')
      assert.equal(await page.getByTestId('unit-assessment-entry-open').count(), 1,
        'The individual E.1 goal has exactly one assessment entrance, in its header')
      assert.equal(await page.getByTestId('learner-current-goal').getByTestId('unit-assessment-entry-open').count(), 0,
        'The goal card does not repeat its header assessment action')
      await checkActionPairShape(page, actions, start, assessment)
      await openUnitAssessmentOptions(page, language, {
        contractRequired: false, assessmentGoalIds: [childMaterial.unit.assessmentGoalId],
      })
    }
    assert.deepEqual(await evidence(id), before, 'Inspecting the subject-goal header and assessment choices preserves results')
    console.log(duration, physicsCourse, 'Messunsicherheiten: genau ein Prüfungszugang neben Lernen starten im Kopf, DE/EN, gleiche 44px-Kapselform ohne Überlauf OK')
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
    await card.getByRole('button', { name: 'Als aktuelles Ziel auswählen', exact: true }).last().click()
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
    await card.getByRole('button', { name: 'Als aktuelles Ziel auswählen', exact: true }).last().click()
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
    await card.getByRole('button', { name: 'Als aktuelles Ziel auswählen', exact: true }).last().click()
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

async function checkExerciseMaterial(owner, exercise) {
  const summary = owner.getByText(exercise.title, { exact: true })
  const material = owner.locator('details').filter({ has: owner.page().getByText(exercise.prompt, { exact: true }) }).last()
  await summary.click()
  await material.getByText(exercise.prompt, { exact: true }).waitFor()
  if (exercise.evidenceCriteria) {
    assert.deepEqual(await material.getByRole('listitem').allTextContents(), exercise.evidenceCriteria)
  }
  const solution = material.getByText(exercise.solution, { exact: true })
  assert.equal(await solution.isVisible(), false)
  await material.getByText('Hinweis anzeigen', { exact: true }).click()
  await material.getByText(exercise.hint, { exact: true }).waitFor()
  await material.getByText('Lösung vergleichen', { exact: true }).click()
  await solution.waitFor()
  await summary.click()
}
async function checkTreeAndMapParents(duration) {
  const { E1: section, oriented } = profiles[duration]
  const before = await evidence(oriented)
  const pathTime = 'ae67bcf1-f3ee-50d6-9a12-25a159dff659'
  const acceleration = 'e4b38061-1f28-43ad-8371-a3e7c0e81856'
  const uniformSection = e1ChildScope(section, 'physics-e1-uniform-motion')
  const childSection = e1ChildScope(section, 'physics-e1-accelerated-and-free-fall')
  const launchSection = e1ChildScope(section, 'physics-e1-two-motions')
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
    for (const [child] of e1ChildUnits) await expand(e1ChildScope(section, child))
    const childTreeOrder = await treeRow(childSection).evaluate(row =>
      Array.from(row.parentElement.querySelectorAll(':scope > * > * > [data-goal-id]'),
        child => child.dataset.goalId))
    assert.deepEqual(childTreeOrder, [childMaterial.unit.orientationGoalId,
      ...childMaterial.guidedStudyOrder, freeFallSeriesAssessment],
    'Direct child rows retain the reviewed teaching sequence, followed by the separate voluntary assessment.')
    assert.equal(await treeRow(preparationFolder).count(), 0, 'The single preparation goal has no extra container.')
    const directTreeParent = async id => {
      const row = treeRow(id)
      await row.waitFor()
      return row.evaluate(element => element.parentElement.parentElement.parentElement
        .querySelector(':scope > [data-goal-id]')?.getAttribute('data-goal-id'))
    }
    const expected = [[pathTime, uniformSection], [tasks.A.id, uniformSection],
      [acceleration, childSection], [tasks.B.id, launchSection]]
    for (const [id, parent] of expected) assert.equal(await directTreeParent(id), parent, 'Tree parent of ' + id)
    await treeRow(pathTime).getByText('Bewegungen mit Weg-Zeit-Diagrammen beschreiben', { exact: true }).waitFor()
    const sourceId = '82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3'
    const sourceTitle = 'Waagerechter Wurf und Superposition'
    const referenceFrames = '68c90ba6-c438-463c-9a53-cf61062d416a'
    const horizontalLaunch = '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'
    assert.equal(await treeRow(sourceId).count(), 0)
    assert.equal(await directTreeParent(horizontalLaunch), launchSection)
    const treeEntries = await treeRow(section).locator('..').locator('[data-goal-id]').evaluateAll((rows, section) =>
      rows.filter(row => row.dataset.goalId !== section).map(row => [row.dataset.goalId, row.parentElement.parentElement.parentElement
        .querySelector(':scope > [data-goal-id]').dataset.goalId]), section)
    assert.equal(treeEntries.some(([id]) => id === referenceFrames), false,
      'Reference frames remains in E.3; only horizontal launch belongs to E.1.')
    const launchExams = [unitPartIds[1], throwAssessment]
    const siblings = treeEntries.filter(([, parent]) => parent === launchSection).map(([id]) => id)
    for (const exam of launchExams) {
      assert(siblings.includes(horizontalLaunch) && siblings.indexOf(horizontalLaunch) < siblings.indexOf(exam),
        'The tree places horizontal launch before each of its two independent assessments')
    }
    const expectedTreeCount = 26
    assert.equal(treeEntries.length, expectedTreeCount)
    assert.equal(treeEntries.some(([id]) => id === historicalMultiphaseAssessment), false)

    const open = page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open')
    await open.click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    const board = dialog.getByTestId('learning-map-board')
    const mapEntries = []
    const boards = [[section, 'E.1 Bewegungen und ihre Beschreibung', parentMapCardCount],
      ...e1ChildUnits.map(([child, title], index) => [e1ChildScope(section, child), title,
        [6, freeFallMapCardCount(childMaterial), 4, 4][index]])]
    for (const [parent, title, count] of boards) {
      await enterMapScope(page, dialog, parent, title)
      await dialog.getByRole('status').filter({ hasText: count + ' Bereiche.' }).waitFor()
      await checkMapSurface(page, dialog, { scopeId: parent, title })
      await dialog.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
      await page.waitForFunction(count =>
        document.querySelectorAll('.lum-canvas[aria-busy="false"] .lum-flow [data-entry-id]').length === count, count)
      assert.equal(await board.getAttribute('data-scope-id'), parent)
      const resources = new Map([[unit.flashcardGoalId, 'Aus dem Stapel „Einführungsphase“']])
      // External resources are displayed on their actual board, outside the owned tree.
      assert.equal(unit.assessmentGoalId, undefined, 'The E.1 parent names no single closing exam; its contract has four parts')
      for (const node of await board.locator('.lum-flow [data-entry-id]').all()) {
        const id = await node.getAttribute('data-entry-id')
        if (resources.has(id)) {
          await node.getByText(resources.get(id), { exact: true }).waitFor()
          resources.delete(id)
        } else mapEntries.push([id, parent])
      }
      assert.equal(resources.size, 0, 'Every declared external resource is present on ' + title)
      assert.equal(await board.locator('[data-entry-id="' + historicalMultiphaseAssessment + '"]').count(), 0)
      assert.equal(await board.locator('[data-entry-id="' + retiredMixedMotionAssessment + '"]').count(), 0)
      assert.equal(await board.locator('[data-entry-id="' + preparationFolder + '"]').count(), 0)
      if (parent === launchSection) {
        const card = id => board.locator(`[data-entry-id="${id}"]`)
        const topic = await card(horizontalLaunch).boundingBox()
        assert(topic)
        for (const exam of launchExams) {
          const assessment = await card(exam).boundingBox()
          assert(assessment && topic.x + topic.width < assessment.x,
            'Both assessments follow horizontal launch in the horizontal map')
          await board.locator(`.react-flow__edge[data-id="sibling:${horizontalLaunch}->${exam}"]`).waitFor({ state: 'attached' })
        }
        for (const [from, to] of [launchExams, [...launchExams].reverse()]) {
          assert.equal(await board.locator(`.react-flow__edge[data-id="sibling:${from}->${to}"]`).count(), 0,
            'The two assessments are independent of each other')
        }
      }
      if (parent === uniformSection) {
        const pathNode = board.locator('[data-entry-id="' + pathTime + '"]')
        assert((await pathNode.innerText()).includes('Bewegungen mit Weg-Zeit-Diagrammen beschreiben'))
      }
    }
    assert.deepEqual(mapEntries.sort(), treeEntries.sort(), 'All 26 E.1 owned parent-child relations agree.')
    await dialog.getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
    // The cut keeps these two goals in different units. Each direct address and
    // local search must select that exact goal without selecting its source cluster.
    const sourceGoals = [
      [referenceFrames, 'Bezugssysteme und Geschwindigkeitsüberlagerung',
        section.replace(/physics-e1-motion$/, 'he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49'),
        'E.3 Kreisbewegung (Wurf bei E.1)'],
      [horizontalLaunch, 'Waagerechter Wurf analysieren', launchSection, 'Zwei Bewegungen zugleich'],
    ]
    // Small boards expose their local search on the narrow-screen layout.
    await page.setViewportSize({ width: 390, height: 900 })
    for (const [id, title, parent, parentTitle] of sourceGoals) {
      await page.goto(site + '/learner/' + id)
      await page.getByTestId('learner-current-goal').getByRole('heading', { name: title, exact: true }).first().waitFor()
      await open.click()
      await dialog.locator('.lum-canvas[data-scope-id="' + parent + '"][aria-busy="false"]').waitFor()
      await checkMapSurface(page, dialog, { scopeId: parent, title: parentTitle })
      await dialog.getByRole('textbox', { name: 'In dieser Ebene suchen' }).fill(title)
      const options = dialog.getByRole('option')
      assert.equal(await options.count(), 1)
      await options.filter({ hasText: title }).click()
      await page.waitForURL(url => decodeURIComponent(url.pathname) === '/learner/' + id)
      assert.equal(await dialog.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), id)
      await dialog.getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
    }
    // A multi-goal source retains its own address. Its members now span E.1/E.3,
    // so its overview opens at the common root without choosing either member.
    await page.goto(site + '/learner/' + sourceId)
    await page.getByTestId('learner-current-goal').getByRole('heading', { name: sourceTitle, exact: true }).first().waitFor()
    assert.equal(new URL(page.url()).pathname, '/learner/' + sourceId)
    await open.click()
    await dialog.locator('.lum-canvas[data-scope-id="__learner_goal_map_root__"][aria-busy="false"]').waitFor()
    assert.equal(new URL(page.url()).pathname, '/learner/' + sourceId)
    await dialog.getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
    // The single prerequisite is directly placed in the first child; the old
    // synthetic preparation folder is absent from both current navigation trees.
    await page.goto(site + '/learner/' + pathTime)
    await page.getByTestId('learner-current-goal').getByRole('heading', {
      name: 'Bewegungen mit Weg-Zeit-Diagrammen beschreiben', exact: true,
    }).waitFor()
    assert.equal(new URL(page.url()).pathname, '/learner/' + pathTime)
    for (const exercise of exercises) {
      await page.goto(site + '/learner/' + exercise.goalId)
      await checkExerciseMaterial(page.getByTestId('learner-current-goal'), exercise.de)
    }
    assert.deepEqual(await evidence(oriented), before)
    console.log(duration, `Alle ${expectedTreeCount} E.1-Elternpfade (${physicsCourse}), externe Ressourcen auf allen fünf Ebenen, getrennte E.1-/E.3-Suche und direkte Aufrufe beider Ziele sowie ihrer kanonischen Gruppe bestätigt.`)
  } finally {
    await page.close()
  }
}
async function checkUnitAndChildCards(duration) {
  const { viewer, oriented, E1: section } = profiles[duration]
  const before = await evidence(viewer)
  const orientedBefore = await evidence(oriented)
  const page = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
  page.setDefaultTimeout(90000)
  try {
    const entry = site + '/nativ/' + duration + '/'
    await page.goto(entry + 'E1')
    const card = page.getByTestId('learner-current-goal')
    await card.getByRole('heading', { name: intro.de.question, exact: true }).waitFor()
    assert.equal(decodeURIComponent(new URL(page.url()).pathname), '/learner/' + section)
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    await enterMapScope(page, dialog, section, 'E.1 Bewegungen und ihre Beschreibung')
    await checkMapSurface(page, dialog, { scopeId: section, title: 'E.1 Bewegungen und ihre Beschreibung' })
    await checkInitialEntryViewport(page, section, unit.orientationGoalId)
    if (duration === 'G9') {
      const rotationScope = e1ChildScope(section, 'physics-e1-accelerated-and-free-fall')
      await enterMapScope(page, dialog, rotationScope, 'Freier Fall schwerer Kugeln')
      await checkInitialEntryViewport(page, rotationScope, childMaterial.unit.orientationGoalId)
      await dialog.getByRole('button', { name: 'Lernrichtung drehen', exact: true }).click()
      await dialog.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
      await checkMapSurface(page, dialog, { scopeId: section, title: 'E.1 Bewegungen und ihre Beschreibung' })
      await checkInitialEntryViewport(page, section, unit.orientationGoalId)
    }
    // The child fits on the overview. Its own entry must be visible as soon
    // as the learner drills in, before changing the child's camera.
    const childSection = section.replace(/physics-e1-motion$/, 'physics-e1-accelerated-and-free-fall')
    await dialog.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
    await enterMapScope(page, dialog, childSection, 'Freier Fall schwerer Kugeln')
    await checkInitialEntryViewport(page, childSection, childMaterial.unit.orientationGoalId)
    await dialog.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
    await checkMapSurface(page, dialog, { scopeId: section, title: 'E.1 Bewegungen und ihre Beschreibung' })
    await dialog.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
    // The explicit resource node opens its content in the Cockpit; the map itself only shows the graph.
    await dialog.locator('[data-entry-id="' + unit.flashcardGoalId + '"] .lum-node-main').click()
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(new URL(page.url()).pathname, '/learner/' + unit.orientationGoalId)
    await card.getByTestId('unit-introduction').waitFor()
    assert.deepEqual(await evidence(viewer), before, 'Presentation and redirection never write results')
    // Confirmed introductions unlock entry, not subject recall. This learner
    // has exactly the two orientation results and no mastered card origins.
    await page.goto(site + '/vergleich/' + duration + '/einstiege')
    await card.getByTestId('unit-introduction').getByText('Einstieg abgeschlossen.', { exact: true }).waitFor()
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    await enterMapScope(page, dialog, section, 'E.1 Bewegungen und ihre Beschreibung')
    await checkMapSurface(page, dialog, { scopeId: section, title: 'E.1 Bewegungen und ihre Beschreibung' })
    await dialog.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
    await dialog.locator('[data-entry-id="' + unit.flashcardGoalId + '"] .lum-node-main').click()
    await page.getByRole('heading', { name: 'Noch keine Karte freigeschaltet', exact: true }).waitFor()
    await page.getByText('7 weitere Karten kommen dazu, sobald du ihre Lernziele geschafft hast.', { exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).count(), 0,
      'Completing the two introductions does not unlock subject cards or write recall results')
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
    await page.goto(site + '/vergleich/mathematik', { waitUntil: 'domcontentloaded', timeout: 90000 })
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
  const options = await openUnitAssessmentOptions(page)
  const summary = options.getByTestId('unit-assessment-summary')
  const directChecks = summary.getByTestId('unit-assessment-direct-evidence')
  assert.equal(await directChecks.count(), 4)
  assert.equal(await summary.getByTestId('unit-assessment-credited-evidence').count(), 0,
    'The assessment choice lists direct part results; preparation credit stays in the learning map')
  for (const check of await directChecks.all()) assert(await check.isVisible())
  await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
  const map = page.getByTestId('learner-learning-map-dialog')
  const section = profiles[duration].E1
  const direct = 'learning-map-direct-evidence'
  const credited = 'learning-map-credited-evidence'
  const entry = id => map.locator('[data-entry-id="' + id + '"]')
  const markers = async testId => map.getByTestId(testId).evaluateAll(nodes =>
    nodes.map(node => node.closest('[data-entry-id]').getAttribute('data-entry-id')))
  const directGoals = new Set()
  const creditedGoals = new Set()
  const creditGoalsFor = partId => expectedPlanningCredits([partId])
  const childParts = [unitPartIds[0], unitPartIds[3], unitPartIds[2], unitPartIds[1]]
  let greenShape
  // Required parts remain one parent contract, with their evidence on each
  // part's real child board. No direct result is transferred to the parent.
  for (const [child, title, partId] of [[null, 'E.1 Bewegungen und ihre Beschreibung', null],
    ...e1ChildUnits.map(([child, title], index) => [child, title, childParts[index]])]) {
    await enterMapScope(page, map, child ? e1ChildScope(section, child) : section, title)
    await map.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
    await map.locator('.lum-flow--idle').waitFor()
    if (partId) {
      const check = entry(partId).getByTestId(direct)
      await check.waitFor()
      greenShape ??= await check.locator('.lucide-check').evaluate(node => node.innerHTML)
      for (const goalId of creditGoalsFor(partId)) {
        const credit = entry(goalId).getByTestId(credited)
        await credit.waitFor()
        assert.equal(await credit.locator('.lucide-check').evaluate(node => node.innerHTML), greenShape)
      }
    }
    const currentDirect = await markers(direct)
    const currentCredits = await markers(credited)
    assert.deepEqual(new Set(currentDirect), new Set(partId ? [partId] : []),
      'Only the actual passed part has direct evidence on ' + title)
    assert.deepEqual(new Set(currentCredits), new Set(partId ? creditGoalsFor(partId) : []),
      'Only the exact reviewed planning credit appears on ' + title)
    for (const id of currentDirect) directGoals.add(id)
    for (const id of currentCredits) creditedGoals.add(id)
    if (child === 'physics-e1-two-motions') {
      const horizontalLaunch = entry('89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2')
      await horizontalLaunch.waitFor()
      assert.equal(await horizontalLaunch.getByTestId(credited).count(), 0)
      assert.equal(await horizontalLaunch.getByTestId(direct).count(), 0)
    }
    if (child === 'physics-e1-air-and-vacuum') {
      await entry(modelGoal).waitFor()
      assert.equal(await entry(modelGoal).getByTestId(credited).count(), 0,
        'Passing C does not award MOD planning credit')
    }
  }
  assert.deepEqual(directGoals, new Set(unitPartIds))
  assert.deepEqual(creditedGoals, new Set(scope.childAssessmentGoalIds.flatMap(creditGoalsFor)))
  assert.equal(creditedGoals.size, 1, 'Only BES has an assessment-backed planning credit')
  // The traffic example moved out of E.1. Inspect its real board in a separate
  // tab of this same learner context, preserving the caller's open plan card.
  const otherContext = await browser.newContext({ storageState: await page.context().storageState(),
    viewport: page.viewportSize(), reducedMotion: 'reduce', serviceWorkers: 'block' })
  const other = await otherContext.newPage()
  try {
    const traffic = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
    await other.goto(site + '/learner/' + traffic)
    await other.getByTestId('learner-current-goal').waitFor()
    await other.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    const otherMap = other.getByTestId('learner-learning-map-dialog')
    await otherMap.locator('.lum-flow--idle').waitFor()
    await otherMap.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
    const trafficNode = otherMap.locator('[data-entry-id="' + traffic + '"]')
    await trafficNode.waitFor()
    assert.equal(await trafficNode.getByTestId(credited).count(), 0)
    assert.equal(await trafficNode.getByTestId(direct).count(), 0)
  } finally { await otherContext.close() }
  console.log(duration, 'E.1-Karte: vier direkte Prüfungsbelege in vier Kindern, genau ein graues BES-Häkchen, WW und das E.2-Verkehrsbeispiel ohne Beleg OK')
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
    await enablePlanMode(id)
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
      await openPlanManagement(page)
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
        await openPlanManagement(page)
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
    await enablePlanMode(profiles[duration][profile])
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
        await openPlanManagement(page)
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
        const options = await openUnitAssessmentOptions(page)
        await options.locator('a[href*="completionGoal=' + unitPartIds[0] + '"]').click()
        assert.equal(new URL(page.url()).searchParams.get('completionGoal'), unitPartIds[0])
      } else if (route === 'ABCD') {
        assert.equal(plan.continueReason, 'unit-assignment-completed')
        assert.equal(plan.nextEligibleGoal, null)
        assert((await normalPlan.innerText()).includes('Auftrag abgeschlossen'))
        const beforeChoice = await readApi(id, '/mastery')
        await voluntary.click()
        const offered = normalPlan.getByRole('button', { name: 'Idealisierungen und Grenzen von Bewegungsmodellen', exact: true })
        assert(await offered.isVisible())
        await checkEvidenceMap(page, duration)
        await page.keyboard.press('Escape')
        await page.getByTestId('learner-learning-map-dialog').waitFor({ state: 'hidden' })
        await offered.click()
        await page.getByTestId('learner-current-goal').getByRole('heading', { name: 'Idealisierungen und Grenzen von Bewegungsmodellen', exact: true }).first().waitFor()
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
          assert.equal(await current.getByRole('button', { name: /^Üben/ }).count(), 0)
          assert.equal(await current.getByText(exercise.prompt, { exact: true }).isVisible(), false)
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
    await enablePlanMode(id)
    const path = '/learning-plans/by-landscape?landscapeId=' + scope.landscapeId
    const before = withExistingPlan ? await readApi(id, path) : null
    await page.goto(site + (withExistingPlan ? '/nativ/' : '/testlauf/') + duration + '/A')
    await openPlanManagement(page)
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
    await openPlanManagement(page)
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
      await openPlanManagement(page)
      const stored = page.getByTestId('stored-unit-assignments').locator(`[data-block-id="${selected.id}"]`)
      await stored.getByRole('button', { name: 'Einheitenauftrag wieder aktivieren', exact: true }).click()
      await stored.getByRole('button', { name: 'Einheitenauftrag pausieren', exact: true }).waitFor()
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
    await setComparisonStrictMode(id, strict)
    await page.goto(new URL(href, site).href)
    const options = await openUnitAssessmentOptions(page)
    const summary = options.getByTestId('unit-assessment-summary')
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
    const tree = page.locator('.learner-tree-navigation')
    const section = profiles[duration].E1
    for (const parent of [section, section.replace(/physics-e1-motion$/, 'physics-e1-accelerated-and-free-fall')]) {
      const expand = tree.locator('[data-goal-id="' + parent + '"]').locator('button[aria-expanded]').first()
      await expand.waitFor()
      if (await expand.getAttribute('aria-expanded') === 'false') await expand.click()
    }
    await tree.locator('[data-goal-id="' + target + '"]').getByText(title, { exact: true }).click()
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
    assert.equal(now.levelCompletion.profileId, 'automatic:personal-curriculum',
      'Voluntary regular study leaves the assessment scope for the actual personal-curriculum profile')
    assert.equal((await readApi(id, '')).strictMode, strict)
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
async function checkOptionalFallSeriesAttempt(duration) {
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
    const parentSection = profiles[duration].E1
    const freeFallSection = parentSection.replace(/physics-e1-motion$/, 'physics-e1-accelerated-and-free-fall')
    for (const targetId of [parentSection, freeFallSection]) {
      const expand = tree.locator('[data-goal-id="' + targetId + '"]').locator('button[aria-expanded]').first()
      await expand.waitFor()
      if (await expand.getAttribute('aria-expanded') === 'false') await expand.click()
    }
    const goal = tree.locator('[data-goal-id="' + freeFallSeriesAssessment + '"]')
    await goal.getByText('Prüfungsaufgabe: Freien Fall in zwei eigenen Messreihen untersuchen', { exact: true }).click()
    const shortcut = page.getByTestId('selected-goal-assessment-shortcuts')
      .getByRole('link', { name: 'Prüfung direkt versuchen', exact: true })
    const target = new URL(await shortcut.getAttribute('href'), site)
    assert.equal(target.searchParams.get('completionGoal'), freeFallSeriesAssessment)
    await shortcut.click()
    await launchAssessment(page, freeFallSeriesAssessment)
    const running = await readApi(id, '/state')
    assert.equal(running.levelCompletion.directAssessmentRunning, true)
    assert.equal(running.activeGoal.id ?? running.activeGoal.goalId, freeFallSeriesAssessment)
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
    console.log(duration, 'Freiwillige Fallprüfung begonnen und vor der Abgabe verlassen; C+D und Einzelmastery erhalten OK')
  } finally {
    await context.close()
  }
}
async function checkGradedComparison(duration) {
  const physics = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
  const firstPlanGoal = unit.orientationGoalId
  const comparison = await browser.newPage()
  try {
    for (const scenario of ['viewer', 'CD', 'ABCD']) {
      await selectComparisonUnitProfile(profiles[duration][scenario], duration)
      await setComparisonStrictMode(profiles[duration][scenario], false)
      // Selecting an assessment profile deliberately leaves plan guidance.
      // This comparison then explicitly exercises the existing saved plan.
      await enablePlanMode(profiles[duration][scenario])
    }
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
      assert(!scheduled.includes(throwAssessment) && !scheduled.includes(historicalMultiphaseAssessment) && !scheduled.includes(freeFallSeriesAssessment))
      assert.equal(gauge.completed, count + (count ? 1 : 0),
        'Only passed parts and the sole D to BES planning credit complete plan positions')
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
      const credits = expectedPlanningCredits([...passed])
      assert.deepEqual(new Set(unitState.planningCreditGoalIds), new Set(credits))
      assert(!unitState.planningCreditGoalIds.includes(modelGoal), 'Even ABCD confers no MOD planning credit')
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
      if (browserCase === 'guided') { await checkGuidedUnitEntry(duration); await checkSubjectGoalAssessmentEntry(duration) }
      if (browserCase === 'foreign-focus') await checkForeignFocusEntry(duration)
    }
  } else {
  await checkMathComparison()
  // Each curriculum has its own viewer and a fresh learner per first attempt.
  for (const duration of ['G8', 'G9']) {
    assert.equal(profiles[duration].E1, `composition:de-he-gym-sekii-physics-${physicsCourse.toLowerCase()}:structure:physics-e1-motion`)
    const persisted = JSON.parse((await readApi(profiles[duration].viewer, '')).personalCurriculum)
    assert.equal(persisted[scope.landscapeId].filterId, physicsCourse)
    const materials = await readApi(profiles[duration].viewer, '/content-selection')
    assert.ok(materials.packages.some(item => item.packageId === 'enpasos-simufisica'),
      'The preview must offer the free-fall simulation in the ordinary material settings')
    await checkGuidedUnitEntry(duration)
    await checkSubjectGoalAssessmentEntry(duration)
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
    await checkOptionalFallSeriesAttempt(duration)
    for (const part of ['A', 'B']) await check(duration, part, 'de', true)
  }
  }
} finally {
  await browser.close()
}
