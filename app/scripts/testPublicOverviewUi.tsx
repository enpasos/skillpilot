import assert from 'node:assert/strict'
import { createServer as createHttpServer } from 'node:http'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Page } from 'playwright'
import { createServer as createViteServer } from 'vite'

type Language = 'de' | 'en'
type FormatId = 'audio' | 'video' | 'whitepaper'

interface PlaybackCall {
  sectionId: string
  pathname: string
  search: string
  hash: string
}

interface BrowserProbeState {
  playCalls: PlaybackCall[]
  directPlayCalls: PlaybackCall[]
  scrollCalls: string[]
}

interface ExpectedOverview {
  title: string
  cardDescription: string
  formatsLabel: string
  formatNavigationLabel: string
  switchLabel: string
  audioNotice: string
  audioPlayLabel: string
  audioSeekLabel: string
  formats: {
    audio: [eyebrow: string, title: string, description: string, action: string]
    video: [eyebrow: string, title: string, description: string, action: string]
    whitepaper: [eyebrow: string, title: string, description: string, action: string]
  }
}

const expectedByLanguage: Record<Language, ExpectedOverview> = {
  de: {
    title: 'SkillPilot im Überblick',
    cardDescription: 'Die Idee hinter SkillPilot – anhören, ansehen oder lesen.',
    formatsLabel: 'Verfügbare Formate',
    formatNavigationLabel: 'Format wählen',
    switchLabel: 'English',
    audioNotice: 'Diese Audioeinführung enthält KI-erzeugte Stimmen.',
    audioPlayLabel: 'Audio-Einführung abspielen',
    audioSeekLabel: 'Wiedergabeposition der Audio-Einführung',
    formats: {
      audio: [
        'Anhören',
        'Audio-Einführung',
        'Die Idee hinter SkillPilot kompakt als Audio erklärt.',
        'Audio starten',
      ],
      video: [
        'Ansehen',
        'Präsentationsvideo',
        'Das Konzept anhand von Folien und Bildern kennenlernen.',
        'Video ansehen',
      ],
      whitepaper: [
        'Lesen',
        'Whitepaper',
        'Hintergründe, Architektur und Umsetzung im Detail.',
        'Whitepaper lesen',
      ],
    },
  },
  en: {
    title: 'SkillPilot at a glance',
    cardDescription: 'The idea behind SkillPilot—listen, watch, or read.',
    formatsLabel: 'Available formats',
    formatNavigationLabel: 'Choose a format',
    switchLabel: 'Deutsch',
    audioNotice: 'This audio introduction contains AI-generated voices.',
    audioPlayLabel: 'Play audio introduction',
    audioSeekLabel: 'Audio playback position',
    formats: {
      audio: [
        'Listen',
        'Audio introduction',
        'The idea behind SkillPilot, explained in a compact audio format.',
        'Start audio',
      ],
      video: [
        'Watch',
        'Presentation video',
        'Explore the concept through slides and illustrations.',
        'Watch video',
      ],
      whitepaper: [
        'Read',
        'Whitepaper',
        'Background, architecture, and implementation in detail.',
        'Read whitepaper',
      ],
    },
  },
}

const formatIds: FormatId[] = ['audio', 'video', 'whitepaper']
const forbiddenNeutralAction: Record<Language, string> = {
  de: 'Überblick öffnen',
  en: 'Open overview',
}

const rootFormatHref = (language: Language, formatId: FormatId) => {
  if (formatId === 'audio' || formatId === 'video') {
    return `/whitepaper/${language}?play=${formatId}#${formatId}`
  }
  return `/whitepaper/${language}#whitepaper`
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const cacheDir = await mkdtemp(join(tmpdir(), 'skillpilot-public-overview-'))
const vite = await createViteServer({
  root: appRoot,
  cacheDir,
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  plugins: [react(), tailwindcss()],
  server: {
    middlewareMode: true,
    hmr: false,
    ws: false,
  },
  optimizeDeps: {
    entries: ['scripts/fixtures/sessionSetupCompletionUi.html'],
  },
})

const fixtureHtml = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Public overview UI test</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import React from 'react'
      import { createRoot } from 'react-dom/client'
      import { BrowserRouter, Route, Routes } from 'react-router-dom'
      import { SkillPilotOverviewCard } from '/src/components/SkillPilotOverviewCard.tsx'
      import { LanguageProvider, useLanguage } from '/src/contexts/LanguageContext.tsx'
      import { ThemeProvider } from '/src/contexts/ThemeContext.tsx'
      import '/src/index.css'

      const e = React.createElement
      const LazyWhitepaperView = React.lazy(() =>
        import('/src/views/WhitepaperView.tsx').then((module) => ({
          default: module.WhitepaperView,
        })),
      )
      const RootOverview = () => {
        const { language } = useLanguage()
        return e('main', null, e(SkillPilotOverviewCard, { language }))
      }
      const overviewRoute = e(
        React.Suspense,
        {
          fallback: e(
            'p',
            { 'data-testid': 'overview-route-loading' },
            'Loading overview',
          ),
        },
        e(LazyWhitepaperView),
      )
      const routes = e(
        Routes,
        null,
        e(Route, { path: '/', element: e(RootOverview) }),
        e(Route, { path: '/whitepaper/:lang?', element: overviewRoute }),
      )
      const app = e(
        BrowserRouter,
        null,
        e(LanguageProvider, null, e(ThemeProvider, null, routes)),
      )
      createRoot(document.getElementById('root')).render(app)
    </script>
  </body>
</html>`

const http = createHttpServer((request, response) => {
  vite.middlewares(request, response, async (middlewareError) => {
    if (middlewareError) {
      response.statusCode = 500
      response.end(String(middlewareError))
      return
    }

    try {
      const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
      const isOverviewRoute = pathname === '/'
        || pathname === '/whitepaper'
        || pathname === '/whitepaper/de'
        || pathname === '/whitepaper/en'
      if (!isOverviewRoute) {
        response.statusCode = 404
        response.end('Not found')
        return
      }

      const html = await vite.transformIndexHtml(pathname, fixtureHtml)
      response.statusCode = 200
      response.setHeader('Content-Type', 'text/html; charset=utf-8')
      response.end(html)
    } catch (error) {
      response.statusCode = 500
      response.end(error instanceof Error ? error.stack : String(error))
    }
  })
})

await new Promise<void>((resolve, reject) => {
  const handleError = (error: Error) => reject(error)
  http.once('error', handleError)
  http.listen(0, '127.0.0.1', () => {
    http.off('error', handleError)
    resolve()
  })
})

const address = http.address()
assert(address && typeof address !== 'string', 'overview test server exposes a TCP port')
const origin = `http://127.0.0.1:${address.port}`

const assertSectionLabel = async (page: Page, sectionId: string) => {
  const valid = await page.locator(`#${sectionId}`).evaluate((section) => {
    const labelledBy = section.getAttribute('aria-labelledby')
    return Boolean(labelledBy && document.getElementById(labelledBy))
  })
  assert(valid, `#${sectionId} has an aria-labelledby relationship to a real heading`)
}

const assertFocusable = async (page: Page, selector: string) => {
  const locator = page.locator(selector)
  await locator.focus()
  assert(
    await locator.evaluate((element) => document.activeElement === element),
    `${selector} can receive keyboard focus`,
  )
}

const flushBrowserEffects = async (page: Page) => {
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
}

const readBrowserProbe = async (page: Page) => page.evaluate(() => {
  const probe = (window as typeof window & {
    __skillPilotOverviewProbe: BrowserProbeState
  }).__skillPilotOverviewProbe
  const audio = document.querySelector<HTMLAudioElement>('#audio audio')
  const video = document.querySelector<HTMLVideoElement>('#video video')

  return {
    playCalls: probe.playCalls.map((call) => ({ ...call })),
    directPlayCalls: probe.directPlayCalls.map((call) => ({ ...call })),
    scrollCalls: [...probe.scrollCalls],
    audioPaused: audio?.paused ?? null,
    videoPaused: video?.paused ?? null,
  }
})

const assertLocationAndTarget = async (
  page: Page,
  language: Language,
  formatId: FormatId,
  headingName: string,
) => {
  await page.waitForFunction(
    ({ expectedPathname, expectedHash }) => (
      window.location.pathname === expectedPathname
      && window.location.search === ''
      && window.location.hash === expectedHash
    ),
    {
      expectedPathname: `/whitepaper/${language}`,
      expectedHash: `#${formatId}`,
    },
  )

  const section = page.locator(`#${formatId}`)
  await section.waitFor()
  await page.waitForFunction(
    (expectedSectionId) => document.activeElement?.id === expectedSectionId,
    formatId,
  )
  await page.waitForFunction(
    (expectedSectionId) => {
      const target = document.getElementById(expectedSectionId)
      if (!target) return false
      const bounds = target.getBoundingClientRect()
      return window.scrollY > 0
        && bounds.bottom > 0
        && bounds.top < window.innerHeight
    },
    formatId,
  )

  assert.equal(
    await section.getByRole('heading', { level: 2, name: headingName, exact: true }).count(),
    1,
    `${language}: #${formatId} is the focused and scrolled matching section`,
  )
  assert.equal(
    await section.getAttribute('tabindex'),
    '-1',
    `${language}: #${formatId} can receive programmatic focus after navigation`,
  )
}

const assertPlaybackState = async (
  page: Page,
  expectedPlaying: 'audio' | 'video' | null,
) => {
  if (expectedPlaying) {
    await page.waitForFunction((sectionId) => {
      const probe = (window as typeof window & {
        __skillPilotOverviewProbe: BrowserProbeState
      }).__skillPilotOverviewProbe
      return probe.playCalls.length === 1
        && probe.playCalls[0]?.sectionId === sectionId
    }, expectedPlaying)
  } else {
    await flushBrowserEffects(page)
  }

  const probe = await readBrowserProbe(page)

  if (expectedPlaying) {
    assert.equal(probe.playCalls.length, 1, `${expectedPlaying} play() is called exactly once`)
    assert.equal(probe.playCalls[0]?.sectionId, expectedPlaying)
    assert.match(
      probe.playCalls[0]?.pathname ?? '',
      /^\/whitepaper\/(?:de|en)$/u,
      'play() is called on the localized overview route',
    )
  } else {
    assert.deepEqual(probe.playCalls, [], 'the neutral/whitepaper action does not call play()')
    assert.deepEqual(probe.directPlayCalls, [], 'the neutral/whitepaper action has no direct play() call')
  }

  assert.equal(
    probe.audioPaused,
    expectedPlaying !== 'audio',
    `audio paused state matches ${expectedPlaying ?? 'no autoplay'}`,
  )
  assert.equal(
    probe.videoPaused,
    expectedPlaying !== 'video',
    `video paused state matches ${expectedPlaying ?? 'no autoplay'}`,
  )
}

const assertDirectPlayCall = async (
  page: Page,
  language: Language,
  formatId: 'audio' | 'video',
) => {
  const probe = await readBrowserProbe(page)
  assert.deepEqual(
    probe.directPlayCalls,
    [{
      sectionId: formatId,
      pathname: `/whitepaper/${language}`,
      search: '',
      hash: '',
    }],
    `${language}: overview ${formatId} invokes its media play() before hash navigation`,
  )
}

const installDirectPlaySpy = async (page: Page, formatId: 'audio' | 'video') => {
  await page.locator(`#${formatId} ${formatId}`).evaluate((media) => {
    const element = media as HTMLMediaElement
    const nativePlay = element.play.bind(element)
    element.play = () => {
      const probe = (window as typeof window & {
        __skillPilotOverviewProbe: BrowserProbeState
      }).__skillPilotOverviewProbe
      probe.directPlayCalls.push({
        sectionId: element.closest('section')?.id ?? element.tagName.toLowerCase(),
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      })
      return nativePlay()
    }
  })
}

let browser: Browser | null = null

try {
  const sessionSetupSource = await readFile(
    new URL('../src/components/SessionSetup.tsx', import.meta.url),
    'utf8',
  )
  assert.match(
    sessionSetupSource,
    /<SkillPilotOverviewCard language=\{language === 'en' \? 'en' : 'de'\} \/>/u,
    'the public root renders the single overview entry with the active UI language',
  )
  assert.doesNotMatch(
    sessionSetupSource,
    /<AudioPlayer\b/u,
    'the public root no longer renders a separate inline audio player',
  )
  assert.doesNotMatch(
    sessionSetupSource,
    /t\.startPage\.links\.whitepaper/u,
    'the public root no longer renders the former parallel whitepaper link',
  )

  browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-background-networking',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-sandbox',
      '--autoplay-policy=no-user-gesture-required',
    ],
  })

  for (const language of ['de', 'en'] as const) {
    const expected = expectedByLanguage[language]
    const oppositeLanguage: Language = language === 'de' ? 'en' : 'de'
    const context = await browser.newContext({
      locale: language === 'de' ? 'de-DE' : 'en-US',
      viewport: { width: 375, height: 900 },
    })
    await context.addInitScript(({
      testOrigin,
      rootLanguage,
      overviewStoredLanguage,
    }) => {
      if (window.location.origin === testOrigin) {
        localStorage.setItem(
          'skillpilot_lang',
          window.location.pathname.startsWith('/whitepaper/')
            ? overviewStoredLanguage
            : rootLanguage,
        )
      }

      const probe: BrowserProbeState = {
        playCalls: [],
        directPlayCalls: [],
        scrollCalls: [],
      }
      Object.defineProperty(window, '__skillPilotOverviewProbe', {
        configurable: true,
        value: probe,
      })
      document.addEventListener('play', (event) => {
        if (event.target instanceof HTMLMediaElement) {
          probe.playCalls.push({
            sectionId: event.target.closest('section')?.id ?? event.target.tagName.toLowerCase(),
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
          })
        }
      }, true)

      const nativeScrollIntoView = Element.prototype.scrollIntoView
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: function (
          this: Element,
          argument?: boolean | ScrollIntoViewOptions,
        ) {
          probe.scrollCalls.push(this.id)
          Reflect.apply(nativeScrollIntoView, this, [argument])
        },
      })
    }, {
      testOrigin: origin,
      rootLanguage: language,
      overviewStoredLanguage: oppositeLanguage,
    })
    const page = await context.newPage()
    page.setDefaultTimeout(10_000)

    await page.goto(`${origin}/`)
    const overviewEntry = page.getByTestId('skillpilot-overview-entry')
    await overviewEntry.waitFor()
    assert.equal(
      await overviewEntry.getAttribute('href'),
      null,
      `${language}: the overview container is not one enclosing link`,
    )
    assert.equal(
      await overviewEntry.locator(
        'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])',
      ).count(),
      3,
      `${language}: the root card has exactly three interactive format actions`,
    )
    assert.equal(await page.locator('audio, video').count(), 0, 'the root has no parallel media player')
    const overviewEntryText = await overviewEntry.textContent()
    for (const visibleText of [
      expected.title,
      expected.cardDescription,
      ...Object.values(expected.formats).map((format) => format[1]),
    ]) {
      assert(
        overviewEntryText?.includes(visibleText),
        `${language}: root overview entry exposes ${visibleText}`,
      )
    }
    assert(
      !overviewEntryText?.includes(forbiddenNeutralAction[language]),
      `${language}: the root card has no neutral overview action`,
    )
    assert.equal(
      await overviewEntry.locator(`ul[aria-label="${expected.formatsLabel}"]`).count(),
      1,
      `${language}: root format list has an accessible name`,
    )

    for (const formatId of formatIds) {
      const formatLink = page.getByTestId(`skillpilot-overview-format-${formatId}`)
      assert.equal(
        await formatLink.getAttribute('href'),
        rootFormatHref(language, formatId),
        `${language}: root ${formatId} action has its exact direct target`,
      )
      assert.equal(
        await formatLink.getAttribute('target'),
        null,
        `${language}: root ${formatId} action opens in the same tab`,
      )
      assert.equal(
        await formatLink.getAttribute('aria-label'),
        `${expected.formats[formatId][1]}: ${expected.formats[formatId][3]}`,
        `${language}: root ${formatId} action has a localized accessible name`,
      )
      await assertFocusable(page, `[data-testid="skillpilot-overview-format-${formatId}"]`)
    }

    // Every root action must survive the lazy route load, focus/scroll the exact
    // destination and, for media formats, consume one explicit play intent.
    for (const formatId of formatIds) {
      await page.goto(`${origin}/`)
      await page.getByTestId(`skillpilot-overview-format-${formatId}`).click()
      await assertLocationAndTarget(page, language, formatId, expected.formats[formatId][1])

      if (formatId === 'audio' || formatId === 'video') {
        await assertPlaybackState(page, formatId)

        // The play query is replaced after consumption, so a reload of the
        // resulting neutral deep link must focus again without replaying.
        await page.reload()
        await assertLocationAndTarget(page, language, formatId, expected.formats[formatId][1])
        await assertPlaybackState(page, null)
      } else {
        await assertPlaybackState(page, null)
      }
    }

    // The URL language is authoritative even when the persisted UI language says the opposite.
    const markdownPath = `/whitepaper/whitepaper.${language}.md`
    const markdownResponse = page.waitForResponse((response) => (
      new URL(response.url()).pathname === markdownPath && response.ok()
    ))
    await page.goto(`${origin}/whitepaper/${language}`)
    await markdownResponse
    await page.locator('#whitepaper .prose').waitFor()
    await page.waitForFunction((routeLanguage) => document.documentElement.lang === routeLanguage, language)
    assert.equal(
      await page.evaluate(() => localStorage.getItem('skillpilot_lang')),
      oppositeLanguage,
      `${language}: cross-locale fixture really persists ${oppositeLanguage}`,
    )
    await assertPlaybackState(page, null)

    assert.equal(
      await page.getByRole('heading', { level: 1, name: expected.title, exact: true }).count(),
      1,
      `${language}: overview has exactly one localized h1`,
    )
    assert.equal(
      await page.getByRole('link', { name: expected.switchLabel, exact: true }).getAttribute('href'),
      `/whitepaper/${oppositeLanguage}`,
      `${language}: language switch targets the other localized overview`,
    )

    const formatNavigation = page.getByRole('navigation', {
      name: expected.formatNavigationLabel,
      exact: true,
    })
    await formatNavigation.waitFor()
    for (const formatId of formatIds) {
      const formatCopy = expected.formats[formatId]
      const formatLink = page.getByTestId(`skillpilot-overview-nav-${formatId}`)
      assert.equal(await formatLink.count(), 1, `${language}: #${formatId} has one format link`)
      assert.equal(
        await formatLink.getAttribute('href'),
        `/whitepaper/${language}#${formatId}`,
        `${language}: overview ${formatId} action uses a neutral direct anchor`,
      )
      assert.equal(
        await formatLink.getAttribute('target'),
        null,
        `${language}: overview ${formatId} action opens in the same tab`,
      )
      const linkText = await formatLink.textContent()
      for (const copyPart of formatCopy) {
        assert(linkText?.includes(copyPart), `${language}: #${formatId} link exposes ${copyPart}`)
      }
      await assertFocusable(page, `[data-testid="skillpilot-overview-nav-${formatId}"]`)
    }

    for (const sectionId of formatIds) {
      assert.equal(await page.locator(`#${sectionId}`).count(), 1, `${language}: #${sectionId} is unique`)
      await assertSectionLabel(page, sectionId)
    }
    for (const headingName of Object.values(expected.formats).map((format) => format[1])) {
      assert.equal(
        await page.getByRole('heading', { level: 2, name: headingName, exact: true }).count(),
        1,
        `${language}: ${headingName} is a single level-two section heading`,
      )
    }

    const audio = page.locator('#audio audio')
    assert.equal(await audio.getAttribute('src'), `/audio/intro-${language}.m4a`)
    const playButton = page.getByRole('button', { name: expected.audioPlayLabel, exact: true })
    assert.equal(await playButton.getAttribute('type'), 'button')
    const describedBy = await playButton.getAttribute('aria-describedby')
    assert(describedBy, `${language}: audio play button references the AI voice notice`)
    assert.equal(
      await page.locator(`[id="${describedBy}"][role="note"]`).textContent(),
      expected.audioNotice,
      `${language}: audio AI-voice disclosure is accessible before playback`,
    )
    await assertFocusable(page, `button[aria-label="${expected.audioPlayLabel}"]`)

    const seek = page.getByRole('slider', { name: expected.audioSeekLabel, exact: true })
    assert.equal(await seek.getAttribute('type'), 'range')
    assert.equal(await seek.getAttribute('min'), '0')
    assert.equal(await seek.getAttribute('max'), '100')

    const video = page.locator('#video video')
    assert.equal(
      await video.getAttribute('src'),
      `/whitepaper/SkillPilot_Whitepaper_${language}.mp4`,
    )
    assert(await video.getAttribute('controls') !== null, `${language}: presentation video exposes native controls`)
    assert.equal(await video.getAttribute('aria-label'), expected.formats.video[1])

    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
      true,
      `${language}: overview has no horizontal overflow at 375px`,
    )

    // Actions inside the overview invoke the selected player immediately on
    // click, before their neutral hash navigation. Whitepaper never plays.
    for (const formatId of formatIds) {
      await page.goto(`${origin}/whitepaper/${language}`)
      await page.locator('#whitepaper .prose').waitFor()
      if (formatId === 'audio' || formatId === 'video') {
        await installDirectPlaySpy(page, formatId)
      }
      await page.getByTestId(`skillpilot-overview-nav-${formatId}`).click()
      await assertLocationAndTarget(page, language, formatId, expected.formats[formatId][1])
      await assertPlaybackState(page, formatId === 'whitepaper' ? null : formatId)
      if (formatId === 'audio' || formatId === 'video') {
        await assertDirectPlayCall(page, language, formatId)
      }
    }

    await context.close()
  }

  console.log('Public SkillPilot overview UI tests passed')
} finally {
  await browser?.close()
  await new Promise<void>((resolve, reject) => {
    http.close((error) => error ? reject(error) : resolve())
  })
  await vite.close()
  await rm(cacheDir, { recursive: true, force: true })
}
