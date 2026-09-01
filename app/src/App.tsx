import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'

import { SessionSetup } from './components/SessionSetup'
import { ToastHost } from './components/ToastHost'
import { useAppCore } from './hooks/useAppCore'
import { useLandscapes } from './hooks/useLandscapes'
import { consumeQueuedToast, useToast } from './hooks/useToast'
import { useTranslation } from './hooks/useTranslation'
import { useLanguage } from './contexts/LanguageContext'
import { sanitizeSkillpilotId } from './utils/skillpilotId'
import { getSkillPilotOverviewCopy } from './utils/skillPilotOverviewCopy'
import { CANONICAL_GYMNASIUM_ROOT_ID, isRepositoryGymnasiumFramework } from './utils/curriculumDisplay'
import {
  isRootRoute,
  shouldRenderSessionSetup,
  shouldRunApplicationCore,
} from './utils/rootRoutePolicy'
import {
  getLearnerPathToken,
  getStoredLandscapeIdForRole,
  normalizeLearnerLandscapeId,
} from './utils/learnerProfile'

type Role = 'learner' | 'trainer' | 'explorer'

const IS_PACKAGE_CONSUMER_BUILD = import.meta.env.MODE === 'package-consumer'
const REPOSITORY_AUTHORING_PATHS = [
  '/users',
  '/workbench',
  '/flashcard-editor',
  '/graph-editor',
  '/canonical-cluster-editor',
  '/composition-view-editor',
  '/semantic-atomicity-review',
  '/goal-visualization-qa',
  '/quality-dashboard',
  '/curriculum-mapping-workbench',
]
const PUBLIC_PATHS = new Set([
  '/curricula',
  '/faq',
  '/faq/coach-setup',
  '/plugins',
  '/privacy',
  '/imprint',
  '/legal',
  '/whitepaper',
  '/quickstart',
  '/stats',
  '/successes',
  '/start',
  ...(IS_PACKAGE_CONSUMER_BUILD ? [] : ['/lernzielbuch', '/lernziel-feedback', ...REPOSITORY_AUTHORING_PATHS]),
])
const GOAL_VIEWS = new Set(['learner', 'trainer', 'explorer'])
const MAX_DESCRIPTION_LENGTH = 160
const SENSITIVE_SKILLPILOT_URL_PARAMS = ['skillpilotId', 'learnerId', 'id'] as const

const ExplorerView = lazy(() => import('./views/ExplorerView').then((module) => ({ default: module.ExplorerView })))
const LearnerView = lazy(() => import('./views/LearnerView').then((module) => ({ default: module.LearnerView })))
const TrainerView = lazy(() => import('./views/TrainerView').then((module) => ({ default: module.TrainerView })))
const LegalView = lazy(() => import('./views/LegalView').then((module) => ({ default: module.LegalView })))
const FaqView = lazy(() => import('./views/FaqView').then((module) => ({ default: module.FaqView })))
const CoachProviderMatrixView = lazy(() => import('./views/CoachProviderMatrixView').then((module) => ({ default: module.CoachProviderMatrixView })))
const PluginCatalogView = lazy(() => import('./views/PluginCatalogView').then((module) => ({ default: module.PluginCatalogView })))
const PrivacyView = lazy(() => import('./views/PrivacyView').then((module) => ({ default: module.PrivacyView })))
const ImprintView = lazy(() => import('./views/ImprintView').then((module) => ({ default: module.ImprintView })))
const CurriculaView = lazy(() => import('./views/CurriculaView').then((module) => ({ default: module.CurriculaView })))
const WhitepaperView = lazy(() => import('./views/WhitepaperView').then((module) => ({ default: module.WhitepaperView })))
const StoryView = lazy(() => import('./views/StoryView').then((module) => ({ default: module.StoryView })))
const UsersView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/UsersView').then((module) => ({ default: module.UsersView })))
const StatsView = lazy(() => import('./views/StatsView').then((module) => ({ default: module.StatsView })))
const SuccessView = lazy(() => import('./views/SuccessView').then((module) => ({ default: module.SuccessView })))
const GoalBookView = IS_PACKAGE_CONSUMER_BUILD
  ? () => null
  : lazy(() => import('./views/GoalBookView').then((module) => ({ default: module.GoalBookView })))
const GoalBookFeedbackPilotView = IS_PACKAGE_CONSUMER_BUILD
  ? () => null
  : lazy(() => import('./views/GoalBookFeedbackPilotView').then((module) => ({ default: module.GoalBookFeedbackPilotView })))
const Abi26MatheStartView = IS_PACKAGE_CONSUMER_BUILD
  ? () => null
  : lazy(() => import('./views/Abi26MatheStartView').then((module) => ({ default: module.Abi26MatheStartView })))
const WorkbenchView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/WorkbenchView').then((module) => ({ default: module.WorkbenchView })))
const FlashcardEditorView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/FlashcardEditorView').then((module) => ({ default: module.FlashcardEditorView })))
const GraphEditorView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/GraphEditorView').then((module) => ({ default: module.GraphEditorView })))
const CanonicalClusterEditorView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/CanonicalClusterEditorView').then((module) => ({ default: module.CanonicalClusterEditorView })))
const CompositionViewEditorView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/CompositionViewEditorView').then((module) => ({ default: module.CompositionViewEditorView })))
const SemanticAtomicityReviewView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/SemanticAtomicityReviewView').then((module) => ({ default: module.SemanticAtomicityReviewView })))
const GoalVisualizationQaView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/GoalVisualizationQaView').then((module) => ({ default: module.GoalVisualizationQaView })))
const CurriculumQualityDashboardView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/CurriculumQualityDashboardView').then((module) => ({ default: module.CurriculumQualityDashboardView })))
const CurriculumMappingWorkbenchView = IS_PACKAGE_CONSUMER_BUILD ? () => null : lazy(() => import('./views/CurriculumMappingWorkbenchView').then((module) => ({ default: module.CurriculumMappingWorkbenchView })))

const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim()

const trimDescription = (text: string, maxLength = MAX_DESCRIPTION_LENGTH) => {
  const normalized = normalizeText(text)
  if (!normalized) return ''
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

const upsertMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
  const selector = `meta[${attrName}="${attrValue}"]`
  let element = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attrName, attrValue)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

const upsertLinkTag = (rel: string, href: string) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

const updateQuickstartAlternateLinks = (origin: string, enabled: boolean) => {
  document.head
    .querySelectorAll('link[data-skillpilot-quickstart-alternate]')
    .forEach((element) => element.remove())

  if (!enabled) return

  const alternates = [
    { hrefLang: 'de', href: `${origin}/quickstart/de` },
    { hrefLang: 'en', href: `${origin}/quickstart/en` },
    { hrefLang: 'x-default', href: `${origin}/quickstart/de` },
  ]

  for (const alternate of alternates) {
    const element = document.createElement('link')
    element.setAttribute('rel', 'alternate')
    element.setAttribute('hreflang', alternate.hrefLang)
    element.setAttribute('href', alternate.href)
    element.setAttribute('data-skillpilot-quickstart-alternate', '')
    document.head.appendChild(element)
  }
}

const stripSensitiveSkillpilotUrlParams = (search: string) => {
  const params = new URLSearchParams(search)
  let changed = false
  for (const key of SENSITIVE_SKILLPILOT_URL_PARAMS) {
    if (params.has(key)) {
      params.delete(key)
      changed = true
    }
  }
  return {
    changed,
    search: params.toString(),
  }
}

const RouteLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
    Ansicht laden ...
  </div>
)

const App: React.FC = () => {
  const { language } = useLanguage()
  const t = useTranslation()
  const [role, setRole] = useState<Role | null>(() => {
    return (localStorage.getItem('skillpilot_role') as Role) || null
  })
  const [skillpilotId, setSkillpilotId] = useState(() => {
    return sanitizeSkillpilotId(localStorage.getItem('skillpilot_id'))
  })
  const [hasSession, setHasSession] = useState(() => {
    const storedRole = localStorage.getItem('skillpilot_role')
    const storedId = sanitizeSkillpilotId(localStorage.getItem('skillpilot_id'))
    if (!storedRole) return false
    if (storedRole === 'learner') return !!storedId
    return true
  })
  // Track pending landscape selection to prevent SessionSetup re-mount during navigation
  const [pendingLandscapeId, setPendingLandscapeId] = useState<string | null>(null)
  const logoutInProgressRef = useRef(false)
  const [trainerLearnerId, setTrainerLearnerId] = useState('__ALL__')
  const [, setLearnerMeta] = useState<{ lastUpdated: string }>({
    lastUpdated: new Date().toISOString(),
  })
  const { toast, showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const sanitizedSkillpilotId = sanitizeSkillpilotId(skillpilotId)
  const hasActiveSession = hasSession && (role !== 'learner' || !!sanitizedSkillpilotId)
  // Use window.location as fallback for initial load after OAuth redirect (SPA cache issue)
  const actualPath = window.location.pathname
  const normalizedPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '')
  const normalizedActualPath = actualPath === '/' ? '/' : actualPath.replace(/\/+$/, '')
  const learnerPathToken = useMemo(
    () => getLearnerPathToken(location.pathname),
    [location.pathname],
  )
  const routeGoalToken = useMemo(() => {
    const match = /^\/(?:learner|trainer|explorer)\/([^/]+)\/?$/.exec(location.pathname)
    if (!match?.[1]) return ''
    try {
      return decodeURIComponent(match[1])
    } catch {
      return match[1]
    }
  }, [location.pathname])
  const isWhitepaperRoute = normalizedPath === '/whitepaper' || normalizedPath.startsWith('/whitepaper/') ||
    normalizedActualPath === '/whitepaper' || normalizedActualPath.startsWith('/whitepaper/')
  const isQuickstartRoute = normalizedPath === '/quickstart' || normalizedPath.startsWith('/quickstart/') ||
    normalizedActualPath === '/quickstart' || normalizedActualPath.startsWith('/quickstart/')
  const isStartRoute = normalizedPath === '/start' || normalizedPath.startsWith('/start/') ||
    normalizedActualPath === '/start' || normalizedActualPath.startsWith('/start/')

  // Allow public routes to render without session
  // Check both React Router location AND actual window.location for reliability after OAuth redirects
  const isPublicRoute =
    PUBLIC_PATHS.has(normalizedPath) ||
    PUBLIC_PATHS.has(normalizedActualPath) ||
    isWhitepaperRoute ||
    isQuickstartRoute ||
    isStartRoute
  const isSetupOnlyRoleRoute =
    normalizedPath === '/trainer' ||
    normalizedPath.startsWith('/trainer/')
  const isExplorerRoute =
    normalizedPath === '/explorer' ||
    normalizedPath.startsWith('/explorer/')

  const core = useAppCore({
    role: role || 'explorer',
    setLearnerMeta,
    skillpilotId: sanitizedSkillpilotId,
    enabled: shouldRunApplicationCore(normalizedPath),
  })
  const { currentLandscapeEntry, landscapeEntries } = core
  const selectedLandscapeId = core.selectedLandscapeId
  const canRenderAnonymousExplorer = isExplorerRoute && !!selectedLandscapeId
  const renderSessionSetup = shouldRenderSessionSetup({
    pathname: normalizedPath,
    hasActiveSession,
    canRenderAnonymousExplorer,
  })
  const setupClosureRootLandscapeId = core.runtimeCatalogState.mode === 'package'
    ? core.runtimeRootLandscapeId
    : (
        isRepositoryGymnasiumFramework(currentLandscapeEntry?.meta.frameworkId)
          ? CANONICAL_GYMNASIUM_ROOT_ID
          : undefined
      )
  const needsSetupLandscapeClosure = Boolean(
    setupClosureRootLandscapeId
    && core.selectedLandscapeId !== setupClosureRootLandscapeId,
  )
  const {
    landscapeEntries: canonicalGymnasiumSetupLandscapeEntries,
  } = useLandscapes(
    setupClosureRootLandscapeId,
    language,
    { enabled: needsSetupLandscapeClosure },
  )
  const setupRootLandscapeId = setupClosureRootLandscapeId ?? core.selectedLandscapeId

  useEffect(() => {
    const storedId = localStorage.getItem('skillpilot_id')
    const sanitizedStoredId = sanitizeSkillpilotId(storedId)
    if ((storedId ?? '') === sanitizedStoredId) return
    if (sanitizedStoredId) {
      localStorage.setItem('skillpilot_id', sanitizedStoredId)
    } else {
      localStorage.removeItem('skillpilot_id')
    }
  }, [])

  useEffect(() => {
    const queuedToast = consumeQueuedToast()
    if (!queuedToast) return
    showToast(queuedToast.kind, queuedToast.message)
  }, [showToast])

  useEffect(() => {
    const cleaned = stripSensitiveSkillpilotUrlParams(location.search)
    if (!cleaned.changed) return
    navigate(
      `${location.pathname}${cleaned.search ? `?${cleaned.search}` : ''}${location.hash}`,
      { replace: true },
    )
  }, [location.hash, location.pathname, location.search, navigate])

  const handleNotify = React.useCallback((kind: 'success' | 'error' | 'info', message: string) => {
    showToast(kind, message)
  }, [showToast])

  // Handle OAuth success redirect at App level
  // This is needed because after OAuth redirect, the SPA might be loaded from service worker cache
  // with the wrong initial route. We force navigation to ensure the URL and rendered component match.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth_success') && window.location.pathname.startsWith('/curricula')) {
      // Force a navigation to ensure React Router is in sync with the actual URL
      navigate('/curricula', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (normalizedPath === '/') {
      logoutInProgressRef.current = false
    }
  }, [normalizedPath])

  useEffect(() => {
    if (role !== 'learner') return
    if (!learnerPathToken) return

    const params = new URLSearchParams(location.search)
    const tokenIsCurrentLearner = !!sanitizedSkillpilotId && learnerPathToken === sanitizedSkillpilotId
    if (!tokenIsCurrentLearner) return

    const rawFallbackLandscapeId = params.get('l') || selectedLandscapeId || getStoredLandscapeIdForRole(role)
    const fallbackLandscapeId = normalizeLearnerLandscapeId(rawFallbackLandscapeId)
    if (fallbackLandscapeId && params.get('l') !== fallbackLandscapeId) {
      params.set('l', fallbackLandscapeId)
    }
    if (fallbackLandscapeId) {
      localStorage.setItem('skillpilot_learner_landscape', fallbackLandscapeId)
    }

    const nextSearch = params.toString()
    navigate(`/learner${nextSearch ? `?${nextSearch}` : ''}`, { replace: true })
  }, [
    learnerPathToken,
    location.search,
    navigate,
    role,
    sanitizedSkillpilotId,
    selectedLandscapeId,
  ])

  const availableLandscapes = useMemo(
    () => {
      const toSummary = (entry: (typeof landscapeEntries)[number]) => ({
        landscapeId: entry.meta.landscapeId,
        title: entry.meta.title,
        subject: entry.meta.subject,
        filters: entry.meta.filters,
        compatibilityOnly: entry.meta.compatibilityOnly,
      })

      const setupLandscapeEntries = needsSetupLandscapeClosure && canonicalGymnasiumSetupLandscapeEntries.length > 0
        ? canonicalGymnasiumSetupLandscapeEntries
        : landscapeEntries
      const setupGoalIndex = new Map(
        setupLandscapeEntries.flatMap((entry) => entry.goals.map((goal) => [goal.id, goal] as const)),
      )
      const currentEntry = needsSetupLandscapeClosure
        ? setupLandscapeEntries.find((entry) => entry.meta.landscapeId === setupClosureRootLandscapeId) ?? null
        : currentLandscapeEntry
      if (!currentEntry) {
        return setupLandscapeEntries.map(toSummary)
      }

      const summaries = [toSummary(currentEntry)]
      const seenLandscapeIds = new Set([currentEntry.meta.landscapeId])
      const entriesById = new Map(setupLandscapeEntries.map((entry) => [entry.meta.landscapeId, entry]))
      const rootGoal = currentEntry.goals.find((goal) => goal.tags?.includes('root')) ?? currentEntry.goals[0]

      for (const childId of rootGoal?.contains ?? []) {
        const normalizedChildId = childId.includes(':') ? childId.split(':', 2)[1] : childId
        const childGoal = setupGoalIndex.get(normalizedChildId)
        const childLandscapeId = childGoal?.landscapeId
        if (!childLandscapeId || seenLandscapeIds.has(childLandscapeId) || childLandscapeId === currentEntry.meta.landscapeId) {
          continue
        }

        const childEntry = entriesById.get(childLandscapeId)
        if (!childEntry) {
          continue
        }

        summaries.push(toSummary(childEntry))
        seenLandscapeIds.add(childLandscapeId)
      }

      return summaries
    },
    [
      canonicalGymnasiumSetupLandscapeEntries,
      currentLandscapeEntry,
      landscapeEntries,
      needsSetupLandscapeClosure,
      setupClosureRootLandscapeId,
    ],
  )

  useEffect(() => {
    if (!pendingLandscapeId) return
    if (core.selectedLandscapeId !== pendingLandscapeId) return
    if (normalizedPath === '/') return
    const timeoutId = window.setTimeout(() => {
      setPendingLandscapeId((current) => (current === core.selectedLandscapeId ? null : current))
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [core.selectedLandscapeId, normalizedPath, pendingLandscapeId])

  useEffect(() => {
    const rawPath = location.pathname || '/'
    const path = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '')
    const view = path.split('/')[1] || ''
    const isPublicPath = PUBLIC_PATHS.has(path) ||
      path === '/whitepaper' || path.startsWith('/whitepaper/') ||
      path === '/quickstart' || path.startsWith('/quickstart/') ||
      path === '/start' || path.startsWith('/start/')
    const isQuickstartPath = path === '/quickstart' || path.startsWith('/quickstart/')
    const isWhitepaperPath = path === '/whitepaper' || path.startsWith('/whitepaper/')
    const publicDocumentRouteLanguage = path.split('/')[2]?.toLowerCase()
    const metadataLanguage = (isQuickstartPath || isWhitepaperPath)
      && (publicDocumentRouteLanguage === 'de' || publicDocumentRouteLanguage === 'en')
      ? publicDocumentRouteLanguage
      : language
    const isGoalView = GOAL_VIEWS.has(view)
    const hasAccess = hasActiveSession || isPublicPath || path === '/'
    const baseTitle = 'SkillPilot'
    const defaultDescription =
      language === 'en'
        ? 'Your personal AI learning companion.'
        : 'Dein personalisierter Lern-Navigator.'

    const privacyDescription =
      language === 'en'
        ? 'SkillPilot privacy policy and data protection information.'
        : 'Datenschutz und Datenverarbeitung bei SkillPilot.'
    const imprintDescription =
      language === 'en'
        ? 'Legal imprint and contact information for SkillPilot.'
        : 'Impressum und Kontaktinformationen für SkillPilot.'
    const legalDescription =
      language === 'en'
        ? 'Terms of Use, legal notices, licensing, and AI transparency for SkillPilot.'
        : 'Nutzungsbedingungen, rechtliche Hinweise, Lizenz und KI-Transparenz für SkillPilot.'
    const faqDescription =
      language === 'en'
        ? 'Recommended devices, supported ChatGPT modes, and troubleshooting for SkillPilot Coach.'
        : 'Empfohlene Geräte, unterstützte ChatGPT-Modi und Problemlösungen für SkillPilot Coach.'
    const coachSetupDescription =
      language === 'en'
        ? 'Learner-focused comparison of SkillPilot access options, age limits, safe starting, and supported devices.'
        : 'Lernendengerechter Vergleich von SkillPilot-Zugängen, Altersgrenzen, sicherem Start und unterstützten Geräten.'
    const pluginCatalogDescription =
      language === 'en'
        ? 'Controlled direct download of the current SkillPilot Claude Coach beta plugin with version and integrity details.'
        : 'Kontrollierter Direkt-Download des aktuellen SkillPilot-Claude-Coach-Beta-Plugins mit Versions- und Integritätsangaben.'

    let title = baseTitle
    let description = defaultDescription

    if (isPublicPath) {
      if (path === '/curricula') {
        const curriculaTitle = t.startPage.cards.curricula?.title || 'Curricula'
        title = `${curriculaTitle} | ${baseTitle}`
        description = t.curriculaPage.subtitle || defaultDescription
      } else if (path === '/lernzielbuch') {
        title = `${language === 'en' ? 'Learning Goal Book' : 'Lernzielbuch'} | ${baseTitle}`
        description = language === 'en'
          ? 'Review the SkillPilot mathematics learning goals by chapter, dependency, and full canonical ID.'
          : 'SkillPilot-Lernziele für Mathematik nach Kapiteln, Abhängigkeiten und vollständiger kanonischer ID prüfen.'
      } else if (path === '/lernziel-feedback') {
        title = `${language === 'en' ? 'Learning-goal feedback' : 'Lernziel-Feedback'} | ${baseTitle}`
        description = language === 'en'
          ? 'Submit structured, version-bound criticism of a published SkillPilot learning goal for critical review.'
          : 'Strukturierte, versionsgebundene Kritik zu einem veröffentlichten SkillPilot-Lernziel zur kritischen Prüfung einreichen.'
      } else if (isWhitepaperPath) {
        const overview = getSkillPilotOverviewCopy(metadataLanguage)
        title = `${overview.title} | ${baseTitle}`
        description = overview.description
      } else if (isQuickstartPath) {
        title = metadataLanguage === 'en'
          ? `Start SkillPilot in 5 Steps | ${baseTitle}`
          : `SkillPilot in 5 Schritten starten | ${baseTitle}`
        description = metadataLanguage === 'en'
          ? 'Configure your learning context in SkillPilot and choose ChatGPT or Claude as your browser-based learning coach.'
          : 'Lernkontext in SkillPilot einrichten und ChatGPT oder Claude als Lerncoach im Browser wählen.'
      } else if (path === '/users') {
        const usersTitle = t.usersPage?.title || 'SkillPilot IDs'
        title = `${usersTitle} | ${baseTitle}`
        description = t.usersPage?.subtitle || defaultDescription
      } else if (path === '/stats') {
        title = `Statistics | ${baseTitle}`
        description = 'Explore the growth of our learning community.'
      } else if (path === '/successes') {
        title = `Successes | ${baseTitle}`
        description = 'Total number of mastered learning goals.'
      } else if (path === '/workbench') {
        title = `Workbench | ${baseTitle}`
        description = language === 'en'
          ? 'Central overview of local authoring and maintenance tools.'
          : 'Zentrale Übersicht lokaler Authoring- und Wartungstools.'
      } else if (path === '/flashcard-editor') {
        title = `Flashcard Editor | ${baseTitle}`
        description = language === 'en'
          ? 'Local flashcard deck editor with live front/back preview.'
          : 'Lokaler Flashcard-Deck-Editor mit Live-Vorschau für Vorder- und Rückseite.'
      } else if (path === '/graph-editor') {
        title = `Graph Editor | ${baseTitle}`
        description = language === 'en'
          ? 'Local graph editor to refactor requires relations to atomic goals.'
          : 'Lokaler Graph-Editor zum Umbau von requires-Relationen auf atomare Ziele.'
      } else if (path === '/canonical-cluster-editor') {
        title = `Canonical Cluster Editor | ${baseTitle}`
        description = language === 'en'
          ? 'Local editor for canonical clusters, contains structure, and child order.'
          : 'Lokaler Editor für kanonische Cluster, contains-Struktur und Kindreihenfolge.'
      } else if (path === '/composition-view-editor') {
        title = `Composition View Editor | ${baseTitle}`
        description = language === 'en'
          ? 'Local editor for scope-specific learner-facing composition views.'
          : 'Lokaler Editor für scope-spezifische learner-facing Composition Views.'
      } else if (path === '/semantic-atomicity-review') {
        title = `Semantic Atomicity Review | ${baseTitle}`
        description = language === 'en'
          ? 'Local editor for semantic atomicity review ledgers.'
          : 'Lokaler Editor für Semantic-Atomicity-Review-Ledger.'
      } else if (path === '/goal-visualization-qa') {
        title = `Goal Visualization QA | ${baseTitle}`
        description = language === 'en'
          ? 'Local subject-level review list for generated learning-goal images.'
          : 'Lokale fachbezogene Review-Liste für erzeugte Lernzielbilder.'
      } else if (path === '/quality-dashboard') {
        title = `Curriculum Quality | ${baseTitle}`
        description = language === 'en'
          ? 'Local dashboard for generated curriculum quality status snapshots.'
          : 'Lokales Dashboard für generierte Curriculum-Qualitätsstände.'
      } else if (path === '/curriculum-mapping-workbench') {
        title = `Curriculum Mapping | ${baseTitle}`
        description = language === 'en'
          ? 'Local two-pane audit view from curriculum source snapshots to SkillPilot trees.'
          : 'Lokale Zwei-Fenster-Auditsicht von Curriculum-Source-Snapshots zu SkillPilot-Trees.'
      } else if (path === '/start' || path.startsWith('/start/')) {
        title = `Abi 2026 Mathe Hessen | ${baseTitle}`
        description = language === 'en'
          ? 'Create your free SkillPilot ID and start directly in your Abitur cockpit.'
          : 'Kostenlose SkillPilot-ID erstellen und direkt im Abi-Cockpit starten.'
      } else if (path === '/privacy') {
        title = `${t.startPage.footer.privacy} | ${baseTitle}`
        description = privacyDescription
      } else if (path === '/faq/coach-setup') {
        title = `${language === 'en' ? 'Access options' : 'Zugang und Varianten'} | ${baseTitle}`
        description = coachSetupDescription
      } else if (path === '/plugins') {
        title = `${language === 'en' ? 'Plugin beta download' : 'Plugin-Beta-Download'} | ${baseTitle}`
        description = pluginCatalogDescription
      } else if (path === '/faq') {
        title = `${t.startPage.links.faq} | ${baseTitle}`
        description = faqDescription
      } else if (path === '/imprint') {
        title = `${t.startPage.footer.imprint} | ${baseTitle}`
        description = imprintDescription
      } else if (path === '/legal') {
        title = `${t.startPage.footer.legal} | ${baseTitle}`
        description = legalDescription
      } else {
        title = `${baseTitle} | ${t.startPage.subtitle}`
      }
    } else if (!hasActiveSession) {
      title = `${baseTitle} | ${t.startPage.subtitle}`
    } else if (isGoalView && core.currentGoal) {
      title = `${core.currentGoal.title} | ${baseTitle}`
      description = core.currentGoal.description || defaultDescription
    }

    const canonicalPath = !hasAccess
      ? '/'
      : isQuickstartPath
        ? `/quickstart/${metadataLanguage}`
        : isWhitepaperPath
          ? `/whitepaper/${metadataLanguage}`
        : path
    const canonicalUrl = `${window.location.origin}${canonicalPath}`
    const finalDescription = trimDescription(description) || defaultDescription
    const robots = !hasAccess
      ? 'noindex, follow'
      : path === '/plugins'
        ? 'noindex, nofollow'
        : path === '/lernziel-feedback'
          ? 'noindex, follow'
          : 'index, follow'
    const imageUrl = `${window.location.origin}/favicon/web-app-manifest-512x512.png`

    document.title = title
    document.documentElement.lang = metadataLanguage
    upsertMetaTag('name', 'description', finalDescription)
    upsertMetaTag('name', 'robots', robots)
    upsertMetaTag('name', 'googlebot', `${robots}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`)
    upsertLinkTag('canonical', canonicalUrl)
    updateQuickstartAlternateLinks(window.location.origin, isQuickstartPath)
    upsertMetaTag('property', 'og:title', title)
    upsertMetaTag('property', 'og:description', finalDescription)
    upsertMetaTag('property', 'og:type', 'website')
    upsertMetaTag('property', 'og:url', canonicalUrl)
    upsertMetaTag('property', 'og:locale', metadataLanguage === 'en' ? 'en_US' : 'de_DE')
    upsertMetaTag('property', 'og:image', imageUrl)
    upsertMetaTag('name', 'twitter:card', 'summary_large_image')
    upsertMetaTag('name', 'twitter:title', title)
    upsertMetaTag('name', 'twitter:description', finalDescription)
    upsertMetaTag('name', 'twitter:image', imageUrl)
  }, [location.pathname, hasActiveSession, language, t, core.currentGoal])

  const handleLogout = () => {
    logoutInProgressRef.current = true
    localStorage.removeItem('skillpilot_id')
    localStorage.removeItem('skillpilot_role')
    localStorage.removeItem('skillpilot_learner_landscape')
    sessionStorage.removeItem('skillpilot_ui_session_id')
    setHasSession(false)
    setSkillpilotId('')
    setPendingLandscapeId(null)
    setRole(null)
    core.setSelectedLandscapeId('')
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (!hasActiveSession) return
    if (isPublicRoute) return // Don't redirect if on public route

    // Deep Link Enforcer for Goal Navigation
    if (role === 'learner') {
      const params = new URLSearchParams(location.search)
      const goalParam = params.get('goal') || params.get('g') || (
        window.location.pathname.startsWith('/learner/') ? '' : routeGoalToken
      )

      if (goalParam) {
        const targetPath = `/learner/${goalParam}`
        // Check if we are already at the target path (or deeper)
        if (window.location.pathname.startsWith(targetPath)) {
          // We successfully reached the goal. Clean up the query param to avoid locking navigation.
          params.delete('goal')
          params.delete('g')
          const newSearch = params.toString()
          navigate(`${window.location.pathname}${newSearch ? '?' + newSearch : ''}`, { replace: true })
          return
        } else {
          // We are meant to be at the goal but aren't yet. Force redirect.
          params.delete('goal')
          params.delete('g')
          const newSearch = params.toString()
          navigate(`${targetPath}${newSearch ? '?' + newSearch : ''}`, { replace: true })
          return
        }
      }
    }

    const desiredPath =
      role === 'learner' ? '/learner' : role === 'trainer' ? '/trainer' : '/explorer'
    if (!window.location.pathname.startsWith(desiredPath) && window.location.pathname !== '/') {
      const targetPath = routeGoalToken ? `${desiredPath}/${routeGoalToken}` : desiredPath
      navigate(targetPath + location.search, { replace: true })
    }
  }, [role, hasActiveSession, navigate, isPublicRoute, location.search, routeGoalToken])

  // Direct check for /curricula using window.location to handle OAuth redirect cache issues
  // This ensures CurriculaView is rendered even if React Router state is out of sync
  if (isPublicRoute || window.location.pathname.startsWith('/curricula')) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <>
          <Routes>
            <Route path="/whitepaper/:lang?" element={<WhitepaperView />} />
            <Route path="/faq" element={<FaqView />} />
            <Route path="/faq/coach-setup" element={<CoachProviderMatrixView />} />
            <Route path="/plugins" element={<PluginCatalogView />} />
            <Route path="/legal" element={<LegalView />} />
            <Route path="/privacy" element={<PrivacyView />} />
            <Route path="/imprint" element={<ImprintView />} />
            <Route path="/curricula" element={<CurriculaView />} />
            {!IS_PACKAGE_CONSUMER_BUILD && (
              <>
                <Route path="/lernzielbuch" element={<GoalBookView />} />
                <Route path="/lernziel-feedback" element={<GoalBookFeedbackPilotView />} />
              </>
            )}
            <Route path="/stats" element={<StatsView />} />
            <Route path="/successes" element={<SuccessView />} />
            <Route path="/quickstart/:lang?" element={<StoryView />} />
            {!IS_PACKAGE_CONSUMER_BUILD && (
              <>
                <Route path="/users" element={<UsersView />} />
                <Route path="/workbench" element={<WorkbenchView />} />
                <Route path="/flashcard-editor" element={<FlashcardEditorView />} />
                <Route path="/graph-editor" element={<GraphEditorView />} />
                <Route path="/canonical-cluster-editor" element={<CanonicalClusterEditorView />} />
                <Route path="/composition-view-editor" element={<CompositionViewEditorView />} />
                <Route path="/semantic-atomicity-review" element={<SemanticAtomicityReviewView />} />
                <Route path="/goal-visualization-qa" element={<GoalVisualizationQaView />} />
                <Route path="/quality-dashboard" element={<CurriculumQualityDashboardView />} />
                <Route path="/curriculum-mapping-workbench" element={<CurriculumMappingWorkbenchView />} />
              </>
            )}
            {!IS_PACKAGE_CONSUMER_BUILD && (
              <Route path="/start/abi26-he-mathe-k1" element={<Abi26MatheStartView />} />
            )}
            {!IS_PACKAGE_CONSUMER_BUILD && (
              <Route path="/start/:campaignId" element={<Abi26MatheStartView />} />
            )}
          </Routes>
        </>
      </Suspense>
    )
  }

  const handleSessionStart = (
    id: string,
    landscapeId?: string,
    forceRole?: Role,
    forceGoalId?: string,
  ) => {
    const activeRole = forceRole || role
    if (!activeRole) return
    const sanitizedId = sanitizeSkillpilotId(id)
    setSkillpilotId(sanitizedId)
    setHasSession(true)
    setRole(activeRole) // Explicitly set role to avoid redirect race
    localStorage.setItem('skillpilot_id', sanitizedId)
    localStorage.setItem('skillpilot_role', activeRole)
    const effectiveLandscapeId = activeRole === 'trainer'
      ? (landscapeId?.trim() ?? '')
      : normalizeLearnerLandscapeId(landscapeId)
    if (activeRole === 'trainer') {
      try {
        localStorage.removeItem('skillpilot_trainer_landscape')
      } catch {
        // The retired global trainer context is not required for the local
        // course organization.
      }
      setPendingLandscapeId(effectiveLandscapeId || null)
      core.setSelectedLandscapeId(effectiveLandscapeId)
    } else if (effectiveLandscapeId) {
      setPendingLandscapeId(effectiveLandscapeId)
      core.setSelectedLandscapeId(effectiveLandscapeId)
    }
    const search = effectiveLandscapeId ? `?l=${effectiveLandscapeId}` : ''
    // Fallback to URL if not passed explicitly (for manual clicks). The route token is a goal id only.
    const params = new URLSearchParams(location.search)
    const routeGoalId = routeGoalToken && routeGoalToken !== sanitizedId ? routeGoalToken : ''
    const deepLinkGoal = forceGoalId || params.get('goal') || params.get('g') || routeGoalId

    if (activeRole === 'learner') {
      if (deepLinkGoal) {
        navigate(`/learner/${deepLinkGoal}${search}`)
      } else {
        navigate(`/learner${search}`)
      }
    } else if (activeRole === 'trainer') {
      navigate(`/trainer${search}`)
    } else {
      navigate(`/explorer${search}`)
    }
  }

  const sessionSetupElement = (
    <>
      <ToastHost toast={toast} />
      <SessionSetup
        role={role}
        setRole={setRole}
        skillpilotId={sanitizedSkillpilotId}
        setSkillpilotId={setSkillpilotId}
        onStart={handleSessionStart}
      />
    </>
  )

  if (isRootRoute(normalizedPath)) {
    return sessionSetupElement
  }

  if (core.runtimeCatalogState.mode === 'unavailable' && role !== 'trainer') {
    return (
      <div
        className="min-h-screen bg-app-gradient text-slate-100 p-6"
        data-testid="runtime-catalog-error"
      >
        Fehler beim Laden der Skill-Landschaften: {core.runtimeCatalogState.error.message}
      </div>
    )
  }

  if (!hasActiveSession && isSetupOnlyRoleRoute) {
    return <Navigate to="/" replace />
  }

  if (renderSessionSetup) {
    return sessionSetupElement
  }

  if (hasActiveSession && !core.selectedLandscapeId && !core.loadingLandscapes && !pendingLandscapeId && isExplorerRoute) {
    return <Navigate to="/" replace />
  }

  // Learners and explorers still need a landscape before entering their
  // workspace. Trainer course organization is the exception: each course owns
  // its curriculum, so the class overview intentionally starts without one.
  if (!core.selectedLandscapeId && !core.loadingLandscapes && !pendingLandscapeId) {
    if (isSetupOnlyRoleRoute) {
      if (role !== 'trainer') {
        return <Navigate to="/" replace />
      }
    } else {
      return sessionSetupElement
    }
  }

  if (core.loadingLandscapes && role !== 'trainer') {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
        Landscapes laden ...
      </div>
    )
  }

  if (core.landscapeError && role !== 'trainer') {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
        Fehler beim Laden der Skill-Landschaften: {core.landscapeError.message}
      </div>
    )
  }

  // Nur Fehler anzeigen, wenn wirklich keine Landscapes geladen wurden.
  if (core.landscapeEntries.length === 0 && !core.loadingLandscapes && role !== 'trainer') {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6 flex items-center justify-center">
        <p className="text-xl">Keine Skill-Landschaften verfügbar.</p>
      </div>
    )
  }

  if (!core.currentGoal && role !== 'trainer') {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
        <p>Für diese Landschaft wurden keine Lernziele gefunden.</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <>
        <ToastHost toast={toast} />
        <Routes>
        <Route
          path="/learner/:goalId?"
          element={
            <LearnerView
              rootGoals={core.breadcrumbRootGoals}
              goalIndexAll={core.goalIndexAll}
              getMastery={core.getMasteryValue}
              currentGoal={core.currentGoal}
              onSelectGoal={core.handleSelectAbsolute}
              onSelectGoalInLandscape={core.handleNavigateToExternal}
              routeGoalId={core.currentRouteGoalId}
              skillpilotId={sanitizedSkillpilotId}
              landscapeId={core.selectedLandscapeId}
              currentLandscapeHasMatchedCompositionView={core.currentLandscapeHasMatchedCompositionView}
              activeFilter={core.activeFilter}
              onNotify={handleNotify}
              onLogout={handleLogout}
              availableLandscapes={availableLandscapes}
              rootLandscapeId={setupRootLandscapeId}
              onRefresh={core.refreshMastery}
              onScopeDataRefresh={core.refreshLearnerGraphData}
              parentMap={core.parentMapAll}
              onLandscapeChange={core.setSelectedLandscapeId}
            />
          }
        />
        <Route
          path="/trainer/:goalId?"
          element={
            <TrainerView
              landscapeEntries={core.landscapeEntries}
              loadingLandscapes={core.loadingLandscapes}
              landscapeError={core.landscapeError}
              runtimeCatalogState={core.runtimeCatalogState}
              onContextChange={core.handleTrainerContextChange}
              routeGoalId={core.currentRouteGoalId}
              currentLearnerId={trainerLearnerId}
              onSelectLearner={setTrainerLearnerId}
              goalShortKeyMap={core.goalShortKeyMap}
              onNotify={handleNotify}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/explorer/:goalId?"
          element={
            <ExplorerView
              breadcrumbCrumbs={core.breadcrumbCrumbs}
              neighbors={core.filteredNeighbors}
              activeFilter={core.activeFilter}
              availableFilters={core.availableFilters}
              onFilterChange={core.handleFilterChange}
              externalRequires={core.externalRequires}
              currentGoal={core.currentGoal}
              getMastery={core.getMasteryValue}
              onNavigate={core.handleNavigateTo}
              onNavigateExternal={core.handleNavigateToExternal}
              onMasteryChange={core.handleMasteryChange}
              showLearnerTools={core.showLearnerTools}
              onLogout={handleLogout}
              goalIndexAll={core.goalIndexAll}
            />
          }
        />
        <Route path="/legal" element={<LegalView />} />
        <Route path="/faq" element={<FaqView />} />
        <Route path="/faq/coach-setup" element={<CoachProviderMatrixView />} />
        <Route path="/plugins" element={<PluginCatalogView />} />
        <Route path="/privacy" element={<PrivacyView />} />
        <Route path="/imprint" element={<ImprintView />} />
        <Route path="/quickstart/:lang?" element={<StoryView />} />
        <Route path="/whitepaper/:lang?" element={<WhitepaperView />} />
        {!IS_PACKAGE_CONSUMER_BUILD && (
          <Route path="/start/abi26-he-mathe-k1" element={<Abi26MatheStartView />} />
        )}
        {!IS_PACKAGE_CONSUMER_BUILD && (
          <Route path="/start/:campaignId" element={<Abi26MatheStartView />} />
        )}

        <Route path="/" element={null} />
        </Routes>
      </>
    </Suspense>
  )
}
export default App
