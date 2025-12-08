import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { ExplorerView } from './views/ExplorerView'
import { LearnerView } from './views/LearnerView'
import { TrainerView } from './views/TrainerView'
import { LegalView } from './views/LegalView'
import { PrivacyView } from './views/PrivacyView'
import { ImprintView } from './views/ImprintView'
import { WhitepaperView } from './views/WhitepaperView'
import { SessionSetup } from './components/SessionSetup'
import { useAppCore } from './hooks/useAppCore'

type Role = 'learner' | 'trainer' | 'explorer'

const App: React.FC = () => {
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

  // Allow public routes to render without session
  const isPublicRoute = ['/legal', '/privacy', '/imprint', '/whitepaper'].includes(location.pathname)

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

    const desiredPath =
      role === 'learner' ? '/learner' : role === 'trainer' ? '/trainer' : '/explorer'
    if (!window.location.pathname.startsWith(desiredPath)) {
      navigate(desiredPath, { replace: true })
    }
  }, [role, hasSession, navigate, isPublicRoute])

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/legal" element={<LegalView />} />
        <Route path="/privacy" element={<PrivacyView />} />
        <Route path="/imprint" element={<ImprintView />} />
        <Route path="/whitepaper" element={<WhitepaperView />} />
      </Routes>
    )
  }

  if (!hasSession) {
    return (
      <SessionSetup
        role={role}
        setRole={setRole}
        skillpilotId={skillpilotId}
        setSkillpilotId={setSkillpilotId}
        onStart={(id, landscapeId) => {
          if (!role) return
          setSkillpilotId(id)
          setHasSession(true)
          localStorage.setItem('skillpilot_id', id)
          localStorage.setItem('skillpilot_role', role)
          if (landscapeId) {
            core.setSelectedLandscapeId(landscapeId)
          }
          const search = landscapeId ? `?l=${landscapeId}` : ''
          if (role === 'learner') {
            navigate(`/learner${search}`)
          } else if (role === 'trainer') {
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
        onStart={(id, landscapeId) => {
          if (!role) return
          setSkillpilotId(id)
          setHasSession(true)
          localStorage.setItem('skillpilot_id', id)
          localStorage.setItem('skillpilot_role', role)
          if (landscapeId) {
            core.setSelectedLandscapeId(landscapeId)
          }
          const search = landscapeId ? `?l=${landscapeId}` : ''
          if (role === 'learner') {
            navigate(`/learner${search}`)
          } else if (role === 'trainer') {
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
      <Route path="/whitepaper" element={<WhitepaperView />} />
      <Route path="/" element={<Navigate to="/explorer" />} />
    </Routes>
  )
}
export default App
