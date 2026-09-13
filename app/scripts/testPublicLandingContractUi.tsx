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
  imageCaption: string
  sceneLabels: [string, string]
  landingPillLabels: string[]
  overviewTitle: string
  panelHeadingLabels: string[]
  removedHeroLine: string
}

const expectedByLanguage: Record<Language, LanguageExpectation> = {
  de: {
    accessNotice: 'SkillPilot ist kostenlos. Die Lern-Beta läuft mit dem kostenpflichtigen Claude Pro – im Browser und in der Claude-App, auch mit Voice-Mode. ChatGPT folgt nach Stabilisierung, gezielter Prüfung und Veröffentlichung.',
    accessSummary: 'Jetzt mit Claude lernen – auch in der App und mit Voice-Mode. ChatGPT ist noch nicht verfügbar.',
    footerLabels: ['Statistiken', 'Nutzungsbedingungen', 'Datenschutz', 'Impressum'],
    imageCaption: 'KI-generiertes Symbolbild',
    sceneLabels: ['Mit Stift & Papier', 'Im Gespräch'],
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
      'Dein Lernen. Dein Tempo.',
      'SkillPilot im Überblick',
      'Kurse planen',
      'Curricula & Lernziele',
    ],
    removedHeroLine: 'So startest du in 5 Minuten',
  },
  en: {
    accessNotice: 'SkillPilot is free. The learning beta runs with the paid Claude Pro plan – in your browser and the Claude app, including voice mode. ChatGPT will follow after stabilization, focused testing and publication.',
    accessSummary: 'Learn with Claude now – including the app and voice mode. ChatGPT is not available yet.',
    footerLabels: ['Statistics', 'Terms of Use', 'Privacy', 'Imprint'],
    imageCaption: 'AI-generated illustration',
    sceneLabels: ['With pen & paper', 'In conversation'],
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
      'Your learning. Your pace.',
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
  iconColor: string
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
    const icon = element.querySelector<SVGElement>('svg[aria-hidden="true"]')
    const colorValues = [
      actionStyle.backgroundColor,
      actionStyle.borderTopColor,
      actionStyle.color,
      icon ? getComputedStyle(icon).color : actionStyle.color,
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
      iconColor: srgbValues[3]!,
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

const relativeLuminance = (value: string) => {
  const channels = parseRgb(value).map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!
}

const contrastRatio = (foreground: string, background: string) => {
  const values = [relativeLuminance(foreground), relativeLuminance(background)]
    .sort((left, right) => right - left)
  return (values[0]! + 0.05) / (values[1]! + 0.05)
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
      panelTestId === 'public-landing-panel-learning' ? 0 : 1,
      `${language} ${viewport}: the hero title is unadorned and secondary headings keep one decorative icon`,
    )
    if (panelTestId === 'public-landing-panel-learning') continue
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
    if (testId === 'public-landing-action-learning') {
      assert(
        metrics.height >= 44,
        `${language} ${viewport}: the primary hero action has a touch-friendly height of at least 44px`,
      )
      assert(
        Number.parseFloat(metrics.fontSize) >= 14,
        `${language} ${viewport}: the primary hero action uses readable, prominent text`,
      )
      assert(
        metrics.iconHeight > 0 && metrics.iconWidth > 0,
        `${language} ${viewport}: the primary hero action keeps its visible decorative icon`,
      )
      continue
    }
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
  }

  const secondaryActionGroups = [
    {
      label: 'learning',
      testIds: ['public-landing-action-quickstart', 'public-landing-action-faq'],
    },
    {
      label: 'overview',
      testIds: [
        'skillpilot-overview-format-audio',
        'skillpilot-overview-format-video',
        'skillpilot-overview-format-whitepaper',
        'skillpilot-overview-disclosure-toggle',
      ],
    },
    {
      label: 'teaching',
      testIds: ['public-landing-action-course-planning'],
    },
    {
      label: 'curricula',
      testIds: [
        'public-landing-action-explorer',
        'public-landing-action-goal-book',
        'public-landing-action-curriculum-champions',
      ],
    },
  ] as const
  const restingPalettes: Array<Pick<PillVisualMetrics, 'backgroundColor' | 'borderColor' | 'color'>> = []
  const restingIconColors: string[] = []
  for (const group of secondaryActionGroups) {
    const groupMetrics = await Promise.all(
      group.testIds.map((testId) => readPillVisualMetrics(page.getByTestId(testId))),
    )
    const restingPalette = {
      backgroundColor: groupMetrics[0]!.backgroundColor,
      borderColor: groupMetrics[0]!.borderColor,
      color: groupMetrics[0]!.color,
    }
    restingPalettes.push(restingPalette)
    restingIconColors.push(groupMetrics[0]!.iconColor)
    for (const metrics of groupMetrics) {
      assert.deepEqual(
        {
          backgroundColor: metrics.backgroundColor,
          borderColor: metrics.borderColor,
          color: metrics.color,
        },
        restingPalette,
        `${language} ${viewport}: ${group.label} actions share one calm resting treatment`,
      )
      assert(
        contrastRatio(metrics.color, metrics.backgroundColor) >= 4.5,
        `${language} ${viewport}: ${group.label} action text keeps AA contrast`,
      )
      assert.equal(
        metrics.iconColor,
        groupMetrics[0]!.iconColor,
        `${language} ${viewport}: ${group.label} actions share their quiet icon accent`,
      )
    }
  }
  assert.equal(
    new Set(restingPalettes.map((palette) => JSON.stringify(palette))).size,
    1,
    `${language} ${viewport}: secondary actions stay neutral until interaction`,
  )
  assert.equal(
    new Set(restingIconColors).size,
    secondaryActionGroups.length,
    `${language} ${viewport}: panel identity remains visible through distinct icon accents`,
  )

  const hoverPalettes: Array<Pick<PillVisualMetrics, 'backgroundColor' | 'borderColor' | 'color'>> = []
  for (const [index, group] of secondaryActionGroups.entries()) {
    await page.mouse.move(1, 1)
    const action = page.getByTestId(group.testIds[0])
    await action.hover()
    const hovered = await readPillVisualMetrics(action)
    const resting = restingPalettes[index]!
    assert.notDeepEqual(
      {
        backgroundColor: hovered.backgroundColor,
        borderColor: hovered.borderColor,
        color: hovered.color,
      },
      resting,
      `${language} ${viewport}: ${group.label} action reveals its accent on hover`,
    )
    assert(
      contrastRatio(hovered.color, hovered.backgroundColor) >= 4.5,
      `${language} ${viewport}: ${group.label} hover action text keeps AA contrast`,
    )
    hoverPalettes.push({
      backgroundColor: hovered.backgroundColor,
      borderColor: hovered.borderColor,
      color: hovered.color,
    })
  }
  assert.equal(
    new Set(hoverPalettes.map((palette) => JSON.stringify(palette))).size,
    secondaryActionGroups.length,
    `${language} ${viewport}: every audience panel reveals its own action accent on hover`,
  )
  await page.mouse.move(1, 1)

  const primaryMetrics = await readPillVisualMetrics(
    page.getByTestId('public-landing-action-learning'),
  )
  const learningSecondaryMetrics = await readPillVisualMetrics(
    page.getByTestId('public-landing-action-quickstart'),
  )
  assert.notEqual(
    primaryMetrics.backgroundColor,
    learningSecondaryMetrics.backgroundColor,
    `${language} ${viewport}: the primary learning action stands out against secondary pills`,
  )
  assert.notEqual(
    primaryMetrics.borderColor,
    learningSecondaryMetrics.borderColor,
    `${language} ${viewport}: the primary learning action has its own accent border`,
  )
  assert.notEqual(
    primaryMetrics.color,
    learningSecondaryMetrics.color,
    `${language} ${viewport}: the primary learning action has contrasting foreground text`,
  )
  assert(
    contrastRatio(primaryMetrics.color, primaryMetrics.backgroundColor) >= 4.5,
    `${language} ${viewport}: the primary learning action keeps AA text contrast`,
  )
  const primaryAction = page.getByTestId('public-landing-action-learning')
  await primaryAction.hover()
  const hoveredPrimaryMetrics = await readPillVisualMetrics(primaryAction)
  assert.notEqual(
    hoveredPrimaryMetrics.backgroundColor,
    primaryMetrics.backgroundColor,
    `${language} ${viewport}: the primary action visibly reacts on hover`,
  )
  assert(
    contrastRatio(hoveredPrimaryMetrics.color, hoveredPrimaryMetrics.backgroundColor) >= 4.5,
    `${language} ${viewport}: the primary action keeps AA text contrast on hover`,
  )
  await page.mouse.move(1, 1)
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
    if (panelTestId === 'public-landing-panel-learning') {
      const background = await panel.evaluate((element) => getComputedStyle(element).backgroundColor)
      assert(
        contrastRatio(hover.headingColor, background) >= 3,
        `${language} ${viewport}: the fresh green hero heading keeps AA large-text contrast`,
      )
    }
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

  const desktop = await page.evaluate(() => window.matchMedia('(min-width: 1024px)').matches)
  if (desktop) {
    const [hero, ...secondaryPanels] = bounds
    assert(
      secondaryPanels.every((panel) => panel.top >= hero!.bottom - 1),
      `${language} ${viewport}: secondary panels begin below the full-width learning hero`,
    )
    assert(
      secondaryPanels.every((panel, index) => (
        Math.abs(panel.top - secondaryPanels[0]!.top) <= 1
        && Math.abs((panel.right - panel.left)
          - (secondaryPanels[0]!.right - secondaryPanels[0]!.left)) <= 1
        && (index === 0 || panel.left >= secondaryPanels[index - 1]!.right)
      )),
      `${language} ${viewport}: three equal-width secondary panels form one ordered desktop row`,
    )
    assert(
      Math.abs(hero!.left - secondaryPanels[0]!.left) <= 1
        && Math.abs(hero!.right - secondaryPanels.at(-1)!.right) <= 1,
      `${language} ${viewport}: the hero spans the complete secondary panel row`,
    )
  } else {
    assert(
      bounds.every((bound, index) => (
        index === 0
        || (
          bound.top > bounds[index - 1]!.top
          && bound.top >= bounds[index - 1]!.bottom - 1
        )
      )),
      `${language} ${viewport}: the hero and secondary panels form an ordered vertical sequence`,
    )
    assert(
      bounds.every((bound) => (
        Math.abs(bound.left - bounds[0]!.left) <= 1
        && Math.abs(bound.right - bounds[0]!.right) <= 1
      )),
      `${language} ${viewport}: stacked panels share one aligned width`,
    )
  }
  await assertNoHorizontalOverflow(
    page,
    `${language} ${viewport}: the landing page has no horizontal overflow`,
  )
}

const assertSceneSwitcher = async (
  page: Page,
  language: Language,
  viewport: string,
  voiceRequests: string[],
) => {
  const label = `${language} ${viewport}`
  const writing = page.getByTestId('public-landing-scene-writing')
  const voice = page.getByTestId('public-landing-scene-voice')
  const controls = page.getByTestId('public-landing-scene-controls')
  const visual = page.locator('.public-landing-hero-visual')
  const assertScene = async (scene: 'writing' | 'voice') => {
    await page.waitForFunction((scene) => (
      document.querySelector('.public-landing-hero-visual')?.getAttribute('data-scene') === scene
    ), scene)
    assert.equal(await writing.getAttribute('aria-pressed'), String(scene === 'writing'))
    assert.equal(await voice.getAttribute('aria-pressed'), String(scene === 'voice'))
    for (const [testId, active] of [
      ['public-landing-hero-image', scene === 'writing'],
      ['public-landing-voice-image', scene === 'voice'],
    ] as const) {
      const image = page.getByTestId(testId)
      if (await image.count() === 0) {
        assert(!active, `${label}: the active scene image exists`)
        continue
      }
      assert.equal(await image.getAttribute('data-active'), String(active))
      assert.equal(
        await image.evaluate((element) => Number(getComputedStyle(element).opacity)),
        active ? 1 : 0,
        `${label}: pressed controls identify the actual visible illustration`,
      )
    }
  }
  const layout = () => page.evaluate(() => (
    [
      '.public-landing-hero-visual',
      '.public-landing-hero-title',
      '[data-testid="public-landing-action-learning"]',
    ].map((selector) => {
      const bounds = document.querySelector(selector)!.getBoundingClientRect()
      return [bounds.left + window.scrollX, bounds.top + window.scrollY, bounds.width, bounds.height]
    })
  ))
  const assertStableLayout = async (baseline: number[][]) => {
    const current = await layout()
    assert(
      current.every((bounds, index) => bounds.every((value, dimension) => (
        Math.abs(value - baseline[index]![dimension]!) <= 1
      ))),
      `${label}: changing the illustration never shifts the image frame, headline or primary action`,
    )
  }

  assert.equal(await controls.getAttribute('role'), 'group')
  assert((await controls.getAttribute('aria-label'))?.trim(), `${label}: scene controls have an accessible group name`)
  assert.deepEqual(
    await controls.locator('button').allTextContents().then((values) => values.map(normalizeText)),
    expectedByLanguage[language].sceneLabels,
    `${label}: both learning situations have explicit localized labels`,
  )
  for (const button of [writing, voice]) {
    assert.equal(await button.getAttribute('type'), 'button')
    assert((await button.boundingBox())!.height >= 44, `${label}: both scene selectors have touch-friendly targets`)
  }
  await assertScene('writing')
  assert.equal(await page.getByTestId('public-landing-voice-image').count(), 0)
  assert.equal(voiceRequests.length, 0, `${label}: the second image is not requested before selection`)
  await page.clock.install()
  await page.clock.fastForward(60_000)
  await assertScene('writing')
  assert.equal(voiceRequests.length, 0, `${label}: waiting does not rotate or preload another scene`)
  const baseline = await layout()

  let releaseVoiceResponse!: () => void
  const voiceResponseGate = new Promise<void>((resolve) => { releaseVoiceResponse = resolve })
  const voicePattern = '**/images/skillpilot-voice-moment.png'
  await page.route(voicePattern, async (route) => {
    await voiceResponseGate
    await route.continue()
  })
  try {
    const request = page.waitForRequest((request) => request.url().endsWith('/images/skillpilot-voice-moment.png'))
    await voice.click()
    await request
    await assertScene('writing')
    assert.equal(await voice.getAttribute('aria-busy'), 'true')
    await assertStableLayout(baseline)
  } finally {
    releaseVoiceResponse()
  }
  await assertScene('voice')
  const voiceImage = page.getByTestId('public-landing-voice-image')
  assert.deepEqual(
    await voiceImage.evaluate(async (element) => {
      const image = element as HTMLImageElement
      await image.decode()
      return {
        alt: image.alt,
        complete: image.complete,
        height: image.naturalHeight,
        source: image.getAttribute('src'),
        width: image.naturalWidth,
      }
    }),
    {
      alt: '', complete: true, height: 941,
      source: '/images/skillpilot-voice-moment.png', width: 1672,
    },
    `${label}: the original voice illustration loads and remains decorative to screen readers`,
  )
  assert(
    ['contain', 'cover'].includes(await voiceImage.evaluate((element) => getComputedStyle(element).objectFit)),
    `${label}: the responsive voice illustration preserves its proportions`,
  )
  assert.equal(
    await voiceImage.evaluate((element) => getComputedStyle(element).objectPosition),
    '100% 50%',
    `${label}: the voice illustration preserves the right edge of the original`,
  )
  const voiceEdges = await voiceImage.evaluate((element) => {
    const image = element.getBoundingClientRect()
    const frame = element.parentElement!.getBoundingClientRect()
    return { left: image.left - frame.left, right: image.right - frame.right }
  })
  assert(Math.abs(voiceEdges.left) <= 1 && Math.abs(voiceEdges.right) <= 1,
    `${label}: the voice illustration fills the frame without an inset image boundary`)
  assert.equal(voiceRequests.length, 1, `${label}: first selection loads the second original once`)
  assert.equal(await page.locator('.public-landing-image-caption').count(), 1)
  assert(await page.locator('.public-landing-image-caption').isVisible())
  await assertStableLayout(baseline)

  await voice.press('ArrowLeft')
  await assertScene('writing')
  assert(await writing.evaluate((element) => element === document.activeElement))
  await writing.press('ArrowRight')
  await assertScene('voice')
  assert(await voice.evaluate((element) => element === document.activeElement))
  await writing.focus()
  await writing.press('Space')
  await assertScene('writing')
  await voice.focus()
  await voice.press('Enter')
  await assertScene('voice')
  await writing.click()
  await assertScene('writing')

  const pointer = async (endX: number, endY: number, cancel = false, isPrimary = true) => {
    const start = { pointerId: 41, pointerType: 'touch', isPrimary, clientX: 180, clientY: 100 }
    await visual.dispatchEvent('pointerdown', start)
    if (cancel) await visual.dispatchEvent('pointercancel', start)
    await visual.dispatchEvent('pointerup', { ...start, clientX: endX, clientY: endY })
  }
  assert(
    (await visual.evaluate((element) => getComputedStyle(element).touchAction)).includes('pan-y'),
    `${label}: the image surface permits ordinary vertical touch scrolling`,
  )
  await pointer(65, 110)
  await assertScene('voice')
  await pointer(290, 100)
  await assertScene('writing')
  await pointer(190, 240)
  await assertScene('writing')
  await pointer(80, 230)
  await assertScene('writing')
  await pointer(65, 110, true)
  await assertScene('writing')
  await pointer(65, 110, false, false)
  await assertScene('writing')
  await assertStableLayout(baseline)
  assert.equal(voiceRequests.length, 1, `${label}: switching among loaded scenes does not reload the image`)
  await page.unroute(voicePattern)
}

const assertLandingContract = async (page: Page, language: Language, viewport: string, voiceRequests: string[]) => {
  const expected = expectedByLanguage[language]
  const landing = page.getByTestId('public-landing-panels')
  await landing.waitFor()
  await page.evaluate(() => document.fonts.ready)
  const titleTypography = await landing.locator('.public-landing-hero-title').evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      fontFamily: style.fontFamily,
      fontLoaded: document.fonts.check('700 38px "Caveat"'),
      fontSize: parseFloat(style.fontSize),
    }
  })
  assert(titleTypography.fontFamily.includes('Caveat') && titleTypography.fontLoaded,
    `${language} ${viewport}: the locally hosted handwritten title font loads`)
  assert(titleTypography.fontSize >= 24,
    `${language} ${viewport}: the handwritten hero heading remains large, readable text`)

  const heroImage = page.getByTestId('public-landing-hero-image')
  assert.equal(await heroImage.count(), 1, `${language} ${viewport}: one homepage image is present`)
  await heroImage.evaluate(async (element) => {
    if (!(element instanceof HTMLImageElement)) throw new Error('Hero visual must be an image')
    await element.decode()
  })
  assert.deepEqual(
    await heroImage.evaluate((element) => {
      const image = element as HTMLImageElement
      return {
        alt: image.getAttribute('alt'),
        complete: image.complete,
        height: image.naturalHeight,
        source: image.getAttribute('src'),
        width: image.naturalWidth,
      }
    }),
    {
      alt: '',
      complete: true,
      height: 1086,
      source: '/images/skillpilot-learning-moment.png',
      width: 1448,
    },
    `${language} ${viewport}: the original user-supplied image loads and stays decorative to screen readers`,
  )
  const imageCaption = landing.locator('.public-landing-image-caption')
  assert.equal(await imageCaption.count(), 1, `${language} ${viewport}: one contextual image disclosure is present`)
  assert.equal(normalizeText(await imageCaption.innerText()), expected.imageCaption)
  assert(await imageCaption.isVisible(), `${language} ${viewport}: the localized AI image notice is visible`)
  const imageLayout = await heroImage.evaluate((element) => {
    const image = element.getBoundingClientRect()
    const hero = element.closest('article')!
    const visual = hero.querySelector('.public-landing-hero-visual')!
    const frame = visual.getBoundingClientRect()
    const title = hero.querySelector('h2')!.getBoundingClientRect()
    const caption = hero.querySelector('.public-landing-image-caption')!.getBoundingClientRect()
    return {
      captionInsideImage: caption.top >= image.top && caption.bottom <= image.bottom
        && caption.left >= image.left && caption.right <= image.right,
      height: image.height,
      imageAboveTitle: frame.bottom <= title.top,
      objectFit: getComputedStyle(element).objectFit,
      position: getComputedStyle(visual).position,
      width: image.width,
    }
  })
  assert(imageLayout.width > 0 && imageLayout.height > 0, `${language} ${viewport}: the image has visible dimensions`)
  assert.equal(imageLayout.objectFit, 'cover', `${language} ${viewport}: responsive image placement never stretches the photo`)
  assert(imageLayout.captionInsideImage, `${language} ${viewport}: the AI disclosure stays directly on the image`)
  const desktop = await page.evaluate(() => window.matchMedia('(min-width: 1024px)').matches)
  if (desktop) {
    assert.equal(
      imageLayout.position,
      'absolute',
      `${language} ${viewport}: the photo is positioned as the desktop hero background`,
    )
  } else {
    assert(
      !['absolute', 'fixed'].includes(imageLayout.position),
      `${language} ${viewport}: the photo occupies its own mobile image region in document flow`,
    )
    assert(
      Math.abs(imageLayout.width / imageLayout.height - 1448 / 1086) <= 0.01,
      `${language} ${viewport}: phone and tablet screens preserve the complete original writing photo aspect ratio`,
    )
    assert(imageLayout.imageAboveTitle, `${language} ${viewport}: mobile title and actions are below the image`)
  }
  await assertSceneSwitcher(page, language, viewport, voiceRequests)

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
  const viewportFailures: string[] = []

  for (const language of ['de', 'en'] as const) {
    for (const viewport of [
      { height: 900, label: 'small-mobile', width: 320 },
      { height: 900, label: 'mobile', width: 375 },
      { height: 1_000, label: 'tablet', width: 768 },
      { height: 1_000, label: 'desktop', width: 1_280 },
    ].flatMap((viewport) => (['light', 'dark'] as const).map((theme) => ({
      ...viewport,
      label: `${viewport.label}-${theme}`,
      theme,
    })))) {
      const context = await browser.newContext({
        locale: language === 'de' ? 'de-DE' : 'en-US',
        viewport: { height: viewport.height, width: viewport.width },
      })
      await context.addInitScript(({ language, theme }) => {
        localStorage.setItem('skillpilot_lang', language)
        localStorage.setItem('skillpilot_theme', theme)
      }, { language, theme: viewport.theme })
      const page = await context.newPage()
      const voiceRequests: string[] = []
      page.on('request', (request) => {
        if (request.url().endsWith('/images/skillpilot-voice-moment.png')) voiceRequests.push(request.url())
      })
      page.setDefaultTimeout(10_000)
      await page.goto(baseUrl)
      await page.addStyleTag({ url: `${server.baseUrl}/src/index.css` })
      await page.addStyleTag({
        content: '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }',
      })
      try {
        assert(
          await page.locator('html').evaluate((element, theme) => element.classList.contains(theme), viewport.theme),
          `${language} ${viewport.label}: the requested color theme is active`,
        )
        await assertLandingContract(page, language, viewport.label, voiceRequests)
      } catch (error) {
        viewportFailures.push(`${language} ${viewport.label}: ${String(error)}`)
      } finally {
        await context.close()
      }
    }

    const motionContext = await browser.newContext({
      locale: language === 'de' ? 'de-DE' : 'en-US',
      reducedMotion: 'no-preference',
      viewport: { height: 900, width: 375 },
    })
    await motionContext.addInitScript((selectedLanguage) => {
      localStorage.setItem('skillpilot_lang', selectedLanguage)
    }, language)
    const motionPage = await motionContext.newPage()
    motionPage.setDefaultTimeout(10_000)
    try {
      await motionPage.goto(baseUrl)
      await motionPage.addStyleTag({ url: `${server.baseUrl}/src/index.css` })
      const writingImage = motionPage.getByTestId('public-landing-hero-image')
      assert(
        await writingImage.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration) > 0),
        `${language}: normal motion uses a real CSS image crossfade`,
      )
      await motionPage.emulateMedia({ reducedMotion: 'reduce' })
      assert.equal(
        await writingImage.evaluate((element) => getComputedStyle(element).transitionDuration),
        '0s',
        `${language}: the real reduced-motion stylesheet disables the image crossfade`,
      )

      let voiceAttempts = 0
      await motionPage.route('**/images/skillpilot-voice-moment.png', async (route) => {
        voiceAttempts += 1
        if (voiceAttempts === 1) await route.abort('failed')
        else await route.continue()
      })
      const voiceButton = motionPage.getByTestId('public-landing-scene-voice')
      await voiceButton.click()
      await motionPage.waitForFunction(() => Boolean(
        document.querySelector('[data-testid="public-landing-scene-voice"]')?.getAttribute('title'),
      ))
      assert.equal(await voiceButton.getAttribute('aria-pressed'), 'false')
      assert.equal(await voiceButton.getAttribute('aria-busy'), 'false')
      assert.equal(
        await motionPage.locator('.public-landing-hero-visual').getAttribute('data-scene'),
        'writing',
        `${language}: a failed image request preserves the working illustration`,
      )
      assert(
        normalizeText(await motionPage.getByTestId('public-landing-panel-learning').getByRole('status').textContent()),
        `${language}: an image failure is announced accessibly`,
      )
      await voiceButton.click()
      await motionPage.waitForFunction(() => (
        document.querySelector('.public-landing-hero-visual')?.getAttribute('data-scene') === 'voice'
      ))
      assert.equal(voiceAttempts, 2, `${language}: the learner can retry an image failure without reloading the page`)
      for (const [testId, opacity] of [
        ['public-landing-hero-image', '0'],
        ['public-landing-voice-image', '1'],
      ] as const) {
        assert.deepEqual(
          await motionPage.getByTestId(testId).evaluate((element) => ({
            opacity: getComputedStyle(element).opacity,
            transitionDuration: getComputedStyle(element).transitionDuration,
          })),
          { opacity, transitionDuration: '0s' },
          `${language}: reduced-motion selection changes the visible image without an animated transition`,
        )
      }
    } catch (error) {
      viewportFailures.push(`${language} reduced-motion and image recovery: ${String(error)}`)
    } finally {
      await motionContext.close()
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
        await termsPage.getByTestId('public-landing-hero-image').count(),
        0,
        `${language}: ${actionTestId} removes the decorative homepage image from setup forms`,
      )
      assert.equal(await termsPage.getByTestId('public-landing-voice-image').count(), 0)
      assert.equal(await termsPage.getByTestId('public-landing-scene-controls').count(), 0)
      assert.equal(
        await termsCheckbox.count(),
        1,
        `${language}: ${actionTestId} reaches the shared Terms gate before role setup`,
      )
    }
    await termsContext.close()
  }

  assert.deepEqual(viewportFailures, [], 'all localized hero layouts must satisfy the landing contract')
  console.log('Public landing contract UI tests passed')
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}
