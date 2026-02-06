import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Copy, ExternalLink, RefreshCcw, Send } from 'lucide-react'
import {
  ABI26_CAMPAIGN_SLUG,
  ABI26_FEEDBACK_URL,
  ABI26_FOCUS_GOAL_BY_LEVEL,
  ABI26_GPT_URL,
  ABI26_MATH_CURRICULUM_ID,
  ABI26_SCOPE_BY_LEVEL,
  buildAbi26CockpitUrl,
  buildAbi26StartPrompt,
  extractAbi26CampaignContext,
  saveAbi26CampaignContext,
  type Abi26CourseLevel,
} from '../utils/abi26MatheCampaign'
import { trackCampaignEvent } from '../utils/campaignTracking'

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

  const context = useMemo(
    () => ({
      ...initialContext,
      courseLevel,
    }),
    [initialContext, courseLevel],
  )

  const startPrompt = useMemo(
    () => (skillpilotId ? buildAbi26StartPrompt(skillpilotId, context) : ''),
    [skillpilotId, context],
  )

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

    const popup = window.open('about:blank', '_blank')

    try {
      const createRes = await fetch(toApi('/api/ui/learners'), { method: 'POST' })
      if (!createRes.ok) {
        throw new Error(`ID-Service ist gerade nicht erreichbar (HTTP ${createRes.status}).`)
      }
      const created = await createRes.json()
      const id = String(created?.state?.skillpilotId || created?.skillpilotId || created?.learnerId || created?.id || '').trim()
      if (!id) {
        throw new Error('Die SkillPilot-ID konnte nicht erzeugt werden. Bitte erneut versuchen.')
      }

      const selectedScopeId = ABI26_SCOPE_BY_LEVEL[courseLevel]
      const selectedFocusId = ABI26_FOCUS_GOAL_BY_LEVEL[courseLevel]

      const curriculumRes = await fetch(toApi(`/api/ui/learners/${encodeURIComponent(id)}/curriculum`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curriculumId: ABI26_MATH_CURRICULUM_ID }),
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

      localStorage.setItem('skillpilot_id', id)
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_learner_landscape', ABI26_MATH_CURRICULUM_ID)
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

      if (popup) {
        popup.location.href = url
      } else {
        const opened = window.open(url, '_blank')
        if (!opened) {
          window.location.assign(url)
        }
      }

      trackCampaignEvent('cockpit_opened', {
        start: ABI26_CAMPAIGN_SLUG,
        source: context.source,
        campaign: context.campaign,
        medium: context.medium,
        courseLevel: context.courseLevel,
      }, id)
    } catch (e) {
      popup?.close()
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
    const copied = await copyText(startPrompt)
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

  const handleGptStartClicked = () => {
    trackCampaignEvent('gpt_start_clicked', {
      start: ABI26_CAMPAIGN_SLUG,
      source: context.source,
      campaign: context.campaign,
      medium: context.medium,
      courseLevel: context.courseLevel,
      location: 'start-page',
    }, skillpilotId || undefined)
  }

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border-color bg-white/80 dark:bg-slate-900/70 p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/60 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/30 dark:bg-sky-900/20 dark:text-sky-300">
            <Send size={14} />
            Abi 2026 Mathe Hessen
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-4xl">
            In 60 Sekunden zu deinem Mathe-Abi-Cockpit
          </h1>
          <p className="mt-4 text-sm text-text-secondary leading-relaxed">
            Du erhältst sofort eine pseudonyme SkillPilot-ID ohne Registrierung, ein vorkonfiguriertes Cockpit
            für <strong>Gymnasiale Oberstufe Hessen, Mathematik</strong> und einen Startprompt für SkillPilot GPT
            in deinem persönlichen Kontext.
          </p>
          <p className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-600/30 dark:bg-emerald-900/20 dark:text-emerald-200">
            SkillPilot ist kostenlos, Open Source, Verbesserungsvorschläge willkommen.
          </p>
          {hasInvalidTrack && (
            <p className="mt-3 rounded-lg border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200">
              Ungültiger Kurs-Parameter erkannt. Es wurde automatisch auf <strong>GK</strong> zurückgesetzt.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border-color bg-white/80 dark:bg-slate-900/70 p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span className="rounded-full border border-border-color px-2 py-1">Bundesland: Hessen</span>
            <span className="rounded-full border border-border-color px-2 py-1">Bereich: Gymnasiale Oberstufe</span>
            <span className="rounded-full border border-border-color px-2 py-1">Fach: Mathematik</span>
            <span className="rounded-full border border-border-color px-2 py-1">Fokus: Abi 2026 / Klausurbeispiel 1</span>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Kursniveau</p>
            <div className="mt-2 flex gap-2">
              {TRACK_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setCourseLevel(option)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    courseLevel === option
                      ? 'border-sky-500 bg-sky-600 text-white'
                      : 'border-border-color bg-white text-text-primary hover:border-sky-400 dark:bg-slate-800'
                  }`}
                >
                  {option}
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
                SkillPilot-ID wird erstellt ...
              </>
            ) : (
              <>
                Kostenlose SkillPilot-ID erstellen
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
                <p className="text-xs uppercase tracking-wide text-text-secondary">Deine SkillPilot-ID</p>
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
              {cockpitUrl && (
                <a
                  href={cockpitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-500 dark:text-sky-400"
                >
                  Cockpit jetzt öffnen
                  <ExternalLink size={14} />
                </a>
              )}
              {copiedState === 'id' && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">ID wurde in die Zwischenablage kopiert.</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border-color bg-white/80 dark:bg-slate-900/70 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">So startest du mit SkillPilot GPT</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Kopiere den Startprompt mit deiner persönlichen SkillPilot-ID und starte danach den SkillPilot GPT.
          </p>
          <div className="mt-4 rounded-lg border border-border-color bg-slate-50 p-3 text-xs leading-relaxed text-text-secondary dark:bg-slate-800/40">
            {skillpilotId ? (
              <pre className="whitespace-pre-wrap font-mono">{startPrompt}</pre>
            ) : (
              <span>Der Startprompt wird verfügbar, sobald deine SkillPilot-ID erstellt wurde.</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyPrompt}
              disabled={!skillpilotId}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500 bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:border-sky-400 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Copy size={14} />
              Startprompt kopieren
            </button>
            <a
              href={ABI26_GPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGptStartClicked}
              className="inline-flex items-center gap-2 rounded-full border border-border-color bg-white px-4 py-2 text-sm font-semibold text-text-primary hover:border-sky-400 dark:bg-slate-800"
            >
              Mit SkillPilot GPT starten
              <ExternalLink size={14} />
            </a>
          </div>
          {copiedState === 'prompt' && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">Startprompt wurde kopiert.</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-color bg-white/80 dark:bg-slate-900/70 p-4 text-xs text-text-secondary">
          <span>Kostenlos, Open Source, Verbesserungsvorschläge willkommen.</span>
          <div className="flex items-center gap-3">
            <a href={ABI26_FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-sky-500">
              Feedback geben
            </a>
            <Link to="/curricula" className="hover:text-sky-500">
              Alle Curricula
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
