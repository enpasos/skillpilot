import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ExplorerView } from './views/ExplorerView'
import { LearnerView } from './views/LearnerView'
import { TrainerView } from './views/TrainerView'
import { LegalView } from './views/LegalView'
import { PrivacyView } from './views/PrivacyView'
import { ImprintView } from './views/ImprintView'
import { HallOfFameView } from './views/HallOfFameView'
import { WhitepaperView } from './views/WhitepaperView'
import { StoryView } from './views/StoryView'
import { UsersView } from './views/UsersView'

import { SessionSetup } from './components/SessionSetup'
import { useAppCore } from './hooks/useAppCore'
import { useTranslation } from './hooks/useTranslation'
import { useLanguage } from './contexts/LanguageContext'

type Role = 'learner' | 'trainer' | 'explorer'

const PUBLIC_PATHS = new Set([
  '/',
  '/hall-of-fame',
  '/privacy',
  '/imprint',
  '/legal',
  '/whitepaper',
  '/story',
  '/users',
])
const GOAL_VIEWS = new Set(['learner', 'trainer', 'explorer'])
const MAX_DESCRIPTION_LENGTH = 160

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

const App: React.FC = () => {
  const { language } = useLanguage()
  const t = useTranslation()
  const [role, setRole] = useState<Role | null>(() => {
    return (localStorage.getItem('skillpilot_role') as Role) || null
  })
  const [skillpilotId, setSkillpilotId] = useState(() => {
    return localStorage.getItem('skillpilot_id') || ''
  })
  const [hasSession, setHasSession] = useState(() => {
    const storedRole = localStorage.getItem('skillpilot_role')
    const storedId = localStorage.getItem('skillpilot_id')
    if (!storedRole) return false
    if (storedRole === 'learner') return !!storedId
    return true
  })
  const [, setLearnerMeta] = useState<{ lastUpdated: string }>({
    lastUpdated: new Date().toISOString(),
  })
  const navigate = useNavigate()
  const location = useLocation()
  const normalizedPath = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '')
  const isWhitepaperRoute = normalizedPath === '/whitepaper' || normalizedPath.startsWith('/whitepaper/')
  const isStoryRoute = normalizedPath === '/story' || normalizedPath.startsWith('/story/')

  // Allow public routes to render without session
  const isPublicRoute =
    ['/legal', '/privacy', '/imprint', '/hall-of-fame', '/users'].includes(normalizedPath) ||
    isWhitepaperRoute ||
    isStoryRoute

  const core = useAppCore({ role: role || 'explorer', setLearnerMeta, skillpilotId })
  const availableLandscapes = useMemo(
    () =>
      core.landscapeEntries.map((e) => ({
        landscapeId: e.meta.landscapeId,
        title: e.meta.title,
        subject: e.meta.subject,
        filters: e.meta.filters,
      })),
    [core.landscapeEntries],
  )

  useEffect(() => {
    const rawPath = location.pathname || '/'
    const path = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '')
    const view = path.split('/')[1] || ''
    const isPublicPath = PUBLIC_PATHS.has(path) || path === '/whitepaper' || path.startsWith('/whitepaper/')
    const isGoalView = GOAL_VIEWS.has(view)
    const hasAccess = hasSession || isPublicPath || path === '/'
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
        : 'Impressum und Kontaktinformationen fuer SkillPilot.'
    const legalDescription =
      language === 'en'
        ? 'Legal notice, licensing, and usage disclaimer for SkillPilot.'
        : 'Rechtliche Hinweise, Lizenz und Haftung fuer SkillPilot.'

    let title = baseTitle
    let description = defaultDescription

    if (isPublicPath) {
      if (path === '/hall-of-fame') {
        const hofTitle = t.startPage.cards.hallOfFame?.title || 'Hall of Fame'
        title = `${hofTitle} | ${baseTitle}`
        description = t.hallOfFamePage.subtitle || defaultDescription
      } else if (path === '/whitepaper' || path.startsWith('/whitepaper/')) {
        const whitepaperTitle = t.startPage.cards.whitepaper.title || 'Whitepaper'
        title = `${whitepaperTitle} | ${baseTitle}`
        description = t.startPage.cards.whitepaper.description || defaultDescription
      } else if (path === '/users') {
        const usersTitle = t.usersPage?.title || 'Users'
        title = `${usersTitle} | ${baseTitle}`
        description = t.usersPage?.subtitle || defaultDescription
      } else if (path === '/privacy') {
        title = `${t.startPage.footer.privacy} | ${baseTitle}`
        description = privacyDescription
      } else if (path === '/imprint') {
        title = `${t.startPage.footer.imprint} | ${baseTitle}`
        description = imprintDescription
      } else if (path === '/legal') {
        title = `${t.startPage.footer.legal} | ${baseTitle}`
        description = legalDescription
      } else {
        title = `${baseTitle} | ${t.startPage.subtitle}`
      }
    } else if (!hasSession) {
      title = `${baseTitle} | ${t.startPage.subtitle}`
    } else if (isGoalView && core.currentGoal) {
      title = `${core.currentGoal.title} | ${baseTitle}`
      description = core.currentGoal.description || defaultDescription
    }

    const canonicalPath = !hasAccess ? '/' : path
    const canonicalUrl = `${window.location.origin}${canonicalPath}`
    const finalDescription = trimDescription(description) || defaultDescription
    const robots = !hasAccess ? 'noindex, follow' : 'index, follow'
    const imageUrl = `${window.location.origin}/favicon/web-app-manifest-512x512.png`

    document.title = title
    upsertMetaTag('name', 'description', finalDescription)
    upsertMetaTag('name', 'robots', robots)
    upsertMetaTag('name', 'googlebot', `${robots}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`)
    upsertLinkTag('canonical', canonicalUrl)
    upsertMetaTag('property', 'og:title', title)
    upsertMetaTag('property', 'og:description', finalDescription)
    upsertMetaTag('property', 'og:type', 'website')
    upsertMetaTag('property', 'og:url', canonicalUrl)
    upsertMetaTag('property', 'og:image', imageUrl)
    upsertMetaTag('name', 'twitter:card', 'summary_large_image')
    upsertMetaTag('name', 'twitter:title', title)
    upsertMetaTag('name', 'twitter:description', finalDescription)
    upsertMetaTag('name', 'twitter:image', imageUrl)
  }, [location.pathname, hasSession, language, t, core.currentGoal])

  const handleLogout = () => {
    localStorage.removeItem('skillpilot_id')
    localStorage.removeItem('skillpilot_role')
    setHasSession(false)
    setSkillpilotId('')
    setRole(null)
    core.setSelectedLandscapeId('')
    navigate('/')
  }

  useEffect(() => {
    if (!hasSession) return
    if (isPublicRoute) return // Don't redirect if on public route

    // Deep Link Enforcer for Goal Navigation
    if (role === 'learner') {
      const params = new URLSearchParams(location.search)
      const goalParam = params.get('goal') || params.get('g')

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
          navigate(`${targetPath}${location.search}`, { replace: true })
          return
        }
      }
    }

    const desiredPath =
      role === 'learner' ? '/learner' : role === 'trainer' ? '/trainer' : '/explorer'
    if (!window.location.pathname.startsWith(desiredPath) && window.location.pathname !== '/') {
      navigate(desiredPath + location.search, { replace: true })
    }
  }, [role, hasSession, navigate, isPublicRoute, location.search])

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/whitepaper/:lang?" element={<WhitepaperView />} />
        <Route path="/legal" element={<LegalView />} />
        <Route path="/privacy" element={<PrivacyView />} />
        <Route path="/legal" element={<LegalView />} />
        <Route path="/privacy" element={<PrivacyView />} />
        <Route path="/imprint" element={<ImprintView />} />
        <Route path="/hall-of-fame" element={<HallOfFameView />} />
        <Route path="/users" element={<UsersView />} />
        <Route path="/story/:lang?" element={<StoryView />} />
      </Routes>
    )
  }

  if (!hasSession || normalizedPath === '/') {
    return (
      <SessionSetup
        role={role}
        setRole={setRole}
        skillpilotId={skillpilotId}
        setSkillpilotId={setSkillpilotId}
        onStart={(id, landscapeId, forceRole, forceGoalId) => {
          const activeRole = forceRole || role
          if (!activeRole) return
          setSkillpilotId(id)
          setHasSession(true)
          setRole(activeRole) // Explicitly set role to avoid redirect race
          localStorage.setItem('skillpilot_id', id)
          localStorage.setItem('skillpilot_role', activeRole)
          if (landscapeId) {
            core.setSelectedLandscapeId(landscapeId)
          }
          const search = landscapeId ? `?l=${landscapeId}` : ''
          // Fallback to URL if not passed explicitly (for manual clicks)
          const params = new URLSearchParams(location.search)
          const deepLinkGoal = forceGoalId || params.get('goal') || params.get('g')

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
        }}
      />
    )
  }

  // If we have a session but no landscape selected, show SessionSetup to let user pick one.
  // This effectively acts as the "Login/Start" screen when context is missing.
  if (!core.selectedLandscapeId && !core.loadingLandscapes) {
    return (
      <SessionSetup
        role={role}
        setRole={setRole}
        skillpilotId={skillpilotId}
        setSkillpilotId={setSkillpilotId}
        onStart={(id, landscapeId, forceRole, forceGoalId) => {
          const activeRole = forceRole || role
          if (!activeRole) return
          setSkillpilotId(id)
          setHasSession(true)
          setRole(activeRole) // Explicitly set role to avoid redirect race
          localStorage.setItem('skillpilot_id', id)
          localStorage.setItem('skillpilot_role', activeRole)
          if (landscapeId) {
            core.setSelectedLandscapeId(landscapeId)
          }
          const search = landscapeId ? `?l=${landscapeId}` : ''
          // Fallback to URL if not passed explicitly (for manual clicks)
          const params = new URLSearchParams(location.search)
          const deepLinkGoal = forceGoalId || params.get('goal') || params.get('g')

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
        }}
      />
    )
  }

  if (core.loadingLandscapes) {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
        Landscapes laden ...
      </div>
    )
  }

  if (core.landscapeError) {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6">
        Fehler beim Laden der Lernlandschaften: {core.landscapeError.message}
      </div>
    )
  }

  // Nur Fehler anzeigen, wenn wirklich keine Landscapes geladen wurden.
  if (core.landscapeEntries.length === 0 && !core.loadingLandscapes && role !== 'trainer') {
    return (
      <div className="min-h-screen bg-app-gradient text-slate-100 p-6 flex items-center justify-center">
        <p className="text-xl">Keine Lernlandschaften verfügbar.</p>
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
            skillpilotId={skillpilotId}
            landscapeId={core.selectedLandscapeId}
            activeFilter={core.activeFilter}
            onLogout={handleLogout}
            availableLandscapes={availableLandscapes}
            rootLandscapeId={core.selectedLandscapeId}
            onRefresh={core.refreshMastery}
            parentMap={core.parentMapAll}
          />
        }
      />
      <Route
        path="/trainer/:goalId?"
        element={
          <TrainerView
            landscapeEntries={core.landscapeEntries}
            onContextChange={core.handleTrainerContextChange}
            rootGoals={core.breadcrumbRootGoals}
            goalIndexAll={core.goalIndexAll}
            currentLearnerId="__ALL__"
            onSelectLearner={() => { }}
            goalShortKeyMap={core.goalShortKeyMap}
            onLogout={handleLogout}
            getMastery={core.getMasteryValue}
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
            onFilterChange={core.setActiveFilter}
            externalRequires={core.externalRequires}
            currentGoal={core.currentGoal}
            getMastery={core.getMasteryValue}
            onNavigate={core.handleNavigateTo}
            onNavigateExternal={core.handleNavigateToExternal}
            onMasteryChange={core.handleMasteryChange}
            showLearnerTools={core.showLearnerTools}
            onLogout={handleLogout}
          />
        }
      />
      <Route path="/legal" element={<LegalView />} />
      <Route path="/privacy" element={<PrivacyView />} />
      <Route path="/imprint" element={<ImprintView />} />
      <Route path="/story/:lang?" element={<StoryView />} />
      <Route path="/whitepaper/:lang?" element={<WhitepaperView />} />

      <Route path="/" element={<Navigate to="/explorer" />} />
    </Routes>
  )
}
export default App
