import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Locator } from 'playwright'

// Start serveQuickstartCapture.ts first. The optional port must point to that
// loopback fixture server. ffmpeg converts the unretouched pixels to WebP.
const origin = `http://127.0.0.1:${process.argv[2] ?? '4177'}`
const gymnasium = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const chatSource = new URL('../../tools/demo-video/assets/quickstart/learning-cards.html', import.meta.url)
const languages = ['de', 'en'] as const
// Previously published and privacy-reviewed Claude Web recordings, 13 Sep 2026.
// Each setting records a source timestamp and an unaltered 1920×1080 crop
// (width:height:x:y). The connector crop isolates the relevant tab and status.
const claudeFrames = {
  de: {
    digest: '807d717e651bc789a6c5dadb0d2a6015510862c5e4ecfe517623a596cacf945a',
    marketplace: { second: '43', crop: '1252:776:334:155' },
    connector: { second: '110', crop: '1348:304:444:200' },
    'start-message': { second: '244', crop: '1640:598:140:474' },
  },
  en: {
    digest: '29c3a5606e9ca4f22815a13ba6f8e56990a32e9a151a11fdaee37605de0b54b2',
    marketplace: { second: '43', crop: '1252:712:334:188' },
    connector: { second: '79', crop: '1348:304:444:200' },
    'start-message': { second: '207', crop: '1640:598:140:474' },
  },
}
const copy = {
  de: {
    locale: 'de-DE', start: 'Jetzt lernen', acceptance: /Ich akzeptiere die Nutzungsbedingungen/u,
    accept: 'Akzeptieren & Fortfahren', newId: 'Neue SkillPilot-ID erstellen',
    idStep: 'Schritt 1: SkillPilot-ID festlegen', next: 'Weiter zu Schritt 2: Curriculum wählen',
    curriculum: 'Schritt 3: Persönliches Curriculum festlegen',
    state: 'Hessen', level: 'Sekundarstufe I', subject: 'Mathematik', finish: 'Diese Auswahl abschließen',
    completed: 'Dein persönlicher Lehrplan ist eingerichtet.',
    coachStart: 'Lernen mit Claude starten', cockpit: 'Cockpit öffnen', chat: 'Beispielchat',
  },
  en: {
    locale: 'en-GB', start: 'Learn now', acceptance: /I accept the Terms of Use/u,
    accept: 'Accept & Continue', newId: 'Create a new SkillPilot ID',
    idStep: 'Step 1: Set your SkillPilot ID', next: 'Continue to step 2: Choose curriculum',
    curriculum: 'Step 3: Set your personal curriculum',
    state: 'Hesse', level: 'Sekundarstufe I', subject: 'Mathematik', finish: 'Finish this selection',
    completed: 'Your personal curriculum is configured.',
    coachStart: 'Start learning with Claude', cockpit: 'Open Cockpit', chat: 'Example chat',
  },
}

const images = new Map<string, Buffer>()

function encodeWebp(name: string, inputArgs: string[], input?: Buffer) {
  const target = join(scratch, name)
  // A seekable output lets the encoder fill the RIFF container length.
  const quality = name.startsWith('quickstart-home.') ? ['-quality', '90'] : ['-lossless', '1']
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', ...inputArgs,
    '-c:v', 'libwebp', ...quality, '-compression_level', '6', '-frames:v', '1', target,
  ], { input })
  const image = readFileSync(target)
  assert.equal(image.toString('ascii', 0, 4), 'RIFF')
  assert.equal(image.toString('ascii', 8, 12), 'WEBP')
  assert.equal(image.readUInt32LE(4), image.byteLength - 8)
  images.set(name, image)
}

async function capture(target: Locator, name: string, privacyStyle?: string) {
  await target.page().evaluate(() => document.fonts.ready)
  const png = await target.screenshot({ animations: 'disabled', caret: 'hide', style: privacyStyle })
  encodeWebp(name, ['-f', 'image2pipe', '-i', 'pipe:0'], png)
  console.log(`Captured ${name}`)
}

function captureClaudeFrames(language: typeof languages[number]) {
  const frames = claudeFrames[language]
  const source = fileURLToPath(new URL(`../public/media/quickstart/claude/2026-09-13/${language}/sha256-${frames.digest}.mp4`, import.meta.url))
  for (const name of ['marketplace', 'connector', 'start-message'] as const) {
    const frame = frames[name]
    encodeWebp(`quickstart-claude-${name}.${language}.webp`, [
      '-ss', frame.second, '-i', source, '-vf', `crop=${frame.crop}`,
    ])
  }
}

const scratch = await mkdtemp(join(tmpdir(), 'skillpilot-quickstart-images-'))
const browser = await chromium.launch()
try {
  for (const language of languages) {
    const labels = copy[language]
    const context = await browser.newContext({
      viewport: { width: 1180, height: 880 }, deviceScaleFactor: 2,
      locale: labels.locale, colorScheme: 'light', serviceWorkers: 'block',
    })
    await context.route('**/*', (route) => {
      const request = new URL(route.request().url())
      return request.origin === origin || request.protocol === 'file:' ? route.continue() : route.abort()
    })
    await context.addInitScript(({ locale, fixtureOrigin }) => {
      if (location.origin === fixtureOrigin) localStorage.setItem('skillpilot_lang', locale)
    }, { locale: language, fixtureOrigin: origin })
    const captureForLanguage = (target: Locator, name: string, privacyStyle?: string) => (
      capture(target, `quickstart-${name}.${language}.webp`, privacyStyle)
    )

    const page = await context.newPage()
    const healthCheck = await page.request.get(`${origin}/__quickstart_capture__`)
    assert.equal(await healthCheck.text(), '"skillpilot-local-quickstart-fixtures"', 'Start the local Quickstart fixture server before capturing')
    await page.goto(origin, { waitUntil: 'domcontentloaded' })
    const start = page.getByRole('button', { name: labels.start, exact: true })
    await start.waitFor()
    await captureForLanguage(page.getByTestId('public-landing-panel-learning'), 'home')
    await start.click()
    await page.getByRole('checkbox', { name: labels.acceptance }).check()
    await page.getByRole('button', { name: labels.accept, exact: true }).click()
    const creation = page.waitForResponse((response) => (
      response.url() === `${origin}/api/ui/learners` && response.request().method() === 'POST'
    ))
    await page.getByRole('button', { name: labels.newId, exact: true }).click()
    const { state: { skillpilotId } } = await (await creation).json()
    assert.match(skillpilotId, /^00000000-0000-4000-8000-\d{12}$/u)

    const id = page.locator('#skillpilotIdInput')
    await page.getByTestId('skillpilot-id-retention').waitFor()
    assert.equal(await id.inputValue(), skillpilotId)
    await captureForLanguage(page.getByRole('region', { name: labels.idStep }), 'start',
      '#skillpilotIdInput { -webkit-text-security: disc; }')
    await page.getByRole('button', { name: labels.next, exact: true }).click()
    await page.locator('#sessionCurriculumSelect').selectOption(gymnasium)
    for (const name of [labels.state, 'G9', labels.level, labels.subject, labels.finish]) {
      await page.getByRole('button', { name, exact: true }).click()
    }
    await page.getByText(labels.completed, { exact: true }).waitFor()
    await captureForLanguage(page.getByRole('region', { name: labels.curriculum }), 'curriculum')

    const provider = page.getByTestId('coach-provider-choice')
    assert.equal(await provider.getByRole('radio').count(), 3)
    await page.getByRole('button', { name: labels.coachStart, exact: true }).waitFor()
    await page.getByRole('link', { name: labels.cockpit, exact: true }).waitFor()
    await captureForLanguage(provider.locator('xpath=../..'), 'provider')
    const response = await page.request.delete(`${origin}/api/ui/learners/${skillpilotId}`)
    assert.equal(response.status(), 204)

    captureClaudeFrames(language)

    const chat = new URL(chatSource)
    chat.searchParams.set('lang', language)
    chat.hash = 'goal-choice'
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(chat.href)
    await page.getByText(labels.chat, { exact: false }).waitFor()
    await captureForLanguage(page.locator('main'), 'chat')
    await context.close()
  }

  // Check both actual browser decoding and intended output bounds before
  // updating either mirror of the written Quickstart.
  const verification = await browser.newPage()
  for (const [name, image] of images) {
    const dimensions = await verification.evaluate(async (source) => {
      const picture = new Image()
      picture.src = source
      await picture.decode()
      return [picture.naturalWidth, picture.naturalHeight]
    }, `data:image/webp;base64,${image.toString('base64')}`)
    assert(dimensions.every((value) => value > 0), `Chromium failed to decode ${name}`)
  }
  await verification.close()
} finally {
  await browser.close()
  await rm(scratch, { recursive: true, force: true })
}

for (const [filename, image] of images) {
  await writeFile(new URL(`../public/${filename}`, import.meta.url), image)
  await writeFile(new URL(`../../docs/quickstart/${filename}`, import.meta.url), image)
  console.log(`${filename} (${image.byteLength} bytes)`)
}
