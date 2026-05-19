import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  Keyboard,
  LockKeyhole,
  MessageCircle,
  Mic,
  Smartphone,
  Trash2,
} from 'lucide-react'

import { useLanguage } from '../contexts/LanguageContext'
import { trackCampaignEvent } from '../utils/campaignTracking'
import { sanitizeSkillpilotId } from '../utils/skillpilotId'
import { getSkillpilotGptUrl } from '../utils/skillpilotGpt'
import { requestChatStart } from '../utils/chatStart'

const STORAGE_KEY = 'skillpilot_id'
const ROLE_STORAGE_KEY = 'skillpilot_role'
const LANGUAGE_STORAGE_KEY = 'skillpilot_lang'
const MOBI_IMPORTED_AT_KEY = 'skillpilot_mobi_imported_at'

type CopyState = 'idle' | 'prompt' | 'id' | 'failed'

const readStoredSkillpilotId = () => {
  try {
    return sanitizeSkillpilotId(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return ''
  }
}

const decodeFragmentValue = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const extractSkillpilotIdFromValue = (value: string) => {
  const trimmedValue = value.trim()
  if (!trimmedValue) return ''

  const hashIndex = trimmedValue.indexOf('#')
  const rawCandidate = hashIndex >= 0 ? trimmedValue.slice(hashIndex + 1) : trimmedValue
  const candidate = rawCandidate.trim()
  if (!candidate) return ''

  if (!candidate.includes('=')) {
    return sanitizeSkillpilotId(decodeFragmentValue(candidate))
  }

  const params = new URLSearchParams(candidate)
  return sanitizeSkillpilotId(
    params.get('id')
      || params.get('skillpilotId')
      || params.get('skillpilot_id')
      || params.get('token')
      || '',
  )
}

const saveSkillpilotIdLocally = (id: string) => {
  const sanitizedId = sanitizeSkillpilotId(id)
  if (!sanitizedId) return ''
  window.localStorage.setItem(STORAGE_KEY, sanitizedId)
  window.localStorage.setItem(ROLE_STORAGE_KEY, 'learner')
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de')
  window.localStorage.setItem(MOBI_IMPORTED_AT_KEY, new Date().toISOString())
  return sanitizedId
}

const clearSkillpilotIdLocally = () => {
  window.localStorage.removeItem(STORAGE_KEY)
  window.localStorage.removeItem(ROLE_STORAGE_KEY)
  window.localStorage.removeItem(MOBI_IMPORTED_AT_KEY)
}

const copyText = async (value: string) => {
  if (!value || !navigator.clipboard?.writeText) return false
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

const maskId = (id: string) => {
  if (id.length <= 14) return id
  return `${id.slice(0, 8)}...${id.slice(-6)}`
}

export const MobiStartView: React.FC = () => {
  const { setLanguage } = useLanguage()
  const [skillpilotId, setSkillpilotId] = useState(() => readStoredSkillpilotId())
  const [manualId, setManualId] = useState('')
  const [showId, setShowId] = useState(false)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [startPrompt, setStartPrompt] = useState('')
  const [startLoading, setStartLoading] = useState(false)
  const [idLoading, setIdLoading] = useState(false)

  useEffect(() => {
    setLanguage('de')
  }, [setLanguage])

  useEffect(() => {
    trackCampaignEvent('page_view', { start: 'mobi', surface: 'mobile-start' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveManualId = () => {
    const storedId = saveSkillpilotIdLocally(extractSkillpilotIdFromValue(manualId))
    if (!storedId) return
    setSkillpilotId(storedId)
    setManualId('')
  }

  const handleCreateId = async () => {
    setIdLoading(true)
    setCopyState('idle')
    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners` : '/api/ui/learners'
      const res = await fetch(url, { method: 'POST' })
      if (!res.ok) throw new Error(`Server ${res.status}`)
      const data = await res.json()
      const id = sanitizeSkillpilotId(String(data?.state?.skillpilotId || data?.skillpilotId || data?.learnerId || data?.id || ''))
      const storedId = saveSkillpilotIdLocally(id)
      if (storedId) {
        setSkillpilotId(storedId)
        setManualId('')
      }
    } catch {
      setCopyState('failed')
    } finally {
      setIdLoading(false)
    }
  }

  const handleCopyPrompt = async () => {
    try {
      const prompt = await createStartPrompt()
      const copied = await copyText(prompt)
      setCopyState(copied ? 'prompt' : 'failed')
      if (!copied) return
      trackCampaignEvent('gpt_prompt_copied', { start: 'mobi', location: 'mobile-start' })
    } catch {
      setCopyState('failed')
    }
  }

  const handleCopyId = async () => {
    const copied = await copyText(skillpilotId)
    setCopyState(copied ? 'id' : 'failed')
  }

  const createStartPrompt = async () => {
    if (!skillpilotId) return ''
    setStartLoading(true)
    setCopyState('idle')
    try {
      const chatStart = await requestChatStart({
        skillpilotId,
        language: 'de',
        client: 'mobi-start',
      })
      setStartPrompt(chatStart.prompt)
      return chatStart.prompt
    } finally {
      setStartLoading(false)
    }
  }

  const handleOpenGpt = async () => {
    trackCampaignEvent('gpt_start_clicked', { start: 'mobi', location: 'mobile-start' })
    const chatWindow = window.open('', '_blank')
    try {
      const prompt = await createStartPrompt()
      const url = getSkillpilotGptUrl('de', prompt)
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
      setCopyState('failed')
    }
  }

  const handleDeleteId = () => {
    clearSkillpilotIdLocally()
    setSkillpilotId('')
    setManualId('')
    setShowId(false)
    setCopyState('idle')
    setStartPrompt('')
    setIdLoading(false)
  }

  const hasManualId = extractSkillpilotIdFromValue(manualId).length > 0

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-950 dark:bg-[#111827] dark:text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <main className="flex flex-1 flex-col justify-center gap-5 py-3">
          <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                <Smartphone size={14} />
                Handy-Start für Schüler
              </div>
              <div>
                <h1 className="max-w-2xl text-4xl font-black tracking-normal text-slate-950 dark:text-white sm:text-5xl">
                  Dein Mathe- und Physik-Tutor fürs Gymnasium
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                  Mathe und Physik von Klasse 5 bis Abi. Für alle Bundesländer.
                  Weitere Fächer sind in Arbeit. Direkt im SkillPilotGPT auf dem Handy.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <GraduationCap className="text-emerald-600 dark:text-emerald-300" size={22} />
                  <p className="mt-2 text-sm font-bold">Klasse 5 bis Abi</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <Mic className="text-sky-600 dark:text-sky-300" size={22} />
                  <p className="mt-2 text-sm font-bold">Diktieren statt tippen</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <Camera className="text-violet-600 dark:text-violet-300" size={22} />
                  <p className="mt-2 text-sm font-bold">Rechnung zeigen</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
                  <AlertTriangle size={21} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950 dark:text-white">Wichtig am Handy</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Du kannst deine Antwort in die normale ChatGPT-Texteingabe diktieren. Bitte nicht in den separaten
                    Voice Mode wechseln, weil SkillPilot dort aktuell deinen Lernstand nicht lesen oder speichern kann.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100">
                  <CheckCircle2 size={19} className="shrink-0" />
                  <span>Normales Mikrofon in der Texteingabe: OK</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
                  <AlertTriangle size={19} className="shrink-0" />
                  <span>Voice Mode Sprachbildschirm: noch nicht verwenden</span>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black">Deine SkillPilot-ID</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Die ID bleibt lang, weil sie dein privater Zugang zum Lernstand ist. Diese Seite speichert
                    sie nur auf diesem Handy.
                  </p>
                </div>
              </div>

              {skillpilotId ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-normal text-slate-500 dark:text-slate-400">
                        Gespeicherte ID
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowId((value) => !value)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        aria-label={showId ? 'ID verbergen' : 'ID anzeigen'}
                        title={showId ? 'ID verbergen' : 'ID anzeigen'}
                      >
                        {showId ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="mt-2 break-all font-mono text-sm text-slate-900 dark:text-slate-100">
                      {showId ? skillpilotId : maskId(skillpilotId)}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 hover:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <Copy size={15} />
                      ID kopieren
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteId}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-900 hover:border-rose-300 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-100"
                    >
                      <Trash2 size={15} />
                      Löschen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <label htmlFor="mobi-skillpilot-id" className="text-sm font-bold">
                    ID einmalig einfügen
                  </label>
                  <textarea
                    id="mobi-skillpilot-id"
                    value={manualId}
                    onChange={(event) => setManualId(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 font-mono text-sm text-slate-950 outline-none transition-colors focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    placeholder="SkillPilot-ID hier einfügen"
                  />
                  <button
                    type="button"
                    onClick={handleSaveManualId}
                    disabled={!hasManualId}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <LockKeyhole size={15} />
                    Auf diesem Handy speichern
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black">SkillPilotGPT starten</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Am einfachsten: GPT starten. Deine SkillPilot-ID bleibt im Browser, ChatGPT bekommt nur einen kurzlebigen Startcode. Danach antwortest du dem Tutor
                    per Diktat, kurzem Text oder mit einem Bild deiner Rechnung.
                  </p>
                </div>
              </div>

              {skillpilotId ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                    <pre className="whitespace-pre-wrap break-words text-xs leading-5 text-slate-700 dark:text-slate-300">{startPrompt}</pre>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      disabled={startLoading}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-500"
                    >
                      <Copy size={15} />
                      Startcode kopieren
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenGpt}
                      disabled={startLoading}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-950 hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      GPT starten
                      <ExternalLink size={15} />
                    </button>
                  </div>
                  <Link
                    to="/learner"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-900 hover:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <Smartphone size={15} />
                    Cockpit auf diesem Handy öffnen
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={handleCreateId}
                    disabled={idLoading}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    SkillPilot-ID erstellen
                  </button>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Danach erzeugt SkillPilot hier einen kurzlebigen Startcode für den GPT.
                  </p>
                </div>
              )}

              {copyState === 'prompt' && (
                <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Startcode kopiert.</p>
              )}
              {copyState === 'id' && (
                <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">ID kopiert.</p>
              )}
              {copyState === 'failed' && (
                <p className="mt-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
                  Kopieren wurde vom Browser blockiert. Text bitte markieren und manuell kopieren.
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <Keyboard className="mt-0.5 shrink-0 text-slate-700 dark:text-slate-200" size={18} />
              <span>Dem Tutor antworten: diktieren oder kurz eintippen.</span>
            </div>
            <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <Camera className="mt-0.5 shrink-0 text-slate-700 dark:text-slate-200" size={18} />
              <span>Auf Papier rechnen und ein Bild der Lösung senden.</span>
            </div>
            <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <LockKeyhole className="mt-0.5 shrink-0 text-slate-700 dark:text-slate-200" size={18} />
              <span>Kein Name, keine E-Mail, nur deine private ID.</span>
            </div>
          </section>
        </main>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>SkillPilot Mathe und Physik Gymnasium</span>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="hover:text-sky-600 dark:hover:text-sky-300">Datenschutz</Link>
            <Link to="/imprint" className="hover:text-sky-600 dark:hover:text-sky-300">Impressum</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
