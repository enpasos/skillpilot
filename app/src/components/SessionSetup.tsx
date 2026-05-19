import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { CurriculumDropdown } from './CurriculumDropdown'
import { ThemeToggle } from './ThemeToggle'
import type { LandscapeSummary } from './CurriculumDropdown'
import { Save, ArrowRight, Github, Trophy, ShieldCheck, Send, MessageCircle, Compass, Wrench, ExternalLink, KeyRound, LockKeyhole, UserPlus, Trash2 } from 'lucide-react'


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
import { getLegalWaiverCopy } from '../utils/legalWaiverCopy'
import { getSkillpilotGptUrl } from '../utils/skillpilotGpt'
import { requestChatStart } from '../utils/chatStart'
import {
  deleteLocalSkillpilotLogin,
  listLocalSkillpilotLogins,
  loadLocalSkillpilotLogin,
  saveLocalSkillpilotLogin,
} from '../utils/localSkillpilotLogin'
import { normalizeTrainerLandscapeId } from '../utils/trainerLandscapeContext'
import { sanitizeSkillpilotId } from '../utils/skillpilotId'
import {
  getLearnerPathToken,
  getLearnerSelectedLandscapeId,
  getStoredLandscapeIdForRole,
  normalizeLearnerLandscapeId,
} from '../utils/learnerProfile'

export const SessionSetup: React.FC<SessionSetupProps> = ({ role, setRole, skillpilotId, setSkillpilotId, onStart }) => {
  const t = useTranslation()
  const { language } = useLanguage()
  const legalCopy = getLegalWaiverCopy(language === 'en' ? 'en' : 'de')
  const isPublicSkillpilot =
    typeof window !== 'undefined' && /(^|\.)skillpilot\.com$/i.test(window.location.hostname)
  const [selectedLandscapeId, setSelectedLandscapeId] = useState<string>(() => {
    return getStoredLandscapeIdForRole(role)
  })
  // Use location (ensure import is added)
  const location = useLocation()

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const deepLinkCurriculum = params.get('curriculum') || params.get('landscape') || params.get('l')
    const deepLinkId = params.get('skillpilotId') || params.get('id')
    const pathToken = sanitizeSkillpilotId(getLearnerPathToken(location.pathname))
    const sanitizedDeepLinkId = sanitizeSkillpilotId(deepLinkId)
    const deepLinkGoal = params.get('goal') || params.get('g') || (pathToken && pathToken !== sanitizedDeepLinkId ? pathToken : '')

    if (deepLinkCurriculum && deepLinkCurriculum !== selectedLandscapeId) {
      setSelectedLandscapeId(role === 'trainer'
        ? normalizeTrainerLandscapeId(deepLinkCurriculum)
        : normalizeLearnerLandscapeId(deepLinkCurriculum))
    }

    if (deepLinkId) {
      const id = sanitizedDeepLinkId;
      if (skillpilotId !== id) {
        setSkillpilotId(id);
      }
      setRole('learner');
      checkLearner(id);
      setShowLogin(true);

      if (deepLinkCurriculum) {
        onStart(id, normalizeLearnerLandscapeId(deepLinkCurriculum), 'learner', deepLinkGoal || undefined);
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
  const [savedLoginProfiles, setSavedLoginProfiles] = useState(() => listLocalSkillpilotLogins())
  const [storedLoginName, setStoredLoginName] = useState(() => listLocalSkillpilotLogins()[0]?.name || '')
  const [storedLoginPassword, setStoredLoginPassword] = useState('')
  const [localLoginName, setLocalLoginName] = useState('')
  const [localLoginPassword, setLocalLoginPassword] = useState('')
  const [localLoginStatus, setLocalLoginStatus] = useState<'idle' | 'saving' | 'saved' | 'loading' | 'loaded' | 'failed'>('idle')
  const [localLoginError, setLocalLoginError] = useState('')
  const [legalAccepted, setLegalAccepted] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('skillpilot_legal_waiver_accepted') === 'true'
  })
  const [legalChecked, setLegalChecked] = useState(false)
  const [chatPromptCopyState, setChatPromptCopyState] = useState<'idle' | 'failed'>('idle')
  const [chatStartLoading, setChatStartLoading] = useState(false)

  const refreshSavedLoginProfiles = () => {
    const profiles = listLocalSkillpilotLogins()
    setSavedLoginProfiles(profiles)
    setStoredLoginName(prev => (prev && profiles.some(profile => profile.name === prev)) ? prev : profiles[0]?.name || '')
  }

  const resetTransientSetupState = (clearSkillpilotId = false) => {
    setError(null)
    setSelectedLandscapeId('')
    setAvailableCurricula([])
    setHasCheckedId(false)
    setChatPromptCopyState('idle')
    setChatStartLoading(false)
    setLocalLoginStatus('idle')
    setLocalLoginError('')
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
      const sanitizedId = sanitizeSkillpilotId(String(id))
      setSkillpilotId(sanitizedId)
      if (!localLoginName) {
        setLocalLoginName('Mein SkillPilot')
      }
      setChatPromptCopyState('idle')

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
    const sanitizedId = sanitizeSkillpilotId(id)
    if (!sanitizedId) {
      setSelectedLandscapeId('')
      setAvailableCurricula([])
      setHasCheckedId(false)
      return
    }
    setLoading(true)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${sanitizedId}` : `/api/ui/learners/${sanitizedId}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json() as Record<string, unknown>
        const learnerLandscapeId = getLearnerSelectedLandscapeId(data)
        if (learnerLandscapeId) {
          setSelectedLandscapeId(learnerLandscapeId)
        }
      }
    } catch {
      // Ignore errors, just means we can't pre-fill
    } finally {
      setHasCheckedId(true)
      setLoading(false)
    }
  }

  const persistLearnerStart = (effectiveId: string) => {
    const sanitizedId = sanitizeSkillpilotId(effectiveId)
    if (!sanitizedId) return ''

    localStorage.setItem('skillpilot_id', sanitizedId)
    localStorage.setItem('skillpilot_role', 'learner')
    try {
      sessionStorage.setItem('skillpilot_ui_session_id', globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`)
    } catch {
      // Session marker is only a browser-local convenience.
    }

    if (!selectedLandscapeId) return ''

    const normalizedLandscapeId = normalizeLearnerLandscapeId(selectedLandscapeId)
    if (!normalizedLandscapeId) return ''

    localStorage.setItem('skillpilot_learner_landscape', normalizedLandscapeId)
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${sanitizedId}/curriculum` : `/api/ui/learners/${sanitizedId}/curriculum`
      fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumId: normalizedLandscapeId })
      }).catch(e => console.error('Failed to save curriculum silently', e))
    } catch (e) {
      console.error('Failed to initiate save curriculum', e)
    }
    return normalizedLandscapeId
  }

  const handleLoadLocalLogin = async () => {
    setLocalLoginStatus('loading')
    setLocalLoginError('')
    try {
      const payload = await loadLocalSkillpilotLogin(storedLoginName, storedLoginPassword)
      const sanitizedId = sanitizeSkillpilotId(payload.skillpilotId)
      setRole('learner')
      setSkillpilotId(sanitizedId)
      localStorage.setItem('skillpilot_id', sanitizedId)
      localStorage.setItem('skillpilot_role', 'learner')
      if (payload.selectedLandscapeId) {
        const normalizedLandscapeId = normalizeLearnerLandscapeId(payload.selectedLandscapeId)
        setSelectedLandscapeId(normalizedLandscapeId)
        if (normalizedLandscapeId) {
          localStorage.setItem('skillpilot_learner_landscape', normalizedLandscapeId)
        }
      }
      setStoredLoginPassword('')
      setLocalLoginName(storedLoginName)
      setHasCheckedId(true)
      await checkLearner(sanitizedId)
      setLocalLoginStatus('loaded')
    } catch (err) {
      setLocalLoginStatus('failed')
      setLocalLoginError((err as Error).message)
    }
  }

  const handleSaveLocalLogin = async () => {
    const sanitizedId = sanitizeSkillpilotId(skillpilotId)
    if (!sanitizedId) return
    setLocalLoginStatus('saving')
    setLocalLoginError('')
    try {
      await saveLocalSkillpilotLogin(localLoginName, localLoginPassword, {
        skillpilotId: sanitizedId,
        selectedLandscapeId: selectedLandscapeId ? normalizeLearnerLandscapeId(selectedLandscapeId) : undefined,
      })
      setLocalLoginPassword('')
      refreshSavedLoginProfiles()
      setLocalLoginStatus('saved')
    } catch (err) {
      setLocalLoginStatus('failed')
      setLocalLoginError((err as Error).message)
    }
  }

  const handleDeleteLocalLogin = () => {
    if (!storedLoginName) return
    deleteLocalSkillpilotLogin(storedLoginName)
    setStoredLoginPassword('')
    setLocalLoginStatus('idle')
    setLocalLoginError('')
    refreshSavedLoginProfiles()
  }

  const handleAcceptLegalWaiver = () => {
    localStorage.setItem('skillpilot_legal_waiver_accepted', 'true')
    setLegalAccepted(true)
  }

  const createChatStartPrompt = async (effectiveId: string) => {
    const sanitizedId = sanitizeSkillpilotId(effectiveId)
    if (!sanitizedId) return ''
    const normalizedLandscapeId = persistLearnerStart(sanitizedId)
    if (!normalizedLandscapeId) return ''

    setChatStartLoading(true)
    setChatPromptCopyState('idle')
    try {
      const chatStart = await requestChatStart({
        skillpilotId: sanitizedId,
        language,
        selectedCurriculum: normalizedLandscapeId,
        client: 'web-start',
      })
      return chatStart.prompt
    } finally {
      setChatStartLoading(false)
    }
  }

  const handleOpenChatGpt = async () => {
    const effectiveId = sanitizeSkillpilotId(skillpilotId)
    if (!effectiveId) return
    const chatWindow = window.open('', '_blank')
    try {
      const prompt = await createChatStartPrompt(effectiveId)
      const url = getSkillpilotGptUrl(language, prompt)
      if (chatWindow) {
        chatWindow.opener = null
        chatWindow.location.href = url
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      if (chatWindow) {
        chatWindow.close()
      }
      setChatPromptCopyState('failed')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (role === 'learner' && !sanitizeSkillpilotId(skillpilotId)) return

    const effectiveId = role === 'learner' ? sanitizeSkillpilotId(skillpilotId) : ''

    if (role === 'learner') {
      persistLearnerStart(effectiveId)
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
      setSelectedLandscapeId(getStoredLandscapeIdForRole(role))
    } else if (role === 'explorer') {
      setSelectedLandscapeId('')
    }
  }, [role])

  const openLearnerStart = () => {
    setRole('learner')
    resetTransientSetupState()
    const id = localStorage.getItem('skillpilot_id')
    const savedLandscape = getStoredLandscapeIdForRole('learner')
    if (id) {
      const sanitizedId = sanitizeSkillpilotId(id)
      setSkillpilotId(sanitizedId)
      if (savedLandscape) {
        setSelectedLandscapeId(savedLandscape)
        setHasCheckedId(true)
      }
      checkLearner(sanitizedId)
    }
    setShowLogin(true)
  }

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

      <div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl">
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

        <div className="w-full space-y-5">
          {!showLogin ? (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              {/* Primary start: shared ID flow for Cockpit and ChatGPT */}
              <button
                type="button"
                onClick={openLearnerStart}
                aria-label={t.startPage.cards.gpt.cta}
                className="group relative block w-full overflow-hidden rounded-xl border border-border-color bg-white/50 p-5 text-left transition-all duration-300 hover:border-sky-300/70 hover:shadow-md dark:bg-slate-800/50 dark:hover:border-sky-500/40"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      {t.startPage.cards.gpt.title}
                      <MessageCircle size={18} className="text-sky-500" />
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {t.startPage.cards.gpt.description}
                    </p>
                    {t.startPage.banner && (
                      <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-text-secondary">
                        <ShieldCheck className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-300" size={16} />
                        <div className="whitespace-pre-line">
                          {t.startPage.banner.text.split('**').map((part, i) =>
                            i % 2 === 1 ? <span key={i} className="font-bold text-text-primary">{part}</span> : part
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <ArrowRight className="shrink-0 text-text-secondary transition-all group-hover:translate-x-1 group-hover:text-sky-500" />
                </div>
              </button>

              <div className="w-full">
                <AudioPlayer key={language} compact />
              </div>

              {/* Card 3: Curricula */}
              <Link
                to="/curricula"
                className="group relative block overflow-hidden rounded-xl border border-border-color bg-white/50 p-5 transition-all duration-300 hover:border-amber-400/50 hover:shadow-md dark:bg-slate-800/50"
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
                  <div className="rounded-xl border border-border-color bg-white/70 p-4 shadow-sm dark:bg-slate-900/50">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                        1
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text-primary">{t.startPage.login.loginTitle}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{t.startPage.login.loginText}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {!legalAccepted && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100">
                          <div className="flex items-start gap-3">
                            <ShieldCheck size={18} className="mt-1 shrink-0 text-amber-600 dark:text-amber-300" />
                            <div className="min-w-0">
                              <div className="prose prose-sm max-w-none text-amber-950 dark:prose-invert dark:text-amber-100">
                                <ReactMarkdown>{legalCopy.shortDisclaimer}</ReactMarkdown>
                              </div>
                              <p className="mt-2 text-xs leading-relaxed">
                                {legalCopy.detailsPrefix}
                                <Link to="/legal" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-700 underline dark:text-sky-300">
                                  {legalCopy.detailsLinkLabel}
                                </Link>
                                {legalCopy.detailsSuffix}
                              </p>
                              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs font-semibold">
                                <input
                                  type="checkbox"
                                  checked={legalChecked}
                                  onChange={event => setLegalChecked(event.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded border-amber-300 accent-sky-600"
                                />
                                <span>{legalCopy.acceptanceLabel}</span>
                              </label>
                              <button
                                type="button"
                                onClick={handleAcceptLegalWaiver}
                                disabled={!legalChecked}
                                className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
                              >
                                {legalCopy.confirmButton}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-3 dark:border-sky-500/20 dark:bg-sky-950/20">
                        <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                          <UserPlus size={16} className="text-sky-600 dark:text-sky-300" />
                          {t.startPage.login.newLoginTitle}
                        </p>
                        <button
                          type="button"
                          onClick={requestNewId}
                          disabled={!legalAccepted || loading}
                          className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading ? t.startPage.login.checking : t.startPage.login.requestNewId}
                        </button>
                      </div>

                      {savedLoginProfiles.length > 0 && (
                        <div className="rounded-lg border border-border-color bg-white p-3 dark:bg-slate-950/40">
                          <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                            <LockKeyhole size={16} className="text-emerald-600 dark:text-emerald-300" />
                            {t.startPage.login.storedLoginTitle}
                          </p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <select
                              value={storedLoginName}
                              onChange={event => setStoredLoginName(event.target.value)}
                              className="min-h-10 rounded border border-border-color bg-input-bg px-3 py-2 text-sm text-text-primary"
                              aria-label={t.startPage.login.storedProfileLabel}
                            >
                              {savedLoginProfiles.map(profile => (
                                <option key={profile.name} value={profile.name}>{profile.name}</option>
                              ))}
                            </select>
                            <input
                              type="password"
                              value={storedLoginPassword}
                              onChange={event => setStoredLoginPassword(event.target.value)}
                              className="min-h-10 rounded border border-border-color bg-input-bg px-3 py-2 text-sm text-text-primary"
                              placeholder={t.startPage.login.passwordLabel}
                            />
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                            <button
                              type="button"
                              onClick={handleLoadLocalLogin}
                              disabled={!legalAccepted || !storedLoginName || !storedLoginPassword || localLoginStatus === 'loading'}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <KeyRound size={15} />
                              {localLoginStatus === 'loading' ? t.startPage.login.loadingStoredLogin : t.startPage.login.loadStoredLogin}
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteLocalLogin}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border-color px-4 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-300"
                              title={t.startPage.login.deleteStoredLogin}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="rounded-lg border border-border-color bg-white p-3 dark:bg-slate-950/40">
                        <div className="flex items-center justify-between">
                          <label htmlFor="skillpilotIdInput" className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                            <KeyRound size={16} className="text-slate-500" />
                            {t.startPage.login.directIdTitle}
                          </label>
                        </div>
                        <input
                          id="skillpilotIdInput"
                          type="text"
                          value={skillpilotId}
                          onChange={(event) => {
                            setSkillpilotId(sanitizeSkillpilotId(event.target.value))
                            resetTransientSetupState()
                          }}
                          onBlur={() => {
                            if (legalAccepted && !hasCheckedId) {
                              checkLearner(sanitizeSkillpilotId(skillpilotId))
                            }
                          }}
                          className="mt-2 w-full rounded border border-border-color bg-input-bg px-3 py-2 text-sm text-text-primary font-mono focus:border-sky-400 transition-colors"
                          placeholder={t.startPage.login.idLabel}
                          required
                        />
                        <span className="mt-2 block rounded border border-amber-200 bg-amber-100 px-2 py-1 text-[11px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
                          {t.startPage.login.idWarning}
                        </span>
                        {error && <span className="mt-1 block text-[11px] text-rose-300">Fehler: {error}</span>}

                        {sanitizeSkillpilotId(skillpilotId).length > 0 && !hasCheckedId && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => checkLearner(sanitizeSkillpilotId(skillpilotId))}
                              disabled={!legalAccepted || loading}
                              className="w-full rounded-full border border-sky-500/50 bg-sky-600/20 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:border-sky-400 hover:bg-sky-600/30 dark:text-sky-100"
                            >
                              {loading ? t.startPage.login.checking : t.startPage.login.checkButton}
                            </button>
                          </div>
                        )}
                      </div>

                      {sanitizeSkillpilotId(skillpilotId) && (
                        <details className="rounded-lg border border-border-color bg-slate-50 p-3 text-xs text-text-secondary dark:bg-slate-950/30">
                          <summary className="cursor-pointer font-semibold text-text-primary">
                            {t.startPage.login.saveLocalLoginTitle}
                          </summary>
                          <p className="mt-2 leading-relaxed">{t.startPage.login.saveLocalLoginHint}</p>
                          <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <input
                              type="text"
                              value={localLoginName}
                              onChange={event => setLocalLoginName(event.target.value)}
                              className="min-h-10 rounded border border-border-color bg-input-bg px-3 py-2 text-sm text-text-primary"
                              placeholder={t.startPage.login.loginNameLabel}
                            />
                            <input
                              type="password"
                              value={localLoginPassword}
                              onChange={event => setLocalLoginPassword(event.target.value)}
                              className="min-h-10 rounded border border-border-color bg-input-bg px-3 py-2 text-sm text-text-primary"
                              placeholder={t.startPage.login.passwordLabel}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveLocalLogin}
                            disabled={!legalAccepted || !localLoginName.trim() || !localLoginPassword.trim() || localLoginStatus === 'saving'}
                            className="mt-2 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-border-color bg-white px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900"
                          >
                            <LockKeyhole size={15} />
                            {localLoginStatus === 'saving' ? t.startPage.login.savingLocalLogin : t.startPage.login.saveLocalLogin}
                          </button>
                        </details>
                      )}

                      {localLoginStatus === 'saved' && (
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t.startPage.login.localLoginSaved}</p>
                      )}
                      {localLoginStatus === 'loaded' && (
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t.startPage.login.localLoginLoaded}</p>
                      )}
                      {localLoginStatus === 'failed' && (
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                          {t.startPage.login.localLoginFailed}{localLoginError ? ` ${localLoginError}` : ''}
                        </p>
                      )}
                    </div>
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
                  <div className="rounded-xl border border-border-color bg-white/70 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-slate-900/50">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                        2
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text-primary">{t.startPage.login.curriculumStepTitle}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{t.startPage.login.curriculumStepText}</p>
                      </div>
                    </div>
                    <label className="text-[11px] text-text-secondary block mb-1">
                      {role === 'learner' && selectedLandscapeId ? t.startPage.login.curriculumLabel.yours : t.startPage.login.curriculumLabel.select}
                    </label>
                    <CurriculumDropdown
                      currentLandscapeId={selectedLandscapeId}
                      onSelect={setSelectedLandscapeId}
                      landscapes={availableCurricula}
                      showCompatibilityViews={false}
                    />

                    {role !== 'learner' && (
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={!selectedLandscapeId}
                          className="w-full rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 hover:border-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t.startPage.login.dashboardButton}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {role === 'learner' && skillpilotId.length > 0 && hasCheckedId && (
                  <div className="rounded-xl border border-border-color bg-white/70 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 dark:bg-slate-900/50">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                        3
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-text-primary">{t.startPage.login.startStepTitle}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{t.startPage.login.startStepText}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-lg border border-border-color bg-slate-50 p-3 text-xs leading-relaxed text-text-secondary dark:bg-slate-950/40">
                        <p className="font-semibold text-text-primary">{t.startPage.login.startPromptLabel}</p>
                        <p className="mt-1">{t.startPage.login.startPromptHint}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenChatGpt}
                        disabled={!sanitizeSkillpilotId(skillpilotId) || !selectedLandscapeId || chatStartLoading}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-sky-400 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <MessageCircle size={16} />
                        {t.startPage.login.openChatGpt}
                        <ExternalLink size={14} />
                      </button>
                      <div>
                        <button
                          type="submit"
                          disabled={!sanitizeSkillpilotId(skillpilotId) || !selectedLandscapeId}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border-color bg-white px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800"
                        >
                          <Compass size={16} />
                          {t.startPage.login.cockpitButton}
                        </button>
                      </div>
                      {chatPromptCopyState === 'failed' && (
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                          {t.startPage.login.startPromptCopyFailed}
                        </p>
                      )}
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
