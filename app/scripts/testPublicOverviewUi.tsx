import assert from 'node:assert/strict'
import { createServer as createHttpServer } from 'node:http'
import { mkdtemp, rm } from 'node:fs/promises'
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
  removedCardTagline: string
  removedCompactMission: string
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
  disclosure: {
    label: string
    introduction: string
    vision: [heading: string, tagline: string, description: string]
    mission: [heading: string, tagline: string, description: string]
  }
}

const expectedByLanguage: Record<Language, ExpectedOverview> = {
  de: {
    title: 'SkillPilot im Überblick',
    cardDescription: 'Die Idee hinter SkillPilot – anhören, ansehen oder lesen.',
    removedCardTagline: 'Alles Wissen. Für jeden Menschen.',
    removedCompactMission: 'SkillPilot macht Wissen navigierbar – in offenen Wissenslandschaften, die von Menschen gestaltet, geprüft und verantwortet werden. Lernende und ihre persönliche KI erhalten verlässliche Orientierung. Für Lehrende werden individuelle Lernfortschritte sichtbar, damit sie Lernprozesse fundierter und gezielter begleiten können.',
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
    disclosure: {
      label: 'Vision & Mission',
      introduction: 'Vision und Mission beschreiben unser langfristiges Ziel und den Weg dorthin.',
      vision: [
        'Unsere Vision',
        'Alles Wissen. Für jeden Menschen.',
        'Eine Welt, in der jeder Mensch sich das gesamte Wissen der Menschheit erschließen kann – frei, selbstbestimmt und unabhängig von seinen finanziellen Möglichkeiten.',
      ],
      mission: [
        'Unsere Mission',
        'SkillPilot macht Wissen navigierbar.',
        'Wir schaffen offene Wissenslandschaften, die fachlich und didaktisch von Menschen verantwortet und gemeinschaftlich weiterentwickelt werden. Sie geben Lernenden und ihren persönlichen KIs verlässliche Orientierung und machen Lehrenden individuelle Lernfortschritte sichtbar – als Grundlage für fundierte pädagogische Entscheidungen und gezielte Lernbegleitung.',
      ],
    },
  },
  en: {
    title: 'SkillPilot at a glance',
    cardDescription: 'The idea behind SkillPilot—listen, watch, or read.',
    removedCardTagline: 'All knowledge. For everyone.',
    removedCompactMission: 'SkillPilot makes knowledge navigable—in open knowledge landscapes designed and reviewed by people, who remain responsible for them. Learners and their personal AI receive reliable guidance. Educators gain insight into individual learning progress, enabling them to provide more informed and targeted learning support.',
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
    disclosure: {
      label: 'Vision & Mission',
      introduction: 'Vision and mission describe our long-term goal and the path towards it.',
      vision: [
        'Our vision',
        'All knowledge. For everyone.',
        'A world in which everyone can explore all of humanity’s knowledge—freely, on their own terms, and regardless of their financial means.',
      ],
      mission: [
        'Our mission',
        'SkillPilot makes knowledge navigable.',
        'We create open knowledge landscapes that are developed collaboratively and remain under human responsibility for both their subject matter and pedagogy. They provide learners and their personal AI with reliable guidance and give educators insight into individual learning progress—as a basis for sound pedagogical decisions and targeted learning support.',
      ],
    },
  },
}

const formatIds: FormatId[] = ['audio', 'video', 'whitepaper']
const rootActionTestIds = [
  ...formatIds.map((formatId) => `skillpilot-overview-format-${formatId}`),
  'skillpilot-overview-disclosure-toggle',
]
const rootActionSelector = rootActionTestIds
  .map((testId) => `[data-testid="${testId}"]`)
  .join(', ')
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

const assertNoHorizontalOverflow = async (page: Page, message: string) => {
  assert.equal(
    await page.evaluate(() => (
      document.documentElement.scrollWidth <= document.documentElement.clientWidth
      && document.body.scrollWidth <= document.body.clientWidth
    )),
    true,
    message,
  )
}

const assertActionsStayInOneRow = async (page: Page, language: Language) => {
  const actions = page.getByTestId('skillpilot-overview-media-actions').locator(rootActionSelector)
  assert.equal(await actions.count(), rootActionTestIds.length, `${language}: desktop keeps all four actions`)
  const positions = await actions.evaluateAll((elements) => elements.map((element) => {
    const bounds = element.getBoundingClientRect()
    return { left: bounds.left, right: bounds.right, top: bounds.top }
  }))
  assert(
    positions.every((position) => Math.abs(position.top - positions[0]!.top) <= 1),
    `${language}: desktop action pills stay in one row`,
  )
  assert(
    positions.every((position, index) => index === 0 || position.left > positions[index - 1]!.left),
    `${language}: desktop action pills keep their reading order`,
  )

  const gaps = positions.slice(1).map((position, index) => (
    position.left - positions[index]!.right
  ))
  assert(
    gaps.every((gap) => Math.abs(gap - gaps[0]!) <= 1),
    `${language}: Vision & Mission follows Whitepaper with the same pill gap`,
  )
}

const assertActionRowStructure = async (page: Page, language: Language) => {
  const actionRow = page.getByTestId('skillpilot-overview-actions')
  const actionList = page.getByTestId('skillpilot-overview-media-actions')

  assert.equal(await actionRow.count(), 1, `${language}: the card has one shared action row`)
  assert.equal(
    await actionList.evaluate((list) => list.tagName.toLowerCase()),
    'ul',
    `${language}: all four actions form one semantic list`,
  )
  assert.equal(
    await actionList.evaluate((list, rowTestId) => (
      list.parentElement?.getAttribute('data-testid') === rowTestId
    ), 'skillpilot-overview-actions'),
    true,
    `${language}: the action list is the direct content of the shared action row`,
  )
  assert.equal(
    await actionList.locator(':scope > li').count(),
    rootActionTestIds.length,
    `${language}: the wrapping sequence has exactly four list items`,
  )
  assert.deepEqual(
    await actionList.locator(':scope > li').evaluateAll((items) => items.map((item) => {
      const action = item.querySelector(':scope > a, :scope > button')
      return action?.getAttribute('data-testid') ?? null
    })),
    rootActionTestIds,
    `${language}: Vision & Mission is the fourth pill directly after Whitepaper`,
  )
}

const assertMobileActionWrap = async (page: Page, language: Language) => {
  const actionList = page.getByTestId('skillpilot-overview-media-actions')
  const actionRects = await actionList.locator(rootActionSelector).evaluateAll((elements) => elements.map((element) => {
    const bounds = element.getBoundingClientRect()
    return {
      bottom: bounds.bottom,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
    }
  }))
  const rowBounds = await actionList.evaluate((list) => {
    const bounds = list.getBoundingClientRect()
    return { bottom: bounds.bottom, left: bounds.left, right: bounds.right, top: bounds.top }
  })

  assert.equal(actionRects.length, 4, `${language}: mobile keeps all four actions`)
  assert(
    new Set(actionRects.map(({ top }) => Math.round(top))).size > 1,
    `${language}: actions wrap instead of overflowing on mobile`,
  )
  assert(
    actionRects.every(({ bottom, left, right, top }) => (
      left >= rowBounds.left - 1
      && right <= rowBounds.right + 1
      && top >= rowBounds.top - 1
      && bottom <= rowBounds.bottom + 1
    )),
    `${language}: every wrapped mobile action remains inside the shared row`,
  )
}

const assertDesktopActionLayout = async (page: Page, language: Language) => {
  await assertActionsStayInOneRow(page, language)

  const [rowBounds, firstActionBounds, disclosureRendering] = await Promise.all([
    page.getByTestId('skillpilot-overview-actions').evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return { left: bounds.left, right: bounds.right }
    }),
    page.getByTestId('skillpilot-overview-format-audio').evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return { left: bounds.left }
    }),
    page.getByTestId('skillpilot-overview-disclosure-toggle').evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return {
        marginInlineStart: getComputedStyle(element).marginInlineStart,
        right: bounds.right,
      }
    }),
  ])

  assert(
    Math.abs(firstActionBounds.left - rowBounds.left) <= 1,
    `${language}: desktop keeps the wrapping action sequence left-aligned`,
  )
  assert.equal(
    disclosureRendering.marginInlineStart,
    '0px',
    `${language}: the fourth pill has no automatic start margin`,
  )
  assert(
    rowBounds.right - disclosureRendering.right > 16,
    `${language}: the fourth pill stays beside Whitepaper instead of right-aligning`,
  )
}

const readDisclosurePillAppearance = async (page: Page) => (
  page.getByTestId('skillpilot-overview-disclosure-toggle').evaluate((button) => {
    const style = getComputedStyle(button)
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderTopColor,
      borderRadius: style.borderRadius,
      borderStyle: style.borderTopStyle,
      borderWidth: style.borderTopWidth,
      classNames: [...button.classList],
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      marginInlineStart: style.marginInlineStart,
      paddingBlockEnd: style.paddingBlockEnd,
      paddingBlockStart: style.paddingBlockStart,
      paddingInlineEnd: style.paddingInlineEnd,
      paddingInlineStart: style.paddingInlineStart,
      textDecorationLine: style.textDecorationLine,
    }
  })
)

const assertClosedDisclosurePill = async (page: Page, language: Language) => {
  const actionPills = page.getByTestId('skillpilot-overview-media-actions').locator(rootActionSelector)
  const appearances = await actionPills.evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element)
    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderTopColor,
      borderRadius: style.borderRadius,
      borderStyle: style.borderTopStyle,
      borderWidth: style.borderTopWidth,
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      paddingBlockEnd: style.paddingBlockEnd,
      paddingBlockStart: style.paddingBlockStart,
      paddingInlineEnd: style.paddingInlineEnd,
      paddingInlineStart: style.paddingInlineStart,
      textDecorationLine: style.textDecorationLine,
    }
  }))
  const disclosureAppearance = await readDisclosurePillAppearance(page)
  const comparableStyleKeys = [
    'backgroundColor',
    'borderColor',
    'borderRadius',
    'borderStyle',
    'borderWidth',
    'color',
    'fontSize',
    'fontWeight',
    'paddingBlockEnd',
    'paddingBlockStart',
    'paddingInlineEnd',
    'paddingInlineStart',
    'textDecorationLine',
  ] as const

  assert.equal(appearances.length, rootActionTestIds.length, `${language}: all action pills render`)
  for (const mediaAppearance of appearances.slice(0, formatIds.length)) {
    for (const key of comparableStyleKeys) {
      assert.equal(
        disclosureAppearance[key],
        mediaAppearance[key],
        `${language}: closed disclosure matches media-pill ${key}`,
      )
    }
  }

  for (const className of [
    'inline-flex',
    'items-center',
    'gap-1.5',
    'rounded-full',
    'border',
    'px-2.5',
    'py-1',
    'text-xs',
    'font-medium',
    'border-violet-200/80',
    'bg-violet-50/70',
    'text-text-secondary',
  ]) {
    assert(
      disclosureAppearance.classNames.includes(className),
      `${language}: closed disclosure uses the shared ${className} pill class`,
    )
  }
  for (const forbiddenClassName of [
    'ms-auto',
    'rounded-sm',
    'underline-offset-4',
    'hover:underline',
    'text-violet-700',
    'hover:text-violet-900',
    'dark:text-violet-300',
    'dark:hover:text-violet-100',
  ]) {
    assert(
      !disclosureAppearance.classNames.includes(forbiddenClassName),
      `${language}: disclosure avoids standalone-link class ${forbiddenClassName}`,
    )
  }
  assert.equal(
    disclosureAppearance.marginInlineStart,
    '0px',
    `${language}: closed disclosure has no right-alignment margin`,
  )
  assert.equal(
    disclosureAppearance.textDecorationLine,
    'none',
    `${language}: closed disclosure has no text-link underline`,
  )

  return disclosureAppearance
}

const assertDisclosureColumns = async (
  page: Page,
  language: Language,
  mode: 'stacked' | 'columns',
) => {
  const [visionBounds, missionBounds] = await Promise.all([
    page.getByTestId('skillpilot-overview-vision').evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return { bottom: bounds.bottom, left: bounds.left, top: bounds.top, width: bounds.width }
    }),
    page.getByTestId('skillpilot-overview-mission').evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      return { bottom: bounds.bottom, left: bounds.left, top: bounds.top, width: bounds.width }
    }),
  ])

  if (mode === 'stacked') {
    assert(
      missionBounds.top > visionBounds.bottom,
      `${language}: below 850px mission is stacked after vision`,
    )
    assert(
      Math.abs(missionBounds.left - visionBounds.left) <= 1
      && Math.abs(missionBounds.width - visionBounds.width) <= 1,
      `${language}: below 850px both disclosure sections use the same column`,
    )
    return
  }

  assert(
    Math.abs(missionBounds.top - visionBounds.top) <= 1,
    `${language}: from 850px vision and mission start in one row`,
  )
  assert(
    missionBounds.left > visionBounds.left + visionBounds.width,
    `${language}: from 850px mission is the second column`,
  )
  const columnRatio = missionBounds.width / visionBounds.width
  assert(
    columnRatio >= 1.4 && columnRatio <= 1.6,
    `${language}: the wider mission column keeps the intended 0.8/1.2 proportion`,
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
      4,
      `${language}: the root card has three media links and one disclosure button`,
    )
    const mediaActions = overviewEntry.locator('a[data-testid^="skillpilot-overview-format-"]')
    assert.equal(
      await mediaActions.count(),
      3,
      `${language}: the three existing media actions remain links`,
    )
    const disclosureButton = overviewEntry.getByTestId('skillpilot-overview-disclosure-toggle')
    assert.equal(
      await disclosureButton.count(),
      1,
      `${language}: the disclosure is one separate control`,
    )
    assert.equal(
      await disclosureButton.evaluate((button) => button.tagName.toLowerCase()),
      'button',
      `${language}: the disclosure uses a semantic button`,
    )
    assert.equal(await disclosureButton.getAttribute('type'), 'button')
    assert.equal(
      await disclosureButton.evaluate((button) => button.closest('a') === null),
      true,
      `${language}: the disclosure button is not nested in a navigation link`,
    )
    const overviewHeadingClasses = await page
      .getByTestId('skillpilot-overview-heading')
      .evaluate((heading) => [...heading.classList])
    for (const interactionClass of [
      'group-hover:text-emerald-700',
      'group-focus-within:text-emerald-700',
      'dark:group-hover:text-emerald-300',
      'dark:group-focus-within:text-emerald-300',
    ]) {
      assert(
        overviewHeadingClasses.includes(interactionClass),
        `${language}: overview heading uses approved green interaction class ${interactionClass}`,
      )
    }
    assert(
      overviewHeadingClasses.every((className) => !className.includes('violet')),
      `${language}: overview heading has no purple interaction color`,
    )
    await page.mouse.move(374, 899)
    await flushBrowserEffects(page)
    const [restingCardBoxShadow, restingDisclosureBoxShadow, cardFrameClasses] = await Promise.all([
      overviewEntry.evaluate((card) => getComputedStyle(card).boxShadow),
      disclosureButton.evaluate((button) => getComputedStyle(button).boxShadow),
      overviewEntry.evaluate((card) => [...card.classList]),
    ])
    assert(
      cardFrameClasses.includes('hover:border-emerald-400/70')
      && cardFrameClasses.includes('focus-within:border-emerald-500'),
      `${language}: the overview card uses the approved single green interaction border`,
    )
    assert(
      !cardFrameClasses.some((className) => className.startsWith('focus-within:ring')),
      `${language}: the overview card has no second focus-within ring`,
    )
    await assertActionRowStructure(page, language)
    const closedDisclosureAppearance = await assertClosedDisclosurePill(page, language)
    assert.equal(await page.locator('audio, video').count(), 0, 'the root has no parallel media player')
    const cardDescription = overviewEntry.getByTestId('skillpilot-overview-card-description')
    assert.equal(
      await cardDescription.textContent(),
      expected.cardDescription,
      `${language}: closed card uses the exact factual overview subtitle`,
    )
    assert(await cardDescription.isVisible(), `${language}: factual overview subtitle is immediately visible`)
    assert.equal(
      await overviewEntry.getByTestId('skillpilot-overview-card-tagline').count(),
      0,
      `${language}: the former compact vision tagline is removed from the closed card`,
    )
    assert.equal(
      await overviewEntry.getByText(expected.removedCompactMission, { exact: true }).count(),
      0,
      `${language}: the former compact mission is absent rather than repeated`,
    )
    const fullVisionTagline = overviewEntry.getByText(expected.removedCardTagline, { exact: true })
    assert.equal(
      await fullVisionTagline.count(),
      1,
      `${language}: the former visible tagline remains only as full vision copy`,
    )
    assert(
      await fullVisionTagline.isHidden(),
      `${language}: the vision tagline is not visible while the disclosure is closed`,
    )
    const overviewEntryText = await overviewEntry.textContent()
    for (const visibleText of [
      expected.title,
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
    const actionListLabel = await overviewEntry
      .getByTestId('skillpilot-overview-media-actions')
      .evaluate((list) => {
        const labelledBy = list.getAttribute('aria-labelledby')
        return {
          labelledBy,
          labelText: labelledBy
            ? document.getElementById(labelledBy)?.textContent?.trim() ?? null
            : null,
        }
      })
    assert(actionListLabel.labelledBy, `${language}: root action list references its card heading`)
    assert.equal(
      actionListLabel.labelText,
      expected.title,
      `${language}: all four actions share the localized overview heading as accessible name`,
    )
    await assertMobileActionWrap(page, language)

    assert.equal(await disclosureButton.getAttribute('aria-expanded'), 'false')
    assert.equal(
      (await disclosureButton.innerText()).trim(),
      expected.disclosure.label,
      `${language}: the closed disclosure has its exact localized label`,
    )
    const controlledPanelId = await disclosureButton.getAttribute('aria-controls')
    assert(controlledPanelId, `${language}: the disclosure identifies its controlled panel`)
    const disclosurePanel = overviewEntry.getByTestId('skillpilot-overview-disclosure-panel')
    assert.equal(
      await disclosurePanel.getAttribute('id'),
      controlledPanelId,
      `${language}: aria-controls resolves to the inline disclosure panel`,
    )
    assert.notEqual(
      await disclosurePanel.getAttribute('hidden'),
      null,
      `${language}: the controlled panel is hidden by default`,
    )
    assert(await disclosurePanel.isHidden(), `${language}: the full copy is not displayed initially`)
    const disclosureIntroduction = disclosurePanel.getByTestId(
      'skillpilot-overview-disclosure-introduction',
    )
    assert.equal(
      await disclosureIntroduction.textContent(),
      expected.disclosure.introduction,
      `${language}: disclosure contains the exact localized long-term-goal clarification`,
    )
    assert(
      await disclosureIntroduction.isHidden(),
      `${language}: long-term-goal clarification is initially hidden with the disclosure`,
    )
    assert.equal(
      await disclosurePanel.evaluate((panel) => panel.closest('[data-testid="skillpilot-overview-entry"]') !== null),
      true,
      `${language}: the controlled panel stays inside the same overview card`,
    )
    assert.equal(
      await overviewEntry.getByRole('dialog').count(),
      0,
      `${language}: the disclosure does not create a dialog`,
    )

    const disclosureIcon = disclosureButton.getByTestId('skillpilot-overview-disclosure-icon')
    assert.equal(await disclosureIcon.count(), 1, `${language}: disclosure has one leading Compass icon`)
    assert.equal(
      await disclosureIcon.evaluate((icon) => icon.tagName.toLowerCase()),
      'svg',
      `${language}: the leading Compass icon is an SVG`,
    )
    assert.equal(
      await disclosureIcon.getAttribute('aria-hidden'),
      'true',
      `${language}: the decorative Compass icon is hidden from assistive technology`,
    )
    assert(
      (await disclosureIcon.getAttribute('class'))?.split(/\s+/u).includes('lucide-compass'),
      `${language}: the leading symbol is the intended Compass icon`,
    )
    const disclosureChevron = disclosureButton.getByTestId('skillpilot-overview-disclosure-chevron')
    assert.equal(await disclosureChevron.count(), 1, `${language}: the disclosure has one chevron`)
    assert.equal(
      await disclosureChevron.evaluate((chevron) => chevron.tagName.toLowerCase()),
      'svg',
      `${language}: the visual state marker is an SVG chevron`,
    )
    assert.equal(
      await disclosureChevron.getAttribute('aria-hidden'),
      'true',
      `${language}: the decorative chevron is hidden from assistive technology`,
    )
    assert(
      !(await disclosureChevron.getAttribute('class'))?.split(/\s+/u).includes('rotate-180'),
      `${language}: the closed chevron points down`,
    )
    assert.deepEqual(
      await disclosureButton.locator(':scope > *').evaluateAll((children) => children.map((child) => (
        child.getAttribute('data-testid')
        ?? (child.tagName.toLowerCase() === 'span' ? 'visible-label' : null)
      ))),
      [
        'skillpilot-overview-disclosure-icon',
        'visible-label',
        'skillpilot-overview-disclosure-chevron',
      ],
      `${language}: Compass, constant label and state chevron keep their visual order`,
    )

    for (const [sectionName, [heading, tagline, description]] of Object.entries({
      vision: expected.disclosure.vision,
      mission: expected.disclosure.mission,
    })) {
      assert.equal(
        await disclosurePanel.getByRole('heading', {
          name: heading,
          exact: true,
          includeHidden: true,
        }).count(),
        1,
        `${language}: ${sectionName} has its exact localized heading`,
      )
      assert.equal(
        await disclosurePanel.getByText(tagline, { exact: true }).count(),
        1,
        `${language}: ${sectionName} has its exact localized tagline`,
      )
      assert.equal(
        await disclosurePanel.getByText(description, { exact: true }).count(),
        1,
        `${language}: ${sectionName} has its exact localized full text`,
      )
    }

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

    const unchangedRootUrl = page.url()
    await assertNoHorizontalOverflow(page, `${language}: closed root card has no mobile overflow`)
    await page.keyboard.press('Tab')
    assert.equal(
      await disclosureButton.evaluate((button) => document.activeElement === button),
      true,
      `${language}: Tab moves from the final media link to the disclosure button`,
    )
    await page.keyboard.press('Enter')
    await disclosurePanel.waitFor({ state: 'visible' })
    await flushBrowserEffects(page)
    const openDisclosureAppearance = await readDisclosurePillAppearance(page)
    for (const activeClassName of [
      'border-emerald-300/80',
      'bg-emerald-50/80',
      'text-emerald-800',
    ]) {
      assert(
        openDisclosureAppearance.classNames.includes(activeClassName),
        `${language}: open disclosure uses active class ${activeClassName}`,
      )
    }
    for (const closedClassName of [
      'border-violet-200/80',
      'bg-violet-50/70',
      'text-text-secondary',
    ]) {
      assert(
        !openDisclosureAppearance.classNames.includes(closedClassName),
        `${language}: open disclosure replaces closed class ${closedClassName}`,
      )
    }
    assert.notEqual(
      openDisclosureAppearance.backgroundColor,
      closedDisclosureAppearance.backgroundColor,
      `${language}: open disclosure has a visibly distinct green background`,
    )
    assert.notEqual(
      openDisclosureAppearance.borderColor,
      closedDisclosureAppearance.borderColor,
      `${language}: open disclosure has a visibly distinct green border`,
    )
    assert.equal(
      openDisclosureAppearance.borderRadius,
      closedDisclosureAppearance.borderRadius,
      `${language}: open disclosure retains the same rounded pill geometry`,
    )
    const [focusedCardRendering, focusedDisclosureRendering] = await Promise.all([
      overviewEntry.evaluate((card) => {
        const style = getComputedStyle(card)
        return {
          borderWidths: [
            style.borderTopWidth,
            style.borderRightWidth,
            style.borderBottomWidth,
            style.borderLeftWidth,
          ],
          boxShadow: style.boxShadow,
          focusWithin: card.matches(':focus-within'),
        }
      }),
      disclosureButton.evaluate((button) => ({
        active: document.activeElement === button,
        boxShadow: getComputedStyle(button).boxShadow,
        focusVisible: button.matches(':focus-visible'),
      })),
    ])
    assert(focusedCardRendering.focusWithin, `${language}: the open card contains keyboard focus`)
    assert(
      focusedCardRendering.borderWidths.every((width) => width === '1px'),
      `${language}: the focused overview card keeps exactly one 1px border`,
    )
    assert.equal(
      focusedCardRendering.boxShadow,
      restingCardBoxShadow,
      `${language}: focusing the disclosure adds no outer card ring`,
    )
    assert(
      focusedDisclosureRendering.active && focusedDisclosureRendering.focusVisible,
      `${language}: the disclosure button itself retains keyboard focus visibility`,
    )
    assert.notEqual(
      focusedDisclosureRendering.boxShadow,
      restingDisclosureBoxShadow,
      `${language}: the keyboard-focused disclosure retains its local focus ring`,
    )
    assert.equal(await disclosureButton.getAttribute('aria-expanded'), 'true')
    assert.equal(await disclosurePanel.getAttribute('hidden'), null)
    assert.equal(
      (await disclosureButton.innerText()).trim(),
      expected.disclosure.label,
      `${language}: opening preserves the constant disclosure label`,
    )
    assert(
      (await disclosureChevron.getAttribute('class'))?.split(/\s+/u).includes('rotate-180'),
      `${language}: opening turns the chevron upward`,
    )
    assert.equal(page.url(), unchangedRootUrl, `${language}: opening performs no navigation`)
    assert.equal(context.pages().length, 1, `${language}: opening creates no popup or new page`)
    assert.equal(
      await page.locator('[role="dialog"]').count(),
      0,
      `${language}: opening remains inline and creates no modal`,
    )
    assert(
      await disclosureIntroduction.isVisible(),
      `${language}: opened panel displays the long-term-goal clarification`,
    )
    for (const statement of [expected.disclosure.vision, expected.disclosure.mission]) {
      for (const exactCopy of statement) {
        assert(
          await disclosurePanel.getByText(exactCopy, { exact: true }).isVisible(),
          `${language}: opened panel displays ${exactCopy}`,
        )
      }
    }
    await assertDisclosureColumns(page, language, 'stacked')
    await assertNoHorizontalOverflow(page, `${language}: open root card has no mobile overflow`)

    // Disclosure state is intentionally local to this render and is never
    // persisted across a reload or a fresh visit to the root route.
    await page.reload()
    await overviewEntry.waitFor()
    await disclosurePanel.waitFor({ state: 'hidden' })
    assert.equal(
      await disclosureButton.getAttribute('aria-expanded'),
      'false',
      `${language}: reload restores the initially closed disclosure`,
    )
    assert.notEqual(
      await disclosurePanel.getAttribute('hidden'),
      null,
      `${language}: reload does not persist the open panel`,
    )
    assert.equal(
      (await disclosureButton.innerText()).trim(),
      expected.disclosure.label,
      `${language}: reload preserves the same constant disclosure label`,
    )

    await disclosureButton.click()
    await disclosurePanel.waitFor({ state: 'visible' })
    await disclosureButton.focus()
    await page.keyboard.press('Space')
    await disclosurePanel.waitFor({ state: 'hidden' })
    const reclosedDisclosureClasses = await disclosureButton.evaluate((button) => [...button.classList])
    assert.equal(await disclosureButton.getAttribute('aria-expanded'), 'false')
    assert.notEqual(await disclosurePanel.getAttribute('hidden'), null)
    assert.equal(
      (await disclosureButton.innerText()).trim(),
      expected.disclosure.label,
      `${language}: Space closes without changing the disclosure label`,
    )
    assert(
      reclosedDisclosureClasses.includes('border-violet-200/80')
      && reclosedDisclosureClasses.includes('bg-violet-50/70')
      && reclosedDisclosureClasses.includes('text-text-secondary'),
      `${language}: Space restores the closed violet media-pill styling`,
    )
    assert(
      !reclosedDisclosureClasses.includes('border-emerald-300/80')
      && !reclosedDisclosureClasses.includes('bg-emerald-50/80')
      && !reclosedDisclosureClasses.includes('text-emerald-800'),
      `${language}: Space removes the green active styling`,
    )
    assert(
      !(await disclosureChevron.getAttribute('class'))?.split(/\s+/u).includes('rotate-180'),
      `${language}: closing restores the downward chevron`,
    )
    assert.equal(page.url(), unchangedRootUrl, `${language}: closing performs no navigation`)
    await assertNoHorizontalOverflow(page, `${language}: reclosed root card has no mobile overflow`)

    await page.setViewportSize({ width: 849, height: 900 })
    await page.goto(`${origin}/`)
    await page.getByTestId('skillpilot-overview-entry').waitFor()
    await page.getByTestId('skillpilot-overview-disclosure-toggle').click()
    await page.getByTestId('skillpilot-overview-disclosure-panel').waitFor({ state: 'visible' })
    await assertDisclosureColumns(page, language, 'stacked')
    await assertNoHorizontalOverflow(page, `${language}: open card has no overflow below 850px`)

    await page.setViewportSize({ width: 850, height: 900 })
    await page.goto(`${origin}/`)
    await page.getByTestId('skillpilot-overview-entry').waitFor()
    await assertDesktopActionLayout(page, language)
    await page.getByTestId('skillpilot-overview-disclosure-toggle').click()
    await page.getByTestId('skillpilot-overview-disclosure-panel').waitFor({ state: 'visible' })
    await assertDesktopActionLayout(page, language)
    await assertDisclosureColumns(page, language, 'columns')
    await assertNoHorizontalOverflow(page, `${language}: two-column card has no overflow from 850px`)
    await page.setViewportSize({ width: 375, height: 900 })

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
