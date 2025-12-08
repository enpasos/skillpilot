import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CurriculumDropdown } from './CurriculumDropdown'
import { ThemeToggle } from './ThemeToggle'
import type { LandscapeSummary } from './CurriculumDropdown'
import { Save, ArrowRight, Github } from 'lucide-react'
import logo from '../assets/skillpilot512x512.png'

type Role = 'learner' | 'trainer' | 'explorer'

interface SessionSetupProps {
  role: Role | null
  setRole: (r: Role) => void
  skillpilotId: string
  setSkillpilotId: (id: string) => void
  onStart: (id: string, landscapeId?: string) => void
}

import { useTranslation } from '../hooks/useTranslation'
import { LanguageToggle } from './LanguageToggle'

export const SessionSetup: React.FC<SessionSetupProps> = ({ role, setRole, skillpilotId, setSkillpilotId, onStart }) => {
  const t = useTranslation()
  const [selectedLandscapeId, setSelectedLandscapeId] = useState<string>(() => {
    // Restore trainer's last selection from local storage
    if (role === 'trainer') {
      return localStorage.getItem('skillpilot_trainer_landscape') || ''
    }
    return ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCheckedId, setHasCheckedId] = useState(false)
  const [availableCurricula, setAvailableCurricula] = useState<LandscapeSummary[]>([])

  // Collapsible logic for Login form
  const [showLogin, setShowLogin] = useState(false);


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
        } else {
          setSelectedLandscapeId('')
        }
      } else {
        // If learner not found (404), we assume it's a new ID (or invalid, but we let them try)
        // and reset selection
        setSelectedLandscapeId('')
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
      // Save selection to backend
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/learners/${effectiveId}/curriculum` : `/api/ui/learners/${effectiveId}/curriculum`
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ curriculumId: selectedLandscapeId })
        })
      } catch (e) {
        console.error("Failed to save curriculum", e)
      }
    }

    if (role === 'trainer' && selectedLandscapeId) {
      localStorage.setItem('skillpilot_trainer_landscape', selectedLandscapeId)
    }

    onStart(effectiveId, selectedLandscapeId)
  }

  // Effect to restore trainer selection when role changes
  React.useEffect(() => {
    if (role === 'trainer') {
      const saved = localStorage.getItem('skillpilot_trainer_landscape')
      if (saved) {
        setSelectedLandscapeId(saved)
      }
    } else if (role === 'explorer') {
      setSelectedLandscapeId('')
    }
    // For learner, we wait for ID check
  }, [role])

  return (
    <div className="min-h-screen flex flex-col items-center bg-chat-bg text-text-primary px-6 py-10 transition-colors relative">
      <div className="absolute top-6 right-6 flex items-center gap-4">
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

      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-lg">
        {/* 0. Logo & Title */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 -mb-2">
            <img src={logo} alt="SkillPilot Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-700 dark:text-slate-200">
            SkillPilot
          </h1>
          <p className="mt-2 text-text-secondary">{t.startPage.subtitle}</p>
        </div>

        <div className="w-full space-y-4">
          {!showLogin ? (
            <div className="grid grid-cols-1 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              {/* Card 1: Whitepaper */}
              <Link to="/whitepaper" className="group relative overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-6 hover:shadow-lg hover:border-sky-400/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {t.startPage.cards.whitepaper.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {t.startPage.cards.whitepaper.description}
                    </p>
                  </div>
                  <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
                </div>
              </Link>

              {/* Card 2: GPT */}
              <a href="https://chatgpt.com/g/g-6918107415fc8191ae32bb3dfa9e54a2-skillpilot-gpt" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-6 hover:shadow-lg hover:border-sky-400/50 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {t.startPage.cards.gpt.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {t.startPage.cards.gpt.description}
                    </p>
                  </div>
                  <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
                </div>
              </a>

              {/* Card 3: Data Explorer (Login Trigger) */}
              <button
                onClick={() => setShowLogin(true)}
                className="group w-full relative overflow-hidden rounded-xl border border-border-color bg-white/50 dark:bg-slate-800/50 p-6 hover:shadow-lg hover:border-sky-400/50 transition-all duration-300 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {t.startPage.cards.explorer.title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      {t.startPage.cards.explorer.description}
                    </p>
                  </div>
                  <ArrowRight className="text-text-secondary group-hover:translate-x-1 group-hover:text-sky-500 transition-all" />
                </div>
              </button>
            </div>
          ) : ( // ACTUAL MATCH TARGET BELOW
            <div className="w-full animate-in slide-in-from-bottom-4 duration-300">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors hover:-translate-x-1 duration-200"
                  >
                    <ArrowRight className="rotate-180 mr-1" size={16} /> {t.startPage.login.back}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Role Selection Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['learner', 'trainer', 'explorer'] as const).map((r) => {
                      const isActive = role === r
                      const label = r === 'explorer' ? t.startPage.login.roles.explorer : t.startPage.login.roles[r]
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setRole(r)
                            // Reset selection when changing role
                            setSelectedLandscapeId('')
                            setHasCheckedId(false)
                          }}
                          className={`flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-300 ${isActive
                            ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-400 shadow-md scale-[1.02]'
                            : 'bg-white/50 dark:bg-slate-800/50 border-border-color hover:border-sky-400/50 hover:shadow-lg'
                            }`}
                        >
                          <span className={`text-lg font-semibold ${isActive ? 'text-sky-600 dark:text-sky-300' : 'text-text-primary'}`}>
                            {label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
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
                        setSkillpilotId(event.target.value.trim())
                        setHasCheckedId(false) // Hide dropdown while typing
                      }}
                      onBlur={() => checkLearner(skillpilotId.trim())}
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
                    />

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={(role === 'learner' && !skillpilotId.trim()) || loading || !selectedLandscapeId}
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
