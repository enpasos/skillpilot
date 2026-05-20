import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, Copy, ExternalLink, LayoutDashboard, MessageCircle, RefreshCcw, Send } from 'lucide-react'
import {
  ABI26_CAMPAIGN_SLUG,
  ABI26_FEEDBACK_URL,
  ABI26_FOCUS_GOAL_BY_LEVEL,
  ABI26_ROOT_CURRICULUM_ID,
  ABI26_ROOT_FILTER_ID,
  ABI26_SCOPE_BY_LEVEL,
  buildAbi26CockpitUrl,
  buildAbi26PersonalCurriculumConfig,
  buildAbi26StartPrompt,
  extractAbi26CampaignContext,
  saveAbi26CampaignContext,
  type Abi26CourseLevel,
} from '../utils/abi26MatheCampaign'
import { trackCampaignEvent } from '../utils/campaignTracking'
import { useLanguage } from '../contexts/LanguageContext'
import { formatFilterDisplayLabel } from '../utils/filterLabels'
import { sanitizeSkillpilotId } from '../utils/skillpilotId'
import { requestChatStart } from '../utils/chatStart'
import { getSkillpilotGptUrl } from '../utils/skillpilotGpt'

const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

const TRACK_OPTIONS: Abi26CourseLevel[] = ['GK', 'LK']

const copyText = async (value: string) => {
  if (!value) return false
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export const Abi26MatheStartView: React.FC = () => {
  const { setLanguage } = useLanguage()
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const initialContext = useMemo(() => extractAbi26CampaignContext(params), [params])
  const requestedTrackRaw = params.get('courseLevel') || params.get('track') || params.get('f')
  const hasInvalidTrack = !!requestedTrackRaw && !TRACK_OPTIONS.includes((requestedTrackRaw || '').toUpperCase() as Abi26CourseLevel)

  const [courseLevel, setCourseLevel] = useState<Abi26CourseLevel>(initialContext.courseLevel)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skillpilotId, setSkillpilotId] = useState<string>('')
  const [copiedState, setCopiedState] = useState<'none' | 'id' | 'prompt'>('none')
  const [cockpitUrl, setCockpitUrl] = useState<string>('')
  const [startPrompt, setStartPrompt] = useState('')
  const [startLoading, setStartLoading] = useState(false)

  const context = useMemo(
    () => ({
      ...initialContext,
      courseLevel,
    }),
    [initialContext, courseLevel],
  )

  const courseLevelLabel = courseLevel === 'LK' ? 'Leistungskurs' : 'Grundkurs'

  useEffect(() => {
    // Campaign entry should always start in German.
    setLanguage('de')
  }, [setLanguage])

  useEffect(() => {
    trackCampaignEvent('page_view', {
      start: ABI26_CAMPAIGN_SLUG,
      source: context.source,
      campaign: context.campaign,
      medium: context.medium,
      courseLevel: context.courseLevel,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateId = async () => {
    setLoading(true)
    setError(null)
    setCopiedState('none')

    try {
      const createRes = await fetch(toApi('/api/ui/learners'), { method: 'POST' })
      if (!createRes.ok) {
        throw new Error(`ID-Service ist gerade nicht erreichbar (HTTP ${createRes.status}).`)
      }
      const created = await createRes.json()
      const id = sanitizeSkillpilotId(String(created?.state?.skillpilotId || created?.skillpilotId || created?.learnerId || created?.id || ''))
      if (!id) {
        throw new Error('Die SkillPilot-ID konnte nicht erzeugt werden. Bitte erneut versuchen.')
      }

      const selectedScopeId = ABI26_SCOPE_BY_LEVEL[courseLevel]
      const selectedFocusId = ABI26_FOCUS_GOAL_BY_LEVEL[courseLevel]

      const curriculumRes = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(id)}/curriculum`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumId: ABI26_ROOT_CURRICULUM_ID }),
      })
      if (!curriculumRes.ok) {
        throw new Error('Das Cockpit konnte nicht vorkonfiguriert werden (Curriculum).')
      }

      const scopeRes = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(id)}/scope`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalIds: [selectedScopeId] }),
      })
      if (!scopeRes.ok) {
        throw new Error('Das Cockpit konnte nicht vorkonfiguriert werden (Scope).')
      }

      const personalConfig = buildAbi26PersonalCurriculumConfig(courseLevel)

      const personalCurriculumRes = await fetch(
        toApi(`/api/ui/learners/${encodeURIComponent(id)}/personal-curriculum`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(personalConfig),
        },
      )
      if (!personalCurriculumRes.ok) {
        throw new Error('Das Cockpit konnte nicht vorkonfiguriert werden (Kursniveau).')
      }

      const activeGoalRes = await fetch(
        toApi(`/api/ui/learners/${encodeURIComponent(id)}/active-goal`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalId: selectedFocusId }),
        },
      )
      if (!activeGoalRes.ok) {
        throw new Error('Das Cockpit konnte nicht vorkonfiguriert werden (Fokus).')
      }

      localStorage.setItem('skillpilot_id', id)
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_learner_landscape', ABI26_ROOT_CURRICULUM_ID)
      localStorage.setItem('skillpilot_lang', 'de')
      saveAbi26CampaignContext({ ...context, skillpilotId: id })

      const url = buildAbi26CockpitUrl(context, id)
      setSkillpilotId(id)
      setCockpitUrl(url)

      trackCampaignEvent('id_created', {
        start: ABI26_CAMPAIGN_SLUG,
        source: context.source,
        campaign: context.campaign,
        medium: context.medium,
        courseLevel: context.courseLevel,
        scopeGoalId: selectedScopeId,
        focusGoalId: selectedFocusId,
      }, id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unbekannter Fehler'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = async () => {
    const copied = await copyText(skillpilotId)
    if (copied) setCopiedState('id')
  }

  const handleCopyPrompt = async () => {
    if (!skillpilotId) return
    setStartLoading(true)
    let prompt = ''
    try {
      const chatStart = await requestChatStart({
        skillpilotId,
        language: 'de',
        selectedCurriculum: ABI26_ROOT_CURRICULUM_ID,
        promptContext: buildAbi26StartPrompt(context),
        client: ABI26_CAMPAIGN_SLUG,
      })
      prompt = chatStart.prompt
      setStartPrompt(prompt)
    } catch {
      setStartLoading(false)
      return
    }
    setStartLoading(false)
    const copied = await copyText(prompt)
    if (!copied) return
    setCopiedState('prompt')
    trackCampaignEvent('gpt_prompt_copied', {
      start: ABI26_CAMPAIGN_SLUG,
      source: context.source,
      campaign: context.campaign,
      medium: context.medium,
      courseLevel: context.courseLevel,
      location: 'start-page',
    }, skillpilotId)
  }

  const handleGptStartClicked = async () => {
    if (!skillpilotId) return
    trackCampaignEvent('gpt_start_clicked', {
      start: ABI26_CAMPAIGN_SLUG,
      source: context.source,
      campaign: context.campaign,
      medium: context.medium,
      courseLevel: context.courseLevel,
      location: 'start-page',
    }, skillpilotId || undefined)
    const chatWindow = window.open('', '_blank')
    setStartLoading(true)
    try {
      const chatStart = await requestChatStart({
        skillpilotId,
        language: 'de',
        selectedCurriculum: ABI26_ROOT_CURRICULUM_ID,
        promptContext: buildAbi26StartPrompt(context),
        client: ABI26_CAMPAIGN_SLUG,
      })
      setStartPrompt(chatStart.prompt)
      const url = getSkillpilotGptUrl('de', chatStart.prompt)
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
    } finally {
      setStartLoading(false)
    }
  }

  const handleCockpitStartClicked = () => {
    if (!skillpilotId) return
    trackCampaignEvent('cockpit_opened', {
      start: ABI26_CAMPAIGN_SLUG,
      source: context.source,
      campaign: context.campaign,
      medium: context.medium,
      courseLevel: context.courseLevel,
      location: 'start-page',
    }, skillpilotId)
  }

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="rounded-lg border border-border-color bg-white/80 p-6 shadow-sm dark:bg-slate-900/70 sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/60 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-900/20 dark:text-sky-300">
            <Send size={14} />
            Hessen Mathematik Abi 2026
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
            Hessische Mathe-Abiaufgaben ausprobieren
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary">
            Wähle Grundkurs oder Leistungskurs. SkillPilot bereitet dir dann das Abi-2026-Klausurbeispiel
            vor, ohne Registrierung und ohne Namen oder E-Mail-Adresse.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <LayoutDashboard className="mt-1 shrink-0 text-sky-600 dark:text-sky-300" size={22} />
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Cockpit</h2>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  Deine Browser-Übersicht: Klausurbeispiel, Lernziel, Fortschritt und nächster sinnvoller Schritt.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MessageCircle className="mt-1 shrink-0 text-sky-600 dark:text-sky-300" size={22} />
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">SkillPilot Chat</h2>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  Der SkillPilot Lerncoach in ChatGPT: Fragen stellen, Rechenwege erklären lassen oder ein Foto deiner Lösung hochladen.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-5 text-sm text-text-secondary">
            Cockpit und Chat nutzen denselben anonymen Lernstand. ChatGPT bekommt dafuer nur einen kurzlebigen Startcode.
          </p>
          {hasInvalidTrack && (
            <p className="mt-3 rounded-lg border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200">
              Ungültiger Kurs-Parameter erkannt. Es wurde automatisch auf <strong>GK</strong> zurückgesetzt.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border-color bg-white/80 p-6 shadow-sm dark:bg-slate-900/70">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <BookOpenCheck size={22} className="text-sky-600 dark:text-sky-300" />
            Kursniveau wählen
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Die Aufgabe ist fest voreingestellt: das hessische Abi-2026-Klausurbeispiel 1.
            Du wählst hier nur, ob du mit der GK- oder LK-Version starten willst.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span className="rounded-full border border-border-color px-2 py-1">{formatFilterDisplayLabel(ABI26_ROOT_FILTER_ID, 'de')}</span>
            <span className="rounded-full border border-border-color px-2 py-1">Mathematik</span>
            <span className="rounded-full border border-border-color px-2 py-1">Abi 2026</span>
            <span className="rounded-full border border-border-color px-2 py-1">Klausurbeispiel 1</span>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Kursniveau</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {TRACK_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCourseLevel(option)}
                  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                    courseLevel === option
                      ? 'border-sky-500 bg-sky-600 text-white shadow-sm'
                      : 'border-border-color bg-white text-text-primary hover:border-sky-400 dark:bg-slate-800'
                  }`}
                >
                  <span className="block font-bold">{option}</span>
                  <span className={`mt-1 block text-xs ${courseLevel === option ? 'text-sky-50' : 'text-text-secondary'}`}>
                    {option === 'LK' ? 'Leistungskurs-Aufgaben' : 'Grundkurs-Aufgaben'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateId}
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-sky-400 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCcw size={16} className="animate-spin" />
                Start wird vorbereitet ...
              </>
            ) : (
              <>
                Kostenlosen Start vorbereiten
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 rounded-lg border border-rose-300/40 bg-rose-50 px-3 py-3 text-sm text-rose-900 dark:border-rose-500/30 dark:bg-rose-900/20 dark:text-rose-200">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleCreateId}
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold hover:bg-rose-100 dark:border-rose-400/40 dark:hover:bg-rose-900/40"
              >
                <RefreshCcw size={12} />
                Erneut versuchen
              </button>
            </div>
          )}

          {skillpilotId && (
            <div className="mt-4 space-y-3 rounded-lg border border-border-color bg-slate-50 p-4 dark:bg-slate-800/40">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dein Start ist vorbereitet</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Diese ID ist nur ein anonymer Schlüssel für deinen Lernstand. Du brauchst kein Konto.
                </p>
                <div className="mt-1 flex items-center justify-between gap-3 rounded-md border border-border-color bg-white px-3 py-2 font-mono text-sm dark:bg-slate-900">
                  <span className="break-all">{skillpilotId}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1 rounded border border-border-color px-2 py-1 text-xs hover:border-sky-400"
                  >
                    <Copy size={12} />
                    ID kopieren
                  </button>
                </div>
              </div>
              <div className="grid gap-2 text-xs text-text-secondary sm:grid-cols-2">
                <div className="rounded-md border border-border-color bg-white px-3 py-2 dark:bg-slate-900">
                  Hessen Mathematik
                </div>
                <div className="rounded-md border border-border-color bg-white px-3 py-2 dark:bg-slate-900">
                  {courseLevelLabel}
                </div>
                <div className="rounded-md border border-border-color bg-white px-3 py-2 dark:bg-slate-900">
                  Abi 2026 Klausurbeispiel 1
                </div>
                <div className="rounded-md border border-border-color bg-white px-3 py-2 dark:bg-slate-900">
                  Deutsch
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                Empfohlen: Cockpit öffnen, dann den Chat daneben starten. Du kannst deine Lösung auch auf Papier
                rechnen, fotografieren und im Chat hochladen.
              </p>
              {copiedState === 'id' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">ID wurde in die Zwischenablage kopiert.</p>
              )}
            </div>
          )}
        </div>

        {skillpilotId && (
          <div className="rounded-lg border border-border-color bg-white/80 p-6 shadow-sm dark:bg-slate-900/70">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
              <LayoutDashboard size={22} className="text-sky-600 dark:text-sky-300" />
              Cockpit öffnen
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Im Cockpit siehst du das voreingestellte Klausurbeispiel, dein aktuelles Lernziel und deinen Fortschritt.
              Es bleibt als Übersicht offen, während du im Chat Fragen stellst oder Lösungen prüfen lässt.
            </p>
            {cockpitUrl && (
              <a
                href={cockpitUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCockpitStartClicked}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:border-sky-400 hover:bg-sky-500"
              >
                Cockpit im neuen Tab öffnen
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {skillpilotId && (
          <div className="rounded-lg border border-border-color bg-white/80 p-6 shadow-sm dark:bg-slate-900/70">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
              <MessageCircle size={22} className="text-sky-600 dark:text-sky-300" />
              SkillPilot Chat öffnen
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Deine SkillPilot-ID bleibt im Browser. SkillPilot erzeugt einen kurzlebigen Startcode und öffnet damit den Chat.
            </p>
            {startPrompt && (
              <div className="mt-4 rounded-lg border border-border-color bg-slate-50 p-3 text-xs leading-relaxed text-text-secondary dark:bg-slate-800/40">
                <pre className="whitespace-pre-wrap font-mono">{startPrompt}</pre>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyPrompt}
                disabled={startLoading}
                className="inline-flex items-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:border-sky-400 hover:bg-sky-500"
              >
                <Copy size={14} />
                Startcode kopieren
              </button>
              <button
                type="button"
                onClick={handleGptStartClicked}
                disabled={startLoading}
                className="inline-flex items-center gap-2 rounded-full border border-border-color bg-white px-4 py-2 text-sm font-semibold text-text-primary hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800"
              >
                ChatGPT starten
                <ExternalLink size={14} />
              </button>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Im Chat kannst du dir Hinweise geben lassen, Teilaufgaben üben oder ein Foto deiner Rechnung hochladen.
            </p>
            {copiedState === 'prompt' && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Startcode wurde kopiert.</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-color bg-white/80 p-4 text-xs text-text-secondary dark:bg-slate-900/70">
          <span>Ohne Registrierung. Deine SkillPilot-ID enthält keinen Namen und keine E-Mail-Adresse.</span>
          <div className="flex items-center gap-3">
            <a href={ABI26_FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500">
              Problem melden
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
