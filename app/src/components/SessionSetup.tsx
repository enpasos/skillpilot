import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CurriculumDropdown } from './CurriculumDropdown'
import { ThemeToggle } from './ThemeToggle'
import type { LandscapeSummary } from './CurriculumDropdown'
import { Save, ArrowRight, Github, Trophy, ShieldCheck, Send, MessageCircle, Compass, Wrench } from 'lucide-react'


type Role = 'learner' | 'trainer' | 'explorer'

interface SessionSetupProps {
  role: Role | null
  setRole: (r: Role | null) => void
  skillpilotId: string
  setSkillpilotId: (id: string) => void
  onStart: (id: string, landscapeId?: string, role?: Role, goalId?: string) => void
}

import { useTranslation } from '../hooks/useTranslation'
import { LanguageToggle } from './LanguageToggle'
import { useLanguage } from '../contexts/LanguageContext'
import { AudioPlayer } from './AudioPlayer'
import { getSkillpilotGptUrl } from '../utils/skillpilotGpt'
import { normalizeTrainerLandscapeId } from '../utils/trainerLandscapeContext'

export const SessionSetup: React.FC<SessionSetupProps> = ({ role, setRole, skillpilotId, setSkillpilotId, onStart }) => {
  const t = useTranslation()
  const { language } = useLanguage()
  const isPublicSkillpilot =
    typeof window !== 'undefined' && /(^|\.)skillpilot\.com$/i.test(window.location.hostname)
  const [selectedLandscapeId, setSelectedLandscapeId] = useState<string>(() => {
    // Restore trainer's last selection from local storage
    if (role === 'trainer') {
      return normalizeTrainerLandscapeId(localStorage.getItem('skillpilot_trainer_landscape'))
    }
    // Restore learner's last selection from local storage for faster startup
    if (role === 'learner') {
      return localStorage.getItem('skillpilot_learner_landscape') || ''
    }
    return ''
  })
  // Use location (ensure import is added)
  const location = useLocation()

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const deepLinkCurriculum = params.get('curriculum') || params.get('landscape') || params.get('l')
    const deepLinkId = params.get('skillpilotId') || params.get('id')
    const deepLinkGoal = params.get('goal') || params.get('g')

    if (deepLinkCurriculum && deepLinkCurriculum !== selectedLandscapeId) {
      setSelectedLandscapeId(role === 'trainer' ? normalizeTrainerLandscapeId(deepLinkCurriculum) : deepLinkCurriculum)
    }

    if (deepLinkId) {
      const id = deepLinkId.trim();
      if (skillpilotId !== id) {
        setSkillpilotId(id);
      }
      setRole('learner');
      checkLearner(id);
      setShowLogin(true);

      if (deepLinkCurriculum) {
        onStart(id, deepLinkCurriculum, 'learner', deepLinkGoal || undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCheckedId, setHasCheckedId] = useState(false)
  const [availableCurricula, setAvailableCurricula] = useState<LandscapeSummary[]>([])

  // Collapsible logic for Login form
  const [showLogin, setShowLogin] = useState(false);

  const resetTransientSetupState = (clearSkillpilotId = false) => {
    setError(null)
    setSelectedLandscapeId('')
    setAvailableCurricula([])
    setHasCheckedId(false)
    if (clearSkillpilotId) {
      setSkillpilotId('')
    }
  }


  const requestNewId = async () => {
    setLoading(true)
    setError(null)
    setHasCheckedId(false)
    setSelectedLandscapeId('')
    setAvailableCurricula([])
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners` : '/api/ui/learners'
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      const id = data.state?.skillpilotId || data.skillpilotId || data.learnerId || data.id
      if (!id) throw new Error('Keine SkillPilot-ID im Response')
      setSkillpilotId(String(id))

      if (data.availableCurricula) {
        setAvailableCurricula(data.availableCurricula)
      }

      // New ID implies no curriculum yet, but we are "checked"
      setHasCheckedId(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const checkLearner = async (id: string) => {
    if (!id) {
      setSelectedLandscapeId('')
      setAvailableCurricula([])
      setHasCheckedId(false)
      return
    }
    setLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${id}` : `/api/ui/learners/${id}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (data.selectedCurriculum) {
          setSelectedLandscapeId(data.selectedCurriculum)
        }
      }
    } catch {
      // Ignore errors, just means we can't pre-fill
    } finally {
      setHasCheckedId(true)
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (role === 'learner' && !skillpilotId.trim()) return

    const effectiveId = role === 'learner' ? skillpilotId.trim() : ''

    if (role === 'learner' && selectedLandscapeId) {
      // Save selection to backend before navigation so learner state is in sync.
      // Save selection to backend non-blocking (fire and forget)
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${effectiveId}/curriculum` : `/api/ui/learners/${effectiveId}/curriculum`
        fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ curriculumId: selectedLandscapeId })
        }).catch(e => console.error('Failed to save curriculum silently', e))
      } catch (e) {
        console.error('Failed to initiate save curriculum', e)
      }
    }

    if (role === 'trainer' && selectedLandscapeId) {
      const normalizedTrainerLandscapeId = normalizeTrainerLandscapeId(selectedLandscapeId)
      if (!normalizedTrainerLandscapeId) {
        localStorage.removeItem('skillpilot_trainer_landscape')
        setSelectedLandscapeId('')
        return
      }
      if (normalizedTrainerLandscapeId !== selectedLandscapeId) {
        setSelectedLandscapeId(normalizedTrainerLandscapeId)
      }
      localStorage.setItem('skillpilot_trainer_landscape', normalizedTrainerLandscapeId)
    }

    // Save learner curriculum to localStorage for faster startup next time
    if (role === 'learner' && selectedLandscapeId) {
      localStorage.setItem('skillpilot_learner_landscape', selectedLandscapeId)
    }

    onStart(effectiveId, selectedLandscapeId, role || undefined)
  }

  // Restore persisted selection when the role changes.
  React.useEffect(() => {
    if (role === 'trainer') {
      const saved = normalizeTrainerLandscapeId(localStorage.getItem('skillpilot_trainer_landscape'))
      if (saved) {
        setSelectedLandscapeId(saved)
      } else {
        localStorage.removeItem('skillpilot_trainer_landscape')
        setSelectedLandscapeId('')
      }
    } else if (role === 'learner') {
      setSelectedLandscapeId(localStorage.getItem('skillpilot_learner_landscape') || '')
    } else if (role === 'explorer') {
      setSelectedLandscapeId('')
    }
  }, [role])

  return (
    <div className="min-h-screen flex flex-col items-center bg-chat-bg text-text-primary px-6 py-10 transition-colors relative">
      <div className="w-full flex justify-between items-center mb-6">
        <div /> {/* Spacer to keep right alignment clean or put branding here later */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/enpasos/skillpilot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
            title="SkillPilot on GitHub"
          >
            <Github size={20} />
          </a>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-lg">
        {/* 0. Logo & Title */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-amber-500">
              <Send size={48} strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-700 dark:text-slate-200">
              SkillPilot
            </h1>
          </div>
          <Link
            to={`/quickstart/${language}`}
            className="flex items-center gap-2 text-text-secondary hover:text-sky-500 transition-colors"
          >

            <span className="font-medium">{t.startPage.subtitle}</span>
          </Link>
        </div>

        <div className="w-full space-y-4">
          {!showLogin && (
            <div className="flex justify-center w-full">
              <AudioPlayer key={language} />
            </div>
          )}

          {!showLogin ? (
            <div className="grid grid-cols-1 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              {/* Card 1: GPT */}
              <a href={getSkillpilotGptUrl(language)} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-6 hover:shadow-lg hover:border-sky-400/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-2">
                      {t.startPage.cards.gpt.title} <MessageCircle size={18} className="text-sky-500" />
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {t.startPage.cards.gpt.description}
                    </p>
                    {/* Integrated Info Banner */}
                    {t.startPage.banner && (
                      <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 dark:border-sky-800/30 dark:bg-sky-900/20 p-3 flex gap-2 text-xs text-sky-900 dark:text-sky-100 items-start">
                        <ShieldCheck className="shrink-0 text-sky-600 dark:text-sky-400" size={16} />
                        <div className="leading-relaxed whitespace-pre-line">
                          {t.startPage.banner.text.split('**').map((part, i) =>
                            i % 2 === 1 ? <span key={i} className="font-bold">{part}</span> : part
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-sky-500 transition-all shrink-0 ml-4" />
                </div>
              </a>

              {/* Card 2: My Successes (Direct Learner Login) */}
              <button
                onClick={() => {
                  setRole('learner')
                  resetTransientSetupState()
                  const id = localStorage.getItem('skillpilot_id')
                  const savedLandscape = localStorage.getItem('skillpilot_learner_landscape')
                  if (id) {
                    setSkillpilotId(id)
                    // If we have a saved landscape, set it immediately and mark as checked
                    if (savedLandscape) {
                      setSelectedLandscapeId(savedLandscape)
                      setHasCheckedId(true)
                    }
                    // Still check learner to get latest data from server (non-blocking update)
                    checkLearner(id)
                  }
                  setShowLogin(true)
                }}
                className="group w-full relative overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-6 hover:shadow-lg hover:border-sky-400/50 transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-2">
                      {t.startPage.cards.explorer.title} <Compass size={18} className="text-sky-500" />
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {t.startPage.cards.explorer.description}
                    </p>
                  </div>
                  <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
                </div>
              </button>

              {/* Card 3: Curricula */}
              <Link
                to="/curricula"
                className="group relative overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-6 hover:shadow-lg hover:border-amber-400/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
                      {t.startPage.cards.curricula?.title || 'Curricula'} <Trophy size={18} className="text-amber-500" />
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {t.startPage.cards.curricula?.description || 'Curriculum champions.'}
                    </p>
                  </div>
                  <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                </div>
              </Link>

              {/* Direct Access Links for Trainer/Explorer */}
              <div className="flex justify-center gap-6 pt-4 text-xs text-text-secondary items-center flex-wrap">
                <Link to="/stats" className="hover:text-sky-500 hover:underline transition-colors">
                  {t.startPage.links.statistics}
                </Link>
                {!isPublicSkillpilot && (
                  <Link
                    to="/workbench"
                    className="hover:text-sky-500 hover:underline transition-colors inline-flex items-center gap-1"
                  >
                    <Wrench size={12} />
                    <span>{t.startPage.links.workbench}</span>
                  </Link>
                )}
                <Link
                  to={`/whitepaper/${language === 'de' ? 'de' : 'en'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-500 hover:underline transition-colors"
                >
                  {t.startPage.links.whitepaper}
                </Link>
                {(['trainer', 'explorer'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r)
                      resetTransientSetupState(true)
                      setShowLogin(true)
                    }}
                    className="hover:text-sky-500 hover:underline transition-colors"
                  >
                    {t.startPage.login.roles[r]}
                  </button>
                ))}
              </div>
            </div>
          ) : ( // ACTUAL MATCH TARGET BELOW
            <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetTransientSetupState(true)
                      setShowLogin(false)
                      setRole(null)
                    }}
                    className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors hover:-translate-x-1 duration-200"
                  >
                    <ArrowRight className="rotate-180 mr-1" size={16} /> {t.startPage.login.back}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* For Learner: No Role Selection Cards needed here anymore, we are already in Learner mode */}

                  {/* Secondary Roles Access (Only visible if we explicitly want to switch) */}
                  {/* Secondary Roles Access removed as per user request */}
                </div>

                {role === 'learner' && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="skillpilotIdInput" className="text-[11px] text-text-secondary">
                        {t.startPage.login.idLabel}
                      </label>
                      <button
                        type="button"
                        onClick={requestNewId}
                        disabled={loading}
                        className="text-[10px] text-sky-400 hover:text-sky-300 disabled:opacity-50"
                      >
                        {t.startPage.login.requestNewId}
                      </button>
                    </div>
                    <input
                      id="skillpilotIdInput"
                      type="text"
                      value={skillpilotId}
                      onChange={(event) => {
                        setSkillpilotId(event.target.value)
                        resetTransientSetupState()
                      }}
                      onBlur={() => {
                        if (!hasCheckedId) {
                          checkLearner(skillpilotId.trim())
                        }
                      }}
                      className="rounded border border-border-color bg-input-bg px-3 py-2 text-sm text-text-primary font-mono focus:border-sky-400 transition-colors"
                      placeholder=""
                      required
                    />
                    <span className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded px-2 py-1 mt-1">
                      {t.startPage.login.idWarning}
                    </span>
                    {error && <span className="text-[11px] text-rose-300 mt-1">Fehler: {error}</span>}

                    {/* Show "Weiter" button if we have an ID but haven't checked it yet */}
                    {skillpilotId.trim().length > 0 && !hasCheckedId && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => checkLearner(skillpilotId.trim())}
                          disabled={loading}
                          className="w-full rounded-full border border-sky-500/50 bg-sky-600/20 px-4 py-2 text-sm font-semibold text-sky-100 hover:bg-sky-600/40 hover:border-sky-400 transition-colors"
                        >
                          {loading ? t.startPage.login.checking : t.startPage.login.checkButton}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {role === 'trainer' && (
                  <div className="bg-sky-100 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-500/20 rounded p-3 text-xs text-sky-800 dark:text-sky-200/80 leading-relaxed">
                    <p className="mb-1 font-bold flex items-center gap-2">
                      <Save size={16} /> {t.startPage.login.trainerInfo.title}
                    </p>
                    <p className="mb-2">
                      {t.startPage.login.trainerInfo.text}
                    </p>
                  </div>
                )}

                {/* Step 2: Curriculum Selection */}
                {role && (role !== 'learner' || (skillpilotId.length > 0 && hasCheckedId)) && (
                  <div className="pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] text-text-secondary block mb-1">
                      {role === 'learner' && selectedLandscapeId ? t.startPage.login.curriculumLabel.yours : t.startPage.login.curriculumLabel.select}
                    </label>
                    <CurriculumDropdown
                      currentLandscapeId={selectedLandscapeId}
                      onSelect={setSelectedLandscapeId}
                      landscapes={availableCurricula}
                      showCompatibilityViews={false}
                    />

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={(role === 'learner' && !skillpilotId.trim()) || !selectedLandscapeId}
                        className="w-full rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 hover:border-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {role === 'trainer' ? t.startPage.login.dashboardButton : t.startPage.login.startButton}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 py-6 text-xs text-slate-500 flex gap-4">
        <Link to="/privacy" className="hover:text-slate-300 transition-colors">{t.startPage.footer.privacy}</Link>
        <span className="text-slate-700">|</span>
        <Link to="/imprint" className="hover:text-slate-300 transition-colors">{t.startPage.footer.imprint}</Link>
        <span className="text-slate-700">|</span>
        <Link to="/legal" className="hover:text-slate-300 transition-colors">{t.startPage.footer.legal}</Link>
      </div>
    </div>
  )
}
