import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Locator, type Page } from 'playwright'

import { startViteTestServer } from './viteTestServer'

type Language = 'de' | 'en'
type LandingRole = 'learner' | 'trainer' | 'explorer'

interface LanguageExpectation {
  accessNotice: string
  accessSummary: string
  footerLabels: string[]
  landingPillLabels: string[]
  overviewTitle: string
  panelHeadingLabels: string[]
  removedHeroLine: string
}

const expectedByLanguage: Record<Language, LanguageExpectation> = {
  de: {
    accessNotice: 'SkillPilot ist kostenlos. Aktuell nutzbar ist nur die Claude-Beta. Dafür ist ein kostenpflichtiger Claude-Tarif erforderlich; unterstützt und getestet ist derzeit Claude Pro. Der ChatGPT-Zugang wartet noch auf Freigabe und kann derzeit nicht genutzt werden.',
    accessSummary: 'Aktuell ist nur die Claude-Beta nutzbar; ChatGPT wartet auf Freigabe.',
    footerLabels: ['Statistiken', 'Nutzungsbedingungen', 'Datenschutz', 'Impressum'],
    landingPillLabels: [
      'Jetzt lernen',
      '5-Minuten-Quickstart',
      'FAQ',
      'Kursorganisation öffnen',
      'SkillGraph erkunden',
      'Lernzielbuch',
      'Curriculum-Champion werden',
    ],
    overviewTitle: 'SkillPilot im Überblick',
    panelHeadingLabels: [
      'Lernen starten',
      'SkillPilot im Überblick',
      'Kurse planen',
      'Curricula & Lernziele',
    ],
    removedHeroLine: 'So startest du in 5 Minuten',
  },
  en: {
    accessNotice: 'SkillPilot is free. Currently, only the Claude beta is available. A paid Claude plan is required; Claude Pro is the plan currently supported and tested. ChatGPT access is awaiting approval and cannot currently be used.',
    accessSummary: 'Currently, only the Claude beta is available; ChatGPT is awaiting approval.',
    footerLabels: ['Statistics', 'Terms of Use', 'Privacy', 'Imprint'],
    landingPillLabels: [
      'Learn now',
      '5-minute quickstart',
      'FAQ',
      'Open course organization',
      'Explore SkillGraph',
      'Learning goal book',
      'Become a Curriculum Champion',
    ],
    overviewTitle: 'SkillPilot at a glance',
    panelHeadingLabels: [
      'Start learning',
      'SkillPilot at a glance',
      'Plan courses',
      'Curricula & learning goals',
    ],
    removedHeroLine: 'Start in 5 minutes',
  },
}

const panelTestIds = [
  'public-landing-panel-learning',
  'skillpilot-overview-entry',
  'public-landing-panel-teaching',
  'public-landing-panel-curricula',
] as const

const callbackActions: Array<{
  actionTestId: string
  role: LandingRole
}> = [
  { actionTestId: 'public-landing-action-learning', role: 'learner' },
  { actionTestId: 'public-landing-action-course-planning', role: 'trainer' },
  { actionTestId: 'public-landing-action-explorer', role: 'explorer' },
]

const landingPillActionTestIds = [
  'public-landing-action-learning',
  'public-landing-action-quickstart',
  'public-landing-action-faq',
  'public-landing-action-course-planning',
  'public-landing-action-explorer',
  'public-landing-action-goal-book',
  'public-landing-action-curriculum-champions',
] as const

const interactiveLandingPanels = [
  {
    actionTestId: 'public-landing-action-learning',
    panelTestId: 'public-landing-panel-learning',
  },
  {
    actionTestId: 'public-landing-action-course-planning',
    panelTestId: 'public-landing-panel-teaching',
  },
  {
    actionTestId: 'public-landing-action-explorer',
    panelTestId: 'public-landing-panel-curricula',
  },
] as const

const routeActions = (language: Language) => ([
  ['public-landing-action-quickstart', `/quickstart/${language}`],
  ['public-landing-action-faq', '/faq'],
  ['skillpilot-overview-format-audio', `/whitepaper/${language}?play=audio#audio`],
  ['skillpilot-overview-format-video', `/whitepaper/${language}?play=video#video`],
  ['skillpilot-overview-format-whitepaper', `/whitepaper/${language}#whitepaper`],
  ['public-landing-action-goal-book', '/lernzielbuch'],
  ['public-landing-action-curriculum-champions', '/curricula'],
] as const)

const normalizeText = (value: string | null) => value?.replace(/\s+/gu, ' ').trim() ?? ''

interface PillVisualMetrics {
  backgroundColor: string
  borderColor: string
  borderRadius: string
  color: string
  columnGap: string
  fontSize: string
  fontWeight: string
  height: number
  iconHeight: number
  iconWidth: number
  lineHeight: string
  paddingBottom: string
  paddingTop: string
}

interface PanelVisualState {
  borderColor: string
  boxShadow: string
  headingColor: string
}

const readPillVisualMetrics = (action: Locator): Promise<PillVisualMetrics> => (
  action.evaluate((element) => {
    const actionStyle = getComputedStyle(element)
    const colorValues = [
      actionStyle.backgroundColor,
      actionStyle.borderTopColor,
      actionStyle.color,
    ]
    const srgbValues: string[] = []
    for (const value of colorValues) {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const context = canvas.getContext('2d')
      if (!context) {
        srgbValues.push(value)
        continue
      }
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = value
      context.fillRect(0, 0, 1, 1)
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
      srgbValues.push(`rgb(${red}, ${green}, ${blue})`)
    }
    const actionBounds = element.getBoundingClientRect()
    const icon = element.querySelector<SVGElement>('svg[aria-hidden="true"]')
    const iconBounds = icon?.getBoundingClientRect()
    return {
      backgroundColor: srgbValues[0]!,
      borderColor: srgbValues[1]!,
      borderRadius: actionStyle.borderRadius,
      color: srgbValues[2]!,
      columnGap: actionStyle.columnGap,
      fontSize: actionStyle.fontSize,
      fontWeight: actionStyle.fontWeight,
      height: actionBounds.height,
      iconHeight: iconBounds?.height ?? 0,
      iconWidth: iconBounds?.width ?? 0,
      lineHeight: actionStyle.lineHeight,
      paddingBottom: actionStyle.paddingBottom,
      paddingTop: actionStyle.paddingTop,
    }
  })
)

const readPanelVisualState = (panel: Locator): Promise<PanelVisualState> => (
  panel.evaluate((element) => {
    const panelStyle = getComputedStyle(element)
    const heading = element.querySelector<HTMLElement>('h2, h3')
    if (!heading) {
      throw new Error('Interactive landing panel has no heading')
    }
    const colorValues = [panelStyle.borderTopColor, getComputedStyle(heading).color]
    const srgbValues: string[] = []
    for (const value of colorValues) {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const context = canvas.getContext('2d')
      if (!context) {
        srgbValues.push(value)
        continue
      }
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = value
      context.fillRect(0, 0, 1, 1)
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
      srgbValues.push(`rgb(${red}, ${green}, ${blue})`)
    }
    return {
      borderColor: srgbValues[0]!,
      boxShadow: panelStyle.boxShadow,
      headingColor: srgbValues[1]!,
    }
  })
)

const parseRgb = (value: string): [number, number, number] => {
  const channels = value.match(/[\d.]+/gu)?.slice(0, 3).map(Number)
  assert.equal(channels?.length, 3, `expected a computed RGB color, received ${value}`)
  return channels as [number, number, number]
}

const colorDistance = (left: string, right: string) => {
  const leftRgb = parseRgb(left)
  const rightRgb = parseRgb(right)
  return Math.hypot(...leftRgb.map((channel, index) => channel - rightRgb[index]!))
}

const isChromaticColor = (value: string) => {
  const channels = parseRgb(value)
  return Math.max(...channels) - Math.min(...channels) >= 20
}

const assertPanelHeadingIcons = async (
  page: Page,
  language: Language,
  viewport: string,
) => {
  const expected = expectedByLanguage[language]
  for (const [index, panelTestId] of panelTestIds.entries()) {
    const heading = page.getByTestId(panelTestId).locator(':scope > h2')
    assert.equal(
      normalizeText(await heading.innerText()),
      expected.panelHeadingLabels[index],
      `${language} ${viewport}: ${panelTestId} keeps its visible localized heading`,
    )
    const iconState = await heading.evaluate((element) => {
      const icons = [...element.querySelectorAll<SVGElement>('svg[aria-hidden="true"]')]
      return icons.map((icon) => {
        const bounds = icon.getBoundingClientRect()
        const style = getComputedStyle(icon)
        return {
          height: bounds.height,
          visible: style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(style.opacity) > 0,
          width: bounds.width,
        }
      })
    })
    assert.equal(
      iconState.length,
      1,
      `${language} ${viewport}: ${panelTestId} heading has one decorative icon`,
    )
    assert(
      iconState[0]!.visible && iconState[0]!.width > 0 && iconState[0]!.height > 0,
      `${language} ${viewport}: ${panelTestId} heading icon is visibly rendered`,
    )
  }
}

const assertPillContentAndSizing = async (
  page: Page,
  language: Language,
  viewport: string,
) => {
  const expected = expectedByLanguage[language]
  const referenceAction = page.getByTestId('skillpilot-overview-format-audio')
  const referenceMetrics = await readPillVisualMetrics(referenceAction)

  assert(referenceMetrics.height > 0, `${language} ${viewport}: overview reference pill is visible`)
  assert(referenceMetrics.iconHeight > 0, `${language} ${viewport}: overview reference icon is visible`)

  for (const [index, testId] of landingPillActionTestIds.entries()) {
    const action = page.getByTestId(testId)
    const content = await action.evaluate((element) => {
      const visibleIcons = [...element.querySelectorAll<SVGElement>('svg[aria-hidden="true"]')]
        .filter((icon) => {
          const bounds = icon.getBoundingClientRect()
          const style = getComputedStyle(icon)
          return bounds.width > 0
            && bounds.height > 0
            && style.display !== 'none'
            && style.visibility !== 'hidden'
        })
      const visibleTextParts: string[] = []
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      let textNode = walker.nextNode()
      while (textNode) {
        const value = textNode.textContent?.replace(/\s+/gu, ' ').trim() ?? ''
        const parent = textNode.parentElement
        if (value && parent && !parent.closest('svg')) {
          const style = getComputedStyle(parent)
          const range = document.createRange()
          range.selectNodeContents(textNode)
          const bounds = range.getBoundingClientRect()
          if (
            bounds.width > 0
            && bounds.height > 0
            && style.display !== 'none'
            && style.visibility !== 'hidden'
          ) {
            visibleTextParts.push(value)
          }
        }
        textNode = walker.nextNode()
      }
      return {
        iconCount: visibleIcons.length,
        visibleText: visibleTextParts.join(' ').replace(/\s+/gu, ' ').trim(),
      }
    })
    assert.equal(
      content.iconCount,
      1,
      `${language} ${viewport}: ${testId} has one visible decorative icon`,
    )
    assert.equal(
      content.visibleText,
      expected.landingPillLabels[index],
      `${language} ${viewport}: ${testId} keeps its localized visible text beside the icon`,
    )

    const metrics = await readPillVisualMetrics(action)
    assert(
      Math.abs(metrics.height - referenceMetrics.height) <= 2,
      `${language} ${viewport}: ${testId} height ${metrics.height}px matches the overview pill height ${referenceMetrics.height}px`,
    )
    assert(
      Math.abs(metrics.iconHeight - referenceMetrics.iconHeight) <= 2
        && Math.abs(metrics.iconWidth - referenceMetrics.iconWidth) <= 2,
      `${language} ${viewport}: ${testId} icon size matches the overview pill icon`,
    )
    assert.deepEqual(
      {
        borderRadius: metrics.borderRadius,
        columnGap: metrics.columnGap,
        fontSize: metrics.fontSize,
        fontWeight: metrics.fontWeight,
        lineHeight: metrics.lineHeight,
        paddingBottom: metrics.paddingBottom,
        paddingTop: metrics.paddingTop,
      },
      {
        borderRadius: referenceMetrics.borderRadius,
        columnGap: referenceMetrics.columnGap,
        fontSize: referenceMetrics.fontSize,
        fontWeight: referenceMetrics.fontWeight,
        lineHeight: referenceMetrics.lineHeight,
        paddingBottom: referenceMetrics.paddingBottom,
        paddingTop: referenceMetrics.paddingTop,
      },
      `${language} ${viewport}: ${testId} shares the overview pill geometry and typography`,
    )
    if (testId !== 'public-landing-action-learning') {
      assert.deepEqual(
        {
          backgroundColor: metrics.backgroundColor,
          borderColor: metrics.borderColor,
          color: metrics.color,
        },
        {
          backgroundColor: referenceMetrics.backgroundColor,
          borderColor: referenceMetrics.borderColor,
          color: referenceMetrics.color,
        },
        `${language} ${viewport}: ${testId} shares the overview pill's quiet secondary treatment`,
      )
    }
  }

  const primaryMetrics = await readPillVisualMetrics(
    page.getByTestId('public-landing-action-learning'),
  )
  assert(
    colorDistance(primaryMetrics.backgroundColor, referenceMetrics.backgroundColor) >= 80,
    `${language} ${viewport}: the primary learning pill is clearly highlighted against secondary pills`,
  )
  assert.notEqual(
    primaryMetrics.color,
    referenceMetrics.color,
    `${language} ${viewport}: the primary learning pill also has a distinct foreground treatment`,
  )
}

const assertPanelInteractionFeel = async (
  page: Page,
  language: Language,
  viewport: string,
) => {
  const resetInteraction = async () => {
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.mouse.move(1, 1)
  }
  const assertReactiveState = (
    base: PanelVisualState,
    active: PanelVisualState,
    label: string,
  ) => {
    assert.notEqual(active.borderColor, base.borderColor, `${label}: panel border reacts`)
    assert.notEqual(active.headingColor, base.headingColor, `${label}: panel heading reacts`)
    assert.notEqual(active.boxShadow, base.boxShadow, `${label}: panel shadow reacts`)
    assert(
      isChromaticColor(active.borderColor),
      `${label}: active border ${active.borderColor} is chromatic`,
    )
    assert(
      isChromaticColor(active.headingColor),
      `${label}: active heading ${active.headingColor} is chromatic`,
    )
    assert.notEqual(active.boxShadow, 'none', `${label}: active panel has a visible shadow`)
  }
  const assertAccentReaction = (
    base: PanelVisualState,
    active: PanelVisualState,
    label: string,
  ) => {
    assert.notEqual(active.borderColor, base.borderColor, `${label}: panel border reacts`)
    assert.notEqual(active.headingColor, base.headingColor, `${label}: panel heading reacts`)
    assert(
      isChromaticColor(active.borderColor),
      `${label}: active border ${active.borderColor} is chromatic`,
    )
    assert(
      isChromaticColor(active.headingColor),
      `${label}: active heading ${active.headingColor} is chromatic`,
    )
  }
  const assertPairwiseDistinctAccents = (
    states: Array<{ panelTestId: string; visual: PanelVisualState }>,
    stateLabel: string,
  ) => {
    for (let leftIndex = 0; leftIndex < states.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < states.length; rightIndex += 1) {
        const left = states[leftIndex]!
        const right = states[rightIndex]!
        assert(
          colorDistance(left.visual.borderColor, right.visual.borderColor) >= 40,
          `${language} ${viewport}: ${left.panelTestId} and ${right.panelTestId} have distinguishable ${stateLabel} border accents`,
        )
        assert(
          colorDistance(left.visual.headingColor, right.visual.headingColor) >= 40,
          `${language} ${viewport}: ${left.panelTestId} and ${right.panelTestId} have distinguishable ${stateLabel} heading accents`,
        )
      }
    }
  }

  await resetInteraction()
  const overviewPanel = page.getByTestId('skillpilot-overview-entry')
  const overviewBase = await readPanelVisualState(overviewPanel)
  await overviewPanel.hover()
  const overviewHover = await readPanelVisualState(overviewPanel)
  assertReactiveState(
    overviewBase,
    overviewHover,
    `${language} ${viewport}: overview hover reference`,
  )
  const hoverAccentStates = [{
    panelTestId: 'skillpilot-overview-entry',
    visual: overviewHover,
  }]

  await resetInteraction()
  await page.getByTestId('skillpilot-overview-format-audio').focus()
  const overviewFocusWithin = await readPanelVisualState(overviewPanel)
  assertAccentReaction(
    overviewBase,
    overviewFocusWithin,
    `${language} ${viewport}: overview focus-within`,
  )
  const focusAccentStates = [{
    panelTestId: 'skillpilot-overview-entry',
    visual: overviewFocusWithin,
  }]

  for (const { actionTestId, panelTestId } of interactiveLandingPanels) {
    await resetInteraction()
    const panel = page.getByTestId(panelTestId)
    const base = await readPanelVisualState(panel)

    await panel.hover()
    const hover = await readPanelVisualState(panel)
    assertReactiveState(base, hover, `${language} ${viewport}: ${panelTestId} hover`)
    assert.equal(
      hover.boxShadow,
      overviewHover.boxShadow,
      `${language} ${viewport}: ${panelTestId} hover uses the overview panel shadow`,
    )
    hoverAccentStates.push({ panelTestId, visual: hover })

    await resetInteraction()
    await page.getByTestId(actionTestId).focus()
    const focusWithin = await readPanelVisualState(panel)
    assertReactiveState(base, focusWithin, `${language} ${viewport}: ${panelTestId} focus-within`)
    assert.equal(
      focusWithin.boxShadow,
      overviewHover.boxShadow,
      `${language} ${viewport}: ${panelTestId} keyboard focus uses the overview panel shadow`,
    )
    focusAccentStates.push({ panelTestId, visual: focusWithin })
  }

  assertPairwiseDistinctAccents(hoverAccentStates, 'hover')
  assertPairwiseDistinctAccents(focusAccentStates, 'focus')

  await resetInteraction()
}

const assertNoHorizontalOverflow = async (page: Page, message: string) => {
  const overflow = await page.evaluate(() => ({
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    overflowingElements: [...document.querySelectorAll<HTMLElement>('body *')]
      .map((element) => {
        const bounds = element.getBoundingClientRect()
        return {
          className: element.className,
          left: bounds.left,
          right: bounds.right,
          tagName: element.tagName,
          testId: element.dataset.testid ?? null,
        }
      })
      .filter(({ left, right }) => left < -1 || right > document.documentElement.clientWidth + 1)
      .slice(0, 8),
  }))
  assert(
    overflow.documentScrollWidth <= overflow.documentClientWidth
      && overflow.bodyScrollWidth <= overflow.bodyClientWidth,
    `${message}: ${JSON.stringify(overflow)}`,
  )
}

const assertPanelLayout = async (page: Page, language: Language, viewport: string) => {
  const bounds = await Promise.all(panelTestIds.map((testId) => (
    page.getByTestId(testId).evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return {
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        top: rect.top,
      }
    })
  )))

  assert(
    bounds.every((bound, index) => (
      index === 0
      || (
        bound.top > bounds[index - 1]!.top
        && bound.top >= bounds[index - 1]!.bottom - 1
      )
    )),
    `${language} ${viewport}: the four panels form one calm vertical sequence`,
  )
  assert(
    bounds.every((bound) => (
      Math.abs(bound.left - bounds[0]!.left) <= 1
      && Math.abs(bound.right - bounds[0]!.right) <= 1
    )),
    `${language} ${viewport}: all four panels share one aligned width`,
  )
  await assertNoHorizontalOverflow(
    page,
    `${language} ${viewport}: the landing page has no horizontal overflow`,
  )
}

const assertLandingContract = async (page: Page, language: Language, viewport: string) => {
  const expected = expectedByLanguage[language]
  const landing = page.getByTestId('public-landing-panels')
  await landing.waitFor()

  assert.equal(
    await page.evaluate(() => document.documentElement.lang),
    language,
    `${language} ${viewport}: the document language follows the selected UI language`,
  )
  assert.equal(
    normalizeText(await page.locator('body').innerText()).includes(expected.removedHeroLine),
    false,
    `${language} ${viewport}: the redundant five-minute hero line is completely absent`,
  )
  assert.deepEqual(
    await landing.locator(':scope > [data-testid]').evaluateAll((elements) => (
      elements.map((element) => element.getAttribute('data-testid'))
    )),
    panelTestIds,
    `${language} ${viewport}: the four audience panels keep their semantic order`,
  )

  for (const panelTestId of panelTestIds) {
    const panel = page.getByTestId(panelTestId)
    assert.equal(await panel.count(), 1, `${language}: ${panelTestId} is unique`)
    assert.equal(
      await panel.evaluate((element) => ['a', 'button'].includes(element.tagName.toLowerCase())),
      false,
      `${language}: ${panelTestId} is not one enclosing interaction`,
    )
    assert.equal(
      await panel.locator(':scope > h2').count(),
      1,
      `${language}: ${panelTestId} is one level-two section below the page heading`,
    )
  }

  assert.equal(
    await page.getByTestId('skillpilot-overview-heading').textContent().then(normalizeText),
    expected.overviewTitle,
    `${language}: the unchanged overview receives the active language`,
  )
  await assertPanelHeadingIcons(page, language, viewport)

  const accessNotice = page.getByTestId('public-landing-access-notice')
  assert.equal(await accessNotice.count(), 1, `${language}: one compact access notice is present`)
  assert.equal(
    await accessNotice.evaluate((element) => element.tagName.toLowerCase()),
    'details',
    `${language}: the complete access explanation is progressively disclosed`,
  )
  assert.equal(
    await accessNotice.getAttribute('open'),
    null,
    `${language}: access details do not dominate the calm initial page`,
  )
  assert.equal(
    await accessNotice.locator(':scope > summary > span').first().textContent().then(normalizeText),
    expected.accessSummary,
    `${language}: the essential current availability remains visible without expanding details`,
  )
  assert.equal(
    normalizeText(await accessNotice.locator(':scope > div').textContent()).replace(
      language === 'de' ? 'Zugänge vergleichen' : 'Compare access options',
      '',
    ).trim(),
    expected.accessNotice,
    `${language}: the access notice states the current provider availability truthfully`,
  )
  assert.equal(
    await accessNotice.evaluate((notice) => (
      notice.closest('[data-testid="public-landing-panel-learning"]') !== null
    )),
    true,
    `${language}: the access notice remains attached to the learning entry`,
  )
  assert.equal(
    await page.getByTestId('public-landing-access-link').getAttribute('href'),
    '/faq/coach-setup',
    `${language}: the compact notice keeps the access comparison target`,
  )
  await accessNotice.locator(':scope > summary').click()
  assert.equal(
    await page.getByTestId('public-landing-access-link').isVisible(),
    true,
    `${language}: the complete access explanation and comparison action open on demand`,
  )

  for (const [testId, expectedHref] of routeActions(language)) {
    const action = page.getByTestId(testId)
    assert.equal(await action.count(), 1, `${language}: ${testId} is unique`)
    assert.equal(
      await action.evaluate((element) => element.tagName.toLowerCase()),
      'a',
      `${language}: ${testId} is a real navigation link`,
    )
    assert.equal(
      await action.getAttribute('href'),
      expectedHref,
      `${language}: ${testId} has one unambiguous destination`,
    )
  }

  for (const { actionTestId } of callbackActions) {
    const action = page.getByTestId(actionTestId)
    assert.equal(await action.count(), 1, `${language}: ${actionTestId} is unique`)
    assert.equal(
      await action.evaluate((element) => element.tagName.toLowerCase()),
      'button',
      `${language}: ${actionTestId} is a callback button`,
    )
    assert.equal(await action.getAttribute('type'), 'button')
  }

  assert.equal(
    await landing.locator('a a, a button, button a, button button').count(),
    0,
    `${language}: landing interactions are never nested`,
  )
  const accessibleActionNames = await landing.locator('a, button').evaluateAll((elements) => (
    elements.map((element) => (
      element.getAttribute('aria-label') || element.textContent || ''
    ).replace(/\s+/gu, ' ').trim())
  ))
  assert(
    accessibleActionNames.every(Boolean),
    `${language}: every landing action has an accessible name`,
  )

  await assertPillContentAndSizing(page, language, viewport)
  await assertPanelInteractionFeel(page, language, viewport)

  const footer = page.getByTestId('public-landing-footer')
  assert.equal(await footer.count(), 1, `${language}: one public footer is present`)
  assert.deepEqual(
    await footer.locator('a').evaluateAll((links) => links.map((link) => ({
      href: link.getAttribute('href'),
      label: (link.textContent || '').replace(/\s+/gu, ' ').trim(),
    }))),
    [
      { href: '/stats', label: expected.footerLabels[0] },
      { href: '/legal', label: expected.footerLabels[1] },
      { href: '/privacy', label: expected.footerLabels[2] },
      { href: '/imprint', label: expected.footerLabels[3] },
    ],
    `${language}: the footer contains only the four agreed information and legal targets`,
  )

  await assertPanelLayout(page, language, viewport)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/sessionSetupCompletionUi.html',
  { plugins: [tailwindcss()] },
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
  const baseUrl = `${server.baseUrl}/scripts/fixtures/sessionSetupCompletionUi.html`

  for (const language of ['de', 'en'] as const) {
    for (const viewport of [
      { height: 900, label: 'mobile', width: 375 },
      { height: 1_000, label: 'desktop', width: 1_280 },
    ]) {
      const context = await browser.newContext({
        locale: language === 'de' ? 'de-DE' : 'en-US',
        viewport: { height: viewport.height, width: viewport.width },
      })
      await context.addInitScript((selectedLanguage) => {
        localStorage.setItem('skillpilot_lang', selectedLanguage)
      }, language)
      const page = await context.newPage()
      page.setDefaultTimeout(10_000)
      await page.goto(baseUrl)
      await page.addStyleTag({ url: `${server.baseUrl}/src/index.css` })
      await page.addStyleTag({
        content: '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }',
      })
      await assertLandingContract(page, language, viewport.label)
      await context.close()
    }

    const termsContext = await browser.newContext({
      locale: language === 'de' ? 'de-DE' : 'en-US',
    })
    await termsContext.addInitScript((selectedLanguage) => {
      localStorage.setItem('skillpilot_lang', selectedLanguage)
    }, language)
    const termsPage = await termsContext.newPage()
    termsPage.setDefaultTimeout(10_000)

    for (const { actionTestId, role } of callbackActions) {
      await termsPage.goto(baseUrl)
      const initialUrl = termsPage.url()
      await termsPage.getByTestId(actionTestId).click()
      const termsCheckbox = termsPage.locator('form input[type="checkbox"]')
      await termsCheckbox.waitFor()
      assert.deepEqual(
        await termsPage.evaluate(() => (
          (window as Window & { __sessionSetupRoleProbe?: LandingRole[] })
            .__sessionSetupRoleProbe ?? []
        )),
        [role],
        `${language}: ${actionTestId} selects only the intended ${role} handler`,
      )
      assert.equal(
        termsPage.url(),
        initialUrl,
        `${language}: ${actionTestId} enters setup without a route detour`,
      )
      assert.equal(
        await termsPage.getByTestId('public-landing-panels').count(),
        0,
        `${language}: ${actionTestId} leaves the landing panels for the setup gate`,
      )
      assert.equal(
        await termsCheckbox.count(),
        1,
        `${language}: ${actionTestId} reaches the shared Terms gate before role setup`,
      )
    }
    await termsContext.close()
  }

  console.log('Public landing contract UI tests passed')
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}
