import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const landscapeId = 'trainer-class-file-landscape'
const studentId = '11111111-1111-4111-8111-111111111111'
const password = 'Sicherer Kurs 12!'
const classSession = {
  id: 'trainer-class-file-local-class',
  name: 'Physik LK 12',
  landscapeId,
  activeFilter: 'LK',
  personalConfig: {
    [landscapeId]: { selected: true, filterId: 'LK' },
  },
  students: [{ id: studentId, name: 'Ada Lovelace', accessMode: 'learner-id' }],
  currentGoalId: 'trainer-class-file-root',
  source: 'local-generated',
}

const rootGoalId = 'trainer-class-file-root'
const landscape = {
  landscapeId,
  locale: 'de-DE',
  subject: 'Physik',
  frameworkId: 'trainer-class-file-test',
  title: 'Physik Klassendateitest',
  description: 'Deterministische Landschaft für den geschützten Klassenexport.',
  filters: [
    { id: 'all', label: 'Alle' },
    { id: 'LK', label: 'Leistungskurs' },
  ],
  goals: [{
    id: rootGoalId,
    title: 'Physik Wurzel',
    description: 'Die lernende Person kann den Testkontext nachvollziehen.',
    core: true,
    weight: 1,
    tags: ['root'],
    dimensionTags: {
      framework: 'trainer-class-file-test',
      demandLevel: 'AB1',
      processCompetencies: [],
      guidingIdeas: [],
      phase: 'GLOBAL',
      area: 'Test',
    },
    requires: [],
    contains: [],
    examples: [],
  }],
}

const source = await import('node:fs/promises').then(({ readFile }) => readFile(
  new URL('../src/views/TrainerView.tsx', import.meta.url),
  'utf8',
))
assert(source.includes('encryptTrainerClassFileContent(classFileDialog.session, password)'))
assert(source.includes('classifyTrainerClassFileContent(content)'))
assert(source.includes('decryptTrainerClassFileContent(classFileDialog.content, password)'))
assert(source.includes('MAX_TRAINER_CLASS_FILE_SIZE'))
assert(!source.includes('skillpilot-class-${session.name'), 'the plaintext class name must not enter the filename')
assert(!source.includes('const data = JSON.stringify(session'), 'class export must not emit plaintext JSON')

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/trainerClassFileUi.html',
)

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-background-networking',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-sandbox',
    ],
  })
  const context = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin' })
  await context.addInitScript((seed) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', seed.landscapeId)
    localStorage.setItem('skillpilot_classes', JSON.stringify([seed.classSession]))
  }, { landscapeId, classSession })

  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', error => browserErrors.push(error.message))
  await page.route('**/api/ui/**', async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (url.pathname === '/api/ui/landscapes') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ summaries: [landscape] }),
      })
      return
    }
    if (url.pathname === `/api/ui/landscapes/${landscapeId}/closure`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([landscape]),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/trainerClassFileUi.html`)
  await page.getByRole('heading', { name: 'Kursorganisation' }).waitFor()
  await page.getByText(classSession.name).waitFor()

  await page.getByTitle('Klasse passwortgeschützt speichern').click()
  const exportDialog = page.getByRole('dialog', { name: 'Klassendatei schützen' })
  await exportDialog.waitFor()
  await exportDialog.getByLabel('Passwort', { exact: true }).fill('kurz')
  await exportDialog.getByLabel('Passwort bestätigen').fill('kurz')
  await exportDialog.getByRole('button', { name: 'Geschützte Datei herunterladen' }).click()
  assert(
    await exportDialog.getByText('Das Passwort muss mindestens 15 Zeichen lang sein.').isVisible(),
    'the export dialog enforces the stronger class-file password floor',
  )

  await exportDialog.getByLabel('Passwort', { exact: true }).fill(password)
  await exportDialog.getByLabel('Passwort bestätigen').fill(`${password}-falsch`)
  await exportDialog.getByRole('button', { name: 'Geschützte Datei herunterladen' }).click()
  assert(
    await exportDialog.getByText('Die Passwörter stimmen nicht überein.').isVisible(),
    'the export dialog requires password confirmation',
  )

  await exportDialog.getByLabel('Passwort bestätigen').fill(password)
  const downloadPromise = page.waitForEvent('download')
  await exportDialog.getByRole('button', { name: 'Geschützte Datei herunterladen' }).click()
  const download = await downloadPromise
  assert.match(download.suggestedFilename(), /^skillpilot-class-\d{4}-\d{2}-\d{2}\.skillpilot$/u)
  assert(!download.suggestedFilename().includes('physik'), 'the filename must not expose the class name')
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const encryptedContent = Buffer.concat(chunks).toString('utf8')
  assert(encryptedContent.includes('"purpose": "trainer-class"'))
  assert(!encryptedContent.includes(classSession.name), 'the encrypted file must hide the class name')
  assert(!encryptedContent.includes(studentId), 'the encrypted file must hide the SkillPilot ID')
  assert(!encryptedContent.includes(classSession.students[0].name), 'the encrypted file must hide student names')
  assert(!encryptedContent.includes(password), 'the encrypted file must not contain the password')

  await page.getByTitle('Klasse löschen').click()
  await page.getByRole('button', { name: 'Löschen', exact: true }).click()
  await page.getByText(classSession.name).waitFor({ state: 'detached' })

  let chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Importieren' }).click()
  let chooser = await chooserPromise
  await chooser.setFiles({
    name: 'geschuetzte-klasse.skillpilot',
    mimeType: 'application/json',
    buffer: Buffer.from(encryptedContent),
  })
  const importDialog = page.getByRole('dialog', { name: 'Geschützte Klasse importieren' })
  await importDialog.waitFor()
  await importDialog.getByLabel('Passwort', { exact: true }).fill('Falscher Kurs 12!')
  await importDialog.getByRole('button', { name: 'Klasse importieren' }).click()
  const decryptError = importDialog.getByText(/Prüfe das Passwort und ob die Datei vollständig ist/u)
  await decryptError.waitFor()
  assert(await page.getByText(classSession.name).count() === 0)

  await importDialog.getByLabel('Passwort', { exact: true }).fill(password)
  await decryptError.waitFor({ state: 'hidden' })
  await importDialog.getByRole('button', { name: 'Klasse importieren' }).click()
  await page.getByText(classSession.name).waitFor()
  const restored = await page.evaluate(() => JSON.parse(
    localStorage.getItem('skillpilot_classes') ?? '[]',
  )) as Array<typeof classSession>
  assert.deepEqual(
    restored[0],
    classSession,
    'the encrypted class must survive browser import without losing current state',
  )

  await page.getByTitle('Klasse löschen').click()
  await page.getByRole('button', { name: 'Löschen', exact: true }).click()
  await page.getByText(classSession.name).waitFor({ state: 'detached' })

  chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Importieren' }).click()
  chooser = await chooserPromise
  await chooser.setFiles({
    name: 'alte-klasse.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(classSession)),
  })
  await page.getByText(classSession.name).waitFor()
  assert(
    await page.getByText(/Alte ungeschützte Klassendatei importiert/u).isVisible(),
    'legacy plaintext import remains possible but is disclosed as unprotected',
  )

  let downloadCount = 0
  page.on('download', () => { downloadCount += 1 })
  await page.getByTitle('Klasse passwortgeschützt speichern').click()
  await page.getByRole('button', { name: 'Abbrechen' }).click()
  await exportDialog.waitFor({ state: 'hidden' })
  assert.equal(downloadCount, 0, 'cancelling the password dialog must not create a file')
  assert.equal(browserErrors.length, 0, `browser errors:\n${browserErrors.join('\n')}`)

  await context.close()
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('trainer class file UI tests passed')
